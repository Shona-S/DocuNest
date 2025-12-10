#!/usr/bin/env node

/**
 * Key Generation Script
 * 
 * Generates secure random keys for JWT_SECRET and ENCRYPT_KEY
 * Run with: node scripts/generate-keys.js
 */

import crypto from 'crypto';

console.log('\n🔑 Generating secure keys for DocuNest...\n');

// Generate JWT Secret (64 bytes = 512 bits)
const jwtSecret = crypto.randomBytes(64).toString('hex');

// Generate Encryption Key (32 bytes = 256 bits for AES-256)
const encryptKey = crypto.randomBytes(32).toString('hex');

console.log('Copy these values to your .env file:\n');
console.log('─'.repeat(60));
console.log('JWT_SECRET=' + jwtSecret);
console.log('ENCRYPT_KEY=' + encryptKey);
console.log('─'.repeat(60));
console.log('\n⚠️  Keep these keys secure and never commit them to version control!\n');

