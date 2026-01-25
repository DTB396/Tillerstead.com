/**
 * Premium Quote System with Photo Upload & PDF Generation
 * Allows customers to upload photos, get detailed quotes, and receive PDF estimates
 */

(function() {
  'use strict';

  // ==
  // PREMIUM QUOTE SYSTEM
  // ==

  class PremiumQuoteSystem {
    constructor() {
      this.photos = [];
      this.quoteData = {
        customer: {},
        project: {},
        areas: [],
        materials: [],
        timeline: null,
        total: 0
      };
      this.init();
    }

    init() {
      this.setupPhotoUpload();
      this.setupMultiAreaQuote();
      this.setupPDFGeneration();
      this.setupEmailQuote();
      this.setupQuoteSaveLoad();
    }

    // Photo Upload System
    setupPhotoUpload() {
      const uploadZone = document.getElementById('quote-photo-upload');
      if (!uploadZone) return;

      // Drag and drop
      uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('drag-over');
      });

      uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('drag-over');
      });

      uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('drag-over');
        this.handleFiles(e.dataTransfer.files);
      });

      // Click to upload
      const fileInput = document.getElementById('photo-files');
      if (fileInput) {
        fileInput.addEventListener('change', (e) => {
          this.handleFiles(e.target.files);
        });
      }
    }

    handleFiles(files) {
      const maxFiles = 10;
      const maxSize = 5 * 1024 * 1024; // 5MB per file

      Array.from(files).forEach((file, index) => {
        if (this.photos.length >= maxFiles) {
          this.showToast('Maximum 10 photos allowed', 'warning');
          return;
        }

        if (file.size > maxSize) {
          this.showToast(`${file.name} is too large (max 5MB)`, 'error');
          return;
        }

        if (!file.type.startsWith('image/')) {
          this.showToast(`${file.name} is not an image`, 'error');
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          const photo = {
            id: Date.now() + index,
            name: file.name,
            data: e.target.result,
            notes: ''
          };
          this.photos.push(photo);
          this.renderPhotoGallery();
        };
        reader.readAsDataURL(file);
      });
    }

    renderPhotoGallery() {
      const gallery = document.getElementById('photo-gallery');
      if (!gallery) return;

      gallery.innerHTML = this.photos.map(photo => `
        <div class="photo-item" data-photo-id="${photo.id}">
          <img src="${photo.data}" alt="${photo.name}">
          <div class="photo-overlay">
            <button class="btn-icon" onclick="quoteSystem.removePhoto(${photo.id})">
              <span>🗑️</span>
            </button>
            <button class="btn-icon" onclick="quoteSystem.addPhotoNote(${photo.id})">
              <span>📝</span>
            </button>
          </div>
          ${photo.notes ? `<p class="photo-note">${photo.notes}</p>` : ''}
        </div>
      `).join('');
    }

    removePhoto(photoId) {
      this.photos = this.photos.filter(p => p.id !== photoId);
      this.renderPhotoGallery();
    }

    addPhotoNote(photoId) {
      const photo = this.photos.find(p => p.id === photoId);
      if (!photo) return;

      const note = prompt('Add a note for this photo:', photo.notes);
      if (note !== null) {
        photo.notes = note;
        this.renderPhotoGallery();
      }
    }

    // Multi-Area Quote Builder
    setupMultiAreaQuote() {
      const addAreaBtn = document.getElementById('add-quote-area');
      if (addAreaBtn) {
        addAreaBtn.addEventListener('click', () => this.addProjectArea());
      }
    }

    addProjectArea() {
      const area = {
        id: Date.now(),
        name: '',
        sqft: 0,
        material: '',
        labor: 0,
        materials: 0,
        subtotal: 0
      };

      this.quoteData.areas.push(area);
      this.renderProjectAreas();
    }

    renderProjectAreas() {
      const container = document.getElementById('project-areas');
      if (!container) return;

      container.innerHTML = this.quoteData.areas.map((area, index) => `
        <div class="quote-area-card" data-area-id="${area.id}">
          <div class="area-header">
            <h4>Area ${index + 1}</h4>
            <button class="btn-remove" onclick="quoteSystem.removeArea(${area.id})">Remove</button>
          </div>
          <div class="form-grid">
            <div class="form-field">
              <label>Area Name</label>
              <input type="text" value="${area.name}" 
                     onchange="quoteSystem.updateArea(${area.id}, 'name', this.value)"
                     placeholder="e.g., Master Bathroom">
            </div>
            <div class="form-field">
              <label>Square Footage</label>
              <input type="number" value="${area.sqft}" 
                     onchange="quoteSystem.updateArea(${area.id}, 'sqft', parseFloat(this.value))"
                     min="0" step="0.1">
            </div>
            <div class="form-field">
              <label>Material Type</label>
              <select onchange="quoteSystem.updateArea(${area.id}, 'material', this.value)">
                <option value="">Select material...</option>
                <option value="ceramic" ${area.material === 'ceramic' ? 'selected' : ''}>Ceramic Tile</option>
                <option value="porcelain" ${area.material === 'porcelain' ? 'selected' : ''}>Porcelain Tile</option>
                <option value="natural-stone" ${area.material === 'natural-stone' ? 'selected' : ''}>Natural Stone</option>
                <option value="lft" ${area.material === 'lft' ? 'selected' : ''}>Large Format Tile</option>
                <option value="mosaic" ${area.material === 'mosaic' ? 'selected' : ''}>Mosaic</option>
              </select>
            </div>
          </div>
          <div class="area-estimate">
            <div class="estimate-line">
              <span>Labor:</span>
              <span class="amount">$${area.labor.toFixed(2)}</span>
            </div>
            <div class="estimate-line">
              <span>Materials:</span>
              <span class="amount">$${area.materials.toFixed(2)}</span>
            </div>
            <div class="estimate-line total">
              <span>Area Subtotal:</span>
              <span class="amount">$${area.subtotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      `).join('');

      this.calculateQuoteTotal();
    }

    updateArea(areaId, field, value) {
      const area = this.quoteData.areas.find(a => a.id === areaId);
      if (!area) return;

      area[field] = value;

      // Recalculate costs
      if (field === 'sqft' || field === 'material') {
        this.calculateAreaCost(area);
      }

      this.renderProjectAreas();
    }

    calculateAreaCost(area) {
      // Basic pricing (customize based on your actual pricing)
      const laborRates = {
        'ceramic': 8,
        'porcelain': 10,
        'natural-stone': 12,
        'lft': 14,
        'mosaic': 16
      };

      const materialRates = {
        'ceramic': 5,
        'porcelain': 8,
        'natural-stone': 15,
        'lft': 12,
        'mosaic': 20
      };

      const laborRate = laborRates[area.material] || 10;
      const materialRate = materialRates[area.material] || 8;

      area.labor = area.sqft * laborRate;
      area.materials = area.sqft * materialRate * 1.15; // 15% waste
      area.subtotal = area.labor + area.materials;
    }

    removeArea(areaId) {
      this.quoteData.areas = this.quoteData.areas.filter(a => a.id !== areaId);
      this.renderProjectAreas();
    }

    calculateQuoteTotal() {
      const total = this.quoteData.areas.reduce((sum, area) => sum + area.subtotal, 0);
      this.quoteData.total = total;

      const totalDisplay = document.getElementById('quote-total');
      if (totalDisplay) {
        totalDisplay.textContent = `$${total.toFixed(2)}`;
      }
    }

    // PDF Generation
    setupPDFGeneration() {
      const generateBtn = document.getElementById('generate-quote-pdf');
      if (generateBtn) {
        generateBtn.addEventListener('click', () => this.generatePDF());
      }
    }

    async generatePDF() {
      if (typeof jspdf === 'undefined') {
        this.showToast('PDF library not loaded', 'error');
        return;
      }

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      // Header
      doc.setFontSize(20);
      doc.text('Tillerstead Tile Installation', 20, 20);
      doc.setFontSize(12);
      doc.text('Professional Quote', 20, 28);

      // Customer Info
      let y = 40;
      doc.setFontSize(14);
      doc.text('Customer Information', 20, y);
      y += 8;
      doc.setFontSize(10);
      doc.text(`Name: ${this.quoteData.customer.name || 'N/A'}`, 20, y);
      y += 6;
      doc.text(`Email: ${this.quoteData.customer.email || 'N/A'}`, 20, y);
      y += 6;
      doc.text(`Phone: ${this.quoteData.customer.phone || 'N/A'}`, 20, y);
      y += 12;

      // Project Areas
      doc.setFontSize(14);
      doc.text('Project Areas', 20, y);
      y += 8;

      this.quoteData.areas.forEach((area, index) => {
        doc.setFontSize(12);
        doc.text(`${index + 1}. ${area.name || 'Unnamed Area'}`, 20, y);
        y += 6;
        doc.setFontSize(10);
        doc.text(`   Square Footage: ${area.sqft} sq ft`, 20, y);
        y += 5;
        doc.text(`   Material: ${area.material}`, 20, y);
        y += 5;
        doc.text(`   Labor: $${area.labor.toFixed(2)}`, 20, y);
        y += 5;
        doc.text(`   Materials: $${area.materials.toFixed(2)}`, 20, y);
        y += 5;
        doc.text(`   Subtotal: $${area.subtotal.toFixed(2)}`, 20, y);
        y += 10;
      });

      // Total
      y += 10;
      doc.setFontSize(16);
      doc.text(`Total Estimate: $${this.quoteData.total.toFixed(2)}`, 20, y);

      // Footer
      doc.setFontSize(8);
      doc.text('This is an estimate. Final pricing may vary based on site conditions.', 20, 280);
      doc.text('Valid for 30 days from date of issue.', 20, 285);

      // Save
      doc.save(`tillerstead-quote-${Date.now()}.pdf`);
      this.showToast('PDF generated successfully!', 'success');
    }

    // Email Quote
    setupEmailQuote() {
      const emailBtn = document.getElementById('email-quote');
      if (emailBtn) {
        emailBtn.addEventListener('click', () => this.emailQuote());
      }
    }

    async emailQuote() {
      const email = this.quoteData.customer.email || prompt('Enter email address:');
      if (!email) return;

      // In production, send to backend API
      const quoteHTML = this.generateQuoteHTML();

      try {
        const response = await fetch('/api/send-quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            quoteData: this.quoteData,
            html: quoteHTML
          })
        });

        if (response.ok) {
          this.showToast('Quote emailed successfully!', 'success');
        } else {
          this.showToast('Failed to email quote', 'error');
        }
      } catch (error) {
        console.error('Email error:', error);
        this.showToast('Failed to email quote', 'error');
      }
    }

    generateQuoteHTML() {
      return `
        <h1>Your Tillerstead Quote</h1>
        <p>Thank you for your interest in professional tile installation!</p>
        <h2>Project Summary</h2>
        ${this.quoteData.areas.map((area, i) => `
          <div>
            <h3>${i + 1}. ${area.name}</h3>
            <p>Square Footage: ${area.sqft} sq ft</p>
            <p>Material: ${area.material}</p>
            <p>Subtotal: $${area.subtotal.toFixed(2)}</p>
          </div>
        `).join('')}
        <h2>Total: $${this.quoteData.total.toFixed(2)}</h2>
      `;
    }

    // Save/Load Quotes
    setupQuoteSaveLoad() {
      const saveBtn = document.getElementById('save-quote');
      const loadBtn = document.getElementById('load-quote');

      if (saveBtn) {
        saveBtn.addEventListener('click', () => this.saveQuote());
      }

      if (loadBtn) {
        loadBtn.addEventListener('click', () => this.loadQuote());
      }
    }

    saveQuote() {
      const quotes = JSON.parse(localStorage.getItem('tillerstead_quotes') || '[]');
      const quote = {
        id: Date.now(),
        date: new Date().toISOString(),
        data: this.quoteData,
        photos: this.photos
      };
      quotes.push(quote);
      localStorage.setItem('tillerstead_quotes', JSON.stringify(quotes));
      this.showToast('Quote saved!', 'success');
    }

    loadQuote() {
      const quotes = JSON.parse(localStorage.getItem('tillerstead_quotes') || '[]');
      if (quotes.length === 0) {
        this.showToast('No saved quotes found', 'info');
        return;
      }

      // Show list to select from
      const quoteList = quotes.map(q => 
        `${new Date(q.date).toLocaleDateString()} - ${q.data.areas.length} areas - $${q.data.total.toFixed(2)}`
      ).join('\n');

      const selection = prompt('Select a quote:\n' + quoteList);
      // Simplified - in production use a proper modal
    }

    showToast(message, type = 'info') {
      // Use existing toast system or create simple one
      // // // // // // // // // // // console.log(`[${type}] ${message}`); // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.quoteSystem = new PremiumQuoteSystem();
    });
  } else {
    window.quoteSystem = new PremiumQuoteSystem();
  }

})();
