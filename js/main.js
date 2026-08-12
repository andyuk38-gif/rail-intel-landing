// Product screenshot galleries
document.querySelectorAll("[data-gallery]").forEach((gallery) => {
  const img = gallery.querySelector("[data-gallery-main]");
  const url = gallery.querySelector("[data-gallery-url]");
  const tabs = Array.from(gallery.querySelectorAll(".gallery-tab"));
  if (!img || !tabs.length) return;

  // The caption is built from the alt text each tab already carries, so the
  // markup does not need to repeat the description.
  const caption = document.createElement("p");
  caption.className = "gallery-caption";
  caption.textContent = img.alt;
  gallery.appendChild(caption);

  const settle = () => gallery.classList.remove("is-swapping");

  const show = (tab) => {
    tabs.forEach((other) => {
      const active = other === tab;
      other.classList.toggle("is-active", active);
      other.setAttribute("aria-selected", String(active));
      other.tabIndex = active ? 0 : -1;
    });

    if (!tab.dataset.src || img.getAttribute("src") === tab.dataset.src) return;

    gallery.classList.add("is-swapping");

    // Swap once the outgoing image has faded, then fade the new one in.
    setTimeout(() => {
      img.src = tab.dataset.src;
      img.alt = tab.dataset.alt || "";
      if (tab.dataset.width) img.width = tab.dataset.width;
      if (tab.dataset.height) img.height = tab.dataset.height;
      caption.textContent = img.alt;
      if (url && tab.dataset.url) url.textContent = tab.dataset.url;

      if (img.complete && img.naturalWidth) settle();
      else {
        img.addEventListener("load", settle, { once: true });
        img.addEventListener("error", settle, { once: true });
      }
    }, 120);
  };

  tabs.forEach((tab, index) => {
    tab.tabIndex = tab.classList.contains("is-active") ? 0 : -1;
    tab.addEventListener("click", () => show(tab));

    tab.addEventListener("keydown", (event) => {
      const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
      if (!step) return;
      event.preventDefault();
      const next = tabs[(index + step + tabs.length) % tabs.length];
      next.focus();
      show(next);
    });
  });
});
