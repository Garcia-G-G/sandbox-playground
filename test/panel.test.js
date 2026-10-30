import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { renderPanel, SAMPLE_ITEMS } from '../src/panel.js';

test('renders a complete Spanish document with all three states', () => {
  const html = renderPanel();
  assert.match(html, /^<!doctype html>/);
  assert.match(html, /<html lang="es">/);
  assert.match(html, /<meta name="viewport"/);
  assert.match(html, /<title>Panel de estado<\/title>/);
  for (const cls of ['state-progress', 'state-approved', 'state-error']) {
    assert.ok(html.includes(`class="badge ${cls}"`), cls);
  }
  assert.equal((html.match(/<li /g) ?? []).length, SAMPLE_ITEMS.length);
});

test('badges show the spec label with an aria-hidden icon', () => {
  const html = renderPanel([
    { title: 'a', state: 'progress' },
    { title: 'b', state: 'approved' },
    { title: 'c', state: 'error' },
  ]);
  assert.ok(html.includes('<span aria-hidden="true">◐</span> En curso'));
  assert.ok(html.includes('<span aria-hidden="true">✓</span> Aprobado'));
  assert.ok(html.includes('<span aria-hidden="true">✕</span> Error'));
});

test('escapes HTML in titles', () => {
  const html = renderPanel([{ title: `<script>alert("x")</script> & 'y'`, state: 'error' }]);
  assert.ok(!html.includes('<script>'));
  assert.ok(html.includes('&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &#39;y&#39;'));
});

test('declares every palette token with the spec hex for light and dark', async () => {
  const spec = await readFile(new URL('../docs/panel-palette.md', import.meta.url), 'utf8');
  const html = renderPanel();
  const [light, dark] = html.split('@media (prefers-color-scheme: dark)');
  const rows = [...spec.matchAll(/^\| `(--[\w-]+)` \| `(#[0-9A-F]{6})` \| `(#[0-9A-F]{6})` \|/gm)];
  assert.equal(rows.length, 15);
  for (const [, token, lightHex, darkHex] of rows) {
    assert.ok(light.includes(`${token}: ${lightHex};`), `${token} light`);
    assert.ok(dark.includes(`${token}: ${darkHex};`), `${token} dark`);
  }
});

test('renders an empty-state message when there are no items', () => {
  const html = renderPanel([]);
  assert.ok(!html.includes('<ul'));
  assert.match(html, /No hay elementos/);
});
