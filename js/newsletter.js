/* Public newsletter signup — posts to site-admin API */
(function () {
  "use strict";

  var meta = document.querySelector('meta[name="site-admin-api"]');
  var apiBase = (meta && meta.getAttribute("content")) || "/5473/api";

  var forms = document.querySelectorAll("[data-newsletter-form]");
  forms.forEach(function (form) {
    var input = form.querySelector('input[type="email"]');
    var message = form.querySelector("[data-newsletter-message]");
    var button = form.querySelector('button[type="submit"]');

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!input) return;
      var email = input.value.trim();
      if (!email) return;

      if (button) button.disabled = true;
      if (message) {
        message.textContent = "";
        message.hidden = true;
      }

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
          if (message) {
            message.textContent = data.message || "Thanks — you are subscribed.";
            message.hidden = false;
            message.dataset.state = "success";
          }
          input.value = "";
        })
        .catch(function (err) {
          if (message) {
            message.textContent = err.message || "Something went wrong. Try again later.";
            message.hidden = false;
            message.dataset.state = "error";
          }
        })
        .finally(function () {
          if (button) button.disabled = false;
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
