/**
 * Homeowner Resources - Interactive Tools
 * Provides calculators, planners, and guides for NJ homeowners
 */

// Tool visibility management
function showProjectPlanner() {
  const toolSection = document.getElementById('active-tool');
  const toolTitle = document.getElementById('tool-title');
  const toolContent = document.getElementById('tool-content');
  
  toolTitle.textContent = '📊 Project Planner';
  toolContent.innerHTML = getProjectPlannerHTML();
  toolSection.style.display = 'block';
  toolSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function showBudgetCalculator() {
  const toolSection = document.getElementById('active-tool');
  const toolTitle = document.getElementById('tool-title');
  const toolContent = document.getElementById('tool-content');
  
  toolTitle.textContent = '💰 Budget Calculator';
  toolContent.innerHTML = getBudgetCalculatorHTML();
  toolSection.style.display = 'block';
  toolSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  initBudgetCalculator();
}

function showMaintenanceGuide() {
  const toolSection = document.getElementById('active-tool');
  const toolTitle = document.getElementById('tool-title');
  const toolContent = document.getElementById('tool-content');
  
  toolTitle.textContent = '🧼 Tile Maintenance Guide';
  toolContent.innerHTML = getMaintenanceGuideHTML();
  toolSection.style.display = 'block';
  toolSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function showContractorChecklist() {
  const toolSection = document.getElementById('active-tool');
  const toolTitle = document.getElementById('tool-title');
  const toolContent = document.getElementById('tool-content');
  
  toolTitle.textContent = '📋 Contractor Selection Checklist';
  toolContent.innerHTML = getContractorChecklistHTML();
  toolSection.style.display = 'block';
  toolSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function showLocalSuppliers() {
  const toolSection = document.getElementById('active-tool');
  const toolTitle = document.getElementById('tool-title');
  const toolContent = document.getElementById('tool-content');
  
  toolTitle.textContent = '📍 South Jersey Tile Suppliers';
  toolContent.innerHTML = getLocalSuppliersHTML();
  toolSection.style.display = 'block';
  toolSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function showPermitHelper() {
  const toolSection = document.getElementById('active-tool');
  const toolTitle = document.getElementById('tool-title');
  const toolContent = document.getElementById('tool-content');
  
  toolTitle.textContent = '🏛️ NJ Permit Requirements';
  toolContent.innerHTML = getPermitHelperHTML();
  toolSection.style.display = 'block';
  toolSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closeTool() {
  const toolSection = document.getElementById('active-tool');
  toolSection.style.display = 'none';
}

// Article display functions
function showArticle(articleType) {
  const toolSection = document.getElementById('active-tool');
  const toolTitle = document.getElementById('tool-title');
  const toolContent = document.getElementById('tool-content');
  
  const articles = {
    'timeline': {
      title: '⏱️ Bathroom Remodel Timeline',
      content: getTimelineArticleHTML()
    },
    'cost': {
      title: '💵 Bathroom Remodel Costs in NJ',
      content: getCostArticleHTML()
    },
    'shower-types': {
      title: '🚿 Curbless vs. Traditional Showers',
      content: getShowerComparisonHTML()
    }
  };
  
  const article = articles[articleType];
  if (article) {
    toolTitle.textContent = article.title;
    toolContent.innerHTML = article.content;
    toolSection.style.display = 'block';
    toolSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// HTML Content Generators

function getProjectPlannerHTML() {
  return `
    <div class="planner-tool">
      <div class="planner-steps">
        
        <div class="planner-step">
          <div class="step-number">1</div>
          <div class="step-content">
            <h3>Define Your Vision (Week 1-2)</h3>
            <ul>
              <li>Browse inspiration photos (Houzz, Pinterest)</li>
              <li>Determine must-haves vs. nice-to-haves</li>
              <li>Measure your space accurately</li>
              <li>Consider accessibility needs</li>
              <li>Think about storage requirements</li>
            </ul>
            <div class="step-tip">💡 Tip: Create a Pinterest board or folder with your favorite designs</div>
          </div>
        </div>

        <div class="planner-step">
          <div class="step-number">2</div>
          <div class="step-content">
            <h3>Set Your Budget (Week 2-3)</h3>
            <ul>
              <li>Use our <a href="#" onclick="showBudgetCalculator(); return false;">Budget Calculator</a> for estimates</li>
              <li>Add 15-20% contingency for surprises</li>
              <li>Decide which materials to splurge vs. save on</li>
              <li>Research financing options if needed</li>
            </ul>
            <div class="step-tip">💡 Tip: Tile is forever—invest in quality installation over trendy fixtures</div>
          </div>
        </div>

        <div class="planner-step">
          <div class="step-number">3</div>
          <div class="step-content">
            <h3>Find Your Contractor (Week 3-5)</h3>
            <ul>
              <li>Get 3 detailed quotes from licensed contractors</li>
              <li>Check NJ HIC license at <a href="https://newjersey.mylicense.com/verification/" target="_blank">newjersey.mylicense.com</a></li>
              <li>Ask for references and recent project photos</li>
              <li>Use our <a href="#" onclick="showContractorChecklist(); return false;">Contractor Checklist</a></li>
              <li>Verify insurance coverage</li>
            </ul>
            <div class="step-tip">⚠️ Warning: Avoid contractors who pressure immediate decisions or ask for large deposits</div>
          </div>
        </div>

        <div class="planner-step">
          <div class="step-number">4</div>
          <div class="step-content">
            <h3>Select Materials (Week 4-6)</h3>
            <ul>
              <li>Visit showrooms with your contractor</li>
              <li>Choose tile, fixtures, and accessories</li>
              <li>Confirm lead times (some tile takes 6-8 weeks)</li>
              <li>Order samples before committing</li>
              <li>Get everything in writing</li>
            </ul>
            <div class="step-tip">💡 Tip: Large format tile (12x24"+) costs more to install but looks stunning</div>
          </div>
        </div>

        <div class="planner-step">
          <div class="step-number">5</div>
          <div class="step-content">
            <h3>Permits & Prep (Week 6-7)</h3>
            <ul>
              <li>Your contractor handles permit applications</li>
              <li>Typical permit cost: $100-$500</li>
              <li>Processing time: 1-3 weeks in most NJ towns</li>
              <li>Prepare alternate bathroom for use</li>
              <li>Clear out bathroom completely</li>
            </ul>
            <div class="step-tip">⚠️ Warning: Never let contractor skip permits—they protect YOU</div>
          </div>
        </div>

        <div class="planner-step">
          <div class="step-number">6</div>
          <div class="step-content">
            <h3>Construction Phase (Week 8-10)</h3>
            <ul>
              <li>Demo: 1-2 days</li>
              <li>Rough plumbing/electrical: 2-3 days</li>
              <li>Waterproofing: 2-3 days (must cure)</li>
              <li>Tile installation: 3-5 days</li>
              <li>Grouting & finishing: 2-3 days</li>
            </ul>
            <div class="step-tip">💡 Tip: Take daily photos—great for documenting the transformation</div>
          </div>
        </div>

        <div class="planner-step">
          <div class="step-number">7</div>
          <div class="step-content">
            <h3>Final Inspection & Walkthrough</h3>
            <ul>
              <li>Municipal inspection (if required)</li>
              <li>Contractor walkthrough—address punch list</li>
              <li>Receive maintenance instructions</li>
              <li>Get written warranty documentation</li>
              <li>Final payment after everything is complete</li>
            </ul>
            <div class="step-tip">✅ Success: You now have a beautiful, code-compliant bathroom!</div>
          </div>
        </div>

      </div>

      <div class="planner-download">
        <h3>📥 Download Complete Timeline</h3>
        <p>Get a printable PDF version of this planner with detailed checklists for each phase.</p>
        <button onclick="generateProjectPlanner()" class="download-btn">Download PDF Planner</button>
      </div>
    </div>

    <style>
      .planner-tool { max-width: 900px; margin: 0 auto; }
      .planner-steps { margin-bottom: 2rem; }
      .planner-step { 
        display: flex; 
        gap: 1.5rem; 
        margin-bottom: 2rem; 
        padding: 1.5rem;
        background: white;
        border-radius: 8px;
        border-left: 4px solid #10b981;
      }
      .step-number {
        flex-shrink: 0;
        width: 48px;
        height: 48px;
        background: #10b981;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 1.25rem;
      }
      .step-content h3 {
        font-size: 1.25rem;
        margin-bottom: 1rem;
        color: #1a1a1a;
      }
      .step-content ul {
        margin: 1rem 0;
        padding-left: 1.5rem;
      }
      .step-content li {
        margin-bottom: 0.5rem;
        color: #4b5563;
        line-height: 1.6;
      }
      .step-tip {
        margin-top: 1rem;
        padding: 0.75rem 1rem;
        background: #f0fdf4;
        border-left: 3px solid #10b981;
        border-radius: 4px;
        font-size: 0.9rem;
        color: #065f46;
      }
      .step-tip.warning {
        background: #fef3c7;
        border-left-color: #f59e0b;
        color: #92400e;
      }
      .planner-download {
        background: white;
        padding: 2rem;
        border-radius: 8px;
        text-align: center;
      }
      .download-btn {
        background: #10b981;
        color: white;
        border: none;
        padding: 1rem 2rem;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        font-size: 1rem;
        margin-top: 1rem;
      }
      .download-btn:hover {
        background: #059669;
      }
    </style>
  `;
}

function getBudgetCalculatorHTML() {
  return `
    <div class="budget-calculator">
      <div class="budget-intro">
        <p>Get a realistic estimate for your bathroom remodel in South Jersey. Prices reflect typical costs for TCNA-compliant installation with quality materials.</p>
      </div>

      <div class="budget-inputs">
        <div class="input-group">
          <label for="bathroom-size">Bathroom Size</label>
          <select id="bathroom-size" onchange="calculateBudget()">
            <option value="50">Small (5'x10' or smaller)</option>
            <option value="75" selected>Medium (5'x10' to 8'x10')</option>
            <option value="100">Large (8'x10' to 10'x12')</option>
            <option value="150">Master Suite (10'x12'+)</option>
          </select>
        </div>

        <div class="input-group">
          <label for="project-scope">Project Scope</label>
          <select id="project-scope" onchange="calculateBudget()">
            <option value="0.6">Tile & Fixtures Only (existing plumbing OK)</option>
            <option value="1.0" selected>Standard Remodel (new tile, fixtures, minor plumbing)</option>
            <option value="1.5">Full Gut Remodel (down to studs)</option>
            <option value="1.8">Luxury Remodel (high-end everything)</option>
          </select>
        </div>

        <div class="input-group">
          <label for="tile-quality">Tile Quality</label>
          <select id="tile-quality" onchange="calculateBudget()">
            <option value="3">Budget ($3-5/sq ft)</option>
            <option value="7" selected>Mid-Range ($7-12/sq ft)</option>
            <option value="15">Premium ($15-25/sq ft)</option>
            <option value="30">Luxury ($30+/sq ft)</option>
          </select>
        </div>

        <div class="input-group">
          <label for="shower-type">Shower Type</label>
          <select id="shower-type" onchange="calculateBudget()">
            <option value="0">No Change</option>
            <option value="2000" selected>Standard Tub/Shower</option>
            <option value="3500">Walk-in Shower</option>
            <option value="5000">Curbless Shower</option>
            <option value="7000">Large Steam Shower</option>
          </select>
        </div>

        <div class="checkbox-group">
          <label>
            <input type="checkbox" id="radiant-heat" onchange="calculateBudget()">
            Radiant Floor Heating (+$1,200-$1,800)
          </label>
        </div>

        <div class="checkbox-group">
          <label>
            <input type="checkbox" id="niche" onchange="calculateBudget()">
            Built-in Niches (+$400-$800 each)
          </label>
        </div>

        <div class="checkbox-group">
          <label>
            <input type="checkbox" id="bench" onchange="calculateBudget()">
            Shower Bench (+$600-$1,200)
          </label>
        </div>
      </div>

      <div id="budget-results" class="budget-results">
        <!-- Results populated by JavaScript -->
      </div>

      <div class="budget-disclaimer">
        <p><strong>Important Notes:</strong></p>
        <ul>
          <li>These are estimates based on typical South Jersey projects</li>
          <li>Actual costs vary based on specific materials, layout, and site conditions</li>
          <li>Always add 15-20% contingency for unexpected issues</li>
          <li>Does not include plumbing/electrical permits (typically $100-$500)</li>
          <li>Free detailed estimates available from Tillerstead</li>
        </ul>
      </div>
    </div>

    <style>
      .budget-calculator { max-width: 700px; margin: 0 auto; }
      .budget-intro {
        background: #eff6ff;
        padding: 1.5rem;
        border-radius: 8px;
        margin-bottom: 2rem;
        border-left: 4px solid #3b82f6;
      }
      .budget-inputs {
        background: white;
        padding: 2rem;
        border-radius: 8px;
        margin-bottom: 2rem;
      }
      .input-group {
        margin-bottom: 1.5rem;
      }
      .input-group label {
        display: block;
        font-weight: 600;
        margin-bottom: 0.5rem;
        color: #374151;
      }
      .input-group select {
        width: 100%;
        padding: 0.75rem;
        border: 2px solid #e5e7eb;
        border-radius: 6px;
        font-size: 1rem;
        background: white;
      }
      .checkbox-group {
        margin-bottom: 1rem;
      }
      .checkbox-group label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        color: #4b5563;
      }
      .checkbox-group input[type="checkbox"] {
        width: 20px;
        height: 20px;
      }
      .budget-results {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        padding: 2rem;
        border-radius: 8px;
        margin-bottom: 2rem;
      }
      .budget-results h3 {
        margin-bottom: 1rem;
        font-size: 1.5rem;
      }
      .budget-range {
        font-size: 2.5rem;
        font-weight: 700;
        margin: 1rem 0;
      }
      .budget-breakdown {
        margin-top: 1.5rem;
        padding-top: 1.5rem;
        border-top: 1px solid rgba(255,255,255,0.3);
      }
      .breakdown-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.75rem;
        opacity: 0.95;
      }
      .budget-disclaimer {
        background: #fef3c7;
        padding: 1.5rem;
        border-radius: 8px;
        border-left: 4px solid #f59e0b;
        font-size: 0.9rem;
      }
      .budget-disclaimer ul {
        margin-top: 0.75rem;
        padding-left: 1.5rem;
      }
      .budget-disclaimer li {
        margin-bottom: 0.5rem;
        color: #78350f;
      }
    </style>
  `;
}

function initBudgetCalculator() {
  calculateBudget();
}

function calculateBudget() {
  const size = parseInt(document.getElementById('bathroom-size').value);
  const scope = parseFloat(document.getElementById('project-scope').value);
  const tileQuality = parseInt(document.getElementById('tile-quality').value);
  const showerType = parseInt(document.getElementById('shower-type').value);
  
  const radiantHeat = document.getElementById('radiant-heat').checked;
  const niche = document.getElementById('niche').checked;
  const bench = document.getElementById('bench').checked;
  
  // Base calculation
  let baseCost = size * 100 * scope; // $100/sqft base
  
  // Tile material upgrade/downgrade
  const tileDiff = (tileQuality - 7) * size * 0.5;
  baseCost += tileDiff;
  
  // Shower cost
  baseCost += showerType;
  
  // Add-ons
  if (radiantHeat) baseCost += 1500;
  if (niche) baseCost += 600;
  if (bench) baseCost += 900;
  
  const lowRange = Math.round(baseCost * 0.85);
  const highRange = Math.round(baseCost * 1.15);
  
  // Breakdown
  const labor = Math.round(baseCost * 0.45);
  const materials = Math.round(baseCost * 0.40);
  const fixtures = Math.round(baseCost * 0.15);
  
  const resultsHTML = `
    <h3>Estimated Project Cost</h3>
    <div class="budget-range">$${lowRange.toLocaleString()} - $${highRange.toLocaleString()}</div>
    <p>Typical range for your specifications</p>
    
    <div class="budget-breakdown">
      <div class="breakdown-item">
        <span>Labor & Installation:</span>
        <span>$${labor.toLocaleString()}</span>
      </div>
      <div class="breakdown-item">
        <span>Materials (tile, waterproofing, etc.):</span>
        <span>$${materials.toLocaleString()}</span>
      </div>
      <div class="breakdown-item">
        <span>Fixtures & Hardware:</span>
        <span>$${fixtures.toLocaleString()}</span>
      </div>
    </div>
    
    <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.3);">
      <p style="margin-bottom: 1rem;">Ready for a detailed, no-obligation quote?</p>
      <a href="/contact/" class="btn" style="background: white; color: #10b981; padding: 0.75rem 1.5rem; border-radius: 6px; text-decoration: none; display: inline-block; font-weight: 600;">Get Free Estimate</a>
    </div>
  `;
  
  document.getElementById('budget-results').innerHTML = resultsHTML;
}

function getMaintenanceGuideHTML() {
  return `
    <div class="maintenance-guide">
      <div class="guide-intro">
        <p>Proper maintenance keeps your tile looking beautiful and performing well for decades. Follow these guidelines for different tile types and applications.</p>
      </div>

      <div class="maintenance-section">
        <h3>🧽 Daily & Weekly Care</h3>
        
        <div class="care-routine">
          <h4>After Each Shower</h4>
          <ul>
            <li>Squeegee walls to remove water (prevents water spots & soap buildup)</li>
            <li>Wipe down fixtures with microfiber cloth</li>
            <li>Leave door/curtain open for ventilation</li>
            <li>Run exhaust fan for 20-30 minutes after use</li>
          </ul>
        </div>

        <div class="care-routine">
          <h4>Weekly Cleaning</h4>
          <ul>
            <li><strong>Floor Tile:</strong> Vacuum or sweep, then damp mop with pH-neutral cleaner</li>
            <li><strong>Wall Tile:</strong> Spray with tile cleaner, wipe with microfiber cloth</li>
            <li><strong>Grout Lines:</strong> Scrub with soft brush and grout cleaner</li>
            <li><strong>Glass Doors:</strong> Squeegee daily, deep clean weekly with glass cleaner</li>
          </ul>
        </div>
      </div>

      <div class="maintenance-section">
        <h3>✅ Recommended Cleaning Products</h3>
        <div class="product-grid">
          <div class="product-recommendation">
            <strong>For Porcelain/Ceramic:</strong>
            <ul>
              <li>Aqua Mix Concentrated Stone & Tile Cleaner</li>
              <li>Method Daily Shower Spray (gentle, effective)</li>
              <li>Plain water with microfiber cloth (usually enough!)</li>
            </ul>
          </div>
          <div class="product-recommendation">
            <strong>For Natural Stone (marble, travertine):</strong>
            <ul>
              <li>Stone-safe pH-neutral cleaners ONLY</li>
              <li>Aqua Mix Stone Clean</li>
              <li>Never use acidic cleaners (vinegar, lemon)</li>
            </ul>
          </div>
          <div class="product-recommendation">
            <strong>For Grout:</strong>
            <ul>
              <li>Aqua Mix Grout Deep Clean (deep cleaning)</li>
              <li>Soft bristle brush (never metal)</li>
              <li>Oxygen bleach for stubborn stains</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="maintenance-section warning">
        <h3>⚠️ Products to AVOID</h3>
        <ul>
          <li><strong>Vinegar or Acidic Cleaners:</strong> Damages grout and natural stone</li>
          <li><strong>Abrasive Scrubbers:</strong> Scratches tile surface</li>
          <li><strong>Oil-Based Cleaners:</strong> Leaves residue, attracts dirt</li>
          <li><strong>Bleach (on colored grout):</strong> Causes discoloration</li>
          <li><strong>Steam Cleaners (excessive use):</strong> Can loosen grout over time</li>
        </ul>
      </div>

      <div class="maintenance-section">
        <h3>🛡️ Grout & Sealant Maintenance</h3>
        
        <div class="maintenance-task">
          <h4>Grout Sealing</h4>
          <p><strong>Frequency:</strong> Every 1-2 years (cement grout), Never (epoxy grout)</p>
          <ul>
            <li>Clean grout thoroughly before sealing</li>
            <li>Let dry completely (24-48 hours)</li>
            <li>Apply penetrating sealer with foam brush</li>
            <li>Wipe excess after 5-10 minutes</li>
            <li>Wait 24 hours before shower use</li>
          </ul>
          <p class="pro-tip">💡 Test water repellency: Drop water on grout. If it beads up, seal is good. If it soaks in, time to reseal.</p>
        </div>

        <div class="maintenance-task">
          <h4>Silicone Caulk Replacement</h4>
          <p><strong>Frequency:</strong> Every 3-5 years or when cracked/moldy</p>
          <ul>
            <li>Remove old caulk completely with utility knife</li>
            <li>Clean joint with rubbing alcohol</li>
            <li>Let dry completely</li>
            <li>Apply 100% silicone caulk (not acrylic)</li>
            <li>Tool smooth with wet finger or caulk tool</li>
            <li>Wait 24 hours to cure before water exposure</li>
          </ul>
        </div>
      </div>

      <div class="maintenance-section">
        <h3>🔍 Inspection Checklist (Quarterly)</h3>
        <div class="inspection-checklist">
          <label><input type="checkbox"> Check for cracked or loose tiles</label>
          <label><input type="checkbox"> Inspect grout for cracks or gaps</label>
          <label><input type="checkbox"> Test caulk joints for integrity</label>
          <label><input type="checkbox"> Look for water stains on ceiling below</label>
          <label><input type="checkbox"> Check drain for proper flow</label>
          <label><input type="checkbox"> Inspect silicone around fixtures</label>
          <label><input type="checkbox"> Test GFCI outlets</label>
          <label><input type="checkbox"> Check exhaust fan operation</label>
        </div>
      </div>

      <div class="maintenance-section alert">
        <h3>🚨 When to Call a Professional</h3>
        <ul>
          <li>Water stains on ceiling or walls outside shower</li>
          <li>Tiles feel spongy or move when stepped on</li>
          <li>Large cracks in grout or tile</li>
          <li>Persistent musty odor (possible mold)</li>
          <li>Water pooling instead of draining</li>
          <li>Visible mold growth behind caulk</li>
        </ul>
        <p><strong>Don't wait—water damage gets worse quickly!</strong></p>
      </div>

      <div class="cta-box">
        <h3>Need Professional Maintenance or Repairs?</h3>
        <p>Tillerstead offers maintenance services and warranty support for all our installations.</p>
        <a href="/contact/" class="btn-cta">Contact Us</a>
      </div>
    </div>

    <style>
      .maintenance-guide { max-width: 800px; margin: 0 auto; }
      .guide-intro {
        background: #eff6ff;
        padding: 1.5rem;
        border-radius: 8px;
        margin-bottom: 2rem;
        border-left: 4px solid #3b82f6;
      }
      .maintenance-section {
        background: white;
        padding: 2rem;
        border-radius: 8px;
        margin-bottom: 2rem;
      }
      .maintenance-section.warning {
        background: #fef3c7;
        border-left: 4px solid #f59e0b;
      }
      .maintenance-section.alert {
        background: #fee2e2;
        border-left: 4px solid #ef4444;
      }
      .maintenance-section h3 {
        font-size: 1.25rem;
        margin-bottom: 1.5rem;
        color: #1a1a1a;
      }
      .maintenance-section h4 {
        font-size: 1.1rem;
        margin: 1.5rem 0 0.75rem;
        color: #374151;
      }
      .maintenance-section ul {
        padding-left: 1.5rem;
        margin: 0.75rem 0;
      }
      .maintenance-section li {
        margin-bottom: 0.5rem;
        line-height: 1.6;
        color: #4b5563;
      }
      .care-routine {
        margin-bottom: 2rem;
      }
      .product-grid {
        display: grid;
        gap: 1.5rem;
        margin-top: 1rem;
      }
      .product-recommendation {
        padding: 1rem;
        background: #f9fafb;
        border-radius: 6px;
      }
      .maintenance-task {
        margin-bottom: 2rem;
      }
      .pro-tip {
        background: #f0fdf4;
        padding: 1rem;
        border-radius: 6px;
        border-left: 3px solid #10b981;
        margin-top: 1rem;
        font-size: 0.95rem;
      }
      .inspection-checklist {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      .inspection-checklist label {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem;
        background: #f9fafb;
        border-radius: 6px;
        cursor: pointer;
      }
      .inspection-checklist input[type="checkbox"] {
        width: 20px;
        height: 20px;
      }
      .cta-box {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        padding: 2rem;
        border-radius: 8px;
        text-align: center;
      }
      .btn-cta {
        background: white;
        color: #10b981;
        padding: 0.75rem 2rem;
        border-radius: 6px;
        text-decoration: none;
        display: inline-block;
        font-weight: 600;
        margin-top: 1rem;
      }
    </style>
  `;
}

function getContractorChecklistHTML() {
  return `
    <div class="contractor-checklist">
      <div class="checklist-intro">
        <p>Use this comprehensive checklist when interviewing tile contractors. A good contractor will welcome these questions and provide clear, confident answers.</p>
      </div>

      <div class="checklist-section">
        <h3>✅ Licensing & Insurance</h3>
        <div class="checklist-items">
          <label><input type="checkbox"> NJ Home Improvement Contractor license number provided</label>
          <label><input type="checkbox"> License verified at <a href="https://newjersey.mylicense.com/verification/" target="_blank">newjersey.mylicense.com</a></label>
          <label><input type="checkbox"> General liability insurance (minimum $1M)</label>
          <label><input type="checkbox"> Workers' compensation insurance (if employees)</label>
          <label><input type="checkbox"> Insurance certificates provided</label>
          <label><input type="checkbox"> No disciplinary actions or complaints</label>
        </div>
      </div>

      <div class="checklist-section">
        <h3>📋 Experience & Expertise</h3>
        <div class="checklist-items">
          <label><input type="checkbox"> How many years in business? (prefer 5+ years)</label>
          <label><input type="checkbox"> Specializes in tile/bathroom work (not general handyman)</label>
          <label><input type="checkbox"> Can explain TCNA standards and methods</label>
          <label><input type="checkbox"> Familiar with NJ building codes</label>
          <label><input type="checkbox"> Experience with your specific tile type/project</label>
          <label><input type="checkbox"> Continuing education or certifications (Schluter, NTCA, etc.)</label>
        </div>
      </div>

      <div class="checklist-section">
        <h3>🖼️ Portfolio & References</h3>
        <div class="checklist-items">
          <label><input type="checkbox"> Showed recent project photos (within 6 months)</label>
          <label><input type="checkbox"> Provided 3+ customer references</label>
          <label><input type="checkbox"> References contacted and satisfied</label>
          <label><input type="checkbox"> Can visit a completed project in person</label>
          <label><input type="checkbox"> Has positive online reviews (Google, Yelp, Angi)</label>
          <label><input type="checkbox"> No pattern of negative reviews about quality</label>
        </div>
      </div>

      <div class="checklist-section">
        <h3>💼 Business Practices</h3>
        <div class="checklist-items">
          <label><input type="checkbox"> Provides detailed written estimate (not just verbal)</label>
          <label><input type="checkbox"> Estimate includes all labor, materials, permits</label>
          <label><input type="checkbox"> Willing to put everything in written contract</label>
          <label><input type="checkbox"> Payment schedule is reasonable (≤33% deposit per NJ law)</label>
          <label><input type="checkbox"> Never pressures immediate decision</label>
          <label><input type="checkbox"> Returns calls/emails within 24-48 hours</label>
          <label><input type="checkbox"> Professional communication throughout</label>
        </div>
      </div>

      <div class="checklist-section">
        <h3>🔧 Installation Methods</h3>
        <div class="checklist-items">
          <label><input type="checkbox"> Can explain waterproofing system in detail</label>
          <label><input type="checkbox"> Uses name-brand waterproofing (Schluter, Wedi, Laticrete, etc.)</label>
          <label><input type="checkbox"> Discusses substrate preparation thoroughly</label>
          <label><input type="checkbox"> Specifies thinset and grout products</label>
          <label><input type="checkbox"> Addresses layout and design considerations</label>
          <label><input type="checkbox"> Mentions flood testing after waterproofing</label>
          <label><input type="checkbox"> Explains cure times and project timeline</label>
        </div>
      </div>

      <div class="checklist-section">
        <h3>🏛️ Permits & Inspections</h3>
        <div class="checklist-items">
          <label><input type="checkbox"> Will handle permit application</label>
          <label><input type="checkbox"> Permit cost included in quote (or specified separately)</label>
          <label><input type="checkbox"> Familiar with local building department requirements</label>
          <label><input type="checkbox"> Will coordinate inspections</label>
          <label><input type="checkbox"> Never suggested skipping required permits</label>
        </div>
      </div>

      <div class="checklist-section">
        <h3>🛡️ Warranty & Support</h3>
        <div class="checklist-items">
          <label><input type="checkbox"> Provides written warranty (minimum 1 year)</label>
          <label><input type="checkbox"> Explains what is and isn't covered</label>
          <label><input type="checkbox"> Warranty on installation separate from materials</label>
          <label><input type="checkbox"> Process for warranty claims explained</label>
          <label><input type="checkbox"> Will provide maintenance instructions</label>
        </div>
      </div>

      <div class="checklist-section">
        <h3>⏱️ Timeline & Logistics</h3>
        <div class="checklist-items">
          <label><input type="checkbox"> Realistic timeline provided (not rushed)</label>
          <label><input type="checkbox"> Start date commitment</label>
          <label><input type="checkbox"> Daily work hours specified</label>
          <label><input type="checkbox"> Cleanup process explained</label>
          <label><input type="checkbox"> Material delivery coordination discussed</label>
          <label><input type="checkbox"> Point of contact during project identified</label>
        </div>
      </div>

      <div class="red-flags">
        <h3>🚩 Red Flags - Walk Away If:</h3>
        <ul>
          <li>❌ No NJ HIC license or refuses to provide it</li>
          <li>❌ Requests full payment upfront (NJ law limits to 33%)</li>
          <li>❌ Pressures immediate decision or "today only" pricing</li>
          <li>❌ Only accepts cash (avoid tax evasion schemes)</li>
          <li>❌ Can't explain waterproofing methods</li>
          <li>❌ Suggests skipping permits to "save money"</li>
          <li>❌ Won't provide written contract</li>
          <li>❌ No references or refuses to provide them</li>
          <li>❌ Price is dramatically lower than other quotes (too good to be true)</li>
          <li>❌ Vague or generic answers about methods/materials</li>
        </ul>
      </div>

      <div class="download-section">
        <h3>📥 Download Printable Checklist</h3>
        <p>Take this checklist with you to contractor meetings</p>
        <button onclick="generateContractorChecklist()" class="download-btn">Download PDF</button>
      </div>
    </div>

    <style>
      .contractor-checklist { max-width: 800px; margin: 0 auto; }
      .checklist-intro {
        background: #eff6ff;
        padding: 1.5rem;
        border-radius: 8px;
        margin-bottom: 2rem;
        border-left: 4px solid #3b82f6;
      }
      .checklist-section {
        background: white;
        padding: 2rem;
        border-radius: 8px;
        margin-bottom: 2rem;
      }
      .checklist-section h3 {
        font-size: 1.25rem;
        margin-bottom: 1.5rem;
        color: #1a1a1a;
      }
      .checklist-items {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      .checklist-items label {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        padding: 0.75rem;
        background: #f9fafb;
        border-radius: 6px;
        cursor: pointer;
        transition: background 0.2s;
      }
      .checklist-items label:hover {
        background: #f3f4f6;
      }
      .checklist-items input[type="checkbox"] {
        width: 20px;
        height: 20px;
        margin-top: 2px;
        flex-shrink: 0;
      }
      .red-flags {
        background: #fee2e2;
        padding: 2rem;
        border-radius: 8px;
        border-left: 4px solid #ef4444;
        margin-bottom: 2rem;
      }
      .red-flags h3 {
        font-size: 1.25rem;
        margin-bottom: 1rem;
        color: #991b1b;
      }
      .red-flags ul {
        padding-left: 0;
        list-style: none;
      }
      .red-flags li {
        padding: 0.75rem;
        margin-bottom: 0.5rem;
        background: white;
        border-radius: 6px;
        color: #7f1d1d;
      }
      .download-section {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        padding: 2rem;
        border-radius: 8px;
        text-align: center;
      }
      .download-btn {
        background: white;
        color: #10b981;
        border: none;
        padding: 0.75rem 2rem;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        font-size: 1rem;
        margin-top: 1rem;
      }
    </style>
  `;
}

function getLocalSuppliersHTML() {
  return `
    <div class="suppliers-guide">
      <div class="suppliers-intro">
        <p>These tile showrooms and suppliers serve South Jersey. Visiting showrooms helps you see and touch materials before making selections.</p>
      </div>

      <div class="supplier-list">
        
        <div class="supplier-card">
          <h3>🏪 Crossville Tile Studios</h3>
          <div class="supplier-details">
            <p class="supplier-address">📍 6725 Black Horse Pike, Egg Harbor Township, NJ 08234</p>
            <p class="supplier-phone">📞 <a href="tel:6096466616">(609) 646-6616</a></p>
            <p class="supplier-website">🌐 <a href="https://crossvilletile.com/" target="_blank" rel="noopener">crossvilletile.com</a></p>
          </div>
          <div class="supplier-info">
            <p><strong>Specialties:</strong> High-end porcelain, designer collections, large format</p>
            <p><strong>Good for:</strong> Modern aesthetic, unique patterns, premium projects</p>
            <p><strong>Hours:</strong> Mon-Fri 9am-5pm, Sat 10am-3pm</p>
          </div>
        </div>

        <div class="supplier-card">
          <h3>🏪 Floor & Decor</h3>
          <div class="supplier-details">
            <p class="supplier-address">📍 2131 Route 70 West, Cherry Hill, NJ 08002</p>
            <p class="supplier-phone">📞 <a href="tel:8562106900">(856) 210-6900</a></p>
            <p class="supplier-website">🌐 <a href="https://www.flooranddecor.com/" target="_blank" rel="noopener">flooranddecor.com</a></p>
          </div>
          <div class="supplier-info">
            <p><strong>Specialties:</strong> Huge selection, competitive pricing, in-stock inventory</p>
            <p><strong>Good for:</strong> Budget-conscious projects, same-day pickup</p>
            <p><strong>Hours:</strong> Mon-Sat 7am-9pm, Sun 9am-7pm</p>
          </div>
        </div>

        <div class="supplier-card">
          <h3>🏪 The Tile Shop</h3>
          <div class="supplier-details">
            <p class="supplier-address">📍 500 Route 73 South, Marlton, NJ 08053</p>
            <p class="supplier-phone">📞 <a href="tel:8569882880">(856) 988-2880</a></p>
            <p class="supplier-website">🌐 <a href="https://www.tileshop.com/" target="_blank" rel="noopener">tileshop.com</a></p>
          </div>
          <div class="supplier-info">
            <p><strong>Specialties:</strong> Natural stone, glass tile, design consultation</p>
            <p><strong>Good for:</strong> Curated selection, helpful staff, samples</p>
            <p><strong>Hours:</strong> Mon-Sat 10am-7pm, Sun 11am-6pm</p>
          </div>
        </div>

        <div class="supplier-card">
          <h3>🏪 MSI Surfaces</h3>
          <div class="supplier-details">
            <p class="supplier-address">📍 540 River Avenue, Lakewood, NJ 08701</p>
            <p class="supplier-phone">📞 <a href="tel:7322441313">(732) 244-1313</a></p>
            <p class="supplier-website">🌐 <a href="https://www.msisurfaces.com/" target="_blank" rel="noopener">msisurfaces.com</a></p>
          </div>
          <div class="supplier-info">
            <p><strong>Specialties:</strong> Natural stone, quartz, porcelain slabs</p>
            <p><strong>Good for:</strong> Coordinating tile with countertops</p>
            <p><strong>Hours:</strong> Mon-Fri 7:30am-5pm, Sat 8am-3pm</p>
          </div>
        </div>

        <div class="supplier-card">
          <h3>🏪 Lowe's / Home Depot</h3>
          <div class="supplier-details">
            <p class="supplier-address">📍 Multiple South Jersey locations</p>
          </div>
          <div class="supplier-info">
            <p><strong>Specialties:</strong> Budget tile, basic materials, installation supplies</p>
            <p><strong>Good for:</strong> Simple projects, DIY, widely available</p>
            <p><strong>Note:</strong> Quality and selection vary. Best for utility areas, not main bathrooms</p>
          </div>
        </div>

      </div>

      <div class="shopping-tips">
        <h3>💡 Showroom Shopping Tips</h3>
        <ul>
          <li><strong>Bring dimensions:</strong> Measure your space and bring a floor plan</li>
          <li><strong>Take photos:</strong> Compare options at home in your lighting</li>
          <li><strong>Get samples:</strong> Most showrooms loan samples for a few days</li>
          <li><strong>Ask about lead times:</strong> Some tile takes 6-8 weeks to arrive</li>
          <li><strong>Bring your contractor:</strong> They can advise on installation considerations</li>
          <li><strong>Consider grout color:</strong> Request grout samples to see with tile</li>
          <li><strong>Check for rectified edges:</strong> Best for tight grout lines and modern look</li>
        </ul>
      </div>

      <div class="tile-types">
        <h3>🎯 Tile Type Guide</h3>
        <div class="tile-type-grid">
          <div class="tile-type">
            <h4>Porcelain</h4>
            <p><strong>Best for:</strong> Floors, showers, high-traffic</p>
            <p><strong>Pros:</strong> Durable, water-resistant, low maintenance</p>
            <p><strong>Cons:</strong> Can be brittle if not installed properly</p>
            <p><strong>Price:</strong> $$-$$$</p>
          </div>
          <div class="tile-type">
            <h4>Ceramic</h4>
            <p><strong>Best for:</strong> Walls, backsplashes, decorative</p>
            <p><strong>Pros:</strong> Affordable, easy to cut, lots of styles</p>
            <p><strong>Cons:</strong> Less durable than porcelain</p>
            <p><strong>Price:</strong> $-$$</p>
          </div>
          <div class="tile-type">
            <h4>Natural Stone</h4>
            <p><strong>Best for:</strong> Luxury bathrooms, feature walls</p>
            <p><strong>Pros:</strong> Unique, high-end look</p>
            <p><strong>Cons:</strong> Requires sealing, more maintenance</p>
            <p><strong>Price:</strong> $$$-$$$$</p>
          </div>
          <div class="tile-type">
            <h4>Glass</h4>
            <p><strong>Best for:</strong> Accents, niches, backsplashes</p>
            <p><strong>Pros:</strong> Reflective, modern, stain-resistant</p>
            <p><strong>Cons:</strong> Shows water spots, can be expensive</p>
            <p><strong>Price:</strong> $$-$$$</p>
          </div>
        </div>
      </div>
    </div>

    <style>
      .suppliers-guide { max-width: 900px; margin: 0 auto; }
      .suppliers-intro {
        background: #eff6ff;
        padding: 1.5rem;
        border-radius: 8px;
        margin-bottom: 2rem;
        border-left: 4px solid #3b82f6;
      }
      .supplier-list {
        margin-bottom: 2rem;
      }
      .supplier-card {
        background: white;
        padding: 2rem;
        border-radius: 8px;
        margin-bottom: 1.5rem;
        border: 2px solid #e5e7eb;
        transition: border-color 0.2s;
      }
      .supplier-card:hover {
        border-color: #10b981;
      }
      .supplier-card h3 {
        font-size: 1.25rem;
        margin-bottom: 1rem;
        color: #1a1a1a;
      }
      .supplier-details {
        margin-bottom: 1rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #e5e7eb;
      }
      .supplier-details p {
        margin-bottom: 0.5rem;
        color: #4b5563;
      }
      .supplier-details a {
        color: #10b981;
        text-decoration: none;
      }
      .supplier-details a:hover {
        text-decoration: underline;
      }
      .supplier-info p {
        margin-bottom: 0.5rem;
        color: #4b5563;
        font-size: 0.95rem;
      }
      .shopping-tips {
        background: #f0fdf4;
        padding: 2rem;
        border-radius: 8px;
        border-left: 4px solid #10b981;
        margin-bottom: 2rem;
      }
      .shopping-tips h3 {
        font-size: 1.25rem;
        margin-bottom: 1rem;
        color: #065f46;
      }
      .shopping-tips ul {
        padding-left: 1.5rem;
      }
      .shopping-tips li {
        margin-bottom: 0.75rem;
        color: #065f46;
        line-height: 1.6;
      }
      .tile-types {
        background: white;
        padding: 2rem;
        border-radius: 8px;
      }
      .tile-types h3 {
        font-size: 1.25rem;
        margin-bottom: 1.5rem;
        color: #1a1a1a;
      }
      .tile-type-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
      }
      .tile-type {
        padding: 1.5rem;
        background: #f9fafb;
        border-radius: 8px;
        border: 1px solid #e5e7eb;
      }
      .tile-type h4 {
        font-size: 1.1rem;
        margin-bottom: 1rem;
        color: #1a1a1a;
      }
      .tile-type p {
        margin-bottom: 0.5rem;
        font-size: 0.9rem;
        color: #4b5563;
      }
    </style>
  `;
}

function getPermitHelperHTML() {
  return `
    <div class="permit-helper">
      <div class="permit-intro">
        <p>Most bathroom remodels in New Jersey require permits. Requirements vary by municipality, but here's what typically applies in Atlantic, Ocean, and Cape May Counties.</p>
      </div>

      <div class="permit-quiz">
        <h3>🔍 Do You Need a Permit?</h3>
        <p>Answer these questions to find out:</p>
        
        <div class="quiz-question">
          <p><strong>Are you moving or adding plumbing fixtures?</strong></p>
          <label><input type="radio" name="q1" value="yes"> Yes</label>
          <label><input type="radio" name="q1" value="no"> No</label>
        </div>

        <div class="quiz-question">
          <p><strong>Are you adding or relocating electrical outlets/lights?</strong></p>
          <label><input type="radio" name="q2" value="yes"> Yes</label>
          <label><input type="radio" name="q2" value="no"> No</label>
        </div>

        <div class="quiz-question">
          <p><strong>Are you removing or modifying walls?</strong></p>
          <label><input type="radio" name="q3" value="yes"> Yes</label>
          <label><input type="radio" name="q3" value="no"> No</label>
        </div>

        <div class="quiz-question">
          <p><strong>Are you changing the shower/tub footprint or drain location?</strong></p>
          <label><input type="radio" name="q4" value="yes"> Yes</label>
          <label><input type="radio" name="q4" value="no"> No</label>
        </div>

        <button onclick="evaluatePermitNeed()" class="quiz-btn">Get Result</button>
        <div id="permit-result" class="quiz-result"></div>
      </div>

      <div class="permit-process">
        <h3>📋 Typical Permit Process in NJ</h3>
        
        <div class="process-step">
          <div class="step-num">1</div>
          <div class="step-content">
            <h4>Application Submission</h4>
            <p>Your contractor submits permit application to local building department with:</p>
            <ul>
              <li>Detailed scope of work</li>
              <li>Floor plan/layout drawings</li>
              <li>Contractor license information</li>
              <li>Permit fee payment</li>
            </ul>
          </div>
        </div>

        <div class="process-step">
          <div class="step-num">2</div>
          <div class="step-content">
            <h4>Plan Review</h4>
            <p>Building department reviews plans (1-3 weeks typical)</p>
            <p>May request clarifications or modifications</p>
          </div>
        </div>

        <div class="process-step">
          <div class="step-num">3</div>
          <div class="step-content">
            <h4>Permit Issued</h4>
            <p>Once approved, permit card is issued</p>
            <p>Must be posted visibly at job site</p>
          </div>
        </div>

        <div class="process-step">
          <div class="step-num">4</div>
          <div class="step-content">
            <h4>Inspections</h4>
            <p>Typical inspections required:</p>
            <ul>
              <li><strong>Rough plumbing:</strong> Before walls/waterproofing closed</li>
              <li><strong>Rough electrical:</strong> Before walls closed (if applicable)</li>
              <li><strong>Waterproofing:</strong> Before tile (some towns)</li>
              <li><strong>Final inspection:</strong> All work complete</li>
            </ul>
          </div>
        </div>

        <div class="process-step">
          <div class="step-num">5</div>
          <div class="step-content">
            <h4>Certificate of Approval</h4>
            <p>After final inspection passes, certificate issued</p>
            <p>Keep this with your home records for resale</p>
          </div>
        </div>
      </div>

      <div class="permit-costs">
        <h3>💵 Typical Permit Costs in South Jersey</h3>
        <div class="cost-breakdown">
          <div class="cost-item">
            <span>Basic bathroom remodel:</span>
            <strong>$150-$300</strong>
          </div>
          <div class="cost-item">
            <span>With plumbing changes:</span>
            <strong>$250-$450</strong>
          </div>
          <div class="cost-item">
            <span>With electrical work:</span>
            <strong>$300-$500</strong>
          </div>
          <div class="cost-item">
            <span>Major renovation:</span>
            <strong>$400-$700</strong>
          </div>
        </div>
        <p class="cost-note">Costs vary by municipality. Some charge flat fee, others calculate based on project value.</p>
      </div>

      <div class="municipality-contacts">
        <h3>📞 Local Building Departments</h3>
        
        <div class="contact-grid">
          <div class="contact-card">
            <h4>Atlantic County</h4>
            <p>📞 <a href="tel:6094075200">(609) 407-5200</a></p>
            <p>🌐 <a href="https://www.atlantic-county.org/" target="_blank">atlantic-county.org</a></p>
          </div>
          <div class="contact-card">
            <h4>Ocean County</h4>
            <p>📞 <a href="tel:7322446000">(732) 244-6000</a></p>
            <p>🌐 <a href="https://www.co.ocean.nj.us/" target="_blank">co.ocean.nj.us</a></p>
          </div>
          <div class="contact-card">
            <h4>Cape May County</h4>
            <p>📞 <a href="tel:6094653001">(609) 465-3001</a></p>
            <p>🌐 <a href="https://www.capemaycountynj.gov/" target="_blank">capemaycountynj.gov</a></p>
          </div>
        </div>

        <p class="contact-note"><strong>Always call your specific municipality first</strong> — requirements can vary between towns even in the same county.</p>
      </div>

      <div class="permit-warning">
        <h3>⚠️ Why You Should Never Skip Permits</h3>
        <ul>
          <li>🏠 <strong>Resale issues:</strong> Unpermitted work must be disclosed, can kill sale</li>
          <li>🛡️ <strong>Insurance problems:</strong> Claims may be denied for unpermitted work</li>
          <li>⚖️ <strong>Legal liability:</strong> You're responsible if work doesn't meet code</li>
          <li>💰 <strong>Fines:</strong> $500-$2,000+ per violation if discovered</li>
          <li>🔨 <strong>Teardown risk:</strong> May be required to demo and redo work</li>
          <li>📉 <strong>Property value:</strong> Can reduce value if work must be redone</li>
        </ul>
      </div>

      <div class="helpful-links">
        <h3>🔗 Helpful Resources</h3>
        <ul>
          <li><a href="https://www.nj.gov/dca/divisions/codes/" target="_blank">NJ DCA - Division of Codes & Standards</a></li>
          <li><a href="https://newjersey.mylicense.com/verification/" target="_blank">Verify NJ Contractor License</a></li>
          <li><a href="/build/nj-codes-permits/">Full NJ Codes & Permits Guide</a></li>
        </ul>
      </div>
    </div>

    <style>
      .permit-helper { max-width: 800px; margin: 0 auto; }
      .permit-intro {
        background: #eff6ff;
        padding: 1.5rem;
        border-radius: 8px;
        margin-bottom: 2rem;
        border-left: 4px solid #3b82f6;
      }
      .permit-quiz {
        background: white;
        padding: 2rem;
        border-radius: 8px;
        margin-bottom: 2rem;
      }
      .permit-quiz h3 {
        font-size: 1.25rem;
        margin-bottom: 1rem;
        color: #1a1a1a;
      }
      .quiz-question {
        margin: 1.5rem 0;
        padding: 1rem;
        background: #f9fafb;
        border-radius: 6px;
      }
      .quiz-question p {
        font-weight: 600;
        margin-bottom: 0.75rem;
        color: #374151;
      }
      .quiz-question label {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        margin-right: 1.5rem;
        cursor: pointer;
      }
      .quiz-btn {
        background: #10b981;
        color: white;
        border: none;
        padding: 0.75rem 2rem;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        margin-top: 1rem;
      }
      .quiz-result {
        margin-top: 1.5rem;
        padding: 1.5rem;
        border-radius: 8px;
        font-size: 1rem;
      }
      .permit-process {
        background: white;
        padding: 2rem;
        border-radius: 8px;
        margin-bottom: 2rem;
      }
      .permit-process h3 {
        font-size: 1.25rem;
        margin-bottom: 1.5rem;
        color: #1a1a1a;
      }
      .process-step {
        display: flex;
        gap: 1.5rem;
        margin-bottom: 2rem;
      }
      .step-num {
        flex-shrink: 0;
        width: 40px;
        height: 40px;
        background: #10b981;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 1.1rem;
      }
      .step-content h4 {
        font-size: 1.1rem;
        margin-bottom: 0.5rem;
        color: #1a1a1a;
      }
      .step-content ul {
        margin-top: 0.5rem;
        padding-left: 1.5rem;
      }
      .step-content li {
        margin-bottom: 0.25rem;
        color: #4b5563;
      }
      .permit-costs {
        background: #f0fdf4;
        padding: 2rem;
        border-radius: 8px;
        border-left: 4px solid #10b981;
        margin-bottom: 2rem;
      }
      .permit-costs h3 {
        font-size: 1.25rem;
        margin-bottom: 1.5rem;
        color: #065f46;
      }
      .cost-breakdown {
        margin-bottom: 1rem;
      }
      .cost-item {
        display: flex;
        justify-content: space-between;
        padding: 0.75rem;
        background: white;
        border-radius: 6px;
        margin-bottom: 0.5rem;
        color: #065f46;
      }
      .cost-note {
        margin-top: 1rem;
        font-size: 0.9rem;
        color: #065f46;
        font-style: italic;
      }
      .municipality-contacts {
        background: white;
        padding: 2rem;
        border-radius: 8px;
        margin-bottom: 2rem;
      }
      .municipality-contacts h3 {
        font-size: 1.25rem;
        margin-bottom: 1.5rem;
        color: #1a1a1a;
      }
      .contact-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        margin-bottom: 1.5rem;
      }
      .contact-card {
        padding: 1.5rem;
        background: #f9fafb;
        border-radius: 8px;
        border: 1px solid #e5e7eb;
      }
      .contact-card h4 {
        font-size: 1.1rem;
        margin-bottom: 0.75rem;
        color: #1a1a1a;
      }
      .contact-card p {
        margin-bottom: 0.5rem;
        color: #4b5563;
      }
      .contact-card a {
        color: #10b981;
        text-decoration: none;
      }
      .contact-note {
        background: #fef3c7;
        padding: 1rem;
        border-radius: 6px;
        border-left: 3px solid #f59e0b;
        color: #78350f;
        font-size: 0.95rem;
      }
      .permit-warning {
        background: #fee2e2;
        padding: 2rem;
        border-radius: 8px;
        border-left: 4px solid #ef4444;
        margin-bottom: 2rem;
      }
      .permit-warning h3 {
        font-size: 1.25rem;
        margin-bottom: 1rem;
        color: #991b1b;
      }
      .permit-warning ul {
        padding-left: 0;
        list-style: none;
      }
      .permit-warning li {
        padding: 0.75rem;
        margin-bottom: 0.5rem;
        background: white;
        border-radius: 6px;
        color: #7f1d1d;
      }
      .helpful-links {
        background: white;
        padding: 2rem;
        border-radius: 8px;
      }
      .helpful-links h3 {
        font-size: 1.25rem;
        margin-bottom: 1rem;
        color: #1a1a1a;
      }
      .helpful-links ul {
        padding-left: 1.5rem;
      }
      .helpful-links li {
        margin-bottom: 0.75rem;
      }
      .helpful-links a {
        color: #10b981;
        text-decoration: none;
        font-weight: 500;
      }
      .helpful-links a:hover {
        text-decoration: underline;
      }
    </style>
  `;
}

function evaluatePermitNeed() {
  const q1 = document.querySelector('input[name="q1"]:checked');
  const q2 = document.querySelector('input[name="q2"]:checked');
  const q3 = document.querySelector('input[name="q3"]:checked');
  const q4 = document.querySelector('input[name="q4"]:checked');
  
  if (!q1 || !q2 || !q3 || !q4) {
    alert('Please answer all questions');
    return;
  }
  
  const needsPermit = q1.value === 'yes' || q2.value === 'yes' || q3.value === 'yes' || q4.value === 'yes';
  
  const resultDiv = document.getElementById('permit-result');
  
  if (needsPermit) {
    resultDiv.style.background = '#fee2e2';
    resultDiv.style.borderLeft = '4px solid #ef4444';
    resultDiv.style.color = '#7f1d1d';
    resultDiv.innerHTML = `
      <h4 style="margin-bottom: 0.75rem; font-size: 1.1rem;">✋ Yes, You Likely Need a Permit</h4>
      <p>Based on your answers, your project requires permit(s) for:</p>
      <ul style="margin: 1rem 0; padding-left: 1.5rem;">
        ${q1.value === 'yes' ? '<li>Plumbing modifications</li>' : ''}
        ${q2.value === 'yes' ? '<li>Electrical work</li>' : ''}
        ${q3.value === 'yes' ? '<li>Structural changes</li>' : ''}
        ${q4.value === 'yes' ? '<li>Plumbing fixture relocation</li>' : ''}
      </ul>
      <p><strong>Next step:</strong> Your contractor should handle permit applications. If they suggest skipping permits, find a different contractor.</p>
    `;
  } else {
    resultDiv.style.background = '#f0fdf4';
    resultDiv.style.borderLeft = '4px solid #10b981';
    resultDiv.style.color = '#065f46';
    resultDiv.innerHTML = `
      <h4 style="margin-bottom: 0.75rem; font-size: 1.1rem;">✅ You May Not Need a Permit</h4>
      <p>Based on your answers, your project appears to be cosmetic only (tile replacement, fixture upgrades without relocation).</p>
      <p style="margin-top: 1rem;"><strong>Important:</strong> Always call your local building department to confirm. Requirements vary by municipality, and it's better to ask than assume.</p>
    `;
  }
}

// Article content generators
function getTimelineArticleHTML() {
  return `
    <div class="article-content">
      <h3>Understanding Bathroom Remodel Timeline</h3>
      <p>A typical bathroom remodel in South Jersey takes 2-3 weeks once work begins. Here's the realistic breakdown:</p>
      
      <h4>Week 1: Demolition & Rough Work</h4>
      <ul>
        <li><strong>Day 1-2:</strong> Demolition (remove old tile, fixtures, vanity)</li>
        <li><strong>Day 3-4:</strong> Rough plumbing (new pipes, drain relocation if needed)</li>
        <li><strong>Day 4-5:</strong> Rough electrical (outlets, lights, exhaust fan)</li>
        <li><strong>Inspection:</strong> Rough plumbing/electrical inspection (varies by town)</li>
      </ul>

      <h4>Week 2: Waterproofing & Tile Prep</h4>
      <ul>
        <li><strong>Day 6-7:</strong> Substrate preparation (cement board, floor mud, etc.)</li>
        <li><strong>Day 8-9:</strong> Waterproofing installation (Schluter, Wedi, or similar)</li>
        <li><strong>Day 10:</strong> Cure time / flood test (24-48 hours)</li>
        <li><strong>Inspection:</strong> Waterproofing inspection (if required)</li>
      </ul>

      <h4>Week 3: Tile Installation & Finishing</h4>
      <ul>
        <li><strong>Day 11-13:</strong> Floor tile installation</li>
        <li><strong>Day 14-16:</strong> Wall/shower tile installation</li>
        <li><strong>Day 17:</strong> Grouting (usually 24-48 hours after tile set)</li>
        <li><strong>Day 18-19:</strong> Fixture installation, trim work, caulking</li>
        <li><strong>Day 20:</strong> Final inspection, cleanup, walkthrough</li>
      </ul>

      <h4>What Can Cause Delays?</h4>
      <ul>
        <li>Hidden damage discovered during demo (rotten subfloor, mold)</li>
        <li>Material delivery delays (custom tile can take 6-8 weeks)</li>
        <li>Weather (affects delivery and some curing times)</li>
        <li>Inspection scheduling (some towns book 1-2 weeks out)</li>
        <li>Change orders (design changes mid-project)</li>
      </ul>

      <p><strong>Pro Tip:</strong> Add 1 week buffer to timeline for unexpected issues. Murphy's Law applies to remodels!</p>
    </div>
  `;
}

function getCostArticleHTML() {
  return `
    <div class="article-content">
      <h3>Bathroom Remodel Costs in South Jersey</h3>
      
      <h4>Average Cost Ranges (2024)</h4>
      <ul>
        <li><strong>Budget Refresh:</strong> $5,000-$10,000 (cosmetic updates, keep existing layout)</li>
        <li><strong>Mid-Range Remodel:</strong> $12,000-$22,000 (new tile, fixtures, minor plumbing)</li>
        <li><strong>Upscale Remodel:</strong> $25,000-$40,000 (high-end materials, layout changes)</li>
        <li><strong>Luxury Master:</strong> $45,000+ (custom everything, large space, premium finishes)</li>
      </ul>

      <h4>Cost Breakdown (Typical Mid-Range Project)</h4>
      <ul>
        <li><strong>Labor:</strong> 40-50% ($5,600-$11,000)</li>
        <li><strong>Materials:</strong> 35-40% ($4,900-$8,800)</li>
        <li><strong>Fixtures:</strong> 10-15% ($1,400-$3,300)</li>
        <li><strong>Permits & Fees:</strong> 2-3% ($280-$660)</li>
        <li><strong>Contingency:</strong> 10-15% ($1,400-$3,300)</li>
      </ul>

      <h4>What Drives Cost Up?</h4>
      <ul>
        <li>Bathroom size (larger = more materials, more labor)</li>
        <li>Tile quality (budget $3/sf vs. luxury $30/sf)</li>
        <li>Layout changes (moving plumbing is expensive)</li>
        <li>Custom features (built-in niches, benches, steam shower)</li>
        <li>Structural issues (rotten subfloor, mold remediation)</li>
        <li>High-end fixtures (luxury shower system $2,000+)</li>
      </ul>

      <h4>Where to Save vs. Splurge</h4>
      <p><strong>Worth Splurging On:</strong></p>
      <ul>
        <li>Waterproofing system (never cheap out here!)</li>
        <li>Quality tile (you'll see it every day for 20+ years)</li>
        <li>Professional installation (do it right the first time)</li>
        <li>Shower fixtures (better quality = longer lasting)</li>
      </ul>

      <p><strong>Safe to Save On:</strong></p>
      <ul>
        <li>Vanity (easy to upgrade later)</li>
        <li>Lighting fixtures (can swap anytime)</li>
        <li>Accessories (towel bars, mirrors, etc.)</li>
        <li>Paint (DIY project)</li>
      </ul>

      <p><strong>Use our <a href="#" onclick="showBudgetCalculator(); return false;">Budget Calculator</a> for your specific project estimate.</strong></p>
    </div>
  `;
}

function getShowerComparisonHTML() {
  return `
    <div class="article-content">
      <h3>Curbless Shower vs. Traditional: Complete Comparison</h3>
      
      <div class="comparison-grid">
        <div class="comparison-column">
          <h4>🚿 Curbless Shower</h4>
          
          <p><strong>What It Is:</strong></p>
          <p>Walk-in shower with no threshold or curb. Floor slopes gradually to drain.</p>
          
          <p><strong>Advantages:</strong></p>
          <ul>
            <li>Accessible (wheelchair, walker, aging in place)</li>
            <li>Modern, spa-like aesthetic</li>
            <li>Easier to clean (no curb to scrub around)</li>
            <li>Makes small bathroom feel larger</li>
            <li>Safer (no trip hazard)</li>
          </ul>
          
          <p><strong>Challenges:</strong></p>
          <ul>
            <li>Requires proper slope (1/4" per foot minimum)</li>
            <li>More complex waterproofing</li>
            <li>May need linear drain ($300-$800)</li>
            <li>Water can escape without glass enclosure</li>
            <li>Higher installation cost (+$1,500-$3,000)</li>
            <li>Not ideal for very small bathrooms</li>
          </ul>
          
          <p><strong>Best For:</strong></p>
          <ul>
            <li>Master bathrooms (8x10'+)</li>
            <li>Aging in place / accessibility</li>
            <li>Modern design aesthetic</li>
            <li>Remodels with flexibility to lower subfloor</li>
          </ul>
          
          <p><strong>Cost:</strong> $5,000-$8,000</p>
        </div>

        <div class="comparison-column">
          <h4>🛁 Traditional Curb Shower</h4>
          
          <p><strong>What It Is:</strong></p>
          <p>Shower with 3-6" curb (threshold) to contain water. Standard design.</p>
          
          <p><strong>Advantages:</strong></p>
          <ul>
            <li>Better water containment</li>
            <li>Works in any size bathroom</li>
            <li>Simpler installation process</li>
            <li>More economical</li>
            <li>Standard for most homes</li>
            <li>Easier to retrofit</li>
          </ul>
          
          <p><strong>Challenges:</strong></p>
          <ul>
            <li>Curb is a trip hazard (especially for elderly)</li>
            <li>Harder to clean around curb</li>
            <li>Not wheelchair accessible</li>
            <li>Less modern aesthetic</li>
          </ul>
          
          <p><strong>Best For:</strong></p>
          <ul>
            <li>Small to medium bathrooms</li>
            <li>Budget-conscious projects</li>
            <li>Standard home construction</li>
            <li>Secondary bathrooms</li>
            <li>Rental properties</li>
          </ul>
          
          <p><strong>Cost:</strong> $3,500-$5,500</p>
        </div>
      </div>

      <h4>Important Technical Requirements for Curbless</h4>
      <ul>
        <li><strong>Slope:</strong> Minimum 1/4" per foot slope to drain (some codes require 1/2" per foot)</li>
        <li><strong>Floor Height:</strong> Often need to lower subfloor or raise entire bathroom floor</li>
        <li><strong>Waterproofing:</strong> Must extend well beyond shower area</li>
        <li><strong>Drain:</strong> Linear drain recommended (easier to achieve proper slope)</li>
        <li><strong>Glass Enclosure:</strong> Usually needed to prevent water escape</li>
        <li><strong>Bathroom Size:</strong> Minimum 5x8' recommended</li>
      </ul>

      <h4>The Verdict</h4>
      <p><strong>Choose Curbless If:</strong> You have space, budget allows, want modern look, or need accessibility.</p>
      <p><strong>Choose Traditional If:</strong> Small bathroom, tighter budget, or renting/flipping property.</p>
      <p><strong>Not Sure?</strong> Get a professional assessment during your consultation. We can evaluate your space and recommend the best option.</p>
    </div>

    <style>
      .article-content h3 {
        font-size: 1.5rem;
        margin-bottom: 1.5rem;
        color: #1a1a1a;
      }
      .article-content h4 {
        font-size: 1.15rem;
        margin: 1.5rem 0 1rem;
        color: #374151;
      }
      .article-content p {
        margin-bottom: 1rem;
        line-height: 1.6;
        color: #4b5563;
      }
      .article-content ul {
        margin: 1rem 0;
        padding-left: 1.5rem;
      }
      .article-content li {
        margin-bottom: 0.5rem;
        line-height: 1.6;
        color: #4b5563;
      }
      .comparison-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: 2rem;
        margin: 2rem 0;
      }
      .comparison-column {
        background: white;
        padding: 2rem;
        border-radius: 8px;
        border: 2px solid #e5e7eb;
      }
      .comparison-column h4 {
        background: #10b981;
        color: white;
        padding: 1rem;
        margin: -2rem -2rem 1.5rem -2rem;
        border-radius: 6px 6px 0 0;
        font-size: 1.25rem;
      }
    </style>
  `;
}

// PDF Generation placeholders (would integrate with jsPDF in production)
function generateProjectPlanner() {
  alert('PDF generation would be implemented here using jsPDF library. For now, you can print this page (Ctrl/Cmd+P) and select "Save as PDF".');
}

function generateContractorChecklist() {
  alert('PDF generation would be implemented here using jsPDF library. For now, you can print this page (Ctrl/Cmd+P) and select "Save as PDF".');
}

function generateSpecTemplate() {
  alert('PDF generation would be implemented here using jsPDF library. For now, you can print this page (Ctrl/Cmd+P) and select "Save as PDF".');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  console.log('Homeowner Resources loaded');
});
