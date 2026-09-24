(function () {
  var root = document.querySelector("[data-share]");
  if (!root) return;

  var toggle = root.querySelector("[data-share-toggle]");
  var panel = root.querySelector("[data-share-panel]");
  var copyBtn = root.querySelector("[data-share-copy]");
  var copyLabel = root.querySelector("[data-share-copy-label]");
  var email = root.querySelector("[data-share-email]");
  var linkedin = root.querySelector("[data-share-linkedin]");
  var whatsapp = root.querySelector("[data-share-whatsapp]");
  var nativeBtn = root.querySelector("[data-share-native]");
  var status = root.querySelector("[data-share-status]");
  var copyTimer = 0;
  var compactQuery = window.matchMedia("(max-width: 720px)");

  if (!toggle || !panel) return;

  function pageUrl() {
    var url = new URL(window.location.href);
    url.hash = "";
    // WhatsApp keeps the first preview it fetched for a link. A new query
    // makes the next share a link it has not cached yet.
    url.searchParams.set("v", "3");
    return url.toString();
  }

  function pageTitle() {
    return (document.title || "Rail Intel").replace(/\s+/g, " ").trim();
  }

  function refreshLinks() {
    var url = pageUrl();
    var title = pageTitle();
    var message = title + "\n\n" + url;
    if (email) {
      email.href =
        "mailto:?subject=" + encodeURIComponent(title) + "&body=" + encodeURIComponent(message);
    }
    if (linkedin) {
      // LinkedIn caches the first preview for a URL, and a page can only
      // advertise one image. This address is only used by the LinkedIn
      // button so its card can be the portrait hero.
      var linkedinPage = new URL("/linkedin.html", window.location.origin);
      linkedinPage.searchParams.set("v", "1");
      linkedin.href =
        "https://www.linkedin.com/sharing/share-offsite/?url=" +
        encodeURIComponent(linkedinPage.toString());
    }
    if (whatsapp) {
      whatsapp.href = "https://wa.me/?text=" + encodeURIComponent(title + " " + url);
    }
  }

  function placePanel() {
    if (!compactQuery.matches) {
      panel.style.position = "";
      panel.style.top = "";
      panel.style.right = "";
      panel.style.left = "";
      panel.style.width = "";
      return;
    }
    var rect = toggle.getBoundingClientRect();
    panel.style.position = "fixed";
    panel.style.top = Math.round(rect.bottom + 8) + "px";
    panel.style.right = "0.75rem";
    panel.style.left = "auto";
    panel.style.width = "min(16.5rem, calc(100vw - 1.5rem))";
  }

  function isOpen() {
    return root.dataset.open === "true";
  }

  function closeNavMenu() {
    var menu = document.querySelector("[data-nav-menu]");
    var navToggle = document.querySelector("[data-nav-toggle]");
    if (!menu || menu.dataset.open !== "true") return;
    menu.dataset.open = "false";
    if (navToggle) navToggle.setAttribute("aria-expanded", "false");
  }

  function openPanel() {
    refreshLinks();
    closeNavMenu();
    panel.hidden = false;
    root.dataset.open = "true";
    toggle.setAttribute("aria-expanded", "true");
    placePanel();
  }

  function closePanel(restoreFocus) {
    root.dataset.open = "false";
    panel.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    if (restoreFocus) toggle.focus();
  }

  function syncNative() {
    if (!nativeBtn) return;
    nativeBtn.hidden = !(typeof navigator.share === "function" && compactQuery.matches);
  }

  toggle.addEventListener("click", function () {
    if (isOpen()) closePanel(false);
    else openPanel();
  });

  document.addEventListener("click", function (event) {
    if (!isOpen() || root.contains(event.target)) return;
    closePanel(false);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape" || !isOpen()) return;
    closePanel(true);
  });

  window.addEventListener("resize", function () {
    syncNative();
    if (isOpen()) placePanel();
  });

  window.addEventListener(
    "scroll",
    function () {
      if (isOpen() && compactQuery.matches) placePanel();
    },
    { passive: true }
  );

  function markCopied() {
    if (copyLabel) copyLabel.textContent = "Copied";
    if (copyBtn) copyBtn.dataset.copied = "true";
    if (status) status.textContent = "Link copied";
    window.clearTimeout(copyTimer);
    copyTimer = window.setTimeout(function () {
      if (copyLabel) copyLabel.textContent = "Copy link";
      if (copyBtn) delete copyBtn.dataset.copied;
      if (status) status.textContent = "";
    }, 2000);
  }

  function fallbackCopy(url) {
    var field = document.createElement("textarea");
    field.value = url;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.top = "0";
    field.style.left = "0";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.focus();
    field.select();
    field.setSelectionRange(0, url.length);
    var ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (err) {
      ok = false;
    }
    field.remove();
    return ok;
  }

  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var url = pageUrl();
      // Copy while the click is still a user gesture. The async clipboard
      // API often rejects in this browser, and the fallback is too late by then.
      if (fallbackCopy(url)) {
        markCopied();
        return;
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(
          function () {
            markCopied();
          },
          function () {
            if (status) status.textContent = "Could not copy the link";
          }
        );
        return;
      }
      if (status) status.textContent = "Could not copy the link";
    });
  }

  [email, linkedin, whatsapp].forEach(function (link) {
    if (!link) return;
    link.addEventListener("click", function () {
      closePanel(false);
    });
  });

  if (nativeBtn) {
    nativeBtn.addEventListener("click", function () {
      if (typeof navigator.share !== "function") return;
      navigator.share({ title: pageTitle(), text: pageTitle(), url: pageUrl() }).then(
        function () {
          closePanel(true);
        },
        function (err) {
          if (err && err.name === "AbortError") return;
          if (status) status.textContent = "Could not open the share sheet";
        }
      );
    });
  }

  refreshLinks();
  syncNative();
})();
