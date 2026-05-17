const request = require('supertest');
const app = require('../src/app');
const { sequelize } = require('../src/models');

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Orders API (auth nélkül)', () => {
  it('GET /api/orders – 401 token nélkül', async () => {
    const res = await request(app).get('/api/orders');
    expect(res.status).toBe(401);
  });

  it('POST /api/orders – 401 token nélkül', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({ shipping_address: 'Teszt utca 1.' });
    expect(res.status).toBe(401);
  });

  it('GET /api/orders/:id – 401 token nélkül', async () => {
    const res = await request(app).get('/api/orders/1');
    expect(res.status).toBe(401);
  });

  it('DELETE /api/orders/:id – 401 token nélkül', async () => {
    const res = await request(app).delete('/api/orders/1');
    expect(res.status).toBe(401);
  });
});
