# Quarto 基础（Book 项目）

本文件是 Quarto Book 项目结构、YAML front matter、章节标题约定的**规范唯一出处**。其他文件只引用本文件，不重复陈述。`format: html` 的选项语义与失效边界归 `quarto/12-quarto-render.md`，本文件不复制。

Quarto 接受 `.qmd`、`.md`、`.ipynb`、`.Rmd` 四种章节源文件；Book 的章节以 `.qmd` 为主，本技能只按 `.qmd` 与 `.md` 讲正文写法，其他类型按 Quarto 官方文档处理。

## .qmd 文档结构

一个 `.qmd` 文件由两部分组成：

```yaml
---
title: "文档标题"
format: html
---

正文内容。
```

- **YAML front matter**：文档元数据与配置，位于文件顶部 `---` 之间。
- **Markdown 正文**：标准 Markdown + Quarto 扩展（divs、spans、callout、交叉引用等）。

## 常用 front matter 字段

| 字段 | 作用 |
|---|---|
| `title` | 标题；侧边栏与 TOC 取自它 |
| `description` | 站点元数据：仅根 `index.qmd` 保留，只进 `<meta>`，不渲染为可见文字；其余章节与 part 落地页一律不写，定位信息并入开篇说明 |
| `format` | 输出格式（本书统一 `html`），可写对象形式配置子选项 |
| `lang` | 语言，本书在 `_quarto.yml` 统一设 `zh` |
| `toc` | 目录（本书统一在 `format: html` 下设置，见 `quarto/12-quarto-render.md`） |

## 常用命令

```bash
quarto render 文档.qmd      # 渲染单个文档
quarto preview 文档.qmd     # 本地预览（实时刷新）
quarto render               # 渲染当前项目全部内容
```

渲染整本书时，`quarto render` 在书根执行；在子目录裸跑只渲染该子目录的文档，输出进 `_book/` 下对应子路径，不要把它当整书构建。渲染单章用 `quarto render 文档.qmd`，可以从子目录执行，输出仍进 `_book/`。

## Quarto Book 项目

书根只放配置、入口和主题与过滤器资产，正文按部分收进章节目录（默认 `chapters/`）；`.vscode/`、`.idea/` 等编辑器工程目录不放书根，它们属于具体 C++ 工程的工程根。常见布局如下：

```text
book/
├── _quarto.yml                # 章序与输出配置
├── index.qmd                  # 首页：导航到各 part
├── .editorconfig              # 编辑器保存格式
├── .gitattributes             # 入库与检出的行尾
├── .gitignore                 # 生成物与本地产物
├── config/                   #/ 运行时配置
│   └── runtime.config         # Python 解释器与 Quarto 的版本
├── chapters/                 #/ 正文与附录
│   ├── <part>/               #/ 一个部分
│   │   ├── index.qmd          # part 落地页：本部分章节卡片
│   │   ├── 01_intro.qmd       # 第一章的正文
│   │   └── 02_topic.qmd       # 第二章的正文
│   └── appendix/             #/ 附录
│       └── references.qmd     # 参考文献与术语出处
├── theme/                    #/ 书内主题副本
└── filters/                  #/ 书内过滤器
```

运行时配置放书根 `config/runtime.config`，只写这一份；新建书时从本技能的 `assets/config/runtime.config` 复制。解释器与版本下限的取值规则见本文件「解释器与依赖取值」。

Quarto Book 的核心配置在书根 `_quarto.yml`：

```yaml
project:
    type: book

book:
    # 1. 身份
    title: "<书名>"
    # 2. 说明
    description: "<一句话说明>"
    # 3. 站点与仓库
    site-url: "https://<用户名>.github.io/<仓库>"
    repo-url: "https://github.com/<用户名>/<仓库>"
    repo-actions: [source]
    # 4. 外观
    favicon: "<主题内 favicon 的相对路径>"
    # 5. 阅读界面
    page-navigation: true
    search: true
    sidebar:
        collapse-level: 2
    navbar:
        title: "<书名>"
    # 7. 正文结构：章节清单永远最后
    chapters:
        - index.qmd
        - part: chapters/<part>/index.qmd
          chapters:
              - chapters/<part>/01_intro.qmd
              - chapters/<part>/02_topic.qmd
        - chapters/<part>/99_bibliography.qmd     # 书目页：#refs 留在 chapters
    appendices:
        - chapters/appendix/references.qmd
```

- **`index.qmd` 必须存在**，作为 Book 首页/入口；根首页只承担这一层导航。
- **`part:` 指向该部分的落地页**（如 `chapters/<part>/index.qmd`），产生分组标题；新增部分时先建落地页，再加 part。
- 章节可放子目录，在 `chapters` 写相对路径；`_quarto.yml` 的章节顺序与落地页的阅读顺序保持一致。
- 章节文件名用 `<NN>_<topic>.qmd`：两位数字前缀只为人工排序，真正的章序仍由 `book.chapters` 决定；目录名与文件名内的词间分隔用下划线，不用连字符。
- `search: true` 写在 `book:` 下，不写进 `navbar`；书复用 website 组件，但书级选项归 `book`。
- `collapse-level` 按章节深度设：只有一个 part、章在第二层时用 `2`（默认值）；用 `1` 会把章全部折叠，侧栏只剩 part 标题。
- **`appendices:` 只放附录页**，排在 `chapters` 之后；附录标题默认由 Quarto 加前缀，想改中文名在 `crossref.appendix-title` 设「附录」。
- 用 `#refs` 生成的书目页按项目约定留在 `chapters`；Quarto 不会因为 `#refs` 自动把它归成附录，放错位置会按普通章节排序。
- **`book:` 键序按七组排，`chapters`/`appendices` 永远最后**：身份（title/subtitle/author/date/date-format）→ 说明（description/abstract/license）→ 站点与仓库（site-url/repo-url/repo-branch/repo-subdir/repo-actions）→ 外观（cover-image/cover-image-alt/favicon）→ 阅读界面（page-navigation/back-to-top-navigation/search/sidebar/navbar/page-footer）→ 分享（downloads/sharing/open-graph/twitter-card/comments）→ 正文结构。新增键先归组再插入，不跨组搬动；整组未用时连注释一起省略，其他组序号不变。
- 渲染：`quarto render`，Book 默认输出到 `_book/`。

### 根首页与 part 落地页的链接边界

根首页和每个 part 落地页分别完成一次选择，不能越过对方直接承担章节导航。

- 根 `index.qmd` 只展示 `chapters/<part>/` 这一层：已发布部分用带 CTA 的落地卡，未发布部分用无链接占位卡。
- part 的 `chapters/<part>/index.qmd` 只展示本部分已发布的正文页面：短引言 + 卡片网格，每卡是章节 title 链接 + 一句职责，按 `_quarto.yml` 阅读顺序排满全部章节。
- 新增部分时先写落地页，再在根首页增加分组；根首页不直接链接 part 内正文页面。

## 章节标题约定（规范，唯一出处）

章节标题用 YAML `title:`，正文从 `##` 开始；页面内不出现顶层 `# H1`，避免同一标题渲染两次、章节结构错位：

```markdown
---
title: "章节标题"
---

开篇说明写正文普通段落（2–4 句）；章节与 part 落地页不写 `description`，定位信息只保留在开篇说明。

## 第一个小节
正文。
```

- **标题层级**：`##` 表示阅读阶段、范围或一个可验收任务，`###` 表示该阶段中可独立完成或观察的子任务。正文最多到 `###`，禁止 `####` 及更深标题。
- `###` 只用于源码阅读、验证、可选分支、排错症状等拥有独立动作或观察结果的内容。只有一两句话的解释并入相邻段落，不为目录对称强行拆分。
- 根首页、part 落地页的卡片标题可以保留 `###`，那是导航组件的视觉层级，不改变正文最多三级的约束。
- 归并或改名标题前先检索 `@sec-` 与 `#anchor`，避免破坏交叉引用；标签前缀、书内编号与不编号章的限制见 `quarto/06-crossrefs.md`。标题字数与形式见 `steps/02-structure.md`「标题分层」与「形式规则」，章题与正文的对齐见同文件「纵向承诺链」第 9 条。

## 输出结构

单个文档渲染后产生 `.html` 与 `_files/` 伴随目录；Book 项目统一输出到 `_book/`。如希望单文件自包含 HTML，用 `embed-resources: true`（见 `quarto/12-quarto-render.md`）。

## 延伸

- 正文结构、代码块/终端约定与文档元素：`quarto/03-authoring.md`
- 图、图注与图前句的分工：`quarto/09-figures.md`
- 外观配置与渲染排错：`quarto/12-quarto-render.md`
- 页面宽度与视觉依据：`quarto/12-quarto-render.md`「本书的现行取值」

## 执行缓存与 CI 依赖

- `execute: freeze: auto`：全项目渲染复用根 `_freeze/` 中未变化页面的结果，源码变化才重跑；`_freeze/` 的入库规则见 `02-encoding.md`；`.quarto/_freeze/` 随 `.quarto/` 忽略，`_book/` 是发布物。
- 本地或 CI 以无参数 `quarto render` 渲染整本书。修改单元、`rendering-coords.py`、输入数据或依赖后，必须刷新并提交对应根 `_freeze/`；发生冲突时重新执行生成结果，不手工合并 JSON。
- 用 `{python}` 可执行单元的书，CI 还要安装 Jupyter 依赖，供页面或外部输入变更后的重执行兜底；渲染验收仍是 `_book` 对应 HTML 含 `coords-grid` 类名的 SVG 容器。

### 解释器与依赖取值

- 解释器与版本只写一份 `config/runtime.config`：`python_path`、`python_min_version` 给解释器与版本下限。缺失或版本低于下限时脚本直接失败，不回退 PATH。键注释的写法见 `04-comments.md`「TOML 与项目配置」。
- Quarto 的 jupyter 引擎用环境变量 `QUARTO_PYTHON` 定位解释器；本地与渲染 Python 单元的 CI 都显式设置它，值取自 `config/runtime.config` 的 `python_path`。
- **裸 `quarto preview` / `quarto render` 不读 `config/runtime.config` 的解释器字段**。Windows PATH 上的 `python3` 常是 Store 占位符，会报 Python not found；优先在会话或 CI 里设置 `QUARTO_PYTHON`。
- Cursor / VS Code 的 Quarto Preview：扩展从 **Python: Select Interpreter** 取路径注入 `QUARTO_PYTHON`；选书里实际使用的解释器。
- SVG 用标准库生成，不强制 matplotlib。
