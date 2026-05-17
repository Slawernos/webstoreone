if (process.env.NODE_ENV !== 'test') {
  require('dotenv').config();
}
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { clerkMiddleware } = require('@clerk/express');
const { sequelize } = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;
const hasClerkKeys = Boolean(process.env.CLERK_SECRET_KEY && process.env.CLERK_PUBLISHABLE_KEY);

// ── Biztonsági middleware ─────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      process.env.NODE_ENV === 'development' &&
      /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+):\d+$/.test(origin)
    ) {
      return callback(null, true);
    }
    const allowed = (process.env.FRONTEND_URL || 'http://localhost:5173').split(',').map(s => s.trim());
    if (allowed.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 1000 : 100,
  standardHeaders: true,
  legacyHeaders: false,
}));

// ── Clerk middleware (globálisan, egyszer, JWKS cache) ────
if (hasClerkKeys) {
  app.use(clerkMiddleware());
}

// ── Webhook (raw body – express.json() ELŐTT kell!) ──────
app.use('/api/webhooks', require('./routes/webhook'));

// ── Body parser ───────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health check (auth előtt – nem igényel tokent) ────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Routes ────────────────────────────────────────────────
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));

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
  sequelize.sync({ alter: false }).then(() => {
    app.listen(PORT, () => {
      console.log(`Backend fut: http://localhost:${PORT}`);
    });
  }).catch((err) => {
    console.error('DB szinkronizáció sikertelen:', err);
    process.exit(1);
  });
}

module.exports = app;
