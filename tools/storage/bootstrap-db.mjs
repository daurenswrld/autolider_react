import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { neon } from '@neondatabase/serverless';

process.loadEnvFile('.env.storage.local');
const backupPath = process.argv[2];
if (!backupPath || !backupPath.startsWith('.migration/')) throw new Error('Provide a local migration snapshot');
const { data, capturedAt } = JSON.parse(await fs.readFile(backupPath, 'utf8'));
const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL);
await sql`CREATE TABLE IF NOT EXISTS autolider_state (
  id integer PRIMARY KEY, data jsonb NOT NULL, version bigint NOT NULL DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT now()
)`;
const exists = await sql`SELECT version FROM autolider_state WHERE id = 1`;
if (exists.length) throw new Error('Database is already initialized; refusing to overwrite live data');
const weak = new Set(['admin', 'admin123', 'password123', '1234', 'manager', 'supplier123']);
const access = [];
for (const user of data.adminUsers || []) {
  if (!user.password_hash && (!user.password || weak.has(user.password))) {
    const password = crypto.randomBytes(24).toString('base64url');
    user.password_hash = await bcrypt.hash(password, 12);
    delete user.password;
    access.push(`Логин: ${user.username}\nПароль: ${password}`);
  }
}
// Store access locally before inserting so a failed disk write cannot lose it.
await fs.writeFile('.migration/admin-access.txt', access.join('\n\n') + '\n');
await sql`INSERT INTO autolider_state (id, data) VALUES (1, ${JSON.stringify(data)}::jsonb)`;
console.log(JSON.stringify({ importedSnapshot: backupPath, capturedAt,
  collections: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, Array.isArray(v) ? v.length : Object.keys(v).length])),
  renewedDefaultPasswords: access.length,
}));
