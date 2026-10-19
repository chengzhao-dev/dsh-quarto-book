---
kb_id: "bg-chinese-style-opening-v1"
title: "中文案例：开场与导语对照"
domain: "quarto-writing"
subdomain: "cases"
tags: [chinese, paragraphs, case-study]
level_range: [0, 5]
dependencies: [conventions/writing/paragraph-shape/rules.md, conventions/writing/chapter-structure/skeleton.md, conventions/writing/list-craft.md]
created: "2026-10-18"
updated: "2026-10-18"
chunk_strategy: "semantic_heading"
---

# 中文案例：开场与导语对照

开场段、接口旁白与问答配合的正反对照。
## 接口清单压缩段

公开接口的语法在代码围栏里展示；旁白只回答工程问题（谁调用、不能碰什么、如何验收）。禁止把「私有成员 + 公开成员名单 + `const` + `[[nodiscard]]`」等接口属性压进同一段旁白——那是把参考手册条目塞进导读。信息隐藏文档应区分调用者可假设什么与实现秘密；语法与语义/限制分开写。以 示例章「声明公开接口」定稿前为对照：

````text
不佳（一块后把私有性、三个成员、const、[[nodiscard]] 串成一段）：
成员 cells_ 保持私有，调用者能读写的只有 Game::GetCellState、Game::Place、
Game::GetResult 这三个成员。Game::GetCellState 与 Game::GetResult 声明为 const，
读取动作不改变状态面板。三个接口都标注 [[nodiscard]]：查询结果与操作结果都不该被调用方无视。

改写（块前场景已点名与划界；代码展示声明；块后删除复述，语言属性不进旁白）：
终端程序把输入的行列变成一次操作动作后，只能调用 Game 的三个成员去改状态面板或查结果，
不能直接改私有数组 cells_。

```{.cpp filename="state.h"}
（公开声明：GetCellState / Place / GetResult；cells_ 在 private）
```

````

判定信号：一段同时回答「谁可见」「有哪些成员」「const 做什么」「nodiscard 做什么」中两项以上；或块后把围栏里已出现的成员名与属性再数一遍。定稿形态：场景（动作 → 点名 → 边界）→ 代码 → 块后只补注释未覆盖的工程信息；禁止接口清单压缩段。


## 角色总述段

目录列表后能用段落补一个 build 目录吗：不能把目录说明拆成列表加段落两处。以 示例章查看示例工程目录节改稿前为对照。总述句只给目录派角色（「承担源码职责」「说明职责」），不介绍目录里有什么，读者拿到的是名头不是内容；导语直接点名列表将展开的信息维度：

```text
不佳（三处都在派角色：列表导语、build/ 排除句与树引出句都挂在「职责」上）：
项目动态库、终端程序和测试目录分别承担源码职责。……构建过程生成的 `build/` 目录不属于源码职责，里面存放可执行文件与动态库文件。目录和文件在目录树中的位置如下，每行的行尾注释说明职责：

改写（导语引出列表；四个目录含 `build/` 一次列全，列表后不再补段）：
示例工程有四个目录：……- **构建产物**：`build/` 目录由构建过程生成，存放可执行文件与动态库文件。……目录和文件的位置如下，每行的行尾注释说明这一行是什么：
```

判定信号：正文出现「职责」「负责」「承担」等角色指称或角色动词（词表硬检查见 `verifying-content.py` 的 FORBIDDEN_TERMS）；导语只派角色不预告列表内容；并列成员（含 `build/` 这类生成物）不在同一列表列全、列表后另起段落补列成员 → 改为点名内容维度的引出句，成员一次列全，角色信息由列表项的具体内容承载。


## 多问一答拆成引言—列表—收束

以 示例章自测「配置和构建分别由哪个工具完成」为对照。一段同时回答谁做配置、谁做构建、何时重配时必须拆开（规则见 `references/zh/writing-howto/tasks-structure.md`）：

```text
不佳（一段压三问）：
配置由 CMake 完成：读取 CMakeLists.txt，在 build/ 下生成构建计划。构建由 Ninja 完成：按计划把源码编译成可执行文件。所以改了 CMakeLists.txt 要重跑配置，而只改 main.cpp 时重新构建就够了。

改写（引言 → 引导词列表 → 收束）：
配置和构建是两件不同的事，由不同工具完成。

- **配置**：由 CMake 完成，读取 CMakeLists.txt，在 build/ 下生成构建计划。
- **构建**：由 Ninja 完成，按计划把源码编译成可执行文件。

改了 CMakeLists.txt 要重跑配置；只改 main.cpp 时重新构建即可。
```


## 问答对象错位

以 示例章自测问题改稿前为对照。问题问目录，答案却从文件起笔，读者拿首句对不上问题；答案首句直接回答问题所问的对象，细节与边界随后补齐：

```text
不佳（问题问「先看哪个目录」，答案首句先给文件）：
先看 state.h 及其实现目录 `example/src/`。它们属于项目动态库，而不是终端程序的 `apps/` 目录。

改写（首句先答目录；文件指称用行内代码，不挂链接，所属目录已确立时省顶层前缀）：
先看项目动态库目录 `example/`。数据项的定义在 `include/state.h`，实现放在 `src/state.cpp`。
```

判定信号：把问题和答案首句各缩成一个对象名词，两者不一致即错位；补细节不等于换对象；问答中的文件、路径与标识符指称挂了链接也命中（统一行内代码，`verifying-content.py` 对自测节链接记 WARN，规则见`conventions/writing/chapter-structure/skeleton.md` 的知识文件）。


## 冒号后堆叠分号解释

冒号引出解释后还用分号续接第二个解释，是把两个中心压进一句。以 示例章操作局面图后句与 `PlayerToCellState` 段改稿前为对照：

```text
不佳（图后句先复述 Move 的字段构成，冒号后堆图内局面作第二主题）：
一次 Move 只携带目标数据项坐标与流程用户两个字段：图中 (1,1) 与 (0,2) 已落下元素，加粗框指向的数据项就是下一个 Move 的 position。

改写（删字段复述，图后两句短句各一中心）：
图中 (1,1) 与 (0,2) 已落下元素。加粗框指向的数据项就是下一个 Move 的 position。
```

```text
不佳（冒号引出解释后用分号堆叠身份区分与使用方）：
PlayerToCellState 回答“流程用户应写入的数据项状态是什么”：Player 表达流程身份，CellState 表达数据项状态，两者互不替代；把身份翻译成元素只在这一个函数发生，规则判定与显示都消费它的结果。

改写（独立短段三句，每句一中心，全程无分号）：
PlayerToCellState 负责把流程用户翻译成数据项状态。流程身份与数据项状态互不替代，这个翻译只发生在这一处。规则判定与终端显示都读取它的返回值。
```

判定信号：冒号后的解释超过一句还用分号续接；图后句或函数段删掉任一分句后中心仍成立。


## 导语多中心与分号挂外链

块前导语只引出紧随的代码块；跨仓外链默认不写，若保留须工程点讲完后尾置（硬边界见 `references/zh/writing-howto/tasks-structure.md`）。以 示例章流程用户与数据项状态节改稿前为对照：

````text
不佳（导语一句挂两个中心，分号再挂外链，读者分不清这句在引代码还是在引参考）：

```{.cpp filename="state.h"}
（Player 与 CellState 两套枚举）
```

改写（导语只保留一个中心，冒号引出代码；默认不挂外链）：
state.h 用两套枚举区分流程身份与数据项状态：

```{.cpp filename="state.h"}
（Player 与 CellState 两套枚举）
```
````

判定信号：删掉分号后的任一分句，句子中心仍然成立，说明原句是多中心句；口诀见 `writing-quarto` 技能 `references/zh/writing-howto/tasks-structure.md`。
