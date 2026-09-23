/* Competency engine hero — branch inspection and chassis motion */

(function () {
  "use strict";

  var root = document.querySelector("[data-competency-engine]");
  if (!root) return;

  var scene = root.querySelector("[data-engine-scene]");
  var feedsEl = root.querySelector("[data-engine-feeds]");
  var ruleEl = root.querySelector("[data-engine-rule]");
  var liveEl = root.querySelector("[data-engine-live]");
  var toggle = root.querySelector("[data-engine-toggle]");
  var buttons = Array.prototype.slice.call(root.querySelectorAll("button[data-branch]"));
  var parts = Array.prototype.slice.call(root.querySelectorAll("[data-branch]"));
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;
  var paused = false;

  function select(id) {
    root.setAttribute("data-active", id);
    var source = null;
    parts.forEach(function (el) {
      var on = el.getAttribute("data-branch") === id;
      el.classList.toggle("is-on", on);
      if (el.tagName === "BUTTON") {
        el.setAttribute("aria-pressed", on ? "true" : "false");
        if (on) source = el;
      }
    });
    if (!source) return;
    var tone = source.getAttribute("data-tone");
    root.style.setProperty(
      "--engine-accent",
      tone === "green" ? "#34d399" : tone === "amber" ? "#f59e0b" : "#93c5fd"
    );
    if (feedsEl) feedsEl.textContent = source.getAttribute("data-feeds") || "";
    if (ruleEl) ruleEl.textContent = source.getAttribute("data-rule") || "";
    if (liveEl) liveEl.textContent = source.getAttribute("data-live") || "";
  }

  function visibleButton(id) {
    var matches = root.querySelectorAll('button[data-branch="' + id + '"]');
    for (var i = 0; i < matches.length; i += 1) {
      var rect = matches[i].getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) return matches[i];
    }
    return matches[0] || null;
  }

  buttons.forEach(function (button) {
    button.addEventListener("mouseenter", function () {
      select(button.getAttribute("data-branch"));
    });
    button.addEventListener("focus", function () {
      select(button.getAttribute("data-branch"));
    });
    button.addEventListener("click", function () {
      select(button.getAttribute("data-branch"));
    });
  });

  root.addEventListener("keydown", function (event) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    var current = document.activeElement;
    if (!current || !root.contains(current) || !current.hasAttribute("data-branch")) return;
    var ids = [];
    buttons.forEach(function (button) {
      var id = button.getAttribute("data-branch");
      if (ids.indexOf(id) === -1) ids.push(id);
    });
    var index = ids.indexOf(current.getAttribute("data-branch"));
    if (index === -1) return;
    event.preventDefault();
    var next = ids[(index + (event.key === "ArrowRight" ? 1 : -1) + ids.length) % ids.length];
    select(next);
    var focusTarget = visibleButton(next);
    if (focusTarget) focusTarget.focus();
  });

  if (toggle) {
    toggle.hidden = reduced;
    toggle.addEventListener("click", function () {
      paused = !paused;
      root.classList.toggle("is-paused", paused);
      toggle.setAttribute("aria-pressed", paused ? "true" : "false");
      toggle.textContent = paused ? "Play" : "Pause";
    });
  }

  if (!reduced && finePointer && scene) {
    root.addEventListener("pointermove", function (event) {
      if (paused) return;
      var rect = root.getBoundingClientRect();
      var px = (event.clientX - rect.left) / rect.width - 0.5;
      var py = (event.clientY - rect.top) / rect.height - 0.5;
      scene.style.transform =
        "rotateX(" + (-py * 5.5).toFixed(2) + "deg) rotateY(" + (px * 6.5).toFixed(2) + "deg)";
    });
    root.addEventListener("pointerleave", function () {
      scene.style.transform = "";
    });
  }
})();
