/* main.js — Tillerstead
   - Responsive, accessible nav (ESC, outside click, resize)
   - High contrast mode toggle with localStorage
   - Smooth anchor scrolling (respects reduced motion)
   - Static-host form handling (GitHub Pages) + Netlify passthrough
*/
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* =========================
     NAV: mobile drawer
  ========================= */
  const navToggle = $(".nav-toggle");
  const header = $(".site-header");
  const navShell = header?.querySelector("[data-nav-container]");
  const nav = header?.querySelector("#site-nav");
  const navClose = header?.querySelector("[data-nav-close]");
  const navOverlay = header?.querySelector("[data-nav-overlay]");
  let lastFocus = null;
  const BP_DESKTOP = 920; // matches SCSS breakpoint for drawer

  const isNavOpen = () => !!navShell && navShell.classList.contains("is-open");

  const syncAria = (open) => {
    nav?.setAttribute("aria-expanded", String(open));
    navToggle?.setAttribute("aria-expanded", String(open));
    navToggle?.setAttribute(
      "aria-label",
      open ? "Close navigation menu" : "Open navigation menu",
    );
    if (navShell) navShell.dataset.open = open ? "true" : "false";
    if (nav) nav.dataset.open = open ? "true" : "false";
    if (navOverlay) navOverlay.dataset.open = open ? "true" : "false";
  };

  const onKeydownEsc = (e) => {
    if (e.key === "Escape" && isNavOpen()) {
      e.preventDefault();
      closeNav();
    }
  };

  const trapFocus = (e) => {
    if (!isNavOpen() || e.key !== "Tab") return;

    const focusables =
      nav &&
      $$(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        nav,
      ).filter((el) => el.offsetParent !== null);

    if (!focusables || !focusables.length) return;

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

  const outsideClick = (e) => {
    if (!isNavOpen()) return;
    if (header?.contains(e.target)) return;
    closeNav();
  };

  const openNav = () => {
    if (!nav || !navShell) return;
    lastFocus = document.activeElement;
    navShell.classList.add("is-open");
    nav.classList.add("is-open");
    syncAria(true);
    document.body.classList.add("nav-open");

    const firstLink = $("a, button", nav);
    firstLink?.focus();

    document.addEventListener("keydown", trapFocus);
    document.addEventListener("keydown", onKeydownEsc);
    document.addEventListener("click", outsideClick, true);
  };

  const closeNav = () => {
    if (!nav || !navShell) return;
    navShell.classList.remove("is-open");
    nav.classList.remove("is-open");
    syncAria(false);
    document.body.classList.remove("nav-open");

    document.removeEventListener("keydown", trapFocus);
    document.removeEventListener("keydown", onKeydownEsc);
    document.removeEventListener("click", outsideClick, true);

    (lastFocus || navToggle || document.body).focus?.();
  };

  navToggle?.addEventListener("click", () => {
    isNavOpen() ? closeNav() : openNav();
  });

  navClose?.addEventListener("click", closeNav);
  navOverlay?.addEventListener("click", closeNav);

  // Close nav on link click (mobile only)
  if (nav) {
    nav.addEventListener("click", (e) => {
      const link = e.target.closest("a");
      if (!link) return;
      if (window.innerWidth < BP_DESKTOP && isNavOpen()) {
        closeNav();
      }
    });
  }

  // Close nav if resized to desktop
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (window.innerWidth >= BP_DESKTOP && isNavOpen()) {
        closeNav();
      }
    }, 120);
  });

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
    contrastToggle?.setAttribute('aria-pressed', String(!!enabled));
    contrastToggle?.setAttribute('aria-label', enabled ? 'Disable high contrast mode' : 'Enable high contrast mode');
    if (typeof window.applyContrast === 'function') window.applyContrast(enabled ? 7 : 7); // keep AAA target
    if (typeof window.autoContrast === 'function') window.autoContrast();
  };

  try {
    const storedHC = localStorage.getItem(HC_KEY) === '1';
    applyHighContrast(storedHC);
  } catch (_) { /* ignore */ }

  contrastToggle?.addEventListener('click', () => {
    const enabled = !document.documentElement.classList.contains('high-contrast');
    applyHighContrast(enabled);
    try { localStorage.setItem(HC_KEY, enabled ? '1' : '0'); } catch (_) { /* ignore */ }
  });

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
        panel?.remove();
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
