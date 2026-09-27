/**
 * Interactive demos for the Incidents & Monitoring feature page.
 * Light "ops thread" aesthetic — distinct from competency cycles dark mode.
 */

function demoShell({ url, title, subtitle, labels, tabs, panels, aria, note }) {
  const tabButtons = tabs
    .map(
      (label, i) =>
        `            <button type="button" class="im-demo__tab${i === 0 ? " is-active" : ""}" data-im-tab="${i}" aria-pressed="${i === 0 ? "true" : "false"}">${label}</button>`
    )
    .join("\n");

  return `      <div class="im-demo reveal" data-im-demo data-im-labels="${labels}">
        <div class="im-demo__stage">
          <div class="browser-mockup browser-mockup--primary">
            <div class="browser-mockup__chrome">
              <span class="browser-mockup__dots"></span>
              <span class="browser-mockup__url">${url}</span>
            </div>
            <div class="browser-mockup__content">
              <div class="im-app" role="region" aria-label="${aria}">
                <div class="im-app__bar">
                  <div>
                    <h3 class="im-app__title">${title}</h3>
                    <p class="im-app__sub" data-im-subtitle>${subtitle}</p>
                  </div>
                  <span class="im-app__badge"><span class="im-app__badge-dot" aria-hidden="true"></span> Dark mode</span>
                </div>
                <div class="im-thread" aria-hidden="true">
                  <span class="im-thread__rail"></span>
                  <span class="im-thread__node im-thread__node--1"></span>
                  <span class="im-thread__node im-thread__node--2"></span>
                  <span class="im-thread__node im-thread__node--3"></span>
                </div>
${panels}
              </div>
            </div>
          </div>
          <div class="im-demo__nav">
            <div class="im-demo__tabs" role="group" aria-label="${aria} views">
${tabButtons}
            </div>
            <p class="im-demo__note"><strong>${note}</strong></p>
          </div>
        </div>
      </div>`;
}

function recordPanel() {
  return `                <div class="im-panel is-active" data-im-panel="0">
                  <div class="im-page-head">
                    <div>
                      <h4 class="im-page-head__title">Incident Management</h4>
                      <p class="im-page-head__sub">Track and manage safety incidents</p>
                    </div>
                    <button type="button" class="im-btn im-btn--danger">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
                      Record Incident
                    </button>
                  </div>
                  <div class="im-modal is-open" data-im-record-modal>
                    <div class="im-modal__head">
                      <strong>Record New Incident</strong>
                      <button type="button" class="im-modal__close" aria-label="Close" tabindex="-1">×</button>
                    </div>
                    <div class="im-modal__body">
                      <div class="im-fields im-fields--2">
                        <div class="im-field">
                          <label for="im-emp">Employee</label>
                          <select id="im-emp" data-im-field>
                            <option>Select Employee</option>
                            <option selected>John Doe</option>
                            <option>Sarah Khan</option>
                          </select>
                        </div>
                        <div class="im-field">
                          <label for="im-date">Date of incident</label>
                          <input id="im-date" type="text" value="08/08/2026" readonly />
                        </div>
                        <div class="im-field">
                          <label for="im-type">Incident type</label>
                          <div class="im-seg" role="group" aria-label="Incident type">
                            <button type="button" class="im-seg__btn is-on" data-im-type="Collision">Collision</button>
                            <button type="button" class="im-seg__btn" data-im-type="SPAD">SPAD</button>
                            <button type="button" class="im-seg__btn" data-im-type="Near miss">Near miss</button>
                          </div>
                        </div>
                        <div class="im-field">
                          <label>Severity</label>
                          <div class="im-severity" role="group" aria-label="Severity">
                            <button type="button" class="im-severity__btn" data-im-sev="Low">Low</button>
                            <button type="button" class="im-severity__btn is-on" data-im-sev="Medium">Medium</button>
                            <button type="button" class="im-severity__btn" data-im-sev="High">High</button>
                          </div>
                        </div>
                      </div>
                      <div class="im-field">
                        <label for="im-summary">Incident summary</label>
                        <textarea id="im-summary" rows="2" data-im-typewriter placeholder="Brief description of what happened…"></textarea>
                      </div>
                      <div class="im-field">
                        <label for="im-action">Action taken / notes</label>
                        <textarea id="im-action" rows="2" placeholder="Immediate actions and follow-up…"></textarea>
                      </div>
                    </div>
                    <div class="im-modal__foot">
                      <button type="button" class="im-btn im-btn--ghost">Cancel</button>
                      <button type="button" class="im-btn im-btn--danger" data-im-flash="Record Incident" data-im-done="Incident recorded">Record Incident</button>
                    </div>
                  </div>
                </div>`;
}

function listPanel() {
  return `                <div class="im-panel" data-im-panel="1" hidden>
                  <div class="im-page-head">
                    <div>
                      <h4 class="im-page-head__title">Incident Management</h4>
                      <p class="im-page-head__sub">Track and manage safety incidents</p>
                    </div>
                    <button type="button" class="im-btn im-btn--danger">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
                      Record Incident
                    </button>
                  </div>
                  <div class="im-stats" aria-hidden="true">
                    <div class="im-stat"><strong>2</strong><span>Open</span></div>
                    <div class="im-stat"><strong>1</strong><span>Medium+</span></div>
                    <div class="im-stat"><strong>5</strong><span>This period</span></div>
                    <div class="im-stat im-stat--teal"><strong>1</strong><span>Awaiting CDP</span></div>
                  </div>
                  <div class="im-table-wrap">
                    <table class="im-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Employee</th>
                          <th>Type</th>
                          <th>Severity</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr class="im-row is-live" data-im-row>
                          <td><strong>15-07-2026</strong></td>
                          <td>John Doe</td>
                          <td>Collision</td>
                          <td><span class="im-pill im-pill--amber">Medium</span></td>
                          <td><span class="im-status"><span class="im-status__dot" aria-hidden="true"></span>Open</span></td>
                          <td>
                            <span class="im-row-actions">
                              <button type="button" class="im-icon-btn" aria-label="View" tabindex="-1">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
                              </button>
                              <button type="button" class="im-icon-btn" aria-label="Edit" tabindex="-1">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>
                              </button>
                              <button type="button" class="im-icon-btn im-icon-btn--danger" aria-label="Delete" tabindex="-1">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M9 7V5h6v2m-8 0l1 12h8l1-12"/></svg>
                              </button>
                            </span>
                          </td>
                        </tr>
                        <tr class="im-row" data-im-row>
                          <td><strong>02-06-2026</strong></td>
                          <td>Sarah Khan</td>
                          <td>Near miss</td>
                          <td><span class="im-pill im-pill--teal">Low</span></td>
                          <td><span class="im-status im-status--closed">Closed</span></td>
                          <td>
                            <span class="im-row-actions">
                              <button type="button" class="im-icon-btn" aria-label="View" tabindex="-1">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
                              </button>
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>`;
}

function allocatedPanel() {
  return `                <div class="im-panel" data-im-panel="2" hidden>
                  <div class="im-card">
                    <div class="im-card__head">
                      <div class="im-card__title">
                        <span class="im-card__icon im-card__icon--warn" aria-hidden="true">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>
                        </span>
                        <h4>Incidents allocated to this employee</h4>
                      </div>
                    </div>
                    <div class="im-table-wrap">
                      <table class="im-table im-table--compact">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Severity</th>
                            <th>Action taken</th>
                            <th>Options</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr class="im-row is-live" data-im-row>
                            <td>15-07-2026</td>
                            <td><strong>Collision</strong></td>
                            <td><span class="im-pill im-pill--amber">Medium</span></td>
                            <td>No Actions Currently</td>
                            <td>
                              <button type="button" class="im-btn im-btn--ghost im-btn--sm">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
                                View
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div class="im-link-chip" aria-hidden="true">
                    <span class="im-link-chip__pulse"></span>
                    Linked to employee record · ready for CDP
                  </div>
                </div>`;
}

function monitoringOverviewPanel() {
  return `                <div class="im-panel is-active" data-im-panel="0">
                  <div class="im-tabs-row" aria-hidden="true">
                    <span class="im-chip-tab">Overview</span>
                    <span class="im-chip-tab">Medical</span>
                    <span class="im-chip-tab">Licensing</span>
                    <span class="im-chip-tab">Operations</span>
                    <span class="im-chip-tab is-on">Development</span>
                    <span class="im-chip-tab">Workspace</span>
                    <span class="im-viewing">NOW VIEWING Monitoring &amp; Incidents</span>
                  </div>
                  <div class="im-alert" role="status">
                    <span class="im-alert__icon" aria-hidden="true">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>
                    </span>
                    <strong>NOT SAFE TO WORK</strong> — Mandatory competency expired.
                  </div>
                  <div class="im-card">
                    <div class="im-card__head">
                      <div class="im-card__title">
                        <span class="im-card__icon im-card__icon--teal" aria-hidden="true">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                        </span>
                        <div>
                          <h4>Performance &amp; Support plans</h4>
                          <p>Raised when a trainee needs additional support.</p>
                        </div>
                      </div>
                      <button type="button" class="im-btn im-btn--primary im-btn--sm">+ New plan</button>
                    </div>
                    <div class="im-empty">
                      <span aria-hidden="true">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M8 4h7l3 3v13H8z"/><path d="M15 4v3h3M9 12h6M9 16h4"/></svg>
                      </span>
                      No performance &amp; support plans recorded.
                    </div>
                  </div>
                  <div class="im-card">
                    <div class="im-card__head">
                      <div class="im-card__title">
                        <span class="im-card__icon im-card__icon--warn" aria-hidden="true">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>
                        </span>
                        <h4>Incidents allocated to this employee</h4>
                      </div>
                    </div>
                    <div class="im-mini-row">
                      <span>15-07-2026</span>
                      <strong>Collision</strong>
                      <span class="im-pill im-pill--amber">Medium</span>
                      <span class="im-mini-row__muted">No Actions Currently</span>
                      <button type="button" class="im-btn im-btn--ghost im-btn--sm">View</button>
                    </div>
                  </div>
                  <div class="im-card">
                    <div class="im-card__head">
                      <div class="im-card__title">
                        <span class="im-card__icon im-card__icon--teal" aria-hidden="true">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 4h7l3 3v13H8z"/><path d="M15 4v3h3"/></svg>
                        </span>
                        <h4>Competence Development Plans (CDP)</h4>
                      </div>
                      <div class="im-toggle" role="group" aria-label="Plan filter">
                        <button type="button" class="im-toggle__btn is-on" data-im-cdp-filter="live">Live plans (1)</button>
                        <button type="button" class="im-toggle__btn" data-im-cdp-filter="closed">Closed plans (0)</button>
                      </div>
                    </div>
                    <article class="im-plan is-active-plan" data-im-cdp-card>
                      <div class="im-plan__main">
                        <strong>Reactive</strong>
                        <p>20-07-2026 to 19-08-2026 · Duration: 1 month</p>
                        <p class="im-plan__link">Linked incident: 15-07-2026 — Collision (Medium)</p>
                      </div>
                      <div class="im-plan__actions">
                        <span class="im-pill im-pill--green">ACTIVE</span>
                        <button type="button" class="im-btn im-btn--ghost im-btn--sm" data-im-events-btn>
                          Monitoring events
                          <span class="im-count" data-im-event-count>1</span>
                        </button>
                        <button type="button" class="im-btn im-btn--ghost im-btn--sm">Open plan page</button>
                      </div>
                    </article>
                  </div>
                </div>`;
}

function cdpDetailPanel() {
  return `                <div class="im-panel" data-im-panel="1" hidden>
                  <div class="im-page-head">
                    <div>
                      <h4 class="im-page-head__title">Reactive CDP Plan Page</h4>
                      <p class="im-page-head__sub">Define monitoring events, apply to the live cycle, and carry overflow forward.</p>
                    </div>
                    <button type="button" class="im-btn im-btn--ghost">Back to list</button>
                  </div>
                  <div class="im-meta">
                    <div><span>Start</span><strong>20-07-2026</strong></div>
                    <div><span>End</span><strong>19-08-2026</strong></div>
                    <div><span>Status</span><span class="im-pill im-pill--green">Active</span></div>
                    <div class="im-meta__wide">
                      <span>Apply to live cycle</span>
                      <select>
                        <option>ML Driver v3 (18-07-2026 to 18-07-2028)</option>
                      </select>
                    </div>
                  </div>
                  <div class="im-card">
                    <p class="im-label">Monitoring events (assessment-style schedule)</p>
                    <div class="im-event-row">
                      <span class="im-event-row__num">1</span>
                      <div class="im-field im-field--grow">
                        <label>Monitoring event name</label>
                        <input type="text" value="Monitoring Review" readonly />
                      </div>
                      <div class="im-field">
                        <label>Method</label>
                        <select><option>Practical</option><option>Explain</option></select>
                      </div>
                      <div class="im-field im-field--narrow">
                        <label>Open</label>
                        <input type="text" value="0" readonly />
                      </div>
                      <div class="im-field im-field--narrow">
                        <label>Close</label>
                        <input type="text" value="1" readonly />
                      </div>
                      <label class="im-check">
                        <input type="checkbox" checked data-im-add-event />
                        <span>Add</span>
                      </label>
                    </div>
                    <div class="im-field" style="margin-top:0.65rem">
                      <label>Description</label>
                      <textarea rows="2" placeholder="Describe what this monitoring event covers."></textarea>
                    </div>
                    <div class="im-card__foot">
                      <button type="button" class="im-btn im-btn--ghost">+ Add monitoring event</button>
                      <button type="button" class="im-btn im-btn--primary" data-im-flash="Save &amp; Apply" data-im-done="Applied to cycle">Save &amp; Apply</button>
                    </div>
                  </div>
                </div>`;
}

function supportRaisePanel() {
  return `                <div class="im-panel is-active" data-im-panel="0">
                  <div class="im-card">
                    <div class="im-card__head">
                      <div class="im-card__title">
                        <span class="im-card__icon im-card__icon--teal" aria-hidden="true">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                        </span>
                        <div>
                          <h4>Performance &amp; Support plans</h4>
                          <p>Each plan must be signed by both the trainer and the trainee.</p>
                        </div>
                      </div>
                      <button type="button" class="im-btn im-btn--ghost">Cancel</button>
                    </div>
                    <div class="im-form">
                      <div class="im-field">
                        <label for="im-plan-title">Plan title</label>
                        <input id="im-plan-title" type="text" data-im-plan-title placeholder="e.g. Route knowledge support plan" value="" />
                      </div>
                      <div class="im-field">
                        <label for="im-plan-reason">Reason</label>
                        <textarea id="im-plan-reason" rows="2" placeholder="Why is this plan being raised?"></textarea>
                      </div>
                      <div class="im-field">
                        <label for="im-plan-summary">Summary</label>
                        <textarea id="im-plan-summary" rows="2" placeholder="Background and current situation"></textarea>
                      </div>
                      <div class="im-field">
                        <label for="im-plan-actions">Support actions</label>
                        <textarea id="im-plan-actions" rows="2" placeholder="Actions, support and resources"></textarea>
                      </div>
                      <div class="im-fields im-fields--2">
                        <div class="im-field">
                          <label for="im-plan-review">Review date</label>
                          <input id="im-plan-review" type="text" placeholder="dd/mm/yyyy" value="30/08/2026" />
                        </div>
                        <div class="im-field">
                          <label for="im-plan-trainer">Trainer name</label>
                          <input id="im-plan-trainer" type="text" value="Andy Hill" />
                        </div>
                      </div>
                      <button type="button" class="im-btn im-btn--primary" data-im-create-plan>Create support plan</button>
                    </div>
                  </div>
                </div>`;
}

function supportDetailPanel() {
  return `                <div class="im-panel" data-im-panel="1" hidden>
                  <div class="im-card im-card--plan">
                    <div class="im-card__head">
                      <div>
                        <h4 class="im-plan-title" data-im-plan-display-title>Work Attendance</h4>
                        <p class="im-plan-meta">Raised 11 Aug 2026 by Andy Hill · Review 30 Aug 2026</p>
                      </div>
                      <span class="im-pill im-pill--slate">In progress</span>
                    </div>
                    <dl class="im-dl">
                      <div>
                        <dt>Reason</dt>
                        <dd>To help and support individual for timekeeping and preparing for safety critical duties.</dd>
                      </div>
                      <div>
                        <dt>Summary</dt>
                        <dd>Individual has been late for duty many times, including after verbal warnings.</dd>
                      </div>
                      <div>
                        <dt>Support actions</dt>
                        <dd>
                          <ul class="im-action-list">
                            <li data-im-action-item><button type="button" class="im-check-btn" data-im-tick aria-pressed="false"></button> Check in with manager daily</li>
                            <li data-im-action-item><button type="button" class="im-check-btn" data-im-tick aria-pressed="false"></button> Sign attendance sheet with supervisor</li>
                          </ul>
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>`;
}

function supportSubmittedPanel() {
  return `                <div class="im-panel" data-im-panel="2" hidden>
                  <div class="im-card">
                    <div class="im-card__head">
                      <div class="im-card__title">
                        <span class="im-card__icon im-card__icon--teal" aria-hidden="true">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                        </span>
                        <div>
                          <h4>Performance &amp; Support plans</h4>
                          <p>Signed plans stay on the record for audit.</p>
                        </div>
                      </div>
                      <button type="button" class="im-btn im-btn--primary im-btn--sm">+ New plan</button>
                    </div>
                    <article class="im-card im-card--nested">
                      <div class="im-card__head">
                        <div>
                          <h4>Work Attendance <span class="im-pill im-pill--slate">Closed</span></h4>
                          <p class="im-plan-meta">Raised 11 Aug 2026 by Andy Hill · Review 30 Aug 2026</p>
                        </div>
                      </div>
                      <dl class="im-dl im-dl--compact">
                        <div><dt>Reason</dt><dd>To help and support individual for timekeeping and preparing for safety critical duties.</dd></div>
                        <div><dt>Summary</dt><dd>Individual has been late for duty many times, including after verbal warnings.</dd></div>
                        <div><dt>Support actions</dt><dd>Check in with manager daily · Sign attendance sheet with supervisor.</dd></div>
                      </dl>
                      <div class="im-signs">
                        <div class="im-sign" data-im-sign="trainer">
                          <p class="im-label">Trainer signature</p>
                          <p class="im-sign__status" data-im-sign-status>Not yet signed.</p>
                          <button type="button" class="im-btn im-btn--ghost im-btn--sm" data-im-sign-btn>Sign as trainer</button>
                        </div>
                        <div class="im-sign" data-im-sign="trainee">
                          <p class="im-label">Trainee signature</p>
                          <p class="im-sign__status">Awaiting trainee acknowledgement.</p>
                        </div>
                      </div>
                    </article>
                  </div>
                </div>`;
}

export function renderIncidentsRecordDemo() {
  return demoShell({
    url: "cms.railintel.co.uk/incidents",
    title: "Incident Management",
    subtitle: "Record an incident · type, severity and action taken.",
    labels:
      "Record an incident · type, severity and action taken.|Company-wide incident management list.|Incidents allocated to a specific employee.",
    tabs: ["Record", "Management list", "Allocated"],
    panels: `${recordPanel()}
${listPanel()}
${allocatedPanel()}`,
    aria: "Incidents interactive preview",
    note: "Interactive preview — choose a tab to take control; autoplay stops.",
  });
}

export function renderIncidentsMonitoringDemo() {
  return demoShell({
    url: "cms.railintel.co.uk/employees/monitoring",
    title: "Monitoring & Incidents",
    subtitle: "Monitoring overview with allocated incidents and development plans.",
    labels:
      "Monitoring overview with allocated incidents and development plans.|Competence development plan · monitoring events on the live cycle.",
    tabs: ["Monitoring overview", "CDP plan page"],
    panels: `${monitoringOverviewPanel()}
${cdpDetailPanel()}`,
    aria: "Monitoring interactive preview",
    note: "Interactive preview — choose a tab to take control; autoplay stops.",
  });
}

export function renderIncidentsSupportDemo() {
  return demoShell({
    url: "cms.railintel.co.uk/employees/support-plans",
    title: "Performance & Support",
    subtitle: "Raise a performance and support plan.",
    labels:
      "Raise a performance and support plan.|Plan detail with agreed actions.|A submitted plan retained against the record.",
    tabs: ["Raise plan", "Plan detail", "Submitted"],
    panels: `${supportRaisePanel()}
${supportDetailPanel()}
${supportSubmittedPanel()}`,
    aria: "Performance support interactive preview",
    note: "Interactive preview — choose a tab to take control; autoplay stops.",
  });
}

export function renderIncidentsInteractiveDemo(key) {
  switch (key) {
    case "incidents-record":
      return renderIncidentsRecordDemo();
    case "incidents-monitoring":
      return renderIncidentsMonitoringDemo();
    case "incidents-support":
      return renderIncidentsSupportDemo();
    default:
      return "";
  }
}
