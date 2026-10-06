# Free storage and API deployment

Budget constraint: no paid upgrades or purchases. The proposed target is one
Supabase Free project providing Postgres, Storage and Edge Functions. The
existing frontend remains in its owner's Vercel project. Main cutover completed
through PR #1, squash commit 898a1945c2e56ddd959345226e5b40d7fa1cf496.

Free currently includes 500 MB database, 1 GB files and 500,000 function calls
per month. Transfer limits also apply. A project may pause after one week of
inactivity. This is suitable for testing and a small active store within quotas;
it is not an uptime guarantee. See https://supabase.com/pricing and
https://supabase.com/docs/guides/functions/limits.

## Setup after account login

1. Create a Free project. Do not upgrade the organization or supply payment
   details. Keep its database password in an ignored local environment file.
2. Apply supabase/migrations/202610060001_storage.sql. The state table has RLS
   and no browser access. Only the backend service role can modify it. The public
   image bucket accepts WebP up to 4 MB; no anonymous writes are allowed.
3. Set backend secrets STORAGE_BACKEND=supabase, JWT_SECRET,
   OTP_DELIVERY_PRIVATE_KEY and OTP_DELIVERY_URL.
   Supabase provides SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to its functions.
   Reuse the ignored prepared signing keys to preserve the main OTP relay.
4. Put STORAGE_BACKEND=supabase, SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in
   ignored .env.storage.local. Never put the service role in React, Git or chat.
5. Capture fresh live data, then run bootstrap-db.mjs as described in
   STORAGE_SETUP.md. It refuses to overwrite an initialized database.
6. Run node tools/storage/build-supabase.mjs, then deploy function autolider
   with JWT verification disabled at the gateway (supabase/config.toml). The
   Express API performs its own customer/admin session verification. The build
   copies only four canonical server modules; native Sharp/SQLite, demo data,
   backups and secrets are excluded. SQLite is only a secondary local projection.
7. Verify https://<project-ref>.supabase.co/functions/v1/autolider/api/health,
   login, private endpoints, an image upload and model save. Redeploy and verify
   persistence. Browser uploads resize and encode WebP before sending; the free
   runtime does not support Sharp.
8. Only after cloud verification, prepare the main proxy destination as
   https://<project-ref>.supabase.co/functions/v1/autolider/api/:path*.
   Keep /api/otp-delivery in the original Vercel project so it can use the
   owner's existing SMTP/SMS settings. Review preview, compare fresh data and
   then publish the main cutover through GitHub.

The earlier independent Vercel API and Blob test resources remain unused for
the free production plan. No Vercel Pro subscription has been purchased.

## Verification status

Frontend builds. Local Deno checks passed: hashed admin login, protected private
API, image upload, model save and rejection of conflicting state writes against
a local REST/Storage stand-in. No live database was changed by those checks.
Created organization AutoLider (dzpwxbgmocsmiufcgcaq), verified plan=free via the
Management API. Project autolider-storage (rxbochoeobudllwztprq), Frankfurt.
Live catalog snapshot imported into a protected table, default staff passwords
renewed locally. Hosted Edge login, upload/model save, public image availability
and redeploy persistence tests passed. Original model photo was restored.
API: https://rxbochoeobudllwztprq.supabase.co/functions/v1/autolider
Verified on the main domain: login, protected API, upload, model save and photo
restoration. Fresh data matched the migration. OTP relay rejects unsigned
requests; signed configuration probe passed, emailConfigured=true,
smsConfigured=false. No real email/SMS was sent. Default administrator passwords
were renewed; local ignored .migration/admin-access.txt contains the new access.
Supabase's hosted runtime forbids process.env writes; configure
STORAGE_BACKEND as a secret, never assign it in the function entrypoint.
