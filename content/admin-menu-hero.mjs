/**
 * Faithful HTML record of the Administration fly-out menu shown in the CMS
 * (sidebar + administration panel), replacing the static adminmenu.png capture.
 */

const icon = (paths, viewBox = "0 0 24 24") =>
  `<svg class="admin-menu__icon" viewBox="${viewBox}" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;

const ICONS = {
  grid: icon('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>'),
  users: icon('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'),
  stethoscope: icon('<path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .2.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/>'),
  idCard: icon('<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M6 9h4"/><path d="M6 13h2"/><circle cx="16" cy="12" r="2"/>'),
  alert: icon('<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>'),
  chart: icon('<path d="M3 3v18h18"/><path d="M7 14v4"/><path d="M12 10v8"/><path d="M17 7v11"/>'),
  settings: icon('<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>'),
  help: icon('<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>'),
  inbox: icon('<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>'),
  logout: icon('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>'),
  chevronRight: icon('<path d="m9 18 6-6-6-6"/>'),
  chevronLeft: icon('<path d="m15 18-6-6 6-6"/>'),
  chevronDown: icon('<path d="m6 9 6 6 6-6"/>'),
  close: icon('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'),
  shield: icon('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/>'),
  fileCheck: icon('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="m9 15 2 2 4-4"/>'),
  graduation: icon('<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>'),
  calendar: icon('<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>'),
  briefcase: icon('<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><path d="M12 12v.01"/>'),
  scale: icon('<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>'),
  mail: icon('<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>'),
  wrench: icon('<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>'),
  clipboard: icon('<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M9 14h6"/><path d="M9 18h6"/>'),
  map: icon('<polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/>'),
  org: icon('<circle cx="12" cy="5" r="2.5"/><circle cx="5" cy="19" r="2.5"/><circle cx="19" cy="19" r="2.5"/><path d="M12 7.5V12"/><path d="M12 12H5v4.5"/><path d="M12 12h7v4.5"/>'),
  key: icon('<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/>'),
  upload: icon('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>'),
};

function navItem(label, iconKey, options = {}) {
  const classes = ["admin-menu__nav-item"];
  if (options.active) classes.push("is-active");
  if (options.accent) classes.push("is-accent");
  const chevron = options.chevron
    ? `<span class="admin-menu__nav-chevron" aria-hidden="true">${ICONS.chevronRight}</span>`
    : "";
  return `              <div class="${classes.join(" ")}">
                ${ICONS[iconKey]}
                <span>${label}</span>
                ${chevron}
              </div>`;
}

function flyItem(label, iconKey, group) {
  return `                <div class="admin-menu__fly-item" data-admin-group="${group}">
                  ${ICONS[iconKey]}
                  <span>${label}</span>
                </div>`;
}

export function renderAdminMenuHero(base) {
  const logo = `${base}images/rail-intel-icon.png`;

  return `        <figure class="shot shot--full admin-menu-shot reveal">
          <div class="admin-menu" data-admin-menu data-active-group="team" role="img" aria-label="The Administration fly-out menu — team management, module settings, storage and company configuration.">
            <div class="admin-menu__sidebar">
              <div class="admin-menu__brand">
                <img class="admin-menu__logo" src="${logo}" alt="" width="40" height="40" decoding="async" />
                <div>
                  <p class="admin-menu__brand-name">Rail Intel CMS</p>
                  <p class="admin-menu__brand-by">BY RAILINTEL.CO.UK</p>
                </div>
              </div>
              <div class="admin-menu__clock" aria-hidden="true">
                <span>09</span><span class="admin-menu__clock-sep">:</span><span>06</span><span class="admin-menu__clock-sep">:</span><span>18</span>
              </div>
              <div class="admin-menu__nav">
${navItem("Dashboard", "grid", { accent: true })}
${navItem("Employees", "users")}
${navItem("Medicals", "stethoscope")}
${navItem("Licencing", "idCard")}
${navItem("Incidents", "alert")}
${navItem("Reporting", "chart")}
${navItem("Administration", "settings", { active: true, chevron: true })}
              </div>
              <div class="admin-menu__nav admin-menu__nav--foot">
${navItem("Help &amp; Support", "help")}
${navItem("Addons", "inbox")}
${navItem("Logout", "logout")}
              </div>
              <div class="admin-menu__collapse">
                <span class="admin-menu__collapse-btn" aria-hidden="true">${ICONS.chevronLeft}</span>
                <span>COLLAPSE MENU</span>
              </div>
            </div>
            <div class="admin-menu__flyout">
              <div class="admin-menu__fly-head">
                <div>
                  <p class="admin-menu__fly-kicker">Administration</p>
                  <p class="admin-menu__fly-title">Menu</p>
                </div>
                <span class="admin-menu__fly-close" aria-hidden="true">${ICONS.close}</span>
              </div>
              <div class="admin-menu__fly-body">
                <div class="admin-menu__fly-group" data-admin-group-block="team">
${flyItem("Team Management", "shield", "team")}
                </div>
                <div class="admin-menu__fly-group" data-admin-group-block="modules">
${flyItem("QA Verifications", "fileCheck", "modules")}
${flyItem("Trainee", "graduation", "modules")}
${flyItem("Leave &amp; Absence", "calendar", "modules")}
                </div>
                <div class="admin-menu__storage" data-admin-group="storage" data-admin-group-block="storage">
                  <span>STORAGE</span>
                  <span aria-hidden="true">${ICONS.chevronRight}</span>
                </div>
                <div class="admin-menu__config" data-admin-group-block="config">
                  <div class="admin-menu__config-head" data-admin-group="config">
                    <span>COMPANY CONFIGURATION</span>
                    <span aria-hidden="true">${ICONS.chevronDown}</span>
                  </div>
                  <div class="admin-menu__config-list">
${flyItem("Custom Job Roles", "briefcase", "config")}
${flyItem("Grading Scale", "scale", "config")}
${flyItem("Company email templates", "mail", "config")}
${flyItem("Cycle Builder", "wrench", "config")}
${flyItem("Company Standards", "clipboard", "config")}
${flyItem("Traction, Routes &amp; Depots", "map", "config")}
${flyItem("Organisation Structure", "org", "config")}
${flyItem("Investigations module link", "key", "config")}
${flyItem("Role Permissions", "shield", "config")}
${flyItem("Company logo", "upload", "config")}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <figcaption class="shot__caption">The Administration fly-out menu — team management, module settings, storage and company configuration.</figcaption>
        </figure>`;
}
