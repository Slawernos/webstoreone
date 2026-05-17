const express = require('express');
const { body, validationResult } = require('express-validator');
const { Order, OrderItem, Cart, Product, User } = require('../models');
const { requireAuthMiddleware, loadDbUser } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuthMiddleware);
router.use(loadDbUser);

// ── GET /api/orders ────────────────────────────────────────
// Saját rendelések listája
router.get('/', async (req, res, next) => {
  try {
    const orders = await Order.findAll({
      where: { user_id: req.dbUser.id },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }],
        },
      ],
      order: [['created_at', 'DESC']],
    });
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

// ── GET /api/orders/:id ────────────────────────────────────
// Egy rendelés részletei
router.get('/:id', async (req, res, next) => {
  try {
    const order = await Order.findOne({
      where: { id: req.params.id, user_id: req.dbUser.id },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }],
        },
      ],
    });
    if (!order) {
      return res.status(404).json({ error: 'Rendelés nem található' });
    }
    res.json(order);
  } catch (err) {
    next(err);
  }
});

// ── POST /api/orders ───────────────────────────────────────
// Checkout: kosárból rendelés létrehozása
router.post(
  '/',
  [
    body('shipping_address')
      .notEmpty()
      .withMessage('Szállítási cím megadása kötelező'),
    body('phone')
      .optional()
      .matches(/^[+\d\s()-]{6,20}$/)
      .withMessage('Érvénytelen telefonszám formátum'),
    body('delivery_date')
      .optional()
      .isISO8601({ strict: false })
      .withMessage('Érvénytelen dátum formátum'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    try {
      const cartItems = await Cart.findAll({
        where: { user_id: req.dbUser.id },
        include: [{ model: Product, as: 'product' }],
      });

      if (cartItems.length === 0) {
        return res.status(400).json({ error: 'A kosár üres' });
      }

      // Készlet ellenőrzés minden tételre
      for (const item of cartItems) {
        if (item.product.stock < item.quantity) {
          return res.status(400).json({
            error: `Nincs elég készlet: ${item.product.name}`,
          });
        }
      }

      // Összeg számítás
      const total = cartItems.reduce(
        (sum, item) => sum + Number(item.product.price) * item.quantity,
        0
      );

      // Rendelés létrehozása tranzakcióban
      const { sequelize } = require('../models');
      const order = await sequelize.transaction(async (t) => {
        const newOrder = await Order.create(
          {
            user_id: req.dbUser.id,
            status: 'pending',
            total_price: Number(total.toFixed(2)),
            shipping_address: req.body.shipping_address,
            phone: req.body.phone || null,
            delivery_date: req.body.delivery_date || null,
          },
          { transaction: t }
        );

        // Rendelés tételek + készlet csökkentés
        await Promise.all(
          cartItems.map(async (item) => {
            await OrderItem.create(
              {
                order_id: newOrder.id,
                product_id: item.product_id,
                quantity: item.quantity,
                unit_price: item.product.price,
              },
              { transaction: t }
            );

            await item.product.update(
              { stock: item.product.stock - item.quantity },
              { transaction: t }
            );
          })
        );

        // Kosár kiürítése
        await Cart.destroy({ where: { user_id: req.dbUser.id }, transaction: t });

        return newOrder;
      });

      res.status(201).json(order);
    } catch (err) {
      next(err);
    }
  }
);

// ── DELETE /api/orders/:id ─────────────────────────────────
// Rendelés lemondása (csak pending státuszban)
router.delete('/:id', async (req, res, next) => {
  try {
    const order = await Order.findOne({
      where: { id: req.params.id, user_id: req.dbUser.id },
    });
    if (!order) {
      return res.status(404).json({ error: 'Rendelés nem található' });
    }
    if (order.status !== 'pending') {
      return res.status(400).json({ error: 'Csak függőben lévő rendelés mondható le' });
    }
    await order.update({ status: 'cancelled' });
    res.json({ message: 'Rendelés lemondva' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
