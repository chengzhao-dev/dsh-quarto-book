---
kb_id: "bg-section-density-main-line-v1"
title: "教学小节的主线收束与信息分层"
domain: "quarto-writing"
subdomain: "writing"
tags: [density, mainline]
level_range: [0, 5]
dependencies: [conventions/writing/chapter-structure/skeleton.md]
created: "2026-10-18"
updated: "2026-10-18"
chunk_strategy: "semantic_heading"
---

# 教学小节的主线收束与信息分层

页面节奏、一图一事与主线闭合的取舍依据；Callout 与盒子比例见 `conventions/writing/section-density/callout-boxes.md`。

## 页面宽度与垂直节奏

页面“紧凑”通常有两个来源：正文列太窄导致无谓换行，或块之间缺少承接留白。优先小幅放宽 Quarto HTML grid 的 `body-width`，再用共享 CSS 调整正文块间距；不要只放大字体，也不要用局部规则给每个块重复加 margin。正文列仍需保留 `max-width: 100%`，代码和宽表在窄屏上继续滚动或换行。

当前仓库采用 840px 的正文内容列和约 1.55rem 的普通块间距，代码块连续出现时保留更大的间隔。代码块与正文同宽：不再对代码做二次限宽（`--code-max-width` 已删除），宽屏两侧留白属主流文档站（VitePress 1440 壳/688 正文）正常行为，不按显示器拉满正文。872px/840px 的取值依据（100 列代码不折行）见标识 `../designing-theme/knowledge/reading-surface.md` 的知识文件。评估重点是：每个任务是否有清晰的动作与结果、连续盒子之间是否有解释段、移动端是否出现横向溢出。这里不设置依赖浏览器截图的硬阈值，最终以 `quarto render` 后的 HTML 结构和实际阅读抽查为准。

Quarto 通过 HTML grid 控制正文、侧栏和目录列，代码块的 `filename`、换行和复制行为由代码块配置及 CSS 共同控制；页面宽度与代码标题过长是两个独立问题。

## 一图一事与同主题相邻

图是读者视觉负荷最高的盒子：一张图同时表达两条关系时，读者要同时在脑子里维护两个对照，图前正文与图后结论也各要写两遍才能闭环。因此一张图只核对一条已讲清的关系，需要两条就拆图或拆节；一图一事与主题错位拆 `###` 的边界见`conventions/writing/qmd-element-cases/layout-cases.md` 的知识文件「代码与图的桥接」。代码与图相邻的前提是同一对象：图讲 B 而前后代码讲 A、C 时，读者被迫在三个对象间跳转，这正是「代码 A → 短句拐弯 → 图讲 B → 再贴代码 C」式堆叠的成因。主题错位时先用一句正文收束本对象，再另起 `###`。图中的每个框和箭头都应能在图前正文找到出处；图引入正文没有的概念时，读者只能靠猜。写法见 `writing-quarto` 技能 `references/quarto/authoring.md`「代码与图的桥接」。

## 来源

- [Quarto HTML grid 与代码块](https://quarto.org/docs/output-formats/html-code.html)
- [Quarto Markdown 源码块](https://quarto.org/docs/authoring/markdown-basics.html#source-code)
- [Quarto HTML themes](https://quarto.org/docs/output-formats/html-themes.html)
- [Quarto Books](https://quarto.org/docs/books/)

## 主线必须先闭合

读者在教程中需要不断确认"我现在做什么"和"我是否做对了"。如果命令、输出、参数解释和下一步背景交错出现，读者必须频繁切换目标，无法判断哪一块是必经步骤。先给唯一动作和可见结果，再补解释，能把首次成功压缩成一条可回放的路径。

主线闭合要求一节只有一个要闭合的目标：标题、第一句、动作和验收输出指向同一个结果，中途出现第二个独立动作时，读者就无法判断当前在等哪一个。任务粒度本身的判定标准属于页面结构，见`conventions/writing/chapter-structure/skeleton.md` 的知识文件。

标题对齐同时排除离题辩白：操作小节里与标题无关的工程取舍长论（「为何不跳过某步 / 幂等 / 配置漂移」类）让读者在动作中途读辩白，主线被打断；执行规则见`conventions/writing/section-flow/block-chain.md` 的知识文件「小节标题与正文对齐」。

当多个 `###` 共享同一阶段、环境或产物时，可以用父级 `##` 统摄，但父级只负责分组，不能把两个各自可验收的任务压成一个模糊标题。父标题要写清当前阶段或范围，子标题继续使用可执行、可观察的任务名。

## 长段拆分的判断依据

长段的问题不在于占据多少行，而在于它要求读者同时记住多个职责。主线动作、成功判据和可跳过说明压在同一段时，只读必要内容的读者必须重新寻找下一步，逐字阅读的读者又无法判断哪些细节可以跳过。按职责拆成短段，能让首次执行和回看细节两条路径自然分开。

普通 Callout 不能成为细节垃圾桶。把可以跳过的内容集中进提示框后，读者仍要判断这段是否影响当前任务，而且视觉上独立的盒子容易像必经步骤。只有删除后不影响首次成功和验收的信息才适合下沉，并且一个最小模块最多一个 Callout，一章的个数见`conventions/writing/size-budget.md`；术语解释型 Callout 是就近放置的例外，写法与限制见`conventions/writing/qmd-element-cases/layout-cases.md` 的知识文件。稳定界面判据与它的解释同框时，另见下节约束。

合并与拆分都按信息职责判断，不按固定字数。同一状态内部的账号创建和正常现象可以合并。成功判据与后续执行范围进入下一个状态时另起一段，即使它们仍属于同一次首次启动流程。
