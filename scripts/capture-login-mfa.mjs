/**
 * Captures the MFA verify step on the login page (same viewport as login-screen.png).
 * Run: node scripts/capture-login-mfa.mjs
 */
import { chromium } from "../../Rail-Vault/node_modules/playwright/index.mjs";
import { existsSync, readFileSync, writeFileSync, openSync, readSync, closeSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ENV_FILE = join(ROOT, ".env.screenshots");
const OUT = join(ROOT, "images/screens/main-sys/login-authenticator-code.png");
const MANIFEST_PATH = join(ROOT, "images/screens/manifest.json");

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

const BASE_URL = (process.env.SCREENSHOT_URL || "https://cms.railintel.co.uk").replace(/\/$/, "");
const COMPANY_CODE = process.env.SCREENSHOT_COMPANY_CODE || "";
const EMAIL = process.env.SCREENSHOT_EMAIL || "";
const PASSWORD = process.env.SCREENSHOT_PASSWORD || "";

function pngSize(file) {
  const fd = openSync(file, "r");
  const header = Buffer.alloc(24);
  readSync(fd, header, 0, 24, 0);
  closeSync(fd);
  if (header.toString("ascii", 12, 16) !== "IHDR") return null;
  return { width: header.readUInt32BE(16), height: header.readUInt32BE(20) };
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1627, height: 911 } });
await page.goto(BASE_URL, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(2000);

if (COMPANY_CODE && EMAIL && PASSWORD) {
  await page.locator('input[placeholder*="RI"], input[placeholder*="e.g"]').first().fill(COMPANY_CODE);
  await page.locator('input[type="email"]').first().fill(EMAIL);
  await page.locator('input[type="password"]').first().fill(PASSWORD);
  await page.locator('button[type="submit"]').first().click();
  await page.waitForTimeout(3500);
}

const mfaVisible = await page
  .locator("text=/authenticator|verification code|Verify and sign in/i")
  .first()
  .isVisible()
  .catch(() => false);

if (!mfaVisible) {
  console.warn("MFA screen not reached — capturing current login view as fallback.");
}

await page.screenshot({ path: OUT, fullPage: false });
const size = pngSize(OUT);
if (size) {
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
  manifest["images/screens/main-sys/login-authenticator-code.png"] = size;
  writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
}

console.log(`saved ${OUT}`, size);
await browser.close();
