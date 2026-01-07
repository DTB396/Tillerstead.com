// run-nav-shim.js — minimal DOM shim to execute browser nav.js under Node
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const navPath = path.resolve(__dirname, 'assets', 'js', 'nav.js');
const globalObj = globalThis;

// Minimal classList shim
function makeClassList() {
  const s = new Set();
  return {
    add(c) {
      s.add(c);
    },
    remove(c) {
      s.delete(c);
    },
    contains(c) {
      return s.has(c);
    },
    toString() {
      return Array.from(s).join(' ');
    },
  };
}

// Create a simple element factory
function createElement(tag) {
  const listeners = {};
  const el = {
    tag,
    attributes: {},
    dataset: {},
    classList: makeClassList(),
    listeners,
    focusCalled: false,
    focus() {
      globalObj.document.activeElement = this;
      this.focusCalled = true;
    },
    setAttribute(k, v) {
      this.attributes[k] = String(v);
      if (k.startsWith('data-')) this.dataset[k.slice(5)] = v;
    },
    getAttribute(k) {
      return this.attributes[k];
    },
    removeAttribute(k) {
      delete this.attributes[k];
      if (k.startsWith('data-')) delete this.dataset[k.slice(5)];
    },
    addEventListener(ev, fn) {
      listeners[ev] = listeners[ev] || [];
      listeners[ev].push(fn);
    },
    removeEventListener(ev, fn) {
      if (!listeners[ev]) return;
      listeners[ev] = listeners[ev].filter((f) => f !== fn);
    },
    dispatchEvent(ev) {
      (listeners[ev.type] || []).forEach((fn) => {
        try {
          fn(ev);
        } catch (e) {
          console.error(e);
        }
      });
    },
    querySelector(sel) {
      // minimal for nav.querySelector('button, a')
      if (sel && (sel.includes('button') || sel.includes('a')))
        return this._button || null;
      return null;
    },
    querySelectorAll() {
      return [];
    },
    closest() {
      return null;
    },
  };
  return el;
}

// Global window/document shims
const windowObj = (globalObj.window = globalObj.window || {});
const documentObj = (globalObj.document = globalObj.document || {});
const window = windowObj;
const document = documentObj;

window.innerWidth = 800; // mobile by default (<920)
window.requestAnimationFrame = (cb) => setTimeout(cb, 0);

// document
const header = createElement('header');
const navShell = createElement('navShell');
const nav = createElement('nav');
const navToggle = createElement('button');
const navClose = createElement('button');
const navOverlay = createElement('overlay');

// wire simple relationships
header.querySelector = (sel) => {
  if (!sel) return null;
  if (sel === '[data-nav-container]') return navShell;
  if (sel === '#mobile-nav') return nav;
  return null;
};

// nav children
nav._button = navClose; // so nav.querySelector('button, a') returns navClose

// basic attribute defaults
nav.setAttribute('aria-expanded', 'false');
navShell.setAttribute = function (k, v) {
  this.attributes = this.attributes || {};
  this.attributes[k] = v;
  if (k.startsWith('data-')) this.dataset[k.slice(5)] = v;
};
navShell.getAttribute = function (k) {
  return (this.attributes || {})[k];
};

// simple body with classList
const body = { classList: makeClassList() };

// document methods
document.querySelector = (sel) => {
  if (!sel) return null;
  switch (sel) {
    case '.nav-toggle':
      return navToggle;
    case '.site-header':
      return header;
    case '[data-nav-container]':
      return navShell;
    case '#mobile-nav':
      return nav;
    case '[data-nav-close]':
      return navClose;
    case '[data-nav-overlay]':
      return navOverlay;
    default:
      return null;
  }
};
document.querySelectorAll = () => [];
document.body = body;
document.activeElement = body;
document.addEventListener = (_event, _handler) => {
  /* noop for tests */
};
document.removeEventListener = (_event, _handler) => {
  /* noop */
};

// minimal console
globalObj.console = console;

// minimal window.addEventListener
window.addEventListener = (_event, _handler) => {
  /* noop */
};

// Execute the nav script in this environment
try {
  // Require the nav.js file so it runs against the shims above
  require(navPath);
  console.log(
    'nav.js loaded. Exposed globals:',
    typeof window.tsOpenNav === 'function'
      ? 'tsOpenNav() available'
      : 'not available',
  );
} catch (err) {
  console.error('Error loading nav.js:', err);
  process.exit(1);
}

// Run open/close sequence and print state
const dumpState = (label) => {
  console.log('\n== ' + label + ' ==');
  console.log('navShell classes:', navShell.classList.toString());
  console.log('nav classes:', nav.classList.toString());
  console.log('body classes:', document.body.classList.toString());
  console.log(
    'nav aria-expanded:',
    nav.getAttribute && nav.getAttribute('aria-expanded'),
  );
  console.log('nav dataset.open:', nav.dataset && nav.dataset.open);
  console.log(
    'navToggle aria-expanded:',
    navToggle.getAttribute && navToggle.getAttribute('aria-expanded'),
  );
};

// Open nav via exposed API if available
if (typeof window.tsOpenNav === 'function') {
  window.tsOpenNav();
  setTimeout(() => {
    dumpState('After openNav');
    // Close
    if (typeof window.tsCloseNav === 'function') window.tsCloseNav();
    setTimeout(() => {
      dumpState('After closeNav');
      process.exit(0);
    }, 50);
  }, 50);
} else {
  console.error('tsOpenNav not exposed — cannot run open/close');
  process.exit(1);
}
