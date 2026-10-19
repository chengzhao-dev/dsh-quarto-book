# 写作流程：步骤唯一入口

本文件是写作步骤的唯一入口；每个步骤只打开它登记的文件与 `##`，不提前加载整库。

## 写作步骤

从定任务到通过检查依次走完；后一步发现前一步没做完，退回那一步，不在当前步补结构。每步只打开该步登记的文件与 `##`；执行 how 在 `references/zh/writing-howto/tasks-structure.md` 对应节。

| 步骤 | 动作与产出 | 登记的依据与 how |
| --- | --- | --- |
| 1 定任务 | 读者做完能做什么，一条成功路径；语言课禁令、否定式预告、不写「下一节」在此判 | `chapter-writing.md`「叙事范围」；`conventions/writing/chapter-structure/skeleton.md`「六段块序列」；howto「定任务」 |
| 2 定结构 | 章与节顺序、一节一个结果、标题与正文对齐；章际衔接核对：第 N 章只用前面章节已建立的名字，新术语首次出现处落术语卡或行内括号；打开`conventions/writing/heading-fit/commitments.md`「纵向承诺链」逐条对照 8 条承诺，标题归并规则见下；二三级正文 token 区间见 `conventions/writing/size-budget.md`「分层上限」 | `chapter-writing.md`；`conventions/writing/heading-fit/commitments.md`「纵向承诺链」、`conventions/writing/heading-fit/hierarchy.md`「标题分层」；`conventions/writing/chapter-structure/task-sections.md`「六段块序列」；`conventions/writing/size-budget.md`「分层上限」；`conventions/writing/section-density/main-line.md`；`conventions/writing/section-flow/block-chain.md` 的知识文件「章级」「节内」「小节标题与正文对齐」；howto「定结构」 |
| 3 排列内容块 | 导语、列表、代码或图、收束、可选 Callout；一个围栏只放正在讲的那一块（紧邻常量与其直接使用行除外）；未定义名字的调用链整段删除 | 次序的权威是 `conventions/writing/qmd-element-cases/block-loop.md`「三级标题最小模块」；导语质量仍看同文件「内容块前后的闭环」；`authoring.md`；checklist 见 `conventions/writing/section-flow/block-chain.md` 的知识文件「块链检查清单」 |
| 4 定段落 | 先确认单位（这一段是散文段、列表项还是表格单元格），再套规则；一段一个对象、段间 given-new、主概念 1–3 个；拆核四步在此，不管句内分句次序 | `conventions/writing/paragraph-shape/semantic-split.md`「段落规则」「罗列短句成段禁令」「拆核四步（多核混段的拆段方法）」「段内同义堆叠禁令」；`conventions/writing/chinese-quality.md` 段落级审查 |
| 5 定句子 | 先确认单位（围栏内不是句子，列表项不当散文句改），再套规则；设计说明的分句角色链：事实 → 约束 → 因此选择；对象先行、一句一动作、一句不换对象（判定全文在 `conventions/writing/prose-theme.md`）、先条件后结论（换算短句见 `conventions/writing/list-craft.md` 的知识文件「列表选择」）、拉链句判定与三条改写在此；节首与句内代词按「代词不能代替未写出的对象」核对 | `conventions/writing/prose-theme.md`「一句不换对象」；`conventions/writing/sentence-craft/sentence-frame.md`「句内骨架」「拉链句」「代词不能代替未写出的对象」「一次对话」、`conventions/writing/sentence-craft/sentence-limits.md`「句子规则」「过简断裂禁令」「概念负荷」；`conventions/writing/chinese-quality.md`「句序与段落形态」 |
| 6 定用词 | 术语、语气、主动语态、禁用词；不改句序。「由 X 完成」在此改主动句，改完露出第二个核退回定段落。关系空壳动词在此改运算，不改句序 | `conventions/writing/chinese-quality.md`「术语与措辞」；`conventions/writing/chinese-voice-register.md`；`conventions/writing/chinese-voice-register.md`；`conventions/writing/sentence-craft/sentence-limits.md`「关系写成能核对的运算」；`scripts/verifying-content.py` 词表 |
| 7 定版式 | 标点、中英空格、列表还是散文、加粗、导语句数、源文件链接密度；列表是版式选择 | `conventions/writing/chinese-quality.md`「标点与中英混排」；`conventions/writing/list-craft.md` 的知识文件「列表选择」「加粗使用」；`conventions/writing/chapter-structure/skeleton.md` 导语限额；`conventions/writing/qmd-element-cases/block-loop.md` |
| 8 对案例 | 只说明某一步的前后对照，标题或首行标明步骤；改写不得违反更早的步骤 | `knowledge/cases/chinese-style/wording-cases.md`（案例库入口；低频章级对照在 `cases/appendix/`） |
| 9 通过检查 | `scripts/verifying-content.py`、`quarto render`；只检查，不发明新句，WARN 记台账 | 检查项各自守卫的步骤见 `scripts/verifying-content.py` 的模块注释 |

### 步骤分层（增量润色与全章重构共用）

九步的先后不变；增量润色按步走，全章重构按下面三层把该层全部重组：

- **章级（1–2）先定删留，不动句子。** 定任务只写「读者做完能做什么」和必须删的语言课、否定预告；定结构只排 `##` / `###`、常见错误和自测题。自测题在这一步就写成自洽的一问一答，题干写出对象名、不留给定句子再补；不留到定句子再发明。
- **节级（3–4）只拆块和段。** 排列内容块决定最小模块的次序（见「三级标题最小模块」），一个围栏只放正在讲的那一块；定段落用拆核四步把一段里的两个对象拆开、删掉换说法的辅句。这一步不改分句次序。
- **句级（5–7）才逐句拆开再写回去。** 定句子对每一句做完再进下一句：一个动作、事实然后约束然后选择、不是拉链句、主语是工程对象；需要拆的拆成两句，需要并的并成一句因果。定用词只换术语和主动语态，不改刚排好的句序；定版式只处理标点、列表、加粗和链接。
- **第 8 步不是再写一遍。** 对案例发生在离开每一步之前：这一步的改写去对照该步的正反例；全章写完后回读，发现违反更早步骤就退回那一步。
- **第 9 步一章一检查。** 通过检查不发明新句。

### 标题归并（在第 2 步执行）

- 标题口径（冻结，收敛 spine 与 heading-fit 的两套说法）：YAML `title` 只留对象名；任务级 `##` 允许「动作 + 读者已认识的对象」，概念、数据、判定用名词；三级标题名词优先；禁元叙述与空心题。操作顺序：先圈出目录里要扫到的对象，删掉指示（这一步、这次）、过程动词（记下、收进、用到）和数量（三种、九个），再检查同一二级下的三级标题句式是否一致；数字与形式见`conventions/writing/heading-fit/hierarchy.md` 的知识文件「标题字数」「形式规则」，不双写规则。
- 固定收尾「常见错误」「自测问题」「本章回顾」不合并、不降级；常见错误下面的症状继续用三级标题。
- 任务级二级标题只保留读者能单独做完的一件事。只负责解释下一块代码、命令或图的，降为三级标题；短到没有独立观察步骤的，连三级标题也不留，并进相邻正文。
- 一个任务级二级标题下设三级标题时至少两个；只有一个时并入二级标题正文，或补出同级标题。依据是阮一峰《中文技术文档的写作规范》的标题原则：二级标题是文章的主要部分，三级标题是它下面的步骤；同级标题避免只出现一个。
- 二三级正文 token 区间（单一任务节 200–1200、多任务节每节 400–1200、症状三级 60–240）的判定数字写在 `conventions/writing/size-budget.md`「分层上限」，由 `verifying-content.py` 判失败；三级标题的 token 只见`conventions/writing/size-budget.md`「分层上限」。

## 增量链（改规则）

1. 查 `conventions/INDEX.md` 与 `knowledge/INDEX.md`，只改一个文件里对应的 `##`；步骤表里点名的文件与标题必须真实存在。
2. 新规则先标明它属于哪一步：能放进已有 `##` 就放进去，不改步骤数量。
3. 超篇幅先拆 `##` 再写。
4. 同步更新写作流程、`SKILL.md`、索引与相关案例。
5. 改完运行 `scripts/verifying-content.py` 与 `quarto render`。
## 合并后路径表

| 层 | 文件 |
| --- | --- |
| 写作流程 | 本文件 |
| 写作 how 合并 | `references/zh/writing-howto/`（tasks-structure / paragraphs-sentences / wording-layout / signal-table / polish-process） |
| 章 how | `references/zh/chapter-writing.md` |
| 段/列表/同义/衔接/句内骨架 | `conventions/writing/paragraph-shape/rules.md`、`conventions/writing/paragraph-shape/semantic-split.md` |
| 润色判定 + 整篇布局 | `conventions/writing/chinese-quality.md` |
| 章骨架（六段块序列、有 class 的章的任务节） | `conventions/writing/chapter-structure/skeleton.md` |
| 篇幅预算（计数口径、分层上限） | `conventions/writing/size-budget.md` |
| 标题分层、标题字数与纵向承诺链 | `conventions/writing/heading-fit/hierarchy.md`、`conventions/writing/heading-fit/commitments.md` |
| 小节密度依据 | `conventions/writing/section-density/main-line.md` |
| 元素细则 | `conventions/writing/qmd-element-cases/block-loop.md`、`conventions/writing/qmd-element-cases/code-cases.md`、`conventions/writing/qmd-element-cases/layout-cases.md` |
| 术语 / 语气 | 知识 `conventions/writing/chinese-quality.md`「术语与措辞」 / `conventions/writing/chinese-voice-register.md` |
| 对照 | `knowledge/cases/chinese-style/wording-cases.md` |
