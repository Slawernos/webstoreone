const express = require('express');
const { Webhook } = require('svix');
const { User } = require('../models');

const router = express.Router();

/**
 * POST /api/webhooks/clerk
 * Clerk eseményeket fogad (user.created, user.updated, user.deleted)
 * és szinkronizálja a helyi User táblával.
 * Svix aláírás ellenőrzéssel védett.
 */
router.post(
  '/clerk',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('CLERK_WEBHOOK_SECRET nincs beállítva');
      return res.status(500).json({ error: 'Webhook secret hiányzik' });
    }

    // Svix aláírás validálás
    const svixId = req.headers['svix-id'];
    const svixTimestamp = req.headers['svix-timestamp'];
    const svixSignature = req.headers['svix-signature'];

    if (!svixId || !svixTimestamp || !svixSignature) {
      return res.status(400).json({ error: 'Hiányoznak a Svix fejlécek' });
    }

    let event;
    try {
      const wh = new Webhook(webhookSecret);
      event = wh.verify(req.body, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      });
    } catch (err) {
      console.error('Webhook aláírás érvénytelen:', err.message);
      return res.status(400).json({ error: 'Érvénytelen aláírás' });
    }

    const { type, data } = event;

    try {
      if (type === 'user.created') {
        const email = data.email_addresses?.[0]?.email_address;
        await User.findOrCreate({
          where: { clerk_user_id: data.id },
          defaults: {
            email: email || `${data.id}@placeholder.local`,
            first_name: data.first_name || null,
            last_name: data.last_name || null,
          },
        });
      } else if (type === 'user.updated') {
        const email = data.email_addresses?.[0]?.email_address;
        await User.update(
          {
            email: email || `${data.id}@placeholder.local`,
            first_name: data.first_name || null,
            last_name: data.last_name || null,
          },
          { where: { clerk_user_id: data.id } }
        );
      } else if (type === 'user.deleted') {
        await User.destroy({ where: { clerk_user_id: data.id } });
      }

      res.json({ received: true });
    } catch (err) {
      console.error('Webhook DB hiba:', err);
      res.status(500).json({ error: 'DB hiba a webhook feldolgozásakor' });
    }
  }
);

module.exports = router;
