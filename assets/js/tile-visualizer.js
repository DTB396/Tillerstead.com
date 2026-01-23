/**
 * Tile Pattern Visualizer
 * Interactive canvas-based tile layout designer
 * Author: Tillerstead LLC
 * Version: 1.0
 */

class TileVisualizer {
  constructor() {
    this.canvas = document.getElementById('tile-canvas');
    this.ctx = this.canvas.getContext('2d');
    
    // Room dimensions (in feet)
    this.roomWidth = 8;
    this.roomLength = 10;
    
    // Tile dimensions (in inches)
    this.tileWidth = 12;
    this.tileHeight = 12;
    
    // Grout settings
    this.groutWidth = 0.125; // inches (1/8")
    this.groutColor = '#CCCCCC';
    
    // Tile color
    this.tileColor = '#F5F5DC';
    
    // Pattern
    this.pattern = 'straight';
    
    // Zoom and pan
    this.zoom = 1.0;
    this.panX = 0;
    this.panY = 0;
    
    // Tile price
    this.tilePrice = 5.00;
    
    this.init();
  }
  
  init() {
    this.attachEventListeners();
    this.render();
    this.updateCalculations();
  }
  
  attachEventListeners() {
    // Room dimensions
    document.getElementById('room-width').addEventListener('input', (e) => {
      this.roomWidth = parseFloat(e.target.value) || 8;
      this.updateCalculations();
      this.render();
    });
    
    document.getElementById('room-length').addEventListener('input', (e) => {
      this.roomLength = parseFloat(e.target.value) || 10;
      this.updateCalculations();
      this.render();
    });
    
    // Tile size buttons
    document.querySelectorAll('.tile-size-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.tile-size-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.tileWidth = parseInt(e.target.dataset.width);
        this.tileHeight = parseInt(e.target.dataset.height);
        this.updateCalculations();
        this.render();
      });
    });
    
    // Custom tile size
    document.getElementById('apply-custom').addEventListener('click', () => {
      const w = parseFloat(document.getElementById('custom-width').value);
      const h = parseFloat(document.getElementById('custom-height').value);
      if (w && h && w > 0 && h > 0) {
        document.querySelectorAll('.tile-size-btn').forEach(b => b.classList.remove('active'));
        this.tileWidth = w;
        this.tileHeight = h;
        this.updateCalculations();
        this.render();
      }
    });
    
    // Pattern buttons
    document.querySelectorAll('.pattern-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.pattern-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.pattern = e.currentTarget.dataset.pattern;
        this.updatePatternInfo();
        this.render();
      });
    });
    
    // Grout width
    document.getElementById('grout-width').addEventListener('input', (e) => {
      this.groutWidth = parseFloat(e.target.value);
      this.updateGroutWidthDisplay();
      this.updateCalculations();
      this.render();
    });
    
    // Grout color buttons
    document.querySelectorAll('.grout-color-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.grout-color-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.groutColor = e.target.dataset.color;
        document.getElementById('custom-grout-color').value = this.groutColor;
        this.render();
      });
    });
    
    // Custom grout color
    document.getElementById('custom-grout-color').addEventListener('input', (e) => {
      document.querySelectorAll('.grout-color-btn').forEach(b => b.classList.remove('active'));
      this.groutColor = e.target.value;
      this.render();
    });
    
    // Tile color buttons
    document.querySelectorAll('.tile-color-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.tile-color-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.tileColor = e.target.dataset.color;
        document.getElementById('custom-tile-color').value = this.tileColor;
        this.render();
      });
    });
    
    // Custom tile color
    document.getElementById('custom-tile-color').addEventListener('input', (e) => {
      document.querySelectorAll('.tile-color-btn').forEach(b => b.classList.remove('active'));
      this.tileColor = e.target.value;
      this.render();
    });
    
    // Tile price
    document.getElementById('tile-price').addEventListener('input', (e) => {
      this.tilePrice = parseFloat(e.target.value) || 5;
      this.updateCalculations();
    });
    
    // Zoom controls
    document.getElementById('zoom-in').addEventListener('click', () => this.zoomIn());
    document.getElementById('zoom-out').addEventListener('click', () => this.zoomOut());
    document.getElementById('zoom-fit').addEventListener('click', () => this.zoomFit());
    
    // Action buttons
    document.getElementById('save-design').addEventListener('click', () => this.saveDesign());
    document.getElementById('load-design').addEventListener('click', () => this.loadDesign());
    document.getElementById('export-image').addEventListener('click', () => this.exportImage());
    document.getElementById('reset-design').addEventListener('click', () => this.resetDesign());
    
    // Initialize displays
    this.updateGroutWidthDisplay();
  }
  
  updateGroutWidthDisplay() {
    const fractions = {
      0.0625: '1/16"',
      0.125: '1/8"',
      0.1875: '3/16"',
      0.25: '1/4"',
      0.3125: '5/16"',
      0.375: '3/8"',
      0.4375: '7/16"',
      0.5: '1/2"'
    };
    const display = fractions[this.groutWidth] || `${this.groutWidth}"`;
    document.querySelector('.grout-width-display').textContent = display;
  }
  
  render() {
    // Clear canvas
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Save context state
    this.ctx.save();
    
    // Apply zoom and pan
    this.ctx.translate(this.panX, this.panY);
    this.ctx.scale(this.zoom, this.zoom);
    
    // Calculate scale (pixels per foot)
    const availableWidth = this.canvas.width - 100;
    const availableHeight = this.canvas.height - 100;
    const scaleX = availableWidth / this.roomWidth;
    const scaleY = availableHeight / this.roomLength;
    const scale = Math.min(scaleX, scaleY);
    
    // Center the room
    const roomPixelWidth = this.roomWidth * scale;
    const roomPixelHeight = this.roomLength * scale;
    const offsetX = (this.canvas.width - roomPixelWidth) / 2;
    const offsetY = (this.canvas.height - roomPixelHeight) / 2;
    
    this.ctx.translate(offsetX, offsetY);
    
    // Draw room outline
    this.ctx.strokeStyle = '#333333';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(0, 0, roomPixelWidth, roomPixelHeight);
    
    // Draw tiles based on pattern
    this.drawTiles(roomPixelWidth, roomPixelHeight, scale);
    
    // Draw dimensions
    this.drawDimensions(roomPixelWidth, roomPixelHeight, scale, offsetX, offsetY);
    
    // Restore context
    this.ctx.restore();
  }
  
  drawTiles(roomWidth, roomHeight, scale) {
    // Convert tile dimensions to pixels
    const tileWidthPx = (this.tileWidth / 12) * scale; // inches to feet to pixels
    const tileHeightPx = (this.tileHeight / 12) * scale;
    const groutWidthPx = (this.groutWidth / 12) * scale;
    
    switch (this.pattern) {
      case 'straight':
        this.drawStraightPattern(roomWidth, roomHeight, tileWidthPx, tileHeightPx, groutWidthPx);
        break;
      case 'brick':
        this.drawBrickPattern(roomWidth, roomHeight, tileWidthPx, tileHeightPx, groutWidthPx);
        break;
      case 'herringbone':
        this.drawHerringbonePattern(roomWidth, roomHeight, tileWidthPx, tileHeightPx, groutWidthPx);
        break;
      case 'diagonal':
        this.drawDiagonalPattern(roomWidth, roomHeight, tileWidthPx, tileHeightPx, groutWidthPx);
        break;
      case 'basketweave':
        this.drawBasketweavePattern(roomWidth, roomHeight, tileWidthPx, tileHeightPx, groutWidthPx);
        break;
      case 'vertical':
        this.drawVerticalPattern(roomWidth, roomHeight, tileWidthPx, tileHeightPx, groutWidthPx);
        break;
    }
  }
  
  drawStraightPattern(roomWidth, roomHeight, tileW, tileH, grout) {
    for (let y = 0; y < roomHeight; y += tileH + grout) {
      for (let x = 0; x < roomWidth; x += tileW + grout) {
        this.drawTile(x, y, tileW, tileH, grout);
      }
    }
  }
  
  drawBrickPattern(roomWidth, roomHeight, tileW, tileH, grout) {
    let row = 0;
    for (let y = 0; y < roomHeight; y += tileH + grout) {
      const offset = (row % 2) * (tileW / 2);
      for (let x = -offset; x < roomWidth; x += tileW + grout) {
        if (x + tileW > 0) { // Only draw if visible
          this.drawTile(x, y, tileW, tileH, grout);
        }
      }
      row++;
    }
  }
  
  drawHerringbonePattern(roomWidth, roomHeight, tileW, tileH, grout) {
    // Simplified herringbone for visualization
    const patternWidth = tileW + grout;
    const patternHeight = tileH + grout;
    
    for (let y = 0; y < roomHeight; y += patternHeight * 2) {
      for (let x = 0; x < roomWidth; x += patternWidth * 2) {
        // Horizontal tile
        this.drawTile(x, y, tileW, tileH, grout);
        // Vertical tile next to it
        this.ctx.save();
        this.ctx.translate(x + tileW + grout, y);
        this.ctx.rotate(Math.PI / 2);
        this.drawTile(0, 0, tileW, tileH, grout);
        this.ctx.restore();
      }
    }
  }
  
  drawDiagonalPattern(roomWidth, roomHeight, tileW, tileH, grout) {
    this.ctx.save();
    this.ctx.translate(roomWidth / 2, roomHeight / 2);
    this.ctx.rotate(Math.PI / 4);
    this.ctx.translate(-roomWidth / 2, -roomHeight / 2);
    
    const diagonal = Math.sqrt(roomWidth * roomWidth + roomHeight * roomHeight);
    for (let y = -diagonal / 2; y < diagonal; y += tileH + grout) {
      for (let x = -diagonal / 2; x < diagonal; x += tileW + grout) {
        this.drawTile(x, y, tileW, tileH, grout);
      }
    }
    
    this.ctx.restore();
  }
  
  drawBasketweavePattern(roomWidth, roomHeight, tileW, tileH, grout) {
    const unit = Math.max(tileW, tileH) + grout;
    
    for (let y = 0; y < roomHeight; y += unit * 2) {
      for (let x = 0; x < roomWidth; x += unit * 2) {
        // Horizontal pair
        this.drawTile(x, y, tileW, tileH, grout);
        this.drawTile(x, y + tileH + grout, tileW, tileH, grout);
        
        // Vertical pair
        this.ctx.save();
        this.ctx.translate(x + tileW + grout, y);
        this.ctx.rotate(Math.PI / 2);
        this.drawTile(0, 0, tileW, tileH, grout);
        this.drawTile(0, tileH + grout, tileW, tileH, grout);
        this.ctx.restore();
      }
    }
  }
  
  drawVerticalPattern(roomWidth, roomHeight, tileW, tileH, grout) {
    for (let x = 0; x < roomWidth; x += tileH + grout) {
      for (let y = 0; y < roomHeight; y += tileW + grout) {
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(Math.PI / 2);
        this.drawTile(0, -tileH, tileW, tileH, grout);
        this.ctx.restore();
      }
    }
  }
  
  drawTile(x, y, w, h, grout) {
    // Draw grout background
    this.ctx.fillStyle = this.groutColor;
    this.ctx.fillRect(x, y, w + grout, h + grout);
    
    // Draw tile with slight variation for realism
    const variation = this.getTileColorVariation();
    this.ctx.fillStyle = variation;
    this.ctx.fillRect(x + grout/2, y + grout/2, w, h);
    
    // Add subtle edge shadow for depth
    this.ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x + grout/2, y + grout/2, w, h);
  }
  
  getTileColorVariation() {
    // Add slight color variation for realism
    const rgb = this.hexToRgb(this.tileColor);
    const variation = Math.random() * 10 - 5; // -5 to +5
    const r = Math.max(0, Math.min(255, rgb.r + variation));
    const g = Math.max(0, Math.min(255, rgb.g + variation));
    const b = Math.max(0, Math.min(255, rgb.b + variation));
    return `rgb(${r}, ${g}, ${b})`;
  }
  
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }
  
  drawDimensions(roomWidth, roomHeight, scale, offsetX, offsetY) {
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
    
    this.ctx.fillStyle = '#333333';
    this.ctx.font = 'bold 14px Arial';
    this.ctx.textAlign = 'center';
    
    // Width dimension
    const widthText = `${this.roomWidth}' wide`;
    this.ctx.fillText(widthText, offsetX + roomWidth / 2, offsetY - 15);
    
    // Length dimension
    this.ctx.save();
    this.ctx.translate(offsetX - 15, offsetY + roomHeight / 2);
    this.ctx.rotate(-Math.PI / 2);
    const lengthText = `${this.roomLength}' long`;
    this.ctx.fillText(lengthText, 0, 0);
    this.ctx.restore();
    
    this.ctx.restore();
  }
  
  updateCalculations() {
    // Room area in square feet
    const roomArea = this.roomWidth * this.roomLength;
    document.getElementById('total-area').textContent = roomArea.toFixed(1);
    
    // Tile area in square feet
    const tileAreaInches = this.tileWidth * this.tileHeight;
    const tileAreaSqFt = tileAreaInches / 144; // 144 sq inches in 1 sq ft
    
    // Number of tiles needed
    const tilesNeeded = Math.ceil(roomArea / tileAreaSqFt);
    document.getElementById('tiles-needed').textContent = tilesNeeded;
    
    // Coverage percentage
    const coverage = ((tilesNeeded * tileAreaSqFt) / roomArea * 100);
    document.getElementById('coverage-percent').textContent = coverage.toFixed(1) + '%';
    
    // Tiles with 10% waste
    const tilesWithWaste = Math.ceil(tilesNeeded * 1.1);
    document.getElementById('tiles-with-waste').textContent = tilesWithWaste;
    
    // Boxes needed (assuming 10 sq ft per box)
    const boxesNeeded = Math.ceil((tilesWithWaste * tileAreaSqFt) / 10);
    document.getElementById('boxes-needed').textContent = boxesNeeded;
    
    // Grout coverage (approx)
    const groutCoverage = roomArea.toFixed(1);
    document.getElementById('grout-coverage').textContent = groutCoverage + ' sq ft';
    
    // Thinset needed (approx 1.5 lbs per sq ft for floor)
    const thinsetNeeded = Math.ceil(roomArea * 1.5);
    document.getElementById('thinset-needed').textContent = thinsetNeeded + ' lbs';
    
    // Cost calculations
    const tileCost = (roomArea * 1.1 * this.tilePrice).toFixed(2);
    document.getElementById('tile-cost').textContent = '$' + tileCost;
    
    // Grout cost (approx $25 per 25 lb bag covers 100-200 sq ft)
    const groutBags = Math.ceil(roomArea / 150);
    const groutCost = (groutBags * 25).toFixed(2);
    document.getElementById('grout-cost').textContent = '$' + groutCost;
    
    // Thinset cost (approx $30 per 50 lb bag)
    const thinsetBags = Math.ceil(thinsetNeeded / 50);
    const thinsetCost = (thinsetBags * 30).toFixed(2);
    document.getElementById('thinset-cost').textContent = '$' + thinsetCost;
    
    // Total materials cost
    const totalCost = (parseFloat(tileCost) + parseFloat(groutCost) + parseFloat(thinsetCost)).toFixed(2);
    document.getElementById('materials-total').textContent = '$' + totalCost;
  }
  
  updatePatternInfo() {
    const info = {
      straight: '<p><strong>Straight Pattern:</strong> Classic grid layout. Easiest to install, minimal waste (5-10%). Works well with any tile size. Best for rectangular tiles.</p>',
      brick: '<p><strong>Brick/Offset Pattern:</strong> Each row offset by half tile width. Creates visual interest. Moderate waste (10-15%). Popular for subway tile.</p>',
      herringbone: '<p><strong>Herringbone Pattern:</strong> Tiles laid in zigzag pattern at 45° or 90°. Adds visual complexity. Higher waste (15-20%). Requires precision cutting.</p>',
      diagonal: '<p><strong>Diagonal Pattern:</strong> Tiles rotated 45° to room walls. Makes small spaces feel larger. Higher waste (15-20%) due to perimeter cuts.</p>',
      basketweave: '<p><strong>Basketweave Pattern:</strong> Pairs of tiles alternating horizontal/vertical. Traditional look. Moderate waste (10-15%). Works best with square tiles.</p>',
      vertical: '<p><strong>Vertical Pattern:</strong> Tiles installed vertically (especially for rectangular). Makes ceilings appear higher. Similar waste to straight pattern.</p>'
    };
    
    document.getElementById('pattern-info').innerHTML = info[this.pattern] || info.straight;
  }
  
  zoomIn() {
    this.zoom = Math.min(this.zoom * 1.2, 3.0);
    this.render();
  }
  
  zoomOut() {
    this.zoom = Math.max(this.zoom / 1.2, 0.5);
    this.render();
  }
  
  zoomFit() {
    this.zoom = 1.0;
    this.panX = 0;
    this.panY = 0;
    this.render();
  }
  
  saveDesign() {
    const design = {
      roomWidth: this.roomWidth,
      roomLength: this.roomLength,
      tileWidth: this.tileWidth,
      tileHeight: this.tileHeight,
      groutWidth: this.groutWidth,
      groutColor: this.groutColor,
      tileColor: this.tileColor,
      pattern: this.pattern,
      tilePrice: this.tilePrice,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('tileDesign', JSON.stringify(design));
    this.showNotification('✅ Design saved successfully!');
  }
  
  loadDesign() {
    const savedDesign = localStorage.getItem('tileDesign');
    if (!savedDesign) {
      this.showNotification('⚠️ No saved design found');
      return;
    }
    
    try {
      const design = JSON.parse(savedDesign);
      
      // Restore values
      this.roomWidth = design.roomWidth;
      this.roomLength = design.roomLength;
      this.tileWidth = design.tileWidth;
      this.tileHeight = design.tileHeight;
      this.groutWidth = design.groutWidth;
      this.groutColor = design.groutColor;
      this.tileColor = design.tileColor;
      this.pattern = design.pattern;
      this.tilePrice = design.tilePrice || 5;
      
      // Update UI
      document.getElementById('room-width').value = this.roomWidth;
      document.getElementById('room-length').value = this.roomLength;
      document.getElementById('grout-width').value = this.groutWidth;
      document.getElementById('custom-grout-color').value = this.groutColor;
      document.getElementById('custom-tile-color').value = this.tileColor;
      document.getElementById('tile-price').value = this.tilePrice;
      
      // Update active buttons
      document.querySelectorAll('.pattern-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.pattern === this.pattern);
      });
      
      this.updateGroutWidthDisplay();
      this.updatePatternInfo();
      this.updateCalculations();
      this.render();
      
      this.showNotification('✅ Design loaded successfully!');
    } catch (e) {
      this.showNotification('❌ Error loading design');
    }
  }
  
  exportImage() {
    // Create a temporary canvas with white background
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = this.canvas.width;
    tempCanvas.height = this.canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    // Fill white background
    tempCtx.fillStyle = '#FFFFFF';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    // Draw current canvas
    tempCtx.drawImage(this.canvas, 0, 0);
    
    // Add watermark
    tempCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    tempCtx.font = '14px Arial';
    tempCtx.textAlign = 'right';
    tempCtx.fillText('Created with Tillerstead Visualizer', tempCanvas.width - 10, tempCanvas.height - 10);
    
    // Download
    tempCanvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tile-design-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
      this.showNotification('✅ Image exported!');
    });
  }
  
  resetDesign() {
    if (confirm('Reset all settings to default?')) {
      this.roomWidth = 8;
      this.roomLength = 10;
      this.tileWidth = 12;
      this.tileHeight = 12;
      this.groutWidth = 0.125;
      this.groutColor = '#CCCCCC';
      this.tileColor = '#F5F5DC';
      this.pattern = 'straight';
      this.zoom = 1.0;
      this.panX = 0;
      this.panY = 0;
      this.tilePrice = 5;
      
      // Reset UI
      document.getElementById('room-width').value = this.roomWidth;
      document.getElementById('room-length').value = this.roomLength;
      document.getElementById('grout-width').value = this.groutWidth;
      document.getElementById('tile-price').value = this.tilePrice;
      document.getElementById('custom-width').value = '';
      document.getElementById('custom-height').value = '';
      
      // Reset active buttons
      document.querySelectorAll('.tile-size-btn')[0].classList.add('active');
      document.querySelectorAll('.pattern-btn')[0].classList.add('active');
      document.querySelectorAll('.grout-color-btn')[0].classList.add('active');
      document.querySelectorAll('.tile-color-btn')[0].classList.add('active');
      
      this.updateGroutWidthDisplay();
      this.updatePatternInfo();
      this.updateCalculations();
      this.render();
      
      this.showNotification('🔄 Reset complete');
    }
  }
  
  showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'visualizer-notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const visualizer = new TileVisualizer();
  console.log('Tile Visualizer initialized');
});
