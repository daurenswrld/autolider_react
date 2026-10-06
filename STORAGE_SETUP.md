# Persistent uploads and catalog data on Vercel

The main site cannot save uploads in `server/uploads`: Vercel functions have a
read-only deployment filesystem. This change stores new images in a public
Vercel Blob store and saves the JSON catalog state in Postgres. Local development
continues to use `server/uploads` and `server/db.json`.

## Before deploying `main`

1. In the **main site's Vercel project**, create and connect a **public Blob**
   store. Confirm `BLOB_READ_WRITE_TOKEN` is available in Production.
2. Connect a Postgres database (for example Neon) to the same project. Provide
   its connection string as `DATABASE_URL` or `POSTGRES_URL` in Production.
   Set a strong, private `JWT_SECRET` in Production; the upload endpoint rejects
   requests without a valid admin/staff/seller session. Existing staff sessions
   must sign in again because staff logins now return signed tokens.
3. Back up any live catalog or order data. On first request the new database
   table is seeded from the `server/db.json` included in the deployment. Data
   previously written only to Vercel `/tmp/db.json` cannot be reliably recovered
   from another function instance.
4. Redeploy `main` only after both variables are set. Test a model image upload,
   save the model, then load the catalog in a new browser session and after a
   fresh deployment. Check that the new image URL uses the Blob domain.

`/api/upload` accepts source images up to 4 MB on Vercel because Vercel Functions
limit the whole request body to 4.5 MB. Larger images need a separate client
upload flow. Existing `/uploads/...` files bundled in the deployment remain
served by Express; newly uploaded images use their public Blob URLs.

Postgres updates use a version check. If another request changes the catalog
first, the API returns HTTP 409 and the admin must reload and retry. This
avoids silently overwriting newer changes, but the JSON document remains a
single record; a larger production migration should normalize orders and
inventory into separate tables.

The upload endpoint now checks a signed session, but other admin APIs still
lack server-side authorization and the existing default admin passwords are
unsafe. Remove these defaults and protect the remaining admin routes before
relying on the site for real orders or broad public use.
