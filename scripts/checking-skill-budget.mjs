#!/usr/bin/env node
// 检查技能 Markdown 的估算 token 体量，防止单文件与总量无界增长。
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'

const ROOT = path.resolve(process.argv.includes('--root')
  ? process.argv[process.argv.indexOf('--root') + 1]
  : 'skills')
const TOTAL_LIMIT = 140_000

const BUDGETS = [
  [/^writing-quarto\/SKILL\.md$/, 2_000],
  [/^designing-theme\/SKILL\.md$/, 2_000],
  [/^writing-quarto\/steps\/(02-structure|03-blocks|05-sentences)\.md$/, 12_000],
  [/^writing-quarto\/steps\/.*\.md$/, 8_000],
  [/^writing-quarto\/examples\/.*\.md$/, 5_000],
  [/^writing-quarto\/quarto\/.*\.md$/, 5_000],
  [/^designing-theme\/references\/theme-system\.md$/, 8_000],
  [/^designing-theme\/(references|knowledge)\/.*\.md$/, 6_000],
  [/^designing-theme\/assets\/.*\/meta\.md$/, 2_000],
]

function estimateTokens(text) {
  let cjk = 0
  let other = 0
  for (const char of text) {
    if (/[\u3400-\u9fff\uf900-\ufaff]/.test(char)) cjk += 1
    else other += 1
  }
  return Math.ceil(cjk + other / 4)
}

function budgetFor(relative) {
  const hit = BUDGETS.find(([pattern]) => pattern.test(relative))
  return hit ? hit[1] : 6_000
}

async function walk(dir) {
  const out = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...await walk(full))
    else if (entry.isFile() && entry.name.endsWith('.md')) out.push(full)
  }
  return out
}

const files = await walk(ROOT)
const rows = []
for (const file of files) {
  const relative = path.relative(ROOT, file).split(path.sep).join('/')
  const tokens = estimateTokens(await readFile(file, 'utf8'))
  rows.push({ relative, tokens, limit: budgetFor(relative) })
}

const total = rows.reduce((sum, row) => sum + row.tokens, 0)
const failures = rows.filter((row) => row.tokens > row.limit)
const messages = []
if (failures.length > 0) {
  for (const row of failures) {
    messages.push(`${row.relative}: ${row.tokens} tokens，超过 ${row.limit}`)
  }
}
if (total > TOTAL_LIMIT) {
  messages.push(`全部技能 Markdown：${total} tokens，超过总量 ${TOTAL_LIMIT}`)
}

if (messages.length > 0) {
  console.error(`skill budget failed：${failures.length} 个文件超限，合计 ${total} tokens`)
  for (const message of messages) console.error(`  ${message}`)
  process.exit(1)
}

console.log(`skill budget passed：${rows.length} 个文件，合计约 ${total} tokens`)
