# 写作 how：润色流程与收尾

沿步骤走的润色流程、完成前核对与下沉指针。

## 润色流程：沿着步骤走

润色任务沿 `writing-spine.md` 的写作步骤执行，从定任务走到通过检查，跳步视为未完成；判定标准见`conventions/writing/chinese-quality.md`。两种走法共用 1–9：**增量润色**保持最小改动，只改判为不合格的句子，不做风格重塑；**全章重构**按 `writing-spine.md`「步骤分层」走——章级（1–2）先定删留不动句子，节级（3–4）只拆块和段，句级（5–7）逐句拆开再写回去，该层全部重组，不走最小改动。执行时遵守定段落节的既有判定：分句骨架在定句子判为不合格，不在定段落里顺手改句子。

**先切模块，再套规则。** 任何一步动笔前先把文本切成单位，围栏、YAML 与链接 URL 跳过（脚本按同一口径统计，计数见 `verifying-content.py` 输出）：

- **章**：标题到下一个 `##` 之前。只做定任务、定结构。
- **节**：`###` 到下一标题。只做主线与标题对齐。
- **自然段**：空行隔开的散文。只做一段一中心、概念负荷、块后还有没有新信息。这一步不改分句措辞。
- **句子**：段内按「。！？」切开。只做一句一中心、拉链、句内骨架、和下一句是否互相否定。
- **列表项**：`-` 或有序编号。只做一项一中心、平行、字数带。不把列表项当散文拉链改。
- **表格单元格**：管道表。一表一事；格里写事实，不写第二篇散文。
- **块**：导语、围栏、块后、Callout。围栏不是句子；块后新信息的判定见`conventions/writing/qmd-element-cases/layout-cases.md` 的知识文件。

「一次对话」不与这些单位并列成切分单位：脚本切得出标题、空行、句号、列表和表格，切不出「一次说话」。它只留在`conventions/writing/sentence-craft/sentence-frame.md`「一次对话」的判定里——定段落先问这段有几件内容，再决定删、拆或切成几次说话；定句子才改措辞。

1. **普查建账**：`git ls-files` 按扩展名分类，列出全部含中文自然语言的文件（跳过机器生成物与二进制）。台账写 `temp/`（不入库），逐文件记「审读状态／修改数／备注」；任务结束前每行落到「已审」，无问题也记「未发现」。覆盖率由 `verifying-content.py` 的「中文体检」项（`verifying-content.py`）背书：台账文件总数与脚本输出的载体组计数对不上即为漏审。
2. **沿步骤逐篇走**：从定任务到通过检查，每步只改该步判为不合格的句子；后一步发现前一步没做完，退回那一步，不在当前步补结构。某句只在定用词失败，就不重写它的结构；某段在定句子失败，先改骨架，再让定用词看一遍。已合格的句子不重润。
3. **改写**：最小改动，只改判为不合格的句子，不做风格重塑。改写不破检查：qmd 导语 token 与句数、段落篇幅、禁用词由 `verifying-content.py` 把关；中文文件保持 UTF-8 无 BOM、LF。代码围栏与源码注释同源：改源码注释前先 grep 各 qmd 围栏，被逐字引用的两侧同改；同源复制文件改一处同步其余并 diff 比对。改动触及知识库案例引用句时先 grep 案例文件再同步。
4. **验收同步**：按改动域跑校验（qmd → `verifying-content.py` + `verifying-content.py`；Python → `python` profile；知识库 → `verifying-content.py`；跨域收尾 `full`）。检查次数纪律见 `verifying-content.py` 的退出码，停手动作见 `AGENTS.md` 第 12 条，例句见 `references/zh/writing-howto/polish-process.md`。

## 完成前核对

- [ ] 信号表逐行扫过，FAIL 清零；WARN 记台账不追清。
- [ ] 章节骨架与 `chapter-writing.md` 一致；引言形态守`conventions/writing/chapter-structure/skeleton.md`。
- [ ] `verifying-content.py` 与 `verifying-content.py` 通过，证据在 `temp/`。

## 下沉指针

- 判定总纲 / 不同文件的语气 / 病类清单：`conventions/writing/chinese-quality.md`。
- 段、列表、同义、衔接、块链、句内骨架：知识 `references/zh/writing-howto/tasks-structure.md`。
- 小节密度依据：`conventions/writing/section-density/main-line.md`。
- 页面骨架 / 预算 / 标题：`conventions/writing/chapter-structure/skeleton.md`。
