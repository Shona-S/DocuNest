import express from 'express';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import User from '../models/userModel.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Rate limiter for login attempts (prevents brute-force attacks)
 * Allows 5 login attempts per 15 minutes per IP
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Generate JWT token
 * @param {string} userId - User ID to encode in token
 * @returns {string} JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d', // Token expires in 7 days
  });
};

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account with name, email, and password. Password is automatically hashed using bcrypt before storage.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *                 example: "John Doe"
 *                 description: User's full name (3-30 characters, alphanumeric, spaces, underscores)
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *                 description: Valid email address (must be unique)
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: "SecurePass123"
 *                 description: Password (min 8 chars, must contain uppercase, lowercase, and number)
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User registered successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                     token:
 *                       type: string
 *                       description: JWT token for authentication
 *       400:
 *         description: Invalid input or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                 errors:
 *                   type: array
 */
router.post(
  '/register',
  [
    body('name')
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Name must be between 3 and 30 characters')
      .matches(/^[a-zA-Z0-9_\s]+$/)
      .withMessage('Name can only contain letters, numbers, spaces, and underscores'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  ],
  async (req, res, next) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const { name, email, password } = req.body;

      // Check if user already exists
      // Sequelize: Use findOne with Op.or for OR conditions
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [{ email }, { name }],
        },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email or name already exists',
        });
      }

      // Create new user
      // Sequelize: passwordHash will be hashed by beforeCreate hook
      const user = await User.create({
        name,
        email,
        passwordHash: password, // Will be hashed by beforeCreate hook
      });

      // Generate JWT token
      const token = generateToken(user.id);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and return JWT token
 * @access  Public
 */
router.post(
  '/login',
  loginLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res, next) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const { email, password } = req.body;

      // Find user and include passwordHash
      // Sequelize: Use findOne with where clause and include passwordHash in attributes
      const user = await User.findOne({
        where: { email },
        attributes: { include: ['passwordHash'] },
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      // Compare password
      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      // Generate JWT token
      const token = generateToken(user.id);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user information
 *     description: Returns the authenticated user's information (name, email, id). Requires valid JWT token.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */
router.get('/me', authenticate, async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/auth/set-pin
 * @desc    Set or update PIN for sensitive file access
 * @access  Private
 */
router.post(
  '/set-pin',
  authenticate,
  [
    body('pin')
      .isLength({ min: 4, max: 6 })
      .isNumeric()
      .withMessage('PIN must be 4-6 digits'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const { pin } = req.body;
      // Sequelize: Use findByPk instead of findById
      const user = await User.findByPk(req.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      user.pinHash = pin; // Will be hashed by beforeUpdate hook
      await user.save();

      res.json({
        success: true,
        message: 'PIN set successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;

