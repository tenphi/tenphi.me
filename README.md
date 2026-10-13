# tenphi.me

Personal website and blog for Andrey Yamanov — [https://tenphi.me](https://tenphi.me)

Built with [Astro](https://astro.build), [React](https://react.dev), [@tenphi/tasty](https://github.com/tenphi/tasty) (CSS-in-JS), and [@tenphi/glaze](https://github.com/tenphi/glaze) (OKHSL color theme generator).

## Pages

- **Home** (`/`) — Bio, project highlights (Tasty, Glaze), social links, recent posts
- **Blog** (`/blog`) — Posts written in Markdown (Astro Content Collections)
- **Portfolio** (`/portfolio`) — Featured projects
- **RSS** (`/rss.xml`) — Feed for blog posts

## Stack

| Area | Technology |
|---|---|
| Framework | Astro 6 (static output) |
| UI | React 19 (SSR only, no client JS islands) |
| Styling | `@tenphi/tasty` — CSS-in-JS with design tokens |
| Color theme | `@tenphi/glaze` — OKHSL-based light/dark with WCAG contrast |
| Content | Astro Content Layer + Markdown |
| Code highlighting | Shiki with custom Tasty grammar |
| OG images | Satori + resvg |
| Icons | Tabler Icons |
| Lint/Format | ESLint 10 + Prettier |
| Language | TypeScript 5 |
| Package manager | pnpm 10 |
| Hosting | GitHub Pages |

Internal navigation uses Astro's client router, loaded on link hover, focus,
pointer press, or click. The initial page only loads a small navigation bootstrap;
React components remain rendered at build time. Appearance preferences are
restored before each page swap, and blog previews reinitialize after navigation.
Client navigation swaps the prepared page without snapshot fades or morphs, so
article text stays sharp and the outgoing page remains visible while loading.
External links, downloads, modified clicks, and `data-astro-reload` links retain
their browser behavior. Without JavaScript, navigation uses ordinary page loads.

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:4321](http://localhost:4321).

## Scripts

| Command | Purpose |
|---|---|
| `pnpm dev` | Start dev server |
| `pnpm build` | Build static site to `dist/` |
| `pnpm preview` | Preview production build locally |
| `pnpm lint` | Lint source files |
| `pnpm lint:fix` | Lint and auto-fix |
| `pnpm format` | Format with Prettier |
| `pnpm format:check` | Check formatting |
| `pnpm hygiene` | Run lint + format check |
| `pnpm hygiene:fix` | Auto-fix lint + format |

## Deployment

Pushes to `main` trigger a GitHub Actions workflow that runs `pnpm hygiene`, builds the site, and deploys to GitHub Pages.

## License

All rights reserved.
