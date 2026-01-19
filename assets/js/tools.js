/**
 * Tillerstead Tools - Tile Project Calculators & Estimate Builder
 * Pure vanilla JS, no external dependencies
 * All calculations run client-side; data stored in localStorage
 */

(function() {
  'use strict';

  // ============================================
  // CONSTANTS & CONFIGURATION
  // ============================================

  const TILE_PRESETS = [
    { id: 'mosaic-1x1', name: '1×1 Mosaic (12×12 sheet)', width: 1, height: 1, isMosaic: true, sheetCoverage: 1 },
    { id: 'mosaic-2x2', name: '2×2 Mosaic (12×12 sheet)', width: 2, height: 2, isMosaic: true, sheetCoverage: 1 },
    { id: '3x6', name: '3×6 Subway', width: 3, height: 6 },
    { id: '4x4', name: '4×4', width: 4, height: 4 },
    { id: '4x12', name: '4×12', width: 4, height: 12 },
    { id: '6x6', name: '6×6', width: 6, height: 6 },
    { id: '6x24', name: '6×24 Plank', width: 6, height: 24, isPlank: true },
    { id: '8x48', name: '8×48 Plank', width: 8, height: 48, isPlank: true, isLargeFormat: true },
    { id: '12x12', name: '12×12', width: 12, height: 12 },
    { id: '12x24', name: '12×24', width: 12, height: 24 },
    { id: '12x48', name: '12×48 Plank', width: 12, height: 48, isPlank: true, isLargeFormat: true },
    { id: '24x24', name: '24×24', width: 24, height: 24, isLargeFormat: true },
    { id: '24x48', name: '24×48', width: 24, height: 48, isLargeFormat: true },
    { id: 'custom', name: 'Custom Size', width: 0, height: 0, isCustom: true }
  ];

  const LAYOUT_PRESETS = [
    { id: 'straight', name: 'Straight / Stacked', wasteFactor: 0.10, wasteRange: '10%' },
    { id: 'subway-33', name: '1/3 Offset (Recommended)', wasteFactor: 0.12, wasteRange: '12%' },
    { id: 'subway-50', name: '50% Offset (Brick)', wasteFactor: 0.15, wasteRange: '15%', lippageRisk: true },
    { id: 'brick', name: 'Running Bond', wasteFactor: 0.12, wasteRange: '12%' },
    { id: 'diagonal', name: 'Diagonal', wasteFactor: 0.18, wasteRange: '15–20%' },
    { id: 'herringbone', name: 'Herringbone', wasteFactor: 0.25, wasteRange: '20–30%' },
    { id: 'mosaic', name: 'Mosaic Sheet', wasteFactor: 0.12, wasteRange: '10–15%' }
  ];

  const JOINT_PRESETS = [
    { id: '1/16', name: '1/16"', size: 0.0625 },
    { id: '1/8', name: '1/8"', size: 0.125 },
    { id: '3/16', name: '3/16"', size: 0.1875 },
    { id: '1/4', name: '1/4"', size: 0.25 },
    { id: 'custom', name: 'Custom', size: 0, isCustom: true }
  ];

  const TROWEL_PRESETS = [
    { id: '3/16-v', name: '3/16" V-Notch', coverageMin: 95, coverageMax: 120 },
    { id: '1/4-sq', name: '1/4" × 1/4" Square', coverageMin: 70, coverageMax: 95 },
    { id: '1/4x3/8-sq', name: '1/4" × 3/8" Square', coverageMin: 50, coverageMax: 70 },
    { id: '1/2-sq', name: '1/2" × 1/2" Square', coverageMin: 35, coverageMax: 50 }
  ];

  const GROUT_COVERAGE = {
    cement: 25, // approx lbs per 100 sq ft per 1/8" joint (baseline)
    epoxy: 20   // epoxy tends to have lower coverage
  };

  const LEVELER_COVERAGE = 0.45; // cu ft per 50 lb bag at 1" depth (conservative)

  const STORAGE_KEY = 'tillerstead_tools_project';

  // Surface type configurations
  const SURFACE_CONFIGS = {
    floor: {
      label: 'Floor',
      calcMode: 'dimensions', // uses L×W
      defaultHeight: null,
      icon: '▢'
    },
    'full-walls': {
      label: 'Full Walls',
      calcMode: 'perimeter', // perimeter × height
      defaultHeight: 8,
      icon: '▤'
    },
    'shower-walls': {
      label: 'Shower Walls',
      calcMode: 'manual', // user enters or uses preset
      defaultArea: 72, // 3 walls × 3ft × 8ft
      icon: '▥'
    },
    'tub-surround': {
      label: 'Tub Surround',
      calcMode: 'manual',
      defaultArea: 60, // 3 walls × 5ft × 4ft
      icon: '▧'
    },
    backsplash: {
      label: 'Backsplash',
      calcMode: 'manual',
      defaultArea: 6, // ~4 linear ft × 18"
      icon: '▨'
    }
  };

  // Validation error types
  const VALIDATION_TYPES = {
    ERROR: 'error',
    WARNING: 'warning'
  };

  // ============================================
  // STATE MANAGEMENT
  // ============================================

  let state = {
    project: {
      name: '',
      clientName: '',
      address: '',
      county: '',
      phone: '',
      email: '',
      notes: ''
    },
    rooms: [],
    defaults: {
      tilePreset: '',
      customTileWidth: 0,
      customTileHeight: 0,
      tileThickness: 8,
      layout: '',
      wasteFactor: 12,
      jointSize: '',
      extraAtticStock: false
    },
    systems: {
      underlayment: 'none',
      waterproofing: 'none',
      edgeTrim: 'none',
      movementJoints: false,
      demoTile: false,
      demoUnderlayment: false,
      subfloorRepair: false,
      disposal: false
    },
    mode: 'pro', // 'pro' or 'homeowner'
    trowelOverride: {
      selected: null,
      reason: ''
    },
    assumptions: [],
    nudges: [],
    validationErrors: [],
    validationWarnings: []
  };

  let roomIdCounter = 0;

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  /**
   * Generate unique ID
   */
  function generateId() {
    return 'room_' + (++roomIdCounter) + '_' + Date.now();
  }

  /**
   * Convert feet + inches to decimal feet
   */
  function toDecimalFeet(feet, inches) {
    const ft = parseFloat(feet) || 0;
    const inc = parseFloat(inches) || 0;
    return ft + (inc / 12);
  }

  /**
   * Format decimal feet as ft' in"
   */
  function formatFeetInches(decimalFeet) {
    const feet = Math.floor(decimalFeet);
    const inches = Math.round((decimalFeet - feet) * 12);
    if (inches === 12) {
      return `${feet + 1}' 0"`;
    }
    return `${feet}' ${inches}"`;
  }

  /**
   * Calculate area in square feet
   */
  function calculateArea(lengthFt, widthFt) {
    return lengthFt * widthFt;
  }

  /**
   * Round up to nearest integer
   */
  function roundUp(value) {
    return Math.ceil(value);
  }

  /**
   * Format number with commas
   */
  function formatNumber(num, decimals = 0) {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  /**
   * Debounce function
   */
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Escape HTML for safe insertion
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Get tile preset by ID or create custom
   */
  function getTilePreset(presetId, customWidth, customHeight) {
    if (presetId === 'custom') {
      return {
        id: 'custom',
        name: `${customWidth}×${customHeight} Custom`,
        width: parseFloat(customWidth) || 12,
        height: parseFloat(customHeight) || 12,
        isCustom: true,
        isLargeFormat: Math.max(customWidth, customHeight) >= 24,
        isPlank: customHeight >= 24 || customWidth >= 24
      };
    }
    return TILE_PRESETS.find(t => t.id === presetId) || TILE_PRESETS[8]; // default to 12x12
  }

  /**
   * Get layout preset by ID
   */
  function getLayoutPreset(layoutId) {
    return LAYOUT_PRESETS.find(l => l.id === layoutId) || LAYOUT_PRESETS[0];
  }

  /**
   * Get joint preset by ID
   */
  function getJointPreset(jointId) {
    return JOINT_PRESETS.find(j => j.id === jointId) || JOINT_PRESETS[1]; // default to 1/8"
  }

  /**
   * Get trowel preset by ID
   */
  function getTrowelPreset(trowelId) {
    return TROWEL_PRESETS.find(t => t.id === trowelId) || TROWEL_PRESETS[1];
  }

  // ============================================
  // CALCULATION FUNCTIONS
  // ============================================

  /**
   * Calculate tile quantity needed
   */
  function calculateTileQuantity(areaSqFt, tile, wastePercent) {
    if (!areaSqFt || areaSqFt <= 0) return { tiles: 0, boxes: 0, areaWithWaste: 0 };

    const wasteFactor = 1 + (wastePercent / 100);
    const areaWithWaste = areaSqFt * wasteFactor;

    let tilesNeeded;
    if (tile.isMosaic && tile.sheetCoverage) {
      // Mosaic sheets - use sheet coverage
      tilesNeeded = roundUp(areaWithWaste / tile.sheetCoverage);
    } else {
      // Individual tiles - calculate sq ft per tile
      const tileSqFt = (tile.width * tile.height) / 144; // convert sq inches to sq ft
      tilesNeeded = roundUp(areaWithWaste / tileSqFt);
    }

    return {
      tiles: tilesNeeded,
      areaWithWaste: areaWithWaste
    };
  }

  /**
   * Calculate boxes needed
   */
  function calculateBoxes(tilesNeeded, tilesPerBox, sqftPerBox, tile, areaWithWaste, addAtticStock) {
    let boxes;

    if (tilesPerBox && tilesPerBox > 0) {
      boxes = roundUp(tilesNeeded / tilesPerBox);
    } else if (sqftPerBox && sqftPerBox > 0) {
      boxes = roundUp(areaWithWaste / sqftPerBox);
    } else {
      // Can't calculate without box info
      return { boxes: 0, note: 'Enter tiles per box or sq ft per box' };
    }

    if (addAtticStock) {
      // Add 5% or 1 box minimum for attic stock
      const atticBoxes = Math.max(1, roundUp(boxes * 0.05));
      boxes += atticBoxes;
    }

    return { boxes, note: '' };
  }

  /**
   * Auto-recommend trowel notch based on tile size and substrate
   */
  function getRecommendedTrowel(tile, substrate) {
    const smallestSide = Math.min(tile.width, tile.height);
    const largestSide = Math.max(tile.width, tile.height);

    let result = {
      trowelId: '1/4-sq',
      backButter: false,
      note: ''
    };

    // Mosaic or very small tile
    if (tile.isMosaic || smallestSide <= 2) {
      result.trowelId = '3/16-v';
      result.note = 'Small tile/mosaic: 3/16" V-notch is a common starting point for thin mosaics.';
    }
    // Up to 12x12
    else if (largestSide <= 12) {
      result.trowelId = '1/4-sq';
      result.note = '1/4" × 1/4" square notch is typical for tiles up to 12×12.';
    }
    // Up to 12x24
    else if (largestSide <= 24 && smallestSide <= 12) {
      result.trowelId = '1/4x3/8-sq';
      result.backButter = substrate !== 'smooth';
      result.note = '1/4" × 3/8" square notch with back-buttering helps achieve full coverage.';
    }
    // Large format (any side >= 24")
    else {
      result.trowelId = '1/2-sq';
      result.backButter = true;
      result.note = 'Large-format tile: 1/2" × 1/2" square with back-buttering recommended for maximum coverage.';
    }

    // Substrate adjustment - increase notch size if substrate needs work
    if (substrate === 'needs-flattening') {
      const currentIndex = TROWEL_PRESETS.findIndex(t => t.id === result.trowelId);
      if (currentIndex < TROWEL_PRESETS.length - 1) {
        result.trowelId = TROWEL_PRESETS[currentIndex + 1].id;
      }
      result.note += ' Substrate may need flattening—larger notch helps but doesn\'t replace proper substrate prep.';
    }

    return result;
  }

  /**
   * Calculate mortar bags needed
   */
  function calculateMortarBags(areaSqFt, trowelId, backButter) {
    const trowel = getTrowelPreset(trowelId);
    if (!trowel) return { min: 0, max: 0, note: 'Select trowel size' };

    // Calculate bag range
    const bagsMin = roundUp(areaSqFt / trowel.coverageMax);
    const bagsMax = roundUp(areaSqFt / trowel.coverageMin);

    // Add 20-30% for back-buttering
    let adjustedMin = bagsMin;
    let adjustedMax = bagsMax;
    if (backButter) {
      adjustedMin = roundUp(bagsMin * 1.2);
      adjustedMax = roundUp(bagsMax * 1.3);
    }

    return {
      min: adjustedMin,
      max: adjustedMax,
      coverage: `${trowel.coverageMin}–${trowel.coverageMax} sq ft/bag`,
      note: backButter ? 'Includes ~25% extra for back-buttering' : ''
    };
  }

  /**
   * Get recommended joint size based on tile
   */
  function getRecommendedJoint(tile) {
    const largestSide = Math.max(tile.width, tile.height);

    if (tile.isMosaic) {
      return {
        jointId: '1/8',
        note: 'Mosaic tiles: 1/16"–1/8" joints are typical.'
      };
    }

    if (tile.isLargeFormat || largestSide >= 24) {
      return {
        jointId: '1/8',
        note: 'Large-format/rectified tile: 1/8" minimum joint is recommended.'
      };
    }

    return {
      jointId: '1/8',
      note: '1/8" joint is a common starting point. Adjust based on tile variation and manufacturer guidance.'
    };
  }

  /**
   * Calculate grout quantity
   */
  function calculateGrout(areaSqFt, tileLength, tileWidth, tileThicknessMm, jointSizeIn, groutType, isMosaic) {
    if (!areaSqFt || !tileLength || !tileWidth) {
      return { quantity: 0, unit: 'lbs', note: 'Enter all values to calculate' };
    }

    // Grout formula: (L + W) / (L × W) × T × J × Area × K
    // Where L/W = tile dimensions in inches
    // T = tile thickness in inches
    // J = joint width in inches
    // K = constant (~1.86 for lbs per cu in of grout)
    
    const tileThicknessIn = tileThicknessMm / 25.4;
    const tileSqIn = tileLength * tileWidth;
    const jointPerimeter = (tileLength + tileWidth) * 2;
    
    // Joint volume per tile (cu inches)
    const jointVolumePerTile = (jointPerimeter / 2) * jointSizeIn * tileThicknessIn;
    
    // Tiles per sq ft
    const tilesPerSqFt = 144 / tileSqIn;
    
    // Total joint volume (cu ft)
    const totalJointVolume = (jointVolumePerTile * tilesPerSqFt * areaSqFt) / 1728;
    
    // Grout weight (approx 100 lbs per cu ft for cement grout)
    let groutLbs = totalJointVolume * (groutType === 'epoxy' ? 110 : 100);
    
    // Mosaic multiplier (more joints = more grout)
    if (isMosaic) {
      groutLbs *= 1.5;
    }
    
    // Add 10% for waste
    groutLbs *= 1.1;

    return {
      quantity: roundUp(groutLbs),
      unit: 'lbs',
      volume: (totalJointVolume * 1.1).toFixed(2),
      note: isMosaic ? 'Mosaic tiles use significantly more grout due to additional joints.' : ''
    };
  }

  /**
   * Calculate self-leveler needed
   */
  function calculateLeveler(areaSqFt, avgDepthIn, maxDepthIn) {
    if (!areaSqFt || !avgDepthIn) {
      return { bags: 0, volume: 0, note: 'Enter area and depth' };
    }

    // Volume in cubic feet
    const volumeCuFt = areaSqFt * (avgDepthIn / 12);
    
    // Bags needed (conservative estimate)
    const bags = roundUp(volumeCuFt / LEVELER_COVERAGE);
    
    // If max depth provided, calculate range
    let bagsMax = bags;
    if (maxDepthIn && maxDepthIn > avgDepthIn) {
      const maxVolume = areaSqFt * (maxDepthIn / 12);
      bagsMax = roundUp(maxVolume / LEVELER_COVERAGE);
    }

    return {
      bags: bags,
      bagsMax: bagsMax,
      volume: volumeCuFt.toFixed(2),
      note: maxDepthIn ? `Range: ${bags}–${bagsMax} bags depending on actual depth variation` : ''
    };
  }

  // ============================================
  // VALIDATION
  // ============================================

  /**
   * Validate project data
   * Returns { errors: [], warnings: [], missingFields: [] }
   */
  function validateProject() {
    const errors = [];
    const warnings = [];
    const missingFields = [];

    // Project name required
    if (!state.project.name || !state.project.name.trim()) {
      errors.push({
        field: 'project-name',
        selector: '#project-name',
        message: 'Project name is required',
        section: 'Project Information',
        type: VALIDATION_TYPES.ERROR
      });
      missingFields.push({
        label: 'Project Name',
        selector: '#project-name',
        message: 'Enter a project name'
      });
    }

    // At least one room required
    if (state.rooms.length === 0) {
      errors.push({
        field: 'add-room-btn',
        selector: '#add-room-btn',
        message: 'Add at least one room',
        section: 'Rooms',
        type: VALIDATION_TYPES.ERROR
      });
      missingFields.push({
        label: 'Rooms',
        selector: '#add-room-btn',
        message: 'Click "Add Room" to add your first room'
      });
    }

    // Validate each room
    state.rooms.forEach((room, index) => {
      const roomSelector = `[data-room-id="${room.id}"]`;
      
      if (!room.name || !room.name.trim()) {
        errors.push({
          field: `room-${room.id}-name`,
          selector: `${roomSelector} .room-name-input`,
          message: `Room ${index + 1}: Name is required`,
          section: 'Rooms',
          type: VALIDATION_TYPES.ERROR
        });
        missingFields.push({
          label: `Room ${index + 1} Name`,
          selector: `${roomSelector} .room-name-input`,
          message: 'Enter a room name'
        });
      }

      // Check if any surface is selected
      const hasSurface = Object.values(room.surfaces || {}).some(s => s.selected);
      if (!hasSurface) {
        errors.push({
          field: `room-${room.id}-surfaces`,
          selector: `${roomSelector} .surfaces-fieldset`,
          message: `${room.name || 'Room ' + (index + 1)}: Select at least one surface to tile`,
          section: 'Rooms',
          type: VALIDATION_TYPES.ERROR
        });
      }

      // If floor selected, need dimensions
      if (room.surfaces?.floor?.selected) {
        const length = toDecimalFeet(room.lengthFt, room.lengthIn);
        const width = toDecimalFeet(room.widthFt, room.widthIn);
        if (length <= 0 || width <= 0) {
          errors.push({
            field: `room-${room.id}-dimensions`,
            selector: `${roomSelector} .room-length-ft`,
            message: `${room.name || 'Room ' + (index + 1)}: Enter room dimensions for floor area`,
            section: 'Rooms',
            type: VALIDATION_TYPES.ERROR
          });
          missingFields.push({
            label: `${room.name || 'Room ' + (index + 1)} Dimensions`,
            selector: `${roomSelector} .room-length-ft`,
            message: 'Enter length and width'
          });
        }
      }

      // Check for manual area overrides that are zero/invalid
      Object.entries(room.surfaces || {}).forEach(([surfaceId, surface]) => {
        if (surface.selected && surface.areaMode === 'manual' && (!surface.manualArea || surface.manualArea <= 0)) {
          errors.push({
            field: `room-${room.id}-surface-${surfaceId}`,
            selector: `${roomSelector} [data-surface-id="${surfaceId}"] .surface-manual-area`,
            message: `${room.name || 'Room ' + (index + 1)}: ${SURFACE_CONFIGS[surfaceId]?.label || surfaceId} manual area must be greater than 0`,
            section: 'Rooms',
            type: VALIDATION_TYPES.ERROR
          });
        }
      });

      // Warning: Room is locked but has no area
      if (room.locked) {
        const totalArea = Object.values(room.surfaces || {}).reduce((sum, s) => sum + (s.selected ? s.area : 0), 0);
        if (totalArea === 0) {
          warnings.push({
            field: `room-${room.id}-locked`,
            selector: roomSelector,
            message: `${room.name || 'Room ' + (index + 1)}: Measurements locked but no area calculated`,
            section: 'Rooms',
            type: VALIDATION_TYPES.WARNING
          });
        }
      }
    });

    // Warning: No tile size selected
    if (!state.defaults.tilePreset) {
      warnings.push({
        field: 'default-tile-size',
        selector: '#default-tile-size',
        message: 'Consider selecting a tile size for more accurate calculations',
        section: 'Tile & Layout',
        type: VALIDATION_TYPES.WARNING
      });
    }

    // Warning: No layout selected
    if (!state.defaults.layout) {
      warnings.push({
        field: 'default-layout',
        selector: '#default-layout',
        message: 'Consider selecting a layout pattern for waste factor guidance',
        section: 'Tile & Layout',
        type: VALIDATION_TYPES.WARNING
      });
    }

    state.validationErrors = errors;
    state.validationWarnings = warnings;

    return { errors, warnings, missingFields };
  }

  /**
   * Show validation errors in UI
   */
  function showValidationErrors(validationResult) {
    const { errors, warnings, missingFields } = validationResult;
    const panel = document.getElementById('needs-attention');
    const list = document.getElementById('needs-attention-list');
    const badge = document.getElementById('needs-attention-badge');

    // Update badge count
    const totalIssues = errors.length + warnings.length;
    if (badge) {
      badge.textContent = totalIssues;
      badge.hidden = totalIssues === 0;
    }

    // Clear existing visual states
    document.querySelectorAll('.is-invalid, .is-warning').forEach(el => {
      el.classList.remove('is-invalid', 'is-warning');
    });

    if (totalIssues === 0) {
      panel.hidden = true;
      list.innerHTML = '';
      return;
    }

    // Apply visual states to fields
    errors.forEach(err => {
      if (err.selector) {
        const el = document.querySelector(err.selector);
        if (el) el.classList.add('is-invalid');
      }
    });
    warnings.forEach(warn => {
      if (warn.selector) {
        const el = document.querySelector(warn.selector);
        if (el) el.classList.add('is-warning');
      }
    });

    // Render list items (errors first, then warnings)
    let html = '';
    
    if (errors.length > 0) {
      html += `<li class="needs-attention__header needs-attention__header--error" role="status" aria-live="assertive">
        <strong>⚠️ ${errors.length} Required</strong>
      </li>`;
      errors.forEach(err => {
        html += `
          <li class="needs-attention__item needs-attention__item--error">
            <span class="needs-attention__icon">❌</span>
            <span class="needs-attention__message">${escapeHtml(err.message)}</span>
            ${err.selector ? `<button type="button" class="needs-attention__jump btn btn--ghost btn--xs" 
              data-selector="${escapeHtml(err.selector)}" aria-label="Go to ${escapeHtml(err.message)}">
              Go →
            </button>` : ''}
          </li>
        `;
      });
    }

    if (warnings.length > 0) {
      html += `<li class="needs-attention__header needs-attention__header--warning" role="status" aria-live="polite">
        <strong>💡 ${warnings.length} Suggestions</strong>
      </li>`;
      warnings.forEach(warn => {
        html += `
          <li class="needs-attention__item needs-attention__item--warning">
            <span class="needs-attention__icon">⚡</span>
            <span class="needs-attention__message">${escapeHtml(warn.message)}</span>
            ${warn.selector ? `<button type="button" class="needs-attention__jump btn btn--ghost btn--xs" 
              data-selector="${escapeHtml(warn.selector)}" aria-label="Go to ${escapeHtml(warn.message)}">
              Go →
            </button>` : ''}
          </li>
        `;
      });
    }

    list.innerHTML = html;
    panel.hidden = false;

    // Add jump-to-field handlers (event delegation)
    list.addEventListener('click', handleNeedsAttentionClick);
  }

  /**
   * Handle clicks on needs attention list (delegated)
   */
  function handleNeedsAttentionClick(e) {
    const btn = e.target.closest('.needs-attention__jump');
    if (!btn) return;

    const selector = btn.dataset.selector;
    if (!selector) return;

    const field = document.querySelector(selector);
    if (!field) return;

    // Scroll to field
    field.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Focus input inside if available
    const input = field.matches('input, select, textarea') ? field : field.querySelector('input, select, textarea');
    if (input && input.focus) {
      setTimeout(() => input.focus(), 300);
    }

    // Visual highlight
    field.classList.add('highlight-field');
    setTimeout(() => field.classList.remove('highlight-field'), 2000);
  }

  /**
   * Update validation display (called on changes)
   */
  function updateValidation() {
    const result = validateProject();
    showValidationErrors(result);
    return result;
  }

  /**
   * Update room audit trail display
   */
  function updateRoomAuditDisplay(card, room) {
    const auditDetails = card.querySelector('.room-audit');
    if (!auditDetails || !room.auditTrail || room.auditTrail.length === 0) return;

    const auditList = auditDetails.querySelector('.room-audit__list');
    if (!auditList) return;

    auditList.innerHTML = room.auditTrail.map(entry => {
      const date = new Date(entry.timestamp);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
      return `
        <li class="room-audit__entry">
          <span class="room-audit__time">${escapeHtml(dateStr)}</span>
          <span class="room-audit__action room-audit__action--${entry.action}">${escapeHtml(entry.action)}</span>
          ${entry.reason ? `<span class="room-audit__reason">"${escapeHtml(entry.reason)}"</span>` : ''}
          <span class="room-audit__dims">${formatNumber(entry.dimensions.length, 1)}×${formatNumber(entry.dimensions.width, 1)} ft</span>
        </li>
      `;
    }).join('');
  }

  // ============================================
  // NUDGES (Assist Messages)
  // ============================================

  /**
   * Check for layout/tile combination issues
   */
  function checkLayoutNudges() {
    const nudges = [];
    const tile = getTilePreset(
      state.defaults.tilePreset,
      state.defaults.customTileWidth,
      state.defaults.customTileHeight
    );
    const layout = getLayoutPreset(state.defaults.layout);
    const largestSide = Math.max(tile.width, tile.height);

    // 50% offset with long tiles
    if (layout.id === 'subway-50' && largestSide >= 15) {
      nudges.push({
        type: 'warning',
        message: 'Consider 1/3 offset instead of 50% offset for tiles 15"+ to reduce lippage risk. Many installers prefer 1/3 offset for plank tiles.'
      });
    }

    // Herringbone with non-rectangular tiles
    if (layout.id === 'herringbone' && tile.width === tile.height) {
      nudges.push({
        type: 'info',
        message: 'Herringbone pattern is typically used with rectangular tiles (planks). Square tiles would create a checkerboard effect.'
      });
    }

    return nudges;
  }

  /**
   * Show layout nudge in UI
   */
  function showLayoutNudge() {
    const nudgeEl = document.getElementById('layout-nudge');
    const nudgeText = document.getElementById('layout-nudge-text');
    const nudges = checkLayoutNudges();

    if (nudges.length > 0) {
      nudgeText.textContent = nudges[0].message;
      nudgeEl.hidden = false;
      nudgeEl.className = `nudge nudge--${nudges[0].type}`;
    } else {
      nudgeEl.hidden = true;
    }
  }

  /**
   * Show joint recommendation
   */
  function showJointRecommendation() {
    const tile = getTilePreset(
      state.defaults.tilePreset,
      state.defaults.customTileWidth,
      state.defaults.customTileHeight
    );
    const recEl = document.getElementById('joint-recommendation');
    const recText = document.getElementById('joint-recommendation-text');

    if (tile && !tile.isCustom) {
      const rec = getRecommendedJoint(tile);
      recText.textContent = rec.note;
      recEl.hidden = false;
    } else {
      recEl.hidden = true;
    }
  }

  // ============================================
  // UI RENDERING
  // ============================================

  /**
   * Populate select dropdowns with presets
   */
  function populatePresets() {
    // Tile size selects
    const tileSelects = document.querySelectorAll('#default-tile-size, #calc-tile-size, #mortar-tile-size');
    tileSelects.forEach(select => {
      TILE_PRESETS.forEach(tile => {
        const opt = document.createElement('option');
        opt.value = tile.id;
        opt.textContent = tile.name;
        select.appendChild(opt);
      });
    });

    // Layout selects
    const layoutSelects = document.querySelectorAll('#default-layout, #calc-layout');
    layoutSelects.forEach(select => {
      LAYOUT_PRESETS.forEach(layout => {
        const opt = document.createElement('option');
        opt.value = layout.id;
        opt.textContent = `${layout.name} (${layout.wasteRange} waste)`;
        select.appendChild(opt);
      });
    });

    // Joint size selects
    const jointSelects = document.querySelectorAll('#default-joint, #grout-joint-width');
    jointSelects.forEach(select => {
      JOINT_PRESETS.forEach(joint => {
        const opt = document.createElement('option');
        opt.value = joint.id;
        opt.textContent = joint.name;
        select.appendChild(opt);
      });
    });

    // Trowel selects
    const trowelSelects = document.querySelectorAll('#mortar-trowel');
    trowelSelects.forEach(select => {
      const autoOpt = document.createElement('option');
      autoOpt.value = 'auto';
      autoOpt.textContent = 'Auto-recommend...';
      select.appendChild(autoOpt);

      TROWEL_PRESETS.forEach(trowel => {
        const opt = document.createElement('option');
        opt.value = trowel.id;
        opt.textContent = `${trowel.name} (${trowel.coverageMin}–${trowel.coverageMax} sq ft/bag)`;
        select.appendChild(opt);
      });
    });
  }

  /**
   * Create a new room card
   */
  function createRoomCard(roomData) {
    const template = document.getElementById('room-template');
    const clone = template.content.cloneNode(true);
    const card = clone.querySelector('.room-card');

    const roomId = roomData?.id || generateId();
    card.dataset.roomId = roomId;

    // Set values if editing
    if (roomData) {
      card.querySelector('.room-name-input').value = roomData.name || '';
      card.querySelector('.room-length-ft').value = roomData.lengthFt || '';
      card.querySelector('.room-length-in').value = roomData.lengthIn || '';
      card.querySelector('.room-width-ft').value = roomData.widthFt || '';
      card.querySelector('.room-width-in').value = roomData.widthIn || '';
      card.querySelector('.room-height-ft').value = roomData.heightFt || '';
      card.querySelector('.room-height-in').value = roomData.heightIn || '';

      // Restore surface selections
      if (roomData.surfaces) {
        Object.keys(roomData.surfaces).forEach(surfaceId => {
          if (roomData.surfaces[surfaceId].selected) {
            const checkbox = card.querySelector(`[data-surface="${surfaceId}"]`);
            if (checkbox) checkbox.checked = true;
          }
        });
      }

      // Restore lock state
      if (roomData.locked) {
        card.querySelector('.room-lock-checkbox').checked = true;
      }
    }

    // Add to list
    document.getElementById('rooms-list').appendChild(card);

    // Add to state if new
    if (!roomData) {
      state.rooms.push({
        id: roomId,
        name: '',
        lengthFt: 0,
        lengthIn: 0,
        widthFt: 0,
        widthIn: 0,
        heightFt: 0,
        heightIn: 0,
        surfaces: {
          floor: { selected: false, area: 0 },
          'full-walls': { selected: false, area: 0 },
          'shower-walls': { selected: false, area: 0 },
          'tub-surround': { selected: false, area: 0 },
          backsplash: { selected: false, area: 0 }
        },
        locked: false,
        lockReason: ''
      });
      saveToStorage();
    }

    updateRoomAreaDisplay(roomId);
    return card;
  }

  /**
   * Remove a room card
   */
  function removeRoom(roomId) {
    const card = document.querySelector(`[data-room-id="${roomId}"]`);
    if (card) {
      card.remove();
      state.rooms = state.rooms.filter(r => r.id !== roomId);
      updateAreaSummary();
      saveToStorage();
    }
  }

  /**
   * Update room data in state
   */
  function updateRoomData(roomId, field, value) {
    const room = state.rooms.find(r => r.id === roomId);
    if (!room) return;

    // Check if measurement is locked
    if (room.locked && ['lengthFt', 'lengthIn', 'widthFt', 'widthIn', 'heightFt', 'heightIn'].includes(field)) {
      // Show lock reason input
      const card = document.querySelector(`[data-room-id="${roomId}"]`);
      const reasonDiv = card.querySelector('.room-lock-reason');
      reasonDiv.hidden = false;
      reasonDiv.querySelector('input').focus();
      return;
    }

    room[field] = value;
    updateRoomAreaDisplay(roomId);
    updateAreaSummary();
    saveToStorage();
  }

  /**
   * Update room surface selection
   */
  function updateRoomSurface(roomId, surfaceId, selected) {
    const room = state.rooms.find(r => r.id === roomId);
    if (!room) return;

    if (!room.surfaces) room.surfaces = {};
    if (!room.surfaces[surfaceId]) {
      room.surfaces[surfaceId] = { 
        selected: false, 
        area: 0,
        areaMode: 'auto', // 'auto' or 'manual'
        manualArea: 0,
        useGlobalDefaults: true,
        overrides: {},
        deductions: [],
        grossArea: 0,
        netArea: 0
      };
    }

    room.surfaces[surfaceId].selected = selected;

    // Calculate area based on surface type
    const length = toDecimalFeet(room.lengthFt, room.lengthIn);
    const width = toDecimalFeet(room.widthFt, room.widthIn);
    const height = toDecimalFeet(room.heightFt, room.heightIn) || 8; // default 8ft ceiling

    const config = SURFACE_CONFIGS[surfaceId];
    let grossArea = 0;

    if (config.calcMode === 'dimensions') {
      grossArea = calculateArea(length, width);
    } else if (config.calcMode === 'perimeter') {
      grossArea = (length * 2 + width * 2) * height;
    } else if (config.calcMode === 'manual') {
      grossArea = config.defaultArea;
    }

    room.surfaces[surfaceId].grossArea = grossArea;
    room.surfaces[surfaceId].area = grossArea; // Will be updated by deductions

    // Render surface details card if selected
    const card = document.querySelector(`[data-room-id="${roomId}"]`);
    if (card) {
      renderSurfaceDetails(card, room);
    }

    updateAreaSummary();
    saveToStorage();
  }

  /**
   * Render surface detail cards for a room
   */
  function renderSurfaceDetails(card, room) {
    const container = card.querySelector('[data-surface-details]');
    if (!container) return;

    const selectedSurfaces = Object.entries(room.surfaces || {})
      .filter(([, s]) => s.selected);

    if (selectedSurfaces.length === 0) {
      container.hidden = true;
      container.innerHTML = '';
      return;
    }

    container.hidden = false;
    let html = '<div class="surface-details__grid">';

    selectedSurfaces.forEach(([surfaceId, surface]) => {
      const config = SURFACE_CONFIGS[surfaceId];
      const isManual = surface.areaMode === 'manual';
      const deductionsTotal = (surface.deductions || []).reduce((sum, d) => sum + (d.area || 0), 0);
      const netArea = (isManual ? surface.manualArea : surface.grossArea) - deductionsTotal;

      html += `
        <div class="surface-detail-card" data-surface-id="${surfaceId}">
          <div class="surface-detail-card__header">
            <span class="surface-detail-card__icon">${config.icon}</span>
            <span class="surface-detail-card__title">${config.label}</span>
          </div>
          <div class="surface-detail-card__body">
            <!-- Area Mode Toggle -->
            <div class="form-field">
              <label class="form-label form-label--sm">Area Mode</label>
              <select class="form-select form-select--sm surface-area-mode" data-surface="${surfaceId}">
                <option value="auto" ${!isManual ? 'selected' : ''}>Auto from room dims</option>
                <option value="manual" ${isManual ? 'selected' : ''}>Manual area override</option>
              </select>
            </div>
            
            <!-- Manual Area Input (shown when manual) -->
            <div class="form-field surface-manual-area-field" ${!isManual ? 'hidden' : ''}>
              <label class="form-label form-label--sm">Area (sq ft)</label>
              <input type="number" class="form-input form-input--sm surface-manual-area" 
                data-surface="${surfaceId}" value="${surface.manualArea || ''}" 
                placeholder="Enter area" min="0" step="0.1">
            </div>
            
            <!-- Gross Area Display -->
            <div class="surface-area-display">
              <span class="surface-area-label">Gross:</span>
              <span class="surface-area-value">${formatNumber(isManual ? surface.manualArea : surface.grossArea, 1)} sf</span>
            </div>
            
            <!-- Deductions -->
            <div class="surface-deductions">
              <div class="surface-deductions__header">
                <span class="form-label form-label--sm">Deductions</span>
                <button type="button" class="btn btn--ghost btn--xs add-deduction-btn" data-surface="${surfaceId}">
                  + Add
                </button>
              </div>
              <div class="surface-deductions__list" data-deductions="${surfaceId}">
                ${renderDeductions(surface.deductions || [], surfaceId)}
              </div>
              ${deductionsTotal > 0 ? `
              <div class="surface-deductions__total">
                Total deductions: <strong>${formatNumber(deductionsTotal, 1)} sf</strong>
              </div>
              ` : ''}
            </div>
            
            <!-- Net Area -->
            <div class="surface-net-area">
              <span>Net Area:</span>
              <strong class="surface-net-value">${formatNumber(Math.max(0, netArea), 1)} sf</strong>
            </div>
            
            <!-- Use Global Defaults Toggle -->
            <label class="form-checkbox form-checkbox--sm">
              <input type="checkbox" class="surface-use-defaults" data-surface="${surfaceId}"
                ${surface.useGlobalDefaults !== false ? 'checked' : ''}>
              <span>Use global tile defaults</span>
            </label>
            
            <!-- Per-Surface Overrides (shown when not using global) -->
            <div class="surface-overrides" ${surface.useGlobalDefaults !== false ? 'hidden' : ''}>
              <div class="form-grid form-grid--2col">
                <div class="form-field">
                  <label class="form-label form-label--sm">Tile Size Override</label>
                  <select class="form-select form-select--sm surface-tile-override" data-surface="${surfaceId}">
                    <option value="">Same as global</option>
                    ${TILE_PRESETS.map(t => `<option value="${t.id}" ${surface.overrides?.tilePreset === t.id ? 'selected' : ''}>${t.name}</option>`).join('')}
                  </select>
                </div>
                <div class="form-field">
                  <label class="form-label form-label--sm">Waste Override</label>
                  <div class="form-inline">
                    <input type="number" class="form-input form-input--sm surface-waste-override" 
                      data-surface="${surfaceId}" value="${surface.overrides?.waste || ''}" 
                      placeholder="—" min="5" max="40">
                    <span class="form-inline__suffix">%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    });

    html += '</div>';
    container.innerHTML = html;

    // Calculate room total
    recalculateRoomSurfaces(room);
  }

  /**
   * Render deduction rows
   */
  function renderDeductions(deductions, surfaceId) {
    if (!deductions || deductions.length === 0) {
      return '<p class="surface-deductions__empty">No deductions</p>';
    }

    return deductions.map((d, i) => `
      <div class="deduction-row" data-index="${i}">
        <input type="text" class="form-input form-input--sm deduction-label" 
          value="${escapeHtml(d.label || '')}" placeholder="Label (door, window...)">
        <div class="form-inline">
          <input type="number" class="form-input form-input--sm deduction-width" 
            value="${d.width || ''}" placeholder="W" min="0" step="0.5">
          <span class="form-inline__sep">×</span>
          <input type="number" class="form-input form-input--sm deduction-height" 
            value="${d.height || ''}" placeholder="H" min="0" step="0.5">
          <span class="form-inline__suffix">in</span>
        </div>
        <span class="deduction-area">${d.area ? formatNumber(d.area, 1) + ' sf' : '—'}</span>
        <button type="button" class="btn btn--ghost btn--xs remove-deduction-btn" 
          data-surface="${surfaceId}" data-index="${i}" aria-label="Remove deduction">×</button>
      </div>
    `).join('');
  }

  /**
   * Recalculate all surface areas for a room
   */
  function recalculateRoomSurfaces(room) {
    let roomTotal = 0;

    Object.entries(room.surfaces || {}).forEach(([surfaceId, surface]) => {
      if (!surface.selected) return;

      const isManual = surface.areaMode === 'manual';
      const grossArea = isManual ? (surface.manualArea || 0) : (surface.grossArea || 0);
      const deductionsTotal = (surface.deductions || []).reduce((sum, d) => sum + (d.area || 0), 0);
      const netArea = Math.max(0, grossArea - deductionsTotal);

      surface.netArea = netArea;
      surface.area = netArea;
      roomTotal += netArea;
    });

    return roomTotal;
  }

  /**
   * Update room area display
   */
  function updateRoomAreaDisplay(roomId) {
    const room = state.rooms.find(r => r.id === roomId);
    if (!room) return;

    const card = document.querySelector(`[data-room-id="${roomId}"]`);
    if (!card) return;

    const length = toDecimalFeet(room.lengthFt, room.lengthIn);
    const width = toDecimalFeet(room.widthFt, room.widthIn);
    const area = calculateArea(length, width);

    const display = card.querySelector('.room-area-value');
    display.textContent = `${formatNumber(area, 1)} sq ft`;

    // Update floor surface area if selected
    if (room.surfaces?.floor?.selected) {
      room.surfaces.floor.area = area;
    }
  }

  /**
   * Update total area summary
   */
  function updateAreaSummary() {
    const grid = document.getElementById('area-summary-grid');
    const totalEl = document.getElementById('total-area');

    if (state.rooms.length === 0) {
      grid.innerHTML = '<p class="area-summary__empty">Add rooms and select surfaces to see area calculations.</p>';
      totalEl.textContent = '0';
      return;
    }

    let html = '';
    let totalArea = 0;

    state.rooms.forEach(room => {
      if (!room.surfaces) return;

      Object.keys(room.surfaces).forEach(surfaceId => {
        const surface = room.surfaces[surfaceId];
        if (surface.selected && surface.area > 0) {
          totalArea += surface.area;
          const surfaceName = surfaceId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
          html += `
            <div class="area-summary__row">
              <span class="area-summary__room">${escapeHtml(room.name || 'Unnamed Room')}</span>
              <span class="area-summary__surface">${surfaceName}</span>
              <span class="area-summary__area">${formatNumber(surface.area, 1)} sq ft</span>
            </div>
          `;
        }
      });
    });

    grid.innerHTML = html || '<p class="area-summary__empty">Select surfaces in rooms to see area calculations.</p>';
    totalEl.textContent = formatNumber(totalArea, 1);
  }

  // ============================================
  // SCOPE & OUTPUT GENERATION
  // ============================================

  /**
   * Generate scope summary text
   */
  function generateScopeSummary(options = {}) {
    const {
      includeScope = true,
      includeMeasurements = true,
      includeTile = true,
      includeMortar = true,
      includeAssumptions = true,
      includeDisclaimers = true
    } = options;

    let output = '';
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Header
    output += `TILE PROJECT SPECIFICATION\n`;
    output += `${'='.repeat(50)}\n\n`;

    if (state.project.name) {
      output += `Project: ${state.project.name}\n`;
    }
    if (state.project.clientName) {
      output += `Client: ${state.project.clientName}\n`;
    }
    if (state.project.address) {
      output += `Address: ${state.project.address}\n`;
    }
    if (state.project.county) {
      output += `Location: ${state.project.county}\n`;
    }
    output += `Date: ${date}\n`;
    output += `Prepared by: Tillerstead LLC\n\n`;

    // Scope Summary
    if (includeScope) {
      output += `SCOPE OF WORK\n`;
      output += `${'-'.repeat(30)}\n`;

      state.rooms.forEach(room => {
        if (!room.name) return;
        output += `\n${room.name}:\n`;

        Object.keys(room.surfaces || {}).forEach(surfaceId => {
          const surface = room.surfaces[surfaceId];
          if (surface.selected) {
            const surfaceName = surfaceId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
            output += `  • ${surfaceName}: ${formatNumber(surface.area, 1)} sq ft\n`;
          }
        });
      });

      output += '\n';
    }

    // Measurements Table
    if (includeMeasurements) {
      output += `MEASUREMENTS\n`;
      output += `${'-'.repeat(30)}\n`;

      let totalArea = 0;
      state.rooms.forEach(room => {
        if (!room.surfaces) return;
        Object.values(room.surfaces).forEach(s => {
          if (s.selected) totalArea += s.area;
        });
      });

      output += `Total tile area: ${formatNumber(totalArea, 1)} sq ft\n\n`;
    }

    // Tile Specifications
    if (includeTile) {
      output += `TILE & LAYOUT\n`;
      output += `${'-'.repeat(30)}\n`;

      const tile = getTilePreset(
        state.defaults.tilePreset,
        state.defaults.customTileWidth,
        state.defaults.customTileHeight
      );
      const layout = getLayoutPreset(state.defaults.layout);

      output += `Tile size: ${tile.name}\n`;
      output += `Layout: ${layout.name}\n`;
      output += `Waste factor: ${state.defaults.wasteFactor}%\n`;

      const joint = getJointPreset(state.defaults.jointSize);
      output += `Grout joint: ${joint.name}\n`;

      if (state.defaults.extraAtticStock) {
        output += `Attic stock: Included (+5% or 1 box)\n`;
      }

      output += '\n';
    }

    // System Selections
    if (includeScope) {
      output += `SYSTEM SELECTIONS\n`;
      output += `${'-'.repeat(30)}\n`;

      const systems = state.systems;
      if (systems.underlayment !== 'none') {
        const underlaymentLabels = {
          'cement-board': 'Cement Board (CBU)',
          'uncoupling': 'Uncoupling Membrane',
          'mud-bed': 'Mud Bed',
          'self-leveler': 'Self-Leveling Compound'
        };
        output += `Underlayment: ${underlaymentLabels[systems.underlayment] || systems.underlayment}\n`;
      }

      if (systems.waterproofing !== 'none') {
        const wpLabels = {
          'liquid': 'Liquid-Applied Membrane',
          'sheet': 'Sheet Membrane'
        };
        output += `Waterproofing: ${wpLabels[systems.waterproofing] || systems.waterproofing}\n`;
      }

      if (systems.edgeTrim !== 'none') {
        output += `Edge trim: ${systems.edgeTrim}\n`;
      }

      if (systems.movementJoints) {
        output += `Movement joints: Required (perimeter & field as needed)\n`;
      }

      // Demo scope
      const demoItems = [];
      if (systems.demoTile) demoItems.push('Remove existing tile');
      if (systems.demoUnderlayment) demoItems.push('Remove underlayment');
      if (systems.subfloorRepair) demoItems.push('Subfloor repair (as needed)');
      if (systems.disposal) demoItems.push('Debris disposal');

      if (demoItems.length > 0) {
        output += `\nDemo scope:\n`;
        demoItems.forEach(item => {
          output += `  • ${item}\n`;
        });
      }

      output += '\n';
    }

    // Notes
    if (state.project.notes) {
      output += `NOTES\n`;
      output += `${'-'.repeat(30)}\n`;
      output += `${state.project.notes}\n\n`;
    }

    // Assumptions
    if (includeAssumptions && state.assumptions.length > 0) {
      output += `ASSUMPTIONS\n`;
      output += `${'-'.repeat(30)}\n`;
      state.assumptions.forEach(a => {
        output += `• ${a}\n`;
      });
      output += '\n';
    }

    // Disclaimers
    if (includeDisclaimers) {
      output += `IMPORTANT NOTES\n`;
      output += `${'-'.repeat(30)}\n`;
      output += `• Material quantities are estimates. Verify with supplier and manufacturer specifications.\n`;
      output += `• Trowel notch recommendations are starting points. Confirm coverage in the field by lifting tiles during installation.\n`;
      output += `• Final grout joint size depends on tile variation and warpage. Verify with manufacturer guidance.\n`;
      output += `• Prices, if any, are estimates and subject to change upon final measurement.\n`;
      output += `• This specification does not constitute a contract or warranty.\n\n`;
    }

    output += `${'='.repeat(50)}\n`;
    output += `Generated by Tillerstead Tools • tillerstead.com\n`;

    return output;
  }

  /**
   * Generate HTML output for doc download
   */
  function generateHtmlOutput(options) {
    const text = generateScopeSummary(options);
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Tile Project Specification - ${escapeHtml(state.project.name || 'Untitled')}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      color: #333;
    }
    pre {
      white-space: pre-wrap;
      word-wrap: break-word;
      font-family: inherit;
    }
  </style>
</head>
<body>
  <pre>${escapeHtml(text)}</pre>
</body>
</html>`;
  }

  /**
   * Show output preview
   */
  function showOutputPreview() {
    const options = {
      includeScope: document.getElementById('output-scope').checked,
      includeMeasurements: document.getElementById('output-measurements').checked,
      includeTile: document.getElementById('output-tile').checked,
      includeMortar: document.getElementById('output-mortar').checked,
      includeAssumptions: document.getElementById('output-assumptions').checked,
      includeDisclaimers: document.getElementById('output-disclaimers').checked,
      includeAudit: document.getElementById('output-audit')?.checked || false
    };

    // Validate before generating output
    const validation = validateProject();
    if (validation.errors.length > 0) {
      showValidationErrors(validation);
      const needsAttention = document.getElementById('needs-attention');
      if (needsAttention) {
        needsAttention.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      showToast('Please fix errors before generating output');
      return;
    }

    const outputHtml = generateOutputPacket(options);
    const preview = document.getElementById('output-preview');
    const content = document.getElementById('output-content');

    content.innerHTML = outputHtml;
    preview.hidden = false;
    preview.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /**
   * Generate comprehensive output packet with tables
   */
  function generateOutputPacket(options) {
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });

    // Calculate totals
    let totalGross = 0;
    let totalDeductions = 0;
    let totalNet = 0;

    state.rooms.forEach(room => {
      if (!room.surfaces) return;
      Object.values(room.surfaces).forEach(s => {
        if (s.selected) {
          totalGross += (s.grossArea || s.area || 0);
          totalDeductions += (s.deductions || []).reduce((sum, d) => sum + (d.area || 0), 0);
          totalNet += (s.netArea || s.area || 0);
        }
      });
    });

    const tile = getTilePreset(
      state.defaults.tilePreset,
      state.defaults.customTileWidth,
      state.defaults.customTileHeight
    );
    const layout = getLayoutPreset(state.defaults.layout);
    const joint = getJointPreset(state.defaults.jointSize);
    const wasteFactor = state.defaults.wasteFactor || 10;

    let html = '<div class="output-packet">';

    // Header
    html += `
      <div class="output-header">
        <h2 class="output-title">${escapeHtml(state.project.name || 'Tile Project')}</h2>
        ${state.project.client ? `<p class="output-client">Prepared for: ${escapeHtml(state.project.client)}</p>` : ''}
        <p class="output-date">Generated: ${date}</p>
      </div>
    `;

    // Scope Summary (narrative)
    if (options.includeScope) {
      html += `
        <div class="output-section">
          <h3 class="output-section-title">📋 Scope Summary</h3>
          <div class="output-narrative">
            ${generateScopeNarrative()}
          </div>
        </div>
      `;
    }

    // Measurements Table
    if (options.includeMeasurements) {
      html += `
        <div class="output-section">
          <h3 class="output-section-title">📐 Measurements</h3>
          <table class="output-table measurements-table">
            <thead>
              <tr>
                <th>Room</th>
                <th>Surface</th>
                <th class="num">Gross (sf)</th>
                <th class="num">Deductions</th>
                <th class="num">Net Area</th>
              </tr>
            </thead>
            <tbody>
              ${generateMeasurementsTableRows()}
            </tbody>
            <tfoot>
              <tr class="totals-row">
                <td colspan="2"><strong>Project Total</strong></td>
                <td class="num"><strong>${formatNumber(totalGross, 1)}</strong></td>
                <td class="num"><strong>−${formatNumber(totalDeductions, 1)}</strong></td>
                <td class="num"><strong>${formatNumber(totalNet, 1)} sf</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
      `;
    }

    // Material Takeoff Table
    if (options.includeTile || options.includeMortar) {
      html += `
        <div class="output-section">
          <h3 class="output-section-title">🧱 Material Takeoff</h3>
          <table class="output-table materials-table">
            <thead>
              <tr>
                <th>Material</th>
                <th class="num">Quantity</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              ${generateMaterialsHtml()}
            </tbody>
          </table>
        </div>
      `;
    }

    // Trowel Override note
    if (state.trowelOverride?.selected && state.trowelOverride?.reason) {
      html += `
        <div class="output-section output-note">
          <p><strong>⚠️ Trowel Override:</strong> Selected ${escapeHtml(getTrowelPreset(state.trowelOverride.selected).name)} instead of recommendation. 
          Reason: "${escapeHtml(state.trowelOverride.reason)}"</p>
        </div>
      `;
    }

    // Audit Trail
    if (options.includeAudit && hasAuditEntries()) {
      html += `
        <div class="output-section">
          <h3 class="output-section-title">📝 Measurement Audit Trail</h3>
          <div class="output-audit">
            ${generateAuditHtml()}
          </div>
        </div>
      `;
    }

    // Assumptions & Exclusions
    if (options.includeAssumptions) {
      html += `
        <div class="output-section">
          <h3 class="output-section-title">📌 Assumptions & Exclusions</h3>
          <div class="output-two-col">
            <div class="output-col">
              <h4>Assumptions</h4>
              <ul>
                <li>Material quantities are estimates; order extra for cuts/waste</li>
                <li>Trowel size is a starting point; verify coverage per manufacturer</li>
                <li>Waste factor: ${wasteFactor}% (adjust for complex layouts)</li>
                <li>Substrate is assumed level within tolerance</li>
                ${tile.isLargeFormat ? '<li>Large format tile requires minimum 95% coverage</li>' : ''}
                ${layout.id.includes('herringbone') ? '<li>Herringbone pattern requires additional cuts at edges</li>' : ''}
              </ul>
            </div>
            <div class="output-col">
              <h4>Exclusions</h4>
              <ul>
                <li>Labor and installation costs</li>
                <li>Permits and inspections</li>
                <li>Subfloor repairs or leveling</li>
                <li>Plumbing/electrical modifications</li>
                <li>Furniture removal/replacement</li>
                <li>Debris disposal (unless noted)</li>
              </ul>
            </div>
          </div>
        </div>
      `;
    }

    // Disclaimers
    if (options.includeDisclaimers) {
      html += `
        <div class="output-section output-disclaimers">
          <h3 class="output-section-title">⚖️ Disclaimers</h3>
          <p class="disclaimer-text">
            <strong>For Estimation Purposes Only.</strong> This document provides preliminary estimates based on the information entered. 
            Actual material requirements may vary based on site conditions, tile selection, installation method, and other factors. 
            Tillerstead recommends professional measurement and consultation before purchasing materials.
          </p>
          <p class="disclaimer-text">
            Trowel recommendations are starting points based on tile size and substrate. Always verify with manufacturer specifications 
            and confirm minimum 80% coverage (95% for wet areas/large format) through field testing.
          </p>
          <p class="disclaimer-legal">
            Tillerstead LLC is a NJ Registered Home Improvement Contractor (#13VH13397100). This estimate does not constitute a contract or proposal.
          </p>
        </div>
      `;
    }

    // Powered by Tillerstead Footer
    html += `
      <div class="output-footer">
        <div class="output-footer__brand">
          <img src="/assets/img/logo/logo-wolf-crest-compact.webp" 
               alt="Tillerstead" 
               class="output-footer__logo"
               width="32" height="32">
          <div class="output-footer__text">
            <span class="output-footer__name">Powered by TillerCalc™</span>
            <span class="output-footer__tagline">Professional Tile Calculators by Tillerstead LLC</span>
          </div>
        </div>
        <div class="output-footer__info">
          <span>NJ HIC #13VH10808800</span>
          <span>•</span>
          <a href="https://tillerstead.com/tools/" target="_blank">tillerstead.com/tools</a>
        </div>
      </div>
    `;

    html += '</div>';
    return html;
  }

  /**
   * Generate scope narrative
   */
  function generateScopeNarrative() {
    const roomCount = state.rooms.filter(r => r.name).length;
    const surfaces = [];
    let totalArea = 0;

    state.rooms.forEach(room => {
      Object.entries(room.surfaces || {}).forEach(([id, s]) => {
        if (s.selected) {
          const label = id.replace(/-/g, ' ');
          if (!surfaces.includes(label)) surfaces.push(label);
          totalArea += (s.netArea || s.area || 0);
        }
      });
    });

    const tile = getTilePreset(
      state.defaults.tilePreset,
      state.defaults.customTileWidth,
      state.defaults.customTileHeight
    );
    const layout = getLayoutPreset(state.defaults.layout);

    let narrative = `<p>This project includes tile installation for <strong>${roomCount} room${roomCount !== 1 ? 's' : ''}</strong> `;
    narrative += `covering approximately <strong>${formatNumber(totalArea, 0)} square feet</strong> of ${surfaces.join(', ')} surfaces.</p>`;

    narrative += `<p>Tile specification: <strong>${escapeHtml(tile.name)}</strong>`;
    if (layout) narrative += ` in <strong>${escapeHtml(layout.name)}</strong> pattern`;
    narrative += '.</p>';

    if (state.systems.waterproofing !== 'none') {
      narrative += `<p>Waterproofing: ${state.systems.waterproofing === 'liquid' ? 'Liquid membrane' : 'Sheet membrane'} system included.</p>`;
    }

    return narrative;
  }

  /**
   * Generate measurements table rows
   */
  function generateMeasurementsTableRows() {
    let rows = '';

    state.rooms.filter(r => r.name).forEach(room => {
      const surfaces = Object.entries(room.surfaces || {}).filter(([, s]) => s.selected);
      if (surfaces.length === 0) return;

      surfaces.forEach(([surfaceId, surface], idx) => {
        const config = SURFACE_CONFIGS[surfaceId] || { label: surfaceId };
        const gross = surface.grossArea || surface.area || 0;
        const deductionsTotal = (surface.deductions || []).reduce((sum, d) => sum + (d.area || 0), 0);
        const net = surface.netArea || (gross - deductionsTotal);

        rows += `
          <tr>
            ${idx === 0 ? `<td rowspan="${surfaces.length}" class="room-name">${escapeHtml(room.name)}${room.locked ? ' 🔒' : ''}</td>` : ''}
            <td>${escapeHtml(config.label)}</td>
            <td class="num">${formatNumber(gross, 1)}</td>
            <td class="num">${deductionsTotal > 0 ? '−' + formatNumber(deductionsTotal, 1) : '—'}</td>
            <td class="num">${formatNumber(net, 1)}</td>
          </tr>
        `;
      });
    });

    return rows;
  }

  /**
   * Check if any rooms have audit entries
   */
  function hasAuditEntries() {
    return state.rooms.some(r => r.auditTrail && r.auditTrail.length > 0);
  }

  /**
   * Generate audit trail HTML
   */
  function generateAuditHtml() {
    let html = '<ul class="audit-list">';

    state.rooms.filter(r => r.auditTrail && r.auditTrail.length > 0).forEach(room => {
      html += `<li class="audit-room"><strong>${escapeHtml(room.name || 'Unnamed Room')}</strong><ul>`;
      room.auditTrail.forEach(entry => {
        const date = new Date(entry.timestamp);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
        html += `<li>${escapeHtml(dateStr)}: ${escapeHtml(entry.action)}`;
        if (entry.reason) html += ` — "${escapeHtml(entry.reason)}"`;
        html += ` (${formatNumber(entry.dimensions.length, 1)}×${formatNumber(entry.dimensions.width, 1)} ft)</li>`;
      });
      html += '</ul></li>';
    });

    html += '</ul>';
    return html;
  }

  /**
   * Copy output to clipboard
   */
  async function copyOutput() {
    const content = document.getElementById('output-content');
    const text = content.textContent;

    try {
      await navigator.clipboard.writeText(text);
      showToast('Copied to clipboard!');
    } catch (err) {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      showToast('Copied to clipboard!');
    }
  }

  /**
   * Download as .doc (HTML-based)
   */
  function downloadDoc() {
    const options = {
      includeScope: document.getElementById('output-scope').checked,
      includeMeasurements: document.getElementById('output-measurements').checked,
      includeTile: document.getElementById('output-tile').checked,
      includeMortar: document.getElementById('output-mortar').checked,
      includeAssumptions: document.getElementById('output-assumptions').checked,
      includeDisclaimers: document.getElementById('output-disclaimers').checked
    };

    const html = generateHtmlOutput(options);
    const blob = new Blob([html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const filename = `${(state.project.name || 'tile-project').replace(/[^a-z0-9]/gi, '-')}-spec.doc`;
    
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Downloaded! Open in Word or Google Docs.');
  }

  /**
   * Download as plain text file
   */
  function downloadTxt() {
    const text = generatePlainTextOutput();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const filename = `${(state.project.name || 'tile-project').replace(/[^a-z0-9]/gi, '-')}-spec.txt`;
    
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Text file downloaded!');
  }

  /**
   * Generate plain text output for .txt download
   */
  function generatePlainTextOutput() {
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
    
    let text = '';
    const line = '═'.repeat(60);
    const thinLine = '─'.repeat(60);
    
    // Header
    text += line + '\n';
    text += '  TILLERSTEAD TILE PROJECT SPECIFICATION\n';
    text += line + '\n\n';
    
    text += `Project: ${state.project.name || 'Untitled Project'}\n`;
    if (state.project.address) text += `Address: ${state.project.address}\n`;
    if (state.project.contact) text += `Contact: ${state.project.contact}\n`;
    text += `Date: ${date}\n`;
    text += '\n' + thinLine + '\n\n';
    
    // Calculate totals
    let totalArea = 0;
    state.rooms.forEach(room => {
      if (!room.surfaces) return;
      Object.values(room.surfaces).forEach(s => {
        if (s.selected) totalArea += s.area;
      });
    });
    
    const wasteFactor = (state.defaults.wasteFactor || 12) / 100;
    const areaWithWaste = totalArea * (1 + wasteFactor);
    
    // MEASUREMENTS SECTION
    if (document.getElementById('output-measurements').checked) {
      text += '📐 MEASUREMENTS\n';
      text += thinLine + '\n\n';
      
      state.rooms.filter(r => r.name).forEach(room => {
        const surfaces = Object.entries(room.surfaces || {})
          .filter(([, s]) => s.selected);
        
        if (surfaces.length === 0) return;
        
        text += `${room.name}:\n`;
        surfaces.forEach(([id, s]) => {
          const name = id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          text += `  • ${name}: ${formatNumber(s.area, 1)} sf\n`;
        });
        const roomTotal = surfaces.reduce((sum, [, s]) => sum + s.area, 0);
        text += `  Subtotal: ${formatNumber(roomTotal, 1)} sf\n\n`;
      });
      
      text += `TOTAL TILE AREA: ${formatNumber(totalArea, 1)} sf\n`;
      text += `With ${state.defaults.wasteFactor || 12}% waste: ${formatNumber(areaWithWaste, 1)} sf\n`;
      text += '\n' + thinLine + '\n\n';
    }
    
    // TILE DETAILS
    if (document.getElementById('output-tile').checked) {
      const tile = getTilePreset(
        state.defaults.tilePreset,
        state.defaults.customTileWidth,
        state.defaults.customTileHeight
      );
      const layout = getLayoutPreset(state.defaults.layout);
      
      text += '🔲 TILE SPECIFICATION\n';
      text += thinLine + '\n\n';
      text += `Tile Size: ${tile.name}\n`;
      text += `Layout Pattern: ${layout.name}\n`;
      text += `Waste Factor: ${state.defaults.wasteFactor || 12}%\n`;
      
      const tilesPerSf = 144 / (tile.width * tile.height);
      const tilesNeeded = Math.ceil(areaWithWaste * tilesPerSf);
      text += `\nTiles Required: ~${tilesNeeded} tiles\n`;
      
      if (state.defaults.tilesPerBox) {
        const boxes = Math.ceil(tilesNeeded / state.defaults.tilesPerBox);
        text += `Boxes Needed: ${boxes} boxes (${state.defaults.tilesPerBox} tiles/box)\n`;
      }
      text += '\n' + thinLine + '\n\n';
    }
    
    // MATERIALS
    if (document.getElementById('output-mortar').checked) {
      const tile = getTilePreset(
        state.defaults.tilePreset,
        state.defaults.customTileWidth,
        state.defaults.customTileHeight
      );
      const trowelRec = recommendTrowel(tile.width, tile.height);
      const mortarCalc = calculateMortarBags(areaWithWaste, trowelRec.trowelId);
      const groutCalc = calculateGrout(
        areaWithWaste,
        tile.width,
        tile.height,
        getJointPreset(state.defaults.jointSize).size
      );
      
      text += '🧱 MATERIALS ESTIMATE\n';
      text += thinLine + '\n\n';
      text += `Thinset Mortar: ${mortarCalc.min}–${mortarCalc.max} bags (50 lb)\n`;
      text += `Recommended Trowel: ${getTrowelPreset(trowelRec.trowelId).name}\n`;
      text += `Grout: ~${groutCalc.quantity} lbs\n`;
      
      if (state.systems.waterproofing === 'liquid') {
        const gallons = Math.ceil(totalArea / 50);
        text += `Waterproofing Membrane: ~${gallons} gallons\n`;
      }
      text += '\n' + thinLine + '\n\n';
    }
    
    // ASSUMPTIONS
    if (document.getElementById('output-assumptions').checked) {
      text += '📋 ASSUMPTIONS & NOTES\n';
      text += thinLine + '\n\n';
      text += '• Substrate assumed level and sound\n';
      text += '• Coverage rates based on TCNA guidelines\n';
      text += '• Mortar coverage varies with trowel technique\n';
      text += '• Waste factor accounts for cuts and breakage\n';
      if (state.project.notes) {
        text += `\nProject Notes:\n${state.project.notes}\n`;
      }
      text += '\n' + thinLine + '\n\n';
    }
    
    // DISCLAIMER
    if (document.getElementById('output-disclaimers').checked) {
      text += '⚠️  DISCLAIMER\n';
      text += thinLine + '\n\n';
      text += 'This estimate is for planning purposes only. Actual material\n';
      text += 'quantities may vary based on site conditions, tile size\n';
      text += 'variations, and installation methods. Always verify with\n';
      text += 'manufacturer specifications before purchasing.\n\n';
    }
    
    // Footer
    text += line + '\n';
    text += `Generated by Tillerstead Tools | ${date}\n`;
    text += 'tillerstead.com/tools/\n';
    text += 'NJ HIC #13VH10808800\n';
    text += line + '\n';
    
    return text;
  }

  /**
   * Helper to generate rooms/surfaces HTML for PDF
   * Separated to avoid template literal nesting issues
   */
  function generateRoomsHtml() {
    let html = '';
    state.rooms.filter(r => r.name).forEach(room => {
      const surfaces = Object.entries(room.surfaces || {})
        .filter(([, s]) => s.selected)
        .map(([id, s]) => ({
          name: id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          area: s.area
        }));
      
      if (surfaces.length === 0) return;
      
      const roomTotal = surfaces.reduce((sum, s) => sum + s.area, 0);
      
      html += '<tr class="room-header"><td colspan="2"><strong>' + escapeHtml(room.name) + '</strong></td></tr>';
      surfaces.forEach(s => {
        html += '<tr><td class="indent">' + escapeHtml(s.name) + '</td>';
        html += '<td class="num">' + formatNumber(s.area, 1) + ' sf</td></tr>';
      });
      html += '<tr class="room-subtotal"><td class="indent">Subtotal</td>';
      html += '<td class="num">' + formatNumber(roomTotal, 1) + ' sf</td></tr>';
    });
    return html;
  }

  /**
   * Helper to generate materials list HTML for PDF
   */
  function generateMaterialsHtml() {
    // Calculate totals
    let totalArea = 0;
    state.rooms.forEach(room => {
      if (!room.surfaces) return;
      Object.values(room.surfaces).forEach(s => {
        if (s.selected) totalArea += s.area;
      });
    });

    const tile = getTilePreset(
      state.defaults.tilePreset,
      state.defaults.customTileWidth,
      state.defaults.customTileHeight
    );
    const joint = getJointPreset(state.defaults.jointSize);
    const wasteFactor = state.defaults.wasteFactor || 10;
    const areaWithWaste = totalArea * (1 + wasteFactor / 100);

    // Tile quantity
    const tileCalc = calculateTileQuantity(totalArea, tile, wasteFactor);
    
    // Mortar estimate
    const trowelRec = getRecommendedTrowel(tile, 'smooth');
    const mortarCalc = calculateMortarBags(totalArea, trowelRec.trowelId, trowelRec.backButter);
    
    // Grout estimate (use default 8mm thickness if not specified)
    const groutCalc = calculateGrout(
      totalArea,
      tile.width,
      tile.height,
      8, // default tile thickness mm
      parseFloat(joint.size) || 0.125,
      'cement',
      tile.isMosaic
    );

    let html = '';
    
    // Tile
    html += '<tr class="material-row">';
    html += '<td><strong>Tile</strong><br><span class="material-detail">' + escapeHtml(tile.name) + '</span></td>';
    html += '<td class="num">' + formatNumber(areaWithWaste, 0) + ' sf</td>';
    html += '<td class="material-note">Includes ' + wasteFactor + '% waste' + (state.defaults.extraAtticStock ? ' + attic stock' : '') + '</td>';
    html += '</tr>';

    // Thinset/Mortar
    html += '<tr class="material-row">';
    html += '<td><strong>Thinset Mortar</strong><br><span class="material-detail">50 lb bags, ' + escapeHtml(getTrowelPreset(trowelRec.trowelId).name) + ' trowel</span></td>';
    html += '<td class="num">' + mortarCalc.min + '–' + mortarCalc.max + ' bags</td>';
    html += '<td class="material-note">' + (trowelRec.backButter ? 'Back-buttering recommended' : 'Standard coverage') + '</td>';
    html += '</tr>';

    // Grout
    html += '<tr class="material-row">';
    html += '<td><strong>Grout</strong><br><span class="material-detail">' + escapeHtml(joint.name) + ' joints</span></td>';
    html += '<td class="num">~' + groutCalc.quantity + ' lbs</td>';
    html += '<td class="material-note">' + (tile.isMosaic ? 'Mosaic = more grout' : 'Standard joint volume') + '</td>';
    html += '</tr>';

    // Backer Board (if underlayment selected)
    if (state.systems.underlayment === 'cement-board') {
      const sheets = Math.ceil(totalArea / 15); // 3x5 sheets = 15 sf
      html += '<tr class="material-row">';
      html += '<td><strong>Cement Board</strong><br><span class="material-detail">3×5 ft sheets (1/2")</span></td>';
      html += '<td class="num">' + sheets + ' sheets</td>';
      html += '<td class="material-note">CBU screws & mesh tape needed</td>';
      html += '</tr>';
    }

    // Waterproofing
    if (state.systems.waterproofing === 'liquid') {
      const gallons = Math.ceil(totalArea / 50); // ~50 sf per gallon for 2 coats
      html += '<tr class="material-row">';
      html += '<td><strong>Waterproofing</strong><br><span class="material-detail">Liquid membrane (2 coats)</span></td>';
      html += '<td class="num">~' + gallons + ' gal</td>';
      html += '<td class="material-note">Plus corners, curbs, fabric</td>';
      html += '</tr>';
    } else if (state.systems.waterproofing === 'sheet') {
      html += '<tr class="material-row">';
      html += '<td><strong>Waterproofing</strong><br><span class="material-detail">Sheet membrane</span></td>';
      html += '<td class="num">' + formatNumber(areaWithWaste * 1.1, 0) + ' sf</td>';
      html += '<td class="material-note">Includes corners & seams</td>';
      html += '</tr>';
    }

    // Uncoupling membrane
    if (state.systems.underlayment === 'uncoupling') {
      html += '<tr class="material-row">';
      html += '<td><strong>Uncoupling Membrane</strong><br><span class="material-detail">DITRA or equivalent</span></td>';
      html += '<td class="num">' + formatNumber(areaWithWaste, 0) + ' sf</td>';
      html += '<td class="material-note">Unmodified thinset required</td>';
      html += '</tr>';
    }

    return html;
  }

  /**
   * Generate professional PDF Build Guide for homeowner
   * Uses Tillerstead theme colors inverted for print-friendly output
   */
  function downloadPdfBuildGuide() {
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });

    // Calculate total area
    let totalArea = 0;
    state.rooms.forEach(room => {
      if (!room.surfaces) return;
      Object.values(room.surfaces).forEach(s => {
        if (s.selected) totalArea += s.area;
      });
    });

    // Get tile/layout info
    const tile = getTilePreset(
      state.defaults.tilePreset,
      state.defaults.customTileWidth,
      state.defaults.customTileHeight
    );
    const layout = getLayoutPreset(state.defaults.layout);
    const joint = getJointPreset(state.defaults.jointSize);

    // Determine which build guides are relevant based on project selections
    const relevantGuides = [];
    if (state.systems.waterproofing !== 'none') {
      relevantGuides.push({
        title: 'Waterproofing Systems',
        url: '/build/waterproofing-systems/',
        summary: 'How your shower is protected from water damage'
      });
    }
    if (totalArea > 0) {
      relevantGuides.push({
        title: 'Tile Installation Standards',
        url: '/build/tile-installation-standards/',
        summary: 'TCNA & ANSI standards for durable installations'
      });
    }
    if (state.systems.underlayment !== 'none' && state.systems.underlayment !== 'cement-board') {
      relevantGuides.push({
        title: 'Shower Pans & Slopes',
        url: '/build/shower-pans-slopes-drains/',
        summary: 'Why proper slope and drainage matter'
      });
    }
    relevantGuides.push({
      title: 'NJ Codes & Permits',
      url: '/build/nj-codes-permits/',
      summary: 'New Jersey building requirements'
    });

    // Build the professional HTML document with Tillerstead theme (light variant)
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Build Guide - ${escapeHtml(state.project.name || 'Your Project')} | Tillerstead</title>
  <style>
    /* =============================================
       TILLERSTEAD THEME - Print-Friendly Light Mode
       Colors: Gold accents, Emerald highlights, Stone neutrals
       ============================================= */
    
    @page {
      size: letter;
      margin: 0.6in 0.75in;
    }
    
    :root {
      /* Tillerstead Brand - Light/Print Variant */
      --ts-gold: #9a7a1a;
      --ts-gold-light: #c9a227;
      --ts-gold-bg: #faf6e8;
      --ts-emerald: #059669;
      --ts-emerald-light: #10b981;
      --ts-emerald-bg: #ecfdf5;
      --ts-stone: #1a1c1a;
      --ts-stone-light: #374151;
      --ts-stone-muted: #6b7280;
      --ts-bg: #ffffff;
      --ts-bg-alt: #f9fafb;
      --ts-border: #e5e7eb;
      --ts-border-light: #f3f4f6;
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
      font-size: 10pt;
      line-height: 1.5;
      color: var(--ts-stone);
      background: var(--ts-bg);
    }
    
    /* Page breaks */
    .page {
      page-break-after: always;
      min-height: 9in;
    }
    .page:last-child {
      page-break-after: avoid;
    }
    .no-break {
      page-break-inside: avoid;
    }
    
    /* ===== HEADER ===== */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 12px;
      margin-bottom: 20px;
      border-bottom: 3px solid var(--ts-gold);
    }
    .header-brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .header-logo {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: contain;
    }
    .header-logo-fallback {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, var(--ts-emerald) 0%, var(--ts-emerald-light) 100%);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 20px;
      font-family: Georgia, serif;
    }
    .header-text {
      line-height: 1.2;
    }
    .header-title {
      font-size: 18px;
      font-weight: 700;
      color: var(--ts-stone);
      letter-spacing: -0.02em;
    }
    .header-subtitle {
      font-size: 9px;
      color: var(--ts-stone-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .header-info {
      text-align: right;
      font-size: 9px;
      color: var(--ts-stone-muted);
    }
    .header-info strong {
      color: var(--ts-emerald);
      font-size: 10px;
    }
    
    /* ===== COVER PAGE ===== */
    .cover {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 8in;
      text-align: center;
      padding: 1in;
    }
    .cover-logo {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      object-fit: contain;
      margin-bottom: 32px;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }
    .cover-logo-fallback {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, var(--ts-emerald) 0%, var(--ts-emerald-light) 100%);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 40px;
      font-family: Georgia, serif;
      margin-bottom: 32px;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }
    .cover h1 {
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: var(--ts-stone-muted);
      margin-bottom: 8px;
    }
    .cover-project {
      font-size: 28px;
      font-weight: 700;
      color: var(--ts-stone);
      margin-bottom: 32px;
      line-height: 1.2;
    }
    .cover-client {
      font-size: 12px;
      color: var(--ts-stone-light);
      margin-bottom: 48px;
      line-height: 1.8;
    }
    .cover-meta {
      font-size: 10px;
      color: var(--ts-stone-muted);
      line-height: 1.6;
    }
    .cover-meta strong {
      color: var(--ts-gold);
    }
    
    /* ===== SECTION HEADERS ===== */
    h2 {
      font-size: 13px;
      font-weight: 700;
      color: var(--ts-emerald);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding-bottom: 6px;
      margin: 24px 0 12px;
      border-bottom: 2px solid var(--ts-gold);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    h2 .icon {
      font-size: 14px;
    }
    h3 {
      font-size: 11px;
      font-weight: 600;
      color: var(--ts-stone);
      margin: 16px 0 8px;
    }
    
    /* ===== TABLES ===== */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0;
      font-size: 9.5pt;
    }
    th {
      background: var(--ts-stone);
      color: white;
      font-weight: 600;
      text-align: left;
      padding: 8px 12px;
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    td {
      padding: 8px 12px;
      border-bottom: 1px solid var(--ts-border);
      vertical-align: top;
    }
    tr:nth-child(even) td {
      background: var(--ts-bg-alt);
    }
    
    /* Special table rows */
    .room-header td {
      background: var(--ts-gold-bg) !important;
      border-bottom: 2px solid var(--ts-gold);
      padding-top: 12px;
    }
    .room-subtotal td {
      font-weight: 600;
      color: var(--ts-emerald);
      border-bottom: 2px solid var(--ts-emerald-bg);
    }
    .total-row td {
      background: var(--ts-emerald-bg) !important;
      font-weight: 700;
      color: var(--ts-emerald);
      font-size: 11px;
      border-top: 2px solid var(--ts-emerald);
    }
    .indent {
      padding-left: 24px;
    }
    .num {
      text-align: right;
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }
    
    /* Materials table */
    .materials-table th:first-child { width: 45%; }
    .materials-table th:nth-child(2) { width: 20%; text-align: right; }
    .materials-table th:nth-child(3) { width: 35%; }
    .material-row td {
      padding: 10px 12px;
    }
    .material-detail {
      font-size: 8.5pt;
      color: var(--ts-stone-muted);
    }
    .material-note {
      font-size: 8.5pt;
      color: var(--ts-stone-muted);
      font-style: italic;
    }
    
    /* Spec table */
    .spec-table { margin: 8px 0; }
    .spec-table td:first-child {
      width: 40%;
      color: var(--ts-stone-muted);
      font-weight: 500;
    }
    .spec-table td:last-child {
      font-weight: 600;
    }
    
    /* ===== CARDS ===== */
    .card {
      border-radius: 8px;
      padding: 14px 16px;
      margin: 12px 0;
      page-break-inside: avoid;
    }
    .card-info {
      background: var(--ts-emerald-bg);
      border: 1px solid #a7f3d0;
      border-left: 4px solid var(--ts-emerald);
    }
    .card-warning {
      background: #fffbeb;
      border: 1px solid #fcd34d;
      border-left: 4px solid #f59e0b;
    }
    .card-gold {
      background: var(--ts-gold-bg);
      border: 1px solid #e8d48a;
      border-left: 4px solid var(--ts-gold);
    }
    .card h4 {
      font-size: 10px;
      font-weight: 700;
      margin-bottom: 6px;
    }
    .card-info h4 { color: var(--ts-emerald); }
    .card-warning h4 { color: #b45309; }
    .card-gold h4 { color: var(--ts-gold); }
    .card p, .card li {
      font-size: 9pt;
      color: var(--ts-stone-light);
      margin: 0;
    }
    
    /* ===== GRID LAYOUTS ===== */
    .two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .guide-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin: 12px 0;
    }
    .guide-card {
      background: var(--ts-bg-alt);
      border: 1px solid var(--ts-border);
      border-radius: 6px;
      padding: 12px;
    }
    .guide-card h4 {
      font-size: 10px;
      font-weight: 700;
      color: var(--ts-emerald);
      margin-bottom: 4px;
    }
    .guide-card p {
      font-size: 8.5pt;
      color: var(--ts-stone-muted);
      margin-bottom: 6px;
    }
    .guide-card .url {
      font-size: 8pt;
      color: var(--ts-gold);
      font-weight: 500;
    }
    
    /* ===== CHECKLIST ===== */
    .checklist {
      list-style: none;
      padding: 0;
      margin: 12px 0;
    }
    .checklist li {
      padding: 8px 0 8px 28px;
      position: relative;
      border-bottom: 1px solid var(--ts-border-light);
      font-size: 9.5pt;
    }
    .checklist li::before {
      content: "☐";
      position: absolute;
      left: 4px;
      color: var(--ts-emerald);
      font-size: 14px;
    }
    
    /* ===== FOOTER ===== */
    .footer {
      margin-top: auto;
      padding-top: 16px;
      border-top: 1px solid var(--ts-border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 8pt;
      color: var(--ts-stone-muted);
    }
    .footer-brand {
      font-weight: 600;
      color: var(--ts-gold);
    }
    
    /* ===== UTILITIES ===== */
    .text-gold { color: var(--ts-gold); }
    .text-emerald { color: var(--ts-emerald); }
    .text-muted { color: var(--ts-stone-muted); }
    .text-center { text-align: center; }
    .mt-0 { margin-top: 0; }
    .mb-0 { margin-bottom: 0; }
    
    /* ===== PRINT ===== */
    @media print {
      body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
      .page {
        margin: 0;
        padding: 0;
      }
    }
  </style>
</head>
<body>

<!-- ==================== COVER PAGE ==================== -->
<div class="page cover">
  <img src="https://tillerstead.com/assets/img/logo/logo-wolf-crest.webp" 
       alt="Tillerstead Wolf Crest" 
       class="cover-logo"
       onerror="this.outerHTML='<div class=\\'cover-logo-fallback\\'>T</div>'">
  <h1>Tile Project Build Guide</h1>
  <div class="cover-project">${escapeHtml(state.project.name || 'Your Tile Project')}</div>
  <div class="cover-client">
    ${state.project.clientName ? `<strong>${escapeHtml(state.project.clientName)}</strong><br>` : ''}
    ${state.project.address ? `${escapeHtml(state.project.address)}<br>` : ''}
    ${state.project.county ? `${escapeHtml(state.project.county)}` : ''}
  </div>
  <div class="cover-meta">
    Prepared <strong>${date}</strong><br>
    by Tillerstead LLC<br>
    NJ HIC #13VH10808800
  </div>
</div>

<!-- ==================== PROJECT SPECIFICATIONS ==================== -->
<div class="page">
  <div class="header">
    <div class="header-brand">
      <img src="https://tillerstead.com/assets/img/logo/logo-wolf-crest-compact.webp" 
           alt="Tillerstead" 
           class="header-logo"
           onerror="this.outerHTML='<div class=\\'header-logo-fallback\\'>T</div>'">
      <div class="header-text">
        <div class="header-title">Tillerstead</div>
        <div class="header-subtitle">Professional Tile Installation</div>
      </div>
    </div>
    <div class="header-info">
      <strong>Licensed & Insured</strong><br>
      NJ HIC #13VH10808800 • (609) 862-8808
    </div>
  </div>

  <h2><span class="icon">📋</span> Project Specifications</h2>
  
  <table class="spec-table">
    ${state.project.name ? `<tr><td>Project</td><td>${escapeHtml(state.project.name)}</td></tr>` : ''}
    ${state.project.clientName ? `<tr><td>Client</td><td>${escapeHtml(state.project.clientName)}</td></tr>` : ''}
    ${state.project.address ? `<tr><td>Address</td><td>${escapeHtml(state.project.address)}</td></tr>` : ''}
    <tr><td>Date Prepared</td><td>${date}</td></tr>
    <tr class="total-row"><td>Total Tile Area</td><td>${formatNumber(totalArea, 1)} sq ft</td></tr>
  </table>

  <div class="two-col">
    <div>
      <h2><span class="icon">🧱</span> Tile Selection</h2>
      <table class="spec-table mt-0">
        <tr><td>Tile Size</td><td>${escapeHtml(tile.name)}</td></tr>
        <tr><td>Layout Pattern</td><td>${escapeHtml(layout.name)}</td></tr>
        <tr><td>Grout Joint</td><td>${escapeHtml(joint.name)}</td></tr>
        <tr><td>Waste Factor</td><td>${state.defaults.wasteFactor}%</td></tr>
        ${state.defaults.extraAtticStock ? '<tr><td>Attic Stock</td><td>✓ Included</td></tr>' : ''}
      </table>
    </div>
    <div>
      <h2><span class="icon">🔧</span> Systems</h2>
      <table class="spec-table mt-0">
        <tr>
          <td>Underlayment</td>
          <td>${state.systems.underlayment === 'none' ? '—' : 
            state.systems.underlayment === 'cement-board' ? 'Cement Board' :
            state.systems.underlayment === 'uncoupling' ? 'Uncoupling Membrane' :
            state.systems.underlayment === 'mud-bed' ? 'Mud Bed' :
            state.systems.underlayment === 'self-leveler' ? 'Self-Leveler' :
            escapeHtml(state.systems.underlayment)}</td>
        </tr>
        <tr>
          <td>Waterproofing</td>
          <td>${state.systems.waterproofing === 'none' ? '—' :
            state.systems.waterproofing === 'liquid' ? 'Liquid Membrane' :
            state.systems.waterproofing === 'sheet' ? 'Sheet Membrane' :
            escapeHtml(state.systems.waterproofing)}</td>
        </tr>
        <tr><td>Edge Trim</td><td>${state.systems.edgeTrim === 'none' ? '—' : escapeHtml(state.systems.edgeTrim)}</td></tr>
        <tr><td>Movement Joints</td><td>${state.systems.movementJoints ? '✓ Required' : 'TBD'}</td></tr>
      </table>
    </div>
  </div>

  ${tile.isLargeFormat ? `
  <div class="card card-warning no-break">
    <h4>⚠️ Large Format Tile</h4>
    <p>Tiles larger than 15" require substrate flatness within 1/8" in 10 feet per ANSI A108.02. 
    Floor leveling may be needed. Minimum 95% mortar coverage with back-buttering.</p>
  </div>
  ` : ''}

  ${layout.lippageRisk ? `
  <div class="card card-warning no-break">
    <h4>⚠️ Lippage Risk</h4>
    <p>A 50% offset pattern with rectangular tiles increases lippage risk. Consider 1/3 offset 
    or verify tiles are within ANSI warpage tolerances.</p>
  </div>
  ` : ''}

  ${state.systems.waterproofing !== 'none' ? `
  <div class="card card-info no-break">
    <h4>✓ Waterproofing Included</h4>
    <p>Your project includes waterproofing per TCNA Handbook and ANSI A118.10 standards. 
    Continuity maintained at corners, penetrations, and transitions.</p>
  </div>
  ` : ''}

  <div class="footer">
    <span class="footer-brand">Tillerstead LLC</span>
    <span>Page 2 • tillerstead.com</span>
  </div>
</div>

<!-- ==================== MEASUREMENTS & MATERIALS ==================== -->
<div class="page">
  <div class="header">
    <div class="header-brand">
      <div class="header-logo">T</div>
      <div class="header-text">
        <div class="header-title">Tillerstead</div>
        <div class="header-subtitle">Professional Tile Installation</div>
      </div>
    </div>
    <div class="header-info">
      <strong>Licensed & Insured</strong><br>
      NJ HIC #13VH10808800
    </div>
  </div>

  <h2><span class="icon">📐</span> Room Measurements</h2>
  
  <table>
    <thead>
      <tr>
        <th>Room / Surface</th>
        <th style="text-align: right; width: 100px;">Area</th>
      </tr>
    </thead>
    <tbody>
      ${generateRoomsHtml()}
      <tr class="total-row">
        <td><strong>TOTAL TILE AREA</strong></td>
        <td class="num"><strong>${formatNumber(totalArea, 1)} sf</strong></td>
      </tr>
    </tbody>
  </table>

  <h2><span class="icon">📦</span> Estimated Materials</h2>
  
  <table class="materials-table">
    <thead>
      <tr>
        <th>Material</th>
        <th>Quantity</th>
        <th>Notes</th>
      </tr>
    </thead>
    <tbody>
      ${generateMaterialsHtml()}
    </tbody>
  </table>

  <div class="card card-gold no-break">
    <h4>📝 Material Notes</h4>
    <p>Quantities are estimates. Final amounts depend on actual site conditions, tile lot size, 
    and manufacturer packaging. Always order 10-15% extra for cuts, waste, and future repairs. 
    Confirm with your supplier before purchasing.</p>
  </div>

  ${state.systems.demoTile || state.systems.demoUnderlayment || state.systems.subfloorRepair || state.systems.disposal ? `
  <h2><span class="icon">🔨</span> Preparation Scope</h2>
  <ul style="padding-left: 20px; margin: 8px 0;">
    ${state.systems.demoTile ? '<li>Remove existing tile and thin-set</li>' : ''}
    ${state.systems.demoUnderlayment ? '<li>Remove existing underlayment/backer board</li>' : ''}
    ${state.systems.subfloorRepair ? '<li>Subfloor repair and preparation</li>' : ''}
    ${state.systems.disposal ? '<li>Debris removal and disposal</li>' : ''}
  </ul>
  ` : ''}

  ${state.project.notes ? `
  <h2><span class="icon">📝</span> Project Notes</h2>
  <div class="card card-info">
    <p>${escapeHtml(state.project.notes)}</p>
  </div>
  ` : ''}

  <div class="footer">
    <span class="footer-brand">Tillerstead LLC</span>
    <span>Page 3 • tillerstead.com</span>
  </div>
</div>

<!-- ==================== BUILD GUIDES & CHECKLIST ==================== -->
<div class="page">
  <div class="header">
    <div class="header-brand">
      <div class="header-logo">T</div>
      <div class="header-text">
        <div class="header-title">Tillerstead</div>
        <div class="header-subtitle">Professional Tile Installation</div>
      </div>
    </div>
    <div class="header-info">
      <strong>Licensed & Insured</strong><br>
      NJ HIC #13VH10808800
    </div>
  </div>

  <h2><span class="icon">📚</span> Build Guide References</h2>
  <p class="text-muted" style="font-size: 9pt; margin-bottom: 12px;">These guides explain the standards relevant to your project. Visit tillerstead.com to read more.</p>
  
  <div class="guide-grid">
    ${relevantGuides.map(g => `
    <div class="guide-card">
      <h4>${escapeHtml(g.title)}</h4>
      <p>${escapeHtml(g.summary)}</p>
      <div class="url">tillerstead.com${g.url}</div>
    </div>
    `).join('')}
  </div>

  <h2><span class="icon">✅</span> Homeowner Checklist</h2>
  
  <ul class="checklist">
    <li>Review specifications with installer before work begins</li>
    <li>Confirm tile selection and quantities with supplier</li>
    <li>Discuss movement joint locations (perimeter & field)</li>
    <li>Verify waterproofing system and compatibility</li>
    <li>Request mortar coverage test during installation</li>
    <li>Obtain written warranty documentation</li>
    <li>Schedule flood test for shower/wet areas</li>
    <li>Review cleaning and maintenance instructions</li>
  </ul>

  <div class="two-col" style="margin-top: 20px;">
    <div class="card card-info">
      <h4>TCNA & ANSI Standards</h4>
      <p>We follow TCNA Handbook methods and ANSI A108/A118 standards on every project—even when not required by code. 
      These industry best practices ensure your installation performs properly for years to come.</p>
    </div>
    <div class="card card-gold">
      <h4>NJ HIC Requirements</h4>
      <p>As a licensed NJ Home Improvement Contractor (#13VH10808800), we provide written contracts, 
      detailed scopes, and honor all warranty commitments per N.J.A.C. 13:45A-16.</p>
    </div>
  </div>

  <div class="footer">
    <span class="footer-brand">Tillerstead LLC</span>
    <span>Page 4 • tillerstead.com</span>
  </div>
</div>

<!-- ==================== DISCLAIMERS & CONTACT ==================== -->
<div class="page">
  <div class="header">
    <div class="header-brand">
      <div class="header-logo">T</div>
      <div class="header-text">
        <div class="header-title">Tillerstead</div>
        <div class="header-subtitle">Professional Tile Installation</div>
      </div>
    </div>
    <div class="header-info">
      <strong>Licensed & Insured</strong><br>
      NJ HIC #13VH10808800
    </div>
  </div>

  <h2><span class="icon">⚠️</span> Important Notices</h2>
  
  <ul style="padding-left: 20px; font-size: 9.5pt; line-height: 1.7;">
    <li><strong>Material Quantities:</strong> All quantities are estimates based on measurements provided. 
    Verify with your supplier and account for manufacturer-recommended overage.</li>
    <li><strong>Trowel Selection:</strong> Notch recommendations are starting points. Coverage must be 
    verified by periodically lifting tiles during installation.</li>
    <li><strong>Grout Joints:</strong> Final joint width depends on tile variation, warpage, and 
    manufacturer recommendations.</li>
    <li><strong>Site Conditions:</strong> Final scope may be adjusted based on actual conditions. 
    Any changes will be documented in writing.</li>
    <li><strong>Not a Contract:</strong> This specification is for planning purposes only. A formal 
    contract with complete terms will be provided before work begins.</li>
  </ul>

  <h2><span class="icon">📞</span> Contact Information</h2>
  
  <table class="spec-table" style="max-width: 400px;">
    <tr><td>Company</td><td>Tillerstead LLC</td></tr>
    <tr><td>Phone</td><td>(609) 862-8808</td></tr>
    <tr><td>Email</td><td>info@tillerstead.com</td></tr>
    <tr><td>Website</td><td>tillerstead.com</td></tr>
    <tr><td>NJ HIC License</td><td>13VH10808800</td></tr>
    <tr><td>Service Area</td><td>Atlantic, Ocean & Cape May Counties, NJ</td></tr>
  </table>

  <div class="card card-info" style="margin-top: 24px;">
    <h4>Ready to Get Started?</h4>
    <p>Contact us to schedule a site visit and receive a detailed written proposal. We'll review your project 
    in person, discuss your goals, and provide transparent pricing with no hidden fees.</p>
  </div>

  <div class="footer" style="margin-top: auto; flex-direction: column; text-align: center; gap: 4px;">
    <span>Generated ${date} by Tillerstead Tools</span>
    <span>© ${new Date().getFullYear()} Tillerstead LLC • All Rights Reserved</span>
    <span style="color: var(--ts-gold);">tillerstead.com/tools/</span>
  </div>
</div>

</body>
</html>`;

    // Create blob and trigger download
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Open in new window for printing as PDF
    const printWindow = window.open(url, '_blank');
    
    if (printWindow) {
      printWindow.onload = function() {
        // Give the page a moment to render, then trigger print dialog
        setTimeout(() => {
          printWindow.print();
        }, 500);
      };
      showToast('Build Guide ready! Select "Save as PDF" in Print dialog');
    } else {
      // Fallback: download as HTML file that user can open and print
      const a = document.createElement('a');
      const filename = (state.project.name || 'tile-project').replace(/[^a-z0-9]/gi, '-') + '-build-guide.html';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast('Build Guide downloaded! Open and Print → Save as PDF');
    }
    
    // Clean up after a delay
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  /**
   * Show toast notification
   */
  function showToast(message) {
    // Remove existing toast
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('toast--visible');
    });

    // Remove after delay
    setTimeout(() => {
      toast.classList.remove('toast--visible');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // ============================================
  // STORAGE
  // ============================================

  /**
   * Save state to localStorage
   */
  const saveToStorage = debounce(function() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Could not save to localStorage:', e);
    }
  }, 500);

  /**
   * Load state from localStorage
   */
  function loadFromStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with defaults to handle new fields
        state = {
          ...state,
          ...parsed,
          project: { ...state.project, ...parsed.project },
          defaults: { ...state.defaults, ...parsed.defaults },
          systems: { ...state.systems, ...parsed.systems }
        };
        return true;
      }
    } catch (e) {
      console.warn('Could not load from localStorage:', e);
    }
    return false;
  }

  /**
   * Reset all data
   */
  function resetProject() {
    if (!confirm('Reset all data? This cannot be undone.')) return;

    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  }

  /**
   * Render UI from state (after import)
   */
  function renderFromState() {
    // Clear rooms
    document.getElementById('rooms-list').innerHTML = '';

    // Populate project info
    document.getElementById('project-name').value = state.project.name || '';
    document.getElementById('client-name').value = state.project.clientName || '';
    document.getElementById('project-address').value = state.project.address || '';
    document.getElementById('project-county').value = state.project.county || '';
    document.getElementById('client-phone').value = state.project.phone || '';
    document.getElementById('client-email').value = state.project.email || '';
    document.getElementById('project-notes').value = state.project.notes || '';

    // Populate defaults
    document.getElementById('default-tile-size').value = state.defaults.tilePreset || '';
    document.getElementById('custom-tile-width').value = state.defaults.customTileWidth || '';
    document.getElementById('custom-tile-height').value = state.defaults.customTileHeight || '';
    document.getElementById('default-tile-thickness').value = state.defaults.tileThickness || 8;
    document.getElementById('default-layout').value = state.defaults.layout || '';
    document.getElementById('default-waste').value = state.defaults.wasteFactor || 12;
    document.getElementById('default-joint').value = state.defaults.jointSize || '';
    document.getElementById('extra-attic-stock').checked = state.defaults.extraAtticStock || false;

    // Show custom tile fields if needed
    document.getElementById('custom-tile-fields').hidden = state.defaults.tilePreset !== 'custom';

    // Populate systems
    document.getElementById('underlayment').value = state.systems.underlayment || 'none';
    document.getElementById('waterproofing').value = state.systems.waterproofing || 'none';
    document.getElementById('edge-trim').value = state.systems.edgeTrim || 'none';
    document.getElementById('movement-joints').checked = state.systems.movementJoints || false;
    document.getElementById('demo-tile').checked = state.systems.demoTile || false;
    document.getElementById('demo-underlayment').checked = state.systems.demoUnderlayment || false;
    document.getElementById('subfloor-repair').checked = state.systems.subfloorRepair || false;
    document.getElementById('disposal').checked = state.systems.disposal || false;

    // Re-create room cards
    state.rooms.forEach(room => {
      createRoomCard(room);
    });

    updateAreaSummary();
    showLayoutNudge();
    showJointRecommendation();
  }

  // ============================================
  // CALCULATOR MODULES
  // ============================================

  /**
   * Handle tile calculator
   */
  function calculateTile() {
    const area = parseFloat(document.getElementById('calc-area').value) || 0;
    const tilePresetId = document.getElementById('calc-tile-size').value;
    const customWidth = parseFloat(document.getElementById('calc-custom-width').value) || 0;
    const customHeight = parseFloat(document.getElementById('calc-custom-height').value) || 0;
    const layoutId = document.getElementById('calc-layout').value;
    const wastePercent = parseFloat(document.getElementById('calc-waste').value) || 12;
    const boxMode = document.getElementById('calc-box-mode').value;
    const tilesPerBox = parseFloat(document.getElementById('calc-tiles-per-box').value) || 0;
    const sqftPerBox = parseFloat(document.getElementById('calc-sqft-per-box').value) || 0;
    const addAtticStock = document.getElementById('calc-attic-stock').checked;

    if (area <= 0) {
      showToast('Enter a valid area');
      return;
    }

    const tile = getTilePreset(tilePresetId, customWidth, customHeight);
    const result = calculateTileQuantity(area, tile, wastePercent);
    const boxResult = calculateBoxes(
      result.tiles,
      tilesPerBox,
      sqftPerBox,
      tile,
      result.areaWithWaste,
      addAtticStock
    );

    // Show results
    document.getElementById('result-area-waste').textContent = `${formatNumber(result.areaWithWaste, 1)} sq ft`;
    document.getElementById('result-tiles').textContent = formatNumber(result.tiles);
    document.getElementById('result-boxes').textContent = boxResult.boxes > 0 
      ? `${formatNumber(boxResult.boxes)} boxes` 
      : boxResult.note;

    const noteEl = document.getElementById('tile-calc-note');
    let note = '';
    if (addAtticStock) {
      note = 'Includes attic stock for future repairs. ';
    }
    if (tile.isMosaic) {
      note += 'Mosaic sheets calculated at ~1 sq ft per 12×12 sheet.';
    }
    noteEl.textContent = note;

    document.getElementById('tile-calc-results').hidden = false;
  }

  /**
   * Handle mortar calculator
   */
  function calculateMortar() {
    const area = parseFloat(document.getElementById('mortar-area').value) || 0;
    const tilePresetId = document.getElementById('mortar-tile-size').value;
    const customWidth = parseFloat(document.getElementById('mortar-custom-width').value) || 0;
    const customHeight = parseFloat(document.getElementById('mortar-custom-height').value) || 0;
    const substrate = document.getElementById('mortar-substrate').value;
    const selectedTrowelId = document.getElementById('mortar-trowel').value;
    const backButter = document.getElementById('mortar-backbutter').checked;
    const coverageGoal = document.getElementById('mortar-coverage-goal')?.value || 'standard';

    if (area <= 0) {
      showToast('Enter a valid area');
      return;
    }

    const tile = getTilePreset(tilePresetId, customWidth, customHeight);
    
    // Get recommended trowel based on tile, substrate, and coverage goal
    const recommendation = getRecommendedTrowel(tile, substrate);
    const recommendedTrowelId = recommendation.trowelId;
    const recommendedTrowel = getTrowelPreset(recommendedTrowelId);

    // Determine which trowel to use for calculation
    let useTrowelId = recommendedTrowelId;
    let isOverride = false;

    if (selectedTrowelId && selectedTrowelId !== 'auto') {
      useTrowelId = selectedTrowelId;
      isOverride = selectedTrowelId !== recommendedTrowelId;
    }

    // Update trowel comparison display
    const comparisonEl = document.getElementById('trowel-comparison');
    const recommendedDisplay = document.getElementById('trowel-recommended-display');
    const selectedDisplay = document.getElementById('trowel-selected-display');
    const overrideReasonField = document.getElementById('mortar-trowel-override-reason-field');

    if (comparisonEl && recommendedDisplay && selectedDisplay) {
      recommendedDisplay.innerHTML = `
        <span class="trowel-label">Recommended:</span>
        <span class="trowel-value">${escapeHtml(recommendedTrowel.name)}</span>
        <span class="trowel-note">${escapeHtml(recommendation.note || 'Starting point; verify coverage')}</span>
      `;

      if (isOverride) {
        const selectedTrowel = getTrowelPreset(useTrowelId);
        selectedDisplay.innerHTML = `
          <span class="trowel-label">Selected:</span>
          <span class="trowel-value trowel-value--override">${escapeHtml(selectedTrowel.name)}</span>
          <span class="trowel-note trowel-note--override">↑ Override</span>
        `;
        selectedDisplay.hidden = false;
        if (overrideReasonField) overrideReasonField.hidden = false;
      } else {
        selectedDisplay.hidden = true;
        if (overrideReasonField) overrideReasonField.hidden = true;
      }

      comparisonEl.hidden = false;
    }

    // Store override in state
    state.trowelOverride = {
      selected: isOverride ? useTrowelId : null,
      reason: isOverride ? (document.getElementById('mortar-trowel-override-reason')?.value || '') : ''
    };

    // Legacy recommendation display
    const recEl = document.getElementById('trowel-recommendation');
    const recText = document.getElementById('trowel-recommendation-text');
    if (recEl && recText) {
      recText.textContent = `${recommendedTrowel.name}. ${recommendation.note}`;
      recEl.hidden = false;
    }

    // Auto-suggest back-butter for large format tiles (any side ≥ 24")
    if ((tile.width >= 24 || tile.height >= 24) && !backButter) {
      const bbCheckbox = document.getElementById('mortar-backbutter');
      if (bbCheckbox) {
        bbCheckbox.checked = true;
        showToast('Back-buttering auto-enabled for large format tile');
      }
    }

    // Adjust coverage for coverage goal
    let coverageMultiplier = 1;
    if (coverageGoal === 'wet-area') {
      coverageMultiplier = 0.95; // Need better coverage in wet areas
    } else if (coverageGoal === 'large-format') {
      coverageMultiplier = 0.90; // Large format needs excellent coverage
    }

    const result = calculateMortarBags(area / coverageMultiplier, useTrowelId, backButter);
    const trowel = getTrowelPreset(useTrowelId);

    // Show results
    document.getElementById('result-trowel').textContent = trowel.name;
    document.getElementById('result-coverage').textContent = result.coverage;
    document.getElementById('result-bags').textContent = result.min === result.max
      ? `${result.min} bags`
      : `${result.min}–${result.max} bags`;

    // Show substrate nudge if needed
    const substrateNudge = document.getElementById('substrate-nudge');
    const substrateNudgeText = document.getElementById('substrate-nudge-text');
    if (substrate === 'needs-flattening') {
      substrateNudgeText.textContent = 'Substrate needs flattening. Consider self-leveler or patching before tile installation. Factor in additional material and labor.';
      substrateNudge.hidden = false;
    } else {
      substrateNudge.hidden = true;
    }

    // Show back-butter nudge for large format
    const bbNudge = document.getElementById('backbutter-nudge');
    if (tile.isLargeFormat && !document.getElementById('mortar-backbutter').checked) {
      bbNudge.hidden = false;
    } else {
      bbNudge.hidden = true;
    }

    document.getElementById('mortar-calc-results').hidden = false;
  }

  /**
   * Handle grout calculator
   */
  function calculateGroutQuantity() {
    const area = parseFloat(document.getElementById('grout-area').value) || 0;
    const tileLength = parseFloat(document.getElementById('grout-tile-length').value) || 0;
    const tileWidth = parseFloat(document.getElementById('grout-tile-width').value) || 0;
    const tileThickness = parseFloat(document.getElementById('grout-tile-thickness').value) || 8;
    const jointPresetId = document.getElementById('grout-joint-width').value;
    const customJoint = parseFloat(document.getElementById('grout-custom-joint').value) || 0;
    const groutType = document.getElementById('grout-type').value;
    const isMosaic = document.getElementById('grout-mosaic').checked;

    if (area <= 0 || tileLength <= 0 || tileWidth <= 0) {
      showToast('Enter all required values');
      return;
    }

    // Get joint size
    let jointSize;
    if (jointPresetId === 'custom') {
      jointSize = customJoint;
    } else {
      const jointPreset = getJointPreset(jointPresetId);
      jointSize = jointPreset.size;
    }

    if (jointSize <= 0) {
      showToast('Select or enter a joint width');
      return;
    }

    const result = calculateGrout(area, tileLength, tileWidth, tileThickness, jointSize, groutType, isMosaic);

    // Show results
    document.getElementById('result-joint-volume').textContent = `${result.volume} cu ft`;
    document.getElementById('result-grout').textContent = `~${result.quantity} lbs`;

    document.getElementById('grout-calc-results').hidden = false;
  }

  /**
   * Handle leveling calculator
   */
  function calculateLeveling() {
    const area = parseFloat(document.getElementById('level-area').value) || 0;
    const avgDepth = parseFloat(document.getElementById('level-depth-avg').value) || 0;
    const maxDepth = parseFloat(document.getElementById('level-depth-max').value) || 0;

    if (area <= 0 || avgDepth <= 0) {
      showToast('Enter area and average depth');
      return;
    }

    const result = calculateLeveler(area, avgDepth, maxDepth);

    // Show results
    document.getElementById('result-level-volume').textContent = `${result.volume} cu ft`;
    document.getElementById('result-level-bags').textContent = result.bagsMax > result.bags
      ? `${result.bags}–${result.bagsMax}`
      : `~${result.bags}`;

    document.getElementById('level-calc-results').hidden = false;
  }

  // ============================================
  // EVENT HANDLERS
  // ============================================

  /**
   * Initialize event listeners
   */
  function initEventListeners() {
    // Use event delegation for dynamic elements
    document.addEventListener('click', handleClick);
    document.addEventListener('change', handleChange);
    document.addEventListener('input', debounce(handleInput, 200));

    // Form submission prevention
    document.getElementById('estimate-form').addEventListener('submit', e => e.preventDefault());

    // Calculator buttons
    document.getElementById('calc-tile-btn').addEventListener('click', calculateTile);
    document.getElementById('calc-mortar-btn').addEventListener('click', calculateMortar);
    document.getElementById('calc-grout-btn').addEventListener('click', calculateGroutQuantity);
    document.getElementById('calc-level-btn').addEventListener('click', calculateLeveling);

    // Output buttons
    document.getElementById('generate-scope-btn').addEventListener('click', () => {
      const errors = validateProject();
      showValidationErrors(errors);
      if (errors.length === 0) {
        showOutputPreview();
      }
    });
    document.getElementById('generate-output-btn').addEventListener('click', showOutputPreview);
    document.getElementById('copy-output-btn').addEventListener('click', copyOutput);
    document.getElementById('download-doc-btn').addEventListener('click', downloadDoc);
    document.getElementById('download-txt-btn').addEventListener('click', downloadTxt);
    document.getElementById('download-pdf-btn').addEventListener('click', downloadPdfBuildGuide);

    // Save/Load buttons
    document.getElementById('save-project-btn').addEventListener('click', () => {
      saveToStorage();
      showToast('Project saved!');
    });
    document.getElementById('reset-project-btn').addEventListener('click', resetProject);

    // Add room button
    document.getElementById('add-room-btn').addEventListener('click', () => {
      createRoomCard();
    });

    // Keyboard navigation for sticky nav
    document.querySelector('.tools-nav__list').addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        const links = Array.from(document.querySelectorAll('.tools-nav__link'));
        const current = document.activeElement;
        const idx = links.indexOf(current);
        if (idx > -1) {
          e.preventDefault();
          const next = e.key === 'ArrowRight' 
            ? links[(idx + 1) % links.length]
            : links[(idx - 1 + links.length) % links.length];
          next.focus();
        }
      }
    });
  }

  /**
   * Handle click events (delegation)
   */
  function handleClick(e) {
    const target = e.target;

    // Remove room button
    if (target.closest('.room-remove-btn')) {
      const card = target.closest('.room-card');
      if (card) {
        const roomId = card.dataset.roomId;
        if (state.rooms.length > 1 || confirm('Remove this room?')) {
          removeRoom(roomId);
        }
      }
    }

    // Add deduction button
    if (target.closest('.add-deduction-btn')) {
      const btn = target.closest('.add-deduction-btn');
      const surfaceId = btn.dataset.surface;
      const roomCard = btn.closest('.room-card');
      if (roomCard && surfaceId) {
        addDeduction(roomCard.dataset.roomId, surfaceId);
      }
    }

    // Remove deduction button
    if (target.closest('.remove-deduction-btn')) {
      const btn = target.closest('.remove-deduction-btn');
      const surfaceId = btn.dataset.surface;
      const index = parseInt(btn.dataset.index);
      const roomCard = btn.closest('.room-card');
      if (roomCard && surfaceId && !isNaN(index)) {
        removeDeduction(roomCard.dataset.roomId, surfaceId, index);
      }
    }

    // Back to top button
    if (target.closest('.back-to-top')) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /**
   * Add a deduction to a surface
   */
  function addDeduction(roomId, surfaceId) {
    const room = state.rooms.find(r => r.id === roomId);
    if (!room || !room.surfaces || !room.surfaces[surfaceId]) return;

    if (!room.surfaces[surfaceId].deductions) {
      room.surfaces[surfaceId].deductions = [];
    }

    room.surfaces[surfaceId].deductions.push({
      label: '',
      width: 0,
      height: 0,
      area: 0
    });

    const card = document.querySelector(`[data-room-id="${roomId}"]`);
    if (card) {
      renderSurfaceDetails(card, room);
    }
    saveToStorage();
  }

  /**
   * Remove a deduction from a surface
   */
  function removeDeduction(roomId, surfaceId, index) {
    const room = state.rooms.find(r => r.id === roomId);
    if (!room || !room.surfaces || !room.surfaces[surfaceId]) return;

    if (room.surfaces[surfaceId].deductions && room.surfaces[surfaceId].deductions[index]) {
      room.surfaces[surfaceId].deductions.splice(index, 1);
    }

    const card = document.querySelector(`[data-room-id="${roomId}"]`);
    if (card) {
      renderSurfaceDetails(card, room);
      recalculateRoomSurfaces(room);
    }
    updateAreaSummary();
    saveToStorage();
  }

  /**
   * Update deduction values
   */
  function updateDeduction(roomId, surfaceId, index, field, value) {
    const room = state.rooms.find(r => r.id === roomId);
    if (!room || !room.surfaces || !room.surfaces[surfaceId]) return;

    const deduction = room.surfaces[surfaceId].deductions?.[index];
    if (!deduction) return;

    deduction[field] = value;

    // Calculate area from width × height (convert to sq ft)
    if (deduction.width > 0 && deduction.height > 0) {
      deduction.area = (deduction.width * deduction.height) / 144; // inches to sq ft
    }

    recalculateRoomSurfaces(room);
    updateAreaSummary();
    saveToStorage();

    // Update display
    const card = document.querySelector(`[data-room-id="${roomId}"]`);
    if (card) {
      const areaSpan = card.querySelector(`[data-deductions="${surfaceId}"] [data-index="${index}"] .deduction-area`);
      if (areaSpan) {
        areaSpan.textContent = deduction.area > 0 ? formatNumber(deduction.area, 1) + ' sf' : '—';
      }
      // Update net area display
      const netSpan = card.querySelector(`[data-surface-id="${surfaceId}"] .surface-net-value`);
      if (netSpan) {
        netSpan.textContent = formatNumber(room.surfaces[surfaceId].netArea || 0, 1) + ' sf';
      }
    }
  }

  /**
   * Handle change events (delegation)
   */
  function handleChange(e) {
    const target = e.target;

    // Project info fields
    if (target.id === 'project-name') {
      state.project.name = target.value;
      saveToStorage();
    }
    if (target.id === 'client-name') {
      state.project.clientName = target.value;
      saveToStorage();
    }
    if (target.id === 'project-address') {
      state.project.address = target.value;
      saveToStorage();
    }
    if (target.id === 'project-county') {
      state.project.county = target.value;
      saveToStorage();
    }
    if (target.id === 'client-phone') {
      state.project.phone = target.value;
      saveToStorage();
    }
    if (target.id === 'client-email') {
      state.project.email = target.value;
      saveToStorage();
    }
    if (target.id === 'project-notes') {
      state.project.notes = target.value;
      saveToStorage();
    }

    // Defaults fields
    if (target.id === 'default-tile-size') {
      state.defaults.tilePreset = target.value;
      document.getElementById('custom-tile-fields').hidden = target.value !== 'custom';
      showLayoutNudge();
      showJointRecommendation();
      saveToStorage();
    }
    if (target.id === 'custom-tile-width') {
      state.defaults.customTileWidth = parseFloat(target.value) || 0;
      showLayoutNudge();
      saveToStorage();
    }
    if (target.id === 'custom-tile-height') {
      state.defaults.customTileHeight = parseFloat(target.value) || 0;
      showLayoutNudge();
      saveToStorage();
    }
    if (target.id === 'default-tile-thickness') {
      state.defaults.tileThickness = parseInt(target.value) || 8;
      saveToStorage();
    }
    if (target.id === 'default-layout') {
      state.defaults.layout = target.value;
      // Update waste factor suggestion
      const layout = getLayoutPreset(target.value);
      if (layout) {
        document.getElementById('default-waste').value = Math.round(layout.wasteFactor * 100);
        state.defaults.wasteFactor = Math.round(layout.wasteFactor * 100);
        document.getElementById('waste-hint').textContent = `Suggested: ${layout.wasteRange} for ${layout.name}`;
      }
      showLayoutNudge();
      saveToStorage();
    }
    if (target.id === 'default-waste') {
      state.defaults.wasteFactor = parseInt(target.value) || 12;
      saveToStorage();
    }
    if (target.id === 'default-joint') {
      state.defaults.jointSize = target.value;
      saveToStorage();
    }
    if (target.id === 'extra-attic-stock') {
      state.defaults.extraAtticStock = target.checked;
      saveToStorage();
    }

    // Systems fields
    if (target.id === 'underlayment') {
      state.systems.underlayment = target.value;
      saveToStorage();
    }
    if (target.id === 'waterproofing') {
      state.systems.waterproofing = target.value;
      saveToStorage();
    }
    if (target.id === 'edge-trim') {
      state.systems.edgeTrim = target.value;
      saveToStorage();
    }
    if (target.id === 'movement-joints') {
      state.systems.movementJoints = target.checked;
      saveToStorage();
    }
    if (target.id === 'demo-tile') {
      state.systems.demoTile = target.checked;
      saveToStorage();
    }
    if (target.id === 'demo-underlayment') {
      state.systems.demoUnderlayment = target.checked;
      saveToStorage();
    }
    if (target.id === 'subfloor-repair') {
      state.systems.subfloorRepair = target.checked;
      saveToStorage();
    }
    if (target.id === 'disposal') {
      state.systems.disposal = target.checked;
      saveToStorage();
    }

    // Room fields
    const roomCard = target.closest('.room-card');
    if (roomCard) {
      const roomId = roomCard.dataset.roomId;

      if (target.classList.contains('room-name-input')) {
        updateRoomData(roomId, 'name', target.value);
      }
      if (target.classList.contains('surface-checkbox')) {
        updateRoomSurface(roomId, target.dataset.surface, target.checked);
      }
      if (target.classList.contains('room-lock-checkbox')) {
        const room = state.rooms.find(r => r.id === roomId);
        if (room) {
          const wasLocked = room.locked;
          room.locked = target.checked;
          
          // Initialize audit trail if needed
          if (!room.auditTrail) room.auditTrail = [];
          
          // Disable/enable inputs based on lock state
          const dimensionInputs = roomCard.querySelectorAll('.room-length-ft, .room-length-in, .room-width-ft, .room-width-in, .room-height-ft, .room-height-in');
          dimensionInputs.forEach(input => {
            input.disabled = target.checked;
          });
          
          // Visual lock state
          roomCard.classList.toggle('room-card--locked', target.checked);
          
          // Add audit entry
          const auditEntry = {
            timestamp: new Date().toISOString(),
            action: target.checked ? 'locked' : 'unlocked',
            reason: '',
            dimensions: {
              length: toDecimalFeet(room.lengthFt, room.lengthIn),
              width: toDecimalFeet(room.widthFt, room.widthIn),
              height: toDecimalFeet(room.heightFt, room.heightIn)
            }
          };
          
          // If unlocking, prompt for reason
          if (wasLocked && !target.checked) {
            const reason = prompt('Optional: Enter reason for unlocking measurements:');
            if (reason !== null) {
              auditEntry.reason = reason;
            }
          }
          
          room.auditTrail.push(auditEntry);
          
          // Update audit display in room card
          updateRoomAuditDisplay(roomCard, room);
          
          roomCard.querySelector('.room-lock-reason').hidden = true;
          saveToStorage();
        }
      }

      // Surface area mode change
      if (target.classList.contains('surface-area-mode')) {
        const surfaceId = target.dataset.surface;
        const room = state.rooms.find(r => r.id === roomId);
        if (room && room.surfaces && room.surfaces[surfaceId]) {
          room.surfaces[surfaceId].areaMode = target.value;
          // Show/hide manual area field
          const manualField = roomCard.querySelector(`[data-surface-id="${surfaceId}"] .surface-manual-area-field`);
          if (manualField) {
            manualField.hidden = target.value !== 'manual';
          }
          recalculateRoomSurfaces(room);
          updateAreaSummary();
          saveToStorage();
        }
      }

      // Surface manual area change
      if (target.classList.contains('surface-manual-area')) {
        const surfaceId = target.dataset.surface;
        const room = state.rooms.find(r => r.id === roomId);
        if (room && room.surfaces && room.surfaces[surfaceId]) {
          room.surfaces[surfaceId].manualArea = parseFloat(target.value) || 0;
          recalculateRoomSurfaces(room);
          updateAreaSummary();
          saveToStorage();
          // Update net display
          const netSpan = roomCard.querySelector(`[data-surface-id="${surfaceId}"] .surface-net-value`);
          if (netSpan) {
            netSpan.textContent = formatNumber(room.surfaces[surfaceId].netArea || 0, 1) + ' sf';
          }
        }
      }

      // Surface use global defaults toggle
      if (target.classList.contains('surface-use-defaults')) {
        const surfaceId = target.dataset.surface;
        const room = state.rooms.find(r => r.id === roomId);
        if (room && room.surfaces && room.surfaces[surfaceId]) {
          room.surfaces[surfaceId].useGlobalDefaults = target.checked;
          // Show/hide overrides
          const overridesDiv = roomCard.querySelector(`[data-surface-id="${surfaceId}"] .surface-overrides`);
          if (overridesDiv) {
            overridesDiv.hidden = target.checked;
          }
          saveToStorage();
        }
      }

      // Surface tile override
      if (target.classList.contains('surface-tile-override')) {
        const surfaceId = target.dataset.surface;
        const room = state.rooms.find(r => r.id === roomId);
        if (room && room.surfaces && room.surfaces[surfaceId]) {
          if (!room.surfaces[surfaceId].overrides) room.surfaces[surfaceId].overrides = {};
          room.surfaces[surfaceId].overrides.tilePreset = target.value;
          saveToStorage();
        }
      }

      // Surface waste override
      if (target.classList.contains('surface-waste-override')) {
        const surfaceId = target.dataset.surface;
        const room = state.rooms.find(r => r.id === roomId);
        if (room && room.surfaces && room.surfaces[surfaceId]) {
          if (!room.surfaces[surfaceId].overrides) room.surfaces[surfaceId].overrides = {};
          room.surfaces[surfaceId].overrides.waste = parseFloat(target.value) || null;
          saveToStorage();
        }
      }
    }

    // Calculator fields - show/hide custom inputs
    if (target.id === 'calc-tile-size') {
      document.getElementById('calc-custom-tile-fields').hidden = target.value !== 'custom';
    }
    if (target.id === 'mortar-tile-size') {
      document.getElementById('mortar-custom-tile-fields').hidden = target.value !== 'custom';
    }
    if (target.id === 'calc-box-mode') {
      document.getElementById('calc-tiles-per-box-field').hidden = target.value !== 'tiles-per-box';
      document.getElementById('calc-sqft-per-box-field').hidden = target.value !== 'sqft-per-box';
    }
    if (target.id === 'grout-joint-width') {
      document.getElementById('grout-custom-joint-field').hidden = target.value !== 'custom';
    }

    // Update trowel recommendation on tile/substrate change
    if (target.id === 'mortar-tile-size' || target.id === 'mortar-substrate') {
      const tilePresetId = document.getElementById('mortar-tile-size').value;
      const customWidth = parseFloat(document.getElementById('mortar-custom-width').value) || 0;
      const customHeight = parseFloat(document.getElementById('mortar-custom-height').value) || 0;
      const substrate = document.getElementById('mortar-substrate').value;
      
      const tile = getTilePreset(tilePresetId, customWidth, customHeight);
      const rec = getRecommendedTrowel(tile, substrate);
      
      document.getElementById('trowel-hint').textContent = 
        `Recommended: ${getTrowelPreset(rec.trowelId).name}`;
    }

    // Calc layout update waste factor
    if (target.id === 'calc-layout') {
      const layout = getLayoutPreset(target.value);
      if (layout) {
        document.getElementById('calc-waste').value = Math.round(layout.wasteFactor * 100);
      }
    }
  }

  /**
   * Handle input events (delegation, debounced)
   */
  function handleInput(e) {
    const target = e.target;
    const roomCard = target.closest('.room-card');

    if (roomCard) {
      const roomId = roomCard.dataset.roomId;

      if (target.classList.contains('room-length-ft')) {
        updateRoomData(roomId, 'lengthFt', parseFloat(target.value) || 0);
      }
      if (target.classList.contains('room-length-in')) {
        updateRoomData(roomId, 'lengthIn', parseFloat(target.value) || 0);
      }
      if (target.classList.contains('room-width-ft')) {
        updateRoomData(roomId, 'widthFt', parseFloat(target.value) || 0);
      }
      if (target.classList.contains('room-width-in')) {
        updateRoomData(roomId, 'widthIn', parseFloat(target.value) || 0);
      }
      if (target.classList.contains('room-height-ft')) {
        updateRoomData(roomId, 'heightFt', parseFloat(target.value) || 0);
      }
      if (target.classList.contains('room-height-in')) {
        updateRoomData(roomId, 'heightIn', parseFloat(target.value) || 0);
      }
      if (target.classList.contains('room-lock-reason-input')) {
        const room = state.rooms.find(r => r.id === roomId);
        if (room) {
          room.lockReason = target.value;
          saveToStorage();
        }
      }

      // Deduction inputs
      const deductionRow = target.closest('.deduction-row');
      if (deductionRow) {
        const index = parseInt(deductionRow.dataset.index);
        const surfaceCard = target.closest('.surface-detail-card');
        if (surfaceCard && !isNaN(index)) {
          const surfaceId = surfaceCard.dataset.surfaceId;
          if (target.classList.contains('deduction-label')) {
            updateDeduction(roomId, surfaceId, index, 'label', target.value);
          }
          if (target.classList.contains('deduction-width')) {
            updateDeduction(roomId, surfaceId, index, 'width', parseFloat(target.value) || 0);
          }
          if (target.classList.contains('deduction-height')) {
            updateDeduction(roomId, surfaceId, index, 'height', parseFloat(target.value) || 0);
          }
        }
      }
    }
  }

  // ============================================
  // BACK TO TOP BUTTON
  // ============================================

  function initBackToTop() {
    const btn = document.querySelector('.back-to-top');
    if (!btn) return;

    let ticking = false;
    
    function updateBackToTop() {
      if (window.scrollY > 400) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateBackToTop);
        ticking = true;
      }
    }, { passive: true });
  }

  // ============================================
  // SMOOTH SCROLL FOR NAV LINKS
  // ============================================

  function initSmoothScroll() {
    document.querySelectorAll('.tools-nav__link').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
          const navHeight = document.querySelector('.tools-nav').offsetHeight;
          const targetPos = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;
          window.scrollTo({
            top: targetPos,
            behavior: 'smooth'
          });
          // Update focus for accessibility
          target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true });
        }
      });
    });
  }

  // ============================================
  // NEW CALCULATORS - COST, SLOPE, WATERPROOF, LABOR
  // ============================================

  /**
   * Cost Estimator Pricing Data (2025 South Jersey)
   */
  const COST_PRICING = {
    projectBase: {
      'shower-only': { budget: 3500, mid: 6500, premium: 12000, luxury: 20000 },
      'tub-shower': { budget: 4000, mid: 7500, premium: 14000, luxury: 25000 },
      'half-bath': { budget: 2500, mid: 5000, premium: 9000, luxury: 15000 },
      'full-bath': { budget: 6000, mid: 12000, premium: 22000, luxury: 40000 },
      'master-bath': { budget: 10000, mid: 20000, premium: 40000, luxury: 75000 },
      'floor-only': { budget: 1500, mid: 3000, premium: 5500, luxury: 9000 },
      'backsplash': { budget: 800, mid: 1500, premium: 3000, luxury: 5500 }
    },
    perSqFt: {
      budget: 8,
      mid: 15,
      premium: 28,
      luxury: 50
    },
    addons: {
      demo: { budget: 300, mid: 500, premium: 800, luxury: 1200 },
      waterproof: { budget: 200, mid: 400, premium: 700, luxury: 1000 },
      plumbing: { budget: 400, mid: 800, premium: 1500, luxury: 3000 },
      electrical: { budget: 300, mid: 600, premium: 1200, luxury: 2000 },
      fixtures: { budget: 200, mid: 500, premium: 1200, luxury: 3000 },
      vanity: { budget: 400, mid: 1000, premium: 2500, luxury: 5000 },
      glass: { budget: 500, mid: 1200, premium: 2500, luxury: 4500 },
      niche: { budget: 150, mid: 300, premium: 600, luxury: 1000 }
    },
    zipAdjustments: {
      '08': 1.05, // Atlantic/Cape May
      '08401': 1.10, // Atlantic City
      '08204': 1.08, // Cape May
      '08742': 1.12, // Point Pleasant
      'default': 1.0
    }
  };

  /**
   * Calculate bathroom remodel cost estimate
   */
  function calculateCostEstimate() {
    const projectType = document.getElementById('cost-project-type')?.value;
    const quality = document.getElementById('cost-quality')?.value || 'mid-range';
    const sqft = parseFloat(document.getElementById('cost-sqft')?.value) || 50;
    const tileArea = parseFloat(document.getElementById('cost-tile-area')?.value) || 100;
    const zip = document.getElementById('cost-zip')?.value || '';

    if (!projectType) {
      showToast('Please select a project type', 'warning');
      return;
    }

    // Map quality level
    const qualityKey = quality === 'mid-range' ? 'mid' : quality;
    
    // Base cost
    const basePrice = COST_PRICING.projectBase[projectType]?.[qualityKey] || 5000;
    
    // Per sq ft addition for tile
    const tileLabor = tileArea * COST_PRICING.perSqFt[qualityKey];
    
    // Add-ons
    let addonsTotal = 0;
    const addonIds = ['demo', 'waterproof', 'plumbing', 'electrical', 'fixtures', 'vanity', 'glass', 'niche'];
    addonIds.forEach(id => {
      const checkbox = document.getElementById(`cost-${id}`);
      if (checkbox?.checked) {
        addonsTotal += COST_PRICING.addons[id]?.[qualityKey] || 0;
      }
    });
    
    // ZIP code adjustment
    let zipMultiplier = 1.0;
    if (zip.length >= 2) {
      const prefix = zip.substring(0, 2);
      zipMultiplier = COST_PRICING.zipAdjustments[zip] || 
                      COST_PRICING.zipAdjustments[prefix] || 
                      COST_PRICING.zipAdjustments['default'];
    }
    
    // Calculate totals
    const subtotal = (basePrice + tileLabor + addonsTotal) * zipMultiplier;
    const contingency = subtotal * 0.10;
    const laborPct = 0.45;
    
    const lowEstimate = Math.round(subtotal * 0.85);
    const highEstimate = Math.round((subtotal + contingency) * 1.15);
    const labor = Math.round(subtotal * laborPct);
    const materials = Math.round(subtotal * 0.35);
    const fixturesCost = Math.round(subtotal * 0.10);
    
    // Update UI
    document.getElementById('cost-result-low').textContent = '$' + formatNumber(lowEstimate);
    document.getElementById('cost-result-high').textContent = '$' + formatNumber(highEstimate);
    document.getElementById('cost-labor').textContent = '$' + formatNumber(labor);
    document.getElementById('cost-materials').textContent = '$' + formatNumber(materials);
    document.getElementById('cost-fixtures').textContent = '$' + formatNumber(fixturesCost);
    document.getElementById('cost-contingency').textContent = '$' + formatNumber(Math.round(contingency));
    
    document.getElementById('cost-calc-results').hidden = false;
  }

  /**
   * Calculate shower slope requirements
   */
  function calculateSlopeRequirements() {
    const distance = parseFloat(document.getElementById('slope-length')?.value) || 3;
    const drainType = document.getElementById('slope-drain-type')?.value || 'center';
    const method = document.getElementById('slope-method')?.value || 'mud-bed';
    
    // IPC requires minimum 1/4" per foot
    const minSlopePerFoot = 0.25;
    const recSlopePerFoot = 0.3125; // 5/16" recommended for better drainage
    
    // Calculate based on drain type
    let effectiveDistance = distance;
    if (drainType === 'linear') {
      effectiveDistance = distance * 0.75; // Linear drains reduce slope distance
    } else if (drainType === 'offset') {
      effectiveDistance = distance * 1.15; // Offset adds complexity
    }
    
    const minHeight = effectiveDistance * minSlopePerFoot;
    const recHeight = effectiveDistance * recSlopePerFoot;
    
    // Format results
    const formatInches = (val) => {
      const inches = Math.floor(val);
      const fraction = val - inches;
      if (fraction < 0.0625) return inches + '"';
      if (fraction < 0.1875) return inches + ' 1/8"';
      if (fraction < 0.3125) return inches + ' 1/4"';
      if (fraction < 0.4375) return inches + ' 3/8"';
      if (fraction < 0.5625) return inches + ' 1/2"';
      if (fraction < 0.6875) return inches + ' 5/8"';
      if (fraction < 0.8125) return inches + ' 3/4"';
      if (fraction < 0.9375) return inches + ' 7/8"';
      return (inches + 1) + '"';
    };
    
    document.getElementById('result-slope-min').textContent = '¼" per ft (' + formatInches(minHeight) + ' at ' + distance + ' ft)';
    document.getElementById('result-slope-rec').textContent = '5/16" per ft (' + formatInches(recHeight) + ' at ' + distance + ' ft)';
    document.getElementById('result-slope-height').textContent = formatInches(recHeight) + ' above drain';
    
    // Method-specific note
    const notes = {
      'mud-bed': 'Traditional mud bed allows precise slope control. Use dry-pack mortar (4:1 sand:cement ratio) reinforced with metal lath.',
      'foam-pan': 'Pre-sloped foam pans are factory-made to code. Verify slope before waterproofing. Faster install, consistent results.',
      'bonded': 'Bonded waterproofing systems (Kerdi, Wedi) require substrate slope. Build slope into substrate before membrane.'
    };
    document.getElementById('slope-method-note').textContent = notes[method] || '';
    
    document.getElementById('slope-calc-results').hidden = false;
  }

  /**
   * Waterproofing system specifications
   */
  const WP_SYSTEMS = {
    'schluter-kerdi': {
      name: 'Schluter KERDI',
      unit: 'roll (54.5 sf)',
      coverage: 54.5,
      tapePerCorner: 2, // feet
      accessories: ['KERDI-BAND', 'KERDI-SEAL', 'KERDI-DRAIN']
    },
    'laticrete': {
      name: 'LATICRETE Hydro Ban',
      unit: 'gallon (covers 50-60 sf)',
      coverage: 55,
      liquidCoats: 2,
      accessories: ['Hydro Ban Board', 'Seam Tape']
    },
    'custom-redgard': {
      name: 'Custom RedGard',
      unit: 'gallon (covers 55 sf @ 2 coats)',
      coverage: 55,
      liquidCoats: 2,
      accessories: ['Mesh Tape', 'Corners']
    },
    'mapei-aquadefense': {
      name: 'Mapei AquaDefense',
      unit: 'gallon (covers 50 sf @ 2 coats)',
      coverage: 50,
      liquidCoats: 2,
      accessories: ['Fabric Tape']
    },
    'go-board': {
      name: 'GoBoard',
      unit: 'panel (3x5 ft = 15 sf)',
      coverage: 15,
      accessories: ['GoBoard Sealant', 'Seam Tape']
    },
    'noble-deck': {
      name: 'Noble Deck',
      unit: 'roll (varies)',
      coverage: 32.5,
      accessories: ['Noble Seal TS', 'Corners']
    }
  };

  /**
   * Calculate waterproofing materials
   */
  function calculateWaterproofing() {
    const systemId = document.getElementById('wp-system')?.value || 'custom-redgard';
    const area = parseFloat(document.getElementById('wp-area')?.value) || 72;
    const corners = parseInt(document.getElementById('wp-corners')?.value) || 4;
    const niches = parseInt(document.getElementById('wp-niches')?.value) || 1;
    
    const system = WP_SYSTEMS[systemId];
    if (!system) return;
    
    // Calculate primary material
    const coverageWithWaste = area * 1.15; // 15% waste
    const unitsNeeded = Math.ceil(coverageWithWaste / system.coverage);
    
    // Tape/seam calculation
    const tapePerCorner = system.tapePerCorner || 2;
    const tapeNeeded = (corners * tapePerCorner) + (niches * 8); // 8 ft per niche
    
    // Update UI
    document.getElementById('wp-membrane-label').textContent = system.liquidCoats ? 'Membrane (liquid)' : 'Membrane';
    document.getElementById('result-wp-membrane').textContent = unitsNeeded + ' ' + system.unit;
    document.getElementById('result-wp-tape').textContent = tapeNeeded + ' linear ft';
    document.getElementById('result-wp-corners').textContent = corners + ' pre-formed corners';
    
    // Accessories list
    const accessoriesHtml = system.accessories.map(a => `<span class="wp-accessory">${a}</span>`).join(', ');
    document.getElementById('wp-accessories').innerHTML = '<strong>Also need:</strong> ' + accessoriesHtml;
    
    // System-specific notes
    const notes = {
      'schluter-kerdi': 'KERDI must be set in unmodified thinset. Use KERDI-BAND for all seams and corners.',
      'laticrete': 'Apply 2 coats with drying time between. Use with Hydro Ban Board for shower niches.',
      'custom-redgard': 'Apply 2 coats at 15 mils wet each. Allow to dry pink to red between coats.',
      'mapei-aquadefense': 'Apply 2 coats. Embed fabric tape in first coat at corners and seams.',
      'go-board': 'Waterproof at joints only. Seal all fastener holes with sealant.',
      'noble-deck': 'Can be used with modified thinset. Great for drains and seats.'
    };
    document.getElementById('wp-system-note').textContent = notes[systemId] || '';
    
    // Add valve/drain/curb if checked
    const extras = [];
    if (document.getElementById('wp-valve')?.checked) extras.push('Mixing valve seal');
    if (document.getElementById('wp-drain')?.checked) extras.push('Drain assembly');
    if (document.getElementById('wp-curb')?.checked) extras.push('Curb membrane');
    
    if (extras.length > 0) {
      document.getElementById('wp-accessories').innerHTML += '<br><strong>Penetrations:</strong> ' + extras.join(', ');
    }
    
    document.getElementById('waterproof-calc-results').hidden = false;
  }

  /**
   * Labor time estimation data
   */
  const LABOR_RATES = {
    // sq ft per hour for tile installation only
    tileInstall: {
      mosaic: 6,
      subway: 15,
      small: 18,
      standard: 25,
      medium: 20,
      large: 15,
      plank: 18
    },
    // Pattern multipliers (1.0 = baseline)
    patternMultiplier: {
      straight: 1.0,
      offset: 1.15,
      diagonal: 1.35,
      herringbone: 1.6,
      versailles: 1.4
    },
    // Surface multipliers
    surfaceMultiplier: {
      floor: 1.0,
      wall: 1.2,
      shower: 1.5,
      backsplash: 1.3
    },
    // Complexity multipliers
    complexityMultiplier: {
      simple: 0.9,
      moderate: 1.0,
      complex: 1.3
    },
    // Prep work hours
    prepHours: {
      demo: 4,
      levelprep: 3,
      waterproof: 2,
      backerboard: 3,
      schluter: 1.5,
      niche: 2.5
    }
  };

  /**
   * Calculate labor time estimate
   */
  function calculateLaborTime() {
    const tileType = document.getElementById('labor-tile-type')?.value;
    const pattern = document.getElementById('labor-pattern')?.value || 'straight';
    const area = parseFloat(document.getElementById('labor-area')?.value) || 100;
    const surface = document.getElementById('labor-surface')?.value || 'floor';
    const complexity = document.getElementById('labor-complexity')?.value || 'moderate';
    
    if (!tileType) {
      showToast('Please select a tile type', 'warning');
      return;
    }
    
    // Base installation rate
    const baseSqFtPerHour = LABOR_RATES.tileInstall[tileType] || 20;
    
    // Apply multipliers
    const patternMult = LABOR_RATES.patternMultiplier[pattern] || 1.0;
    const surfaceMult = LABOR_RATES.surfaceMultiplier[surface] || 1.0;
    const complexMult = LABOR_RATES.complexityMultiplier[complexity] || 1.0;
    
    const effectiveRate = baseSqFtPerHour / (patternMult * surfaceMult * complexMult);
    const tileHours = area / effectiveRate;
    
    // Add grouting time (about 30% of tile time)
    const groutHours = tileHours * 0.3;
    
    // Prep work
    let prepHours = 0;
    const breakdown = [];
    
    const prepItems = ['demo', 'levelprep', 'waterproof', 'backerboard', 'schluter', 'niche'];
    prepItems.forEach(id => {
      const checkbox = document.getElementById(`labor-${id}`);
      if (checkbox?.checked) {
        const hours = LABOR_RATES.prepHours[id] || 0;
        prepHours += hours;
        const labels = {
          demo: 'Demolition',
          levelprep: 'Floor leveling',
          waterproof: 'Waterproofing',
          backerboard: 'Backer board',
          schluter: 'Edge trim',
          niche: 'Niche install'
        };
        breakdown.push({ task: labels[id], hours: hours });
      }
    });
    
    // Add tile and grout to breakdown
    breakdown.push({ task: 'Tile installation', hours: tileHours });
    breakdown.push({ task: 'Grouting & cleanup', hours: groutHours });
    
    const totalHours = prepHours + tileHours + groutHours;
    const workDays = Math.ceil(totalHours / 8);
    
    // Update UI
    document.getElementById('result-labor-days').textContent = workDays;
    document.getElementById('result-labor-detail').textContent = 
      `${formatNumber(totalHours, 1)} total hours at ${formatNumber(effectiveRate, 1)} sq ft/hour`;
    
    // Build breakdown list
    const breakdownHtml = breakdown.map(item => 
      `<div class="labor-breakdown__item">
        <span class="labor-breakdown__task">${item.task}</span>
        <span class="labor-breakdown__hours">${formatNumber(item.hours, 1)} hrs</span>
      </div>`
    ).join('');
    document.getElementById('labor-breakdown-list').innerHTML = breakdownHtml;
    
    document.getElementById('labor-calc-results').hidden = false;
  }

  /**
   * Initialize new calculator event listeners
   */
  function initNewCalculators() {
    // Cost estimator
    document.getElementById('calc-cost-btn')?.addEventListener('click', calculateCostEstimate);
    
    // Slope calculator
    document.getElementById('calc-slope-btn')?.addEventListener('click', calculateSlopeRequirements);
    
    // Waterproofing calculator
    document.getElementById('calc-waterproof-btn')?.addEventListener('click', calculateWaterproofing);
    
    // Labor calculator
    document.getElementById('calc-labor-btn')?.addEventListener('click', calculateLaborTime);
  }

  // ============================================
  // ACTIVE NAV HIGHLIGHTING
  // ============================================

  function initActiveNavHighlight() {
    const sections = document.querySelectorAll('.tools-section[id]');
    const navLinks = document.querySelectorAll('.tools-nav__link');
    
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => {
            link.classList.toggle('is-active', 
              link.getAttribute('href') === `#${entry.target.id}`);
          });
        }
      });
    }, {
      rootMargin: '-20% 0px -70% 0px'
    });

    sections.forEach(section => observer.observe(section));
  }

  // ============================================
  // APP-LIKE COLLAPSIBLE CALCULATOR CARDS
  // ============================================

  function initCollapsibleCards() {
    const calcCards = document.querySelectorAll('.calc-app-card');
    const expandAllBtn = document.getElementById('expand-all-btn');
    const collapseAllBtn = document.getElementById('collapse-all-btn');
    
    if (!calcCards.length) return;

    // Toggle individual card
    calcCards.forEach(card => {
      const header = card.querySelector('.calc-app-card__header');
      if (!header) return;

      header.addEventListener('click', () => toggleCard(card));
      header.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleCard(card);
        }
      });
    });

    // Expand All button
    if (expandAllBtn) {
      expandAllBtn.addEventListener('click', () => {
        calcCards.forEach(card => expandCard(card));
        updateControlsState(true);
      });
    }

    // Collapse All button
    if (collapseAllBtn) {
      collapseAllBtn.addEventListener('click', () => {
        calcCards.forEach(card => collapseCard(card));
        updateControlsState(false);
      });
    }

    // Auto-expand first card on desktop
    if (window.innerWidth >= 900 && calcCards.length > 0) {
      expandCard(calcCards[0]);
    }
  }

  function toggleCard(card) {
    if (card.classList.contains('calc-app-card--expanded')) {
      collapseCard(card);
    } else {
      expandCard(card);
    }
  }

  function expandCard(card) {
    card.classList.add('calc-app-card--expanded');
    const header = card.querySelector('.calc-app-card__header');
    if (header) header.setAttribute('aria-expanded', 'true');
    
    // Trigger resize for any charts/elements inside
    const body = card.querySelector('.calc-app-card__body');
    if (body) {
      body.style.display = 'block';
      // Trigger recalculation of internal layouts
      window.dispatchEvent(new Event('resize'));
    }
  }

  function collapseCard(card) {
    card.classList.remove('calc-app-card--expanded');
    const header = card.querySelector('.calc-app-card__header');
    if (header) header.setAttribute('aria-expanded', 'false');
    
    const body = card.querySelector('.calc-app-card__body');
    if (body) body.style.display = 'none';
  }

  function updateControlsState(allExpanded) {
    const expandAllBtn = document.getElementById('expand-all-btn');
    const collapseAllBtn = document.getElementById('collapse-all-btn');
    
    if (expandAllBtn) {
      expandAllBtn.classList.toggle('calc-controls__btn--active', !allExpanded);
    }
    if (collapseAllBtn) {
      collapseAllBtn.classList.toggle('calc-controls__btn--active', allExpanded);
    }
  }

  // Auto-calculate on input change with debounce
  function initAutoCalculate() {
    const calcCards = document.querySelectorAll('.calc-app-card');
    
    calcCards.forEach(card => {
      const inputs = card.querySelectorAll('input, select');
      const calculatorType = card.dataset.calculator;
      
      inputs.forEach(input => {
        input.addEventListener('change', debounce(() => {
          autoCalculate(calculatorType, card);
        }, 300));
        
        // For number inputs, also listen to input event
        if (input.type === 'number') {
          input.addEventListener('input', debounce(() => {
            autoCalculate(calculatorType, card);
          }, 500));
        }
      });
    });
  }

  function autoCalculate(calculatorType, card) {
    const preview = card.querySelector('.calc-app-card__preview');
    let result = null;
    
    try {
      switch (calculatorType) {
        case 'tile':
          // Trigger tile calculation
          const tileBtn = document.getElementById('calc-tile-btn');
          if (tileBtn) tileBtn.click();
          const tilesResult = document.getElementById('result-boxes');
          if (tilesResult && tilesResult.textContent !== '—') {
            result = tilesResult.textContent + ' boxes';
          }
          break;
          
        case 'mortar':
          const mortarBtn = document.getElementById('calc-mortar-btn');
          if (mortarBtn) mortarBtn.click();
          const mortarResult = document.getElementById('result-mortar-bags');
          if (mortarResult && mortarResult.textContent !== '—') {
            result = mortarResult.textContent + ' bags';
          }
          break;
          
        case 'grout':
          const groutBtn = document.getElementById('calc-grout-btn');
          if (groutBtn) groutBtn.click();
          const groutResult = document.getElementById('result-grout-bags');
          if (groutResult && groutResult.textContent !== '—') {
            result = groutResult.textContent + ' bags';
          }
          break;
          
        case 'leveling':
          const levelBtn = document.getElementById('calc-leveler-btn');
          if (levelBtn) levelBtn.click();
          const levelResult = document.getElementById('result-leveler-bags');
          if (levelResult && levelResult.textContent !== '—') {
            result = levelResult.textContent + ' bags';
          }
          break;
          
        case 'slope':
          const slopeBtn = document.getElementById('calc-slope-btn');
          if (slopeBtn) slopeBtn.click();
          break;
          
        case 'waterproof':
          const wpBtn = document.getElementById('calc-waterproof-btn');
          if (wpBtn) wpBtn.click();
          break;
          
        case 'labor':
          const laborBtn = document.getElementById('calc-labor-btn');
          if (laborBtn) laborBtn.click();
          break;
      }
    } catch (e) {
      console.warn('Auto-calculate error:', e);
    }
    
    // Update preview if we have a result
    if (preview && result) {
      const previewValue = preview.querySelector('.calc-app-card__preview-value');
      const previewEmpty = preview.querySelector('.calc-app-card__preview-empty');
      
      if (previewValue) {
        previewValue.textContent = result;
        previewValue.style.display = 'block';
      } else {
        const valueEl = document.createElement('span');
        valueEl.className = 'calc-app-card__preview-value';
        valueEl.textContent = result;
        if (previewEmpty) {
          previewEmpty.replaceWith(valueEl);
        } else {
          preview.appendChild(valueEl);
        }
      }
      
      if (previewEmpty) previewEmpty.style.display = 'none';
    }
  }

  // Utility: Debounce function
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }


  // ============================================
  // INITIALIZATION
  // ============================================

  function init() {
    // Populate preset dropdowns
    populatePresets();

    // Load saved state
    const hasData = loadFromStorage();
    
    // Render UI from state or create default room
    if (hasData && state.rooms.length > 0) {
      renderFromState();
    } else {
      createRoomCard();
    }

    // Initialize event listeners
    initEventListeners();
    initSmoothScroll();
    initActiveNavHighlight();
    initBackToTop();
    initNewCalculators();
    initCollapsibleCards();
    initAutoCalculate();

    // Initial calculations
    updateAreaSummary();
    showLayoutNudge();
    showJointRecommendation();

    // Initial validation (non-blocking)
    setTimeout(() => {
      updateValidation();
    }, 500);

    // Developer test harness (console only)
    if (typeof window !== 'undefined') {
      window.TillersteadTools = {
        state,
        validateProject,
        calculateTileQuantity,
        calculateMortarBags,
        calculateGrout,
        calculateLeveler,
        getRecommendedTrowel,
        getRecommendedJoint,
        exportJson,
        resetProject
      };
      console.log('Tillerstead Tools loaded. Access via window.TillersteadTools');
    }
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
