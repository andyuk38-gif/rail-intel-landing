/* Incidents & Monitoring interactive demos */

(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function initDemo(root) {
    if (!root) return;

    var tabs = Array.prototype.slice.call(root.querySelectorAll("[data-im-tab]"));
    var panels = Array.prototype.slice.call(root.querySelectorAll("[data-im-panel]"));
    var subtitle = root.querySelector("[data-im-subtitle]");
    var labels = (root.getAttribute("data-im-labels") || "").split("|");
    var state = { step: 0 };

    function setStep(index) {
      var next = Math.max(0, Math.min(panels.length - 1, index));
      var scrollY = window.scrollY || window.pageYOffset || 0;
      state.step = next;

      tabs.forEach(function (tab, i) {
        var on = i === next;
        tab.classList.toggle("is-active", on);
        tab.setAttribute("aria-pressed", on ? "true" : "false");
      });

      panels.forEach(function (panel, i) {
        var on = i === next;
        panel.classList.toggle("is-active", on);
        panel.hidden = !on;
        panel.setAttribute("aria-hidden", on ? "false" : "true");
      });

      if (subtitle && labels[next]) subtitle.textContent = labels[next];

      // Panel height changes must not move the page.
      window.scrollTo(0, scrollY);
      window.requestAnimationFrame(function () {
        window.scrollTo(0, scrollY);
      });
    }

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function (event) {
        event.preventDefault();
        setStep(Number(tab.getAttribute("data-im-tab")) || 0);
      });
    });

    root.querySelectorAll("[data-im-type]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        root.querySelectorAll("[data-im-type]").forEach(function (el) {
          el.classList.toggle("is-on", el === btn);
        });
      });
    });

    root.querySelectorAll("[data-im-sev]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        root.querySelectorAll("[data-im-sev]").forEach(function (el) {
          el.classList.toggle("is-on", el === btn);
        });
      });
    });

    root.querySelectorAll("[data-im-flash]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var original = btn.getAttribute("data-im-flash") || btn.textContent.trim();
        var done = btn.getAttribute("data-im-done") || "Done";
        btn.classList.add("is-flash");
        btn.textContent = done;
        window.setTimeout(function () {
          btn.classList.remove("is-flash");
          btn.textContent = original;
        }, 1200);
      });
    });

    root.querySelectorAll("[data-im-cdp-filter]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        root.querySelectorAll("[data-im-cdp-filter]").forEach(function (el) {
          el.classList.toggle("is-on", el === btn);
        });
        var card = root.querySelector("[data-im-cdp-card]");
        if (!card) return;
        var live = btn.getAttribute("data-im-cdp-filter") === "live";
        card.hidden = !live;
        var empty = root.querySelector("[data-im-cdp-empty]");
        if (live) {
          if (empty) empty.remove();
        } else if (!empty) {
          card.insertAdjacentHTML(
            "afterend",
            '<p class="im-empty" data-im-cdp-empty>No closed plans yet.</p>'
          );
        }
      });
    });

    root.querySelectorAll("[data-im-tick]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var on = btn.getAttribute("aria-pressed") !== "true";
        btn.setAttribute("aria-pressed", on ? "true" : "false");
        btn.classList.toggle("is-on", on);
        var item = btn.closest("[data-im-action-item]");
        if (item) item.classList.toggle("is-done", on);
      });
    });

    var createBtn = root.querySelector("[data-im-create-plan]");
    if (createBtn) {
      createBtn.addEventListener("click", function () {
        var titleInput = root.querySelector("[data-im-plan-title]");
        var title = (titleInput && titleInput.value.trim()) || "Work Attendance";
        var display = root.querySelector("[data-im-plan-display-title]");
        if (display) display.textContent = title;
        createBtn.classList.add("is-flash");
        createBtn.textContent = "Plan created";
        window.setTimeout(function () {
          createBtn.classList.remove("is-flash");
          createBtn.textContent = "Create support plan";
          setStep(1);
        }, 700);
      });
    }

    root.querySelectorAll("[data-im-sign-btn]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var box = btn.closest("[data-im-sign]");
        if (!box) return;
        box.classList.add("is-signed");
        var status = box.querySelector("[data-im-sign-status]");
        if (status) status.textContent = "Signed by Andy Hill · 11 Aug 2026";
        btn.hidden = true;
      });
    });

    var typewriter = root.querySelector("[data-im-typewriter]");
    if (typewriter && !reduced) {
      var sample =
        "Shunting collision in yard during coupling — no injuries, minor buffer damage.";
      var writing = false;
      typewriter.addEventListener("focus", function () {
        if (writing || typewriter.value) return;
        writing = true;
        var i = 0;
        typewriter.value = "";
        var tick = window.setInterval(function () {
          typewriter.value = sample.slice(0, ++i);
          if (i >= sample.length) {
            window.clearInterval(tick);
            writing = false;
          }
        }, 18);
      });
    }

    setStep(0);
  }

  function boot() {
    document.querySelectorAll("[data-im-demo]").forEach(initDemo);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
