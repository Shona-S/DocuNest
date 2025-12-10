/**
 * ============================================
 * ENVIRONMENT VARIABLE VALIDATION
 * ============================================
 * 
 * MUST BE FIRST - Validates all required environment variables
 * before any other imports or code execution.
 * This prevents confusing runtime errors by catching missing
 * variables at startup with clear error messages.
 */
import dotenv from 'dotenv';
dotenv.config();

import validateEnv from './config/validateEnv.js';
validateEnv();

// Now safe to import other modules that depend on environment variables
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { connectDB, sequelize } from './config/db.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Import models to register them with Sequelize
import User from './models/userModel.js';
import Document from './models/documentModel.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import searchRoutes from './routes/searchRoutes.js';

// Initialize Express app
const app = express();

/**
 * ============================================
 * SEQUELIZE DATABASE CONNECTION & SYNC
 * ============================================
 * 
 * This async IIFE (Immediately Invoked Function Expression) handles:
 * 1. Connecting to Neon PostgreSQL database
 * 2. Syncing models with the database (creates/alters tables)
 * 
 * connectDB() - Tests the connection to Neon PostgreSQL
 * sequelize.sync({ alter: true }) - Automatically creates/updates tables
 *   - alter: true - Alters existing tables to match models (safe for development)
 *   - In production, use migrations instead of sync()
 */
(async () => {
  try {
    // Connect to Neon PostgreSQL
    await connectDB();

    // Sync Sequelize models with database
    // This creates tables if they don't exist, or alters them if schema changed
    await sequelize.sync({ alter: true });
    console.log('✅ Database models synchronized');
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    process.exit(1);
  }
})();

// Security middleware
app.use(helmet()); // Set various HTTP headers for security

/**
 * CORS Configuration
 * 
 * Allows the frontend (running on http://localhost:5173) to make requests to the backend.
 * Configured with:
 * - Specific origin (frontend URL)
 * - Allowed HTTP methods
 * - Allowed headers (Content-Type for JSON, Authorization for JWT tokens)
 * - Credentials enabled for cookies/auth headers
 */
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Body parser middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware (simple version)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

/**
 * ============================================
 * SWAGGER API DOCUMENTATION SETUP
 * ============================================
 * 
 * Swagger/OpenAPI provides interactive API documentation.
 * 
 * How it works:
 * 1. swaggerJsdoc scans route files for JSDoc comments with @swagger tags
 * 2. Generates OpenAPI 3.0 specification JSON
 * 3. swaggerUi serves a beautiful interactive UI at /api-docs
 * 
 * The options object configures:
 * - openapi: Version of OpenAPI spec (3.0.0 is current standard)
 * - info: API metadata (title, version, description)
 * - servers: Base URLs where API is hosted
 * - apis: Path patterns to scan for Swagger comments (./routes/*.js)
 */
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DocuNest API',
      version: '1.0.0',
      description: 'Secure Document Vault Backend with Neon PostgreSQL + Sequelize. This API provides endpoints for user authentication, file upload/download with AES-256 encryption, and document management.',
      contact: {
        name: 'DocuNest API Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Local Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token obtained from /api/auth/login',
        },
      },
    },
  },
  // Path to route files containing Swagger JSDoc comments
  apis: ['./routes/*.js'],
};

// Generate Swagger specification from JSDoc comments
const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Serve Swagger UI at /api-docs
// swaggerUi.serve - Serves static files for Swagger UI
// swaggerUi.setup(swaggerDocs) - Sets up the UI with our API spec
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, {
  customCss: '.swagger-ui .topbar { display: none }', // Hide Swagger topbar
  customSiteTitle: 'DocuNest API Documentation',
}));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'DocuNest API is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/search', searchRoutes);

// 404 handler
app.use(notFound);

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.listen(PORT, () => {
  console.log(`🚀 DocuNest Backend Server running in ${NODE_ENV} mode on port ${PORT}`);
  console.log(`📝 API Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📚 Swagger API Docs: http://localhost:${PORT}/api-docs`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  // server.close(() => process.exit(1));
});

