/* Communications Hub — animated category carousel with dual email previews */

(function () {
  "use strict";

  initTemplateRegistry();

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

  var CATEGORY_ORDER = ["instant", "scheduled", "account"];
  var CATEGORY_LABELS = {
    instant: "Instant alerts",
    scheduled: "Scheduled alerts",
    account: "Account & access",
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
  var HANDOFF_LIFT_MS = 450;
  var HANDOFF_TRAVEL_MS = 720;
  var HANDOFF_SETTLE_MS = 520;
  var SECONDARY_IN_MS = 4500;
  var CATEGORY_SWITCH_OUT_MS = 1100;
  var CATEGORY_SWITCH_IN_MS = 1800;
  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var animationGeneration = 0;
  var pendingTimeouts = [];

  root.style.setProperty("--comm-rotate-ms", ROTATE_MS + "ms");
  root.style.setProperty("--comm-handoff-lift", HANDOFF_LIFT_MS + "ms");
  root.style.setProperty("--comm-handoff-travel", HANDOFF_TRAVEL_MS + "ms");
  root.style.setProperty("--comm-handoff-settle", HANDOFF_SETTLE_MS + "ms");
  root.style.setProperty("--comm-handoff-secondary-in", SECONDARY_IN_MS + "ms");
  root.style.setProperty("--comm-category-switch-out", CATEGORY_SWITCH_OUT_MS + "ms");
  root.style.setProperty("--comm-category-switch-in", CATEGORY_SWITCH_IN_MS + "ms");

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

  var gbrBgUrl = new URL("../images/gbr-bg.png", window.location.href).href;
  var previewFitCss = [
    "html,body{margin:0;padding:0;background:#fff;overflow:hidden;}",
    "body::before{content:'';position:fixed;inset:0;background:url('" + gbrBgUrl + "') center / cover no-repeat;opacity:0.18;pointer-events:none;z-index:0;}",
    "#preview-sheet{position:relative;z-index:1;box-sizing:border-box;padding:16px 18px;background:transparent;transform-origin:top left;}",
    "#preview-sheet p{margin:0 0 8px !important;line-height:1.45 !important;}",
    "#preview-sheet table{margin-bottom:10px !important;}",
    "#preview-sheet img{max-width:100%;height:auto;}",
    "#preview-sheet img[src*='rail-intel-icon']{width:56px !important;height:56px !important;max-width:56px;}",
    "#preview-sheet div[style*='border-radius']{padding:12px 14px !important;margin:6px 0 8px !important;}",
    "#preview-sheet a[style*='inline-block']{padding:8px 14px !important;font-size:14px !important;}",
  ].join("");

  function stripPreviewFooter(doc) {
    if (!doc || !doc.body) return;
    var blocks = doc.body.querySelectorAll("div");
    for (var i = 0; i < blocks.length; i++) {
      var style = blocks[i].getAttribute("style") || "";
      if (style.indexOf("#4f46e5") !== -1 && /text-align:\s*center/.test(style)) {
        blocks[i].parentNode.removeChild(blocks[i]);
      }
    }
  }

  function preparePreviewSheet(doc) {
    if (!doc || !doc.body) return null;
    stripPreviewFooter(doc);
    if (doc.documentElement) {
      doc.documentElement.style.background = "#fff";
      doc.documentElement.style.overflow = "hidden";
    }
    doc.body.style.margin = "0";
    doc.body.style.padding = "0";
    doc.body.style.overflow = "hidden";
    doc.body.style.background = "#fff";
    doc.body.style.color = "#1e293b";
    doc.body.style.fontFamily = "system-ui, sans-serif";

    if (!doc.getElementById("preview-fit-style")) {
      var style = doc.createElement("style");
      style.id = "preview-fit-style";
      style.appendChild(doc.createTextNode(previewFitCss));
      (doc.head || doc.documentElement).appendChild(style);
    }

    var images = doc.querySelectorAll("img");
    for (var i = 0; i < images.length; i++) {
      var src = images[i].getAttribute("src") || "";
      if (src.indexOf("../") === 0 || src.indexOf("./") === 0) {
        images[i].src = new URL(src, window.location.href).href;
      }
    }

    var sheet = doc.getElementById("preview-sheet");
    if (!sheet) {
      sheet = doc.createElement("div");
      sheet.id = "preview-sheet";
      while (doc.body.firstChild) sheet.appendChild(doc.body.firstChild);
      doc.body.appendChild(sheet);
    }
    return sheet;
  }

  function measureSheetHeight(sheet) {
    var win = sheet.ownerDocument.defaultView;
    var top = sheet.getBoundingClientRect().top;
    var bottom = top;
    var children = sheet.children;
    for (var i = 0; i < children.length; i++) {
      var rect = children[i].getBoundingClientRect();
      var marginBottom = parseFloat(win.getComputedStyle(children[i]).marginBottom) || 0;
      var edge = rect.bottom + marginBottom;
      if (edge > bottom) bottom = edge;
    }
    var padBottom = parseFloat(win.getComputedStyle(sheet).paddingBottom) || 0;
    return Math.ceil(bottom - top + padBottom);
  }

  function fitEmailPreview(frameEl) {
    if (!frameEl) return;
    var doc = frameEl.contentDocument;
    var sheet = preparePreviewSheet(doc);
    if (!sheet) return;

    var viewW = frameEl.clientWidth;
    var viewH = frameEl.clientHeight;
    if (!viewW || !viewH) return;

    var slack = 16;
    var fitH = Math.max(1, viewH - slack);
    var scale = 1;
    var layoutW = viewW;
    for (var n = 0; n < 8; n++) {
      sheet.style.transform = "none";
      sheet.style.width = layoutW + "px";
      var contentH = measureSheetHeight(sheet);
      var next = contentH > fitH ? fitH / contentH : 1;
      var nextW = viewW / next;
      if (Math.abs(next - scale) < 0.002 && Math.abs(nextW - layoutW) < 0.5) {
        scale = next;
        layoutW = nextW;
        break;
      }
      scale = next;
      layoutW = nextW;
    }

    sheet.style.transform = "none";
    sheet.style.width = layoutW + "px";
    var fittedH = measureSheetHeight(sheet);
    scale = fittedH > fitH ? fitH / fittedH : 1;
    sheet.style.width = layoutW + "px";
    sheet.style.transformOrigin = "top left";
    sheet.style.transform = scale < 0.999 ? "scale(" + scale + ")" : "none";

    var pics = sheet.querySelectorAll("img");
    for (var p = 0; p < pics.length; p++) {
      if (pics[p].complete || pics[p].getAttribute("data-preview-fit")) continue;
      pics[p].setAttribute("data-preview-fit", "1");
      pics[p].addEventListener("load", function () {
        fitEmailPreview(frameEl);
      });
    }
  }

  function updateFrameOverflow(frameEl, stageEl) {
    if (stageEl) stageEl.classList.remove("is-overflowing");
    fitEmailPreview(frameEl);
  }

  function updateAllFrameOverflow() {
    panes.forEach(function (pane) {
      if (pane.frame && pane.frame.offsetParent) {
        fitEmailPreview(pane.frame);
      }
    });
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
      "is-handoff-phase-lift",
      "is-handoff-phase-travel",
      "is-handoff-phase-settle",
      "is-handoff-commit",
      "is-handoff-secondary-enter",
      "is-handoff-secondary-enter-active",
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

  function abortActiveAnimation() {
    animationGeneration += 1;
    pendingTimeouts.forEach(clearTimeout);
    pendingTimeouts = [];
    clearHandoffClasses();
    var viewport = root.querySelector("[data-comm-viewport]");
    if (viewport) {
      viewport.classList.remove(
        "is-handoff-active",
        "is-category-switch-out",
        "is-category-switch-hold",
        "is-category-switch-in",
        "is-category-switch-active",
        "is-category-switch-from-right",
        "is-category-switch-from-left"
      );
    }
    if (consoleEl) consoleEl.classList.remove("is-changing");
    changing = false;
  }

  function after(ms, callback) {
    var generation = animationGeneration;
    var id = window.setTimeout(function () {
      if (generation !== animationGeneration) return;
      callback();
    }, ms);
    pendingTimeouts.push(id);
  }

  function waitPaneTransition(target, fallbackMs, callback) {
    if (!target) {
      callback();
      return;
    }

    var generation = animationGeneration;
    var finished = false;
    function complete() {
      if (finished || generation !== animationGeneration) return;
      finished = true;
      target.removeEventListener("transitionend", onEnd);
      callback();
    }

    function onEnd(event) {
      if (event.target !== target) return;
      if (event.propertyName !== "transform" && event.propertyName !== "opacity") return;
      complete();
    }

    target.addEventListener("transitionend", onEnd);
    window.setTimeout(complete, fallbackMs);
  }

  function canPromoteNext(previousIndex, index) {
    if (visibleItems.length < 2) return false;
    if (!window.matchMedia("(min-width: 961px)").matches) return false;
    return index === wrapIndex(previousIndex + 1);
  }

  function syncHandoffTravelDistance() {
    if (!duo) return;
    var primaryPane = duo.querySelector(".comm-hub-mail__pane--primary");
    var secondaryPane = duo.querySelector(".comm-hub-mail__pane--secondary");
    if (!primaryPane || !secondaryPane) return;

    var primaryStage = primaryPane.querySelector(".comm-hub-mail__stage");
    var secondaryStage = secondaryPane.querySelector(".comm-hub-mail__stage");
    var viewportEl = root.querySelector("[data-comm-viewport]");
    var duoRect = duo.getBoundingClientRect();
    var viewportRect = viewportEl ? viewportEl.getBoundingClientRect() : duoRect;
    var primaryLeft = (primaryStage || primaryPane).getBoundingClientRect().left - duoRect.left;
    var secondaryLeft = (secondaryStage || secondaryPane).getBoundingClientRect().left - duoRect.left;
    var distance = primaryLeft - secondaryLeft;
    var frameMargin = 14;
    var projectedLeft = duoRect.left + secondaryLeft + distance;
    var secondaryWidth = (secondaryStage || secondaryPane).getBoundingClientRect().width;
    var projectedRight = projectedLeft + secondaryWidth;

    if (projectedLeft < viewportRect.left + frameMargin) {
      distance += viewportRect.left + frameMargin - projectedLeft;
    }

    if (projectedRight > viewportRect.right - frameMargin) {
      distance -= projectedRight - (viewportRect.right - frameMargin);
    }

    duo.style.setProperty("--comm-handoff-travel-x", distance + "px");
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
      fitEmailPreview(frameEl);
    }

    frameEl.onload = function () {
      fitEmailPreview(frameEl);
      window.setTimeout(function () {
        fitEmailPreview(frameEl);
        window.setTimeout(function () {
          fitEmailPreview(frameEl);
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

  function animateCategorySwitch(primaryKey, secondaryKey, direction, done) {
    var viewport = root.querySelector("[data-comm-viewport]");
    var generation = animationGeneration;

    function finish(doneFn) {
      if (generation !== animationGeneration) return;
      finishFrameChange(doneFn);
    }

    if (!viewport || prefersReducedMotion) {
      loadPreviewPair(primaryKey, secondaryKey, function () {
        finish(done);
      });
      return;
    }

    if (consoleEl) consoleEl.classList.add("is-changing");
    clearHandoffClasses();
    viewport.classList.remove(
      "is-category-switch-in",
      "is-category-switch-active",
      "is-category-switch-from-right",
      "is-category-switch-from-left"
    );
    viewport.classList.add("is-category-switch-out");

    waitPaneTransition(viewport, CATEGORY_SWITCH_OUT_MS + 120, function () {
      if (generation !== animationGeneration) return;
      viewport.classList.add("is-category-switch-hold");
      viewport.classList.remove("is-category-switch-out");
      syncDuoLayout(currentIndex);

      loadPreviewPair(primaryKey, secondaryKey, function () {
        if (generation !== animationGeneration) return;
        viewport.classList.add("is-category-switch-in");
        viewport.classList.add(direction < 0 ? "is-category-switch-from-left" : "is-category-switch-from-right");
        void viewport.offsetWidth;
        viewport.classList.remove("is-category-switch-hold");
        viewport.classList.add("is-category-switch-active");

        waitPaneTransition(viewport, CATEGORY_SWITCH_IN_MS + 160, function () {
          if (generation !== animationGeneration) return;
          viewport.classList.remove(
            "is-category-switch-in",
            "is-category-switch-active",
            "is-category-switch-from-right",
            "is-category-switch-from-left",
            "is-category-switch-hold"
          );
          finish(done);
        });
      });
    });
  }

  function animatePromoteNext(primaryKey, secondaryKey, done) {
    var generation = animationGeneration;
    var secondaryPane = duo.querySelector(".comm-hub-mail__pane--secondary");

    function finish(doneFn) {
      if (generation !== animationGeneration) return;
      finishFrameChange(doneFn);
    }

    if (!secondaryPane) {
      loadPreviewPair(primaryKey, secondaryKey, function () {
        finish(done);
      });
      return;
    }

    if (consoleEl) consoleEl.classList.add("is-changing");
    clearHandoffClasses();
    syncHandoffTravelDistance();

    var viewport = root.querySelector("[data-comm-viewport]");
    if (viewport) {
      viewport.classList.remove(
        "is-category-switch-out",
        "is-category-switch-in",
        "is-category-switch-active",
        "is-category-switch-from-right",
        "is-category-switch-from-left"
      );
      viewport.classList.add("is-handoff-active");
    }

    after(40, function () {
      if (generation !== animationGeneration) return;
      duo.classList.add("is-handoff-phase-lift");

      after(HANDOFF_LIFT_MS, function () {
        if (generation !== animationGeneration) return;
        duo.classList.add("is-handoff-phase-travel");
        void duo.offsetWidth;
        duo.classList.remove("is-handoff-phase-lift");

        after(HANDOFF_TRAVEL_MS, function () {
          if (generation !== animationGeneration) return;
          duo.classList.add("is-handoff-phase-settle");
          void duo.offsetWidth;
          duo.classList.remove("is-handoff-phase-travel");

          after(HANDOFF_SETTLE_MS, function () {
            if (generation !== animationGeneration) return;
            duo.classList.add("is-handoff-commit");
            duo.classList.remove("is-handoff-phase-settle");

            loadFrameContent(panes[0].frame, panes[0].stage, templateHtml(primaryKey), function () {
              if (generation !== animationGeneration) return;

              if (!secondaryKey) {
                syncDuoLayout(currentIndex);
                clearHandoffClasses();
                if (viewport) viewport.classList.remove("is-handoff-active");
                updateAllFrameOverflow();
                finish(done);
                return;
              }

              loadFrameContent(panes[1].frame, panes[1].stage, templateHtml(secondaryKey), function () {
                if (generation !== animationGeneration) return;
                requestAnimationFrame(function () {
                  if (generation !== animationGeneration) return;
                  duo.classList.remove("is-handoff-commit");
                  duo.classList.add("is-handoff-secondary-enter");
                  void duo.offsetWidth;
                  duo.classList.add("is-handoff-secondary-enter-active");

                  waitPaneTransition(secondaryPane, SECONDARY_IN_MS + 150, function () {
                    if (generation !== animationGeneration) return;
                    clearHandoffClasses();
                    if (viewport) viewport.classList.remove("is-handoff-active");
                    updateAllFrameOverflow();
                    finish(done);
                  });
                });
              });
            });
          });
        });
      });
    });
  }

  function animateInsertPrevious(primaryKey, secondaryKey, done) {
    var primaryPane = duo.querySelector(".comm-hub-mail__pane--primary");
    if (consoleEl) consoleEl.classList.add("is-changing");
    clearHandoffClasses();
    duo.classList.add("is-handoff-prev-exit");

    waitPaneTransition(primaryPane, SLIDE_MS + 80, function () {
      duo.classList.remove("is-handoff-prev-exit");
      loadPreviewPair(primaryKey, secondaryKey, function () {
        duo.classList.add("is-handoff-prev-enter");
        void duo.offsetWidth;
        duo.classList.remove("is-handoff-prev-enter");
        duo.classList.add("is-handoff-prev-active");

        waitPaneTransition(primaryPane, SLIDE_MS + 80, function () {
          clearHandoffClasses();
          finishFrameChange(done);
        });
      });
    });
  }

  function animatePrimarySwap(primaryKey, secondaryKey, direction, done) {
    var primaryPane = duo.querySelector(".comm-hub-mail__pane--primary");
    if (consoleEl) consoleEl.classList.add("is-changing");
    clearHandoffClasses();

    loadPreviewPair(primaryKey, secondaryKey, function () {
      duo.classList.add("is-swap-enter");
      if (direction < 0) duo.classList.add("is-swap-from-left");
      void duo.offsetWidth;
      duo.classList.remove("is-swap-enter", "is-swap-from-left");
      duo.classList.add("is-swap-active");

      waitPaneTransition(primaryPane, SLIDE_MS + 80, function () {
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

    if (options.mode === "category") {
      animateCategorySwitch(primaryKey, secondaryKey, direction, done);
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

  function secondaryBtnForIndex(index) {
    if (visibleItems.length < 2) return null;
    if (index >= visibleItems.length - 1) return null;
    return visibleItems[index + 1];
  }

  function syncDuoLayout(index) {
    if (!duo) return;
    if (typeof index !== "number") index = currentIndex;
    var atEnd = visibleItems.length < 2 || index >= visibleItems.length - 1;
    duo.classList.toggle("is-end", atEnd);
    duo.classList.remove("is-single");
  }

  function categoryDirection(fromFilter, toFilter) {
    var fromIdx = CATEGORY_ORDER.indexOf(fromFilter);
    var toIdx = CATEGORY_ORDER.indexOf(toFilter);
    if (fromIdx < 0 || toIdx < 0 || fromIdx === toIdx) return 1;
    return toIdx > fromIdx ? 1 : -1;
  }

  function setActiveItem(index, direction, options) {
    if (!visibleItems.length) return;

    options = options || {};

    if (changing) {
      abortActiveAnimation();
    }

    var previousIndex = currentIndex;

    index = wrapIndex(index);

    var primaryBtn = visibleItems[index];
    var primaryKey = primaryBtn.getAttribute("data-comm-template");
    var secondaryBtn = secondaryBtnForIndex(index);
    var secondaryKey = secondaryBtn ? secondaryBtn.getAttribute("data-comm-template") : null;

    if (hasLoadedPreview && primaryKey === currentTemplateKey && options.mode !== "category") return;

    var slideDirection = direction;
    if (slideDirection == null) {
      if (index === 0 && previousIndex === visibleItems.length - 1) slideDirection = 1;
      else if (index === visibleItems.length - 1 && previousIndex === 0) slideDirection = -1;
      else slideDirection = index >= previousIndex ? 1 : -1;
    }

    currentIndex = index;

    var promotingIntoEnd = (options.mode || "in-tab") !== "category"
      && slideDirection > 0
      && canPromoteNext(previousIndex, index)
      && !secondaryBtn;

    if ((options.mode || "in-tab") !== "category") {
      if (promotingIntoEnd) duo.classList.remove("is-end");
      else syncDuoLayout(index);
    }

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
      {
        direction: slideDirection,
        previousIndex: previousIndex,
        index: index,
        mode: options.mode || "in-tab",
      },
      function () {
        changing = false;
        resetTiming();
      }
    );

    if (primaryBtn && isHubInView()) {
      scrollChipIntoRail(primaryBtn);
    }
  }

  function applyFilter(filter, keepIndex, options) {
    options = options || {};
    var previousFilter = activeFilter;

    if (filter === previousFilter && !keepIndex && hasLoadedPreview) return;

    if (changing) {
      abortActiveAnimation();
    }

    activeFilter = filter;

    filters.forEach(function (btn) {
      var active = btn.getAttribute("data-comm-filter") === filter;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
      btn.classList.remove("is-timing");
    });

    items.forEach(function (btn) {
      var category = btn.getAttribute("data-comm-category");
      var show = category === filter;
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

    var switchDirection = options.categoryDirection != null
      ? options.categoryDirection
      : categoryDirection(previousFilter, filter);
    var targetIndex = keepIndex && currentIndex < visibleItems.length ? currentIndex : 0;

    setActiveItem(targetIndex, switchDirection, { mode: "category" });
  }

  function nextCategory() {
    var idx = CATEGORY_ORDER.indexOf(activeFilter);
    var next = idx < 0 || idx >= CATEGORY_ORDER.length - 1 ? CATEGORY_ORDER[0] : CATEGORY_ORDER[idx + 1];
    applyFilter(next, false, { categoryDirection: 1 });
  }

  function advance() {
    if (!visibleItems.length) return;

    if (changing) {
      abortActiveAnimation();
    }

    if (currentIndex >= visibleItems.length - 1) {
      if (rotating) nextCategory();
      else setActiveItem(0, 1);
      return;
    }

    setActiveItem(currentIndex + 1, 1);
  }

  function showByKey(key) {
    var chip = items.find(function (btn) {
      return btn.getAttribute("data-comm-template") === key;
    });
    if (chip) {
      var category = chip.getAttribute("data-comm-category") || "instant";
      applyFilter(category, false);
    }
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
      var direction = idx >= currentIndex ? 1 : -1;
      setActiveItem(idx, direction);
      startRotation();
    });
  });

  filters.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var filter = btn.getAttribute("data-comm-filter") || "instant";
      if (filter === activeFilter) return;
      applyFilter(filter, false);
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

  window.addEventListener("resize", function () {
    updateAllFrameOverflow();
  });

  applyFilter("instant", false);
  startRotation();

  function initTemplateRegistry() {
    var panel = document.querySelector("[data-comm-template-registry]");
    if (!panel) return;

    var templates = [
      {
        cat: "instant",
        catLabel: "Instant alerts",
        name: "Task assigned",
        subject: "New task assigned: Complete route knowledge refresh",
      },
      {
        cat: "scheduled",
        catLabel: "Scheduled alerts",
        name: "Assessment window closing soon",
        subject: "Assessment window closes soon for Sarah Mitchell",
      },
      {
        cat: "instant",
        catLabel: "Instant alerts",
        name: "Digital cab pass issued",
        subject: "Your digital cab pass is ready to view",
      },
      {
        cat: "account",
        catLabel: "Account & access",
        name: "Welcome to Rail Intel",
        subject: "Welcome to Rail Intel – Your login details",
      },
      {
        cat: "scheduled",
        catLabel: "Scheduled alerts",
        name: "Licence expiry — 3 months",
        subject: "Train driving licence renewal due in 3 months",
      },
    ];

    var catEl = panel.querySelector("[data-comm-registry-category]");
    var titleEl = panel.querySelector("[data-comm-registry-title]");
    var subjectEl = panel.querySelector("[data-comm-registry-subject]");
    var progressEl = panel.querySelector("[data-comm-registry-progress]");
    var rows = Array.prototype.slice.call(panel.querySelectorAll("[data-comm-registry-row]"));
    var index = 0;
    var timer = null;
    var REGISTRY_MS = 4200;
    var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function resetProgress() {
      panel.classList.remove("is-timing");
      if (progressEl) {
        progressEl.style.animation = "none";
        void progressEl.offsetWidth;
        progressEl.style.animation = "";
      }
      if (!prefersReducedMotion) panel.classList.add("is-timing");
    }

    function render(i) {
      var t = templates[i];
      if (catEl) {
        catEl.textContent = t.catLabel;
        catEl.className = "comm-hub-template-registry__cat comm-hub-template-registry__cat--" + t.cat;
      }
      if (titleEl) titleEl.textContent = t.name;
      if (subjectEl) subjectEl.textContent = t.subject;
      rows.forEach(function (row, ri) {
        row.classList.toggle("is-active", ri === i);
      });
      resetProgress();
    }

    function advance() {
      panel.classList.add("is-changing");
      window.setTimeout(function () {
        index = (index + 1) % templates.length;
        render(index);
        panel.classList.remove("is-changing");
      }, prefersReducedMotion ? 0 : 280);
    }

    function start() {
      stop();
      if (prefersReducedMotion) return;
      timer = window.setInterval(advance, REGISTRY_MS);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
      panel.classList.remove("is-timing");
    }

    render(0);
    start();
    panel.addEventListener("mouseenter", stop);
    panel.addEventListener("mouseleave", start);
    panel.addEventListener("focusin", stop);
    panel.addEventListener("focusout", start);
  }
})();
