// dsh-quarto-book 的 bundle 入口。
//
// 把包内两个技能注册成一个 bundle 作用域的技能 provider，并注册
// `quarto_render_check` 工具。provider 只读，只扫描 `skills/<name>/SKILL.md`；
// 每个技能目录作为 resourceBase，使相对引用、脚本和主题资源都从安装后的
// 包内解析。
//
// provider 还把自身限定在 Quarto Book 工作区：除非会话 cwd 位于一个
// `_quarto.yml` 声明了 `type: book` 的 git 检出内，`list()` 一律返回空。
// 普通检出（例如 C++ 项目）因此在技能目录里看不到这两个名字。
//
// rank 550 高于内置根（600），低于项目级 `.dsh/skills`（100）和
// `.agents/skills`（200），因此项目可以按名字覆盖这两个技能，而不必改动本包。
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { findBookRoot } from './workspace.js';
import { registerRenderCheckTool } from './tools/render-check.js';
export const name = 'dsh-quarto-book';
export const inject = ['skills', 'tools'];
const PROVIDER = 'dsh-quarto-book';
const RANK = 550;
const SKILL_NAME_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PACKAGE_ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const SKILLS_ROOT = path.join(PACKAGE_ROOT, 'skills');
/** 读取 SKILL.md 实际用到的几个键，只做最简单的 YAML frontmatter 解析。 */
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
    if (!(await findBookRoot(options.cwd)))
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
    // 候选可能在同一次会话中因目录切换而失效。仅在调用方传入 cwd 时重新检查；
    // 普通的 `get()` 仍对当前工作区里已经发现过的候选有效。
    if (options.cwd !== undefined && !(await findBookRoot(options.cwd)))
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
