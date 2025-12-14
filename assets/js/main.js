/* main.js — Tillerstead
   - Responsive, accessible nav (ESC, outside click, resize, touch)
   - High contrast mode toggle with localStorage
   - Smooth anchor scrolling (respects reduced motion)
   - Static-host form handling (GitHub Pages) + Netlify passthrough
   - Modern browser support with fallbacks
*/
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

<<<<<<< HEAD
  // ...existing code...
=======
    /* =========================
     NAV: mobile drawer
  ========================= */
  const navToggle = $(".nav-toggle");
  const header = $(".site-header");
  const navShell = header ? header.querySelector("[data-nav-container]") : null;
  const nav = header ? header.querySelector("#site-nav") : null;
  const navClose = header ? header.querySelector("[data-nav-close]") : null;
  const navOverlay = header ? header.querySelector("[data-nav-overlay]") : null;

  const BP_DESKTOP = 920; // matches SCSS breakpoint
  let lastFocus = null;

  const isMobileView = () => window.innerWidth < BP_DESKTOP;
  const isNavOpen = () =>
    !!navShell && navShell.classList.contains("is-open");

  const syncAria = (open) => {
    const state = open ? "true" : "false";

    if (navToggle) {
      navToggle.setAttribute("aria-expanded", state);
      navToggle.setAttribute(
        "aria-label",
        open ? "Close navigation menu" : "Open navigation menu",
      );
    }
    if (nav) {
      nav.setAttribute("aria-expanded", state);
      nav.dataset.open = state;
    }
    if (navShell) navShell.dataset.open = state;
    if (navOverlay) navOverlay.dataset.open = state;
  };

  const handleEsc = (e) => {
    if (!isNavOpen()) return;
    if (e.key === "Escape" || e.key === "Esc") {
      e.preventDefault();
      closeNav();
    }
  };

  const trapFocus = (e) => {
    if (!isNavOpen() || e.key !== "Tab" || !nav) return;

    const focusables = $$(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      nav,
    ).filter((el) => el.offsetParent !== null);

    if (!focusables.length) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const openNav = () => {
    if (!navShell || !nav || !isMobileView()) return;

    lastFocus = document.activeElement;

    navShell.classList.add("is-open");
    nav.classList.add("is-open");
    document.body.classList.add("nav-open");
    syncAria(true);

    // Focus first actionable element in drawer
    const first = $("button, a", nav) || nav;
    requestAnimationFrame(() => {
      if (first && typeof first.focus === "function") first.focus();
    });

    document.addEventListener("keydown", trapFocus);
    document.addEventListener("keydown", handleEsc);
  };

  const closeNav = () => {
    if (!navShell || !nav) return;

    navShell.classList.remove("is-open");
    nav.classList.remove("is-open");
    document.body.classList.remove("nav-open");
    syncAria(false);

    document.removeEventListener("keydown", trapFocus);
    document.removeEventListener("keydown", handleEsc);

    const focusTarget = lastFocus || navToggle || document.body;
    requestAnimationFrame(() => {
      if (focusTarget && typeof focusTarget.focus === "function") {
        focusTarget.focus();
      }
    });
  };

  // Toggle button
  if (navToggle) {
    navToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      isNavOpen() ? closeNav() : openNav();
    });
  }

  // Close button
  if (navClose) {
    navClose.addEventListener("click", (e) => {
      e.stopPropagation();
      closeNav();
    });
  }

  // Backdrop
  if (navOverlay) {
    navOverlay.addEventListener("click", (e) => {
      e.stopPropagation();
      closeNav();
    });
  }

  // Close nav when a link is clicked (mobile)
  if (nav) {
    nav.addEventListener("click", (e) => {
      const link = e.target.closest("a");
      if (!link) return;
      if (isMobileView() && isNavOpen()) closeNav();
    });
  }

  // On resize to desktop, force-close
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (!isMobileView() && isNavOpen()) {
        closeNav();
      }
    }, 120);
  });

  // Orientation change safety
  if ("onorientationchange" in window) {
    window.addEventListener("orientationchange", () => {
      if (!isMobileView() && isNavOpen()) {
        setTimeout(closeNav, 200);
      }
    });
  }
>>>>>>> cd94431d4595c868507e3ce0fccbb2a3869edcde
  /* =========================
     HIGH CONTRAST MODE TOGGLE
     - Adds html.high-contrast class
     - Persists preference in localStorage
     - Re-runs contrast + autoContrast for recalculation
  ========================= */
  const HC_KEY = "ts:high-contrast";
  const contrastToggle = document.querySelector('[data-contrast-toggle]');

  const applyHighContrast = (enabled) => {
    document.documentElement.classList.toggle('high-contrast', !!enabled);
    if (contrastToggle) {
      contrastToggle.setAttribute('aria-pressed', String(!!enabled));
      contrastToggle.setAttribute('aria-label', enabled ? 'Disable high contrast mode' : 'Enable high contrast mode');
    }
    if (typeof window.applyContrast === 'function') window.applyContrast(enabled ? 7 : 7); // keep AAA target
    if (typeof window.autoContrast === 'function') window.autoContrast();
  };

  try {
    const storedHC = localStorage.getItem(HC_KEY) === '1';
    applyHighContrast(storedHC);
  } catch (_) { /* ignore */ }

  if (contrastToggle) {
    contrastToggle.addEventListener('click', () => {
      const enabled = !document.documentElement.classList.contains('high-contrast');
      applyHighContrast(enabled);
      try { localStorage.setItem(HC_KEY, enabled ? '1' : '0'); } catch (_) { /* ignore */ }
    });
  }

  /* =========================
     KEYBOARD SHORTCUTS
     Alt+Shift+C : Toggle High Contrast
     Alt+Shift+A : Toggle Audit Overlay (reload if enabling)
  ========================= */
  document.addEventListener('keydown', (e) => {
    if (!e.altKey || !e.shiftKey) return;
    if (e.code === 'KeyC') {
      e.preventDefault();
      const enabled = !document.documentElement.classList.contains('high-contrast');
      applyHighContrast(enabled);
    try { localStorage.setItem(HC_KEY, enabled ? '1' : '0'); } catch (_) { /* ignore */ }
    } else if (e.code === 'KeyA') {
      e.preventDefault();
      const hasFlag = localStorage.getItem('ts:audit') === '1';
      if (hasFlag) {
        localStorage.removeItem('ts:audit');
        // Remove existing panel if present without reload
        const panel = document.querySelector('.ts-dev-overlay');
        if (panel) panel.remove();
      } else {
        localStorage.setItem('ts:audit', '1');
        // Reload to allow dev-overlay.js to initialize
        location.search.includes('audit=1') ? location.reload() : location.href = location.pathname + '?audit=1';
      }
    }
  });

  /* =========================
     SMOOTH SCROLL (anchors)
     - respects reduced motion
  ========================= */
  const prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;

    const href = a.getAttribute("href");
    if (!href || href === "#") return;

    const id = href.slice(1);
    const target = document.getElementById(id);
    if (!target) return;

    e.preventDefault();
    const behavior = prefersReduced ? "auto" : "smooth";
    target.scrollIntoView({ behavior, block: "start" });
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
    setTimeout(() => target.removeAttribute("tabindex"), 1000);
  });

})();
