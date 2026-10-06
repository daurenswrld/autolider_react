import fs from 'node:fs/promises';
await fs.mkdir('backend-public', { recursive: true });
await fs.writeFile('backend-public/index.html', '<!doctype html><html lang="en"><title>AutoLider API</title><p>AutoLider storage service</p></html>');
