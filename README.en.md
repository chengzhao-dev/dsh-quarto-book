# dsh-quarto-book

**English** | [简体中文](README.md)

Two skills for [DeepSeek Harness](https://github.com/deepseek-ai) (DSH): authoring Quarto Book chapters and maintaining a reusable book theme. The plugin is read-only — it never executes book code and never edits your `.qmd` files. It only brings writing conventions, check scripts and theme assets into Quarto Book workspaces.

## Skills

| Skill | Use it for | Out of scope |
| --- | --- | --- |
| `writing-quarto` | Creating or editing `content/**/*.qmd`, `index.qmd`, `_quarto.yml`; chapter skeletons, Chinese prose, code and figures, render verification | CSS, fonts and colours |
| `designing-theme` | Theme CSS, SCSS, fonts, palettes, navigation and callout styling | Chapter prose |

Both skills are discovered from the package's `skills/` directory and loaded on demand. Relative paths inside a skill resolve against that skill's directory: `writing-quarto` uses `steps/`, `examples/`, `quarto/`, `scripts/`; `designing-theme` uses `references/`, `knowledge/`, `assets/`, `scripts/`.

## Install

```bash
dsh plugin --profile web add github:chengzhao-dev/dsh-quarto-book
```

Replace `--profile` with the profile you actually run. The desktop app always runs the `desktop` profile, and that profile is owned by the app, so a command-line `add` is rejected; use the app's Settings → Plugins → Add plugin with the same address instead.

Requires DSH 0.2.x and Node.js 22 or newer. The plugin is plain JavaScript with no build step.

Installation is scoped to a profile, not to a repository: it only affects the profile that ran `add`. The workspace gate below still decides whether the two names appear in a session.

## Workspace gate

`apply()` only registers the skill provider; it scans nothing and writes nothing. `list({ cwd })` decides whether the session can see the two skills:

- Walk up from the session `cwd` to the enclosing git root. If any directory on the way has a `_quarto.yml` with a standalone `type: book` line, return both skills; otherwise return an empty list.
- No `cwd`, no enclosing git checkout, a missing `_quarto.yml`, or only a commented `# type: book` all count as "not a book".
- A normal C++ repository and this plugin's own checkout therefore never see these names; a subdirectory of a book repository behaves like the book root.
- The gate affects discovery and loading only. `get()` still serves this provider's own candidates.

Community plugins have no "enable for one GitHub repository" switch; profile installation plus the cwd gate is the smallest scope available. For a narrower scope, install the plugin only into the profile used for writing.

## Project-level conventions

The general skills cannot know a particular book's title, chapter table, stack or terminology. A project supplies exactly one skill of its own:

```text
<book>/.agents/skills/quarto-book-project/
├── SKILL.md            # title, audience, terminology, render and check commands, theme and filter paths
└── writing         #/ chapter table: file names and titles
    └── chapter-map.md  # this book's chapter table: file, class/ability chapter, title, H2 headings
```

Start from `templates/quarto-book-project/`. When the file exists, both general skills read `SKILL.md` and then the `writing/` files it points to; when it does not, they skip it and do not guess project conventions. General writing, structure and theme rules stay in the plugin and are not copied into the project skill.

**Do not embed same-name skills into a book repository.** DSH picks one skill per name per layer by rank, lowest wins: `.agents/skills` (rank 200) outranks the packaged provider (rank 550). A copy of `writing-quarto` or `designing-theme` in the book disables the plugin's text and brings a second set of general rules into the project.

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

`writing-quarto` ships Python checks under its `scripts/` directory. Run them from that skill directory (installed at `skills/writing-quarto/`):

```bash
python scripts/verifying-content.py --root <book>
python scripts/checking-links.py --root <book>
python scripts/checking-callouts.py --root <book>
python scripts/checking-output.py --root <book>
python scripts/checking-names.py --root <book>
```

`verifying-content.py` checks heading depth and length, body size budgets, forbidden wording, code fences, fragment sources and chapter-table consistency. Project-specific checks run only when `.agents/skills/quarto-book-project/` exists; otherwise they are skipped so another book's chapter names never become rules.

`designing-theme` ships `scripts/checking-layout.py`, which inspects rendered HTML for overflow, contrast and page structure, and `scripts/measuring-pages.mjs` for measuring the content column.

`apply()` runs none of these and never runs `quarto render`. Verification is triggered by the completion criteria in the skill text, after the user asks for a chapter or a theme change.

## Package layout

```text
dsh-quarto-book/
├── .gitattributes                # line endings and encoding
├── .gitignore                    # ignored build output
├── .npmignore                    # files kept out of the package
├── LICENSE                       # MIT licence
├── README.en.md                  # English guide
├── README.md                     # Chinese guide
├── cordis.patch.yml              # single-row host patch
├── docs                      #/ design notes and release rules
│   ├── creation-references.md    # where the design came from
│   ├── versioning.md             # versioning and release
│   └── writing-quarto-layout.md  # skill directory layout
├── icon.svg                      # plugin icon
├── lib                       #/ plugin code
│   └── index.js                  # entry registering both skills at rank 550
├── locale                    #/ UI strings
│   ├── en.json                   # English
│   └── zh.json                   # Chinese
├── package-lock.json             # dependency lock
├── package.json                  # package manifest
├── scripts                   #/ repository scripts
│   ├── checking-skill-links.mjs  # skill self-check
│   └── embedding-agents.ps1      # skill install script
├── skills                    #/ both skills
│   ├── designing-theme       #/ theme skill
│   │   ├── SKILL.md              # entry
│   │   ├── assets                # theme assets and fonts
│   │   ├── knowledge             # reading surface notes
│   │   ├── references            # theme rules
│   │   └── scripts               # layout checks
│   └── writing-quarto        #/ writing skill
│       ├── SKILL.md              # entry, nine steps
│       ├── examples              # good and bad examples
│       ├── quarto                # rendering conventions
│       ├── scripts               # content checks
│       └── steps                 # the nine steps
└── templates                 #/ project skill template
    └── quarto-book-project   #/ the in-book project skill
        ├── SKILL.md              # project conventions template
        └── writing           #/ chapter map
            └── chapter-map.md    # chapter table template
```

`templates/` is outside `skills/` and is never registered. The skill layout is described in `docs/writing-quarto-layout.md`; versioning and release rules in `docs/versioning.md`.

## Local development

Plain JavaScript with no build. During development, link this checkout into the writing profile instead of copying skills into a book:

```bash
dsh plugin --profile web add D:\Github\dsh-quarto-book
```

`SKILL.md`, `steps/`, `examples/` and `quarto/` are re-read on the next `skill` tool call, so no npm release is needed after an edit. Theme edits inside the package do not reach the book's HTML automatically; to see a page, sync the changed files into the book's `theme/` and run `quarto render` at the book root. Never point `_quarto.yml` at the plugin checkout — that path stops existing on another machine.

```bash
npm run check        # node --check lib/index.js && node scripts/checking-skill-links.mjs
npm run pack:check   # npm pack --dry-run
```

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
