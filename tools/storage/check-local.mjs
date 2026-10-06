import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';

const originalDB = await fs.readFile('server/db.json');
const accessPath = '.migration/admin-access.txt';
const priorAccess = await fs.readFile(accessPath).catch(() => null);
await fs.mkdir('.migration', { recursive: true });
await fs.writeFile(accessPath, 'Логин: admin\nПароль: admin\n');
const server = spawn(process.execPath, ['server/index.js'], {
  env: { ...process.env, PORT: '5117', VERCEL: '' }, windowsHide: true, stdio: 'ignore',
});
try {
  let ready = false;
  for (let i = 0; i < 30; i++) {
    try { ready = (await fetch('http://localhost:5117/api/health')).ok; } catch {}
    if (ready) break;
    await new Promise(r => setTimeout(r, 200));
  }
  if (!ready) throw new Error('Local test server did not start');
  const test = spawn(process.execPath, ['tools/storage/check-storage.mjs', 'http://localhost:5117'], { windowsHide: true, stdio: 'inherit' });
  const code = await new Promise(r => test.on('exit', r));
  if (code !== 0) throw new Error('Local storage scenario failed');
} finally {
  server.kill();
  await new Promise(r => server.once('exit', r));
  await fs.writeFile('server/db.json', originalDB);
  if (priorAccess) await fs.writeFile(accessPath, priorAccess);
  else await fs.unlink(accessPath);
  const result = JSON.parse(await fs.readFile('.migration/storage-test.json', 'utf8').catch(() => '{}'));
  if (result.uploadedUrl?.startsWith('/uploads/')) {
    const uploads = path.resolve('server/uploads');
    const image = path.resolve(uploads, path.basename(result.uploadedUrl));
    if (image.startsWith(uploads + path.sep)) await fs.unlink(image).catch(() => {});
    await fs.unlink('.migration/storage-test.json');
  }
}
