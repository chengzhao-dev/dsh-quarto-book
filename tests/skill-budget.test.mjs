import assert from 'node:assert/strict'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const script = fileURLToPath(new URL('../scripts/checking-skill-budget.mjs', import.meta.url))

async function run(files) {
  const root = await mkdtemp(join(tmpdir(), 'skill-budget-'))
  try {
    for (const [relative, body] of Object.entries(files)) {
      const path = join(root, relative)
      await mkdir(join(path, '..'), { recursive: true })
      await writeFile(path, body, 'utf8')
    }
    const result = spawnSync(process.execPath, [script, '--root', root], { encoding: 'utf8' })
    return { status: result.status, stdout: result.stdout, stderr: result.stderr }
  } finally {
    await rm(root, { recursive: true, force: true })
  }
}

test('预算内的技能 Markdown 通过', async () => {
  const result = await run({ 'writing-quarto/SKILL.md': '# 短文件\n\n一句话。\n' })
  assert.equal(result.status, 0)
  assert.match(result.stdout, /skill budget passed/)
})

test('超过单文件预算时失败', async () => {
  const result = await run({ 'writing-quarto/SKILL.md': '字'.repeat(2_100) })
  assert.equal(result.status, 1)
  assert.match(result.stderr, /超过 2000/)
})
