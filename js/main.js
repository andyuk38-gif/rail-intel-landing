// Product screenshot galleries
document.querySelectorAll("[data-gallery]").forEach((gallery) => {
  const img = gallery.querySelector("[data-gallery-main]");
  const url = gallery.querySelector("[data-gallery-url]");
  const scene = gallery.querySelector("[data-gallery-scene]");
  const video = gallery.querySelector("[data-scene-video]");
  const carouselEl = gallery.querySelector("[data-gallery-carousel]");
  const carouselTrack = gallery.querySelector("[data-gallery-carousel-track]");
  const tabs = Array.from(gallery.querySelectorAll(".gallery-tab"));
  let carouselTimer = null;
  let carouselIndex = 0;
  let carouselSlides = [];
  let activeTab = tabs.find((tab) => tab.classList.contains("is-active")) || tabs[0];
  const chips = {
    safe: gallery.querySelector('[data-gallery-chip="safe"]'),
    alert: gallery.querySelector('[data-gallery-chip="alert"]'),
  };
  if (!img || !tabs.length) return;

  // The caption is built from the alt text each tab already carries, so the
  // markup does not need to repeat the description.
  const caption = document.createElement("p");
  caption.className = "gallery-caption";
  gallery.appendChild(caption);

  const settle = () => gallery.classList.remove("is-swapping");

  const copyRoot = gallery.closest(".product-section__inner")?.querySelector("[data-gallery-copy]");
  const copy = copyRoot
    ? {
        eyebrow: copyRoot.querySelector("[data-copy-eyebrow]"),
        heading: copyRoot.querySelector("[data-copy-heading]"),
        lead: copyRoot.querySelector("[data-copy-lead]"),
        bullets: copyRoot.querySelector("[data-copy-bullets]"),
      }
    : null;

  const updateCopy = (tab) => {
    if (!copy || !tab.dataset.copyHeading) return;
    copyRoot.classList.add("is-copy-swapping");
    window.setTimeout(() => {
      if (copy.eyebrow && tab.dataset.copyEyebrow) copy.eyebrow.textContent = tab.dataset.copyEyebrow;
      if (copy.heading) copy.heading.textContent = tab.dataset.copyHeading;
      if (copy.lead && tab.dataset.copyLead) copy.lead.textContent = tab.dataset.copyLead;
      if (copy.bullets && tab.dataset.copyBullets) {
        const items = tab.dataset.copyBullets.split("|").map((item) => item.trim()).filter(Boolean);
        copy.bullets.replaceChildren(
          ...items.map((item) => {
            const li = document.createElement("li");
            li.textContent = item;
            return li;
          })
        );
      }
      copyRoot.classList.remove("is-copy-swapping");
    }, 120);
  };

  const setChip = (chip, title, detail) => {
    if (!chip || !title) return;
    const titleEl = chip.querySelector("[data-chip-title]");
    const detailEl = chip.querySelector("[data-chip-detail]");
    if (titleEl) titleEl.textContent = title;
    if (detailEl) detailEl.textContent = detail || "";
  };

  const getChipCopy = (tab, slideIndex = 0) => {
    const carouselSafeTitles = tab.dataset.carouselChipSafeTitles?.split("|") || [];
    const carouselSafeDetails = tab.dataset.carouselChipSafeDetails?.split("|") || [];
    const carouselAlertTitles = tab.dataset.carouselChipAlertTitles?.split("|") || [];
    const carouselAlertDetails = tab.dataset.carouselChipAlertDetails?.split("|") || [];
    const hasCarouselChips = carouselSafeTitles.length > 0 || carouselAlertTitles.length > 0;

    if (hasCarouselChips && tab.dataset.carouselSlides) {
      const pick = (values, fallback) => (values[slideIndex] ?? values[0] ?? fallback ?? "").trim();
      return {
        safeTitle: pick(carouselSafeTitles, tab.dataset.chipSafeTitle),
        safeDetail: pick(carouselSafeDetails, tab.dataset.chipSafeDetail),
        alertTitle: pick(carouselAlertTitles, tab.dataset.chipAlertTitle),
        alertDetail: pick(carouselAlertDetails, tab.dataset.chipAlertDetail),
      };
    }

    return {
      safeTitle: tab.dataset.chipSafeTitle || "",
      safeDetail: tab.dataset.chipSafeDetail || "",
      alertTitle: tab.dataset.chipAlertTitle || "",
      alertDetail: tab.dataset.chipAlertDetail || "",
    };
  };

  const updateChips = (tab, slideIndex = 0) => {
    if (!chips.safe && !chips.alert) return;
    const chipCopy = getChipCopy(tab, slideIndex);
    const hasChipCopy = chipCopy.safeTitle || chipCopy.alertTitle;
    if (!hasChipCopy) return;

    gallery.classList.add("is-chip-swapping");
    window.setTimeout(() => {
      setChip(chips.safe, chipCopy.safeTitle, chipCopy.safeDetail);
      setChip(chips.alert, chipCopy.alertTitle, chipCopy.alertDetail);
      gallery.classList.remove("is-chip-swapping");
    }, 120);
  };

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

  const parseCarouselSlides = (tab) => {
    const srcs = tab.dataset.carouselSlides?.split("|").filter(Boolean) || [];
    const alts = tab.dataset.carouselAlts?.split("|") || [];
    const widths = tab.dataset.carouselWidths?.split("|") || [];
    const heights = tab.dataset.carouselHeights?.split("|") || [];

    if (srcs.length > 1) {
      return srcs.map((src, index) => ({
        src: src.trim(),
        alt: (alts[index] || "").trim(),
        width: widths[index]?.trim(),
        height: heights[index]?.trim(),
      }));
    }

    if (!tab.hasAttribute("data-carousel") || !carouselTrack) return [];

    return Array.from(carouselTrack.querySelectorAll(".gallery-carousel__slide img"))
      .map((slideImg) => ({
        src: slideImg.getAttribute("src") || "",
        alt: slideImg.alt || "",
        width: slideImg.width ? String(slideImg.width) : "",
        height: slideImg.height ? String(slideImg.height) : "",
      }))
      .filter((slide) => slide.src);
  };

  const stopCarousel = () => {
    if (!carouselTimer) return;
    clearInterval(carouselTimer);
    carouselTimer = null;
  };

  const applyCarouselTransform = (animate) => {
    if (!carouselTrack) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    carouselTrack.style.transition =
      animate && !reduced ? "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)" : "none";
    carouselTrack.style.transform = `translateX(${carouselIndex * -100}%)`;
  };

  const buildCarousel = (slides) => {
    if (!carouselTrack) return;
    const existingSlides = Array.from(carouselTrack.querySelectorAll(".gallery-carousel__slide"));
    const hasMatchingSlides =
      existingSlides.length === slides.length &&
      existingSlides.every((frame, index) => {
        const slideImg = frame.querySelector("img");
        return slideImg && slideImg.getAttribute("src") === slides[index].src;
      });

    if (!hasMatchingSlides) {
      carouselTrack.replaceChildren(
        ...slides.map((slide, index) => {
          const frame = document.createElement("div");
          frame.className = "gallery-carousel__slide";
          const slideImg = document.createElement("img");
          slideImg.src = slide.src;
          slideImg.alt = slide.alt;
          if (slide.width) slideImg.width = Number(slide.width);
          if (slide.height) slideImg.height = Number(slide.height);
          slideImg.loading = "lazy";
          slideImg.decoding = "async";
          frame.appendChild(slideImg);
          return frame;
        })
      );
    }

    carouselSlides = slides;
    carouselIndex = 0;
    applyCarouselTransform(false);
  };

  const advanceCarousel = () => {
    if (carouselSlides.length < 2) return;
    carouselIndex = (carouselIndex + 1) % carouselSlides.length;
    applyCarouselTransform(true);
    caption.textContent = carouselSlides[carouselIndex].alt || "";
    updateChips(activeTab, carouselIndex);
  };

  const hideCarousel = () => {
    stopCarousel();
    if (carouselEl) carouselEl.hidden = true;
    if (img) img.hidden = false;
  };

  const startCarousel = (slides) => {
    stopCarousel();
    buildCarousel(slides);
    if (carouselEl) carouselEl.hidden = false;
    if (img) img.hidden = true;
    caption.textContent = slides[0]?.alt || "";
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduced && slides.length > 1) {
      carouselTimer = window.setInterval(advanceCarousel, 3000);
    }
  };

  const render = (tab) => {
    const slides = parseCarouselSlides(tab);
    const useCarousel = tab.hasAttribute("data-carousel") && slides.length > 1 && carouselEl && carouselTrack;
    if (useCarousel) {
      if (url && tab.dataset.url) url.textContent = tab.dataset.url;
      updateChips(tab);
      updateCopy(tab);
      setSceneVisible(false);
      startCarousel(slides);
      settle();
      return;
    }

    hideCarousel();
    caption.textContent = tab.dataset.alt || "";
    if (url && tab.dataset.url) url.textContent = tab.dataset.url;
    updateChips(tab);
    updateCopy(tab);

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

  const sectionInner = gallery.closest(".product-section__inner");

  const setWideLayout = (tab) => {
    const wide = tab.hasAttribute("data-wide");
    gallery.classList.toggle("is-wide", wide);
    if (sectionInner) sectionInner.classList.toggle("is-gallery-wide", wide);
  };

  const show = (tab) => {
    activeTab = tab;
    tabs.forEach((other) => {
      const active = other === tab;
      other.classList.toggle("is-active", active);
      other.setAttribute("aria-selected", String(active));
      other.tabIndex = active ? 0 : -1;
    });

    setWideLayout(tab);
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

  const initialTab = tabs.find((tab) => tab.classList.contains("is-active")) || tabs[0];
  setWideLayout(initialTab);
  render(initialTab);

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
