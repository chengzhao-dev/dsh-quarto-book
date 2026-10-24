# 图与图注

图由图像、`{mermaid}`、`{python}` 坐标图和原生 HTML/SVG 共同遵守这一份约定。图注负责读图信息，正文负责图与上下文的关系；两者不互相复述。

## 位置与归属

- 图注默认在图下，图整体居中。Quarto 的 `fig-cap` 默认就是图下题注；不要把图注写成图前独立段落。
- `{mermaid}` 用 `%%| fig-cap`，`{python}` 坐标图用 `#| fig-cap`，原生 HTML/SVG 用 `<figure>` 内的 `<figcaption>`。三者都落在图下。
- 图前只写引出关系的一句：为什么这里出现这张图、它核对哪条已讲清的契约。图前不写“下图标出……”这类只交代图面内容的句子；这种句子属于图注。
- 图后只写从图带走的结论或图外新信息。图注已写明的坐标、方位、图例、成员取舍不再复述。

## 图注写法

图注是一句完整的读者句，至少包含“这张图画的是什么”和“读图要看的那条关系”。不手写“图 1：”，Quarto 按 `lang: zh` 自动编号。

- 不佳：下图标出这块棋盘上可用的 `(row, col)`。
- 改写（图下）：`棋盘坐标图：3 行 3 列，每格标出 (row, col)；行向下、列向右，左上角是 (0, 0)。`
  - 原句只是图面说明，移入 `<figcaption>`，不再占据图前正文。
- 不佳：总览图为什么不列成员？
- 改写（删除；图注写“总览只画类型与关系”即可）。

图注只解释图本身，不承担章节过渡，也不替读者总结整节。

## 原生 HTML/SVG

原生 HTML/SVG 图用 `<figure>` 包住，图注用 `<figcaption>`，图注必须是 `figure` 的最后一个子元素：

```html
<figure class="book-figure">
<svg class="coords-grid" role="img" aria-label="棋盘坐标：3 行 3 列，左上角为 (0, 0)。">…</svg>
<figcaption>棋盘坐标图：3 行 3 列，每格标出 (row, col)；行向下、列向右，左上角是 (0, 0)。</figcaption>
</figure>
```

- `role="img"` 与 `aria-label` 给读屏软件一个短名称；`figcaption` 给视觉读者完整图注。
- 主题用 `.book-figure` 统一居中、限制最大宽度，并让 `figcaption` 落在图下；不要另写行内样式。
- 图注内需要行内代码时写 `<code>`，不要写 Markdown 反引号——`{=html}` 围栏按原样输出。

## 与其他图类的关系

- Mermaid 的方向、节点预算与线型约定见 `quarto/mermaid.md`；它的 `fig-cap` 同样遵守本文件。
- 坐标图优先用 `quarto/coords.md` 的 `{python}` 助手；没有执行环境时，允许静态 HTML/SVG，但必须按本文件包 `<figure>` 与 `<figcaption>`，不能把图注留在图前。
- 代码到图的固定序列见 `quarto/authoring.md`「代码与图的桥接」与 `steps/03-blocks.md`；桥接句讲关系，图注解图面，两者分工不同。

## 自检

- 图前是否还有“下图 / 图中 / 本图”这类只交代图面的句子？有就移入图注或删除。
- 图注是否重复了图后正文？重复就删正文或删图注，只留一处。
- 原生 SVG 是否在 `figure` 内，`figcaption` 是否在 `svg` 之后、`</figure>` 之前？
