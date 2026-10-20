---
name: quarto-book-project
description: 记录某一本 Quarto Book 的项目级约定：书名、读者、术语、渲染与检查命令、主题与过滤器路径；由项目维护，不随插件发布
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
- 本书不覆盖的内容：

## 章节对照

- 章节顺序的唯一来源：根 `_quarto.yml` 的 `book.chapters`。
- 每章的类章或能力章、关键对象、`title` 与二级标题：`writing/chapter-map.md`。
- 目录布局：`content/<part>/<NN-chapter>.qmd`。
- 改文件名时同轮同步 `_quarto.yml`、章节对照、`title` 和已有链接。

## 术语表

| 术语 | 定稿写法 | 禁用写法 | 首次出现时的解释 |
| --- | --- | --- | --- |
|  |  |  |  |

## 渲染与检查命令

- 渲染：在书根运行 `quarto render`。
- 内容检查：`<插件技能目录>/scripts/verifying-content.py --root <book>`。
- 布局检查：`<插件技能目录>/scripts/checking-layout.py`（渲染后）。
- 项目自己的封装命令（如 `run.ps1 check`）与它覆盖的 profile：
- 命令在哪个环境执行（本机 / WSL / 容器）：

## 主题与过滤器路径

- Quarto 读取的书内主题副本：`theme/`（`_quarto.yml` 只引用这一份相对路径）。
- 过滤器：`filters/answering-disclosure.lua`。
- 主题与过滤器的权威来源在插件的 `skills/designing-theme/assets/theme/` 与
  `skills/writing-quarto/scripts/`；书内副本用于渲染，改样式只改被 `_quarto.yml` 引用的副本。

## 与通用技能的分工

- 通用写法、结构、标题层级和主题规则由 `writing-quarto` 与 `designing-theme` 负责，本文件不复制。
- 本文件只写通用技能无法知道的项目事实：书名、章节对照、术语、命令和路径。
