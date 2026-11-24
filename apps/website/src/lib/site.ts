/**
 * Canonical Tech Home TV site location on GitHub Pages.
 */
export const SITE_ORIGIN = 'https://hm06601-crypto.github.io';
export const SITE_BASE = '/tech-home-tv-v2';

/** Absolute URL for a site-relative path such as `/download/windows/`. */
export function absoluteUrl(path: string): string {
  return `${SITE_ORIGIN}${SITE_BASE}${path}`;
}

/** Site-relative href with the GitHub Pages base prefix. */
export function siteHref(path: string): string {
  return `${SITE_BASE}${path}`;
}

