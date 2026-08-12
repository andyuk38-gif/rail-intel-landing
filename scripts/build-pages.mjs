/**
 * Generates the Products, Features and How it works pages from content/site.mjs,
 * and keeps the shared navigation in index.html in step with them.
 *
 * Output is plain static HTML committed to the repo, so GitHub Pages serves it
 * directly and there is no build step at request time.
 *
 * Run: node scripts/build-pages.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { site, addons, capacityAddons, featureGroups, howItWorks } from "../content/site.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(readFileSync(join(root, "images/screens/manifest.json"), "utf8"));

const ASSET_VERSION = 13;

const esc = (value) =>
  String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Supports **bold** in body copy so the content file stays readable. */
const rich = (value) => esc(value).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

/* ------------------------------------------------------------------ chrome */

function renderNav(base) {
  // The trigger is a link so a desktop click goes to the section index, while
  // hover (or a tap on touch) reveals the panel.
  const group = (id, label, items, allHref, allLabel) => `
          <div class="nav-group" data-nav-group data-open="false">
            <a class="nav-trigger" href="${base}${allHref}" data-nav-trigger aria-expanded="false" aria-controls="${id}-panel">
              ${esc(label)}<span class="nav-trigger__chevron" aria-hidden="true"></span>
            </a>
            <div class="nav-panel" id="${id}-panel">
              <div class="nav-panel__grid">
${items
  .map(
    (item) => `                <a class="nav-panel__item" href="${base}${item.href}">
                  <span class="nav-panel__dot" aria-hidden="true"></span>
                  <span>
                    <span class="nav-panel__title">${esc(item.name)}</span>
                    <span class="nav-panel__desc">${esc(item.summary)}</span>
                  </span>
                </a>`
  )
  .join("\n")}
              </div>
              <div class="nav-panel__footer">
                <a class="nav-panel__all" href="${base}${allHref}">${esc(allLabel)} &rarr;</a>
              </div>
            </div>
          </div>`;

  const productItems = addons.map((addon) => ({
    name: addon.name,
    summary: addon.summary,
    href: `products/${addon.slug}.html`,
  }));

  const featureItems = featureGroups.map((featureGroup) => ({
    name: featureGroup.name,
    summary: featureGroup.summary,
    href: `features/${featureGroup.slug}.html`,
  }));

  return `<nav class="nav" aria-label="Main">
        <button type="button" class="nav-toggle" data-nav-toggle aria-expanded="false" aria-label="Menu">
          <span></span><span></span><span></span>
        </button>
        <div class="nav-menu" data-nav-menu data-open="false">${group(
          "product",
          "Product",
          productItems,
          "products/",
          "All add-on modules"
        )}${group("features", "Features", featureItems, "features/", "All features")}
          <a href="${base}how-it-works.html" class="nav-link">How it works</a>
          <a href="${site.app}" class="nav-link">Log in</a>
          <a href="${site.app}" class="btn btn-primary">Go to app</a>
        </div>
      </nav>`;
}

function renderHead(base, { title, description }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}" />
  <link rel="icon" href="${base}images/favicon-32.png" type="image/png" sizes="32x32" />
  <link rel="icon" href="${base}images/favicon-16.png" type="image/png" sizes="16x16" />
  <link rel="apple-touch-icon" href="${base}images/apple-touch-icon.png" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="${base}css/style.css?v=${ASSET_VERSION}" />
  <link rel="stylesheet" href="${base}css/pages.css?v=${ASSET_VERSION}" />
  <style>
    /* Critical: keep under-dev banner visible even if stylesheet is cached */
    .site-chrome { position: fixed; top: 0; left: 0; right: 0; z-index: 200; }
    .dev-banner { background: #f59e0b; color: #0c0f14; text-align: center; padding: 0.55rem 1.5rem; }
    .dev-banner p { margin: 0; font-size: 0.8125rem; font-weight: 600; }
  </style>
</head>
<body>
  <div class="site-chrome">
    <div class="dev-banner" role="status">
      <p>This site is currently under development.</p>
    </div>
    <header class="header">
      <div class="container">
        <a href="${base || "/"}" class="logo">
          <img src="${base}images/rail-intel-icon.png" alt="" class="logo-img" width="512" height="512" />
          <span class="logo-text">Rail Intel</span>
        </a>
        ${renderNav(base)}
      </div>
    </header>
  </div>
`;
}

function renderFooter(base) {
  return `  <footer class="footer">
    <div class="container">
      <p class="footer-brand">Rail Intel</p>
      <nav class="footer-nav" aria-label="Footer">
        <a href="${base}products/">Add-on modules</a>
        <a href="${base}features/">Features</a>
        <a href="${base}how-it-works.html">How it works</a>
        <a href="${site.app}">Log in</a>
      </nav>
      <p class="footer-copy">&copy; <span data-year></span> Rail Intel. Competency management for rail.</p>
    </div>
  </footer>

  <script src="${base}js/site.js?v=${ASSET_VERSION}"></script>
</body>
</html>
`;
}

/* --------------------------------------------------------------- fragments */

function renderShot(shot, base) {
  const size = manifest[shot.src];
  if (!size) throw new Error(`Missing screenshot in manifest: ${shot.src}`);

  // Display at half the native width so the image is always 2x on Retina.
  const width = Math.round(size.width / 2);
  const height = Math.round(size.height / 2);

  return `        <figure class="shot" style="max-width: ${width}px">
          <div class="shot__frame">
            <img src="${base}${shot.src}" alt="${esc(shot.caption)}" width="${width}" height="${height}" loading="lazy" decoding="async" />
          </div>
          <figcaption class="shot__caption">${esc(shot.caption)}</figcaption>
        </figure>`;
}

function renderSection(section, base) {
  const body = (section.body || []).map((text) => `          <p>${rich(text)}</p>`).join("\n");

  const bullets = section.bullets
    ? `          <ul class="spec-list">\n${section.bullets
        .map((item) => `            <li>${rich(item)}</li>`)
        .join("\n")}\n          </ul>`
    : "";

  const shots = section.shots
    ? `      <div class="shot-grid shot-grid--two">\n${section.shots
        .map((shot) => renderShot(shot, base))
        .join("\n")}\n      </div>`
    : "";

  return `    <section class="page-section">
      <div class="container">
        <div class="page-section__head">
          <h2>${esc(section.heading)}</h2>
${body}
${bullets}
        </div>
${shots}
      </div>
    </section>`;
}

function renderCta(base, { heading, body }) {
  return `    <section class="page-section">
      <div class="container">
        <div class="page-section__head">
          <h2>${esc(heading)}</h2>
          <p>${esc(body)}</p>
        </div>
        <div class="page-actions">
          <a href="${site.app}" class="btn btn-primary btn-lg">Open Rail Intel</a>
          <a href="${base}products/" class="btn btn-ghost btn-lg">Browse all add-ons</a>
        </div>
      </div>
    </section>`;
}

/* ------------------------------------------------------------------- pages */

function addonPage(addon) {
  const base = "../";
  const note = addon.note
    ? `        <p class="page-lead" style="font-size:1rem"><strong>Note.</strong> ${esc(addon.note)}</p>`
    : "";

  return (
    renderHead(base, {
      title: `${addon.name} – Rail Intel add-on module`,
      description: addon.summary,
    }) +
    `
  <main>
    <section class="page-hero">
      <div class="container">
        <div class="page-hero__inner">
          <p class="breadcrumb"><a href="${base}">Rail Intel</a> / <a href="${base}products/">Add-ons</a> / ${esc(
      addon.name
    )}</p>
          <span class="page-badge page-badge--addon">Add-on module</span>
          <h1 class="page-title">${esc(addon.tagline)}</h1>
          <p class="page-lead">${esc(addon.lead)}</p>
${note}
          <div class="page-actions">
            <a href="${site.app}" class="btn btn-primary btn-lg">Open Rail Intel</a>
            <a href="${base}products/" class="btn btn-ghost btn-lg">All add-ons</a>
          </div>
        </div>
      </div>
    </section>

${addon.sections.map((section) => renderSection(section, base)).join("\n\n")}

    <section class="page-section">
      <div class="container">
        <div class="page-section__head">
          <h2>Activating ${esc(addon.name)}</h2>
          <p>Add-on modules are activated from the Add-ons page inside Rail Intel. Each module can be taken on an annual subscription or trialled for 14 days, and your system administrator can enable it for your company directly.</p>
          <p>Module identifier: <code>${esc(addon.moduleId)}</code></p>
        </div>
        <div class="page-actions">
          <a href="${site.app}" class="btn btn-primary btn-lg">Activate in Rail Intel</a>
        </div>
      </div>
    </section>
  </main>

` +
    renderFooter(base)
  );
}

function productsIndex() {
  const base = "../";
  const cards = addons
    .map(
      (addon) => `        <a class="card" href="${base}products/${addon.slug}.html">
          <span class="card__kicker">Add-on</span>
          <h3>${esc(addon.name)}</h3>
          <p>${esc(addon.summary)}</p>
          <span class="card__more">Read more &rarr;</span>
        </a>`
    )
    .join("\n");

  const capacity = capacityAddons
    .map(
      (item) => `            <li><strong>${esc(item.name)}.</strong> ${esc(item.summary)}</li>`
    )
    .join("\n");

  return (
    renderHead(base, {
      title: "Add-on modules – Rail Intel",
      description:
        "The optional Rail Intel modules: QA Verifications, Task assignment, Safety Briefs, Trainee Driver, Driver Reports, Leave & Absence and Medication Checks.",
    }) +
    `
  <main>
    <section class="page-hero">
      <div class="container">
        <div class="page-hero__inner">
          <p class="breadcrumb"><a href="${base}">Rail Intel</a> / Add-ons</p>
          <span class="page-badge page-badge--addon">Add-on modules</span>
          <h1 class="page-title">Extend Rail Intel to fit your operation</h1>
          <p class="page-lead">Rail Intel ships with the full competency, medical, licensing and incident record set. These seven optional modules bolt on when your operation needs them, each activated independently from the Add-ons page.</p>
          <div class="page-actions">
            <a href="${site.app}" class="btn btn-primary btn-lg">Open Rail Intel</a>
            <a href="${base}features/" class="btn btn-ghost btn-lg">See core features</a>
          </div>
        </div>
      </div>
    </section>

    <section class="page-section">
      <div class="container">
        <div class="page-section__head">
          <h2>The seven modules</h2>
          <p>Every module is activated per company and can be trialled before you commit.</p>
        </div>
        <div class="card-grid">
${cards}
        </div>
      </div>
    </section>

    <section class="page-section">
      <div class="container">
        <div class="page-section__head">
          <h2>Capacity add-ons</h2>
          <p>Two further add-ons change your limits rather than adding features.</p>
          <ul class="spec-list">
${capacity}
          </ul>
        </div>
      </div>
    </section>
  </main>

` +
    renderFooter(base)
  );
}

function featurePage(group) {
  const base = "../";

  return (
    renderHead(base, {
      title: `${group.name} – Rail Intel features`,
      description: group.summary,
    }) +
    `
  <main>
    <section class="page-hero">
      <div class="container">
        <div class="page-hero__inner">
          <p class="breadcrumb"><a href="${base}">Rail Intel</a> / <a href="${base}features/">Features</a> / ${esc(
      group.name
    )}</p>
          <span class="page-badge page-badge--core">Included as standard</span>
          <h1 class="page-title">${esc(group.tagline)}</h1>
          <p class="page-lead">${esc(group.lead)}</p>
          <div class="page-actions">
            <a href="${site.app}" class="btn btn-primary btn-lg">Open Rail Intel</a>
            <a href="${base}features/" class="btn btn-ghost btn-lg">All features</a>
          </div>
        </div>
      </div>
    </section>

${group.sections.map((section) => renderSection(section, base)).join("\n\n")}

${renderCta(base, {
  heading: "Everything here is included",
  body: "These capabilities are part of core Rail Intel, gated only by the permissions you assign. Optional modules extend them further.",
})}
  </main>

` +
    renderFooter(base)
  );
}

function featuresIndex() {
  const base = "../";
  const cards = featureGroups
    .map(
      (group) => `        <a class="card" href="${base}features/${group.slug}.html">
          <span class="card__kicker">Core</span>
          <h3>${esc(group.name)}</h3>
          <p>${esc(group.summary)}</p>
          <span class="card__more">Read more &rarr;</span>
        </a>`
    )
    .join("\n");

  return (
    renderHead(base, {
      title: "Features – Rail Intel",
      description:
        "The core Rail Intel feature set: competency cycles, workforce records, medicals and licensing, incidents and monitoring, reporting and administration.",
    }) +
    `
  <main>
    <section class="page-hero">
      <div class="container">
        <div class="page-hero__inner">
          <p class="breadcrumb"><a href="${base}">Rail Intel</a> / Features</p>
          <span class="page-badge page-badge--core">Included as standard</span>
          <h1 class="page-title">What you get before you add anything</h1>
          <p class="page-lead">Core Rail Intel covers the whole competency lifecycle and the records that sit behind it. None of the capabilities below require a module purchase &mdash; they are controlled by the permissions you assign to each role.</p>
          <div class="page-actions">
            <a href="${site.app}" class="btn btn-primary btn-lg">Open Rail Intel</a>
            <a href="${base}products/" class="btn btn-ghost btn-lg">See add-on modules</a>
          </div>
        </div>
      </div>
    </section>

    <section class="page-section">
      <div class="container">
        <div class="page-section__head">
          <h2>Core capabilities</h2>
          <p>Grouped by the job they do rather than by where they sit in the menu.</p>
        </div>
        <div class="card-grid">
${cards}
        </div>
      </div>
    </section>

    <section class="page-section">
      <div class="container">
        <div class="page-section__head">
          <h2>Frequently mistaken for add-ons</h2>
          <p>Cab passes, experience records and trainee hours, competency cycles and Cycle Builder, medicals, licensing, incidents, reporting, traction and routes, and organisation structure are all core. You do not need a module for any of them.</p>
        </div>
      </div>
    </section>
  </main>

` +
    renderFooter(base)
  );
}

function howItWorksPage() {
  const base = "";
  const steps = howItWorks.steps
    .map(
      (step) => `          <li>
            <h3>${esc(step.heading)}</h3>
            <p>${esc(step.body)}</p>
          </li>`
    )
    .join("\n");

  return (
    renderHead(base, {
      title: "How it works – Rail Intel",
      description: howItWorks.lead,
    }) +
    `
  <main>
    <section class="page-hero">
      <div class="container">
        <div class="page-hero__inner">
          <p class="breadcrumb"><a href="${base}/">Rail Intel</a> / How it works</p>
          <h1 class="page-title">${esc(howItWorks.title)}</h1>
          <p class="page-lead">${esc(howItWorks.lead)}</p>
          <div class="page-actions">
            <a href="${site.app}" class="btn btn-primary btn-lg">Open Rail Intel</a>
            <a href="features/" class="btn btn-ghost btn-lg">See the features</a>
          </div>
        </div>
      </div>
    </section>

    <section class="page-section">
      <div class="container">
        <div class="page-section__head">
          <h2>Six steps from spreadsheet to system of record</h2>
          <p>Most operators are live on their first cycles within weeks, because the configuration follows standards you already work to.</p>
        </div>
        <ol class="steps">
${steps}
        </ol>
      </div>
    </section>

    <section class="page-section">
      <div class="container">
        <div class="page-section__head">
          <h2>Where the screenshots come from</h2>
          <p>Every screenshot across this site is taken from the live Rail Intel application. Use the expand control on any image to view it at full resolution.</p>
        </div>
        <div class="shot-grid shot-grid--two">
${renderShot(
  {
    src: "images/screens/main-sys/dashboard.png",
    caption: "The Rail Intel dashboard: compliance position across the workforce at a glance.",
  },
  base
)}
${renderShot(
  {
    src: "images/screens/main-sys/your-team-compliance.png",
    caption: "Team compliance summary showing who is on track and who is not.",
  },
  base
)}
        </div>
      </div>
    </section>
  </main>

` +
    renderFooter(base)
  );
}

/* ---------------------------------------------------------- index.html sync */

function syncIndex() {
  const path = join(root, "index.html");
  let html = readFileSync(path, "utf8");

  const replaceBetween = (source, startMarker, endMarker, replacement) => {
    const start = source.indexOf(startMarker);
    const end = source.indexOf(endMarker);
    if (start === -1 || end === -1) throw new Error(`index.html is missing ${startMarker}`);
    return source.slice(0, start + startMarker.length) + replacement + source.slice(end);
  };

  html = replaceBetween(html, "<!-- nav:start -->", "<!-- nav:end -->", `\n        ${renderNav("")}\n        `);

  html = replaceBetween(
    html,
    "<!-- footer-nav:start -->",
    "<!-- footer-nav:end -->",
    `
        <a href="products/">Add-on modules</a>
        <a href="features/">Features</a>
        <a href="how-it-works.html">How it works</a>
        <a href="${site.app}">Log in</a>
      `
  );

  html = html
    .replace(/css\/style\.css\?v=\d+/, `css/style.css?v=${ASSET_VERSION}`)
    .replace(/css\/pages\.css\?v=\d+/, `css/pages.css?v=${ASSET_VERSION}`)
    .replace(/js\/main\.js\?v=\d+/, `js/main.js?v=${ASSET_VERSION}`)
    .replace(/js\/site\.js\?v=\d+/, `js/site.js?v=${ASSET_VERSION}`);

  writeFileSync(path, html);
  return "index.html";
}

/* -------------------------------------------------------------------- write */

const written = [];

function emit(relativePath, html) {
  const target = join(root, relativePath);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, html);
  written.push(relativePath);
}

emit("products/index.html", productsIndex());
for (const addon of addons) emit(`products/${addon.slug}.html`, addonPage(addon));

emit("features/index.html", featuresIndex());
for (const group of featureGroups) emit(`features/${group.slug}.html`, featurePage(group));

emit("how-it-works.html", howItWorksPage());
written.push(syncIndex());

console.log(`generated ${written.length} pages:`);
for (const path of written) console.log(`  ${path}`);
