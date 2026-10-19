# dsh-quarto-book

**English** | [简体中文](README.md)

Two skills for [DeepSeek Harness](https://github.com/deepseek-ai) (DSH): authoring Quarto Book chapters and maintaining a reusable book theme. The plugin is read-only — it never executes book code and never edits your `.qmd` files. It brings writing conventions, check scripts and theme assets into the current workspace.

## Skills

| Skill | Use it for | Out of scope |
| --- | --- | --- |
| `writing-quarto` | Creating or editing `content/**/*.qmd`, `index.qmd`, `_quarto.yml`; chapter skeletons, Chinese prose, code and figures, render verification | CSS, fonts and colours |
| `designing-theme` | Theme CSS, SCSS, fonts, palettes, navigation and callout styling | Chapter prose |

Both skills are discovered from the package's `skills/` directory and loaded on demand. Relative paths inside a skill (`references/`, `conventions/`, `knowledge/`, `scripts/`, `assets/`) resolve against that skill's directory.

## Install

```bash
dsh plugin --profile web add github:chengzhao-dev/dsh-quarto-book
```

Requires DSH 0.2.x and Node.js 22 or newer. The plugin is plain JavaScript with no build step.

After installation, ask for "writing-quarto" or "designing-theme" in a session, or let the model load them from the task context.

## Project-level conventions

The general skills cannot know a particular book's title, chapter table, stack or terminology. A project can provide its own skill:

```text
<book>/.agents/skills/quarto-book-project/SKILL.md
```

Start from `templates/quarto-book-project/SKILL.md`. When the file exists, both general skills tell the model to read it after the general skill; when it does not, they skip it and do not guess project conventions. A same-name project skill wins: `.agents/skills` (rank 200) outranks the packaged provider (rank 550).

## Theme

Theme assets live in `skills/designing-theme/assets/theme/`:

```text
assets/theme/
├── assets/          # brand mark, favicon, fonts and OFL licence
├── css/             # base, content, nav, sidebar, callouts, code, mermaid…
├── includes/        # font and footer snippets
└── palettes/github/ # light/dark SCSS, highlight themes, tokens.css
```

After copying the theme into a book, reference it from `_quarto.yml` using paths relative to the book root:

```yaml
format:
  html:
    theme:
      light: path/to/theme/palettes/github/theme-light.scss
      dark: path/to/theme/palettes/github/theme-dark.scss
    css:
      - path/to/theme/css/tokens.css
      - path/to/theme/css/base.css
    include-in-header:
      - path/to/theme/includes/fonts.html
    include-after-body:
      - path/to/theme/includes/footer.html
```

The theme belongs to this plugin; it is not claimed to be shared with any external repository. If a project already has an authoritative copy, the paths in its `_quarto.yml` win.

## Check scripts

`writing-quarto` ships Python checks under its `scripts/` directory. Run them from that skill directory (installed at `skills/writing-quarto/`):

```bash
python scripts/verifying-content.py --root <book>
python scripts/checking-links.py --root <book>
python scripts/checking-callouts.py --root <book>
python scripts/checking-output.py --root <book>
python scripts/checking-names.py --root <book>
```

`verifying-content.py` checks heading depth and length, body size budgets, forbidden wording, code fences, fragment sources and chapter-table consistency. Project-specific checks run only when the project skill exists; otherwise they are skipped so another book's chapter names never become rules.

`designing-theme` ships `scripts/checking-layout.py`, which inspects rendered HTML for overflow, contrast and page structure, and `scripts/measuring-pages.mjs` for measuring the content column.

## Package layout

```text
dsh-quarto-book/
├── lib/index.js            # registers both skills at rank 550
├── cordis.patch.yml        # inserts exactly one row
├── locale/{en,zh}.json     # marketplace title and description
├── icon.svg
├── skills/
│   ├── writing-quarto/
│   └── designing-theme/
├── templates/
│   └── quarto-book-project/SKILL.md
├── docs/creation-references.md
└── scripts/embedding-agents.ps1
```

`templates/` is outside `skills/` and is never registered. `scripts/embedding-agents.ps1` is a maintainer tool that copies the skill trees into another repository's `.agents/` directory; it is not loaded as part of either skill.

## Embedding into another book

Copy both skills into a target repository:

```powershell
pwsh -File scripts/embedding-agents.ps1 -Target D:\Github\my-book
```

For repositories that split `context/` and `knowledge/`:

```powershell
pwsh -File scripts/embedding-agents.ps1 -Target D:\Github\my-book -SplitLayout
```

The script refuses to copy `package.json`, `cordis.patch.yml`, `lib/`, `locale/` or `icon.svg`, so bundle manifests never leak into a book repository.

## Development

```bash
npm run check        # node --check lib/index.js
npm run pack:check   # npm pack --dry-run
```

The plugin ships as a bundle: `package.json` points `dsh.bundle.patch` at `cordis.patch.yml`, and the patch inserts only `id: quarto-book` / `name: dsh-quarto-book`. The entry imports nothing from the host, so it loads under pnpm's strict dependency layout.

## Licence

MIT. The bundled LXGW Bright fonts are used under `assets/fonts/OFL.txt`.
