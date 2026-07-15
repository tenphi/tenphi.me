/**
 * Central site + identity configuration.
 *
 * Single source of truth for values that were previously scattered across
 * layouts and pages, and the shared config consumed by the AT Protocol publish
 * script (`scripts/publish-atproto.ts`). Keep this file dependency-free so it
 * can be imported both by Astro (build) and by the standalone `tsx` script.
 */

export const site = {
  /** Canonical site URL. No trailing slash. */
  url: 'https://tenphi.me',
  /** Site/author display name. */
  authorName: 'Andrey Yamanov',

  /** standard.site publication metadata. */
  publicationName: 'tenphi.me',
  publicationDescription:
    'Andrey Yamanov — Frontend Developer & Principal UX/UI Engineer. Notes on design systems, CSS-in-JS, and UI engineering.',
  /**
   * Optional square PNG (>=256x256) used as the publication icon blob. Path is
   * relative to the repo root. The publish script skips the icon if the file
   * does not exist (SVG favicons are not uploaded as the icon blob).
   */
  iconPath: 'public/publication-icon.png',
  /** Whether the publication opts into discovery feeds. */
  showInDiscover: true,

  /** AT Protocol identity. */
  bluesky: {
    /** Handle used to log in and as the public profile. */
    handle: 'tenphi.bsky.social',
    /** Default PDS host; override with ATPROTO_PDS if self-hosting. */
    pdsHost: 'https://bsky.social',
    /** Public, unauthenticated read API used at build time. */
    publicApi: 'https://public.api.bsky.app',
    /** Public profile URL. */
    profileUrl: 'https://bsky.app/profile/tenphi.bsky.social',
  },
} as const;

export type Site = typeof site;
