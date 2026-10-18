import test from 'node:test'
import assert from 'node:assert/strict'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { auditBook, resolveBookRoot, scanHeadings } from '../src/audit.js'

const fixture = (name) => fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url))

test('minimal book is clean and preserves chapter order', async () => {
  const result = await auditBook({ root: fixture('minimal') })
  assert.equal(result.ok, true)
  assert.equal(result.book.title, 'Minimal Book')
  assert.equal(result.config.path, '_quarto.yml')
  assert.deepEqual(result.chapters.map((chapter) => chapter.path), ['index.qmd', '01-intro.qmd', 'appendix.qmd'])
  assert.deepEqual(result.chapters.map((chapter) => chapter.list), ['chapters', 'chapters', 'appendices'])
  assert.equal(result.chapters[1].headings[0].text, '第一章')
  assert.equal(result.chapters[1].headings[0].line, 1)
  assert.deepEqual(result.summary, { chapters: 3, headings: 8, errors: 0, warnings: 0, infos: 0 })
  assert.match(result.markdown, /# Quarto 图书审计：Minimal Book/)
})

test('audit reports structural problems without stopping', async () => {
  const result = await auditBook({ root: fixture('problems'), includeUnlisted: true })
  assert.equal(result.ok, false)
  const codes = new Set(result.issues.map((issue) => issue.code))
  for (const code of [
    'not-book-project',
    'missing-chapter',
    'chapter-outside-root',
    'duplicate-chapter',
    'empty-part',
    'multiple-h1',
    'heading-level-skip',
    'heading-relative-reference',
    'heading-manual-number',
    'heading-trailing-punctuation',
    'duplicate-heading',
    'empty-section',
    'heading-beyond-toc-depth',
    'unlisted-qmd',
  ]) {
    assert.ok(codes.has(code), `expected ${code}, got ${[...codes].join(', ')}`)
  }
  assert.ok(result.unlisted.includes('unlisted.qmd'))
  assert.equal(result.summary.errors, 1)
  assert.ok(result.issues.every((issue) => ['error', 'warning', 'info'].includes(issue.severity)))
})

test('audit caps issues and marks truncation', async () => {
  const result = await auditBook({ root: fixture('problems'), maxIssues: 3 })
  assert.equal(result.issues.length, 3)
  assert.equal(result.issuesTruncated, true)
  assert.equal(result.maxIssues, 3)
  assert.equal(result.summary.errors, 1)
})

test('missing config is an error and still returns a markdown report', async () => {
  const result = await auditBook({ root: fixture('') })
  assert.equal(result.ok, false)
  assert.equal(result.config.path, null)
  assert.ok(result.issues.some((issue) => issue.code === 'missing-config'))
  assert.match(result.markdown, /缺失/)
})

test('a part landing page counts as listed, not as an unlisted chapter', async () => {
  const result = await auditBook({ root: fixture('part-page'), includeUnlisted: true })
  assert.deepEqual(result.chapters.map((chapter) => chapter.path), ['index.qmd', 'tictactoe/01-rules.qmd'])
  assert.equal(result.chapters[1].part, 'tictactoe/index.qmd')
  assert.deepEqual(result.unlisted, [])
})

test('yaml edge cases keep quoted hashes, parts and href chapters', async () => {
  const result = await auditBook({ root: fixture('yaml-edge') })
  assert.equal(result.book.title, 'Edge: # not a comment')
  assert.deepEqual(result.chapters.map((chapter) => chapter.path), ['index.qmd', '01-edge.qmd'])
  assert.equal(result.chapters[1].part, "Part 'One'")
  assert.equal(result.chapters[1].exists, true)
  assert.ok(result.issues.some((issue) => issue.code === 'heading-beyond-toc-depth'))
})

test('scanHeadings ignores frontmatter, fences, comments and indented code', () => {
  const text = [
    '---',
    'title: x',
    '# not a heading',
    '---',
    '# One',
    '```python',
    '# inside fence',
    '```',
    '## Two {#id}',
    '<!--',
    '### hidden',
    '-->',
    '   ### three spaces',
    '    #### four spaces',
    '~~~',
    '## inside tilde',
    '~~~',
    '## Trailing ##',
    '',
  ].join('\n')
  const headings = scanHeadings(text)
  assert.deepEqual(headings, [
    { level: 1, text: 'One', line: 5 },
    { level: 2, text: 'Two', line: 9 },
    { level: 3, text: 'three spaces', line: 13 },
    { level: 2, text: 'Trailing', line: 18 },
  ])
})

test('a chapter with only comments after a heading is empty', async () => {
  const root = fileURLToPath(new URL('./fixtures/minimal', import.meta.url))
  const result = await auditBook({ root })
  assert.equal(result.issues.filter((issue) => issue.code === 'empty-section').length, 0)
})

test('resolveBookRoot defaults to cwd and resolves relative roots', () => {
  const cwd = fileURLToPath(new URL('./fixtures/minimal', import.meta.url))
  assert.equal(resolveBookRoot(undefined, cwd), resolve(cwd))
  assert.equal(resolveBookRoot('.', cwd), resolve(cwd))
  assert.equal(resolveBookRoot('sub', cwd), resolve(cwd, 'sub'))
  assert.equal(resolveBookRoot('  ', cwd), resolve(cwd))
})
