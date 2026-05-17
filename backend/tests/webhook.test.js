const request = require('supertest');
const { createHmac } = require('crypto');
const app = require('../src/app');
const { sequelize } = require('../src/models');

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

// Svix aláírás generáló segédfüggvény tesztekhez
function signWebhook(secret, payload, msgId, timestamp) {
  const toSign = `${msgId}.${timestamp}.${payload}`;
  const hmac = createHmac('sha256', Buffer.from(secret.replace('whsec_', ''), 'base64'));
  hmac.update(toSign);
  return `v1,${hmac.digest('base64')}`;
}

describe('Clerk Webhook – /api/webhooks/clerk', () => {
  const secret = 'whsec_' + Buffer.from('test-secret-32-bytes-padding!!').toString('base64');

  beforeEach(() => {
    process.env.CLERK_WEBHOOK_SECRET = secret;
  });

  it('400-at ad vissza hiányzó Svix fejlécek esetén', async () => {
    const res = await request(app)
      .post('/api/webhooks/clerk')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ type: 'user.created', data: {} }));
    expect(res.status).toBe(400);
  });

  it('400-at ad vissza érvénytelen aláírás esetén', async () => {
    const res = await request(app)
      .post('/api/webhooks/clerk')
      .set('Content-Type', 'application/json')
      .set('svix-id', 'msg_test')
      .set('svix-timestamp', String(Math.floor(Date.now() / 1000)))
      .set('svix-signature', 'v1,invalidsignature')
      .send(JSON.stringify({ type: 'user.created', data: {} }));
    expect(res.status).toBe(400);
  });

  it('500-at ad vissza hiányzó webhook secret esetén', async () => {
    delete process.env.CLERK_WEBHOOK_SECRET;
    const res = await request(app)
      .post('/api/webhooks/clerk')
      .set('Content-Type', 'application/json')
      .set('svix-id', 'msg_1')
      .set('svix-timestamp', '1234567890')
      .set('svix-signature', 'v1,test')
      .send(JSON.stringify({ type: 'user.created', data: {} }));
    expect(res.status).toBe(500);
  });
});
