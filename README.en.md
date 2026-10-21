# dsh-quarto-book

[![publish](https://github.com/chengzhao-dev/dsh-quarto-book/actions/workflows/publish.yml/badge.svg)](https://github.com/chengzhao-dev/dsh-quarto-book/actions/workflows/publish.yml)

**English** | [简体中文](https://github.com/chengzhao-dev/dsh-quarto-book/blob/main/README.md)

Write Quarto Book chapters, check their structure, and maintain the theme; only inside `type: book` repositories.

- Write `.qmd`: `writing-quarto` covers the chapter skeleton, structure and prose.
- Change the theme: `designing-theme` covers CSS, fonts and palettes.
- Check rendered HTML: `quarto_render_check` judges publishability once, and `quarto_pass_report` prints the closing receipt.

## What it provides

| Name | Use it for | Out of scope |
| --- | --- | --- |
| `writing-quarto` | Creating or editing `content/**/*.qmd`, `index.qmd`, `_quarto.yml`; chapter skeletons, Chinese prose, code and figures, content checks | CSS, fonts and colours |
| `designing-theme` | Theme CSS, SCSS, fonts, palettes, navigation and callout styling | Chapter prose |
| `quarto_render_check` | Check that `output-dir` is safe, render once when asked, and inspect HTML in `_book/` for publishing | Editing `.qmd`, fixing config automatically, or re-running a failed render |
| `quarto_pass_report` | Compress the run into a fixed-line receipt card: skill, mode, files and steps changed, items held, check verdicts | Saving to disk, quoting chapter prose, or changing the text based on the receipt |

For when the skills appear and which rule each step maps to, see [docs/plugin-flow.md](https://github.com/chengzhao-dev/dsh-quarto-book/blob/main/docs/plugin-flow.md). It is a human-facing walkthrough, not the rule source used while a skill runs.

Both skills are discovered from the package's `skills/` directory and loaded on demand. Relative paths inside a skill resolve against that skill's directory: `writing-quarto` uses `steps/`, `examples/`, `quarto/`, `scripts/`; `designing-theme` uses `references/`, `knowledge/`, `assets/`, `scripts/`.

## Install

```bash
dsh plugin --profile web add npm:@chengzhao-dev/dsh-quarto-book@0.4.1
```

Replace `--profile` with the profile you actually run. The desktop app always runs the `desktop` profile, and that profile is owned by the app, so `dsh --profile desktop` is rejected; install or upgrade a plugin with `dsh plugin --profile desktop add <package>`, and use the app's Settings → Plugins → Add plugin with `npm:@chengzhao-dev/dsh-quarto-book@0.4.1` only if the app refuses that write. To follow a GitHub tag instead, use `github:chengzhao-dev/dsh-quarto-book#v0.4.1`.

Upgrading from the old unscoped package `dsh-quarto-book` (removed from npm with 0.3.4, so this only affects profiles that installed it earlier): remove it from the same profile first with `dsh plugin --profile <profile> remove dsh-quarto-book`, then add the scoped package. Keeping both installed registers `writing-quarto` and `designing-theme` twice at the same rank 550.

Requires DSH 0.2.x and Node.js 22 or newer. The source is TypeScript; the published package already contains compiled `lib/`, so installation needs no build step. The content, link and naming checks need Python 3; `quarto_render_check` needs the Quarto CLI for an actual render, and the post-render HTML checks also need Python 3. See [docs/plugin-layout.md](https://github.com/chengzhao-dev/dsh-quarto-book/blob/main/docs/plugin-layout.md) for the split.

Installation is scoped to a profile, not to a repository: it only affects the profile that ran `add`. The workspace gate still decides whether the two skill names appear: it checks the session `cwd` for a book, and only then are both names selectable. See [docs/plugin-boundaries.md](https://github.com/chengzhao-dev/dsh-quarto-book/blob/main/docs/plugin-boundaries.md) for the six cases.

## Usage

Load `writing-quarto` or `designing-theme` inside a `type: book` repository and follow the steps in `SKILL.md`. The plugin has no resident process and does not execute a skill when a session starts; seeing a name in the skill catalog only means the session `cwd` passed the gate, and a use happens only when `skill`, `quarto_render_check` or `quarto_pass_report` is invoked. The next invocation rereads the skill text; the tool never retries automatically, so the user decides whether to call it again after a failure.

A project supplies exactly one skill of its own: `<book>/.agents/skills/quarto-book-project/`, starting from `templates/quarto-book-project/`. When it exists, both general skills read `SKILL.md` and then the `writing/` files it points to; when it does not, they skip it and do not guess project conventions. **Do not embed same-name skills into a book repository**: DSH picks one skill per name per layer by rank, lowest wins, and `.agents/skills` (rank 200) outranks the packaged provider (rank 550); a copy of `writing-quarto` or `designing-theme` in the book disables the plugin's text.

Theme assets live in `skills/designing-theme/assets/theme/`. The package copy is authoritative; the book's `theme/` is the render copy. When a copy exists, `designing-theme` edits only that copy, and only when the user explicitly asks to install the plugin theme into the book and the target directory does not exist yet does the skill copy from the package and write the `filters/answering-disclosure.lua` filter. `_quarto.yml` references only the book's copy, never an npm package or the plugin checkout.

Run the content and link checks from the `writing-quarto` skill directory:

```bash
python scripts/verifying-content.py --root <book>
python scripts/checking-links.py --root <book>
python scripts/checking-names.py --root <book>
```

Add `checking-names.py` only for a whole-repository refactor; ordinary chapter checks run the first two.

Callouts, HTML output and DOM contracts after a render are checked by `quarto_render_check`, which invokes the packaged scripts; do not run `checking-callouts.py`, `checking-output.py` or `checking-dom.py` by hand. `designing-theme`'s `scripts/checking-layout.py` inspects rendered HTML for overflow, contrast and page structure. `apply()` runs none of these and never runs `quarto render`.

At the end of a run, call `quarto_pass_report` once to print the receipt card; the card is the receipt, so do not repeat it in the reply.

## Documentation

| Document | Contents |
| --- | --- |
| [docs/plugin-flow.md](https://github.com/chengzhao-dev/dsh-quarto-book/blob/main/docs/plugin-flow.md) | The five layers from install to receipt, file routing and render order |
| [docs/plugin-boundaries.md](https://github.com/chengzhao-dev/dsh-quarto-book/blob/main/docs/plugin-boundaries.md) | The six workspace-gate cases and their decision order |
| [docs/plugin-layout.md](https://github.com/chengzhao-dev/dsh-quarto-book/blob/main/docs/plugin-layout.md) | Repository tree, published files and the Python/Quarto split |
| [docs/writing-quarto-layout.md](https://github.com/chengzhao-dev/dsh-quarto-book/blob/main/docs/writing-quarto-layout.md) | The writing skill's directory layers |
| [docs/versioning.md](https://github.com/chengzhao-dev/dsh-quarto-book/blob/main/docs/versioning.md) | Version numbers and release order |

## Local development

The source is TypeScript and the compiled `lib/` is committed. Published packages load `lib/` directly, so installation needs no build step. During development, link this checkout into the writing profile instead of copying skills into a book:

```bash
npm ci
npm test
npm run check
npm run pack
```

`npm test` builds before running the tool tests; `npm run check` runs type checking and the skill path self-check; `npm run pack` writes the tarball only into `temp/`, which `.gitignore` already covers. Development install:

```bash
dsh plugin --profile web add D:\Github\dsh-quarto-book
```

`SKILL.md`, `steps/`, `examples/` and `quarto/` are re-read on the next `skill` tool call, so no npm release is needed after an edit. Theme edits inside the package do not reach the book's HTML automatically; to see a page, sync the changed files into the book's `theme/` and run `quarto render` at the book root. Never point `_quarto.yml` at the plugin checkout — that path stops existing on another machine.

The plugin ships as a bundle: `package.json` points `dsh.bundle.patch` at `cordis.patch.yml`, and the patch inserts only `id: quarto-book` / `name: '@chengzhao-dev/dsh-quarto-book'`. The entry imports nothing from the host, so it loads under pnpm's strict dependency layout.

The legacy `scripts/embedding-agents.ps1` copies both skill trees verbatim into the target repository's `.agents/`, where they outrank the plugin (rank 200 vs 550). Do not use it for new books; run it only to archive a standalone skill tree offline, with the command from the script header.

## Licence

MIT. The bundled LXGW Bright and LXGW Bright Code fonts are used under the SIL Open Font License 1.1; upstream copyright notices and the full licence text are in `skills/designing-theme/assets/theme/assets/fonts/OFL.txt`.
