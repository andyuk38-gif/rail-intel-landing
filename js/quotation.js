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

  function renderError(message) {
    view.innerHTML =
      '<h2 class="signup-form__title">Quotation unavailable</h2>' +
      '<p class="signup-form__lead">' +
      message +
      "</p>" +
      '<p><a href="/get-started.html">Return to get started</a></p>';
  }

  function renderQuotation(data) {
    view.innerHTML =
      '<h2 class="signup-form__title">Quotation for ' +
      (data.companyName || "your company") +
      "</h2>" +
      '<p class="signup-form__lead">Hello ' +
      (data.contactName || "there") +
      ", please review your quotation below.</p>" +
      '<div class="quotation-preview" data-quotation-preview></div>' +
      '<p class="signup-form__message" data-quotation-message hidden></p>' +
      '<div class="signup-wizard__actions">' +
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

      fetch(apiUrl("/public/quotation/" + encodeURIComponent(token) + "/respond"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: action }),
      })
        .then(function (res) {
          return res.json().then(function (body) {
            if (!res.ok) throw new Error(body.error || "Could not submit response");
            return body;
          });
        })
        .then(function (body) {
          view.innerHTML =
            '<h2 class="signup-form__title">Thank you</h2>' +
            '<p class="signup-form__lead">' +
            (body.message || "Your response has been recorded.") +
            "</p>";
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
  }

  if (!token) {
    renderError("No quotation link was provided. Check the email we sent you.");
    return;
  }

  fetch(apiUrl("/public/quotation/" + encodeURIComponent(token)))
    .then(function (res) {
      return res.json().then(function (data) {
        if (!res.ok) throw new Error(data.error || "Quotation not found");
        return data;
      });
    })
    .then(renderQuotation)
    .catch(function (err) {
      renderError(err.message || "This quotation is no longer available.");
    });
})();
