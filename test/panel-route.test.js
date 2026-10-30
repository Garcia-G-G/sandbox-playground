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

test('GET /panel returns 200 HTML with all three state badges', async () => {
  const res = await fetch(`${baseUrl}/panel`);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('content-type'), 'text/html; charset=utf-8');
  const body = await res.text();
  assert.equal(Number(res.headers.get('content-length')), Buffer.byteLength(body));
  assert.match(body, /^<!doctype html>/);
  for (const state of ['progress', 'approved', 'error']) {
    assert.ok(body.includes(`class="badge state-${state}"`), `missing state-${state} badge`);
  }
});

test('GET /panel sets nosniff and a restrictive Content-Security-Policy', async () => {
  const res = await fetch(`${baseUrl}/panel`);
  assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(
    res.headers.get('content-security-policy'),
    "default-src 'none'; style-src 'unsafe-inline'",
  );
});

test('HEAD /panel returns 200 with HTML content-type and no body', async () => {
  const res = await fetch(`${baseUrl}/panel`, { method: 'HEAD' });
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-type'), /text\/html/);
  assert.equal(await res.text(), '');
});

test('POST /panel returns 405 with an Allow header', async () => {
  const res = await fetch(`${baseUrl}/panel`, { method: 'POST' });
  assert.equal(res.status, 405);
  assert.equal(res.headers.get('allow'), 'GET, HEAD');
  assert.match(res.headers.get('content-type'), /application\/json/);
  assert.equal(typeof (await res.json()).error, 'string');
});

test('/panel with a query string still matches', async () => {
  const res = await fetch(`${baseUrl}/panel?x=1`);
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-type'), /text\/html/);
});
