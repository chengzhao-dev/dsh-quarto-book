---
name: quarto-book
description: Author and reorder a Quarto book chapter without breaking its narrative or render. Use when editing _quarto.yml chapter wiring, moving headings between nested levels, rewriting chapter titles, or verifying a Quarto book before `quarto render`.
---

# Quarto book authoring

A Quarto book is an ordered contract: `_quarto.yml` fixes the chapter order,
each `.qmd` fixes the internal heading tree, and the rendered page fixes what a
reader can follow. Reordering headings is therefore a source change, not a TOC
edit. Keep the three layers consistent.

## Working loop

1. **Read the book contract.** Open `_quarto.yml` and list `book.chapters` in
   order, including `part:` wrappers and `appendices`. Never infer chapter
   order from filenames.
2. **Audit before editing.** Call `quarto_book_audit` with the book root. It
   reports missing chapter files, skipped heading levels, empty sections,
   duplicate headings, relative-position titles and hand-written numbering.
3. **Write the target outline first.** Put the intended `##`/`###` tree in the
   plan or scratchpad, with one line per heading. Move headings in this target
   list until each parent owns a single subject.
4. **Move source blocks to match.** Reordering headings alone leaves prose and
   code excerpts under the wrong title. Move the corresponding paragraphs,
   fences and explanations with the heading. Update links and cross-references
   to the moved sections.
5. **Rewrite only what the move broke.** Fix opening sentences, transitions and
   references to “previous/next section”; leave sentences that still pass the
   prose rules untouched.
6. **Audit again.** Run `quarto_book_audit`; the outline must match the target
   tree, with no new errors.
7. **Render, then run the project check.** Render first
   (`quarto render`, or the project's `run.ps1 render`), then the full check
   (`run.ps1 check --profile full` or `quarto check`). Stop on failure; do not
   “fix forward” in the render output.

## Heading rules

- **One title per chapter.** Use a single H1 for the chapter title, or let the
  chapter title come from front matter/filename and start sections at H2.
  Never emit two H1s in one chapter.
- **Do not skip levels.** H1 → H2 → H3. A heading that jumps from H2 to H4 is
  a structural bug, not a styling choice.
- **Parent headings name a slot, child headings keep the term.** For example a
  parent `## 棋盘的类型` may own `### 棋盘格子坐标` and `### 棋盘格子类型`. The
  parent names the category; the children keep the precise domain term.
- **A heading states a subject, not a position.** Never write `上一节`,
  `下一节`, `上一章`, `下一章`, `如前所述` in a title. If the section needs a
  transition, rewrite the prose under a stable subject title.
- **No hand-written numbers.** Leave numbering to `number-sections: true` or to
  the theme. If numbering is off, `1. 安装` in a heading is noise.
- **No trailing punctuation.** Headings do not end in `。！？；，、`.
- **No empty sections.** A heading must have body text (a fence counts) before
  the next heading of the same or higher level. If a section is only a title,
  merge it into its parent or write the missing explanation.
- **Keep the TOC depth honest.** Headings deeper than `toc-depth` (default 3)
  will not appear in the sidebar; do not rely on them for navigation.

## Reordering method

Use this when a plan supplies a target outline (the common case):

1. Copy the target outline into the plan verbatim, including nesting.
2. Diff it against the current headings from `quarto_book_audit`.
3. For each move, cut the whole section: heading, body, fences, callouts,
   footnotes, and any `{#id}` labels.
4. Paste it at the target position. Keep code excerpts in the same order as the
   implementation they quote; if the source file must change order too, say so
   in the plan instead of reordering only the prose.
5. Repair only the seams: the sentence that introduced the old position, the
   sentence that followed the moved block, and any explicit reference to the
   old location.
6. Re-run the audit and compare the outline line by line with the target.

Do not renumber headings by hand and do not add a “dependency disclaimer”
paragraph explaining why a section moved. The new order must read as the
natural order.

## Prose rules while moving

- One sentence, one action. Split sentences that perform two actions.
- Keep one subject per sentence; do not switch from the class to the caller in
  the middle of a sentence.
- Do not write “由…完成” zipper sentences. Name the actor and the action.
- Keep terminology stable across the chapter (one term per concept; define it
  once, then reuse it).
- Do not add disclaimers about excerpt order, “as we will see”, or “the source
  order serves the explanation”.
- Code fences are evidence: keep them byte-aligned with the source file they
  quote. Do not add a new `.cpp` fence just to show a reordered loop.
- Facts, function names and observed output never change during a prose edit.

## Verification

Prefer the project's own commands; fall back to Quarto's when absent:

```bash
quarto render
quarto check
```

In repositories with a managed check runner, the order is:

```powershell
& .agents/skills/agent-workspace/governing-agents/scripts/run.ps1 render
& .agents/skills/agent-workspace/governing-agents/scripts/run.ps1 check --profile full
```

A fast check before rendering is useful while iterating:

```powershell
& .agents/skills/agent-workspace/governing-agents/scripts/run.ps1 check --profile fast
```

Report the exact command and its exit status. A passing audit is not a passing
render: the audit checks structure, the render checks Quarto, filters, includes
and cross-references.

## Tool: `quarto_book_audit`

- `root` — book directory containing `_quarto.yml` (defaults to the session
  working directory).
- `includeUnlisted` — also list `.qmd` files that exist but are not wired into
  `book.chapters`.
- `maxIssues` — cap the issue list (default 200).

The result is JSON plus Markdown: chapter order, per-chapter heading outline
with line numbers, and severity-tagged issues (`missing-chapter`,
`heading-level-skip`, `empty-section`, `duplicate-heading`,
`heading-relative-reference`, `heading-manual-number`, `multiple-h1`, …).
`ok` is false only when an error-severity issue exists.

## Reference files

- `references/heading-reorder.md` — full reorder procedure with a worked
  chapter outline and a seam checklist.
- `references/quarto-book-anatomy.md` — `_quarto.yml` wiring, parts, freeze,
  render pipeline, and failure triage.
- `references/chinese-tech-prose.md` — sentence-level rules for Chinese
  technical chapters, with before/after examples.
