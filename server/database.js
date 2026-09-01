import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'db.json');

const INITIAL_DATA = {
  products: [],
  categories: [
    { id: 'tires', name: 'Шины и диски', slug: 'tires', count: 0, parentId: null, status: 'enabled' },
    { id: 'oils', name: 'Масла и автохимия', slug: 'oils', count: 0, parentId: null, status: 'enabled' },
    { id: 'brakes', name: 'Тормозная система', slug: 'brakes', count: 0, parentId: null, status: 'enabled' },
    { id: 'batteries', name: 'Аккумуляторы', slug: 'batteries', count: 0, parentId: null, status: 'enabled' },
    { id: 'filters', name: 'Фильтры', slug: 'filters', count: 0, parentId: null, status: 'enabled' },
    { id: 'ignition', name: 'Зажигание и электрика', slug: 'ignition', count: 0, parentId: null, status: 'enabled' },
    { id: 'suspension', name: 'Подвеска и рулевое', slug: 'suspension', count: 0, parentId: null, status: 'enabled' }
  ],
  warehouses: [
    {
      id: 1,
      name: 'Центральный автосклад №1 (Астана)',
      city: 'Астана',
      address: 'ул. Автозаводская, 12',
      phone: '+7 (777) 555-45-54',
      stockCount: 0,
      isMain: true
    }
  ],
  roles: [
    {
      id: 1,
      title: 'Супер-администратор',
      code: 'super_admin',
      description: 'Полный доступ ко всем модулям, настройкам и загрузкам Excel',
      usersCount: 1
    }
  ],
  sellers: [],
  stores: [
    {
      id: 'store-astana-1',
      city: 'Астана',
      name: 'AutoLider — ул. Кунаева',
      address: 'ул. Кунаева, 12',
      phone: '+7 (717) 200-00-01',
      status: 'active',
      workingHours: 'Пн-Вс 09:00 - 20:00'
    },
    {
      id: 'store-astana-2',
      city: 'Астана',
      name: 'AutoLider — просп. Туран',
      address: 'просп. Туран, 30',
      phone: '+7 (717) 200-00-02',
      status: 'active',
      workingHours: 'Пн-Вс 09:00 - 20:00'
    },
    {
      id: 'store-astana-3',
      city: 'Астана',
      name: 'AutoLider — ул. Сарыарка',
      address: 'ул. Сарыарка, 55',
      phone: '+7 (717) 200-00-03',
      status: 'active',
      workingHours: 'Пн-Вс 09:00 - 20:00'
    },
    {
      id: 'store-almaty-1',
      city: 'Алматы',
      name: 'AutoLider — ул. Абая',
      address: 'ул. Абая, 56',
      phone: '+7 (727) 300-00-01',
      status: 'active',
      workingHours: 'Пн-Вс 09:00 - 21:00'
    },
    {
      id: 'store-almaty-2',
      city: 'Алматы',
      name: 'AutoLider — просп. Назарбаева',
      address: 'просп. Назарбаева, 99',
      phone: '+7 (727) 300-00-02',
      status: 'active',
      workingHours: 'Пн-Вс 09:00 - 21:00'
    },
    {
      id: 'store-almaty-3',
      city: 'Алматы',
      name: 'AutoLider — ул. Панфилова',
      address: 'ул. Панфилова, 10',
      phone: '+7 (727) 300-00-03',
      status: 'active',
      workingHours: 'Пн-Вс 09:00 - 21:00'
    }
  ],
  orders: [],
  customers: [],
  banners: [],
  brands: [],
  settings: {
    storeName: 'Autolider Marketplace',
    phone: '+7 (777) 555-45-54',
    email: 'support@autolider.kz',
    address: 'г. Астана, ул. Автозаводская, 12',
    workingHours: 'Пн-Вс 09:00 - 20:00',
    currency: '₸',
    freeDeliveryMin: 50000,
    deliveryCost: 2500
  }
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
