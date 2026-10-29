// `quarto_render_check`：先判断渲染输出目录是否安全，再在 120 秒内跑一次
// `quarto render`，最后检查产出的 HTML 是否可发布。失败只报告，不自动重新运行。
import { spawn as nodeSpawn } from 'node:child_process'
import { readFile, readdir, realpath, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { BOOK_PROJECT_RE, findBookRoot, hasBookSource } from '../workspace.js'

const PACKAGE_ROOT = path.dirname(path.dirname(path.dirname(fileURLToPath(import.meta.url))))
const SKILL_DIR = path.join(PACKAGE_ROOT, 'skills', 'writing-quarto')
const DEFAULT_OUTPUT_DIR = '_book'
const QUARTO_TIMEOUT_MS = 120_000
const PYTHON_TIMEOUT_MS = 60_000
const MAX_OUTPUT_FILES = 30
const MAX_CAPTURED_OUTPUT = 12_000
const MAX_HTML_FILES = 1_000
const MAX_HTML_BYTES = 8 * 1024 * 1024
const MAX_HTML_TOTAL_BYTES = 64 * 1024 * 1024
// 只收多字乱码序列。单字（如「璇」「浣」「熨」）在正常中文里也会出现，
// 拿它们当特征会把合法页面判成乱码。
const MOJIBAKE_MARKERS = ['锟斤拷', '烫烫烫', '屯屯屯', 'â€', 'Ã¤', 'Ã©', 'ï¼', '锘匡']

export type CheckStatus = 'pass' | 'fail' | 'skip'

export interface CheckResult {
  id: string
  status: CheckStatus
  detail: string
}

export interface HtmlReport {
  usable: boolean
  checks: CheckResult[]
  output_files: string[]
  output_files_total: number
}

export interface RenderResult {
  ok: boolean
  exit_code: number | null
  duration_ms: number
  output: string
}

export interface RenderCheckResult {
  warnings: string[]
  errors: string[]
  safe_to_render: boolean
  suggested_output_dir: string
  render_result: RenderResult | null
  html_report: HtmlReport | null
}

interface SpawnedProcess {
  pid?: number
  stdout?: { on: (event: 'data', listener: (chunk: Buffer | string) => void) => unknown } | null
  stderr?: { on: (event: 'data', listener: (chunk: Buffer | string) => void) => unknown } | null
  on(event: 'error', listener: (error: Error) => void): unknown
  on(event: 'close', listener: (code: number | null) => void): unknown
  kill: (signal?: string) => boolean
}

export type SpawnLike = (
  command: string,
  args: string[],
  options: {
    cwd: string
    windowsHide?: boolean
    shell?: boolean
    signal?: AbortSignal
    detached?: boolean
  },
) => SpawnedProcess

interface ProcessResult {
  ok: boolean
  missing: boolean
  code: number | null
  output: string
  duration_ms: number
}

export interface RunRenderCheckInput {
  root: string
  qmdPath: string
  dryRun: boolean
  spawn?: SpawnLike
  python?: string
  timeoutMs?: number
  signal?: AbortSignal
}

interface ToolExec {
  agent?: { session?: { header?: { cwd?: string } } }
  signal?: AbortSignal
}

interface ToolDefinition {
  name: string
  description: string
  parameters: Record<string, unknown>
  output: {
    schema: Record<string, unknown>
    render: (args: Record<string, unknown>, value: RenderCheckResult) => Array<{ type: 'text'; text: string }>
    presentationMeta?: (args: Record<string, unknown>, value: RenderCheckResult) => Record<string, unknown>
  }
  execute: (args: { qmd_path: string; dry_run: boolean }, exec: ToolExec) => Promise<RenderCheckResult>
  presentCall?: (args: { qmd_path: string; dry_run: boolean }) => Record<string, unknown>
  presentResult?: (
    args: { qmd_path: string; dry_run: boolean },
    result: { content: Array<{ type: 'text'; text: string }> },
  ) => Record<string, unknown>
}

export interface ToolRegistry<T = unknown> {
  register: (definition: T) => unknown
}

export function stripQuotes(value: string): string {
  const trimmed = value.trim()
  if (trimmed.length >= 2) {
    const first = trimmed[0]
    const last = trimmed[trimmed.length - 1]
    if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
      return trimmed.slice(1, -1)
    }
  }
  return trimmed
}

/** 解析 YAML 单行标量：去掉成对引号，再剥掉未引用值末尾的 ` # 注释`。 */
function parseConfigScalar(raw: string): string {
  const trimmed = raw.trim()
  const quote = trimmed[0]
  if (quote === '"' || quote === "'") {
    const end = trimmed.lastIndexOf(quote)
    if (end > 0) return trimmed.slice(1, end)
  }
  const comment = /\s+#/.exec(trimmed)
  return (comment ? trimmed.slice(0, comment.index) : trimmed).trimEnd()
}

function configValue(yaml: string, key: string): string | undefined {
  const pattern = new RegExp(`^[\\t ]*${key}:[\\t ]*(.*)$`)
  for (const line of yaml.split(/\r?\n/)) {
    if (/^[\t ]*#/.test(line)) continue
    const match = pattern.exec(line)
    if (match) return parseConfigScalar(match[1])
  }
  return undefined
}

/** Quarto 的搜索默认开启；只有显式关掉（false/no/off）才跳过索引检查。 */
function searchEnabled(yaml: string): boolean {
  const value = configValue(yaml, 'search')
  return value === undefined || !/^(?:false|no|off)$/i.test(value)
}

export interface OutputDirDecision {
  safe: boolean
  value: string
  resolved: string
  warning?: string
}

/**
 * `project.output-dir` 只能落在书根内部，且不能就是书根自身。
 * `./`、`.`、绝对路径和带 `..` 的路径都会让渲染覆盖源文件或写到书外。
 */
export function evaluateOutputDir(root: string, yaml: string): OutputDirDecision {
  const value = configValue(yaml, 'output-dir') ?? DEFAULT_OUTPUT_DIR
  const resolved = path.resolve(root, value)
  const relative = path.relative(root, resolved)
  if (value === '' || resolved === path.resolve(root)) {
    return {
      safe: false,
      value,
      resolved,
      warning: `project.output-dir 是 \`${value || '(空)'}\`，渲染会覆盖书根。改成 \`output-dir: ${DEFAULT_OUTPUT_DIR}\` 后再查。`,
    }
  }
  if (path.isAbsolute(value) || value.startsWith('~')) {
    return {
      safe: false,
      value,
      resolved,
      warning: `project.output-dir 是绝对路径 \`${value}\`，渲染会写到书外。改成 \`output-dir: ${DEFAULT_OUTPUT_DIR}\` 后再查。`,
    }
  }
  if (relative === '' || relative === '..' || relative.startsWith(`..${path.sep}`)) {
    return {
      safe: false,
      value,
      resolved,
      warning: `project.output-dir 是 \`${value}\`，落在书根之外。改成 \`output-dir: ${DEFAULT_OUTPUT_DIR}\` 后再查。`,
    }
  }
  return { safe: true, value, resolved }
}

async function nearestExistingRealPath(target: string): Promise<string | undefined> {
  let current = path.resolve(target)
  while (true) {
    try {
      return await realpath(current)
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code
      if (code !== 'ENOENT' && code !== 'ENOTDIR') return undefined
      const parent = path.dirname(current)
      if (parent === current) return undefined
      current = parent
    }
  }
}

/** 输出目录或其最近的现存父目录经符号链接解析后仍须落在书根内。 */
async function outputDirEscapesRoot(root: string, resolved: string): Promise<boolean> {
  const realRoot = await nearestExistingRealPath(root)
  const realTarget = await nearestExistingRealPath(resolved)
  if (!realRoot || !realTarget) return true
  const relative = path.relative(realRoot, realTarget)
  return relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)
}

function killProcessTree(child: SpawnedProcess, cwd: string, spawnFn: SpawnLike): void {
  const pid = child.pid
  if (pid && process.platform === 'win32') {
    // Windows 上只杀直接子进程会留下 Quarto 派生的 pandoc/python。
    try {
      const killer = spawnFn('taskkill', ['/pid', String(pid), '/T', '/F'], {
        cwd,
        windowsHide: true,
        shell: false,
      })
      // taskkill 启动失败会走异步 error；不监听会成为未处理错误。
      killer.on('error', () => {
        // 下面仍会尝试 child.kill，这里只保证异步错误有出口。
      })
    } catch {
      // taskkill 不可用时退回 child.kill。
    }
  } else if (pid && process.platform !== 'win32') {
    // runProcess 用 detached 启动，负 pid 表示整个进程组。
    try {
      process.kill(-pid, 'SIGKILL')
      return
    } catch {
      // 进程组可能已退出，退回 child.kill。
    }
  }
  try {
    child.kill()
  } catch {
    // 进程可能已经退出。
  }
}

function runProcess(
  command: string,
  args: string[],
  cwd: string,
  timeoutMs: number,
  spawnFn: SpawnLike,
  signal?: AbortSignal,
): Promise<ProcessResult> {
  return new Promise((resolve) => {
    if (signal?.aborted) {
      resolve({ ok: false, missing: false, code: null, output: '已取消。', duration_ms: 0 })
      return
    }
    const started = Date.now()
    let settled = false
    let output = ''
    let child: SpawnedProcess
    const onAbort = () => {
      killProcessTree(child, cwd, spawnFn)
      finish({ ok: false, missing: false, code: null, output: '已取消。', duration_ms: Date.now() - started })
    }
    const finish = (result: ProcessResult) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      signal?.removeEventListener('abort', onAbort)
      resolve(result)
    }
    const append = (chunk: Buffer | string) => {
      output += String(chunk)
      if (output.length > MAX_CAPTURED_OUTPUT) output = output.slice(-MAX_CAPTURED_OUTPUT)
    }
    let timer: NodeJS.Timeout
    try {
      child = spawnFn(command, args, {
        cwd,
        windowsHide: true,
        shell: false,
        signal,
        detached: process.platform !== 'win32',
      })
    } catch (error) {
      resolve({ ok: false, missing: true, code: null, output: error instanceof Error ? error.message : String(error), duration_ms: Date.now() - started })
      return
    }
    signal?.addEventListener('abort', onAbort, { once: true })
    timer = setTimeout(() => {
      killProcessTree(child, cwd, spawnFn)
      finish({
        ok: false,
        missing: false,
        code: null,
        output: `${output}\n超时：${Math.round(timeoutMs / 1000)} 秒内没有结束。`,
        duration_ms: Date.now() - started,
      })
    }, timeoutMs)
    child.stdout?.on('data', append)
    child.stderr?.on('data', append)
    child.on('error', (error) => {
      const missing = (error as NodeJS.ErrnoException).code === 'ENOENT'
      finish({ ok: false, missing, code: null, output: error.message, duration_ms: Date.now() - started })
    })
    child.on('close', (code) => {
      finish({ ok: code === 0, missing: false, code, output, duration_ms: Date.now() - started })
    })
  })
}

async function runPython(
  script: string,
  args: string[],
  root: string,
  explicitPython: string | undefined,
  spawnFn: SpawnLike,
  signal?: AbortSignal,
): Promise<ProcessResult> {
  const candidates = [explicitPython, process.env.PYTHON, 'python3', 'python'].filter(
    (item): item is string => typeof item === 'string' && item.trim() !== '',
  )
  let last: ProcessResult = { ok: false, missing: true, code: null, output: `找不到 Python 解释器：${script}`, duration_ms: 0 }
  let executedFailure: ProcessResult | undefined
  for (const candidate of [...new Set(candidates)]) {
    const result = await runProcess(candidate, [script, ...args], root, PYTHON_TIMEOUT_MS, spawnFn, signal)
    if (result.ok) return result
    last = result
    // 坏解释器（例如 Windows Store 占位符）会启动成功但退出非 0；
    // 先记住它的输出，再继续试下一个候选，避免只调用一个坏解释器就判书失败。
    if (!result.missing && result.code !== null) executedFailure = result
  }
  return executedFailure ?? last
}

function pythonEnvironmentFailure(result: ProcessResult): boolean {
  if (result.missing || result.code === null) return true
  const text = result.output.toLowerCase()
  return (
    result.code === 9009 ||
    text.includes('enoent') ||
    text.includes('不是内部或外部命令') ||
    text.includes('command not found') ||
    text.includes('no such file')
  )
}

function truncate(value: string, max = 180): string {
  const collapsed = value.replace(/\s+/g, ' ').trim()
  return collapsed.length > max ? `${collapsed.slice(0, max - 1)}…` : collapsed
}

function lastMeaningfulLine(value: string): string {
  const lines = value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
  return lines.length > 0 ? truncate(lines[lines.length - 1]) : '没有输出'
}

async function listHtmlFiles(dir: string): Promise<string[]> {
  const files: string[] = []
  async function walk(current: string): Promise<void> {
    let entries
    try {
      entries = await readdir(current, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      const target = path.join(current, entry.name)
      if (entry.isDirectory()) await walk(target)
      else if (entry.isFile() && entry.name.toLowerCase().endsWith('.html')) files.push(target)
    }
  }
  await walk(dir)
  return files.sort((a, b) => a.localeCompare(b))
}

function relativeTo(root: string, file: string): string {
  return path.relative(root, file).split(path.sep).join('/')
}

async function readUtf8(file: string): Promise<string | undefined> {
  try {
    const info = await stat(file)
    if (info.size > MAX_HTML_BYTES) return undefined
    const bytes = await readFile(file)
    if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) return undefined
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  } catch {
    return undefined
  }
}

function containsScaffold(text: string): boolean {
  return text.toLowerCase().includes('code-copy-outer-scaffold')
}

function parseDomLines(output: string): CheckResult[] {
  const results: CheckResult[] = []
  for (const line of output.split(/\r?\n/)) {
    const match = /^(OK|FAIL)\s+(C\d+)\b\s*(.*)$/.exec(line.trim())
    if (!match) continue
    results.push({
      id: match[2],
      status: match[1] === 'OK' ? 'pass' : 'fail',
      detail: truncate(match[3] || match[1]),
    })
  }
  return results
}

export async function inspectHtml(input: {
  root: string
  outputDir: string
  yaml: string
  spawn?: SpawnLike
  python?: string
  signal?: AbortSignal
}): Promise<{ report: HtmlReport; errors: string[] }> {
  const spawnFn = input.spawn ?? (nodeSpawn as unknown as SpawnLike)
  const htmlFiles = await listHtmlFiles(input.outputDir)
  const relativeFiles = htmlFiles.map((file) => relativeTo(input.outputDir, file))
  const outputFiles = relativeFiles.slice(0, MAX_OUTPUT_FILES)
  const errors: string[] = []
  const checks: CheckResult[] = []
  const index = path.join(input.outputDir, 'index.html')
  const indexPath = relativeTo(input.root, index)
  let indexText: string | undefined
  let indexDetail: string
  try {
    const indexStat = await stat(index)
    if (indexStat.size > MAX_HTML_BYTES) {
      indexDetail = `${indexPath} 超过 ${Math.round(MAX_HTML_BYTES / 1024 / 1024)} MiB，未读`
      errors.push(`${indexPath} 太大，未读`)
    } else {
      indexText = await readUtf8(index)
      indexDetail =
        indexText === undefined ? `缺少可读的 ${indexPath}` : `${indexPath} 已生成`
    }
  } catch {
    indexDetail = `缺少可读的 ${indexPath}`
  }

  checks.push({
    id: 'index_html',
    status: indexText === undefined ? 'fail' : 'pass',
    detail: indexDetail,
  })

  const broken: string[] = []
  const fileUris: string[] = []
  let scaffoldFound = false
  let scannedBytes = 0
  let sizeLimited = false
  const scanFiles = htmlFiles.slice(0, MAX_HTML_FILES)
  for (const file of scanFiles) {
    const relative = relativeTo(input.outputDir, file)
    let size = 0
    try {
      size = (await stat(file)).size
    } catch {
      broken.push(`${relative} 无法读取`)
      errors.push(`${relative} 无法读取`)
      continue
    }
    if (size > MAX_HTML_BYTES) {
      broken.push(`${relative} 超过 ${Math.round(MAX_HTML_BYTES / 1024 / 1024)} MiB，未读`)
      errors.push(`${relative} 太大，未读`)
      continue
    }
    if (scannedBytes + size > MAX_HTML_TOTAL_BYTES) {
      sizeLimited = true
      errors.push(`HTML 总量超过 ${Math.round(MAX_HTML_TOTAL_BYTES / 1024 / 1024)} MiB，检查提前结束`)
      break
    }
    scannedBytes += size
    const text = await readUtf8(file)
    if (text === undefined) {
      broken.push(`${relative} 不是 UTF-8 或带 BOM`)
      errors.push(`${relative} 读取失败或不是 UTF-8`)
      continue
    }
    if (text.includes('\ufffd')) {
      broken.push(`${relative} 含 U+FFFD 替换符`)
    } else {
      const marker = MOJIBAKE_MARKERS.find((item) => text.includes(item))
      if (marker) broken.push(`${relative} 命中乱码特征「${marker}」`)
    }
    if (/(?:href|src)\s*=\s*["'][^"']*file:\/\/\//i.test(text)) fileUris.push(relative)
    if (!scaffoldFound && containsScaffold(text)) scaffoldFound = true
  }
  checks.push({
    id: 'html_files',
    status: htmlFiles.length > MAX_HTML_FILES || sizeLimited ? 'fail' : 'pass',
    detail:
      htmlFiles.length > MAX_HTML_FILES
        ? `HTML 文件 ${htmlFiles.length} 个，超过上限 ${MAX_HTML_FILES}`
        : sizeLimited
          ? `HTML 总量超过 ${Math.round(MAX_HTML_TOTAL_BYTES / 1024 / 1024)} MiB`
          : `${htmlFiles.length} 个 HTML 在检查上限内`,
  })
  checks.push({
    id: 'utf8',
    status: htmlFiles.length === 0 ? 'skip' : broken.length === 0 ? 'pass' : 'fail',
    detail:
      htmlFiles.length === 0
        ? '没有 HTML 可检查'
        : broken.length === 0
          ? `${htmlFiles.length} 个 HTML 都是 UTF-8，无 BOM 与替换符`
          : broken.slice(0, 3).join('；'),
  })

  const hasCharset = indexText !== undefined && /charset\s*=\s*["']?utf-8/i.test(indexText)
  checks.push({
    id: 'charset',
    status: indexText === undefined ? 'skip' : hasCharset ? 'pass' : 'fail',
    detail:
      indexText === undefined
        ? '首页不可读，跳过 charset'
        : hasCharset
          ? '首页声明 charset=utf-8'
          : '首页缺少 charset=utf-8 声明',
  })

  checks.push({
    id: 'no_file_uri',
    status: htmlFiles.length === 0 ? 'skip' : fileUris.length === 0 ? 'pass' : 'fail',
    detail:
      htmlFiles.length === 0
        ? '没有 HTML 可检查'
        : fileUris.length === 0
          ? '没有 file:/// 本地绝对路径'
          : `含 file:///：${fileUris.slice(0, 3).join('、')}`,
  })

  const siteUrl = configValue(input.yaml, 'site-url')
  if (!siteUrl) {
    checks.push({ id: 'sitemap', status: 'skip', detail: '未配置 book.site-url，不要求 sitemap.xml' })
  } else {
    const sitemap = path.join(input.outputDir, 'sitemap.xml')
    const sitemapText = await readUtf8(sitemap)
    checks.push({
      id: 'sitemap',
      status: sitemapText && sitemapText.includes('<loc>') ? 'pass' : 'fail',
      detail:
        sitemapText === undefined
          ? '配置了 site-url，但缺少 sitemap.xml'
          : sitemapText.includes('<loc>')
            ? 'sitemap.xml 已生成且含 <loc>'
            : 'sitemap.xml 没有 <loc> 条目',
    })
  }

  if (!searchEnabled(input.yaml)) {
    checks.push({ id: 'search_index', status: 'skip', detail: '书配置显式关闭搜索，不要求 search.json' })
  } else {
    const searchIndex = path.join(input.outputDir, 'search.json')
    const searchText = await readUtf8(searchIndex)
    let parsed = false
    if (searchText !== undefined) {
      try {
        const value = JSON.parse(searchText) as unknown
        parsed = Array.isArray(value)
          ? value.length > 0
          : Boolean(value) && Array.isArray((value as { docs?: unknown }).docs)
      } catch {
        parsed = false
      }
    }
    checks.push({
      id: 'search_index',
      status: parsed ? 'pass' : 'fail',
      detail:
        searchText === undefined
          ? '打开了搜索，但缺少 search.json'
          : parsed
            ? 'search.json 已生成且含索引条目'
            : 'search.json 不是非空索引 JSON',
    })
  }

  const calloutsScript = path.join(SKILL_DIR, 'scripts', 'checking-callouts.py')
  const callouts = await runPython(
    calloutsScript,
    ['--root', input.root, '--book-dir', input.outputDir],
    input.root,
    input.python,
    spawnFn,
    input.signal,
  )
  checks.push({
    id: 'callouts',
    status: pythonEnvironmentFailure(callouts) ? 'skip' : callouts.ok ? 'pass' : 'fail',
    detail: pythonEnvironmentFailure(callouts)
      ? `未运行 checking-callouts.py：${lastMeaningfulLine(callouts.output)}`
      : callouts.ok
        ? lastMeaningfulLine(callouts.output)
        : `checking-callouts.py：${lastMeaningfulLine(callouts.output)}`,
  })
  if (pythonEnvironmentFailure(callouts)) {
    errors.push(`checking-callouts.py 未运行：${lastMeaningfulLine(callouts.output)}`)
  }

  if (!scaffoldFound) {
    for (const name of await listCssFiles(input.outputDir)) {
      const text = await readUtf8(name)
      if (text && containsScaffold(text)) {
        scaffoldFound = true
        break
      }
    }
  }
  if (!scaffoldFound) {
    checks.push({ id: 'dom', status: 'skip', detail: '产物没有主题脚手架类，跳过 DOM 契约' })
  } else {
    const domScript = path.join(SKILL_DIR, 'scripts', 'checking-dom.py')
    const dom = await runPython(
      domScript,
      ['--root', input.root, '--book-dir', input.outputDir],
      input.root,
      input.python,
      spawnFn,
      input.signal,
    )
    // C1/C2 依赖主题 CSS，C6/C7/C8 依赖主题资产；没有 theme/ 的书只跑通用契约。
    const hasTheme = await isDirectory(path.join(input.root, 'theme'))
    const universal = ['C3', 'C5', 'C9']
    const themeOwned = ['C1', 'C2', 'C6', 'C7', 'C8']
    const selected = parseDomLines(dom.output).filter((item) =>
      universal.includes(item.id) || (hasTheme && themeOwned.includes(item.id)),
    )
    const failed = selected.filter((item) => item.status === 'fail')
    const domUnavailable = pythonEnvironmentFailure(dom)
    checks.push({
      id: 'dom',
      status: domUnavailable ? 'skip' : selected.length === 0 ? 'fail' : failed.length === 0 ? 'pass' : 'fail',
      detail: domUnavailable
        ? `未运行 checking-dom.py：${lastMeaningfulLine(dom.output)}`
        : selected.length === 0
          ? `checking-dom.py 没有返回可解析的契约行：${lastMeaningfulLine(dom.output)}`
          : failed.length === 0
            ? hasTheme
              ? `${selected.length} 项 DOM 契约通过`
              : `${selected.length} 项通用 DOM 契约通过（无 theme/，跳过主题契约）`
            : `${failed.map((item) => `${item.id} ${item.detail}`).join('；')}`,
    })
    if (domUnavailable) errors.push(`checking-dom.py 未运行：${lastMeaningfulLine(dom.output)}`)
  }

  const usable = checks.every((check) => check.status !== 'fail')
  return {
    report: {
      usable,
      checks,
      output_files: outputFiles,
      output_files_total: relativeFiles.length,
    },
    errors,
  }
}

async function isDirectory(dir: string): Promise<boolean> {
  try {
    return (await stat(dir)).isDirectory()
  } catch {
    return false
  }
}

async function listCssFiles(dir: string): Promise<string[]> {
  const files: string[] = []
  async function walk(current: string): Promise<void> {
    let entries
    try {
      entries = await readdir(current, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      const target = path.join(current, entry.name)
      if (entry.isDirectory()) await walk(target)
      else if (entry.isFile() && entry.name.toLowerCase().endsWith('.css')) files.push(target)
    }
  }
  await walk(dir)
  return files.sort((a, b) => a.localeCompare(b))
}

function renderErrorText(result: RenderResult): string {
  const tail = result.output.trim()
  if (!tail) return `quarto render 退出码 ${result.exit_code ?? '未知'}，没有输出。`
  // 只保留输出末尾；truncate 从头截断，不能直接拿整段输出调用。
  return truncate(tail.slice(-500), 500)
}

export async function runRenderCheck(input: RunRenderCheckInput): Promise<RenderCheckResult> {
  const root = path.resolve(input.root)
  const warnings: string[] = []
  const errors: string[] = []
  const result: RenderCheckResult = {
    warnings,
    errors,
    safe_to_render: false,
    suggested_output_dir: DEFAULT_OUTPUT_DIR,
    render_result: null,
    html_report: null,
  }

  let yaml: string
  try {
    yaml = await readFile(path.join(root, '_quarto.yml'), 'utf8')
  } catch {
    warnings.push(`书根 ${root} 没有 _quarto.yml，无法判断渲染输出目录。`)
    return result
  }
  if (!BOOK_PROJECT_RE.test(yaml)) {
    warnings.push(`书根 ${root} 的 _quarto.yml 没有声明 type: book；quarto_render_check 只服务 Quarto Book 项目。`)
    return result
  }
  if (!(await hasBookSource(root))) {
    warnings.push(`书根 ${root} 没有 .qmd 或 .md 源文件；没有可渲染的章节。`)
    return result
  }

  const qmdPath = path.resolve(root, input.qmdPath)
  try {
    await stat(qmdPath)
  } catch {
    warnings.push(`检查入口 ${input.qmdPath} 不存在，仍按书根执行渲染检查。`)
  }

  const output = evaluateOutputDir(root, yaml)
  if (!output.safe) {
    warnings.push(output.warning ?? '渲染输出目录不安全。')
    return result
  }
  if (await outputDirEscapesRoot(root, output.resolved)) {
    warnings.push(
      `project.output-dir \`${output.value}\` 经符号链接解析后落在书根之外；渲染会写到书外。改回书根内的普通目录后再查。`,
    )
    return result
  }
  result.safe_to_render = true
  if (input.dryRun) return result

  const renderResult = await runProcess(
    'quarto',
    ['render'],
    root,
    input.timeoutMs ?? QUARTO_TIMEOUT_MS,
    input.spawn ?? (nodeSpawn as unknown as SpawnLike),
    input.signal,
  )
  result.render_result = {
    ok: renderResult.ok,
    exit_code: renderResult.code,
    duration_ms: renderResult.duration_ms,
    output: truncate(renderResult.output, MAX_CAPTURED_OUTPUT),
  }
  if (!renderResult.ok) {
    if (renderResult.missing) {
      errors.push('找不到 quarto 可执行文件；把 Quarto 加入 PATH 后重试。')
    } else if (renderResult.code === null) {
      errors.push(`渲染没有正常结束：${renderErrorText(result.render_result)}`)
    } else {
      errors.push(`渲染失败（退出码 ${renderResult.code}）：${renderErrorText(result.render_result)}`)
    }
    return result
  }

  const inspected = await inspectHtml({
    root,
    outputDir: output.resolved,
    yaml,
    spawn: input.spawn,
    python: input.python,
    signal: input.signal,
  })
  result.html_report = inspected.report
  errors.push(...inspected.errors)
  return result
}

function reportLine(check: CheckResult): string {
  return `${check.status}  ${check.id}：${check.detail}`
}

function cardLines(value: RenderCheckResult): string[] {
  const lines = [renderSummary(value)]
  if (value.warnings.length > 1) lines.push(...value.warnings.slice(1))
  if (value.errors.length > 0) lines.push(...value.errors)
  if (value.html_report) {
    lines.push(...value.html_report.checks.map(reportLine))
    const indexCheck = value.html_report.checks.find((check) => check.id === 'index_html')
    lines.push(`首页：${indexCheck?.status === 'pass' ? '已生成' : '未生成'}`)
  }
  return lines
}

function renderSummary(value: RenderCheckResult): string {
  if (!value.safe_to_render) {
    return `未渲染。${value.warnings[0] ?? '渲染输出目录不安全。'}`
  }
  if (!value.render_result) {
    return `可渲染：输出目录安全，dry_run 未执行 quarto render。建议输出目录 ${value.suggested_output_dir}。`
  }
  if (!value.render_result.ok) {
    return value.errors[0] ?? renderErrorText(value.render_result)
  }
  if (!value.html_report) {
    return '渲染完成，但没有生成 HTML 报告。'
  }
  const failed = value.html_report.checks.filter((check) => check.status === 'fail')
  if (value.html_report.usable) {
    return `渲染完成，HTML 可用；检查了 ${value.html_report.output_files_total} 个 HTML。`
  }
  return `渲染完成，HTML 不可用：${failed.map((check) => `${check.id}（${check.detail}）`).join('；')}`
}

const REPORT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    usable: { type: 'boolean' },
    checks: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          id: { type: 'string' },
          status: { type: 'string', enum: ['pass', 'fail', 'skip'] },
          detail: { type: 'string' },
        },
        required: ['id', 'status', 'detail'],
      },
    },
    output_files: { type: 'array', items: { type: 'string' } },
    output_files_total: { type: 'integer' },
  },
  required: ['usable', 'checks', 'output_files', 'output_files_total'],
}

const RESULT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    warnings: { type: 'array', items: { type: 'string' } },
    errors: { type: 'array', items: { type: 'string' } },
    safe_to_render: { type: 'boolean' },
    suggested_output_dir: { type: 'string' },
    render_result: {
      oneOf: [
        { type: 'null' },
        {
          type: 'object',
          additionalProperties: false,
          properties: {
            ok: { type: 'boolean' },
            exit_code: { oneOf: [{ type: 'integer' }, { type: 'null' }] },
            duration_ms: { type: 'integer' },
            output: { type: 'string' },
          },
          required: ['ok', 'exit_code', 'duration_ms', 'output'],
        },
      ],
    },
    html_report: { oneOf: [{ type: 'null' }, REPORT_SCHEMA] },
  },
  required: ['warnings', 'errors', 'safe_to_render', 'suggested_output_dir', 'render_result', 'html_report'],
}

function refusedResult(warning: string): RenderCheckResult {
  return {
    warnings: [warning],
    errors: [],
    safe_to_render: false,
    suggested_output_dir: DEFAULT_OUTPUT_DIR,
    render_result: null,
    html_report: null,
  }
}

export function registerRenderCheckTool(tools: ToolRegistry<ToolDefinition>): void {
  tools.register({
    name: 'quarto_render_check',
    description:
      '检查 Quarto Book 的渲染输出目录、最多运行一次 quarto render 并返回 HTML 可用性报告，非书项目直接拒绝。',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        qmd_path: {
          type: 'string',
          description: '当前检查的 qmd 路径，用于卡片定位；相对路径按会话 cwd 解析。',
        },
        dry_run: {
          type: 'boolean',
          description: 'true 只做安全检查，不渲染；false 才执行一次 quarto render。',
        },
      },
      required: ['qmd_path', 'dry_run'],
    },
    output: {
      schema: RESULT_SCHEMA,
      render: (_args, value) => [{ type: 'text', text: cardLines(value).join('\n') }],
      presentationMeta: (_args, value) => ({
        summary: renderSummary(value),
        usable: value.html_report?.usable ?? false,
        lines: cardLines(value),
      }),
    },
    async execute(args, exec) {
      const cwd = exec?.agent?.session?.header?.cwd
      if (typeof cwd !== 'string' || cwd.trim() === '') {
        return refusedResult('当前会话没有 cwd；quarto_render_check 只在 Quarto Book 项目的会话 cwd 内工作。')
      }
      const qmdPath = path.resolve(cwd, args.qmd_path)
      const root = (await findBookRoot(cwd)) ?? (await findBookRoot(path.dirname(qmdPath)))
      if (!root) {
        return refusedResult('当前会话不在 Quarto Book 项目内：需要 git checkout、_quarto.yml 的 type: book，以及至少一个 .qmd 或 .md 源文件。')
      }
      return runRenderCheck({ root, qmdPath, dryRun: args.dry_run, signal: exec?.signal })
    },
    presentCall(args) {
      return {
        card: 'generic',
        title: 'Quarto 渲染检查',
        kind: 'execute',
        locations: [{ path: args.qmd_path }],
        rawInput: args.qmd_path,
        content: [
          {
            type: 'text',
            text: `${args.qmd_path}（dry_run: ${args.dry_run}）`,
          },
        ],
      }
    },
    presentResult(_args, result) {
      return {
        card: 'generic',
        title: 'Quarto 渲染检查',
        content: result.content,
      }
    },
  })
}

export { DEFAULT_OUTPUT_DIR, QUARTO_TIMEOUT_MS }
