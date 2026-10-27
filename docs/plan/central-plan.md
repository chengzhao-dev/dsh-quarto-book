# 中心计划：两插件与书稿的整体改造

## 0. 目标

1. `dsh-quarto-book`：0.6.13 → **0.6.14**。把写作规则收进步骤与条文，重构研究目录，补清点句检查与 build 忽略。
2. `dsh-cpp-workflow`：0.6.3 → **0.6.4**。统一 Doxygen 规则与注释示例，压平设置页文案，修 token 与调用链问题。
3. `cpp-board-games`：按新规则重写 14 个 qmd 与 `board.h` / `board.cpp` 的注释，逐章校验后渲染一次。
4. 全部本地校验通过后再推送。每轮只做一件事，做完必须校验，不通过不开下一轮。

## 1. 现状差距（来源：`docs/research/synthesis.md`、`synthesis-plugin.md`）

| 差距 | 位置 | 处理 |
| --- | --- | --- |
| 步骤文件里同一规则写两遍，措辞不一致 | `steps/04-paragraphs.md`、`steps/05-sentences.md` | 合并到一处，另一处留指针 |
| 缺少「清点句 / 元叙述句」检查 | `scripts/verifying-content.py` | 新增两条规则与测试 |
| 研究目录无索引、无综合 | `docs/research/` | 已建 `index.md`、`synthesis.md`、`synthesis-plugin.md` |
| 渲染输出未忽略 | 仓库根 `.gitignore`、`verifying-content.py` | 已修 |
| `board.h` 文件头注释与正文脱节 | `games/tictactoe/tictactoe/include/board.h` | 按模板重写头注释 |
| 03 章只给声明也讲实现 | `content/tictactoe/03-board.qmd` | 补定义或删解释，逐段重写 |
| 设置页只读入口无说明 | `dsh-cpp-workflow/src/client/app.cjs.js` | 文案与禁用态已统一，补文档 |
| 旧横幅注释残留 | `checking-comments.mjs`、条文 | 0.6.2 已删，补测试守 |

## 2. 架构

```
研究层（仅开发期）            规则层（进插件）                执行层（代理读）
docs/research/index.md   →   skills/*/steps/*.md        →   一次只开一步
docs/research/synthesis*.md  skills/*/references/*.md        + 一份条文
                              scripts/checking-*.py/mjs      → 校验后才结束
```

- 研究条目只保留「做法 + 落点」，不复制原文。
- 规则层每份步骤文件顶部写「本步只解决什么」，末尾写「完成判据 + 检查命令」。
- 执行层靠两条硬约束压 token：一步一文件、一份条文。

## 3. `dsh-quarto-book` 目录树（本计划落地后）

```
dsh-quarto-book/
├── SKILL.md            # 技能入口与九步索引
├── steps/              # 01–09 步文件
├── references/         # 规则卡与条文
├── examples/           # 正反例
├── scripts/            # 内容校验脚本
├── quarto/             # 渲染与布局
├── assets/             # 模板与片段
└── docs/               # 研究索引与计划
```

新增文件：`scripts/checking-shortcuts.py`（清点句、元叙述、重复句三类检查）与对应测试；`references/rules-cards.md`（把 50/100 份研究的结论压成 30 张卡片，供代理按需读取）。

## 4. `dsh-cpp-workflow` 目录树

```
dsh-cpp-workflow/
├── src/                # 入口与标签策略
├── src/client/         # 设置页前端
├── skills/             # 三个技能
└── docs/               # 布局与版本说明
```

## 5. 分轮次与验收

| 轮 | 内容 | 验收 |
| --- | --- | --- |
| P1 | 规则卡 `references/rules-cards.md`（30 张） | `verifying-content.py` 通过；卡片数与来源对得上 |
| P2 | 合并重复规则、补清点句检查 | `checking-prose.py`、`verifying-content.py` 全绿；新增测试 3 条 |
| P3 | `board.h` / `board.cpp` 文件头与注释重写 | `checking-comments.mjs` 退出 0；与正文引用一致 |
| P4 | 03 章逐段重写（声明与定义配对） | `checking-book.py`；章节内代码块与源码逐字一致 |
| P5 | 其余 13 个 qmd 按规则卡润色 | 每章 `checking-book.py`；`verifying-content.py --strict` |
| P6 | cpp 插件文案与设置页面文案 | `npm test`；截图核对 |
| P7 | 版本号、changelog、README、版本钉 | `npm run build`、`pack:check` |
| P8 | 双插件全量校验 + 书稿构建 + 渲染 | 两插件测试、书 build、`quarto render` 一次 |
| P9 | 推送 | `git ls-remote` 读回 |

## 6. 研究结果如何交给执行代理

- `docs/research/index.md`：全量索引，开发期查阅，不进包。
- `references/rules-cards.md`：从索引蒸馏出的 30 张卡，每张「规则 / 正例 / 反例 / 所属步骤」，进包，代理按需读取一张。
- 步骤文件只写被采纳的结论；卡片编号写进步骤文件末尾，便于追溯。
- 禁止把 100 份研究的原文或长摘录塞进技能，避免 token 失控。

## 7. 风险

- 规则卡过多会稀释重点：上限 30 张，超过就合并。
- 03 章重写可能与 04/05 章的叙述重复：以「一章一个关键」为准，重复处改成指针。
- 设置页文案改动影响测试快照：先改测试再改文案。
