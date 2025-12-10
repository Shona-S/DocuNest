import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

/**
 * Authentication Middleware
 * 
 * Verifies JWT tokens and attaches user information to the request object.
 * Protects routes that require authentication.
 */

/**
 * Middleware to verify JWT token and authenticate user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No valid token provided.',
      });
    }

    // Extract token (remove 'Bearer ' prefix)
    const token = authHeader.substring(7);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database (exclude password and pinHash)
    // Sequelize: Use findByPk instead of findById, and attributes to exclude fields
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['passwordHash', 'pinHash'] },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Token invalid.',
      });
    }

    // Attach user to request object
    req.user = user;
    req.userId = decoded.userId;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.',
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Authentication error.',
      error: error.message,
    });
  }
};

/**
 * Optional: Middleware to verify PIN for sensitive files
 * This can be used as an additional layer of protection
 */
export const verifyPIN = async (req, res, next) => {
  try {
    const { pin } = req.body;

    if (!pin) {
      return res.status(400).json({
        success: false,
        message: 'PIN is required for this operation.',
      });
    }

    // Get user with PIN hash
    // Sequelize: Use findByPk and include passwordHash/pinHash in attributes
    const user = await User.findByPk(req.userId, {
      attributes: { include: ['pinHash'] },
    });

    if (!user || !user.pinHash) {
      return res.status(400).json({
        success: false,
        message: 'PIN not set for this user.',
      });
    }

    const isPINValid = await user.comparePIN(pin);

    if (!isPINValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid PIN.',
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'PIN verification error.',
      error: error.message,
    });
  }
};

