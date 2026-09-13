/**
 * Homepage command-centre gallery (Dashboard / Compliance / Reporting / Analytics).
 *
 * Edit this file, then run: node scripts/build-pages.mjs
 * The build rewrites the gallery block in index.html and bumps asset cache versions.
 */

export const homeGallery = {
  tabs: [
    {
      label: "Dashboard",
      active: true,
      url: "cms.railintel.co.uk/dashboard",
      image: {
        src: "images/product/hero-dashboard.png",
        alt: "Rail Intel dashboard showing live compliance overview, personal progress and team compliance",
        width: 512,
        height: 357,
      },
      chips: {
        safe: { title: "Live verification", detail: "All checks current" },
        alert: { title: "Medical expiring", detail: "Flagged before sign-on" },
      },
      copy: {
        eyebrow: "Dashboard",
        heading: "One dashboard for the whole operation.",
        lead: "Stop chasing spreadsheets. See the state of the railway’s people the moment you log in.",
        bullets: [
          "Live counts for on-track, off-track, overdue assessments and medicals — from your company data, not a weekly export.",
          "Open any person and drill into team compliance, incidents and QA in a click.",
          "Personal progress and team status in one place, ready for any internal or external audit.",
        ],
      },
    },
    {
      label: "Compliance",
      url: "cms.railintel.co.uk/compliance",
      image: {
        src: "images/product/team-compliance.png",
        alt: "Your team's compliance panel with live issue counts and employees needing review",
        width: 512,
        height: 357,
      },
      chips: {
        safe: { title: "69 compliant", detail: "Live company records" },
        alert: { title: "43 live issues", detail: "Review and advisory" },
      },
      copy: {
        eyebrow: "Compliance",
        heading: "Know who needs attention — Realtime verification.",
        lead:
          "Team compliance reads live company records and surfaces review and advisory items, so gaps are visible while there is still time to act.",
        bullets: [
          "Issue counts for review, advisory and compliant statuses, updated from the live record.",
          "Open any person with outstanding checks and move straight into QA Verifications.",
          "Live realtime data — not a weekly export or the last report someone remembered to run.",
        ],
      },
    },
    {
      label: "Reporting",
      url: "cms.railintel.co.uk/reporting",
      wide: true,
      image: {
        src: "images/product/reporting-headline-metrics.png",
        alt: "Reporting and analytics with headline metrics and licensing readiness",
        width: 1024,
        height: 545,
      },
      chips: {
        safe: { title: "QA compliance rate", detail: "54% from live data" },
        alert: { title: "Licence renewals", detail: "2 due within 6 weeks" },
      },
      copy: {
        eyebrow: "Reporting",
        heading: "Audit-ready reports from live data.",
        lead:
          "Turn incidents, safety briefs and compliance activity into clear reports you can take into a review without rebuilding the story from spreadsheets.",
        bullets: [
          "Incident KPIs and operational trends ready for safety and management meetings.",
          "Safety briefing coverage tracked per employee, not against a distribution list.",
          "Evidence that is current, filterable and ready to hand over for audit.",
        ],
      },
    },
    {
      label: "Analytics",
      url: "cms.railintel.co.uk/reporting",
      wide: true,
      image: {
        src: "images/product/reporting-incident-statistics.png",
        alt: "Incident data statistics with period and week filters, trends and breakdowns by type",
        width: 1024,
        height: 547,
      },
      chips: {
        safe: { title: "Incident trends", detail: "Filter by period and week" },
        alert: { title: "Incidents by type", detail: "Collision and SPAD split" },
      },
      copy: {
        eyebrow: "Analytics",
        heading: "Incident statistics sliced by period and type.",
        lead:
          "Filter incidents by financial year, period and week, then read trends over time and a breakdown by type — ready for safety reviews without rebuilding charts in a spreadsheet.",
        bullets: [
          "Year, period and week filters aligned to your financial calendar.",
          "Incidents over time across reporting periods so clusters stand out quickly.",
          "Type breakdown with counts and share — Collision, SPAD and other categories in one view.",
        ],
      },
    },
  ],
};
