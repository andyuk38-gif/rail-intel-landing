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
  footerTagline:
    "Rail Intel is a suite of digital products for rail, built by a rail professional for the industry.",
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
    seoTitle: "Rail Investigations Software | Rail Intel Investigations",
    seoDescription:
      "Evidence-first rail investigation software for cases, RCA, recommendations, actions and sealed final reports — with optional CMS competency context.",
    seoKeywords: "rail investigations software, incident investigation rail, RCA rail, ORR investigation evidence",
    summary:
      "Evidence-first rail investigations — from opening a case through recommendations, actions and a sealed final report.",
    tagline: "Investigate with evidence, not email threads",
    lead:
      "Rail Intel Investigations is a standalone app for running investigations end to end: one file per case, with a command centre, structured evidence and RCA, recommendations that become owned actions, and a signed final report. Link it to Rail Intel CMS when you want competency and workforce context on the subject without leaving the investigation.",
    faq: [
      {
        question: "Is Rail Intel Investigations separate from CMS?",
        answer:
          "Yes. Investigations is a standalone app. An optional connector links one Investigations company to one CMS tenant when you want shared people and competency context.",
      },
      {
        question: "Can final reports be signed and sealed?",
        answer:
          "Yes. The final report compiles case artefacts for PDF export with dual sign-off from the Lead Investigator and Designated Competent Person.",
      },
    ],
    relatedLinks: [
      { name: "Rail Intel CMS", href: "" },
      { name: "Competency & Cycles", href: "features/competency-cycles.html" },
      { name: "Security", href: "security.html" },
    ],
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

/** Standalone apps coming soon — shown in the footer without links until pages exist. */
export const upcomingProducts = {
  label: "New for 2027/28",
  items: ["Operations Control Center", "Rostering", "Assessment Hub", "Standards Document Control Center"],
};

/* ---------------------------------------------------------------- add-ons */

export const addons = [
  {
    slug: "qa-verifications",
    name: "QA Verifications",
    moduleId: "qa-verifications",
    seoTitle: "QA Verifications for Rail | Automated Compliance Checks",
    seoDescription:
      "Run automated QA verifications across competency, medical and licence data with section-level outcomes and audit-ready run history for rail operators.",
    seoKeywords: "rail QA verification, compliance checks rail, ORR audit evidence, competence verification",
    summary: "Automated compliance checks with an audit trail you can hand to the ORR.",
    tagline: "Prove compliance instead of asserting it",
    lead:
      "QA Verifications runs structured checks across an employee's competency, medical and licence data, scores every section, and keeps the run history as evidence. Instead of assembling a compliance picture by hand before an audit, you produce it on demand.",
    heroExtra:
      "Any compliance issues are live and produced in real time on your dashboard. As a manager, any individual assigned to your team is purely a reflection on your dashboard stats.",
    hideHeroActions: true,
    hideModuleId: true,
    faq: [
      {
        question: "What does QA Verifications check?",
        answer:
          "It evaluates live employee record data — competency cycles, assessments, medicals, licence expiry and monitoring history — against configured criteria with section-level outcomes.",
      },
      {
        question: "Can I use QA Verifications for external audits?",
        answer:
          "Yes. Run history is retained per employee and company-wide with compliance rates and section breakdowns, so you can produce evidence on demand rather than assembling it manually.",
      },
      {
        question: "Can I see compliance when I forget to run a report?",
        answer:
          "Yes. Compliance is not only visible when you run a formal verification. As record data changes, issues surface on the manager dashboard in real time — advisory and review items, lapsed competencies and other findings appear in the live feed for your team, so you can see where you stand without waiting for a scheduled check.",
      },
      {
        question: "What if I do not want a particular element checked?",
        answer:
          "Check configuration is flexible and available to company administrators only. Each built-in check and report section can be switched on or off to match your company's standards. Anything switched off is not evaluated at run time and does not appear on the verification report, so the outcome reflects only what your organisation has chosen to test.",
      },
      {
        question: "How do I add the QA Verifications module?",
        answer: [
          "QA Verifications is activated from the Add-ons library inside Rail Intel CMS. Sign in as a company administrator, open Administration from the main navigation, then select Add-ons. In the library, locate the QA Verifications Module tile and choose Activate — or start a 14-day trial where offered.",
          "The module is enabled for your company only; once active, verification checks are available from employee records and the company-wide QA Verifications page.",
        ],
        shot: {
          src: "images/screens/verification/qa-verifications-addon-tile.png",
          alt: "QA Verifications Module tile on the Add-ons page with an Activate control.",
          caption: "The QA Verifications Module tile in the Add-ons library.",
          scale: 1,
          full: true,
          noExpand: true,
          bordered: true,
        },
      },
    ],
    heroVideo: {
      src: "video/ScanningEmployeeRecord.mp4",
      label: "Scanning employee record",
      caption:
        "Each section of the employee record is checked in turn — competency, medical, licence and more.",
      ariaLabel: "QA verification scanning each section of an employee record",
    },
    sections: [
      {
        heading: "Run a verification against live record data",
        fullWidth: true,
        bulletTiles: true,
        crispShots: true,
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
            src: "images/screens/verification/verification-run-overall-dark.png",
            caption:
              "Company-wide run history with overall compliance rate and a stacked section breakdown by outcome.",
            scale: 1,
            full: true,
            eager: true,
          },
        ],
      },
      {
        heading: "Configure what a check actually tests",
        fullWidth: true,
        bulletTiles: true,
        crispShots: true,
        body: [
          "The check configuration decides which sections are examined and how strict each one is, so verification reflects your standards rather than a generic template. Companies running different standards for drivers, instructors and managers can hold each to the right bar.",
        ],
        bullets: [
          "**Per-section configuration** of what is examined and what counts as a pass.",
          "**Permission-gated running** via the qa-verifications.run permission, so only authorised staff can execute checks.",
          "**Launch from any employee record** once the module is active.",
          "**Company administrator control** so only a company admin can set which sections are checked and what counts as a pass.",
        ],
        shots: [
          {
            src: "images/screens/verification/CheckConfigVerification.png",
            caption: "Check configuration controls which sections are tested and how each is scored.",
            scale: 1,
            full: true,
            rotate: {
              interval: 5000,
              slides: [
                {
                  src: "images/screens/verification/CheckConfigVerification.png",
                  alt: "Check configuration overview with every verification section listed.",
                  label: "Overview",
                },
                {
                  src: "images/screens/verification/CheckConfigMedicalCustom.png",
                  alt: "Medical checks expanded and custom company policy checks on the configuration page.",
                  label: "Medical & custom",
                },
              ],
            },
          },
        ],
      },
      {
        heading: "The report produced for one employee",
        fullWidth: true,
        crispShots: true,
        body: [
          "When you run a verification against an individual record, Rail Intel produces a structured report you can review on screen, filter for issues and print or save as PDF. Each section of the employee record is scored in turn — the report is the evidence.",
        ],
        reportRoll: {
          interval: 5000,
          note:
            "Each screenshot shows one example section of the report — not the complete document.",
          steps: [
            {
              step: "01",
              title: "Run outcome at a glance",
              text:
                "The report opens with the employee identity, who ran the check, and the overall result — with compliant, advisory, review and derogation counts across every section tested.",
              src: "images/screens/verification/report/verification-report-overview.png",
              alt: "Verification report header showing overall failed outcome and outcome counts.",
              label: "Overview",
              accent: "#f43f5e",
              scale: 1,
            },
            {
              step: "02",
              title: "Summary visuals",
              text:
                "Donut charts summarise the run at a glance — overall outcome split and how many checks fell into each report section, so you can see where the weight of issues sits before scrolling.",
              src: "images/screens/verification/report/verification-report-summary-visuals.png",
              alt: "Summary visuals with overall outcome and checks-by-section donut charts.",
              label: "Summary",
              accent: "#38bdf8",
              scale: 1,
            },
            {
              step: "03",
              title: "Section detail — cab passes",
              text:
                "Each section expands with the specific finding, status and a preview of the underlying record. A compliant cab pass shows the live pass, validity and who issued it.",
              src: "images/screens/verification/report/verification-report-cab-pass.png",
              alt: "Cab passes section showing a compliant black route-learning pass preview.",
              label: "Cab passes",
              accent: "#34d399",
              scale: 1,
            },
            {
              step: "04",
              title: "Section detail — incidents & CDP",
              text:
                "Advisory and review items name the rule that failed, explain why, and link straight back to the record to fix it — such as an incident within the investigation grace period with no CDP yet created.",
              src: "images/screens/verification/report/verification-report-incidents-cdp.png",
              alt: "Incidents and CDP section showing an advisory for a missing CDP after an incident.",
              label: "Incidents",
              accent: "#f59e0b",
              scale: 1,
            },
          ],
        },
      },
      {
        heading: "Meet periodic verification standards without manual sampling",
        fullWidth: true,
        bulletTiles: true,
        crispShots: true,
        body: [
          "Many operators are required to evidence compliance on a quarterly, six-monthly or annual cycle — but meeting that obligation by pulling records and checking them by hand is slow, inconsistent and hard to defend under scrutiny. Sampled run analysis replaces that process with a single action.",
          "Choose the percentage of employees to include, run the sample, and Rail Intel selects individuals at random, verifies each record against your configured checks, and presents the results with donut analytics and a highlighted list of who was included. The run is retained in history alongside every other verification, so you have a clear audit trail of what was tested, when, and by whom.",
        ],
        bullets: [
          "**Percentage-based sampling** — set the proportion of employees to include and run the check in one step.",
          "**Random selection** — individuals are chosen automatically, removing bias from manual pick-and-choose.",
          "**Instant analytics** — review sampled compliance through summary visuals and highlighted employees.",
          "**Audit-ready history** — sampled runs are stored with the same evidence trail as a full company-wide verification.",
        ],
        shots: [
          {
            src: "images/screens/verification/verification-sampled-run-analysis.png",
            caption:
              "Select a sample percentage and run verification across randomly chosen employees — no spreadsheets, no manual record review.",
            scale: 1,
            full: true,
          },
        ],
      },
    ],
  },

  {
    slug: "task-assignment",
    name: "Task assignment",
    moduleId: "task-assignment",
    hideActivation: true,
    hideHeroActions: true,
    heroLeadFullWidth: true,
    heroShotStacked: true,
    heroShot: {
      src: "images/screens/tasks/workspace-tasks-addon.png",
      alt:
        "Workspace navigation with Documents, Tasks add-on and Employee Messaging & Notes.",
      scale: 1,
      full: true,
      eager: true,
      hideCaption: true,
      noExpand: true,
    },
    summary: "Assign follow-up actions to people and tie them to an employee record.",
    tagline: "Close the loop after the finding",
    lead:
      "Findings are worthless if nobody actions them. Task assignment turns an observation into an owned, tracked action against a named person and, where relevant, a specific employee record, so the follow-up is visible instead of living in someone's inbox.",
    sections: [
      {
        heading: "Tasks with an owner, a status and a record",
        fullWidth: true,
        bulletTiles: true,
        crispShots: true,
        mod: "task-shots",
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
        shotBreak: {
          after: 1,
          heading: "Raising a task takes seconds",
          body: [
            "The point of the module is that creating an action is quick enough that people actually do it at the moment of the finding, not later.",
          ],
        },
        shots: [
          {
            src: "images/screens/tasks/task-employee-list.png",
            caption:
              "Tasks linked to the employee record, filter by open, closed or all, with status and assignee at a glance.",
            scale: 1,
            full: true,
            eager: true,
            noExpand: true,
          },
          {
            src: "images/screens/tasks/task-detail-open.png",
            caption:
              "Opening a task shows its detail, history, reassignment and the record it relates to.",
            scale: 1,
            noExpand: true,
          },
          {
            src: "images/screens/tasks/task-create-form.png",
            caption: "Creating a task: title, assignee, linked employee and due detail.",
            scale: 0.5,
            noExpand: true,
          },
        ],
      },
    ],
  },

  {
    slug: "safety-briefs",
    name: "Safety Briefs",
    moduleId: "safety-briefs",
    hideActivation: true,
    hideHeroActions: true,
    heroLeadFullWidth: true,
    summary: "Record who received which brief, in person or remotely, with evidence.",
    tagline: "Evidence that the brief actually landed",
    lead:
      "Issuing a safety brief is easy. Proving that a specific driver received it, when, and from whom is the part that fails an audit. Safety Briefs records attendance per employee with the delivery method and provider captured against the record.",
    sections: [
      {
        heading: "Attendance captured per employee",
        fullWidth: true,
        bulletTiles: true,
        mod: "fluid-shot",
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
            src: "images/screens/safety-briefs/safety-brief-records-dark.png",
            caption:
              "Safety brief records in dark mode — choose a brief type and record in-person or remote attendance.",
            scale: 1,
            full: true,
            eager: true,
            noExpand: true,
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
    tagline: "Run the full trainee programme, from policies to portfolio.",
    lead:
      "The Trainee module guides you through a five-step pathway: policies and agreements, training schedules, groups, enrolment and training-cycle assignment. Once live, each trainee gets a portfolio for policies, equipment, modules, attendance, train logs and reporting.",
    note:
      "Core Rail Intel already includes trainee hours and daylight/darkness progress on the Experience Records tab. This module adds the programme management around it.",
    heroShot: {
      src: "images/screens/trainee-addon/01-trainee-module-pathway.png",
      caption: "The Trainee Module hub — five connected steps from setup to live monitoring.",
      scale: 1,
    },
    flowIntro: {
      heading: "How the module works",
      body:
        "Scroll through each step below — the same pathway as the module, top to bottom. Policies first, then schedules, groups, enrolment and training-cycle assignment. Optional equipment can be prepared before enrolment.",
    },
    flowSteps: [
      {
        id: "policies",
        step: "Step 1",
        title: "Policies & agreements",
        lede: "Must exist first. Trainees sign these when they start — Module 1 and other training activities cannot begin until required policies are signed.",
        status: "6 ready",
        accent: "#2dd4bf",
        bullets: [
          "**Required policies and agreements** configured before enrolment.",
          "**Default templates** for SRS, job description, mobile device policy and more.",
          "**Custom agreements** can be uploaded, edited or deactivated.",
        ],
        shots: [
          {
            src: "images/screens/trainee-addon/02-policies-agreements.png",
            caption: "Manage required policies — view, upload, edit or deactivate each item.",
            scale: 1,
          },
        ],
      },
      {
        id: "equipment",
        step: "Optional",
        title: "Equipment catalogue",
        lede: "Prepare items for trainees to sign when issued. Adopt a global template from the platform catalogue or create custom equipment.",
        optional: true,
        accent: "#a78bfa",
        bullets: [
          "**Global templates** such as Train Driver (10 items) added in one action.",
          "**Custom equipment** for anything specific to your operation.",
          "**Signed on issue** — tracked on the trainee portfolio Equipment log tab.",
        ],
        shots: [
          {
            src: "images/screens/trainee-addon/equipment-catalogue.png",
            caption: "Adopt the Train Driver equipment template or build your own catalogue.",
            scale: 1,
          },
        ],
      },
      {
        id: "schedules",
        step: "Step 2",
        title: "Training schedules",
        lede:
          "Build the programme first — set a start date and Rail Intel projects the full timeline automatically, bank holidays and working-day rules included.",
        status: "1 schedule",
        accent: "#38bdf8",
        scheduleFlow: {
          kicker: "Automatic scheduling",
          headline: "One start date. Full timeline.",
          body:
            "Place a start date and Rail Intel looks up upcoming bank holidays, applies each module's working-day rules and projects every training day — no manual calendar work.",
          steps: [
            {
              title: "Set start date",
              detail: "One date anchors every module from that day forward.",
            },
            {
              title: "Bank holidays",
              detail: "Upcoming public holidays picked up and applied automatically.",
            },
            {
              title: "Working days",
              detail: "Weekends and non-working days skipped per module rules.",
            },
            {
              title: "Timeline projected",
              detail: "Every training day mapped on the calendar instantly.",
            },
          ],
        },
        bullets: [
          "**Five-module pathway** from Personal Track Safety through to Driving Instructor / Shift Pattern.",
          "**Calendar view** — every projected training day colour-coded by module.",
        ],
        shots: [
          {
            src: "images/screens/trainee-addon/03-training-schedules.png",
            caption: "Course pathway with module durations, modes and status.",
            scale: 1,
          },
          {
            src: "images/screens/trainee-addon/03-training-calendar.png",
            caption: "Training calendar with modules, weekends and bank holidays marked.",
            scale: 1,
          },
        ],
      },
      {
        id: "groups",
        step: "Step 3",
        title: "Groups / classes",
        lede: "Label cohorts of up to 10 trainees after a schedule exists. Each group ties enrolment to a named intake.",
        status: "2 groups",
        accent: "#c084fc",
        bullets: [
          "**Named cohorts** such as Class 1 or Euston Intake.",
          "**Capacity tracking** — see how many places are filled.",
          "**Edit or remove** groups as intakes change.",
        ],
        shots: [
          {
            src: "images/screens/trainee-addon/04-training-groups.png",
            caption: "Training groups with capacity badges and trainee lists.",
            scale: 1,
          },
        ],
      },
      {
        id: "enrol",
        step: "Step 4",
        title: "Allocate trainees",
        lede: "Enrol trainees onto a schedule and assign them to a group. Link a driving instructor and start date; assign a training cycle now or in step 5.",
        status: "1 enrolled",
        accent: "#fb923c",
        bullets: [
          "**Select trainee, schedule and group** in one enrolment form.",
          "**Optional instructor** from Instructor or Senior Driver Instructor roles.",
          "**Welcome email** sent to the trainee on enrolment.",
        ],
        shots: [
          {
            src: "images/screens/trainee-addon/05-enrol-trainee.png",
            caption: "Enrol a trainee — schedule, group, instructor, cycle and start date.",
            scale: 1,
            compact: true,
          },
        ],
      },
      {
        id: "cycle",
        step: "Step 5",
        title: "Assign training cycle",
        lede: "Link each person to a live training cycle so monitoring and assessments can be captured. Filter by group and class to manage allocations.",
        status: "All linked",
        accent: "#7dd3fc",
        bullets: [
          "**Search and filter** trainees by name, course and class.",
          "**Manage or view** the linked competency cycle.",
          "**Monitoring ready** once the cycle is linked.",
        ],
        shots: [
          {
            src: "images/screens/trainee-addon/06-assign-training-cycle.png",
            caption: "Assign and manage training cycles per trainee.",
            scale: 1,
          },
        ],
      },
    ],
    portfolioStep: {
      step: "Live programme",
      title: "Trainee portfolio",
      lede: "Once enrolled, each trainee gets a portfolio: policies, equipment log, modules, attendance, train log and report — with experience hours, instructor allocation and compliance status at a glance.",
      accent: "#818cf8",
      bullets: [
        "**Policies & agreements** — signed before modules begin.",
        "**Experience hours** against your company standard, daylight and darkness.",
        "**Tabs for equipment, modules, attendance, train log and report**.",
      ],
      shots: [
        {
          src: "images/screens/trainee-addon/07-trainee-portfolio.png",
          caption: "Trainee portfolio with progress, instructor, policies and module tabs.",
          scale: 1,
        },
      ],
    },
    qaSection: {
      heading: "On QA verification reports",
      body: [
        "Trainee add-on module manages the programme; it is not a standalone compliance audit. When the **QA Verifications** add-on is purchased and activated, verification runs can check trainee programme compliance against live record data.",
        "Trainee-related outcomes, such as unsigned policies, portfolio gaps and programme status, form part of the employee verification report alongside competency, medical and licence sections, with run history retained for audit.",
      ],
      bullets: [
        "**QA Verifications is a separate add-on** — activate it from the Add-ons page when you need structured checks.",
        "**Compliance checked on demand** against the trainee portfolio and related employee record data.",
        "**Included in the verification report** with section-level outcomes, not a separate spreadsheet.",
      ],
      link: {
        href: "products/qa-verifications.html",
        label: "About QA Verifications",
      },
      shot: {
        src: "images/screens/trainee-addon/your-team-compliance.png",
        caption:
          "Your team's compliance on the dashboard — live review and advisory counts per employee when QA Verifications is active.",
        scale: 1,
      },
    },
  },

  {
    slug: "driver-reports",
    name: "Driver Reports",
    moduleId: "driver-reports",
    hideActivation: true,
    hideHeroActions: true,
    heroLeadFullWidth: true,
    heroTitleNoWrap: true,
    summary: "Signed operational reports from drivers, exportable to your investigations system.",
    tagline: "Capture the driver's account while it is fresh",
    lead:
      "Driver Reports captures a structured, signed account of an operational event, turn, headcode, conditions and narrative, on the driver's own record. Because the report is structured rather than free text in an email, it can be reported on and exported to an investigations system.",
    sections: [
      {
        heading: "A structured report, signed by the driver",
        fullWidth: true,
        bulletTiles: true,
        mod: "fluid-shot",
        body: [
          "The form captures the operational context alongside the narrative, so a report is usable as evidence later rather than an unattributed paragraph. Reports are held on the employee record and synchronise company-wide for management review.",
          "Where the Investigations connector is configured, the API supports exporting reports into that system, so the driver's account reaches the investigation without being re-keyed.",
        ],
        bullets: [
          "**Operational context captured** turn, headcode and conditions alongside the narrative.",
          "**Signed by the driver** and retained on their record.",
          "**Company-wide overview** for managers reviewing submitted reports.",
          "**Exportable to Investigations** where that connector is active.",
        ],
        shots: [
          {
            src: "images/screens/driver-reports/driver-report-form-dark.png",
            caption:
              "The report form captures operational context as structured fields — turn, headcode, conditions, narrative and signature.",
            scale: 1,
            full: true,
            eager: true,
            noExpand: true,
          },
          {
            src: "images/screens/driver-reports/submitted-report-dark.png",
            caption: "A submitted report as it is retained against the driver's record.",
            scale: 1,
            full: true,
            noExpand: true,
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
    tagline: "Absence that reconciles with fatigue",
    heroDek:
      "Entitlements, sickness and absence with manager approval and a full audit trail on the employee record.",
    heroDekExtra:
      "Annual leave balances, carry-over and sickness sit on the same record as competence data.",
    lead:
      "Absence matters in a safety-critical setting because it interacts with competence: a driver returning from long-term sickness may need reassessment before signing on.",
    heroTiles: [
      "Absence matters in a safety-critical setting because it interacts with competence: a driver returning from long-term sickness may need reassessment before signing on.",
      "Leave & Absence tracks entitlements and absence with an approval workflow, and keeps the record next to the competency data rather than in a separate HR system.",
      "Managers approve from their dashboard with email notification; every request and decision is retained on the employee record for audit.",
      "Holiday, sickness and other absence types share one path, entitlements and carry-over follow your leave-year policy instead of spreadsheets.",
    ],
    hideHeroActions: true,
    heroLeadFullWidth: true,
    heroMod: "leave-absence",
    heroInlineShot: {
      src: "images/screens/leave-absence/leave-absence-set-entitlement-dark.png",
      caption: "Set entitlement with carry-over projection.",
      scale: 1,
      noExpand: true,
    },
    heroShot: {
      src: "images/screens/leave-absence/leave-absence-apply-for-leave.png",
      caption: "Apply for leave, holiday, unpaid or other, submitted for manager approval.",
      scale: 1,
    },
    sections: [
      {
        heading: "Entitlements and balances per employee",
        mod: "leave-overview",
        tileSplit: true,
        bulletTiles: true,
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
            caption: "Employee leave record with entitlement, balance and leave statement.",
            scale: 1,
          },
        ],
      },
      {
        heading: "Leave year policy and reporting",
        mod: "leave-policy",
        crispShots: true,
        shotGrid: "hero-stack",
        body: [
          "The leave year and its policy are configurable, so the module reflects how your organisation actually operates. Reporting shows absence patterns across the company, and each employee record carries its own summary.",
        ],
        shots: [
          {
            src: "images/screens/leave-absence/leave-absence-policy-dark.png",
            caption: "Leave year and policy configuration.",
            scale: 1,
            full: true,
            noExpand: true,
          },
          {
            src: "images/screens/leave-absence/leave-absence-reporting-dark.png",
            caption: "Absence reporting across the company.",
            scale: 1,
            full: true,
            noExpand: true,
          },
          {
            src: "images/screens/leave-absence/leave-absence-entitlements-dark.png",
            caption: "Annual leave entitlements across the company.",
            scale: 1,
            full: true,
            noExpand: true,
          },
          {
            src: "images/screens/leave-absence/leave-absence-dashboard-dark.png",
            caption: "Requests and absences held on each employee record.",
            scale: 1,
            full: true,
            noExpand: true,
          },
        ],
      },
    ],
  },

  {
    slug: "medication-checks",
    name: "Medication Checks",
    moduleId: "medication-checks",
    hideActivation: true,
    hideHeroActions: true,
    heroTitleNoWrap: true,
    summary: "Medication declarations and occupational health checks on the medical record.",
    tagline: "Declarations that reach the right people",
    lead:
      "Medication can affect fitness to work, and a declaration that sits in an email is not a control. Medication Checks adds declaration and occupational-health check workflows to the medical record, including optional employee self-submission for manager review.",
    note:
      "The medical section and company Medicals page are core Rail Intel. This module adds the medication declaration and OH check workflows on top of them.",
    heroShot: {
      src: "images/screens/medical/medication-checks-icon.jpg",
      alt: "Medication checks module icon",
      circle: true,
      hideCaption: true,
      noExpand: true,
      scale: 1,
    },
    sections: [
      {
        heading: "Declarations, OH outcomes and attachments",
        layout: "aside",
        mod: "medication-checks",
        bulletTiles: true,
        crispShots: true,
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
            src: "images/screens/medical/medication-check-form.png",
            caption: "Add medication check — capture medications, outcome and clinician details.",
            scale: 1,
          },
        ],
      },
      {
        heading: "Submission, tracking and reporting",
        layout: "aside",
        asideReverse: true,
        mod: "medication-checks",
        crispShots: true,
        body: [
          "Once a medication check is submitted, it becomes a dated record on the employee's medical tab, not a form sitting in someone's inbox. Status, outcome, clinician and provider are held together so the fitness position is visible at a glance.",
          "Managers can see who submitted the check and who reviewed it. OH recommendations sit on the same record with a due date and completion status, so follow-up does not rely on a separate tracker.",
          "Medications are stored in a structured table, dosage, quantity, duration and reason, which means the data is searchable and available for reporting alongside other medical compliance measures.",
          "Deleting a check is restricted to company administrators, or to users who have been granted that permission under Roles & Permissions by a company administrator.",
        ],
        shots: [
          {
            src: "images/screens/medical/medication-check-submitted.png",
            alt: "View medication check — submitted record with OH recommendations and medications.",
            scale: 1,
            hideCaption: true,
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
    taglineHtml:
      'Assess in the cab without <span class="hero-title__accent">lighting</span> up the windscreen',
    lead:
      "A bright tablet in a dark cab is a distraction — for the driver and for the assessor. Tunnel Mode is the assessor switching dark mode on and dimming the screen on mobile or tablet. It does not detect the tunnel automatically; the person in the cab decides when the glass is too bright.",
    heroShot: {
      src: "images/screens/assessing/AssessInDark.jpg",
      alt: "Assessor holding a bright tablet in a dark cab.",
      caption:
        "Who's that handsome chap ahead? …Oh, it's my reflection.",
      scale: 0.5,
      full: true,
      eager: true,
      bordered: true,
      noExpand: true,
    },
    hideHeroActions: true,
    hideCta: true,
    sections: [
      {
        heading: "Built for the cab, not the office",
        layout: "aside",
        mod: "tunnel-cab",
        body: [
          "When an assessment starts, Rail Intel reminds assessors that windscreen reflections matter, especially through tunnels, and offers dark mode in one tap. The Dark / Light control sits in the assessment header, so switching never means leaving the flow.",
          "On mobile and tablet, a brightness slider sits under the header. Dim the screen from full daylight down to a soft cab-friendly level, and reset it when you are out of the tunnel. Both controls are manual: the tablet does not read the ambient light and switch on its own.",
        ],
        bulletTiles: true,
        bullets: [
          "**One-tap dark mode** from the assessment header — switch before the cab goes dark and the choice stays for the rest of the session.",
          "**Dimmable brightness** on mobile and tablet, from 40% up to 135%, adjusted by hand to suit cab conditions — not auto-detected.",
          "**Cab safety notice** at the start of an assessable event, with a direct Turn on dark mode action when windscreen glare matters.",
          "**App-wide dark theme** from the user menu when you are not assessing — the same dark palette across the whole app.",
        ],
        shots: [
          {
            src: "images/screens/assessing/dark-switch-safety.png",
            alt: "Cab safety notice offering one-tap dark mode during an assessment",
            scale: 1,
            bordered: true,
            noExpand: true,
          },
        ],
      },
    ],
  },

  {
    slug: "competency-cycles",
    name: "Competency & Cycles",
    seoTitle: "Rail Competency Cycles & Assessments | Rail Intel",
    seoDescription:
      "Build rail competency cycles, schedule assessments, record in-cab evidence and flag lapsed mandatory competencies before anyone reaches the railway.",
    seoKeywords: "rail competency cycles, driver assessments, competence management, in-cab assessment software",
    summary: "Build assessment cycles, run assessments in the field and carry findings forward.",
    tagline: "The competency engine",
    lead:
      "Competence is a live cycle with a start date, an expiry and evidence — not a document store. Rail Intel's cycle engine builds the standard, schedules the assessments, records them in the field and flags the moment a mandatory competency lapses.",
    faq: [
      {
        question: "What is a competency cycle in Rail Intel?",
        answer:
          "A competency cycle defines the standard, criteria and scheduled assessment events a role must complete, with start and expiry dates on the employee record.",
      },
      {
        question: "Can assessments be completed in the cab?",
        answer:
          "Yes. Assessors record structured observations in the field, including Tunnel Mode for low-glare assessing in dark cabs.",
      },
    ],
    relatedLinks: [
      { name: "Medicals & Licences", href: "features/medicals-licensing.html" },
      { name: "QA Verifications add-on", href: "products/qa-verifications.html" },
    ],
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
            scale: 1,
            full: true,
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
            scale: 1,
            full: true,
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
            src: "images/screens/cycles/active-assessment.png",
            caption: "Active competency assessment — choose a unit and assess Demonstrate or Explain criteria.",
            scale: 1,
            full: true,
          },
          {
            src: "images/screens/assessing/in-cab-safety.png",
            caption: "In-cab safety: dark mode for windscreen glare and flagging criteria to finish later.",
            scale: 1,
          },
          {
            src: "images/screens/assessing/flagged-based-on-observations.png",
            caption: "Criteria flagged on the basis of recorded observations.",
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
    slug: "printable-profile",
    name: "Printable Profile",
    summary: "Full-colour, print-friendly or dark-mode employee profiles from the live record.",
    tagline: "The most professional employee competence portfolio",
    taglineHtml:
      'The most <span class="hero-title__accent">professional</span> employee competence portfolio',
    hideHeroActions: true,
    heroShot: {
      src: "images/product/printable-profile-hero.png",
      alt:
        "Rail professional holding a printed Rail Intel Employee Profile brochure, matching the full-colour record layout.",
      scale: 0.5,
      bordered: true,
      eager: true,
      hideCaption: true,
      noExpand: true,
    },
    lead:
      "For audits, management review or formal packs, Rail Intel turns the live employee record into a branded competence portfolio, full-colour brochure, print-ready PDF, or on-screen layout, generated from the data already in the system.",
    cta: {
      heading: "Everything here is included",
      body:
        "These capabilities are part of core Rail Intel, gated only by the permissions you assign. Optional modules extend them further.",
      primaryHref: "get-started.html",
      primaryLabel: "Get started",
      showSecondary: false,
    },
    sections: [
      {
        heading: "Data protection before you print",
        layout: "aside",
        bulletTiles: true,
        body: [
          "An employee profile is a complete extract of the live record. It can include personal data and special category information, occupational health, medical fitness and incident history, so producing one should never be casual.",
          "Before the print dialog opens, Rail Intel presents a data protection notice. The user must confirm they have a lawful basis and a demonstrable business need to handle the data, and that copies will be kept secure, shared only with those who need them, and destroyed when no longer required.",
          "The notice references UK GDPR and the Data Protection Act 2018 for UK operators. For international deployments, the same checkpoint applies, your organisation remains responsible for processing employee data under the data protection laws that apply in your jurisdiction.",
        ],
        bullets: [
          "**Mandatory confirmation** A recorded acknowledgement before print or PDF export.",
          "**Lawful basis required** Users must attest they have authority and a business need.",
          "**Handling guidance built in** Secure storage, limited disclosure and secure disposal.",
          "**Optional signed declaration** Apply the user's signature to the attestation when required.",
        ],
        shots: [
          {
            src: "images/screens/main-sys/print-before-you-print.png",
            alt: "Data protection notice shown before printing an employee profile.",
            caption:
              "Before you print — data protection notice, format choice and signed declaration.",
            scale: 1,
          },
        ],
      },
      {
        heading: "Flexibility in format",
        mod: "printable-formats",
        bulletTiles: true,
        body: [
          "The same live record can be output in three finishes. Each draws from identical data at the moment you generate the profile — only the presentation changes. Print or save as PDF directly from the employee record via your browser's print dialog.",
        ],
        tiles: [
          {
            title: "Full-colour brochure",
            detail:
              "Branded artwork on every page. Best for formal packs, stakeholder circulation and saving as a PDF.",
            accent: "#a78bfa",
          },
          {
            title: "Print friendly",
            detail:
              "Plain black on white with no artwork or colour fills — designed to save ink on paper copies.",
            accent: "#38bdf8",
          },
          {
            title: "Dark mode",
            detail:
              "High-contrast layout for on-screen reading as a PDF. Optimised for visibility, not for printing.",
            accent: "#f59e0b",
          },
        ],
      },
    ],
  },

  {
    slug: "profile-lock",
    name: "Profile Lock",
    summary: "Freeze an employee record for investigation evidence — company administrators only.",
    tagline: "Preserve the record when it matters",
    hideHeroActions: true,
    hideCta: true,
    lead:
      "When an employee record may become material to an external regulatory investigation, an industry safety inquiry, or an internal investigation, the record must not change underneath the reviewers. Profile lock freezes the employee record at a point in time — only a company administrator can apply or release the lock.",
    heroRegulators: [
      {
        src: "images/regulators/orr.png",
        alt: "Office of Rail and Road (ORR)",
        width: 260,
        height: 182,
      },
      {
        src: "images/regulators/raib.png",
        alt: "Rail Accident Investigation Branch (RAIB)",
        width: 250,
        height: 86,
        class: "raib",
      },
    ],
    sections: [
      {
        heading: "Evidence preservation for investigations",
        layout: "aside",
        bulletTiles: true,
        body: [
          "Before the lock is applied, the administrator must record a reason. Every section of the record then becomes read-only for all users until an administrator unlocks the profile. The record remains readable for review and export, but amendments that would alter the evidential snapshot are blocked.",
          "That gives investigators and your assurance team a stable artefact to work from — whether the inquiry is external, from an industry safety body, or internal to your operation.",
        ],
        bullets: [
          "**Company administrator only** Lock and unlock are not available to general users.",
          "**Point-in-time preservation** For ORR, RAIB or internal investigation workflows.",
          "**Read-only across every section** Until an administrator releases the lock.",
          "**Reason required** The lock, who applied it and why are retained in the audit trail.",
        ],
        shots: [
          {
            src: "images/screens/main-sys/lock-employee-profile.png",
            caption:
              "The lock confirmation — a reason is required before the record is preserved as evidence.",
            scale: 1,
          },
        ],
        asideNote: {
          heading: "Everything here is included",
          body:
            "These capabilities are part of core Rail Intel, gated only by the permissions you assign. Optional modules extend them further.",
        },
      },
    ],
  },

  {
    slug: "medicals-licensing",
    name: "Medicals & Licences",
    summary: "Medical fitness, ORR medicals, driving licences and complementary certificates.",
    tagline: "Medicals and licences",
    lead: [
      "ORR medicals, fitness status, train driving licences, categories and complementary certificates are held on the same employee record, each with an expiry date. When a medical lapses, fitness is unfit, or a licence is out of date, the employee is marked off track and their assigned manager is notified immediately.",
      "Safety-critical duties are not available until the record is current; only non-safety-critical work remains possible. Rail Intel monitors every deadline and surfaces the position on the dashboard and in reporting, rather than leaving it to be noticed.",
    ],
    heroGraphic: "medicals-licensing",
    hideCta: true,
    heroActions: [
      { href: "#medicals", label: "Medicals", primary: true },
      { href: "#licensing", label: "Licences", ghost: true },
    ],
    sections: [
      {
        id: "medicals",
        heading: "Medical records and fitness status",
        fullWidth: true,
        body: [
          "Medical records carry fitness status, the issuing clinician and the expiry date. A status of unfit or an expired medical marks the employee as not safe to work, which surfaces on the dashboard and in reporting rather than waiting to be noticed.",
          "The company Medicals page gives the position across the workforce, including which medicals are due within the next 30 days.",
        ],
        bodyShot: {
          after: 0,
          src: "images/screens/medical/not-safe-to-work-banner.png",
          alt: "Not safe to work alert — medical expired and mandatory competency expired.",
          scale: 1,
        },
        shots: [
          {
            src: "images/screens/medical/new-medical-record.png",
            caption: "Recording a new medical for occupational health and ORR medicals.",
            scale: 1,
            full: true,
          },
        ],
      },
      {
        heading: "UK ORR registered psychologists and doctors",
        headingFlag: "gb",
        body: [
          "When recording an ORR medical, the assessing psychologist and doctor are selected from registers built into Rail Intel. Both lists are pre-populated with ORR registered practitioners and searchable by name or registration code, so each medical is linked to the correct clinician from the outset.",
          "Where a newly appointed psychologist or doctor is not yet on the list, company administrators can add them directly from the medical form, keeping the register current as your panel of clinicians changes, without waiting for a system update.",
        ],
        headLogo: {
          src: "images/regulators/orr.png",
          alt: "Office of Rail and Road (ORR)",
          width: 260,
          height: 182,
        },
        shots: [
          {
            src: "images/screens/medical/orr-registered-psychologist-list.png",
            caption:
              "ORR registered psychologists, searchable by name or ORRPP code, with the option to add a new appointment.",
            scale: 1,
          },
          {
            src: "images/screens/medical/orr-registered-doctor-list.png",
            caption:
              "ORR registered doctors held in the same way, searchable by name or ORRDOC code.",
            scale: 1,
          },
        ],
      },
      {
        id: "licensing",
        heading: "Driving licences and categories",
        fullWidth: true,
        licenceScanPanel: true,
        body: [
          "Train driving licences are held with the front and back images, licence number, issue and expiry dates and the categories carried. Renewal warnings appear ahead of expiry with the number of days remaining.",
        ],
        shots: [
          {
            src: "images/screens/licencing/licence-dark-mode.png",
            caption:
              "Train driving licence with front and back images, details and categories carried.",
            scale: 1,
            full: true,
          },
        ],
      },
      {
        heading: "Complementary certificates",
        headingBadge: "Fully Automated",
        fullWidth: true,
        body: [
          "The complementary certificate (Part B) is held alongside the licence, covering the infrastructure, traction and routes the driver is certified for.",
          "When a licence is digitally scanned, Rail Intel populates the certificate automatically from the extracted licence data and the entries already held on the individual's record. Manual entry is also available where required.",
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
    slug: "cdp-monitoring",
    name: "CDP Monitoring",
    summary: "Track competence development plans, carry findings across cycles and govern access by role.",
    tagline: "Open development points that stay visible until they are closed",
    taglineHtml:
      'Open <span class="hero-title__accent">development</span> points that stay <span class="hero-title__accent">visible</span> until they are closed',
    lead:
      "A competence development plan (CDP) is how Rail Intel records what still needs to improve after an assessment, incident or monitoring review, what was agreed, who owns it and whether it was completed. CDPs live on the Monitoring tab of the employee record, link back to the competence activity that raised them, and carry forward automatically when a continuous cycle renews.",
    accent: "#38bdf8",
    experience: {
      stats: [
        { value: "Core", label: "Platform capability", detail: "Included — not an add-on" },
        { value: "Auto", label: "Cycle carryover", detail: "Open CDPs move forward" },
        { value: "Role", label: "Gated access", detail: "Permissions per company role" },
        { value: "Audit", label: "Full history", detail: "Closed plans retained" },
      ],
      lifecycle: [
        { title: "Finding", detail: "Assessment or incident records the gap" },
        { title: "Plan", detail: "Agreed actions captured on the CDP" },
        { title: "Monitor", detail: "Live on the Monitoring tab" },
        { title: "Close / carry", detail: "Completed or carried to next cycle" },
      ],
      chapters: [
        {
          id: "monitoring",
          num: "01",
          title: "The Monitoring tab",
          subtitle: "Employee record · Development view",
          body: [
            "The Monitoring tab is the operational view of competence follow-up for one person: allocated incidents, open and closed development plans, and, where the Trainee Driver module is active, performance and support plans.",
            "Managers and assessors with the right permissions see the full picture for people in their scope. Employees with own-record access see their own monitoring history without opening the company directory.",
          ],
          pillars: [
            { title: "Incidents & CDPs together", detail: "Nothing logged in one system and chased in another." },
            { title: "Status at a glance", detail: "Open, in progress and completed plans on the record." },
            { title: "Tied to the person", detail: "Monitoring follows the employee, not a spreadsheet row." },
          ],
        },
        {
          id: "anatomy",
          num: "02",
          title: "What a CDP contains",
          subtitle: "Structure · Evidence · Closure",
          body: [
            "A CDP captures the gap that was found, the improvement agreed and the evidence that it was done. It is raised from competence activity, typically when assessment criteria are flagged, and stays on the record until formally closed.",
          ],
          bullets: [
            "**Linked to the finding** — the plan relates to the assessment or incident that triggered it.",
            "**Agreed actions** — what the employee and manager or assessor committed to.",
            "**Completion tracked** — closure is recorded on the record, not assumed.",
          ],
          shot: {
            src: "images/screens/monitor-plans-incidents/cdp-plan-overview.png",
            caption: "Competence development plan overview for the employee.",
          },
          shotLayout: "full-tiles",
        },
        {
          id: "create-cdp",
          num: "03",
          title: "Raising a new CDP",
          subtitle: "Plan setup · Incident link · Validation",
          body: [
            "When a competence gap is identified, assessors raise a CDP from the Monitoring tab. Plan type, start date, duration and linked incident are captured in one form, and the end date is calculated automatically from the duration you set.",
            "Rail Intel enforces one CDP per incident. If a plan is already linked to the selected incident, the system blocks creation and explains why, preventing duplicate development plans on the same finding.",
          ],
          shots: [
            {
              src: "images/screens/monitor-plans-incidents/cdp-new-plan.png",
              caption: "Create a new competence development plan from the Monitoring tab.",
            },
            {
              src: "images/screens/monitor-plans-incidents/cdp-duplicate-incident-plan.png",
              caption: "The system blocks a second plan when one is already linked to the same incident.",
            },
          ],
          shotLayout: "full-stack",
        },
        {
          id: "carryover",
          num: "04",
          title: "Automatic carryover",
          subtitle: "Continuous cycles · No re-keying",
          body: [
            "Competencies that renew on a continuous cycle do not wipe open development work at the boundary. When a new cycle period starts, scheduled assessment events and open CDP items carry over automatically.",
            "Closed cycles remain in history. Carryover applies to live work that was not completed before the cycle turned over.",
          ],
          bullets: [
            "**Continuous cycles supported** — for competencies that renew rather than end.",
            "**Events carry over automatically** — assessment schedule and open CDP items move with the cycle.",
            "**History retained** — previous cycles and closed plans stay on the record for audit.",
          ],
          shot: {
            src: "images/screens/cycles/cont-cycle-cdp-carryover.png",
            caption: "CDP monitoring events carry over when a continuous cycle renews.",
          },
          shotLayout: "split-tiles",
        },
        {
          id: "permissions",
          num: "05",
          title: "Permissions by role",
          subtitle: "Organisation settings · Granular control",
          body: [
            "Monitoring and CDPs are core Rail Intel, not an add-on, but who can view or change them is controlled by company role permissions, the same model used across the rest of CMS.",
            "Administrators configure roles in Organisation settings. Each role gets exactly the access your operation requires, no more, no less.",
          ],
          roles: [
            { name: "Assessor", detail: "Raise and update plans for people they assess." },
            { name: "Line manager", detail: "View monitoring for their team." },
            { name: "Driver", detail: "Own-record Monitoring tab — no company directory." },
            { name: "Company Admin", detail: "Configure roles and permissions for the operation." },
          ],
          shot: {
            src: "images/screens/comp-config/configure-company-role-permissions.png",
            caption: "Configure permissions for each company job role.",
          },
        },
      ],
    },
  },

  {
    slug: "administration",
    name: "Administration",
    summary:
      "Configure organisation, roles, standards, modules and security — your operation's control centre.",
    tagline: "Configure Rail Intel to match how your operation runs",
    taglineHtml:
      '<span class="hero-title__accent">Configure</span> Rail Intel to match how your <span class="hero-title__accent">operation</span> runs',
    lead:
      "Administration is where Rail Intel becomes yours. System and company administrators define who can see and do what, set the competency standards assessors work to, configure traction and routes once for the whole company, activate optional modules and govern sign-in policy — without a vendor change request.",
    heroShot: {
      src: "images/screens/main-sys/adminmenu.png",
      caption:
        "The Administration fly-out menu — team management, module settings, storage and company configuration.",
      scale: 1,
      full: true,
    },
    hideHeroActions: true,
    heroIntro: {
      heading: "The Administration menu",
      body: [
        "Open Administration from the main navigation and the full control surface appears in one fly-out menu. Day-to-day assessing and record-keeping happen on employee records and in the field; Administration is where you set the rules those workflows follow.",
        "The menu groups everything an administrator needs: team and module management at the top, document storage, then Company configuration — custom job roles, grading scale, email templates, Cycle Builder, company standards, traction and routes, organisation structure, the Investigations connector, role permissions and your company logo.",
      ],
      tiles: [
        {
          title: "Team Management",
          detail: "Administrator seats, users and access.",
        },
        {
          title: "Module shortcuts",
          detail: "QA Verifications, Trainee and Leave & Absence when those add-ons are active.",
        },
        {
          title: "Storage",
          detail: "Document storage administration.",
        },
        {
          title: "Company configuration",
          detail:
            "Roles, grading, templates, cycles, standards, traction, routes, org structure, integrations, permissions and branding.",
        },
      ],
    },
    sections: [
      {
        heading: "Organisation structure, roles and permissions",
        body: [
          "Your organisation structure, custom job roles and role permissions determine who sees and does what across Rail Intel. Permissions are granular — an assessor, a line manager and a company administrator each get exactly the access their role requires, and you can tailor roles to match how your depots and teams actually work.",
          "The same permission model gates every core capability: the employee directory, monitoring, assessing, medicals, incidents, reporting and optional modules. Nothing is all-or-nothing unless you configure it that way.",
        ],
        bullets: [
          "**Custom job roles** for assessors, managers, instructors and administrators.",
          "**Granular permissions** across records, assessing, monitoring, reporting and configuration.",
          "**Own-record access** for employees who should see only their own record.",
          "**Line-manager scope** so managers see their reportees without the whole company.",
        ],
        shotGrid: "viewer",
        shots: [
          {
            src: "images/screens/comp-config/org-structure.png",
            caption: "Organisation structure configuration.",
          },
          {
            src: "images/screens/comp-config/configure-company-role-permissions.png",
            caption: "Configuring permissions for a company job role.",
          },
          {
            src: "images/screens/main-sys/role-permissions-configure.png",
            caption: "Granular permission assignment across the platform.",
          },
        ],
      },
      {
        heading: "Competency standards and frameworks",
        body: [
          "Cycles are only as good as the standard behind them. Frameworks, grading scales, company standards and timing rules are configured once in Administration and applied across every cycle you run — so assessors in every depot work to the same bar.",
          "When your standard changes, you update the configuration and the live record reflects it on the next assessment or verification — not after someone re-keys a spreadsheet.",
        ],
        bullets: [
          "**Competency frameworks** applied across cycles and roles.",
          "**Grading scales** that assessors use in the field.",
          "**Company standards** for assessment and competence outcomes.",
          "**Timing standards** including trainee daylight and darkness minimums.",
        ],
        shotGrid: "viewer",
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
      {
        heading: "Traction, routes and depots",
        body: [
          "Traction types, routes and depots are configured once and then used across route competence, complementary certificates and assessment records. The vocabulary is consistent everywhere it appears — on the record, in the cab and in a verification report.",
          "Adding a new route or traction type is an administrator task, not a data-entry job repeated on every employee record.",
        ],
        shotGrid: "viewer",
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
        heading: "Modules, licences and integrations",
        body: [
          "Optional modules are activated from the Add-ons library inside Rail Intel CMS. Each module can be taken on an annual subscription or trialled for 14 days, and your system administrator enables it for the company directly.",
          "Every company includes two administrator seats; additional Company Admin licences are purchased by quantity and managed in Team Management. Where Rail Intel Investigations is in use, the API connector in Administration binds one Investigations company to one CMS tenant with dual-approval.",
        ],
        bullets: [
          "**Add-on activation** from the in-app library — no separate procurement workflow.",
          "**14-day trials** before you commit to an annual subscription.",
          "**Company Admin licences** managed in Team Management.",
          "**Investigations connector** for workforce context on a live case.",
        ],
        shotGrid: "viewer",
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
    cta: {
      heading: "Flexibility without custom development",
      body:
        "Administration is included in core Rail Intel. You configure organisation, standards, modules and security yourself — and adjust them as your operation changes. For the full security story, see the Security page.",
      secondaryHref: "../security.html",
      secondaryLabel: "Security overview",
    },
  },

  {
    slug: "reporting-administration",
    name: "Reporting & Administration",
    summary: "Analytics across the operation, plus the configuration that makes it yours.",
    tagline: "Operational reporting, on demand and live feeds",
    taglineHtml:
      'Operational <span class="hero-title__accent">reporting</span>, on demand and <span class="hero-title__accent">live</span> feeds',
    lead:
      "Reporting turns the record set into the answer to a board question: how many people are off track, how many medicals expire this quarter, where are incidents concentrated. Administration is where the organisation, roles, traction and routes behind those numbers are defined.",
    heroShot: {
      src: "images/product/reporting-analytics-hero.jpg",
      alt: "Reporting and analytics dashboard visualisation.",
      scale: 0.5,
      bordered: true,
      full: true,
      hideCaption: true,
      noExpand: true,
    },
    hideHeroActions: true,
    hideCta: true,
    sections: [
      {
        heading: "Reporting and analytics",
        fullWidth: true,
        bulletTiles: true,
        crispShots: true,
        body: [
          "The reporting dashboard covers incidents, monitoring, medicals and competencies with totals, trends over time and breakdowns by type and role. Where add-on modules are active, safety-brief coverage and QA compliance rates appear alongside them.",
        ],
        bullets: [
          "**Live counts** for on-track, off-track, overdue and due-soon — updated from live record data, not a spreadsheet export.",
          "**Incident trends** charted over time and broken down by type, so clusters and repeats stand out in safety reviews.",
          "**Medical and competency expiry** windows surface renewals before they lapse — by period, role and status.",
          "**Add-on aware** Safety-brief and QA verification metrics appear when those modules are active.",
        ],
        shots: [
          {
            src: "images/screens/main-sys/reporting-analytics-dashboard.png",
            caption:
              "Reporting and analytics with headline metrics, compliance health and incident trends.",
            scale: 1,
            full: true,
            eager: true,
            noExpand: true,
          },
        ],
      },
      {
        heading: "Live compliance overview",
        fullWidth: true,
        bulletTiles: true,
        crispShots: true,
        mod: "reporting-compliance",
        body: [
          "The reporting home screen combines company-wide compliance counts with personal action items and team-level QA results. Three panes answer different questions from the same live record data, without exporting to a spreadsheet.",
        ],
        tiles: [
          {
            title: "My progress",
            detail:
              "Your personal messages, tasks, approvals and reminders in one place — see what needs your action without opening each record.",
            accent: "#34d399",
          },
          {
            title: "Compliance overview",
            detail:
              "Live counts from company records — on track, off track, overdue assessments, medical expiry, renewals due, medication follow-ups and open tasks in one view.",
            accent: "#38bdf8",
          },
          {
            title: "Your team's compliance",
            detail:
              "Live QA verification results per employee with review and advisory breakdowns, so managers can see who needs follow-up and open a verification run directly.",
            accent: "#f59e0b",
          },
        ],
        shots: [
          {
            src: "images/screens/main-sys/reporting-compliance-overview.png",
            caption:
              "Compliance overview counts, personal progress and team QA results on the reporting home screen.",
            scale: 1,
            full: true,
            noExpand: true,
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
    heroShot: {
      src: "images/screens/cab-passes/green-pass-issued-dark.png",
      caption: "Issued pass with QR — scan to verify without a login.",
      scale: 1,
      full: true,
    },
    showAppCta: false,
    cta: {
      heading: "Digital Cab Passes is included",
      body: "Issuing and managing digital cab passes is part of core Rail Intel. Showing pass status on verification reports requires the QA Verifications add-on.",
    },
    sections: [
      {
        heading: "Issue a digital cab pass in a few steps",
        body: [
          "From colour choice to QR verification, the flow stays on the employee record. No separate system, no login for the person scanning the pass.",
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
            src: "images/screens/cab-passes/issue-colour-question-popup-dark.png",
            step: "Step 1",
            title: "Pick the pass colour",
            lede: "Choose green, yellow, blue, red or black. Nothing is created until you confirm.",
            caption: "Colour selection before the pass is created.",
            scale: 1,
          },
          {
            src: "images/screens/cab-passes/issue-form-dark.png",
            step: "Step 2",
            title: "Fill in the details",
            lede: "Validity dates, routes, endorsements and issuer signature — the same fields as a standard driving cab pass.",
            caption: "Issue form — colour, validity, routes, endorsements and signature.",
            scale: 1,
            layout: "stack",
          },
          {
            src: "images/screens/cab-passes/issue-digital-pass-email-dark.png",
            step: "Step 3",
            title: "Issue and email",
            lede: "Save the pass for public QR verification and send the employee a copy with a view link.",
            caption: "Confirm digital issue and email delivery.",
            scale: 1,
          },
          {
            src: "images/screens/cab-passes/green-pass-issued-dark.png",
            step: "Step 4",
            title: "Scan to verify — no login",
            lede: "The QR sits beside the card. Anyone can open the live pass in a browser without a Rail Intel account.",
            caption: "Issued green driving cab pass with SCAN TO VERIFY.",
            scale: 1,
          },
          {
            src: "images/screens/cab-passes/pass-preview-actions-dark.png",
            step: "Step 5",
            title: "Manage from the preview",
            lede: "Expand, edit, view, renew, revoke or delete without leaving the Cab Passes tab.",
            caption: "Pass preview actions.",
            scale: 1,
            layout: "stack",
          },
          {
            src: "images/screens/cab-passes/expired-pass-issued-dark.png",
            step: "Step 6",
            title: "Expiry stays visible",
            lede: "Expired passes remain on the record with status clear at a glance, so history is never lost.",
            caption: "Expired pass with SCAN TO VERIFY still available for audit.",
            scale: 1,
          },
          {
            src: "images/screens/cab-passes/cab-passes-dark.png",
            step: "Step 7",
            title: "Passes on the employee record",
            lede: "Everything lands in one place — colour status, QR verification and renew / revoke controls.",
            caption: "Two digital passes on one record — including an expired blue pass and a live green assess pass.",
            scale: 1,
          },
        ],
      },
      {
        heading: "On QA verification reports",
        body: [
          "Digital Cab Passes is included as standard. When the QA Verifications add-on is purchased, cab pass status forms part of the employee verification report. Expired or unsigned passes surface as review items; in-date signed passes show as compliant — with a direct path back to Cab Passes to fix anything that needs attention.",
        ],
        bullets: [
          "**Cab Pass preview** on the verification report with colour, pass number and expiry.",
          "**Review vs Compliant** outcomes for each issued pass.",
          "**Fix in Cab Passes** from the report when a pass needs renewing or updating.",
        ],
        shotGrid: "hero-stack",
        shots: [
          {
            src: "images/screens/cab-passes/verification-report-cab-passes.png",
            caption: "Cab Passes on the verification report — expired blue pass for review, green assess pass compliant.",
            full: true,
            scale: 1,
          },
        ],
      },
    ],
  },

  {
    slug: "communications-hub",
    name: "Communications Hub",
    seoTitle: "Rail Communications Hub | Automated Emails & System Notifications",
    seoDescription:
      "Rail Intel's communications hub automates alert emails and in-app system notifications from conditional rules — competency expiries, incidents, medical renewals and on-record messaging.",
    seoKeywords:
      "rail competency notifications, automated compliance alerts, workforce email notifications, system notifications rail software",
    summary: "Automated emails and system notifications driven by conditional rules.",
    tagline: "Everything communicated — automatically",
    lead:
      "Rail Intel includes a built-in communications hub that turns conditional rules into action. Alert emails and in-app system notifications fire when competence lapses, medicals approach expiry, incidents are recorded, messages are raised or welfare follow-up is due — without anyone chasing a spreadsheet or inbox.",
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
      { name: "Administration", href: "features/administration.html" },
      { name: "Incidents & Monitoring", href: "features/incidents-monitoring.html" },
    ],
    sections: [
      {
        heading: "Rule-driven emails and system notifications",
        body: [
          "The communications hub sits behind the competency engine, not beside it. When a cycle lapses, a medical nears expiry or an incident enters a grace period, the right people are notified by email and in the application — managers see it on the dashboard feed, and the employee sees it on their record where permissions allow.",
          "That is the difference between a record system and a compliance system: Rail Intel does not wait for someone to notice a gap. Conditional rules decide what matters, and the hub delivers it.",
        ],
        bullets: [
          "**Competency and cycle expiry** alerts before someone reaches the railway out of date.",
          "**Medical and licence renewal** reminders on the dashboard and by email.",
          "**Incident and monitoring follow-up** when a rule requires action or welfare contact.",
          "**In-app system notifications** alongside email, so nothing depends on an inbox alone.",
        ],
        shots: [
          {
            src: "images/screens/messaging-employee/email-notify-new-message.png",
            caption: "Automated email when a new on-record message is raised.",
          },
        ],
      },
      {
        heading: "On-record messaging with email alerts",
        body: [
          "Conversations about competence, medicals or incidents stay on the employee record — not in a personal Outlook thread with no audit trail. When someone raises a note or message, the communications hub notifies the right recipients by email so the exchange is seen without anyone living in the CMS.",
        ],
        shots: [
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
      {
        heading: "Transactional messages your operation controls",
        body: [
          "Automated does not mean generic. Email templates for cab passes, assessments, incidents and operational events are configured in Administration, so your operation owns the wording while Rail Intel owns the timing and the rules that trigger each send.",
        ],
        shots: [
          {
            src: "images/screens/cab-passes/issue-digital-pass-email-dark.png",
            caption: "A cab pass issued by email — one example of a rule-triggered transactional message.",
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
  title: "Security built to protect your data",
  titleHtml:
    'Security built to <span class="hero-title__accent">protect</span> your data',
  lead:
    "Rail Intel protects competency, medical and safety records with company-scoped access, two-factor authentication and hosting on Microsoft Azure.",
  heroIntro: {
    heading: "Security in practice",
    body: [
      "Competency, medical and safety records only belong in the hands of authorised people. Rail Intel keeps each operator in its own tenant, ties every session to a named user and leaves sign-in policy under your administrators’ control — not the end user.",
    ],
  },
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
        body: "After a successful 2FA challenge, users may trust that browser for 14 days so later password logins can skip the second factor. The 14-day window and revocation rules are enforced by the platform — not configurable by end users. System administrators never skip. Trust is revoked when the password changes, when an administrator resets the authenticator or removes the device (for example when someone changes role or leaves), when the 14-day window expires, or when the sign-in location no longer matches (country, or coarse network if country is unknown).",
      },
    ],
    viewer: {
      shotGrid: "viewer",
      viewerLayout: "sidebar",
      viewerPartner: {
        kicker: "Works with standard authenticator apps",
        title: "Google Authenticator and other TOTP apps",
        body:
          "Rail Intel uses industry-standard time-based one-time passwords. Users scan a QR code once during enrolment, then enter a six-digit code at sign-in.",
        logo: "images/security/auth-apps/google-authenticator.png",
        apps: [
          {
            name: "Google Authenticator",
            icon: "images/security/auth-apps/google-authenticator.png",
          },
          {
            name: "Microsoft Authenticator",
            icon: "images/security/auth-apps/microsoft-authenticator.png",
          },
          { name: "Authy", icon: "images/security/auth-apps/authy.png" },
          { name: "1Password", icon: "images/security/auth-apps/1password.png" },
          { name: "Bitwarden", icon: "images/security/auth-apps/bitwarden.png" },
          { name: "Duo Mobile", icon: "images/security/auth-apps/duo-mobile.png" },
          {
            name: "Apple Passwords",
            icon: "images/security/auth-apps/apple-passwords.png",
          },
        ],
        note:
          "Any TOTP-compatible app works — including built-in authenticators on iOS and Android.",
      },
      shots: [
        {
          src: "images/screens/main-sys/login-screen-portrait.png",
          caption: "Sign-in with company code, email and password.",
          step: "01",
          portrait: true,
        },
        {
          src: "images/screens/main-sys/login-authenticator-code.png",
          caption: "Authenticator code challenge at sign-in.",
          step: "02",
          portrait: true,
        },
        {
          src: "images/screens/main-sys/account-two-factor.png",
          caption: "Re-enrol authenticator and manage trusted devices.",
          step: "03",
          portrait: true,
        },
      ],
    },
    rules: [
      {
        heading: "Policy is administered centrally",
        body: "System administrators configure 2FA from Administration → Security: authenticator on or off, email codes on or off, and company or user method overrides. Users cannot turn the requirement off themselves.",
      },
      {
        heading: "Enrolment at sign-in",
        body: "If authenticator 2FA is required and the user has not enrolled yet, they are guided through QR setup on the next sign-in before access is granted.",
      },
      {
        heading: "Administrator recovery",
        body: "Administrators can reset a user’s authenticator and enforce re-enrolment on the next sign-in. Re-enrolment needs the current authenticator or a backup code so a lost phone cannot silently replace a working second factor.",
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
    note:
      "Rail Intel is built on Microsoft Azure's enterprise-grade infrastructure. These certifications reflect the rigorous security, privacy, and compliance standards maintained by Microsoft for the underlying platform.",
    badges: [
      { src: "images/security/iso-27001.svg", label: "ISO 27001" },
      { src: "images/security/soc-2.svg", label: "SOC 2" },
      { src: "images/security/iso-27017.svg", label: "ISO 27017" },
      { src: "images/security/iso-27018.svg", label: "ISO 27018" },
    ],
  },
};

/* ----------------------------------------------------------- get started */

export const getStarted = {
  heroTitle: "Start onboarding with Rail Intel",
  welcome: {
    title: "Welcome and thank you for getting started",
    lead:
      "Our automated onboarding takes you smoothly from first application to a live CMS tenant. Complete the form below and we will keep you updated at every step with instant email confirmation when you submit.",
    steps: [
      {
        title: "Apply online",
        body: "Share your company details, contacts and module preferences in one guided application.",
      },
      {
        title: "Quote or pay",
        body: "Request a formal quotation or purchase directly — pricing and procurement are handled in the flow.",
      },
      {
        title: "Instant confirmation",
        body: "You and our team receive automated email notifications as soon as your application is submitted.",
      },
      {
        title: "Review & provision",
        body: "We review your application, configure your tenant and prepare administrator access.",
      },
      {
        title: "Go live",
        body: "Log in to CMS, invite your team and start onboarding your workforce.",
      },
    ],
  },
  poBanner: {
    label: "Purchase order (PO)",
    text:
      "If you wish to procure via purchase order, please follow the quotation path below. Each step is automated to provide a smooth, guided experience from quotation through to invoicing and CMS onboarding.",
  },
  procurementNotice: {
    heading: "Procurement & supplier onboarding",
    lead:
      "If your organisation needs supplier onboarding documents — company registration, bank details, insurance, Cyber Essentials, DPA and related assurance — you do not need a separate portal on this site.",
    body: [
      "Mention it in your application notes or when you speak to our team. If you request a quotation, we can include the procurement pack with that quote. You can also request the pack later at any stage.",
    ],
    items: [
      "Company registration & VAT",
      "Bank details letter",
      "Insurance certificates",
      "Cyber Essentials",
      "Data Processing Agreement",
      "DPIA support information",
    ],
  },
};

/* ------------------------------------------------------------- procurement */

/** CMS-managed supplier pack — not published as a public marketing page. */
export const procurement = {
  title: "Supplier procurement pack",
  titleHtml:
    'Supplier <span class="hero-title__accent">procurement</span> pack',
  lead:
    "Everything your procurement and AP teams typically need to onboard Rail Intel as a supplier — company registration, bank confirmation, insurance, security assurance, DPA and DPIA support information.",
  intro: {
    heading: "What this pack covers",
    body: [
      "Rail operators and infrastructure managers usually ask for a consistent core set of documents when onboarding a new software supplier. We keep ours current and published here so your team does not have to chase individual items by email.",
      "You will still need to complete your own Security Assessment Questionnaire in your format — but the supporting evidence, insurance certificates, bank letter, DPA terms and DPIA inputs below are ready to attach or copy across.",
    ],
  },
  sections: [
    {
      id: "company",
      heading: "Company registration & VAT",
      lead: "Legal entity details for your vendor master record.",
      static: true,
    },
    {
      id: "bank",
      heading: "Bank details",
      lead: "BACS payment details on letterheaded confirmation — as most buyers require.",
      static: false,
    },
    {
      id: "insurance",
      heading: "Insurance certificates",
      lead: "Employers' liability, public liability and professional indemnity (where advice or personal data is involved).",
      static: false,
    },
    {
      id: "cyber",
      heading: "Cyber Essentials",
      lead: "Evidence of baseline security controls — many buyers accept this alongside a lighter SAQ.",
      static: false,
    },
    {
      id: "dpa",
      heading: "Data Processing Agreement",
      lead: "Processor terms for personal data processed on your behalf in Rail Intel CMS.",
      static: false,
    },
    {
      id: "dpia",
      heading: "DPIA support information",
      lead: "Hosting location, subprocessors, retention and cross-border transfer position for your own Data Protection Impact Assessment.",
      static: false,
    },
    {
      id: "saq",
      heading: "SAQ readiness",
      lead: "Standard answers to common security questionnaire themes — map these into your buyer's own SAQ format.",
      static: false,
    },
  ],
  closing: {
    heading: "Need something else?",
    lead: "Contact our team if you need a signed DPA, additional assurance evidence, or help mapping answers into your procurement portal.",
    email: "sales@railintel.co.uk",
  },
};

/* ------------------------------------------------------------------- privacy */

export const privacy = {
  title: "Privacy policy",
  titleHtml:
    'Privacy <span class="hero-title__accent">policy</span>',
  lead:
    "How Rail Intel collects, uses and protects personal information on this website and in our rail competency and investigation products.",
  lastUpdated: "14 September 2026",
  contactEmail: "sales@railintel.co.uk",
  sections: [
    {
      heading: "Who we are",
      paragraphs: [
        "Rail Intel provides digital competency management and investigation software for the rail industry. This privacy policy explains how we handle personal information when you visit railintel.co.uk, subscribe to updates, apply to become a customer, or use Rail Intel CMS and Rail Intel Investigations.",
        "For personal data processed in Rail Intel CMS or Investigations on behalf of a rail operator or infrastructure manager, that customer is usually the data controller and Rail Intel acts as a data processor. A Data Processing Agreement is available as part of customer onboarding.",
      ],
    },
    {
      heading: "Information we collect on this website",
      paragraphs: [
        "**Newsletter and product updates.** If you subscribe via the footer form or register your interest on the homepage, we collect your email address and a source label (for example, website footer or expression of interest). We use a hidden honeypot field to help filter automated submissions.",
        "**Get started applications.** If you apply to onboard Rail Intel CMS, we collect company details (name and address), contact details (name, phone and email), your module selections, contract preferences, licence counts, optional notes, and — if you choose bank transfer — a purchase order document. If you pay by card, payment is handled by Stripe; we do not store full card numbers on our servers.",
        "**Contact form.** If you use our contact page, we collect your name, email, optional company and phone, department selection, message, and a Cloudflare Turnstile verification token to help prevent automated spam.",
        "**Technical information.** When you use this site, our hosting provider and CMS API may process standard server logs (such as IP address, browser type, request time and pages viewed) to deliver the site, prevent abuse and maintain security.",
        "**Browser storage on this site.** We use localStorage to remember when you have registered interest (so we do not show the prompt again) and sessionStorage to remember if you collapsed the interest panel. We do not use these stores for advertising or cross-site tracking.",
      ],
    },
    {
      heading: "How we use website information",
      paragraphs: [
        "We use the information above to respond to your enquiry, send product updates you have asked for, process onboarding applications and quotations, take payment where applicable, and improve our marketing site.",
        "We do not sell your personal information. We do not use third-party advertising or analytics trackers on this website.",
      ],
    },
    {
      heading: "Legal bases (UK GDPR)",
      paragraphs: [
        "Where UK GDPR applies, we rely on: **consent** when you subscribe to news or register interest; **contract** (or steps prior to contract) when you submit a get-started application or accept a quotation; **legitimate interests** to operate, secure and improve our website, prevent fraud and communicate with prospective customers in a proportionate way; and **legal obligation** where we must retain records for tax, accounting or regulatory purposes.",
      ],
    },
    {
      heading: "Rail Intel CMS and Investigations",
      paragraphs: [
        "When your organisation uses Rail Intel CMS or Rail Intel Investigations, personal data about your workforce is entered by authorised users in your tenant. Typical categories include identity and contact details, employment and role information, competency and assessment records, medical and occupational-health information, licence and training data, incident and investigation records, documents and photographs uploaded to employee files, audit logs, and authentication data (including two-factor enrolment where enabled).",
        "That data is stored in company-scoped tenants so one operator cannot access another’s records. Processing purposes, retention and subprocessors for customer data are set out in our Data Processing Agreement and procurement pack, which we provide during supplier onboarding.",
      ],
    },
    {
      heading: "Cookies and similar technologies",
      paragraphs: [
        "This marketing website does not set advertising cookies and does not show a cookie banner because we only use essential browser storage (localStorage and sessionStorage) for site functionality, as described above.",
        "Rail Intel CMS and Investigations use session cookies and similar technologies so authenticated users can stay signed in securely. Those applications have their own sign-in and security controls.",
        "We load typography from Google Fonts. When your browser requests those font files, Google may receive your IP address and basic technical data. You can limit this through your browser or network settings.",
      ],
    },
    {
      heading: "Third-party service providers",
      paragraphs: [
        "**Microsoft Azure** hosts Rail Intel CMS and Investigations (App Service, PostgreSQL and Azure Storage) in Europe unless otherwise agreed with a customer.",
        "**Stripe** processes card payments for self-serve purchase paths. Stripe’s privacy notice applies to payment data they handle directly.",
        "**Email delivery** providers may send transactional messages (for example, application confirmations, sign-in codes where configured, and product notifications).",
        "**Cloudflare Turnstile** on our contact form may process your IP address and browser signals to verify that submissions are from a human.",
        "We require processors that handle personal data on our behalf to protect it appropriately and only use it for the services they provide to us.",
      ],
    },
    {
      heading: "Retention",
      paragraphs: [
        "Newsletter subscriptions are kept until you unsubscribe or we no longer need the list for the purpose you signed up for.",
        "Get-started applications, quotations and related correspondence are kept for as long as needed to process your onboarding, meet contractual and accounting requirements, and resolve disputes.",
        "Customer workforce data in CMS or Investigations is retained according to your organisation’s contract and the Data Processing Agreement — typically for the life of the service agreement plus any agreed backup or legal-hold period.",
        "Server logs on the marketing site are retained for a limited operational period.",
      ],
    },
    {
      heading: "Your rights",
      paragraphs: [
        "If UK GDPR applies to our processing as controller (for example, newsletter or application data), you may have the right to access, rectify, erase, restrict or object to processing, and to data portability where relevant. You may withdraw consent at any time for consent-based processing.",
        "For workforce data held in CMS or Investigations, contact your employer or the organisation that provided you access — they are usually the controller. We will assist our customers with data-subject requests under the DPA.",
        "You also have the right to complain to the UK Information Commissioner’s Office (ICO) at ico.org.uk.",
      ],
    },
    {
      heading: "International transfers",
      paragraphs: [
        "We aim to host customer application data in the declared hosting (Azure) region. Where a subprocessor or support activity involves a transfer outside of Europe, we use appropriate safeguards (such as UK adequacy regulations, UK International Data Transfer Agreement addendum, or equivalent contractual protections) as described in our DPA.",
      ],
    },
    {
      heading: "Security",
      paragraphs: [
        "We protect personal data with company-scoped tenants, role-based access, two-factor authentication options, encryption in transit and at rest, and Microsoft Azure hosting. More detail is on our Security page.",
      ],
    },
    {
      heading: "Changes to this policy",
      paragraphs: [
        "We may update this policy when our services, legal requirements or data practices change. The “Last updated” date at the top of this page shows when it was last revised. Significant changes may also be highlighted on the website or communicated to subscribers where appropriate.",
      ],
    },
    {
      heading: "Contact us",
      paragraphs: [
        "Questions about this privacy policy or how we handle personal data on this website can be sent to sales@railintel.co.uk.",
        "Existing customers with data-protection or DPA questions should contact their Rail Intel account contact or email sales@railintel.co.uk.",
      ],
    },
  ],
};

/* ------------------------------------------------------------------- contact */

export const contact = {
  title: "Contact Rail Intel",
  titleHtml: 'Contact <span class="hero-title__accent">Rail Intel</span>',
  lead:
    "Questions about Rail Intel CMS, Investigations, onboarding, media, careers or billing — send a message and we will route it to the right team.",
  departments: ["Sales", "Media", "Careers", "Technical Support", "Billing/Accounts", "Other"],
  highlights: [
    {
      title: "Sales & onboarding",
      body: "Demos, pricing, procurement packs and getting your operation live on Rail Intel CMS.",
    },
    {
      title: "Technical support",
      body: "Help for existing CMS or Investigations customers — include your company code if you have one.",
    },
    {
      title: "Billing & accounts",
      body: "Invoices, purchase orders, supplier onboarding and payment queries.",
    },
  ],
  responseNote: "We aim to respond within one working day. Messages are delivered securely to our CMS admin team.",
  form: {
    title: "Send a message",
    lead: "Tell us how we can help. Required fields are marked with an asterisk.",
    submitLabel: "Send message",
    verifyLabel: "Verify you are human",
    verifyNote: "Protected by Cloudflare Turnstile to reduce automated spam.",
    successTitle: "Message sent",
    successLead:
      "Thank you — your enquiry has been delivered to our team. We will respond to your email as soon as possible, usually within one working day.",
  },
  /** Public Cloudflare Turnstile site key — override with TURNSTILE_SITE_KEY when building. */
  turnstileSiteKey: "0x4AAAAAAE0YUEWLIo5E7wJC",
};
