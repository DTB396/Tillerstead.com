/**
 * Tillerstead Formula Library - Unit Conversion Module
 * 
 * All conversions are mathematically exact constants.
 * No manufacturer-specific assumptions in this module.
 * 
 * @module units
 */

// ==
// CONVERSION CONSTANTS (exact mathematical values)
// ==

export const CONVERSIONS = {
  // Length
  INCHES_PER_FOOT: 12,
  FEET_PER_YARD: 3,
  MM_PER_INCH: 25.4,
  CM_PER_INCH: 2.54,
  METERS_PER_FOOT: 0.3048,

  // Area
  SQ_INCHES_PER_SQ_FOOT: 144,
  SQ_FEET_PER_SQ_YARD: 9,
  SQ_METERS_PER_SQ_FOOT: 0.092903,

  // Volume
  CUBIC_INCHES_PER_CUBIC_FOOT: 1728,
  CUBIC_FEET_PER_CUBIC_YARD: 27,
  LITERS_PER_GALLON: 3.78541,
  GALLONS_PER_CUBIC_FOOT: 7.48052,

  // Weight
  GRAMS_PER_POUND: 453.592,
  KG_PER_POUND: 0.453592,
  POUNDS_PER_KG: 2.20462
};

// ==
// CONVERSION FUNCTIONS
// ==

/**
 * Convert inches to feet
 * @param {number} inches
 * @returns {number} feet
 */
export function inchesToFeet(inches) {
  return inches / CONVERSIONS.INCHES_PER_FOOT;
}

/**
 * Convert feet to inches
 * @param {number} feet
 * @returns {number} inches
 */
export function feetToInches(feet) {
  return feet * CONVERSIONS.INCHES_PER_FOOT;
}

/**
 * Convert feet + inches to decimal feet
 * @param {number} feet
 * @param {number} inches
 * @returns {number} decimal feet
 */
export function toDecimalFeet(feet, inches = 0) {
  const ft = parseFloat(feet) || 0;
  const inc = parseFloat(inches) || 0;
  return ft + inchesToFeet(inc);
}

/**
 * Convert decimal feet to feet and inches object
 * @param {number} decimalFeet
 * @returns {{ feet: number, inches: number }}
 */
export function toFeetAndInches(decimalFeet) {
  const feet = Math.floor(decimalFeet);
  const inches = Math.round((decimalFeet - feet) * CONVERSIONS.INCHES_PER_FOOT);
  return { feet, inches: inches === 12 ? 0 : inches };
}

/**
 * Format decimal feet as "X' Y"" string
 * @param {number} decimalFeet
 * @returns {string}
 */
export function formatFeetInches(decimalFeet) {
  const { feet, inches } = toFeetAndInches(decimalFeet);
  if (inches === 0 && feet > 0) return `${feet}'`;
  return `${feet}' ${inches}"`;
}

/**
 * Convert millimeters to inches
 * @param {number} mm
 * @returns {number} inches
 */
export function mmToInches(mm) {
  return mm / CONVERSIONS.MM_PER_INCH;
}

/**
 * Convert inches to millimeters
 * @param {number} inches
 * @returns {number} mm
 */
export function inchesToMm(inches) {
  return inches * CONVERSIONS.MM_PER_INCH;
}

/**
 * Convert square inches to square feet
 * @param {number} sqInches
 * @returns {number} square feet
 */
export function sqInchesToSqFeet(sqInches) {
  return sqInches / CONVERSIONS.SQ_INCHES_PER_SQ_FOOT;
}

/**
 * Convert square feet to square inches
 * @param {number} sqFeet
 * @returns {number} square inches
 */
export function sqFeetToSqInches(sqFeet) {
  return sqFeet * CONVERSIONS.SQ_INCHES_PER_SQ_FOOT;
}

/**
 * Convert cubic inches to cubic feet
 * @param {number} cuInches
 * @returns {number} cubic feet
 */
export function cuInchesToCuFeet(cuInches) {
  return cuInches / CONVERSIONS.CUBIC_INCHES_PER_CUBIC_FOOT;
}

/**
 * Convert cubic feet to gallons
 * @param {number} cuFeet
 * @returns {number} gallons
 */
export function cuFeetToGallons(cuFeet) {
  return cuFeet * CONVERSIONS.GALLONS_PER_CUBIC_FOOT;
}

/**
 * Convert gallons to cubic feet
 * @param {number} gallons
 * @returns {number} cubic feet
 */
export function gallonsToCuFeet(gallons) {
  return gallons / CONVERSIONS.GALLONS_PER_CUBIC_FOOT;
}

/**
 * Convert pounds to kilograms
 * @param {number} lbs
 * @returns {number} kg
 */
export function lbsToKg(lbs) {
  return lbs * CONVERSIONS.KG_PER_POUND;
}

/**
 * Convert kilograms to pounds
 * @param {number} kg
 * @returns {number} lbs
 */
export function kgToLbs(kg) {
  return kg * CONVERSIONS.POUNDS_PER_KG;
}

// ==
// VALIDATION HELPERS
// ==

/**
 * Validate that a value is a positive number
 * @param {*} value
 * @param {string} fieldName - for error message
 * @returns {{ valid: boolean, error?: string, value: number }}
 */
export function validatePositiveNumber(value, fieldName = 'Value') {
  const num = parseFloat(value);
  if (isNaN(num)) {
    return { valid: false, error: `${fieldName} must be a number`, value: 0 };
  }
  if (num <= 0) {
    return { valid: false, error: `${fieldName} must be greater than zero`, value: 0 };
  }
  return { valid: true, value: num };
}

/**
 * Validate that a value is a non-negative number
 * @param {*} value
 * @param {string} fieldName
 * @returns {{ valid: boolean, error?: string, value: number }}
 */
export function validateNonNegativeNumber(value, fieldName = 'Value') {
  const num = parseFloat(value);
  if (isNaN(num)) {
    return { valid: false, error: `${fieldName} must be a number`, value: 0 };
  }
  if (num < 0) {
    return { valid: false, error: `${fieldName} cannot be negative`, value: 0 };
  }
  return { valid: true, value: num };
}

/**
 * Validate that a percentage is in valid range (0-100)
 * @param {*} value
 * @param {string} fieldName
 * @returns {{ valid: boolean, error?: string, value: number }}
 */
export function validatePercentage(value, fieldName = 'Percentage') {
  const num = parseFloat(value);
  if (isNaN(num)) {
    return { valid: false, error: `${fieldName} must be a number`, value: 0 };
  }
  if (num < 0 || num > 100) {
    return { valid: false, error: `${fieldName} must be between 0 and 100`, value: 0 };
  }
  return { valid: true, value: num };
}
