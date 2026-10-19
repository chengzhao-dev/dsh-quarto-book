---
kb_id: "bg-task-routes-quarto-v1"
title: "写作任务路由"
domain: "quarto-writing"
subdomain: "routes"
tags: [task-routes]
level_range: [0, 5]
dependencies: []
created: "2026-10-18"
updated: "2026-10-18"
chunk_strategy: "semantic_heading"
---

# 写作任务路由

## 任务路由

按任务查对应文件；同一任务只打开需要的那一个。

| 任务 | kb_id |
| --- | --- |
| 写或改章节骨架、自测与收尾（步骤：定结构） | `conventions/writing/chapter-structure/skeleton.md`，对照见 `knowledge/cases/chinese-style/structure-shape.md`「自测问可观察结果」；自测题干代词禁令见 `conventions/writing/sentence-craft/sentence-frame.md`「代词不能代替未写出的对象」 |
| 核对篇幅预算（步骤：定结构） | `conventions/writing/size-budget.md` |
| 核对标题分层、标题字数与纵向承诺链（步骤：定结构） | `conventions/writing/heading-fit/hierarchy.md`（分层、字数）、`conventions/writing/heading-fit/commitments.md`（纵向承诺链） |
| 判断一章的关键、类章与能力章、查十章 title 与二级标题对照（步骤：定结构） | `conventions/writing/chapter-key.md` |
| 权衡小节密度与盒子比例（步骤：定结构） | `conventions/writing/section-density/callout-boxes.md` |
| 衔接段落与小节过渡、判断段中心写不出与一次对话的件数（步骤：定段落） | `conventions/writing/section-flow/transition.md`「段间」、`conventions/writing/sentence-craft/sentence-frame.md`「一次对话」 |
| 排设计说明的分句骨架（先依据后选择）、判断拉链句（两组对象配对，删任一仍成立） | `conventions/writing/sentence-craft/sentence-frame.md`「句内骨架」「拉链句」，对照见 `knowledge/cases/chinese-style/sentence-frame.md`「句内骨架：先依据后选择」「拉链句」（步骤：定句子） |
| 判断节首与句内代词有没有未写出的对象（步骤：定句子） | `conventions/writing/sentence-craft/sentence-frame.md`「代词不能代替未写出的对象」，对照见 `knowledge/cases/chinese-style/sentence-reference.md`「定结构与定句子：代词不能代替未写出的对象」 |
| 判断类型接线句、改口「接着看／第 N 个枚举」与全称被下一句否定（步骤：定句子） | `conventions/writing/sentence-craft/sentence-frame.md`「一次对话」，对照见 `knowledge/cases/chinese-style/paragraph-cases.md`「定段落：类型接线段整段删除」与 `knowledge/cases/chinese-style/sentence-frame.md`「定句子：两次说话拆成一次对话」 |
| 判断并列主语一致性、承前省略合法性、顿号层级（步骤：定句子） | `knowledge/cases/chinese-style/sentence-reference.md`「主语跳变与并列搭配不当」 |
| 统一语气（口语腔、公文腔、规划元叙述、压缩隐喻）（步骤：定用词） | `conventions/writing/chinese-voice-register.md` |
| 查术语与禁用词（步骤：定用词） | `conventions/writing/chinese-quality.md`、`scripts/verifying-content.py` |
| 判断正文能否给代码实体贴「是定义／是声明」标签、怎么交代实现在哪个文件（步骤：定用词） | `knowledge/cases/chinese-style/wording-cases.md`「术语标签对照句」，口径见 `conventions/writing/chinese-quality.md`「易混概念：声明与定义」 |
| 写代码块、列表、表格与 Callout（步骤：排列内容块） | `conventions/writing/qmd-element-cases/layout-cases.md` |
| 判断代码与图的放置节奏（一图一事、同主题相邻、拆节）（步骤：排列内容块） | `conventions/writing/qmd-element-cases/block-loop.md`，依据见 `conventions/writing/section-density/main-line.md` |
| 写代码块与图（mermaid/python 坐标图）之间的桥接正文（步骤：排列内容块） | `conventions/writing/qmd-element-cases/block-loop.md`、`conventions/rendering/coords-diagram.md`，对照见 `knowledge/cases/qmd-elements.md` |
| 判断块后正文与代码注释的分工、单段是否混对象、块后怎么指代围栏里的实体（步骤：排列内容块） | `conventions/writing/qmd-element-cases/block-loop.md`，对照见 `knowledge/cases/chinese-style/block-after.md`「块后复述注释」「单段混并列对象」「块后悬空指代」 |
| 判断同节递进代码块是否合并、多围栏导语形态、摘录导语怎么点名对象（步骤：排列内容块） | `conventions/writing/qmd-element-cases/block-loop.md`，对照见 `knowledge/cases/chinese-style/excerpt-lead.md`「递进片段合并」「多代码块一句导语」「摘录导语只报出处」、`knowledge/cases/chinese-style/layout-list.md`「未定义名字的调用链」「公式与换算讲解段」 |
| 判断导语或块后是否逐条释义、缺设计动机（步骤：排列内容块） | `conventions/writing/qmd-element-cases/block-loop.md`，对照见 `knowledge/cases/chinese-style/excerpt-lead.md`「逐条释义代替动机」 |
| 查句段与措辞的正反对照（步骤：对案例） | `knowledge/cases/chinese-style/wording-cases.md`（核心）、低频章级对照在 `cases/appendix/` |
| 改写句段、措辞与列表（步骤：对案例） | `knowledge/cases/chinese-style/wording-cases.md`；句段规则见 `conventions/writing/sentence-craft/sentence-frame.md`、`conventions/writing/list-craft.md` |
| 改写目录式堆砌（引言交付物清单、树后复述、树后换对象收束句）（步骤：对案例） | `knowledge/cases/chinese-style/structure-shape.md`「目录式堆砌」「树注释点名文件与问答式读法句」「树后换对象收束句」 |
| 写或评审代码旁白的工程叙事范围（语言课禁令）（步骤：定任务） | `references/zh/chapter-writing.md`、`knowledge/cases/chinese-style/language-scope.md` |
| 润色任意文件的中文行文（判定标准与流程）（步骤：全步骤） | `conventions/writing/chinese-quality.md`；执行流程见 `writing-quarto` 技能 `references/zh/writing-howto/tasks-structure.md` |
| 查 Quarto 元素写法正反对照 | `knowledge/cases/qmd-elements.md`（元素细则见 `conventions/writing/qmd-element-cases/block-loop.md`） |
| 写章引言的源文件链接与后文文件指称（每章每条仓库路径一条） | `conventions/writing/qmd-element-cases/code-cases.md`「代码块 filename 标注」，对照见 `knowledge/cases/chinese-style/excerpt-lead.md`「摘录链接密度」（步骤：定版式） |
| 查中文文档整篇布局（标题层级、引导、混排空格）（步骤：定版式） | `conventions/writing/chinese-quality.md`「标题层级与引导」 |
| 处理 include 与链接（步骤：定版式） | `conventions/rendering/quarto-conventions.md` |
| 写或改 Mermaid 图表 | `conventions/rendering/mermaid-conventions.md` |
| 画坐标轴类网格图（状态面板行列、二维下标） | `conventions/rendering/coords-diagram.md` |
