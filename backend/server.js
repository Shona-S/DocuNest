/**
 * ============================================
 * ENVIRONMENT VARIABLE VALIDATION
 * ============================================
 *
 * MUST BE FIRST - Validates all required environment variables
 * before any other imports or code execution.
 */
import dotenv from "dotenv";
dotenv.config();

import validateEnv from "./config/validateEnv.js";
validateEnv();

// Now safe to import other modules that depend on environment variables
import express from "express";
import helmet from "helmet";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import { connectDB, sequelize } from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

// Import models to register them with Sequelize
import User from "./models/userModel.js";
import Document from "./models/documentModel.js";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";

// Initialize Express app
const app = express();

/**
 * ============================================
 * DATABASE CONNECTION & SYNC (Neon PostgreSQL)
 * ============================================
 */
(async () => {
  try {
    await connectDB(); // Connect to Neon PostgreSQL
    await sequelize.sync({ alter: true }); // Sync models
    console.log("✅ Database models synchronized");
  } catch (error) {
    console.error("❌ Database initialization error:", error.message);
    process.exit(1);
  }
})();

// Security middleware
app.use(helmet());

/**
 * ============================================
 * CORS CONFIGURATION (Render + Netlify)
 * ============================================
 *
 * Allows requests from both local dev and Netlify production frontend.
 * Prevents CORS policy mismatch errors.
 */
const allowedOrigins = [
  "http://localhost:5173", // local Vite dev
  "https://docunestt.netlify.app", // live frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow requests with no origin
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.log("❌ Blocked by CORS:", origin);
        return callback(new Error("Not allowed by CORS"), false);
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Body parser middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

/**
 * ============================================
 * SWAGGER SETUP
 * ============================================
 */
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "DocuNest API",
      version: "1.0.0",
      description:
        "Secure Document Vault Backend with Neon PostgreSQL + Sequelize. This API provides endpoints for user authentication, file upload/download with AES-256 encryption, and document management.",
      contact: { name: "DocuNest API Support" },
    },
    servers: [
      {
        url: "https://docunest-backend.onrender.com",
        description: "Production Server (Render)",
      },
      {
        url: "http://localhost:5000",
        description: "Local Development Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter JWT token obtained from /api/auth/login",
        },
      },
    },
  },
  apis: ["./routes/*.js"],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocs, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "DocuNest API Documentation",
  })
);

/**
 * ============================================
 * ROUTES
 * ============================================
 */

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "DocuNest API is running",
    timestamp: new Date().toISOString(),
  });
});

// Main API routes
app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/search", searchRoutes);

// Friendly root route (prevents 404 on Render root)
app.get("/", (req, res) => {
  res.send(`
    <h1>🪪 DocuNest API</h1>
    <p>✅ Backend is live and connected to Neon PostgreSQL!</p>
    <p>📚 Visit <a href="/api-docs">/api-docs</a> for Swagger documentation.</p>
  `);
});

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

/**
 * ============================================
 * SERVER STARTUP
 * ============================================
 */
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

app.listen(PORT, () => {
  const baseUrl =
    NODE_ENV === "production"
      ? "https://docunest-backend.onrender.com"
      : `http://localhost:${PORT}`;
  console.log(`🚀 DocuNest Backend Server running in ${NODE_ENV} mode`);
  console.log(`📝 Health Check: ${baseUrl}/api/health`);
  console.log(`📚 Swagger Docs: ${baseUrl}/api-docs`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
});
