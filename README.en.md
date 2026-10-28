# dsh-quarto-book

[![publish](https://github.com/chengzhao-dev/dsh-quarto-book/actions/workflows/publish.yml/badge.svg)](https://github.com/chengzhao-dev/dsh-quarto-book/actions/workflows/publish.yml)
[![npm](https://img.shields.io/npm/v/@chengzhao-dev/dsh-quarto-book)](https://www.npmjs.com/package/@chengzhao-dev/dsh-quarto-book)

**English** | [简体中文](https://github.com/chengzhao-dev/dsh-quarto-book/blob/main/README.md)

Take a Quarto Book from chapters to publishable output: `writing-quarto` owns the chapter skeleton, whole-book order and Chinese prose; `designing-theme` owns the theme; after a render, `quarto_render_check` decides whether the HTML is publishable and `quarto_pass_report` prints the closing receipt. Both skills appear only inside `type: book` repositories, and the workflow needs Quarto CLI and Python 3.

## What it provides

| Name | Use it for | Out of scope |
| --- | --- | --- |
| `writing-quarto` | Creating or editing `content/**/*.qmd`, `index.qmd`, `_quarto.yml`; chapter skeletons, Chinese prose, code and figures, content checks | CSS, fonts and colours |
| `designing-theme` | Theme CSS, SCSS, fonts, palettes, navigation and callout styling | Chapter prose |
| `quarto_render_check` | Check that `output-dir` is safe, render once when asked, and inspect HTML in `_book/` for publishing | Editing `.qmd`, fixing config automatically, or re-running a failed render |
| `quarto_pass_report` | Compress the run into a fixed-line receipt card: skill, mode, files and steps changed, items held, check verdicts | Saving to disk, quoting chapter prose, or changing the text based on the receipt |

Both skills are discovered from the package's `skills/` directory and loaded on demand. Relative paths inside a skill resolve against that skill's directory: `writing-quarto` uses `steps/`, `examples/`, `quarto/`, `references/`, `scripts/`; `designing-theme` uses `references/`, `knowledge/`, `assets/`, `scripts/`.

## Quick start

1. Install the plugin:

   ```bash
   dsh plugin --profile web add npm:@chengzhao-dev/dsh-quarto-book@latest
   ```

2. Open a session in the book repository. `_quarto.yml` needs a standalone `type: book` line, and the book needs at least one `.qmd` or `.md` chapter source; only then do both skill names appear.
3. Call a skill: `writing-quarto` for prose, `designing-theme` for the theme.

Replace `--profile` with the profile you actually run. The desktop app always runs the `desktop` profile, and that profile is owned by the app, so `dsh --profile desktop` is rejected; install or upgrade with `dsh plugin --profile desktop add <package>`, and use the app's Settings → Plugins → Add plugin only if the app refuses that write. To pin a version, write `npm:@chengzhao-dev/dsh-quarto-book@0.6.16`; to follow a GitHub tag, write `github:chengzhao-dev/dsh-quarto-book#v0.6.16`.

Upgrading from the old unscoped package `dsh-quarto-book` (removed from npm with 0.3.4, so this only affects profiles that installed it earlier): remove it from the same profile first with `dsh plugin --profile <profile> remove dsh-quarto-book`, then add the scoped package. Keeping both installed registers `writing-quarto` and `designing-theme` twice at the same rank 550.

Installation is scoped to a profile, not to a repository: it only affects the profile that ran `add`. The workspace check still decides whether the two skill names appear: it checks the session `cwd` for a book, and only then are both names selectable. See [docs/plugin-boundaries.md](https://github.com/chengzhao-dev/dsh-quarto-book/blob/main/docs/plugin-boundaries.md) for the six cases.

## Requirements

| Dependency | Purpose |
| --- | --- |
| DSH 0.2.x | Host; the plugin registers skills and both tools through `dsh.bundle.patch` |
| Node.js 22 or newer | Plugin runtime and check scripts |
| Python 3 | Content, link and naming checks, plus post-render HTML checks |
| Quarto CLI | Only when `quarto_render_check` actually renders |

The published package already contains compiled `lib/`, so installation needs no build step. See [docs/plugin-layout.md](https://github.com/chengzhao-dev/dsh-quarto-book/blob/main/docs/plugin-layout.md) for the split.

## Usage

### Writing chapters

Load `writing-quarto` in a `type: book` repository and follow the nine steps in `SKILL.md`. Each step opens one same-numbered file in `steps/`; read the same-numbered case in `examples/` only when a signal is unclear; open `quarto/` only for figures, render checks or repository-wide refactors.

The repository's root `README.md` is a description page, not a chapter: it takes only steps 5–8, skips the task skeleton and structure of steps 1–4, has no "common errors" or "self-test questions", and never calls `quarto_render_check`. `README.en.md` is treated the same way.

The plugin has no daemon and does not run skills when a session starts. A skill name in the catalog only means the check passed; only calling `skill`, `quarto_render_check` or `quarto_pass_report` counts as use. A second call in the same session re-reads the skill body, and failed tools are not retried automatically.

### Theming

Theme assets live in `skills/designing-theme/assets/theme/`. The package copy is authoritative; a book's `theme/` is the render copy. When a copy exists, `designing-theme` edits only that copy. It copies from the package only when the user explicitly asks to install the theme into the book and the target directory does not exist, and it also places `skills/writing-quarto/scripts/answering-disclosure.lua` at `filters/answering-disclosure.lua`. `_quarto.yml` always references the in-book copy, never an npm package or a checkout path.

### Checks and rendering

Run the content and link checks from the `writing-quarto` skill directory:

```bash
python scripts/verifying-content.py --root <book>
python scripts/checking-links.py --root <book>
python scripts/checking-prose.py --root <book>
python scripts/checking-names.py --root <book>
```

`checking-prose.py` reports only mixed Chinese-English problems that can be judged directly; `checking-names.py` is for repository-wide refactors. For everyday chapter work, the first three are enough.

Post-render callouts, HTML output and DOM contracts are checked by `quarto_render_check`, which calls the bundled scripts; run `checking-callouts.py`, `checking-output.py` or `checking-dom.py` by hand only when debugging a script. `designing-theme`'s `scripts/checking-layout.py` checks overflow, contrast and page structure on rendered HTML. Neither tool runs those scripts at load time, and neither runs `quarto render`.

Call `quarto_pass_report` once at the end of a run; the card is the receipt, and the reply should not repeat it.

### Project skill

A project keeps its own conventions in one skill: `<book>/.agents/skills/quarto-book-project/`, with a template in `templates/quarto-book-project/`. When it exists, both generic skills read its `SKILL.md` first, then the `writing/` files it points to; when it does not exist, they skip it and do not guess.

**Do not vendor a same-named skill into the book repository.** DSH picks one skill per name at its rank: `.agents/skills` (rank 200) wins over the plugin (rank 550), so a copy of `writing-quarto` or `designing-theme` inside the book silently replaces the plugin's rules.

## Documentation

| Document | Contents |
| --- | --- |
| [docs/plugin-flow.md](https://github.com/chengzhao-dev/dsh-quarto-book/blob/main/docs/plugin-flow.md) | The five layers from install to receipt, file routing and render order |
| [docs/plugin-boundaries.md](https://github.com/chengzhao-dev/dsh-quarto-book/blob/main/docs/plugin-boundaries.md) | The six workspace-check cases and their order |
| [docs/plugin-layout.md](https://github.com/chengzhao-dev/dsh-quarto-book/blob/main/docs/plugin-layout.md) | Repository layout, package contents, and the Python/Quarto split |
| [docs/writing-quarto-layout.md](https://github.com/chengzhao-dev/dsh-quarto-book/blob/main/docs/writing-quarto-layout.md) | The writing skill's directory layers |
| [docs/versioning.md](https://github.com/chengzhao-dev/dsh-quarto-book/blob/main/docs/versioning.md) | Version numbers and release order |

## Development

The source is TypeScript and the compiled `lib/` is committed; the published package loads `lib/` directly and needs no build on install. Link this checkout into the profile you write books with instead of copying skills into the book:

```bash
npm ci
npm test
npm run check
npm run pack
```

`npm test` compiles and runs the tool tests; `npm run check` type-checks and validates skill paths; `npm run pack` writes the tarball into `temp/`, which is already in `.gitignore`.

Replay the CI sequence locally with one command before pushing:

```bash
npm run ci
```

It runs `npm ci`, `npm test`, `npm run check:lib`, `npm run check`, and `npm run pack:check` — the same steps as `.github/workflows/ci.yml`, plus the publish-time package gate.

Development install:

```bash
dsh plugin --profile web add D:\\Github\\dsh-quarto-book
```

`SKILL.md`, `steps/`, `examples/` and `quarto/` are re-read on the next `skill` call, so rule changes need no npm publish. Theme changes in the package do not reach a book's HTML by themselves: copy the changed files into the book's `theme/` and run `quarto render` in the book root. Do not point `_quarto.yml` at the checkout; that path does not exist on another machine.

The plugin ships as a bundle: `package.json` has `dsh.bundle.patch` pointing at `cordis.patch.yml`, and the patch inserts only the `id: quarto-book`, `name: '@chengzhao-dev/dsh-quarto-book'` line. The entry does not import host internals, so it also loads under pnpm's strict dependency layout.

The legacy `scripts/embedding-agents.ps1` copies both skill trees into a target repository's `.agents/`, which shadows the plugin at rank 200. Do not use it for new books; run it only to archive a standalone skill tree offline. The command is at the top of the script.

## Issues and contributing

Bugs and suggestions go to [GitHub Issues](https://github.com/chengzhao-dev/dsh-quarto-book/issues). Before sending a change, run `npm test` and `npm run check`; for skill prose, also run `node scripts/checking-skill-links.mjs`.

## License

MIT. LXGW Bright and LXGW Bright Code in the theme are used under the SIL Open Font License 1.1; the upstream copyright notice and full license are in `skills/designing-theme/assets/theme/assets/fonts/OFL.txt`.
