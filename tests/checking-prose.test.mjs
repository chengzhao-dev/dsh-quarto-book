import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
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
  'checking-prose.py',
)

function findPython() {
  for (const candidate of ['python3', 'python']) {
    if (spawnSync(candidate, ['--version'], { stdio: 'ignore' }).status === 0) return candidate
  }
  return ''
}

const python = findPython()

async function runWith(body) {
  const root = await mkdtemp(path.join(tmpdir(), 'quarto-prose-'))
  try {
    await writeFile(path.join(root, 'index.qmd'), body, 'utf8')
    return spawnSync(python, [script, '--root', root], { encoding: 'utf8' })
  } finally {
    await rm(root, { recursive: true, force: true })
  }
}

test('混排检查放过正确的中英边界与代码围栏', { skip: python ? false : '没有可用的 Python' }, async () => {
  const result = await runWith(
    ['---', 'title: 演示', '---', '', '中文 与 `code`，继续。', '', '```text', '中文Bad', '```', ''].join('\n'),
  )
  assert.equal(result.status, 0, result.stdout + result.stderr)
  assert.match(result.stdout, /OK/)
})

test('混排检查命中缺空格与半角标点', { skip: python ? false : '没有可用的 Python' }, async () => {
  const result = await runWith(['中文Bad 与 中文,中文。', '', '中文`code`，还有 正确 ，不对。', ''].join('\n'))
  assert.equal(result.status, 1)
  assert.match(result.stdout, /中文与拉丁字母\/数字之间缺空格/)
  assert.match(result.stdout, /中文句里混入半角标点/)
  assert.match(result.stdout, /中文与行内代码之间缺空格/)
  assert.match(result.stdout, /中文标点前多了空格/)
})
