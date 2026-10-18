import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

import { parseYamlLite } from '../src/yaml-lite.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const readJson = (name) => JSON.parse(readFileSync(join(root, name), 'utf8'))

test('package.json points at a real bundle patch and entry point', () => {
  const pkg = readJson('package.json')
  assert.equal(pkg.dsh.bundle.patch, './cordis.patch.yml')
  assert.ok(existsSync(join(root, pkg.dsh.bundle.patch)))
  assert.ok(existsSync(join(root, pkg.main)))
  assert.ok(existsSync(join(root, pkg.exports['.'])))
  assert.equal(pkg.type, 'module')
})

test('published file list covers every runtime and documentation artifact', () => {
  const pkg = readJson('package.json')
  for (const entry of ['src', 'assets', 'cordis.patch.yml', 'dsh.plugin.json', 'README.md', 'README.en.md', 'CHANGELOG.md', 'LICENSE']) {
    assert.ok(pkg.files.includes(entry), `files[] is missing ${entry}`)
    assert.ok(existsSync(join(root, entry)), `${entry} does not exist`)
  }
  assert.ok(pkg.engines.node.length > 0)
  assert.ok(pkg.engines.dsh.length > 0)
})

test('bundle patch is a single additive insert of the quarto-book row', () => {
  const patch = parseYamlLite(readFileSync(join(root, 'cordis.patch.yml'), 'utf8'))
  assert.ok(Array.isArray(patch))
  assert.equal(patch.length, 1)
  assert.deepEqual(Object.keys(patch[0]), ['insert'])
  assert.deepEqual(patch[0].insert, [{ id: 'quarto-book', name: 'dsh-quarto-book' }])
  // No override/disable keys anywhere: the patch must not touch official rows.
  const serialized = JSON.stringify(patch)
  for (const forbidden of ['disabled', 'config', 'remove', 'replace']) {
    assert.ok(!serialized.includes(forbidden), `patch unexpectedly contains ${forbidden}`)
  }
})

test('dsh.plugin.json advertises the tool and skill that the entry registers', () => {
  const manifest = readJson('dsh.plugin.json')
  assert.equal(manifest.main, './src/index.js')
  assert.deepEqual(manifest.contributes.tools, ['quarto_book_audit'])
  assert.deepEqual(manifest.contributes.skills, ['quarto-book'])
  assert.equal(manifest.version, readJson('package.json').version)
})

test('documentation references the same install, tool and skill names', () => {
  const zh = readFileSync(join(root, 'README.md'), 'utf8')
  const en = readFileSync(join(root, 'README.en.md'), 'utf8')
  for (const text of [zh, en]) {
    assert.match(text, /quarto_book_audit/)
    assert.match(text, /quarto-book/)
    assert.match(text, /dsh plugin --profile desktop add/)
  }
  assert.match(zh, /CHANGELOG\.md/)
  assert.match(en, /CHANGELOG\.md|LICENSE/)
})
