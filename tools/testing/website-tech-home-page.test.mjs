import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const html = await readFile(new URL('../../dist/apps/website/index.html', import.meta.url), 'utf8');

test('Tech Home TV landing page offers Windows and Android in Arabic and English', () => {
  assert.match(html, /<html lang="ar" dir="rtl">/);
  assert.match(html, /<title>Tech Home TV \| تنزيل التطبيق<\/title>/);
  assert.match(html, /نسخة Windows/);
  assert.match(html, /نسخة Android/);
  assert.match(html, /lang="en"/);
  assert.match(html, /Tech Home TV downloads/);
  assert.match(html, /href="tel:\+9647744644492"/);
  assert.match(html, /https:\/\/techhome\.ct\.ws/);
  assert.match(html, /favicon-256x256\.png/);
  assert.doesNotMatch(html, /href="https:\/\/github\.com\/4gray\/iptvnator\/releases/);
});

test('landing page links to current binary assets or a safe releases index', () => {
  const links = [...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>/g)].map((match) => match[1]);
  const windows = links.find((href) => /tech-home-tv-\d+\.\d+\.\d+-windows-x64-setup\.exe$/.test(href));
  const android = links.find((href) => /TechHomeTV-\d+\.\d+\.\d+-[0-9a-f]{7}\.apk$/i.test(href));
  const safeFallback = 'https://github.com/hm06601-crypto/tech-home-tv-v2/releases';

  assert.ok(windows || links.includes(safeFallback), 'Windows must link to a built x64 setup or the releases index');
  assert.ok(android || links.includes(safeFallback), 'Android must link to a built APK or the releases index');
  for (const url of [windows, android].filter(Boolean)) {
    assert.ok(url.startsWith('https://github.com/hm06601-crypto/tech-home-tv-v2/releases/download/'));
  }
});

