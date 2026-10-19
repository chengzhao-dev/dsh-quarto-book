---
kb_id: "bg-qmd-code-cases-v1"
title: "Quarto 代码块与命令讲解细则"
domain: "quarto-writing"
subdomain: "writing"
tags: [code-blocks, directory-tree]
level_range: [0, 5]
dependencies: [conventions/writing/qmd-element-cases/block-loop.md]
created: "2026-10-18"
updated: "2026-10-18"
chunk_strategy: "semantic_heading"
---

# Quarto 代码块与命令讲解细则

filename 标注、代码块门槛、三级标题最小模块、目录树与命令讲解的细则。

## 代码块 filename 标注

来源文件、执行位置、输出场景写在代码块标题里，正文不重复「下面是 xxx 的源码/一段命令」这类视觉上已存在的信息。

**片段优先**：每个 `##`（或 `###`）只展示正式代码里与本节任务最相关的一块并精讲，默认内联摘录，不用 include 拷贝整个文件；紧邻常量与其直接使用行合成的单围栏算「一块」（判定见下文「内容块前后的闭环」）：

````markdown
```{.cpp filename="main.cpp"}
#include <iostream>

int main() {
 std::cout << "Hello, World!\n";
 return 0;
}
```
````

- 片段必须逐字摘自源文件，禁止改写、合并或重排源代码行；注释与空行可以省略，省略处直接省略，不写任何标记行。
- **filename 一律短显示名**：只写 `main.cpp`、`CMakeLists.txt`、`running-build.sh`、`example/` 这类短名；禁止把 `src/...` 或 `shared/...` 深层路径塞进标题栏。完整位置由章引言的 GitHub 链接和目录树提供；`verifying-content.py` 用本章内、代码块之前 basename 匹配的最近一条 blob 链接解析真实路径再做片段核对。
- **filename 不写链接**：`filename="..."` 是纯文本短名，禁止塞 Markdown 链接；`resolve_fragment_source` 的解析只认正文句子里的链接，标题栏写链接既渲染不出可点样式，也会被 `verifying-content.py` 判失败。
- **blob 链接嵌进导语句**：GitHub blob 链接写在同节导语的完整句子里（正例：「apps/CMakeLists.txt 用一行目标属性固定运行时库查找」，其中文件名是 GitHub 链接的锚文本），禁止整行仅为链接单独成行贴在代码围栏上方（可夹空行，`verifying-content.py` 判失败）。悬空的裸链接行既不像正文也不像说明，读者扫读时只剩一个锚点。
- **摘录链接每章每条仓库路径至多一条**：章引言是全章链接位，首次点名源文件并挂链接（如「声明在头文件 `state.h`，实现在源文件 `state.cpp`」，这两个名字是该章仅有的源文件链接）；后文和各节导语改成行内代码，不再包 `[]()`，导语讲块里要看的标识符；同一章摘录另一阶段目录的同名文件时，在切换处再挂一条不同 URL（对照见`knowledge/cases/chinese-style/excerpt-lead.md` 的知识文件「摘录链接密度」；`verifying-content.py` 对同章同 URL 重复判失败）。本条挂在写作步骤的定版式。
- 片段内注释硬限：每处实现注释（`//` 或 `#`）不超过 2 行、单行不超过 100 列（与源文件 `ColumnLimit: 100` 同一口径；正文散文的 40 字限不套到代码注释），只写这段代码做什么；CMake/Shell 等命令型片段每条命令保留一行意图注释。Doxygen `///` 声明块（概述、空 `///` 与细节）是声明骨架的一部分，摘录随源保留，不受此限。命名惯例、官方建议、未来演化等规范说理一律不进代码块；术语卡和可跳过的操作提醒可以进 callout，注释怎么写、行尾先写什么、`///` 与 `@` 标签怎么分工只留在 `.agents`，面向作者的进知识文件。
- 首讲某段源码的章节不省略源码既有的职责注释：注释是读者读到的第一层讲解；「注释与空行可以省略」只服务后续章节复现已见代码。源码缺注释先按标识 `conventions/writing/qmd-element-cases/code-cases.md` 的知识文件补注释，摘录逐字继承；自明成员按该规范不注，不因「全部注释」补自明行。
- 讲解段只解释片段中实际出现的代码；片段没有展示的内容要么补进片段、要么进 callout，不在正文列表里讲代码外面的东西。
- include 短代码降级为可选手段：仅用于确实需要完整展示且很短的文件，并仍须包在带语言标注的围栏代码块内（包裹规则见`conventions/rendering/quarto-conventions.md` 的知识文件）。
- 手动命令块标注执行位置，如 `filename="WSL Ubuntu（仓库根目录）"`。
- 输出效果类代码块（运行效果、预期输出）filename 只写场景名（如「运行效果」）；终端样式、颜色等展示细节写进正文，不进 filename。输出摘录用单独一行 `...` 表示省略的工具输出，与源码片段的省略是两回事。

## 代码块门槛

不是每段代码都值得出围栏。**值得出围栏**：类型布局（常量、枚举、结构体、类的声明）、多步或非显然的控制流、需要与图核对的公式实现，且块前有工程动机导语。

**禁止出围栏**：

- 单次比较或直接 `return` 的平凡实现（判例：`IsInRange` 的两行 `return` 比较）——改写入口列表 + 失败策略列表，对照见`knowledge/cases/chinese-style/sentence-brevity.md` 的知识文件「过简实现围栏」。
- 仅为证明「源码有此函数」而贴出的实现。
- 打断小节中心的硬插块。

## 类与多函数摘录的垂直空白

摘录 `class` 或多函数片段时**保留**源码中函数之间的空行，禁止为省行数坍缩成函数注释贴着下一声明；省略部分成员时，被保留的相邻函数之间仍空 1 行；同一 access 段内最后一组数据成员与函数之间空 1 行，数据成员组内不空行（规则与矩阵见标识 `conventions/writing/qmd-element-cases/code-cases.md` 的知识文件「类声明垂直空白」）。与「逐字摘录」冲突时以源码空白为准：教学缩略可删成员，不可删「函数间距」惯例。


## 三级标题最小模块

一个三级标题下面的正文由一到两个最小模块组成。一个模块是一个整体，次序固定：标题已经给出对象；标题下一句导语；有并列取值时跟着列表，一项一个取值、一项一句；代码块、表格或图放在列表和收束段之间；没有列表时放在导语和收束段之间；收束段只写各项共同的契约；Callout 可有可没有，写了就放在收束段之后。短模块可以只有导语和代码块。示例章「操作与成败」里的 `Move` 与 `PlaceResult` 各是一个短模块，下一个短模块用自己的导语接上。第二个模块用来解释前一个时，衔接句就是第二个模块的导语。示例章「数据项坐标」用「下面的图标出这块状态面板上可用的 `(row, col)`。」接上图。讲一个函数时，先一个模块讲 `.h`，再用导语接 `.cpp`。列表写选法，围栏与源文件逐字一致，收束段不把列表再写一遍。禁止「每个状态码对应」，也禁止以 `` `类型::kName`： `` 开头的释义项。正面例子是 示例章「操作的强度」。


## 目录树与多命令块

- 目录树应该展示哪些文件：选树口径见`conventions/writing/section-density/main-line.md` 的知识文件；树后正文见`conventions/writing/section-flow/transition.md` 的知识文件。树的标记方式（目录注释 `#/`、文件注释 `#` 右移 4 列、按 `tree -a` 字母序、注释为名词、个数对齐）统一见`conventions/writing/section-density/main-line.md` 的知识文件，本条不另立第二套树规则。
- 行尾注释的短语形态见`conventions/writing/section-density/main-line.md` 的知识文件；禁止在注释里用全角冒号挂解释（`# 顶层规则：产物目录与组件组合` 改 `# 顶层构建规则`），`verifying-content.py` 对树内 `：` 判失败。
- 一个代码块内的多条命令职责彼此独立时，逐条子注释说明用途（防止新手把诊断命令当修复命令重复执行）；顺序执行的同一流程不强制加注释。读者只需执行其中一条时，拆成独立代码块并写明取舍时机。

## 执行位置判据

故障定位第一步是确认执行位置和前置状态，给可观察判据而不是模糊要求：Shell 场景用 `pwd` 看路径结尾，工程场景用特征文件（如 `CMakeLists.txt`）存在性判断。

## 命令介绍模式

讲解工具链命令（CMake、CTest 等）时：命令名用行内代码，每条命令一句话职责；参数只在影响当前理解时展开，完整语义不进正文；默认不放官方文档链接，需要深入时由章末参考资料或确实反直觉处的单个链接承担。

职责句点名对象类型与配合关系：`target_compile_features(app PRIVATE cxx_std_20)` 写作「要求可执行目标 `app` 使用 C++20；`PRIVATE` 只作用于该目标」，禁笼统「给目标声明…只约束这个目标自己」。命令中的路径展示真实值：直接写变量本体（如 `set(CMAKE_RUNTIME_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/bin")`），正文用 `build/bin/...` 描述落地位置；不引入 `<binary-dir>` 式占位符，也不在正文解释占位符与真实变量的对应关系。

## 来源

- [GitHub Docs Style Guide](https://docs.github.com/contributing/style-guide-and-content-model/style-guide)——解释文字放代码块前、程序步骤的前置条件外置在步骤之前、告警克制且不相邻。
- [ruanyf《中文技术文档写作风格指南》段落章](https://github.com/ruanyf/document-style-guide/blob/master/docs/paragraph.md)——一段一主题、中心句前置、段落不超过 7 行。
