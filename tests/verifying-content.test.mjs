import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const script = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'skills',
  'writing-quarto',
  'scripts',
  'verifying-content.py',
)

function findPython() {
  for (const candidate of ['python3', 'python']) {
    if (spawnSync(candidate, ['--version'], { stdio: 'ignore' }).status === 0) return candidate
  }
  return ''
}

const python = findPython()

test('目录中的 part 落地页按章节检查', { skip: python ? false : '没有可用的 Python' }, async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'quarto-verify-'))
  try {
    await mkdir(path.join(root, 'game'))
    await writeFile(
      path.join(root, '_quarto.yml'),
      ['project:', '  type: book', 'chapters:', '  - part: game/index.qmd', '    chapters:', '      - game/01.qmd'].join('\n') + '\n',
      'utf8',
    )
    await writeFile(path.join(root, 'game', 'index.qmd'), '---\ntitle: "游戏"\n---\n\n导览。\n', 'utf8')
    await writeFile(path.join(root, 'game', '01.qmd'), '---\ntitle: "第一章"\n---\n\n正文。\n', 'utf8')
    const output = execFileSync(python, [script, '--root', root], { encoding: 'utf8' })
    assert.match(output, /章节：2 个/)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('围栏外拦住技能腔与混段，列表项不按混段计', { skip: python ? false : '没有可用的 Python' }, async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'quarto-verify-'))
  try {
    await writeFile(
      path.join(root, '_quarto.yml'),
      ['project:', '  type: book', 'chapters:', '  - 01.qmd'].join('\n') + '\n',
      'utf8',
    )
    await writeFile(
      path.join(root, '01.qmd'),
      [
        '---',
        'title: "第一章"',
        '---',
        '',
        '`GetCellType`、`IsCellEmpty`、`IsInRange` 都读棋盘，`PlaceCell` 写入；终端打印棋盘和测试断言都用它们。',
        '',
        '- `GetCellType`、`IsCellEmpty`、`IsInRange` 都读棋盘。',
        '',
        '`GetCellType` 越界时抛出 `std::out_of_range`。这里不定义自己的异常类型，调用方直接接住。',
        '',
      ].join('\n'),
      'utf8',
    )
    const result = spawnSync(python, [script, '--root', root], { encoding: 'utf8' })
    const output = `${result.stdout}${result.stderr}`
    assert.equal(result.status, 1)
    assert.match(output, /技能腔/)
    assert.match(output, /一段里出现 4 个函数名/)
    assert.equal((output.match(/一段里出现/g) ?? []).length, 1)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('章首不放 Callout，也不以「本章将」开场；着陆页豁免', { skip: python ? false : '没有可用的 Python' }, async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'quarto-verify-'))
  try {
    await writeFile(
      path.join(root, '_quarto.yml'),
      ['project:', '  type: book', 'chapters:', '  - index.qmd', '  - 01.qmd'].join(String.fromCharCode(10)) + String.fromCharCode(10),
      'utf8',
    )
    await writeFile(
      path.join(root, 'index.qmd'),
      ['---', 'title: "首页"', '---', '', '::: {.callout-note}', '目录页的旁注。', ':::', '', '## 当前游戏', '', '正文。', ''].join(String.fromCharCode(10)),
      'utf8',
    )
    await writeFile(
      path.join(root, '01.qmd'),
      ['---', 'title: "第一章"', '---', '', '本章将介绍棋盘。', '', '::: {.callout-note}', '旁注。', ':::', '', '## 棋盘', '', '正文。', ''].join(String.fromCharCode(10)),
      'utf8',
    )
    const result = spawnSync(python, [script, '--root', root], { encoding: 'utf8' })
    const output = `${result.stdout}${result.stderr}`
    assert.equal(result.status, 1)
    assert.match(output, /章首出现 Callout/)
    assert.match(output, /引言以「本章将/)
    assert.equal((output.match(/章首出现 Callout/g) ?? []).length, 1)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('项目用 lead_chars 声明后按字数检查导语，着陆页豁免', { skip: python ? false : '没有可用的 Python' }, async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'quarto-verify-'))
  try {
    const nl = String.fromCharCode(10)
    const skillDir = path.join(root, '.agents', 'skills', 'quarto-book-project')
    await mkdir(skillDir, { recursive: true })
    await writeFile(path.join(skillDir, 'SKILL.md'), '# 项目规则' + nl, 'utf8')
    await writeFile(path.join(skillDir, 'checks.json'), JSON.stringify({ lead_chars: [60, 140] }) + nl, 'utf8')
    await writeFile(
      path.join(root, '_quarto.yml'),
      ['project:', '  type: book', 'chapters:', '  - index.qmd', '  - 01.qmd', '  - 02.qmd'].join(nl) + nl,
      'utf8',
    )
    await writeFile(
      path.join(root, 'index.qmd'),
      ['---', 'title: "首页"', 'body-classes: index-page', '---', '', '太短。', '', '## 目录', '', '正文。', ''].join(nl),
      'utf8',
    )
    await writeFile(
      path.join(root, '01.qmd'),
      ['---', 'title: "短导语"', '---', '', '太短。', '', '## 正文', '', '正文。', ''].join(nl),
      'utf8',
    )
    const long = '这一句写到三百二十字以内的上限，用来确认导语超长时检查器会报出来。'.repeat(5)
    await writeFile(
      path.join(root, '02.qmd'),
      ['---', 'title: "长导语"', '---', '', long, '', '## 正文', '', '正文。', ''].join(nl),
      'utf8',
    )
    const result = spawnSync(python, [script, '--root', root], { encoding: 'utf8' })
    const output = `${result.stdout}${result.stderr}`
    assert.equal(result.status, 1)
    assert.match(output, /导语 3 字符，短于 60/)
    assert.match(output, /导语 \d+ 字符，超过 140/)
    assert.equal((output.match(/导语 /g) ?? []).length, 2)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('整仓扫描跳过 temp 与 build-* 生成目录', { skip: python ? false : '没有可用的 Python' }, async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'quarto-verify-'))
  try {
    const nl = String.fromCharCode(10)
    await mkdir(path.join(root, 'temp'), { recursive: true })
    await mkdir(path.join(root, 'build-release', 'chapters'), { recursive: true })
    await writeFile(
      path.join(root, '_quarto.yml'),
      ['project:', '  type: book', 'chapters:', '  - 01.qmd'].join(nl) + nl,
      'utf8',
    )
    await writeFile(
      path.join(root, '01.qmd'),
      ['---', 'title: "第一章"', '---', '', '正文。', '', '## 小节', '', '正文。', ''].join(nl),
      'utf8',
    )
    await writeFile(
      path.join(root, 'temp', 'probe.qmd'),
      ['---', 'title: "试验稿"', '---', '', '太短。', ''].join(nl),
      'utf8',
    )
    await writeFile(
      path.join(root, 'build-release', 'chapters', 'stale.qmd'),
      ['---', 'title: "构建产物"', '---', '', '太短。', ''].join(nl),
      'utf8',
    )
    const output = execFileSync(python, [script, '--root', root], { encoding: 'utf8' })
    assert.doesNotMatch(output, /probe|stale|导语/)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('mermaid 图必须带角色与无障碍名称', { skip: python ? false : '没有可用的 Python' }, async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'quarto-verify-'))
  try {
    const nl = String.fromCharCode(10)
    await writeFile(
      path.join(root, '_quarto.yml'),
      ['project:', '  type: book', 'chapters:', '  - 01.qmd', '  - 02.qmd'].join(nl) + nl,
      'utf8',
    )
    await writeFile(
      path.join(root, '01.qmd'),
      ['---', 'title: "无名称"', '---', '', '正文。', '', '```{.mermaid}', 'flowchart LR', '  A --> B', '```', ''].join(nl),
      'utf8',
    )
    await writeFile(
      path.join(root, '02.qmd'),
      ['---', 'title: "有名称"', '---', '', '正文。', '', '```{.mermaid role="img" aria-label="调用链：A 调用 B。"}', 'flowchart LR', '  A --> B', '```', ''].join(nl),
      'utf8',
    )
    const result = spawnSync(python, [script, '--root', root], { encoding: 'utf8' })
    const output = `${result.stdout}${result.stderr}`
    assert.equal(result.status, 1)
    assert.match(output, /mermaid 图缺少无障碍名称/)
    assert.equal((output.match(/mermaid 图缺少无障碍名称/g) ?? []).length, 1)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('只有声明围栏时正文不能讲实现', { skip: python ? false : '没有可用的 Python' }, async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'quarto-verify-'))
  try {
    const nl = String.fromCharCode(10)
    await writeFile(
      path.join(root, '_quarto.yml'),
      ['project:', '  type: book', 'chapters:', '  - 01.qmd', '  - 02.qmd'].join(nl) + nl,
      'utf8',
    )
    await writeFile(
      path.join(root, '01.qmd'),
      [
        '---',
        'title: "讲实现"',
        '---',
        '',
        '## 赢家判断',
        '',
        '```{.cpp filename="board.h"}',
        'bool IsWin() const;',
        '```',
        '',
        '`IsWin` 复用 `GetWinner` 的结果。',
        '',
      ].join(nl),
      'utf8',
    )
    await writeFile(
      path.join(root, '02.qmd'),
      [
        '---',
        'title: "讲契约"',
        '---',
        '',
        '## 赢家判断',
        '',
        '```{.cpp filename="board.h"}',
        'bool IsWin() const;',
        '```',
        '',
        '`IsWin` 回答这一问：当前棋盘上有没有赢家。调用方不需要知道它怎么找。',
        '',
      ].join(nl),
      'utf8',
    )
    const result = spawnSync(python, [script, '--root', root], { encoding: 'utf8' })
    const output = `${result.stdout}${result.stderr}`
    assert.equal(result.status, 1)
    assert.match(output, /只有声明围栏，正文却讲实现/)
    assert.equal((output.match(/只有声明围栏，正文却讲实现/g) ?? []).length, 1)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
