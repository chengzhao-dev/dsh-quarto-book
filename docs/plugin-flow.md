# 插件工作流：从安装到渲染检查

本文写给排障的人和回看的维护者，回答「装好之后，哪一层在什么条件下生效」。它是人读的流程说明，不是技能执行时的规则来源：技能正文不读本文，作用于写作的约束都写在 `skills/writing-quarto/SKILL.md` 与 `skills/designing-theme/SKILL.md` 里。

## 五层

| 层 | 读者看到什么 | 生效条件 | 排障入口 |
| --- | --- | --- | --- |
| 1 安装 | 插件出现在 profile 的依赖里 | `dsh plugin --profile <profile> add npm:@chengzhao-dev/dsh-quarto-book@0.4.0` 成功，profile 的 `package.json` 有这条依赖 | `docs/versioning.md` |
| 2 技能名出现 | 选题里能看到 `writing-quarto`、`designing-theme` | 会话 `cwd` 向上找到 git 根，沿途 `_quarto.yml` 有一行独立的 `type: book`，且这本书至少有一个章节源文件 | `docs/plugin-boundaries.md` |
| 3 开始写章节 | 九个写作步骤和三套案例文件 | 第 2 层通过；章节文件是 `.qmd` 或 `.md` | `skills/writing-quarto/SKILL.md` |
| 4 渲染检查 | `quarto_render_check` 返回 `safe_to_render` 与 `html_report` | 与第 2 层同一道门禁 | `skills/writing-quarto/steps/09-check.md` |
| 5 执行回执 | 一轮结束时出现 `quarto_pass_report` 卡片 | 技能完成判据要求收尾调用一次；写作与主题共用 | `skills/writing-quarto/steps/09-check.md` |

## 1 安装

安装单位是 profile，不是仓库。命令把包装进 `<DSH_HOME>/profiles/<profile>/`：

```text
<DSH_HOME>/profiles/<profile>/
├── package.json                                # 依赖清单
└── node_modules/                           #/ 依赖目录
    └── @chengzhao-dev/dsh-quarto-book/     #/ 安装目录
        ├── package.json                        # 包名与版本
        ├── cordis.patch.yml                    # 宿主补丁
        └── skills/                         #/ 两个技能
```

装好后 profile 的 `package.json` 里出现 `@chengzhao-dev/dsh-quarto-book`。两处名字必须逐字一致：`package.json` 的 `name` 与 `cordis.patch.yml` 里 `- name:` 指向同一个包名；不一致时补丁插不进去，工具和技能都不会注册。

profile 里还留着旧的无作用域包 `dsh-quarto-book` 时（该包已随 0.3.4 从 npm 删除），先在同一个 profile 里删旧包再装新包。两个包同时留着时，会以相同的 rank 550 各注册一遍 `writing-quarto` 和 `designing-theme`。版本号与发布步骤见 `docs/versioning.md`。

## 2 技能名出现

`apply()` 注册技能 provider 与两个工具（`quarto_render_check`、`quarto_pass_report`），不写文件。provider 的 `list({ cwd })` 只在发现候选时做一次有界只读检查：

- 从会话 `cwd` 向上找到 git 根，沿途的 `_quarto.yml` 里有一行独立的 `type: book`，并且这本书至少有一个 `.qmd` 或 `.md` 章节源文件，就返回两个技能；否则返回空列表。书根下的 `README.md`、`CHANGELOG.md`、`LICENSE.md` 等仓库说明文件不算章节源文件。
- 没有 `cwd`、不在 git checkout 里、`_quarto.yml` 缺失、只在注释里写了 `# type: book`、或只有 book 配置没有任何章节源文件，都按「不是书」处理。
- 判定实现是 `src/workspace.ts` 的 `findBookRoot` 与 `isQuartoBookWorkspace`；扫描跳过 `_book`、`node_modules`、`vendor`、`third_party` 等目录，最多 4000 个目录项。
- 技能名出现只说明当前会话过了门禁，不代表已经加载；只有调用 `skill` 才读写技能正文。

完整判定矩阵、与 `dsh-cpp-workflow` 的共存规则和实际校验记录见 `docs/plugin-boundaries.md`。

## 3 开始写章节

入口是 `writing-quarto` 的 `SKILL.md`：`适用场景` 说明哪些文件归它管，`两种走法` 写增量润色与全章重构的分岔和不变量，`九步` 列出每一步对应的 `steps/` 文件，`完成判据` 说明什么时候可以停。每一步只打开同号的一个文件；判不准才打开 `examples/` 里同号的案例；要排图、查渲染或全仓重构才打开 `quarto/`。

- 章节（`content/**/*.qmd`、`index.qmd`）：走完整九步。每一步的「情况：」标题下是只在特定场景才生效的追加判定，正文里的反引号引用要能在目标文件里找到同名标题。
- 书仓库根目录的 `README.md`：仓库说明页，不是章节。只走第 5–8 步，不套第 1–4 步的任务与结构骨架，不写「常见错误」「自测问题」，不调 `quarto_render_check`；第 8 步发现问题只退回第 5、6、7 步。`README.en.md` 同样处理；`CHANGELOG.md`、`LICENSE`、`AGENTS.md` 不在写作范围。
- 事实与确定性的不变量写在 `SKILL.md`「两种走法」，不复制进各步：不新增事实、数字、命令、性能结论、引文和出处；不把留有余地的说法改成确定说法；围栏里的代码、命令、路径、URL 与 YAML 不改。

改主题文件（CSS、SCSS、字体、palette、导航与 Callout 样式）转 `designing-theme`；它的启用条件写在自己的 `SKILL.md` 里，不由本文决定。

## 4 渲染检查

第 9 步先跑内容与链接脚本，再调 `quarto_render_check`：

- `dry_run: true` 只判断输出目录，最多 2 次：第 1 次返回 `safe_to_render: false` 时只改一次 `output-dir`，第 2 次仍不安全就停住，把 `warnings` 交给用户。
- `dry_run: false` 才运行一次 `quarto render`，最多 1 次；成功时同一次返回 `html_report`，不再为同一份文件重跑。`html_report.usable` 是最终结论。
- 工具与技能共用同一道门禁：不在书里、`_quarto.yml` 不是 `type: book`、或书里没有章节源文件时直接拒绝，不启动渲染。渲染根取 `cwd` 向上最近的合法书根，`qmd_path` 只用来定位卡片。
- 不手跑 `quarto render`，也不截图 PNG；命令超时是 120 秒。实现与返回字段见 `src/tools/render-check.ts`，判定流程见 `steps/09-check.md`。

## 5 执行回执

第 9 步的「完成判据」要求收尾调用一次 `quarto_pass_report`，写作与主题共用：

- 入参是闭集：`skill`、`executed`、`mode`、`files`、`steps`、`held`、`checks`。`executed: false` 时 `mode` 必须是 `skipped` 并给 `skip_reason`，否则卡片会指出前后矛盾。
- 卡片就是回执：技能与模式、改过的文件、改了哪些步骤、未改项、检查结论。回复里不再复述；工具不保存到磁盘，不贴章节原文。
- `steps` 的 `edits` 合计必须等于 `files` 的合计；主题只认六个步骤名，不在名单里的名字（例如 `01-task`）直接拒绝。
- 当前文件不是章节时输出一行 `未执行 writing-quarto：…`；没改也会出卡（`改了 0 处`），把「插件没跑」和「跑了但没改」分开。
- 实现与参数见 `src/tools/pass-report.ts`，完成判据见 `steps/09-check.md`。
