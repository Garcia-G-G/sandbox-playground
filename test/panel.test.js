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

test('GET /panel returns 200 with an HTML content-type in utf-8', async () => {
  const res = await fetch(`${baseUrl}/panel`);
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-type'), /^text\/html;\s*charset=utf-8$/i);
  const body = await res.text();
  assert.equal(Number(res.headers.get('content-length')), Buffer.byteLength(body));
});

test('GET /panel serves a visible, self-contained HTML page', async () => {
  const body = await (await fetch(`${baseUrl}/panel`)).text();
  assert.match(body, /^<!doctype html>/i);
  assert.match(body, /<html[^>]*\blang="[^"]+"/i);
  assert.match(body, /<title>[^<]*\S[^<]*<\/title>/i);
  assert.match(body, /\bok\b/);
  assert.match(body, /health-service/);
  assert.match(body, /background(-color)?:\s*#fff\b/i, 'light background');
  assert.match(body, /[^-]color:\s*#111\b/i, 'dark text');
  assert.doesNotMatch(body, /(src|href)\s*=\s*["']?(https?:)?\/\//i, 'no external resources');
});

test('HEAD /panel returns 200 with an HTML content-type and no body', async () => {
  const res = await fetch(`${baseUrl}/panel`, { method: 'HEAD' });
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-type'), /^text\/html;\s*charset=utf-8$/i);
  assert.equal(await res.text(), '');
});

test('POST /panel returns 405 JSON with an Allow header', async () => {
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
