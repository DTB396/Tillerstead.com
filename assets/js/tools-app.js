/**
 * TillerPro - Web Application
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

  // Calculator definitions - TillerPro suite
  // status: 'ready' = implemented, 'coming' = planned
  // Organized by logical workflow: Coverage → Structural → Prep/Finish → Planning
  const CALCULATORS = [
    // ═══════════════════════════════════════════════════════════════════
    // SURFACE COVERAGE: Calculate materials for tile installation
    // ═══════════════════════════════════════════════════════════════════
    { 
      id: 'tile', 
      name: 'Tile Quantity', 
      icon: '🧱', 
      desc: 'Tiles and boxes needed',
      tooltip: 'Calculate exact tile count with waste factors for different layouts. Supports mosaic sheets and large-format tile (LFT).',
      category: 'coverage', 
      status: 'ready' 
    },
    { 
      id: 'mortar', 
      name: 'Mortar Coverage', 
      icon: '🔧', 
      desc: 'Thin-set bags needed',
      tooltip: 'Estimate mortar bags based on trowel size. Automatically adds 25% for back-buttering LFT per TCNA standards.',
      category: 'coverage', 
      status: 'ready' 
    },
    { 
      id: 'grout', 
      name: 'Grout Calculator', 
      icon: '🪣', 
      desc: 'Grout volume & bags',
      tooltip: 'Calculate grout needed based on tile size, joint width, and depth using TCNA formula. 10% waste included.',
      category: 'coverage', 
      status: 'ready' 
    },
    { 
      id: 'waterproof', 
      name: 'Waterproofing', 
      icon: '💧', 
      desc: 'Membrane coverage',
      tooltip: 'Calculate liquid membrane gallons and reinforcing band feet for showers, tub surrounds, and wet areas.',
      category: 'coverage', 
      status: 'ready' 
    },

    // ═══════════════════════════════════════════════════════════════════
    // STRUCTURAL/LOAD: Verify substrate and electrical requirements
    // ═══════════════════════════════════════════════════════════════════
    { 
      id: 'slope', 
      name: 'Shower Slope', 
      icon: '📐', 
      desc: 'Pre-slope rise & volume',
      tooltip: 'Calculate shower floor pre-slope dimensions and deck mud volume. Standard is ¼" per foot to drain.',
      category: 'structural', 
      status: 'ready' 
    },
    { 
      id: 'deflection', 
      name: 'Structure Deflection', 
      icon: '🏗️', 
      desc: 'L/360 or L/720 check',
      tooltip: 'Verify floor joist deflection meets TCNA requirements. Natural stone requires L/720, ceramic L/360.',
      category: 'structural', 
      status: 'ready' 
    },
    { 
      id: 'heated-floor', 
      name: 'Heated Floor Load', 
      icon: '♨️', 
      desc: 'Watts, amps, breaker',
      tooltip: 'Calculate electrical load for radiant floor heating. Determines amp draw and breaker/thermostat requirements.',
      category: 'structural', 
      status: 'ready' 
    },

    // ═══════════════════════════════════════════════════════════════════
    // PREP & FINISHING: Surface preparation and finishing materials
    // ═══════════════════════════════════════════════════════════════════
    { 
      id: 'leveling', 
      name: 'Self-Leveling', 
      icon: '📏', 
      desc: 'SLU compound amounts',
      tooltip: 'Calculate self-leveling underlayment (SLU) bags needed based on pour depth and area.',
      category: 'prepfinish', 
      status: 'ready' 
    },
    { 
      id: 'thinset-mix', 
      name: 'Thinset Mixing', 
      icon: '🌀', 
      desc: 'Water ratio & yield',
      tooltip: 'Calculate water-to-powder ratio and batch yield per TDS specs. Includes pot life guidance.',
      category: 'prepfinish', 
      status: 'ready' 
    },
    { 
      id: 'primer', 
      name: 'Primer / SLU Prep', 
      icon: '🧴', 
      desc: 'Coat coverage',
      tooltip: 'Estimate primer gallons for porous vs non-porous substrates. Supports double-priming calculations.',
      category: 'prepfinish', 
      status: 'ready' 
    },
    { 
      id: 'deck-mud', 
      name: 'Deck Mud', 
      icon: '🏔️', 
      desc: 'Pan volume & bags',
      tooltip: 'Calculate dry-pack mortar for shower pans and beds. Accounts for slope and minimum thickness.',
      category: 'prepfinish', 
      status: 'ready' 
    },
    { 
      id: 'sealant', 
      name: 'Sealant / Caulk', 
      icon: '🧵', 
      desc: 'Tubes needed',
      tooltip: 'Calculate caulk/sealant tubes based on linear feet and bead diameter. Supports 10.1oz and 28oz sizes.',
      category: 'prepfinish', 
      status: 'ready' 
    },
    { 
      id: 'sealer', 
      name: 'Sealer Coverage', 
      icon: '🛡️', 
      desc: 'Gallons by porosity',
      tooltip: 'Estimate sealer gallons based on surface porosity (natural stone, grout, concrete) and coat count.',
      category: 'prepfinish', 
      status: 'ready' 
    },

    // ═══════════════════════════════════════════════════════════════════
    // PLANNING & LAYOUT: Project planning and trim work
    // ═══════════════════════════════════════════════════════════════════
    { 
      id: 'movement', 
      name: 'Movement Joints', 
      icon: '↔️', 
      desc: 'EJ171 spacing grid',
      tooltip: 'Calculate expansion joint spacing per TCNA EJ171. Accounts for interior/exterior exposure and temperature swing.',
      category: 'other', 
      status: 'ready' 
    },
    { 
      id: 'moisture', 
      name: 'Moisture / RH', 
      icon: '💨', 
      desc: 'ASTM F1869/F2170',
      tooltip: 'Evaluate moisture vapor emission rate (MVER) and relative humidity (RH) against adhesive/coating limits.',
      category: 'other', 
      status: 'ready' 
    },
    { 
      id: 'bath-layout', 
      name: 'Bath Layout', 
      icon: '🛁', 
      desc: 'Fixture clearances',
      tooltip: 'Plan bathroom fixture placement with IPC code-compliant clearances for tub, toilet, vanity, and shower.',
      category: 'other', 
      status: 'ready' 
    },
    { 
      id: 'labor', 
      name: 'Labor Estimate', 
      icon: '⏱️', 
      desc: 'Time & scheduling',
      tooltip: 'Estimate installation time based on area, complexity, and additional work (prep, demo).',
      category: 'other', 
      status: 'ready' 
    },
    // Trim & Molding
    { 
      id: 'crown', 
      name: 'Crown Molding', 
      icon: '👑', 
      desc: 'Trim & corners',
      tooltip: 'Calculate crown molding pieces, inside/outside corners, and material costs by profile size.',
      category: 'other', 
      status: 'ready' 
    },
    { 
      id: 'baseboard', 
      name: 'Baseboard', 
      icon: '📋', 
      desc: 'Wall base & chair rail',
      tooltip: 'Calculate baseboard with door/window deductions. Includes wainscoting panel framing option.',
      category: 'other', 
      status: 'ready' 
    },
    { 
      id: 'quarter', 
      name: 'Quarter Round', 
      icon: '🔘', 
      desc: 'Floor trim',
      tooltip: 'Calculate quarter round or shoe molding with deductions for doors, cabinets, and transitions.',
      category: 'other', 
      status: 'ready' 
    }
  ];

  // Category metadata for grouping with enhanced descriptions
  const CATEGORIES = {
    coverage: { 
      name: 'Surface Coverage', 
      icon: '🧱', 
      order: 1, 
      desc: 'Calculate tile, mortar, grout, and waterproofing materials',
      longDesc: 'Essential calculators for determining material quantities with built-in waste factors and TCNA compliance.'
    },
    structural: { 
      name: 'Structural & Load', 
      icon: '🏗️', 
      order: 2, 
      desc: 'Verify substrate requirements and electrical loads',
      longDesc: 'Check floor deflection, shower slopes, and heated floor electrical requirements before installation.'
    },
    prepfinish: { 
      name: 'Prep & Finishing', 
      icon: '🧴', 
      order: 3, 
      desc: 'Surface prep, mixing ratios, and finishing products',
      longDesc: 'Calculate leveling compound, mixing ratios, primers, sealants, and sealers for proper surface preparation.'
    },
    other: { 
      name: 'Planning & Layout', 
      icon: '📐', 
      order: 4, 
      desc: 'Project planning, layout, and trim work',
      longDesc: 'Plan bathroom layouts, movement joints, moisture testing, labor estimates, and trim/molding calculations.'
    }
  };

  // ============================================
  // CONSTANTS - Synced with tools.js (TDS-verified)
  // ============================================

  // TCNA defines Large Format Tile (LFT) as any tile with any side ≥15"
  // LFT requires 95% mortar coverage, proper trowel selection, and back-buttering
  const TILE_PRESETS = [
    { id: 'mosaic-1x1', name: '1×1 Mosaic (12×12 sheet)', width: 1, height: 1, isMosaic: true, sheetCoverage: 1 },
    { id: 'mosaic-2x2', name: '2×2 Mosaic (12×12 sheet)', width: 2, height: 2, isMosaic: true, sheetCoverage: 1 },
    { id: '3x6', name: '3×6 Subway', width: 3, height: 6 },
    { id: '4x4', name: '4×4', width: 4, height: 4 },
    { id: '4x12', name: '4×12', width: 4, height: 12 },
    { id: '6x6', name: '6×6', width: 6, height: 6 },
    { id: '6x24', name: '6×24 Plank', width: 6, height: 24, isPlank: true, isLargeFormat: true },
    { id: '8x48', name: '8×48 Plank', width: 8, height: 48, isPlank: true, isLargeFormat: true },
    { id: '12x12', name: '12×12', width: 12, height: 12 },
    { id: '12x24', name: '12×24', width: 12, height: 24, isLargeFormat: true },
    { id: '12x48', name: '12×48 Plank', width: 12, height: 48, isPlank: true, isLargeFormat: true },
    { id: '24x24', name: '24×24', width: 24, height: 24, isLargeFormat: true },
    { id: '24x48', name: '24×48', width: 24, height: 48, isLargeFormat: true },
    { id: 'custom', name: 'Custom Size', width: 0, height: 0, isCustom: true }
  ];

  // Layout patterns with waste factors
  // TCNA restricts LFT offset to maximum 33% to minimize lippage risk
  const LAYOUT_PRESETS = [
    { id: 'straight', name: 'Straight / Stacked', waste: 10, wasteFactor: 0.10 },
    { id: 'subway-33', name: '1/3 Offset (Recommended for LFT)', waste: 12, wasteFactor: 0.12, lftSafe: true },
    { id: 'subway-50', name: '50% Offset (Brick)', waste: 15, wasteFactor: 0.15, lippageRisk: true, lftWarning: 'NOT recommended for LFT—max 33% offset per TCNA' },
    { id: 'brick', name: 'Running Bond', waste: 12, wasteFactor: 0.12 },
    { id: 'diagonal', name: 'Diagonal', waste: 18, wasteFactor: 0.18 },
    { id: 'herringbone', name: 'Herringbone', waste: 25, wasteFactor: 0.25 },
    { id: 'mosaic', name: 'Mosaic Sheet', waste: 12, wasteFactor: 0.12 }
  ];

  // Trowel presets with TDS-verified coverage per 50 lb bag
  // Source: Custom Building Products VersaBond LFT TDS-132 (verified Jan 2026)
  const TROWEL_PRESETS = [
    { id: '3/16-v', name: '3/16" V-Notch', min: 100, max: 130, forTiles: 'mosaic, small wall' },
    { id: '1/4-sq', name: '1/4" × 1/4" Square', min: 90, max: 100, forTiles: 'up to 8×8' },
    { id: '1/4x3/8-sq', name: '1/4" × 3/8" Square', min: 60, max: 67, forTiles: '8×8 to 13×13' },
    { id: '1/2-sq', name: '1/2" × 1/2" Square', min: 42, max: 47, forTiles: 'not recommended for LFT', notForLFT: true },
    { id: '3/4-u-45', name: '3/4" × 9/16" U-Notch @ 45°', min: 34, max: 38, forTiles: 'LFT ≥15"', forLFT: true },
    { id: '3/4-u-30', name: '3/4" × 9/16" U-Notch @ 30°', min: 42, max: 47, forTiles: 'LFT ≥15" (best)', forLFT: true, recommended: true }
  ];

  // Joint width presets per ANSI A108.02
  const JOINT_PRESETS = [
    { id: '1/16', name: '1/16" (minimum)', size: 0.0625, note: 'Absolute minimum per ANSI' },
    { id: '1/8', name: '1/8" (rectified)', size: 0.125, note: 'Standard for rectified tile' },
    { id: '3/16', name: '3/16" (calibrated)', size: 0.1875, note: 'Standard for non-rectified' },
    { id: '1/4', name: '1/4" (rustic/handmade)', size: 0.25, note: 'Handmade/high-variation tile' }
  ];

  // Grout density constant: ~1.86 lbs per cubic inch for sanded cement grout
  const GROUT_DENSITY_LBS_PER_CUIN = 1.86;

  // Self-leveler coverage: 0.45 cu ft per 50 lb bag (conservative avg per TDS)
  const LEVELER_COVERAGE = 0.45;

  // ============================================
  // TRIM & MOLDING PRESETS
  // ============================================

  // Crown molding profiles with standard dimensions and pricing tiers
  const CROWN_PRESETS = [
    { id: '2.25-finger', name: '2-1/4" Finger-Joint Pine', size: 2.25, material: 'pine', pricePerFt: 1.25, paintGrade: true },
    { id: '3.25-mdf', name: '3-1/4" MDF', size: 3.25, material: 'mdf', pricePerFt: 1.50, paintGrade: true },
    { id: '3.625-pine', name: '3-5/8" Pine', size: 3.625, material: 'pine', pricePerFt: 2.00, paintGrade: true },
    { id: '4.625-pine', name: '4-5/8" Pine', size: 4.625, material: 'pine', pricePerFt: 3.25, paintGrade: true },
    { id: '5.25-poplar', name: '5-1/4" Poplar', size: 5.25, material: 'poplar', pricePerFt: 4.50, paintGrade: true },
    { id: '4.5-oak', name: '4-1/2" Red Oak', size: 4.5, material: 'oak', pricePerFt: 6.50, stainGrade: true },
    { id: 'custom', name: 'Custom Size', size: 0, isCustom: true }
  ];

  // Baseboard and chair rail profiles
  const BASEBOARD_PRESETS = [
    { id: '3.25-mdf', name: '3-1/4" MDF Baseboard', size: 3.25, type: 'baseboard', pricePerFt: 0.85 },
    { id: '4.25-mdf', name: '4-1/4" MDF Baseboard', size: 4.25, type: 'baseboard', pricePerFt: 1.10 },
    { id: '5.25-mdf', name: '5-1/4" MDF Baseboard', size: 5.25, type: 'baseboard', pricePerFt: 1.35 },
    { id: '6-mdf', name: '6" MDF Baseboard', size: 6, type: 'baseboard', pricePerFt: 1.65 },
    { id: '7.25-mdf', name: '7-1/4" MDF Baseboard', size: 7.25, type: 'baseboard', pricePerFt: 2.10 },
    { id: '2.5-chair', name: '2-1/2" Chair Rail', size: 2.5, type: 'chair', pricePerFt: 1.75 },
    { id: '3-chair', name: '3" Chair Rail', size: 3, type: 'chair', pricePerFt: 2.25 },
    { id: 'custom', name: 'Custom Size', size: 0, isCustom: true }
  ];

  // Quarter round and shoe molding
  const QUARTER_PRESETS = [
    { id: '0.5-pine', name: '1/2" Pine Quarter Round', size: 0.5, material: 'pine', pricePerFt: 0.45 },
    { id: '0.75-pine', name: '3/4" Pine Quarter Round', size: 0.75, material: 'pine', pricePerFt: 0.65 },
    { id: '0.75-mdf', name: '3/4" MDF Quarter Round', size: 0.75, material: 'mdf', pricePerFt: 0.55 },
    { id: '0.5-shoe', name: '1/2" × 3/4" Shoe Molding', size: 0.5, material: 'pine', pricePerFt: 0.55, isShoe: true },
    { id: '0.75-oak', name: '3/4" Red Oak Quarter Round', size: 0.75, material: 'oak', pricePerFt: 1.85 },
    { id: 'custom', name: 'Custom Size', size: 0, isCustom: true }
  ];

  // Standard trim lengths (for calculating pieces needed)
  const TRIM_LENGTHS = [
    { id: '8', name: '8 ft', length: 8 },
    { id: '10', name: '10 ft', length: 10 },
    { id: '12', name: '12 ft', length: 12 },
    { id: '16', name: '16 ft', length: 16 }
  ];

  // Waste factors for trim work
  const TRIM_WASTE = {
    simple: 0.10,      // Straight runs, few corners
    moderate: 0.15,    // Standard room with corners
    complex: 0.20,     // Many corners, angles, returns
    coffered: 0.25     // Coffered ceilings, wainscoting panels
  };

  // ============================================
  // STATE MANAGEMENT
  // ============================================

  const AppState = {
    currentRoute: 'dashboard',
    projects: [],
    activeProject: null,
    activeCalculator: 'tile',
    searchQuery: '',
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
      a.download = `tillerpro-export-${Date.now()}.json`;
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
      'movement': 'movement_joints',
      'deflection': 'deflection',
      'heated-floor': 'heated_floor',
      'moisture': 'moisture_check',
      'thinset-mix': 'thinset_mix',
      'sealer': 'sealer',
      'deck-mud': 'deck_mud',
      'primer': 'primer',
      'sealant': 'sealant',
      'bath-layout': 'bath_layout',
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
        case 'movement':
          return {
            length_ft: inputs.length || inputs.lengthFt,
            width_ft: inputs.width || inputs.widthFt,
            exposure: inputs.exposure || 'interior',
            temp_swing_f: inputs.tempSwingF ?? 30,
            sun_exposed: inputs.isSunExposed || false
          };
        case 'deflection':
          return {
            span_ft: inputs.spanFeet,
            joist_spacing_in: inputs.joistSpacingInches,
            joist_width_in: inputs.joistWidthInches,
            joist_depth_in: inputs.joistDepthInches,
            modulus_psi: inputs.modulusPsi || 1600000,
            live_load_psf: inputs.liveLoadPsft || 40,
            dead_load_psf: inputs.deadLoadPsft || 10
          };
        case 'heated-floor':
          return {
            area_sqft: inputs.areaSqFt || inputs.area,
            watts_per_sqft: inputs.wattsPerSqFt || 12,
            voltage: inputs.voltage || 120,
            thermostat_max_amps: inputs.thermostatMaxAmps || 15
          };
        case 'moisture':
          return {
            mver_lbs: inputs.mverLbs,
            rh_percent: inputs.rhPercent,
            limit_mver: inputs.productLimitMver || 5,
            limit_rh: inputs.productLimitRh || 75
          };
        case 'thinset-mix':
          return {
            bag_weight_lbs: inputs.bagWeightLbs || 50,
            water_quarts_min: inputs.waterQuartsPerBagMin || 5,
            water_quarts_max: inputs.waterQuartsPerBagMax || 6,
            batch_weight_lbs: inputs.batchWeightLbs,
            pot_life_min: inputs.potLifeMinutes || 120,
            yield_cuft_per_bag: inputs.yieldCuFtPerBag || 0.45
          };
        case 'sealer':
          return {
            area_sqft: inputs.areaSqFt || inputs.area,
            surface: inputs.surface || 'natural_stone',
            coats: inputs.coats || 2
          };
        case 'deck-mud':
          return {
            area_sqft: inputs.areaSqFt || inputs.area,
            run_ft: inputs.runFeet,
            min_thickness_in: inputs.minThicknessInches || 1.25,
            slope_in_per_ft: inputs.slopeInchesPerFoot || 0.25,
            bag_yield_cuft: inputs.bagYieldCuFt || 0.5
          };
        case 'primer':
          return {
            area_sqft: inputs.areaSqFt || inputs.area,
            porosity: inputs.porosity || 'porous',
            double_prime: inputs.doublePrime || false
          };
        case 'sealant':
          return {
            linear_ft: inputs.linearFeet,
            bead_diameter_in: inputs.beadDiameterInches || 0.25,
            tube_volume_oz: inputs.tubeVolumeOz || 10.1
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
      if (el) el.textContent = titles[AppState.currentRoute] || 'TillerPro';
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

      text += '\n---\nGenerated by TillerPro | tillerstead.com/tools/app/';
      return text;
    }
  };

  // ============================================
  // CALCULATION FUNCTIONS (Harmonized with tools.js)
  // ============================================

  const Calculations = {
    movement(inputs) {
      const { calculateMovementJoints } = window.TillersteadFormulas;
      return calculateMovementJoints({
        lengthFt: inputs.length || inputs.lengthFt,
        widthFt: inputs.width || inputs.widthFt,
        exposure: inputs.exposure || 'interior',
        tempSwingF: inputs.tempSwingF ?? 30,
        isSunExposed: inputs.isSunExposed || false
      });
    },

    deflection(inputs) {
      const { calculateDeflection } = window.TillersteadFormulas;
      return calculateDeflection({
        spanFeet: inputs.spanFeet,
        joistSpacingInches: inputs.joistSpacingInches,
        joistWidthInches: inputs.joistWidthInches,
        joistDepthInches: inputs.joistDepthInches,
        modulusPsi: inputs.modulusPsi || 1600000,
        liveLoadPsft: inputs.liveLoadPsft || 40,
        deadLoadPsft: inputs.deadLoadPsft || 10
      });
    },

    'heated-floor'(inputs) {
      const { calculateHeatedFloorLoad } = window.TillersteadFormulas;
      return calculateHeatedFloorLoad({
        areaSqFt: inputs.areaSqFt || inputs.area,
        wattsPerSqFt: inputs.wattsPerSqFt || 12,
        voltage: inputs.voltage || 120,
        thermostatMaxAmps: inputs.thermostatMaxAmps || 15
      });
    },

    moisture(inputs) {
      const { evaluateMoistureReadings } = window.TillersteadFormulas;
      return evaluateMoistureReadings({
        mverLbs: inputs.mverLbs,
        rhPercent: inputs.rhPercent,
        productLimitMver: inputs.productLimitMver || 5,
        productLimitRh: inputs.productLimitRh || 75
      });
    },

    'thinset-mix'(inputs) {
      const { calculateThinsetMix } = window.TillersteadFormulas;
      return calculateThinsetMix({
        bagWeightLbs: inputs.bagWeightLbs || 50,
        waterQuartsPerBagMin: inputs.waterQuartsPerBagMin || 5,
        waterQuartsPerBagMax: inputs.waterQuartsPerBagMax || 6,
        batchWeightLbs: inputs.batchWeightLbs,
        potLifeMinutes: inputs.potLifeMinutes || 120,
        yieldCuFtPerBag: inputs.yieldCuFtPerBag || 0.45
      });
    },

    sealer(inputs) {
      const { estimateSealer } = window.TillersteadFormulas;
      return estimateSealer({
        areaSqFt: inputs.areaSqFt || inputs.area,
        surface: inputs.surface || 'natural_stone',
        coats: inputs.coats || 2
      });
    },

    'deck-mud'(inputs) {
      const { calculateDeckMud } = window.TillersteadFormulas;
      return calculateDeckMud({
        areaSqFt: inputs.areaSqFt || inputs.area,
        runFeet: inputs.runFeet,
        minThicknessInches: inputs.minThicknessInches || 1.25,
        slopeInchesPerFoot: inputs.slopeInchesPerFoot || 0.25,
        bagYieldCuFt: inputs.bagYieldCuFt || 0.5
      });
    },

    primer(inputs) {
      const { estimatePrimer } = window.TillersteadFormulas;
      return estimatePrimer({
        areaSqFt: inputs.areaSqFt || inputs.area,
        porosity: inputs.porosity || 'porous',
        doublePrime: inputs.doublePrime || false
      });
    },

    sealant(inputs) {
      const { estimateSealantTubes } = window.TillersteadFormulas;
      return estimateSealantTubes({
        linearFeet: inputs.linearFeet,
        beadDiameterInches: inputs.beadDiameterInches || 0.25,
        tubeVolumeOz: inputs.tubeVolumeOz || 10.1
      });
    },

    'bath-layout'(inputs) {
      const { calculateBathLayout } = window.TillersteadFormulas;
      return calculateBathLayout({
        roomLengthFt: inputs.roomLengthFt,
        roomWidthFt: inputs.roomWidthFt,
        doorWidthIn: inputs.doorWidthIn ?? 32,
        walkwayMinIn: inputs.walkwayMinIn ?? 30,
        includeTub: inputs.includeTub ?? true,
        tubLengthIn: inputs.tubLengthIn ?? 60,
        tubWidthIn: inputs.tubWidthIn ?? 30,
        tubFrontClearIn: inputs.tubFrontClearIn ?? 30,
        includeShower: inputs.includeShower ?? true,
        showerWidthIn: inputs.showerWidthIn ?? 36,
        showerDepthIn: inputs.showerDepthIn ?? 36,
        showerFrontClearIn: inputs.showerFrontClearIn ?? 30,
        includeToilet: inputs.includeToilet ?? true,
        toiletSideClearIn: inputs.toiletSideClearIn ?? 15,
        toiletDepthIn: inputs.toiletDepthIn ?? 28,
        toiletFrontClearIn: inputs.toiletFrontClearIn ?? 24,
        includeVanity: inputs.includeVanity ?? true,
        vanityWidthIn: inputs.vanityWidthIn ?? 48,
        vanityDepthIn: inputs.vanityDepthIn ?? 22,
        vanityFrontClearIn: inputs.vanityFrontClearIn ?? 30
      });
    },

    tile(inputs) {
      const { area, tileSize, layout, waste, tilesPerBox, sqftPerBox, atticStock, customWidth, customHeight } = inputs;
      
      if (!area || area <= 0) return null;

      // Get tile data, handle custom sizes
      let tile = TILE_PRESETS.find(t => t.id === tileSize) || TILE_PRESETS[8]; // default 12x12
      if (tile.isCustom && customWidth && customHeight) {
        const w = parseFloat(customWidth);
        const h = parseFloat(customHeight);
        tile = { ...tile, width: w, height: h, isLargeFormat: Math.max(w, h) >= 15 };
      }
      
      const layoutData = LAYOUT_PRESETS.find(l => l.id === layout) || LAYOUT_PRESETS[0];
      const wastePercent = waste || layoutData.waste;
      
      const areaWithWaste = area * (1 + wastePercent / 100);
      
      let tilesNeeded;
      if (tile.isMosaic && tile.sheetCoverage) {
        // Mosaic sheets use sheet coverage (typically 1 sq ft each)
        tilesNeeded = Math.ceil(areaWithWaste / tile.sheetCoverage);
      } else if (tile.width > 0 && tile.height > 0) {
        const tileSqFt = (tile.width * tile.height) / 144;
        tilesNeeded = Math.ceil(areaWithWaste / tileSqFt);
      } else {
        tilesNeeded = 0;
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

      // Build notes and warnings for LFT
      const notes = [];
      const warnings = [];
      
      if (tile.isMosaic) {
        notes.push('Mosaic sheets (1 sq ft each)');
      }
      
      if (tile.isLargeFormat) {
        notes.push('Large-format tile (LFT) — requires 95% mortar coverage');
        if (layoutData.lippageRisk) {
          warnings.push(layoutData.lftWarning || '50% offset NOT recommended for LFT per TCNA');
        }
      }

      return {
        areaWithWaste: areaWithWaste.toFixed(1),
        tilesNeeded,
        boxes,
        wastePercent,
        isLargeFormat: tile.isLargeFormat || false,
        note: notes.join('. '),
        warning: warnings.join(' ')
      };
    },

    mortar(inputs) {
      const { area, trowel, backButter, tileSize } = inputs;
      
      if (!area || area <= 0) return null;

      const trowelData = TROWEL_PRESETS.find(t => t.id === trowel) || TROWEL_PRESETS[1];
      const tile = tileSize ? TILE_PRESETS.find(t => t.id === tileSize) : null;
      const isLFT = tile?.isLargeFormat || false;
      
      let bagsMin = Math.ceil(area / trowelData.max);
      let bagsMax = Math.ceil(area / trowelData.min);

      // Always add 20-30% for back-buttering with LFT
      const shouldBackButter = backButter || isLFT;
      if (shouldBackButter) {
        bagsMin = Math.ceil(bagsMin * 1.2);
        bagsMax = Math.ceil(bagsMax * 1.3);
      }

      // Build notes and warnings
      const notes = [];
      const warnings = [];
      
      notes.push(`Coverage: ${trowelData.min}–${trowelData.max} sq ft/bag per CBP TDS-132`);
      
      if (shouldBackButter) {
        notes.push('Includes ~25% extra for back-buttering');
      }
      
      if (isLFT) {
        if (trowelData.notForLFT) {
          warnings.push(`${trowelData.name} NOT recommended for LFT—use 3/4" U-notch`);
        } else if (trowelData.forLFT) {
          notes.push('Correct trowel for LFT');
        }
      }

      return {
        bagsMin,
        bagsMax,
        coverage: `${trowelData.min}–${trowelData.max} sq ft/bag`,
        note: notes.join('. '),
        warning: warnings.join(' ')
      };
    },

    grout(inputs) {
      const { area, tileWidth, tileLength, tileThickness, jointWidth, tileSize } = inputs;
      
      if (!area || area <= 0) return null;
      
      // Get tile dimensions from preset if not provided directly
      let tileW = parseFloat(tileWidth);
      let tileL = parseFloat(tileLength);
      
      if ((!tileW || !tileL) && tileSize) {
        const tile = TILE_PRESETS.find(t => t.id === tileSize);
        if (tile && tile.width > 0) {
          tileW = tile.width;
          tileL = tile.height;
        }
      }
      
      if (!tileW || !tileL) return null;

      // Joint dimensions
      const jointW = parseFloat(jointWidth) || 0.125;  // default 1/8"
      const jointD = parseFloat(tileThickness) || 0.375; // default 3/8" (typical tile)
      
      // TCNA Grout Coverage Formula using constant
      // Formula: Area × (L + W) / (L × W) × T × J × K where K = 1.86
      const lbsPerSqFt = ((tileL + tileW) / (tileL * tileW)) * jointD * jointW * GROUT_DENSITY_LBS_PER_CUIN;
      
      // Coverage in sq ft per lb (inverse)
      const coverageSqFtPerLb = 1 / lbsPerSqFt;
      
      // Pounds needed with 10% waste
      const groutLbs = area * lbsPerSqFt * 1.1;

      return {
        pounds: Math.ceil(groutLbs),
        bags25lb: Math.ceil(groutLbs / 25),
        bags10lb: Math.ceil(groutLbs / 10),
        coverage: coverageSqFtPerLb.toFixed(1),
        lbsPerSqFt: lbsPerSqFt.toFixed(3),
        note: `Sanded grout with 10% waste. ~${lbsPerSqFt.toFixed(2)} lbs/sq ft`
      };
    },

    leveling(inputs) {
      const { area, avgDepth, maxDepth } = inputs;
      
      if (!area || !avgDepth) return null;

      // avgDepth is in inches, convert to feet for volume
      const volumeCuFt = area * (avgDepth / 12);
      // Use harmonized LEVELER_COVERAGE constant
      const bags = Math.ceil(volumeCuFt / LEVELER_COVERAGE);
      
      let bagsMax = bags;
      if (maxDepth && maxDepth > avgDepth) {
        const maxVolume = area * (maxDepth / 12);
        bagsMax = Math.ceil(maxVolume / LEVELER_COVERAGE);
      }

      return {
        bags,
        bagsMax,
        volume: volumeCuFt.toFixed(2),
        note: bags !== bagsMax ? `Range: ${bags}–${bagsMax} bags (50lb)` : `Based on 50lb bags @ ${LEVELER_COVERAGE} cu ft/bag`
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
    },

    // ============================================
    // TRIM CALCULATORS
    // ============================================

    /**
     * Crown Molding Calculator
     * Calculates linear feet, pieces, inside/outside corners
     */
    crown(inputs) {
      const { perimeter, roomLength, roomWidth, profile, stockLength, complexity, insideCorners, outsideCorners } = inputs;
      
      // Calculate perimeter from L×W or use direct input
      let totalPerimeter = parseFloat(perimeter) || 0;
      if (!totalPerimeter && roomLength && roomWidth) {
        totalPerimeter = 2 * (parseFloat(roomLength) + parseFloat(roomWidth));
      }
      
      if (totalPerimeter <= 0) return null;

      const crownProfile = CROWN_PRESETS.find(c => c.id === profile) || CROWN_PRESETS[1];
      const stockLen = parseFloat(stockLength) || 12;
      const wasteFactor = TRIM_WASTE[complexity] || TRIM_WASTE.moderate;
      
      // Linear feet with waste
      const linearFtWithWaste = totalPerimeter * (1 + wasteFactor);
      
      // Pieces needed (round up)
      const piecesNeeded = Math.ceil(linearFtWithWaste / stockLen);
      
      // Calculate corners
      const inCorners = parseInt(insideCorners) || 4; // Standard room has 4
      const outCorners = parseInt(outsideCorners) || 0;
      
      // Corner blocks (if using) - alternative to coping/mitering
      const cornerBlocksNeeded = inCorners + outCorners;
      
      // Material cost estimate
      const materialCost = linearFtWithWaste * (crownProfile.pricePerFt || 2.00);
      
      // Build notes
      const notes = [];
      notes.push(`${crownProfile.name} @ ${stockLen}' lengths`);
      if (inCorners > 0) notes.push(`${inCorners} inside corners (cope or miter)`);
      if (outCorners > 0) notes.push(`${outCorners} outside corners (miter)`);
      if (crownProfile.paintGrade) notes.push('Paint grade - prime before install');

      return {
        perimeter: totalPerimeter.toFixed(1),
        linearFt: linearFtWithWaste.toFixed(1),
        pieces: piecesNeeded,
        insideCorners: inCorners,
        outsideCorners: outCorners,
        cornerBlocks: cornerBlocksNeeded,
        wastePercent: Math.round(wasteFactor * 100),
        materialCost: materialCost.toFixed(2),
        note: notes.join('. ')
      };
    },

    /**
     * Baseboard & Chair Rail Calculator
     * Includes wainscoting panel framing calculations
     */
    baseboard(inputs) {
      const { perimeter, roomLength, roomWidth, profile, stockLength, complexity, 
              doorOpenings, windowOpenings, includePanels, panelHeight, panelWidth, panelCount } = inputs;
      
      // Calculate perimeter
      let totalPerimeter = parseFloat(perimeter) || 0;
      if (!totalPerimeter && roomLength && roomWidth) {
        totalPerimeter = 2 * (parseFloat(roomLength) + parseFloat(roomWidth));
      }
      
      if (totalPerimeter <= 0) return null;

      const baseProfile = BASEBOARD_PRESETS.find(b => b.id === profile) || BASEBOARD_PRESETS[1];
      const stockLen = parseFloat(stockLength) || 12;
      const wasteFactor = TRIM_WASTE[complexity] || TRIM_WASTE.moderate;
      
      // Subtract door openings (typical 3' each)
      const doorDeduction = (parseInt(doorOpenings) || 0) * 3;
      // Windows don't deduct from baseboard (they're above it)
      
      const netPerimeter = Math.max(0, totalPerimeter - doorDeduction);
      const linearFtWithWaste = netPerimeter * (1 + wasteFactor);
      const piecesNeeded = Math.ceil(linearFtWithWaste / stockLen);
      
      // Wainscoting panel framing calculation
      let panelFramingFt = 0;
      let panelDetails = null;
      
      if (includePanels && panelCount > 0) {
        const pHeight = parseFloat(panelHeight) || 24; // inches
        const pWidth = parseFloat(panelWidth) || 18;   // inches
        const pCount = parseInt(panelCount) || 0;
        
        // Each panel frame: 2 vertical stiles + 2 horizontal rails
        const panelPerimeter = 2 * (pHeight + pWidth) / 12; // convert to feet
        panelFramingFt = panelPerimeter * pCount * (1 + TRIM_WASTE.coffered);
        
        panelDetails = {
          count: pCount,
          framePerPanel: panelPerimeter.toFixed(1),
          totalFraming: panelFramingFt.toFixed(1)
        };
      }
      
      const totalLinearFt = linearFtWithWaste + panelFramingFt;
      const totalPieces = Math.ceil(totalLinearFt / stockLen);
      const materialCost = totalLinearFt * (baseProfile.pricePerFt || 1.10);
      
      // Build notes
      const notes = [];
      notes.push(`${baseProfile.name} @ ${stockLen}' lengths`);
      if (doorDeduction > 0) notes.push(`${doorOpenings} door(s) deducted (${doorDeduction} ft)`);
      if (panelDetails) notes.push(`${panelDetails.count} wainscot panels (${panelDetails.totalFraming} ft framing)`);

      return {
        grossPerimeter: totalPerimeter.toFixed(1),
        netPerimeter: netPerimeter.toFixed(1),
        linearFt: linearFtWithWaste.toFixed(1),
        panelFramingFt: panelFramingFt.toFixed(1),
        totalLinearFt: totalLinearFt.toFixed(1),
        pieces: piecesNeeded,
        totalPieces,
        wastePercent: Math.round(wasteFactor * 100),
        materialCost: materialCost.toFixed(2),
        panelDetails,
        note: notes.join('. ')
      };
    },

    /**
     * Quarter Round & Shoe Molding Calculator
     * For flooring transitions and baseboards
     */
    quarter(inputs) {
      const { perimeter, roomLength, roomWidth, profile, stockLength, complexity,
              doorOpenings, cabinetRuns, transitionStrips } = inputs;
      
      // Calculate perimeter
      let totalPerimeter = parseFloat(perimeter) || 0;
      if (!totalPerimeter && roomLength && roomWidth) {
        totalPerimeter = 2 * (parseFloat(roomLength) + parseFloat(roomWidth));
      }
      
      if (totalPerimeter <= 0) return null;

      const quarterProfile = QUARTER_PRESETS.find(q => q.id === profile) || QUARTER_PRESETS[1];
      const stockLen = parseFloat(stockLength) || 8; // Quarter round typically 8'
      const wasteFactor = TRIM_WASTE[complexity] || TRIM_WASTE.moderate;
      
      // Deductions
      const doorDeduction = (parseInt(doorOpenings) || 0) * 3;      // 3' per door opening
      const cabinetDeduction = parseFloat(cabinetRuns) || 0;        // Linear ft of cabinets
      const transitionDeduction = (parseInt(transitionStrips) || 0) * 3; // 3' per transition
      
      const totalDeductions = doorDeduction + cabinetDeduction + transitionDeduction;
      const netPerimeter = Math.max(0, totalPerimeter - totalDeductions);
      const linearFtWithWaste = netPerimeter * (1 + wasteFactor);
      const piecesNeeded = Math.ceil(linearFtWithWaste / stockLen);
      
      const materialCost = linearFtWithWaste * (quarterProfile.pricePerFt || 0.55);
      
      // Build notes
      const notes = [];
      notes.push(`${quarterProfile.name} @ ${stockLen}' lengths`);
      if (quarterProfile.isShoe) notes.push('Shoe molding - flexible for uneven floors');
      if (totalDeductions > 0) {
        const deductItems = [];
        if (doorDeduction > 0) deductItems.push(`${doorOpenings} doors`);
        if (cabinetDeduction > 0) deductItems.push(`${cabinetDeduction} ft cabinets`);
        if (transitionDeduction > 0) deductItems.push(`${transitionStrips} transitions`);
        notes.push(`Deducted: ${deductItems.join(', ')} (${totalDeductions.toFixed(1)} ft)`);
      }

      return {
        grossPerimeter: totalPerimeter.toFixed(1),
        deductions: totalDeductions.toFixed(1),
        netPerimeter: netPerimeter.toFixed(1),
        linearFt: linearFtWithWaste.toFixed(1),
        pieces: piecesNeeded,
        wastePercent: Math.round(wasteFactor * 100),
        materialCost: materialCost.toFixed(2),
        note: notes.join('. ')
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
      const sortedCategories = Object.entries(CATEGORIES).sort((a, b) => a[1].order - b[1].order);

      content.innerHTML = `
        <div class="dashboard">
          <!-- Hero Section -->
          <div class="dashboard__hero">
            <div class="dashboard__hero-content">
              <h2 class="dashboard__hero-title">TillerPro</h2>
              <p class="dashboard__hero-subtitle">Professional tile calculators built by a licensed NJ contractor</p>
              <div class="dashboard__hero-actions">
                <button class="btn btn--primary btn--lg" onclick="window.TillerApp.Router.navigate('calculators')">
                  <span aria-hidden="true">🧮</span> Start Calculating
                </button>
                <button class="btn btn--secondary btn--lg" onclick="window.TillerApp.createNewProject()">
                  <span aria-hidden="true">📁</span> New Project
                </button>
              </div>
            </div>
            <div class="dashboard__hero-stats">
              <div class="hero-stat">
                <div class="hero-stat__value">${totalProjects}</div>
                <div class="hero-stat__label">Projects</div>
              </div>
              <div class="hero-stat">
                <div class="hero-stat__value">${CALCULATORS.filter(c => c.status === 'ready').length}</div>
                <div class="hero-stat__label">Tools</div>
              </div>
              <div class="hero-stat">
                <div class="hero-stat__value">${totalArea > 1000 ? (totalArea/1000).toFixed(1) + 'k' : totalArea}</div>
                <div class="hero-stat__label">Sq Ft</div>
              </div>
            </div>
          </div>

          <!-- Calculator Sections by Category -->
          ${sortedCategories.map(([catId, cat]) => {
            const catCalcs = CALCULATORS.filter(c => c.category === catId && c.status === 'ready');
            if (catCalcs.length === 0) return '';
            return `
              <section class="dashboard__section dashboard__section--category" id="dash-cat-${catId}">
                <div class="dashboard__section-header">
                  <div class="dashboard__section-header-info">
                    <h3 class="dashboard__section-title">
                      <span class="dashboard__section-icon" aria-hidden="true">${cat.icon}</span>
                      ${cat.name}
                    </h3>
                    <p class="dashboard__section-desc">${cat.longDesc || cat.desc}</p>
                  </div>
                  <span class="dashboard__section-badge">${catCalcs.length} tools</span>
                </div>
                <div class="calc-grid calc-grid--${catId}">
                  ${catCalcs.map(calc => `
                    <button class="calc-card" data-calc="${calc.id}" title="${calc.tooltip || calc.desc}">
                      <span class="calc-card__icon" aria-hidden="true">${calc.icon}</span>
                      <div class="calc-card__content">
                        <span class="calc-card__name">${calc.name}</span>
                        <span class="calc-card__desc">${calc.desc}</span>
                      </div>
                      <svg class="calc-card__arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>
                    </button>
                  `).join('')}
                </div>
              </section>
            `;
          }).join('')}

          <!-- Coming Soon -->
          ${CALCULATORS.filter(c => c.status === 'coming').length > 0 ? `
          <section class="dashboard__section dashboard__section--muted">
            <div class="dashboard__section-header">
              <h3 class="dashboard__section-title">Coming Soon</h3>
              <span class="dashboard__section-badge dashboard__section-badge--muted">${CALCULATORS.filter(c => c.status === 'coming').length} planned</span>
            </div>
            <div class="calc-grid calc-grid--coming">
              ${CALCULATORS.filter(c => c.status === 'coming').map(calc => `
                <div class="calc-card calc-card--coming" aria-disabled="true">
                  <span class="calc-card__icon" aria-hidden="true">${calc.icon}</span>
                  <div class="calc-card__content">
                    <span class="calc-card__name">${calc.name}</span>
                    <span class="calc-card__desc">${calc.desc}</span>
                  </div>
                  <span class="calc-card__badge">Coming Soon</span>
                </div>
              `).join('')}
            </div>
          </section>
          ` : ''}

          <!-- Recent Projects -->
          <section class="dashboard__section">
            <div class="dashboard__section-header">
              <h3 class="dashboard__section-title">
                <span class="dashboard__section-icon" aria-hidden="true">📋</span>
                Recent Projects
              </h3>
              ${recentProjects.length > 0 ? `<a href="#/projects" class="dashboard__section-action">View All →</a>` : ''}
            </div>
            ${recentProjects.length > 0 ? `
              <ul class="recent-list">
                ${recentProjects.map(p => `
                  <li class="recent-list__item" data-project-id="${p.id}">
                    <div class="recent-list__icon" aria-hidden="true">📋</div>
                    <div class="recent-list__content">
                      <div class="recent-list__name">${this.escapeHtml(p.name)}</div>
                      <div class="recent-list__meta">Updated ${this.formatDate(p.updatedAt)}</div>
                    </div>
                    <svg class="recent-list__arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>
                  </li>
                `).join('')}
              </ul>
            ` : `
              <div class="empty-state">
                <div class="empty-state__icon" aria-hidden="true">📋</div>
                <h4 class="empty-state__title">No projects yet</h4>
                <p class="empty-state__text">Start calculating to create your first project.</p>
              </div>
            `}
          </section>
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
      const sortedCategories = Object.entries(CATEGORIES).sort((a, b) => a[1].order - b[1].order);
      const filteredCalcs = CALCULATORS.filter(calc => {
        if (!AppState.searchQuery) return true;
        const q = AppState.searchQuery.toLowerCase();
        return calc.name.toLowerCase().includes(q) || 
               (calc.desc && calc.desc.toLowerCase().includes(q)) ||
               (calc.tooltip && calc.tooltip.toLowerCase().includes(q));
      });
      const activeCalc = AppState.activeCalculator;
      let activeData = CALCULATORS.find(c => c.id === activeCalc);
      if (!activeData) {
        const fallback = filteredCalcs[0] || CALCULATORS[0];
        AppState.activeCalculator = fallback.id;
        activeData = fallback;
      }

      content.innerHTML = `
        <!-- Sticky Section Navigation -->
        <div class="calc-sticky-nav" aria-label="Calculator navigation" role="navigation">
          <div class="calc-sticky-nav__wrap">
            <div class="calc-sticky-nav__links">
              ${sortedCategories.map(([catId, cat]) => `
                <button class="calc-sticky-nav__link" data-target="calc-cat-${catId}" title="${cat.longDesc || cat.desc}">
                  <span class="calc-sticky-nav__icon">${cat.icon}</span>
                  <span class="calc-sticky-nav__label">${cat.name}</span>
                </button>
              `).join('')}
            </div>
            <div class="calc-sticky-nav__search">
              <label class="sr-only" for="calc-search-input">Search calculators</label>
              <input id="calc-search-input" class="calc-search__input" type="search" placeholder="Search calculators..." value="${AppState.searchQuery || ''}" aria-describedby="search-hint">
              <span class="calc-search__icon" aria-hidden="true">🔍</span>
              <span id="search-hint" class="sr-only">Search by name, description, or function</span>
            </div>
          </div>
        </div>

        <div class="calculators-layout">
          <!-- Calculator Selector Panel -->
          <aside class="calc-selector" aria-label="Calculator list">
            <div class="calc-selector__header">
              <h2 class="calc-selector__title">Calculators</h2>
              <p class="calc-selector__subtitle">${CALCULATORS.filter(c => c.status === 'ready').length} tools • Grouped by workflow</p>
            </div>
            <nav class="calc-selector__list" role="tablist" aria-label="Calculator selection">
              ${sortedCategories.map(([catId, cat]) => {
                const catCalcs = filteredCalcs.filter(c => c.category === catId);
                if (catCalcs.length === 0) return '';
                return `
                  <div class="calc-selector__group" id="calc-cat-${catId}">
                    <button class="calc-selector__group-header" aria-expanded="true" data-collapse="${catId}">
                      <div class="calc-selector__group-info">
                        <span class="calc-selector__group-title">${cat.icon} ${cat.name}</span>
                        <span class="calc-selector__group-desc">${cat.desc}</span>
                      </div>
                      <span class="calc-selector__group-count">${catCalcs.length}</span>
                      <svg class="calc-selector__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
                    </button>
                    <div class="calc-selector__group-items" data-group="${catId}">
                      ${catCalcs.map(calc => `
                        <button class="calc-selector__item ${calc.id === activeCalc ? 'is-active' : ''} ${calc.status === 'coming' ? 'is-coming' : ''}" 
                                role="tab" 
                                aria-selected="${calc.id === activeCalc}"
                                ${calc.status === 'coming' ? 'disabled aria-disabled="true"' : ''}
                                data-calc="${calc.id}"
                                title="${calc.tooltip || calc.desc}">
                          <span class="calc-selector__icon">${calc.icon}</span>
                          <div class="calc-selector__info">
                            <span class="calc-selector__name">${calc.name}</span>
                            ${calc.status === 'coming' ? '<span class="calc-selector__badge">Soon</span>' : `<span class="calc-selector__desc">${calc.desc}</span>`}
                          </div>
                          ${calc.status === 'ready' ? `<svg class="calc-selector__arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>` : ''}
                        </button>
                      `).join('')}
                    </div>
                  </div>
                `;
              }).join('')}
            </nav>
          </aside>

          <!-- Active Calculator Panel -->
          <main class="calc-workspace" id="calc-workspace">
            <div class="calc-panel is-active" id="calc-panel-${activeCalc}" role="tabpanel" aria-labelledby="calc-panel-title">
              <div class="calc-panel__header">
                <div class="calc-panel__badge" aria-hidden="true">${activeData.icon}</div>
                <div class="calc-panel__header-content">
                  <h2 class="calc-panel__title" id="calc-panel-title">${activeData.name}</h2>
                  <p class="calc-panel__desc">${activeData.desc}</p>
                </div>
                ${activeData.tooltip ? `
                  <button class="calc-panel__help" type="button" aria-label="Show help" title="More information">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                      <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                  </button>
                ` : ''}
              </div>
              ${activeData.tooltip ? `
                <div class="calc-panel__tooltip" role="note" aria-label="Calculator guidance" hidden>
                  <div class="calc-panel__tooltip-content">
                    <strong>💡 Tip:</strong> ${activeData.tooltip}
                  </div>
                  <button class="calc-panel__tooltip-close" type="button" aria-label="Close tip">×</button>
                </div>
              ` : ''}
              <div class="calc-panel__body">
                ${this.renderCalculatorForm(activeCalc)}
              </div>
            </div>
          </main>
        </div>

        <!-- Mobile Calculator Dropdown (shown only on small screens) -->
        <div class="calc-mobile-select" aria-label="Mobile calculator selection">
          <label class="form-label" for="calc-mobile-dropdown">Select Calculator</label>
          <select class="form-select calc-mobile-dropdown" id="calc-mobile-dropdown" aria-label="Select calculator">
            ${sortedCategories.map(([catId, cat]) => {
              const catCalcs = filteredCalcs.filter(c => c.category === catId && c.status === 'ready');
              if (catCalcs.length === 0) return '';
              return `
                <optgroup label="${cat.icon} ${cat.name}">
                  ${catCalcs.map(calc => `
                    <option value="${calc.id}" ${calc.id === activeCalc ? 'selected' : ''}>${calc.name}</option>
                  `).join('')}
                </optgroup>
              `;
            }).join('')}
          </select>
        </div>
      `;

      // Selector item clicks
      content.querySelectorAll('.calc-selector__item').forEach(item => {
        item.addEventListener('click', () => {
          AppState.activeCalculator = item.dataset.calc;
          this.calculators();
          // Scroll workspace into view on mobile
          const workspace = document.getElementById('calc-workspace');
          if (workspace && window.innerWidth < 900) {
            workspace.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      });

      // Collapsible category groups
      content.querySelectorAll('.calc-selector__group-header[data-collapse]').forEach(header => {
        header.addEventListener('click', () => {
          const catId = header.dataset.collapse;
          const items = content.querySelector(`.calc-selector__group-items[data-group="${catId}"]`);
          const isExpanded = header.getAttribute('aria-expanded') === 'true';
          header.setAttribute('aria-expanded', !isExpanded);
          if (items) {
            items.classList.toggle('is-collapsed', isExpanded);
          }
        });
      });

      // Help tooltip toggle
      const helpBtn = content.querySelector('.calc-panel__help');
      const tooltip = content.querySelector('.calc-panel__tooltip');
      if (helpBtn && tooltip) {
        helpBtn.addEventListener('click', () => {
          tooltip.hidden = !tooltip.hidden;
        });
        const closeBtn = tooltip.querySelector('.calc-panel__tooltip-close');
        if (closeBtn) {
          closeBtn.addEventListener('click', () => {
            tooltip.hidden = true;
          });
        }
      }

      // Search input with debounce
      const searchInput = content.querySelector('#calc-search-input');
      if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
          clearTimeout(searchTimeout);
          searchTimeout = setTimeout(() => {
            AppState.searchQuery = e.target.value;
            // Keep active calculator visible; if filtered out, pick first available
            const visibleCalcs = CALCULATORS.filter(calc => {
              if (!AppState.searchQuery) return true;
              const q = AppState.searchQuery.toLowerCase();
              return calc.name.toLowerCase().includes(q) || 
                     (calc.desc && calc.desc.toLowerCase().includes(q)) ||
                     (calc.tooltip && calc.tooltip.toLowerCase().includes(q));
            });
            if (!visibleCalcs.some(c => c.id === AppState.activeCalculator) && visibleCalcs.length > 0) {
              AppState.activeCalculator = visibleCalcs[0].id;
            }
            this.calculators();
            // Refocus search input
            const newSearchInput = document.getElementById('calc-search-input');
            if (newSearchInput) {
              newSearchInput.focus();
              newSearchInput.setSelectionRange(newSearchInput.value.length, newSearchInput.value.length);
            }
          }, 200);
        });
      }

      // Sticky nav links
      content.querySelectorAll('.calc-sticky-nav__link').forEach(link => {
        link.addEventListener('click', () => {
          const targetId = link.dataset.target;
          const el = document.getElementById(targetId);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
        `,

        'bath-layout': `
          <div class="form-section">
            <div class="form-section__title">Room</div>
            <div class="form-grid form-grid--2col">
              <div class="form-field">
                <label class="form-label form-label--required">Room Length</label>
                <div class="input-group">
                  <input type="number" class="form-input" name="roomLengthFt" value="${inputs.roomLengthFt || ''}" min="4" step="0.5" placeholder="e.g. 10">
                  <span class="input-group__suffix">ft</span>
                </div>
              </div>
              <div class="form-field">
                <label class="form-label form-label--required">Room Width</label>
                <div class="input-group">
                  <input type="number" class="form-input" name="roomWidthFt" value="${inputs.roomWidthFt || ''}" min="4" step="0.5" placeholder="e.g. 5">
                  <span class="input-group__suffix">ft</span>
                </div>
              </div>
              <div class="form-field">
                <label class="form-label">Door Width</label>
                <div class="input-group">
                  <input type="number" class="form-input" name="doorWidthIn" value="${inputs.doorWidthIn ?? 32}" min="24" max="42" step="1">
                  <span class="input-group__suffix">in</span>
                </div>
                <p class="form-help">Deducted from primary wall</p>
              </div>
              <div class="form-field">
                <label class="form-label">Walkway Minimum</label>
                <div class="input-group">
                  <input type="number" class="form-input" name="walkwayMinIn" value="${inputs.walkwayMinIn ?? 30}" min="24" max="42" step="1">
                  <span class="input-group__suffix">in</span>
                </div>
                <p class="form-help">30–36" recommended clear path</p>
              </div>
            </div>
          </div>

          <div class="form-section">
            <div class="form-section__title">Fixtures</div>
            <div class="form-grid form-grid--2col">
              <div class="form-field">
                <label class="form-checkbox">
                  <input type="checkbox" name="includeTub" ${inputs.includeTub ?? true ? 'checked' : ''}>
                  <span>Include Tub</span>
                </label>
                <div class="form-grid form-grid--2col mt-sm">
                  <div class="form-field">
                    <label class="form-label">Tub Length</label>
                    <div class="input-group">
                      <input type="number" class="form-input" name="tubLengthIn" value="${inputs.tubLengthIn ?? 60}" min="54" max="72" step="1">
                      <span class="input-group__suffix">in</span>
                    </div>
                  </div>
                  <div class="form-field">
                    <label class="form-label">Tub Width</label>
                    <div class="input-group">
                      <input type="number" class="form-input" name="tubWidthIn" value="${inputs.tubWidthIn ?? 30}" min="28" max="36" step="1">
                      <span class="input-group__suffix">in</span>
                    </div>
                  </div>
                  <div class="form-field">
                    <label class="form-label">Front Clearance</label>
                    <div class="input-group">
                      <input type="number" class="form-input" name="tubFrontClearIn" value="${inputs.tubFrontClearIn ?? 30}" min="24" max="42" step="1">
                      <span class="input-group__suffix">in</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="form-field">
                <label class="form-checkbox">
                  <input type="checkbox" name="includeShower" ${inputs.includeShower ?? true ? 'checked' : ''}>
                  <span>Include Shower</span>
                </label>
                <div class="form-grid form-grid--2col mt-sm">
                  <div class="form-field">
                    <label class="form-label">Shower Width</label>
                    <div class="input-group">
                      <input type="number" class="form-input" name="showerWidthIn" value="${inputs.showerWidthIn ?? 36}" min="30" max="60" step="1">
                      <span class="input-group__suffix">in</span>
                    </div>
                  </div>
                  <div class="form-field">
                    <label class="form-label">Shower Depth</label>
                    <div class="input-group">
                      <input type="number" class="form-input" name="showerDepthIn" value="${inputs.showerDepthIn ?? 36}" min="30" max="60" step="1">
                      <span class="input-group__suffix">in</span>
                    </div>
                  </div>
                  <div class="form-field">
                    <label class="form-label">Front Clearance</label>
                    <div class="input-group">
                      <input type="number" class="form-input" name="showerFrontClearIn" value="${inputs.showerFrontClearIn ?? 30}" min="24" max="42" step="1">
                      <span class="input-group__suffix">in</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="form-field">
                <label class="form-checkbox">
                  <input type="checkbox" name="includeToilet" ${inputs.includeToilet ?? true ? 'checked' : ''}>
                  <span>Include Toilet</span>
                </label>
                <div class="form-grid form-grid--2col mt-sm">
                  <div class="form-field">
                    <label class="form-label">Side Clearance</label>
                    <div class="input-group">
                      <input type="number" class="form-input" name="toiletSideClearIn" value="${inputs.toiletSideClearIn ?? 15}" min="12" max="18" step="1">
                      <span class="input-group__suffix">in</span>
                    </div>
                  </div>
                  <div class="form-field">
                    <label class="form-label">Toilet Depth</label>
                    <div class="input-group">
                      <input type="number" class="form-input" name="toiletDepthIn" value="${inputs.toiletDepthIn ?? 28}" min="26" max="32" step="1">
                      <span class="input-group__suffix">in</span>
                    </div>
                  </div>
                  <div class="form-field">
                    <label class="form-label">Front Clearance</label>
                    <div class="input-group">
                      <input type="number" class="form-input" name="toiletFrontClearIn" value="${inputs.toiletFrontClearIn ?? 24}" min="21" max="36" step="1">
                      <span class="input-group__suffix">in</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="form-field">
                <label class="form-checkbox">
                  <input type="checkbox" name="includeVanity" ${inputs.includeVanity ?? true ? 'checked' : ''}>
                  <span>Include Vanity</span>
                </label>
                <div class="form-grid form-grid--2col mt-sm">
                  <div class="form-field">
                    <label class="form-label">Vanity Width</label>
                    <div class="input-group">
                      <input type="number" class="form-input" name="vanityWidthIn" value="${inputs.vanityWidthIn ?? 48}" min="24" max="72" step="1">
                      <span class="input-group__suffix">in</span>
                    </div>
                  </div>
                  <div class="form-field">
                    <label class="form-label">Vanity Depth</label>
                    <div class="input-group">
                      <input type="number" class="form-input" name="vanityDepthIn" value="${inputs.vanityDepthIn ?? 22}" min="18" max="26" step="1">
                      <span class="input-group__suffix">in</span>
                    </div>
                  </div>
                  <div class="form-field">
                    <label class="form-label">Front Clearance</label>
                    <div class="input-group">
                      <input type="number" class="form-input" name="vanityFrontClearIn" value="${inputs.vanityFrontClearIn ?? 30}" min="24" max="42" step="1">
                      <span class="input-group__suffix">in</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `,

        // ============================================
        // TRIM CALCULATOR FORMS
        // ============================================

        crown: `
          <div class="form-section">
            <div class="form-section__title">Room Dimensions</div>
            <p class="form-help mb-md">Enter perimeter directly OR room length × width</p>
            <div class="form-grid form-grid--3col">
              <div class="form-field">
                <label class="form-label">Ceiling Perimeter</label>
                <div class="input-group">
                  <input type="number" class="form-input" name="perimeter" value="${inputs.perimeter || ''}" min="1" step="0.5" placeholder="Direct entry">
                  <span class="input-group__suffix">ft</span>
                </div>
              </div>
              <div class="form-field">
                <label class="form-label">Room Length</label>
                <div class="input-group">
                  <input type="number" class="form-input" name="roomLength" value="${inputs.roomLength || ''}" min="1" step="0.5" placeholder="e.g. 15">
                  <span class="input-group__suffix">ft</span>
                </div>
              </div>
              <div class="form-field">
                <label class="form-label">Room Width</label>
                <div class="input-group">
                  <input type="number" class="form-input" name="roomWidth" value="${inputs.roomWidth || ''}" min="1" step="0.5" placeholder="e.g. 12">
                  <span class="input-group__suffix">ft</span>
                </div>
              </div>
            </div>
          </div>
          <div class="form-grid form-grid--2col">
            <div class="form-field">
              <label class="form-label">Crown Profile</label>
              <select class="form-select" name="profile">
                ${CROWN_PRESETS.map(c => `<option value="${c.id}" ${inputs.profile === c.id ? 'selected' : ''}>${c.name}${c.pricePerFt ? ' (~$' + c.pricePerFt + '/ft)' : ''}</option>`).join('')}
              </select>
            </div>
            <div class="form-field">
              <label class="form-label">Stock Length</label>
              <select class="form-select" name="stockLength">
                ${TRIM_LENGTHS.map(l => `<option value="${l.length}" ${inputs.stockLength == l.length ? 'selected' : ''}>${l.name}</option>`).join('')}
              </select>
            </div>
            <div class="form-field">
              <label class="form-label">Job Complexity</label>
              <select class="form-select" name="complexity">
                <option value="simple" ${inputs.complexity === 'simple' ? 'selected' : ''}>Simple – Few corners (+10% waste)</option>
                <option value="moderate" ${inputs.complexity === 'moderate' || !inputs.complexity ? 'selected' : ''}>Standard Room (+15% waste)</option>
                <option value="complex" ${inputs.complexity === 'complex' ? 'selected' : ''}>Complex – Many angles (+20% waste)</option>
                <option value="coffered" ${inputs.complexity === 'coffered' ? 'selected' : ''}>Coffered Ceiling (+25% waste)</option>
              </select>
            </div>
          </div>
          <div class="form-section">
            <div class="form-section__title">Corners</div>
            <div class="form-grid form-grid--2col">
              <div class="form-field">
                <label class="form-label">Inside Corners</label>
                <input type="number" class="form-input" name="insideCorners" value="${inputs.insideCorners || 4}" min="0" max="50">
                <p class="form-help">Standard room = 4</p>
              </div>
              <div class="form-field">
                <label class="form-label">Outside Corners</label>
                <input type="number" class="form-input" name="outsideCorners" value="${inputs.outsideCorners || 0}" min="0" max="50">
                <p class="form-help">Soffits, bump-outs, etc.</p>
              </div>
            </div>
          </div>
        `,

        baseboard: `
          <div class="form-section">
            <div class="form-section__title">Room Dimensions</div>
            <p class="form-help mb-md">Enter perimeter directly OR room length × width</p>
            <div class="form-grid form-grid--3col">
              <div class="form-field">
                <label class="form-label">Wall Perimeter</label>
                <div class="input-group">
                  <input type="number" class="form-input" name="perimeter" value="${inputs.perimeter || ''}" min="1" step="0.5" placeholder="Direct entry">
                  <span class="input-group__suffix">ft</span>
                </div>
              </div>
              <div class="form-field">
                <label class="form-label">Room Length</label>
                <div class="input-group">
                  <input type="number" class="form-input" name="roomLength" value="${inputs.roomLength || ''}" min="1" step="0.5" placeholder="e.g. 15">
                  <span class="input-group__suffix">ft</span>
                </div>
              </div>
              <div class="form-field">
                <label class="form-label">Room Width</label>
                <div class="input-group">
                  <input type="number" class="form-input" name="roomWidth" value="${inputs.roomWidth || ''}" min="1" step="0.5" placeholder="e.g. 12">
                  <span class="input-group__suffix">ft</span>
                </div>
              </div>
            </div>
          </div>
          <div class="form-grid form-grid--2col">
            <div class="form-field">
              <label class="form-label">Profile Type</label>
              <select class="form-select" name="profile">
                ${BASEBOARD_PRESETS.map(b => `<option value="${b.id}" ${inputs.profile === b.id ? 'selected' : ''}>${b.name}${b.pricePerFt ? ' (~$' + b.pricePerFt + '/ft)' : ''}</option>`).join('')}
              </select>
            </div>
            <div class="form-field">
              <label class="form-label">Stock Length</label>
              <select class="form-select" name="stockLength">
                ${TRIM_LENGTHS.map(l => `<option value="${l.length}" ${inputs.stockLength == l.length ? 'selected' : ''}>${l.name}</option>`).join('')}
              </select>
            </div>
            <div class="form-field">
              <label class="form-label">Job Complexity</label>
              <select class="form-select" name="complexity">
                <option value="simple" ${inputs.complexity === 'simple' ? 'selected' : ''}>Simple (+10% waste)</option>
                <option value="moderate" ${inputs.complexity === 'moderate' || !inputs.complexity ? 'selected' : ''}>Standard (+15% waste)</option>
                <option value="complex" ${inputs.complexity === 'complex' ? 'selected' : ''}>Complex (+20% waste)</option>
              </select>
            </div>
            <div class="form-field">
              <label class="form-label">Door Openings</label>
              <input type="number" class="form-input" name="doorOpenings" value="${inputs.doorOpenings || 0}" min="0" max="20">
              <p class="form-help">Deducts 3 ft per door</p>
            </div>
          </div>
          <div class="form-section">
            <div class="form-section__title">Wainscoting Panels (Optional)</div>
            <div class="form-field">
              <label class="form-checkbox">
                <input type="checkbox" name="includePanels" ${inputs.includePanels ? 'checked' : ''}>
                <span>Include panel framing calculation</span>
              </label>
            </div>
            <div class="form-grid form-grid--3col mt-md">
              <div class="form-field">
                <label class="form-label">Panel Height</label>
                <div class="input-group">
                  <input type="number" class="form-input" name="panelHeight" value="${inputs.panelHeight || 24}" min="6" max="48" ${!inputs.includePanels ? 'disabled' : ''}>
                  <span class="input-group__suffix">in</span>
                </div>
              </div>
              <div class="form-field">
                <label class="form-label">Panel Width</label>
                <div class="input-group">
                  <input type="number" class="form-input" name="panelWidth" value="${inputs.panelWidth || 18}" min="6" max="48" ${!inputs.includePanels ? 'disabled' : ''}>
                  <span class="input-group__suffix">in</span>
                </div>
              </div>
              <div class="form-field">
                <label class="form-label">Number of Panels</label>
                <input type="number" class="form-input" name="panelCount" value="${inputs.panelCount || 0}" min="0" max="100" ${!inputs.includePanels ? 'disabled' : ''}>
              </div>
            </div>
          </div>
        `,

        quarter: `
          <div class="form-section">
            <div class="form-section__title">Room Dimensions</div>
            <p class="form-help mb-md">Enter perimeter directly OR room length × width</p>
            <div class="form-grid form-grid--3col">
              <div class="form-field">
                <label class="form-label">Floor Perimeter</label>
                <div class="input-group">
                  <input type="number" class="form-input" name="perimeter" value="${inputs.perimeter || ''}" min="1" step="0.5" placeholder="Direct entry">
                  <span class="input-group__suffix">ft</span>
                </div>
              </div>
              <div class="form-field">
                <label class="form-label">Room Length</label>
                <div class="input-group">
                  <input type="number" class="form-input" name="roomLength" value="${inputs.roomLength || ''}" min="1" step="0.5" placeholder="e.g. 15">
                  <span class="input-group__suffix">ft</span>
                </div>
              </div>
              <div class="form-field">
                <label class="form-label">Room Width</label>
                <div class="input-group">
                  <input type="number" class="form-input" name="roomWidth" value="${inputs.roomWidth || ''}" min="1" step="0.5" placeholder="e.g. 12">
                  <span class="input-group__suffix">ft</span>
                </div>
              </div>
            </div>
          </div>
          <div class="form-grid form-grid--2col">
            <div class="form-field">
              <label class="form-label">Profile Type</label>
              <select class="form-select" name="profile">
                ${QUARTER_PRESETS.map(q => `<option value="${q.id}" ${inputs.profile === q.id ? 'selected' : ''}>${q.name}${q.pricePerFt ? ' (~$' + q.pricePerFt + '/ft)' : ''}</option>`).join('')}
              </select>
            </div>
            <div class="form-field">
              <label class="form-label">Stock Length</label>
              <select class="form-select" name="stockLength">
                <option value="8" ${inputs.stockLength == 8 || !inputs.stockLength ? 'selected' : ''}>8 ft (standard)</option>
                ${TRIM_LENGTHS.filter(l => l.length !== 8).map(l => `<option value="${l.length}" ${inputs.stockLength == l.length ? 'selected' : ''}>${l.name}</option>`).join('')}
              </select>
            </div>
            <div class="form-field">
              <label class="form-label">Job Complexity</label>
              <select class="form-select" name="complexity">
                <option value="simple" ${inputs.complexity === 'simple' ? 'selected' : ''}>Simple (+10% waste)</option>
                <option value="moderate" ${inputs.complexity === 'moderate' || !inputs.complexity ? 'selected' : ''}>Standard (+15% waste)</option>
                <option value="complex" ${inputs.complexity === 'complex' ? 'selected' : ''}>Complex (+20% waste)</option>
              </select>
            </div>
          </div>
          <div class="form-section">
            <div class="form-section__title">Deductions</div>
            <div class="form-grid form-grid--3col">
              <div class="form-field">
                <label class="form-label">Door Openings</label>
                <input type="number" class="form-input" name="doorOpenings" value="${inputs.doorOpenings || 0}" min="0" max="20">
                <p class="form-help">-3 ft each</p>
              </div>
              <div class="form-field">
                <label class="form-label">Cabinet Runs</label>
                <div class="input-group">
                  <input type="number" class="form-input" name="cabinetRuns" value="${inputs.cabinetRuns || 0}" min="0" step="0.5">
                  <span class="input-group__suffix">ft</span>
                </div>
                <p class="form-help">Base cabinets, etc.</p>
              </div>
              <div class="form-field">
                <label class="form-label">Transitions</label>
                <input type="number" class="form-input" name="transitionStrips" value="${inputs.transitionStrips || 0}" min="0" max="20">
                <p class="form-help">T-molds, thresholds</p>
              </div>
            </div>
          </div>
        `,

        // ═══════════════════════════════════════════════════════════════════
        // DEFLECTION CALCULATOR (Structural - L/360 or L/720)
        // ═══════════════════════════════════════════════════════════════════
        deflection: `
          <div class="form-section">
            <div class="form-section__title">Joist Specifications</div>
            <div class="form-grid form-grid--2col">
              <div class="form-field">
                <label class="form-label form-label--required">Joist Span</label>
                <div class="input-group">
                  <input type="number" class="form-input" name="spanFeet" value="${inputs.spanFeet || ''}" min="1" max="30" step="0.5" placeholder="e.g. 12">
                  <span class="input-group__suffix">ft</span>
                </div>
                <p class="form-help">Clear span between supports</p>
              </div>
              <div class="form-field">
                <label class="form-label form-label--required">Joist Spacing</label>
                <select class="form-select" name="joistSpacingInches">
                  <option value="12" ${inputs.joistSpacingInches == 12 ? 'selected' : ''}>12" O.C.</option>
                  <option value="16" ${inputs.joistSpacingInches == 16 || !inputs.joistSpacingInches ? 'selected' : ''}>16" O.C. (typical)</option>
                  <option value="19.2" ${inputs.joistSpacingInches == 19.2 ? 'selected' : ''}>19.2" O.C.</option>
                  <option value="24" ${inputs.joistSpacingInches == 24 ? 'selected' : ''}>24" O.C.</option>
                </select>
              </div>
            </div>
            <div class="form-grid form-grid--3col">
              <div class="form-field">
                <label class="form-label form-label--required">Joist Size</label>
                <select class="form-select" name="joistSize" onchange="
                  const sizes = {'2x6':[1.5,5.5],'2x8':[1.5,7.25],'2x10':[1.5,9.25],'2x12':[1.5,11.25],'lvl-9.5':[1.75,9.5],'lvl-11.875':[1.75,11.875],'i-joist-9.5':[1.75,9.5],'i-joist-11.875':[1.75,11.875]};
                  const s = sizes[this.value];
                  if(s){document.querySelector('[name=joistWidthInches]').value=s[0];document.querySelector('[name=joistDepthInches]').value=s[1];}
                ">
                  <option value="2x6" ${inputs.joistSize === '2x6' ? 'selected' : ''}>2×6 SPF</option>
                  <option value="2x8" ${inputs.joistSize === '2x8' ? 'selected' : ''}>2×8 SPF</option>
                  <option value="2x10" ${inputs.joistSize === '2x10' || !inputs.joistSize ? 'selected' : ''}>2×10 SPF</option>
                  <option value="2x12" ${inputs.joistSize === '2x12' ? 'selected' : ''}>2×12 SPF</option>
                  <option value="lvl-9.5" ${inputs.joistSize === 'lvl-9.5' ? 'selected' : ''}>LVL 1.75×9.5</option>
                  <option value="lvl-11.875" ${inputs.joistSize === 'lvl-11.875' ? 'selected' : ''}>LVL 1.75×11.875</option>
                  <option value="i-joist-9.5" ${inputs.joistSize === 'i-joist-9.5' ? 'selected' : ''}>I-Joist 9.5"</option>
                  <option value="i-joist-11.875" ${inputs.joistSize === 'i-joist-11.875' ? 'selected' : ''}>I-Joist 11.875"</option>
                </select>
              </div>
              <div class="form-field">
                <label class="form-label">Width</label>
                <div class="input-group">
                  <input type="number" class="form-input" name="joistWidthInches" value="${inputs.joistWidthInches || 1.5}" min="0.5" max="4" step="0.25" readonly>
                  <span class="input-group__suffix">in</span>
                </div>
              </div>
              <div class="form-field">
                <label class="form-label">Depth</label>
                <div class="input-group">
                  <input type="number" class="form-input" name="joistDepthInches" value="${inputs.joistDepthInches || 9.25}" min="3" max="16" step="0.125" readonly>
                  <span class="input-group__suffix">in</span>
                </div>
              </div>
            </div>
          </div>
          <div class="form-section">
            <div class="form-section__title">Load & Material</div>
            <div class="form-grid form-grid--3col">
              <div class="form-field">
                <label class="form-label">Live Load</label>
                <div class="input-group">
                  <input type="number" class="form-input" name="liveLoadPsft" value="${inputs.liveLoadPsft || 40}" min="10" max="100">
                  <span class="input-group__suffix">psf</span>
                </div>
                <p class="form-help">Residential: 40 psf</p>
              </div>
              <div class="form-field">
                <label class="form-label">Dead Load</label>
                <div class="input-group">
                  <input type="number" class="form-input" name="deadLoadPsft" value="${inputs.deadLoadPsft || 10}" min="5" max="50">
                  <span class="input-group__suffix">psf</span>
                </div>
                <p class="form-help">Tile: ~15 psf</p>
              </div>
              <div class="form-field">
                <label class="form-label">Modulus (E)</label>
                <select class="form-select" name="modulusPsi">
                  <option value="1400000" ${inputs.modulusPsi == 1400000 ? 'selected' : ''}>SPF #2 (1.4M psi)</option>
                  <option value="1600000" ${inputs.modulusPsi == 1600000 || !inputs.modulusPsi ? 'selected' : ''}>SPF #1 (1.6M psi)</option>
                  <option value="1900000" ${inputs.modulusPsi == 1900000 ? 'selected' : ''}>LVL (1.9M psi)</option>
                </select>
              </div>
            </div>
          </div>
        `,

        // ═══════════════════════════════════════════════════════════════════
        // HEATED FLOOR LOAD CALCULATOR (Electrical)
        // ═══════════════════════════════════════════════════════════════════
        'heated-floor': `
          <div class="form-section">
            <div class="form-section__title">Heated Area</div>
            <div class="form-grid form-grid--2col">
              <div class="form-field">
                <label class="form-label form-label--required">Area to Heat</label>
                <div class="input-group">
                  <input type="number" class="form-input" name="areaSqFt" value="${inputs.areaSqFt || ''}" min="1" max="500" step="1" placeholder="e.g. 60">
                  <span class="input-group__suffix">sq ft</span>
                </div>
                <p class="form-help">Heated area only (exclude under fixtures)</p>
              </div>
              <div class="form-field">
                <label class="form-label">Watts per Sq Ft</label>
                <select class="form-select" name="wattsPerSqFt">
                  <option value="10" ${inputs.wattsPerSqFt == 10 ? 'selected' : ''}>10 W/sf (supplemental)</option>
                  <option value="12" ${inputs.wattsPerSqFt == 12 || !inputs.wattsPerSqFt ? 'selected' : ''}>12 W/sf (standard)</option>
                  <option value="15" ${inputs.wattsPerSqFt == 15 ? 'selected' : ''}>15 W/sf (cold climate/primary)</option>
                </select>
                <p class="form-help">Per heating mat specs</p>
              </div>
            </div>
          </div>
          <div class="form-section">
            <div class="form-section__title">Electrical Configuration</div>
            <div class="form-grid form-grid--2col">
              <div class="form-field">
                <label class="form-label">Voltage</label>
                <select class="form-select" name="voltage">
                  <option value="120" ${inputs.voltage == 120 || !inputs.voltage ? 'selected' : ''}>120V (typical)</option>
                  <option value="240" ${inputs.voltage == 240 ? 'selected' : ''}>240V (larger areas)</option>
                </select>
              </div>
              <div class="form-field">
                <label class="form-label">Thermostat Limit</label>
                <div class="input-group">
                  <input type="number" class="form-input" name="thermostatMaxAmps" value="${inputs.thermostatMaxAmps || 15}" min="10" max="20">
                  <span class="input-group__suffix">A</span>
                </div>
                <p class="form-help">15A typical; above needs relay</p>
              </div>
            </div>
          </div>
        `,

        // ═══════════════════════════════════════════════════════════════════
        // THINSET MIXING CALCULATOR
        // ═══════════════════════════════════════════════════════════════════
        'thinset-mix': `
          <div class="form-section">
            <div class="form-section__title">Product Specs (from TDS)</div>
            <div class="form-grid form-grid--2col">
              <div class="form-field">
                <label class="form-label">Bag Weight</label>
                <select class="form-select" name="bagWeightLbs">
                  <option value="25" ${inputs.bagWeightLbs == 25 ? 'selected' : ''}>25 lb bag</option>
                  <option value="50" ${inputs.bagWeightLbs == 50 || !inputs.bagWeightLbs ? 'selected' : ''}>50 lb bag</option>
                </select>
              </div>
              <div class="form-field">
                <label class="form-label">Yield per Bag</label>
                <div class="input-group">
                  <input type="number" class="form-input" name="yieldCuFtPerBag" value="${inputs.yieldCuFtPerBag || 0.45}" min="0.1" max="1" step="0.01">
                  <span class="input-group__suffix">cu ft</span>
                </div>
                <p class="form-help">~0.45 cu ft typical for 50 lb</p>
              </div>
            </div>
            <div class="form-grid form-grid--2col">
              <div class="form-field">
                <label class="form-label">Water Range (Min)</label>
                <div class="input-group">
                  <input type="number" class="form-input" name="waterQuartsPerBagMin" value="${inputs.waterQuartsPerBagMin || 5}" min="1" max="10" step="0.25">
                  <span class="input-group__suffix">qt</span>
                </div>
              </div>
              <div class="form-field">
                <label class="form-label">Water Range (Max)</label>
                <div class="input-group">
                  <input type="number" class="form-input" name="waterQuartsPerBagMax" value="${inputs.waterQuartsPerBagMax || 6}" min="1" max="10" step="0.25">
                  <span class="input-group__suffix">qt</span>
                </div>
              </div>
            </div>
          </div>
          <div class="form-section">
            <div class="form-section__title">Batch Size (Optional)</div>
            <div class="form-grid form-grid--2col">
              <div class="form-field">
                <label class="form-label">Batch Weight</label>
                <div class="input-group">
                  <input type="number" class="form-input" name="batchWeightLbs" value="${inputs.batchWeightLbs || ''}" min="1" max="50" step="1" placeholder="Leave blank for full bag">
                  <span class="input-group__suffix">lbs</span>
                </div>
                <p class="form-help">For partial batches</p>
              </div>
              <div class="form-field">
                <label class="form-label">Pot Life</label>
                <div class="input-group">
                  <input type="number" class="form-input" name="potLifeMinutes" value="${inputs.potLifeMinutes || 120}" min="30" max="240">
                  <span class="input-group__suffix">min</span>
                </div>
                <p class="form-help">Working time (~2 hrs typical)</p>
              </div>
            </div>
          </div>
        `,

        // ═══════════════════════════════════════════════════════════════════
        // PRIMER / SLU PREP CALCULATOR
        // ═══════════════════════════════════════════════════════════════════
        primer: `
          <div class="form-section">
            <div class="form-section__title">Surface Details</div>
            <div class="form-grid form-grid--2col">
              <div class="form-field">
                <label class="form-label form-label--required">Area to Prime</label>
                <div class="input-group">
                  <input type="number" class="form-input" name="areaSqFt" value="${inputs.areaSqFt || ''}" min="1" max="5000" step="1" placeholder="e.g. 200">
                  <span class="input-group__suffix">sq ft</span>
                </div>
              </div>
              <div class="form-field">
                <label class="form-label">Surface Porosity</label>
                <select class="form-select" name="porosity">
                  <option value="porous" ${inputs.porosity === 'porous' || !inputs.porosity ? 'selected' : ''}>Porous (concrete, plywood)</option>
                  <option value="nonPorous" ${inputs.porosity === 'nonPorous' ? 'selected' : ''}>Non-Porous (VCT, sealed)</option>
                </select>
                <p class="form-help">Affects absorption rate</p>
              </div>
            </div>
            <div class="form-field">
              <label class="form-label">
                <input type="checkbox" name="doublePrime" ${inputs.doublePrime ? 'checked' : ''}>
                Double Prime (2 coats)
              </label>
              <p class="form-help">Recommended for very porous substrates</p>
            </div>
          </div>
        `,

        // ═══════════════════════════════════════════════════════════════════
        // DECK MUD CALCULATOR (Shower Pan Volume)
        // ═══════════════════════════════════════════════════════════════════
        'deck-mud': `
          <div class="form-section">
            <div class="form-section__title">Shower Pan Dimensions</div>
            <div class="form-grid form-grid--2col">
              <div class="form-field">
                <label class="form-label form-label--required">Pan Area</label>
                <div class="input-group">
                  <input type="number" class="form-input" name="areaSqFt" value="${inputs.areaSqFt || ''}" min="1" max="100" step="0.5" placeholder="e.g. 12">
                  <span class="input-group__suffix">sq ft</span>
                </div>
                <p class="form-help">L × W of shower floor</p>
              </div>
              <div class="form-field">
                <label class="form-label">Run to Drain</label>
                <div class="input-group">
                  <input type="number" class="form-input" name="runFeet" value="${inputs.runFeet || ''}" min="0.5" max="10" step="0.5" placeholder="Auto from area">
                  <span class="input-group__suffix">ft</span>
                </div>
                <p class="form-help">Distance from perimeter to drain</p>
              </div>
            </div>
          </div>
          <div class="form-section">
            <div class="form-section__title">Mud Bed Specs (TCNA B415/B421)</div>
            <div class="form-grid form-grid--3col">
              <div class="form-field">
                <label class="form-label">Min Thickness (at drain)</label>
                <div class="input-group">
                  <input type="number" class="form-input" name="minThicknessInches" value="${inputs.minThicknessInches || 1.25}" min="0.75" max="2" step="0.25">
                  <span class="input-group__suffix">in</span>
                </div>
                <p class="form-help">Min 1.25" per TCNA</p>
              </div>
              <div class="form-field">
                <label class="form-label">Slope</label>
                <div class="input-group">
                  <input type="number" class="form-input" name="slopeInchesPerFoot" value="${inputs.slopeInchesPerFoot || 0.25}" min="0.125" max="0.5" step="0.125">
                  <span class="input-group__suffix">in/ft</span>
                </div>
                <p class="form-help">¼"/ft standard</p>
              </div>
              <div class="form-field">
                <label class="form-label">Bag Yield</label>
                <div class="input-group">
                  <input type="number" class="form-input" name="bagYieldCuFt" value="${inputs.bagYieldCuFt || 0.5}" min="0.3" max="0.7" step="0.05">
                  <span class="input-group__suffix">cu ft</span>
                </div>
                <p class="form-help">Per 50 lb bag (~0.5)</p>
              </div>
            </div>
          </div>
        `,

        // ═══════════════════════════════════════════════════════════════════
        // SEALANT / CAULK CALCULATOR
        // ═══════════════════════════════════════════════════════════════════
        sealant: `
          <div class="form-section">
            <div class="form-section__title">Joint Details</div>
            <div class="form-grid form-grid--2col">
              <div class="form-field">
                <label class="form-label form-label--required">Linear Feet of Joints</label>
                <div class="input-group">
                  <input type="number" class="form-input" name="linearFeet" value="${inputs.linearFeet || ''}" min="1" max="500" step="1" placeholder="e.g. 50">
                  <span class="input-group__suffix">ft</span>
                </div>
                <p class="form-help">Total caulk line length</p>
              </div>
              <div class="form-field">
                <label class="form-label">Bead Diameter</label>
                <select class="form-select" name="beadDiameterInches">
                  <option value="0.125" ${inputs.beadDiameterInches == 0.125 ? 'selected' : ''}>⅛" (thin)</option>
                  <option value="0.1875" ${inputs.beadDiameterInches == 0.1875 ? 'selected' : ''}>3/16" (standard)</option>
                  <option value="0.25" ${inputs.beadDiameterInches == 0.25 || !inputs.beadDiameterInches ? 'selected' : ''}>¼" (typical)</option>
                  <option value="0.375" ${inputs.beadDiameterInches == 0.375 ? 'selected' : ''}>⅜" (wide joints)</option>
                </select>
                <p class="form-help">Joint width after tooling</p>
              </div>
            </div>
          </div>
          <div class="form-section">
            <div class="form-section__title">Tube Size</div>
            <div class="form-field" style="max-width: 300px;">
              <label class="form-label">Cartridge Size</label>
              <select class="form-select" name="tubeVolumeOz">
                <option value="10.1" ${inputs.tubeVolumeOz == 10.1 || !inputs.tubeVolumeOz ? 'selected' : ''}>10.1 oz (standard)</option>
                <option value="28" ${inputs.tubeVolumeOz == 28 ? 'selected' : ''}>28 oz (sausage)</option>
              </select>
            </div>
          </div>
        `,

        // ═══════════════════════════════════════════════════════════════════
        // SEALER COVERAGE CALCULATOR
        // ═══════════════════════════════════════════════════════════════════
        sealer: `
          <div class="form-section">
            <div class="form-section__title">Surface to Seal</div>
            <div class="form-grid form-grid--2col">
              <div class="form-field">
                <label class="form-label form-label--required">Area</label>
                <div class="input-group">
                  <input type="number" class="form-input" name="areaSqFt" value="${inputs.areaSqFt || ''}" min="1" max="5000" step="1" placeholder="e.g. 150">
                  <span class="input-group__suffix">sq ft</span>
                </div>
              </div>
              <div class="form-field">
                <label class="form-label">Surface Type</label>
                <select class="form-select" name="surface">
                  <option value="polished" ${inputs.surface === 'polished' ? 'selected' : ''}>Polished Porcelain / Dense Stone</option>
                  <option value="semi_porcelain" ${inputs.surface === 'semi_porcelain' ? 'selected' : ''}>Semi-Porous Porcelain</option>
                  <option value="natural_stone" ${inputs.surface === 'natural_stone' || !inputs.surface ? 'selected' : ''}>Natural Stone (honed/rough)</option>
                  <option value="concrete" ${inputs.surface === 'concrete' ? 'selected' : ''}>Concrete / Broom Finish</option>
                </select>
                <p class="form-help">Affects absorption/coverage</p>
              </div>
            </div>
            <div class="form-field" style="max-width: 200px;">
              <label class="form-label">Number of Coats</label>
              <select class="form-select" name="coats">
                <option value="1" ${inputs.coats == 1 ? 'selected' : ''}>1 coat</option>
                <option value="2" ${inputs.coats == 2 || !inputs.coats ? 'selected' : ''}>2 coats</option>
                <option value="3" ${inputs.coats == 3 ? 'selected' : ''}>3 coats</option>
              </select>
            </div>
          </div>
        `,

        // ═══════════════════════════════════════════════════════════════════
        // MOVEMENT JOINTS CALCULATOR (TCNA EJ171)
        // ═══════════════════════════════════════════════════════════════════
        movement: `
          <div class="form-section">
            <div class="form-section__title">Floor Dimensions</div>
            <div class="form-grid form-grid--2col">
              <div class="form-field">
                <label class="form-label form-label--required">Length</label>
                <div class="input-group">
                  <input type="number" class="form-input" name="lengthFt" value="${inputs.lengthFt || ''}" min="1" max="500" step="0.5" placeholder="e.g. 40">
                  <span class="input-group__suffix">ft</span>
                </div>
              </div>
              <div class="form-field">
                <label class="form-label form-label--required">Width</label>
                <div class="input-group">
                  <input type="number" class="form-input" name="widthFt" value="${inputs.widthFt || ''}" min="1" max="500" step="0.5" placeholder="e.g. 30">
                  <span class="input-group__suffix">ft</span>
                </div>
              </div>
            </div>
          </div>
          <div class="form-section">
            <div class="form-section__title">Exposure Conditions</div>
            <div class="form-grid form-grid--2col">
              <div class="form-field">
                <label class="form-label">Exposure Type</label>
                <select class="form-select" name="exposure">
                  <option value="interior" ${inputs.exposure === 'interior' || !inputs.exposure ? 'selected' : ''}>Interior (conditioned)</option>
                  <option value="exterior" ${inputs.exposure === 'exterior' ? 'selected' : ''}>Exterior</option>
                </select>
              </div>
              <div class="form-field">
                <label class="form-label">Temperature Swing</label>
                <div class="input-group">
                  <input type="number" class="form-input" name="tempSwingF" value="${inputs.tempSwingF || 30}" min="0" max="100">
                  <span class="input-group__suffix">°F</span>
                </div>
                <p class="form-help">Annual max-min difference</p>
              </div>
            </div>
            <div class="form-field">
              <label class="form-label">
                <input type="checkbox" name="isSunExposed" ${inputs.isSunExposed ? 'checked' : ''}>
                Sun-exposed or heated slab
              </label>
              <p class="form-help">Reduces joint spacing (8–12 ft grid)</p>
            </div>
          </div>
        `,

        // ═══════════════════════════════════════════════════════════════════
        // MOISTURE / RH CALCULATOR (ASTM F1869/F2170)
        // ═══════════════════════════════════════════════════════════════════
        moisture: `
          <div class="form-section">
            <div class="form-section__title">Moisture Test Results</div>
            <div class="form-grid form-grid--2col">
              <div class="form-field">
                <label class="form-label form-label--required">MVER (ASTM F1869)</label>
                <div class="input-group">
                  <input type="number" class="form-input" name="mverLbs" value="${inputs.mverLbs || ''}" min="0" max="30" step="0.5" placeholder="e.g. 3">
                  <span class="input-group__suffix">lbs/1000sf/24h</span>
                </div>
                <p class="form-help">Calcium chloride test result</p>
              </div>
              <div class="form-field">
                <label class="form-label form-label--required">RH % (ASTM F2170)</label>
                <div class="input-group">
                  <input type="number" class="form-input" name="rhPercent" value="${inputs.rhPercent || ''}" min="0" max="100" step="1" placeholder="e.g. 75">
                  <span class="input-group__suffix">%</span>
                </div>
                <p class="form-help">In-situ probe at 40% depth</p>
              </div>
            </div>
          </div>
          <div class="form-section">
            <div class="form-section__title">Product Limits (from TDS)</div>
            <div class="form-grid form-grid--2col">
              <div class="form-field">
                <label class="form-label">MVER Limit</label>
                <div class="input-group">
                  <input type="number" class="form-input" name="productLimitMver" value="${inputs.productLimitMver || 5}" min="1" max="10" step="0.5">
                  <span class="input-group__suffix">lbs</span>
                </div>
                <p class="form-help">Most SLU/adhesive: 3–5 lbs</p>
              </div>
              <div class="form-field">
                <label class="form-label">RH Limit</label>
                <div class="input-group">
                  <input type="number" class="form-input" name="productLimitRh" value="${inputs.productLimitRh || 75}" min="50" max="99" step="1">
                  <span class="input-group__suffix">%</span>
                </div>
                <p class="form-help">Typical adhesive limit: 75–80%</p>
              </div>
            </div>
          </div>
        `
      };

      // Check if calculator is implemented
      const calcData = CALCULATORS.find(c => c.id === calcId);
      const isComingSoon = calcData?.status === 'coming' || !forms[calcId];

      if (isComingSoon) {
        return `
          <div class="calc-coming-soon">
            <div class="calc-coming-soon__icon">🚧</div>
            <h3 class="calc-coming-soon__title">${calcData?.name || 'Calculator'} Coming Soon</h3>
            <p class="calc-coming-soon__text">This calculator is under development. We're working on TCNA-compliant formulas and will release it soon.</p>
            <div class="calc-coming-soon__actions">
              <button type="button" class="btn btn--secondary" onclick="window.TillerApp.Router.navigate('calculators'); window.TillerApp.State.activeCalculator = 'tile';">
                ← Try Tile Calculator
              </button>
            </div>
          </div>
        `;
      }

      return `
        <form class="calc-form" data-calc="${calcId}">
          ${forms[calcId]}
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
        'bath-layout': [
          { key: 'fitsLinear', label: 'Wall Fit' },
          { key: 'availableWallIn', label: 'Available Wall', suffix: ' in' },
          { key: 'requiredWallIn', label: 'Required Wall', suffix: ' in' },
          { key: 'walkwayPass', label: 'Walkway OK' },
          { key: 'walkwayWidthIn', label: 'Clear Path', suffix: ' in', highlight: true },
          { key: 'maxDepthClearIn', label: 'Deepest Fixture + Clear', suffix: ' in' }
        ],
        labor: [
          { key: 'hours', label: 'Est. Hours' },
          { key: 'days', label: 'Est. Days', highlight: true },
          { key: 'rate', label: 'Production Rate' }
        ],
        // Trim calculator results
        crown: [
          { key: 'perimeter', label: 'Ceiling Perimeter', suffix: ' ft' },
          { key: 'linearFt', label: 'Linear Ft (w/ waste)', suffix: ' ft' },
          { key: 'pieces', label: 'Pieces Needed', highlight: true },
          { key: 'insideCorners', label: 'Inside Corners' },
          { key: 'outsideCorners', label: 'Outside Corners' },
          { key: 'materialCost', label: 'Est. Material', prefix: '$' }
        ],
        baseboard: [
          { key: 'netPerimeter', label: 'Net Perimeter', suffix: ' ft' },
          { key: 'linearFt', label: 'Baseboard (w/ waste)', suffix: ' ft' },
          { key: 'panelFramingFt', label: 'Panel Framing', suffix: ' ft' },
          { key: 'totalPieces', label: 'Total Pieces', highlight: true },
          { key: 'materialCost', label: 'Est. Material', prefix: '$' }
        ],
        quarter: [
          { key: 'grossPerimeter', label: 'Gross Perimeter', suffix: ' ft' },
          { key: 'deductions', label: 'Deductions', suffix: ' ft' },
          { key: 'linearFt', label: 'Linear Ft (w/ waste)', suffix: ' ft' },
          { key: 'pieces', label: 'Pieces Needed', highlight: true },
          { key: 'materialCost', label: 'Est. Material', prefix: '$' }
        ],
        // Advanced calculators
        deflection: [
          { key: 'deflectionRatio', label: 'Deflection Ratio', prefix: 'L/' },
          { key: 'passesCeramic', label: 'Ceramic (L/360)', transform: v => v ? '✅ Pass' : '❌ Fail' },
          { key: 'passesStone', label: 'Stone (L/720)', transform: v => v ? '✅ Pass' : '❌ Fail', highlight: true },
          { key: 'deltaInches', label: 'Max Deflection', suffix: '"' }
        ],
        'heated-floor': [
          { key: 'totalWatts', label: 'Total Watts', suffix: ' W' },
          { key: 'amps', label: 'Amp Draw', suffix: ' A', highlight: true },
          { key: 'breakerAmps', label: 'Breaker Size', suffix: ' A' },
          { key: 'circuits', label: 'Circuits Needed' },
          { key: 'needsRelay', label: 'External Relay', transform: v => v ? '⚠️ Yes' : 'No' }
        ],
        'thinset-mix': [
          { key: 'batchWeightLbs', label: 'Batch Weight', suffix: ' lbs' },
          { key: 'waterQuartsRange', label: 'Water Range', transform: v => v ? `${v[0]}–${v[1]} qt` : '—', highlight: true },
          { key: 'estimatedYieldCuFt', label: 'Est. Yield', suffix: ' cu ft' },
          { key: 'potLifeMinutes', label: 'Pot Life', suffix: ' min' }
        ],
        primer: [
          { key: 'gallons', label: 'Primer Needed', suffix: ' gal', highlight: true },
          { key: 'coats', label: 'Coats' },
          { key: 'coverageUsed', label: 'Coverage Used', suffix: ' sf/gal' }
        ],
        'deck-mud': [
          { key: 'volumeCuFt', label: 'Volume', suffix: ' cu ft' },
          { key: 'bags', label: 'Bags (50 lb)', highlight: true },
          { key: 'avgThicknessInches', label: 'Avg Thickness', suffix: '"' }
        ],
        sealant: [
          { key: 'tubes', label: 'Tubes Needed', highlight: true },
          { key: 'totalVolumeCuIn', label: 'Total Volume', suffix: ' cu in' }
        ],
        sealer: [
          { key: 'gallons', label: 'Sealer Needed', suffix: ' gal', highlight: true },
          { key: 'coverageUsedSqFtPerGal', label: 'Coverage Rate', suffix: ' sf/gal' }
        ],
        movement: [
          { key: 'spacingFt', label: 'Joint Spacing', suffix: ' ft', highlight: true },
          { key: 'jointsLong', label: 'Joints (Length)' },
          { key: 'jointsShort', label: 'Joints (Width)' },
          { key: 'totalJoints', label: 'Total Joints' }
        ],
        moisture: [
          { key: 'mverPass', label: 'MVER Test', transform: v => v ? '✅ Pass' : '❌ Fail' },
          { key: 'rhPass', label: 'RH Test', transform: v => v ? '✅ Pass' : '❌ Fail' },
          { key: 'requiresMitigation', label: 'Needs Mitigation', transform: v => v ? '⚠️ Yes' : '✅ No', highlight: true }
        ]
      };

      const fields = resultFields[calcId] || [];

      // Helper to get display value with optional transform
      const getDisplayValue = (f) => {
        const rawValue = results[f.key];
        if (rawValue === undefined || rawValue === null) return '—';
        if (f.transform) return f.transform(rawValue);
        return `${f.prefix || ''}${rawValue}${f.suffix || ''}`;
      };

      return `
        <div class="calc-results">
          <h4 class="calc-results__title">Results</h4>
          <div class="calc-results__grid">
            ${fields.map(f => `
              <div class="calc-result">
                <div class="calc-result__label">${f.label}</div>
                <div class="calc-result__value ${f.highlight ? 'calc-result__value--highlight' : ''}">
                  ${getDisplayValue(f)}
                </div>
              </div>
            `).join('')}
          </div>
          ${results.note ? `<p class="calc-results__note">${results.note}</p>` : ''}
          ${results.warning ? `<p class="calc-results__warning">⚠️ ${results.warning}</p>` : ''}
          ${results.assumptions?.length ? `<details class="calc-results__assumptions"><summary>Assumptions</summary><ul>${results.assumptions.map(a => `<li>${a}</li>`).join('')}</ul></details>` : ''}
          ${results.warnings?.length ? `<div class="calc-results__warnings">${results.warnings.map(w => `<p class="calc-results__warning">⚠️ ${w}</p>`).join('')}</div>` : ''}
          ${results.notes?.length ? `<details class="calc-results__notes"><summary>Notes</summary><ul>${results.notes.map(n => `<li>${n}</li>`).join('')}</ul></details>` : ''}
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
              <p class="view-header__subtitle">Configure your TillerPro experience</p>
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
                <h3 class="settings-card__title">About TillerPro</h3>
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
    if (loading) {
      loading.style.display = 'none';
      loading.hidden = true;
    }
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
        console.error('TillerPro init error:', err);
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
    // PDF export methods (async for jsPDF loading)
    downloadProjectPDF: async (projectId) => {
      const project = Projects.get(projectId);
      if (!project) {
        Toast.show('Project not found', 'error');
        return;
      }
      if (!window.TillerPDF) {
        Toast.show('PDF module not loaded', 'error');
        return;
      }
      // Wait for library if needed
      const available = await window.TillerPDF.waitForLibrary();
      if (!available) {
        Toast.show('PDF library not loaded. Please refresh.', 'error');
        return;
      }
      Toast.show('Generating PDF...', 'info');
      const result = await window.TillerPDF.downloadProjectSummary(project);
      if (result.success) {
        Toast.show(`Downloaded: ${result.filename}`, 'success');
      } else {
        Toast.show(`PDF failed: ${result.error}`, 'error');
      }
    },
    downloadMaterialsPDF: async (projectId) => {
      const project = Projects.get(projectId);
      if (!project) {
        Toast.show('Project not found', 'error');
        return;
      }
      if (!window.TillerPDF) {
        Toast.show('PDF module not loaded', 'error');
        return;
      }
      const available = await window.TillerPDF.waitForLibrary();
      if (!available) {
        Toast.show('PDF library not loaded. Please refresh.', 'error');
        return;
      }
      Toast.show('Generating PDF...', 'info');
      const result = await window.TillerPDF.downloadMaterialList(project);
      if (result.success) {
        Toast.show(`Downloaded: ${result.filename}`, 'success');
      } else {
        Toast.show(`PDF failed: ${result.error}`, 'error');
      }
    },
    downloadCalcPDF: async (calcId) => {
      const inputs = AppState.calculatorInputs[calcId];
      const results = AppState.calculatorResults[calcId];
      if (!inputs || !results) {
        Toast.show('No calculation results to export', 'warning');
        return;
      }
      if (!window.TillerPDF) {
        Toast.show('PDF module not loaded', 'error');
        return;
      }
      const available = await window.TillerPDF.waitForLibrary();
      if (!available) {
        Toast.show('PDF library not loaded. Please refresh.', 'error');
        return;
      }
      const activeProject = AppState.activeProject ? Projects.get(AppState.activeProject) : null;
      const projectName = activeProject ? activeProject.name : 'Quick Estimate';
      Toast.show('Generating PDF...', 'info');
      const result = await window.TillerPDF.downloadQuickEstimate(calcId, inputs, results, projectName);
      if (result.success) {
        Toast.show(`Downloaded: ${result.filename}`, 'success');
      } else {
        Toast.show(`PDF failed: ${result.error}`, 'error');
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
