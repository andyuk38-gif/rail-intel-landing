import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outDir = path.join(root, ".preview");
const url = "http://localhost:8765/features/administration.html";

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForSelector(".shot-viewer__frame.is-active img", { state: "visible" });
await page.waitForTimeout(800);

const sections = page.locator(".page-section--viewer");
const count = await sections.count();
for (let i = 0; i < Math.min(count, 2); i++) {
  const section = sections.nth(i);
  await section.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await section.screenshot({ path: path.join(outDir, `viewer-section-${i + 1}-1280.png`) });
  if (i === 0) {
    const rail = section.locator(".shot-viewer__rail");
    await rail.screenshot({ path: path.join(outDir, "viewer-rail-1280.png") });
  }
}

await page.setViewportSize({ width: 390, height: 844 });
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForSelector(".shot-viewer__frame.is-active img", { state: "visible" });
await page.waitForTimeout(600);
const mobile = sections.first();
await mobile.scrollIntoViewIfNeeded();
await mobile.screenshot({ path: path.join(outDir, "viewer-section-1-390.png") });

const overflow = await page.evaluate(() => {
  const doc = document.documentElement;
  const viewers = Array.from(document.querySelectorAll(".shot-viewer"));
  return {
    overflowX: doc.scrollWidth > doc.clientWidth + 1,
    viewers: viewers.map((viewer, i) => {
      const rect = viewer.getBoundingClientRect();
      const img = viewer.querySelector(".shot-viewer__frame.is-active img");
      const ir = img?.getBoundingClientRect();
      return {
        i,
        viewerWidth: rect.width,
        imgWidth: ir?.width ?? 0,
        exceeds: ir ? ir.width > rect.width + 1 : false,
      };
    }),
  };
});

console.log(JSON.stringify({ sections: count, overflow }, null, 2));
await browser.close();
