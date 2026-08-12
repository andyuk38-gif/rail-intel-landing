// Current year in footer
document.getElementById("year").textContent = new Date().getFullYear();

function applySharpSrcset(img) {
  const src = img.getAttribute("src");
  if (!src || !src.includes("/product/")) return;

  const hi = src.replace("/product/", "/product/2x/");
  const apply = () => {
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    if (!w || !h) return;
    img.width = w;
    img.height = h;
    img.sizes = "(min-width: 1024px) 560px, 100vw";
    // Native width is enough for most full-width captures; 2x upscales help smaller crops on retina.
    if (w <= 1300) {
      img.srcset = `${src} ${w}w, ${hi} ${w * 2}w`;
    } else {
      img.srcset = `${src} ${w}w`;
    }
  };

  if (img.complete && img.naturalWidth) apply();
  else img.addEventListener("load", apply, { once: true });
}

// Product screenshot galleries
document.querySelectorAll("[data-gallery]").forEach((gallery) => {
  const img = gallery.querySelector("[data-gallery-main]");
  const url = gallery.querySelector("[data-gallery-url]");
  const tabs = gallery.querySelectorAll(".gallery-tab");

  if (img) applySharpSrcset(img);

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((other) => {
        other.classList.remove("is-active");
        other.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      if (img && tab.dataset.src) {
        img.removeAttribute("srcset");
        img.removeAttribute("sizes");
        img.src = tab.dataset.src;
        img.alt = tab.dataset.alt || "";
        applySharpSrcset(img);
      }
      if (url && tab.dataset.url) {
        url.textContent = tab.dataset.url;
      }
    });
  });
});
