// 发布前自检：版本号、cordis 补丁名和 npm 包内容必须一致。
// 只读 package.json、两份 README、cordis.patch.yml 和 npm pack 的 dry-run 清单。
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'))
const failures = []

function requireText(file, needle, label) {
  const text = readFileSync(path.join(root, file), 'utf8')
  if (!text.includes(needle)) failures.push(`${file} 缺少${label}：${needle}`)
}

const version = pkg.version
for (const readme of ['README.md', 'README.en.md']) {
  requireText(readme, `@${version}`, '当前版本安装命令')
  requireText(readme, `#v${version}`, '当前版本 tag')
}

const patch = readFileSync(path.join(root, 'cordis.patch.yml'), 'utf8')
const patchName = /name:\s*['"]?([^'"\s]+)['"]?/.exec(patch)?.[1]
if (patchName !== pkg.name) {
  failures.push(`cordis.patch.yml 的 name=${patchName ?? '缺失'} 与 package.json 的 ${pkg.name} 不一致`)
}

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const npmCli = process.env.npm_execpath
let raw = ''
try {
  const command = npmCli ? process.execPath : npmCommand
  const args = npmCli ? [npmCli, 'pack', '--dry-run', '--json', '--ignore-scripts'] : ['pack', '--dry-run', '--json', '--ignore-scripts']
  raw = execFileSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    // 只有直接运行脚本、拿不到 npm_execpath 时，Windows 才退回 .cmd + shell。
    shell: !npmCli && process.platform === 'win32',
  })
} catch (error) {
  failures.push(`npm pack --dry-run 失败：${error instanceof Error ? error.message : String(error)}`)
}
const start = raw.indexOf('[')
const end = raw.lastIndexOf(']')
let files = []
if (start >= 0 && end > start) {
  try {
    const parsed = JSON.parse(raw.slice(start, end + 1))
    files = Array.isArray(parsed) && parsed[0]?.files ? parsed[0].files.map((item) => item.path) : []
  } catch (error) {
    failures.push(`无法解析 npm pack --json：${error instanceof Error ? error.message : String(error)}`)
  }
}

const required = [
  'lib/index.js',
  'cordis.patch.yml',
  'README.md',
  'README.en.md',
  'LICENSE',
  'icon.svg',
  'skills/writing-quarto/SKILL.md',
  'skills/designing-theme/SKILL.md',
  'templates/quarto-book-project/SKILL.md',
]
for (const file of required) {
  if (!files.includes(file)) failures.push(`发布包缺少必需文件：${file}`)
}
for (const file of files) {
  if (/^(?:temp|docs|tests|src|scripts|\.github)\//.test(file) || file === 'package-lock.json') {
    failures.push(`发布包混入开发文件：${file}`)
  }
}

if (failures.length > 0) {
  console.error(`发布包自检失败（${failures.length} 项）：`)
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}
console.log(`package check passed：${files.length} 个文件，版本与 cordis 补丁一致。`)
