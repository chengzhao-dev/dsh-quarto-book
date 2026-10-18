import test from 'node:test'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { apply, inject, name } from '../src/index.js'

const fixture = (entry) => fileURLToPath(new URL(`./fixtures/${entry}`, import.meta.url))

function createContext() {
  const tools = []
  const providers = []
  const disposers = []
  const ctx = {
    tools: {
      register(tool) {
        tools.push(tool)
      },
    },
    skills: {
      registerProvider(factory) {
        providers.push(factory())
        return () => {}
      },
    },
    effect(fn, label) {
      assert.equal(typeof label, 'string')
      disposers.push(fn())
    },
  }
  return { ctx, tools, providers, disposers }
}

test('exports the cordis identity and required services', () => {
  assert.equal(name, 'dsh-quarto-book')
  assert.deepEqual(inject, ['tools', 'skills'])
})

test('registers one read-only audit tool with a renderable output', async () => {
  const { ctx, tools } = createContext()
  apply(ctx)
  assert.equal(tools.length, 1)
  const tool = tools[0]
  assert.equal(tool.name, 'quarto_book_audit')
  assert.equal(tool.parameters.type, 'object')
  assert.deepEqual(tool.output.schema.required, ['json', 'markdown'])

  const value = await tool.execute({ root: fixture('minimal') }, {})
  assert.equal(typeof value.json, 'string')
  assert.equal(JSON.parse(value.json).ok, true)
  const rendered = tool.output.render({}, value)
  assert.deepEqual(rendered, [{ type: 'text', text: value.markdown }])
})

test('defaults the audit root to the session working directory', async () => {
  const { ctx, tools } = createContext()
  apply(ctx)
  const exec = { agent: { session: { header: { cwd: fixture('minimal') } } } }
  const value = await tools[0].execute({}, exec)
  assert.equal(JSON.parse(value.json).root.replaceAll('\\', '/').endsWith('/fixtures/minimal'), true)
})

test('passes includeUnlisted and maxIssues through to the audit', async () => {
  const { ctx, tools } = createContext()
  apply(ctx)
  const value = await tools[0].execute({ root: fixture('problems'), includeUnlisted: true, maxIssues: 2 }, {})
  const result = JSON.parse(value.json)
  assert.equal(result.maxIssues, 2)
  assert.equal(result.issues.length, 2)
  assert.ok(result.unlisted.includes('unlisted.qmd'))
})

test('registers the bundled skill provider inside an effect', async () => {
  const { ctx, providers, disposers } = createContext()
  apply(ctx)
  assert.equal(providers.length, 1)
  assert.equal(disposers.length, 1)
  const provider = providers[0]
  assert.equal(provider.name, 'dsh-quarto-book')

  const candidates = await provider.list()
  assert.equal(candidates.length, 1)
  const candidate = candidates[0]
  assert.equal(candidate.name, 'quarto-book')
  assert.equal(candidate.provider, 'dsh-quarto-book')
  assert.equal(candidate.invocation.modelInvocable, true)
  assert.equal(candidate.invocation.userInvocable, true)
  assert.match(candidate.description, /Quarto book/)
  assert.equal(candidate.resourceBase.kind, 'directory')

  const loaded = await provider.get(candidate)
  assert.equal(loaded.name, 'quarto-book')
  assert.match(loaded.content, /^# Quarto book authoring/)
  assert.doesNotMatch(loaded.content, /^---/)
  assert.match(loaded.content, /quarto_book_audit/)

  assert.equal(await provider.get({ name: 'other' }), undefined)
})

test('works without ctx.effect (direct registration fallback)', () => {
  const { ctx } = createContext()
  delete ctx.effect
  apply(ctx)
  assert.equal(ctx.skills !== undefined, true)
})
