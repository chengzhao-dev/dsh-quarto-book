---
name: writing-quarto
description: 编写和修改 Quarto Book 的 .qmd 章节，覆盖中文技术写作、Book 结构、代码与图表、渲染验证；不用于改 CSS、字体或主题颜色
metadata:
  short-description: 编写中文 Quarto 图书章节
---

# Skill: writing-quarto

承载 `.qmd` 章节的写法流程与 Book 结构约定。三层材料各守其位：`references/` 放通用 how（先读），`conventions/` 放可执行的硬规则，`knowledge/` 放正反例与依据。后两层按 `kb_id` 用 `conventions/INDEX.md`、`knowledge/INDEX.md` 定点取用，不把正文复制进本文件。

## 适用场景

- 新建或修改 `content/**/*.qmd` 章节、`index.qmd` 或 `_quarto.yml`；渲染验证与产物契约走本技能 `scripts/` 下的脚本。
- **不适用**：改主题样式、颜色或字体（转 `designing-theme`）；讲解书里项目的业务领域知识（那是项目正文的职责，不是本技能）。
- 如果项目带有 `.agents/skills/quarto-book-project`，读完本技能后再读它；没有就跳过，不要凭猜测补项目约定。

## 任务路由

| 任务 | 读取 |
| --- | --- |
| 写作次序（任何写作任务先读） | `references/zh/writing-spine.md` |
| 中文写作最高优先规则（句长、术语、降噪、删改）、信号表与润色五步 | `references/zh/writing-howto/tasks-structure.md` |
| 章节骨架、页面类型与收尾 | `references/zh/chapter-writing.md`、`conventions/writing/chapter-structure/skeleton.md` |
| 任务节的分节与次序 | `conventions/writing/chapter-structure/task-sections.md` |
| 标题分层、标题字数与纵向承诺链 | `conventions/writing/heading-fit/hierarchy.md`、`conventions/writing/heading-fit/commitments.md` |
| 段落拆分、凑字数禁令、段内同义堆叠、衔接与语气 | `conventions/writing/paragraph-shape/rules.md`、`conventions/writing/paragraph-shape/semantic-split.md`、`conventions/writing/chinese-voice-register.md` |
| 句序与句子形态（对象先行、分句骨架、句长） | `conventions/writing/sentence-craft/sentence-frame.md`、`conventions/writing/sentence-craft/sentence-limits.md`、`conventions/writing/chinese-quality.md` |
| 整篇布局与篇幅预算 | `conventions/writing/size-budget.md`、`conventions/writing/list-craft.md`；执行流程见 `references/zh/writing-howto/polish-process.md` |
| 小节主线、密度与 Callout 下沉 | `conventions/writing/section-density/main-line.md`、`conventions/writing/section-density/callout-boxes.md` |
| 小节衔接、段落过渡与块链 | `conventions/writing/section-flow/transition.md`、`conventions/writing/section-flow/block-chain.md` |
| 元素写法（片段 filename、Callout、链接、代码块门槛、摘录留白） | `references/quarto/authoring.md`；细则见 `conventions/writing/qmd-element-cases/code-cases.md`、`layout-cases.md`、`block-loop.md` |
| 代码旁白的范围（工程叙事，不讲语言课） | `conventions/writing/prose-theme.md`、`references/zh/chapter-writing.md`「叙事范围」 |
| Quarto 结构、front matter、标题约定与渲染取值 | `references/quarto/basics.md`、`references/quarto/rendering-and-output.md`、`conventions/rendering/quarto-conventions.md` |
| 命令、输出与常见错误三步流 | `references/quarto/terminal-validation.md` |
| Mermaid 图表 | `conventions/rendering/mermaid-conventions.md` |
| 坐标轴类网格图 | `conventions/rendering/coords-diagram.md`、`scripts/diagrams/rendering-coords.py` |
| 查正反例、改写句段 | `knowledge/cases/chinese-style/wording-cases.md`（核心）；按目录取用其余案例，低频章级对照在 `knowledge/cases/appendix/` |
| 全仓 QMD 重构范围与收尾 | `references/quarto/repository-wide-refactor.md` |
| 内容规范核对与增量校验 | `scripts/verifying-content.py`（见「完成判据」）；自测答案折叠由 `scripts/answering-disclosure.lua` 提供（`_quarto.yml` 顶层 `filters:` 注册） |

## P0 硬约束

1. 根目录 `_quarto.yml` 是 Book 章节顺序的唯一来源。
2. `README.md` 只做项目入口，完整设计和演示放 Quarto。
3. 页面标题由 YAML `title:` 提供，正文从 `##` 开始，最多到 `###`。
4. 含代码块、列表或表格的小节按最小模块组织，次序见 `conventions/writing/qmd-element-cases/code-cases.md`「三级标题最小模块」。一段只推进一个对象，对象切换必须新起段并用一句关系衔接；代码围栏内 `//` / `#` 注释已写明的意图，块后正文不得同义复述，只写注释没覆盖的新工程信息（谁调用、如何验证、与邻块或图的关系），且新信息的主语仍是本节标题的对象，换成另一对象即删除或下沉。同一小节的连续同源围栏先看是否是紧邻常量与其直接使用行：只有常量紧接着被下一行使用时才放在同一个围栏；类型定义和后一步使用它的函数是两步，即使函数用到该类型也分成两块，一个围栏只放正在讲的那一个声明或函数。细则见 `conventions/writing/qmd-element-cases/code-cases.md`，改写对照见 `knowledge/cases/chinese-style/block-after.md`、`excerpt-lead.md`。
5. 展示项目源码时默认内联摘录关键片段：逐字摘录，省略处直接省略不写标记行，每处注释不超过 2 行；include 仅限完整展示的短文件且必须包在带语言标注的围栏代码块内。源码目录名由项目决定，不要把某一项目的目录当作默认值。
6. 复杂关系才使用 Mermaid；默认图是 `{mermaid}` flowchart（流程、分层、调用链），一律使用 `{mermaid}` 属性围栏，plain ```` ```mermaid ```` 围栏不会渲染。坐标轴类网格图仅当用户明确指定时走 `scripts/diagrams/rendering-coords.py` 加 `{python}` 可执行单元；禁止用 Mermaid 硬画网格。
7. 修改 QMD 或 Quarto 配置后在仓库根目录运行 `quarto render`（在其他目录执行会静默不渲染）。
8. 同段不堆砌流程名词；对照表用关系句承接；相邻段落不得各成独立说明书；章引言与节引言不用顿号串交付物（目录式堆砌禁令见 `references/zh/writing-howto/tasks-structure.md`）。任务节按「类型 → 简单函数 → 更难的函数」排列，最难的组装放最后，并满足先定义后调用：读者要跟着读懂的标识符，其行为必须已经出现过，未定义名字的调用链整段删除。标题与正文的层级对应、导语点句规则见 `conventions/writing/heading-fit/commitments.md`；骨架、自测与收尾见 `conventions/writing/chapter-structure/skeleton.md`。标题与正文不得用读者尚未建立的概念术语充当标题或论据，术语未建立就删除或下沉到后续章节；一句话压缩多个论断而读者无法逐条核对的，拆成可核对表述或删除。代码块与 `{mermaid}`/`{python}` 图之间必须有桥接正文（固定序列见 `references/quarto/authoring.md`「代码与图的桥接」）；图遵守一图一事、同主题相邻、不承载正文未写的新信息，主题错位拆 `###`。读者正文写可观察对象与完整主谓句，禁用压缩隐喻与电报省略（禁用词以 `scripts/verifying-content.py` 词表为准）。
9. `content/**` 正文禁止语言课：不讲解编程语言机制或风格指南条目，旁白只谈工程（公共定义、调用方、验证）。跨仓外链默认零条，禁止「写法依据见」等突兀句；确有系统阅读需求时，只可在小节末单独成句尾置「若要系统阅读…」。同一硬边界下禁止课堂类比：工程对象只写程序事实与可观察行为，不写跨学科课堂对照。头文件、模块或包指称要点名具体对象（文件名、路径、调用方），禁用省略缩略。节导语与 `>` 引用块的 token 与句数限额见 `conventions/writing/chapter-structure/skeleton.md`，由 `scripts/verifying-content.py` 自动执行。
10. 大规模正文重构先取全量相关文件：`scope` 命中范围 → 本 SKILL → 其路由指向的全部参考与约定文件、校验脚本读完再动笔，禁止只按任务清单的增量条目改写。
11. 全仓 QMD 重构按 `references/quarto/repository-wide-refactor.md` 枚举源文件、排除生成物，并在收尾时执行全量内容验证和渲染。

## 完成判据

- [ ] 在当前书根运行 `python <skill>/scripts/verifying-content.py --help`，按它列出的模式执行内容核对；改了渲染语义再运行 `quarto render`。
- [ ] 章节骨架与 `references/zh/chapter-writing.md`、`conventions/writing/chapter-structure/skeleton.md` 一致。
- [ ] qmd 验证只跑 `scripts/verifying-content.py` 与 `quarto render`，不截图 PNG、不做视觉评审。
