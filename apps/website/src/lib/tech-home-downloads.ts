const OWNER = 'hm06601-crypto';
const REPOSITORY = 'tech-home-tv-v2';
const REPO_URL = `https://github.com/${OWNER}/${REPOSITORY}`;
const RELEASES_API = `https://api.github.com/repos/${OWNER}/${REPOSITORY}/releases?per_page=100`;
const BUILD_COMMIT = process.env.GITHUB_SHA;

export interface TechHomeAsset {
  name: string;
  url: string;
  size: number;
  tag: string;
  releaseUrl: string;
  publishedAt: string | null;
}

export interface TechHomeDownloads {
  windows: TechHomeAsset | null;
  android: TechHomeAsset | null;
  releasesUrl: string;
}

let downloadsPromise: Promise<TechHomeDownloads> | undefined;

/** Resolve customer downloads from Tech Home TV releases only. */
export function getTechHomeDownloads(): Promise<TechHomeDownloads> {
  downloadsPromise ??= fetchTechHomeDownloads();
  return downloadsPromise;
}

async function fetchTechHomeDownloads(): Promise<TechHomeDownloads> {
  const releasesUrl = `${REPO_URL}/releases`;
  try {
    const response = await fetch(RELEASES_API, {
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'tech-home-tv-download-page',
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error(`GitHub API answered HTTP ${response.status}`);

    const payload: unknown = await response.json();
    if (!Array.isArray(payload)) throw new Error('GitHub release list had an unexpected shape');
    const releases = payload
      .filter(isRelease)
      .filter((release) => !release.draft)
      // Do not put an older binary in front of customers while builds for the
      // current source revision are still running.
      .filter((release) => !BUILD_COMMIT || release.target_commitish === BUILD_COMMIT);

    return {
      windows: findAsset(
        releases.filter((release) => !release.prerelease && /^windows-v/.test(release.tag_name)),
        (name) => /^tech-home-tv-\d+\.\d+\.\d+-windows-x64-setup\.exe$/.test(name),
        // The setup file must ship with Electron's update manifest so a new
        // customer release does not silently break in-app updates.
        (release) => release.assets.some((asset) => asset.name === 'latest.yml'),
      ),
      android: findAsset(
        releases.filter((release) => /^tv-shell-v/.test(release.tag_name)),
        (name) => /^TechHomeTV-\d+\.\d+\.\d+-[0-9a-f]{7}\.apk$/i.test(name),
      ),
      releasesUrl,
    };
  } catch (error) {
    console.warn(`[website] Tech Home TV release lookup failed: ${error instanceof Error ? error.message : String(error)}`);
    return { windows: null, android: null, releasesUrl };
  }
}

function isRelease(value: unknown): value is ReleaseRecord {
  if (!value || typeof value !== 'object') return false;
  const release = value as Partial<ReleaseRecord>;
  return (
    typeof release.tag_name === 'string' &&
    typeof release.html_url === 'string' &&
    typeof release.target_commitish === 'string' &&
    typeof release.draft === 'boolean' &&
    typeof release.prerelease === 'boolean' &&
    Array.isArray(release.assets)
  );
}

function findAsset(
  releases: ReleaseRecord[],
  matchesName: (name: string) => boolean,
  acceptRelease: (release: ReleaseRecord) => boolean = () => true,
): TechHomeAsset | null {
  for (const release of releases) {
    if (!acceptRelease(release)) continue;
    const asset = release.assets.find(
      (candidate) =>
        candidate &&
        typeof candidate.name === 'string' &&
        typeof candidate.browser_download_url === 'string' &&
        typeof candidate.size === 'number' &&
        matchesName(candidate.name) &&
        candidate.browser_download_url.startsWith(`${REPO_URL}/`),
    );
    if (!asset) continue;
    return {
      name: asset.name,
      url: asset.browser_download_url,
      size: asset.size,
      tag: release.tag_name,
      releaseUrl: release.html_url,
      publishedAt: release.published_at ?? null,
    };
  }
  return null;
}

interface ReleaseAssetRecord {
  name: string;
  browser_download_url: string;
  size: number;
}

interface ReleaseRecord {
  tag_name: string;
  html_url: string;
  target_commitish: string;
  published_at?: string;
  draft: boolean;
  prerelease: boolean;
  assets: ReleaseAssetRecord[];
}

