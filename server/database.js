import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'db.json');

const INITIAL_DATA = {
  products: [],
  categories: [],
  warehouses: [],
  roles: [],
  sellers: [],
  stores: [],
  orders: [],
  customers: [],
  banners: [],
  brands: [],
  foreignBrands: [],
  settings: {}
};

let inMemoryCache = null;

function sanitizeDBData(data) {
  if (!data) return INITIAL_DATA;
  const clone = { ...data };
  if (Array.isArray(clone.products)) {
    clone.products = clone.products.map((p) => ({
      ...p,
      specs: Array.isArray(p.specs) ? p.specs : typeof p.specs === 'string' ? p.specs : []
    }));
  }

  // Compute dynamic product count for each category
  if (Array.isArray(clone.categories) && Array.isArray(clone.products)) {
    clone.categories = clone.categories.map((cat) => {
      const count = clone.products.filter(
        (p) => p.status !== 'disabled' && (p.categoryId === cat.id || p.categoryName === cat.name)
      ).length;
      return { ...cat, count };
    });
  }

  if (!clone.vinRequests) clone.vinRequests = [];
  if (!clone.sellers) clone.sellers = [];
  if (!clone.stores || clone.stores.length === 0) clone.stores = INITIAL_DATA.stores;
  if (!clone.foreignBrands || clone.foreignBrands.length === 0) clone.foreignBrands = INITIAL_DATA.foreignBrands;

  return clone;
}

export function readDB() {
  try {
    if (inMemoryCache) {
      return sanitizeDBData(inMemoryCache);
    }

    const isVercel = Boolean(process.env.VERCEL);
    const targetFile = isVercel && fs.existsSync('/tmp/db.json') ? '/tmp/db.json' : DB_FILE;

    if (!fs.existsSync(targetFile)) {
      if (fs.existsSync(DB_FILE)) {
        const initialContent = fs.readFileSync(DB_FILE, 'utf8');
        const data = JSON.parse(initialContent);
        if (isVercel) {
          try { fs.writeFileSync('/tmp/db.json', initialContent, 'utf8'); } catch (e) {}
        }
        inMemoryCache = data;
        return sanitizeDBData(data);
      }
      inMemoryCache = INITIAL_DATA;
      return sanitizeDBData(INITIAL_DATA);
    }
    const content = fs.readFileSync(targetFile, 'utf8');
    const data = JSON.parse(content);
    inMemoryCache = data;
    return sanitizeDBData(data);
  } catch (err) {
    console.error('Error reading DB file, using initial data:', err);
    return sanitizeDBData(inMemoryCache || INITIAL_DATA);
  }
}

export function writeDB(data) {
  try {
    inMemoryCache = data;
    const isVercel = Boolean(process.env.VERCEL);
    const targetFile = isVercel ? '/tmp/db.json' : DB_FILE;
    fs.writeFileSync(targetFile, JSON.stringify(data, null, 2), 'utf8');
    if (isVercel) {
      try { fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8'); } catch (e) {}
    }
  } catch (err) {
    console.error('Error writing DB file:', err);
  }
}
