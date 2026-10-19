---
kb_id: "bg-qmd-block-loop-v1"
title: "Quarto 内容块前后的闭环"
domain: "quarto-writing"
subdomain: "writing"
tags: [code-blocks, lead-in]
level_range: [0, 5]
dependencies: [knowledge/cases/chinese-style/block-after.md]
created: "2026-10-18"
updated: "2026-10-18"
chunk_strategy: "semantic_heading"
---

# Quarto 内容块前后的闭环

块前导语、围栏粒度与块后收束的闭环基准；元素细则拆见同目录 `code-cases.md` 与 `layout-cases.md`。

## 内容块前后的闭环

一个段落只推进一个对象；小节内出现代码块、列表或表格时，模块内部的次序见下文「三级标题最小模块」，本段只规定导语怎么写：块前用一句完整导语交代为什么看它（对象、谁调用、做什么）——对象写成读者要在块内观察的代码标识符（常量、类型、函数名），只报出处、不点名块内对象的「X 都定义在 state.h 里：」不算导语，读者对不上句中概念与围栏里的名字（对照见`knowledge/cases/chinese-style/excerpt-lead.md` 的知识文件「摘录导语只报出处」）；点名也不得退化为「`X` 做A、`Y` 做B」式的逐条释义，对象要组织进为什么看它的句子里（对照见`knowledge/cases/chinese-style/excerpt-lead.md` 的知识文件「逐条释义代替动机」）；块后只在有注释未覆盖的新信息时写一句；引言写判断依据，不写「如下：」式的空引导（GitHub 风格指南同款要求：解释文字放在代码块前面，而不是塞进代码注释）。导语预告的对象本体必须出现在导语句里，不得隔着代码块在块后才给出；算式不是例外，换算句式见`conventions/writing/list-craft.md` 的知识文件「列表选择」。

一个函数小节内部按「声明、一句行为、实现」排列，示例不出现在行为句之前；同一小节出现多个围栏时按阅读顺序排；先定义后调用与未定义名字调用链的处理见`conventions/writing/chapter-structure/skeleton.md` 的知识文件「任务序列」。编号步骤、节首概览或章引言用后文才定义的名字串起一条必须看懂的过程的，整段删除，不改写后留在原位；调用方的实现里第一次见到被调用函数、而该函数要到后面小节才讲的，调整顺序；点名后文章节的函数而那一章并不讲解它的，删掉也不补进那一章。允许：用读者已认识的词预告本节要做的事；同一小节内声明和一句行为紧挨代码；上一章已经讲过的名字。

讲函数体的小节三步固定：导语点名函数并写出头文件上的 `public:` 或 `private:`（如「`Board::HasLine` 声明在 `state.h` 的 `private:` 下」）；第一块围栏是头文件声明，访问说明符那一行留在围栏里；类成员的头文件摘录以源码里的 class 类名 { 或 struct 名 { 开头，接着保留该成员所属的 public:、private: 或 protected: 行，再摘成员，围栏以源码里的 }; 结束。省略的是其他成员，不是类头，也不写省略标记。自由函数、枚举和已经自带 struct 或 enum 的整段定义不另套 class。.cpp 围栏不插入 class 体或访问说明符。声明看不出的步骤才配下一块 `.cpp` 围栏，导语写「实现写在某个 `.cpp` 里」。只讲入口、不讲函数体的小节（如 `Board` 的读写入口）停在头文件声明，不配实现围栏；禁止在 `.cpp` 围栏里插入 `private:`，私有成员身份只由头文件围栏呈现。

同一 `##`/`###` 内 ≥2 个代码围栏时，先看是否是紧邻常量与其直接使用行：常量紧接着被下一行使用时，可放在同一个围栏。类型定义和后一步使用它的函数是两步，即使函数用到该类型也分成两块——一个围栏只放正在讲的那一个声明或函数，不把整份头文件、整份类或整条调用链贴进同一个围栏；后一个函数的函数体里可以调用已经讲过的名字，但不把那些函数的实现再贴一遍。每块前一句导语；`{python}` / `{mermaid}` 图或独立验证盒子打断处保持拆块。旧口径「同一小节递进片段必须合并为一个围栏」收窄到此：只有常量紧接着被下一行使用时才放在同一围栏。改写对照见`knowledge/cases/chinese-style/excerpt-lead.md` 的知识文件「递进片段合并」。

每个围栏在最小模块里的位置见「三级标题最小模块」。仍然禁止块前半句，禁止收束段把列表再讲一遍。可合并的块前与块后并成块前一句；简洁边界仍适用（`conventions/writing/sentence-craft/sentence-limits.md`）。细则与对照见`conventions/writing/sentence-craft/sentence-limits.md`、`knowledge/cases/chinese-style/excerpt-lead.md`「多代码块一句导语」。

以代码块为中段，导语讲工程语境（这段代码为什么存在、为什么此刻看它）；若有块后句，只讲注释没覆盖的新工程关系。语法细节不逐行展开。导语与块后都禁止关键字释义当开场：不写「X 是 `inline constexpr` 常量」「用 `enum class` 表达」「用有符号整型承载」「坐标字段为什么选定宽有符号」式语言课或选型旁白（除 01 设计章外工程 qmd 禁选型外链），改写对照见`knowledge/cases/chinese-style/language-scope.md` 的知识文件「语言课旁白与工程旁白」。

块后四条硬禁令：

- **禁止正文复述围栏内注释**：代码块内 `//` / `#` 注释已写明的意图、产物路径或字段含义，块后正文不得同义再讲一遍；块后只写注释没覆盖的新工程信息（谁调用、如何验证、与邻块或图的关系）。改写对照见`knowledge/cases/chinese-style/block-after.md` 的知识文件「块后复述注释」。
- **禁止单段夹杂多个并列对象**：一段一对象的通则见`conventions/writing/paragraph-shape/rules.md` 的知识文件「段落规则」；块后的递进依赖链不算并列：先按上文递进合并判定并成一块、块后列表分项，不按本条拆段。多代码块小节里每段最多一句 + 一个配套块。改写对照见`knowledge/cases/chinese-style/block-after.md` 的知识文件「单段混并列对象」与`knowledge/cases/chinese-style/excerpt-lead.md` 的知识文件「递进片段合并」。
- **禁止块后悬空指代围栏内的实体**：块后段落首次提及代码块引入的常量、类型或函数时点名标识符；先行词只出现在围栏里（不在任何句中）时，不得用「这三个常量」「它们」式省称开场。导语或前段已逐一点名后，后文才可用集合指称回指（与标识 `conventions/writing/chinese-quality.md` 的知识文件「公共定义」行同界）；建立多个对象的关系时用一句写全谁约束谁、谁派生自谁（模板见标识 `scripts/verifying-content.py` 的知识文件「禁用与替换」的契约链行）。改写对照见`knowledge/cases/chinese-style/block-after.md` 的知识文件「块后悬空指代」。
- **禁止块后正文逐条释义代替设计动机**：块后散文段落不是成员清单的重写，连续的「`标识符`＋动词短语」释义只回答「是什么」，要写出为什么这样设计、对调用方意味着什么，释义只在服务动机的句子里出现；公式的每一项是否拆成列表项，见`conventions/writing/list-craft.md` 的知识文件「列表选择」换算条。改写对照见`knowledge/cases/chinese-style/excerpt-lead.md` 的知识文件「逐条释义代替动机」。

渐进披露不进正文：语法细节延后展开是 Agent 侧写作策略，禁止把策略写成对读者的话——「语法细节留到后续章节真正用到时再展开」「本章只需认清……」这类元叙述一律不出现在 `content/**`；正文直接陈述对象和结果（如「这段程序对外可见的结果只有两处：……」），需要延后的内容保持沉默即可。改写对照见`knowledge/cases/chinese-style/wording-cases.md` 的知识文件，禁用词见标识 `conventions/writing/chinese-quality.md` 的知识文件。

列表与表格同律：表格前用一句完整的话交代它回答什么问题，表格后补一行读者该取走的结论；列表通则见`conventions/writing/paragraph-shape/rules.md` 的知识文件「段落规则」。命令、输出与正文三分见`conventions/writing/section-density/main-line.md` 的知识文件「命令、输出与细节各司其职」。

多命令块：块后逐条讲解的格式见`conventions/writing/paragraph-shape/rules.md` 的知识文件「段落规则」，引导词加粗与行内代码不叠加的边界见`conventions/writing/list-craft.md` 的知识文件。引言与收束按上段列表通则，不再按命令分段成多个段落。

代码块导语禁用「N 段命令定义」式元计数：直接点名这段规则定义的对象，不用「先…再…最后…」，不叫读者回数段落；改写对照见`conventions/writing/qmd-element-cases/code-cases.md` 的知识文件「代码块导语元计数对照」。
