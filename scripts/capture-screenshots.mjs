/**
 * Capture sharp product screenshots at 2× device pixel ratio (no browser zoom needed).
 *
 * 1. Copy .env.screenshots.example → .env.screenshots and fill in your login details.
 * 2. From Rail-Vault repo: npx playwright install chromium   (one-time)
 * 3. Run: node scripts/capture-screenshots.mjs
 *
 * Flags:
 *   --login-only      Public login screen only
 *   --employees-only  Skip global tabs (reuse existing dashboard etc.)
 *   --global-only     Skip employee profile tabs
 */
import { chromium } from "../../Rail-Vault/node_modules/playwright/index.mjs";
import { mkdirSync, readFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "../images/product");
const ENV_FILE = join(__dirname, "../.env.screenshots");

function loadEnvFile() {
  if (!existsSync(ENV_FILE)) return;
  for (const line of readFileSync(ENV_FILE, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile();

const loginOnly = process.argv.includes("--login-only");
const employeesOnly = process.argv.includes("--employees-only");
const globalOnly = process.argv.includes("--global-only");
const BASE_URL = process.env.SCREENSHOT_URL || "https://cms.railintel.co.uk";
const COMPANY_CODE = process.env.SCREENSHOT_COMPANY_CODE || "";
const EMAIL = process.env.SCREENSHOT_EMAIL || "";
const PASSWORD = process.env.SCREENSHOT_PASSWORD || "";

const VIEWPORT = { width: 1440, height: 900 };
const DPR = 2;
let scopedCompanyId = null;

async function waitForApp(page) {
  await page.waitForLoadState("networkidle", { timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(1500);
}

async function login(page) {
  if (!COMPANY_CODE || !EMAIL || !PASSWORD) {
    throw new Error(
      "Create .env.screenshots from .env.screenshots.example with your login details."
    );
  }

  await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
  await waitForApp(page);

  await page.locator('input[type="email"]').first().fill(EMAIL);
  await page.locator('input[placeholder*="RI"], input[placeholder*="e.g"]').first().fill(COMPANY_CODE);
  await page.locator('input[autocomplete="current-password"], input[type="password"]').first().fill(PASSWORD);
  await page.locator('button[type="submit"]').first().click();

  await page.waitForSelector("text=Dashboard", { timeout: 90000 });
  await waitForApp(page);
}

async function shot(page, filename, navigate) {
  if (navigate) await navigate();
  await waitForApp(page);
  await page.screenshot({ path: join(OUT_DIR, filename), fullPage: false });
  console.log("saved", filename);
}

async function goTab(page, tab) {
  await page.goto(`${BASE_URL.replace(/\/$/, "")}/?tab=${tab}`, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
}

async function listCompanyIds(page, preferredCode) {
  return page.evaluate(async (code) => {
    const res = await fetch("/api/companies", { cache: "no-store" });
    const companies = res.ok ? await res.json() : [];
    if (!Array.isArray(companies)) return [];

    const norm = String(code).trim().toLowerCase();
    return companies
      .map((c) => String(c.id))
      .sort((a, b) => {
        const score = (id) => (id.toLowerCase() === norm ? 0 : 1);
        return score(a) - score(b);
      });
  }, preferredCode);
}

async function scopeToCompanyId(page, companyId) {
  if (scopedCompanyId === companyId) return;

  const impersonationBtn = page.getByRole("button", { name: /Login as company|Viewing as/i });
  if (!(await impersonationBtn.count())) {
    scopedCompanyId = companyId;
    return;
  }

  await impersonationBtn.first().click();
  await page.waitForTimeout(1500);

  const companyOption = page
    .locator("button")
    .filter({
      hasText: new RegExp(`\\(${companyId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\)`, "i"),
    })
    .first();

  if (!(await companyOption.count())) {
    throw new Error(`Company ${companyId} not found in company picker.`);
  }

  await companyOption.click();
  await waitForApp(page);
  scopedCompanyId = companyId;
}

async function resolvePreferredCompanyId(page) {
  const companyId = await page.evaluate(async (code) => {
    const res = await fetch("/api/companies", { cache: "no-store" });
    if (!res.ok) return String(code);
    const companies = await res.json();
    if (!Array.isArray(companies)) return String(code);
    const norm = String(code).trim().toLowerCase();
    const match = companies.find((c) => {
      const id = String(c.id ?? "").trim().toLowerCase();
      const companyCode = String(c.company_code ?? c.companyCode ?? "").trim().toLowerCase();
      return id === norm || companyCode === norm;
    });
    return match?.id ? String(match.id) : String(code);
  }, COMPANY_CODE);

  await scopeToCompanyId(page, companyId);
  return companyId;
}

async function resolveEmployeeContext(page) {
  const companyIds = await listCompanyIds(page, COMPANY_CODE);

  for (const companyId of companyIds) {
    await scopeToCompanyId(page, companyId);
    const employeeId = await page.evaluate(async (cid) => {
      const res = await fetch(`/api/employees?companyCode=${encodeURIComponent(cid)}`, {
        cache: "no-store",
      });
      if (!res.ok) return null;
      const employees = await res.json();
      if (!Array.isArray(employees) || employees.length === 0) return null;
      return String(employees[0].id);
    }, companyId);

    if (employeeId) {
      console.log(`employee screenshots using company ${companyId}`);
      return { companyId, employeeId };
    }
  }

  throw new Error("No employee records found in any company.");
}

async function goEmployeeProfile(page, employeeId, profileTab, companyId) {
  const url = `${BASE_URL.replace(/\/$/, "")}/?tab=employees&employeeId=${encodeURIComponent(employeeId)}&profileTab=${encodeURIComponent(profileTab)}&companyCode=${encodeURIComponent(companyId)}`;
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await waitForApp(page);
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: DPR,
  });
  const page = await context.newPage();

  if (!employeesOnly) {
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
    await waitForApp(page);
    await shot(page, "login.png");
  }

  if (loginOnly) {
    await browser.close();
    console.log("\nLogin screenshot saved. Add .env.screenshots to capture the rest.");
    return;
  }

  await login(page);
  await resolvePreferredCompanyId(page);

  if (!employeesOnly) {
    await shot(page, "dashboard.png", () => goTab(page, "dashboard"));
    await shot(page, "reporting-analytics.png", () => goTab(page, "reporting"));
    await shot(page, "reporting-analytics-2.png", () => goTab(page, "reporting"));
    await shot(page, "cycle-builder.png", () => goTab(page, "cycle-builder"));
    await shot(page, "qa-verifications.png", () => goTab(page, "qa-verifications"));
    await shot(page, "org-structure.png", () => goTab(page, "org-structure"));
    await shot(page, "traction-routes.png", () => goTab(page, "traction-routes"));
    await shot(page, "safety-briefs.png", () => goTab(page, "safety-briefs"));
    await shot(page, "trainee-hours.png", () => goTab(page, "trainee-driver"));
  }

  if (globalOnly) {
    await browser.close();
    console.log("\nDone — global images/product/ updated at 2× DPR (2880×1800 px).");
    return;
  }

  const { companyId, employeeId } = await resolveEmployeeContext(page);

  await shot(page, "licence.png", () => goEmployeeProfile(page, employeeId, "Licence", companyId));
  await shot(page, "medical-record.png", async () => {
    await goEmployeeProfile(page, employeeId, "Medical", companyId);
    const addBtn = page.getByRole("button", { name: /New Medical Record/i }).first();
    if (await addBtn.count()) await addBtn.click({ timeout: 10000 }).catch(() => {});
  });
  await shot(page, "training-quals.png", () =>
    goEmployeeProfile(page, employeeId, "Training", companyId)
  );
  await shot(page, "current-cycles.png", () =>
    goEmployeeProfile(page, employeeId, "Cycles", companyId)
  );
  await shot(page, "active-assessment.png", async () => {
    await goEmployeeProfile(page, employeeId, "Cycles", companyId);
    const assessBtn = page
      .getByRole("button", { name: /Return to assessment|Open assessment|View assessment/i })
      .first();
    if (await assessBtn.count()) await assessBtn.click({ timeout: 15000 });
    await waitForApp(page);
  });
  await shot(page, "incidents-cdp.png", () =>
    goEmployeeProfile(page, employeeId, "Monitoring", companyId)
  );
  await shot(page, "cab-passes.png", () =>
    goEmployeeProfile(page, employeeId, "Cab Passes", companyId)
  );

  await browser.close();
  console.log("\nDone — images/product/ updated at 2× DPR (2880×1800 px).");
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
