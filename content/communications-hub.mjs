/**
 * Communications Hub feature page — interactive email template showcase
 * synced from Rail Intel CMS defaults (Rail-Vault/server.ts).
 */
import { emailTemplates } from "./email-templates.generated.mjs";

const esc = (value) =>
  String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const CATEGORY_META = {
  all: { label: "All templates", count: emailTemplates.length },
  instant: {
    label: "Instant alerts",
    count: emailTemplates.filter((t) => t.category === "instant").length,
  },
  scheduled: {
    label: "Scheduled alerts",
    count: emailTemplates.filter((t) => t.category === "scheduled").length,
  },
  account: {
    label: "Account & access",
    count: emailTemplates.filter((t) => t.category === "account").length,
  },
};

function fillTemplate(text, vars) {
  let out = String(text);
  for (const [key, value] of Object.entries(vars)) {
    out = out.replaceAll(`{{${key}}}`, String(value ?? ""));
  }
  return out.replace(/\{\{[a-zA-Z0-9_]+\}\}/g, "—");
}

/** Matches CMS prependEmailHeader() — logo is added when mail is sent; replicate for showcase previews. */
function prependEmailHeader(html, logoUrl) {
  const header = `<table border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;"><tr><td style="vertical-align: top; padding-right: 20px;"><img src="${logoUrl}" alt="Rail Intel" width="72" height="72" style="height: 72px; width: 72px; display: block; object-fit: contain; border: 0;" /></td><td style="vertical-align: top;"><p style="font-size: 18px; font-weight: 600; color: #1e293b; margin: 0 0 2px 0; line-height: 1.3;">Rail Intel Competency Management System</p><p style="font-size: 11px; color: #64748b; margin: 0; text-transform: uppercase; letter-spacing: 0.05em;">BY RAILINTEL.CO.UK</p></td></tr></table>`;
  const bodyMatch = html.match(/<body[^>]*>/i);
  if (bodyMatch) {
    const idx = html.indexOf(bodyMatch[0]) + bodyMatch[0].length;
    return html.slice(0, idx) + header + html.slice(idx);
  }
  return header + html;
}

function renderTemplateChip(template) {
  return `              <button type="button" class="comm-hub-rail__chip" data-comm-template="${esc(template.key)}" data-comm-category="${esc(template.category)}" data-comm-label="${esc(template.label)}" aria-pressed="false">
                <span class="comm-hub-rail__chip-dot comm-hub-rail__chip-dot--${esc(template.category)}" aria-hidden="true"></span>
                <span class="comm-hub-rail__chip-label">${esc(template.label)}</span>
              </button>`;
}

function renderTemplateStore(template, logoUrl) {
  const html = prependEmailHeader(fillTemplate(template.html, template.previewVars), logoUrl);
  const subject = fillTemplate(template.subject, template.previewVars);
  return `    <template data-comm-email="${esc(template.key)}" data-comm-subject="${esc(subject)}">${html}</template>`;
}

const SCHEDULED_ALERTS = [
  {
    title: "Assessment windows",
    detail: "Open and closing reminders for scheduled cycle events — emailed to assessing managers with window dates.",
    templates: ["assessment-window-open", "assessment-window-closing"],
  },
  {
    title: "Continuous cycle renewal",
    detail: "14-day approaching notice with checklist, or blocked renewal when events are missed or medicals lapse.",
    templates: ["continuous-cycle-renewal-approaching", "continuous-cycle-renewal-blocked"],
  },
  {
    title: "Train driving licence",
    detail: "3-month and 6-week renewal reminders, plus expired licence action when someone must come off track.",
    templates: ["licence-expiry-3m-reminder", "licence-expiry-6w-reminder", "licence-expiry-expired"],
  },
  {
    title: "Welfare & monitoring",
    detail: "Fatality anniversary support reminder seven days ahead, and trainee feedback chasers after seven days.",
    templates: ["fatality-anniversary-7d-reminder", "trainee_driver_feedback_reminder"],
  },
];

export function renderCommunicationsHubHero() {
  return `        <div class="comm-hub-hero-card" aria-label="Sample system notifications">
          <div class="comm-hub-hero-card__row">
            <span class="comm-hub-hero-card__dot"></span>
            <div>
              <strong>Assessment window closing soon</strong>
              <span>Route knowledge · Sarah Mitchell · email + in-app</span>
            </div>
          </div>
          <div class="comm-hub-hero-card__row">
            <span class="comm-hub-hero-card__dot"></span>
            <div>
              <strong>Licence renewal reminder</strong>
              <span>3 months before expiry · assessing manager</span>
            </div>
          </div>
          <div class="comm-hub-hero-card__row">
            <span class="comm-hub-hero-card__dot"></span>
            <div>
              <strong>New on-record message</strong>
              <span>Employee Messaging & Notes · instant alert</span>
            </div>
          </div>
          <div class="comm-hub-hero-card__row">
            <span class="comm-hub-hero-card__dot"></span>
            <div>
              <strong>Fatality welfare check reminder</strong>
              <span>7 days before anniversary · welfare contact due</span>
            </div>
          </div>
        </div>`;
}

const SYSTEM_NOTIFICATIONS = [
  {
    tone: "violet",
    title: "Task assigned to you",
    body: "Complete route knowledge refresh — due 15 Oct 2026",
    meta: "Task assignment · Just now",
  },
  {
    tone: "amber",
    title: "Leave request awaiting decision",
    body: "Sarah Mitchell — annual leave 1–5 Aug 2026",
    meta: "Leave & Absence · 2 min ago",
  },
  {
    tone: "sky",
    title: "Assessment window closing soon",
    body: "Route knowledge for Sarah Mitchell closes 30 Sep 2026",
    meta: "Competency cycle · 1 hour ago",
  },
  {
    tone: "rose",
    title: "Licence expired — action required",
    body: "Sarah Mitchell must be taken off track until licence renewed",
    meta: "Medicals & licensing · Today",
  },
  {
    tone: "indigo",
    title: "New on-record message",
    body: "Sarah Mitchell posted on Employee Messaging & Notes",
    meta: "Messaging · Yesterday",
  },
];

export function renderCommunicationsHubPage(base) {
  const logoUrl = "https://railintel.co.uk/images/rail-intel-icon.png";
  const railChips = emailTemplates.map(renderTemplateChip).join("\n");
  const templateStore = emailTemplates.map((t) => renderTemplateStore(t, logoUrl)).join("\n");
  const filters = Object.entries(CATEGORY_META)
    .map(
      ([key, meta], index) =>
        `          <button type="button" class="comm-hub-filter comm-hub-filter--${esc(key)}${index === 1 ? " is-active" : ""}" data-comm-filter="${esc(key)}" aria-pressed="${index === 1 ? "true" : "false"}">
            <span class="comm-hub-filter__label">${esc(meta.label)}</span>
            <span class="comm-hub-filter__count">${meta.count}</span>
            <span class="comm-hub-filter__progress" aria-hidden="true"></span>
          </button>`
    )
    .join("\n");

  const scheduledCards = SCHEDULED_ALERTS.map(
    (item) => `          <article class="comm-hub-schedule-card">
            <h3>${esc(item.title)}</h3>
            <p>${esc(item.detail)}</p>
            <ul class="comm-hub-schedule-card__templates">${item.templates
              .map((key) => {
                const tpl = emailTemplates.find((t) => t.key === key);
                return tpl
                  ? `<li><button type="button" data-comm-jump="${esc(key)}">${esc(tpl.label)}</button></li>`
                  : "";
              })
              .join("")}</ul>
          </article>`
  ).join("\n");

  const notificationItems = SYSTEM_NOTIFICATIONS.map(
    (item) => `            <article class="comm-hub-notify comm-hub-notify--${esc(item.tone)}">
              <div class="comm-hub-notify__icon" aria-hidden="true"></div>
              <div class="comm-hub-notify__copy">
                <h3>${esc(item.title)}</h3>
                <p>${esc(item.body)}</p>
                <p class="comm-hub-notify__meta">${esc(item.meta)}</p>
              </div>
            </article>`
  ).join("\n");

  const firstInstant = emailTemplates.find((t) => t.category === "instant") || emailTemplates[0];
  const firstSubject = fillTemplate(firstInstant.subject, firstInstant.previewVars);
  const firstLabel = firstInstant.label;
  const firstCategory = CATEGORY_META[firstInstant.category]?.label || firstInstant.category;

  return `
    <section class="comm-hub-showcase" aria-labelledby="comm-hub-showcase-heading">
      <div class="comm-hub-showcase__intro">
        <div class="container comm-hub-showcase__intro-inner">
          <div class="comm-hub-showcase__intro-copy">
            <p class="product-eyebrow">${emailTemplates.length} CMS email templates</p>
            <h2 id="comm-hub-showcase-heading">Browse every automated email Rail Intel sends</h2>
          </div>
            <p class="comm-hub-showcase__lead">Faithful replicas of the templates in Administration → Email templates. Categories rotate automatically, or pick a filter and template chip to explore. Sample data only.</p>
            <ul class="comm-hub-stats" aria-label="Communications hub at a glance">
              <li><strong>${emailTemplates.length}</strong><span>Email templates</span></li>
              <li><strong>${CATEGORY_META.scheduled.count}</strong><span>Scheduled alerts</span></li>
              <li><strong>${CATEGORY_META.instant.count}</strong><span>Instant notifications</span></li>
              <li><strong>Dual channel</strong><span>Email + in-app</span></li>
            </ul>
        </div>
      </div>

      <div class="container comm-hub-showcase__shell" data-comm-hub>
        <div class="comm-hub-showcase__filters" role="tablist" aria-label="Filter email templates">
${filters}
        </div>

        <div class="comm-hub-console">
          <div class="comm-hub-console__head">
            <div class="comm-hub-console__live" aria-hidden="true">
              <span class="comm-hub-console__live-dot"></span>
              <span>Live preview</span>
            </div>
            <div class="comm-hub-console__meta">
              <p class="comm-hub-console__title" data-comm-title>${esc(firstLabel)}</p>
              <p class="comm-hub-console__subject" data-comm-subject>${esc(firstSubject)}</p>
            </div>
            <span class="comm-hub-console__tag comm-hub-console__tag--instant" data-comm-tag>${esc(firstCategory)}</span>
          </div>

          <div class="comm-hub-mail" data-comm-mail>
            <div class="comm-hub-mail__chrome">
              <div class="comm-hub-mail__toolbar">
                <div class="comm-hub-mail__dots" aria-hidden="true"><span></span><span></span><span></span></div>
                <p class="comm-hub-mail__app">Outlook · Rail Intel notifications</p>
              </div>
              <div class="comm-hub-mail__envelope">
                <span>From</span> Rail Intel &lt;notifications@railintel.co.uk&gt;
                <span class="comm-hub-mail__envelope-sep">·</span>
                <span>To</span> alex.manager@northernrail.example
              </div>
            </div>
            <div class="comm-hub-mail__viewport" data-comm-viewport>
              <div class="comm-hub-mail__duo" data-comm-duo>
                <article class="comm-hub-mail__pane comm-hub-mail__pane--primary">
                  <header class="comm-hub-mail__pane-head">
                    <span class="comm-hub-mail__pane-eyebrow">Now showing</span>
                    <p class="comm-hub-mail__pane-title" data-comm-pane-title="primary">${esc(firstLabel)}</p>
                  </header>
                  <div class="comm-hub-mail__stage" data-comm-stage="primary">
                    <iframe class="comm-hub-mail__frame" data-comm-frame="primary" title="Current email template preview" sandbox="allow-same-origin" scrolling="no"></iframe>
                    <p class="comm-hub-mail__scroll-hint" aria-hidden="true">Scroll to read the full email</p>
                  </div>
                </article>
                <article class="comm-hub-mail__pane comm-hub-mail__pane--secondary">
                  <header class="comm-hub-mail__pane-head">
                    <span class="comm-hub-mail__pane-eyebrow">Up next</span>
                    <p class="comm-hub-mail__pane-title" data-comm-pane-title="secondary"></p>
                  </header>
                  <div class="comm-hub-mail__stage" data-comm-stage="secondary">
                    <iframe class="comm-hub-mail__frame" data-comm-frame="secondary" title="Next email template preview" sandbox="allow-same-origin" scrolling="no"></iframe>
                    <p class="comm-hub-mail__scroll-hint" aria-hidden="true">Scroll to read the full email</p>
                  </div>
                </article>
              </div>
            </div>
          </div>

          <div class="comm-hub-rail-wrap">
            <p class="comm-hub-rail__label">Templates in this category</p>
            <div class="comm-hub-rail" data-comm-rail tabindex="0" aria-label="Template selection">
${railChips}
            </div>
          </div>

          <div class="comm-hub-console__footer">
            <div class="comm-hub-progress" aria-hidden="true">
              <div class="comm-hub-progress__bar" data-comm-progress></div>
            </div>
            <p class="comm-hub-console__hint">Hover over this preview to pause automatic rotation while you explore.</p>
            <div class="comm-hub-console__controls">
              <button type="button" class="comm-hub-console__btn" data-comm-prev aria-label="Previous template">
                <span aria-hidden="true">←</span> Previous
              </button>
              <div class="comm-hub-console__status">
                <button type="button" class="comm-hub-console__play" data-comm-play aria-pressed="true" aria-label="Pause auto-rotate">
                  <span class="comm-hub-console__play-icon" aria-hidden="true"></span>
                  <span class="comm-hub-console__play-label">Pause</span>
                </button>
                <p data-comm-status>1 / ${emailTemplates.length}</p>
              </div>
              <button type="button" class="comm-hub-console__btn" data-comm-next aria-label="Next template">
                Next <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
${templateStore}
    </section>

    <section class="page-section comm-hub-section comm-hub-section--notify">
      <div class="container comm-hub-section__grid">
        <div class="comm-hub-section__copy">
          <p class="product-eyebrow">Email and system notifications</p>
          <h2>The same event reaches the inbox and the dashboard</h2>
          <p>Conditional rules across competency, medicals, licensing, incidents, monitoring and messaging drive both email alerts and in-app system notifications. Managers see items on the dashboard feed; employees see them on their record where permissions allow — nothing depends on an inbox alone.</p>
          <ul class="spec-list">
            <li><strong>Competency and cycle expiry</strong> before someone reaches the railway out of date.</li>
            <li><strong>Medical and licence renewal</strong> reminders on the dashboard and by email.</li>
            <li><strong>Incident and monitoring follow-up</strong> when welfare contact or action is required.</li>
            <li><strong>Tasks, leave, cab passes and messaging</strong> with matching in-app alerts.</li>
          </ul>
        </div>
        <div class="comm-hub-notify-feed" aria-label="Sample in-app notification feed">
          <div class="comm-hub-notify-feed__chrome">
            <span class="comm-hub-notify-feed__bell" aria-hidden="true"></span>
            <span>System notifications</span>
            <span class="comm-hub-notify-feed__badge">5</span>
          </div>
          <div class="comm-hub-notify-feed__list">
${notificationItems}
          </div>
        </div>
      </div>
    </section>

    <section class="page-section comm-hub-section comm-hub-section--schedule">
      <div class="container">
        <div class="page-section__head">
          <p class="product-eyebrow">Scheduled alerts</p>
          <h2>Time-based rules that run without anyone watching a calendar</h2>
          <p>Rail Intel's scheduler evaluates competence cycles, licence dates, continuous renewals and welfare milestones daily. When criteria match, the communications hub sends the right template — by email and as a system notification.</p>
        </div>
        <div class="comm-hub-schedule-grid">
${scheduledCards}
        </div>
      </div>
    </section>

    <section class="page-section comm-hub-section comm-hub-section--messaging">
      <div class="container comm-hub-section__grid comm-hub-section__grid--reverse">
        <div class="comm-hub-section__copy">
          <p class="product-eyebrow">On-record messaging</p>
          <h2>Conversations stay on the employee record — with email alerts</h2>
          <p>Notes about competence, medicals or incidents remain auditable on the profile, not buried in personal Outlook threads. When someone raises a message, the hub notifies the right recipients by email so the exchange is seen without anyone living in the CMS.</p>
        </div>
        <div class="comm-hub-shots">
          <figure class="shot reveal">
            <div class="shot__frame">
              <img src="${base}images/screens/messaging-employee/employee-messaging.png" alt="Messaging threads held against the employee record." width="781" height="490" loading="lazy" decoding="async" />
            </div>
            <figcaption class="shot__caption">Messaging threads on the employee record.</figcaption>
          </figure>
        </div>
      </div>
    </section>

    <section class="page-section comm-hub-section comm-hub-section--admin">
      <div class="container comm-hub-section__grid">
        <div class="comm-hub-section__copy">
          <p class="product-eyebrow">Your operation controls the wording</p>
          <h2>Automated does not mean generic</h2>
          <p>Company administrators configure email templates in Administration — cab passes, assessments, incidents, leave, tasks and operational events. Rail Intel owns the timing and the rules; you own the voice and branding.</p>
          <p class="comm-hub-admin-note">System templates cover scheduled compliance alerts; company-overridable templates include welcome messages, cab pass delivery, leave workflows, trainee communications and on-record messaging.</p>
        </div>
        <figure class="shot reveal">
          <div class="shot__frame">
            <img src="${base}images/screens/cab-passes/issue-digital-pass-email-dark.png" alt="Digital cab pass issued by email — one example of a configurable transactional template." width="433" height="289" loading="lazy" decoding="async" />
          </div>
          <figcaption class="shot__caption">Cab pass issued by email — configurable per company.</figcaption>
        </figure>
      </div>
    </section>`;
}
