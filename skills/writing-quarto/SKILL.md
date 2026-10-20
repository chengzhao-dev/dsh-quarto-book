---
name: writing-quarto
description: 编写和修改 Quarto Book 的 .qmd 章节，覆盖中文技术写作、Book 结构、代码与图表、渲染验证；不用于改 CSS、字体或主题颜色
metadata:
  short-description: 编写中文 Quarto 图书章节
---

# Skill: writing-quarto

承载 `.qmd` 章节的写法流程与 Book 结构约定。正文只有九步：每一步只打开 `steps/` 里同号的一个文件；判不准才打开 `examples/` 里同号的案例；要排图、查渲染或全仓重构才打开 `quarto/`。不读插件包内的 `docs/`，也不读书里的旧通用副本。

## 适用场景

- 新建或修改 `content/**/*.qmd` 章节、`index.qmd` 或 `_quarto.yml`；内容与链接核对走本技能 `scripts/` 下的脚本，HTML 是否可用走 `quarto_render_check` 工具。
- **不适用**：改主题样式、颜色或字体（转 `designing-theme`）；讲解书里项目的业务领域知识（那是项目正文的职责，不是本技能）。
- 项目带有 `.agents/skills/quarto-book-project/SKILL.md` 时，读完本技能再读它，并只按它指向的 `writing/` 文件读章节对照；没有就跳过，不要凭猜测补书名、章节名和术语。书内 `context/` 下的旧通用副本不再打开，写法以本技能为准。
- 书仓库根目录的 `README.md` 只走第 5–8 步：它是仓库说明页，不是章节；不套第 1–4 步的任务与结构骨架，不写「常见错误」「自测问题」，不调 `quarto_render_check`。第 8 步发现问题只退回第 5、6、7 步。`README.en.md` 同样处理；`CHANGELOG.md`、`LICENSE`、`AGENTS.md` 不在写作范围。这条只在书仓库里适用（技能本身由 Book 门禁触发）。

## 两种走法

增量润色沿九步走，只改判为不合格的地方，其余保持原样。全章重构仍是这九步，但第 1–2 步先定删留、不动句子，第 3–4 步只拆块和段，第 5–7 步才逐句改。

两条走法共守同一组不变量，写在这里，不重复进各步：不新增原文没有的事实、数字、命令、性能结论、引文和出处；不把「可能」「通常」「在本书里」这类留有余地的说法改成确定说法；保留否定、条件、范围、时间和归属；围栏里的代码、命令、路径、URL 与 YAML 不改。增量润色只删除和换词，不扩写、不补论证；全章重构可删可换序，但不能发明事实，也不能把限定说成确定。

后一步发现前一步没做完，退回那一步重做，不跳到更后面的步骤补救。

## 九步

1. 定任务：写出读者做完能完成的那件事，再列这一章要覆盖的任务。规则在 `steps/01-task.md`。
2. 定结构：排页面骨架、二级标题和篇幅预算，只定删留和标题。规则在 `steps/02-structure.md`。
3. 排列内容块：导语、围栏、收束与 Callout 的次序，一个围栏只放正在讲的那一块。规则在 `steps/03-blocks.md`。
4. 定段落：一段一个对象，段间衔接落在话题切换处。规则在 `steps/04-paragraphs.md`。
5. 定句子：对象先行，一句一动作。规则在 `steps/05-sentences.md`。
6. 定用词：统一术语、主动语态和语气。规则在 `steps/06-wording.md`。
7. 定版式：标点、中英混排、列表和加粗。规则在 `steps/07-layout.md`。
8. 回读并退回：按现象判断属于哪一步，退回那一步改。规则在 `steps/08-reread.md`。
9. 检查与渲染：先核对内容与链接，再调 `quarto_render_check` 渲染并检查 HTML。规则在 `steps/09-check.md`。

## 完成判据

- [ ] 九步走完，每一步的产出都落在正文里。
- [ ] 内容与链接核对通过：项目技能存在时跑它列出的 `run.ps1 verify --changed`，否则跑本技能 `scripts/verifying-content.py` 与 `checking-links.py`。
- [ ] 调 `quarto_render_check`：`dry_run: true` 最多 2 次，确认 `safe_to_render`；`dry_run: false` 最多 1 次，确认 `html_report.usable` 为 true。不手跑 `quarto render`，也不截图 PNG。
