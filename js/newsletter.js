/* Footer newsletter — syncs subscribers to Rail Intel CMS */
(function () {
  "use strict";

  var cmsMeta = document.querySelector('meta[name="cms-api"]');
  var proxyMeta = document.querySelector('meta[name="signup-api-proxy"]');
  var cmsApiBase = (cmsMeta && cmsMeta.getAttribute("content")) || "https://cms.railintel.co.uk/api";
  var proxyBase = proxyMeta && proxyMeta.getAttribute("content");
  var siteAdminMeta = document.querySelector('meta[name="site-admin-api"]');
  var siteAdminApiBase = (siteAdminMeta && siteAdminMeta.getAttribute("content")) || "/5473/api";

  function subscribeUrl() {
    if (proxyBase) {
      return proxyBase.replace(/\/$/, "") + "?path=public/newsletter/subscribe";
    }
    return cmsApiBase.replace(/\/$/, "") + "/public/newsletter/subscribe";
  }

  function applyContentOverrides() {
    if (!siteAdminApiBase) return;
    fetch(siteAdminApiBase.replace(/\/$/, "") + "/public/content")
      .then(function (res) {
        return res.ok ? res.json() : null;
      })
      .then(function (data) {
        if (!data || !data.content) return;
        Object.keys(data.content).forEach(function (key) {
          var nodes = document.querySelectorAll('[data-content-key="' + key + '"]');
          nodes.forEach(function (node) {
            node.textContent = data.content[key].value;
          });
        });
      })
      .catch(function () {});
  }

  var forms = document.querySelectorAll("[data-newsletter-form]");
  forms.forEach(function (form) {
    var wrap = form.closest(".footer-newsletter");
    var input = form.querySelector('input[type="email"]');
    var honeypot = form.querySelector('input[name="website"]');
    var message = wrap ? wrap.querySelector("[data-newsletter-message]") : null;
    var button = form.querySelector('button[type="submit"]');
    var buttonLabel = button ? button.textContent : "";

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

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!input) return;
      var email = input.value.trim();
      if (!email) return;

      if (button) {
        button.disabled = true;
        button.textContent = "Subscribing…";
      }
      clearMessage();

      fetch(subscribeUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          source: "railintel_website",
          website: honeypot && honeypot.value ? String(honeypot.value) : "",
        }),
      })
        .then(function (res) {
          return res.json().then(function (data) {
            if (!res.ok) throw new Error((data && data.error) || "Subscription failed");
            return data;
          });
        })
        .then(function (data) {
          var text =
            (data && data.message) ||
            (data && data.created === false
              ? "You are already subscribed — thank you."
              : "Thanks — you are subscribed to Rail Intel news.");
          showMessage(text, "success");
          input.value = "";
        })
        .catch(function (err) {
          showMessage(err.message || "Something went wrong. Try again later.", "error");
        })
        .finally(function () {
          if (button) {
            button.disabled = false;
            button.textContent = buttonLabel;
          }
        });
    });
  });

  applyContentOverrides();
})();
