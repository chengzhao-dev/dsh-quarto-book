# 主题系统（设计令牌与文件结构）

## 令牌与色板（定颜色）

令牌语义与流程见本文件。**颜色**只写在 `palettes/<name>/tokens.css`、同目录的品牌标/标签图标（`brand-mark.svg`、`favicon-light.svg`、`favicon-dark.svg`）与编译期 `palettes/<name>/theme-*.scss`（`$primary`、`$body-color`、`$callout-color-*` 等 Bootstrap 变量，只有默认色板参与编译）；Solarized 与山光的语法色是仅有的 CSS 例外，写在各自的 `palettes/<name>/syntax.css`。**结构尺度**（字号、半径、字体栈、`--content-width`）与不随明暗/色板变化的界面 chrome 常量（灯光箱遮罩与按钮、色板身份色点）写在 `css/tokens.css`。数值以 `css/tokens.css` 与组件 CSS 为准；本文件的表是方便阅读的复述，调值必须同轮同步资产。

编译默认色板是 `palettes/flexoki`（Flexoki Light / Dark）；`palettes/solarized` 与 `palettes/hill-light`（山光四时：晓雾/午荫/暮烟/夜月）是运行时可选覆盖层，不参与编译。每个色板目录带同一枚「打开的书」品牌标与明暗两份标签图标；书标外形全站一份，颜色随色板。换默认色板须同步这些落点：`_quarto.yml` 的 pack SCSS 与 `syntax-highlighting`、`palettes/<name>/tokens.css` 与 `theme-*.scss`、`includes/palette.html` 的 `PALETTES`、`PALETTE_LABELS`、favicon 正则与 `meta-theme-color` 补位、`includes/footer.html` 的 theme-color 兜底纸色、`css/nav.css` 的三组色板面板色与品牌标 mask、`css/tokens.css` 的 `--swatch-*`、`scripts/checking-layout.py` 的期望值表；共享组件 CSS 不动。

### 令牌索引

| 语义 | CSS 变量 | 使用边界 |
|---|---|---|
| 页面底色 / 浮起面 | `--page-bg` / `--surface-raised` | 页面与抬升表面 |
| 正文最大宽度 | `--content-width` | 正文容器上限，不是段落二次限宽 |
| 正文 / 次要文字 | `--body-color` / `--text-secondary` | 正文层级 |
| 正文强调 / 链接 | `--emphasis-color` / `--link-color` / `--link-hover-color` / `--text-link` | 强调不用链接色。Flexoki 与山光的链接常态与正文同色，hover 才用 `--link-hover-color`；Solarized 按官方 rebase 把链接固定在 base01 / base1，强调另取 base02 / base1，避免与链接同色 |
| 代码外观 | `--code-*` / `--code-title-*` | 语言块、纯文本块与代码标题 |
| 表格 / 卡片边框 | `--table-border` / `--card-border` | 分隔与边框 |
| 顶栏 | `--navbar-*` | 导航、搜索与主题切换 |
| 标题字面 | `--heading-font` | h1–h6、导航书名、卡片小标题；系统黑体栈 |
| 覆盖层遮罩 | `--overlay-scrim` | 搜索浮层、源码模态与窄屏侧栏遮罩 |
| 圆角 | `--radius-sm` / `-md` / `-lg` | 书页与卡片只用 3 / 4 / 6px 三档；胶囊与圆形控件用 999px / 50%，滚动条滑块用 4px，勾选、色点与键盘焦点环微圆用 2px；其余组件一律引用令牌 |

### callout 色（左条 + 无填充）

每个内置 callout 只有 `--callout-<type>-border` 会被组件消费；不再声明 `-bg` 令牌，填充由 `callouts.css` 写死 `transparent`。SCSS `$callout-*` 须与 border 同步，供编译期图标 data URI。条色用当前色板的语义色：Flexoki 的 note 取中性 `#6F6E69` / `#9F9D96`，tip 绿、warning 橙 `#BC5215` / `#DA702C`、important 紫、caution 红，暗用对应 accent-400；Solarized 的 note 取 base01 / base1，warning 用官方 orange `#CB4B16`。callout 是编辑注，不是彩色卡片。

### 强调、链接与明暗一致性

- 正文 `strong` 用「颜色 + 加粗」双重强调（`content.css`）：`font-weight: 700` 加 `font-synthesis: weight`——全站只有 Bright Medium 一个字面且 body 禁合成，合成只放开给 strong；强调色不取语法蓝：Flexoki 亮色与正文同墨色、靠合成字重区分，暗色更亮；Solarized 亮色深一档、暗色更亮。
- 列表里独占一段的 `strong`（如「出错的原因」）保持块级小标题，颜色用正文色，不走强调色。
- 链接里的加粗跟链接色走；代码文件名用自己的 `--code-title-fg`，不被 strong 强调色盖住。
- 行内代码与 `kbd` 保持「弱底 + 正文色」，不继承强调色。
- `prefers-contrast: more` 段把正文、代码/卡片/顶栏边框、强调与行号收紧到更深档，不换色相，也不把强调色改成语法蓝；目前只有 Flexoki 与 Solarized 实现该段，山光没有这一模式。
- 组件 CSS 不写语义色值或字面色（只引用令牌），明暗各写一套；切换后核对加粗、链接、链接里的加粗、列表小标题和代码文件名没有串色。

## 字体栈与字形来源（定字体）

正文与标题各一面。**正文**用 `LXGW Bright Medium`（Klee One 中笔画 + Ysabeau Office 西文，登记 `font-weight: 400`，`font-synthesis: none` 下不合成粗体）；**代码**用 `LXGW Bright Code`（Klee + Monaspace Argon）；**标题**（h1–h6、导航书名、首页卡片小标题）用 `--heading-font` 的系统黑体栈（`Noto Sans SC` → 思源黑体 → `PingFang SC` → `Microsoft YaHei` → system-ui），请求 600/700 时由系统字面真正加粗。取选理由、候选对比与字面实测见 `01-reading-surface.md`；这里只留可执行结论。

- 文件与预算：`assets/theme/assets/fonts/` 每字体一个 `*-common.woff2`（共 2 个），单页合计 ≤ 1.6 MB、≤ 5 个文件。
- 子集：沿用常用字表并覆盖全书正文与终端输出；生成方式 `pyftsubset --flavor=woff2 --no-hinting`。改结果文案或新增字符后，用 fontTools 读 woff2 cmap 复核（起因：子集共用字符表漏「胜」，结果行末字落到宋体）；`checking-layout.py` 的覆盖断言在未声明 unicode-range 时直接读 cmap。新增字符时，按同版本上游 TTF（Bright 5.528、Bright Code 2.922）保留现 cmap 并入新码位后重建，输出到插件与书内两份；跑页面矩阵时用 `NODE_PATH` 指向插件的 `node_modules`。
- 覆盖范围不只汉字：西文标点、数学/箭头、制表符、几何图形与全角形式（U+FF01–FF5E）同在断言内（`GLYPH_RANGES`）。漏一个字不会被发现，却会静默回落到系统 CJK 字体，按 0.5em 的中线画出——正文 `+` 墨迹在 0.23em，「++」会显得浮在汉字上方。表情符号（≥U+1F000、U+2600–U+27BF）按设计走系统 emoji，不在断言内。
- 不逐符号位移：Bright 的数字、括号、`× ÷ = +` 共用同一条数学轴（+ 中心 0.23em，汉字 0.357em）。只抬 `++` 会脱离同行的符号，所以 `.plus-align` 这类 `translateY` 已删除；对齐问题只在字形缺失时补码位。
- 同步点：改字体须同步 SCSS、tokens、fonts、OFL、资产与 `checking-layout.py`；Mermaid 的 `%%{init}%%` 与坐标图脚本的 `FONT_FAMILY` 用同栈短版（`LXGW Bright Medium, system-ui, sans-serif`），保证测量与渲染一致。
- 栈尾 CJK 系统字体后备（PingFang SC、Microsoft YaHei、Noto Sans CJK SC、Source Han Sans SC）保留，缺字时落系统黑体而不是浏览器默认宋体。
- 排除清单与 OFL 政策见 `01-reading-surface.md`；Roboto/Segoe UI 不进 `assets/theme/assets/fonts/`。

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
| 表头 / 表体 | 15px（0.9375rem）/ 16px，表头正文色 |
| 代码标题 | 12px（0.75rem）/ `--code-title-fg` |
| H5 | 14.4px（0.9rem）|
| H6 | 13.6px（0.85rem）|

Bootstrap 组件沿用 SCSS 的 `$line-height-base: 1.75`，正文与代码另覆盖为 1.85 / 1.7。组件字号不进正文台阶：首页卡片标题 17px、CTA 13px、「规划中」11px、代码说明 14px、模态标题 17px。它们与正文流分开维护，改动仍要过 `01-reading-surface.md` 的对比度验收。

- 层级靠「字号台阶 + 字面分工」：正文只有楷体一面，标题与导航书名用黑体栈，`font-weight: 600` 只在黑体上有视觉意义；正文内的 `strong` 仍走合成加粗（见「强调、链接与明暗一致性」）。
- 正文 17px / 行高 1.85，代码 15px / 1.7；章节分隔靠 H2 的 `margin-top`，无通栏底线。≤767.98px 时整站正文降到 16px（`base.css` 断点），字号台阶比例不变。
- `grid.body-width` 是正文列上限（现 300+872+272+2×16=1476 封顶）；Quarto 会从 body-width 中减去两侧各 1rem 的栅格内边距，正文内容列 = body-width − 32px（现 840px）。取 872px 是让代码块 100 列（15px 下约 782px）与行号仍有富余的最小配置。取值只在 `_quarto.yml`，`--content-width` 只限正文容器；禁止 `75ch` 二次限宽。
- 代码块不折行：`white-space: pre` + 块内横向滚动（`_quarto.yml` 的 `code-overflow: scroll`）；窄视口整页不出横向滚动条，打印时恢复折行（`code.css` 的打印规则）。
- ≤991.98px 左栏浮层必须不透明实底（规则在 `assets/theme/css/sidebar.css` 的 991.98px 媒体查询）。
- 栏与栏之间不画竖墙：桌面三栏靠 `#quarto-header` 下一条通栏 1px `--card-border` 分隔，左右两栏在桌面没有 `border-right`（Quarto `sidebar.border` 的竖线被 `#quarto-sidebar.sidebar.sidebar-navigation { border-right: 0 !important }` 压掉）；`≤991.98px` 的浮层右缘 1px 是抽屉边，不是栏间墙。
- 右目录每条的 1px 左轨、当前项 2px `--accent` 色条，以及左栏当前项的左色条都保留：它们标的是「读到哪一节」，不是栏边界。

## 组件约定（定组件）

- **代码块**：弱底 + 细边。有 `filename` 时用标题条，复制钮右上角；复制钮图标用 `--text-secondary`，边框用 `--copy-btn-border`（暗色下按钮底与代码底同色，边框太暗图标会沉进去）。
- **Callout**：2px 左条、无填充、无圆角；标题 13px、字距 0（汉字等宽，加字距只把词拉散）、正文色；正文 16px；内链接用正文链接色。规格与五类清单见本节开头的 Callout 段。
- **侧栏 active**：只保留 `--accent` 左轨与正文色，不加浅底、不加圆角；右目录 active 同策略（正文色 + 色条，`!important` 压住 Quarto 写死的亮蓝，暗色不得漏亮蓝）；侧栏与目录焦点环用中性灰，正文焦点环用动作色。
- **列表与折叠**：marker 用 `--text-secondary`，折叠三角用正文色；答案盒子只用上下 hairline，不做卡片。
- **首页目录**：不是卡片；每行一条顶线、透明底、无圆角，一行最多两列；单张卡占满整行，序号 `01` 起、动作链接靠右下，窄屏动作移到提要下方；hover 只把顶线换成 `--accent`。
- **章节翻页**：一条顶线 + 左右两个文字链接，不用边框卡片；箭头用 `<` / `>`，hover 才转 `--accent`，下一页右对齐。箭头用字符而不用 SVG 是量过的：Bright 的 `<` `>` 墨迹中心在 0.23em，与同行西文同一轴，没有面包屑 `>` 那种偏高，换 SVG 反而要另配基线。
- **引用块**：上下各一条 1px `--card-border` 横线、正文色、无底色、无左右竖条；与 Callout 的 2px 左色条区分开（后者是类型标记，不是分隔线）。
- **表格**：`display: table` + `table-layout: fixed` 吃 `tbl-colwidths`；`width: 100%` + `box-sizing: border-box` + `margin-inline: 0` 让表外框与代码块同宽；单元格 `padding: 0.7rem 1.25rem`。表头与表体同列对齐：文本左、数字右，表头跟随；表体顶对齐，表头格内居中。宽表由 Quarto `.responsive` 包成 `.table-responsive` 滚动容器，包内表改 `table-layout: auto` + `width: max-content`。表头底色取 `--table-border` 的 24%，行 hover 10%；表体 16px。表题 `caption-side: top`、左对齐、14px `--text-secondary`；`table-striped` 仅显式加类时启用，交替底色用 `color-mix`；默认无条纹。上下间距沿用换段 1.4rem，不另写 margin。
- **脚注**：区块顶部一条 1px `--card-border`、`margin-top: 3rem`、14px / lh 1.7、`--text-secondary`；回跳箭头随正文链接色。
- **任务列表**：`input[type=checkbox]` 用 `accent-color: var(--action-color)`，不用系统蓝。
- **图片**：正文图与坐标图圆角一律 `--radius-sm`（3px），不用 6px 大圆角；图注选择器同时覆盖 `figure figcaption`、`.quarto-float-caption`、`.figure-caption`（`lang: zh` 后 Quarto 生成「图 3.1: …」，`lang` 必须写在 `_quarto.yml`，否则图/表题回落英文 Figure/Table）。
- **图片灯箱**：`format.html.lightbox` 打开后 GLightbox 默认 0.7 黑遮罩，页面图注会从图后透出；主题把遮罩加深到 0.86、关闭/翻页按钮做成 45% 黑的圆钮（hover 70%）、图标白色。透明底 SVG 必须垫白卡（`img[src$=".svg"]`），否则深色遮罩上会整幅消失；位图不加白边。
- **顶栏品牌标**：`palettes/<name>/brand-mark.svg` 作 `mask`、以 `--navbar-fg` 上色，外形是同一枚「打开的书」。标签页用同目录 `favicon-light.svg` / `favicon-dark.svg`，`book.favicon` 指 Flexoki light，其余五份随 `resources` 发布，`palette.html` 按色板与明暗换 href。`≤420px` 只留书标，书名视觉隐藏（`clip-path: inset(50%)`）而不用 `display:none`。面包屑仅一项时用 `:has(> li:only-child)` 收起，两项以上才显示。
- **顶栏搜索**：Quarto 的 Algolia detached button 自带 `svg.aa-SubmitIcon`，主题不再画伪元素放大镜；按钮 32×32、图标 18px、用 `--navbar-muted` 上色。浮层与输入框用纸面/正文令牌，输入框需用与 Quarto 同等长的选择器压过编译期暗色值；`≤575.98px` 时浮层贴顶通栏，避免桌面 `top:100px` 把搜索条压在正文中部。
- **色板切换**：`.palette-picker` 是 select-only combobox（`role="combobox"`、`aria-haspopup="listbox"`、`aria-activedescendant`）；闭合态是 2rem 高胶囊：色点 + 英文名 + 方向箭头，展开后三行名称，当前项打勾。键位照 APG：方向键/Home/End、首字母、Enter/Space、Esc、Tab 关闭。名称与 `book-palette` 取值、色板目录同名。
- **明暗圆钮**：Quarto 自带的是 16px「开关」位图（`bi-toggle-off/on` 的 data-URI `background-image`，填充色写死在 SVG 里），紧挨色板胶囊时两枚圆角疙瘩容易看混。主题把 `::before` 改成只做 `mask`、颜色吃 `currentColor` 的对比圆盘（描边 1.2、半径 6.2，实心半圆让到描边内缘），`.alternate`（夜间）旋转 180°，实心半圆换边；可点区域 44px、图标 16px。
- **四时辰**：山光选中时出 `role="radiogroup"` 分段（`.mode-picker`）：12px 图标 + 中文名（晓雾/午荫/暮烟/夜月，默认按 `byHour()` 就近选），方向键移动并即时应用；切到其他色板即隐藏，Quarto 明暗圆钮在山光下让位。
- **侧栏折叠箭头**：`.sidebar-item-container` 改 `justify-content: flex-start`，用 `:has(> .sidebar-item-toggle)` 只收窄带箭头的行，让箭头紧跟标题；不带箭头的 part 标题仍保持通栏底色。
- **color-scheme**：浅色声明 `light`；Flexoki 的深色由 `body.quarto-dark` 覆盖，Solarized 由 `html[data-palette="solarized"] body.quarto-dark` 覆盖，山光夜月由 `html[data-palette="hill-light"][data-mode="night"]` 覆盖并在打印段改回 `light`；不要按单一 `body.quarto-dark` 改这三处。
- **纯文本代码块**：与语言块共用 `--code-*`；`text` 不启用语言 token。
- **公式**：MathJax 会把 `font-size: 94%` 写进 `mjx-container` 行内 style，主题用 `#quarto-document-content mjx-container { font-size: 1em !important }` 拉回与正文同档（17px），display 公式上下各留 1.3rem；行内公式与中文同基线，无需额外对齐。
- **代码标注**：`.code-annotation-gutter` 底色透明；行内编号与注释列表编号统一成 11px 描边圆圈，描边与数字用 `--accent`，注释正文 14px `--text-secondary`。Quarto 自带的 `code.sourceCode .code-annotation-anchor` 特异性高于主题同名单类选择器，覆盖必须写 `#quarto-document-content code.sourceCode .code-annotation-anchor`。
- **代码工具**：`.btn.code-tools-button` 是引导性小按钮（13px、`--text-secondary`、透明底、hover `--surface-raised`）；它打开的是 Bootstrap 模态 `#quarto-code-tools-source`，模态面板用 `--surface-raised` 底 + `--card-border` 边 + `--radius-lg`，标题用黑体，内容区用 `--code-bg`（里面展示的是源文件），遮罩用 `--overlay-scrim`。Quarto 1.10.19 下 `code-fold: true` 会生成 `<details class="code-fold">` 折叠加壳；项目启用时为标题、箭头与边框写样式，不启用时不要为它加选择器。
- **`.code-caption`**：次要说明色，紧贴对象；写作见 `../../writing-quarto/quarto/03-authoring.md`。
- **可折叠答案**：`details.answer-disclosure` 默认收起，用上下发丝线、无圆角、无底色，像书页里的自测折页。
- **图**：Mermaid 与坐标图用令牌着色、字体随 `--ui-font`；围栏 `%%{init}%%` 用同栈短版；暗色不为白底图加滤镜。
- **令牌纪律**：样式里每个 `var(--…)` 都必须是色板 `tokens.css` 定义过的令牌。检查器新增断言 `css tokens all defined`，扫主题全部 `.css`/`.scss` 的 `var(--x)` 并减去所有 `--x:` 定义，不允许发明不存在的令牌（曾出现 `--text-primary`、`--surface`、`--text-tertiary` 这类「看着像有、实际透明」的引用，控件失去颜色还不报错）。
- **面板宽度与触摸目标**：色板菜单项在 ≤575.98px 抬到 36px 一行、四时图标按钮 `min-width/min-height` 至少 24×28，菜单与胶囊都不出视口；源码模态 ≥576px 封顶 `min(1000px, 100vw - 2rem)` 并留 1rem 边距；行内代码在窄屏允许 `pre-wrap`，避免 `std::array<…>` 这类无空格类型名把正文列顶宽。棋盘三列、27rem 面板等书内业务尺寸不属于插件资产，写在消费书的项目技能里。
- **打印**：`pre` 恢复折行；屏幕横向滚动规则不动。
- **高对比偏好**：`prefers-contrast: more` 段沿用常规色相，只收紧正文、边框、强调与行号，规则见上节「强调、链接与明暗一致性」。

## 设计来源

Quarto Book 三栏；编译默认色板 `palettes/flexoki`，`palettes/solarized` 与 `palettes/hill-light`（山光四时）供读者运行时切换。字体依据见标识 `bg-reading-surface-v1` 的知识文件。

## 主题结构与装配

官方字段见 Quarto HTML format reference。下列路径与装配顺序是本项目约定。

### 文件职责

| 文件 | 放什么 | 不放什么 |
|---|---|---|
| `palettes/<flexoki|solarized>/theme-*.scss` | `$primary`、`$callout-color-*`、字体栈等 | 组件规则 |
| `palettes/<name>/tokens.css` | 明暗语义颜色；Flexoki 挂 `body` / `body.quarto-dark`，Solarized 挂 `html[data-palette="solarized"]`，山光挂 `html[data-palette="hill-light"][data-mode="…"] body` | 结构尺度 |
| `palettes/<name>/brand-mark.svg` | 顶栏 mask 用的纯黑书标剪影 | 第二套外形、字母或折角 |
| `palettes/<name>/favicon-*.svg` | 明暗两份「打开的书」标签图标 | 运行时改色、`prefers-color-scheme` |
| `palettes/<name>/syntax.css` | Solarized 与山光的 `code span.*` 语法色覆盖 | 结构尺度、布局 |
| `palettes/<name>/meta.md` | 来源、highlight 映射、图标接线 | 运行时 CSS |
| `css/fonts.css` | `@font-face` 声明 | 字体栈选择 |
| `css/tokens.css` | 字号、半径、字体栈、`--content-width`、`color-scheme` 基线、界面 chrome 常量 | 语义色值、选择器 |
| `css/*.css`（除 tokens） | 组件规则；顺序 = `_quarto.yml` 的 `css:` | Bootstrap 变量 |

### 切换色板

默认（编译期）色板固定为 `flexoki`：

1. `_quarto.yml` 的 `theme.light/dark` 指到 `theme/palettes/flexoki/theme-*.scss`。
2. `css:` 列表先写 `theme/palettes/flexoki/tokens.css`，再写 `theme/palettes/solarized/tokens.css`、`theme/palettes/solarized/syntax.css`、`theme/palettes/hill-light/tokens.css`、`theme/palettes/hill-light/syntax.css`；顺序决定覆盖关系。
3. `syntax-highlighting` 指到 `theme/palettes/flexoki/` 的两份 `.theme`。
4. `include-in-header` 加 `includes/palette.html`：首屏恢复 `book-palette`（含山光的 `book-hill-mode`）与明暗，并按 `link[rel~="icon"]` 的现有相对前缀换 favicon。
5. `book.favicon` 指 `theme/palettes/flexoki/favicon-light.svg`，另外五份 favicon 加进 `resources`；`footer.html` 的观察器在明暗/色板变化后再同步一次 favicon 与 theme-color。
6. 跑 `scripts/checking-layout.py --browser` 核色值与 `.theme` 高亮，再跑 `../../writing-quarto/scripts/checking-dom.py` 的 C0、C4。

Solarized 是运行时层，不进 `_quarto.yml` 的 theme/syntax-highlighting：读者选择写 `html[data-palette="solarized"]`，`palettes/solarized/tokens.css` 覆盖语义色，`syntax.css` 覆盖 `code span.*`。它的 tokens 都带选择器前缀，因此不能直接当编译默认；要整本编成 Solarized，需要另做无前缀的 tokens 版本，再换 `theme` 与 `syntax-highlighting`。

山光同样是运行时层，但比 Solarized 多一层状态：Quarto 只能编译一对 light/dark，山光有四种时辰（晓雾 / 午荫 / 暮烟 / 夜月，前三浅纸、夜月暗纸），所以四种模式全部由 `html[data-mode]` 在运行时选择，`tokens.css` 与 `syntax.css` 都带 `html[data-palette="hill-light"][data-mode="…"]` 前缀。

山光要让 Quarto 基座跟着时辰走：`includes/palette.html` 在 `<head>` 里按已存模式写 `quarto-color-scheme` 哨兵（夜月 `alternate`，其余 `default`），before-body 脚本首帧就挂对 `quarto-light`/`quarto-dark`；运行时 `syncBase()` 调 `window.quartoToggleColorScheme()` 对齐 `body` 类与 `data-mode`。夜月由 `html[data-palette="hill-light"][data-mode="night"]` 声明 `color-scheme: dark`，滚动条与原生控件跟着变暗；打印段在同一选择器改回 `light`。山光下 `nav.css` 用 `[data-palette="hill-light"]` 隐藏明暗圆钮，`palette.html` 只在色板分段右侧显示四时辰；favicon 的 `dark` 对应夜月，打印时夜月回落晓雾令牌（`tokens.css` 末尾 `@media print`）。完整取值与对比度见 `palettes/hill-light/meta.md`。

### 页面结构约定

- 垂直节奏由正文容器与 section 的 `* + *` 控制，不对 `pre`/`p` 另设 `margin-bottom`。正文间距收成四档，档位按「两块内容是不是同一件事」取：**粘连 0.5rem**（标题→首段/列表、标题→callout、caption→其代码块）、**相关 0.9rem**（代码块↔caption、代码块↔callout、列表内代码块→验证句）、**换段 1.4rem**（段落/列表/代码块默认）、**换节 3.25rem**（h2 之前；h3/h4/h5 之前 2.25rem）。h2 的 `margin-bottom` 与相邻 margin-top 折叠取大者，设 0.5rem 避免粘连档被抬高一倍。组件内部微距只登记不立档：callouts 的 0.15/0.4/0.45rem、callout 相邻 1.6rem、代码工具按钮横向 0.45rem；表格、弹窗、折叠块的 padding/gap 按组件自身尺度。档位依据见标识 `bg-reading-surface-v1` 的知识文件。
- 顶栏与页面同底 + 底发丝线，用 `--navbar-*`。
- 正文链接常态与正文同色（Flexoki 墨色 / Solarized base01 / base1 / 山光墨色）+ 细下划线，hover 才转 `--link-hover-color`；不加 `:visited` 紫色。
- 表格用 booktabs：表头顶/底 1px、表头下 1px、无竖线、无斑马纹、tbody 无行线；`tbody` 末行底边也是 1px，与全站唯一的发丝线粗细一致（1.5px 已全部收回 1px）。
- 遮罩（搜索浮层、窄屏左栏）统一用 `--overlay-scrim`，亮色 0.42、暗色 0.62；不在组件里写 `rgba(0,0,0,*)`。
- 打印：`@page { size: A4; margin: 18mm 16mm }`；`pre` 恢复折行、不打印外链 URL；`figure` / `.callout` / `blockquote` 设 `break-inside: avoid`，`thead` 设 `display: table-header-group`；夜月打印回落晓雾令牌。
- 导航「Search / Source Code」英文默认值由 `includes/footer.html` 按 zh 同义补齐，只替换英文原文。

### 新增 callout

1. 活跃 palette `tokens.css` 只加 `--callout-<type>-border`（亮暗各一对）；不要建 `-bg` 令牌，填充由 `callouts.css` 写死 `transparent`。
2. Flexoki、Solarized 在 `theme-*.scss` 加 `$callout-color-*`；山光无 SCSS，直接在 `palettes/hill-light/tokens.css` 的四个 `[data-mode]` 块加 `--callout-*-border`。
3. `callouts.css` 加 `.callout.callout-<name>`。
4. 新语义写入本节令牌索引。

### 校验与高亮约定

- 高亮由 `_quarto.yml` 的 `.theme` 对与各色板 `syntax.css` 覆盖提供，不改编译配置；对应关系与取色见各色板 `meta.md`。注释色必须在本书代码底（亮 `#F2F0E5`、暗 `#1C1B1A`）上达到 4.5:1：亮色注释用 `#575653`（6.42:1），暗色用 `#878580`（4.67:1）。
- `text` 与语言块共用字体尺度；标题块用 `.code-with-filename`。`.theme` 里的 `bold` 声明被 `code.css` 的 `font-weight: 400` 统一压掉（本书只有一个字面，靠颜色区分层级），这是登记在案的偏离。
- 对比度断言：`checking-layout.py` 的 `palette text contrast >= 4.5:1` 逐色板逐模式检查六对：正文/次要/链接/代码前景对各自底色，外加行号对代码底、代码标题字对标题条；`prefers-contrast: more` 段跳过。具体现值与偏离理由见各色板 `meta.md`。
- 语法对比度另有一条断言：山光的注释与标识符逐时辰、Solarized 暗色的全部 30 个语法类都要对各自 `--code-bg` ≥4.5:1；Solarized 亮色按官方配色保留原值，不在这条断言里。山光其余语法色属调色板特征，逐项比值见各自 `meta.md` 的偏离表。
- `checking-dom.py`：C0 palette↔highlight；复制按钮兄弟 DOM；触屏/打印；C4 六份 favicon；Mermaid SVG。

### 运行时契约（不得改名）

`includes/palette.html` 与 `includes/footer.html` 靠以下名字协作，改名必须同轮改两个文件与本节：

- 全局：`window.__bookSyncFavicon`（footer 在 theme-color 同步后调用）、`window.__bookSyncBase`。
- 存储键：`book-palette`、`book-hill-mode`、`quarto-color-scheme`。
- 事件：`book-palette-change`，`detail` 为色板名；山光时辰切换也发同名事件。
- 函数：`applyPalette(value)`、`applyMode(value)`、`syncBase()`、`syncFavicon()`，唯一实现都在 `includes/palette.html`。
- 属性：`data-palette`（缺省表示 Flexoki）、`data-mode`（仅山光）、`body.quarto-dark`（Quarto 基座）。
- DOM：`meta#meta-theme-color`。`includes/fonts.html` 提供时沿用；只复制插件资产的新书由 `includes/palette.html` 在 head 补建，`footer.html` 只更新它的 `content`。

### 同步点

| 改动 | 必须同轮改的落点 | 断言 |
|---|---|---|
| 字号、间距、圆角、栏宽 | `assets/theme/css/tokens.css`、组件 CSS、本文件对应表、`01-reading-surface.md` 的理由 | `checking-layout.py` 的 SHARED_CHECKS |
| 色板取值 | `palettes/<name>/tokens.css`、`meta.md` 对比度表、`includes/palette.html` 的清单、`css/nav.css` 面板色、`css/tokens.css` 的 `--swatch-*`、本文件表格 | `checking-layout.py` 的 palette 对比度与 hill 模式检查 |
| 默认色板 | `_quarto.yml` 的 theme 与 syntax-highlighting、`book.favicon`、`resources` | `checking-dom.py` C0/C4 |
| 运行时名字 | `includes/palette.html`、`includes/footer.html`、本节 | 仓库内 grep 与浏览器实测 |
| 规则文字 | 本文件、`02-theme-spine.md`、`SKILL.md`、`01-reading-surface.md` | 无自动断言，评审时逐项对照 |

