#!/usr/bin/env python3
"""Audit a Quarto Book's chapter sources.

The checks encode the writing-quarto conventions: one chapter table in
`_quarto.yml`, YAML titles instead of a body H1, ##/### heading depth, short
paragraphs and sentences, declared code-fence languages, `{mermaid}` fences,
and no placeholder text left in the prose.

Project-specific rules are optional. If the book has
`.agents/skills/quarto-book-project/SKILL.md`, the script also reads
`.agents/skills/quarto-book-project/checks.json` when present:

  {
    "forbidden_terms": ["..."],
    "fragment_prefixes": ["games/", "shared/"],
    "chapter_titles": {"content/part/01-intro.qmd": "入门"}
  }

Without a project skill, those checks are skipped and only the generic rules
run. This keeps another book's chapter names and vocabulary out of this book.

Usage:
  python verifying-content.py [--root PATH] [--strict] [--quiet]

Exit codes: 0 = no blocking problem, 1 = problems found, 2 = bad root.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import dataclass
from pathlib import Path

# Generic prose hygiene. These are writing problems in any technical book; the
# list stays short on purpose so it does not become one book's style guide.
GENERIC_FORBIDDEN_TERMS = (
    "第一版", "探针", "自足", "链路", "四步", "契约链",
    "本章规划", "众所周知", "毋庸置疑", "综上所述",
    "务必", "严禁", "千万不要",
)

CHAPTER_NUMBER_RE = re.compile(r"第\s*\d+\s*章")
PLACEHOLDER_RE = re.compile(r"^\s*TODO|待补|待定|TBD", re.IGNORECASE)
TRAILING_SPACE_RE = re.compile(r"[ 	]+$")

HEADING_RE = re.compile(r"^(#{1,6})\s+(.*?)\s*$")
HEADING_PERSONAL_RE = re.compile(r"自己|咱们|我们|你|您|跟我|试试|来看")
FENCE_RE = re.compile(r"^\s*(```+|~~~+)\s*(\{[^}]*\}|[^\s`]*)?")
LINK_RE = re.compile(r"\[[^\]]*\]\(([^)\s]+)\)")
CJK_RE = re.compile(r"[\u3400-\u9fff]")
TITLE_RE = re.compile(r"^title:\s*(.+?)\s*$", re.MULTILINE)

MAX_HEADING_LEVEL = 3
MAX_PARAGRAPH_CHARS = 320
MAX_SENTENCE_CHARS = 95


@dataclass
class Issue:
    path: Path
    line: int
    message: str


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="replace")


def strip_frontmatter(text: str) -> tuple[str, str]:
    if not text.startswith("---"):
        return "", text
    lines = text.splitlines(keepends=True)
    for index in range(1, len(lines)):
        if lines[index].strip() == "---":
            return "".join(lines[1:index]), "".join(lines[index + 1:])
    return "", text


def parse_frontmatter_title(front: str) -> str:
    match = TITLE_RE.search(front)
    if not match:
        return ""
    value = match.group(1).strip()
    if value.startswith(("'", '"')) and value.endswith(("'", '"')):
        value = value[1:-1]
    return value


def parse_chapters(quarto_yml: Path) -> list[str]:
    """Return chapter hrefs in declaration order.

    Supports the forms Quarto Book uses:
      chapters:
        - index.qmd
        - href: content/part/01-intro.qmd
        - part: content/part/index.qmd
          chapters:
            - content/part/01-intro.qmd
    `part:` 带标题时只是分组标题，不带 .qmd 后缀，因此不会被当成章节；带文件时，
    该文件是分组落地页，也要接受内容检查。嵌套的 `chapters:` 键本身不是章节。
    """
    if not quarto_yml.is_file():
        return []
    chapters: list[str] = []
    in_chapters = False
    for raw in read_text(quarto_yml).splitlines():
        stripped = raw.strip()
        if re.match(r"^chapters:\s*$", stripped):
            in_chapters = True
            continue
        if not in_chapters:
            continue
        if stripped and not raw.startswith((" ", "\t", "-")):
            in_chapters = False
            continue
        if not stripped.startswith("-"):
            continue
        item = stripped[1:].strip()
        key, sep, value = item.partition(":")
        if sep and re.fullmatch(r"[a-z_]+", key.strip()):
            # 只接受会落到页面的键：href 与 part 的文件形式。
            href = value.strip().strip("'\"") if key.strip() in {"href", "part"} else ""
        else:
            href = item.strip("'\"")
        if href.endswith(".qmd"):
            chapters.append(href)
    return chapters


def collect_chapter_files(root: Path, chapters: list[str]) -> list[Path]:
    found: list[Path] = []
    for rel in chapters:
        candidate = root / rel
        if candidate.is_file() and candidate not in found:
            found.append(candidate)
    index = root / "index.qmd"
    if index.is_file() and index not in found:
        found.append(index)
    if chapters:
        return found
    # No chapter table: audit every tracked .qmd outside generated/vendor dirs.
    excluded = {"node_modules", "_book", ".quarto", ".git", "_freeze", "_site"}
    for candidate in sorted(root.rglob("*.qmd")):
        rel_parts = candidate.relative_to(root).parts
        if any(part in excluded or part.startswith(".") for part in rel_parts):
            continue
        if candidate not in found:
            found.append(candidate)
    return found


def check_heading(path: Path, line: int, level: int, text: str, issues: list[Issue]) -> None:
    if level > MAX_HEADING_LEVEL:
        issues.append(Issue(path, line, f"H{level} 超出允许深度 H{MAX_HEADING_LEVEL}"))
    if not text:
        issues.append(Issue(path, line, "空标题"))
    if re.search(r"[。！？；]$", text):
        issues.append(Issue(path, line, "标题末尾带句读"))
    if HEADING_PERSONAL_RE.search(text):
        issues.append(Issue(path, line, "标题带人称或口语劝诱；改写成对象名或「动词 + 具体宾语」"))
    if "`" in text:
        issues.append(Issue(path, line, "标题带行内代码；文件名留给正文，标题写对象"))


def check_prose_block(path: Path, start_line: int, text: str, issues: list[Issue]) -> None:
    compact = text.strip()
    if not compact:
        return
    if CHAPTER_NUMBER_RE.search(compact):
        issues.append(Issue(path, start_line, "第 N 章式编号指称（用章节标题或链接）"))
    if CJK_RE.search(compact):
        length = len(re.sub(r"\s+", "", compact))
        if length > MAX_PARAGRAPH_CHARS:
            issues.append(Issue(
                path, start_line,
                f"段落 {length} 字符，超过 {MAX_PARAGRAPH_CHARS}；拆成两段或删枝蔓",
            ))
        for sentence in re.split(r"(?<=[。！？])", compact):
            sentence = sentence.strip()
            if len(sentence) > MAX_SENTENCE_CHARS:
                issues.append(Issue(
                    path, start_line,
                    f"句子 {len(sentence)} 字符，超过 {MAX_SENTENCE_CHARS}；先拆主谓再补条件",
                ))
                break


def check_file(path: Path, root: Path, project: dict, chapters: list[str]) -> list[Issue]:
    issues: list[Issue] = []
    text = read_text(path)
    front, body = strip_frontmatter(text)
    rel = path.relative_to(root).as_posix()

    if not front and path.name != "index.qmd":
        issues.append(Issue(path, 1, "缺少 YAML frontmatter（章节 title 从这里读取）"))
    elif front and not parse_frontmatter_title(front):
        issues.append(Issue(path, 1, "frontmatter 缺少 title"))

    lines = body.splitlines()
    in_fence = False
    fence_lang = ""
    fence_start = 0
    paragraph: list[str] = []
    paragraph_start = 0

    def flush_paragraph() -> None:
        nonlocal paragraph
        if paragraph:
            check_prose_block(path, paragraph_start, " ".join(paragraph), issues)
            paragraph = []

    for number, raw in enumerate(lines, start=1):
        fence = FENCE_RE.match(raw)
        if fence:
            flush_paragraph()
            if not in_fence:
                in_fence = True
                fence_start = number
                fence_lang = (fence.group(2) or "").strip()
                if not fence_lang:
                    issues.append(Issue(path, number, "代码围栏未声明语言"))
                elif fence_lang == "mermaid":
                    issues.append(Issue(path, number, "plain mermaid 围栏（改用 ```{mermaid}）"))
                elif fence_lang.startswith("{"):
                    inner = fence_lang.strip("{}").strip()
                    if inner and not inner.startswith((".", "=")) and "mermaid" not in inner:
                        # ```{python} style attribute fences are valid.
                        pass
            else:
                in_fence = False
            continue

        if in_fence:
            if "\t" in raw:
                issues.append(Issue(path, number, "代码含制表符（改用空格）"))
            continue

        heading = HEADING_RE.match(raw)
        if heading:
            flush_paragraph()
            level = len(heading.group(1))
            heading_text = heading.group(2)
            if level == 1:
                issues.append(Issue(path, number, "正文出现 H1；书名由 YAML title 提供"))
            check_heading(path, number, level, heading_text, issues)
            continue

        if PLACEHOLDER_RE.search(raw):
            issues.append(Issue(path, number, "残留占位内容"))
        if TRAILING_SPACE_RE.search(raw):
            issues.append(Issue(path, number, "行尾空白"))

        if not raw.strip():
            flush_paragraph()
            continue

        if raw.lstrip().startswith((">", "|", "-", "*", "+", "1.")):
            flush_paragraph()
            check_prose_block(path, number, re.sub(r"^\s*(?:[>|]|[-*+]|\d+\.)\s*", "", raw), issues)
            continue

        if not paragraph:
            paragraph_start = number
        paragraph.append(raw.strip())

    flush_paragraph()

    for index, raw in enumerate(lines, start=1):
        match = LINK_RE.search(raw)
        if not match:
            continue
        target = match.group(1).strip()
        if target.startswith(("http://", "https://", "mailto:", "#", "data:")):
            continue
        clean = target.split("#", 1)[0].split("?", 1)[0]
        if not clean or "<" in clean:
            continue
        if not (path.parent / clean).exists() and not (root / clean).exists():
            issues.append(Issue(path, index, f"本地链接不可达：{target}"))

    if text.count("```") % 2 != 0:
        issues.append(Issue(path, len(lines), "代码围栏数量为奇数，存在未闭合围栏"))

    for term in GENERIC_FORBIDDEN_TERMS:
        for index, raw in enumerate(lines, start=1):
            if term in raw and not raw.lstrip().startswith(("```", "    ")):
                issues.append(Issue(path, index, f"禁用词「{term}」"))
                break

    for term in project.get("forbidden_terms", []):
        for index, raw in enumerate(lines, start=1):
            if term and term in raw:
                issues.append(Issue(path, index, f"项目禁用词「{term}」"))
                break

    required = project.get("chapter_titles", {}).get(rel)
    if required:
        title = parse_frontmatter_title(front)
        if required not in title:
            issues.append(Issue(path, 1, f"章节 title 应包含「{required}」，实际为「{title}」"))

    if rel not in chapters and path.name != "index.qmd" and path.parent.name != "":
        issues.append(Issue(path, 1, "文件未列入 _quarto.yml 的 chapters（目录会漏章）"))

    return issues


def load_project(root: Path) -> tuple[bool, dict]:
    skill = root / ".agents" / "skills" / "quarto-book-project" / "SKILL.md"
    if not skill.is_file():
        return False, {}
    config_path = skill.parent / "checks.json"
    if not config_path.is_file():
        return True, {}
    try:
        data = json.loads(read_text(config_path))
    except json.JSONDecodeError as exc:
        print(f"警告：{config_path} 不是合法 JSON（{exc}），忽略项目规则")
        return True, {}
    if not isinstance(data, dict):
        print(f"警告：{config_path} 顶层应为对象，忽略项目规则")
        return True, {}
    return True, data


def main() -> int:
    parser = argparse.ArgumentParser(description="检查 Quarto Book 章节源码")
    parser.add_argument("--root", default=".", help="书根目录（默认当前目录）")
    parser.add_argument("--strict", action="store_true", help="把未列入目录的文件也视为错误")
    parser.add_argument("--quiet", action="store_true", help="只输出汇总")
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

    quarto_yml = root / "_quarto.yml"
    chapters = parse_chapters(quarto_yml)
    files = collect_chapter_files(root, chapters)
    if not files:
        print(f"失败  {root} 下没有 .qmd 章节（确认 --root 指向书根目录）")
        return 1

    has_project, project = load_project(root)

    missing = [rel for rel in chapters if not (root / rel).is_file()]
    issues: list[Issue] = [
        Issue(quarto_yml, 1, f"目录中的章节不存在：{rel}") for rel in missing
    ]

    for path in files:
        issues.extend(check_file(path, root, project, chapters))

    if args.strict:
        for issue in list(issues):
            if "未列入 _quarto.yml" in issue.message:
                issue.message = issue.message.replace("（目录会漏章）", "")
    else:
        issues = [issue for issue in issues if "未列入 _quarto.yml" not in issue.message]

    if not args.quiet:
        print(f"根目录：{root}")
        print(f"章节：{len(files)} 个 .qmd；目录声明：{len(chapters)} 条")
        print(f"项目规则：{'已加载' if has_project else '未发现 .agents/skills/quarto-book-project，跳过'}")
        print()

    if not issues:
        print(f"OK：{len(files)} 个章节通过通用检查。")
        return 0

    issues.sort(key=lambda item: (str(item.path), item.line))
    print(f"发现 {len(issues)} 个问题：")
    for issue in issues[:120]:
        rel = issue.path.relative_to(root).as_posix() if issue.path.is_relative_to(root) else str(issue.path)
        print(f"  {rel}:{issue.line}: {issue.message}")
    if len(issues) > 120:
        print(f"  ……其余 {len(issues) - 120} 条省略")
    return 1


if __name__ == "__main__":
    sys.exit(main())
