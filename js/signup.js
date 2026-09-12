/* Self-serve CMS signup wizard — stepped navigation, payment, PO upload */
(function () {
  "use strict";

  var meta = document.querySelector('meta[name="cms-api"]');
  var apiBase = (meta && meta.getAttribute("content")) || "https://cms.railintel.co.uk/api";
  var wizard = document.querySelector("[data-cms-signup-wizard]");
  var form = document.querySelector("[data-cms-signup-form]");
  if (!wizard || !form) return;

  var moduleList = document.querySelector("[data-signup-modules]");
  var priceLabel = document.querySelector("[data-signup-price-label]");
  var paymentOptions = document.querySelector("[data-signup-payment-options]");
  var bankDetailsEl = document.querySelector("[data-signup-bank-details]");
  var stripePanel = document.querySelector("[data-signup-stripe-panel]");
  var bankPanel = document.querySelector("[data-signup-bank-panel]");
  var successMessage = document.querySelector("[data-signup-success-message]");
  var asideTip = document.querySelector("[data-signup-aside-tip]");
  var asideTitle = document.querySelector("[data-signup-aside-title]");

  var ASIDE_COPY = {
    1: {
      title: "Step 1 — Company",
      tip: "Enter your registered company name and address. This becomes your CMS tenant identity.",
    },
    2: {
      title: "Step 2 — Contact",
      tip: "Your primary contact receives application updates and the welcome email once approved.",
    },
    3: {
      title: "Step 3 — Modules",
      tip: "Optional bolt-ons can be enabled during approval. Skip any you do not need yet.",
    },
    4: {
      title: "Step 4 — Payment",
      tip: "Choose card payment (instant) or bank transfer with a purchase order for procurement teams.",
    },
    5: {
      title: "Step 5 — Pay / PO",
      tip: "Complete Stripe checkout or upload your PO and arrange a BACS transfer.",
    },
    6: {
      title: "All done",
      tip: "We will review your application and email you when your CMS space is ready.",
    },
  };

  var state = {
    step: 1,
    signupId: null,
    config: null,
    paymentMethod: null,
  };

  function apiUrl(path) {
    return apiBase.replace(/\/$/, "") + path;
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

  function updateAside(step) {
    var copy = ASIDE_COPY[step] || ASIDE_COPY[1];
    if (asideTitle) asideTitle.textContent = copy.title;
    if (asideTip) asideTip.textContent = copy.tip;
  }

  function scrollWizardIntoView() {
    var top = wizard.getBoundingClientRect().top + window.scrollY - 100;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }

  function setStep(step) {
    state.step = step;
    wizard.querySelectorAll("[data-signup-panel]").forEach(function (panel) {
      var n = Number(panel.getAttribute("data-signup-panel"));
      panel.hidden = n !== step;
    });
    wizard.querySelectorAll("[data-signup-step-indicator]").forEach(function (item) {
      var n = Number(item.getAttribute("data-signup-step-indicator"));
      item.classList.toggle("is-active", n === step);
      item.classList.toggle("is-complete", n < step);
    });
    updateAside(step);
    scrollWizardIntoView();
  }

  function fieldValue(id) {
    var el = document.getElementById(id);
    return el ? String(el.value || "").trim() : "";
  }

  function validateStep(step) {
    if (step === 1) {
      if (!fieldValue("companyName")) return "Please enter your company name.";
      if (!fieldValue("companyAddress")) return "Please enter your registered address.";
    }
    if (step === 2) {
      if (!fieldValue("contactName")) return "Please enter a contact name.";
      if (!fieldValue("contactPhone")) return "Please enter a contact phone number.";
      var email = fieldValue("contactEmail");
      if (!email) return "Please enter a contact email.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Please enter a valid email address.";
    }
    return "";
  }

  function renderModules(modules) {
    if (!moduleList || !modules || !modules.length) {
      if (moduleList) moduleList.innerHTML = '<p class="signup-form__lead">No optional modules listed.</p>';
      return;
    }
    moduleList.innerHTML = modules
      .map(function (mod) {
        return (
          '<label class="signup-module">' +
          '<input type="checkbox" name="addon" value="' +
          mod.id +
          '" />' +
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

  function collectPayload() {
    var addons = [];
    form.querySelectorAll('input[name="addon"]:checked').forEach(function (el) {
      addons.push(el.value);
    });
    return {
      companyName: fieldValue("companyName"),
      companyAddress: fieldValue("companyAddress"),
      contactName: fieldValue("contactName"),
      contactEmail: fieldValue("contactEmail"),
      contactPhone: fieldValue("contactPhone"),
      notes: fieldValue("notes"),
      requestedAddons: addons,
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

  function saveDraftAndContinue() {
    var msgEl = document.querySelector("[data-signup-message-step3]");
    var btn = document.querySelector("[data-signup-save-modules]");
    hideMessage(msgEl);
    if (btn) btn.disabled = true;

    return fetch(apiUrl("/public/signup-request"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(collectPayload()),
    })
      .then(function (res) {
        return res.json().then(function (data) {
          if (!res.ok) throw new Error(data.error || "Could not save application");
          return data;
        });
      })
      .then(function (data) {
        state.signupId = data.id;
        setStep(4);
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
    setStep(5);
    showMessage(document.querySelector("[data-signup-message-step5]"), "Confirming payment…", "info");

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
        if (successMessage) successMessage.textContent = data.message || "Payment received. Your application is with our team.";
        setStep(6);
        window.history.replaceState({}, "", window.location.pathname);
      })
      .catch(function (err) {
        showMessage(document.querySelector("[data-signup-message-step5]"), err.message || "Payment verification failed", "error");
      });
  }

  fetch(apiUrl("/public/onboarding-addons"))
    .then(function (res) {
      return res.ok ? res.json() : null;
    })
    .then(function (data) {
      if (data && data.modules) renderModules(data.modules);
    })
    .catch(function () {});

  fetch(apiUrl("/public/signup-config"))
    .then(function (res) {
      return res.ok ? res.json() : null;
    })
    .then(function (data) {
      state.config = data;
      if (priceLabel && data && data.pricing) {
        priceLabel.textContent = data.pricing.label + " — " + (data.pricing.description || "");
      }
      renderPaymentOptions();
      renderBankDetails();
    })
    .catch(function () {});

  handleStripeReturn();
  updateAside(1);

  wizard.querySelectorAll("[data-signup-next]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var target = Number(btn.getAttribute("data-signup-next"));
      var err = validateStep(state.step);
      var msgEl = document.querySelector("[data-signup-message-step" + state.step + "]");
      hideMessage(msgEl);
      if (err) {
        showMessage(msgEl, err, "error");
        return;
      }
      setStep(target);
    });
  });

  wizard.querySelectorAll("[data-signup-back]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var target = Number(btn.getAttribute("data-signup-back"));
      hideMessage(document.querySelector("[data-signup-message-step" + state.step + "]"));
      setStep(target);
    });
  });

  var saveModulesBtn = document.querySelector("[data-signup-save-modules]");
  if (saveModulesBtn) {
    saveModulesBtn.addEventListener("click", function () {
      var err = validateStep(2);
      var msgEl = document.querySelector("[data-signup-message-step3]");
      hideMessage(msgEl);
      if (err) {
        showMessage(msgEl, err, "error");
        setStep(2);
        return;
      }
      saveDraftAndContinue();
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
      hideMessage(document.querySelector("[data-signup-message-step4]"));
      if (stripePanel) stripePanel.hidden = state.paymentMethod !== "stripe";
      if (bankPanel) bankPanel.hidden = state.paymentMethod !== "bank_transfer";
      setStep(5);
    });
  }

  var stripePayBtn = document.querySelector("[data-signup-stripe-pay]");
  if (stripePayBtn) {
    stripePayBtn.addEventListener("click", function () {
      if (!state.signupId) return;
      var msgEl = document.querySelector("[data-signup-message-step5]");
      hideMessage(msgEl);
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
          showMessage(msgEl, err.message || "Checkout failed", "error");
          stripePayBtn.disabled = false;
        });
    });
  }

  var bankSubmitBtn = document.querySelector("[data-signup-bank-submit]");
  if (bankSubmitBtn) {
    bankSubmitBtn.addEventListener("click", function () {
      if (!state.signupId) return;
      var msgEl = document.querySelector("[data-signup-message-step5]");
      var fileInput = document.querySelector("[data-signup-po-file]");
      var bankRef = document.getElementById("bankReference");
      hideMessage(msgEl);

      if (!fileInput || !fileInput.files || !fileInput.files[0]) {
        showMessage(msgEl, "Please upload your purchase order document.", "error");
        return;
      }
      var file = fileInput.files[0];
      if (file.size > 10 * 1024 * 1024) {
        showMessage(msgEl, "Purchase order must be 10 MB or smaller.", "error");
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
          if (successMessage) successMessage.textContent = data.message || "Application submitted.";
          setStep(6);
        })
        .catch(function (err) {
          showMessage(msgEl, err.message || "Submission failed", "error");
        })
        .finally(function () {
          bankSubmitBtn.disabled = false;
        });
    });
  }
})();
