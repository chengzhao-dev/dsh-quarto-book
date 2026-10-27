# 新人可读性与任务完整性

> 速查：读者能独立做完 = 前置 + 动作 + 结果 + 失败出口；术语首次出现给定义，条件写在动作前。

本文件补句子规则之外的两件事：新人能不能独立完成任务，术语有没有解释。句子、段落与版式仍归 `steps/05-sentences.md`、`steps/04-paragraphs.md` 与 `steps/07-layout.md`；本文件不重复它们的规则。

## 读者三问

每个任务节要让读者回答三个问题：我在哪里、我要做什么、做完看到什么。

- **前置**：开始前需要哪一章的结果、哪个文件、哪个环境或哪条命令。缺一项就补一句。
- **动作**：一个步骤一个动作，动词开头，对象明确。
- **结果**：命令输出、文件变化、界面变化、返回值或测试结果，至少有一项可观察。
- **失败出口**：出错时看哪条信息、回到哪一节、下一步试什么。

只写「运行脚本」而不写运行后看到什么，读者无法判断自己是否成功。

## 术语

术语的写法（首次「中文（English）」、一句可观察解释、缩写先全称、后文统一）以 `quarto/prose.md`「引号与术语」为准。本节只管解释放在哪里：

- 解释放在首次真正使用的位置，不放章首清单，也不留给下一章补课。
- 能换成日常词就不造术语；不为「显得专业」引入新词。
- 判定句：把术语换成「这个东西」，句子是否仍然成立？不成立说明解释不够。

## 步骤完整

- 动作之后紧跟结果或验收方式，结果不要等到节末才出现。
- 失败路径写触发条件、可观察现象与恢复动作，不写空泛的「注意报错」。
- 操作节不插入与当前动作无关的设计辩论；取舍另起一段放在动作完成后。
- 条件与动作的先后见 `quarto/prose.md`「条件与步骤」。

## 完整性清单

- [ ] 读者知道开始前需要什么：环境、文件、上一章产物。
- [ ] 每个任务有可观察的完成标志，不只写「运行一下」。
- [ ] 新术语首用有解释，缩写有全称。
- [ ] 条件在动作前，一句只做一个动作。
- [ ] 失败时知道看什么、回到哪一节。
- [ ] 没有「以后会讲」但当前就必须使用的名字。
- [ ] 删掉本段后读者仍能完成任务的内容已经删除。
- [ ] 读者不需要作者的补充说明，就能把这一节独立走完。

## 混排自查

`python <skill>/scripts/checking-prose.py --root <book>` 检查中文与拉丁字母、数字、行内代码之间的空格，以及中文句里的半角标点。脚本只报高置信项，不替代人工回读。环境里只有 `python3` 时，把命令里的 `python` 换成 `python3`。

## 依据

- Google developer documentation style guide：https://developers.google.com/style/highlights
- Google Jargon：https://developers.google.com/style/jargon
- Google sentence structure（条件先于指令）：https://developers.google.com/style/sentence-structure
- Diátaxis 质量模型：https://diataxis.fr/quality/
- Digital.gov Plain language：https://digital.gov/guides/plain-language/principles
- 中文技术文档写作风格指南：https://zh-style-guide.readthedocs.io/
