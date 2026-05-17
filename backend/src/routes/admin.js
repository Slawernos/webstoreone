const express = require('express');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { Product, Category, Order, OrderItem, User } = require('../models');
const { requireAuthMiddleware, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Minden admin route-hoz: bejelentkezett + admin role
router.use(requireAuthMiddleware, requireAdmin);

// ──────────────────────────────────────────────────────────
// TERMÉKEK
// ──────────────────────────────────────────────────────────

// GET /api/admin/products – összes termék (inactive is)
router.get('/products', async (req, res, next) => {
  try {
    const products = await Product.findAll({
      include: [{ model: Category, as: 'category' }],
      order: [['created_at', 'DESC']],
    });
    res.json(products);
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/products – új termék
router.post(
  '/products',
  [
    body('name').notEmpty().withMessage('Név kötelező'),
    body('price').isFloat({ min: 0 }).withMessage('Érvényes ár szükséges'),
    body('stock').isInt({ min: 0 }).withMessage('Érvényes készlet szükséges'),
    body('category_id').isInt().withMessage('Kategória ID szükséges'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
    try {
      const slug = (req.body.name || '')
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      const product = await Product.create({ ...req.body, slug });
      res.status(201).json(product);
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/admin/products/:id – termék szerkesztése
router.put('/products/:id', async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Termék nem található' });
    await product.update(req.body);
    res.json(product);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/products/:id – soft delete
router.delete('/products/:id', async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Termék nem található' });
    await product.update({ is_active: false });
    res.json({ message: 'Termék deaktiválva' });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────────────────
// RENDELÉSEK
// ──────────────────────────────────────────────────────────

// GET /api/admin/orders – összes rendelés
router.get('/orders', async (req, res, next) => {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }],
        },
        { model: User, as: 'user' },
      ],
      order: [['created_at', 'DESC']],
    });
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/orders/:id/status – státusz változtatás
router.put(
  '/orders/:id/status',
  [
    body('status')
      .isIn(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'])
      .withMessage('Érvénytelen státusz'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
    try {
      const order = await Order.findByPk(req.params.id);
      if (!order) return res.status(404).json({ error: 'Rendelés nem található' });
      await order.update({ status: req.body.status });
      res.json(order);
    } catch (err) {
      next(err);
    }
  }
);

// ──────────────────────────────────────────────────────────
// DASHBOARD STAT
// ──────────────────────────────────────────────────────────

// GET /api/admin/stats
router.get('/stats', async (req, res, next) => {
  try {
    const [productCount, orderCount, userCount, pendingOrders] = await Promise.all([
      Product.count({ where: { is_active: true } }),
      Order.count(),
      User.count(),
      Order.count({ where: { status: 'pending' } }),
    ]);
    res.json({ productCount, orderCount, userCount, pendingOrders });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
