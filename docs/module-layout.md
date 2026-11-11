# 模块布局

本文件是仓库文件位置的唯一清单：新增或移动文件时先改这里，再改实现。架构说明见 `architecture.md`，触发与分流见 `triggering.md`。

命名规则：

- 技能根固定为 `SKILL.md`、`steps/`、`scripts/`；有先后的文件加两位数字前缀，案例统一用两位数字前缀并按章内阅读顺序编号。
- 同一事实只在一处成文；旧路径不留转述页。
- `examples/` 下不再建子目录。
- 篇幅上限见 `skills/writing-quarto/token-budget.md`。

```text
├── .editorconfig                                                 # 文件
├── .gitattributes                                                # 文件
├── .github/                                                     #/ 目录
│   ├── creation-references.md                                    # 文件
│   └── workflows/                                               #/ 目录
│       ├── ci.yml                                                # 文件
│       └── publish.yml                                           # 文件
├── .gitignore                                                    # 文件
├── .npmignore                                                    # 文件
├── LICENSE                                                       # 文件
├── README.en.md                                                  # 文件
├── README.md                                                     # 文件
├── cordis.patch.yml                                              # 文件
├── docs/                                                        #/ 目录
│   ├── architecture.md                                           # 文件
│   ├── module-layout.md                                          # 文件
│   ├── plugin-boundaries.md                                      # 文件
│   ├── plugin-flow.md                                            # 文件
│   ├── plugin-layout.md                                          # 文件
│   ├── triggering.md                                             # 文件
│   └── versioning.md                                             # 文件
├── icon.svg                                                      # 文件
├── lib/                                                         #/ 目录
│   ├── index.js                                                  # 文件
│   ├── tools/                                                   #/ 目录
│   │   ├── pass-report.js                                        # 文件
│   │   └── render-check.js                                       # 文件
│   └── workspace.js                                              # 文件
├── locale/                                                      #/ 目录
│   ├── en.json                                                   # 文件
│   └── zh.json                                                   # 文件
├── package-lock.json                                             # 文件
├── package.json                                                  # 文件
├── scripts/                                                     #/ 目录
│   ├── checking-github-workflows.mjs                             # 文件
│   ├── checking-lib.mjs                                          # 文件
│   ├── checking-package.mjs                                      # 文件
│   ├── checking-skill-budget.mjs                                 # 文件
│   ├── checking-skill-links.mjs                                  # 文件
│   └── embedding-agents.ps1                                      # 文件
├── skills/                                                      #/ 目录
│   ├── designing-theme/                                         #/ 目录
│   │   ├── SKILL.md                                              # 文件
│   │   ├── assets/                                              #/ 目录
│   │   │   └── theme/                                           #/ 目录
│   │   │       ├── assets/                                      #/ 目录
│   │   │       │   └── fonts/                                   #/ 目录
│   │   │       │       ├── OFL.txt                               # 文件
│   │   │       │       ├── lxgw-bright-code-common.woff2         # 文件
│   │   │       │       └── lxgw-bright-medium-common.woff2       # 文件
│   │   │       ├── css/                                         #/ 目录
│   │   │       │   ├── base.css                                  # 文件
│   │   │       │   ├── callouts.css                              # 文件
│   │   │       │   ├── code.css                                  # 文件
│   │   │       │   ├── content.css                               # 文件
│   │   │       │   ├── fonts.css                                 # 文件
│   │   │       │   ├── landing.css                               # 文件
│   │   │       │   ├── mermaid.css                               # 文件
│   │   │       │   ├── nav.css                                   # 文件
│   │   │       │   ├── sidebar.css                               # 文件
│   │   │       │   └── tokens.css                                # 文件
│   │   │       ├── includes/                                    #/ 目录
│   │   │       │   ├── fonts.html                                # 文件
│   │   │       │   ├── footer.html                               # 文件
│   │   │       │   └── palette.html                              # 文件
│   │   │       └── palettes/                                    #/ 目录
│   │   │           ├── flexoki/                                 #/ 目录
│   │   │           │   ├── brand-mark.svg                        # 文件
│   │   │           │   ├── favicon-dark.svg                      # 文件
│   │   │           │   ├── favicon-light.svg                     # 文件
│   │   │           │   ├── highlight-dark.theme                  # 文件
│   │   │           │   ├── highlight-light.theme                 # 文件
│   │   │           │   ├── meta.md                               # 文件
│   │   │           │   ├── theme-dark.scss                       # 文件
│   │   │           │   ├── theme-light.scss                      # 文件
│   │   │           │   └── tokens.css                            # 文件
│   │   │           ├── hill-light/                              #/ 目录
│   │   │           │   ├── brand-mark.svg                        # 文件
│   │   │           │   ├── favicon-dark.svg                      # 文件
│   │   │           │   ├── favicon-light.svg                     # 文件
│   │   │           │   ├── meta.md                               # 文件
│   │   │           │   ├── syntax.css                            # 文件
│   │   │           │   └── tokens.css                            # 文件
│   │   │           └── solarized/                               #/ 目录
│   │   │               ├── brand-mark.svg                        # 文件
│   │   │               ├── favicon-dark.svg                      # 文件
│   │   │               ├── favicon-light.svg                     # 文件
│   │   │               ├── highlight-dark.theme                  # 文件
│   │   │               ├── highlight-light.theme                 # 文件
│   │   │               ├── meta.md                               # 文件
│   │   │               ├── syntax.css                            # 文件
│   │   │               ├── theme-dark.scss                       # 文件
│   │   │               ├── theme-light.scss                      # 文件
│   │   │               └── tokens.css                            # 文件
│   │   ├── scripts/                                             #/ 目录
│   │   │   ├── checking-layout.py                                # 文件
│   │   │   └── measuring-pages.mjs                               # 文件
│   │   └── theme/                                               #/ 目录
│   │       ├── 01-reading-surface.md                             # 文件
│   │       ├── 02-theme-spine.md                                 # 文件
│   │       └── 03-theme-system.md                                # 文件
│   └── writing-quarto/                                          #/ 目录
│       ├── SKILL.md                                              # 文件
│       ├── quarto/                                              #/ 目录
│       │   ├── 01-basics.md                                      # 文件
│       │   ├── 02-encoding.md                                    # 文件
│       │   ├── 03-authoring.md                                   # 文件
│       │   ├── 04-comments.md                                    # 文件
│       │   ├── 05-fence-semantics.md                             # 文件
│       │   ├── 06-crossrefs.md                                   # 文件
│       │   ├── 07-terminal.md                                    # 文件
│       │   ├── 08-tables.md                                      # 文件
│       │   ├── 09-figures.md                                     # 文件
│       │   ├── 10-coords.md                                      # 文件
│       │   ├── 11-mermaid.md                                     # 文件
│       │   ├── 12-quarto-render.md                               # 文件
│       │   └── examples/                                        #/ 目录
│       │       └── 01-qmd-elements.md                            # 文件
│       ├── scripts/                                             #/ 目录
│       │   ├── answering-disclosure.lua                          # 文件
│       │   ├── checking-callouts.py                              # 文件
│       │   ├── checking-dom.py                                   # 文件
│       │   ├── checking-links.py                                 # 文件
│       │   ├── checking-names.py                                 # 文件
│       │   ├── checking-output.py                                # 文件
│       │   ├── checking-prose.py                                 # 文件
│       │   ├── diagrams/                                        #/ 目录
│       │   │   └── rendering-coords.py                           # 文件
│       │   ├── testing-check-ascii-names.py                      # 文件
│       │   ├── testing-content.py                                # 文件
│       │   └── verifying-content.py                              # 文件
│       ├── steps/                                               #/ 目录
│       │   ├── 01-task.md                                        # 文件
│       │   ├── 02-structure.md                                   # 文件
│       │   ├── 03-blocks.md                                      # 文件
│       │   ├── 04-paragraphs.md                                  # 文件
│       │   ├── 05-sentences.md                                   # 文件
│       │   ├── 06-wording.md                                     # 文件
│       │   ├── 07-layout.md                                      # 文件
│       │   ├── 08-reread.md                                      # 文件
│       │   └── 09-check.md                                       # 文件
│       ├── token-budget.md                                       # 文件
│       └── writing/                                             #/ 目录
│           ├── 01-operations.md                                  # 文件
│           ├── 02-priority.md                                    # 文件
│           ├── 03-book-journey.md                                # 文件
│           ├── 04-personas.md                                    # 文件
│           ├── 05-readability.md                                 # 文件
│           ├── 06-prose.md                                       # 文件
│           ├── 07-refactor.md                                    # 文件
│           └── examples/                                        #/ 目录
│               ├── 01-language-scope.md                          # 文件
│               ├── 02-structure-shape.md                         # 文件
│               ├── 03-excerpt-lead.md                            # 文件
│               ├── 04-paragraph-opening.md                       # 文件
│               ├── 05-block-after.md                             # 文件
│               ├── 06-paragraph-cases.md                         # 文件
│               ├── 07-sentence-frame.md                          # 文件
│               ├── 08-sentence-reference.md                      # 文件
│               ├── 09-sentence-brevity.md                        # 文件
│               ├── 10-wording-cases.md                           # 文件
│               ├── 11-layout-list.md                             # 文件
│               └── 12-appendix.md                                # 文件
├── src/                                                         #/ 目录
│   ├── index.ts                                                  # 文件
│   ├── tools/                                                   #/ 目录
│   │   ├── pass-report.ts                                        # 文件
│   │   └── render-check.ts                                       # 文件
│   └── workspace.ts                                              # 文件
├── templates/                                                   #/ 目录
│   └── quarto-book-project/                                     #/ 目录
│       ├── SKILL.md                                              # 文件
│       ├── checks.json                                           # 文件
│       └── writing/                                             #/ 目录
│           └── chapter-map.md                                    # 文件
├── tests/                                                       #/ 目录
│   ├── checking-dom.test.mjs                                     # 文件
│   ├── checking-links.test.mjs                                   # 文件
│   ├── checking-names.test.mjs                                   # 文件
│   ├── checking-prose.test.mjs                                   # 文件
│   ├── pass-report.test.mjs                                      # 文件
│   ├── provider.test.mjs                                         # 文件
│   ├── render-check.test.mjs                                     # 文件
│   ├── schema.test.mjs                                           # 文件
│   ├── skill-budget.test.mjs                                     # 文件
│   └── verifying-content.test.mjs                                # 文件
└── tsconfig.json                                                 # 文件
```
