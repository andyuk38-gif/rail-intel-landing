/* Printable Profile — interactive brochure flipbook with page curl */

(function () {
  "use strict";

  var PAGE_WIDTH = 420;
  var PAGE_HEIGHT = 594;
  var PAGE_RATIO = PAGE_WIDTH / PAGE_HEIGHT;

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

    if (isMobileLandscape()) {
      return Math.min(height * 0.88, height - 48);
    }

    if (isSinglePageMode()) {
      /* Portrait phones: size by width so the page fills the frame; height follows aspect. */
      return Number.POSITIVE_INFINITY;
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
    var single = isSinglePageMode();
    var spread = single ? 1 : 2;
    var stageInnerWidth = Math.max(0, getStageInnerWidth());
    var maxBookWidth = stageInnerWidth;
    var maxBookHeight = getMaxBookHeight();
    var pageWidth = maxBookWidth / spread;
    var pageHeight = pageWidth / PAGE_RATIO;

    if (Number.isFinite(maxBookHeight) && pageHeight > maxBookHeight) {
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
    var single = isSinglePageMode();
    var spread = single ? 1 : 2;

    wrap.style.width = size.bookWidth + "px";
    wrap.style.maxWidth = "100%";
    wrap.style.marginLeft = "auto";
    wrap.style.marginRight = "auto";
    wrap.style.background = "#012269";
    wrap.style.height = size.bookHeight + "px";

    /* If max-width compressed the wrap, rebuild height from the real width so the page is not clipped. */
    var actualWidth = wrap.clientWidth;
    if (actualWidth > 0 && Math.abs(actualWidth - size.bookWidth) > 1) {
      size.bookWidth = actualWidth;
      size.pageWidth = Math.round(actualWidth / spread);
      size.pageHeight = Math.round(size.pageWidth / PAGE_RATIO);
      size.bookHeight = size.pageHeight;
      wrap.style.width = size.bookWidth + "px";
      wrap.style.height = size.bookHeight + "px";
    }

    root.style.width = "100%";
    root.style.height = size.bookHeight + "px";
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

  function getCurrentPage() {
    if (!flipInstance) return 0;
    return flipInstance.getCurrentPageIndex();
  }

  function setNodeVisibility(nodes, visible) {
    nodes.forEach(function (node) {
      node.hidden = !visible;
    });
  }

  function updateSpreadChrome(pageIndex) {
    var current = typeof pageIndex === "number" ? pageIndex : getCurrentPage();
    var atStart;
    var atEnd;

    if (isSinglePageMode()) {
      atStart = current <= 0;
      atEnd = current >= pageCount - 1;
    } else {
      var spreadIndex = getSpreadIndex();
      var spreadCount = getSpreadCount();
      atStart = spreadIndex <= 0;
      atEnd = spreadIndex >= spreadCount - 1;
    }

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
    var current = typeof pageIndex === "number" ? pageIndex : getCurrentPage();

    if (pageLabel) {
      pageLabel.textContent = "Page " + (current + 1) + " of " + pageCount;
    }

    /* Portrait mode must use page index — spread index can stay at 0 after a flip. */
    if (isSinglePageMode()) {
      if (prevBtn) prevBtn.disabled = current <= 0;
      if (nextBtn) nextBtn.disabled = current >= pageCount - 1;
    } else {
      var spreadIndex = getSpreadIndex();
      var spreadCount = getSpreadCount();
      if (prevBtn) prevBtn.disabled = spreadIndex <= 0;
      if (nextBtn) nextBtn.disabled = spreadIndex >= spreadCount - 1;
    }

    updateHint();
    updateSpreadChrome(current);
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
      mobileScrollSupport: false,
      usePortrait: isSinglePageMode(),
      drawShadow: true,
      flippingTime: 700,
      useMouseEvents: true,
      swipeDistance: 36,
      clickEventForward: false,
      disableFlipByClick: true,
      autoSize: false,
      startPage: 0,
      showPageCorners: !isSinglePageMode(),
    };
  }

  function goPrev() {
    if (!flipInstance || getCurrentPage() <= 0) return;
    var before = getCurrentPage();
    flipInstance.flipPrev("bottom");
    window.setTimeout(function () {
      if (!flipInstance) return;
      if (getCurrentPage() === before) {
        flipInstance.turnToPrevPage();
      }
      updateControls(getCurrentPage());
    }, 80);
  }

  function goNext() {
    if (!flipInstance || getCurrentPage() >= pageCount - 1) return;
    var before = getCurrentPage();
    flipInstance.flipNext("bottom");
    window.setTimeout(function () {
      if (!flipInstance) return;
      if (getCurrentPage() === before) {
        flipInstance.turnToNextPage();
      }
      updateControls(getCurrentPage());
    }, 80);
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
      prevBtn.addEventListener("click", function (event) {
        event.preventDefault();
        goPrev();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function (event) {
        event.preventDefault();
        goNext();
      });
    }
  }

  var lastAppliedSize = { bookWidth: 0, bookHeight: 0 };
  var touchingBook = false;

  function handleResize() {
    updateLayoutClasses();

    if (!flipInstance || !wrap || touchingBook) return;

    var metrics = getBookMetrics();
    if (
      Math.abs(metrics.bookWidth - lastAppliedSize.bookWidth) < 2 &&
      Math.abs(metrics.bookHeight - lastAppliedSize.bookHeight) < 2
    ) {
      return;
    }

    var current = flipInstance.getCurrentPageIndex();
    flipInstance.update(flipOptions(metrics));
    softenCoverPages(flipInstance);
    syncWrapSize(metrics);
    lastAppliedSize = { bookWidth: metrics.bookWidth, bookHeight: metrics.bookHeight };
    updateControls(current);
  }

  bindControls();
  updateLayoutClasses();
  updateHint();

  loadScript("https://cdn.jsdelivr.net/npm/page-flip@2.0.7/dist/js/page-flip.browser.js")
    .then(function () {
      initFlipbook();
      if (flipInstance) {
        var metrics = getBookMetrics();
        lastAppliedSize = { bookWidth: metrics.bookWidth, bookHeight: metrics.bookHeight };
      }
    })
    .catch(function () {
      if (pageLabel) pageLabel.textContent = "Interactive preview unavailable";
      if (prevBtn) prevBtn.hidden = true;
      if (nextBtn) nextBtn.hidden = true;
    });

  var resizeTimer;
  function scheduleResize() {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(handleResize, 220);
  }

  window.addEventListener("resize", scheduleResize);
  window.addEventListener("orientationchange", function () {
    window.setTimeout(scheduleResize, 350);
  });

  if (wrap) {
    wrap.addEventListener(
      "touchstart",
      function () {
        touchingBook = true;
      },
      { passive: true }
    );
    wrap.addEventListener(
      "touchend",
      function () {
        touchingBook = false;
      },
      { passive: true }
    );
    wrap.addEventListener(
      "touchcancel",
      function () {
        touchingBook = false;
      },
      { passive: true }
    );
  }
})();
