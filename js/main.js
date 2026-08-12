// Current year in footer
document.getElementById("year").textContent = new Date().getFullYear();

// Product screenshot galleries
document.querySelectorAll("[data-gallery]").forEach((gallery) => {
  const img = gallery.querySelector("[data-gallery-main]");
  const url = gallery.querySelector("[data-gallery-url]");
  const tabs = gallery.querySelectorAll(".gallery-tab");

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
      }
      if (url && tab.dataset.url) {
        url.textContent = tab.dataset.url;
      }
    });
  });
});
