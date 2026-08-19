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

export function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DATA, null, 2), 'utf8');
      return INITIAL_DATA;
    }
    const content = fs.readFileSync(DB_FILE, 'utf8');
    const data = JSON.parse(content);

    if (Array.isArray(data.products)) {
      data.products = data.products.map((p) => ({
        ...p,
        specs: Array.isArray(p.specs) ? p.specs : typeof p.specs === 'string' ? p.specs : []
      }));
    }

    // Compute dynamic product count for each category
    if (Array.isArray(data.categories) && Array.isArray(data.products)) {
      data.categories = data.categories.map((cat) => {
        const count = data.products.filter(
          (p) => p.status !== 'disabled' && (p.categoryId === cat.id || p.categoryName === cat.name)
        ).length;
        return { ...cat, count };
      });
    }

    if (!data.vinRequests) {
      data.vinRequests = [];
    }

    return data;
  } catch (err) {
    console.error('Error reading DB file, using initial data:', err);
    return INITIAL_DATA;
  }
}

export function writeDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing DB file:', err);
  }
}
