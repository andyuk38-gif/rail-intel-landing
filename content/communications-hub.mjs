/**
 * Communications Hub feature page — interactive email template showcase
 * synced from Rail Intel CMS defaults (Rail-Vault/server.ts).
 */
import { emailTemplates } from "./email-templates.generated.mjs";

const esc = (value) =>
  String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const CATEGORY_META = {
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

export const COMM_HUB_SIGNALS = [
  {
    rule: "Competency cycle",
    event: "Assessment window closing soon",
    emailSubject: "Assessment window closes soon for Sarah Mitchell",
    notifyTitle: "Assessment window closing soon",
    notifyBody: "Route knowledge · closes 30 Sep 2026",
    tone: "sky",
  },
  {
    rule: "Medicals & licensing",
    event: "Licence renewal reminder",
    emailSubject: "Train driving licence renewal due in 3 months",
    notifyTitle: "Licence renewal reminder",
    notifyBody: "Sarah Mitchell · 3 months before expiry",
    tone: "amber",
  },
  {
    rule: "Employee messaging",
    event: "New on-record message",
    emailSubject: "New message on Employee Messaging & Notes",
    notifyTitle: "New on-record message",
    notifyBody: "Sarah Mitchell · Employee Messaging & Notes",
    tone: "indigo",
  },
  {
    rule: "Task assignment",
    event: "Task assigned to you",
    emailSubject: "New task assigned: Complete route knowledge refresh",
    notifyTitle: "Task assigned to you",
    notifyBody: "Due 15 Oct 2026 · Route knowledge",
    tone: "violet",
  },
  {
    rule: "Welfare follow-up",
    event: "Fatality welfare check reminder",
    emailSubject: "Fatality incident — welfare check due in 7 days",
    notifyTitle: "Welfare check reminder",
    notifyBody: "7 days before anniversary · contact due",
    tone: "rose",
  },
];

export function renderCommHubSignalPanel() {
  const first = COMM_HUB_SIGNALS[0];

  return `        <div class="comm-hub-signal-panel reveal" data-comm-signal-panel aria-label="How the communications hub routes one rule to email and in-app alerts">
          <div class="comm-hub-signal-panel__chrome">
            <span class="comm-hub-signal-panel__brand">Communications hub</span>
            <span class="comm-hub-signal-panel__live"><span class="comm-hub-signal-panel__live-dot" aria-hidden="true"></span> Conditional rule matched</span>
          </div>
          <div class="comm-hub-signal-panel__trigger" data-comm-signal-trigger>
            <p class="comm-hub-signal-panel__rule" data-comm-signal-rule>${esc(first.rule)}</p>
            <p class="comm-hub-signal-panel__event" data-comm-signal-event>${esc(first.event)}</p>
          </div>
          <div class="comm-hub-signal-panel__hub" aria-hidden="true">
            <span class="comm-hub-signal-panel__hub-core"></span>
            <span class="comm-hub-signal-panel__hub-beam comm-hub-signal-panel__hub-beam--email"></span>
            <span class="comm-hub-signal-panel__hub-beam comm-hub-signal-panel__hub-beam--app"></span>
          </div>
          <div class="comm-hub-signal-panel__channels">
            <article class="comm-hub-signal-panel__channel comm-hub-signal-panel__channel--email">
              <header class="comm-hub-signal-panel__channel-head">
                <span class="comm-hub-signal-panel__channel-icon comm-hub-signal-panel__channel-icon--email" aria-hidden="true"></span>
                <span>Email alert</span>
              </header>
              <p class="comm-hub-signal-panel__channel-line" data-comm-signal-email>${esc(first.emailSubject)}</p>
            </article>
            <article class="comm-hub-signal-panel__channel comm-hub-signal-panel__channel--app comm-hub-signal-panel__channel--${esc(first.tone)}" data-comm-signal-notify>
              <header class="comm-hub-signal-panel__channel-head">
                <span class="comm-hub-signal-panel__channel-icon comm-hub-signal-panel__channel-icon--app" aria-hidden="true"></span>
                <span>System notification</span>
              </header>
              <p class="comm-hub-signal-panel__channel-title" data-comm-signal-notify-title>${esc(first.notifyTitle)}</p>
              <p class="comm-hub-signal-panel__channel-meta" data-comm-signal-notify-body>${esc(first.notifyBody)}</p>
            </article>
          </div>
          <p class="comm-hub-signal-panel__tagline" data-comm-signal-tagline>Same event · inbox and dashboard · no manual chasing</p>
          <div class="comm-hub-signal-panel__progress" aria-hidden="true"><span data-comm-signal-progress></span></div>
        </div>
        <p class="comm-hub-signal-panel__caption">Rules across competency, medicals, incidents and messaging — delivered on two channels automatically.</p>`;
}

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
  const filterCategories = ["instant", "scheduled", "account"];
  const filters = filterCategories
    .map(
      (key, index) => {
        const meta = CATEGORY_META[key];
        return `          <button type="button" class="comm-hub-filter comm-hub-filter--${esc(key)}${index === 0 ? " is-active" : ""}" data-comm-filter="${esc(key)}" aria-pressed="${index === 0 ? "true" : "false"}">
            <span class="comm-hub-filter__label">${esc(meta.label)}</span>
            <span class="comm-hub-filter__count">${meta.count}</span>
            <span class="comm-hub-filter__progress" aria-hidden="true"></span>
          </button>`;
      }
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
          <div class="comm-hub-showcase__intro-head">
            <p class="product-eyebrow">${emailTemplates.length} CMS email templates</p>
            <h2 id="comm-hub-showcase-heading">Browse a few of our automated emails Rail Intel sends</h2>
            <p class="comm-hub-showcase__lead">Faithful replicas of the emails Rail Intel sends from the communications hub. Categories rotate automatically, or pick a filter and template chip to explore. Sample data only.</p>
          </div>
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
          <p>Conditional rules across competency, medicals, licensing, incidents, monitoring and messaging drive both email alerts and in-app system notifications. Managers see items on the dashboard feed; employees see them on their record where permissions allow, nothing depends on an inbox alone.</p>
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
              <img src="${base}images/screens/messaging-employee/employee-messaging.png" alt="Messaging threads held against the employee record." width="1024" height="485" loading="lazy" decoding="async" />
            </div>
            <figcaption class="shot__caption">Messaging threads on the employee record.</figcaption>
          </figure>
        </div>
      </div>
    </section>

    <section class="page-section comm-hub-section comm-hub-section--admin">
      <div class="container comm-hub-section__grid">
        <div class="comm-hub-section__copy">
          <p class="product-eyebrow">Maintained by Rail Intel</p>
          <h2>Automated does not mean generic</h2>
          <p>Every transactional email is written and maintained by Rail Intel — cab passes, assessments, incidents, leave, tasks and operational events. Company administrators do not author templates in the CMS; Rail Intel owns the timing, the rules and the wording, while your operation controls permissions and who receives each alert.</p>
          <p class="comm-hub-admin-note">Templates span scheduled compliance alerts, welcome and account access, cab pass delivery, leave workflows, trainee communications and on-record messaging — updated centrally so messaging stays consistent.</p>
        </div>
        <div class="comm-hub-section__media">
${renderCommHubSignalPanel()}
        </div>
      </div>
    </section>`;
}
