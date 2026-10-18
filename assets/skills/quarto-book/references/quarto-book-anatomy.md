# Quarto book anatomy

## The contract files

```text
book-root/
├── _quarto.yml        # project + book wiring
├── index.qmd          # landing page (usually first chapter)
├── content/
│   ├── part-index.qmd
│   ├── 01-rules.qmd
│   └── 02-board.qmd
├── _quarto/           # local execution cache (not published)
├── _freeze/           # committed computation freeze (optional)
└── _book/             # rendered output (not committed)
```

`_quarto.yml` is the source of truth for order:

```yaml
project:
  type: book
  output-dir: _book

book:
  title: "C++ 棋盘游戏实践"
  chapters:
    - index.qmd
    - part: content/tictactoe/index.qmd
      chapters:
        - content/tictactoe/01-rules.qmd
        - content/tictactoe/02-mapping-layout.qmd
        - content/tictactoe/03-board.qmd
  appendices:
    - content/appendix.qmd
```

- `book.chapters` is an ordered list. A string is one chapter; an object with
  `part` + `chapters` opens a part; `href` + `text` links an external page.
- `book.appendices` follows the same item shapes and renders after chapters.
- Paths are relative to the book root; forward slashes work on every platform.
- `project.type: book` enables chapter navigation, the sidebar TOC and the
  next/previous pager. Without it, `book:` is ignored.

## Rendering and freezing

- `quarto render` renders the whole book; `quarto render path/to/chapter.qmd`
  renders one chapter. `quarto preview` serves a live copy.
- `execute.freeze: auto` caches computation in `_freeze/`. Commit it when the
  site is built in CI; clean it when changing execution inputs.
- `_book/` is generated. Never edit it and never use it as evidence for a
  source change.
- `format.html.toc-depth` controls which heading levels reach the sidebar.
  Heading structure still matters below that depth for anchors and links.

## Heading model

Quarto treats each chapter file as a page. The page title comes from:

1. YAML front matter `title:`, else
2. the first H1, else
3. the filename.

Pick one convention per book and keep it. If the title comes from front
matter or the filename, open the chapter at H2. If the chapter has an H1,
never add a second one.

`number-sections: true` numbers headings automatically. If it is false, do not
fake numbers in heading text; reordering will invalidate them.

## Cross-references

- Give a section an explicit id when links must survive a rename:
  `## 棋盘成员 {#sec-board-members}`.
- Reference it as `@sec-board-members` or `[棋盘成员](#sec-board-members)`.
- A moved section keeps its id, so old links continue to work. A renamed
  section without an id breaks every link that used the old slug.
- The audit does not resolve links; the render does. Treat render warnings
  about unresolved references as errors.

## Includes, filters and resources

`format.html` commonly carries `css:`, `include-in-header:`,
`include-after-body:`, `theme:` and `highlight-style:`. Paths are relative to
the book root. Moving chapters between directories does not change these
paths, but moving an asset does.

`filters:` run Lua filters on every page. A filter that assumes a heading
shape (for example, one that inserts a disclosure after the first H2) will
change behaviour when headings move. Re-render after a reorder, not just
audit.

## Failure triage

| Symptom | Likely cause | Check |
| --- | --- | --- |
| Chapter missing from sidebar | Not in `book.chapters`, or wrong path | Audit `missing-chapter` |
| Duplicate page title | `title:` plus an H1 | Remove one |
| TOC entry missing | Heading deeper than `toc-depth` | Audit `heading-beyond-toc-depth` |
| Broken link after rename | Slug changed, no explicit id | Add `{#id}` or update links |
| Empty page section | Heading with no body | Audit `empty-section` |
| Render executes stale code | `_freeze` cache | Clean `_freeze` and re-render |
| Wrong chapter order | Filename sort assumed | Read `book.chapters`, not the directory |

## Commands

```bash
quarto check          # environment + project diagnostics
quarto render         # full book
quarto render file.qmd
quarto preview
```

Project-managed runners wrap these; prefer them when present because they may
add prose lint, link checks and artifact checks. Run render before the full
check so the check sees fresh HTML.
