// Product screenshot galleries
document.querySelectorAll("[data-gallery]").forEach((gallery) => {
  const img = gallery.querySelector("[data-gallery-main]");
  const url = gallery.querySelector("[data-gallery-url]");
  const scene = gallery.querySelector("[data-gallery-scene]");
  const video = gallery.querySelector("[data-scene-video]");
  const tabs = Array.from(gallery.querySelectorAll(".gallery-tab"));
  if (!img || !tabs.length) return;

  // The caption is built from the alt text each tab already carries, so the
  // markup does not need to repeat the description.
  const caption = document.createElement("p");
  caption.className = "gallery-caption";
  gallery.appendChild(caption);

  const settle = () => gallery.classList.remove("is-swapping");

  // Playback is gated on the scene being both selected and on screen.
  let sceneInView = false;

  // The expand control is injected by the lightbox and only makes sense for
  // the still screenshots, so it is hidden while the video scene is showing.
  const setSceneVisible = (visible) => {
    if (!scene) return;
    scene.hidden = !visible;
    img.hidden = visible;
    const expand = gallery.querySelector(".shot__expand");
    if (expand) expand.hidden = visible;
    if (!video) return;
    if (visible && sceneInView) video.play().catch(() => {});
    else video.pause();
  };

  const render = (tab) => {
    caption.textContent = tab.dataset.alt || "";
    if (url && tab.dataset.url) url.textContent = tab.dataset.url;

    if (tab.dataset.scene) {
      setSceneVisible(true);
      settle();
      return;
    }

    setSceneVisible(false);
    if (img.getAttribute("src") === tab.dataset.src) {
      settle();
      return;
    }

    img.src = tab.dataset.src;
    img.alt = tab.dataset.alt || "";
    if (tab.dataset.width) img.width = tab.dataset.width;
    if (tab.dataset.height) img.height = tab.dataset.height;

    if (img.complete && img.naturalWidth) settle();
    else {
      img.addEventListener("load", settle, { once: true });
      img.addEventListener("error", settle, { once: true });
    }
  };

  const show = (tab) => {
    tabs.forEach((other) => {
      const active = other === tab;
      other.classList.toggle("is-active", active);
      other.setAttribute("aria-selected", String(active));
      other.tabIndex = active ? 0 : -1;
    });

    gallery.classList.add("is-swapping");
    setTimeout(() => render(tab), 120);
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

  render(tabs.find((tab) => tab.classList.contains("is-active")) || tabs[0]);

  // Only run the video while it is on screen, so it costs nothing to visitors
  // who never scroll this far.
  if (video && "IntersectionObserver" in window) {
    new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          sceneInView = entry.isIntersecting;
          if (scene && scene.hidden) return;
          if (sceneInView) video.play().catch(() => {});
          else video.pause();
        });
      },
      { threshold: 0.25 }
    ).observe(video);
  }
});
