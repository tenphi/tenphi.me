---
title: "Deterministic CSS resolution for confidently defining and extending component styles"
description: "Tasty resolves component states predictably, so you can extend styles without specificity bugs, selector bookkeeping, or cascade fights."
date: 2026-04-21
tags: ["CSS", "CSS-in-JS", "Design Systems"]
---

Have you ever swapped two CSS lines and watched a button break in production?

```css
.btn:hover     { background: dodgerblue; }
.btn[disabled] { background: gray; }
```

Both selectors have specificity `(0, 1, 1)`. When the button is hovered **and** disabled, the last rule in source order wins. Swap the two lines — and a hovered disabled button silently turns blue instead of gray. No linter catches it. No test flags it. The logic is correct; only the ordering is wrong.

But specificity fights are just the surface. The deeper problem is **authoring real-world state logic in CSS at all**. Dark mode alone might depend on a root attribute, an OS preference, or both — each branch with its own selector, negation, and `@media` nesting. Add hover, disabled, breakpoints, container queries — each new state multiplies the combinations. One edit, and you're rewriting selectors from scratch.

Some modern tools solve this by bailing out of CSS resolution entirely and resolving styles in JavaScript. That works — but it means giving up on the things CSS is actually great at. I asked myself a different question: how do you keep all the power of CSS — attribute selectors, media queries, container queries, `:has()`, `@supports`, `@starting-style` — and still eliminate the selector bookkeeping?

It was a fascinating but challenging journey — there was no paper to follow, no prior art to lean on, and for a long time no proof the idea could even work at full scale.

I started with simple string-based style declarations, then added boolean modifiers and static responsive breakpoints — already a big DX win on its own. But getting from "this works for simple cases" to "this covers modern CSS" took years — refining the DSL, breaking the core model, inventing workarounds for problems nobody had run into before.

The browser had to catch up, too. The approach relied on complex selectors and media/container queries that only landed widely around 2023, so for years the platform itself wasn't ready for what the engine needed to emit.

After several years and hundreds of iterations, all the pieces finally came together and crystallized into a tool I had always dreamed of building. I called it [Tasty](https://tasty.style) — a deterministic CSS-in-JS engine that compiles component states into mutually exclusive selectors.

## The 30-second pitch

Instead of writing selectors that *compete* through cascade and specificity, you declare a **state map** — and Tasty compiles it into selectors where exactly one branch wins by construction:

```tsx
import { tasty } from '@tenphi/tasty';

const Button = tasty({
  as: 'button',
  styles: {
    fill: {
      '': '#primary',
      ':hover': '#primary-hover',
      ':active': '#primary-pressed',
      '[disabled]': '#surface',
    },
    color: {
      '': '#primary-text',
      '[disabled]': '#text.40',
    },
    cursor: {
      '': 'pointer',
      '[disabled]': 'not-allowed',
    },
  },
});
```

`[disabled]` always wins over `:hover` and `:active`. Not because of source order — because the generated selectors are **mutually exclusive**. Here's what Tasty actually emits for the `fill` property:

```css
/* [disabled] — highest priority, no guards needed */
.t0[disabled]                                { background: var(--surface-color); }
/* :active — guarded against disabled */
.t0:active:not([disabled])                   { background: var(--primary-pressed-color); }
/* :hover — guarded against :active and disabled */
.t0:hover:not(:active):not([disabled])       { background: var(--primary-hover-color); }
/* default — guarded against everything above */
.t0:not(:hover):not(:active):not([disabled]) { background: var(--primary-color); }
```

Every rule's selector is mutually exclusive with every other. No two rules can match the same element at the same time. Zero specificity arithmetic. Zero source-order tie-breakers. **For these state branches, the outcome is decided before the browser has to break a tie.**

## What makes Tasty tick

### A DSL that feels like CSS (but isn't fighting you)

Tasty's style language maps directly to CSS properties you already know. But values like `2x`, `#primary`, and `1r` are tokens and units that resolve to CSS custom properties:

```tsx
const Card = tasty({
  styles: {
    display: 'flex',
    flow: 'column',
    padding: '4x',          // → calc(var(--gap) * 4)
    gap: '2x',              // → calc(var(--gap) * 2)
    fill: '#surface',       // → var(--surface-color)
    radius: '1r',           // → var(--radius)
    border: '1bw solid #border',
  },
});
```

The properties are CSS you already know — plus a few shorthands that make declarations easier to read and write (`radius` instead of `border-radius`, `fill` instead of `background`). The new part is tokens (`#primary`), design units (`2x`, `1r`), and state maps — a handful of concepts that unlock the rest.

### States that actually compose

Every style property accepts a state map with full boolean logic — pseudo-classes, data attributes, media queries, container queries, root states, parent states, and more:

```tsx
const Panel = tasty({
  styles: {
    flow: {
      '': 'column',
      '@media(w >= 768px)': 'row',
    },
    fill: {
      '': '#surface',
      'theme=danger & :hover': '#danger-hover',
      '@root(schema=dark)': '#surface-dark',
    },
    padding: {
      '': '4x',
      '@(sidebar, w < 300px)': '2x',  // container query!
    },
  },
});
```

And you can define aliases to keep things clean:

```tsx
configure({
  states: {
    '@mobile': '@media(w < 768px)',
    '@dark': '@root(schema=dark)',
  },
});

// Now use @mobile and @dark everywhere
```

### Typed component APIs with Style Props, Mod Props, and Token Props

Design systems need to expose *governed* APIs, not raw style access. Tasty lets you open specific CSS properties, modifiers, and dynamic token values as typed React props:

```tsx
const Space = tasty({
  styles: { display: 'flex', flow: 'column', gap: '1x' },
  styleProps: ['flow', 'gap', 'placeItems'],
});

const Button = tasty({
  as: 'button',
  modProps: { isLoading: Boolean, size: ['sm', 'md', 'lg'] as const },
  styles: {
    fill: { '': '#primary', isLoading: '#primary.5' },
    padding: { '': '2x 4x', 'size=sm': '1x 2x' },
  },
});

const ProgressBar = tasty({
  tokenProps: ['progress'] as const,
  styles: {
    height: '1x',
    fill: '#surface',
    Bar: { width: '$progress', height: '100%', fill: '#primary' },
  },
  elements: { Bar: 'div' },
});

// Consumers get typed, constrained APIs:
<Space flow="row" gap="2x" placeItems="center">
  <Button isLoading size="lg">Submit</Button>
  <ProgressBar progress="75%" />
</Space>
```

Full TypeScript autocomplete. Customization stays inside the component API.

### Sub-element styling

Compound components? Tasty handles inner parts from a single definition:

```tsx
const Card = tasty({
  styles: {
    padding: '4x',
    fill: '#surface',

    // Sub-elements via capitalized keys
    Title: { preset: 'h3', color: '#text' },
    Body: { flow: 'column', gap: '2x' },
    Footer: {
      border: 'top',
      padding: '2x top',
    },
  },
  elements: {
    Title: 'h3',
    Body: 'div',
    Footer: 'div',
  },
});

// Auto-generated typed sub-components:
<Card>
  <Card.Title>Hello</Card.Title>
  <Card.Body>Content here</Card.Body>
  <Card.Footer>Actions</Card.Footer>
</Card>
```

### Server components by default

Every `tasty()` component and style function is hook-free — they use `computeStyles()` internally, a synchronous, framework-agnostic function with no React hooks. That means every Tasty component is a valid React Server Component without `'use client'`.

In server-only contexts — Next.js RSC, Astro without `client:*` directives, SSG — `tasty()` components produce **zero client JavaScript** while keeping the full feature set: style props, mod props, sub-elements, variants, everything.

You only add `'use client'` when your component needs actual React interactivity (state, effects, event handlers) — never because of styling.

```tsx
// This is a valid React Server Component — no 'use client' needed
import { tasty } from '@tenphi/tasty';

const Card = tasty({
  styles: {
    padding: '4x',
    fill: '#surface',
    radius: '1r',
  },
  styleProps: ['padding', 'fill'],
});

// Zero JS shipped to the client for this component
export default function Page() {
  return <Card padding="6x">Server-rendered, zero client JS</Card>;
}
```

When your app also has client-side hydration (Next.js client components, Astro islands), add an SSR integration layer (`@tenphi/tasty/ssr/next` or `@tenphi/tasty/ssr/astro`) for CSS batching, deduplication, and cache hydration. But the components themselves remain unchanged.

### Three rendering modes

Choose what fits your project:

| Approach | Entry point | Best for |
|----------|-------------|----------|
| **Runtime** (default) | `tasty()` from `@tenphi/tasty` | All React apps — server-rendered by default, zero client JS until you need interactivity |
| **Runtime + SSR** | Add `@tenphi/tasty/ssr/*` | Apps with client-side hydration — adds CSS batching, deduplication, and cache hydration |
| **Zero-runtime** | `tastyStatic()` from `@tenphi/tasty/static` | Build-time CSS extraction without React runtime |

All three share the same DSL, tokens, and state semantics. The default runtime mode works on both server and client with no configuration — and when a component renders only on the server, no styling JS reaches the client at all. The SSR integration layer is only needed when your app also hydrates on the client — it adds FOUC prevention and cache transfer. The zero-runtime mode is for build-time extraction without a React runtime; a Babel plugin replaces `tastyStatic()` calls with plain class name strings. Static styles also support extension via `tastyStatic(base, overrides)` and work with any Babel-based setup, including a `withTastyZero` wrapper for Next.js.

## Where Tasty fits

Tasty isn't competing with styled-components or Emotion. It operates at a different layer — not *how you write CSS*, but **how your design system resolves state conflicts**.

- **Direct styling** (Tailwind, Emotion, Stitches) — fast authoring, good DX
- **Typed styling engines** (Panda CSS, vanilla-extract, StyleX) — structure, types, build-time CSS
- **Design-system engines** (**Tasty**) — governed styling model, deterministic state resolution, works in server components without `'use client'`

Unlike most CSS-in-JS libraries that force a `'use client'` boundary, Tasty components work as React Server Components out of the box — no client JavaScript for styling unless your component actually needs interactivity.

<details>
<summary>How does Tasty compare to Tailwind, Panda CSS, and others?</summary>

**vs Tailwind** — Tasty styles are isolated and atomic — just like atomic CSS. But unlike Tailwind, each property carries a full state map with deterministic resolution. Tailwind shines for fast markup-driven styling. Tasty asks you to define components first, then compose. A bit more upfront work — but when a button juggles `hover`, `disabled`, `pressed`, `theme=danger`, and a responsive breakpoint all at once, Tailwind's conditional className logic starts to buckle. Tasty handles that by construction.

**vs Panda CSS** — Panda is the closest comparison — both target the design-system layer with typed authoring and recipes. The key difference: **Panda optimizes for typed atomic generation with static analysis.** Tasty optimizes for **deterministic state resolution with mutually exclusive selectors.** If your hardest problem is complex intersecting component states, Tasty has a more specialized answer.

**vs vanilla-extract / StyleX** — Both are excellent typed styling tools, but they operate closer to CSS semantics. vanilla-extract gives you TypeScript-native stylesheet files; StyleX gives you compiler-controlled atomic CSS. Tasty is more opinionated — it's a state-aware style compiler that removes the selector bookkeeping from your hands entirely.

</details>

## There's more

This post covers the basics. Tasty also supports:

- **At-rules as states** — `@media`, `@container`, `@supports`, and `@starting-style` all work inside state maps
- **Style & state extension** — extend or override styles from a parent component with full inheritance control
- **`:is()` / `:has()` selectors** — use complex CSS selectors as state conditions
- **Global configuration** — custom units, functions, tokens, and recipes via `configure()`
- **TypeScript augmentation** — type your design tokens for full autocomplete
- **SSR integrations** — first-class support for Next.js (App Router) and Astro with streaming-compatible CSS collection and zero-cost hydration

[Read the docs](https://tasty.style/docs) — there's a whole language in there.

## The ecosystem

Tasty ships with a production-ready companion toolkit:

- **[ESLint plugin](https://github.com/tenphi/eslint-plugin-tasty)** — 28 lint rules catching invalid properties, bad tokens, and malformed states *at lint time*
- **[VS Code extension](https://github.com/tenphi/tasty-vscode-extension)** — syntax highlighting for tokens, units, and state keys
- **[Glaze](https://github.com/tenphi/glaze)** — OKHSL color theme generator with automatic WCAG contrast solving. One hue in, accessible light/dark/high-contrast palettes out
- **[Cube UI Kit](https://github.com/cube-js/cube-ui-kit)** — 100+ production React components built on Tasty. It serves as both a reference implementation and a ready-to-use library, and the same engine has powered [Cube Cloud](https://cube.dev/) in production for years

## Performance

- **~50 kB** bundle (minified + brotli, runtime + SSR)
- Cached operations: **sub-microsecond** (effectively free after first render)
- Cold path: **~46 μs** for the heaviest operation (complex state map with media queries)

Multi-level LRU caching gives you 30x–100x speedups on repeat renders. Even on budget phones, the heaviest cold operation stays under 200 μs.

## Getting started

```bash
pnpm add @tenphi/tasty
```

```tsx
import { tasty } from '@tenphi/tasty';

const Badge = tasty({
  as: 'span',
  styles: {
    display: 'inline-flex',
    padding: '0.5x 1.5x',
    fill: '#white',
    color: '#black',
    radius: 'round',
    preset: 't3',
  },
});

export default function App() {
  return <Badge>New</Badge>;
}
```

No config file. No build plugin. Just React.

---

**Try it now** — the [playground](https://tasty.style/playground) runs in your browser, no install needed.

If Tasty resonates with you, a [star on GitHub](https://github.com/tenphi/tasty) helps more than you'd think.

**Links**: [Docs](https://tasty.style) | [GitHub](https://github.com/tenphi/tasty) | [npm](https://www.npmjs.com/package/@tenphi/tasty)
