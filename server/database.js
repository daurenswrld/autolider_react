import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { neon } from '@neondatabase/serverless';

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
let sql = null;
let initialization = null;
const versions = new WeakMap();

function databaseClient() {
  if (!sql) {
    const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!url) throw new Error('DATABASE_URL is required for persistent data on Vercel');
    sql = neon(url);
  }
  return sql;
}

async function initializeRemoteDB() {
  if (!initialization) {
    initialization = (async () => {
      const query = databaseClient();
      await query`CREATE TABLE IF NOT EXISTS autolider_state (
        id integer PRIMARY KEY,
        data jsonb NOT NULL,
        version bigint NOT NULL DEFAULT 1,
        updated_at timestamptz NOT NULL DEFAULT now()
      )`;
      const seed = fs.existsSync(DB_FILE)
        ? fs.readFileSync(DB_FILE, 'utf8')
        : JSON.stringify(INITIAL_DATA);
      await query`INSERT INTO autolider_state (id, data)
        VALUES (1, ${seed}::jsonb)
        ON CONFLICT (id) DO NOTHING`;
    })().catch((error) => {
      initialization = null;
      throw error;
    });
  }
  await initialization;
}

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

export async function readDB() {
  if (process.env.VERCEL) {
    await initializeRemoteDB();
    const rows = await databaseClient()`SELECT data, version FROM autolider_state WHERE id = 1`;
    if (rows.length !== 1) throw new Error('Persistent catalog data is unavailable');
    const data = sanitizeDBData(rows[0].data);
    versions.set(data, Number(rows[0].version));
    return data;
  }

  try {
    if (inMemoryCache) {
      return sanitizeDBData(inMemoryCache);
    }

    const targetFile = DB_FILE;

    if (!fs.existsSync(targetFile)) {
      if (fs.existsSync(DB_FILE)) {
        const initialContent = fs.readFileSync(DB_FILE, 'utf8');
        const data = JSON.parse(initialContent);
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

export async function writeDB(data) {
  if (process.env.VERCEL) {
    await initializeRemoteDB();
    const expectedVersion = versions.get(data);
    if (expectedVersion === undefined) {
      throw new Error('Catalog update requires a fresh read before writing');
    }
    const rows = await databaseClient()`UPDATE autolider_state
      SET data = ${JSON.stringify(data)}::jsonb,
          version = version + 1,
          updated_at = now()
      WHERE id = 1 AND version = ${expectedVersion}
      RETURNING version`;
    if (rows.length !== 1) {
      const error = new Error('Данные изменились в другом запросе. Обновите страницу и повторите действие.');
      error.code = 'DB_CONFLICT';
      throw error;
    }
    versions.set(data, Number(rows[0].version));
    return;
  }

  try {
    inMemoryCache = data;
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing DB file:', err);
    throw err;
  }
}
