# 第 9 步：检查与渲染

产出：脚本和渲染的检查结果。这一步只跑命令，不按输出改写法。

## 通用情况

### 检查脚本

脚本在技能目录下的 `scripts/` 里，用命令执行，不把源码读进上下文。常用入口：

- `python scripts/verifying-content.py`：查标题层级与字数、正文篇幅、禁用措辞、代码围栏、本地链接和章节表一致性。项目专属检查只在书的 `.agents/skills/quarto-book-project/` 存在时启用。
- `python scripts/checking-links.py`：查本地链接和图片路径。
- `python scripts/checking-callouts.py`：查 Callout 的类型与位置。
- `python scripts/checking-output.py`：查代码块里的实测输出。
- `python scripts/checking-names.py`：查文件与标题命名。
- `python scripts/testing-content.py`：跑脚本自带的用例。

先跑 `verifying-content.py`，其余按本步的情况决定。

### 完成判据

脚本通过之后才写完成结论。脚本失败就先回到它指向的步骤，不在这一步手工绕过。

## 情况

### 情况：改了渲染才跑 quarto render

只有改动 `_quarto.yml`、主题、过滤器或 front matter 时才跑 `quarto render`。渲染错误按 `quarto/render.md` 的排查索引处理。

### 情况：全仓重构

任务是全仓重构时，打开 `quarto/refactor.md` 取范围和排除，并加跑 `checking-links.py`、`checking-callouts.py`、`checking-output.py`、`checking-names.py`。

## 正反例

第 9 步不设例子文件。检查结果本身就是判据。
