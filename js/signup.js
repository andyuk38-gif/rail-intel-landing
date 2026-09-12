/* Self-serve CMS signup wizard — company details, payment, PO upload */
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
  }

  function renderModules(modules) {
    if (!moduleList || !modules || !modules.length) return;
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
        "<span><strong>Pay by card (Stripe)</strong><span>Secure card payment — your application is submitted immediately after payment.</span></span>" +
        "</label>";
    }
    if (state.config.bankTransferEnabled) {
      html +=
        '<label class="signup-payment-option">' +
        '<input type="radio" name="paymentMethod" value="bank_transfer" />' +
        "<span><strong>Bank transfer</strong><span>Upload your purchase order and pay by BACS. We activate once payment is received.</span></span>" +
        "</label>";
    }
    if (!html) {
      html = '<p class="signup-form__lead">Online payment is not configured yet. Please contact <a href="mailto:sales@railintel.co.uk">sales@railintel.co.uk</a>.</p>';
    }
    paymentOptions.innerHTML = html;
  }

  function renderBankDetails() {
    if (!bankDetailsEl || !state.config || !state.config.bankDetails) return;
    var b = state.config.bankDetails;
    bankDetailsEl.innerHTML =
      "<dl class=\"signup-bank-details__grid\">" +
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
    var fd = new FormData(form);
    var addons = [];
    form.querySelectorAll('input[name="addon"]:checked').forEach(function (el) {
      addons.push(el.value);
    });
    return {
      companyName: fd.get("companyName"),
      companyAddress: fd.get("companyAddress"),
      contactName: fd.get("contactName"),
      contactEmail: fd.get("contactEmail"),
      contactPhone: fd.get("contactPhone"),
      notes: fd.get("notes"),
      requestedAddons: addons,
      source: "railintel.co.uk",
      website: fd.get("website") || "",
    };
  }

  function readFileAsBase64(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        var result = String(reader.result || "");
        var base64 = result.indexOf(",") >= 0 ? result.split(",")[1] : result;
        resolve(base64);
      };
      reader.onerror = function () {
        reject(new Error("Could not read file"));
      };
      reader.readAsDataURL(file);
    });
  }

  function handleStripeReturn() {
    var params = new URLSearchParams(window.location.search);
    var signupId = params.get("signupId");
    var sessionId = params.get("session_id");
    var payment = params.get("payment");
    if (!signupId || !sessionId || payment !== "success") return;

    state.signupId = signupId;
    setStep(3);
    showMessage(document.querySelector("[data-signup-message-step3]"), "Confirming payment…", "info");

    fetch(apiUrl("/public/signup-request/verify-payment?signupId=" + encodeURIComponent(signupId) + "&sessionId=" + encodeURIComponent(sessionId)))
      .then(function (res) {
        return res.json().then(function (data) {
          if (!res.ok) throw new Error(data.error || "Payment verification failed");
          return data;
        });
      })
      .then(function (data) {
        if (successMessage) successMessage.textContent = data.message || "Payment received. Your application is with our team.";
        setStep(4);
        window.history.replaceState({}, "", window.location.pathname);
      })
      .catch(function (err) {
        showMessage(document.querySelector("[data-signup-message-step3]"), err.message || "Payment verification failed", "error");
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

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var msgEl = form.querySelector("[data-signup-message]");
    var btn = form.querySelector("[data-signup-continue]");
    hideMessage(msgEl);
    if (btn) btn.disabled = true;

    fetch(apiUrl("/public/signup-request"), {
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
        setStep(2);
      })
      .catch(function (err) {
        showMessage(msgEl, err.message || "Something went wrong.", "error");
      })
      .finally(function () {
        if (btn) btn.disabled = false;
      });
  });

  if (!paymentOptions) return;

  paymentOptions.addEventListener("change", function (event) {
    var target = event.target;
    if (!target || target.name !== "paymentMethod") return;
    state.paymentMethod = target.value;
    var continueBtn = document.querySelector("[data-signup-payment-continue]");
    if (continueBtn) continueBtn.disabled = false;
  });

  document.querySelector("[data-signup-payment-continue]").addEventListener("click", function () {
    if (!state.paymentMethod) return;
    hideMessage(document.querySelector("[data-signup-message-step2]"));
    if (stripePanel) stripePanel.hidden = state.paymentMethod !== "stripe";
    if (bankPanel) bankPanel.hidden = state.paymentMethod !== "bank_transfer";
    setStep(3);
  });

  wizard.querySelector("[data-signup-back]").addEventListener("click", function () {
    setStep(1);
  });

  wizard.querySelector("[data-signup-back-payment]").addEventListener("click", function () {
    setStep(2);
  });

  document.querySelector("[data-signup-stripe-pay]").addEventListener("click", function () {
    if (!state.signupId) return;
    var btn = document.querySelector("[data-signup-stripe-pay]");
    var msgEl = document.querySelector("[data-signup-message-step3]");
    hideMessage(msgEl);
    if (btn) btn.disabled = true;

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
        if (btn) btn.disabled = false;
      });
  });

  document.querySelector("[data-signup-bank-submit]").addEventListener("click", function () {
    if (!state.signupId) return;
    var msgEl = document.querySelector("[data-signup-message-step3]");
    var btn = document.querySelector("[data-signup-bank-submit]");
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

    if (btn) btn.disabled = true;
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
        setStep(4);
      })
      .catch(function (err) {
        showMessage(msgEl, err.message || "Submission failed", "error");
      })
      .finally(function () {
        if (btn) btn.disabled = false;
      });
  });
})();
