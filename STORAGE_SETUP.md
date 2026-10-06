# AutoLider storage API and cutover

The main site's uploads write into Vercel's read-only filesystem. Admin edits
also use temporary JSON storage. The new API uses Blob for images and Postgres
for catalog state.

## Projects
- Original frontend: autolider-react.vercel.app, owned by daurenswrlds-projects.
- Separate API: autolider-storage-api.vercel.app, owned by nariman-s-projects2.
- Backend config: deploy/backend.vercel.json.
- Prepared frontend routing: deploy/main-proxy.vercel.json. Copy it to root
  vercel.json only after cloud verification and resolving the commercial plan.
  Root vercel.json currently keeps the original API routing.

## Required backend variables
BLOB_READ_WRITE_TOKEN, DATABASE_URL (or POSTGRES_URL), JWT_SECRET,
OTP_DELIVERY_PRIVATE_KEY, OTP_DELIVERY_URL.

The OTP relay stays in the original project and uses its existing SMTP/SMS
variables. The public verification key is committed; the private signing key
must never be committed or sent to the browser. Without a configured provider,
the relay reports that codes cannot be sent instead of claiming success.

## Migration and verification
1. Run node tools/storage/capture-live.mjs. It saves an ignored .migration/
   snapshot and prints only counts and hashes. Old temporary Vercel data varies
   between instances; this capture cannot guarantee recovery of all historical
   writes. Sellers' hidden credentials are reused only for exact source matches.
2. Accept Neon integration terms as the account owner. Connect the explicitly
   selected Free plan in Frankfurt to the separate backend.
3. Run vercel env pull .env.storage.local --environment production.
4. Run node tools/storage/bootstrap-db.mjs .migration/live-<timestamp>.json.
   It refuses to overwrite an existing database. Known default staff passwords
   are renewed and saved only in .migration/admin-access.txt.
5. Deploy: vercel deploy --prod --yes --local-config deploy/backend.vercel.json.
6. Run node tools/storage/check-storage.mjs https://autolider-storage-api.vercel.app.
7. Deploy the backend again, then run node tools/storage/check-persistence.mjs
   https://autolider-storage-api.vercel.app. It checks persistence and restores
   the original model photo; the tiny verification image stays in Blob.
8. Compare a fresh capture of the original site with the imported snapshot.
   Resolve changed data, copy deploy/main-proxy.vercel.json to root vercel.json,
   test a frontend preview and the OTP relay, merge the reviewed PR, and verify
   the main site.

## Access and limits
Admin requests send signed sessions. Private lists and catalog writes require
admin/staff authorization; staff cannot manage administrator accounts. Suppliers
are restricted to their own products and filtered order data. Customers retrieve
only their own signed-in profile. Sessions need a fresh login after cutover.

Server uploads accept up to 4 MB on Vercel. Postgres stores one JSON document
with version checks; conflicting writes return 409. Existing order business
rules still trust client-supplied totals and bonus values; this is not a payment
system audit.

The user's team is on Hobby, which permits personal noncommercial use. Testing
can proceed there; the live store requires a commercial plan. No paid upgrade
has been authorized. Migration backups, access credentials, private keys and
pulled environment variables remain ignored and must never be published.
