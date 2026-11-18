---
name: quarto-book-project
description: 记录某一本 Quarto Book 的项目级约定：书名、读者、术语、渲染与检查命令、主题与过滤器路径；本文件是插件提供的模板，复制到书的 .agents/skills/ 后随书维护
---

# 项目级 Quarto Book 约定

> 这是模板，不是可直接加载的技能。复制到目标书的
> `.agents/skills/quarto-book-project/SKILL.md`，按项目实际内容填写。
> 插件自带的 `writing-quarto` 与 `designing-theme` 会在这份文件存在时先读它，
> 再按「章节对照」一节指向 `writing/chapter-map.md`；不存在时跳过，不猜测项目约定。
> 通用写法、结构和主题规则留在插件技能里，本文件只写这本书自己的事实。

## 书名与读者

- 书名：
- 一句话定位：
- 目标读者与前置知识：
- 读者完成后能独立完成：
- 本书不覆盖的内容：
- 术语首次解释的落点（就近术语卡 / 章首术语表）：

## 章节对照

- 章节顺序的唯一来源：根 `_quarto.yml` 的 `book.chapters`。
- 每章的类章或能力章、关键对象、`title` 与二级标题：`writing/chapter-map.md`。
- 目录布局：正文按部分放在书根的章节目录（默认 `chapters/<part>/`），章节写成 `chapters/<part>/<NN>_<chapter>.qmd`；附录放在 `chapters/appendix/`，由根 `_quarto.yml` 的 `appendices` 引用。
- 命名：目录名与文件名内的词间分隔用下划线，不用连字符；`index.qmd` 必须留在书根，Quarto 只把书根的同名文件当首页。
- 渲染范围：Book 只渲染 `chapters` 与 `appendices` 列出的文件，目录里未登记的 `.qmd` 不会出现在产物中。
- 改文件名时同轮同步 `_quarto.yml`、章节对照、`title` 和已有链接。

## 术语表

| 术语 | 定稿写法 | 禁用写法 | 首次出现时的解释 |
| --- | --- | --- | --- |
|  |  |  |  |

## 渲染与检查命令

- 内容检查：`<插件技能目录>/scripts/verifying-content.py --root <book>`。
- 链接检查：`<插件技能目录>/scripts/checking-links.py --root <book>`。
- HTML 可用性：只调 `quarto_render_check`，`qmd_path` 传当前章节；`dry_run: true` 最多 2 次，`dry_run: false` 最多 1 次。
- 优先用工具渲染并检查；不手跑 `checking-output.py` 或 `checking-callouts.py`，这些检查由工具按书配置调用。只有工具报产物缺失或需要人工复现排版时才在书根手跑一次 `quarto render`。
- 项目专属词表：同目录 `checks.json`（`forbidden_terms`、`lead_chars`、`chapter_titles`、`later_chapter_names`）；模板带一份空文件，复制后按项目填写，不写就只跑通用规则。
- 项目自己的检查命令（如有）与它覆盖的 profile：
- 命令在哪个环境执行（本机 / WSL / 容器）：
- 检查命令只写终端，输出不落盘；需要留证据时写已忽略的 `temp/`。

## 运行时配置

- 书根 `config/runtime.config` 从 `writing-quarto` 的 `assets/config/runtime.config` 复制，填解释器路径与版本下限；模板里的 `<解释器路径>` 是占位符，未替换时检查会失败。注释写法见 `quarto/04-comments.md`「TOML 与项目配置」。

## 主题与过滤器路径

- Quarto 读取的书内主题副本：`theme/`（`_quarto.yml` 只引用这一份相对路径）。
- 过滤器：`filters/answering-disclosure.lua`。
- 主题与过滤器的权威来源在插件的 `skills/designing-theme/assets/theme/` 与
  `skills/writing-quarto/scripts/`；书内副本用于渲染，改样式只改被 `_quarto.yml` 引用的副本。

## 与通用技能的分工

- 通用写法、结构、标题层级和主题规则由 `writing-quarto` 与 `designing-theme` 负责，本文件不复制。
- 本文件只写通用技能无法知道的项目事实：书名、章节对照、术语、命令和路径。
