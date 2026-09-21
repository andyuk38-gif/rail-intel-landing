/* Communications Hub — animated category carousel with dual email previews */

(function () {
  "use strict";

  var root = document.querySelector("[data-comm-hub]");
  if (!root) return;

  var consoleEl = root.querySelector(".comm-hub-console");
  var items = Array.prototype.slice.call(root.querySelectorAll("[data-comm-template]"));
  var templates = Array.prototype.slice.call(document.querySelectorAll("[data-comm-email]"));
  var filters = Array.prototype.slice.call(root.querySelectorAll("[data-comm-filter]"));
  var jumpButtons = Array.prototype.slice.call(document.querySelectorAll("[data-comm-jump]"));
  var duo = root.querySelector("[data-comm-duo]");
  var panes = [
    {
      frame: root.querySelector('[data-comm-frame="primary"]'),
      stage: root.querySelector('[data-comm-stage="primary"]'),
      titleEl: root.querySelector('[data-comm-pane-title="primary"]'),
    },
    {
      frame: root.querySelector('[data-comm-frame="secondary"]'),
      stage: root.querySelector('[data-comm-stage="secondary"]'),
      titleEl: root.querySelector('[data-comm-pane-title="secondary"]'),
    },
  ];
  var titleEl = root.querySelector("[data-comm-title]");
  var subjectEl = root.querySelector("[data-comm-subject]");
  var tagEl = root.querySelector("[data-comm-tag]");
  var statusEl = root.querySelector("[data-comm-status]");
  var progressEl = root.querySelector("[data-comm-progress]");
  var progressWrap = progressEl ? progressEl.parentElement : null;
  var prevBtn = root.querySelector("[data-comm-prev]");
  var nextBtn = root.querySelector("[data-comm-next]");
  var playBtn = root.querySelector("[data-comm-play]");
  var playLabel = root.querySelector(".comm-hub-console__play-label");
  var rail = root.querySelector("[data-comm-rail]");

  var CATEGORY_ORDER = ["instant", "scheduled", "account", "all"];
  var CATEGORY_LABELS = {
    instant: "Instant alerts",
    scheduled: "Scheduled alerts",
    account: "Account & access",
    all: "All templates",
  };

  var activeFilter = "instant";
  var visibleItems = [];
  var currentIndex = 0;
  var timer = null;
  var rotating = true;
  var ROTATE_MS = 5500;
  var changing = false;
  var hasLoadedPreview = false;
  var currentTemplateKey = null;
  var SLIDE_MS = 420;
  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  root.style.setProperty("--comm-rotate-ms", ROTATE_MS + "ms");

  function templateNode(key) {
    return templates.find(function (el) {
      return el.getAttribute("data-comm-email") === key;
    });
  }

  function templateHtml(key) {
    var node = templateNode(key);
    return node ? node.innerHTML : "";
  }

  function templateSubject(key) {
    var node = templateNode(key);
    return node ? node.getAttribute("data-comm-subject") || "" : "";
  }

  function templateLabel(btn) {
    if (btn.getAttribute("data-comm-label")) return btn.getAttribute("data-comm-label");
    var label = btn.querySelector(".comm-hub-rail__chip-label");
    return label ? label.textContent : "";
  }

  function wrapIndex(index) {
    var len = visibleItems.length;
    if (!len) return 0;
    index = index % len;
    if (index < 0) index += len;
    return index;
  }

  function isHubInView() {
    var rect = root.getBoundingClientRect();
    return rect.bottom > 0 && rect.top < window.innerHeight;
  }

  function scrollChipIntoRail(btn) {
    if (!btn || !rail || typeof rail.scrollTo !== "function") return;

    var maxScroll = rail.scrollWidth - rail.clientWidth;
    if (maxScroll <= 0) return;

    var btnLeft = btn.offsetLeft;
    var btnRight = btnLeft + btn.offsetWidth;
    var viewLeft = rail.scrollLeft;
    var viewRight = viewLeft + rail.clientWidth;

    if (btnLeft >= viewLeft && btnRight <= viewRight) return;

    var target = btnLeft - (rail.clientWidth - btn.offsetWidth) / 2;
    target = Math.max(0, Math.min(target, maxScroll));

    rail.scrollTo({
      left: target,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }

  function updateFrameOverflow(frameEl, stageEl) {
    if (!frameEl || !stageEl) return;

    var doc = frameEl.contentDocument;
    var win = frameEl.contentWindow;
    if (!doc || !doc.documentElement || !win) {
      stageEl.classList.remove("is-overflowing");
      return;
    }

    var body = doc.body;
    var contentHeight = Math.max(
      doc.documentElement.scrollHeight,
      body ? body.scrollHeight : 0
    );
    var viewHeight = frameEl.clientHeight;
    var overflowing = contentHeight > viewHeight + 8;
    var scrolled = win.scrollY > 12;

    stageEl.classList.toggle("is-overflowing", overflowing && !scrolled);
  }

  function updateAllFrameOverflow() {
    panes.forEach(function (pane) {
      if (pane.frame && pane.stage && pane.frame.offsetParent) {
        updateFrameOverflow(pane.frame, pane.stage);
      }
    });
  }

  function watchFrameScroll(frameEl, stageEl) {
    var win = frameEl.contentWindow;
    if (!win) return;

    try {
      win.scrollTo(0, 0);
    } catch (err) {
      /* ignore */
    }

    win.addEventListener(
      "scroll",
      function () {
        updateFrameOverflow(frameEl, stageEl);
      },
      { passive: true }
    );
  }

  function resetTiming() {
    filters.forEach(function (btn) {
      btn.classList.remove("is-timing");
    });
    if (progressWrap) progressWrap.classList.remove("is-timing");
    if (progressEl) progressEl.style.animation = "none";

    requestAnimationFrame(function () {
      if (progressEl) progressEl.style.animation = "";
      filters.forEach(function (btn) {
        if (btn.classList.contains("is-active") && rotating) {
          btn.classList.add("is-timing");
        }
      });
      if (progressWrap && rotating) {
        progressWrap.classList.add("is-timing");
      }
    });
  }

  function clearHandoffClasses() {
    if (!duo) return;
    duo.classList.remove(
      "is-handoff-next",
      "is-handoff-prev-exit",
      "is-handoff-prev-enter",
      "is-handoff-prev-active",
      "is-swap-enter",
      "is-swap-from-left",
      "is-swap-active"
    );
  }

  function clearSlideClasses() {
    clearHandoffClasses();
  }

  function waitPaneTransition(callback) {
    var primaryPane = duo ? duo.querySelector(".comm-hub-mail__pane--primary") : null;
    var secondaryPane = duo ? duo.querySelector(".comm-hub-mail__pane--secondary") : null;
    var target = secondaryPane && duo.classList.contains("is-handoff-next") ? secondaryPane : primaryPane;
    if (!target) {
      callback();
      return;
    }

    var finished = false;
    function complete() {
      if (finished) return;
      finished = true;
      target.removeEventListener("transitionend", onEnd);
      callback();
    }

    function onEnd(event) {
      if (event.target !== target || event.propertyName !== "transform") return;
      complete();
    }

    target.addEventListener("transitionend", onEnd);
    window.setTimeout(complete, SLIDE_MS + 80);
  }

  function canPromoteNext(previousIndex, index) {
    if (visibleItems.length < 2) return false;
    if (!window.matchMedia("(min-width: 961px)").matches) return false;
    return index === wrapIndex(previousIndex + 1);
  }

  function loadFrameContent(frameEl, stageEl, html, done) {
    if (!frameEl) {
      if (done) done();
      return;
    }

    var finished = false;
    function complete() {
      if (finished) return;
      finished = true;
      if (stageEl) stageEl.classList.remove("is-overflowing");
      if (done) done();
    }

    var doc = frameEl.contentDocument;
    if (doc) {
      doc.open();
      doc.write(html || "<p style='font-family:system-ui;padding:24px;color:#64748b'>Preview unavailable.</p>");
      doc.close();
    }

    frameEl.onload = function () {
      watchFrameScroll(frameEl, stageEl);
      window.setTimeout(function () {
        updateFrameOverflow(frameEl, stageEl);
        window.setTimeout(function () {
          updateFrameOverflow(frameEl, stageEl);
        }, 180);
        complete();
      }, 40);
    };

    window.setTimeout(complete, 700);
  }

  function loadPreviewPair(primaryKey, secondaryKey, done) {
    var pending = 0;
    var expected = secondaryKey ? 2 : 1;

    function oneDone() {
      pending += 1;
      if (pending >= expected) {
        updateAllFrameOverflow();
        window.setTimeout(updateAllFrameOverflow, 180);
        if (done) done();
      }
    }

    loadFrameContent(panes[0].frame, panes[0].stage, templateHtml(primaryKey), oneDone);

    if (secondaryKey) {
      loadFrameContent(panes[1].frame, panes[1].stage, templateHtml(secondaryKey), oneDone);
    }
  }

  function finishFrameChange(done) {
    if (consoleEl) consoleEl.classList.remove("is-changing");
    hasLoadedPreview = true;
    if (done) done();
  }

  function animatePromoteNext(primaryKey, secondaryKey, done) {
    if (consoleEl) consoleEl.classList.add("is-changing");
    clearHandoffClasses();
    duo.classList.add("is-handoff-next");

    waitPaneTransition(function () {
      clearHandoffClasses();
      loadFrameContent(panes[0].frame, panes[0].stage, templateHtml(primaryKey), function () {
        loadFrameContent(panes[1].frame, panes[1].stage, templateHtml(secondaryKey), function () {
          updateAllFrameOverflow();
          finishFrameChange(done);
        });
      });
    });
  }

  function animateInsertPrevious(primaryKey, secondaryKey, done) {
    if (consoleEl) consoleEl.classList.add("is-changing");
    clearHandoffClasses();
    duo.classList.add("is-handoff-prev-exit");

    waitPaneTransition(function () {
      duo.classList.remove("is-handoff-prev-exit");
      loadPreviewPair(primaryKey, secondaryKey, function () {
        duo.classList.add("is-handoff-prev-enter");
        void duo.offsetWidth;
        duo.classList.remove("is-handoff-prev-enter");
        duo.classList.add("is-handoff-prev-active");

        waitPaneTransition(function () {
          clearHandoffClasses();
          finishFrameChange(done);
        });
      });
    });
  }

  function animatePrimarySwap(primaryKey, secondaryKey, direction, done) {
    if (consoleEl) consoleEl.classList.add("is-changing");
    clearHandoffClasses();

    loadPreviewPair(primaryKey, secondaryKey, function () {
      duo.classList.add("is-swap-enter");
      if (direction < 0) duo.classList.add("is-swap-from-left");
      void duo.offsetWidth;
      duo.classList.remove("is-swap-enter", "is-swap-from-left");
      duo.classList.add("is-swap-active");

      waitPaneTransition(function () {
        clearHandoffClasses();
        finishFrameChange(done);
      });
    });
  }

  function writePreviewPair(primaryKey, secondaryKey, options, done) {
    if (typeof options === "function") {
      done = options;
      options = {};
    }
    options = options || {};

    if (!panes[0].frame) {
      if (done) done();
      return;
    }

    var direction = options.direction || 1;
    var animate = options.animate !== false && hasLoadedPreview && !prefersReducedMotion && duo;

    if (!animate) {
      if (consoleEl) consoleEl.classList.add("is-changing");
      clearHandoffClasses();
      loadPreviewPair(primaryKey, secondaryKey, function () {
        finishFrameChange(done);
      });
      return;
    }

    if (direction > 0 && canPromoteNext(options.previousIndex, options.index)) {
      animatePromoteNext(primaryKey, secondaryKey, done);
      return;
    }

    if (direction < 0) {
      animateInsertPrevious(primaryKey, secondaryKey, done);
      return;
    }

    animatePrimarySwap(primaryKey, secondaryKey, direction, done);
  }

  function updateMeta(primaryBtn, primaryKey) {
    var category = primaryBtn.getAttribute("data-comm-category") || activeFilter;

    if (titleEl) titleEl.textContent = templateLabel(primaryBtn);
    if (subjectEl) subjectEl.textContent = templateSubject(primaryKey);

    if (tagEl) {
      tagEl.textContent = CATEGORY_LABELS[category] || category;
      tagEl.className = "comm-hub-console__tag comm-hub-console__tag--" + category;
    }

    if (statusEl) {
      var overall = items.findIndex(function (item) {
        return item.getAttribute("data-comm-template") === primaryKey;
      });
      statusEl.textContent = (overall + 1) + " / " + items.length;
    }
  }

  function updatePaneLabels(primaryBtn, secondaryBtn) {
    if (panes[0].titleEl && primaryBtn) {
      panes[0].titleEl.textContent = templateLabel(primaryBtn);
    }
    if (panes[1].titleEl) {
      panes[1].titleEl.textContent = secondaryBtn ? templateLabel(secondaryBtn) : "";
    }
  }

  function syncDuoLayout() {
    if (!duo) return;
    duo.classList.toggle("is-single", visibleItems.length < 2);
  }

  function setActiveItem(index, direction) {
    if (!visibleItems.length || changing) return;

    var previousIndex = currentIndex;

    index = wrapIndex(index);

    var primaryBtn = visibleItems[index];
    var primaryKey = primaryBtn.getAttribute("data-comm-template");
    var secondaryBtn = visibleItems.length > 1 ? visibleItems[wrapIndex(index + 1)] : null;
    var secondaryKey = secondaryBtn ? secondaryBtn.getAttribute("data-comm-template") : null;

    if (hasLoadedPreview && primaryKey === currentTemplateKey) return;

    var slideDirection = direction;
    if (slideDirection == null) {
      if (index === 0 && previousIndex === visibleItems.length - 1) slideDirection = 1;
      else if (index === visibleItems.length - 1 && previousIndex === 0) slideDirection = -1;
      else slideDirection = index >= previousIndex ? 1 : -1;
    }

    currentIndex = index;
    syncDuoLayout();

    visibleItems.forEach(function (btn, i) {
      var active = i === currentIndex;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });

    updateMeta(primaryBtn, primaryKey);
    updatePaneLabels(primaryBtn, secondaryBtn);
    currentTemplateKey = primaryKey;

    changing = true;
    writePreviewPair(
      primaryKey,
      secondaryKey,
      { direction: slideDirection, previousIndex: previousIndex, index: index },
      function () {
        changing = false;
        resetTiming();
      }
    );

    if (primaryBtn && isHubInView()) {
      scrollChipIntoRail(primaryBtn);
    }
  }

  function applyFilter(filter, keepIndex) {
    activeFilter = filter;

    filters.forEach(function (btn) {
      var active = btn.getAttribute("data-comm-filter") === filter;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
      btn.classList.remove("is-timing");
    });

    items.forEach(function (btn) {
      var category = btn.getAttribute("data-comm-category");
      var show = filter === "all" || category === filter;
      btn.classList.toggle("is-hidden", !show);
    });

    visibleItems = items.filter(function (btn) {
      return !btn.classList.contains("is-hidden");
    });

    if (!visibleItems.length) return;

    syncDuoLayout();

    if (tagEl) {
      tagEl.textContent = CATEGORY_LABELS[filter] || filter;
      tagEl.className = "comm-hub-console__tag comm-hub-console__tag--" + filter;
    }

    changing = false;
    clearSlideClasses();

    if (rail && !keepIndex && typeof rail.scrollTo === "function") {
      rail.scrollTo({ left: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    }

    if (keepIndex && currentIndex < visibleItems.length) {
      setActiveItem(currentIndex);
    } else {
      setActiveItem(0, 1);
    }
  }

  function nextCategory() {
    var idx = CATEGORY_ORDER.indexOf(activeFilter);
    var next = idx < 0 || idx >= CATEGORY_ORDER.length - 1 ? CATEGORY_ORDER[0] : CATEGORY_ORDER[idx + 1];
    applyFilter(next, false);
  }

  function advance() {
    if (!visibleItems.length) return;

    if (currentIndex >= visibleItems.length - 1) {
      if (rotating) nextCategory();
      else setActiveItem(0, 1);
      return;
    }

    setActiveItem(currentIndex + 1, 1);
  }

  function showByKey(key) {
    applyFilter("all", false);
    var idx = visibleItems.findIndex(function (btn) {
      return btn.getAttribute("data-comm-template") === key;
    });
    if (idx >= 0) setActiveItem(idx, 1);

    var showcase = document.querySelector(".comm-hub-showcase");
    if (showcase && typeof showcase.scrollIntoView === "function") {
      showcase.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function stopRotation() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    filters.forEach(function (btn) {
      btn.classList.remove("is-timing");
    });
    if (progressWrap) progressWrap.classList.remove("is-timing");
  }

  function startRotation() {
    stopRotation();
    if (!rotating || visibleItems.length < 2) {
      resetTiming();
      return;
    }
    resetTiming();
    timer = setInterval(advance, ROTATE_MS);
  }

  function toggleRotation() {
    rotating = !rotating;
    if (playBtn) {
      playBtn.setAttribute("aria-pressed", rotating ? "true" : "false");
      playBtn.setAttribute("aria-label", rotating ? "Pause auto-rotate" : "Play auto-rotate");
    }
    if (playLabel) playLabel.textContent = rotating ? "Pause" : "Play";
    if (rotating) startRotation();
    else stopRotation();
  }

  items.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var idx = visibleItems.indexOf(btn);
      if (idx < 0) return;
      setActiveItem(idx);
      startRotation();
    });
  });

  filters.forEach(function (btn) {
    btn.addEventListener("click", function () {
      applyFilter(btn.getAttribute("data-comm-filter") || "all", false);
      startRotation();
    });
  });

  jumpButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      showByKey(btn.getAttribute("data-comm-jump"));
      startRotation();
    });
  });

  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      setActiveItem(currentIndex - 1, -1);
      startRotation();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      advance();
      startRotation();
    });
  }

  if (playBtn) {
    playBtn.addEventListener("click", toggleRotation);
  }

  root.addEventListener("mouseenter", stopRotation);
  root.addEventListener("mouseleave", startRotation);
  root.addEventListener("focusin", stopRotation);
  root.addEventListener("focusout", startRotation);

  applyFilter("instant", false);
  startRotation();
})();
