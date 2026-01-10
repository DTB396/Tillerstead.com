/**
 * auto-contrast.js
 * Tillerstead.com – Accessibility Utility
 *
 * Ensures WCAG 2.1 AA-compliant color contrast for dynamic UI elements.
 *
 * Technical Authority: TCNA 2024, New Jersey HIC compliance, WCAG 2.1 §1.4.3
 *
 * This script dynamically adjusts foreground color for optimal readability
 * against any background, supporting accessible, standards-driven design.
 *
 * For technical details, see /.ai/DOMAIN.md and /.ai/COMPLIANCE.md.
 */

(() => {
  'use strict';

  /**
   * Calculates relative luminance of an RGB color.
   * @param {number} r - Red (0-255)
   * @param {number} g - Green (0-255)
   * @param {number} b - Blue (0-255)
   * @returns {number} Relative luminance (0-1)
   */
  function luminance(r, g, b) {
    const a = [r, g, b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
  }

  /**
   * Calculates contrast ratio between two RGB colors.
   * @param {Array} rgb1 - [r, g, b]
   * @param {Array} rgb2 - [r, g, b]
   * @returns {number} Contrast ratio
   */
  function contrastRatio(rgb1, rgb2) {
    const lum1 = luminance(...rgb1);
    const lum2 = luminance(...rgb2);
    return (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);
  }

  /**
   * Parses a CSS color string to [r, g, b].
   * Supports hex (#fff, #ffffff), rgb(), and named colors.
   * @param {string} color
   * @returns {Array|null}
   */
  function parseColor(color) {
    const ctx = document.createElement('canvas').getContext('2d');
    ctx.fillStyle = color;
    const computed = ctx.fillStyle;
    // Now ctx.fillStyle is always in rgb(r, g, b) or #rrggbb
    if (computed.startsWith('#')) {
      let hex = computed.slice(1);
      if (hex.length === 3)
        hex = hex
          .split('')
          .map((x) => x + x)
          .join('');
      const num = parseInt(hex, 16);
      return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
    }
    const match = computed.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (match)
      return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
    return null;
  }

  /**
   * Sets optimal foreground color (black or white) for contrast.
   * @param {HTMLElement} el
   */
  function setAutoContrast(el) {
    const bg = window.getComputedStyle(el).backgroundColor;
    const rgb = parseColor(bg);
    if (!rgb) return;
    // WCAG AA: 4.5:1 for normal text
    const white = [255, 255, 255];
    const black = [0, 0, 0];
    const contrastWhite = contrastRatio(rgb, white);
    const _contrastBlack = contrastRatio(rgb, black);
    el.style.color = contrastWhite >= 4.5 ? '#fff' : '#111';
  }

  /**
   * Applies auto-contrast to all elements with [data-auto-contrast]
   */
  function applyAutoContrast() {
    document.querySelectorAll('[data-auto-contrast]').forEach(setAutoContrast);
  }

  // Expose for use in theme scripts and dynamic content
  if (typeof window !== 'undefined') {
    window.autoContrast = applyAutoContrast;
    // Run on DOMContentLoaded for static content
    document.addEventListener('DOMContentLoaded', applyAutoContrast);
  }
})();
