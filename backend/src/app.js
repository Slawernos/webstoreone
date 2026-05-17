require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { clerkMiddleware } = require('@clerk/express');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Biztonsági middleware ─────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
}));

// ── Clerk auth middleware ─────────────────────────────────
app.use(clerkMiddleware());

// ── Body parser ───────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health check ─────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Routes (TODO: következő issue-kban) ──────────────────
// app.use('/api/webhooks', require('./routes/webhook'));
// app.use('/api/products', require('./routes/products'));
// app.use('/api/categories', require('./routes/categories'));
// app.use('/api/cart', require('./routes/cart'));
// app.use('/api/orders', require('./routes/orders'));
// app.use('/api/admin', require('./routes/admin'));

// ── 404 kezelés ───────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// ── Hibakezelő middleware ─────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
  });
});

// ── Szerver indítás ───────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Backend fut: http://localhost:${PORT}`);
  });
}

module.exports = app;
