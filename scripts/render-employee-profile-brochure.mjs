/**
 * Renders the Employee Profile brochure page mockup (no personal data).
 * Run: node scripts/render-employee-profile-brochure.mjs
 */
import { chromium } from "../../Rail-Vault/node_modules/playwright/index.mjs";
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "images/product/employee-profile-brochure-page.png");
const WIDTH = 520;
const HEIGHT = 728;

const iconB64 = readFileSync(join(ROOT, "images/rail-intel-icon.png")).toString("base64");
const headshotB64 = readFileSync(join(ROOT, "images/product/brochure-headshot.png")).toString("base64");

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: ${WIDTH}px;
      height: ${HEIGHT}px;
      overflow: hidden;
      font-family: "Outfit", -apple-system, sans-serif;
      background: #0b1528;
      color: #fff;
    }
    .page {
      position: relative;
      width: 100%;
      height: 100%;
      background: linear-gradient(165deg, #0b1528 0%, #0a1220 100%);
      overflow: hidden;
    }
    .header-art {
      position: absolute;
      inset: 0 0 auto 0;
      height: 210px;
      overflow: hidden;
    }
    .header-art__shape-a {
      position: absolute;
      left: -8%;
      top: -30%;
      width: 72%;
      height: 130%;
      background: linear-gradient(135deg, #5c2438 0%, #3d1a2a 55%, transparent 100%);
      transform: skewX(-18deg);
      opacity: 0.95;
    }
    .header-art__shape-b {
      position: absolute;
      right: -5%;
      top: -20%;
      width: 58%;
      height: 120%;
      background: linear-gradient(120deg, #1e4a5a 0%, #2a5f6e 40%, #1a3d4d 100%);
      transform: skewX(-12deg);
      opacity: 0.88;
    }
    .top-bar {
      position: relative;
      z-index: 2;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 22px 24px 0;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .brand__icon {
      width: 42px;
      height: 42px;
      border-radius: 10px;
      object-fit: cover;
      flex-shrink: 0;
    }
    .brand__text {
      font-size: 1.35rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      line-height: 1;
    }
    .brand__text span { color: #e85d4a; }
    .doc-label {
      text-align: right;
      font-size: 0.62rem;
      font-weight: 600;
      letter-spacing: 0.14em;
      line-height: 1.55;
      color: rgba(255,255,255,0.92);
    }
    .content {
      position: relative;
      z-index: 2;
      padding: 18px 24px 20px;
    }
    .kicker {
      font-size: 0.58rem;
      font-weight: 600;
      letter-spacing: 0.16em;
      color: #6b8fb8;
      margin-bottom: 6px;
    }
    .name {
      font-size: 1.85rem;
      font-weight: 700;
      letter-spacing: -0.03em;
      line-height: 1.1;
      margin-bottom: 4px;
    }
    .role {
      font-size: 0.95rem;
      font-weight: 500;
      color: #8fa8c4;
      margin-bottom: 18px;
    }
    .profile-row {
      display: grid;
      grid-template-columns: 108px 1fr;
      gap: 16px;
      align-items: start;
      margin-bottom: 16px;
    }
    .photo {
      width: 108px;
      height: 132px;
      border-radius: 10px;
      object-fit: cover;
      object-position: center top;
      display: block;
      border: 1px solid rgba(255,255,255,0.08);
    }
    .fields {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px 14px;
      padding-top: 2px;
    }
    .field__label {
      font-size: 0.5rem;
      font-weight: 600;
      letter-spacing: 0.12em;
      color: #6b8fb8;
      margin-bottom: 2px;
    }
    .field__value {
      font-size: 0.78rem;
      font-weight: 600;
      color: #fff;
    }
    .confidential {
      display: inline-block;
      margin-bottom: 14px;
      padding: 5px 14px;
      border: 1px solid rgba(255,255,255,0.35);
      border-radius: 999px;
      font-size: 0.48rem;
      font-weight: 600;
      letter-spacing: 0.1em;
      color: rgba(255,255,255,0.9);
    }
    .notice {
      border: 1px solid #c9a24d;
      border-radius: 10px;
      background: rgba(201, 162, 77, 0.08);
      padding: 12px 14px;
      margin-bottom: 16px;
    }
    .notice__title {
      font-size: 0.72rem;
      font-weight: 700;
      color: #d4a853;
      margin-bottom: 6px;
    }
    .notice__body {
      font-size: 0.5rem;
      line-height: 1.55;
      color: rgba(255,255,255,0.78);
    }
    .footer {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 8px;
      padding-top: 12px;
      border-top: 1px solid rgba(255,255,255,0.12);
    }
    .footer__label {
      font-size: 0.46rem;
      font-weight: 600;
      letter-spacing: 0.1em;
      color: #6b8fb8;
      margin-bottom: 2px;
    }
    .footer__value {
      font-size: 0.52rem;
      font-weight: 500;
      color: rgba(255,255,255,0.85);
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header-art">
      <div class="header-art__shape-a"></div>
      <div class="header-art__shape-b"></div>
    </div>
    <div class="top-bar">
      <div class="brand">
        <img class="brand__icon" src="data:image/png;base64,${iconB64}" alt="" />
        <div class="brand__text">Rail <span>Intel</span></div>
      </div>
      <div class="doc-label">
        RAIL INTEL<br />EMPLOYEE RECORD
      </div>
    </div>
    <div class="content">
      <p class="kicker">COMPLETE EMPLOYEE PROFILE</p>
      <h1 class="name">Employee profile</h1>
      <p class="role">Competence record</p>
      <div class="profile-row">
        <img class="photo" src="data:image/png;base64,${headshotB64}" alt="" />
        <div class="fields">
          <div>
            <p class="field__label">EMPLOYEE ID</p>
            <p class="field__value">—</p>
          </div>
          <div>
            <p class="field__label">COMPANY</p>
            <p class="field__value">—</p>
          </div>
          <div>
            <p class="field__label">WORK STATUS</p>
            <p class="field__value">—</p>
          </div>
          <div>
            <p class="field__label">MONITORING</p>
            <p class="field__value">—</p>
          </div>
          <div>
            <p class="field__label">LICENCE NO.</p>
            <p class="field__value">—</p>
          </div>
          <div>
            <p class="field__label">LICENCE EXPIRY</p>
            <p class="field__value">—</p>
          </div>
        </div>
      </div>
      <p class="confidential">CONFIDENTIAL · NOT FOR ONWARD DISCLOSURE</p>
      <div class="notice">
        <p class="notice__title">Data protection notice</p>
        <p class="notice__body">This document contains personal and special category data. Handle, store and dispose of it in line with UK GDPR, the Data Protection Act 2018 and applicable data protection laws in your jurisdiction.</p>
      </div>
      <div class="footer">
        <div>
          <p class="footer__label">Reference</p>
          <p class="footer__value">RV-PROFILE-EXAMPLE</p>
        </div>
        <div>
          <p class="footer__label">Produced</p>
          <p class="footer__value">—</p>
        </div>
        <div>
          <p class="footer__label">Produced by</p>
          <p class="footer__value">—</p>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

const browser = await chromium.launch({
  headless: true,
  channel: "chrome",
});
const page = await browser.newPage({
  viewport: { width: WIDTH, height: HEIGHT },
  deviceScaleFactor: 2,
});
await page.setContent(html, { waitUntil: "networkidle" });
await page.waitForTimeout(400);
const buffer = await page.screenshot({ type: "png", omitBackground: false });
await browser.close();

writeFileSync(OUT, buffer);
console.log(`wrote ${OUT} (${WIDTH * 2}×${HEIGHT * 2}px)`);
