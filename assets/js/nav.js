/* nav.js — Tillerstead
   Mobile navigation logic extracted from main.js for clarity and modularity.
   Handles responsive, accessible navigation drawer behavior.
*/
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  const navToggle = $(".nav-toggle");
  const header = $(".site-header");
  const navShell = header ? header.querySelector("[data-nav-container]") : null;
  const nav = header ? header.querySelector("#site-nav") : null;
  const navClose = header ? header.querySelector("[data-nav-close]") : null;
  const navOverlay = header ? header.querySelector("[data-nav-overlay]") : null;

  const BP_DESKTOP = 920;
  let lastFocus = null;

  const isMobileView = () => window.innerWidth < BP_DESKTOP;
  const isNavOpen = () => !!navShell && navShell.classList.contains("is-open");

  const syncAria = (open) => {
    const state = open ? "true" : "false";
    if (navToggle) {
      navToggle.setAttribute("aria-expanded", state);
      navToggle.setAttribute(
        "aria-label",
        open ? "Close navigation menu" : "Open navigation menu"
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
      nav
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

  if (navToggle) {
    navToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      isNavOpen() ? closeNav() : openNav();
    });
  }
  if (navClose) {
    navClose.addEventListener("click", (e) => {
      e.stopPropagation();
      closeNav();
    });
  }
  if (navOverlay) {
    const closeViaEvent = (e) => {
      e.stopPropagation();
      closeNav();
    };
    navOverlay.addEventListener("click", closeViaEvent);
    navOverlay.addEventListener("touchstart", closeViaEvent, { passive: true });
  }
  if (nav) {
    nav.addEventListener("click", (e) => {
      const link = e.target.closest("a");
      if (!link) return;
      if (isMobileView() && isNavOpen()) closeNav();
    });
  }
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (!isMobileView() && isNavOpen()) {
        closeNav();
      }
    }, 120);
  });
  if ("onorientationchange" in window) {
    window.addEventListener("orientationchange", () => {
      if (!isMobileView() && isNavOpen()) {
        setTimeout(closeNav, 200);
      }
    });
  }
  try {
    if (navShell && nav) {
      navShell.classList.remove("is-open");
      nav.classList.remove("is-open");
      document.body.classList.remove("nav-open");
      syncAria(false);
    }
  } catch (_) { /* noop */ }
})();
=======
