/* Client quotation view — accept or decline */
(function () {
  "use strict";

  var meta = document.querySelector('meta[name="cms-api"]');
  var proxyMeta = document.querySelector('meta[name="signup-api-proxy"]');
  var apiBase = (meta && meta.getAttribute("content")) || "https://cms.railintel.co.uk/api";
  var proxyBase = proxyMeta && proxyMeta.getAttribute("content");
  var view = document.querySelector("[data-quotation-view]");
  if (!view) return;

  var params = new URLSearchParams(window.location.search);
  var token = params.get("token");

  function apiUrl(path) {
    var normalized = String(path || "").replace(/^\//, "");
    if (proxyBase) {
      return proxyBase.replace(/\/$/, "") + "?path=" + encodeURIComponent(normalized);
    }
    return apiBase.replace(/\/$/, "") + "/" + normalized;
  }

  function fetchJson(path, options, retriesLeft) {
    if (retriesLeft === undefined) retriesLeft = 2;
    return fetch(apiUrl(path), options).then(function (res) {
      if ((res.status === 502 || res.status === 503) && retriesLeft > 0) {
        return new Promise(function (resolve) {
          setTimeout(resolve, 600);
        }).then(function () {
          return fetchJson(path, options, retriesLeft - 1);
        });
      }
      return res.json().then(function (data) {
        if (!res.ok) throw new Error(data.error || "Request failed");
        return data;
      });
    });
  }

  function showLoading() {
    view.innerHTML =
      '<div class="doc-load-skeleton" aria-busy="true" aria-live="polite">' +
      '<p class="signup-form__lead">Loading your quotation…</p>' +
      '<div class="doc-load-skeleton__block"></div>' +
      '<div class="doc-load-skeleton__block doc-load-skeleton__block--short"></div>' +
      "</div>";
  }

  function fixedChromeInset() {
    var chrome = document.querySelector(".site-chrome");
    var bottom = chrome ? chrome.getBoundingClientRect().bottom : 0;
    return Math.max(bottom, 96) + 16;
  }

  function setQuotationCompleteState() {
    var heroTitle = document.querySelector(".page-hero .page-title");
    var heroSection = document.querySelector(".page-hero");
    var breadcrumb = document.querySelector(".page-hero .breadcrumb");
    if (heroTitle) heroTitle.textContent = "Thank you";
    if (heroSection) heroSection.classList.add("page-hero--complete");
    if (breadcrumb) breadcrumb.hidden = true;
  }

  function scrollThankYouIntoView(container) {
    if (!container) return;
    var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var behavior = reduced ? "auto" : "smooth";

    function align() {
      var target =
        document.querySelector(".page-hero--complete .page-title") ||
        container.querySelector("#quotation-thank-you") ||
        container.querySelector(".signup-form__title") ||
        container;
      var inset = fixedChromeInset();
      target.style.scrollMarginTop = inset + "px";
      target.scrollIntoView({ behavior: behavior, block: "start", inline: "nearest" });
      target.setAttribute("tabindex", "-1");
      try {
        target.focus({ preventScroll: true });
      } catch (e) {
        target.focus();
      }
    }

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        align();
        setTimeout(align, 80);
        setTimeout(function () {
          align();
        }, 420);
      });
    });
  }

  function backLinkHtml() {
    return '<p class="doc-view-back"><a class="doc-view-back__link" href="/get-started.html">Return to get started</a></p>';
  }

  function renderError(message) {
    view.innerHTML =
      '<h2 class="signup-form__title">Quotation unavailable</h2>' +
      '<p class="signup-form__lead signup-form__lead--success">' +
      message +
      "</p>" +
      backLinkHtml();
  }

  function renderComplete(message, previewHtml) {
    setQuotationCompleteState();
    var html =
      '<p class="signup-form__lead signup-form__lead--success" id="quotation-thank-you">' +
      (message || "Your response has been recorded.") +
      "</p>" +
      backLinkHtml();
    if (previewHtml) {
      html +=
        '<div class="quotation-a4-wrap quotation-a4-wrap--readonly" data-quotation-preview>' +
        previewHtml +
        "</div>";
    }
    view.innerHTML = html;
    scrollThankYouIntoView(view);
  }

  function renderQuotation(data) {
    var status = String(data.status || "").toLowerCase();
    if (status === "accepted") {
      renderComplete(
        "This quotation has already been accepted. Thank you — we have emailed your invoice with payment instructions.",
        data.previewHtml
      );
      return;
    }
    if (status === "declined") {
      renderComplete(
        "This quotation was declined. Contact sales@railintel.co.uk if you would like a new quotation.",
        data.previewHtml
      );
      return;
    }

    var preset = params.get("respond");
    var intentBanner = "";
    if (preset === "accept") {
      intentBanner =
        '<p class="quotation-intent" role="status">You chose <strong>Accept</strong> from your email. Review the quotation below, then confirm with the Accept button.</p>';
    } else if (preset === "decline") {
      intentBanner =
        '<p class="quotation-intent" role="status">You chose <strong>Decline</strong> from your email. Review the quotation below, then confirm with the Decline button.</p>';
    }

    view.innerHTML =
      '<h2 class="signup-form__title">Quotation for ' +
      (data.companyName || "your company") +
      "</h2>" +
      '<p class="signup-form__lead signup-form__lead--success">Hello ' +
      (data.contactName || "there") +
      ", please review your quotation below and accept or decline.</p>" +
      intentBanner +
      '<div class="quotation-a4-wrap" data-quotation-preview></div>' +
      '<p class="signup-form__message" data-quotation-message hidden></p>' +
      '<div class="signup-wizard__actions quotation-actions">' +
      '<button type="button" class="btn btn-primary" data-quotation-accept>Accept quotation</button>' +
      '<button type="button" class="btn btn-ghost" data-quotation-decline>Decline</button>' +
      "</div>";

    var preview = view.querySelector("[data-quotation-preview]");
    if (preview && data.previewHtml) {
      preview.innerHTML = data.previewHtml;
    }

    var msgEl = view.querySelector("[data-quotation-message]");

    function respond(action) {
      var acceptBtn = view.querySelector("[data-quotation-accept]");
      var declineBtn = view.querySelector("[data-quotation-decline]");
      if (acceptBtn) acceptBtn.disabled = true;
      if (declineBtn) declineBtn.disabled = true;
      if (msgEl) {
        msgEl.hidden = false;
        msgEl.textContent = "Submitting…";
        msgEl.dataset.state = "info";
      }

      fetchJson("/public/quotation/" + encodeURIComponent(token) + "/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: action }),
      }, 1)
        .then(function (body) {
          // Drop respond= from the URL so a refresh does not look like a fresh accept intent.
          try {
            window.history.replaceState({}, "", window.location.pathname + "?token=" + encodeURIComponent(token));
          } catch (e) {}
          renderComplete(body.message || "Your response has been recorded.", data.previewHtml);
        })
        .catch(function (err) {
          if (msgEl) {
            msgEl.textContent = err.message || "Something went wrong.";
            msgEl.dataset.state = "error";
          }
          if (acceptBtn) acceptBtn.disabled = false;
          if (declineBtn) declineBtn.disabled = false;
        });
    }

    var acceptBtn = view.querySelector("[data-quotation-accept]");
    var declineBtn = view.querySelector("[data-quotation-decline]");
    if (acceptBtn) acceptBtn.addEventListener("click", function () { respond("accept"); });
    if (declineBtn) declineBtn.addEventListener("click", function () { respond("decline"); });

    // Do NOT auto-POST from ?respond= — email link scanners / in-app browsers would
    // accept before the client can read the quotation. Show the quote and wait for a click.
    if (preset === "accept" && acceptBtn) {
      acceptBtn.focus();
      acceptBtn.scrollIntoView({ block: "nearest", behavior: "smooth" });
    } else if (preset === "decline" && declineBtn) {
      declineBtn.focus();
      declineBtn.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }

  if (!token) {
    renderError("No quotation link was provided. Check the email we sent you.");
    return;
  }

  showLoading();
  fetchJson("/public/quotation/" + encodeURIComponent(token))
    .then(renderQuotation)
    .catch(function (err) {
      renderError(err.message || "This quotation is no longer available.");
    });
})();
