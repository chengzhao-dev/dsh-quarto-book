---
kb_id: "bg-section-flow-block-chain-v1"
title: "小节对齐与块链检查清单"
domain: "quarto-writing"
subdomain: "writing"
tags: [section, checklist]
level_range: [0, 5]
dependencies: [conventions/writing/section-flow/transition.md, conventions/writing/qmd-element-cases/block-loop.md]
created: "2026-10-18"
updated: "2026-10-18"
chunk_strategy: "semantic_heading"
---

# 小节对齐与块链检查清单

小节标题与正文对齐、块链检查清单、豁免与机械检查；章级衔接见 `conventions/writing/section-flow/transition.md`。

## 小节标题与正文对齐

小节标题用了读者没学过的术语怎么办：标题要么已建立、要么当场用实物建立，做不到就下沉。规则如下：

- 小节标题、首句和正文指向同一个动作或对象；标题说「做什么」，正文就只写怎么做、看到什么算成功。对象是否对齐，按`conventions/writing/heading-fit/commitments.md` 的知识文件「纵向承诺链」第 4、5 条核对。块后许可的新信息不豁免标题对齐：树后或块后补写的内容，主语仍须是本节标题的对象，换成另一对象即视为换节。后文小节专讲的对象不提前交接，判法见`conventions/writing/sentence-craft/sentence-frame.md` 的知识文件「句内骨架」。
- 标题的词性、空心题与术语禁令见`conventions/writing/heading-fit/hierarchy.md` 的知识文件「标题分层」；术语要么已被前文章节建立，要么当场用读者可核对的实物（目录、文件、代码）建立；做不到就把内容下沉到概念建立之后的章节，章际下沉见`conventions/writing/chapter-structure/skeleton.md` 的知识文件「章际衔接」。小节标题用了读者没学过的术语，就是这里要拦的;一句话压缩多个论断而读者无法逐条核对的，拆成可核对表述或删除；首句先给中心判断，再补机制，不先堆名称后给结论。正文论据同受此限：未在正文展示过的代码标识符（如测试概念建立前引用 `BoardTest`）不作论据，验证职责下沉到展示它的章节。改写对照见`knowledge/cases/chinese-style/structure-shape.md` 的知识文件「小节标题抽象与首句无中心」。
- 操作小节（如「运行一键脚本」）只保留动作、顺序与可见结果。「为何不跳过某步 / 幂等 / 配置漂移」类工程取舍，删除后不影响首次跑通与验收的，不进该节正文；确需保留时由代码注释或排查节承担。
- 跨节复述同一取舍视为标题离题的变体：该内容归属最贴合的节（如「修改 CMakeLists 后行为没变」），其余位置只保留一句或链接。

## 块链检查清单

段落之外，标题、列表、代码、表、图与 Callout 之间按以下闭环核对；每条只指回权威出处，不另立第二份长文：

| 边界 | 规则摘要 | 权威 |
| --- | --- | --- |
| 标题 → 正文 | 标题下至少一句引导；禁止 `##` 后立刻 `###` 叠标题 | `conventions/writing/chapter-structure/skeleton.md` 与 `conventions/writing/qmd-element-cases/block-loop.md` 的知识文件 |
| 段 → 列表 | lead-in 含主谓、点名列表将展开的维度；完整句可用句号，明确「如下」时用冒号；列表项平行且字数带 | `conventions/writing/list-craft.md` 的知识文件「列表选择」 |
| 段 → 代码 | 一句完整导语（对象标识符 + 谁调用/做什么）→ 围栏；禁块前半句 + 块后补半句；函数或枚举围栏前固定两句：第一句接住上一句的对象，第二句使用紧随围栏里 `///` 第一句的动词和对象，位置写成「定义在 `文件` 里」，不用「声明在」 | `conventions/writing/qmd-element-cases/block-loop.md` 的知识文件「内容块前后的闭环」 |
| 代码 → 图 | 代码 → 桥接句 → 图 → 图后结论；空行 ≠ 桥接 | `conventions/writing/qmd-element-cases/layout-cases.md` 的知识文件「代码与图的桥接」 |
| 段 → 表 | 关系句引出 → 表 → 表后结论句 | `conventions/writing/qmd-element-cases/layout-cases.md` 的知识文件「短表与宽表」 |
| 任意块 → Callout | Callout 只承载可跳过提示，不复述块内已写信息，不承载唯一成功判据 | `conventions/writing/qmd-element-cases/layout-cases.md` 的知识文件「Callout 克制且尾置」 |
| 节尾 → 下节 | 下节首句接住上节对象；禁正文「下一节/上一节」；章末「下一章」仅在回顾 | 本文件「段间」、`conventions/writing/chapter-structure/skeleton.md` 的知识文件 |
| 章际 → 本章 | 第 N 章引言、任务节与自测题只用 1..N-1 章已建立的名字；新术语首次出现处就近落术语卡或行内括号 | `conventions/writing/chapter-structure/task-sections.md` 的知识文件「六段块序列」 |

## 豁免与边界

- 块级前后闭环（三级标题最小模块）见`conventions/writing/qmd-element-cases/code-cases.md` 的知识文件；本文件管段落与小节之间的衔接，不重复块内规则。
- 多命令代码块后的逐条讲解，见`conventions/writing/paragraph-shape/rules.md` 的知识文件「段落规则」。
- 小节承接正文权重与盒子密度见`conventions/writing/section-density/callout-boxes.md` 的知识文件。
- 散文冒号豁免清单与表格单元格、协议字面量的豁免见`conventions/writing/paragraph-shape/semantic-split.md` 的知识文件「散文伪标签冒号禁令」；代码注释的冒号句式按标识 `conventions/writing/qmd-element-cases/code-cases.md` 的知识文件「键值配置」判。

## 机械检查

- 引章两个散文段、导语 token 与句数、段落篇幅：`verifying-content.py` 自动执行（限额见`conventions/writing/chapter-structure/skeleton.md` 的知识文件）。
- 普通自然段低于 token 下限：`verifying-content.py` 自动执行；豁免清单见`conventions/writing/size-budget.md` 的知识文件「分层上限」。
- 同段连续分句引入新的行内代码标识且无回指词：启发式 WARN，不追清零；高精度过简清单仍靠人工对照 cases。
- 读者正文「下一节／上一节」、罗列短句信号等高精度项：`verifying-content.py`。
- 「由…完成」被动交接（句内骨架判定信号之一，见`conventions/writing/sentence-craft/sentence-frame.md` 的知识文件「句内骨架」）：`verifying-content.py` 仅对读者 qmd 围栏外正文硬拦；`.agents` 案例可引用反例，不扫。
- 拉链句高频词「分别交给」「各说一层」（见`conventions/writing/sentence-craft/sentence-frame.md` 的知识文件「拉链句」）：`verifying-content.py` 仅对读者正文硬拦；宽泛的「分别」不拦，留给人工对照案例。
- 散文伪标签冒号与段内同义堆叠（见`conventions/writing/paragraph-shape/semantic-split.md` 的知识文件）：`verifying-content.py` 启发式 WARN（人工判，不追清零）。
- 句子模块切分的三类失败（类型接线句、「接着看／第 N 个枚举」改口、全称被下一句否定，见`conventions/writing/sentence-craft/sentence-frame.md` 的知识文件「一次对话」）：`verifying-content.py` 全量执行；段中心写不出与对话件数不做正则，留给步骤与案例。

## 交叉引用
