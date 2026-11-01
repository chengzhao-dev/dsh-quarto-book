# 触发与分流

两个技能只在书门禁通过后出现，触发问题因此只有两类：该出现的没出现（description 或门禁写窄了），不该出现的出现了（边界写宽了）。这一页把判据、四个写作域、正反例和维护规则放在一处；门禁本身见 [plugin-flow.md](plugin-flow.md)。

## 判据

技能是否被选中，只由 `SKILL.md` 的 `name` 和 `description` 决定，正文不参与路由。`description` 必须同时写清三件事：做什么、什么时候用、不用于什么；宁可写得主动一些，也不要靠正文里的补充说明去补触发。

| 技能 | 触发信号（出现任意一类） | 不触发（出现任意一类即排除） |
| --- | --- | --- |
| `writing-quarto` | 改 `content/**/*.qmd`、`index.qmd`、`_quarto.yml` 的目录或 front matter；新建或重写章节；调整表格、图、列表与代码块的排布；润色句子与用词；中英混排、标点与术语统一；核对链接、`quarto_render_check` 报错、执行回执；改书仓库根 `README.md` 的说明句 | 只改主题颜色、字体、字号、行距、Callout 与导航样式；只改 `.css` / `.scss`；只改 Python 脚本或 CI |
| `designing-theme` | 改 `_quarto.yml` 引用的主题文件；调颜色、字体、字号、行距、页面宽度、表格样式、Callout、导航、页脚；主题与正文的取舍 | 只改章节正文、表格内容或图片；只改 front matter 的章节标题；只改 `_quarto.yml` 的 `book:` 目录 |

两个技能同时出现时先开 `writing-quarto`：正文定稿后才轮到主题承接字号与间距。只改 `theme/` 下的样式时，不开九步。

## 四个写作域

四个域只是读者提问时的分诊词，不另立步骤映射。分步只以 `SKILL.md` 的九步地图为准：写作 1–2，布局 3–4 与 7，润色 5–8，排版归主题技能。一步只属一个域；同一章跨域时按写作→布局→润色推进，前一步落定再进。

## 触发矩阵

| # | 用户请求 | 应出现 | 判定要点 |
| --- | --- | --- | --- |
| 1 | 「给某一章补一节落子校验」 | `writing-quarto` | 章节正文与结构 |
| 2 | 「这一章标题太长，重排二级标题」 | `writing-quarto` | 第 2 步定结构 |
| 3 | 「这段代码块后面的解释在重复注释」 | `writing-quarto` | 第 3 步块后分工 |
| 4 | 「把这张表改成三列并加表题」 | `writing-quarto` | 表格写法在 `quarto/tables.md` |
| 5 | 「这几句话太绕，帮我改短」 | `writing-quarto` | 第 5 步定句子 |
| 6 | 「全书中英之间空格不统一」 | `writing-quarto` | 第 7 步与 `quarto/prose.md` |
| 7 | 「按九步重写整章」 | `writing-quarto` | 改写操作，整章范围 |
| 8 | 「渲染后表格表头没有加粗」 | 先 `designing-theme`，再 `writing-quarto` 核正文 | 样式归主题，表头文字归正文 |
| 9 | 「正文字号太大，行距也松」 | `designing-theme` | 字号与行距 |
| 10 | 「Callout 的底色和边框不协调」 | `designing-theme` | Callout 样式 |
| 11 | 「导航栏书名换掉」 | `designing-theme` | 导航与页脚 |
| 12 | 「表格单元格的内边距调小一点」 | `designing-theme` | 表格样式 |
| 13 | 「把书根 README 的安装命令更新到当前版本」 | `writing-quarto` | 说明页只走第 5–8 步，不套章节骨架 |

## 反例

| # | 用户请求 | 应出现 | 原因 |
| --- | --- | --- | --- |
| 13 | 「修一下 CI 里的 Python 检查脚本」 | 都不出现 | 脚本不归写作技能 |
| 14 | 「解释一下什么是 Quarto Book」 | 都不出现 | 概念问答，不动仓库 |
| 15 | 「把 LICENSE 的年份改成 2026」 | 都不出现 | 许可证等仓库说明文件不在写作范围 |
| 16 | 「改一下 `_quarto.yml` 里 book 的章节顺序」 | `writing-quarto` | 目录与结构 |
| 17 | 「把这个 CSS 变量的颜色换深一点」 | `designing-theme` | 主题变量 |
| 18 | 「qmd 里 front matter 的 `format` 加个字段」 | `writing-quarto` | 章节 front matter |
| 19 | 「图注写在图上方对吗」 | `writing-quarto` | 图与图注落点 |
| 20 | 「在非 git 目录里写一章」 | 都不出现 | 没有 git 根，门禁不通过 |

## 验证与维护

- 结构检查：`scripts/checking-skill-links.mjs` 要求本页存在，两个技能的 description 关键词（`写作`、`布局`、`排版`、`润色`、`表格`、`颜色`、`字体`、`行距`、`Callout`）都能在本页找到，触发矩阵至少 12 行、反例至少 8 行。
- 人工抽样：改 description 或步骤表后，用 8–10 条正例、8–10 条反例各跑 3 次，触发率低于一半就改 description 的信号词，不改正文。
- 改 `SKILL.md` 的 `description` 必须同改本页的判据表与矩阵；只改矩阵不改 description，等于没改。
