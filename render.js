const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const Mustache = require("mustache");
const { chromium } = require("playwright");

const TEMPLATES_DIR = path.join(__dirname, "templates");
const OUTPUT_DIR = path.join(__dirname, "output");
const ILLUSTRATIONS_DIR = path.join(__dirname, "assets", "illustrations");

function loadIllustration(name) {
  const illustrationPath = path.join(ILLUSTRATIONS_DIR, `${name}.svg`);
  if (!fs.existsSync(illustrationPath)) {
    throw new Error(`找不到插圖檔案: ${illustrationPath}`);
  }
  return fs.readFileSync(illustrationPath, "utf8");
}

function buildView(data, body) {
  const view = {
    eyebrow: data.eyebrow || "",
    series: data.series || "",
    brand: data.brand || "心之所向",
  };

  if (data.template === "list") {
    view.title = data.title || "";
    view.subtitle = data.subtitle || "";
    view.illustration = data.illustration ? loadIllustration(data.illustration) : "";
    view.points = (data.points || []).map((p, i) => ({
      index: String(i + 1).padStart(2, "0"),
      heading: p.heading || "",
      body: p.body || "",
    }));
  } else if (data.template === "quote") {
    view.quote = (data.quote || body).trim();
    view.author = data.author || "";
  } else if (data.template === "paragraph") {
    view.title = data.title || "";
    view.illustration = data.illustration ? loadIllustration(data.illustration) : "";
    const raw = data.body || body;
    view.paragraphs = raw
      .trim()
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);
  } else if (data.template === "kids-quote") {
    view.title = data.title || "";
    const raw = data.body || body;
    view.body = raw
      .trim()
      .split(/\n+/)
      .map((p) => p.trim())
      .filter(Boolean)
      .join(" ");
    view.illustration = loadIllustration(data.illustration || "growing");
  } else if (data.template === "kids-list") {
    view.title = data.title || "";
    view.illustration = loadIllustration(data.illustration || "growing");
    const palette = ["yellow", "blue", "coral", "green"];
    view.points = (data.points || []).map((p, i) => ({
      index: i + 1,
      color: palette[i % palette.length],
      heading: p.heading || "",
      body: p.body || "",
    }));
  } else if (data.template === "kids-paragraph") {
    view.title = data.title || "";
    view.illustration = loadIllustration(data.illustration || "growing");
    const raw = data.body || body;
    view.paragraphs = raw
      .trim()
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);
  } else {
    throw new Error(`未知的 template 類型: ${data.template}`);
  }

  return view;
}

async function renderFile(browser, filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);

  if (!data.template) {
    throw new Error(`${filePath} 缺少 frontmatter 欄位 template`);
  }

  const templatePath = path.join(TEMPLATES_DIR, `${data.template}.html`);
  if (!fs.existsSync(templatePath)) {
    throw new Error(`找不到版型檔案: ${templatePath}`);
  }

  const templateHtml = fs.readFileSync(templatePath, "utf8");
  const view = buildView(data, content);
  const html = Mustache.render(templateHtml, view);

  const page = await browser.newPage({
    viewport: { width: 1080, height: 1080 },
    deviceScaleFactor: 2,
  });
  await page.setContent(html, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);

  const basename = path.basename(filePath, path.extname(filePath));
  const outputPath = path.join(OUTPUT_DIR, `${basename}.png`);
  await page.screenshot({ path: outputPath });
  await page.close();

  return outputPath;
}

async function main() {
  const target = process.argv[2] || path.join(__dirname, "content");
  const stat = fs.statSync(target);
  const files = stat.isDirectory()
    ? fs
        .readdirSync(target)
        .filter((f) => f.endsWith(".md"))
        .map((f) => path.join(target, f))
    : [target];

  if (files.length === 0) {
    console.log("沒有找到任何 .md 內容檔案。");
    return;
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  for (const file of files) {
    try {
      const outputPath = await renderFile(browser, file);
      console.log(`已產生: ${outputPath}`);
    } catch (err) {
      console.error(`處理失敗 ${file}: ${err.message}`);
    }
  }
  await browser.close();
}

main();
