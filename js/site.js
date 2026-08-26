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
    button.addEventListener("click", function () {
      showLightbox(img);
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
})();
