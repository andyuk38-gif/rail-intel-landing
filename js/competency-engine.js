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

  var bay = document.querySelector("[data-engine-bay]");
  var token = bay && bay.querySelector("[data-engine-token]");
  var home = bay && bay.querySelector("[data-engine-home]");
  var socket = root.querySelector("[data-engine-socket]");
  var lift = bay && bay.querySelector("[data-engine-lift]");
  var kicker = bay && bay.querySelector("[data-engine-kicker]");
  var hint = bay && bay.querySelector("[data-engine-hint]");
  var announce = root.querySelector("[data-engine-announce]");
  var statusLabel = root.querySelector("[data-engine-status-label]");
  var deviceLabel = root.querySelector("[data-engine-device]");
  var outputsLabel = root.querySelector("[data-engine-outputs]");
  var live = false;
  var busy = false;
  var drag = null;
  var seatTimer = 0;

  buttons.forEach(function (button) {
    button.setAttribute("tabindex", "-1");
  });

  function setBranchesEnabled(on) {
    buttons.forEach(function (button) {
      if (on) {
        button.removeAttribute("tabindex");
        button.removeAttribute("aria-hidden");
      } else {
        button.setAttribute("tabindex", "-1");
        button.setAttribute("aria-hidden", "true");
      }
    });
  }

  function say(message) {
    if (announce) announce.textContent = message;
  }

  function setCopy(on) {
    if (statusLabel) statusLabel.textContent = on ? "Live feeds" : "Socket open";
    if (deviceLabel) deviceLabel.textContent = on ? "Operational Compliance" : "Awaiting engine";
    if (outputsLabel) outputsLabel.textContent = on ? "Drives assessment and compliance" : "Drag the chip to seat";
    if (kicker) kicker.textContent = on ? "Engine online" : "Ready to seat";
    if (hint) hint.textContent = coarse ? "Drag or tap into the socket" : "Drag into the socket";
  }

  var coarse = window.matchMedia("(pointer: coarse)").matches;
  setCopy(false);

  if (toggle) {
    toggle.hidden = true;
    toggle.addEventListener("click", function () {
      if (!live) return;
      paused = !paused;
      root.classList.toggle("is-paused", paused);
      toggle.setAttribute("aria-pressed", paused ? "true" : "false");
      toggle.textContent = paused ? "Play" : "Pause";
    });
  }

  function resetTilt() {
    if (scene) scene.style.transform = "";
  }

  if (!reduced && finePointer && scene) {
    root.addEventListener("pointermove", function (event) {
      if (!live || paused || busy || drag) return;
      var rect = root.getBoundingClientRect();
      var px = (event.clientX - rect.left) / rect.width - 0.5;
      var py = (event.clientY - rect.top) / rect.height - 0.5;
      scene.style.transform =
        "rotateX(" + (-py * 5.5).toFixed(2) + "deg) rotateY(" + (px * 6.5).toFixed(2) + "deg)";
    });
    root.addEventListener("pointerleave", function () {
      if (drag) return;
      resetTilt();
    });
  }

  if (!token || !home || !socket) return;

  function socketMostlyVisible() {
    var rect = socket.getBoundingClientRect();
    return rect.top >= 80 && rect.bottom <= window.innerHeight - 16 && rect.height > 20;
  }

  function revealSocket() {
    if (socketMostlyVisible()) return;
    var rect = socket.getBoundingClientRect();
    var delta = rect.top + rect.height / 2 - window.innerHeight * 0.58;
    window.scrollBy(0, delta);
  }

  function placeToken(rect, extra) {
    token.classList.add("is-lifted");
    token.style.width = rect.width + "px";
    token.style.height = rect.height + "px";
    token.style.transition = "none";
    token.style.transform =
      "translate(" + rect.left.toFixed(2) + "px," + rect.top.toFixed(2) + "px)" + (extra || "");
  }

  function clearToken() {
    token.classList.remove("is-lifted", "is-dragging", "is-armed");
    token.style.cssText = "";
    token.removeAttribute("aria-grabbed");
  }

  function overSocket(x, y) {
    var rect = socket.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;
    var padX = Math.max(72, rect.width * 0.22);
    var padY = Math.max(64, rect.height * 0.28);
    if (x < rect.left - padX || x > rect.right + padX || y < rect.top - padY || y > rect.bottom + padY) {
      return false;
    }
    return Math.hypot(x - cx, y - cy) < Math.max(rect.width, rect.height) * 0.46;
  }

  function setArmed(on) {
    root.classList.toggle("is-armed", on);
    token.classList.toggle("is-armed", on);
  }

  function finishSeat() {
    window.clearTimeout(seatTimer);
    live = true;
    busy = false;
    drag = null;
    resetTilt();
    root.classList.add("is-live", "is-surging");
    root.classList.remove("is-armed", "is-seating", "is-cooling");
    setArmed(false);
    setCopy(true);
    setBranchesEnabled(true);
    if (lift) lift.hidden = false;
    if (toggle && !reduced) toggle.hidden = false;
    say("Engine seated. The branches are live.");
    window.setTimeout(function () {
      bay.classList.add("is-spent");
      clearToken();
    }, reduced ? 0 : 160);
    window.setTimeout(function () {
      root.classList.remove("is-surging");
    }, 720);
  }

  function flyToken(to, done) {
    if (reduced) {
      done();
      return;
    }
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        token.style.transition =
          "transform 0.5s cubic-bezier(.16,1,.3,1), width 0.5s cubic-bezier(.16,1,.3,1), height 0.5s cubic-bezier(.16,1,.3,1)";
        token.style.width = to.width + "px";
        token.style.height = to.height + "px";
        token.style.transform = "translate(" + to.left.toFixed(2) + "px," + to.top.toFixed(2) + "px)";
        seatTimer = window.setTimeout(done, 520);
      });
    });
  }

  function seatFrom(rect) {
    if (live || busy) return;
    busy = true;
    resetTilt();
    placeToken(rect || token.getBoundingClientRect());
    revealSocket();
    root.classList.add("is-seating");
    var target = socket.getBoundingClientRect();
    setArmed(true);
    flyToken(target, finishSeat);
  }

  function returnHome() {
    var slot = home.getBoundingClientRect();
    flyToken(slot, function () {
      busy = false;
      drag = null;
      clearToken();
      setArmed(false);
      root.classList.remove("is-armed", "is-seating");
    });
  }

  function liftChip() {
    if (!live || busy) return;
    busy = true;
    paused = false;
    root.classList.remove("is-paused");
    if (toggle) {
      toggle.hidden = true;
      toggle.setAttribute("aria-pressed", "false");
      toggle.textContent = "Pause";
    }
    resetTilt();
    requestAnimationFrame(function () {
      var from = socket.getBoundingClientRect();
      bay.classList.remove("is-spent");
      placeToken(from);
      live = false;
      root.classList.add("is-cooling");
      root.classList.remove("is-live", "is-surging");
      setCopy(false);
      setBranchesEnabled(false);
      if (lift) lift.hidden = true;
      say("Chip lifted. The socket is open.");
      var slot = home.getBoundingClientRect();
      flyToken(slot, function () {
        busy = false;
        root.classList.remove("is-cooling");
        clearToken();
      });
    });
  }

  token.addEventListener("pointerdown", function (event) {
    if (live || busy || event.button !== 0) return;
    event.preventDefault();
    var rect = token.getBoundingClientRect();
    drag = {
      id: event.pointerId,
      dx: event.clientX - rect.left,
      dy: event.clientY - rect.top,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
      lastX: event.clientX,
    };
    placeToken(rect);
    revealSocket();
    token.classList.add("is-dragging");
    token.setAttribute("aria-grabbed", "true");
    try {
      if (token.setPointerCapture) token.setPointerCapture(event.pointerId);
    } catch (err) {}
  });

  token.addEventListener("pointermove", function (event) {
    if (!drag || event.pointerId !== drag.id) return;
    var dx = event.clientX - drag.startX;
    var dy = event.clientY - drag.startY;
    if (dx * dx + dy * dy > 36) drag.moved = true;
    var width = token.offsetWidth;
    var height = token.offsetHeight;
    var x = event.clientX - drag.dx;
    var y = event.clientY - drag.dy;
    var near = overSocket(event.clientX, event.clientY);
    if (near) {
      var seatRect = socket.getBoundingClientRect();
      var cx = seatRect.left + seatRect.width / 2;
      var cy = seatRect.top + seatRect.height / 2;
      var tcx = x + width / 2;
      var tcy = y + height / 2;
      tcx += (cx - tcx) * 0.34;
      tcy += (cy - tcy) * 0.34;
      x = tcx - width / 2;
      y = tcy - height / 2;
    }
    var tilt = near ? 0 : Math.max(-8, Math.min(8, (event.clientX - drag.lastX) * 0.45));
    drag.lastX = event.clientX;
    setArmed(near);
    token.style.transform =
      "translate(" + x.toFixed(2) + "px," + y.toFixed(2) + "px) rotate(" + tilt.toFixed(2) + "deg) scale(" +
      (near ? "1.02" : "1.05") + ")";
  });

  function endDrag(event) {
    if (!drag || (event && event.pointerId !== drag.id)) return;
    var moved = drag.moved;
    var near = event ? overSocket(event.clientX, event.clientY) : false;
    token.classList.remove("is-dragging");
    if (token.hasPointerCapture && event && token.hasPointerCapture(event.pointerId)) {
      token.releasePointerCapture(event.pointerId);
    }
    drag = null;
    if (!moved || near) {
      busy = true;
      root.classList.add("is-seating");
      setArmed(true);
      flyToken(socket.getBoundingClientRect(), finishSeat);
      return;
    }
    busy = true;
    setArmed(false);
    returnHome();
  }

  token.addEventListener("pointerup", endDrag);
  token.addEventListener("pointercancel", function (event) {
    if (!drag || event.pointerId !== drag.id) return;
    token.classList.remove("is-dragging");
    if (token.hasPointerCapture && token.hasPointerCapture(event.pointerId)) {
      token.releasePointerCapture(event.pointerId);
    }
    drag = null;
    busy = true;
    setArmed(false);
    root.classList.remove("is-seating");
    returnHome();
  });

  token.addEventListener("keydown", function (event) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    seatFrom(token.getBoundingClientRect());
  });

  token.addEventListener("click", function (event) {
    event.preventDefault();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape" || !drag) return;
    drag.moved = true;
    endDrag({ pointerId: drag.id, clientX: -9999, clientY: -9999 });
  });

  if (lift) {
    lift.addEventListener("click", liftChip);
  }
})();
