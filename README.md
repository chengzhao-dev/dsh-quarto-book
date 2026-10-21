# dsh-quarto-book

[![publish](https://github.com/chengzhao-dev/dsh-quarto-book/actions/workflows/publish.yml/badge.svg)](https://github.com/chengzhao-dev/dsh-quarto-book/actions/workflows/publish.yml)

[English](https://github.com/chengzhao-dev/dsh-quarto-book/blob/main/README.en.md) | **简体中文**

为 Quarto Book 写章节、校验结构并维护可复用主题；不改业务代码，只在 `type: book` 的仓库里出现。

- 写 `.qmd`：`writing-quarto` 管章节骨架、结构与行文。
- 改主题：`designing-theme` 管 CSS、字体与 palette。
- 渲染后检查 HTML：`quarto_render_check` 判一次可发布性，`quarto_pass_report` 出收尾回执。

## 提供什么

| 名称 | 用途 | 不做什么 |
| --- | --- | --- |
| `writing-quarto` | 新建或修改 `content/**/*.qmd`、`index.qmd`、`_quarto.yml`；章节骨架、中文行文、代码与图表、内容检查 | 不改 CSS、字体和颜色 |
| `designing-theme` | 调整主题的 CSS、SCSS、字体、palette、导航与 Callout 样式 | 不改章节正文 |
| `quarto_render_check` | 先判断 `output-dir` 是否安全，再按需渲染一次，检查 `_book/` 里的 HTML 是否可发布 | 不改 `.qmd`，不自动修配置，不重复渲染 |
| `quarto_pass_report` | 收尾时把执行结论压成一张固定行数的回执卡片：技能、模式、改过的文件与步骤、未改项、检查结论 | 不保存到磁盘，不贴章节原文，不据回执改文章 |

装上之后什么时候出现、每一步对应哪条规则，见 [`docs/plugin-flow.md`](docs/plugin-flow.md)。那是给人回看的流程说明，不是技能执行时的规则来源。

两个技能从包内 `skills/` 目录发现，按需加载；技能里的相对路径以技能目录为基准解析：`writing-quarto` 用 `steps/`、`examples/`、`quarto/`、`scripts/`，`designing-theme` 用 `references/`、`knowledge/`、`assets/`、`scripts/`。

## 安装

```bash
dsh plugin --profile web add npm:@chengzhao-dev/dsh-quarto-book@0.4.0
```

`--profile` 换成你实际运行的那个 profile。桌面应用固定跑 `desktop` profile，且该 profile 由应用独占管理，`dsh --profile desktop` 直接启动会被拒绝；安装或升级插件可用 `dsh plugin --profile desktop add <包>`，如果应用拒绝写入，再走「设置 → 插件 → 添加插件」，地址填 `npm:@chengzhao-dev/dsh-quarto-book@0.4.0`。想跟 GitHub 标签，也可以写 `github:chengzhao-dev/dsh-quarto-book#v0.4.0`。

从旧的无作用域包 `dsh-quarto-book` 升级时（该包已随 0.3.4 从 npm 删除，只影响之前装过它的 profile），先在同一个 profile 里 `dsh plugin --profile <profile> remove dsh-quarto-book` 再装新包。两个包同时留着会以相同的 rank 550 各注册一遍 `writing-quarto` 和 `designing-theme`。

要求 DSH 0.2.x、Node.js 22 及以上。源码是 TypeScript，发布包已带编译后的 `lib/`；安装后不需要构建。

安装单位是 profile，不是仓库：只影响执行 `add` 的那个 profile。装好之后还要过下面的工作区门禁，目录里才会出现这两个技能名。

## 工作区门禁

`apply()` 注册技能 provider 和 `quarto_render_check` 工具，不写文件。provider 的 `list({ cwd })` 只在发现候选时做一次有界只读检查：

- 从会话 `cwd` 向上找到 git 根，沿途目录的 `_quarto.yml` 里只要有独立的一行 `type: book`，并且这本书至少有一个 `.qmd` 或 `.md` 章节源文件，就返回这两个技能；否则返回空列表。书根下的 `README.md`、`CHANGELOG.md`、`LICENSE.md` 等仓库说明文件不算章节源文件。
- 没有 `cwd`、不在 git checkout 里、`_quarto.yml` 缺失、只在注释里写了 `# type: book`、或只有 book 配置没有任何章节源文件，都按「不是书」处理。
- 扫描跳过 `_book`、`node_modules`、`vendor`、`third_party` 等生成或依赖目录，最多 4000 个目录项；普通 C++ 仓库和本插件仓库自己的会话里不会出现这两个名字；书仓库的子目录会话与书根会话一样生效。
- 门禁只影响技能发现与加载。`get()` 带 `cwd` 时重新过同一道门禁，不带 `cwd` 时只服务已经加载的本 provider candidate。
- `quarto_render_check` 与技能共用同一道门禁：没有会话 `cwd`、不在书里、`_quarto.yml` 不是 `type: book`、或书里没有章节源文件时直接拒绝，不启动 `quarto render`。渲染根取 `cwd` 向上最近的合法书根，`qmd_path` 只按会话 `cwd` 定位卡片。

社区插件没有「只对某个 GitHub 仓库启用」的开关，profile 安装加 cwd 门禁就是最小范围。想更窄，就只把它装进写书用的那个 profile。书门禁的判定顺序与六类情形见 [docs/plugin-boundaries.md](https://github.com/chengzhao-dev/dsh-quarto-book/blob/main/docs/plugin-boundaries.md)。

## 运行状态与结束

插件没有常驻进程，也不会在会话开始时自动执行技能。

- **是否生效**：技能目录里出现 `writing-quarto` 或 `designing-theme`，只说明当前会话的 `cwd` 过了门禁，名字可选；没有出现不是安装失败，而是当前目录不是书。
- **是否使用**：只有模型或用户调用 `skill`、或调用 `quarto_render_check`，才算一次使用；列出名字本身不读写任何文件。
- **怎么结束**：技能没有后台任务，调用它的那一轮按 `SKILL.md` 的步骤完成或停下后就结束；渲染工具在返回结果里的 `render_result` 与 `html_report` 都确定后结束（dry_run 时两者都是 `null`），卡片摘要只取 `未渲染`、`可渲染`、`渲染失败`、`渲染完成` 之一。
- **最终判断**：`html_report.usable` 是渲染检查的最终结论；没有 `html_report` 时，`safe_to_render` 只表示可以渲染，不表示已经渲染。
- **再次使用**：同一会话再次调用会重新读技能正文；工具不会自动重试，失败后由用户决定是否再调一次。

## 项目级约定

通用技能不知道某一本书的书名、章节表、技术栈和术语。项目只放这一份自己的技能：

```text
<book>/.agents/skills/quarto-book-project/
├── SKILL.md                        # 项目约定
└── writing/                    #/ 项目文件
    └── chapter-map.md              # 章节表
```

模板见 `templates/quarto-book-project/`。存在时，两个通用技能会先读 `SKILL.md`，再按它指向的 `writing/` 文件读章节对照；不存在就跳过，不猜测项目约定。通用写法、结构和主题规则留在插件里，不复制进项目技能。

**不要把同名技能嵌进书仓库。** DSH 在同一个技能层里按 rank 取一个，数字小的赢：`.agents/skills`（rank 200）优先于插件（rank 550）。书里再放 `writing-quarto` 或 `designing-theme`，插件正文就不会生效，还会把两套通用写法带进项目。

## 渲染检查工具

`quarto_render_check` 有两个参数：

- `qmd_path`：正在改的 `.qmd` 路径，用于卡片定位。
- `dry_run`：`true` 只判断输出目录，`false` 才运行一次 `quarto render`。

调用次数有上限。`dry_run: true` 最多 2 次：第 1 次返回 `safe_to_render: false` 时只改一次 `output-dir`；第 2 次仍不安全就停住，把 `warnings` 交给用户。`dry_run: false` 最多 1 次：渲染失败就停住，把 `errors` 交给用户，不自动重跑。成功时同一次返回里带 `html_report`，不再为同一份文件重跑。

返回字段：

| 字段 | 内容 |
| --- | --- |
| `warnings` | 输出目录不安全，或入口文件缺失等提示 |
| `errors` | 渲染失败、超时或找不到 `quarto` 时的一句话原因；成功时为空 |
| `safe_to_render` | 是否允许执行渲染 |
| `suggested_output_dir` | 固定为 `_book` |
| `render_result` | `ok`、`exit_code`、`duration_ms` 与末尾输出；`dry_run: true` 时为 `null` |
| `html_report` | `usable`、`checks`、`output_files`、`output_files_total`；`dry_run: true` 时为 `null` |

`html_report.checks` 每项是 `{ id, status, detail }`，`status` 只取 `pass`、`fail`、`skip`。固定项有 `index_html`、`utf8`、`charset`、`no_file_uri`；条件项有 `sitemap`、`search_index`、`callouts`、`dom`。`usable` 在没有 `fail` 时为 true。`output_files` 超过 30 个时只列前 30 个，总数在 `output_files_total`。

拦截、修正与成功各一次，演示如下。书的 `_quarto.yml` 先把输出目录写错：

```yaml
project:
  type: book
  output-dir: ./
```

调用 `quarto_render_check(qmd_path: "content/chapter.qmd", dry_run: true)`，返回 `safe_to_render: false`，`warnings` 指出 `./` 会覆盖书根，并建议 `output-dir: _book`。把该行改成 `output-dir: _book` 后再查一次，返回 `safe_to_render: true`、`render_result: null`。最后调用 `dry_run: false`，同一次返回：

```json
{
  "errors": [],
  "render_result": { "ok": true, "exit_code": 0 },
  "html_report": {
    "usable": true,
    "checks": [
      { "id": "index_html", "status": "pass" },
      { "id": "charset", "status": "pass" },
      { "id": "sitemap", "status": "pass" },
      { "id": "search_index", "status": "pass" }
    ]
  }
}
```

渲染进程的原始输出不单独占一张终端卡片。命令超时是 120 秒；超时、找不到 `quarto` 或非零退出都写进 `errors`。

## 执行回执

技能收尾时调用一次 `quarto_pass_report`，把这次执行的结论压成固定几行。卡片就是回执，回复里不再复述；工具不保存到磁盘，不贴章节原文，也不据回执改文章。

入参是闭集：

| 字段 | 取值 |
| --- | --- |
| `skill` | `writing-quarto` 或 `designing-theme` |
| `executed` | 布尔；为 `false` 时 `mode` 必须是 `skipped`，并给 `skip_reason`（最多 40 字） |
| `mode` | `polish`、`rewrite`（写作），`theme`（主题），`skipped`（未执行） |
| `files` | 最多 8 个 `{ path, edits }` |
| `steps` | 只列有改动的步骤：写作填 `1`–`9`，主题填 `定表面`、`定字体`、`定尺度`、`定颜色`、`定组件`、`通过检查`；`edits` 合计必须等于 `files` 的合计 |
| `held` | `fences`、`facts`、`css`、`prose` |
| `checks` | `content`、`html`、`layout`，状态只取 `pass`、`fail`、`skip` |

```text
已执行 writing-quarto · 增量润色
content/ch.qmd
改了 5 处：定句子 3，定用词 1，定版式 1
未改：围栏、事实
检查：内容通过；HTML 可用
```

没改也会出卡（`改了 0 处`），这样「插件没跑」和「跑了但没改」分得开；当前文件不是章节时输出一行 `未执行 writing-quarto：…`。

## 主题

主题资产在 `skills/designing-theme/assets/theme/`：

```text
assets/theme/
├── assets/           #/ brand mark、favicon、字体与 OFL 许可
├── css/              #/ base、content、nav、sidebar、callouts、code、mermaid…
├── includes/         #/ 字体与页脚片段
└── palettes/github/  #/ light/dark SCSS、highlight theme、tokens.css
```

Quarto 只读书里的相对路径，不读 npm 包，也不读 DSH profile。书要渲染时使用书根下的 `theme/` 副本，`_quarto.yml` 也只引用这份副本：

```yaml
format:
  html:
    theme:
      light: theme/palettes/github/theme-light.scss
      dark: theme/palettes/github/theme-dark.scss
    css:
      - theme/css/tokens.css
      - theme/css/base.css
    include-in-header:
      - theme/includes/fonts.html
    include-after-body:
      - theme/includes/footer.html
```

插件包内 `assets/theme/` 是权威来源，书内 `theme/` 是渲染副本。已有副本时，`designing-theme` 只改副本。只有用户明确要求「把插件主题装进这本书」且目标目录还不存在时，才从插件复制过去，并同时写入过滤器 `filters/answering-disclosure.lua`；已存在的 `_quarto.yml` 只追加还没有的路径，不整文件替换。

## 校验脚本

`writing-quarto` 自带内容与链接检查脚本。在 `writing-quarto` 技能目录下运行（安装后位于插件的 `skills/writing-quarto/`）：

```bash
python scripts/verifying-content.py --root <book>
python scripts/checking-links.py --root <book>
python scripts/checking-names.py --root <book>
```

`verifying-content.py` 检查标题层级与字数、正文篇幅、禁用措辞、代码围栏、本地链接和章节表一致性。项目专属检查只在 `.agents/skills/quarto-book-project/` 存在时启用；不存在时跳过，不把别的书的章节名当成规则。

渲染后的 Callout、HTML 产物与 DOM 契约由 `quarto_render_check` 调用包内脚本完成；不要再手跑 `checking-callouts.py`、`checking-output.py` 或 `checking-dom.py`。`designing-theme` 自带 `scripts/checking-layout.py`，在渲染后的 HTML 上检查溢出、对比度和页面结构；`scripts/measuring-pages.mjs` 用于测量正文列宽。

`apply()` 不在加载时跑这些脚本，也不跑 `quarto render`。校验由技能正文的完成判据触发，发生在用户要求写章节或改主题之后。

## 包结构

```text
dsh-quarto-book/
├── .github/workflows/publish.yml       # 标签发布
├── .gitattributes                      # 行尾与编码
├── .gitignore                          # 忽略的构建产物
├── .npmignore                          # 排除的文件
├── LICENSE                             # MIT 许可
├── README.en.md                        # 英文说明
├── README.md                           # 中文说明
├── cordis.patch.yml                    # 宿主补丁
├── docs                            #/ 设计说明
├── icon.svg                            # 插件图标
├── lib                             #/ 编译产物
│   ├── index.js                        # 注册入口
│   ├── tools/render-check.js           # 渲染检查工具
│   └── workspace.js                    # 工作区门禁
├── locale                          #/ 界面文案
├── package-lock.json                   # 依赖锁
├── package.json                        # 包清单
├── scripts                         #/ 仓库脚本
│   ├── checking-skill-links.mjs        # 技能自检
│   └── embedding-agents.ps1            # 旧装机脚本
├── skills                          #/ 两个技能
│   ├── designing-theme             #/ 主题技能
│   └── writing-quarto              #/ 写作技能
├── src                             #/ TypeScript 源码
│   ├── index.ts                        # 插件入口
│   ├── tools/render-check.ts           # 渲染检查实现
│   └── workspace.ts                    # 工作区门禁
├── templates                       #/ 项目技能模板
├── tests                           #/ 工具单元测试
│   ├── provider.test.mjs               # 技能门禁测试
│   └── render-check.test.mjs           # 渲染工具测试
└── tsconfig.json                       # TypeScript 配置
```

`templates/` 不在 `skills/` 下，不会被注册。技能的目录分层见 `docs/writing-quarto-layout.md`，版本与发布规则见 `docs/versioning.md`。

## 本地开发

源码用 TypeScript，构建产物 `lib/` 提交进仓库；发布包直接加载 `lib/`，安装后不需要构建。开发时把本仓库链接进写书用的 profile，而不是把技能复制进书：

```bash
npm ci
npm test
npm run check
npm run pack:check
```

`npm test` 会先编译再跑工具测试；`npm run check` 做类型检查与技能路径自检。开发安装：

```bash
dsh plugin --profile web add D:\Github\dsh-quarto-book
```

`SKILL.md`、`steps/`、`examples/`、`quarto/` 在下一次 `skill` 工具调用时重读，改完不用发 npm。包内主题改动不会自动进书的 HTML；要看页面效果，把改过的文件同步到书的 `theme/`，再在书根运行 `quarto render`。不要把 `_quarto.yml` 指到插件检出目录，那条路径换机器就不存在。

插件以 bundle 形式发布：`package.json` 的 `dsh.bundle.patch` 指向 `cordis.patch.yml`，补丁只插入 `id: quarto-book`、`name: '@chengzhao-dev/dsh-quarto-book'` 一行。入口不 import 宿主实现，因此在 pnpm 的严格依赖布局下也能加载。

## 嵌入到另一本书（不推荐）

`scripts/embedding-agents.ps1` 是旧形态的维护工具，会把两棵技能原样复制进目标仓库的 `.agents/`。复制后书里会出现与插件同名的技能，按 rank 200 盖住插件（rank 550），插件更新也不再生效。

新书不要用它：书里只放 `.agents/skills/quarto-book-project/`，其余交给已安装的插件。只有需要离线归档一份独立技能树时才执行：

```powershell
pwsh -File scripts/embedding-agents.ps1 -Target D:\Github\my-book
```

脚本拒绝复制 `package.json`、`cordis.patch.yml`、`lib/`、`locale/` 和 `icon.svg`，避免把插件清单带进书仓库。

## 许可

MIT。主题内的 LXGW Bright 与 LXGW Bright Code 按 SIL Open Font License 1.1 使用；上游版权声明与许可全文在 `skills/designing-theme/assets/theme/assets/fonts/OFL.txt`。
