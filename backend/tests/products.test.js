const request = require('supertest');
const app = require('../src/app');
const { sequelize } = require('../src/models');

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('GET /api/categories', () => {
  it('üres listát ad vissza kezdetben', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('GET /api/products', () => {
  it('üres lapozott listát ad vissza kezdetben', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.products).toEqual([]);
    expect(res.body.total).toBe(0);
    expect(res.body.page).toBe(1);
  });

  it('lapozás query paraméterei működnek', async () => {
    const res = await request(app).get('/api/products?page=2&limit=5');
    expect(res.status).toBe(200);
    expect(res.body.page).toBe(2);
  });
});

describe('GET /api/categories/:id', () => {
  it('404-et ad vissza nem létező kategóriánál', async () => {
    const res = await request(app).get('/api/categories/9999');
    expect(res.status).toBe(404);
  });

  it('422-t ad vissza érvénytelen id esetén', async () => {
    const res = await request(app).get('/api/categories/abc');
    expect(res.status).toBe(422);
  });
});

describe('GET /api/products/:id', () => {
  it('404-et ad vissza nem létező terméknél', async () => {
    const res = await request(app).get('/api/products/9999');
    expect(res.status).toBe(404);
  });
});

describe('POST /api/categories – auth nélkül', () => {
  it('401-et ad vissza autentikáció nélkül', async () => {
    const res = await request(app)
      .post('/api/categories')
      .send({ name: 'Teszt', slug: 'teszt' });
    expect(res.status).toBe(401);
  });
});

describe('POST /api/products – auth nélkül', () => {
  it('401-et ad vissza autentikáció nélkül', async () => {
    const res = await request(app)
      .post('/api/products')
      .send({ name: 'Termék', slug: 'termek', price: 100, stock: 5 });
    expect(res.status).toBe(401);
  });
});
