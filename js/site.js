/* Rail Intel – shared navigation and screenshot lightbox. Loaded on every page. */

(function () {
  "use strict";

  /* ---------- Footer year ---------- */

  var year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Dev banner → EOI register-interest panel ---------- */

  var EOI_REGISTERED_KEY = "railintel_eoi_registered";

  function isEoiRegistered() {
    try {
      return localStorage.getItem(EOI_REGISTERED_KEY) === "1";
    } catch (e) {
      return false;
    }
  }

  function hideDevBannerEoiButton() {
    Array.prototype.forEach.call(document.querySelectorAll(".dev-banner__btn"), function (btn) {
      btn.hidden = true;
    });
  }

  if (isEoiRegistered()) {
    hideDevBannerEoiButton();
  }

  function isHomePage() {
    var path = window.location.pathname;
    return path === "/" || /\/index\.html$/i.test(path);
  }

  function tryOpenEoiPanel() {
    if (typeof window.railintelEoiOpen !== "function") return false;
    return window.railintelEoiOpen() !== false;
  }

  function openRegisterInterest(event) {
    if (event) event.preventDefault();

    if (isEoiRegistered()) return;

    if (tryOpenEoiPanel()) return;

    if (isHomePage()) {
      if (location.hash !== "#register-interest") {
        location.hash = "register-interest";
      }
      var attempts = 0;
      var timer = window.setInterval(function () {
        if (tryOpenEoiPanel()) {
          window.clearInterval(timer);
        } else if (++attempts > 60) {
          window.clearInterval(timer);
        }
      }, 50);
      return;
    }

    window.location.href = window.location.origin + "/#register-interest";
  }

  document.addEventListener("click", function (event) {
    if (!event.target.closest(".dev-banner__btn, [data-eoi-open]")) return;
    openRegisterInterest(event);
  });

  /* ---------- Dropdown navigation ---------- */

  var menu = document.querySelector("[data-nav-menu]");
  var toggle = document.querySelector("[data-nav-toggle]");
  var groups = Array.prototype.slice.call(document.querySelectorAll("[data-nav-group]"));
  var isCompact = function () {
    return window.matchMedia("(max-width: 900px)").matches;
  };

  function closeGroups(except) {
    groups.forEach(function (group) {
      if (group === except) return;
      group.dataset.open = "false";
      var trigger = group.querySelector("[data-nav-trigger]");
      if (trigger) trigger.setAttribute("aria-expanded", "false");
    });
  }

  function setGroup(group, open) {
    group.dataset.open = open ? "true" : "false";
    var trigger = group.querySelector("[data-nav-trigger]");
    if (trigger) trigger.setAttribute("aria-expanded", open ? "true" : "false");
  }

  var canHover = window.matchMedia("(hover: hover)").matches;

  groups.forEach(function (group) {
    var trigger = group.querySelector("[data-nav-trigger]");
    if (!trigger) return;

    // On the compact layout, and on touch, the trigger opens the panel instead
    // of navigating. On desktop it stays a plain link to the section index and
    // hover reveals the panel.
    trigger.addEventListener("click", function (event) {
      if (!isCompact() && canHover) return;
      event.preventDefault();
      var open = group.dataset.open !== "true";
      closeGroups(group);
      setGroup(group, open);
    });

    group.addEventListener("mouseenter", function () {
      if (isCompact() || !canHover) return;
      closeGroups(group);
      setGroup(group, true);
    });

    group.addEventListener("mouseleave", function () {
      if (isCompact() || !canHover) return;
      setGroup(group, false);
    });

    // Keyboard users get the panel on focus, since they never fire mouseenter.
    group.addEventListener("focusin", function () {
      if (isCompact()) return;
      closeGroups(group);
      setGroup(group, true);
    });

    group.addEventListener("focusout", function (event) {
      if (isCompact()) return;
      if (!group.contains(event.relatedTarget)) setGroup(group, false);
    });
  });

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.dataset.open !== "true";
      menu.dataset.open = open ? "true" : "false";
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      if (!open) closeGroups(null);
    });
  }

  document.addEventListener("click", function (event) {
    if (!event.target.closest("[data-nav-group]")) closeGroups(null);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeGroups(null);
  });

  /* ---------- Lightbox ---------- */

  var EXPAND_ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>';

  var lightbox = document.createElement("div");
  lightbox.className = "lightbox";
  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-modal", "true");
  lightbox.setAttribute("aria-label", "Screenshot at full resolution");
  lightbox.innerHTML =
    '<div class="lightbox__bar">' +
    '<span class="lightbox__meta" data-lightbox-meta></span>' +
    '<span class="lightbox__controls">' +
    '<button type="button" class="lightbox__btn" data-lightbox-zoom hidden>Actual size</button>' +
    '<a class="lightbox__btn" data-lightbox-open target="_blank" rel="noopener">Open original</a>' +
    '<button type="button" class="lightbox__btn" data-lightbox-close>Close</button>' +
    "</span>" +
    "</div>" +
    '<div class="lightbox__stage">' +
    '<img class="lightbox__img" alt="" data-lightbox-img />' +
    '<video class="lightbox__video" data-lightbox-video hidden muted loop playsinline controls></video>' +
    '<div class="lightbox__licence-scan" data-lightbox-licence-scan hidden></div>' +
    "</div>";
  document.body.appendChild(lightbox);

  var lightboxImg = lightbox.querySelector("[data-lightbox-img]");
  var lightboxVideo = lightbox.querySelector("[data-lightbox-video]");
  var lightboxLicenceScan = lightbox.querySelector("[data-lightbox-licence-scan]");
  var lightboxMeta = lightbox.querySelector("[data-lightbox-meta]");
  var lightboxOpen = lightbox.querySelector("[data-lightbox-open]");
  var lightboxZoom = lightbox.querySelector("[data-lightbox-zoom]");
  var lastFocused = null;
  var actualSize = false;
  var lightboxMode = "image";

  function describe() {
    var natural = lightboxImg.naturalWidth;
    var shown = Math.round(lightboxImg.getBoundingClientRect().width);
    var percent = Math.round((shown / natural) * 100);
    lightboxMeta.textContent =
      natural + " x " + lightboxImg.naturalHeight + " px" + (percent < 100 ? " at " + percent + "%" : " at 100%");
  }

  function applyScale() {
    if (actualSize) {
      lightboxImg.style.width = lightboxImg.naturalWidth + "px";
      lightboxImg.style.maxWidth = "none";
      lightboxImg.style.maxHeight = "none";
      lightboxZoom.textContent = "Fit to screen";
    } else {
      lightboxImg.style.width = "auto";
      lightboxImg.style.maxWidth = "100%";
      lightboxImg.style.maxHeight = "calc(100vh - 7rem)";
      lightboxZoom.textContent = "Actual size";
    }
    describe();
  }

  function resetLightboxMedia() {
    lightboxImg.hidden = false;
    lightboxImg.removeAttribute("style");
    lightboxImg.removeAttribute("src");
    lightboxVideo.hidden = true;
    lightboxVideo.pause();
    lightboxVideo.removeAttribute("src");
    lightboxVideo.load();
    if (lightboxLicenceScan) {
      var licenceClone = lightboxLicenceScan.querySelector("[data-licence-card-scan]");
      if (licenceClone && window.stopLicenceCardScan) window.stopLicenceCardScan(licenceClone);
      lightboxLicenceScan.hidden = true;
      lightboxLicenceScan.replaceChildren();
    }
    lightboxOpen.hidden = false;
    lightboxZoom.hidden = false;
  }

  function showLightbox(img) {
    lastFocused = document.activeElement;
    actualSize = false;
    lightboxMode = "image";
    resetLightboxMedia();

    var onReady = function () {
      applyScale();
      // Only offer the toggle when the file is bigger than the fitted view.
      var fitted = Math.round(lightboxImg.getBoundingClientRect().width);
      lightboxZoom.hidden = fitted >= lightboxImg.naturalWidth;
    };

    lightboxImg.removeAttribute("style");
    lightboxImg.src = img.currentSrc || img.src;
    lightboxImg.alt = img.alt || "";
    lightboxOpen.href = img.currentSrc || img.src;

    // Open first: the image cannot be measured while the dialog is display:none.
    lightbox.classList.add("is-open");
    document.body.classList.add("lightbox-open");
    lightbox.querySelector("[data-lightbox-close]").focus();

    if (lightboxImg.complete && lightboxImg.naturalWidth) onReady();
    else lightboxImg.addEventListener("load", onReady, { once: true });
  }

  function showVideoLightbox(video) {
    var source = video.querySelector("source");
    var src = source ? source.getAttribute("src") : video.currentSrc || video.src;
    if (!src) return;

    lastFocused = document.activeElement;
    lightboxMode = "video";
    resetLightboxMedia();

    lightboxImg.hidden = true;
    lightboxVideo.hidden = false;
    lightboxVideo.src = src;
    lightboxVideo.setAttribute("aria-label", video.getAttribute("aria-label") || "Scanning animation");
    lightboxMeta.textContent = video.getAttribute("aria-label") || "Scanning animation";
    lightboxOpen.hidden = true;
    lightboxZoom.hidden = true;

    lightbox.classList.add("is-open");
    document.body.classList.add("lightbox-open");
    lightbox.querySelector("[data-lightbox-close]").focus();
    lightboxVideo.play().catch(function () {});
  }

  function showLicenceScanLightbox(scanRoot) {
    var card = scanRoot.querySelector("[data-licence-card-scan]");
    if (!card || !lightboxLicenceScan) return;

    lastFocused = document.activeElement;
    lightboxMode = "licence-scan";
    resetLightboxMedia();

    lightboxImg.hidden = true;
    var clone = card.cloneNode(true);
    clone.classList.add("licence-card-scan--enlarged");
    lightboxLicenceScan.appendChild(clone);
    lightboxLicenceScan.hidden = false;
    lightboxMeta.textContent = "Licence scanning";
    lightboxOpen.hidden = true;
    lightboxZoom.hidden = true;

    lightbox.classList.add("is-open");
    document.body.classList.add("lightbox-open");
    lightbox.querySelector("[data-lightbox-close]").focus();
    if (window.startLicenceCardScan) window.startLicenceCardScan(clone);
  }

  lightboxZoom.addEventListener("click", function () {
    actualSize = !actualSize;
    applyScale();
  });

  function hideLightbox() {
    lightbox.classList.remove("is-open");
    document.body.classList.remove("lightbox-open");
    resetLightboxMedia();
    lightboxMode = "image";
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  lightbox.addEventListener("click", function (event) {
    if (event.target.closest("[data-lightbox-close]") || event.target === lightbox) {
      hideLightbox();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && lightbox.classList.contains("is-open")) hideLightbox();
  });

  // Every screenshot frame gets an expand control, so pages only need the markup
  // for the image itself.
  var frames = document.querySelectorAll(".shot__frame, .browser-mockup__content, .shot-viewer__frame-inner");
  Array.prototype.forEach.call(frames, function (frame) {
    var img = frame.querySelector("img");
    if (!img || frame.querySelector(".shot__expand") || frame.hasAttribute("data-no-expand")) return;

    var button = document.createElement("button");
    button.type = "button";
    button.className = "shot__expand";
    button.innerHTML = EXPAND_ICON;
    button.setAttribute("aria-label", "View this screenshot at full resolution");
    button.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      showLightbox(img);
    });
    button.addEventListener("pointerdown", function (event) {
      // Keep gallery swipe handlers from stealing the expand control.
      event.stopPropagation();
    });

    if (getComputedStyle(frame).position === "static") frame.style.position = "relative";
    frame.appendChild(button);
  });

  Array.prototype.forEach.call(document.querySelectorAll("[data-scan-expand]"), function (wrap) {
    if (!wrap.querySelector("[data-licence-card-scan]")) return;

    function openScanLightbox(event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      showLicenceScanLightbox(wrap);
    }

    wrap.addEventListener("click", function (event) {
      if (event.target.closest("[data-lightbox-close]")) return;
      openScanLightbox(event);
    });

    var trigger = wrap.querySelector("[data-scan-expand-trigger]");
    if (trigger) {
      trigger.addEventListener("click", function (event) {
        event.stopPropagation();
        openScanLightbox(event);
      });
    }
  });

  /* ---------- Tunnel Mode demo ---------- */

  Array.prototype.forEach.call(document.querySelectorAll("[data-tunnel]"), function (stage) {
    var buttons = Array.prototype.slice.call(stage.querySelectorAll("[data-tunnel-mode]"));
    var modes = ["day", "tunnel", "dim"];
    var index = 0;
    var timer = null;
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function setMode(mode) {
      stage.dataset.mode = mode;
      buttons.forEach(function (button) {
        var active = button.dataset.tunnelMode === mode;
        button.classList.toggle("is-active", active);
      });
      index = Math.max(0, modes.indexOf(mode));
    }

    function cycle() {
      index = (index + 1) % modes.length;
      setMode(modes[index]);
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        setMode(button.dataset.tunnelMode);
        if (timer) {
          clearInterval(timer);
          timer = setInterval(cycle, 3200);
        }
      });
    });

    setMode("day");
    if (!reduced) {
      timer = setInterval(cycle, 3200);
    } else {
      Array.prototype.forEach.call(stage.querySelectorAll(".tunnel-scene__video"), function (video) {
        video.removeAttribute("autoplay");
        video.pause();
      });
    }
  });

  /* ---------- Scroll reveal for showcase panels ---------- */

  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if (reveals.length) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      reveals.forEach(function (el) {
        el.classList.add("is-visible");
      });
    } else {
      var revealObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
      );
      reveals.forEach(function (el) {
        revealObserver.observe(el);
      });
    }
  }

  /* ---------- Proof 3D carousel ---------- */

  var proofCarousel = document.querySelector("[data-proof-carousel]");
  if (proofCarousel) {
    var proofRing = proofCarousel.querySelector("[data-proof-ring]");
    var proofStage = proofCarousel.querySelector("[data-proof-stage]");
    var proofDotsRoot = proofCarousel.querySelector("[data-proof-dots]");
    var proofPill = proofCarousel.querySelector("[data-proof-pill]");
    var proofItems = Array.prototype.slice.call(proofCarousel.querySelectorAll("[data-proof-item]"));
    var proofDots = [];
    var proofCount = proofItems.length;
    var proofIndex = Math.min(1, proofCount - 1);
    var proofDisplayAngle = 0;
    var proofReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var proofCompact = function () {
      return window.matchMedia("(max-width: 1024px)").matches;
    };
    var proofDragging = false;
    var proofDragStart = 0;
    var proofDragDelta = 0;
    var proofDragAngleStart = 0;
    var proofDragTarget = null;
    var proofLastDragDistance = 0;
    var proofScrollStart = 0;
    var proofAutoTimer = null;
    var proofPaused = false;
    var proofInView = true;
    var proofIntroDone = false;
    var PROOF_AUTO_MS = 3000;
    var PROOF_DRAG_CLICK_MAX = 12;
    var PROOF_DRAG_STEP = 48;
    var PROOF_DRAG_SENSITIVITY = 0.24;

    function proofAccentFor(index) {
      var card = proofItems[index] && proofItems[index].querySelector(".proof-card");
      if (!card) return "";
      return card.style.getPropertyValue("--proof-accent") || getComputedStyle(card).getPropertyValue("--proof-accent");
    }

    function proofLabelFor(item) {
      var label = item.querySelector(".proof-label");
      return label ? label.textContent.replace(/\s+/g, " ").trim() : "";
    }

    function proofPositionPill() {
      if (!proofPill || !proofDots.length) return;
      var activeDot = proofDots[proofIndex];
      if (!activeDot) return;
      var footer = proofPill.parentElement;
      if (!footer) return;

      if (proofCompact()) {
        proofPill.style.transform = "";
        return;
      }

      var footerRect = footer.getBoundingClientRect();
      var dotRect = activeDot.getBoundingClientRect();
      var offsetY = dotRect.top + dotRect.height / 2 - footerRect.top - proofPill.offsetHeight / 2;
      proofPill.style.transform = "translateY(" + offsetY + "px)";
    }

    function proofLayout() {
      if (!proofCount) return;
      var step = 360 / proofCount;
      var cardWidth = 220;
      var radius = Math.round(cardWidth / (2 * Math.tan(Math.PI / proofCount)) + 48);
      radius = Math.max(260, Math.min(radius, 420));
      proofCarousel.style.setProperty("--carousel-angle", step + "deg");
      proofCarousel.style.setProperty("--carousel-radius", radius + "px");
      proofItems.forEach(function (item, itemIndex) {
        item.style.setProperty("--proof-i", String(itemIndex));
      });
    }

    function proofBuildDots() {
      if (!proofDotsRoot) return;
      proofDotsRoot.replaceChildren();
      proofItems.forEach(function (item, itemIndex) {
        var dot = document.createElement("button");
        dot.type = "button";
        dot.className = "proof-carousel__dot";
        dot.setAttribute("role", "tab");
        dot.setAttribute("data-proof-dot", String(itemIndex));
        dot.setAttribute("aria-label", proofLabelFor(item) || "Feature " + (itemIndex + 1));
        dot.setAttribute("aria-selected", "false");
        dot.addEventListener("click", function () {
          proofSetIndex(itemIndex, true);
        });
        proofDotsRoot.appendChild(dot);
      });
      proofDots = Array.prototype.slice.call(proofDotsRoot.querySelectorAll("[data-proof-dot]"));
      proofPositionPill();
    }

    function proofStopAuto() {
      if (!proofAutoTimer) return;
      window.clearInterval(proofAutoTimer);
      proofAutoTimer = null;
    }

    function proofStartAuto() {
      proofStopAuto();
      if (proofReduced || proofPaused || !proofInView || proofDragging || !proofIntroDone) return;
      proofAutoTimer = window.setInterval(function () {
        if (proofPaused || proofDragging || !proofInView) return;
        proofAdvanceForward();
      }, PROOF_AUTO_MS);
    }

    function proofRestartAuto() {
      proofStopAuto();
      proofStartAuto();
    }

    function proofStepSize() {
      return 360 / proofCount;
    }

    function proofIsAdjacent(itemIndex) {
      if (!proofCount) return false;
      var left = (proofIndex - 1 + proofCount) % proofCount;
      var right = (proofIndex + 1) % proofCount;
      return itemIndex === left || itemIndex === right;
    }

    function proofIndexFromAngle(angle) {
      var step = proofStepSize();
      var stepIndex = Math.round(-angle / step);
      return ((stepIndex % proofCount) + proofCount) % proofCount;
    }

    function proofSnapToIndex(nextIndex, userInitiated) {
      if (userInitiated) proofRestartAuto();
      proofIndex = ((nextIndex % proofCount) + proofCount) % proofCount;
      proofDisplayAngle = -proofIndex * proofStepSize();
      proofApplyState();
    }

    function proofApplyState() {
      proofCarousel.style.setProperty("--carousel-rotate", proofDisplayAngle + "deg");
      proofCarousel.style.setProperty("--dot-accent", proofAccentFor(proofIndex).trim());

      proofItems.forEach(function (item, itemIndex) {
        var isFront = itemIndex === proofIndex;
        var isAdjacent = proofIsAdjacent(itemIndex);
        item.classList.toggle("is-front", isFront);
        item.classList.toggle("is-adjacent", isAdjacent);
        item.setAttribute("aria-hidden", isFront ? "false" : "true");
        var link = item.querySelector(".proof-card");
        if (link) link.tabIndex = isFront ? 0 : -1;
      });

      proofDots.forEach(function (dot, dotIndex) {
        var active = dotIndex === proofIndex;
        dot.classList.toggle("is-active", active);
        dot.setAttribute("aria-selected", active ? "true" : "false");
      });

      if (proofPill && proofItems[proofIndex]) {
        proofPill.textContent = proofLabelFor(proofItems[proofIndex]);
      }

      proofPositionPill();

      if (proofCompact() && proofStage) {
        var target = proofItems[proofIndex];
        if (target) {
          var offset = target.offsetLeft - (proofStage.clientWidth - target.offsetWidth) / 2;
          proofStage.scrollTo({ left: offset, behavior: proofReduced ? "auto" : "smooth" });
        }
      }
    }

    function proofSetIndex(nextIndex, userInitiated) {
      if (userInitiated) proofRestartAuto();
      var newIndex = ((nextIndex % proofCount) + proofCount) % proofCount;
      if (newIndex === proofIndex) {
        proofDisplayAngle = -proofIndex * proofStepSize();
        proofApplyState();
        return;
      }

      var step = proofStepSize();
      var delta = newIndex - proofIndex;
      if (delta > proofCount / 2) delta -= proofCount;
      else if (delta < -proofCount / 2) delta += proofCount;

      proofDisplayAngle -= delta * step;
      proofIndex = newIndex;
      proofApplyState();
    }

    function proofAdvanceForward() {
      proofDisplayAngle -= proofStepSize();
      proofIndex = (proofIndex + 1) % proofCount;
      proofApplyState();
    }

    function proofNearestFromScroll() {
      if (!proofStage || !proofCompact()) return proofIndex;
      var center = proofStage.scrollLeft + proofStage.clientWidth / 2;
      var nearest = 0;
      var nearestDistance = Infinity;
      proofItems.forEach(function (item, itemIndex) {
        var itemCenter = item.offsetLeft + item.offsetWidth / 2;
        var distance = Math.abs(itemCenter - center);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearest = itemIndex;
        }
      });
      return nearest;
    }

    var proofIntroFinished = false;

    function proofFinishIntro() {
      if (proofIntroFinished) return;
      proofIntroFinished = true;
      proofIntroDone = true;
      proofCarousel.classList.remove("is-intro");
      if (proofRing) proofRing.classList.remove("is-intro-spin");
      proofDisplayAngle = -proofIndex * proofStepSize();
      proofApplyState();
      proofStartAuto();
    }

    function proofRunIntro() {
      proofLayout();
      proofBuildDots();

      if (proofReduced || proofCompact() || !proofRing) {
        proofFinishIntro();
        return;
      }

      var step = proofStepSize();
      var targetAngle = -proofIndex * step;
      proofDisplayAngle = targetAngle;
      var fromAngle = targetAngle - 360;
      var introFallback;

      proofCarousel.classList.add("is-intro");
      proofItems.forEach(function (item) {
        item.classList.remove("is-front");
      });
      proofCarousel.style.setProperty("--carousel-rotate", fromAngle + "deg");
      proofRing.classList.add("is-intro-spin");

      function onIntroEnd(event) {
        if (event.propertyName !== "transform") return;
        proofRing.removeEventListener("transitionend", onIntroEnd);
        window.clearTimeout(introFallback);
        proofFinishIntro();
      }

      proofRing.addEventListener("transitionend", onIntroEnd);
      introFallback = window.setTimeout(function () {
        proofRing.removeEventListener("transitionend", onIntroEnd);
        proofFinishIntro();
      }, 1900);

      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
          proofCarousel.style.setProperty("--carousel-rotate", targetAngle + "deg");
        });
      });
    }

    proofRunIntro();

    proofCarousel.addEventListener("mouseenter", function () {
      proofPaused = true;
      proofStopAuto();
    });

    proofCarousel.addEventListener("mouseleave", function () {
      proofPaused = false;
      proofStartAuto();
    });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        proofStopAuto();
      } else if (!proofPaused && proofIntroDone) {
        proofStartAuto();
      }
    });

    if ("IntersectionObserver" in window) {
      var proofViewObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            proofInView = entry.isIntersecting;
            if (proofInView && !proofPaused && proofIntroDone) proofStartAuto();
            else proofStopAuto();
          });
        },
        { threshold: 0.35 }
      );
      proofViewObserver.observe(proofCarousel);
    }

    if (proofStage && !proofReduced) {
      proofStage.addEventListener("keydown", function (event) {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          proofSetIndex(proofIndex - 1, true);
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          proofSetIndex(proofIndex + 1, true);
        }
      });

      proofStage.addEventListener(
        "pointerdown",
        function (event) {
          if (event.pointerType === "mouse" && event.button !== 0) return;
          if (!proofIntroDone) return;
          proofDragging = true;
          proofStopAuto();
          proofDragStart = event.clientX;
          proofDragDelta = 0;
          proofLastDragDistance = 0;
          proofDragAngleStart = proofDisplayAngle;
          proofDragTarget = event.target.closest("[data-proof-item]");
          proofScrollStart = proofStage.scrollLeft;
          proofStage.classList.add("is-dragging");
          if (proofRing) proofRing.classList.add("is-dragging");
          if (proofStage.setPointerCapture) proofStage.setPointerCapture(event.pointerId);
        },
        { passive: true }
      );

      proofStage.addEventListener(
        "pointermove",
        function (event) {
          if (!proofDragging) return;
          proofDragDelta = event.clientX - proofDragStart;
          if (proofCompact()) {
            proofStage.scrollLeft = proofScrollStart - proofDragDelta;
            return;
          }
          var dragAngle = proofDragAngleStart - proofDragDelta * PROOF_DRAG_SENSITIVITY;
          proofCarousel.style.setProperty("--carousel-rotate", dragAngle + "deg");
        },
        { passive: true }
      );

      function proofEndDrag(event) {
        if (!proofDragging) return;
        proofDragging = false;
        proofStage.classList.remove("is-dragging");
        if (proofRing) proofRing.classList.remove("is-dragging");
        if (event && proofStage.releasePointerCapture) {
          try {
            proofStage.releasePointerCapture(event.pointerId);
          } catch (error) {
            /* pointer may already be released */
          }
        }

        var dragDistance = Math.abs(proofDragDelta);
        var clickedItem = proofDragTarget;
        proofDragTarget = null;

        if (proofCompact()) {
          var scrolled = Math.abs(proofStage.scrollLeft - proofScrollStart);
          if (dragDistance <= PROOF_DRAG_CLICK_MAX && clickedItem) {
            var clickIndex = proofItems.indexOf(clickedItem);
            if (clickIndex !== -1 && clickIndex !== proofIndex) {
              proofSetIndex(clickIndex, true);
            } else if (!proofPaused) {
              proofStartAuto();
            }
          } else if (dragDistance > PROOF_DRAG_STEP && scrolled < 28) {
            proofSetIndex(proofIndex + (proofDragDelta < 0 ? 1 : -1), true);
          } else if (scrolled >= 28) {
            var nearest = proofNearestFromScroll();
            if (nearest !== proofIndex) proofSetIndex(nearest, true);
            else proofSetIndex(proofIndex, false);
          } else {
            proofSetIndex(proofIndex, false);
          }
        } else if (dragDistance <= PROOF_DRAG_CLICK_MAX && clickedItem) {
          var clickIndex = proofItems.indexOf(clickedItem);
          if (clickIndex !== -1 && proofIsAdjacent(clickIndex)) {
            proofSetIndex(clickIndex, true);
          } else {
            proofSetIndex(proofIndex, false);
          }
        } else if (dragDistance > PROOF_DRAG_CLICK_MAX) {
          var dragAngle = proofDragAngleStart - proofDragDelta * PROOF_DRAG_SENSITIVITY;
          proofSnapToIndex(proofIndexFromAngle(dragAngle), true);
        } else if (!proofPaused) {
          proofStartAuto();
        }

        proofLastDragDistance = dragDistance;
        proofDragDelta = 0;
      }

      proofStage.addEventListener("pointerup", proofEndDrag);
      proofStage.addEventListener("pointercancel", proofEndDrag);

      proofItems.forEach(function (item, itemIndex) {
        var link = item.querySelector(".proof-card");
        if (!link) return;
        link.addEventListener("click", function (event) {
          if (proofLastDragDistance > PROOF_DRAG_CLICK_MAX) {
            event.preventDefault();
            return;
          }
          if (itemIndex !== proofIndex && proofIsAdjacent(itemIndex)) {
            event.preventDefault();
            proofSetIndex(itemIndex, true);
          } else if (itemIndex !== proofIndex) {
            event.preventDefault();
          }
        });
      });

      var proofScrollTimer;
      proofStage.addEventListener(
        "scroll",
        function () {
          if (!proofCompact()) return;
          window.clearTimeout(proofScrollTimer);
          proofScrollTimer = window.setTimeout(function () {
            var nearest = proofNearestFromScroll();
            if (nearest !== proofIndex) proofSetIndex(nearest, true);
          }, 80);
        },
        { passive: true }
      );
    }

    window.addEventListener("resize", function () {
      proofLayout();
      proofApplyState();
    });
  }

  /* ---------- Get started — onboarding step flow (3D tiles) ---------- */

  var onboardFlow = document.querySelector("[data-onboard-flow]");
  if (onboardFlow) {
    var onboardTiles = Array.prototype.slice.call(onboardFlow.querySelectorAll("[data-onboard-tile]"));
    var onboardDefaultIndex = 0;
    var onboardAutoTimer = null;
    var onboardReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function setOnboardTileActive(index) {
      onboardDefaultIndex = index;
      onboardTiles.forEach(function (tile, tileIndex) {
        tile.classList.toggle("is-active", tileIndex === index);
      });
    }

    function startOnboardAutoCycle() {
      if (onboardReducedMotion || onboardTiles.length < 2) return;
      clearInterval(onboardAutoTimer);
      onboardAutoTimer = setInterval(function () {
        var next = (onboardDefaultIndex + 1) % onboardTiles.length;
        setOnboardTileActive(next);
      }, 4200);
    }

    setOnboardTileActive(onboardDefaultIndex);
    startOnboardAutoCycle();

    onboardTiles.forEach(function (tile, tileIndex) {
      var surface = tile.querySelector("[data-onboard-tilt]");

      tile.addEventListener("mouseenter", function () {
        clearInterval(onboardAutoTimer);
        setOnboardTileActive(tileIndex);
      });

      tile.addEventListener("focus", function () {
        clearInterval(onboardAutoTimer);
        setOnboardTileActive(tileIndex);
      });

      tile.addEventListener("click", function () {
        setOnboardTileActive(tileIndex);
      });

      tile.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setOnboardTileActive(tileIndex);
        }
      });

      if (!surface || onboardReducedMotion) return;

      surface.addEventListener("mousemove", function (event) {
        if (!tile.classList.contains("is-active")) return;
        var rect = surface.getBoundingClientRect();
        var x = (event.clientX - rect.left) / rect.width - 0.5;
        var y = (event.clientY - rect.top) / rect.height - 0.5;
        surface.style.setProperty("--onboard-tilt-x", (-y * 9).toFixed(2) + "deg");
        surface.style.setProperty("--onboard-tilt-y", (x * 9).toFixed(2) + "deg");
      });

      surface.addEventListener("mouseleave", function () {
        surface.style.setProperty("--onboard-tilt-x", "0deg");
        surface.style.setProperty("--onboard-tilt-y", "0deg");
      });
    });

    onboardFlow.addEventListener("mouseleave", function () {
      setOnboardTileActive(onboardDefaultIndex);
      startOnboardAutoCycle();
    });
  }

  /* ---------- Administration intro tiles — animated border focus ---------- */

  var adminIntroTiles = document.querySelector("[data-admin-intro-tiles]");
  if (adminIntroTiles) {
    var adminTiles = Array.prototype.slice.call(adminIntroTiles.querySelectorAll("[data-admin-intro-tile]"));
    var adminDefaultTile = 0;

    function setAdminTileActive(index) {
      adminTiles.forEach(function (tile, tileIndex) {
        tile.classList.toggle("is-active", tileIndex === index);
      });
    }

    setAdminTileActive(adminDefaultTile);

    adminTiles.forEach(function (tile, tileIndex) {
      tile.addEventListener("mouseenter", function () {
        setAdminTileActive(tileIndex);
      });
    });

    adminIntroTiles.addEventListener("mouseleave", function () {
      setAdminTileActive(adminDefaultTile);
    });
  }

  /* ---------- Proof glass cards — subtle pointer tilt (front card only) ---------- */

  var proofCards = Array.prototype.slice.call(document.querySelectorAll("[data-proof-tilt]"));
  if (proofCards.length && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    proofCards.forEach(function (card) {
      if (card.closest("[data-proof-carousel]")) return;
      card.addEventListener("mousemove", function (event) {
        var item = card.closest("[data-proof-item]");
        if (item && !item.classList.contains("is-front")) return;
        var rect = card.getBoundingClientRect();
        var x = (event.clientX - rect.left) / rect.width - 0.5;
        var y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.setProperty("--proof-tilt-x", (-y * 7).toFixed(2) + "deg");
        card.style.setProperty("--proof-tilt-y", (x * 7).toFixed(2) + "deg");
      });

      card.addEventListener("mouseleave", function () {
        card.style.setProperty("--proof-tilt-x", "0deg");
        card.style.setProperty("--proof-tilt-y", "0deg");
      });
    });
  }

  var howFlow = document.querySelector("[data-how-flow]");
  if (howFlow) {
    var howSteps = Array.prototype.slice.call(howFlow.querySelectorAll("[data-how-step]"));
    var howDots = Array.prototype.slice.call(howFlow.querySelectorAll(".how-flow__dot"));
    var howPrev = howFlow.querySelector("[data-how-prev]");
    var howNext = howFlow.querySelector("[data-how-next]");
    var howReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var howActive = 0;
    var howTimer = null;
    var howPaused = false;
    var howInterval = 5500;

    function setHowStep(index) {
      if (!howSteps.length) return;
      howActive = ((index % howSteps.length) + howSteps.length) % howSteps.length;
      howFlow.style.setProperty("--how-active", howActive);
      howSteps.forEach(function (step, i) {
        var isActive = i === howActive;
        step.classList.toggle("is-active", isActive);
        if (isActive) step.setAttribute("aria-current", "step");
        else step.removeAttribute("aria-current");
        step.tabIndex = isActive ? 0 : -1;
      });
      howDots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === howActive);
      });
    }

    function nextHowStep() {
      setHowStep(howActive + 1);
    }

    function prevHowStep() {
      setHowStep(howActive - 1);
    }

    function startHowTimer() {
      if (howReduced || howSteps.length < 2) return;
      if (howTimer) clearInterval(howTimer);
      howTimer = setInterval(function () {
        if (!howPaused) nextHowStep();
      }, howInterval);
    }

    howSteps.forEach(function (step, i) {
      step.addEventListener("click", function () {
        setHowStep(i);
        startHowTimer();
      });
      step.addEventListener("keydown", function (event) {
        if (event.key === "ArrowRight") {
          event.preventDefault();
          nextHowStep();
          startHowTimer();
        }
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          prevHowStep();
          startHowTimer();
        }
      });
    });

    if (howPrev) {
      howPrev.addEventListener("click", function () {
        prevHowStep();
        startHowTimer();
      });
    }

    if (howNext) {
      howNext.addEventListener("click", function () {
        nextHowStep();
        startHowTimer();
      });
    }

    howFlow.addEventListener("mouseenter", function () {
      howPaused = true;
    });
    howFlow.addEventListener("mouseleave", function () {
      howPaused = false;
    });
    howFlow.addEventListener("focusin", function () {
      howPaused = true;
    });
    howFlow.addEventListener("focusout", function (event) {
      if (!howFlow.contains(event.relatedTarget)) howPaused = false;
    });

    setHowStep(0);

    if (howReduced || !("IntersectionObserver" in window)) {
      howFlow.classList.add("is-visible");
      startHowTimer();
    } else {
      var howFlowObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            startHowTimer();
            howFlowObserver.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -10% 0px", threshold: 0.2 }
      );
      howFlowObserver.observe(howFlow);
    }
  }

  var featureShowcase = document.querySelector("[data-feature-showcase]");
  if (featureShowcase) {
    var featureTiles = Array.prototype.slice.call(featureShowcase.querySelectorAll("[data-feature-tile]"));
    featureTiles.forEach(function (tile) {
      if (tile.querySelector(".feature-tile__frame")) return;
      var frame = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      frame.setAttribute("class", "feature-tile__frame");
      frame.setAttribute("aria-hidden", "true");
      frame.setAttribute("focusable", "false");
      frame.setAttribute("viewBox", "0 0 100 100");
      frame.setAttribute("preserveAspectRatio", "none");
      var defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
      var gradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
      gradient.setAttribute("id", "feature-tile-comet-" + tile.dataset.featureTile);
      gradient.setAttribute("gradientUnits", "userSpaceOnUse");
      gradient.setAttribute("x1", "0");
      gradient.setAttribute("y1", "0");
      gradient.setAttribute("x2", "100");
      gradient.setAttribute("y2", "0");
      [
        ["0%", "#f59e0b", "0"],
        ["18%", "#fbbf24", "1"],
        ["28%", "#f59e0b", "0.45"],
        ["42%", "#f59e0b", "0"],
        ["100%", "#f59e0b", "0"],
      ].forEach(function (stopValues) {
        var stop = document.createElementNS("http://www.w3.org/2000/svg", "stop");
        stop.setAttribute("offset", stopValues[0]);
        stop.setAttribute("stop-color", stopValues[1]);
        stop.setAttribute("stop-opacity", stopValues[2]);
        gradient.appendChild(stop);
      });
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        var gradientSpin = document.createElementNS("http://www.w3.org/2000/svg", "animateTransform");
        gradientSpin.setAttribute("attributeName", "gradientTransform");
        gradientSpin.setAttribute("type", "rotate");
        gradientSpin.setAttribute("from", "0 50 50");
        gradientSpin.setAttribute("to", "360 50 50");
        gradientSpin.setAttribute("dur", "2.8s");
        gradientSpin.setAttribute("repeatCount", "indefinite");
        gradient.appendChild(gradientSpin);
      }
      defs.appendChild(gradient);
      frame.appendChild(defs);
      var track = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      track.setAttribute("class", "feature-tile__frame-track");
      track.setAttribute("x", "1.25");
      track.setAttribute("y", "1.25");
      track.setAttribute("width", "97.5");
      track.setAttribute("height", "97.5");
      track.setAttribute("rx", "11");
      track.setAttribute("ry", "11");
      track.setAttribute("pathLength", "1");
      var glow = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      glow.setAttribute("class", "feature-tile__frame-glow");
      glow.setAttribute("x", "1.25");
      glow.setAttribute("y", "1.25");
      glow.setAttribute("width", "97.5");
      glow.setAttribute("height", "97.5");
      glow.setAttribute("rx", "11");
      glow.setAttribute("ry", "11");
      glow.setAttribute("pathLength", "1");
      glow.setAttribute("stroke", "url(#feature-tile-comet-" + tile.dataset.featureTile + ")");
      frame.appendChild(track);
      frame.appendChild(glow);
      tile.insertBefore(frame, tile.firstChild);
    });
    var featureDots = Array.prototype.slice.call(featureShowcase.querySelectorAll(".feature-showcase__dot"));
    var featurePrev = featureShowcase.querySelector("[data-feature-prev]");
    var featureNext = featureShowcase.querySelector("[data-feature-next]");
    var featureSpotlight = featureShowcase.querySelector("[data-feature-spotlight]");
    var featureBadge = featureShowcase.querySelector("[data-feature-spotlight-badge]");
    var featureIcon = featureShowcase.querySelector("[data-feature-spotlight-icon]");
    var featureTitle = featureShowcase.querySelector("[data-feature-spotlight-title]");
    var featureDesc = featureShowcase.querySelector("[data-feature-spotlight-desc]");
    var featureEdge = featureShowcase.querySelector("[data-feature-spotlight-edge]");
    var featureFlags = featureShowcase.querySelector("[data-feature-spotlight-flags]");
    var featureFlagLabels = {
      gb: "English",
      es: "Spanish",
      fr: "French",
      cy: "Welsh",
      it: "Italian",
      de: "German",
      ar: "Arabic",
    };
    var featureReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var featureActive = 0;
    var featureTimer = null;
    var featurePaused = false;
    var featureInterval = 6000;
    var featureSwapTimer = null;

    function setFeatureTile(index) {
      if (!featureTiles.length) return;
      featureActive = ((index % featureTiles.length) + featureTiles.length) % featureTiles.length;
      var tile = featureTiles[featureActive];
      featureShowcase.style.setProperty("--feature-active", featureActive);
      featureTiles.forEach(function (step, i) {
        var isActive = i === featureActive;
        step.classList.toggle("is-active", isActive);
        step.setAttribute("aria-pressed", isActive ? "true" : "false");
      });
      featureDots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === featureActive);
      });

      featureShowcase.classList.add("is-swapping");
      if (featureSwapTimer) clearTimeout(featureSwapTimer);
      featureSwapTimer = setTimeout(function () {
        featureShowcase.classList.remove("is-swapping");
      }, featureReduced ? 0 : 720);

      if (featureBadge) featureBadge.textContent = tile.dataset.featureBadge || "";
      if (featureTitle) featureTitle.textContent = tile.dataset.featureTitle || "";
      if (featureDesc) featureDesc.textContent = tile.dataset.featureDesc || "";
      if (featureEdge) featureEdge.textContent = tile.dataset.featureEdge || "";
      if (featureIcon) {
        var icon = tile.querySelector(".feature-tile__icon");
        featureIcon.innerHTML = icon ? icon.innerHTML : "";
      }
      if (featureFlags) {
        var flagCodes = (tile.dataset.featureFlags || "")
          .split(",")
          .map(function (code) {
            return code.trim();
          })
          .filter(Boolean);
        if (flagCodes.length) {
          featureFlags.hidden = false;
          featureFlags.innerHTML = flagCodes
            .map(function (code) {
              var label = featureFlagLabels[code] || code;
              return (
                '<span class="feature-spotlight__flag" title="' +
                label +
                '"><img src="images/flags/' +
                code +
                '.svg" alt="' +
                label +
                '" width="28" height="18" loading="lazy" decoding="async"></span>'
              );
            })
            .join("");
        } else {
          featureFlags.hidden = true;
          featureFlags.innerHTML = "";
        }
      }

    }

    function nextFeatureTile() {
      setFeatureTile(featureActive + 1);
    }

    function prevFeatureTile() {
      setFeatureTile(featureActive - 1);
    }

    function startFeatureTimer() {
      if (featureReduced || featureTiles.length < 2) return;
      if (featureTimer) clearInterval(featureTimer);
      featureTimer = setInterval(function () {
        if (!featurePaused) nextFeatureTile();
      }, featureInterval);
    }

    featureTiles.forEach(function (tile, i) {
      tile.addEventListener("click", function () {
        setFeatureTile(i);
        startFeatureTimer();
      });
      tile.addEventListener("keydown", function (event) {
        if (event.key === "ArrowRight") {
          event.preventDefault();
          nextFeatureTile();
          startFeatureTimer();
        }
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          prevFeatureTile();
          startFeatureTimer();
        }
      });
    });

    if (featurePrev) {
      featurePrev.addEventListener("click", function () {
        prevFeatureTile();
        startFeatureTimer();
      });
    }

    if (featureNext) {
      featureNext.addEventListener("click", function () {
        nextFeatureTile();
        startFeatureTimer();
      });
    }

    featureShowcase.addEventListener("mouseenter", function () {
      featurePaused = true;
    });
    featureShowcase.addEventListener("mouseleave", function () {
      featurePaused = false;
    });
    featureShowcase.addEventListener("focusin", function () {
      featurePaused = true;
    });
    featureShowcase.addEventListener("focusout", function (event) {
      if (!featureShowcase.contains(event.relatedTarget)) featurePaused = false;
    });

    if (featureSpotlight && !featureReduced) {
      featureSpotlight.addEventListener("mousemove", function (event) {
        var rect = featureSpotlight.getBoundingClientRect();
        var x = (event.clientX - rect.left) / rect.width - 0.5;
        var y = (event.clientY - rect.top) / rect.height - 0.5;
        featureSpotlight.style.setProperty("--feature-tilt-x", (y * -5).toFixed(2) + "deg");
        featureSpotlight.style.setProperty("--feature-tilt-y", (x * 7).toFixed(2) + "deg");
      });

      featureSpotlight.addEventListener("mouseleave", function () {
        featureSpotlight.style.setProperty("--feature-tilt-x", "0deg");
        featureSpotlight.style.setProperty("--feature-tilt-y", "0deg");
      });
    }

    setFeatureTile(0);

    if (featureReduced || !("IntersectionObserver" in window)) {
      startFeatureTimer();
    } else {
      var featureObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            startFeatureTimer();
            featureObserver.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -10% 0px", threshold: 0.15 }
      );
      featureObserver.observe(featureShowcase);
    }
  }

  /* ---------- Screenshot gallery (native-size slides) ---------- */

  Array.prototype.forEach.call(document.querySelectorAll("[data-shot-gallery]"), function (gallery) {
    var track = gallery.querySelector("[data-gallery-track]");
    var slides = Array.prototype.slice.call(gallery.querySelectorAll("[data-gallery-slide]"));
    var dots = Array.prototype.slice.call(gallery.querySelectorAll("[data-gallery-dot]"));
    var prev = gallery.querySelector("[data-gallery-prev]");
    var next = gallery.querySelector("[data-gallery-next]");
    if (!track || !slides.length) return;

    var count = slides.length;
    var index = 0;
    var animating = false;
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var timer = null;
    var paused = false;
    var transition = reduced ? "none" : "transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)";

    // Clone the first slide after the last so forward wrap keeps moving right-to-left.
    if (count > 1) {
      var clone = slides[0].cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      clone.removeAttribute("data-gallery-slide");
      Array.prototype.forEach.call(clone.querySelectorAll("[id]"), function (el) {
        el.removeAttribute("id");
      });
      track.appendChild(clone);
    }

    function logicalIndex() {
      return index === count ? 0 : index;
    }

    function applyTransform(withMotion) {
      track.style.transition = withMotion && !reduced ? transition : "none";
      track.style.transform = "translateX(" + index * -100 + "%)";
    }

    function syncChrome() {
      var logical = logicalIndex();
      dots.forEach(function (dot, i) {
        if (i === logical) dot.setAttribute("aria-current", "true");
        else dot.removeAttribute("aria-current");
      });
      if (prev) prev.disabled = false;
      if (next) next.disabled = false;
    }

    function go(to, options) {
      options = options || {};
      if (count < 2) {
        index = 0;
        applyTransform(false);
        syncChrome();
        return;
      }
      if (animating && !options.force) return;

      // Forward past the last real slide → animate onto the cloned first.
      if (to >= count) {
        animating = true;
        index = count;
        applyTransform(true);
        syncChrome();
        return;
      }

      // Backward before the first → jump to clone, then animate back to last.
      if (to < 0) {
        animating = true;
        index = count;
        applyTransform(false);
        // Force reflow so the next transform animates.
        void track.offsetWidth;
        index = count - 1;
        applyTransform(true);
        syncChrome();
        return;
      }

      animating = true;
      index = to;
      applyTransform(true);
      syncChrome();
    }

    track.addEventListener("transitionend", function (event) {
      if (event.target !== track || event.propertyName !== "transform") return;
      if (index === count) {
        index = 0;
        applyTransform(false);
        void track.offsetWidth;
        track.style.transition = transition;
      }
      animating = false;
      syncChrome();
    });

    function stopAuto() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    function startAuto() {
      stopAuto();
      if (reduced || paused || count < 2) return;
      timer = setInterval(function () {
        go(index + 1);
      }, 5000);
    }

    function pauseAuto() {
      paused = true;
      stopAuto();
    }

    function resumeAuto() {
      paused = false;
      startAuto();
    }

    function userGo(to) {
      go(to);
      stopAuto();
      startAuto();
    }

    if (prev) prev.addEventListener("click", function () { userGo(index === 0 ? -1 : index - 1); });
    if (next) next.addEventListener("click", function () { userGo(index + 1); });
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        userGo(Number(dot.getAttribute("data-gallery-dot")) || 0);
      });
    });

    var startX = 0;
    var deltaX = 0;
    track.addEventListener(
      "pointerdown",
      function (event) {
        if (event.pointerType === "mouse" && event.button !== 0) return;
        if (event.target.closest("button, a, .shot__expand, .lightbox")) return;
        pauseAuto();
        startX = event.clientX;
        deltaX = 0;
        track.setPointerCapture(event.pointerId);
      },
      { passive: true }
    );
    track.addEventListener(
      "pointermove",
      function (event) {
        if (!track.hasPointerCapture(event.pointerId)) return;
        deltaX = event.clientX - startX;
      },
      { passive: true }
    );
    track.addEventListener("pointerup", function (event) {
      if (!track.hasPointerCapture(event.pointerId)) return;
      track.releasePointerCapture(event.pointerId);
      if (Math.abs(deltaX) >= 48) {
        if (deltaX < 0) userGo(index + 1);
        else userGo(index === 0 ? -1 : index - 1);
      } else {
        resumeAuto();
      }
    });

    gallery.addEventListener("keydown", function (event) {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        userGo(index === 0 ? -1 : index - 1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        userGo(index + 1);
      }
    });

    gallery.addEventListener("mouseenter", pauseAuto);
    gallery.addEventListener("mouseleave", resumeAuto);
    gallery.addEventListener("focusin", pauseAuto);
    gallery.addEventListener("focusout", function (event) {
      if (!gallery.contains(event.relatedTarget)) resumeAuto();
    });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stopAuto();
      else if (!paused) startAuto();
    });

    track.style.transition = transition;
    index = 0;
    applyTransform(false);
    syncChrome();
    startAuto();
  });

  /* ---------- Screenshot viewer (filmstrip gallery) ---------- */

  Array.prototype.forEach.call(document.querySelectorAll("[data-shot-viewer]"), function (viewerRoot) {
    var stage = viewerRoot.querySelector("[data-shot-viewer-stage]");
    var frames = Array.prototype.slice.call(viewerRoot.querySelectorAll("[data-shot-viewer-frame]"));
    var tiles = Array.prototype.slice.call(viewerRoot.querySelectorAll("[data-shot-viewer-tile]"));
    var tilesRoot = viewerRoot.querySelector("[data-shot-viewer-tiles]");
    var prevBtn = viewerRoot.querySelector("[data-shot-viewer-prev]");
    var nextBtn = viewerRoot.querySelector("[data-shot-viewer-next]");
    var count = frames.length;
    if (!stage || !count) return;

    var index = 0;
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var autoTimer = null;
    var progressTimer = null;
    var progressStart = 0;
    var paused = false;
    var dragging = false;
    var dragStart = 0;
    var dragDelta = 0;
    var VIEWER_AUTO_MS = 5500;

    function activeTile() {
      return tiles[index] || null;
    }

    function activeProgress() {
      var tile = activeTile();
      return tile ? tile.querySelector("[data-shot-viewer-tile-progress]") : null;
    }

    function scrollTileIntoView() {
      var tile = activeTile();
      if (!tile || !tilesRoot) return;
      var sidebar = viewerRoot.classList.contains("shot-viewer--sidebar");
      if (sidebar) {
        var topOffset = tile.offsetTop - (tilesRoot.clientHeight - tile.offsetHeight) / 2;
        tilesRoot.scrollTo({ top: topOffset, behavior: reduced ? "auto" : "smooth" });
      } else {
        var leftOffset = tile.offsetLeft - (tilesRoot.clientWidth - tile.offsetWidth) / 2;
        tilesRoot.scrollTo({ left: leftOffset, behavior: reduced ? "auto" : "smooth" });
      }
    }

    function syncTiles() {
      tiles.forEach(function (tile, tileIndex) {
        var active = tileIndex === index;
        tile.classList.toggle("is-active", active);
        tile.setAttribute("aria-selected", active ? "true" : "false");
        var progress = tile.querySelector("[data-shot-viewer-tile-progress]");
        if (progress && !active) progress.style.width = "0%";
      });
      scrollTileIntoView();
    }

    function applyState(previousIndex) {
      frames.forEach(function (frame, frameIndex) {
        var isActive = frameIndex === index;
        frame.classList.remove("is-exiting");
        if (frameIndex === previousIndex && previousIndex !== index) {
          frame.classList.add("is-exiting");
        }
        frame.classList.toggle("is-active", isActive);
        frame.setAttribute("aria-hidden", isActive ? "false" : "true");
      });
      syncTiles();
      if (typeof syncPreview === "function") syncPreview();

      if (!reduced && previousIndex !== undefined && previousIndex !== index) {
        window.setTimeout(function () {
          frames.forEach(function (frame) {
            frame.classList.remove("is-exiting");
          });
        }, 520);
      }
    }

    function setIndex(next, userInitiated) {
      if (count < 2) return;
      var newIndex = ((next % count) + count) % count;
      if (newIndex === index) return;
      if (userInitiated) restartAuto();
      var previousIndex = index;
      index = newIndex;
      applyState(previousIndex);
    }

    function advance() {
      setIndex(index + 1, false);
    }

    function stopAuto() {
      if (autoTimer) {
        clearInterval(autoTimer);
        autoTimer = null;
      }
      if (progressTimer) {
        cancelAnimationFrame(progressTimer);
        progressTimer = null;
      }
      tiles.forEach(function (tile) {
        var progress = tile.querySelector("[data-shot-viewer-tile-progress]");
        if (progress) progress.style.width = "0%";
      });
    }

    function tickProgress() {
      var progressBar = activeProgress();
      if (!progressBar || paused || reduced || count < 2) return;
      var elapsed = Date.now() - progressStart;
      var pct = Math.min(100, (elapsed / VIEWER_AUTO_MS) * 100);
      progressBar.style.width = pct + "%";
      if (elapsed < VIEWER_AUTO_MS) progressTimer = requestAnimationFrame(tickProgress);
    }

    function startAuto() {
      stopAuto();
      if (reduced || paused || count < 2) return;
      progressStart = Date.now();
      tickProgress();
      autoTimer = setInterval(function () {
        if (!paused && !dragging) advance();
        progressStart = Date.now();
      }, VIEWER_AUTO_MS);
    }

    function restartAuto() {
      stopAuto();
      startAuto();
    }

    function pauseAuto() {
      paused = true;
      stopAuto();
    }

    function resumeAuto() {
      paused = false;
      startAuto();
    }

    tiles.forEach(function (tile) {
      tile.addEventListener("click", function () {
        setIndex(Number(tile.getAttribute("data-shot-viewer-tile")) || 0, true);
      });
    });

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        setIndex(index - 1, true);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        setIndex(index + 1, true);
      });
    }

    stage.addEventListener(
      "pointerdown",
      function (event) {
        if (count < 2) return;
        if (event.pointerType === "mouse" && event.button !== 0) return;
        if (event.target.closest("button, a, .shot__expand, .lightbox")) return;
        dragging = true;
        dragStart = event.clientX;
        dragDelta = 0;
        stage.classList.add("is-dragging");
        stage.setPointerCapture(event.pointerId);
        pauseAuto();
      },
      { passive: true }
    );
    stage.addEventListener(
      "pointermove",
      function (event) {
        if (!stage.hasPointerCapture(event.pointerId)) return;
        dragDelta = event.clientX - dragStart;
      },
      { passive: true }
    );
    stage.addEventListener("pointerup", function (event) {
      if (!stage.hasPointerCapture(event.pointerId)) return;
      stage.releasePointerCapture(event.pointerId);
      stage.classList.remove("is-dragging");
      dragging = false;
      if (Math.abs(dragDelta) >= 42) {
        if (dragDelta < 0) setIndex(index + 1, true);
        else setIndex(index - 1, true);
      } else {
        resumeAuto();
      }
    });

    viewerRoot.addEventListener("keydown", function (event) {
      if (count < 2) return;
      var sidebar = viewerRoot.classList.contains("shot-viewer--sidebar");
      if (event.key === "ArrowLeft" || (sidebar && event.key === "ArrowUp")) {
        event.preventDefault();
        setIndex(index - 1, true);
      } else if (event.key === "ArrowRight" || (sidebar && event.key === "ArrowDown")) {
        event.preventDefault();
        setIndex(index + 1, true);
      }
    });

    viewerRoot.addEventListener("mouseenter", pauseAuto);
    viewerRoot.addEventListener("mouseleave", resumeAuto);
    viewerRoot.addEventListener("focusin", pauseAuto);
    viewerRoot.addEventListener("focusout", function (event) {
      if (!viewerRoot.contains(event.relatedTarget)) resumeAuto();
    });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stopAuto();
      else if (!paused) startAuto();
    });

    var shell = viewerRoot.querySelector(".shot-viewer__shell");
    var preview = null;
    var previewImg = null;
    var hoverCapable = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    var sidebarViewer = viewerRoot.classList.contains("shot-viewer--sidebar");
    var syncPreview;

    if (shell && sidebarViewer && !shell.querySelector(".shot-viewer__hint")) {
      var hint = document.createElement("p");
      hint.className = "shot-viewer__hint";
      hint.textContent = hoverCapable ? "Hover to enlarge" : "Tap expand for full size";
      shell.appendChild(hint);
    }

    function activeImage() {
      var frame = frames[index];
      return frame ? frame.querySelector(".shot-viewer__image") : null;
    }

    if (shell && sidebarViewer && hoverCapable) {
      preview = document.createElement("div");
      preview.className = "shot-viewer__preview";
      preview.setAttribute("aria-hidden", "true");
      preview.innerHTML = '<img alt="" data-shot-viewer-preview-img />';
      shell.appendChild(preview);
      previewImg = preview.querySelector("[data-shot-viewer-preview-img]");

      syncPreview = function () {
        if (!previewImg) return;
        var img = activeImage();
        if (!img) return;
        previewImg.src = img.currentSrc || img.src;
        previewImg.alt = img.alt || "";
      };

      shell.addEventListener("mouseenter", function () {
        syncPreview();
        preview.classList.add("is-visible");
      });
      shell.addEventListener("mouseleave", function () {
        preview.classList.remove("is-visible");
      });
    }

    applyState(index);
    startAuto();
  });

  /* ---------- 3D spotlight screenshot gallery ---------- */

  Array.prototype.forEach.call(document.querySelectorAll("[data-shot-spotlight]"), function (spotlight) {
    var stage = spotlight.querySelector("[data-spotlight-stage]");
    var ring = spotlight.querySelector("[data-spotlight-ring]");
    var items = Array.prototype.slice.call(spotlight.querySelectorAll("[data-spotlight-item]"));
    var dotsRoot = spotlight.querySelector("[data-spotlight-dots]");
    var prevBtn = spotlight.querySelector("[data-spotlight-prev]");
    var nextBtn = spotlight.querySelector("[data-spotlight-next]");
    var meta = spotlight.querySelector(".shot-spotlight__meta");
    var indexEl = spotlight.querySelector("[data-spotlight-index]");
    var titleEl = spotlight.querySelector("[data-spotlight-title]");
    var captionEl = spotlight.querySelector("[data-spotlight-caption]");
    var progressBar = spotlight.querySelector("[data-spotlight-progress]");
    var count = items.length;
    if (!stage || !ring || !count) return;

    var index = 0;
    var displayAngle = 0;
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var compact = function () {
      return window.matchMedia("(max-width: 900px)").matches;
    };
    var autoTimer = null;
    var progressTimer = null;
    var progressStart = 0;
    var paused = false;
    var dragging = false;
    var dragStart = 0;
    var dragDelta = 0;
    var SPOT_AUTO_MS = 5500;

    function stepSize() {
      return 360 / count;
    }

    function layout() {
      var angle = stepSize();
      spotlight.style.setProperty("--spot-angle", angle + "deg");
      var cardWidth = Math.min(352, Math.max(220, stage.clientWidth * 0.42));
      var radius = Math.round(cardWidth / (2 * Math.tan(Math.PI / count)) + 56);
      radius = Math.max(220, Math.min(radius, 420));
      spotlight.style.setProperty("--spot-card-width", cardWidth + "px");
      spotlight.style.setProperty("--spot-radius", radius + "px");
      items.forEach(function (item, itemIndex) {
        item.style.setProperty("--spot-i", String(itemIndex));
      });
    }

    function isAdjacent(itemIndex) {
      var left = (index - 1 + count) % count;
      var right = (index + 1) % count;
      return itemIndex === left || itemIndex === right;
    }

    function labelFor(item) {
      return item.getAttribute("data-spotlight-title") || "";
    }

    function buildDots() {
      if (!dotsRoot || count < 2) return;
      dotsRoot.replaceChildren();
      items.forEach(function (item, itemIndex) {
        var dot = document.createElement("button");
        dot.type = "button";
        dot.className = "shot-spotlight__dot";
        dot.setAttribute("role", "tab");
        dot.setAttribute("aria-label", labelFor(item) || "Screenshot " + (itemIndex + 1));
        dot.addEventListener("click", function () {
          setIndex(itemIndex, true);
        });
        dotsRoot.appendChild(dot);
      });
    }

    function syncDots() {
      if (!dotsRoot) return;
      Array.prototype.forEach.call(dotsRoot.querySelectorAll(".shot-spotlight__dot"), function (dot, dotIndex) {
        var active = dotIndex === index;
        dot.classList.toggle("is-active", active);
        dot.setAttribute("aria-selected", active ? "true" : "false");
      });
    }

    function syncMeta() {
      var item = items[index];
      if (!item) return;
      if (indexEl) {
        indexEl.textContent =
          count > 1
            ? String(index + 1).padStart(2, "0") + " / " + String(count).padStart(2, "0")
            : "01";
      }
      if (titleEl) titleEl.textContent = item.getAttribute("data-spotlight-title") || "";
      if (captionEl) captionEl.textContent = item.getAttribute("data-spotlight-caption") || "";
    }

    function applyState() {
      spotlight.style.setProperty("--spot-rotate", displayAngle + "deg");
      items.forEach(function (item, itemIndex) {
        var isFront = itemIndex === index;
        item.classList.toggle("is-front", isFront);
        item.classList.toggle("is-adjacent", isAdjacent(itemIndex));
        item.setAttribute("aria-hidden", isFront ? "false" : "true");
        var card = item.querySelector(".shot-spotlight__card");
        if (card) card.tabIndex = isFront ? 0 : -1;
      });
      syncDots();
      syncMeta();

      if (compact() && stage) {
        var target = items[index];
        if (target) {
          var offset = target.offsetLeft - (stage.clientWidth - target.offsetWidth) / 2;
          stage.scrollTo({ left: offset, behavior: reduced ? "auto" : "smooth" });
        }
      }
    }

    function flashMeta() {
      if (!meta || reduced) return;
      meta.classList.add("is-changing");
      window.setTimeout(function () {
        meta.classList.remove("is-changing");
      }, 180);
    }

    function setIndex(nextIndex, userInitiated) {
      if (count < 2) return;
      var newIndex = ((nextIndex % count) + count) % count;
      if (userInitiated) restartAuto();
      if (newIndex === index) {
        displayAngle = -index * stepSize();
        applyState();
        return;
      }
      var delta = newIndex - index;
      if (delta > count / 2) delta -= count;
      else if (delta < -count / 2) delta += count;
      displayAngle -= delta * stepSize();
      index = newIndex;
      flashMeta();
      applyState();
    }

    function advance() {
      displayAngle -= stepSize();
      index = (index + 1) % count;
      flashMeta();
      applyState();
    }

    function stopAuto() {
      if (autoTimer) {
        clearInterval(autoTimer);
        autoTimer = null;
      }
      if (progressTimer) {
        cancelAnimationFrame(progressTimer);
        progressTimer = null;
      }
      if (progressBar) progressBar.style.width = "0%";
    }

    function tickProgress() {
      if (!progressBar || paused || reduced || count < 2) return;
      var elapsed = Date.now() - progressStart;
      var pct = Math.min(100, (elapsed / SPOT_AUTO_MS) * 100);
      progressBar.style.width = pct + "%";
      if (elapsed < SPOT_AUTO_MS) {
        progressTimer = requestAnimationFrame(tickProgress);
      }
    }

    function startAuto() {
      stopAuto();
      if (reduced || paused || count < 2) return;
      progressStart = Date.now();
      tickProgress();
      autoTimer = setInterval(function () {
        if (!paused && !dragging) advance();
        progressStart = Date.now();
        if (progressBar) progressBar.style.width = "0%";
      }, SPOT_AUTO_MS);
    }

    function restartAuto() {
      stopAuto();
      startAuto();
    }

    function pauseAuto() {
      paused = true;
      stopAuto();
    }

    function resumeAuto() {
      paused = false;
      startAuto();
    }

    items.forEach(function (item, itemIndex) {
      var card = item.querySelector(".shot-spotlight__card");
      if (!card) return;
      card.addEventListener("click", function () {
        if (itemIndex === index) return;
        if (isAdjacent(itemIndex) || compact()) setIndex(itemIndex, true);
      });
    });

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        setIndex(index - 1, true);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        setIndex(index + 1, true);
      });
    }

    stage.addEventListener(
      "pointerdown",
      function (event) {
        if (count < 2) return;
        if (event.pointerType === "mouse" && event.button !== 0) return;
        if (event.target.closest("button, a, .shot__expand, .lightbox")) return;
        dragging = true;
        dragStart = event.clientX;
        dragDelta = 0;
        ring.classList.add("is-dragging");
        stage.classList.add("is-dragging");
        stage.setPointerCapture(event.pointerId);
        pauseAuto();
      },
      { passive: true }
    );
    stage.addEventListener(
      "pointermove",
      function (event) {
        if (!stage.hasPointerCapture(event.pointerId)) return;
        dragDelta = event.clientX - dragStart;
      },
      { passive: true }
    );
    stage.addEventListener("pointerup", function (event) {
      if (!stage.hasPointerCapture(event.pointerId)) return;
      stage.releasePointerCapture(event.pointerId);
      ring.classList.remove("is-dragging");
      stage.classList.remove("is-dragging");
      dragging = false;
      if (Math.abs(dragDelta) >= 42) {
        if (dragDelta < 0) setIndex(index + 1, true);
        else setIndex(index - 1, true);
      } else {
        resumeAuto();
      }
    });

    spotlight.addEventListener("keydown", function (event) {
      if (count < 2) return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setIndex(index - 1, true);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        setIndex(index + 1, true);
      }
    });

    spotlight.addEventListener("mouseenter", pauseAuto);
    spotlight.addEventListener("mouseleave", resumeAuto);
    spotlight.addEventListener("focusin", pauseAuto);
    spotlight.addEventListener("focusout", function (event) {
      if (!spotlight.contains(event.relatedTarget)) resumeAuto();
    });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stopAuto();
      else if (!paused) startAuto();
    });

    function nearestFromScroll() {
      if (!compact() || !stage) return index;
      var center = stage.scrollLeft + stage.clientWidth / 2;
      var nearest = 0;
      var nearestDistance = Infinity;
      items.forEach(function (item, itemIndex) {
        var itemCenter = item.offsetLeft + item.offsetWidth / 2;
        var distance = Math.abs(itemCenter - center);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearest = itemIndex;
        }
      });
      return nearest;
    }

    if (stage) {
      stage.addEventListener(
        "scroll",
        function () {
          if (!compact()) return;
          var nearest = nearestFromScroll();
          if (nearest !== index) {
            index = nearest;
            displayAngle = -index * stepSize();
            syncDots();
            syncMeta();
          }
        },
        { passive: true }
      );
    }

    layout();
    buildDots();
    displayAngle = -index * stepSize();
    applyState();
    startAuto();
    window.addEventListener("resize", function () {
      layout();
      applyState();
    });
  });

  /* ---------- Trainee Driver progress pill ---------- */

  function launchTraineeHeroFireworks(container, durationMs, originEl) {
    if (!container || container.dataset.fireworksRunning === "true") return;
    container.dataset.fireworksRunning = "true";

    var canvas = document.createElement("canvas");
    canvas.className = "trainee-hero-fireworks__canvas";
    container.appendChild(canvas);
    container.classList.add("is-active");
    container.classList.remove("is-fading");

    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var rockets = [];
    var particles = [];
    var flashes = [];
    var width = 0;
    var height = 0;
    var start = performance.now();
    var launchTimer = null;
    var fadeStart = durationMs - 1200;
    var colors = ["#fbbf24", "#f59e0b", "#fcd34d", "#2dd4bf", "#38bdf8", "#ffffff", "#fb923c"];

    function resize(force) {
      var rect = container.getBoundingClientRect();
      var nextWidth = Math.max(1, rect.width);
      var nextHeight = Math.max(1, rect.height);
      if (!force && nextWidth === width && nextHeight === height) return;
      width = nextWidth;
      height = nextHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function pickColor() {
      return colors[Math.floor(Math.random() * colors.length)];
    }

    function getLaunchOrigin() {
      if (!originEl) {
        return { x: width * 0.18, y: height * 0.72 };
      }
      var containerRect = container.getBoundingClientRect();
      var originRect = originEl.getBoundingClientRect();
      return {
        x: originRect.left + originRect.width * 0.72 - containerRect.left,
        y: originRect.top + originRect.height * 0.5 - containerRect.top,
      };
    }

    function arcPoint(t, x0, y0, x1, y1, cx, cy) {
      var inv = 1 - t;
      return {
        x: inv * inv * x0 + 2 * inv * t * cx + t * t * x1,
        y: inv * inv * y0 + 2 * inv * t * cy + t * t * y1,
      };
    }

    function launchRocket() {
      var origin = getLaunchOrigin();
      var targetX = width * (0.16 + Math.random() * 0.68);
      var targetY = height * (0.02 + Math.random() * 0.14);
      var controlX = origin.x + (targetX - origin.x) * 0.16;
      var controlY = origin.y - height * (0.22 + Math.random() * 0.16);
      rockets.push({
        sx: origin.x,
        sy: origin.y,
        tx: targetX,
        ty: targetY,
        cx: controlX,
        cy: controlY,
        x: origin.x,
        y: origin.y,
        t: 0,
        speed: 0.008 + Math.random() * 0.005,
        color: pickColor(),
        trail: [],
      });
    }

    function explode(x, y, color) {
      flashes.push({ x: x, y: y, radius: 14, life: 1, color: color });
      var count = 42 + Math.floor(Math.random() * 18);
      for (var i = 0; i < count; i += 1) {
        var angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.24;
        var speed = 1.2 + Math.random() * 2.6;
        particles.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.35,
          life: 1,
          decay: 0.0015 + Math.random() * 0.002,
          fallDecay: 0.0035 + Math.random() * 0.003,
          color: Math.random() > 0.14 ? color : pickColor(),
          size: 2.2 + Math.random() * 2.4,
          gravity: 0.022 + Math.random() * 0.014,
          burstY: y,
          falling: false,
        });
      }
    }

    function drawRocket(rocket, alpha) {
      var trail = rocket.trail;
      trail.push({ x: rocket.x, y: rocket.y });
      if (trail.length > 18) trail.shift();

      ctx.globalCompositeOperation = "lighter";
      for (var i = 0; i < trail.length; i += 1) {
        var point = trail[i];
        var trailAlpha = alpha * ((i + 1) / trail.length) * 0.72;
        ctx.beginPath();
        ctx.fillStyle = rocket.color;
        ctx.globalAlpha = trailAlpha;
        ctx.arc(point.x, point.y, 1.2 + i * 0.12, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.shadowBlur = 14;
      ctx.shadowColor = rocket.color;
      ctx.beginPath();
      ctx.fillStyle = "#ffffff";
      ctx.globalAlpha = alpha;
      ctx.arc(rocket.x, rocket.y, 3.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.fillStyle = rocket.color;
      ctx.globalAlpha = alpha * 0.95;
      ctx.arc(rocket.x, rocket.y, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    function frame(now) {
      var elapsed = now - start;
      var fade =
        elapsed >= fadeStart ? Math.max(0, 1 - (elapsed - fadeStart) / (durationMs - fadeStart)) : 1;

      if (elapsed >= durationMs - 1200 && !container.classList.contains("is-fading")) {
        container.classList.add("is-fading");
      }

      resize();
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";

      for (var r = rockets.length - 1; r >= 0; r -= 1) {
        var rocket = rockets[r];
        rocket.t += rocket.speed;
        var point = arcPoint(rocket.t, rocket.sx, rocket.sy, rocket.tx, rocket.ty, rocket.cx, rocket.cy);
        rocket.x = point.x;
        rocket.y = point.y;
        drawRocket(rocket, fade);

        if (rocket.t >= 1) {
          explode(rocket.tx, rocket.ty, rocket.color);
          rockets.splice(r, 1);
        }
      }

      for (var f = flashes.length - 1; f >= 0; f -= 1) {
        var flash = flashes[f];
        flash.life -= 0.06;
        flash.radius += 3.2;
        if (flash.life <= 0) {
          flashes.splice(f, 1);
          continue;
        }
        var gradient = ctx.createRadialGradient(flash.x, flash.y, 0, flash.x, flash.y, flash.radius);
        gradient.addColorStop(0, flash.color);
        gradient.addColorStop(0.45, "rgba(255,255,255,0.45)");
        gradient.addColorStop(1, "rgba(255,255,255,0)");
        ctx.globalAlpha = flash.life * 0.72 * fade;
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(flash.x, flash.y, flash.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      for (var p = particles.length - 1; p >= 0; p -= 1) {
        var particle = particles[p];
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += particle.gravity;
        particle.vx *= 0.993;

        if (!particle.falling && particle.vy > 0.15 && particle.y > particle.burstY + 4) {
          particle.falling = true;
        }

        if (particle.falling) {
          particle.life -= particle.fallDecay;
        } else {
          particle.life -= particle.decay;
        }

        if (particle.life <= 0 || particle.y > height + 32) {
          particles.splice(p, 1);
          continue;
        }

        var fallFade =
          particle.falling && particle.y > particle.burstY + height * 0.14
            ? Math.max(0.45, 1 - (particle.y - particle.burstY - height * 0.14) / (height * 0.78))
            : 1;

        ctx.shadowBlur = particle.falling ? 8 : 12;
        ctx.shadowColor = particle.color;
        ctx.globalAlpha = particle.life * fade * fallFade;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * Math.max(0.35, particle.life), 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";

      if (elapsed < durationMs) {
        window.requestAnimationFrame(frame);
      } else {
        if (launchTimer) window.clearInterval(launchTimer);
        container.classList.remove("is-active", "is-fading");
        container.dataset.fireworksRunning = "false";
        if (canvas.parentNode === container) container.removeChild(canvas);
      }
    }

    resize(true);
    launchRocket();
    launchTimer = window.setInterval(function () {
      if (performance.now() - start < durationMs - 1100) launchRocket();
    }, 580);

    window.requestAnimationFrame(frame);
    window.addEventListener(
      "resize",
      function onResize() {
        if (container.dataset.fireworksRunning !== "true") {
          window.removeEventListener("resize", onResize);
          return;
        }
        resize(true);
      },
      { passive: true }
    );
  }

  Array.prototype.forEach.call(document.querySelectorAll("[data-trainee-progress-pill]"), function (pill) {
    var trackFill = pill.querySelector(".trainee-progress-pill__track-fill");
    if (!trackFill) return;

    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var started = false;

    function complete() {
      pill.classList.remove("is-running");
      pill.classList.add("is-complete");
      var outcome = pill.querySelector(".trainee-progress-pill__outcome");
      if (outcome) outcome.removeAttribute("aria-hidden");
      if (!reduced) {
        var grid = pill.closest(".page-hero__trainee-grid");
        var fireworksRoot = grid && grid.querySelector("[data-trainee-hero-fireworks]");
        var qualifiedLabel = pill.querySelector(".trainee-progress-pill__label--to");
        if (fireworksRoot) launchTraineeHeroFireworks(fireworksRoot, 8000, qualifiedLabel);
      }
    }

    function start() {
      if (started) return;
      started = true;
      if (reduced) {
        complete();
        return;
      }
      pill.classList.add("is-running");
      trackFill.addEventListener("animationend", complete, { once: true });
    }

    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              start();
              observer.disconnect();
            }
          });
        },
        { threshold: 0.35 }
      );
      observer.observe(pill);
    } else {
      start();
    }
  });

  /* ---------- Trainee Driver vertical journey ---------- */

  Array.prototype.forEach.call(document.querySelectorAll("[data-trainee-journey]"), function (journey) {
    var steps = Array.prototype.slice.call(journey.querySelectorAll("[data-trainee-step]"));
    var railLinks = Array.prototype.slice.call(journey.querySelectorAll("[data-trainee-rail]"));
    var railWrap = journey.querySelector(".trainee-journey__rail-wrap");
    var progress = journey.querySelector("[data-trainee-rail-progress]");
    var count = Number(journey.getAttribute("data-trainee-count")) || steps.length;
    var active = 0;
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var rotateMs = 6000;
    var autoTimer = null;
    var autoPaused = false;
    var userScrolled = false;
    var scrollLock = false;
    var programmaticScrollUntil = 0;

    journey.style.setProperty("--trainee-rotate-duration", rotateMs + "ms");

    function restartTimer(link) {
      railLinks.forEach(function (railLink) {
        var fill = railLink.querySelector("[data-trainee-rail-timer-fill]");
        if (!fill) return;
        fill.style.animation = "none";
        void fill.offsetWidth;
        fill.style.animation = "";
      });
      if (link && link.classList.contains("is-active") && !reduced && !autoPaused && !userScrolled) {
        var fill = link.querySelector("[data-trainee-rail-timer-fill]");
        if (fill) fill.style.animation = "";
      }
    }

    function scrollInset() {
      var chrome = document.querySelector(".site-chrome");
      var chromeBottom = chrome ? chrome.getBoundingClientRect().bottom : 0;
      var railHeight = railWrap ? railWrap.getBoundingClientRect().height : 0;
      return chromeBottom + railHeight + 36;
    }

    function updateScrollInset() {
      var inset = scrollInset();
      journey.style.setProperty("--trainee-scroll-inset", inset + "px");
      return inset;
    }

    function scrollToStep(index) {
      var step = steps[index];
      if (!step) return false;
      var anchor =
        step.querySelector(".trainee-journey__content") ||
        step.querySelector(".trainee-journey__head") ||
        step;
      var rect = anchor.getBoundingClientRect();
      var inset = updateScrollInset();
      var targetY = window.scrollY + rect.top - inset;
      if (rect.top >= inset - 4 && rect.top <= inset + 24) return false;
      programmaticScrollUntil = Date.now() + 1200;
      window.scrollTo({ top: Math.max(0, targetY), behavior: reduced ? "auto" : "smooth" });
      return true;
    }

    updateScrollInset();
    window.addEventListener("resize", updateScrollInset);

    window.addEventListener(
      "scroll",
      function () {
        if (Date.now() < programmaticScrollUntil) return;
        if (userScrolled) return;
        var rect = journey.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        userScrolled = true;
        stopAutoRotate();
      },
      { passive: true }
    );

    function stopAutoRotate() {
      if (autoTimer) {
        window.clearTimeout(autoTimer);
        autoTimer = null;
      }
    }

    function releaseScrollLock() {
      scrollLock = false;
      startAutoRotate();
    }

    function startAutoRotate() {
      if (reduced || autoPaused || userScrolled || scrollLock) return;
      stopAutoRotate();
      restartTimer(railLinks[active]);
      autoTimer = window.setTimeout(function () {
        var next = (active + 1) % steps.length;
        goToStep(next, true);
      }, rotateMs);
    }

    function sync(index) {
      active = index;
      railLinks.forEach(function (link, i) {
        if (i === index) link.classList.add("is-active");
        else link.classList.remove("is-active");
      });
      steps.forEach(function (step, i) {
        if (i === index) step.classList.add("is-active");
        else step.classList.remove("is-active");
      });
      if (progress) {
        var percent = ((index + 1) / count) * 100;
        progress.style.width = percent + "%";
        progress.style.height = "100%";
        journey.style.setProperty("--trainee-rail-width", percent + "%");
      }
      var activeLink = railLinks[index];
      if (activeLink && window.matchMedia("(max-width: 960px)").matches) {
        activeLink.scrollIntoView({ behavior: reduced ? "auto" : "smooth", inline: "center", block: "nearest" });
      }
      restartTimer(activeLink);
    }

    function goToStep(index, fromAuto) {
      if (index < 0 || index >= steps.length) return;
      var prevActive = active;
      scrollLock = true;
      sync(index);
      var shouldScroll = !fromAuto || index > prevActive;
      var didScroll = shouldScroll ? scrollToStep(index) : false;

      if (reduced || !didScroll) {
        releaseScrollLock();
      } else {
        var released = false;
        function tryRelease() {
          if (released) return;
          released = true;
          releaseScrollLock();
        }
        window.setTimeout(tryRelease, 1200);
        window.addEventListener("scrollend", tryRelease, { once: true });
      }
    }

    function resolveVisibleStepIndex(visible) {
      if (!visible.length) return null;
      var index = Number(visible[0].target.getAttribute("data-trainee-step"));
      if (Number.isNaN(index)) return null;
      if (index < active) {
        var forwardEntry = visible.find(function (entry) {
          return Number(entry.target.getAttribute("data-trainee-step")) >= active;
        });
        if (forwardEntry) {
          index = Number(forwardEntry.target.getAttribute("data-trainee-step"));
        }
      }
      return index;
    }

    if ("IntersectionObserver" in window && steps.length) {
      var stepObserver = new IntersectionObserver(
        function (entries) {
          if (scrollLock) return;
          var visible = entries
            .filter(function (entry) {
              return entry.isIntersecting;
            })
            .sort(function (a, b) {
              return b.intersectionRatio - a.intersectionRatio;
            });
          var index = resolveVisibleStepIndex(visible);
          if (index === null || index === active) return;
          sync(index);
          startAutoRotate();
        },
        { rootMargin: "-24% 0px -40% 0px", threshold: [0.2, 0.35, 0.5, 0.65] }
      );
      steps.forEach(function (step) {
        stepObserver.observe(step);
      });

      var journeyObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting && entry.intersectionRatio > 0.2) startAutoRotate();
            else stopAutoRotate();
          });
        },
        { threshold: [0, 0.2, 0.45] }
      );
      journeyObserver.observe(journey);
    } else {
      sync(0);
    }

    journey.addEventListener("mouseenter", function () {
      autoPaused = true;
      stopAutoRotate();
    });

    journey.addEventListener("mouseleave", function () {
      autoPaused = false;
      startAutoRotate();
    });

    journey.addEventListener("focusin", function () {
      autoPaused = true;
      stopAutoRotate();
    });

    journey.addEventListener("focusout", function (event) {
      if (journey.contains(event.relatedTarget)) return;
      autoPaused = false;
      startAutoRotate();
    });

    railLinks.forEach(function (link) {
      link.addEventListener("click", function (event) {
        event.preventDefault();
        var index = Number(link.getAttribute("data-trainee-rail"));
        goToStep(index, false);
      });
    });

    sync(0);

    steps.forEach(function (step) {
      var subtabs = Array.prototype.slice.call(step.querySelectorAll("[data-trainee-subtab]"));
      if (!subtabs.length) return;

      var figures = Array.prototype.slice.call(step.querySelectorAll("[data-trainee-shot]"));
      if (!figures.length) {
        figures = Array.prototype.slice.call(step.querySelectorAll(".trainee-journey__figure"));
      }

      function showSub(id) {
        subtabs.forEach(function (subtab) {
          var activeTab = subtab.getAttribute("data-trainee-subtab") === id;
          subtab.setAttribute("aria-selected", activeTab ? "true" : "false");
        });
        figures.forEach(function (figure, figureIndex) {
          var shotId = figure.getAttribute("data-trainee-shot");
          var isActive = shotId ? shotId === id : figureIndex === Number(id) || figureIndex === 0;
          if (isActive) {
            figure.hidden = false;
            figure.removeAttribute("aria-hidden");
          } else {
            figure.hidden = true;
            figure.setAttribute("aria-hidden", "true");
          }
        });
      }

      subtabs.forEach(function (subtab) {
        subtab.addEventListener("click", function () {
          showSub(subtab.getAttribute("data-trainee-subtab"));
        });
      });
    });

    Array.prototype.forEach.call(journey.querySelectorAll("[data-schedule-flow]"), function (flow) {
      var steps = Array.prototype.slice.call(flow.querySelectorAll("[data-schedule-flow-step]"));
      if (!steps.length) return;

      var timer = null;
      var index = 0;
      var parentStep = flow.closest("[data-trainee-step]");
      var visual = flow.closest(".trainee-journey__visual");

      function setActive(i) {
        index = i;
        var progress = steps.length > 1 ? (i / (steps.length - 1)) * 100 : 100;
        flow.setAttribute("data-schedule-flow-index", String(i));
        flow.style.setProperty("--flow-progress", progress + "%");
        if (visual) visual.setAttribute("data-schedule-flow-index", String(i));
        steps.forEach(function (step, stepIndex) {
          var on = stepIndex === i;
          step.classList.toggle("is-active", on);
          step.setAttribute("aria-pressed", on ? "true" : "false");
        });
      }

      function stopCycle() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      function startCycle() {
        if (reduced) {
          setActive(steps.length - 1);
          return;
        }
        stopCycle();
        timer = window.setInterval(function () {
          setActive((index + 1) % steps.length);
        }, 3500);
      }

      setActive(0);

      if (parentStep && "IntersectionObserver" in window) {
        var flowObserver = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting && entry.intersectionRatio > 0.3) startCycle();
              else stopCycle();
            });
          },
          { threshold: [0, 0.3, 0.5] }
        );
        flowObserver.observe(parentStep);
      } else {
        startCycle();
      }

      steps.forEach(function (step, stepIndex) {
        step.addEventListener("click", function () {
          stopCycle();
          setActive(stepIndex);
        });
        step.addEventListener("mouseenter", stopCycle);
        step.addEventListener("mouseleave", function () {
          if (parentStep && parentStep.classList.contains("is-active")) startCycle();
        });
      });
    });
  });

  /* ---------- CDP Monitoring experience ---------- */

  Array.prototype.forEach.call(document.querySelectorAll("[data-cdp-experience]"), function (command) {
    var chapters = Array.prototype.slice.call(command.querySelectorAll("[data-cdp-chapter]"));
    var railLinks = Array.prototype.slice.call(command.querySelectorAll("[data-cdp-rail]"));
    var lifecycleSteps = Array.prototype.slice.call(command.querySelectorAll("[data-cdp-lifecycle]"));
    var lifecycleProgress = command.querySelector("[data-cdp-lifecycle-progress]");
    var count = chapters.length;
    var active = 0;
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function sync(index) {
      active = index;
      var progress = count > 1 ? (index / (count - 1)) * 100 : 100;

      railLinks.forEach(function (link, i) {
        link.classList.toggle("is-active", i === index);
      });
      chapters.forEach(function (chapter, i) {
        chapter.classList.toggle("is-active", i === index);
      });
      lifecycleSteps.forEach(function (step, i) {
        step.classList.toggle("is-active", i === index);
        step.setAttribute("aria-pressed", i === index ? "true" : "false");
      });
      if (lifecycleProgress) lifecycleProgress.style.width = progress + "%";

      var activeLink = railLinks[index];
      if (activeLink && window.matchMedia("(max-width: 960px)").matches) {
        activeLink.scrollIntoView({ behavior: reduced ? "auto" : "smooth", inline: "center", block: "nearest" });
      }
    }

    if ("IntersectionObserver" in window && chapters.length) {
      var observer = new IntersectionObserver(
        function (entries) {
          var visible = entries
            .filter(function (entry) {
              return entry.isIntersecting;
            })
            .sort(function (a, b) {
              return b.intersectionRatio - a.intersectionRatio;
            });
          if (!visible.length) return;
          var chapter = visible[0].target;
          var index = Number(chapter.getAttribute("data-cdp-chapter"));
          if (!Number.isNaN(index) && index !== active) sync(index);
        },
        { rootMargin: "-18% 0px -50% 0px", threshold: [0.2, 0.35, 0.5, 0.65] }
      );
      chapters.forEach(function (chapter) {
        observer.observe(chapter);
      });
    } else {
      sync(0);
    }

    railLinks.forEach(function (link) {
      link.addEventListener("click", function (event) {
        var index = Number(link.getAttribute("data-cdp-rail"));
        var target = chapters[index];
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
        sync(index);
      });
    });

    lifecycleSteps.forEach(function (step) {
      step.addEventListener("click", function () {
        var index = Number(step.getAttribute("data-cdp-lifecycle"));
        var target = chapters[index];
        if (!target) return;
        target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
        sync(index);
      });
    });

    Array.prototype.forEach.call(command.querySelectorAll("[data-cdp-compare]"), function (compare) {
      var tabs = Array.prototype.slice.call(compare.querySelectorAll("[data-cdp-compare-tab]"));
      var panels = Array.prototype.slice.call(compare.querySelectorAll("[data-cdp-compare-panel]"));

      function show(id) {
        tabs.forEach(function (tab) {
          var on = tab.getAttribute("data-cdp-compare-tab") === id;
          tab.setAttribute("aria-selected", on ? "true" : "false");
        });
        panels.forEach(function (panel) {
          var on = panel.getAttribute("data-cdp-compare-panel") === id;
          if (on) {
            panel.hidden = false;
            panel.removeAttribute("aria-hidden");
          } else {
            panel.hidden = true;
            panel.setAttribute("aria-hidden", "true");
          }
        });
      }

      tabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
          show(tab.getAttribute("data-cdp-compare-tab"));
        });
      });
    });

    Array.prototype.forEach.call(command.querySelectorAll("[data-cdp-roles]"), function (roles) {
      var buttons = Array.prototype.slice.call(roles.querySelectorAll("[data-cdp-role]"));
      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          buttons.forEach(function (item) {
            item.classList.remove("is-active");
            item.setAttribute("aria-pressed", "false");
          });
          button.classList.add("is-active");
          button.setAttribute("aria-pressed", "true");
        });
      });
    });

    sync(0);
  });
})();

(function () {
  var PHASE_ONE_MS = 2700;
  var PHASE_TWO_MS = 2700;
  var RESTART_DELAY_MS = 5000;
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var cycles = new WeakMap();

  function isScanPanelVisible(root) {
    var panel = root.closest("[data-gallery-scan-panel]");
    return !panel || !panel.hidden;
  }

  function resetLicenceCardScan(root) {
    var status = root.querySelector("[data-licence-scan-status]");
    if (!status) return;
    root.classList.remove("is-success");
    status.textContent = "Reading licence number and dates…";
  }

  function stopLicenceCardScan(root) {
    var timers = cycles.get(root);
    if (timers) {
      timers.forEach(clearTimeout);
      cycles.delete(root);
    }
    resetLicenceCardScan(root);
  }

  function startLicenceCardScan(root) {
    stopLicenceCardScan(root);
    if (!isScanPanelVisible(root)) return;

    var status = root.querySelector("[data-licence-scan-status]");
    if (!status) return;

    var timers = [];

    function scheduleRestart() {
      timers.push(
        window.setTimeout(function () {
          if (isScanPanelVisible(root)) startLicenceCardScan(root);
        }, RESTART_DELAY_MS)
      );
    }

    function showSuccess() {
      status.textContent = "Licence verified as compliant";
      root.classList.add("is-success");
      scheduleRestart();
    }

    if (reducedMotion) {
      showSuccess();
      cycles.set(root, timers);
      return;
    }

    timers.push(
      window.setTimeout(function () {
        status.textContent = "Detecting language and 9b restrictions…";
      }, PHASE_ONE_MS)
    );
    timers.push(
      window.setTimeout(function () {
        showSuccess();
      }, PHASE_ONE_MS + PHASE_TWO_MS)
    );
    cycles.set(root, timers);
  }

  window.startLicenceCardScan = startLicenceCardScan;
  window.stopLicenceCardScan = stopLicenceCardScan;
  window.restartLicenceCardScans = function () {
    Array.prototype.forEach.call(document.querySelectorAll("[data-licence-card-scan]"), function (root) {
      if (isScanPanelVisible(root)) startLicenceCardScan(root);
    });
  };

  Array.prototype.forEach.call(document.querySelectorAll("[data-licence-card-scan]"), function (root) {
    if (!("IntersectionObserver" in window)) {
      startLicenceCardScan(root);
      return;
    }

    new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && isScanPanelVisible(root)) startLicenceCardScan(root);
          else stopLicenceCardScan(root);
        });
      },
      { threshold: 0.45 }
    ).observe(root);
  });
})();

(function () {
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function setScanTitleReveal(el, text) {
    if (!el || !text) return;

    el.classList.add("scan-title-reveal");
    el.setAttribute("aria-label", text);

    if (reducedMotion) {
      el.textContent = text;
      return;
    }

    var track = document.createElement("span");
    track.className = "scan-title-reveal__track";

    var focus = document.createElement("span");
    focus.className = "scan-title-reveal__focus";
    focus.setAttribute("aria-hidden", "true");
    focus.innerHTML =
      '<span class="scan-title-reveal__star-glow"></span>' +
      '<span class="scan-title-reveal__star-rays"></span>' +
      '<span class="scan-title-reveal__star"></span>';

    var chars = document.createElement("span");
    chars.className = "scan-title-reveal__chars";
    chars.textContent = text;

    track.appendChild(focus);
    track.appendChild(chars);
    el.replaceChildren(track);
  }

  window.setScanTitleReveal = setScanTitleReveal;

  Array.prototype.forEach.call(document.querySelectorAll("[data-scan-title]"), function (el) {
    var text = el.getAttribute("aria-label") || el.textContent.trim();
    if (text) setScanTitleReveal(el, text);
  });
})();

(function () {
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  Array.prototype.forEach.call(document.querySelectorAll("[data-verify-scan-video]"), function (video) {
    var loops = 0;
    var maxLoops = video.hasAttribute("loop")
      ? Infinity
      : Number(video.getAttribute("data-max-loops")) || 3;

    function tryPlay() {
      if (reducedMotion || loops >= maxLoops) return;
      video.play().catch(function () {});
    }

    if (!video.hasAttribute("loop")) {
      video.addEventListener("ended", function () {
        loops += 1;
        if (loops < maxLoops) {
          video.currentTime = 0;
          tryPlay();
        }
      });
    }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) tryPlay();
            else video.pause();
          });
        },
        { threshold: 0.35 }
      ).observe(video);
    } else {
      tryPlay();
    }
  });
})();

(function () {
  Array.prototype.forEach.call(document.querySelectorAll("[data-verify-report]"), function (root) {
    var picks = Array.prototype.slice.call(root.querySelectorAll("[data-report-pick]"));
    var main = root.querySelector("[data-report-main]");
    var caption = root.querySelector("[data-report-caption]");
    var counter = root.querySelector("[data-report-counter]");
    var progress = root.querySelector("[data-report-progress]");
    if (!picks.length || !main) return;

    var index = 0;

    function show(nextIndex) {
      index = nextIndex;
      var pick = picks[index];

      picks.forEach(function (item, itemIndex) {
        var active = itemIndex === index;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-selected", String(active));
        item.tabIndex = active ? 0 : -1;
      });

      if (progress) {
        progress.style.width = ((index + 1) / picks.length) * 100 + "%";
      }
      if (counter) {
        counter.textContent = String(index + 1);
      }

      root.classList.add("is-swapping");
      window.setTimeout(function () {
        main.src = pick.dataset.src;
        main.alt = pick.dataset.alt || "";
        if (pick.dataset.width) main.width = Number(pick.dataset.width);
        if (pick.dataset.height) main.height = Number(pick.dataset.height);
        if (caption) caption.textContent = pick.dataset.caption || "";
        root.classList.remove("is-swapping");
      }, 120);
    }

    picks.forEach(function (pick, pickIndex) {
      pick.tabIndex = pick.classList.contains("is-active") ? 0 : -1;
      pick.addEventListener("click", function () {
        show(pickIndex);
      });
      pick.addEventListener("keydown", function (event) {
        var step = event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : event.key === "ArrowUp" || event.key === "ArrowLeft" ? -1 : 0;
        if (!step) return;
        event.preventDefault();
        var next = (pickIndex + step + picks.length) % picks.length;
        picks[next].focus();
        show(next);
      });
    });

    show(0);
  });
})();

(function () {
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  Array.prototype.forEach.call(document.querySelectorAll("[data-shot-rotate]"), function (root) {
    var stage = root.querySelector("[data-shot-rotate-stage]");
    var panels = Array.prototype.slice.call(root.querySelectorAll("[data-shot-rotate-panel]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-shot-rotate-dot]"));
    var prevBtn = root.querySelector("[data-shot-rotate-prev]");
    var nextBtn = root.querySelector("[data-shot-rotate-next]");
    if (!stage || panels.length < 2) return;

    var interval = Number(root.getAttribute("data-shot-rotate-interval")) || 5000;
    var index = 0;
    var timer = null;
    var paused = false;
    var visible = false;

    function slideHeight(panel) {
      var slide = panel.querySelector("img");
      if (!slide) return 0;
      var width = Number(slide.getAttribute("width")) || slide.naturalWidth || stage.clientWidth;
      var height = Number(slide.getAttribute("height")) || slide.naturalHeight || width * 0.75;
      if (!width) return 0;
      var displayWidth = Math.min(stage.clientWidth, width);
      return Math.max(1, Math.round(displayWidth * (height / width)));
    }

    function syncStage() {
      var activePanel = panels[index];
      if (!activePanel) return;
      stage.style.height = slideHeight(activePanel) + "px";
    }

    function syncDots() {
      dots.forEach(function (dot, dotIndex) {
        var active = dotIndex === index;
        dot.setAttribute("aria-selected", active ? "true" : "false");
        if (active) dot.setAttribute("aria-current", "true");
        else dot.removeAttribute("aria-current");
      });
    }

    function show(nextIndex, userInitiated) {
      index = ((nextIndex % panels.length) + panels.length) % panels.length;
      panels.forEach(function (panel, panelIndex) {
        var active = panelIndex === index;
        panel.classList.toggle("is-active", active);
        panel.setAttribute("aria-hidden", active ? "false" : "true");
      });
      syncDots();
      syncStage();
      if (userInitiated && visible && !paused && !reducedMotion) start();
    }

    function advance() {
      if (paused) return;
      show(index + 1, false);
    }

    function start() {
      stop();
      if (reducedMotion || paused || !visible) return;
      timer = window.setInterval(advance, interval);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    root.addEventListener("mouseenter", function () {
      paused = true;
      stop();
    });

    root.addEventListener("mouseleave", function () {
      paused = false;
      if (visible) start();
    });

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        show(index - 1, true);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        show(index + 1, true);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-shot-rotate-dot")) || 0, true);
      });
    });

    panels.forEach(function (panel) {
      var slide = panel.querySelector("img");
      if (!slide || slide.complete) return;
      slide.addEventListener("load", syncStage);
    });

    window.addEventListener("resize", syncStage);

    if (typeof ResizeObserver !== "undefined") {
      new ResizeObserver(syncStage).observe(stage);
    }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            visible = entry.isIntersecting;
            if (visible) {
              syncStage();
              start();
            } else {
              stop();
            }
          });
        },
        { threshold: 0.35 }
      ).observe(root);
    } else {
      visible = true;
      syncStage();
      start();
    }

    show(0, false);
    requestAnimationFrame(function () {
      requestAnimationFrame(syncStage);
    });
  });
})();

(function () {
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  Array.prototype.forEach.call(document.querySelectorAll("[data-report-roll]"), function (root) {
    var stage = root.querySelector("[data-report-roll-stage]");
    var panels = Array.prototype.slice.call(root.querySelectorAll("[data-report-roll-panel]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-report-roll-dot]"));
    var prevBtn = root.querySelector("[data-report-roll-prev]");
    var nextBtn = root.querySelector("[data-report-roll-next]");
    var stepEl = root.querySelector("[data-report-roll-step]");
    var titleEl = root.querySelector("[data-report-roll-title]");
    var textEl = root.querySelector("[data-report-roll-text]");
    var copyEl = root.querySelector(".report-roll__copy");
    var pauseEl = root.querySelector("[data-report-roll-pause]");
    if (!stage || panels.length < 2) return;

    var interval = Number(root.getAttribute("data-report-roll-interval")) || 5000;
    var index = 0;
    var timer = null;
    var paused = false;
    var visible = false;

    function panelHeight(panel) {
      var img = panel.querySelector("img");
      if (!img) return 0;
      var width = Number(img.getAttribute("width")) || img.naturalWidth || stage.clientWidth;
      var height = Number(img.getAttribute("height")) || img.naturalHeight || width * 0.75;
      if (!width) return 0;
      var displayWidth = Math.min(stage.clientWidth, width);
      return Math.max(1, Math.round(displayWidth * (height / width)));
    }

    function syncStage() {
      var panel = panels[index];
      if (!panel) return;
      stage.style.height = panelHeight(panel) + "px";
    }

    function syncCopy(panel) {
      if (!panel) return;
      if (stepEl) stepEl.textContent = panel.getAttribute("data-report-roll-step") || "";
      if (titleEl) titleEl.textContent = panel.getAttribute("data-report-roll-title") || "";
      if (textEl) textEl.textContent = panel.getAttribute("data-report-roll-text") || "";
      if (copyEl) {
        copyEl.style.setProperty("--report-roll-accent", panel.style.getPropertyValue("--report-roll-accent") || "#f59e0b");
      }
    }

    function syncDots() {
      dots.forEach(function (dot, dotIndex) {
        var active = dotIndex === index;
        dot.setAttribute("aria-selected", active ? "true" : "false");
        if (active) dot.setAttribute("aria-current", "true");
        else dot.removeAttribute("aria-current");
      });
    }

    function setPausedState(isPaused) {
      paused = isPaused;
      root.classList.toggle("is-paused", isPaused);
      if (pauseEl) pauseEl.hidden = !isPaused;
    }

    function show(nextIndex, userInitiated) {
      index = ((nextIndex % panels.length) + panels.length) % panels.length;
      var panel = panels[index];

      panels.forEach(function (item, itemIndex) {
        var active = itemIndex === index;
        item.setAttribute("aria-hidden", active ? "false" : "true");
      });

      syncStage();

      root.classList.add("is-swapping");
      window.setTimeout(function () {
        syncCopy(panel);
        root.classList.remove("is-swapping");
      }, reducedMotion ? 0 : 140);

      syncDots();
      if (userInitiated && visible && !paused && !reducedMotion) start();
    }

    function advance() {
      if (paused) return;
      show(index + 1, false);
    }

    function start() {
      stop();
      if (reducedMotion || paused || !visible) return;
      timer = window.setInterval(advance, interval);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    root.addEventListener("mouseenter", function () {
      setPausedState(true);
      stop();
    });

    root.addEventListener("mouseleave", function () {
      setPausedState(false);
      if (visible) start();
    });

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        show(index - 1, true);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        show(index + 1, true);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-report-roll-dot")) || 0, true);
      });
    });

    panels.forEach(function (panel) {
      var img = panel.querySelector("img");
      if (img && !img.complete) img.addEventListener("load", syncStage);
    });

    window.addEventListener("resize", syncStage);

    if (typeof ResizeObserver !== "undefined") {
      new ResizeObserver(syncStage).observe(stage);
    }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            visible = entry.isIntersecting;
            if (visible) {
              syncStage();
              start();
            } else {
              stop();
            }
          });
        },
        { threshold: 0.3 }
      ).observe(root);
    } else {
      visible = true;
      syncStage();
      start();
    }

    show(0, false);
    requestAnimationFrame(function () {
      requestAnimationFrame(syncStage);
    });
  });
})();

(function () {
  var inners = document.querySelectorAll(".page-hero__inner--tunnel");
  if (!inners.length) return;

  var mq = window.matchMedia("(min-width: 901px)");

  function fitTunnelHero(inner) {
    var copy = inner.querySelector(".page-hero__copy");
    var media = inner.querySelector(".page-hero__media");
    var frame = inner.querySelector(".page-hero__media .shot__frame");
    var img = frame && frame.querySelector("img");
    var lead = copy && copy.querySelector(".page-lead");
    if (!copy || !media || !frame || !img) return;

    if (!mq.matches) {
      frame.style.removeProperty("width");
      frame.style.removeProperty("height");
      frame.style.removeProperty("max-height");
      return;
    }

    var top = copy.getBoundingClientRect().top;
    var bottom = lead ? lead.getBoundingClientRect().bottom : copy.getBoundingClientRect().bottom;
    var targetHeight = Math.max(160, bottom - top);
    var aspect =
      img.naturalWidth && img.naturalHeight
        ? img.naturalWidth / img.naturalHeight
        : Number(img.getAttribute("width")) / Number(img.getAttribute("height")) || 1.175;
    var maxWidth = media.clientWidth;
    var targetWidth = Math.min(maxWidth, Math.round(targetHeight * aspect));

    frame.style.width = targetWidth + "px";
    frame.style.height = targetHeight + "px";
    frame.style.maxHeight = targetHeight + "px";
  }

  function fitAll() {
    Array.prototype.forEach.call(inners, fitTunnelHero);
  }

  function bindImage(img) {
    if (img.complete) fitAll();
    else img.addEventListener("load", fitAll, { once: true });
  }

  inners.forEach(function (inner) {
    var img = inner.querySelector(".page-hero__media .shot__frame img");
    if (img) bindImage(img);
  });

  fitAll();
  window.addEventListener("resize", fitAll);
  if (mq.addEventListener) mq.addEventListener("change", fitAll);
  else if (mq.addListener) mq.addListener(fitAll);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitAll);
})();

(function () {
  var asides = document.querySelectorAll(".page-section--tunnel-cab .page-section__aside");
  if (!asides.length) return;

  var mq = window.matchMedia("(min-width: 901px)");

  function fitTunnelCabAside(aside) {
    var copy = aside.querySelector(".page-section__aside-copy");
    var media = aside.querySelector(".page-section__aside-media");
    var frame = aside.querySelector(".page-section__aside-visual .shot__frame");
    var tiles = aside.querySelector(".spec-tiles");
    var h2 = copy && copy.querySelector("h2");
    if (!copy || !media || !frame || !tiles) return;

    if (!mq.matches) {
      copy.style.removeProperty("min-height");
      media.style.removeProperty("margin-top");
      tiles.style.removeProperty("min-height");
      tiles.style.removeProperty("height");
      return;
    }

    media.style.marginTop = "0";
    if (h2) {
      var delta = frame.getBoundingClientRect().top - h2.getBoundingClientRect().top;
      if (delta > 0.5) media.style.marginTop = -Math.round(delta) + "px";
    }

    void media.offsetHeight;

    var frameRect = frame.getBoundingClientRect();
    var frameBottom = frameRect.bottom;
    var copyTop = copy.getBoundingClientRect().top;
    copy.style.minHeight = Math.max(0, Math.round(frameBottom - copyTop)) + "px";

    void copy.offsetHeight;

    var tilesTop = tiles.getBoundingClientRect().top;
    var tilesMin = Math.round(frameBottom - tilesTop);
    tiles.style.minHeight = Math.max(140, tilesMin) + "px";
    tiles.style.height = Math.max(140, tilesMin) + "px";
  }

  function fitAll() {
    Array.prototype.forEach.call(asides, fitTunnelCabAside);
  }

  asides.forEach(function (aside) {
    var img = aside.querySelector(".page-section__aside-visual .shot__frame img");
    if (img && !img.complete) img.addEventListener("load", fitAll, { once: true });
  });

  fitAll();
  window.addEventListener("resize", fitAll);
  if (mq.addEventListener) mq.addEventListener("change", fitAll);
  else if (mq.addListener) mq.addListener(fitAll);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitAll);
})();
