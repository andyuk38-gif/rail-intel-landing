/**
 * Captures dark-mode Administration page screenshots from the live CMS.
 *
 * Overwrites section shots under images/screens/ — never touches adminmenu.png
 * or login-screen.png.
 *
 * Setup: same as capture-screenshots.mjs (.env.screenshots + Playwright chromium).
 *
 *   node scripts/capture-admin-screenshots.mjs
 */
import { chromium } from "../../Rail-Vault/node_modules/playwright/index.mjs";
import {
  mkdirSync,
  readFileSync,
  writeFileSync,
  existsSync,
  openSync,
  readSync,
  closeSync,
} from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST_PATH = join(ROOT, "images/screens/manifest.json");
const ENV_FILE = join(ROOT, ".env.screenshots");
const LOCAL_ENV_FILE = join(ROOT, "../Rail-Vault/.env");

function loadEnvFile(path, keysOnly = null) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    if (keysOnly && !keysOnly.includes(key)) continue;
    if (!process.env[key]) process.env[key] = trimmed.slice(eq + 1).trim();
  }
}
loadEnvFile(ENV_FILE);

const BASE_URL = (process.env.SCREENSHOT_URL || "https://cms.railintel.co.uk").replace(/\/$/, "");
const isLocalCapture = /localhost|127\.0\.0\.1/.test(BASE_URL);

if (isLocalCapture) {
  loadEnvFile(LOCAL_ENV_FILE, [
    "BOOTSTRAP_ADMIN_EMAIL",
    "BOOTSTRAP_ADMIN_PASSWORD",
    "BOOTSTRAP_ADMIN_COMPANY_CODE",
    "BOOTSTRAP_COMPANY_CODE",
  ]);
}

const COMPANY_CODE = isLocalCapture
  ? process.env.BOOTSTRAP_ADMIN_COMPANY_CODE ||
    process.env.BOOTSTRAP_COMPANY_CODE ||
    process.env.SCREENSHOT_COMPANY_CODE ||
    ""
  : process.env.SCREENSHOT_COMPANY_CODE || "";
const EMAIL = isLocalCapture
  ? process.env.BOOTSTRAP_ADMIN_EMAIL || process.env.SCREENSHOT_EMAIL || ""
  : process.env.SCREENSHOT_EMAIL || "";
const PASSWORD = isLocalCapture
  ? process.env.BOOTSTRAP_ADMIN_PASSWORD || process.env.SCREENSHOT_PASSWORD || ""
  : process.env.SCREENSHOT_PASSWORD || "";
const TARGET_COMPANY = process.env.SCREENSHOT_TARGET_COMPANY || "";

const VIEWPORT = { width: 1280, height: 800 };
const DPR = 2;

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const exact = (label) => new RegExp(`^\\s*${escapeRe(label)}\\s*$`, "i");

const settle = (page, ms = 2200) => page.waitForTimeout(ms);

function pngSize(file) {
  const fd = openSync(file, "r");
  const header = Buffer.alloc(24);
  readSync(fd, header, 0, 24, 0);
  closeSync(fd);
  if (header.toString("ascii", 12, 16) !== "IHDR") return null;
  return { width: header.readUInt32BE(16), height: header.readUInt32BE(20) };
}

function updateManifest(relativePath) {
  const fullPath = join(ROOT, relativePath);
  const size = pngSize(fullPath);
  if (!size) return;
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
  manifest[relativePath] = size;
  writeFileSync(
    MANIFEST_PATH,
    JSON.stringify(Object.fromEntries(Object.entries(manifest).sort()), null, 2) + "\n"
  );
}

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
  await page
    .locator(".rv-app-chrome, .rv-main-content")
    .first()
    .waitFor({ state: "visible", timeout: 90000 })
    .catch(async () => {
      await page.screenshot({ path: join(ROOT, "images/product/_debug-login-failed.png") });
      throw new Error("Login failed — check .env.screenshots or local Rail-Vault bootstrap credentials.");
    });
  await settle(page, 3000);
}

async function scopeToCompany(page) {
  const control = page.getByRole("button", { name: /Login as company|Viewing as/i }).first();
  const hasScopeControl = await control
    .waitFor({ state: "visible", timeout: 12000 })
    .then(() => true)
    .catch(() => false);

  if (!hasScopeControl) {
    console.log("no company scope control — using the signed-in company view");
    return;
  }

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

  await page.getByRole("button", { name: /Viewing as/i }).first().waitFor({ state: "visible", timeout: 30000 });
  console.log(`scoped to company ${code}`);
}

async function enableDarkMode(page) {
  const isDark = await page.evaluate(() => document.documentElement.classList.contains("rv-theme-dark"));
  if (isDark) return;

  await page.evaluate(() => {
    localStorage.setItem("rv_theme", "dark");
    document.documentElement.classList.add("rv-theme-dark");
  });

  const userMenu = page.locator("button").filter({ has: page.locator("p.font-bold") }).last();
  await userMenu.click({ timeout: 10000 }).catch(() => {});
  await settle(page, 600);

  const darkToggle = page.getByRole("button", { name: /Dark mode off/i }).first();
  if (await darkToggle.isVisible().catch(() => false)) {
    await darkToggle.click();
    await settle(page, 1200);
    return;
  }

  await page.keyboard.press("Escape").catch(() => {});
  await settle(page, 800);
}

async function dismissOverlays(page) {
  await page.keyboard.press("Escape").catch(() => {});
  await page.waitForTimeout(400);
}

async function scrollSidebar(page, delta) {
  await page.mouse.move(110, 400);
  await page.mouse.wheel(0, delta);
  await page.waitForTimeout(700);
}

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

async function ensureSidebarReady(page) {
  await page.locator(".rv-app-chrome, .rv-main-content").first().waitFor({ state: "visible", timeout: 30000 });
  const adminToggle = page.locator('[data-nominee-tour="administration"]').first();
  if (await adminToggle.isVisible().catch(() => false)) return;

  const openMenu = page.getByRole("button", { name: /Open menu/i }).first();
  if (await openMenu.isVisible().catch(() => false)) {
    await openMenu.click();
    await settle(page, 900);
  }
}

async function openAdminFlyout(page) {
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    await dismissOverlays(page);
    await ensureSidebarReady(page);
    await scrollSidebar(page, 1400);

    const toggles = [
      page.locator('[data-nominee-tour="administration"]').first(),
      page.getByRole("button", { name: exact("Administration") }).first(),
    ];

    for (const toggle of toggles) {
      if (!(await toggle.isVisible().catch(() => false))) continue;
      await toggle.click({ timeout: 10000 }).catch(() => {});
      await settle(page, 1800);
      if (await page.getByRole("button", { name: exact("Team Management") }).first().isVisible().catch(() => false)) {
        return;
      }
    }

    await page.evaluate(() => {
      document.querySelector('[data-nominee-tour="administration"]')?.dispatchEvent(
        new MouseEvent("click", { bubbles: true, cancelable: true })
      );
    });
    await settle(page, 1800);
    if (await page.getByRole("button", { name: exact("Team Management") }).first().isVisible().catch(() => false)) {
      return;
    }
  }

  await page.screenshot({ path: join(ROOT, "images/product/_debug-admin-flyout.png") });
  throw new Error("Administration flyout did not open (see images/product/_debug-admin-flyout.png).");
}

async function clickAdmin(page, label) {
  await openAdminFlyout(page);

  try {
    await page.getByRole("button", { name: exact(label) }).first().click({ timeout: 4000 });
  } catch {
    await page
      .getByRole("button", { name: exact("Company configuration") })
      .first()
      .click({ timeout: 8000 });
    await settle(page, 1800);
    await page.getByRole("button", { name: exact(label) }).first().click({ timeout: 15000 });
  }

  await settle(page, 2600);
  await scrollSidebar(page, -1200);
}

async function clickSidebar(page, label) {
  await dismissOverlays(page);
  await scrollSidebar(page, -1200);
  await clickControl(page, label, 10000);
  await settle(page);
}

async function shotMain(page, relativePath) {
  const main = page.locator(".rv-main-content").first();
  await main.waitFor({ state: "visible", timeout: 30000 });
  await settle(page, 1200);
  const fullPath = join(ROOT, relativePath);
  mkdirSync(dirname(fullPath), { recursive: true });
  await main.screenshot({ path: fullPath });
  updateManifest(relativePath);
  console.log("saved", relativePath);
}

async function shotViewport(page, relativePath) {
  await settle(page, 1200);
  const fullPath = join(ROOT, relativePath);
  mkdirSync(dirname(fullPath), { recursive: true });
  await page.screenshot({ path: fullPath });
  updateManifest(relativePath);
  console.log("saved", relativePath);
}

async function safeCapture(page, relativePath, navigate, mode = "main") {
  try {
    if (navigate) await navigate();
    if (mode === "viewport") await shotViewport(page, relativePath);
    else await shotMain(page, relativePath);
  } catch (err) {
    const detail = (err.message || String(err)).split("\n").slice(0, 4).join(" | ");
    console.warn(`SKIPPED ${relativePath}: ${detail}`);
  }
}

async function openFirstEmployee(page) {
  await clickSidebar(page, "Employees");
  await settle(page, 1500);

  const openers = [
    () => page.getByTitle("View Record").first().click({ timeout: 8000 }),
    () => page.locator("table tbody tr td").first().click({ timeout: 8000 }),
    () => page.getByText(/Ash Hill|John Doe/i).first().click({ timeout: 8000 }),
  ];

  for (const open of openers) {
    await open().catch(() => {});
    await settle(page, 2600);
    const onProfile = await page
      .locator("button, [role='tab'], a")
      .filter({ hasText: exact("Overview") })
      .first()
      .isVisible()
      .catch(() => false);
    if (onProfile) return;
  }
  throw new Error("Could not open an employee profile.");
}

async function employeeTab(page, group, cardTitle) {
  await dismissOverlays(page);
  const trigger = page.locator(".employee-mega-trigger-label", { hasText: exact(group) }).first();
  await trigger.hover({ timeout: 15000 });
  await settle(page, 1100);

  const card = page
    .locator("button.employee-mega-card")
    .filter({ has: page.locator(".employee-mega-card-title", { hasText: exact(cardTitle) }) })
    .first();

  if (await card.isVisible().catch(() => false)) {
    await card.click({ timeout: 10000 });
  } else {
    await trigger.click({ timeout: 10000 });
  }
  await settle(page, 2800);
}

async function captureAdministrationScreens(page) {
  const shots = [
    {
      path: "images/screens/comp-config/org-structure.png",
      nav: () => clickAdmin(page, "Organisation Structure"),
    },
    {
      path: "images/screens/comp-config/configure-company-role-permissions.png",
      nav: () => clickAdmin(page, "Role Permissions"),
    },
    {
      path: "images/screens/main-sys/role-permissions-configure.png",
      nav: async () => {
        await clickAdmin(page, "Role Permissions");
        await page.locator(".rv-main-content").first().evaluate((el) => {
          el.scrollTop = 720;
        });
        await settle(page, 900);
      },
    },
    {
      path: "images/screens/comp-config/framework-apply-cycles.png",
      nav: async () => {
        await clickAdmin(page, "Cycle Builder");
        const frameworkHeading = page.getByText(/Framework \(competency cycles?\)/i).first();
        if (await frameworkHeading.isVisible({ timeout: 4000 }).catch(() => false)) return;
        await page.getByText(/Your company cycles|Applied cycles/i).first().waitFor({ timeout: 20000 });
      },
    },
    {
      path: "images/screens/comp-config/grade-scale.png",
      nav: () => clickAdmin(page, "Grading Scale"),
    },
    {
      path: "images/screens/comp-config/set-company-standards.png",
      nav: () => clickAdmin(page, "Company Standards"),
    },
    {
      path: "images/screens/main-sys/timings-standards.png",
      nav: async () => {
        await clickAdmin(page, "Company Standards");
        const section = page.getByText(exact("Standard Timings")).first();
        await section.waitFor({ state: "visible", timeout: 15000 });
        const box = await section.evaluate((el) => {
          const pane = el.closest("section, div") || el.parentElement;
          return pane?.getBoundingClientRect();
        });
        if (box) {
          await page.locator(".rv-main-content").first().evaluate((el, top) => {
            el.scrollTop = Math.max(0, top - 24);
          }, box.y);
          await settle(page, 900);
        }
      },
    },
    {
      path: "images/screens/comp-config/set-traction-routes-depots.png",
      nav: () => clickAdmin(page, "Traction, Routes & Depots"),
    },
    {
      path: "images/screens/main-sys/addons-page.png",
      nav: () => clickSidebar(page, "Addons"),
    },
    {
      path: "images/screens/comp-config/addons-library.png",
      nav: () => clickSidebar(page, "Addons"),
    },
    {
      path: "images/screens/comp-config/investigation-apimanagement.png",
      nav: async () => {
        await openAdminFlyout(page);
        const labels = ["Investigations module link", "API management"];
        for (const label of labels) {
          const btn = page.getByRole("button", { name: exact(label) }).first();
          if (await btn.isVisible().catch(() => false)) {
            await btn.click();
            await settle(page, 2600);
            return;
          }
        }
        throw new Error("Investigations admin entry not found.");
      },
    },
    {
      path: "images/screens/train-routes/traction-route-overview.png",
      nav: async () => {
        await openFirstEmployee(page);
        await employeeTab(page, "Operations", "Trains & Routes");
      },
    },
    {
      path: "images/screens/train-routes/add-traction.png",
      mode: "viewport",
      nav: async () => {
        await openFirstEmployee(page);
        await employeeTab(page, "Operations", "Trains & Routes");
        await page.getByRole("button", { name: /Add Traction/i }).first().click({ timeout: 10000 });
        await page.getByRole("heading", { name: exact("Add Traction") }).first().waitFor({ timeout: 10000 });
        await settle(page, 1000);
      },
    },
    {
      path: "images/screens/train-routes/add-route.png",
      mode: "viewport",
      nav: async () => {
        await dismissOverlays(page);
        await page.keyboard.press("Escape").catch(() => {});
        await settle(page, 600);
        await page.getByRole("button", { name: /Add Route/i }).first().click({ timeout: 10000 });
        await page.getByRole("heading", { name: exact("Add Route") }).first().waitFor({ timeout: 10000 });
        await settle(page, 1000);
      },
    },
  ];

  for (const shot of shots) {
    await safeCapture(page, shot.path, shot.nav, shot.mode || "main");
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: DPR });
  const page = await context.newPage();

  await login(page);
  await scopeToCompany(page);
  await enableDarkMode(page);

  await captureAdministrationScreens(page);

  await browser.close();
  console.log(`\nDone — dark admin screenshots at ${VIEWPORT.width}px viewport, ${DPR}x DPR.`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
