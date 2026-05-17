const express = require('express');
const { body, validationResult } = require('express-validator');
const { Cart, Product } = require('../models');
const { requireAuthMiddleware, loadDbUser } = require('../middleware/auth');

const router = express.Router();

// Minden cart endpoint auth + dbUser szükséges
router.use(requireAuthMiddleware);
router.use(loadDbUser);

// ── GET /api/cart ──────────────────────────────────────────
// Bejelentkezett felhasználó kosarának listázása
router.get('/', async (req, res, next) => {
  try {
    const items = await Cart.findAll({
      where: { user_id: req.dbUser.id },
      include: [{ model: Product, as: 'product' }],
      order: [['created_at', 'DESC']],
    });

    const total = items.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0
    );

    res.json({ items, total: Number(total.toFixed(2)) });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/cart ─────────────────────────────────────────
// Termék hozzáadása kosárhoz (vagy mennyiség növelése)
router.post(
  '/',
  [
    body('product_id').isInt({ min: 1 }).withMessage('Érvénytelen termék azonosító'),
    body('quantity').isInt({ min: 1 }).withMessage('A mennyiség legalább 1 kell legyen'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    try {
      const { product_id, quantity } = req.body;

      // Termék létezik-e és aktív-e?
      const product = await Product.findOne({
        where: { id: product_id, is_active: true },
      });
      if (!product) {
        return res.status(404).json({ error: 'Termék nem található' });
      }

      // Elég készlet van-e?
      const existing = await Cart.findOne({
        where: { user_id: req.dbUser.id, product_id },
      });
      const currentQty = existing ? existing.quantity : 0;
      if (product.stock < currentQty + quantity) {
        return res.status(400).json({ error: 'Nincs elég készlet' });
      }

      if (existing) {
        await existing.update({ quantity: existing.quantity + quantity });
        return res.json(existing);
      }

      const item = await Cart.create({
        user_id: req.dbUser.id,
        product_id,
        quantity,
      });
      return res.status(201).json(item);
    } catch (err) {
      next(err);
    }
  }
);

// ── PUT /api/cart/:id ──────────────────────────────────────
// Kosár tétel mennyiségének módosítása
router.put(
  '/:id',
  [body('quantity').isInt({ min: 0 }).withMessage('Érvénytelen mennyiség')],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    try {
      const item = await Cart.findOne({
        where: { id: req.params.id, user_id: req.dbUser.id },
        include: [{ model: Product, as: 'product' }],
      });
      if (!item) {
        return res.status(404).json({ error: 'Kosár tétel nem található' });
      }

      const { quantity } = req.body;

      // Ha 0, töröljük
      if (quantity === 0) {
        await item.destroy();
        return res.json({ message: 'Tétel törölve' });
      }

      // Készlet ellenőrzés
      if (item.product.stock < quantity) {
        return res.status(400).json({ error: 'Nincs elég készlet' });
      }

      await item.update({ quantity });
      return res.json(item);
    } catch (err) {
      next(err);
    }
  }
);

// ── DELETE /api/cart/:id ───────────────────────────────────
// Kosár tétel törlése
router.delete('/:id', async (req, res, next) => {
  try {
    const item = await Cart.findOne({
      where: { id: req.params.id, user_id: req.dbUser.id },
    });
    if (!item) {
      return res.status(404).json({ error: 'Kosár tétel nem található' });
    }
    await item.destroy();
    res.json({ message: 'Tétel törölve' });
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/cart ───────────────────────────────────────
// Teljes kosár törlése
router.delete('/', async (req, res, next) => {
  try {
    await Cart.destroy({ where: { user_id: req.dbUser.id } });
    res.json({ message: 'Kosár kiürítve' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
