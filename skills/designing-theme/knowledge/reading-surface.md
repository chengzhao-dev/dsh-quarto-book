---
kb_id: "bg-reading-surface-v1"
title: "阅读表面：字体、栏宽与强调"
domain: "visual-theme"
tags: [fonts, typography, layout, theme, readability, contrast]
level_range: [0, 5]
dependencies: []
created: "2026-10-10"
updated: "2026-10-22"
chunk_strategy: "semantic_heading"
estimated_tokens: 1500
---

# 阅读表面：字体、栏宽与强调

本文件回答这本书的阅读表面为什么这样定：正文字体、正文栏宽、窄屏行为与加粗/链接颜色。怎么做（改哪一步、动哪个文件）见 `designing-theme` 技能的 `references/theme-spine.md`，数值与实现见 `references/theme-system.md`。本文件只放理由。这套主题由本插件维护，不与其他仓库共享；项目若复制了资产，以项目 `_quarto.yml` 实际引用的副本为准。

## 正文为什么是 LXGW，标题为什么用系统无衬线

正文保持霞鹜文楷路线（楷体）：这本书是长时间连续阅读的技术书，楷体的笔画变化比几何无衬线更耐读；作者「文楷不适合超长正文」的评价针对的是屏幕上偏细的 Regular，不构成换字体的理由——用 Bright 的 Medium 解决偏细。

标题与导航改用系统无衬线栈（Noto Sans SC / PingFang SC / 微软雅黑），形成「黑体标题 + 楷体正文」的双字面。单一文楷时层级只能靠字号，H2/H3 与正文同面，章节入口不够清楚；标题都很短，不需要长文楷体的耐读性，无衬线的 600 字重和字面差能把层级拉开。正文不换黑体，长文仍由楷体承担。

### 为什么用系统字体栈，而不是新增字体文件

Noto Sans SC、PingFang SC、微软雅黑在主流桌面已经安装；系统栈不必再分发 17MB 的 CJK 字体，也守住「主题不新增字体文件」的约束。Windows 落到 Noto Sans SC，macOS 落到 PingFang SC，Linux 落到 Noto Sans CJK；缺少这些字体时回退到系统 sans，不落回正文楷体。字体文件仍只有 LXGW Bright Medium 与 Bright Code 两份。

### 为什么合并成一份 Bright Medium

旧方案是「Fixel Text（拉丁）+ 文楷 Screen（中文）」双字体拼接：Fixel 是几何无衬线、没有 400 字重，与楷体的笔形对不上；两套西文与中文各算各的基线，混排节奏不一致。LXGW Bright 本身就是「Ysabeau Office（西文，齐线数字）+ 文楷中等笔画（中文）」的合并字体，一个文件解决拼接问题；全站只挂这一个字面，层级靠字号，标题请求 600 时在全站 `font-synthesis: none` 下仍落到这一份，不合成假粗体。

### 为什么不用文楷 Screen 与系统西文

文楷 Screen 是给「系统里已有 Segoe/Roboto」的场景准备的：它的度量对齐 Roboto、Medium 笔画标成 Regular。本站中西文都自托管，继续「文楷 Screen + 另一套西文」会回到双基线拼接。Bright Code 的西文是收窄的 Monaspace Argon（与汉字宽约 1:2），所以代码字体保持 Bright Code 不变。

### 代码西文与正文西文为什么不是同一个设计

代码块的西文是 Monaspace Argon，正文西文是 Ysabeau，两者不是一套——这是配对理由，不是待修缺陷：文楷等宽配别的西文时楷体与西文不协调，Argon 是上游作者认为与楷体风格最接近的等宽字，西文经收窄再缩至 90%，与汉字 advance 成 1∶2，代码列按 1∶2 对齐。字重表有意错位：Bright Code 的 Regular 对应文楷 Medium；主题子集已用 fontTools 读 name 表核对为 LXGW Bright Code Regular（OS/2 weight 400），代码里的汉字笔画与正文同一档，不是「代码更细」。因此不因「代码西文与正文西文不同源」换字体，也不为对齐西文改用黑体路线的等宽字。字体配对调研曾建议换成 Maple Mono CN / Sarasa Term（连字与 OpenType 特性更全），但本书代码示例以棋盘与算法为主，用不到连字，Bright Code 的 1∶2 对齐与楷体笔画与正文同风格，换字体会让代码块的汉字笔画与正文脱节，故保持 Bright Code 不变；子集文件 641KB 也在 1.6MB 预算内。

### 数学轴上的 `+ - = × ÷` 为什么不抬到汉字中线

`++`、`+=`、`a + b` 里看起来「偏下」不是缺字：fontTools 读两份 woff2 的 cmap，`+ - = < > / * : ; ( ) [ ] { } ~ #` 码位全在子集里；墨迹框量出 `+ = × ÷` 的中心都在基线上方 `0.23em`，汉字「中」在 `0.357em`。差距来自字体把运算符放在数学轴上（x-height 的一半），而等宽代码里 `++c` 的 `c` 中心同样在 `0.23em`，`++` 与它齐平；`C`、`x` 的目测位置也按这条轴读。只把 `++` 下移会脱离同行的 `=`、`÷`、`<`、`<<`（代码里它们成组出现），所以 `.plus-align` 一类逐符号位移不采用，也不为对齐汉字中线改 `translateY`。同理 `<` `>` 在正文同样落在数学轴上、不偏高，章节翻页箭头就直接用这两个字符（`css/sidebar.css` 的 `.nav-page-previous/.nav-page-next` 伪元素），不用 SVG：换 chevron 反而要为它另配一套基线，且和正文里的 `<` `>` 不在同一条轴上。

### 排除的候选

Inter 不采用：正文与标题已经由文楷和系统无衬线分工，不引入第三套西文。思源黑体只以系统 Noto Sans SC 的身份用于标题/界面，不作为正文字面；正文仍是楷体。JetBrains Mono、Cascadia、Iosevka、Inconsolata 是代码字体（代码已有 Bright Code）。Roboto 与 Segoe UI 是 Apache/微软许可，不满足本书「只收 OFL 到 `assets/theme/assets/fonts/`」的政策；系统栈只调用已安装字体，不复制文件。旧式数字（Ysabeau Infant 一系）不适合和汉字混排，不用于这本书。

## 栏宽为什么是 872px（内容列 840px）

Bright Code 在 16px 下每个 ASCII 字符前进 8px；现在代码正文 15px（每字符约 7.5px），100 列加左右内边距与边框约 782px。Quarto 会从 `body-width` 中再减去两侧各 1rem 的栅格内边距（内容列 = body-width − 32px），`body-width` 仍取 872px、内容列 840px，给 16px 代码与行号留余量；不因代码缩到 15px 收窄正文。栏宽随代码列宽走而不是随显示器走：宽视口只增大外侧留白，正文行长保持在可读范围（WCAG 建议不超过约 80 个拉丁字母或 40 个汉字）。标题下的 description 副标题与正文段落同一内容列，不再用 `ch` 二次限宽（Bright 的西文是比例字体，`ch` 只量出半个汉字宽，会先于正文折行）。

## 正文间距为什么收成四档

全站块间距只有四档：粘连 0.5rem、相关 1rem、换段 1.4rem、换节 3.25rem（h3/h4/h5 前 2.25rem）。档位按「两块内容是不是同一件事」取：标题与它的首段、caption 与它描述的代码块是粘连；代码块与紧随的说明、callout 与上下文是相关；换一段是换段；换一节是换节。旧表里 1.375rem、1.55rem、0.625rem、0.75rem 这类只差 0.1rem 上下的值收进最近档：读者对 0.1rem 级差异不敏感，维护者却要为每个一次性值另想理由，间距表从此不再增长。h2 的 `margin-bottom` 与相邻 margin-top 折叠取大者，所以设 0.5rem 而不是 1rem——否则标题与首段的粘连档会被折叠抬高一倍。首页眉标 0.9rem 与 description 1.8rem 不在四档内：首页 Hero 是引导面不是正文容器，间距由首屏构图决定。

## 窄屏为什么只让代码块横向滚动

125%/150% 缩放后 CSS 像素变少，栏宽由 Quarto 按断点缩小；此时若代码跟着折行，同一行代码在宽窄屏上的断点不同，读者对照截图与本地输出时会错位。固定 `white-space: pre` + 块内 `overflow-x: auto`，代码行在任何视口下保持完整；正文段落照常折行。打印时横向滚动不存在，打印样式把 `pre` 恢复为折行，屏幕规则不动。内容列 840px 只比 834px 多 6px：若 Windows 滚动条或亚像素取整吃掉余量导致第 100 列被裁，再把 `body-width` 升到约 880px，不预先加宽。

## 加粗为什么仍合成且不用链接色

书里的 `**` 大量用作列表小标题（「出错的原因」「正确的做法」）和行内强调；正文的 Bright 只有一个字面，若同时去掉合成加粗和强调色，这些字与正文无差别（标题已改用黑体栈，加粗在标题上由系统字面真正完成；合成加粗只服务正文里的 `strong`）。因此：`strong` 保留 `font-synthesis: weight` 的合成（全站唯一放开点），配一个不取链接色的强调色：Flexoki 亮色与正文同墨色、靠合成字重区分，暗色更亮；Solarized 亮色深一档、暗色更亮。这样加粗必须和链接在明暗两套下都能区分。列表里独占一段的 `**` 小标题保持正文色块级形态，避免一列蓝标题；代码文件名、行内代码、kbd 各用自己令牌，不被强调色或链接色串染。

## 颜色与对比度的取值依据

编译默认色板是 Flexoki（亮纸 `#FFFCF0`、暗墨 `#100F0F`），Solarized 是读者运行时可选的第二套。两套都只换语义令牌和语法色，不换字体、栏宽与组件。Flexoki 的 callout 是编辑注：2px 左条、无填充、无圆角，note 取中性灰，其余用官方语义色（tip 绿、warning 橙、important 紫、caution 红）。文本对比度按 WCAG 2.2 的 1.4.3（4.5:1）校验：正文、强调、链接、13px 表头、14px 图注与代码标题在各自底色上低于 4.5:1 时升到更实的一档，不改成纯黑或纯白，也不借用语法蓝。链接本身不靠颜色，常态与正文同色并保留下划线；Solarized 的正文与注释抬到 4.5:1，链接回到官方 rebase（base01 / base1），页面底色、强调色与 callout 条保持官方值。

第三套是读者自己的「山光」四时色板（`palettes/hill-light`，取自 `D:\Github\hill-light\hill-light-theme` 的单一色值来源）：晓雾、午荫、暮烟三种浅纸与夜月一种暗纸。它不是照搬原站，而是过一遍本书的令牌契约：保留原站的色相与命名，按本书的 WCAG 4.5:1 校验抬了正文与表头，callout 类型色与代码语法色沿用本书的语义映射（原站的 callout 与代码几乎是单色）。四种时辰里只有夜月是暗色，所以它同时要驱动 Quarto 的 light/dark 基座——`includes/palette.html` 在首帧写 `quarto-color-scheme` 哨兵，运行时对齐 `body` 类；打印时夜月回落到晓雾令牌，纸面不出深底。

## 抬色记录与保留的低对比项

Flexoki 亮色注释从官方 `#6F6E69` 抬到 `#575653`（本书代码底 `#F2F0E5` 上 6.42:1），行号同步；暗色保持官方 `#878580`（`#1C1B1A` 上 4.67:1）。官方文档注释档（亮 `#B7B5AC` / 暗 `#575653`）分别只有 1.8:1 / 2.3:1，未采用。

Solarized 的正文与注释各抬一档：亮色正文/代码字/顶栏字 `#526C74`（纸 5.18:1，代码底 4.56:1）、亮色注释与行号 `#556C73`（代码底 4.54:1）；暗色正文 `#839496`（4.75:1）与暗色注释 `#93A1A1`（代码底 4.86:1）本来达标，不动。链接遵循官方 `rebase`：亮 base01 `#586E75`（纸 4.99:1）、暗 base1 `#93A1A1`（暗底 5.61:1），hover 才转官方蓝 `#268BD2` / `#51A0D5`；语法标识符蓝仍用抬过的 `#1B6EA3` / `#51A0D5`。页面底色 base3/base03、强调色 base01 与 callout 左条不改；官方蓝在亮纸 3.41:1、暗底 4.08:1，不作正文链接常态色。完整比值与取色理由见 `palettes/solarized/meta.md`。

## 明暗代码色跟哪一对主题

Flexoki 页面色与语法色同源：`palettes/flexoki/highlight-light.theme` / `highlight-dark.theme` 取自 Flexoki 官方 VS Code 主题的语法映射，`BackgroundColor` 与 `--code-bg` 相同（亮 `#F2F0E5`、暗 `#1C1B1A`），不使用 Quarto 内置的浅色/深色语法主题——那对是 2020 年的 skylighting 主题，按白底与旧深色底设计，叠在 Flexoki 代码底上会错层。

三处允许偏离官方语法映射，其余照抄：亮色注释从官方 `#6F6E69` 抬到 `#575653`（6.42:1）；暗色注释保持官方 `#878580`（4.67:1）；两套的 Normal 用页面正文色（亮 `#100F0F` / 暗 `#CECDC3`），与 `--code-fg` 一致。Solarized 不参与编译，Quarto 仍输出 Flexoki 的 token class，`palettes/solarized/syntax.css` 在 `html[data-palette="solarized"]` 下覆盖；语法蓝与注释用抬过的 `#1B6EA3` / `#556C73`（亮）与 `#51A0D5` / `#93A1A1`（暗），其余语法色仍官方 accent。Solarized 自己的两套 `.theme` 只作为整本色板编译的素材保留，当前渲染不使用。
