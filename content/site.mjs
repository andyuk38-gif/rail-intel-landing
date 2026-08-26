/**
 * Content for every generated page.
 *
 * Everything here is grounded in the Rail Vault codebase: the add-on list comes
 * from src/addonCatalog.ts and the billing registries in server.ts, and the core
 * feature list is what the app exposes without an entry in company_addons.
 *
 * Screenshot paths are relative to the repo root and must exist in
 * images/screens/manifest.json so the generator can size them at 2x.
 */

export const site = {
  name: "Rail Intel",
  app: "https://cms.railintel.co.uk",
  cms: "https://cms.railintel.co.uk",
  investigations: "https://investigations.railintel.co.uk",
  tagline: "Secure competency management for rail",
};

/* ------------------------------------------------------------- main products */

/** Standalone apps (not CMS add-ons). Shown above the add-on list in Product nav. */
export const products = [
  {
    slug: "cms",
    name: "Rail Intel CMS",
    summary: "Competency management for rail — assessments, workforce records, medicals and licensing.",
    tagline: "Secure competency management for rail",
    lead:
      "Rail Intel CMS is the system of record for competency: cycles, assessments in the cab, medicals, licences, incidents and the audit trail behind them. Optional add-on modules bolt on when your operation needs them.",
    href: "", // homepage
    appUrlKey: "cms",
    cta: "Open Rail Intel CMS",
  },
  {
    slug: "investigations",
    name: "Rail Intel Investigations",
    summary:
      "Evidence-first rail investigations — from opening a case through recommendations, actions and a sealed final report.",
    tagline: "Investigate with evidence, not email threads",
    lead:
      "Rail Intel Investigations is a standalone app for running investigations end to end: one file per case, with a command centre, structured evidence and RCA, recommendations that become owned actions, and a signed final report. Link it to Rail Intel CMS when you want competency and workforce context on the subject without leaving the investigation.",
    href: "products/investigations.html",
    appUrlKey: "investigations",
    cta: "Open Investigations",
    sections: [
      {
        heading: "Command centre for the live case",
        body: [
          "Every investigation is one workspace — Overview, Gantt, Tasks, Recommendations, Actions, Findings, D&A, Fatigue, Chat, Final report and Audit — so the file does not live in email threads and shared drives.",
          "Open cases as manual investigations or from an incident feed when that source is configured. Capture location with coordinates, what3words and a map, set the investigation level, and assign a lead and team.",
        ],
        bullets: [
          "**Statuses** Open, In review and Closed, with Level 1 / 2 / 3 (and Other) for severity.",
          "**Configurable incident types** for your operation (SPAD, derailment, collision, welfare escalation and more).",
          "**Gantt and tasks** so planned work sits on a timeline against the case.",
        ],
      },
      {
        heading: "Recommendations that become owned actions",
        body: [
          "Raise recommendations against the case and the evidence behind them. HSSE and DCP roles approve or reject; rejection needs a written justification. Approval creates a tracked action that moves from open through in progress to done — so close-out is visible, not assumed.",
        ],
        bullets: [
          "**Recommendation board** with pending, approved and rejected states.",
          "**Mandatory rejection justification** so a no is auditable.",
          "**Actions from approvals** with clear ownership and status.",
        ],
      },
      {
        heading: "Evidence, RCA and the final report",
        body: [
          "Record findings against human performance factors and the ten incident factors, with an evidence reference and narrative on each item. When the investigation is ready, the final report compiles the artefacts for print or PDF, with signature pads for the Lead Investigator and Designated Competent Person — and seals when both have signed.",
        ],
        bullets: [
          "**RCA coding** against human performance and ten-incident-factor frameworks.",
          "**Print / Export PDF** of the compiled final report.",
          "**Dual sign-off** (Lead Investigator + DCP) before the report is sealed.",
          "**Hash-linked audit chain** of who did what, and when, on the case.",
        ],
      },
      {
        heading: "Drugs & alcohol and fatigue on the critical path",
        body: [
          "D&A screening sits on the investigation when the level or incident type requires it — breath, urine, blood or saliva, with consent and results, and follow-up actions where needed. Fatigue can be assessed against the shift pattern entered for that case, with a tenant-level FRMS view structured as Plan, Do, Check and Act.",
        ],
        bullets: [
          "**Mandatory or recommended D&A** driven by investigation level and incident type.",
          "**Shift pattern on the case** for fatigue context during the investigation.",
          "**FRMS workspace** for the tenant, separate from the individual case file.",
        ],
      },
      {
        heading: "Connected to Rail Intel CMS when you need it",
        body: [
          "Investigations and CMS stay separate products. When linked through Admin → API Management, a dual-approval token binds one Investigations company to one CMS tenant. You can then look up the employee under investigation, pull competency cycle status and recent medication declarations, and pick lead and team members from CMS team management and employee records.",
          "Roster and shift data for fatigue stay in Investigations — CMS does not supply them.",
        ],
        bullets: [
          "**Dual-approval CMS connector** so pairing is deliberate on both sides.",
          "**Subject lookup** with competency cycle (in date / due soon / overdue) and recent medications.",
          "**Lead and team** selectable from CMS people where the link is active.",
        ],
      },
      {
        heading: "Roles, tenants and assurance views",
        body: [
          "Workspaces are multi-tenant and entered with a company code. Roles cover System Admin, Company Admin, Lead Investigator, Investigator, HSSE and DCP, with capability overrides on top of the role baseline — the same idea as CMS permissions, tuned for investigation work.",
        ],
        bullets: [
          "**Reporting** for open / in review / closed mix, levels, incident types, RCA counts and sealed reports.",
          "**Recommendations and Compliance** sections for assurance oversight across the workspace.",
          "**Admin** for users, email templates, incident catalogue and the CMS API link.",
        ],
      },
    ],
  },
];

/* ---------------------------------------------------------------- add-ons */

export const addons = [
  {
    slug: "qa-verifications",
    name: "QA Verifications",
    moduleId: "qa-verifications",
    summary: "Automated compliance checks with an audit trail you can hand to the ORR.",
    tagline: "Prove compliance instead of asserting it",
    lead:
      "QA Verifications runs structured checks across an employee's competency, medical and licence data, scores every section, and keeps the run history as evidence. Instead of assembling a compliance picture by hand before an audit, you produce it on demand.",
    sections: [
      {
        heading: "Run a verification against live record data",
        body: [
          "A verification reads the employee's actual record — cycles, assessments, medicals, licence expiry and monitoring history — and evaluates each section against your configured criteria. Every check resolves to compliant, advisory, review or not applicable, so a partial pass is visible rather than hidden behind a single score.",
          "Runs are stored, not just displayed. The company-wide QA Verifications page keeps the full history with overall compliance rate, per-section breakdown and pass rates across employees, which is what an auditor actually asks to see.",
        ],
        bullets: [
          "**Section-level outcomes** so you can see precisely which part of a record failed.",
          "**Run history retained** per employee and company-wide, with the date and the assessor.",
          "**Compliance rate and pass rate** calculated across the latest run for every employee.",
          "**Derogations tracked separately** from advisories and reviews.",
        ],
        shots: [
          {
            src: "images/screens/verification/verification-run-overall.png",
            caption:
              "Company-wide run history with overall compliance rate and a stacked section breakdown by outcome.",
          },
        ],
      },
      {
        heading: "Configure what a check actually tests",
        body: [
          "The check configuration decides which sections are examined and how strict each one is, so verification reflects your standards rather than a generic template. Companies running different standards for drivers, instructors and managers can hold each to the right bar.",
        ],
        bullets: [
          "**Per-section configuration** of what is examined and what counts as a pass.",
          "**Permission-gated running** via `qa-verifications.run`, so only authorised staff can execute checks.",
          "**Launch from any employee record** once the module is active.",
        ],
        shots: [
          {
            src: "images/screens/verification/verification-config.png",
            caption: "Check configuration controls which sections are tested and how each is scored.",
          },
        ],
      },
    ],
  },

  {
    slug: "task-assignment",
    name: "Task assignment",
    moduleId: "task-assignment",
    summary: "Assign follow-up actions to people and tie them to an employee record.",
    tagline: "Close the loop after the finding",
    lead:
      "Findings are worthless if nobody actions them. Task assignment turns an observation into an owned, tracked action against a named person and, where relevant, a specific employee record — so the follow-up is visible instead of living in someone's inbox.",
    sections: [
      {
        heading: "Tasks with an owner, a status and a record",
        body: [
          "Every task has an assignee and a status, and can optionally be linked to the employee record it concerns. That link is what makes the task useful later: when you open a record you can see the outstanding actions attached to it, rather than searching email for what was agreed.",
          "Tasks appear both as a company-wide page under Administration and as a tab on the employee profile, so managers and record owners work from the same list.",
        ],
        bullets: [
          "**Assign to any user** in the company.",
          "**Optional employee link** so the action stays attached to the record.",
          "**Status tracking** from open through to completion.",
          "**Visible on the dashboard** as an open-task count.",
        ],
        shots: [
          {
            src: "images/screens/tasks/task-overview.png",
            caption: "Company-wide task list with assignee, linked employee and current status.",
          },
          {
            src: "images/screens/tasks/task-view-popup.png",
            caption: "Opening a task shows its detail, history and the record it relates to.",
          },
        ],
      },
      {
        heading: "Raising a task takes seconds",
        body: [
          "The point of the module is that creating an action is quick enough that people actually do it at the moment of the finding, not later.",
        ],
        shots: [
          {
            src: "images/screens/tasks/add-new-task.png",
            caption: "Creating a task: title, assignee, linked employee and due detail.",
          },
        ],
      },
    ],
  },

  {
    slug: "safety-briefs",
    name: "Safety Briefs",
    moduleId: "safety-briefs",
    summary: "Record who received which brief, in person or remotely, with evidence.",
    tagline: "Evidence that the brief actually landed",
    lead:
      "Issuing a safety brief is easy. Proving that a specific driver received it, when, and from whom is the part that fails an audit. Safety Briefs records attendance per employee with the delivery method and provider captured against the record.",
    sections: [
      {
        heading: "Attendance captured per employee",
        body: [
          "Each brief is recorded against the individual, not a distribution list. In-person briefings capture the provider's details; remote delivery records the method used. The result is a per-employee history you can filter and evidence, and a company-wide view of coverage.",
          "When the module is active, safety-brief coverage also surfaces in Reporting alongside your other compliance measures, so a gap in briefing shows up in the same place as a lapsed medical.",
        ],
        bullets: [
          "**Per-employee attendance** rather than a circulation list.",
          "**In-person or remote** delivery, with provider details captured for in-person briefs.",
          "**Company-wide management page** for issuing and reviewing briefs.",
          "**Feeds Reporting** so briefing coverage sits with your other compliance metrics.",
        ],
        shots: [
          {
            src: "images/screens/safety-briefs/employee-sboverview.png",
            caption: "Safety brief history on an employee record, showing delivery method and provider.",
          },
        ],
      },
    ],
  },

  {
    slug: "trainee-driver",
    name: "Trainee Driver",
    moduleId: "trainee-driver",
    summary: "Run a full trainee programme: schedules, train logs, hours and signed feedback.",
    tagline: "Manage the whole training programme, not just the hours",
    lead:
      "Rail Intel tracks trainee hours as standard. The Trainee Driver module is the layer above that: building schedules, enrolling trainees, recording attendance and train logs, capturing dual-signed feedback, and tracking route learning — the full programme rather than a running total.",
    note:
      "Core Rail Intel already includes trainee hours and daylight/darkness progress on the Experience Records tab. This module adds the programme management around it.",
    sections: [
      {
        heading: "Progress against the standard, per trainee",
        body: [
          "Trainee progress is measured against your configured company standards, including daylight and darkness minimums, so a trainee who has the hours but not the right conditions is visibly incomplete. Managers see the position across their trainees; the trainee sees their own.",
        ],
        bullets: [
          "**Hours against company standards**, split by daylight and darkness.",
          "**Manager view across trainees** and an individual view per person.",
          "**Retention and progress records** kept for the duration of the programme.",
          "**Performance & Support plans** become available on the Monitoring tab when this module is active.",
        ],
        shots: [
          {
            src: "images/screens/trainee-hours-manager-hours/manager-hours-overview.png",
            caption: "Manager view of hours and progress across every enrolled trainee.",
          },
          {
            src: "images/screens/trainee-hours-manager-hours/managerhours-progress.png",
            caption: "Progress tracking against the required totals for each trainee.",
          },
        ],
      },
      {
        heading: "Logging encounters and entries as they happen",
        body: [
          "Entries are recorded as the training happens, with confirmation before they are committed, so the log reflects reality rather than a reconstruction at the end of a placement.",
        ],
        shots: [
          {
            src: "images/screens/trainee-hours-manager-hours/add-encounters.png",
            caption: "Recording an encounter against a trainee's programme.",
          },
          {
            src: "images/screens/trainee-hours-manager-hours/recorded-entries.png",
            caption: "The running list of recorded entries for the trainee.",
          },
          {
            src: "images/screens/trainee-hours-manager-hours/add-entry-confirm.png",
            caption: "Entries are confirmed before they are committed to the log.",
          },
          {
            src: "images/screens/trainee-hours-manager-hours/trainee-progress-rention-records.png",
            caption: "Retention records held alongside progress for the trainee.",
          },
        ],
      },
    ],
  },

  {
    slug: "driver-reports",
    name: "Driver Reports",
    moduleId: "driver-reports",
    summary: "Signed operational reports from drivers, exportable to your investigations system.",
    tagline: "Capture the driver's account while it is fresh",
    lead:
      "Driver Reports captures a structured, signed account of an operational event — turn, headcode, conditions and narrative — on the driver's own record. Because the report is structured rather than free text in an email, it can be reported on and exported to an investigations system.",
    sections: [
      {
        heading: "A structured report, signed by the driver",
        body: [
          "The form captures the operational context alongside the narrative, so a report is usable as evidence later rather than an unattributed paragraph. Reports are held on the employee record and synchronise company-wide for management review.",
          "Where the Investigations connector is configured, the API supports exporting reports into that system, so the driver's account reaches the investigation without being re-keyed.",
        ],
        bullets: [
          "**Operational context captured**: turn, headcode and conditions alongside the narrative.",
          "**Signed by the driver** and retained on their record.",
          "**Company-wide overview** for managers reviewing submitted reports.",
          "**Exportable to Investigations** where that connector is active.",
        ],
        shots: [
          {
            src: "images/screens/driver-reports/driver-report-overview.png",
            caption: "Company-wide overview of submitted driver reports.",
          },
          {
            src: "images/screens/driver-reports/driver-report-form.png",
            caption: "The report form captures operational context as structured fields.",
          },
          {
            src: "images/screens/driver-reports/submitted-report.png",
            caption: "A submitted report as it is retained against the driver's record.",
          },
        ],
      },
    ],
  },

  {
    slug: "leave-absence",
    name: "Leave & Absence",
    moduleId: "leave-absence",
    summary: "Entitlements, sickness and absence with manager approval and a full audit trail.",
    tagline: "Absence that reconciles with competence",
    lead:
      "Absence matters in a safety-critical setting because it interacts with competence: a driver returning from long-term sickness may need reassessment before signing on. Leave & Absence tracks entitlements and absence with an approval workflow, and keeps the record next to the competency data rather than in a separate HR system.",
    sections: [
      {
        heading: "Entitlements and balances per employee",
        body: [
          "Each employee has an entitlement for the leave year with the balance maintained as requests are approved. Anyone in the company can raise a request when the module is active; managers approve and manage according to their permissions.",
        ],
        bullets: [
          "**Annual leave entitlement and balance** maintained per employee.",
          "**Sickness and other absence types** tracked alongside leave.",
          "**Assessing-manager approval workflow** with email notification.",
          "**Full audit trail** retained on the employee record.",
        ],
        shots: [
          {
            src: "images/screens/leave-absence/leave-absence-overview.png",
            caption: "Leave and absence overview across the company.",
          },
          {
            src: "images/screens/leave-absence/leave-absence-entitlements.png",
            caption: "Entitlements and remaining balance per employee.",
          },
        ],
      },
      {
        heading: "Leave year policy and reporting",
        body: [
          "The leave year and its policy are configurable, so the module reflects how your organisation actually operates. Reporting shows absence patterns across the company, and each employee record carries its own summary.",
        ],
        shots: [
          {
            src: "images/screens/leave-absence/leave-absence-year-policy.png",
            caption: "Leave year and policy configuration.",
          },
          {
            src: "images/screens/leave-absence/leave-absence-reporting.png",
            caption: "Absence reporting across the company.",
          },
          {
            src: "images/screens/leave-absence/employee-leave-record-summary.png",
            caption: "The leave and absence summary held on an individual employee record.",
          },
        ],
      },
    ],
  },

  {
    slug: "medication-checks",
    name: "Medication Checks",
    moduleId: "medication-checks",
    summary: "Medication declarations and occupational health checks on the medical record.",
    tagline: "Declarations that reach the right people",
    lead:
      "Medication can affect fitness to work, and a declaration that sits in an email is not a control. Medication Checks adds declaration and occupational-health check workflows to the medical record, including optional employee self-submission for manager review.",
    note:
      "The Medical tab and company Medicals page are core Rail Intel. This module adds the medication declaration and OH check workflows on top of them.",
    sections: [
      {
        heading: "Declarations, OH outcomes and attachments",
        body: [
          "Declarations are recorded against the employee's medical record, so the medication position sits with the fitness position rather than apart from it. Occupational health outcomes and supporting report attachments are held alongside.",
          "Employees can optionally submit their own declaration for manager review, which keeps the process moving without requiring a manager to transcribe it.",
        ],
        bullets: [
          "**Medication declarations** recorded against the medical record.",
          "**Occupational health outcomes** captured with the declaration.",
          "**Report attachments** stored with the check.",
          "**Optional employee self-submission** routed to a manager for review.",
        ],
        shots: [
          {
            src: "images/screens/medical/medical-orrdoc-list-names.png",
            caption: "ORR medical documentation held against employee records.",
          },
          {
            src: "images/screens/medical/mecical-psychologist-list-names.png",
            caption: "Occupational health and psychologist records alongside the medical history.",
          },
        ],
      },
    ],
  },
];

/* --------------------------------------------------------- capacity add-ons */

export const capacityAddons = [
  {
    name: "Company Admin Licences",
    moduleId: "company-admin-licences",
    summary:
      "Every company includes two administrator seats. Additional seats are purchased by quantity and managed in Team Management.",
  },
  {
    name: "Storage Plus",
    moduleId: "storage-plus",
    summary:
      "The platform includes a 1 TB storage baseline. Storage Plus plans add capacity in 100 GB to 1 TB increments for companies holding large volumes of documents and evidence.",
  },
];

/* --------------------------------------------------------- core feature set */

export const featureGroups = [
  {
    slug: "tunnel-mode",
    name: "Tunnel Mode",
    summary: "Dark, dimmable assessing that cuts windscreen glare in tunnels and at night.",
    tagline: "Assess in the cab without lighting up the windscreen",
    lead:
      "A bright tablet in a dark cab is a distraction — for the driver and for the assessor. Tunnel Mode is the assessor switching dark mode on and dimming the screen on mobile or tablet. It does not detect the tunnel automatically; the person in the cab decides when the glass is too bright.",
    sections: [
      {
        heading: "Built for the cab, not the office",
        body: [
          "When an assessment starts, Rail Intel reminds assessors that windscreen reflections matter — especially through tunnels — and offers dark mode in one tap. The Dark / Light control sits in the assessment header, so switching never means leaving the flow.",
          "On mobile and tablet, a brightness slider sits under the header. Dim the screen from full daylight down to a soft cab-friendly level, and reset it when you are out of the tunnel. Both controls are manual: the tablet does not read the ambient light and switch on its own.",
        ],
        bullets: [
          "**One-tap dark mode** from the assessment header, kept for the session.",
          "**Dimmable brightness** on mobile and tablet (40% to 135%), set by the assessor.",
          "**Cab safety notice** at the start of an assessable event, with a direct Turn on dark mode action.",
          "**App-wide dark theme** available from the user menu when you are not assessing.",
        ],
        shots: [
          {
            src: "images/screens/assessing/dark-switch-safety.png",
            caption:
              "The cab safety notice: switch to dark mode to reduce windscreen glare in tunnels.",
          },
        ],
      },
    ],
  },

  {
    slug: "competency-cycles",
    name: "Competency & Cycles",
    summary: "Build assessment cycles, run assessments in the field and carry findings forward.",
    tagline: "The competency engine",
    lead:
      "Competence is a live cycle with a start date, an expiry and evidence — not a document store. Rail Intel's cycle engine builds the standard, schedules the assessments, records them in the field and flags the moment a mandatory competency lapses.",
    sections: [
      {
        heading: "Build a cycle from a template or from scratch",
        body: [
          "Cycle Builder walks through the cycle in four steps: method, details, criteria and events. Start from a ready-made framework or build a custom cycle for a role your operation defines itself.",
        ],
        bullets: [
          "**Templates or custom cycles** for any role.",
          "**Competency criteria** attached to each cycle.",
          "**Scheduled assessment events** across the cycle period.",
          "**Two-year driver cycles and one-year PTS** supported as standard.",
        ],
        shots: [
          {
            src: "images/screens/cycle-builder/cycle-builder-overview.png",
            caption: "Cycle Builder: choose a template or build a custom competency cycle.",
          },
          {
            src: "images/screens/cycle-builder/use-template-cb.png",
            caption: "Starting from a ready-made template.",
          },
          {
            src: "images/screens/cycle-builder/add-competency-criteria.png",
            caption: "Attaching competency criteria to the cycle.",
          },
          {
            src: "images/screens/cycle-builder/schedule-events-assessment.png",
            caption: "Scheduling the assessment events that make up the cycle.",
          },
        ],
      },
      {
        heading: "Live cycles on the employee record",
        body: [
          "Once assigned, a cycle is live on the employee record with its start and expiry. Only one live cycle of a given type is allowed at a time, so the record cannot drift into ambiguity. Closing a cycle moves it to closed cycles and keeps the history.",
          "Continuous cycles are supported for competencies that renew rather than end, and a CDP can carry over between cycles so an open development point is not lost at the boundary.",
        ],
        shots: [
          {
            src: "images/screens/cycles/current-cycles.png",
            caption: "Live cycles on an employee record with start and expiry dates.",
          },
          {
            src: "images/screens/cycles/individual-cycle-view.png",
            caption: "An individual cycle with its scheduled events and progress.",
          },
          {
            src: "images/screens/cycles/continuous-cycles.png",
            caption: "Continuous cycles for competencies that renew rather than expire.",
          },
          {
            src: "images/screens/cycles/cont-cycle-cdp-carryover.png",
            caption: "A development point carried over into the next cycle.",
          },
        ],
      },
      {
        heading: "Assessing in the field",
        body: [
          "Assessments are completed against structured criteria with observations recorded as they are made. Where an observation falls short, the criterion is flagged rather than silently passed, and the assessment can be started within its early window when operationally necessary.",
        ],
        shots: [
          {
            src: "images/screens/assessing/assessing-criteria.png",
            caption: "Assessing against structured criteria.",
          },
          {
            src: "images/screens/assessing/flagged-based-on-observations.png",
            caption: "Criteria flagged on the basis of recorded observations.",
          },
          {
            src: "images/screens/assessing/early-window-start-assessment.png",
            caption: "Starting an assessment within its early window.",
          },
        ],
      },
      {
        heading: "The standards behind the cycle",
        body: [
          "Cycles are only as good as the standard behind them. Frameworks, grading scales and company timing standards are configured once and applied across every cycle you run.",
        ],
        shots: [
          {
            src: "images/screens/comp-config/framework-apply-cycles.png",
            caption: "Applying a competency framework across cycles.",
          },
          {
            src: "images/screens/comp-config/grade-scale.png",
            caption: "The grading scale used by assessors.",
          },
          {
            src: "images/screens/comp-config/set-company-standards.png",
            caption: "Company standards for assessment and competence.",
          },
          {
            src: "images/screens/main-sys/timings-standards.png",
            caption: "Timing standards including trainee daylight and darkness minimums.",
          },
        ],
      },
    ],
  },

  {
    slug: "workforce-records",
    name: "Workforce Records",
    summary: "The employee record: cab passes, training, experience, documents and messaging.",
    tagline: "One record per person, not six systems",
    lead:
      "Every safety-critical person has one record holding their status, competence, passes, training, experience and documentation. When you need to answer whether someone is safe to work, the answer is in one place.",
    sections: [
      {
        heading: "The employee directory",
        body: [
          "The directory lists your safety-critical personnel with role, depot, status and company, and opens straight into the record. Access is permission-controlled, and drivers with own-record-only access see their own record instead of the directory.",
        ],
        shots: [
          {
            src: "images/screens/main-sys/employee-list.png",
            caption: "The employee directory with role, depot and status.",
          },
        ],
      },
      {
        heading: "Cab passes",
        body: [
          "Cab pass authority and validity are held on the record, with issue and colour tracked so the pass in someone's pocket matches the pass in the system.",
        ],
        shots: [
          {
            src: "images/screens/cab-passes/cab-passes.png",
            caption: "Cab pass register on the employee record.",
          },
          {
            src: "images/screens/cab-passes/green-pass-issued.png",
            caption: "An issued pass with its validity and status.",
          },
          {
            src: "images/screens/cab-passes/issue-colour-question-popup.png",
            caption: "Issuing a pass and recording its colour classification.",
          },
        ],
      },
      {
        heading: "Training, qualifications and experience",
        body: [
          "Training records and qualifications are held with their provider and expiry, so a lapsing qualification is visible before it becomes a problem. Experience Records track driving experience and trainee hours, including daylight and darkness progress against your company standards.",
        ],
        shots: [
          {
            src: "images/screens/training-quals/training-quals-overview.png",
            caption: "Training records and qualifications with expiry and provider.",
          },
          {
            src: "images/screens/training-quals/add-new-training.png",
            caption: "Adding a training record.",
          },
          {
            src: "images/screens/training-quals/add-qual.png",
            caption: "Adding a qualification.",
          },
          {
            src: "images/screens/trainee-hours-manager-hours/trainee-hours-experience.png",
            caption: "Experience records with trainee hours against the company standard.",
          },
          {
            src: "images/screens/trainee-hours-manager-hours/overall-progress-trainee.png",
            caption: "Overall progress for a trainee across their required hours.",
          },
        ],
      },
      {
        heading: "Documents and messaging",
        body: [
          "Supporting evidence is uploaded against the record and counts against your company storage quota. Messaging and notes keep the conversation about a record attached to it, with email notification when a new message is raised.",
        ],
        shots: [
          {
            src: "images/screens/main-sys/document-upload-area.png",
            caption: "Uploading supporting documentation to an employee record.",
          },
          {
            src: "images/screens/messaging-employee/employee-messaging.png",
            caption: "Messaging threads held against the employee record.",
          },
          {
            src: "images/screens/messaging-employee/email-notify-new-message.png",
            caption: "Email notification when a new message is raised.",
          },
        ],
      },
    ],
  },

  {
    slug: "medicals-licensing",
    name: "Medicals & Licensing",
    summary: "Medical fitness, ORR medicals, driving licences and complementary certificates.",
    tagline: "Expiry is a date, not an opinion",
    lead:
      "Medical fitness and licensing are the hardest stops in the safety case: if either has expired, the person does not sign on. Rail Intel holds both as dated records with expiry monitoring, so the stop is enforced by the system rather than remembered by a person.",
    sections: [
      {
        heading: "Medical records and fitness status",
        body: [
          "Medical records carry fitness status, the issuing clinician and the expiry date. A status of unfit or an expired medical marks the employee as not safe to work, which surfaces on the dashboard and in reporting rather than waiting to be noticed.",
          "The company Medicals page gives the position across the workforce, including which medicals are due within the next 30 days.",
        ],
        shots: [
          {
            src: "images/screens/medical/new-medical-record.png",
            caption: "Recording a new medical for occupational health and ORR medicals.",
          },
        ],
      },
      {
        heading: "Driving licences and categories",
        body: [
          "Train driving licences are held with the front and back images, licence number, issue and expiry dates and the categories carried. Renewal warnings appear ahead of expiry with the number of days remaining.",
        ],
        shots: [
          {
            src: "images/screens/licencing/licence1.png",
            caption: "Train driving licence record with images, number and expiry.",
          },
          {
            src: "images/screens/licencing/licence-categories.png",
            caption: "The categories carried on the licence.",
          },
        ],
      },
      {
        heading: "Complementary certificates",
        body: [
          "The complementary certificate (Part B) is held alongside the licence, covering the infrastructure, traction and routes the driver is certified for.",
        ],
        shots: [
          {
            src: "images/screens/licencing/comp-cert1.png",
            caption: "Complementary certificate details held with the licence.",
          },
          {
            src: "images/screens/licencing/comp-cert2.png",
            caption: "Certificate coverage across traction and routes.",
          },
        ],
      },
    ],
  },

  {
    slug: "incidents-monitoring",
    name: "Incidents & Monitoring",
    summary: "Record incidents, allocate them to people and manage development plans.",
    tagline: "From incident to competence, in one thread",
    lead:
      "An incident is only closed when the competence question behind it has been answered. Rail Intel links incidents to the people involved and to the development plans raised as a result, so the thread from event to resolution stays intact.",
    sections: [
      {
        heading: "Recording and managing incidents",
        body: [
          "Incidents are recorded company-wide with type, severity, date and the action taken, then allocated to the employees involved. The management list gives the operational picture; the employee record shows what is allocated to that individual.",
        ],
        shots: [
          {
            src: "images/screens/main-sys/record-new-incident.png",
            caption: "Recording a new incident with type, severity and action taken.",
          },
          {
            src: "images/screens/main-sys/incidebt-management-list.png",
            caption: "The company-wide incident management list.",
          },
          {
            src: "images/screens/monitor-plans-incidents/incidents-allocated.png",
            caption: "Incidents allocated to a specific employee.",
          },
        ],
      },
      {
        heading: "Monitoring and competence development plans",
        body: [
          "The Monitoring tab holds performance monitoring and the competence development plans raised against an employee. A CDP records what needs to improve, what was agreed and whether it was completed — and can carry over into the next cycle if it is still open.",
        ],
        shots: [
          {
            src: "images/screens/monitor-plans-incidents/monitor-incident-overview.png",
            caption: "Monitoring overview with allocated incidents and development plans.",
          },
          {
            src: "images/screens/monitor-plans-incidents/cdp-plan-overview.png",
            caption: "Competence development plan overview for the employee.",
          },
        ],
      },
      {
        heading: "Performance and support plans",
        body: [
          "Where a person needs additional support, a performance and support plan is raised, signed by both trainer and trainee, and tracked to completion. Plans are available on the Monitoring tab when the Trainee Driver module is active.",
        ],
        shots: [
          {
            src: "images/screens/monitor-plans-incidents/add-performance-support-plans.png",
            caption: "Raising a performance and support plan.",
          },
          {
            src: "images/screens/monitor-plans-incidents/plan-page.png",
            caption: "The plan detail with agreed actions.",
          },
          {
            src: "images/screens/monitor-plans-incidents/submitted-plan.png",
            caption: "A submitted plan retained against the record.",
          },
        ],
      },
    ],
  },

  {
    slug: "reporting-administration",
    name: "Reporting & Administration",
    summary: "Analytics across the operation, plus the configuration that makes it yours.",
    tagline: "The state of the railway's people, on demand",
    lead:
      "Reporting turns the record set into the answer to a board question: how many people are off track, how many medicals expire this quarter, where are incidents concentrated. Administration is where the organisation, roles, traction and routes behind those numbers are defined.",
    sections: [
      {
        heading: "Reporting and analytics",
        body: [
          "The reporting dashboard covers incidents, monitoring, medicals and competencies with totals, trends over time and breakdowns by type and role. Where add-on modules are active, safety-brief coverage and QA compliance rates appear alongside them.",
        ],
        bullets: [
          "**Live counts** for on-track, off-track, overdue and due-soon.",
          "**Incident trends** over time and by type.",
          "**Medical and competency expiry** windows.",
          "**Add-on aware**: safety-brief and QA verification metrics appear when those modules are active.",
        ],
        shots: [
          {
            src: "images/screens/main-sys/reporting-analytics1.png",
            caption: "Reporting and analytics with incident KPIs and compliance counts.",
          },
          {
            src: "images/screens/main-sys/reporting-analytics2.png",
            caption: "Trends and breakdowns across incidents and competence.",
          },
        ],
      },
      {
        heading: "Organisation structure and roles",
        body: [
          "Your organisation structure, custom job roles and role permissions determine who sees and does what. Permissions are granular, so an assessor, a manager and a system administrator each get exactly the access their role requires.",
        ],
        shots: [
          {
            src: "images/screens/comp-config/org-structure.png",
            caption: "Organisation structure configuration.",
          },
          {
            src: "images/screens/comp-config/configure-company-role-permissions.png",
            caption: "Configuring permissions for a company role.",
          },
          {
            src: "images/screens/main-sys/role-permissions-configure.png",
            caption: "Granular permission assignment across the platform.",
          },
        ],
      },
      {
        heading: "Traction, routes and depots",
        body: [
          "Traction types, routes and depots are configured once and then used across route competence, complementary certificates and assessment records, so the vocabulary is consistent everywhere it appears.",
        ],
        shots: [
          {
            src: "images/screens/train-routes/traction-route-overview.png",
            caption: "Traction and route overview for the company.",
          },
          {
            src: "images/screens/train-routes/add-traction.png",
            caption: "Adding a traction type.",
          },
          {
            src: "images/screens/train-routes/add-route.png",
            caption: "Adding a route.",
          },
          {
            src: "images/screens/comp-config/set-traction-routes-depots.png",
            caption: "Traction, routes and depots configuration.",
          },
        ],
      },
      {
        heading: "Modules and integrations",
        body: [
          "Optional modules are activated from the Add-ons library, and the Investigations connector links Rail Intel to an external investigations system where one is in use.",
        ],
        shots: [
          {
            src: "images/screens/main-sys/addons-page.png",
            caption: "The Add-ons page where optional modules are activated.",
          },
          {
            src: "images/screens/comp-config/addons-library.png",
            caption: "The add-ons library with available modules.",
          },
          {
            src: "images/screens/comp-config/investigation-apimanagement.png",
            caption: "Investigations API connector management.",
          },
        ],
      },
    ],
  },

  {
    slug: "digital-cab-passes",
    name: "Digital Cab Passes",
    summary: "Issue driving cab passes with colour status and QR verification anyone can scan.",
    tagline: "Digital cab passes with QR verification",
    lead:
      "Cab authority is held on the employee record as a standard driving cab pass. Issue a digital pass and a QR code appears beside the photo — scan it to open the live pass in a browser with no sign-in.",
    sections: [
      {
        heading: "Issue digital cab passes with QR verification",
        body: [
          "Cab passes live on the employee record in standard driving cab pass layout. Choose a colour, complete the issue form, and save a digital pass with a QR anyone can scan — no sign-in required.",
        ],
        bullets: [
          "**Colour-coded authority** — green, yellow, blue, red or black.",
          "**Digital issue with QR** for public verification without a login.",
          "**Email the pass** to the employee with a view link.",
          "**Edit, renew, revoke or delete** from the pass preview.",
        ],
        shotGrid: "gallery",
        shots: [
          {
            src: "images/screens/cab-passes/cab-passes-dark.png",
            title: "Passes on the employee record",
            lede: "Issued passes sit under Cab Passes with colour status, QR verification and renew / revoke controls.",
            caption: "Two digital passes on one record — including an expired blue pass and a live green assess pass.",
            scale: 1,
          },
          {
            src: "images/screens/cab-passes/issue-colour-question-popup-dark.png",
            title: "Choose the pass colour",
            lede: "Nothing is created until you confirm. Pick green, yellow, blue, red or black to match the authority you are issuing.",
            caption: "Colour selection before the pass is created.",
            scale: 1,
          },
          {
            src: "images/screens/cab-passes/issue-form-dark.png",
            title: "Complete the issue form",
            lede: "Set validity dates, routes, endorsements and the issuer signature in the same flow as a standard driving cab pass.",
            caption: "Issue form — colour, validity, routes, endorsements and signature.",
            scale: 1,
          },
          {
            src: "images/screens/cab-passes/issue-digital-pass-email-dark.png",
            title: "Issue digitally and email",
            lede: "Save the pass for public QR verification and send the employee the front, reverse and a link to view it.",
            caption: "Confirm digital issue and email delivery.",
            scale: 1,
          },
          {
            src: "images/screens/cab-passes/green-pass-issued-dark.png",
            title: "Scan to verify — no login",
            lede: "The QR sits beside the card preview. Anyone can open the live pass in a browser without a Rail Intel account.",
            caption: "Issued green driving cab pass with SCAN TO VERIFY.",
            scale: 1,
          },
          {
            src: "images/screens/cab-passes/pass-preview-actions-dark.png",
            title: "Manage from the preview",
            lede: "Expand, edit, view, renew, revoke or delete without leaving the Cab Passes tab.",
            caption: "Pass preview actions.",
            scale: 1,
          },
          {
            src: "images/screens/cab-passes/expired-pass-issued-dark.png",
            title: "Expired status stays visible",
            lede: "Expired passes remain on the record with status clear at a glance, so history is never lost.",
            caption: "Expired pass with SCAN TO VERIFY still available for audit.",
            scale: 1,
          },
        ],
      },
    ],
  },

  {
    slug: "languages",
    name: "Languages",
    summary: "Run Rail Intel in English, Spanish, French, Welsh, Italian, German or Arabic.",
    tagline: "International language support",
    lead:
      "Assessors, managers and administrators can work in the language that suits their team. Choose a language at sign-in, or switch anytime from the header.",
    sections: [],
  },
];

/* --------------------------------------------------------------- languages */

export const languages = {
  heading: "Supported languages",
  lead:
    "The interface — including login and in-app chrome — can be switched without changing your company data. Each tile shows the language in its own wording.",
  items: [
    {
      code: "en",
      flag: "gb",
      name: "English",
      nativeName: "English",
      summary:
        "Default language for Rail Intel — full UI coverage across assessing, records and administration.",
    },
    {
      code: "es",
      flag: "es",
      name: "Spanish",
      nativeName: "Español",
      summary:
        "Interfaz completa en español para evaluadores y administradores que trabajan junto a equipos de habla inglesa.",
    },
    {
      code: "fr",
      flag: "fr",
      name: "French",
      nativeName: "Français",
      summary:
        "Interface en français pour les évaluations en cabine, les revues de conformité et l’administration.",
    },
    {
      code: "cy",
      flag: "cy",
      name: "Welsh",
      nativeName: "Cymraeg",
      summary:
        "Cymorth rhyngwyneb Cymraeg ar gyfer timau rheilffordd dwyieithog yng Nghymru.",
    },
    {
      code: "it",
      flag: "it",
      name: "Italian",
      nativeName: "Italiano",
      summary:
        "Interfaccia in italiano per valutazione, anagrafiche e amministrazione sulla piattaforma Rail Intel.",
    },
    {
      code: "de",
      flag: "de",
      name: "German",
      nativeName: "Deutsch",
      summary:
        "Deutsche Benutzeroberfläche für Kompetenzmanagement und Sicherheitsabläufe.",
    },
    {
      code: "ar",
      flag: "ar",
      name: "Arabic",
      nativeName: "العربية",
      summary:
        "ترجمات واجهة بالعربية مع واجهة منتج ثابتة من اليسار إلى اليمين للفرق متعددة اللغات.",
    },
  ],
};

/* ------------------------------------------------------------- how it works */

export const howItWorks = {
  title: "How Rail Intel works",
  lead:
    "Rail Intel replaces the spreadsheet that tracks who is competent with a live system of record. Here is what implementation actually looks like.",
  steps: [
    {
      heading: "Configure your standard",
      body:
        "Set up your organisation structure, job roles, grading scale, traction, routes and depots, and the timing standards your operation works to. This is the vocabulary everything else uses.",
    },
    {
      heading: "Build your competency cycles",
      body:
        "Use Cycle Builder to create the cycles each role must complete — from a template or from scratch — with their criteria and scheduled assessment events.",
    },
    {
      heading: "Load your people",
      body:
        "Create employee records with their licences, medicals, cab passes, training and experience. Each person ends up with one record covering everything that determines whether they can sign on.",
    },
    {
      heading: "Assess in the field",
      body:
        "Assessors work against structured criteria, recording observations as they are made. Findings that fall short are flagged, and a competence development plan can be raised on the spot.",
    },
    {
      heading: "Monitor and act",
      body:
        "The dashboard shows who is on track, off track, overdue or due soon. Expired medicals and lapsed mandatory competencies mark a person as not safe to work before they reach the railway.",
    },
    {
      heading: "Evidence it",
      body:
        "Reporting gives the position across the workforce, and the QA Verifications module produces per-employee compliance evidence with a retained run history for audit.",
    },
  ],
};

/* ----------------------------------------------------------------- security */

export const security = {
  title: "Security built for rail operations",
  lead:
    "Rail Intel protects competency, medical and safety records with company-scoped access, two-factor authentication and hosting on Microsoft Azure.",
  access: {
    heading: "Access control",
    lead: "Every sign-in is tied to a company and a named user. Access is logged, and permissions follow the roles your operation defines.",
    items: [
      {
        title: "Company codes",
        body: "Users sign in with a company code, email and password. Tenants stay isolated — one operator cannot see another’s records.",
      },
      {
        title: "Role-based permissions",
        body: "What a person can view or change follows their role and any custom permissions your administrators set.",
      },
      {
        title: "Logged access",
        body: "Sign-in and sensitive actions are attributable. The product is built for authorised personnel only — all access is logged.",
      },
      {
        title: "Session tokens",
        body: "Successful authentication issues a signed session token. Credentials and tokens remain the responsibility of each user to safeguard.",
      },
    ],
  },
  twoFactor: {
    heading: "Two-factor authentication (2FA)",
    lead:
      "When 2FA is required, a correct password is not enough. Rail Intel challenges for a second factor before a session is issued.",
    methods: [
      {
        title: "Authenticator app (TOTP)",
        body: "Users enrol an authenticator such as Microsoft Authenticator or Google Authenticator. A time-based code completes sign-in. Secrets are encrypted at rest.",
      },
      {
        title: "Email verification codes",
        body: "Where enabled, a six-digit code is sent to the user’s email. Codes can be resent from the sign-in challenge. SMTP must be configured for this method.",
      },
      {
        title: "Trusted devices (14 days)",
        body: "After a successful 2FA challenge, users may trust that browser for 14 days so later password logins can skip the second factor. System administrators never skip. Trust is revoked when the password changes, when an administrator resets the authenticator, when the device is removed, when the 14-day window expires, or when the sign-in location no longer matches (country, or coarse network if country is unknown).",
      },
    ],
    rules: [
      {
        heading: "Policy is administered centrally",
        body: "System administrators manage 2FA from Administration → Security: authenticator on or off, email codes on or off, and company or user method overrides. Users cannot turn the requirement off themselves.",
      },
      {
        heading: "Enrolment at sign-in",
        body: "If authenticator 2FA is required and the user has not enrolled yet, they are guided through QR setup on the next sign-in before access is granted.",
      },
      {
        heading: "When trusted status ends",
        body: "A trusted device only skips 2FA while the cookie is valid, the last MFA was within 14 days, and the location still matches. A password change, authenticator reset, revoked device, expired trust, or a change of country / network forces a fresh 2FA challenge.",
      },
      {
        heading: "Administrator reset and backup codes",
        body: "Administrators can reset a user’s authenticator; the user enrols again on the next sign-in if 2FA is still required. Re-enrolment needs the current authenticator or a backup code so a lost phone cannot silently replace a working second factor.",
      },
    ],
  },
  azure: {
    heading: "Hosted on Microsoft Azure",
    lead:
      "The Rail Intel application runs on Azure App Service with Azure Database for PostgreSQL and Azure Blob Storage for documents — so platform security inherits Azure’s enterprise controls.",
    items: [
      {
        title: "Azure App Service",
        body: "The application is deployed to Azure App Service with HTTPS. Microsoft manages the underlying host patching and regional availability.",
      },
      {
        title: "Azure Database for PostgreSQL",
        body: "Operational data is stored in Azure PostgreSQL with TLS required for database connections (`sslmode=require`). Backups and storage sit inside Azure’s managed database service.",
      },
      {
        title: "Encryption in transit and at rest",
        body: "Client traffic uses HTTPS. Database connections use TLS. Authenticator secrets (and related credentials) are encrypted at rest with AES-256-GCM. Azure encrypts managed disks and storage by default.",
      },
      {
        title: "Azure Blob Storage for files",
        body: "Employee documents, OH reports, training files, logos and profile photos are stored in Azure Blob Storage under company-scoped paths — not on the local app disk in production.",
      },
      {
        title: "Network and platform protections",
        body: "Azure provides DDoS protection at the platform edge, identity and access management for the subscription, and continuous security updates to the hosting stack.",
      },
      {
        title: "Azure compliance portfolio",
        body: "By hosting on Azure, Rail Intel sits on infrastructure that Microsoft maintains under widely recognised certifications (including ISO and SOC programmes). Ask us for the current region and any customer-specific compliance needs.",
      },
    ],
  },
  closing: {
    heading: "Questions about security?",
    lead: "We can walk through 2FA policy, Azure regions and how access is controlled for your company before you go live.",
  },
  heroAside: {
    eyebrow: "Cloud hosting",
    title: "Hosted on Microsoft Azure",
    body: "App Service, Azure Database for PostgreSQL and Blob Storage — on infrastructure Microsoft maintains under its Azure compliance programme.",
    note: "These marks describe Microsoft Azure platform certifications. They do not imply a separate Microsoft partner badge for Rail Intel.",
    badges: [
      { src: "images/security/iso-27001.svg", label: "ISO 27001" },
      { src: "images/security/soc-2.svg", label: "SOC 2" },
      { src: "images/security/iso-27017.svg", label: "ISO 27017" },
      { src: "images/security/iso-27018.svg", label: "ISO 27018" },
    ],
  },
};
