# 插件目录与运行环境

仓库里同时放源码、技能和发布产物；只有一部分会进 npm 包。下面只列维护时常用的入口，`README*`、`LICENSE`、`tsconfig.json` 与 `.github/` 等常规文件不展开。

```text
dsh-quarto-book/
├── .editorconfig            # 编辑器统一编码与行尾
├── .gitattributes           # Git 统一文本行尾
├── cordis.patch.yml         # 宿主补丁：注册技能与工具
├── docs/                   #/ 维护说明
├── icon.svg                 # 插件图标
├── lib/                    #/ 编译产物
│   ├── index.js             # 注册入口
│   └── tools/              #/ 编译后的工具代码
├── locale/                 #/ 界面文案
├── package.json             # 包清单与发布白名单
├── scripts/                #/ 仓库脚本
├── skills/                 #/ 两个技能
│   ├── designing-theme/    #/ 主题技能
│   └── writing-quarto/     #/ 写作技能
├── src/                    #/ TypeScript 源码
│   ├── index.ts             # 插件入口：注册技能与工具
│   └── tools/              #/ 工具源码
├── templates/              #/ 项目技能模板
└── tests/                  #/ 工具测试
```

安装与加载需要 Node.js 22 与 DSH 0.2.x；`src/`、`tests/`、`scripts/` 和 `docs/` 都不进 npm 包，发布包加载编译后的 `lib/`。

发布包内容由 `package.json` 的 `files` 白名单决定，根 `.npmignore` 对白名单里的目录不生效：白名单列出 `skills` 后，技能目录下的文件会整棵进包。Python 缓存因此要在白名单里显式排除（`!**/__pycache__`、`!**/*.pyc`），`scripts/checking-skill-links.mjs` 也会在技能目录出现 `__pycache__` 或 `.pyc` 时报错。

内容、链接、命名与混排检查（`verifying-content.py`、`checking-links.py`、`checking-names.py`、`checking-prose.py`）需要 Python 3。`quarto_render_check` 在 `dry_run: false` 时还要 Quarto CLI，渲染后的 HTML 检查同样需要 Python 3。

`skills/writing-quarto/quarto/` 下的 `comments.md`、`encoding.md`、`prose.md` 与 `readability.md` 分别管注释写法、编码与行尾、中英混排与润色、新人可读性与任务完整性；`figures.md` 是图注、图前句与原生 HTML/SVG 图的唯一权威，`coords.md` 与 `mermaid.md` 只保留各自图类的生成细节并回指它。C++ 工程的行尾与编译选项由 `dsh-cpp-workflow` 维护，本插件不复制它的规则；两侧都以各自仓库根的 `.gitattributes` 与 `.editorconfig` 为准。

## 放置规则

| 要放的东西 | 位置 | 谁读它 |
| --- | --- | --- |
| 写作规则 | `skills/writing-quarto/steps/` | 技能加载时按步读，一步一个文件 |
| 正反例 | `skills/writing-quarto/examples/` | 判不准时才打开，与 step 同号 |
| 渲染层约定 | `skills/writing-quarto/quarto/` | 排图、查渲染错误、全仓重构时 |
| 整书次序与 token 预算 | `skills/writing-quarto/references/` | 整书规划或判断文件超限时 |
| 可机器判定的规则 | `skills/writing-quarto/scripts/` 与同目录测试 | 检查命令与回归用例 |
| 主题资产 | `skills/designing-theme/assets/theme/` | 主题技能与书内副本 |
| 工具源码与产物 | `src/`、`lib/` | 构建与宿主加载 |
| 维护说明 | `docs/` | 维护者；不进 npm 包 |
| 项目技能模板 | `templates/quarto-book-project/` | 新书复制后填写 |
| 发布边界 | `package.json` 的 `files` | npm 打包 |

三条不变量：一条规则只在一个 step 成文，`docs/` 只解释不复述条文；能机器判定的规则同时进脚本与测试，正文只写调用方式；发布只带 `files` 白名单，`docs/`、`src/`、`tests/` 与 `scripts/` 不随包安装。技能 Markdown 的单文件与总量上限由 `references/token-budget.md` 定，`npm run check` 的 `checking-skill-budget.mjs` 执行。

技能的目录分层见 `writing-quarto-layout.md`，版本与发布规则见 `versioning.md`。
