/**
 * Interactive Organisation structure + role permissions demo (Administration).
 */
const ROLES = [
  "Competence Assessor / Internal Quality Assurer",
  "Depot Driver",
  "Driver Assessor",
  "Driver Instructor / Driver Trainer",
  "Driver Manager",
  "Human Resources",
  "Internal Quality Assurance (IQA)",
  "Operations Standards Manager",
  "Train Driver",
  "Trainee Train Driver",
  "Train Manager / Guard",
];

function roleCard(name, { focus = false, granted = null } = {}) {
  const focusClass = focus ? " is-focus" : "";
  const grantedHtml = granted
    ? `<span class="cms-role-pill">${granted}</span>`
    : `<p class="cms-role-card__granted">None granted</p>`;
  return `
                      <div class="cms-role-card${focusClass}">
                        <div class="cms-role-card__top">
                          <strong>${name}</strong>
                          <button type="button" class="cms-btn cms-btn--ghost" style="padding:0.35rem 0.55rem;font-size:0.7rem">Configure permissions</button>
                        </div>
                        <p class="cms-role-card__status">${granted ? "Extra permissions assigned for this role." : "No extra permissions assigned. This role has baseline access only."}</p>
                        <p class="cms-role-card__granted-label">Granted permissions</p>
                        ${grantedHtml}
                      </div>`;
}

function roleCards({ managerGranted = false, focusFirst = true } = {}) {
  return ROLES.map((name, i) =>
    roleCard(name, {
      focus: focusFirst && i === 0,
      granted: managerGranted && name === "Driver Manager" ? "Activate continuous cycles" : null,
    })
  ).join("");
}

export function renderCmsAdminOrgDemo() {
  const rolePills = ROLES.map(
    (name) => `
                            <li class="cms-org__role"><span>${name}</span><span aria-hidden="true">+</span></li>`
  ).join("");

  return `
      <div class="cms-demo reveal" data-cms-demo data-cms-labels="Organisation structure · seniority tiers and job roles.|Role permissions · baseline access per company job role.|Granular permissions · overrides and custom user access.">
        <div class="cms-demo__stage">
          <div class="browser-mockup browser-mockup--primary">
            <div class="browser-mockup__chrome">
              <span class="browser-mockup__dots"></span>
              <span class="browser-mockup__url">cms.railintel.co.uk/settings/organisation</span>
            </div>
            <div class="browser-mockup__content">
              <div class="cms-app" role="region" aria-label="Organisation and permissions interactive preview">
                <div class="cms-app__bar">
                  <div>
                    <h3 class="cms-app__title">Organisation &amp; permissions</h3>
                    <p class="cms-app__sub" data-cms-subtitle>Organisation structure · seniority tiers and job roles.</p>
                  </div>
                  <span class="cms-app__badge"><span class="cms-app__badge-dot" aria-hidden="true"></span> Dark mode</span>
                </div>

                <div class="cms-panel is-active" data-cms-panel="0">
                  <div class="cms-org__title-row">
                    <div class="cms-org__title-row-left">
                      <span class="cms-org__icon" aria-hidden="true">👥</span>
                      <div>
                        <h3 style="margin:0;font-size:1rem">Organisation Structure</h3>
                        <p style="margin:0.25rem 0 0;font-size:0.74rem;color:var(--cms-muted)">Visually map your management and reporting flow. Drag job roles from the palette into seniority tiers — the top tier is the most senior.</p>
                      </div>
                    </div>
                    <div class="cms-org__actions">
                      <button type="button" class="cms-btn cms-btn--ghost">Clear roles</button>
                      <button type="button" class="cms-btn cms-btn--lilac" data-cms-flash="Saved" data-cms-done="Saved ✓">Saved</button>
                    </div>
                  </div>
                  <div class="cms-org">
                    <aside class="cms-org__palette">
                      <div class="cms-org__palette-head">
                        <strong>Available roles</strong>
                        <span class="cms-org__count">11</span>
                      </div>
                      <p class="cms-org__hint">Drag a role into a tier, or use the + menu on each role. Drop a role back here to unassign it.</p>
                      <ul class="cms-org__roles">${rolePills}
                      </ul>
                      <p class="cms-org__placed">0 of 11 roles placed</p>
                    </aside>
                    <div class="cms-org__tiers">
                      <div class="cms-org__tier cms-org__tier--senior">
                        <div class="cms-org__tier-head">
                          <span class="cms-org__tier-num">1</span>
                          <strong>Executive / Director</strong>
                          <span class="cms-org__tier-badge">Most senior</span>
                        </div>
                        <div class="cms-org__drop">Drop roles here or use the + menu in the palette.</div>
                      </div>
                      <div class="cms-org__tier">
                        <div class="cms-org__tier-head">
                          <span class="cms-org__tier-num">2</span>
                          <strong>Senior Management</strong>
                          <span class="cms-org__tier-badge">Tier 2</span>
                        </div>
                        <div class="cms-org__drop">Drop roles here or use the + menu in the palette.</div>
                      </div>
                      <div class="cms-org__tier">
                        <div class="cms-org__tier-head">
                          <span class="cms-org__tier-num">3</span>
                          <strong>Management</strong>
                          <span class="cms-org__tier-badge">Tier 3</span>
                        </div>
                        <div class="cms-org__drop">Drop roles here or use the + menu in the palette.</div>
                      </div>
                      <div class="cms-org__tier">
                        <div class="cms-org__tier-head">
                          <span class="cms-org__tier-num">4</span>
                          <strong>Supervisors / Team Leaders</strong>
                          <span class="cms-org__tier-badge">Most junior</span>
                        </div>
                        <div class="cms-org__drop">Drop roles here or use the + menu in the palette.</div>
                      </div>
                      <div class="cms-org__add-tier">+ Add seniority tier</div>
                    </div>
                  </div>
                </div>

                <div class="cms-panel" data-cms-panel="1" hidden>
                  <div class="cms-org__title-row">
                    <div class="cms-org__title-row-left">
                      <span class="cms-org__icon" aria-hidden="true">🛡</span>
                      <div>
                        <h3 style="margin:0;font-size:1rem">Company role permissions</h3>
                        <p style="margin:0.25rem 0 0;font-size:0.74rem;color:var(--cms-muted)">Configure what each company job role can do. Admin-equivalent permissions remain reserved for company administrators.</p>
                      </div>
                    </div>
                    <button type="button" class="cms-btn cms-btn--lilac" data-cms-flash="Save changes" data-cms-done="Saved">Save changes</button>
                  </div>
                  <div class="cms-warn-banner">
                    <span aria-hidden="true">⚠</span>
                    Company admins can configure role permissions, but this page cannot grant admin-level access (team/user administration, permission administration, or equivalent powers).
                  </div>
                  <div class="cms-role-grid">${roleCards({ focusFirst: true })}
                  </div>
                </div>

                <div class="cms-panel" data-cms-panel="2" hidden>
                  <div class="cms-org__title-row">
                    <div class="cms-org__title-row-left">
                      <span class="cms-org__icon" aria-hidden="true">🛡</span>
                      <div>
                        <h3 style="margin:0;font-size:1rem">Company role permissions</h3>
                        <p style="margin:0.25rem 0 0;font-size:0.74rem;color:var(--cms-muted)">Configure what each company job role can do. Admin-equivalent permissions remain reserved for company administrators.</p>
                      </div>
                    </div>
                    <button type="button" class="cms-btn cms-btn--lilac" data-cms-flash="Save changes" data-cms-done="Saved">Save changes</button>
                  </div>
                  <div class="cms-warn-banner">
                    <span aria-hidden="true">⚠</span>
                    Company admins can configure role permissions, but this page cannot grant admin-level access (team/user administration, permission administration, or equivalent powers).
                  </div>
                  <div class="cms-role-grid">${roleCards({ managerGranted: true, focusFirst: false })}
                  </div>
                  <div class="cms-custom-perms">
                    <h4>Custom team member permissions</h4>
                    <p>Search for a specific user or employee, then configure custom permissions that override role defaults.</p>
                    <div class="cms-field">
                      <label for="cms-custom-user-search">Search users</label>
                      <input id="cms-custom-user-search" type="search" placeholder="Search by name, email, or title..." />
                    </div>
                    <p style="margin:0.55rem 0 0;font-size:0.72rem;color:var(--cms-faint)">Search and select a user to configure custom permissions.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="cms-demo__nav">
          <div class="cms-demo__tabs" role="group" aria-label="Organisation views">
            <button type="button" class="cms-demo__tab is-active" data-cms-tab="0" aria-pressed="true">Organisation structure</button>
            <button type="button" class="cms-demo__tab" data-cms-tab="1" aria-pressed="false">Role permissions</button>
            <button type="button" class="cms-demo__tab" data-cms-tab="2" aria-pressed="false">Granular permissions</button>
          </div>
          <p class="cms-demo__note"><strong>Interactive preview</strong> — switch views of how roles and permissions are configured.</p>
        </div>
      </div>`;
}
