/**
 * Publish the blog to the AT Protocol using standard.site lexicons.
 *
 * Pipeline (run via `pnpm publish:atproto`, after `pnpm build`):
 *   1. Load site config + non-draft blog posts.
 *   2. Load the existing manifest to recover previously assigned record keys
 *      and announcement-post refs (so AT-URIs stay stable and posts are never
 *      duplicated across runs).
 *   3. Authenticate to the PDS with a Bluesky app password.
 *   4. Upsert the `site.standard.publication` record (icon blob optional).
 *   5. For each post: create a one-time announcement `app.bsky.feed.post`, then
 *      upsert the `site.standard.document` record (cover blob optional,
 *      `bskyPostRef` attached).
 *   6. Write the manifest (`src/config/atproto-records.json`) and the
 *      verification file (`public/.well-known/site.standard.publication`).
 *
 * Required env (via `.env` or the shell):
 *   ATPROTO_HANDLE    - e.g. tenphi.bsky.social
 *   ATPROTO_PASSWORD  - a Bluesky app password (NOT the account password)
 *   ATPROTO_PDS       - optional PDS host override (default from site config)
 */
import {
  readFileSync,
  writeFileSync,
  existsSync,
  readdirSync,
  mkdirSync,
} from 'node:fs';
import { join, dirname } from 'node:path';
import matter from 'gray-matter';
import { AtpAgent, RichText } from '@atproto/api';
import { site } from '../src/config/site';
import { markdownToText } from '../src/utils/markdown-to-text';

const ROOT = process.cwd();
const BLOG_DIR = join(ROOT, 'src/content/blog');
const MANIFEST_PATH = join(ROOT, 'src/config/atproto-records.json');
const WELL_KNOWN_PATH = join(
  ROOT,
  'public/.well-known/site.standard.publication',
);
const OG_DIR = join(ROOT, 'dist/og/blog');

const PUBLICATION_COLLECTION = 'site.standard.publication';
const DOCUMENT_COLLECTION = 'site.standard.document';

interface DocumentEntry {
  rkey: string;
  atUri: string;
  bskyPost?: { uri: string; cid: string };
}

interface Manifest {
  did: string | null;
  publication: { rkey: string; atUri: string } | null;
  documents: Record<string, DocumentEntry>;
}

interface Post {
  slug: string;
  title: string;
  description: string;
  date: Date;
  updatedAt?: Date;
  tags: string[];
  body: string;
}

function loadEnv(): void {
  try {
    // Node >= 22.6
    (process as unknown as { loadEnvFile: (p: string) => void }).loadEnvFile(
      join(ROOT, '.env'),
    );
  } catch {
    // No .env file or unsupported; rely on shell env.
  }
}

function loadManifest(): Manifest {
  if (existsSync(MANIFEST_PATH)) {
    try {
      return JSON.parse(readFileSync(MANIFEST_PATH, 'utf8')) as Manifest;
    } catch {
      // Fall through to a fresh manifest on parse errors.
    }
  }
  return { did: null, publication: null, documents: {} };
}

function loadPosts(): Post[] {
  return readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.md') || f.endsWith('.mdx'))
    .map((file) => {
      const raw = readFileSync(join(BLOG_DIR, file), 'utf8');
      const { data, content } = matter(raw);
      return {
        slug: file.replace(/\.mdx?$/, ''),
        title: String(data.title ?? ''),
        description: String(data.description ?? ''),
        date: new Date(data.date),
        updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
        tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
        body: content,
        draft: Boolean(data.draft),
      };
    })
    .filter((p) => !(p as Post & { draft: boolean }).draft)
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}

function rkeyFromUri(uri: string): string {
  return uri.split('/').pop() ?? '';
}

async function main(): Promise<void> {
  loadEnv();

  const identifier = process.env.ATPROTO_HANDLE || site.bluesky.handle;
  const password = process.env.ATPROTO_PASSWORD;
  const pdsHost = process.env.ATPROTO_PDS || site.bluesky.pdsHost;

  if (!password) {
    console.error(
      'Missing ATPROTO_PASSWORD. Set a Bluesky app password in .env or the shell.',
    );
    process.exit(1);
  }

  const agent = new AtpAgent({ service: pdsHost });
  await agent.login({ identifier, password });
  const did = agent.session?.did;
  if (!did) {
    console.error('Login succeeded but no DID was returned.');
    process.exit(1);
  }
  console.log(`Authenticated as ${identifier} (${did})`);

  const manifest = loadManifest();
  manifest.did = did;

  // Upload/create a record; reuse rkey from the manifest when present.
  async function upsert(
    collection: string,
    rkey: string | undefined,
    record: Record<string, unknown>,
  ): Promise<{ uri: string; rkey: string }> {
    if (rkey) {
      const res = await agent.com.atproto.repo.putRecord({
        repo: did!,
        collection,
        rkey,
        record: { $type: collection, ...record },
      });
      return { uri: res.data.uri, rkey };
    }
    const res = await agent.com.atproto.repo.createRecord({
      repo: did!,
      collection,
      record: { $type: collection, ...record },
    });
    return { uri: res.data.uri, rkey: rkeyFromUri(res.data.uri) };
  }

  async function uploadImage(
    path: string,
    encoding: string,
  ): Promise<unknown | null> {
    if (!existsSync(path)) return null;
    const bytes = new Uint8Array(readFileSync(path));
    const res = await agent.uploadBlob(bytes, { encoding });
    return res.data.blob;
  }

  // --- Publication ---------------------------------------------------------
  const iconBlob = await uploadImage(join(ROOT, site.iconPath), 'image/png');
  if (!iconBlob) {
    console.warn(
      `No publication icon at ${site.iconPath} (optional; add a >=256x256 PNG to include one).`,
    );
  }

  const publicationRecord: Record<string, unknown> = {
    url: site.url,
    name: site.publicationName,
    description: site.publicationDescription,
    preferences: { showInDiscover: site.showInDiscover },
    ...(iconBlob ? { icon: iconBlob } : {}),
  };

  const pub = await upsert(
    PUBLICATION_COLLECTION,
    manifest.publication?.rkey,
    publicationRecord,
  );
  manifest.publication = { rkey: pub.rkey, atUri: pub.uri };
  console.log(`Publication: ${pub.uri}`);

  // --- Documents -----------------------------------------------------------
  const posts = loadPosts();
  for (const post of posts) {
    const existing = manifest.documents[post.slug];
    const canonicalUrl = `${site.url}/blog/${post.slug}/`;
    const coverPath = join(OG_DIR, `${post.slug}.png`);

    // One-time announcement post.
    let bskyPost = existing?.bskyPost;
    if (!bskyPost) {
      const thumb = await uploadImage(coverPath, 'image/png');
      const rt = new RichText({ text: `${post.title}\n\n${canonicalUrl}` });
      await rt.detectFacets(agent);
      const external: Record<string, unknown> = {
        uri: canonicalUrl,
        title: post.title,
        description: post.description,
        ...(thumb ? { thumb } : {}),
      };
      const created = await agent.post({
        text: rt.text,
        facets: rt.facets,
        embed: { $type: 'app.bsky.embed.external', external },
        createdAt: new Date().toISOString(),
      });
      bskyPost = { uri: created.uri, cid: created.cid };
      console.log(`Announced "${post.title}": ${created.uri}`);
    }

    const coverBlob = await uploadImage(coverPath, 'image/png');
    const documentRecord: Record<string, unknown> = {
      site: manifest.publication.atUri,
      path: `/blog/${post.slug}/`,
      title: post.title,
      description: post.description,
      publishedAt: post.date.toISOString(),
      updatedAt: (post.updatedAt ?? post.date).toISOString(),
      tags: post.tags,
      textContent: markdownToText(post.body),
      bskyPostRef: { uri: bskyPost.uri, cid: bskyPost.cid },
      ...(coverBlob ? { coverImage: coverBlob } : {}),
    };

    const doc = await upsert(
      DOCUMENT_COLLECTION,
      existing?.rkey,
      documentRecord,
    );
    manifest.documents[post.slug] = {
      rkey: doc.rkey,
      atUri: doc.uri,
      bskyPost,
    };
    console.log(`Document "${post.title}": ${doc.uri}`);
  }

  // --- Outputs -------------------------------------------------------------
  writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
  mkdirSync(dirname(WELL_KNOWN_PATH), { recursive: true });
  writeFileSync(WELL_KNOWN_PATH, `${manifest.publication.atUri}\n`);

  console.log('\nWrote manifest and .well-known verification file.');
  console.log('Run `pnpm build` again to render the social layer.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
