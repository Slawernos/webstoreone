const { sequelize, User, Category, Product, Order, OrderItem, Cart } = require('../src/models');

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('User modell', () => {
  it('létrehozható érvényes adatokkal', async () => {
    const user = await User.create({
      clerk_user_id: 'user_test123',
      email: 'test@example.com',
      first_name: 'Teszt',
      last_name: 'Felhasználó',
    });
    expect(user.id).toBeDefined();
    expect(user.role).toBe('customer');
  });

  it('hibát dob duplikált clerk_user_id esetén', async () => {
    await expect(
      User.create({ clerk_user_id: 'user_test123', email: 'other@example.com' })
    ).rejects.toThrow();
  });
});

describe('Category modell', () => {
  it('létrehozható kategória', async () => {
    const cat = await Category.create({ name: 'Kutyaeledel', slug: 'kutyaeledel' });
    expect(cat.id).toBeDefined();
  });
});

describe('Product modell', () => {
  it('termék létrehozható kategóriával', async () => {
    const cat = await Category.findOne({ where: { slug: 'kutyaeledel' } });
    const product = await Product.create({
      name: 'Prémium kutyatáp',
      slug: 'premium-kutyatap',
      price: 4990.00,
      stock: 50,
      category_id: cat.id,
    });
    expect(product.id).toBeDefined();
    expect(product.is_active).toBe(true);
  });
});

describe('Order és OrderItem modellek', () => {
  it('rendelés és tételek létrehozhatók', async () => {
    const user = await User.findOne();
    const product = await Product.findOne();
    const order = await Order.create({
      user_id: user.id,
      total_price: 4990.00,
    });
    const item = await OrderItem.create({
      order_id: order.id,
      product_id: product.id,
      quantity: 1,
      unit_price: 4990.00,
    });
    expect(item.id).toBeDefined();
    expect(order.status).toBe('pending');
  });
});

describe('Cart modell', () => {
  it('kosár elem létrehozható', async () => {
    const user = await User.findOne();
    const product = await Product.findOne();
    const cartItem = await Cart.create({
      user_id: user.id,
      product_id: product.id,
      quantity: 2,
    });
    expect(cartItem.id).toBeDefined();
  });
});

describe('Asszociációk', () => {
  it('termék visszaadja a kategóriáját', async () => {
    const product = await Product.findOne({ include: [{ model: Category, as: 'category' }] });
    expect(product.category).toBeDefined();
    expect(product.category.slug).toBe('kutyaeledel');
  });

  it('rendelés visszaadja a tételeit', async () => {
    const order = await Order.findOne({ include: [{ model: OrderItem, as: 'items' }] });
    expect(order.items.length).toBeGreaterThan(0);
  });
});
