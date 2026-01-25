/**
 * TillerPro - PDF Generator Module
 * Generates branded PDF summaries for tile projects
 * Uses jsPDF library for PDF generation
 * Integrates with logo-system.js for adaptive branding
 * 
 * @copyright 2025-2026 Tillerstead LLC. All rights reserved.
 * @license Proprietary - Unauthorized copying prohibited
 */

(function() {
  'use strict';

  // ==
  // PROTECTED BRAND CONFIGURATION
  // ==
  
  // Brand colors (encoded for IP protection)
  const _c = [26,61,46,201,162,39,33,37,41,108,117,125,248,249,250,255,255,255,206,212,218];
  const COLORS = {
    primary: _c.slice(0,3),
    gold: _c.slice(3,6),
    text: _c.slice(6,9),
    textMuted: _c.slice(9,12),
    surface: _c.slice(12,15),
    white: _c.slice(15,18),
    border: _c.slice(18,21)
  };

  // Company info (protected)
  const COMPANY = Object.freeze({
    name: 'TILLERSTEAD LLC',
    tagline: 'Expert Tile Installation',
    license: 'NJ HIC #13VH10808800',
    website: 'tillerstead.com',
    phone: '(609) 862-8808',
    email: 'info@tillerstead.com',
    appName: 'TillerPro'
  });

  // ==
  // ADAPTIVE LOGO SYSTEM
  // ==

  /**
   * Get logo for PDF rendering with fallbacks
   * Supports: TillerLogo system, Base64, text fallback
   */
  function getLogo() {
    // Try logo system first (if loaded)
    if (typeof window !== 'undefined' && window.TillerLogo) {
      try {
        const logo = window.TillerLogo.instance.getLogo('pdf');
        if (logo && logo.data) {
          return { data: logo.data, type: logo.format || 'PNG', fallback: logo.fallback };
        }
      } catch (e) {
        // // // // // // // console.warn('[TillerPDF] Logo system error:', e); // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED
      }
    }

    // Fallback to embedded Base64 logo
    return {
      data: LOGO_FALLBACK_BASE64,
      type: 'PNG',
      fallback: getTextLogo()
    };
  }

  /**
   * Get text-only logo as ultimate fallback
   */
  function getTextLogo() {
    return `[${COMPANY.appName}]`;
  }

  // Embedded fallback logo (wolf crest compact - 100x100)
  const LOGO_FALLBACK_BASE64 = 'data:image/png;base64,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';

  // Calculator display names (now includes trim calculators)
  const CALC_NAMES = {
    tile: 'Tile Quantity',
    mortar: 'Mortar Coverage',
    grout: 'Grout Calculator',
    leveling: 'Self-Leveling Compound',
    slope: 'Shower Slope',
    waterproof: 'Waterproofing',
    labor: 'Labor Estimate',
    crown: 'Crown Molding',
    baseboard: 'Baseboard & Chair Rail',
    quarter: 'Quarter Round'
  };

  /**
   * PDF Generator Class
   */
  class PDFGenerator {
    constructor() {
      this.doc = null;
      this.pageWidth = 0;
      this.pageHeight = 0;
      this.margin = 20;
      this.y = 0;
      this._jsPDFConstructor = null;
    }

    /**
     * Initialize a new PDF document
     * @returns {Promise<void>}
     */
    async init() {
      // Wait for jsPDF to be ready (async loader in tools.html)
      if (window._jsPDFReady) {
        try {
          await window._jsPDFReady;
        } catch (e) {
          console.error('[TillerPro PDF] jsPDF load promise rejected:', e);
        }
      }

      // Check if jsPDF is available (UMD exposes as window.jspdf or window.jsPDF)
      const jspdfLib = window.jsPDF || window.jspdf;
      if (!jspdfLib) {
        throw new Error('jsPDF library not loaded. Please refresh the page.');
      }

      // Get the jsPDF constructor (may be the lib itself or a property)
      const jsPDF = jspdfLib.jsPDF || jspdfLib;
      this._jsPDFConstructor = jsPDF;
      
      this.doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'letter'
      });

      this.pageWidth = this.doc.internal.pageSize.getWidth();
      this.pageHeight = this.doc.internal.pageSize.getHeight();
      this.y = this.margin;
    }

    /**
     * Add header with logo and company info
     */
    addHeader(title = 'Project Estimate') {
      const doc = this.doc;
      const contentWidth = this.pageWidth - (this.margin * 2);

      // Header background
      doc.setFillColor(...COLORS.primary);
      doc.rect(0, 0, this.pageWidth, 45, 'F');

      // Gold accent line
      doc.setFillColor(...COLORS.gold);
      doc.rect(0, 45, this.pageWidth, 2, 'F');

      // Add Wolf Crest Logo (left side)
      try {
        doc.addImage(LOGO_BASE64, 'PNG', this.margin, 5, 35, 35);
      } catch (e) {
        // // // // // // // console.warn('Could not add logo to PDF:', e); // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED
      }

      // Company name (offset to right of logo)
      const textStartX = this.margin + 40;
      doc.setTextColor(...COLORS.white);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text(COMPANY.name, textStartX, 16);

      // Title
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.text(title, textStartX, 26);

      // License number
      doc.setFontSize(9);
      doc.setTextColor(200, 200, 200);
      doc.text(COMPANY.license, textStartX, 36);

      // Right side - contact info
      doc.setTextColor(...COLORS.white);
      doc.setFontSize(9);
      const rightX = this.pageWidth - this.margin;
      doc.text(COMPANY.website, rightX, 16, { align: 'right' });
      doc.text(COMPANY.phone, rightX, 23, { align: 'right' });
      doc.text(COMPANY.email, rightX, 30, { align: 'right' });

      this.y = 55;
    }

    /**
     * Add project info section
     */
    addProjectInfo(project) {
      const doc = this.doc;
      const contentWidth = this.pageWidth - (this.margin * 2);

      // Section background
      doc.setFillColor(...COLORS.surface);
      doc.rect(this.margin, this.y, contentWidth, 25, 'F');

      doc.setTextColor(...COLORS.text);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('Project:', this.margin + 5, this.y + 8);

      doc.setFont('helvetica', 'normal');
      doc.text(project.name || 'Untitled Project', this.margin + 28, this.y + 8);

      doc.setFontSize(9);
      doc.setTextColor(...COLORS.textMuted);
      doc.text(`Date: ${new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`, this.margin + 5, this.y + 16);

      if (project.clientName) {
        doc.text(`Client: ${project.clientName}`, this.margin + 5, this.y + 22);
      }

      this.y += 32;
    }

    /**
     * Add a section title
     */
    addSectionTitle(title) {
      const doc = this.doc;

      // Check if we need a new page
      if (this.y > this.pageHeight - 60) {
        this.addNewPage();
      }

      doc.setFillColor(...COLORS.primary);
      doc.rect(this.margin, this.y, this.pageWidth - (this.margin * 2), 8, 'F');

      doc.setTextColor(...COLORS.white);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(title, this.margin + 3, this.y + 5.5);

      this.y += 12;
    }

    /**
     * Add material list table
     */
    addMaterialTable(materials) {
      const doc = this.doc;

      if (!materials || materials.length === 0) {
        doc.setTextColor(...COLORS.textMuted);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.text('No materials calculated', this.margin, this.y + 5);
        this.y += 12;
        return;
      }

      // Check if autoTable is available
      if (typeof doc.autoTable === 'function') {
        doc.autoTable({
          startY: this.y,
          head: [['Material', 'Specification', 'Quantity']],
          body: materials.map(m => [m.name, m.spec || '—', m.quantity]),
          margin: { left: this.margin, right: this.margin },
          headStyles: {
            fillColor: COLORS.primary,
            textColor: COLORS.white,
            fontStyle: 'bold',
            fontSize: 9
          },
          bodyStyles: {
            textColor: COLORS.text,
            fontSize: 9
          },
          alternateRowStyles: {
            fillColor: COLORS.surface
          },
          columnStyles: {
            0: { cellWidth: 50 },
            1: { cellWidth: 70 },
            2: { cellWidth: 40, halign: 'right', fontStyle: 'bold' }
          }
        });
        this.y = doc.lastAutoTable.finalY + 8;
      } else {
        // Fallback without autoTable
        this.addSimpleTable(materials);
      }
    }

    /**
     * Simple table fallback without autoTable plugin
     */
    addSimpleTable(materials) {
      const doc = this.doc;
      const startX = this.margin;
      const colWidths = [50, 70, 40];
      const rowHeight = 7;

      // Header
      doc.setFillColor(...COLORS.primary);
      doc.rect(startX, this.y, colWidths.reduce((a, b) => a + b, 0), rowHeight, 'F');
      doc.setTextColor(...COLORS.white);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('Material', startX + 2, this.y + 5);
      doc.text('Specification', startX + colWidths[0] + 2, this.y + 5);
      doc.text('Quantity', startX + colWidths[0] + colWidths[1] + 2, this.y + 5);
      this.y += rowHeight;

      // Rows
      doc.setTextColor(...COLORS.text);
      materials.forEach((m, i) => {
        if (i % 2 === 0) {
          doc.setFillColor(...COLORS.surface);
          doc.rect(startX, this.y, colWidths.reduce((a, b) => a + b, 0), rowHeight, 'F');
        }
        doc.setFont('helvetica', 'normal');
        doc.text(m.name, startX + 2, this.y + 5);
        doc.text(m.spec || '—', startX + colWidths[0] + 2, this.y + 5);
        doc.setFont('helvetica', 'bold');
        doc.text(m.quantity, startX + colWidths[0] + colWidths[1] + 2, this.y + 5);
        this.y += rowHeight;
      });

      this.y += 5;
    }

    /**
     * Add calculation details
     */
    addCalculationDetails(calcId, inputs, results) {
      const doc = this.doc;

      if (this.y > this.pageHeight - 80) {
        this.addNewPage();
      }

      const calcName = CALC_NAMES[calcId] || calcId;

      // Subsection header
      doc.setFillColor(...COLORS.gold);
      doc.rect(this.margin, this.y, 3, 6, 'F');
      doc.setTextColor(...COLORS.text);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(calcName, this.margin + 6, this.y + 5);
      this.y += 10;

      // Input details
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.textMuted);

      const inputLabels = this.getInputLabels(calcId);
      const inputLines = [];

      Object.entries(inputs).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          const label = inputLabels[key] || this.formatLabel(key);
          inputLines.push(`${label}: ${this.formatValue(key, value)}`);
        }
      });

      // Display inputs in two columns
      const midPoint = Math.ceil(inputLines.length / 2);
      const col1 = inputLines.slice(0, midPoint);
      const col2 = inputLines.slice(midPoint);

      const lineHeight = 5;
      const startY = this.y;

      col1.forEach((line, i) => {
        doc.text(line, this.margin + 5, this.y);
        this.y += lineHeight;
      });

      this.y = startY;
      col2.forEach((line, i) => {
        doc.text(line, this.margin + 90, this.y);
        this.y += lineHeight;
      });

      this.y = startY + (Math.max(col1.length, col2.length) * lineHeight) + 3;

      // Results
      if (results) {
        doc.setTextColor(...COLORS.primary);
        doc.setFont('helvetica', 'bold');

        const resultLabels = this.getResultLabels(calcId);
        Object.entries(results).forEach(([key, value]) => {
          if (value !== null && value !== undefined && key !== 'note') {
            const label = resultLabels[key] || this.formatLabel(key);
            doc.text(`→ ${label}: ${value}`, this.margin + 5, this.y);
            this.y += 5;
          }
        });

        if (results.note) {
          doc.setTextColor(...COLORS.textMuted);
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(8);
          doc.text(`Note: ${results.note}`, this.margin + 5, this.y + 2);
          this.y += 6;
        }
      }

      this.y += 5;
    }

    /**
     * Add footer with compliance badge
     */
    addFooter(pageNum = 1, totalPages = 1) {
      const doc = this.doc;
      const footerY = this.pageHeight - 20;

      // Compliance badge area
      doc.setFillColor(...COLORS.surface);
      doc.rect(0, footerY - 5, this.pageWidth, 25, 'F');

      // Gold accent line
      doc.setFillColor(...COLORS.gold);
      doc.rect(0, footerY - 5, this.pageWidth, 1, 'F');

      // TCNA compliance badge
      doc.setTextColor(...COLORS.primary);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('TCNA 2024 Compliant Calculations', this.margin, footerY + 2);

      // Generated by
      doc.setTextColor(...COLORS.textMuted);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text('Generated by TillerPro', this.margin, footerY + 7);
      doc.text(`${COMPANY.website} | ${COMPANY.phone}`, this.margin, footerY + 11);

      // Page number
      doc.text(`Page ${pageNum} of ${totalPages}`, this.pageWidth - this.margin, footerY + 7, { align: 'right' });

      // Timestamp
      doc.setFontSize(6);
      doc.text(
        `Generated: ${new Date().toLocaleString()}`,
        this.pageWidth - this.margin,
        footerY + 11,
        { align: 'right' }
      );
    }

    /**
     * Add disclaimer section before footer
     */
    addDisclaimer() {
      const doc = this.doc;
      const disclaimerY = this.pageHeight - 45;
      const contentWidth = this.pageWidth - (this.margin * 2);

      // Check if we need a new page
      if (this.y > disclaimerY - 10) {
        this.addNewPage();
      }

      // Disclaimer box
      doc.setDrawColor(...COLORS.border);
      doc.setFillColor(255, 252, 245); // Light cream/yellow tint
      doc.roundedRect(this.margin, disclaimerY, contentWidth, 20, 2, 2, 'FD');

      // Disclaimer text
      doc.setTextColor(...COLORS.textMuted);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7);
      
      const disclaimerText = [
        'DISCLAIMER: This estimate is for planning purposes only and does not constitute a binding quote.',
        'Actual material quantities may vary based on site conditions, tile breakage, pattern complexity, and cutting waste.',
        'Final pricing requires on-site measurement. Contact Tillerstead LLC for a professional consultation and formal quote.'
      ];
      
      let textY = disclaimerY + 5;
      disclaimerText.forEach(line => {
        doc.text(line, this.margin + 3, textY);
        textY += 4;
      });

      // NJ Consumer Affairs note
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.text('NJ Home Improvement Contractor Lic. #13VH10808800 | Consumer Affairs: 1-800-242-5846', 
        this.pageWidth / 2, disclaimerY + 18, { align: 'center' });
    }

    /**
     * Add a new page
     */
    addNewPage() {
      this.doc.addPage();
      this.y = this.margin;

      // Mini header on continuation pages
      const doc = this.doc;
      doc.setFillColor(...COLORS.primary);
      doc.rect(0, 0, this.pageWidth, 15, 'F');
      doc.setTextColor(...COLORS.white);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(COMPANY.name, this.margin, 10);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('(continued)', this.pageWidth - this.margin, 10, { align: 'right' });

      this.y = 22;
    }

    /**
     * Get friendly input labels for each calculator
     */
    getInputLabels(calcId) {
      const labels = {
        tile: {
          area: 'Total Area',
          tileSize: 'Tile Size',
          layout: 'Layout Pattern',
          waste: 'Waste Factor',
          tilesPerBox: 'Tiles/Box',
          sqftPerBox: 'Sq.Ft./Box',
          atticStock: 'Attic Stock'
        },
        mortar: {
          area: 'Coverage Area',
          trowelSize: 'Trowel Size',
          backButter: 'Back Butter',
          substrate: 'Substrate Type',
          bagSize: 'Bag Size'
        },
        grout: {
          area: 'Total Area',
          tileWidth: 'Tile Width',
          tileHeight: 'Tile Height',
          jointWidth: 'Joint Width',
          jointDepth: 'Joint Depth',
          groutType: 'Grout Type'
        },
        leveling: {
          area: 'Floor Area',
          avgDepth: 'Average Depth',
          productType: 'Product Type'
        },
        slope: {
          drainDistance: 'Drain Distance',
          slopeRatio: 'Slope Ratio'
        },
        waterproof: {
          area: 'Total Area',
          coats: 'Number of Coats',
          membraneType: 'Membrane Type'
        },
        labor: {
          area: 'Project Area',
          complexity: 'Complexity',
          tileSize: 'Tile Size',
          crew: 'Crew Size'
        }
      };
      return labels[calcId] || {};
    }

    /**
     * Get friendly result labels
     */
    getResultLabels(calcId) {
      const labels = {
        tile: {
          tilesNeeded: 'Tiles Needed',
          boxesNeeded: 'Boxes Required',
          totalSqFt: 'Total Coverage'
        },
        mortar: {
          bagsNeeded: 'Bags Required',
          coverage: 'Coverage Rate'
        },
        grout: {
          bagsNeeded: 'Bags Required',
          lbs: 'Total Weight'
        },
        leveling: {
          bagsNeeded: 'Bags Required',
          volume: 'Total Volume'
        },
        slope: {
          height: 'Height at Wall',
          mudDepth: 'Mud Depth'
        },
        waterproof: {
          gallons: 'Gallons Needed',
          buckets: 'Buckets Required'
        },
        labor: {
          hours: 'Estimated Hours',
          days: 'Work Days'
        }
      };
      return labels[calcId] || {};
    }

    /**
     * Format a camelCase key to Title Case
     */
    formatLabel(key) {
      return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();
    }

    /**
     * Format value based on key type
     */
    formatValue(key, value) {
      if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
      }
      if (key.toLowerCase().includes('area') && typeof value === 'number') {
        return `${value} sq ft`;
      }
      if (key.toLowerCase().includes('depth') && typeof value === 'number') {
        return `${value}"`;
      }
      return String(value);
    }

    /**
     * Extract materials from project calculations
     */
    extractMaterials(project) {
      const materials = [];

      if (!project.calculations) return materials;

      Object.entries(project.calculations).forEach(([calcId, data]) => {
        const results = data.results || {};
        const inputs = data.inputs || {};

        switch (calcId) {
          case 'tile':
            if (results.boxesNeeded) {
              materials.push({
                name: 'Tile',
                spec: inputs.tileSize || 'Custom',
                quantity: `${results.boxesNeeded} boxes`
              });
            }
            break;
          case 'mortar':
            if (results.bagsNeeded) {
              materials.push({
                name: 'Thin-Set Mortar',
                spec: inputs.mortarType || 'Modified',
                quantity: `${results.bagsNeeded} bags`
              });
            }
            break;
          case 'grout':
            if (results.bagsNeeded) {
              materials.push({
                name: 'Grout',
                spec: inputs.groutType || 'Sanded',
                quantity: `${results.bagsNeeded} bags`
              });
            }
            break;
          case 'leveling':
            if (results.bagsNeeded) {
              materials.push({
                name: 'Self-Leveling Compound',
                spec: inputs.productType || 'Standard',
                quantity: `${results.bagsNeeded} bags`
              });
            }
            break;
          case 'waterproof':
            if (results.gallons || results.buckets) {
              materials.push({
                name: 'Waterproofing Membrane',
                spec: inputs.membraneType || 'Liquid',
                quantity: results.buckets ? `${results.buckets} buckets` : `${results.gallons} gal`
              });
            }
            break;
        }
      });

      return materials;
    }

    // =====
    // PUBLIC METHODS - PDF Generation
    // =====

    /**
     * Generate full project summary PDF
     */
    async generateProjectSummary(project) {
      await this.init();

      this.addHeader('Project Summary');
      this.addProjectInfo(project);

      // Materials section
      const materials = this.extractMaterials(project);
      if (materials.length > 0) {
        this.addSectionTitle('MATERIAL SUMMARY');
        this.addMaterialTable(materials);
      }

      // Calculation details
      if (project.calculations && Object.keys(project.calculations).length > 0) {
        this.addSectionTitle('CALCULATION DETAILS');
        Object.entries(project.calculations).forEach(([calcId, data]) => {
          this.addCalculationDetails(calcId, data.inputs || {}, data.results || null);
        });
      }

      // Notes
      if (project.notes) {
        this.addSectionTitle('PROJECT NOTES');
        this.doc.setTextColor(...COLORS.text);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setFontSize(9);

        const lines = this.doc.splitTextToSize(project.notes, this.pageWidth - (this.margin * 2) - 10);
        lines.forEach(line => {
          if (this.y > this.pageHeight - 40) {
            this.addNewPage();
          }
          this.doc.text(line, this.margin + 5, this.y);
          this.y += 5;
        });
      }

      // Add disclaimer on last page
      this.addDisclaimer();

      // Add footer to all pages
      const totalPages = this.doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        this.doc.setPage(i);
        this.addFooter(i, totalPages);
      }

      return this.doc;
    }

    /**
     * Generate material list PDF
     */
    async generateMaterialList(project) {
      await this.init();

      this.addHeader('Material List');
      this.addProjectInfo(project);

      const materials = this.extractMaterials(project);

      this.addSectionTitle('MATERIALS REQUIRED');
      this.addMaterialTable(materials);

      // Shopping notes
      this.y += 10;
      this.doc.setTextColor(...COLORS.textMuted);
      this.doc.setFont('helvetica', 'italic');
      this.doc.setFontSize(8);
      this.doc.text('Note: Quantities include calculated waste factors. Verify availability before purchase.', this.margin, this.y);

      this.addDisclaimer();
      this.addFooter(1, 1);

      return this.doc;
    }

    /**
     * Generate quick estimate PDF (single calculation) with optional shopping list
     */
    async generateQuickEstimate(calcId, inputs, results, projectName = 'Quick Estimate', shoppingList = []) {
      await this.init();

      this.addHeader('Quick Estimate');

      // Simple project info
      const doc = this.doc;
      doc.setFillColor(...COLORS.surface);
      doc.rect(this.margin, this.y, this.pageWidth - (this.margin * 2), 15, 'F');

      doc.setTextColor(...COLORS.text);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(projectName, this.margin + 5, this.y + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.textMuted);
      doc.text(new Date().toLocaleDateString(), this.margin + 5, this.y + 12);

      this.y += 22;

      // Calculation
      const calcName = CALC_NAMES[calcId] || calcId;
      this.addSectionTitle(calcName.toUpperCase());
      this.addCalculationDetails(calcId, inputs, results);

      // Extract single material
      const materials = [];
      if (calcId === 'tile' && results.boxesNeeded) {
        materials.push({
          name: 'Tile',
          spec: inputs.tileSize || 'Custom',
          quantity: `${results.boxesNeeded} boxes`
        });
      } else if (calcId === 'mortar' && results.bagsNeeded) {
        materials.push({
          name: 'Mortar',
          spec: inputs.mortarType || 'Modified',
          quantity: `${results.bagsNeeded} bags`
        });
      } else if (calcId === 'grout' && results.bagsNeeded) {
        materials.push({
          name: 'Grout',
          spec: inputs.groutType || 'Sanded',
          quantity: `${results.bagsNeeded} bags`
        });
      }

      if (materials.length > 0) {
        this.addSectionTitle('MATERIAL NEEDED');
        this.addMaterialTable(materials);
      }

      // Add shopping list summary if available
      if (shoppingList && shoppingList.length > 0) {
        this.addSectionTitle('SHOPPING LIST SUMMARY');
        this.addShoppingListTable(shoppingList);
      }

      this.addDisclaimer();
      this.addFooter(1, 1);

      return this.doc;
    }

    /**
     * Add shopping list table to PDF
     */
    addShoppingListTable(shoppingList) {
      const doc = this.doc;

      if (!shoppingList || shoppingList.length === 0) {
        doc.setTextColor(...COLORS.textMuted);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.text('No items in shopping list', this.margin, this.y + 5);
        this.y += 12;
        return;
      }

      // Check if autoTable is available
      if (typeof doc.autoTable === 'function') {
        doc.autoTable({
          startY: this.y,
          head: [['Item', 'Quantity', 'Unit', 'Source']],
          body: shoppingList.map(item => [
            item.item,
            item.quantity,
            item.unit || '',
            this.formatCalcSource(item.source)
          ]),
          margin: { left: this.margin, right: this.margin },
          headStyles: {
            fillColor: COLORS.gold,
            textColor: [33, 37, 41],
            fontStyle: 'bold',
            fontSize: 9
          },
          bodyStyles: {
            textColor: COLORS.text,
            fontSize: 9
          },
          alternateRowStyles: {
            fillColor: COLORS.surface
          },
          columnStyles: {
            0: { cellWidth: 55 },
            1: { cellWidth: 25, halign: 'right', fontStyle: 'bold' },
            2: { cellWidth: 35 },
            3: { cellWidth: 40, fontStyle: 'italic' }
          }
        });
        this.y = doc.lastAutoTable.finalY + 8;
      } else {
        // Fallback without autoTable
        this.addSimpleShoppingTable(shoppingList);
      }
    }

    /**
     * Simple shopping list table fallback without autoTable plugin
     */
    addSimpleShoppingTable(shoppingList) {
      const doc = this.doc;
      const startX = this.margin;
      const colWidths = [55, 25, 35, 40];
      const rowHeight = 7;

      // Header
      doc.setFillColor(...COLORS.gold);
      doc.rect(startX, this.y, colWidths.reduce((a, b) => a + b, 0), rowHeight, 'F');
      doc.setTextColor(33, 37, 41);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('Item', startX + 2, this.y + 5);
      doc.text('Qty', startX + colWidths[0] + 2, this.y + 5);
      doc.text('Unit', startX + colWidths[0] + colWidths[1] + 2, this.y + 5);
      doc.text('Source', startX + colWidths[0] + colWidths[1] + colWidths[2] + 2, this.y + 5);
      this.y += rowHeight;

      // Rows
      doc.setTextColor(...COLORS.text);
      shoppingList.forEach((item, i) => {
        if (i % 2 === 0) {
          doc.setFillColor(...COLORS.surface);
          doc.rect(startX, this.y, colWidths.reduce((a, b) => a + b, 0), rowHeight, 'F');
        }
        doc.setFont('helvetica', 'normal');
        doc.text(String(item.item || ''), startX + 2, this.y + 5);
        doc.setFont('helvetica', 'bold');
        doc.text(String(item.quantity || ''), startX + colWidths[0] + 2, this.y + 5);
        doc.setFont('helvetica', 'normal');
        doc.text(String(item.unit || ''), startX + colWidths[0] + colWidths[1] + 2, this.y + 5);
        doc.setFont('helvetica', 'italic');
        doc.text(this.formatCalcSource(item.source), startX + colWidths[0] + colWidths[1] + colWidths[2] + 2, this.y + 5);
        this.y += rowHeight;
      });

      this.y += 5;
    }

    /**
     * Format calculator source for display
     */
    formatCalcSource(source) {
      const sourceMap = {
        tile: 'Tile Calc',
        mortar: 'Mortar Calc',
        grout: 'Grout Calc',
        leveling: 'Leveling Calc',
        waterproof: 'Waterproof Calc',
        sealant: 'Sealant Calc',
        sealer: 'Sealer Calc'
      };
      return sourceMap[source] || source || '';
    }

    /**
     * Save the PDF with auto-generated filename
     */
    save(prefix = 'tillerstead', projectName = '') {
      const sanitizedName = projectName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 30);

      const date = new Date().toISOString().slice(0, 10);
      const filename = sanitizedName
        ? `${prefix}-${sanitizedName}-${date}.pdf`
        : `${prefix}-estimate-${date}.pdf`;

      this.doc.save(filename);
      return filename;
    }

    /**
     * Get PDF as blob for other uses
     */
    getBlob() {
      return this.doc.output('blob');
    }

    /**
     * Get PDF as data URI
     */
    getDataUri() {
      return this.doc.output('datauristring');
    }
  }

  // =====
  // EXPOSE TO WINDOW
  // =====

  window.TillerPDF = {
    Generator: PDFGenerator,

    /**
     * Generate and download project summary
     */
    async downloadProjectSummary(project) {
      try {
        const gen = new PDFGenerator();
        await gen.generateProjectSummary(project);
        const filename = gen.save('tillerpro-project', project.name);
        return { success: true, filename };
      } catch (err) {
        console.error('[TillerPro PDF] Generation failed:', err);
        return { success: false, error: err.message };
      }
    },

    /**
     * Generate and download material list
     */
    async downloadMaterialList(project) {
      try {
        const gen = new PDFGenerator();
        await gen.generateMaterialList(project);
        const filename = gen.save('tillerpro-materials', project.name);
        return { success: true, filename };
      } catch (err) {
        console.error('[TillerPro PDF] Generation failed:', err);
        return { success: false, error: err.message };
      }
    },

    /**
     * Generate and download quick estimate
     */
    async downloadQuickEstimate(calcId, inputs, results, projectName, shoppingList = []) {
      try {
        const gen = new PDFGenerator();
        await gen.generateQuickEstimate(calcId, inputs, results, projectName, shoppingList);
        const filename = gen.save('tillerpro-estimate', projectName || calcId);
        return { success: true, filename };
      } catch (err) {
        console.error('[TillerPro PDF] Generation failed:', err);
        return { success: false, error: err.message };
      }
    },

    /**
     * Check if PDF generation is available
     */
    isAvailable() {
      return !!(window.jsPDF || window.jspdf);
    },

    /**
     * Check if library will be available (waits for async load)
     */
    async waitForLibrary(timeout = 5000) {
      if (this.isAvailable()) return true;
      if (window._jsPDFReady) {
        try {
          await Promise.race([
            window._jsPDFReady,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), timeout))
          ]);
          return this.isAvailable();
        } catch {
          return false;
        }
      }
      return false;
    }
  };

})();
