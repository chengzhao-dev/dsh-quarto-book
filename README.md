# dsh-quarto-book

[English](README.en.md) | **简体中文**

为 [DeepSeek Harness](https://github.com/deepseek-ai)（DSH）提供两个技能：写 Quarto Book 章节，以及维护可复用的书主题。插件只读，不执行书里的代码，也不改写你的 `.qmd`；它把写作约定、检查脚本和主题资产带到当前工作区。

## 两个技能

| 技能 | 用途 | 不做什么 |
| --- | --- | --- |
| `writing-quarto` | 新建或修改 `content/**/*.qmd`、`index.qmd`、`_quarto.yml`；章节骨架、中文行文、代码与图表、渲染验证 | 不改 CSS、字体和颜色 |
| `designing-theme` | 调整主题的 CSS、SCSS、字体、palette、导航与 Callout 样式 | 不改章节正文 |

两个技能都从包内 `skills/` 目录发现，按需加载；技能里的相对路径（`references/`、`conventions/`、`knowledge/`、`scripts/`、`assets/`）以技能目录为基准解析。

## 安装

```bash
dsh plugin --profile web add github:chengzhao-dev/dsh-quarto-book
```

要求 DSH 0.2.x、Node.js 22 及以上。插件是纯 JavaScript，没有构建步骤。

安装后在会话里直接说“用 writing-quarto 写这一章”或“用 designing-theme 调整主题”，也可以让模型按任务自动加载。

## 项目级约定

通用技能不知道某一本书的书名、章节表、技术栈和术语。项目可以放一份自己的技能：

```text
<book>/.agents/skills/quarto-book-project/SKILL.md
```

模板见 `templates/quarto-book-project/SKILL.md`。存在时，两个通用技能会提示先读它；不存在就跳过，不猜测项目约定。项目技能同名覆盖时，`.agents/skills`（rank 200）优先于插件（rank 550）。

## 主题

主题资产在 `skills/designing-theme/assets/theme/`：

```text
assets/theme/
├── assets/          # brand mark、favicon、字体与 OFL 许可
├── css/             # base、content、nav、sidebar、callouts、code、mermaid…
├── includes/        # 字体与页脚片段
└── palettes/github/ # light/dark SCSS、highlight theme、tokens.css
```

复制到书里后，在 `_quarto.yml` 中按实际路径引用（路径相对于书根）：

```yaml
format:
  html:
    theme:
      light: path/to/theme/palettes/github/theme-light.scss
      dark: path/to/theme/palettes/github/theme-dark.scss
    css:
      - path/to/theme/css/tokens.css
      - path/to/theme/css/base.css
    include-in-header:
      - path/to/theme/includes/fonts.html
    include-after-body:
      - path/to/theme/includes/footer.html
```

主题属于本插件，不声称与任何外部仓库共享。项目里已有权威副本时，以 `_quarto.yml` 实际引用的那一份为准。

## 校验脚本

`writing-quarto` 自带一组 Python 脚本，默认在书根运行：

在 `writing-quarto` 技能目录下运行（安装后位于插件的 `skills/writing-quarto/`）：

```bash
python scripts/verifying-content.py --root <book>
python scripts/checking-links.py --root <book>
python scripts/checking-callouts.py --root <book>
python scripts/checking-output.py --root <book>
python scripts/checking-names.py --root <book>
```

`verifying-content.py` 检查标题层级与字数、正文篇幅、禁用措辞、代码围栏、本地链接和章节表一致性。项目专属检查只在项目技能存在时启用；不存在时跳过，不把别的书的章节名当成规则。

`designing-theme` 自带 `scripts/checking-layout.py`，在渲染后的 HTML 上检查溢出、对比度和页面结构；`scripts/measuring-pages.mjs` 用于测量正文列宽。

## 包结构

```text
dsh-quarto-book/
├── lib/index.js            # 注册两个技能，rank 550
├── cordis.patch.yml        # 只 insert 一行
├── locale/{en,zh}.json     # 插件市场展示文案
├── icon.svg
├── skills/
│   ├── writing-quarto/
│   └── designing-theme/
├── templates/
│   └── quarto-book-project/SKILL.md
├── docs/creation-references.md
└── scripts/embedding-agents.ps1
```

`templates/` 不在 `skills/` 下，不会被注册；`scripts/embedding-agents.ps1` 是把技能树嵌入另一个仓库 `.agents/` 的维护工具，不会随技能加载。

## 嵌入到另一本书

默认把两个技能复制到目标仓库：

```powershell
pwsh -File scripts/embedding-agents.ps1 -Target D:\Github\my-book
```

需要拆分 `context/` 与 `knowledge/` 的仓库：

```powershell
pwsh -File scripts/embedding-agents.ps1 -Target D:\Github\my-book -SplitLayout
```

脚本拒绝复制 `package.json`、`cordis.patch.yml`、`lib/`、`locale/` 和 `icon.svg`，避免把插件清单带进书仓库。

## 开发

```bash
npm run check        # node --check lib/index.js
npm run pack:check   # npm pack --dry-run
```

插件以 bundle 形式发布：`package.json` 的 `dsh.bundle.patch` 指向 `cordis.patch.yml`，补丁只插入 `id: quarto-book`、`name: dsh-quarto-book` 一行。入口不 import 宿主实现，因此在 pnpm 的严格依赖布局下也能加载。

## 许可

MIT。主题内的 LXGW Bright 字体按其 `assets/fonts/OFL.txt` 授权使用。
