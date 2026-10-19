#!/usr/bin/env python3
"""Self-test for checking-names.py.

The test imports the sibling module and asserts the accepted and rejected name
forms, including ASCII-only, hyphen and tool-fixed-name cases. It runs without
a book checkout.

Usage:
  python testing-check-ascii-names.py
Exit code: 0 when every case passes, 1 otherwise.
"""

from __future__ import annotations

import importlib.util
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent


def load_module():
    spec = importlib.util.spec_from_file_location("checking_names", HERE / "checking-names.py")
    if spec is None or spec.loader is None:
        raise RuntimeError("无法加载 checking-names.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def main() -> int:
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

    module = load_module()
    failures: list[str] = []

    accepted = ("designing-theme", "01-rules.qmd", "theme-light.scss", "v1.2.md")
    rejected = ("board_test.cpp", "test support.md", "Designing-theme", "a--b.md")

    for name in accepted:
        error = module.name_form_error(name)
        if error is not None:
            failures.append(f"{name} 应通过，实际失败：{error}")

    for name in rejected:
        if module.name_form_error(name) is None:
            failures.append(f"{name} 应失败，实际通过")

    for tool_name in ("CMakeLists.txt", "SKILL.md", "README.en.md", "package.json"):
        error = module.name_form_error(tool_name)
        if error is not None:
            failures.append(f"工具固定名 {tool_name} 应通过，实际失败：{error}")

    if module.first_non_ascii("中文.md") is None:
        failures.append("first_non_ascii 未识别中文字符")

    if failures:
        print(f"发现 {len(failures)} 例失败：")
        for line in failures:
            print(f"  FAIL {line}")
        return 1

    print(f"PASS：{len(accepted) + len(rejected) + 4} 个用例全部通过")
    return 0


if __name__ == "__main__":
    sys.exit(main())
