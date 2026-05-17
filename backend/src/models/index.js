const sequelize = require('../config/database');
const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Cart = require('./Cart');

// Kategória – Termék (1:N)
Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

// Felhasználó – Rendelés (1:N)
User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Rendelés – RendelésElem (1:N)
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

// Termék – RendelésElem (1:N)
Product.hasMany(OrderItem, { foreignKey: 'product_id', as: 'order_items' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// Felhasználó – Kosár (1:N)
User.hasMany(Cart, { foreignKey: 'user_id', as: 'cart_items' });
Cart.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Termék – Kosár (1:N)
Product.hasMany(Cart, { foreignKey: 'product_id', as: 'cart_entries' });
Cart.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

module.exports = { sequelize, User, Category, Product, Order, OrderItem, Cart };
