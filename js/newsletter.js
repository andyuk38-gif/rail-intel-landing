/* Public newsletter signup — posts to site-admin API */
(function () {
  "use strict";

  var meta = document.querySelector('meta[name="site-admin-api"]');
  var apiBase = (meta && meta.getAttribute("content")) || "/5473/api";

  var forms = document.querySelectorAll("[data-newsletter-form]");
  forms.forEach(function (form) {
    var wrap = form.closest(".footer-newsletter");
    var input = form.querySelector('input[type="email"]');
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

      fetch(apiBase.replace(/\/$/, "") + "/public/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, source: "website-footer" }),
      })
        .then(function (res) {
          return res.json().then(function (data) {
            if (!res.ok) throw new Error(data.error || "Subscription failed");
            return data;
          });
        })
        .then(function (data) {
          showMessage(data.message || "Thanks — you are subscribed.", "success");
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

  /* Optional: apply published content overrides */
  fetch(apiBase.replace(/\/$/, "") + "/public/content")
    .then(function (res) { return res.ok ? res.json() : null; })
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
})();
