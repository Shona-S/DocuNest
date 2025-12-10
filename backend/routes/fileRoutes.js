import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Op } from 'sequelize';
import { authenticate, verifyPIN } from '../middleware/authMiddleware.js';
import Document from '../models/documentModel.js';
import User from '../models/userModel.js';
import { encryptFile } from '../utils/encryptFile.js';
import { decryptFile } from '../utils/decryptFile.js';
import { AppError } from '../middleware/errorHandler.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads/encrypted');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Multer configuration for file uploads
 * Only allows: PDF, PNG, JPG, JPEG, DOCX
 */
const storage = multer.memoryStorage(); // Store in memory first for encryption

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const allowedExtensions = ['.pdf', '.png', '.jpg', '.jpeg', '.docx'];

  const fileExt = path.extname(file.originalname).toLowerCase();
  const isValidType = allowedTypes.includes(file.mimetype) || 
                      allowedExtensions.includes(fileExt);

  if (isValidType) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file type. Only PDF, PNG, JPG, JPEG, and DOCX files are allowed.', 400), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
  },
});

/**
 * @swagger
 * /api/files/upload:
 *   post:
 *     summary: Upload and encrypt file
 *     description: Uploads a file, encrypts it using AES-256-CBC encryption, and stores metadata in the database. Only PDF, PNG, JPG, JPEG, and DOCX files are allowed (max 50MB).
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File to upload (PDF, PNG, JPG, JPEG, DOCX - max 50MB)
 *               category:
 *                 type: string
 *                 enum: [Work, Education, ID, Certificate, Resume, Other]
 *                 default: Other
 *                 description: File category
 *               tags:
 *                 type: string
 *                 example: "important,contract"
 *                 description: Comma-separated tags
 *               requiresPIN:
 *                 type: boolean
 *                 default: false
 *                 description: Whether this file requires PIN to access
 *     responses:
 *       201:
 *         description: File uploaded and encrypted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     document:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         filename:
 *                           type: string
 *                         category:
 *                           type: string
 *                         tags:
 *                           type: array
 *                           items:
 *                             type: string
 *                         fileSize:
 *                           type: integer
 *                         uploadedAt:
 *                           type: string
 *                           format: date-time
 *       400:
 *         description: Invalid file type or missing file
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */
router.post('/upload', authenticate, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const { category = 'Other', tags = [], requiresPIN = false } = req.body;
    const userId = req.userId;

    // Validate category
    const validCategories = ['Work', 'Education', 'ID', 'Certificate', 'Resume', 'Other'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category',
      });
    }

    // Parse tags if string
    const tagArray = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim()).filter(t => t);

    // Encrypt the file
    const fileBuffer = req.file.buffer;
    const { encryptedFile, encryptedKey, encryptedIV } = encryptFile(fileBuffer);

    // Generate unique filename for storage
    const fileExt = path.extname(req.file.originalname);
    const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(7)}${fileExt}.enc`;
    const filePath = path.join(uploadsDir, uniqueFilename);

    // Save encrypted file to disk
    fs.writeFileSync(filePath, encryptedFile);

    // Determine file type
    const fileType = fileExt.substring(1).toLowerCase();

    // Create document record in database
    // Sequelize: create method works similarly, but uses id instead of _id
    const document = await Document.create({
      userId,
      filename: uniqueFilename,
      originalFilename: req.file.originalname,
      fileType,
      fileSize: req.file.size,
      category,
      tags: tagArray, // Will be converted to comma-separated string by setter
      encryptedKey,
      encryptedIV,
      filePath: path.relative(path.join(__dirname, '../'), filePath), // Store relative path
      requiresPIN: requiresPIN === 'true' || requiresPIN === true,
    });

    // Log upload activity (you can extend this to an Activity model)
    console.log(`[UPLOAD] User ${userId} uploaded file: ${req.file.originalname}`);

    res.status(201).json({
      success: true,
      message: 'File uploaded and encrypted successfully',
      data: {
        document: {
          id: document.id,
          filename: document.originalFilename,
          category: document.category,
          tags: document.tags, // Will be converted to array by getter
          fileSize: document.fileSize,
          uploadedAt: document.uploadedAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/files
 * @desc    Get all files for the authenticated user
 * @access  Private
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    const userId = req.userId;
    const { category, tag } = req.query;

    // Build query
    // Sequelize: Use where clause and Op operators instead of Mongoose query syntax
    const whereClause = { userId };
    
    if (category) {
      whereClause.category = category;
    }
    if (tag) {
      // For tags stored as comma-separated string, use LIKE
      whereClause.tags = { [Op.like]: `%${tag}%` };
    }

    const documents = await Document.findAll({
      where: whereClause,
      attributes: { exclude: ['encryptedKey', 'encryptedIV', 'filePath'] }, // Don't expose sensitive data
      order: [['uploadedAt', 'DESC']], // Sequelize order syntax
    });

    res.json({
      success: true,
      count: documents.length,
      data: {
        documents,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/files/{id}:
 *   get:
 *     summary: Get file metadata
 *     description: Retrieves metadata for a specific file by ID. Returns file information without sensitive data (encryption keys, file paths).
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Document ID
 *     responses:
 *       200:
 *         description: File metadata retrieved successfully
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
 *                     document:
 *                       type: object
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: File not found or user doesn't own the file
 */
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    // Sequelize: Use findByPk or findOne with where clause
    const document = await Document.findOne({
      where: {
        id: req.params.id,
        userId: req.userId, // Ensure user owns the file
      },
      attributes: { exclude: ['encryptedKey', 'encryptedIV', 'filePath'] },
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    res.json({
      success: true,
      data: {
        document,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/files/{id}/download:
 *   get:
 *     summary: Download a file
 *     description: Downloads a file by ID. The file is decrypted server-side before sending. Requires authentication and file ownership. If file requires PIN, provide it as query parameter.
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Document ID
 *       - in: query
 *         name: pin
 *         required: false
 *         schema:
 *           type: string
 *         description: PIN code (required if file has requiresPIN=true)
 *     responses:
 *       200:
 *         description: File downloaded successfully
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *         headers:
 *           Content-Disposition:
 *             description: Attachment filename
 *             schema:
 *               type: string
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: PIN required for this file
 *       404:
 *         description: File not found or user doesn't own the file
 */
router.get('/:id/download', authenticate, async (req, res, next) => {
  try {
    // Sequelize: Use findOne with where clause
    const document = await Document.findOne({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    // Check if PIN is required
    if (document.requiresPIN) {
      const { pin } = req.query;
      if (!pin) {
        return res.status(403).json({
          success: false,
          message: 'PIN required to download this file',
        });
      }

      // Verify PIN against user's stored PIN hash
      const user = await User.findByPk(req.userId, {
        attributes: { include: ['pinHash'] },
      });

      if (!user || !user.pinHash) {
        return res.status(400).json({
          success: false,
          message: 'PIN not set for this user',
        });
      }

      const isPINValid = await user.comparePIN(pin);
      if (!isPINValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid PIN',
        });
      }
    }

    // Read encrypted file from disk
    const absoluteFilePath = path.join(__dirname, '../', document.filePath);
    if (!fs.existsSync(absoluteFilePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server',
      });
    }

    const encryptedFileBuffer = fs.readFileSync(absoluteFilePath);

    // Decrypt the file
    const decryptedFile = decryptFile(
      encryptedFileBuffer,
      document.encryptedKey,
      document.encryptedIV
    );

    // Log download activity
    console.log(`[DOWNLOAD] User ${req.userId} downloaded file: ${document.originalFilename}`);

    // Set headers for file download
    res.setHeader('Content-Type', `application/${document.fileType}`);
    res.setHeader('Content-Disposition', `attachment; filename="${document.originalFilename}"`);
    res.setHeader('Content-Length', decryptedFile.length);

    res.send(decryptedFile);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/files/{id}:
 *   delete:
 *     summary: Delete a file
 *     description: Deletes a file by ID. Removes both the encrypted file from disk and the database record. Requires authentication and file ownership.
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Document ID
 *     responses:
 *       200:
 *         description: File deleted successfully
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
 *                   example: "File deleted successfully"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: File not found or user doesn't own the file
 */
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    // Sequelize: Use findOne with where clause
    const document = await Document.findOne({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    // Delete file from disk
    const absoluteFilePath = path.join(__dirname, '../', document.filePath);
    if (fs.existsSync(absoluteFilePath)) {
      fs.unlinkSync(absoluteFilePath);
    }

    // Delete document from database
    // Sequelize: Use destroy() instead of deleteOne()
    await document.destroy();

    // Log delete activity
    console.log(`[DELETE] User ${req.userId} deleted file: ${document.originalFilename}`);

    res.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;

