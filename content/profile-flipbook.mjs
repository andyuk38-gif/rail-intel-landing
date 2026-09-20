/**
 * Interactive brochure flipbook for the Printable Profile feature page.
 * Sample data only — not tied to live CMS records.
 */

const esc = (value) =>
  String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function brochureFooter(left, ref, part) {
  return `<footer class="brochure-page__footer">
    <span>${esc(left)}</span>
    <span>${esc(ref)}</span>
    <span>${esc(part)}</span>
  </footer>`;
}

function brochureHeader(title, meta) {
  return `<header class="brochure-page__header">
    <h2 class="brochure-page__title">${esc(title)}</h2>
    <p class="brochure-page__meta">${esc(meta)}</p>
  </header>`;
}

function field(label, value, wide) {
  const cls = wide ? " brochure-field brochure-field--wide" : " brochure-field";
  return `<div class="${cls.trim()}">
    <span class="brochure-field__label">${esc(label)}</span>
    <span class="brochure-field__value">${esc(value)}</span>
  </div>`;
}

function card(title, fieldsHtml) {
  return `<article class="brochure-card">
    <h3 class="brochure-card__title">${esc(title)}</h3>
    <div class="brochure-card__grid">${fieldsHtml}</div>
  </article>`;
}

function tableCard(title, headers, rows, compact) {
  const head = headers.map((h) => `<th>${esc(h)}</th>`).join("");
  const body = rows
    .map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`)
    .join("");
  const compactClass = compact ? " brochure-table--compact" : "";
  return `<article class="brochure-card">
    <h3 class="brochure-card__title">${esc(title)}</h3>
    <table class="brochure-table${compactClass}">
      <thead><tr>${head}</tr></thead>
      <tbody>${body}</tbody>
    </table>
  </article>`;
}

function sectionLabel(text) {
  return `<p class="brochure-section-label">${esc(text)}</p>`;
}

function sectionIntro(text) {
  return `<article class="brochure-card brochure-card--intro">
    <div class="brochure-card__prose"><p>${esc(text)}</p></div>
  </article>`;
}

function declarationPane(title, copy, signaturesHtml) {
  return `<article class="brochure-card brochure-card--declaration">
    <h3 class="brochure-card__title">${esc(title)}</h3>
    <div class="brochure-card__prose"><p>${esc(copy)}</p></div>
    <div class="brochure-declaration__signatures">${signaturesHtml}</div>
  </article>`;
}

function contentsPane(title, listHtml) {
  return `<article class="brochure-card brochure-card--contents">
    <h3 class="brochure-card__title">${esc(title)}</h3>
    <ol class="brochure-contents__list">${listHtml}</ol>
  </article>`;
}

function proseCard(title, paragraphs) {
  const copy = paragraphs.map((paragraph) => `<p>${esc(paragraph)}</p>`).join("");
  return `<article class="brochure-card brochure-card--prose">
    <h3 class="brochure-card__title">${esc(title)}</h3>
    <div class="brochure-card__prose">${copy}</div>
  </article>`;
}

function pill(text) {
  return `<span class="brochure-pill brochure-pill--ok">${esc(text)}</span>`;
}

function pageOpen(mod) {
  return `<div class="brochure-page${mod ? ` ${mod}` : ""}">`;
}

const FOOTER_LEFT = "Sarah Mitchell — confidential employee record";
const FOOTER_REF = "RV-RI2847-20260920";
const EMPLOYEE_META = "SARAH MITCHELL · RI-2847";

function partFooter(part, continued) {
  const label = continued ? `Part ${part} of 6 · continued` : `Part ${part} of 6`;
  return brochureFooter(FOOTER_LEFT, FOOTER_REF, label);
}

function pageHeader(title, meta, continued) {
  const continuedNote = continued ? `<p class="brochure-page__continued">Continued</p>` : "";
  return `<header class="brochure-page__header">
    <div class="brochure-page__heading">
      <h2 class="brochure-page__title">${esc(title)}</h2>
      ${continuedNote}
    </div>
    <p class="brochure-page__meta">${esc(meta)}</p>
  </header>`;
}

function detailPage(title, body, part, continued) {
  return `${pageOpen("brochure-page--detail")}
    <div class="brochure-page__geom brochure-page__geom--soft" aria-hidden="true"></div>
    <div class="brochure-page__body">
      ${pageHeader(title, EMPLOYEE_META, continued)}
      <div class="brochure-page__stack">${body}</div>
    </div>
    ${partFooter(part, continued)}
  </div>`;
}

function contentsPage(title, body, part, continued) {
  return `${pageOpen("brochure-page--contents")}
    <div class="brochure-page__geom brochure-page__geom--soft" aria-hidden="true"></div>
    <div class="brochure-page__body">
      ${pageHeader(title, EMPLOYEE_META, continued)}
      <div class="brochure-page__stack">${body}</div>
    </div>
    ${partFooter(part, continued)}
  </div>`;
}

function renderCoverPage(base) {
  const placeholder = "—";
  return `${pageOpen("brochure-page--cover")}
    <div class="brochure-page__geom" aria-hidden="true"></div>
    <div class="brochure-page__body brochure-cover__body">
      <header class="brochure-cover__brand">
        <img src="${base}images/rail-intel-icon.png" alt="" width="64" height="64" />
        <span class="brochure-cover__brand-text"><span>Rail</span> <span class="brochure-cover__brand-accent">Intel</span></span>
        <span class="brochure-cover__doc-type">
          <span>Rail Intel</span>
          <span>Employee record</span>
        </span>
      </header>
      <div class="brochure-cover__content">
        <div class="brochure-cover__hero">
          <p class="brochure-cover__kicker">Complete employee profile</p>
          <h1 class="brochure-cover__name">Employee profile</h1>
          <p class="brochure-cover__role">Competence record</p>
          <div class="brochure-cover__identity">
            <img
              class="brochure-cover__photo"
              src="${base}images/product/brochure-headshot.png"
              alt=""
              width="108"
              height="132"
              loading="lazy"
              decoding="async"
            />
            <div class="brochure-cover__facts">
              ${field("Employee ID", placeholder)}
              ${field("Company", placeholder)}
              ${field("Work status", placeholder)}
              ${field("Monitoring", placeholder)}
              ${field("Licence no.", placeholder)}
              ${field("Licence expiry", placeholder)}
            </div>
          </div>
          <p class="brochure-cover__stamp">Confidential · not for onward disclosure</p>
        </div>
        <article class="brochure-card brochure-cover__bottom-pane">
          <div class="brochure-cover__notice">
            <h3>Data protection notice</h3>
            <p>This document contains personal and special category data. Handle, store and dispose of it in line with UK GDPR, the Data Protection Act 2018 and applicable data protection laws in your jurisdiction.</p>
          </div>
          <div class="brochure-cover__footer">
            <div>
              <span class="brochure-cover__footer-label">Reference</span>
              <span class="brochure-cover__footer-value">RV-PROFILE-EXAMPLE</span>
            </div>
            <div>
              <span class="brochure-cover__footer-label">Produced</span>
              <span class="brochure-cover__footer-value">${placeholder}</span>
            </div>
            <div>
              <span class="brochure-cover__footer-label">Produced by</span>
              <span class="brochure-cover__footer-value">${placeholder}</span>
            </div>
          </div>
        </article>
      </div>
    </div>
  </div>`;
}

function renderContentsPage() {
  const body = `
      <div class="brochure-stats">
        <div class="brochure-stat"><strong>4</strong><span>Competences</span></div>
        <div class="brochure-stat"><strong>2</strong><span>Training</span></div>
        <div class="brochure-stat"><strong>1</strong><span>Medicals</span></div>
        <div class="brochure-stat"><strong>0</strong><span>Incidents</span></div>
      </div>
      ${card(
        "Profile summary",
        [
          field("Employee", "Sarah Mitchell"),
          field("Role", "Train Driver"),
          field("Depot", "Leeds Neville Hill"),
          field("Cycle status", "Active — 3 of 4 complete"),
          field("Medical fitness", "Fit for safety-critical duties"),
          field("Licence expiry", "11 Jan 2028"),
        ].join("")
      )}
      ${contentsPane(
        "Contents",
        `
          <li><span class="brochure-contents__num">01</span><span class="brochure-contents__text"><strong>Personal details & employment</strong><em>Personal & contact details · Employment & status</em></span><span class="brochure-contents__part">Part 2</span></li>
          <li><span class="brochure-contents__num">02</span><span class="brochure-contents__text"><strong>Licence & cab passes</strong><em>Train driving licence · Issued cab passes</em></span><span class="brochure-contents__part">Part 3</span></li>
          <li><span class="brochure-contents__num">03</span><span class="brochure-contents__text"><strong>Competence & training</strong><em>Route competence · Qualifications · Training records</em></span><span class="brochure-contents__part">Part 4</span></li>
          <li><span class="brochure-contents__num">04</span><span class="brochure-contents__text"><strong>Assessment cycles</strong><em>Assigned cycles · Cycle status</em></span><span class="brochure-contents__part">Part 5</span></li>
          <li><span class="brochure-contents__num">05</span><span class="brochure-contents__text"><strong>Medicals & fitness</strong><em>Medical examinations · Fitness declarations</em></span><span class="brochure-contents__part">Part 6</span></li>
        `
      )}`;
  return contentsPage("Summary & contents", body, 1, false);
}

function renderContentsContinuedPage() {
  const body = `
      ${card(
        "Record metadata",
        [
          field("Document reference", "RV-RI2847-20260920"),
          field("Generated", "20 Sep 2026, 09:15"),
          field("Produced by", "James Porter"),
          field("Record version", "Live extract"),
          field("Total sections", "6 parts"),
          field("Classification", "Confidential"),
        ].join("")
      )}
      ${declarationPane(
        "Declaration",
        "I confirm this profile was generated from the live employee record for authorised business use. All sections reflect the data held in Rail Intel at the time of production.",
        `
          <div class="brochure-signature">
            <span class="brochure-signature__mark" aria-hidden="true">J. Porter</span>
            <span class="brochure-signature__label">Produced by (signature)</span>
            <span class="brochure-signature__name">James Porter</span>
          </div>
          <div class="brochure-signature brochure-signature--blank">
            <span class="brochure-signature__line" aria-hidden="true"></span>
            <span class="brochure-signature__label">Received by (signature & date)</span>
          </div>
        `
      )}
      ${sectionIntro("Handle printed copies securely, limit disclosure to those with a business need, and dispose of them when no longer required in line with your organisation's data protection policy.")}`;
  return contentsPage("Summary & contents", body, 1, true);
}

function renderPersonalPage() {
  const body = `
      ${sectionIntro("Personal and contact details are taken from the employee record at export for depot verification and formal competence packs.")}
      ${sectionLabel("Personal & contact details")}
      ${card(
        "Identity",
        [
          field("Full name", "Sarah Mitchell"),
          field("Employee ID", "RI-2847"),
          field("Date of birth", "14 Mar 1988"),
          field("Place of birth", "York, UK"),
          field("National Insurance no.", "AB 12 34 56 C"),
          field("Gender", "Female"),
        ].join("")
      )}
      ${card(
        "Contact",
        [
          field("Work email", "s.mitchell@northernrail.example"),
          field("Mobile", "+44 7700 900 284"),
          field("Work phone", "0113 555 0142"),
          field("Address", "42 Station Road, Leeds", true),
          field("Postcode", "LS1 4DY"),
        ].join("")
      )}`;
  return detailPage("Personal details & employment", body, 2, false);
}

function renderPersonalContinuedPage() {
  const body = `
      ${sectionIntro("Employment status, role history and organisational details confirm the employee's current position and reporting line. This section supports rostering checks and management review.")}
      ${sectionLabel("Employment & status")}
      ${card(
        "Emergency contact",
        [field("Name", "David Mitchell"), field("Relationship", "Spouse"), field("Telephone", "+44 7700 900 301")].join("")
      )}
      ${card(
        "Position",
        [
          field("Job role", "Train Driver"),
          field("Depot / location", "Leeds Neville Hill"),
          field("Assessing manager", "James Porter"),
          field("Start date", "03 Jun 2014"),
          field("Company", "Northern Rail Services"),
          field("Work status", "Active"),
          field("Monitoring status", "Standard cycle"),
        ].join("")
      )}
      ${sectionIntro("Position and history fields reflect the live HR record. Printed profiles retain the assessing manager and monitoring status for competence oversight.")}`;
  return detailPage("Personal details & employment", body, 2, true);
}

function renderLicencePage() {
  const body = `
      ${sectionIntro("The train driving licence and issued cab passes confirm legal authority to drive and access the network. Both are checked against the live record before dispatch and rostering.")}
      ${sectionLabel("Train driving licence")}
      ${card(
        "Licence details",
        [
          field("Licence number", "UK-TDL-482910"),
          field("Issued", "12 Jan 2015"),
          field("Expires", "11 Jan 2028"),
          field("Categories", "A · B1"),
          field("Restrictions", "None recorded"),
          field("Last verified", "05 Sep 2026, 08:40 — J. Porter"),
        ].join("")
      )}
      ${sectionLabel("Cab passes")}
      ${tableCard(
        "Issued passes",
        ["Pass no.", "Type", "Issued", "Expires", "Issued by", "Digital"],
        [
          ["74291038", "Standard cab", "01 Apr 2026", "31 Mar 2027", "J. Porter", "Yes"],
          ["74291052", "Route familiarisation", "15 May 2026", "14 May 2027", "A. Reid", "Yes"],
          ["74291061", "Engineering train", "20 Jun 2026", "19 Jun 2027", "J. Porter", "Yes"],
        ],
        true
      )}`;
  return detailPage("Licence & cab passes", body, 3, false);
}

function renderLicenceContinuedPage() {
  const body = `
      ${sectionIntro("Route knowledge endorsements confirm which lines and traction types the driver may operate. Digital cab passes and route endorsements are checked together before dispatch.")}
      ${sectionLabel("Route knowledge endorsements")}
      ${tableCard(
        "Endorsed routes",
        ["Route", "Traction", "Endorsed", "Valid until", "Status"],
        [
          ["Leeds–York", "Class 158", "18 Aug 2026", "17 Aug 2028", pill("Current")],
          ["Cross-city", "Class 170", "02 May 2026", "01 May 2028", pill("Current")],
          ["Leeds–Harrogate", "Class 155", "10 Mar 2025", "09 Mar 2027", pill("Current")],
        ],
        true
      )}
      ${card(
        "Verification notes",
        [
          field("Last cab pass check", "01 Sep 2026"),
          field("Digital QR status", "Valid on all passes"),
          field("Route restrictions", "None recorded"),
          field("Next review", "01 Apr 2027"),
        ].join("")
      )}
      ${sectionIntro("Endorsements are renewed through formal route knowledge assessments. Printed profiles show endorsement date and validity for depot verification.")}`;
  return detailPage("Licence & cab passes", body, 3, true);
}

function renderCompetencePage() {
  const body = `
      ${sectionIntro("Route and traction competence is drawn from the live record at the moment of export. Assessments show the routes, traction types and validity periods currently held by the employee.")}
      ${sectionLabel("Trains & routes competence")}
      ${card(
        "Competence summary",
        [
          field("Routes endorsed", "4 active routes"),
          field("Traction types", "Class 155 · 158 · 170"),
          field("Last assessment", "18 Aug 2026"),
          field("Overall status", "Fully competent"),
          field("Assessor of record", "James Porter"),
          field("Next review", "15 Nov 2026"),
        ].join("")
      )}
      ${tableCard(
        "Competence assessments",
        ["Traction / route", "Assessed", "Assessor", "Result", "Expires"],
        [
          ["Class 158 · Leeds–York", "18 Aug 2026", "J. Porter", pill("Competent"), "17 Aug 2028"],
          ["Class 170 · Cross-city", "02 May 2026", "A. Reid", pill("Competent"), "01 May 2028"],
          ["Class 155 · Harrogate", "10 Mar 2025", "J. Porter", pill("Competent"), "09 Mar 2027"],
          ["Class 158 · York–Selby", "22 Nov 2024", "A. Reid", pill("Competent"), "21 Nov 2026"],
        ],
        true
      )}`;
  return detailPage("Competence & training", body, 4, false);
}

function renderCompetenceContinuedPage() {
  const body = `
      ${sectionIntro("Training and qualifications are maintained in line with operator standards and industry requirements. Mandatory safety training is refreshed on a fixed cycle; competence refreshes are triggered by route changes or at the assessment interval defined in the employee cycle.")}
      ${sectionLabel("Training & qualifications")}
      ${tableCard(
        "Qualifications",
        ["Qualification", "Type", "Certificate no.", "Obtained", "Expires"],
        [
          ["Personal Track Safety", "Safety critical", "PTS-88421", "10 Jan 2026", "09 Jan 2027"],
          ["Driver route learning", "Mandatory", "DRL-44210", "15 Mar 2015", "—"],
        ],
        true
      )}
      ${tableCard(
        "Training records",
        ["Course", "Type", "Attended", "Provider", "Status", "Expires"],
        [
          ["Emergency first aid", "Mandatory", "22 Jun 2026", "Northern Academy", pill("Completed"), "21 Jun 2029"],
          ["Route refresh — York", "Competence", "05 Aug 2026", "Northern Academy", pill("Completed"), "04 Aug 2028"],
          ["Safety briefing Q3", "Mandatory", "01 Sep 2026", "Depot briefing", pill("Completed"), "—"],
        ],
        true
      )}`;
  return detailPage("Competence & training", body, 4, true);
}

function renderCyclesPage() {
  const body = `
      ${sectionIntro("Assessment cycles group formal competence checks into a managed review period. The active cycle shows progress, outstanding items and the assessor responsible for sign-off.")}
      ${sectionLabel("Cycle overview")}
      ${tableCard(
        "Assigned cycles",
        ["Cycle", "Start", "Expiry", "Length", "Status"],
        [
          ["Continuous competency 2026", "01 Jan 2026", pill("31 Dec 2026"), "12 months", pill("Active")],
          ["Continuous competency 2025", "01 Jan 2025", "31 Dec 2025", "12 months", pill("Closed")],
        ],
        true
      )}
      ${card(
        "Cycle summary — 2026",
        [
          field("Assessments completed", "3 of 4"),
          field("Open development plans", "0"),
          field("Next review due", "15 Nov 2026"),
          field("Cycle assessor", "James Porter"),
          field("Outstanding items", "Route knowledge refresh"),
          field("Last assessment", "18 Aug 2026"),
        ].join("")
      )}`;
  return detailPage("Assessment cycles", body, 5, false);
}

function renderCyclesContinuedPage() {
  const body = `
      ${sectionIntro("Individual assessments within the current cycle are listed with due dates, completion status and outcomes. Monitoring notes capture assessor commentary and any follow-up actions.")}
      ${sectionLabel("Assessments in current cycle")}
      ${tableCard(
        "Completed & planned",
        ["Assessment", "Due", "Completed", "Assessor", "Outcome"],
        [
          ["Route knowledge — Leeds–York", "Aug 2026", "18 Aug 2026", "J. Porter", pill("Pass")],
          ["Competence review", "May 2026", "02 May 2026", "A. Reid", pill("Pass")],
          ["Observed driving", "Nov 2026", "—", "J. Porter", "Scheduled"],
          ["Rules & procedures", "Dec 2026", "—", "J. Porter", "Scheduled"],
        ],
        true
      )}
      ${card(
        "Monitoring notes",
        [
          field("Performance status", "Satisfactory"),
          field("Last monitoring review", "12 Aug 2026"),
          field("Actions raised", "None open"),
          field("Carryover items", "None"),
          field("Assessor comments", "Consistently strong route knowledge"),
          field("Next formal review", "15 Nov 2026"),
        ].join("")
      )}`;
  return detailPage("Assessment cycles", body, 5, true);
}

function renderMedicalsPage() {
  const body = `
      ${sectionIntro("Medical fitness records confirm the employee meets safety-critical standards. Examinations, screening results and declarations are reproduced from the occupational health record.")}
      ${sectionLabel("Medical examinations")}
      ${tableCard(
        "Fitness records",
        ["Examination", "Date", "Outcome", "Valid until", "Examiner"],
        [
          ["Periodic medical (safety critical)", "28 Feb 2026", pill("Fit"), "27 Feb 2028", "Dr. H. Marsh"],
          ["Vision screening", "28 Feb 2026", pill("Pass"), "27 Feb 2028", "Dr. H. Marsh"],
          ["Audiometry", "28 Feb 2026", pill("Pass"), "27 Feb 2028", "Dr. H. Marsh"],
        ],
        true
      )}
      ${card(
        "Latest fitness declaration",
        [
          field("Declared", "01 Sep 2026"),
          field("Medication changes", "None reported"),
          field("Restrictions", "None"),
          field("Next review", "28 Feb 2028"),
          field("Declared by", "Sarah Mitchell"),
          field("Reviewed by", "James Porter"),
          field("Fitness category", "Safety critical"),
          field("Night working", "Approved"),
        ].join("")
      )}`;
  return detailPage("Medicals & fitness", body, 6, false);
}

function renderMedicalsContinuedPage() {
  const body = `
      ${sectionIntro("Occupational health referrals, medical history and any restrictions are retained on the live record. Historic examinations provide an audit trail for safety-critical fitness decisions.")}
      ${sectionLabel("Occupational health & history")}
      ${card(
        "Occupational health & restrictions",
        [
          field("OH referral status", "Not required"),
          field("Last medication check", "01 Sep 2026"),
          field("Fitness category", "Safety critical"),
          field("Colour vision", "Normal — passed"),
          field("Driving restrictions", "None recorded"),
          field("Corrective lenses", "Required — prescription held"),
        ].join("")
      )}
      ${tableCard(
        "Medical history (summary)",
        ["Event", "Date", "Outcome", "Notes"],
        [
          ["Periodic medical", "28 Feb 2024", pill("Fit"), "No restrictions"],
          ["Periodic medical", "01 Mar 2022", pill("Fit"), "Renewed without conditions"],
        ],
        true
      )}
      ${sectionIntro("Any driving or route restrictions are shown prominently. Corrective lens requirements and occupational health follow-up dates are included for formal competence packs.")}`;
  return detailPage("Medicals & fitness", body, 6, true);
}

function renderBackCoverPage(base) {
  return `${pageOpen("brochure-page--back-cover")}
    <div class="brochure-page__geom" aria-hidden="true"></div>
    <div class="brochure-page__body brochure-back-cover__body">
      <div class="brochure-back-cover__panel">
        <img
          class="brochure-back-cover__logo"
          src="${base}images/rail-intel-icon.png"
          alt=""
          width="72"
          height="72"
          loading="lazy"
          decoding="async"
        />
        <p class="brochure-back-cover__brand"><span>Rail</span> <span class="brochure-cover__brand-accent">Intel</span></p>
        <p class="brochure-back-cover__tagline">Competence management for rail</p>
        <p class="brochure-back-cover__hint">Generated from the live employee record</p>
        <p class="brochure-back-cover__url">railintel.co.uk</p>
      </div>
      <footer class="brochure-back-cover__footer">
        <span>© Rail Intel</span>
        <span>Confidential employee record</span>
      </footer>
    </div>
  </div>`;
}

export function renderProfileFlipbookSection(base) {
  const pages = [
    renderCoverPage(base),
    renderContentsPage(),
    renderContentsContinuedPage(),
    renderPersonalPage(),
    renderPersonalContinuedPage(),
    renderLicencePage(),
    renderLicenceContinuedPage(),
    renderCompetencePage(),
    renderCompetenceContinuedPage(),
    renderCyclesPage(),
    renderCyclesContinuedPage(),
    renderMedicalsPage(),
    renderMedicalsContinuedPage(),
    renderBackCoverPage(base),
  ].join("\n");

  return `    <section class="profile-flipbook" aria-labelledby="profile-flipbook-heading">
      <div class="profile-flipbook__intro">
        <div class="profile-flipbook__intro-inner">
          <div class="profile-flipbook__intro-copy">
            <p class="product-eyebrow">Full-colour brochure</p>
            <h2 id="profile-flipbook-heading">Turn the pages of a live employee profile</h2>
            <p class="profile-flipbook__lead">Drag a corner, swipe on tablet, or use the controls below. This interactive sample uses fictional data, your printed profile is generated from the live record at the moment you create it.</p>
            <p class="profile-flipbook__sample-pill" role="note">The following is sample data and an example, which may not reflect the true sections and data contained within; this may vary.</p>
          </div>
        </div>
      </div>
      <div class="profile-flipbook__stage">
        <div class="profile-flipbook__stage-panel">
          <div class="profile-flipbook__book-wrap" data-flipbook-wrap>
            <div class="profile-flipbook__spread-fill profile-flipbook__spread-fill--left" data-spread-fill-back aria-hidden="true"></div>
            <div class="profile-flipbook__spread-fill profile-flipbook__spread-fill--right" data-spread-fill-forward aria-hidden="true" hidden></div>
            <div class="profile-flipbook__book" id="profile-flipbook" data-profile-flipbook>
${pages}
            </div>
            <div class="profile-flipbook__curl-guards" aria-hidden="true">
              <div class="profile-flipbook__curl-guard profile-flipbook__curl-guard--tl" data-flip-guard-back hidden></div>
              <div class="profile-flipbook__curl-guard profile-flipbook__curl-guard--bl" data-flip-guard-back hidden></div>
              <div class="profile-flipbook__curl-guard profile-flipbook__curl-guard--tr" data-flip-guard-forward hidden></div>
              <div class="profile-flipbook__curl-guard profile-flipbook__curl-guard--br" data-flip-guard-forward hidden></div>
            </div>
          </div>
          <div class="profile-flipbook__controls" aria-label="Brochure navigation">
          <button type="button" class="profile-flipbook__btn" data-flip-prev aria-label="Previous page">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <span>Previous</span>
          </button>
          <p class="profile-flipbook__status"><span data-flip-page>Page 1</span> <span class="profile-flipbook__hint" data-flip-hint>· drag corners to turn</span></p>
          <button type="button" class="profile-flipbook__btn" data-flip-next aria-label="Next page">
            <span>Next</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          </div>
        </div>
      </div>
    </section>`;
}
