/* Interactive Cycle Builder demo — Competency & Cycles */

(function () {
  "use strict";

  var root = document.querySelector("[data-cycle-builder-demo]");
  if (!root) return;

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var steps = Array.prototype.slice.call(root.querySelectorAll("[data-cb-step]"));
  var panels = Array.prototype.slice.call(root.querySelectorAll("[data-cb-panel]"));
  var tabs = Array.prototype.slice.call(root.querySelectorAll("[data-cb-tab]"));
  var progress = root.querySelector("[data-cb-progress]");
  var subtitle = root.querySelector("[data-cb-subtitle]");
  var existing = root.querySelector("[data-cb-existing]");
  var choiceBtns = Array.prototype.slice.call(root.querySelectorAll("[data-cb-choice]"));
  var continueBtns = Array.prototype.slice.call(root.querySelectorAll("[data-cb-continue]"));
  var backBtns = Array.prototype.slice.call(root.querySelectorAll("[data-cb-back]"));
  var footerMsgs = Array.prototype.slice.call(root.querySelectorAll("[data-cb-msg]"));
  var titleInput = root.querySelector("[data-cb-title]");
  var durationInput = root.querySelector("[data-cb-duration]");
  var unitSelect = root.querySelector("[data-cb-unit]");
  var durationHint = root.querySelector("[data-cb-duration-hint]");
  var useTemplateBtn = root.querySelector("[data-cb-use-template]");
  var demoList = root.querySelector("[data-cb-demo-list]");
  var explainList = root.querySelector("[data-cb-explain-list]");
  var demoCount = root.querySelector("[data-cb-demo-count]");
  var explainCount = root.querySelector("[data-cb-explain-count]");
  var criteriaPill = root.querySelector("[data-cb-criteria-pill]");
  var demoDrop = root.querySelector("[data-cb-drop='demo']");
  var explainDrop = root.querySelector("[data-cb-drop='explain']");
  var eventTitle = root.querySelector("[data-cb-event-title]");
  var eventStart = root.querySelector("[data-cb-event-start]");
  var eventEnd = root.querySelector("[data-cb-event-end]");
  var eventWarn = root.querySelector("[data-cb-event-warn]");
  var eventCard = root.querySelector("[data-cb-event]");
  var timelineFill = root.querySelector("[data-cb-timeline-fill]");
  var addEventBtn = root.querySelector("[data-cb-add-event]");
  var saveBtn = root.querySelector("[data-cb-save]");

  var stepMeta = [
    { label: "Step 1 of 4 — choose template or custom.", msg: "Choose template or custom to continue.", ok: "Method selected — continue when ready." },
    { label: "Step 2 of 4 — name the cycle.", msg: "Enter a title to continue.", ok: "Cycle details look good." },
    { label: "Step 3 of 4 — add competency criteria.", msg: "Add at least one criterion, or use a fixed template.", ok: "Criteria attached — continue to events." },
    { label: "Step 4 of 4 — schedule assessment events.", msg: "Add a titled event to save the cycle.", ok: "Ready to save this cycle." }
  ];

  var state = {
    step: 0,
    method: "",
    criteriaReady: false,
    playing: false,
    held: false,
    typed: false
  };

  var autoTimer = null;
  var typeTimer = null;
  var criteriaTimers = [];

  function setStep(index, opts) {
    opts = opts || {};
    var next = Math.max(0, Math.min(3, index));
    var prev = state.step;
    state.step = next;

    steps.forEach(function (el, i) {
      el.classList.toggle("is-active", i === next);
      el.classList.toggle("is-done", i < next);
      el.setAttribute("aria-current", i === next ? "step" : "false");
    });

    tabs.forEach(function (el, i) {
      el.classList.toggle("is-active", i === next);
      el.setAttribute("aria-pressed", i === next ? "true" : "false");
    });

    panels.forEach(function (panel, i) {
      var on = i === next;
      panel.classList.toggle("is-active", on);
      if (on) {
        panel.hidden = false;
        panel.removeAttribute("hidden");
      } else {
        panel.hidden = true;
      }
      panel.setAttribute("aria-hidden", on ? "false" : "true");
    });

    if (progress) progress.style.width = ((next + 1) / 4) * 100 + "%";
    if (subtitle) subtitle.textContent = stepMeta[next].label;

    updateFooter();

    if (next === 1 && !state.typed && !opts.skipType) {
      runTypewriter();
    }
    if (next === 2 && !state.criteriaReady && !opts.skipCriteria) {
      window.setTimeout(function () {
        if (state.step === 2 && !state.criteriaReady) {
          fillCriteria(true);
        }
      }, reduced ? 0 : 700);
    }
    if (next === 3) {
      syncEvent();
    }

    if (!opts.silent && prev !== next) {
      // Restart autoplay pacing from this step.
      scheduleAuto();
    }
  }

  function updateFooter() {
    var meta = stepMeta[state.step];
    var ready = canContinue(state.step);

    footerMsgs.forEach(function (msg) {
      var panelStep = Number(msg.getAttribute("data-cb-msg"));
      if (panelStep !== state.step) return;
      msg.textContent = ready ? meta.ok : meta.msg;
      msg.classList.toggle("is-ok", ready);
    });

    continueBtns.forEach(function (btn) {
      var panelStep = Number(btn.getAttribute("data-cb-continue"));
      if (panelStep !== state.step) return;
      btn.disabled = !ready;
    });

    if (saveBtn) saveBtn.disabled = !canContinue(3);
  }

  function canContinue(step) {
    if (step === 0) return Boolean(state.method);
    if (step === 1) {
      var title = titleInput ? titleInput.value.trim() : "";
      var duration = durationInput ? Number(durationInput.value) : 0;
      return title.length > 0 && duration > 0;
    }
    if (step === 2) return state.criteriaReady;
    if (step === 3) {
      return Boolean(eventTitle && eventTitle.value.trim());
    }
    return false;
  }

  function selectMethod(kind) {
    state.method = kind;
    choiceBtns.forEach(function (btn) {
      var on = btn.getAttribute("data-cb-choice") === kind;
      btn.classList.toggle("is-selected", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
    updateFooter();
  }

  function monthsForUnit(value, unit) {
    var n = Number(value) || 0;
    if (unit === "Years") return n * 12;
    if (unit === "Weeks") return Math.max(1, Math.round(n / 4.345));
    return n;
  }

  function updateDurationHint() {
    if (!durationHint || !durationInput || !unitSelect) return;
    var months = monthsForUnit(durationInput.value, unitSelect.value);
    durationHint.textContent = "Total duration: " + months + " months";
    durationHint.classList.remove("is-pulse");
    // Retrigger animation.
    void durationHint.offsetWidth;
    durationHint.classList.add("is-pulse");
  }

  function runTypewriter() {
    if (!titleInput) return;
    state.typed = true;
    var full = "ML Driver v3 (2yr)";
    var i = 0;
    titleInput.value = "";
    titleInput.classList.add("is-typing");

    if (typeTimer) window.clearInterval(typeTimer);
    if (reduced) {
      titleInput.value = full;
      titleInput.classList.remove("is-typing");
      updateFooter();
      return;
    }

    typeTimer = window.setInterval(function () {
      i += 1;
      titleInput.value = full.slice(0, i);
      updateFooter();
      if (i >= full.length) {
        window.clearInterval(typeTimer);
        typeTimer = null;
        titleInput.classList.remove("is-typing");
      }
    }, 42);
  }

  function clearCriteriaTimers() {
    criteriaTimers.forEach(function (id) {
      window.clearTimeout(id);
    });
    criteriaTimers = [];
  }

  function chipHtml(label, tone) {
    return (
      '<div class="cb-chip" style="color:' +
      (tone === "explain" ? "#fdba74" : "#6ee7b7") +
      '">' +
      '<span class="cb-chip__dot" aria-hidden="true"></span>' +
      "<span>" +
      label +
      "</span></div>"
    );
  }

  function fillCriteria(animated) {
    if (!demoList || !explainList) return;
    clearCriteriaTimers();
    state.criteriaReady = false;
    demoList.innerHTML = '<p class="cb-drop__empty">Drop criteria here.</p>';
    explainList.innerHTML = '<p class="cb-drop__empty">Drop criteria here.</p>';
    if (demoCount) demoCount.textContent = "0";
    if (explainCount) explainCount.textContent = "0";
    if (criteriaPill) criteriaPill.textContent = "0 complete";
    if (useTemplateBtn) useTemplateBtn.disabled = true;
    updateFooter();

    var demoItems = [
      "Preparation & cab secure",
      "Route knowledge check",
      "Signal sighting & SPADs"
    ];
    var explainItems = [
      "Rule book module 1",
      "Traction fault response"
    ];

    function place(list, emptySelector, items, tone, drop, countEl, done) {
      list.innerHTML = "";
      items.forEach(function (label, idx) {
        var delay = animated && !reduced ? 180 + idx * 220 : 0;
        var timer = window.setTimeout(function () {
          if (drop) {
            drop.classList.add("is-hot");
            window.setTimeout(function () {
              drop.classList.remove("is-hot");
            }, 450);
          }
          list.insertAdjacentHTML("beforeend", chipHtml(label, tone));
          if (countEl) countEl.textContent = String(idx + 1);
          if (criteriaPill) {
            var total =
              demoList.querySelectorAll(".cb-chip").length +
              explainList.querySelectorAll(".cb-chip").length;
            criteriaPill.textContent = total + " complete";
          }
          if (done && idx === items.length - 1) done();
        }, delay);
        criteriaTimers.push(timer);
      });
    }

    place(demoList, ".cb-drop__empty", demoItems, "demo", demoDrop, demoCount, null);
    place(explainList, ".cb-drop__empty", explainItems, "explain", explainDrop, explainCount, function () {
      state.criteriaReady = true;
      if (useTemplateBtn) {
        useTemplateBtn.disabled = false;
        useTemplateBtn.textContent = "Template applied";
      }
      updateFooter();
    });

    if (!animated || reduced) {
      state.criteriaReady = true;
      if (useTemplateBtn) {
        useTemplateBtn.disabled = false;
        useTemplateBtn.textContent = "Template applied";
      }
      updateFooter();
    }
  }

  function syncEvent() {
    if (!eventCard || !eventTitle || !eventWarn || !timelineFill || !eventStart || !eventEnd) return;
    var titled = eventTitle.value.trim().length > 0;
    eventCard.classList.toggle("is-invalid", !titled);
    eventCard.classList.toggle("is-filled", titled);
    eventWarn.textContent = titled ? "" : "Title is required";

    var start = Number(eventStart.value) || 1;
    var end = Number(eventEnd.value) || start;
    if (end < start) end = start;
    var left = ((start - 1) / 24) * 100;
    var width = ((end - start + 1) / 24) * 100;
    timelineFill.style.left = left + "%";
    timelineFill.style.width = Math.max(width, 4) + "%";
    updateFooter();
  }

  function hold(on) {
    state.held = on;
    if (on) {
      stopAuto();
    } else {
      scheduleAuto();
    }
  }

  function stopAuto() {
    state.playing = false;
    if (autoTimer) {
      window.clearTimeout(autoTimer);
      autoTimer = null;
    }
  }

  function scheduleAuto() {
    stopAuto();
    if (reduced || state.held) return;
    state.playing = true;
    var dwell = [3200, 3600, 4200, 4800][state.step] || 3600;
    autoTimer = window.setTimeout(function () {
      if (state.held) return;
      // Advance story: ensure prerequisites as we auto-play.
      if (state.step === 0 && !state.method) selectMethod("template");
      if (state.step === 1 && titleInput && !titleInput.value.trim()) runTypewriter();
      if (state.step === 2 && !state.criteriaReady) fillCriteria(true);
      if (state.step === 3 && eventTitle && !eventTitle.value.trim()) {
        eventTitle.value = "Practical Ride Assessment";
        syncEvent();
      }

      var next = state.step === 3 ? 0 : state.step + 1;
      if (next === 0) {
        // Soft reset for loop readability.
        state.typed = false;
        state.criteriaReady = false;
        if (useTemplateBtn) useTemplateBtn.textContent = "Use this template";
        if (eventTitle) eventTitle.value = "";
        syncEvent();
      }
      setStep(next, { silent: true });
      scheduleAuto();
    }, dwell);
  }

  // Events
  steps.forEach(function (btn) {
    btn.addEventListener("click", function () {
      hold(true);
      setStep(Number(btn.getAttribute("data-cb-step")));
    });
  });

  tabs.forEach(function (btn) {
    btn.addEventListener("click", function () {
      hold(true);
      setStep(Number(btn.getAttribute("data-cb-tab")));
    });
  });

  choiceBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      hold(true);
      selectMethod(btn.getAttribute("data-cb-choice"));
    });
  });

  continueBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      hold(true);
      if (!canContinue(state.step)) return;
      setStep(state.step + 1);
    });
  });

  backBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      hold(true);
      setStep(state.step - 1);
    });
  });

  if (existing) {
    var existingBtn = existing.querySelector("[data-cb-existing-toggle]");
    if (existingBtn) {
      existingBtn.addEventListener("click", function () {
        hold(true);
        existing.classList.toggle("is-open");
        existingBtn.setAttribute(
          "aria-expanded",
          existing.classList.contains("is-open") ? "true" : "false"
        );
      });
    }
  }

  if (titleInput) {
    titleInput.addEventListener("input", function () {
      hold(true);
      titleInput.classList.remove("is-typing");
      if (typeTimer) {
        window.clearInterval(typeTimer);
        typeTimer = null;
      }
      updateFooter();
    });
  }
  if (durationInput) {
    durationInput.addEventListener("input", function () {
      hold(true);
      updateDurationHint();
      updateFooter();
    });
  }
  if (unitSelect) {
    unitSelect.addEventListener("change", function () {
      hold(true);
      updateDurationHint();
      updateFooter();
    });
  }

  if (useTemplateBtn) {
    useTemplateBtn.addEventListener("click", function () {
      hold(true);
      fillCriteria(true);
    });
  }

  if (eventTitle) {
    eventTitle.addEventListener("input", function () {
      hold(true);
      syncEvent();
    });
  }
  if (eventStart) {
    eventStart.addEventListener("change", function () {
      hold(true);
      syncEvent();
    });
  }
  if (eventEnd) {
    eventEnd.addEventListener("change", function () {
      hold(true);
      syncEvent();
    });
  }

  if (addEventBtn) {
    addEventBtn.addEventListener("click", function () {
      hold(true);
      if (eventTitle && !eventTitle.value.trim()) {
        eventTitle.value = "Practical Ride Assessment";
      }
      if (eventEnd) eventEnd.value = "6";
      syncEvent();
      addEventBtn.textContent = "Event added";
      window.setTimeout(function () {
        addEventBtn.innerHTML =
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg> Add event';
      }, 1400);
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener("click", function () {
      hold(true);
      if (!canContinue(3)) return;
      saveBtn.textContent = "Cycle saved";
      var msg = root.querySelector('[data-cb-msg="3"]');
      if (msg) {
        msg.textContent = "Cycle created successfully.";
        msg.classList.add("is-ok");
      }
      window.setTimeout(function () {
        saveBtn.textContent = "Save cycle";
      }, 1800);
    });
  }

  var stage = root.querySelector(".cb-demo__stage");
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

  // Boot
  panels.forEach(function (panel, i) {
    panel.hidden = i !== 0;
  });
  updateDurationHint();
  setStep(0, { silent: true, skipType: true, skipCriteria: true });

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            scheduleAuto();
          } else {
            stopAuto();
          }
        });
      },
      { threshold: 0.35 }
    );
    io.observe(root);
  } else {
    scheduleAuto();
  }
})();
