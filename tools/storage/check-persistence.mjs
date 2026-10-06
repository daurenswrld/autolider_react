import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const base = process.argv[2];
if (!base) throw new Error('Provide the deployed storage API URL');
const test = JSON.parse(await fs.readFile('.migration/storage-test.json', 'utf8'));
const brands = await (await fetch(`${base}/api/brands`, { cache: 'no-store' })).json();
const model = brands.find(b => b.id === test.brandId)?.models.find(m => m.id === test.modelId);
assert.equal(model?.photoUrl, test.uploadedUrl, 'saved URL survives a fresh deployment');
assert.equal((await fetch(test.uploadedUrl)).status, 200, 'image survives a fresh deployment');
const credentials = await fs.readFile('.migration/admin-access.txt', 'utf8');
const username = /Логин: (.+)/.exec(credentials)[1];
const password = /Пароль: (.+)/.exec(credentials)[1];
const login = await fetch(`${base}/api/admin/login`, { method: 'POST',
  headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }),
});
assert.equal(login.status, 200);
const { token } = await login.json();
const restore = await fetch(`${base}/api/brands/${test.brandId}/models/${test.modelId}`, {
  method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ photoUrl: test.originalPhotoUrl }),
});
assert.equal(restore.status, 200, 'test model restored');
console.log(JSON.stringify({ redeployPersistence: 'passed', originalPhotoRestored: true }));
