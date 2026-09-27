/**
 * Interactive Traction, routes & depots demo (Administration).
 */
export function renderCmsAdminTractionDemo() {
  return `
      <div class="cms-demo reveal" data-cms-demo data-cms-labels="Company lookups · traction types, routes and depots.|On the record · employee traction and route competence.|Add forms · recording competence against company lookups.">
        <div class="cms-demo__stage">
          <div class="browser-mockup browser-mockup--primary">
            <div class="browser-mockup__chrome">
              <span class="browser-mockup__dots"></span>
              <span class="browser-mockup__url">cms.railintel.co.uk/settings/traction-routes</span>
            </div>
            <div class="browser-mockup__content">
              <div class="cms-app" role="region" aria-label="Traction routes and depots interactive preview">
                <div class="cms-app__bar">
                  <div>
                    <h3 class="cms-app__title">Traction, routes &amp; depots</h3>
                    <p class="cms-app__sub" data-cms-subtitle>Company lookups · traction types, routes and depots.</p>
                  </div>
                  <span class="cms-app__badge"><span class="cms-app__badge-dot" aria-hidden="true"></span> Dark mode</span>
                </div>

                <div class="cms-panel is-active" data-cms-panel="0">
                  <div class="cms-card__head" style="margin-bottom:0.75rem">
                    <div>
                      <h3>Traction, Routes &amp; Depots</h3>
                      <p>Define company lookup values used in traction, route, and depot lookup forms.</p>
                    </div>
                  </div>
                  <div class="cms-warn-banner">
                    <span aria-hidden="true">⚠</span>
                    Values configured here are available for users to select the traction you operate, the routes you cover, and the depots you use.
                  </div>
                  <div class="cms-lookup-grid">
                    <div class="cms-lookup cms-lookup--traction">
                      <div class="cms-lookup__head">
                        <span class="cms-lookup__icon" aria-hidden="true">🚆</span>
                        <strong>Traction types</strong>
                      </div>
                      <div class="cms-lookup__add">
                        <input type="text" placeholder="e.g. Class 800" aria-label="New traction type" />
                        <button type="button" class="cms-btn cms-btn--lilac" data-cms-flash="Add" data-cms-done="Added">Add</button>
                      </div>
                      <div class="cms-lookup__cols"><span>Added traction types</span><span>Actions</span></div>
                      <div class="cms-lookup__row">
                        <span>Class 810</span>
                        <div class="cms-lookup__meta">
                          <span class="cms-lookup__badge">0 employees assigned</span>
                          <button type="button" class="cms-btn cms-btn--ghost" style="padding:0.25rem 0.4rem" aria-label="Edit">✎</button>
                          <button type="button" class="cms-btn cms-btn--danger" aria-label="Delete">🗑</button>
                        </div>
                      </div>
                    </div>
                    <div class="cms-lookup cms-lookup--routes">
                      <div class="cms-lookup__head">
                        <span class="cms-lookup__icon" aria-hidden="true">🗺</span>
                        <strong>Routes</strong>
                      </div>
                      <div class="cms-lookup__add">
                        <input type="text" placeholder="e.g. London to Newcastle" aria-label="New route" />
                        <button type="button" class="cms-btn cms-btn--green" data-cms-flash="Add" data-cms-done="Added">Add</button>
                      </div>
                      <div class="cms-lookup__cols"><span>Added routes</span><span>Actions</span></div>
                      <div class="cms-lookup__row">
                        <span>London to Newcastle</span>
                        <div class="cms-lookup__meta">
                          <span class="cms-lookup__badge">0 employees assigned</span>
                          <button type="button" class="cms-btn cms-btn--ghost" style="padding:0.25rem 0.4rem" aria-label="Edit">✎</button>
                          <button type="button" class="cms-btn cms-btn--danger" aria-label="Delete">🗑</button>
                        </div>
                      </div>
                    </div>
                    <div class="cms-lookup cms-lookup--depots cms-lookup--full">
                      <div class="cms-lookup__head">
                        <span class="cms-lookup__icon" aria-hidden="true">🏢</span>
                        <strong>Depots</strong>
                      </div>
                      <p style="margin:0 0 0.55rem;font-size:0.72rem;color:var(--cms-muted)">Employees can only be assigned to depots defined here.</p>
                      <div class="cms-lookup__add">
                        <input type="text" placeholder="e.g. London Euston" aria-label="New depot" />
                        <button type="button" class="cms-btn cms-btn--lilac" data-cms-flash="Add" data-cms-done="Added">Add</button>
                      </div>
                      <div class="cms-lookup__cols"><span>Added depots</span><span>Actions</span></div>
                      <div class="cms-lookup__row">
                        <span>London</span>
                        <div class="cms-lookup__meta">
                          <span class="cms-lookup__badge">2 employees assigned</span>
                          <button type="button" class="cms-btn cms-btn--ghost" style="padding:0.25rem 0.4rem" aria-label="Edit">✎</button>
                          <button type="button" class="cms-btn cms-btn--danger" aria-label="Delete">🗑</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="cms-panel" data-cms-panel="1" hidden>
                  <div class="cms-ops__tabs" aria-label="Employee record tabs">
                    <span class="cms-ops__tab">Overview</span>
                    <span class="cms-ops__tab">Medical</span>
                    <span class="cms-ops__tab">Licensing</span>
                    <span class="cms-ops__tab is-on">Operations</span>
                    <span class="cms-ops__tab">Development</span>
                    <span class="cms-ops__tab">Workspace</span>
                    <span class="cms-ops__viewing">Now viewing: Trains &amp; Routes</span>
                  </div>
                  <div class="cms-alert" style="margin-bottom:0.85rem">
                    <span class="cms-alert__icon" aria-hidden="true">!</span>
                    <span><strong>Not safe to work</strong> — Mandatory competency expired.</span>
                  </div>
                  <div class="cms-card" style="margin-bottom:0.75rem">
                    <div class="cms-ops__section-head">
                      <h4><span aria-hidden="true">🚆</span> Traction</h4>
                      <button type="button" class="cms-ops__link">+ Add Traction</button>
                    </div>
                    <table class="cms-table">
                      <thead>
                        <tr>
                          <th>Traction</th>
                          <th>Date found competent</th>
                          <th>Expiry</th>
                          <th>Assessed by</th>
                          <th>Notes</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Class 810</td>
                          <td>08-08-2026</td>
                          <td><em style="color:var(--cms-faint)">Expiry not set</em></td>
                          <td>Ash Hill</td>
                          <td>Test Entry</td>
                          <td>
                            <button type="button" class="cms-btn cms-btn--ghost" style="padding:0.25rem 0.4rem" aria-label="Edit">✎</button>
                            <button type="button" class="cms-btn cms-btn--danger" aria-label="Delete">✕</button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div class="cms-card">
                    <div class="cms-ops__section-head">
                      <h4><span aria-hidden="true">🗺</span> Routes</h4>
                      <button type="button" class="cms-ops__link cms-ops__link--green">+ Add Route</button>
                    </div>
                    <table class="cms-table">
                      <thead>
                        <tr>
                          <th>Route</th>
                          <th>Date found competent</th>
                          <th>Expiry</th>
                          <th>Assessed by</th>
                          <th>Notes</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>London to Newcastle</td>
                          <td>08-08-2026</td>
                          <td><em style="color:var(--cms-faint)">Expiry not set</em></td>
                          <td>Ash Hill</td>
                          <td>Up &amp; Down Direction including yards and diversionary</td>
                          <td>
                            <button type="button" class="cms-btn cms-btn--ghost" style="padding:0.25rem 0.4rem" aria-label="Edit">✎</button>
                            <button type="button" class="cms-btn cms-btn--danger" aria-label="Delete">✕</button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div class="cms-panel" data-cms-panel="2" hidden>
                  <div class="cms-form-pair">
                    <div class="cms-form-modal">
                      <div class="cms-form-modal__head">
                        <h4>Add Traction</h4>
                        <span aria-hidden="true" style="color:var(--cms-faint)">✕</span>
                      </div>
                      <div class="cms-field">
                        <label for="cms-add-traction">Traction</label>
                        <select id="cms-add-traction"><option>Select traction</option><option selected>Class 810</option></select>
                      </div>
                      <div class="cms-form-modal__grid">
                        <div class="cms-field">
                          <label for="cms-trac-date">Date found competent</label>
                          <input id="cms-trac-date" type="text" value="08/08/2026" />
                        </div>
                        <div class="cms-field">
                          <label for="cms-trac-expiry">Expiry (if applicable)</label>
                          <input id="cms-trac-expiry" type="text" placeholder="dd/mm/yyyy" />
                        </div>
                      </div>
                      <div class="cms-field">
                        <label for="cms-trac-assessor">Assessed by</label>
                        <select id="cms-trac-assessor"><option>Select Assessor...</option><option selected>Ash Hill</option></select>
                      </div>
                      <div class="cms-field" style="margin-top:0.55rem">
                        <label for="cms-trac-notes">Notes</label>
                        <textarea id="cms-trac-notes" rows="3" placeholder="Add notes for this traction entry.">Test Entry</textarea>
                      </div>
                      <div class="cms-form-modal__actions">
                        <button type="button" class="cms-btn cms-btn--ghost">Cancel</button>
                        <button type="button" class="cms-btn cms-btn--lilac" data-cms-flash="Save traction" data-cms-done="Saved">Save traction</button>
                      </div>
                    </div>
                    <div class="cms-form-modal">
                      <div class="cms-form-modal__head">
                        <h4>Add Route</h4>
                        <span aria-hidden="true" style="color:var(--cms-faint)">✕</span>
                      </div>
                      <div class="cms-field">
                        <label for="cms-add-route">Route</label>
                        <select id="cms-add-route"><option>Select route</option><option selected>London to Newcastle</option></select>
                      </div>
                      <div class="cms-form-modal__grid">
                        <div class="cms-field">
                          <label for="cms-route-date">Date found competent</label>
                          <input id="cms-route-date" type="text" value="08/08/2026" />
                        </div>
                        <div class="cms-field">
                          <label for="cms-route-expiry">Expiry (if applicable)</label>
                          <input id="cms-route-expiry" type="text" placeholder="dd/mm/yyyy" />
                        </div>
                      </div>
                      <div class="cms-field">
                        <label for="cms-route-assessor">Assessed by</label>
                        <select id="cms-route-assessor"><option>Select Assessor...</option><option selected>Ash Hill</option></select>
                      </div>
                      <div class="cms-field" style="margin-top:0.55rem">
                        <label for="cms-route-notes">Notes</label>
                        <textarea id="cms-route-notes" rows="3" placeholder="Add notes for this route entry.">Up &amp; Down Direction including yards and diversionary</textarea>
                      </div>
                      <div class="cms-form-modal__actions">
                        <button type="button" class="cms-btn cms-btn--ghost">Cancel</button>
                        <button type="button" class="cms-btn cms-btn--green" data-cms-flash="Save route" data-cms-done="Saved">Save route</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="cms-demo__nav">
          <div class="cms-demo__tabs" role="group" aria-label="Traction views">
            <button type="button" class="cms-demo__tab is-active" data-cms-tab="0" aria-pressed="true">Company lookups</button>
            <button type="button" class="cms-demo__tab" data-cms-tab="1" aria-pressed="false">On the record</button>
            <button type="button" class="cms-demo__tab" data-cms-tab="2" aria-pressed="false">Add forms</button>
          </div>
          <p class="cms-demo__note"><strong>Interactive preview</strong> — company lookups feed the traction and route entries on each record.</p>
        </div>
      </div>`;
}
