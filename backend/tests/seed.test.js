'use strict';

/**
 * Seed script unit test
 * Ellenőrzi, hogy a seed() függvény:
 *   - pontosan 8 kategóriát hoz létre
 *   - pontosan 55 terméket hoz létre
 *   - minden termék is_active = true
 *   - minden termékhez tartozik érvényes category_id
 */

const { Sequelize } = require('sequelize');
const { seed } = require('../scripts/seed');

// Felfüggesztjük a globális modelleket — a seed saját Sequelize instance-t kap
jest.mock('../src/models', () => {
  // Ez szándékosan üres: a tesztben közvetlenül adunk modelleket a seed()-nek
  return {};
});

describe('seed()', () => {
  let sequelize;
  let Category;
  let Product;

  beforeAll(async () => {
    sequelize = new Sequelize({ dialect: 'sqlite', storage: ':memory:', logging: false });

    Category = sequelize.define('Category', {
      name:        { type: Sequelize.STRING, allowNull: false },
      slug:        { type: Sequelize.STRING, allowNull: false, unique: true },
      description: { type: Sequelize.TEXT },
    });

    Product = sequelize.define('Product', {
      name:        { type: Sequelize.STRING, allowNull: false },
      slug:        { type: Sequelize.STRING, allowNull: false, unique: true },
      price:       { type: Sequelize.FLOAT, allowNull: false },
      stock:       { type: Sequelize.INTEGER, defaultValue: 0 },
      is_active:   { type: Sequelize.BOOLEAN, defaultValue: true },
      category_id: { type: Sequelize.INTEGER },
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('8 kategóriát és 55 terméket hoz létre üres adatbázisból', async () => {
    const result = await seed({ sequelize, Category, Product });

    expect(result.categories).toBe(8);
    expect(result.products).toBe(55);
  });

  test('minden kategória létezik az adatbázisban', async () => {
    const count = await Category.count();
    expect(count).toBe(8);
  });

  test('minden termék is_active = true', async () => {
    const inactive = await Product.count({ where: { is_active: false } });
    expect(inactive).toBe(0);
  });

  test('minden terméknek van érvényes category_id', async () => {
    const withoutCategory = await Product.count({ where: { category_id: null } });
    expect(withoutCategory).toBe(0);
  });

  test('idempotens: ismételt hívás is 55 terméket ad (force:true újraírja a DB-t)', async () => {
    const result = await seed({ sequelize, Category, Product });
    expect(result.products).toBe(55);

    const totalProducts = await Product.count();
    expect(totalProducts).toBe(55);
  });
});
