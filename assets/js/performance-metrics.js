/**
 * Performance Testing Suite
 * Real User Metrics (RUM) simulation
 * Core Web Vitals measurement
 */

export async function measureWebVitals() {
  const vitals = {
    lcp: null,  // Largest Contentful Paint
    fid: null,  // First Input Delay
    cls: null,  // Cumulative Layout Shift
    fcp: null,  // First Contentful Paint
    ttfb: null  // Time to First Byte
  };

  // Performance Observer for Web Vitals
  if ('PerformanceObserver' in window) {
    // LCP - Largest Contentful Paint
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        vitals.lcp = lastEntry.renderTime || lastEntry.loadTime;
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {
      console.warn('LCP measurement failed:', e);
    }

    // FID - First Input Delay
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.name === 'first-input') {
            vitals.fid = entry.processingStart - entry.startTime;
          }
        });
      });
      fidObserver.observe({ type: 'first-input', buffered: true });
    } catch (e) {
      console.warn('FID measurement failed:', e);
    }

    // CLS - Cumulative Layout Shift
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        vitals.cls = clsValue;
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
    } catch (e) {
      console.warn('CLS measurement failed:', e);
    }
  }

  // Navigation Timing API
  if ('performance' in window && performance.timing) {
    const timing = performance.timing;
    
    // TTFB - Time to First Byte
    vitals.ttfb = timing.responseStart - timing.requestStart;
    
    // FCP - First Contentful Paint
    const paintEntries = performance.getEntriesByType('paint');
    const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    if (fcpEntry) {
      vitals.fcp = fcpEntry.startTime;
    }
  }

  return vitals;
}

export function reportWebVitals() {
  // Wait for page load
  if (document.readyState === 'complete') {
    measureAndReport();
  } else {
    window.addEventListener('load', measureAndReport);
  }
}

async function measureAndReport() {
  setTimeout(async () => {
    const vitals = await measureWebVitals();
    
    console.group('📊 Web Vitals Performance Report');
    console.log('LCP (Largest Contentful Paint):', formatMetric(vitals.lcp, 2500, 4000), 'ms');
    console.log('FID (First Input Delay):', formatMetric(vitals.fid, 100, 300), 'ms');
    console.log('CLS (Cumulative Layout Shift):', formatMetric(vitals.cls, 0.1, 0.25, true));
    console.log('FCP (First Contentful Paint):', formatMetric(vitals.fcp, 1800, 3000), 'ms');
    console.log('TTFB (Time to First Byte):', formatMetric(vitals.ttfb, 800, 1800), 'ms');
    console.groupEnd();
    
    // Calculate overall score
    const score = calculatePerformanceScore(vitals);
    console.log(`%c Overall Performance Score: ${score}/100`, getScoreStyle(score));
    
    // Send to analytics (if available)
    if (typeof gtag !== 'undefined') {
      gtag('event', 'web_vitals', {
        event_category: 'Performance',
        event_label: 'Web Vitals',
        value: Math.round(score),
        lcp: Math.round(vitals.lcp),
        fid: Math.round(vitals.fid || 0),
        cls: vitals.cls ? vitals.cls.toFixed(3) : 0
      });
    }
  }, 3000); // Wait 3s for accurate measurements
}

function formatMetric(value, good, needsImprovement, isRatio = false) {
  if (value === null) return '⏳ Measuring...';
  
  const formatted = isRatio ? value.toFixed(3) : Math.round(value);
  
  if (isRatio) {
    if (value <= good) return `✅ ${formatted} (Good)`;
    if (value <= needsImprovement) return `⚠️ ${formatted} (Needs Improvement)`;
    return `❌ ${formatted} (Poor)`;
  }
  
  if (value <= good) return `✅ ${formatted} (Good)`;
  if (value <= needsImprovement) return `⚠️ ${formatted} (Needs Improvement)`;
  return `❌ ${formatted} (Poor)`;
}

function calculatePerformanceScore(vitals) {
  let score = 100;
  
  // LCP scoring (max 30 points)
  if (vitals.lcp > 4000) score -= 30;
  else if (vitals.lcp > 2500) score -= 15;
  
  // FID scoring (max 25 points)
  if (vitals.fid > 300) score -= 25;
  else if (vitals.fid > 100) score -= 12;
  
  // CLS scoring (max 25 points)
  if (vitals.cls > 0.25) score -= 25;
  else if (vitals.cls > 0.1) score -= 12;
  
  // FCP scoring (max 10 points)
  if (vitals.fcp > 3000) score -= 10;
  else if (vitals.fcp > 1800) score -= 5;
  
  // TTFB scoring (max 10 points)
  if (vitals.ttfb > 1800) score -= 10;
  else if (vitals.ttfb > 800) score -= 5;
  
  return Math.max(0, score);
}

function getScoreStyle(score) {
  if (score >= 90) return 'color: #10b981; font-weight: bold; font-size: 16px;';
  if (score >= 50) return 'color: #f59e0b; font-weight: bold; font-size: 16px;';
  return 'color: #ef4444; font-weight: bold; font-size: 16px;';
}

// Resource timing analysis
export function analyzeResourceTiming() {
  if (!performance.getEntriesByType) return;
  
  const resources = performance.getEntriesByType('resource');
  const analysis = {
    css: [],
    js: [],
    images: [],
    fonts: [],
    other: []
  };
  
  resources.forEach(resource => {
    const entry = {
      name: resource.name.split('/').pop(),
      duration: Math.round(resource.duration),
      size: resource.transferSize,
      cached: resource.transferSize === 0
    };
    
    if (resource.name.endsWith('.css')) analysis.css.push(entry);
    else if (resource.name.endsWith('.js')) analysis.js.push(entry);
    else if (resource.name.match(/\.(jpg|jpeg|png|gif|webp|svg|avif)/)) analysis.images.push(entry);
    else if (resource.name.match(/\.(woff|woff2|ttf|eot)/)) analysis.fonts.push(entry);
    else analysis.other.push(entry);
  });
  
  console.group('📦 Resource Loading Analysis');
  console.log('CSS files:', analysis.css.length, 'Total time:', sumDuration(analysis.css), 'ms');
  console.log('JS files:', analysis.js.length, 'Total time:', sumDuration(analysis.js), 'ms');
  console.log('Images:', analysis.images.length, 'Total time:', sumDuration(analysis.images), 'ms');
  console.log('Fonts:', analysis.fonts.length, 'Total time:', sumDuration(analysis.fonts), 'ms');
  console.table(analysis.css.slice(0, 10));
  console.groupEnd();
  
  return analysis;
}

function sumDuration(resources) {
  return resources.reduce((sum, r) => sum + r.duration, 0).toFixed(0);
}

// Auto-init on production
if (typeof window !== 'undefined') {
  window.measureWebVitals = measureWebVitals;
  window.reportWebVitals = reportWebVitals;
  window.analyzeResourceTiming = analyzeResourceTiming;
  
  // Auto-report in dev mode
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    reportWebVitals();
  }
}
