// Authenticated configuration probe only; sends no emails or text messages.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import jwt from 'jsonwebtoken';

const base = process.argv[2];
if (!base?.startsWith('https://')) throw new Error('Provide HTTPS frontend URL');
const privateKey = await fs.readFile('.migration/otp-private-key.pem', 'utf8');
const url = `${base}/api/otp-delivery`;
assert.equal((await fetch(url, { method: 'POST' })).status, 401, 'unsigned delivery rejected');
const token = jwt.sign({ action: 'health' }, privateKey, {
  algorithm: 'RS256', audience: 'autolider-otp-delivery',
  issuer: 'autolider-storage-api', expiresIn: '30s',
});
const response = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
assert.equal(response.status, 200, 'signed configuration probe accepted');
const result = await response.json();
assert.equal(result.success, true);
console.log(JSON.stringify({ relaySignature: 'passed',
  emailConfigured: result.emailConfigured, smsConfigured: result.smsConfigured, messagesSent: 0 }));
