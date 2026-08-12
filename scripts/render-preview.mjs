/** Renders the landing page so screenshot sharpness can be checked visually. */
import { chromium } from "../../Rail-Vault/node_modules/playwright/index.mjs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const URL = process.env.PREVIEW_URL || "http://localhost:8765/index.html";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1,
});
await page.goto(URL, { waitUntil: "networkidle" });
await page.evaluate(() => {
  document.querySelectorAll("img").forEach((img) => (img.loading = "eager"));
  window.scrollTo(0, document.body.scrollHeight);
});
await page.waitForTimeout(2500);
await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
await page.waitForTimeout(1000);

await page.screenshot({ path: join(root, "preview-hero.png") });
await page.screenshot({ path: join(root, "preview-full.png"), fullPage: true });

console.log("saved preview-hero.png and preview-section.png");
await browser.close();
