# 版本号与发布顺序

插件自己的版本只有一处：`package.json` 的 `"version"`。`locale/`、`SKILL.md`、`cordis.patch.yml` 都不带版本。

`"engines": { "dsh": ">=0.2.0-rc.1 <0.3.0-0" }` 与 peer `@deepseek-ai/dsh-skill` 是宿主兼容范围，表示能装在哪一档 DSH 上；改章节约定、案例或主题措辞时不动它。

## 当前版本

两个插件统一为 **0.0.1**。这是用户要求的一次重新编号：此前发布过的 0.6.x 只留在 npm 历史里，新线从 0.0.1 开始。npm 允许发布低于历史最高版本的版本号，但会把它设为 `latest`；升级前确认装的是新线，不要把它当旧线补丁。

## 装上之后怎么看版本

- 命令行：`dsh plugin --profile <profile> list`（等价于在该 profile 里跑 `pnpm list`）。
- 磁盘：profile 的 `package.json` 依赖，以及 `node_modules/@chengzhao-dev/dsh-quarto-book/package.json` 的 `version`。
- 运行时加载清单：`dsh --profile <profile> --dump-config`，确认 `# == @chengzhao-dev/dsh-quarto-book` 这一层在。
- 官方「设置 → 插件」只显示模块名和启用状态，不显示版本。

README 默认安装命令跟 npm 的 `latest`；需要固定时写 `@<版本>`（git 写 `#v<版本>`），与 `package.json` 一致。

## 版本档

- **修订号（`0.0.2`…）**：约定措辞、案例、参考文、README、注释、检查词表或提示。绝大多数提交走这一档。
- **次版本（`0.1.0`…）**：新增技能名或工具名、脚本命令行不兼容、主题路径或 `_quarto.yml` 接线契约变化、完成判据变成强制步骤。
- **`1.0.0`**：没有计划。只有维护者明确认定一次特别大的不兼容改动才升。
- **`engines.dsh`**：只在要支持的 DSH 版本窗口变化时改，与上面几档无关。

同一次改动里既有措辞又有契约变化，取较高的那一档。

## 发布

1. 改 `package.json` 与 `package-lock.json` 顶部、`packages[""]`；两份 README 与 `docs/plugin-flow.md` 的安装命令随版本更新。
2. 提交并推送 `main`。`publish.yml` 读 `package.json` 的版本，`npm view @chengzhao-dev/dsh-quarto-book@<版本> version` 查重：不存在就 `npm ci`、`npm test`、`npm publish --provenance`；已存在就跳过发布。
3. 发布成功后，同一个 workflow 在同一个提交上建 annotated `v<版本>` 标签，再用 `gh release create --verify-tag --generate-notes` 建 GitHub Release。
4. 读回：Actions 的 publish run 成功；`npm view ... version` 返回该版本且 `dist.attestations.provenance` 存在；`gitHead` 等于标签指向的提交。

npm 版本不可撤回。任一步失败就停在失败处，不改回版本号、不重复推同一标签；修因后用下一个修订号重来。

## 商店

dsh-market 与官方 Discover 共用一份人工目录，收录源是 awesome-dsh-plugin 的 YAML，不是 npm。发 npm 不会自动进商店；可见、安装、更新、卸载都挂在同一条目录记录和包名 `@chengzhao-dev/dsh-quarto-book` 上。

以后每次发布保持这个包名，按上面的 0.0.x 规则升高；单独文档修改随下一次修订一起走。

写书时不读这份文档：它是本仓库的维护规则，不进任何一步。
