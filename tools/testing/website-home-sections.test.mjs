import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const html = await readFile(new URL('../../dist/apps/website/index.html', import.meta.url), 'utf8');

test('homepage is the bilingual Tech Home TV download portal', () => {
  assert.match(html, /<html lang="ar" dir="rtl">/);
  assert.match(html, /Tech Home TV \| تنزيل التطبيق/);
  assert.match(html, /نسخة Windows/);
  assert.match(html, /نسخة Android/);
  assert.match(html, /lang="en"/);
  assert.match(html, /href="tel:\+9647744644492"/);
  assert.match(html, /techhome\.ct\.ws/);
});

test('homepage displays only the matching Windows installer and Android APK', () => {
  const links = [...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>/g)].map((match) => match[1]);
  const downloads = links.filter((href) => href.includes('/releases/download/'));
  assert.ok(downloads.length <= 2);
  assert.ok(downloads.every((href) => href.startsWith('https://github.com/hm06601-crypto/tech-home-tv-v2/')));
  assert.ok(!html.includes('https://github.com/4gray/iptvnator/releases'));
});

