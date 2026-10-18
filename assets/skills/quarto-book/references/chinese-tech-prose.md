# Chinese technical prose rules

Apply these while repairing seams after a heading move. They are the house
style this skill assumes; a repository may extend them, and its local rules
win.

## Sentence shape

- **One sentence, one action.** “棋盘保存格子，负责放置棋子，并判定终局。” is
  three actions; split or promote two of them to their own sentences.
- **One subject per sentence.** Do not start with the class and switch to the
  caller mid-sentence. “`Board` 收到输入后，玩家再确认。” switches actors;
  rewrite each half with its own subject.
- **Agent before action.** Avoid “由…完成/由…负责” zipper sentences. Who does
  what should be the first thing the reader learns.
- **Verb near its object.** Long attributive chains before a noun (“一个在…
  情况下用于…的…”) belong in a separate sentence.
- **Chinese punctuation.** Full-width `，。；：？！` in prose; `、` only in
  enumerations. No space between Chinese characters; one space around inline
  code and Latin identifiers is fine.
- **Paragraph length.** 2–5 sentences per paragraph; a section of prose should
  not be one giant block.

## Titles

- A title names a subject, never a position. `上一节`, `下一节`, `如前所述`,
  `接下来` are not titles.
- Do not hand-number titles. Use `number-sections` when numbers matter.
- No trailing punctuation.
- Parent = category, child = precise term. Do not let a parent and its child
  repeat the same phrase.
- A title must be true for the whole section beneath it. If the section now
  serves two subjects, split it or rename it.

## Terminology and facts

- One term per concept. Define it once, then reuse it. Do not alternate
  `格子` / `单元格` / `方块` for the same thing.
- Identifiers, signatures, output and error text are facts. Copy them exactly;
  never translate a function name in prose without also showing the real name.
- Do not add claims the code does not support. “线程安全”, “高效”, “自动处理”
  require evidence in the chapter or the source.
- Do not add a disclaimer about excerpt order or “the source order serves the
  explanation”. The reader came for the subject, not the diff.

## Transitions

- Replace positional references with a subject or a link: instead of
  “上一节说过棋盘”，write “棋盘保存格子，见 @sec-board-members”。
- A moved section needs a seam, not a rewrite. Check the sentence before it,
  its first sentence, and the sentence after it.
- Do not open every section with “本节介绍…”. State the subject directly.
- Do not close every section with a summary. A chapter-level recap is enough.

## Code-adjacent prose

- Introduce a fence before it appears; explain the result after it. Do not
  narrate the fence line by line.
- A fence must match the quoted source. If it no longer does, fix the fence
  from the source — never edit the source to match stale prose.
- Do not add an extra fence, comment or “注意” block just to fill a moved
  section. Add one new fact to the existing prose instead.
- A section below a token floor is expanded with evidence: an observed output,
  a boundary case, a comparison. Filler sentences count against the reader.

## Before / after

Before (three actions, actor switch, positional title):

```text
## 上一节的内容
Board 收到输入后写入 cells_，玩家再确认，最后由 renderer 输出。
```

After (one action per sentence, stable title, explicit actor):

```text
## 放置棋子
`Board::place` 收到坐标后写入 `cells_`。写入前，它检查坐标是否在棋盘内。
渲染器只读取 `cells_`，不参与合法性判断。
```

Before (hand numbering, trailing punctuation):

```text
### 1. 检查下标区间。
```

After:

```text
### 检查下标区间
```

## Review checklist

- [ ] Every sentence has one action.
- [ ] No “由…完成” constructions.
- [ ] One term per concept across the chapter.
- [ ] No positional or numbered titles.
- [ ] Fences match source exactly.
- [ ] New claims are supported by code or observed output.
- [ ] Untouched prose stayed untouched.
