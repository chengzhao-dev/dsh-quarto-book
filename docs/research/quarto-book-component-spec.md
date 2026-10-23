# Quarto Book HTML 组件规格清单（中文技术书 / C++ 教程）

> 调研日期 2026-10-22。口径：**官方默认**（Quarto / 各框架源码实测）、**社区高质量**（可复用的做法与数值）、**不推荐**（书籍场景下的取舍）。
> 颜色一律写语义令牌（`--callout-note-border`、`--body-secondary`、`--accent` 等），不写死色值。
> 单位约定：本项目 `html` 未改根字号 → **1rem = 16px**；正文 `1.0625rem = 17px`，`line-height: 1.85`，内容列 `840px`。凡"随正文字号缩放"的尺寸用 `em`，凡"版式骨架"用 `rem`/`px`。

---

## 0. 证据基线（实测值，后文引用）

| 来源 | 关键数值 | 出处 |
|---|---|---|
| Quarto callout | 左条 `5px`；`margin: 1.25rem 0`；body `0.9em`；header 底 = `callout-color-mix(0.1)`；radius 默认 0（`$border-radius`） | [_bootstrap-rules.scss](https://github.com/quarto-dev/quarto-cli/blob/main/src/resources/formats/html/bootstrap/_bootstrap-rules.scss)、[callouts 文档](https://quarto.org/docs/authoring/callouts.html) |
| Quarto 表格 | 表格上下 `1px` 浅色线；`thead` 底 `1px` 深色线；无竖线 | 同上 SCSS `.table` 区块 |
| Quarto 图注 | `figcaption`/`.figure-caption` `font-size: 0.9rem` + `body-secondary` 色（16px 根字号下 ≈ **14.4px**） | 同上 |
| Quarto 代码块 | `font-size: $small-font-size` = **0.875em**；`code-overflow` 默认 `scroll`（`white-space: pre`） | [HTML Code Blocks](https://quarto.org/docs/output-formats/html-code.html) |
| Quarto 引用块 | `font-size: inherit`；`padding-left: 1rem`；`padding-right: 1.5rem`；次级色 | SCSS `.blockquote` |
| Quarto 右 TOC | `font-size: 0.875rem`；工具条 `0.8rem`；每级缩进 `1.2em`；激活态仅 `border-left: 1px` + 链接色 | SCSS `.sidebar nav[role="doc-toc"]` |
| Quarto 侧栏 | `$grid-sidebar-width: 250px`；`.column-margin` 0.825rem | SCSS |
| mdBook | 段落 `line-height: 1.45em`；`blockquote{margin:20px 0;padding:0 20px;background:quote-bg;border-block:.1em}`；表格 `td padding 3px 20px`+`1px` 竖线+斑马纹；打印 `pre{white-space:pre-wrap}` | [mdBook guide 实测 CSS](https://rust-lang.github.io/mdBook/) |
| MkDocs Material | `.admonition` `padding: 0 12px`、`font-size: 12.8px`、`radius 4px`；标题 `padding-block 8px`、`padding-inline 40px 12px`、左条 `4px`、图标 20px | [_admonition.scss](https://github.com/squidfunk/mkdocs-material/blob/master/src/templates/assets/stylesheets/main/extensions/markdown/_admonition.scss) |
| Starlight aside | `padding: 1rem`；`border-inline-start: .25rem`(4px)；底 `--sl-color-*-low`；标题 600 + 图标 `1.333em`；标题→正文 `0.5rem` | [asides 文档](https://starlight.astro.build/components/asides/) |
| GitHub alert | `padding: 8px 16px`；`border-left: .25em`(4px)；标题 `font-weight: 500`；**无底色、无圆角** | [alerts 语法](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#alerts)、[github-markdown-css](https://github.com/sindresorhus/github-markdown-css) |
| Tailwind Typography prose | `max-width: 65ch`；段落上下 `1.25em`(20/16)；基准 `16px` | [styles.js](https://github.com/tailwindlabs/tailwindcss-typography/blob/main/src/styles.js) |
| W3C clreq | 中文段首缩进 `2em`；**正文段落之间不加额外间距**（加空行表示节结束）；两端对齐靠行内调距 | [§6.2.1.1](https://www.w3.org/TR/clreq/#h_justification)、[§6.4](https://www.w3.org/TR/clreq/#h_baselines) |
| WCAG | 行宽建议 ≤ 80 拉丁字符；行距 ≥ 1.5 倍字号（1.4.8） | [Visual Presentation](https://www.w3.org/WAI/WCAG22/Understanding/visual-presentation.html) |

**本项目现状（照此对齐）**：callout 左条 `2px`、无底、radius 0、`padding: .1rem 0 .1rem 1.1rem`、标题 `.8125rem`；代码 `15px/1.7`、radius 4px；`--radius-sm: 3px`。下文凡"现状"均指这些值。

---

## 1. 排版基线

### 结构
`html > body`；`#quarto-document-content` 下 `section.level2 > h2`、`p`、`a`、`strong`、`em`、`code`、`.math`。

### 推荐数值

| 项 | 值 | 判定 |
|---|---|---|
| 正文 | `1.0625rem`(17px) / `line-height: 1.85` / `letter-spacing: normal` | 社区高质量（现状） |
| 段距 | `margin-bottom: 1.4rem`（换段档），首段与标题粘连 | 社区高质量 |
| 行宽 | 内容列 `840px` ≈ 40 汉字/行；不超 WCAG 80 拉丁字符 | 官方默认量级 + WCAG |
| h1（章标题） | `2rem/1.25`，`margin-top: 0`，`margin-bottom: .5rem` | 社区高质量 |
| h2 | `1.5rem/1.35`，前 `3.25rem`，后 `.5rem` | 社区高质量（现状四档间距） |
| h3 | `1.1875rem/1.4`，前 `2.25rem`，后 `.5rem` | 同上 |
| h4 | `1rem/600`，前 `1.4rem`，后 `.4rem` | 同上 |
| 链接 | `color: var(--accent)`；`text-decoration-line: underline`；`text-decoration-thickness: .06em`；`text-underline-offset: .18em`；`text-decoration-color: color-mix(in srgb, var(--accent) 40%, transparent)` | 社区高质量 |
| 链接 hover | 只把 `text-decoration-color` 提到 100%，**不改颜色** | 社区高质量 |
| `strong` | `font-weight: 600`（单一字面下允许合成，但仅限短词） | 社区高质量 |
| `em`（中文） | `font-style: normal` + `text-emphasis: dot; text-emphasis-position: under right`（着重号），拉丁文保持斜体 | 官方默认（clreq §5.3.1 着重号）+ 增强 |
| 行内代码 | `.92em`（≈15.6px）、`padding: .1em .3em`、`radius: 3px`、`background: var(--code-inline-bg)`、无边框 | 社区高质量 |
| 数学 | 行内 `.math.inline` 继承 1em；块级 `margin: 1.4rem 0`、`overflow-x: auto` | 社区高质量 |
| 锚点 | `.header-anchor` `opacity: 0` → `1` on `h:hover`；`font-size: .7em`；`color: var(--body-secondary)`；`margin-left: .35em` | 社区高质量 |
| 选区 | `::selection{ background: color-mix(in srgb, var(--accent) 22%, transparent); color: inherit }` | 社区高质量 |

### 要点
1. **行高 1.85 是中文长文的选择，不是抄拉丁**：mdBook 的 `1.45em`、Tailwind prose 的 `1.75` 面向拉丁（有升部/降部撑开行距），汉字无这两处留白，同倍率下更"挤"，WCAG 的下限是 1.5（[1.4.8](https://www.w3.org/WAI/WCAG22/Understanding/visual-presentation.html)），本项目取 1.85。
2. **链接必须带下划线**：仅靠颜色区分链接违反 WCAG 1.4.1（[Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)）；发丝下划线（`.06em` + 40% 透明）比整色下划线更贴书页气质。
3. **中文不用斜体**：`<em>` 在 CJK 上落到合成倾斜，字形扭曲且 clreq 的强调手段是着重号（[§5.3.1](https://www.w3.org/TR/clreq/#h_emphasis)）；`text-emphasis` 是它的 CSS 对应物。
4. **标题间距小于段距+空行**是书页做法：标题后 `.5rem` 让标题"咬住"首段；Quarto 默认靠 margin 塌陷也能做到，但显式写死更可控。

### 常见错误
- 给正文加 `letter-spacing`（CJK 已经等宽，加字距只会让标点漂移）。
- 用 `rem` 写"随正文缩放"的字号：根字号 16px 而正文 17px，`0.9rem` 只有 14.4px（Quarto 图注正是这个坑，见 §3）。
- 链接 hover 改成另一种颜色：阅读时色相跳变，且与正文强调色冲突。

---

## 2. Callout（note / tip / warning / important / caution）

### 结构（Quarto 1.x 实测 DOM）
```html
<div class="callout callout-style-default callout-note callout-titled" role="note">
  <div class="callout-header d-flex align-content-center">
    <div class="callout-icon-container"><i class="callout-icon"></i></div>
    <div class="callout-title-container flex-fill">标题</div>
    <div class="callout-btn-toggle d-inline-block"><i class="callout-toggle"></i></div>
  </div>
  <div class="callout-body-container callout-body"><p>正文</p></div>
</div>
```
- 无标题 → `.callout-style-simple`（无 header，Quarto 保留左侧图标列）。
- 可折叠 → 同上 DOM + `collapse="true"`，Quarto 的 JS 切换 `.collapse`；`appearance` 可改 `.callout-style-default`/`simple`。
- 无图标 → `icon="false"`（类名不变，隐藏 `.callout-icon-container`）。
- 计名变体：`callout-appearance: default|simple|minimal`。

### 推荐数值

| 项 | 官方默认 | 社区高质量 | 本书取值 | 依据 |
|---|---|---|---|---|
| 左色条 | `5px` | Starlight `4px`(`.25rem`)、MkDocs `4px`、GitHub `4px`、mdBook `.warning` `2px` | **`3px`**（现状 2px 可选保留） | 840px 栏 + 17px 字下，4px 偏重、2px 偏弱 |
| 底色 | accent 10% 混底 | Starlight `--sl-color-*-low` | **`color-mix(in srgb, var(--callout-x-border) 5%, var(--page-bg))`**；或 0（纯发丝） | 5% 只做"有底"的暗示 |
| 圆角 | `$border-radius`（默认 0） | Starlight `.5rem`、MkDocs `4px` | `0 var(--radius-sm) var(--radius-sm) 0`（仅右角） | 左侧与色条对齐成直角 |
| 内边距 | `1.25rem 0 1.25rem 1.4rem` | Starlight `1rem`、MkDocs `0 12px` + 标题 `8px/40px/12px` | `padding-block: .7rem .8rem; padding-inline: 1.1rem 1rem` | 中文行高 1.75 下上下略收 |
| 标题 | `.9em` 600 + accent 色 | MkDocs 标题 `font-size: 12.8px`（≈.8em）；Starlight h5 + 600 | `1rem/600`，`margin: 0 0 .35rem` | 中文标题不能缩到 14px 以下 |
| 正文 | `.9em`，`margin-bottom: .9375em` | — | `1rem/1.75`，首末子元素边界归零 | 与正文同字号，块内不需二次缩小 |
| 图标 | `1em` 见方，`margin-right: .9em`，颜色=accent | Starlight `1.333em`；MkDocs 20px | `.95em`，`margin-right: .5rem`，`color: var(--callout-x-border)` | — |
| 嵌套 | 内层 `margin-top: 0`，左条降到 `2px` | — | 内层左条 `2px`、内边距 `0 0 0 .9rem` | 两级同粗细会糊成一片 |
| 折叠 | JS + `.collapse` | 原生 `<details>`（更省 JS） | 保留 Quarto 按钮；`summary` 语义见要点 4 | — |
| 宽度 | 撑满正文列；`.column-margin .callout` 允许 | mkdocs 同 | `max-width: 100%`；margin 区字号 `.825rem` | — |

### 要点
1. **五型靠"色相 + 标题文字 + 图标"三重编码，不只靠色相**：GitHub alert 的标题文字（Note/Tip/Warning）本身就是冗余编码，色盲用户仍可区分（[alerts 文档](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#alerts)，WCAG 1.4.1）。本书五型标题必须写中文词（注意/提示/警告/重要/小心），不能只改颜色。
2. **左条 4px 是"文档站"尺度，书籍取 3px**：Starlight/GitHub/MkDocs 的 4px 服务于 16px 无衬线正文与卡片化布局；本书正文 17px、栏 840px、通篇 1px 发丝线，4px 会变成视觉主角（对比 Quarto 官方 `5px`）。
3. **不加阴影、不加整圈边框**：GitHub alert 完全无底无边只有左条（`padding: 8px 16px`），是最"书"的一种；Quarto 的 10% 混底在深色主题下会发灰，5% 或 0 更稳（[Quarto 文档](https://quarto.org/docs/authoring/callouts.html)、[Starlight](https://starlight.astro.build/components/asides/)）。
4. **折叠用原生 `<details>` 更省**：Quarto 的折叠依赖 `.collapse` 类与 JS 切换，深链/打印/无 JS 时状态不可控；若保留官方交互，至少要补 `aria-expanded` 与键盘可达（[Quarto 折叠语法](https://quarto.org/docs/authoring/callouts.html)）。
5. **嵌套只降一级视觉**：MkDocs 在嵌套时收紧 `padding` 与 `margin`（`--md-admonition` 的嵌套块），说明"内层必须更轻"是共识；两级同粗会让读者读不出层级。

### 常见错误
- 五种类型用五种饱和色（红/黄/绿/蓝/紫）→ 与低饱和书页冲突，且 `important`/`warning` 难分。
- 标题用全大写或图标代替文字（中文无大写，图标语义不唯一）。
- 给 callout 加 `box-shadow` 或 8px 圆角 → 立刻变成"卡片站"。
- body 用 `.9em` 且同时 `line-height: 1.4` → 中文 15.3px/1.4 是全书最难读的区块。

---

## 3. 表格

### 结构
Pandoc/Quarto 产出：
```html
<div id="tbl-x" class="quarto-float quarto-float-tbl anchored">
  <figure class="quarto-float quarto-float-tbl">
    <div class="quarto-float-caption-top">表 3.1: 标题</div>
    <div class="quarto-float-body">
      <table class="table"><caption>…</caption>
        <thead><tr class="header"><th>…</th></tr></thead>
        <tbody><tr class="odd">…</tr></tbody>
      </table>
    </div>
  </figure>
</div>
```
- 三线表只需去掉竖线，不引入 `booktabs` 包。
- 宽表：Quarto 不自动加滚动容器，需要 CSS 或 `tbl-` 自定义 float。

### 推荐数值（booktabs 三线）

| 项 | 官方默认（Quarto/Bootstrap） | 本书取值 | 说明 |
|---|---|---|---|
| 顶线 | `1px` 浅色（`$table-border-width`） | `1px solid var(--border-strong)` | 屏幕 1x 下 1.5px 会渲染成 2px 或虚边；仅在 `@media (min-resolution: 2dppx)` 升到 `1.5px` |
| 表头线 | `1px` 深一档 | `1px solid var(--border-strong)`（与顶线同粗，靠字重区分） | booktabs 惯例是"顶/底粗、头线细"，网页反着来更容易读 |
| 底线 | `1px` 浅色 | `1px solid var(--border-strong)` | — |
| 竖线 | 无 | 无 | Bootstrap 默认有，Quarto 已清掉 |
| 表头 | `font-weight: bold`，`padding: .5rem` | `font-weight: 600`，`font-size: .9375rem`，`padding: .5rem .75rem`，`color: var(--body-color)` | 表头不用次级灰，避免"表头比数据弱" |
| 单元格 | `padding: .5rem` | `font-size: .9375rem/1.6`，`padding: .45rem .75rem` | 表格字号略小于正文（17→15px） |
| 斑马纹 | Bootstrap `.table-striped` 可选 | **不用** | 与发丝线竞争；打印丢失；中文表格行文本长，斑马纹切割阅读 |
| hover | Bootstrap `.table-hover` 可选 | **不用** | 书籍页非表格工具；触屏无 hover；WCAG 无要求 |
| 数字对齐 | — | 数值列 `text-align: right` + `font-variant-numeric: tabular-nums` | 等宽数字让列内小数点对齐 |
| 表题位置 | 表题在上（`caption-top`） | 上；`.875rem`，label 600 accent，"表 3.1" 后接正文题名，`margin-bottom: .6rem` | 与图注（在下）形成区分 |
| 宽表 | 无容器 | `overflow-x: auto` + `scrollbar-width: thin` + 右缘渐隐提示 | 提示用 `mask-image` 渐变，打印时去掉 |
| 打印 | — | `thead{display:table-header-group}`；`tr{break-inside:avoid}` | 跨页重复表头 |

### 要点
1. **书籍场景弃用 `table-striped`/`table-hover`**：Bootstrap 的这两条是为"数据密集后台"设计的；Quarto 官方书籍示例同样保持素表（[Quarto 表格文档](https://quarto.org/docs/authoring/tables.html)）。而且打印时斑马纹必须靠 `print-color-adjust` 才能留住，代价大于收益。
2. **三线表不画竖线**，但要留足列间距（`.75rem`）：去掉竖线后，列间距是唯一的分隔手段，`3px 20px`（mdBook）在中文 15px 字下太挤。
3. **表头线不比顶线粗**：booktabs 原版是 `\toprule` 粗、`\midrule` 细，但网页 1px 是最小可见线，"粗"只能靠 1.5–2px，在 1x 屏上会糊；用 `font-weight: 600` 做表头强调更清晰。
4. **宽表必须有横向滚动**：Quarto 不自动包容器，`table{display:block;overflow-x:auto}` 会破坏 `thead` 粘性；优先给 `.quarto-float-tbl .quarto-float-body{overflow-x:auto}`。
5. **等宽数字**：C++ 教程表格常含 `INT_MAX`、`sizeof`、内存地址，`tabular-nums` 让数字列成"栅格"（[MDN font-variant-numeric](https://developer.mozilla.org/docs/Web/CSS/font-variant-numeric)）。

### 常见错误
- 用 `border-collapse: separate` + 单元格全边框 → 变成 Excel 截图。
- 表题在图下方（Quarto 表默认在上，混用会让"图 1 / 表 1"编号位置不一致）。
- 宽表加 `white-space: nowrap` 到所有单元格 → 中文列不折行，横向滚动条长到不可用。

---

## 4. 图片与图注

### 结构
```html
<figure class="quarto-float quarto-figure quarto-figure-center anchored">
  <div class="quarto-float-body"><img src="…" class="img-fluid figure-img"></div>
  <figcaption class="quarto-float-caption-bottom">图 2.1: 说明</figcaption>
</figure>
```
并排图：`.quarto-layout-panel`（`layout-ncol=2`）→ 每个 panel 自带 `figcaption`。

### 推荐数值

| 项 | 官方默认 | 本书取值 |
|---|---|---|
| 图注字号 | `0.9rem`（16px 根 → 14.4px）+ secondary 色 | **`.875rem`(14px) / 1.65**，`color: var(--body-secondary)`，**左对齐**（不用 `.quarto-figure-center` 居中） |
| 图注编号 | "图 2.1:" 与正文同色 | label `font-weight: 600` + `color: var(--accent)`，`margin-right: .4em` |
| 图文间距 | `figure` 默认 `margin-bottom: 1em` | 图→图注 `.5rem`；图注→下一段 `1.4rem` |
| 图片圆角/边框 | 无 | `radius: var(--radius-sm)`；深色主题下位图加 `outline: 1px solid var(--border)` |
| 缩放 | `lightbox: true`（Quarto 内置 lightbox，默认关闭） | 开启，仅 `<img>`，`cursor: zoom-in`；SVG 不参与 |
| 并排 | `layout-ncol`，panel 间距 `.5em？` | `gap: 1rem`，子图注 `.8125rem` |
| 高分屏 | — | 提供 2x 位图或 SVG；`img{max-width:100%;height:auto}` |

### 要点
1. **图注左对齐、字号 ≤ 正文的 0.9 倍**：居中图注在中文里会把短句拉成"孤立一行"；Quarto 官方书籍示例的图注同样小一号+次级色（[Quarto figures](https://quarto.org/docs/authoring/figures.html)）。
2. **lightbox 要可关**：Quarto 用 `lightbox: true|false` 全局开关（[Quarto 文档](https://quarto.org/docs/authoring/figures.html)）；纯 CSS 零依赖方案是 `img:hover{transform:scale(1.01)}`，但会引入抖动，**不推荐**；轻量替代是浏览器原生 `:target` 放大层。
3. **暗色主题不要整体压暗图片**：`filter: brightness(.92)` 会让白底截图发灰、代码字号变糊；正确做法是给位图加 1px 发丝描边，让它在深底上"有边界"（社区做法，Starlight/Quarto 均未见全局滤镜）。
4. **SVG 优先**：C++ 内存图/流程图用 SVG，无限缩放且无 2x 资源问题；位图必须提供 `srcset` 2x。

### 常见错误
- 图注 `.9rem` 在同一页与 `.875rem` 表格题混用（两套 14px 尺度）。
- `layout-ncol` 里子图宽度不统一，第二张被挤成竖条。
- 对 `<iframe>`/视频也用 lightbox。

---

## 5. 列表

### 结构
`ul > li`、`ol > li`、`li > p`（loose list）、`ul.task-list > li.task-list-item > input[type=checkbox]`、`dl > dt/dd`。

### 推荐数值

| 项 | 官方默认（Quarto/Bootstrap） | 本书取值 |
|---|---|---|
| 缩进 | `padding-left: 2rem` | `padding-inline-start: 1.4em`（≈24px）；嵌套每级 `1.2em` |
| marker | `disc/circle/square`，颜色随文本 | `::marker{color: var(--body-secondary)}`；有序 `decimal` |
| 项间距 | 0 | `li + li{margin-top: .2rem}`；loose list `li > p{margin: .3rem 0}` |
| 紧凑 vs 宽松 | 由空行决定 | 正文内列表保持紧凑；多段列表允许 `p` 间距，但不额外加 `li` 间距 |
| 任务列表 | Pandoc 输出 `input[type=checkbox]` | `1em` 见方、`accent-color: var(--accent)`、`margin-right: .5em` |
| 定义列表 | `dt` 粗、`dd` 缩进 | `dt{font-weight:600;margin-top:.8rem}`，`dd{margin-left:1.4em}` |
| 列表内含代码 | `pre` 撑满 | `li > pre{margin: .5rem 0}`，避免 `li` 的 marker 与代码左缘错位 |

### 要点
1. **缩进从 2rem 收到 1.4em**：Bootstrap 的 2rem 是为 16px 无衬线设计的，中文 17px 下 2rem 会让列表左缘离正文太远，层级与正文脱节（Quarto 默认继承 Bootstrap）。
2. **marker 用次级色**：列表符号是"导航"不是"内容"，与正文同黑会让密集列表变成墨块（Tailwind prose 同样把 marker 归入 `--tw-prose-bullets`）。
3. **任务列表不要加卡片**：`input` 原生勾选即可，MkDocs/GitHub 都不给任务项加底（[GitHub 任务列表](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/about-task-lists)）。
4. **列表内段落用 `p` 的间距而不是 `li` 的**：否则 loose/compact 两种列表会得到两套节奏。

### 常见错误
- `ul{list-style:none}` 后自绘 `::before`（丢失 `::marker` 语义与无障碍）。
- 嵌套列表沿用同一 marker（`disc` 三层都是实心点）。
- `li` 上 `line-height: 1.5` 与正文 1.85 冲突，列表看起来比正文紧。

---

## 6. 代码块

### 结构
```html
<div class="code-with-filename">
  <div class="code-with-filename-file"><pre><strong>main.cpp</strong></pre></div>
  <div class="sourceCode" id="cb1">
    <pre class="sourceCode cpp code-with-copy">
      <code class="sourceCode cpp"><span id="cb1-1">…</span></code>
      <button class="code-copy-button" title="Copy to Clipboard"><i class="bi bi-clipboard"></i></button>
    </pre>
  </div>
</div>
```
- 行号：`code-line-numbers: true`（全局）或 fenced 属性；Quarto 用 `<span id="cb1-1">` 行包装。
- 折叠：`code-fold: true` → `<details class="code-fold"><summary>Code</summary>`。
- 注释/高亮：`code-annotations`、`code-line-numbers="3-4"`（高亮行）、`code-annotations: below`。
- 输出块：`.cell-output`（Jupyter）或 `#| output: false`。

### 推荐数值

| 项 | 官方默认 | 本书取值 |
|---|---|---|
| 字号/行高 | `0.875em`，`line-height` 继承 | `0.9375rem`(15px) / `1.7`（现状） |
| 背景/边框 | `$code-block-bg`（可选），无边框；左侧条可选 `code-block-border-left` | `background: var(--code-bg)`；`1px solid var(--code-border)`；`radius: 4px`；无阴影 |
| 内边距 | `$code-block-bg-padding`（默认 1em 量级） | `.85rem 1.05rem`（现状） |
| 标题栏 | `code-with-filename` → `.code-with-filename-file` | `.75rem/1`、`font-weight: 500`、`padding: .45rem .85rem`、底 1px 发丝、`background: var(--code-title-bg)` |
| 复制按钮 | 绝对定位右上，`opacity` 随 hover | `24px`、`1px` 发丝边框、`background: color-mix(in srgb, var(--page-bg) 85%, transparent)`；默认 `opacity: 0`，`:hover/:focus-within` → 1；`@media (hover: none)` 常驻 |
| 溢出 | `code-overflow: scroll`（`white-space: pre`） | 保持滚动（`overflow-x: auto`），**不折行**；`scrollbar-width: thin`、`overscroll-behavior-x: contain` |
| 行号 | `::before` 计数 | `2.6em` 宽、`color: var(--text-tertiary)`、`text-align: right`、`padding-right: .8rem`、`user-select: none` |
| 行高亮 | `.code-annotation-code` 背景 | `background: color-mix(in srgb, var(--accent) 8%, transparent)`，`box-shadow: inset 2px 0 0 var(--accent)` |
| 注释 | `code-annotations` 箭头 + 徽标 | 徽标 `1.15em` 圆、accent 底白字、`.7em`；源行 `border-bottom: 1px dashed` |
| 输出块 | `.cell-output` | `font-size: .875rem`、`color: var(--body-secondary)`、`background: transparent`、左 2px 发丝、`padding-left: .9rem` |

### 要点
1. **代码不折行**：Quarto 默认 `scroll`，官方允许 `wrap`（[HTML Code Blocks](https://quarto.org/docs/output-formats/html-code.html)），但对 C++ 书，折行会让同一行在不同视口断在不同位置，读者对照本地输出时错位；本项目已固定 840px 容纳 100 列。
2. **复制按钮不能挡住首行代码**：Quarto 默认按钮在右上角覆盖代码；给 `pre` 加 `padding-right: 2.5rem` 或把按钮放进标题栏（有 `filename` 时）。
3. **行号要 `user-select: none`**：复制代码时行号混入剪贴板是高频 bug（MkDocs/Quarto 均有此问题）。
4. **高亮行用"左侧 2px + 8% 底"**：只用底色在深色主题下几乎不可见；Figma/Stripe 文档式高亮都配了边条。
5. **输出块降级为次级色**：输出是可选的"证据"，与源码同权重会让页面变成两段代码。

### 常见错误
- 代码块用 13px 以下 + 行高 1.4（C++ 模板与指针符号难辨）。
- `pre { white-space: pre-wrap }` 全局生效（屏幕上也折行）。
- 标题栏字号与行内代码同大（12px 以下标题失去"文件名"语义）。

---

## 7. 引用块

### 结构
`blockquote > p`；Quarto 会加 `.blockquote` 类。

### 推荐数值（对官方默认的修正）
| 项 | 官方默认 | 本书取值 |
|---|---|---|
| 左边线 | 无显式边框（Bootstrap `$blockquote-border` 可能 0） | `border-inline-start: 2px solid var(--border-strong)` |
| 内边距 | `padding-left: 1rem; padding-right: 1.5rem` | `padding: .25rem 0 .25rem 1rem` |
| 字号/颜色 | `inherit` + secondary 色 | 字号 `1rem` 不变，**颜色保持 `--body-color`**（引文常是关键句，不只做装饰） |
| 斜体 | 可能继承 `em` | **中文不用斜体**；拉丁引文可 `font-style: italic` |
| 上下距 | 浏览器默认 `1em` | `margin: 1.4rem 0`（换段档） |

### 要点
1. **中文引文不加斜体**：clreq 的引文靠引号与缩排，不靠倾斜（[§5.2](https://www.w3.org/TR/clreq/#h_quotations)）。
2. **引文不要降到次级灰**：Quarto 默认用 secondary 色，但中文灰字在 17px 下对比度吃紧；保留正文色、用左边线+缩进区分更稳（WCAG 对比度 4.5:1）。
3. **2px 而不是 3–4px**：引用块是"停顿"不是"警告"，与 callout 3px 形成层级差。

### 常见错误
- 引用块里嵌 callout 且两者左条同为 3px（层级消失）。
- 用引号「」代替 blockquote 的缩进语义。

---

## 8. 脚注

### 结构
正文 `<a href="#fn1" class="footnote-ref" id="fnref1">1</a>`；文末 `<section class="footnotes footnotes-end-of-document"><ol><li id="fn1">…<a href="#fnref1" class="footnote-back">↩︎</a></li></ol></section>`。

### 推荐数值
| 项 | 官方默认 | 本书取值 |
|---|---|---|
| 引用上标 | `sup` + 链接色 | `.7em`、`color: var(--accent)`、无下划线、`vertical-align: super` |
| 脚注区 | `.footnotes ol{padding-left:1em}`，字号同正文 | 顶部 `1px` 发丝、`margin-top: 3.25rem`、`padding-top: 1rem`；`font-size: .875rem/1.7`；`ol{padding-left:1.25em}` |
| 序号 | `decimal` | `::marker{color: var(--body-secondary)}` |
| 回跳 | `↩︎` | `opacity: .6`，`:hover{opacity:1}`，加 `aria-label="返回正文"` |

### 要点
1. **脚注区必须与正文区分字号**：17px 正文下的脚注若同字号同色，读者会误当正文继续读。
2. **回跳链接要可读**：Quarto 用 `↩︎`，视觉上过小；补 `aria-label` 与 `padding: 0 .25em`。
3. **中文书里脚注优于尾注**：本书是网页形态，脚注即"当页可回看"；`footnotes-end-of-document` 是 Pandoc 的默认位置，可接受。

### 常见错误
- 脚注序号用 `1)` 而非上标。
- 脚注区与"参考文献"共用同一容器导致编号混乱。

---

## 9. 右侧目录（TOC）与侧栏

### 结构
`#quarto-margin-sidebar > .sidebar.margin-sidebar > nav[role="doc-toc"] > ul > li > a`；激活项 `.active`（Quarto 用 scrollspy 切类）。

### 推荐数值
| 项 | 官方默认 | 本书取值 |
|---|---|---|
| 字号 | `.875rem`；工具条 `.8rem` | `.8125rem`(13px) / 1.5 |
| 行距 | 默认 | 项 `padding: .22rem 0 .22rem .75rem` |
| 缩进 | 每级 `1.2em` | 每级 `.75rem`（现状 `--toc-indent`） |
| 激活态 | `border-left: 1px` + 链接色 | `border-left: 2px solid var(--accent)`；`color: var(--accent)`；`font-weight: 500` |
| hover | 变链接色 | 只变文字色，不加底色 |
| 标题 "On this page" | 小字 + 次级色 | `.75rem/500`、`color: var(--body-secondary)`、`letter-spacing: 0`（中文不加字距） |
| 侧栏宽 | `250px` | 沿用 Quarto 栅格；`1440px` 以上再考虑加宽 |
| 粘性 | `position: sticky` + `top` 偏移 | `top: calc(var(--navbar-height) + 1rem)`；`max-height: calc(100vh - …)`、`overflow-y: auto` |

### 要点
1. **1px 激活线太弱**：Quarto 官方是 `1px`，但在 13px 字旁几乎看不见；侧栏激活条 2px 是 Starlight/MkDocs 的通用做法。
2. **TOC 字号必须小于正文一档以上**：13px vs 17px，否则右栏会与正文争夺注意力。
3. **每级缩进 `.75rem` 而非 `1.2em`**：`1.2em` 在 13px 下只有 15.6px，三级列表几乎看不出层级；固定 `rem` 更稳（Quarto 用 `1.2em` 是因为它的 TOC 字号可变）。

### 常见错误
- 激活项加整块底色（右栏变成色块）。
- 中文 TOC 标题加 `letter-spacing: .05em`（汉字本就等宽，加字距只是变松）。

---

## 10. 章节翻页

### 结构
`nav.page-navigation > .nav-page.nav-page-previous|next > .nav-page-text + 标题`。

### 推荐数值
| 项 | 官方默认 | 本书取值 |
|---|---|---|
| 容器 | 两列 | `grid-template-columns: 1fr 1fr; gap: 1rem`；`border-top: 1px solid var(--border)`；`margin-top: 3.25rem; padding-top: 1rem` |
| 方向标签 | 小字 | `.75rem`、secondary、"上一章 / 下一章" |
| 标题 | 链接色 | `1rem/500`、`color: var(--body-color)`；hover 才变 accent + 下划线 |
| 下一页 | 右对齐 | `text-align: right`；`justify-self: end` |
| 只有一项时 | 留空 | `grid-column: 1 / -1` 或保持右对齐，不留半格空白 |

### 要点
1. **翻页是"路标"不是"按钮"**：给整块加边框/底色会与 callout 混淆；1px 顶线 + 文字层级足够（mdBook 的 `.nav-chapters` 用图标+文字，同样克制）。
2. **标题不用 accent 常驻**：页面底部同时出现两个彩色标题会抢走正文最后的注意力。

### 常见错误
- 上一章/下一章都做成卡片、都带阴影。
- 中文"上一章"与英文 "Previous" 混排。

---

## 11. 首页 / 落地页

### 结构
`.quarto-title-block`（title/subtitle/description）+ 自定义 `.landing-*` 区块。

### 推荐数值
| 项 | 本书取值 |
|---|---|
| 主标题 | `clamp(2rem, 4vw, 2.75rem)` / `1.2` / 600 |
| 眉标（kicker） | `.9rem`、secondary、`letter-spacing: .04em`（拉丁）；中文不加字距 |
| 描述 | `1.125rem/1.7`、`max-width: 40em` |
| 卡片/入口 | `1px` 发丝 + `radius: var(--radius-md)` + **无阴影**；hover 只换边框色 |
| 区块间距 | `3.25rem`（换节档） |

### 要点
1. **落地页允许比正文更松**：它是"引导面"不是阅读面，行高可到 1.7、间距可到 3.25rem 档（本项目 `landing.css` 已按此设计）。
2. **卡片不要阴影**：与全书"无卡片阴影"约束一致，用发丝边框 + hover 变边框色表达可点。

### 常见错误
- 首页标题用正文字体同一字号（首页失去"入口"感）。
- 中文眉标加 `letter-spacing: .1em`（汉字被拆散）。

---

## 12. 打印样式

| 项 | 本书取值 |
|---|---|
| 页面 | `@page{ size: A4; margin: 18mm 16mm }` |
| 隐藏 | 侧栏、右 TOC、复制按钮、翻页、锚点、`#quarto-back-to-top` |
| 字号 | 正文 `10.5pt/1.7`；代码 `9pt/1.5`；图注 `8.5pt` |
| 代码 | `pre{white-space: pre-wrap; overflow: visible}`（屏幕仍滚动） |
| 分页 | `h1,h2,h3{break-after: avoid}`；`pre,figure,blockquote,.callout{break-inside: avoid}`；`tr{break-inside: avoid}`；`thead{display: table-header-group}` |
| 链接 | 不打印 URL；仅脚注/参考文献保留 |
| 颜色 | 色条与底纹保留需 `print-color-adjust: exact`，否则会掉成灰 |

要点：
1. mdBook 的打印样式就是"隐藏导航 + `pre` 折行 + `page-break-inside: avoid`"三件套（[mdBook print.css 实测](https://rust-lang.github.io/mdBook/)），可作最小集。
2. 打印时 `overflow-x: auto` 的宽表必须改为可见换行，否则右侧列被裁掉。

---

## 13. 中文长文专项（本书最容易踩的一节）

| 项 | 建议 | 依据/说明 |
|---|---|---|
| 行高 | `1.85`（区间 1.7–1.9） | 拉丁参照：mdBook `1.45em`、Tailwind prose `1.75`；WCAG 1.4.8 下限 1.5。**"中文应 ≥1.8"没有权威标准给出数字**，属实践共识（未证实） |
| 字号 | `17px` | 16px 在楷体下偏小；`1.0625rem` 现状 |
| 行长 | ≈40 汉字/行（840px） | WCAG 建议 ≤80 拉丁字符（[1.4.8](https://www.w3.org/WAI/WCAG22/Understanding/visual-presentation.html)） |
| 段首缩进 | **不做**，改用段间距 1.4rem | clreq 允许"不缩排+段间留白"这一式；但 clreq 同时指出中文书刊惯例是 2em 缩进且段间不加空行（[§6.2.1.1](https://www.w3.org/TR/clreq/#h_justification)）——网页取前者，因为代码块/列表频繁打断，缩进会与块元素左缘错位 |
| 两端对齐 | **`text-align: start`（不做）** | clreq 的印刷规范是两端对齐、靠字间调距（§6.2.2）；但网页混排大量行内代码/英文标识符，浏览器 justify 会把空格拉成"河道"且不处理标点悬挂。若要开，只对纯中文段落用 `.prose--justify{text-align:justify;text-justify:inter-character}`，浏览器一致性**未证实** |
| 标点挤压 | `text-spacing-trim: space-first`（`@supports` 守卫） | CSS Text 4 的 CJK 标点压缩；Chrome/Safari 支持度需实测，**未证实**，作为 P2 增强 |
| 中西混排空格 | `text-autospace: normal`（`@supports` 守卫），或作者手动加空格 | 规范见 [CSS Text 4 §text-autospace](https://drafts.csswg.org/css-text-4/#text-autospace-property)；人工规则见[中文文案排版指北](https://github.com/sparanoid/chinese-copywriting-guidelines)（"中英文之间加空格"）。**浏览器默认不自动加**，不加空格时汉字与拉丁会粘连 |
| 行尾标点悬挂 | **不用** `hanging-punctuation` | 仅 Safari 支持 `allow-end`，跨浏览器不一致；宁可不做 |
| 破折号/省略号 | 用「——」「……」 | clreq §5.1 规定破折号占 2em、省略号 6 点；不要用 `--` 或 `...` |
| 引号 | 简体横排用 “ ” 与 ‘ ’ | clreq §5.2；书名号《》 |
| 数字 | 正文用比例数字；表格用 `tabular-nums` | — |
| 中文强调 | `<strong>` 600 或 `text-emphasis` 着重号 | clreq §5.3.1 |
| 断行 | `word-break: normal`；行内代码 `white-space: nowrap` 但要允许在代码前后断行 | 避免 `word-break: break-all` 在中文里把词拆开 |

要点：
1. **"缩进 2em + 段间空行"是中文排版的经典错误**：clreq 明确二者取其一（缩进则段间不空行；不缩进则用间距），本书取后者。
2. **不要为了"像书"而 justify**：中文网页 justify 的收益在纯文字段落，成本在混排段落；本书以代码与术语为主，收益为负。
3. **标点与混排规则的自动化要谨慎**：`text-spacing-trim` / `text-autospace` 都还是渐进增强项，必须有 `@supports` 与回退（手动空格/全角标点）。

---

## 14. 落地清单（按优先级 + 可测量断言）

### P0 必须（不做就"不像书"）
| # | 项 | 验收断言 |
|---|---|---|
| 1 | Callout 统一左条 | `.callout{border-left-width:3px; border-left-style:solid; border-radius:0 var(--radius-sm) var(--radius-sm) 0}`；五型各自 `border-left-color` |
| 2 | Callout 正文不缩小 | `.callout-body{font-size:1rem;line-height:1.75}`；首末子元素 `margin-block:0` |
| 3 | 表格三线 | `table{border-top:1px solid var(--border-strong);border-bottom:1px solid var(--border-strong)}`、`thead{border-bottom:1px solid var(--border-strong)}`、`td,th{border-left:0;border-right:0}` |
| 4 | 表格不用斑马/hover | 不存在 `.table-striped tbody tr:nth-child(odd)` 与 `.table-hover:hover` 的底色规则 |
| 5 | 图注小一号、次级色、左对齐 | `figcaption{font-size:.875rem;line-height:1.65;color:var(--body-secondary);text-align:start}` |
| 6 | 代码滚动不折行 | `pre.sourceCode{white-space:pre;overflow-x:auto}`；不存在全局 `pre{white-space:pre-wrap}`（仅 `@media print` 内） |
| 7 | 链接下划线 | `a{text-decoration:underline;text-underline-offset:.18em;text-decoration-thickness:.06em}` |
| 8 | TOC 激活 2px | `nav[role=doc-toc] a.active{border-left:2px solid var(--accent)}` |
| 9 | 列表缩进 1.4em | `#quarto-document-content ul,#quarto-document-content ol{padding-inline-start:1.4em}` |
| 10 | 无卡片阴影 | 全站不存在 `box-shadow` 用于 callout/table/figure/card |

### P1 建议
| # | 项 | 验收断言 |
|---|---|---|
| 11 | 代码标题栏 | `.code-with-filename-file{font-size:.75rem;font-weight:500;padding:.45rem .85rem;border-bottom:1px solid var(--code-border)}` |
| 12 | 复制按钮不遮码 | 有 filename 时按钮在标题栏；无 filename 时 `pre{padding-right:2.5rem}`，按钮 `24px`、`opacity:0` → `:hover/:focus-within` 1 |
| 13 | 行号不可选 | `pre .code-line-numbers ::before` 或其容器 `user-select:none` |
| 14 | 脚注区降字号 | `.footnotes{font-size:.875rem;line-height:1.7;border-top:1px solid var(--border)}` |
| 15 | 打印规则 | `@media print` 内：隐藏侧栏/TOC/复制按钮；`pre{white-space:pre-wrap}`；`h2,h3{break-after:avoid}` |
| 16 | 引用块 2px 左边线 | `blockquote{border-inline-start:2px solid var(--border-strong);padding-left:1rem;color:var(--body-color)}` |
| 17 | 翻页顶线 | `.page-navigation{border-top:1px solid var(--border);padding-top:1rem;margin-top:3.25rem}` |
| 18 | 数字等宽 | `td[style*="text-align: right"],.numeric{font-variant-numeric:tabular-nums}` |

### P2 可选
| # | 项 | 验收断言 |
|---|---|---|
| 19 | 高亮行 | `.code-annotation-code{background:color-mix(in srgb,var(--accent) 8%,transparent)}` + `inset 2px 0 0 var(--accent)` |
| 20 | 任务列表 | `.task-list-item input{width:1em;height:1em;accent-color:var(--accent);margin-right:.5em}` |
| 21 | 中文着重号 | `em{font-style:normal;text-emphasis:dot;text-emphasis-position:under right}`（`@supports` 守卫） |
| 22 | 标点挤压 | `@supports (text-spacing-trim: space-first){ body{text-spacing-trim:space-first} }` |
| 23 | 混排自动间距 | `@supports (text-autospace: normal){ body{text-autospace:normal} }` |
| 24 | 选区色 | `::selection{background:color-mix(in srgb,var(--accent) 22%,transparent)}` |
| 25 | 深色位图描边 | `body.quarto-dark img:not([src$=".svg"]){outline:1px solid var(--border)}` |

---

## 15. 未证实 / 待核

| 项 | 状态 |
|---|---|
| Quarto lightbox 的底层库与参数（是否 GLightbox、`group`/`description` 选项细节） | **未证实**：本次抓取 figures 文档 404，未读到实现说明；`lightbox: true` 选项本身见 [Quarto figures](https://quarto.org/docs/authoring/figures.html) |
| `text-spacing-trim` / `text-autospace` 的浏览器支持矩阵与默认值 | **未证实**：仅按 CSS Text 4 规范给建议，需在目标浏览器实测后再开 |
| Docusaurus admonition 的精确数值（Infima `--ifm-alert-*`） | **未证实**：本次未抓到 Infima 编译产物；结构见 [Docusaurus admonitions](https://docusaurus.io/docs/markdown-features/admonitions) |
| Stripe / Tailwind Docs 站点的 callout 精确 CSS | **未证实**：两者为压缩后的自研样式，未逐条量取；Tailwind prose 的数值取自其公开 `styles.js` |
| "中文行高应 ≥1.8" 的权威出处 | **未证实**：clreq 未给数字；1.7–1.9 为工程共识，本项目取 1.85 |
| 用户提到的去色强调（`color: var(--body-secondary)`）用于正文强调 | 与 WCAG 对比度冲突，**不推荐** |

---

## 16. 一句话结论

书籍场景的组件规格收敛成四条约束即可推理出全部数值：**发丝线（1px 分隔、2–3px 强调）、无卡片（无阴影、圆角 ≤4px；当前 token 仅到 3px）、单一尺度（正文 17px/1.85，次级 ≥14px）、颜色只做编码不做装饰（callout 五型靠色相+标题+图标三重编码）**。凡与这四条冲突的社区默认值（Quarto 的 5px 条、Bootstrap 的 2rem 列表缩进、斑马纹、`table-hover`、justify、中文斜体）都应改写而不是继承。

---

## 附录 A · 现有主题审计（2026-10-23 复核，行号实测）

路径基准 `skills/designing-theme/assets/theme/`。

### A.1 仍依赖 Quarto/Bootstrap 默认（未覆盖）

| 组件 | 现状 | 后果 |
|---|---|---|
| 脚注 | `grep -c footnote css/*` 全 0 | 继承 17px/1.85，与正文同大 |
| 任务列表 | 0 处 `task-list` | checkbox 走 UA 默认，无 `accent-color` |
| callout 折叠按钮 | 0 处 `callout-btn-toggle` | 吃 Bootstrap 默认 |
| code-fold / code-annotation / 行高亮 | 0 处 | 展开三角、徽标、高亮行全默认 |
| `.quarto-float` / `.quarto-float-caption` | 0 处；仅 `content.css:103` 的 `figure figcaption` | Quarto ≥1.4 图注外包在 `.quarto-float-caption-*`，可能不命中 |
| `table caption` | 0 处 | Bootstrap `caption-side: bottom` → 表题跑到表下 |
| `.table-striped` | 0 处（只压了 `--bs-table-hover-bg`，`content.css:5`） | 启用即出斑马纹 |
| `h6` | `base.css:94-101` 只给 font-family | 字号走 Bootstrap |
| `.column-margin` / lightbox | 0 处 | 边注、图片放大缺失 |
| `@page` / `thead` 打印重复 | 未写 | 宽表打印横向裁切 |

### A.2 与「墨/纸/强调/线」冲突（按严重度）

| # | 冲突 | 证据 | 修法 |
|---|---|---|---|
| C1 | 「强调」分裂：`--emphasis-color` 明色下 = 墨色，strong 只靠合成加粗 | `palettes/flexoki/tokens.css:12-13`；`content.css:261-265` 解禁 `font-synthesis: weight` | 拆名 `--ink-strong` / `--action`；补真 600 子集或调深强调色 |
| C2 | 线宽三档未收敛：1px / **1.5px** / 2px 并存 | `content.css:38,42`（1.5px）vs `base.css:113-115`（"全书唯一 1px 横线"） | 只留 1px(hairline) 与 2px(bar)；1.5px 仅 2dppx |
| C3 | 圆角三套混用 | `code.css:76`(3px) / `code.css:37`(`--code-radius` 4px) / `code.css:105`(4px) / `content.css:99`(`--radius-lg` 6px) | 统一 3px，删 md/lg |
| C4 | 纸面层级散、令牌空转 | `--table-hairline`/`--quote-border`/`--sidebar-active-bg`/`--card-shadow`/`--table-header-bg`/`--card-hover-border` 引用次数 0 | 接上或删除 |
| C5 | 中文标签加了字距 | `callouts.css:46`、`base.css:49` 的 `.04em` | 改 `0`（标题块已正确写 0） |
| C6 | 语义借用 | `code.css:203` 用 `--sidebar-hover-bg`；`content.css:143` kbd 用 `--inline-code-bg` | 补 `--control-hover-bg` |
| C7 | 唯一硬编码色 | `nav.css:263` `rgba(0,0,0,.42)` | 令牌化 `--overlay-scrim` |
| C8 | 打印外链 URL | `base.css:479-483` | 仅脚注保留或删除 |
| C9 | 600 僵尸声明 | `callouts.css:44-45`、`sidebar.css:77` 在 `font-synthesis: none` 下无效 | 补子集或删字重 |

### A.3 其他结构性问题

- **表格 `display: block`**（`content.css:10`）让 `thead`/`tbody` 脱离同一表格格式上下文，宽表时表头列宽与表体不再对齐；打印无法折行。改 wrapper。
- **表格字级跳变**：`thead .8125rem` vs `tbody 1rem`（`content.css:8,34`）= 2.4px。
- **图注 `.88rem`（14.08px）+ 居中**（`content.css:103-108`），非整值且与"左对齐"建议相反。
- 列表缩进仍吃 Bootstrap `padding-left: 2rem`（未覆盖）。
- 翻页 `margin-top: 3rem`（`sidebar.css:188`）与页脚 `2.5rem`（`base.css:331`）不成档。

### A.4 已达标（无需改）

`user-select: none` 行号（`code.css:167`）、打印代码折行（`code.css:211-217`）、TOC 激活 2px（`sidebar.css:152`）、侧栏去竖线（`sidebar.css:33-37`）、面包屑 SVG chevron（`nav.css:526-538`）、`line-break: strict`（`base.css:232`）、`text-autospace: normal`（`content.css:255`）、`tabular-nums`（`content.css:17`）。
