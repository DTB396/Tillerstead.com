/**
 * Tillerstead Formula Library - Rounding Module
 * 
 * Standard rounding strategies for material calculations.
 * Round UP for materials to ensure sufficient quantity.
 * 
 * @module rounding
 */

// ============================================
// ROUNDING FUNCTIONS
// ============================================

/**
 * Round up to nearest integer (ceiling)
 * Used for: bags, boxes, tiles, rolls - any discrete unit
 * @param {number} value
 * @returns {number}
 */
export function roundUp(value) {
  return Math.ceil(value);
}

/**
 * Round to nearest integer
 * @param {number} value
 * @returns {number}
 */
export function roundNearest(value) {
  return Math.round(value);
}

/**
 * Round down to nearest integer (floor)
 * @param {number} value
 * @returns {number}
 */
export function roundDown(value) {
  return Math.floor(value);
}

/**
 * Round to specified decimal places
 * @param {number} value
 * @param {number} decimals
 * @returns {number}
 */
export function roundToDecimals(value, decimals) {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Round up to nearest fraction (e.g., nearest 1/8")
 * @param {number} value
 * @param {number} fraction - e.g., 8 for eighths, 16 for sixteenths
 * @returns {number}
 */
export function roundUpToFraction(value, fraction) {
  return Math.ceil(value * fraction) / fraction;
}

/**
 * Round to nearest common fraction for display
 * @param {number} value
 * @returns {string} formatted fraction string
 */
export function toFractionString(value) {
  const fractions = [
    { decimal: 0, display: '0' },
    { decimal: 0.0625, display: '1/16' },
    { decimal: 0.125, display: '1/8' },
    { decimal: 0.1875, display: '3/16' },
    { decimal: 0.25, display: '1/4' },
    { decimal: 0.3125, display: '5/16' },
    { decimal: 0.375, display: '3/8' },
    { decimal: 0.4375, display: '7/16' },
    { decimal: 0.5, display: '1/2' },
    { decimal: 0.5625, display: '9/16' },
    { decimal: 0.625, display: '5/8' },
    { decimal: 0.6875, display: '11/16' },
    { decimal: 0.75, display: '3/4' },
    { decimal: 0.8125, display: '13/16' },
    { decimal: 0.875, display: '7/8' },
    { decimal: 0.9375, display: '15/16' },
    { decimal: 1, display: '1' }
  ];

  const whole = Math.floor(value);
  const decimal = value - whole;

  // Find closest fraction
  let closest = fractions[0];
  let minDiff = Math.abs(decimal - fractions[0].decimal);

  for (const frac of fractions) {
    const diff = Math.abs(decimal - frac.decimal);
    if (diff < minDiff) {
      minDiff = diff;
      closest = frac;
    }
  }

  if (closest.decimal === 0) {
    return whole.toString();
  }
  if (closest.decimal === 1) {
    return (whole + 1).toString();
  }
  if (whole === 0) {
    return closest.display;
  }
  return `${whole} ${closest.display}`;
}

/**
 * Format inches as whole + fraction string (e.g., "3 1/4"")
 * @param {number} inches
 * @returns {string}
 */
export function formatInches(inches) {
  const frac = toFractionString(inches);
  return `${frac}"`;
}

// ============================================
// NUMBER FORMATTING
// ============================================

/**
 * Format number with thousands separator
 * @param {number} num
 * @param {number} decimals
 * @returns {string}
 */
export function formatNumber(num, decimals = 0) {
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * Format number as currency
 * @param {number} num
 * @returns {string}
 */
export function formatCurrency(num) {
  return num.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

/**
 * Format a range (e.g., "10-15")
 * @param {number} min
 * @param {number} max
 * @param {string} unit
 * @returns {string}
 */
export function formatRange(min, max, unit = '') {
  if (min === max) {
    return `${formatNumber(min)}${unit ? ' ' + unit : ''}`;
  }
  return `${formatNumber(min)}–${formatNumber(max)}${unit ? ' ' + unit : ''}`;
}
