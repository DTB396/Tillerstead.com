/**
 * Tools Hub Router
 * Hash-based client-side routing for Tools Hub
 * 
 * Features:
 * - Hash-based routing (#/tile, #/grout, etc.)
 * - Browser back/forward support
 * - Route parameters (?mode=contractor)
 * - Route guards & middleware
 * - View transitions
 * 
 * @version 1.0.0
 * @author Tillerstead LLC
 */

(function(window) {
  'use strict';

  /**
   * Router Class
   */
  class ToolsHubRouter {
    constructor(options = {}) {
      this.routes = new Map();
      this.currentRoute = null;
      this.defaultRoute = options.defaultRoute || 'overview';
      this.container = options.container || document.getElementById('app-content');
      this.loading = false;
      this.hooks = {
        before: [],
        after: [],
        error: []
      };
      
      // Initialize
      this.init();
    }

    /**
     * Initialize router
     */
    init() {
      // Listen for hash changes
      window.addEventListener('hashchange', () => this.handleRoute());
      window.addEventListener('load', () => this.handleRoute());
      
      console.log('[Router] Initialized');
    }

    /**
     * Register a route
     * @param {string} path - Route path (without #/)
     * @param {Object} config - Route configuration
     */
    register(path, config) {
      this.routes.set(path, {
        name: config.name || path,
        component: config.component,
        loader: config.loader,
        beforeEnter: config.beforeEnter,
        meta: config.meta || {}
      });
      
      console.log(`[Router] Registered route: ${path}`);
    }

    /**
     * Navigate to route
     * @param {string} path - Route path
     * @param {Object} params - Query parameters
     */
    navigate(path, params = {}) {
      // Build hash
      let hash = `#/${path}`;
      
      // Add query params
      const queryString = new URLSearchParams(params).toString();
      if (queryString) {
        hash += `?${queryString}`;
      }
      
      // Update location
      window.location.hash = hash;
    }

    /**
     * Handle current route
     */
    async handleRoute() {
      if (this.loading) return;
      
      try {
        this.loading = true;
        
        // Parse hash
        const { path, params } = this.parseHash();
        
        // Get route config
        const route = this.routes.get(path);
        
        if (!route) {
          console.warn(`[Router] Route not found: ${path}, redirecting to ${this.defaultRoute}`);
          this.navigate(this.defaultRoute);
          return;
        }
        
        // Run before hooks
        const canNavigate = await this.runHooks('before', { path, params, route });
        if (canNavigate === false) {
          console.log('[Router] Navigation blocked by hook');
          return;
        }
        
        // Run route guard
        if (route.beforeEnter) {
          const allowed = await route.beforeEnter({ path, params });
          if (allowed === false) {
            console.log('[Router] Navigation blocked by route guard');
            return;
          }
        }
        
        // Load route component
        await this.loadRoute(route, params);
        
        // Update current route
        this.currentRoute = { path, params, route };
        
        // Run after hooks
        await this.runHooks('after', { path, params, route });
        
        // Update nav active states
        this.updateNavActiveStates(path);
        
        // Update document title
        if (route.meta.title) {
          document.title = `${route.meta.title} | Tillerstead Tools Hub`;
        }
        
        // Scroll to top
        if (this.container) {
          this.container.scrollTop = 0;
        }
        
      } catch (error) {
        console.error('[Router] Route error:', error);
        await this.runHooks('error', { error });
        this.showError(error);
      } finally {
        this.loading = false;
      }
    }

    /**
     * Load route component
     * @param {Object} route - Route configuration
     * @param {Object} params - Route parameters
     */
    async loadRoute(route, params) {
      if (!this.container) {
        console.error('[Router] Container not found');
        return;
      }
      
      // Show loading state
      this.container.classList.add('loading');
      this.container.setAttribute('aria-busy', 'true');
      
      try {
        let content;
        
        // If loader function provided, call it
        if (typeof route.loader === 'function') {
          content = await route.loader(params);
        }
        // If component is a string (HTML), use it directly
        else if (typeof route.component === 'string') {
          content = route.component;
        }
        // If component is a function, call it
        else if (typeof route.component === 'function') {
          content = route.component(params);
        }
        // If component is a URL, fetch it
        else if (route.component && route.component.startsWith('/')) {
          const response = await fetch(route.component);
          content = await response.text();
        }
        else {
          throw new Error(`Invalid component type for route: ${route.name}`);
        }
        
        // Render content with fade transition
        await this.fadeTransition(content);
        
        // Load adapter if configured
        if (route.meta && route.meta.adapter) {
          await this.loadAdapter(route.meta.adapter);
        }
        
      } catch (error) {
        console.error('[Router] Failed to load component:', error);
        this.container.innerHTML = `
          <div class="error-state">
            <p>Failed to load ${route.name}</p>
            <button onclick="location.reload()">Reload Page</button>
          </div>
        `;
      } finally {
        this.container.classList.remove('loading');
        this.container.setAttribute('aria-busy', 'false');
      }
    }

    /**
     * Fade transition between views
     * @param {string} newContent - New HTML content
     */
    async fadeTransition(newContent) {
      // Fade out
      this.container.style.opacity = '0';
      await this.wait(150);
      
      // Update content
      this.container.innerHTML = newContent;
      
      // Initialize any scripts in new content
      this.initializeScripts();
      
      // Fade in
      this.container.style.opacity = '1';
    }

    /**
     * Initialize scripts in newly loaded content
     */
    initializeScripts() {
      // Re-run calculator initialization if present
      if (window.initializeCalculator) {
        window.initializeCalculator();
      }
      
      // Re-run any data-init scripts
      this.container.querySelectorAll('[data-init]').forEach(el => {
        const initFn = window[el.dataset.init];
        if (typeof initFn === 'function') {
          initFn(el);
        }
      });
      
      // Dispatch event for other systems to hook into
      window.dispatchEvent(new CustomEvent('toolshub:viewloaded', {
        detail: { route: this.currentRoute }
      }));
    }

    /**
     * Parse hash into path and params
     * @returns {Object} { path, params }
     */
    parseHash() {
      const hash = window.location.hash.slice(1); // Remove #
      
      if (!hash || hash === '/') {
        return { path: this.defaultRoute, params: {} };
      }
      
      // Split path and query string
      const [pathPart, queryPart] = hash.split('?');
      const path = pathPart.replace(/^\//, '') || this.defaultRoute;
      
      // Parse query parameters
      const params = {};
      if (queryPart) {
        new URLSearchParams(queryPart).forEach((value, key) => {
          params[key] = value;
        });
      }
      
      return { path, params };
    }

    /**
     * Update navigation active states
     * @param {string} activePath - Currently active path
     */
    updateNavActiveStates(activePath) {
      // Remove all active states
      document.querySelectorAll('[data-route]').forEach(el => {
        el.classList.remove('active');
        el.setAttribute('aria-current', 'false');
      });
      
      // Add active state to current route
      const activeEl = document.querySelector(`[data-route="${activePath}"]`);
      if (activeEl) {
        activeEl.classList.add('active');
        activeEl.setAttribute('aria-current', 'page');
      }
    }

    /**
     * Load adapter script for calculator
     * @param {string} adapterPath - Path to adapter script
     */
    async loadAdapter(adapterPath) {
      return new Promise((resolve, reject) => {
        // Check if already loaded
        const existingScript = document.querySelector(`script[src="${adapterPath}"]`);
        if (existingScript) {
          console.log(`[Router] Adapter already loaded: ${adapterPath}`);
          // Re-initialize adapter
          this.initializeAdapter(adapterPath);
          resolve();
          return;
        }
        
        // Create script element
        const script = document.createElement('script');
        script.src = adapterPath;
        script.async = false; // Ensure sequential loading
        
        script.onload = () => {
          console.log(`[Router] Adapter loaded: ${adapterPath}`);
          // Give adapter time to initialize
          setTimeout(() => {
            this.initializeAdapter(adapterPath);
            resolve();
          }, 50);
        };
        
        script.onerror = () => {
          console.error(`[Router] Failed to load adapter: ${adapterPath}`);
          reject(new Error(`Failed to load adapter: ${adapterPath}`));
        };
        
        document.head.appendChild(script);
      });
    }

    /**
     * Initialize adapter after loading
     * @param {string} adapterPath - Path to adapter script
     */
    initializeAdapter(adapterPath) {
      // Extract adapter name from path
      const adapterName = adapterPath.split('/').pop().replace('.js', '');
      
      // Map adapter file names to class names
      const adapterClasses = {
        'tile-calculator-adapter': 'TileCalculatorAdapter',
        'grout-calculator-adapter': 'GroutCalculatorAdapter',
        'mortar-calculator-adapter': 'MortarCalculatorAdapter',
        'waterproofing-calculator-adapter': 'WaterproofingCalculatorAdapter',
        'slope-calculator-adapter': 'SlopeCalculatorAdapter',
        'leveling-calculator-adapter': 'LevelingCalculatorAdapter',
        'labor-estimator-adapter': 'LaborEstimatorAdapter'
      };
      
      const className = adapterClasses[adapterName];
      if (className && window[className]) {
        console.log(`[Router] Initializing adapter: ${className}`);
        const adapter = new window[className]();
        adapter.init();
      } else {
        console.warn(`[Router] Adapter class not found: ${className}`);
      }
    }

    /**
     * Add hook
     * @param {string} type - Hook type (before, after, error)
     * @param {Function} callback - Hook function
     */
    addHook(type, callback) {
      if (!this.hooks[type]) {
        console.warn(`[Router] Invalid hook type: ${type}`);
        return;
      }
      this.hooks[type].push(callback);
    }

    /**
     * Run hooks
     * @param {string} type - Hook type
     * @param {Object} context - Hook context
     * @returns {*} Hook result
     */
    async runHooks(type, context) {
      if (!this.hooks[type]) return true;
      
      for (const hook of this.hooks[type]) {
        try {
          const result = await hook(context);
          if (result === false) {
            return false; // Stop navigation
          }
        } catch (error) {
          console.error(`[Router] Hook error (${type}):`, error);
        }
      }
      
      return true;
    }

    /**
     * Show error view
     * @param {Error} error - Error object
     */
    showError(error) {
      if (!this.container) return;
      
      this.container.innerHTML = `
        <div class="error-state">
          <h2>Oops! Something went wrong</h2>
          <p>${error.message || 'An unexpected error occurred'}</p>
          <div class="error-actions">
            <button onclick="location.hash = '#/overview'">Go to Overview</button>
            <button onclick="location.reload()">Reload Page</button>
          </div>
        </div>
      `;
    }

    /**
     * Utility: Wait for duration
     * @param {number} ms - Milliseconds
     */
    wait(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get current route
     * @returns {Object} Current route info
     */
    getCurrentRoute() {
      return this.currentRoute;
    }

    /**
     * Check if route exists
     * @param {string} path - Route path
     * @returns {boolean}
     */
    hasRoute(path) {
      return this.routes.has(path);
    }
  }

  // Create global instance
  const router = new ToolsHubRouter({
    defaultRoute: 'overview',
    container: document.getElementById('app-content')
  });

  // Register default routes
  registerDefaultRoutes(router);

  // Expose to window
  window.ToolsHubRouter = router;

  /**
   * Register default routes
   */
  function registerDefaultRoutes(router) {
    // Overview
    router.register('overview', {
      name: 'Overview',
      component: '/assets/views/overview.html',
      meta: { title: 'Project Overview', icon: '📊' }
    });

    // Tile Calculator
    router.register('tile', {
      name: 'Tile Calculator',
      loader: async (params) => {
        // Load tile calculator include
        const response = await fetch('/_includes/tools/tile-calculator.html');
        const html = await response.text();
        return `<div class="calculator-view" data-calc="tile">${html}</div>`;
      },
      meta: { 
        title: 'Tile Calculator', 
        icon: '🧱', 
        category: 'coverage',
        adapter: '/assets/js/adapters/tile-calculator-adapter.js'
      }
    });

    // Grout Calculator
    router.register('grout', {
      name: 'Grout Calculator',
      loader: async (params) => {
        const response = await fetch('/_includes/tools/grout-calculator.html');
        const html = await response.text();
        return `<div class="calculator-view" data-calc="grout">${html}</div>`;
      },
      meta: { 
        title: 'Grout Calculator', 
        icon: '🪣', 
        category: 'coverage',
        adapter: '/assets/js/adapters/grout-calculator-adapter.js'
      }
    });

    // Mortar Calculator
    router.register('mortar', {
      name: 'Mortar Calculator',
      loader: async (params) => {
        const response = await fetch('/_includes/tools/mortar-calculator.html');
        const html = await response.text();
        return `<div class="calculator-view" data-calc="mortar">${html}</div>`;
      },
      meta: { 
        title: 'Mortar Calculator', 
        icon: '🔧', 
        category: 'coverage',
        adapter: '/assets/js/adapters/mortar-calculator-adapter.js'
      }
    });

    // Waterproofing Calculator
    router.register('waterproof', {
      name: 'Waterproofing',
      loader: async (params) => {
        const response = await fetch('/_includes/tools/waterproof-calculator.html');
        const html = await response.text();
        return `<div class="calculator-view" data-calc="waterproof">${html}</div>`;
      },
      meta: { 
        title: 'Waterproofing Calculator', 
        icon: '💧', 
        category: 'coverage',
        adapter: '/assets/js/adapters/waterproofing-calculator-adapter.js'
      }
    });

    // Shower Slope Calculator
    router.register('slope', {
      name: 'Shower Slope',
      loader: async (params) => {
        const response = await fetch('/_includes/tools/slope-calculator.html');
        const html = await response.text();
        return `<div class="calculator-view" data-calc="slope">${html}</div>`;
      },
      meta: { 
        title: 'Shower Slope Calculator', 
        icon: '📐', 
        category: 'structural',
        adapter: '/assets/js/adapters/slope-calculator-adapter.js'
      }
    });

    // Self-Leveling Calculator
    router.register('leveling', {
      name: 'Self-Leveling',
      loader: async (params) => {
        const response = await fetch('/_includes/tools/leveling-calculator.html');
        const html = await response.text();
        return `<div class="calculator-view" data-calc="leveling">${html}</div>`;
      },
      meta: { 
        title: 'Self-Leveling Calculator', 
        icon: '📏', 
        category: 'prepfinish',
        adapter: '/assets/js/adapters/leveling-calculator-adapter.js'
      }
    });

    // Labor Calculator
    router.register('labor', {
      name: 'Labor Estimate',
      loader: async (params) => {
        const response = await fetch('/_includes/tools/labor-calculator.html');
        const html = await response.text();
        return `<div class="calculator-view" data-calc="labor">${html}</div>`;
      },
      meta: { 
        title: 'Labor Estimate', 
        icon: '⏱️', 
        category: 'other',
        adapter: '/assets/js/adapters/labor-estimator-adapter.js'
      }
    });

    // Pattern Visualizer
    router.register('visualizer', {
      name: 'Pattern Visualizer',
      component: `
        <div class="visualizer-embed">
          <iframe 
            src="/tile-visualizer/?embed=true" 
            style="width:100%; height:calc(100vh - 200px); border:0;"
            title="Tile Pattern Visualizer">
          </iframe>
        </div>
      `,
      meta: { title: 'Pattern Visualizer', icon: '🎨' }
    });

    // Quote/Estimate
    router.register('estimate', {
      name: 'Request Quote',
      component: () => {
        // Pre-fill from ProjectState
        const summary = window.ProjectState ? window.ProjectState.getSummary() : {};
        return `
          <div class="quote-view">
            <h2>Request Professional Quote</h2>
            <p>Based on your project calculations:</p>
            <div class="quote-summary">
              <div class="stat">Project: ${summary.projectName || 'Untitled'}</div>
              <div class="stat">Area: ${summary.totalArea || 0} sq ft</div>
              <div class="stat">Estimated Budget: $${summary.budgetEstimate || 0}</div>
            </div>
            <div id="quote-form-container">
              <!-- Quote wizard will be inserted here -->
              <p>Loading quote form...</p>
            </div>
          </div>
        `;
      },
      meta: { title: 'Request Quote', icon: '💬' }
    });

    // Export
    router.register('export', {
      name: 'Export Project',
      component: () => {
        const summary = window.ProjectState ? window.ProjectState.getSummary() : {};
        return `
          <div class="export-view">
            <h2>Export Project</h2>
            <p>Download your project details and material list.</p>
            <div class="export-options">
              <button class="btn-primary" onclick="window.ProjectState.exportPDF()">
                📄 Export PDF
              </button>
              <button class="btn-secondary" onclick="alert(window.ProjectState.exportCSV())">
                📊 Export CSV
              </button>
            </div>
          </div>
        `;
      },
      meta: { title: 'Export Project', icon: '📤' }
    });
  }

  console.log('[Router] Ready - Default routes registered');

})(window);
