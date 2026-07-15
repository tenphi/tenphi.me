# AGENTS.md — tenphi.me

## Project Overview

Personal website and blog for Andrey Yamanov at [https://tenphi.me](https://tenphi.me). Fully static Astro 6 site with React components rendered at build time — no client-side JavaScript shipped (except a small inline theme-persistence script).

Repository: <https://github.com/tenphi/tenphi.me>

## Quick Reference

| Command | Purpose |
|---|---|
| `pnpm dev` | Start Astro dev server |
| `pnpm build` | Build static site to `dist/` |
| `pnpm preview` | Preview production build locally |
| `pnpm lint` | Lint source files |
| `pnpm lint:fix` | Lint and auto-fix |
| `pnpm format` | Format with Prettier |
| `pnpm format:check` | Check formatting |
| `pnpm hygiene` | Run lint + format check |
| `pnpm hygiene:fix` | Auto-fix lint + format |

## Before Pushing Changes

1. **Lint** — Run `pnpm lint`. Fix errors before proceeding.
2. **Format** — Run `pnpm format` so committed code matches Prettier output.
3. **Build** — Run `pnpm build` to verify the site builds without errors.
4. **Push** — Do not push to `main` directly. Push feature branches with `git push -u origin HEAD`.

## Stack

- **Framework**: Astro 6 — static output, zero client JS by default
- **UI**: React 19 via `@astrojs/react` — SSR only, no `client:*` directives
- **Styling**: `@tenphi/tasty` — CSS-in-JS with design tokens, state-aware styles
- **Color theme**: `@tenphi/glaze` — OKHSL-based theme generator with WCAG contrast solving
- **Content**: Astro Content Layer with Markdown (`src/content/blog/`)
- **Code highlighting**: Shiki with custom theme (`src/lib/shiki-theme.ts`) and Tasty grammar (`src/lib/tasty.tmLanguage.json`)
- **OG images**: Satori + resvg — dynamic Open Graph images at `/og/`
- **RSS**: `@astrojs/rss`
- **Sitemap**: `@astrojs/sitemap`
- **Icons**: `@tabler/icons-react`
- **Language**: TypeScript (strict mode)
- **Lint**: ESLint 10 + typescript-eslint + `@tenphi/eslint-plugin-tasty` + Prettier
- **Format**: Prettier + `prettier-plugin-astro`
- **Runtime**: Node >= 22, pnpm 10

## Documentation

Package docs are symlinked at the repo root for easy reference:

| Path | Target |
|---|---|
| `docs/glaze/` | `node_modules/@tenphi/glaze/docs` — Glaze API, OKHST, methodology, migration |
| `docs/tasty/` | `node_modules/@tenphi/tasty/docs` — Tasty DSL, configuration, React API, SSR, pipeline |

Consult these when working on theming (`src/config/theme.ts`), styling, or Tasty/Glaze integration.

## Project Structure

```
docs/
  glaze/                  Symlink → node_modules/@tenphi/glaze/docs
  tasty/                  Symlink → node_modules/@tenphi/tasty/docs

scripts/
  publish-atproto.ts      standard.site publisher (records + announcement posts)

src/
  config/
    theme.ts              Glaze color theme definition (hue, saturation, semantic colors)
    tasty.ts              configure() call — tokens, states, presets (imports theme)
    site.ts               Central site + AT Protocol identity config
    atproto-records.json  Generated manifest (rkeys + bskyPost refs); committed

  content.config.ts       Blog collection schema (Content Layer, glob loader)
  content/blog/           Markdown blog posts

  layouts/
    BaseLayout.astro      HTML shell — <head>, meta, OG, JSON-LD, fonts, theme script

  pages/
    index.astro           Home page — bio, projects, recent posts
    portfolio.astro       Portfolio / projects page
    blog/
      index.astro         Blog listing (newest first)
      [...slug].astro     Individual blog post
    rss.xml.ts            RSS feed endpoint
    og/
      default.png.ts      Default OG image
      blog/[...slug].png.ts  Per-post OG image

  components/
    Header.tsx            Site header with nav + theme switcher
    Footer.tsx            Site footer
    GlobalStyles.tsx      useGlobalStyles + useRawCSS (reset, typography, body)
    PostCard.tsx          Blog post card for listings
    PostList.tsx          Blog post list wrapper
    ProjectCard.tsx       Portfolio project card
    ArticleContent.tsx    Markdown article content styles
    ThemeSwitcher.tsx     Light/dark theme toggle (inline script for persistence)
    EngagementBar.tsx     Build-time Bluesky like/repost/reply counts + follow
    BlueskyComments.tsx   Build-time Bluesky reply thread (SSR, no client JS)
    ui/
      Container.tsx       Max-width centered wrapper
      Stack.tsx           Flex stack (direction + gap)
      Text.tsx            Typography component with preset support
      Link.tsx            Styled anchor with hover states
      Tag.tsx             Tag/badge component
      Divider.tsx         Horizontal rule

  lib/
    og-image.ts           Satori OG image generation utility
    shiki-theme.ts        Custom Shiki syntax theme
    tasty.tmLanguage.json TextMate grammar for Tasty DSL syntax highlighting
    bluesky.ts            Build-time public Bluesky API reader (social layer)

  utils/
    markdown-to-text.ts   Markdown -> plaintext for document textContent
```

## Styling Approach

All styling uses runtime `tasty()` components — no `tastyStatic`. The Astro integration (`tastyIntegration({ islands: false })`) collects styles at build time and inlines them as CSS. No style-related JavaScript reaches the client.

### Color System

Colors are generated by `@tenphi/glaze` in `src/config/theme.ts`:

- `glaze(hue, saturation)` creates a theme seed
- `.colors({...})` defines semantic roles with contrast constraints (e.g., `contrast: 'AAA'`)
- `.tasty()` exports tokens in Tasty's format with automatic dark mode variants
- Dark mode is handled via `prefers-color-scheme` media query + a `ThemeSwitcher` that persists choice to `localStorage`

### Token Mapping

| Tasty token | Usage |
|---|---|
| `#surface` | Page background |
| `#surface-2` | Code blocks, subtle backgrounds |
| `#text` | Primary text |
| `#text-soft` | Secondary text, metadata |
| `#border` | Borders, dividers |
| `#accent-text` | Links, accent text |
| `#accent-text-hover` | Link hover state |

### State Aliases

| Alias | Resolves to |
|---|---|
| `@mobile` | `@media(w < 640px)` |
| `@tablet` | `@media(640px <= w < 1024px)` |
| `@desktop` | `@media(w >= 1024px)` |
| `@dark` | `@media(prefers-color-scheme: dark)` |

## Content

Blog posts are Markdown files in `src/content/blog/`. Each file requires frontmatter:

```yaml
---
title: "Post Title"
description: "Short description for listings and SEO."
date: 2026-04-07
tags: ["tag1", "tag2"]
draft: false
---
```

- `draft: true` posts are excluded from production builds
- Tags are optional
- Reading time is computed automatically via the `reading-time` package

## Pages

| Route | Source | Description |
|---|---|---|
| `/` | `pages/index.astro` | Home — bio, project highlights, recent posts |
| `/blog` | `pages/blog/index.astro` | Blog listing, newest first |
| `/blog/[slug]` | `pages/blog/[...slug].astro` | Individual blog post |
| `/portfolio` | `pages/portfolio.astro` | Projects showcase |
| `/rss.xml` | `pages/rss.xml.ts` | RSS feed |
| `/og/default.png` | `pages/og/default.png.ts` | Default OG image |
| `/og/blog/[slug].png` | `pages/og/blog/[...slug].png.ts` | Per-post OG image |

## SEO

- Per-page `<title>`, `<meta description>`, `<link rel="canonical">`
- Open Graph and Twitter Card meta tags
- JSON-LD structured data (Person on home, BlogPosting on posts)
- `robots.txt` + auto-generated `sitemap.xml`
- RSS feed with `<link rel="alternate">` in `<head>`

## AT Protocol / standard.site

The blog is wired into [standard.site](https://standard.site) lexicons on the AT Protocol (identity: `tenphi.bsky.social`). See [`src/config/site.ts`](src/config/site.ts) for the single source of identity/config.

- **Records** — `pnpm publish:atproto` ([`scripts/publish-atproto.ts`](scripts/publish-atproto.ts)) upserts a `site.standard.publication` record and one `site.standard.document` record per non-draft post, and creates a one-time announcement Bluesky post per article (`bskyPostRef`). Record keys and post refs are persisted in [`src/config/atproto-records.json`](src/config/atproto-records.json) (committed) so AT-URIs stay stable and posts are never duplicated.
- **Verification** — `public/.well-known/site.standard.publication` (generated by the script) returns the publication AT-URI; each post page emits `<link rel="site.standard.document" href="at://...">` via `BaseLayout` + the manifest lookup in `blog/[...slug].astro`.
- **Social layer (build-time, zero client JS)** — [`src/lib/bluesky.ts`](src/lib/bluesky.ts) reads the public Bluesky API at build time; post pages render comments (replies), recommend/repost counts, and a follow affordance via `EngagementBar` + `BlueskyComments`. It's a per-deploy snapshot and degrades to a "Discuss on Bluesky" link on API failure or when a post has no announcement yet.

### Credentials

Copy `.env.example` to `.env` (gitignored) and set `ATPROTO_HANDLE` + `ATPROTO_PASSWORD` (a Bluesky **app password**, not the account password). Optional `ATPROTO_PDS` for self-hosted PDS.

### Publish / deploy sequence

Because cover images are build-generated and comments come from the announcement post, a full publish runs in three phases:

1. `pnpm build` — generate OG/cover images into `dist/og/blog/`.
2. `pnpm publish:atproto` — upsert records, create announcement posts, write manifest + well-known file.
3. `pnpm build` — second build renders the social layer + verification tags into the final `dist/`.

Local dev without credentials works with whatever is already in the committed manifest.

## CI/CD

- **GitHub Actions** — on push to `main`: lint, format check (`pnpm hygiene`), build, deploy to GitHub Pages
- Output: `dist/` uploaded as a Pages artifact

## Code Conventions

- TypeScript strict mode
- Functional components only — `tasty()` factory + hooks
- Astro pages (`.astro`) compose React components for layout and styling
- No `client:*` directives — everything renders at build time
- All style values use Tasty DSL — design tokens (`#color`, `$token`), custom units (`2x`, `1r`), state maps
- Follow existing Prettier config: use `prettier-plugin-astro` for `.astro` files
