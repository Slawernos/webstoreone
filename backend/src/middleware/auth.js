const { requireAuth, getAuth, clerkClient } = require('@clerk/express');

/**
 * Védett route-okhoz: bejelentkezett felhasználó szükséges.
 * Ha nincs Clerk kulcs konfigurálva (pl. tesztben), azonnal 401.
 * Megjegyzés: clerkMiddleware() már globálisan fut az app.js-ben.
 */
const requireAuthMiddleware = (req, res, next) => {
  if (!process.env.CLERK_SECRET_KEY || !process.env.CLERK_PUBLISHABLE_KEY) {
    return res.status(401).json({ error: 'Nem vagy bejelentkezve' });
  }
  return requireAuth({ signInUrl: '/sign-in' })(req, res, next);
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
 * A role-t a Clerk publicMetadata-ból olvassa (nem a helyi DB-ből).
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

    const clerkUser = await clerkClient.users.getUser(userId);
    if (clerkUser.publicMetadata?.role !== 'admin') {
      return res.status(403).json({ error: 'Nincs jogosultságod' });
    }

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
      let user = await User.findOne({ where: { clerk_user_id: userId } });
      if (!user) {
        const clerkUser = await clerkClient.users.getUser(userId);
        const email = clerkUser.emailAddresses[0]?.emailAddress || `${userId}@unknown.local`;
        user = await User.create({
          clerk_user_id: userId,
          email,
          first_name: clerkUser.firstName || null,
          last_name: clerkUser.lastName || null,
          role: clerkUser.publicMetadata?.role === 'admin' ? 'admin' : 'customer',
        });
      }
      req.dbUser = user;
    }
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { requireAuthMiddleware, optionalAuth, requireAdmin, loadDbUser };
