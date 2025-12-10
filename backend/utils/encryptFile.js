import crypto from 'crypto';
import { getMasterKey, generateFileKey, generateIV } from '../config/keys.js';

/**
 * File Encryption Utility
 * 
 * Encrypts files using AES-256-CBC encryption.
 * Each file gets a unique encryption key and IV.
 * The file key and IV are then encrypted with the master key before storage.
 * 
 * Process:
 * 1. Generate unique key and IV for the file
 * 2. Encrypt the file content using AES-256-CBC
 * 3. Encrypt the file key and IV with master key
 * 4. Return encrypted file buffer and encrypted key/IV (for database storage)
 */

/**
 * Encrypt a file buffer using AES-256-CBC
 * @param {Buffer} fileBuffer - The file content to encrypt
 * @returns {Object} Object containing encrypted file, encrypted key, and encrypted IV
 */
export const encryptFile = (fileBuffer) => {
  try {
    // Step 1: Generate unique key and IV for this file
    const fileKey = generateFileKey();
    const fileIV = generateIV();
    const masterKey = getMasterKey();

    // Step 2: Encrypt the file using AES-256-CBC
    const cipher = crypto.createCipheriv('aes-256-cbc', fileKey, fileIV);
    const encryptedFile = Buffer.concat([
      cipher.update(fileBuffer),
      cipher.final(),
    ]);

    // Step 3: Derive a deterministic IV from master key for encrypting file key/IV
    // This avoids storing additional IVs while maintaining security
    const keyEncryptionIV = crypto
      .createHash('sha256')
      .update(Buffer.concat([masterKey, Buffer.from('key-encryption-iv')]))
      .digest()
      .slice(0, 16);

    const ivEncryptionIV = crypto
      .createHash('sha256')
      .update(Buffer.concat([masterKey, Buffer.from('iv-encryption-iv')]))
      .digest()
      .slice(0, 16);

    // Step 4: Encrypt the file key with master key
    const keyCipher = crypto.createCipheriv('aes-256-cbc', masterKey, keyEncryptionIV);
    const encryptedKey = Buffer.concat([
      keyCipher.update(fileKey),
      keyCipher.final(),
    ]);

    // Step 5: Encrypt the file IV with master key
    const ivCipher = crypto.createCipheriv('aes-256-cbc', masterKey, ivEncryptionIV);
    const encryptedIV = Buffer.concat([
      ivCipher.update(fileIV),
      ivCipher.final(),
    ]);

    // Return encrypted file and metadata (all base64 encoded for database storage)
    return {
      encryptedFile,
      encryptedKey: encryptedKey.toString('base64'),
      encryptedIV: encryptedIV.toString('base64'),
    };
  } catch (error) {
    throw new Error(`File encryption failed: ${error.message}`);
  }
};


