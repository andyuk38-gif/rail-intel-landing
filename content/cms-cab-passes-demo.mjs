/**
 * Interactive Digital Cab Passes demos (issue flow + QA verification report).
 */

const COLOURS = [
  { key: "green", label: "Green", detail: "Authorised to Assess" },
  { key: "yellow", label: "Yellow", detail: "PTS (Personal Track Safety) competent" },
  { key: "blue", label: "Blue", detail: "Operational Rules competent" },
  {
    key: "red",
    label: "Red",
    detail: "Issued with endorsements; usually accompanied by a green cab pass holder",
  },
  { key: "black", label: "Black", detail: "Typically used for route learning" },
];

function shotImg(base, src, alt, width, height) {
  return `<img class="cms-cab-shot" src="${base}${src}" alt="${alt}" width="${width}" height="${height}" loading="lazy" decoding="async" />`;
}

function qrSvg(size = 96) {
  // Deterministic faux-QR pattern for demos (not a real code).
  const cells = 21;
  const cell = size / cells;
  const bits = [
    "111111101010101111111",
    "100000101101001000001",
    "101110101000101011101",
    "101110100111101011101",
    "101110101010001011101",
    "100000101011101000001",
    "111111101010101111111",
    "000000001100100000000",
    "110101111011010101100",
    "001010001100111010011",
    "110111110011000110101",
    "010001001010111001010",
    "101010111100010111011",
    "000000001011101001100",
    "111111101001010100111",
    "100000101110111011010",
    "101110100010001100101",
    "101110101101100010111",
    "101110100111011101000",
    "100000100100101011011",
    "111111101010110100101",
  ];
  let rects = "";
  for (let y = 0; y < cells; y++) {
    for (let x = 0; x < cells; x++) {
      if (bits[y][x] === "1") {
        rects += `<rect x="${(x * cell).toFixed(2)}" y="${(y * cell).toFixed(2)}" width="${cell.toFixed(2)}" height="${cell.toFixed(2)}" fill="#0b1220"/>`;
      }
    }
  }
  return `<svg class="cms-cab-qr__svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" aria-hidden="true">${rects}</svg>`;
}

function passPhoto(logoBase = "../") {
  return `<div class="cms-cab-pass__photo" aria-hidden="true"><img src="${logoBase}images/screens/cab-passes/andy-hill-pass-portrait.png" alt="" width="78" height="104" decoding="async" /></div>`;
}

function passCard({
  colour = "green",
  subtitle = "AUTHORISED TO ASSESS",
  passNo = "35753718",
  from = "From 25th August 2026",
  to = "To 26th August 2026",
  expired = false,
  logoBase = "../",
} = {}) {
  return `
                      <div class="cms-cab-pass cms-cab-pass--${colour}${expired ? " is-expired" : ""}">
                        <div class="cms-cab-pass__banner">
                          <div>
                            <strong>DRIVING CAB PASS</strong>
                            <span>${subtitle}</span>
                          </div>
                          <img class="cms-cab-pass__logo" src="${logoBase}images/rail-intel-icon.png" alt="" width="28" height="28" decoding="async" />
                        </div>
                        <div class="cms-cab-pass__body">
                          <div class="cms-cab-pass__fields">
                            <p><strong>NAME:</strong> Andy Hill</p>
                            <p><strong>TITLE:</strong> Driver Manager</p>
                            <p><strong>DEPT:</strong> Operations</p>
                            <p><strong>ROUTES:</strong> All Routes</p>
                            <p><strong>PASS NO:</strong> ${passNo}</p>
                            <p class="cms-cab-pass__dates">${from}<br />${to}</p>
                          </div>
                          <div class="cms-cab-pass__media">
                            ${passPhoto(logoBase)}
                            <div class="cms-cab-pass__mini-qr">${qrSvg(44)}</div>
                          </div>
                          ${expired ? `<span class="cms-cab-pass__stamp">EXPIRED</span>` : ""}
                        </div>
                        <div class="cms-cab-pass__foot">
                          <div class="cms-cab-pass__sig" aria-hidden="true">Andy Hill</div>
                          <p><strong>ISSUED BY:</strong> Andy Hill</p>
                          <p><strong>DEPT:</strong> Operations</p>
                          <p><strong>ENDORSEMENTS:</strong> None</p>
                        </div>
                      </div>`;
}

function scanPanel() {
  return `
                      <div class="cms-cab-scan">
                        <div class="cms-cab-scan__qr">${qrSvg(108)}</div>
                        <p>SCAN TO VERIFY</p>
                      </div>`;
}

function actionStack({ editDisabled = false } = {}) {
  return `
                      <div class="cms-cab-actions">
                        <button type="button" class="cms-cab-actions__btn"${editDisabled ? " disabled" : ""}>Edit</button>
                        <button type="button" class="cms-cab-actions__btn">View</button>
                        <button type="button" class="cms-cab-actions__btn cms-cab-actions__btn--renew" data-cms-flash="Renew" data-cms-done="Renewed">Renew</button>
                        <button type="button" class="cms-cab-actions__btn cms-cab-actions__btn--revoke" data-cms-flash="Revoke" data-cms-done="Revoked">Revoke</button>
                        <button type="button" class="cms-cab-actions__btn cms-cab-actions__btn--delete" data-cms-flash="Delete" data-cms-done="Deleted">Delete</button>
                      </div>`;
}

function issuedRow({
  colour,
  subtitle,
  passNo,
  from,
  to,
  expired = false,
  editDisabled = false,
  expandLabel = "Expand",
  logoBase = "../",
} = {}) {
  return `
                    <div class="cms-cab-issued">
                      <div class="cms-cab-issued__label">
                        <span>PASS ISSUED PREVIEW</span>
                        <button type="button" class="cms-btn cms-btn--ghost cms-cab-issued__expand">${expandLabel}</button>
                      </div>
                      <div class="cms-cab-issued__row">
                        ${passCard({ colour, subtitle, passNo, from, to, expired, logoBase })}
                        ${scanPanel()}
                        ${actionStack({ editDisabled })}
                      </div>
                    </div>`;
}

function colourOptions({ selected = "green" } = {}) {
  return COLOURS.map(
    (c) => `
                      <button type="button" class="cms-cab-colour${c.key === selected ? " is-selected" : ""}" data-cms-cab-colour="${c.key}">
                        <span class="cms-cab-colour__swatch cms-cab-colour__swatch--${c.key}" aria-hidden="true"></span>
                        <span class="cms-cab-colour__text">
                          <strong>${c.label}</strong>
                          <span>${c.detail}</span>
                        </span>
                      </button>`
  ).join("");
}

export function renderCmsCabPassesHero(base = "../") {
  return `            <figure class="cms-cab-hero reveal" aria-label="Issued green driving cab pass with SCAN TO VERIFY QR">
              <div class="cms-cab-hero__stage">
                ${passCard({ colour: "green", logoBase: base })}
                ${scanPanel()}
              </div>
              <figcaption class="cms-cab-hero__caption">Issued pass with QR, scan to verify without a login.</figcaption>
            </figure>`;
}

export function renderCmsCabPassesDemo(base = "../") {
  const labels = [
    "Colour · choose green, yellow, blue, red or black before anything is created.",
    "Issue form · validity, routes, endorsements and issuer signature.",
    "Issue & email · save for QR verification and send the employee a copy.",
    "Issued pass · green assess pass with SCAN TO VERIFY.",
    "Actions · edit, view, renew, revoke or delete from the preview.",
    "Expired · blue operational rules pass still scannable for audit.",
    "Overview · both passes on the employee Cab Passes tab.",
  ].join("|");

  return `
      <div class="cms-demo reveal" data-cms-demo data-cms-labels="${labels}">
        <div class="cms-demo__stage">
          <div class="browser-mockup browser-mockup--primary">
            <div class="browser-mockup__chrome">
              <span class="browser-mockup__dots"></span>
              <span class="browser-mockup__url">cms.railintel.co.uk/employees/cab-passes</span>
            </div>
            <div class="browser-mockup__content" data-no-expand>
              <div class="cms-app" role="region" aria-label="Digital cab passes interactive preview">
                <div class="cms-app__bar">
                  <div>
                    <h3 class="cms-app__title">Digital Cab Passes</h3>
                    <p class="cms-app__sub" data-cms-subtitle>Colour · choose green, yellow, blue, red or black before anything is created.</p>
                  </div>
                  <span class="cms-app__badge"><span class="cms-app__badge-dot" aria-hidden="true"></span> Dark mode</span>
                </div>

                <div class="cms-panel is-active" data-cms-panel="0">
                  <div class="cms-modal-stage cms-modal-stage--cab">
                    <div class="cms-cab-dialog">
                      <h3>Which cab pass do you need to issue?</h3>
                      <p>Choose the pass colour before continuing. Nothing is created until you confirm.</p>
                      <div class="cms-cab-colour-list">${colourOptions({ selected: "green" })}
                      </div>
                      <div class="cms-cab-dialog__foot">
                        <button type="button" class="cms-btn cms-btn--ghost">Cancel</button>
                        <button type="button" class="cms-btn cms-btn--blue" data-cms-flash="Continue" data-cms-done="Continuing…">Continue</button>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="cms-panel" data-cms-panel="1" hidden>
                  <div class="cms-cab-form">
                    <div class="cms-cab-form__head">
                      <span class="cms-cab-form__dot" aria-hidden="true"></span>
                      <strong>10843529</strong>
                      <button type="button" class="cms-btn cms-btn--ghost cms-cab-form__collapse">Collapse</button>
                    </div>
                    <div class="cms-field">
                      <label for="cms-cab-colour-select">Pass colour</label>
                      <select id="cms-cab-colour-select">
                        <option selected>Green</option>
                        <option>Yellow</option>
                        <option>Blue</option>
                        <option>Red</option>
                        <option>Black</option>
                      </select>
                    </div>
                    <div class="cms-cab-form__row">
                      <div class="cms-field">
                        <label>Cab pass number</label>
                        <p class="cms-cab-form__static">10843529</p>
                      </div>
                      <div class="cms-field">
                        <label for="cms-cab-from">Valid from</label>
                        <input id="cms-cab-from" type="text" placeholder="dd/mm/yyyy" value="25/08/2026" />
                      </div>
                      <div class="cms-field">
                        <label for="cms-cab-to">Valid to</label>
                        <input id="cms-cab-to" type="text" placeholder="dd/mm/yyyy" value="26/08/2026" />
                      </div>
                    </div>
                    <div class="cms-cab-form__row cms-cab-form__row--2">
                      <div class="cms-field">
                        <label for="cms-cab-issuer">Issued by (name)</label>
                        <input id="cms-cab-issuer" type="text" value="Andy Hill" />
                      </div>
                      <div class="cms-field">
                        <label for="cms-cab-dept">Issuer department (on pass)</label>
                        <input id="cms-cab-dept" type="text" value="Operations" />
                      </div>
                    </div>
                    <div class="cms-field">
                      <label for="cms-cab-routes">Validity (routes / scope)</label>
                      <textarea id="cms-cab-routes" rows="2">All mainline routes</textarea>
                    </div>
                    <div class="cms-field">
                      <label for="cms-cab-endorsements">Endorsements (if any)</label>
                      <textarea id="cms-cab-endorsements" rows="2" placeholder="Optional endorsements or conditions"></textarea>
                    </div>
                    <div class="cms-cab-sig">
                      <p class="cms-cab-sig__label">Issuer signature <span>Signed</span></p>
                      <div class="cms-cab-sig__pad"><span class="cms-cab-pass__sig">Andy Hill</span></div>
                      <div class="cms-cab-sig__actions">
                        <button type="button" class="cms-btn cms-btn--ghost">Clear signature</button>
                        <button type="button" class="cms-btn cms-btn--teal" data-cms-flash="Apply signature" data-cms-done="Applied">Apply signature</button>
                      </div>
                      <p class="cms-cab-sig__hint">Sign using mouse, trackpad, or touch.</p>
                    </div>
                  </div>
                </div>

                <div class="cms-panel" data-cms-panel="2" hidden>
                  <div class="cms-modal-stage cms-modal-stage--cab">
                    <div class="cms-cab-dialog cms-cab-dialog--confirm">
                      <h3>Issue digital pass and send email?</h3>
                      <p>This will create a digital cab pass with QR verification, and email the front and reverse of the pass to the employee at <strong>ashuk38@yahoo.co.uk</strong>.</p>
                      <div class="cms-cab-next">
                        <strong>What happens next</strong>
                        <ul>
                          <li>Pass is saved digitally for public QR verification</li>
                          <li>Employee receives an email with pass details and a link to view the digital pass</li>
                          <li>You can still print the credit-card layout from this tab</li>
                        </ul>
                      </div>
                      <div class="cms-cab-dialog__foot">
                        <button type="button" class="cms-btn cms-btn--ghost">Cancel</button>
                        <button type="button" class="cms-btn cms-btn--blue" data-cms-flash="Issue and send email" data-cms-done="Issued ✓">Issue and send email</button>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="cms-panel" data-cms-panel="3" hidden>
                  ${issuedRow({
                    colour: "green",
                    subtitle: "AUTHORISED TO ASSESS",
                    passNo: "35753718",
                    from: "From 25th August 2026",
                    to: "To 26th August 2026",
                    logoBase: base,
                  })}
                </div>

                <div class="cms-panel" data-cms-panel="4" hidden>
                  ${issuedRow({
                    colour: "green",
                    subtitle: "AUTHORISED TO ASSESS",
                    passNo: "35753718",
                    from: "From 25th August 2026",
                    to: "To 26th August 2026",
                    expandLabel: "Expand",
                    logoBase: base,
                  })}
                </div>

                <div class="cms-panel" data-cms-panel="5" hidden>
                  ${issuedRow({
                    colour: "blue",
                    subtitle: "OPERATIONAL RULES COMPETENT",
                    passNo: "10843529",
                    from: "From 12th January 2020",
                    to: "To 11th January 2021",
                    expired: true,
                    editDisabled: true,
                    logoBase: base,
                  })}
                </div>

                <div class="cms-panel" data-cms-panel="6" hidden>
                  <div class="cms-cab-overview">
                    <div class="cms-cab-overview__head">
                      <div class="cms-cab-overview__title">
                        <span class="cms-cab-overview__icon" aria-hidden="true">🔑</span>
                        <div>
                          <h3>Cab Passes</h3>
                          <p>Digital passes show the QR on the right of the issued preview. Expand a row to manage the pass.</p>
                        </div>
                      </div>
                      <button type="button" class="cms-btn cms-btn--teal">+ Add new cab pass</button>
                    </div>
                    ${issuedRow({
                      colour: "blue",
                      subtitle: "OPERATIONAL RULES COMPETENT",
                      passNo: "10843529",
                      from: "From 12th January 2020",
                      to: "To 11th January 2021",
                      expired: true,
                      editDisabled: true,
                      expandLabel: "Collapse",
                      logoBase: base,
                    })}
                    ${issuedRow({
                      colour: "green",
                      subtitle: "AUTHORISED TO ASSESS",
                      passNo: "35753718",
                      from: "From 25th August 2026",
                      to: "To 26th August 2026",
                      expandLabel: "Collapse",
                      logoBase: base,
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="cms-demo__nav">
          <div class="cms-demo__tabs" role="group" aria-label="Cab pass issue steps">
            <button type="button" class="cms-demo__tab is-active" data-cms-tab="0" aria-pressed="true">Colour</button>
            <button type="button" class="cms-demo__tab" data-cms-tab="1" aria-pressed="false">Issue form</button>
            <button type="button" class="cms-demo__tab" data-cms-tab="2" aria-pressed="false">Issue &amp; email</button>
            <button type="button" class="cms-demo__tab" data-cms-tab="3" aria-pressed="false">Issued pass</button>
            <button type="button" class="cms-demo__tab" data-cms-tab="4" aria-pressed="false">Actions</button>
            <button type="button" class="cms-demo__tab" data-cms-tab="5" aria-pressed="false">Expired</button>
            <button type="button" class="cms-demo__tab" data-cms-tab="6" aria-pressed="false">Overview</button>
          </div>
          <p class="cms-demo__note"><strong>Interactive preview</strong> — walk the issue flow from colour choice to the Cab Passes tab.</p>
        </div>
      </div>`;
}

export function renderCmsCabPassesReportDemo(base = "../") {
  return `
      <div class="cms-demo reveal" data-cms-demo data-cms-labels="Verification report · Cab Passes section with Review and Compliant outcomes.">
        <div class="cms-demo__stage">
          <div class="browser-mockup browser-mockup--primary">
            <div class="browser-mockup__chrome">
              <span class="browser-mockup__dots"></span>
              <span class="browser-mockup__url">cms.railintel.co.uk/qa/verification-report</span>
            </div>
            <div class="browser-mockup__content" data-no-expand>
              <div class="cms-app" role="region" aria-label="Cab passes on verification report preview">
                <div class="cms-app__bar">
                  <div>
                    <h3 class="cms-app__title">Verification report</h3>
                    <p class="cms-app__sub" data-cms-subtitle>Verification report · Cab Passes section with Review and Compliant outcomes.</p>
                  </div>
                  <span class="cms-app__badge"><span class="cms-app__badge-dot" aria-hidden="true"></span> Dark mode</span>
                </div>

                <div class="cms-panel is-active" data-cms-panel="0">
                  <div class="cms-cab-shot-wrap cms-cab-shot-wrap--scroll">
                    ${shotImg(
                      base,
                      "images/screens/cab-passes/verification-report-cab-passes.png",
                      "Cab Passes on the verification report: expired blue pass for review, green assess pass compliant",
                      1024,
                      850
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="cms-demo__nav">
          <div class="cms-demo__tabs" role="group" aria-label="Verification report view">
            <button type="button" class="cms-demo__tab is-active" data-cms-tab="0" aria-pressed="true">Cab Passes report</button>
          </div>
          <p class="cms-demo__note"><strong>Live capture</strong> — expired passes surface as Review; in-date signed passes as Compliant.</p>
        </div>
      </div>`;
}
