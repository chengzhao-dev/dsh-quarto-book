---
kb_id: "bg-prose-theme-v1"
title: "一句不换对象"
domain: "quarto-writing"
subdomain: "conventions"
tags: [prose, sentence, object, comment, qmd]
level_range: [0, 5]
dependencies: ["conventions/writing/chinese-quality.md"]
created: "2026-10-13"
updated: "2026-10-13"
chunk_strategy: "semantic_heading"
estimated_tokens: 400
---

# 一句不换对象

## 适用

适用范围：

- `content/**/*.qmd` 围栏外正文。
- `content/**/*.qmd` 围栏内的中文注释。
- `src/**` 的 C++、`CMakeLists.txt`、`.cmake`、`.sh` 中文注释。

不适用：`.agents` 规则正文；案例里的「不佳」；根 `AGENTS.md` 结构表的列名「职责」。

## 一句不换对象

一句里能不能同时写已落 X 和先手：不能。一句只写一个对象，冒号右侧不得换成另一个对象，也不得用近义词把左侧再说一遍。

反例：「已落 X：先手在这一格落下 X。」——冒号右侧换成「先手」和落下动作，不再说左侧的格子状态。改写见术语表「数据项类型」的三句；正例三句不在这里贴，见同节。

一句里的对象仍只有一个；六个成分的槽位见`conventions/writing/sentence-craft/sentence-frame.md` 的知识文件。

## 不写进本文件

破折号、引号、段长、`##` 骨架、`///` 与横幅各有条文，留在各自原文件，不并进这份。
