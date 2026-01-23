/**
 * Tillerstead project constants
 */

export const TILLERSTEAD_CONSTANTS = {
  // Project info
  PROJECT_NAME: 'Tillerstead.com',
  COMPANY: 'Tillerstead LLC',
  
  // Quality thresholds
  PERFORMANCE: {
    LCP_THRESHOLD: 2.5, // seconds
    FCP_THRESHOLD: 1.8,
    CLS_THRESHOLD: 0.1,
    TTI_THRESHOLD: 3.0,
  },
  
  ACCESSIBILITY: {
    MIN_CONTRAST_NORMAL: 4.5,
    MIN_CONTRAST_LARGE: 3.0,
    WCAG_LEVEL: 'AA',
  },
  
  // File patterns
  INCLUDE_EXTENSIONS: ['.html', '.md'],
  SASS_EXTENSIONS: ['.scss', '.sass'],
  JS_EXTENSIONS: ['.js', '.mjs', '.ts'],
  
  // Naming conventions
  NAMING: {
    SECTION_PREFIX: 'section-',
    COMPONENT_PREFIX: 'c-',
    SCHEMA_PREFIX: 'schema-',
    PAGE_PREFIX: 'page-',
  },
  
  // Compliance
  COMPLIANCE: {
    TCNA_YEAR: '2024',
    STATE: 'New Jersey',
    LICENSE_TYPE: 'HIC',
  },
  
  // SEO
  SEO: {
    TITLE_LENGTH: { min: 50, max: 60 },
    DESCRIPTION_LENGTH: { min: 150, max: 160 },
  },
} as const;

export const CATEGORY_SCORES = {
  components: 50,
  sections: 40,
  layout: 40,
  navigation: 35,
  forms: 30,
  schema: 30,
  content: 20,
  other: 10,
} as const;

export const PENALTY_PATTERNS = [
  { pattern: /backup|old|temp|archive/i, score: -100 },
  { pattern: /deprecated/i, score: -90 },
  { pattern: /legacy/i, score: -85 },
  { pattern: /copy/i, score: -80 },
  { pattern: /\d{4}-\d{2}/i, score: -70 },
  { pattern: /v\d+/i, score: -60 },
  { pattern: /^_/, score: -20 },
] as const;
