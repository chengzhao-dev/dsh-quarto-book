# 坐标轴网格图的生成约定

坐标轴类网格图（状态面板行列、二维数组下标）用共享绘图助手生成 SVG，不用 Mermaid 硬画网格。流程图与坐标图的分工、页面围栏写法、解释器与 CI 依赖见 `quarto/01-basics.md`「执行缓存与 CI 依赖」；token 预算的排除口径见 `steps/02-structure.md`「分层上限」。

## 与 Mermaid 的分工

- 默认图是 `{mermaid}` flowchart，表达调用链、分层与数据流（口径见 `quarto/11-mermaid.md`）。
- 坐标轴类网格图只走 `rendering-coords.py` 加 `{python}` 可执行单元；Mermaid 的节点文本排版不适合网格，禁止用它拼状态面板。
- Agent 作图边界：默认只生成 Mermaid 流程图；坐标图仅当用户明确指定时生成，且只改助手调用参数，不内联第二套 SVG 逻辑。

## 页面与单元写法

- 页面 frontmatter 开 `engine: jupyter`，只给含图页面开启，避免全书每次渲染都起 kernel。
- 坐标图单元用 ```` ```{python} ```` 围栏，块首写 `#| echo: false`、`#| warning: false`，再写 `#| fig-cap: "…"`（只写图意，编号由 Quarto 加）与 `#| fig-align: center`；图注文字概括图意，不与图后正文逐句重复，也不用 `>` 引用块另起一套图注。
- 没有执行环境或页面保持静态时，允许直接写原生 HTML/SVG；图必须用 `<figure class="book-figure">` 包住，`<figcaption>` 在图后。三类图的统一图注约定见 `quarto/09-figures.md`，不要把图注留成图前的独立段落。
- 单元内从当前目录向上定位含 `_quarto.yml` 的书根，按路径加载本技能 `scripts/diagrams/rendering-coords.py`，在单元里写 `coords_grid = render_grid` 起别名，用 `IPython.display.HTML` 输出保持 SVG 内联。不要换成 `IPython.display.SVG`：image/svg+xml 输出会被 Quarto 外置成 `<img>` 文件引用，无法继承站点 `data-bs-theme` 明暗与文档字体（书内字体退回系统字体）。
- 图注讲不完的读图要点写在图后正文（一两句），不复述图注已写明的信息。

## 上游代码与图的桥接

坐标图不孤立出现：引出图的代码块与图之间必须有桥接句，说明图核对代码的哪部分契约（如「图核对 `IsValid` 接受的范围」）；图后先给从图带走的结论，再进入下一块；小节以图收尾时，从图带走的结论可并入桥接段（如 示例章先给 `row` 为 `3` 或 `col` 为 `-1` 这类反例再上图），不在图后孤悬一句。代码块与图之间只有空行视为堆叠，固定序列见 `writing-quarto` 技能 `quarto/03-authoring.md`「代码与图的桥接」与 `steps/03-blocks.md`；图注与图前句的分工见 `quarto/09-figures.md`。

坐标图单元计入盒子密度（口径见 `steps/03-blocks.md`）：同一 `###` 内坐标图与代码块相邻出现时，桥接句就是盒子之间的承接正文；`verifying-content.py` 只检查相邻围栏之间是否留了空行（DOC-E11）；空行不等于桥接正文，无正文要人审。

## 助手 API 与主题适配

`render_grid(rows=3, cols=3, labels="coords", origin="top-left")` 返回 SVG 字符串；`labels` 可选 `"empty"` 只画格线。图表达的是程序坐标系：`axis=True`（默认开）画两条带箭头的轴，横轴 `col` 向右增长、纵轴 `row` 向下增长，左上格外角带原点记号，轴名与代码里的 `row` / `col` 字段对应；关掉写 `axis=False`。画成箭头轴是有意为之：箭头方向与原点记号把增长方向和原点位置画在图上，读者对照轴名即可核对 `row` 向下增长、原点在左上角这两处程序事实，不必回读正文。`marks={(1, 1): "X"}` 在对应格子居中放大绘制元素等标记，并覆盖该格的坐标标注；`highlight=(2, 0)` 为该格加一圈加粗描边，表达操作目标框。越界参数直接抛 `ValueError`。描边与文字用 `currentColor`，跟随页面文字颜色明暗自适应，不写死颜色。带 `fig-cap` 的图不会被 Quarto 包成 figure（text/html 输出不算图像）：图注是图后一个裸 `<p>`，由主题 `content.css` 的 `.cell-output-display > svg.coords-grid + p` 规则按图注样式居中；图与不带图注的裸 SVG 都由同文件 `.cell-output-display svg.coords-grid` 规则居中。
