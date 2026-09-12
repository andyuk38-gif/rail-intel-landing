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

const section = page.locator(".page-section--viewer").filter({ hasText: "Security and sign-in policy" });
await section.scrollIntoViewIfNeeded();
await page.waitForTimeout(500);
await section.screenshot({ path: path.join(outDir, "security-viewer-01.png") });

await page.click('[data-shot-viewer-tile="1"]');
await page.waitForTimeout(700);
await section.screenshot({ path: path.join(outDir, "security-viewer-02-mfa.png") });

await page.click('[data-shot-viewer-tile="2"]');
await page.waitForTimeout(700);
await section.screenshot({ path: path.join(outDir, "security-viewer-03-account.png") });

await browser.close();
