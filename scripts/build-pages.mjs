/**
 * Generates the Products, Features, How it works and Security pages from
 * content/site.mjs, and keeps the shared navigation in index.html in step.
 *
 * Output is plain static HTML committed to the repo, so GitHub Pages serves it
 * directly and there is no build step at request time.
 *
 * Run: node scripts/build-pages.mjs
 */
import { createHash } from "crypto";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { site, products, upcomingProducts, addons, capacityAddons, featureGroups, howItWorks, security, privacy, contact, getStarted, languages } from "../content/site.mjs";
import { homeGallery } from "../content/home-gallery.mjs";
import {
  SITE_URL,
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  home as homeSeo,
  staticPages,
  pageUrl,
  seoForItem,
  guideSeo,
  collectJsonLd,
  allSitemapPaths,
} from "../content/seo.mjs";
import { mergeItemSeo } from "../content/seo-extensions.mjs";
import { guides, competitors, comparisonCriteria } from "../content/guides.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(readFileSync(join(root, "images/screens/manifest.json"), "utf8"));

/** Derived from asset file contents so deploys always get a new ?v= even if CSS/JS changed. */
const ASSET_INPUTS = [
  "css/style.css",
  "css/pages.css",
  "js/site.js",
  "js/newsletter.js",
  "js/eoi.js",
  "js/phone-country-codes.js",
  "js/signup.js",
  "js/contact.js",
  "js/quotation.js",
  "js/invoice.js",
];

function computeAssetVersion() {
  const hash = createHash("sha256");
  for (const rel of ASSET_INPUTS) {
    const path = join(root, rel);
    if (!existsSync(path)) continue;
    hash.update(rel);
    hash.update(readFileSync(path));
  }
  return parseInt(hash.digest("hex").slice(0, 7), 16);
}

const ASSET_VERSION = computeAssetVersion();
const TURNSTILE_SITE_KEY = process.env.TURNSTILE_SITE_KEY?.trim() || contact.turnstileSiteKey?.trim() || "";

const esc = (value) =>
  String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Supports **bold** in body copy so the content file stays readable. */
const rich = (value) => esc(value).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

const appUrl = (key) => site[key] || site.app;

/* ------------------------------------------------------------------ chrome */

function renderDevBanner() {
  return `<div class="dev-banner__inner">
      <p>Rail Intel is launching in April 2027</p>
      <button type="button" class="dev-banner__btn" data-eoi-open>Register interest</button>
    </div>`;
}

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
          <a href="${base}get-started.html" class="nav-link">Get started</a>
          <a href="${site.app}" class="nav-link">Log in</a>
          <a href="${site.app}" class="btn btn-primary">Go to app</a>
        </div>
      </nav>`;
}

function renderJsonLd(blocks) {
  if (!blocks?.length) return "";
  return blocks
    .map((block) => `  <script type="application/ld+json">${JSON.stringify(block)}</script>`)
    .join("\n");
}

function renderSeoMeta(pageSeo) {
  const canonical = pageUrl(pageSeo.path);
  const ogImage = pageUrl(pageSeo.ogImage || DEFAULT_OG_IMAGE);
  const robots = pageSeo.robots || "index, follow";
  const keywords = pageSeo.keywords ? `  <meta name="keywords" content="${esc(pageSeo.keywords)}" />\n` : "";

  return `  <title>${esc(pageSeo.title)}</title>
  <meta name="description" content="${esc(pageSeo.description)}" />
  <meta name="robots" content="${esc(robots)}" />
${keywords}  <link rel="canonical" href="${esc(canonical)}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="${esc(SITE_NAME)}" />
  <meta property="og:title" content="${esc(pageSeo.title)}" />
  <meta property="og:description" content="${esc(pageSeo.description)}" />
  <meta property="og:url" content="${esc(canonical)}" />
  <meta property="og:image" content="${esc(ogImage)}" />
  <meta property="og:locale" content="en_GB" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(pageSeo.title)}" />
  <meta name="twitter:description" content="${esc(pageSeo.description)}" />
  <meta name="twitter:image" content="${esc(ogImage)}" />
${renderJsonLd(collectJsonLd(pageSeo))}`;
}

function renderRelatedLinks(base, links) {
  if (!links?.length) return "";
  const items = links
    .map((link) => `<a href="${base}${link.href}">${esc(link.name)}</a>`)
    .join(", ");
  return `
    <section class="page-section page-section--tight">
      <div class="container">
        <p class="page-lead">Related: ${items}</p>
      </div>
    </section>`;
}

function renderFaqShot(shot, base) {
  const size = manifest[shot.src];
  if (!size) throw new Error(`Missing screenshot in manifest: ${shot.src}`);

  const scale = typeof shot.scale === "number" ? shot.scale : 1;
  const imgWidth = scale === 1 ? size.width : Math.max(1, Math.round(size.width * scale));
  const imgHeight = scale === 1 ? size.height : Math.max(1, Math.round(size.height * scale));
  const frameStyle = ` style="--shot-display-width: ${size.width}px"`;
  const figureClass = [
    "procurement-faq__shot",
    "shot",
    "shot--full",
    "reveal",
    shot.bordered ? "procurement-faq__shot--bordered" : null,
  ]
    .filter(Boolean)
    .join(" ");
  const noExpand = shot.noExpand ? ' data-no-expand=""' : "";

  return `            <figure class="${figureClass}"${frameStyle}>
              <div class="shot__frame shot__frame--fullwidth"${frameStyle}${noExpand}>
                <img src="${base}${shot.src}?v=${ASSET_VERSION}" alt="${esc(shot.alt || shot.caption || "")}" width="${imgWidth}" height="${imgHeight}" loading="lazy" decoding="async" />
              </div>
${shot.caption ? `              <figcaption class="shot__caption">${esc(shot.caption)}</figcaption>\n` : ""}            </figure>`;
}

function renderFaqAnswerParagraphs(answer, textClass = "") {
  const parts = Array.isArray(answer) ? answer : [answer];
  const classAttr = textClass ? ` class="${textClass}"` : "";
  return parts.map((part) => `              <p${classAttr}>${esc(part)}</p>`).join("\n");
}

function renderFaqSection(faq, base = "") {
  if (!faq?.length) return "";
  const hasShots = faq.some((entry) => entry.shot);
  return `
    <section class="page-section page-section--tight${hasShots ? " page-section--crisp" : ""}" aria-label="Frequently asked questions">
      <div class="container">
        <div class="page-section__head">
          <h2>Frequently asked questions</h2>
        </div>
        <dl class="procurement-faq">
${faq
  .map((entry) => {
    if (entry.shot && base) {
      return `          <dt>${esc(entry.question)}</dt>
          <dd class="procurement-faq__answer procurement-faq__answer--media">
            <div class="procurement-faq__media-row">
${renderFaqShot(entry.shot, base)}
              <div class="procurement-faq__copy">
${renderFaqAnswerParagraphs(entry.answer, "procurement-faq__text")}
              </div>
            </div>
          </dd>`;
    }
    return `          <dt>${esc(entry.question)}</dt>
          <dd>
${renderFaqAnswerParagraphs(entry.answer)}
          </dd>`;
  })
  .join("\n")}
        </dl>
      </div>
    </section>`;
}

function staticPageSeo(relativePath) {
  const config = staticPages[relativePath];
  return {
    path: relativePath === "index.html" ? "/" : relativePath,
    title: config.title,
    description: config.description,
    keywords: config.keywords || "",
    faq: config.faq || [],
    breadcrumbs: config.breadcrumbs || [],
    robots: config.robots,
  };
}

function featureSeo(group) {
  return seoForItem(mergeItemSeo(group, group.slug), {
    path: `features/${group.slug}.html`,
    titleFallback: `${group.name} – Rail Intel features`,
    descriptionFallback: group.summary,
    breadcrumbParent: { name: "Features", path: "features/index.html" },
  });
}

function mergedItem(item, slug) {
  return mergeItemSeo(item, slug);
}

function renderHead(base, pageSeo, options = {}) {
  const turnstileMeta = options.turnstileSiteKey
    ? `  <meta name="turnstile-site-key" content="${esc(options.turnstileSiteKey)}" />\n`
    : "";
  const turnstileScript = options.turnstileSiteKey
    ? `  <script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" async defer></script>\n`
    : "";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
${renderSeoMeta(pageSeo)}
  <meta name="site-admin-api" content="/5473/api" />
  <meta name="cms-api" content="https://cms.railintel.co.uk/api" />
  <meta name="signup-api-proxy" content="/api/signup-proxy.php" />
${turnstileMeta}${turnstileScript}  <link rel="icon" href="${base}images/favicon-32.png" type="image/png" sizes="32x32" />
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
    .dev-banner { background: #f59e0b; color: #0c0f14; padding: 0.55rem 1.5rem; }
    .dev-banner__inner { display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 0.65rem 1rem; width: 100%; max-width: 1200px; margin: 0 auto; }
    .dev-banner p { margin: 0; font-size: 0.8125rem; font-weight: 600; }
    .dev-banner__btn { border: 0; border-radius: 999px; padding: 0.35rem 0.85rem; font-family: inherit; font-size: 0.75rem; font-weight: 700; background: #0c0f14; color: #fff; cursor: pointer; }
  </style>
</head>
<body>
  <div class="site-chrome">
    <div class="dev-banner" role="status">
      ${renderDevBanner()}
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

function renderFooterMarkup(base) {
  return `  <footer class="footer">
    <div class="footer__backdrop" aria-hidden="true"></div>
    <div class="footer__panel">
      <div class="container footer-grid">
        <div class="footer-col footer-col--brand">
          <a href="${base || "/"}" class="logo footer-brand">
            <img src="${base}images/rail-intel-icon.png" alt="" class="logo-img" width="512" height="512" />
            <span class="logo-text">Rail Intel</span>
          </a>
          <p class="footer-tagline">${esc(site.footerTagline)}</p>
          <div class="footer-newsletter footer-newsletter--inline">
            <h2 class="footer-newsletter__title" data-content-key="footer.newsletter.heading">Stay in the loop</h2>
            <p class="footer-newsletter__text" data-content-key="footer.newsletter.text">Product updates, rail compliance insight and release notes — no spam.</p>
            <form class="footer-newsletter__form" data-newsletter-form>
              <label class="sr-only" for="newsletter-email">Email address</label>
              <input id="newsletter-email" type="email" name="email" placeholder="you@company.co.uk" autocomplete="email" required />
              <input type="text" name="website" class="sr-only" tabindex="-1" autocomplete="off" aria-hidden="true" />
              <button type="submit" class="btn btn-primary">Subscribe</button>
            </form>
            <p class="footer-newsletter__message" data-newsletter-message hidden></p>
          </div>
        </div>
        <div class="footer-col footer-col--links">
          <h2 class="footer-heading">Products</h2>
          <nav class="footer-nav" aria-label="Products">
            ${products
              .map((product) => {
                const href = product.href === "" ? `${base}` : `${base}${product.href}`;
                return `<a href="${href}">${esc(product.name)}</a>`;
              })
              .join("\n            ")}
          </nav>
          <p class="footer-heading footer-heading--sub">${esc(upcomingProducts.label)}</p>
          <ul class="footer-nav footer-nav--plain">
            ${upcomingProducts.items.map((name) => `<li>${esc(name)}</li>`).join("\n            ")}
          </ul>
        </div>
        <div class="footer-col footer-col--links">
          <h2 class="footer-heading">Company</h2>
          <nav class="footer-nav" aria-label="Company">
            <a href="${base}privacy.html">Privacy policy</a>
            <a href="${base}contact.html">Contact us</a>
            <a href="${base}get-started.html">Get started</a>
            <a href="${site.app}">Log in</a>
          </nav>
        </div>
        <div class="footer-col footer-col--links">
          <h2 class="footer-heading">Addons</h2>
          <nav class="footer-nav" aria-label="Addons">
            ${addons
              .map((addon) => `<a href="${base}products/${addon.slug}.html">${esc(addon.name)}</a>`)
              .join("\n            ")}
          </nav>
        </div>
      </div>
      <div class="footer-bar">
        <div class="container footer-bar__inner">
          <p class="footer-bar__copy">Copyright &copy; <span data-year></span> Rail Intel. All rights reserved.</p>
          <nav class="footer-bar__links" aria-label="Legal">
            <a href="${base}privacy.html">Privacy policy</a>
            <a href="${base}contact.html">Contact</a>
            <a href="${site.app}">CMS login</a>
          </nav>
        </div>
      </div>
    </div>
  </footer>`;
}

function renderFooter(base) {
  return `${renderFooterMarkup(base)}

  <script src="${base}js/site.js?v=${ASSET_VERSION}"></script>
  <script src="${base}js/newsletter.js?v=${ASSET_VERSION}"></script>
</body>
</html>
`;
}

/* --------------------------------------------------------------- fragments */

function renderRotatingShot(shot, base, options = {}) {
  const slides = shot.rotate?.slides || [];
  if (slides.length < 2) throw new Error(`Rotating shot needs at least two slides: ${shot.src}`);

  const sizes = slides.map((slide) => {
    const size = manifest[slide.src];
    if (!size) throw new Error(`Missing screenshot in manifest: ${slide.src}`);
    return size;
  });

  const scale = typeof shot.scale === "number" ? shot.scale : 0.5;
  const fullWidth = scale === 1 && shot.full;
  const maxWidth = Math.max(...sizes.map((size) => Math.round(size.width * scale)));
  const interval = shot.rotate.interval || 5000;
  const classes = ["shot", shot.full ? "shot--full" : null, options.showcase ? "shot--showcase" : null, "reveal"]
    .filter(Boolean)
    .join(" ");
  const frameClass = fullWidth ? "shot__frame shot__frame--rotate shot__frame--fullwidth" : "shot__frame shot__frame--rotate";
  const rotateClass = fullWidth ? "shot-rotate shot-rotate--fullwidth" : "shot-rotate";
  const nativeMaxWidth = Math.max(...sizes.map((size) => size.width));
  const rotateStyle = fullWidth
    ? ` style="--shot-display-width: ${nativeMaxWidth}px"`
    : ` style="--shot-rotate-max-width: ${maxWidth}px"`;
  const frameStyle = fullWidth ? ` style="--shot-display-width: ${nativeMaxWidth}px"` : "";

  const slideMarkup = slides
    .map((slide, index) => {
      const size = sizes[index];
      const displayWidth = Math.max(1, Math.round(size.width * scale));
      const displayHeight = Math.max(1, Math.round(size.height * scale));
      const active = index === 0;
      const panelStyle = fullWidth ? "" : ` style="--shot-native-width: ${displayWidth}px"`;
      const slideWidth = scale === 1 ? size.width : displayWidth;
      const slideHeight = scale === 1 ? size.height : displayHeight;
      return `              <div class="shot-rotate__panel${active ? " is-active" : ""}" data-shot-rotate-panel="${index}"${panelStyle}${active ? ' aria-hidden="false"' : ' aria-hidden="true"'}>
                <img src="${base}${slide.src}?v=${ASSET_VERSION}" alt="${esc(slide.alt || shot.caption || "")}" width="${slideWidth}" height="${slideHeight}" loading="lazy" decoding="async" />
              </div>`;
    })
    .join("\n");

  const dots = slides
    .map((slide, index) => {
      const label = slide.label || `Screenshot ${index + 1}`;
      const active = index === 0;
      return `              <button type="button" class="shot-rotate__dot" data-shot-rotate-dot="${index}" role="tab" aria-label="${esc(label)}" aria-selected="${active ? "true" : "false"}"${active ? ' aria-current="true"' : ""}></button>`;
    })
    .join("\n");

  return `        <figure class="${classes}">
          <div class="${frameClass}"${frameStyle}>
            <div class="${rotateClass}" data-shot-rotate data-shot-rotate-interval="${interval}"${rotateStyle}>
              <div class="shot-rotate__stage" data-shot-rotate-stage>
${slideMarkup}
              </div>
              <div class="shot-rotate__controls">
                <button type="button" class="shot-rotate__btn" data-shot-rotate-prev aria-label="Previous screenshot">
                  <span aria-hidden="true">←</span>
                </button>
                <div class="shot-rotate__dots" data-shot-rotate-dots role="tablist" aria-label="Screenshots">
${dots}
                </div>
                <button type="button" class="shot-rotate__btn" data-shot-rotate-next aria-label="Next screenshot">
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            </div>
          </div>
${shot.caption ? `          <figcaption class="shot__caption">${esc(shot.caption)}</figcaption>\n` : ""}        </figure>`;
}

function renderShot(shot, base, options = {}) {
  if (shot.rotate?.slides?.length > 1) {
    return renderRotatingShot(shot, base, options);
  }

  const size = manifest[shot.src];
  if (!size) throw new Error(`Missing screenshot in manifest: ${shot.src}`);

  // Display at half the native width so the image is always 2x on Retina,
  // unless the shot sets scale (e.g. 1 for already-compressed captures).
  const scale = typeof shot.scale === "number" ? shot.scale : 0.5;
  const width = Math.max(1, Math.round(size.width * scale));
  const height = Math.max(1, Math.round(size.height * scale));
  const fill = Boolean(shot.full || options.fill);
  const classes = [
    "shot",
    shot.full ? "shot--full" : null,
    shot.bordered ? "shot--bordered" : null,
    shot.circle ? "shot--circle" : null,
    options.showcase ? "shot--showcase" : null,
    "reveal",
  ]
    .filter(Boolean)
    .join(" ");
  const style = fill && !shot.circle ? "" : shot.circle ? "" : ` style="max-width: ${width}px"`;
  const fullWidth = Boolean(shot.full) && scale === 1 && !shot.circle;
  const frameClass = fullWidth ? "shot__frame shot__frame--fullwidth" : "shot__frame";
  const frameStyleValue = fullWidth
    ? `--shot-display-width: ${size.width}px`
    : fill && !shot.circle
      ? `--shot-native-width: ${width}px`
      : "";
  const frameStyle = frameStyleValue ? ` style="${frameStyleValue}"` : "";
  const noExpand = shot.noExpand ? ' data-no-expand=""' : "";

  const copy =
    options.showcase && (shot.title || shot.lede)
      ? `          <div class="shot__copy">
${shot.step ? `            <p class="shot__step">${esc(shot.step)}</p>\n` : ""}${
          shot.title ? `            <h3 class="shot__title">${esc(shot.title)}</h3>\n` : ""
        }${shot.lede ? `            <p class="shot__lede">${esc(shot.lede)}</p>\n` : ""}          </div>\n`
      : "";

  const imgWidth = scale === 1 ? size.width : width;
  const imgHeight = scale === 1 ? size.height : height;
  const loading = shot.eager ? "eager" : "lazy";
  const decoding = shot.eager ? "sync" : "async";
  const srcset = shot.src2x
    ? ` srcset="${base}${shot.src}?v=${ASSET_VERSION} 1x, ${base}${shot.src2x}?v=${ASSET_VERSION} 2x"`
    : "";

  return `        <figure class="${classes}"${style}>
${copy}          <div class="${frameClass}"${frameStyle}${noExpand}>
            <img src="${base}${shot.src}?v=${ASSET_VERSION}"${srcset} alt="${esc(shot.alt || shot.caption || shot.title || "")}" width="${imgWidth}" height="${imgHeight}" loading="${loading}" decoding="${decoding}" />
          </div>
${shot.caption && !shot.hideCaption ? `          <figcaption class="shot__caption">${esc(shot.caption)}</figcaption>\n` : ""}        </figure>`;
}

function renderHeroVideo(video, base) {
  const label = video.label || "Scanning employee record";
  const caption = video.caption || "";
  const ariaLabel = video.ariaLabel || label;
  const maxLoops = video.maxLoops || 3;
  const width = video.width || 684;
  const height = video.height || 668;

  return `        <figure class="shot shot--full reveal">
          <div class="verify-scan" data-verify-scan>
            <div class="verify-scan__chrome" aria-hidden="true">
              <span class="verify-scan__dot"></span>
              <span class="verify-scan__label">${esc(label)}</span>
            </div>
            <div class="verify-scan__screen">
              <video class="verify-scan__video" data-verify-scan-video data-max-loops="${maxLoops}" muted playsinline preload="metadata" width="${width}" height="${height}" aria-label="${esc(ariaLabel)}">
                <source src="${base}${video.src}?v=${ASSET_VERSION}" type="video/mp4" />
              </video>
            </div>
          </div>
${caption ? `          <figcaption class="shot__caption">${esc(caption)}</figcaption>\n` : ""}        </figure>`;
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

function parseBulletTile(item) {
  const match = String(item).match(/^\*\*(.+?)\*\*\s*(.*)$/);
  if (match) return { title: match[1], detail: match[2] };
  return { title: String(item), detail: "" };
}

const SPEC_TILE_ACCENTS = ["#38bdf8", "#f59e0b", "#34d399", "#a78bfa"];

function renderSpecTiles(section) {
  const items = section.tiles || (section.bullets || []).map(parseBulletTile);
  if (!items.length) return "";

  return `          <div class="spec-tiles" role="list">\n${items
    .map((tile, index) => {
      const accent = tile.accent || SPEC_TILE_ACCENTS[index % SPEC_TILE_ACCENTS.length];
      const step = tile.step || String(index + 1).padStart(2, "0");
      return `            <article class="spec-tile" style="--spec-tile-accent: ${esc(accent)}" role="listitem">
              <span class="spec-tile__index" aria-hidden="true">${esc(step)}</span>
              <h3 class="spec-tile__title">${esc(tile.title || "")}</h3>
              <p class="spec-tile__detail">${rich(tile.detail || "")}</p>
            </article>`;
    })
    .join("\n")}\n          </div>`;
}

function renderReportRoll(section, base) {
  const roll = section.reportRoll;
  const steps = roll?.steps || [];
  if (!steps.length) return "";

  const interval = roll.interval || 5000;
  const first = steps[0];
  const maxDisplayWidth = Math.max(
    ...steps.map((step) => {
      const size = manifest[step.src];
      if (!size) throw new Error(`Missing screenshot in manifest: ${step.src}`);
      const scale = typeof step.scale === "number" ? step.scale : 0.5;
      return Math.max(1, Math.round(size.width * scale));
    })
  );
  const panels = steps
    .map((step, index) => {
      const size = manifest[step.src];
      if (!size) throw new Error(`Missing screenshot in manifest: ${step.src}`);
      const scale = typeof step.scale === "number" ? step.scale : 0.5;
      const width = Math.max(1, Math.round(size.width * scale));
      const height = Math.max(1, Math.round(size.height * scale));
      const accent = step.accent || SPEC_TILE_ACCENTS[index % SPEC_TILE_ACCENTS.length];
      return `              <div class="report-roll__panel" data-report-roll-panel="${index}" data-report-roll-step="${esc(step.step || String(index + 1).padStart(2, "0"))}" data-report-roll-title="${esc(step.title || "")}" data-report-roll-text="${esc(step.text || "")}" style="--report-roll-accent: ${esc(accent)}"${index === 0 ? ' aria-hidden="false"' : ' aria-hidden="true"'}>
                <div class="shot__frame report-roll__slide-frame">
                  <img src="${base}${step.src}?v=${ASSET_VERSION}" alt="${esc(step.alt || step.title || "")}" width="${width}" height="${height}" loading="lazy" decoding="async" />
                </div>
              </div>`;
    })
    .join("\n");

  const dots = steps
    .map((step, index) => {
      const label = step.label || step.title || `Step ${index + 1}`;
      const active = index === 0;
      return `              <button type="button" class="report-roll__dot" data-report-roll-dot="${index}" role="tab" aria-label="${esc(label)}" aria-selected="${active ? "true" : "false"}"${active ? ' aria-current="true"' : ""}></button>`;
    })
    .join("\n");

  const note = roll.note
    ? `            <p class="report-roll__note">${esc(roll.note)}</p>`
    : "";

  return `      <div class="report-roll reveal" data-report-roll data-report-roll-interval="${interval}" style="--report-roll-max-width: ${maxDisplayWidth}px">
        <div class="report-roll__layout">
          <div class="report-roll__copy">
            <p class="report-roll__step" data-report-roll-step>${esc(first.step || "01")}</p>
            <h3 class="report-roll__title" data-report-roll-title>${esc(first.title || "")}</h3>
            <p class="report-roll__text" data-report-roll-text>${esc(first.text || "")}</p>
          </div>
          <div class="report-roll__visual">
            <div class="report-roll__frame-wrap">
              <p class="report-roll__pause" data-report-roll-pause hidden>Paused</p>
              <div class="report-roll__stage" data-report-roll-stage>
${panels}
              </div>
            </div>
${note}
          </div>
        </div>
        <div class="report-roll__controls">
          <button type="button" class="report-roll__btn" data-report-roll-prev aria-label="Previous report step">
            <span aria-hidden="true">↑</span>
          </button>
          <div class="report-roll__dots" data-report-roll-dots role="tablist" aria-label="Report steps">
${dots}
          </div>
          <button type="button" class="report-roll__btn" data-report-roll-next aria-label="Next report step">
            <span aria-hidden="true">↓</span>
          </button>
        </div>
      </div>`;
}

function renderAsideSection(section, base, { body, bullets }) {
  const shotsHtml = section.shots?.length
    ? section.mod === "tunnel-cab"
      ? section.shots
          .map((shot) => {
            const figure = renderShot({ ...shot, hideCaption: true }, base);
            return `          <div class="page-section__aside-visual">
${figure}          </div>`;
          })
          .join("\n")
      : section.shots.map((shot) => renderShot(shot, base)).join("\n")
    : "";
  const noteHtml = section.asideNote
    ? `          <div class="page-section__aside-note">
            <h3 class="page-section__aside-note-title">${esc(section.asideNote.heading)}</h3>
            <p>${esc(section.asideNote.body)}</p>
          </div>`
    : "";
  const media = shotsHtml || noteHtml
    ? `          <div class="page-section__aside-media">
${shotsHtml}
${noteHtml}
          </div>`
    : "";

  const asideReverse = Boolean(section.asideReverse);
  const copyBlock = `          <div class="page-section__aside-copy">
          <h2>${esc(section.heading)}</h2>
${body}
${bullets}
          </div>`;
  const asideInner = asideReverse ? `${media}
${copyBlock}` : `${copyBlock}
${media}`;

  return `    <section class="page-section page-section--aside${section.crispShots ? " page-section--crisp" : ""}${section.mod ? ` page-section--${section.mod}` : ""}">
      <div class="container">
        <div class="page-section__aside${asideReverse ? " page-section__aside--reverse" : ""}">
${asideInner}
        </div>
      </div>
    </section>`;
}

function renderSection(section, base) {
  const body = (section.body || []).map((text) => `          <p>${rich(text)}</p>`).join("\n");

  const bullets = section.bulletTiles
    ? renderSpecTiles(section)
    : section.bullets
      ? `          <ul class="spec-list">\n${section.bullets
          .map((item) => `            <li>${rich(item)}</li>`)
          .join("\n")}\n          </ul>`
      : "";

  if (section.layout === "aside") {
    return renderAsideSection(section, base, { body, bullets });
  }

  const gallery = section.shotGrid === "gallery";
  const viewer = section.shotGrid === "viewer";
  const spotlight = section.shotGrid === "spotlight";
  const showcase = section.shotGrid === "showcase";
  const heroStack = section.shotGrid === "hero-stack";
  const wide = Boolean(section.fullWidth);
  const gridClass = wide
    ? "shot-grid shot-grid--full"
    : showcase
      ? "shot-grid shot-grid--showcase"
      : heroStack
        ? "shot-grid shot-grid--hero-stack"
        : section.shotGrid === "split-70-30"
          ? "shot-grid shot-grid--split-70-30"
          : "shot-grid shot-grid--two";

  const renderShotList = (shotList, listHeroStack = heroStack) =>
    shotList
      .map((shot, index) =>
        renderShot(
          {
            ...shot,
            step: shot.step || (showcase ? String(index + 1).padStart(2, "0") : undefined),
            full: showcase ? true : shot.full,
            scale: showcase ? shot.scale ?? 1 : shot.scale,
          },
          base,
          { showcase, fill: showcase || listHeroStack || shot.full }
        )
      )
      .join("\n");

  let shots = "";
  if (section.shots) {
    if (viewer) {
      shots = renderViewerGallery(section, base);
    } else if (spotlight) {
      shots = renderSpotlightGallery(section, base);
    } else if (gallery) {
      shots = renderGallery(section, base);
    } else if (section.shotBreak) {
      const breakAfter = section.shotBreak.after ?? 1;
      const headShots = section.shots.slice(0, breakAfter);
      const tailShots = section.shots.slice(breakAfter);
      const breakBlock = `      <div class="page-section__shot-break page-section__head page-section__head--wide">
          <h3 class="page-section__subheading">${esc(section.shotBreak.heading)}</h3>
${(section.shotBreak.body || []).map((text) => `          <p>${rich(text)}</p>`).join("\n")}
        </div>`;
      shots = `      <div class="shot-grid shot-grid--full">
${renderShotList(headShots, false)}
      </div>
${breakBlock}
      <div class="shot-grid ${section.shotBreak.layout === "stack" ? "shot-grid--full shot-grid--stacked" : "shot-grid--hero-stack"}">
${renderShotList(tailShots, false)}
      </div>`;
    } else {
      shots = `      <div class="${gridClass}">
${renderShotList(section.shots)}
      </div>`;
    }
  }

  const reportRoll = section.reportRoll ? renderReportRoll(section, base) : "";

  const headShotHtml = section.headShot
    ? renderShot(
        { ...section.headShot, scale: section.headShot.scale ?? 1 },
        base,
        { fill: true }
      )
    : "";
  const headBlock = section.headShot
    ? `        <div class="page-section__head page-section__head--with-shot">
          <h2>${esc(section.heading)}</h2>
${body}
${bullets}
          <div class="page-section__head-media">
${headShotHtml}
          </div>
        </div>`
    : `        <div class="page-section__head${wide ? " page-section__head--wide" : ""}">
          <h2>${esc(section.heading)}</h2>
${body}
${bullets}
        </div>`;

  if (section.tileSplit) {
    const tileSplitShots = section.shots ? renderShotList(section.shots) : "";
    return `    <section class="page-section${section.mod ? ` page-section--${section.mod}` : ""}">
      <div class="container">
        <div class="page-section__head">
          <h2>${esc(section.heading)}</h2>
${body}
        </div>
        <div class="page-section__tile-split">
          <div class="page-section__tile-split-copy">
${bullets}
          </div>
          <div class="page-section__tile-split-media">
${tileSplitShots}
          </div>
        </div>
      </div>
    </section>`;
  }

  return `    <section class="page-section${wide ? " page-section--wide" : ""}${section.crispShots ? " page-section--crisp" : ""}${section.mod ? ` page-section--${section.mod}` : ""}${section.reportRoll ? " page-section--report-roll" : ""}${gallery ? " page-section--gallery" : viewer ? " page-section--viewer" : spotlight ? " page-section--spotlight" : showcase ? " page-section--showcase" : ""}">
      <div class="container${gallery || viewer || spotlight || showcase ? " container--showcase" : ""}">
${headBlock}
${shots}
${reportRoll}
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
  const item = mergedItem(product, product.slug);
  const pageSeo = seoForItem(item, {
    path: product.href,
    titleFallback: `${product.name} – Rail Intel`,
    descriptionFallback: product.summary,
    breadcrumbParent: { name: "Products", path: "products/index.html" },
  });

  return (
    renderHead(base, pageSeo) +
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
${renderFaqSection(pageSeo.faq, base)}
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
              <span class="trainee-journey__rail-timer" aria-hidden="true"><span class="trainee-journey__rail-timer-fill" data-trainee-rail-timer-fill></span></span>
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

function renderTraineeProgressPill() {
  return `              <div class="trainee-progress-pill" data-trainee-progress-pill role="img" aria-label="Progression from Trainee to Qualified">
                <div class="trainee-progress-pill__shell">
                  <span class="trainee-progress-pill__label trainee-progress-pill__label--from">
                    <span class="trainee-progress-pill__dot" aria-hidden="true"></span>
                    Trainee
                  </span>
                  <span class="trainee-progress-pill__connector" aria-hidden="true">
                    <span class="trainee-progress-pill__track">
                      <span class="trainee-progress-pill__track-fill"></span>
                    </span>
                    <span class="trainee-progress-pill__arrow">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 8h8.5M9.5 5.5 12 8l-2.5 2.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                    </span>
                  </span>
                  <span class="trainee-progress-pill__label trainee-progress-pill__label--to">
                    <span class="trainee-progress-pill__dot trainee-progress-pill__dot--gold" aria-hidden="true"></span>
                    Qualified
                  </span>
                </div>
                <p class="trainee-progress-pill__outcome" aria-hidden="true">
                  <span class="trainee-progress-pill__outcome-mark" aria-hidden="true">✓</span>
                  Programme complete — ready for qualification sign-off
                </p>
              </div>`;
}

function traineeDriverPage(addon) {
  const base = "../";
  const note = addon.note
    ? `              <p class="page-lead" style="font-size:1rem"><strong>Note.</strong> ${esc(addon.note)}</p>\n`
    : "";

  const heroCopy = `          <p class="breadcrumb"><a href="${base}">Rail Intel</a> / <a href="${base}products/">Add-ons</a> / ${esc(
    addon.name
  )}</p>
          <span class="page-badge page-badge--addon">Add-on module</span>
          <div class="page-hero__trainee-grid">
            <div class="page-hero__trainee-title">
              <h1 class="page-title">Run the full trainee programme, from <span class="hero-title__accent">policies</span> to <span class="hero-title__accent">portfolio</span>.</h1>
${renderTraineeProgressPill()}
            </div>
            <div class="page-hero__trainee-body">
              <p class="page-lead">${esc(addon.lead)}</p>
${note}            </div>
            <div class="trainee-hero-fireworks" data-trainee-hero-fireworks aria-hidden="true"></div>
          </div>`;

  const heroInner = `        <div class="page-hero__inner page-hero__inner--trainee-split">
${heroCopy}
        </div>`;

  const item = mergedItem(addon, addon.slug);
  const pageSeo = seoForItem(item, {
    path: `products/${addon.slug}.html`,
    titleFallback: `${addon.name} – Rail Intel add-on module`,
    descriptionFallback: addon.summary,
    breadcrumbParent: { name: "Products", path: "products/index.html" },
  });

  return (
    renderHead(base, pageSeo) +
    `
  <main>
    <section class="page-hero page-hero--trainee page-hero--full-lead">
      <div class="container">
${heroInner}
      </div>
    </section>

${renderTraineeFlow(addon, base)}

${renderQaSection(addon.qaSection, base)}

${renderFaqSection(pageSeo.faq, base)}
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

  const heroInlineShotRender = addon.heroInlineShot
    ? renderShot({ ...addon.heroInlineShot, scale: addon.heroInlineShot.scale ?? 1 }, base, { fill: true })
    : "";

  const heroMeta = `          <p class="breadcrumb"><a href="${base}">Rail Intel</a> / <a href="${base}products/">Add-ons</a> / ${esc(
    addon.name
  )}</p>
          <span class="page-badge page-badge--addon">Add-on module</span>`;

  const heroTail = `${addon.heroExtra ? `          <p class="page-lead">${esc(addon.heroExtra)}</p>\n` : ""}${note}${
    addon.hideHeroActions
      ? ""
      : `          <div class="page-actions">
            <a href="${site.app}" class="btn btn-primary btn-lg">Open Rail Intel</a>
            <a href="${base}products/" class="btn btn-ghost btn-lg">All add-ons</a>
          </div>`
  }`;

  const heroCopy = `${heroMeta}
          <h1 class="page-title">${esc(addon.tagline)}</h1>
          <p class="page-lead">${esc(addon.lead)}</p>
${heroTail}`;

  const heroMedia = addon.heroVideo
    ? renderHeroVideo(addon.heroVideo, base)
    : addon.heroShot
      ? renderShot(addon.heroShot, base, { fill: true })
      : null;

  const heroSplitModifier = addon.heroShot?.circle ? " page-hero__inner--icon" : "";

  const heroInner = heroMedia
    ? addon.heroInlineShot && !addon.heroShotStacked
      ? `        <div class="page-hero__inner page-hero__inner--inline-trio${heroSplitModifier}">
${heroMeta}
          <div class="page-hero__trio">
            <div class="page-hero__trio-title-block">
            <h1 class="page-title">${esc(addon.tagline)}</h1>
${addon.heroDek ? `            <p class="page-hero__trio-dek">${esc(addon.heroDek)}</p>\n` : ""}            </div>
            <div class="page-hero__inline-shot">
${heroInlineShotRender}            </div>
            <div class="page-hero__trio-copy">
            <p class="page-lead">${esc(addon.lead)}</p>
${addon.heroExtra ? `            <p class="page-lead">${esc(addon.heroExtra)}</p>\n` : ""}            </div>
            <div class="page-hero__media page-hero__trio-media">
${heroMedia}
            </div>
          </div>
        </div>`
    : addon.heroShotStacked
      ? `        <div class="page-hero__inner page-hero__inner--stacked${heroSplitModifier}">
${heroCopy}
          <div class="page-hero__media">
${heroMedia}
          </div>
        </div>`
      : `        <div class="page-hero__inner page-hero__inner--split${heroSplitModifier}">
          <div class="page-hero__copy">
${heroCopy}
          </div>
          <div class="page-hero__media">
${heroMedia}
          </div>
        </div>`
    : `        <div class="page-hero__inner">
${heroCopy}
        </div>`;

  const item = mergedItem(addon, addon.slug);
  const pageSeo = seoForItem(item, {
    path: `products/${addon.slug}.html`,
    titleFallback: `${addon.name} – Rail Intel add-on module`,
    descriptionFallback: addon.summary,
    breadcrumbParent: { name: "Products", path: "products/index.html" },
  });

  return (
    renderHead(base, pageSeo) +
    `
  <main>
    <section class="page-hero${addon.heroLeadFullWidth ? " page-hero--full-lead" : ""}${addon.heroTitleNoWrap ? " page-hero--nowrap-title" : ""}${addon.heroMod ? ` page-hero--${addon.heroMod}` : ""}">
      <div class="container">
${heroInner}
      </div>
    </section>

${(addon.sections || []).map((section) => renderSection(section, base)).join("\n\n")}
${renderFaqSection(pageSeo.faq, base)}
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

  const pageSeo = staticPageSeo("products/index.html");

  return (
    renderHead(base, pageSeo) +
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
${renderFaqSection(pageSeo.faq, base)}
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

  const pageSeo = featureSeo(group);

  return (
    renderHead(base, pageSeo) +
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
${renderRelatedLinks(base, mergedItem(group, group.slug).relatedLinks)}
${renderFaqSection(pageSeo.faq, base)}
  </main>

` +
    renderFooter(base)
  );
}

function renderHeroRegulators(regulators, base) {
  if (!regulators?.length) return "";

  const items = regulators
    .map((logo) => {
      const modifier = logo.class ? ` page-hero__regulator-logo--${esc(logo.class)}` : "";
      const width = logo.width ? ` width="${logo.width}"` : "";
      const height = logo.height ? ` height="${logo.height}"` : "";
      return `            <img class="page-hero__regulator-logo${modifier}" src="${base}${esc(logo.src)}" alt="${esc(logo.alt)}"${width}${height} loading="lazy" decoding="async" />`;
    })
    .join("\n");

  return `          <div class="page-hero__regulators" aria-label="UK rail regulators">
${items}
          </div>`;
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

  const heroRegulators = renderHeroRegulators(group.heroRegulators, base);
  const heroAside = group.heroShot
    ? renderShot(group.heroShot, base, { fill: true })
    : heroRegulators;

  const tunnelHero = group.slug === "tunnel-mode";
  const heroInner = heroAside
    ? `        <div class="page-hero__inner page-hero__inner--split${tunnelHero ? " page-hero__inner--tunnel" : ""}${group.heroIntro ? " page-hero__inner--with-intro" : ""}${group.heroRegulators ? " page-hero__inner--regulators" : ""}">
          <div class="page-hero__copy">
${heroCopy}
          </div>
          <div class="page-hero__media">
${group.heroShot ? renderShot(group.heroShot, base, { fill: true }) : ""}${heroRegulators}
          </div>
        </div>`
    : `        <div class="page-hero__inner">
${heroCopy}
        </div>`;

  const pageSeo = featureSeo(group);

  return (
    renderHead(base, pageSeo) +
    `
  <main>
    <section class="page-hero${group.heroIntro ? " page-hero--intro-split" : ""}${tunnelHero ? " page-hero--tunnel" : ""}">
      <div class="container">
${heroInner}
      </div>
    </section>
${demo}
${group.sections.map((section) => renderSection(section, base)).join("\n\n")}

${
  group.hideCta
    ? ""
    : renderCta(base, {
        ...(group.cta || {
          heading: "Everything here is included",
          body: "These capabilities are part of core Rail Intel, gated only by the permissions you assign. Optional modules extend them further.",
        }),
        showAppCta: group.showAppCta,
      })
}
${renderRelatedLinks(base, mergedItem(group, group.slug).relatedLinks)}
${renderFaqSection(pageSeo.faq, base)}
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

  const pageSeo = featureSeo(group);

  return (
    renderHead(base, pageSeo) +
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
${renderRelatedLinks(base, mergedItem(group, group.slug).relatedLinks)}
${renderFaqSection(pageSeo.faq, base)}
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

  const pageSeo = staticPageSeo("features/index.html");

  return (
    renderHead(base, pageSeo) +
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
${renderFaqSection(pageSeo.faq, base)}
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

  const pageSeo = staticPageSeo("how-it-works.html");

  return (
    renderHead(base, pageSeo) +
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

function renderGetStartedPoBanner() {
  const banner = getStarted.poBanner;
  return `              <div class="signup-po-banner" role="note" aria-label="${esc(banner.label)}">
                <span class="signup-po-banner__icon" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M9 12h6M9 16h4" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
                  </svg>
                </span>
                <div class="signup-po-banner__content">
                  <p class="signup-po-banner__label">${esc(banner.label)}</p>
                  <p class="signup-po-banner__text">${esc(banner.text)}</p>
                </div>
              </div>`;
}

function renderGetStartedWelcome() {
  const steps = getStarted.welcome.steps
    .map(
      (step, index) => `            <article class="signup-onboard-flow__tile${index === 0 ? " is-active" : ""}" data-onboard-tile role="listitem" tabindex="0" aria-label="Step ${index + 1}: ${esc(step.title)}">
              <div class="signup-onboard-flow__surface" data-onboard-tilt>
                <span class="signup-onboard-flow__num" aria-hidden="true">${index + 1}</span>
                <h3 class="signup-onboard-flow__title">${esc(step.title)}</h3>
                <p class="signup-onboard-flow__text">${esc(step.body)}</p>
              </div>
            </article>`,
    )
    .join("\n");
  return `        <section class="signup-onboard-welcome" aria-label="Onboarding overview">
          <h2 class="signup-onboard-welcome__title">${esc(getStarted.welcome.title)}</h2>
          <p class="signup-onboard-welcome__lead">${esc(getStarted.welcome.lead)}</p>
          <div class="signup-onboard-flow" data-onboard-flow role="list">
${steps}
          </div>
        </section>`;
}

function getStartedPage() {
  const base = "";
  const pageSeo = staticPageSeo("get-started.html");

  return (
    renderHead(base, pageSeo) +
    `
  <main>
    <section class="page-hero page-hero--compact page-hero--get-started">
      <div class="container">
        <div class="page-hero__inner">
          <div class="page-hero__copy">
            <p class="breadcrumb"><a href="${base}/">Rail Intel</a> / Get started</p>
            <h1 class="page-title">${esc(getStarted.heroTitle)}</h1>
          </div>
        </div>
      </div>
    </section>

    <section class="page-section page-section--tight signup-page">
      <div class="container signup-shell">
${renderGetStartedWelcome()}
        <aside class="signup-wizard-glass signup-procurement-notice" aria-label="Procurement information">
          <div class="signup-panel__head">
            <h2 class="signup-form__title">${esc(getStarted.procurementNotice.heading)}</h2>
            <p class="signup-form__lead">${esc(getStarted.procurementNotice.lead)}</p>
          </div>
          ${getStarted.procurementNotice.body.map((p) => `<p class="signup-procurement-notice__text">${esc(p)}</p>`).join("\n          ")}
          <ul class="signup-procurement-notice__list">
${getStarted.procurementNotice.items.map((item) => `            <li>${esc(item)}</li>`).join("\n")}
          </ul>
        </aside>
        <div class="signup-wizard-glass" data-cms-signup-wizard>
          <div class="signup-wizard__header">
            <p class="signup-wizard__eyebrow">Request quotation <span class="signup-wizard__eyebrow-lower">or</span> pay an invoice</p>
          </div>
          <div class="signup-progress" aria-hidden="true">
            <div class="signup-progress__track"><div class="signup-progress__fill" data-signup-progress style="width:20%"></div></div>
          </div>
          <ol class="signup-wizard__steps signup-wizard__steps--6" data-signup-stepper-quote aria-label="Application progress">
            <li class="signup-wizard__step is-active" data-signup-step-indicator="1"><span class="signup-wizard__step-num">1</span> Get started</li>
            <li class="signup-wizard__step" data-signup-step-indicator="2"><span class="signup-wizard__step-num">2</span> Company</li>
            <li class="signup-wizard__step" data-signup-step-indicator="3"><span class="signup-wizard__step-num">3</span> Current setup</li>
            <li class="signup-wizard__step" data-signup-step-indicator="4"><span class="signup-wizard__step-num">4</span> Contact</li>
            <li class="signup-wizard__step" data-signup-step-indicator="5"><span class="signup-wizard__step-num">5</span> <span data-signup-step-five-label>Quote</span></li>
            <li class="signup-wizard__step" data-signup-step-indicator="6"><span class="signup-wizard__step-num">6</span> Done</li>
          </ol>
          <ol class="signup-wizard__steps signup-wizard__steps--3" data-signup-stepper-invoice aria-label="Invoice payment progress" hidden>
            <li class="signup-wizard__step is-active" data-signup-step-indicator="1"><span class="signup-wizard__step-num">1</span> Get started</li>
            <li class="signup-wizard__step" data-signup-step-indicator="2"><span class="signup-wizard__step-num">2</span> Payment</li>
            <li class="signup-wizard__step" data-signup-step-indicator="3"><span class="signup-wizard__step-num">3</span> Done</li>
          </ol>

          <form data-cms-signup-form novalidate>
            <div class="signup-wizard__body is-active" data-signup-panel="intent">
              <div class="signup-panel__head">
                <h2 class="signup-form__title">How would you like to get started?</h2>
                <p class="signup-form__lead">Request a quotation or pay an outstanding invoice by card.</p>
              </div>
${renderGetStartedPoBanner()}
              <div class="signup-path-tiles">
                <button type="button" class="signup-glass-tile signup-path-tile" data-signup-intent="quote">
                  <span class="signup-glass-tile__surface">
                    <span class="signup-glass-tile__content">
                      <strong>Request a quote</strong>
                      <span>Tell us your contract term, users, and modules. We will send a formal quotation.</span>
                    </span>
                  </span>
                </button>
                <button type="button" class="signup-glass-tile signup-path-tile signup-path-tile--invoice" data-signup-intent="invoice">
                  <span class="signup-glass-tile__surface">
                    <span class="signup-path-tile__stripe-pill" aria-hidden="true">
                      <img
                        class="signup-path-tile__stripe-pill-img"
                        src="images/stripe-powered-pill.png"
                        width="300"
                        height="81"
                        alt=""
                        decoding="async"
                      />
                    </span>
                    <span class="signup-glass-tile__content">
                      <strong>Pay an invoice</strong>
                      <span>Find your invoice and pay securely by credit or debit card via Stripe.</span>
                    </span>
                  </span>
                </button>
              </div>
              <p class="signup-form__message" data-signup-msg="intent" hidden></p>
            </div>

            <div class="signup-wizard__body" data-signup-panel="company" hidden>
              <div class="signup-panel__head">
                <h2 class="signup-form__title">Your company</h2>
                <p class="signup-form__lead">Registered company details for your CMS tenant.</p>
              </div>
              <div class="signup-form__grid">
                <div class="field field--full">
                  <label for="companyName">Company name *</label>
                  <input id="companyName" name="companyName" required autocomplete="organization" />
                </div>
                <div class="field field--full">
                  <label for="companyAddress">Registered address *</label>
                  <textarea id="companyAddress" name="companyAddress" rows="5" required></textarea>
                </div>
              </div>
              <p class="signup-form__message" data-signup-msg="company" hidden></p>
              <div class="signup-wizard__actions">
                <button type="button" class="btn btn-ghost" data-signup-goto="intent">Back</button>
                <button type="button" class="btn btn-primary" data-signup-goto="current-setup">Next</button>
              </div>
            </div>

            <div class="signup-wizard__body" data-signup-panel="current-setup" hidden>
              <div class="signup-panel__head">
                <h2 class="signup-form__title">Your current setup</h2>
                <p class="signup-form__lead">Understanding who currently supplies your competence management and when that contract ends helps us plan a smooth transition onto Rail Intel — including timelines, data migration and any parallel running you may need.</p>
              </div>
              <div class="signup-form__grid">
                <div class="field">
                  <label for="currentSupplier">Current supplier</label>
                  <input id="currentSupplier" name="currentSupplier" autocomplete="organization" placeholder="e.g. incumbent CMS or spreadsheet process" />
                </div>
                <div class="field">
                  <label for="currentContractEndDate">Current contract end date <span class="field-optional">(optional)</span></label>
                  <div class="signup-date-field">
                    <input id="currentContractEndDate" name="currentContractEndDate" type="date" autocomplete="off" />
                    <button type="button" class="signup-date-field__open" aria-label="Open calendar" data-signup-date-open="currentContractEndDate">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <rect x="3" y="4" width="18" height="18" rx="2"></rect>
                        <path d="M16 2v4M8 2v4M3 10h18"></path>
                      </svg>
                    </button>
                  </div>
                  <label class="signup-form__check">
                    <input id="noCurrentContract" name="noCurrentContract" type="checkbox" />
                    <span>No contract or expired contract</span>
                  </label>
                </div>
              </div>
              <p class="signup-form__message" data-signup-msg="current-setup" hidden></p>
              <div class="signup-wizard__actions">
                <button type="button" class="btn btn-ghost" data-signup-goto="company">Back</button>
                <button type="button" class="btn btn-primary" data-signup-goto="contact">Next</button>
              </div>
            </div>

            <div class="signup-wizard__body" data-signup-panel="contact" hidden>
              <div class="signup-panel__head">
                <h2 class="signup-form__title">Primary contact</h2>
                <p class="signup-form__lead">We will use this for updates and your welcome email.</p>
              </div>
              <div class="signup-form__grid">
                <div class="field">
                  <label for="contactName">Contact name *</label>
                  <input id="contactName" name="contactName" required autocomplete="name" />
                </div>
                <div class="field">
                  <label for="contactPhone">Contact phone *</label>
                  <div class="signup-phone-field">
                    <div class="signup-phone-field__code">
                      <span class="signup-phone-field__flag" data-phone-flag aria-hidden="true">🇬🇧</span>
                      <select id="contactPhoneCountry" name="contactPhoneCountry" aria-label="Country code"></select>
                    </div>
                    <input
                      id="contactPhone"
                      name="contactPhone"
                      type="tel"
                      required
                      autocomplete="tel-national"
                      inputmode="tel"
                      placeholder="Phone number"
                    />
                  </div>
                </div>
                <div class="field field--full">
                  <label for="contactEmail">Contact email *</label>
                  <input id="contactEmail" name="contactEmail" type="email" required autocomplete="email" />
                </div>
                <div class="field field--full signup-form__honeypot" aria-hidden="true">
                  <label for="website">Website</label>
                  <input id="website" name="website" tabindex="-1" autocomplete="off" />
                </div>
              </div>
              <p class="signup-form__message" data-signup-msg="contact" hidden></p>
              <div class="signup-wizard__actions">
                <button type="button" class="btn btn-ghost" data-signup-goto="current-setup">Back</button>
                <button type="button" class="btn btn-primary" data-signup-advance-from-contact>Next</button>
              </div>
            </div>
          </form>

          <div class="signup-wizard__body" data-signup-panel="quote-requirements" hidden>
            <div class="signup-panel__head">
              <h2 class="signup-form__title">Quotation requirements</h2>
              <p class="signup-form__lead">Minimum contract term is 12 months.</p>
            </div>
            <div class="signup-deal-banners" data-signup-deal-offers hidden></div>
            <div class="signup-form__grid signup-form__grid--glass" style="margin-bottom:1rem">
              <div class="field field--full">
                <label for="dealCode">Deal code (optional)</label>
                <input id="dealCode" name="dealCode" type="text" placeholder="e.g. EARLY2026" autocomplete="off" />
              </div>
            </div>
            <p class="signup-form__message" data-signup-deal-code-msg hidden></p>
            <div class="signup-form__grid signup-form__grid--glass">
              <div class="field">
                <label for="contractMonths">Contract duration (months) *</label>
                <input id="contractMonths" name="contractMonths" type="number" min="12" step="1" value="12" required />
              </div>
              <div class="field">
                <label for="platformUsers">Platform users *</label>
                <input id="platformUsers" name="platformUsers" type="number" min="1" step="1" value="10" required />
              </div>
              <div class="field field--full">
                <label for="adminLicences">Admin licences required *</label>
                <input id="adminLicences" name="adminLicences" type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" placeholder="Enter total admin licences required" required />
                <p class="signup-form__hint">2 administrator seats are included with the platform licence. Only additional seats are quoted.</p>
              </div>
            </div>
            <p class="signup-form__message" data-signup-msg="quote-requirements" hidden></p>
            <div class="signup-wizard__actions">
              <button type="button" class="btn btn-ghost" data-signup-goto="contact">Back</button>
              <button type="button" class="btn btn-primary" data-signup-goto="quote-modules">Next</button>
            </div>
          </div>

          <div class="signup-wizard__body" data-signup-panel="quote-modules" hidden>
            <div class="signup-panel__head">
              <h2 class="signup-form__title">Optional Addon Modules for your quote</h2>
              <p class="signup-form__lead">Select bolt-on modules to include in your quotation.</p>
            </div>
            <div data-signup-modules class="signup-module-grid"></div>
            <div class="field field--full" style="margin-top:1rem">
              <label for="notes">Notes for our team</label>
              <textarea id="notes" name="notes" rows="2" placeholder="Fleet size, depots, or procurement requirements"></textarea>
            </div>
            <p class="signup-form__message" data-signup-msg="quote-modules" hidden></p>
            <div class="signup-wizard__actions">
              <button type="button" class="btn btn-ghost" data-signup-goto="quote-requirements">Back</button>
              <button type="button" class="btn btn-primary" data-signup-submit-quote>Submit quotation request</button>
            </div>
          </div>

          <div class="signup-wizard__body signup-wizard__body--success" data-signup-panel="quote-complete" hidden>
            <div class="signup-success-badge" aria-hidden="true">&#10003;</div>
            <div class="signup-panel__head signup-panel__head--success">
              <h2 class="signup-form__title">Quotation request received</h2>
              <p class="signup-form__lead signup-form__lead--success" data-signup-success-message>
                A member of the team will generate your quote within 24 hours. If we need any further information, we will reach out by email.
              </p>
              <p class="signup-form__note" data-signup-success-note hidden></p>
            </div>
          </div>

          <div class="signup-wizard__body" data-signup-panel="invoice-pay" hidden>
            <div class="signup-panel__head">
              <h2 class="signup-form__title">Pay your invoice</h2>
              <p class="signup-form__lead">Enter the invoice number and the email address it was sent to. We will load your invoice so you can pay by card.</p>
            </div>
            <div class="signup-form__grid">
              <div class="field field--full">
                <label for="invoiceNumber">Invoice number *</label>
                <input id="invoiceNumber" name="invoiceNumber" placeholder="e.g. RI-2026-ABCDEF" autocomplete="off" />
              </div>
              <div class="field field--full">
                <label for="invoiceEmail">Invoice email *</label>
                <input id="invoiceEmail" name="invoiceEmail" type="email" autocomplete="email" placeholder="Email address on the invoice" />
              </div>
            </div>
            <div class="signup-wizard__actions">
              <button type="button" class="btn btn-ghost" data-signup-goto="intent">Back</button>
              <button type="button" class="btn btn-primary" data-signup-invoice-lookup>Find invoice</button>
            </div>
            <div class="signup-invoice-pay" data-signup-invoice-preview hidden>
              <div class="quotation-a4-wrap" data-signup-invoice-preview-html></div>
              <p class="signup-fee-notice" role="note">
                <strong>Card payments:</strong> Additional transactional fees may apply when paying by credit or debit card via Stripe.
              </p>
              <div class="signup-wizard__actions">
                <button type="button" class="btn btn-primary" data-signup-invoice-stripe-pay>Pay by card with Stripe</button>
              </div>
            </div>
            <p class="signup-form__message" data-signup-msg="invoice-pay" hidden></p>
          </div>

          <div class="signup-wizard__body signup-wizard__body--success" data-signup-panel="invoice-complete" hidden>
            <div class="signup-success-badge" aria-hidden="true">&#10003;</div>
            <div class="signup-panel__head signup-panel__head--success">
              <h2 class="signup-form__title">Payment received</h2>
              <p class="signup-form__lead signup-form__lead--success" data-signup-success-message-invoice>
                Thank you — your invoice payment has been received. A receipt will be emailed to you shortly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
` +
    renderFooter(base).replace(
      '<script src="' + base + 'js/site.js?v=' + ASSET_VERSION + '"></script>',
      '<script src="' + base + 'js/site.js?v=' + ASSET_VERSION + '"></script>\n  <script src="' + base + 'js/phone-country-codes.js?v=' + ASSET_VERSION + '"></script>\n  <script src="' + base + 'js/signup.js?v=' + ASSET_VERSION + '"></script>'
    )
  );
}

function quotationPage() {
  const base = "";
  return (
    renderHead(base, staticPageSeo("quotation.html")) +
    `
  <main>
    <section class="page-hero page-hero--compact">
      <div class="container">
        <div class="page-hero__inner">
          <div class="page-hero__copy">
            <p class="breadcrumb"><a href="${base}/">Rail Intel</a> / Quotation</p>
            <h1 class="page-title">Your quotation</h1>
          </div>
        </div>
      </div>
    </section>
    <section class="page-section page-section--tight">
      <div class="container" style="max-width:900px">
        <div class="signup-form panel" data-quotation-view>
          <p class="signup-form__lead">Loading quotation…</p>
        </div>
      </div>
    </section>
  </main>
` +
    renderFooter(base).replace(
      '<script src="' + base + 'js/site.js?v=' + ASSET_VERSION + '"></script>',
      '<script src="' + base + 'js/site.js?v=' + ASSET_VERSION + '"></script>\n  <script src="' + base + 'js/quotation.js?v=' + ASSET_VERSION + '"></script>'
    )
  );
}

function invoicePage() {
  const base = "";
  return (
    renderHead(base, staticPageSeo("invoice.html")) +
    `
  <main>
    <section class="page-hero page-hero--compact">
      <div class="container">
        <div class="page-hero__inner">
          <div class="page-hero__copy">
            <p class="breadcrumb"><a href="${base}/">Rail Intel</a> / Invoice</p>
            <h1 class="page-title">Your invoice</h1>
          </div>
        </div>
      </div>
    </section>
    <section class="page-section page-section--tight">
      <div class="container" style="max-width:900px">
        <div class="signup-form panel" data-invoice-view>
          <p class="signup-form__lead">Loading invoice…</p>
        </div>
      </div>
    </section>
  </main>
` +
    renderFooter(base).replace(
      '<script src="' + base + 'js/site.js?v=' + ASSET_VERSION + '"></script>',
      '<script src="' + base + 'js/site.js?v=' + ASSET_VERSION + '"></script>\n  <script src="' + base + 'js/invoice.js?v=' + ASSET_VERSION + '"></script>'
    )
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

  const pageSeo = staticPageSeo("security.html");

  return (
    renderHead(base, pageSeo) +
    `
  <main>
    <section class="page-hero${security.heroIntro ? " page-hero--intro-split" : ""}">
      <div class="container">
        <div class="page-hero__inner page-hero__inner--split${security.heroIntro ? " page-hero__inner--with-intro" : ""}">
          <div class="page-hero__copy">
            <p class="breadcrumb"><a href="${base}/">Rail Intel</a> / Security</p>
            <h1 class="page-title">${security.titleHtml || esc(security.title)}</h1>
            <p class="page-lead">${esc(security.lead)}</p>
${renderHeroIntro(security.heroIntro)}
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
        <ul class="spec-list spec-list--split">
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
        <ol class="steps steps--three">
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
          <a href="${base}get-started.html" class="btn btn-primary btn-lg">Get started</a>
          <a href="mailto:sales@railintel.co.uk" class="btn btn-secondary btn-lg">Contact sales</a>
        </div>
      </div>
    </section>
  </main>

` +
    renderFooter(base)
  );
}

function privacyPage() {
  const base = "";
  const sections = privacy.sections
    .map((section) => {
      const paragraphs = section.paragraphs
        .map((paragraph) => `          <p>${rich(paragraph)}</p>`)
        .join("\n");
      return `    <section class="page-section">
      <div class="container" style="max-width:900px">
        <div class="page-section__head">
          <h2>${esc(section.heading)}</h2>
        </div>
${paragraphs}
      </div>
    </section>`;
    })
    .join("\n\n");

  const pageSeo = staticPageSeo("privacy.html");

  return (
    renderHead(base, pageSeo) +
    `
  <main>
    <section class="page-hero">
      <div class="container">
        <div class="page-hero__inner">
          <p class="breadcrumb"><a href="${base}/">Rail Intel</a> / Privacy policy</p>
          <h1 class="page-title">${privacy.titleHtml || esc(privacy.title)}</h1>
          <p class="page-lead">${esc(privacy.lead)}</p>
          <p>Last updated: ${esc(privacy.lastUpdated)}</p>
        </div>
      </div>
    </section>

${sections}

    <section class="page-section">
      <div class="container">
        <div class="page-section__head">
          <h2>Related information</h2>
          <p>For technical and organisational security measures, see our Security page. To request a Data Processing Agreement, start an application or contact our team.</p>
        </div>
        <div class="page-actions">
          <a href="${base}security.html" class="btn btn-primary btn-lg">Security</a>
          <a href="${base}get-started.html" class="btn btn-secondary btn-lg">Get started</a>
        </div>
      </div>
    </section>
  </main>

` +
    renderFooter(base)
  );
}

function contactPage() {
  const base = "";
  const pageSeo = staticPageSeo("contact.html");
  const departmentOptions = contact.departments
    .map((dept) => `                  <option value="${esc(dept)}">${esc(dept)}</option>`)
    .join("\n");
  const highlights = contact.highlights
    .map(
      (item) => `            <article class="contact-highlight">
              <h3>${esc(item.title)}</h3>
              <p>${esc(item.body)}</p>
            </article>`
    )
    .join("\n");

  return (
    renderHead(base, pageSeo, { turnstileSiteKey: TURNSTILE_SITE_KEY }) +
    `
  <main class="contact-page">
    <section class="page-hero page-hero--contact">
      <div class="container">
        <div class="page-hero__inner page-hero__inner--split">
          <div class="page-hero__copy">
            <p class="breadcrumb"><a href="${base}/">Rail Intel</a> / Contact</p>
            <h1 class="page-title">${contact.titleHtml || esc(contact.title)}</h1>
            <p class="page-lead">${esc(contact.lead)}</p>
          </div>
          <div class="contact-hero-badge" aria-hidden="true">
            <span class="contact-hero-badge__ring"></span>
            <span class="contact-hero-badge__core">
              <span class="contact-hero-badge__label">Response target</span>
              <span class="contact-hero-badge__value">1 working day</span>
            </span>
          </div>
        </div>
      </div>
    </section>

    <section class="page-section contact-section">
      <div class="container contact-layout">
        <aside class="contact-aside" aria-label="Contact information">
          <div class="contact-aside__intro">
            <p class="contact-aside__eyebrow">Routed to the right team</p>
            <p class="contact-aside__note">${esc(contact.responseNote)}</p>
          </div>
          <div class="contact-highlights">
${highlights}
          </div>
          <div class="contact-aside__footer">
            <p>Ready to onboard Rail Intel CMS?</p>
            <a href="${base}get-started.html" class="btn btn-ghost">Start an application</a>
          </div>
        </aside>

        <div class="contact-form-shell" data-contact-form-wrap>
          <form class="contact-form panel" data-contact-form novalidate${TURNSTILE_SITE_KEY ? ' data-contact-requires-turnstile="true"' : ""}>
            <input type="hidden" name="formStartedAt" value="" data-form-started-at />
            <div class="contact-form__head">
              <h2>${esc(contact.form.title)}</h2>
              <p>${esc(contact.form.lead)}</p>
            </div>
            <div class="contact-form__grid">
              <div class="field">
                <label for="contactName">Your name *</label>
                <input id="contactName" name="name" autocomplete="name" required />
              </div>
              <div class="field">
                <label for="contactEmail">Email address *</label>
                <input id="contactEmail" name="email" type="email" autocomplete="email" required />
              </div>
              <div class="field">
                <label for="contactCompany">Company</label>
                <input id="contactCompany" name="company" autocomplete="organization" />
              </div>
              <div class="field">
                <label for="contactPhone">Phone</label>
                <input id="contactPhone" name="phone" type="tel" autocomplete="tel" />
              </div>
              <div class="field field--full">
                <label for="contactDepartment">Department *</label>
                <div class="contact-select">
                  <select id="contactDepartment" name="department" required>
                    <option value="" disabled selected>Select a department</option>
${departmentOptions}
                  </select>
                </div>
              </div>
              <div class="field field--full">
                <label for="contactMessage">Message *</label>
                <textarea id="contactMessage" name="message" rows="6" required placeholder="How can we help?"></textarea>
              </div>
            </div>
            <input type="text" name="website" class="sr-only" tabindex="-1" autocomplete="off" aria-hidden="true" />
${TURNSTILE_SITE_KEY ? `            <div class="contact-form__verify field field--full">
              <p class="contact-form__verify-label">${esc(contact.form.verifyLabel)}</p>
              <div class="contact-turnstile" data-turnstile></div>
              <p class="contact-form__verify-note">${esc(contact.form.verifyNote)}</p>
            </div>` : ""}
            <div class="contact-form__actions">
              <button type="submit" class="btn btn-primary btn-lg"${TURNSTILE_SITE_KEY ? " disabled" : ""}>${esc(contact.form.submitLabel)}</button>
            </div>
            <p class="contact-form__message" data-contact-message hidden></p>
          </form>

          <div class="contact-success panel" data-contact-success hidden>
            <div class="contact-success__badge" aria-hidden="true">&#10003;</div>
            <h2>${esc(contact.form.successTitle)}</h2>
            <p>${esc(contact.form.successLead)}</p>
            <a href="${base}/" class="btn btn-secondary">Back to home</a>
          </div>
        </div>
      </div>
    </section>
  </main>

` +
    renderFooter(base).replace(
      '<script src="' + base + 'js/site.js?v=' + ASSET_VERSION + '"></script>',
      '<script src="' + base + 'js/site.js?v=' + ASSET_VERSION + '"></script>\n  <script src="' + base + 'js/contact.js?v=' + ASSET_VERSION + '"></script>'
    )
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

/* --------------------------------------------------------------- guides */

function renderGuideBullets(bullets) {
  if (!bullets?.length) return "";
  return `        <ul class="spec-list">
${bullets.map((item) => `          <li>${rich(item)}</li>`).join("\n")}
        </ul>`;
}

function renderGuideBody(paragraphs) {
  return (paragraphs || []).map((text) => `        <p>${rich(text)}</p>`).join("\n");
}

function renderCompetitorCards() {
  const cards = competitors
    .map(
      (vendor) => `        <article class="card">
          <span class="card__kicker">${esc(vendor.vendor)}</span>
          <h3><a href="${esc(vendor.url)}" rel="noopener noreferrer">${esc(vendor.name)}</a></h3>
          <p>${esc(vendor.positioning)}</p>
          <ul class="spec-list">
${vendor.strengths.map((item) => `            <li>${esc(item)}</li>`).join("\n")}
          </ul>
          <p class="page-lead" style="font-size:0.95rem;margin-top:0.75rem"><strong>Typical buyer:</strong> ${esc(vendor.typicalBuyer)}</p>
        </article>`
    )
    .join("\n");

  return `        <div class="card-grid">
${cards}
        </div>`;
}

function renderComparisonTable() {
  const head = `          <tr>
            <th scope="col">Capability</th>
            <th scope="col">Rail Intel</th>
            <th scope="col">RailSmart EDS</th>
            <th scope="col">AssessTech ACMS</th>
            <th scope="col">RPD Assure</th>
            <th scope="col">3Squared</th>
          </tr>`;

  const rows = comparisonCriteria
    .map(
      (row) => `          <tr>
            <th scope="row">${esc(row.label)}</th>
            <td>${esc(row.railintel)}</td>
            <td>${esc(row.velociti)}</td>
            <td>${esc(row.assesstech)}</td>
            <td>${esc(row.rpd)}</td>
            <td>${esc(row.squared)}</td>
          </tr>`
    )
    .join("\n");

  return `        <div class="procurement-table-wrap">
          <table class="procurement-table">
            <thead>
${head}
            </thead>
            <tbody>
${rows}
            </tbody>
          </table>
        </div>`;
}

function renderGuideSections(guide) {
  return guide.sections
    .map((section) => {
      if (section.isComparison) {
        return `    <section class="page-section">
      <div class="container">
        <div class="page-section__head">
          <h2>${esc(section.heading)}</h2>
${renderGuideBody(section.body)}
        </div>
${renderComparisonTable()}
      </div>
    </section>`;
      }

      if (section.heading === "Platform summaries") {
        return `    <section class="page-section">
      <div class="container">
        <div class="page-section__head">
          <h2>${esc(section.heading)}</h2>
${renderGuideBody(section.body)}
        </div>
${renderCompetitorCards()}
      </div>
    </section>`;
      }

      return `    <section class="page-section">
      <div class="container">
        <div class="page-section__head">
          <h2>${esc(section.heading)}</h2>
${renderGuideBody(section.body)}
        </div>
${renderGuideBullets(section.bullets)}
      </div>
    </section>`;
    })
    .join("\n\n");
}

function guidePage(guide) {
  const base = "../";
  const pageSeo = guideSeo(guide);
  const disclaimer = guide.disclaimer
    ? `          <p class="page-lead" style="font-size:0.95rem">${esc(guide.disclaimer)}</p>`
    : "";
  const cta = guide.cta
    ? `          <a href="${base}${guide.cta.href}" class="btn btn-ghost btn-lg">${esc(guide.cta.label)}</a>`
    : "";

  return (
    renderHead(base, pageSeo) +
    `
  <main>
    <section class="page-hero">
      <div class="container">
        <div class="page-hero__inner">
          <p class="breadcrumb"><a href="${base}">Rail Intel</a> / ${esc(guide.shortTitle)}</p>
          <h1 class="page-title">${esc(guide.heroTitle)}</h1>
          <p class="page-lead">${esc(guide.heroLead)}</p>
${disclaimer}
          <div class="page-actions">
            <a href="${base}get-started.html" class="btn btn-primary btn-lg">Register your interest</a>
${cta}
          </div>
        </div>
      </div>
    </section>

${renderGuideSections(guide)}
${renderFaqSection(pageSeo.faq, base)}
  </main>

` +
    renderFooter(base)
  );
}

/* ---------------------------------------------------------- index.html sync */

function renderIndexFaq() {
  return renderFaqSection(homeSeo.faq);
}

function writeRobots() {
  const body = `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;
  writeFileSync(join(root, "robots.txt"), body);
  return "robots.txt";
}

function writeSitemap() {
  const lastmod = new Date().toISOString().split("T")[0];
  const paths = allSitemapPaths({ products, addons, featureGroups });
  const urls = paths
    .map(
      (path) => `  <url>
    <loc>${pageUrl(path)}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`
    )
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
  writeFileSync(join(root, "sitemap.xml"), xml);
  return "sitemap.xml";
}

function syncIndex() {
  const path = join(root, "index.html");
  let html = readFileSync(path, "utf8");

  const replaceBetween = (source, startMarker, endMarker, replacement) => {
    const start = source.indexOf(startMarker);
    const end = source.indexOf(endMarker);
    if (start === -1 || end === -1) throw new Error(`index.html is missing ${startMarker}`);
    return source.slice(0, start + startMarker.length) + replacement + source.slice(end);
  };

  html = replaceBetween(
    html,
    "<!-- seo:start -->",
    "<!-- seo:end -->",
    `\n${renderSeoMeta(homeSeo)}\n  `
  );

  html = replaceBetween(html, "<!-- seo-faq:start -->", "<!-- seo-faq:end -->", renderIndexFaq());

  html = replaceBetween(html, "<!-- nav:start -->", "<!-- nav:end -->", `\n        ${renderNav("")}\n        `);

  html = replaceBetween(
    html,
    "<!-- home-gallery:start -->",
    "<!-- home-gallery:end -->",
    renderHomeGallery()
  );

  html = replaceBetween(html, "<!-- footer:start -->", "<!-- footer:end -->", renderFooterMarkup(""));

  html = html
    .replace(/css\/style\.css\?v=\d+/, `css/style.css?v=${ASSET_VERSION}`)
    .replace(/css\/pages\.css\?v=\d+/, `css/pages.css?v=${ASSET_VERSION}`)
    .replace(/js\/main\.js\?v=\d+/, `js/main.js?v=${ASSET_VERSION}`)
    .replace(/js\/site\.js\?v=\d+/, `js/site.js?v=${ASSET_VERSION}`)
    .replace(/js\/newsletter\.js\?v=\d+/, `js/newsletter.js?v=${ASSET_VERSION}`)
    .replace(/js\/eoi\.js\?v=\d+/, `js/eoi.js?v=${ASSET_VERSION}`)
    .replace(/js\/contact\.js\?v=\d+/, `js/contact.js?v=${ASSET_VERSION}`)
    .replace(/(\?v=)\d+/g, `$1${ASSET_VERSION}`)
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
emit("privacy.html", privacyPage());
emit("contact.html", contactPage());
emit("get-started.html", getStartedPage());
for (const guide of guides) {
  emit(`guides/${guide.slug}.html`, guidePage(guide));
}
emit("quotation.html", quotationPage());
emit("invoice.html", invoicePage());
written.push(syncIndex());
written.push(writeRobots());
written.push(writeSitemap());

console.log(`generated ${written.length} pages:`);
for (const path of written) console.log(`  ${path}`);
