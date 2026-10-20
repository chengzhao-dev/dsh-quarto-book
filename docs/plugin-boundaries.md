# 两个插件的使用边界

本文回答三个问题：什么时候 `dsh-quarto-book` 和 `dsh-cpp-workflow` 应该出现，两个插件同时出现时会不会冲突，以及怎么避免它们在无关项目里参与任务。文中 `dsh-quarto-book` 指插件模块的短名，npm 包名是 `@chengzhao-dev/dsh-quarto-book`。

## 一分钟判断

1. 从会话目录向上到 git 根能找到书根，书根里有 `.qmd` 或 `.md` 章节，且 `_quarto.yml` 有 `type: book`：`dsh-quarto-book` 出现。
2. 从会话目录向上到 git 根有 `cpp-workflow-project` 项目技能，或 git 根内（跳过生成、依赖与文档示例目录）有 `CMakeLists.txt` 与 C++ 源文件：`dsh-cpp-workflow` 出现。
3. 两条都成立就两组都出现；按当前文件类型选技能，不按仓库整体选。
4. 两条都不成立就都不出现；安装插件不等于启用技能。

## 判定矩阵

| 会话场景 | `dsh-quarto-book` | `dsh-cpp-workflow` | 说明 |
| --- | --- | --- | --- |
| 纯 Markdown / 文档仓库，没有 `_quarto.yml` | 不出现 | 不出现 | 没有书配置，也没有 CMake 与 C++ 源文件 |
| 只有 `_quarto.yml` 和 README 等仓库说明文件 | 不出现 | 不出现 | 说明文件不是章节源文件 |
| Quarto Book（含 `type: book` 与章节源文件，没有 C++ 工程） | 出现两个技能和渲染工具 | 不出现 | 没有 CMake + C++ 源文件 |
| CMake + C++ 源文件的工程 | 不出现 | 出现两个技能 | 不要求项目技能标记 |
| 显式放了 `cpp-workflow-project` 的项目 | 不出现 | 出现两个技能 | 项目技能是显式选用，允许在 CMake 尚未就绪时先接入 |
| 书仓库里同时有 C++ 子工程 | 出现 | 出现 | 多语言仓库，按当前文件类型分流 |
| 仓库根不是书，只在子目录里有一本书 | 根目录不出现，进入子目录后出现 | 按 C++ 证据独立判断 | Quarto 以会话 cwd 的最近书根为准 |
| 只有 CMake，没有 C++ 源文件 | 不出现 | 不出现 | 可能是 C 工程或空壳配置 |
| 只有零散 `.cpp` / `.hpp`，没有 CMake | 不出现 | 不出现 | 不把单个示例文件当成工程 |

## `dsh-quarto-book` 的门禁

发现技能时，从会话 `cwd` 向上、最多到最近的 git 根，沿途查找 `_quarto.yml`：

1. `_quarto.yml` 必须有独立的一行 `type: book`，注释里的 `# type: book` 不算。
2. 书根内至少有一个 `.qmd` 或 `.md` 章节源文件；`_book`、`node_modules`、`vendor`、`third_party` 等目录不参与判断，根目录的 README、CHANGELOG、LICENSE 等仓库说明文件也不算章节。
3. 没有 `cwd`、不在 git checkout、配置缺失或只有配置没有章节，都返回空列表。

`quarto_render_check` 与技能共用同一道门禁：非书会话直接返回 `safe_to_render: false`，不启动 `quarto render`。工具在 `apply()` 时注册，因此会出现在工具目录里，但它在执行前拒绝非书会话；这是 DSH 工具注册没有 cwd 参数时的最小防护。

`get()` 带 `cwd` 时重新过门禁，避免同一会话从书目录切到普通目录后还能展开正文；不带 `cwd` 时只服务已经加载的 candidate。

## `dsh-cpp-workflow` 的门禁

从会话 `cwd` 向上找到最近的 git 根，满足下面任一条才返回两个技能：

- `cwd` 到 git 根沿途的某一层存在 `.agents/skills/cpp-workflow-project/SKILL.md`，这是项目显式选用；
- git 根内同时存在 `CMakeLists.txt` 与 C++ 源文件或头文件（`.cpp`、`.cc`、`.cxx`、`.hpp`、`.hh`、`.hxx`、`.ixx`、`.cppm` 等）。

扫描限制为 6 层、1500 个目录项，跳过 `.git`、`build`、`node_modules`、`vendor`、`third_party`、`external`、`_deps`、`_book`、`docs`、`examples`、`samples` 等生成、依赖或示例目录，命中两半后立即停止。只有 CMake、只有 C++ 示例、或证据在 git 根之上，都不算工作区。

C++ 检测是工程级启发式，不解析 CMake 语法。使用仅含 `.h` 的头文件库、或使用非 CMake 构建系统的工程时，放一个 `cpp-workflow-project` 项目技能即可显式选用；不要为了触发插件去伪造 `CMakeLists.txt`。

## 两个插件同时出现时

两个 provider 的 rank 都是 550，但技能名完全不重叠：

- `dsh-quarto-book`：`writing-quarto`、`designing-theme`
- `dsh-cpp-workflow`：`developing-cpp`、`building-cpp`

rank 只在同名时决定覆盖顺序，名字不同就不会互相遮蔽。书仓库里的 C++ 子工程会让两组技能同时出现，这是多语言仓库的正常状态：写 `.qmd` 时用 Quarto 技能，改 `.h` / `.cpp` / `CMakeLists.txt` 时用 C++ 技能。两个技能包都在 `SKILL.md` 里写明「不用于只改文档 / 不用于与 C++ 无关的文件」，路由按文件类型而不是按仓库整体判断。

真正需要避免的是把通用技能复制进项目：

- 项目 `.agents/skills` 的 rank 是 200，会覆盖插件的同名技能。不要把 `writing-quarto`、`designing-theme`、`developing-cpp`、`building-cpp` 复制到项目里；项目只放 `quarto-book-project` 和 `cpp-workflow-project` 这类项目事实技能。
- 两个插件都只注册技能 provider；`dsh-cpp-workflow` 没有工具，`dsh-quarto-book` 的渲染工具在执行前复核书门禁。它们不会在后台扫描、构建或改写工程。

## 默认启动的含义

安装插件不等于启用技能：

- 安装只把包放进 profile；每次会话的 `list({ cwd })` 重新判定，不命中就返回空数组。
- 技能被列出后仍需模型或用户显式调用；列出不是自动执行。
- 门禁不依赖全局配置、环境变量或项目名，只依赖会话 cwd、git 根和项目内的文件事实。

## 实际校验

在 2026-10-20 的本机仓库上直接调用编译后的 provider：

| cwd | `dsh-quarto-book` | `dsh-cpp-workflow` |
| --- | --- | --- |
| `D:\Github\cpp-board-games` | `designing-theme`、`writing-quarto` | `building-cpp`、`developing-cpp` |
| `D:\Github\cpp-board-games\content\tictactoe` | `designing-theme`、`writing-quarto` | `building-cpp`、`developing-cpp` |
| `D:\Github\dsh-quarto-book` | 空 | 空 |
| `D:\Github\dsh-cpp-workflow` | 空 | 空 |

`quarto_render_check(qmd_path: "index.qmd", dry_run: true)` 在 `cpp-board-games` 返回 `safe_to_render: true`；在插件仓库返回拒绝并说明缺 `type: book` 或章节源文件；没有 cwd 时同样拒绝。

自动测试覆盖：

- `dsh-quarto-book`：26 项，覆盖书门禁、嵌套 cwd、生成目录、`get()` 复核、工具拒绝、卡片状态与渲染后 HTML 检查。
- `dsh-cpp-workflow`：31 项，覆盖项目技能标记、CMake + C++ 证据、只有一半证据、嵌套子工程、生成目录、git 根之上、`get()` 复核与 checker 分支。

## 已知边界

- 两个门禁都是文件事实启发式，不是构建系统解析器。工程布局越非常规，越应该用项目技能显式选用。
- `dsh-quarto-book` 的渲染工具在工具目录里全局可见，只在执行时拒绝非书会话；DSH 的 `apply()` 没有 cwd，无法在注册阶段按目录隐藏工具。
- 仓库根不是书、书在子目录时，只有进入书目录的会话才会看到 Quarto 技能；这是为了避免在仓库根误用书内相对路径。
- 同一 profile 安装多个技能包时，其他插件若注册同名技能，仍由 rank 决定；本仓库的两个包不与对方重名，也不占用项目技能名。
