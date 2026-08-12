import { chromium } from "../../Rail-Vault/node_modules/playwright/index.mjs";

const URL = process.env.MEASURE_URL || "http://localhost:8765/index.html";
const CAPTURE_VIEWPORT = 1280;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2 });
await page.goto(URL, { waitUntil: "networkidle" });

// Force lazy images to load so we can measure them.
await page.evaluate(() => {
  document.querySelectorAll("img").forEach((img) => (img.loading = "eager"));
  window.scrollTo(0, document.body.scrollHeight);
});
await page.waitForTimeout(2500);
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(500);

const rows = await page.evaluate(() => {
  return [...document.querySelectorAll('img[src*="images/product/"]')].map((img) => ({
    file: img.src.split("/").pop(),
    cssWidth: Math.round(img.getBoundingClientRect().width),
    naturalWidth: img.naturalWidth,
  }));
});

await browser.close();

console.log(
  ["file", "displayed(css px)", "source(px)", "device px @2x", "density", "app UI scale"].join("\t")
);
for (const r of rows) {
  const devicePx = r.cssWidth * 2;
  const density = (r.naturalWidth / devicePx).toFixed(2);
  const uiScale = ((r.cssWidth / CAPTURE_VIEWPORT) * 100).toFixed(0) + "%";
  console.log([r.file, r.cssWidth, r.naturalWidth, devicePx, density + "x", uiScale].join("\t"));
}
