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
  ...['authoring', 'basics', 'coords', 'mermaid', 'refactor', 'render', 'terminal'].map((n) => `quarto/${n}.md`),
  'scripts/verifying-content.py',
];

const gone = ['references', 'conventions', 'knowledge', 'writer-spine.md', 'writing-spine.md', 'task-routes.md', 'INDEX.md'];

for (const file of expected) {
  if (!existsSync(join(skill, file))) problems.push(`缺少 skills/writing-quarto/${file}`);
}
for (const name of gone) {
  if (existsSync(join(skill, name))) problems.push(`旧路径仍在 skills/writing-quarto/${name}`);
}

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) walk(path, out);
    else if (/\.(md|py|lua)$/.test(path)) out.push(path);
  }
  return out;
}

const watched = [...walk(skill), ...walk(join(repo, 'templates'))].filter((p) => !p.includes(`${join('scripts', 'diagrams')}`) || p.endsWith('.md'));

const conflicts = ['不另立第二套', '标记方式统一见', '全角冒号判失败', '注释是名词', '不用全角冒号挂解释'];
const oldTrees = [/\bconventions\//, /\breferences\/zh\//, /\bknowledge\/cases\//, /\bkb_id\b/];

for (const file of watched) {
  const text = readFileSync(file, 'utf8');
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
  if (/tree -a|#\/ /.test(text) && rel !== 'steps/03-blocks.md') {
    fail(file, '目录树的标记只允许写在 steps/03-blocks.md');
  }
  if (text.includes('引导词**：完整句') && rel !== 'steps/07-layout.md') {
    fail(file, '列表项格式只允许写在 steps/07-layout.md');
  }
}

// 反引号里指向技能或仓库的路径必须存在；书仓库自己的路径不在这里核对。
const own = /^(steps|examples|quarto|scripts|templates|docs|lib|locale)\//;
for (const file of watched) {
  if (!file.endsWith('.md')) continue;
  const text = readFileSync(file, 'utf8');
  for (const match of text.matchAll(/`([^`\n]+)`/g)) {
    const token = match[1].trim();
    if (!own.test(token) || /[\s*{}<>]/.test(token)) continue;
    if (!existsSync(resolve(skill, token)) && !existsSync(resolve(repo, token))) {
      fail(file, `路径不存在：${token}`);
    }
  }
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
  const text = readFileSync(file, 'utf8');
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

if (problems.length) {
  console.error(problems.join('\n'));
  console.error(`\n${problems.length} 处待修`);
  process.exit(1);
}
console.log(`checked ${watched.length} files; layout, paths and wording are clean`);
