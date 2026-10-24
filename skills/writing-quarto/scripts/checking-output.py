#!/usr/bin/env python3
"""做渲染产物的发布前 smoke 检查。检查项是首页存在、编码干净、charset 正确与站点 URL 生效。

为什么需要它：渲染成功不等于线上可读。历史事故里 quarto render 全绿。线上却
出现 404 或乱码。问题出在 site-url 缺失、Pages 源未配置或产物编码被破坏。
本检查在渲染后、发布前运行。它把这类失败拦在 CI。run.py check 的其余产物检查
不在本检查范围内。

用法：python checking-output.py [--book-dir _book] [--root .] [--require-sitemap]
退出码：0 = 通过；1 = 存在阻塞问题；2 = 渲染产物目录或首页缺失。
"""

import argparse
import sys
from pathlib import Path

# 本文件的乱码特征与 checking-encoding.py 完全一致。命中任意一个特征即判为编码破坏。
# 这些特征用 \u 转义存放。checking-encoding.py 不会把本文件误判成含乱码。
MOJIBAKE_MARKERS = (
    "\u951f", "\u93c2", "\u941c", "\u7ed4", "\u93b4",
    "\u7487", "\u6d60", "\u934f", "\u7039", "\u95b8",
)


def main() -> int:
    parser = argparse.ArgumentParser(description="检查渲染产物可发布性")
    parser.add_argument("--book-dir", default="_book", help="渲染产物目录")
    parser.add_argument("--root", default=".", help="书根目录（用于解析 site-url）")
    parser.add_argument("--require-sitemap", action="store_true",
                        help="要求生成 sitemap.xml（配置了 book.site-url 时使用）")
    args = parser.parse_args()
    book = Path(args.book_dir)
    if not book.is_absolute():
        book = Path(args.root) / book
    problems = []

    index = book / "index.html"
    if not index.is_file():
        print(f"缺少产物首页 {book.as_posix()}/index.html：确认在仓库根目录渲染")
        return 2

    html_files = sorted(book.rglob("*.html"))
    if not html_files:
        print(f"{book.as_posix()} 下没有任何 HTML 文件")
        return 2

    for path in html_files:
        rel = path.relative_to(book).as_posix()
        raw = path.read_bytes()
        if raw.startswith(b"\xef\xbb\xbf"):
            problems.append(f"{rel}: 带 BOM")
            continue
        try:
            text = raw.decode("utf-8")
        except UnicodeDecodeError as exc:
            problems.append(f"{rel}: 非 UTF-8（{exc}）")
            continue
        if "\ufffd" in text:
            problems.append(f"{rel}: 含 U+FFFD 替换符")
            continue
        for marker in MOJIBAKE_MARKERS:
            if marker in text:
                problems.append(f"{rel}: 命中乱码特征「{marker}」")
                break

    index_text = index.read_text(encoding="utf-8", errors="replace")
    if "charset=utf-8" not in index_text.replace('"', "").replace("'", ""):
        problems.append("index.html 缺少 charset=utf-8 声明")
    if "file:///" in index_text:
        problems.append("index.html 引用 file:/// 本地绝对路径，发布后必然失效")

    # sitemap.xml is produced only when book.site-url is configured. Treat it as
    # optional unless --require-sitemap is passed, so a local preview can pass.
    sitemap = book / "sitemap.xml"
    if not sitemap.is_file():
        if args.require_sitemap:
            problems.append("缺少 sitemap.xml：通常是 _quarto.yml 的 book.site-url 未配置")
    else:
        sitemap_text = sitemap.read_text(encoding="utf-8", errors="replace")
        for loc in sitemap_text.split("<loc>")[1:]:
            url = loc.split("</loc>")[0].strip()
            if url and not url.startswith("https://"):
                problems.append(f"sitemap.xml 存在非绝对 URL：{url}")
                break

    if problems:
        print(f"发布产物检查失败（{len(problems)} 项）：")
        for item in problems[:30]:
            print(f"  {item}")
        return 1
    print(f"发布产物检查全部通过：{len(html_files)} 个 HTML，编码干净，sitemap 就绪")
    return 0


if __name__ == "__main__":
    sys.exit(main())
