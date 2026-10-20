# dsh-quarto-book

[![publish](https://github.com/chengzhao-dev/dsh-quarto-book/actions/workflows/publish.yml/badge.svg)](https://github.com/chengzhao-dev/dsh-quarto-book/actions/workflows/publish.yml)

**English** | [简体中文](https://github.com/chengzhao-dev/dsh-quarto-book/blob/main/README.md)

Two skills and one tool for [DeepSeek Harness](https://github.com/deepseek-ai) (DSH): authoring Quarto Book chapters, maintaining a reusable book theme, and checking rendered HTML before publishing. The skills are read-only — they never execute book code and never edit `.qmd` files. `quarto_render_check` runs `quarto render` once when called, so it executes the book's configured engine and writes `_book/`.

## What it provides

| Name | Use it for | Out of scope |
| --- | --- | --- |
| `writing-quarto` | Creating or editing `content/**/*.qmd`, `index.qmd`, `_quarto.yml`; chapter skeletons, Chinese prose, code and figures, content checks | CSS, fonts and colours |
| `designing-theme` | Theme CSS, SCSS, fonts, palettes, navigation and callout styling | Chapter prose |
| `quarto_render_check` | Check that `output-dir` is safe, render once when asked, and inspect HTML in `_book/` for publishing | Editing `.qmd`, fixing config automatically, or re-running a failed render |

Both skills are discovered from the package's `skills/` directory and loaded on demand. Relative paths inside a skill resolve against that skill's directory: `writing-quarto` uses `steps/`, `examples/`, `quarto/`, `scripts/`; `designing-theme` uses `references/`, `knowledge/`, `assets/`, `scripts/`.

## Install

```bash
dsh plugin --profile web add npm:dsh-quarto-book@0.3.3
```

Replace `--profile` with the profile you actually run. The desktop app always runs the `desktop` profile, and that profile is owned by the app, so `dsh --profile desktop` is rejected; install or upgrade a plugin with `dsh plugin --profile desktop add <package>`, and use the app's Settings → Plugins → Add plugin with `npm:dsh-quarto-book@0.3.3` only if the app refuses that write. To follow a GitHub tag instead, use `github:chengzhao-dev/dsh-quarto-book#v0.3.3`.

Requires DSH 0.2.x and Node.js 22 or newer. The source is TypeScript; the published package already contains compiled `lib/`, so installation needs no build step.

Installation is scoped to a profile, not to a repository: it only affects the profile that ran `add`. The workspace gate below still decides whether the two skill names appear in a session.

## Workspace gate

`apply()` registers the skill provider and the `quarto_render_check` tool; it writes nothing. The provider's `list({ cwd })` performs one bounded read-only check:

- Walk up from the session `cwd` to the enclosing git root. A `_quarto.yml` with a standalone `type: book` line plus at least one `.qmd` or `.md` chapter source returns both skills; otherwise the list is empty. Repository metadata such as `README.md`, `CHANGELOG.md` or `LICENSE.md` at the book root does not count as a chapter.
- No `cwd`, no enclosing git checkout, a missing `_quarto.yml`, only a commented `# type: book`, or a book config with no chapter sources all count as "not a book".
- The scan skips `_book`, `node_modules`, `vendor`, `third_party` and similar generated/dependency trees, and stops after 4000 directory entries. A normal C++ repository and this plugin's own checkout therefore never see these names; a subdirectory of a book repository behaves like the book root.
- The gate affects discovery and loading. `get()` re-runs the gate when a `cwd` is supplied; without one it serves this provider's already-loaded candidates only.
- `quarto_render_check` shares the gate: no session `cwd`, a non-book workspace, a `_quarto.yml` without `type: book`, or a book without chapter sources is refused before `quarto render` starts. The render root is the nearest valid book root above `cwd`; `qmd_path` only locates the card relative to the session `cwd`.

Community plugins have no "enable for one GitHub repository" switch; profile installation plus the cwd gate is the smallest scope available. For a narrower scope, install the plugin only into the profile used for writing. See [docs/plugin-boundaries.md](https://github.com/chengzhao-dev/dsh-quarto-book/blob/main/docs/plugin-boundaries.md) for the full decision matrix, coexistence rules with `dsh-cpp-workflow`, and verification records.

## Run state and completion

The plugin has no resident process and does not execute a skill when a session starts.

- **Whether it is active**: seeing `writing-quarto` or `designing-theme` in the skill catalog only means the session `cwd` passed the gate and the name is selectable. Absence is not an install failure; the current directory is not a book.
- **Whether it is used**: a use happens only when the model or the user invokes `skill`, or calls `quarto_render_check`. Being listed reads and writes nothing.
- **When it ends**: a skill has no background task; the turn that invokes it ends after the `SKILL.md` steps finish or stop. The render tool ends once `render_result` and `html_report` in the returned result are settled (both are `null` on a dry run); its card summary is one of `未渲染` (not rendered), `可渲染` (renderable), `渲染失败` (render failed) or `渲染完成` (render completed).
- **Final verdict**: `html_report.usable` is the final render-check verdict. Without `html_report`, `safe_to_render` only means rendering is allowed, not that it happened.
- **Using it again**: the next invocation rereads the skill text; the tool never retries automatically, so the user decides whether to call it again after a failure.

## Project-level conventions

The general skills cannot know a particular book's title, chapter table, stack or terminology. A project supplies exactly one skill of its own:

```text
<book>/.agents/skills/quarto-book-project/
├── SKILL.md                        # project conventions
└── writing/                    #/ project files
    └── chapter-map.md              # chapter table
```

Start from `templates/quarto-book-project/`. When the file exists, both general skills read `SKILL.md` and then the `writing/` files it points to; when it does not, they skip it and do not guess project conventions. General writing, structure and theme rules stay in the plugin and are not copied into the project skill.

**Do not embed same-name skills into a book repository.** DSH picks one skill per name per layer by rank, lowest wins: `.agents/skills` (rank 200) outranks the packaged provider (rank 550). A copy of `writing-quarto` or `designing-theme` in the book disables the plugin's text and brings a second set of general rules into the project.

## Render check tool

`quarto_render_check` takes two parameters:

- `qmd_path`: the `.qmd` being edited, used to locate the card.
- `dry_run`: `true` only judges the output directory; `false` runs `quarto render` once.

Calls are bounded. `dry_run: true` is allowed at most twice: if the first call returns `safe_to_render: false`, change `output-dir` once; if the second call is still unsafe, stop and report `warnings`. `dry_run: false` is allowed once: on failure, stop and report `errors`; do not retry automatically. On success the same response carries `html_report`, so the same file is not rendered again.

Returned fields:

| Field | Meaning |
| --- | --- |
| `warnings` | Unsafe output directory, missing entry file, and similar notes |
| `errors` | One-line reason for a failed render, timeout or missing `quarto`; empty on success |
| `safe_to_render` | Whether rendering may run |
| `suggested_output_dir` | Always `_book` |
| `render_result` | `ok`, `exit_code`, `duration_ms` and captured tail; `null` when `dry_run: true` |
| `html_report` | `usable`, `checks`, `output_files`, `output_files_total`; `null` when `dry_run: true` |

Each `html_report.checks` item is `{ id, status, detail }`, with `status` limited to `pass`, `fail` and `skip`. Fixed checks are `index_html`, `utf8`, `charset` and `no_file_uri`; conditional checks are `sitemap`, `search_index`, `callouts` and `dom`. `usable` is true when no check fails. `output_files` lists at most 30 HTML files; `output_files_total` gives the full count.

The interception, correction and success path looks like this. Start with a wrong output directory:

```yaml
project:
  type: book
  output-dir: ./
```

Call `quarto_render_check(qmd_path: "content/chapter.qmd", dry_run: true)`. It returns `safe_to_render: false`; `warnings` says `./` would overwrite the book root and suggests `output-dir: _book`. Change that line to `output-dir: _book` and call again: `safe_to_render: true`, `render_result: null`. Call with `dry_run: false` and the same response contains:

```json
{
  "errors": [],
  "render_result": { "ok": true, "exit_code": 0 },
  "html_report": {
    "usable": true,
    "checks": [
      { "id": "index_html", "status": "pass" },
      { "id": "charset", "status": "pass" },
      { "id": "sitemap", "status": "pass" },
      { "id": "search_index", "status": "pass" }
    ]
  }
}
```

The raw render output never becomes a separate terminal card. The render timeout is 120 seconds; timeouts, a missing `quarto` executable and non-zero exits all go into `errors`.

## Theme

Theme assets live in `skills/designing-theme/assets/theme/`:

```text
assets/theme/
├── assets/           #/ brand mark, favicon, fonts and OFL licence
├── css/              #/ base, content, nav, sidebar, callouts, code, mermaid…
├── includes/         #/ font and footer snippets
└── palettes/github/  #/ light/dark SCSS, highlight themes, tokens.css
```

Quarto reads relative paths inside the book; it reads neither npm packages nor DSH profiles. A book that renders uses its own `theme/` copy, and `_quarto.yml` references only that copy:

```yaml
format:
  html:
    theme:
      light: theme/palettes/github/theme-light.scss
      dark: theme/palettes/github/theme-dark.scss
    css:
      - theme/css/tokens.css
      - theme/css/base.css
    include-in-header:
      - theme/includes/fonts.html
    include-after-body:
      - theme/includes/footer.html
```

The package's `assets/theme/` is the authoritative source; the book's `theme/` is the render copy. When a copy exists, `designing-theme` edits only that copy. Only when the user explicitly asks to install the plugin theme into the book and the target directory does not exist yet does the skill copy from the package, also writing the `filters/answering-disclosure.lua` filter; an existing `_quarto.yml` only gains missing paths and is never replaced wholesale.

## Check scripts

`writing-quarto` ships content and link checks under its `scripts/` directory. Run them from that skill directory (installed at `skills/writing-quarto/`):

```bash
python scripts/verifying-content.py --root <book>
python scripts/checking-links.py --root <book>
python scripts/checking-names.py --root <book>
```

`verifying-content.py` checks heading depth and length, body size budgets, forbidden wording, code fences, fragment sources and chapter-table consistency. Project-specific checks run only when `.agents/skills/quarto-book-project/` exists; otherwise they are skipped so another book's chapter names never become rules.

Callouts, HTML output and DOM contracts are checked by `quarto_render_check`, which invokes the packaged scripts. Do not run `checking-callouts.py`, `checking-output.py` or `checking-dom.py` by hand. `designing-theme` ships `scripts/checking-layout.py`, which inspects rendered HTML for overflow, contrast and page structure, and `scripts/measuring-pages.mjs` for measuring the content column.

`apply()` runs none of these and never runs `quarto render`. Verification is triggered by the completion criteria in the skill text, after the user asks for a chapter or a theme change.

## Package layout

```text
dsh-quarto-book/
├── .github/workflows/publish.yml       # tag release
├── .gitattributes                      # line endings
├── .gitignore                          # ignored output
├── .npmignore                          # excluded files
├── LICENSE                             # MIT licence
├── README.en.md                        # English guide
├── README.md                           # Chinese guide
├── cordis.patch.yml                    # host patch
├── docs                            #/ design notes
├── icon.svg                            # plugin icon
├── lib                             #/ compiled output
│   ├── index.js                        # registration entry
│   ├── tools/render-check.js           # render check tool
│   └── workspace.js                    # workspace gate
├── locale                          #/ UI strings
├── package-lock.json                   # dependency lock
├── package.json                        # package manifest
├── scripts                         #/ repository scripts
│   ├── checking-skill-links.mjs        # skill self-check
│   └── embedding-agents.ps1            # legacy embed script
├── skills                          #/ both skills
│   ├── designing-theme             #/ theme skill
│   └── writing-quarto              #/ writing skill
├── src                             #/ TypeScript sources
│   ├── index.ts                        # plugin entry
│   ├── tools/render-check.ts           # render check implementation
│   └── workspace.ts                    # workspace gate
├── templates                       #/ project skill template
├── tests                           #/ tool unit tests
│   ├── provider.test.mjs               # skill gate tests
│   └── render-check.test.mjs           # render tool tests
└── tsconfig.json                       # TypeScript config
```

`templates/` is outside `skills/` and is never registered. The skill layout is described in `docs/writing-quarto-layout.md`; versioning and release rules in `docs/versioning.md`.

## Local development

The source is TypeScript and the compiled `lib/` is committed. Published packages load `lib/` directly, so installation needs no build step. During development, link this checkout into the writing profile instead of copying skills into a book:

```bash
npm ci
npm test
npm run check
npm run pack:check
```

`npm test` builds before running the tool tests; `npm run check` runs type checking and the skill path self-check. Development install:

```bash
dsh plugin --profile web add D:\Github\dsh-quarto-book
```

`SKILL.md`, `steps/`, `examples/` and `quarto/` are re-read on the next `skill` tool call, so no npm release is needed after an edit. Theme edits inside the package do not reach the book's HTML automatically; to see a page, sync the changed files into the book's `theme/` and run `quarto render` at the book root. Never point `_quarto.yml` at the plugin checkout — that path stops existing on another machine.

The plugin ships as a bundle: `package.json` points `dsh.bundle.patch` at `cordis.patch.yml`, and the patch inserts only `id: quarto-book` / `name: dsh-quarto-book`. The entry imports nothing from the host, so it loads under pnpm's strict dependency layout.

## Embedding into another book (not recommended)

`scripts/embedding-agents.ps1` is a maintainer tool from the older layout. It copies both skill trees verbatim into the target repository's `.agents/`. Those copies use the same names as the packaged skills and outrank them (rank 200 vs 550), so plugin updates stop taking effect.

Do not use it for new books: keep only `.agents/skills/quarto-book-project/` in the book and let the installed plugin supply the rest. Run it only to archive a standalone skill tree offline:

```powershell
pwsh -File scripts/embedding-agents.ps1 -Target D:\Github\my-book
```

The script refuses to copy `package.json`, `cordis.patch.yml`, `lib/`, `locale/` or `icon.svg`, so bundle manifests never leak into a book repository.

## Licence

MIT. The bundled LXGW Bright and LXGW Bright Code fonts are used under the SIL Open Font License 1.1; upstream copyright notices and the full licence text are in `skills/designing-theme/assets/theme/assets/fonts/OFL.txt`.
