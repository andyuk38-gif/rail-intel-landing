// Current year in footer
document.getElementById("year").textContent = new Date().getFullYear();

// Hint display size at half native resolution so retina screens map ~1:1 to source pixels.
function setSharpDimensions(img) {
  const apply = () => {
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    if (!w || !h) return;
    img.width = Math.round(w / 2);
    img.height = Math.round(h / 2);
  };

  if (img.complete && img.naturalWidth) apply();
  else img.addEventListener("load", apply, { once: true });
}

document.querySelectorAll("[data-gallery]").forEach((gallery) => {
  const img = gallery.querySelector("[data-gallery-main]");
  const url = gallery.querySelector("[data-gallery-url]");
  const tabs = gallery.querySelectorAll(".gallery-tab");

  if (img) setSharpDimensions(img);

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((other) => {
        other.classList.remove("is-active");
        other.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      if (img && tab.dataset.src) {
        img.src = tab.dataset.src;
        img.alt = tab.dataset.alt || "";
        setSharpDimensions(img);
      }
      if (url && tab.dataset.url) {
        url.textContent = tab.dataset.url;
      }
    });
  });
});
