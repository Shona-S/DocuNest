import crypto from 'crypto';

/**
 * Encryption Key Management
 * 
 * This module handles encryption key generation and management.
 * In production, the ENCRYPT_KEY should be a 32-byte (256-bit) key stored in .env
 * 
 * For file encryption, we'll generate a unique key per file and encrypt it
 * with the master key before storing in the database.
 */

/**
 * Generate a random encryption key (32 bytes for AES-256)
 * @returns {Buffer} 32-byte random key
 */
export const generateFileKey = () => {
  return crypto.randomBytes(32);
};

/**
 * Generate a random IV (Initialization Vector) for AES-256-CBC (16 bytes)
 * @returns {Buffer} 16-byte random IV
 */
export const generateIV = () => {
  return crypto.randomBytes(16);
};

/**
 * Get the master encryption key from environment variables
 * This key is used to encrypt the per-file keys before storing them
 * @returns {Buffer} Master encryption key
 */
export const getMasterKey = () => {
  const key = process.env.ENCRYPT_KEY;
  if (!key) {
    throw new Error('ENCRYPT_KEY is not set in environment variables');
  }
  
  // If key is hex string, convert to buffer; otherwise use directly
  if (key.length === 64) {
    // Assuming hex-encoded 32-byte key
    return Buffer.from(key, 'hex');
  }
  
  // Otherwise, derive a 32-byte key from the string using SHA-256
  return crypto.createHash('sha256').update(key).digest();
};

