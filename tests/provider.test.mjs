import assert from 'node:assert/strict'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { apply } from '../lib/index.js'

function makeHarness() {
  let provider
  const tools = new Map()
  apply({
    skills: {
      registerProvider(factory) {
        provider = factory()
      },
    },
    tools: {
      register(definition) {
        tools.set(definition.name, definition)
      },
    },
  })
  assert.ok(provider, 'apply() must register a provider')
  const tool = tools.get('quarto_render_check')
  assert.ok(tool, 'apply() must register the render-check tool')
  const passReport = tools.get('quarto_pass_report')
  assert.ok(passReport, 'apply() must register the pass-report tool')
  return { provider, tool, passReport }
}

async function makeRepo({
  git = true,
  yaml = 'project:\n  type: book\n',
  sources = { 'chapter.qmd': '# 章\n' },
} = {}) {
  const root = await mkdtemp(path.join(tmpdir(), 'dsh-quarto-book-'))
  if (git) await mkdir(path.join(root, '.git'))
  if (yaml !== null) await writeFile(path.join(root, '_quarto.yml'), yaml, 'utf8')
  for (const [name, content] of Object.entries(sources)) {
    const target = path.join(root, name)
    await mkdir(path.dirname(target), { recursive: true })
    await writeFile(target, content, 'utf8')
  }
  return root
}

test('book with a qmd source exposes both skills and the tool', async () => {
  const root = await makeRepo()
  try {
    const { provider } = makeHarness()
    const candidates = await provider.list({ cwd: root })
    assert.deepEqual(candidates.map((candidate) => candidate.name), ['designing-theme', 'writing-quarto'])
    for (const candidate of candidates) {
      assert.equal(candidate.rank, 550)
      assert.equal(candidate.provider, 'dsh-quarto-book')
      assert.equal(candidate.source, 'bundled')
    }
    const loaded = await provider.get(candidates[1])
    assert.match(loaded.content, /^# /)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('book with only markdown chapters is still a book', async () => {
  const root = await makeRepo({ sources: { 'chapter.md': '# 章\n' } })
  try {
    const { provider } = makeHarness()
    assert.equal((await provider.list({ cwd: root })).length, 2)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('no cwd or no git checkout yields no skills', async () => {
  const root = await makeRepo({ git: false })
  try {
    const { provider } = makeHarness()
    assert.deepEqual(await provider.list({}), [])
    assert.deepEqual(await provider.list({ cwd: '' }), [])
    assert.deepEqual(await provider.list({ cwd: root }), [])
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('a Quarto website is not a book', async () => {
  const root = await makeRepo({ yaml: 'project:\n  type: website\n' })
  try {
    const { provider } = makeHarness()
    assert.deepEqual(await provider.list({ cwd: root }), [])
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('a book config without qmd or md sources yields no skills', async () => {
  const root = await makeRepo({ sources: {} })
  try {
    const { provider } = makeHarness()
    assert.deepEqual(await provider.list({ cwd: root }), [])
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('README and other repository metadata are not chapters', async () => {
  const root = await makeRepo({
    sources: { 'README.md': '# 项目说明\n', 'CHANGELOG.md': '# 变更\n' },
  })
  try {
    const { provider } = makeHarness()
    assert.deepEqual(await provider.list({ cwd: root }), [])
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('book type line ignores comments and accepts a trailing comment', async () => {
  const commented = await makeRepo({ yaml: '# type: book\nproject:\n  type: website\n' })
  const trailing = await makeRepo({ yaml: 'project:\n  type: book # 本书\n' })
  try {
    const { provider } = makeHarness()
    assert.deepEqual(await provider.list({ cwd: commented }), [])
    assert.equal((await provider.list({ cwd: trailing })).length, 2)
  } finally {
    await rm(commented, { recursive: true, force: true })
    await rm(trailing, { recursive: true, force: true })
  }
})

test('sources inside generated or third-party trees are not chapters', async () => {
  const root = await makeRepo({
    sources: { '_book/stale.qmd': '# 旧章\n', 'third_party/demo.qmd': '# 示例\n' },
  })
  try {
    const { provider } = makeHarness()
    assert.deepEqual(await provider.list({ cwd: root }), [])
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('a book config above the git root does not opt in', async () => {
  const parent = await mkdtemp(path.join(tmpdir(), 'dsh-quarto-book-parent-'))
  try {
    await writeFile(path.join(parent, '_quarto.yml'), 'project:\n  type: book\n', 'utf8')
    await writeFile(path.join(parent, 'chapter.qmd'), '# 章\n', 'utf8')
    const root = path.join(parent, 'repo')
    await mkdir(root)
    await mkdir(path.join(root, '.git'))
    await writeFile(path.join(root, 'note.qmd'), '# 笔记\n', 'utf8')
    const { provider } = makeHarness()
    assert.deepEqual(await provider.list({ cwd: root }), [])
  } finally {
    await rm(parent, { recursive: true, force: true })
  }
})

test('the gate works from a nested cwd and get() rejects a different workspace', async () => {
  const root = await makeRepo({ sources: { 'content/chapter.qmd': '# 章\n' } })
  const other = await makeRepo({ yaml: 'project:\n  type: website\n' })
  try {
    const { provider } = makeHarness()
    const nested = path.join(root, 'content')
    const [candidate] = await provider.list({ cwd: nested })
    assert.ok(candidate)
    assert.equal(await provider.get(candidate, { cwd: other }), undefined)
    assert.ok(await provider.get(candidate, { cwd: root }))
  } finally {
    await rm(root, { recursive: true, force: true })
    await rm(other, { recursive: true, force: true })
  }
})

test('tool refuses a non-book workspace without spawning', async () => {
  const root = await makeRepo({ yaml: 'project:\n  type: website\n' })
  try {
    const { tool } = makeHarness()
    const result = await tool.execute(
      { qmd_path: 'index.qmd', dry_run: false },
      { agent: { session: { header: { cwd: root } } } },
    )
    assert.equal(result.safe_to_render, false)
    assert.match(result.warnings.join('\n'), /不在 Quarto Book 项目内/)
    assert.equal(result.render_result, null)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('tool refuses when there is no cwd', async () => {
  const { tool } = makeHarness()
  const result = await tool.execute({ qmd_path: 'index.qmd', dry_run: true }, {})
  assert.equal(result.safe_to_render, false)
  assert.match(result.warnings.join('\n'), /没有 cwd/)
})

test('tool dry run accepts a real book workspace', async () => {
  const root = await makeRepo()
  try {
    const { tool } = makeHarness()
    const result = await tool.execute(
      { qmd_path: 'chapter.qmd', dry_run: true },
      { agent: { session: { header: { cwd: root } } } },
    )
    assert.equal(result.safe_to_render, true)
    assert.equal(result.render_result, null)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('tool card reports the dry-run end state and the qmd location', async () => {
  const root = await makeRepo()
  try {
    const { tool } = makeHarness()
    const args = { qmd_path: 'chapter.qmd', dry_run: true }
    const result = await tool.execute(args, { agent: { session: { header: { cwd: root } } } })
    const content = tool.output.render(args, result)
    const text = content.map((item) => item.text).join('\n')
    assert.match(text, /可渲染/)
    assert.match(text, /未执行/)
    assert.deepEqual(tool.presentResult(args, { content }).content, content)
    const call = tool.presentCall(args)
    assert.equal(call.kind, 'execute')
    assert.equal(call.locations[0].path, 'chapter.qmd')
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('refused tool card reports that nothing was rendered', async () => {
  const root = await makeRepo({ yaml: 'project:\n  type: website\n' })
  try {
    const { tool } = makeHarness()
    const args = { qmd_path: 'index.qmd', dry_run: false }
    const result = await tool.execute(args, { agent: { session: { header: { cwd: root } } } })
    const text = tool.output.render(args, result).map((item) => item.text).join('\n')
    assert.match(text, /未渲染/)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('an aborted signal returns no candidates', async () => {
  const root = await makeRepo()
  try {
    const { provider } = makeHarness()
    const controller = new AbortController()
    controller.abort()
    assert.deepEqual(await provider.list({ cwd: root, signal: controller.signal }), [])
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
