/* Printable Profile — interactive brochure flipbook with page curl */

(function () {
  "use strict";

  var PAGE_WIDTH = 420;
  var PAGE_HEIGHT = 594;
  var PAGE_RATIO = PAGE_WIDTH / PAGE_HEIGHT;

  var root = document.querySelector("[data-profile-flipbook]");
  if (!root) return;

  var prevBtn = document.querySelector("[data-flip-prev]");
  var nextBtn = document.querySelector("[data-flip-next]");
  var pageLabel = document.querySelector("[data-flip-page]");
  var wrap = document.querySelector("[data-flipbook-wrap]");
  var guardBack = document.querySelector("[data-flip-guard-back]");
  var guardForward = document.querySelector("[data-flip-guard-forward]");

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
    var maxBookHeight = Math.min(window.innerHeight * 0.74, 860);
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

  function updateCurlGuards(index) {
    var atStart = index <= 0;
    var atEnd = index >= pageCount - 1;

    if (guardBack) guardBack.hidden = !atStart;
    if (guardForward) guardForward.hidden = !atEnd;

    if (wrap) {
      wrap.classList.toggle("is-at-start", atStart);
      wrap.classList.toggle("is-at-end", atEnd);
    }
  }

  function pointerRatio(event) {
    if (!wrap) return 0.5;

    var rect = wrap.getBoundingClientRect();
    var clientX = event.clientX;

    if (event.touches && event.touches.length) {
      clientX = event.touches[0].clientX;
    } else if (event.changedTouches && event.changedTouches.length) {
      clientX = event.changedTouches[0].clientX;
    }

    return (clientX - rect.left) / rect.width;
  }

  function isBlockedFlipZone(event, index) {
    if (!flipInstance) return false;

    var ratio = pointerRatio(event);
    var portrait = isPortrait();

    if (index <= 0) {
      return portrait ? ratio < 0.3 : ratio < 0.52;
    }

    if (index >= pageCount - 1) {
      return portrait ? ratio > 0.7 : ratio > 0.48;
    }

    return false;
  }

  function resetFoldAnimation() {
    if (!flipInstance) return;

    var controller = flipInstance.getFlipController();
    var render = flipInstance.getRender();

    render.finishAnimation();
    render.setBottomPage(null);
    render.setFlippingPage(null);
    render.clearShadow();
    flipInstance.updateState("read");
  }

  function cancelBoundaryFold(index) {
    if (!flipInstance) return;

    var controller = flipInstance.getFlipController();
    var state = controller.getState();
    if (state !== "fold_corner" && state !== "user_fold") return;

    var calc = controller.getCalculation();
    if (!calc || !calc.getDirection) return;

    var isForward = calc.getDirection() === 0;
    var isBack = calc.getDirection() === 1;

    if ((index <= 0 && isBack) || (index >= pageCount - 1 && isForward)) {
      resetFoldAnimation();
    }
  }

  function handleBoundaryPointer(event) {
    if (!flipInstance) return;

    var index = flipInstance.getCurrentPageIndex();
    if (!isBlockedFlipZone(event, index)) return;

    if (event.type === "mousemove") {
      cancelBoundaryFold(index);
      event.stopPropagation();
      return;
    }

    event.preventDefault();
    event.stopPropagation();
  }

  function updateControls(index) {
    if (pageLabel) {
      pageLabel.textContent = "Page " + (index + 1) + " of " + pageCount;
    }
    if (prevBtn) prevBtn.disabled = index <= 0;
    if (nextBtn) nextBtn.disabled = index >= pageCount - 1;
    updateCurlGuards(index);
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

    flipInstance.on("flip", function (event) {
      updateControls(event.data);
    });

    flipInstance.on("changeState", function () {
      cancelBoundaryFold(flipInstance.getCurrentPageIndex());
    });

    if (wrap) {
      wrap.addEventListener("mousedown", handleBoundaryPointer, true);
      wrap.addEventListener("touchstart", handleBoundaryPointer, true);
      wrap.addEventListener("mousemove", handleBoundaryPointer, true);
      wrap.addEventListener("touchmove", handleBoundaryPointer, true);
    }

    updateControls(flipInstance.getCurrentPageIndex());
  }

  function bindControls() {
    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        if (!flipInstance || flipInstance.getCurrentPageIndex() <= 0) return;
        flipInstance.flipPrev();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        if (!flipInstance || flipInstance.getCurrentPageIndex() >= pageCount - 1) return;
        flipInstance.flipNext();
      });
    }
  }

  function handleResize() {
    if (!flipInstance || !wrap) return;
    var metrics = syncWrapSize();
    var current = flipInstance.getCurrentPageIndex();
    flipInstance.update(flipOptions(metrics));
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
