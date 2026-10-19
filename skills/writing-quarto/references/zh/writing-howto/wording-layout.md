# 写作 how：定用词与定版式

术语、语气与版式降噪的步骤 how。

## 定用词：术语要稳

- 动词选用与主动语态判定见`conventions/writing/chinese-quality.md` 的知识文件；「由 X 完成」在这一步改成主动句，改完露出第二个核就退回定段落。
- 「同一概念只使用一个称呼」的判定见`conventions/writing/chinese-quality.md` 的知识文件；英文标识保持大小写。
- 无信息修饰的删除判定见`conventions/writing/chinese-quality.md` 的知识文件；禁用词以 `scripts/verifying-content.py` 词表为准。
- 连续出现三个「的」时的改写判定见`conventions/writing/chinese-quality.md` 的知识文件「不拗口」。
- 正文提及枚举类型与成员函数时写源码完整标识符（`Result`、`Game::Place`），不设「概念简称」层；架构层名首次出现用一句可观察行为定义；讲读写路径第一句写屏幕上或调用处发生什么。下一句点名类型与函数。再下一句写边界（对照见`knowledge/cases/chinese-style/language-scope.md`「零基础可懂的读写路径与层名定义」）。
- 枚举成员的含义写在源码行尾注释里，正文不复述成释义列表或释义段；正文只写谁调用、如何验收、与邻章关系（规则见 `chapter-writing.md`「叙事范围」）。
- C++ 概念点名按知识 `conventions/writing/chinese-quality.md` 用词；读者侧禁用行见知识 `conventions/writing/chinese-quality.md`；语气判定与口语腔、公文腔的正向标准见`conventions/writing/chinese-voice-register.md`。

## 定版式：格式要降噪

- 行内代码与平台名词的版式判定见`conventions/writing/section-density/main-line.md` 的知识文件。
- 可复制命令使用指定语言的代码围栏；命令与输出分开的判定见`conventions/writing/section-density/main-line.md` 的知识文件。
- 标题与导航不用行内代码的判定见`conventions/writing/section-density/main-line.md` 的知识文件；中英文之间的空格见`conventions/writing/chinese-quality.md` 的知识文件。
- 列表用于并列或顺序关系，选择判定见`conventions/writing/list-craft.md` 的知识文件「列表选择」。表格只用于需要对多个属性进行比较的内容：同一主题的属性合并成一张表，不按小节拆成多张薄表；只有一两列信息或右侧大量留白时改用句子或列表。列表是版式选择，不是新的一段说明。
- Callout 只承载可跳过提示的判定见`conventions/writing/qmd-element-cases/layout-cases.md` 的知识文件。

具体元素写法见 `references/quarto/authoring.md`，终端步骤见 `references/quarto/terminal-validation.md`。
