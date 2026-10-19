---
kb_id: "bg-section-flow-transition-v1"
title: "章、节与段间的衔接规则"
domain: "quarto-writing"
subdomain: "writing"
tags: [section, transition]
level_range: [0, 5]
dependencies: [conventions/writing/chapter-structure/skeleton.md, conventions/writing/qmd-element-cases/block-loop.md]
created: "2026-10-18"
updated: "2026-10-18"
chunk_strategy: "semantic_heading"
---

# 章、节与段间的衔接规则

章级总—分—总、节内递进与段间过渡的规则；小节对齐与块链清单见 `conventions/writing/section-flow/block-chain.md`。

## 章级：总—分—总

- **总起**：无标题引言的构成见`conventions/writing/chapter-structure/skeleton.md` 的知识文件「六段块序列」；引言的宾语等于本章 YAML `title` 的对象（承诺链第 2 条，见`conventions/writing/heading-fit/commitments.md` 的知识文件「纵向承诺链」）。
- **分述**：正文 `##` 序列沿一条主线递进展开；每个 `##` 是一个可验证结果的判定见`conventions/writing/chapter-structure/skeleton.md` 的知识文件「任务序列」，每个 `###` 的中心名词与导语宾语按`conventions/writing/heading-fit/commitments.md` 的知识文件「纵向承诺链」第 4、5 条核对。
- **收束**：本章回顾照应引言提出的任务；首尾照应要求回顾能对上引言的承诺，不引入新概念；「下一章」后的名字等于 `_quarto.yml` 中下一章的 YAML `title`（承诺链第 7 条，见`conventions/writing/heading-fit/hierarchy.md` 的知识文件）。回顾的句数、句式与承接正文的要求以`conventions/writing/chapter-structure/skeleton.md` 的知识文件为准。
- 已有源文件的章要补齐自测与回顾。没有源文件的章的处理见`conventions/writing/chapter-structure/skeleton.md` 的知识文件。

## 节内：递进式为默认，并列式处理枚举

- 有先后或因果的内容用递进式展开，顺序依据见`conventions/writing/chapter-structure/skeleton.md` 的知识文件「任务序列」，段落顺序与执行顺序一致。
- 无先后关系的要点（边界清单、原则枚举）用并列式，列表选择规则见`conventions/writing/list-craft.md` 的知识文件「列表选择」。
- 同一小节内不混用：一条主线递进到底；并列枚举整体作为一个环节嵌在递进中。

## 段间：过渡句只在话题切换处

- 需要过渡的位置：段落话题或对象发生切换时（上一段讲 A 命令，下一段讲 B 命令；前一小节配置，本节运行）。同一段内句子推进、或下一段直接继续当前对象时，不加过渡。
- 段间衔接落在下一段第一句的主语；主语复用上段的宾语或话题，话题切换时仍先接住上文再引出本段。
- 形式：一句，放在新段段首，先接住上文（点明与上段的关系或结果），再引出本段中心。范例（示例章构建规则节首句）：「可执行目标之外，同一份构建规则还注册了本章唯一的自动化检查」——前半句接住上文的可执行目标，后半句引出新对象。
- 边界：过渡句服务主线判断，不复述标题结构。含「先看…再看…」的导航复述句整句删除，判法见`conventions/writing/paragraph-shape/rules.md` 的知识文件「凑字数禁令」；`##`/`###` 开头的承接句数见`conventions/writing/size-budget.md` 的知识文件「分层上限」。
- 相邻小节的首句同时是上一小节的承接位：写完上一小节结尾后检查下一小节首句是否接住读者，不在小节尾部再补预告句（与凑字数禁令同源）。
- **读者正文禁写「下一节／上一节」**：`content/**` 正文不得用「下一节…」「上一节…」预告或回指小节，衔接靠新节首句接住上文；章末的「下一章」保留。本文件讨论衔接位置时引用的这两个词是规则描述用语，不是允许正文照写的句式（`verifying-content.py` 对读者 qmd 与 agent 文档判失败，紧贴引号或反引号的术语引用豁免）。
- 相邻段落同义合并：相邻两段各自换一种说法讲同一事实时合并为一段，由后段的机制或结论接住前段的对象；合并后其余段落、列表和 Callout 不得再以第三种说法复述该事实。改写对照见`knowledge/cases/chinese-style/paragraph-cases.md` 的知识文件。
- 相邻两段不得各成独立说明书：第一段讲工具、第二段讲目录而彼此无衔接时，第二段段首要接住第一段的对象（工具基线 → 这些工具在编号目录上如何使用）；只删不接，两段仍然是两个条目。改写对照见`knowledge/cases/chinese-style/structure-shape.md` 的知识文件。
- 目录树后的正文不复述树内行尾注释：树注释已逐文件交代职责，再列一段「A 组件、B 目录与 C 目录各自带 CMakeLists.txt」是把树翻译成说明书目录。树注释的标记方式（目录 `#/`、文件 `#`、字母序、个数对齐）见`conventions/writing/section-density/main-line.md` 的知识文件；本条只管树后正文。树后保留的一句读法说明直述机制（「文件名给出位置，行尾注释说明职责」），不写「X 回答 A，Y 回答 B」的问答式并列；换成工具配置、依赖方向或「不参与 / 不依赖」类边界，即使树注释没写过，也删除或下沉，不得靠「新工程信息」留下（改写对照见`knowledge/cases/chinese-style/structure-shape.md` 的知识文件「目录式堆砌」「树后换对象收束句」）。
- 同一禁令延伸到代码围栏：块后不复述围栏内注释、单段并列对象按对象拆段的写法，见`conventions/writing/qmd-element-cases/block-loop.md` 的知识文件「内容块前后的闭环」与`conventions/writing/paragraph-shape/rules.md` 的知识文件「段落规则」（对照见`knowledge/cases/chinese-style/block-after.md` 的知识文件「块后复述注释」「单段混并列对象」）。
- **多代码块小节先判一次只摘一块**：同源围栏是否合并、每个围栏前的导语怎么写、每段最多「一句 + 一个配套块」，见`conventions/writing/qmd-element-cases/block-loop.md` 的知识文件「内容块前后的闭环」；函数或枚举围栏前固定两句的动词与 `///` 一致判法见`conventions/writing/sentence-craft/sentence-frame.md` 的知识文件；块后收束与两个最小模块的衔接见`conventions/writing/qmd-element-cases/block-loop.md`「三级标题最小模块」，本文件不另写一份。改写对照见`knowledge/cases/chinese-style/excerpt-lead.md` 的知识文件「多代码块一句导语」「递进片段合并」。
- 表格与对照表的承接句、表后结论句见`conventions/writing/qmd-element-cases/layout-cases.md` 的知识文件「短表与宽表」；禁用「X 与 Y 是两个容易混淆的词：」式元标签开场。
