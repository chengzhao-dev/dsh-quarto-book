// dsh-quarto-book bundle entry.
//
// Registers the two packaged skills as one bundle-scoped skill provider and the
// `quarto_render_check` tool. The provider is read-only and scans only
// `skills/<name>/SKILL.md`; each skill directory becomes the resourceBase so
// relative references, scripts and theme assets resolve from the installed
// package.
//
// The provider also scopes itself to Quarto Book workspaces: `list()` returns
// nothing unless the session cwd sits inside a git checkout whose
// `_quarto.yml` declares `type: book`. A normal C++ checkout therefore never
// sees these two names in its catalog.
//
// Rank 550 sits above the bundled root (600) but below project `.dsh/skills`
// (100) and `.agents/skills` (200), so a project can override either skill by
// name without editing the package.
import { access, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { registerRenderCheckTool } from './tools/render-check.js';
export const name = 'dsh-quarto-book';
export const inject = ['skills', 'tools'];
const PROVIDER = 'dsh-quarto-book';
const RANK = 550;
const SKILL_NAME_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PACKAGE_ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const SKILLS_ROOT = path.join(PACKAGE_ROOT, 'skills');
const MAX_ASCENT = 64;
// `type: book` must stand on its own line; a commented-out sample does not
// count, so only the first non-space character of the line is inspected.
const BOOK_PROJECT_RE = /^(?![\t ]*#)[\t ]*type:[\t ]*['"]?book['"]?[\t ]*$/m;
async function exists(target) {
    try {
        await access(target);
        return true;
    }
    catch {
        return false;
    }
}
async function declaresBookProject(dir) {
    let source;
    try {
        source = await readFile(path.join(dir, '_quarto.yml'), 'utf8');
    }
    catch {
        return false;
    }
    return BOOK_PROJECT_RE.test(source);
}
// Walk up from the session cwd to the enclosing git root, checking each
// ancestor for a Quarto Book project file. Without a cwd, or outside any git
// checkout, the answer is no: profile installation alone must not expose the
// skills, and an unrelated `_quarto.yml` above the workspace is not evidence.
async function isQuartoBookWorkspace(cwd) {
    if (typeof cwd !== 'string' || cwd.trim() === '')
        return false;
    let start;
    try {
        start = path.resolve(cwd);
    }
    catch {
        return false;
    }
    let gitRoot;
    let cursor = start;
    for (let depth = 0; depth < MAX_ASCENT; depth += 1) {
        if (await exists(path.join(cursor, '.git'))) {
            gitRoot = cursor;
            break;
        }
        const parent = path.dirname(cursor);
        if (parent === cursor)
            break;
        cursor = parent;
    }
    if (!gitRoot)
        return false;
    cursor = start;
    for (let depth = 0; depth < MAX_ASCENT; depth += 1) {
        if (await declaresBookProject(cursor))
            return true;
        if (cursor === gitRoot)
            return false;
        const parent = path.dirname(cursor);
        if (parent === cursor)
            return false;
        cursor = parent;
    }
    return false;
}
/** Minimal YAML frontmatter reader for the keys SKILL.md actually uses. */
function parseFrontmatter(source) {
    const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(source);
    if (!match)
        return { data: {}, body: source };
    const data = {};
    const stack = [{ indent: -1, target: data }];
    for (const rawLine of match[1].split(/\r?\n/)) {
        const line = rawLine.replace(/\t/g, '  ');
        if (!line.trim() || line.trimStart().startsWith('#'))
            continue;
        const indent = line.length - line.trimStart().length;
        const pair = /^([A-Za-z0-9_.-]+):(?:\s*(.*))?$/.exec(line.trim());
        if (!pair)
            continue;
        while (stack.length > 1 && indent <= stack[stack.length - 1].indent)
            stack.pop();
        const parent = stack[stack.length - 1].target;
        const key = pair[1];
        const value = (pair[2] ?? '').trim();
        if (value === '') {
            const child = {};
            parent[key] = child;
            stack.push({ indent, target: child });
            continue;
        }
        parent[key] = parseScalar(value);
    }
    return { data, body: source.slice(match[0].length) };
}
function parseScalar(value) {
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
        const quote = value[0];
        const inner = value.slice(1, -1);
        return quote === '"'
            ? inner.replace(/\\"/g, '"').replace(/\\n/g, '\n')
            : inner.replace(/''/g, "'");
    }
    if (value === 'true')
        return true;
    if (value === 'false')
        return false;
    if (value === 'null' || value === '~')
        return null;
    if (/^\[.*\]$/.test(value)) {
        return value
            .slice(1, -1)
            .split(',')
            .map((item) => parseScalar(item.trim()))
            .filter((item) => item !== '');
    }
    return value;
}
async function readCandidate(skillDir) {
    const skillFile = path.join(skillDir, 'SKILL.md');
    let source;
    try {
        source = await readFile(skillFile, 'utf8');
    }
    catch {
        return undefined;
    }
    const { data } = parseFrontmatter(source);
    if (typeof data.name !== 'string' || !SKILL_NAME_RE.test(data.name))
        return undefined;
    if (typeof data.description !== 'string' || data.description.trim() === '')
        return undefined;
    if (data.name !== path.basename(skillDir))
        return undefined;
    const candidate = {
        name: data.name,
        description: data.description.trim(),
        invocation: { modelInvocable: true, userInvocable: true },
        source: 'bundled',
        provider: PROVIDER,
        rank: RANK,
        locator: skillDir,
        resourceBase: { kind: 'directory', path: skillDir },
        path: skillFile,
    };
    if (typeof data.whenToUse === 'string' && data.whenToUse.trim()) {
        candidate.whenToUse = data.whenToUse.trim();
    }
    if (data.metadata && typeof data.metadata === 'object' && !Array.isArray(data.metadata)) {
        candidate.metadata = data.metadata;
    }
    return candidate;
}
async function listSkills(options = {}) {
    if (options.signal?.aborted)
        return [];
    if (!(await isQuartoBookWorkspace(options.cwd)))
        return [];
    if (options.signal?.aborted)
        return [];
    let entries;
    try {
        entries = await readdir(SKILLS_ROOT, { withFileTypes: true });
    }
    catch {
        return [];
    }
    const candidates = [];
    for (const entry of entries) {
        if (!entry.isDirectory())
            continue;
        if (options.signal?.aborted)
            return [];
        const candidate = await readCandidate(path.join(SKILLS_ROOT, entry.name));
        if (candidate)
            candidates.push(candidate);
    }
    candidates.sort((a, b) => a.name.localeCompare(b.name));
    return candidates;
}
async function getSkill(candidate, options = {}) {
    if (options.signal?.aborted)
        return undefined;
    if (!candidate || candidate.provider !== PROVIDER)
        return undefined;
    const skillDir = candidate.locator;
    if (typeof skillDir !== 'string')
        return undefined;
    const resolved = path.resolve(skillDir);
    if (resolved !== SKILLS_ROOT && !resolved.startsWith(SKILLS_ROOT + path.sep))
        return undefined;
    let source;
    try {
        source = await readFile(path.join(resolved, 'SKILL.md'), 'utf8');
    }
    catch {
        return undefined;
    }
    const { data, body } = parseFrontmatter(source);
    if (data.name !== candidate.name)
        return undefined;
    return {
        name: candidate.name,
        description: candidate.description,
        ...(candidate.whenToUse ? { whenToUse: candidate.whenToUse } : {}),
        invocation: candidate.invocation,
        source: candidate.source,
        provider: PROVIDER,
        resourceBase: { kind: 'directory', path: resolved },
        path: path.join(resolved, 'SKILL.md'),
        ...(candidate.metadata ? { metadata: candidate.metadata } : {}),
        content: body.trim(),
    };
}
export function apply(ctx) {
    ctx.skills.registerProvider(() => ({
        name: PROVIDER,
        list: listSkills,
        get: getSkill,
    }));
    if (ctx.tools && typeof ctx.tools.register === 'function') {
        registerRenderCheckTool(ctx.tools);
    }
}
