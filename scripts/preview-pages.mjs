/**
 * Renders preview images for a visual check. Output is gitignored.
 * Run: node scripts/preview-pages.mjs
 */
import { mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { chromium } from "../../Rail-Vault/node_modules/playwright/index.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const ORIGIN = process.env.VERIFY_URL || "http://localhost:8765";
const OUT = join(root, "previews");
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });

async function shot(name, path, prepare) {
  const page = await context.newPage();
  await page.goto(ORIGIN + path, { waitUntil: "networkidle" });
  await page.evaluate(() => {
    // Smooth scrolling would still be animating when the screenshot is taken.
    document.documentElement.style.scrollBehavior = "auto";
    document.querySelectorAll("img").forEach((img) => (img.loading = "eager"));
    window.scrollTo(0, document.body.scrollHeight);
  });
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  if (prepare) await prepare(page);
  await page.screenshot({ path: join(OUT, `${name}.png`), fullPage: !prepare });
  await page.close();
}

await shot("hero", "/index.html", async () => {});

await shot("login-scene", "/index.html", async (page) => {
  await page.evaluate(() =>
    document.querySelector("#product").scrollIntoView({ block: "center", behavior: "instant" })
  );
  await page.waitForTimeout(2000);
});

await shot("tunnel", "/features/index.html", async (page) => {
  await page.evaluate(() =>
    document.querySelector(".tunnel")?.scrollIntoView({ block: "center", behavior: "instant" })
  );
  await page.waitForTimeout(800);
  await page.locator('[data-tunnel-mode="tunnel"]').click();
  await page.waitForTimeout(900);
});

await shot("tunnel-dim", "/features/index.html", async (page) => {
  await page.evaluate(() =>
    document.querySelector(".tunnel")?.scrollIntoView({ block: "center", behavior: "instant" })
  );
  await page.locator('[data-tunnel-mode="dim"]').click();
  await page.waitForTimeout(900);
});

await shot("verify", "/index.html", async (page) => {
  await page.evaluate(() =>
    document.querySelector("#verifications").scrollIntoView({ block: "start", behavior: "instant" })
  );
  await page.waitForTimeout(600);
});

await shot("verify-live", "/index.html", async (page) => {
  await page.evaluate(() =>
    document.querySelector(".verify__live").scrollIntoView({ block: "center", behavior: "instant" })
  );
  await page.waitForTimeout(600);
});

await shot("verify-tab", "/index.html", async (page) => {
  await page.locator("#verifications").scrollIntoViewIfNeeded();
  await page.locator('#verifications .gallery-tab:not(.is-active)').first().click();
  await page.waitForTimeout(900);
});

await shot("nav-dropdown", "/index.html", async (page) => {
  await page.locator("[data-nav-trigger]").first().click();
  await page.waitForTimeout(400);
});

await shot("addon-page", "/products/leave-absence.html");
await shot("addon-top", "/products/trainee-driver.html", async () => {});
await shot("features-index", "/features/index.html");

await shot("lightbox", "/features/competency-cycles.html", async (page) => {
  await page.locator(".shot__expand").first().click();
  await page.waitForTimeout(600);
});

await shot("mobile-hero", "/index.html", async (page) => {
  await page.setViewportSize({ width: 420, height: 900 });
  await page.waitForTimeout(300);
});

await shot("mobile-nav", "/index.html", async (page) => {
  await page.setViewportSize({ width: 420, height: 900 });
  await page.locator("[data-nav-toggle]").click();
  await page.waitForTimeout(300);
  await page.locator("[data-nav-trigger]").first().click();
  await page.waitForTimeout(400);
});

await browser.close();
console.log("previews written to previews/");
