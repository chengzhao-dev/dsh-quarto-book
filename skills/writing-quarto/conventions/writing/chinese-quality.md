---
kb_id: "bg-chinese-quality-v1"
title: "中文行文润色与整篇布局总纲"
domain: "quarto-writing"
subdomain: "writing"
tags: [chinese, polish, clarity, grammar, coherence, redundancy, layout, heading, spacing]
replaces: [conventions/writing/chinese-quality.md, conventions/writing/chinese-quality.md]
level_range: [0, 5]
dependencies: [conventions/writing/paragraph-shape/rules.md, conventions/writing/sentence-craft/sentence-frame.md, conventions/writing/list-craft.md, conventions/writing/section-flow/transition.md, conventions/writing/chapter-structure/skeleton.md, conventions/writing/heading-fit/hierarchy.md]
created: "2026-10-09"
updated: "2026-10-16"
chunk_strategy: "semantic_heading"
estimated_tokens: 4400
---

# 中文行文润色与整篇布局总纲

本文件是本项目全部中文载体（读者散文、代码注释、agent 文档、配置注释）润色与整篇布局的判定总纲：回答「看什么、怎么判」。执行流程见 `writing-quarto` 技能 `references/zh/writing-howto/polish-process.md`「润色流程」；段落与衔接细则按 `references/zh/writing-howto/tasks-structure.md`取四个叶子文件；句段正反对照见`knowledge/cases/chinese-style/wording-cases.md` 的知识文件；语气与豁免见`conventions/writing/chinese-voice-register.md` 的知识文件。判定依据锚定主流规范：搭配、省略与指代各条锚定吕叔湘、朱德熙《语法修辞讲话》与语文教学、编辑质检共识；顿号层级锚定 GB/T 15834—2011《标点符号用法》；句长与欧化信号锚定阮一峰《中文技术文档的写作规范》和余光中〈中文的常态与变态〉。

## 目录

- [三层审查](#三层审查)
- [不同文件的语气](#不同文件的语气)
- [七个质量维度](#七个质量维度)
- [句序与段落形态](#句序与段落形态)
- [句子级病类清单](#句子级病类清单)
- [标题层级与引导](#标题层级与引导)
- [标题与表格格](#标题与表格格)
- [段落与句子](#段落与句子)
- [标点与中英混排](#标点与中英混排)
- [外部规范对照](#外部规范对照)

## 适用范围

- 管「句子怎么判为不合格、整篇布局怎么核对」：先定篇章结构，再逐句润色。
- 段落形态、列表与段间衔接由写作路由的四个叶子文件约束（路由见 `references/zh/writing-howto/tasks-structure.md`）；页面骨架与篇幅 token 由`conventions/writing/chapter-structure/skeleton.md` 与 `conventions/writing/size-budget.md` 的知识文件约束；标题分层与标题字数由`conventions/writing/heading-fit/hierarchy.md` 的知识文件约束，纵向承诺链由`conventions/writing/heading-fit/commitments.md` 的知识文件约束。

## 三层审查

润色按三个层级推进；高层问题不先定，低层改写会白做：

1. **篇章级**：全篇只保留一条成功路径，章节与小节顺序服务这条路径，无跳脱话题；开头交代读者做什么、完成后得到什么。
2. **段落级**：段落与段间条文见`conventions/writing/paragraph-shape/rules.md` 的知识文件，衔接见`conventions/writing/section-flow/transition.md` 的知识文件「段间」。
3. **句子级**：逐句过「七个质量维度」与「句子级病类清单」。

## 不同文件的语气

同一套维度在不同载体上的强制范围不同；豁免不是放行语法错误，是放行语气形态：

| 载体 | 强制范围 | 豁免 |
| --- | --- | --- |
| 读者散文（qmd、README） | 三层级全部 | 无 |
| 代码注释（C++、sh、CMake、Python、JSONC、toml、CSS、clang 配置） | 句子级的搭配、指代、术语一致、不冗余、不拗口；注释符与动词对齐遵守标识 `conventions/writing/qmd-element-cases/code-cases.md` 的知识文件「注释语言与内容风格」 | 不强制段级中心；单行注释可为短语 |
| agent 文档（.agents/**） | 句子级语法硬伤 | 压缩语气豁免见`conventions/writing/chinese-voice-register.md` 的知识文件；表格项、标题短语不按完整句判 |
| 配置键注释（toml/yaml/jsonc） | 同代码注释 | 同代码注释 |

## 七个质量维度

每个维度给可操作判定信号，命中即改写：

1. **中心明确**：判定见`conventions/writing/paragraph-shape/rules.md` 的知识文件「段落规则」（对照见`knowledge/cases/chinese-style/block-after.md` 的知识文件「单段混并列对象」）。
2. **简洁**：把候选词句删掉，信息不变即删——无信息修饰（「非常」「其实」「完全」「简单来说」）、同义反复、重复交代的同一事实。
3. **连贯**：段间衔接的判法见`conventions/writing/section-flow/transition.md` 的知识文件「段间」；句序违背时序或因果即调整；连接词表达的关系与上下文不符即改。句间衔接遵守 given-new 与设计句骨架，判定见`conventions/writing/sentence-craft/sentence-frame.md` 的知识文件。
4. **可读性**：单句 20/40 字与拆句见`conventions/writing/sentence-craft/sentence-limits.md` 的知识文件「句子规则」；复合句拆成简单句或并列句；三项以上并列写成列表，不写伪连贯长句；换算豁免见`conventions/writing/list-craft.md` 的知识文件「列表选择」。同档并句的长度见`conventions/writing/sentence-craft/sentence-limits.md` 的知识文件「同档并句」。
5. **不拗口**：命中即重写——三重定语链；一句里连续三个「的」；名词化堆叠（「进行 X 的实现」「对 X 作出更新」）；双介词嵌套（「在…中通过…对…」）。
6. **指代明确**：「这 N 个」「它们」「其」的先行词必须唯一且紧邻；承前省略的判法见`conventions/writing/sentence-craft/sentence-frame.md` 的知识文件「六个成分」。
7. **不冗余**：同一事实只讲一次与固定表述豁免的判定见`conventions/writing/paragraph-shape/semantic-split.md` 的知识文件「段内同义堆叠禁令」（对照见`knowledge/cases/chinese-style/paragraph-cases.md` 的知识文件「相邻段落同义合并」）；同一对象同页统一称呼。

## 句序与段落形态

维度之外还有四条形态硬规则，读者正文（`content/**`）命中即改：

- **对象先行**：句子按「对象 → 名称 → 约束 → 出处」排；禁「代码把它写成」式把源码当施事的元叙述开场，也禁「因此记作」「写成 `class`」等以源码为主语的句子。对照见`knowledge/cases/chinese-style/language-scope.md` 的知识文件「元叙述开场与对象先行」。
- **正常语序**：推荐「主语/对象 + 谓语 + 宾语 +（必要状语）」，本书工程句优先「对象 → 名称 → 约束 → 出处」。改写信号：句首「关于…」抽空主语；「代码把它写成」式元叙述倒装；长定语链把施事压到句末；英文式「被…所…」堆叠；状语（时间/处所）乱插导致主谓隔断。与「对象先行」同向，不另开 kb。
- **连续纯散文上限**：同一小节连续 ≥3 段纯散文（中间无列表、代码块、图或表）即改「一句中心 + 列表/代码/图」；判定信号：删任一段其余仍成立、段间无承接。
- **禁小节导航**：正文「下一节／上一节」的禁令与豁免见`conventions/writing/section-flow/transition.md` 的知识文件「段间」。
- **换算句版式**：换算的写法见`conventions/writing/list-craft.md` 的知识文件「列表选择」。

六个成分和场景表不在本文件复述，见`conventions/writing/sentence-craft/sentence-frame.md` 的知识文件。

代码块门槛（哪些实现值得出围栏）见`conventions/writing/qmd-element-cases/code-cases.md` 的知识文件「代码块门槛」。

## 句子级病类清单

逐句判为不合格，命中即按括号内方式修；正反对照见`knowledge/cases/chinese-style/sentence-reference.md` 的知识文件「主语跳变与并列搭配不当」及各专名案例：

1. **搭配不当**：缩句成「主＋谓」「主＋是＋宾」核对，主谓、动宾、主宾任一不搭即换词或换句式（主宾搭配典型：目录是程序、章保存格子）。
2. **主语跳变**：并列或后续分句逐一还原主语，与首句施事不同即补名词或拆句（「操作后显示 X」主语继承到没有字母的格子）。
3. **并列成分不一致**：并列各项句法形式与施事必须同构，首项介词统领全列（「一行、一列或一条对角线上」→「在一行……上」）。
4. **顿号层级嵌套**：外层并列用逗号、内层用顿号；「以及」前用逗号（GB/T 15834—2011）。
5. **指代不明**：先行词不唯一或不在最近，换专名。
6. **紧缩并称释义**：把用途压成「一读一写」式并称、或省主语从句（「报告是否下满」），名字与动作的对应要读者自补，改写为显式映射（判定信号见「逐条释义代替动机」）。
7. **欧化措辞**：「进行／作出＋名词」改回动词；滥「的」滥「被」压缩；名词化主语段内一致时（如「读取直接抛出」的操作名）可留，否则补施事。
8. **破折号夹心与分号堆叠**：破折号夹解释的句子级判法见`conventions/writing/sentence-craft/sentence-frame.md` 的知识文件；冒号后用分号续第二个解释即拆（对照见「破折号夹心句」「冒号后堆叠分号解释」）。改冒号时只允许两种合法场合（完整句引出列表/围栏/图；列表项引导词后），散文词条式冒号的判定见`conventions/writing/paragraph-shape/semantic-split.md` 的知识文件「散文伪标签冒号禁令」。

## 标题层级与引导

- 标题层级、引导句、字数与命名检查见`conventions/writing/heading-fit/hierarchy.md` 的知识文件（「标题分层」「标题字数」）与 `conventions/writing/heading-fit/commitments.md` 的知识文件（「纵向承诺链」「命名检查」）。

## 标题与表格格

- 读者 qmd 标题的词性与空心题禁令见`conventions/writing/heading-fit/hierarchy.md` 的知识文件「标题字数」。本文件不另写一份。
- **读者表格格**写完整可核对的信息；禁电报省略到主谓不清；对象先行（先给对象，再给约束或结果）。
- **agents 标题**稳定可检索，禁日期后缀（既有 naming 检查）；与正文主题一致。
- **agents 表格格**允许短语压缩语气，但**禁止与新决定相反**（如格内仍写「`Get` 短名词句」），指代必须能回指列义。

## 段落与句子

段落长度与中心句条文以`conventions/writing/paragraph-shape/rules.md` 的知识文件为唯一出处（见该文件「段落规则」）；单句 20/40 字与多动作拆句见`conventions/writing/sentence-craft/sentence-limits.md` 的知识文件「句子规则」。本文件只保留句子级病类判法（见「句子级病类清单」）。

## 标点与中英混排

- 中文用全角标点；并列英文用顿号；中文与英文/数字之间留半角空格。
- 破折号夹解释的句子级判法见`conventions/writing/sentence-craft/sentence-frame.md` 的知识文件（冒号合法场合见`conventions/writing/paragraph-shape/semantic-split.md` 的知识文件「散文伪标签冒号禁令」）。
- `true` / `false` / `nullptr` 等 C++ 关键字用行内代码原样书写，不写中文译名。

## 外部规范对照

- 阮一峰《中文技术文档的写作规范》：句长、中英混排空格、标点全角；标题不跳级、同级不孤立。
- Google developer documentation style guide：一段一意、先给最重要信息；任务级标题用动词。
- 华为《中文技术文档写作风格指南》：标题层级与句式；段落长度条文统一指向`conventions/writing/paragraph-shape/rules.md` 的知识文件。
- GB/T 15834—2011《标点符号用法》：顿号层级与标点用法。
- 阿里 f2e-spec writing：中英混排与标点。
