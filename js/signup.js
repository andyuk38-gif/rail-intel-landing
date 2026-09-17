/* Self-serve CMS signup — quote vs purchase paths */
(function () {
  "use strict";

  var meta = document.querySelector('meta[name="cms-api"]');
  var proxyMeta = document.querySelector('meta[name="signup-api-proxy"]');
  var apiBase = (meta && meta.getAttribute("content")) || "https://cms.railintel.co.uk/api";
  var proxyBase = proxyMeta && proxyMeta.getAttribute("content");
  var wizard = document.querySelector("[data-cms-signup-wizard]");
  var form = document.querySelector("[data-cms-signup-form]");
  if (!wizard || !form) return;

  var moduleListQuote = document.querySelector("[data-signup-modules]");
  var successMessageQuote = document.querySelector("[data-signup-success-message]");
  var successNoteQuote = document.querySelector("[data-signup-success-note]");
  var successMessageInvoice = document.querySelector("[data-signup-success-message-invoice]");
  var dealOffersEl = document.querySelector("[data-signup-deal-offers]");
  var dealCodeMsgEl = document.querySelector("[data-signup-deal-code-msg]");
  var stepFiveLabel = document.querySelector("[data-signup-step-five-label]");
  var stepperQuote = wizard.querySelector("[data-signup-stepper-quote]");
  var stepperInvoice = wizard.querySelector("[data-signup-stepper-invoice]");
  var invoicePreviewWrap = document.querySelector("[data-signup-invoice-preview]");
  var invoicePreviewHtml = document.querySelector("[data-signup-invoice-preview-html]");
  var invoiceStripeBtn = document.querySelector("[data-signup-invoice-stripe-pay]");
  var QUOTE_SUCCESS_HELPER =
    "A member of the team will generate your quote within 24 hours. If we need any further information, we will reach out by email.";
  var progressFill = document.querySelector("[data-signup-progress]");

  var QUOTE_PANEL_STEP = {
    intent: 1,
    company: 2,
    "current-setup": 3,
    contact: 4,
    "quote-requirements": 5,
    "quote-modules": 5,
    "quote-complete": 6,
  };

  var INVOICE_PANEL_STEP = {
    intent: 1,
    "invoice-pay": 2,
    "invoice-complete": 3,
  };

  var state = {
    panel: "intent",
    intent: null,
    signupId: null,
    config: null,
    modules: [],
    modulesLoadedAt: 0,
    validatedDealCode: null,
    invoiceToken: null,
    invoiceData: null,
  };

  function apiUrl(path) {
    var normalized = String(path || "").replace(/^\//, "");
    if (proxyBase) {
      return proxyBase.replace(/\/$/, "") + "?path=" + encodeURIComponent(normalized);
    }
    return apiBase.replace(/\/$/, "") + "/" + normalized;
  }

  function isStartingResponse(res, data) {
    return (res.status === 503 || res.status === 502) && data && data.error === "starting";
  }

  function friendlyFetchError(err, data) {
    if (data && data.error === "starting") {
      return "The application server is still starting. This can take up to two minutes after a deploy — please wait and try again.";
    }
    if (data && data.retry === true && !data.error) {
      return "Could not reach the application server. Please try again in a moment or email sales@railintel.co.uk.";
    }
    if (err && (err.message === "Failed to fetch" || err.name === "TypeError")) {
      return "Could not reach the application server. Please try again in a moment or email sales@railintel.co.uk.";
    }
    return (data && data.error) || (err && err.message) || "Something went wrong.";
  }

  function apiFetch(path, options, attempt) {
    var tries = attempt || 0;
    var maxStartingRetries = 20;
    return fetch(apiUrl(path), options)
      .then(function (res) {
        return res
          .json()
          .catch(function () {
            return {};
          })
          .then(function (data) {
            if (tries < maxStartingRetries && isStartingResponse(res, data)) {
              return new Promise(function (resolve) {
                setTimeout(resolve, Math.min(8000, 2000 + tries * 500));
              }).then(function () {
                return apiFetch(path, options, tries + 1);
              });
            }
            if (!res.ok) {
              throw new Error(friendlyFetchError(null, data));
            }
            return data;
          });
      })
      .catch(function (err) {
        if (tries < 4 && err && err.message === "Failed to fetch") {
          return new Promise(function (resolve) {
            setTimeout(resolve, 1200 * (tries + 1));
          }).then(function () {
            return apiFetch(path, options, tries + 1);
          });
        }
        throw new Error(friendlyFetchError(err, null));
      });
  }

  function getMsgEl(key) {
    return document.querySelector('[data-signup-msg="' + key + '"]');
  }

  function showMessage(el, text, kind) {
    if (!el) return;
    el.textContent = text;
    el.hidden = false;
    el.dataset.state = kind || "info";
  }

  function hideMessage(el) {
    if (el) el.hidden = true;
  }

  function totalSteps() {
    return state.intent === "invoice" ? 3 : 6;
  }

  function panelStep(panel) {
    if (state.intent === "invoice") {
      return INVOICE_PANEL_STEP[panel] || 1;
    }
    return QUOTE_PANEL_STEP[panel] || 1;
  }

  function updateProgress(step) {
    if (progressFill) progressFill.style.width = Math.min(100, (step / totalSteps()) * 100) + "%";
  }

  function syncSteppers(panel) {
    var step = panelStep(panel);
    var isInvoice = state.intent === "invoice";
    if (stepperQuote) stepperQuote.hidden = isInvoice;
    if (stepperInvoice) stepperInvoice.hidden = !isInvoice;
    var activeStepper = isInvoice ? stepperInvoice : stepperQuote;
    if (!activeStepper) return;
    activeStepper.querySelectorAll("[data-signup-step-indicator]").forEach(function (item) {
      var n = Number(item.getAttribute("data-signup-step-indicator"));
      item.classList.toggle("is-active", n === step);
      item.classList.toggle("is-complete", n < step);
    });
    updateProgress(step);
  }

  function scrollWizardIntoView() {
    var top = wizard.getBoundingClientRect().top + window.scrollY - 100;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }

  function setPanel(panel, opts) {
    var shouldScroll = !opts || opts.scroll !== false;
    state.panel = panel;
    wizard.querySelectorAll("[data-signup-panel]").forEach(function (el) {
      var isCurrent = el.getAttribute("data-signup-panel") === panel;
      el.hidden = !isCurrent;
      el.classList.toggle("is-active", isCurrent);
      if (isCurrent) {
        el.classList.remove("is-entering");
        void el.offsetWidth;
        el.classList.add("is-entering");
      }
    });
    syncSteppers(panel);
    if (panel === "quote-modules") {
      refreshModules(true);
    }
    if (stepFiveLabel) {
      stepFiveLabel.textContent = state.intent === "invoice" ? "Payment" : "Quote";
    }
    if (shouldScroll) scrollWizardIntoView();
  }

  function hideInvoicePreview() {
    state.invoiceToken = null;
    state.invoiceData = null;
    if (invoicePreviewWrap) invoicePreviewWrap.hidden = true;
    if (invoicePreviewHtml) invoicePreviewHtml.innerHTML = "";
    if (invoiceStripeBtn) invoiceStripeBtn.disabled = false;
  }

  function showInvoicePreview(data) {
    state.invoiceToken = data.token || state.invoiceToken;
    state.invoiceData = data;
    if (invoicePreviewHtml && data.previewHtml) {
      invoicePreviewHtml.innerHTML = data.previewHtml;
    }
    if (invoicePreviewWrap) invoicePreviewWrap.hidden = false;
    if (invoiceStripeBtn) {
      invoiceStripeBtn.disabled = !data.canPayOnline;
      invoiceStripeBtn.hidden = !!data.paid;
    }
  }

  function fieldValue(id) {
    var el = document.getElementById(id);
    return el ? String(el.value || "").trim() : "";
  }

  function fieldNumber(id) {
    return Math.max(0, Math.floor(Number(fieldValue(id)) || 0));
  }

  function validateCompany() {
    if (!fieldValue("companyName")) return "Please enter your company name.";
    if (!fieldValue("companyAddress")) return "Please enter your registered address.";
    return "";
  }

  function todayIsoDate() {
    var d = new Date();
    return (
      d.getFullYear() +
      "-" +
      String(d.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(d.getDate()).padStart(2, "0")
    );
  }

  function noCurrentContractChecked() {
    var el = document.getElementById("noCurrentContract");
    return !!(el && el.checked);
  }

  function openSignupDatePicker(dateEl) {
    if (!dateEl || dateEl.disabled) return;
    if (typeof dateEl.showPicker === "function") {
      try {
        dateEl.showPicker();
        return;
      } catch (_err) {
        /* Safari can throw if not triggered from a direct user gesture */
      }
    }
    dateEl.focus();
  }

  function syncCurrentContractDateField() {
    var dateEl = document.getElementById("currentContractEndDate");
    var noContractEl = document.getElementById("noCurrentContract");
    var openBtn = document.querySelector('[data-signup-date-open="currentContractEndDate"]');
    if (!dateEl) return;
    if (noContractEl && noContractEl.checked) {
      dateEl.value = "";
      dateEl.disabled = true;
      dateEl.removeAttribute("min");
      if (openBtn) openBtn.disabled = true;
    } else {
      dateEl.disabled = false;
      dateEl.min = todayIsoDate();
      if (openBtn) openBtn.disabled = false;
    }
  }

  function validateCurrentSetup() {
    if (noCurrentContractChecked()) return "";
    var endDate = fieldValue("currentContractEndDate");
    if (endDate && !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
      return "Please enter a valid contract end date.";
    }
    if (endDate && endDate < todayIsoDate()) {
      return "Contract end date must be today or in the future.";
    }
    return "";
  }

  function initSignupDateFields() {
    document.querySelectorAll("[data-signup-date-open]").forEach(function (btn) {
      var inputId = btn.getAttribute("data-signup-date-open");
      var dateEl = inputId ? document.getElementById(inputId) : null;
      if (!dateEl) return;
      btn.addEventListener("click", function () {
        openSignupDatePicker(dateEl);
      });
      dateEl.addEventListener("click", function () {
        openSignupDatePicker(dateEl);
      });
    });
  }

  function contactPhoneCountryIso() {
    var el = document.getElementById("contactPhoneCountry");
    return (el && el.value) || "GB";
  }

  function contactPhoneDialCode() {
    if (window.RiPhoneCountries) {
      return window.RiPhoneCountries.getDialForIso(contactPhoneCountryIso());
    }
    return "+44";
  }

  function formattedContactPhone() {
    if (window.RiPhoneCountries) {
      return window.RiPhoneCountries.formatPhone(contactPhoneDialCode(), fieldValue("contactPhone"));
    }
    return fieldValue("contactPhone");
  }

  function syncContactPhoneFlag() {
    var selectEl = document.getElementById("contactPhoneCountry");
    var flagEl = document.querySelector("[data-phone-flag]");
    if (!selectEl || !flagEl || !window.RiPhoneCountries) return;
    flagEl.textContent = window.RiPhoneCountries.getFlagForIso(selectEl.value);
  }

  function initContactPhoneCountry() {
    var selectEl = document.getElementById("contactPhoneCountry");
    if (!selectEl || !window.RiPhoneCountries) return;
    window.RiPhoneCountries.populateSelect(selectEl, "GB");
    syncContactPhoneFlag();
    selectEl.addEventListener("change", syncContactPhoneFlag);
  }

  function validateContact() {
    if (!fieldValue("contactName")) return "Please enter a contact name.";
    var national = fieldValue("contactPhone");
    if (!national) return "Please enter a contact phone number.";
    if (window.RiPhoneCountries) {
      var digits = window.RiPhoneCountries.normalizeNationalNumber(contactPhoneDialCode(), national);
      if (digits.length < 6) return "Please enter a valid phone number.";
      if (digits.length > 15) return "Please enter a valid phone number.";
    }
    var email = fieldValue("contactEmail");
    if (!email) return "Please enter a contact email.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Please enter a valid email address.";
    return "";
  }

  function validateQuoteRequirements() {
    var minMonths = (state.config && state.config.minContractMonths) || 12;
    var months = fieldNumber("contractMonths");
    if (months < minMonths) return "Minimum contract duration is " + minMonths + " months.";
    if (fieldNumber("platformUsers") < 1) return "Please enter how many users will use the platform.";
    if (fieldNumber("adminLicences") < 1) return "Please enter how many admin licences you require.";
    return "";
  }

  function getSelectedAddons() {
    var selected = new Set();
    document.querySelectorAll('input[name="addon"]:checked').forEach(function (el) {
      selected.add(el.value);
    });
    return selected;
  }

  function moduleHtml(modules, selected) {
    if (!modules || !modules.length) {
      return '<p class="signup-form__lead">No optional modules listed.</p>';
    }
    return modules
      .map(function (mod, index) {
        var isOn = selected && selected.has(mod.id);
        return (
          '<label class="signup-glass-tile signup-module-tile' +
          (isOn ? " is-selected" : "") +
          '" style="--tile-delay:' +
          index * 40 +
          'ms">' +
          '<input type="checkbox" class="signup-glass-tile__input" name="addon" value="' +
          mod.id +
          '"' +
          (isOn ? " checked" : "") +
          " />" +
          '<span class="signup-glass-tile__surface">' +
          '<span class="signup-glass-tile__bg" aria-hidden="true"></span>' +
          '<span class="signup-glass-tile__check" aria-hidden="true"></span>' +
          '<span class="signup-glass-tile__content">' +
          "<strong>" +
          mod.name +
          "</strong>" +
          "<span>" +
          mod.shortDescription +
          "</span>" +
          "</span>" +
          "</span>" +
          "</label>"
        );
      })
      .join("");
  }

  function syncTileSelection(container) {
    if (!container) return;
    container.querySelectorAll(".signup-module-tile").forEach(function (tile) {
      var input = tile.querySelector('input[name="addon"]');
      if (!input) return;
      tile.classList.toggle("is-selected", input.checked);
      input.addEventListener("change", function () {
        tile.classList.toggle("is-selected", input.checked);
      });
    });
  }

  function renderModules(modules) {
    state.modules = modules || [];
    var selected = getSelectedAddons();
    var html = moduleHtml(modules, selected);
    if (moduleListQuote) {
      moduleListQuote.innerHTML = html;
      syncTileSelection(moduleListQuote);
    }
  }

  function showModulesLoading() {
    var loading =
      '<div class="signup-modules-loading" role="status" aria-live="polite" aria-busy="true">' +
      '<div class="signup-modules-loading__spinner" aria-hidden="true"></div>' +
      '<p class="signup-modules-loading__text">Loading modules from Rail Intel…</p>' +
      '<p class="signup-modules-loading__hint">Fetching the latest add-ons from your CMS catalog</p>' +
      '<div class="signup-modules-loading__bar" aria-hidden="true"><span></span></div>' +
      "</div>";
    if (moduleListQuote) moduleListQuote.innerHTML = loading;
  }

  function showModulesError(message) {
    var html =
      '<div class="signup-modules-status signup-modules-status--error">' +
      '<p class="signup-form__lead">' +
      message +
      "</p>" +
      '<button type="button" class="btn btn-ghost" data-signup-reload-modules>Retry</button>' +
      "</div>";
    if (moduleListQuote) moduleListQuote.innerHTML = html;
    wizard.querySelectorAll("[data-signup-reload-modules]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        refreshModules(true);
      });
    });
  }

  function refreshModules(force) {
    if (!force && state.modulesLoadedAt && Date.now() - state.modulesLoadedAt < 30000) {
      return Promise.resolve();
    }
    showModulesLoading();
    return apiFetch("/public/onboarding-addons")
      .then(function (data) {
        if (!data || !data.modules || !data.modules.length) {
          showModulesError("No modules are available right now. Please try again.");
          return;
        }
        state.modulesLoadedAt = Date.now();
        renderModules(data.modules);
      })
      .catch(function (err) {
        showModulesError(err.message || "Could not load modules. Please try again.");
      });
  }

  function collectAddonsFrom(container) {
    var addons = [];
    if (!container) return addons;
    container.querySelectorAll('input[name="addon"]:checked').forEach(function (el) {
      addons.push(el.value);
    });
    return addons;
  }

  function collectBasePayload() {
    var dealCode = state.validatedDealCode || fieldValue("dealCode");
    return {
      companyName: fieldValue("companyName"),
      companyAddress: fieldValue("companyAddress"),
      contactName: fieldValue("contactName"),
      contactEmail: fieldValue("contactEmail"),
      contactPhone: formattedContactPhone(),
      notes: fieldValue("notes"),
      currentSupplier: fieldValue("currentSupplier"),
      noCurrentContract: noCurrentContractChecked(),
      currentContractEndDate: noCurrentContractChecked() ? undefined : fieldValue("currentContractEndDate") || undefined,
      source: "railintel.co.uk",
      website: fieldValue("website"),
      dealCode: dealCode || undefined,
    };
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderDealOffers(deals) {
    if (!dealOffersEl) return;
    if (!deals || !deals.length) {
      dealOffersEl.hidden = true;
      dealOffersEl.textContent = "";
      return;
    }
    dealOffersEl.innerHTML = deals
      .map(function (deal) {
        var perks = [];
        if (deal.discountPercent > 0) perks.push(deal.discountPercent + "% off catalogue items");
        if (deal.freeAddonNames && deal.freeAddonNames.length) {
          perks.push("free modules: " + deal.freeAddonNames.join(", "));
        }
        var detail = "";
        if (deal.description) detail += escapeHtml(deal.description);
        if (perks.length) detail += (detail ? " " : "") + "(" + escapeHtml(perks.join("; ")) + ")";
        return (
          '<article class="signup-deal-banner" role="note">' +
          '<span class="signup-deal-banner__spark" aria-hidden="true"></span>' +
          '<p class="signup-deal-banner__line">' +
          '<span class="signup-deal-banner__label">' +
          escapeHtml(deal.label) +
          "</span>" +
          '<span class="signup-deal-banner__sep" aria-hidden="true">—</span>' +
          "<span>use code </span>" +
          '<span class="signup-deal-banner__code">' +
          escapeHtml(deal.code) +
          "</span>" +
          (detail ? "<span>. " + detail + "</span>" : "") +
          "</p>" +
          "</article>"
        );
      })
      .join("");
    dealOffersEl.hidden = false;
  }

  function validateDealCodeInput() {
    var code = fieldValue("dealCode");
    if (!code) {
      state.validatedDealCode = null;
      if (dealCodeMsgEl) dealCodeMsgEl.hidden = true;
      return Promise.resolve(true);
    }
    return apiFetch("/public/deal-code/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code }),
    })
      .then(function (data) {
        if (data && data.ok && data.deal) {
          state.validatedDealCode = data.deal.code;
          var perks = [];
          if (data.deal.discountPercent > 0) perks.push(data.deal.discountPercent + "% off");
          if (data.deal.freeAddonNames && data.deal.freeAddonNames.length) {
            perks.push("includes free: " + data.deal.freeAddonNames.join(", "));
          }
          showMessage(
            dealCodeMsgEl,
            data.deal.label + " — code accepted" + (perks.length ? " (" + perks.join("; ") + ")" : "") + ".",
            "success",
          );
          return true;
        }
        state.validatedDealCode = null;
        showMessage(dealCodeMsgEl, (data && data.error) || "This deal code is not valid.", "error");
        return false;
      })
      .catch(function (err) {
        state.validatedDealCode = null;
        showMessage(dealCodeMsgEl, err.message || "Could not validate deal code.", "error");
        return false;
      });
  }

  function submitQuote() {
    var msgEl = getMsgEl("quote-modules");
    var btn = document.querySelector("[data-signup-submit-quote]");
    hideMessage(msgEl);
    var reqErr = validateQuoteRequirements();
    if (reqErr) {
      showMessage(getMsgEl("quote-requirements"), reqErr, "error");
      setPanel("quote-requirements");
      return;
    }
    if (btn) btn.disabled = true;

    validateDealCodeInput().then(function (dealOk) {
      if (!dealOk) return;

    var payload = Object.assign({}, collectBasePayload(), {
      requestType: "quote",
      contractDurationMonths: fieldNumber("contractMonths"),
      platformUserCount: fieldNumber("platformUsers"),
      adminLicenceCount: fieldNumber("adminLicences"),
      requestedAddons: collectAddonsFrom(moduleListQuote),
    });

    apiFetch("/public/signup-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(function (data) {
        if (successMessageQuote) {
          successMessageQuote.textContent = QUOTE_SUCCESS_HELPER;
        }
        if (successNoteQuote) {
          if (data && data.duplicate && data.message) {
            successNoteQuote.textContent = data.message;
            successNoteQuote.hidden = false;
          } else {
            successNoteQuote.textContent = "";
            successNoteQuote.hidden = true;
          }
        }
        setPanel("quote-complete");
      })
      .catch(function (err) {
        showMessage(msgEl, err.message || "Something went wrong.", "error");
      })
      .finally(function () {
        if (btn) btn.disabled = false;
      });
    });
  }

  function lookupInvoice() {
    var msgEl = getMsgEl("invoice-pay");
    var btn = document.querySelector("[data-signup-invoice-lookup]");
    hideMessage(msgEl);
    hideInvoicePreview();

    var invoiceNumber = fieldValue("invoiceNumber");
    var email = fieldValue("invoiceEmail");
    if (!invoiceNumber) {
      showMessage(msgEl, "Please enter your invoice number.", "error");
      return;
    }
    if (!email) {
      showMessage(msgEl, "Please enter the email address your invoice was sent to.", "error");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showMessage(msgEl, "Please enter a valid email address.", "error");
      return;
    }

    if (btn) btn.disabled = true;
    apiFetch("/public/invoice/lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invoiceNumber: invoiceNumber, email: email }),
    })
      .then(function (data) {
        if (data.paid) {
          showMessage(msgEl, "This invoice has already been paid.", "success");
        }
        showInvoicePreview(data);
        if (!data.canPayOnline && !data.paid) {
          showMessage(
            msgEl,
            "Card payment is not available for this invoice right now. Please pay by bank transfer using the details on the invoice, or contact sales@railintel.co.uk.",
            "error",
          );
        }
      })
      .catch(function (err) {
        showMessage(msgEl, err.message || "Could not find that invoice.", "error");
      })
      .finally(function () {
        if (btn) btn.disabled = false;
      });
  }

  function startInvoiceStripeCheckout() {
    if (!state.invoiceToken) return;
    var msgEl = getMsgEl("invoice-pay");
    hideMessage(msgEl);
    if (invoiceStripeBtn) invoiceStripeBtn.disabled = true;

    apiFetch("/public/invoice/" + encodeURIComponent(state.invoiceToken) + "/stripe-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    })
      .then(function (data) {
        if (data.url) window.location.href = data.url;
        else throw new Error("No checkout URL returned");
      })
      .catch(function (err) {
        showMessage(msgEl, err.message || "Checkout failed", "error");
        if (invoiceStripeBtn) invoiceStripeBtn.disabled = false;
      });
  }

  function handleInvoiceStripeReturn() {
    var params = new URLSearchParams(window.location.search);
    var invoiceToken = params.get("invoiceToken");
    var sessionId = params.get("session_id");
    var payment = params.get("payment");
    if (!invoiceToken || !sessionId || payment !== "success") return;

    state.intent = "invoice";
    state.invoiceToken = invoiceToken;
    setPanel("invoice-pay", { scroll: false });
    showMessage(getMsgEl("invoice-pay"), "Confirming payment…", "info");

    apiFetch(
      "/public/invoice/verify-payment?token=" +
        encodeURIComponent(invoiceToken) +
        "&sessionId=" +
        encodeURIComponent(sessionId),
    )
      .then(function (data) {
        if (successMessageInvoice) {
          successMessageInvoice.textContent =
            data.message || "Thank you — your invoice payment has been received. A receipt will be emailed to you shortly.";
        }
        setPanel("invoice-complete");
        window.history.replaceState({}, "", window.location.pathname);
      })
      .catch(function (err) {
        showMessage(getMsgEl("invoice-pay"), err.message || "Payment verification failed", "error");
      });
  }

  function handleStartupParams() {
    var params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success") return;
    var invoiceToken = params.get("invoiceToken");
    var intent = params.get("intent");
    if (invoiceToken) {
      state.intent = "invoice";
      state.invoiceToken = invoiceToken;
      apiFetch("/public/invoice/" + encodeURIComponent(invoiceToken))
        .then(function (data) {
          showInvoicePreview(Object.assign({ token: invoiceToken }, data));
          if (data.invoiceNumber) {
            var numberField = document.getElementById("invoiceNumber");
            if (numberField) numberField.value = data.invoiceNumber;
          }
          if (data.contactEmail) {
            var emailField = document.getElementById("invoiceEmail");
            if (emailField) emailField.value = data.contactEmail;
          }
          setPanel("invoice-pay", { scroll: false });
        })
        .catch(function () {});
      return;
    }
    if (intent === "invoice") {
      state.intent = "invoice";
      setPanel("invoice-pay", { scroll: false });
    }
  }

  function gotoPanel(target) {
    hideMessage(getMsgEl(state.panel));
    if (target === "intent") {
      state.intent = null;
      hideInvoicePreview();
      wizard.querySelectorAll("[data-signup-intent]").forEach(function (tile) {
        tile.classList.remove("is-selected");
      });
    }
    if (target === "company") {
      if (!state.intent) {
        showMessage(getMsgEl("intent"), "Please choose how you would like to get started.", "error");
        return;
      }
    }
    if (target === "current-setup") {
      var companyErr = validateCompany();
      if (companyErr) {
        showMessage(getMsgEl("company"), companyErr, "error");
        return;
      }
    }
    if (target === "contact") {
      var setupErr = validateCompany() || validateCurrentSetup();
      if (setupErr) {
        showMessage(getMsgEl(validateCompany() ? "current-setup" : "company"), setupErr, "error");
        return;
      }
    }
    if (target === "quote-requirements") {
      var contactErr = validateContact() || validateCurrentSetup() || validateCompany();
      if (contactErr) {
        showMessage(getMsgEl("contact"), contactErr, "error");
        return;
      }
    }
    if (target === "quote-modules") {
      var quoteErr = validateQuoteRequirements();
      if (quoteErr) {
        showMessage(getMsgEl("quote-requirements"), quoteErr, "error");
        return;
      }
    }
    if (target === "invoice-pay") {
      hideInvoicePreview();
    }
    setPanel(target);
  }

  function advanceFromContact() {
    gotoPanel("quote-requirements");
  }

  apiFetch("/public/signup-config")
    .then(function (data) {
      state.config = data;
    })
    .catch(function () {});

  apiFetch("/public/deal-codes")
    .then(function (data) {
      renderDealOffers(data && data.deals);
    })
    .catch(function () {});

  var dealCodeInput = document.getElementById("dealCode");
  if (dealCodeInput) {
    dealCodeInput.addEventListener("blur", function () {
      if (fieldValue("dealCode")) validateDealCodeInput();
      else if (dealCodeMsgEl) dealCodeMsgEl.hidden = true;
    });
  }

  initSignupDateFields();
  syncCurrentContractDateField();
  var noCurrentContractEl = document.getElementById("noCurrentContract");
  if (noCurrentContractEl) {
    noCurrentContractEl.addEventListener("change", syncCurrentContractDateField);
  }

  initContactPhoneCountry();

  handleInvoiceStripeReturn();
  handleStartupParams();
  if (!state.intent) setPanel("intent", { scroll: false });

  wizard.querySelectorAll("[data-signup-goto]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      gotoPanel(btn.getAttribute("data-signup-goto"));
    });
  });

  var advanceContactBtn = document.querySelector("[data-signup-advance-from-contact]");
  if (advanceContactBtn) {
    advanceContactBtn.addEventListener("click", advanceFromContact);
  }

  wizard.querySelectorAll("[data-signup-intent]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      state.intent = btn.getAttribute("data-signup-intent");
      hideMessage(getMsgEl("intent"));
      hideInvoicePreview();
      wizard.querySelectorAll("[data-signup-intent]").forEach(function (tile) {
        tile.classList.toggle("is-selected", tile === btn);
      });
      if (state.intent === "invoice") setPanel("invoice-pay");
      else setPanel("company");
    });
  });

  var submitQuoteBtn = document.querySelector("[data-signup-submit-quote]");
  if (submitQuoteBtn) {
    submitQuoteBtn.addEventListener("click", function () {
      var contactErr = validateContact() || validateCurrentSetup() || validateCompany();
      if (contactErr) {
        showMessage(getMsgEl("quote-modules"), contactErr, "error");
        return;
      }
      submitQuote();
    });
  }

  var invoiceLookupBtn = document.querySelector("[data-signup-invoice-lookup]");
  if (invoiceLookupBtn) {
    invoiceLookupBtn.addEventListener("click", lookupInvoice);
  }

  if (invoiceStripeBtn) {
    invoiceStripeBtn.addEventListener("click", startInvoiceStripeCheckout);
  }
})();
