  const PROJECTS = {{ projects | jsonify | replace: "</", "<\/" }}
  /* Image data – shared with slider and initial markup via _data/portfolio.yml */
  const PROJECTS = {{ projects | jsonify | replace: '</', '<\/' }};

  (function () {
    const $ = (s, c = document) => c.querySelector(s);
    const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

    // Base assets folder (works for both project sites and custom domains)
    const base = "{{ '/assets/img/' | relative_url }}";
    const siteRoot = "{{ '' | relative_url }}"; // "" on custom domain, "/repo" on project site

    function toAssetUrl(p) {
      if (!p) return "";
      if (/^https?:\/\//i.test(p)) return p;
      if (p.startsWith("/")) return siteRoot + p;
      return base + p;
    }

    const slider = $("#gallery-slider");
    const imgEl = $("#slide-image");
    const captionEl = $("#slide-caption-text");
    const metaEl = $("#slide-meta");
    const dotsEl = $("#slider-dots");
    const prevBtn = $(".slider-arrow.prev");
    const nextBtn = $(".slider-arrow.next");
    const chips = $$(".chip");

    const tagLabels = {
      all: "All work",
      showers: "Showers & Wet Areas",
      backsplashes: "Backsplashes",
      floors: "Floors & Large-Format Tile",
      remodels: "Remodels & Full Bath Scopes",
      repairs: "Repairs & Code Corrections",
    };

    let currentFilter = "all";
    let slides = [];
    let index = 0;
    let autoplayId = null;
    const AUTOPLAY_MS = 3200;

    function syncChips() {
      chips.forEach((chip) => {
        const active = chip.dataset.filter === currentFilter;
        chip.classList.toggle("is-active", active);
        chip.setAttribute("aria-selected", active ? "true" : "false");
      });
    }

    function buildDots() {
      dotsEl.innerHTML = "";
      slides.forEach((_, i) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "slider-dot";
        dot.dataset.index = i;
        dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
        dot.addEventListener("click", () => {
          showSlide(i);
          restartAutoplay();
        });
        dotsEl.appendChild(dot);
      });
    }

    function preloadNext() {
      if (!slides.length) return;
      const nextIdx = (index + 1) % slides.length;
      const nextSlide = slides[nextIdx];
      if (nextSlide && nextSlide.file) {
        const img = new window.Image();
        img.src = toAssetUrl(nextSlide.file);
      }
    }

    function showSlide(newIndex) {
      if (!slides.length) return;

      index = (newIndex + slides.length) % slides.length;
      const slide = slides[index];

      const sourceEl = document.getElementById("slide-source-webp");
      const hasWebp = !!slide.file_webp;

      if (sourceEl) {
        if (hasWebp) {
          sourceEl.srcset = toAssetUrl(slide.file_webp);
        } else {
          sourceEl.removeAttribute("srcset");
        }
      }

      imgEl.src = toAssetUrl(slide.file);
      imgEl.alt =
        slide.alt ||
        "Project photo by Tillerstead LLC, installed per TCNA/New Jersey HIC standards.";
      captionEl.textContent = slide.caption || "";
      metaEl.textContent = `${tagLabels[currentFilter] || "All work"} · ${index + 1} of ${slides.length}`;

      $$(".slider-dot", dotsEl).forEach((dot) => {
        dot.classList.toggle("is-active", Number(dot.dataset.index) === index);
      });

      preloadNext();
    }

    function nextSlide() { showSlide(index + 1); }
    function prevSlide() { showSlide(index - 1); }

    function startAutoplay() {
      if (autoplayId || slides.length <= 1) return;
      autoplayId = setInterval(nextSlide, AUTOPLAY_MS);
    }

    function stopAutoplay() {
      if (!autoplayId) return;
      clearInterval(autoplayId);
      autoplayId = null;
    }

    function restartAutoplay() {
      stopAutoplay();
      startAutoplay();
    }

    function updateUrlFilter() {
      const url = new URL(window.location);
      if (currentFilter === "all") url.searchParams.delete("filter");
      else url.searchParams.set("filter", currentFilter);
      history.replaceState(null, "", url);
    }

    function setFilter(filter) {
      currentFilter = filter || "all";

      slides =
        currentFilter === "all"
          ? PROJECTS.slice()
          : PROJECTS.filter((p) => (p.tags || []).includes(currentFilter));

      syncChips();

      if (!slides.length) {
        slider.setAttribute("aria-busy", "true");
        imgEl.src = "{{ fallback_src }}";
        imgEl.alt = "{{ fallback_alt | escape }}";
        captionEl.textContent = "{{ fallback_caption }}";
        metaEl.textContent = tagLabels[currentFilter] || "All work";
        dotsEl.innerHTML = "";
        stopAutoplay();
        updateUrlFilter();
        return;
      }

      slider.removeAttribute("aria-busy");
      index = 0;
      buildDots();
      showSlide(0);
      restartAutoplay();
      updateUrlFilter();
    }

    // Events
    nextBtn.addEventListener("click", () => { nextSlide(); restartAutoplay(); });
    prevBtn.addEventListener("click", () => { prevSlide(); restartAutoplay(); });

    slider.addEventListener("mouseenter", stopAutoplay);
    slider.addEventListener("mouseleave", startAutoplay);
    slider.addEventListener("focusin", stopAutoplay);
    slider.addEventListener("focusout", startAutoplay);

    window.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { nextSlide(); restartAutoplay(); }
      else if (e.key === "ArrowLeft") { prevSlide(); restartAutoplay(); }
    });

    chips.forEach((chip) => {
      if (!chip.dataset.filter) {
        chip.dataset.filter = (chip.textContent || "").toLowerCase();
      }
      chip.addEventListener("click", () => setFilter(chip.dataset.filter));
    });

    // Initial filter from URL or hash
    const params = new URL(window.location).searchParams;
    const initialFilter =
      params.get("filter") ||
      (window.location.hash || "").replace("#", "") ||
      "all";

    setFilter(initialFilter);
  })();