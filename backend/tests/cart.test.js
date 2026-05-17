const request = require('supertest');
const app = require('../src/app');
const { sequelize } = require('../src/models');

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Cart API (auth nélkül)', () => {
  it('GET /api/cart – 401 ha nincs token', async () => {
    const res = await request(app).get('/api/cart');
    expect(res.status).toBe(401);
  });

  it('POST /api/cart – 401 ha nincs token', async () => {
    const res = await request(app)
      .post('/api/cart')
      .send({ product_id: 1, quantity: 1 });
    expect(res.status).toBe(401);
  });

  it('PUT /api/cart/1 – 401 ha nincs token', async () => {
    const res = await request(app)
      .put('/api/cart/1')
      .send({ quantity: 2 });
    expect(res.status).toBe(401);
  });

  it('DELETE /api/cart/1 – 401 ha nincs token', async () => {
    const res = await request(app).delete('/api/cart/1');
    expect(res.status).toBe(401);
  });

  it('DELETE /api/cart – 401 ha nincs token', async () => {
    const res = await request(app).delete('/api/cart');
    expect(res.status).toBe(401);
  });
});
