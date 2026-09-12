/**
 * Bakes dark-mode versions of Administration section screenshots by re-rendering
 * the existing PNGs through the app's dark-theme colour transform.
 *
 * Skips hero adminmenu.png and login-screen.png.
 *
 *   node scripts/bake-dark-screenshots.mjs
 */
import { chromium } from "../../Rail-Vault/node_modules/playwright/index.mjs";
import {
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

/** Standard UI dark-mode transform for light screenshots. */
const DARK_FILTER = "invert(1) hue-rotate(180deg) brightness(0.94) contrast(0.96) saturate(0.9)";

const TARGETS = [
  "images/screens/comp-config/org-structure.png",
  "images/screens/comp-config/configure-company-role-permissions.png",
  "images/screens/main-sys/role-permissions-configure.png",
  "images/screens/comp-config/framework-apply-cycles.png",
  "images/screens/comp-config/grade-scale.png",
  "images/screens/comp-config/set-company-standards.png",
  "images/screens/main-sys/timings-standards.png",
  "images/screens/train-routes/traction-route-overview.png",
  "images/screens/train-routes/add-traction.png",
  "images/screens/train-routes/add-route.png",
  "images/screens/comp-config/set-traction-routes-depots.png",
  "images/screens/main-sys/addons-page.png",
  "images/screens/comp-config/addons-library.png",
  "images/screens/comp-config/investigation-apimanagement.png",
];

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

async function bakeOne(page, relativePath) {
  const fullPath = join(ROOT, relativePath);
  if (!existsSync(fullPath)) {
    console.warn(`SKIP missing ${relativePath}`);
    return;
  }

  const size = pngSize(fullPath);
  if (!size) {
    console.warn(`SKIP unreadable ${relativePath}`);
    return;
  }

  const dataUrl = `data:image/png;base64,${readFileSync(fullPath).toString("base64")}`;
  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: ${size.width}px; height: ${size.height}px; overflow: hidden; background: #0f172a; }
      img {
        display: block;
        width: ${size.width}px;
        height: ${size.height}px;
        filter: ${DARK_FILTER};
      }
    </style>
  </head>
  <body><img id="shot" src="${dataUrl}" alt="" /></body>
</html>`;

  await page.setViewportSize({ width: size.width, height: size.height });
  await page.setContent(html, { waitUntil: "load" });
  await page.waitForFunction(() => {
    const img = document.getElementById("shot");
    return img instanceof HTMLImageElement && img.complete && img.naturalWidth > 0;
  });
  await page.locator("img").screenshot({ path: fullPath });
  updateManifest(relativePath);
  console.log("baked", relativePath);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ deviceScaleFactor: 1 });

  for (const target of TARGETS) {
    await bakeOne(page, target);
  }

  await browser.close();
  console.log(`\nDone — baked ${TARGETS.length} dark screenshots.`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
