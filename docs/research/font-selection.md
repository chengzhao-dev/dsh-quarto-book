# 字体选型：候选、实测与决定

本文件记录 2026-10 这轮「统一一套个人与商业免费、耐读的中文 Book 字体」的调研与实测，
是 `skills/designing-theme/references/theme-system.md`「字体栈」一节的证据附录。

## 需求与约束

- 场景：Quarto Book 的 HTML 长读，正文 17px、行高 1.75–1.8，内容宽 840px（约 37.9 个汉字/行，落在中文长读常见的 34–40 字区间）。
- 中英混排：中文正文里夹代码标识符、数字、英文术语与中文标点，要求「同一行里中英看起来是同一个人写的」。
- 授权：必须个人与商业都免费（SIL OFL 或等价）；不接受「免费但商用要买」的字体。
- 观感：暖纸底、细横线、小圆角、无阴影的版式，要求字面安静、笔画匀、不刺眼。

## 候选与事实

数据来自各仓库 README / GitHub API（2026-10 读数），仅作量级参考。

| 字体 | 授权 | 社区量级 | 构成 / 特点 | 结论 |
| --- | --- | --- | --- | --- |
| **LXGW Bright** | OFL-1.1 | 685★ | Ysabeau（拉丁）+ 霞鹜文楷（汉字）合并，中英同源、字重 300–500 | 正文与 UI 主字体 |
| **LXGW Bright Code** | OFL-1.1 | 260★ | Monaspace Argon + 霞鹜文楷合并 | 代码块与行内代码 |
| Sarasa Gothic 更纱黑体 | OFL（派生条款） | 12,916★ | 思源黑体 + Iosevka，中英 1:2 等宽 | 备选；黑体气质，与本主题「楷体正文」不符 |
| Maple Mono | OFL-1.1 | 29,445★ | 圆角、连字、Nerd 图标，中英 2:1 | 终端/IDE 常见；连字对书里 `->`/`!=` 反而添噪 |
| Noto Sans SC | OFL-1.1 | — | 无衬线，可变字重 | 仅作标题黑体栈首选（见下） |
| Source Han Serif / Sans SC | OFL-1.1 | — | 思源宋/黑 | 备选；体积大，Web 子集成本高 |
| Ysabeau Office | OFL-1.1 | — | 人文主义无衬线 | 仅用于书名/hero 等展示位 |
| JetBrains Mono | OFL-1.1 | — | 等宽、连字 | hill-light 原代码字体；本插件改统一为 Bright Code |

## 本仓库实测（woff2 子集，2026-10）

在 `skills/designing-theme/assets/fonts/` 的 woff2 上用 fontTools + 浏览器 `document.fonts` 量过：

- **覆盖**：GB2312 一二级常用字、常用全角标点、拉丁字母数字与编程符号（`< > <= >= != -> ++` 等）齐备；`+ - × ÷ =` 同在数学轴。
- **数字**：17px 下每个数字宽 8.789px，即等宽（tabular），表格与代码里的数字天然对齐。
- **标点**：em dash 0.895em、括号 0.5em，行首行尾避让由浏览器标点挤压处理，不需要 `text-spacing-trim` 兜底。
- **墨迹中心**：`+` 的视觉中心在 0.23em 高度，汉字方块中心在 0.357em —— 差 0.13em。若对 `++` 单独 `translateY` 抬到汉字中线，同一行里的 `i++` 会与相邻字符错位，所以**不做逐符号位移**（上一版 `.plus-align` 已删除）。

## 决定

1. **正文与界面：LXGW Bright Medium**（`--ui-font`），行高 1.75–1.8，字距 0。
2. **标题：系统无衬线栈**（`--heading-font` = Noto Sans SC → Source Han Sans SC → PingFang SC → Microsoft YaHei → system-ui）。理由：
   - 楷体在大字号（22–30px）下笔画膨胀、横细竖粗的对比被放大，标题与正文拉不开；
   - 中文技术书的标题惯例是无衬线（Diátaxis、Julia/Quarto 官方文档、多数中文技术书）；
   - 系统栈按平台取字：Windows 落 Noto Sans SC / 微软雅黑，macOS 落 PingFang SC，Linux 落思源黑体，零下载成本；
   - 可变字体（Noto Sans SC）在 `font-synthesis: none` 下仍能拿到真 600，不会出现「伪粗」。
3. **代码：LXGW Bright Code**（`--mono-font`），与正文同源，中文注释不跳字体。
4. **展示位（书名、hero 小标）：Ysabeau Office**，与拉丁正文字形同族。
5. **不逐符号调整基线**（见上「墨迹中心」），`++`/`--` 与代码行整体对齐。

## 与 hill-light 的关系

hill-light 仓库原设计是「思源宋体正文 + JetBrains Mono 代码」的宋体路线。本插件在集成
「山光」四时辰色板时，字体沿用上面的统一方案（LXGW Bright / Bright Code）：

- 理由：三套色板（Flexoki / Solarized / 山光）之间切换时，**字面不跟着跳**——换的是纸色与墨色，不是字体气质；
- 山光的「安静、偏纸感」由底色、发丝线与圆角承担，不需要靠宋体再强调一次；
- 若 hill-light 仓库本身想保留宋体气质，建议的替换是 `Source Han Serif SC` 作标题、
  `LXGW WenKai`（霞鹜文楷，OFL-1.1）作正文、`LXGW Bright Code` 作代码，三者同为 OFL、
  可子集化，且与插件里的字重档位能对上。

## 参考

- [lxgw/LxgwBright](https://github.com/lxgw/LxgwBright)（OFL-1.1，685★）
- [lxgw/LxgwBright-Code](https://github.com/lxgw/LxgwBright-Code)（OFL-1.1，260★）
- [lxgw/LxgwWenKai](https://github.com/lxgw/LxgwWenKai)（OFL-1.1）
- [be5invis/Sarasa-Gothic](https://github.com/be5invis/Sarasa-Gothic)（12,916★）
- [subframe7536/maple-font](https://github.com/subframe7536/maple-font)（OFL-1.1，29,445★）
- [notofonts/noto-cjk](https://github.com/notofonts/noto-cjk)（OFL-1.1）
- [adobe-fonts/source-han-serif](https://github.com/adobe-fonts/source-han-serif)（OFL-1.1）
