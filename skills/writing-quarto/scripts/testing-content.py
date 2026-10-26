#!/usr/bin/env python3
"""Regression tests for verifying-content.py.

Each case writes a temporary book (an `_quarto.yml`, a root `index.qmd` and
one chapter), runs the verifier as a subprocess and asserts the exit code and
a diagnostic substring. Project rules are covered with and without
`.agents/skills/quarto-book-project/`.

Usage:
  python testing-content.py
Exit code: 0 when every case passes, 1 otherwise.
"""

from __future__ import annotations

import subprocess
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
VERIFIER = HERE / "verifying-content.py"

QUARTO_YML = """project:
  type: book
book:
  title: 示例书
  chapters:
    - index.qmd
    - content/part/01-intro.qmd
"""

INDEX = """---
title: 示例书
---

## 前言

这是示例书的入口页。读者从这里进入正文。
"""

VALID_CHAPTER = """---
title: 入门
---

## 目标

这一章说明一个可以重复验证的目标。读者读完之后能够判断结果是否正确。

### 步骤

先准备输入，再运行检查，最后对照输出。
"""

TREE_CHAPTER = """---
title: 入门
---

## 目标

下面是工程目录树，行尾注释说明每个节点在工程里的用途，读者可以对照磁盘检查。

```text
├── apps/          #/ 终端程序
│   └── cli.h       # 读入坐标
└── tests/         #/ 单元测试
```
"""


HTML_FIGURE_BAD = """---
title: 入门
---

## 目标

这一章说明一个可以重复验证的目标。

```{=html}
<svg class="coords-grid" role="img" aria-label="棋盘坐标。"><rect width="10" height="10"/></svg>
```
"""

HTML_FIGURE_GOOD = """---
title: 入门
---

## 目标

这一章说明一个可以重复验证的目标。

```{=html}
<figure class="book-figure">
<svg class="coords-grid" role="img" aria-label="棋盘坐标。"><rect width="10" height="10"/></svg>
<figcaption>棋盘坐标图：3 行 3 列。</figcaption>
</figure>
```
"""


TREE_GAP_CHAPTER = """---
title: 入门
---

## 目标

下面是工程目录树，行尾注释说明每个节点在工程里的用途。

```text
├── lib/    #/ 源码
└── main.c   # 入口
```
"""


MERMAID_CHAPTER = """---
title: 入门
---

## 目标

下面是一张只画类型和边的类图，读者可以对照箭头理解类型之间的依赖。

::: {.class-diagram}
```{mermaid}
%%| fig-cap: "类型 A 依赖类型 B。实线箭头从使用者指向被使用者。"
%%{init: {"fontFamily": "LXGW Bright Medium, system-ui, sans-serif", "class": {"hideEmptyMembersBox": true}}}%%
classDiagram
  direction LR
  class A
  class B
  A --> B
```
:::
"""


def long_tree_chapter(lines: int = 21) -> str:
    rows = []
    for index in range(lines):
        prefix = f"├── file{index}.txt"
        rows.append(prefix + " " * (20 - len(prefix)) + f"# 用途{index}")
    tree = "\n".join(rows)
    return (
        "---\ntitle: 入门\n---\n\n## 目标\n\n"
        "下面是工程目录树，行尾注释说明每个节点在工程里的用途。\n\n"
        f"```text\n{tree}\n```\n"
    )


def run_case(tmp: Path) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [sys.executable, str(VERIFIER), "--root", str(tmp)],
        text=True, capture_output=True, encoding="utf-8", errors="replace",
    )


def make_book(root: Path, chapter: str = VALID_CHAPTER) -> None:
    (root / "content" / "part").mkdir(parents=True, exist_ok=True)
    (root / "_quarto.yml").write_text(QUARTO_YML, encoding="utf-8")
    (root / "index.qmd").write_text(INDEX, encoding="utf-8")
    (root / "content" / "part" / "01-intro.qmd").write_text(chapter, encoding="utf-8")


def main() -> int:
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

    failures: list[str] = []
    passed_cases = 0

    def expect(
        name: str,
        chapter: str,
        code: int,
        needle: str,
        project: bool = False,
        checks_json: str | None = None,
    ) -> None:
        nonlocal passed_cases
        passed_cases += 1
        with tempfile.TemporaryDirectory() as raw:
            root = Path(raw)
            make_book(root, chapter)
            if project:
                skill_dir = root / ".agents" / "skills" / "quarto-book-project"
                skill_dir.mkdir(parents=True)
                (skill_dir / "SKILL.md").write_text(
                    "---\nname: quarto-book-project\ndescription: 项目约定\n---\n",
                    encoding="utf-8",
                )
                (skill_dir / "checks.json").write_text(
                    checks_json or '{"forbidden_terms": ["棋盘格子"]}',
                    encoding="utf-8",
                )
            result = run_case(root)
            output = result.stdout + result.stderr
            if result.returncode != code:
                failures.append(f"{name}: 退出码 {result.returncode}，期望 {code}\n{output[:600]}")
            elif needle and needle not in output:
                failures.append(f"{name}: 输出缺少「{needle}」\n{output[:600]}")

    expect("合法样书", VALID_CHAPTER, 0, "OK")
    expect(
        "正文问答式讲解",
        VALID_CHAPTER + "\n`Board` 只回答四类问题：坐标、满盘、三连与赢家。\n",
        1, "问答式讲解",
    )
    expect(
        "代码字面复述",
        VALID_CHAPTER + "\n对应的代码里，`kBoardRows` 和 `kBoardCols` 都取 3。\n",
        1, "代码字面复述",
    )
    expect(
        "自造关系词",
        VALID_CHAPTER + "\n`Game` 与 `Board` 之间的组成边表示什么？\n",
        1, "自造关系词",
    )
    expect(
        "类型承载",
        VALID_CHAPTER + "\n坐标由 `CellPosition` 承载，取值由 `CellType` 承载。\n",
        1, "承载",
    )
    expect(
        "小节导航",
        VALID_CHAPTER + "\n下一节说明落子顺序。\n",
        1, "小节导航",
    )
    expect(
        "拉链句",
        VALID_CHAPTER + "\n两个类型分别交给坐标与取值。\n",
        1, "拉链句",
    )
    duplicate_link = (
        "https://github.com/chengzhao-dev/cpp-board-games/blob/main/"
        "games/tictactoe/tictactoe/include/board.h"
    )
    expect(
        "同章重复文件链接",
        VALID_CHAPTER
        + f"\n[board.h]({duplicate_link})\n\n[board.h]({duplicate_link})\n",
        1, "同章重复文件链接",
    )
    expect(
        "章引言主源文件可重复链接",
        "---\ntitle: 入门\n---\n\n"
        f"本章的声明在 [board.h]({duplicate_link})。\n\n"
        "## 目标\n\n"
        "这一章说明一个可以重复验证的目标。读者读完之后能够判断结果是否正确。\n\n"
        f"正文再提 [board.h]({duplicate_link})。\n",
        0, "OK",
    )
    expect(
        "链接目标不计入句长",
        VALID_CHAPTER + f"\n读 [board.h]({duplicate_link})。\n",
        0, "OK",
    )
    expect("标题口语化", VALID_CHAPTER.replace("## 目标", "## 自己走一局"), 1, "标题带人称")
    expect("标题带行内代码", VALID_CHAPTER.replace("## 目标", "## 运行 `app`"), 1, "标题带行内代码")
    expect(
        "三级标题在数条目",
        VALID_CHAPTER.replace("### 步骤", "### 八条线"),
        1,
        "三级标题在数条目",
    )
    expect(
        "对象章点到后章类型",
        VALID_CHAPTER + "\n三类结果都交给 `LaterType` 处理。\n",
        1,
        "对象章点到后章类型",
        project=True,
        checks_json='{"later_chapter_names": {"content/part/01-intro.qmd": ["LaterType"]}}',
    )
    expect(
        "围栏内后章类型不报",
        VALID_CHAPTER + "\n```cpp\nLaterType value;\n```\n",
        0,
        "OK",
        project=True,
        checks_json='{"later_chapter_names": {"content/part/01-intro.qmd": ["LaterType"]}}',
    )
    expect("正文 H1", VALID_CHAPTER.replace("## 目标", "# 目标"), 1, "正文出现 H1")
    expect("缺 title", VALID_CHAPTER.replace("title: 入门\n", ""), 1, "缺少 YAML frontmatter")
    expect(
        "段落超长",
        "---\ntitle: 入门\n---\n\n## 目标\n\n" + "这是一个很长的段落。" * 60 + "\n",
        1, "超过",
    )
    expect(
        "plain mermaid",
        "---\ntitle: 入门\n---\n\n## 目标\n\n```mermaid\ngraph LR\n```\n",
        1, "plain mermaid",
    )
    expect(
        "未声明围栏",
        "---\ntitle: 入门\n---\n\n## 目标\n\n```\nprint(1)\n```\n",
        1, "未声明语言",
    )
    expect(
        "相邻围栏缺少空行",
        "---\ntitle: 入门\n---\n\n## 目标\n\n"
        "```text\na\n```\n```text\nb\n```\n",
        1, "DOC-E11",
    )
    expect(
        "项目禁用词生效",
        "---\ntitle: 入门\n---\n\n## 目标\n\n棋盘格子按行列编号，程序读取当前状态。\n",
        1, "项目禁用词",
        project=True,
    )
    expect(
        "无项目技能时跳过项目词",
        "---\ntitle: 入门\n---\n\n## 目标\n\n棋盘格子按行列编号，程序读取当前状态。\n",
        0, "OK",
    )

    expect("目录树合格", TREE_CHAPTER, 0, "OK")
    expect("原生 SVG 缺图注", HTML_FIGURE_BAD, 1, "figcaption")
    expect("原生 SVG 图注合格", HTML_FIGURE_GOOD, 0, "OK")
    expect(
        "标记后多空格",
        TREE_CHAPTER.replace("# 读入坐标", "#  读入坐标"),
        1, "标记后只留一个空格",
    )
    expect(
        "注释文字未对齐",
        TREE_CHAPTER.replace("#/ 终端程序", "#/  终端程序"),
        1, "注释文字未对齐",
    )
    expect(
        "树注释错列",
        TREE_CHAPTER.replace("│   └── cli.h       #", "│   └── cli.h        #"),
        1, "右移一列",
    )
    expect("节点与注释太近", TREE_GAP_CHAPTER, 1, "至少留四个空格")
    expect(
        "文件 # 未右移",
        TREE_CHAPTER.replace("│   └── cli.h       #", "│   └── cli.h      #"),
        1, "右移一列",
    )
    expect("树注释只写类别词", TREE_CHAPTER.replace("# 读入坐标", "# 头文件"), 1, "类别词")
    expect(
        "目录注释带冒号",
        TREE_CHAPTER.replace("#/ 终端程序", "#/ 终端程序：打印棋盘"),
        1, "目录注释只写这里装什么",
    )
    expect(
        "目录注释过长",
        TREE_CHAPTER.replace("#/ 终端程序", "#/ 终端程序与它的打印读入"),
        1, "超过 16 列",
    )
    expect("树注释列了三项", TREE_CHAPTER.replace("# 读入坐标", "# 读入、打印与写快照"), 1, "压到 1 到 2 项")
    expect("目录行缺少 #/", TREE_CHAPTER.replace("#/ 终端程序", "# 终端程序"), 1, "目录行的注释以 #/")
    expect("文件行误写 #/", TREE_CHAPTER.replace("# 读入坐标", "#/ 读入坐标"), 1, "文件行的注释以 #")
    expect("树行缺少注释", TREE_CHAPTER.replace("# 读入坐标", ""), 1, "缺少行尾注释")
    expect(
        "树注释过长",
        TREE_CHAPTER.replace("# 读入坐标", "# 读入坐标并打印当前棋盘的全部状态"),
        1, "超过 28 列",
    )
    expect("树行数过多", long_tree_chapter(), 1, "超过 20 行")

    expect("类图合格", MERMAID_CHAPTER, 0, "OK")
    expect(
        "类图缺少图注",
        MERMAID_CHAPTER.replace('%%| fig-cap: "类型 A 依赖类型 B。实线箭头从使用者指向被使用者。"\n', ""),
        1, "fig-cap",
    )
    wrong_order = MERMAID_CHAPTER.replace(
        '%%| fig-cap: "类型 A 依赖类型 B。实线箭头从使用者指向被使用者。"\n%%{init: ',
        "%%{init: ",
    ).replace(
        "classDiagram",
        '%%| fig-cap: "类型 A 依赖类型 B。实线箭头从使用者指向被使用者。"\nclassDiagram',
        1,
    )
    expect("类图图注写在 init 之后", wrong_order, 1, "init 之前")
    expect(
        "类图缺少页面容器",
        MERMAID_CHAPTER.replace("::: {.class-diagram}\n```{mermaid}", "```{mermaid}").replace(
            "```\n:::", "```"
        ),
        1, ".class-diagram",
    )
    expect(
        "类图缺少空成员配置",
        MERMAID_CHAPTER.replace(', "class": {"hideEmptyMembersBox": true}', ""),
        1, "hideEmptyMembersBox",
    )
    expect(
        "类图有成员却用 LR",
        MERMAID_CHAPTER.replace(
            "  class B\n",
            "  class B {\n    int value\n  }\n",
        ),
        1, "有成员却用 LR",
    )
    expect(
        "类图类型过多",
        MERMAID_CHAPTER.replace(
            "  class B\n",
            "  class B\n  class C\n  class D\n  class E\n  class F\n  class G\n  class H\n",
        ),
        1, "超过 6 个",
    )
    expect(
        "类图成员行过长",
        MERMAID_CHAPTER.replace(
            "  class A\n",
            "  class A {\n    +bool CompletesLine(CellPosition position, CellType cell_type) const\n  }\n",
        ).replace("direction LR", "direction TB"),
        1, "超过 40 列",
    )
    expect(
        "单个类成员过多",
        MERMAID_CHAPTER.replace(
            "  class A\n",
            "  class A {\n    int a\n    int b\n    int c\n    int d\n    int e\n    int f\n  }\n",
        ).replace("direction LR", "direction TB"),
        1, "超过 5 行",
    )
    expect(
        "类图成员总数过多",
        MERMAID_CHAPTER.replace(
            "  class A\n  class B\n",
            "  class A {\n    int a1\n    int a2\n    int a3\n  }\n"
            "  class B {\n    int b1\n    int b2\n    int b3\n  }\n"
            "  class C {\n    int c1\n    int c2\n    int c3\n  }\n"
            "  class D {\n    int d1\n    int d2\n    int d3\n  }\n"
            "  class E {\n    int e1\n    int e2\n    int e3\n  }\n",
        ).replace("direction LR", "direction TB"),
        1, "超过 14 行",
    )

    with tempfile.TemporaryDirectory() as raw:
        passed_cases += 1
        root = Path(raw)
        make_book(root)
        (root / "content" / "part" / "01-intro.qmd").unlink()
        result = run_case(root)
        output = result.stdout + result.stderr
        if result.returncode != 1 or "章节不存在" not in output:
            failures.append(f"缺章: 未报告目录中的缺失章节\n{output[:600]}")

    if failures:
        print(f"发现 {len(failures)} 例失败：")
        for line in failures:
            print(f"  FAIL {line}")
        return 1

    print(f"PASS：{passed_cases} 个用例全部通过")
    return 0


if __name__ == "__main__":
    sys.exit(main())
