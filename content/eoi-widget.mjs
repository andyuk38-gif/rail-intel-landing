/** Shared EOI slide-out markup (homepage + Investigations preview). */

export function renderEoiWidget() {
  return `  <div class="eoi-widget" data-eoi-widget hidden aria-hidden="true">
    <div class="eoi-teaser-shell">
      <button type="button" class="eoi-teaser__close" data-eoi-teaser-dismiss aria-label="Minimise notification">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
      <button type="button" class="eoi-teaser" data-eoi-teaser aria-expanded="false" aria-controls="eoi-panel" aria-label="Register your interest for April 2027 launch">
        <span class="eoi-teaser__grip" aria-hidden="true">
          <svg width="10" height="14" viewBox="0 0 10 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M8 2L3 7l5 5"/></svg>
        </span>
        <span class="eoi-teaser__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/></svg>
        </span>
        <span class="eoi-teaser__text">
          <span class="eoi-teaser__label">Launching April 2027</span>
          <span class="eoi-teaser__date">Click here to register your interest for early discounts</span>
        </span>
        <span class="eoi-teaser__tab-label" aria-hidden="true">Register your interest</span>
      </button>
    </div>

    <div class="eoi-panel" id="eoi-panel" data-eoi-panel hidden role="dialog" aria-labelledby="eoi-title">
      <div class="eoi-panel__header">
        <div class="eoi-panel__actions">
          <button type="button" class="eoi-panel__btn-icon" data-eoi-close aria-label="Minimise">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 15l-6-6-6 6"/></svg>
          </button>
          <button type="button" class="eoi-panel__btn-icon" data-eoi-dismiss aria-label="Slide to side">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <span class="eoi-panel__badge"><span class="eoi-panel__badge-dot" aria-hidden="true"></span> April 2027 launch</span>
        <h2 class="eoi-panel__title" id="eoi-title">Register your interest</h2>
        <p class="eoi-panel__lead">Interested in becoming our client and sourcing our products when we launch?</p>
      </div>

      <div class="eoi-panel__body">
        <ul class="eoi-perks" aria-label="Benefits">
          <li>
            <span class="eoi-perks__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
            </span>
            Onboard with us prior to launch
          </li>
          <li>
            <span class="eoi-perks__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/></svg>
            </span>
            Early discounts apply before launch
          </li>
          <li>
            <span class="eoi-perks__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </span>
            Bundled modules for free as introductory offer*
          </li>
        </ul>
        <div class="eoi-perks-footnote">
          <p class="eoi-perks-footnote__lead">* INTRODUCTORY OFFER: The following modules are FREE, subject to a minimum 12-month contract:</p>
          <ul class="eoi-modules-list">
            <li>Task assignment</li>
            <li>Safety Briefs</li>
            <li>Driver Reports</li>
            <li>Leave &amp; Absence</li>
            <li>Medication Checks</li>
          </ul>
        </div>

        <form class="eoi-form" data-eoi-form>
          <div class="field">
            <label for="eoi-name">Your name</label>
            <input id="eoi-name" type="text" name="name" placeholder="Jane Smith" autocomplete="name" required />
          </div>
          <div class="field">
            <label for="eoi-email">Work email</label>
            <input id="eoi-email" type="email" name="email" placeholder="you@company.co.uk" autocomplete="email" required />
          </div>
          <div class="field">
            <label for="eoi-product">Product of interest</label>
            <select id="eoi-product" name="product_interest" required>
              <option value="" disabled selected hidden>Select a product</option>
              <option value="cms">Rail Intel CMS</option>
              <option value="investigations">Rail Intel Investigations</option>
            </select>
          </div>
          <input type="text" name="website" class="sr-only" tabindex="-1" autocomplete="off" aria-hidden="true" />
          <button type="submit" class="btn btn-primary">Register my interest</button>
          <p class="eoi-form__note">Launching platform in April 2027.</p>
          <p class="eoi-message" data-eoi-message hidden></p>
        </form>

        <div class="eoi-success" data-eoi-success hidden>
          <div class="eoi-success__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
          </div>
          <p class="eoi-success__title">You are on the list</p>
          <p class="eoi-success__text">Thanks — we will be in touch as we approach the April 2027 launch.</p>
        </div>
      </div>
    </div>
  </div>`;
}
