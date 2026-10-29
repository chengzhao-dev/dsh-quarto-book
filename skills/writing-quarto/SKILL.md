---
name: writing-quarto
description: 写、改、检查与润色 Quarto Book 章节正文时使用；不用于改主题样式与只改 .cpp。
metadata:
  short-description: 润色中文 Quarto 图书章节
---

# Skill: writing-quarto

承载 `.qmd` 写法与 Book 结构约定。正文九步：增量任务只开对应一步，全章重构走九步，只读审查只报告不改文件。判不准才开步骤点名的 `examples/` 案例，排图与查渲染开 `quarto/`；插件开发资料不属读者正文。

## 适用场景

- 新建或修改 `content/**/*.qmd` 章节、`index.qmd` 或 `_quarto.yml`；内容与链接核对走本技能 `scripts/` 下的脚本，HTML 是否可用走 `quarto_render_check` 工具。
- **不适用**：改主题样式、颜色或字体（转 `designing-theme`）；讲解书里项目的业务领域知识（那是项目正文的职责，不是本技能）。
- 项目带有 `.agents/skills/quarto-book-project/SKILL.md` 时，读完本技能再读它，并只按它指向的 `writing/` 文件读章节对照；没有就跳过，不要猜书名、章节名和术语。书内 `context/` 旧副本不再打开，写法以本技能为准。
- 书仓库根目录的 `README.md` 只走第 5–8 步：它是仓库说明页，不是章节；不套第 1–4 步的任务与结构骨架，不写「常见错误」「自测问题」，不调 `quarto_render_check`。第 8 步发现问题只退回第 5、6、7 步。`README.en.md` 同样处理；`CHANGELOG.md`、`LICENSE`、`AGENTS.md` 不在写作范围。这条只在书仓库里适用。

## 加载与结束

- 一次激活只做一类文件：章节或主题。写章节时只打开项目技能或 `_quarto.yml` 点名的章节；围栏注释与源文件不一致时回源改围栏，不读无关实现。句子与条文、项目技能或既有正文冲突时，先列冲突位置、原句与出处，由用户选一条；不自行取舍，也不默认采用计划。
- 项目提供作用域命令就先跑它，只读它列出的文件；渲染产物、构建目录与 Quarto 缓存不读。
- 增量任务只开本文件、当前一步与这一步点名的一个文件；第 8 步可点名 `references/personas.md` 与 `examples/08-appendix.md` 两个，其余步骤仍只一个；同轮不把同号案例、其余步骤和条文一起打开。
- 同一文件最多退回上一步一次；第二次仍失败就停在检查输出上，不重走整段。
- 项目技能列出检查命令时只跑那一条；没有就跑本技能 `scripts/` 下的内容与链接检查。退出码为 0 就在同一轮结束 goal。
- 不探测同 profile 的其他插件，也不把它们写成依赖；子会话按自己的 cwd 重新判定门禁，不把技能正文塞进子代理提示。

## 整书走法

改多章或排目录时，先读 `references/book-journey.md`：先定全书主线与章节次序，再逐章走九步，最后做全书一致性回读。

单章与整书共用同一套九步，不另造一套章节规则；项目有章节表时以项目表为准。技能文件体量受 `references/token-budget.md` 约束，新增整书规则只写进 `book-journey.md`。

## 三种走法

增量任务只走对应步骤，只改不合格处。全章重构走九步：第 1–2 步定删留，第 3–4 步拆块段，第 5–7 步逐句改。只读审查不改文件，按九步逐条报告行号、规则出处与改法。

三种走法共守：不新增原文没有的事实、数字、命令、性能结论、引文和出处；不把「可能」「通常」「在本书里」改成确定说法；保留否定、条件、范围、时间和归属；围栏里的代码、命令、路径、URL 与 YAML 不改。增量润色只删除和换词；全章重构可删可换序，但不能发明事实。

## 九步

九步按四个写作域分：写作 1–2，布局 3–4 与 7，润色 5–6 与 8，排版归主题技能；第 9 步是检查与渲染。跨域改动按「写作 → 布局 → 润色」的顺序推进，前一步落定再进下一步。

1. 定任务：写出读者做完能完成的那件事，再列这一章要覆盖的任务。规则在 `steps/01-task.md`。
2. 定结构：排页面骨架、二级标题和篇幅预算，只定删留、标题与章题对齐。规则在 `steps/02-structure.md`。
3. 排列内容块：导语、围栏、收束与 Callout 的次序，一个围栏只放正在讲的那一块。规则在 `steps/03-blocks.md`，表格写法见 `quarto/tables.md`；围栏给声明还是给定义，按 `references/fence-semantics.md` 判。
   图注写在图下、图前只写引出关系；三类图的统一写法见 `quarto/figures.md`。
4. 定段落：一段一个关键，下一句接住上一句的新信息；段间衔接落在话题切换处。规则在 `steps/04-paragraphs.md`。
5. 定句子：主语选执行者，对象先行，一句一动作。规则在 `steps/05-sentences.md`。
6. 定用词：统一术语、主动语态和语气。规则在 `steps/06-wording.md`。
7. 定版式：标点、中英混排、列表和加粗。规则在 `steps/07-layout.md`。
8. 回读并退回：按现象判断属于哪一步，先按 `references/priority.md` 判冲突，再退回那一步改。规则在 `steps/08-reread.md`。
9. 检查与渲染：先核对内容与链接，再调 `quarto_render_check` 渲染并检查 HTML。规则在 `steps/09-check.md`。

## 规则卡

改句子、改块、改标题时，按需打开 `references/rules-cards.md` 的一张卡（C01–C30）查正例与反例，不整份读。卡是结论的紧凑副本，步骤文件仍是权威；两者冲突时以步骤为准。

## 完成判据

- [ ] 本轮点名的文件走完它对应的步骤，改动落在正文里；不要求九步全走。
- [ ] 本轮检查命令退出码为 0；通过后按「加载与结束」在同一轮结束 goal。
- [ ] 内容与链接核对通过：项目技能列了检查命令时按它执行，否则跑本技能 `scripts/verifying-content.py` 与 `checking-links.py`。
- [ ] 新人能按正文独立完成任务：前置、动作、结果与失败出口齐全，术语首用有解释；清单见 `quarto/readability.md`。
- [ ] 混排自查通过：`scripts/checking-prose.py --root <book>` 无高置信问题。
- [ ] 调 `quarto_render_check`：`dry_run: true` 最多 2 次，确认 `safe_to_render`；`dry_run: false` 最多 1 次，确认 `html_report.usable` 为 true。不手跑 `quarto render`，也不截图 PNG。
- [ ] 收尾调用一次 `quarto_pass_report`：`skill` 填 `writing-quarto`，`mode` 填 `polish` 或 `rewrite`，文件与步骤的改动次数、未改项、检查结论照实填。卡片就是回执，回复里不再复述；没改也传 0，当前文件不是章节时传 `executed: false`。
- [ ] 只读审查：不改文件，不调 `quarto_render_check`、`quarto_pass_report`，报告写清行号、规则出处与改法。
