// Supabase's hosted runtime exposes secrets through process.env, but forbids
// writing environment variables. STORAGE_BACKEND is configured as a secret.
// Generated from the canonical Express sources. No database snapshot is bundled.
const { default: app } = await import('./generated/index.js');
// Mount the entire existing API below the Supabase function's required prefix.
// Express's router has already been constructed; wrap it in an outer app.
const { default: express } = await import('npm:express@5.2.1');
const outer = express();
outer.use('/autolider', app);
outer.listen(8000);
