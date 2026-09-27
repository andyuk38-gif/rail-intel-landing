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
    var state = { step: 0, held: false, stopped: false, timer: null };

    function setStep(index) {
      var next = Math.max(0, Math.min(panels.length - 1, index));
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
      schedule();
    }

    function stop() {
      if (state.timer) {
        window.clearTimeout(state.timer);
        state.timer = null;
      }
    }

    function schedule() {
      stop();
      if (reduced || state.held || state.stopped || panels.length < 2) return;
      state.timer = window.setTimeout(function () {
        if (state.held || state.stopped) return;
        setStep(state.step === panels.length - 1 ? 0 : state.step + 1);
      }, 4400);
    }

    function hold(on) {
      state.held = on;
      if (on) stop();
      else if (!state.stopped) schedule();
    }

    function stopAutoplay() {
      state.stopped = true;
      state.held = true;
      stop();
    }

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        stopAutoplay();
        setStep(Number(tab.getAttribute("data-im-tab")) || 0);
      });
    });

    var stage = root.querySelector(".im-demo__stage");
    if (stage) {
      stage.addEventListener("mouseenter", function () {
        hold(true);
      });
      stage.addEventListener("mouseleave", function () {
        hold(false);
      });
      stage.addEventListener("focusin", function () {
        hold(true);
      });
      stage.addEventListener("focusout", function (event) {
        if (!stage.contains(event.relatedTarget)) hold(false);
      });
    }

    root.querySelectorAll("[data-im-type]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        stopAutoplay();
        root.querySelectorAll("[data-im-type]").forEach(function (el) {
          el.classList.toggle("is-on", el === btn);
        });
      });
    });

    root.querySelectorAll("[data-im-sev]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        stopAutoplay();
        root.querySelectorAll("[data-im-sev]").forEach(function (el) {
          el.classList.toggle("is-on", el === btn);
        });
      });
    });

    root.querySelectorAll("[data-im-flash]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        stopAutoplay();
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
        stopAutoplay();
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
        stopAutoplay();
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
        stopAutoplay();
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
        stopAutoplay();
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
        stopAutoplay();
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
