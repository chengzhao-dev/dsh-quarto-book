# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project adheres
to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-10-18

### Added

- `quarto_book_audit` host tool: reads `_quarto.yml`, validates the chapter tree,
  scans chapter headings, and returns structured JSON plus a Markdown report.
- Heading checks: level skips, start level, multiple/duplicate H1, duplicate
  headings, empty sections, relative-position wording, hand-written numbers,
  trailing punctuation, and depth beyond `format.html.toc-depth`.
- Book checks: missing config or chapters, parse errors, non-book projects,
  empty parts, duplicate entries, paths outside the root, and unlisted qmd files.
- Bundled dependency-free `yaml-lite` parser used when `js-yaml` is unavailable.
- `quarto-book` skill with a heading-reorganization workflow and three
  references (heading rules, reorganization procedure, Chinese prose style).
- Additive DSH integration: `dsh.bundle.patch`, `cordis.patch.yml`, and
  `dsh.plugin.json`; no official rows are replaced or disabled.
- Tests for the YAML subset, audit fixtures, manifest/patch wiring, and plugin
  registration through mock `tools`/`skills` contexts.
- Chinese and English READMEs.

[0.1.0]: https://github.com/chengzhao-dev/dsh-quarto-book/releases/tag/v0.1.0
