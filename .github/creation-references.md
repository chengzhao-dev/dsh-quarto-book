# 创建参考

本插件不是从零设计的。它从 DSH 官方文档、下载量靠前的社区插件和六个同类写作参考中取形状；下面记录每个来源被采用的部分，便于后续维护时判断哪些设计是借来的、哪些是本仓自己的约束。

## 官方文档

- 发布与 bundle 形状：<https://deepseek-harness.github.io/deepseek-harness/en/develop/basic/publish>
  - 采用：`type: module` + `main` 入口、`dsh.bundle.patch`、`engines.dsh`、`files` 白名单、peer/dev 双声明。
  - 采用：入口只导出 `name`、`inject` 与 `apply()`，不 import 宿主实现；补丁只 `insert` 一行。
- 包展示元数据（中文）：<https://deepseek-harness.github.io/deepseek-harness/zh/develop/basic/adding-a-package>
  - 采用：`locale/en.json` 与 `locale/zh.json` 的 `meta.title`、`meta.description`；`icon.svg` 自包含且不超过 256 KiB。
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
