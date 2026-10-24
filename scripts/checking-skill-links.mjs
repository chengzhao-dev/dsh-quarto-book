// 技能文件的自检：路径、旧布局残留、已收口的冲突句、标点与树注释的落点。
// 用法：node scripts/checking-skill-links.mjs
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname, resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const skill = join(repo, 'skills', 'writing-quarto');
const problems = [];
const fail = (file, message) => problems.push(`${relative(repo, file)}: ${message}`);

const expected = [
  'SKILL.md',
  ...['01-task', '02-structure', '03-blocks', '04-paragraphs', '05-sentences', '06-wording', '07-layout', '08-reread', '09-check'].map((n) => `steps/${n}.md`),
  ...['01-language-scope', '02-structure-shape', '03-block-after', '03-excerpt-lead', '03-qmd-elements', '04-paragraph-cases', '04-paragraph-opening', '05-sentence-brevity', '05-sentence-frame', '05-sentence-reference', '06-wording-cases', '07-layout-list', '08-appendix'].map((n) => `examples/${n}.md`),
  ...['authoring', 'basics', 'comments', 'coords', 'encoding', 'figures', 'mermaid', 'prose', 'readability', 'refactor', 'render', 'terminal'].map((n) => `quarto/${n}.md`),
  ...['book-journey', 'token-budget'].map((n) => `references/${n}.md`),
  ...['answering-disclosure.lua', 'checking-callouts.py', 'checking-dom.py', 'checking-links.py', 'checking-names.py', 'checking-output.py', 'checking-prose.py', 'testing-check-ascii-names.py', 'testing-content.py', 'verifying-content.py'].map((n) => `scripts/${n}`),
];

const theme = join(repo, 'skills', 'designing-theme');
const themeExpected = ['SKILL.md', 'scripts/checking-layout.py', 'scripts/measuring-pages.mjs', 'references/theme-system.md', 'knowledge/reading-surface.md'];

const gone = ['conventions', 'knowledge', 'writer-spine.md', 'writing-spine.md', 'task-routes.md', 'INDEX.md'];

for (const file of expected) {
  if (!existsSync(join(skill, file))) problems.push(`缺少 skills/writing-quarto/${file}`);
}
for (const file of themeExpected) {
  if (!existsSync(join(theme, file))) problems.push(`缺少 skills/designing-theme/${file}`);
}
for (const name of gone) {
  if (existsSync(join(skill, name))) problems.push(`旧路径仍在 skills/writing-quarto/${name}`);
}

// 技能目录里不留 Python 缓存：package.json 的 files 白名单把技能目录整棵带走，
// 缓存一旦留在工作树就会进本地 tarball，和 CI 从干净检出打出的包不一致。
function walkAll(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) walkAll(path, out);
    else out.push(path);
  }
  return out;
}
for (const root of [skill, theme, join(repo, 'templates')]) {
  for (const file of walkAll(root)) {
    if (file.includes(`${sep}__pycache__${sep}`) || file.endsWith('.pyc')) {
      fail(file, '技能目录不得包含 Python 缓存（__pycache__ / *.pyc）');
    }
  }
}

// 案例只能经由引用出现：examples 下每个文件至少被一个技能文件点名，否则加了也没人打开。
const skillMarkdown = walk(skill).filter((path) => path.endsWith('.md'));
for (const example of readdirSync(join(skill, 'examples'))) {
  if (!example.endsWith('.md')) continue;
  const needle = `examples/${example}`;
  if (!skillMarkdown.some((path) => readFileSync(path, 'utf8').includes(needle))) {
    fail(join(skill, 'examples', example), '案例没有被任何技能文件引用');
  }
}

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) walk(path, out);
    else if (/\.(md|py|lua|ps1)$/.test(path)) out.push(path);
  }
  return out;
}

// 装机脚本也读技能目录：它引用旧布局时同样会断，必须一起扫。
const watched = [...walk(skill), ...walk(join(repo, 'templates')), ...walk(join(repo, 'scripts')).filter((p) => p.endsWith('.ps1'))].filter((p) => !p.includes(`${join('scripts', 'diagrams')}`) || p.endsWith('.md'));

const conflicts = ['不另立第二套', '标记方式统一见', '全角冒号判失败', '注释是名词', '不用全角冒号挂解释'];
const oldTrees = [/\bconventions\//, /\breferences\/zh\//, /\bknowledge\/cases\//, /\bkb_id\b/, /\bwriting-quarto[/\\](?:conventions|knowledge)\b/];
// 检出的工作树可能是 CRLF（Windows + autocrlf），先归一化再解析，
// 否则行尾的 \r 会让注释匹配和标题匹配静默失配。
const read = (file) => readFileSync(file, 'utf8').split('\r\n').join('\n');


for (const file of watched) {
  const text = read(file);
  const rel = relative(skill, file).split(sep).join('/');

  for (const phrase of conflicts) {
    if (text.includes(phrase)) fail(file, `已收口的冲突句仍在：${phrase}`);
  }
  for (const pattern of oldTrees) {
    const hit = pattern.exec(text);
    if (!hit) continue;
    const line = text.slice(0, hit.index).split('\n').length;
    const lineText = text.split('\n')[line - 1] ?? '';
    if (lineText.includes('designing-theme/')) continue;
    fail(file, `旧布局路径仍在第 ${line} 行：${hit[0]}`);
  }
  // 条文只留一处：其他地方可以画树，但不许再写一套标记规则。
  if (rel !== 'steps/03-blocks.md' && /tree -a|目录注释以|文件注释以|标记方式统一见|目录用 `#\/`/.test(text)) {
    fail(file, '目录树的标记规则只允许写在 steps/03-blocks.md');
  }
  if (text.includes('引导词**：完整句') && rel !== 'steps/07-layout.md') {
    fail(file, '列表项格式只允许写在 steps/07-layout.md');
  }
}

// 反引号里指向技能或仓库的路径必须存在；书仓库自己的路径不在这里核对。
const own = /^(steps|examples|quarto|references|scripts|templates|docs|lib|locale)\//;
for (const file of watched) {
  if (!file.endsWith('.md')) continue;
  const text = read(file);
  for (const match of text.matchAll(/`([^`\n]+)`/g)) {
    const token = match[1].trim();
    if (!own.test(token) || /[\s*{}<>]/.test(token)) continue;
    if (!existsSync(resolve(skill, token)) && !existsSync(resolve(repo, token))) {
      fail(file, `路径不存在：${token}`);
    }
  }
}

// 「`steps/03-blocks.md`「情况：目录树」」这类引用，节名必须真在目标文件里。
// 路径能解析而节名不存在，读者打开文件找不到那句话，等于断链。
// 围栏按反引号长度配对：四反引号外层可包三反引号示例，标题扫描不能因此错位。
function scanHeadings(text) {
  const found = [];
  let fence = null;
  for (const [index, line] of text.split('\n').entries()) {
    const marker = /^\s*(`{3,}|~{3,})(.*)$/.exec(line);
    if (fence === null) {
      if (marker) { fence = marker[1]; continue; }
    } else {
      if (marker && marker[1][0] === fence[0] && marker[1].length >= fence.length && marker[2].trim() === '') fence = null;
      continue;
    }
    const match = /^(#{1,4})\s+(.*?)(?:\s+#+)?\s*$/.exec(line);
    if (match) found.push({ index, level: match[1], title: match[2].trim() });
  }
  return found;
}

function headings(file) {
  return new Set(scanHeadings(read(file)).map((heading) => heading.title));
}

const headingCache = new Map();
for (const file of watched) {
  if (!file.endsWith('.md')) continue;
  const text = read(file);
  // 节名本身可能带引号（如「结构助词「的」」），所以内层要允许一对嵌套引号。
  for (const match of text.matchAll(/`((?:steps|examples|quarto)\/[^`\s]+\.md|SKILL\.md)`「([^「」]*(?:「[^「」]*」[^「」]*)*)」/g)) {
    const [, target, section] = match;
    const targetFile = resolve(skill, target);
    if (!existsSync(targetFile)) continue;
    if (!headingCache.has(targetFile)) headingCache.set(targetFile, headings(targetFile));
    if (headingCache.get(targetFile).has(section)) continue;
    const line = text.slice(0, match.index).split('\n').length;
    fail(file, `第 ${line} 行引用的节名不存在：${target}「${section}」`);
  }
}

// 同一文件里的标题文字不得重复：重复的 H3 会生成重复锚点，目录与读者都分不清。
for (const file of watched) {
  if (!file.endsWith('.md')) continue;
  const seen = new Map();
  for (const heading of scanHeadings(read(file))) {
    if (!/^#{2,4}$/.test(heading.level)) continue;
    const key = `${heading.level} ${heading.title}`;
    if (seen.has(key)) fail(file, `第 ${heading.index + 1} 行标题重复：${key}`);
    else seen.set(key, heading.index + 1);
  }
}

// 每一步的文件名编号、H1 编号与 SKILL.md 的九步清单必须对齐：重排或复制步骤时最容易漏掉这里。
const stepSlugs = ['01-task', '02-structure', '03-blocks', '04-paragraphs', '05-sentences', '06-wording', '07-layout', '08-reread', '09-check'];
for (const [index, slug] of stepSlugs.entries()) {
  const file = join(skill, 'steps', `${slug}.md`);
  const heading = read(file).split(/\r?\n/).find((line) => line.startsWith('# ')) ?? '';
  const number = index + 1;
  if (!heading.startsWith(`# 第 ${number} 步`)) fail(file, `H1 应是「# 第 ${number} 步…」，实际是「${heading}」`);
}
const skillText = read(join(skill, 'SKILL.md'));
for (const slug of stepSlugs) {
  if (!skillText.includes(`steps/${slug}.md`)) fail(join(skill, 'SKILL.md'), `九步清单没点到 steps/${slug}.md`);
}

// 每个 step 的正文骨架固定：第 3 行「产出：…」，正文三节「通用情况」「情况」「正反例」各一次。
// 第 9 步多一节「完成判据」，允许；这里只约束三节不能缺、不能重复。
for (const slug of stepSlugs) {
  const file = join(skill, 'steps', `${slug}.md`);
  const lines = read(file).split('\n');
  if (!(lines[2] ?? '').startsWith('产出：')) fail(file, '第 3 行应以「产出：」开头');
  for (const section of ['## 通用情况', '## 情况', '## 正反例']) {
    const count = lines.filter((line) => line.trim() === section).length;
    if (count !== 1) fail(file, `应恰有一节「${section.slice(3)}」，实际 ${count} 节`);
  }
}

// 目录树每个节点一条注释，只做一件事：冒号最多一个，不写第二句；整条只有类别词时不合格。
function treeBlocks(text) {
  const blocks = [];
  let current = null;
  let fence = false;
  for (const line of text.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) {
      if (current) { blocks.push(current); current = null; }
      fence = !fence;
      continue;
    }
    if (!fence) continue;
    if (/[├└]──/.test(line)) {
      current ??= [];
      const comment = /(?:#\/|\s#)\s?(.*)$/.exec(line);
      if (comment) current.push(comment[1].trim());
    } else if (current) {
      blocks.push(current);
      current = null;
    }
  }
  if (current) blocks.push(current);
  return blocks;
}

for (const file of [join(repo, 'README.md'), join(repo, 'README.en.md'), ...walk(join(repo, 'docs')).filter((p) => p.endsWith('.md'))]) {
  const text = read(file);
  for (const block of treeBlocks(text)) {
    for (const comment of block) {
      const colons = comment.split('：').length - 1;
      if (colons > 1) fail(file, `树注释有第二个冒号：${comment}`);
      if (/[。；]/.test(comment)) fail(file, `树注释不止一句：${comment}`);
      if (colons === 1 && comment.split('：')[1].trim() === '') fail(file, `树注释冒号后为空：${comment}`);
      if (/^(头文件|实现|源码|测试|构建脚本|配置文件)$/.test(comment)) fail(file, `树注释只写类别词：${comment}`);
    }
  }
}

// 目录 `#/` 在 D 列，文件 `#` 在 D+1 列（落在 `/` 下方），两种注释文字在 D+3 列。
// 注释只列 1–2 项；多一个「、」或「与」就说明在罗列，不是一条路标。
// 只查整棵树（README、docs）与案例里标成「改写」的围栏；「不佳」保留同一作对照。
function displayWidth(text) {
  let width = 0;
  for (const char of text) width += /[\u3000-\u303f\u4e00-\u9fff\uff00-\uffef]/.test(char) ? 2 : 1;
  return width;
}
function columnFences(file, text) {
  const fences = [];
  let current = null;
  let fence = false;
  let first = '';
  for (const line of text.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) {
      if (fence) { fences.push({ first, lines: current ?? [] }); current = null; }
      fence = !fence;
      first = '';
      continue;
    }
    if (!fence) continue;
    if (!first && line.trim()) first = line.trim();
    current ??= [];
    current.push(line);
  }
  return fences
    .filter(({ lines }) => lines.some((line) => /[├└]──/.test(line)))
    .filter(({ first }) => {
      if (file.startsWith(join(repo, 'skills'))) return first.startsWith('改写（');
      return true;
    });
}

for (const file of [
  join(repo, 'README.md'),
  join(repo, 'README.en.md'),
  ...walk(join(repo, 'docs')).filter((p) => p.endsWith('.md')),
  ...walk(join(skill, 'examples')),
]) {
  for (const { lines } of columnFences(file, read(file))) {
    const tree = [];
    for (const [index, line] of lines.entries()) {
      if (!/[├└]──/.test(line)) continue;
      const depth = (/^(?:│   |    )*/.exec(line)?.[0].length ?? 0) / 4;
      const marker = /( +)(#\/?) /.exec(line);
      if (!marker) { fail(file, `树行没有行尾注释：${line.trim()}`); continue; }
      const column = marker.index + marker[1].length;
      const prefix = line.slice(0, column);
      if (displayWidth(prefix) - displayWidth(prefix.trimEnd()) < 4) {
        fail(file, `节点与注释之间至少留四个空格：${line.trim()}`);
      }
      const afterMarker = line.slice(column + marker[2].length);
      if (!afterMarker.startsWith(' ') || (afterMarker.length > 1 && afterMarker[1] === ' ')) {
        fail(file, `标记后只留一个空格：${line.trim()}`);
      }
      const comment = afterMarker.trim();
      const separators = (comment.match(/、/g)?.length ?? 0)
        + (comment.match(/(?<!参)与/g)?.length ?? 0);
      if (separators > 1) fail(file, `树注释列了 ${separators + 1} 项，只留 1 到 2 项：${comment}`);
      // 目录不带结尾斜杠，只能看后面还有没有更深的节点。
      let hasChild = false;
      for (const next of lines.slice(index + 1)) {
        if (!/[├└]──/.test(next)) continue;
        const nextDepth = (/^(?:│   |    )*/.exec(next)?.[0].length ?? 0) / 4;
        if (nextDepth <= depth) break;
        hasChild = true;
        break;
      }
      tree.push({ column, line, marker: marker[2], comment, isDir: hasChild || marker[2] === '#/', textColumn: column + marker[2].length + afterMarker.length - afterMarker.trimStart().length });
    }
    for (const entry of tree) {
      if (!entry.isDir) continue;
      if (/[：:]/.test(entry.comment)) fail(file, `目录注释只写这里装什么，不加冒号：${entry.comment}`);
      if (entry.comment.includes('、')) fail(file, `目录注释不列清单，用名词短语：${entry.comment}`);
      if (displayWidth(entry.comment) > 16) fail(file, `目录注释超过 16 列，只留名词短语：${entry.comment}`);
    }
    const dirs = tree.filter((entry) => entry.isDir);
    const files = tree.filter((entry) => !entry.isDir);
    for (const entry of tree) {
      if (entry.isDir && entry.marker !== '#/') fail(file, `目录行注释缺 #/：${entry.line.trim()}`);
      if (!entry.isDir && entry.marker === '#/') fail(file, `文件行不应写 #/：${entry.line.trim()}`);
      if (entry.isDir && !entry.line.slice(0, entry.line.indexOf('#')).trimEnd().endsWith('/')) fail(file, `目录名应以 / 结尾：${entry.line.trim()}`);
    }
    if (dirs.length) {
      const dirColumn = dirs[0].column;
      for (const entry of dirs.slice(1)) {
        if (entry.column !== dirColumn) fail(file, `目录行 #/ 没对齐：${entry.line.trim()}`);
      }
      for (const entry of files) {
        if (entry.column !== dirColumn + 1) fail(file, `文件行 # 应比目录 # 右移一列（目录在 ${dirColumn}，文件在 ${entry.column}）：${entry.line.trim()}`);
      }
    } else {
      const fileColumn = files[0].column;
      for (const entry of files.slice(1)) {
        if (entry.column !== fileColumn) fail(file, `文件行 # 没对齐：${entry.line.trim()}`);
      }
    }
    const textColumn = tree[0].textColumn;
    for (const entry of tree.slice(1)) {
      if (entry.textColumn !== textColumn) {
        fail(file, `注释文字未对齐（应在 ${textColumn} 列）：${entry.line.trim()}`);
        break;
      }
    }
  }
}

if (problems.length) {
  console.error(problems.join('\n'));
  console.error(`\n${problems.length} 处待修`);
  process.exit(1);
}
console.log(`checked ${watched.length} files; layout, paths and wording are clean`);
