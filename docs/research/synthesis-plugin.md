# 研究综合：插件架构与调用层

## 一、骨架三层（两插件同构）

1. **组合层** `cordis.patch.yml`：只 `insert` 一行，`id` 固定，`name` 用包名。安装即解析 `main`。
2. **入口层** `lib/index.js`（源码 `src/index.ts`）：注册技能 provider 或工具；`inject` 只写真正用到的服务。
3. **资产层** `skills/<name>/`：`SKILL.md` 加 `steps/`、`references/`、`examples/`、`scripts/`、`assets/`。资源基址用技能目录，相对路径在安装包里解析。
4. **客户端层**（仅需要界面时）：`dsh.client.platform = web`，`exports["./client"]`，半侧只挂 `dsh-client-ui-slots` 一个注入；不得与入口同文件。

证据：composer-ux、session-manager、bili-scroll、wallpaper-engine、dsh-TUI、ops、skills-manager 七份 README 的骨架描述一致；与研究索引里 `docs/plugin-layout.md` 的层级图对照。

## 二、调用链与优先级

- 会话启动 → loader 读 profile 的 patch → 按 `main` 加载入口 → 入口 `inject: ['skills']` → `registerProvider`。
- 每次列技能：`list({ cwd })` → 入口先做**工作区门禁**（本项目要求 git 根上存在 `.agents/skills/cpp-workflow-project/SKILL.md`）→ 读 `skills/*/SKILL.md` 的 frontmatter → 返回候选。
- 选中后：`get(candidate, { cwd })` → 重新校验门禁与目录包含关系 → 返回 frontmatter 与正文。
- 名次：项目技能 200、用户技能 500、本包 550、内置 600。**同名覆盖**由名次决定，所以包内技能名必须与项目技能名不同（`cpp-workflow-project` 与 `developing-cpp` 不冲突）。
- 客户端：`settings.section` 与 `plugins.bundle.config` 两个挂点共用组件；保存走宿主 `form.mutate`，配置字段必须 `.volatile()`。

**已修的异常**：会话 cwd 不在书内时 `quarto_render_check` 直接拒绝（改为从 `qmd_path` 反查书根）；检查器根目录不存在时抛 Node 堆栈（改为用法错误退出 2）；`checking-comments.mjs` 仍接受旧横幅（0.6.2 已删，横幅改为纯注释）。

**仍存的缺失**（写入计划，不在本轮修）：
1. `settings.section` 与插件页配置卡片共享同一个 `form`？实测设置节没有 `form`，只读展示 + 跳转按钮，这是当前设计取舍，需在文档里写清。
2. 技能正文没有版本号；升级插件后旧技能缓存仍在会话里，需要「重启提示」或正文首行写版本。
3. `locale/` 只有市场摘要，设置页文案内联在 `client.js`，两套字符串可能漂移。

## 三、Token 账

| 目录 | 字节 | 约计 token | 判定 |
| --- | --- | --- | --- |
| `dsh-quarto-book/skills/writing-quarto` | 276 KB | 约 92K | 偏大；靠「本轮只开一步」压到单步 4–8K |
| `dsh-quarto-book/skills/designing-theme` | 48 KB | 约 16K | 可接受 |
| `dsh-cpp-workflow/skills` 三个 SKILL.md | 约 22 KB | 8.2K | 已压到限额内 |
| `dsh-cpp-workflow/skills/*/steps` | 约 40 KB | 约 13K | 单步 1.5–3K |

结论：**技能体积不是问题，一次读多少才是**。沿用「一次只开一步 + 一份条文」的规则，并在 `SKILL.md` 的激活上限里写死。

## 四、界面取经（设置页与 README）

- 设置页版式：顶部一句「设置什么、影响什么」，下面分区；每行「标签列 + 控件列 + 一行说明」；只读出厂设置时所有控件禁用并给跳转入口。证据：composer-ux、wallpaper-engine、skill-manager 的设置卡片、VS Code 设置的「设置 → 每项一行」。
- 写作版式：README 先给一句定位 + 三条命令，再给「能力 / 边界 / 排障」；「已验证 / 未验证」分开写。证据：session-manager、composer-ux、agent-teams。
- 市场文案：`description` 与 `catalog.summary` 同句，中文在前英文在后，不超过 300 字。

## 五、采纳与舍弃

采纳：三层骨架、名次表、单步激活、设置页三列、README 三段。

舍弃：客户端自建配置表单（与宿主 `form` 冲突，配置会分裂）；插件内自带网络请求（越权，且违反 `connection.requestRejection`）；自动重启宿主（超出插件职责）。
