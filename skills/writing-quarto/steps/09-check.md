# 第 9 步：检查与渲染

产出：内容核对结果、一次渲染检查和 HTML 可用性报告。这一步只跑命令，不按报告改写法。

内容与链接检查需要 Python 3；`dry_run: false` 的渲染还需要 Quarto CLI。缺少依赖时停住并报告，不改回手跑 `quarto render`。跨层失败先按 `quarto/render.md`「排查顺序」定位，再回到对应步骤。

## 通用情况

### 内容与链接

项目技能列了内容检查命令时，只跑它列出的命令。没有项目技能时，在书根跑本技能 `scripts/` 下的 `verifying-content.py`、`checking-links.py` 与 `checking-prose.py`。

`verifying-content.py` 查章节表、YAML 标题、标题层级、句段长度、围栏语言、Mermaid 围栏、占位文字、目录树（行数、目录注释 16 列且无冒号/顿号、文件注释 1–2 项、标记列对齐）和本地链接；`checking-prose.py` 查中文与拉丁字母、数字、行内代码之间的空格，以及中文句里的半角标点。项目专属检查只在书的 `.agents/skills/quarto-book-project/` 存在时启用。

### 渲染与 HTML

内容核对通过后，调 `quarto_render_check`。工具先按会话工作目录找书根；会话不在书内时，从 `qmd_path` 所在目录向上找 `_quarto.yml`，两处都找不到才拒绝并返回「当前会话不在 Quarto Book 项目内」。被拒绝时把工作目录切到书根再调用；仍不行就停住并说明，不改用手跑 `quarto render` 顶替。参数只有两个：

- `qmd_path`：正在改的 `.qmd` 路径。
- `dry_run`：`true` 只做输出目录安全检查，`false` 才启动渲染。

检查次数有上限：

- `dry_run: true` 最多 2 次。第 1 次返回 `safe_to_render: false` 时，只改 `output-dir` 一次。第 2 次仍不安全就停住，把 `warnings` 列给用户。
- `dry_run: false` 最多 1 次。渲染失败就停住，把 `errors` 列给用户，不自动重新运行。
- 成功时同一次返回里带 `html_report`，不再为同一份文件重新运行。
- 同一轮改多章时，每章只跑项目的章节检查；全部章改完后 `quarto_render_check` 只跑一轮，`dry_run: true` 最多 2 次，`dry_run: false` 1 次，`quarto_pass_report` 只收尾一次。

报告字段：

- `warnings`：输出目录不安全的说明。
- `errors`：渲染失败、超时或找不到 `quarto` 时的一句话原因；成功时为空数组。
- `safe_to_render`：是否允许渲染。
- `suggested_output_dir`：固定为 `_book`。
- `render_result`：`ok`、`exit_code`、`duration_ms` 与末尾输出；`dry_run: true` 时为 `null`。
- `html_report`：`usable`、`checks`、`output_files`、`output_files_total`；`dry_run: true` 时为 `null`。

`checks` 每项是 `{ id, status, detail }`，`status` 只取 `pass`、`fail`、`skip`。固定项有 `index_html`、`utf8`、`charset`、`no_file_uri`；条件项有 `sitemap`、`search_index`、`callouts`、`dom`。`usable` 在没有 `fail` 时为 true。

`fail` 按项退回：

- `index_html`、`utf8`、`charset`、`no_file_uri`：回到第 7 步改标点与编码，或回第 3 步改围栏。
- `sitemap`、`search_index`：改 `_quarto.yml` 的 `site-url` 或 `search`，不靠删项绕过。
- `callouts`：回第 3 步改 Callout 写法。
- `dom`：回第 7 步改版式，或转 `designing-theme`。

不手跑 `quarto render`，也不手跑 `checking-output.py`、`checking-callouts.py`、`checking-dom.py`。工具已经按当前书配置调用它们。

渲染之外还有一层可访问性核对：书配置的 debug 项里可打开 `axe: true`，Quarto 会在浏览器里加载 axe-core 报告 `heading-order`、`svg-img-alt` 这类问题。报告只作提示，改法是给图补 `aria-label`、补齐跳过的标题层级，不把行为项当作新步骤。

### 执行回执

检查结论确定后，调用一次 `quarto_pass_report`，把这次执行的结论压成一张卡片：

- `skill` 填 `writing-quarto`，`mode` 填 `polish` 或 `rewrite`。
- `files` 写这次动过的章节路径和改动次数（最多 8 个）；`steps` 只列有改动的步骤编号（1–9）与次数，两者合计必须一致。
- `held` 写围栏、事实这类明确没有改动的地方；没改就传 0。
- `checks` 抄内容与渲染的结论，名字只取 `content`、`html`、`layout`，状态只取 `pass`、`fail`、`skip`。
- 当前文件不是章节时传 `executed: false`、`mode: skipped`，并给一句 `skip_reason`。

卡片就是回执，回复里不再复述；回执不保存到磁盘，也不贴改写后的句子，不根据回执改文章。

## 情况

### 情况：全仓重构

任务是全仓重构时，打开 `quarto/refactor.md` 取范围和排除，并加跑 `checking-links.py` 与 `checking-names.py`。HTML 可用性仍只由 `quarto_render_check` 判定。

### 情况：没有 DSH 工具

会话里没有 `quarto_render_check` 时，说明插件没有加载或版本低于 0.3.0。停住并报告，不改回手跑 `quarto render`。

## 完成判据

内容命令与混排检查通过，`dry_run: false` 返回 `render_result.ok: true`，且 `html_report.usable: true`，并调用一次 `quarto_pass_report` 出回执，才算完成。任一条件不满足，回到报告指向的步骤。

## 正反例

第 9 步不设例子文件。检查结果本身就是判据。

自查时按 `references/rules-cards.md` 逐条对照，只打开当前段落涉及的卡片；卡片编号写在动手记录里，便于回溯。
