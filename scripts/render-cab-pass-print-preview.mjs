/**
 * Renders credit-card print preview sheets (matching CMS CabPassScaledCardPreview)
 * and a dark "Pass layout & print" panel for the Digital Cab Passes feature page.
 *
 * Usage: node scripts/render-cab-pass-print-preview.mjs
 */
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { spawnSync } from "child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "images/screens/cab-passes");
const TMP = "/tmp/cab-print";
mkdirSync(OUT, { recursive: true });
mkdirSync(TMP, { recursive: true });

const vaultPw = join(ROOT, "../Rail-Vault/node_modules/playwright/index.mjs");
if (!existsSync(vaultPw)) {
  console.error("Playwright not found at", vaultPw);
  process.exit(1);
}
const { chromium } = await import(vaultPw);

// Crop pass card from issued green pass screenshot
const cropPy = `
from PIL import Image
img = Image.open(${JSON.stringify(join(ROOT, "images/screens/cab-passes/green-pass-issued-dark.png"))}).convert("RGB")
card = img.crop((8, 28, 380, 268))
card.save(${JSON.stringify(join(TMP, "pass-front.png"))})
print(card.size)
`;
const py = spawnSync("python3", ["-c", cropPy], { encoding: "utf8" });
if (py.status !== 0) {
  console.error(py.stderr || py.stdout);
  process.exit(1);
}

const passFront = join(TMP, "pass-front.png");
const logoPath = join(ROOT, "images/rail-intel-icon.png");
const CARD_W_MM = "85.6mm";
const CARD_H_MM = "53.98mm";

const PRINT_CSS = `
@page { size: A4 portrait; margin: 12mm; }
html, body { margin: 0; padding: 0; background: #e2e8f0; }
body {
  font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
  color: #0f172a;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.sheet {
  width: 210mm;
  min-height: 297mm;
  margin: 0 auto 12mm;
  background: #fff;
  box-sizing: border-box;
  padding: 12mm;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 30px rgba(15,23,42,.18);
}
.cab-pass-print-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10mm;
  margin-bottom: 8mm;
  padding-bottom: 4mm;
  border-bottom: 1px solid #cbd5e1;
}
.cab-pass-print-instructions { flex: 1; min-width: 0; }
.cab-pass-print-instructions h1 {
  margin: 0 0 2.5mm;
  font-size: 13pt;
  font-weight: 800;
  letter-spacing: -0.01em;
}
.cab-pass-print-instructions p {
  margin: 0 0 2mm;
  font-size: 9.5pt;
  line-height: 1.45;
  color: #334155;
}
.cab-pass-print-instructions ol {
  margin: 2mm 0 0;
  padding-left: 5mm;
  font-size: 9pt;
  line-height: 1.4;
  color: #475569;
}
.cab-pass-print-instructions li { margin-bottom: 1mm; }
.cab-pass-print-logo {
  flex-shrink: 0;
  width: 28mm;
  height: auto;
}
.cab-pass-print-card-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6mm 4mm 10mm;
}
.cab-pass-cut-zone {
  position: relative;
  box-sizing: content-box;
  width: ${CARD_W_MM};
  height: ${CARD_H_MM};
  padding: 4mm;
  border: 1.5px dashed #64748b;
  border-radius: 2mm;
  background: #f8fafc;
}
.cab-pass-cut-label {
  position: absolute;
  top: -5mm;
  left: 50%;
  transform: translateX(-50%);
  margin: 0;
  padding: 0.5mm 2.5mm;
  font-size: 7.5pt;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #64748b;
  background: #fff;
  white-space: nowrap;
}
.cab-pass-scissors {
  position: absolute;
  font-size: 13pt;
  line-height: 1;
  color: #64748b;
}
.cab-pass-scissors-tl { top: -2mm; left: -1mm; transform: rotate(-50deg); }
.cab-pass-scissors-tr { top: -2mm; right: -1mm; transform: rotate(40deg) scaleX(-1); }
.cab-pass-scissors-bl { bottom: -2mm; left: -1mm; transform: rotate(50deg) scaleX(-1); }
.cab-pass-scissors-br { bottom: -2mm; right: -1mm; transform: rotate(-40deg); }
.cab-pass-card-slot {
  width: ${CARD_W_MM};
  height: ${CARD_H_MM};
  overflow: hidden;
  border-radius: 0.8mm;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.12);
  background: #fff;
}
.cab-pass-card-slot img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: left center;
}
.cab-pass-page-footer {
  margin-top: auto;
  padding-top: 4mm;
  text-align: center;
  font-size: 8.5pt;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #64748b;
}
.sheet--back .cab-pass-card-slot { transform: rotate(180deg); }
.pass-reverse {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 1.6mm;
  border: 0.35mm solid rgba(0,0,0,.25);
  border-radius: 0.8mm;
  background: #fff;
  color: #000;
  display: flex;
  flex-direction: column;
  font-family: "Segoe UI", system-ui, sans-serif;
}
.pass-reverse h2 {
  margin: 0;
  text-align: center;
  font-size: 2.35mm;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #475569;
}
.pass-reverse ul {
  margin: 0.9mm 0 0;
  padding-left: 3.35mm;
  flex: 1;
  font-size: 1.85mm;
  line-height: 1.35;
}
.pass-reverse li { margin-bottom: 0.55mm; }
.pass-reverse .return {
  margin-top: 0.8mm;
  font-size: 1.65mm;
  color: #64748b;
}
`;

function sheet(face, isBack = false) {
  const cardInner = isBack
    ? `<div class="pass-reverse">
        <h2>Conditions of use</h2>
        <ul>
          <li>The number of staff in the leading cab must not exceed limits set by company policy, unless specially authorised by a GREEN CAB PASS holder.</li>
          <li>This pass must be shown to the driver before entering the cab and at any other time as required.</li>
          <li>This pass must only be used by the person to whom it was issued. The holder must not interfere with any part of the cab, nor obstruct or distract the driver or guard.</li>
          <li>The holder may use it only when necessary for the proper performance of their duties. It remains the property of the issuing organisation and may be withdrawn without notice.</li>
        </ul>
        <p class="return">If found please return to: Example Rail Co, Manchester.</p>
      </div>`
    : `<img src="file://${face}" alt="Driving cab pass front" />`;

  return `<div class="sheet${isBack ? " sheet--back" : ""}">
  <div class="cab-pass-print-header">
    <div class="cab-pass-print-instructions">
      <h1>Driving cab pass — print &amp; cut</h1>
      <p>
        ISO ID-1 credit-card size (${CARD_W_MM}&nbsp;&times;&nbsp;${CARD_H_MM} landscape).
        Print <strong>both pages</strong> using your printer&rsquo;s <strong>double-sided</strong> option
        with <strong>Flip on long edge</strong> so the front and reverse align when cut out.
      </p>
      <ol>
        <li>Load paper and open print settings — choose <strong>Print on both sides</strong> / duplex.</li>
        <li>Select <strong>Flip on long edge</strong> (not short edge).</li>
        <li>Print page&nbsp;1 (front), then page&nbsp;2 (reverse) on the back of the same sheet.</li>
        <li>Cut along the dotted line. Optional: laminate for durability.</li>
      </ol>
    </div>
    <img class="cab-pass-print-logo" src="file://${logoPath}" alt="Rail Intel" />
  </div>
  <div class="cab-pass-print-card-area">
    <div class="cab-pass-cut-zone">
      <p class="cab-pass-cut-label">Cut along dotted line</p>
      <span class="cab-pass-scissors cab-pass-scissors-tl" aria-hidden="true">&#9986;</span>
      <span class="cab-pass-scissors cab-pass-scissors-tr" aria-hidden="true">&#9986;</span>
      <span class="cab-pass-scissors cab-pass-scissors-bl" aria-hidden="true">&#9986;</span>
      <span class="cab-pass-scissors cab-pass-scissors-br" aria-hidden="true">&#9986;</span>
      <div class="cab-pass-card-slot">${cardInner}</div>
    </div>
  </div>
  <p class="cab-pass-page-footer">${isBack ? "Page 2 — Reverse (flip on long edge)" : "Page 1 — Front"}</p>
</div>`;
}

writeFileSync(
  join(TMP, "print-sheets.html"),
  `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${PRINT_CSS}</style></head>
<body>${sheet(passFront, false)}${sheet("", true)}</body></html>`
);

writeFileSync(
  join(TMP, "layout-panel.html"),
  `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
html,body{margin:0;background:#0b111a;font-family:system-ui,-apple-system,sans-serif;color:#e8edf5}
.wrap{padding:28px;max-width:920px;margin:0 auto}
.panel{border:1px solid rgba(226,232,240,.14);border-radius:14px;background:#121a26;padding:18px 20px}
.head{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:10px}
.label{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#93a0b5}
.btn{display:inline-flex;align-items:center;gap:6px;border:1px solid #64748b;background:#1e293b;color:#e2e8f0;border-radius:10px;padding:7px 11px;font-size:12px;font-weight:600}
.copy{font-size:12px;line-height:1.45;color:#93a0b5;margin:0 0 14px;max-width:42rem}
.card{display:flex;justify-content:center;padding:8px 0 4px}
.card img{width:min(100%,420px);height:auto;border-radius:8px;border:1px solid rgba(255,255,255,.12);box-shadow:0 18px 40px rgba(0,0,0,.35)}
.hint{margin:10px auto 0;text-align:center;font-size:10px;color:#6b778c;max-width:22rem}
</style></head><body>
<div class="wrap"><div class="panel">
  <div class="head">
    <p class="label">Pass layout &amp; print</p>
    <button class="btn" type="button">🖨 Print credit-card size</button>
  </div>
  <p class="copy">Landscape ISO ID-1 layout (85.6 × 53.98 mm). Tap the card to flip — conditions of use are on the reverse. <strong style="color:#cbd5e1">Print credit-card size</strong> opens a two-page A4 sheet (front and reverse) with cut guides — use double-sided print, flip on long edge.</p>
  <div class="card"><img src="file://${passFront}" alt="Credit-card cab pass preview" /></div>
  <p class="hint">Tap the card to flip — front shows all lines on the left, photo and verification QR in matching panels on the right; reverse shows conditions of use.</p>
</div></div>
</body></html>`
);

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 900, height: 1200 }, deviceScaleFactor: 2 });
await page.goto(`file://${join(TMP, "print-sheets.html")}`, { waitUntil: "load" });
await page.waitForTimeout(400);
await page.locator(".sheet").nth(0).screenshot({ path: join(OUT, "cab-pass-print-front.png") });
await page.locator(".sheet").nth(1).screenshot({ path: join(OUT, "cab-pass-print-reverse.png") });

await page.setViewportSize({ width: 1000, height: 700 });
await page.goto(`file://${join(TMP, "layout-panel.html")}`, { waitUntil: "load" });
await page.waitForTimeout(300);
await page.locator(".panel").screenshot({ path: join(OUT, "cab-pass-print-layout-panel.png") });
await browser.close();

console.log("Wrote:");
for (const f of ["cab-pass-print-front.png", "cab-pass-print-reverse.png", "cab-pass-print-layout-panel.png"]) {
  console.log(" ", join(OUT, f));
}
