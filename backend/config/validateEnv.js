import dotenv from 'dotenv';

/**
 * Environment Variable Validation
 * 
 * Validates that all required environment variables are present and not empty.
 * Exits the process gracefully with clear error messages if any are missing.
 * 
 * This prevents confusing runtime errors like "secretOrPrivateKey must have a value"
 * by catching missing variables at startup.
 */

// Load environment variables from .env file
dotenv.config();

/**
 * List of required environment variables
 * Add or remove variables here as needed
 */
const requiredEnvVars = [
  'DATABASE_URL', // Neon PostgreSQL connection string
  'JWT_SECRET',
  'ENCRYPT_KEY',
];

/**
 * Validate all required environment variables
 * @returns {void}
 * @throws {Error} Exits process if any variables are missing
 */
const validateEnv = () => {
  const missingVars = [];

  // Check each required variable
  for (const varName of requiredEnvVars) {
    const value = process.env[varName];
    
    // Check if variable exists and is not empty
    if (!value || value.trim() === '') {
      missingVars.push(varName);
    }
  }

  // If any variables are missing, log error and exit
  if (missingVars.length > 0) {
    console.error('\n❌ Missing required environment variables:\n');
    
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    
    console.error('\n💡 Please check your .env file and ensure all required variables are set.');
    console.error('   See .env.example for reference.\n');
    
    process.exit(1);
  }

  // All variables are present
  console.log('✅ All environment variables loaded successfully.\n');
};

export default validateEnv;

