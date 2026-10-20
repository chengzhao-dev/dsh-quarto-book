# 坐标轴网格图的生成约定

坐标轴类网格图（状态面板行列、二维数组下标）用共享绘图助手生成 SVG，不用 Mermaid 硬画网格。流程图与坐标图的分工、页面围栏写法、解释器与 CI 依赖都在本文件；token 预算的排除口径见`steps/02-structure.md`「计数口径」。

## 与 Mermaid 的分工

- 默认图是 `{mermaid}` flowchart，表达调用链、分层与数据流（口径见`quarto/mermaid.md`）。
- 坐标轴类网格图只走 `rendering-coords.py` 加 `{python}` 可执行单元；Mermaid 的节点文本排版不适合网格，禁止用它拼状态面板。
- Agent 作图边界：默认只生成 Mermaid 流程图；坐标图仅当用户明确指定时生成，且只改助手调用参数，不内联第二套 SVG 逻辑。

## 页面与单元写法

- 页面 frontmatter 开 `engine: jupyter`，只给含图页面开启，避免全书每次渲染都起 kernel。
- 坐标图单元用 ```` ```{python} ```` 围栏，块首写 `#| echo: false`、`#| warning: false`，再写 `#| fig-cap: "图 N：…"` 与 `#| fig-align: center`；图注文字概括图意，不与图后正文逐句重复，也不用 `>` 引用块另起一套图注。
- 单元内从当前目录向上定位含 `_quarto.yml` 的书根，按路径加载本技能 `scripts/diagrams/rendering-coords.py`，绑定名仍是 `coords_grid`，用 `IPython.display.HTML` 输出保持 SVG 内联。不要换成 `IPython.display.SVG`：image/svg+xml 输出会被 Quarto 外置成 `<img>` 文件引用，无法继承站点 `data-bs-theme` 明暗与文档字体（书内字体退回系统字体）。
- 图注讲不完的读图要点写在图后正文（一两句），不复述图注已写明的信息。

## 上游代码与图的桥接

坐标图不孤立出现：引出图的代码块与图之间必须有桥接句，说明图核对代码的哪部分契约（如「下面的图标出每个数据项的 (row, col)，与 `IsValid` 接受的范围一致」）；图后先给从图带走的结论，再进入下一块；小节以图收尾时，从图带走的结论可并入桥接段（如 示例章先给 `row` 为 `3` 或 `col` 为 `-1` 这类反例再上图），不在图后孤悬一句。代码块与图之间只有空行视为堆叠，固定序列见 `writing-quarto` 技能 `quarto/authoring.md`「代码与图的桥接」与`steps/03-blocks.md`。

坐标图单元计入盒子密度（口径见`steps/03-blocks.md`）：同一 `###` 内坐标图与代码块相邻出现时，桥接句就是盒子之间的承接正文；`verifying-content.py` 对两围栏之间无正文给出 WARN 提示，人审与对照案例仍是主检查。

## 助手 API 与主题适配

`render_grid(rows=3, cols=3, labels="coords", origin="top-left")` 返回 SVG 字符串；`labels` 可选 `"empty"` 只画格线。图表达的是程序坐标系：`axis=True`（默认开）画两条带箭头的轴，横轴 `col` 向右增长、纵轴 `row` 向下增长，左上格外角带原点记号，轴名与代码里的 `row` / `col` 字段对应；关掉写 `axis=False`。画成箭头轴是有意为之：箭头方向与原点记号把增长方向和原点位置画在图上，读者对照轴名即可核对 `row` 向下增长、原点在左上角这两处程序事实，不必回读正文。`marks={(1, 1): "X"}` 在对应格子居中放大绘制元素等标记，并覆盖该格的坐标标注；`highlight=(2, 0)` 为该格加一圈加粗描边，表达操作目标框。越界参数直接抛 `ValueError`。描边与文字用 `currentColor`，跟随页面文字颜色明暗自适应，不写死颜色。带 `fig-cap` 的图不会被 Quarto 包成 figure（text/html 输出不算图像）：图注是图后一个裸 `<p>`，由主题 `content.css` 的 `.cell-output-display > svg.coords-grid + p` 规则按图注样式居中；图与不带图注的裸 SVG 都由同文件 `.cell-output-display svg.coords-grid` 规则居中。

## 执行缓存与 CI 行为

- `_quarto.yml` 顶层 `execute: freeze: auto`：全项目 `quarto render` 对未变化的计算页面复用根 `_freeze/`；页面源码变化时才重新执行。
- 根 `_freeze/` 是 Quarto 官方建议提交的共享快照；`.quarto/_freeze/` 是同一结果的本地隐藏 freezer，随整个 `.quarto/` 忽略且绝不提交。`_book/` 是忽略的 Pages 发布物，CI 只发布它，不发布 `_freeze/`。
- 本地或 CI 以无参数 `quarto render` 渲染整本书。修改单元、`rendering-coords.py`、输入数据或依赖后，必须刷新并提交对应根 `_freeze/`；发生冲突时重新执行生成结果，不手工合并 JSON。
- CI 仍安装 Jupyter 依赖，供页面或外部输入变更后的重执行兜底；渲染验收仍是 `_book` 对应 HTML 含 `coords-grid` 类名的 SVG 容器。

## 解释器与 CI 依赖

- Quarto 的 jupyter 引擎用环境变量 `QUARTO_PYTHON` 定位解释器；本地和 CI 都显式设置它。
- **裸 `quarto preview` / `quarto render` 不读项目配置里的解释器字段**。Windows PATH 上的 `python3` 常是 Store 占位符，会报 Python not found；优先在会话或 CI 里设置 `QUARTO_PYTHON`。
- Cursor / VS Code 的 Quarto Preview：扩展从 **Python: Select Interpreter** 取路径注入 `QUARTO_PYTHON`；选书里实际使用的解释器。
- 依赖清单写在书根的 `requirements.txt` 或 README，本地与 CI 用 `python -m pip install -r requirements.txt` 安装。SVG 用标准库生成，不强制 matplotlib。
