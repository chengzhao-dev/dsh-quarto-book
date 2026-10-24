import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'
import { mkdtemp, mkdir, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { evaluateOutputDir, inspectHtml, runRenderCheck } from '../lib/tools/render-check.js'

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

test('output-dir 行尾注释不进入目录名', () => {
  const decision = evaluateOutputDir('C:/book', 'project:\n  output-dir: _book # 输出目录\n')
  assert.equal(decision.safe, true)
  assert.equal(decision.value, '_book')
  assert.equal(decision.resolved, path.resolve('C:/book', '_book'))
})

test('output-dir 指向书外符号链接时拒绝渲染', async (t) => {
  const root = await bookFixture()
  const outside = await mkdtemp(path.join(tmpdir(), 'quarto-outside-'))
  try {
    await rm(path.join(root, '_book'), { recursive: true, force: true })
    try {
      await symlink(outside, path.join(root, '_book'), 'junction')
    } catch {
      t.skip('当前平台不能创建目录符号链接')
      return
    }
    const result = await runRenderCheck({
      root,
      qmdPath: 'chapter.qmd',
      dryRun: true,
      spawn: () => {
        throw new Error('不应调用')
      },
    })
    assert.equal(result.safe_to_render, false)
    assert.match(result.warnings[0], /符号链接/)
  } finally {
    await rm(root, { recursive: true, force: true })
    await rm(outside, { recursive: true, force: true })
  }
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

test('非 Quarto Book 的 _quarto.yml 直接拒绝，不启动渲染', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'quarto-check-'))
  try {
    await writeFile(path.join(root, '_quarto.yml'), 'project:\n  type: website\n', 'utf8')
    await writeFile(path.join(root, 'index.qmd'), '# 首页\n', 'utf8')
    let calls = 0
    const result = await runRenderCheck({
      root,
      qmdPath: 'index.qmd',
      dryRun: false,
      spawn: () => {
        calls += 1
        throw new Error('不应调用')
      },
    })
    assert.equal(result.safe_to_render, false)
    assert.match(result.warnings.join('\n'), /type: book/)
    assert.equal(calls, 0)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('书配置存在但没有章节源文件时拒绝渲染', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'quarto-check-'))
  try {
    await writeFile(path.join(root, '_quarto.yml'), 'project:\n  type: book\n', 'utf8')
    let calls = 0
    const result = await runRenderCheck({
      root,
      qmdPath: 'chapter.qmd',
      dryRun: false,
      spawn: () => {
        calls += 1
        throw new Error('不应调用')
      },
    })
    assert.equal(result.safe_to_render, false)
    assert.match(result.warnings.join('\n'), /没有 \.qmd 或 \.md 源文件/)
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

test('正文举例里的 file:/// 不算本地链接', async () => {
  const root = await bookFixture({
    indexHtml: '<!doctype html><html><head><meta charset="utf-8"><title>书</title></head><body>例如 file:///tmp 是绝对路径</body></html>',
  })
  try {
    const result = await runRenderCheck({
      root,
      qmdPath: 'chapter.qmd',
      dryRun: false,
      spawn: fakeSpawn({ code: 0 }),
    })
    const check = result.html_report.checks.find((item) => item.id === 'no_file_uri')
    assert.equal(check.status, 'pass')
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('href 指向 file:/// 时 no_file_uri 失败', async () => {
  const root = await bookFixture({
    indexHtml: '<!doctype html><html><head><meta charset="utf-8"><title>书</title></head><body><a href="file:///tmp/x.html">x</a></body></html>',
  })
  try {
    const result = await runRenderCheck({
      root,
      qmdPath: 'chapter.qmd',
      dryRun: false,
      spawn: fakeSpawn({ code: 0 }),
    })
    const check = result.html_report.checks.find((item) => item.id === 'no_file_uri')
    assert.equal(check.status, 'fail')
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('无 theme/ 时跳过主题 DOM 契约', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'quarto-dom-'))
  const output = path.join(root, '_book')
  await mkdir(output, { recursive: true })
  await writeFile(
    path.join(output, 'index.html'),
    '<!doctype html><html><head><meta charset="utf-8"><title>书</title></head><body><div class="code-copy-outer-scaffold">代码</div></body></html>',
    'utf8',
  )
  try {
    const spawn = (_command, args) => {
      const child = new EventEmitter()
      child.stdout = new EventEmitter()
      child.stderr = new EventEmitter()
      child.kill = () => true
      const script = args[0] ?? ''
      const text = script.endsWith('checking-dom.py')
        ? 'OK C3 打印不隐藏代码\nOK C5 Mermaid\nOK C9 答案折叠\nFAIL C1 复制按钮\nFAIL C6 主题字体\n'
        : ''
      queueMicrotask(() => {
        if (text) child.stdout.emit('data', text)
        child.emit('close', 0)
      })
      return child
    }
    const { report } = await inspectHtml({
      root,
      outputDir: output,
      yaml: 'project:\n  type: book\n',
      spawn,
    })
    const dom = report.checks.find((check) => check.id === 'dom')
    assert.equal(dom.status, 'pass')
    assert.match(dom.detail, /通用 DOM 契约通过/)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('正常中文里的「璇」不算乱码', async () => {
  const root = await bookFixture({
    indexHtml: '<!doctype html><html><head><meta charset="utf-8"><title>书</title></head><body>璇玑</body></html>',
  })
  try {
    const result = await runRenderCheck({
      root,
      qmdPath: 'chapter.qmd',
      dryRun: false,
      spawn: fakeSpawn({ code: 0 }),
    })
    const utf8 = result.html_report.checks.find((check) => check.id === 'utf8')
    assert.equal(utf8.status, 'pass')
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('锟斤拷乱码序列让 utf8 检查失败', async () => {
  const root = await bookFixture({
    indexHtml: '<!doctype html><html><head><meta charset="utf-8"><title>书</title></head><body>锟斤拷</body></html>',
  })
  try {
    const result = await runRenderCheck({
      root,
      qmdPath: 'chapter.qmd',
      dryRun: false,
      spawn: fakeSpawn({ code: 0 }),
    })
    const utf8 = result.html_report.checks.find((check) => check.id === 'utf8')
    assert.equal(utf8.status, 'fail')
    assert.match(utf8.detail, /锟斤拷/)
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
      'project:\n  type: book\n  output-dir: _book\nbook:\n  search: true # 打开搜索\n',
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

test('单个 HTML 超过上限时给出明确失败原因', async () => {
  const root = await bookFixture()
  try {
    const html = `<!doctype html><html><head><meta charset="utf-8"></head><body>${'x'.repeat(8 * 1024 * 1024)}</body></html>`
    await mkdir(path.join(root, '_book'), { recursive: true })
    await writeFile(path.join(root, '_book', 'index.html'), html, 'utf8')
    const { report } = await inspectHtml({
      root,
      outputDir: path.join(root, '_book'),
      yaml: 'project:\n  type: book\n  output-dir: _book\n',
    })
    const utf8 = report.checks.find((check) => check.id === 'utf8')
    assert.equal(utf8.status, 'fail')
    assert.match(utf8.detail, /超过/)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

