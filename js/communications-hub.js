/* Communications Hub — rotating email template showcase */

(function () {
  "use strict";

  var root = document.querySelector("[data-comm-hub]");
  if (!root) return;

  var items = Array.prototype.slice.call(root.querySelectorAll("[data-comm-template]"));
  var templates = Array.prototype.slice.call(document.querySelectorAll("[data-comm-email]"));
  var filters = Array.prototype.slice.call(root.querySelectorAll("[data-comm-filter]"));
  var jumpButtons = Array.prototype.slice.call(document.querySelectorAll("[data-comm-jump]"));
  var frame = root.querySelector("[data-comm-frame]");
  var subjectEl = root.querySelector("[data-comm-subject]");
  var statusEl = root.querySelector("[data-comm-status]");
  var prevBtn = root.querySelector("[data-comm-prev]");
  var nextBtn = root.querySelector("[data-comm-next]");
  var playBtn = root.querySelector("[data-comm-play]");

  var activeFilter = "all";
  var visibleItems = items.slice();
  var currentIndex = 0;
  var timer = null;
  var rotating = true;
  var ROTATE_MS = 5500;

  function templateHtml(key) {
    var node = templates.find(function (el) {
      return el.getAttribute("data-comm-email") === key;
    });
    return node ? node.innerHTML : "";
  }

  function templateSubject(key) {
    var node = templates.find(function (el) {
      return el.getAttribute("data-comm-email") === key;
    });
    return node ? node.getAttribute("data-comm-subject") || "" : "";
  }

  function writeFrame(html) {
    if (!frame || !frame.contentDocument) return;
    var doc = frame.contentDocument;
    doc.open();
    doc.write(html || "<p style='font-family:system-ui;padding:24px;color:#64748b'>Preview unavailable.</p>");
    doc.close();
  }

  function setActiveItem(index) {
    if (!visibleItems.length) return;

    if (index < 0) index = visibleItems.length - 1;
    if (index >= visibleItems.length) index = 0;
    currentIndex = index;

    visibleItems.forEach(function (btn, i) {
      var active = i === currentIndex;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });

    var key = visibleItems[currentIndex].getAttribute("data-comm-template");
    writeFrame(templateHtml(key));

    if (subjectEl) {
      subjectEl.textContent = templateSubject(key);
    }

    if (statusEl) {
      var overall = items.findIndex(function (btn) {
        return btn.getAttribute("data-comm-template") === key;
      });
      statusEl.textContent = overall + 1 + " / " + items.length;
    }

    var activeBtn = visibleItems[currentIndex];
    if (activeBtn && typeof activeBtn.scrollIntoView === "function") {
      activeBtn.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }

  function applyFilter(filter) {
    activeFilter = filter;
    currentIndex = 0;

    filters.forEach(function (btn) {
      var active = btn.getAttribute("data-comm-filter") === filter;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });

    items.forEach(function (btn) {
      var category = btn.getAttribute("data-comm-category");
      var show = filter === "all" || category === filter;
      btn.classList.toggle("is-hidden", !show);
    });

    visibleItems = items.filter(function (btn) {
      return !btn.classList.contains("is-hidden");
    });

    setActiveItem(0);
  }

  function showByKey(key) {
    applyFilter("all");
    var idx = visibleItems.findIndex(function (btn) {
      return btn.getAttribute("data-comm-template") === key;
    });
    if (idx >= 0) setActiveItem(idx);

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
  }

  function startRotation() {
    stopRotation();
    if (!rotating || visibleItems.length < 2) return;
    timer = setInterval(function () {
      setActiveItem(currentIndex + 1);
    }, ROTATE_MS);
  }

  function toggleRotation() {
    rotating = !rotating;
    if (playBtn) {
      playBtn.textContent = rotating ? "Pause" : "Play";
      playBtn.setAttribute("aria-pressed", rotating ? "true" : "false");
      playBtn.setAttribute("aria-label", rotating ? "Pause auto-rotate" : "Play auto-rotate");
    }
    if (rotating) startRotation();
    else stopRotation();
  }

  items.forEach(function (btn, index) {
    btn.addEventListener("click", function () {
      var idx = visibleItems.indexOf(btn);
      if (idx < 0) return;
      setActiveItem(idx);
      startRotation();
    });

    if (index === 0) {
      writeFrame(templateHtml(btn.getAttribute("data-comm-template")));
    }
  });

  filters.forEach(function (btn) {
    btn.addEventListener("click", function () {
      applyFilter(btn.getAttribute("data-comm-filter") || "all");
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
      setActiveItem(currentIndex - 1);
      startRotation();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      setActiveItem(currentIndex + 1);
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

  applyFilter("all");
  startRotation();
})();
