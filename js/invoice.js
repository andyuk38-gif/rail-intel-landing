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
  var invoiceData = null;

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
      '<p class="signup-form__lead">Loading your invoice…</p>' +
      '<div class="doc-load-skeleton__block"></div>' +
      '<div class="doc-load-skeleton__block doc-load-skeleton__block--short"></div>' +
      "</div>";
  }

  function backLinkHtml() {
    return '<p class="doc-view-back"><a class="doc-view-back__link" href="/get-started.html">Return to get started</a></p>';
  }

  function renderError(message) {
    view.innerHTML =
      '<h2 class="signup-form__title">Invoice unavailable</h2>' +
      '<p class="signup-form__lead signup-form__lead--success">' +
      message +
      "</p>" +
      backLinkHtml();
  }

  function handleStripeReturn() {
    var sessionId = params.get("session_id");
    var payment = params.get("payment");
    if (!token || !sessionId || payment !== "success") return false;

    view.innerHTML = '<p class="signup-form__lead">Confirming payment…</p>';
    fetchJson(
      "/public/invoice/verify-payment?token=" + encodeURIComponent(token) + "&sessionId=" + encodeURIComponent(sessionId),
    )
      .then(function (data) {
        view.innerHTML =
          '<h2 class="signup-form__title">Payment received</h2>' +
          '<p class="signup-form__lead signup-form__lead--success">' +
          (data.message || "Thank you — your invoice payment has been received.") +
          "</p>" +
          backLinkHtml();
        window.history.replaceState({}, "", window.location.pathname + "?token=" + encodeURIComponent(token));
      })
      .catch(function (err) {
        renderError(err.message || "Payment verification failed.");
      });
    return true;
  }

  function startStripeCheckout() {
    if (!token) return;
    var btn = view.querySelector("[data-invoice-stripe-pay]");
    if (btn) btn.disabled = true;
    fetchJson("/public/invoice/" + encodeURIComponent(token) + "/stripe-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ returnTo: "invoice" }),
    })
      .then(function (data) {
        if (data.url) window.location.href = data.url;
        else throw new Error("No checkout URL returned");
      })
      .catch(function (err) {
        var msg = view.querySelector("[data-invoice-pay-msg]");
        if (msg) {
          msg.textContent = err.message || "Checkout failed";
          msg.hidden = false;
        }
        if (btn) btn.disabled = false;
      });
  }

  function renderInvoice(data) {
    invoiceData = data;
    var paid = data.paid || data.status === "paid";
    var payBlock = "";
    if (!paid && data.canPayOnline) {
      payBlock =
        '<div class="signup-invoice-pay">' +
        '<p class="signup-fee-notice" role="note">' +
        "<strong>Card payments:</strong> Additional transactional fees may apply when paying by credit or debit card via Stripe." +
        "</p>" +
        '<p class="signup-form__message" data-invoice-pay-msg hidden></p>' +
        '<div class="signup-wizard__actions">' +
        '<button type="button" class="btn btn-primary" data-invoice-stripe-pay>Pay by card with Stripe</button>' +
        "</div></div>";
    } else if (!paid && !data.canPayOnline) {
      payBlock =
        '<p class="signup-form__lead" style="margin-top:1rem">Please pay by bank transfer using the details on the invoice.</p>';
    }
    if (!paid) {
      if (data.bacsDeclaredAt) {
        payBlock +=
          '<p class="signup-form__lead signup-form__lead--success" style="margin-top:1rem">You have confirmed this invoice was paid by bank transfer. CMS access is sent once we confirm the funds have arrived.</p>';
      } else {
        payBlock +=
          '<div class="signup-invoice-pay" style="margin-top:1rem">' +
          '<p class="signup-form__lead">Paid by bank transfer? Confirm it here. You do not need a CMS login.</p>' +
          '<p class="signup-form__message" data-invoice-bacs-msg hidden></p>' +
          '<div class="signup-wizard__actions">' +
          '<button type="button" class="btn btn-primary" data-invoice-bacs-paid>I have paid by bank transfer</button>' +
          "</div></div>";
      }
    }

    var showReceipt = paid && params.get("view") === "receipt" && data.receiptHtml;
    view.innerHTML =
      '<h2 class="signup-form__title">' +
      (showReceipt ? "Receipt" : "Invoice") +
      " for " +
      (data.companyName || "your company") +
      "</h2>" +
      '<p class="signup-form__lead signup-form__lead--success">Hello ' +
      (data.contactName || "there") +
      (showReceipt
        ? ", please find your payment receipt below."
        : ", please find your invoice below." + (paid ? " This invoice has been marked as paid." : "")) +
      "</p>" +
      '<div class="quotation-a4-wrap" data-invoice-preview></div>' +
      payBlock;

    var preview = view.querySelector("[data-invoice-preview]");
    var documentHtml = showReceipt ? data.receiptHtml : data.previewHtml;
    if (preview && documentHtml) {
      preview.innerHTML = documentHtml;
    }

    var payBtn = view.querySelector("[data-invoice-stripe-pay]");
    if (payBtn) payBtn.addEventListener("click", startStripeCheckout);
    var bacsBtn = view.querySelector("[data-invoice-bacs-paid]");
    if (bacsBtn) bacsBtn.addEventListener("click", declareBacsPaid);
  }

  function declareBacsPaid() {
    if (!token) return;
    var btn = view.querySelector("[data-invoice-bacs-paid]");
    var msg = view.querySelector("[data-invoice-bacs-msg]");
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Recording your payment…";
    }
    if (msg) {
      msg.hidden = false;
      msg.dataset.state = "working";
      msg.textContent = "Recording that you have paid by bank transfer.";
    }
    fetchJson("/public/invoice/" + encodeURIComponent(token) + "/declare-bacs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    })
      .then(function (data) {
        if (invoiceData) invoiceData.bacsDeclaredAt = data.bacsDeclaredAt || new Date().toISOString();
        renderInvoice(invoiceData || data);
      })
      .catch(function (err) {
        if (msg) {
          msg.hidden = false;
          msg.dataset.state = "error";
          msg.textContent = err.message || "Could not record your payment.";
        }
        if (btn) {
          btn.disabled = false;
          btn.textContent = "I have paid by bank transfer";
        }
      });
  }

  if (!token) {
    renderError("No invoice link was provided. Check the email we sent you.");
    return;
  }

  if (handleStripeReturn()) return;

  showLoading();
  fetchJson("/public/invoice/" + encodeURIComponent(token))
    .then(function (data) {
      renderInvoice(data);
      var paid = data.paid || data.status === "paid";
      if (!paid && !data.bacsDeclaredAt && params.get("funds") === "transferred") {
        declareBacsPaid();
      }
    })
    .catch(function (err) {
      renderError(err.message || "This invoice is no longer available.");
    });
})();
