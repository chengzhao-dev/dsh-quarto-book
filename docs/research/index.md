# 写作研究索引（开发期）

这份索引只在维护插件时使用：记录读过哪一份资料、从它留下的一个做法、以及这个做法落进插件的哪个文件。技能与工具在运行时都不读本目录，`package.json` 的 `files` 也不包含 `docs/`。

## 规则

- 每条只占一行：名称、体裁、做法一句、落点；没有落点就写「丢弃」和原因。
- 不摘原文，不复述章节标题；版权材料只留书名和自己的一句归纳。
- 配额：中文技术讲解 100 份、其他体裁讲解 50 份、润色与技能编写类 50 份、LearnCpp 按目录逐课、下载量前 100 的 DSH 插件只解析目录 JSON。
- 蒸馏门槛：至少三份互不重复的资料支持同一做法，并且它会改变现有某一步的判定，才写进步骤；其余留在这里。
- 与「不发明事实、不把限定说成确定」冲突的做法直接丢弃。
- LearnCpp 已深读按批登记：每批 3 课、编号从 1 连续递增，不跳号；`temp/checking-research.py` 同时校验列数、落点与批次。
- 课号以抓取时的目录为准：2025 版 learncpp 调整过章节编号，同一课以标题去重，编号差异记在条目里。
- 版本目标以各仓库当前的 `package.json` 为准：`dsh-quarto-book` 0.6.13 → 0.6.14，`dsh-cpp-workflow` 0.6.3 → 0.6.4；`plan2.md` 里写的 0.6.2 是写作计划时的旧值。

## 中文技术讲解

| 名称 | 体裁 | 留下的做法 | 落点 |
| --- | --- | --- | --- |
| 《C++ Primer》第 5 版（Lippman 等） | C++ 教材 | 先用一个能跑的小例子承载概念，再逐层解释语法与语义；章末用条目小结回看这一章解决了什么 | `skills/writing-quarto/steps/05-sentences.md`（先展示后解释）、`steps/08-reread.md`（章末回顾） |
| Stroustrup《Programming: Principles and Practice Using C++》第 3 版（stroustrup.com/PPP3.html） | C++ 教材 | 每个新设施配一段完整代码，正文只回答「为什么需要它」，不重述代码里的成员 | `skills/writing-quarto/steps/03-blocks.md`（块后解说只写代码里看不出的原因） |
| 《代码大全》第 2 版（McConnell） | 软件构造 | 一段只讲一个想法；先给结论再给依据，段与段用上一段的新信息衔接 | `skills/writing-quarto/steps/04-paragraphs.md`（一段一个关键、衔接句） |
| Google 开发者文档风格指南 | 技术写作规范 | 第二人称、主动语态、条件放句首；术语首次出现给出一句定义，不假设读者记得前文 | `skills/writing-quarto/steps/05-sentences.md`（六个成分、条件前置） |
| Diátaxis（diataxis.fr） | 文档架构 | 教程、操作指南、参考、解释各服务一种需要；一个页面只承担一种，混写会让读者找不到下一步 | `skills/writing-quarto/steps/02-structure.md`（章型与页面职责） |
| cppreference 中文（zh.cppreference.com） | C++ 参考手册 | 先给声明与签名，再用一两句写行为，示例放在最后；读者可以只看签名就判断能不能用 | `skills/writing-quarto/steps/03-blocks.md`（围栏前先给签名与一句行为） |
| 欧长坤《现代 C++ 教程》（GitHub 开源） | C++ 教材 | 每节用一个具体问题开头，代码紧跟问题，末尾给练习；读者带着问题读，不会先读定义 | `skills/writing-quarto/steps/01-task.md`（章首任务句）、`steps/08-reread.md`（练习与回顾） |
| 侯捷《STL 源码剖析》 | C++ 专著 | 术语先用中文说法再括注英文，一个机制用一段讲完；不在同一段里换名 | `skills/writing-quarto/quarto/prose.md`（术语首次出现的写法） |
| Microsoft Learn C++ 文档 | 官方文档 | 每篇开头一句话说明读者读完后能做什么，随后按步骤展开，结尾给相关链接 | `skills/writing-quarto/steps/01-task.md`（任务句与读者位置） |
| 《Effective C++》（Meyers） | C++ 专著 | 条目先给规则，再给反例和代价；读者先记住结论，再看为什么 | `skills/writing-quarto/steps/05-sentences.md`（先结论后反例） |
| 《C++ Core Guidelines》 | 官方规则集 | 每条规则先写「为什么」，再给正例与反例；规则标题本身就是一句可执行的话 | `skills/writing-quarto/steps/03-blocks.md`（正反例成对出现） |
| 《重构》（Fowler，中文版） | 工程专著 | 先命名坏味道，再给手法步骤，最后放前后对照；读者能照着做，不靠回忆 | `skills/writing-quarto/steps/08-reread.md`（改前改后对照） |
| 《深入理解计算机系统》（Bryant、O'Hallaron） | 系统教材 | 抽象层次先用具体数字与图对齐，再回到定义；图承担结构，正文承担条件 | `skills/writing-quarto/quarto/figures.md`（图与正文分工） |
| Qt 官方文档（中文） | 库文档 | 每个类先写「用途一句 + 最小示例 + 相关类」，读者从示例进入，再查细节 | `skills/writing-quarto/steps/02-structure.md`（页面骨架） |
| LLVM Coding Standards | 代码规范 | 注释解释意图与理由，不逐行翻译代码；风格规则给出可检查的反例 | `skills/writing-quarto/steps/03-blocks.md`（代码块只写代码里看不出的原因） |
| 《算法导论》（CLRS） | 算法教材 | 伪代码、复杂度、正确性分三层写；每层只回答一个问题 | `skills/writing-quarto/steps/03-blocks.md`（分层写算法块） |
| Pro Git（中文版） | 工具书 | 每节从一个具体任务开始，命令块后立刻说明输出与失败情况 | `skills/writing-quarto/steps/01-task.md`（任务句）、`steps/03-blocks.md`（命令块后的说明） |
| Kubernetes 中文文档 | 官方文档 | 每页开头交代读者读完后能做什么、需要什么前置条件，再给任务步骤 | `skills/writing-quarto/steps/01-task.md`（读者位置与前置条件） |
| 《高质量 C++/C 编程指南》（林锐） | 编码规范 | 规则按清单组织，每条配一个可判定的反例；审查时逐条对照 | `skills/writing-quarto/steps/08-reread.md`（自查清单） |
| 《C++ 并发编程实战》（Williams，中文版） | C++ 专著 | 概念先用最小示例演示行为，再讲陷阱与替代；陷阱与做法成对出现 | `skills/writing-quarto/steps/03-blocks.md`（示例后紧跟陷阱） |
| WG21 提案（P 系列论文） | 标准设计文档 | 先写动机与现有做法的不足，再给设计；被否掉的备选方案各占一段并写明取舍理由 | `skills/writing-quarto/steps/02-structure.md`（动机先于设计） |
| 《C++ 标准库》（Josuttis，中文版） | 库参考 | 组件先给头文件与签名，再给最小用例与常见陷阱；示例可独立编译 | `skills/writing-quarto/steps/03-blocks.md`（签名先于示例） |
| CMake 官方文档 | 构建工具文档 | 命令页固定三段：签名、选项、示例；不合适写法在示例旁标出 | `skills/writing-quarto/steps/03-blocks.md`（命令块后的说明） |
| Clang 诊断与文档 | 编译器文档 | 诊断给位置、原因、修复三部分；修复句用祈使句且可执行 | `skills/writing-quarto/steps/08-reread.md`（可执行的修复句） |
| 《Professional CMake》（Craig Scott） | 工程专著 | 每章从一个能跑的工程开始，逐项加需求，每步只改一处 | `skills/writing-quarto/steps/01-task.md`（任务句逐轮推进） |
| 《Effective Modern C++》（Meyers） | C++ 专著 | 条款先给规则与适用条件，再给失败案例；不把例外藏在段尾 | `skills/writing-quarto/steps/05-sentences.md`（条件前置） |
| Google 工程实践（代码评审指南） | 团队规范 | 先给总评结论，再逐条列问题并标严重级别；建议与事实分开写 | `skills/writing-quarto/steps/08-reread.md`（分级的自查清单） |
| 《编码：隐匿在计算机软硬件背后的语言》（Petzold） | 计算机科普 | 从一个人能动手做的小问题引出抽象层，每层只加一个概念 | `skills/writing-quarto/steps/01-task.md`（小问题引出概念） |
| 《Unix 编程艺术》（Raymond） | 工程随笔 | 短段落、一条原则配一个具体例子；原则用一句话说完 | `skills/writing-quarto/steps/04-paragraphs.md`（一条原则一段） |
| 《设计数据密集型应用》（Kleppmann，中文版） | 系统专著 | 每章先给场景与约束，再并列比较方案；比较用同一组维度 | `skills/writing-quarto/steps/02-structure.md`（方案比较的固定维度） |
| GCC 手册（诊断与选项） | 编译器文档 | 选项按「影响什么」分组，每组给一条最小可复现命令；不按字母序讲 | `skills/writing-quarto/steps/03-blocks.md`（命令块只给最小可复现） |
| GNU binutils / ld 文档 | 链接器文档 | 符号、重定位这类概念先定义再举例；例子只改一个变量 | `skills/writing-quarto/quarto/prose.md`（术语先定义） |
| 《性能之巅》（Gregg，中文版） | 性能工程 | 先问「要回答什么问题」再选工具；方法与工具分节，不混讲 | `skills/writing-quarto/steps/01-task.md`（问题先于工具） |
| Google Benchmark 文档 | 基准测试 | 报告先给对照与波动范围，再给单点数字；图注写明测量条件 | `skills/writing-quarto/quarto/figures.md`（图注写条件） |
| GoogleTest 文档 | 测试框架 | 测试名写可观察行为；断言消息写期望值与实际值 | `skills/writing-quarto/steps/05-sentences.md`（断言句式） |
| CTest 文档 | 测试运行器 | 每个属性（标签、超时、依赖）单独一段，作用与默认值写在一起 | `skills/writing-quarto/steps/02-structure.md`（属性页骨架） |
| Clang-Tidy 检查文档 | 静态分析 | 每条检查固定写：问题是什么、示例、怎么改；示例不省略关键行 | `skills/writing-quarto/steps/08-reread.md`（问题—示例—改法三件套） |
| 《软件测试的艺术》（Myers） | 软件测试 | 用例先写输入与预期输出，再写边界与反例；预期先于执行 | `skills/writing-quarto/steps/01-task.md`（验收句含预期输出） |
| Sanitizers 文档（ASan/UBSan） | 运行时检查 | 报告按「错误类型、位置、调用栈」读；正文教读者按这个顺序定位 | `skills/writing-quarto/steps/08-reread.md`（按报告顺序自查） |
| Valgrind 手册 | 内存检查 | 错误按类型分节，每类推一种读法与一个最小复现 | `skills/writing-quarto/steps/08-reread.md`（错误分类读法） |
| Qt 文档（信号与槽） | 框架文档 | 先给能跑的最小示例，再讲机制与顺序；信号与槽表分开列 | `skills/writing-quarto/steps/03-blocks.md`（先可运行后机制） |
| Dear ImGui 文档 | 即时模式 UI | 每个控件给一行示例与状态说明；交互限制写在示例下方 | `skills/writing-quarto/steps/03-blocks.md`（示例下的限制句） |
| MDN Web Docs（中文） | Web 参考 | 属性页固定「取值、默认值、示例、兼容性」；术语首次出现给链接 | `skills/writing-quarto/quarto/tables.md`（属性表骨架） |
| WCAG 中文文档 | 无障碍标准 | 每条准则先写意图与谁受益，再给失败案例与通过技术 | `skills/writing-quarto/steps/08-reread.md`（意图先于条款） |
| Material Design 3 | 设计规范 | 组件页写状态、尺寸与用法场景；反例与正例并排 | `skills/designing-theme/SKILL.md`（组件状态与尺寸） |
| Apple Human Interface Guidelines | 设计规范 | 先给使用场景，再给尺寸与层级；每节末尾列常见误用 | `skills/designing-theme/SKILL.md`（场景先于尺寸） |
| 《CSS 世界》（张鑫旭） | 前端专著 | 先复现现象，再讲原理与边界；每节一个可复现 demo | `skills/designing-theme/references/theme-system.md`（现象→原理） |
| CTeX / LaTeX 宏包文档 | 排版文档 | 宏包页给最小示例、参数表与常见冲突，三者分开 | `skills/writing-quarto/quarto/render.md`（示例与参数分节） |
| 《写给大家看的设计书》 | 平面设计 | 对齐、对比、重复、亲密性四条原则各配前后对照图 | `skills/designing-theme/SKILL.md`（四条排版原则） |
| ISO/IEC 14882 标准文本 | 标准规范 | 条文先给约束与产生式，再用 note 补解释；示例与规范正文分开 | `skills/writing-quarto/steps/03-blocks.md`（约束条文与示例分离） |
| 《Programming Pearls》（Bentley） | 算法实践 | 一个问题引出多种方案，最后给复杂度与取舍 | `skills/writing-quarto/steps/02-structure.md`（方案到取舍的收束） |
| Stroustrup《The C++ Programming Language》第 4 版 | C++ 专著 | 章末给「建议」清单，每条一句话且可执行 | `skills/writing-quarto/steps/08-reread.md`（章末建议清单） |

## 其他体裁讲解

| 名称 | 体裁 | 留下的做法 | 落点 |
| --- | --- | --- | --- |
| 《现代汉语》（黄伯荣、廖序东） | 语言学教材 | 先摆两三个例句，再归纳规则；术语在第一次用到时定义，后面只沿用同一个词 | `skills/writing-quarto/steps/05-sentences.md`（例先于规则）、`quarto/prose.md`（术语固定） |
| 朱德熙《语法讲义》 | 语法专著 | 用最小对立的一对句子说明差别，一句只下一个判断 | `skills/writing-quarto/steps/05-sentences.md`（对举只用于真对比） |
| 《On Writing Well》（Zinsser） | 非虚构写作 | 删掉不承担信息的词；一段只服务一个中心句，中心句放在段首 | `skills/writing-quarto/steps/04-paragraphs.md`（段首中心句、删赘词） |
| 《The Sense of Style》（Pinker） | 写作与认知 | 先给读者已知的信息，再给新信息；删掉「本节将讨论」这类元话语 | `skills/writing-quarto/steps/04-paragraphs.md`（已知到未知的衔接） |
| 《怎样解题》（Polya） | 数学教学 | 先给一个具体问题，再引出一般方法；把「卡住时问自己什么」写成可执行的问题 | `skills/writing-quarto/steps/01-task.md`（用问题带动概念） |
| 《具体数学》（Graham、Knuth、Patashnik） | 数学教材 | 符号第一次出现就定义并给读法，随后每个公式配一个具体小例子 | `skills/writing-quarto/quarto/prose.md`（符号表）、`steps/03-blocks.md`（公式后的例子） |
| 《如何阅读一本书》（Adler） | 阅读方法 | 先给整本书的结构图，每章开头说明它在全书的位置；读者知道自己在哪 | `skills/writing-quarto/steps/02-structure.md`（章首定位句） |
| 《The Elements of Style》（Strunk & White） | 写作手册 | 删掉不承担信息的词；能主动就不被动；把重要的词放在句尾 | `skills/writing-quarto/steps/05-sentences.md`（删赘词、主动语态） |
| 《Writing to Learn》（Zinsser） | 写作教学 | 用一段叙述把概念带出来，再给定义；讲解跟着人的注意力走，不按知识目录走 | `skills/writing-quarto/steps/04-paragraphs.md`（叙述引出概念） |
| 《时间简史》（Hawking） | 科普 | 抽象概念先给一个可想象的图像，公式只留必要的；图像负责直觉，正文负责条件 | `skills/writing-quarto/quarto/figures.md`（图与正文分工） |
| 夏丏尊、叶圣陶《文心》 | 写作教学（叙事体） | 用一个具体场景承载一条写作原则，一段只解决一个毛病 | `skills/writing-quarto/steps/04-paragraphs.md`（一段一个要点） |
| 吕叔湘、朱德熙《语法修辞讲话》 | 语法修辞 | 先列病句，再给改法，改法必须说明理由；不空谈规则 | `skills/writing-quarto/steps/05-sentences.md`（病类清单与改法） |
| 吕叔湘《语文常谈》 | 语言普及 | 用日常例子解释抽象规则，例子先于术语 | `skills/writing-quarto/steps/05-sentences.md`（例先于术语） |
| 《The Craft of Research》（Booth 等） | 研究方法与写作 | 每一段都过一遍「所以呢」：读者读完这段该多知道什么；章节从读者的问题出发 | `skills/writing-quarto/steps/02-structure.md`（问题驱动的章节） |
| 刘军强《写作是门手艺》 | 中文非虚构写作 | 段落用「观点—解释—例子」的骨架，先写观点句再填材料 | `skills/writing-quarto/steps/04-paragraphs.md`（段落骨架） |
| 《金字塔原理》（Minto） | 商业写作 | 结论先行，论据分组且同组同层；读者读完第一段就知道主张 | `skills/writing-quarto/steps/04-paragraphs.md`（结论先行） |
| Gopen、Swan《The Science of Scientific Writing》 | 科技写作研究 | 句尾放强调信息；从读者已知写到未知；主题放在句首 | `skills/writing-quarto/steps/05-sentences.md`（信息结构） |
| 《Line by Line》（Cook） | 英文写作手册 | 把名词化的动作还原成动词，短句承载动作，长句承载关系 | `skills/writing-quarto/steps/05-sentences.md`（名词化） |
| 《On Writing Well》（Zinsser） | 非虚构写作 | 一篇只讲一件事；删掉装饰性形容词，留下事实与判断 | `skills/writing-quarto/steps/04-paragraphs.md`（一篇一事） |
| 《南方周末特稿手册》 | 新闻特稿 | 场景与事实交替出现，直接引语只承载判断，不承载信息 | `skills/writing-quarto/steps/03-blocks.md`（引语与场景） |
| 夏丏尊、叶圣陶《文章讲话》 | 写作指导 | 一段一个中心，段首句立骨 | `skills/writing-quarto/steps/04-paragraphs.md` |
| 王鼎钧《作文四书》 | 写作指导 | 具体名词优先，抽象结论后置 | `skills/writing-quarto/steps/05-sentences.md` |
| 余光中《翻译乃大道》 | 评论随笔 | 少用「的」与被动，句子读得顺 | `skills/writing-quarto/steps/05-sentences.md` |
| 黄仁宇《万历十五年》 | 历史著作 | 先叙事再解释，用事实推进论点 | `skills/writing-quarto/steps/04-paragraphs.md` |
| 尤瓦尔·赫拉利《人类简史》 | 通俗历史 | 一个概念配一个比喻，术语首次出现即解释 | `skills/writing-quarto/steps/06-wording.md` |
| 费孝通《乡土中国》 | 社会学 | 概念先定义，再用田野例子落地 | `skills/writing-quarto/steps/06-wording.md` |
| 曹天元《上帝掷骰子吗》 | 科普 | 按历史顺序引出概念，人物带出问题 | `skills/writing-quarto/steps/04-paragraphs.md` |
| 吴军《数学之美》 | 科普 | 一个公式配一个直观解释，先讲用途 | `skills/writing-quarto/steps/03-blocks.md` |
| 木心《文学回忆录》 | 讲稿 | 一段一景，用具体细节代替评价 | `skills/writing-quarto/steps/04-paragraphs.md` |
| 杨绛《我们仨》 | 散文 | 短句叙事，少形容词，让事实承重 | `skills/writing-quarto/steps/05-sentences.md` |
| 马尔克斯《百年孤独》 | 小说 | 长句的节奏与时间折叠，仅作语感参考 | `skills/writing-quarto/steps/05-sentences.md` |
| 余华《活着》 | 小说 | 白描与短句，情绪留给事实 | `skills/writing-quarto/steps/05-sentences.md` |
| 汪曾祺《人间草木》 | 散文 | 具体物象与口语节奏 | `skills/writing-quarto/steps/06-wording.md` |
| 老舍《茶馆》 | 戏剧 | 对话推动信息，少用旁白交代 | `skills/writing-quarto/steps/03-blocks.md` |
| 钱锺书《围城》 | 小说 | 比喻节制，反讽有分寸 | `skills/writing-quarto/steps/06-wording.md` |
| 曹雪芹《红楼梦》 | 古典小说 | 人物语言个性化，信息藏在对话里 | `skills/writing-quarto/steps/03-blocks.md` |
| 司马迁《史记》 | 史书 | 叙事顺序清楚，因果不靠解释硬贴 | `skills/writing-quarto/steps/04-paragraphs.md` |
| 贾雷德·戴蒙德《枪炮、病菌与钢铁》 | 科普史 | 宏观论证分层，先结论后证据 | `skills/writing-quarto/steps/04-paragraphs.md` |
| 理查德·道金斯《自私的基因》 | 科普 | 类比先行，随后限定适用范围 | `skills/writing-quarto/steps/06-wording.md` |
| 霍金《果壳中的宇宙》 | 科普 | 图示与文字配合，一图一意 | `skills/writing-quarto/steps/03-blocks.md` |
| 蕾切尔·卡森《寂静的春天》 | 科普 | 事实与论证交替推进 | `skills/writing-quarto/steps/04-paragraphs.md` |
| 威廉·曼彻斯特《光荣与梦想》 | 纪实 | 编年与人物线交织 | `skills/writing-quarto/steps/04-paragraphs.md` |
| 何伟《江城》 | 纪实 | 用观察细节代替结论 | `skills/writing-quarto/steps/04-paragraphs.md` |
| 何伟《寻路中国》 | 纪实 | 场景开头，背景后置 | `skills/writing-quarto/steps/04-paragraphs.md` |
| 《新闻写作教程》 | 教材 | 导语五要素，倒金字塔结构 | `skills/writing-quarto/steps/02-structure.md` |
| 罗伯特·麦基《故事》 | 编剧 | 冲突驱动段落，每段有转折 | `skills/writing-quarto/steps/04-paragraphs.md` |
| 约瑟夫·坎贝尔《千面英雄》 | 神话学 | 结构原型与渐进揭示 | `skills/writing-quarto/steps/02-structure.md` |
| 丹尼尔·卡尼曼《思考，快与慢》 | 心理学 | 用实验引出结论 | `skills/writing-quarto/steps/04-paragraphs.md` |
| 罗伯特·西奥迪尼《影响力》 | 心理学 | 案例先行，机制后置 | `skills/writing-quarto/steps/04-paragraphs.md` |
| 丁往道《英语写作手册》 | 教材 | 主题句加支撑句的段落骨架 | `skills/writing-quarto/steps/04-paragraphs.md` |

## 润色与技能编写

| 名称 | 体裁 | 留下的做法 | 落点 |
| --- | --- | --- | --- |
| Anthropic Agent Skills 规范 | 技能文档 | 技能正文只写「何时用、怎么用、边界」；细节放 references，按需加载 | `skills/writing-quarto/SKILL.md`（正文只作路由） |
| OpenAI Prompt Engineering 指南（中文） | 提示词指南 | 指令具体、给一两个正例、边界单独列；避免「尽量」「注意」这类空指令 | `skills/writing-quarto/steps/01-task.md`（任务句可执行） |
| Google Technical Writing 课程 | 写作课程 | 每节一个动作，配改前改后对照；一条规则只出现一次 | `skills/writing-quarto/steps/05-sentences.md`（改前改后对照） |
| Microsoft Writing Style Guide | 风格指南 | 术语表、语气、标点分开成篇，查得到单条 | `skills/writing-quarto/quarto/prose.md`（术语单条可查） |
| GitHub Docs 风格指南 | 风格指南 | 先给结论，再给步骤；每步一个动作、祈使句开头 | `skills/writing-quarto/steps/03-blocks.md`（步骤块祈使句） |
| Vale（prose linter） | 检查工具 | 规则可机械判定，按层级分组；告警给位置与改写建议 | `skills/writing-quarto/scripts/checking-prose.py`（规则可判定） |
| textlint 中文规则集 | 检查工具 | 中文标点、量词、重复词做成可配置规则；默认只报不改 | `skills/writing-quarto/scripts/checking-prose.py`（中文标点规则） |
| 《Writing Tools》（Clark） | 写作方法 | 50 个可单独练习的工具，每个配一个改句示例 | `skills/writing-quarto/steps/04-paragraphs.md`（单点练习） |
| Hemingway Editor 方法 | 可读性工具 | 按句长、被动语态、副词密度给可读性信号，不替作者改 | `skills/writing-quarto/steps/08-reread.md`（可读性自查） |
| 中文文案排版指北（盘古之白） | 中文排版 | 中英之间加空格、全角标点、数字与单位分开；规则可脚本检查 | `skills/writing-quarto/quarto/readability.md`（标点与空格） |
| Google 开发者文档风格指南（英文正本） | 风格指南 | 条件在前、动作在后；标题用动词短语，不用名词化 | `skills/writing-quarto/steps/05-sentences.md` |
| Red Hat 文档风格指南 | 风格指南 | 一句一个动作；步骤只用一个记号，子步骤不换符号 | `skills/writing-quarto/steps/04-paragraphs.md` |
| IBM Style 术语与缩写表 | 术语表 | 一词一义；缩写首次出现先展开 | `skills/writing-quarto/steps/06-wording.md` |
| Steven Pinker《风格感觉》 | 写作论著 | 已知在前、新信息在后；解释性括注紧跟被解释的词 | `skills/writing-quarto/steps/04-paragraphs.md` |
| William Zinsser《On Writing Well》 | 写作论著 | 删副词与自我指涉，保留动词力度 | `skills/writing-quarto/steps/05-sentences.md` |
| Docs for Developers | 文档写作书 | 按读者任务组织页面；先给可运行示例，再解释 | `skills/writing-quarto/steps/01-task.md` |
| Write the Docs 文档指南 | 社区指南 | 一页回答一个问题；标题表达意图而不是分类 | `skills/writing-quarto/steps/02-structure.md` |
| 中文可读性与 Flesch 公式适配讨论 | 技术文章 | 超过 40 字的句子必须能拆；用数据核对拆分结果 | `skills/writing-quarto/scripts/checking-prose.py` |
| GB/T 15834《标点符号用法》 | 国家标准 | 顿号只并列词或短语；破折号与书名号按规范 | `skills/writing-quarto/quarto/readability.md` |
| 《咬文嚼字》年度合订本 | 语言文字期刊 | 常见误用（的地得、截至与截止、其间与期间）逐条记 | `skills/writing-quarto/steps/06-wording.md` |
| Microsoft 简体中文本地化风格指南 | 本地化风格指南 | 中英混排、产品名保留英文、避免长定语 | `skills/writing-quarto/steps/06-wording.md` |
| Apple 中文文案规范 | 风格指南 | 短句、动词开头、不用「进行」「做出」 | `skills/writing-quarto/steps/05-sentences.md` |
| 腾讯技术写作规范 | 技术写作 | 术语表先行，示例可直接复制运行 | `skills/writing-quarto/quarto/prose.md` |
| 字节跳动技术写作指南 | 技术写作 | 段落一意，标题用动宾短语 | `skills/writing-quarto/steps/02-structure.md` |
| 阮一峰《中文技术文档的写作规范》 | 技术写作 | 一句话一个意思，超过 40 字就拆 | `skills/writing-quarto/scripts/checking-prose.py` |
| LanguageTool 中英文规则集 | 校对工具 | 常见搭配错误与冗余词对 | `skills/writing-quarto/scripts/checking-prose.py` |
| proselint | 校对工具 | 陈词滥调、冗余副词与含糊限定词 | `skills/writing-quarto/scripts/checking-prose.py` |
| pangu.js 中文排版 | 排版工具 | 中英文之间与数字单位之间加空格 | `skills/writing-quarto/quarto/readability.md` |
| markdownlint 文档规则 | 文档工具 | 标题只跳一级、列表标记统一、围栏标语言 | `skills/writing-quarto/steps/03-blocks.md` |
| Docusaurus 文档风格指南 | 文档框架 | 页面模板固定、侧边栏命名与标题一致 | `skills/writing-quarto/steps/02-structure.md` |
| 阿里云《技术文档写作规范》 | 规范 | 术语全篇一致，示例必须可运行 | `skills/writing-quarto/steps/01-task.md` |
| Google SRE 文档模板 | 模板 | 影响与步骤分开写，先影响后操作 | `skills/writing-quarto/steps/02-structure.md` |
| Docs-as-Code 指南 | 方法 | 文档与代码同仓评审，改动同步 | `skills/writing-quarto/steps/09-check.md` |
| Anne Gentle《Docs Like Code》 | 书籍 | 文档源与发布流程照代码处理 | `skills/writing-quarto/steps/09-check.md` |
| Nicole Fenton《Nicely Said》 | 写作书 | 用读者的词写界面文案，不用内部术语 | `skills/writing-quarto/steps/06-wording.md` |
| Mailchimp 内容风格指南 | 风格指南 | 语气一致，少用感叹号与俏皮话 | `skills/writing-quarto/steps/05-sentences.md` |
| GOV.UK 内容设计指南 | 内容设计 | 主动语态、短句、先给结论 | `skills/writing-quarto/steps/05-sentences.md` |
| 18F 内容指南 | 科技写作 | 用具体数字与条件替代模糊限定 | `skills/writing-quarto/steps/06-wording.md` |
| Write the Docs 评审清单 | 清单 | 评审只问读者能否照着完成任务 | `skills/writing-quarto/scripts/checking-prose.py` |
| Google 工程师技术写作课 | 课程 | 一段一个主题，标题先写结论 | `skills/writing-quarto/steps/02-structure.md` |
| 《芝加哥手册》 | 手册 | 标点、缩写与数字写法的统一权威 | `skills/writing-quarto/quarto/readability.md` |
| 《美联社风格手册》 | 手册 | 日期、数字与单位的写法统一 | `skills/writing-quarto/steps/06-wording.md` |
| 《图书编辑校对实用手册》 | 编校 | 三审三校的核对顺序，先结构后字词 | `skills/writing-quarto/steps/08-reread.md` |
| 《现代汉语规范词典》 | 词典 | 词义边界与常见搭配 | `skills/writing-quarto/steps/06-wording.md` |
| 吕叔湘《汉语语法分析问题》 | 语言学 | 主谓宾切分，长句按层级断开 | `skills/writing-quarto/steps/05-sentences.md` |
| Joshua Schimel《Writing Science》 | 写作书 | 段落按 OCAR 组织：开场、冲突、回答、解决 | `skills/writing-quarto/steps/04-paragraphs.md` |
| Helen Sword《Stylish Academic Writing》 | 写作书 | 标题用动词，少用名词化短语 | `skills/writing-quarto/steps/02-structure.md` |
| Richard Lanham《Revising Prose》 | 写作书 | 逐句删介词短语堆叠，还原动作 | `skills/writing-quarto/steps/05-sentences.md` |
| Lynne Truss《Eats, Shoots & Leaves》 | 标点 | 标点改变语义的实例对照 | `skills/writing-quarto/quarto/readability.md` |
| MDN 写作指南 | 技术文档 | 面向任务，术语首次出现给链接 | `skills/writing-quarto/steps/01-task.md` |

## LearnCpp

公开目录共 34 个单元（28 章 + O/F 选章 + A–D 附录），约 300 课；每章只深读一课，记三个教学动作，连续三章没有新动作就停。

| 名称 | 标题 | 课数 | 深读课（三个教学动作读后补） |
| --- | --- | --- | --- |
| 0 | Introduction / Getting Started | 13 | 0.4 Introduction to C++ development |
| 1 | C++ Basics | 11 | 1.2 Comments |
| 2 | Functions and Files | 13 | 2.7 Forward declarations |
| 3 | Debugging | 10 | 3.2 The debugging process |
| 4 | Fundamental Data Types | 12 | 4.5 Unsigned integers |
| 5 | Constants and Strings | 9 | 5.6 Constexpr variables |
| 6 | Operators | 8 | 6.1 Operator precedence |
| O | Bit Manipulation | 4 | O.2 Bitwise operators |
| 7 | Scope, Duration, and Linkage | 14 | 7.9 Inline functions |
| 8 | Control Flow | 15 | 8.10 For statements |
| 9 | Error Detection and Handling | 6 | 9.2 Code coverage |
| 10 | Type Conversion | 10 | 10.4 Narrowing conversions |
| 11 | Overloading and Function Templates | 10 | 11.6 Function templates |
| F | Constexpr functions | 4 | F.1 Constexpr functions |
| 12 | References and Pointers | 15 | 12.3 Lvalue references |
| 13 | Enums and Structs | 16 | 13.9 Default member initialization |
| 14 | Introduction to Classes | 17 | 14.5 Public and private members |
| 15 | More on Classes | 10 | 15.2 Classes and header files |
| 16 | std::vector | 12 | 16.3 vector length and subscript |
| 17 | std::array and C-style arrays | 13 | 17.13 Multidimensional std::array |
| 18 | Iterators and Algorithms | 4 | 18.2 Introduction to iterators |
| 19 | Dynamic Allocation | 5 | 19.1 new and delete |
| 20 | Functions | 7 | 20.6 Introduction to lambdas |
| 21 | Operator Overloading | 15 | 21.4 Overloading the I/O operators |
| 22 | Move Semantics and Smart Pointers | 7 | 22.5 std::unique_ptr |
| 23 | Object Relationships | 7 | 23.6 Container classes |
| 24 | Inheritance | 10 | 24.2 Basic inheritance |
| 25 | Virtual Functions | 11 | 25.2 Virtual functions |
| 26 | Templates and Classes | 6 | 26.1 Template classes |
| 27 | Exceptions | 10 | 27.9 noexcept |
| 28 | Input and Output | 7 | 28.5 Stream states |
| A | Miscellaneous Subjects | 4 | A.1 Static and dynamic libraries |
| B | C++ Updates | 5 | B.5 Introduction to C++23 |
| C | The End | 1 | C.1 The end? |

### 已深读（第 1 批）

- **0.4 Introduction to C++ development**：把一次开发拆成编号小节，每步只回答一个问题；最佳实践单独成框，一句话可执行，理由留在正文；背景知识放进侧框，主线始终落在当前任务上。落点：`steps/02-structure.md`（每节只回答一个问题）、`steps/04-paragraphs.md`（侧框不打断主线）。
- **1.2 Comments**：先定义再给语法，按 what / how / why 三分法指出每类注释该写在哪；反例成对出现，每条都写清哪里错、改成什么；章末用三条平行句收口，与三个小节一一对应。落点：`steps/05-sentences.md`（平行句收口）、`steps/08-reread.md`（反例成对）。
- **2.7 Forward declarations**：先用一个看似正常却编译失败的完整程序开场，照录编译器原文；同一问题给两种方案，逐条写出取舍和不可行条件；用对照表区分 declaration / definition / pure declaration，每行配最小例子。落点：`steps/03-blocks.md`（失败程序开场）、`references/priority.md`（方案取舍的写法）。

### 已深读（第 2 批）

- **3.2 The debugging process**：先用六步编号清单给出完整流程，每步一句动词短句；再用生活类比把六步走一遍，然后回到同一份代码走同一遍，类比与代码结构一一对应；失败程序的输出与期望值并列写出，把定位过程写成可跟随的推理。落点：`steps/01-task.md`（验收句与失败现象并列）、`steps/08-reread.md`（读回时按流程复述）。
- **4.5 Unsigned integers**：先给取值范围表，再给公式（n 位无符号为 0 到 2^n−1），数值用带千分位的十进制；反例程序直接给出溢出结果（280→24、-1→65535、2−3→4294967295），并说明编译器警告；有争议的结论先摆标准与业界的分歧，再给一条最佳实践与例外清单（位运算、下标、嵌入式）。落点：`steps/05-sentences.md`（数字与范围写法）、`references/priority.md`（争议结论的交代方式）。
- **5.6 Constexpr variables**：先列三种「看不出是不是常量表达式」的 const 例子，把问题变成读者能感到的不确定；用逐条对照区分 const 与 constexpr（值可变性、求值时机、能否参与常量表达式），再补「constexpr 不进入对象类型」这个细节；最佳实践先给两条判定句，再给不兼容类型清单与术语速查表。落点：`steps/04-paragraphs.md`（对照段）、`steps/06-wording.md`（术语速查表）。

### 已深读（第 3 批）

- **6.1 Operator precedence and associativity**：先把编译器拆成解析分组与求值两步，两个概念各配一个最小表达式（`4 + 2 * 3`、`7 - 4 - 1`）；给出 17 级完整表并标注结合方向，说明它是查阅表而不是背诵材料；最佳实践落在「非平凡复合表达式一律加括号」，并区分运算符执行顺序与操作数求值顺序未指定这两件事。落点：`steps/05-sentences.md`（括号与表达式示例）、`steps/03-blocks.md`（代码块的对照讲法）。
- **7.9 Inline functions**：先用同一个 `min()` 展开前后的代码对照讲动机（调用保存与恢复的成本），再讲 `inline` 的语义从「建议展开」变成「允许多处定义」，逐条说明现代编译器已经自己决定展开；最佳实践围绕「头文件里定义函数才用」，并列出隐式 `inline` 的成员与模板函数清单。落点：`steps/06-wording.md`（术语与历史含义分离）、`steps/02-structure.md`（头文件取值范围）。
- **8.10 For statements**：先给等价的 `while` 形式，用 `init-statement → condition → body → end-expression` 讲求值顺序；递减、步长、多计数器、嵌套、省略表达式各配一个可运行例子与输出；最佳实践密集出现（数字比较用 `<` 不用 `!=`、循环变量定义在循环内、有明确计数器用 `for` 否则用 `while`），`off-by-one` 用错误程序演示。落点：`steps/04-paragraphs.md`（示例段先结果后解释）、`steps/05-sentences.md`（最佳实践的判定句）。

### 已深读（第 4 批）

- **8.2 If statements and blocks**：先给最简语法骨架（有/无 `else` 两种），紧跟一个可运行例子与两种输入下的输出；常见错误用「看起来能跑」的程序开场，缩进骗过读者后改写成等价形式揭示真相，再用 block 修正；单语句加不加 block 先摆双方理由再给折中写法，`if-else` 与 `if-if` 用同一组参数的两个函数对照输出。落点：`steps/03-blocks.md`（错误示例的揭示顺序）、`steps/05-sentences.md`（分歧写法的交代）。
- **8.5 Switch statement basics**：用 `if-else` 链开场说明痛点（同一个表达式重复求值、读者要确认测的是同一个变量），再给等价的 `switch` 版本；执行轨迹直接写在代码注释里（「x 求值为 2 → 跳到 case 2 → 打印 Two」）；最佳实践三条（`default` 放最后、每个标签的语句以 `break`/`return` 收尾、标签不缩进）各配一段排版对照与理由。落点：`steps/03-blocks.md`（代码块内联注释的写法）、`steps/04-paragraphs.md`（先痛点后方案）。
- **6.6 The conditional operator**：开头一张运算符表（符号、形式、含义），再与 `if-else` 形式并排对照；示例用交互输入两个数取最大值，逐步写出 `(5 > 7) ? 5 : 7` 的求值过程；陷阱段先写「你以为的求值」再写「实际求值」，收在括号规则与四个正例上。落点：`steps/05-sentences.md`（求值过程的分步写法）、`steps/03-blocks.md`（表格与代码并置）。

### 已深读（第 5 批）

- **10.1 Implicit type conversion**：先用位模式对照（`3` 与 `3.0` 的二进制不同）回答「为什么需要转换」，再用 `memcpy` 的反面例子打印出 `4.2039e-45`；触发场景列五行代码（初始化、返回、混合运算、`if` 条件、传参），每个场景一句；最后给标准转换的分类表与完整表，并说明细节查 cppreference。落点：`steps/06-wording.md`（概念先讲动机后列表）、`steps/03-blocks.md`（反面示例的写法）。
- **10.5 Arithmetic conversions**：用 `2 + 3` 与 `2 + 3.5` 对照引入「共同类型」；给精简的 rank 列表与两步规则（先浮点后提升、同符号看 rank）；用 `typeid` 打印实际类型，再用 `5u - 10` 与 `-3 < 5u` 两个反直觉结果收尾，落到「避免混用有符号与无符号」。落点：`steps/05-sentences.md`（规则的编号写法）、`steps/04-paragraphs.md`（由问题引入规则）。
- **10.6 Explicit type conversion (casting) and static_cast**：用 `10 / 4` 得到 `2.0` 的常见错误开场，给出三种修法（字面量、`static_cast`、临时对象）；五张 cast 表带「是否安全」一列；最佳实践收在「避免 C 风格、优先 `static_cast`、用 cast 显式化窄化」，再对比 `int{x}` 临时对象的三点差异。落点：`steps/03-blocks.md`（表格列设计）、`steps/05-sentences.md`（最佳实践句）。

### 已深读（第 6 批）

- **12.3 Lvalue references**：先一句话定义「引用是已有对象的别名」加一个 Key insight，再列四种类型写法（`int`、`int&`、`double&`、`const int&`）；用 `ref = y` 打印 `6` 的常见误解演示「引用不能重绑定」；生命周期与悬垂引用分开讲，先给示例再生词。落点：`steps/06-wording.md`（别名类概念的引入）、`steps/05-sentences.md`（误解句的写法）。
- **12.7 Introduction to pointers**：从「指针名声不好」开场，用内存地址 `140` 把变量、引用、指针串成一条线；用 `&` 与 `*` 的互逆对照与「`&` 三种语境」提示消除符号歧义；收尾给指针与引用的五项差异清单（是否必须初始化、是否对象、能否重绑定、能否为空、是否安全），再补指针大小与悬垂指针。落点：`steps/03-blocks.md`（对照表用同一行维度）、`steps/04-paragraphs.md`（从具象例子过渡到清单）。
- **13.2 Unscoped enumerations**：用「魔数 → 符号常量 → 类型别名 → 枚举」四级改进演示为什么要枚举，每级指出不足；完整 `Color` 例子在代码里注释逗号、分号与尾逗号规范；命名与作用域两条最佳实践分开写（类型首字母大写、枚举项小写；放进 namespace 或 class），用 `blue` 命名冲突收尾。落点：`steps/01-task.md`（由问题引出类型的动机段）、`steps/05-sentences.md`（规范句的并列写法）。

### 已深读（第 7 批）

- **14.9 Introduction to constructors**：用「聚合初始化在成员改私有后失效」引出构造函数，把编译器错误 `no matching constructor` 当作线索；Key insight 先澄清「构造函数不创建对象」，再列两个职责（初始化列表、函数体设置）；结尾用 `Foo(6, 7)` 却打印 `Foo(0, 0)` 说明「有构造函数不等于完成初始化」，自然带出下一课。落点：`steps/01-task.md`（约束引出机制）、`steps/03-blocks.md`（错误信息作线索）。
- **14.10 Constructor member initializer lists**：先给完整可用示例，再拆语法（冒号、逗号、末尾无分号、只能用直接初始化）；三种排版并列后推荐「冒号另起一行、逗号开头对齐」；用 `m_y` 与 `m_x` 的初始化顺序打印 `-858993460`，落到「按声明顺序列成员、避免成员间依赖」。落点：`steps/03-blocks.md`（同一语法多排版）、`steps/05-sentences.md`（最佳实践祈使句）。
- **14.6 Access functions**：用 `Date` 类拿不到年份引出 getter/setter 并给定义；三种命名并列后给推荐（setter 用 `set` 前缀）；结尾「既然私有为何还给访问器」的自问，接「行为优先」（`kill()`/`revive()` 取代 `setAlive(bool)`）。落点：`steps/04-paragraphs.md`（自问自答段）、`steps/06-wording.md`（成对术语的定义方式）。

### 已深读（第 8 批）

- **14.11 Default constructors and default arguments**：先给最小可用示例、再补「值初始化 vs 默认初始化」的区别；用三个几乎相同的类（用户写空构造、`= default`、隐式）打印不同结果，把「用户提供 vs 非用户提供」的差别讲成可复现实验；最后用 `Fraction` 与 `Employee` 两个对照说明「只有对象在无初值时仍有意义才给默认构造函数」。落点：`steps/04-paragraphs.md`（对照实验段）、`steps/05-sentences.md`（结论句的适用范围）。
- **14.12 Delegating constructors**：用普通函数 `A()`/`B()` 的 DRY 重构作引子，再平移到构造函数；先演示「在函数体里调用构造函数只创建临时对象」，用 `e2 has name: ???` 的输出暴露误解；随后才给成员初始化列表中的委托写法，并说明「只能委托或初始化，不能两者兼做」；结尾用 `static constexpr` 默认值常量收束重复初值。落点：`steps/02-structure.md`（先错后对的讲解顺序）、`steps/03-blocks.md`（输出作为证据）。
- **14.13 Temporary class objects**：从「只用一次的变量可以省掉」这个最小观察出发，再推广到类类型；把 `print(p)`、`print(IntPair{5, 6})`、`print({7, 8})` 三种写法编号并列；用 `Foo bar();` 与 `Foo bar{};` 的对照讲括号歧义，并明确「看到花括号就知道在构造对象」；结尾给 `static_cast` 与列表初始化临时对象的取舍清单。落点：`steps/05-sentences.md`（对照句）、`steps/08-reread.md`（编号示例的收尾检查）。

### 已深读（第 9 批）

- **14.14 Introduction to the copy constructor**：用「这段程序居然能编译」制造悬念，回答是隐式拷贝构造函数；先讲成员逐个初始化，再手写一个带打印的版本证明调用；用传值、返回值两段数调用次数，顺势埋下「编译器可能只数到两次」的伏笔；`= default` 与 `= delete` 成对出现，最后用「拷贝构造函数不应有副作用」解释为什么。落点：`steps/01-task.md`（悬念开场）、`steps/03-blocks.md`（输出作为证据）。
- **14.15 Class initialization and copy elision**：把六种初始化写成同屏对照清单，给三条关键差异（窄化、只看非 explicit、列表构造优先）；用 `Copy constructor` 多调用一次的浪费引出拷贝消除，明确它是「as-if 规则的例外」，并给 C++17 强制消除的边界。落点：`steps/03-blocks.md`（同屏并列表）、`steps/05-sentences.md`（例外与边界句）。
- **14.16 Converting constructors and the explicit keyword**：从内置类型的隐式转换平移到用户定义类型，先展示 `print(5)` 的意外成功；用「只能做一次用户定义转换」解释 `std::string_view` 两跳失败，并给两种改法；`explicit` 的两条后果各配一个最小示例，最后用「单参数构造默认 explicit、拷贝构造不标」收束成可执行清单。落点：`steps/05-sentences.md`（规则配反例）、`steps/06-wording.md`（同一术语在多个层级复用）。

### 已深读（第 10 批）

- **14.17 Constexpr aggregates and classes**：从「同一个函数编译期能算、运行期也能算」起手，再让读者看见失败的那一行；用「聚合体天然支持 constexpr，而非聚合体要先成为字面类型」这条因果链解释报错；把 `const` 与 `constexpr` 拆成两件事，用「非 const 对象初始化 constexpr 对象」的示例点破直觉。落点：`steps/03-blocks.md`（先给现象后给规则）、`steps/06-wording.md`（近义术语对照）。
- **15.9 Friend classes and friend member functions**：先给「能访问私有成员」的一句话定义，再配一个可运行的最小类对；逐条排掉常见误解（不互逆、不传递、不继承、不共享 `*this`）；单个成员函数的友元用「编译错误的先后顺序」演示为什么需要前置声明与定义外移。落点：`steps/04-paragraphs.md`（误解清单成段）、`steps/05-sentences.md`（错误信息作线索）。
- **19.3 Destructors**：先界定「析构函数在对象销毁时执行」，再按名字、参数、返回值三条命名规则编号；`IntArray` 例子把「构造分配、析构释放」写成因果闭环；构造与析构的调用次序用输出顺序证明，最后用 `std::exit()` 不调用析构作反例。落点：`steps/03-blocks.md`（输出即证据）、`steps/05-sentences.md`（规则编号与反例）。

### 已深读（第 11 批）

- **15.1 The hidden "this" pointer**：用新人提问开场（「调用成员函数时怎么知道是哪个对象」），再用「编译器把 `simple.setID(2)` 改写成 `Simple::setID(&simple, 2)`」把不可见机制显形；链式调用用 `std::cout << a << b` 的括号分组作类比，落到 `return *this`；`this` 与 const 对象的关系用编译器原始报错收尾。落点：`steps/01-task.md`（以读者疑问开场）、`steps/03-blocks.md`（机制用改写前后对照）。
- **15.8 Friend non-member functions**：先讲「访问控制挡住了什么」这个需求，再给 `friend` 定义；把「类内定义的友元仍是普通函数」这种反直觉点单列；用 `isEqualToMember` 与 `isEqualToNonmember` 的写法平行性解释何时选非成员；最后以「优先用公开接口、优先非友元」收束。落点：`steps/04-paragraphs.md`（需求先行）、`steps/05-sentences.md`（最佳实践句）。
- **15.10 Ref qualifiers**：开头声明这是选学课，读者可轻读；用「返回引用在右值对象上悬空」的可运行反例提出两难（返回值安全但慢、返回引用高效但危险），再给 `&`/`&&` 两个重载各管一种隐式对象；末段明确「不推荐当最佳实践」，给可执行的替代习惯。落点：`steps/02-structure.md`（选学与主线的分层）、`steps/08-reread.md`（不推荐的结论也要给替代做法）。

### 已深读（第 12 批）

- **15.7 Static member functions**：接 15.6 先让 `Something::s_value` 可直读，再把 `private` 加上制造编译错误；用「普通 `getValue()` 必须实例化对象」与「静态 `getValue()` 用类名调用」两块最小例推进；收口是「纯静态类等同全局变量」的警告。落点：`steps/03-blocks.md`（先用失败立动机，再给可运行写法）。
- **16.2 Introduction to std::vector and list constructors**：接 16.1 的可扩展性挑战先建空 `vector`；用 `primes{2,3,5,7}` 与 CTAD 的 `vowels` 推进，邮箱编号类比讲零基下标；末尾用 `v1{5}` 与 `v2(5)` 对照钉死列表构造优先，收口「非元素值用直接初始化」。落点：`steps/06-wording.md`（取舍写成一句可执行的规则）。
- **16.6 Arrays and loops**：重提 16.1 痛点，先写 5 个 `testScore` 变量求平均、指出加人要改除数；换 `vector` 后仍要手写下标，遂用 0..4 升序接 `for` 遍历，再抽成 `calculateAverage`；收口给四类遍历用途与 off-by-one 警告。落点：`steps/01-task.md`（先给痛点到方案的距离）。

### 已深读（第 13 批）

- **17.1 Introduction to std::array**：连回 16.1 的三种数组，先答「有 `vector` 为何还要 `std::array`」（`constexpr` 与性能）；把 `std::array<int,5> a{}` 与 `std::vector<int> b(5)` 并排，用字面量、`constexpr`、枚举、宏四例讲长度必须是常量表达式，再补 CTAD 与 `to_array`；收口最佳实践：能 `constexpr` 就用它。落点：`steps/02-structure.md`（先对比再定章节顺序）。
- **17.2 std::array length and indexing**：接无符号长度问题；三种取长 `size()`、`std::size`、`std::ssize` 各配最小例，再分 `operator[]` 不检查、`at()` 运行期检查、`std::get<9>` 编译失败三层；中间插入按 `const` 引用传参后长度不再是 `constexpr` 的缺陷与模板绕法；收口一道测验串起三种索引。落点：`steps/08-reread.md`（回读时按层次清点边界）。
- **18.1 Sorting an array using selection sort**：开场不谈代码，用邮箱按时间排、联系人按字母排、有序表 20 次比较查百万条；先演示 `std::swap`，再用 `{30,50,20,10,40}` 逐轮标出当前最小值并换到 `{10,20,30,40,50}`，之后才给嵌套循环代码与「纸上画箭头」建议；收口引出 `std::sort`。落点：`steps/04-paragraphs.md`（一段一个推进动作）。

### 已深读（第 14 批）

- **17.7 Introduction to C-style arrays**：宣告这是最后一种数组、也是唯一内建且免 `include` 的数组；逐项与 `std::array` 对照：声明、长度须常量表达式且 VLA 非法、下标可带符号、省略长度的 `prime[]`、`sizeof` 得 20、`std::size`；用 `arr = {5,6,7}` 编译错误说明不能赋值；收口预告 decay 会让 `sizeof` 求长失效。落点：`steps/06-wording.md`（对照项写成同一句式）。
- **17.12 Multidimensional C-style arrays**：用井字棋 3×3 开场，先 `int ttt[9]` 说明一维不像棋盘；`int a[3][5]` 讲「数组的数组」并画行列表，对照 row-major 与 Fortran 列优先，用嵌套花括号（只能省最左维）、双重 `for`、10×10 乘法表推进；收口挑明笛卡尔 `{x, y}` 要写成 `[y][x]`。落点：`steps/01-task.md`（用读者熟悉的对象定题面）。
- **5.7 Introduction to std::string**：先列 C 风格字符串三宗罪（不能赋值、易越界、行为怪）；用空串、`name{"Alex"}`、改 `"John"` 推进，再放「输入全名」翻车案例——`cin >> name` 只取 John、Doe 被后面的变量吃掉，用 `getline(cin >> ws, name)` 修好并解释 `ws`；收口补 `length()` 无符号与按值传参昂贵，结论「先用起来」。落点：`steps/08-reread.md`（回读时检查示例是否真的可运行）。

### 已深读（第 15 批）

- **18.2 Introduction to iterators**：先用四种遍历写法并排（while、for、指针、范围 for），再指出前三者各有什么错法，最后把「迭代器」定义为抽象的遍历契约；三类迭代器对象用 `begin`/`end` 与 `operator++`/`operator*` 四个原语解释；迭代器失效用「边遍历边 `push_back`」的可运行反例，并以 `erase` 返回值修复收尾。落点：`steps/03-blocks.md`（多写法并排再抽象）、`steps/03-blocks.md`（反例要可运行）。
- **18.3 Introduction to standard library algorithms**：开头把手写循环的问题写成三条（易错、难维护、重复），再分「检查者、修改者、协调者」三类给函数；每个算法都是「是什么—签名—一段可运行代码—找不到时的返回值」；末尾用 `std::for_each` 与范围 for 的对照说明「意图清楚」比行数少更重要。落点：`steps/04-paragraphs.md`（分类先行）、`steps/05-sentences.md`（每个函数统一四要素）。
- **16.8 Range-based for loops**：先用可运行循环引出 off-by-one 与有符号/无符号问题，再给新语法；`element_declaration` 用类型推导线；`auto`/`auto&`/`const auto&` 用「改副本、改原值、只看」三种意图决定，并把「容器元素类型变了」作为未来维护点。落点：`steps/05-sentences.md`（选择依据写成意图句）、`steps/08-reread.md`（给未来维护留一句）。

### 已深读（第 16 批）

- **19.1 Dynamic memory allocation with new and delete**：先把三种内存分配（静态、自动、动态）并排列出，再逐条指出前两者的两个限制（编译期定长、自动释放），用「名字多长、记录多少条、怪物数量」三个真实例子把限制落到需求上；「猜最大值」的写法给四条代价（浪费、状态难辨、栈上限、越界），最后才给 `new`/`delete` 的语法与悬垂指针的可运行反例。落点：`steps/01-task.md`（先限制后方案）、`steps/03-blocks.md`（反例可运行）。
- **19.2 Dynamically allocating arrays**：开篇一句区分固定数组与动态数组的唯一差别（长度可在运行时决定），随即给完整程序；`new[]` 与 `delete[]` 成对出现，并用「用 `delete` 删数组是未定义行为」把最常见的错误单独成段；末尾「扩容只能自己搬」给出不推荐的理由并指向 `std::vector`。落点：`steps/04-paragraphs.md`（差异先行）、`steps/08-reread.md`（不推荐也要给替代品）。
- **20.1 Function pointers**：先用「忘了写括号，打印出 1」的意外现象引出函数指针，再给「`int (*fcnPtr)()` 为什么括号不能省」的解析；赋值、调用、`nullptr` 检查、回调（把比较函数传进排序）逐层加码，最后用 `std::function` 与类型别名收掉丑陋语法。落点：`steps/05-sentences.md`（现象句开场）、`steps/03-blocks.md`（语法与用法交错给）。

### 已深读（第 17 批）

- **20.2 The stack and the heap**：先给内存五段的总图，再只深入堆与栈两段；栈用「餐盘 → 邮箱 → 栈指针」三次替换类比，每次替换都补一个旧类比解释不了的细节（固定大小、标记、只移动指针不清内存）；栈溢出用两段可运行程序（大数组、递归）并给真实退出码。落点：`steps/03-blocks.md`（类比要逐步升级）、`steps/03-blocks.md`（崩溃也给可复现输出）。
- **20.6 Introduction to lambdas**：先承认 `containsNut` 那版能跑但有问题（一次性、要起名、放全局），把问题写成三条再给 lambda；`auto` 与 `std::function` 的取舍按「开销、可读、能否声明分离」列表；泛型 lambda 用「同字母月份」与「五个字母的月份」两例说明 `auto` 何时是负担。落点：`steps/01-task.md`（先问题后语法）、`steps/05-sentences.md`（取舍写成条件句）。
- **21.1 Introduction to operator overloading**：把 `x + y` 直接翻译成 `operator+(x, y)`，用这一条把「运算符就是函数」讲透；限制逐条编号（不能新增、至少一个自定义类型、不能改优先级与元数），每条都配一个反例；最后用 `operator^` 当幂运算的失败案例说明「保持原意」。落点：`steps/02-structure.md`（一条主线撑起全节）、`steps/08-reread.md`（限制配反例）。

### 已深读（第 18 批）

- **21.2 Overloading arithmetic operators with friends**：先给 `Cents` 这个最小类，再问「`cents1 + cents2` 谁来做」，把友元函数当作答案；同类相加与混合类型相加分成两段，后者强调 `Cents(4)+6` 与 `6+Cents(4)` 是两个函数；`MinMax` 例子用「三个 `operator+` 怎么排」把左结合展开成树。落点：`steps/01-task.md`（需求先行）、`steps/03-blocks.md`（表达式展开成树）。
- **21.4 Overloading the I/O operators**：先说明 `print()` 的两条不足（返回 `void`、不能嵌在输出流里），再给 `operator<<` 的签名与「为什么返回 `ostream&`」；`operator>>` 用「输入 `4.0b` 得到 `Point(4,0,3)`」的部分提取事故引出事务式实现，最后补「语义非法输入要手动置 `failbit`」。落点：`steps/03-blocks.md`（事故复现）、`steps/08-reread.md`（异常输入也算边界）。
- **22.1 Smart pointers and move semantics**：先用「提前 return 或抛异常就漏了 `delete`」两个可运行例子确立问题，再逐版迭代 `Auto_ptr1`（浅拷贝崩溃）→ `Auto_ptr2`（转移所有权）→ `std::auto_ptr`（被弃用的三条原因）→ C++11 的 `unique_ptr`/`shared_ptr`；每一版都只改一处并展示行为变化。落点：`steps/02-structure.md`（版本迭代式讲解）、`steps/04-paragraphs.md`（每段一个失败点）。

### 已深读（第 19 批）

- **22.2 R-value references**：先用两张表把「左值引用 / 右值引用分别能绑什么、能不能改」讲清，再给 `int&& rref{5}` 的寿命延长与「可以改临时对象」两个反直觉点（都配可运行输出）；重载决议用 `fun(x)` 与 `fun(5)` 分别走到哪一版；最后点明「具名右值引用变量本身是左值」。落点：`steps/03-blocks.md`（用表定规则再给例子）、`steps/08-reread.md`（反直觉点单独收口）。
- **22.4 std::move**：用 `mySwapCopy` 三个拷贝的开场，问「为什么不能直接移动」；`std::move` 只定义为「把左值转成右值引用的 `static_cast`」，不承诺任何搬运；移动后对象的状态用「标准库保证有效但未指定」加三条可做/不可做的清单。落点：`steps/05-sentences.md`（命名即契约）、`steps/02-structure.md`（先损失再工具）。
- **22.5 std::unique_ptr**：先把 21.x 的「异常/提前返回漏 delete」复述成一句动机，再给 `unique_ptr` 与「智能指针本身放栈上」的约束；拷贝被禁用、转移必须 `std::move` 用可运行输出验证；`make_unique` 补上异常安全与两处误用，最后按「持有、借用、传参」给决策表。落点：`steps/04-paragraphs.md`（约束先行）、`steps/03-blocks.md`（误用给可运行后果）。

### 已深读（第 20 批）

- **22.6 std::shared_ptr**：用「两个指针先后离开作用域、只析构一次」的输出串起引用计数；再用「从 res 各自构造两个 shared_ptr」与「拷贝已有 shared_ptr」的对照，给 `make_shared` 的必要性（控制块被复制时才共享计数）；末尾讲 `unique_ptr` 可转 `shared_ptr` 且不可逆。落点：`steps/03-blocks.md`（正反例成对）、`steps/08-reread.md`（不可逆的转换单列）。
- **22.7 循环引用与 std::weak_ptr**：Person 互指的完整程序和输出作为开场，逐句解释「为什么没有析构」，再给「一个 shared_ptr 指向自己」的简化版；`weak_ptr` 只给三条（不计数、用 `lock()` 取临时 `shared_ptr`、`expired()` 判断悬空），用 `getWeakPtr`/`getDumbPtr` 的输出对比收口。落点：`steps/02-structure.md`（现象先行、失败例排除法）、`steps/08-reread.md`（把「为什么漏」拆成引用计数的一次次增减）。

- **22.3 Move constructors and move assignment**：先用 `Auto_ptr3` 的深拷贝版跑出五条 `Resource` 输出，按六个步骤逐条编号，指出「两次拷贝、三次构造」的浪费；再把同一个类换成移动版，输出缩成两行，说明「偷指针再置空」；随后讲移动函数用非 const 右值引用、只在实参是右值或被返回的局部变量时被选中，隐式移动会逐成员移动、指针只拷贝不移动；末尾用 32% 的计时对比与「规则五」收口。落点：`steps/02-structure.md`（同一程序换一处再对比）、`steps/06-wording.md`（计时数字作证据）。

### 已深读（第 21 批）

- **23.1 Object relationships**：用「街边黄花与绿丛」的日常识别开场，把「你看不到这株植物却知道花会随整株死亡」拆成抽象类型、部件、依赖三层；随后一句一个英文关系词（is-a、has-a、uses-a、depends-on、member-of、part-of），每个都配一个生活例并标注本章或后两章讲哪一个。落点：`steps/01-task.md`（先给读者一个能迁移的框架）、`steps/02-structure.md`（概念章用类比铺垫再收束到术语表）。
- **23.2 Composition**：先给四条判定（部分是整体的一部分、同时只属于一个整体、生命周期由整体管理、部分不知道整体存在），再逐条用「人体与心脏」验证；「死亡关系」「单向关系」各一句话定义；实现给最小 `Fraction` 与 `Creature`+`Point2D` 两级例子，最后回答「为什么不用两个 int」的三条收益与「一个类只做一件事」的经验法则。落点：`steps/03-blocks.md`（判定清单先行）、`steps/03-blocks.md`（先小后组合的递进例）。
- **23.3 Aggregation**：以 23.2 为锚点只讲差异（可共享、不负责生死），用「住址」「汽车与引擎」两个生活例；实现对比落在「成员是引用/指针且由外部创建」，`Department`+`Teacher` 的可运行输出验证「部门析构、老师仍在」；末尾补「按程序需要选最简关系」与 `std::reference_wrapper` 的三条用法。落点：`steps/05-sentences.md`（差异用对照句而非重复定义）、`steps/08-reread.md`（边界情况放在末尾警告段）。

### 已深读（第 22 批）

- **23.4 Association**：用「医生与患者」开场，先给四条判定（互不相关、可同时属于多个对象、存在期不受对方管理、可能双向知晓），再给双向登记的例子；实现用 `std::reference_wrapper` 的向量，最后一张组合 / 聚合 / 关联三列对照表收口。落点：`steps/01-task.md`（关系先用判定清单定名）、`steps/04-paragraphs.md`（对照表放末尾作收束）。
- **23.6 Container classes**：用书架、抽屉类比对出「容器类就是存放并组织同类对象」，先列容器的最小功能清单（构造、插入、删除、计数、清空、访问），再区分值容器与引用容器；IntArray 从两个成员起步，按「构造 → 析构与 erase → `operator[]` → resize → 拷贝 → 插入删除」增量长大，每个函数只加一件事；末尾提醒标准库已满足需求时不要自造。落点：`steps/03-blocks.md`（增量构建的完整示例）、`steps/02-structure.md`（先给功能清单再写代码）。
- **23.7 std::initializer_list**：先给熟悉的 `int a[]{5, 4, 3, 2, 1}`，再让自定义 IntArray 用同一写法编译失败，把原因落到「缺少接收初始化列表的构造函数」；构造要点三条（尖括号写元素类型、`size()`、按值传递像视图），并用委托构造把分配与拷贝分开；随后讲列表初始化优先匹配列表构造的陷阱（`IntArray a(5)` 与 `IntArray b{5}`、`std::vector` 同例）和「给已有类加列表构造会静默改变行为」的警告。落点：`steps/03-blocks.md`（按失败 → 诊断 → 修好的顺序摆代码块）、`steps/08-reread.md`（把静默改行为写成独立警告）。

### 已深读（第 23 批）

- **24.1 Introduction to inheritance**：以「水果 → 苹果、香蕉」的 is-a 逻辑开场：凡是水果都有的性质（名字、颜色、大小、成熟过程）孩子类自动拥有；再给「方形 → 矩形 → 四边形 → 形状」的层级图，点明层级从一般走向特殊；末尾预告下一章的虚函数与多态。落点：`steps/01-task.md`（概念先用生活层级建立）、`steps/04-paragraphs.md`（层级图后紧跟一句解释）。
- **24.2 Basic inheritance in C++**：用 Person 与 BaseballPlayer 讲三步决策：直接复制成员（最差）、组合（先问「棒球选手有一个 Person 吗」）、继承（再问「棒球选手是一个 Person 吗」）；语法只用一行 `class BaseballPlayer : public Person`，随即用四个成员变量与继承来的 `getName()` 证明结果；再补 Employee 与 Supervisor 链，说明「改基类，所有派生类自动获得改动」的复用价值。落点：`steps/03-blocks.md`（语法块后紧接可运行证据）、`steps/02-structure.md`（决策写成三选一对比）。
- **24.3 Order of construction of derived classes**：先纠正「基类成员被复制进派生类」的直觉，改说派生对象由「Base 部分 + Derived 部分」组成；用带输出的两段程序把构造顺序显式化（Base 先、Derived 后），再用 A → B → C → D 链把「从最基类到最派生类」固化；收尾给两条理由：子类常依赖父类成员、父类不知道子类。落点：`steps/03-blocks.md`（顺序类知识用输出证明）、`steps/05-sentences.md`（先纠正直觉再给规则）。

### 已深读（第 24 批）

- **24.4 Constructors and initialization of derived classes**：先用 5 步与 6 步清单对比非派生与派生对象的构造流程（内存、基类构造、成员初始化、函数体）；再让「在派生构造的初始化列表里写 `m_id{ id }`」编译失败，引出「只能在自己的初始化列表里初始化自己的成员」，并解释 const 与引用只能初始化一次；最后给 `Base{ id }` 的正确写法与 A → B → C 的实参逐级传递，顺带提醒基类析构要写成虚函数。落点：`steps/03-blocks.md`（失败 → 规则 → 修好三段式）、`steps/08-reread.md`（把「为什么」写成一条不可违反的约束）。
- **24.5 Inheritance and access specifiers**：先用 3×3 矩阵表说明三种成员访问与三种继承方式的组合，再逐类举例（Pub / Pro / Pri）；`protected` 单独讲「何时值得用」：派生类是自己人或数量有限，否则优先 private；末尾给三条规则：类自己总能访问、外部按被访问类的说明符、派生类按继承来的说明符。落点：`steps/02-structure.md`（组合类知识用矩阵表）、`steps/05-sentences.md`（取舍写成条件句）。
- **24.6 Adding new functionality to a derived class**：用「第三方库不能改源码」与「标准库不能改」两种场景引出「派生后加成员函数」；对比在 Base 加 `getValue()` 与在 Derived 加，说明 Base 拿不到 Derived 的东西这种单向可见性；收尾提醒组合与继承都能做到时先看两者是什么关系。落点：`steps/01-task.md`（先给不能改的三类场景）、`steps/04-paragraphs.md`（单向可见性用对照句）。

### 已深读（第 25 批）

- **25.2 Virtual functions and polymorphism**：先用一个 `Base&` 绑定 `Derived` 却打印 `Base` 的反例开场，同一个程序加上 `virtual` 就打印 `Derived`；再用 A → B → C → D 的继承链和「对象是 C，为什么调 C 而不是 D」追问分派范围；`Key insight` 单独一句「只有经指针或引用调用才做虚分派」；术语先给定义再给后果，把多态拆成编译期与运行期两种；最佳实践「不要在构造与析构里调虚函数」用「Derived 部分还没建、或已经拆掉」解释。落点：`steps/03-blocks.md`（反例 → 修正两段式）、`steps/05-sentences.md`（术语先定义后使用）。
- **25.3 The override and final specifiers**：先给「签名差一点就不算覆盖」的隐蔽失败（`short` 换 `int`、`const` 换位置，程序照常编译却打印 `A`），再引入 `override` 让编译器当面报错；把 `const` 必须写在 `override` 前面、`override` 隐含 `virtual` 这类规则逐条编号；`final` 分别演示加在函数与类上；协变返回类型用 `getThis()` 的输出说明「返回类型跟着调用处的静态类型走」。落点：`steps/02-structure.md`（先隐性失败再给编译期守卫）、`steps/06-wording.md`（规则编号）。
- **25.4 Virtual destructors**：用 `delete base` 只打印 `~Base()` 的泄漏反例开场，改正后同时打印 `~Derived()` 与 `~Base()`；规则写成「基类显式析构就要虚」，并给 `virtual ~Base() = default;` 这个空实现写法；末尾比较 Herb Sutter 的 `protected` 析构方案与 `final` 方案，说明为什么今天的建议是「打算被继承就让析构虚且公开，不打算被继承就标 `final`」；虚赋值明确不推荐。落点：`steps/01-task.md`（用后果定规则）、`steps/08-reread.md`（把例外与代价写清）。

### 已深读（第 26 批）

- **25.5 Early binding and late binding**：用「CPU 怎么知道跳到哪一行」的提问开场，先给 binding 与 dispatching 的定义再分类；接着把同一个计算器程序写两遍，第一版直接调用三个函数，第二版改成函数指针数组，结构其余部分一字不改，让「调用方式」成为唯一变量；进阶读者折叠里给两段汇编作证据；末尾用「多一次读地址再跳」解释代价，并说明灵活性的来源。落点：`steps/02-structure.md`（同构程序只换一处）、`steps/03-blocks.md`（提问开场）。
- **25.6 The virtual table**：先用同一个 `Base` 上的 `getName()` 与 `getNameVirtual()` 对照，把「静态类型决定」与「动态类型决定」并排打印；再把 vtable 拆成两条可记的事实——每个类一张表、每个对象一个隐藏指针；用 Base / D1 / D2 三个类手工推演 `dPtr->function1()` 的查表路径，并追问「指向 Base 时会不会也调 D1」；最后用「3 次操作、2 次、1 次」量化调用开销。落点：`steps/06-wording.md`（量化代价）、`steps/08-reread.md`（两条事实先立后推）。
- **25.7 Pure virtual functions**：先给「Cow 忘了 override，于是打印 `???`」的反例，再引入 `= 0` 和编译器报错原文；把抽象类的两条后果逐条写出（不能实例化、派生必须实现）；接口类用 `IErrorLog` 与 `mySqrt` 参数从 `FileErrorLog&` 换成 `IErrorLog&` 的前后对照，说明「调用方自由」；最后补纯虚函数带定义的限制与 `__purecall` 的实现细节。落点：`steps/08-reread.md`（反例 → 编译器错误）、`steps/04-paragraphs.md`（前后对照成段）。

### 已深读（第 27 批）

- **25.8 Virtual base classes**：用「同一个 `main()` 打印两次 PoweredDevice」的输出开场，先纠正「继承图像一棵树」的直觉，再给 `virtual` 继承后只打印一次的对照；把「谁负责构造共享基类」写成问答，答案是「最派生类」，随后列四条细节：虚基类先于非虚基类构造、中间类的构造调用被忽略、即使单继承也由最派生类负责、带虚基类的类必有虚表。落点：`steps/02-structure.md`（先纠正直觉再给规则）。
- **25.9 Object slicing**：先用引用与指针各打印一次 `Derived`，再把同一对象赋值给 `Base` 变量打印 `Base`，把差异落到「只复制 Base 部分」；接着按「函数按值传参」与 `std::vector<Base>` 两个常见事故展开，再给指针与 `std::reference_wrapper` 两种修法；最后用 `b = d1` 演示赋值运算符不是虚函数造成的 Frankenobject。落点：`steps/04-paragraphs.md`（每个事故一段、修法紧跟事故）。
- **25.10 Dynamic casting**：先给「手里只有 `Base*`，怎么调只在派生类里的方法」的需求，并说明往基类加虚函数为什么不合适；再给 `dynamic_cast<Derived*>` 的成功例，随即把 `getObject(false)` 改一下制造失败，强调必须判空；补 `static_cast` 向下转换的诱惑与 `getClassID()` 方案为什么不如 `dynamic_cast`；引用版失败抛 `std::bad_cast`，末尾给「非向下转换优先 `static_cast`」与 RTTI 的代价。落点：`steps/08-reread.md`（回读时逐个检查失败路径）、`steps/03-blocks.md`（成功例与失败例成对摆）。

### 已深读（第 28 批）

- **26.1 Template classes**：从「一对坐标想同时支持 int 与 double」的需要开场，先给 `template <typename T> class Pair1` 与 `Pair1<int>` 的实例化，再补类外定义成员函数要重复 `template <typename T>` 与 `Pair<T>::`；把「模板类不是类型，实例化结果才是」单独成句；最佳实践收口在「定义放头文件」。落点：`steps/02-structure.md`（先需求后语法）。
- **26.2 Template non-type parameters**：用 `StaticArray<T, size>` 开场，把非类型参数讲成「编译期常量，可以拿来定数组长度」，再顺手对照 `std::array`；限制按「能传什么」列三条（整型、枚举、指针引用；C++20 起的结构类型另说），并用 `static_assert` 做约束示范；最佳实践写「长度用 `std::size_t`，别拿它当运行时配置」。落点：`steps/04-paragraphs.md`（限制逐条成段）。
- **26.3 Function template specialization**：先让泛型 `max` 在 `const char*` 上比出错误结果，把「比较的是指针」这一句放在失败输出旁边，再给显式特化 `template <> const char* max<const char*>(...)`；区分特化与重载（重载参与决议，特化在主模板选中后生效）；最佳实践写「能重载或 `if constexpr` 就不特化」。落点：`steps/05-sentences.md`（术语先定义再使用）、`steps/08-reread.md`（回读检查特化与主模板签名一致）。

### 已深读（第 29 批）

- **26.4 Class template specialization**：用 `Storage8<bool>` 的「1 bit 有用、7 bits 浪费」开场，把「为什么需要特化」落在可测量的浪费上；再给 `template <> class Storage8<bool>` 与位运算实现，解释 `template<>` 的空尖括号；强调特化类可换实现但要保留接口；把「特化与主模板写在同一头文件、紧挨主模板」写成规则，并警告「靠包含某个头文件改变行为」是坏设计。落点：`steps/03-blocks.md`（先给浪费再给方案）。
- **26.5 Partial template specialization**：从 `print(StaticArray<char, 14>)` 全特化覆盖不了其他长度开场，给 `template <int size> void print(const StaticArray<char, size>&)`；关键一句「这不是函数偏特化，只是接受偏特化类参数的重载」；再讲类偏特化 `StaticArray<double, size>`，最后用公共基类 `StaticArray_Base` 把重复代码收回去，并提醒偏特化类要写在主模板之后。落点：`steps/04-paragraphs.md`（每次尝试单独成段）。
- **26.6 Partial template specialization for pointers**：用 `Storage<double*>` 打印出地址而非值制造「能编译、结果是错的」现场；先试全特化 `double*`，说明无法穷举；再试 `template <typename T> void Storage<T*>::print()` 编译失败，点明「函数不能偏特化」；随后改成类偏特化 `Storage<T*>`，成员函数就不再是特化；末尾讲所有权差异：复制语义与引用语义混用是 bug 温床，收口在 `static_assert` 禁止指针类型或用 `unique_ptr` 持有副本。落点：`steps/03-blocks.md`（失败现场与规则成对）、`steps/08-reread.md`（回读检查特化定义的位置与签名）。

### 已深读（第 30 批）

- **27.1 The need for exceptions**：用 `findFirstChar` 返回 `-1` 开场，先列返回码的三处硬伤（值本身有歧义、只能返回一个值、每次调用都要检查），再给 `divide(x, y, bool&)` 的改写演示「结果与错误挤在一个签名里」；补构造函数没有返回类型可用；收口在「错误处理与正常控制流耦合」。落点：`steps/03-blocks.md`（先给可运行例子，再列问题）。
- **27.2 Basic exception handling**：用橄榄球罚旗作类比（throw 抛旗、try 观察、catch 处理），每个关键字配一个最小例子；单独成句讲「异常匹配不做隐式转换」（`char` 不进 `int`、`int` 不进 `double`）；catch 参数对非基本类型用 `const&`；末尾把 catch 的四种典型用法写成编号清单。落点：`steps/04-paragraphs.md`（类比段与规则段分开）、`steps/05-sentences.md`（术语先定义后使用）。
- **27.3 Exceptions, functions, and stack unwinding**：先问「try 块里的函数调用抛出异常，会被接住吗」，再给 `mySqrt()` 从 `main` 的 try 里被调用并捕获的例子，点明「被调函数不必自己处理」；用 `D→C→B→A→main` 的完整输出当证据，逐条解释 B 的两个 try 为什么没接住（类型不匹配、调用不在对应的 try 内）；Key insight 写「栈展开会析构被展开函数里的局部变量」。落点：`steps/08-reread.md`（回读检查异常路径的整条调用链）、`steps/03-blocks.md`（输出即证据）。

### 已深读（第 31 批）

- **27.4 Uncaught exceptions and catch-all handlers**：用「如果没人接会怎样」开场，先跑没有 try 的 `mySqrt(-4)`，指出 `std::terminate()` 结束进程且栈可能不展开；用 Warning 框讲「不展开时局部变量不析构」，As an aside 解释「保留栈信息方便调试」；再用「异常类型无限多、无法逐一列举」引出 `catch (...)`，示例把 `catch (double)` 放前面证明只有兜底接住，强调它必须排在最后一段；最后给 `main` 外层包 catch-all 的游戏存档场景，Tip 写「接住后程序状态未定，清理完就结束」，并演示 `NDEBUG` 下用 `DummyException` 关掉兜底的写法。落点：`steps/03-blocks.md`（先现象后规则）、`steps/08-reread.md`。
- **27.5 Exceptions, classes, and inheritance**：从重载 `operator[]` 的 `assert` 讲起（断言不能把错误报给调用方），改用 `throw index`；构造失败时析构不会执行，于是把资源交给 RAII 成员，用 `Member` 的打印顺序演示「成员先析构、再进 catch」，再给 `unique_ptr` 的替换写法；用「try 里多个调用都抛 int」制造「到底是谁抛的」歧义，引出异常类 `ArrayException`；Best practice 表格化成两句：基本类型按值接，类类型按 `const&` 接；派生类异常必须先于基类捕获（先 Base 会先命中），Rule 写「派生在前、基类在后」；`std::exception` 统一收口并给出 `what()` 的只读用途与「不要拿它做比较」；最后给从 `std::exception` 与 `std::runtime_error` 派生的两种写法（`what()` 要 `noexcept`），Tip 写「异常对象要可拷贝、不要持有栈上指针」。落点：`steps/04-paragraphs.md`、`steps/05-sentences.md`。
- **27.6 Rethrowing exceptions**：用「只想记日志、不想就地处理」的场景开场，先给能返回错误码的 `createDatabase` 作对照，再换成返回 int 的 `getIntValue`，说明返回值都合法时错误码不可用，引出 `throw 'q'`；错法演示 `throw exception` 会拷贝并在基类引用上切片，用两层 try 的两次打印（第二次变成 Base）当证据；正法演示裸 `throw;`，两次打印都是 Derived；Rule 收口「重抛同一条异常时只写 throw」。落点：`steps/08-reread.md`、`examples/exceptions.md`。

### 已深读（第 32 批）

- **27.7 Function try blocks**：用「基类构造函数在成员初始化列表里抛异常，派生类构造函数体里的 try 包不住」的困境开场，再给函数 try 块语法（`try` 放在冒号前、`catch` 与函数同级缩进）；用完整程序的两行输出（先 `Exception caught` 再 `Oops`）证明 catch 里重抛；给出四行限制表（构造函数只能抛/重抛、析构与无返回值函数可 resolve、有返回值函数走到 catch 末尾是未定义行为），Best practice 写「不要让控制流走到函数级 catch 末尾」；最后说明不能用它清理资源（对象已死，访问成员是未定义行为），它只适合记日志或换异常类型。落点：`steps/03-blocks.md`、`references/exceptions.md`。
- **27.8 Exception dangers and downsides**：资源清理三连错开场——文件没关、`new` 后抛异常泄漏、局部指针随 try 出作用域；修法递进为「挪到 try 外 → `unique_ptr` → 栈上 RAII 对象（最佳）」。接着讲析构函数抛异常遇上栈展开会直接终止（Rule 框），性能段区分「正常路径零成本例外模型」与「抛出时昂贵」；最后给「何时用异常」四条并列清单，再用文件名不存在的例子逐条走查，强调第四条「有没有更好的错误码」才是关键。落点：`steps/04-paragraphs.md`、`steps/05-sentences.md`。
- **27.9 Exception specifications and noexcept**：从「看 `int doSomething();` 判断不出会不会抛」开场，指出注释会过期且编译期不检查；定义非抛出与可能抛出两类函数，说明 `noexcept` 不阻止内部抛出、只承诺异常不逃出，违反即 `std::terminate` 且栈可能不展开（Key insight 写「契约承诺而非编译器强制」）。用 `Doomed` 析构打印的完整程序对照两种情况：noexcept 内部 catch 合法、noexcept 函数把异常放给调用方则终止；再讲 `noexcept(bool)` 的模板用法、隐式非抛出清单、`noexcept` 运算符的编译期求值、异常安全四档保证（无/基本/强/不抛），Best practice 收在「move 构造、move 赋值、swap 必须标；copy 能标就标；不确定就别标」。落点：`steps/04-paragraphs.md`、`references/exceptions.md`。

### 已深读（第 33 批）

- **27.10 std::move_if_noexcept**：用「拷贝失败源对象无损、移动失败源对象已改」的对比建立强异常保证与移动的冲突；完整程序用 `MoveClass`/`CopyClass` 拼进 `std::pair`，移动构造一半时拷贝成员抛异常，逐行读打印序列说明源 `MoveClass` 变成 empty；引出 `std::move_if_noexcept`：有 noexcept 移动构造才给右值，否则退回左值拷贝（Key insight 一句话），同一程序换一行后源对象仍打印 13；最后用 Warning 讲 move-only 且移动可能抛时标准库放弃强保证，`vector::resize` 就靠它选移动或拷贝。落点：`steps/05-sentences.md`、`references/exceptions.md`。
- **28.1 Input and output (I/O) streams**：先声明 I/O 不在核心语言里而在标准库，贴着 `std::` 讲；从 iostream 类层级引出多重继承，说明「这一处是设计好的、可放心用」；把流定义为「可按顺序访问的字节序列」，输入流举键盘缓冲、输出流举打印机预热，点出「学一套接口即可面对多种设备」；再分 istream/ostream/iostream 与 `>>`/`<<` 的方向感（提取与插入），末段列 cin/cout/cerr/clog 四条标准流并说明 clog 常被省略。落点：`steps/02-structure.md`、`steps/04-paragraphs.md`。
- **28.2 Input with istream**：用 `char buf[10]` 被 18 个字符冲垮开场，引入 `std::setw(10)` 限长（只读 9 个字符给终止符留位）；`>>` 跳过空白导致 `Hello my name is Alex` 变成 `HellomynameisAlex`，再用 `get()` 对照保留空格；`get(strBuf, 11)` 只读 10 个字符，接着演示 `get()` 不吃换行导致第二次调用立刻停止的坑，引出 `getline()` 会取走并丢弃分隔符，`gcount()` 统计读入数；最后给 `std::getline(std::cin, str)` 的 string 专用版本，并用一行一句列出 `ignore`/`peek`/`unget`/`putback`。落点：`steps/03-blocks.md`、`examples/comments-implementation.md`。

### 已深读（第 34 批）

- **28.3 Output with ostream and ios**：先给「改格式有 flags 与 manipulators 两套」，用 `showpos` 演示 `setf`/`unsetf`，再暴露 `setf(std::ios::hex)` 不生效（dec 仍在），给两条修法：`unsetf(dec)` 与双参 `setf(hex, basefield)`；接着按组列表（boolalpha、showpos、uppercase、basefield、floatfield、adjustfield），每组配同一条输出的结果对照；精度三态（fixed / scientific / 默认有效数字）用同一个 `123.456` 的连续输出说明差别；`setw` 只作用于下一次、`fill` 会持续，用 `-12345` 的五种对齐输出收尾。落点：`steps/03-blocks.md`、`references/examples.md`。
- **28.4 Stream classes for strings**：先定义「字符串流不接 I/O 通道，只借用 << 与 >> 在内存里缓冲」，列六个类与 `<sstream>`；再给两种写入（`<<` 与 `str("...")`）和两种读取（`str()` 取整段、`>>` 逐个取 token）；用两段小程序演示数字与字符串互转；最后给清空缓冲的两种写法（`str("")` 与 `str(std::string{})`）并补 `clear()` 复位错误位。落点：`steps/02-structure.md`、`examples/comments-implementation.md`。
- **28.5 Stream states and input validation**：先给状态位表（goodbit / badbit / eofbit / failbit）与成员函数表（good/bad/eof/fail/clear/rdstate/setstate），用 `cin >> age` 输入 `Alex` 设 failbit 演示「非 good 之后所有操作被忽略」；字符串验证用 `std::all_of` + `isalpha`/`isspace` 的姓名例子（附 C++20 ranges 写法）；数字验证给 fail → clear → `ignore(max, '\n')` 的循环，再演示 `34abcd56` 的前半被提取、后半留成垃圾的坑，用 `gcount() > 1` 判无效；末段给 string + `std::from_chars` 的替代方案。落点：`steps/04-paragraphs.md`、`steps/08-reread.md`。

### 已深读（第 35 批）

- **28.6 Basic file I/O**：先声明文件流三兄弟 `ifstream`/`ofstream`/`fstream` 与 `<fstream>`，拿「必须先显式 `open`」对照 `cin`/`cout` 的即用；写文件示例写两行再读回，每一步都检查打开失败；读回时 `>>` 按空白切词，露出「Hello my name」被切成三个词，再给 `getline` 与「用完 `close` 或让流离开作用域」收尾。落点：`steps/03-blocks.md`、`steps/07-layout.md`。
- **28.7 Random file I/O**：用「要在文件中间读写」引出 `seekg`/`seekp`，先给 C 式 `fseek`/`ftell` 的对照，再讲 `ios::beg`/`cur`/`end` 三个基准；用「写入 1A 与 2A 后按位置读」演示定位与截断的差异；末段分出文本模式与二进制模式（`ios::binary`），说明换行换算带来的偏移差。落点：`steps/04-paragraphs.md`、`references/priority.md`。
- **A.1 Static and dynamic libraries**：先给「库是给多个程序复用的代码包」并拆成头文件与预编译二进制两部分，列出「不必反复编译」与「保护源码」两条预编译理由；静态库与动态库各一段，用 `.lib`/`.a` 与 `.dll`/`.so` 对照分发与升级的取舍；再单独定义「导入库」，说明 Windows 的同名 `.lib` 与 Linux `.so` 兼任；最后把「用一个库」拆成七步编号清单（获取、安装、头文件路径、库路径、链接、`#include`、运行时查找），并把「把 DLL 复制到可执行同目录」作为最省事的运行时方案。落点：`steps/04-paragraphs.md`、`steps/07-layout.md`。

### 已深读（第 36 批）

- **O.1 Bit flags and bit manipulation via std::bitset**：用「最小可寻址单位是字节、`bool` 只用一个位却占整字节」的浪费开场，先说多数场景不值得优化，再转向存储密集场景；给位术语表（0 为 false/off/not set，1 为 true/on/set，切换叫 flipped/inverted）加邮筒小旗的生活类比；讲位位置从右往左、从 0 编号，再用 `std::bitset<8>` 的 `test`/`set`/`reset`/`flip` 四个成员配合 `0b0000'0101` 演示并打印结果；随后用命名常量替代魔数，末段提醒 `bitset` 按 `size_t` 对齐、不省内存。落点：`steps/06-wording.md`、`steps/07-layout.md`。
- **F.1 Constexpr functions**：先用「`constexpr` 变量的初始化器必须是常量表达式」跑出编译错误（`calcCircumference(3.0)`），再用一个 `constexpr` 关键字修复；Key insight 两条：`constexpr` 是给编译器和读者的「可常量求值」信号，运行时求值时与普通函数一样；用「编译器把调用替换成 `18.8496`」的等价代码演示编译期求值，再给参数不是常量表达式时退回运行时的对照。落点：`steps/05-sentences.md`、`steps/08-reread.md`。
- **B.5 Introduction to C++23**：用「2023 年 2 月 ISO 批准」一句定位版本，随后以非穷举清单逐条列改进（`std::print`、`std::expected`、多维下标、`std::to_underlying` 等），每条能挂到既有课就挂链接、尚未覆盖的标「暂无课」；这种「特性 + 落点」的清单让读者按需跳读，也顺手画出教程的边界。落点：`steps/02-structure.md`、`steps/07-layout.md`。

## DSH 插件目录

### 前 100 名（npm 关键字 `dsh-plugin`，按 30 天下载量排序）

| # | 包名 | 30 天下载 | 定位（描述首句） |
| --- | --- | ---: | --- |
| 1 | `dsh-whale-widget` | 253956 | DSH Web 界面右下角的 DeepSeek 余额小鲸鱼挂件:余额/今日已用/峰谷定价、自定义泡泡点击序列(文本/… |
| 2 | `dsh-ops` | 54981 | Native file and PTC tools for DSH on Windows x64, Linux x6… |
| 3 | `@michengai/dsh-skills-manager` | 128420 | DSH Skills Manager — 在 DeepSeek Harness 中统一加载并安全管理本机 Agent… |
| 4 | `dsh-pet` | 156401 | 吃白饭的蓝色大肥鱼，赖在 DeepSeek Harness 里不走了 |
| 5 | `@xmanrui/dsh-im` | 68528 | 把微信、飞书、企微、钉钉、QQ、Telegram、WhatsApp、Slack、Discord、Matrix接入DSH |
| 6 | `dsh-cost-meter` | 115702 | DeepSeek Harness 会话费用统计插件:本会话成本、当日费用、历史记录与官方价格同步,支持多厂商多模型价… |
| 7 | `@liustack/modsearch` | 44456 | The strongest free web search plugin for coding agents. Pl… |
| 8 | `dsh-plugin-wallpaper-engine` | 82452 | Wallpaper Engine backgrounds for the DSH web GUI: render y… |
| 9 | `dsh-bili-scroll` | 26863 | DSH 插件：每天替你刷一轮 B站 —— 读字幕挑出值得的、写一份日报，值得的就 @ 你 |
| 10 | `dsh-univer-office` | 46545 | DSH × Univer integration with a bundled collaboration Gate… |
| 11 | `@deepseek-harness-tui/dsh-tui` | 54979 | Interactive terminal interface for DeepSeek Harness agents… |
| 12 | `dsh-mnemon` | 57152 | Composable, view-based context for DeepSeek Harness. Plugg… |
| 13 | `@dfy-plugins/dsh-image-generation` | 52721 | 为 DeepSeek Harness 提供独立的图像生成与编辑 Skill、工具和设置界面 |
| 14 | `@dfy-plugins/dsh-visualize` | 30443 | 在 DeepSeek Harness 对话中以会话级 artifact 安全展示交互式 HTML 可视化 |
| 15 | `dsh-builtin-browser` | 23513 | Shared real browser plugin for DeepSeek Harness: install-a… |
| 16 | `@nanmicoder/dsh-agent-teams` | 47386 | AgentTeams for DeepSeek Harness: multi-agent team collabor… |
| 17 | `dsh-plugin-model-proxy` | 42888 | DSH plugin: per-model proxy routing (http/https/socks5) wi… |
| 18 | `@dfy-plugins/dsh-bundle` | 42034 | DFY 插件组合包：壁纸、外观、归档管理、媒体内容、图像生成、交互可视化、任务守卫和 Codex 连接 |
| 19 | `dsh-fireworks` | 17220 | Fireworks AI provider bridge for the DeepSeek Harness - na… |
| 20 | `@iasiv5/dsh-obmc-web` | 28918 | OpenBMC 控制台入口：设置一级菜单「BMC 控制台」面板一键在顶层标签页打开 BMC Web UI，同源代理经… |
| 21 | `@furongjun1999/dsh-memory` | 28048 | 灵枢（Lingshu |
| 22 | `@tt-a1i/archify-dsh` | 35399 | Opt-in DeepSeek Harness Skill-only bundle for the Archify … |
| 23 | `@wxg-prc-cpg/browser-skill-dsh-plugin` | 31928 | DeepSeek Harness tool plugin that exposes BrowserSkill bro… |
| 24 | `dsh-image-gen` | 33553 | Bring ChatGPT-like image generation to DeepSeek Harness — … |
| 25 | `dsh-find-plugin` | 25374 | Find DeepSeek Harness plugins inside the agent — live GitH… |
| 26 | `dsh-codex-connect` | 13888 | ChatGPT OAuth and Codex models for DeepSeek Harness. |
| 27 | `memory-eternal` | 13779 | 记忆核心（Memory Eternal）：自研的 DeepSeek Harness 记忆插件，不移植任何既有记忆框架… |
| 28 | `dsh-mcp-connector` | 25166 | DeepSeek Harness MCP Connector: connect servers, search to… |
| 29 | `dsh-plugin-update` | 18542 | 给 DSH 插件加「检查更新 / 安装更新」能力的 npm 包：宿主一段接线 + 面板一个现成组件，查新版、装更新、… |
| 30 | `dsh-mobile` | 18169 | DeepSeek Harness 移动端适配与安全访问插件，支持局域网、远程连接、Android App 和手机浏览器 |
| 31 | `dsh-plugin-cards` | 9823 | DeepSeek Harness (dsh) 设置卡片 + 对话节点插件 |
| 32 | `dsh-perm-gate` | 15457 | DSH permission-gate for the DeepSeek Harness 0.1.5 line: a… |
| 33 | `@dfy-plugins/dsh-appearance` | 20774 | DFY DSH 对话外观设置：调节回复行距与过程行距，并扩展本地文件的打开方式 |
| 34 | `meow-memory` | 15022 | Cross-session project memory for DeepSeek Harness: seven-l… |
| 35 | `@wenbin_wb/dsh-bridge` | 14889 | DSH 远程连接/远程控制插件（remote control）：手机扫码即可在移动端/公网继续用 DeepSeek … |
| 36 | `@opencode2dsh/dsh-plugin` | 10999 | Free OpenCode Zen models for DeepSeek Harness (DSH): nativ… |
| 37 | `@goodandready/dsh-key-rotation` | 10967 | Per-provider API key rotation for DeepSeek Harness: a key … |
| 38 | `@noob-stupid/dsh-plugin-console` | 19761 | DSH 框架升级安全与插件升级门控：一键升级、失败自动回滚、升级后回滚上版、旧插件不适配自动禁用 |
| 39 | `dsh-prompt` | 10576 | DSH prompt 工具箱：预制 + 自定义 prompt 模板，点击即插入当前对话输入框（v1 常规模式 + v… |
| 40 | `dsh-custom-mode` | 8117 | Edit a DeepSeek Harness (dsh) custom mode: system prompt, … |
| 41 | `beauticode-dsh` | 13273 | Cordis plugin: image/video backgrounds for DeepSeek Harnes… |
| 42 | `dsh-jiuling-remote-mobile` | 15848 | DSH 远程目录（手机端）：在选文件夹流程里多出「电脑」页签，进入电脑目录、在电脑上发起对话，并把电脑的实时消息流同… |
| 43 | `dsh-web-mobile` | 8894 | 尽可能的使dsh适配竖屏等移动端设备 |
| 44 | `@goodandready/dsh-image-gen` | 11717 | Image generation for DeepSeek Harness: a generate_image to… |
| 45 | `dsh-computer-use-win` | 11713 | Windows computer use for DeepSeek Harness: an MCP stdio se… |
| 46 | `dsh-config-manager` | 16929 | Backup, restore, export, import, migrate and sync your Dee… |
| 47 | `dsh-pocket` | 15480 | 把 DeepSeek Harness 装进你的口袋：一个包、一个设置页，手机扫码即同步访问电脑上的 DSH（局域网 … |
| 48 | `dsh-patch-edit-plus` | 6703 | Patch-style file editing for DeepSeek Harness: one apply_p… |
| 49 | `@microi.net/cli` | 8249 | Microi吾码 AI 开发 CLI 与多宿主 Plugin：服务器连接、Skills、MCP、V8 同步和低代码交付 |
| 50 | `dsh-any-background` | 6556 | Appearance plugin for DeepSeek Harness: custom theme color… |
| 51 | `dsh-session-manager` | 13698 | DeepSeek Harness session and workspace manager —— Workspac… |
| 52 | `@goodandready/dsh-subscriptions` | 12857 | Use ChatGPT Codex, Claude, Grok, Antigravity, Kimi, GLM, C… |
| 53 | `misakanet` | 6505 | MisakaNet failure-memory skill — evidence-rated failure le… |
| 54 | `ds-bot` | 13422 | DS Bot: a team of long-lived Bots for DeepSeek Harness, wi… |
| 55 | `@perrylink/dsh-plugin-doctor` | 6370 | Zero-dependency static + sandbox smoke detector for DeepSe… |
| 56 | `dsh-plugin-subscriptions` | 10157 | Use ChatGPT (Codex), Claude, Grok (X Premium), GitHub Copi… |
| 57 | `dsh-notify-me` | 10012 | 离开 DSH 页面也能收到提醒：需要你操作 / 后台回复完成时发系统通知、标题标记与提示音，支持审批快捷裁决与外部推… |
| 58 | `@copylee/dsh-computer-use` | 6029 | DeepSeek Harness Computer Use 插件（Windows）：让 AI 看屏幕、点鼠标、敲键盘… |
| 59 | `@lolkda/dsh-skills-manager` | 12441 | Manage the DeepSeek Harness skill catalog from Settings: l… |
| 60 | `dsh-live2dwaifu` | 5780 | 给 DSH 网页右下角请一个 Live2D 角色：会眨眼、会呼吸、视线跟着鼠标、点她有反应、说话时嘴动、心情变了眉毛… |
| 61 | `dsh-thoughtdag` | 7121 | ThoughtDAG for DeepSeek Harness: turn the current DSH sess… |
| 62 | `dsh-chat-manager` | 11248 | DeepSeek Harness chat history and session management: sear… |
| 63 | `@goodandready/dsh-clinebot` | 9438 | DeepSeek Harness companion for ClineBot / ClinePass: dynam… |
| 64 | `dsh-office-tools` | 9252 | DSH model-facing Office tools: create, read, and update Wo… |
| 65 | `dsh-client-auto-continue` | 10901 | DSH Web UI plugin: automatically sends a localized continu… |
| 66 | `@kenz1117/dsh-engram` | 6842 | Local-first cross-session long-term memory for DeepSeek Ha… |
| 67 | `dsh-background-by-model` | 9063 | Appearance plugin for DeepSeek Harness: an ordered list of… |
| 68 | `@morlay/session-rdb` | 8891 | RDB durable session backend for DeepSeek Harness: implemen… |
| 69 | `@huanlin/dsh-plugin-better-locale` | 8850 | DSH web 插件：通过 DSH v0.1.5-rc.1 原生第三方语言 API（locale.addLangua… |
| 70 | `@goodandready/dsh-cron` | 8934 | Background automation runner for DSH: isolated agent runs,… |
| 71 | `@weibaohui/skills-management` | 10398 | dsh 插件 |
| 72 | `dsh-tidy-display` | 5326 | One plugin for a calmer DeepSeek Harness: reading view + m… |
| 73 | `dsh-zai-coding-models` | 8682 | DeepSeek Harness bridge plugin: exposes the newest Zhipu/Z… |
| 74 | `dsh-auto-memory` | 5308 | Claude Code style auto-memory plugin for DeepSeek Harness:… |
| 75 | `dsh-plugin-guide` | 8631 | DSH plugin development as an on-demand agent skill: offici… |
| 76 | `@feng0531/dsh-vcs` | 10766 | Read-only Git and SVN change preview for DSH |
| 77 | `dsh-plugin-marketplace` | 12036 | Discover, install, update and uninstall plugins in the act… |
| 78 | `dsh-harmony` | 6354 | A library for patching, replacing and decorating DeepSeek … |
| 79 | `@copylee/dsh-office` | 6278 | DeepSeek Harness Office 插件（Windows）：AI 直接在你打开的 Word / Exce… |
| 80 | `@goodandready/dsh-time-machine` | 5073 | DSH plugin for smart checkpoints, workspace safety guards,… |
| 81 | `dsh-genui` | 8223 | GenUI for DeepSeek Harness: interactive charts, forms, cal… |
| 82 | `dsh-posterflow-ai` | 4997 | DSH plugin: a PosterFlow launcher in the Web sidebar — cli… |
| 83 | `dsh-mcp-panel` | 10058 | MCP management console for the official DeepSeek Harness M… |
| 84 | `@liuhange/dsh-gov-data-inspector` | 11349 | 政务办事指南巡检插件 — 检测漏项/语义/逻辑/格式错误，输出合规审计报告，516测试全通过，v3.8.1新城市白名… |
| 85 | `@fooxe/dsh-memory` | 7859 | Hierarchical Claude Code-style persistent memory for DeepS… |
| 86 | `@goodandready/dsh-lanmode` | 10205 | LAN and reverse-proxy access for the DeepSeek Harness Web … |
| 87 | `dsh-notify-say` | 5791 | Desktop notifications for DSH Desktop that actually speak:… |
| 88 | `@try-works/dsh-model-as-tool` | 5759 | Install Desert Ant Labs on-device models as DSH tools and … |
| 89 | `@huai_xin/dsh-workbuddy` | 9971 | WorkBuddy model provider for DeepSeek Harness (internation… |
| 90 | `dsh-persona-dafeiyu` | 5734 | 人设插件 for DeepSeek Harness：内置大肥鱼、阿茶与听澜，支持导入自定义人设（文件或粘贴）与单条导… |
| 91 | `dsh-muv-engine` | 7448 | DSH 原生 MUV 引擎 —— 正则脚本、状态栏级联（任意字段/行动选项）、变量追踪、LaTeX、宏展开、标签 C… |
| 92 | `@ggboy123/dsh-paper-reader` | 5730 | DeepSeek Harness 插件：论文伴读工作台 — PDF 转录 / 检索 / 原生对话伴读 + 内置阅读器页面 |
| 93 | `dsh-wsl-tool` | 5695 | Linux-native DSH, extended to WSL. Multi-step work shares … |
| 94 | `@mrrisega/dsh-remote` | 7485 | 手机远程控制 DeepSeek Harness |
| 95 | `dsh-image-viewer` | 8853 | Zoom, pan, download, gallery, and region-note image viewer… |
| 96 | `dsh-pet-live2d` | 7448 | Live2D 桌宠插件：为 DSH Web GUI 挂一只可拖动、会跟随鼠标、能换动作与表情的 Live2D 宠物 |
| 97 | `@memtensor/memos-local-plugin` | 8762 | Reflect2Evolve memory plugin: layered L1/L2/L3 memory, ref… |
| 98 | `@ponydev/dsh-model-usage` | 5589 | DSH Web 插件：实时显示模型供应商额度与用量（DeepSeek / GLM Coding Plan / Ope… |
| 99 | `@fish-under-sea/dsh-fish` | 7244 | Fish DSH 插件聚合包：十个本仓库子包与独立 AgentTeams，共十一个 @fish-under-sea … |
| 100 | `dsh-composer-ux` | 7208 | DSH Web 输入体验增强插件：可配置发送/换行键位 + 自定义输入框右键菜单 + 面板尺寸记忆 + 快捷指令（分… |


（待补：只解析目录 JSON 的名称、分类、下载量、能力与安装方式；另抽 15 份 README 看技能数量、描述长度、系统提示词与工具注册时机。）

### 插件 README 取经（前 15 名，逐份记结构性做法）

- **dsh-ops**：首段一句话定位加「目的」；顶部徽章行；安装分市场、npx、官方 CLI、手动四路并给 `--dry-run`；显式写宿主兼容范围；列组件行与已移除行，让升级者知道该删什么；文档索引分「指南／参考／变更」；许可与溯源单列（PROVENANCE）。
- **@michengai/dsh-skills-manager**：banner + 中英切换 + 徽章；Features 按能力分组、每条粗体前缀；安装分「让代理装」与「手动装」；兼容矩阵列出已测版本；配置节直接点名 `plugins.bundle.config` 槽位并逐开关写默认值与生效范围；用法表 + 支持目录表 + 边界与限制。
- **dsh-whale-widget**：顶部大图 + 一句话；「两条分支怎么选」表先解决分叉；特性按功能域分组；目录结构树逐文件注职责；安装 A–D 四路并附「给 AI 的安装说明」；FAQ 按症状组织；许可分层（代码 MIT、素材另行）。
- **dsh-pet**：安装按宿主分开写（桌面 / `dsh web`），再给「安装后你会看到什么」四步；兼容性单列（系统、无头、浏览器、多屏）；对外接口拆成 `API.md`、`openapi.yaml`、`CORDIS.md` 三份契约；项目结构树标出 `host/client/shared/standalone` 四层；末尾「反馈与发版节奏」写清报告要素与「小修不单独发版」。
- **dsh-cost-meter**：首屏一句版本与宿主下限；Feature overview 表三列「功能 / 位置 / 描述」并链到细节文档；安装节把三类 pnpm 故障各自成段（找不到 pnpm、最小发布年龄、卸载失败）；计费规则用图 + 公式；数据存储与架构树单列；末段「版本策略」声明只递增 patch。
- **@xmanrui/dsh-im**：双 logo 头图 + 中英口号；`> [!IMPORTANT]` 开头把「完整包名 + Desktop/Web 两条安装命令 + 重启 + 设置入口」一次说清；能力按渠道列成「渠道 / 接入方式 / 消息与回复」表；长解释一律外链到 `docs/`，正文只留默认行为表与命令表；贡献者名单由 all-contributors 生成。
- **dsh-plugin-wallpaper-engine**：首屏只放 hero 图、四个数字卡（版本 / 支持类型 / 吉祥物 / 子包数）和三条安装命令；用「当前源码与正式发行的区别」表先交代版本差异；功能写成「方向 / 能力」两列表；「不支持什么」（Application 壁纸）与「数据与隐私」（不注册工具、不上传壁纸、会访问哪些外部服务）各占一段；设置项按页签列表而不是长清单。
- **dsh-bili-scroll**：开头用「先看三行」讲清版本、磁盘占用与必须重启；把用户实测撞过的失败场景编号成「装不上时先看这五条」；单独一节「如果你是一个 AI 助手，正在帮用户装这个插件」给按序步骤；「红线」一节用列表写清不做的事；设置项按页签给表；末尾路线图只留两行。
- **dsh-univer-office**：banner + 一句话定位；「See it in action」用演示视频与可展开的分步截图；能力做成「内容类型 × 创建/校验/导入/导出」矩阵表；「3 分钟上手」编号步骤；工具表逐条给用途；「要求与当前限制」明说做不到的；配置表用「字段 / 默认 / 用途」三列；末尾给官方包名与仿冒清单。
- **dsh-TUI**：徽章行 + 一句话定位 + 「装即用、卸载不留补丁」的边界句；Quick Start 同时给「一键安装」与三条命令；命令表逐行给用途；文档索引按「开始 / 使用 / 配置 / 内部 / 插件 / 参与」分组；「权限与安全边界」单独成节并先写 Windows 默认全权限的警告。
- **@nanmicoder/dsh-agent-teams**：标题即口号，紧跟一句「它把当前会话变成什么」；「能力 / 改变什么」两列表先回答要不要装；版本兼容用推荐组合表而不是散落说明；安装分桌面 / CLI / Web 三条路径各给可复制命令与重启提示；「边界」单列（一次一个队长、状态文件化、并发不协调）；配置 YAML 后逐字段解释。
- **dsh-composer-ux**：先给「小白版 / 英文版 / 全版」三条读者路径；正文每个新节都以「为什么会有这一节」引出问题，再给做法；结尾专设「已验证 / 未验证」表，把没有证据的能力如实留空；把「设置写不进去 / 点了没反应」写成独立排障小节并给手工恢复命令；用大量实机截图配图注。
- **dsh-builtin-browser**：README 只做入口，正文用一句定位 + 四条「是什么」短句，细节全部指向 `docs/` 索引表；安装按桌面端与 Web 端分两段，各自给可复制命令与「不是必做项」的说明；用「更新记录」表按版本/日期/主题列动词短语，并把命名冲突与升级建议写成独立小节。
- **dsh-mnemon**：先讲痛点（每次会话从零开始），再用七个加粗要点给能力，每个要点一句话＋一个可见证据；「三类记忆」用对照表（存在哪 / 怎么到达代理）；动图演示后链到 UI 指南；「数据与信任」段逐条说清本机与第三方边界；官方插件表带默认开 / 关状态。
- **dsh-session-manager**：用编号的一级标题做事（概览 → 功能 → 入口 → 安装 → 安全 → 兼容 → 开发 → 致谢 → 许可）；功能条目以加粗动词开头并紧跟后果（「删除不可逆，所以总会确认」）；安全一节逐条写拒绝条件与回滚；兼容性用「DSH 版本 × 插件版本 × 环境」表。

