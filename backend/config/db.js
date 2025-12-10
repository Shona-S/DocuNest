import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

/**
 * Load environment variables first
 * This ensures DATABASE_URL is available before creating Sequelize instance
 * Explicitly specify the path to .env file to ensure it's loaded
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

/**
 * Neon PostgreSQL Database Connection using Sequelize ORM
 * 
 * Connects to Neon PostgreSQL serverless database using DATABASE_URL.
 * Neon provides a serverless PostgreSQL database that scales automatically.
 */

// Validate DATABASE_URL is set before creating Sequelize instance
if (!process.env.DATABASE_URL || process.env.DATABASE_URL.trim() === '') {
  console.error('❌ DATABASE_URL is not set in environment variables');
  console.error('Please add DATABASE_URL to your .env file');
  console.error('Format: postgresql://user:password@host/database?sslmode=require');
  console.error('Current .env path:', join(__dirname, '../.env'));
  process.exit(1);
}

// Create Sequelize instance with PostgreSQL connection
// Uses DATABASE_URL from Neon (format: postgresql://user:password@host/database)
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // required for Neon
    },
  },
  logging: false,
});

/**
 * Test database connection to Neon PostgreSQL
 * @returns {Promise<void>}
 */
export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to Neon PostgreSQL successfully!');
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
};

export { sequelize };
