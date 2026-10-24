# Quarto 基础（Book 项目）

本文件是 Quarto Book 项目结构、YAML front matter、章节标题约定的**规范唯一出处**。其他文件提到这些约定时一律引用本文件，不重复陈述。`format: html` 的选项语义与失效边界归 `quarto/render.md`，本文件不复制。

> 速查：`.qmd` = YAML front matter + Markdown 正文 · `title:` 与 `# H1` 二选一 · `index.qmd` 必须存在 · Book 输出 `_book/` · `part:` 分组章节 · `appendices:` 收附录

Quarto 接受 `.qmd`、`.md`、`.ipynb`、`.Rmd` 四种章节源文件；Book 的章节以 `.qmd` 为主，本技能只按 `.qmd` 与 `.md` 讲正文写法，其他类型按 Quarto 官方文档处理。

## .qmd 文档结构

一个 `.qmd` 文件由两部分组成：

```yaml
---
title: "文档标题"
description: "一句话说明"
format: html
---

正文内容。
```

- **YAML front matter**：文档元数据与配置，位于文件顶部 `---` 之间。
- **Markdown 正文**：标准 Markdown + Quarto 扩展（divs、spans、callout、交叉引用等）。

## 常用 front matter 字段

| 字段 | 作用 |
|---|---|
| `title` | 标题；侧边栏、TOC 与章节号均取自它 |
| `description` | 站点元数据：仅根 `index.qmd` 保留，只进 `<meta>`，不渲染为可见文字；其余章节与 part 落地页一律不写，定位信息并入开篇说明 |
| `format` | 输出格式（本书统一 `html`），可写对象形式配置子选项 |
| `lang` | 语言，本书在 `_quarto.yml` 统一设 `zh` |
| `toc` | 目录（本书统一在 `format: html` 下设置，见 `quarto/render.md`） |

## 常用命令

```bash
quarto render 文档.qmd            # 渲染单个文档
quarto preview 文档.qmd           # 本地预览（实时刷新）
quarto render                     # 渲染当前项目全部内容
```

`quarto render` 必须在仓库根目录执行，在其他目录执行会静默不渲染。书里若有 `{python}` 可执行单元，先按项目约定设置 `QUARTO_PYTHON`，再运行 `quarto render`；不要依赖系统 PATH 里的 `python3`（Windows 上可能是 Store 占位符）。

## Quarto Book 项目

书根只放配置、入口和主题资产，正文按部分收进 `content/`。常见布局如下：

```text
book/
├── _quarto.yml                           # 书配置：chapters、appendices 与输出
├── index.qmd                             # 根首页：只导航到各 part 落地页
├── content                               #/ 正文与附录
│   ├── <part>                            #/ 一个部分
│   │   ├── index.qmd                     # part 落地页：本部分章节卡片
│   │   ├── 01-intro.qmd
│   │   └── 02-topic.qmd
│   └── appendix                          #/ 附录
│       └── references.qmd
├── theme                                 #/ 书内主题副本
└── filters                               #/ 书内过滤器
```

Quarto Book 的核心配置在书根 `_quarto.yml`：

```yaml
project:
  type: book

book:
  title: "<书名>"
  sidebar:
    collapse-level: 1
  chapters:
    - index.qmd
    - part: content/<part>/index.qmd
      chapters:
        - content/<part>/01-intro.qmd
        - content/<part>/02-topic.qmd
    - content/<part>/99-bibliography.qmd   # 书目页：#refs 留在 chapters
  appendices:
    - content/appendix/references.qmd
```

- **`index.qmd` 必须存在**，作为 Book 首页/入口；根首页只承担这一层导航。
- **`part:` 指向该部分的落地页**（如 `content/<part>/index.qmd`），产生分组标题；新增部分时先建落地页，再加 part。
- 章节可放子目录，在 `chapters` 写相对路径；`_quarto.yml` 的章节顺序与落地页的阅读顺序保持一致。
- **`appendices:` 只放附录页**，排在 `chapters` 之后；附录标题默认由 Quarto 加前缀，想改中文名在 `crossref.appendix-title` 设「附录」。
- 用 `#refs` 生成的书目页留在 `chapters`，不要放进 `appendices`，否则书目会被当成附录。
- 渲染：`quarto render`，Book 默认输出到 `_book/`。

### 根首页与 part 落地页的链接边界

根首页和每个 part 落地页分别完成一次选择，不能越过对方直接承担章节导航。

- 根 `index.qmd` 只展示 `content/<part>/` 这一层：已发布部分用带 CTA 的落地卡，未发布部分用无链接占位卡。
- part 的 `content/<part>/index.qmd` 只展示本部分已发布的正文页面：短引言 + 卡片网格，每卡是章节 title 链接 + 一句职责，按 `_quarto.yml` 阅读顺序排满全部章节。
- 新增部分时先写落地页，再在根首页增加分组；根首页不直接链接 part 内正文页面。

## 章节标题约定（规范，唯一出处）

章节标题**二选一**：用 YAML `title:` **或**顶层 `# H1`，二者皆有时同文本必然重复渲染，并造成章节结构错乱。推荐用 `title:`，小节从 `##` 开始：

```markdown
---
title: "章节标题"
---

开篇说明写正文普通段落（1-3 句）；章节与 part 落地页不写 `description`，定位信息只保留在开篇说明。

## 第一个小节
正文。
```

- 页面内不得再出现顶层 `# H1`。
- **标题层级**：`##` 表示阅读阶段、范围或一个可验收任务，`###` 表示该阶段中可独立完成或观察的子任务。正文最多到 `###`，禁止 `####` 及更深标题。
- `###` 只用于源码阅读、验证、可选分支、排错症状等拥有独立动作或观察结果的内容。只有一两句话的解释并入相邻段落，不为目录对称强行拆分。
- 根首页、part 落地页的卡片标题可以保留 `###`，那是导航组件的视觉层级，不改变正文最多三级的约束。
- 归并或改名标题前先检索 `@sec-` 与 `#anchor`，避免破坏交叉引用。标题字数与形式见 `steps/02-structure.md`「标题分层」与「形式规则」，章题与正文的对齐见同文件「纵向承诺链」第 9 条。

## 输出结构

单个文档渲染后产生 `.html` 与 `_files/` 伴随目录；Book 项目统一输出到 `_book/`。如希望单文件自包含 HTML，用 `embed-resources: true`（见 `quarto/render.md`）。

## 延伸

- 正文结构、代码块/终端约定与文档元素：`quarto/authoring.md`
- 外观配置与渲染排错：`quarto/render.md`
- 页面宽度与视觉依据：`steps/02-structure.md`
