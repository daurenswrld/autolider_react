import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isVercel = Boolean(process.env.VERCEL);
const DB_PATH = isVercel ? '/tmp/autolider.db' : path.join(__dirname, 'autolider.db');
const JSON_DB_PATH = isVercel && fs.existsSync('/tmp/db.json') ? '/tmp/db.json' : path.join(__dirname, 'db.json');

// Initialize SQLite safely
let db;
try {
  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');
} catch (e) {
  console.warn('SQLite disk init failed, using memory DB:', e.message);
  try {
    db = new Database(':memory:');
  } catch (err) {
    db = {
      prepare: () => ({ run: () => {}, get: () => ({ c: 0 }), all: () => [] }),
      exec: () => {},
      transaction: (fn) => fn
    };
  }
}

// Create SQLite tables if missing
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    title TEXT,
    slug TEXT,
    price REAL,
    oldPrice REAL,
    sku TEXT,
    categoryName TEXT,
    categoryId TEXT,
    brand TEXT,
    carMake TEXT,
    carModel TEXT,
    stockQty INTEGER DEFAULT 0,
    inStock INTEGER DEFAULT 1,
    status TEXT DEFAULT 'enabled',
    seller_id TEXT,
    data TEXT
  );

  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT,
    slug TEXT,
    count INTEGER DEFAULT 0,
    parentId TEXT,
    status TEXT DEFAULT 'enabled',
    data TEXT
  );

  CREATE TABLE IF NOT EXISTS brands (
    id TEXT PRIMARY KEY,
    name TEXT,
    logo TEXT,
    country TEXT,
    modelsCount INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active'
  );

  CREATE TABLE IF NOT EXISTS warehouses (
    id TEXT PRIMARY KEY,
    name TEXT,
    city TEXT,
    address TEXT,
    phone TEXT,
    stockCount INTEGER DEFAULT 0,
    isMain INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS sellers (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE,
    name TEXT,
    username TEXT UNIQUE,
    password_hash TEXT,
    email TEXT,
    phone TEXT,
    city TEXT,
    store_id TEXT,
    commission_rate REAL DEFAULT 10,
    status TEXT DEFAULT 'active',
    createdAt TEXT
  );

  CREATE TABLE IF NOT EXISTS stores (
    id TEXT PRIMARY KEY,
    city TEXT,
    name TEXT,
    address TEXT,
    phone TEXT,
    workingHours TEXT,
    status TEXT DEFAULT 'active'
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    customerName TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    totalPrice REAL,
    status TEXT,
    statusText TEXT,
    date TEXT,
    createdAt TEXT,
    data TEXT
  );

  CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    name TEXT,
    phone TEXT,
    email TEXT,
    city TEXT,
    ordersCount INTEGER DEFAULT 0,
    totalSpent REAL DEFAULT 0,
    data TEXT
  );

  CREATE TABLE IF NOT EXISTS admin_users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE,
    password_hash TEXT,
    name TEXT,
    role TEXT,
    roleKey TEXT,
    status TEXT DEFAULT 'active'
  );

  CREATE TABLE IF NOT EXISTS vin_requests (
    id TEXT PRIMARY KEY,
    name TEXT,
    phone TEXT,
    vin TEXT,
    partName TEXT,
    carMake TEXT,
    carModel TEXT,
    status TEXT DEFAULT 'new',
    createdAt TEXT
  );

  CREATE TABLE IF NOT EXISTS banners (
    id TEXT PRIMARY KEY,
    title TEXT,
    subtitle TEXT,
    imageUrl TEXT,
    buttonText TEXT,
    buttonLink TEXT,
    status TEXT DEFAULT 'active'
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

// Migrate existing db.json to SQLite seamlessly if empty
function migrateFromJSON() {
  const count = db.prepare('SELECT COUNT(*) as c FROM products').get().c;
  if (count > 0) return; // Already migrated

  if (!fs.existsSync(JSON_DB_PATH)) return;

  try {
    const raw = fs.readFileSync(JSON_DB_PATH, 'utf8');
    const json = JSON.parse(raw);

    const insertProd = db.prepare(`
      INSERT OR REPLACE INTO products (id, title, slug, price, oldPrice, sku, categoryName, categoryId, brand, carMake, carModel, stockQty, inStock, status, seller_id, data)
      VALUES (@id, @title, @slug, @price, @oldPrice, @sku, @categoryName, @categoryId, @brand, @carMake, @carModel, @stockQty, @inStock, @status, @seller_id, @data)
    `);

    const tx = db.transaction(() => {
      // Products
      (json.products || []).forEach((p) => {
        insertProd.run({
          id: String(p.id),
          title: p.title || '',
          slug: p.slug || '',
          price: Number(p.price) || 0,
          oldPrice: Number(p.oldPrice) || 0,
          sku: p.sku || '',
          categoryName: p.categoryName || '',
          categoryId: p.categoryId || '',
          brand: p.brand || '',
          carMake: p.carMake || '',
          carModel: p.carModel || '',
          stockQty: Number(p.stockQty) || 0,
          inStock: p.inStock ? 1 : 0,
          status: p.status || 'enabled',
          seller_id: p.seller_id ? String(p.seller_id) : null,
          data: JSON.stringify(p)
        });
      });

      // Categories
      const insertCat = db.prepare(`INSERT OR REPLACE INTO categories (id, name, slug, count, parentId, status, data) VALUES (?, ?, ?, ?, ?, ?, ?)`);
      (json.categories || []).forEach((c) => {
        insertCat.run(String(c.id), c.name, c.slug, c.count || 0, c.parentId || null, c.status || 'enabled', JSON.stringify(c));
      });

      // Brands
      const insertBrand = db.prepare(`INSERT OR REPLACE INTO brands (id, name, logo, country, modelsCount, status) VALUES (?, ?, ?, ?, ?, ?)`);
      (json.brands || []).forEach((b) => {
        insertBrand.run(String(b.id), b.name, b.logo || '', b.country || '', b.modelsCount || 0, b.status || 'active');
      });

      // Stores
      const insertStore = db.prepare(`INSERT OR REPLACE INTO stores (id, city, name, address, phone, workingHours, status) VALUES (?, ?, ?, ?, ?, ?, ?)`);
      (json.stores || []).forEach((s) => {
        insertStore.run(String(s.id), s.city, s.name, s.address, s.phone || '', s.workingHours || '', s.status || 'active');
      });

      // Sellers
      const insertSeller = db.prepare(`INSERT OR REPLACE INTO sellers (id, code, name, username, password_hash, email, phone, city, store_id, commission_rate, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
      (json.sellers || []).forEach((s) => {
        const hash = s.password ? bcrypt.hashSync(s.password, 10) : bcrypt.hashSync('supplier123', 10);
        insertSeller.run(String(s.id), s.code || `SUP-${Math.floor(1000 + Math.random()*9000)}`, s.name, s.username, hash, s.email || '', s.phone || '', s.city || '', s.store_id || null, s.commission_rate || 10, s.status || 'active', s.createdAt || new Date().toISOString());
      });

      // Orders
      const insertOrder = db.prepare(`INSERT OR REPLACE INTO orders (id, customerName, phone, email, address, totalPrice, status, statusText, date, createdAt, data) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
      (json.orders || []).forEach((o) => {
        insertOrder.run(String(o.id), o.customerName || '', o.phone || '', o.email || '', o.address || '', Number(o.totalPrice) || 0, o.status || 'pending', o.statusText || '', o.date || '', o.createdAt || new Date().toISOString(), JSON.stringify(o));
      });

      // Admin Users
      const insertAdmin = db.prepare(`INSERT OR REPLACE INTO admin_users (id, username, password_hash, name, role, roleKey, status) VALUES (?, ?, ?, ?, ?, ?, ?)`);
      const masterHash = bcrypt.hashSync('admin123', 10);
      insertAdmin.run('1', 'admin', masterHash, 'Главный Администратор', 'Главный Администратор', 'admin', 'active');
    });

    tx();
    console.log('Successfully migrated db.json to SQLite autolider.db!');
  } catch (err) {
    console.error('Migration from JSON error:', err);
  }
}

migrateFromJSON();

export default db;
