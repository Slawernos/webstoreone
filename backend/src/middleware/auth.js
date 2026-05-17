const { requireAuth, getAuth, clerkMiddleware } = require('@clerk/express');

/**
 * Védett route-okhoz: bejelentkezett felhasználó szükséges.
 * Ha nincs Clerk kulcs konfigurálva (pl. tesztben), azonnal 401.
 */
const requireAuthMiddleware = (req, res, next) => {
  if (!process.env.CLERK_SECRET_KEY || !process.env.CLERK_PUBLISHABLE_KEY) {
    return res.status(401).json({ error: 'Nem vagy bejelentkezve' });
  }
  return [clerkMiddleware(), requireAuth({ signInUrl: '/sign-in' })].reduce(
    (chain, mw) => (r, s, n) => chain(r, s, (err) => (err ? n(err) : mw(r, s, n))),
    (r, s, n) => n()
  )(req, res, next);
};

/**
 * Opcionális auth: nem dob hibát ha nincs token,
 * de ha van, beállítja req.auth.
 */
const optionalAuth = (req, res, next) => {
  next();
};

/**
 * Admin route-okhoz: bejelentkezett + admin role szükséges.
 * requireAuthMiddleware UTÁN használandó.
 */
const requireAdmin = async (req, res, next) => {
  try {
    if (!process.env.CLERK_SECRET_KEY) {
      return res.status(401).json({ error: 'Nem vagy bejelentkezve' });
    }
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ error: 'Nem vagy bejelentkezve' });
    }

    const { User } = require('../models');
    const user = await User.findOne({ where: { clerk_user_id: userId } });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Nincs jogosultságod' });
    }

    req.dbUser = user;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Bejelentkezett user DB rekordját tölti be req.dbUser-be.
 * requireAuth után használandó.
 */
const loadDbUser = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    if (userId) {
      const { User } = require('../models');
      const user = await User.findOne({ where: { clerk_user_id: userId } });
      req.dbUser = user || null;
    }
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { requireAuthMiddleware, optionalAuth, requireAdmin, loadDbUser };
