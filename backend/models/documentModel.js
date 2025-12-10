import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import User from './userModel.js';

/**
 * Document Model (Sequelize)
 * 
 * Replaces Mongoose schema with Sequelize model.
 * Stores metadata about uploaded files.
 * Actual encrypted file content is stored on the filesystem.
 * 
 * Security Notes:
 * - File encryption key is encrypted with master key before storage
 * - File IV is stored encrypted
 * - File path is relative to secure uploads directory
 * - User ownership is enforced via userId foreign key
 * 
 * Sequelize Relationships:
 * - Document.belongsTo(User) - Each document belongs to one user
 * - User.hasMany(Document) - Each user can have many documents
 */
const Document = sequelize.define(
  'Document',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    filename: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    originalFilename: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'original_filename',
      validate: {
        notEmpty: true,
      },
    },
    fileType: {
      type: DataTypes.ENUM('pdf', 'png', 'jpg', 'jpeg', 'docx'),
      allowNull: false,
      field: 'file_type',
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
      },
      field: 'file_size',
    },
    category: {
      type: DataTypes.ENUM('Work', 'Education', 'ID', 'Certificate', 'Resume', 'Other'),
      allowNull: false,
      defaultValue: 'Other',
    },
    tags: {
      type: DataTypes.TEXT, // Store tags as comma-separated string in PostgreSQL
      allowNull: true,
      get() {
        // Convert comma-separated string to array when retrieving
        const tags = this.getDataValue('tags');
        return tags ? tags.split(',').map(t => t.trim()) : [];
      },
      set(value) {
        // Convert array to comma-separated string when setting
        if (Array.isArray(value)) {
          this.setDataValue('tags', value.join(','));
        } else if (typeof value === 'string') {
          this.setDataValue('tags', value);
        }
      },
    },
    // Encrypted file encryption key (encrypted with master key)
    encryptedKey: {
      type: DataTypes.TEXT, // Base64 encoded encrypted key (can be long)
      allowNull: false,
      field: 'encrypted_key',
    },
    // Encrypted IV (encrypted with master key)
    encryptedIV: {
      type: DataTypes.TEXT, // Base64 encoded encrypted IV
      allowNull: false,
      field: 'encrypted_iv',
    },
    // Relative path to encrypted file on filesystem
    filePath: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'file_path',
    },
    // Optional: Mark files that require PIN to access
    requiresPIN: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'requires_pin',
    },
    uploadedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'uploaded_at',
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
      field: 'user_id',
      onDelete: 'CASCADE', // Delete documents when user is deleted
    },
  },
  {
    tableName: 'documents',
    timestamps: true, // Adds createdAt and updatedAt automatically
    underscored: true, // Use snake_case for timestamps
    indexes: [
      // Indexes for efficient queries
      { fields: ['user_id'] },
      { fields: ['user_id', 'uploaded_at'] },
      { fields: ['user_id', 'category'] },
      { fields: ['category'] },
    ],
  }
);

/**
 * Define Sequelize Relationships
 * 
 * User.hasMany(Document) - One user can have many documents
 * Document.belongsTo(User) - Each document belongs to one user
 */
User.hasMany(Document, {
  foreignKey: 'userId',
  as: 'documents', // Alias for accessing user's documents
});

Document.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user', // Alias for accessing document's user
});

export default Document;
