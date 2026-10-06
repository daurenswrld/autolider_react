import process from 'node:process';
process.env.STORAGE_BACKEND = 'supabase';
for (const name of ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'JWT_SECRET',
  'OTP_DELIVERY_PRIVATE_KEY', 'OTP_DELIVERY_URL']) {
  const value = Deno.env.get(name);
  if (value) process.env[name] = value;
}
// Generated from the canonical Express sources. No database snapshot is bundled.
const { default: app } = await import('./generated/index.js');
// Mount the entire existing API below the Supabase function's required prefix.
// Express's router has already been constructed; wrap it in an outer app.
const { default: express } = await import('npm:express@5.2.1');
const outer = express();
outer.use('/autolider', app);
outer.listen(8000);
