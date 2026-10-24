// 技能 provider 与渲染检查工具共用的工作区门禁。
//
// Quarto Book 工作区是一个 git 检出：其中 `_quarto.yml` 有一行真正的
// `type: book`，且至少有一个 `.qmd` 或 `.md` 源文件。源文件探测有界，并跳过
// 生成目录，因此只有配置、或只有生成出来的 `_book/` 的仓库不会加载技能。
import { access, readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

export const MAX_ASCENT = 64
export const BOOK_PROJECT_RE = /^(?![\t ]*#)[\t ]*type:[\t ]*['"]?book['"]?[\t ]*(?:#.*)?$/m

const MAX_SCAN_ENTRIES = 4000
const MAX_SCAN_DEPTH = 12
const BOOK_SOURCE_EXTENSIONS = new Set(['.qmd', '.md'])
const NON_CHAPTER_FILE_RE =
  /^(?:readme|changelog|license|licence|contributing|code[_-]of[_-]conduct|security|support|authors|contributors|agents|claude)(?:[.-][a-z0-9_-]+)*\.(?:md|markdown|qmd)$/i
const IGNORED_DIRECTORIES = new Set([
  '.git',
  '.agents',
  '.quarto',
  '.cache',
  '.venv',
  '_book',
  'node_modules',
  'renv',
  'packrat',
  'temp',
  'templates',
  'third_party',
  'vendor',
])

async function exists(target: string): Promise<boolean> {
  try {
    await access(target)
    return true
  } catch {
    return false
  }
}

export async function findGitRoot(cwd: string): Promise<string | undefined> {
  let cursor: string
  try {
    cursor = path.resolve(cwd)
  } catch {
    return undefined
  }
  for (let depth = 0; depth < MAX_ASCENT; depth += 1) {
    if (await exists(path.join(cursor, '.git'))) return cursor
    const parent = path.dirname(cursor)
    if (parent === cursor) return undefined
    cursor = parent
  }
  return undefined
}

export async function declaresBookProject(dir: string): Promise<boolean> {
  let source: string
  try {
    source = await readFile(path.join(dir, '_quarto.yml'), 'utf8')
  } catch {
    return false
  }
  return BOOK_PROJECT_RE.test(source)
}

export async function hasBookSource(root: string): Promise<boolean> {
  let visited = 0
  const stack: Array<{ dir: string; depth: number }> = [{ dir: root, depth: 0 }]
  while (stack.length > 0 && visited < MAX_SCAN_ENTRIES) {
    const current = stack.pop()
    if (!current) break
    let entries
    try {
      entries = await readdir(current.dir, { withFileTypes: true })
    } catch {
      continue
    }
    for (const entry of entries) {
      visited += 1
      if (visited >= MAX_SCAN_ENTRIES) break
      if (entry.isDirectory()) {
        if (current.depth >= MAX_SCAN_DEPTH) continue
        if (IGNORED_DIRECTORIES.has(entry.name)) continue
        stack.push({ dir: path.join(current.dir, entry.name), depth: current.depth + 1 })
        continue
      }
      if (!entry.isFile()) continue
      const extension = path.extname(entry.name).toLowerCase()
      if (!BOOK_SOURCE_EXTENSIONS.has(extension)) continue
      if (current.depth === 0 && NON_CHAPTER_FILE_RE.test(entry.name)) {
        continue
      }
      return true
    }
  }
  return false
}

/**
 * 在 cwd 与所属 git 根之间寻找最近的合法书根。
 * 最近一个 `_quarto.yml` 决定结果：它不是书、或没有章节源文件时直接判否，
 * 不再向上爬进无关的父项目。
 */
export async function findBookRoot(cwd: string | undefined): Promise<string | undefined> {
  if (typeof cwd !== 'string' || cwd.trim() === '') return undefined
  let start: string
  try {
    start = path.resolve(cwd)
  } catch {
    return undefined
  }
  const gitRoot = await findGitRoot(start)
  if (!gitRoot) return undefined

  let cursor = start
  for (let depth = 0; depth < MAX_ASCENT; depth += 1) {
    if (await exists(path.join(cursor, '_quarto.yml'))) {
      if (!(await declaresBookProject(cursor))) return undefined
      return (await hasBookSource(cursor)) ? cursor : undefined
    }
    if (cursor === gitRoot) return undefined
    const parent = path.dirname(cursor)
    if (parent === cursor) return undefined
    cursor = parent
  }
  return undefined
}

export async function isQuartoBookWorkspace(cwd: string | undefined): Promise<boolean> {
  return (await findBookRoot(cwd)) !== undefined
}
