/* Expression of interest — homepage slide-out (source: EOI) */
(function () {
  "use strict";

  var STORAGE_COLLAPSED = "railintel_eoi_collapsed";
  var STORAGE_REGISTERED = "railintel_eoi_registered";
  var STORAGE_PRODUCT = "railintel_eoi_product_interest";
  var SHOW_DELAY_MS = 4000;

  var widget = document.querySelector("[data-eoi-widget]");
  if (!widget) return;

  var teaser = widget.querySelector("[data-eoi-teaser]");
  var panel = widget.querySelector("[data-eoi-panel]");
  var form = widget.querySelector("[data-eoi-form]");
  var closeBtn = widget.querySelector("[data-eoi-close]");
  var dismissBtn = widget.querySelector("[data-eoi-dismiss]");
  var teaserDismissBtn = widget.querySelector("[data-eoi-teaser-dismiss]");
  var message = widget.querySelector("[data-eoi-message]");
  var successView = widget.querySelector("[data-eoi-success]");
  var submitBtn = form ? form.querySelector('button[type="submit"]') : null;
  var submitLabel = submitBtn ? submitBtn.textContent : "";

  function isInvestigationsPage() {
    return /\/products\/investigations\.html$/i.test(window.location.pathname);
  }

  function isRegistered() {
    try {
      return localStorage.getItem(STORAGE_REGISTERED) === "1";
    } catch (e) {
      return false;
    }
  }

  function isCollapsed() {
    try {
      return sessionStorage.getItem(STORAGE_COLLAPSED) === "1";
    } catch (e) {
      return false;
    }
  }

  function setCollapsed(collapsed) {
    widget.dataset.collapsed = collapsed ? "true" : "false";
    if (teaser) {
      teaser.setAttribute(
        "aria-label",
        collapsed ? "Open register your interest" : "Register your interest for April 2027 launch"
      );
    }
    try {
      if (collapsed) sessionStorage.setItem(STORAGE_COLLAPSED, "1");
      else sessionStorage.removeItem(STORAGE_COLLAPSED);
    } catch (e) {}
    if (collapsed) setExpanded(false);
  }

  function setRegistered() {
    try {
      localStorage.setItem(STORAGE_REGISTERED, "1");
    } catch (e) {}
  }

  var showTimeoutId = null;

  function revealWidget(callback) {
    widget.hidden = false;
    widget.setAttribute("aria-hidden", "false");
    delete widget.dataset.immediate;
    requestAnimationFrame(function () {
      widget.dataset.visible = "true";
      if (typeof callback === "function") {
        requestAnimationFrame(callback);
      }
    });
  }

  function showWidget() {
    revealWidget();
  }

  function applyEoiProductPreset() {
    if (!form) return;
    var select = form.querySelector('[name="product_interest"]');
    if (!select) return;
    var preset = "";
    try {
      preset = sessionStorage.getItem(STORAGE_PRODUCT) || "";
    } catch (e) {}
    if (!preset && /\/products\/investigations\.html$/i.test(window.location.pathname)) {
      preset = "investigations";
    }
    if (preset === "cms" || preset === "investigations") {
      select.value = preset;
      return;
    }
    if (!isInvestigationsPage()) {
      select.value = "cms";
    }
  }

  function reopenEoiForm() {
    if (form) form.hidden = false;
    if (successView) successView.hidden = true;
    clearMessage();
    applyEoiProductPreset();
  }

  function focusEoiPanel() {
    applyEoiProductPreset();
    var nameInput = form && form.querySelector('input[name="name"]');
    if (nameInput) {
      window.setTimeout(function () {
        nameInput.focus({ preventScroll: true });
      }, 120);
    }
  }

  function openEoiPanel() {
    if (!widget || !widget.isConnected) return false;
    if (isInvestigationsPage() && isRegistered()) {
      reopenEoiForm();
    }
    if (showTimeoutId !== null) {
      window.clearTimeout(showTimeoutId);
      showTimeoutId = null;
    }
    setCollapsed(false);
    widget.dataset.immediate = "true";
    revealWidget(function () {
      setExpanded(true);
      widget.dataset.open = "true";
      focusEoiPanel();
      window.setTimeout(function () {
        delete widget.dataset.immediate;
      }, 50);
    });
    if (location.hash !== "#register-interest") {
      history.replaceState(null, "", "#register-interest");
    }
    return true;
  }

  window.railintelEoiOpen = openEoiPanel;

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
    var bannerBtn = document.querySelector(".dev-banner__btn");
    if (bannerBtn) bannerBtn.hidden = true;
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

  if (isRegistered() && !isInvestigationsPage()) {
    window.railintelEoiOpen = null;
    widget.remove();
    return;
  }

  showTimeoutId = window.setTimeout(function () {
    showTimeoutId = null;
    showWidget();
    if (isCollapsed()) setCollapsed(true);
  }, SHOW_DELAY_MS);

  if (location.hash === "#register-interest") {
    openEoiPanel();
  }

  window.addEventListener("hashchange", function () {
    if (location.hash === "#register-interest") openEoiPanel();
  });

  if (teaser) {
    teaser.addEventListener("click", function () {
      if (widget.dataset.collapsed === "true") {
        setCollapsed(false);
        setExpanded(true);
        return;
      }
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
      setCollapsed(true);
    });
  }

  if (teaserDismissBtn) {
    teaserDismissBtn.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      setCollapsed(true);
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
    var productSelect = form.querySelector('[name="product_interest"]');
    var honeypot = form.querySelector('input[name="website"]');

    applyEoiProductPreset();

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!nameInput || !emailInput) return;

      var name = nameInput.value.trim();
      var email = emailInput.value.trim();
      var productInterest = productSelect ? productSelect.value.trim() : "";
      if (productInterest !== "cms" && productInterest !== "investigations") {
        showMessage("Please select the product you are interested in.", "error");
        if (productSelect) productSelect.focus({ preventScroll: true });
        return;
      }
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
        product_interest: productInterest,
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
