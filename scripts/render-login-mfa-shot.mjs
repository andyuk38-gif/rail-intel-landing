/**
 * Renders login-mfa-verify.png to match login-screen.png dimensions and backdrop.
 */
import { chromium } from "../../Rail-Vault/node_modules/playwright/index.mjs";
import { openSync, readSync, closeSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LOGIN_BG = join(ROOT, "images/screens/main-sys/login-screen.png");
const OUT = join(ROOT, "images/screens/main-sys/login-mfa-verify.png");
const MANIFEST_PATH = join(ROOT, "images/screens/manifest.json");

function pngSize(file) {
  const fd = openSync(file, "r");
  const header = Buffer.alloc(24);
  readSync(fd, header, 0, 24, 0);
  closeSync(fd);
  if (header.toString("ascii", 12, 16) !== "IHDR") return null;
  return { width: header.readUInt32BE(16), height: header.readUInt32BE(20) };
}

const bgSize = pngSize(LOGIN_BG);
const bgData = readFileSync(LOGIN_BG).toString("base64");

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      width: ${bgSize.width}px;
      height: ${bgSize.height}px;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #0a0f16 url('data:image/png;base64,${bgData}') center / cover no-repeat;
    }
    .card {
      position: absolute;
      left: 4.5%;
      top: 50%;
      transform: translateY(-50%);
      width: min(22rem, 34vw);
      padding: 1.35rem 1.4rem 1.5rem;
      border-radius: 1.35rem;
      border: 1px solid rgba(255,255,255,0.22);
      background: rgba(15, 23, 42, 0.42);
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
      color: #fff;
      box-shadow: 0 24px 60px rgba(0,0,0,0.35);
    }
    .icon {
      width: 2.75rem;
      height: 2.75rem;
      margin: 0 auto 0.75rem;
      border-radius: 1rem;
      background: rgba(255,255,255,0.92);
      border: 1px solid rgba(255,255,255,0.4);
      display: grid;
      place-items: center;
      color: #243c96;
      font-size: 1.15rem;
    }
    h1 {
      margin: 0 0 0.45rem;
      text-align: center;
      font-size: 1.2rem;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .hint, .email {
      margin: 0;
      text-align: center;
      font-size: 0.82rem;
      line-height: 1.45;
      color: rgba(255,255,255,0.82);
    }
    .email { margin-top: 0.35rem; font-size: 0.75rem; color: rgba(255,255,255,0.7); }
    .otp {
      display: flex;
      justify-content: center;
      gap: 0.45rem;
      margin: 1.1rem 0 0.95rem;
    }
    .otp span {
      width: 2.35rem;
      height: 2.75rem;
      border-radius: 0.75rem;
      border: 1px solid #e2e8f0;
      background: #f8fafc;
      display: grid;
      place-items: center;
      font-size: 1.15rem;
      font-weight: 600;
      color: #0f172a;
    }
    .trust {
      display: flex;
      gap: 0.55rem;
      align-items: flex-start;
      margin-bottom: 0.95rem;
      font-size: 0.78rem;
      color: rgba(255,255,255,0.88);
    }
    .trust input { margin-top: 0.15rem; }
    .btn {
      width: 100%;
      padding: 0.9rem 1rem;
      border: 0;
      border-radius: 0.85rem;
      background: #243c96;
      color: #fff;
      font-size: 0.95rem;
      font-weight: 700;
    }
    .link {
      display: block;
      margin-top: 0.75rem;
      text-align: center;
      font-size: 0.8rem;
      color: rgba(255,255,255,0.88);
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">🛡</div>
    <h1>Authenticator code</h1>
    <p class="hint">Enter the 6-digit code from your authenticator app.</p>
    <p class="email">email@railintel.co.uk</p>
    <div class="otp" aria-hidden="true">
      <span>9</span><span>8</span><span>5</span><span>9</span><span>7</span><span>6</span>
    </div>
    <label class="trust"><input type="checkbox" checked /> <span>Trust this device for 14 days</span></label>
    <button type="button" class="btn">Verify and sign in</button>
    <span class="link">Use a backup code</span>
  </div>
</body>
</html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: bgSize.width, height: bgSize.height } });
await page.setContent(html, { waitUntil: "networkidle" });
await page.screenshot({ path: OUT });
await browser.close();

const size = pngSize(OUT);
const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
manifest["images/screens/main-sys/login-mfa-verify.png"] = size;
writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
console.log("rendered", OUT, size);
