---
kb_id: "bg-chinese-voice-register-v1"
title: "书面语气判定标准"
domain: "quarto-writing"
subdomain: "writing"
tags: [voice, register, tone, colloquial, planning-meta]
level_range: [0, 5]
dependencies: ["conventions/writing/chinese-quality.md", "knowledge/cases/chinese-style/wording-cases.md", "conventions/writing/chapter-structure/skeleton.md", "conventions/writing/heading-fit/hierarchy.md"]
created: "2026-09-28"
updated: "2026-10-16"
chunk_strategy: "semantic_heading"
estimated_tokens: 1050
---

# 书面语气判定标准

本文件定义 `content/**/*.qmd` 的正向语气标准。禁用词表（标识 `conventions/writing/chinese-quality.md` 的知识文件）回答「不能用哪个词」，本文件回答「合格的句子写成什么样」；通用句式降噪见 `writing-quarto` 技能 `references/zh/writing-howto/tasks-structure.md`。起因是全书语气轴不一致：开场页是讲义口语，引言里混用章节安排和刻板措辞，需要一条可判定的语气基准。

## 目标语气

中文技术工程文档的语气：陈述、可核对、主动语态。句子的三要素判法见`conventions/writing/sentence-craft/sentence-limits.md` 的知识文件「简洁边界」；允许自然衔接词，不堆砌「必须 / 应当 / 予以」。

## 两轴禁例与允许写法

| 轴 | 禁止 | 允许 |
| --- | --- | --- |
| 口语讲义腔 | 动手前、咱们、搞定、别慌；开场「先弄清三件事」式讲义口 | 进入实现前先确认…；确认 / 理解 / 查看 |
| 注释状态对 | 「空着」「放着」；用「尚未 / 已」配一对状态 | 一句让人看出是没有操作，还是操作是 X 或 O（行尾定稿见注释规范的定稿表） |
| 刻板公文腔 | 必须显式、永远、应让…；堆砌禁词后的电报省略 | 写成可观察条件或后果；完整陈述句 |
| 规划元叙述 | 本章规划、落点是、类型名只是设计方向、尚未对应可运行目录 | 直接写本章要解决的问题与目录路径；实现状态用「实现并通过验收前按设计页阅读」一句收束 |
| 压缩隐喻与过短句 | 契约链、状态外壳、地基、执行纪律、无先行词的闭环、消费、CLI 打印式省略主语 | 字面可核对：写具体对象（公共定义、状态码）、可观察前置条件（规则接口稳定）、完整流程（从开局输入到正常退出的一次）与完整主谓句（终端程序打印状态面板） |
| 人称 | 正文寒暄式第二人称开场 | 正文以工程对象为主语；「你」仅用于本章回顾与自测指令 |

## 句段改写步骤

段落或句子不合格时按序执行：

1. 段落主题与拆段见`conventions/writing/paragraph-shape/rules.md` 的知识文件「段落规则」；
2. 中心句条文见`conventions/writing/paragraph-shape/rules.md` 的知识文件「段落规则」；
3. 拆句与写全三要素见`conventions/writing/sentence-craft/sentence-limits.md` 的知识文件「句子规则」；
4. 相邻同义合并见`conventions/writing/section-flow/transition.md` 的知识文件「段间」；
5. 过渡位置见`conventions/writing/section-flow/transition.md` 的知识文件「段间」；
6. 操作节的取舍见`conventions/writing/section-flow/block-chain.md` 的知识文件「小节标题与正文对齐」。

## 判定信号

- 口语信号：出现对读者的招呼（动手前、先弄清、咱们）或寒暄式开场。
- 公文信号：删去「必须 / 应当 / 予以 / 永远」后句义不变，说明这些词只承担语气；改为写出不满足时的后果。
- 元叙述信号：句子主语是「本章 / 本页 / 写作计划」，内容讲的是章节安排而非工程对象。实现状态说明全页至多出现一次。
- 破损句信号：句子缺动作、对象或顺序，读者补不全；写全三要素的判法见`conventions/writing/sentence-craft/sentence-limits.md` 的知识文件「简洁边界」。

## 对照案例

讲义口与元叙述开场（「动手前先弄清三件事」「本章让单次动作可靠起来……落点是……」）的逐句正反对照统一保存在`knowledge/cases/chinese-style/wording-cases.md` 的知识文件「口语开场与规划套话」；引言三句模板（承接上一章、交出的结果、对应源文件）的结构位置见`conventions/writing/chapter-structure/skeleton.md` 的知识文件。
