# 创建参考

本插件不是从零设计的。它从 DSH 官方文档、下载量靠前的社区插件和六个同类写作参考中取形状；下面记录每个来源被采用的部分，便于后续维护时判断哪些设计是借来的、哪些是本仓自己的约束。

## 官方文档

- 发布与 bundle 形状：<https://deepseek-harness.github.io/deepseek-harness/en/develop/basic/publish>
  - 采用：`type: module` + `main` 入口、`dsh.bundle.patch`、`engines.dsh`、`files` 白名单、peer/dev 双声明。
  - 采用：入口只导出 `name`、`inject` 与 `apply()`，不 import 宿主实现；补丁只 `insert` 一行。
- 包展示元数据（中文）：<https://deepseek-harness.github.io/deepseek-harness/reference/cookbook/adding-a-package>
  - 采用：`locale/en.json` 与 `locale/zh.json` 的 `meta.title`、`meta.description`；`icon.svg` 自包含且不超过 256 KiB。
  - 不采用：前排 UI 插件用 `dsh.client` 把界面模块带进设置页；这个仓库只导出服务端技能与工具，不声明 `dsh.client`，也不抄那套构建。
- 技能子系统：<https://deepseek-harness.github.io/deepseek-harness/en/reference/subsystems/skills>
  - 采用：提供者接口 `{ name, list, get }`、候选字段 `rank` / `locator` / `resourceBase`、目录型资源基址。
  - 采用：包内 rank 550，数字大于项目 `.dsh/skills`（100）与 `.agents/skills`（200），优先级更低，同名项目技能可以覆盖。

## 前 20 下载插件的共同形状

数据快照：<https://www.dsh.so/data/npm-downloads.json>（2026-10-17 周榜，来源标注 dsh.so，CC-BY-4.0）。对 20 个包逐一读取 npm 元数据与 README 后得到：

- 20/20 声明 `dsh` bundle；`lib/index.js` + `cordis.patch.yml` 是主流入口组合。
- README 以中文为主：17/20 的正文主要是中文，3/20 是英文（`dsh-better-sidebar`、`dsh-context`、`@nanmicoder/dsh-agent-teams`）。
- 18/20 的 README 提供 `English` 入口，8/20 同时给出 `简体中文` 入口；切换链接通常在标题或 badge 之后，不在首行。
- 10/20 的包描述含中文，常见写法是中文在前、` · ` 后接英文；其余为纯英文描述。
- 6/20 声明 `icon`；本插件补上 `icon.svg` 与双语 `locale`，以改善插件市场展示。

结论：README 以中文为主、按需提供英文切换；包描述中英并列或纯英文；安装命令只写官方 `dsh plugin add` 一种。

## 同类写作插件

六个参考，只取形状与约束，不搬它们的流程和状态：

| 仓库 | 版本 | 采用 | 未采用 |
| --- | --- | --- | --- |
| [lunheng-article-pipeline](https://github.com/zuoyunlai/lunheng-article-pipeline-dsh) | `19.18.1` | 一层 `skills/<name>/SKILL.md`；`files` 含 `skills` 与 `lib`；`exports` 暴露入口、补丁与 `package.json`；每个技能独立目录 `resourceBase` | 九角色长流程、子代理编排、插图交付 |
| [dsh-plugin-writing-guard](https://github.com/xmutfyh/dsh-plugin-writing-guard) | `2.0.1` | 确定性检查放独立 Python 脚本，技能正文只写标准与调用方式；`files` 明确列脚本目录 | 论文投稿与 Word 包校验 |
| [@waterwx/dsh-novel-forge](https://github.com/watersxya/dsh-novel-forge) | `2.5.1` | `keywords` 同写 `dsh`、`dsh-plugin`、`deepseek-harness`；样式检查拆独立脚本；`files` 只列要发布的目录 | 侧栏、章节生成、`src/` 运行时 |
| [@max-null/dsh-draft-polish](https://github.com/Max-Null/dsh-draft-polish) | `0.2.5` | README 双语镜像；入口与补丁最小；设置只存在插件配置里 | 输入框润色按钮、会话草稿回填 |
| [DEEP-IOS/dsh-humanizer](https://github.com/DEEP-IOS/dsh-humanizer) | `latest` 与 `next` 双通道 | 把「保留作者声音、事实与进度」写成硬约束；用原文锚点对照「过度改写」；理论材料按需返回 | SQLite 记忆、21 章理论、21 个工具、常驻写作引导 |
| [op7418/Humanizer-zh](https://github.com/op7418/Humanizer-zh) | blader/humanizer `v3.0.0` 汉化 | 31 个检查点分 A–F 六类；把假对比、起跑式铺垫、意义拔高、空泛高频词、客服腔、编辑过程残留写进第 5、6 步的「情况：」 | 独立 `/humanizer-zh` 入口、AI 检测叙述 |

采用的部分都落回本仓的分层：每条规则带修改条件、前后示例与保留边界；没有问题的句子不改，不要求每次调用都产生修改。

## 本仓自己的约束

- 技能只从 `skills/*/SKILL.md` 发现，不递归扫描；模板放在 `templates/`，不会被注册。
- 主题资产是本插件的一部分，不声称与任何外部仓库共享；项目若复制主题，以项目 `_quarto.yml` 的路径为准。
- 所有项目专属内容（章节表、术语、命令、专属校验）留在项目的 `quarto-book-project` 技能里，插件正文不写死。

## 2026-10-26 边界、通用性与 token 的补充调研

这一轮为「表格与插件瘦身」重查了宿主技能子系统、Agent Skills 公开材料、下载榜头部插件和渐进披露插件。结论只用于约束本仓的形状，不据此新增依赖。

### 宿主技能子系统

来源：<https://deepseek-harness.github.io/deepseek-harness/en/reference/subsystems/skills>（2026-10-26 取到）。

- 常驻目录只有 `name`、`description`（可选 `whenToUse`），`description` 默认截断在 500 字符；正文不进目录，`get()` 每次重读。
- 本地扫描 rank：`project-dsh` 100、`project-agents` 200、`custom` 300、`user-dsh` 400、`user-agents` 500、`bundled` 600；同层内才按 rank、provider 注册序、本地序决胜，跨层是更近的层直接覆盖。
- 名称 kebab-case；只接受 `<name>/SKILL.md` 或 `<name>.md`，不递归 `**/SKILL.md`；provider 名在同一层内唯一。
- 采用：本仓继续每个技能一个目录、rank 550 低于项目层；三个 `description` 是唯一常驻成本，必须写清触发条件而不是流程摘要。

### 渐进披露与 token

- Anthropic《Equipping agents…》<https://www.anthropic.com/research/equipping-agents-for-the-real-world-with-agent-skills>：启动只预载名称与描述，正文按相关性读取，脚本可直接执行而不读入上下文；原文「If certain contexts are mutually exclusive or rarely used together, keeping the paths separate will reduce the token usage.」
- [dsh-skill-tier](https://dsh-plugin.org/plugins/pandarayc/dsh-skill-tier)：把 28 个成员的目录从 2,901 token 折成 119 token（约 96%），Tier 0 索引约 +78 至 +121 token，`rank` 默认 350，零依赖、单文件、未配置时零候选；其 FAQ 明确成员目录不能再作扫描根、同层重复 provider 不激活、超过 500 字符的描述会被截断。
- 采用：`references/token-budget.md` 的「单次激活上限」与步骤文件只点名一份案例，和三层披露同向；不引入索引插件，技能目录本身已经只有名称与描述。
- 不采用：把九步再折成按需生成的索引技能；本仓技能数量少，生成层会多一次发现与失效。

### 头部插件的边界与联动

数据：<https://www.dsh.so/data/npm-downloads.json>（`generatedAt` 2026-10-26T00:11:21Z，`snapshotDate` 2026-10-25，窗口 10-18 至 10-25，CC-BY-4.0）。前 100 名没有包名含 `cpp`、`cmake`、`clang`、`quarto`、`ninja` 的插件。

- [billion-context](https://registry.npmjs.org/billion-context/latest)（第 1）：只声明 `dsh.bundle.patch` 与 `dsh.client.platform=web`，没有 `peerDependencies`，也不锁 `engines.dsh`；关键词跨 Claude Code、Codex、Cursor 等宿主。
- `@T-Auto/dsh-ops`（第 7）、`@nanmicoder/dsh-agent-teams`（第 21）：用 peer 范围锚定 `@deepseek-ai/dsh*`，`dsh.client.inject` 只列自己真正接管的模块。
- `@michengai/dsh-code-review`（第 53）：独立上下文读取 Git、相关代码与测试，「不提前注入全仓代码快照」。
- `@michengai/dsh-skills-manager`（第 9）：只改自己的元数据，不侵入第三方技能文件。
- 采用：一个插件只声明一个能力面；不复制宿主已有的压缩、权限、目录能力；联动只走 `dsh.bundle.patch`、`dsh.client.inject`、`ctx.tools.restrict()`、`system-prompt/assemble` 这类公开缝；审查类工作交给子代理自取证。
- 不采用：为进入市场而增加客户端界面或运行时依赖；本仓保持服务端技能与工具，默认惰性。
