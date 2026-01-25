/**
 * TillerPro Logo System
 * Adaptive, flexible logo rendering for all environments
 * Supports: PDF, Web, Console, SVG, PNG, Text fallback
 * 
 * @copyright 2025-2026 Tillerstead LLC. All rights reserved.
 * @license Proprietary - Unauthorized copying prohibited
 * @version 2.0.0
 */

(function() {
  'use strict';

  // ==
  // PERFORMANCE & FEATURE DETECTION
  // ==

  const FEATURES = Object.freeze({
    supportsWebP: null,      // Lazy-detected
    supportsSVG: null,       // Lazy-detected
    supportsIntersection: typeof IntersectionObserver !== 'undefined',
    supportsPrefers: typeof window !== 'undefined' && window.matchMedia,
    reducedMotion: false,    // Lazy-detected
    darkMode: false          // Lazy-detected
  });

  // Detect features once on load
  function detectFeatures() {
    if (typeof window === 'undefined') return;
    
    // Reduced motion preference
    FEATURES.reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches || false;
    
    // Dark mode preference
    FEATURES.darkMode = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches || false;
    
    // WebP support (async, cached)
    if (FEATURES.supportsWebP === null) {
      const canvas = document.createElement('canvas');
      FEATURES.supportsWebP = canvas.getContext?.('2d') && 
        canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }
    
    // SVG support
    if (FEATURES.supportsSVG === null) {
      FEATURES.supportsSVG = document.implementation?.hasFeature?.(
        'http://www.w3.org/TR/SVG11/feature#Image', '1.1'
      ) || false;
    }
  }

  // ==
  // PROTECTED LOGO CONFIGURATION
  // ==

  const LOGO_CONFIG = Object.freeze({
    // Brand identity (protected)
    brand: Object.freeze({
      name: 'TillerPro',
      company: 'TILLERSTEAD LLC',
      tagline: 'Expert Tile Installation',
      monogram: 'TP'
    }),

    // Color schemes for different contexts
    colors: Object.freeze({
      light: Object.freeze({
        primary: '#1a3d2e',
        secondary: '#c9a227',
        text: '#1a3d2e',
        background: '#ffffff'
      }),
      dark: Object.freeze({
        primary: '#2dd4bf',
        secondary: '#fbbf24',
        text: '#ffffff',
        background: '#1a1a1a'
      }),
      print: Object.freeze({
        primary: '#1a3d2e',
        secondary: '#c9a227',
        text: '#000000',
        background: '#ffffff'
      })
    }),

    // Asset paths (relative to site root)
    assets: Object.freeze({
      svg: '/assets/img/logo/tillerpro-logo.svg',
      png: Object.freeze({
        small: '/assets/img/logo/logo-wolf-crest-compact.png',
        medium: '/assets/img/logo/logo-wolf-crest.png',
        large: '/assets/img/logo/logo-wolf-crest@2x.png',
        header: '/assets/img/logo/logo-wolf-crest-header.png'
      }),
      webp: Object.freeze({
        small: '/assets/img/logo/logo-wolf-crest-compact.webp',
        medium: '/assets/img/logo/logo-wolf-crest.webp',
        large: '/assets/img/logo/logo-wolf-crest@2x.webp',
        header: '/assets/img/logo/logo-wolf-crest-header.webp'
      })
    }),

    // Console/Terminal ASCII art (for CLI tools, logs)
    ascii: Object.freeze({
      compact: `
╔════════════════╗
║  TILLERSTEAD   ║
║   TillerPro    ║
╚════════════════╝`,
      banner: `
╔══════════════════════════════════════════════════════╗
║                                                      ║
║   ████████╗██╗██╗     ██╗     ███████╗██████╗       ║
║   ╚══██╔══╝██║██║     ██║     ██╔════╝██╔══██╗      ║
║      ██║   ██║██║     ██║     █████╗  ██████╔╝      ║
║      ██║   ██║██║     ██║     ██╔══╝  ██╔══██╗      ║
║      ██║   ██║███████╗███████╗███████╗██║  ██║      ║
║      ╚═╝   ╚═╝╚══════╝╚══════╝╚══════╝╚═╝  ╚═╝      ║
║                                                      ║
║               ██████╗ ██████╗  ██████╗              ║
║               ██╔══██╗██╔══██╗██╔═══██╗             ║
║               ██████╔╝██████╔╝██║   ██║             ║
║               ██╔═══╝ ██╔══██╗██║   ██║             ║
║               ██║     ██║  ██║╚██████╔╝             ║
║               ╚═╝     ╚═╝  ╚═╝ ╚═════╝              ║
║                                                      ║
║          Expert Tile Installation Tools              ║
╚══════════════════════════════════════════════════════╝`,
      simple: '[TillerPro]'
    })
  });

  // ==
  // BASE64 ENCODED LOGOS (for PDF/offline)
  // ==

  // Wolf crest logo - compact version (100x100)
  const LOGO_BASE64_COMPACT = 'data:image/png;base64,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';

  // SVG as data URI (inline, scalable)
  const LOGO_SVG_DATA_URI = `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <defs>
    <linearGradient id="emerald-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#10b981"/>
      <stop offset="100%" style="stop-color:#0d4b3b"/>
    </linearGradient>
    <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#fbbf24"/>
      <stop offset="100%" style="stop-color:#d4a84b"/>
    </linearGradient>
  </defs>
  <circle cx="24" cy="24" r="22" fill="url(#emerald-gradient)" stroke="#0d4b3b" stroke-width="1.5"/>
  <g fill="none" stroke="#ffffff" stroke-width="0.75" opacity="0.3">
    <line x1="16" y1="8" x2="16" y2="40"/>
    <line x1="32" y1="8" x2="32" y2="40"/>
    <line x1="8" y1="16" x2="40" y2="16"/>
    <line x1="8" y1="32" x2="40" y2="32"/>
  </g>
  <rect x="12" y="12" width="24" height="24" rx="2" fill="none" stroke="url(#gold-gradient)" stroke-width="2"/>
  <g stroke="url(#gold-gradient)" stroke-width="1.5" stroke-linecap="round">
    <line x1="18" y1="12" x2="18" y2="15"/>
    <line x1="24" y1="12" x2="24" y2="17"/>
    <line x1="30" y1="12" x2="30" y2="15"/>
    <line x1="12" y1="18" x2="15" y2="18"/>
    <line x1="12" y1="24" x2="17" y2="24"/>
    <line x1="12" y1="30" x2="15" y2="30"/>
  </g>
  <g fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-weight="700">
    <text x="24" y="30" font-size="12" text-anchor="middle">TP</text>
  </g>
</svg>`)}`;

  // ==
  // LOGO SYSTEM CLASS
  // ==

  class LogoSystem {
    constructor(options = {}) {
      this.config = LOGO_CONFIG;
      this.environment = this.detectEnvironment();
      this.colorScheme = options.colorScheme || this._detectColorScheme();
      this._imageCache = new Map();
      this._observers = new Map();
      
      // Auto-detect features on instantiation
      if (typeof window !== 'undefined') {
        detectFeatures();
        this._setupColorSchemeListener();
      }
    }

    /**
     * Detect the current runtime environment
     */
    detectEnvironment() {
      // Node.js / CLI
      if (typeof window === 'undefined') {
        return 'node';
      }
      // PDF context (jsPDF)
      if (typeof window.jspdf !== 'undefined' || typeof window.jsPDF !== 'undefined') {
        return 'pdf-capable';
      }
      // Browser with full support
      if (typeof document !== 'undefined' && document.createElement) {
        return 'browser';
      }
      // Minimal/unknown
      return 'minimal';
    }

    /**
     * Auto-detect preferred color scheme
     */
    _detectColorScheme() {
      if (typeof window === 'undefined') return 'light';
      return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ? 'dark' : 'light';
    }

    /**
     * Listen for color scheme changes
     */
    _setupColorSchemeListener() {
      if (!FEATURES.supportsPrefers) return;
      
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e) => {
        this.colorScheme = e.matches ? 'dark' : 'light';
        FEATURES.darkMode = e.matches;
        this._dispatchSchemeChange();
      };
      
      // Modern API
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handler);
      } else if (mediaQuery.addListener) {
        mediaQuery.addListener(handler);
      }
    }

    /**
     * Dispatch color scheme change event
     */
    _dispatchSchemeChange() {
      if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tillerpro:colorscheme', {
          detail: { scheme: this.colorScheme }
        }));
      }
    }

    /**
     * Get the best logo format for current environment
     * @param {string} context - 'web', 'pdf', 'console', 'email'
     * @param {object} options - { size: 'small'|'medium'|'large', format: 'svg'|'png'|'webp' }
     */
    getLogo(context = 'web', options = {}) {
      const { size = 'medium', format = 'auto', darkMode = FEATURES.darkMode } = options;

      switch (context) {
        case 'pdf':
          // PDFs need raster images (PNG)
          return {
            type: 'base64',
            data: LOGO_BASE64_COMPACT,
            format: 'PNG',
            width: 100,
            height: 100,
            fallback: this.getTextLogo()
          };

        case 'console':
        case 'terminal':
        case 'cli':
          return {
            type: 'ascii',
            data: this.config.ascii[size === 'large' ? 'banner' : size === 'small' ? 'simple' : 'compact'],
            colored: this.getColoredAscii(darkMode)
          };

        case 'email':
          // Email clients prefer PNG with fallback
          return {
            type: 'url',
            data: this.config.assets.png[size] || this.config.assets.png.medium,
            alt: `${this.config.brand.name} - ${this.config.brand.tagline}`,
            fallback: this.getTextLogo()
          };

        case 'web':
        default:
          // Web prefers SVG with PNG fallback
          if (format === 'svg' || (format === 'auto' && this.supportsSVG())) {
            return {
              type: 'svg',
              data: LOGO_SVG_DATA_URI,
              path: this.config.assets.svg,
              fallback: this.config.assets.png[size]
            };
          }
          // WebP if supported, else PNG
          if (format === 'webp' || (format === 'auto' && this.supportsWebP())) {
            return {
              type: 'url',
              data: this.config.assets.webp[size] || this.config.assets.webp.medium,
              fallback: this.config.assets.png[size]
            };
          }
          return {
            type: 'url',
            data: this.config.assets.png[size] || this.config.assets.png.medium
          };
      }
    }

    /**
     * Preload logo images for better UX
     */
    preload(sizes = ['small', 'medium']) {
      if (typeof document === 'undefined') return;
      
      const head = document.head;
      sizes.forEach(size => {
        // Preload WebP if supported
        if (this.supportsWebP() && this.config.assets.webp[size]) {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.as = 'image';
          link.type = 'image/webp';
          link.href = this.config.assets.webp[size];
          head.appendChild(link);
        } else if (this.config.assets.png[size]) {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.as = 'image';
          link.type = 'image/png';
          link.href = this.config.assets.png[size];
          head.appendChild(link);
        }
      });
    }

    /**
     * Get logo as Base64 for embedding (PDF, inline images)
     */
    getBase64Logo(size = 'compact') {
      return LOGO_BASE64_COMPACT;
    }

    /**
     * Get SVG logo as data URI
     */
    getSVGDataUri() {
      return LOGO_SVG_DATA_URI;
    }

    /**
     * Get text-only logo (ultimate fallback)
     */
    getTextLogo(style = 'bracket') {
      const { brand } = this.config;
      switch (style) {
        case 'full':
          return `${brand.company} | ${brand.name}`;
        case 'monogram':
          return brand.monogram;
        case 'simple':
          return brand.name;
        case 'bracket':
        default:
          return `[${brand.name}]`;
      }
    }

    /**
     * Get colored ASCII art for terminals that support ANSI
     */
    getColoredAscii(darkMode = false) {
      const colors = darkMode ? this.config.colors.dark : this.config.colors.light;
      // ANSI color codes
      const green = '\x1b[32m';
      const gold = '\x1b[33m';
      const reset = '\x1b[0m';
      const bold = '\x1b[1m';

      return `${green}${bold}
╔══════════════════════════════════════╗
║  ${gold}████████╗██████╗${green}                    ║
║  ${gold}╚══██╔══╝██╔══██╗${green}    TillerPro      ║
║     ${gold}██║   ██████╔╝${green}                   ║
║     ${gold}██║   ██╔═══╝${green}   Expert Tile      ║
║     ${gold}██║   ██║${green}       Installation     ║
║     ${gold}╚═╝   ╚═╝${green}                        ║
╚══════════════════════════════════════╝${reset}`;
    }

    /**
     * Generate HTML img element with fallbacks and accessibility
     */
    getHTMLElement(options = {}) {
      const { 
        size = 'medium', 
        alt = `${this.config.brand.name} - ${this.config.brand.tagline}`,
        className = '', 
        darkMode = FEATURES.darkMode,
        lazy = true,
        animate = !FEATURES.reducedMotion
      } = options;
      
      const logo = this.getLogo('web', { size, darkMode });
      const animClass = animate ? 'logo--animate' : '';
      const loadingAttr = lazy ? 'loading="lazy"' : '';
      const decoding = 'decoding="async"';
      
      // ARIA attributes for accessibility
      const ariaLabel = `aria-label="${this.config.brand.name} logo"`;
      
      if (logo.type === 'svg') {
        return `<img src="${logo.data}" alt="${alt}" class="logo ${className} ${animClass}" 
          ${loadingAttr} ${decoding} ${ariaLabel} role="img"
          onerror="this.onerror=null;this.src='${logo.fallback}'">`;
      }
      
      return `<img src="${logo.data}" alt="${alt}" class="logo ${className} ${animClass}" 
        ${loadingAttr} ${decoding} ${ariaLabel} role="img"
        ${logo.fallback ? `onerror="this.onerror=null;this.src='${logo.fallback}'"` : ''}>`;
    }

    /**
     * Generate picture element with responsive sources and lazy loading
     */
    getPictureElement(options = {}) {
      const { 
        alt = `${this.config.brand.name} - ${this.config.brand.tagline}`,
        className = '', 
        sizes = '(max-width: 768px) 48px, 96px',
        lazy = true,
        animate = !FEATURES.reducedMotion
      } = options;
      
      const { assets } = this.config;
      const animClass = animate ? 'logo--animate' : '';
      const loadingAttr = lazy ? 'loading="lazy"' : '';

      return `
<picture class="logo-picture ${className}">
  <source srcset="${assets.webp.small} 48w, ${assets.webp.medium} 96w, ${assets.webp.large} 192w" 
          sizes="${sizes}" type="image/webp">
  <source srcset="${assets.png.small} 48w, ${assets.png.medium} 96w, ${assets.png.large} 192w" 
          sizes="${sizes}" type="image/png">
  <img src="${assets.png.medium}" alt="${alt}" ${loadingAttr} decoding="async" 
       class="logo__img ${animClass}" role="img" aria-label="${this.config.brand.name} logo">
</picture>`;
    }

    /**
     * Create lazy-loaded logo with intersection observer
     */
    createLazyLogo(container, options = {}) {
      if (typeof document === 'undefined') return null;
      
      const { size = 'medium', threshold = 0.1 } = options;
      const placeholder = document.createElement('div');
      placeholder.className = 'logo-placeholder';
      placeholder.setAttribute('aria-hidden', 'true');
      placeholder.innerHTML = `<span class="logo-placeholder__text">${this.config.brand.monogram}</span>`;
      
      if (!FEATURES.supportsIntersection) {
        // Fallback: load immediately
        placeholder.innerHTML = this.getHTMLElement({ size, lazy: false });
        container.appendChild(placeholder);
        return placeholder;
      }
      
      container.appendChild(placeholder);
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            placeholder.innerHTML = this.getHTMLElement({ size, lazy: false });
            observer.disconnect();
          }
        });
      }, { threshold });
      
      observer.observe(placeholder);
      this._observers.set(placeholder, observer);
      
      return placeholder;
    }

    /**
     * Check SVG support (cached)
     */
    supportsSVG() {
      if (FEATURES.supportsSVG !== null) return FEATURES.supportsSVG;
      if (typeof document === 'undefined') return false;
      FEATURES.supportsSVG = document.implementation?.hasFeature?.(
        'http://www.w3.org/TR/SVG11/feature#Image', '1.1'
      ) || false;
      return FEATURES.supportsSVG;
    }

    /**
     * Check WebP support (cached)
     */
    supportsWebP() {
      if (FEATURES.supportsWebP !== null) return FEATURES.supportsWebP;
      if (typeof document === 'undefined') return false;
      const canvas = document.createElement('canvas');
      FEATURES.supportsWebP = canvas.getContext?.('2d') && 
        canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
      return FEATURES.supportsWebP;
    }

    /**
     * Check if reduced motion is preferred
     */
    prefersReducedMotion() {
      return FEATURES.reducedMotion;
    }

    /**
     * Check if dark mode is preferred
     */
    prefersDarkMode() {
      return FEATURES.darkMode;
    }

    /**
     * Log branded message to console with enhanced styling
     */
    consoleLog(message, level = 'info') {
      const prefix = this.getTextLogo('bracket');
      const styles = {
        info: 'color: #1a3d2e; background: #d1fae5; padding: 2px 6px; border-radius: 3px; font-weight: 600;',
        warn: 'color: #92400e; background: #fef3c7; padding: 2px 6px; border-radius: 3px; font-weight: 600;',
        error: 'color: #dc2626; background: #fee2e2; padding: 2px 6px; border-radius: 3px; font-weight: 600;',
        success: 'color: #065f46; background: #a7f3d0; padding: 2px 6px; border-radius: 3px; font-weight: 600;'
      };

      if (typeof console !== 'undefined') {
        if (typeof window !== 'undefined' && console.log.toString().includes('native')) {
          // Browser console with enhanced styling
          // console.log(`%c${prefix}%c ${message}`, styles[level] || styles.info, 'color: inherit;'); // AUTO-DISABLED
        } else {
          // Node.js or basic console
          const icons = { info: 'ℹ️', warn: '⚠️', error: '❌', success: '✅' };
          // console.log(`${icons[level] || ''} ${prefix} ${message}`); // AUTO-DISABLED
        }
      }
    }

    /**
     * Display startup banner in console
     */
    showStartupBanner() {
      if (typeof console === 'undefined') return;
      
      const isDark = this.prefersDarkMode();
      
      if (typeof window !== 'undefined' && console.log.toString().includes('native')) {
        // Rich browser console
        // console.log(
          `%c${this.config.ascii.compact}`,
          `color: ${isDark ? '#2dd4bf' : '#1a3d2e'}; font-family: monospace; font-size: 10px;`
        ); // AUTO-DISABLED
        // console.log(
          `%c🔧 TillerPro v2.0 %c| Expert Tile Installation Tools`,
          'color: #c9a227; font-weight: bold; font-size: 12px;',
          'color: #6b7280; font-size: 11px;'
        ); // AUTO-DISABLED
        // console.log(
          `%c© ${new Date() // AUTO-DISABLED.getFullYear()} Tillerstead LLC | NJ HIC #13VH10808800`,
          'color: #9ca3af; font-size: 10px;'
        );
      } else {
        // Node.js/CLI with ANSI colors
        // console.log(this.getColoredAscii(isDark) // AUTO-DISABLED);
      }
    }

    /**
     * Get brand colors for current scheme
     */
    getColors(scheme = null) {
      return this.config.colors[scheme || this.colorScheme] || this.config.colors.light;
    }

    /**
     * Set color scheme
     */
    setColorScheme(scheme) {
      if (this.config.colors[scheme]) {
        this.colorScheme = scheme;
        this._dispatchSchemeChange();
      }
    }

    /**
     * Clean up observers
     */
    destroy() {
      this._observers.forEach(observer => observer.disconnect());
      this._observers.clear();
      this._imageCache.clear();
    }

    /**
     * Get feature detection results
     */
    getFeatures() {
      return { ...FEATURES };
    }
  }

  // ==
  // SINGLETON INSTANCE
  // ==

  const logoSystem = new LogoSystem();

  // ==
  // CSS INJECTION FOR ANIMATIONS
  // ==

  function injectStyles() {
    if (typeof document === 'undefined') return;
    if (document.getElementById('tillerpro-logo-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'tillerpro-logo-styles';
    style.textContent = `
      .logo--animate {
        opacity: 0;
        animation: logoFadeIn 0.3s ease-out forwards;
      }
      @keyframes logoFadeIn {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
      }
      @media (prefers-reduced-motion: reduce) {
        .logo--animate {
          animation: none;
          opacity: 1;
        }
      }
      .logo-placeholder {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #1a3d2e 0%, #0d4b3b 100%);
        border-radius: 8px;
        min-width: 48px;
        min-height: 48px;
      }
      .logo-placeholder__text {
        color: #c9a227;
        font-weight: 700;
        font-size: 1.25rem;
      }
    `;
    document.head.appendChild(style);
  }

  // Inject styles on load
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', injectStyles);
    } else {
      injectStyles();
    }
  }

  // ==
  // EXPORTS
  // ==

  // Export for different module systems
  if (typeof module !== 'undefined' && module.exports) {
    // Node.js / CommonJS
    module.exports = { LogoSystem, logoSystem, LOGO_CONFIG, LOGO_BASE64_COMPACT, LOGO_SVG_DATA_URI, FEATURES };
  } else if (typeof window !== 'undefined') {
    // Browser global with enhanced API
    window.TillerLogo = Object.freeze({
      // Class for custom instances
      LogoSystem,
      // Singleton instance
      instance: logoSystem,
      // Quick access methods
      getLogo: (ctx, opts) => logoSystem.getLogo(ctx, opts),
      getHTML: (opts) => logoSystem.getHTMLElement(opts),
      getPicture: (opts) => logoSystem.getPictureElement(opts),
      preload: (sizes) => logoSystem.preload(sizes),
      log: (msg, lvl) => logoSystem.consoleLog(msg, lvl),
      banner: () => logoSystem.showStartupBanner(),
      // Config access
      config: LOGO_CONFIG,
      base64: LOGO_BASE64_COMPACT,
      svgDataUri: LOGO_SVG_DATA_URI,
      features: () => logoSystem.getFeatures()
    });
    
    // Auto-show startup banner in dev mode
    if (location?.hostname === 'localhost' || location?.hostname === '127.0.0.1') {
      logoSystem.showStartupBanner();
    }
  }

})();
