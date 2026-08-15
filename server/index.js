import express from 'express';
import cors from 'cors';
import { readDB, writeDB } from './database.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Admin Auth
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && (password === 'admin' || password === 'password123')) {
    return res.json({
      success: true,
      token: 'autolider-token-admin-2026',
      user: { name: 'Администратор Autolider', role: 'admin' }
    });
  }
  return res.status(401).json({ success: false, message: 'Неверный логин или пароль' });
});

// Dashboard Stats
app.get('/api/stats', (req, res) => {
  const db = readDB();
  const totalSales = db.orders.reduce((acc, order) => acc + (order.totalPrice || 0), 0);
  const totalOrders = db.orders.length;
  const totalCustomers = db.customers.length;
  const totalProducts = db.products.length;

  const salesChart = [
    { month: 'Пн', sales: 450000, orders: 8 },
    { month: 'Вт', sales: 620000, orders: 12 },
    { month: 'Ср', sales: 380000, orders: 7 },
    { month: 'Чт', sales: 890000, orders: 16 },
    { month: 'Пт', sales: 1120000, orders: 21 },
    { month: 'Сб', sales: 940000, orders: 18 },
    { month: 'Вс', sales: 780000, orders: 14 }
  ];

  res.json({
    totalSales,
    totalOrders,
    totalCustomers,
    totalProducts,
    recentOrders: db.orders.slice(0, 5),
    salesChart
  });
});

// Products CRUD
app.get('/api/products', (req, res) => {
  const db = readDB();
  const { search, category, status } = req.query;
  let items = db.products;

  if (search) {
    const q = search.toLowerCase();
    items = items.filter(
      (p) => p.title.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q))
    );
  }
  if (category) {
    items = items.filter((p) => p.categoryId === category);
  }
  if (status) {
    items = items.filter((p) => p.status === status);
  }

  res.json(items);
});

app.get('/api/products/:id', (req, res) => {
  const db = readDB();
  const product = db.products.find((p) => p.id === Number(req.params.id));
  if (!product) return res.status(404).json({ message: 'Товар не найден' });
  res.json(product);
});

app.post('/api/products', (req, res) => {
  const db = readDB();
  const newProduct = {
    id: Date.now(),
    title: req.body.title || 'Новый товар',
    sku: req.body.sku || `ART-${Math.floor(1000 + Math.random() * 9000)}`,
    brand: req.body.brand || 'Autolider',
    price: Number(req.body.price) || 0,
    oldPrice: Number(req.body.oldPrice) || 0,
    stockQty: Number(req.body.stockQty) || 10,
    inStock: true,
    categoryId: req.body.categoryId || 'oils',
    categoryName: req.body.categoryName || 'Автозапчасти',
    status: req.body.status || 'enabled',
    description: req.body.description || '',
    image: req.body.image || 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80'
  };

  db.products.unshift(newProduct);
  writeDB(db);
  res.status(201).json(newProduct);
});

app.put('/api/products/:id', (req, res) => {
  const db = readDB();
  const id = Number(req.params.id);
  const index = db.products.findIndex((p) => p.id === id);
  if (index === -1) return res.status(404).json({ message: 'Товар не найден' });

  db.products[index] = { ...db.products[index], ...req.body };
  writeDB(db);
  res.json(db.products[index]);
});

app.delete('/api/products/:id', (req, res) => {
  const db = readDB();
  const id = Number(req.params.id);
  db.products = db.products.filter((p) => p.id !== id);
  writeDB(db);
  res.json({ success: true, message: 'Товар успешно удален' });
});

// Categories CRUD
app.get('/api/categories', (req, res) => {
  const db = readDB();
  res.json(db.categories);
});

app.post('/api/categories', (req, res) => {
  const db = readDB();
  const newCat = {
    id: req.body.slug || `cat-${Date.now()}`,
    name: req.body.name || 'Новая категория',
    slug: req.body.slug || `cat-${Date.now()}`,
    count: 0,
    parentId: req.body.parentId || null,
    status: 'enabled'
  };
  db.categories.push(newCat);
  writeDB(db);
  res.status(201).json(newCat);
});

app.put('/api/categories/:id', (req, res) => {
  const db = readDB();
  const index = db.categories.findIndex((c) => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Категория не найдена' });

  db.categories[index] = { ...db.categories[index], ...req.body };
  writeDB(db);
  res.json(db.categories[index]);
});

app.delete('/api/categories/:id', (req, res) => {
  const db = readDB();
  db.categories = db.categories.filter((c) => c.id !== req.params.id);
  writeDB(db);
  res.json({ success: true });
});

// Orders CRUD
app.get('/api/orders', (req, res) => {
  const db = readDB();
  res.json(db.orders);
});

app.post('/api/orders', (req, res) => {
  const db = readDB();
  const newOrder = {
    id: String(Math.floor(100000 + Math.random() * 900000)),
    date: new Date().toISOString().replace('T', ' ').slice(0, 16),
    customerName: req.body.customerName || 'Покупатель',
    customerPhone: req.body.customerPhone || '+7 (705) 000-00-00',
    address: req.body.address || 'г. Астана',
    status: 'processing',
    statusText: 'В обработке',
    totalPrice: req.body.totalPrice || 0,
    paymentMethod: req.body.paymentMethod || 'Kaspi QR',
    itemsCount: req.body.items ? req.body.items.length : 1,
    items: req.body.items || []
  };

  db.orders.unshift(newOrder);
  writeDB(db);
  res.status(201).json(newOrder);
});

app.put('/api/orders/:id/status', (req, res) => {
  const db = readDB();
  const order = db.orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ message: 'Заказ не найден' });

  const statusMap = {
    pending: 'Ожидает оплаты',
    processing: 'В обработке',
    shipping: 'В пути',
    delivered: 'Доставлен',
    canceled: 'Отменен'
  };

  order.status = req.body.status;
  order.statusText = statusMap[req.body.status] || req.body.status;
  writeDB(db);
  res.json(order);
});

// Customers CRUD
app.get('/api/customers', (req, res) => {
  const db = readDB();
  res.json(db.customers);
});

app.put('/api/customers/:id', (req, res) => {
  const db = readDB();
  const index = db.customers.findIndex((c) => c.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Клиент не найден' });

  db.customers[index] = { ...db.customers[index], ...req.body };
  writeDB(db);
  res.json(db.customers[index]);
});

// Banners CRUD
app.get('/api/banners', (req, res) => {
  const db = readDB();
  res.json(db.banners);
});

app.post('/api/banners', (req, res) => {
  const db = readDB();
  const newBanner = {
    id: Date.now(),
    title: req.body.title || 'Новый баннер',
    subtitle: req.body.subtitle || '',
    status: 'active',
    image: req.body.image || '/assets/img/hero_bg.webp'
  };
  db.banners.push(newBanner);
  writeDB(db);
  res.status(201).json(newBanner);
});

app.delete('/api/banners/:id', (req, res) => {
  const db = readDB();
  db.banners = db.banners.filter((b) => b.id !== Number(req.params.id));
  writeDB(db);
  res.json({ success: true });
});

// Settings
app.get('/api/settings', (req, res) => {
  const db = readDB();
  res.json(db.settings);
});

app.put('/api/settings', (req, res) => {
  const db = readDB();
  db.settings = { ...db.settings, ...req.body };
  writeDB(db);
  res.json(db.settings);
});

app.listen(PORT, () => {
  console.log(`🚀 Autolider Node.js Express Backend running on http://localhost:${PORT}`);
});
