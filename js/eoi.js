/* Expression of interest — homepage slide-out (source: EOI) */
(function () {
  "use strict";

  var STORAGE_DISMISS = "railintel_eoi_dismissed_until";
  var STORAGE_REGISTERED = "railintel_eoi_registered";
  var DISMISS_DAYS = 7;
  var SHOW_DELAY_MS = 4000;

  var widget = document.querySelector("[data-eoi-widget]");
  if (!widget) return;

  var teaser = widget.querySelector("[data-eoi-teaser]");
  var panel = widget.querySelector("[data-eoi-panel]");
  var form = widget.querySelector("[data-eoi-form]");
  var closeBtn = widget.querySelector("[data-eoi-close]");
  var dismissBtn = widget.querySelector("[data-eoi-dismiss]");
  var message = widget.querySelector("[data-eoi-message]");
  var successView = widget.querySelector("[data-eoi-success]");
  var submitBtn = form ? form.querySelector('button[type="submit"]') : null;
  var submitLabel = submitBtn ? submitBtn.textContent : "";

  function now() {
    return Date.now();
  }

  function isDismissed() {
    try {
      var until = parseInt(localStorage.getItem(STORAGE_DISMISS) || "0", 10);
      return until > now();
    } catch (e) {
      return false;
    }
  }

  function isRegistered() {
    try {
      return localStorage.getItem(STORAGE_REGISTERED) === "1";
    } catch (e) {
      return false;
    }
  }

  function setDismissed() {
    try {
      localStorage.setItem(STORAGE_DISMISS, String(now() + DISMISS_DAYS * 86400000));
    } catch (e) {}
  }

  function setRegistered() {
    try {
      localStorage.setItem(STORAGE_REGISTERED, "1");
    } catch (e) {}
  }

  function showWidget() {
    widget.hidden = false;
    requestAnimationFrame(function () {
      widget.dataset.visible = "true";
    });
  }

  function setExpanded(open) {
    widget.dataset.expanded = open ? "true" : "false";
    if (teaser) teaser.setAttribute("aria-expanded", open ? "true" : "false");
    if (panel) panel.hidden = !open;
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

  function showSuccess() {
    if (form) form.hidden = true;
    if (successView) successView.hidden = false;
    setRegistered();
  }

  function subscribe(payload) {
    if (typeof window.railintelNewsletterSubscribe === "function") {
      return window.railintelNewsletterSubscribe(payload);
    }
    var cmsMeta = document.querySelector('meta[name="cms-api"]');
    var proxyMeta = document.querySelector('meta[name="signup-api-proxy"]');
    var cmsApiBase = (cmsMeta && cmsMeta.getAttribute("content")) || "https://cms.railintel.co.uk/api";
    var proxyBase = proxyMeta && proxyMeta.getAttribute("content");
    var url = proxyBase
      ? proxyBase.replace(/\/$/, "") + "?path=public/newsletter/subscribe"
      : cmsApiBase.replace(/\/$/, "") + "/public/newsletter/subscribe";
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(function (res) {
      return res.json().then(function (data) {
        if (!res.ok) throw new Error((data && data.error) || "Registration failed");
        return data;
      });
    });
  }

  if (isRegistered()) {
    widget.remove();
    return;
  }

  if (isDismissed()) {
    widget.remove();
    return;
  }

  window.setTimeout(showWidget, SHOW_DELAY_MS);

  if (teaser) {
    teaser.addEventListener("click", function () {
      setExpanded(widget.dataset.expanded !== "true");
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", function () {
      setExpanded(false);
    });
  }

  if (dismissBtn) {
    dismissBtn.addEventListener("click", function () {
      setDismissed();
      widget.dataset.visible = "false";
      window.setTimeout(function () {
        widget.remove();
      }, 320);
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && widget.dataset.expanded === "true") {
      setExpanded(false);
    }
  });

  if (form) {
    var nameInput = form.querySelector('input[name="name"]');
    var emailInput = form.querySelector('input[type="email"]');
    var honeypot = form.querySelector('input[name="website"]');

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!nameInput || !emailInput) return;

      var name = nameInput.value.trim();
      var email = emailInput.value.trim();
      if (!name || !email) return;

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Registering…";
      }
      clearMessage();

      subscribe({
        email: email,
        name: name,
        source: "EOI",
        website: honeypot && honeypot.value ? String(honeypot.value) : "",
      })
        .then(function () {
          showSuccess();
        })
        .catch(function (err) {
          showMessage(err.message || "Something went wrong. Please try again.", "error");
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = submitLabel;
          }
        });
    });
  }
})();
