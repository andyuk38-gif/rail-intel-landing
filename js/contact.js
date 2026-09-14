/* Contact form — routed to Rail Intel CMS admin email */
(function () {
  "use strict";

  var form = document.querySelector("[data-contact-form]");
  if (!form) return;

  var wrap = document.querySelector("[data-contact-form-wrap]");
  var success = document.querySelector("[data-contact-success]");
  var message = form.querySelector("[data-contact-message]");
  var submitBtn = form.querySelector('button[type="submit"]');
  var submitLabel = submitBtn ? submitBtn.textContent : "Send message";
  var startedAtInput = form.querySelector("[data-form-started-at]");
  var turnstileMount = form.querySelector("[data-turnstile]");
  var requiresTurnstile = form.getAttribute("data-contact-requires-turnstile") === "true";

  var turnstileMeta = document.querySelector('meta[name="turnstile-site-key"]');
  var turnstileSiteKey = (turnstileMeta && turnstileMeta.getAttribute("content")) || "";
  var turnstileWidgetId = null;
  var turnstileReady = false;

  var cmsMeta = document.querySelector('meta[name="cms-api"]');
  var proxyMeta = document.querySelector('meta[name="signup-api-proxy"]');
  var cmsApiBase = (cmsMeta && cmsMeta.getAttribute("content")) || "https://cms.railintel.co.uk/api";
  var proxyBase = proxyMeta && proxyMeta.getAttribute("content");

  if (startedAtInput) startedAtInput.value = String(Date.now());

  function contactUrl() {
    if (proxyBase) {
      return proxyBase.replace(/\/$/, "") + "?path=public/contact";
    }
    return cmsApiBase.replace(/\/$/, "") + "/public/contact";
  }

  function showMessage(text, state) {
    if (!message) return;
    message.textContent = text;
    message.hidden = false;
    message.dataset.state = state;
    message.setAttribute("role", "status");
    message.setAttribute("aria-live", "polite");
  }

  function clearMessage() {
    if (!message) return;
    message.textContent = "";
    message.hidden = true;
    delete message.dataset.state;
  }

  function showSuccess(text) {
    form.hidden = true;
    if (success) {
      success.hidden = false;
      var lead = success.querySelector("p");
      if (lead && text) lead.textContent = text;
    }
    if (wrap) wrap.dataset.state = "success";
  }

  function setSubmitEnabled(enabled) {
    if (!submitBtn) return;
    submitBtn.disabled = !enabled;
  }

  function getTurnstileToken() {
    if (!requiresTurnstile || !window.turnstile || turnstileWidgetId == null) return "";
    return window.turnstile.getResponse(turnstileWidgetId) || "";
  }

  function resetTurnstile() {
    turnstileReady = false;
    if (window.turnstile && turnstileWidgetId != null) {
      window.turnstile.reset(turnstileWidgetId);
    }
    if (requiresTurnstile) setSubmitEnabled(false);
  }

  function initTurnstile() {
    if (!requiresTurnstile || !turnstileSiteKey || !turnstileMount || !window.turnstile) return;

    turnstileMount.dataset.turnstilePending = "false";
    turnstileWidgetId = window.turnstile.render(turnstileMount, {
      sitekey: turnstileSiteKey,
      theme: "dark",
      appearance: "always",
      callback: function () {
        turnstileReady = true;
        setSubmitEnabled(true);
        clearMessage();
      },
      "expired-callback": function () {
        turnstileReady = false;
        resetTurnstile();
        showMessage("Verification expired. Please verify again before sending.", "error");
      },
      "error-callback": function () {
        turnstileReady = false;
        setSubmitEnabled(false);
        showMessage("Human verification failed to load. Please refresh and try again.", "error");
      },
    });
  }

  function waitForTurnstile(attempt) {
    if (!requiresTurnstile) return;
    if (window.turnstile) {
      initTurnstile();
      return;
    }
    if ((attempt || 0) >= 120) {
      showMessage("Human verification could not be loaded. Please refresh the page.", "error");
      return;
    }
    window.setTimeout(function () {
      waitForTurnstile((attempt || 0) + 1);
    }, 50);
  }

  if (requiresTurnstile) {
    setSubmitEnabled(false);
    waitForTurnstile(0);
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    clearMessage();

    var nameInput = form.querySelector('input[name="name"]');
    var emailInput = form.querySelector('input[name="email"]');
    var companyInput = form.querySelector('input[name="company"]');
    var phoneInput = form.querySelector('input[name="phone"]');
    var departmentInput = form.querySelector('select[name="department"]');
    var messageInput = form.querySelector('textarea[name="message"]');
    var honeypot = form.querySelector('input[name="website"]');

    var name = nameInput ? nameInput.value.trim() : "";
    var email = emailInput ? emailInput.value.trim() : "";
    var company = companyInput ? companyInput.value.trim() : "";
    var phone = phoneInput ? phoneInput.value.trim() : "";
    var department = departmentInput ? departmentInput.value.trim() : "";
    var body = messageInput ? messageInput.value.trim() : "";
    var formStartedAt = startedAtInput ? Number(startedAtInput.value) : 0;
    var turnstileToken = getTurnstileToken();

    if (!name) {
      showMessage("Please enter your name.", "error");
      if (nameInput) nameInput.focus();
      return;
    }
    if (!email) {
      showMessage("Please enter your email address.", "error");
      if (emailInput) emailInput.focus();
      return;
    }
    if (!department) {
      showMessage("Please choose a department.", "error");
      if (departmentInput) departmentInput.focus();
      return;
    }
    if (body.length < 10) {
      showMessage("Please enter a message of at least 10 characters.", "error");
      if (messageInput) messageInput.focus();
      return;
    }
    if (requiresTurnstile && (!turnstileReady || !turnstileToken)) {
      showMessage("Please complete the human verification check.", "error");
      return;
    }
    if (formStartedAt && Date.now() - formStartedAt < 4000) {
      showMessage("Please take a moment to complete the form before sending.", "error");
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";
    }

    fetch(contactUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name,
        email: email,
        company: company,
        phone: phone,
        department: department,
        message: body,
        source: "railintel_website",
        website: honeypot && honeypot.value ? String(honeypot.value) : "",
        formStartedAt: formStartedAt,
        turnstileToken: turnstileToken,
      }),
    })
      .then(function (res) {
        return res
          .json()
          .catch(function () {
            return {};
          })
          .then(function (data) {
            if (!res.ok) throw new Error((data && data.error) || "Could not send your message.");
            showSuccess((data && data.message) || "");
          });
      })
      .catch(function (err) {
        showMessage(err.message || "Something went wrong. Please try again later.", "error");
        resetTurnstile();
      })
      .finally(function () {
        if (submitBtn) {
          submitBtn.textContent = submitLabel;
          if (!requiresTurnstile || turnstileReady) submitBtn.disabled = false;
          else submitBtn.disabled = true;
        }
      });
  });
})();
