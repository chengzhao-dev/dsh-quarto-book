# 研究综合：写作与教学层

本文件把 `index.md` 里的研究条目收成可执行结论。每条只回答三件事：规则是什么、凭什么采纳、落点在哪。
只有三份以上互不相同的研究支持才写进「采纳」；只剩一份但会改变现有步骤的，标「适配」；与本项目冲突的，标「舍弃」并写理由。

## 一、判断口径

- **采纳**：至少三份资料独立指向同一做法，且现有步骤没有或写得含糊。
- **适配**：做法合理但与 Quarto Book 的读者、篇幅或已有编号冲突，需要改写后再用。
- **舍弃**：与项目约束冲突，或只是噪声（网络小说、政府公文式章节），只在索引留痕。
- 研究只服务开发期。插件运行时不读 `docs/research/`，技能正文只保留结论，不保留研究过程。

## 二、写作层结论（落点 `skills/writing-quarto/`）

| 规则 | 证据（份数，来源类型） | 落点 |
| --- | --- | --- |
| 段首第一句给结论、契约或读者要做的选择，不铺背景 | 5（DevStories、Simpson 学术写作、微软写作风格、Google 技术写作、LearnCpp） | `steps/04-paragraphs.md`「段首句」 |
| 一段只推进一个动作：说明、举证、划界、收口四选一 | 4（The Elements of Style、文心、金字塔原理、The Craft of Research） | `steps/04-paragraphs.md`「一段一事」 |
| 术语第一次出现给中文与英文，之后固定用中文 | 3（侯捷、《现代汉语规范词典》、微软本地化指南） | `steps/06-wording.md`「术语首次」 |
| 句子以动词开头收束，中文单句不超过 40 字，英文不超过 25 词 | 4（Line by Line、Gopen & Swan、中文文案排版指北、Microsoft Writing Style） | `steps/05-sentences.md`「长度预算」 |
| 删除复述代码的句子与「本节将介绍」这类元叙述 | 3（Writing Tools、Line by Line、LearnCpp 的正文写法） | `steps/08-reread.md`「删句清单」 |
| 先给最小可运行示例，再解释机制；机制解释紧跟示例 | 5（LearnCpp、Python 教程、Rust Book、cppreference 的反例、Effective Modern C++） | `steps/03-blocks.md`「示例先于术语」 |
| 错误写法与边界条件放在正例之后一段，不埋在注里 | 3（PEP 257、Google C++ 风格指南、C++ Core Guidelines） | `steps/04-paragraphs.md`「反例段」 |
| 小节标题用名词短语，不用问句，不用「关于…」 | 3（Google 技术写作、微软写作风格、GitHub Docs 风格） | `steps/02-structure.md`「标题形态」 |
| 章节按「问题—最小例子—机制—边界—练习」推进，每节 60–90 行 | 3（LearnCpp 单元结构、O'Reilly 教材体例、Python 教程） | `steps/02-structure.md`「章节骨架」 |
| 表格只放可对照的同构信息；叙事内容仍写自然段 | 3（Diátaxis、Google 技术写作、本书既有章节对照） | `steps/03-blocks.md`「表格门槛」 |
| 称呼读者用「你」，不写「我们」「大家」；不写自谦与客套 | 3（中文文案排版指北、Microsoft Writing Style、Vale 规则集） | `steps/06-wording.md`「人称」 |
| 中英混排：中文与英文、数字之间加空格；全角标点只用于中文语境 | 3（中文文案排版指北、Apple 中文文案、微软本地化指南） | `steps/07-layout.md`「混排与标点」 |
| 长过程拆成可勾选的步骤，步骤名用动词短语 | 3（composer-ux 的排障小节、bili-scroll 的「装不上先看这五条」、LearnCpp 的 how-to） | `steps/09-check.md`「可跟做检查」 |

## 三、教学节奏（来自 LearnCpp 的 36 批深读）

LearnCpp 每一课都能拆出同一个节奏，本书章节按此对齐：

1. 用一个具体现象或失败输出开场，不先给定义。
2. 给最小可运行示例，紧跟着解释它为什么得到这个结果。
3. 用 Key insight 或最佳实践框只收一条可执行规则。
4. 给反例与边界，说明什么时候不适用。
5. 末尾放练习或自测问题，不新增概念。

落点：`steps/02-structure.md` 的「章节骨架」与 `steps/08-reread.md` 的「收尾检查」。

## 四、暂不采纳

- **每课都配视频或动图**：本书是静态 Book，动图只用于界面演示（`designing-theme` 已有说明）。
- **每节都给完整程序**：篇幅翻倍，且与井字棋主线重复；只在关键转折给完整程序。
- **引入练习答案折叠块**：Quarto 的 callout 折叠已够用，再加一层会与 `checks.json` 的标题规则冲突。

## 五、待下一部分处理

插件架构、设置页、调用链与 token 开销，见 `synthesis-plugin.md`；文件树与交付计划见 `plan/`。
