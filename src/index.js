// dsh-quarto-book: host plugin entry.
//
// Contributions:
//   * `quarto_book_audit` — read-only inspection of a Quarto book.
//   * bundled `quarto-book` skill — the authoring/reordering workflow.
//
// Both are additive; no official DSH row is touched.

import { readFileSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { auditBook, resolveBookRoot } from './audit.js'

/** Cordis plugin identity. */
export const name = 'dsh-quarto-book'
/** Services required by this plugin. */
export const inject = ['tools', 'skills']

const PROVIDER = 'dsh-quarto-book'
const SKILL_NAME = 'quarto-book'
const SKILL_RANK = 600
const SKILL_ROOT = fileURLToPath(new URL('../assets/skills/quarto-book/', import.meta.url))
const SKILL_FILE = join(SKILL_ROOT, 'SKILL.md')

const AUDIT_DESCRIPTION = [
  'Audit a Quarto book without rendering or executing it: read `_quarto.yml`, list its ordered chapters and parts,',
  'scan every chapter\'s headings, and report missing chapters, skipped heading levels, empty sections, duplicate',
  'headings, relative-position titles (“上一节/下一节”), hand-written numbering and config problems.',
  'Read-only. Use after reordering headings or wiring chapters, before `quarto render`.',
].join(' ')

const AUDIT_PARAMETERS = {
  type: 'object',
  additionalProperties: false,
  properties: {
    root: {
      type: 'string',
      description: 'Book root containing `_quarto.yml`; relative paths resolve against the session working directory. Defaults to the session working directory.',
    },
    includeUnlisted: {
      type: 'boolean',
      description: 'Also list qmd files on disk that are absent from book.chapters. Defaults to false.',
    },
    maxIssues: {
      type: 'integer',
      minimum: 1,
      maximum: 500,
      description: 'Maximum number of reported issues (default 200).',
    },
  },
}

const AUDIT_OUTPUT = {
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      json: { type: 'string' },
      markdown: { type: 'string' },
    },
    required: ['json', 'markdown'],
  },
  render: (_args, value) => [{ type: 'text', text: value.markdown || value.json }],
}

function skillDescription() {
  try {
    const raw = readFileSync(SKILL_FILE, 'utf8')
    const match = /^description:\s*(.+)$/m.exec(raw)
    if (match !== null) return match[1].replace(/^["']|["']$/g, '').trim()
  } catch {
    // A missing asset fails the provider's get(); keep the catalog entry honest.
  }
  return 'Quarto book authoring and heading-reordering workflow for DSH.'
}

function createSkillProvider() {
  const description = skillDescription()
  const candidate = {
    name: SKILL_NAME,
    description,
    invocation: { modelInvocable: true, userInvocable: true },
    provider: PROVIDER,
    source: 'bundled',
    rank: SKILL_RANK,
    locator: SKILL_FILE,
    resourceBase: { kind: 'directory', path: SKILL_ROOT },
  }

  return {
    name: PROVIDER,
    list: async () => [candidate],
    async get(entry, options) {
      if (entry?.name !== SKILL_NAME) return undefined
      const raw = await readFile(entry.locator ?? SKILL_FILE, { encoding: 'utf8', signal: options?.signal })
      const frontmatter = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/.exec(raw)
      if (frontmatter === null) throw new Error(`${SKILL_FILE} has no YAML frontmatter`)
      return {
        name: candidate.name,
        description: candidate.description,
        invocation: candidate.invocation,
        provider: candidate.provider,
        source: candidate.source,
        resourceBase: candidate.resourceBase,
        content: raw.slice(frontmatter[0].length).trim(),
      }
    },
  }
}

function sessionCwd(exec) {
  const candidates = [
    exec?.cwd,
    exec?.agent?.session?.header?.cwd,
    exec?.agent?.cwd,
    exec?.session?.header?.cwd,
  ]
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.length > 0) return candidate
  }
  return process.cwd()
}

/**
 * Register the audit tool and the packaged skill.
 * @param {object} ctx Cordis context carrying `tools` and `skills`.
 * @param {object} [config]
 */
export function apply(ctx, config = {}) {
  const defaultMaxIssues = Number.isInteger(config?.maxIssues) ? Math.max(1, Math.min(500, config.maxIssues)) : 200

  ctx.tools.register({
    name: 'quarto_book_audit',
    description: AUDIT_DESCRIPTION,
    parameters: AUDIT_PARAMETERS,
    output: AUDIT_OUTPUT,
    async execute(args = {}, exec) {
      const root = resolveBookRoot(args.root, sessionCwd(exec))
      const result = await auditBook({
        root,
        includeUnlisted: args.includeUnlisted === true,
        maxIssues: args.maxIssues ?? defaultMaxIssues,
      })
      return { json: JSON.stringify(result), markdown: result.markdown }
    },
  })

  const provider = createSkillProvider()
  if (typeof ctx.effect === 'function') {
    ctx.effect(() => ctx.skills.registerProvider(() => provider), 'quarto-book bundled skill provider')
  } else {
    ctx.skills.registerProvider(() => provider)
  }
}
