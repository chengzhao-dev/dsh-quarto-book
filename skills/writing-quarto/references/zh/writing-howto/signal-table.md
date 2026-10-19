# 写作 how：信号表（句段与注释，按步骤命中即改）

信号、改法与知识锚点的速查表。

## 信号表（句段与注释，按步骤命中即改）

同一张表扫 `content/**` 与 `.agents/**`；载体差异按`conventions/writing/chinese-quality.md` 的「不同文件的语气」表（压缩语气豁免不适用于读者正文）。高精度项由 `verifying-content.py` 固化，其余靠人工过表；「步骤」列对齐 `writing-spine.md` 的写作步骤：

| 步骤 | 信号 | 判定 | 依据 |
| --- | --- | --- | --- |
| 定任务 | 正文「下一节／上一节」 | 删，改新节首句承接（章末「下一章」保留） | `references/zh/writing-howto/tasks-structure.md` |
| 定任务 | agent 免责腔（「服务于讲解」「片段不保证」「不等于文件内顺序」、台账口吻声明） | 读者正文整句删除；同源保证交给 verify，规则留 `.agents` | `conventions/writing/chapter-structure/skeleton.md`、`conventions/writing/chinese-voice-register.md` |
| 定结构 | 自测题干出现「这个／那个／这些／那些／哪个／哪些／哪一句／哪一层／哪一行／哪一块」（「什么」允许） | 题干写出被问的对象与候选，用「是多少、会不会、A 还是 B」问 | `conventions/writing/sentence-craft/sentence-frame.md` 的知识文件「代词不能代替未写出的对象」、`conventions/writing/chapter-structure/skeleton.md`「自测问题」 |
| 定结构 | 同节 ≥3 连纯散文（中间无列表/代码/图/表） | 改「一句中心 + 列表/代码/图」 | `conventions/writing/chinese-quality.md` |
| 定结构 | 章引言两个散文段并立、单句孤儿段（首个 `##` 前 ≥2 个非列表散文块） | 并为单段或改「一段 + 列表」 | `conventions/writing/chapter-structure/skeleton.md` |
| 定结构 | 一段内两个独立中心、章引言顿号串 ≥3 个交付物 | 按职责拆段或下沉为列表 / 正文 `##` | `conventions/writing/chinese-quality.md`、`knowledge/cases/chinese-style/paragraph-cases.md`「自然段多中心未拆」、`knowledge/cases/chinese-style/structure-shape.md`「目录式堆砌」 |
| 排列内容块 | 过简实现围栏（单次比较或直接 `return`） | 删围栏，改入口列表 + 失败策略列表 | `conventions/writing/qmd-element-cases/block-loop.md` |
| 排列内容块 | 块间闭环缺失（标题下无引导、段→列表无 lead-in、代码→图只有空行、表前无关系句、Callout 复述块内） | 按块链检查清单补桥接 | `conventions/writing/section-flow/block-chain.md` 的知识文件「块链检查清单」、`conventions/writing/qmd-element-cases/layout-cases.md` |
| 定段落 | 段内同义堆叠（两句换说法讲同一机制） | 删辅句或合并；公式递进与简洁边界豁免 | `conventions/writing/paragraph-shape/semantic-split.md` 的知识文件「段内同义堆叠禁令」 |
| 定段落 | 过简断裂（逗号、句号后分句换新主语、新事实，无回指、无承接词）；一段第 4 个主概念 | 收敛主概念后用给定信息衔接；超 3 个主概念拆段或改列表 | `conventions/writing/sentence-craft/sentence-limits.md` 的知识文件「过简断裂禁令」「概念负荷」 |
| 定用词 | 处所状语后 12 字内出现「记住」「保存」或「选出」 | 判为状语配错谓语；改写见「同档并句」——位置句的谓语用「放进」，职责不并进位置句 | `conventions/writing/sentence-craft/sentence-limits.md` 的知识文件「同档并句」 |
| 定段落 | 段中心写不出（读者复述不出这段在讲什么），或整段与导语、围栏注释同义 | 删本段，不另写替身句；要换对象另起段，且对象是本节正在讲的 | `conventions/writing/sentence-craft/sentence-frame.md` 的知识文件「一次对话」 |
| 定段落 | 一段里叠了多件内容（两问并列再补「是两个不同的问题」「用两个枚举分开回答」式总述） | 先数这段有几件内容；每件内容各一次对话，紧挨自己的围栏 | `conventions/writing/sentence-craft/sentence-frame.md` 的知识文件「一次对话」、`knowledge/cases/chinese-style/sentence-frame.md`「定句子：两次说话拆成一次对话」 |
| 定句子 | 节首句以「这些／这个／这一步」作话题且同句列不出对象名（所指要等后面的 `###` 或代码围栏） | 节首同句列出对象名；已逐个写出名字后的回指保留 | `conventions/writing/sentence-craft/sentence-frame.md` 的知识文件「代词不能代替未写出的对象」、`knowledge/cases/chinese-style/sentence-reference.md`「定结构与定句子：代词不能代替未写出的对象」 |
| 定句子 | 类型接线句（两个逗号分句各自是「成员叫法 + 使用 + 某一章的类型」，且两项都已在紧邻导语与围栏出现） | 整段删除，不走拉链的推迟、拆句、一项一行 | `conventions/writing/sentence-craft/sentence-frame.md` 的知识文件「一次对话」、`knowledge/cases/chinese-style/paragraph-cases.md`「定段落：类型接线段整段删除」 |
| 定句子 | 一句里的全称（全部、所有、唯一）被下一句否定 | 改范围或删除；全称读完下一句仍成立才保留 | `conventions/writing/sentence-craft/sentence-frame.md` 的知识文件「一次对话」 |
| 定句子 | 先决定后补依据 / 逗号甩判断（一句用逗号并列三个以上独立判断）/ 「由 X 完成」式被动交接 | 按知识「句内骨架」改为事实 → 约束 → 因此选择；「由 X 完成」在定用词改主动句 | `conventions/writing/sentence-craft/sentence-frame.md`「句内骨架」 |
| 定句子 | 元叙述开场（「是规则，代码把它写成」「因此记作／写成 `class`」） | 对象先行：改为「对象 → 名称 → 约束 → 出处」 | `conventions/writing/chinese-quality.md`、`knowledge/cases/chinese-style/language-scope.md` |
| 定句子 | 拉链句（两组对象配对，删任一仍成立；「分别交给／各说一层／分别是」） | 按推迟 → 拆句 → 一项一行改写 | `conventions/writing/sentence-craft/sentence-frame.md` 的知识文件「拉链句」、`knowledge/cases/chinese-style/sentence-frame.md`「拉链句」 |
| 定句子 | 两个名词粘成一个叫法仍带「的」，或三个以上名词、动词定语省了「的」 | 按「结构助词「的」」判定去留与口诀改写 | `conventions/writing/sentence-craft/sentence-limits.md` 的知识文件「结构助词「的」」 |
| 定句子 | 没点名载体（「一个下标」「这个下标」「这次代入」），或一句里同时有跳过整行、列偏移和得数，或公式项列表 | 按列表选择换算条写成同一段短句 | `conventions/writing/list-craft.md` 的知识文件「列表选择」 |
| 定句子 | `Get*` 概述纯名词句（`/// 当前流程结果。`） | 改「获取…」，动词与函数名前缀硬对齐 | `conventions/writing/qmd-element-cases/code-cases.md` |
| 定句子 | 分支解释把条件压在句首（拒绝、终局句读到句末才知道结果） | 主句先写可观察结果，条件跟在后面或另起一句 | `conventions/writing/sentence-craft/sentence-limits.md` 的知识文件「句子规则」 |
| 定版式 | 配置与脚本注释混用句式形状（裸完整句与话题句并存） | 按文件定一种形状：键值配置与构建脚本用「话题：一句完整说明。」，`.gitignore` 等点文件用名词短语 | `conventions/writing/qmd-element-cases/code-cases.md`「键值配置」 |
| 定句子 | 「第二道…防线」类实现注 | 删 | `conventions/writing/qmd-element-cases/code-cases.md` |
| 定句子 | 行尾把格子状态、先手或后手、操作动作写进同一句 | 换成术语表「数据项类型」里的三句，与头文件逐字一致 | `conventions/writing/prose-theme.md`、`conventions/writing/chinese-quality.md` |
| 定句子 | 注释把下一行的形参比较（「检查 position 是否…」）或坐标写死、各查几次再写一遍 | 函数体只是一次比较或 `all_of` 时不写，只写代码看不出的例外；扫描注释只写检查哪一组线 | `conventions/writing/qmd-element-cases/code-cases.md`「实现注释」 |
| 定句子 | 成员或函数细节只剩「按…存放 / 排列 / 记录」而没有领域对象 | 先补本体（如 `history_` 行尾补「本局操作记录。」），列宽不够再删动作半句；这条只改源码注释，不进入 qmd | `conventions/writing/qmd-element-cases/code-cases.md`「领域函数与成员注释」 |
| 定用词 | 一句里的量被「确定、体现、界定、表达」盖住（时间义「已经确定」合格） | 改写成相等、乘除加减、上下界或成员记法；「由 A 得到 B」「将 A 转换为 B」的换算注释不在此改 | `conventions/writing/sentence-craft/sentence-limits.md` 的知识文件「关系写成能核对的运算」 |
| 定版式 | 散文伪标签冒号（话题 + `：` 词条式冒号）；多核混段 | 词条式冒号改完整主谓句或真列表项（定版式）；多核混段按拆核四步改写（定段落） | `references/zh/writing-howto/tasks-structure.md` |
| 定版式 | 成员函数声明间无空行、qmd 围栏坍缩 | 补空 1 行；围栏保留源码空白 | `conventions/writing/qmd-element-cases/code-cases.md`「空行总则」、`conventions/writing/qmd-element-cases/block-loop.md` |
| 定版式 | 注释位置混用（同一意图忽上忽下）、行尾超 100 列 | 按位置矩阵；超宽整条回退上一行 | `conventions/writing/qmd-element-cases/code-cases.md` |
| 定版式 | 列表项字数失衡（冒号后最长 ≥ 最短 ×2，或引导词相差 ≥4） | 删长项多余中心 → 拆多中心 → 过短项按简洁边界补全 | `conventions/writing/list-craft.md` 的知识文件「列表选择」、`knowledge/cases/chinese-style/layout-list.md`「列表字数带失衡」 |
| 定句子 | 句号后下一句以「它」开头且下一个字不是「们」 | 话题没换就不写「它」，主语空缺或写回原类型名 | `conventions/writing/sentence-craft/sentence-limits.md` 的知识文件「同档并句」 |
| 定用词 | 反引号结束后紧跟「减」加数字 | 标识符的加减乘除写进同一对反引号，运算符用源码符号 | `conventions/writing/sentence-craft/sentence-limits.md` 的知识文件「关系写成能核对的运算」 |
| 定段落 | 列表前的导语写出列表项里的取值 | 导语只点名要展开的维度，不提前写取值 | `conventions/writing/list-craft.md` 的知识文件「列表选择」 |
| 定句子 | 简单函数注释写出「不抛异常」而声明没有 `noexcept` | 可能抛出则不写「不抛异常」，声明也不加 `noexcept` | `conventions/writing/qmd-element-cases/code-cases.md` 的知识文件「展开规则」 |

机械项：`verifying-content.py` 扫读者 qmd 与 agents 的 `下一节`/`上一节`、`代码把它写成`、`第二道…防线`、围栏外正文的 `由…完成` 与 `由…确定／体现／界定／表达`；读者正文的 agent 免责腔硬拦，章节页引言两个散文段、段落下限由 `verifying-content.py` 判失败；段内连续分句引入新行内代码标识且无回指的过简断裂信号由 `verifying-content.py` 记 WARN（不追清零）。句子模块切分由 `verifying-content.py` 对扫描范围内的 qmd 全量执行，只印切分计数与失败行，失败收三类高精度信号（类型接线句、「接着看／第 N 个枚举」改口、全称被下一句否定）；段中心写不出与对话件数不做正则，留给步骤与案例。
