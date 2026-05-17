const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const { Category } = require('../models');
const { requireAuthMiddleware, requireAdmin } = require('../middleware/auth');

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  next();
};

// GET /api/categories – összes kategória
router.get('/', async (req, res, next) => {
  try {
    const categories = await Category.findAll({ order: [['name', 'ASC']] });
    res.json(categories);
  } catch (err) {
    next(err);
  }
});

// GET /api/categories/:id
router.get(
  '/:id',
  param('id').isInt({ min: 1 }),
  validate,
  async (req, res, next) => {
    try {
      const category = await Category.findByPk(req.params.id);
      if (!category) return res.status(404).json({ error: 'Kategória nem található' });
      res.json(category);
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/categories – csak admin
router.post(
  '/',
  requireAuthMiddleware,
  requireAdmin,
  [
    body('name').trim().notEmpty().withMessage('A név kötelező'),
    body('slug').trim().notEmpty().matches(/^[a-z0-9-]+$/).withMessage('Érvénytelen slug'),
    body('description').optional().trim(),
    body('image_url').optional().isURL(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { name, slug, description, image_url } = req.body;
      const category = await Category.create({ name, slug, description, image_url });
      res.status(201).json(category);
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ error: 'Ez a kategória már létezik' });
      }
      next(err);
    }
  }
);

// PUT /api/categories/:id – csak admin
router.put(
  '/:id',
  requireAuthMiddleware,
  requireAdmin,
  param('id').isInt({ min: 1 }),
  [
    body('name').optional().trim().notEmpty(),
    body('slug').optional().trim().matches(/^[a-z0-9-]+$/),
    body('description').optional().trim(),
    body('image_url').optional().isURL(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const category = await Category.findByPk(req.params.id);
      if (!category) return res.status(404).json({ error: 'Kategória nem található' });
      await category.update(req.body);
      res.json(category);
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/categories/:id – csak admin
router.delete(
  '/:id',
  requireAuthMiddleware,
  requireAdmin,
  param('id').isInt({ min: 1 }),
  validate,
  async (req, res, next) => {
    try {
      const category = await Category.findByPk(req.params.id);
      if (!category) return res.status(404).json({ error: 'Kategória nem található' });
      await category.destroy();
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
