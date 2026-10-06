# Upload fix handoff — 2026-10-06

Original main baseline: 0a8e237. PR: https://github.com/daurenswrld/autolider_react/pull/1.
This isolated checkout preserves the original project's redesign work.

Prepared: Blob uploads and Postgres JSON state; authenticated admin requests;
migration and verification scripts; backend deployment and frontend proxy
configs; signed OTP relay preserving SMTP/SMS settings in the original project.

Provisioned: autolider-storage-api project, public autolider-images Blob in
Frankfurt, separate JWT session key. Backend deployed; DB is not connected yet.

Live capture (ignored .migration/): 16 brands, 7 foreign brands, 14 categories,
1 customer, 2 admin users, 6 stores. No products/orders/sellers were returned.
Catalog collections matched bundled main data. No live data is committed.

Verified: client build; local authenticated upload/save and cleanup; private API
rejected without session. Cloud health 200, private API 401, catalog 500 because
DATABASE_URL is not configured.

Pending user: Neon terms acceptance and commercial hosting decision (Hobby now).
Pending work: connect/seed Neon, cloud upload and redeploy persistence tests,
OTP relay and frontend preview, live-data comparison, main cutover.
Root vercel.json still routes to the original API; no main cutover has occurred.
