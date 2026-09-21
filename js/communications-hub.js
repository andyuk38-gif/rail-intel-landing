/* Communications Hub — animated category carousel with auto-sized email previews */

(function () {
  "use strict";

  var root = document.querySelector("[data-comm-hub]");
  if (!root) return;

  var consoleEl = root.querySelector(".comm-hub-console");
  var items = Array.prototype.slice.call(root.querySelectorAll("[data-comm-template]"));
  var templates = Array.prototype.slice.call(document.querySelectorAll("[data-comm-email]"));
  var filters = Array.prototype.slice.call(root.querySelectorAll("[data-comm-filter]"));
  var jumpButtons = Array.prototype.slice.call(document.querySelectorAll("[data-comm-jump]"));
  var frame = root.querySelector("[data-comm-frame]");
  var viewport = root.querySelector("[data-comm-viewport]");
  var stage = root.querySelector("[data-comm-stage]");
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

  function resizeFrame() {
    if (!frame || !frame.contentDocument) return;
    var doc = frame.contentDocument;
    var body = doc.body;
    var html = doc.documentElement;
    if (!body) return;

    var height = Math.ceil(body.getBoundingClientRect().height);
    if (height < 120) height = 120;

    frame.style.height = height + "px";
    if (viewport) viewport.style.height = height + "px";
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

  function writeFrame(html, done) {
    if (!frame) {
      if (done) done();
      return;
    }

    if (stage) stage.classList.add("is-changing");
    if (consoleEl) consoleEl.classList.add("is-changing");

    window.setTimeout(function () {
      var doc = frame.contentDocument;
      if (doc) {
        doc.open();
        doc.write(html || "<p style='font-family:system-ui;padding:24px;color:#64748b'>Preview unavailable.</p>");
        doc.close();
      }

      frame.onload = function () {
        resizeFrame();
        window.setTimeout(function () {
          if (stage) stage.classList.remove("is-changing");
          if (consoleEl) consoleEl.classList.remove("is-changing");
          if (done) done();
        }, 40);
      };

      window.setTimeout(resizeFrame, 60);
      window.setTimeout(resizeFrame, 240);
    }, 120);
  }

  function updateMeta(btn, key) {
    var category = btn.getAttribute("data-comm-category") || activeFilter;

    if (titleEl) titleEl.textContent = templateLabel(btn);
    if (subjectEl) subjectEl.textContent = templateSubject(key);

    if (tagEl) {
      tagEl.textContent = CATEGORY_LABELS[category] || category;
      tagEl.className = "comm-hub-console__tag comm-hub-console__tag--" + category;
    }

    if (statusEl) {
      var overall = items.findIndex(function (item) {
        return item.getAttribute("data-comm-template") === key;
      });
      statusEl.textContent = (overall + 1) + " / " + items.length;
    }
  }

  function setActiveItem(index, animate) {
    if (!visibleItems.length || changing) return;

    if (index < 0) index = visibleItems.length - 1;
    if (index >= visibleItems.length) index = 0;
    currentIndex = index;

    visibleItems.forEach(function (btn, i) {
      var active = i === currentIndex;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });

    var activeBtn = visibleItems[currentIndex];
    var key = activeBtn.getAttribute("data-comm-template");

    changing = true;
    writeFrame(templateHtml(key), function () {
      changing = false;
      updateMeta(activeBtn, key);
      resetTiming();
    });

    if (activeBtn && typeof activeBtn.scrollIntoView === "function") {
      activeBtn.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
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

    if (keepIndex && currentIndex < visibleItems.length) {
      setActiveItem(currentIndex, true);
    } else {
      currentIndex = 0;
      setActiveItem(0, true);
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
      else setActiveItem(0, true);
      return;
    }

    setActiveItem(currentIndex + 1, true);
  }

  function showByKey(key) {
    applyFilter("all", false);
    var idx = visibleItems.findIndex(function (btn) {
      return btn.getAttribute("data-comm-template") === key;
    });
    if (idx >= 0) setActiveItem(idx, true);

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
      setActiveItem(idx, true);
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
      setActiveItem(currentIndex - 1, true);
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
