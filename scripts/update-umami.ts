/**
 * Vendor the Umami tracker script into `public/umami.js`.
 *
 * Why: loading the tracker from `cloud.umami.is` makes it a cross-site
 * request, and Cloudflare (which fronts that host) attaches its bot-management
 * cookie to the response. Chrome flags that under the third-party cookie
 * phase-out, which Lighthouse reports as a Best Practices issue. Serving the
 * same script from our own origin removes the third-party request entirely.
 *
 * The tracker posts events to `https://gateway.umami.is/api/send` (baked into
 * the script, not derived from its own URL) with `credentials: 'omit'`, so no
 * cookies are set or sent for those requests either.
 *
 * Run `pnpm update:analytics` occasionally to pick up upstream fixes, then
 * commit the refreshed `public/umami.js`.
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const SOURCE_URL = 'https://cloud.umami.is/script.js';
const TARGET_PATH = join(process.cwd(), 'public/umami.js');

const response = await fetch(SOURCE_URL, { cache: 'no-store' });

if (!response.ok) {
  console.error(
    `Failed to fetch ${SOURCE_URL}: ${response.status} ${response.statusText}`,
  );
  process.exit(1);
}

const source = (await response.text()).trim();

if (!source.includes('gateway.umami.is')) {
  console.error(
    `Unexpected payload from ${SOURCE_URL} — the event gateway is missing. ` +
      `Upstream may have changed; inspect the response before vendoring it.`,
  );
  process.exit(1);
}

const stamp = new Date().toISOString().slice(0, 10);
const header = `// Umami tracker, vendored from ${SOURCE_URL} on ${stamp}.\n// Do not edit by hand — run \`pnpm update:analytics\` to refresh.\n`;

writeFileSync(TARGET_PATH, `${header}${source}\n`, 'utf8');

console.log(
  `Wrote public/umami.js (${source.length} bytes) from ${SOURCE_URL}`,
);
