# 第 9 步：检查与渲染

产出：内容核对结果、一次渲染检查和 HTML 可用性报告。这一步只跑命令，不按报告改写法。

内容与链接检查需要 Python 3；`dry_run: false` 的渲染还需要 Quarto CLI。缺少依赖时停住并报告，不改回手跑 `quarto render`。

## 通用情况

### 内容与链接

项目技能列了内容检查命令时，只跑它列出的命令。没有项目技能时，在书根跑本技能 `scripts/` 下的 `verifying-content.py` 与 `checking-links.py`。

`verifying-content.py` 查章节表、YAML 标题、标题层级、句段长度、围栏语言、Mermaid 围栏、占位文字和本地链接。项目专属检查只在书的 `.agents/skills/quarto-book-project/` 存在时启用。

### 渲染与 HTML

内容核对通过后，调 `quarto_render_check`。参数只有两个：

- `qmd_path`：正在改的 `.qmd` 路径。
- `dry_run`：`true` 只做输出目录安全检查，`false` 才启动渲染。

检查次数有上限：

- `dry_run: true` 最多 2 次。第 1 次返回 `safe_to_render: false` 时，只改 `output-dir` 一次。第 2 次仍不安全就停住，把 `warnings` 列给用户。
- `dry_run: false` 最多 1 次。渲染失败就停住，把 `errors` 列给用户，不自动重跑。
- 成功时同一次返回里带 `html_report`，不再为同一份文件重跑。

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

内容命令通过，`dry_run: false` 返回 `render_result.ok: true`，且 `html_report.usable: true`，并调用一次 `quarto_pass_report` 出回执，才算完成。任一条件不满足，回到报告指向的步骤。

## 正反例

第 9 步不设例子文件。检查结果本身就是判据。
