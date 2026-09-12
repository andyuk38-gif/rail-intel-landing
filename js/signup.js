/* Self-serve CMS signup — posts to Rail Intel CMS public API */
(function () {
  "use strict";

  var meta = document.querySelector('meta[name="cms-api"]');
  var apiBase = (meta && meta.getAttribute("content")) || "https://cms.railintel.co.uk/api";
  var form = document.querySelector("[data-cms-signup-form]");
  if (!form) return;

  var moduleList = document.querySelector("[data-signup-modules]");
  var message = form.querySelector("[data-signup-message]");
  var submitBtn = form.querySelector('button[type="submit"]');

  function showMessage(text, state) {
    if (!message) return;
    message.textContent = text;
    message.hidden = false;
    message.dataset.state = state || "info";
  }

  function renderModules(modules) {
    if (!moduleList || !modules || !modules.length) return;
    moduleList.innerHTML = modules
      .map(function (mod) {
        return (
          '<label class="signup-module">' +
          '<input type="checkbox" name="addon" value="' +
          mod.id +
          '" />' +
          "<span><strong>" +
          mod.name +
          "</strong><span>" +
          mod.shortDescription +
          "</span></span>" +
          "</label>"
        );
      })
      .join("");
  }

  fetch(apiBase.replace(/\/$/, "") + "/public/onboarding-addons")
    .then(function (res) {
      return res.ok ? res.json() : null;
    })
    .then(function (data) {
      if (data && data.modules) renderModules(data.modules);
    })
    .catch(function () {});

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (submitBtn) submitBtn.disabled = true;
    if (message) message.hidden = true;

    var fd = new FormData(form);
    var addons = [];
    form.querySelectorAll('input[name="addon"]:checked').forEach(function (el) {
      addons.push(el.value);
    });

    var payload = {
      companyName: fd.get("companyName"),
      companyAddress: fd.get("companyAddress"),
      contactName: fd.get("contactName"),
      contactEmail: fd.get("contactEmail"),
      contactPhone: fd.get("contactPhone"),
      procurementReference: fd.get("procurementReference"),
      notes: fd.get("notes"),
      requestedAddons: addons,
      source: "railintel.co.uk",
      website: fd.get("website") || "",
    };

    fetch(apiBase.replace(/\/$/, "") + "/public/signup-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(function (res) {
        return res.json().then(function (data) {
          if (!res.ok) throw new Error(data.error || "Application failed");
          return data;
        });
      })
      .then(function (data) {
        form.reset();
        showMessage(data.message || "Thank you — your application has been received.", "success");
      })
      .catch(function (err) {
        showMessage(err.message || "Something went wrong. Please try again.", "error");
      })
      .finally(function () {
        if (submitBtn) submitBtn.disabled = false;
      });
  });
})();
