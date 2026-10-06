import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import sharp from 'sharp';

const base = process.argv[2] || 'http://localhost:5000';
const credentials = await fs.readFile('.migration/admin-access.txt', 'utf8');
const username = /Логин: (.+)/.exec(credentials)?.[1];
const password = /Пароль: (.+)/.exec(credentials)?.[1];
const response = await fetch(`${base}/api/admin/login`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, password, portalType: 'admin' }),
});
assert.equal(response.status, 200, 'admin login');
const { token } = await response.json();
const headers = { Authorization: `Bearer ${token}` };
assert.equal((await fetch(`${base}/api/admin-users`)).status, 401, 'private data requires session');
assert.equal((await fetch(`${base}/api/brands`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status, 401, 'catalog writes require session');
const users = await (await fetch(`${base}/api/admin-users`, { headers })).json();
assert(users.every(u => !u.password && !u.password_hash), 'private credentials excluded from responses');
const brands = await (await fetch(`${base}/api/brands?all=true`, { headers })).json();
const brand = brands.find(b => b.models?.length);
assert(brand, 'existing brand and model');
const model = brand.models[0];
const form = new FormData();
const png = await sharp({ create: { width: 16, height: 16, channels: 3, background: '#d32f2f' } }).webp().toBuffer();
form.append('image', new Blob([png], { type: 'image/webp' }), 'storage-check.webp');
form.append('type', 'model');
const upload = await fetch(`${base}/api/upload`, { method: 'POST', headers, body: form });
assert.equal(upload.status, 200, 'image upload');
const image = await upload.json();
assert(image.success, 'successful upload');
if (!base.includes('localhost')) assert(
  image.url.includes('.public.blob.vercel-storage.com/') ||
  image.url.includes('.supabase.co/storage/v1/object/public/autolider-images/'),
  'persistent storage URL');
assert.equal((await fetch(new URL(image.url, base))).status, 200, 'uploaded image available');
const save = await fetch(`${base}/api/brands/${brand.id}/models/${model.id}`, {
  method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' },
  body: JSON.stringify({ photoUrl: image.url }),
});
assert.equal(save.status, 200, 'model save');
const saved = await (await fetch(`${base}/api/brands`)).json();
assert.equal(saved.find(b => b.id === brand.id).models.find(m => m.id === model.id).photoUrl, image.url, 'model references uploaded image');
await fs.writeFile('.migration/storage-test.json', JSON.stringify({ brandId: brand.id, modelId: model.id, originalPhotoUrl: model.photoUrl || '', uploadedUrl: image.url }));
console.log(JSON.stringify({ login: 'passed', privateApi: 'protected', upload: 'passed', modelSave: 'passed', imageUrl: image.url }));
