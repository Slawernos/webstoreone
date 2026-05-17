const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { Product, Category } = require('../models');
const { requireAuthMiddleware, requireAdmin } = require('../middleware/auth');

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  next();
};

// GET /api/products – lista (szűrés, lapozás)
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('category_id').optional().isInt({ min: 1 }),
    query('search').optional().trim(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;
      const offset = (page - 1) * limit;

      const where = { is_active: true };
      if (req.query.category_id) where.category_id = req.query.category_id;
      if (req.query.search) {
        where.name = { [Op.like]: `%${req.query.search}%` };
      }

      const { count, rows } = await Product.findAndCountAll({
        where,
        include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'slug'] }],
        order: [['created_at', 'DESC']],
        limit,
        offset,
      });

      res.json({
        products: rows,
        total: count,
        page,
        totalPages: Math.ceil(count / limit),
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/products/:id
router.get(
  '/:id',
  param('id').isInt({ min: 1 }),
  validate,
  async (req, res, next) => {
    try {
      const product = await Product.findOne({
        where: { id: req.params.id, is_active: true },
        include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'slug'] }],
      });
      if (!product) return res.status(404).json({ error: 'Termék nem található' });
      res.json(product);
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/products – csak admin
router.post(
  '/',
  requireAuthMiddleware,
  requireAdmin,
  [
    body('name').trim().notEmpty().withMessage('A név kötelező'),
    body('slug').trim().notEmpty().matches(/^[a-z0-9-]+$/).withMessage('Érvénytelen slug'),
    body('price').isFloat({ min: 0 }).withMessage('Érvénytelen ár'),
    body('stock').isInt({ min: 0 }).withMessage('Érvénytelen készlet'),
    body('description').optional().trim(),
    body('image_url').optional().isURL(),
    body('category_id').optional().isInt({ min: 1 }),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { name, slug, price, stock, description, image_url, category_id } = req.body;
      const product = await Product.create({ name, slug, price, stock, description, image_url, category_id });
      res.status(201).json(product);
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ error: 'Ez a slug már foglalt' });
      }
      next(err);
    }
  }
);

// PUT /api/products/:id – csak admin
router.put(
  '/:id',
  requireAuthMiddleware,
  requireAdmin,
  param('id').isInt({ min: 1 }),
  [
    body('name').optional().trim().notEmpty(),
    body('slug').optional().trim().matches(/^[a-z0-9-]+$/),
    body('price').optional().isFloat({ min: 0 }),
    body('stock').optional().isInt({ min: 0 }),
    body('description').optional().trim(),
    body('image_url').optional().isURL(),
    body('category_id').optional().isInt({ min: 1 }),
    body('is_active').optional().isBoolean(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const product = await Product.findByPk(req.params.id);
      if (!product) return res.status(404).json({ error: 'Termék nem található' });
      await product.update(req.body);
      res.json(product);
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/products/:id – soft delete (is_active = false), csak admin
router.delete(
  '/:id',
  requireAuthMiddleware,
  requireAdmin,
  param('id').isInt({ min: 1 }),
  validate,
  async (req, res, next) => {
    try {
      const product = await Product.findByPk(req.params.id);
      if (!product) return res.status(404).json({ error: 'Termék nem található' });
      await product.update({ is_active: false });
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
