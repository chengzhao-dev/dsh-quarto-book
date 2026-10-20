# dsh-quarto-book

[English](README.en.md) | **简体中文**

为 [DeepSeek Harness](https://github.com/deepseek-ai)（DSH）提供两个技能：写 Quarto Book 章节，以及维护可复用的书主题。插件只读，不执行书里的代码，也不改写你的 `.qmd`；它只把写作约定、检查脚本和主题资产带进 Quarto Book 工作区。

## 两个技能

| 技能 | 用途 | 不做什么 |
| --- | --- | --- |
| `writing-quarto` | 新建或修改 `content/**/*.qmd`、`index.qmd`、`_quarto.yml`；章节骨架、中文行文、代码与图表、渲染验证 | 不改 CSS、字体和颜色 |
| `designing-theme` | 调整主题的 CSS、SCSS、字体、palette、导航与 Callout 样式 | 不改章节正文 |

两个技能都从包内 `skills/` 目录发现，按需加载；技能里的相对路径以技能目录为基准解析：`writing-quarto` 用 `steps/`、`examples/`、`quarto/`、`scripts/`，`designing-theme` 用 `references/`、`knowledge/`、`assets/`、`scripts/`。

## 安装

```bash
dsh plugin --profile web add github:chengzhao-dev/dsh-quarto-book
```

`--profile` 换成你实际运行的那个 profile。桌面应用固定跑 `desktop` profile，且该 profile 由应用独占管理，命令行 `add` 会被拒绝；在应用里走「设置 → 插件 → 添加插件」填同样的地址即可。

要求 DSH 0.2.x、Node.js 22 及以上。插件是纯 JavaScript，没有构建步骤。

安装单位是 profile，不是仓库：只影响执行 `add` 的那个 profile。装好之后还要过下面的工作区门禁，目录里才会出现这两个技能名。

## 工作区门禁

`apply()` 只注册技能 provider，不扫描、不写文件。`list({ cwd })` 决定这一次会话能不能看见两个技能：

- 从会话 `cwd` 向上找到 git 根，沿途目录的 `_quarto.yml` 里只要有独立的一行 `type: book`，就返回这两个技能；否则返回空列表。
- 没有 `cwd`、不在 git checkout 里、`_quarto.yml` 缺失，或者只在注释里写了 `# type: book`，都按「不是书」处理。
- 所以普通 C++ 仓库和本插件仓库自己的会话里不会出现这两个名字；书仓库的子目录会话与书根会话一样生效。
- 门禁只影响目录与加载，不影响已经加载的技能正文；`get()` 仍只服务本 provider 的 candidate。

社区插件没有「只对某个 GitHub 仓库启用」的开关，profile 安装加 cwd 门禁就是最小范围。想更窄，就只把它装进写书用的那个 profile。

## 项目级约定

通用技能不知道某一本书的书名、章节表、技术栈和术语。项目只放这一份自己的技能：

```text
<book>/.agents/skills/quarto-book-project/
├── SKILL.md            # 项目约定：书名、读者、术语、渲染与检查命令、主题与过滤器路径
└── writing         #/ 章节对照：文件名与标题
    └── chapter-map.md  # 章节表：文件名、类章或能力章、title、二级标题
```

模板见 `templates/quarto-book-project/`。存在时，两个通用技能会先读 `SKILL.md`，再按它指向的 `writing/` 文件读章节对照；不存在就跳过，不猜测项目约定。通用写法、结构和主题规则留在插件里，不复制进项目技能。

**不要把同名技能嵌进书仓库。** DSH 在同一个技能层里按 rank 取一个，数字小的赢：`.agents/skills`（rank 200）优先于插件（rank 550）。书里再放 `writing-quarto` 或 `designing-theme`，插件正文就不会生效，还会把两套通用写法带进项目。

## 主题

主题资产在 `skills/designing-theme/assets/theme/`：

```text
assets/theme/
├── assets/           #/ brand mark、favicon、字体与 OFL 许可
├── css/              #/ base、content、nav、sidebar、callouts、code、mermaid…
├── includes/         #/ 字体与页脚片段
└── palettes/github/  #/ light/dark SCSS、highlight theme、tokens.css
```

Quarto 只读书里的相对路径，不读 npm 包，也不读 DSH profile。书要渲染时使用书根下的 `theme/` 副本，`_quarto.yml` 也只引用这份副本：

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

插件包内 `assets/theme/` 是权威来源，书内 `theme/` 是渲染副本。已有副本时，`designing-theme` 只改副本。只有用户明确要求「把插件主题装进这本书」且目标目录还不存在时，才从插件复制过去，并同时写入过滤器 `filters/answering-disclosure.lua`；已存在的 `_quarto.yml` 只追加还没有的路径，不整文件替换。

## 校验脚本

`writing-quarto` 自带一组 Python 脚本。在 `writing-quarto` 技能目录下运行（安装后位于插件的 `skills/writing-quarto/`）：

```bash
python scripts/verifying-content.py --root <book>
python scripts/checking-links.py --root <book>
python scripts/checking-callouts.py --root <book>
python scripts/checking-output.py --root <book>
python scripts/checking-names.py --root <book>
```

`verifying-content.py` 检查标题层级与字数、正文篇幅、禁用措辞、代码围栏、本地链接和章节表一致性。项目专属检查只在 `.agents/skills/quarto-book-project/` 存在时启用；不存在时跳过，不把别的书的章节名当成规则。

`designing-theme` 自带 `scripts/checking-layout.py`，在渲染后的 HTML 上检查溢出、对比度和页面结构；`scripts/measuring-pages.mjs` 用于测量正文列宽。

`apply()` 不在加载时跑这些脚本，也不跑 `quarto render`。校验由技能正文的完成判据触发，发生在用户要求写章节或改主题之后。

## 包结构

```text
dsh-quarto-book/
├── .gitattributes                # 行尾与编码规则
├── .gitignore                    # 被忽略的构建产物
├── .npmignore                    # 不打进包的文件
├── LICENSE                       # MIT 许可
├── README.en.md                  # 英文说明
├── README.md                     # 中文说明
├── cordis.patch.yml              # 宿主补丁仅一行插入
├── docs                      #/ 设计说明与发布规则
│   ├── creation-references.md    # 设计来源
│   ├── versioning.md             # 版本与发布
│   └── writing-quarto-layout.md  # 技能目录分层
├── icon.svg                      # 插件图标
├── lib                       #/ 插件代码
│   └── index.js                  # 注册两个技能的入口，rank 550
├── locale                    #/ 界面文案
│   ├── en.json                   # 英文
│   └── zh.json                   # 中文
├── package-lock.json             # 依赖锁
├── package.json                  # 包清单
├── scripts                   #/ 仓库脚本
│   ├── checking-skill-links.mjs  # 技能自检
│   └── embedding-agents.ps1      # 技能装机脚本
├── skills                    #/ 两个技能
│   ├── designing-theme       #/ 主题技能
│   │   ├── SKILL.md              # 入口
│   │   ├── assets                # 主题资产与字体
│   │   ├── knowledge             # 阅读面说明
│   │   ├── references            # 主题规则
│   │   └── scripts               # 布局检查
│   └── writing-quarto        #/ 写作技能
│       ├── SKILL.md              # 九步入口
│       ├── examples              # 正反例
│       ├── quarto                # 渲染层约定
│       ├── scripts               # 内容检查
│       └── steps                 # 九步正文
└── templates                 #/ 项目技能模板
    └── quarto-book-project   #/ 书内项目技能
        ├── SKILL.md              # 项目约定模板
        └── writing           #/ 章节对照
            └── chapter-map.md    # 章节表模板
```

`templates/` 不在 `skills/` 下，不会被注册。技能的目录分层见 `docs/writing-quarto-layout.md`，版本与发布规则见 `docs/versioning.md`。

## 本地开发

纯 JavaScript，没有构建。开发时把本仓库链接进写书用的 profile，而不是把技能复制进书：

```bash
dsh plugin --profile web add D:\Github\dsh-quarto-book
```

`SKILL.md`、`steps/`、`examples/`、`quarto/` 在下一次 `skill` 工具调用时重读，改完不用发 npm。包内主题改动不会自动进书的 HTML；要看页面效果，把改过的文件同步到书的 `theme/`，再在书根 `quarto render`。不要把 `_quarto.yml` 指到插件检出目录，那条路径换机器就不存在。

```bash
npm run check        # node --check lib/index.js && node scripts/checking-skill-links.mjs
npm run pack:check   # npm pack --dry-run
```

插件以 bundle 形式发布：`package.json` 的 `dsh.bundle.patch` 指向 `cordis.patch.yml`，补丁只插入 `id: quarto-book`、`name: dsh-quarto-book` 一行。入口不 import 宿主实现，因此在 pnpm 的严格依赖布局下也能加载。

## 嵌入到另一本书（不推荐）

`scripts/embedding-agents.ps1` 是旧形态的维护工具，会把两棵技能原样复制进目标仓库的 `.agents/`。复制后书里会出现与插件同名的技能，按 rank 200 盖住插件（rank 550），插件更新也不再生效。

新书不要用它：书里只放 `.agents/skills/quarto-book-project/`，其余交给已安装的插件。只有需要离线归档一份独立技能树时才执行：

```powershell
pwsh -File scripts/embedding-agents.ps1 -Target D:\Github\my-book
```

脚本拒绝复制 `package.json`、`cordis.patch.yml`、`lib/`、`locale/` 和 `icon.svg`，避免把插件清单带进书仓库。

## 许可

MIT。主题内的 LXGW Bright 与 LXGW Bright Code 按 SIL Open Font License 1.1 使用；上游版权声明与许可全文在 `skills/designing-theme/assets/theme/assets/fonts/OFL.txt`。
