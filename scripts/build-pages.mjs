/**
 * Generates the Products, Features, How it works and Security pages from
 * content/site.mjs, and keeps the shared navigation in index.html in step.
 *
 * Output is plain static HTML committed to the repo, so GitHub Pages serves it
 * directly and there is no build step at request time.
 *
 * Run: node scripts/build-pages.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { site, products, addons, capacityAddons, featureGroups, howItWorks, security, languages } from "../content/site.mjs";
import { homeGallery } from "../content/home-gallery.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(readFileSync(join(root, "images/screens/manifest.json"), "utf8"));

const ASSET_VERSION = 167;

const esc = (value) =>
  String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Supports **bold** in body copy so the content file stays readable. */
const rich = (value) => esc(value).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

const appUrl = (key) => site[key] || site.app;

/* ------------------------------------------------------------------ chrome */

function renderNavItems(base, items) {
  return items
    .map(
      (item) => `                <a class="nav-panel__item" href="${item.external ? item.href : `${base}${item.href}`}">
                  <span class="nav-panel__dot" aria-hidden="true"></span>
                  <span>
                    <span class="nav-panel__title">${esc(item.name)}</span>
                    <span class="nav-panel__desc">${esc(item.summary)}</span>
                  </span>
                </a>`
    )
    .join("\n");
}

function renderNav(base) {
  // The trigger is a link so a desktop click goes to the section index, while
  // hover (or a tap on touch) reveals the panel.
  const featureGroup = (id, label, items, allHref, allLabel) => `
          <div class="nav-group" data-nav-group data-open="false">
            <a class="nav-trigger" href="${base}${allHref}" data-nav-trigger aria-expanded="false" aria-controls="${id}-panel">
              ${esc(label)}<span class="nav-trigger__chevron" aria-hidden="true"></span>
            </a>
            <div class="nav-panel" id="${id}-panel">
              <div class="nav-panel__grid">
${renderNavItems(base, items)}
              </div>
              <div class="nav-panel__footer">
                <a class="nav-panel__all" href="${base}${allHref}">${esc(allLabel)} &rarr;</a>
              </div>
            </div>
          </div>`;

  const productAppItems = products
    .map((product) => {
      const href = product.href === "" ? base || "/" : `${base}${product.href}`;
      return `                <a class="nav-panel__item" href="${href}">
                  <span class="nav-panel__dot" aria-hidden="true"></span>
                  <span>
                    <span class="nav-panel__title">${esc(product.name)}</span>
                    <span class="nav-panel__desc">${esc(product.summary)}</span>
                  </span>
                </a>`;
    })
    .join("\n");

  const addonItems = addons.map((addon) => ({
    name: addon.name,
    summary: addon.summary,
    href: `products/${addon.slug}.html`,
  }));

  const featureItems = featureGroups.map((featureGroup) => ({
    name: featureGroup.name,
    summary: featureGroup.summary,
    href: `features/${featureGroup.slug}.html`,
  }));

  const productPanel = `
          <div class="nav-group" data-nav-group data-open="false">
            <a class="nav-trigger" href="${base}products/" data-nav-trigger aria-expanded="false" aria-controls="product-panel">
              Product<span class="nav-trigger__chevron" aria-hidden="true"></span>
            </a>
            <div class="nav-panel nav-panel--product" id="product-panel">
              <p class="nav-panel__label">Apps</p>
              <div class="nav-panel__grid nav-panel__grid--apps">
${productAppItems}
              </div>
              <p class="nav-panel__label">Add-on modules</p>
              <div class="nav-panel__grid">
${renderNavItems(base, addonItems)}
              </div>
              <div class="nav-panel__footer">
                <a class="nav-panel__all" href="${base}products/">All add-on modules &rarr;</a>
              </div>
            </div>
          </div>`;

  return `<nav class="nav" aria-label="Main">
        <button type="button" class="nav-toggle" data-nav-toggle aria-expanded="false" aria-label="Menu">
          <span></span><span></span><span></span>
        </button>
        <div class="nav-menu" data-nav-menu data-open="false">${productPanel}${featureGroup(
          "features",
          "Features",
          featureItems,
          "features/",
          "All features"
        )}
          <a href="${base}how-it-works.html" class="nav-link">How it works</a>
          <a href="${base}security.html" class="nav-link">Security</a>
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
        <a href="${base}products/">Products</a>
        <a href="${base}features/">Features</a>
        <a href="${base}how-it-works.html">How it works</a>
        <a href="${base}security.html">Security</a>
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

function renderShot(shot, base, options = {}) {
  const size = manifest[shot.src];
  if (!size) throw new Error(`Missing screenshot in manifest: ${shot.src}`);

  // Display at half the native width so the image is always 2x on Retina,
  // unless the shot sets scale (e.g. 1 for already-compressed captures).
  const scale = typeof shot.scale === "number" ? shot.scale : 0.5;
  const width = Math.max(1, Math.round(size.width * scale));
  const height = Math.max(1, Math.round(size.height * scale));
  const fill = Boolean(shot.full || options.fill);
  const classes = ["shot", shot.full ? "shot--full" : null, options.showcase ? "shot--showcase" : null, "reveal"]
    .filter(Boolean)
    .join(" ");
  const style = fill ? "" : ` style="max-width: ${width}px"`;

  const copy =
    options.showcase && (shot.title || shot.lede)
      ? `          <div class="shot__copy">
${shot.step ? `            <p class="shot__step">${esc(shot.step)}</p>\n` : ""}${
          shot.title ? `            <h3 class="shot__title">${esc(shot.title)}</h3>\n` : ""
        }${shot.lede ? `            <p class="shot__lede">${esc(shot.lede)}</p>\n` : ""}          </div>\n`
      : "";

  return `        <figure class="${classes}"${style}>
${copy}          <div class="shot__frame">
            <img src="${base}${shot.src}?v=${ASSET_VERSION}" alt="${esc(shot.caption || shot.title || "")}" width="${width}" height="${height}" loading="lazy" decoding="async" />
          </div>
${shot.caption ? `          <figcaption class="shot__caption">${esc(shot.caption)}</figcaption>\n` : ""}        </figure>`;
}

function renderGallery(section, base) {
  const slides = (section.shots || [])
    .map((shot, index) => {
      const size = manifest[shot.src];
      if (!size) throw new Error(`Missing screenshot in manifest: ${shot.src}`);
      const scale = typeof shot.scale === "number" ? shot.scale : 1;
      const width = Math.max(1, Math.round(size.width * scale));
      const height = Math.max(1, Math.round(size.height * scale));
      const step = shot.step || String(index + 1).padStart(2, "0");
      const label = shot.title || shot.caption || `Slide ${index + 1}`;
      const stacked = shot.layout === "stack";
      const slideClass = ["shot-gallery__slide", stacked ? "shot-gallery__slide--stack" : null]
        .filter(Boolean)
        .join(" ");
      const figureMax = stacked ? Math.max(width, 960) : width;

      return `        <article class="${slideClass}" data-gallery-slide role="group" aria-roledescription="slide" aria-label="${esc(
        `${index + 1} of ${(section.shots || []).length}: ${label}`
      )}">
          <div class="shot-gallery__copy">
            <p class="shot__step">${esc(step)}</p>
            <h3 class="shot__title">${esc(shot.title || shot.caption || "")}</h3>
${shot.lede ? `            <p class="shot__lede">${esc(shot.lede)}</p>\n` : ""}          </div>
          <div class="shot-gallery__stage">
            <figure class="shot shot--gallery${stacked ? " shot--gallery-wide" : ""}" style="max-width: ${figureMax}px">
              <div class="shot__frame">
                <img src="${base}${shot.src}?v=${ASSET_VERSION}" alt="${esc(shot.caption || shot.title || "")}" width="${width}" height="${height}" loading="lazy" decoding="async" />
              </div>
${shot.caption ? `              <figcaption class="shot__caption">${esc(shot.caption)}</figcaption>\n` : ""}            </figure>
          </div>
        </article>`;
    })
    .join("\n");

  const dots = (section.shots || [])
    .map(
      (shot, index) =>
        `          <button type="button" class="shot-gallery__dot" data-gallery-dot="${index}" aria-label="Show ${esc(
          shot.title || shot.caption || `slide ${index + 1}`
        )}"></button>`
    )
    .join("\n");

  return `      <div class="shot-gallery" data-shot-gallery>
        <div class="shot-gallery__viewport">
          <div class="shot-gallery__track" data-gallery-track>
${slides}
          </div>
        </div>
        <div class="shot-gallery__controls">
          <button type="button" class="shot-gallery__btn" data-gallery-prev aria-label="Previous screenshot">
            <span aria-hidden="true">←</span>
          </button>
          <div class="shot-gallery__dots" role="tablist" aria-label="Screenshots">
${dots}
          </div>
          <button type="button" class="shot-gallery__btn" data-gallery-next aria-label="Next screenshot">
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>`;
}

function partnerAppName(app) {
  return typeof app === "string" ? app : app.name || "";
}

function partnerAppIcon(app) {
  return typeof app === "object" && app.icon ? app.icon : "";
}

function renderViewerPartner(partner, base) {
  if (!partner) return "";
  const logo = partner.logo || "images/security/auth-apps/google-authenticator.png";
  const title = partner.title || "Google Authenticator";
  const kicker = partner.kicker || "Compatible with";
  const body = partner.body || "";
  const apps = Array.isArray(partner.apps) ? partner.apps : [];
  const note = partner.note || "";

  const appsHtml = apps.length
    ? `          <ul class="shot-viewer__partner-apps">
${apps.map((app) => `            <li>${esc(partnerAppName(app))}</li>`).join("\n")}
          </ul>`
    : "";

  const iconApps = apps.filter((app) => partnerAppIcon(app));
  const iconsHtml = iconApps.length
    ? `          <div class="shot-viewer__partner-icons" aria-label="Supported authenticator apps">
${iconApps
  .map((app) => {
    const name = partnerAppName(app);
    const icon = partnerAppIcon(app);
    return `            <img
              src="${base}${icon}?v=${ASSET_VERSION}"
              alt="${esc(name)}"
              title="${esc(name)}"
              width="32"
              height="32"
              loading="lazy"
              decoding="async"
            />`;
  })
  .join("\n")}
          </div>`
    : "";

  return `
        <aside class="shot-viewer__partner" aria-label="${esc(title)}">
          <div class="shot-viewer__partner-content">
            <div class="shot-viewer__partner-head">
              <div class="shot-viewer__partner-mark">
                <img
                  src="${base}${logo}?v=${ASSET_VERSION}"
                  alt=""
                  width="72"
                  height="72"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div class="shot-viewer__partner-intro">
                <p class="shot-viewer__partner-kicker">${esc(kicker)}</p>
                <h3 class="shot-viewer__partner-title">${esc(title)}</h3>
              </div>
            </div>
            ${body ? `<p class="shot-viewer__partner-body">${esc(body)}</p>` : ""}
${appsHtml}
            ${note ? `<p class="shot-viewer__partner-note">${esc(note)}</p>` : ""}
          </div>
${iconsHtml}
        </aside>`;
}

function renderViewerGallery(section, base) {
  const shots = section.shots || [];
  const count = shots.length;
  const sidebar = section.viewerLayout === "sidebar";
  const viewerClass = ["shot-viewer", "reveal", sidebar ? "shot-viewer--sidebar" : null]
    .filter(Boolean)
    .join(" ");
  const prevArrow = sidebar ? "↑" : "←";
  const nextArrow = sidebar ? "↓" : "→";

  const frames = shots
    .map((shot, index) => {
      const size = manifest[shot.src];
      if (!size) throw new Error(`Missing screenshot in manifest: ${shot.src}`);
      const scale = typeof shot.scale === "number" ? shot.scale : 0.5;
      const width = Math.max(1, Math.round(size.width * scale));
      const height = Math.max(1, Math.round(size.height * scale));
      const label = shot.caption || shot.title || `Screen ${index + 1}`;
      const frameClass = [
        "shot-viewer__frame",
        index === 0 ? "is-active" : null,
        shot.portrait ? "shot-viewer__frame--portrait" : null,
      ]
        .filter(Boolean)
        .join(" ");

      let floatHtml = "";
      if (shot.float) {
        const floatSize = manifest[shot.float];
        if (!floatSize) throw new Error(`Missing screenshot in manifest: ${shot.float}`);
        const floatScale = typeof shot.floatScale === "number" ? shot.floatScale : 0.5;
        const floatWidth = Math.max(1, Math.round(floatSize.width * floatScale));
        const floatHeight = Math.max(1, Math.round(floatSize.height * floatScale));
        const floatLabel = shot.floatLabel || "Authenticator app";
        floatHtml = `
            <aside class="shot-viewer__float" aria-hidden="true">
              <img
                src="${base}${shot.float}?v=${ASSET_VERSION}"
                alt=""
                width="${floatWidth}"
                height="${floatHeight}"
                loading="lazy"
                decoding="async"
              />
              <span class="shot-viewer__float-label">${esc(floatLabel)}</span>
            </aside>`;
      }

      return `        <figure
          class="${frameClass}"
          data-shot-viewer-frame
          data-shot-viewer-label="${esc(label)}"
          aria-hidden="${index === 0 ? "false" : "true"}"
        >
          <div class="shot-viewer__frame-inner">
            <img
              class="shot-viewer__image"
              src="${base}${shot.src}?v=${ASSET_VERSION}"
              alt="${esc(label)}"
              width="${width}"
              height="${height}"
              loading="${index === 0 ? "eager" : "lazy"}"
              decoding="async"
            />${floatHtml}
          </div>
        </figure>`;
    })
    .join("\n");

  const tiles = shots
    .map((shot, index) => {
      const label = shot.caption || shot.title || `Screen ${index + 1}`;
      const step = shot.step || String(index + 1).padStart(2, "0");
      const tileClass = ["shot-viewer__tile", index === 0 ? "is-active" : null].filter(Boolean).join(" ");

      return `            <button
              type="button"
              class="${tileClass}"
              data-shot-viewer-tile="${index}"
              role="tab"
              aria-label="${esc(label)}"
              aria-selected="${index === 0 ? "true" : "false"}"
            >
              <span class="shot-viewer__tile-step">${esc(step)}</span>
              <span class="shot-viewer__tile-label">${esc(label)}</span>
              <span class="shot-viewer__tile-progress" data-shot-viewer-tile-progress aria-hidden="true"></span>
            </button>`;
    })
    .join("\n");

  const railHidden = count < 2 ? ' hidden aria-hidden="true"' : "";
  const partnerHtml = sidebar && section.viewerPartner ? renderViewerPartner(section.viewerPartner, base) : "";

  const coreHtml = `        <div class="shot-viewer__rail"${railHidden}>
          <button type="button" class="shot-viewer__nav" data-shot-viewer-prev aria-label="Previous screenshot">
            <span aria-hidden="true">${prevArrow}</span>
          </button>
          <div class="shot-viewer__tiles" data-shot-viewer-tiles role="tablist" aria-label="Screenshots">
${tiles}
          </div>
          <button type="button" class="shot-viewer__nav" data-shot-viewer-next aria-label="Next screenshot">
            <span aria-hidden="true">${nextArrow}</span>
          </button>
        </div>
        <div class="shot-viewer__shell">
          <div class="shot-viewer__glow" aria-hidden="true"></div>
          <div class="shot-viewer__stage" data-shot-viewer-stage>
${frames}
          </div>
        </div>`;

  if (sidebar) {
    return `      <div class="${viewerClass}" data-shot-viewer data-shot-count="${count}" tabindex="0">
        <div class="shot-viewer__cluster">
${coreHtml}
        </div>${partnerHtml}
      </div>`;
  }

  return `      <div class="${viewerClass}" data-shot-viewer data-shot-count="${count}" tabindex="0">
${coreHtml}
      </div>`;
}

function renderSpotlightGallery(section, base) {
  const shots = section.shots || [];
  const count = shots.length;
  const items = shots
    .map((shot, index) => {
      const size = manifest[shot.src];
      if (!size) throw new Error(`Missing screenshot in manifest: ${shot.src}`);
      const scale = typeof shot.scale === "number" ? shot.scale : 0.5;
      const width = Math.max(1, Math.round(size.width * scale));
      const height = Math.max(1, Math.round(size.height * scale));
      const label = shot.title || shot.caption || `Screenshot ${index + 1}`;
      const step = shot.step || String(index + 1).padStart(2, "0");

      const itemClass = [
        "shot-spotlight__item",
        index === 0 ? "is-front" : null,
        index === 1 || (index === count - 1 && count > 1) ? "is-adjacent" : null,
      ]
        .filter(Boolean)
        .join(" ");

      return `        <article
          class="${itemClass}"
          data-spotlight-item
          data-spotlight-title="${esc(label)}"
          data-spotlight-caption="${esc(shot.caption || label)}"
          data-spotlight-step="${esc(step)}"
          style="--spot-i: ${index}"
          aria-hidden="${index === 0 ? "false" : "true"}"
        >
          <button type="button" class="shot-spotlight__card" aria-label="${esc(label)}">
            <div class="shot-spotlight__chrome" aria-hidden="true">
              <span class="shot-spotlight__chrome-dots"></span>
              <span class="shot-spotlight__chrome-url">cms.railintel.co.uk/administration</span>
            </div>
            <div class="shot-spotlight__frame">
              <img src="${base}${shot.src}?v=${ASSET_VERSION}" alt="${esc(shot.caption || shot.title || "")}" width="${width}" height="${height}" loading="${index === 0 ? "eager" : "lazy"}" decoding="async" />
            </div>
          </button>
        </article>`;
    })
    .join("\n");

  const navHidden = count < 2 ? ' hidden aria-hidden="true"' : "";

  return `      <div class="shot-spotlight reveal" data-shot-spotlight data-shot-count="${count}">
        <div class="shot-spotlight__layout">
          <div class="shot-spotlight__meta" aria-live="polite">
            <p class="shot-spotlight__index" data-spotlight-index>${count > 1 ? `01 / ${String(count).padStart(2, "0")}` : "01"}</p>
            <h3 class="shot-spotlight__title" data-spotlight-title>${esc(shots[0]?.title || shots[0]?.caption || "")}</h3>
            <p class="shot-spotlight__lede" data-spotlight-caption>${esc(shots[0]?.caption || shots[0]?.title || "")}</p>
          </div>
          <div class="shot-spotlight__stage" data-spotlight-stage>
            <div class="shot-spotlight__ring" data-spotlight-ring role="list">
${items}
            </div>
            <div class="shot-spotlight__floor" aria-hidden="true"></div>
            <div class="shot-spotlight__glow" aria-hidden="true"></div>
          </div>
        </div>
        <div class="shot-spotlight__footer"${navHidden}>
          <button type="button" class="shot-spotlight__nav" data-spotlight-prev aria-label="Previous screenshot">
            <span aria-hidden="true">←</span>
          </button>
          <div class="shot-spotlight__dots" data-spotlight-dots role="tablist" aria-label="Screenshots"></div>
          <div class="shot-spotlight__progress" aria-hidden="true">
            <span class="shot-spotlight__progress-bar" data-spotlight-progress></span>
          </div>
          <button type="button" class="shot-spotlight__nav" data-spotlight-next aria-label="Next screenshot">
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>`;
}

function renderSection(section, base) {
  const body = (section.body || []).map((text) => `          <p>${rich(text)}</p>`).join("\n");

  const bullets = section.bullets
    ? `          <ul class="spec-list">\n${section.bullets
        .map((item) => `            <li>${rich(item)}</li>`)
        .join("\n")}\n          </ul>`
    : "";

  const gallery = section.shotGrid === "gallery";
  const viewer = section.shotGrid === "viewer";
  const spotlight = section.shotGrid === "spotlight";
  const showcase = section.shotGrid === "showcase";
  const heroStack = section.shotGrid === "hero-stack";
  const gridClass = showcase
    ? "shot-grid shot-grid--showcase"
    : heroStack
      ? "shot-grid shot-grid--hero-stack"
      : "shot-grid shot-grid--two";

  let shots = "";
  if (section.shots) {
    if (viewer) {
      shots = renderViewerGallery(section, base);
    } else if (spotlight) {
      shots = renderSpotlightGallery(section, base);
    } else if (gallery) {
      shots = renderGallery(section, base);
    } else {
      shots = `      <div class="${gridClass}">\n${section.shots
        .map((shot, index) =>
          renderShot(
            {
              ...shot,
              step: shot.step || (showcase ? String(index + 1).padStart(2, "0") : undefined),
              full: showcase ? true : shot.full,
              scale: showcase ? shot.scale ?? 1 : shot.scale,
            },
            base,
            { showcase, fill: showcase || heroStack || shot.full }
          )
        )
        .join("\n")}\n      </div>`;
    }
  }

  return `    <section class="page-section${gallery ? " page-section--gallery" : viewer ? " page-section--viewer" : spotlight ? " page-section--spotlight" : showcase ? " page-section--showcase" : ""}">
      <div class="container${gallery || viewer || spotlight || showcase ? " container--showcase" : ""}">
        <div class="page-section__head">
          <h2>${esc(section.heading)}</h2>
${body}
${bullets}
        </div>
${shots}
      </div>
    </section>`;
}

function renderCta(base, { heading, body, showAppCta = true, secondaryHref, secondaryLabel }) {
  const secondaryLink = secondaryHref
    ? `          <a href="${secondaryHref.startsWith("../") || secondaryHref.startsWith("http") ? secondaryHref : `${base}${secondaryHref}`}" class="btn btn-ghost btn-lg">${esc(secondaryLabel || "Learn more")}</a>`
    : `          <a href="${base}products/" class="btn btn-ghost btn-lg">Browse all add-ons</a>`;

  return `    <section class="page-section">
      <div class="container">
        <div class="page-section__head">
          <h2>${esc(heading)}</h2>
          <p>${esc(body)}</p>
        </div>
        <div class="page-actions">
${
  showAppCta === false
    ? ""
    : `          <a href="${site.app}" class="btn btn-primary btn-lg">Open Rail Intel</a>\n`
}${secondaryLink}
        </div>
      </div>
    </section>`;
}

/* ------------------------------------------------------------------- pages */

function productPage(product) {
  const base = "../";
  const url = appUrl(product.appUrlKey);
  const sections = (product.sections || []).map((section) => renderSection(section, base)).join("\n\n");

  return (
    renderHead(base, {
      title: `${product.name} – Rail Intel`,
      description: product.summary,
    }) +
    `
  <main>
    <section class="page-hero">
      <div class="container">
        <div class="page-hero__inner">
          <p class="breadcrumb"><a href="${base}">Rail Intel</a> / <a href="${base}products/">Product</a> / ${esc(
      product.name
    )}</p>
          <span class="page-badge page-badge--app">App</span>
          <h1 class="page-title">${esc(product.tagline)}</h1>
          <p class="page-lead">${esc(product.lead)}</p>
          <div class="page-actions">
            <a href="${url}" class="btn btn-primary btn-lg">${esc(product.cta || `Open ${product.name}`)}</a>
            <a href="${base}products/" class="btn btn-ghost btn-lg">CMS add-on modules</a>
          </div>
        </div>
      </div>
    </section>

${sections}

    <section class="page-section">
      <div class="container">
        <div class="page-section__head">
          <h2>A product, not a CMS add-on</h2>
          <p>${esc(product.name)} is a standalone Rail Intel app at ${esc(url.replace(/^https?:\/\//, ""))}. CMS add-on modules extend Rail Intel CMS; Investigations sits alongside it for investigation workflows, with an optional connector when you want shared people and competency context.</p>
        </div>
        <div class="page-actions">
          <a href="${url}" class="btn btn-primary btn-lg">${esc(product.cta || `Open ${product.name}`)}</a>
          <a href="${base}" class="btn btn-ghost btn-lg">About Rail Intel CMS</a>
        </div>
      </div>
    </section>
  </main>

` +
    renderFooter(base)
  );
}

function journeyShotFigure(shot, base, hidden = false, eager = false) {
  const size = manifest[shot.src];
  if (!size) throw new Error(`Missing screenshot in manifest: ${shot.src}`);
  const scale = typeof shot.scale === "number" ? shot.scale : 1;
  const width = Math.max(1, Math.round(size.width * scale));
  const height = Math.max(1, Math.round(size.height * scale));
  const shotId = shot.id ? ` data-trainee-shot="${esc(shot.id)}"` : "";
  const hiddenAttr = hidden ? ' hidden aria-hidden="true"' : "";
  const fillClass = !shot.compact && width < 960 ? " trainee-journey__figure--fill" : "";
  const compactClass = shot.compact ? " trainee-journey__figure--compact" : "";
  const loading = eager ? "eager" : "lazy";
  const fetchPriority = eager ? ' fetchpriority="high"' : "";

  return `              <figure class="trainee-journey__figure shot${fillClass}${compactClass}"${shotId}${hiddenAttr} style="--shot-native-width: ${width}px">
                <div class="shot__frame">
                  <img src="${base}${shot.src}?v=${ASSET_VERSION}" alt="${esc(shot.caption || "")}" width="${width}" height="${height}" sizes="(min-width: 1100px) ${width}px, 96vw" loading="${loading}" decoding="async"${fetchPriority} />
                </div>
                <figcaption class="shot__caption">${esc(shot.caption || "")}</figcaption>
              </figure>`;
}

function renderScheduleFlow(step) {
  const flow = step.scheduleFlow;
  if (!flow?.steps?.length) return "";

  const steps = flow.steps
    .map(
      (item, stepIndex) => `                <button type="button" class="trainee-schedule-flow__step" data-schedule-flow-step="${stepIndex}" aria-pressed="false">
                  <span class="trainee-schedule-flow__node"><span class="trainee-schedule-flow__num">${stepIndex + 1}</span></span>
                  <span class="trainee-schedule-flow__copy">
                    <strong>${esc(item.title)}</strong>
                    <span>${esc(item.detail)}</span>
                  </span>
                </button>`
    )
    .join("\n");

  return `            <div class="trainee-schedule-flow" data-schedule-flow data-schedule-flow-index="0" style="--flow-progress: 0%">
              <div class="trainee-schedule-flow__head">
                <p class="trainee-schedule-flow__kicker">${esc(flow.kicker)}</p>
                <h4 class="trainee-schedule-flow__headline">${esc(flow.headline)}</h4>
                <p class="trainee-schedule-flow__lede">${esc(flow.body)}</p>
              </div>
              <div class="trainee-schedule-flow__track" role="list" aria-label="${esc(flow.kicker)}">
                <span class="trainee-schedule-flow__rail" aria-hidden="true"><span class="trainee-schedule-flow__rail-fill"></span></span>
${steps}
              </div>
            </div>`;
}

function renderJourneyStep(step, base, index, total) {
  const bullets = step.bullets
    ? `            <ul class="spec-list trainee-journey__bullets">\n${step.bullets
        .map((item) => `              <li>${rich(item)}</li>`)
        .join("\n")}\n            </ul>`
    : "";

  const status = step.status
    ? `            <p class="trainee-journey__status"><span class="trainee-journey__status-dot" aria-hidden="true"></span>${esc(step.status)}</p>`
    : "";

  const optional = step.optional ? ` data-trainee-optional="true"` : "";
  const shots = step.shots || [];
  const hasSubViews = shots.length > 1 && shots.some((shot) => shot.label);

  const subtabs = hasSubViews
    ? `            <div class="trainee-journey__subtabs" role="tablist" aria-label="${esc(step.title)} views">
${shots
  .map(
    (shot, shotIndex) =>
      `              <button type="button" class="trainee-journey__subtab" role="tab" data-trainee-subtab="${esc(
        shot.id || String(shotIndex)
      )}" aria-selected="${shotIndex === 0 ? "true" : "false"}">${esc(shot.label || `View ${shotIndex + 1}`)}</button>`
  )
  .join("\n")}
            </div>`
    : "";

  const figures = shots
    .map((shot, shotIndex) => journeyShotFigure(shot, base, hasSubViews && shotIndex > 0, index === 0 && shotIndex === 0))
    .join("\n");
  const scheduleFlow = renderScheduleFlow(step);
  const connector =
    index < total - 1
      ? `          <div class="trainee-journey__connector" aria-hidden="true">
            <span class="trainee-journey__connector-line"></span>
            <span class="trainee-journey__connector-arrow"></span>
          </div>`
      : "";

  return `        <article class="trainee-journey__step reveal" data-trainee-step="${index}" id="trainee-step-${index}" style="--trainee-accent: ${esc(step.accent || "#818cf8")}"${optional}>
          <div class="trainee-journey__marker" aria-hidden="true">
            <span class="trainee-journey__marker-dot"></span>
          </div>
          <div class="trainee-journey__content">
            <header class="trainee-journey__head">
              <p class="shot__step">${esc(step.step)}</p>
              <h3 class="shot__title">${esc(step.title)}</h3>
              <p class="shot__lede">${esc(step.lede)}</p>
${status}
${bullets}
            </header>
            <div class="trainee-journey__visual">
${scheduleFlow}
${subtabs}
              <div class="trainee-journey__stage">
${figures}
              </div>
            </div>
          </div>
${connector}
        </article>`;
}

function renderTraineeFlow(addon, base) {
  const steps = [];
  if (addon.heroShot) {
    steps.push({
      id: "overview",
      step: "Start here",
      title: "Trainee Module hub",
      lede:
        "The module dashboard shows all five steps at a glance — policies, schedules, groups, enrolment and training cycles — with live status for each.",
      accent: "#818cf8",
      shots: [addon.heroShot],
    });
  }
  steps.push(...(addon.flowSteps || []));
  if (addon.portfolioStep) steps.push(addon.portfolioStep);
  const total = steps.length;

  const rail = steps
    .map(
      (step, index) => `            <a class="trainee-journey__rail-link" href="#trainee-step-${index}" data-trainee-rail="${index}" style="--trainee-accent: ${esc(
        step.accent || "#818cf8"
      )}">
              <span class="trainee-journey__rail-index">${esc(step.step)}</span>
              <span class="trainee-journey__rail-title">${esc(step.title)}</span>
            </a>`
    )
    .join("\n");

  const track = steps.map((step, index) => renderJourneyStep(step, base, index, total)).join("\n");

  return `    <section class="page-section page-section--trainee-journey">
      <div class="container container--trainee-journey">
        <div class="page-section__head">
          <h2>${esc(addon.flowIntro.heading)}</h2>
          <p>${esc(addon.flowIntro.body)}</p>
        </div>

        <div class="trainee-journey" data-trainee-journey data-trainee-count="${total}">
          <aside class="trainee-journey__rail-wrap" aria-label="Module steps">
            <div class="trainee-journey__rail-progress" aria-hidden="true">
              <span class="trainee-journey__rail-progress-fill" data-trainee-rail-progress style="width: ${100 / total}%"></span>
            </div>
            <nav class="trainee-journey__rail">
${rail}
            </nav>
          </aside>

          <div class="trainee-journey__track">
${track}
          </div>
        </div>
      </div>
    </section>`;
}

function renderQaSection(section, base) {
  if (!section) return "";
  const body = (section.body || []).map((text) => `            <p>${rich(text)}</p>`).join("\n");
  const bullets = section.bullets
    ? `            <ul class="spec-list trainee-qa__bullets">\n${section.bullets
        .map((item) => `              <li>${rich(item)}</li>`)
        .join("\n")}\n            </ul>`
    : "";
  const link = section.link
    ? `            <div class="page-actions trainee-qa__actions">
              <a href="${base}${section.link.href}" class="btn btn-ghost btn-lg">${esc(section.link.label)}</a>
            </div>`
    : "";

  let visual = "";
  if (section.shot) {
    const size = manifest[section.shot.src];
    if (!size) throw new Error(`Missing screenshot in manifest: ${section.shot.src}`);
    const scale = typeof section.shot.scale === "number" ? section.shot.scale : 1;
    const width = Math.max(1, Math.round(size.width * scale));
    const height = Math.max(1, Math.round(size.height * scale));
    visual = `          <div class="trainee-qa__visual reveal">
            <figure class="trainee-qa__figure shot" style="--shot-native-width: ${width}px">
              <div class="shot__frame">
                <img src="${base}${section.shot.src}?v=${ASSET_VERSION}" alt="${esc(section.shot.caption || "")}" width="${width}" height="${height}" sizes="(min-width: 1100px) ${width}px, 96vw" loading="lazy" decoding="async" />
              </div>
              <figcaption class="shot__caption">${esc(section.shot.caption || "")}</figcaption>
            </figure>
          </div>`;
  }

  return `    <section class="page-section page-section--trainee-qa">
      <div class="container container--trainee-journey">
        <div class="trainee-qa reveal">
          <div class="trainee-qa__grid">
            <div class="trainee-qa__copy">
              <h2>${esc(section.heading)}</h2>
${body}
${bullets}
${link}
            </div>
${visual}
          </div>
        </div>
      </div>
    </section>`;
}

function traineeDriverPage(addon) {
  const base = "../";
  const note = addon.note
    ? `        <p class="page-lead" style="font-size:1rem"><strong>Note.</strong> ${esc(addon.note)}</p>`
    : "";

  const heroCopy = `          <p class="breadcrumb"><a href="${base}">Rail Intel</a> / <a href="${base}products/">Add-ons</a> / ${esc(
    addon.name
  )}</p>
          <span class="page-badge page-badge--addon">Add-on module</span>
          <h1 class="page-title">${esc(addon.tagline)}</h1>
          <p class="page-lead">${esc(addon.lead)}</p>
${note}
          <div class="page-actions">
            <a href="${site.app}" class="btn btn-primary btn-lg">Open Rail Intel</a>
            <a href="${base}products/" class="btn btn-ghost btn-lg">All add-ons</a>
          </div>`;

  const heroInner = `        <div class="page-hero__inner">
${heroCopy}
        </div>`;

  return (
    renderHead(base, {
      title: `${addon.name} – Rail Intel add-on module`,
      description: addon.summary,
    }) +
    `
  <main>
    <section class="page-hero page-hero--trainee">
      <div class="container">
${heroInner}
      </div>
    </section>

${renderTraineeFlow(addon, base)}

${renderQaSection(addon.qaSection, base)}

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

${(addon.sections || []).map((section) => renderSection(section, base)).join("\n\n")}

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
  const appCards = products
    .map((product) => {
      const href = product.href === "" ? base || "/" : `${base}${product.href}`;
      return `        <a class="card" href="${href}">
          <span class="card__kicker">App</span>
          <h3>${esc(product.name)}</h3>
          <p>${esc(product.summary)}</p>
          <span class="card__more">Read more &rarr;</span>
        </a>`;
    })
    .join("\n");

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
      title: "Products – Rail Intel",
      description:
        "Rail Intel CMS and Rail Intel Investigations, plus optional CMS add-on modules: QA Verifications, Task assignment, Safety Briefs, Trainee Driver, Driver Reports, Leave & Absence and Medication Checks.",
    }) +
    `
  <main>
    <section class="page-hero">
      <div class="container">
        <div class="page-hero__inner">
          <p class="breadcrumb"><a href="${base}">Rail Intel</a> / Product</p>
          <span class="page-badge page-badge--app">Products</span>
          <h1 class="page-title">Apps and the modules that extend them</h1>
          <p class="page-lead">Rail Intel CMS is the competency system of record. Rail Intel Investigations is a separate app for evidence-first investigations. CMS add-on modules bolt on when your operation needs them.</p>
          <div class="page-actions">
            <a href="${site.app}" class="btn btn-primary btn-lg">Open Rail Intel CMS</a>
            <a href="${base}features/" class="btn btn-ghost btn-lg">See CMS core features</a>
          </div>
        </div>
      </div>
    </section>

    <section class="page-section">
      <div class="container">
        <div class="page-section__head">
          <h2>Apps</h2>
          <p>Standalone Rail Intel products — not CMS add-on modules.</p>
        </div>
        <div class="card-grid">
${appCards}
        </div>
      </div>
    </section>

    <section class="page-section">
      <div class="container">
        <div class="page-section__head">
          <h2>CMS add-on modules</h2>
          <p>Optional modules that extend Rail Intel CMS. Each is activated per company and can be trialled before you commit.</p>
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

function cdpShotFigure(shot, base, { fill = false, eager = false } = {}) {
  const size = manifest[shot.src];
  if (!size) throw new Error(`Missing screenshot in manifest: ${shot.src}`);
  const scale = typeof shot.scale === "number" ? shot.scale : 1;
  const width = Math.max(1, Math.round(size.width * scale));
  const height = Math.max(1, Math.round(size.height * scale));
  const fillClass = fill ? " cdp-chapter__figure--fill" : "";
  const compactClass = shot.compact ? " cdp-chapter__figure--compact" : "";
  const loading = eager ? "eager" : "lazy";
  const fetchPriority = eager ? ' fetchpriority="high"' : "";

  return `              <figure class="cdp-chapter__figure shot${fillClass}${compactClass}" style="--shot-native-width: ${width}px">
                <div class="shot__frame">
                  <img src="${base}${shot.src}?v=${ASSET_VERSION}" alt="${esc(shot.caption || "")}" width="${width}" height="${height}" sizes="(min-width: 1100px) ${width}px, 96vw" loading="${loading}" decoding="async"${fetchPriority} />
                </div>
                <figcaption class="shot__caption">${esc(shot.caption || "")}</figcaption>
              </figure>`;
}

function renderCdpChapterBody(chapter) {
  return (chapter.body || []).map((text) => `              <p>${rich(text)}</p>`).join("\n");
}

function renderCdpChapterBullets(bullets) {
  if (!bullets?.length) return "";
  return `              <ul class="spec-list cdp-chapter__bullets">\n${bullets
    .map((item) => `                <li>${rich(item)}</li>`)
    .join("\n")}\n              </ul>`;
}

function renderCdpChapterContent(chapter, base) {
  if (chapter.pillars?.length) {
    return `              <div class="cdp-pillars">
${chapter.pillars
  .map(
    (pillar, pillarIndex) => `                <article class="cdp-pillar reveal">
                  <span class="cdp-pillar__index">${String(pillarIndex + 1).padStart(2, "0")}</span>
                  <h4>${esc(pillar.title)}</h4>
                  <p>${esc(pillar.detail)}</p>
                </article>`
  )
  .join("\n")}
              </div>`;
  }

  if (chapter.compare?.length) {
    const tabs = chapter.compare
      .map(
        (item, itemIndex) =>
          `                <button type="button" class="cdp-compare__tab" role="tab" data-cdp-compare-tab="${esc(item.id)}" aria-selected="${itemIndex === 0 ? "true" : "false"}">${esc(item.label)}</button>`
      )
      .join("\n");
    const panels = chapter.compare
      .map(
        (item, itemIndex) => `                <div class="cdp-compare__panel" data-cdp-compare-panel="${esc(item.id)}" role="tabpanel"${itemIndex > 0 ? ' hidden aria-hidden="true"' : ""}>
${cdpShotFigure(item.shot, base)}
                </div>`
      )
      .join("\n");

    return `              <div class="cdp-compare" data-cdp-compare>
                <div class="cdp-compare__tabs" role="tablist" aria-label="Carryover views">
${tabs}
                </div>
                <div class="cdp-compare__stage">
${panels}
                </div>
              </div>`;
  }

  if (chapter.roles?.length) {
    const roles = chapter.roles
      .map(
        (role, roleIndex) => `                <button type="button" class="cdp-role" data-cdp-role="${roleIndex}" aria-pressed="${roleIndex === 0 ? "true" : "false"}">
                  <span class="cdp-role__name">${esc(role.name)}</span>
                  <span class="cdp-role__detail">${esc(role.detail)}</span>
                </button>`
      )
      .join("\n");
    const shotBlock = chapter.shot
      ? `              <div class="cdp-chapter__shots cdp-chapter__shots--full">
${cdpShotFigure(chapter.shot, base, { fill: true })}
              </div>`
      : chapter.shots?.length
        ? `              <div class="cdp-chapter__shots cdp-chapter__shots--pair">
${chapter.shots.map((shot) => cdpShotFigure(shot, base)).join("\n")}
              </div>`
        : "";

    return `              <div class="cdp-roles" data-cdp-roles role="list" aria-label="Role access">
${roles}
              </div>
${shotBlock}`;
  }

  if (chapter.shot) {
    if (chapter.shotLayout === "split") {
      return `              <div class="cdp-chapter__split">
                <div class="cdp-chapter__split-copy">
${renderCdpChapterBullets(chapter.bullets)}
                </div>
                <div class="cdp-chapter__split-visual">
${cdpShotFigure(chapter.shot, base, { fill: true })}
                </div>
              </div>`;
    }

    const layoutClass =
      chapter.shotLayout === "full" ? "cdp-chapter__shots--full" : "cdp-chapter__shots--center";

    return `              <div class="cdp-chapter__shots ${layoutClass}">
${cdpShotFigure(chapter.shot, base, { fill: chapter.shotLayout === "full" })}
              </div>`;
  }

  return renderCdpChapterBullets(chapter.bullets);
}

function renderCdpChapter(chapter, base, index) {
  const bulletsInline =
    chapter.shot && chapter.shotLayout === "split" ? "" : renderCdpChapterBullets(chapter.bullets);

  return `        <article class="cdp-chapter reveal" data-cdp-chapter="${index}" id="cdp-chapter-${index}" data-cdp-chapter-id="${esc(chapter.id)}">
          <header class="cdp-chapter__head">
            <p class="cdp-chapter__num">${esc(chapter.num)}</p>
            <div class="cdp-chapter__titles">
              <p class="cdp-chapter__subtitle">${esc(chapter.subtitle)}</p>
              <h2 class="cdp-chapter__title">${esc(chapter.title)}</h2>
            </div>
          </header>
          <div class="cdp-chapter__body">
${renderCdpChapterBody(chapter)}
${bulletsInline}
          </div>
          <div class="cdp-chapter__content">
${renderCdpChapterContent(chapter, base)}
          </div>
        </article>`;
}

function renderCdpExperience(group, base) {
  const exp = group.experience;
  if (!exp) return "";

  const accent = group.accent || "#38bdf8";
  const stats = exp.stats
    .map(
      (stat) => `            <div class="cdp-stat reveal">
              <p class="cdp-stat__value">${esc(stat.value)}</p>
              <p class="cdp-stat__label">${esc(stat.label)}</p>
              <p class="cdp-stat__detail">${esc(stat.detail)}</p>
            </div>`
    )
    .join("\n");

  const lifecycle = exp.lifecycle
    .map(
      (step, stepIndex) => `            <button type="button" class="cdp-lifecycle__step" data-cdp-lifecycle="${stepIndex}" aria-pressed="false">
              <span class="cdp-lifecycle__dot" aria-hidden="true"></span>
              <span class="cdp-lifecycle__copy">
                <strong>${esc(step.title)}</strong>
                <span>${esc(step.detail)}</span>
              </span>
            </button>`
    )
    .join("\n");

  const rail = exp.chapters
    .map(
      (chapter, index) => `            <a class="cdp-rail__link" href="#cdp-chapter-${index}" data-cdp-rail="${index}">
              <span class="cdp-rail__num">${esc(chapter.num)}</span>
              <span class="cdp-rail__title">${esc(chapter.title)}</span>
            </a>`
    )
    .join("\n");

  const chapters = exp.chapters.map((chapter, index) => renderCdpChapter(chapter, base, index)).join("\n");

  return `    <section class="page-section page-section--cdp" style="--cdp-accent: ${esc(accent)}">
      <div class="container container--cdp">
        <div class="cdp-stats" aria-label="CDP monitoring highlights">
${stats}
        </div>

        <div class="cdp-command" data-cdp-experience data-cdp-count="${exp.chapters.length}">
          <div class="cdp-command__intro reveal">
            <p class="cdp-command__eyebrow">Competence development lifecycle</p>
            <h2 class="cdp-command__title">From finding to closure — with nothing lost at the cycle boundary</h2>
            <div class="cdp-lifecycle" data-cdp-lifecycle-bar role="list" aria-label="CDP lifecycle">
              <span class="cdp-lifecycle__track" aria-hidden="true"><span class="cdp-lifecycle__fill" data-cdp-lifecycle-progress style="width: 0%"></span></span>
${lifecycle}
            </div>
          </div>

          <div class="cdp-command__layout">
            <aside class="cdp-rail-wrap" aria-label="CDP chapters">
              <nav class="cdp-rail">
${rail}
              </nav>
            </aside>
            <div class="cdp-chapters">
${chapters}
            </div>
          </div>
        </div>
      </div>
    </section>`;
}

function cdpMonitoringPage(group) {
  const base = "../";
  const accent = group.accent || "#38bdf8";

  const heroCopy = `          <p class="breadcrumb"><a href="${base}">Rail Intel</a> / <a href="${base}features/">Features</a> / ${esc(
    group.name
  )}</p>
          <span class="page-badge page-badge--core">Included as standard</span>
          <h1 class="page-title">${esc(group.tagline)}</h1>
          <p class="page-lead">${esc(group.lead)}</p>
          <div class="page-actions">
            <a href="${site.app}" class="btn btn-primary btn-lg">Open Rail Intel</a>
            <a href="${base}features/" class="btn btn-ghost btn-lg">All features</a>
          </div>`;

  return (
    renderHead(base, {
      title: `${group.name} – Rail Intel features`,
      description: group.summary,
    }) +
    `
  <main>
    <section class="page-hero page-hero--cdp" style="--cdp-accent: ${esc(accent)}">
      <div class="container">
        <div class="page-hero__inner page-hero__inner--split">
          <div class="page-hero__copy">
${heroCopy}
          </div>
          <div class="cdp-hero-board reveal" aria-hidden="true">
            <div class="cdp-hero-board__chrome">
              <span class="cdp-hero-board__dot cdp-hero-board__dot--live"></span>
              <span class="cdp-hero-board__label">Monitoring · Live record</span>
            </div>
            <div class="cdp-hero-board__grid">
              <div class="cdp-hero-board__metric">
                <span class="cdp-hero-board__metric-label">Open CDPs</span>
                <strong>3</strong>
                <span class="cdp-hero-board__metric-note">Active development points</span>
              </div>
              <div class="cdp-hero-board__metric">
                <span class="cdp-hero-board__metric-label">Linked incidents</span>
                <strong>1</strong>
                <span class="cdp-hero-board__metric-note">Allocated to employee</span>
              </div>
              <div class="cdp-hero-board__metric cdp-hero-board__metric--accent">
                <span class="cdp-hero-board__metric-label">Cycle carryover</span>
                <strong>Auto</strong>
                <span class="cdp-hero-board__metric-note">Open items preserved</span>
              </div>
            </div>
            <div class="cdp-hero-board__footer">
              <span>Employee record · Development tab</span>
            </div>
          </div>
        </div>
      </div>
    </section>

${renderCdpExperience(group, base)}

${renderCta(base, {
  ...(group.cta || {
    heading: "Everything here is included",
    body: "These capabilities are part of core Rail Intel, gated only by the permissions you assign. Optional modules extend them further.",
  }),
  showAppCta: group.showAppCta,
})}
  </main>

` +
    renderFooter(base)
  );
}

function renderHeroIntro(intro) {
  if (!intro) return "";

  const body = (intro.body || []).map((text) => `            <p>${rich(text)}</p>`).join("\n");
  const tiles = intro.tiles
    ? `            <div class="admin-intro-tiles" data-admin-intro-tiles>\n${intro.tiles
        .map(
          (tile, index) => `              <article class="admin-intro-tile${index === 0 ? " is-active" : ""}" data-admin-intro-tile>
                <h3 class="admin-intro-tile__title">${esc(tile.title)}</h3>
                <p>${esc(tile.detail)}</p>
              </article>`
        )
        .join("\n")}\n            </div>`
    : intro.bullets
      ? `            <ul class="spec-list">\n${intro.bullets
          .map((item) => `              <li>${rich(item)}</li>`)
          .join("\n")}\n            </ul>`
      : "";

  return `
          <div class="page-hero__intro">
            <h2 class="page-hero__intro-title">${esc(intro.heading)}</h2>
${body}
${tiles}
          </div>`;
}

function featurePage(group) {
  if (group.slug === "languages") return languagesHubPage();

  const base = "../";
  const demo =
    group.slug === "tunnel-mode" ? `\n${tunnelDemo(base, { link: false })}\n` : "\n";

  const heroCopy = `          <p class="breadcrumb"><a href="${base}">Rail Intel</a> / <a href="${base}features/">Features</a> / ${esc(
    group.name
  )}</p>
          <span class="page-badge page-badge--core">Included as standard</span>
          <h1 class="page-title">${group.taglineHtml || esc(group.tagline)}</h1>
          <p class="page-lead">${esc(group.lead)}</p>
${
  group.hideHeroActions
    ? ""
    : `          <div class="page-actions">
${
  group.showAppCta === false
    ? ""
    : `            <a href="${site.app}" class="btn btn-primary btn-lg">Open Rail Intel</a>\n`
}            <a href="${base}features/" class="btn btn-ghost btn-lg">All features</a>
          </div>`
}${renderHeroIntro(group.heroIntro)}`;

  const heroInner = group.heroShot
    ? `        <div class="page-hero__inner page-hero__inner--split${group.heroIntro ? " page-hero__inner--with-intro" : ""}">
          <div class="page-hero__copy">
${heroCopy}
          </div>
          <div class="page-hero__media">
${renderShot(group.heroShot, base, { fill: true })}
          </div>
        </div>`
    : `        <div class="page-hero__inner">
${heroCopy}
        </div>`;

  return (
    renderHead(base, {
      title: `${group.name} – Rail Intel features`,
      description: group.summary,
    }) +
    `
  <main>
    <section class="page-hero${group.heroIntro ? " page-hero--intro-split" : ""}">
      <div class="container">
${heroInner}
      </div>
    </section>
${demo}
${group.sections.map((section) => renderSection(section, base)).join("\n\n")}

${renderCta(base, {
  ...(group.cta || {
    heading: "Everything here is included",
    body: "These capabilities are part of core Rail Intel, gated only by the permissions you assign. Optional modules extend them further.",
  }),
  showAppCta: group.showAppCta,
})}
  </main>

` +
    renderFooter(base)
  );
}

function languagesHubPage() {
  const base = "../";
  const group = featureGroups.find((item) => item.slug === "languages");
  const cards = languages.items
    .map(
      (lang) => `        <article class="card card--language card--language--${esc(lang.code)}" style="--lang-flag: url('${base}images/flags/${esc(lang.flag)}.svg')">
          <span class="card__kicker">${esc(lang.code.toUpperCase())}</span>
          <h3>${esc(lang.name)}</h3>
          <p class="card__native" lang="${esc(lang.code)}">${esc(lang.nativeName)}</p>
          <p lang="${esc(lang.code)}">${esc(lang.summary)}</p>
        </article>`
    )
    .join("\n");

  return (
    renderHead(base, {
      title: "Languages – Rail Intel features",
      description: group.summary,
    }) +
    `
  <main>
    <section class="page-hero">
      <div class="container">
        <div class="page-hero__inner">
          <p class="breadcrumb"><a href="${base}">Rail Intel</a> / <a href="${base}features/">Features</a> / Languages</p>
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

    <section class="page-section">
      <div class="container">
        <div class="page-section__head">
          <h2>${esc(languages.heading)}</h2>
          <p>${esc(languages.lead)}</p>
        </div>
        <div class="card-grid card-grid--languages">
${cards}
        </div>
      </div>
    </section>

${renderCta(base, {
  heading: "Work in the language your team uses",
  body: "Language support is part of core Rail Intel. Users can select and switch language at sign-in or from the header — no separate enable step.",
})}
  </main>

` +
    renderFooter(base)
  );
}

function tunnelDemo(base, { link = true } = {}) {
  const actions = link
    ? `          <div class="page-actions" style="margin-top:1.5rem">
            <a href="${base}features/tunnel-mode.html" class="btn btn-primary">How Tunnel Mode works</a>
          </div>`
    : "";

  return `    <section class="tunnel" aria-labelledby="tunnel-heading">
      <div class="container tunnel__grid">
        <div class="tunnel__copy">
          <p class="product-eyebrow">Tunnel Mode</p>
          <h2 id="tunnel-heading">Dark and dimmable for the cab</h2>
          <p>A bright tablet against a dark windscreen is a distraction. When you enter a tunnel, the assessor switches assessing to dark mode and can dim the screen further on mobile or tablet &mdash; glare drops, and the focus stays on the railway.</p>
          <ul class="spec-list">
            <li><strong>One-tap dark mode</strong> from the assessment header &mdash; switched by the assessor, not by the device.</li>
            <li><strong>Dimmable brightness</strong> on mobile and tablet, adjusted by hand to suit the cab.</li>
            <li><strong>Cab safety notice</strong> at the start of an event that offers dark mode in one tap.</li>
          </ul>
${actions}
        </div>
        <div class="tunnel__stage" data-tunnel>
          <div class="tunnel__frame">
          <div class="tunnel-scene">
            <video class="tunnel-scene__video" autoplay muted loop playsinline preload="metadata" poster="${base}images/train-entering-tunnel.jpg" aria-hidden="true">
              <source src="${base}images/train-entering-tunnel.mp4" type="video/mp4" />
            </video>
            <div class="tunnel-scene__night"></div>
          </div>
          <div class="tunnel-device" aria-hidden="true">
            <div class="tunnel-device__bezel">
              <div class="tunnel-device__screen">
                <p class="tunnel-device__label">Assessing</p>
                <p class="tunnel-device__title">Route knowledge</p>
                <div class="tunnel-device__bars">
                  <span></span><span></span><span></span>
                </div>
                <div class="tunnel-device__controls">
                  <span class="tunnel-device__pill">Dark</span>
                  <span class="tunnel-device__slider"><i></i></span>
                </div>
              </div>
            </div>
          </div>
          </div>
          <div class="tunnel__toolbar">
            <button type="button" class="tunnel__btn is-active" data-tunnel-mode="day">Daylight</button>
            <button type="button" class="tunnel__btn" data-tunnel-mode="tunnel">Dark mode</button>
            <button type="button" class="tunnel__btn" data-tunnel-mode="dim">Dark + dim</button>
          </div>
          <p class="tunnel__caption">Dark mode and brightness are set by the assessor on the tablet &mdash; the device does not switch automatically when the cab goes dark.</p>
        </div>
      </div>
    </section>`;
}

function featuresIndex() {
  const base = "../";
  const cards = featureGroups
    .map(
      (group) => `        <a class="card" href="${base}features/${group.slug}.html">
          <span class="card__kicker">${
            group.slug === "tunnel-mode"
              ? "Cab safety"
              : group.slug === "languages"
                ? "International"
                : group.slug === "digital-cab-passes"
                  ? "Operations"
                  : group.slug === "administration"
                    ? "Configuration"
                    : "Core"
          }</span>
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
        "The core Rail Intel feature set: Tunnel Mode, digital cab passes with QR verification, competency cycles, workforce records, medicals and licensing, incidents, CDP monitoring, administration, reporting and international languages.",
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

${tunnelDemo(base)}

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

function securityPage() {
  const base = "";
  const accessItems = security.access.items
    .map(
      (item) => `          <li>
            <strong>${esc(item.title)}</strong>
            ${esc(item.body)}
          </li>`
    )
    .join("\n");
  const methods = security.twoFactor.methods
    .map(
      (item) => `          <li>
            <strong>${esc(item.title)}</strong>
            ${esc(item.body)}
          </li>`
    )
    .join("\n");
  const twoFactorViewer = security.twoFactor.viewer
    ? renderViewerGallery(security.twoFactor.viewer, base)
    : "";
  const rules = security.twoFactor.rules
    .map(
      (step) => `          <li>
            <h3>${esc(step.heading)}</h3>
            <p>${esc(step.body)}</p>
          </li>`
    )
    .join("\n");
  const azureItems = security.azure.items
    .map(
      (item) => `          <li>
            <strong>${esc(item.title)}</strong>
            ${esc(item.body)}
          </li>`
    )
    .join("\n");

  return (
    renderHead(base, {
      title: "Security – Rail Intel",
      description: security.lead,
    }) +
    `
  <main>
    <section class="page-hero">
      <div class="container">
        <div class="page-hero__inner page-hero__inner--split">
          <div class="page-hero__copy">
            <p class="breadcrumb"><a href="${base}/">Rail Intel</a> / Security</p>
            <h1 class="page-title">${esc(security.title)}</h1>
            <p class="page-lead">${esc(security.lead)}</p>
          </div>
          <aside class="security-panel" aria-label="Microsoft Azure hosting and compliance">
            <div class="security-panel__host">
              <img class="security-panel__mark" src="images/security/azure-hosting.svg" alt="" width="72" height="72" decoding="async" />
              <div>
                <p class="security-panel__eyebrow">${esc(security.heroAside.eyebrow)}</p>
                <p class="security-panel__title">${esc(security.heroAside.title)}</p>
                <p class="security-panel__body">${esc(security.heroAside.body)}</p>
              </div>
            </div>
            <ul class="security-panel__badges">
${security.heroAside.badges
  .map(
    (badge) => `              <li>
                <img src="${esc(badge.src)}" alt="${esc(badge.label)} — Azure platform certification" width="200" height="88" loading="lazy" decoding="async" />
              </li>`
  )
  .join("\n")}
            </ul>
            <p class="security-panel__note">${esc(security.heroAside.note)}</p>
          </aside>
        </div>
      </div>
    </section>

    <section class="page-section">
      <div class="container">
        <div class="page-section__head">
          <h2>${esc(security.access.heading)}</h2>
          <p>${esc(security.access.lead)}</p>
        </div>
        <ul class="spec-list">
${accessItems}
        </ul>
      </div>
    </section>

    <section class="page-section page-section--viewer">
      <div class="container container--showcase">
        <div class="page-section__head">
          <h2>${esc(security.twoFactor.heading)}</h2>
          <p>${esc(security.twoFactor.lead)}</p>
        </div>
        <ul class="spec-list">
${methods}
        </ul>
${twoFactorViewer}
      </div>
    </section>

    <section class="page-section">
      <div class="container">
        <div class="page-section__head">
          <h2>How 2FA is governed</h2>
          <p>These rules keep second-factor policy under administrator control while giving users a clear path to enrol and recover.</p>
        </div>
        <ol class="steps steps--two">
${rules}
        </ol>
      </div>
    </section>

    <section class="page-section">
      <div class="container">
        <div class="page-section__head">
          <h2>${esc(security.azure.heading)}</h2>
          <p>${esc(security.azure.lead)}</p>
        </div>
        <ul class="spec-list">
${azureItems}
        </ul>
      </div>
    </section>

    <section class="page-section">
      <div class="container">
        <div class="page-section__head">
          <h2>${esc(security.closing.heading)}</h2>
          <p>${esc(security.closing.lead)}</p>
        </div>
        <div class="page-actions">
          <a href="/" class="btn btn-primary btn-lg">Home</a>
        </div>
      </div>
    </section>
  </main>

` +
    renderFooter(base)
  );
}

/* ----------------------------------------------------- homepage gallery */

const attr = (name, value) => (value ? ` ${name}="${esc(value)}"` : "");

const versionedAsset = (src) => `${String(src).split("?")[0]}?v=${ASSET_VERSION}`;

function renderHomeGallery() {
  const defaultTab = homeGallery.tabs.find((tab) => tab.active) || homeGallery.tabs[0];
  const reportingTab = homeGallery.tabs.find((tab) => tab.carousel);
  const reportingSlides = reportingTab?.slides || [];

  const renderBullets = (items) =>
    items.map((item) => `            <li>${esc(item)}</li>`).join("\n");

  const renderTabButton = (tab) => {
    const attrs = [
      attr("data-src", tab.image?.src ? versionedAsset(tab.image.src) : ""),
      attr("data-alt", tab.image?.alt || tab.slides?.[0]?.alt || ""),
      attr("data-url", tab.url),
      attr("data-width", tab.image?.width || tab.slides?.[0]?.width),
      attr("data-height", tab.image?.height || tab.slides?.[0]?.height),
      attr("data-chip-safe-title", tab.chips?.safe?.title),
      attr("data-chip-safe-detail", tab.chips?.safe?.detail),
      attr("data-chip-alert-title", tab.chips?.alert?.title),
      attr("data-chip-alert-detail", tab.chips?.alert?.detail),
      attr("data-copy-eyebrow", tab.copy.eyebrow),
      attr("data-copy-heading", tab.copy.heading),
      attr("data-copy-lead", tab.copy.lead),
      attr(
        "data-copy-bullets",
        tab.copy.bullets.join("|")
      ),
    ];

    if (tab.wide) attrs.push(' data-wide="true"');

    if (tab.carousel && tab.slides?.length) {
      attrs.push(' data-carousel="true"');
      attrs.push(
        attr(
          "data-carousel-slides",
          tab.slides.map((slide) => versionedAsset(slide.src)).join("|")
        )
      );
      attrs.push(attr("data-carousel-alts", tab.slides.map((slide) => slide.alt).join("|")));
      attrs.push(attr("data-carousel-widths", tab.slides.map((slide) => slide.width).join("|")));
      attrs.push(attr("data-carousel-heights", tab.slides.map((slide) => slide.height).join("|")));
      attrs.push(
        attr(
          "data-carousel-chip-safe-titles",
          tab.slides.map((slide) => slide.chips.safe.title).join("|")
        )
      );
      attrs.push(
        attr(
          "data-carousel-chip-safe-details",
          tab.slides.map((slide) => slide.chips.safe.detail).join("|")
        )
      );
      attrs.push(
        attr(
          "data-carousel-chip-alert-titles",
          tab.slides.map((slide) => slide.chips.alert.title).join("|")
        )
      );
      attrs.push(
        attr(
          "data-carousel-chip-alert-details",
          tab.slides.map((slide) => slide.chips.alert.detail).join("|")
        )
      );
    }

    return `              <button type="button" class="gallery-tab${tab.active ? " is-active" : ""}" role="tab" aria-selected="${tab.active ? "true" : "false"}"${attrs.join("")}>${esc(tab.label)}</button>`;
  };

  const renderCarousel = () => {
    if (!reportingSlides.length) return "";
    const slides = reportingSlides
      .map(
        (slide) => `                        <div class="gallery-carousel__slide">
                          <img
                            src="${esc(versionedAsset(slide.src))}"
                            alt="${esc(slide.alt)}"
                            width="${slide.width}"
                            height="${slide.height}"
                            loading="lazy"
                            decoding="async"
                          />
                        </div>`
      )
      .join("\n");

    return `                  <div class="gallery-carousel" data-gallery-carousel hidden>
                    <div class="gallery-carousel__viewport">
                      <div class="gallery-carousel__track" data-gallery-carousel-track>
${slides}
                      </div>
                    </div>
                  </div>`;
  };

  return `
    <section class="product-section product-section--elevated" id="product" aria-labelledby="command-heading">
      <div class="container product-section__inner">
        <div class="product-section__copy" data-gallery-copy>
          <p class="product-eyebrow" data-copy-eyebrow>${esc(defaultTab.copy.eyebrow)}</p>
          <h2 id="command-heading" data-copy-heading>${esc(defaultTab.copy.heading)}</h2>
          <p class="product-lead" data-copy-lead>${esc(defaultTab.copy.lead)}</p>
          <ul class="product-bullets" data-copy-bullets>
${renderBullets(defaultTab.copy.bullets)}
          </ul>
        </div>
        <div class="product-section__media">
          <div class="product-gallery product-gallery--command" data-gallery>
            <div class="float-stage">
              <div class="browser-mockup browser-mockup--primary">
                <div class="browser-mockup__chrome">
                  <span class="browser-mockup__dots"></span>
                  <span class="browser-mockup__url" data-gallery-url>${esc(defaultTab.url)}</span>
                </div>
                <div class="browser-mockup__content">
                  <img
                    src="${esc(versionedAsset(defaultTab.image.src))}"
                    alt="${esc(defaultTab.image.alt)}"
                    width="${defaultTab.image.width}"
                    height="${defaultTab.image.height}"
                    data-gallery-main
                    loading="lazy"
                    decoding="async"
                  />
${renderCarousel()}
                </div>
              </div>
              <span class="hero-chip hero-chip--safe" data-gallery-chip="safe" aria-hidden="true">
                <span class="hero-chip__dot"></span>
                <span>
                  <strong data-chip-title>${esc(defaultTab.chips.safe.title)}</strong>
                  <span data-chip-detail>${esc(defaultTab.chips.safe.detail)}</span>
                </span>
              </span>
              <span class="hero-chip hero-chip--alert" data-gallery-chip="alert" aria-hidden="true">
                <span class="hero-chip__dot"></span>
                <span>
                  <strong data-chip-title>${esc(defaultTab.chips.alert.title)}</strong>
                  <span data-chip-detail>${esc(defaultTab.chips.alert.detail)}</span>
                </span>
              </span>
            </div>
            <div class="gallery-tabs" role="tablist" aria-label="Command centre screens">
${homeGallery.tabs.map(renderTabButton).join("\n")}
            </div>
          </div>
        </div>
      </div>
    </section>
`;
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
    "<!-- home-gallery:start -->",
    "<!-- home-gallery:end -->",
    renderHomeGallery()
  );

  html = replaceBetween(
    html,
    "<!-- footer-nav:start -->",
    "<!-- footer-nav:end -->",
    `
        <a href="products/">Products</a>
        <a href="features/">Features</a>
        <a href="how-it-works.html">How it works</a>
        <a href="security.html">Security</a>
        <a href="${site.app}">Log in</a>
      `
  );

  html = html
    .replace(/css\/style\.css\?v=\d+/, `css/style.css?v=${ASSET_VERSION}`)
    .replace(/css\/pages\.css\?v=\d+/, `css/pages.css?v=${ASSET_VERSION}`)
    .replace(/js\/main\.js\?v=\d+/, `js/main.js?v=${ASSET_VERSION}`)
    .replace(/js\/site\.js\?v=\d+/, `js/site.js?v=${ASSET_VERSION}`)
    .replace(/<!-- site-asset-version:\d+ -->/, `<!-- site-asset-version:${ASSET_VERSION} -->`);

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
for (const product of products) {
  if (product.href && product.href.endsWith(".html")) {
    emit(product.href, productPage(product));
  }
}
for (const addon of addons) {
  emit(`products/${addon.slug}.html`, addon.slug === "trainee-driver" ? traineeDriverPage(addon) : addonPage(addon));
}

emit("features/index.html", featuresIndex());
for (const group of featureGroups) {
  emit(
    `features/${group.slug}.html`,
    group.slug === "cdp-monitoring" ? cdpMonitoringPage(group) : featurePage(group)
  );
}

emit("how-it-works.html", howItWorksPage());
emit("security.html", securityPage());
written.push(syncIndex());

console.log(`generated ${written.length} pages:`);
for (const path of written) console.log(`  ${path}`);
