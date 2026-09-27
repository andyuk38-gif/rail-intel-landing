/**
 * Interactive Company standards demo (framework, grading, timing dials).
 * Shared visual language with the Competency & Cycles standards preview.
 */
export function renderCmsStandardsDemo() {
  return `
      <div class="cms-demo reveal" data-cms-demo data-cms-labels="Framework · cycles available to assign.|Grading scale · outcomes assessors can award.|Timing standards · daylight, darkness and session minimums.">
        <div class="cms-demo__stage">
          <div class="browser-mockup browser-mockup--primary">
            <div class="browser-mockup__chrome">
              <span class="browser-mockup__dots"></span>
              <span class="browser-mockup__url">cms.railintel.co.uk/settings/standards</span>
            </div>
            <div class="browser-mockup__content">
              <div class="cms-app" role="region" aria-label="Standards interactive preview">
                <div class="cms-app__bar">
                  <div>
                    <h3 class="cms-app__title">Company standards</h3>
                    <p class="cms-app__sub" data-cms-subtitle>Framework · cycles available to assign.</p>
                  </div>
                  <span class="cms-app__badge"><span class="cms-app__badge-dot" aria-hidden="true"></span> Dark mode</span>
                </div>

                <div class="cms-panel is-active" data-cms-panel="0">
                  <div class="cms-card">
                    <div class="cms-card__head">
                      <div>
                        <h3>Framework (competency cycles)</h3>
                        <p>Manage cycles used as the company framework. Applied cycles become available when assigning to employees.</p>
                      </div>
                    </div>
                    <div class="cms-info">
                      <span aria-hidden="true">ℹ</span>
                      Next step — add at least one cycle from Cycle Builder to finish setup.
                    </div>
                    <h4 style="margin:0 0 0.45rem;font-size:0.72rem;letter-spacing:0.06em;text-transform:uppercase;color:var(--cms-faint)">Applied cycles</h4>
                    <ul class="cms-list">
                      <li>
                        <span class="cms-list__left"><span class="cms-check" aria-hidden="true">✓</span> ML Driver v3</span>
                        <button type="button" class="cms-btn cms-btn--danger" aria-label="Remove">✕</button>
                      </li>
                    </ul>
                    <h4 style="margin:0.9rem 0 0.45rem;font-size:0.72rem;letter-spacing:0.06em;text-transform:uppercase;color:var(--cms-faint)">Your company cycles</h4>
                    <ul class="cms-list">
                      <li>
                        <span>ML Driver v3</span>
                        <button type="button" class="cms-btn cms-btn--ghost">Edit cycle name</button>
                      </li>
                      <li>
                        <span>Test Cycle</span>
                        <button type="button" class="cms-btn cms-btn--ghost">Edit cycle name</button>
                      </li>
                    </ul>
                    <div class="cms-assign" style="margin:0.9rem 0 0">
                      <div class="cms-field">
                        <label for="std-add-cycle">Add cycle</label>
                        <select id="std-add-cycle"><option>— Choose a cycle —</option><option>PTS annual</option></select>
                      </div>
                      <span></span>
                      <button type="button" class="cms-btn cms-btn--primary" data-cms-flash="Add cycle" data-cms-done="Added">Add cycle</button>
                    </div>
                  </div>
                </div>

                <div class="cms-panel" data-cms-panel="1" hidden>
                  <div class="cms-card">
                    <div class="cms-card__head">
                      <div>
                        <h3>Grading scale</h3>
                        <p>Choose the grading options that apply to your assessments. Nothing is selected by default — pick the grades you need, then save.</p>
                      </div>
                    </div>
                    <div class="cms-grades">
                      <button type="button" class="cms-grade" data-cms-grade aria-pressed="false"><span class="cms-grade__mark" aria-hidden="true"></span><strong>Competent no advice</strong><p>Fully competent with no additional guidance required.</p></button>
                      <button type="button" class="cms-grade" data-cms-grade aria-pressed="false"><span class="cms-grade__mark" aria-hidden="true"></span><strong>Competent with advice</strong><p>Competent but was advised on minor points.</p></button>
                      <button type="button" class="cms-grade is-on" data-cms-grade aria-pressed="true"><span class="cms-grade__mark" aria-hidden="true"></span><strong>Review</strong><p>Requires further review before competency can be confirmed.</p></button>
                      <button type="button" class="cms-grade is-on" data-cms-grade aria-pressed="true"><span class="cms-grade__mark" aria-hidden="true"></span><strong>Advisory</strong><p>Advisory support recommended during task performance.</p></button>
                      <button type="button" class="cms-grade is-on" data-cms-grade aria-pressed="true"><span class="cms-grade__mark" aria-hidden="true"></span><strong>Not yet competent</strong><p>Has not yet demonstrated the required competency level.</p></button>
                      <button type="button" class="cms-grade is-on" data-cms-grade aria-pressed="true"><span class="cms-grade__mark" aria-hidden="true"></span><strong>Pass</strong><p>Assessment passed successfully.</p></button>
                      <button type="button" class="cms-grade" data-cms-grade aria-pressed="false"><span class="cms-grade__mark" aria-hidden="true"></span><strong>Fail</strong><p>Assessment not passed; further training required.</p></button>
                      <button type="button" class="cms-grade cms-grade--danger" data-cms-grade aria-pressed="false"><span class="cms-grade__mark" aria-hidden="true"></span><strong>Unsafe / Fail</strong><p>Unsafe practice; immediate intervention required.</p></button>
                    </div>
                    <div class="cms-grades-foot">
                      <span data-cms-grade-count>4 grades selected</span>
                      <button type="button" class="cms-btn cms-btn--primary" data-cms-flash="Save" data-cms-done="Saved">Save</button>
                    </div>
                  </div>
                </div>

                <div class="cms-panel" data-cms-panel="2" hidden>
                  <div class="cms-warn-banner">
                    <span aria-hidden="true">⚠</span>
                    These timings feed reporting and verification. Changing them affects every cycle that references company standards.
                  </div>
                  <div class="cms-card">
                    <div class="cms-card__head">
                      <div>
                        <h3>Standard timings</h3>
                        <p>Daylight and darkness minimums for trainees, rolling competence hours, and the shortest meaningful assessing session.</p>
                      </div>
                    </div>
                    <div class="cms-timing-grid">
                      <div class="cms-timing">
                        <h4>Trainee driving</h4>
                        <p>Minimum daylight and darktime driving hours before competence can be signed off.</p>
                        <div class="cms-dials">
                          <div class="cms-dial cms-dial--day" aria-label="Daylight 235 hours">
                            <div class="cms-dial__scene" aria-hidden="true">
                              <span class="cms-dial__sun"></span>
                              <svg class="cms-dial__cloud cms-dial__cloud--a" viewBox="0 0 96 42" width="68" height="30" focusable="false">
                                <defs>
                                  <filter id="stdMistA" x="-35%" y="-55%" width="170%" height="210%">
                                    <feGaussianBlur stdDeviation="2.4"/>
                                  </filter>
                                  <linearGradient id="stdVolA" x1="0.5" y1="0" x2="0.5" y2="1">
                                    <stop offset="0%" stop-color="#ffffff"/>
                                    <stop offset="55%" stop-color="#f1f5f9"/>
                                    <stop offset="100%" stop-color="#94a3b8"/>
                                  </linearGradient>
                                </defs>
                                <g filter="url(#stdMistA)">
                                  <ellipse cx="40" cy="24" rx="30" ry="12" fill="#fff" opacity="0.35"/>
                                  <path fill="url(#stdVolA)" d="M14 30c-7 0-12-4.6-10.4-10.2C1.2 15.4 5.4 10 13 11c2.4-5.8 10.8-7.6 16.4-3.6 3.4-4.2 10.8-4.6 14.8-.4 5-3.2 12 .4 12.8 5.8 5.8.4 9.2 5.2 6.8 10.2-1.6 3.4-5.8 6.2-12.2 6.2H14z"/>
                                </g>
                              </svg>
                              <svg class="cms-dial__cloud cms-dial__cloud--b" viewBox="0 0 84 38" width="56" height="25" focusable="false">
                                <defs>
                                  <filter id="stdMistB" x="-35%" y="-55%" width="170%" height="210%">
                                    <feGaussianBlur stdDeviation="2.8"/>
                                  </filter>
                                  <linearGradient id="stdVolB" x1="0.5" y1="0" x2="0.5" y2="1">
                                    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"/>
                                    <stop offset="60%" stop-color="#e2e8f0"/>
                                    <stop offset="100%" stop-color="#64748b"/>
                                  </linearGradient>
                                </defs>
                                <g filter="url(#stdMistB)">
                                  <ellipse cx="36" cy="22" rx="26" ry="11" fill="#f8fafc" opacity="0.3"/>
                                  <path fill="url(#stdVolB)" opacity="0.92" d="M12 27c-5.8 0-10-4-8.6-8.6C1.6 14.4 5.2 9.8 11.2 10.6c2-4.8 8.8-6.4 13.4-2.8 2.8-3.6 8.8-4 12.2-.2 4.2-2.6 10.2.6 10.8 5.2 4.8.2 7.6 4.4 5.6 8.6-1.4 2.8-4.8 5-10.2 5H12z"/>
                                </g>
                              </svg>
                              <svg class="cms-dial__cloud cms-dial__cloud--c" viewBox="0 0 72 34" width="48" height="23" focusable="false">
                                <defs>
                                  <filter id="stdMistC" x="-40%" y="-60%" width="180%" height="220%">
                                    <feGaussianBlur stdDeviation="2.2"/>
                                  </filter>
                                  <linearGradient id="stdVolC" x1="0.5" y1="0" x2="0.5" y2="1">
                                    <stop offset="0%" stop-color="#ffffff"/>
                                    <stop offset="100%" stop-color="#94a3b8"/>
                                  </linearGradient>
                                </defs>
                                <g filter="url(#stdMistC)">
                                  <ellipse cx="32" cy="20" rx="22" ry="9" fill="#fff" opacity="0.28"/>
                                  <path fill="url(#stdVolC)" d="M10 24.5c-5 0-8.8-3.4-7.6-7.2C1 14 4.2 9.8 9.4 10.6c1.8-4.2 7.8-5.4 11.8-2.2 2.6-3.2 8-3.4 10.8 0 3.8-2.2 9 .6 9.4 4.6 4.2.2 6.6 3.8 4.8 7.2-1.2 2.4-4.2 4.3-8.8 4.3H10z"/>
                                </g>
                              </svg>
                              <svg class="cms-dial__cloud cms-dial__cloud--d" viewBox="0 0 78 36" width="52" height="24" focusable="false">
                                <defs>
                                  <filter id="stdMistD" x="-40%" y="-60%" width="180%" height="220%">
                                    <feGaussianBlur stdDeviation="3.2"/>
                                  </filter>
                                  <linearGradient id="stdVolD" x1="0.5" y1="0" x2="0.5" y2="1">
                                    <stop offset="0%" stop-color="#f8fafc" stop-opacity="0.9"/>
                                    <stop offset="55%" stop-color="#cbd5e1"/>
                                    <stop offset="100%" stop-color="#64748b" stop-opacity="0.8"/>
                                  </linearGradient>
                                </defs>
                                <g filter="url(#stdMistD)">
                                  <ellipse cx="34" cy="20" rx="24" ry="10" fill="#e2e8f0" opacity="0.28"/>
                                  <path fill="url(#stdVolD)" d="M11 25.5c-5.4 0-9.4-3.6-8-7.8C1.4 14 5 9.8 10.4 10.6c2-4.4 8.2-5.8 12.4-2.4 2.8-3.4 8.6-3.6 11.8.2 4-2.4 9.4.8 9.8 5 4.4.2 7 4 5.2 7.8-1.4 2.8-4.6 4.8-9.8 4.8H11z"/>
                                </g>
                              </svg>
                            </div>
                            <div class="cms-dial__readout"><strong>235</strong><span>Hrs daylight</span></div>
                          </div>
                          <div class="cms-dial cms-dial--night" aria-label="Dark 40 hours">
                            <div class="cms-dial__scene" aria-hidden="true">
                              <span class="cms-dial__stars"></span>
                              <svg class="cms-dial__moon" viewBox="0 0 32 32" width="20" height="20" aria-hidden="true">
                                <defs>
                                  <radialGradient id="stdMoonGlow" cx="35%" cy="35%" r="65%">
                                    <stop offset="0%" stop-color="#f8fafc"/>
                                    <stop offset="55%" stop-color="#e2e8f0"/>
                                    <stop offset="100%" stop-color="#94a3b8"/>
                                  </radialGradient>
                                </defs>
                                <circle cx="16" cy="16" r="11" fill="url(#stdMoonGlow)"/>
                                <circle cx="12" cy="13" r="1.6" fill="rgba(100,116,139,0.35)"/>
                                <circle cx="19" cy="18" r="2.1" fill="rgba(100,116,139,0.28)"/>
                                <circle cx="14" cy="20" r="1.1" fill="rgba(100,116,139,0.3)"/>
                              </svg>
                            </div>
                            <div class="cms-dial__readout"><strong>40</strong><span>Hrs dark</span></div>
                          </div>
                        </div>
                        <p class="cms-timing__total">Total minimum <strong>275h 0m</strong></p>
                      </div>
                      <div class="cms-timing">
                        <h4>Maintain competence</h4>
                        <p>Minimum driving hours on a rolling months window to keep competence current.</p>
                        <div class="cms-dials">
                          <div class="cms-dial cms-dial--rolling" aria-label="4 hours per 1 month">
                            <div class="cms-dial__scene" aria-hidden="true">
                              <span class="cms-dial__orbit"></span>
                              <span class="cms-dial__orbit cms-dial__orbit--2"></span>
                              <span class="cms-dial__node"></span>
                            </div>
                            <div class="cms-dial__readout"><strong>4h</strong><span>/ 1 month</span></div>
                          </div>
                        </div>
                        <p class="cms-timing__total">Total minimum <strong>4h 0m</strong></p>
                      </div>
                      <div class="cms-timing">
                        <h4>Minimum assessing time</h4>
                        <p>Shortest session an assessor should spend to gather meaningful evidence.</p>
                        <div class="cms-dials">
                          <div class="cms-dial cms-dial--session" aria-label="30 minutes">
                            <div class="cms-dial__scene" aria-hidden="true">
                              <span class="cms-dial__tick"></span>
                              <span class="cms-dial__hand"></span>
                              <span class="cms-dial__pulse"></span>
                            </div>
                            <div class="cms-dial__readout"><strong>30</strong><span>Min session</span></div>
                          </div>
                        </div>
                        <p class="cms-timing__total">Total minimum <strong>0h 30m</strong></p>
                      </div>
                    </div>
                    <div style="margin-top:0.9rem">
                      <button type="button" class="cms-btn cms-btn--primary" data-cms-flash="Save standards" data-cms-done="Standards saved">Save standards</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="cms-demo__nav">
          <div class="cms-demo__tabs" role="group" aria-label="Standards views">
            <button type="button" class="cms-demo__tab is-active" data-cms-tab="0" aria-pressed="true">Framework</button>
            <button type="button" class="cms-demo__tab" data-cms-tab="1" aria-pressed="false">Grading scale</button>
            <button type="button" class="cms-demo__tab" data-cms-tab="2" aria-pressed="false">Timing standards</button>
          </div>
          <p class="cms-demo__note"><strong>Interactive preview</strong> — toggle grades, save actions flash confirmation.</p>
        </div>
      </div>`;
}
