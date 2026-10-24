#!/usr/bin/env python3
"""校验关键设计令牌、字体资产与可用的浏览器布局指标。

静态阶段用单次字面匹配（子串查找）与计数。压缩后的大 CSS 不做宽模式扫描。
Node、Playwright 与 Edge 可用时，measuring-pages.mjs 验证真实几何。工具不可用时
输出明确 SKIP。静态断言不冒充布局验收。
规范出处：本技能 `references/theme-system.md`。

用法：python checking-layout.py [--root .] [--book-dir _book] [--browser]
退出码：0 = 关键令牌全部存在，1 = 有缺失。
"""

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
from html.parser import HTMLParser
from pathlib import Path

THEME_DIR = Path(__file__).resolve().parents[1]
FONT_DIR = THEME_DIR / "assets" / "theme" / "assets" / "fonts"
FONTS_CSS = THEME_DIR / "assets" / "theme" / "css" / "fonts.css"
SHARED_TOKENS_CSS = THEME_DIR / "assets" / "theme" / "css" / "tokens.css"
PALETTE_ROOT = THEME_DIR / "assets" / "theme" / "palettes"
MEASURE_SCRIPT = Path(__file__).resolve().parent / "measuring-pages.mjs"
ROOT = Path.cwd()
QUARTO_YML = ROOT / "_quarto.yml"
FONT_FAMILIES = ("LXGW Bright Medium", "LXGW Bright Code")
EXPECTED_FONT_FACES = {
    "LXGW Bright Medium": 1,
    "LXGW Bright Code": 1,
}
# 正文与代码各一份常用汉字包。限额里留了少量缓存与字重余量。
FONT_PAGE_BYTES_LIMIT = 1_600_000
FONT_PAGE_FACES_LIMIT = 5
# 子进程超时（秒）：查改动集用短超时。浏览器量测留足整本页面矩阵的时间。
GIT_TIMEOUT = 60
MEASURE_TIMEOUT = 600


def color_alpha(value):
    """返回 CSS 颜色的 alpha 通道。无法解析为 rgb/rgba 时按不透明处理。"""
    match = re.match(r"rgba?\(([^)]*)\)", (value or "").strip())
    if not match:
        return 1.0
    parts = [part.strip() for part in match.group(1).split(",")]
    return float(parts[3]) if len(parts) == 4 else 1.0


def active_palette_name(quarto_text=""):
    """从 _quarto.yml 的 css 列表解析活跃 palette 名。"""
    text = quarto_text
    if not text and QUARTO_YML.is_file():
        text = QUARTO_YML.read_text(encoding="utf-8")
    match = re.search(r"palettes/([A-Za-z0-9_-]+)/tokens\.css", text)
    return match.group(1) if match else None


# 共享结构令牌与组件规则（与色板无关）
SHARED_CHECKS = [
    ("body line-height 1.75", "line-height: 1.75"),
    ("content width", "--content-width: 840px"),
    ("code font 15px", "--code-font-size: 0.9375rem"),
    ("code line-height 1.7", "--code-line-height: 1.7"),
    ("code title padding token", "--code-title-padding"),
    ("ui font stack", '--ui-font: "LXGW Bright Medium"'),
    ("cjk font fallback", '"LXGW Bright Medium"'),
    ("code font stack", '--mono-font: "LXGW Bright Code"'),
    ("bright code family", '"LXGW Bright Code"'),
    ("code followup gap", "--code-followup-gap: 0.9rem"),
    ("list code followup spacing", "margin-top: var(--code-followup-gap)"),
    ("list code with filename selector", "li > :is(.code-copy-outer-scaffold, .code-with-filename"),
    ("readable body font", "font-size: 1rem"),
    ("body block rhythm", "margin-top: 1.5rem"),
    ("paragraphs follow the body column", "max-width: 100%"),
    ("answer disclosure container", "details.answer-disclosure"),
    ("list marker token color", "li::marker"),
    ("answer disclosure summary", "details.answer-disclosure > summary"),
    ("feature-grid max two columns", "repeat(2, minmax(0, 1fr))"),
    ("feature-grid single card full row", ":has(> .landing-card:only-child)"),
]

# 语义令牌名必须存在（色值由活跃 palette 提供）
TOKEN_NAME_CHECKS = [
    ("code title background", "--code-title-bg"),
    ("code title foreground", "--code-title-fg"),
    ("accent dot token", "--dot-accent"),
    ("body emphasis token", "--emphasis-color"),
    ("callout tip (best-practice semantics)", "--callout-tip-border"),
    ("callout warning (key-insight semantics)", "--callout-warning-border"),
    ("callout important (deep-dive semantics)", "--callout-important-border"),
]

# palettes/flexoki 色值期望（编译默认）。换 pack 时改对应表。
PALETTE_VALUE_CHECKS = {
    "flexoki": [
        ("light body token #100F0F", "--body-color: #100F0F"),
        ("light emphasis #100F0F", "--emphasis-color: #100F0F"),
        ("light line numbers #575653", "--line-num-color: #575653"),
        ("light Flexoki link ink #100F0F", "--link-color: #100F0F"),
        ("light navbar page-bg token", "--navbar-bg: #FFFCF0"),
        ("dark navbar page-bg token", "--navbar-bg: #100F0F"),
        ("light code background", "--code-bg: #F2F0E5"),
        ("dark code background", "--code-bg: #1C1B1A"),
        ("dark page #100F0F", "#100F0F"),
        ("dark body #CECDC3", "#CECDC3"),
        ("dark secondary #9F9D96", "#9F9D96"),
        ("dark link ink #CECDC3", "--link-color: #CECDC3"),
        ("callout note border light", "--callout-note-border: #6F6E69"),
        ("callout warning border light", "--callout-warning-border: #BC5215"),
        ("light highlight comment #575653", "#575653"),
        ("light highlight keyword #66800b", "#66800b"),
        ("dark highlight comment #878580", "#878580"),
        ("dark highlight keyword #879a39", "#879a39"),
    ],
}

# Solarized 是运行时覆盖层：令牌必须挂在 html[data-palette="solarized"] 下。
SOLARIZED_TOKEN_CHECKS = [
    ("solarized token selector", 'html[data-palette="solarized"] body'),
    ("solarized light page #FDF6E3", "--page-bg: #FDF6E3"),
    ("solarized light body #526C74", "--body-color: #526C74"),
    ("solarized light link rebase #586E75", "--link-color: #586E75"),
    ("solarized light code text #526C74", "--code-fg: #526C74"),
    ("solarized light code #EEE8D5", "--code-bg: #EEE8D5"),
    ("solarized dark page #002B36", "--page-bg: #002B36"),
    ("solarized dark body #839496", "--body-color: #839496"),
    ("solarized dark link rebase #93A1A1", "--link-color: #93A1A1"),
    ("solarized link hover action", "--link-hover-color: var(--action-color)"),
    ("solarized dark code #073642", "--code-bg: #073642"),
]

SOLARIZED_SYNTAX_CHECKS = [
    ("solarized syntax selector", 'html[data-palette="solarized"] code span.kw'),
    ("solarized keyword #859900", "#859900"),
    ("solarized light comment #556C73", "#556C73"),
    ("solarized light syntax blue #1B6EA3", "#1B6EA3"),
    ("solarized dark comment #93A1A1", "#93A1A1"),
    ("solarized dark syntax blue #51A0D5", "#51A0D5"),
]

# 山光是运行时覆盖层，四时辰都挂在 html[data-palette="hill-light"][data-mode] 下。
HILL_LIGHT_TOKEN_CHECKS = [
    ("hill-light dawn selector", 'html[data-palette="hill-light"][data-mode="dawn"] body'),
    ("hill-light noon selector", 'html[data-palette="hill-light"][data-mode="noon"] body'),
    ("hill-light dusk selector", 'html[data-palette="hill-light"][data-mode="dusk"] body'),
    ("hill-light night selector", 'html[data-palette="hill-light"][data-mode="night"] body'),
    ("hill-light night native dark controls", "color-scheme: dark;"),
    ("hill-light night print fallback", "@media print"),
]

HILL_LIGHT_SYNTAX_CHECKS = [
    ("hill-light syntax base rule", '[data-mode="dawn"] code span:not([class])'),
    ("hill-light dawn keyword", 'html[data-palette="hill-light"][data-mode="dawn"] code span.kw'),
    ("hill-light noon keyword", 'html[data-palette="hill-light"][data-mode="noon"] code span.kw'),
    ("hill-light dusk keyword", 'html[data-palette="hill-light"][data-mode="dusk"] code span.kw'),
    ("hill-light night keyword", 'html[data-palette="hill-light"][data-mode="night"] code span.kw'),
    ("hill-light night comment", 'html[data-palette="hill-light"][data-mode="night"] code span.co'),
]


def lu(hex_color: str) -> float:
    """WCAG 相对亮度。"""
    h = hex_color.lstrip("#")
    r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
    lin = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in (r, g, b)]
    return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]


def check_hill_light_modes(tokens_text: str) -> int:
    """山光四时辰：前三个时辰浅纸、夜月暗纸；打印时夜月回落浅纸。"""
    fails = 0
    values = re.findall(r"--page-bg: (#[0-9A-Fa-f]{6})", tokens_text)
    if len(values) < 5:
        print(f"  MISS hill-light page-bg count (found {len(values)}, want >= 5)")
        return 1
    names = ("dawn", "noon", "dusk")
    for name, v in zip(names, values[:3]):
        ok = lu(v) > 0.55
        print(f"  {'OK  ' if ok else 'MISS'} hill-light {name} paper is light  ({v} L={lu(v):.2f})")
        fails += 0 if ok else 1
    night_ok = lu(values[3]) < 0.15
    print(f"  {'OK  ' if night_ok else 'MISS'} hill-light night is dark  ({values[3]} L={lu(values[3]):.2f})")
    fails += 0 if night_ok else 1
    print_ok = abs(lu(values[4]) - lu(values[0])) < 0.02
    print(f"  {'OK  ' if print_ok else 'MISS'} hill-light night print falls back to dawn paper  ({values[4]})")
    fails += 0 if print_ok else 1
    return fails


# 兼容旧名：测试与外部引用仍可能导入 CHECKS。
CHECKS = SHARED_CHECKS + TOKEN_NAME_CHECKS + PALETTE_VALUE_CHECKS["flexoki"]

CALLOUT_CHECKS = [
    ("callout body font 16px", "font-size: 1rem;"),
    ("callout title font 13px", "font-size: 0.8125rem;"),
    ("callout padding", "padding: 0.1rem 0 0.1rem 1.1rem;"),
    ("callout header gap", "margin: 0 0 0.35rem;"),
]

FORBIDDEN_FONT_REFERENCES = [
    ("Fixel reference", "Fixel"),
    ("LXGW WenKai Screen reference", "LXGW WenKai Screen"),
    ("Inter reference", "Inter"),
    ("Noto Sans Mono CJK SC reference", "Noto Sans Mono CJK SC"),
    ("JetBrains Mono reference", "JetBrains Mono"),
    ("local font fallback", "local("),
]


class VisibleTextParser(HTMLParser):
    """Extract visible text from rendered pages without script/style content."""

    def __init__(self, code_only=False):
        super().__init__(convert_charrefs=True)
        self.hidden_depth = 0
        self.pre_depth = 0
        self.code_depth = 0
        self.code_only = code_only
        self.chunks = []

    def handle_starttag(self, tag, attrs):
        if tag in {"script", "style"}:
            self.hidden_depth += 1
        if tag == "pre":
            self.pre_depth += 1
        if tag == "code":
            self.code_depth += 1

    def handle_endtag(self, tag):
        if tag in {"script", "style"} and self.hidden_depth:
            self.hidden_depth -= 1
        if tag == "pre" and self.pre_depth:
            self.pre_depth -= 1
        if tag == "code" and self.code_depth:
            self.code_depth -= 1

    def handle_data(self, data):
        in_code = bool(self.pre_depth or self.code_depth)
        if not self.hidden_depth and (not self.code_only or in_code):
            self.chunks.append(data)


def parse_unicode_ranges(css_text, family):
    """Return the unicode ranges declared for one self-hosted font family."""
    ranges = []
    for block in re.findall(r"@font-face\s*\{([^}]*)\}", css_text, re.S):
        if not re.search(
            rf'font-family\s*:\s*["\']{re.escape(family)}["\']', block
        ):
            continue
        match = re.search(r"unicode-range:([^;}]+)", block)
        if not match:
            continue
        for token in match.group(1).split(","):
            token = token.strip()
            if not token.startswith("U+"):
                continue
            value = token[2:]
            if "-" in value:
                start, end = value.split("-", 1)
                ranges.append((int(start, 16), int(end, 16)))
            else:
                point = int(value, 16)
                ranges.append((point, point))
    return ranges


def font_face_entries(css_text):
    """Parse family and URL pairs from @font-face blocks."""
    entries = []
    for block in re.findall(r"@font-face\s*\{([^}]*)\}", css_text, re.S):
        family = re.search(r"font-family\s*:\s*[\"']([^\"']+)[\"']", block)
        url = re.search(r"url\(\s*[\"']?([^\"')]+)", block)
        if family and url:
            entries.append((family.group(1), url.group(1)))
    return entries


def check_font_assets(css_text):
    """Return missing, duplicate, orphan, and invalid-font diagnostics."""
    entries = font_face_entries(css_text)
    problems = []
    referenced = {}
    for family, url in entries:
        target = (FONTS_CSS.parent / url).resolve()
        referenced.setdefault(target, []).append(family)
        if not target.is_file():
            problems.append(f"missing font asset: {family} -> {target.name}")
            continue
        if target.read_bytes()[:4] != b"wOF2":
            problems.append(f"invalid WOFF2 signature: {target.name}")

    for family, expected in EXPECTED_FONT_FACES.items():
        actual = sum(1 for item, _url in entries if item == family)
        if actual != expected:
            problems.append(f"{family} font faces={actual}, expected={expected}")

    for target, families in referenced.items():
        if len(families) > 1:
            problems.append(f"font URL reused {len(families)} times: {target.name}")

    referenced_paths = set(referenced)
    actual_paths = set(FONT_DIR.glob("*.woff2"))
    for path in sorted(actual_paths - referenced_paths):
        problems.append(f"orphan font asset: {path.name}")
    if not actual_paths:
        problems.append("no WOFF2 font assets found")
    return problems


def check_font_partition(css_text):
    """Return overlap problems in explicitly partitioned CJK font faces."""
    problems = []
    for family in FONT_FAMILIES:
        declared = parse_unicode_ranges(css_text, family)
        if not declared:
            continue
        covered = set()
        overlaps = set()
        for start, end in declared:
            points = set(range(start, end + 1))
            overlaps.update(covered & points)
            covered.update(points)
        if overlaps:
            sample = ", ".join(f"U+{point:X}" for point in sorted(overlaps)[:8])
            problems.append(
                f"{family} unicode-range overlaps: {len(overlaps)} ({sample})"
            )
    return problems


def resolve_node():
    candidates = [os.environ.get("BOARD_GAMES_NODE"), shutil.which("node")]
    cache = Path.home() / ".cache" / "codex-runtimes"
    if cache.is_dir():
        candidates.extend(
            str(path)
            for path in sorted(cache.glob("*/dependencies/node/bin/node*"))
        )
    for candidate in candidates:
        if candidate and Path(candidate).is_file():
            return str(candidate)
    return None


def resolve_playwright_root():
    candidates = [os.environ.get("BOARD_GAMES_NODE_PATH"), os.environ.get("NODE_PATH")]
    cache = Path.home() / ".cache" / "codex-runtimes"
    if cache.is_dir():
        candidates.extend(
            str(path)
            for path in sorted(cache.glob("*/dependencies/node/node_modules"))
        )
    for candidate in candidates:
        if candidate and (Path(candidate) / "playwright" / "index.js").is_file():
            return str(candidate)
    return None


def full_layout_required():
    """主题或 Book 配置变化时跑全量页面矩阵。普通内容改动只跑代表页。"""
    result = subprocess.run(
        [
            "git",
            "diff",
            "--quiet",
            "HEAD",
            "--",
            "theme",
            ".agents/skills/designing-theme/assets/theme",
            "_quarto.yml",
        ],
        cwd=str(ROOT),
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        check=False,
        timeout=GIT_TIMEOUT,
    )
    return result.returncode == 1


def browser_layout(book_dir, verbose):
    """Measure rendered pages and return (problems, skipped_reason, info)."""
    node = resolve_node()
    playwright_root = resolve_playwright_root()
    if not node or not playwright_root or not MEASURE_SCRIPT.is_file():
        return [], (
            "Node/Playwright/Edge 运行时不可用"
            f" (node={node or '无'}, NODE_PATH={playwright_root or '无'})"
        ), {}

    # 测量目标是渲染产物：书目录里还可能有主题模板（theme/includes/*.html），
    # 它们没有 #quarto-document-content，混进采样会误报。优先用 _book。
    render_dir = book_dir / "_book" if (book_dir / "_book").is_dir() else book_dir
    shots_dir = ROOT / "temp" / "theme-regression"
    out_file = shots_dir / "measure.json"
    shots_dir.mkdir(parents=True, exist_ok=True)
    env = dict(os.environ, NODE_PATH=playwright_root, PYTHONIOENCODING="utf-8")
    command = [
        node,
        str(MEASURE_SCRIPT),
        "--book-dir",
        str(render_dir),
        "--out",
        str(out_file),
        "--shots-dir",
        str(shots_dir),
    ]
    if full_layout_required():
        command.append("--all-pages")
    try:
        proc = subprocess.run(
            command,
            cwd=str(ROOT),
            env=env,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            timeout=MEASURE_TIMEOUT,
        )
    except subprocess.TimeoutExpired as exc:
        output = (exc.output or b"").decode("utf-8", errors="replace")
        return [f"browser measurement timed out after {MEASURE_TIMEOUT}s"], output.strip(), {}
    output = proc.stdout.decode("utf-8", errors="replace")
    if proc.returncode == 2:
        return [], output.strip(), {}
    if proc.returncode != 0 or not out_file.is_file():
        return [f"browser measurement failed (exit={proc.returncode})"], output.strip(), {}

    metrics = json.loads(out_file.read_text(encoding="utf-8"))
    info = {
        "mode": metrics.get("mode", "full"),
        "pages": len(metrics.get("selectedPages", metrics.get("pages", []))),
    }
    problems = []
    font_assets_by_name = {}
    for _family, url in font_face_entries(FONTS_CSS.read_text(encoding="utf-8")):
        target = (FONTS_CSS.parent / url).resolve()
        font_assets_by_name[target.name] = target.stat().st_size if target.is_file() else 0
    width_floor = {1280: 640, 768: 500, 390: 320, 360: 300}
    for width_text, pages in metrics["viewports"].items():
        width = int(width_text)
        for key, data in pages.items():
            scheme, page_id = key.split(":", 1)
            label = f"{scheme}:{page_id}@{width}"
            if data.get("error"):
                problems.append(f"{label}: {data['error']}")
                continue
            requested_fonts = data.get("requestedFonts", [])
            # MathJax 自带 CHTML 字体（mjx-*）：数学公式必须用它才有 TeX 字形，
            # 不算「主题外字体漂移」，也不计入本站字体预算。
            requested_fonts = [name for name in requested_fonts if not name.startswith("mjx-")]
            unknown_fonts = sorted(set(requested_fonts) - set(font_assets_by_name))
            if unknown_fonts:
                problems.append(f"{label}: unknown font requests {unknown_fonts}")
            loaded_fonts = [
                (filename, font_assets_by_name[filename])
                for filename in requested_fonts
                if filename in font_assets_by_name
            ]
            loaded_font_bytes = sum(size for _name, size in loaded_fonts)
            if len(loaded_fonts) > FONT_PAGE_FACES_LIMIT:
                problems.append(
                    f"{label}: 字体请求 {len(loaded_fonts)} > {FONT_PAGE_FACES_LIMIT}"
                )
            if loaded_font_bytes > FONT_PAGE_BYTES_LIMIT:
                problems.append(
                    f"{label}: 字体字节 {loaded_font_bytes} > {FONT_PAGE_BYTES_LIMIT}"
                )
            data["loadedFontCount"] = len(loaded_fonts)
            data["loadedFontBytes"] = loaded_font_bytes
            if data["paragraphWidth"] < width_floor[width]:
                problems.append(
                    f"{label}: 正文段宽 {data['paragraphWidth']}px < {width_floor[width]}px"
                )
            if width <= 768:
                hidden_copy = [
                    opacity
                    for opacity in data.get("copyButtonOpacities", [])
                    if opacity < 0.99
                ]
                if hidden_copy:
                    problems.append(
                        f"{label}: 触屏复制按钮不可见 opacity={hidden_copy}"
                    )
            overlay = data.get("sidebarOverlay")
            if overlay and overlay.get("overlayState"):
                alpha = color_alpha(overlay.get("background"))
                if alpha < 0.99:
                    problems.append(
                        f"{label}: 窄屏左栏浮层底色 alpha={alpha}，正文会透上来，需不透明"
                    )
            # 栏间分隔只留顶栏下那一条通栏横线：桌面左栏不得有右边框，
            # 顶栏底边恰好 1px 且次级导航不再自己画一条，正文 h2 不带伪元素短线。
            # 依据见 references/theme-system.md「定尺度」与「组件约定·章节线」。
            if overlay and width > 991.98 and overlay.get("borderRightWidth", 0) != 0:
                problems.append(
                    f"{label}: 桌面左栏 border-right="
                    f"{overlay['borderRightWidth']}px，应为 0（栏间不画竖线）"
                )
            header_rule = data.get("headerRule") or {}
            if header_rule:
                if abs(header_rule.get("borderBottomWidth", 0) - 1) > 0.01:
                    problems.append(
                        f"{label}: 顶栏底边 "
                        f"{header_rule.get('borderBottomWidth')}px，应为 1px 通栏发丝线"
                    )
                if header_rule.get("secondaryBorderBottomWidth", 0):
                    problems.append(
                        f"{label}: 次级导航底边 "
                        f"{header_rule['secondaryBorderBottomWidth']}px，会和顶栏底边叠成双线"
                    )
            h2_after = data.get("h2Rules") or []
            if h2_after:
                first = h2_after[0]
                problems.append(
                    f"{label}: h2「{first['text']}」仍有装饰短线 "
                    f"{first['afterWidth']}×{first['afterHeight']}，章节不画线"
                )
            # 侧栏折叠层级：桌面视口下只有当前页所在的分组默认展开。
            # 其余分组折叠。依据见本仓 designing-theme 技能的主题说明。
            sections = data.get("sidebarSections")
            if width >= 1280 and sections:
                expanded = [item for item in sections if item["expanded"]]
                expected = 1 if any(item["containsActive"] for item in sections) else 0
                if len(expanded) != expected:
                    problems.append(
                        f"{label}: 侧栏展开分组 {len(expanded)} 个，期望 {expected} 个"
                        f"（{[(item['text'], item['expanded']) for item in sections]}）"
                    )
                elif expanded and not expanded[0]["containsActive"]:
                    problems.append(
                        f"{label}: 侧栏展开的不是当前页所在分组 "
                        f"（展开={expanded[0]['text']}）"
                    )
            # Callout 按 theme-system.md「组件约定」是薄条：2px 左色条、无填充、无圆角，
            # 标题 13px、正文 16px，上下内边距各 0.1rem（根字号 16px 时 1.6px）。
            # 不跟正文 17px 比——Callout 是附注层，比正文低一档是有意为之。
            for index, callout in enumerate(data.get("callouts", []), 1):
                if abs(callout["bodyFontSize"] - 16) > 0.01:
                    problems.append(
                        f"{label}: Callout#{index} 正文 {callout['bodyFontSize']}px != 16px"
                    )
                if abs(callout["titleFontSize"] - 13) > 0.01:
                    problems.append(
                        f"{label}: Callout#{index} 标题 {callout['titleFontSize']}px != 13px"
                    )
                if (
                    abs(callout["paddingTop"] - 1.6) > 0.05
                    or abs(callout["paddingBottom"] - 1.6) > 0.05
                ):
                    problems.append(
                        f"{label}: Callout#{index} 内边距 "
                        f"{callout['paddingTop']}/{callout['paddingBottom']}px != 1.6/1.6px"
                    )
                if callout["width"] + 1 < data["paragraphWidth"]:
                    problems.append(
                        f"{label}: Callout#{index} 宽 {callout['width']}px "
                        f"< 正文列 {data['paragraphWidth']}px"
                    )
            if any(not item["scrolls"] for item in data["overflow"]):
                first = next(item for item in data["overflow"] if not item["scrolls"])
                problems.append(
                    f"{label}: 横向溢出 {first['tag']}.{first['classes']} "
                    f"{first['scrollWidth']}>{first['clientWidth']}"
                )
            wrapped = [item for item in data["tocItems"] if item["height"] > 46]
            if wrapped:
                problems.append(
                    f"{label}: 目录折行 {len(wrapped)} 项，最高 {max(item['height'] for item in wrapped)}px"
                )
            for block in data["languageBlocks"]:
                if block["outerBorder"] != 1 or block["innerBorder"] != 0:
                    problems.append(
                        f"{label}: 代码边框 outer={block['outerBorder']} inner={block['innerBorder']}"
                    )
                    break
            wraps = {
                item["whiteSpace"]
                for item in data["languageBlocks"] + data["barePres"]
                if item["whiteSpace"]
            }
            if wraps - {"pre"}:
                problems.append(f"{label}: 代码 white-space={sorted(wraps)}")
    if verbose:
        for width, pages in metrics["viewports"].items():
            for key, data in pages.items():
                print(
                    f"      {key}@{width} 正文宽={data['paragraphWidth']} "
                    f"带/盒={data['textBandCount']}/{data['boxCount']} "
                    f"正文号={data.get('paragraphFontSize', 0):g} "
                    f"Callout={len(data.get('callouts', []))} "
                    f"字体={data.get('loadedFontCount', 0)}/"
                    f"{data.get('loadedFontBytes', 0)}B "
                    f"复制钮={data.get('copyButtonOpacities', [])} "
                    f"溢出={len(data['overflow'])} "
                    f"侧栏展开="
                    f"{[item['text'] for item in data.get('sidebarSections') or [] if item['expanded']]}"
                )
    return problems, None, info


# 自托管字面必须覆盖的码位：汉字与中文标点之外，还包括西文标点、数学/箭头的
# 「书中符号」。漏了它们不会被发现，却会静默回落到系统字体——同一个「+」会按
# 系统 CJK 字体的中线画在 0.5em 高度，紧挨 0.23em 的拉丁基线，肉眼就是「++ 偏上」。
# 表情符号（≥U+1F000 与 U+2600–U+27BF 的装饰符）按设计就该由系统 emoji 字体绘制，不在断言内。
GLYPH_RANGES = (
    (0x00A0, 0x024F),  # Latin-1 补充 + Latin Extended-A
    (0x2000, 0x206F),  # 通用标点（引号、破折号、省略号、间隔号）
    (0x20A0, 0x20BF),  # 货币符号
    (0x2100, 0x214F),  # 字母式符号（℃ ™ №）
    (0x2190, 0x21FF),  # 箭头
    (0x2200, 0x22FF),  # 数学运算符
    (0x2500, 0x257F),  # 制表符（终端输出里的 ├ ─ └ │）
    (0x25A0, 0x25FF),  # 几何图形（■ □ ▲）
    (0x2E80, 0x2EFF),  # CJK 部首补充
    (0x3000, 0x303F),  # CJK 标点
    (0x4E00, 0x9FFF),  # 汉字
    (0xF900, 0xFAFF),  # CJK 兼容汉字
    (0xFE30, 0xFE4F),  # CJK 兼容形式
    (0xFF00, 0xFFEF),  # 全角形式（＋ － ＝ （））
)


def needs_glyph_coverage(codepoint):
    """Assert self-hosted coverage for CJK text, CJK punctuation and book symbols."""
    return any(start <= codepoint <= end for start, end in GLYPH_RANGES)


def read_font_cmap(path):
    """用 fontTools 读取字体文件的 cmap 码点集合。不可用时返回 None。"""
    try:
        from fontTools.ttLib import TTFont
    except ImportError:
        return None
    try:
        font = TTFont(str(path), fontNumber=0, lazy=True)
        cmap = font.getBestCmap()
        font.close()
    except Exception:
        return None
    return set(cmap)


def qmd_font_chunks(path):
    """Split a qmd into prose text and code text for font coverage checks."""
    text = path.read_text(encoding="utf-8", errors="ignore")
    text = re.sub(r"\A---\s*\n.*?\n---\s*\n", "", text, count=1, flags=re.S)
    text = re.sub(r"<!--.*?-->", "", text, flags=re.S)
    prose_lines = []
    prose_chunks = []
    code_chunks = []
    fence = None
    fence_is_mermaid = False
    buffer = []
    for line in text.splitlines():
        if fence is not None:
            if line.strip().startswith(fence):
                chunk = "\n".join(buffer)
                if fence_is_mermaid:
                    prose_chunks.append(chunk)
                else:
                    code_chunks.append(chunk)
                fence = None
                buffer = []
            else:
                buffer.append(line)
            continue
        match = re.match(r"^\s*(`{3,}|~{3,})(.*)$", line)
        if match:
            fence = match.group(1)
            fence_is_mermaid = "mermaid" in match.group(2)
            buffer = []
        else:
            prose_lines.append(line)
    if fence is not None:
        chunk = "\n".join(buffer)
        (prose_chunks if fence_is_mermaid else code_chunks).append(chunk)
    prose = "\n".join(prose_lines)
    prose = re.sub(r"\]\([^)]*\)", "]", prose)
    prose = re.sub(r"^\s*\[[^\]]+\]:\s*\S+.*$", "", prose, flags=re.M)
    prose = re.sub(r"https?://\S+", "", prose)
    prose = re.sub(r"<[^>]+>", "", prose)
    inline_code = re.findall(r"`([^`\n]+)`", prose)
    prose = re.sub(r"`[^`\n]+`", "", prose)
    return [prose, *prose_chunks], [*inline_code, *code_chunks]


def check_font_coverage(book_dir):
    """Check Chinese coverage for prose and code in qmd sources separately.

    声明了 unicode-range 的 face 按声明区间判定。未声明时用 fontTools
    读取字体文件的真实 cmap 判定。起因：子集字符表漏字，正文落到系统宋体。
    """
    css_text = FONTS_CSS.read_text(encoding="utf-8")
    files_by_family = {}
    for family, url in font_face_entries(css_text):
        target = (FONTS_CSS.parent / url).resolve()
        if target.is_file():
            files_by_family.setdefault(family, []).append(target)
    coverage = {}
    for family in FONT_FAMILIES:
        declared = parse_unicode_ranges(css_text, family)
        if declared:
            points = {
                point
                for start, end in declared
                for point in range(start, end + 1)
            }
        else:
            points = set()
            for path in files_by_family.get(family, []):
                cmap = read_font_cmap(path)
                if cmap is not None:
                    points.update(cmap)
        coverage[family] = points
    missing = {family: set() for family in FONT_FAMILIES}
    if not any(coverage.values()):
        return coverage, missing
    for qmd_path in sorted(book_dir.rglob("*.qmd")):
        prose_chunks, code_chunks = qmd_font_chunks(qmd_path)
        for family, chunks in (
            ("LXGW Bright Medium", prose_chunks),
            ("LXGW Bright Code", code_chunks),
        ):
            for chunk in chunks:
                for char in chunk:
                    codepoint = ord(char)
                    if (
                        needs_glyph_coverage(codepoint)
                        and codepoint not in coverage[family]
                    ):
                        missing[family].add(char)
    return coverage, missing


def _parse_hex_color(value):
    match = re.fullmatch(r"#([0-9a-fA-F]{6})", value.strip())
    if not match:
        return None
    digits = match.group(1)
    return tuple(int(digits[i : i + 2], 16) for i in (0, 2, 4))


def _relative_luminance(rgb):
    channels = []
    for value in rgb:
        v = value / 255
        channels.append(v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4)
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]


def _contrast_ratio(fg, bg):
    hi, lo = sorted((_relative_luminance(fg), _relative_luminance(bg)), reverse=True)
    return (hi + 0.05) / (lo + 0.05)


def check_palette_contrast():
    """色板正文/次要/链接/代码前景对各自底色都需 >= 4.5:1。

    只读 tokens.css 的顶层定义块，跳过 prefers-contrast 的增强段：
    那里本来就该更高。Solarized 的语法彩色 token 由官方配色决定，
    不在本断言范围内（见 theme-system.md 的对比度说明）。
    """

    palette_dir = THEME_DIR / "assets" / "theme" / "palettes"
    pairs = (
        ("body", "--body-color", "--page-bg"),
        ("secondary", "--text-secondary", "--page-bg"),
        ("link", "--link-color", "--page-bg"),
        ("code", "--code-fg", "--code-bg"),
        ("line numbers", "--line-num-color", "--code-bg"),
        ("code title", "--code-title-fg", "--code-title-bg"),
    )
    failures = []
    for palette in ("flexoki", "solarized", "hill-light"):
        tokens_path = palette_dir / palette / "tokens.css"
        if not tokens_path.is_file():
            continue
        css = tokens_path.read_text(encoding="utf-8")
        css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
        for match in re.finditer(r"([^{}]+)\{([^{}]*)\}", css):
            selector = " ".join(match.group(1).split())
            if "@media" in selector or "prefers-contrast" in selector:
                continue
            body = match.group(2)
            if "--page-bg" not in body:
                continue
            mode_match = re.search(r'data-mode="(\w+)"', selector)
            if palette == "hill-light":
                if " body" not in selector:
                    continue
                mode = mode_match.group(1) if mode_match else "dawn"
            else:
                if " body" not in selector:
                    continue
                mode = "dark" if "quarto-dark" in selector else "light"
            values = dict(re.findall(r"(--[a-z0-9-]+)\s*:\s*([^;]+);", body))
            for name, fg_token, bg_token in pairs:
                fg = _parse_hex_color(values.get(fg_token, ""))
                bg = _parse_hex_color(values.get(bg_token, ""))
                if not fg or not bg:
                    continue
                ratio = _contrast_ratio(fg, bg)
                if ratio < 4.5:
                    failures.append(
                        f"{palette}/{mode}: {name} {ratio:.2f}:1 "
                        f"({values.get(fg_token).strip()} on {values.get(bg_token).strip()})"
                    )
    return failures



def main():
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", default=".", help="书根目录（默认当前目录）")
    parser.add_argument("--book-dir", default="_book", help="渲染产物目录（默认 _book）")
    parser.add_argument("--browser", action="store_true",
                        help="执行三档视口、明暗模式的完整浏览器矩阵")
    parser.add_argument("--verbose", action="store_true", help="展开浏览器测量指标")
    args = parser.parse_args()

    global ROOT, QUARTO_YML
    ROOT = Path(args.root).resolve()
    QUARTO_YML = ROOT / "_quarto.yml"

    book_dir = Path(args.book_dir)
    if not book_dir.is_absolute():
        book_dir = ROOT / book_dir
    if not book_dir.is_dir():
        print(f"BookDir not found: {book_dir}. Run 'quarto render' first.")
        return 1

    css_texts = [
        p.read_text(encoding="utf-8", errors="ignore")
        for p in sorted(book_dir.rglob("*.css"))
    ]
    # 源主题也纳入检索。共享令牌与活跃 palette 在渲染前即可核对。
    theme_css_sources = [
        SHARED_TOKENS_CSS,
    ]
    quarto_text = QUARTO_YML.read_text(encoding="utf-8") if QUARTO_YML.is_file() else ""
    palette = active_palette_name(quarto_text)
    palette_tokens = None
    highlight_theme_texts = []
    if palette:
        palette_tokens = PALETTE_ROOT / palette / "tokens.css"
        theme_css_sources.append(palette_tokens)
        # 高亮主题是色板资产：注释/关键字色断言的 needle 是小写十六进制。
        # 它与 SCSS 里的大写令牌不串匹配。.theme JSON 必须加进搜索集合。
        for theme_path in sorted(PALETTE_ROOT.joinpath(palette).glob("*.theme")):
            highlight_theme_texts.append(theme_path.read_text(encoding="utf-8", errors="ignore"))
    source_css_texts = [
        p.read_text(encoding="utf-8", errors="ignore")
        for p in theme_css_sources
        if p.is_file()
    ]
    search_texts = css_texts + source_css_texts + highlight_theme_texts

    fail = 0
    if not palette or not palette_tokens or not palette_tokens.is_file():
        print("  MISS active palette tokens  (palettes/<name>/tokens.css in _quarto.yml)")
        fail += 1
    else:
        print(f"  OK   active palette `{palette}`  ({palette_tokens.as_posix()})")

    checks = list(SHARED_CHECKS) + list(TOKEN_NAME_CHECKS)
    checks.extend(PALETTE_VALUE_CHECKS.get(palette or "", []))
    for name, pattern in checks:
        found = any(pattern in text for text in search_texts)
        mark = "OK  " if found else "MISS"
        print(f"  {mark} {name}  ({pattern})")
        if not found:
            fail += 1

    # Solarized 不参与编译，但两份覆盖层必须始终可用；按文件分别核 selector 与色值。
    solarized_tokens = PALETTE_ROOT / "solarized" / "tokens.css"
    solarized_syntax = PALETTE_ROOT / "solarized" / "syntax.css"
    solarized_texts = {}
    for path in (solarized_tokens, solarized_syntax):
        if path.is_file():
            solarized_texts[path.name] = path.read_text(
                encoding="utf-8", errors="ignore"
            )
        else:
            print(f"  MISS solarized layer file  ({path.as_posix()})")
            fail += 1
    hill_tokens = PALETTE_ROOT / "hill-light" / "tokens.css"
    hill_syntax = PALETTE_ROOT / "hill-light" / "syntax.css"
    hill_texts = {}
    for path in (hill_tokens, hill_syntax):
        if path.is_file():
            hill_texts[path.name] = path.read_text(encoding="utf-8", errors="ignore")
        else:
            print(f"  MISS hill-light layer file  ({path.as_posix()})")
            fail += 1
    for texts, path, layer_checks in (
        (solarized_texts, solarized_tokens, SOLARIZED_TOKEN_CHECKS),
        (solarized_texts, solarized_syntax, SOLARIZED_SYNTAX_CHECKS),
        (hill_texts, hill_tokens, HILL_LIGHT_TOKEN_CHECKS),
        (hill_texts, hill_syntax, HILL_LIGHT_SYNTAX_CHECKS),
    ):
        text = texts.get(path.name)
        if text is None:
            continue
        for name, pattern in layer_checks:
            found = pattern in text
            mark = "OK  " if found else "MISS"
            print(f"  {mark} {name}  ({pattern})")
            if not found:
                fail += 1

    fail += check_hill_light_modes(hill_texts.get("tokens.css", ""))

    callouts_css = (
        THEME_DIR / "assets" / "theme" / "css" / "callouts.css"
    ).read_text(encoding="utf-8")
    for name, pattern in CALLOUT_CHECKS:
        found = pattern in callouts_css
        mark = "OK  " if found else "MISS"
        print(f"  {mark} {name}  ({pattern})")
        if not found:
            fail += 1

    theme_texts = [
        p.read_text(encoding="utf-8", errors="ignore")
        for p in sorted((THEME_DIR / "assets" / "theme").rglob("*"))
        if p.suffix in {".css", ".scss"}
    ]
    theme_text = "\n".join(theme_texts)
    for name, pattern in FORBIDDEN_FONT_REFERENCES:
        found = pattern in theme_text
        mark = "MISS" if found else "OK  "
        print(f"  {mark} {name}  (forbidden)")
        if found:
            fail += 1

    contrast_failures = check_palette_contrast()
    print(f"  {'MISS' if contrast_failures else 'OK  '} palette text contrast >= 4.5:1")
    if contrast_failures:
        for line in contrast_failures:
            print(f"       {line}")
        fail += 1

    css_defined = set(re.findall(r"(--[a-z0-9-]+)\s*:", theme_text))
    css_used = set(re.findall(r"var\(\s*(--[a-z0-9-]+)", theme_text))
    undefined_tokens = sorted(css_used - css_defined)
    print(f"  {'MISS' if undefined_tokens else 'OK  '} css tokens all defined")
    if undefined_tokens:
        print("       " + ", ".join(undefined_tokens))
        fail += 1

    legacy_font_files = sorted(
        p.name
        for pattern in ("inter-*", "noto-sans-sc-*", "jetbrains-mono-*")
        for p in FONT_DIR.glob(pattern)
    )
    print(f"  {'MISS' if legacy_font_files else 'OK  '} legacy font files removed")
    if legacy_font_files:
        print("       " + ", ".join(legacy_font_files))
        fail += 1

    font_asset_problems = check_font_assets(FONTS_CSS.read_text(encoding="utf-8"))
    print(
        f"  {'OK  ' if not font_asset_problems else 'MISS'} font asset set"
        f"  (Bright Medium=1, Bright Code=1)"
    )
    for problem in font_asset_problems:
        print(f"       {problem}")
    if font_asset_problems:
        fail += 1

    font_partition_problems = check_font_partition(
        FONTS_CSS.read_text(encoding="utf-8")
    )
    print(
        f"  {'OK  ' if not font_partition_problems else 'MISS'} font partitions"
        "  (non-overlap when ranges are declared)"
    )
    for problem in font_partition_problems:
        print(f"       {problem}")
    if font_partition_problems:
        fail += 1

    ranges, missing = check_font_coverage(book_dir)
    coverage_ok = not any(missing.values())
    print(
        f"  {'OK  ' if coverage_ok else 'MISS'} CJK font coverage"
        f"  (covered-codepoints={sum(len(s) for s in ranges.values())}, "
        f"missing={sum(map(len, missing.values()))})"
    )
    for family, chars in missing.items():
        if chars:
            print(f"       {family}: " + "".join(sorted(chars)[:20]))
    if not coverage_ok:
        fail += 1

    if args.browser:
        browser_problems, browser_note, browser_info = browser_layout(book_dir, args.verbose)
    else:
        browser_problems, browser_note, browser_info = [], "未请求浏览器矩阵（加 --browser 执行）", {}
    if browser_note and not browser_problems:
        print(f"  SKIP browser-layout  {browser_note}")
    else:
        print(
            f"  {'OK  ' if not browser_problems else 'MISS'} browser-layout"
            f"  (viewports=1280,768,390,360; schemes=light,dark; "
            f"mode={browser_info.get('mode', 'n/a')}; "
            f"pages={browser_info.get('pages', 0)})"
        )
        for problem in browser_problems:
            print(f"       {problem}")
        if browser_problems:
            fail += 1

    print()
    if fail == 0:
        if browser_note:
            print(f"PASS theme-static；SKIP browser-layout {browser_note}")
        else:
            print(
                "PASS theme-static；browser-layout "
                f"{browser_info.get('mode', 'full')} "
                f"{browser_info.get('pages', 0)} pages × 1280/768/390/360 × light/dark"
            )
        return 0
    print(f"{fail} theme check(s) failed; inspect the diagnostics above.")
    return 1


if __name__ == "__main__":
    sys.exit(main())
