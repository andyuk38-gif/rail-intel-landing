/* Printable Profile — interactive brochure flipbook with page curl */

(function () {
  "use strict";

  var PAGE_WIDTH = 420;
  var PAGE_HEIGHT = 594;
  var PAGE_RATIO = PAGE_WIDTH / PAGE_HEIGHT;
  var CORNER_BOTTOM = "bottom";

  var root = document.querySelector("[data-profile-flipbook]");
  if (!root) return;

  var section = root.closest(".profile-flipbook");
  var prevBtn = document.querySelector("[data-flip-prev]");
  var nextBtn = document.querySelector("[data-flip-next]");
  var pageLabel = document.querySelector("[data-flip-page]");
  var hintLabel = document.querySelector("[data-flip-hint]");
  var wrap = document.querySelector("[data-flipbook-wrap]");
  var guardsBack = document.querySelectorAll("[data-flip-guard-back]");
  var guardsForward = document.querySelectorAll("[data-flip-guard-forward]");
  var fillBack = document.querySelector("[data-spread-fill-back]");
  var fillForward = document.querySelector("[data-spread-fill-forward]");

  var flipInstance = null;
  var pageCount = 0;

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[src="' + src + '"]');
      if (existing) {
        if (existing.dataset.loaded === "1") resolve();
        else existing.addEventListener("load", resolve, { once: true });
        return;
      }

      var script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = function () {
        script.dataset.loaded = "1";
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function isCoarsePointer() {
    return window.matchMedia("(pointer: coarse)").matches;
  }

  function isSinglePageMode() {
    var width = window.innerWidth;
    var height = window.innerHeight;

    if (width <= 768) return true;
    if (height <= 520 && width <= 960) return true;
    return false;
  }

  function isMobileLandscape() {
    return isSinglePageMode() && window.innerWidth > window.innerHeight;
  }

  function getViewportHeight() {
    return window.visualViewport ? window.visualViewport.height : window.innerHeight;
  }

  function getSiteChromeHeight() {
    var chrome = document.querySelector(".site-chrome");

    if (chrome) {
      return Math.ceil(chrome.getBoundingClientRect().bottom);
    }

    return 0;
  }

  function getMaxBookHeight() {
    var height = getViewportHeight();

    if (isSinglePageMode()) {
      if (isMobileLandscape()) {
        return Math.min(height * 0.82, height - 56);
      }

      if (!wrap || !section) {
        return Math.min(height * 0.46, 400);
      }

      var controls = section.querySelector(".profile-flipbook__controls");
      var stagePanel = wrap.parentElement;
      var intro = section.querySelector(".profile-flipbook__intro");
      var controlsHeight = controls ? controls.offsetHeight + 12 : 52;
      var introHeight = intro ? intro.offsetHeight + 10 : 0;
      var panelStyles = stagePanel ? window.getComputedStyle(stagePanel) : null;
      var padY = panelStyles ? parseFloat(panelStyles.paddingTop) + parseFloat(panelStyles.paddingBottom) : 0;
      var chromeHeight = getSiteChromeHeight();
      var available = height - chromeHeight - introHeight - padY - controlsHeight - 14;

      if (stagePanel) {
        var panelTop = stagePanel.getBoundingClientRect().top;
        var liveAvailable = height - panelTop - padY - controlsHeight - 12;

        if (liveAvailable > 200 && panelTop < height * 0.85) {
          available = Math.max(available, liveAvailable);
        }
      }

      return Math.max(240, Math.min(available, 440));
    }

    return Math.min(height * 0.68, 800);
  }

  function syncBrochureScale(metrics) {
    if (!metrics) return;

    var scale = metrics.pageWidth / PAGE_WIDTH;
    root.style.setProperty("--brochure-scale", String(scale));
  }

  function updateLayoutClasses() {
    if (!section) return;

    section.classList.toggle("is-single-page", isSinglePageMode());
    section.classList.toggle("is-mobile-landscape", isMobileLandscape());
  }

  function updateHint() {
    if (!hintLabel) return;

    hintLabel.textContent = isSinglePageMode() ? "· swipe to turn" : "· drag corners to turn";
  }

  function getStageInnerWidth() {
    var panel = wrap && wrap.parentElement;
    if (!panel) return window.innerWidth;

    var styles = window.getComputedStyle(panel);
    var padLeft = parseFloat(styles.paddingLeft) || 0;
    var padRight = parseFloat(styles.paddingRight) || 0;

    return panel.clientWidth - padLeft - padRight;
  }

  function getBookMetrics() {
    var spread = isSinglePageMode() ? 1 : 2;
    var stageInnerWidth = getStageInnerWidth();
    var maxBookWidth = stageInnerWidth;
    var maxBookHeight = getMaxBookHeight();
    var pageWidth = maxBookWidth / spread;
    var pageHeight = pageWidth / PAGE_RATIO;

    if (pageHeight > maxBookHeight) {
      pageHeight = maxBookHeight;
      pageWidth = pageHeight * PAGE_RATIO;
    }

    var bookWidth = pageWidth * spread;
    var bookHeight = pageHeight;

    return {
      bookWidth: Math.round(bookWidth),
      bookHeight: Math.round(bookHeight),
      pageWidth: Math.round(pageWidth),
      pageHeight: Math.round(pageHeight),
    };
  }

  function syncWrapSize(metrics) {
    if (!wrap) return metrics || getBookMetrics();

    var size = metrics || getBookMetrics();
    var block = root.querySelector(".stf__block");

    if (block) {
      var blockWidth = block.offsetWidth;
      var blockHeight = block.offsetHeight;

      if (blockWidth > 0 && blockHeight > 0) {
        size = {
          bookWidth: blockWidth,
          bookHeight: blockHeight,
          pageWidth: Math.round(blockWidth / (isSinglePageMode() ? 1 : 2)),
          pageHeight: blockHeight,
        };
      }
    }

    wrap.style.width = size.bookWidth + "px";
    wrap.style.height = size.bookHeight + "px";
    syncBrochureScale(size);
    return size;
  }

  function getSpreadIndex() {
    if (!flipInstance) return 0;
    return flipInstance.getPageCollection().getCurrentSpreadIndex();
  }

  function getSpreadCount() {
    if (!flipInstance) return 1;
    return flipInstance.getPageCollection().getSpread().length;
  }

  function setNodeVisibility(nodes, visible) {
    nodes.forEach(function (node) {
      node.hidden = !visible;
    });
  }

  function updateSpreadChrome() {
    var spreadIndex = getSpreadIndex();
    var spreadCount = getSpreadCount();
    var atStart = spreadIndex <= 0;
    var atEnd = spreadIndex >= spreadCount - 1;

    setNodeVisibility(guardsBack, atStart);
    setNodeVisibility(guardsForward, atEnd);

    if (fillBack) fillBack.hidden = !atStart;
    if (fillForward) fillForward.hidden = !atEnd;

    if (wrap) {
      wrap.classList.toggle("is-at-start", atStart);
      wrap.classList.toggle("is-at-end", atEnd);
      wrap.classList.toggle("is-spread", !atStart && !atEnd);
    }
  }

  function updateControls(pageIndex) {
    var spreadIndex = getSpreadIndex();
    var spreadCount = getSpreadCount();

    if (pageLabel) {
      pageLabel.textContent = "Page " + (pageIndex + 1) + " of " + pageCount;
    }

    if (prevBtn) prevBtn.disabled = spreadIndex <= 0;
    if (nextBtn) nextBtn.disabled = spreadIndex >= spreadCount - 1;

    updateHint();
    updateSpreadChrome();
  }

  function softenPage(page) {
    page.setDensity("soft");
    page.setDrawingDensity("soft");
  }

  function softenCoverPages(instance) {
    var collection = instance.getPageCollection();
    var total = instance.getPageCount();

    softenPage(collection.getPage(0));

    if (total > 1) {
      softenPage(collection.getPage(total - 1));
    }
  }

  function flipOptions(metrics) {
    var pageWidth = metrics ? metrics.pageWidth : PAGE_WIDTH;
    var pageHeight = metrics ? metrics.pageHeight : PAGE_HEIGHT;

    return {
      width: pageWidth,
      height: pageHeight,
      size: "stretch",
      minWidth: pageWidth,
      maxWidth: pageWidth,
      minHeight: pageHeight,
      maxHeight: pageHeight,
      maxShadowOpacity: 0.9,
      showCover: true,
      mobileScrollSupport: isSinglePageMode() || isCoarsePointer(),
      usePortrait: isSinglePageMode(),
      drawShadow: true,
      flippingTime: 700,
      useMouseEvents: true,
      swipeDistance: 24,
      clickEventForward: false,
      disableFlipByClick: true,
      autoSize: true,
      startPage: 0,
      showPageCorners: true,
    };
  }

  function initFlipbook() {
    if (!window.St || !window.St.PageFlip) return;

    updateLayoutClasses();
    var metrics = syncWrapSize();
    var pages = root.querySelectorAll(".brochure-page");
    pageCount = pages.length;

    flipInstance = new window.St.PageFlip(root, flipOptions(metrics));
    flipInstance.loadFromHTML(pages);
    softenCoverPages(flipInstance);

    flipInstance.on("flip", function (event) {
      updateControls(event.data);
    });

    flipInstance.on("changeState", function (event) {
      if (!wrap) return;
      var flipping = event.data === "user_fold" || event.data === "fold_corner" || event.data === "flipping";
      wrap.classList.toggle("is-flipping", flipping);
      if (flipping) softenCoverPages(flipInstance);
    });

    flipInstance.on("init", function () {
      softenCoverPages(flipInstance);
      syncWrapSize(metrics);
    });

    updateControls(flipInstance.getCurrentPageIndex());
    window.requestAnimationFrame(function () {
      syncWrapSize(metrics);
    });
  }

  function bindControls() {
    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        if (!flipInstance || getSpreadIndex() <= 0) return;
        flipInstance.flipPrev(CORNER_BOTTOM);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        if (!flipInstance || getSpreadIndex() >= getSpreadCount() - 1) return;
        flipInstance.flipNext(CORNER_BOTTOM);
      });
    }
  }

  function handleResize() {
    updateLayoutClasses();

    if (!flipInstance || !wrap) return;

    var metrics = getBookMetrics();
    var current = flipInstance.getCurrentPageIndex();
    flipInstance.update(flipOptions(metrics));
    softenCoverPages(flipInstance);
    syncWrapSize(metrics);
    updateControls(current);
  }

  bindControls();
  updateLayoutClasses();
  updateHint();

  loadScript("https://cdn.jsdelivr.net/npm/page-flip@2.0.7/dist/js/page-flip.browser.js")
    .then(initFlipbook)
    .catch(function () {
      if (pageLabel) pageLabel.textContent = "Interactive preview unavailable";
      if (prevBtn) prevBtn.hidden = true;
      if (nextBtn) nextBtn.hidden = true;
    });

  var resizeTimer;
  function scheduleResize() {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(handleResize, 150);
  }

  window.addEventListener("resize", scheduleResize);
  window.addEventListener("orientationchange", scheduleResize);

  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", scheduleResize);
  }

  if (section && "IntersectionObserver" in window) {
    var visibilityObserver = new IntersectionObserver(
      function (entries) {
        if (entries[0] && entries[0].isIntersecting) scheduleResize();
      },
      { threshold: 0.15 }
    );

    visibilityObserver.observe(section);
  }
})();
