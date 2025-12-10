import crypto from 'crypto';
import { getMasterKey } from '../config/keys.js';

/**
 * File Decryption Utility
 * 
 * Decrypts files that were encrypted using AES-256-CBC.
 * 
 * Process:
 * 1. Decrypt the file key and IV using the master key
 * 2. Use the decrypted key and IV to decrypt the file content
 * 3. Return the original file buffer
 */

/**
 * Decrypt a file buffer
 * @param {Buffer} encryptedFileBuffer - The encrypted file content
 * @param {string} encryptedKeyBase64 - Base64 encoded encrypted file key
 * @param {string} encryptedIVBase64 - Base64 encoded encrypted IV
 * @returns {Buffer} Decrypted file buffer
 */
export const decryptFile = (
  encryptedFileBuffer,
  encryptedKeyBase64,
  encryptedIVBase64
) => {
  try {
    const masterKey = getMasterKey();

    // Step 1: Derive the same IVs used for encryption (deterministic)
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

    // Step 2: Decrypt the file IV
    const encryptedIV = Buffer.from(encryptedIVBase64, 'base64');
    const ivDecipher = crypto.createDecipheriv('aes-256-cbc', masterKey, ivEncryptionIV);
    const decryptedFileIV = Buffer.concat([
      ivDecipher.update(encryptedIV),
      ivDecipher.final(),
    ]);

    // Step 3: Decrypt the file key
    const encryptedKey = Buffer.from(encryptedKeyBase64, 'base64');
    const keyDecipher = crypto.createDecipheriv('aes-256-cbc', masterKey, keyEncryptionIV);
    const decryptedFileKey = Buffer.concat([
      keyDecipher.update(encryptedKey),
      keyDecipher.final(),
    ]);

    // Step 4: Decrypt the file content using the decrypted key and IV
    const fileDecipher = crypto.createDecipheriv('aes-256-cbc', decryptedFileKey, decryptedFileIV);
    const decryptedFile = Buffer.concat([
      fileDecipher.update(encryptedFileBuffer),
      fileDecipher.final(),
    ]);

    return decryptedFile;
  } catch (error) {
    throw new Error(`File decryption failed: ${error.message}`);
  }
};


