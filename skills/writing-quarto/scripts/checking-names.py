#!/usr/bin/env python3
"""Check that repository paths are ASCII and use portable kebab-case.

Quarto fails on some non-ASCII path characters (notably U+2011 and U+2212),
and mixed separators break links after rendering. This script checks every
directory and file name below the book root, excluding generated and vendor
directories.

Rules:
  * Every character is ASCII.
  * Directory and file names use lower-case words separated by one hyphen.
  * Dots are allowed for extensions and version-like names.
  * Tool-owned names in TOOL_FIXED_NAMES pass unchanged.

Usage:
  python checking-names.py [--root PATH]

Exit code: 0 when every path passes, 1 when any path fails.
"""

from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

EXCLUDE_DIRS = {
    "node_modules", "_book", ".quarto", ".git", "_site", "build",
    "dist", "_freeze", "temp", "__pycache__", ".venv", "venv",
}
EXCLUDE_DIR_SUFFIXES = ("_files",)
# 构建目录的变体：build-debug / build-release / _build 都是输出目录，
# 里面是 CMake 自己生成的文件名（CompilerIdCXX.cpp、cmake_install.cmake），
# 不该参与命名检查，否则每次构建后都报一堆假阳性。
EXCLUDE_DIR_PREFIXES = ("build-", "_build")

TOOL_FIXED_NAMES = {
    "CMakeLists.txt", "_quarto.yml", "_quarto.yaml", "SKILL.md", "AGENTS.md",
    "README.md", "README.en.md", "LICENSE", "OFL.txt", "CONTRIBUTING.md",
    ".editorconfig", ".gitignore", ".gitattributes", "openai.yaml",
    "package.json", "package-lock.json", "pnpm-lock.yaml", "tsconfig.json",
}


def first_non_ascii(name: str) -> str | None:
    for ch in name:
        if ord(ch) > 127:
            return ch
    return None


def name_form_error(name: str) -> str | None:
    if name in TOOL_FIXED_NAMES:
        return None
    # CMake 模块名按社区习惯写 CamelCase（CompileSettings.cmake），由
    # include() / find_package() 按名查找，改名会直接断掉构建，故与
    # CMakeLists.txt 同类放行；只看大小写规则，不放过下划线或空格。
    if name.endswith(".cmake"):
        if "_" in name or " " in name:
            return "含下划线" if "_" in name else "含空格"
        return None
    if any(a.islower() and b.isupper() for a, b in zip(name, name[1:])):
        return "含驼峰"
    if "_" in name:
        return "含下划线"
    if " " in name:
        return "含空格"
    if "-" not in name:
        if not all(ch.islower() or ch.isdigit() or ch == "." for ch in name):
            return "含非小写字符"
        return None
    parts = name.split("-")
    if any(part == "" for part in parts):
        return "含连续或首尾连字符"
    for part in parts:
        if not all(ch.islower() or ch.isdigit() or ch == "." for ch in part):
            return "多词段含非小写字符"
    return None


def main() -> int:
    parser = argparse.ArgumentParser(description="检查路径名的 ASCII 与连字符形式")
    parser.add_argument("--root", default=".", help="书根目录（默认当前目录）")
    args = parser.parse_args()

    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

    repo_root = Path(args.root).resolve()
    if not repo_root.is_dir():
        print(f"失败  根目录不存在: {repo_root}")
        return 2

    print(f"扫描：{repo_root}")
    print(f"排除目录：{', '.join(sorted(EXCLUDE_DIRS))}")
    print(f"排除目录前缀：{', '.join(EXCLUDE_DIR_PREFIXES)}")
    print()

    bad: list[tuple[str, str]] = []
    count = 0
    for dirpath, dirnames, filenames in os.walk(repo_root):
        dirnames[:] = [
            d for d in dirnames
            if d not in EXCLUDE_DIRS
            and not d.endswith(EXCLUDE_DIR_SUFFIXES)
            and not d.startswith(EXCLUDE_DIR_PREFIXES)
        ]
        for name in dirnames + filenames:
            count += 1
            target = os.path.join(dirpath, name)
            ch = first_non_ascii(name)
            if ch is not None:
                bad.append((f"U+{ord(ch):04X}", target))
                continue
            form = name_form_error(name)
            if form is not None:
                bad.append((form, target))

    print(f"共检查 {count} 个路径项。")
    print()

    if not bad:
        print("OK：所有路径均为纯 ASCII 且符合连字符形式。")
        return 0

    print(f"发现 {len(bad)} 个不合规路径：")
    for code, path in bad:
        print(f"  [{code}] {path}")
    print()
    print('建议：非 ASCII 字符改为普通 "-"；多词名改为小写连字符式。')
    return 1


if __name__ == "__main__":
    sys.exit(main())
