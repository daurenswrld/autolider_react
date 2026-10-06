import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const origin = 'https://autolider-react.vercel.app';
const seed = JSON.parse(await fs.readFile(path.join(root, 'server/db.json'), 'utf8'));
const endpoints = {
  products: 'products?all=true', brands: 'brands?all=true',
  foreignBrands: 'foreign-brands?all=true', categories: 'categories?all=true',
  orders: 'orders', customers: 'customers', warehouses: 'warehouses',
  sellers: 'sellers', stores: 'stores', roles: 'roles',
  banners: 'banners?all=true', settings: 'settings', vinRequests: 'vin-requests',
  adminUsers: 'admin-users',
};
const data = {};
for (const [key, endpoint] of Object.entries(endpoints)) {
  const response = await fetch(`${origin}/api/${endpoint}`, { cache: 'no-store' });
  if (!response.ok) throw new Error(`${key}: HTTP ${response.status}`);
  data[key] = await response.json();
  if (key !== 'settings' && !Array.isArray(data[key])) throw new Error(`Invalid ${key} response`);
}
// The live sellers API hides passwords. Reuse only credentials from an exact
// matching source record, never assign a password belonging to another seller.
for (const seller of data.sellers) {
  const old = (seed.sellers || []).find(s => String(s.id) === String(seller.id)
    && (s.code || '') === (seller.code || '') && (s.username || '') === (seller.username || ''));
  if (old) {
    if (old.password) seller.password = old.password;
    if (old.password_hash) seller.password_hash = old.password_hash;
  }
}
const backup = { capturedAt: new Date().toISOString(), source: origin, data };
await fs.mkdir(path.join(root, '.migration'), { recursive: true });
const filename = `live-${Date.now()}.json`;
await fs.writeFile(path.join(root, '.migration', filename), JSON.stringify(backup, null, 2));
const report = Object.fromEntries(Object.entries(data).map(([key, value]) => [key, {
  count: Array.isArray(value) ? value.length : Object.keys(value).length,
  sha256: crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex'),
  matchesSeed: JSON.stringify(value) === JSON.stringify(seed[key]),
}]));
console.log(JSON.stringify({ filename, report,
  sellersWithoutCredentials: data.sellers.filter(s => !s.password && !s.password_hash).length,
}, null, 2));
