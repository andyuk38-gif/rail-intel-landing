/**
 * Captures the product screenshots used on the landing page.
 *
 * Two things decide whether a screenshot looks sharp, and both matter:
 *   1. Pixel density  - the file must have at least 2x the CSS pixels it is
 *                       displayed at, or it blurs on Retina.
 *   2. UI scale       - the capture viewport must be close to the width the
 *                       image is displayed at, or the app's own text is shrunk
 *                       to an unreadable size no matter how many pixels it has.
 *
 * Screens display full-width at ~1152 CSS px, so we capture at a 1280 viewport
 * (the app drops to a tablet layout at <=1200) with deviceScaleFactor 2.
 *
 * Navigation is entirely client-side after login: reloading the page would
 * reset the "Login as company" scope and fall back to the system-admin view.
 *
 * Setup:
 *   1. cp .env.screenshots.example .env.screenshots  and fill it in
 *   2. cd ../Rail-Vault && npx playwright install chromium
 *   3. node scripts/capture-screenshots.mjs
 *
 * Flags: --login-only | --hero-only | --skip-login-shot
 */
import { chromium } from "../../Rail-Vault/node_modules/playwright/index.mjs";
import { mkdirSync, readFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "images/product");
const ENV_FILE = join(ROOT, ".env.screenshots");

function loadEnvFile() {
  if (!existsSync(ENV_FILE)) return;
  for (const line of readFileSync(ENV_FILE, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    if (!process.env[key]) process.env[key] = trimmed.slice(eq + 1).trim();
  }
}
loadEnvFile();

const args = new Set(process.argv.slice(2));
const BASE_URL = (process.env.SCREENSHOT_URL || "https://cms.railintel.co.uk").replace(/\/$/, "");
const COMPANY_CODE = process.env.SCREENSHOT_COMPANY_CODE || "";
const EMAIL = process.env.SCREENSHOT_EMAIL || "";
const PASSWORD = process.env.SCREENSHOT_PASSWORD || "";
/** Company to show in the screenshots; defaults to the only one available. */
const TARGET_COMPANY = process.env.SCREENSHOT_TARGET_COMPANY || "";

const VIEWPORT = { width: 1280, height: 800 };
/** The hero is a sidebar-less crop, so it needs a wider window to fill the same box. */
const HERO_VIEWPORT = { width: 1440, height: 920 };
const DPR = 2;

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const exact = (label) => new RegExp(`^\\s*${escapeRe(label)}\\s*$`, "i");

const settle = (page, ms = 2200) => page.waitForTimeout(ms);

async function login(page) {
  if (!COMPANY_CODE || !EMAIL || !PASSWORD) {
    throw new Error("Create .env.screenshots from .env.screenshots.example first.");
  }
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
  await settle(page, 2500);
  await page.locator('input[type="email"]').first().fill(EMAIL);
  await page
    .locator('input[placeholder*="RI"], input[placeholder*="e.g"]')
    .first()
    .fill(COMPANY_CODE);
  await page.locator('input[type="password"]').first().fill(PASSWORD);
  await page.locator('button[type="submit"]').first().click();
  await page.waitForSelector("text=Dashboard", { timeout: 90000 });
  await settle(page, 3000);
}

/**
 * The signed-in operator is a system admin, whose own dashboard is not the
 * product view, so every screenshot has to be taken scoped to a company.
 * The control is waited for explicitly: a non-blocking presence check races
 * the header render and silently leaves the whole run in the admin view.
 */
async function scopeToCompany(page) {
  const control = page.getByRole("button", { name: /Login as company|Viewing as/i }).first();
  await control.waitFor({ state: "visible", timeout: 40000 });

  const label = (await control.innerText()).replace(/\s+/g, " ").trim();
  if (/^Viewing as/i.test(label)) {
    console.log(`already ${label}`);
    return;
  }

  await control.click();
  await settle(page, 1800);

  const options = await page.evaluate(() =>
    [...document.querySelectorAll("button")]
      .map((b) => b.innerText.replace(/\s+/g, " ").trim())
      .filter((t) => /\(\d+\)/.test(t))
  );
  const codes = options.map((t) => t.match(/\((\d+)\)/)?.[1]).filter(Boolean);
  const code = codes.includes(TARGET_COMPANY) ? TARGET_COMPANY : codes[0];
  if (!code) throw new Error("No companies available to scope to.");

  await page
    .locator("button")
    .filter({ hasText: new RegExp(`\\(${code}\\)`) })
    .first()
    .click();
  await settle(page, 5000);

  const confirmed = page.getByRole("button", { name: /Viewing as/i }).first();
  await confirmed.waitFor({ state: "visible", timeout: 30000 });
  console.log(`scoped to company ${code}`);
}

async function shot(page, filename) {
  await page.screenshot({ path: join(OUT_DIR, filename) });
  console.log("saved", filename);
}

/** Captures never abort the run: a missing screen should not lose the others. */
async function safeShot(page, filename, navigate) {
  try {
    if (navigate) await navigate();
    await shot(page, filename);
  } catch (err) {
    const detail = (err.message || String(err)).split("\n").slice(0, 4).join(" | ");
    console.warn(`SKIPPED ${filename}: ${detail}`);
  }
}

/**
 * The sidebar has its own scroll area and a pinned footer that sits on top of
 * the lower nav items, so "Administration" has to be scrolled clear before it
 * can be clicked. Scroll is reset afterwards so screenshots look untouched.
 */
async function scrollSidebar(page, delta) {
  await page.mouse.move(110, 400);
  await page.mouse.wheel(0, delta);
  await page.waitForTimeout(700);
}

async function dismissOverlays(page) {
  await page.keyboard.press("Escape").catch(() => {});
  await page.waitForTimeout(400);
}

async function clickSidebar(page, label) {
  await dismissOverlays(page);
  await scrollSidebar(page, -1200);
  await clickControl(page, label, 10000);
  await settle(page);
}

const visible = (locator) => locator.isVisible().catch(() => false);

/**
 * Controls in this app are a mix of buttons, ARIA tabs and links, so match on
 * label across all of them rather than assuming a single role.
 */
async function clickControl(page, label, timeout = 6000) {
  const candidates = [
    page.getByRole("button", { name: exact(label) }).first(),
    page.getByRole("tab", { name: exact(label) }).first(),
    page.locator("button, [role='tab'], a").filter({ hasText: exact(label) }).first(),
  ];

  let lastError;
  for (const candidate of candidates) {
    try {
      await candidate.click({ timeout });
      return;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

/**
 * The Administration button toggles, so a stray click can close the flyout
 * again. Confirm a known entry is on screen and retry rather than assuming.
 */
async function openAdminFlyout(page, attempts = 3) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    await dismissOverlays(page);
    await scrollSidebar(page, 1200);
    await page
      .getByRole("button", { name: exact("Administration") })
      .first()
      .click({ timeout: 20000 })
      .catch(() => {});
    await settle(page, 1800);
    if (await visible(page.getByRole("button", { name: exact("Team Management") }).first())) {
      return;
    }
  }
  throw new Error("Administration flyout did not open.");
}

/**
 * Administration flyout. Entries are either top level or nested under the
 * collapsible Company Configuration section, so try direct first and expand
 * only if that misses.
 */
async function clickAdmin(page, label) {
  await openAdminFlyout(page);

  try {
    await page.getByRole("button", { name: exact(label) }).first().click({ timeout: 4000 });
  } catch {
    await page
      .getByRole("button", { name: exact("COMPANY CONFIGURATION") })
      .first()
      .click({ timeout: 8000 });
    await settle(page, 1800);
    await page.getByRole("button", { name: exact(label) }).first().click({ timeout: 15000 });
  }

  await settle(page, 2600);
  await scrollSidebar(page, -1200);
}

/** Opens the first employee record and confirms the profile actually rendered. */
async function openFirstEmployee(page) {
  await clickSidebar(page, "Employees");
  await settle(page, 1500);

  const openers = [
    () => page.getByTitle("View Record").first().click({ timeout: 8000 }),
    () => page.locator("table tbody tr td").first().click({ timeout: 8000 }),
    () => page.getByText(/Ash Hill|John Doe/i).first().click({ timeout: 8000 }),
  ];

  const onProfile = async () => {
    for (const label of ["Back to Dashboard", "Run Employee Verification", "Overview"]) {
      const hit = page.locator("button, [role='tab'], a").filter({ hasText: exact(label) }).first();
      if (await visible(hit)) return true;
    }
    return false;
  };

  for (const open of openers) {
    await open().catch(() => {});
    await settle(page, 2600);
    if (await onProfile()) return;
  }

  await page.screenshot({ path: join(OUT_DIR, "_debug-employees.png") });
  throw new Error("Could not open an employee profile (see images/product/_debug-employees.png).");
}

/**
 * Profile tabs are a hover-driven mega menu: the category only opens a panel,
 * and the card inside it is what actually switches the page. Categories with a
 * single entry skip the panel and select their tab from the trigger itself.
 */
async function employeeTab(page, group, cardTitle) {
  await dismissOverlays(page);

  const trigger = page.locator(".employee-mega-trigger-label", { hasText: exact(group) }).first();
  await trigger.hover({ timeout: 15000 });
  await settle(page, 1100);

  const card = page
    .locator("button.employee-mega-card")
    .filter({ has: page.locator(".employee-mega-card-title", { hasText: exact(cardTitle) }) })
    .first();

  if (await visible(card)) {
    await card.click({ timeout: 10000 });
  } else {
    await trigger.click({ timeout: 10000 });
  }
  await settle(page, 2800);
}

/** Profile tabs are grouped as Overview / Medical / Licensing / Operations / Development / Workspace. */
async function captureEmployeeScreens(page) {
  await openFirstEmployee(page);
  await safeShot(page, "employee-overview.png", () => employeeTab(page, "Overview", "Main"));
  await safeShot(page, "licence.png", () => employeeTab(page, "Licensing", "Licence"));
  await safeShot(page, "medical-record.png", () => employeeTab(page, "Medical", "Medical"));
  await safeShot(page, "current-cycles.png", () => employeeTab(page, "Operations", "Cycles"));
  await safeShot(page, "incidents-cdp.png", () =>
    employeeTab(page, "Development", "Monitoring & Incidents")
  );
  await safeShot(page, "training-quals.png", () =>
    employeeTab(page, "Development", "Training & Qualifications")
  );
}

/** Dashboard content area only: no sidebar and no top search bar. */
async function captureHero(context) {
  const page = await context.newPage();
  await page.setViewportSize(HERO_VIEWPORT);
  await login(page);
  await scopeToCompany(page);

  const heading = page.locator("h1").first();
  await heading.waitFor({ timeout: 30000 });
  // The dashboard plays a brief "You have arrived" title before settling on the
  // real welcome line; capturing too early bakes the animation into the hero.
  await page
    .locator("h1", { hasText: /Welcome .* to your Rail Intel Dashboard/i })
    .first()
    .waitFor({ timeout: 30000 })
    .catch(() => {});
  await settle(page, 1200);

  const box = await heading.boundingBox();
  if (!box) throw new Error("Could not locate the dashboard heading.");

  const pad = 22;
  const x = Math.max(0, Math.round(box.x - pad));
  const y = Math.max(0, Math.round(box.y - pad));
  await page.screenshot({
    path: join(OUT_DIR, "hero-dashboard.png"),
    clip: { x, y, width: HERO_VIEWPORT.width - x - pad, height: HERO_VIEWPORT.height - y },
  });
  console.log("saved hero-dashboard.png");
  await page.close();
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: DPR });

  if (!args.has("--hero-only") && !args.has("--skip-login-shot")) {
    const page = await context.newPage();
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
    await settle(page, 2500);
    await shot(page, "login.png");
    await page.close();
  }

  if (args.has("--login-only")) {
    await browser.close();
    return;
  }

  if (!args.has("--skip-hero")) {
    await captureHero(context);
  }

  if (args.has("--hero-only")) {
    await browser.close();
    return;
  }

  const page = await context.newPage();
  await login(page);
  await scopeToCompany(page);

  const employeesOnly = args.has("--employees-only");

  if (employeesOnly) {
    await captureEmployeeScreens(page);
    await browser.close();
    return;
  }

  await safeShot(page, "dashboard.png", () => clickSidebar(page, "Dashboard"));

  await safeShot(page, "qa-verifications.png", () => clickAdmin(page, "QA Verifications"));
  await safeShot(page, "safety-briefs.png", () => clickAdmin(page, "Safety Briefs"));
  await safeShot(page, "trainee-hours.png", () => clickAdmin(page, "Trainee Driver"));
  await safeShot(page, "cycle-builder.png", () => clickAdmin(page, "Cycle Builder"));
  await safeShot(page, "traction-routes.png", () => clickAdmin(page, "Traction, Routes & Depots"));
  await safeShot(page, "org-structure.png", () => clickAdmin(page, "Organisation Structure"));

  // Reporting last of the top-level screens: it needs the content scrolled,
  // which would otherwise interfere with the sidebar interactions above.
  await safeShot(page, "reporting-analytics.png", () => clickSidebar(page, "Reporting"));
  await safeShot(page, "reporting-analytics-2.png", async () => {
    await page.mouse.move(820, 500);
    await page.mouse.wheel(0, 900);
    await settle(page, 1600);
  });

  await captureEmployeeScreens(page);

  await browser.close();
  console.log(`\nDone — captured at ${VIEWPORT.width}px viewport, ${DPR}x DPR.`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
