# 插件目录与运行环境

仓库里同时放源码、技能和发布产物；只有一部分会进 npm 包。下面只列维护时常用的入口，`README*`、`LICENSE`、`tsconfig.json` 与 `.github/` 等常规文件不展开。

```text
dsh-quarto-book/
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

内容、链接与命名检查（`verifying-content.py`、`checking-links.py`、`checking-names.py`）需要 Python 3。`quarto_render_check` 在 `dry_run: false` 时还要 Quarto CLI，渲染后的 HTML 检查同样需要 Python 3。

`skills/writing-quarto/quarto/` 下的 `comments.md`、`encoding.md` 与 `prose.md` 分别管注释写法、编码与行尾、中英混排与润色；`skills/building-cpp/references/encoding.md` 管 C++ 工程的同一组机器规则。几处都只写各自文件类型，不互相复述。

技能的目录分层见 `writing-quarto-layout.md`，版本与发布规则见 `versioning.md`。
