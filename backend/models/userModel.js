import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import { sequelize } from '../config/db.js';

/**
 * User Model (Sequelize)
 * 
 * Replaces Mongoose schema with Sequelize model.
 * Stores user authentication information and preferences.
 * Passwords are hashed using bcrypt before saving via hooks.
 * 
 * Sequelize differences from Mongoose:
 * - Uses DataTypes instead of Schema types
 * - Hooks (beforeCreate, beforeUpdate) replace pre-save middleware
 * - Instance methods are defined on the model prototype
 */
const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [3, 30],
        notEmpty: true,
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true,
      },
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'password_hash', // Store as snake_case in database
      validate: {
        len: [8, 255], // Minimum 8 characters
        notEmpty: true,
      },
    },
    pinHash: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'pin_hash', // Optional PIN for sensitive file categories
    },
  },
  {
    tableName: 'users',
    timestamps: true, // Adds createdAt and updatedAt automatically
    underscored: true, // Use snake_case for timestamps (created_at, updated_at)
    hooks: {
      /**
       * Hash password before creating user
       * Replaces Mongoose pre-save hook
       */
      beforeCreate: async (user) => {
        if (user.passwordHash) {
          const salt = await bcrypt.genSalt(12);
          user.passwordHash = await bcrypt.hash(user.passwordHash, salt);
        }
        if (user.pinHash) {
          const salt = await bcrypt.genSalt(12);
          user.pinHash = await bcrypt.hash(user.pinHash, salt);
        }
      },
      /**
       * Hash password before updating if it changed
       */
      beforeUpdate: async (user) => {
        if (user.changed('passwordHash') && user.passwordHash) {
          const salt = await bcrypt.genSalt(12);
          user.passwordHash = await bcrypt.hash(user.passwordHash, salt);
        }
        if (user.changed('pinHash') && user.pinHash) {
          const salt = await bcrypt.genSalt(12);
          user.pinHash = await bcrypt.hash(user.pinHash, salt);
        }
      },
    },
  }
);

/**
 * Compare provided password with hashed password
 * Instance method (similar to Mongoose methods)
 * @param {string} candidatePassword - Password to compare
 * @returns {Promise<boolean>} True if passwords match
 */
User.prototype.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

/**
 * Compare provided PIN with hashed PIN
 * @param {string} candidatePIN - PIN to compare
 * @returns {Promise<boolean>} True if PINs match
 */
User.prototype.comparePIN = async function (candidatePIN) {
  if (!this.pinHash) {
    return false;
  }
  return await bcrypt.compare(candidatePIN, this.pinHash);
};

export default User;
