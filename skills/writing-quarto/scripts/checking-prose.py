#!/usr/bin/env python3
"""检查 Quarto 章节里的高置信中英混排问题。

只报能直接判断的错误：中文与拉丁字母、数字或行内代码之间缺空格，
中文句里混入半角标点，中文标点前多了空格。句子长短、术语解释等
仍需按 writing-quarto 的步骤人工回读。

用法：
    python checking-prose.py --root <book>
    python checking-prose.py --root <book> --json
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import dataclass
from pathlib import Path

CJK = r"\u4e00-\u9fff"
CJK_CHAR = re.compile(f"[{CJK}]")
CJK_LATIN = re.compile(f"([{CJK}])([A-Za-z0-9])")
LATIN_CJK = re.compile(f"([A-Za-z0-9])([{CJK}])")
HALF_PUNCT_IN_CJK = re.compile(f"([{CJK}])[,.;:?!]([{CJK}])")
SPACE_BEFORE_PUNCT = re.compile(f"([^\\s])[ \\t]+([，。；：！？、])")
DOUBLE_SPACE = re.compile(r"(?<=\S)[ \t]{2,}(?=\S)")
FENCE = re.compile(r"^\s*(```+|~~~+)")
INLINE_CODE = re.compile(r"`[^`\n]*`")
URL = re.compile(r"https?://[^\s)>\]]+")
LINK_TARGET = re.compile(r"\]\([^)]*\)")
HTML_TAG = re.compile(r"<[^>]+>")
SKIP_PREFIXES = (":::", "| ---", "|---")
SKIP_DIRS = {"_book", ".quarto", "node_modules", ".git", "temp", ".cache"}


@dataclass(frozen=True)
class Issue:
    path: str
    line: int
    message: str


def split_frontmatter(text: str) -> tuple[int, str]:
    lines = text.splitlines()
    if lines and lines[0].strip() == "---":
        for index in range(1, len(lines)):
            if lines[index].strip() == "---":
                return index + 1, "\n".join(lines[index + 1 :])
    return 0, text


def mask_links_and_tags(line: str) -> str:
    line = URL.sub("\x00", line)
    line = LINK_TARGET.sub("\x00", line)
    line = HTML_TAG.sub("\x00", line)
    return line


def mask_inline_code(line: str) -> str:
    return INLINE_CODE.sub("\x00", line)


def check_line(path: str, number: int, line: str) -> list[Issue]:
    stripped = line.strip()
    if not stripped or stripped.startswith(SKIP_PREFIXES) or stripped.startswith("<!--"):
        return []
    if stripped.startswith("#") and stripped.endswith("#"):
        return []
    if stripped.startswith("|") and set(stripped) <= set("|-: "):
        return []

    issues: list[Issue] = []
    base = mask_links_and_tags(line)
    visible = mask_inline_code(base)

    for match in CJK_LATIN.finditer(visible):
        issues.append(Issue(path, number, f"中文与拉丁字母/数字之间缺空格：{match.group(0)}"))
    for match in LATIN_CJK.finditer(visible):
        issues.append(Issue(path, number, f"拉丁字母/数字与中文之间缺空格：{match.group(0)}"))
    for match in HALF_PUNCT_IN_CJK.finditer(visible):
        issues.append(Issue(path, number, f"中文句里混入半角标点：{match.group(0)}"))
    for match in SPACE_BEFORE_PUNCT.finditer(visible):
        issues.append(Issue(path, number, f"中文标点前多了空格：{match.group(0)}"))
    for match in DOUBLE_SPACE.finditer(visible):
        issues.append(Issue(path, number, f"正文里有连续空格：{match.group(0)!r}"))

    for match in INLINE_CODE.finditer(base):
        before = base[match.start() - 1] if match.start() else ""
        after = base[match.end()] if match.end() < len(base) else ""
        if before and CJK_CHAR.match(before):
            issues.append(Issue(path, number, "中文与行内代码之间缺空格"))
        if after and CJK_CHAR.match(after):
            issues.append(Issue(path, number, "行内代码与中文之间缺空格"))

    return issues


def scan_file(root: Path, path: Path) -> list[Issue]:
    text = path.read_text(encoding="utf-8")
    offset, body = split_frontmatter(text)
    issues: list[Issue] = []
    in_fence = False
    for number, line in enumerate(body.splitlines(), start=offset + 1):
        if FENCE.match(line):
            in_fence = not in_fence
            continue
        if in_fence:
            continue
        issues.extend(check_line(path.relative_to(root).as_posix(), number, line))
    return issues


def collect_files(root: Path) -> list[Path]:
    files: list[Path] = []
    for path in sorted(root.rglob("*.qmd")):
        if any(part in SKIP_DIRS for part in path.relative_to(root).parts):
            continue
        files.append(path)
    return files


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", default=".", help="书仓库根目录")
    parser.add_argument("--json", action="store_true", help="输出 JSON")
    parser.add_argument("--quiet", action="store_true", help="没有问题时也保持安静")
    args = parser.parse_args()

    root = Path(args.root).resolve()
    if not root.is_dir():
        print(f"失败  根目录不存在：{root}", file=sys.stderr)
        return 2

    issues: list[Issue] = []
    for path in collect_files(root):
        try:
            issues.extend(scan_file(root, path))
        except UnicodeDecodeError as exc:
            print(f"失败  {path} 不是合法 UTF-8：{exc}", file=sys.stderr)
            return 1

    if args.json:
        print(
            json.dumps(
                {
                    "root": str(root),
                    "files": len(collect_files(root)),
                    "issues": [issue.__dict__ for issue in issues],
                },
                ensure_ascii=False,
                indent=2,
            )
        )
    elif issues:
        print(f"发现 {len(issues)} 个混排问题：")
        for issue in issues:
            print(f"{issue.path}:{issue.line}: {issue.message}")
    elif not args.quiet:
        print(f"OK：{len(collect_files(root))} 个章节通过混排检查。")

    return 1 if issues else 0


if __name__ == "__main__":
    raise SystemExit(main())
