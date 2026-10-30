import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createServer } from '../src/app.js';

let server;
let baseUrl;

before(async () => {
  server = createServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

after(async () => {
  server.close();
  await once(server, 'close');
});

test('GET /panel returns a self-contained HTML page', async () => {
  const res = await fetch(`${baseUrl}/panel`);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('content-type'), 'text/html; charset=utf-8');
  const body = await res.text();
  assert.equal(Number(res.headers.get('content-length')), Buffer.byteLength(body));
  assert.match(body, /id="status"/);
  assert.match(body, /fetch\('\/health'/);
  assert.match(body, /<noscript>/);
});

test('/panel shows fallback text in #status before any script runs', async () => {
  const body = await (await fetch(`${baseUrl}/panel`)).text();
  const m = body.match(/<[^>]*id="status"[^>]*>([^<]+)</);
  assert.ok(m && m[1].trim().length > 0, 'status element has visible text');
});

test('/panel uses a light background and loads no other assets', async () => {
  const body = await (await fetch(`${baseUrl}/panel`)).text();
  assert.match(body, /background(-color)?:\s*#fff/i);
  assert.doesNotMatch(body, /\b(src|href)\s*=/i);
  assert.doesNotMatch(body, /@import|url\(/i);
});

test('HEAD /panel returns 200 with no body', async () => {
  const res = await fetch(`${baseUrl}/panel`, { method: 'HEAD' });
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('content-type'), 'text/html; charset=utf-8');
  assert.equal(await res.text(), '');
});

test('POST /panel returns 405 JSON with an Allow header', async () => {
  const res = await fetch(`${baseUrl}/panel`, { method: 'POST' });
  assert.equal(res.status, 405);
  assert.equal(res.headers.get('allow'), 'GET, HEAD');
  assert.match(res.headers.get('content-type'), /application\/json/);
  assert.deepEqual(await res.json(), { error: 'Method Not Allowed' });
});
