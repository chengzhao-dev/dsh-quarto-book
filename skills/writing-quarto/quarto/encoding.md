# 文件编码与行尾

> 速查：UTF-8 无 BOM · 文本文件 LF · `.bat`/`.cmd` CRLF · 机器规则以根 `.gitattributes` 与 `.editorconfig` 为准 · 不反向转码

## 默认值

书里的 `.qmd`、`.yml`、`.yaml`、`.scss`、`.css`、`.md`、`.lua`、`.py`、`.mjs` 一律满足三条：

- UTF-8 无 BOM。
- 行尾 LF。
- 文件末尾保留一个换行。

`.bat` 与 `.cmd` 用 CRLF；`.sh` 必须是 LF，否则在 Linux、WSL 与 CI 里会报 `bad interpreter`。

二进制文件（图片、字体、PDF）不按文本规则处理，也不要让 Git 做行尾转换。

## 权威与工具

- 仓库根的 `.gitattributes` 管提交与检出时的行尾，`.editorconfig` 管编辑器写入时的编码、行尾与空白。两份文件冲突时以 `.gitattributes` 为准，并同轮修正 `.editorconfig`。
- 新建文件前先看根 `.editorconfig` 是否已覆盖该扩展名；没有就用编辑器显式设成 UTF-8、LF。
- 提交前跑 `git diff --check`，它会拦下行尾空白与冲突标记；行尾本身由 `.gitattributes` 保证。
- 不要用 `git add --renormalize .` 批量改行尾：它会把无关文件一起带进提交。只改本次动到的文件。
- 不用 PowerShell 5.1 的 `Out-File`、`Set-Content -Encoding utf8` 写中文文件，它们会加 BOM；用编辑器或 Python 显式写 `encoding="utf-8", newline="\n"`。

## 症状与处置

| 症状 | 先查 | 处置 |
|---|---|---|
| 中文变乱码特征串 | 文件是否被按错误编码重读 | 从 Git 可读版本恢复后重做修改，不对已乱码文本反向转码 |
| 文件头出现 `\ufeff` | 编辑器是否加了 BOM | 用无 BOM 方式重写整个文件 |
| 每行末尾多出 `^M` | 是否在 Windows 上按 CRLF 保存 | 统一转回 LF；`.bat`/`.cmd` 保持 CRLF |
| `bash: ...: /usr/bin/env: bad interpreter` | `.sh` 是否为 CRLF | 转成 LF 后重新提交 |
| `git diff` 整文件重写 | 行尾或 BOM 被批量改动 | 先恢复，再只改目标段落 |

渲染侧的中文乱码排查见 `quarto/render.md`「5. 中文乱码/编码」。
