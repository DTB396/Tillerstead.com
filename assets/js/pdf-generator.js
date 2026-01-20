/**
 * TillerCalc Pro - PDF Generator Module
 * Generates branded PDF summaries for tile projects
 * Uses jsPDF library for PDF generation
 */

(function() {
  'use strict';

  // Debug: Log jsPDF availability on load
  console.log('[TillerPDF] Checking jsPDF availability:', {
    'window.jspdf': typeof window.jspdf,
    'window.jsPDF': typeof window.jsPDF
  });

  // Brand colors
  const COLORS = {
    primary: [26, 61, 46],      // #1a3d2e - Forest green
    gold: [201, 162, 39],       // #c9a227 - Gold accent
    text: [33, 37, 41],         // Dark text
    textMuted: [108, 117, 125], // Muted text
    surface: [248, 249, 250],   // Light gray background
    white: [255, 255, 255],
    border: [206, 212, 218]
  };

  // Company info
  const COMPANY = {
    name: 'TILLERSTEAD LLC',
    tagline: 'Expert Tile Installation',
    license: 'NJ HIC #13VH10808800',
    website: 'tillerstead.com',
    phone: '(609) 500-1555',
    email: 'info@tillerstead.com'
  };

  // Calculator display names
  const CALC_NAMES = {
    tile: 'Tile Quantity',
    mortar: 'Mortar Coverage',
    grout: 'Grout Calculator',
    leveling: 'Self-Leveling Compound',
    slope: 'Shower Slope',
    waterproof: 'Waterproofing',
    labor: 'Labor Estimate'
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
    }

    /**
     * Initialize a new PDF document
     */
    init() {
      // Check if jsPDF is available (UMD exposes as window.jspdf or window.jsPDF)
      const jspdfLib = window.jspdf || window.jsPDF;
      if (!jspdfLib) {
        throw new Error('jsPDF library not loaded');
      }

      // Get the jsPDF constructor (may be the lib itself or a property)
      const jsPDF = jspdfLib.jsPDF || jspdfLib;
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

      // Company name
      doc.setTextColor(...COLORS.white);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text(COMPANY.name, this.margin, 18);

      // Title
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(14);
      doc.text(title, this.margin, 28);

      // License number
      doc.setFontSize(9);
      doc.setTextColor(200, 200, 200);
      doc.text(COMPANY.license, this.margin, 38);

      // Right side - contact info
      doc.setTextColor(...COLORS.white);
      doc.setFontSize(9);
      const rightX = this.pageWidth - this.margin;
      doc.text(COMPANY.website, rightX, 18, { align: 'right' });
      doc.text(COMPANY.phone, rightX, 25, { align: 'right' });
      doc.text(COMPANY.email, rightX, 32, { align: 'right' });

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
      doc.text('Generated by TillerCalc Pro', this.margin, footerY + 7);
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

    // ========================================
    // PUBLIC METHODS - PDF Generation
    // ========================================

    /**
     * Generate full project summary PDF
     */
    generateProjectSummary(project) {
      this.init();

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
    generateMaterialList(project) {
      this.init();

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
     * Generate quick estimate PDF (single calculation)
     */
    generateQuickEstimate(calcId, inputs, results, projectName = 'Quick Estimate') {
      this.init();

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

      this.addDisclaimer();
      this.addFooter(1, 1);

      return this.doc;
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

  // ========================================
  // EXPOSE TO WINDOW
  // ========================================

  window.TillerPDF = {
    Generator: PDFGenerator,

    /**
     * Generate and download project summary
     */
    downloadProjectSummary(project) {
      try {
        const gen = new PDFGenerator();
        gen.generateProjectSummary(project);
        const filename = gen.save('tillerstead-project', project.name);
        return { success: true, filename };
      } catch (err) {
        console.error('PDF generation failed:', err);
        return { success: false, error: err.message };
      }
    },

    /**
     * Generate and download material list
     */
    downloadMaterialList(project) {
      try {
        const gen = new PDFGenerator();
        gen.generateMaterialList(project);
        const filename = gen.save('tillerstead-materials', project.name);
        return { success: true, filename };
      } catch (err) {
        console.error('PDF generation failed:', err);
        return { success: false, error: err.message };
      }
    },

    /**
     * Generate and download quick estimate
     */
    downloadQuickEstimate(calcId, inputs, results, projectName) {
      try {
        const gen = new PDFGenerator();
        gen.generateQuickEstimate(calcId, inputs, results, projectName);
        const filename = gen.save('tillerstead-estimate', projectName || calcId);
        return { success: true, filename };
      } catch (err) {
        console.error('PDF generation failed:', err);
        return { success: false, error: err.message };
      }
    },

    /**
     * Check if PDF generation is available
     */
    isAvailable() {
      return !!(window.jspdf || window.jsPDF);
    }
  };

})();
