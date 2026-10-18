# dsh-quarto-book

Heading reorganization and structural auditing for [Quarto](https://quarto.org) books, packaged as a host-only plugin for DeepSeek Harness (DSH).

Instead of hand-moving headings once, the plugin turns the job into a repeatable workflow: audit the book, move whole sections to a target outline, then render and re-audit. It is read-only: it never executes book code and never edits files.

## What it contributes

| Contribution | Kind | Purpose |
| --- | --- | --- |
| `quarto-book` | Skill | Heading-level rules, whole-section move procedure, Chinese technical prose, Quarto book structure |
| `quarto_book_audit` | Tool | Reads `_quarto.yml`, checks the chapter tree and every chapter's headings, returns JSON + Markdown |

Both are additive: `cordis.patch.yml` inserts a single row and leaves every official row untouched.

## Install

From this checkout:

```powershell
dsh plugin --profile desktop add D:\Github\dsh-quarto-book
```

From npm once published:

```powershell
dsh plugin --profile desktop add dsh-quarto-book
```

Restart the DSH session afterwards. Confirm the composed row:

```powershell
dsh --profile desktop --dump-config | Select-String -Pattern 'quarto-book' -Context 1,2
```

```yaml
# == dsh-quarto-book
- id: quarto-book
  name: dsh-quarto-book
```

## Use

### Skill

After DSH boots, `quarto-book` appears in the skill catalog. Ask directly:

```text
Using the quarto-book skill, reorganize the headings of content/tictactoe/03-board.qmd
to this target outline:
## 棋盘的类型
  ### 棋盘格子坐标
  ### 棋盘格子类型
## 棋盘成员
  ...
```

The skill insists on: audit first, write the target outline, move whole sections, fix only the seams, then render and re-audit.

### Tool

```json
{
  "root": "D:\\Github\\cpp-board-games",
  "includeUnlisted": true,
  "maxIssues": 200
}
```

| Parameter | Type | Description |
| --- | --- | --- |
| `root` | string | Book root containing `_quarto.yml`; relative paths resolve against the session cwd; defaults to cwd |
| `includeUnlisted` | boolean | Also report qmd files that exist but are absent from `book.chapters` |
| `maxIssues` | integer | Issue cap, 1–500, default 200 |

Returns `{ json, markdown }`. A real audit:

```json
{
  "ok": true,
  "book": { "title": "C++ 棋盘游戏实践", "projectType": "book" },
  "summary": { "chapters": 12, "headings": 111, "errors": 0, "warnings": 0, "infos": 0 },
  "issues": []
}
```

### Rules

| Code | Severity | Trigger |
| --- | --- | --- |
| `missing-config` | error | No `_quarto.yml` / `_quarto.yaml` |
| `config-parse-error` | error | YAML parse failure (falls back to a lenient chapter scan) |
| `missing-chapter` | error | Chapter file missing or unreadable |
| `not-book-project` | warning | `project.type` is not `book` |
| `missing-book` / `no-chapters` | error | No `book:` block or empty chapter list |
| `empty-part` | warning | A `part` has no chapters |
| `chapter-outside-root` | warning | Chapter path escapes the book root |
| `duplicate-chapter` | warning | Same chapter listed twice |
| `heading-level-skip` | warning | Level jump, e.g. H2 → H4 |
| `heading-start-level` | warning | First heading in a chapter is deeper than H2 |
| `multiple-h1` | warning | More than one H1 in a chapter |
| `duplicate-heading` | warning | Duplicate heading in a chapter |
| `empty-section` | warning | No body before the next same-level heading |
| `heading-relative-reference` | warning | Heading says “previous/next section” |
| `heading-manual-number` | info | Hand-written number such as `1.1 Install` |
| `heading-trailing-punctuation` | warning | Heading ends with `。！？；，、` |
| `heading-beyond-toc-depth` | info | Heading deeper than `format.html.toc-depth` |
| `unlisted-qmd` | info | qmd exists but is not listed (requires `includeUnlisted`) |

`ok` is false only when an error exists; warnings never block rendering.

## Design

- **Read-only** — no writes, no `quarto render`, no execution of book code.
- **Zero runtime dependencies** — uses `js-yaml` when present, otherwise the bundled `src/yaml-lite.js` covering the mapping, sequence, inline collection, block scalar and quoting/comment subset used by `_quarto.yml`.
- **Heading scan** — skips YAML frontmatter, backtick/tilde fences, HTML comments and four-space-indented code, then strips `{#id}` attributes before duplicate/level checks.
- **Part landing pages** — `- part: path/to/index.qmd` counts as a listed page, avoiding a false “unlisted” report.
- **Diagnosable** — every issue carries `severity`, `code`, `path`, optional `line`, and a Chinese message.

### DSH conventions followed

The implementation mirrors the public structure of installed plugins and the most-downloaded market entries:

- [dsh-gitbash-shell](https://github.com/KannaKuron/dsh-gitbash-shell) — `dsh.bundle.patch` with an additive `insert` row; never mutate official rows.
- [dsh-market](https://github.com/dsh-market/dsh-market) — `dsh.plugin.json` manifest and market metadata.
- [dsh-code-review](https://github.com/f-e-n-g-0531/dsh-code-review) — `ctx.tools.register` with `output.schema` / `output.render`.
- [dsh-skills-manager](https://github.com/MichengAI/dsh-skills-manager) — `ctx.skills.registerProvider` candidate and `get` shape.
- [Plugin market index](https://dsh.works/awesome-dsh-plugins/market/index.json) — capability layout of top entries such as `@liustack/modlens`, `dsh-better-sidebar`, `dsh-mnemon`.

This plugin is host-only: it has no Web client and registers no UI slots.

## Compatibility

| Item | Requirement |
| --- | --- |
| Node.js | ≥ 22 |
| DSH | ≥ 0.1.7-rc (`engines.dsh`) |
| Platform | Any (pure Node, paths resolved per platform) |

## Development

```powershell
npm test          # 27 tests, each file run in-process
npm run test:runner  # standard node --test (needs child-process spawning)
npm pack --dry-run   # inspect the published file set
```

`npm test` runs each file separately to avoid `spawn EPERM` in sandboxed environments where `node --test` cannot fork; in a normal terminal both are equivalent.

Layout:

```text
src/index.js              entry: registers the tool and the skill provider
src/audit.js              book audit and heading scan
src/yaml-lite.js          dependency-free YAML subset
assets/skills/quarto-book/  skill plus three references
test/                     unit, fixture and plugin-loading tests
cordis.patch.yml          additive quarto-book row
dsh.plugin.json           manifest and market metadata
```

## Real-world check

Auditing `D:\Github\cpp-board-games` yields:

```text
chapters: 12, headings: 111, errors: 0, warnings: 0, infos: 0, unlisted: 0
```

`content/tictactoe/03-board.qmd` now matches the target tree: `棋盘的类型` keeps only the coordinate/type H3s, the member-query headings moved under `棋盘成员`, and `判定终局` groups its four H3s. The audit reports no relative-reference headings, empty sections or level jumps.

## License

MIT. See [LICENSE](LICENSE).

---

中文：[README.md](README.md)
