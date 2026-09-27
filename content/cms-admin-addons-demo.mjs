/**
 * Interactive Add-ons + Investigations API demo (Administration).
 */

function addonCard({
  title,
  detail,
  icon,
  tone = "purple",
  state = "activated",
  trialLabel = "Start 14-day trial",
  seats = false,
}) {
  const action =
    state === "activated"
      ? `<button type="button" class="cms-btn cms-btn--activated${tone === "green" || tone === "teal" || tone === "orange" ? " is-green" : ""}">✓ Activated</button>`
      : `<button type="button" class="cms-btn cms-btn--${tone === "green" ? "green" : tone === "teal" ? "teal" : tone === "orange" ? "orange" : "lilac"}" data-cms-flash="${trialLabel}" data-cms-done="Trial started">${trialLabel}</button>`;

  const footer = seats
    ? `<p class="cms-addon__seats">1 of 2 administrator seats in use.</p>
                      <div class="cms-field">
                        <label>Additional seats to purchase</label>
                        <input type="number" value="1" min="1" aria-label="Additional seats to purchase" />
                      </div>
                      <button type="button" class="cms-btn cms-btn--orange" data-cms-flash="Purchase 1 additional seat (yearly)" data-cms-done="Queued">Purchase 1 additional seat (yearly)</button>`
    : `<p class="cms-addon__warn">Stripe is not fully configured yet; ask your system administrator to complete ${title} settings.</p>
                      ${action}`;

  return `
                    <div class="cms-addon">
                      <div class="cms-addon__top">
                        <span class="cms-addon__icon cms-addon__icon--${tone}" aria-hidden="true">${icon}</span>
                        <h4>${title}</h4>
                      </div>
                      <p>${detail}</p>
                      ${footer}
                    </div>`;
}

const ADDONS = [
  {
    title: "QA Verifications Module",
    detail: "Periodic verification runs against the live competence record.",
    icon: "📄",
    tone: "purple",
  },
  {
    title: "Task assignment",
    detail: "Assign and track operational tasks against employee records.",
    icon: "📋",
    tone: "purple",
  },
  {
    title: "Safety Briefs",
    detail: "Issue and acknowledge safety briefs across the workforce.",
    icon: "🛡",
    tone: "green",
  },
  {
    title: "Trainee Driver Module",
    detail: "Pathway, schedules and portfolio for trainee drivers.",
    icon: "🎓",
    tone: "purple",
  },
  {
    title: "Driver Reports",
    detail: "Structured driver reports from the cab and back office.",
    icon: "📑",
    tone: "teal",
  },
  {
    title: "Leave & Absence",
    detail: "Entitlements, requests and absence reporting.",
    icon: "📅",
    tone: "orange",
  },
  {
    title: "Medication Checks",
    detail: "Medication fitness checks tied to fitness for duty.",
    icon: "🩺",
    tone: "green",
  },
];

function addonGrid(mode) {
  const cards = ADDONS.map((addon) => {
    const activatedAlways = ["QA Verifications Module", "Leave & Absence"];
    const state =
      mode === "page"
        ? "activated"
        : activatedAlways.includes(addon.title)
          ? "activated"
          : "trial";
    return addonCard({ ...addon, state });
  }).join("");

  const licences = addonCard({
    title: "Company Admin Licences",
    detail:
      "Each company includes 2 company administrator seats. Purchase additional seats when you need more administrators in Team Management.",
    icon: "👥",
    tone: "orange",
    seats: true,
  });

  return cards + licences;
}

export function renderCmsAdminAddonsDemo() {
  return `
      <div class="cms-demo reveal" data-cms-demo data-cms-labels="Add-ons page · activated modules and admin seats.|Add-ons library · trials and activation.|Investigations API · pair CMS with Investigations.">
        <div class="cms-demo__stage">
          <div class="browser-mockup browser-mockup--primary">
            <div class="browser-mockup__chrome">
              <span class="browser-mockup__dots"></span>
              <span class="browser-mockup__url">cms.railintel.co.uk/settings/addons</span>
            </div>
            <div class="browser-mockup__content">
              <div class="cms-app" role="region" aria-label="Modules and integrations interactive preview">
                <div class="cms-app__bar">
                  <div>
                    <h3 class="cms-app__title">Modules &amp; integrations</h3>
                    <p class="cms-app__sub" data-cms-subtitle>Add-ons page · activated modules and admin seats.</p>
                  </div>
                  <span class="cms-app__badge"><span class="cms-app__badge-dot" aria-hidden="true"></span> Dark mode</span>
                </div>

                <div class="cms-panel is-active" data-cms-panel="0">
                  <div class="cms-card__head" style="margin-bottom:0.75rem">
                    <div>
                      <h3>Addons</h3>
                      <p>Bolt-on modules for your company. Storage capacity upgrades are managed from the Dashboard.</p>
                    </div>
                  </div>
                  <div class="cms-addon-grid">${addonGrid("page")}
                  </div>
                </div>

                <div class="cms-panel" data-cms-panel="1" hidden>
                  <div class="cms-card__head" style="margin-bottom:0.75rem">
                    <div>
                      <h3>Addons</h3>
                      <p>Bolt-on modules for your company — trial for 14 days or activate on subscription.</p>
                    </div>
                  </div>
                  <div class="cms-addon-grid">${addonGrid("library")}
                  </div>
                </div>

                <div class="cms-panel" data-cms-panel="2" hidden>
                  <div class="cms-org__title-row">
                    <div class="cms-org__title-row-left">
                      <span class="cms-org__icon" aria-hidden="true">🔑</span>
                      <div>
                        <h3 style="margin:0;font-size:1rem">Investigations API Management</h3>
                        <p style="margin:0.25rem 0 0;font-size:0.74rem;color:var(--cms-muted)">Pair Rail Intel CMS with the Investigations module. Tokens are created in Investigations admin and pasted here. You are linking Investigations for CMS company code <strong>56233</strong> only.</p>
                      </div>
                    </div>
                  </div>
                  <div class="cms-api-steps">
                    <div class="cms-card">
                      <div class="cms-card__head">
                        <div>
                          <h3>Step 1 — Paste the token from Investigations</h3>
                          <p>The token starts with <code>rvinv_</code>. The server calls the <code>/verify</code> endpoint to confirm pairing.</p>
                        </div>
                      </div>
                      <div class="cms-field">
                        <label for="cms-inv-url">Investigations base URL</label>
                        <input id="cms-inv-url" type="url" value="https://investigations.railintel.co.uk" />
                      </div>
                      <div class="cms-field" style="margin-top:0.55rem">
                        <label for="cms-inv-token">Pairing token</label>
                        <input id="cms-inv-token" type="text" placeholder="rvinv_5473_..." />
                      </div>
                      <div style="margin-top:0.75rem">
                        <button type="button" class="cms-btn cms-btn--lilac" data-cms-flash="Verify with Investigations" data-cms-done="Verified">Verify with Investigations</button>
                      </div>
                    </div>
                    <div class="cms-card">
                      <div class="cms-card__head">
                        <div>
                          <h3>Bound peers</h3>
                          <p>No Investigations tokens have been paired with this CMS yet. Paste a token above to start.</p>
                        </div>
                        <button type="button" class="cms-btn cms-btn--ghost" data-cms-flash="Refresh" data-cms-done="Up to date">Refresh</button>
                      </div>
                    </div>
                    <div class="cms-card">
                      <div class="cms-card__head">
                        <div>
                          <h3>How the multi-tenant pairing stays safe</h3>
                        </div>
                      </div>
                      <ul>
                        <li>Tokens are bound server-side to a single company code.</li>
                        <li>Approvals are rejected when tenant codes do not match.</li>
                        <li>The <code>/verify</code> challenge expires after 15 minutes.</li>
                        <li>API calls require <code>Authorization: Bearer</code> and <code>X-Investigations-Company</code>.</li>
                        <li>Revoking from either side breaks the link immediately.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="cms-demo__nav">
          <div class="cms-demo__tabs" role="group" aria-label="Modules views">
            <button type="button" class="cms-demo__tab is-active" data-cms-tab="0" aria-pressed="true">Add-ons page</button>
            <button type="button" class="cms-demo__tab" data-cms-tab="1" aria-pressed="false">Add-ons library</button>
            <button type="button" class="cms-demo__tab" data-cms-tab="2" aria-pressed="false">Investigations API</button>
          </div>
          <p class="cms-demo__note"><strong>Interactive preview</strong> — activate modules, trial add-ons, and pair Investigations.</p>
        </div>
      </div>`;
}
