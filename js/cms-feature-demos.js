/* CMS feature demos — Live cycles, Assessing, Standards */

(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function initDemo(root) {
    if (!root) return;

    var tabs = Array.prototype.slice.call(root.querySelectorAll("[data-cms-tab]"));
    var panels = Array.prototype.slice.call(root.querySelectorAll("[data-cms-panel]"));
    var subtitle = root.querySelector("[data-cms-subtitle]");
    var labels = (root.getAttribute("data-cms-labels") || "").split("|");
    var state = { step: 0, held: false, timer: null };

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
      if (reduced || state.held || panels.length < 2) return;
      state.timer = window.setTimeout(function () {
        if (state.held) return;
        setStep(state.step === panels.length - 1 ? 0 : state.step + 1);
      }, 4200);
    }

    function hold(on) {
      state.held = on;
      if (on) stop();
      else schedule();
    }

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        hold(true);
        setStep(Number(tab.getAttribute("data-cms-tab")) || 0);
      });
    });

    var stage = root.querySelector(".cms-demo__stage");
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

    // Assessing: flag tiles
    root.querySelectorAll("[data-cms-tile]").forEach(function (tile) {
      tile.addEventListener("click", function () {
        hold(true);
        tile.classList.toggle("is-flagged");
        var flagged = root.querySelectorAll("[data-cms-tile].is-flagged").length;
        var btn = root.querySelector("[data-cms-flagged-count]");
        if (btn) btn.textContent = "Flagged (" + flagged + ")";
        var fill = root.querySelector("[data-cms-assess-fill]");
        if (fill) {
          var assessed = Number(fill.getAttribute("data-base") || "19");
          fill.style.width = Math.min(100, (assessed / 495) * 100 + flagged * 0.4) + "%";
        }
      });
    });

    // Grades toggle
    root.querySelectorAll("[data-cms-grade]").forEach(function (grade) {
      grade.addEventListener("click", function () {
        hold(true);
        grade.classList.toggle("is-on");
        grade.setAttribute("aria-pressed", grade.classList.contains("is-on") ? "true" : "false");
        var count = root.querySelectorAll("[data-cms-grade].is-on").length;
        var label = root.querySelector("[data-cms-grade-count]");
        if (label) label.textContent = count + " grades selected";
      });
    });

    // Assign / save micro feedback
    root.querySelectorAll("[data-cms-flash]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        hold(true);
        var original = btn.getAttribute("data-cms-flash") || btn.textContent;
        var done = btn.getAttribute("data-cms-done") || "Saved";
        btn.textContent = done;
        window.setTimeout(function () {
          btn.textContent = original;
        }, 1400);
      });
    });

    // Cab pass colour picker
    root.querySelectorAll("[data-cms-cab-colour]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        hold(true);
        root.querySelectorAll("[data-cms-cab-colour]").forEach(function (other) {
          other.classList.toggle("is-selected", other === btn);
        });
      });
    });

    // Safety got-it
    var safetyBtn = root.querySelector("[data-cms-safety-ack]");
    if (safetyBtn) {
      safetyBtn.addEventListener("click", function () {
        hold(true);
        safetyBtn.textContent = "Flags ready";
        window.setTimeout(function () {
          safetyBtn.textContent = "Got it — use flags";
        }, 1600);
      });
    }

    panels.forEach(function (panel, i) {
      panel.hidden = i !== 0;
    });
    setStep(0);

    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) schedule();
            else stop();
          });
        },
        { threshold: 0.3 }
      );
      io.observe(root);
    } else {
      schedule();
    }
  }

  document.querySelectorAll("[data-cms-demo]").forEach(initDemo);
})();
