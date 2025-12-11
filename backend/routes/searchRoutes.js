import express from 'express';
import { Op } from 'sequelize';
import { authenticate } from '../middleware/authMiddleware.js';
import Document from '../models/documentModel.js';

const router = express.Router();

/**
 * @route   GET /api/search
 * @desc    Search files by filename, tags, or category
 * @access  Private
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { q, category, tag } = req.query;
    const userId = req.userId;

    if (!q && !category && !tag) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a search query, category, or tag',
      });
    }

    // Build search query
    // Sequelize: Use Op operators for complex queries
    const whereClause = { userId };

    // Text search on filename and tags
    if (q) {
      // Use case-insensitive matching so searches are not case-sensitive
      whereClause[Op.or] = [
        { filename: { [Op.iLike]: `%${q}%` } },
        { originalFilename: { [Op.iLike]: `%${q}%` } },
        { tags: { [Op.iLike]: `%${q}%` } },
      ];
    }

    // Filter by category
    if (category) {
      whereClause.category = category;
    }

    // Filter by tag
    if (tag) {
      whereClause.tags = { [Op.iLike]: `%${tag}%` };
    }

    const documents = await Document.findAll({
      where: whereClause,
      attributes: { exclude: ['encryptedKey', 'encryptedIV', 'filePath', 'pinHash'] },
      order: [['uploadedAt', 'DESC']],
    });

    const docs = documents.map(d => {
      const plain = d.get({ plain: true });
      return {
        ...plain,
        name: plain.displayName || plain.originalFilename,
      };
    });

    res.json({
      success: true,
      count: docs.length,
      data: {
        documents: docs,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/search/categories
 * @desc    Get all categories with file counts
 * @access  Private
 */
router.get('/categories', authenticate, async (req, res, next) => {
  try {
    const userId = req.userId;

    // Sequelize: Use findAll with group and attributes for aggregation
    const { sequelize } = await import('../config/db.js');
    const categories = await Document.findAll({
      where: { userId },
      attributes: [
        'category',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['category'],
      order: [['category', 'ASC']],
      raw: true,
    });

    res.json({
      success: true,
      data: {
        categories: categories.map(cat => ({
          name: cat.category,
          count: parseInt(cat.count),
        })),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/search/tags
 * @desc    Get all tags with file counts
 * @access  Private
 * 
 * Note: Since tags are stored as comma-separated string in PostgreSQL,
 * this implementation counts files containing each tag rather than
 * true tag aggregation. For better performance, consider a separate
 * tags table with a many-to-many relationship.
 */
router.get('/tags', authenticate, async (req, res, next) => {
  try {
    const userId = req.userId;

    // Get all documents for the user
    const documents = await Document.findAll({
      where: { userId },
      attributes: ['tags'],
    });

    // Extract and count tags
    const tagCounts = {};
    documents.forEach(doc => {
      const tags = doc.tags; // Getter converts comma-separated string to array
      if (Array.isArray(tags)) {
        tags.forEach(tag => {
          if (tag && tag.trim()) {
            tagCounts[tag.trim()] = (tagCounts[tag.trim()] || 0) + 1;
          }
        });
      }
    });

    // Convert to array and sort by count
    const tags = Object.entries(tagCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    res.json({
      success: true,
      data: {
        tags,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;

