// 从渲染产物读取真实浏览器几何与计算样式，供 checking-layout.py 做布局回归断言。
//
// 用法：node measuring-pages.mjs --book-dir _book --out out.json [--shots-dir DIR] [--all-pages]
// 退出码：0 = 测量成功；2 = Node/Playwright/Edge 或渲染产物不可用。

import { mkdir, readdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import { delimiter, dirname, join, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";

const argv = process.argv.slice(2);
const flag = (name, fallback) => {
  const index = argv.indexOf(name);
  return index >= 0 && argv[index + 1] ? argv[index + 1] : fallback;
};

const require = createRequire(import.meta.url);
const bookDir = resolve(flag("--book-dir", "_book"));
const outFile = flag("--out", "");
const shotsDir = flag("--shots-dir", "");
const allPages = argv.includes("--all-pages");
const viewports = [1280, 768, 390, 360];
const colorSchemes = ["light", "dark"];

async function collectHtml(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectHtml(path));
    } else if (entry.name.endsWith(".html") && entry.name !== "404.html") {
      files.push(path);
    }
  }
  return files;
}

function sampleHtml(files, root) {
  const relativeFiles = files
    .map((file) => relative(root, file).split(sep).join("/"))
    .sort();
  const selected = new Set();
  const add = (relativePath) => {
    if (relativePath) {
      selected.add(relativePath);
    }
  };

  add("index.html");

  // 按顶层目录分组，取每组首页、第一章与最后一章。首页通常也是 part 落地页。
  const bySection = new Map();
  for (const file of relativeFiles) {
    if (file === "index.html") {
      continue;
    }
    const section = file.includes("/") ? file.split("/")[0] : ".";
    const bucket = bySection.get(section) || [];
    bucket.push(file);
    bySection.set(section, bucket);
  }
  for (const [section, bucket] of [...bySection.entries()].sort()) {
    if (section === ".") {
      for (const file of bucket) {
        add(file);
      }
      continue;
    }
    add(`${section}/index.html`);
    add(bucket[0]);
    add(bucket.at(-1));
  }
  return files.filter((file) => selected.has(relative(root, file).split(sep).join("/")));
}

function loadPlaywright() {
  try {
    return require("playwright");
  } catch (error) {
    for (const directory of (process.env.NODE_PATH || "").split(delimiter).filter(Boolean)) {
      const candidate = join(directory, "playwright", "index.js");
      if (existsSync(candidate)) {
        return require(candidate);
      }
    }
    throw error;
  }
}

async function collect(page, pageId, scheme) {
  return page.evaluate(({ pageId, scheme }) => {
    const root = document.querySelector("#quarto-document-content");
    if (!root) {
      return { error: "missing #quarto-document-content" };
    }
    const px = (value) => Number.parseFloat(value) || 0;
    const style = (element) => getComputedStyle(element);
    const paragraphs = [...root.querySelectorAll(":scope > p, :scope > section > p")];
    const boxSelector = "div.sourceCode, table, .callout, blockquote, .cell";
    const boxes = [...root.querySelectorAll(boxSelector)].filter((element) => {
      for (let parent = element.parentElement; parent && parent !== root; parent = parent.parentElement) {
        if (parent.matches(boxSelector)) {
          return false;
        }
      }
      return true;
    });
    const languageBlocks = [...root.querySelectorAll("div.sourceCode")].map((div) => {
      const pre = div.querySelector("pre");
      const code = div.querySelector("pre > code");
      return {
        outerBorder: px(style(div).borderLeftWidth),
        innerBorder: pre ? px(style(pre).borderLeftWidth) : null,
        whiteSpace: code ? style(code).whiteSpace : null,
        background: style(div).backgroundColor,
      };
    });
    const barePres = [...root.querySelectorAll("pre")]
      .filter((pre) => !pre.closest("div.sourceCode") && !pre.classList.contains("mermaid-js"))
      .map((pre) => {
        const code = pre.querySelector("code");
        return {
          border: px(style(pre).borderTopWidth),
          whiteSpace: code ? style(code).whiteSpace : null,
          background: style(pre).backgroundColor,
        };
      });
    const callouts = [...root.querySelectorAll(".callout")].map((callout) => {
      const body = callout.querySelector(".callout-body");
      const title = callout.querySelector(".callout-title-container");
      const computed = style(callout);
      return {
        bodyFontSize: body ? px(style(body).fontSize) : 0,
        titleFontSize: title ? px(style(title).fontSize) : 0,
        paddingTop: px(computed.paddingTop),
        paddingBottom: px(computed.paddingBottom),
        width: Math.round(callout.getBoundingClientRect().width),
      };
    });
    const tocItems = [...document.querySelectorAll('nav[role="doc-toc"] a.nav-link')]
      .map((anchor) => ({
        text: anchor.textContent.trim(),
        height: Math.round(anchor.getBoundingClientRect().height),
      }));
    const overflow = [];
    for (const scope of [root, document.querySelector("#quarto-sidebar"), document.querySelector(".page-columns")]) {
      if (!scope) {
        continue;
      }
      for (const element of scope.querySelectorAll("*")) {
        if (
          element.closest(".screen-reader-only, .sr-only, [aria-hidden='true']")
          // 内联 SVG（棋盘快照等）没有 CSS 盒模型，<text> 的 clientWidth 恒为 0、
          // scrollWidth 按字形量出，天然「溢出」，不能当版式问题。
          || element.closest("svg")
          || style(element).display === "none"
          || style(element).visibility === "hidden"
        ) {
          continue;
        }
        if (!element.clientWidth || element.scrollWidth <= element.clientWidth + 1) {
          continue;
        }
        // 宽于容器的元素只有整页横向滚动条才算问题：代码行本身宽于 <pre> 是常态，
        // <pre> 自己 overflow-x: auto 就不该上报。所以沿祖先链找真正的滚动容器。
        let scrolls = false;
        for (let node = element; node && node !== document.body; node = node.parentElement) {
          const overflowX = style(node).overflowX;
          if (overflowX === "auto" || overflowX === "scroll") {
            scrolls = true;
            break;
          }
        }
        overflow.push({
          tag: element.tagName.toLowerCase(),
          classes: typeof element.className === "string" ? element.className.slice(0, 80) : "",
          scrollWidth: element.scrollWidth,
          clientWidth: element.clientWidth,
          scrolls,
          inPre: Boolean(element.closest("pre")),
        });
      }
    }
    const copyButtonOpacities = [...root.querySelectorAll(".code-copy-button")]
      .map((button) => px(style(button).opacity));
    // ≤991.98px（Quarto 的 lg 断点）左侧栏改为覆盖正文的浮层，必须有不透明底色，
    // 否则下方正文会透上来叠在侧栏文字上。媒体查询按视口宽度生效，收起时也能读到计算值。
    const sidebar = document.querySelector("#quarto-sidebar");
    const sidebarOverlay = sidebar
      ? {
          overlayState: window.innerWidth <= 991.98,
          background: style(sidebar).backgroundColor,
          borderRightWidth: px(style(sidebar).borderRightWidth),
        }
      : null;
    // 栏间分隔只该有顶栏下那一条：读 #quarto-header 的底边，和有没有 h2 短伪元素线。
    // 三个数据都来自计算样式，不依赖主题里写了什么，改回旧规则会直接失败。
    const header = document.querySelector("#quarto-header");
    const headerRule = header
      ? {
          borderBottomWidth: px(style(header).borderBottomWidth),
          borderBottomColor: style(header).borderBottomColor,
          secondaryBorderBottomWidth: px(
            style(document.querySelector("nav.quarto-secondary-nav") || header).borderBottomWidth
          ),
        }
      : null;
    const h2Rules = [...document.querySelectorAll("#quarto-document-content h2")]
      .map((heading) => {
        const after = window.getComputedStyle(heading, "::after");
        return {
          text: heading.textContent.trim().slice(0, 30),
          afterContent: after.content,
          afterWidth: px(after.width),
          afterHeight: px(after.height),
        };
      })
      .filter((item) => item.afterContent && item.afterContent !== "none" && item.afterHeight > 0);
    // 折叠状态来自构建期写入的 expanded：顶层 part 以 depth=1 渲染，
    // collapse-level 决定哪一层默认展开。断言只看 show 类，不看动画中间态。
    const sidebarSections = sidebar
      ? [...sidebar.querySelectorAll("li.sidebar-item-section")].map((item) => {
          const list = item.querySelector(":scope > ul.sidebar-section");
          const own = item.querySelector(":scope > .sidebar-item-container > a.sidebar-item-text");
          return {
            text: (own ? own.textContent : "").trim().slice(0, 40),
            expanded: list ? list.classList.contains("show") : null,
            ownActive: Boolean(own && own.classList.contains("active")),
            containsActive: Boolean(item.querySelector("a.sidebar-item-text.active")),
          };
        })
      : null;
    const rootStyle = style(root);
    return {
      pageId,
      scheme,
      fontFaces: [...document.fonts]
        .filter((face) => [
          "LXGW Bright Medium",
          "LXGW Bright Code",
        ].includes(face.family))
        .map((face) => ({
          family: face.family,
          weight: face.weight,
          status: face.status,
        })),
      paragraphWidth: paragraphs.length ? Math.max(...paragraphs.map((item) => item.clientWidth)) : 0,
      paragraphFontSize: paragraphs.length ? px(style(paragraphs[0]).fontSize) : 0,
      paragraphCount: paragraphs.length,
      boxCount: boxes.length,
      textBandCount: [...root.querySelectorAll("p, li")].filter((item) => !item.closest(boxSelector)).length,
      languageBlocks,
      barePres,
      callouts,
      tocItems,
      overflow,
      copyButtonOpacities,
      sidebarOverlay,
      sidebarSections,
      headerRule,
      h2Rules,
      contentWidth: px(rootStyle.width),
      color: rootStyle.color,
      backgroundColor: style(document.body).backgroundColor,
    };
  }, { pageId, scheme });
}

async function main() {
  if (!existsSync(bookDir)) {
    throw new Error(`book directory not found: ${bookDir}`);
  }
  const htmlFiles = (await collectHtml(bookDir)).sort();
  if (!htmlFiles.length) {
    throw new Error(`no rendered HTML under ${bookDir}`);
  }
  const selectedFiles = allPages ? htmlFiles : sampleHtml(htmlFiles, bookDir);
  const { chromium } = loadPlaywright();
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const result = {
    viewports: {},
    colorSchemes,
    pages: [],
    mode: allPages ? "full" : "sample",
    selectedPages: selectedFiles.map((file) => relative(bookDir, file).split(sep).join("/")),
  };
  try {
    for (const width of viewports) {
      result.viewports[width] = {};
      for (const scheme of colorSchemes) {
        for (const file of selectedFiles) {
          const pageId = relative(bookDir, file).split(sep).join("/");
          const touch = width <= 768;
          const context = await browser.newContext({
            viewport: { width, height: touch ? 844 : 900 },
            hasTouch: touch,
            isMobile: touch,
            colorScheme: scheme,
          });
          const page = await context.newPage();
          const requestedFonts = new Set();
          page.on("request", (request) => {
            if (/\.woff2(?:\?|$)/.test(request.url())) {
              requestedFonts.add(request.url().split("/").pop().split("?")[0]);
            }
          });
          await page.goto(pathToFileURL(file).href, { waitUntil: "networkidle" });
          await page.evaluate(() => document.fonts.ready);
          const data = await collect(page, pageId, scheme);
          data.requestedFonts = [...requestedFonts].sort();
          result.viewports[width][`${scheme}:${pageId}`] = data;
          if (!result.pages.includes(pageId)) {
            result.pages.push(pageId);
          }
          if (shotsDir) {
            const shots = resolve(shotsDir);
            await mkdir(shots, { recursive: true });
            await page.screenshot({
              path: join(shots, `${scheme}-${width}-${pageId.replaceAll("/", "__")}.png`),
              fullPage: false,
            });
          }
          await page.close();
          await context.close();
        }
      }
    }
  } finally {
    await browser.close();
  }
  const json = JSON.stringify(result);
  if (outFile) {
    await mkdir(dirname(resolve(outFile)), { recursive: true });
    await writeFile(resolve(outFile), json, "utf8");
    console.log(`OK measure wrote ${resolve(outFile)} (${json.length} bytes)`);
  } else {
    console.log(json);
  }
}

main().catch((error) => {
  console.error(`MEASURE-FAILED ${error?.message || error}`);
  process.exit(2);
});
