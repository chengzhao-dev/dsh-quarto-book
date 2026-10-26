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
