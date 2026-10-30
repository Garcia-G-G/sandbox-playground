import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createServer } from '../src/app.js';
import { resolvePort } from '../src/server.js';

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

test('GET /health returns 200 with JSON {status: "ok"}', async () => {
  const res = await fetch(`${baseUrl}/health`);
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-type'), /application\/json/);
  assert.deepEqual(await res.json(), { status: 'ok' });
});

test('HEAD /health returns 200 with JSON content-type and no body', async () => {
  const res = await fetch(`${baseUrl}/health`, { method: 'HEAD' });
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-type'), /application\/json/);
  assert.equal(await res.text(), '');
});

test('POST /health returns 405 with an Allow header', async () => {
  const res = await fetch(`${baseUrl}/health`, { method: 'POST' });
  assert.equal(res.status, 405);
  assert.equal(res.headers.get('allow'), 'GET, HEAD');
  assert.match(res.headers.get('content-type'), /application\/json/);
  assert.equal(typeof (await res.json()).error, 'string');
});

test('unknown path returns 404 with a JSON error body', async () => {
  const res = await fetch(`${baseUrl}/does-not-exist`);
  assert.equal(res.status, 404);
  assert.match(res.headers.get('content-type'), /application\/json/);
  assert.equal(typeof (await res.json()).error, 'string');
});

test('/health with a query string still matches', async () => {
  const res = await fetch(`${baseUrl}/health?probe=1`);
  assert.equal(res.status, 200);
});

test('resolvePort uses a valid PORT and falls back to 3000 otherwise', () => {
  assert.equal(resolvePort('1'), 1);
  assert.equal(resolvePort('8080'), 8080);
  assert.equal(resolvePort('65535'), 65535);
  for (const bad of [
    undefined, '', '0', '-1', '65536', '3.5', 'abc',
    '1e3', '0x50', ' 80', '80 ', '+80', '80.0', '080', '0b1010', '99999', 8080,
  ]) {
    assert.equal(resolvePort(bad), 3000, `PORT=${bad}`);
  }
});
