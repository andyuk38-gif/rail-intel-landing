/**
 * Loads every generated page in a headless browser and checks that images
 * resolve, internal links point at real files, and every screenshot is at least
 * 2x on a Retina display.
 *
 * Requires a static server on VERIFY_URL (default http://localhost:8765).
 *
 * Run: node scripts/verify-pages.mjs
 */
import { existsSync } from "fs";
import { join } from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { chromium } from "../../Rail-Vault/node_modules/playwright/index.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const ORIGIN = process.env.VERIFY_URL || "http://localhost:8765";

const pages = [
  "/index.html",
  "/how-it-works.html",
  "/security.html",
  "/products/index.html",
  "/features/index.html",
  "/products/qa-verifications.html",
  "/products/task-assignment.html",
  "/products/safety-briefs.html",
  "/products/trainee-driver.html",
  "/products/driver-reports.html",
  "/products/leave-absence.html",
  "/products/medication-checks.html",
  "/features/tunnel-mode.html",
  "/features/competency-cycles.html",
  "/features/workforce-records.html",
  "/features/medicals-licensing.html",
  "/features/incidents-monitoring.html",
  "/features/reporting-administration.html",
];

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 2,
});

const problems = [];
let imageCount = 0;
let softest = { density: Infinity };

for (const path of pages) {
  const page = await context.newPage();
  const failedRequests = [];
  page.on("requestfailed", (request) => failedRequests.push(request.url()));
  page.on("response", (response) => {
    if (response.status() >= 400) failedRequests.push(`${response.status()} ${response.url()}`);
  });

  await page.goto(ORIGIN + path, { waitUntil: "networkidle" });

  // Force lazy images to load so they can be measured.
  await page.evaluate(() => {
    document.querySelectorAll("img").forEach((img) => (img.loading = "eager"));
    window.scrollTo(0, document.body.scrollHeight);
  });
  await page.waitForTimeout(1200);
  await page.evaluate(() => window.scrollTo(0, 0));

  const result = await page.evaluate(() => ({
    // The lightbox image is intentionally src-less until it is opened.
    images: [...document.querySelectorAll("img:not([data-lightbox-img])")].map((img) => ({
      src: img.getAttribute("src"),
      cssWidth: Math.round(img.getBoundingClientRect().width),
      naturalWidth: img.naturalWidth,
    })),
    links: [...document.querySelectorAll("a[href]")]
      .map((a) => a.getAttribute("href"))
      .filter((href) => href && !/^(https?:|mailto:|#)/.test(href)),
    expandButtons: document.querySelectorAll(".shot__expand").length,
    navGroups: document.querySelectorAll("[data-nav-group]").length,
  }));

  if (result.navGroups !== 2) problems.push(`${path}: expected 2 nav dropdowns, found ${result.navGroups}`);

  const shots = result.images.filter((img) => /images\/(screens|product)\//.test(img.src));
  if (shots.length && result.expandButtons === 0) {
    problems.push(`${path}: screenshots present but no expand controls were injected`);
  }

  for (const img of result.images) {
    if (!img.naturalWidth) {
      problems.push(`${path}: image failed to load – ${img.src}`);
      continue;
    }
    if (!/images\/(screens|product)\//.test(img.src)) continue;

    imageCount += 1;
    const density = img.naturalWidth / (img.cssWidth * 2);
    if (density < 0.99) {
      problems.push(
        `${path}: ${img.src} is only ${density.toFixed(2)}x (${img.naturalWidth}px shown at ${img.cssWidth}css)`
      );
    }
    if (density < softest.density) softest = { density, src: img.src, path };
  }

  // Resolve internal links against the file system.
  for (const href of new Set(result.links)) {
    const clean = href.split(/[?#]/)[0];
    const target = clean.endsWith("/") ? clean + "index.html" : clean;
    const resolved = target.startsWith("/")
      ? join(root, target)
      : join(root, dirname(path.replace(/^\//, "")), target);
    if (!existsSync(resolved)) problems.push(`${path}: broken link -> ${href}`);
  }

  for (const failure of failedRequests) problems.push(`${path}: request failed – ${failure}`);

  await page.close();
}

// Exercise the lightbox on a representative page.
const page = await context.newPage();
// This page's first screenshot is wider than the viewport, so the zoom toggle
// is offered and both modes can be checked.
await page.goto(ORIGIN + "/features/competency-cycles.html", { waitUntil: "networkidle" });
await page.locator(".shot__expand").first().click();
await page.waitForTimeout(400);
const measure = () =>
  page.evaluate(() => {
    const img = document.querySelector("[data-lightbox-img]");
    return {
      open: document.querySelector(".lightbox").classList.contains("is-open"),
      natural: img.naturalWidth,
      rendered: Math.round(img.getBoundingClientRect().width),
      meta: document.querySelector("[data-lightbox-meta]").textContent,
    };
  });

const fitted = await measure();
if (!fitted.open) problems.push("lightbox did not open");
if (fitted.rendered > 1440) problems.push(`lightbox did not fit the viewport (${fitted.rendered}px)`);
if (/at 0%/.test(fitted.meta)) problems.push(`lightbox reported a bad zoom level: ${fitted.meta}`);

await page.locator("[data-lightbox-zoom]").click();
await page.waitForTimeout(300);
const zoomed = await measure();
if (zoomed.rendered !== zoomed.natural) {
  problems.push(`actual size showed ${zoomed.rendered}px for a ${zoomed.natural}px image`);
}
const lightbox = { open: fitted.open, meta: fitted.meta, zoomed: zoomed.meta };
await page.close();

await browser.close();

console.log(`checked ${pages.length} pages and ${imageCount} screenshots`);
console.log(`lightbox: fit="${lightbox.meta}" actual-size="${lightbox.zoomed}"`);
console.log(`lowest density: ${softest.density.toFixed(2)}x (${softest.src} on ${softest.path})`);

if (problems.length) {
  console.log(`\n${problems.length} problem(s):`);
  for (const problem of problems) console.log(`  - ${problem}`);
  process.exit(1);
}
console.log("\nall checks passed");
