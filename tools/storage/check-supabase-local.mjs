// Exercises the generated Deno API against a local PostgREST/Storage stand-in.
// No production database, image or account is changed.
import http from 'node:http';
import fs from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import sharp from 'sharp';
import crypto from 'node:crypto';

const executable = process.argv[2];
if (!executable) throw new Error('Provide Deno executable path');
const password = crypto.randomBytes(24).toString('hex');
const key = crypto.randomBytes(24).toString('hex');
let data = JSON.parse(await fs.readFile('server/db.json', 'utf8'));
data.adminUsers = [{ id: 'edge-test', username: 'edge-test', role: 'admin',
  status: 'active', password_hash: await bcrypt.hash(password, 12) }];
let version = 1;
const images = new Map();
const provider = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname.startsWith('/storage/v1/object/public/')) {
    const image = images.get(url.pathname.replace('/public', ''));
    res.writeHead(image ? 200 : 404, { 'Content-Type': 'image/webp' });
    return res.end(image);
  }
  if (req.headers.apikey !== key || req.headers.authorization !== `Bearer ${key}`) {
    res.writeHead(401); return res.end();
  }
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks);
  res.setHeader('Content-Type', 'application/json');
  if (url.pathname === '/rest/v1/autolider_state') {
    if (req.method === 'PATCH') {
      if (url.searchParams.get('version') !== `eq.${version}`) return res.end('[]');
      const update = JSON.parse(body); data = update.data; version = update.version;
    }
    return res.end(JSON.stringify([{ data, version }]));
  }
  if (req.method === 'POST' && url.pathname.startsWith('/storage/v1/object/')) {
    images.set(url.pathname, body); return res.end('{}');
  }
  res.writeHead(404); res.end('{}');
});
provider.listen(0, '127.0.0.1');
await once(provider, 'listening');
const serviceUrl = `http://127.0.0.1:${provider.address().port}`;
const child = spawn(executable, ['run', '--no-check', '--node-modules-dir=none', '-A',
  'supabase/functions/autolider/index.ts'], {
  env: { ...process.env, STORAGE_BACKEND: 'supabase', SUPABASE_URL: serviceUrl, SUPABASE_SERVICE_ROLE_KEY: key,
    JWT_SECRET: crypto.randomBytes(32).toString('hex'), VERCEL: '',
    OTP_DELIVERY_URL: '', OTP_DELIVERY_PRIVATE_KEY: '' },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let logs = '';
child.stdout.on('data', chunk => { logs += chunk; });
child.stderr.on('data', chunk => { logs += chunk; });
const base = 'http://localhost:8000/autolider';
try {
  let ready = false;
  for (let attempt = 0; attempt < 120; attempt++) {
    if (child.exitCode !== null) throw new Error(`Deno startup failed: ${logs.slice(-4000)}`);
    try { ready = (await fetch(`${base}/api/health`)).ok; } catch {}
    if (ready) break;
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  assert(ready, `Deno API startup timed out: ${logs.slice(-2000)}`);
  const login = await fetch(`${base}/api/admin/login`, { method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'edge-test', password, portalType: 'admin' }) });
  assert.equal(login.status, 200, 'real hashed admin login in Deno');
  const { token } = await login.json();
  const headers = { Authorization: `Bearer ${token}` };
  assert.equal((await fetch(`${base}/api/admin-users`)).status, 401);
  const users = await (await fetch(`${base}/api/admin-users`, { headers })).json();
  assert(users.every(user => !user.password_hash && !user.password));
  const brands = await (await fetch(`${base}/api/brands`)).json();
  const brand = brands.find(b => b.models?.length);
  assert(brand, 'existing model available from REST adapter');
  const image = await sharp({ create: { width: 16, height: 16, channels: 3,
    background: '#d32f2f' } }).webp().toBuffer();
  const form = new FormData();
  form.append('image', new Blob([image], { type: 'image/webp' }), 'test.webp');
  form.append('type', 'model');
  const upload = await fetch(`${base}/api/upload`, { method: 'POST', headers, body: form });
  const uploaded = await upload.json();
  assert.equal(upload.status, 200, uploaded.message);
  assert((await fetch(uploaded.url)).ok, 'public image available');
  const save = await fetch(`${base}/api/brands/${brand.id}/models/${brand.models[0].id}`, {
    method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ photoUrl: uploaded.url }) });
  assert.equal(save.status, 200, await save.text());
  assert.equal(data.brands.find(b => b.id === brand.id).models[0].photoUrl, uploaded.url);
  assert(version > 1, 'versioned REST write occurred');
  // An atomic version filter must reject concurrent edits instead of losing data.
  process.env.SUPABASE_URL = serviceUrl; process.env.SUPABASE_SERVICE_ROLE_KEY = key;
  process.env.STORAGE_BACKEND = 'supabase';
  const { readDB, writeDB } = await import('../../server/database.js');
  const first = await readDB(); const stale = await readDB();
  await writeDB(first);
  await assert.rejects(writeDB(stale), error => error.code === 'DB_CONFLICT');
  console.log(JSON.stringify({ runtime: 'Deno', login: 'passed', privateApi: 'protected',
    upload: 'passed', modelSave: 'passed', concurrentWrite: 'rejected' }));
} finally {
  child.kill();
  provider.close();
}
