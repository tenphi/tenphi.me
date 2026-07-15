/**
 * Build-time Bluesky data source for the social layer.
 *
 * Reads the public, unauthenticated `app.bsky.*` XRPC API so post pages can
 * render comments (replies), recommend/repost counts, and follower counts as
 * static HTML — no client JS, no runtime requests. Every call is wrapped so a
 * slow or failing API degrades gracefully (returns null) instead of breaking
 * the build.
 *
 * NOTE: `site.standard.graph.*` records have no public aggregator yet, so the
 * displayed social layer is sourced from the announcement Bluesky post's native
 * engagement. If a standard.site aggregator appears, swap the calls here — the
 * UI consumes the normalized shapes below and needs no changes.
 */
import { site } from '../config/site';

const API = site.bluesky.publicApi;
const TIMEOUT_MS = 8000;

export interface BlueskyReply {
  uri: string;
  authorHandle: string;
  authorName: string;
  authorAvatar: string | null;
  text: string;
  createdAt: string;
  url: string;
  likeCount: number;
  replyCount: number;
}

export interface BlueskyThread {
  postUrl: string;
  likeCount: number;
  repostCount: number;
  replyCount: number;
  quoteCount: number;
  replies: BlueskyReply[];
}

export interface BlueskyProfile {
  followersCount: number;
  profileUrl: string;
}

/** Turn an `at://did/app.bsky.feed.post/rkey` URI into a bsky.app permalink. */
function atUriToPostUrl(uri: string, handle: string): string {
  const rkey = uri.split('/').pop() ?? '';
  return `https://bsky.app/profile/${handle}/post/${rkey}`;
}

async function xrpc<T>(
  method: string,
  params: Record<string, string>,
): Promise<T | null> {
  const query = new URLSearchParams(params).toString();
  const url = `${API}/xrpc/${method}?${query}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { accept: 'application/json' },
      signal: controller.signal,
    });
    if (!res.ok) {
      console.warn(`[bluesky] ${method} responded ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.warn(`[bluesky] ${method} failed:`, (err as Error).message);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

interface ThreadPostView {
  uri: string;
  author: { handle: string; displayName?: string; avatar?: string };
  record: { text?: string; createdAt?: string };
  replyCount?: number;
  repostCount?: number;
  likeCount?: number;
  quoteCount?: number;
}

interface ThreadViewPost {
  post: ThreadPostView;
  replies?: ThreadViewPost[];
}

function normalizeReply(node: ThreadViewPost): BlueskyReply {
  const p = node.post;
  return {
    uri: p.uri,
    authorHandle: p.author.handle,
    authorName: p.author.displayName || p.author.handle,
    authorAvatar: p.author.avatar ?? null,
    text: p.record.text ?? '',
    createdAt: p.record.createdAt ?? '',
    url: atUriToPostUrl(p.uri, p.author.handle),
    likeCount: p.likeCount ?? 0,
    replyCount: p.replyCount ?? 0,
  };
}

/**
 * Fetch a post's thread + engagement counts. Replies are sorted oldest-first
 * and filtered to top-level replies (nested replies are omitted for a flat,
 * readable comment list). Returns null on any failure.
 */
export async function getPostThread(
  uri: string,
): Promise<BlueskyThread | null> {
  const data = await xrpc<{ thread: ThreadViewPost }>(
    'app.bsky.feed.getPostThread',
    { uri, depth: '1' },
  );
  const thread = data?.thread;
  if (!thread?.post) return null;

  const p = thread.post;
  const replies = (thread.replies ?? [])
    .filter((r) => r?.post?.record)
    .map(normalizeReply)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  return {
    postUrl: atUriToPostUrl(p.uri, p.author.handle),
    likeCount: p.likeCount ?? 0,
    repostCount: p.repostCount ?? 0,
    replyCount: p.replyCount ?? 0,
    quoteCount: p.quoteCount ?? 0,
    replies,
  };
}

const profileCache = new Map<string, BlueskyProfile | null>();

/**
 * Fetch the publication account's follower count. Cached per handle for the
 * duration of the build so pages don't refetch. Returns null on failure.
 */
export async function getProfile(
  handle: string = site.bluesky.handle,
): Promise<BlueskyProfile | null> {
  if (profileCache.has(handle)) return profileCache.get(handle) ?? null;

  const data = await xrpc<{ followersCount?: number }>(
    'app.bsky.actor.getProfile',
    { actor: handle },
  );
  const profile = data
    ? {
        followersCount: data.followersCount ?? 0,
        profileUrl: site.bluesky.profileUrl,
      }
    : null;
  profileCache.set(handle, profile);
  return profile;
}
