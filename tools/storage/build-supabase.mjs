import fs from 'node:fs/promises';
import path from 'node:path';

const destination = 'supabase/functions/autolider/generated';
await fs.mkdir(destination, { recursive: true });
const packages = JSON.parse(await fs.readFile('package.json', 'utf8')).dependencies;
const builtins = new Set(['fs', 'path', 'url', 'crypto']);
for (const name of ['index.js', 'database.js', 'admin-auth.js', 'supabase-storage.js']) {
  let source = await fs.readFile(path.join('server', name), 'utf8');
  // Edge Functions cannot load native Sharp/SQLite. Supabase state is authoritative;
  // the existing SQLite writes are only a secondary local projection.
  source = source.replace("import sqliteDb from './sqlite-db.js';", "const sqliteDb = { prepare: () => ({ run() {} }) };");
  for (const pkg of ['sharp', '@vercel/blob', '@neondatabase/serverless']) {
    const replacement = pkg === 'sharp' ? 'const sharp = unavailable;'
      : pkg === '@vercel/blob' ? 'const put = unavailable;' : 'const neon = unavailable;';
    source = source.replace(new RegExp(`import [^;]+ from '${pkg}';`), replacement);
  }
  source = source.replace(/from '([^']+)'/g, (match, pkg) => {
    if (builtins.has(pkg)) return `from 'node:${pkg}'`;
    if (packages[pkg]) return `from 'npm:${pkg}@${packages[pkg].replace(/^[~^]/, '')}'`;
    return match;
  });
  source = "function unavailable() { throw new Error('Unsupported storage backend in Edge runtime'); }\n" + source;
  await fs.writeFile(path.join(destination, name), source);
}
console.log('Supabase Edge sources generated without native modules or live data');
