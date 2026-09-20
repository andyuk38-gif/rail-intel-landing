/* Printable Profile — interactive brochure flipbook with page curl */

(function () {
  "use strict";

  var PAGE_WIDTH = 420;
  var PAGE_HEIGHT = 594;
  var PAGE_RATIO = PAGE_WIDTH / PAGE_HEIGHT;
  var CORNER_BOTTOM = "bottom";

  var root = document.querySelector("[data-profile-flipbook]");
  if (!root) return;

  var prevBtn = document.querySelector("[data-flip-prev]");
  var nextBtn = document.querySelector("[data-flip-next]");
  var pageLabel = document.querySelector("[data-flip-page]");
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

  function isPortrait() {
    return window.matchMedia("(max-width: 768px)").matches;
  }

  function getBookMetrics() {
    var stageWidth = wrap && wrap.parentElement ? wrap.parentElement.clientWidth : window.innerWidth;
    var horizontalPad = isPortrait() ? 24 : 40;
    var spread = isPortrait() ? 1 : 2;
    var maxBookWidth = Math.min(stageWidth - horizontalPad, isPortrait() ? 520 : 1280);
    var maxBookHeight = Math.min(window.innerHeight * 0.68, 800);
    var heightFromWidth = maxBookWidth / (PAGE_RATIO * spread);
    var bookHeight = Math.min(maxBookHeight, heightFromWidth);
    var bookWidth = bookHeight * PAGE_RATIO * spread;
    var pageWidth = bookWidth / spread;
    var pageHeight = bookHeight;

    return {
      bookWidth: Math.round(bookWidth),
      bookHeight: Math.round(bookHeight),
      pageWidth: Math.round(pageWidth),
      pageHeight: Math.round(pageHeight),
    };
  }

  function syncWrapSize() {
    if (!wrap) return;

    var metrics = getBookMetrics();
    wrap.style.width = metrics.bookWidth + "px";
    wrap.style.height = metrics.bookHeight + "px";
    return metrics;
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
      mobileScrollSupport: false,
      usePortrait: isPortrait(),
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
    });

    updateControls(flipInstance.getCurrentPageIndex());
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
    if (!flipInstance || !wrap) return;
    var metrics = syncWrapSize();
    var current = flipInstance.getCurrentPageIndex();
    flipInstance.update(flipOptions(metrics));
    softenCoverPages(flipInstance);
    updateControls(current);
  }

  bindControls();

  loadScript("https://cdn.jsdelivr.net/npm/page-flip@2.0.7/dist/js/page-flip.browser.js")
    .then(initFlipbook)
    .catch(function () {
      if (pageLabel) pageLabel.textContent = "Interactive preview unavailable";
      if (prevBtn) prevBtn.hidden = true;
      if (nextBtn) nextBtn.hidden = true;
    });

  var resizeTimer;
  window.addEventListener("resize", function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(handleResize, 150);
  });
})();
