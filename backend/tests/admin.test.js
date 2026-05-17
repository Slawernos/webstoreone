const request = require('supertest');
const app = require('../src/app');
const { sequelize } = require('../src/models');

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Admin API (auth nélkül)', () => {
  it('GET /api/admin/stats – 401 token nélkül', async () => {
    const res = await request(app).get('/api/admin/stats');
    expect(res.status).toBe(401);
  });

  it('GET /api/admin/products – 401 token nélkül', async () => {
    const res = await request(app).get('/api/admin/products');
    expect(res.status).toBe(401);
  });

  it('POST /api/admin/products – 401 token nélkül', async () => {
    const res = await request(app)
      .post('/api/admin/products')
      .send({ name: 'Teszt', price: 100, stock: 5, category_id: 1 });
    expect(res.status).toBe(401);
  });

  it('GET /api/admin/orders – 401 token nélkül', async () => {
    const res = await request(app).get('/api/admin/orders');
    expect(res.status).toBe(401);
  });

  it('PUT /api/admin/orders/1/status – 401 token nélkül', async () => {
    const res = await request(app)
      .put('/api/admin/orders/1/status')
      .send({ status: 'confirmed' });
    expect(res.status).toBe(401);
  });
});
