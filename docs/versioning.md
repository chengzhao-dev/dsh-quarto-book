# 版本号与发布顺序

插件自己的版本只有一处：`package.json` 的 `"version"`。`locale/`、两份 `SKILL.md`、`cordis.patch.yml` 都不带版本。

旁边的 `"engines": { "dsh": ">=0.2.0-rc.1 <0.3.0-0" }` 与 peer `@deepseek-ai/dsh-skill` 是宿主兼容范围，表示能装在哪一档 DSH 上。改章节约定、案例或主题措辞时不动它。

## 装上之后怎么看版本

- 命令行：`dsh plugin --profile <profile> list`（等价于在该 profile 里跑 `pnpm list`），读出已解析的包版本。桌面应用跑的是 `desktop` profile，它由应用独占管理，命令行只读不写。
- 磁盘：profile 的 `package.json` 里 `dependencies`，以及 `node_modules/dsh-quarto-book/package.json` 的 `version`。
- 运行时加载清单：`dsh --profile <profile> --dump-config`，确认 `# == dsh-quarto-book` 这一层在。官方「设置 → 插件」只显示模块名和启用状态，不显示版本。

README 里的安装命令钉住一次发布：npm 写 `@0.3.3`，git 写 `#v0.3.3`。不带版本号的 `github:` 地址跟踪默认分支的某次提交，`package.json` 的版本号不会自动变成发布号。

## 三档

到达 `1.0.0` 之前停在 `0.x`。抬哪一档只看对外契约，不看改了多少字。

- **修订号（`0.1.1`、`0.2.1`…）**：约定措辞、正反例、参考文、README、注释、不改变既有书通过与否的检查词表或提示。以后绝大多数提交走这一档。
- **次版本 `0.2.0`、`0.3.0`**：新增技能名或工具名、新增会让旧书失败的检查、脚本命令行不兼容、主题路径或 `_quarto.yml` 接线契约变化、完成判据变成强制步骤。
- **`1.0.0`**：技能名、工具名、cwd 门禁、脚本入口和「项目只放 `quarto-book-project`」这些对外契约冻结，并承诺以后的修订号不再让旧书突然失败。
- **`engines.dsh`**：只在要支持的 DSH 版本窗口变化时改，与上面三档无关。DSH 进入 `0.3` 时再把上界打开。

同一次改动里若又有措辞又有破坏性检查，取较高的那一档。

```mermaid
flowchart TD
  change[一次改动] --> host{要改能安装的 DSH 版本窗口}
  host -->|是| engines[只改 engines.dsh]
  host -->|否| contract{技能名 工具名 脚本入口 或会让旧书失败的检查}
  contract -->|是| minor[次版本 0.3.0]
  contract -->|否| patch[0.x 修订号]
```

## 发布

发布时三处一起动：`package.json` 的 `version`、`package-lock.json` 顶部的版本、同号的 annotated git tag（`0.3.3` 对应 `v0.3.3`）。不在 `SKILL.md` 里再维护一套包版本。

发布走 npm trusted publisher，本机不执行 `npm publish`，也不执行 `npm trust github`。顺序固定：

1. 提交并推送默认分支，先不打标签。
2. 只读核对：`npm view dsh-quarto-book version` 应仍是上一个发布号；`npm whoami` 未登录就停；`npm trust list dsh-quarto-book --json` 要能匹配 GitHub Actions、仓库 `chengzhao-dev/dsh-quarto-book`、文件 `publish.yml`、动作 `npm publish`。
3. 关联不匹配就停住，把 `npm trust github dsh-quarto-book --repository chengzhao-dev/dsh-quarto-book --file publish.yml --allow-publish` 交给用户执行。用户回复「publisher 已配置」后重查，不自行执行，也不跳过。
4. 关联匹配后打 annotated `v0.3.3` 并推送；`publish.yml` 在 `v*` 标签上运行。
5. 以 Actions 全绿且 `npm view dsh-quarto-book@0.3.3 version` 返回 `0.3.3` 为发布完成。npm 上的版本不可撤回，失败就停在那里，不改回版本号。

关联登记后两天内必须推标签；过期就重新登记，不沿用旧凭据。

`.github/workflows/publish.yml` 只在 `v*` 标签上运行，权限是 `contents: read` 与 `id-token: write`，不设 GitHub Environment。步骤是 checkout、`actions/setup-node@v6`（Node 24、`registry-url: https://registry.npmjs.org`）、`npm ci`、`npm test`、`npm run build`、`npm publish --provenance`。`package.json` 的 `repository.url` 保持 `git+https://github.com/chengzhao-dev/dsh-quarto-book.git`，`publishConfig` 为 `access: public` 与 `provenance: true`。

发布后两种安装各钉各的：git 用 `#v0.3.3`，npm 用 `@0.3.3`。

写书时不读这份文档：它是本仓库的维护规则，不进任何一步。
