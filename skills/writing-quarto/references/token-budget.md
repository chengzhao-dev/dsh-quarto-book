# 技能文件的 token 预算

本文件约束技能 Markdown 的体量。它只管加载成本，不替代 `docs/writing-quarto-layout.md` 的分层规则。

## 预算

估算口径：一个 CJK 字符按 1 token，其余字符按 4 字符 1 token 计。`scripts/checking-skill-budget.mjs` 用同一口径检查，`npm run check` 会执行。

| 目录或文件 | 单文件上限 |
| --- | --- |
| `writing-quarto/SKILL.md`、`designing-theme/SKILL.md` | 2000 |
| `steps/02-structure.md`、`steps/03-blocks.md`、`steps/05-sentences.md` | 12000 |
| 其余 `steps/*.md` | 8000 |
| `examples/*.md` | 5000 |
| `quarto/*.md` | 5000 |
| `designing-theme/references/theme-system.md` | 8000 |
| 其余 `references/*.md`、`knowledge/*.md` | 6000 |
| `assets/**/meta.md` | 2000 |
| 全部技能 Markdown 合计 | 140000 |

## 怎么用

- 新增规则先判断属于哪一层，再写进已有文件；同一判定只成文一处，其他位置写引用。
- 文件将超限时，先删重复、合并同源条目，再考虑拆成同目录的新文件；拆文件后同步入口和 `scripts/checking-skill-links.mjs`。
- 单章润色只加载 `SKILL.md` 与当前一步；不要为了省 token 把整本书的规则塞进 `SKILL.md`。
- 预算不是目标：没必要的条文直接删，不靠缩写把句子压成暗语。
