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
await page.waitForSelector(".shot-deck__slide.is-current img", { state: "visible" });
await page.waitForTimeout(800);

const sections = page.locator(".page-section--stage");
const count = await sections.count();
for (let i = 0; i < Math.min(count, 2); i++) {
  const section = sections.nth(i);
  await section.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await section.screenshot({ path: path.join(outDir, `deck-section-${i + 1}-1280.png`) });
}

await page.setViewportSize({ width: 390, height: 844 });
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(800);
const mobile = sections.first();
await mobile.scrollIntoViewIfNeeded();
await page.waitForTimeout(400);
await mobile.screenshot({ path: path.join(outDir, "deck-section-1-390.png") });

const overflow = await page.evaluate(() => {
  const doc = document.documentElement;
  const decks = Array.from(document.querySelectorAll(".shot-deck"));
  const deckOverflow = decks.map((deck) => {
    const rect = deck.getBoundingClientRect();
    const img = deck.querySelector(".shot-deck__slide.is-current img");
    return {
      deckWidth: rect.width,
      imgWidth: img ? img.getBoundingClientRect().width : 0,
      exceeds: img ? img.getBoundingClientRect().width > rect.width + 1 : false,
    };
  });
  return {
    scrollWidth: doc.scrollWidth,
    clientWidth: doc.clientWidth,
    overflowX: doc.scrollWidth > doc.clientWidth + 1,
    deckOverflow,
  };
});

console.log(JSON.stringify({ sections: count, overflow }, null, 2));
await browser.close();
