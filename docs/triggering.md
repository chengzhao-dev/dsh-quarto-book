# 触发与分流

两个技能只在书门禁通过后出现，触发问题因此只有两类：该出现的没出现（description 或门禁写窄了），不该出现的出现了（边界写宽了）。这一页把判据、四个写作域、正反例和维护规则放在一处；门禁本身见 [plugin-flow.md](plugin-flow.md)。

## 判据

技能是否被选中，只由 `SKILL.md` 的 `name` 和 `description` 决定，正文不参与路由。`description` 必须同时写清三件事：做什么、什么时候用、不用于什么；宁可写得主动一些，也不要靠正文里的补充说明去补触发。

| 技能 | 触发信号（出现任意一类） | 不触发（出现任意一类即排除） |
| --- | --- | --- |
| `writing-quarto` | 改 `content/**/*.qmd`、`index.qmd`、`_quarto.yml` 的目录或 front matter；新建或重写章节；调整表格、图、列表与代码块的排布；润色句子与用词；中英混排、标点与术语统一；核对链接、`quarto_render_check` 报错、执行回执 | 只改主题颜色、字体、字号、行距、Callout 与导航样式；只改 `.css` / `.scss`；只改仓库 README（走第 5–8 步以外仍算章节写作，按 `SKILL.md` 的说明处理）；只改 Python 脚本或 CI |
| `designing-theme` | 改 `_quarto.yml` 引用的主题文件；调颜色、字体、字号、行距、页面宽度、表格样式、Callout、导航、页脚；主题与正文的取舍 | 只改章节正文、表格内容或图片；只改 front matter 的章节标题；只改 `_quarto.yml` 的 `book:` 目录 |

两个技能同时出现时先开 `writing-quarto`：正文定稿后才轮到主题承接字号与间距。只改 `theme/` 下的样式时，不开九步。

## 四个写作域

九步按「先定内容、再定形式」排。四个域是读者提问时的分诊入口，不是第二套流程：

| 域 | 回答什么 | 落在哪几步 | 主要文件 |
| --- | --- | --- | --- |
| 写作 | 这一章给谁、要他做完什么、先说什么后说什么 | 1 定任务、2 定结构 | `steps/01-task.md`、`steps/02-structure.md` |
| 布局 | 一块内容怎么排：导语、围栏、表格、图、列表与收束的次序 | 3 排块、4 定段落、7 定版式 | `steps/03-blocks.md`、`quarto/tables.md`、`quarto/figures.md`、`steps/07-layout.md` |
| 润色 | 句子怎么改短、用词怎么统一、改完怎么回读 | 5 定句子、6 定用词、8 回读 | `steps/05-sentences.md`、`steps/06-wording.md`、`steps/08-reread.md` |
| 排版 | 主题怎样把版式落到页面上：字体、字号、行距、表格与 Callout 样式 | 主题技能，不在九步内 | `skills/designing-theme/SKILL.md`、`assets/theme/css/` |

## 触发矩阵

| # | 用户请求 | 应出现 | 判定要点 |
| --- | --- | --- | --- |
| 1 | 「给 03 章补一节落子校验」 | `writing-quarto` | 章节正文与结构 |
| 2 | 「这一章标题太长，重排二级标题」 | `writing-quarto` | 第 2 步定结构 |
| 3 | 「这段代码块后面的解释在重复注释」 | `writing-quarto` | 第 3 步块后分工 |
| 4 | 「把这张表改成三列并加表题」 | `writing-quarto` | 表格写法在 `quarto/tables.md` |
| 5 | 「这几句话太绕，帮我改短」 | `writing-quarto` | 第 5 步定句子 |
| 6 | 「全书中英之间空格不统一」 | `writing-quarto` | 第 7 步与 `quarto/prose.md` |
| 7 | 「按九步重写整章」 | `writing-quarto` | 全章重构走法 |
| 8 | 「渲染后表格表头没有加粗」 | 先 `designing-theme`，再 `writing-quarto` 核正文 | 样式归主题，表头文字归正文 |
| 9 | 「正文字号太大，行距也松」 | `designing-theme` | 字号与行距 |
| 10 | 「Callout 的底色和边框不协调」 | `designing-theme` | Callout 样式 |
| 11 | 「导航栏书名换掉」 | `designing-theme` | 导航与页脚 |
| 12 | 「表格单元格的内边距调小一点」 | `designing-theme` | 表格样式 |

## 反例

| # | 用户请求 | 应出现 | 原因 |
| --- | --- | --- | --- |
| 13 | 「修一下 CI 里的 Python 检查脚本」 | 都不出现 | 脚本不归写作技能 |
| 14 | 「解释一下什么是 Quarto Book」 | 都不出现 | 概念问答，不动仓库 |
| 15 | 「把 README 的安装命令更新到 0.6.9」 | 都不出现 | 仓库说明页，不套九步 |
| 16 | 「改一下 `_quarto.yml` 里 book 的章节顺序」 | `writing-quarto` | 目录与结构 |
| 17 | 「把这个 CSS 变量的颜色换深一点」 | `designing-theme` | 主题变量 |
| 18 | 「qmd 里 front matter 的 `format` 加个字段」 | `writing-quarto` | 章节 front matter |
| 19 | 「图注写在图上方对吗」 | `writing-quarto` | 图与图注落点 |
| 20 | 「在非 git 目录里写一章」 | 都不出现 | 没有 git 根，门禁不通过 |

## 验证与维护

- 结构检查：`scripts/checking-skill-links.mjs` 要求本页存在，两个技能的 description 关键词（`写作`、`布局`、`排版`、`润色`、`表格`、`颜色`、`字体`、`行距`、`Callout`）都能在本页找到，触发矩阵至少 12 行、反例至少 8 行，四个写作域各有一行。
- 人工抽样：改 description 或步骤表后，用 8–10 条正例、8–10 条反例各跑 3 次，触发率低于一半就改 description 的信号词，不改正文。
- 改 `SKILL.md` 的 `description` 必须同改本页的判据表与矩阵；只改矩阵不改 description，等于没改。
