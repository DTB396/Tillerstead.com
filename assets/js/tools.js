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
    assumptions: [],
    nudges: [],
    validationErrors: []
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
   */
  function validateProject() {
    const errors = [];

    // Project name required
    if (!state.project.name || !state.project.name.trim()) {
      errors.push({
        field: 'project-name',
        message: 'Project name is required',
        section: 'Project Information'
      });
    }

    // At least one room required
    if (state.rooms.length === 0) {
      errors.push({
        field: 'add-room-btn',
        message: 'Add at least one room',
        section: 'Rooms'
      });
    }

    // Validate each room
    state.rooms.forEach((room, index) => {
      if (!room.name || !room.name.trim()) {
        errors.push({
          field: `room-${room.id}-name`,
          message: `Room ${index + 1}: Name is required`,
          section: 'Rooms'
        });
      }

      // Check if any surface is selected
      const hasSurface = Object.values(room.surfaces || {}).some(s => s.selected);
      if (!hasSurface) {
        errors.push({
          field: `room-${room.id}-surfaces`,
          message: `${room.name || 'Room ' + (index + 1)}: Select at least one surface to tile`,
          section: 'Rooms'
        });
      }

      // If floor selected, need dimensions
      if (room.surfaces?.floor?.selected) {
        const length = toDecimalFeet(room.lengthFt, room.lengthIn);
        const width = toDecimalFeet(room.widthFt, room.widthIn);
        if (length <= 0 || width <= 0) {
          errors.push({
            field: `room-${room.id}-dimensions`,
            message: `${room.name || 'Room ' + (index + 1)}: Enter room dimensions for floor area`,
            section: 'Rooms'
          });
        }
      }
    });

    state.validationErrors = errors;
    return errors;
  }

  /**
   * Show validation errors in UI
   */
  function showValidationErrors(errors) {
    const panel = document.getElementById('needs-attention');
    const list = document.getElementById('needs-attention-list');

    if (errors.length === 0) {
      panel.hidden = true;
      return;
    }

    list.innerHTML = errors.map(err => `
      <li class="needs-attention__item">
        <span class="needs-attention__message">${escapeHtml(err.message)}</span>
        <button type="button" class="needs-attention__jump" data-field="${err.field}">
          Jump to field
        </button>
      </li>
    `).join('');

    panel.hidden = false;

    // Add jump-to-field handlers
    list.querySelectorAll('.needs-attention__jump').forEach(btn => {
      btn.addEventListener('click', () => {
        const fieldId = btn.dataset.field;
        const field = document.getElementById(fieldId) || 
                      document.querySelector(`[data-room-id="${fieldId.replace('room-', '').replace(/-.*/, '')}"]`);
        if (field) {
          field.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const input = field.querySelector('input, select, textarea') || field;
          if (input.focus) {
            setTimeout(() => input.focus(), 300);
          }
          field.classList.add('highlight-field');
          setTimeout(() => field.classList.remove('highlight-field'), 2000);
        }
      });
    });
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
    if (!room.surfaces[surfaceId]) room.surfaces[surfaceId] = { selected: false, area: 0 };

    room.surfaces[surfaceId].selected = selected;

    // Calculate area based on surface type
    const length = toDecimalFeet(room.lengthFt, room.lengthIn);
    const width = toDecimalFeet(room.widthFt, room.widthIn);
    const height = toDecimalFeet(room.heightFt, room.heightIn) || 8; // default 8ft ceiling

    if (surfaceId === 'floor') {
      room.surfaces[surfaceId].area = calculateArea(length, width);
    } else if (surfaceId === 'full-walls') {
      // Perimeter × height
      room.surfaces[surfaceId].area = (length * 2 + width * 2) * height;
    } else if (surfaceId === 'shower-walls') {
      // Estimate: 3 walls at 3ft wide × 8ft high = 72 sq ft (placeholder)
      room.surfaces[surfaceId].area = 72;
    } else if (surfaceId === 'tub-surround') {
      // Estimate: 3 walls at 5ft wide × 6ft high = 90 sq ft (placeholder)
      room.surfaces[surfaceId].area = 60;
    } else if (surfaceId === 'backsplash') {
      // Estimate: 4 linear ft × 18" high = 6 sq ft (placeholder)
      room.surfaces[surfaceId].area = 6;
    }

    updateAreaSummary();
    saveToStorage();
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
      includeDisclaimers: document.getElementById('output-disclaimers').checked
    };

    const text = generateScopeSummary(options);
    const preview = document.getElementById('output-preview');
    const content = document.getElementById('output-content');

    content.innerHTML = `<pre>${escapeHtml(text)}</pre>`;
    preview.hidden = false;
    preview.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
   * Print output
   */
  function printOutput() {
    window.print();
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

    showToast('Downloaded! Open in Word or use Print to PDF.');
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
   * Export state as JSON file
   */
  function exportJson() {
    const data = JSON.stringify(state, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const filename = `${(state.project.name || 'tile-project').replace(/[^a-z0-9]/gi, '-')}-data.json`;
    
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Project exported!');
  }

  /**
   * Import state from JSON file
   */
  function importJson(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
      try {
        const data = JSON.parse(e.target.result);
        
        // Validate required structure
        if (!data.project || !data.rooms) {
          throw new Error('Invalid project file format');
        }

        // Merge with current state
        state = {
          ...state,
          ...data,
          project: { ...state.project, ...data.project },
          defaults: { ...state.defaults, ...data.defaults },
          systems: { ...state.systems, ...data.systems }
        };

        // Re-render UI
        renderFromState();
        saveToStorage();
        showToast('Project imported successfully!');

      } catch (err) {
        showToast('Error: Could not import file. Check format.');
        console.error('Import error:', err);
      }
    };

    reader.onerror = function() {
      showToast('Error: Could not read file.');
    };

    reader.readAsText(file);
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
    const trowelId = document.getElementById('mortar-trowel').value;
    const backButter = document.getElementById('mortar-backbutter').checked;

    if (area <= 0) {
      showToast('Enter a valid area');
      return;
    }

    const tile = getTilePreset(tilePresetId, customWidth, customHeight);
    
    // Get recommended trowel if auto
    let useTrowelId = trowelId;
    const recommendation = getRecommendedTrowel(tile, substrate);
    
    if (trowelId === 'auto' || !trowelId) {
      useTrowelId = recommendation.trowelId;
      
      // Show recommendation
      const recEl = document.getElementById('trowel-recommendation');
      const recText = document.getElementById('trowel-recommendation-text');
      recText.textContent = `${getTrowelPreset(recommendation.trowelId).name}. ${recommendation.note}`;
      recEl.hidden = false;

      // Update back-butter checkbox
      if (recommendation.backButter && !backButter) {
        document.getElementById('mortar-backbutter').checked = true;
      }
    }

    const result = calculateMortarBags(area, useTrowelId, backButter);
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
      substrateNudgeText.textContent = 'Substrate needs flattening. Consider self-leveler or patching before tile installation.';
      substrateNudge.hidden = false;
    } else {
      substrateNudge.hidden = true;
    }

    // Show back-butter nudge for large format
    const bbNudge = document.getElementById('backbutter-nudge');
    if (tile.isLargeFormat && !backButter) {
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
    document.getElementById('print-output-btn').addEventListener('click', printOutput);
    document.getElementById('download-doc-btn').addEventListener('click', downloadDoc);

    // Save/Load buttons
    document.getElementById('save-project-btn').addEventListener('click', () => {
      saveToStorage();
      showToast('Project saved!');
    });
    document.getElementById('reset-project-btn').addEventListener('click', resetProject);
    document.getElementById('export-json-btn').addEventListener('click', exportJson);
    document.getElementById('import-json-input').addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        importJson(e.target.files[0]);
        e.target.value = ''; // Reset for same file
      }
    });

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
          room.locked = target.checked;
          roomCard.querySelector('.room-lock-reason').hidden = true;
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
    }
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
  // MODE TOGGLE (Contractor / Homeowner)
  // ============================================

  function initModeToggle() {
    const modeButtons = document.querySelectorAll('.tools-mode-btn');
    if (!modeButtons.length) return;

    modeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        // Update button states
        modeButtons.forEach(b => {
          b.classList.remove('is-active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('is-active');
        btn.setAttribute('aria-pressed', 'true');

        // Store preference
        const mode = btn.dataset.mode;
        try {
          localStorage.setItem('tillerstead_tools_mode', mode);
        } catch (e) {}

        // Update UI based on mode
        document.body.dataset.toolsMode = mode;
      });
    });

    // Restore saved mode
    try {
      const savedMode = localStorage.getItem('tillerstead_tools_mode');
      if (savedMode) {
        const savedBtn = document.querySelector(`[data-mode="${savedMode}"]`);
        if (savedBtn) savedBtn.click();
      }
    } catch (e) {}
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
    initModeToggle();

    // Initial calculations
    updateAreaSummary();
    showLayoutNudge();
    showJointRecommendation();

    // Developer test harness (console only)
    if (typeof window !== 'undefined') {
      window.TillersteadTools = {
        state,
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
