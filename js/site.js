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
