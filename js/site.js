/* Rail Intel – shared navigation and screenshot lightbox. Loaded on every page. */

(function () {
  "use strict";

  /* ---------- Footer year ---------- */

  var year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();

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
    '<div class="lightbox__stage"><img class="lightbox__img" alt="" data-lightbox-img /></div>';
  document.body.appendChild(lightbox);

  var lightboxImg = lightbox.querySelector("[data-lightbox-img]");
  var lightboxMeta = lightbox.querySelector("[data-lightbox-meta]");
  var lightboxOpen = lightbox.querySelector("[data-lightbox-open]");
  var lightboxZoom = lightbox.querySelector("[data-lightbox-zoom]");
  var lastFocused = null;
  var actualSize = false;

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

  function showLightbox(img) {
    lastFocused = document.activeElement;
    actualSize = false;

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

  lightboxZoom.addEventListener("click", function () {
    actualSize = !actualSize;
    applyScale();
  });

  function hideLightbox() {
    lightbox.classList.remove("is-open");
    document.body.classList.remove("lightbox-open");
    lightboxImg.removeAttribute("src");
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
  var frames = document.querySelectorAll(".shot__frame, .browser-mockup__content");
  Array.prototype.forEach.call(frames, function (frame) {
    var img = frame.querySelector("img");
    if (!img || frame.querySelector(".shot__expand")) return;

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

  var howFlow = document.querySelector(".how-flow");
  if (howFlow) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      howFlow.classList.add("is-visible");
    } else {
      var howFlowObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            howFlowObserver.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -10% 0px", threshold: 0.2 }
      );
      howFlowObserver.observe(howFlow);
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

  /* ---------- 3D deck screenshot gallery (coverflow) ---------- */

  Array.prototype.forEach.call(document.querySelectorAll("[data-shot-deck]"), function (deckRoot) {
    var viewport = deckRoot.querySelector("[data-shot-deck-viewport]");
    var slides = Array.prototype.slice.call(deckRoot.querySelectorAll("[data-shot-deck-slide]"));
    var dotsRoot = deckRoot.querySelector("[data-shot-deck-dots]");
    var prevBtn = deckRoot.querySelector("[data-shot-deck-prev]");
    var nextBtn = deckRoot.querySelector("[data-shot-deck-next]");
    var meta = deckRoot.querySelector(".shot-deck__meta");
    var counterEl = deckRoot.querySelector("[data-shot-deck-counter]");
    var captionEl = deckRoot.querySelector(".shot-deck__caption");
    var progressBar = deckRoot.querySelector("[data-shot-deck-progress]");
    var count = slides.length;
    if (!viewport || !count) return;

    var index = 0;
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var compact = function () {
      return window.matchMedia("(max-width: 768px)").matches;
    };
    var autoTimer = null;
    var progressTimer = null;
    var progressStart = 0;
    var paused = false;
    var dragging = false;
    var dragStart = 0;
    var dragDelta = 0;
    var DECK_AUTO_MS = 6000;

    function prevIndex() {
      return (index - 1 + count) % count;
    }

    function nextIndex() {
      return (index + 1) % count;
    }

    function labelFor(slide) {
      return slide.getAttribute("data-shot-deck-label") || "";
    }

    function buildDots() {
      if (!dotsRoot || count < 2) return;
      dotsRoot.replaceChildren();
      slides.forEach(function (slide, slideIndex) {
        var dot = document.createElement("button");
        dot.type = "button";
        dot.className = "shot-deck__dot";
        dot.setAttribute("role", "tab");
        dot.setAttribute("aria-label", labelFor(slide) || "Screenshot " + (slideIndex + 1));
        dot.addEventListener("click", function () {
          setIndex(slideIndex, true);
        });
        dotsRoot.appendChild(dot);
      });
    }

    function syncDots() {
      if (!dotsRoot) return;
      Array.prototype.forEach.call(dotsRoot.querySelectorAll(".shot-deck__dot"), function (dot, dotIndex) {
        var active = dotIndex === index;
        dot.classList.toggle("is-active", active);
        dot.setAttribute("aria-selected", active ? "true" : "false");
      });
    }

    function syncMeta() {
      var slide = slides[index];
      if (!slide) return;
      if (counterEl) {
        counterEl.textContent =
          count > 1
            ? String(index + 1).padStart(2, "0") + " / " + String(count).padStart(2, "0")
            : "01";
      }
      if (captionEl) captionEl.textContent = labelFor(slide);
    }

    function applyState() {
      var prev = prevIndex();
      var next = nextIndex();
      slides.forEach(function (slide, slideIndex) {
        var isCurrent = slideIndex === index;
        slide.classList.toggle("is-current", isCurrent);
        slide.classList.toggle("is-prev", !compact() && count > 1 && slideIndex === prev);
        slide.classList.toggle("is-next", !compact() && count > 1 && slideIndex === next);
        slide.setAttribute("aria-hidden", isCurrent ? "false" : "true");
      });
      syncDots();
      syncMeta();
    }

    function flashMeta() {
      if (!meta || reduced) return;
      meta.classList.add("is-changing");
      window.setTimeout(function () {
        meta.classList.remove("is-changing");
      }, 180);
    }

    function setIndex(next, userInitiated) {
      if (count < 2) return;
      var newIndex = ((next % count) + count) % count;
      if (newIndex === index) return;
      if (userInitiated) restartAuto();
      index = newIndex;
      flashMeta();
      applyState();
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
      if (progressBar) progressBar.style.width = "0%";
    }

    function tickProgress() {
      if (!progressBar || paused || reduced || count < 2) return;
      var elapsed = Date.now() - progressStart;
      var pct = Math.min(100, (elapsed / DECK_AUTO_MS) * 100);
      progressBar.style.width = pct + "%";
      if (elapsed < DECK_AUTO_MS) progressTimer = requestAnimationFrame(tickProgress);
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
      }, DECK_AUTO_MS);
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

    slides.forEach(function (slide, slideIndex) {
      slide.addEventListener("click", function () {
        if (slideIndex === index) return;
        if (slideIndex === prevIndex() || slideIndex === nextIndex() || compact()) {
          setIndex(slideIndex, true);
        }
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

    viewport.addEventListener(
      "pointerdown",
      function (event) {
        if (count < 2) return;
        if (event.pointerType === "mouse" && event.button !== 0) return;
        if (event.target.closest("button, a, .shot__expand, .lightbox")) return;
        dragging = true;
        dragStart = event.clientX;
        dragDelta = 0;
        viewport.classList.add("is-dragging");
        viewport.setPointerCapture(event.pointerId);
        pauseAuto();
      },
      { passive: true }
    );
    viewport.addEventListener(
      "pointermove",
      function (event) {
        if (!viewport.hasPointerCapture(event.pointerId)) return;
        dragDelta = event.clientX - dragStart;
      },
      { passive: true }
    );
    viewport.addEventListener("pointerup", function (event) {
      if (!viewport.hasPointerCapture(event.pointerId)) return;
      viewport.releasePointerCapture(event.pointerId);
      viewport.classList.remove("is-dragging");
      dragging = false;
      if (Math.abs(dragDelta) >= 42) {
        if (dragDelta < 0) setIndex(index + 1, true);
        else setIndex(index - 1, true);
      } else {
        resumeAuto();
      }
    });

    deckRoot.addEventListener("keydown", function (event) {
      if (count < 2) return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setIndex(index - 1, true);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        setIndex(index + 1, true);
      }
    });

    deckRoot.addEventListener("mouseenter", pauseAuto);
    deckRoot.addEventListener("mouseleave", resumeAuto);
    deckRoot.addEventListener("focusin", pauseAuto);
    deckRoot.addEventListener("focusout", function (event) {
      if (!deckRoot.contains(event.relatedTarget)) resumeAuto();
    });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stopAuto();
      else if (!paused) startAuto();
    });

    buildDots();
    applyState();
    startAuto();

    window.addEventListener("resize", applyState);
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

  /* ---------- Trainee Driver vertical journey ---------- */

  Array.prototype.forEach.call(document.querySelectorAll("[data-trainee-journey]"), function (journey) {
    var steps = Array.prototype.slice.call(journey.querySelectorAll("[data-trainee-step]"));
    var railLinks = Array.prototype.slice.call(journey.querySelectorAll("[data-trainee-rail]"));
    var progress = journey.querySelector("[data-trainee-rail-progress]");
    var count = Number(journey.getAttribute("data-trainee-count")) || steps.length;
    var active = 0;
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
    }

    if ("IntersectionObserver" in window && steps.length) {
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
          var step = visible[0].target;
          var index = Number(step.getAttribute("data-trainee-step"));
          if (!Number.isNaN(index) && index !== active) sync(index);
        },
        { rootMargin: "-20% 0px -45% 0px", threshold: [0.2, 0.35, 0.5, 0.65] }
      );
      steps.forEach(function (step) {
        observer.observe(step);
      });
    } else {
      sync(0);
    }

    railLinks.forEach(function (link) {
      link.addEventListener("click", function (event) {
        var index = Number(link.getAttribute("data-trainee-rail"));
        var target = steps[index];
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
        sync(index);
      });
    });

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

    sync(0);
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
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  Array.prototype.forEach.call(document.querySelectorAll("[data-verify-scan-video]"), function (video) {
    var maxLoops = Number(video.getAttribute("data-max-loops")) || 3;
    var loops = 0;

    function tryPlay() {
      if (reducedMotion || loops >= maxLoops) return;
      video.play().catch(function () {});
    }

    video.addEventListener("ended", function () {
      loops += 1;
      if (loops < maxLoops) {
        video.currentTime = 0;
        tryPlay();
      }
    });

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
