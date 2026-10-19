---
kb_id: "bg-chapter-task-sections-v1"
title: "章节任务节与验证策略"
domain: "quarto-writing"
subdomain: "writing"
tags: [chapter, tasks]
level_range: [0, 5]
dependencies: [conventions/writing/chapter-structure/skeleton.md]
created: "2026-10-18"
updated: "2026-10-18"
chunk_strategy: "semantic_heading"
---

# 章节任务节与验证策略

有 class 的章的任务节组织与术语、验证策略。

## 有 class 的章的任务节

任务级正文里有 `class` 定义的章（示例项目是「状态面板」的 `Board` 与「流程」的 `Game`），任务级 `##` 按下面的次序排列，没有下一种内容就停，不为凑数加节：

1. **类型**：先讲这一章要用到的值类型（枚举与结构体），一节一个可验证结果，可下分三级标题。
2. **成员变量**：成员变量单独一节。读取这些成员的函数用三级标题。不读取成员、只判断坐标是否落在下标区间内的检查，也用三级标题放在这一节，不单独占一个二级标题。类说明、构造函数与数据成员拼进**同一个围栏**，禁止拆成类头一个、成员另一个围栏；存放方式写在第二节正文里，不单独做标题。
3. **最重要的函数**：这个类最重要的那一个函数，以及它的配套函数。
4. **其余重要函数**：除此以外还有的重要函数，有一组才再加第四节、第五节，没有就停。

没有 `class` 的章不套这个次序，按「先类型、再使用这些类型的函数」重排。每个二级标题下三级标题的个数见`conventions/writing/size-budget.md`。超过上限时合并同前缀的函数，或把最难的组装并入相邻节。

## 术语与验证策略

- 术语 callout 就近放置的写法见`conventions/writing/qmd-element-cases/block-loop.md` 的知识文件；一个同位短语就能说清的（如 CTest（CMake 自带的测试运行工具））可保留行内括号。面向新人的正文不堆砌入门前置名词（walking skeleton 这类术语直接删除）。
- 页面写出的验证结论必须与证据强度匹配：命令能定位、版本能输出、程序能编译运行是不同层级，不能用弱观察替代强证明。
- 涉及阶段目录结构的章节：先给目录树，再按树顺序逐项说明（链接格式见`conventions/rendering/quarto-conventions.md` 的知识文件）。
- 全书统一术语与替换规则见标识 `conventions/writing/chinese-quality.md` 的知识文件。
