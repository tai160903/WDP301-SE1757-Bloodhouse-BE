const crypto = require('crypto');

/**
 * Generate unique code for models
 * @param {string} prefix - 4 character prefix for the model
 * @returns {string} - Unique code with format: PREFIX + 6 characters
 */
const generateUniqueCode = (prefix) => {
  // Ensure prefix is exactly 4 characters
  const modelPrefix = prefix.toUpperCase().substring(0, 4).padEnd(4, 'X');
  
  // Generate 6 character suffix based on timestamp and random
  const timestamp = Date.now().toString(36); // Convert timestamp to base36
  const random = crypto.randomBytes(2).toString('hex').toUpperCase(); // 4 random hex chars
  
  // Take last 2 chars from timestamp + 4 random chars = 6 chars total
  const suffix = (timestamp.slice(-2) + random).substring(0, 6);
  
  return modelPrefix + suffix;
};

/**
 * Generate unique code with custom length
 * @param {string} prefix - Model prefix
 * @param {number} suffixLength - Length of suffix (default 6)
 * @returns {string} - Unique code
 */
const generateCustomCode = (prefix, suffixLength = 6) => {
  const modelPrefix = prefix.toUpperCase().substring(0, 4).padEnd(4, 'X');
  
  // Generate suffix with specified length
  const timestamp = Date.now().toString(36);
  const randomBytes = Math.ceil(suffixLength / 2);
  const random = crypto.randomBytes(randomBytes).toString('hex').toUpperCase();
  
  const combined = timestamp + random;
  const suffix = combined.substring(0, suffixLength);
  
  return modelPrefix + suffix;
};

/**
 * Check if code already exists in collection
 * @param {Object} model - Mongoose model
 * @param {string} code - Code to check
 * @param {string} fieldName - Field name to check (default 'code')
 * @returns {Promise<boolean>} - True if exists, false otherwise
 */
const isCodeExists = async (model, code, fieldName = 'code') => {
  try {
    const existing = await model.findOne({ [fieldName]: code });
    return !!existing;
  } catch (error) {
    return false;
  }
};

/**
 * Generate unique code ensuring no duplicates
 * @param {Object} model - Mongoose model
 * @param {string} prefix - 4 character prefix
 * @param {string} fieldName - Field name (default 'code')
 * @param {number} maxAttempts - Maximum attempts (default 10)
 * @returns {Promise<string>} - Unique code
 */
const generateUniqueCodeSafe = async (model, prefix, fieldName = 'code', maxAttempts = 10) => {
  let attempts = 0;
  let code;
  
  do {
    code = generateUniqueCode(prefix);
    attempts++;
    
    if (attempts >= maxAttempts) {
      // If too many attempts, add timestamp to ensure uniqueness
      const timestamp = Date.now().toString(36).slice(-2);
      code = generateUniqueCode(prefix) + timestamp;
      break;
    }
  } while (await isCodeExists(model, code, fieldName));
  
  return code;
};

module.exports = {
  generateUniqueCode,
  generateCustomCode,
  isCodeExists,
  generateUniqueCodeSafe
}; 