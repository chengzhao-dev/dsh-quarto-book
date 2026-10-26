# 主题步骤：唯一入口

开篇约束见本技能 `SKILL.md` 的 P0 硬约束。

## 主题步骤

增量任务只走被改组件所在的那一步，再加第 6 步通过检查；从定表面到通过检查依次走完只用于新主题或用户明确要求整体调整。后一步发现前一步没做完，退回那一步一次；同一文件第二次仍失败就停在检查输出上。每一步只打开登记的那一个文件和那一个 `##`。

| 步骤 | 动作与产出 | 登记的文件与一节 |
| --- | --- | --- |
| 1 定表面 | 这次动的是正文、代码、Callout 还是导航；只判定，还不动 CSS | 本文件的步骤表 |
| 2 定字体 | 正文中文保持霞鹜楷体路线；标题/导航书名用 `--heading-font` 系统黑体栈（正文内的 `strong` 仍合成加粗）；西文和代码按已有决定，产出字体栈改动 | `references/theme-system.md`「字体栈与字形来源（定字体）」+ `assets/theme/css/fonts.css` |
| 3 定尺度 | 字号台阶、行长与栏宽；视口不够时不改字号，只让代码块横向滚动 | `references/theme-system.md`「字号、行长与页面尺度（定尺度）」+ `assets/theme/css/tokens.css` |
| 4 定颜色 | 正文、强调、链接、次要文字、代码标题在 `body` 与 `body.quarto-dark` 各写一套；Solarized 覆盖层写 `html[data-palette="solarized"]`，山光覆盖层写 `html[data-palette="hill-light"][data-mode="…"] body`；代码语法色默认改 `palettes/flexoki/highlight-light.theme` / `highlight-dark.theme` 两份主题文件，Solarized 与山光的语法色写各自 `palettes/<name>/syntax.css`；切换后核对加粗、链接、链接里的加粗、列表小标题和代码文件名没有串色 | `references/theme-system.md`「令牌与色板（定颜色）」+ `assets/theme/palettes/flexoki/tokens.css` + `assets/theme/palettes/flexoki/highlight-*.theme` + `assets/theme/palettes/solarized/syntax.css` |
| 5 定组件 | 只打开要改的那一个 `assets/theme/css/*.css`；导航字重、答案折叠、行内代码、复制按钮、打印换行属于这一步，不在定颜色里顺手改 | `references/theme-system.md`「组件约定（定组件）」对应条目 |
| 6 通过检查 | `scripts/checking-layout.py`，然后整本 `render`；只检查，不在这一步发明新的字号或颜色 | `scripts/checking-layout.py`；检查项回到本步骤表与 `theme-system.md`「组件约定」 |

## 增量链（改规则）

1. 在 `references/theme-system.md` 找到对应 `##`，只改那一节；没有对应节才考虑新增。
2. 新规则必须先标明属于哪一步：能放进已有 `##` 就放进去；只有尺度真的变了才允许新开一步。禁止再写一条不标明步骤的禁令。
3. 字体、栏宽、颜色决定的理由写进 `knowledge/reading-surface.md`，不在 reference 里重复论证。
4. 同步更新本文件、`SKILL.md`、`theme-system.md`、知识文件与检查脚本。
5. 改完运行 `scripts/checking-layout.py`，再用 `quarto_render_check` 做整本渲染；两者都通过才算完成。
