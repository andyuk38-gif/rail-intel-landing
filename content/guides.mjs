/**
 * Phase 3 SEO guides — buyer's guide and competitor comparison.
 * Factual, non-disparaging summaries based on public vendor information.
 */

export const competitors = [
  {
    id: "velociti",
    name: "Velociti RailSmart EDS",
    vendor: "Velociti Solutions",
    url: "https://www.velociti-solutions.com/solutions-rail/railsmart-eds-rail-competency-management-software/",
    positioning:
      "Established UK rail competency platform (Employee Development System) with mobile assessments, competency cycles, medical records and optional EDS Insights analytics.",
    strengths: [
      "Long track record with major TOCs and suppliers (e.g. LNER, Stadler).",
      "Mobile assessments with photo and observation capture.",
      "Broader RailSmart suite beyond competence (rosters, documents, incidents).",
      "EDS Insights add-on for interactive competency analytics.",
    ],
    typicalBuyer:
      "Operators wanting a proven, full-suite rail platform with optional analytics and wider operational modules.",
  },
  {
    id: "assesstech",
    name: "AssessTech ACMS",
    vendor: "AssessTech",
    url: "https://www.assesstech.com/acms-detail-page/",
    positioning:
      "Modular SaaS competence management used widely across UK rail, with offline-capable aAssess mobile assessments and optional training via AssessBook.",
    strengths: [
      "Modular build — assessment, incidents, licensing, bulletins, checks.",
      "Strong UK rail footprint and consultancy or training services.",
      "Developmental competence focus with City & Guilds accredited courses.",
      "Offline-capable field assessments via aAssess app.",
    ],
    typicalBuyer:
      "TOCs and freight operators wanting a modular platform plus optional training and consultancy.",
  },
  {
    id: "rpd",
    name: "RPD Assure",
    vendor: "Rail Professional Development",
    url: "https://www.rpd.co.uk/competence-management.php",
    positioning:
      "Integrated competence and learning management (AIMS) emphasising simplicity, ORR-aligned assurance and cost-effective hosted delivery.",
    strengths: [
      "CMS and LMS integrated in one Assure platform.",
      "Consultancy heritage in safety-critical competence and ORR guidance.",
      "Straightforward web-based assessments with offline mobile support.",
      "Positioned as uncluttered and efficient for assessors and managers.",
    ],
    typicalBuyer:
      "Organisations prioritising integrated competence and training records with consultancy support.",
  },
  {
    id: "3squared",
    name: "3Squared (RailSmart partner)",
    vendor: "3Squared",
    url: "https://www.3squared.com/",
    positioning:
      "UK rail digital solutions provider; publicly associated with RailSmart EDS delivery and safety-focused competency programmes for operators such as LNER.",
    strengths: [
      "Rail-specific digital delivery and implementation experience.",
      "Collaborative rollout model with operator governance involvement.",
      "Part of the wider RailSmart / Velociti ecosystem for competency management.",
    ],
    typicalBuyer:
      "Operators procuring through the RailSmart EDS ecosystem with implementation partner support.",
  },
];

/** Comparison criteria rows — values are vendor summaries, not rankings. */
export const comparisonCriteria = [
  {
    label: "Primary focus",
    railintel: "Competency management engine with optional operational add-ons and a separate Investigations app.",
    velociti: "Full RailSmart suite — competency (EDS) plus wider people, safety and operations modules.",
    assesstech: "Modular ACMS competence platform with optional training (AssessBook) and consultancy.",
    rpd: "Integrated Assure CMS/LMS with competence and learning in one database.",
    squared: "Implementation and digital solutions; competency via RailSmart EDS ecosystem.",
  },
  {
    label: "Field assessments",
    railintel: "Structured in-cab assessments, Tunnel Mode for low-glare cab use, offline-tolerant saving.",
    velociti: "Tablet and mobile assessments with photos, observations and criteria groups.",
    assesstech: "aAssess mobile app with offline capability and performance criteria marking.",
    rpd: "Web assessments with offline mobile support on current Apple and Android devices.",
    squared: "Delivered through RailSmart EDS assessment capabilities.",
  },
  {
    label: "Competency cycles",
    railintel: "Custom cycle builder, continuous cycles with CDP carryover, live expiry and gap detection.",
    velociti: "Defined cycles across roles with standard reports; EDS Insights for analytics.",
    assesstech: "Performance-based assessments with planning, tracking and automated reporting.",
    rpd: "Competence planning, recording and monitoring integrated with training records.",
    squared: "RailSmart EDS cycle and assessment management.",
  },
  {
    label: "Medicals & licences",
    railintel: "Core medicals, ORR records, licences, complementary certificates and expiry monitoring.",
    velociti: "Medical records and competency data in one platform (per vendor materials).",
    assesstech: "Dedicated licensing module; medical and fitness data on the ACMS record.",
    rpd: "Licences and competence documentation within integrated Assure records.",
    squared: "Via RailSmart EDS employee development records.",
  },
  {
    label: "QA / assurance",
    railintel: "QA Verifications add-on — section-level automated checks with retained run history.",
    velociti: "Standard reports plus EDS Insights verification and performance tracking.",
    assesstech: "Competence verification and assurance consultancy services available.",
    rpd: "Real-time progress review and verification; ORR guidance alignment emphasis.",
    squared: "Analytics and oversight through RailSmart EDS / Insights where deployed.",
  },
  {
    label: "Investigations",
    railintel: "Standalone Investigations app — RCA, evidence, recommendations, sealed reports; optional CMS link.",
    velociti: "Incident management within broader RailSmart people and safety suite.",
    assesstech: "Incident module for digital incident tracking (per ACMS modules).",
    rpd: "Competence and training focus; investigations not primary Assure positioning.",
    squared: "Operational safety solutions; investigations via suite modules where configured.",
  },
  {
    label: "Modularity",
    railintel: "Core CMS plus optional add-ons (QA, Trainee Driver, Safety Briefs, etc.); pay for what you use.",
    velociti: "Multiple RailSmart products and suites; EDS at centre of people and safety.",
    assesstech: "Pick ACMS modules; add AssessBook and services as needed.",
    rpd: "Integrated CMS/LMS; modules housed in one Assure database.",
    squared: "Ecosystem procurement — typically EDS plus implementation services.",
  },
  {
    label: "Built for rail by",
    railintel: "Experienced rail professional; product grounded in live Rail Vault application.",
    velociti: "Velociti Solutions — long-established UK rail software vendor.",
    assesstech: "AssessTech — rail competence specialist since 2008.",
    rpd: "RPD — rail professional development and safety-critical consultancy.",
    squared: "3Squared — UK rail digital solutions and RailSmart delivery partner.",
  },
];

export const guides = [
  {
    slug: "rail-competency-management-software",
    shortTitle: "Buyer's guide",
    seoTitle: "Rail Competence Management System UK | Guide & Buyer's Checklist",
    seoDescription:
      "What is a rail competence management system? A buyer's guide for UK operators — cycles, medicals, field assessment, audit evidence, QA and investigations, with Rail Intel CMS.",
    seoKeywords:
      "rail competence management system, rail competency management software UK, competence management system rail, driver competency software, ORR compliance software",
    heroTitle: "Rail competence management system — buyer's guide",
    heroLead:
      "Competence is safety-critical. The right rail competence management system replaces spreadsheets with a live record of who is fit, qualified and current — and produces evidence when assurance teams, auditors or regulators ask.",
    sections: [
      {
        heading: "What is a rail competence management system?",
        body: [
          "A rail competence management system (CMS) is a structured framework and digital platform used by railway operators and infrastructure managers to track, assess, and assure the skills, training, and fitness of their safety-critical workforce.",
          "It is not a generic HR tool with a rail skin. A true rail competence management system understands competency cycles with start and expiry dates, in-cab assessment, ORR medicals, driving licences, route and traction competence, and the audit trail behind every decision.",
          "Rail Intel CMS is built as a modern rail competence management system by a practising rail professional — with live verification, conditional rules, optional operational add-ons and a separate Investigations application.",
        ],
        bullets: [
          "**Safety and compliance** — prove competence before sign-on.",
          "**Risk reduction** — flag expired medicals, licences and competencies automatically.",
          "**Audit readiness** — verification runs, assessment outcomes and sealed reports on demand.",
        ],
      },
      {
        heading: "What a rail CMS must do",
        body: [
          "Whether you evaluate Rail Intel CMS, Velociti RailSmart EDS, AssessTech ACMS, RPD Assure or ecosystems delivered with partners such as 3Squared, the system of record must cover assessment cycles, medicals, licences and workforce evidence end to end.",
        ],
        bullets: [
          "**Live expiry control** — overdue medicals, licences and competencies flagged before sign-on.",
          "**Field assessment** — structured criteria in the cab or on the depot floor, not re-keyed later.",
          "**One record per person** — competence, medicals, passes and evidence in one place.",
          "**Audit-ready history** — verification runs, assessment outcomes and sealed reports on demand.",
        ],
      },
      {
        heading: "Eight questions to ask every vendor",
        body: ["Use these in procurement, demos and reference calls. The answers matter more than feature checklists."],
        bullets: [
          "**How are competency cycles built and renewed?** Can you run continuous cycles with carryover of open development points?",
          "**What happens at expiry?** Does the system block or flag not safe to work automatically?",
          "**How do assessors work offline or in the cab?** Mobile UX, glare handling and save-if-signal-drops behaviour.",
          "**Where do medicals and licences live?** Same record as competence, with dated expiry — not a separate spreadsheet.",
          "**How do you prove compliance to assurance?** QA verification, run history and exportable evidence — not manual assembly.",
          "**What is core vs add-on?** Understand total cost and what you are paying for before go-live.",
          "**How are investigations handled?** Incident log only, or end-to-end case management with sealed reports?",
          "**Who configures standards?** Your administrators, or every change needs a vendor ticket?",
        ],
      },
      {
        heading: "Core capability vs optional modules",
        body: [
          "Mature vendors take different approaches. AssessTech and Velociti offer modular suites where analytics, training or wider operations may be separate products. RPD Assure integrates competence and learning in one database. Rail Intel keeps a focused competency core and lets you activate add-ons — QA Verifications, Trainee Driver, Safety Briefs, Leave & Absence and more — when your operation needs them.",
          "There is no single right model. A lean TOC may want core competence only; a growing operator may want trainee programmes, medication declarations and automated QA from day one. Map your safety case and competence management arrangement before comparing licence lists.",
        ],
      },
      {
        heading: "Implementation and assurance",
        body: [
          "Software only delivers value when cycles, roles and standards match how you already work. Plan configuration time for frameworks, traction and routes, permissions and the first live cycles — not just data migration.",
          "For ORR and internal assurance, ask how quickly a manager can answer: who on this team is not safe to work right now? The best systems make that a dashboard question, not a week-long audit exercise.",
        ],
      },
    ],
    faq: [
      {
        question: "What is a rail competence management system?",
        answer:
          "A rail competence management system is the digital platform railway operators use to track, assess and assure the skills, training and fitness of safety-critical staff. Rail Intel CMS provides competency cycles, medicals, licences, field assessment and audit-ready evidence in one system of record.",
      },
      {
        question: "What is the best rail competence management system in the UK?",
        answer:
          "Rail Intel CMS is designed as a modern rail competence management system with live verification, conditional rules and optional operational modules. Established UK platforms include AssessTech ACMS, Velociti RailSmart EDS and RPD Assure — operators should compare against their competence management arrangement and safety case.",
      },
      {
        question: "How is Rail Intel different?",
        answer:
          "Rail Intel is built by a rail professional as a competency compliance engine with conditional rules, live verification and optional add-on modules. A separate Investigations app handles evidence-first case management with an optional CMS connector.",
      },
      {
        question: "When can we evaluate Rail Intel?",
        answer:
          "The platform launches in April 2027. You can register your interest now for early onboarding, introductory module offers and a guided evaluation when your procurement timeline allows.",
      },
    ],
  },
  {
    slug: "compare-rail-competency-software",
    shortTitle: "Compare platforms",
    seoTitle: "Compare Rail Competency Software | Rail Intel vs RailSmart, ACMS & Assure",
    seoDescription:
      "Independent-style comparison of UK rail competency management software — Rail Intel, Velociti RailSmart EDS, AssessTech ACMS, RPD Assure and the 3Squared delivery ecosystem.",
    seoKeywords:
      "rail competence management system, rail competency software comparison, RailSmart EDS alternative, AssessTech ACMS comparison, RPD Assure vs, rail CMS comparison UK",
    heroTitle: "Compare rail competence management systems",
    heroLead:
      "A factual overview of how UK rail competence management systems compare on the capabilities operators ask about most. Features vary by contract — always confirm detail in a live demo.",
    cta: {
      href: "guides/rail-competency-management-software.html",
      label: "Rail competence management system guide",
    },
    disclaimer:
      "Summaries are based on publicly available vendor information as of 2026. Rail Intel is the publisher of this page. Competitor names and trademarks belong to their respective owners. Confirm current features and pricing directly with each vendor.",
    sections: [
      {
        heading: "Who this comparison is for",
        body: [
          "Driver managers, competence leads, safety directors and procurement teams evaluating competency management software for UK rail operations. If you are updating a legacy spreadsheet process or re-tendering an existing CMS, use this table to structure demos — then dive into the vendor pages linked below.",
        ],
      },
      {
        heading: "Platform summaries",
        body: ["Short positioning for each platform in the UK market."],
      },
      {
        heading: "Capability comparison",
        body: [
          "High-level comparison across the criteria operators most often score in tenders. ✓ indicates a strong public positioning; — indicates not a primary vendor focus or requires separate modules.",
        ],
        isComparison: true,
      },
      {
        heading: "How Rail Intel fits",
        body: [
          "Rail Intel is designed as a competency compliance engine first: live cycles, medicals and licensing, in-cab assessment with Tunnel Mode, and a verification layer that makes not safe to work hard to miss. Optional add-ons extend into trainee programmes, safety briefs, medication checks and automated QA — without forcing every operator to buy the same bundle.",
          "Rail Intel Investigations is separate from CMS: structured evidence, RCA, recommendations, actions and dual sign-off on sealed final reports, with an optional connector for workforce context when you need it.",
          "The platform launches in April 2027. Register your interest if you want early access, introductory module offers and a walkthrough against your competence management arrangement.",
        ],
        bullets: [
          "**Competency engine** with conditional rules and live team compliance scores.",
          "**Modular add-ons** — activate QA, Trainee Driver, Safety Briefs and more when needed.",
          "**Investigations app** — evidence-first case management, optional CMS link.",
          "**Built on live product** — every screenshot on this site is from the application.",
        ],
      },
    ],
    faq: [
      {
        question: "Is Rail Intel a replacement for RailSmart EDS or ACMS?",
        answer:
          "Rail Intel competes in the same category — rail competency management — with a different architecture: focused CMS core, optional add-ons and a standalone Investigations app. Suitability depends on your operation, integration needs and procurement criteria.",
      },
      {
        question: "Which platform is best?",
        answer:
          "There is no universal winner. Established vendors have long UK track records. Rail Intel offers a modern competency engine built by a rail professional, launching in 2027. Run structured demos against your safety case and reference similar operators.",
      },
      {
        question: "Can we run a pilot before committing?",
        answer:
          "Rail Intel offers 14-day module trials once live. Register your interest to join early onboarding ahead of the April 2027 launch.",
      },
    ],
  },
];
