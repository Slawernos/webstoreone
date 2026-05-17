const { requireAuth, getAuth } = require('@clerk/express');

/**
 * Védett route-okhoz: bejelentkezett felhasználó szükséges.
 * Clerk session token validálása, 401 ha nincs / lejárt.
 */
const requireAuthMiddleware = requireAuth({
  signInUrl: '/sign-in',
});

/**
 * Opcionális auth: nem dob hibát ha nincs token,
 * de ha van, beállítja req.auth.
 */
const optionalAuth = (req, res, next) => {
  next();
};

/**
 * Admin route-okhoz: bejelentkezett + admin role szükséges.
 */
const requireAdmin = async (req, res, next) => {
  try {
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
