/**
 * Labor Estimator Adapter
 * Aggregates data from all calculators to estimate labor time and cost
 * This is the "capstone" adapter that reads from all other state
 * 
 * @module adapters/labor-estimator-adapter
 * @version 1.0.0
 */

(function() {
  'use strict';

  class LaborEstimatorAdapter {
    constructor() {
      this.state = window.ProjectState;
      this.initialized = false;
      this.elements = {};
    }

    init() {
      if (this.initialized) return;
      
      console.log('[LaborAdapter] Initializing...');
      
      this.cacheElements();
      this.restoreFromState();
      this.bindEvents();
      
      this.initialized = true;
      console.log('[LaborAdapter] Ready');
    }

    cacheElements() {
      this.elements = {
        tileType: document.getElementById('labor-tile-type'),
        pattern: document.getElementById('labor-pattern'),
        area: document.getElementById('labor-area'),
        surface: document.getElementById('labor-surface'),
        complexity: document.getElementById('labor-complexity'),
        prepWork: document.getElementById('labor-prep-work'),
        calcButton: document.getElementById('calc-labor-btn'),
        results: document.getElementById('labor-calc-results')
      };
    }

    restoreFromState() {
      if (!this.state) return;
      
      const labor = this.state.get('labor');
      const tile = this.state.get('tile');
      const project = this.state.get('project');
      
      // Auto-populate area from tile calculator
      const tileArea = tile.calculated?.areaWithWaste;
      const roomArea = project.rooms?.reduce((sum, room) => sum + (room.area || 0), 0);
      const area = labor.area || tileArea || roomArea;
      
      if (area && this.elements.area) {
        this.elements.area.value = Math.round(area);
        console.log('[LaborAdapter] Auto-populated area:', area);
      }
      
      // Auto-detect tile type from tile size
      if (!labor.tileType && tile.size.width && tile.size.length && this.elements.tileType) {
        const tileType = this.detectTileType(tile.size.width, tile.size.length);
        this.elements.tileType.value = tileType;
        console.log('[LaborAdapter] Auto-detected tile type:', tileType);
      } else if (labor.tileType && this.elements.tileType) {
        this.elements.tileType.value = labor.tileType;
      }
      
      // Auto-populate pattern from tile state
      if (!labor.pattern && tile.pattern && this.elements.pattern) {
        this.elements.pattern.value = tile.pattern;
      } else if (labor.pattern && this.elements.pattern) {
        this.elements.pattern.value = labor.pattern;
      }
      
      // Restore complexity
      if (labor.complexity && this.elements.complexity) {
        this.elements.complexity.value = labor.complexity;
      }
      
      // Auto-calculate if we have enough data
      if (this.elements.area?.value && this.elements.tileType?.value) {
        setTimeout(() => this.calculate(), 100);
      }
    }

    detectTileType(width, length) {
      const maxSide = Math.max(width, length);
      const minSide = Math.min(width, length);
      const ratio = maxSide / minSide;
      
      // Plank format (length >= 3× width)
      if (ratio >= 3) return 'plank';
      
      // Mosaic
      if (maxSide <= 2) return 'mosaic';
      
      // Subway
      if (width === 3 && length === 6) return 'subway';
      
      // Small
      if (maxSide <= 6) return 'small';
      
      // Large format
      if (maxSide >= 24) return 'large';
      
      // Medium
      if (maxSide >= 18) return 'medium';
      
      // Standard
      return 'standard';
    }

    bindEvents() {
      if (this.elements.calcButton) {
        this.elements.calcButton.addEventListener('click', () => this.calculate());
      }
      
      // Auto-save
      const autoSaveInputs = [
        this.elements.tileType,
        this.elements.pattern,
        this.elements.area,
        this.elements.surface,
        this.elements.complexity
      ].filter(Boolean);
      
      autoSaveInputs.forEach(input => {
        input.addEventListener('change', () => this.saveToState());
      });
      
      // Listen for state changes from other calculators
      if (this.state) {
        this.state.on('change', (data) => {
          // Re-sync when tile data changes
          if (data.path.startsWith('tile.')) {
            this.syncFromTileCalculator();
          }
        });
      }
    }

    syncFromTileCalculator() {
      if (!this.elements.area?.value) {
        const area = this.state.get('tile.calculated.areaWithWaste');
        if (area && this.elements.area) {
          this.elements.area.value = Math.round(area);
        }
      }
      
      if (!this.elements.tileType?.value) {
        const width = this.state.get('tile.size.width');
        const length = this.state.get('tile.size.length');
        if (width && length && this.elements.tileType) {
          this.elements.tileType.value = this.detectTileType(width, length);
        }
      }
      
      if (!this.elements.pattern?.value) {
        const pattern = this.state.get('tile.pattern');
        if (pattern && this.elements.pattern) {
          this.elements.pattern.value = pattern;
        }
      }
    }

    calculate() {
      console.log('[LaborAdapter] Calculating...');
      
      const tileType = this.elements.tileType?.value;
      const pattern = this.elements.pattern?.value || 'straight';
      const area = parseFloat(this.elements.area?.value) || 0;
      const surface = this.elements.surface?.value || 'floor';
      const complexity = this.elements.complexity?.value || 'moderate';
      
      if (!tileType || !area) {
        alert('Please select tile type and enter area');
        return;
      }
      
      // Base installation rates (sq ft per hour)
      const baseRates = {
        mosaic: 15,       // Slow: many small pieces
        subway: 25,       // Moderate-slow
        small: 35,        // Moderate
        standard: 50,     // Fast
        medium: 45,       // Moderate-fast
        large: 35,        // Slower: heavy, need precision
        plank: 30         // Moderate-slow: many cuts
      };
      
      // Pattern multipliers
      const patternMultipliers = {
        straight: 1.0,
        offset: 1.15,
        diagonal: 1.35,
        herringbone: 1.6,
        versailles: 1.7
      };
      
      // Surface multipliers
      const surfaceMultipliers = {
        floor: 1.0,
        wall: 1.25,      // Slower: vertical, gravity
        shower: 1.5,     // Much slower: waterproofing, niches, angles
        backsplash: 1.1  // Slight slower: cuts around outlets
      };
      
      // Complexity multipliers
      const complexityMultipliers = {
        simple: 0.9,
        moderate: 1.0,
        complex: 1.3
      };
      
      // Calculate effective rate
      const baseRate = baseRates[tileType] || 40;
      const effectiveRate = baseRate * 
        (1 / patternMultipliers[pattern]) *
        (1 / surfaceMultipliers[surface]) *
        (1 / complexityMultipliers[complexity]);
      
      // Calculate hours
      const installHours = area / effectiveRate;
      
      // Add prep work hours (from state if calculated)
      const waterproofHours = this.state?.get('waterproofing.calculated.gallons') ? 4 : 0;
      const slopeHours = this.state?.get('slope.calculated.bagsNeeded') ? 6 : 0;
      const levelingHours = this.state?.get('leveling.calculated.bagsNeeded') ? 3 : 0;
      
      const totalHours = installHours + waterproofHours + slopeHours + levelingHours;
      const days = Math.ceil(totalHours / 8);
      
      // Estimate cost (NJ contractor rates: $40-80/hr)
      const hourlyRate = 60; // Mid-range
      const laborCost = Math.round(totalHours * hourlyRate);
      
      const result = {
        installHours: Math.round(installHours * 10) / 10,
        prepHours: waterproofHours + slopeHours + levelingHours,
        totalHours: Math.round(totalHours * 10) / 10,
        days,
        laborCost,
        breakdown: {
          installation: Math.round(installHours * hourlyRate),
          waterproofing: Math.round(waterproofHours * hourlyRate),
          slope: Math.round(slopeHours * hourlyRate),
          leveling: Math.round(levelingHours * hourlyRate)
        }
      };
      
      this.displayResults(result);
      this.saveCalculationToState(result);
      this.updateBudget(result);
      
      console.log('[LaborAdapter] Calculation complete');
    }

    displayResults(result) {
      if (!this.elements.results) return;
      
      this.elements.results.hidden = false;
      
      const resultsGrid = this.elements.results.querySelector('.calc-results__grid');
      if (resultsGrid) {
        let html = `
          <div class="calc-result">
            <span class="calc-result__label">Installation time</span>
            <span class="calc-result__value">${result.installHours} hours</span>
          </div>
          ${result.prepHours > 0 ? `
          <div class="calc-result">
            <span class="calc-result__label">Prep work</span>
            <span class="calc-result__value">${result.prepHours} hours</span>
          </div>
          ` : ''}
          <div class="calc-result">
            <span class="calc-result__label">Total time</span>
            <span class="calc-result__value calc-result__value--highlight">${result.totalHours} hours (${result.days} days)</span>
          </div>
          <div class="calc-result">
            <span class="calc-result__label">Estimated labor cost</span>
            <span class="calc-result__value calc-result__value--highlight">$${result.laborCost.toLocaleString()}</span>
          </div>
        `;
        
        resultsGrid.innerHTML = html;
      }
      
      const noteText = `Professional installation at $60/hr (mid-range NJ rate). ${result.days}-day project based on 8-hour days.`;
      
      const noteEl = this.elements.results.querySelector('.calc-results__note') || 
                      this.elements.results.querySelector('#labor-calc-note');
      if (noteEl) {
        noteEl.textContent = noteText;
      } else {
        const note = document.createElement('p');
        note.className = 'calc-results__note';
        note.id = 'labor-calc-note';
        note.textContent = noteText;
        this.elements.results.appendChild(note);
      }
    }

    updateBudget(result) {
      if (!this.state) return;
      
      // Update budget totals with labor cost
      const materialsCost = this.calculateMaterialsCost();
      const totalCost = materialsCost + result.laborCost;
      
      this.state.set('budget.labor.hours', result.totalHours);
      this.state.set('budget.labor.cost', result.laborCost);
      this.state.set('budget.labor.breakdown', result.breakdown);
      this.state.set('budget.total.materials', materialsCost);
      this.state.set('budget.total.labor', result.laborCost);
      this.state.set('budget.total.estimate', totalCost);
      
      console.log('[LaborAdapter] Budget updated:', { materials: materialsCost, labor: result.laborCost, total: totalCost });
    }

    calculateMaterialsCost() {
      if (!this.state) return 0;
      
      // Rough material cost estimates (NJ market rates)
      let total = 0;
      
      // Tile: assume mid-range $8/sq ft
      const tileArea = this.state.get('tile.calculated.areaWithWaste') || 0;
      total += tileArea * 8;
      
      // Grout: $25/bag
      const groutBags = this.state.get('grout.calculated.bagsNeeded') || 0;
      total += groutBags * 25;
      
      // Mortar: $30/bag
      const mortarBags = this.state.get('mortar.calculated.bagsNeeded') || 0;
      total += mortarBags * 30;
      
      // Waterproofing: varies by system
      const waterproofGallons = this.state.get('waterproofing.calculated.gallons') || 0;
      const waterproofRolls = this.state.get('waterproofing.calculated.rolls') || 0;
      total += waterproofGallons * 45; // Liquid: $45/gal
      total += waterproofRolls * 200;  // Membrane: $200/roll
      
      // Leveling: $40/bag
      const levelingBags = this.state.get('leveling.calculated.bagsNeeded') || 0;
      total += levelingBags * 40;
      
      return Math.round(total);
    }

    saveToState() {
      if (!this.state) return;
      
      const tileType = this.elements.tileType?.value;
      if (tileType) this.state.set('labor.tileType', tileType);
      
      const pattern = this.elements.pattern?.value;
      if (pattern) this.state.set('labor.pattern', pattern);
      
      const area = parseFloat(this.elements.area?.value);
      if (area) this.state.set('labor.area', area);
      
      const complexity = this.elements.complexity?.value;
      if (complexity) this.state.set('labor.complexity', complexity);
      
      console.log('[LaborAdapter] State saved');
    }

    saveCalculationToState(result) {
      if (!this.state) return;
      
      this.state.set('labor.calculated.hours', result.totalHours);
      this.state.set('labor.calculated.days', result.days);
      this.state.set('labor.calculated.cost', result.laborCost);
      this.state.set('labor.calculated.installHours', result.installHours);
      this.state.set('labor.calculated.prepHours', result.prepHours);
      this.state.set('labor.calculated.calculatedAt', new Date().toISOString());
      
      console.log('[LaborAdapter] Calculation saved to state');
    }

    destroy() {
      this.initialized = false;
      this.elements = {};
      console.log('[LaborAdapter] Destroyed');
    }
  }

  window.LaborEstimatorAdapter = LaborEstimatorAdapter;
  
  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (document.getElementById('labor-calculator')) {
        const adapter = new LaborEstimatorAdapter();
        adapter.init();
      }
    });
  } else {
    if (document.getElementById('labor-calculator')) {
      const adapter = new LaborEstimatorAdapter();
      adapter.init();
    }
  }
  
})();
