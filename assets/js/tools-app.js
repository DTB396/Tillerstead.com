/**
 * TillerCalc Pro - Web Application
 * Modular architecture with client-side routing
 * Integrates with tillerstead-toolkit backend when available
 */

(function() {
  'use strict';

  // ============================================
  // CONFIGURATION
  // ============================================

  const CONFIG = {
    STORAGE_KEY: 'tillerstead_app_data',
    AUTO_SAVE_DELAY: 2000,
    TOAST_DURATION: 4000,
    VERSION: '1.0.0',
    // Toolkit API settings
    API_BASE_URL: 'http://localhost:8000/api',
    API_TIMEOUT: 5000,
    API_RETRY_ATTEMPTS: 2
  };

  // Calculator definitions
  const CALCULATORS = [
    { id: 'tile', name: 'Tile Quantity', icon: '🧱', desc: 'Calculate tiles and boxes needed' },
    { id: 'mortar', name: 'Mortar Coverage', icon: '🔧', desc: 'Thin-set mortar requirements' },
    { id: 'grout', name: 'Grout Calculator', icon: '🪣', desc: 'Grout quantity and coverage' },
    { id: 'leveling', name: 'Self-Leveling', icon: '📏', desc: 'Leveling compound amounts' },
    { id: 'slope', name: 'Shower Slope', icon: '📐', desc: 'Pre-slope calculations' },
    { id: 'waterproof', name: 'Waterproofing', icon: '💧', desc: 'Membrane requirements' },
    { id: 'labor', name: 'Labor Estimate', icon: '⏱️', desc: 'Time and scheduling' }
  ];

  // Tile presets (reused from tools.js)
  const TILE_PRESETS = [
    { id: 'mosaic-1x1', name: '1×1 Mosaic', width: 1, height: 1, isMosaic: true },
    { id: 'mosaic-2x2', name: '2×2 Mosaic', width: 2, height: 2, isMosaic: true },
    { id: '3x6', name: '3×6 Subway', width: 3, height: 6 },
    { id: '4x4', name: '4×4', width: 4, height: 4 },
    { id: '6x6', name: '6×6', width: 6, height: 6 },
    { id: '6x24', name: '6×24 Plank', width: 6, height: 24 },
    { id: '12x12', name: '12×12', width: 12, height: 12 },
    { id: '12x24', name: '12×24', width: 12, height: 24 },
    { id: '24x24', name: '24×24', width: 24, height: 24 },
    { id: 'custom', name: 'Custom Size', width: 0, height: 0 }
  ];

  const LAYOUT_PRESETS = [
    { id: 'straight', name: 'Straight', waste: 10 },
    { id: 'subway-33', name: '1/3 Offset', waste: 12 },
    { id: 'subway-50', name: '50% Offset', waste: 15 },
    { id: 'diagonal', name: 'Diagonal', waste: 18 },
    { id: 'herringbone', name: 'Herringbone', waste: 25 }
  ];

  const TROWEL_PRESETS = [
    { id: '3/16-v', name: '3/16" V-Notch', min: 95, max: 120 },
    { id: '1/4-sq', name: '1/4" Square', min: 70, max: 95 },
    { id: '1/4x3/8-sq', name: '1/4"×3/8" Square', min: 50, max: 70 },
    { id: '1/2-sq', name: '1/2" Square', min: 35, max: 50 }
  ];

  // ============================================
  // STATE MANAGEMENT
  // ============================================

  const AppState = {
    currentRoute: 'dashboard',
    projects: [],
    activeProject: null,
    activeCalculator: 'tile',
    settings: {
      autoSave: true,
      notifications: true,
      darkMode: true,
      units: 'imperial'
    },
    calculatorInputs: {},
    calculatorResults: {}
  };

  // ============================================
  // STORAGE
  // ============================================

  const Storage = {
    save() {
      try {
        const data = {
          projects: AppState.projects,
          settings: AppState.settings,
          version: CONFIG.VERSION
        };
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(data));
        return true;
      } catch (e) {
        console.error('Storage save failed:', e);
        return false;
      }
    },

    load() {
      try {
        const data = localStorage.getItem(CONFIG.STORAGE_KEY);
        if (data) {
          const parsed = JSON.parse(data);
          AppState.projects = parsed.projects || [];
          AppState.settings = { ...AppState.settings, ...parsed.settings };
          return true;
        }
      } catch (e) {
        console.error('Storage load failed:', e);
      }
      return false;
    },

    exportData() {
      const data = {
        exportDate: new Date().toISOString(),
        version: CONFIG.VERSION,
        projects: AppState.projects,
        settings: AppState.settings
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tillercalc-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      Toast.show('Data exported successfully', 'success');
    },

    importData(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.projects) {
            AppState.projects = data.projects;
            Storage.save();
            Router.navigate(AppState.currentRoute);
            Toast.show(`Imported ${data.projects.length} projects`, 'success');
          }
        } catch (err) {
          Toast.show('Invalid import file', 'error');
        }
      };
      reader.readAsText(file);
    }
  };

  // ============================================
  // API CLIENT - Toolkit Integration
  // ============================================

  const API = {
    isConnected: false,
    lastHealthCheck: null,

    // Check if toolkit API is available
    async checkHealth() {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG.API_TIMEOUT);
        
        const response = await fetch(`${CONFIG.API_BASE_URL.replace('/api', '')}/health`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (response.ok) {
          this.isConnected = true;
          this.lastHealthCheck = Date.now();
          this.updateConnectionUI(true);
          return true;
        }
      } catch (e) {
        this.isConnected = false;
        this.updateConnectionUI(false);
      }
      return false;
    },

    // Update connection status indicator
    updateConnectionUI(connected) {
      const indicator = document.getElementById('api-status');
      if (indicator) {
        indicator.className = connected ? 'api-status api-status--connected' : 'api-status api-status--offline';
        indicator.title = connected ? 'Connected to Toolkit API' : 'Offline Mode (Local Calculations)';
        indicator.innerHTML = connected 
          ? '<span class="api-status__dot"></span><span>API</span>'
          : '<span class="api-status__dot"></span><span>Offline</span>';
      }
    },

    // Generic API request with retry
    async request(endpoint, options = {}) {
      if (!this.isConnected) {
        throw new Error('API not connected');
      }

      const url = `${CONFIG.API_BASE_URL}${endpoint}`;
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      };

      for (let attempt = 0; attempt < CONFIG.API_RETRY_ATTEMPTS; attempt++) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), CONFIG.API_TIMEOUT);
          
          const response = await fetch(url, { ...config, signal: controller.signal });
          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          
          return await response.json();
        } catch (e) {
          if (attempt === CONFIG.API_RETRY_ATTEMPTS - 1) throw e;
          await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
        }
      }
    },

    // ===== JOBS =====
    
    async listJobs() {
      return this.request('/jobs');
    },

    async getJob(id) {
      return this.request(`/jobs/${id}`);
    },

    async createJob(data) {
      return this.request('/jobs', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },

    async updateJob(id, data) {
      return this.request(`/jobs/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      });
    },

    async deleteJob(id) {
      return this.request(`/jobs/${id}`, { method: 'DELETE' });
    },

    // ===== ROOMS =====

    async listRooms(jobId) {
      return this.request(`/jobs/${jobId}/rooms`);
    },

    async createRoom(jobId, data) {
      return this.request('/rooms', {
        method: 'POST',
        body: JSON.stringify({ job_id: jobId, ...data })
      });
    },

    // ===== CALCULATORS =====

    async listCalculators() {
      return this.request('/calculators');
    },

    async calculate(calculatorType, inputs) {
      return this.request(`/calculators/${calculatorType}/calculate`, {
        method: 'POST',
        body: JSON.stringify(inputs)
      });
    },

    // ===== PRODUCTS =====

    async searchProducts(query, category = null) {
      const params = new URLSearchParams({ q: query });
      if (category) params.append('category', category);
      return this.request(`/products/search?${params}`);
    },

    // ===== EXPORTS =====

    async exportBOM(jobId, format = 'json') {
      return this.request(`/exports/bom/${jobId}?format=${format}`);
    }
  };

  // ============================================
  // HYBRID CALCULATOR - API or Local Fallback
  // ============================================

  const HybridCalculator = {
    // Map local calculator IDs to API types
    apiTypeMap: {
      'tile': 'tile_floor',
      'mortar': 'thinset_mortar',
      'grout': 'grout',
      'leveling': 'self_leveler',
      'slope': 'shower_slope',
      'waterproof': 'waterproofing',
      'labor': 'labor'
    },

    // Calculate using API if available, otherwise local
    async calculate(calcType, inputs) {
      const apiType = this.apiTypeMap[calcType];
      
      // Try API first if connected
      if (API.isConnected && apiType) {
        try {
          const result = await API.calculate(apiType, this.transformInputsForAPI(calcType, inputs));
          return this.transformResultFromAPI(result);
        } catch (e) {
          console.warn(`API calculation failed for ${calcType}, using local:`, e.message);
        }
      }

      // Fallback to local calculation
      return Calculators[calcType](inputs);
    },

    // Transform local inputs to API format
    transformInputsForAPI(calcType, inputs) {
      switch (calcType) {
        case 'tile':
          return {
            area_sqft: inputs.area,
            tile_length_in: inputs.tileWidth,
            tile_width_in: inputs.tileHeight,
            waste_percent: inputs.waste,
            round_up_to_box: true,
            tiles_per_box: inputs.tilesPerBox || 10,
            include_mortar: false,
            include_grout: false
          };
        case 'mortar':
          return {
            area_sqft: inputs.area,
            trowel_notch_size: inputs.trowelSize,
            back_butter: inputs.backButter || false
          };
        default:
          return inputs;
      }
    },

    // Transform API result to local format
    transformResultFromAPI(apiResult) {
      return {
        ...apiResult.summary,
        lineItems: apiResult.line_items,
        formulas: apiResult.formulas_used,
        source: 'api'
      };
    }
  };

  // ============================================
  // ROUTER
  // ============================================

  const Router = {
    routes: {
      dashboard: () => Views.dashboard(),
      calculators: () => Views.calculators(),
      projects: () => Views.projects(),
      settings: () => Views.settings()
    },

    init() {
      window.addEventListener('hashchange', () => this.handleRoute());
      this.handleRoute();
    },

    handleRoute() {
      const hash = window.location.hash.slice(2) || 'dashboard';
      const route = hash.split('/')[0];
      
      if (this.routes[route]) {
        AppState.currentRoute = route;
        this.routes[route]();
        this.updateNav();
        this.updateTitle();
      } else {
        this.navigate('dashboard');
      }
    },

    navigate(route) {
      window.location.hash = `/${route}`;
    },

    updateNav() {
      document.querySelectorAll('[data-route]').forEach(link => {
        const isActive = link.dataset.route === AppState.currentRoute;
        link.classList.toggle('is-active', isActive);
      });
    },

    updateTitle() {
      const titles = {
        dashboard: 'Dashboard',
        calculators: 'Calculators',
        projects: 'Projects',
        settings: 'Settings'
      };
      const el = document.getElementById('page-title');
      if (el) el.textContent = titles[AppState.currentRoute] || 'TillerCalc';
    }
  };

  // ============================================
  // TOAST NOTIFICATIONS
  // ============================================

  const Toast = {
    show(message, type = 'info', duration = CONFIG.TOAST_DURATION) {
      const container = document.getElementById('toast-container');
      const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
      };

      const toast = document.createElement('div');
      toast.className = `toast toast--${type}`;
      toast.innerHTML = `
        <span class="toast__icon">${icons[type]}</span>
        <div class="toast__content">
          <span class="toast__message">${message}</span>
        </div>
        <button class="toast__close" aria-label="Close">×</button>
      `;

      const closeBtn = toast.querySelector('.toast__close');
      closeBtn.addEventListener('click', () => this.dismiss(toast));

      container.appendChild(toast);

      if (duration > 0) {
        setTimeout(() => this.dismiss(toast), duration);
      }

      return toast;
    },

    dismiss(toast) {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }
  };

  // ============================================
  // MODAL
  // ============================================

  const Modal = {
    show(options) {
      const { title, body, footer, onClose } = options;
      const overlay = document.getElementById('modal-overlay');
      const modal = document.getElementById('modal');
      
      document.getElementById('modal-title').textContent = title;
      document.getElementById('modal-body').innerHTML = body;
      document.getElementById('modal-footer').innerHTML = footer || '';
      
      overlay.hidden = false;
      modal.querySelector('.modal__close').focus();
      
      this._onClose = onClose;
      document.body.style.overflow = 'hidden';
    },

    hide() {
      const overlay = document.getElementById('modal-overlay');
      overlay.hidden = true;
      document.body.style.overflow = '';
      
      if (this._onClose) {
        this._onClose();
        this._onClose = null;
      }
    },

    confirm(message, onConfirm) {
      this.show({
        title: 'Confirm',
        body: `<p>${message}</p>`,
        footer: `
          <button class="btn btn--secondary" onclick="window.TillerApp.Modal.hide()">Cancel</button>
          <button class="btn btn--danger" id="modal-confirm-btn">Delete</button>
        `
      });

      document.getElementById('modal-confirm-btn').addEventListener('click', () => {
        this.hide();
        onConfirm();
      });
    }
  };

  // ============================================
  // PROJECTS
  // ============================================

  const Projects = {
    create(name = 'New Project') {
      const project = {
        id: 'proj_' + Date.now(),
        name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        calculations: {},
        notes: '',
        totalArea: 0,
        rooms: []
      };

      AppState.projects.unshift(project);
      Storage.save();
      this.updateCount();
      return project;
    },

    update(id, data) {
      const index = AppState.projects.findIndex(p => p.id === id);
      if (index !== -1) {
        AppState.projects[index] = {
          ...AppState.projects[index],
          ...data,
          updatedAt: new Date().toISOString()
        };
        Storage.save();
        return AppState.projects[index];
      }
      return null;
    },

    delete(id) {
      AppState.projects = AppState.projects.filter(p => p.id !== id);
      Storage.save();
      this.updateCount();
    },

    get(id) {
      return AppState.projects.find(p => p.id === id);
    },

    getRecent(limit = 5) {
      return AppState.projects
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, limit);
    },

    updateCount() {
      const count = AppState.projects.length;
      document.getElementById('projects-count').textContent = count > 0 ? count : '';
    },

    duplicate(id) {
      const original = this.get(id);
      if (original) {
        const copy = { ...original };
        copy.id = 'proj_' + Date.now();
        copy.name = original.name + ' (Copy)';
        copy.createdAt = new Date().toISOString();
        copy.updatedAt = new Date().toISOString();
        AppState.projects.unshift(copy);
        Storage.save();
        this.updateCount();
        Toast.show('Project duplicated', 'success');
        return copy;
      }
      return null;
    },

    exportToClipboard(id) {
      const project = this.get(id);
      if (project) {
        const text = this.formatProjectText(project);
        navigator.clipboard.writeText(text).then(() => {
          Toast.show('Copied to clipboard', 'success');
        }).catch(() => {
          Toast.show('Failed to copy', 'error');
        });
      }
    },

    formatProjectText(project) {
      let text = `PROJECT: ${project.name}\n`;
      text += `Date: ${new Date(project.updatedAt).toLocaleDateString()}\n`;
      text += `=`.repeat(40) + '\n\n';

      if (project.calculations) {
        Object.entries(project.calculations).forEach(([key, calc]) => {
          text += `${key.toUpperCase()}:\n`;
          Object.entries(calc).forEach(([field, value]) => {
            text += `  ${field}: ${value}\n`;
          });
          text += '\n';
        });
      }

      if (project.notes) {
        text += `NOTES:\n${project.notes}\n`;
      }

      text += '\n---\nGenerated by TillerCalc Pro | tillerstead.com/tools/app/';
      return text;
    }
  };

  // ============================================
  // CALCULATION FUNCTIONS
  // ============================================

  const Calculations = {
    tile(inputs) {
      const { area, tileSize, layout, waste, tilesPerBox, sqftPerBox, atticStock } = inputs;
      
      if (!area || area <= 0) return null;

      const tile = TILE_PRESETS.find(t => t.id === tileSize) || TILE_PRESETS[6];
      const layoutData = LAYOUT_PRESETS.find(l => l.id === layout) || LAYOUT_PRESETS[0];
      const wastePercent = waste || layoutData.waste;
      
      const areaWithWaste = area * (1 + wastePercent / 100);
      
      let tilesNeeded;
      if (tile.isMosaic) {
        // Mosaic sheets are typically sold as 1 sq ft each
        tilesNeeded = Math.ceil(areaWithWaste);
      } else {
        const tileSqFt = (tile.width * tile.height) / 144;
        tilesNeeded = Math.ceil(areaWithWaste / tileSqFt);
      }
      
      let boxes = 0;
      if (tilesPerBox > 0) {
        boxes = Math.ceil(tilesNeeded / tilesPerBox);
      } else if (sqftPerBox > 0) {
        boxes = Math.ceil(areaWithWaste / sqftPerBox);
      }

      if (atticStock && boxes > 0) {
        boxes += Math.max(1, Math.ceil(boxes * 0.05));
      }

      return {
        areaWithWaste: areaWithWaste.toFixed(1),
        tilesNeeded,
        boxes,
        wastePercent,
        note: tile.isMosaic ? 'Mosaic sheets (1 sq ft each)' : ''
      };
    },

    mortar(inputs) {
      const { area, trowel, backButter } = inputs;
      
      if (!area || area <= 0) return null;

      const trowelData = TROWEL_PRESETS.find(t => t.id === trowel) || TROWEL_PRESETS[1];
      
      let bagsMin = Math.ceil(area / trowelData.max);
      let bagsMax = Math.ceil(area / trowelData.min);

      if (backButter) {
        bagsMin = Math.ceil(bagsMin * 1.2);
        bagsMax = Math.ceil(bagsMax * 1.3);
      }

      return {
        bagsMin,
        bagsMax,
        coverage: `${trowelData.min}–${trowelData.max} sq ft/bag`,
        note: backButter ? 'Includes ~25% for back-buttering' : ''
      };
    },

    grout(inputs) {
      const { area, tileWidth, tileLength, tileThickness, jointWidth } = inputs;
      
      if (!area || !tileWidth || !tileLength) return null;

      // TCNA Grout Coverage Formula
      // Coverage (sq ft/lb) = (L × W) / ((L + W) × D × W × 1.86)
      // Where: L,W = tile dimensions (inches), D = joint depth, W = joint width
      const tileW = parseFloat(tileWidth);      // tile width in inches
      const tileL = parseFloat(tileLength);     // tile length in inches
      const jointW = parseFloat(jointWidth) || 0.125;  // joint width in inches
      const jointD = parseFloat(tileThickness) || 0.375; // joint depth in inches
      
      // Calculate coverage in sq ft per lb of grout
      const coverageSqFtPerLb = (tileL * tileW) / ((tileL + tileW) * jointD * jointW * 1.86);
      
      // Pounds needed for the area
      const groutLbs = area / coverageSqFtPerLb;
      
      // Add 10% waste
      const totalLbs = groutLbs * 1.1;

      return {
        pounds: Math.ceil(totalLbs),
        bags25lb: Math.ceil(totalLbs / 25),
        bags10lb: Math.ceil(totalLbs / 10),
        coverage: coverageSqFtPerLb.toFixed(1),
        note: 'Based on sanded grout with 10% waste'
      };
    },

    leveling(inputs) {
      const { area, avgDepth, maxDepth } = inputs;
      
      if (!area || !avgDepth) return null;

      // avgDepth is in inches, convert to feet for volume
      const volumeCuFt = area * (avgDepth / 12);
      // Standard SLU coverage: ~0.45 cu ft per 50lb bag
      const bags = Math.ceil(volumeCuFt / 0.45);
      
      let bagsMax = bags;
      if (maxDepth && maxDepth > avgDepth) {
        const maxVolume = area * (maxDepth / 12);
        bagsMax = Math.ceil(maxVolume / 0.45);
      }

      return {
        bags,
        bagsMax,
        volume: volumeCuFt.toFixed(2),
        note: bags !== bagsMax ? `Range: ${bags}–${bagsMax} bags (50lb)` : 'Based on 50lb bags'
      };
    },

    slope(inputs) {
      const { drainToWall, slopeRatio } = inputs;
      
      if (!drainToWall) return null;

      // Standard shower slope: 1/4" per foot (0.25)
      const ratio = parseFloat(slopeRatio) || 0.25;
      const distanceFt = parseFloat(drainToWall);
      
      // Rise at wall = distance × slope ratio (inches)
      const riseInches = distanceFt * ratio;
      
      // For a circular shower floor, area = π × r²
      const areaSqFt = Math.PI * Math.pow(distanceFt, 2);
      
      // Volume of cone = (1/3) × π × r² × h
      // For pre-slope (deck mud), we need the volume in cubic feet
      const riseFoots = riseInches / 12;
      const volumeCuFt = (1/3) * Math.PI * Math.pow(distanceFt, 2) * riseFoots;
      
      // Deck mud: ~80 lbs per cubic foot, sold in 60lb bags
      const deckMudLbs = volumeCuFt * 80;
      const bags60lb = Math.ceil(deckMudLbs / 60);

      return {
        riseAtWall: riseInches.toFixed(2),
        area: areaSqFt.toFixed(1),
        deckMudCuFt: volumeCuFt.toFixed(2),
        bags60lb,
        note: `${ratio}" per foot slope to drain`
      };
    },

    waterproof(inputs) {
      const { wallArea, floorArea, corners, pipes } = inputs;
      
      const totalArea = (wallArea || 0) + (floorArea || 0);
      if (totalArea <= 0) return null;

      const membraneGallons = Math.ceil(totalArea / 50);
      const bandLength = (corners || 0) * 2 + (pipes || 0) * 2;

      return {
        membrane: membraneGallons,
        bandFeet: bandLength,
        coats: 2,
        note: 'Based on 50 sq ft/gallon, 2 coats'
      };
    },

    labor(inputs) {
      const { area, complexity, includePrep, includeDemo } = inputs;
      
      if (!area || area <= 0) return null;

      const baseRate = complexity === 'complex' ? 15 : complexity === 'moderate' ? 20 : 25;
      let hours = area / baseRate;

      if (includePrep) hours *= 1.3;
      if (includeDemo) hours *= 1.5;

      const days = Math.ceil(hours / 8);

      return {
        hours: Math.ceil(hours),
        days,
        rate: `${baseRate} sq ft/hour`,
        note: 'Estimate only - varies by conditions'
      };
    }
  };

  // ============================================
  // VIEWS
  // ============================================

  const Views = {
    dashboard() {
      const content = document.getElementById('app-content');
      if (!content) return;
      const recentProjects = Projects.getRecent(5);
      const totalProjects = AppState.projects.length;
      const totalArea = AppState.projects.reduce((sum, p) => sum + (p.totalArea || 0), 0);

      content.innerHTML = `
        <div class="dashboard">
          <!-- Hero Section -->
          <div class="dashboard__hero">
            <div class="dashboard__hero-content">
              <h2 class="dashboard__hero-title">TillerCalc Pro</h2>
              <p class="dashboard__hero-subtitle">Professional tile calculators built by a licensed NJ contractor</p>
              <div class="dashboard__hero-actions">
                <button class="btn btn--primary btn--lg" onclick="window.TillerApp.Router.navigate('calculators')">
                  <span>🧮</span> Start Calculating
                </button>
                <button class="btn btn--secondary btn--lg" onclick="window.TillerApp.createNewProject()">
                  <span>📁</span> New Project
                </button>
              </div>
            </div>
            <div class="dashboard__hero-stats">
              <div class="hero-stat">
                <div class="hero-stat__value">${totalProjects}</div>
                <div class="hero-stat__label">Projects</div>
              </div>
              <div class="hero-stat">
                <div class="hero-stat__value">${CALCULATORS.length}</div>
                <div class="hero-stat__label">Tools</div>
              </div>
              <div class="hero-stat">
                <div class="hero-stat__value">${totalArea > 1000 ? (totalArea/1000).toFixed(1) + 'k' : totalArea}</div>
                <div class="hero-stat__label">Sq Ft</div>
              </div>
            </div>
          </div>

          <!-- Quick Calculator Grid -->
          <div class="dashboard__section">
            <div class="dashboard__section-header">
              <h3 class="dashboard__section-title">Quick Access</h3>
              <span class="dashboard__section-badge">7 calculators</span>
            </div>
            <div class="calc-grid">
              ${CALCULATORS.map(calc => `
                <button class="calc-card" data-calc="${calc.id}">
                  <span class="calc-card__icon">${calc.icon}</span>
                  <span class="calc-card__name">${calc.name}</span>
                  <span class="calc-card__desc">${calc.desc}</span>
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Recent Projects -->
          <div class="dashboard__section">
            <div class="dashboard__section-header">
              <h3 class="dashboard__section-title">Recent Projects</h3>
              ${recentProjects.length > 0 ? `<a href="#/projects" class="dashboard__section-action">View All →</a>` : ''}
            </div>
            ${recentProjects.length > 0 ? `
              <ul class="recent-list">
                ${recentProjects.map(p => `
                  <li class="recent-list__item" data-project-id="${p.id}">
                    <div class="recent-list__icon">📋</div>
                    <div class="recent-list__content">
                      <div class="recent-list__name">${this.escapeHtml(p.name)}</div>
                      <div class="recent-list__meta">Updated ${this.formatDate(p.updatedAt)}</div>
                    </div>
                  </li>
                `).join('')}
              </ul>
            ` : `
              <div class="empty-state">
                <div class="empty-state__icon">📋</div>
                <h4 class="empty-state__title">No projects yet</h4>
                <p class="empty-state__text">Start calculating to create your first project.</p>
              </div>
            `}
          </div>
        </div>
      `;

      // Event listeners for recent projects
      content.querySelectorAll('[data-project-id]').forEach(item => {
        item.addEventListener('click', () => {
          AppState.activeProject = item.dataset.projectId;
          Router.navigate('calculators');
        });
      });

      // Event listeners for quick calc cards
      content.querySelectorAll('.calc-card').forEach(card => {
        card.addEventListener('click', () => {
          AppState.activeCalculator = card.dataset.calc;
          Router.navigate('calculators');
        });
      });
    },

    calculators() {
      const content = document.getElementById('app-content');
      if (!content) return;
      const activeCalc = AppState.activeCalculator;
      const activeData = CALCULATORS.find(c => c.id === activeCalc);

      content.innerHTML = `
        <div class="calculators-layout">
          <!-- Calculator Selector Panel -->
          <aside class="calc-selector">
            <div class="calc-selector__header">
              <h2 class="calc-selector__title">Calculators</h2>
              <p class="calc-selector__subtitle">Select a calculator below</p>
            </div>
            <nav class="calc-selector__list" role="tablist" aria-label="Calculator selection">
              ${CALCULATORS.map(calc => `
                <button class="calc-selector__item ${calc.id === activeCalc ? 'is-active' : ''}" 
                        role="tab" 
                        aria-selected="${calc.id === activeCalc}"
                        data-calc="${calc.id}">
                  <span class="calc-selector__icon">${calc.icon}</span>
                  <div class="calc-selector__info">
                    <span class="calc-selector__name">${calc.name}</span>
                    <span class="calc-selector__desc">${calc.desc}</span>
                  </div>
                  <svg class="calc-selector__arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </button>
              `).join('')}
            </nav>
          </aside>

          <!-- Active Calculator Panel -->
          <main class="calc-workspace">
            <div class="calc-panel is-active" id="calc-panel-${activeCalc}" role="tabpanel">
              <div class="calc-panel__header">
                <div class="calc-panel__badge">${activeData.icon}</div>
                <div>
                  <h2 class="calc-panel__title">${activeData.name} Calculator</h2>
                  <p class="calc-panel__desc">${activeData.desc}</p>
                </div>
              </div>
              ${this.renderCalculatorForm(activeCalc)}
            </div>
          </main>
        </div>

        <!-- Mobile Calculator Dropdown (shown only on small screens) -->
        <div class="calc-mobile-select">
          <label class="form-label">Select Calculator</label>
          <select class="form-select calc-mobile-dropdown" aria-label="Select calculator">
            ${CALCULATORS.map(calc => `
              <option value="${calc.id}" ${calc.id === activeCalc ? 'selected' : ''}>${calc.icon} ${calc.name}</option>
            `).join('')}
          </select>
        </div>
      `;

      // Selector item clicks
      content.querySelectorAll('.calc-selector__item').forEach(item => {
        item.addEventListener('click', () => {
          AppState.activeCalculator = item.dataset.calc;
          this.calculators();
        });
      });

      // Mobile dropdown change
      const mobileDropdown = content.querySelector('.calc-mobile-dropdown');
      if (mobileDropdown) {
        mobileDropdown.addEventListener('change', (e) => {
          AppState.activeCalculator = e.target.value;
          this.calculators();
        });
      }

      // Form submissions
      this.attachCalculatorListeners();
    },

    renderCalculatorForm(calcId) {
      const inputs = AppState.calculatorInputs[calcId] || {};
      const results = AppState.calculatorResults[calcId];

      const forms = {
        tile: `
          <div class="form-grid form-grid--2col">
            <div class="form-field">
              <label class="form-label form-label--required">Room Area</label>
              <div class="input-group">
                <input type="number" class="form-input" name="area" value="${inputs.area || ''}" min="1" step="0.1" placeholder="e.g. 120">
                <span class="input-group__suffix">sq ft</span>
              </div>
              <p class="form-help">Length × Width of the space</p>
            </div>
            <div class="form-field">
              <label class="form-label">Tile Size</label>
              <select class="form-select" name="tileSize">
                ${TILE_PRESETS.map(t => `<option value="${t.id}" ${inputs.tileSize === t.id ? 'selected' : ''}>${t.name}</option>`).join('')}
              </select>
            </div>
            <div class="form-field">
              <label class="form-label">Layout Pattern</label>
              <select class="form-select" name="layout">
                ${LAYOUT_PRESETS.map(l => `<option value="${l.id}" ${inputs.layout === l.id ? 'selected' : ''}>${l.name} (+${l.waste}% waste)</option>`).join('')}
              </select>
              <p class="form-help">Pattern affects waste factor</p>
            </div>
            <div class="form-field">
              <label class="form-label">Waste Factor</label>
              <div class="input-group">
                <input type="number" class="form-input" name="waste" value="${inputs.waste || ''}" min="5" max="40" placeholder="Auto">
                <span class="input-group__suffix">%</span>
              </div>
              <p class="form-help">Leave empty for auto based on layout</p>
            </div>
          </div>
          <div class="form-section">
            <div class="form-section__title">Box Packaging (Optional)</div>
            <div class="form-grid form-grid--2col">
              <div class="form-field">
                <label class="form-label">Tiles per Box</label>
                <input type="number" class="form-input" name="tilesPerBox" value="${inputs.tilesPerBox || ''}" min="1" placeholder="From box label">
              </div>
              <div class="form-field">
                <label class="form-label">Sq Ft per Box</label>
                <input type="number" class="form-input" name="sqftPerBox" value="${inputs.sqftPerBox || ''}" min="0.1" step="0.1" placeholder="From box label">
              </div>
            </div>
          </div>
          <div class="form-field mt-lg">
            <label class="form-checkbox">
              <input type="checkbox" name="atticStock" ${inputs.atticStock ? 'checked' : ''}>
              <span>Add attic stock (+5% or 1 box minimum for future repairs)</span>
            </label>
          </div>
        `,

        mortar: `
          <div class="form-grid form-grid--2col">
            <div class="form-field">
              <label class="form-label form-label--required">Tile Area</label>
              <div class="input-group">
                <input type="number" class="form-input" name="area" value="${inputs.area || ''}" min="1" step="0.1" placeholder="e.g. 120">
                <span class="input-group__suffix">sq ft</span>
              </div>
            </div>
            <div class="form-field">
              <label class="form-label">Trowel Size</label>
              <select class="form-select" name="trowel">
                ${TROWEL_PRESETS.map(t => `<option value="${t.id}" ${inputs.trowel === t.id ? 'selected' : ''}>${t.name}</option>`).join('')}
              </select>
              <p class="form-help">Larger tiles = larger trowel</p>
            </div>
          </div>
          <div class="form-field mt-lg">
            <label class="form-checkbox">
              <input type="checkbox" name="backButter" ${inputs.backButter ? 'checked' : ''}>
              <span>Include back-buttering (large format tiles, +25% mortar)</span>
            </label>
          </div>
        `,

        grout: `
          <div class="form-grid form-grid--2col">
            <div class="form-field">
              <label class="form-label form-label--required">Tile Area</label>
              <div class="input-group">
                <input type="number" class="form-input" name="area" value="${inputs.area || ''}" min="1" step="0.1" placeholder="e.g. 120">
                <span class="input-group__suffix">sq ft</span>
              </div>
            </div>
            <div class="form-field">
              <label class="form-label">Joint Width</label>
              <div class="input-group">
                <input type="number" class="form-input" name="jointWidth" value="${inputs.jointWidth || 0.125}" min="0.0625" max="0.5" step="0.0625">
                <span class="input-group__suffix">in</span>
              </div>
              <p class="form-help">1/16" = 0.0625, 1/8" = 0.125</p>
            </div>
          </div>
          <div class="form-section">
            <div class="form-section__title">Tile Dimensions</div>
            <div class="form-grid form-grid--3col">
              <div class="form-field">
                <label class="form-label">Width</label>
                <div class="input-group">
                  <input type="number" class="form-input" name="tileWidth" value="${inputs.tileWidth || 12}" min="1" step="0.25">
                  <span class="input-group__suffix">in</span>
                </div>
              </div>
              <div class="form-field">
                <label class="form-label">Length</label>
                <div class="input-group">
                  <input type="number" class="form-input" name="tileLength" value="${inputs.tileLength || 12}" min="1" step="0.25">
                  <span class="input-group__suffix">in</span>
                </div>
              </div>
              <div class="form-field">
                <label class="form-label">Thickness</label>
                <div class="input-group">
                  <input type="number" class="form-input" name="tileThickness" value="${inputs.tileThickness || 0.375}" min="0.125" max="0.75" step="0.125">
                  <span class="input-group__suffix">in</span>
                </div>
                <p class="form-help">Joint depth</p>
              </div>
            </div>
          </div>
        `,

        leveling: `
          <div class="form-grid form-grid--2col">
            <div class="form-field">
              <label class="form-label form-label--required">Floor Area</label>
              <div class="input-group">
                <input type="number" class="form-input" name="area" value="${inputs.area || ''}" min="1" step="0.1" placeholder="e.g. 120">
                <span class="input-group__suffix">sq ft</span>
              </div>
            </div>
            <div class="form-field">
              <label class="form-label form-label--required">Average Depth</label>
              <div class="input-group">
                <input type="number" class="form-input" name="avgDepth" value="${inputs.avgDepth || ''}" min="0.125" max="3" step="0.125" placeholder="e.g. 0.25">
                <span class="input-group__suffix">in</span>
              </div>
              <p class="form-help">Typical: 1/8" to 1/2"</p>
            </div>
            <div class="form-field">
              <label class="form-label">Maximum Depth</label>
              <div class="input-group">
                <input type="number" class="form-input" name="maxDepth" value="${inputs.maxDepth || ''}" min="0.125" max="3" step="0.125" placeholder="Optional">
                <span class="input-group__suffix">in</span>
              </div>
              <p class="form-help">Deepest pour point</p>
            </div>
          </div>
        `,

        slope: `
          <div class="form-grid form-grid--2col">
            <div class="form-field">
              <label class="form-label form-label--required">Drain to Wall</label>
              <div class="input-group">
                <input type="number" class="form-input" name="drainToWall" value="${inputs.drainToWall || ''}" min="1" max="10" step="0.25" placeholder="e.g. 3">
                <span class="input-group__suffix">ft</span>
              </div>
              <p class="form-help">Distance from center drain to wall</p>
            </div>
            <div class="form-field">
              <label class="form-label">Slope Ratio</label>
              <div class="input-group">
                <input type="number" class="form-input" name="slopeRatio" value="${inputs.slopeRatio || 0.25}" min="0.125" max="0.5" step="0.125">
                <span class="input-group__suffix">"/ft</span>
              </div>
              <p class="form-help">Standard: 1/4" per foot</p>
            </div>
          </div>
        `,

        waterproof: `
          <div class="form-grid form-grid--2col">
            <div class="form-field">
              <label class="form-label form-label--required">Wall Area</label>
              <div class="input-group">
                <input type="number" class="form-input" name="wallArea" value="${inputs.wallArea || ''}" min="0" step="0.1" placeholder="e.g. 80">
                <span class="input-group__suffix">sq ft</span>
              </div>
              <p class="form-help">Total wall surface in wet areas</p>
            </div>
            <div class="form-field">
              <label class="form-label">Floor Area</label>
              <div class="input-group">
                <input type="number" class="form-input" name="floorArea" value="${inputs.floorArea || ''}" min="0" step="0.1" placeholder="e.g. 25">
                <span class="input-group__suffix">sq ft</span>
              </div>
              <p class="form-help">Shower floor, curb, bench tops</p>
            </div>
            <div class="form-field">
              <label class="form-label">Inside Corners</label>
              <input type="number" class="form-input" name="corners" value="${inputs.corners || 4}" min="0" max="50" placeholder="e.g. 4">
              <p class="form-help">Count all inside corners</p>
            </div>
            <div class="form-field">
              <label class="form-label">Pipe Penetrations</label>
              <input type="number" class="form-input" name="pipes" value="${inputs.pipes || 1}" min="0" max="20" placeholder="e.g. 2">
              <p class="form-help">Shower head, valve, etc.</p>
            </div>
          </div>
        `,

        labor: `
          <div class="form-grid form-grid--2col">
            <div class="form-field">
              <label class="form-label form-label--required">Total Area</label>
              <div class="input-group">
                <input type="number" class="form-input" name="area" value="${inputs.area || ''}" min="1" step="0.1" placeholder="e.g. 120">
                <span class="input-group__suffix">sq ft</span>
              </div>
            </div>
            <div class="form-field">
              <label class="form-label">Job Complexity</label>
              <select class="form-select" name="complexity">
                <option value="simple" ${inputs.complexity === 'simple' ? 'selected' : ''}>Simple – Straight lay, minimal cuts</option>
                <option value="moderate" ${inputs.complexity === 'moderate' ? 'selected' : ''}>Moderate – Pattern work, some cuts</option>
                <option value="complex" ${inputs.complexity === 'complex' ? 'selected' : ''}>Complex – Mosaics, intricate patterns</option>
              </select>
            </div>
          </div>
          <div class="form-section">
            <div class="form-section__title">Additional Work</div>
            <div class="form-grid form-grid--2col">
              <div class="form-field">
                <label class="form-checkbox">
                  <input type="checkbox" name="includePrep" ${inputs.includePrep ? 'checked' : ''}>
                  <span>Include surface prep (+30% time)</span>
                </label>
              </div>
              <div class="form-field">
                <label class="form-checkbox">
                  <input type="checkbox" name="includeDemo" ${inputs.includeDemo ? 'checked' : ''}>
                  <span>Include demo of existing (+50% time)</span>
                </label>
              </div>
            </div>
          </div>
        `
      };

      return `
        <form class="calc-form" data-calc="${calcId}">
          ${forms[calcId] || '<p>Calculator not available</p>'}
          <div class="mt-xl" style="display: flex; gap: 1rem; flex-wrap: wrap;">
            <button type="submit" class="btn btn--calculate">
              <span>⚡</span> Calculate
            </button>
            <button type="button" class="btn btn--secondary" onclick="window.TillerApp.clearCalculator('${calcId}')">
              <span>🔄</span> Clear
            </button>
          </div>
          ${results ? this.renderResults(calcId, results) : ''}
        </form>
      `;
    },

    renderResults(calcId, results) {
      if (!results) return '';

      const resultFields = {
        tile: [
          { key: 'areaWithWaste', label: 'Area with Waste', suffix: ' sq ft' },
          { key: 'tilesNeeded', label: 'Tiles Needed' },
          { key: 'boxes', label: 'Boxes', highlight: true }
        ],
        mortar: [
          { key: 'bagsMin', label: 'Min Bags' },
          { key: 'bagsMax', label: 'Max Bags', highlight: true },
          { key: 'coverage', label: 'Coverage' }
        ],
        grout: [
          { key: 'pounds', label: 'Grout (lbs)' },
          { key: 'bags25lb', label: '25 lb Bags', highlight: true },
          { key: 'bags10lb', label: '10 lb Bags' },
          { key: 'coverage', label: 'Coverage', suffix: ' sqft/lb' }
        ],
        leveling: [
          { key: 'volume', label: 'Volume', suffix: ' cu ft' },
          { key: 'bags', label: 'Bags (50 lb)', highlight: true }
        ],
        slope: [
          { key: 'riseAtWall', label: 'Rise at Wall', suffix: '"' },
          { key: 'area', label: 'Floor Area', suffix: ' sq ft' },
          { key: 'deckMudCuFt', label: 'Deck Mud', suffix: ' cu ft' },
          { key: 'bags60lb', label: '60 lb Bags', highlight: true }
        ],
        waterproof: [
          { key: 'membrane', label: 'Membrane', suffix: ' gal', highlight: true },
          { key: 'bandFeet', label: 'Seam Band', suffix: ' ft' },
          { key: 'coats', label: 'Coats Required' }
        ],
        labor: [
          { key: 'hours', label: 'Est. Hours' },
          { key: 'days', label: 'Est. Days', highlight: true },
          { key: 'rate', label: 'Production Rate' }
        ]
      };

      const fields = resultFields[calcId] || [];

      return `
        <div class="calc-results">
          <h4 class="calc-results__title">Results</h4>
          <div class="calc-results__grid">
            ${fields.map(f => `
              <div class="calc-result">
                <div class="calc-result__label">${f.label}</div>
                <div class="calc-result__value ${f.highlight ? 'calc-result__value--highlight' : ''}">
                  ${results[f.key] || '—'}${f.suffix || ''}
                </div>
              </div>
            `).join('')}
          </div>
          ${results.note ? `<p class="calc-results__note">${results.note}</p>` : ''}
          <div class="mt-lg calc-results__actions">
            <button type="button" class="btn btn--secondary btn--sm" onclick="window.TillerApp.saveToProject('${calcId}')">
              💾 Save to Project
            </button>
            <button type="button" class="btn btn--ghost btn--sm" onclick="window.TillerApp.downloadCalcPDF('${calcId}')" title="Download PDF">
              📄 Export PDF
            </button>
          </div>
        </div>
      `;
    },

    attachCalculatorListeners() {
      document.querySelectorAll('.calc-form').forEach(form => {
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const calcId = form.dataset.calc;
          const submitBtn = form.querySelector('.btn--calculate');
          const formData = new FormData(form);
          const inputs = {};

          // Show calculating state
          if (submitBtn) {
            submitBtn.classList.add('is-calculating');
            submitBtn.innerHTML = '<span>⏳</span> Calculating...';
          }

          formData.forEach((value, key) => {
            if (form.querySelector(`[name="${key}"]`)?.type === 'checkbox') {
              inputs[key] = form.querySelector(`[name="${key}"]`).checked;
            } else {
              inputs[key] = value === '' ? null : (isNaN(value) ? value : parseFloat(value));
            }
          });

          // Also get checkboxes that aren't checked
          form.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            if (!inputs.hasOwnProperty(cb.name)) {
              inputs[cb.name] = cb.checked;
            }
          });

          AppState.calculatorInputs[calcId] = inputs;
          
          // Brief delay for visual feedback
          await new Promise(r => setTimeout(r, 150));

          const calcFn = Calculations[calcId];
          if (calcFn) {
            const results = calcFn(inputs);
            if (results) {
              AppState.calculatorResults[calcId] = results;
              Toast.show('Calculation complete', 'success');
            } else {
              Toast.show('Please fill in required fields', 'warning');
            }
          }

          this.calculators();
        });

        // Auto-calculate on input change
        form.querySelectorAll('input, select').forEach(input => {
          input.addEventListener('change', () => {
            const calcId = form.dataset.calc;
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.click();
          });
        });
      });
    },

    projects() {
      const content = document.getElementById('app-content');
      if (!content) return;
      const projects = AppState.projects;

      content.innerHTML = `
        <div class="projects-view">
          <!-- Header -->
          <div class="view-header">
            <div class="view-header__info">
              <h2 class="view-header__title">Projects</h2>
              <p class="view-header__subtitle">${projects.length} saved project${projects.length !== 1 ? 's' : ''}</p>
            </div>
            <div class="view-header__actions">
              <button class="btn btn--primary" onclick="window.TillerApp.createNewProject()">
                <span>➕</span> New Project
              </button>
              <button class="btn btn--secondary" onclick="document.getElementById('import-input').click()">
                <span>📥</span> Import
              </button>
              <input type="file" id="import-input" accept=".json" hidden onchange="window.TillerApp.Storage.importData(this.files[0])">
              ${projects.length > 0 ? `
                <button class="btn btn--secondary" onclick="window.TillerApp.Storage.exportData()">
                  <span>📤</span> Export All
                </button>
              ` : ''}
            </div>
          </div>

          ${projects.length > 0 ? `
            <!-- Project Grid -->
            <div class="project-grid">
              ${projects.map(p => `
                <article class="project-card" data-project-id="${p.id}">
                  <div class="project-card__header">
                    <div class="project-card__icon">📋</div>
                    <div class="project-card__info">
                      <h3 class="project-card__name">${this.escapeHtml(p.name)}</h3>
                      <time class="project-card__date">Updated ${this.formatDate(p.updatedAt)}</time>
                    </div>
                  </div>
                  
                  <div class="project-card__stats">
                    <div class="project-card__stat">
                      <span class="project-card__stat-value">${p.totalArea || 0}</span>
                      <span class="project-card__stat-label">sq ft</span>
                    </div>
                    <div class="project-card__stat">
                      <span class="project-card__stat-value">${Object.keys(p.calculations || {}).length}</span>
                      <span class="project-card__stat-label">calcs</span>
                    </div>
                  </div>

                  <div class="project-card__actions">
                    <button class="btn btn--primary btn--sm" onclick="window.TillerApp.openProject('${p.id}')">
                      Open
                    </button>
                    <div class="project-card__tools">
                      <button class="icon-btn" onclick="window.TillerApp.downloadProjectPDF('${p.id}')" title="Download PDF">
                        <span>📄</span>
                      </button>
                      <button class="icon-btn" onclick="window.TillerApp.Projects.exportToClipboard('${p.id}')" title="Copy to clipboard">
                        <span>📋</span>
                      </button>
                      <button class="icon-btn" onclick="window.TillerApp.Projects.duplicate('${p.id}'); window.TillerApp.Views.projects();" title="Duplicate">
                        <span>📑</span>
                      </button>
                      <button class="icon-btn icon-btn--danger" onclick="window.TillerApp.deleteProject('${p.id}')" title="Delete">
                        <span>🗑️</span>
                      </button>
                    </div>
                  </div>
                </article>
              `).join('')}
            </div>
          ` : `
            <!-- Empty State -->
            <div class="empty-state empty-state--large">
              <div class="empty-state__icon">📁</div>
              <h3 class="empty-state__title">No projects yet</h3>
              <p class="empty-state__text">Create your first project to save calculations, track materials, and export professional estimates.</p>
              <button class="btn btn--primary btn--lg" onclick="window.TillerApp.createNewProject()">
                <span>➕</span> Create First Project
              </button>
            </div>
          `}
        </div>
      `;
    },

    settings() {
      const content = document.getElementById('app-content');
      if (!content) return;
      const settings = AppState.settings;
      const apiConnected = API.isConnected;

      content.innerHTML = `
        <div class="settings-view">
          <!-- Header -->
          <div class="view-header">
            <div class="view-header__info">
              <h2 class="view-header__title">Settings</h2>
              <p class="view-header__subtitle">Configure your TillerCalc Pro experience</p>
            </div>
          </div>

          <div class="settings-grid">
            <!-- Preferences -->
            <section class="settings-card">
              <div class="settings-card__header">
                <span class="settings-card__icon">⚙️</span>
                <h3 class="settings-card__title">Preferences</h3>
              </div>
              <div class="settings-card__body">
                <div class="setting-row">
                  <div class="setting-row__info">
                    <div class="setting-row__label">Auto-save</div>
                    <div class="setting-row__desc">Automatically save changes to localStorage</div>
                  </div>
                  <label class="toggle">
                    <input type="checkbox" ${settings.autoSave ? 'checked' : ''} onchange="window.TillerApp.updateSetting('autoSave', this.checked)">
                    <span class="toggle__track"></span>
                  </label>
                </div>
                <div class="setting-row">
                  <div class="setting-row__info">
                    <div class="setting-row__label">Notifications</div>
                    <div class="setting-row__desc">Show toast notifications for actions</div>
                  </div>
                  <label class="toggle">
                    <input type="checkbox" ${settings.notifications ? 'checked' : ''} onchange="window.TillerApp.updateSetting('notifications', this.checked)">
                    <span class="toggle__track"></span>
                  </label>
                </div>
              </div>
            </section>

            <!-- Toolkit Integration -->
            <section class="settings-card">
              <div class="settings-card__header">
                <span class="settings-card__icon">🔌</span>
                <h3 class="settings-card__title">Toolkit Integration</h3>
                <span class="settings-card__badge ${apiConnected ? 'settings-card__badge--success' : ''}">
                  ${apiConnected ? '● Connected' : '○ Offline'}
                </span>
              </div>
              <div class="settings-card__body">
                <p class="settings-card__text">
                  Connect to the Tillerstead Toolkit backend for enhanced calculations and cloud sync.
                </p>
                <div class="setting-row">
                  <div class="setting-row__info">
                    <div class="setting-row__label">API Endpoint</div>
                    <div class="setting-row__desc">${CONFIG.API_BASE_URL || 'Not configured'}</div>
                  </div>
                  <button class="btn btn--sm btn--secondary" onclick="window.TillerApp.API.checkHealth().then(() => window.TillerApp.Views.settings())">
                    Test Connection
                  </button>
                </div>
                ${apiConnected ? `
                  <div class="setting-actions">
                    <button class="btn btn--sm btn--secondary" onclick="window.TillerApp.syncToToolkit()">
                      <span>⬆️</span> Push to Toolkit
                    </button>
                    <button class="btn btn--sm btn--secondary" onclick="window.TillerApp.syncFromToolkit()">
                      <span>⬇️</span> Pull from Toolkit
                    </button>
                  </div>
                ` : ''}
              </div>
            </section>

            <!-- Data Management -->
            <section class="settings-card">
              <div class="settings-card__header">
                <span class="settings-card__icon">💾</span>
                <h3 class="settings-card__title">Data Management</h3>
              </div>
              <div class="settings-card__body">
                <div class="setting-row">
                  <div class="setting-row__info">
                    <div class="setting-row__label">Local Storage</div>
                    <div class="setting-row__desc">${AppState.projects.length} projects saved locally</div>
                  </div>
                </div>
                <div class="setting-actions">
                  <button class="btn btn--sm btn--secondary" onclick="window.TillerApp.Storage.exportData()">
                    <span>📤</span> Export Data
                  </button>
                  <button class="btn btn--sm btn--secondary" onclick="document.getElementById('settings-import').click()">
                    <span>📥</span> Import Data
                  </button>
                  <input type="file" id="settings-import" accept=".json" hidden onchange="window.TillerApp.Storage.importData(this.files[0])">
                </div>
                <div class="setting-row setting-row--danger">
                  <div class="setting-row__info">
                    <div class="setting-row__label">Clear All Data</div>
                    <div class="setting-row__desc">Permanently delete all projects and settings</div>
                  </div>
                  <button class="btn btn--sm btn--danger" onclick="if(confirm('Delete all data? This cannot be undone.')){window.TillerApp.Storage.clearAll(); window.TillerApp.Views.settings();}">
                    Clear Data
                  </button>
                </div>
              </div>
            </section>

            <!-- About -->
            <section class="settings-card">
              <div class="settings-card__header">
                <span class="settings-card__icon">ℹ️</span>
                <h3 class="settings-card__title">About TillerCalc Pro</h3>
              </div>
              <div class="settings-card__body">
                <div class="about-info">
                  <div class="about-info__row">
                    <span>Version</span>
                    <span>1.0.0</span>
                  </div>
                  <div class="about-info__row">
                    <span>Developer</span>
                    <span>Tillerstead LLC</span>
                  </div>
                  <div class="about-info__row">
                    <span>NJ HIC License</span>
                    <span>#13VH10808800</span>
                  </div>
                  <div class="about-info__row">
                    <span>Standards</span>
                    <span>TCNA 2024 Compliant</span>
                  </div>
                </div>
                <p class="settings-card__text" style="margin-top: var(--space-lg);">
                  Professional tile calculators built by a licensed contractor in New Jersey.
                </p>
              </div>
            </section>
          </div>
        </div>
      `;
    },

    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text || '';
      return div.innerHTML;
    },

    formatDate(dateStr) {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now - date;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      return date.toLocaleDateString();
    }
  };

  // ============================================
  // KEYBOARD SHORTCUTS
  // ============================================

  const Keyboard = {
    init() {
      document.addEventListener('keydown', (e) => {
        // Ctrl+S: Save
        if (e.ctrlKey && e.key === 's') {
          e.preventDefault();
          Storage.save();
          Toast.show('Saved', 'success');
        }

        // Ctrl+N: New project
        if (e.ctrlKey && e.key === 'n') {
          e.preventDefault();
          App.createNewProject();
        }

        // Escape: Close modal/sidebar
        if (e.key === 'Escape') {
          Modal.hide();
          document.getElementById('app-sidebar').classList.remove('is-open');
          document.querySelector('.sidebar-overlay')?.classList.remove('is-visible');
        }

        // 1-4: Navigate views
        if (!e.ctrlKey && !e.altKey && !e.metaKey) {
          const routes = ['dashboard', 'calculators', 'projects', 'settings'];
          const num = parseInt(e.key);
          if (num >= 1 && num <= 4 && document.activeElement.tagName !== 'INPUT') {
            Router.navigate(routes[num - 1]);
          }
        }
      });
    }
  };

  // ============================================
  // SERVICE WORKER
  // ============================================

  const ServiceWorkerManager = {
    register() {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
          .then(reg => {
            console.log('SW registered:', reg.scope);
          })
          .catch(err => {
            console.log('SW registration failed:', err);
          });
      }
    },

    updateOnlineStatus() {
      const statusEl = document.getElementById('app-status');
      if (statusEl) {
        const isOnline = navigator.onLine;
        statusEl.innerHTML = `
          <span class="status-dot status-dot--${isOnline ? 'online' : 'offline'}"></span>
          ${isOnline ? 'Online' : 'Offline'}
        `;
      }
    }
  };

  // ============================================
  // APP INITIALIZATION
  // ============================================

  // Helper to hide loading and show app (always runs, even on error)
  function showApp() {
    const loading = document.getElementById('app-loading');
    const shell = document.getElementById('app-shell');
    if (loading) loading.hidden = true;
    if (shell) shell.classList.add('is-ready');
  }

  const App = {
    async init() {
      try {
        // Load data
        Storage.load();

        // Initialize router
        Router.init();

        // Initialize keyboard shortcuts
        Keyboard.init();

        // Register service worker
        ServiceWorkerManager.register();

        // Check toolkit API connection (non-blocking)
        API.checkHealth().then(connected => {
          if (connected) {
            Toast.show('Connected to Toolkit API', 'success');
          }
        }).catch(() => {}); // Ignore API check errors

        // Periodic health check (every 30 seconds)
        setInterval(() => API.checkHealth(), 30000);

        // Online/offline status
        window.addEventListener('online', () => {
          ServiceWorkerManager.updateOnlineStatus();
          API.checkHealth();
        });
        window.addEventListener('offline', () => {
          ServiceWorkerManager.updateOnlineStatus();
          API.isConnected = false;
          API.updateConnectionUI(false);
        });
        ServiceWorkerManager.updateOnlineStatus();

        // Sidebar toggle
        document.getElementById('sidebar-toggle')?.addEventListener('click', () => {
          const sidebar = document.getElementById('app-sidebar');
          sidebar.classList.toggle('is-open');
          this.toggleOverlay(sidebar.classList.contains('is-open'));
        });

        document.getElementById('sidebar-close')?.addEventListener('click', () => {
          document.getElementById('app-sidebar').classList.remove('is-open');
          this.toggleOverlay(false);
        });

        // Modal close handlers
        document.getElementById('modal-close')?.addEventListener('click', () => Modal.hide());
        document.getElementById('modal-overlay')?.addEventListener('click', (e) => {
          if (e.target.id === 'modal-overlay') Modal.hide();
        });

        // New project button
        document.getElementById('new-project-btn')?.addEventListener('click', () => this.createNewProject());

        // Save button
        document.getElementById('save-btn')?.addEventListener('click', () => {
          Storage.save();
          Toast.show('Saved', 'success');
        });

        // Update project count
        Projects.updateCount();

      } catch (err) {
        console.error('TillerCalc init error:', err);
        // Show error toast if available
        try { Toast.show('App initialization error', 'error'); } catch (e) {}
      } finally {
        // ALWAYS show the app, even if init had errors
        showApp();
      }
    },

    toggleOverlay(show) {
      let overlay = document.querySelector('.sidebar-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        overlay.addEventListener('click', () => {
          document.getElementById('app-sidebar').classList.remove('is-open');
          this.toggleOverlay(false);
        });
        document.body.appendChild(overlay);
      }
      overlay.classList.toggle('is-visible', show);
    },

    createNewProject() {
      Modal.show({
        title: 'New Project',
        body: `
          <div class="form-field">
            <label class="form-label">Project Name</label>
            <input type="text" class="form-input" id="new-project-name" placeholder="e.g., Master Bathroom Renovation" autofocus>
          </div>
        `,
        footer: `
          <button class="btn btn--secondary" onclick="window.TillerApp.Modal.hide()">Cancel</button>
          <button class="btn btn--primary" id="create-project-btn">Create</button>
        `
      });

      const input = document.getElementById('new-project-name');
      const createBtn = document.getElementById('create-project-btn');

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') createBtn.click();
      });

      createBtn.addEventListener('click', () => {
        const name = input.value.trim() || 'New Project';
        const project = Projects.create(name);
        AppState.activeProject = project.id;
        Modal.hide();
        Router.navigate('calculators');
        Toast.show(`Project "${name}" created`, 'success');
      });

      input.focus();
    },

    openProject(id) {
      AppState.activeProject = id;
      const project = Projects.get(id);
      if (project && project.calculations) {
        Object.entries(project.calculations).forEach(([calcId, data]) => {
          AppState.calculatorInputs[calcId] = data.inputs || {};
          AppState.calculatorResults[calcId] = data.results || null;
        });
      }
      Router.navigate('calculators');
    },

    deleteProject(id) {
      Modal.confirm('Are you sure you want to delete this project?', () => {
        Projects.delete(id);
        Views.projects();
        Toast.show('Project deleted', 'success');
      });
    },

    saveToProject(calcId) {
      if (!AppState.activeProject) {
        this.createNewProject();
        return;
      }

      const project = Projects.get(AppState.activeProject);
      if (project) {
        if (!project.calculations) project.calculations = {};
        project.calculations[calcId] = {
          inputs: AppState.calculatorInputs[calcId],
          results: AppState.calculatorResults[calcId],
          savedAt: new Date().toISOString()
        };

        // Update total area from tile calc
        if (calcId === 'tile' && AppState.calculatorInputs[calcId]?.area) {
          project.totalArea = parseFloat(AppState.calculatorInputs[calcId].area) || 0;
        }

        Projects.update(AppState.activeProject, project);
        Toast.show('Saved to project', 'success');
      }
    },

    clearCalculator(calcId) {
      AppState.calculatorInputs[calcId] = {};
      AppState.calculatorResults[calcId] = null;
      Views.calculators();
    },

    updateSetting(key, value) {
      AppState.settings[key] = value;
      Storage.save();
      Toast.show('Setting updated', 'success');
    },

    clearAllData() {
      Modal.confirm('This will delete all projects and reset all settings. Continue?', () => {
        localStorage.removeItem(CONFIG.STORAGE_KEY);
        AppState.projects = [];
        AppState.settings = {
          autoSave: true,
          notifications: true,
          darkMode: true,
          units: 'imperial'
        };
        Projects.updateCount();
        Router.navigate('dashboard');
        Toast.show('All data cleared', 'success');
      });
    },

    // ===== TOOLKIT SYNC =====

    async syncToToolkit() {
      if (!API.isConnected) {
        Toast.show('Toolkit API not connected', 'warning');
        return;
      }

      try {
        let synced = 0;
        for (const project of AppState.projects) {
          // Check if project has toolkit_id (already synced)
          if (project.toolkit_id) {
            await API.updateJob(project.toolkit_id, this.projectToJob(project));
          } else {
            const job = await API.createJob(this.projectToJob(project));
            project.toolkit_id = job.id;
            synced++;
          }
        }
        Storage.save();
        Toast.show(`Synced ${synced} project(s) to Toolkit`, 'success');
      } catch (e) {
        Toast.show('Sync failed: ' + e.message, 'error');
      }
    },

    async importFromToolkit() {
      if (!API.isConnected) {
        Toast.show('Toolkit API not connected', 'warning');
        return;
      }

      try {
        const jobs = await API.listJobs();
        let imported = 0;
        
        for (const job of jobs) {
          // Skip if we already have this job
          const exists = AppState.projects.some(p => p.toolkit_id === job.id);
          if (!exists) {
            const project = this.jobToProject(job);
            Projects.add(project);
            imported++;
          }
        }
        
        Storage.save();
        Projects.updateCount();
        Router.navigate(AppState.currentRoute);
        Toast.show(`Imported ${imported} job(s) from Toolkit`, 'success');
      } catch (e) {
        Toast.show('Import failed: ' + e.message, 'error');
      }
    },

    // Convert local project to toolkit job format
    projectToJob(project) {
      return {
        name: project.name || 'Untitled Project',
        client_name: project.clientName || null,
        client_email: project.clientEmail || null,
        client_phone: project.clientPhone || null,
        address_line1: project.address || null,
        city: project.city || null,
        state: 'NJ',
        zip_code: project.zip || null,
        status: 'draft',
        notes: project.notes || null,
        labor_rate: 75.0,
        overhead_percent: 15.0,
        profit_percent: 20.0
      };
    },

    // Convert toolkit job to local project format
    jobToProject(job) {
      return {
        id: 'project_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        toolkit_id: job.id,
        name: job.name,
        clientName: job.client_name,
        clientEmail: job.client_email,
        clientPhone: job.client_phone,
        address: job.address_line1,
        city: job.city,
        zip: job.zip_code,
        notes: job.notes,
        totalArea: 0,
        rooms: [],
        calculations: {},
        createdAt: job.created_at,
        updatedAt: job.updated_at
      };
    }
  };

  // ============================================
  // EXPOSE API
  // ============================================

  window.TillerApp = {
    Router,
    Toast,
    Modal,
    Projects,
    Storage,
    Views,
    API,
    HybridCalculator,
    createNewProject: () => App.createNewProject(),
    openProject: (id) => App.openProject(id),
    deleteProject: (id) => App.deleteProject(id),
    saveToProject: (calcId) => App.saveToProject(calcId),
    clearCalculator: (calcId) => App.clearCalculator(calcId),
    updateSetting: (key, value) => App.updateSetting(key, value),
    clearAllData: () => App.clearAllData(),
    // Toolkit sync methods
    syncToToolkit: () => App.syncToToolkit(),
    importFromToolkit: () => App.importFromToolkit(),
    // PDF export methods
    downloadProjectPDF: (projectId) => {
      const project = Projects.get(projectId);
      if (!project) {
        Toast.show('Project not found', 'error');
        return;
      }
      if (!window.TillerPDF || !window.TillerPDF.isAvailable()) {
        Toast.show('PDF library not loaded', 'error');
        return;
      }
      const result = window.TillerPDF.downloadProjectSummary(project);
      if (result.success) {
        Toast.show(`Downloaded: ${result.filename}`, 'success');
      } else {
        Toast.show('PDF generation failed', 'error');
      }
    },
    downloadMaterialsPDF: (projectId) => {
      const project = Projects.get(projectId);
      if (!project) {
        Toast.show('Project not found', 'error');
        return;
      }
      if (!window.TillerPDF || !window.TillerPDF.isAvailable()) {
        Toast.show('PDF library not loaded', 'error');
        return;
      }
      const result = window.TillerPDF.downloadMaterialList(project);
      if (result.success) {
        Toast.show(`Downloaded: ${result.filename}`, 'success');
      } else {
        Toast.show('PDF generation failed', 'error');
      }
    },
    downloadCalcPDF: (calcId) => {
      const inputs = AppState.calculatorInputs[calcId];
      const results = AppState.calculatorResults[calcId];
      if (!inputs || !results) {
        Toast.show('No calculation results to export', 'warning');
        return;
      }
      if (!window.TillerPDF || !window.TillerPDF.isAvailable()) {
        Toast.show('PDF library not loaded', 'error');
        return;
      }
      const activeProject = AppState.activeProject ? Projects.get(AppState.activeProject) : null;
      const projectName = activeProject ? activeProject.name : 'Quick Estimate';
      const result = window.TillerPDF.downloadQuickEstimate(calcId, inputs, results, projectName);
      if (result.success) {
        Toast.show(`Downloaded: ${result.filename}`, 'success');
      } else {
        Toast.show('PDF generation failed', 'error');
      }
    }
  };

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
  } else {
    App.init();
  }

})();
