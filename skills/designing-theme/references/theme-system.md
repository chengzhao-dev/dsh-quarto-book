# 主题系统（设计令牌与文件结构）

## 令牌与色板（定颜色）

令牌语义与流程见本文件。**颜色**只写在 `palettes/<name>/tokens.css` 与同目录的品牌标/标签图标（`brand-mark.svg`、`favicon-light.svg`、`favicon-dark.svg`）；Solarized 与山光的语法色是仅有的 CSS 例外，写在各自的 `palettes/<name>/syntax.css`。**结构尺度**（字号、半径、字体栈、`--content-width`）写在 `css/tokens.css`。本文件不维护数值副本。

编译默认色板是 `palettes/flexoki`（Flexoki Light / Dark）；`palettes/solarized` 与 `palettes/hill-light`（山光四时：晓雾/午荫/暮烟/夜月）是运行时可选覆盖层，不参与编译。每个色板目录带同一枚「打开的书」品牌标与明暗两份标签图标；书标外形全站一份，颜色随色板。换默认色板时只改 `_quarto.yml` 的 pack SCSS、`palettes/<name>/tokens.css` 与 `highlight-style`，共享组件 CSS 不动。

### 令牌索引

| 语义 | CSS 变量 | 使用边界 |
|---|---|---|
| 页面底色 / 浮起面 | `--page-bg` / `--surface-raised` | 页面与抬升表面 |
| 正文最大宽度 | `--content-width` | 正文容器上限，不是段落二次限宽 |
| 正文 / 次要文字 | `--body-color` / `--text-secondary` | 正文层级 |
| 正文强调 / 链接 | `--emphasis-color` / `--link-color` / `--link-hover-color` / `--text-link` | 强调不用链接色；链接常态与正文同色，hover 才用 `--link-hover-color` |
| 代码外观 | `--code-*` / `--code-title-*` | 语言块、纯文本块与代码标题 |
| 表格 / 卡片边框 | `--table-border` / `--card-border` | 分隔与边框 |
| 眉标与状态点 | `--dot-accent` | 首页与状态强调 |
| 顶栏 | `--navbar-*` | 导航、搜索与主题切换 |
| 标题字面 | `--heading-font` | h1–h6、导航书名、卡片小标题；系统黑体栈 |
| 覆盖层遮罩 | `--overlay-scrim` | 搜索浮层、源码模态与窄屏侧栏遮罩 |
| 圆角 | `--radius-sm` / `-md` / `-lg` | 只有 3 / 4 / 6px 三档；正文与卡片惯用 `--radius-sm`（3px） |

### callout 色（左条 + 无填充）

每个内置 callout 有一对 `--callout-<type>-border` / `-bg`，写在活跃 palette。SCSS `$callout-*` 须与 border 同步，供编译期图标 data URI。条色用当前色板的语义色：Flexoki 的 note 取中性 `#6F6E69` / `#9F9D96`，tip 绿、warning 橙 `#BC5215` / `#DA702C`、important 紫、caution 红，暗用对应 accent-400；Solarized 的 note 取 base01 / base1，warning 用官方 orange `#CB4B16`。`-bg` 一律 `transparent`，callout 是编辑注，不是彩色卡片。

### 强调、链接与明暗一致性

- 正文 `strong` 用「颜色 + 加粗」双重强调（`content.css`）：`font-weight: 700` 加 `font-synthesis: weight`——全站只有 Bright Medium 一个字面且 body 禁合成，合成只放开给 strong；强调色不取语法蓝：Flexoki 亮色与正文同墨色、靠合成字重区分，暗色更亮；Solarized 亮色深一档、暗色更亮。
- 列表里独占一段的 `strong`（如「出错的原因」）保持块级小标题，颜色用正文色，不走强调色。
- 链接里的加粗跟链接色走；代码文件名用自己的 `--code-title-fg`，不被 strong 强调色盖住。
- 行内代码与 `kbd` 保持「弱底 + 正文色」，不继承强调色。
- `prefers-contrast: more` 段只把正文、边框与行号收紧到更深档，不换色相，也不把强调色改成语法蓝。
- 组件 CSS 不写色值，明暗各写一套；切换后核对加粗、链接、链接里的加粗、列表小标题和代码文件名没有串色。

## 字体栈与字形来源（定字体）

正文与标题各一面。**正文**用 `LXGW Bright Medium`（Klee One 中笔画 + Ysabeau Office 西文，登记 `font-weight: 400`，`font-synthesis: none` 下不合成粗体）；**代码**用 `LXGW Bright Code`（Klee + Monaspace Argon）；**标题**（h1–h6、导航书名、首页卡片小标题）用 `--heading-font` 的系统黑体栈（`Noto Sans SC` → 思源黑体 → `PingFang SC` → `Microsoft YaHei` → system-ui），请求 600/700 时由系统字面真正加粗。理由：单字面的楷体在 24px 以上笔画偏细、600 又不合成，标题与正文层级只靠字号，层级弱；对照实测 h2 换黑体后层级立刻清楚，且不新增字体文件、不影响正文观感。中文正文保持霞鹜楷体路线；文楷 Screen 与 Fixel 已移除。候选对比、授权与字面实测（数字等宽、标点宽度、`+` 墨迹 0.23em）见 `docs/research/font-selection.md`。西文来源依据：文楷仓库点名 Ysabeau；Bright 用齐线数字的 Ysabeau Office；文楷 Screen 的 Medium 笔画标 Regular、度量对齐 Roboto，不适合中西文都自托管的站点。

- 文件与预算：`assets/theme/assets/fonts/` 每字体一个 `*-common.woff2`（共 2 个），单页合计 ≤ 1.6 MB、≤ 5 个文件。
- 子集：沿用常用字表并覆盖全书正文与终端输出；生成方式 `pyftsubset --flavor=woff2 --no-hinting`。改结果文案或新增字符后，用 fontTools 读 woff2 cmap 复核（起因：子集共用字符表漏「胜」，结果行末字落到宋体）；`checking-layout.py` 的覆盖断言在未声明 unicode-range 时直接读 cmap。新增字符时，按同版本上游 TTF（Bright 5.528、Bright Code 2.922）保留现 cmap 并入新码位后重建，输出到插件与书内两份；跑页面矩阵时用 `NODE_PATH` 指向插件的 `node_modules`。
- 覆盖范围不只汉字：西文标点、数学/箭头、制表符、几何图形与全角形式（U+FF01–FF5E）同在断言内（`GLYPH_RANGES`）。漏一个字不会被发现，却会静默回落到系统 CJK 字体，按 0.5em 的中线画出——正文 `+` 墨迹在 0.23em，「++」会显得浮在汉字上方。表情符号（≥U+1F000、U+2600–U+27BF）按设计走系统 emoji，不在断言内。
- 不逐符号位移：Bright 的数字、括号、`× ÷ = +` 共用同一条数学轴（+ 中心 0.23em，汉字 0.357em）。只抬 `++` 会脱离同行的符号，所以 `.plus-align` 这类 `translateY` 已删除；对齐问题只在字形缺失时补码位。
- 同步点：改字体须同步 SCSS、tokens、fonts、OFL、资产与 `checking-layout.py`；Mermaid 的 `%%{init}%%` 与坐标图脚本的 `FONT_FAMILY` 用同栈短版（`LXGW Bright Medium, system-ui, sans-serif`），保证测量与渲染一致。
- 栈尾 CJK 系统字体后备（PingFang SC、Microsoft YaHei、Noto Sans CJK SC、Source Han Sans SC）保留，缺字时落系统黑体而不是浏览器默认宋体。
- 不采用 Inter、思源黑体、JetBrains Mono、Cascadia、Iosevka、Inconsolata；Roboto/Segoe UI 不放进 `assets/theme/assets/fonts/`（OFL 政策）。

## 字号、行长与页面尺度（定尺度）

| 元素 | 值 |
|---|---|
| 正文 | 17px（1.0625rem）/ lh 1.85 / 内容列 840px |
| H1（title） | 32px / w600 |
| H2 | 24px / w600 / mt 3.25rem mb 0.5rem |
| H3 | 19px（1.1875rem）/ w600 / mt 2.25rem |
| H4 | 18px / w600 |
| 代码块 | 15px（0.9375rem）/ lh 1.7 |
| 行内代码 | 0.875em |
| Callout 正文 / 标题 | 16px / 13px |
| 脚注 / 图注 / 表题 | 14px（0.875rem）/ lh 1.65–1.7 / `--text-secondary` |
| 表头 | 15px（0.9375rem）/ 正文色 |
| H6 | 13.6px（0.85rem）|

- 层级靠「字号台阶 + 字面分工」：正文只有楷体一面，标题与导航书名用黑体栈，`font-weight: 600` 只在黑体上有视觉意义；正文内的 `strong` 仍走合成加粗（见「强调、链接与明暗一致性」）。
- 正文 17px / 行高 1.85，代码 15px / 1.7；章节分隔靠 H2 的 `margin-top`，无通栏底线。
- `grid.body-width` 是正文列上限（现 300+872+272+2×16=1476 封顶）；Quarto 会从 body-width 中减去两侧各 1rem 的栅格内边距，正文内容列 = body-width − 32px（现 840px）。取 872px 是让代码块 100 列（15px 下约 782px）与行号仍有富余的最小配置。取值只在 `_quarto.yml`，`--content-width` 只限正文容器；禁止 `75ch` 二次限宽。
- 代码块不折行：`white-space: pre` + 块内横向滚动（`_quarto.yml` 的 `code-overflow: scroll`）；窄视口整页不出横向滚动条，打印时恢复折行（`code.css` 的打印规则）。
- ≤991.98px 左栏浮层必须不透明实底（规则在 `assets/theme/css/sidebar.css` 的 991.98px 媒体查询）。
- 栏与栏之间不画竖墙：桌面三栏靠 `#quarto-header` 下一条通栏 1px `--card-border` 分隔，左右两栏在桌面没有 `border-right`（Quarto `sidebar.border` 的竖线被 `#quarto-sidebar.sidebar.sidebar-navigation { border-right: 0 !important }` 压掉）；`≤991.98px` 的浮层右缘 1px 是抽屉边，不是栏间墙。
- 右目录每条的 1px 左轨、当前项 2px `--accent` 色条，以及左栏当前项的左色条都保留：它们标的是「读到哪一节」，不是栏边界。

## 组件约定（定组件）

- **代码块**：弱底 + 细边。有 `filename` 时用标题条，复制钮右上角；复制钮边框和图标用 `--text-secondary`（暗色下按钮底与代码底同色，边框太暗图标会沉进去）。
- **Callout**：2px 左条、无填充、无圆角；标题 13px、字距 0（汉字等宽，加字距只把词拉散）、正文色；正文 16px；左条 2px、无填充、无圆角；内链接用正文链接色。
- **侧栏 active**：只保留 `--accent` 左轨与正文色，不加浅底、不加圆角；右目录 active 同策略（正文色 + 色条，`!important` 压住 Quarto 写死的亮蓝，暗色不得漏亮蓝）；侧栏与目录焦点环用中性灰，正文焦点环用动作色。
- **列表与折叠**：marker 用 `--text-secondary`，折叠三角用正文色；答案盒子只用上下 hairline，不做卡片。
- **首页目录**：不是卡片；每行一条顶线、透明底、无圆角，一行最多两列；单张卡占满整行，序号 `01` 起、动作链接靠右下，窄屏动作移到提要下方；hover 只把顶线换成 `--accent`。
- **章节翻页**：一条顶线 + 左右两个文字链接，不用边框卡片；箭头用 `<` / `>`，hover 才转 `--accent`，下一页右对齐。箭头用字符而不用 SVG 是量过的：Bright 的 `<` `>` 墨迹中心在 0.23em，与同行西文同一轴，没有面包屑 `>` 那种偏高，换 SVG 反而要另配基线。
- **章节线**：标题不画线。全书只有一种横线——通栏 1px `--card-border` 发丝线，只出现在顶栏底边、引用块上下边、表格 booktabs、首页目录每行顶线、翻页顶线、页脚顶线、答案折叠线；`h2::after` 的 2.25rem 短发丝线已删除（连同首页 `.feature-grid` 例外），章节节奏只靠 H2 的 `margin-top: 3.25rem` 与字号台阶。约定改动时同步本节与 `css/base.css`。
- **引用块**：上下各一条 1px `--card-border` 横线、正文色、无底色、无左右竖条；与 Callout 的 2px 左色条区分开（后者是类型标记，不是分隔线）。
- **表格**：`display: table` + `table-layout: fixed` 吃 `tbl-colwidths`；`width: 100%` + `box-sizing: border-box` + `margin-inline: 0` 让表外框与代码块外框同宽、左右边缘对齐；单元格 `padding: 0.7rem 1.25rem`，首列因此离开表的左缘。表头与表体同一列对齐：文本列左对齐，数字列右对齐，表头跟随该列；垂直方向表体格子顶对齐（`vertical-align: top`），表头文字在格内居中（`vertical-align: middle`）。`display: block` 不行：外层块占 100%，里面的匿名表按内容收缩，表会变窄。宽表由 Quarto `.responsive` 类包成 `.table-responsive` 外层滚动容器；包内表改回 `table-layout: auto` + `width: max-content`，否则 fixed + 100% 永远不会溢出、滚动条是死的。不需要 JS 量列宽。表题走 `caption-side: top`、左对齐、14px `--text-secondary`；`table-striped` 压平成与普通行同底。
- **脚注**：区块顶部一条 1px `--card-border`、`margin-top: 3rem`、14px / lh 1.7、`--text-secondary`；回跳箭头随正文链接色。
- **任务列表**：`input[type=checkbox]` 用 `accent-color: var(--action-color)`，不用系统蓝。
- **图片**：正文图与坐标图圆角一律 `--radius-sm`（3px），不用 6px 大圆角；图注选择器同时覆盖 `figure figcaption`、`.quarto-float-caption`、`.figure-caption`（`lang: zh` 后 Quarto 生成「图 3.1: …」，`lang` 必须写在 `_quarto.yml`，否则图/表题回落英文 Figure/Table）。
- **图片灯箱**：`format.html.lightbox` 打开后 GLightbox 默认 0.7 黑遮罩，页面图注会从图后透出；主题把遮罩加深到 0.86、关闭/翻页按钮做成 32% 黑的圆钮白描边。透明底 SVG 必须垫白卡（`img[src$=".svg"]`），否则深色遮罩上会整幅消失；位图不加白边。
- **顶栏品牌标**：`palettes/<name>/brand-mark.svg` 作 `mask`、以 `--navbar-fg` 上色；外形是同一枚「打开的书」，16px 仍可辨。标签页用同目录 `favicon-light.svg` / `favicon-dark.svg`，`book.favicon` 指 Flexoki light，其余五份随 `resources` 发布，`palette.html` 按色板与明暗换 href。图标高 1.25rem、与标题间距 0.5rem，`margin-bottom: 0.2rem` 对齐汉字基线；窄屏先压搜索再省标题：`≤420px` 只留书标，图标长到 1.375rem 并撤掉那条抬升，书名改成视觉隐藏（`clip-path: inset(50%)`）而不是 `display:none`——这枚链接仍是「回到首页」，读屏必须能读出书名。次级导航的面包屑在首页与部首页只有一项（书名或部名），紧挨品牌重复一遍，用 `:has(> li:only-child)` 整条收起，只留侧栏开关；两项以上的章节轨迹才显示。
- **顶栏搜索**：Quarto 的 Algolia detached button 自带 `svg.aa-SubmitIcon`，主题不再给 `#quarto-search` 画伪元素放大镜；按钮 32×32、图标 18px、用 `--navbar-muted` 上色，hover 用 `--navbar-hover-bg`。浮层容器、表单和输入框都用纸面/正文令牌，输入框需用与 Quarto 同等长的选择器（`.aa-DetachedContainer .aa-DetachedFormContainer .aa-Form .aa-InputWrapper .aa-Input`）压过编译期暗色值；占位文字用 `--text-secondary`，取消按钮 `white-space: nowrap`，结果选中项用 `--surface-raised`。`≤575.98px` 时浮层收成贴顶通栏，左右无圆角，避免 Quarto 的桌面 `top:100px` 把搜索条压在正文中部。
- **色板切换**：`.palette-picker` 是 select-only combobox——按钮 `role="combobox"` + `aria-haspopup="listbox"`，面板 `.palette-menu-list` 为 `role="listbox"`，选项 `role="option"`；焦点留在按钮上，用 `aria-activedescendant` 指当前项。闭合态是 2rem 高胶囊：色点 + 英文名（Flexoki / Solarized / Hill Light）+ 方向箭头；展开后三行「色点 + 名称」，当前项右侧打勾。键位照 APG：↑/↓/Home/End 移动、首字母跳转、Enter 或 Space 提交、Esc 无提交关闭、Tab 关闭并走开。名称用英文，与 `book-palette` 的取值和色板目录同名，不另起中文译名。选择仍写 `book-palette`，首屏恢复逻辑不变，样式在 `css/nav.css`。不用原生 `<select>`（暗色下会保持系统浅色下拉）。
- **明暗圆钮**：Quarto 自带的是 16px「开关」位图（`bi-toggle-off/on` 的 data-URI `background-image`，填充色写死在 SVG 里），紧挨色板胶囊时两枚圆角疙瘩容易看混。主题把 `::before` 改成只做 `mask`、颜色吃 `currentColor` 的对比圆盘（描边 1.2、半径 6.2，实心半圆让到描边内缘），`.alternate`（夜间）旋转 180°，实心半圆换边；可点区域 44px、图标 16px。
- **四时辰**：山光选中时，胶囊右侧再出 `role="radiogroup"` 分段（`.mode-picker`）：12px 线性图标 + 中文名（晓雾 / 午荫 / 暮烟 / 夜月，默认按 `byHour()` 就近选），roving tabindex、方向键移动并即时应用；切到其他色板即隐藏，Quarto 的明暗圆钮在山光下让位。`≤575.98px` 四时保持图标+短名，`≤419.98px` 先收掉仓库源图标，把宽度留给色板与四时，搜索不下行。
- **侧栏折叠箭头**：Quarto 的 `.sidebar-item-container` 是 `space-between`，part 标题那条规则又给链接 `flex: 1 1 0%`，箭头因此被推到侧栏最右缘、离标题一大片空白。主题把容器改 `justify-content: flex-start`，并用 `:has(> .sidebar-item-toggle)` 只收窄带箭头的行，箭头紧跟标题；不带箭头的 part 标题仍保持通栏底色。
- **color-scheme**：浅色声明 `light`，深色由 `body.quarto-dark` 覆盖，避免系统偏好渗入控件与内嵌 SVG。
- **纯文本代码块**：与语言块共用 `--code-*`；`text` 不启用语言 token。
- **公式**：MathJax 会把 `font-size: 94%` 写进 `mjx-container` 行内 style，主题用 `#quarto-document-content mjx-container { font-size: 1em !important }` 拉回与正文同档（17px），display 公式上下各留 1.3rem；行内公式与中文同基线，无需额外对齐。
- **代码标注**：`.code-annotation-gutter` 底色透明；行内编号与注释列表编号统一成 11px 描边圆圈，描边与数字用 `--accent`，注释正文 14px `--text-secondary`。Quarto 自带的 `code.sourceCode .code-annotation-anchor` 特异性高于主题同名单类选择器，覆盖必须写 `#quarto-document-content code.sourceCode .code-annotation-anchor`。
- **代码工具**：`.btn.code-tools-button` 是引导性小按钮（13px、`--text-secondary`、透明底、hover `--surface-raised`）；它打开的是 Bootstrap 模态 `#quarto-code-tools-source`，模态面板用 `--surface-raised` 底 + `--card-border` 边 + `--radius-lg`，标题用黑体，内容区用 `--code-bg`（里面展示的是源文件），遮罩用 `--overlay-scrim`。Quarto 1.10.19 下 `code-fold` 不生成折叠加壳（只有 JS 残留），折叠样式无为而治，不要为它写选择器。
- **`.code-caption`**：次要说明色，紧贴对象；写作见 writing-quarto `authoring.md`。
- **可折叠答案**：`details.answer-disclosure` 默认收起，用上下发丝线、无圆角、无底色，像书页里的自测折页。
- **图**：Mermaid 与坐标图用令牌着色、字体随 `--ui-font`；围栏 `%%{init}%%` 用同栈短版；暗色不为白底图加滤镜。
- **令牌纪律**：样式里每个 `var(--…)` 都必须是色板 `tokens.css` 定义过的令牌。检查器新增断言 `css tokens all defined`，扫主题全部 `.css`/`.scss` 的 `var(--x)` 并减去所有 `--x:` 定义，不允许发明不存在的令牌（曾出现 `--text-primary`、`--surface`、`--text-tertiary` 这类「看着像有、实际透明」的引用，控件失去颜色还不报错）。
- **面板宽度与触摸目标**：交互面板宽度 `width: min(100%, 27rem)`，棋盘三列改成 `repeat(3, minmax(0, 1fr))` + 格子 `aspect-ratio: 1`，格子随卡片等比缩放（1280/768 → 121px，430 → 112，390 → 99，360 → 89，320 → 75），不再用 `vw` 猜屏宽；色板菜单项在 ≤575.98px 抬到 36px 一行、四时图标按钮 `min-width/min-height` 至少 24×28，菜单与胶囊都不出视口；源码模态 ≥576px 封顶 `min(1000px, 100vw - 2rem)` 并留 1rem 边距；行内代码在窄屏允许 `pre-wrap`，避免 `std::array<…>` 这类无空格类型名把正文列顶宽。
- **书页内交互面板**（cpp-board-games「运行效果」）：面板本体是 `--surface-raised` 底 + `--card-border` 边的圆角卡；反馈行做成留言条——细边框 + 2px 左色条 + 状态点，`data-kind` 分 hint/warn/success 换色，不用裸灰字；「输入坐标」是模式开关，关闭时无框次要色、展开时 `--action-color` 描边并以 `aria-expanded` 同步；坐标输入行给 `行列` 等宽标签 + 两个数字位 + 「落子」按钮，帮助句常驻、报错时用 `:has()` 让帮助句让位、错误行带描边圆圈感叹号；程序输出是独立的终端窗（三点 + 标题 + 文件名 + 展开箭头，命令行走等宽字体），与面板之间留一道间隔，不再用原生 `details` 三角。
- **打印**：`pre` 恢复折行；屏幕横向滚动规则不动。
- **高对比偏好**：`prefers-contrast: more` 段与常规模式保持同一套强调与边框色。

## 设计来源

Quarto Book 三栏；编译默认色板 `palettes/flexoki`（Flexoki Light / Dark），`palettes/solarized` 与 `palettes/hill-light`（山光四时）供读者运行时切换。实现为 Bootstrap cosmo/darkly + 主题 CSS。字体依据见标识 `bg-reading-surface-v1` 的知识文件。

## 主题结构与装配

官方字段见 Quarto HTML format reference。下列路径与装配顺序是本项目约定。

### 文件职责

| 文件 | 放什么 | 不放什么 |
|---|---|---|
| `palettes/<name>/theme-*.scss` | `$primary`、`$callout-color-*`、字体栈等 | 组件规则 |
| `palettes/<name>/tokens.css` | 明暗语义颜色；Flexoki 挂 `body` / `body.quarto-dark`，Solarized 挂 `html[data-palette="solarized"]`，山光挂 `html[data-palette="hill-light"][data-mode="…"] body` | 结构尺度 |
| `palettes/<name>/brand-mark.svg` | 顶栏 mask 用的纯黑书标剪影 | 第二套外形、字母或折角 |
| `palettes/<name>/favicon-*.svg` | 明暗两份「打开的书」标签图标 | 运行时改色、`prefers-color-scheme` |
| `palettes/<name>/syntax.css` | Solarized 与山光的 `code span.*` 语法色覆盖 | 结构尺度、布局 |
| `palettes/<name>/meta.md` | 来源、highlight 映射、图标接线 | 运行时 CSS |
| `css/fonts.css` | `@font-face` 声明 | 字体栈选择 |
| `css/tokens.css` | 字号、半径、字体栈、`--content-width`、`color-scheme` 基线 | 色值、选择器 |
| `css/*.css`（除 tokens） | 组件规则；顺序 = `_quarto.yml` 的 `css:` | Bootstrap 变量 |

### 切换色板

默认（编译期）色板固定为 `flexoki`：

1. `_quarto.yml` 的 `theme.light/dark` 指到 `palettes/flexoki/theme-*.scss`。
2. `css:` 列表先写 `palettes/flexoki/tokens.css`，再写 `palettes/solarized/tokens.css`、`palettes/solarized/syntax.css`、`palettes/hill-light/tokens.css`、`palettes/hill-light/syntax.css`；顺序决定覆盖关系。
3. `highlight-style` 指到 Flexoki 目录的两份 `.theme`。
4. `include-in-header` 加 `includes/palette.html`：首屏恢复 `book-palette`（含山光的 `book-hill-mode`）与明暗，并按 `link[rel~="icon"]` 的现有相对前缀换 favicon。
5. `book.favicon` 指 `palettes/flexoki/favicon-light.svg`，另外三份 favicon 加进 `resources`；`footer.html` 的观察器在明暗/色板变化后再同步一次 favicon 与 theme-color。
6. 跑 `checking-layout.py`：色值按活跃 pack 表，并始终核 Solarized 覆盖层；`checking-dom.py` 的 C4 核四份 favicon 已发布。

Solarized 是运行时层，不进 `_quarto.yml` 的 theme/highlight-style：读者选择写 `html[data-palette="solarized"]`，`palettes/solarized/tokens.css` 覆盖语义色，`syntax.css` 覆盖 `code span.*`。它的 tokens 都带选择器前缀，因此不能直接当编译默认；要整本编成 Solarized，需要另做无前缀的 tokens 版本，再换 `theme` 与 `highlight-style`。

山光同样是运行时层，但比 Solarized 多一层状态：Quarto 只能编译一对 light/dark，山光有四种时辰（晓雾 / 午荫 / 暮烟 / 夜月，前三浅纸、夜月暗纸），所以四种模式全部由 `html[data-mode]` 在运行时选择，`tokens.css` 与 `syntax.css` 都带 `html[data-palette="hill-light"][data-mode="…"]` 前缀。

山光需要让 Quarto 的基座跟着时辰走：`includes/palette.html` 在 `<head>` 里按已存模式写 `quarto-color-scheme` 哨兵（夜月写 `alternate`，其余写 `default`），让 Quarto 的 before-body 脚本首帧就挂对 `quarto-light` / `quarto-dark`；运行时再由 `syncBase()` 调 `window.quartoToggleColorScheme()` 把 `body` 类与 `data-mode` 对齐（`applyPalette` / `applyMode` / 跨页恢复都会调）。夜月的 `body` 另声明 `color-scheme: dark`，滚动条与原生控件才跟着变暗。山光下 `includes/palette.html` 还会隐藏 Quarto 的明暗圆钮（明暗由时辰决定），并在色板分段右侧显示四时辰分段；favicon 的 `dark` 版本对应夜月。打印时夜月回落晓雾令牌（`tokens.css` 末尾的 `@media print`），纸面不出现深底。完整取值、对比度与偏离理由见 `palettes/hill-light/meta.md`。

### 页面结构约定

- 垂直节奏由正文容器与 section 的 `* + *` 控制，不对 `pre`/`p` 另设 `margin-bottom`。正文间距收成四档，档位按「两块内容是不是同一件事」取：**粘连 0.5rem**（标题→首段/列表、标题→callout、caption→其代码块）、**相关 1rem**（代码块↔caption、代码块↔callout、列表内代码块→验证句）、**换段 1.4rem**（段落/列表/代码块默认）、**换节 3.25rem**（h2 之前；h3/h4/h5 之前 2.25rem）。h2 的 `margin-bottom` 与相邻 margin-top 折叠取大者，设 0.5rem 避免粘连档被抬高一倍。档位依据见标识 `bg-reading-surface-v1` 的知识文件。
- 顶栏与页面同底 + 底发丝线，用 `--navbar-*`。
- 正文链接常态与正文同色（Flexoki 墨色 / Solarized base01 / base1 / 山光墨色）+ 细下划线，hover 才转 `--link-hover-color`；不加 `:visited` 紫色。
- 表格用 booktabs：表头顶/底 1px、表头下 1px、无竖线、无斑马纹、tbody 无行线；`tbody` 末行底边也是 1px，与全站唯一的发丝线粗细一致（1.5px 已全部收回 1px）。
- 遮罩（搜索浮层、窄屏左栏）统一用 `--overlay-scrim`，亮色 0.42、暗色 0.62；不在组件里写 `rgba(0,0,0,*)`。
- 打印：`@page { size: A4; margin: 18mm 16mm }`；`pre` 恢复折行、不打印外链 URL；`figure` / `.callout` / `blockquote` 设 `break-inside: avoid`，`thead` 设 `display: table-header-group`；夜月打印回落晓雾令牌。
- 导航「Search / Source Code」英文默认值由 `includes/footer.html` 按 zh 同义补齐，只替换英文原文。

### 新增 callout

1. 活跃 palette `tokens.css` 加 border/bg（亮暗各一对）。
2. 同 pack `theme-*.scss` 加 `$callout-color-*`。
3. `callouts.css` 加 `.callout.callout-<name>`。
4. 新语义写入本节令牌索引。

### 校验与高亮约定

- `checking-layout.py` 校验令牌与布局；发布用 `1280/768/390/360` 明暗与触屏、窄屏浮层。
- 高亮由 `_quarto.yml` 提供且与 palette `meta.md` 一致（默认 `palettes/flexoki/highlight-light.theme` / `highlight-dark.theme`，取色自 Flexoki 官方 VS Code 主题）；Solarized 的语法色由 `palettes/solarized/syntax.css` 在 `html[data-palette="solarized"]` 下覆盖，山光的由 `palettes/hill-light/syntax.css` 在 `html[data-palette="hill-light"][data-mode]` 下覆盖，都不改编译配置。注释色必须在本书代码底（亮 `#F2F0E5`、暗 `#1C1B1A`）上达到 4.5:1：亮色注释用 `#575653`（6.42:1），暗色用 `#878580`（4.67:1）。
- `text` 与语言块共用字体尺度；标题块用 `.code-with-filename`。
- 对比度断言：`checking-layout.py` 的 `palette text contrast >= 4.5:1` 逐色板逐模式检查六对——正文/次要/链接/代码前景对各自底色，外加行号对代码底、代码标题字对标题条；`prefers-contrast: more` 段跳过（那里本就更高）。山光行号原值 4.19–4.25:1（辅助信息，压一档到 4.6 以上），Solarized 代码标题字由派生表面配深/浅一档（亮 4.96、暗 5.55），理由记在各自 `meta.md` 的偏离表。
- 语法彩色 token 不在断言范围：Solarized 官方的注释 2.34、字符串 4.12、数字 2.97 属于调色板特征，只抬注释与标识符到可读线；山光派生语法色 4.19–4.36 同理，提高通道走 `prefers-contrast: more`。
- `checking-dom.py`：C0 palette↔highlight；复制按钮兄弟 DOM；触屏/打印；C4 四份 favicon；Mermaid SVG。
