#!/usr/bin/env python3
"""Check local links in Markdown and Quarto sources.

Only relative links that point at repository files are checked; external URLs,
anchors, mail links and Quarto template placeholders are skipped. The script
resolves `../` and `./` against the containing file, then falls back to the
book root so links written from `content/` still work.

Usage:
  python checking-links.py [--root PATH] [--paths PATH ...]

Exit code: 0 when every checked link resolves, 1 when any is broken.
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

LINK_RE = re.compile(r"\[[^\]]*\]\(([^)\s]+)(?:\s+\"[^\"]*\")?\)")
REF_USE_RE = re.compile(r"(!?)\[([^\]]*)\]\[([^\]]*)\]")
REF_DEF_RE = re.compile(r"^ {0,3}\[([^\]]+)\]:\s*(?:<([^>\s]+)>|(\S+))")
INLINE_CODE_RE = re.compile(r"`+[^`]*`+")
HTML_LINK_RE = re.compile(r"<(?:a|img)\b[^>]*\b(?:href|src)=\"([^\"]+)\"", re.IGNORECASE)
FENCE_RE = re.compile(r"^\s*(```+|~~~+)")
SKIP_PREFIXES = ("http://", "https://", "mailto:", "tel:", "data:", "#", "//")
SKIP_DIRS = {".git", ".cache", ".quarto", "_book", "_freeze", "_site", "build", "node_modules", "temp"}


def collect_sources(root: Path, paths: list[str]) -> list[Path]:
    if paths:
        found: list[Path] = []
        for raw in paths:
            candidate = Path(raw)
            if not candidate.is_absolute():
                candidate = root / candidate
            if candidate.is_dir():
                found.extend(candidate.rglob("*.qmd"))
                found.extend(candidate.rglob("*.md"))
            elif candidate.is_file():
                found.append(candidate)
        return sorted(set(found))
    found = list(root.rglob("*.qmd")) + list(root.rglob("*.md"))
    return sorted(
        path for path in found
        if not any(
            part in SKIP_DIRS
            for part in path.relative_to(root).parts
        )
    )


def normalize_label(label: str) -> str:
    return re.sub(r"\s+", " ", label.strip()).casefold()


def collect_definitions(text: str) -> dict[str, tuple[int, str]]:
    """收集引用式链接定义 `[label]: target`；围栏内的定义不算。"""
    definitions: dict[str, tuple[int, str]] = {}
    in_fence = False
    for number, line in enumerate(text.splitlines(), start=1):
        if FENCE_RE.match(line):
            in_fence = not in_fence
            continue
        if in_fence:
            continue
        match = REF_DEF_RE.match(line)
        if not match:
            continue
        label = normalize_label(match.group(1))
        target = match.group(2) or match.group(3) or ""
        if label and label not in definitions:
            definitions[label] = (number, target)
    return definitions


def iter_links(text: str, definitions: dict[str, tuple[int, str]]):
    in_fence = False
    for number, line in enumerate(text.splitlines(), start=1):
        if FENCE_RE.match(line):
            in_fence = not in_fence
            continue
        if in_fence or REF_DEF_RE.match(line):
            continue
        # 行内代码里的方括号不是链接；先抹掉，避免把示例当引用。
        visible = INLINE_CODE_RE.sub(lambda match: " " * len(match.group(0)), line)
        for match in LINK_RE.finditer(visible):
            yield number, match.group(1), None
        for match in REF_USE_RE.finditer(visible):
            label = match.group(3) or match.group(2)
            key = normalize_label(label)
            if not key:
                continue
            definition = definitions.get(key)
            yield number, definition[1] if definition else None, label
        for match in HTML_LINK_RE.finditer(visible):
            yield number, match.group(1), None


def main() -> int:
    parser = argparse.ArgumentParser(description="检查 Markdown/Quarto 中的本地链接")
    parser.add_argument("--root", default=".", help="书根目录（默认当前目录）")
    parser.add_argument("--paths", nargs="*", default=[], help="只检查指定文件或目录")
    args = parser.parse_args()

    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

    root = Path(args.root).resolve()
    if not root.is_dir():
        print(f"失败  根目录不存在: {root}")
        return 2

    sources = collect_sources(root, args.paths)
    if not sources:
        print("失败  没有可检查的 Markdown/Quarto 源文件", file=sys.stderr)
        return 2
    broken: list[tuple[str, int, str, str]] = []
    checked = 0

    for source in sources:
        try:
            text = source.read_text(encoding="utf-8")
        except UnicodeDecodeError as exc:
            print(f"失败  {source} 不是合法 UTF-8：{exc}", file=sys.stderr)
            return 1
        rel = source.relative_to(root).as_posix()
        definitions = collect_definitions(text)
        for number, raw, label in iter_links(text, definitions):
            if raw is None:
                checked += 1
                broken.append((rel, number, f"[{label}]", "引用标签未定义"))
                continue
            target = raw.strip()
            if not target or target.startswith(SKIP_PREFIXES):
                continue
            if "<" in target or ">" in target:
                continue
            clean = target.split("#", 1)[0].split("?", 1)[0]
            if not clean:
                continue
            checked += 1
            candidates = [source.parent / clean, root / clean]
            if any(candidate.exists() for candidate in candidates):
                continue
            broken.append((rel, number, target, "目标不存在"))

    print(f"扫描 {len(sources)} 个文件，检查 {checked} 条本地链接。")
    if not broken:
        print("OK：本地链接全部可达。")
        return 0

    print(f"发现 {len(broken)} 条断链：")
    for rel, number, target, reason in broken[:80]:
        print(f"  {rel}:{number} -> {target}（{reason}）")
    return 1


if __name__ == "__main__":
    sys.exit(main())
