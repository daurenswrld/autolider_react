import express from 'express';
import cors from 'cors';
import XLSX from 'xlsx';
import { readDB, writeDB } from './database.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

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
      user: { name: 'Администратор Autolider', role: 'super_admin' }
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

// Products CRUD & Filters
app.get('/api/products', (req, res) => {
  const db = readDB();
  const { search, category, carMake, carModel, minPrice, maxPrice, status } = req.query;
  let items = db.products;

  if (search) {
    const q = search.toLowerCase();
    items = items.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q))
    );
  }
  if (category) {
    items = items.filter((p) => p.categoryId === category);
  }
  if (carMake) {
    items = items.filter(
      (p) => p.carMake && p.carMake.toLowerCase() === carMake.toLowerCase()
    );
  }
  if (carModel) {
    items = items.filter(
      (p) => p.carModel && p.carModel.toLowerCase().includes(carModel.toLowerCase())
    );
  }
  if (minPrice) {
    items = items.filter((p) => p.price >= Number(minPrice));
  }
  if (maxPrice) {
    items = items.filter((p) => p.price <= Number(maxPrice));
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
    carMake: req.body.carMake || 'Универсальный',
    carModel: req.body.carModel || 'Все модели',
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

// 2.1 EXCEL IMPORT & EXPORT ENDPOINTS
app.post('/api/products/import-excel', (req, res) => {
  const db = readDB();
  const { items } = req.body; // Array of product objects from Excel file

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Передан пустой или некорректный список товаров' });
  }

  let updatedCount = 0;
  let addedCount = 0;

  items.forEach((item) => {
    const sku = item.sku || item.SKU || item['Артикул'];
    if (!sku) return;

    const price = Number(item.price || item.Price || item['Цена']) || 0;
    const stockQty = Number(item.stockQty || item.Stock || item['Остаток']) || 0;
    const title = item.title || item.Title || item['Наименование'] || `Товар ${sku}`;
    const brand = item.brand || item.Brand || item['Бренд'] || 'Autolider';

    const existingIndex = db.products.findIndex(
      (p) => p.sku && p.sku.toLowerCase() === String(sku).toLowerCase()
    );

    if (existingIndex !== -1) {
      db.products[existingIndex].price = price > 0 ? price : db.products[existingIndex].price;
      db.products[existingIndex].stockQty = stockQty;
      db.products[existingIndex].inStock = stockQty > 0;
      updatedCount++;
    } else {
      db.products.unshift({
        id: Date.now() + Math.floor(Math.random() * 1000),
        title,
        sku: String(sku),
        brand,
        price,
        oldPrice: 0,
        stockQty,
        inStock: stockQty > 0,
        categoryId: 'oils',
        categoryName: 'Автозапчасти',
        status: 'enabled',
        image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80'
      });
      addedCount++;
    }
  });

  writeDB(db);
  res.json({
    success: true,
    message: `Импорт завершен: обновлено ${updatedCount} товаров, добавлено ${addedCount} новых товаров.`
  });
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

// Orders & 1-Click Order
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
    paymentMethod: req.body.paymentMethod || 'Freedom Pay',
    itemsCount: req.body.items ? req.body.items.length : 1,
    items: req.body.items || []
  };

  db.orders.unshift(newOrder);
  writeDB(db);
  res.status(201).json(newOrder);
});

// 2.3.4 QUICK ONE-CLICK ORDER
app.post('/api/orders/one-click', (req, res) => {
  const db = readDB();
  const { customerName, customerPhone, productTitle, price } = req.body;

  const newOrder = {
    id: String(Math.floor(100000 + Math.random() * 900000)),
    date: new Date().toISOString().replace('T', ' ').slice(0, 16),
    customerName: customerName || 'Быстрый заказ в 1 клик',
    customerPhone: customerPhone || '+7 (777) 000-00-00',
    address: 'Уточнить у клиента (Заказ в 1 клик)',
    status: 'processing',
    statusText: 'В обработке (1 клик)',
    totalPrice: Number(price) || 0,
    paymentMethod: 'Быстрый заказ (1 клик)',
    itemsCount: 1,
    items: [
      {
        id: Date.now(),
        title: productTitle || 'Автозапчасть',
        price: Number(price) || 0,
        quantity: 1
      }
    ]
  };

  db.orders.unshift(newOrder);
  writeDB(db);
  res.status(201).json({
    success: true,
    message: 'Ваш заказ в 1 клик принят! Менеджер свяжется с вами в течение 5 минут.',
    order: newOrder
  });
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

// 2.6.1 WAREHOUSES ENDPOINTS
app.get('/api/warehouses', (req, res) => {
  const db = readDB();
  res.json(db.warehouses || []);
});

app.post('/api/warehouses', (req, res) => {
  const db = readDB();
  const newWh = {
    id: Date.now(),
    name: req.body.name || 'Новый склад',
    city: req.body.city || 'Астана',
    address: req.body.address || '',
    phone: req.body.phone || '+7 (777) 000-00-00',
    stockCount: 0,
    isMain: false
  };
  db.warehouses = db.warehouses || [];
  db.warehouses.push(newWh);
  writeDB(db);
  res.status(201).json(newWh);
});

// 2.6.2 ROLES & PERMISSIONS ENDPOINTS
app.get('/api/roles', (req, res) => {
  const db = readDB();
  res.json(db.roles || []);
});

app.post('/api/roles', (req, res) => {
  const db = readDB();
  const newRole = {
    id: Date.now(),
    title: req.body.title || 'Новая роль',
    code: req.body.code || `role_${Date.now()}`,
    description: req.body.description || '',
    usersCount: 1
  };
  db.roles = db.roles || [];
  db.roles.push(newRole);
  writeDB(db);
  res.status(201).json(newRole);
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
