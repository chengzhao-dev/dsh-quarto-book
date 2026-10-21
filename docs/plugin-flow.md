# 从安装到执行回执

本文写给排障的人和回看的维护者，回答「装好之后，哪一层在什么条件下生效」。技能正文不读本文，写作约束都在 `skills/writing-quarto/SKILL.md` 与 `skills/designing-theme/SKILL.md` 里。

## 五层

| 层 | 读者看到什么 | 生效条件 | 排障入口 |
| --- | --- | --- | --- |
| 1 安装 | 插件出现在 profile 的依赖里 | `dsh plugin --profile <profile> add npm:@chengzhao-dev/dsh-quarto-book@0.4.2` 成功，profile 的 `package.json` 有这条依赖 | `docs/versioning.md` |
| 2 书门禁 | 选题里能看到 `writing-quarto`、`designing-theme` | 会话 `cwd` 向上到 git 根，沿途 `_quarto.yml` 有一行独立的 `type: book`，且这本书至少有一个章节源文件 | `docs/plugin-boundaries.md` |
| 3 按文件分流 | 章节走九步，书根 README 只走第 5–8 步，主题转另一个技能 | 第 2 层通过 | `skills/writing-quarto/SKILL.md` |
| 4 检查与渲染 | 内容与链接脚本通过，`quarto_render_check` 返回 `html_report` | 与第 2 层同一道门禁 | `skills/writing-quarto/steps/09-check.md` |
| 5 执行回执 | 一轮结束时出现 `quarto_pass_report` 卡片 | 完成判据要求收尾调用一次；写作与主题共用 | `skills/writing-quarto/steps/09-check.md` |

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

装好后 profile 的 `package.json` 里出现 `@chengzhao-dev/dsh-quarto-book`。`package.json` 的 `name` 与 `cordis.patch.yml` 里 `- name:` 必须逐字一致；不一致时补丁插不进去，工具和技能都不会注册。

profile 里还留着旧的无作用域包 `dsh-quarto-book` 时，先删旧包再装新包；两个包同时留着会各注册一遍同名技能。版本号与发布步骤见 `docs/versioning.md`。

## 2 书门禁

插件没有常驻进程，也不会在会话开始时自动执行技能。`apply()` 注册技能 provider 与两个工具，不写文件。`list({ cwd })` 只在发现候选时做一次有界只读检查：

- 从会话 `cwd` 向上找到 git 根，第一个声明 `type: book` 的 `_quarto.yml` 所在目录就是书根；书根里还要有至少一个 `.qmd` 或 `.md` 章节源文件。说明文件不算章节，生成与依赖目录不参与扫描。
- 判定实现是 `src/workspace.ts` 的 `findBookRoot` 与 `isQuartoBookWorkspace`；扫描上限是 4000 个目录项、12 层，最多向上 64 层找 git 根。
- 技能名出现只说明当前会话过了门禁，不代表已经加载；只有调用 `skill` 才读写技能正文。
- `get()` 带 `cwd` 时重新过同一道门禁；不带 `cwd` 时只服务已经加载的 candidate。

六类情形与判定顺序见 `docs/plugin-boundaries.md`。

## 3 按文件分流

入口是 `writing-quarto` 的 `SKILL.md`：`适用场景` 说明哪些文件归它管，`两种走法` 写增量润色与全章重构的分岔和不变量，`九步` 列出每一步对应的 `steps/` 文件，`完成判据` 说明什么时候可以停。每一步只打开同号的一个文件；判不准才打开 `examples/` 里同号的案例；要排图、查渲染或全仓重构才打开 `quarto/`。

- 章节（`content/**/*.qmd`、`index.qmd`）：走完整九步。每一步的「情况：」标题下是只在特定场景才生效的追加判定，正文里的反引号引用要能在目标文件里找到同名标题。
- 书仓库根目录的 `README.md`：仓库说明页，不是章节。只走第 5–8 步，不套第 1–4 步的任务与结构骨架，不写「常见错误」「自测问题」，不调 `quarto_render_check`；`README.en.md` 同样处理，`CHANGELOG.md`、`LICENSE`、`AGENTS.md` 不在写作范围。
- 事实与确定性的不变量写在 `SKILL.md`「两种走法」，不复制进各步。改主题文件（CSS、SCSS、字体、palette）转 `designing-theme`；其余文件不归本插件。

## 4 检查与渲染

第 9 步先跑内容与链接脚本，再调 `quarto_render_check`：

- 项目技能列了检查命令时按它执行，否则跑本技能 `scripts/verifying-content.py` 与 `checking-links.py`。
- `dry_run: true` 只判断输出目录，最多 2 次：第 1 次返回 `safe_to_render: false` 时只改一次 `output-dir`，第 2 次仍不安全就停住，把 `warnings` 交给用户。
- `dry_run: false` 才运行一次 `quarto render`，最多 1 次；成功时同一次返回 `html_report`，不再为同一份文件重跑。`html_report.usable` 是最终结论。
- 工具与技能共用同一道门禁；渲染根取 `cwd` 向上最近的合法书根，`qmd_path` 只用来定位卡片。不手跑 `quarto render`，也不截图 PNG；`quarto render` 超时 120 秒，Python 检查脚本超时 60 秒。实现见 `src/tools/render-check.ts`，判定流程见 `steps/09-check.md`。
- 返回字段固定为 `warnings`、`errors`、`safe_to_render`、`suggested_output_dir`、`render_result`、`html_report`；渲染完成时 `html_report` 含 `usable`、`checks`、`output_files`、`output_files_total`，`checks` 每项是 `{ id, status, detail }`，`status` 只取 `pass`、`fail`、`skip`，没有 `fail` 时 `usable` 为 true；`output_files` 超过 30 个时只列前 30 个，总数在 `output_files_total`。工具失败后不自动重试。

成功渲染时的返回形状（`output` 只保留末尾若干行）：

```json
{
  "warnings": [],
  "errors": [],
  "safe_to_render": true,
  "suggested_output_dir": "_book",
  "render_result": { "ok": true, "exit_code": 0, "duration_ms": 8421, "output": "…" },
  "html_report": {
    "usable": true,
    "checks": [{ "id": "index_html", "status": "pass", "detail": "…" }],
    "output_files": ["index.html"],
    "output_files_total": 1
  }
}
```

## 5 执行回执

第 9 步的「完成判据」要求收尾调用一次 `quarto_pass_report`，写作与主题共用：

- 入参是闭集：`skill`、`executed`、`mode`、`files`、`steps`、`held`、`checks`。`executed: false` 时 `mode` 必须是 `skipped` 并给 `skip_reason`；`mode` 取 `polish`、`rewrite`、`theme`、`skipped`，`files` 最多 8 个 `{ path, edits }`，`held` 取 `fences`、`facts`、`css`、`prose`，`checks` 取 `content`、`html`、`layout`，状态只取 `pass`、`fail`、`skip`。
- 卡片就是回执：技能与模式、改过的文件、改了哪些步骤、未改项、检查结论。回复里不再复述；工具不保存到磁盘。
- `steps` 的 `edits` 合计必须等于 `files` 的合计；主题只认六个步骤名。当前文件不是章节时输出一行 `未执行 writing-quarto：…`；没改也会出卡。

实现与参数见 `src/tools/pass-report.ts`，完成判据见 `steps/09-check.md`。
