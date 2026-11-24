import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import ts from 'typescript';

const SOURCE = new URL('../../apps/website/src/lib/tech-home-downloads.ts', import.meta.url);
const CURRENT_SHA = 'a'.repeat(40);
const REPO = 'https://github.com/hm06601-crypto/tech-home-tv-v2';

function release(tag, target, { prerelease = false, assets = [] } = {}) {
  return {
    tag_name: tag,
    target_commitish: target,
    html_url: `${REPO}/releases/tag/${tag}`,
    draft: false,
    prerelease,
    published_at: '2026-11-24T12:00:00Z',
    assets: assets.map(([name, size = 100]) => ({
      name,
      size,
      browser_download_url: `${REPO}/releases/download/${tag}/${name}`,
    })),
  };
}

async function loadResolver(releases) {
  const source = await readFile(SOURCE, 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const exports = {};
  vm.runInNewContext(code, {
    exports,
    process: { env: { GITHUB_SHA: CURRENT_SHA } },
    AbortSignal,
    console: { warn() {} },
    fetch: async () => ({ ok: true, json: async () => releases }),
  });
  return exports.getTechHomeDownloads();
}

test('download resolver selects only current-source Tech Home TV Windows and Android assets', async () => {
  const result = await loadResolver([
    release('windows-v0.25.0-2', 'b'.repeat(40), {
      assets: [['tech-home-tv-0.25.0-windows-x64-setup.exe'], ['latest.yml']],
    }),
    release('tv-shell-v1.0.0-9', 'b'.repeat(40), {
      prerelease: true,
      assets: [['TechHomeTV-1.0.0-160b631.apk']],
    }),
    release('windows-v0.25.0-3', CURRENT_SHA, {
      assets: [['tech-home-tv-0.25.0-windows-x64-setup.exe', 200], ['latest.yml']],
    }),
    release('tv-shell-v1.0.0-10', CURRENT_SHA, {
      prerelease: true,
      assets: [['TechHomeTV-1.0.0-abcdef0.apk', 300]],
    }),
  ]);

  assert.equal(result.windows?.tag, 'windows-v0.25.0-3');
  assert.equal(result.windows?.size, 200);
  assert.equal(result.android?.tag, 'tv-shell-v1.0.0-10');
  assert.equal(result.android?.size, 300);
  assert.ok(result.windows.url.startsWith(`${REPO}/`));
  assert.ok(result.android.url.startsWith(`${REPO}/`));
});

test('download resolver withholds stale or incomplete builds instead of linking them', async () => {
  const result = await loadResolver([
    release('windows-v0.25.0-2', 'b'.repeat(40), {
      assets: [['tech-home-tv-0.25.0-windows-x64-setup.exe'], ['latest.yml']],
    }),
    release('windows-v0.25.0-3', CURRENT_SHA, {
      assets: [['tech-home-tv-0.25.0-windows-x64-setup.exe']],
    }),
    release('tv-shell-v1.0.0-9', 'b'.repeat(40), {
      prerelease: true,
      assets: [['TechHomeTV-1.0.0-160b631.apk']],
    }),
  ]);

  assert.equal(result.windows, null);
  assert.equal(result.android, null);
  assert.equal(result.releasesUrl, `${REPO}/releases`);
});

