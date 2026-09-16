/**
 * Phase 3 per-page SEO — titles, descriptions, FAQs and internal links
 * for add-ons and features that do not carry them inline in site.mjs.
 */

export const seoExtensions = {
  /* --------------------------------------------------------------- add-ons */

  "task-assignment": {
    seoTitle: "Rail Task Assignment Software | Follow-up Actions on Records",
    seoDescription:
      "Assign owned follow-up actions to rail staff, link tasks to employee records and track completion from the dashboard — so findings do not live in email.",
    seoKeywords: "rail task management, competence follow-up, safety action tracking, employee record tasks",
    faq: [
      {
        question: "Can tasks be linked to an employee record?",
        answer:
          "Yes. Each task can optionally reference the employee it concerns, so follow-ups stay visible on the profile and in the company-wide task list.",
      },
      {
        question: "Who can raise and complete tasks?",
        answer:
          "Any user in the company can raise a task when the module is active. Assignees update status from open through to completion according to their permissions.",
      },
    ],
    relatedLinks: [
      { name: "Incidents & Monitoring", href: "features/incidents-monitoring.html" },
      { name: "QA Verifications", href: "products/qa-verifications.html" },
    ],
  },

  "safety-briefs": {
    seoTitle: "Rail Safety Briefs Software | Attendance Evidence per Employee",
    seoDescription:
      "Record rail safety brief attendance per employee with delivery method and provider — in person or remote — for audit-ready evidence on every record.",
    seoKeywords: "rail safety briefs, safety briefing records, competence compliance, driver briefing evidence",
    faq: [
      {
        question: "Does Safety Briefs track individual attendance?",
        answer:
          "Yes. Each brief is recorded against the employee, not a circulation list, with delivery method and provider details where applicable.",
      },
      {
        question: "Does briefing coverage appear in reporting?",
        answer:
          "When the module is active, safety-brief coverage surfaces in Reporting alongside medical and competency metrics.",
      },
    ],
    relatedLinks: [
      { name: "Workforce Records", href: "features/workforce-records.html" },
      { name: "Reporting", href: "features/reporting-administration.html" },
    ],
  },

  "trainee-driver": {
    seoTitle: "Trainee Driver Programme Software | Rail Intel Trainee Module",
    seoDescription:
      "Run a full rail trainee driver programme: policies, schedules, cohorts, enrolment, training cycles, portfolios, train logs and signed feedback.",
    seoKeywords: "trainee driver software rail, driver training programme, trainee hours rail, competence portfolio",
    faq: [
      {
        question: "What is included in the Trainee Driver module?",
        answer:
          "Policies and agreements, training schedules with automatic calendar projection, groups, enrolment, training-cycle assignment and a live trainee portfolio with train logs and reporting.",
      },
      {
        question: "Does core Rail Intel already track trainee hours?",
        answer:
          "Yes. Experience Records cover trainee hours and daylight or darkness progress. The Trainee Driver module adds programme management around that core capability.",
      },
    ],
    relatedLinks: [
      { name: "Competency & Cycles", href: "features/competency-cycles.html" },
      { name: "QA Verifications", href: "products/qa-verifications.html" },
    ],
  },

  "driver-reports": {
    seoTitle: "Driver Reports for Rail | Signed Operational Event Records",
    seoDescription:
      "Capture structured, signed driver reports with operational context — turn, headcode and conditions — exportable to your investigations system.",
    seoKeywords: "driver report software rail, operational event report, signed driver statement, rail investigations export",
    faq: [
      {
        question: "What does a driver report capture?",
        answer:
          "Structured operational context — turn, headcode, conditions and narrative — signed by the driver and retained on their employee record.",
      },
      {
        question: "Can reports export to Investigations?",
        answer:
          "Where the Investigations connector is configured, driver reports can export to Rail Intel Investigations without re-keying.",
      },
    ],
    relatedLinks: [
      { name: "Rail Intel Investigations", href: "products/investigations.html" },
      { name: "Incidents & Monitoring", href: "features/incidents-monitoring.html" },
    ],
  },

  "leave-absence": {
    seoTitle: "Rail Leave & Absence Software | Entitlements with Audit Trail",
    seoDescription:
      "Track rail leave entitlements, sickness and absence with manager approval, balances on the employee record and reporting that sits beside competence data.",
    seoKeywords: "rail leave absence, driver absence management, competence return to work, safety critical absence",
    faq: [
      {
        question: "Why is absence tracked beside competence?",
        answer:
          "Long-term absence can affect fitness to work. Holding leave data on the same record as competency and medicals keeps return-to-work decisions visible.",
      },
      {
        question: "Is there an approval workflow?",
        answer:
          "Yes. Employees raise requests; assessing managers approve according to permissions, with email notification and a full audit trail on the record.",
      },
    ],
    relatedLinks: [
      { name: "Medicals & Licensing", href: "features/medicals-licensing.html" },
      { name: "Workforce Records", href: "features/workforce-records.html" },
    ],
  },

  "medication-checks": {
    seoTitle: "Rail Medication Checks | Declarations on the Medical Record",
    seoDescription:
      "Medication declarations and occupational health outcomes on the rail medical record, with optional employee self-submission and manager review.",
    seoKeywords: "rail medication declaration, fitness for duty medication, occupational health rail, medical record software",
    faq: [
      {
        question: "Is the Medical tab included without this module?",
        answer:
          "Yes. Core Rail Intel includes medical records and the company Medicals page. Medication Checks adds declaration and OH check workflows on top.",
      },
      {
        question: "Can employees submit their own declarations?",
        answer:
          "Optionally. Employees can submit a declaration for manager review, keeping medication position with fitness data on the record.",
      },
    ],
    relatedLinks: [
      { name: "Medicals & Licensing", href: "features/medicals-licensing.html" },
      { name: "QA Verifications", href: "products/qa-verifications.html" },
    ],
  },


  /* ------------------------------------------------------------- features */

  "tunnel-mode": {
    seoTitle: "Tunnel Mode for In-Cab Assessment | Rail Intel",
    seoDescription:
      "Dark, dimmable in-cab assessing for rail — one-tap dark mode and manual brightness on tablet so assessors cut windscreen glare in tunnels and at night.",
    seoKeywords: "in-cab assessment dark mode, tunnel assessment rail, cab assessing software, windscreen glare tablet",
    faq: [
      {
        question: "Does Tunnel Mode detect tunnels automatically?",
        answer:
          "No. The assessor switches dark mode and adjusts brightness manually — designed for the person in the cab to decide when glare is a problem.",
      },
      {
        question: "Which devices support brightness control?",
        answer:
          "Mobile and tablet assessments include a brightness slider under the header, from full daylight down to a cab-friendly level.",
      },
    ],
    relatedLinks: [
      { name: "Competency & Cycles", href: "features/competency-cycles.html" },
      { name: "Digital Cab Passes", href: "features/digital-cab-passes.html" },
    ],
  },

  "communications-hub": {
    seoTitle: "Rail Communications Hub | Automated Emails & System Notifications",
    seoDescription:
      "Automate alert emails and in-app system notifications from conditional rules — competency expiries, medical renewals, incidents, welfare follow-up and on-record messaging.",
    seoKeywords:
      "rail competency notifications, automated compliance alerts, workforce email notifications, system notifications rail software",
    faq: [
      {
        question: "What triggers automated communications in Rail Intel?",
        answer:
          "Conditional rules across competency, medicals, licensing, incidents, monitoring and messaging drive both email alerts and in-app system notifications when configured criteria are met.",
      },
      {
        question: "Can we control the emails that are sent?",
        answer:
          "Yes. Company administrators configure email templates in Administration, so the wording and branding match your operation while the triggers stay rule-governed.",
      },
    ],
    relatedLinks: [
      { name: "Workforce Records", href: "features/workforce-records.html" },
      { name: "Administration", href: "features/administration.html" },
      { name: "Incidents & Monitoring", href: "features/incidents-monitoring.html" },
    ],
  },

  "workforce-records": {
    seoTitle: "Rail Workforce Records | One Employee Record for Competence",
    seoDescription:
      "Single rail employee records for cab passes, training, qualifications, experience hours, documents and messaging — permission-controlled by role.",
    seoKeywords: "rail workforce records, employee competence record, safety critical personnel, driver record software",
    faq: [
      {
        question: "What sits on one workforce record?",
        answer:
          "Status, competence cycles, cab passes, training, qualifications, experience hours, documents and messaging — permission-controlled by role.",
      },
      {
        question: "Can drivers see only their own record?",
        answer:
          "Yes. Own-record access can be configured so drivers view their profile without the company directory.",
      },
    ],
    relatedLinks: [
      { name: "Competency & Cycles", href: "features/competency-cycles.html" },
      { name: "Printable Profile", href: "features/printable-profile.html" },
      { name: "Profile Lock", href: "features/profile-lock.html" },
    ],
  },

  "printable-profile": {
    seoTitle: "Printable Rail Employee Profiles | Rail Intel",
    seoDescription:
      "Generate full-colour or print-friendly employee profiles from live rail competence records for audits, management review and formal packs — print or save as PDF.",
    seoKeywords:
      "rail employee profile print, competence profile PDF, printable driver record, audit employee profile",
    faq: [
      {
        question: "Can I print an employee profile?",
        answer:
          "Yes. Rail Intel generates a full-colour professional profile or a print-friendly layout from the live record, which you can print or save as PDF.",
      },
      {
        question: "What data is included on the profile?",
        answer:
          "The profile draws from the live record — competencies, medicals, licensing and supporting sections in one document, generated at the moment you create it.",
      },
      {
        question: "What is the difference between full-colour and print-friendly?",
        answer:
          "Full-colour is designed for on-screen review and stakeholder circulation. Print-friendly is optimised for paper copies and archival PDF, but both use the same underlying record data.",
      },
    ],
    relatedLinks: [
      { name: "Workforce Records", href: "features/workforce-records.html" },
      { name: "Profile Lock", href: "features/profile-lock.html" },
      { name: "Competency & Cycles", href: "features/competency-cycles.html" },
    ],
  },

  "profile-lock": {
    seoTitle: "Employee Profile Lock for Rail Investigations | Rail Intel",
    seoDescription:
      "Company administrators can lock rail employee profiles to preserve a point-in-time record for ORR, RAIB or internal investigations, with a required reason and full audit trail.",
    seoKeywords:
      "rail employee profile lock, investigation evidence preservation, ORR audit record, RAIB investigation, competence record freeze",
    faq: [
      {
        question: "Who can lock an employee profile?",
        answer:
          "Only a company administrator can lock or unlock a profile. General users cannot apply or release a lock.",
      },
      {
        question: "What happens while a profile is locked?",
        answer:
          "Every section of the record becomes read-only for all users — medicals, competence, training, incidents, cycles, notes and documents cannot be added, changed or deleted until an administrator unlocks the profile.",
      },
      {
        question: "Is a reason recorded when a profile is locked?",
        answer:
          "Yes. The administrator must enter a reason before the lock is applied. The lock, their name and the reason are written to the audit trail.",
      },
    ],
    relatedLinks: [
      { name: "Workforce Records", href: "features/workforce-records.html" },
      { name: "QA Verifications", href: "products/qa-verifications.html" },
    ],
  },

  "medicals-licensing": {
    seoTitle: "Rail Medicals & Licensing Software | ORR Medicals and Licences",
    seoDescription:
      "Track ORR medicals, fitness status, train driving licences, categories and complementary certificates with expiry monitoring before anyone signs on.",
    seoKeywords: "rail medical records, ORR medical, train driving licence software, complementary certificate rail",
    faq: [
      {
        question: "What happens when a medical or licence expires?",
        answer:
          "Expired or unfit medicals mark the employee as not safe to work, surfacing on the dashboard and in reporting rather than waiting to be noticed manually.",
      },
      {
        question: "Are complementary certificates supported?",
        answer:
          "Yes. Part B certificates are held with the licence, covering infrastructure, traction and routes the driver is certified for.",
      },
    ],
    relatedLinks: [
      { name: "Medication Checks add-on", href: "products/medication-checks.html" },
      { name: "QA Verifications", href: "products/qa-verifications.html" },
    ],
  },

  "incidents-monitoring": {
    seoTitle: "Rail Incidents & Monitoring | CDPs Linked to Competence",
    seoDescription:
      "Record rail incidents, allocate them to people, raise competence development plans and performance support — one thread from event to close-out.",
    seoKeywords: "rail incident management, competence development plan, CDP monitoring, performance support plan rail",
    faq: [
      {
        question: "How do incidents connect to competence?",
        answer:
          "Incidents allocate to employees and can raise competence development plans on the Monitoring tab, keeping the thread from event to improvement visible.",
      },
      {
        question: "Is CDP monitoring a separate add-on?",
        answer:
          "No. Monitoring and CDPs are core Rail Intel. See the CDP Monitoring feature page for carryover and permissions detail.",
      },
    ],
    relatedLinks: [
      { name: "CDP Monitoring", href: "features/cdp-monitoring.html" },
      { name: "Rail Intel Investigations", href: "products/investigations.html" },
    ],
  },

  "cdp-monitoring": {
    seoTitle: "CDP Monitoring for Rail | Competence Development Plans",
    seoDescription:
      "Track rail competence development plans on the Monitoring tab, carry open CDPs across continuous cycles and govern access by company role.",
    seoKeywords: "competence development plan rail, CDP monitoring, continuous competency cycle, rail monitoring tab",
    faq: [
      {
        question: "Do open CDPs carry over when a cycle renews?",
        answer:
          "Yes. On continuous cycles, open CDP items and scheduled assessment events carry forward automatically when a new cycle period starts.",
      },
      {
        question: "Who can view and edit CDPs?",
        answer:
          "Access is controlled by company role permissions — assessors, line managers, drivers with own-record access and administrators each see what their role allows.",
      },
    ],
    relatedLinks: [
      { name: "Competency & Cycles", href: "features/competency-cycles.html" },
      { name: "Incidents & Monitoring", href: "features/incidents-monitoring.html" },
    ],
  },

  administration: {
    seoTitle: "Rail Intel Administration | Roles, Standards & Module Config",
    seoDescription:
      "Configure organisation structure, role permissions, competency standards, traction, routes, add-on modules and the Investigations connector — without vendor change requests.",
    seoKeywords: "rail CMS administration, competence standards configuration, role permissions rail, traction routes setup",
    faq: [
      {
        question: "Can we configure standards without custom development?",
        answer:
          "Yes. Frameworks, grading scales, company standards, timing rules, traction, routes and permissions are all configured in Administration by your administrators.",
      },
      {
        question: "How are optional modules activated?",
        answer:
          "From the in-app Add-ons library. Each module can be trialled for 14 days or subscribed annually without a separate procurement workflow.",
      },
    ],
    relatedLinks: [
      { name: "Security", href: "security.html" },
      { name: "How it works", href: "how-it-works.html" },
    ],
  },

  "reporting-administration": {
    seoTitle: "Rail Compliance Reporting | Incidents, Medicals & Competence KPIs",
    seoDescription:
      "Live rail compliance reporting — on-track and off-track counts, incident trends, medical and competency expiry windows, plus QA and safety-brief metrics when modules are active.",
    seoKeywords: "rail compliance reporting, competence analytics, incident KPIs rail, medical expiry dashboard",
    faq: [
      {
        question: "What does the reporting dashboard cover?",
        answer:
          "Incidents, monitoring, medicals and competencies with totals, trends and breakdowns by type and role. Add-on modules add safety-brief and QA verification metrics.",
      },
      {
        question: "Is reporting included in core CMS?",
        answer:
          "Yes. Reporting and the administration configuration behind it are part of core Rail Intel, not a separate analytics product.",
      },
    ],
    relatedLinks: [
      { name: "QA Verifications add-on", href: "products/qa-verifications.html" },
      { name: "Administration", href: "features/administration.html" },
    ],
  },

  "digital-cab-passes": {
    seoTitle: "Digital Cab Passes for Rail | QR Verification",
    seoDescription:
      "Issue digital rail cab passes with colour status and QR verification anyone can scan — validity tracked on the employee record and in reporting.",
    seoKeywords: "digital cab pass rail, QR cab pass verification, cab authority software, driver cab access",
    faq: [
      {
        question: "How are cab passes verified?",
        answer:
          "Each pass includes QR code verification that anyone can scan to validate authority and status against the live record.",
      },
      {
        question: "Are pass colour classifications supported?",
        answer:
          "Yes. Issue workflow captures colour classification and validity so the pass in the pocket matches the system of record.",
      },
    ],
    relatedLinks: [
      { name: "Workforce Records", href: "features/workforce-records.html" },
      { name: "Tunnel Mode", href: "features/tunnel-mode.html" },
    ],
  },

  languages: {
    seoTitle: "Rail Intel Languages | Multi-language CMS Interface",
    seoDescription:
      "Rail Intel CMS supports multiple interface languages including English, Welsh, French, German, Spanish, Italian and Arabic for diverse rail workforces.",
    seoKeywords: "rail software languages, multilingual competence system, Welsh rail CMS, Arabic interface rail",
    faq: [
      {
        question: "Which languages does Rail Intel support?",
        answer:
          "English, Spanish, French, Welsh, Italian, German and Arabic interface languages are available for the CMS experience.",
      },
      {
        question: "Are assessment records translated automatically?",
        answer:
          "The interface can be switched per user. Competency criteria and company-configured content remain under your administrator's control.",
      },
    ],
    relatedLinks: [
      { name: "Administration", href: "features/administration.html" },
      { name: "Workforce Records", href: "features/workforce-records.html" },
    ],
  },
};

/** Merge extension fields onto a content item (non-destructive). */
export function mergeItemSeo(item, slug) {
  const ext = seoExtensions[slug];
  if (!ext) return item;
  return { ...item, ...ext };
}
