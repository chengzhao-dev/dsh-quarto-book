import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
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
  'checking-links.py',
)

function findPython() {
  for (const candidate of ['python3', 'python']) {
    if (spawnSync(candidate, ['--version'], { stdio: 'ignore' }).status === 0) return candidate
  }
  return ''
}

const python = findPython()

test('链接检查忽略 build 目录里的依赖文档', { skip: python ? false : '没有可用的 Python' }, async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'quarto-links-'))
  try {
    await writeFile(path.join(root, 'index.qmd'), '[章节](chapter.qmd)\n', 'utf8')
    await writeFile(path.join(root, 'chapter.qmd'), '# 章节\n', 'utf8')
    await mkdir(path.join(root, 'build', '_deps', 'pkg'), { recursive: true })
    await writeFile(path.join(root, 'build', '_deps', 'pkg', 'README.md'), '[断链](missing.md)\n', 'utf8')
    const result = spawnSync(python, [script, '--root', root], { encoding: 'utf8' })
    assert.equal(result.status, 0, result.stdout + result.stderr)
    assert.match(result.stdout, /OK/)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('引用式链接检查定义目标', { skip: python ? false : '没有可用的 Python' }, async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'quarto-links-ref-'))
  try {
    await writeFile(
      path.join(root, 'index.qmd'),
      '[章节][ch]\n\n[ch]: chapter.qmd\n',
      'utf8',
    )
    await writeFile(path.join(root, 'chapter.qmd'), '# 章节\n', 'utf8')
    const result = spawnSync(python, [script, '--root', root], { encoding: 'utf8' })
    assert.equal(result.status, 0, result.stdout + result.stderr)
    assert.match(result.stdout, /检查 1 条/)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('引用式链接报告未定义标签', { skip: python ? false : '没有可用的 Python' }, async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'quarto-links-ref-missing-'))
  try {
    await writeFile(path.join(root, 'index.qmd'), '[章节][missing]\n', 'utf8')
    const result = spawnSync(python, [script, '--root', root], { encoding: 'utf8' })
    assert.equal(result.status, 1, result.stdout + result.stderr)
    assert.match(result.stdout, /引用标签未定义/)
    assert.match(result.stdout, /missing/)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('围栏和行内代码里的引用不当作链接', { skip: python ? false : '没有可用的 Python' }, async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'quarto-links-ref-code-'))
  try {
    await writeFile(
      path.join(root, 'index.qmd'),
      '```md\n[示例][missing]\n```\n\n行内 `[示例][missing]` 不参与检查。\n',
      'utf8',
    )
    const result = spawnSync(python, [script, '--root', root], { encoding: 'utf8' })
    assert.equal(result.status, 0, result.stdout + result.stderr)
    assert.match(result.stdout, /检查 0 条/)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
