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
  ...['01-language-scope', '02-structure-shape', '03-block-after', '03-excerpt-lead', '03-layout-list', '03-qmd-elements', '04-paragraph-cases', '04-paragraph-opening', '05-sentence-brevity', '05-sentence-frame', '05-sentence-reference', '06-wording-cases', '08-appendix'].map((n) => `examples/${n}.md`),
  ...['authoring', 'basics', 'comments', 'coords', 'encoding', 'mermaid', 'prose', 'readability', 'refactor', 'render', 'terminal'].map((n) => `quarto/${n}.md`),
  ...['answering-disclosure.lua', 'checking-callouts.py', 'checking-dom.py', 'checking-links.py', 'checking-names.py', 'checking-output.py', 'checking-prose.py', 'testing-check-ascii-names.py', 'testing-content.py', 'verifying-content.py'].map((n) => `scripts/${n}`),
];

const theme = join(repo, 'skills', 'designing-theme');
const themeExpected = ['SKILL.md', 'scripts/checking-layout.py', 'scripts/measuring-pages.mjs', 'references/theme-system.md', 'knowledge/reading-surface.md'];

const gone = ['references', 'conventions', 'knowledge', 'writer-spine.md', 'writing-spine.md', 'task-routes.md', 'INDEX.md'];

for (const file of expected) {
  if (!existsSync(join(skill, file))) problems.push(`缺少 skills/writing-quarto/${file}`);
}
for (const file of themeExpected) {
  if (!existsSync(join(theme, file))) problems.push(`缺少 skills/designing-theme/${file}`);
}
for (const name of gone) {
  if (existsSync(join(skill, name))) problems.push(`旧路径仍在 skills/writing-quarto/${name}`);
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
const oldTrees = [/\bconventions\//, /\breferences\/zh\//, /\bknowledge\/cases\//, /\bkb_id\b/, /\bwriting-quarto[/\\](?:conventions|knowledge|references)\b/];
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
const own = /^(steps|examples|quarto|scripts|templates|docs|lib|locale)\//;
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
function headings(file) {
  const titles = new Set();
  let fence = false;
  for (const line of read(file).split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) { fence = !fence; continue; }
    if (fence) continue;
    const match = /^#{1,4}\s+(.+?)\s*#*\s*$/.exec(line);
    if (match) titles.add(match[1].trim());
  }
  return titles;
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

// 目录树注释只有「名词」与「名词：一句」两档，同一棵树不混用。
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
    const styles = new Set();
    for (const comment of block) {
      const colons = comment.split('：').length - 1;
      if (colons > 1) fail(file, `树注释有第二个冒号：${comment}`);
      if (/[。；]/.test(comment)) fail(file, `树注释不止一句：${comment}`);
      if (colons === 1 && comment.split('：')[1].trim() === '') fail(file, `树注释冒号后为空：${comment}`);
      styles.add(colons === 0 ? 'noun' : 'clause');
    }
    if (styles.size > 1) fail(file, `同一棵树混用了两档注释：${block.join(' / ')}`);
  }
}

// 目录 `#/`、文件 `#` 且右移 4 列：列错一位读者就看不出哪个是目录。
// 只查整棵树（README、docs）与案例里标成「改写」的围栏；「不佳」保留同一作对照。
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
      // 目录不带结尾斜杠，只能看后面还有没有更深的节点。
      let hasChild = false;
      for (const next of lines.slice(index + 1)) {
        if (!/[├└]──/.test(next)) continue;
        const nextDepth = (/^(?:│   |    )*/.exec(next)?.[0].length ?? 0) / 4;
        if (nextDepth <= depth) break;
        hasChild = true;
        break;
      }
      tree.push({ column, line, marker: marker[2], isDir: hasChild || marker[2] === '#/' });
    }
    const dirs = tree.filter((entry) => entry.isDir);
    const files = tree.filter((entry) => !entry.isDir);
    for (const entry of tree) {
      if (entry.isDir && entry.marker !== '#/') fail(file, `目录行注释缺 #/：${entry.line.trim()}`);
      if (!entry.isDir && entry.marker === '#/') fail(file, `文件行不应写 #/：${entry.line.trim()}`);
    }
    if (!dirs.length || !files.length) continue;
    const dirColumn = dirs[0].column;
    for (const entry of dirs.slice(1)) {
      if (entry.column !== dirColumn) fail(file, `目录行 #/ 没对齐：${entry.line.trim()}`);
    }
    for (const entry of files) {
      if (entry.column !== dirColumn + 4) fail(file, `文件行 # 未右移 4 列（目录在 ${dirColumn}，文件在 ${entry.column}）：${entry.line.trim()}`);
    }
  }
}

if (problems.length) {
  console.error(problems.join('\n'));
  console.error(`\n${problems.length} 处待修`);
  process.exit(1);
}
console.log(`checked ${watched.length} files; layout, paths and wording are clean`);
