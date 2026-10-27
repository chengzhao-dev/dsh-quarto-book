import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
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
  'checking-names.py',
)

function findPython() {
  for (const candidate of ['python3', 'python']) {
    if (spawnSync(candidate, ['--version'], { stdio: 'ignore' }).status === 0) return candidate
  }
  return ''
}

const python = findPython()

async function runWith(build) {
  const root = await mkdtemp(path.join(tmpdir(), 'quarto-names-'))
  try {
    await build(root)
    return spawnSync(python, [script, '--root', root], { encoding: 'utf8' })
  } finally {
    await rm(root, { recursive: true, force: true })
  }
}

test('命名检查放过构建产物目录里的生成文件名', { skip: python ? false : '没有可用的 Python' }, async () => {
  const result = await runWith(async (root) => {
    await mkdir(path.join(root, 'build-release', 'CMakeFiles'), { recursive: true })
    await writeFile(path.join(root, 'build-release', 'CMakeFiles', 'CompilerIdCXX.cpp'), '', 'utf8')
    await writeFile(path.join(root, 'build-release', 'cmake_install.cmake'), '', 'utf8')
    await writeFile(path.join(root, 'index.qmd'), '', 'utf8')
  })
  assert.equal(result.status, 0, result.stdout + result.stderr)
  assert.match(result.stdout, /OK/)
})

test('命名检查放过 CMake 模块的驼峰名', { skip: python ? false : '没有可用的 Python' }, async () => {
  const result = await runWith(async (root) => {
    await mkdir(path.join(root, 'cmake'), { recursive: true })
    await writeFile(path.join(root, 'cmake', 'CompileSettings.cmake'), '', 'utf8')
  })
  assert.equal(result.status, 0, result.stdout + result.stderr)
})

test('命名检查仍拦 CMake 模块里的下划线', { skip: python ? false : '没有可用的 Python' }, async () => {
  const result = await runWith(async (root) => {
    await mkdir(path.join(root, 'cmake'), { recursive: true })
    await writeFile(path.join(root, 'cmake', 'compile_settings.cmake'), '', 'utf8')
  })
  assert.equal(result.status, 1, result.stdout + result.stderr)
  assert.match(result.stdout, /含下划线/)
})

test('命名检查拦非 ASCII 路径', { skip: python ? false : '没有可用的 Python' }, async () => {
  const result = await runWith(async (root) => {
    await writeFile(path.join(root, '中文.md'), '', 'utf8')
  })
  assert.equal(result.status, 1, result.stdout + result.stderr)
  assert.match(result.stdout, /U\+4E2D/)
})
