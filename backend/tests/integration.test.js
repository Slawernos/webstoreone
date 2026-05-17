/**
 * Integráció tesztek: Category + Product CRUD API
 * (sequelize közvetlen adatbevitel + HTTP kérések)
 */
const request = require('supertest');
const app = require('../src/app');
const { sequelize, Category, Product } = require('../src/models');

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Category + Product integráció', () => {
  let categoryId;
  let productId;

  it('kategória létrehozható közvetlenül', async () => {
    const cat = await Category.create({
      name: 'Kutyaeledel',
      slug: 'kutyaeledel-int',
      description: 'Kutyás termékek',
    });
    expect(cat.id).toBeDefined();
    categoryId = cat.id;
  });

  it('termék létrehozható az adott kategóriával', async () => {
    const p = await Product.create({
      name: 'Premium tap',
      slug: 'premium-tap-int',
      price: 3990,
      stock: 20,
      category_id: categoryId,
    });
    expect(p.id).toBeDefined();
    expect(p.is_active).toBe(true);
    productId = p.id;
  });

  it('GET /api/products listázza a terméket', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.products.length).toBeGreaterThan(0);
    expect(res.body.total).toBeGreaterThan(0);
  });

  it('GET /api/products?search= szűr névre', async () => {
    const res = await request(app).get('/api/products?search=Premium');
    expect(res.status).toBe(200);
    expect(res.body.products.length).toBeGreaterThan(0);
    expect(res.body.products[0].name).toMatch(/Premium/i);
  });

  it('GET /api/products?category_id= szűr kategóriára', async () => {
    const res = await request(app).get(`/api/products?category_id=${categoryId}`);
    expect(res.status).toBe(200);
    expect(res.body.products.length).toBeGreaterThan(0);
  });

  it('GET /api/products/:id visszaadja a terméket kategóriával', async () => {
    const res = await request(app).get(`/api/products/${productId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(productId);
    expect(res.body.category).toBeDefined();
    expect(res.body.category.slug).toBe('kutyaeledel-int');
  });

  it('GET /api/categories listázza a kategóriát', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('GET /api/categories/:id visszaadja a kategóriát termékeivel', async () => {
    const res = await request(app).get(`/api/categories/${categoryId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(categoryId);
  });

  it('GET /api/products 404 nem létező ID-nél', async () => {
    const res = await request(app).get('/api/products/99999');
    expect(res.status).toBe(404);
  });

  it('GET /api/health 200-at ad vissza', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
