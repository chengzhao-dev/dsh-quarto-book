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

    def expect(name: str, chapter: str, code: int, needle: str, project: bool = False) -> None:
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
                    '{"forbidden_terms": ["棋盘格子"]}', encoding="utf-8"
                )
            result = run_case(root)
            output = result.stdout + result.stderr
            if result.returncode != code:
                failures.append(f"{name}: 退出码 {result.returncode}，期望 {code}\n{output[:600]}")
            elif needle and needle not in output:
                failures.append(f"{name}: 输出缺少「{needle}」\n{output[:600]}")

    expect("合法样书", VALID_CHAPTER, 0, "OK")
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

    with tempfile.TemporaryDirectory() as raw:
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

    print("PASS：9 个用例全部通过")
    return 0


if __name__ == "__main__":
    sys.exit(main())
