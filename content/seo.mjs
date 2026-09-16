/**
 * SEO metadata, structured data helpers and per-page search settings.
 * Consumed by scripts/build-pages.mjs — no visual design changes.
 */

import { guides } from "./guides.mjs";

export const SITE_URL = "https://railintel.co.uk";
export const DEFAULT_OG_IMAGE = "/images/product/team-compliance.png";
export const SITE_NAME = "Rail Intel";

export function pageUrl(path) {
  if (!path || path === "/" || path === "index.html") return `${SITE_URL}/`;
  const clean = String(path).replace(/^\//, "");
  return `${SITE_URL}/${clean}`;
}

export const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/images/rail-intel-icon.png`,
  description:
    "Rail Intel is a suite of digital competency management and investigation products for the rail industry, built by a rail professional.",
  sameAs: [],
};

export const website = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  description: "Competency management software and operational add-ons for rail.",
  publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
};

export const cmsSoftware = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Rail Intel CMS",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: SITE_URL,
  description:
    "Competency management for rail — assessment cycles, workforce records, medicals, licences and audit-ready compliance evidence.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "GBP",
    description: "Contact for pricing and module trials.",
  },
  provider: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
};

export const home = {
  path: "/",
  title: "Rail Intel | Rail Competency Management Software",
  description:
    "Rail competency management software for UK rail. Track assessment cycles, medicals, licences and workforce records with audit-ready evidence and operational add-on modules.",
  keywords:
    "rail competency management, rail compliance software, driver competence, assessment cycles, workforce records, medicals licensing rail",
  faq: [
    {
      question: "What is Rail Intel?",
      answer:
        "Rail Intel is competency management software for rail operators. It tracks assessment cycles, medicals, licences and workforce records so expired skills are flagged before anyone reaches the railway.",
    },
    {
      question: "Who is Rail Intel for?",
      answer:
        "Driver managers, competence teams, safety departments and operations leaders who need a live system of record instead of spreadsheets for competence, medicals and licensing.",
    },
    {
      question: "Does Rail Intel include add-on modules?",
      answer:
        "Yes. Optional CMS add-ons include QA Verifications, Task assignment, Safety Briefs, Trainee Driver, Driver Reports, Leave & Absence and Medication Checks. Rail Intel Investigations is a separate app for evidence-first case management.",
    },
    {
      question: "When is Rail Intel launching?",
      answer:
        "The platform is launching in April 2027. You can register your interest now for early onboarding discounts and introductory module offers.",
    },
  ],
};

export const staticPages = {
  "products/index.html": {
    title: "Rail Intel Products | CMS, Investigations & Add-on Modules",
    description:
      "Explore Rail Intel CMS, Investigations and optional add-on modules including QA Verifications, Safety Briefs, Trainee Driver, Driver Reports, Leave & Absence and Medication Checks.",
    keywords: "rail intel products, rail CMS modules, QA verifications rail, trainee driver software",
    faq: [
      {
        question: "What is included in Rail Intel CMS?",
        answer:
          "Core competency management: cycles, in-cab assessments, workforce records, medicals, licensing, incidents monitoring and reporting — without requiring add-on modules.",
      },
      {
        question: "Which modules are add-ons?",
        answer:
          "QA Verifications, Task assignment, Safety Briefs, Trainee Driver, Driver Reports, Leave & Absence and Medication Checks extend Rail Intel CMS when your operation needs them.",
      },
    ],
    breadcrumbs: [
      { name: "Rail Intel", path: "/" },
      { name: "Products", path: "products/index.html" },
    ],
  },
  "features/index.html": {
    title: "Rail Intel Features | Competency, Medicals & Workforce Records",
    description:
      "Core Rail Intel CMS features: competency cycles, workforce records, medicals and licensing, incidents, CDP monitoring, communications hub, administration and digital cab passes.",
    keywords: "rail competency features, competence cycles, medicals licensing rail, workforce records",
    breadcrumbs: [
      { name: "Rail Intel", path: "/" },
      { name: "Features", path: "features/index.html" },
    ],
  },
  "how-it-works.html": {
    title: "How Rail Intel Works | Implementation for Rail Competency",
    description:
      "See how Rail Intel implementation works: configure your standard, build competency cycles, load people, assess in the field, monitor compliance and produce audit evidence.",
    keywords: "rail competency implementation, competence cycle setup, rail software onboarding",
    breadcrumbs: [
      { name: "Rail Intel", path: "/" },
      { name: "How it works", path: "how-it-works.html" },
    ],
  },
  "security.html": {
    title: "Rail Intel Security | Azure Hosting, 2FA & Access Control",
    description:
      "Rail Intel security: company-scoped tenants, role-based access, two-factor authentication and hosting on Microsoft Azure with encryption in transit and at rest.",
    keywords: "rail software security, azure rail hosting, competency data protection",
    breadcrumbs: [
      { name: "Rail Intel", path: "/" },
      { name: "Security", path: "security.html" },
    ],
  },
  "privacy.html": {
    title: "Rail Intel Privacy Policy | Website & Product Data",
    description:
      "Rail Intel privacy policy: how we collect and use personal data on railintel.co.uk, in onboarding, and in Rail Intel CMS and Investigations.",
    keywords: "rail intel privacy policy, rail software GDPR, competency data privacy",
    breadcrumbs: [
      { name: "Rail Intel", path: "/" },
      { name: "Privacy policy", path: "privacy.html" },
    ],
  },
  "get-started.html": {
    title: "Get Started with Rail Intel | Onboarding & Application",
    description:
      "Start onboarding with Rail Intel. Apply online, receive a quotation or purchase directly, and move from application to a live CMS tenant with guided setup.",
    keywords: "rail intel onboarding, competency software trial, rail CMS application",
    breadcrumbs: [
      { name: "Rail Intel", path: "/" },
      { name: "Get started", path: "get-started.html" },
    ],
  },
  "contact.html": {
    title: "Contact Rail Intel | Sales, Support & Enquiries",
    description:
      "Contact Rail Intel for sales, media, careers, technical support and billing enquiries. Send a message and we will route it to the right team.",
    keywords: "contact rail intel, rail software support, rail intel sales",
    breadcrumbs: [
      { name: "Rail Intel", path: "/" },
      { name: "Contact", path: "contact.html" },
    ],
  },
  "quotation.html": {
    title: "Your Quotation – Rail Intel",
    description: "Review and respond to your Rail Intel CMS quotation.",
    robots: "noindex, nofollow",
  },
  "invoice.html": {
    title: "Your Invoice – Rail Intel",
    description: "View your Rail Intel CMS invoice and payment details.",
    robots: "noindex, nofollow",
  },
};

/** Merge content-object SEO fields with sensible defaults. */
export function seoForItem(item, { path, titleFallback, descriptionFallback, breadcrumbParent }) {
  const title = item.seoTitle || titleFallback;
  const description = item.seoDescription || descriptionFallback;
  const breadcrumbs = item.seoBreadcrumbs ||
    (breadcrumbParent
      ? [
          { name: "Rail Intel", path: "/" },
          breadcrumbParent,
          { name: item.name, path },
        ]
      : [{ name: "Rail Intel", path: "/" }, { name: item.name, path }]);

  return {
    path,
    title,
    description,
    keywords: item.seoKeywords || "",
    faq: item.faq || [],
    breadcrumbs,
    software: item.seoSoftware,
  };
}

export function faqJsonLd(faq, pageUrlValue) {
  if (!faq?.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: entry.answer,
      },
    })),
    url: pageUrlValue,
  };
}

export function breadcrumbJsonLd(breadcrumbs) {
  if (!breadcrumbs?.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: pageUrl(crumb.path),
    })),
  };
}

export function webPageJsonLd({ title, description, path }) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: pageUrl(path),
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
  };
}

export function softwareJsonLd(software) {
  if (!software) return null;
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: software.name,
    applicationCategory: software.applicationCategory || "BusinessApplication",
    operatingSystem: "Web",
    url: pageUrl(software.path),
    description: software.description,
    provider: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  };
}

export function collectJsonLd(pageSeo) {
  const blocks = [];
  const url = pageUrl(pageSeo.path);

  if (pageSeo.path === "/" || pageSeo.path === "index.html") {
    blocks.push(organization, website, cmsSoftware);
  }

  blocks.push(webPageJsonLd({ title: pageSeo.title, description: pageSeo.description, path: pageSeo.path }));

  const crumbs = breadcrumbJsonLd(pageSeo.breadcrumbs);
  if (crumbs) blocks.push(crumbs);

  const faq = faqJsonLd(pageSeo.faq, url);
  if (faq) blocks.push(faq);

  const software = softwareJsonLd(pageSeo.software);
  if (software) blocks.push(software);

  if (String(pageSeo.path || "").startsWith("guides/")) {
    blocks.push({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: pageSeo.title,
      description: pageSeo.description,
      url,
      inLanguage: "en-GB",
      publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    });
  }

  return blocks;
}

export function guideSeo(guide) {
  return {
    path: `guides/${guide.slug}.html`,
    title: guide.seoTitle,
    description: guide.seoDescription,
    keywords: guide.seoKeywords || "",
    faq: guide.faq || [],
    breadcrumbs: [
      { name: "Rail Intel", path: "/" },
      { name: guide.shortTitle, path: `guides/${guide.slug}.html` },
    ],
  };
}

export function allSitemapPaths({ products, addons, featureGroups, guideList = guides }) {
  const paths = [
    "/",
    "products/index.html",
    "features/index.html",
    "how-it-works.html",
    "security.html",
    "privacy.html",
    "contact.html",
    "get-started.html",
  ];

  for (const product of products) {
    if (product.href?.endsWith(".html")) paths.push(product.href);
  }
  for (const addon of addons) {
    paths.push(`products/${addon.slug}.html`);
  }
  for (const group of featureGroups) {
    paths.push(`features/${group.slug}.html`);
  }
  for (const guide of guideList) {
    paths.push(`guides/${guide.slug}.html`);
  }

  return paths;
}
