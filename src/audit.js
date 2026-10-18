// Read-only Quarto book audit.
//
// The audit answers two questions without rendering anything:
//   1. Does `_quarto.yml` wire an existing, ordered chapter tree?
//   2. Does each chapter's heading outline obey the book conventions
//      (one title level, no skipped levels, no empty sections, no
//      "previous/next section" headings, no hand-written numbering)?
//
// It never writes, never runs Quarto and never executes code from the book.

import { readFile, readdir, stat } from 'node:fs/promises'
import { extname, join, relative, resolve, sep } from 'node:path'
import { parseYamlLite, YamlLiteError } from './yaml-lite.js'

const CONFIG_NAMES = ['_quarto.yml', '_quarto.yaml']
const CHAPTER_EXTENSIONS = new Set(['.qmd', '.md', '.ipynb', '.Rmd', '.rmd'])
const UNLISTED_EXTENSIONS = new Set(['.qmd', '.ipynb', '.Rmd', '.rmd'])
const SKIP_DIRS = new Set([
  '.git',
  '.quarto',
  '_book',
  '_freeze',
  'node_modules',
  'site_libs',
  'renv',
  '__pycache__',
  'build',
  'dist',
  'target',
  'vendor',
  '.venv',
  'venv',
])
const MAX_CONFIG_BYTES = 2 * 1024 * 1024
const MAX_CHAPTER_BYTES = 4 * 1024 * 1024
const MAX_ISSUES = 500

const SEVERITY_ORDER = { error: 0, warning: 1, info: 2 }

function toPosix(path) {
  return path.split(sep).join('/')
}

function normalizeChapterPath(value) {
  let path = String(value).trim()
  if (path.startsWith('`') && path.endsWith('`')) path = path.slice(1, -1)
  path = path.replace(/\\/g, '/').replace(/^\.\//, '')
  return path
}

async function readText(path, maxBytes) {
  const info = await stat(path)
  if (!info.isFile()) throw new Error('not a regular file')
  if (info.size > maxBytes) throw new Error(`file is larger than ${maxBytes} bytes`)
  return await readFile(path, 'utf8')
}

async function loadConfig(root) {
  for (const name of CONFIG_NAMES) {
    const path = join(root, name)
    try {
      const text = await readText(path, MAX_CONFIG_BYTES)
      return { path, name, text }
    } catch (error) {
      if (error?.code !== 'ENOENT') return { path, name, error }
    }
  }
  return null
}

async function parseConfig(text) {
  let module = null
  try {
    module = await import('js-yaml')
  } catch {
    // js-yaml is optional; the bundled subset parser is the fallback.
  }
  const load = module?.load ?? module?.default?.load
  if (typeof load === 'function') return { data: load(text), parser: 'js-yaml' }
  try {
    return { data: parseYamlLite(text), parser: 'yaml-lite' }
  } catch (error) {
    if (error instanceof YamlLiteError) throw error
    throw new YamlLiteError(error instanceof Error ? error.message : String(error))
  }
}

function extractChapters(book) {
  const entries = []
  const seenParts = new Set()
  const partPages = new Set()

  const walk = (items, part, list) => {
    if (!Array.isArray(items)) return
    for (const item of items) {
      if (typeof item === 'string') {
        entries.push({ path: normalizeChapterPath(item), part, list })
        continue
      }
      if (item === null || typeof item !== 'object') continue
      if (Array.isArray(item.chapters)) {
        const partTitle = typeof item.part === 'string' ? item.part : undefined
        if (partTitle !== undefined && CHAPTER_EXTENSIONS.has(extname(partTitle).toLowerCase())) {
          // A part landing page is a real page but not a chapter entry.
          partPages.add(normalizeChapterPath(partTitle))
        }
        if (partTitle !== undefined && item.chapters.length === 0) seenParts.add(partTitle)
        walk(item.chapters, partTitle ?? part, list)
        continue
      }
      const href = typeof item.href === 'string' ? item.href : typeof item.file === 'string' ? item.file : undefined
      if (href !== undefined) {
        entries.push({ path: normalizeChapterPath(href), part, list, text: typeof item.text === 'string' ? item.text : undefined })
      }
    }
  }

  walk(book?.chapters, undefined, 'chapters')
  walk(book?.appendices, undefined, 'appendices')
  return { entries, emptyParts: [...seenParts], partPages: [...partPages] }
}

function extractChapterPathsLoose(text) {
  const paths = []
  for (const line of text.split(/\r?\n/)) {
    const match = /^\s*-\s+(?:href:\s*)?["']?([^\s"'#]+\.(?:qmd|md|ipynb|Rmd|rmd))["']?\s*$/.exec(line)
    if (match !== null) paths.push(normalizeChapterPath(match[1]))
  }
  return [...new Set(paths)]
}

function parseFrontmatter(lines) {
  if (lines.length === 0 || !/^---\s*$/.test(lines[0])) return 0
  for (let i = 1; i < lines.length; i++) {
    if (/^---\s*$/.test(lines[i])) return i + 1
  }
  return 0
}

/**
 * Scan ATX headings outside YAML frontmatter, fenced code blocks and HTML
 * comments. Returns headings with 1-based source line numbers.
 * @param {string} text
 */
export function scanHeadings(text) {
  const lines = text.split(/\r?\n/)
  const frontmatterEnd = parseFrontmatter(lines)
  const headings = []
  let fence = null
  let inComment = false
  for (let i = frontmatterEnd; i < lines.length; i++) {
    const line = lines[i]
    if (fence !== null) {
      const close = /^\s*(`{3,}|~{3,})\s*$/.exec(line)
      if (close !== null && close[1][0] === fence.char && close[1].length >= fence.length) fence = null
      continue
    }
    const open = /^\s*(`{3,}|~{3,})/.exec(line)
    if (open !== null && !inComment) {
      fence = { char: open[1][0], length: open[1].length }
      continue
    }
    let commentLine = line
    if (inComment) {
      const end = commentLine.indexOf('-->')
      if (end === -1) continue
      commentLine = commentLine.slice(end + 3)
      inComment = false
    }
    while (true) {
      const start = commentLine.indexOf('<!--')
      if (start === -1) break
      const end = commentLine.indexOf('-->', start + 4)
      if (end === -1) {
        commentLine = commentLine.slice(0, start)
        inComment = true
        break
      }
      commentLine = commentLine.slice(0, start) + commentLine.slice(end + 3)
    }
    const heading = /^ {0,3}(#{1,6})\s+(.*?)\s*#*\s*$/.exec(commentLine)
    if (heading === null) continue
    const rawText = heading[2].trim().replace(/\s*\{[#.][^}]*\}\s*$/, '').trim()
    if (rawText === '') continue
    headings.push({ level: heading[1].length, text: rawText, line: i + 1 })
  }
  return headings
}

function hasSectionBody(lines, startLine, endLine) {
  for (let i = startLine; i < endLine; i++) {
    const line = lines[i]?.trim() ?? ''
    if (line === '' || /^<!--/.test(line) || /^-->$/.test(line)) continue
    return true
  }
  return false
}

function addIssue(issues, issue) {
  issues.push({
    severity: issue.severity,
    code: issue.code,
    path: issue.path,
    ...(issue.line === undefined ? {} : { line: issue.line }),
    message: issue.message,
  })
}

function checkHeadings(headings, lines, chapterPath, config, issues) {
  const tocDepth = typeof config?.format?.html?.['toc-depth'] === 'number' ? config.format.html['toc-depth'] : 3
  const seen = new Map()
  let previousLevel = 1
  let h1Count = 0

  for (let i = 0; i < headings.length; i++) {
    const heading = headings[i]
    const normalized = heading.text.replace(/\s+/g, ' ').toLowerCase()
    const path = chapterPath

    if (heading.level === 1) h1Count++
    if (heading.level > previousLevel + 1) {
      addIssue(issues, {
        severity: 'warning',
        code: 'heading-level-skip',
        path,
        line: heading.line,
        message: `标题层级从 H${previousLevel} 跳到 H${heading.level}：“${heading.text}”`,
      })
    } else if (i === 0 && heading.level > 2) {
      addIssue(issues, {
        severity: 'warning',
        code: 'heading-start-level',
        path,
        line: heading.line,
        message: `章内第一个标题是 H${heading.level}；章标题通常用 H1，节从 H2 开始`,
      })
    }
    previousLevel = heading.level

    if (seen.has(normalized)) {
      addIssue(issues, {
        severity: 'warning',
        code: 'duplicate-heading',
        path,
        line: heading.line,
        message: `同章重复标题（首次出现于第 ${seen.get(normalized)} 行）：“${heading.text}”`,
      })
    } else {
      seen.set(normalized, heading.line)
    }

    if (/[。！？；，、]$/.test(heading.text)) {
      addIssue(issues, {
        severity: 'warning',
        code: 'heading-trailing-punctuation',
        path,
        line: heading.line,
        message: `标题末尾带标点：“${heading.text}”`,
      })
    }

    if (/上一节|下一节|上一章|下一章|前文所述|如前所述|后文所述/.test(heading.text)) {
      addIssue(issues, {
        severity: 'warning',
        code: 'heading-relative-reference',
        path,
        line: heading.line,
        message: `标题依赖相对位置：“${heading.text}”；改写成主题名`,
      })
    }

    // Hand-written numbering is a prefix such as "1.1 安装", "一、安装" or
    // "第 2 章 棋盘" followed by the real title. A bare "第一章" is a title.
    if (/^(?:第[〇零一二三四五六七八九十百千0-9]+\s*[章节篇部]\s+|第[0-9]+\s*[章节篇部]|[0-9]+(?:\.[0-9]+)*[.、:：]\s+|[〇零一二三四五六七八九十]+、)/.test(heading.text)) {
      addIssue(issues, {
        severity: 'info',
        code: 'heading-manual-number',
        path,
        line: heading.line,
        message: `标题手写编号：“${heading.text}”；交给 number-sections 或去掉编号`,
      })
    }

    if (heading.level > tocDepth) {
      addIssue(issues, {
        severity: 'info',
        code: 'heading-beyond-toc-depth',
        path,
        line: heading.line,
        message: `H${heading.level} 超出 toc-depth=${tocDepth}，不会出现在目录：“${heading.text}”`,
      })
    }

    if (heading.level >= 2) {
      const next = headings.slice(i + 1).find((candidate) => candidate.level <= heading.level)
      const endLine = next === undefined ? lines.length : next.line - 1
      if (!hasSectionBody(lines, heading.line, endLine)) {
        addIssue(issues, {
          severity: 'warning',
          code: 'empty-section',
          path,
          line: heading.line,
          message: `空节：“${heading.text}”后面没有正文，直到下一个同级标题`,
        })
      }
    }
  }

  if (h1Count > 1) {
    addIssue(issues, {
      severity: 'warning',
      code: 'multiple-h1',
      path: chapterPath,
      message: `一章内有 ${h1Count} 个 H1；每章只保留一个章标题`,
    })
  }
}

async function listQmdFiles(root, limit = 5000) {
  const found = []
  const queue = [{ dir: root, depth: 0 }]
  while (queue.length > 0 && found.length < limit) {
    const { dir, depth } = queue.shift()
    if (depth > 8) continue
    let entries
    try {
      entries = await readdir(dir, { withFileTypes: true })
    } catch {
      continue
    }
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue
      const path = join(dir, entry.name)
      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name)) continue
        queue.push({ dir: path, depth: depth + 1 })
      } else if (entry.isFile() && UNLISTED_EXTENSIONS.has(extname(entry.name).toLowerCase())) {
        found.push(path)
        if (found.length >= limit) break
      }
    }
  }
  return found
}

function renderMarkdown(result) {
  const lines = []
  lines.push(`# Quarto 图书审计：${result.book.title ?? '(未命名)'}`)
  lines.push('')
  lines.push(`- 根目录：\`${result.root}\``)
  lines.push(`- 配置：\`${result.config.path ?? '(缺失)'}\`（解析器：${result.config.parser ?? '—'}）`)
  lines.push(`- 章节：${result.summary.chapters}；标题：${result.summary.headings}；错误 ${result.summary.errors}，警告 ${result.summary.warnings}，提示 ${result.summary.infos}`)
  lines.push('')

  lines.push('## 章节目录')
  if (result.chapters.length === 0) {
    lines.push('')
    lines.push('_没有解析到章节。_')
  }
  for (const chapter of result.chapters) {
    const state = chapter.exists ? '' : ' **（文件缺失）**'
    const part = chapter.part === undefined ? '' : `［${chapter.part}］`
    lines.push('')
    lines.push(`${chapter.index + 1}. ${part}\`${chapter.path}\`${state} — ${chapter.headings.length} 个标题`)
    for (const heading of chapter.headings) {
      const indent = '  '.repeat(Math.max(0, heading.level - 1))
      lines.push(`   ${indent}- H${heading.level} ${heading.text}（第 ${heading.line} 行）`)
    }
  }

  if (result.issues.length > 0) {
    lines.push('')
    lines.push('## 问题')
    for (const issue of result.issues) {
      const where = issue.line === undefined ? issue.path : `${issue.path}:${issue.line}`
      lines.push(`- **${issue.severity.toUpperCase()}** \`${issue.code}\` ${where} — ${issue.message}`)
    }
    if (result.issuesTruncated) lines.push(`- …还有更多问题被截断（上限 ${result.maxIssues}）`)
  }

  if (result.unlisted.length > 0) {
    lines.push('')
    lines.push('## 未列入 `_quarto.yml` 的 qmd')
    for (const path of result.unlisted) lines.push(`- \`${path}\``)
  }

  return lines.join('\n')
}

/**
 * Audit one Quarto book.
 * @param {object} options
 * @param {string} options.root absolute book root
 * @param {boolean} [options.includeUnlisted]
 * @param {number} [options.maxIssues]
 */
export async function auditBook({ root, includeUnlisted = false, maxIssues = MAX_ISSUES }) {
  const issues = []
  const loaded = await loadConfig(root)
  let config = null
  let parser = null
  let configPath = loaded?.path ?? null
  let chapterEntries = []

  if (loaded === null) {
    addIssue(issues, { severity: 'error', code: 'missing-config', path: '_quarto.yml', message: '找不到 _quarto.yml 或 _quarto.yaml' })
  } else if (loaded.error !== undefined) {
    addIssue(issues, {
      severity: 'error',
      code: 'config-unreadable',
      path: toPosix(relative(root, loaded.path)) || loaded.name,
      message: `无法读取配置：${loaded.error instanceof Error ? loaded.error.message : String(loaded.error)}`,
    })
  } else {
    try {
      const parsed = await parseConfig(loaded.text)
      config = parsed.data
      parser = parsed.parser
    } catch (error) {
      parser = 'failed'
      addIssue(issues, {
        severity: 'error',
        code: 'config-parse-error',
        path: toPosix(relative(root, loaded.path)) || loaded.name,
        ...(error instanceof YamlLiteError && typeof error.line === 'number' ? { line: error.line } : {}),
        message: `配置解析失败：${error instanceof Error ? error.message : String(error)}`,
      })
      const loose = extractChapterPathsLoose(loaded.text)
      chapterEntries = loose.map((path) => ({ path, list: 'chapters', part: undefined }))
    }
  }

  const projectType = config?.project?.type
  const book = config?.book ?? null
  if (config !== null && projectType !== 'book') {
    addIssue(issues, {
      severity: 'warning',
      code: 'not-book-project',
      path: toPosix(relative(root, configPath)) || '_quarto.yml',
      message: `project.type 是 ${projectType === undefined ? '未设置' : `"${projectType}"`}，不是 "book"`,
    })
  }
  if (config !== null && (book === null || typeof book !== 'object')) {
    addIssue(issues, {
      severity: 'error',
      code: 'missing-book',
      path: toPosix(relative(root, configPath)) || '_quarto.yml',
      message: '配置里没有 book: 段',
    })
  }

  let emptyParts = []
  let partPages = []
  if (book !== null && typeof book === 'object') {
    const extracted = extractChapters(book)
    chapterEntries = extracted.entries
    emptyParts = extracted.emptyParts
    partPages = extracted.partPages
    if (chapterEntries.length === 0) {
      addIssue(issues, {
        severity: 'error',
        code: 'no-chapters',
        path: toPosix(relative(root, configPath)) || '_quarto.yml',
        message: 'book.chapters 为空或没有可识别的章节条目',
      })
    }
    for (const part of emptyParts) {
      addIssue(issues, {
        severity: 'warning',
        code: 'empty-part',
        path: toPosix(relative(root, configPath)) || '_quarto.yml',
        message: `部“${part}”没有章节`,
      })
    }
  } else if (loaded !== null && chapterEntries.length === 0) {
    const fallback = extractChapterPathsLoose(loaded.text)
    if (fallback.length > 0) {
      chapterEntries = fallback.map((path) => ({ path, list: 'chapters', part: undefined }))
      addIssue(issues, {
        severity: 'info',
        code: 'chapters-loose-parse',
        path: loaded.name,
        message: 'book 段不可解析，章节列表由宽松扫描得出',
      })
    }
  }

  const seenChapters = new Map()
  const chapters = []
  const listed = new Set(partPages)
  for (let index = 0; index < chapterEntries.length; index++) {
    const entry = chapterEntries[index]
    const path = entry.path
    if (seenChapters.has(path)) {
      addIssue(issues, {
        severity: 'warning',
        code: 'duplicate-chapter',
        path,
        message: `章节在配置里重复出现（第 ${seenChapters.get(path) + 1} 项与第 ${index + 1} 项）`,
      })
      continue
    }
    seenChapters.set(path, index)
    listed.add(path)

    const absolute = resolve(root, path)
    const relativeToRoot = toPosix(relative(root, absolute))
    const escapes = relativeToRoot === '..' || relativeToRoot.startsWith('../')
    if (escapes) {
      addIssue(issues, {
        severity: 'warning',
        code: 'chapter-outside-root',
        path,
        message: '章节路径指向图书根目录之外',
      })
    }

    const chapter = { index, path, part: entry.part, list: entry.list, exists: false, headings: [] }
    let text = null
    try {
      text = await readText(absolute, MAX_CHAPTER_BYTES)
      chapter.exists = true
    } catch (error) {
      const reason = error?.code === 'ENOENT' ? '文件不存在' : error instanceof Error ? error.message : String(error)
      addIssue(issues, { severity: 'error', code: 'missing-chapter', path, message: `章节无法读取：${reason}` })
    }

    if (text !== null) {
      const headings = scanHeadings(text)
      chapter.headings = headings
      const lines = text.split(/\r?\n/)
      checkHeadings(headings, lines, path, config, issues)
    }
    chapters.push(chapter)
  }

  const hasIndex = chapterEntries.some((entry) => /(^|\/)index\.(qmd|md)$/i.test(entry.path))
  if (chapterEntries.length > 0 && !hasIndex) {
    addIssue(issues, { severity: 'info', code: 'missing-index', path: '_quarto.yml', message: '章节目录里没有 index.qmd；整本书缺少入口页' })
  }

  let unlisted = []
  if (includeUnlisted) {
    const files = await listQmdFiles(root)
    unlisted = files
      .map((path) => toPosix(relative(root, path)))
      .filter((path) => !listed.has(path))
      .sort()
    if (unlisted.length > 0) {
      addIssue(issues, {
        severity: 'info',
        code: 'unlisted-qmd',
        path: unlisted[0],
        message: `有 ${unlisted.length} 个 qmd 未列入 _quarto.yml（${unlisted.slice(0, 3).join('、')}${unlisted.length > 3 ? '…' : ''}）`,
      })
    }
  }

  issues.sort((a, b) => {
    const severity = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
    if (severity !== 0) return severity
    if (a.path !== b.path) return a.path.localeCompare(b.path)
    return (a.line ?? 0) - (b.line ?? 0)
  })

  const limit = Math.max(1, Math.min(MAX_ISSUES, Number.isFinite(maxIssues) ? Math.trunc(maxIssues) : MAX_ISSUES))
  const truncated = issues.length > limit

  const result = {
    ok: issues.every((issue) => issue.severity !== 'error'),
    root: toPosix(root),
    config: { path: configPath === null ? null : toPosix(relative(root, configPath)) || '_quarto.yml', parser },
    book: {
      title: typeof book?.title === 'string' ? book.title : null,
      subtitle: typeof book?.subtitle === 'string' ? book.subtitle : null,
      projectType: projectType ?? null,
    },
    chapters,
    issues: issues.slice(0, limit),
    issuesTruncated: truncated,
    maxIssues: limit,
    unlisted,
    summary: {
      chapters: chapters.length,
      headings: chapters.reduce((total, chapter) => total + chapter.headings.length, 0),
      errors: issues.filter((issue) => issue.severity === 'error').length,
      warnings: issues.filter((issue) => issue.severity === 'warning').length,
      infos: issues.filter((issue) => issue.severity === 'info').length,
    },
  }
  result.markdown = renderMarkdown(result)
  return result
}

/**
 * Resolve a user-supplied root argument. Missing means "session cwd".
 * @param {string | undefined} input
 * @param {string} cwd
 */
export function resolveBookRoot(input, cwd) {
  const base = typeof cwd === 'string' && cwd.length > 0 ? cwd : process.cwd()
  const root = typeof input === 'string' && input.trim() !== '' ? resolve(base, input.trim()) : resolve(base)
  return root
}
