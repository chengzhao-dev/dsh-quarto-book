# dsh-quarto-book

Quarto 图书的**标题重排**与**结构审计**插件，面向 [DeepSeek Harness](https://github.com/deepseek-ai)（DSH）。

它把“重排一章的标题”从一次性手工操作变成可复用的工作流：先审计，再按目标目录移动整节，最后渲染校验。插件只读，不执行书里的代码，也不改写任何文件。

## 两个能力

| 能力 | 类型 | 作用 |
| --- | --- | --- |
| `quarto-book` | Skill | 标题层级规则、整节重排步骤、中文技术文风、Quarto 图书结构 |
| `quarto_book_audit` | Tool | 读取 `_quarto.yml`，核对章节树与每章标题，输出 JSON + Markdown |

两者都是增量贡献：`cordis.patch.yml` 只插入一行，不修改、禁用或替换任何官方行。

## 安装

本地目录（当前仓库）：

```powershell
dsh plugin --profile desktop add D:\Github\dsh-quarto-book
```

发布到 npm 后：

```powershell
dsh plugin --profile desktop add dsh-quarto-book
```

安装后重启 DSH 会话。验证行已进入组合配置：

```powershell
dsh --profile desktop --dump-config | Select-String -Pattern 'quarto-book' -Context 1,2
```

应看到：

```yaml
# == dsh-quarto-book
- id: quarto-book
  name: dsh-quarto-book
```

## 使用

### 技能

DSH 启动后，`quarto-book` 会出现在技能目录中。直接提出任务即可，例如：

```text
用 quarto-book 技能，把 content/tictactoe/03-board.qmd 的标题按下面的目标树重排：
## 棋盘的类型
  ### 棋盘格子坐标
  ### 棋盘格子类型
## 棋盘成员
  ...
```

技能会要求先审计、写目标目录、整节移动、只修接缝，最后渲染与全量检查。

### 工具

```json
{
  "root": "D:\\Github\\cpp-board-games",
  "includeUnlisted": true,
  "maxIssues": 200
}
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `root` | string | 含 `_quarto.yml` 的书根；相对路径按会话工作目录解析；缺省为工作目录 |
| `includeUnlisted` | boolean | 额外列出存在但未写入 `book.chapters` 的 qmd |
| `maxIssues` | integer | 问题上限，1–500，默认 200 |

返回 `{ json, markdown }`。`json` 适合后续处理，`markdown` 直接展示。真实书的输出示例：

```json
{
  "ok": true,
  "book": { "title": "C++ 棋盘游戏实践", "projectType": "book" },
  "summary": { "chapters": 12, "headings": 111, "errors": 0, "warnings": 0, "infos": 0 },
  "issues": []
}
```

### 审计规则

| code | 级别 | 触发条件 |
| --- | --- | --- |
| `missing-config` | error | 找不到 `_quarto.yml` / `_quarto.yaml` |
| `config-parse-error` | error | YAML 无法解析（宽松扫描章节作为兜底） |
| `missing-chapter` | error | 章节路径不存在或不可读 |
| `not-book-project` | warning | `project.type` 不是 `book` |
| `missing-book` / `no-chapters` | error | 没有 `book:` 段或章节列表为空 |
| `empty-part` | warning | `part` 下没有章节 |
| `chapter-outside-root` | warning | 章节路径指向书根之外 |
| `duplicate-chapter` | warning | 同一章节在配置里出现多次 |
| `heading-level-skip` | warning | 标题层级跳跃，如 H2 → H4 |
| `heading-start-level` | warning | 章内第一个标题深于 H2 |
| `multiple-h1` | warning | 一章多个 H1 |
| `duplicate-heading` | warning | 同章重复标题 |
| `empty-section` | warning | 标题后没有正文直到下一个同级标题 |
| `heading-relative-reference` | warning | 标题含“上一节/下一节/如前所述” |
| `heading-manual-number` | info | 标题手写编号，如 `1.1 安装` |
| `heading-trailing-punctuation` | warning | 标题以 `。！？；，、` 结尾 |
| `heading-beyond-toc-depth` | info | 标题深于 `format.html.toc-depth` |
| `unlisted-qmd` | info | 存在未列入配置的 qmd（需 `includeUnlisted`） |

`ok` 仅在存在 error 时为 `false`；warning 不阻断渲染。

## 设计

- **只读**：工具只读文件、不写文件、不运行 `quarto render`，也不执行书内代码。
- **零运行时依赖**：优先使用环境里的 `js-yaml`；没有时退回内置 `src/yaml-lite.js`，覆盖 `_quarto.yml` 需要的映射、序列、行内集合、块标量和引号/注释。
- **标题扫描**：跳过 YAML frontmatter、反引号/波浪线围栏、HTML 注释和 4 空格缩进代码，剥离 `{#id}` 属性后再做重复与层级判断。
- **部落地页**：`- part: path/to/index.qmd` 被计为已列入页面，不会误报为“未列入章节”。
- **可诊断**：每个问题带 `severity`、`code`、`path`、可选 `line` 和中文说明。

### 参考的 DSH 插件约定

实现对齐已安装插件的公开结构，并参考插件市场下载量靠前的项目：

- [dsh-gitbash-shell](https://github.com/KannaKuron/dsh-gitbash-shell)：`dsh.bundle.patch` + 增量 `insert` 行，绝不改动官方行。
- [dsh-market](https://github.com/dsh-market/dsh-market)：`dsh.plugin.json` 清单与市场元数据。
- [dsh-code-review](https://github.com/f-e-n-g-0531/dsh-code-review)：`ctx.tools.register` + `output.schema` / `output.render`。
- [dsh-skills-manager](https://github.com/MichengAI/dsh-skills-manager)：`ctx.skills.registerProvider` 的候选与 `get` 结构。
- [插件市场索引](https://dsh.works/awesome-dsh-plugins/market/index.json)：按下载/星标靠前插件的能力组织方式（`@liustack/modlens`、`dsh-better-sidebar`、`dsh-mnemon` 等）。

本插件是纯宿主能力，不含 Web 客户端，因此不注册 UI 插槽。

## 兼容性

| 项 | 要求 |
| --- | --- |
| Node.js | ≥ 22 |
| DSH | ≥ 0.1.7-rc（`engines.dsh`） |
| 平台 | 任意（纯 Node，路径按平台解析） |

## 开发

```powershell
npm test          # 27 个测试，逐文件在进程内运行
npm run test:runner  # 标准 node --test（需要能 spawn 子进程的环境）
npm pack --dry-run   # 检查发布内容
```

`npm test` 逐文件执行，是为了在受限沙箱里避开 `node --test` 的子进程 `spawn EPERM`；在普通终端两者等价。

目录：

```text
src/index.js             插件入口：注册工具与技能 provider
src/audit.js             图书审计与标题扫描
src/yaml-lite.js         无依赖 YAML 子集解析
assets/skills/quarto-book/  技能与三份参考文档
test/                    单元、夹具、插件装载测试
cordis.patch.yml         增量插入 quarto-book 行
dsh.plugin.json          市场/宿主清单
```

## 真实用例

在 `D:\Github\cpp-board-games` 上执行：

```text
chapters: 12, headings: 111, errors: 0, warnings: 0, infos: 0, unlisted: 0
```

`content/tictactoe/03-board.qmd` 的标题树与目标结构一致：`棋盘的类型` 只保留坐标/类型两个 H3，成员查询移入 `棋盘成员`，`判定终局` 聚合四个 H3。审计没有再报告相对位置标题、空节或层级跳跃。

## License

MIT。见 [LICENSE](LICENSE)。变更记录见 [CHANGELOG.md](CHANGELOG.md)。

---

English: [README.en.md](README.en.md)
