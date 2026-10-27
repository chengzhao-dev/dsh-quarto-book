# 书门禁：什么时候出现

本插件（模块短名 `dsh-quarto-book`，npm 包 `@chengzhao-dev/dsh-quarto-book`）只在会话位于一本书里时出现。安装只把包放进 profile，不等于启用技能；插件没有常驻进程，每次 `list({ cwd })` 重新判定。

## 六类情形

| 会话情形 | 本插件 | 依据 |
| --- | --- | --- |
| 没有 cwd，或不在 git 检出里 | 不出现 | 从 cwd 向上找不到 `.git` |
| 没有 `_quarto.yml`，或没有一行独立的 `type: book`（含只有注释里写了） | 不出现 | 以 `#` 开头的行不算声明 |
| 有 `type: book`，但书根没有章节源文件：只有 README、CHANGELOG、LICENSE 等说明文件，或章节只在生成、依赖、第三方目录里 | 不出现 | 根目录的说明文件不算章节；扫描跳过这些目录 |
| 书配置在 git 根之上，或仓库根不是书、书只在子目录而会话还在根上 | 不出现；进入书子目录后出现 | 从 cwd 向上搜索，止于 git 根 |
| git 根到 cwd 之间有 `type: book` 和真正的 `.qmd` 或 `.md` 章节 | 出现 `writing-quarto` 与 `designing-theme` | 唯一的出现条件 |
| 同一本书里另有 `CMakeLists.txt` 或 `.cpp`；或只有 CMake、零散 C++ 文件、项目技能目录 | 按上一条出现；没有书就不是书 | 门禁只看 Quarto 文件，不按仓库整体语言判断 |

## 判定顺序

与 `src/workspace.ts` 的 `findBookRoot` 一致：

1. `cwd` 为空、或不在 git 检出里，返回空。
2. 从 `cwd` 向上走，找到第一个含 `_quarto.yml` 的目录；该文件必须有一行独立的 `type: book`，`# type: book` 不算。它若不是书，直接判否，不再向上找。
3. 在这个目录里找章节源文件：至少一个 `.qmd` 或 `.md`；根目录的 README、CHANGELOG、LICENSE、CONTRIBUTING、AGENTS 等说明文件（含 `README.en.md` 这类语言变体）不算章节。
4. 扫描跳过 `_book`、`node_modules`、`vendor`、`third_party`、`templates`、`.git`、`.quarto`、`.cache`、`.venv`、`renv`、`packrat`、`temp` 等生成或依赖目录；最多 4000 个目录项、12 层。
5. 最近的 `_quarto.yml` 不是书、或没有章节源文件时直接判否，不再向上找；避免把父项目的书当成本仓库的书。
6. 命中后返回两个技能；搜索不越过 git 根，也不看兄弟目录。

## 工具

- `quarto_render_check` 与技能共用同一道门禁：先按会话 cwd 找书根，找不到再从 `qmd_path` 向上找 `_quarto.yml`；两处都不是书项目时返回 `safe_to_render: false`，不启动 `quarto render`。工具在 `apply()` 时注册，所以会出现在工具目录里；DSH 的工具注册没有 `cwd` 参数，无法在注册阶段按目录隐藏。
- 技能 provider 的 `get()` 带 `cwd` 时重新过同一道门禁；不带 `cwd` 时只服务已经加载的 candidate。
- `quarto_pass_report` 只做执行回执，不参与门禁判定。

## 同一 profile 里的其他插件

本包不探测别的插件，也不因它们改变书门禁。社区插件没有「只对某个 GitHub 仓库启用」的开关，profile 安装加 cwd 门禁就是最小范围；想更窄，就只把它装进写书用的那个 profile。项目 `.agents/skills` 下的同名技能仍按 rank 覆盖插件技能（项目 200 高于插件 550）；不要把 `writing-quarto`、`designing-theme` 复制进项目。

| 邻居 | 分工 |
| --- | --- |
| `dsh-cpp-workflow` | 章节与主题归本插件，实现文件归它。本插件只处理 Quarto 文件，不点名实现目录，也不写实现工程的语言或目录。 |
| 上下文压缩类（`billion-context`、`dsh-context` 等） | 它们压缩已进入上下文的内容，本插件负责少放进去。不新增系统提示段落去重复 `SKILL.md`；压缩后可丢步骤，下一步按路径重读那一个文件。 |
| 命令与权限类（`dsh-ops`、`cc-safety-net`、`dsh-perm-gate`、`dsh-trust-check`） | 检查命令以项目技能列出的那条为准；不把某个命令宿主或包装命令写进技能。权限插件拦住就停住并报告，不写绕过开关。 |
| 技能目录类（`dsh-skills-manager`、skills deck） | 技能名保持 `writing-quarto` 与 `designing-theme`，可以由目录类关闭；关闭后书仍能用 Quarto 渲染，只是代理不再读这些步骤。 |
| 写作类（`lunheng-article-pipeline`、`dsh-simplify`、`dsh-prompt`、`dsh-ppt`、`dsh-univer-office`） | 只借「一层技能目录」的形状，不接多角色流水线；去 AI 腔与 pptx/docx 转换不并入本插件，也不调用它们的工具。 |
| 评审与代理团队（`dsh-code-review`、`dsh-agent-teams`） | 子会话按自己的 cwd 重新 `list()`；父会话不把技能正文写进子代理提示。本插件不注册评审工具，也不抄它们的检查单。 |
| 看图类（`modlens`、`modsearch`） | 图仍走 `quarto/figures.md`、`quarto/mermaid.md`、`quarto/coords.md`，不靠 OCR 改章节。 |

## 已知边界

- 门禁是文件事实启发式，不解析 Quarto 语义：`type` 必须独立成行，注释不算。
- 仓库根不是书、书在子目录时，只有进入书目录的会话才看得到技能，避免在仓库根误用书内相对路径。
- 渲染工具全局可见，只在执行前拒绝非书会话。
