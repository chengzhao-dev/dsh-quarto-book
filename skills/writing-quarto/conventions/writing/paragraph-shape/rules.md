---
kb_id: "bg-paragraph-rules-v1"
title: "段落形态与拆分规则"
domain: "quarto-writing"
subdomain: "writing"
tags: [paragraph, split]
level_range: [0, 5]
dependencies: [conventions/writing/sentence-craft/sentence-frame.md, conventions/writing/list-craft.md]
created: "2026-10-18"
updated: "2026-10-18"
chunk_strategy: "semantic_heading"
---

# 段落形态与拆分规则

段落规则、罗列短句、凑字数与拆分判据；同义堆叠与拆核四步见 `conventions/writing/paragraph-shape/semantic-split.md`。

## 段落规则

一段最多容纳一个主题。其余规则：

- 每段只有一个主题或中心句；中心句放在段首，后面的句子都服务于它。段内句子改完后，段首仍是中心句，一段仍只有一个对象；句子的六个成分见`conventions/writing/sentence-craft/sentence-frame.md` 的知识文件「六个成分」。
- 一段一对象：同一段不夹杂两个并列对象，对象切换必须新起段；配套列表只服务本段对象，不得跨对象拼装列表项（对照见`knowledge/cases/chinese-style/block-after.md` 的知识文件「单段混并列对象」）。
- 段落不超过 7 行，最佳 4 行以内；超过即拆或改列表。
- 多个独立概念禁止塞进同一段：承接、目标、范围边界、阅读顺序、术语解释各归各段。
- 段落之间用一个空行分隔，段首不缩进。
- 代码块后的逐条讲解用无序列表：每项格式为「行内代码标识符 + 全角冒号 + 一句职责」（如 `` `enable_testing()`：开启 CTest。``），描述从简，全页标记方式一致；列表前保留一句引言交代工程语境，列表后需要时补一句收束或尾置 Callout。有先后顺序的排查步骤仍用有序列表；块前导语直接点名对象做什么，不用「先…再…最后…」，元计数禁令见`conventions/writing/qmd-element-cases/code-cases.md` 的知识文件。
- 删段还是拆段，先按`conventions/writing/sentence-craft/sentence-frame.md` 的知识文件「一次对话」数这段有几件内容再定删或拆；判定全文见该文件「一次对话」。

### 拆段触发表

段落拆分不只按行数硬切，命中下表任一信号即拆段或改形态（列表 / 代码 / 图）：

| 信号 | 动作 |
| --- | --- |
| 段内出现第二个互不依赖的对象或主题 | 新起段；新段首句接住上段对象（衔接见`conventions/writing/section-flow/transition.md` 的知识文件「段间：过渡句只在话题切换处」） |
| 段内出现「话题标签：解释」词条式冒号，或两个以上互不依赖的中心并列推进 | 按「拆核四步」判关系：递进同段衔接推进，并列拆段；词条式冒号改完整主谓句（见「散文伪标签冒号禁令」） |
| 一段同时承担「承接上一章」+「本章交付物清单」+「源文件位置」+「摘录声明」 | 章引言不拆段，形态硬限与摘录声明删除见`conventions/writing/chapter-structure/skeleton.md` 的知识文件；其他段落按职责拆段，交付物多项且需扫读 → 列表（目录式堆砌对照见`knowledge/cases/chinese-style/structure-shape.md` 的知识文件） |
| 超过约 4 行舒适带、或逼近 7 行 / 篇幅 token 上限 | 先找逻辑边界拆，禁止为凑行数在句中腰斩 |
| 连续 ≥3 段纯散文且无列表/代码/图 | 改写见`conventions/writing/chinese-quality.md` 的知识文件「句序与段落形态」 |
| 满篇单句段、句间无衔接 | 合并为连贯多句段，或改成列表 |
| 逗号、句号后分句换新主语、新事实，无回指、无承接词 | 过简断裂改写见`conventions/writing/sentence-craft/sentence-limits.md` 的知识文件「过简断裂禁令」 |
| 一段出现第 4 个互不依赖的主概念 | 拆段或改列表见`conventions/writing/sentence-craft/sentence-limits.md` 的知识文件「概念负荷」 |
| 一句多中心、分号串两事、>40 字多动作 | 先拆句，再判是否还需拆段；同档并句不按超长句拆，异档不并进一句，判定见`conventions/writing/sentence-craft/sentence-limits.md` 的知识文件「同档并句」 |

假拆禁令：不为「段数好看」把同一中心拆成两段同义反复（相邻同义合并见`conventions/writing/section-flow/transition.md` 的知识文件「段间：过渡句只在话题切换处」）；不为对齐列表而去拆段或填第二中心；章引言多中心的形态契约见`conventions/writing/chapter-structure/skeleton.md` 的知识文件「六段块序列」。

## 罗列短句成段禁令

- 禁止把多个各自成句、互不衔接的罗列式短句机械堆进同一段：每句单看成立不等于段落成立，句号串联的清单式段落让读者在句间自行补关系。
- 确认一个中心主题后，围绕段首中心句用衔接关系（…时、一旦、则、因此）把相关动作组织成连贯的完整句；单句长度与拆句触发仍守`conventions/writing/sentence-craft/sentence-limits.md` 的知识文件「句子规则」，不为连贯写超长句。同档并句不按超长句拆，异档不并进一句，判定见`conventions/writing/sentence-craft/sentence-limits.md` 的知识文件「同档并句」。
- 真正并列、需要扫读的项改用列表（详见`conventions/writing/list-craft.md` 的知识文件「列表选择」）。
- 判定信号：段内句子逐句可删、互不引用；句间没有承接、因果或时序词；逐句像要点罗列。改写对照见`knowledge/cases/chinese-style/sentence-brevity.md` 的知识文件「罗列短句成段」。

## 凑字数禁令

信息密度以读者判断所需为准，不以篇幅为准。篇幅超限时先删下面这些句式，再考虑拆页；以下句式在 `content/**` 正文一律禁止：

- 统计性凑句：「文件只有 X 行」「真正执行的只有 X 行」「一共只有 X 个」这类数字统计。数字本身影响读者判断时（规模超出预期、需要据此决定读法）才允许出现，纯描述规模一律删除。
- 导航复述段：含「先看…再看…」的句子按`conventions/writing/sentence-craft/sentence-limits.md` 的知识文件「句子规则」整句删除，不单指「接下来先看」；与 `##` 标题结构重复的段落同样删除，读者从标题自身即可获得导航。
- 同义反复：同一事实在承接句、代码块 filename、树内注释、列表项中重复出现时只保留一处。相邻段落同义合并见`conventions/writing/section-flow/transition.md` 的知识文件「段间」。代码围栏的块后复述由`conventions/writing/qmd-element-cases/block-loop.md` 的知识文件「禁止正文复述围栏内注释」管辖（对照见`knowledge/cases/chinese-style/block-after.md` 的知识文件「块后复述注释」）。同一禁令再延伸到公开接口旁白：禁止「接口清单压缩段」——把私有成员、公开成员名单、`const`、`[[nodiscard]]` 等压进同一段；定稿为场景 → 代码 → 块后只补注释未写的工程信息（对照见`knowledge/cases/chinese-style/paragraph-opening.md`「接口清单压缩段」）。
- 判断标准：一句删掉后主线闭环不受影响、且答不出「删掉它读者会做错什么」，默认删除。

## 拆分判据

读到一句话同时回答两个问题时必须拆分，典型信号：

- 一段里出现两次以上括号补充；
- 读者无法用一句话复述这段在说什么；
- 段落同时含「结论 + 原因 + 反例 + 后续动作」中三项以上，拆成按职责分的短段。

## 多问一答拆分

自测答案要怎么折叠，先看这一问该不该拆：自测答案或正文若同时回答两个以上独立问题，按「引言 → 按问拆段或引导词列表 → 收束」组织，禁止把多个问题压进一段：

- **引言**：一句点明对象之间的关系（如「配置和构建是两件不同的事」）。
- **展开**：每个问题一段，或用加粗引导词列表（`**配置**：…` / `**构建**：…`）；两项且能写进一句的仍可保留正文。
- **收束**：一句写出操作后果或因果（如「改了 CMakeLists.txt 要重跑配置」）。
- 典型禁例：把「谁做配置、谁做构建、何时重配」压进同一段；改写对照见`knowledge/cases/chinese-style/paragraph-opening.md` 的知识文件。
