# Heading reorder procedure

Use this as the long form of step 3–6 in `SKILL.md`. The unit of work is a
**section**, not a heading line: heading + body + fences + callouts + labels.

## 0. Establish the contract

```bash
quarto_book_audit { "root": "." }
```

Save the current outline. Copy it into the plan as “before”. Do not start
moving until the book config itself is valid: a missing chapter file makes
every later diff unreliable.

## 1. Write the target tree

The target tree is a plain indented list. Every line answers: which parent
owns this heading, and what subject does it name?

```text
## 棋盘的类型
  ### 棋盘格子坐标
  ### 棋盘格子类型
## 棋盘成员
  ### 检查下标区间
  ### 获取棋盘格子类型
  ### 检查棋盘格子是否为空
  ### 检查棋盘是否已满
## 放置棋子
## 判定终局
  ### 获取三连的类型
  ### 检查是否已有赢家
  ### 检查是否平局
  ### 检查对局是否结束
## 常见错误
  ### 写入空格子
## 自测问题
## 本章回顾
```

Rules visible in this example:

- A parent (`棋盘的类型`) is a category; its children keep the precise term
  (`棋盘格子坐标`, not “坐标”).
- A section that describes a member moves under `棋盘成员`, even if it was
  originally introduced with the type. Here `检查下标区间` moves from the type
  section to the members section, after the sentence that introduces
  `cells_[row][col]`.
- Sections that are not part of the reorder keep their original names:
  `常见错误`, `自测问题`, `本章回顾`; the four terminal-judgement H3s keep their
  names too.

## 2. Diff before cutting

Compare the target tree with the audit outline and mark each heading as
`keep`, `move`, `rename`, or `new`. A rename is a title-only change; if the
section's subject changes, it is a move plus a rewrite, not a rename.

Do not create a new heading to host a moved block. Reuse the target heading.

## 3. Cut whole sections

For each move, cut from the heading line through the line before the next
heading of the same or higher level. Include:

- paragraphs and lists;
- fenced code blocks and their captions;
- callouts, blockquotes, footnotes;
- heading attributes such as `{#id}`;
- links that point into the section.

Paste the block under the new parent. Preserve the order of code excerpts
relative to the implementation they quote. If the implementation file itself
must be reordered (for example `board.cpp`), do that in the same change and
say so in the plan; moving only the prose splits explanation from evidence.

## 4. Repair the seams, not the whole chapter

After a move, exactly these places usually need edits:

1. The paragraph that used to introduce the section and now dangles.
2. The first sentence under the moved heading, if it referred to its old
   parent (“上一节…”).
3. The paragraph that used to follow the section and now continues from a
   different predecessor.
4. Any explicit “see above/below” phrase. Replace it with a stable link or a
   subject name.
5. The chapter introduction, if the section order is part of the promised
   reading path.

Leave every other sentence alone. A reorder is not a license for a full
rewrite; keeping untouched prose makes review cheap and avoids accidental
fact changes.

## 5. Keep evidence aligned

- Code excerpts must match the current source byte for byte. If a function
  moved in the source, move the fence with it.
- Do not add an extra fence just to demonstrate a reordered loop. Explain the
  result in prose or point at the existing fence.
- Do not add comments inside a fence to explain the move. The prose owns the
  explanation; the fence stays clean.
- Preserve identifiers, signatures, output text and error messages exactly.

## 6. Verify

Run the audit, then render, then the full check:

```bash
quarto_book_audit { "root": ".", "includeUnlisted": true }
quarto render
quarto check
```

The outline in the audit must equal the target tree, including nesting. The
render must produce no warnings that point at the moved sections (unresolved
cross-references, duplicate labels, missing includes). The full check owns
whatever else the repository enforces (prose lint, token floors, link checks).

A section below a project's token floor is fixed by adding one new fact to the
existing prose — never by adding a new heading or a filler paragraph.

## Common mistakes

| Mistake | Symptom | Fix |
| --- | --- | --- |
| Moving only the heading | Body still argues from the old parent | Cut the whole section |
| Renaming a parent to a term | Parent and child both name the same thing | Parent = slot, child = term |
| Adding “上一节/下一节” | Title depends on position | Stable subject title |
| Renumbering by hand | Numbers drift after the next move | Use `number-sections` |
| Rewriting every sentence | Large diff, changed facts | Repair seams only |
| Adding a code fence | Fence duplicates source | Reuse the existing fence |
| Leaving a dangling link | Render warning | Update the link target |
| Empty section after a move | Heading with no body | Merge or write the missing fact |

## Exit criteria

- [ ] Audit outline equals the target tree.
- [ ] No error-severity issues; warnings are understood or fixed.
- [ ] Every moved section has its body and fences.
- [ ] No relative-position titles, no hand-written numbering.
- [ ] Code excerpts match source.
- [ ] `quarto render` passes.
- [ ] The full project check passes.
