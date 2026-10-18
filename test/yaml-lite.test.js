import test from 'node:test'
import assert from 'node:assert/strict'
import { parseYamlLite, YamlLiteError } from '../src/yaml-lite.js'

test('parses nested maps, sequences and parts', () => {
  const value = parseYamlLite(`
project:
  type: book
book:
  title: "A: B"
  chapters:
    - index.qmd
    - part: "Part One"
      chapters:
        - href: "01.qmd"
          text: "One"
    - part: "Empty"
      chapters: []
`)
  assert.deepEqual(value, {
    project: { type: 'book' },
    book: {
      title: 'A: B',
      chapters: [
        'index.qmd',
        { part: 'Part One', chapters: [{ href: '01.qmd', text: 'One' }] },
        { part: 'Empty', chapters: [] },
      ],
    },
  })
})

test('parses inline sequences and inline maps', () => {
  assert.deepEqual(parseYamlLite('a: [one, "two, three", 4, true, null]'), {
    a: ['one', 'two, three', 4, true, null],
  })
  assert.deepEqual(parseYamlLite('a: {b: 1, c: [x, y]}'), { a: { b: 1, c: ['x', 'y'] } })
  assert.deepEqual(parseYamlLite('a: []'), { a: [] })
  assert.deepEqual(parseYamlLite('a: {}'), { a: {} })
})

test('keeps hashes inside quotes and strips real comments', () => {
  const value = parseYamlLite(`
title: "Edge: # not a comment"
plain: value # comment
single: 'it''s # here'
`)
  assert.deepEqual(value, {
    title: 'Edge: # not a comment',
    plain: 'value',
    single: "it's # here",
  })
})

test('parses literal and folded block scalars', () => {
  assert.deepEqual(parseYamlLite('description: |\n  one\n  two\n'), { description: 'one\ntwo' })
  assert.deepEqual(parseYamlLite('description: >-\n  one\n  two\n'), { description: 'one two' })
})

test('strips a BOM and accepts document markers', () => {
  assert.deepEqual(parseYamlLite('\uFEFF---\na: 1\n...\n'), { a: 1 })
})

test('rejects malformed or unsupported YAML with a line number', () => {
  assert.throws(() => parseYamlLite('a: 1\n   b: 2\n'), (error) => error instanceof YamlLiteError && error.line === 2)
  assert.throws(() => parseYamlLite('a:\n  - 1\n  b: 2\n'), (error) => error instanceof YamlLiteError)
  assert.throws(() => parseYamlLite('a:\n  - - 1\n'), /nested inline sequences/)
  assert.throws(() => parseYamlLite('a: "unterminated\n'), (error) => error instanceof YamlLiteError)
})

test('returns null for an empty document', () => {
  assert.equal(parseYamlLite('  \n\n'), null)
  assert.equal(parseYamlLite('---\n'), null)
})
