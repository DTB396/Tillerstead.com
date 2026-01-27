/**
 * Console Debug Tools
 * Advanced debugging utilities for browser DevTools
 * Chrome, Firefox, Safari, Edge compatible
 */

(function() {
  'use strict';
  
  // Prevent duplicate initialization
  if (window.TillersteadDebug) return;
  
  const DebugTools = {
    // Console styling
    styles: {
      success: 'color: #10b981; font-weight: bold;',
      error: 'color: #ef4444; font-weight: bold;',
      warning: 'color: #f59e0b; font-weight: bold;',
      info: 'color: #3b82f6; font-weight: bold;',
      header: 'color: #8b5cf6; font-size: 18px; font-weight: bold;'
    },
    
    // Initialize debug tools
    init() {
      console.log('%c🔧 Tillerstead Debug Tools Loaded', this.styles.header);
      console.log('%cType `debug.help()` for available commands', this.styles.info);
      
      // Expose to window
      window.debug = this;
      window.TillersteadDebug = true;
    },
    
    // Show help menu
    help() {
      console.group('%c📖 Debug Tools Help', this.styles.header);
      console.log('%cdebug.layers()', this.styles.success, '- Show z-index layer info');
      console.log('%cdebug.perf()', this.styles.success, '- Run performance audit');
      console.log('%cdebug.css()', this.styles.success, '- Analyze CSS usage');
      console.log('%cdebug.images()', this.styles.success, '- Check image optimization');
      console.log('%cdebug.a11y()', this.styles.success, '- Quick accessibility check');
      console.log('%cdebug.mobile()', this.styles.success, '- Test mobile layout');
      console.log('%cdebug.clean()', this.styles.success, '- Clear console & caches');
      console.log('%cdebug.export()', this.styles.success, '- Export debug report');
      console.groupEnd();
    },
    
    // Z-Index layer analysis
    layers() {
      console.group('%c🧱 Z-Index Layer Analysis', this.styles.header);
      
      const elements = document.querySelectorAll('*');
      const zIndexMap = new Map();
      
      elements.forEach(el => {
        const zIndex = window.getComputedStyle(el).zIndex;
        if (zIndex !== 'auto' && zIndex !== '0') {
          const selector = el.className ? `.${el.className.split(' ')[0]}` : el.tagName.toLowerCase();
          if (!zIndexMap.has(zIndex)) {
            zIndexMap.set(zIndex, []);
          }
          zIndexMap.get(zIndex).push(selector);
        }
      });
      
      // Sort by z-index
      const sorted = Array.from(zIndexMap.entries()).sort((a, b) => parseInt(b[0]) - parseInt(a[0]));
      
      console.table(sorted.map(([z, els]) => ({
        'Z-Index': z,
        'Count': els.length,
        'Elements': els.slice(0, 3).join(', ')
      })));
      
      console.log(`%cTotal layered elements: ${elements.length}`, this.styles.info);
      console.log(`%cUnique z-index values: ${zIndexMap.size}`, this.styles.info);
      
      // Check for conflicts
      const conflicts = sorted.filter(([z]) => parseInt(z) > 1000);
      if (conflicts.length > 0) {
        console.warn('%c⚠️ High z-index values detected (>1000):', this.styles.warning);
        console.table(conflicts);
      }
      
      console.groupEnd();
    },
    
    // Performance analysis
    perf() {
      console.group('%c⚡ Performance Analysis', this.styles.header);
      
      if (window.measureWebVitals) {
        window.measureWebVitals().then(vitals => {
          console.table(vitals);
        });
      }
      
      if (window.analyzeResourceTiming) {
        window.analyzeResourceTiming();
      }
      
      // Memory usage
      if (performance.memory) {
        const memory = performance.memory;
        console.log('Memory Usage:');
        console.log(`  Used: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`  Total: ${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`  Limit: ${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`);
      }
      
      console.groupEnd();
    },
    
    // CSS analysis
    css() {
      console.group('%c🎨 CSS Analysis', this.styles.header);
      
      const sheets = document.styleSheets;
      let totalRules = 0;
      let totalSelectors = 0;
      
      const sheetData = [];
      
      Array.from(sheets).forEach((sheet, idx) => {
        try {
          const rules = sheet.cssRules || sheet.rules;
          totalRules += rules.length;
          
          let selectors = 0;
          Array.from(rules).forEach(rule => {
            if (rule.selectorText) {
              selectors += rule.selectorText.split(',').length;
            }
          });
          
          totalSelectors += selectors;
          
          sheetData.push({
            Index: idx,
            URL: sheet.href ? sheet.href.split('/').pop() : 'inline',
            Rules: rules.length,
            Selectors: selectors
          });
        } catch (e) {
          // Cross-origin stylesheet
        }
      });
      
      console.table(sheetData);
      console.log(`%cTotal Stylesheets: ${sheets.length}`, this.styles.info);
      console.log(`%cTotal Rules: ${totalRules}`, this.styles.info);
      console.log(`%cTotal Selectors: ${totalSelectors}`, this.styles.info);
      
      console.groupEnd();
    },
    
    // Image optimization check
    images() {
      console.group('%c🖼️ Image Optimization Check', this.styles.header);
      
      const images = document.querySelectorAll('img');
      const imageData = [];
      
      images.forEach((img, idx) => {
        const natural = img.naturalWidth * img.naturalHeight;
        const rendered = img.width * img.height;
        const oversized = natural > rendered * 2;
        
        imageData.push({
          Index: idx,
          Src: img.src.split('/').pop(),
          Natural: `${img.naturalWidth}x${img.naturalHeight}`,
          Rendered: `${img.width}x${img.height}`,
          Oversized: oversized ? '⚠️ Yes' : '✓ No',
          Lazy: img.loading === 'lazy' ? '✓' : '✗',
          Alt: img.alt ? '✓' : '❌ Missing'
        });
      });
      
      console.table(imageData);
      
      const oversized = imageData.filter(img => img.Oversized === '⚠️ Yes');
      if (oversized.length > 0) {
        console.warn(`%c${oversized.length} images are oversized`, this.styles.warning);
      }
      
      const noAlt = imageData.filter(img => img.Alt === '❌ Missing');
      if (noAlt.length > 0) {
        console.warn(`%c${noAlt.length} images missing alt text`, this.styles.warning);
      }
      
      console.groupEnd();
    },
    
    // Accessibility quick check
    a11y() {
      console.group('%c♿ Accessibility Quick Check', this.styles.header);
      
      const issues = [];
      
      // Check for alt text
      const imgsNoAlt = document.querySelectorAll('img:not([alt])');
      if (imgsNoAlt.length > 0) {
        issues.push({ Issue: 'Images without alt text', Count: imgsNoAlt.length, Severity: 'High' });
      }
      
      // Check for form labels
      const inputsNoLabel = document.querySelectorAll('input:not([aria-label]):not([id])');
      if (inputsNoLabel.length > 0) {
        issues.push({ Issue: 'Inputs without labels', Count: inputsNoLabel.length, Severity: 'High' });
      }
      
      // Check for heading hierarchy
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const h1Count = document.querySelectorAll('h1').length;
      if (h1Count === 0) {
        issues.push({ Issue: 'Missing H1 heading', Count: 1, Severity: 'Medium' });
      } else if (h1Count > 1) {
        issues.push({ Issue: 'Multiple H1 headings', Count: h1Count, Severity: 'Medium' });
      }
      
      // Check for ARIA roles
      const interactiveNoRole = document.querySelectorAll('div[onclick]:not([role]), span[onclick]:not([role])');
      if (interactiveNoRole.length > 0) {
        issues.push({ Issue: 'Interactive elements without roles', Count: interactiveNoRole.length, Severity: 'Medium' });
      }
      
      // Check color contrast (simplified)
      const darkBg = document.querySelectorAll('[style*="background: #000"], [style*="background: black"]');
      const lightText = document.querySelectorAll('[style*="color: #fff"], [style*="color: white"]');
      
      if (issues.length === 0) {
        console.log('%c✅ No critical accessibility issues found!', this.styles.success);
      } else {
        console.table(issues);
        console.log(`%c⚠️ Found ${issues.length} potential issues`, this.styles.warning);
      }
      
      console.groupEnd();
    },
    
    // Mobile layout test
    mobile() {
      console.group('%c📱 Mobile Layout Test', this.styles.header);
      
      const width = window.innerWidth;
      const isMobile = width <= 768;
      
      console.log(`Viewport: ${width}x${window.innerHeight}`);
      console.log(`Mobile mode: ${isMobile ? 'Yes' : 'No'}`);
      
      // Check mobile-specific elements
      const fab = document.querySelector('.mobile-fab, .fab');
      const toast = document.querySelector('.toast');
      const modal = document.querySelector('.modal');
      
      console.log(`\nMobile-specific checks:`);
      console.log(`  FAB hidden: ${!fab || getComputedStyle(fab).display === 'none' ? '✓' : '✗'}`);
      console.log(`  Toast hidden: ${!toast || getComputedStyle(toast).display === 'none' ? '✓' : '✗'}`);
      console.log(`  Modal hidden: ${!modal || getComputedStyle(modal).display === 'none' ? '✓' : '✗'}`);
      
      // Check touch targets
      const buttons = document.querySelectorAll('button, a, [role="button"]');
      const smallTargets = Array.from(buttons).filter(btn => {
        const rect = btn.getBoundingClientRect();
        return rect.width < 44 || rect.height < 44;
      });
      
      if (smallTargets.length > 0 && isMobile) {
        console.warn(`%c⚠️ ${smallTargets.length} touch targets smaller than 44x44px`, this.styles.warning);
      }
      
      console.groupEnd();
    },
    
    // Clean console and caches
    clean() {
      console.clear();
      console.log('%c✨ Console cleared', this.styles.success);
      
      // Clear localStorage (with confirmation)
      if (confirm('Clear localStorage?')) {
        localStorage.clear();
        console.log('%c✓ localStorage cleared', this.styles.success);
      }
      
      // Clear sessionStorage
      sessionStorage.clear();
      console.log('%c✓ sessionStorage cleared', this.styles.success);
    },
    
    // Export debug report
    export() {
      const report = {
        timestamp: new Date().toISOString(),
        url: window.location.href,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        userAgent: navigator.userAgent,
        performance: performance.timing,
        resources: performance.getEntriesByType('resource').length,
        styleSheets: document.styleSheets.length,
        images: document.querySelectorAll('img').length,
        scripts: document.querySelectorAll('script').length
      };
      
      console.log('%c📊 Debug Report', this.styles.header);
      console.log(JSON.stringify(report, null, 2));
      
      // Download as JSON
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `debug-report-${Date.now()}.json`;
      a.click();
      
      console.log('%c✓ Report downloaded', this.styles.success);
    }
  };
  
  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => DebugTools.init());
  } else {
    DebugTools.init();
  }
})();
