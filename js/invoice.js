/* Client invoice view */
(function () {
  "use strict";

  var meta = document.querySelector('meta[name="cms-api"]');
  var proxyMeta = document.querySelector('meta[name="signup-api-proxy"]');
  var apiBase = (meta && meta.getAttribute("content")) || "https://cms.railintel.co.uk/api";
  var proxyBase = proxyMeta && proxyMeta.getAttribute("content");
  var view = document.querySelector("[data-invoice-view]");
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

  function fetchJson(path, retriesLeft) {
    if (retriesLeft === undefined) retriesLeft = 2;
    return fetch(apiUrl(path)).then(function (res) {
      if ((res.status === 502 || res.status === 503) && retriesLeft > 0) {
        return new Promise(function (resolve) {
          setTimeout(resolve, 600);
        }).then(function () {
          return fetchJson(path, retriesLeft - 1);
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
      '<p class="signup-form__lead">Loading your invoice…</p>' +
      '<div class="doc-load-skeleton__block"></div>' +
      '<div class="doc-load-skeleton__block doc-load-skeleton__block--short"></div>' +
      "</div>";
  }

  function renderError(message) {
    view.innerHTML =
      '<h2 class="signup-form__title">Invoice unavailable</h2>' +
      '<p class="signup-form__lead signup-form__lead--success">' +
      message +
      "</p>" +
      '<p><a href="/get-started.html">Return to get started</a></p>';
  }

  function renderInvoice(data) {
    var paid = data.status === "paid";
    view.innerHTML =
      '<h2 class="signup-form__title">Invoice for ' +
      (data.companyName || "your company") +
      "</h2>" +
      '<p class="signup-form__lead signup-form__lead--success">Hello ' +
      (data.contactName || "there") +
      ", please find your invoice below." +
      (paid ? " This invoice has been marked as paid." : "") +
      "</p>" +
      '<div class="quotation-a4-wrap" data-invoice-preview></div>';

    var preview = view.querySelector("[data-invoice-preview]");
    if (preview && data.previewHtml) {
      preview.innerHTML = data.previewHtml;
    }
  }

  if (!token) {
    renderError("No invoice link was provided. Check the email we sent you.");
    return;
  }

  showLoading();
  fetchJson("/public/invoice/" + encodeURIComponent(token))
    .then(renderInvoice)
    .catch(function (err) {
      renderError(err.message || "This invoice is no longer available.");
    });
})();
