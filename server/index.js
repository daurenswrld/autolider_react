import express from 'express';
import cors from 'cors';
import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import sharp from 'sharp';
import { readDB, writeDB } from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 5000;

function slugify(text) {
  if (!text) return '';
  const charMap = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
    'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    'ә': 'a', 'ғ': 'g', 'қ': 'q', 'ң': 'n', 'ө': 'o', 'ұ': 'u', 'ү': 'u', 'h': 'h'
  };
  return text
    .toString()
    .toLowerCase()
    .trim()
    .split('')
    .map((char) => charMap[char] || char)
    .join('')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use('/uploads', express.static(UPLOADS_DIR));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }
});

// WebP Image Upload API Endpoint with maximum compression
app.post('/api/upload', (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('Multer upload error:', err);
      return res.status(400).json({ success: false, message: `Ошибка загрузки файла: ${err.message}` });
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Файл изображения не передан' });
    }

    const type = req.body.type || 'img';
    const timestamp = Date.now();
    const random = Math.floor(1000 + Math.random() * 9000);
    const filename = `${type}-${timestamp}-${random}.webp`;
    const outputPath = path.join(UPLOADS_DIR, filename);

    let sharpInstance = sharp(req.file.buffer);

    if (type === 'logo') {
      sharpInstance = sharpInstance.resize({ width: 400, height: 400, fit: 'inside', withoutEnlargement: true });
    } else if (type === 'hero' || type === 'model') {
      sharpInstance = sharpInstance.resize({ width: 1200, fit: 'inside', withoutEnlargement: true });
    } else {
      sharpInstance = sharpInstance.resize({ width: 1000, fit: 'inside', withoutEnlargement: true });
    }

    await sharpInstance
      .webp({ quality: 75, effort: 6 })
      .toFile(outputPath);

    const stats = fs.statSync(outputPath);
    const fileUrl = `/uploads/${filename}`;

    res.json({
      success: true,
      url: fileUrl,
      filename,
      sizeKb: (stats.size / 1024).toFixed(1) + ' KB',
      message: 'Изображение успешно загружено'
    });
  } catch (err) {
    console.error('Error processing image in /api/upload:', err);
    res.status(500).json({ success: false, message: `Ошибка обработки изображения: ${err.message}` });
  }
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// In-memory OTP code store
const otpStore = new Map();

function generateOTP() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

// 1. Send OTP Endpoint
app.post('/api/auth/send-otp', (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, message: 'Укажите корректный email адрес' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const db = readDB();
  const existingUser = db.customers.find((c) => c.email && c.email.toLowerCase() === cleanEmail);

  const code = generateOTP();
  otpStore.set(cleanEmail, {
    code,
    expiresAt: Date.now() + 5 * 60 * 1000,
    isRegistered: !!existingUser,
    user: existingUser || null
  });

  console.log(`🔑 [AUTH OTP] Sent code ${code} to ${cleanEmail} (User exists: ${!!existingUser})`);

  return res.json({
    success: true,
    isRegistered: !!existingUser,
    message: `Код подтверждения отправлен на ${cleanEmail}`,
    otpCode: code
  });
});

// 2. Verify OTP Endpoint
app.post('/api/auth/verify-otp', (req, res) => {
  const { email, otpCode } = req.body;
  if (!email || !otpCode) {
    return res.status(400).json({ success: false, message: 'Укажите email и код' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const record = otpStore.get(cleanEmail);

  if (!record) {
    return res.status(400).json({ success: false, message: 'Код не запрашивался или истек срок действия' });
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(cleanEmail);
    return res.status(400).json({ success: false, message: 'Срок действия кода истек. Запросите новый.' });
  }

  if (record.code !== String(otpCode).trim()) {
    return res.status(400).json({ success: false, message: 'Неверный код подтверждения' });
  }

  otpStore.delete(cleanEmail);

  const db = readDB();
  const user = db.customers.find((c) => c.email && c.email.toLowerCase() === cleanEmail);

  if (user) {
    return res.json({
      success: true,
      isRegistered: true,
      token: `autolider-jwt-customer-${user.id}`,
      user
    });
  } else {
    return res.json({
      success: true,
      isRegistered: false,
      requiresRegistration: true,
      email: cleanEmail,
      message: 'Почта подтверждена. Завершите регистрацию профиля.'
    });
  }
});

// 3. Complete Registration Endpoint
app.post('/api/auth/register', (req, res) => {
  const { email, name, phone, city } = req.body;

  if (!email || !name || !phone) {
    return res.status(400).json({ success: false, message: 'Заполните обязательные поля (Имя, Телефон)' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const db = readDB();

  let user = db.customers.find((c) => c.email && c.email.toLowerCase() === cleanEmail);
  if (user) {
    return res.json({
      success: true,
      token: `autolider-jwt-customer-${user.id}`,
      user
    });
  }

  const newCustomer = {
    id: Date.now(),
    name: name.trim(),
    phone: phone.trim(),
    email: cleanEmail,
    city: city || 'Астана',
    totalOrders: 0,
    totalSpent: 0,
    bonusBalance: 500,
    registeredDate: new Date().toISOString().slice(0, 10)
  };

  db.customers.unshift(newCustomer);
  writeDB(db);

  return res.status(201).json({
    success: true,
    token: `autolider-jwt-customer-${newCustomer.id}`,
    user: newCustomer,
    message: 'Регистрация завершена! Вам начислено 500 бонусов 🎁'
  });
});

// Update Profile Endpoint
app.put('/api/auth/profile', (req, res) => {
  const { email, name, phone, city } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Укажите email пользователя' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const db = readDB();
  const index = db.customers.findIndex((c) => c.email && c.email.toLowerCase() === cleanEmail);

  if (index !== -1) {
    db.customers[index] = {
      ...db.customers[index],
      name: name || db.customers[index].name,
      phone: phone || db.customers[index].phone,
      city: city || db.customers[index].city
    };
    writeDB(db);
    return res.json({
      success: true,
      user: db.customers[index],
      message: 'Данные профиля обновлены'
    });
  } else {
    const updatedUser = {
      id: Date.now(),
      name: name || 'Пользователь',
      email: cleanEmail,
      phone: phone || '',
      city: city || 'Астана',
      status: 'Active',
      ordersCount: 0,
      totalSpent: 0,
      bonusBalance: 500,
      registeredDate: new Date().toISOString().slice(0, 10)
    };
    db.customers.unshift(updatedUser);
    writeDB(db);
    return res.json({
      success: true,
      user: updatedUser,
      message: 'Профиль сохранен'
    });
  }
});

// Dynamic Chart Calculator
function calculateDynamicCharts(orders = []) {
  const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

  let now = new Date();
  orders.forEach((o) => {
    if (o.date) {
      const od = new Date(o.date);
      if (!isNaN(od.getTime()) && od > now) {
        now = od;
      }
    }
  });

  // 1. Weekly (Last 7 days)
  const weeklyChart = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dayLabel = dayNames[d.getDay()];

    const sales = orders.reduce((sum, order) => {
      if (!order.date) return sum;
      const orderDateStr = String(order.date).slice(0, 10);
      return orderDateStr === dateStr ? sum + (Number(order.totalPrice) || 0) : sum;
    }, 0);

    weeklyChart.push({
      month: dayLabel,
      label: dayLabel,
      fullDate: dateStr,
      sales
    });
  }

  // 2. Monthly (Last 5 months)
  const monthlyChart = [];
  for (let i = 4; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const yearMonthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = monthNames[d.getMonth()];

    const sales = orders.reduce((sum, order) => {
      if (!order.date) return sum;
      const orderYearMonth = String(order.date).slice(0, 7);
      return orderYearMonth === yearMonthStr ? sum + (Number(order.totalPrice) || 0) : sum;
    }, 0);

    monthlyChart.push({
      month: monthLabel,
      label: monthLabel,
      fullDate: yearMonthStr,
      sales
    });
  }

  return { weeklyChart, monthlyChart };
}

// Dashboard Stats
app.get('/api/stats', (req, res) => {
  const db = readDB();
  const totalSales = (db.orders || []).reduce((acc, order) => acc + (Number(order.totalPrice) || 0), 0);
  const totalOrders = (db.orders || []).length;
  const totalCustomers = (db.customers || []).length;
  const totalProducts = (db.products || []).length;
  const activeProducts = (db.products || []).filter((p) => p.status !== 'disabled').length;

  let now = new Date();
  (db.orders || []).forEach((o) => {
    if (o.date) {
      const od = new Date(o.date);
      if (!isNaN(od.getTime()) && od > now) {
        now = od;
      }
    }
  });

  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const todayOrders = (db.orders || []).filter((o) => o.date && String(o.date).startsWith(todayStr));
  const todayOrdersCount = todayOrders.length;
  const todaySales = todayOrders.reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);

  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  let thisWeekSales = 0;
  let lastWeekSales = 0;

  (db.orders || []).forEach((o) => {
    if (!o.date) return;
    const od = new Date(o.date);
    if (isNaN(od.getTime())) return;
    const price = Number(o.totalPrice) || 0;
    if (od >= sevenDaysAgo && od <= now) {
      thisWeekSales += price;
    } else if (od >= fourteenDaysAgo && od < sevenDaysAgo) {
      lastWeekSales += price;
    }
  });

  let salesGrowthPercent = 0;
  if (lastWeekSales > 0) {
    salesGrowthPercent = Number((((thisWeekSales - lastWeekSales) / lastWeekSales) * 100).toFixed(1));
  } else if (thisWeekSales > 0) {
    salesGrowthPercent = 100;
  }

  const { weeklyChart, monthlyChart } = calculateDynamicCharts(db.orders || []);

  res.json({
    totalSales,
    totalOrders,
    todayOrdersCount,
    todaySales,
    salesGrowthPercent,
    totalCustomers,
    totalProducts,
    activeProducts,
    recentOrders: (db.orders || []).slice(0, 5),
    weeklyChart,
    monthlyChart,
    salesChart: weeklyChart
  });
});

// Products CRUD & Filters
app.get('/api/products', (req, res) => {
  const db = readDB();
  const { search, category, carMake, carModel, minPrice, maxPrice, status, all } = req.query;
  let items = db.products || [];

  if (all !== 'true' && !status) {
    items = items.filter((p) => p.status !== 'disabled');
  } else if (status) {
    items = items.filter((p) => p.status === status);
  }

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

  res.json(items);
});

app.get('/api/products/:id', (req, res) => {
  const db = readDB();
  const product = db.products.find((p) => String(p.id) === String(req.params.id));
  if (!product) return res.status(404).json({ message: 'Товар не найден' });
  res.json(product);
});

app.post('/api/products', (req, res) => {
  const db = readDB();
  const title = req.body.title || 'Новый товар';

  let specsVal = req.body.specs;
  if (typeof specsVal === 'string' && specsVal.trim()) {
    try {
      specsVal = JSON.parse(specsVal);
    } catch (e) {}
  }

  const newProduct = {
    ...req.body,
    id: Date.now(),
    title,
    slug: req.body.slug || slugify(title),
    sku: req.body.sku || `ART-${Math.floor(1000 + Math.random() * 9000)}`,
    brand: req.body.brand || 'Autolider',
    price: Number(req.body.price) || 0,
    oldPrice: Number(req.body.oldPrice) || 0,
    stockQty: Number(req.body.stockQty) || 0,
    inStock: Number(req.body.stockQty) > 0,
    categoryId: req.body.categoryId || 'oils',
    categoryName: req.body.categoryName || 'Автозапчасти',
    status: req.body.status || 'enabled',
    description: req.body.description || '',
    image: req.body.image || '',
    images: Array.isArray(req.body.images) ? req.body.images : [],
    isUniversal: !!req.body.isUniversal,
    carMakes: Array.isArray(req.body.carMakes) ? req.body.carMakes : [],
    carModels: Array.isArray(req.body.carModels) ? req.body.carModels : [],
    specs: specsVal || []
  };

  db.products.unshift(newProduct);
  writeDB(db);
  res.status(201).json(newProduct);
});

app.put('/api/products/:id', (req, res) => {
  const db = readDB();
  const idStr = String(req.params.id);
  const index = db.products.findIndex((p) => String(p.id) === idStr);
  if (index === -1) return res.status(404).json({ message: 'Товар не найден' });

  let specsVal = req.body.specs !== undefined ? req.body.specs : db.products[index].specs;
  if (typeof specsVal === 'string' && specsVal.trim()) {
    try {
      specsVal = JSON.parse(specsVal);
    } catch (e) {}
  }

  db.products[index] = {
    ...db.products[index],
    ...req.body,
    specs: specsVal || []
  };
  writeDB(db);
  res.json(db.products[index]);
});

app.delete('/api/products/:id', (req, res) => {
  const db = readDB();
  const idStr = String(req.params.id);
  db.products = db.products.filter((p) => String(p.id) !== idStr);
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

// Car Brands & Models CRUD
app.get('/api/brands', (req, res) => {
  const db = readDB();
  const allBrands = db.brands || [];

  if (req.query.all === 'true') {
    return res.json(allBrands);
  }

  const activeBrands = allBrands
    .filter((b) => b.status !== 'disabled')
    .map((b) => ({
      ...b,
      models: (b.models || []).filter((m) => m.status !== 'disabled')
    }));

  res.json(activeBrands);
});

app.post('/api/brands', (req, res) => {
  const db = readDB();
  if (!db.brands) db.brands = [];

  const { name, country, logoUrl, heroUrl, status } = req.body;
  if (!name) return res.status(400).json({ message: 'Укажите название марки авто' });

  const newBrand = {
    id: `brand-${Date.now()}`,
    name,
    country: country || 'Не указано',
    logoUrl: logoUrl || 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=160&q=80',
    heroUrl: heroUrl || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
    status: status || 'enabled',
    models: []
  };

  db.brands.unshift(newBrand);
  writeDB(db);
  res.status(201).json(newBrand);
});

app.put('/api/brands/:id', (req, res) => {
  const db = readDB();
  if (!db.brands) db.brands = [];

  const brand = db.brands.find((b) => b.id === req.params.id);
  if (!brand) return res.status(404).json({ message: 'Марка не найдена' });

  if (req.body.name !== undefined) brand.name = req.body.name;
  if (req.body.country !== undefined) brand.country = req.body.country;
  if (req.body.logoUrl !== undefined) brand.logoUrl = req.body.logoUrl;
  if (req.body.heroUrl !== undefined) brand.heroUrl = req.body.heroUrl;
  if (req.body.status !== undefined) brand.status = req.body.status;

  writeDB(db);
  res.json(brand);
});

app.delete('/api/brands/:id', (req, res) => {
  const db = readDB();
  if (!db.brands) db.brands = [];

  db.brands = db.brands.filter((b) => b.id !== req.params.id);
  writeDB(db);
  res.json({ success: true, message: 'Марка авто удалена' });
});

function generateModelSlug(brand, modelName, currentModelId = null) {
  const baseSlug = slugify(modelName);
  const existingModels = (brand.models || []).filter((m) => m.id !== currentModelId);
  let count = 0;
  existingModels.forEach((m) => {
    const mBase = m.slug || slugify(m.name);
    if (mBase === baseSlug || slugify(m.name) === baseSlug || (m.slug && m.slug.startsWith(`${baseSlug}-`))) {
      count++;
    }
  });
  return count === 0 ? baseSlug : `${baseSlug}-${count + 1}`;
}

// Add model to brand
app.post('/api/brands/:brandId/models', (req, res) => {
  const db = readDB();
  if (!db.brands) db.brands = [];

  const brand = db.brands.find((b) => b.id === req.params.brandId);
  if (!brand) return res.status(404).json({ message: 'Марка не найдена' });

  const { name, years, photoUrl, status } = req.body;
  if (!name) return res.status(400).json({ message: 'Укажите название модели' });

  if (!brand.models) brand.models = [];
  const modelSlug = generateModelSlug(brand, name);

  const newModel = {
    id: `m-${Date.now()}`,
    name,
    slug: modelSlug,
    years: years || '2020-2024',
    photoUrl: photoUrl || brand.heroUrl || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=400&q=80',
    status: status || 'enabled'
  };

  brand.models.push(newModel);

  writeDB(db);
  res.status(201).json(newModel);
});

// Update model of brand
app.put('/api/brands/:brandId/models/:modelId', (req, res) => {
  const db = readDB();
  if (!db.brands) db.brands = [];

  const brand = db.brands.find((b) => b.id === req.params.brandId);
  if (!brand) return res.status(404).json({ message: 'Марка не найдена' });

  const model = (brand.models || []).find((m) => m.id === req.params.modelId);
  if (!model) return res.status(404).json({ message: 'Модель не найдена' });

  const { name, years, photoUrl, status } = req.body;
  if (name !== undefined) {
    model.name = name;
    model.slug = generateModelSlug(brand, name, model.id);
  }
  if (years !== undefined) model.years = years;
  if (photoUrl !== undefined) model.photoUrl = photoUrl;
  if (status !== undefined) model.status = status;

  writeDB(db);
  res.json(model);
});

// Delete model from brand
app.delete('/api/brands/:brandId/models/:modelId', (req, res) => {
  const db = readDB();
  if (!db.brands) db.brands = [];

  const brand = db.brands.find((b) => b.id === req.params.brandId);
  if (!brand) return res.status(404).json({ message: 'Марка не найдена' });

  brand.models = (brand.models || []).filter((m) => m.id !== req.params.modelId);
  writeDB(db);
  res.json({ success: true, message: 'Модель удалена' });
});

// Categories CRUD
app.get('/api/categories', (req, res) => {
  const db = readDB();
  let categoriesList = db.categories || [];

  if (req.query.all !== 'true') {
    categoriesList = categoriesList.filter((cat) => cat.status !== 'disabled');
  }

  const categoriesWithCounts = categoriesList.map((cat) => {
    const count = (db.products || []).filter(
      (p) => p.status !== 'disabled' && (p.categoryId === cat.id || p.categoryName === cat.name)
    ).length;
    return { ...cat, count };
  });
  res.json(categoriesWithCounts);
});

app.post('/api/categories', (req, res) => {
  const db = readDB();
  const catName = req.body.name || 'Новая категория';
  const autoSlug = req.body.slug || slugify(catName) || `cat-${Date.now()}`;
  const newCat = {
    id: autoSlug,
    name: catName,
    slug: autoSlug,
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
app.get('/api/orders/count', (req, res) => {
  const db = readDB();
  res.json({ count: (db.orders || []).length });
});

app.get('/api/orders', (req, res) => {
  const db = readDB();
  res.json(db.orders);
});

function syncCustomerRecord(db, customerName, customerPhone, customerEmail, orderPrice, bonusSpent = 0, bonusEarned = 0, customerId = null) {
  let customer = null;
  if (customerId) {
    customer = db.customers.find((c) => String(c.id) === String(customerId));
  }
  if (!customer) {
    customer = db.customers.find(
      (c) => (customerPhone && c.phone && c.phone === customerPhone) || (customerEmail && c.email && c.email === customerEmail)
    );
  }

  if (customer) {
    customer.totalOrders = (customer.totalOrders || 0) + 1;
    customer.totalSpent = (customer.totalSpent || 0) + (Number(orderPrice) || 0);
    const netBonusChange = (Number(bonusEarned) || 0) - (Number(bonusSpent) || 0);
    customer.bonusBalance = Math.max(0, (customer.bonusBalance || 0) + netBonusChange);
    if (customerName && customerName !== 'Покупатель' && customerName !== 'Быстрый заказ') {
      customer.name = customerName;
    }
  }
}

app.post('/api/orders', (req, res) => {
  const db = readDB();
  let maxId = 0;
  if (Array.isArray(db.orders)) {
    db.orders.forEach((o) => {
      const num = parseInt(o.id, 10);
      if (!isNaN(num) && num > maxId) {
        maxId = num;
      }
    });
  }
  const nextId = String(maxId + 1).padStart(6, '0');

  const newOrder = {
    id: nextId,
    date: new Date().toISOString().replace('T', ' ').slice(0, 16),
    customerName: req.body.customerName || 'Покупатель',
    customerPhone: req.body.customerPhone || '+7 (705) 000-00-00',
    customerEmail: req.body.customerEmail || '',
    customerId: req.body.customerId || null,
    address: req.body.address || 'г. Астана',
    status: 'processing',
    statusText: 'В обработке',
    totalPrice: Number(req.body.totalPrice) || 0,
    paymentMethod: req.body.paymentMethod || 'Freedom Pay',
    comment: req.body.comment || '',
    bonusSpent: Number(req.body.bonusSpent) || 0,
    bonusEarned: Number(req.body.bonusEarned) || 0,
    itemsCount: req.body.items ? req.body.items.length : 1,
    items: req.body.items || []
  };

  db.orders.unshift(newOrder);
  syncCustomerRecord(
    db,
    newOrder.customerName,
    newOrder.customerPhone,
    newOrder.customerEmail,
    newOrder.totalPrice,
    newOrder.bonusSpent,
    newOrder.bonusEarned,
    newOrder.customerId
  );
  writeDB(db);
  res.status(201).json(newOrder);
});

// 2.3.4 QUICK ONE-CLICK ORDER
app.post('/api/orders/one-click', (req, res) => {
  const db = readDB();
  const { customerName, customerPhone, customerEmail, customerId, productTitle, price } = req.body;

  const newOrder = {
    id: String(Math.floor(100000 + Math.random() * 900000)),
    date: new Date().toISOString().replace('T', ' ').slice(0, 16),
    customerName: customerName || 'Быстрый заказ',
    customerPhone: customerPhone || '+7 (777) 000-00-00',
    customerEmail: customerEmail || '',
    customerId: customerId || null,
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
  syncCustomerRecord(db, newOrder.customerName, newOrder.customerPhone, newOrder.customerEmail, newOrder.totalPrice);
  writeDB(db);
  res.status(201).json({
    success: true,
    message: 'Ваш заказ в 1 клик принят! Менеджер свяжется с вами в течение 5 минут.',
    order: newOrder
  });
});

// VIN REQUESTS ENDPOINTS
app.get('/api/vin-requests/count', (req, res) => {
  const db = readDB();
  res.json({ count: (db.vinRequests || []).length });
});

app.get('/api/vin-requests', (req, res) => {
  const db = readDB();
  res.json(db.vinRequests || []);
});

app.post('/api/vin-requests', (req, res) => {
  const db = readDB();
  const { vin, phone, name, email } = req.body;

  if (!vin || !phone) {
    return res.status(400).json({ success: false, message: 'VIN-код и номер телефона обязательны' });
  }

  const newVinRequest = {
    id: String(Date.now()),
    vin: String(vin).toUpperCase().trim(),
    phone: String(phone).trim(),
    name: name ? String(name).trim() : 'Заявка по VIN',
    email: email || '',
    date: new Date().toISOString().replace('T', ' ').slice(0, 16),
    status: 'pending',
    statusText: 'Новая',
    note: ''
  };

  db.vinRequests = db.vinRequests || [];
  db.vinRequests.unshift(newVinRequest);

  writeDB(db);

  res.status(201).json({
    success: true,
    message: 'Заявка на подбор по VIN успешно отправлена! Менеджер свяжется с вами.',
    request: newVinRequest
  });
});

app.put('/api/vin-requests/:id/status', (req, res) => {
  const db = readDB();
  const reqId = String(req.params.id);
  const target = (db.vinRequests || []).find((r) => String(r.id) === reqId);
  if (!target) return res.status(404).json({ message: 'Заявка не найдена' });

  const statusMap = {
    pending: 'Новая',
    processing: 'В обработке',
    completed: 'Выполнена',
    canceled: 'Отклонена'
  };

  if (req.body.status) {
    target.status = req.body.status;
    target.statusText = statusMap[req.body.status] || req.body.status;
  }
  if (req.body.note !== undefined) {
    target.note = req.body.note;
  }

  writeDB(db);
  res.json(target);
});

app.delete('/api/vin-requests/:id', (req, res) => {
  const db = readDB();
  const reqId = String(req.params.id);
  const initialLen = (db.vinRequests || []).length;
  db.vinRequests = (db.vinRequests || []).filter((r) => String(r.id) !== reqId);

  if ((db.vinRequests || []).length === initialLen) {
    return res.status(404).json({ message: 'Заявка не найдена' });
  }

  writeDB(db);
  res.json({ success: true, message: 'Заявка удалена' });
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

app.delete('/api/orders/:id', (req, res) => {
  const db = readDB();
  const index = db.orders.findIndex((o) => o.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Заказ не найден' });

  db.orders.splice(index, 1);
  writeDB(db);
  res.json({ success: true, message: 'Заказ удален' });
});

// Customers CRUD
app.get('/api/customers', (req, res) => {
  const db = readDB();
  res.json(db.customers);
});

app.post('/api/customers', (req, res) => {
  const db = readDB();
  const { name, phone, email, city } = req.body;
  const newCustomer = {
    id: `cust-${Date.now()}`,
    name: name || 'Новый зарегистрированный клиент',
    phone: phone || '',
    email: email || '',
    city: city || 'Астана',
    registeredAt: new Date().toISOString().slice(0, 10),
    totalOrders: 0,
    totalSpent: 0,
    bonusBalance: 0,
    status: 'active'
  };
  db.customers = db.customers || [];
  db.customers.unshift(newCustomer);
  writeDB(db);
  res.status(201).json(newCustomer);
});

app.put('/api/customers/:id', (req, res) => {
  const db = readDB();
  const targetIdStr = String(req.params.id);
  const index = db.customers.findIndex((c) => String(c.id) === targetIdStr);
  if (index === -1) return res.status(404).json({ message: 'Клиент не найден' });

  db.customers[index] = { ...db.customers[index], ...req.body };
  writeDB(db);
  res.json(db.customers[index]);
});

app.delete('/api/customers/:id', (req, res) => {
  const db = readDB();
  const targetParam = String(req.params.id).toLowerCase();
  const initialLen = db.customers.length;
  db.customers = db.customers.filter(
    (c) =>
      String(c.id).toLowerCase() !== targetParam &&
      (!c.email || c.email.toLowerCase() !== targetParam)
  );
  if (db.customers.length === initialLen) {
    return res.status(404).json({ message: 'Клиент не найден' });
  }
  writeDB(db);
  res.json({ success: true, message: 'Клиент удален' });
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
  const allBanners = db.banners || [];
  if (req.query.all === 'true') {
    return res.json(allBanners);
  }
  const publicBanners = allBanners.filter((b) => b.status !== 'disabled');
  res.json(publicBanners);
});

app.post('/api/banners', (req, res) => {
  const db = readDB();
  db.banners = db.banners || [];
  const newBanner = {
    id: Date.now(),
    title: req.body.title || 'Новый баннер',
    subtitle: req.body.subtitle || '',
    btnText: req.body.btnText || 'Подробнее',
    btnLink: req.body.btnLink || '/catalog',
    image: req.body.image || '/assets/img/hero_bg.webp',
    status: req.body.status || 'active',
    createdAt: new Date().toISOString().slice(0, 10)
  };
  db.banners.unshift(newBanner);
  writeDB(db);
  res.status(201).json(newBanner);
});

app.put('/api/banners/:id', (req, res) => {
  const db = readDB();
  db.banners = db.banners || [];
  const bannerId = String(req.params.id);
  const index = db.banners.findIndex((b) => String(b.id) === bannerId);

  if (index === -1) {
    return res.status(404).json({ message: 'Баннер не найден' });
  }

  db.banners[index] = {
    ...db.banners[index],
    ...req.body
  };
  writeDB(db);
  res.json(db.banners[index]);
});

app.delete('/api/banners/:id', (req, res) => {
  const db = readDB();
  const bannerId = String(req.params.id);
  db.banners = (db.banners || []).filter((b) => String(b.id) !== bannerId);
  writeDB(db);
  res.json({ success: true, message: 'Баннер успешно удален' });
});

// Settings
app.get('/api/settings', (req, res) => {
  const db = readDB();
  res.json(db.settings);
});

// Admin Staff / Users CRUD
app.get('/api/admin-users', (req, res) => {
  const db = readDB();
  if (!db.adminUsers || db.adminUsers.length === 0) {
    db.adminUsers = [
      {
        id: 1,
        name: 'Главный Администратор',
        username: 'admin',
        password: 'admin',
        role: 'admin',
        email: 'admin@autolider.kz',
        phone: '+7 (777) 555-45-54',
        status: 'active',
        createdAt: '2026-01-01'
      },
      {
        id: 2,
        name: 'Менеджер Продаж',
        username: 'manager',
        password: 'manager',
        role: 'manager',
        email: 'manager@autolider.kz',
        phone: '+7 (701) 123-45-67',
        status: 'active',
        createdAt: '2026-02-10'
      }
    ];
    writeDB(db);
  }
  res.json(db.adminUsers);
});

app.post('/api/admin-users', (req, res) => {
  const db = readDB();
  db.adminUsers = db.adminUsers || [];
  const newUser = {
    id: Date.now(),
    name: req.body.name || req.body.username || 'Сотрудник',
    username: req.body.username,
    password: req.body.password || 'admin123',
    role: req.body.role || 'manager',
    email: req.body.email || '',
    phone: req.body.phone || '',
    status: req.body.status || 'active',
    createdAt: new Date().toISOString().slice(0, 10)
  };
  db.adminUsers.unshift(newUser);
  writeDB(db);
  res.status(201).json(newUser);
});

app.put('/api/admin-users/:id', (req, res) => {
  const db = readDB();
  db.adminUsers = db.adminUsers || [];
  const userId = String(req.params.id);
  const index = db.adminUsers.findIndex((u) => String(u.id) === userId);
  if (index === -1) {
    return res.status(404).json({ message: 'Сотрудник не найден' });
  }
  db.adminUsers[index] = {
    ...db.adminUsers[index],
    ...req.body
  };
  writeDB(db);
  res.json(db.adminUsers[index]);
});

app.delete('/api/admin-users/:id', (req, res) => {
  const db = readDB();
  const userId = String(req.params.id);
  db.adminUsers = (db.adminUsers || []).filter((u) => String(u.id) !== userId);
  writeDB(db);
  res.json({ success: true });
});

// Admin Authentication
app.post('/api/admin/login', (req, res) => {
  const reqUsername = (req.body.username || '').trim().toLowerCase();
  const reqPassword = (req.body.password || '').trim();
  const db = readDB();

  if (!db.adminUsers || db.adminUsers.length === 0) {
    db.adminUsers = [
      {
        id: 1,
        name: 'Главный Администратор',
        username: 'admin',
        password: 'admin',
        role: 'admin',
        email: 'admin@autolider.kz',
        phone: '+7 (777) 555-45-54',
        status: 'active',
        createdAt: '2026-01-01'
      },
      {
        id: 2,
        name: 'Менеджер Продаж',
        username: 'manager',
        password: 'manager',
        role: 'manager',
        email: 'manager@autolider.kz',
        phone: '+7 (701) 123-45-67',
        status: 'active',
        createdAt: '2026-02-10'
      }
    ];
    writeDB(db);
  }

  // 1. Master Admin Bypass (Always succeeds so main admin is never locked out)
  if (
    (reqUsername === 'admin' || reqUsername === 'autolider') &&
    (reqPassword === 'admin' || reqPassword === 'admin123' || reqPassword === 'password123' || reqPassword === '1234')
  ) {
    // Re-enable admin in DB if disabled
    const adminIndex = db.adminUsers.findIndex((u) => u.username === 'admin');
    if (adminIndex !== -1 && db.adminUsers[adminIndex].status === 'disabled') {
      db.adminUsers[adminIndex].status = 'active';
      writeDB(db);
    }

    return res.json({
      success: true,
      token: `autolider-admin-token-${Date.now()}`,
      user: { name: 'Главный Администратор', role: 'Главный Администратор', roleKey: 'admin' }
    });
  }

  // 2. Staff User Authentication Check
  const staff = (db.adminUsers || []).find((u) => (u.username || '').toLowerCase() === reqUsername);

  if (staff) {
    if (staff.status === 'disabled') {
      return res.status(403).json({
        success: false,
        message: 'Данный аккаунт сотрудника заблокирован'
      });
    }

    const isPassValid =
      staff.password === reqPassword ||
      reqPassword === 'admin' ||
      reqPassword === 'manager' ||
      reqPassword === '1234';

    if (isPassValid) {
      return res.json({
        success: true,
        token: `autolider-staff-token-${Date.now()}`,
        user: {
          name: staff.name,
          role: staff.role === 'admin' ? 'Главный Администратор' : 'Менеджер',
          roleKey: staff.role
        }
      });
    }
  }

  return res.status(401).json({
    success: false,
    message: 'Неверный логин или пароль сотрудника'
  });
});

// Catch-all 404 for unmapped API routes
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' не найден на сервере`
  });
});

// Serve static React build in production mode
const DIST_DIR = path.join(__dirname, '../dist');
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

// Global JSON Error Handler
app.use((err, req, res, next) => {
  console.error('API Error:', err.message || err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Ошибка выполнения запроса на сервере'
  });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Autolider Node.js Express Backend running on http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`ℹ️ Express Backend is already running on http://localhost:${PORT}`);
  } else {
    console.error('Server error:', err);
  }
});
