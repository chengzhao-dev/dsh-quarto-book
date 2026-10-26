# dsh-quarto-book

[![publish](https://github.com/chengzhao-dev/dsh-quarto-book/actions/workflows/publish.yml/badge.svg)](https://github.com/chengzhao-dev/dsh-quarto-book/actions/workflows/publish.yml)
[![npm](https://img.shields.io/npm/v/@chengzhao-dev/dsh-quarto-book)](https://www.npmjs.com/package/@chengzhao-dev/dsh-quarto-book)

[English](https://github.com/chengzhao-dev/dsh-quarto-book/blob/main/README.en.md) | **简体中文**

把一份 Quarto Book 从章节写到可发布：`writing-quarto` 负责章节骨架、整书次序与中文行文，`designing-theme` 负责主题；渲染后由 `quarto_render_check` 判断 HTML 是否可发布，`quarto_pass_report` 给出收尾回执。两个技能只在 `type: book` 的仓库里出现，运行需要 Quarto CLI 与 Python 3。

## 提供什么

| 名称 | 用途 | 不做什么 |
| --- | --- | --- |
| `writing-quarto` | 新建或修改 `content/**/*.qmd`、`index.qmd`、`_quarto.yml`；章节骨架、中文行文、代码与图表、内容检查 | 不改 CSS、字体和颜色 |
| `designing-theme` | 调整主题的 CSS、SCSS、字体、palette、导航与 Callout 样式 | 不改章节正文 |
| `quarto_render_check` | 先判断 `output-dir` 是否安全，再按需渲染一次，检查 `_book/` 里的 HTML 是否可发布 | 不改 `.qmd`，不自动修配置，不重复渲染 |
| `quarto_pass_report` | 收尾时把执行结论压成固定行数的回执卡片：技能、模式、改过的文件与步骤、未改项、检查结论 | 不保存到磁盘，不贴章节原文，不据回执改文章 |

两个技能从包内 `skills/` 目录发现，按需加载；技能里的相对路径以技能目录为基准：`writing-quarto` 用 `steps/`、`examples/`、`quarto/`、`references/`、`scripts/`，`designing-theme` 用 `references/`、`knowledge/`、`assets/`、`scripts/`。

## 快速开始

1. 安装插件：

   ```bash
   dsh plugin --profile web add npm:@chengzhao-dev/dsh-quarto-book@latest
   ```

2. 在书仓库里打开会话。`_quarto.yml` 要有独立一行的 `type: book`，书根至少有一个 `.qmd` 或 `.md` 章节源文件；两个技能名这时才会出现。
3. 调用技能：写正文用 `writing-quarto`，改主题用 `designing-theme`。

`--profile` 换成你实际运行的那个 profile。桌面应用固定跑 `desktop` profile，且该 profile 由应用独占管理，`dsh --profile desktop` 直接启动会被拒绝；安装或升级用 `dsh plugin --profile desktop add <包>`，应用拒绝写入时再走「设置 → 插件 → 添加插件」。需要固定版本时写 `npm:@chengzhao-dev/dsh-quarto-book@0.6.11`，跟 GitHub 标签时写 `github:chengzhao-dev/dsh-quarto-book#v0.6.11`。

从旧的无作用域包 `dsh-quarto-book` 升级（该包已随 0.3.4 从 npm 删除，只影响之前装过它的 profile）：先在同一个 profile 里 `dsh plugin --profile <profile> remove dsh-quarto-book`，再装新包。两个包同时留着会以相同的 rank 550 各注册一遍 `writing-quarto` 和 `designing-theme`。

安装单位是 profile，不是仓库：只影响执行 `add` 的那个 profile。装好之后还要过工作区检查：按会话 `cwd` 判断当前目录是不是一本书，通过后技能名才会出现。检查的六类情形见 [docs/plugin-boundaries.md](https://github.com/chengzhao-dev/dsh-quarto-book/blob/main/docs/plugin-boundaries.md)。

## 环境要求

| 依赖 | 用途 |
| --- | --- |
| DSH 0.2.x | 宿主；插件按 `dsh.bundle.patch` 注册技能与两个工具 |
| Node.js 22 及以上 | 运行插件与检查脚本 |
| Python 3 | 内容、链接、命名检查，以及渲染后的 HTML 检查 |
| Quarto CLI | 仅 `quarto_render_check` 真正渲染时需要 |

发布包已经带编译好的 `lib/`，安装后不需要构建。环境分工见 [docs/plugin-layout.md](https://github.com/chengzhao-dev/dsh-quarto-book/blob/main/docs/plugin-layout.md)。

## 使用

### 写章节

在 `type: book` 的仓库里加载 `writing-quarto`，按 `SKILL.md` 的九步执行。每一步只打开同号的一个 `steps/` 文件；判不准才读 `examples/` 里同号的案例；要排图、查渲染或全仓重构才打开 `quarto/`。

书仓库根目录的 `README.md` 是说明页，不是章节：只走第 5–8 步，不套第 1–4 步的任务与结构骨架，不写「常见错误」「自测问题」，不调 `quarto_render_check`。`README.en.md` 同样处理。

插件没有常驻进程，也不会在会话开始时自动执行技能。技能目录里出现名字只说明当前会话过了检查；只有调用 `skill`、`quarto_render_check` 或 `quarto_pass_report` 才算一次使用。同一会话再次调用会重读技能正文，工具失败后不会自动重试。

### 改主题

主题资产在 `skills/designing-theme/assets/theme/`，包内是权威来源，书内 `theme/` 是渲染副本。已有副本时 `designing-theme` 只改副本；只有用户明确要求「把插件主题装进这本书」且目标目录不存在，才从包复制，并把 `skills/writing-quarto/scripts/answering-disclosure.lua` 放到书内 `filters/answering-disclosure.lua`。`_quarto.yml` 只引用书内副本，不指向 npm 包或插件检出目录。

### 检查与渲染

内容与链接检查在 `writing-quarto` 技能目录下运行：

```bash
python scripts/verifying-content.py --root <book>
python scripts/checking-links.py --root <book>
python scripts/checking-prose.py --root <book>
python scripts/checking-names.py --root <book>
```

`checking-prose.py` 只报中文混排里能直接判断的问题；`checking-names.py` 只在全仓重构时加跑。日常章节检查跑前三条即可。

渲染后的 Callout、HTML 产物与 DOM 结构约定由 `quarto_render_check` 调包内脚本完成，不用手跑 `checking-callouts.py`、`checking-output.py` 或 `checking-dom.py`；`designing-theme` 的 `scripts/checking-layout.py` 在渲染后的 HTML 上检查溢出、对比度和页面结构。`apply()` 不在加载时跑这些脚本，也不跑 `quarto render`。

一轮结束时调用一次 `quarto_pass_report`，把这次执行的结论压成卡片；卡片就是回执，回复里不再复述。

### 项目技能

项目只放一份自己的约定技能：`<book>/.agents/skills/quarto-book-project/`，模板见 `templates/quarto-book-project/`。存在时两个通用技能先读它的 `SKILL.md`，再按它指向的 `writing/` 文件读章节表；不存在就跳过，不猜项目约定。

**不要把同名技能嵌进书仓库**：DSH 在同一技能层按 rank 取一个，`.agents/skills`（rank 200）优先于插件（rank 550），书里再放 `writing-quarto` 或 `designing-theme` 会让插件正文失效。

## 文档

| 文档 | 内容 |
| --- | --- |
| [docs/architecture.md](https://github.com/chengzhao-dev/dsh-quarto-book/blob/main/docs/architecture.md) | 两个技能与两个工具的分层、四个写作域与文件职责 |
| [docs/plugin-flow.md](https://github.com/chengzhao-dev/dsh-quarto-book/blob/main/docs/plugin-flow.md) | 从安装到回执的五层结构、文件分流与渲染顺序 |
| [docs/plugin-boundaries.md](https://github.com/chengzhao-dev/dsh-quarto-book/blob/main/docs/plugin-boundaries.md) | 工作区检查的六类情形与判定顺序 |
| [docs/plugin-layout.md](https://github.com/chengzhao-dev/dsh-quarto-book/blob/main/docs/plugin-layout.md) | 仓库目录、发布包内容与 Python/Quarto 分工 |
| [docs/writing-quarto-layout.md](https://github.com/chengzhao-dev/dsh-quarto-book/blob/main/docs/writing-quarto-layout.md) | 写作技能的目录分层 |
| [docs/triggering.md](https://github.com/chengzhao-dev/dsh-quarto-book/blob/main/docs/triggering.md) | 两个技能的触发判据、四个写作域与正反例 |
| [docs/versioning.md](https://github.com/chengzhao-dev/dsh-quarto-book/blob/main/docs/versioning.md) | 版本号与发布顺序 |

## 开发

源码用 TypeScript，构建产物 `lib/` 提交进仓库；发布包直接加载 `lib/`，安装后不需要构建。开发时把本仓库链接进写书用的 profile，而不是把技能复制进书：

```bash
npm ci
npm test
npm run check
npm run pack
```

`npm test` 会先编译再跑工具测试；`npm run check` 做类型检查与技能路径自检；`npm run pack` 把 tarball 只写进 `temp/`，那个目录已在 `.gitignore` 里。

开发安装：

```bash
dsh plugin --profile web add D:\\Github\\dsh-quarto-book
```

`SKILL.md`、`steps/`、`examples/`、`quarto/` 在下一次 `skill` 工具调用时重读，改完不用发 npm。包内主题改动不会自动进书的 HTML；要看页面效果，把改过的文件同步到书的 `theme/`，再在书根运行 `quarto render`。不要把 `_quarto.yml` 指到插件检出目录，那条路径换机器就不存在。

插件以 bundle 形式发布：`package.json` 的 `dsh.bundle.patch` 指向 `cordis.patch.yml`，补丁只插入 `id: quarto-book`、`name: '@chengzhao-dev/dsh-quarto-book'` 一行。入口不 import 宿主实现，因此在 pnpm 的严格依赖布局下也能加载。

旧装机脚本 `scripts/embedding-agents.ps1` 会把两棵技能原样复制进目标仓库的 `.agents/`，按 rank 200 盖住插件；新书不要用它，只有离线归档独立技能树时才执行，命令写在脚本头部。

## 问题与贡献

问题与建议走 [GitHub Issues](https://github.com/chengzhao-dev/dsh-quarto-book/issues)。提交改动前先运行 `npm test` 与 `npm run check`；涉及技能正文时，同时跑 `node scripts/checking-skill-links.mjs`。

## 许可

MIT。主题内的 LXGW Bright 与 LXGW Bright Code 按 SIL Open Font License 1.1 使用；上游版权声明与许可全文在 `skills/designing-theme/assets/theme/assets/fonts/OFL.txt`。
