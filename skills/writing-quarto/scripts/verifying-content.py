#!/usr/bin/env python3
"""Audit a Quarto Book's chapter sources.

The checks encode the writing-quarto conventions: one chapter table in
`_quarto.yml`, YAML titles instead of a body H1, ##/### heading depth, short
paragraphs and sentences, declared code-fence languages, `{mermaid}` fences,
class-diagram content budgets, directory-tree annotation columns and markers,
and no placeholder text left in the prose.

Project-specific rules are optional. If the book has
`.agents/skills/quarto-book-project/SKILL.md`, the script also reads
`.agents/skills/quarto-book-project/checks.json` when present:

  {
    "forbidden_terms": ["..."],
    "fragment_prefixes": ["games/", "shared/"],
    "chapter_titles": {"content/part/01-intro.qmd": "入门"},
    "later_chapter_names": {"content/part/02-board.qmd": ["LaterType"]}
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
import unicodedata
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

QA_PROSE_RE = re.compile(r"(?:它|只|都|分别|各自)回答|回答(?:四类|整局|这个|哪些|什么)")
CODE_META_RE = re.compile(r"对应的代码")
COINED_RELATION_RE = re.compile(r"(?:组成|依赖|继承|调用)边")
CARRIER_RE = re.compile("承载")
NEXT_SECTION_RE = re.compile(r"(?:下一节|上一节)")
CALLOUT_OPEN_RE = re.compile(r"^\s*:::\s*\{?\s*\.callout-")
OPENING_CLICHE_RE = re.compile(r"^(?:本章|本节|这一章|这一节)(?:将|会|要)|^下面(?:介绍|讲)")
LADDER_RE = re.compile(r"(?:分别交给|各说一层)")
SKILL_TONE_RE = re.compile(r"这里不定义|测试也不必|不必为[^。；\n]{0,20}再记|不写双层循环")
INLINE_NAME_RE = re.compile(r"`([A-Za-z_][A-Za-z0-9_]*)`")
FUNCTION_NAME_RE = re.compile(
    r"^(?:Is|Get|Set|Has|Can|Completes|Place|Read|Write|Print|Run|Make|Collect|Judge|"
    r"Score|Search|Choose|Add|Clear|Reset|Find|Build|Parse|Format|Render|Report|Show|"
    r"Start|Stop|Create|Destroy|Update|Check|Validate|To)[A-Z0-9_]"
    r"|^[a-z][a-z0-9]*(?:_[a-z0-9]+)+$"
)
TERMINAL_RE = re.compile(r"终端|打印|显示|输入|读入|命令行")
TEST_RE = re.compile(r"测试|断言|用例|gtest|CTest")

TREE_CATEGORY_COMMENTS = frozenset({
    "头文件", "源文件", "源码", "实现", "测试", "配置文件",
    "构建脚本", "构建规则", "动态库", "可执行文件",
})
MAX_TREE_LINES = 20
MAX_TREE_COMMENT_WIDTH = 28
MAX_TREE_DIR_COMMENT_WIDTH = 16
MIN_TREE_GAP = 4

# 类图的内容预算。数字是版面判断，不是浏览器实测：正文栏约 840 px、字号
# 15 px 时，6 个类型、14 行成员、单行 40 列仍能在栏内排下；超过就删内容或拆图。
MAX_CLASS_DIAGRAM_TYPES = 6
MAX_CLASS_DIAGRAM_MEMBERS = 14
MAX_CLASS_MEMBERS = 5
MAX_CLASS_MEMBER_COLUMNS = 40
CLASS_RE = re.compile(r"^class\s+([A-Za-z_]\w*)\s*(\{)?")

HEADING_RE = re.compile(r"^(#{1,6})\s+(.*?)\s*$")
HEADING_PERSONAL_RE = re.compile(r"自己|咱们|我们|你|您|跟我|试试|来看")
FENCE_RE = re.compile(r"^\s*(```+|~~~+)\s*(\{[^}]*\}|[^\s`]*)?")
LINK_RE = re.compile(r"\[[^\]]*\]\(([^)\s]+)\)")
LINK_LABEL_RE = re.compile(r"\[([^\]]*)\]\([^)]*\)")
CJK_RE = re.compile(r"[\u3400-\u9fff]")
TITLE_RE = re.compile(r"^title:\s*(.+?)\s*$", re.MULTILINE)

MAX_HEADING_LEVEL = 3
MAX_PARAGRAPH_CHARS = 320
MAX_SENTENCE_CHARS = 95

# 导语长度由项目在 checks.json 的 lead_chars 里声明，例如 [60, 140]；没有声明
# 就不检查，避免把一个项目的版面预算带进另一本书。
LEAD_SKIP_RE = re.compile(r"^\s*(?:::|\||```|~~~|[-*+]\s|\d+\.\s|>|#)")


@dataclass
class Issue:
    path: Path
    line: int
    message: str


def read_text(path: Path) -> str:
    # utf-8-sig 兼容带 BOM 的合法 UTF-8 文件；BOM 不进入行号与正文。
    return path.read_text(encoding="utf-8-sig")


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
        if not stripped:
            continue
        item = stripped[1:].strip() if stripped.startswith("-") else stripped
        key, sep, value = item.partition(":")
        if sep and re.fullmatch(r"[a-z_]+", key.strip()):
            # 只接受会落到页面的键：href 与 part 的文件形式。
            href = value.strip().strip("'\"") if key.strip() in {"href", "part"} else ""
        else:
            href = item.strip("'\"")
        if href.endswith(".qmd"):
            chapters.append(href)
    return chapters


def collect_all_qmd(root: Path) -> list[Path]:
    excluded = {"node_modules", "_book", ".quarto", ".git", "_freeze", "_site"}
    found: list[Path] = []
    for candidate in sorted(root.rglob("*.qmd")):
        rel_parts = candidate.relative_to(root).parts
        if any(part in excluded or part.startswith(".") for part in rel_parts):
            continue
        found.append(candidate)
    return found


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
    # No chapter table: audit every .qmd outside generated/vendor dirs.
    return collect_all_qmd(root)


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
    if level == 3 and re.search(r"[0-9一二三四五六七八九十百]+条", text):
        issues.append(Issue(path, line, "三级标题在数条目；拆成实体标题或改成承载对象"))


def check_prose_block(
    path: Path, start_line: int, text: str, issues: list[Issue], is_list: bool = False
) -> None:
    compact = text.strip()
    if not compact:
        return
    if CHAPTER_NUMBER_RE.search(compact):
        issues.append(Issue(path, start_line, "第 N 章式编号指称（用章节标题或链接）"))
    if SKILL_TONE_RE.search(compact):
        issues.append(Issue(path, start_line, "技能腔：只约束作者的选择，整句删掉"))
    if not is_list and CJK_RE.search(compact):
        names = {
            match.group(1)
            for match in INLINE_NAME_RE.finditer(compact)
            if FUNCTION_NAME_RE.search(match.group(1))
        }
        if len(names) >= 3 and TERMINAL_RE.search(compact) and TEST_RE.search(compact):
            issues.append(Issue(
                path, start_line,
                f"一段里出现 {len(names)} 个函数名，还同时讲终端与测试；拆成列表，一项一件",
            ))
    if CJK_RE.search(compact):
        visible = LINK_LABEL_RE.sub(r"\1", compact)
        length = len(re.sub(r"\s+", "", visible))
        if length > MAX_PARAGRAPH_CHARS:
            issues.append(Issue(
                path, start_line,
                f"段落 {length} 字符，超过 {MAX_PARAGRAPH_CHARS}；拆成两段或删枝蔓",
            ))
        for sentence in re.split(r"(?<=[。！？])", visible):
            sentence = sentence.strip()
            if len(sentence) > MAX_SENTENCE_CHARS:
                issues.append(Issue(
                    path, start_line,
                    f"句子 {len(sentence)} 字符，超过 {MAX_SENTENCE_CHARS}；先拆主谓再补条件",
                ))
                break


def display_width(text: str) -> int:
    return sum(2 if unicodedata.east_asian_width(char) in {"W", "F"} else 1 for char in text)


def check_mermaid_block(path: Path, block: list[tuple[int, str]]) -> list[Issue]:
    """Check a class diagram's content budget and direction."""
    diagram_at = next((index for index, (_, raw) in enumerate(block) if "classDiagram" in raw), None)
    if diagram_at is None:
        return []

    issues: list[Issue] = []
    start_line = block[diagram_at][0]
    text = "\n".join(raw for _, raw in block)
    if "hideEmptyMembersBox" not in text:
        issues.append(Issue(
            path, start_line,
            "类图块首缺少 hideEmptyMembersBox 配置；空类会画出空成员栏",
        ))
    caption_at = next(
        (index for index, (_, raw) in enumerate(block) if raw.lstrip().startswith("%%| fig-cap:")),
        None,
    )
    init_at = next(
        (index for index, (_, raw) in enumerate(block) if raw.lstrip().startswith("%%{init")),
        None,
    )
    if caption_at is None:
        issues.append(Issue(
            path, start_line,
            "类图缺少 fig-cap 图注；线型与读图约定应写在图注里",
        ))
    elif init_at is not None and caption_at > init_at:
        issues.append(Issue(
            path, block[caption_at][0],
            "fig-cap 必须写在 init 之前；写在 init 之后会原样渲染成 Mermaid 注释",
        ))

    classes: dict[str, list[tuple[int, str]]] = {}
    order: list[str] = []
    direction = ""
    direction_line = start_line
    current: str | None = None
    for number, raw in block[diagram_at:]:
        line = raw.strip()
        if not line or line.startswith("%%"):
            continue
        if line.startswith("direction "):
            direction = line.split(None, 1)[1].strip().upper()
            direction_line = number
            continue
        match = CLASS_RE.match(line)
        if match:
            name = match.group(1)
            if name not in classes:
                classes[name] = []
                order.append(name)
            current = name if "{" in line else None
            continue
        if current is None:
            continue
        if line == "}":
            current = None
            continue
        if line.startswith("<<") and line.endswith(">>"):
            continue
        classes[current].append((number, line))

    total_members = sum(len(lines) for lines in classes.values())
    if len(order) > MAX_CLASS_DIAGRAM_TYPES:
        issues.append(Issue(
            path, start_line,
            f"类图有 {len(order)} 个类型，超过 {MAX_CLASS_DIAGRAM_TYPES} 个；删节点或拆图",
        ))
    if total_members > MAX_CLASS_DIAGRAM_MEMBERS:
        issues.append(Issue(
            path, start_line,
            f"类图成员共 {total_members} 行，超过 {MAX_CLASS_DIAGRAM_MEMBERS} 行；只留本章连边要用的成员",
        ))
    for name in order:
        members = classes[name]
        if len(members) > MAX_CLASS_MEMBERS:
            issues.append(Issue(
                path, members[MAX_CLASS_MEMBERS][0],
                f"类 {name} 有 {len(members)} 行成员，超过 {MAX_CLASS_MEMBERS} 行；删到本章要用的",
            ))
        for number, line in members:
            width = display_width(line)
            if width > MAX_CLASS_MEMBER_COLUMNS:
                issues.append(Issue(
                    path, number,
                    f"类图成员行 {width} 列，超过 {MAX_CLASS_MEMBER_COLUMNS} 列；参数省略类型名",
                ))
    if direction == "LR" and total_members:
        issues.append(Issue(
            path, direction_line,
            "类图有成员却用 LR；改成 TB，让类型上下排",
        ))
    return issues


def check_mermaid_wrapper(path: Path, lines: list[str], block: list[tuple[int, str]]) -> list[Issue]:
    """Check a class diagram sits in the .class-diagram scroll container."""
    if not any("classDiagram" in raw for _, raw in block):
        return []
    start = block[0][0]
    index = start - 2
    if 0 <= index < len(lines) and lines[index].lstrip().startswith("```"):
        index -= 1
    while index >= 0 and not lines[index].strip():
        index -= 1
    if index < 0 or ".class-diagram" not in lines[index]:
        return [Issue(
            path, start,
            "类图缺少 .class-diagram 包裹；无法应用类图的宽度与居中规则",
        )]
    return []


def check_tree_block(path: Path, block: list[tuple[int, str]]) -> list[Issue]:
    """Check tree glyph lines: size, marker, width, items, and two marker columns."""
    tree_lines = [(number, raw) for number, raw in block if "├──" in raw or "└──" in raw]
    if len(tree_lines) < 2:
        return []
    issues: list[Issue] = []
    if len(tree_lines) > MAX_TREE_LINES:
        issues.append(Issue(
            path, tree_lines[0][0],
            f"树有 {len(tree_lines)} 行，超过 {MAX_TREE_LINES} 行；只留本章会点名的文件",
        ))
    dirs: list[tuple[int, int]] = []
    files: list[tuple[int, int]] = []
    text_columns: list[tuple[int, int]] = []
    for number, raw in tree_lines:
        hash_index = raw.find("#")
        if hash_index < 0:
            issues.append(Issue(path, number, "树行缺少行尾注释"))
            continue
        prefix = raw[:hash_index]
        entry = prefix.rstrip()
        if display_width(prefix) - display_width(entry) < MIN_TREE_GAP:
            issues.append(Issue(path, number, "节点与注释之间至少留四个空格"))
        rest = raw[hash_index:]
        marker = "#/" if rest.startswith("#/") else "#"
        after = rest[len(marker):]
        if not after.startswith(" ") or (len(after) > 1 and after[1] == " "):
            issues.append(Issue(path, number, "标记后只留一个空格"))
        is_directory = entry.endswith("/")
        if is_directory and marker != "#/":
            issues.append(Issue(path, number, "目录行的注释以 #/ 开头"))
        if not is_directory and marker == "#/":
            issues.append(Issue(path, number, "文件行的注释以 # 开头"))
        comment = after.strip()
        if not comment:
            issues.append(Issue(path, number, "树行注释为空"))
            continue
        if is_directory:
            if "：" in comment or ":" in comment:
                issues.append(Issue(
                    path, number,
                    "目录注释只写这里装什么，不加冒号或子项职责",
                ))
            if "、" in comment:
                issues.append(Issue(
                    path, number,
                    "目录注释不列清单，用名词短语",
                ))
            if display_width(comment) > MAX_TREE_DIR_COMMENT_WIDTH:
                issues.append(Issue(
                    path, number,
                    f"目录注释 {display_width(comment)} 列，超过 {MAX_TREE_DIR_COMMENT_WIDTH} 列；只留名词短语",
                ))
        else:
            if display_width(comment) > MAX_TREE_COMMENT_WIDTH:
                issues.append(Issue(
                    path, number,
                    f"注释 {display_width(comment)} 列，超过 {MAX_TREE_COMMENT_WIDTH} 列；缩成短名词短语",
                ))
            elif comment.rstrip("：:") in TREE_CATEGORY_COMMENTS:
                issues.append(Issue(path, number, f"注释只写类别词「{comment}」；写对象与用途"))
            separators = comment.count("、") + len(re.findall(r"(?<!参)与", comment))
            if separators > 1:
                issues.append(Issue(
                    path, number, f"注释列了 {separators + 1} 项；压到 1 到 2 项",
                ))
        column = display_width(prefix)
        if is_directory:
            dirs.append((number, column))
        else:
            files.append((number, column))
        text_columns.append((number, column + len(marker) + len(after) - len(after.lstrip(" "))))
    if dirs:
        dir_column = dirs[0][1]
        if any(column != dir_column for _, column in dirs[1:]):
            issues.append(Issue(path, dirs[0][0], "目录 #/ 未对齐"))
        for number, column in files:
            if column != dir_column + 1:
                issues.append(Issue(
                    path, number,
                    f"文件 # 应比目录 # 右移一列（目录在 {dir_column}，文件在 {column}）",
                ))
                break
    elif files:
        file_column = files[0][1]
        if any(column != file_column for _, column in files[1:]):
            issues.append(Issue(path, files[0][0], "文件 # 未对齐"))
    if text_columns:
        text_column = text_columns[0][1]
        for number, column in text_columns[1:]:
            if column != text_column:
                issues.append(Issue(path, number, "注释文字未对齐"))
                break
    return issues


def check_html_figure_block(path: Path, block: list[tuple[int, str]]) -> list[Issue]:
    """原生 HTML/SVG 图要用 <figure> 包住，<figcaption> 放在图后。"""
    issues: list[Issue] = []
    svg_line: int | None = None
    figure_line: int | None = None
    caption_line: int | None = None
    for number, raw in block:
        if "<figure" in raw and figure_line is None:
            figure_line = number
        if "<svg" in raw and svg_line is None:
            svg_line = number
            if figure_line is None:
                issues.append(Issue(
                    path, number,
                    "原生 SVG 图要用 <figure> 包住，并在图后写 <figcaption>",
                ))
        if "<figcaption" in raw and caption_line is None:
            caption_line = number
    if svg_line is not None and figure_line is not None:
        if caption_line is None:
            issues.append(Issue(
                path, svg_line,
                "原生 SVG 图缺 <figcaption>（图注要落在图下）",
            ))
        elif caption_line < svg_line:
            issues.append(Issue(
                path, caption_line,
                "<figcaption> 要放在图后，不能放在图前",
            ))
    return issues


def visible_chars(text: str) -> int:
    label = LINK_LABEL_RE.sub(r"\1", text)
    return len(re.sub(r"\s+", "", label))


def check_lead(
    path: Path, front: str, lines: list[str], issues: list[Issue], limits: list[int]
) -> None:
    """检查 title 与第一个标题之间的首段导语长度。

    着陆页（body-classes 里有 index-page 或 homepage）按卡片组织，不受限。
    """
    if "body-classes:" in front and ("index-page" in front or "homepage" in front):
        return
    first = len(lines)
    for index, raw in enumerate(lines):
        if HEADING_RE.match(raw):
            first = index
            break
    paragraph: list[str] = []
    start = 1
    for index, raw in enumerate(lines[:first], start=1):
        if not raw.strip() or LEAD_SKIP_RE.match(raw):
            if paragraph:
                break
            continue
        if not paragraph:
            start = index
        paragraph.append(raw.strip())
    if not paragraph:
        return
    length = visible_chars(" ".join(paragraph))
    low, high = limits[0], limits[1]
    if length < low:
        issues.append(Issue(
            path, start,
            f"导语 {length} 字符，短于 {low}；补一句本章要解决什么",
        ))
    elif length > high:
        issues.append(Issue(
            path, start,
            f"导语 {length} 字符，超过 {high}；先删下一块已经摆出来的内容",
        ))


def check_file(path: Path, root: Path, project: dict, chapters: list[str]) -> list[Issue]:
    issues: list[Issue] = []
    text = read_text(path)
    front, body = strip_frontmatter(text)
    rel = path.relative_to(root).as_posix()

    if not front and path.name != "index.qmd":
        issues.append(Issue(path, 1, "缺少 YAML frontmatter（章节 title 从这里读取）"))
    elif front and not parse_frontmatter_title(front):
        issues.append(Issue(path, 1, "frontmatter 缺少 title"))

    # 保留 frontmatter 的行数，后续行号才是文件里的真实行号。
    leading = text[: len(text) - len(body)] if body else ""
    if leading:
        body = "\n" * leading.count("\n") + body
    lines = body.splitlines()
    limits = project.get("lead_chars")
    if isinstance(limits, list) and len(limits) == 2 and all(isinstance(v, int) for v in limits):
        check_lead(path, front, lines, issues, limits)
    in_fence = False
    fence_lang = ""
    fence_start = 0
    fence_lines: list[tuple[int, str]] = []
    fence_blocks: list[list[tuple[int, str]]] = []
    mermaid_blocks: list[list[tuple[int, str]]] = []
    html_blocks: list[list[tuple[int, str]]] = []
    fence_is_html = False
    paragraph: list[str] = []
    paragraph_start = 0
    last_fence_end: int | None = None

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
                if last_fence_end is not None and number == last_fence_end + 1:
                    issues.append(Issue(
                        path, number,
                        "相邻围栏之间至少留一个空行（DOC-E11）；空行不等于桥接正文",
                    ))
                fence_lang = (fence.group(2) or "").strip()
                fence_lines = []
                fence_is_html = False
                if not fence_lang:
                    issues.append(Issue(path, number, "代码围栏未声明语言"))
                elif fence_lang == "mermaid":
                    issues.append(Issue(path, number, "plain mermaid 围栏（改用 ```{mermaid}）"))
                elif fence_lang.startswith("{"):
                    inner = fence_lang.strip("{}").strip()
                    fence_is_html = inner == "=html"
                    if inner and not inner.startswith((".", "=")) and "mermaid" not in inner:
                        # ```{python} style attribute fences are valid.
                        pass
            else:
                in_fence = False
                last_fence_end = number
                if fence_lines:
                    fence_blocks.append(fence_lines)
                    if "mermaid" in fence_lang:
                        mermaid_blocks.append(fence_lines)
                        if "aria-label=" not in fence_lang or "role=" not in fence_lang:
                            issues.append(Issue(
                                path, number,
                                'mermaid 图缺少无障碍名称：围栏写 role="img" 与 aria-label="…"',
                            ))
                    if fence_is_html:
                        html_blocks.append(fence_lines)
                    fence_lines = []
                    fence_is_html = False
            continue

        if in_fence:
            if "\t" in raw:
                issues.append(Issue(path, number, "代码含制表符（改用空格）"))
            fence_lines.append((number, raw))
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

        if raw.lstrip().startswith("|"):
            flush_paragraph()
            # 表格行按列组织，不套散文句长阈值；列数与表头一致性由表格检查负责。
            continue

        if raw.lstrip().startswith((">", "-", "*", "+", "1.")):
            flush_paragraph()
            check_prose_block(
                path, number, re.sub(r"^\s*(?:[>|]|[-*+]|\d+\.)\s*", "", raw), issues, is_list=True
            )
            continue

        if not paragraph:
            paragraph_start = number
        paragraph.append(raw.strip())

    flush_paragraph()

    if in_fence:
        issues.append(Issue(path, fence_start, "代码围栏未闭合"))

    for block in fence_blocks:
        issues.extend(check_tree_block(path, block))

    for block in mermaid_blocks:
        issues.extend(check_mermaid_block(path, block))
        issues.extend(check_mermaid_wrapper(path, lines, block))

    for block in html_blocks:
        issues.extend(check_html_figure_block(path, block))

    fenced_lines: set[int] = set()
    inside_fence = False
    for number, raw in enumerate(lines, start=1):
        if FENCE_RE.match(raw):
            fenced_lines.add(number)
            inside_fence = not inside_fence
        elif inside_fence:
            fenced_lines.add(number)

    blob_links: dict[str, list[int]] = {}
    first_heading = next(
        (n for n, raw in enumerate(lines, start=1) if HEADING_RE.match(raw)),
        len(lines) + 1,
    )
    # 章首（第一个标题之前）只放自然段与列表：Callout 会把导语压成旁注，开篇套话则先讲
    # 章节安排、不讲读者要做的事。着陆页是目录页，不受这条限制。
    if path.name != "index.qmd":
        opening_line = 0
        opening_text = ""
        for index, raw in enumerate(lines, start=1):
            if index >= first_heading:
                break
            if index in fenced_lines:
                continue
            if CALLOUT_OPEN_RE.match(raw):
                issues.append(Issue(
                    path, index,
                    "章首出现 Callout；第一个标题之前的导语只用自然段与列表（steps/02-structure.md）",
                ))
                continue
            if not opening_text and raw.strip() and not raw.lstrip().startswith(("|", ">", "-", "*", "+")):
                opening_line = index
                opening_text = raw.strip()
        if opening_text and OPENING_CLICHE_RE.match(opening_text):
            issues.append(Issue(
                path, opening_line,
                "引言以「本章将…／下面介绍…」开场；第一句写读者要做成的事（steps/02-structure.md）",
            ))
    intro_blob_targets: set[str] = set()
    for index, raw in enumerate(lines, start=1):
        if index >= first_heading or index in fenced_lines:
            continue
        for match in LINK_RE.finditer(raw):
            target = match.group(1).strip()
            if target.startswith("https://github.com/") and "/blob/" in target:
                intro_blob_targets.add(target)

    for index, raw in enumerate(lines, start=1):
        if index in fenced_lines:
            continue
        for match in LINK_RE.finditer(raw):
            target = match.group(1).strip()
            if target.startswith(("http://", "https://", "mailto:", "#", "data:", "//")):
                if target.startswith("https://github.com/") and "/blob/" in target:
                    blob_links.setdefault(target, []).append(index)
                continue
            clean = target.split("#", 1)[0].split("?", 1)[0]
            if not clean or "<" in clean:
                continue
            if not (path.parent / clean).exists() and not (root / clean).exists():
                issues.append(Issue(path, index, f"本地链接不可达：{target}"))

    for target, numbers in blob_links.items():
        if len(numbers) > 1 and target not in intro_blob_targets:
            issues.append(Issue(
                path, numbers[1],
                f"同章重复文件链接：{target}（首次在第 {numbers[0]} 行）；"
                "只有章引言挂过的本章主源文件可重复，其他仓库路径每章至多一条",
            ))

    # 章引言（第一个标题之前）只留承接上一章的一个章节链接；其余章节引用下沉到正文。
    # 着陆页 index.qmd 是目录页，不受这条预算约束。
    if path.name != "index.qmd":
        intro_links: list[tuple[int, str]] = []
        for index, raw in enumerate(lines, start=1):
            if index >= first_heading or index in fenced_lines:
                continue
            for match in LINK_RE.finditer(raw):
                target = match.group(1).strip()
                if target.endswith(".qmd"):
                    intro_links.append((index, target))
        if len(intro_links) > 1:
            issues.append(Issue(
                path, intro_links[1][0],
                f"章引言有 {len(intro_links)} 个章节链接（{'、'.join(t for _, t in intro_links)}）；"
                "只留承接上一章的一个，其余移到正文首次用到处",
            ))

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

    later_names = project.get("later_chapter_names", {}).get(rel, [])
    if later_names:
        for index, raw in enumerate(lines, start=1):
            if index in fenced_lines or raw.lstrip().startswith(("```", "    ")):
                continue
            for name in later_names:
                if name and re.search(rf"(?<![A-Za-z0-9_]){re.escape(name)}(?![A-Za-z0-9_])", raw):
                    issues.append(Issue(
                        path, index,
                        f"对象章点到后章类型「{name}」；删掉这句，留给后章",
                    ))

    for index, raw in enumerate(lines, start=1):
        if raw.lstrip().startswith(("```", "    ")):
            continue
        match = QA_PROSE_RE.search(raw)
        if match:
            issues.append(Issue(
                path, index,
                f"问答式讲解「{match.group(0)}」；改成返回值、判断结果或直接陈述",
            ))
        match = CODE_META_RE.search(raw)
        if match:
            issues.append(Issue(
                path, index,
                f"代码字面复述「{match.group(0)}」；改成围栏没给出的行为或约束",
            ))
        match = COINED_RELATION_RE.search(raw)
        if match:
            issues.append(Issue(
                path, index,
                f"自造关系词「{match.group(0)}」；用组成、调用、依赖、继承等通行词",
            ))
        match = CARRIER_RE.search(raw)
        if match:
            issues.append(Issue(
                path, index,
                "类型或字段不用「承载」描述；改用表示、保存、记录或对应",
            ))
        match = NEXT_SECTION_RE.search(raw)
        if match:
            issues.append(Issue(
                path, index,
                f"小节导航「{match.group(0)}」；删除后用新节首句承接，章末预告保留",
            ))
        match = LADDER_RE.search(raw)
        if match:
            issues.append(Issue(
                path, index,
                f"拉链句「{match.group(0)}」；拆句或改成一项一行",
            ))

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
    parser.add_argument("--paths", nargs="+", help="只检查这些 qmd 路径（相对 --root）")
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
    try:
        chapters = parse_chapters(quarto_yml)
    except (OSError, UnicodeDecodeError) as exc:
        print(f"失败  读取目录表失败: {exc}")
        return 1
    files = collect_chapter_files(root, chapters)
    issues: list[Issue] = []
    if args.paths:
        requested: list[Path] = []
        for raw in args.paths:
            candidate = (root / raw).resolve()
            if root not in candidate.parents and candidate != root:
                issues.append(Issue(quarto_yml, 1, f"--paths 落在书根之外：{raw}"))
            elif not candidate.is_file():
                issues.append(Issue(candidate, 1, f"--paths 指定的文件不存在：{raw}"))
            else:
                requested.append(candidate)
        files = requested
    if not files:
        print(f"失败  {root} 下没有 .qmd 章节（确认 --root 指向书根目录）")
        return 1

    try:
        has_project, project = load_project(root)
    except (OSError, UnicodeDecodeError, json.JSONDecodeError) as exc:
        print(f"失败  读取项目规则失败: {exc}")
        return 1

    missing = [rel for rel in chapters if not (root / rel).is_file()]
    issues.extend([
        Issue(quarto_yml, 1, f"目录中的章节不存在：{rel}") for rel in missing
    ])

    if args.strict:
        extras = [item for item in collect_all_qmd(root) if item not in files]
        for item in extras:
            issues.append(Issue(item, 1, "未列入 _quarto.yml（strict 模式）"))
        files.extend(extras)

    for path in files:
        try:
            issues.extend(check_file(path, root, project, chapters))
        except (OSError, UnicodeDecodeError) as exc:
            issues.append(Issue(path, 1, f"无法按 UTF-8 读取：{exc}"))

    if not args.strict:
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
