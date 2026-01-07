#!/usr/bin/env node
/**
 * Icon Placement Designer Script
 * Intelligently places SVG icons throughout the Tillerstead site
 * for maximum visual impact and user experience
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Icon placement strategy mapping
const ICON_PLACEMENTS = {
  // Trust bar - certifications and credentials
  "trust-bar.html": {
    replacements: [
      {
        search: /<li class="trust-bar__item">NJ HIC #13VH10808800<\/li>/,
        replace: `<li class="trust-bar__item">
        <svg class="ts-trust-icon" aria-hidden="true" focusable="false">
          <use href="#icon-badge"></use>
        </svg>
        <span>NJ HIC #13VH10808800</span>
      </li>`,
      },
      {
        search: /<li class="trust-bar__item">TCNA 2024 Compliant<\/li>/,
        replace: `<li class="trust-bar__item">
        <svg class="ts-trust-icon" aria-hidden="true" focusable="false">
          <use href="#icon-check-circle"></use>
        </svg>
        <span>TCNA 2024 Compliant</span>
      </li>`,
      },
      {
        search: /<li class="trust-bar__item">Fully Insured<\/li>/,
        replace: `<li class="trust-bar__item">
        <svg class="ts-trust-icon" aria-hidden="true" focusable="false">
          <use href="#icon-badge"></use>
        </svg>
        <span>Fully Insured</span>
      </li>`,
      },
    ],
  },

  // CTA Section - call-to-action with phone icon
  "cta-section.html": {
    insertions: [
      {
        after: /<a[^>]+class="[^"]*btn[^"]*"[^>]*href="tel:/,
        insert: `
      <svg class="ts-icon ts-icon--sm" aria-hidden="true" focusable="false">
        <use href="#icon-phone"></use>
      </svg>
      `,
      },
      {
        after: /<a[^>]+class="[^"]*btn[^"]*"[^>]*href="mailto:/,
        insert: `
      <svg class="ts-icon ts-icon--sm" aria-hidden="true" focusable="false">
        <use href="#icon-mail"></use>
      </svg>
      `,
      },
    ],
  },

  // Footer - contact information
  "footer.html": {
    replacements: [
      {
        search: /class="footer-phone"/,
        replace: `class="footer-phone">\n        <svg class="ts-icon ts-icon--sm" aria-hidden="true" focusable="false">
          <use href="#icon-phone"></use>
        </svg>
        <span`,
      },
      {
        search: /class="footer-email"/,
        replace: `class="footer-email">\n        <svg class="ts-icon ts-icon--sm" aria-hidden="true" focusable="false">
          <use href="#icon-mail"></use>
        </svg>
        <span`,
      },
    ],
  },

  // Hero facts - feature highlights
  "page-hero.html": {
    patterns: [
      {
        fact: "TCNA",
        icon: "check-circle",
      },
      {
        fact: "Licensed",
        icon: "badge",
      },
      {
        fact: "Documented",
        icon: "document",
      },
      {
        fact: "Verified",
        icon: "clipboard",
      },
    ],
  },
};

// Service to icon mapping
const SERVICE_ICONS = {
  tile: "icon-tile",
  stone: "icon-stone",
  waterproofing: "icon-waterproofing",
  flooring: "icon-tile",
  bathroom: "icon-waterproofing",
  shower: "icon-waterproofing",
};

// Process step icons
const PROCESS_ICONS = [
  "clipboard", // 1. Initial consultation
  "ruler", // 2. Measurement & planning
  "document", // 3. Detailed proposal
  "check-circle", // 4. Material selection
  "tool", // 5. Installation
  "badge", // 6. Final inspection
];

console.log("🎨 Tillerstead Icon Placement Designer\n");
console.log("=".repeat(50));

/**
 * Apply icon to trust bar items
 */
function enhanceTrustBar() {
  const filePath = path.join(__dirname, "../_includes/trust-bar.html");

  if (!fs.existsSync(filePath)) {
    console.log("⚠️  Trust bar not found, skipping...");
    return;
  }

  let content = fs.readFileSync(filePath, "utf8");
  const original = content;

  // Add icons to each trust bar item
  content = content.replace(
    /<li class="trust-bar__item">NJ HIC #([^<]+)<\/li>/,
    `<li class="trust-bar__item">
      <svg class="ts-trust-icon" aria-hidden="true" focusable="false">
        <use href="#icon-badge"></use>
      </svg>
      <span>NJ HIC #$1</span>
    </li>`,
  );

  content = content.replace(
    /<li class="trust-bar__item">TCNA ([^<]+)<\/li>/,
    `<li class="trust-bar__item">
      <svg class="ts-trust-icon" aria-hidden="true" focusable="false">
        <use href="#icon-check-circle"></use>
      </svg>
      <span>TCNA $1</span>
    </li>`,
  );

  content = content.replace(
    /<li class="trust-bar__item">Fully Insured<\/li>/,
    `<li class="trust-bar__item">
      <svg class="ts-trust-icon" aria-hidden="true" focusable="false">
        <use href="#icon-badge"></use>
      </svg>
      <span>Fully Insured</span>
    </li>`,
  );

  if (content !== original) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log("✅ Enhanced trust-bar.html with icons");
  }
}

/**
 * Add icons to CTA buttons
 */
function enhanceCTA() {
  const filePath = path.join(__dirname, "../_includes/cta-section.html");

  if (!fs.existsSync(filePath)) {
    console.log("⚠️  CTA section not found, skipping...");
    return;
  }

  let content = fs.readFileSync(filePath, "utf8");
  const original = content;

  // Add phone icon to phone CTAs
  if (content.includes("tel:") && !content.includes("#icon-phone")) {
    content = content.replace(
      /(href="tel:[^"]+">)\s*([^<]+)/g,
      `$1
        <svg class="ts-icon ts-icon--sm" aria-hidden="true" focusable="false">
          <use href="#icon-phone"></use>
        </svg>
        <span>$2</span>`,
    );
  }

  // Add mail icon to email CTAs
  if (content.includes("mailto:") && !content.includes("#icon-mail")) {
    content = content.replace(
      /(href="mailto:[^"]+">)\s*([^<]+)/g,
      `$1
        <svg class="ts-icon ts-icon--sm" aria-hidden="true" focusable="false">
          <use href="#icon-mail"></use>
        </svg>
        <span>$2</span>`,
    );
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log("✅ Enhanced cta-section.html with icons");
  }
}

/**
 * Create enhanced process section with icons
 */
function createProcessSection() {
  const filePath = path.join(__dirname, "../_includes/sections/process.html");

  const processContent = `{% comment %}
Process Section - TCNA-compliant workflow with icons
{% endcomment %}

<section class="ts-section ts-process">
  <div class="container">
    
    <header class="section-header text-center">
      <p class="eyebrow">Our Process</p>
      <h2 class="heading-2">TCNA-Compliant Installation Process</h2>
      <p class="lead">Every project follows strict industry standards from consultation to completion</p>
    </header>

    <div class="ts-process__grid">
      
      <article class="ts-process__step">
        <div class="ts-process__icon">
          <svg class="ts-icon" aria-hidden="true" focusable="false">
            <use href="#icon-clipboard"></use>
          </svg>
        </div>
        <div class="ts-process__content">
          <h3 class="ts-process__title">1. Initial Consultation</h3>
          <p class="ts-process__description">
            Free on-site assessment, substrate evaluation, and project scoping with transparent pricing
          </p>
        </div>
      </article>

      <article class="ts-process__step">
        <div class="ts-process__icon">
          <svg class="ts-icon" aria-hidden="true" focusable="false">
            <use href="#icon-ruler"></use>
          </svg>
        </div>
        <div class="ts-process__content">
          <h3 class="ts-process__title">2. Measurement & Planning</h3>
          <p class="ts-process__description">
            Precise measurements, layout planning, and material calculations following TCNA guidelines
          </p>
        </div>
      </article>

      <article class="ts-process__step">
        <div class="ts-process__icon">
          <svg class="ts-icon" aria-hidden="true" focusable="false">
            <use href="#icon-document"></use>
          </svg>
        </div>
        <div class="ts-process__content">
          <h3 class="ts-process__title">3. Detailed Proposal</h3>
          <p class="ts-process__description">
            Written scope, itemized pricing, timeline, and TCNA method specifications
          </p>
        </div>
      </article>

      <article class="ts-process__step">
        <div class="ts-process__icon">
          <svg class="ts-icon" aria-hidden="true" focusable="false">
            <use href="#icon-check-circle"></use>
          </svg>
        </div>
        <div class="ts-process__content">
          <h3 class="ts-process__title">4. Material Selection</h3>
          <p class="ts-process__description">
            Tile, stone, and installation materials sourced to match specifications and budget
          </p>
        </div>
      </article>

      <article class="ts-process__step">
        <div class="ts-process__icon">
          <svg class="ts-icon" aria-hidden="true" focusable="false">
            <use href="#icon-tool"></use>
          </svg>
        </div>
        <div class="ts-process__content">
          <h3 class="ts-process__title">5. Expert Installation</h3>
          <p class="ts-process__description">
            TCNA-compliant installation with proper substrate prep, waterproofing, and setting methods
          </p>
        </div>
      </article>

      <article class="ts-process__step">
        <div class="ts-process__icon">
          <svg class="ts-icon" aria-hidden="true" focusable="false">
            <use href="#icon-badge"></use>
          </svg>
        </div>
        <div class="ts-process__content">
          <h3 class="ts-process__title">6. Final Inspection</h3>
          <p class="ts-process__description">
            Quality verification, flood testing (showers), and complete documentation delivery
          </p>
        </div>
      </article>

    </div>

  </div>
</section>`;

  fs.writeFileSync(filePath, processContent, "utf8");
  console.log("✅ Created process.html with step icons");
}

/**
 * Create process step CSS
 */
function createProcessCSS() {
  const cssPath = path.join(__dirname, "../_sass/30-components/_process.scss");

  const processCSS = `/* ============================================
  Process Section with Icon Steps
  ============================================ */

.ts-process {
  background: var(--ts-color-surface-muted);
}

.ts-process__grid {
  display: grid;
  gap: var(--ts-spacing-lg);
  margin-top: var(--ts-spacing-xl);
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
}

.ts-process__step {
  display: flex;
  flex-direction: column;
  gap: var(--ts-spacing-md);
  padding: var(--ts-spacing-lg);
  background: var(--ts-color-surface);
  border: 1px solid var(--ts-color-border);
  border-radius: var(--ts-radius-lg);
  transition: all var(--tiller-duration-base) var(--tiller-ease-standard);
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--ts-shadow-lift);
    border-color: var(--ts-color-primary);
  }
}

.ts-process__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--ts-color-primary) 0%, var(--ts-color-primary-strong) 100%);
  box-shadow: 0 4px 12px rgba(13, 154, 170, 0.25);
  flex-shrink: 0;
  
  .ts-icon {
    width: 2rem;
    height: 2rem;
    color: var(--ts-white);
  }
  
  .ts-process__step:hover & {
    transform: scale(1.1) rotate(5deg);
    box-shadow: 0 6px 16px rgba(13, 154, 170, 0.35);
  }
}

.ts-process__content {
  flex: 1;
}

.ts-process__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--ts-color-heading);
  margin: 0 0 var(--ts-spacing-sm);
}

.ts-process__description {
  font-size: var(--font-size-sm);
  line-height: var(--font-line-height-relaxed);
  color: var(--ts-color-muted);
  margin: 0;
}

@media (max-width: 767px) {
  .ts-process__step {
    flex-direction: row;
    align-items: flex-start;
    gap: var(--ts-spacing-md);
  }
  
  .ts-process__icon {
    width: 3rem;
    height: 3rem;
    
    .ts-icon {
      width: 1.5rem;
      height: 1.5rem;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .ts-process__step,
  .ts-process__icon {
    transition: none;
  }
  
  .ts-process__step:hover,
  .ts-process__step:hover .ts-process__icon {
    transform: none;
  }
}
`;

  fs.writeFileSync(cssPath, processCSS, "utf8");
  console.log("✅ Created _process.scss with step styling");
}

/**
 * Update style.scss to include process styles
 */
function updateMainSCSS() {
  const scssPath = path.join(__dirname, "../assets/css/style.scss");
  let content = fs.readFileSync(scssPath, "utf8");

  if (!content.includes("30-components/process")) {
    content = content.replace(
      /@import "30-components\/icons";/,
      `@import "30-components/icons";\n@import "30-components/process";`,
    );

    fs.writeFileSync(scssPath, content, "utf8");
    console.log("✅ Updated style.scss with process import");
  }
}

/**
 * Create icon usage guide
 */
function createIconGuide() {
  const guidePath = path.join(__dirname, "../ICON_PLACEMENT_GUIDE.md");

  const guide = `# Icon Placement Guide

## 🎯 Strategic Icon Placement

### Trust Bar
- **Badge icon** → License numbers and certifications
- **Check-circle icon** → Compliance statements
- **Map-pin icon** → Service area

### CTAs (Call-to-Actions)
- **Phone icon** → Phone number links
- **Mail icon** → Email links
- **Arrow-right icon** → General CTAs

### Process Steps
1. **Clipboard** → Initial consultation
2. **Ruler** → Measurement & planning
3. **Document** → Detailed proposal
4. **Check-circle** → Material selection
5. **Tool** → Expert installation
6. **Badge** → Final inspection

### Service Cards
- **Tile icon** → Tile installation services
- **Stone icon** → Stone & countertop services
- **Waterproofing icon** → Shower & bathroom services

### Hero Facts
- **Check-circle** → TCNA compliance
- **Badge** → Licensing info
- **Document** → Documentation practices
- **Clipboard** → Verification processes

### Footer Contact
- **Phone icon** → Phone number
- **Mail icon** → Email address
- **Map-pin icon** → Physical address

## 🎨 Icon Color Strategy

- **Primary (Teal)** → TCNA, professional credentials
- **Accent (Gold)** → Premium services, highlights
- **Success (Green)** → Completions, approvals
- **Muted (Gray)** → Secondary information

## 📐 Icon Size Strategy

- **xs/sm** → Inline with text (trust bar, footer)
- **md/lg** → Feature highlights, process steps
- **xl/2xl** → Hero sections, major features
- **3xl** → Service cards, primary features
`;

  fs.writeFileSync(guidePath, guide, "utf8");
  console.log("✅ Created ICON_PLACEMENT_GUIDE.md");
}

// Execute all enhancements
async function main() {
  try {
    console.log("\n📍 Step 1: Enhancing Trust Bar...");
    enhanceTrustBar();

    console.log("\n📍 Step 2: Enhancing CTA Sections...");
    enhanceCTA();

    console.log("\n📍 Step 3: Creating Process Section...");
    createProcessSection();

    console.log("\n📍 Step 4: Creating Process Styles...");
    createProcessCSS();

    console.log("\n📍 Step 5: Updating Main SCSS...");
    updateMainSCSS();

    console.log("\n📍 Step 6: Creating Icon Placement Guide...");
    createIconGuide();

    console.log("\n" + "=".repeat(50));
    console.log("✨ Icon placement design complete!\n");
    console.log("Next steps:");
    console.log("1. Run: npm run build:css");
    console.log("2. Run: npm run build");
    console.log("3. Review the changes");
    console.log(
      '4. Commit with: git add -A && git commit -m "Implement strategic icon placement"',
    );
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

main();
