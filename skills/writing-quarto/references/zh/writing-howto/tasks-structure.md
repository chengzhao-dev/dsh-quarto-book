# 写作 how：定任务与定结构

原 writing-howto 的定任务与定结构步骤；降噪信号见 `signal-table.md`，润色流程见 `polish-process.md`。执行 how 判定依据在知识库，冲突时以 knowledge 条文为准（步骤见 `writing-spine.md`）。

## 何时打开

- 中文写作的最高优先规则（句长、术语、降噪、删改）与润色流程、小节主线 how 都在本文件；打开一条链后只读需要的 `##`。
- 依据与豁免不在此处：段/列表/衔接见标识 `references/zh/writing-howto/tasks-structure.md`，润色判定与布局见`conventions/writing/chinese-quality.md`，小节密度依据见`conventions/writing/section-density/main-line.md`，对照见`knowledge/cases/chinese-style/wording-cases.md` 的知识文件。

## 定任务：先让新人完成任务

- 开篇场景的写法见`conventions/writing/chapter-structure/skeleton.md` 的知识文件「无标题引言」。
- 每页一条成功路径与后置内容的判定见`conventions/writing/chinese-quality.md` 的知识文件；主线闭合见`conventions/writing/section-density/main-line.md` 的知识文件。
- 标准术语的首次解释与术语卡落点见`conventions/writing/chapter-structure/task-sections.md` 的知识文件（写法见 `authoring.md`）；缩写先写全称。
- 不假设读者知道工具名、命令参数、目录布局或错误输出代表的含义。
- 目录式堆砌禁令与清单下沉判据见`conventions/writing/chapter-structure/skeleton.md` 的知识文件。
- 标题与引言的单事承诺、承诺用词与 title 变更同步见`conventions/writing/heading-fit/hierarchy.md` 的知识文件。
- 语言课禁令、否定式预告、不写「下一节」都在这一步判：它们决定本章能不能出现某句，不是措辞问题（细则见`conventions/writing/sentence-craft/sentence-limits.md` 的知识文件「句子规则」、`chapter-writing.md`「叙事范围」）。

## 定结构：信息按动作排列

每个任务按「目标 → 执行 → 结果 → 必要解释」排列（序列依据见`conventions/writing/section-density/main-line.md` 的知识文件）：先说明这一步要解决什么；给出最少命令或操作；给出稳定、可观察的成功结果；只解释继续操作所需的细节。

任务节的讲述顺序与先定义后调用的判定见`conventions/writing/chapter-structure/skeleton.md` 的知识文件「任务序列」（对照见`knowledge/cases/chinese-style/structure-shape.md`）。

标题归并见 `writing-spine.md`「标题归并」；数字与形式见`conventions/writing/heading-fit/hierarchy.md`「标题字数」「形式规则」，不在此复制。

失败分支放到「常见错误」。可选说明与凑字数句（统计性凑句、导航复述段）的下沉与删除判定见`conventions/writing/paragraph-shape/rules.md` 的知识文件「凑字数禁令」。

## 定结构：小节主线与密度

密度依据与取舍见`conventions/writing/section-density/main-line.md`；篇幅量化兜底见`conventions/writing/size-budget.md`「分层上限」。执行要点：

- 任务型 `##` 的可验证结果与标题后首句判定见`conventions/writing/chapter-structure/skeleton.md` 的知识文件「任务序列」；`##` 承接 ≤2 句、`###` ≤1 句见`conventions/writing/size-budget.md` 的知识文件「分层上限」。
- 一节一条主操作路径与单个 `###` 一个对象的判定见`conventions/writing/section-density/main-line.md` 的知识文件；`###` 装不下新对象时按主题拆 `##`，三级标题个数见`conventions/writing/size-budget.md`，本文件不写上限。
- 标题归并的规则在 `writing-spine.md`，判定与固定收尾豁免见`conventions/writing/heading-fit/hierarchy.md` 的知识文件，判定数字在 `conventions/writing/size-budget.md`「分层上限」。
- 固定块序列「主线目标 → 最小动作 → 可见结果 → 一句收束 → 必要解释 → 延伸与边界」；命令与输出细则以 `references/quarto/terminal-validation.md` 为准。
- 相邻盒子之间交代判断依据的判定见`conventions/writing/section-density/callout-boxes.md` 的知识文件；代码与图之间的固定桥接序列见 `references/quarto/authoring.md`「代码与图的桥接」。
- 首句点名执行位置、`###` 规划、状态节点拆段与尾置 Callout 重量的判定见`conventions/writing/section-density/callout-boxes.md` 的知识文件。
- 长段拆分的判定见`conventions/writing/section-density/main-line.md` 的知识文件；假拆禁令见`conventions/writing/paragraph-shape/rules.md` 的知识文件。
- 细节安放：参数解释「参数 → 当前作用」一项一条；主线正文不超过 3 个短段落，主线代码和输出各不超过 1 块；一个段落点名的文件或路径标识不超过 2 个。
