# 技能文件的 token 预算

本文件约束技能 Markdown 的体量。它只管加载成本，不替代 `docs/module-layout.md` 的分层规则。

## 预算

估算口径：一个 CJK 字符按 1 token，其余字符按 4 字符 1 token 计。插件根的 `scripts/checking-skill-budget.mjs` 用同一口径检查，`npm run check` 会执行；本文提到的脚本与 `npm` 命令都在插件根运行。技能文件按每汉字 1 token 计预算，章节按 1.5 计（见 `steps/02-structure.md`「分层上限」），两者不可直接换算。

| 目录或文件 | 单文件上限 |
| --- | --- |
| `writing-quarto/SKILL.md`、`designing-theme/SKILL.md` | 2000 |
| `writing-quarto/token-budget.md` | 2000 |
| `steps/02-structure.md`、`steps/03-blocks.md`、`steps/05-sentences.md` | 12000 |
| 其余 `steps/*.md` | 8000 |
| `writing/examples/*.md` | 5000 |
| `quarto/*.md` | 5000 |
| `designing-theme/theme/03-theme-system.md` | 8000 |
| 其余 `writing/*.md`、`theme/*.md` | 6000 |
| `assets/**/meta.md` | 2000 |
| 其余 `.md`（含新增技能目录） | 6000 |
| 全部技能 Markdown 合计 | 140000 |

单次激活上限：`SKILL.md` + 1 个步骤 + 1 个被点名文件（案例、条文或脚本路径）；第 8 步允许 2 个被点名文件。**九步同走**只用于新章、整章改写或用户明确要求全章处理；同轮不把该步点名的案例与条文一起打开。

## 怎么用

- 新增规则先判断属于哪一层，再写进已有文件；同一判定只成文一处，其他位置写引用。
- 文件将超限时，先删重复、合并同源条目，再考虑拆成同目录的新文件；拆文件后同步入口和插件根 `scripts/checking-skill-links.mjs`。
- 余量低于 1000 token 时，先删 `SKILL.md` 与 `steps/04-paragraphs.md` 的重复条目，再从预算表末行往前拆出同目录新文件并同步入口；禁止调高合计上限。
- 单点修改只加载 `SKILL.md`、当前一步与该步点名的一个文件；不要为了省 token 把整本书的规则塞进 `SKILL.md`。
- 预算不是目标：没必要的条文直接删，不靠缩写把句子压成暗语。
