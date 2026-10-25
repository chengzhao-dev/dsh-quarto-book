---
name: designing-theme
description: 维护 Quarto Book 阅读主题：颜色、字体、字号、行距、表格与 Callout 样式、导航；不用于章节正文
metadata:
  short-description: 维护 Quarto 图书主题
---

# Skill: designing-theme

维护本技能自带的 Quarto Book 主题资产，入口是 `assets/theme/`。这套主题属于本插件，不与其他仓库共享同一套文件；项目若另有权威副本，以项目 `_quarto.yml` 实际引用的路径为准。

## 适用场景

- 调整颜色、字体、间距、导航、Callout 或落地页样式。
- 新增 palette 或页面组件样式。
- **不适用**：`.qmd` 正文写法（转 `writing-quarto`）；书里项目的业务领域内容（由项目自己的技能负责）。
- 项目带有 `.agents/skills/quarto-book-project/SKILL.md` 时，先读它的「主题与过滤器路径」，只改 `_quarto.yml` 实际引用的书内副本；没有就跳过。书内副本默认在 `theme/`，过滤器在 `filters/`。
- 编码与行尾跟 `writing-quarto` 的 `quarto/encoding.md`：UTF-8 无 BOM、样式文件用 LF；`.bat`/`.cmd` 才用 CRLF。

## 任务路由

任何主题任务先读 `references/theme-spine.md`（步骤唯一入口），再按其中每一步登记的文件与 `##` 行进。

| 任务 | 读取 |
| --- | --- |
| 主题的分层、令牌与组件边界 | `references/theme-system.md` |
| 色板接线与暗色分层 | `assets/theme/palettes/flexoki/meta.md` |
| 结构尺度令牌 | `assets/theme/css/tokens.css` 头注释 |
| 字体、栏宽与阅读表面的取舍理由 | `knowledge/reading-surface.md` |

## P0 硬约束

1. 主题资产被书根 `_quarto.yml` 以相对路径直接消费；移动或改名必须同步 `_quarto.yml`。
2. `css/` 组件规则不写色值，语义颜色只来自 `palettes/<name>/tokens.css`（默认 Flexoki；Solarized 为运行时覆盖层）；`css/tokens.css` 只放结构尺度令牌，明暗共用。
3. 这套资产是本插件主题的唯一来源。项目内若存在副本，先确认哪一份被 `_quarto.yml` 引用，再只改被引用的那一份，不假定两处自动同步。
4. 修改主题或 `_quarto.yml` 后在仓库根目录整本 `quarto render`，验证明暗两套主题；布局调整优先修改 grid 与共享节奏，不用页面局部样式堆叠间距。
5. 不新增字体文件、不引入新颜色来源：字体与颜色决定的理由在 `knowledge/reading-surface.md`，改决定先改知识再动资产。

## 完成判据

- [ ] `quarto render` 通过，明暗主题下页面无错位或对比度问题；`scripts/checking-layout.py` 通过。
- [ ] 代码块 filename 标题在长路径输入下不撑破容器，窄屏仍可读；超长代码在块内横向滚动，不出整页横向滚动条。
- [ ] 若项目内有主题副本，已在交付说明中写清改动是否同步，以及以哪一份为准。
- [ ] 收尾调用一次 `quarto_pass_report`：`skill` 填 `designing-theme`，`mode` 填 `theme`，`steps` 用主题步骤表的名字（`定表面`、`定字体`、`定尺度`、`定颜色`、`定组件`、`通过检查`），检查结论照实填。卡片就是回执，回复里不再复述。
