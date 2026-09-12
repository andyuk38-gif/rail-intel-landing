/* Self-serve CMS signup — quote vs purchase paths */
(function () {
  "use strict";

  var meta = document.querySelector('meta[name="cms-api"]');
  var apiBase = (meta && meta.getAttribute("content")) || "https://cms.railintel.co.uk/api";
  var wizard = document.querySelector("[data-cms-signup-wizard]");
  var form = document.querySelector("[data-cms-signup-form]");
  if (!wizard || !form) return;

  var moduleListQuote = document.querySelector("[data-signup-modules]");
  var moduleListPurchase = document.querySelector("[data-signup-modules-purchase]");
  var paymentOptions = document.querySelector("[data-signup-payment-options]");
  var bankDetailsEl = document.querySelector("[data-signup-bank-details]");
  var stripePanel = document.querySelector("[data-signup-stripe-panel]");
  var bankPanel = document.querySelector("[data-signup-bank-panel]");
  var successMessageQuote = document.querySelector("[data-signup-success-message]");
  var successMessagePurchase = document.querySelector("[data-signup-success-message-purchase]");
  var asideTip = document.querySelector("[data-signup-aside-tip]");
  var asideTitle = document.querySelector("[data-signup-aside-title]");

  var PANEL_STEP = {
    company: 1,
    contact: 2,
    "path-choice": 3,
    "quote-requirements": 4,
    "quote-modules": 4,
    "purchase-modules": 4,
    "purchase-payment": 4,
    "purchase-pay": 4,
    "quote-complete": 5,
    "purchase-complete": 5,
  };

  var ASIDE_COPY = {
    company: {
      title: "Step 1 — Company",
      tip: "Enter your registered company name and address. This becomes your CMS tenant identity.",
    },
    contact: {
      title: "Step 2 — Contact",
      tip: "Your primary contact receives application updates and the welcome email once approved.",
    },
    "path-choice": {
      title: "Step 3 — Your path",
      tip: "Request a tailored quotation or proceed directly to purchase and onboarding.",
    },
    "quote-requirements": {
      title: "Quotation requirements",
      tip: "Minimum contract term is 12 months. Tell us how many users and admin licences you need.",
    },
    "quote-modules": {
      title: "Modules for your quote",
      tip: "Select bolt-on modules to include in your quotation.",
    },
    "purchase-modules": {
      title: "Modules",
      tip: "Optional bolt-ons can be enabled during approval.",
    },
    "purchase-payment": {
      title: "Payment method",
      tip: "Choose card payment or bank transfer with a purchase order. No prices are shown on this step.",
    },
    "purchase-pay": {
      title: "Complete payment",
      tip: "Pay by card via Stripe or upload your PO and arrange a BACS transfer.",
    },
    "quote-complete": {
      title: "Quotation requested",
      tip: "We will prepare your quote and email it to you for acceptance.",
    },
    "purchase-complete": {
      title: "Application received",
      tip: "We will review your application and email you when your CMS space is ready.",
    },
  };

  var state = {
    panel: "company",
    path: null,
    signupId: null,
    config: null,
    paymentMethod: null,
    modules: [],
  };

  function apiUrl(path) {
    return apiBase.replace(/\/$/, "") + path;
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

  function updateAside(panel) {
    var copy = ASIDE_COPY[panel] || ASIDE_COPY.company;
    if (asideTitle) asideTitle.textContent = copy.title;
    if (asideTip) asideTip.textContent = copy.tip;
  }

  function scrollWizardIntoView() {
    var top = wizard.getBoundingClientRect().top + window.scrollY - 100;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }

  function setPanel(panel) {
    state.panel = panel;
    wizard.querySelectorAll("[data-signup-panel]").forEach(function (el) {
      el.hidden = el.getAttribute("data-signup-panel") !== panel;
    });
    var step = PANEL_STEP[panel] || 1;
    wizard.querySelectorAll("[data-signup-step-indicator]").forEach(function (item) {
      var n = Number(item.getAttribute("data-signup-step-indicator"));
      item.classList.toggle("is-active", n === step);
      item.classList.toggle("is-complete", n < step);
    });
    updateAside(panel);
    scrollWizardIntoView();
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

  function validateContact() {
    if (!fieldValue("contactName")) return "Please enter a contact name.";
    if (!fieldValue("contactPhone")) return "Please enter a contact phone number.";
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

  function readEmbeddedModules() {
    var el = document.getElementById("signup-onboarding-modules");
    if (!el) return [];
    try {
      var data = JSON.parse(el.textContent || "[]");
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  }

  function moduleHtml(modules, selected) {
    if (!modules || !modules.length) {
      return '<p class="signup-form__lead">No optional modules listed.</p>';
    }
    return modules
      .map(function (mod) {
        var checked = selected && selected.has(mod.id) ? " checked" : "";
        return (
          '<label class="signup-module">' +
          '<input type="checkbox" name="addon" value="' +
          mod.id +
          '"' +
          checked +
          " />" +
          "<span><strong>" +
          mod.name +
          "</strong><span>" +
          mod.shortDescription +
          "</span></span>" +
          "</label>"
        );
      })
      .join("");
  }

  function renderModules(modules) {
    state.modules = modules || [];
    var selected = getSelectedAddons();
    var html = moduleHtml(modules, selected);
    if (moduleListQuote) moduleListQuote.innerHTML = html;
    if (moduleListPurchase) moduleListPurchase.innerHTML = html;
  }

  function loadModules() {
    var embedded = readEmbeddedModules();
    if (embedded.length) renderModules(embedded);
    else {
      var loading = '<p class="signup-form__lead">Loading modules…</p>';
      if (moduleListQuote) moduleListQuote.innerHTML = loading;
      if (moduleListPurchase) moduleListPurchase.innerHTML = loading;
    }

    fetch(apiUrl("/public/onboarding-addons"))
      .then(function (res) {
        return res.ok ? res.json() : null;
      })
      .then(function (data) {
        if (data && data.modules && data.modules.length) renderModules(data.modules);
        else if (!embedded.length) renderModules([]);
      })
      .catch(function () {
        if (!embedded.length) renderModules([]);
      });
  }

  function renderPaymentOptions() {
    if (!paymentOptions || !state.config) return;
    var html = "";
    if (state.config.stripeEnabled) {
      html +=
        '<label class="signup-payment-option">' +
        '<input type="radio" name="paymentMethod" value="stripe" />' +
        "<span><strong>Pay by card (Stripe)</strong><span>Secure card payment — submitted immediately after payment.</span></span>" +
        "</label>";
    }
    if (state.config.bankTransferEnabled) {
      html +=
        '<label class="signup-payment-option">' +
        '<input type="radio" name="paymentMethod" value="bank_transfer" />' +
        "<span><strong>Bank transfer</strong><span>Upload your purchase order and pay by BACS.</span></span>" +
        "</label>";
    }
    if (!html) {
      html =
        '<p class="signup-form__lead">Online payment is not configured yet. Please contact <a href="mailto:sales@railintel.co.uk">sales@railintel.co.uk</a>.</p>';
    }
    paymentOptions.innerHTML = html;
  }

  function renderBankDetails() {
    if (!bankDetailsEl || !state.config || !state.config.bankDetails) return;
    var b = state.config.bankDetails;
    bankDetailsEl.innerHTML =
      '<dl class="signup-bank-details__grid">' +
      "<div><dt>Account name</dt><dd>" +
      b.accountName +
      "</dd></div>" +
      "<div><dt>Sort code</dt><dd>" +
      b.sortCode +
      "</dd></div>" +
      "<div><dt>Account number</dt><dd>" +
      b.accountNumber +
      "</dd></div>" +
      "</dl>";
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
    return {
      companyName: fieldValue("companyName"),
      companyAddress: fieldValue("companyAddress"),
      contactName: fieldValue("contactName"),
      contactEmail: fieldValue("contactEmail"),
      contactPhone: fieldValue("contactPhone"),
      notes: fieldValue("notes") || fieldValue("purchaseNotes"),
      source: "railintel.co.uk",
      website: fieldValue("website"),
    };
  }

  function readFileAsBase64(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        var result = String(reader.result || "");
        resolve(result.indexOf(",") >= 0 ? result.split(",")[1] : result);
      };
      reader.onerror = function () {
        reject(new Error("Could not read file"));
      };
      reader.readAsDataURL(file);
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

    var payload = Object.assign({}, collectBasePayload(), {
      requestType: "quote",
      contractDurationMonths: fieldNumber("contractMonths"),
      platformUserCount: fieldNumber("platformUsers"),
      adminLicenceCount: fieldNumber("adminLicences"),
      requestedAddons: collectAddonsFrom(moduleListQuote),
    });

    fetch(apiUrl("/public/signup-request"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(function (res) {
        return res.json().then(function (data) {
          if (!res.ok) throw new Error(data.error || "Could not submit quotation request");
          return data;
        });
      })
      .then(function (data) {
        if (successMessageQuote) {
          successMessageQuote.textContent =
            data.message || "Thank you — we will prepare your quotation and email it to you shortly.";
        }
        setPanel("quote-complete");
      })
      .catch(function (err) {
        showMessage(msgEl, err.message || "Something went wrong.", "error");
      })
      .finally(function () {
        if (btn) btn.disabled = false;
      });
  }

  function savePurchaseDraft() {
    var msgEl = getMsgEl("purchase-modules");
    var btn = document.querySelector("[data-signup-save-purchase]");
    hideMessage(msgEl);
    if (btn) btn.disabled = true;

    var payload = Object.assign({}, collectBasePayload(), {
      requestType: "purchase",
      requestedAddons: collectAddonsFrom(moduleListPurchase),
    });

    return fetch(apiUrl("/public/signup-request"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(function (res) {
        return res.json().then(function (data) {
          if (!res.ok) throw new Error(data.error || "Could not save application");
          return data;
        });
      })
      .then(function (data) {
        state.signupId = data.id;
        setPanel("purchase-payment");
      })
      .catch(function (err) {
        showMessage(msgEl, err.message || "Something went wrong.", "error");
      })
      .finally(function () {
        if (btn) btn.disabled = false;
      });
  }

  function handleStripeReturn() {
    var params = new URLSearchParams(window.location.search);
    var signupId = params.get("signupId");
    var sessionId = params.get("session_id");
    var payment = params.get("payment");
    if (!signupId || !sessionId || payment !== "success") return;

    state.signupId = signupId;
    state.path = "purchase";
    setPanel("purchase-pay");
    showMessage(getMsgEl("purchase-pay"), "Confirming payment…", "info");

    fetch(
      apiUrl(
        "/public/signup-request/verify-payment?signupId=" +
          encodeURIComponent(signupId) +
          "&sessionId=" +
          encodeURIComponent(sessionId)
      )
    )
      .then(function (res) {
        return res.json().then(function (data) {
          if (!res.ok) throw new Error(data.error || "Payment verification failed");
          return data;
        });
      })
      .then(function (data) {
        if (successMessagePurchase) {
          successMessagePurchase.textContent =
            data.message || "Payment received. Your application is with our team.";
        }
        setPanel("purchase-complete");
        window.history.replaceState({}, "", window.location.pathname);
      })
      .catch(function (err) {
        showMessage(getMsgEl("purchase-pay"), err.message || "Payment verification failed", "error");
      });
  }

  function gotoPanel(target) {
    hideMessage(getMsgEl(state.panel));
    if (target === "contact") {
      var err = validateCompany();
      if (err) {
        showMessage(getMsgEl("company"), err, "error");
        return;
      }
    }
    if (target === "path-choice") {
      var contactErr = validateContact();
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
    setPanel(target);
  }

  loadModules();

  fetch(apiUrl("/public/signup-config"))
    .then(function (res) {
      return res.ok ? res.json() : null;
    })
    .then(function (data) {
      state.config = data;
      renderPaymentOptions();
      renderBankDetails();
    })
    .catch(function () {});

  handleStripeReturn();
  setPanel("company");

  wizard.querySelectorAll("[data-signup-goto]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      gotoPanel(btn.getAttribute("data-signup-goto"));
    });
  });

  wizard.querySelectorAll("[data-signup-path]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      state.path = btn.getAttribute("data-signup-path");
      hideMessage(getMsgEl("path-choice"));
      if (state.path === "quote") setPanel("quote-requirements");
      else if (state.path === "purchase") setPanel("purchase-modules");
    });
  });

  var submitQuoteBtn = document.querySelector("[data-signup-submit-quote]");
  if (submitQuoteBtn) {
    submitQuoteBtn.addEventListener("click", function () {
      var contactErr = validateContact() || validateCompany();
      if (contactErr) {
        showMessage(getMsgEl("quote-modules"), contactErr, "error");
        return;
      }
      submitQuote();
    });
  }

  var savePurchaseBtn = document.querySelector("[data-signup-save-purchase]");
  if (savePurchaseBtn) {
    savePurchaseBtn.addEventListener("click", function () {
      var contactErr = validateContact() || validateCompany();
      if (contactErr) {
        showMessage(getMsgEl("purchase-modules"), contactErr, "error");
        return;
      }
      savePurchaseDraft();
    });
  }

  if (paymentOptions) {
    paymentOptions.addEventListener("change", function (event) {
      var target = event.target;
      if (!target || target.name !== "paymentMethod") return;
      state.paymentMethod = target.value;
      var continueBtn = document.querySelector("[data-signup-payment-continue]");
      if (continueBtn) continueBtn.disabled = false;
    });
  }

  var paymentContinueBtn = document.querySelector("[data-signup-payment-continue]");
  if (paymentContinueBtn) {
    paymentContinueBtn.addEventListener("click", function () {
      if (!state.paymentMethod) return;
      hideMessage(getMsgEl("purchase-payment"));
      if (stripePanel) stripePanel.hidden = state.paymentMethod !== "stripe";
      if (bankPanel) bankPanel.hidden = state.paymentMethod !== "bank_transfer";
      setPanel("purchase-pay");
    });
  }

  var stripePayBtn = document.querySelector("[data-signup-stripe-pay]");
  if (stripePayBtn) {
    stripePayBtn.addEventListener("click", function () {
      if (!state.signupId) return;
      var el = getMsgEl("purchase-pay");
      hideMessage(el);
      stripePayBtn.disabled = true;

      fetch(apiUrl("/public/signup-request/" + encodeURIComponent(state.signupId) + "/stripe-checkout"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      })
        .then(function (res) {
          return res.json().then(function (data) {
            if (!res.ok) throw new Error(data.error || "Could not start checkout");
            return data;
          });
        })
        .then(function (data) {
          if (data.url) window.location.href = data.url;
          else throw new Error("No checkout URL returned");
        })
        .catch(function (err) {
          showMessage(el, err.message || "Checkout failed", "error");
          stripePayBtn.disabled = false;
        });
    });
  }

  var bankSubmitBtn = document.querySelector("[data-signup-bank-submit]");
  if (bankSubmitBtn) {
    bankSubmitBtn.addEventListener("click", function () {
      if (!state.signupId) return;
      var el = getMsgEl("purchase-pay");
      var fileInput = document.querySelector("[data-signup-po-file]");
      var bankRef = document.getElementById("bankReference");
      hideMessage(el);

      if (!fileInput || !fileInput.files || !fileInput.files[0]) {
        showMessage(el, "Please upload your purchase order document.", "error");
        return;
      }
      var file = fileInput.files[0];
      if (file.size > 10 * 1024 * 1024) {
        showMessage(el, "Purchase order must be 10 MB or smaller.", "error");
        return;
      }

      bankSubmitBtn.disabled = true;
      readFileAsBase64(file)
        .then(function (base64) {
          return fetch(apiUrl("/public/signup-request/" + encodeURIComponent(state.signupId) + "/bank-payment"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              poFileName: file.name,
              poFileContentBase64: base64,
              bankReference: bankRef ? bankRef.value : "",
            }),
          }).then(function (res) {
            return res.json().then(function (data) {
              if (!res.ok) throw new Error(data.error || "Submission failed");
              return data;
            });
          });
        })
        .then(function (data) {
          if (successMessagePurchase) {
            successMessagePurchase.textContent = data.message || "Application submitted.";
          }
          setPanel("purchase-complete");
        })
        .catch(function (err) {
          showMessage(el, err.message || "Submission failed", "error");
        })
        .finally(function () {
          bankSubmitBtn.disabled = false;
        });
    });
  }
})();
