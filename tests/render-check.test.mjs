import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { evaluateOutputDir, runRenderCheck } from '../lib/tools/render-check.js'

function fakeSpawn({ code = 0, output = '' } = {}) {
  return (command) => {
    const child = new EventEmitter()
    child.stdout = new EventEmitter()
    child.stderr = new EventEmitter()
    child.kill = () => true
    queueMicrotask(() => {
      if (output) {
        const target = command === 'quarto' ? child.stdout : child.stderr
        target.emit('data', output)
      }
      child.emit('close', code)
    })
    return child
  }
}

async function bookFixture({ outputDir = '_book', indexHtml } = {}) {
  const root = await mkdtemp(path.join(tmpdir(), 'quarto-check-'))
  await writeFile(path.join(root, '_quarto.yml'), `project:\n  type: book\n  output-dir: ${outputDir}\n`, 'utf8')
  await writeFile(path.join(root, 'chapter.qmd'), '# 章\n', 'utf8')
  if (indexHtml !== undefined) {
    await mkdir(path.join(root, '_book'), { recursive: true })
    await writeFile(path.join(root, '_book', 'index.html'), indexHtml, 'utf8')
  }
  return root
}

test('安全输出目录：_book 落在书根内部', () => {
  const decision = evaluateOutputDir('C:/book', 'project:\n  output-dir: _book\n')
  assert.equal(decision.safe, true)
  assert.equal(decision.value, '_book')
})

test('危险输出目录：./ 会覆盖书根', () => {
  const decision = evaluateOutputDir('C:/book', 'project:\n  output-dir: ./\n')
  assert.equal(decision.safe, false)
  assert.match(decision.warning, /覆盖书根/)
  assert.match(decision.warning, /_book/)
})

test('危险输出目录：../out 落在书外', () => {
  const decision = evaluateOutputDir('C:/book', 'project:\n  output-dir: ../out\n')
  assert.equal(decision.safe, false)
  assert.match(decision.warning, /书根之外/)
})

test('dry_run 为 true 时只做安全检查，不启动渲染', async () => {
  const root = await bookFixture()
  try {
    let calls = 0
    const result = await runRenderCheck({
      root,
      qmdPath: 'chapter.qmd',
      dryRun: true,
      spawn: () => {
        calls += 1
        throw new Error('不应调用')
      },
    })
    assert.equal(result.safe_to_render, true)
    assert.equal(result.render_result, null)
    assert.equal(result.html_report, null)
    assert.equal(calls, 0)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('quarto 失败时返回错误报告，不抛异常', async () => {
  const root = await bookFixture()
  try {
    const result = await runRenderCheck({
      root,
      qmdPath: 'chapter.qmd',
      dryRun: false,
      spawn: fakeSpawn({ code: 1, output: 'ERROR: 没有 pandoc' }),
    })
    assert.equal(result.safe_to_render, true)
    assert.equal(result.render_result.ok, false)
    assert.equal(result.render_result.exit_code, 1)
    assert.equal(result.html_report, null)
    assert.match(result.errors.join('\n'), /渲染失败/)
    assert.equal(result.errors.length, 1)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('首页缺 charset 时 usable 为 false 且 charset 为 fail', async () => {
  const root = await bookFixture({
    indexHtml: '<!doctype html><html><head><title>书</title></head><body>正文</body></html>',
  })
  try {
    const result = await runRenderCheck({
      root,
      qmdPath: 'chapter.qmd',
      dryRun: false,
      spawn: fakeSpawn({ code: 0 }),
    })
    assert.equal(result.render_result.ok, true)
    assert.equal(result.html_report.usable, false)
    const charset = result.html_report.checks.find((check) => check.id === 'charset')
    assert.equal(charset.status, 'fail')
    const index = result.html_report.checks.find((check) => check.id === 'index_html')
    assert.equal(index.status, 'pass')
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('首页含 charset 与 sitemap/search 时全部通过', async () => {
  const root = await bookFixture({
    indexHtml: '<!doctype html><html><head><meta charset="utf-8"><title>书</title></head><body>正文</body></html>',
  })
  try {
    await writeFile(
      path.join(root, '_quarto.yml'),
      'project:\n  type: book\n  output-dir: _book\nbook:\n  site-url: "https://example.com/book"\n  search: true\n',
      'utf8',
    )
    await mkdir(path.join(root, '_book'), { recursive: true })
    await writeFile(path.join(root, '_book', 'sitemap.xml'), '<urlset><url><loc>https://example.com/book/</loc></url></urlset>', 'utf8')
    await writeFile(path.join(root, '_book', 'search.json'), '{"docs":[{"title":"首页"}]}', 'utf8')
    const result = await runRenderCheck({
      root,
      qmdPath: 'chapter.qmd',
      dryRun: false,
      spawn: fakeSpawn({ code: 0 }),
    })
    assert.equal(result.html_report.usable, true)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('search.json 为顶层数组时也算索引可用', async () => {
  const root = await bookFixture({
    indexHtml: '<!doctype html><html><head><meta charset="utf-8"><title>书</title></head><body>正文</body></html>',
  })
  try {
    await writeFile(
      path.join(root, '_quarto.yml'),
      'project:\n  type: book\n  output-dir: _book\nbook:\n  search: true\n',
      'utf8',
    )
    await writeFile(path.join(root, '_book', 'search.json'), '[{"title":"首页"}]', 'utf8')
    const result = await runRenderCheck({
      root,
      qmdPath: 'chapter.qmd',
      dryRun: false,
      spawn: fakeSpawn({ code: 0 }),
    })
    const search = result.html_report.checks.find((check) => check.id === 'search_index')
    assert.equal(search.status, 'pass')
    assert.equal(result.html_report.usable, true)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

