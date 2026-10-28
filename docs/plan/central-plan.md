# 中心方案

这份文档只留两个插件的架构决定、写作规则与交付顺序。开发期的检索记录、逐轮日志和一次性测量数字不入库；结论已经写进技能条文，需要细节时回技能文件查。

## 版本目标

`dsh-quarto-book` 发 **0.6.15**，`dsh-cpp-workflow` 发 **0.6.5**：两者各自在上一条发布线（0.6.14 / 0.6.4）上做补丁递增，不再共用版本号。误发的 `0.0.1` 已从 npm 撤回，并删除 GitHub 标签与 Release；该号作废。README、`package.json`、`package-lock.json`、`versioning.md` 与部署副本保持一致。

## 架构

| 层 | 内容 | 放在哪里 |
| --- | --- | --- |
| 入口 | 何时加载、何时不加载；技能描述与工作区门禁 | 各 `skills/*/SKILL.md`、`docs/triggering.md` |
| 过程 | 一次只开一步，步骤文件给判据与收尾检查 | `skills/*/steps/` |
| 条文 | 单一事实：一个文件只回答一类问题 | `skills/*/references/` |
| 案例 | 正反例与完整章节；只给步骤点名时看 | `skills/*/examples/` |
| 渲染事实 | Quarto/主题/过滤器行为 | `skills/writing-quarto/quarto/`、`designing-theme/` |
| 交付 | 插件调用面、目录与版本规则 | `docs/plugin-*.md`、`docs/versioning.md` |

写作技能保持两个：`writing-quarto` 九步、`designing-theme` 五步。九步不拆也不并：一次任务只开一步，只有整章重写才走全流程。C++ 技能保持三个：`developing-cpp` 四步、`configuring-cmake` 三步、`building-cpp` 三步；三者共享的边界条文只写一次，另外两份用一句话指回。

## 写作规则

- 一章一个关键，章首直接给要解决的问题与范围，不写“本章将”“首先其次最后”。
- 每节先给判断，再给依据；段落按读者任务推进，不按知识分类。
- 状态结论必须带成立条件（如“一方三连而棋盘未满时，空格仍在”），不写没有前提的绝对句。
- 数字、命令、失败出口与版本以工程事实为准；书稿不承诺未实现的能力。
- 术语首用给定义，之后统一；代码标识符保持原文。
- 中文正文全角标点、中英文之间空格、专名保留原文；标题 2–10 字，不用冒号、括号和元叙述。

## 预算

技能正文合计不超过 **140,000** tokens（估算口径：CJK 字符计 1，其他字符 ÷4）。单文件上限：`SKILL.md` 2,000；判断密集步骤 12,000；其余步骤 8,000；条文与案例 5,000。守门脚本 `node scripts/checking-skill-budget.mjs` 与 `checking-skill-links.mjs` 随 `npm run check` 执行。

## 文档纪律

- `docs/` 只放规则、边界、调用面与交付约定；不放检索原文、逐轮日志、字体对比过程或一次性统计。
- 一个判断只有一个权威文件：触发写在 `triggering.md`，调用面写在 `plugin-flow.md`，目录职责写在 `plugin-layout.md`，边界写在 `plugin-boundaries.md`，版本规则写在 `versioning.md`。
- 计划即本文件；已完成的轮次不追加到文末，直接删去。

## 交付顺序

1. 两个插件各自完成本轮代码、技能、文档改动并通过 `npm run check` / `npm test`。
2. 跑 `cpp-board-games` 的 `python .agents/scripts/checking-book.py` 与一次整书渲染，确认书稿正常。
3. 两个插件分别把版本改为 0.6.15 与 0.6.5，更新锁文件、README 安装示例与 `versioning.md`。
4. 重新安装到桌面 profile，核对 `lib/` 与安装副本一致。
5. 两个插件都改完、书稿确认正常后，才推送。
