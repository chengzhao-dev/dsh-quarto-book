# 插件目录与运行环境

仓库里同时放源码、技能和发布产物；只有一部分会进 npm 包。下面只列维护时常用的入口，`README*`、`LICENSE`、`tsconfig.json` 与 `.github/` 等常规文件不展开。

```text
dsh-quarto-book/
├── .editorconfig                       # 编辑器统一编码与行尾
├── .gitattributes                      # Git 统一文本行尾
├── cordis.patch.yml                    # 宿主补丁
├── docs                            #/ 维护说明
├── icon.svg                            # 插件图标
├── lib                             #/ 编译产物
│   ├── index.js                        # 注册入口
│   └── tools                       #/ 两个工具
├── locale                          #/ 界面文案
├── package.json                        # 包清单
├── scripts                         #/ 仓库脚本
├── skills                          #/ 两个技能
│   ├── designing-theme             #/ 主题技能
│   └── writing-quarto              #/ 写作技能
├── src                             #/ TypeScript 源码
│   ├── index.ts                        # 插件入口
│   └── tools                       #/ 工具实现
├── templates                       #/ 项目技能模板
└── tests                           #/ 工具测试
```

安装与加载需要 Node.js 22 与 DSH 0.2.x；`src/`、`tests/`、`scripts/` 和 `docs/` 都不进 npm 包，发布包加载编译后的 `lib/`。

内容、链接、命名与混排检查（`verifying-content.py`、`checking-links.py`、`checking-names.py`、`checking-prose.py`）需要 Python 3。`quarto_render_check` 在 `dry_run: false` 时还要 Quarto CLI，渲染后的 HTML 检查同样需要 Python 3。

`skills/writing-quarto/quarto/` 下的 `comments.md`、`encoding.md`、`prose.md` 与 `readability.md` 分别管注释写法、编码与行尾、中英混排与润色、新人可读性与任务完整性。C++ 工程的行尾与编译选项由 `dsh-cpp-workflow` 维护，本插件不复制它的规则；两侧都以各自仓库根的 `.gitattributes` 与 `.editorconfig` 为准。

技能的目录分层见 `writing-quarto-layout.md`，版本与发布规则见 `versioning.md`。
