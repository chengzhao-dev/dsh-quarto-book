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
  'checking-dom.py',
)

function findPython() {
  for (const candidate of ['python3', 'python']) {
    if (spawnSync(candidate, ['--version'], { stdio: 'ignore' }).status === 0) return candidate
  }
  return ''
}

const python = findPython()

test('C8 忽略自定义组件里没有 code 子节点的 pre', { skip: python ? false : '没有可用的 Python' }, async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'quarto-dom-'))
  try {
    await mkdir(path.join(root, 'theme', 'css'), { recursive: true })
    await mkdir(path.join(root, '_book'), { recursive: true })
    await writeFile(
      path.join(root, 'theme', 'css', 'code.css'),
      [
        ':root {',
        '  --code-title-bg: #eee;',
        '  --code-title-fg: #111;',
        '  --code-title-font-size: 0.9rem;',
        '  --code-title-padding: 0.4rem;',
        '}',
        '',
      ].join('\n'),
      'utf8',
    )
    await writeFile(
      path.join(root, '_book', 'index.html'),
      [
        '<!doctype html><html><body>',
        '<div class="code-with-filename"><pre class="code"><code>int main();</code></pre></div>',
        '<pre class="tl-terminal-pre">终端输出不是代码块</pre>',
        '</body></html>',
        '',
      ].join('\n'),
      'utf8',
    )
    const result = spawnSync(python, [script], { encoding: 'utf8', cwd: root })
    assert.match(result.stdout, /C8 .*未包裹 pre=0/)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
