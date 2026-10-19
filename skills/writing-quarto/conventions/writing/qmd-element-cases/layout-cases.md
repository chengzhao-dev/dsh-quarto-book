---
kb_id: "bg-qmd-layout-cases-v1"
title: "Quarto 图表、表格与 Callout 细则"
domain: "quarto-writing"
subdomain: "writing"
tags: [callouts, density, mermaid]
level_range: [0, 5]
dependencies: [conventions/writing/qmd-element-cases/block-loop.md, conventions/writing/section-density/main-line.md]
created: "2026-10-18"
updated: "2026-10-18"
chunk_strategy: "semantic_heading"
---

# Quarto 图表、表格与 Callout 细则

代码与图的桥接、短表与宽表、盒子密度、Callout 与标题导语的细则。

## 代码与图的桥接

代码块引出 `{mermaid}` 图或 `{python}` 坐标图时按固定序列组织：代码块 → 桥接句 → 图（含 `fig-cap`）→ 图后新结论。固定序列的完整写法见 `writing-quarto` 技能 `references/quarto/authoring.md`「代码与图的桥接」，两条硬边界：

- 代码块与图之间必须有桥接句，说明图要核对代码已讲清的哪条关系；中间只有空行视为堆叠（`verifying-content.py` 的 DOC-E11 只要求相邻围栏留空行，空行不等于桥接正文）。
- 图后先给「从图带走的结论」或图外新信息，再进入下一块；小节以图收尾时，结论可并入桥接段，不在图后孤悬一句。图注已写明的信息不复述。坐标图计入盒子密度，口径见`conventions/rendering/coords-diagram.md` 与 `conventions/writing/section-density/callout-boxes.md` 的知识文件。
- 一图一事、同主题相邻、图不承载正文未写的新信息：一张图只核对一条已讲清的关系；代码与图主题不同时收束本对象再拆 `###`，禁止「代码 A → 短句拐弯 → 图讲 B → 再贴代码 C」的同节混排（三条边界的写法见 `references/quarto/authoring.md`「代码与图的桥接」）。
- 图前段只讲本页可见的对象，且单一主题：描述版式的句子其对象必须同页可见，引用前章画面时复述读者需要的关键事实（如行列取值 0 到 2），不指称前章画面的版式（「画面上方是列号」式会让读者翻回前章）；调用方行为等第二主题移出图前段（示例章定义坐标范围节两段并一段的改稿对照）。

图不能替代结论句：桥接句与图带走的结论缺任何一处，读者只有图没有判断依据。正反对照见`conventions/writing/qmd-element-cases/block-loop.md` 的知识文件「代码与图桥接对照」。

## 状态面板三态在页面上的摆法

数据项类型（画面、字符与取值的定稿见标识 `conventions/writing/chinese-quality.md` 的知识文件「数据项类型」）上页面只有两种摆法：三态是本页话题时，枚举出现之前放终端的这一行 `|   | X | O |`，点名顺序与从左到右一致；这一页已经有整盘画面时，指向上图里没有字母的那一格，不再放第二行。围栏里的行尾注释与头文件逐字一致。

## 短表与宽表

- **短标签 + 长说明两列表**：包 `::: {.compact-table}`，并设 `tbl-colwidths="[22,78]"`，不靠浏览器均分。
- **单元格都短的对照表**：只用 `::: {.compact-table}`。
- **列多或单元格长**（验收矩阵、路线图）：不用 compact；优先减列、拆表或把长句外移正文；宽表依赖既有横向滚动。
- 主题 CSS 全宽（`width: 100%`）、左对齐，与正文同宽不居中。表前一句问什么，表后一句结论。
- Pipe 表原生 `colwidth` 在本栈无效时用 Quarto `tbl-colwidths`；不为单表写 raw HTML。

## 盒子密度

盒子指代码块、表格、提示框、引用块、图表容器。密度阈值与权衡的唯一出处见`conventions/writing/section-density/callout-boxes.md` 的知识文件，本条不重写数字。

## Callout 克制且尾置

任务提醒型 Callout 只承载可跳过的提醒，使用 Quarto 内置类型（note/tip），放在任务末尾而不插在主线动作之间；不重复紧邻正文的命令、成功判据。影响当前操作的内容不能靠提示框隐藏。块后讲解列表与 Callout 的同义复述边界见`conventions/writing/section-flow/transition.md` 的知识文件「段间」（成功条件已在正文点名后，列表只映射机制，Callout 只补术语或列表未写明的一点，如 CTest 对 `COMMAND` 默认要求退出码 0，不重讲一遍故事）。

术语解释型 Callout 是就近放置的例外：承载术语卡，紧跟术语首次真正使用处，不计入尾置限额。一句同位短语能说清的说明保留行内括号，不升级为 Callout：

```markdown
::: {.callout-note title="术语：冒烟测试（smoke test）"}
业界对“程序能启动且基本行为正确”这类最基础检查的叫法。……
:::
```

一章 Callout 的个数见`conventions/writing/size-budget.md` 的知识文件，本段不写数字。Callout 挂在所属最小模块的收束段之后；默认不写；`warning` 只进「常见错误」节里的环境差异条目。何时升级为 Callout、何时留行内括号的判定出处是 `writing-quarto` 技能 `references/quarto/authoring.md`「Callout 升级判据」。

Callout 位置：说明型与术语卡 Callout 都放在它所补充的段落或小节内容的最后面，即解释文字全部出现之后再放盒子，不插在代码块与其解释之间。「紧跟使用处」指跟在该术语参与的那段解释后面，不是紧跟代码块。

术语卡不得是一行词典卡：正文只剩一句定义、判定条件留在别处时，把判定条件并入术语卡，或把定义并回正文、删除空卡。术语卡只能解释本节正文已经用过的词，并且这个词服务于本节标题的对象：卡不得是该词的第一次出现，本节任务用不到的概念删掉框。示例框不再用冒烟测试。

## 标题导语

`##` 下不强制写导语。只有导语补充任务顺序、前置条件、范围或标题没有表达的结果时才保留；把标题换一种说法的导语删除。代码块前不固定用冒号，冒号的合法场合见`conventions/writing/paragraph-shape/semantic-split.md` 的知识文件「散文伪标签冒号禁令」。
