---
title: "Mutually exclusive selectors: CSS states that never conflict"
description: "Tasty compiles component states into mutually exclusive CSS selectors, so you can define and extend component styles confidently without specificity fights or source-order surprises."
date: 2026-04-21
tags: ["CSS", "CSS-in-JS", "Design Systems"]
---

Have you ever swapped two CSS lines and watched a button break in production?

```css
.btn:hover     { background: dodgerblue; }
.btn[disabled] { background: gray; }
```

Both selectors have specificity `(0, 1, 1)`. When the button is hovered **and** disabled, the last rule in source order wins. Swap the two lines and a hovered disabled button silently turns blue instead of gray. No linter catches it. No test flags it. The logic is correct; only the ordering is wrong.

Specificity fights are just the surface. The deeper problem is the **combinatorial explosion of real-world state logic**.

Consider dark mode alone: it might depend on a root attribute, an OS preference, or both. Each branch needs its own selector, its own negation guard, its own `@media` nesting. Now multiply that by hover, disabled, breakpoints, and container queries. Every new state doubles the combinations you have to get right. One edit, and you're rewriting selectors from scratch.

Some tools solve this by bailing out of CSS resolution entirely and resolving styles in JavaScript. That works, but it means giving up on the things CSS is actually great at. A different question is more interesting: how do you keep the full power of CSS and still eliminate the selector bookkeeping?

After several years and hundreds of iterations, the answer crystallized into [Tasty](https://tasty.style) — a CSS-in-JS engine that compiles component states into mutually exclusive selectors.

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

Every rule's selector is mutually exclusive with every other. No two rules can match the same element at the same time. Zero specificity arithmetic. Zero source-order tie-breakers.

On paper, that output looks straightforward. In practice, getting from simple modifiers to full modern CSS support took years.

## From idea to tool

Tasty started with simple string-based styles, then added boolean modifiers and static breakpoints. Getting from "works for simple cases" to "handles the full surface area of modern CSS" meant repeatedly redesigning the DSL, breaking the core model, and solving problems there was no paper or prior art for. For a long time, there was no proof the idea could even work at full scale.

The browser had to catch up too. Media queries, container queries, and more complex selector patterns only became practical building blocks for this approach relatively recently.

That deterministic resolution is the core idea. But Tasty is meant to be a practical design-system tool, not just a clever selector trick.

## Where Tasty fits

Tasty is built for long-lived component systems. If you're styling a tiny page, it may be more machinery than you need. But when components accumulate states, variants, themes, responsive behavior, and overrides, predictable resolution becomes a huge win.

Tasty is less about changing how you write CSS and more about making component state resolution predictable as your design system grows.

That also doesn't mean giving up performance or static rendering. Tasty powers my personal blog with a fully static build, and it powers the Tasty website built with Next.js. For small projects, that can be overkill. For maintainable ones, it compounds.

If you're comparing it to other styling tools, here's the short version:

<details>
<summary>How does Tasty compare to Tailwind, Panda CSS, and others?</summary>

**vs Tailwind** — Tasty styles are isolated and atomic, just like atomic CSS. But unlike Tailwind, each property carries a full state map with deterministic resolution. Tailwind shines for fast markup-driven styling; Tasty asks you to define components first, then compose. When a button juggles `hover`, `disabled`, `pressed`, `theme=danger`, and a responsive breakpoint all at once, Tailwind's conditional className logic gets unwieldy. Tasty handles that by construction.

**vs Panda CSS** — Panda is the closest comparison: both target the design-system layer with typed authoring and recipes. The key difference is focus. Panda optimizes for typed atomic generation with static analysis. Tasty optimizes for deterministic state resolution with mutually exclusive selectors. If your hardest problem is complex intersecting component states, Tasty has a more specialized answer.

**vs vanilla-extract / StyleX** — Both are excellent typed styling tools that operate closer to CSS semantics. vanilla-extract gives you TypeScript-native stylesheet files; StyleX gives you compiler-controlled atomic CSS. Tasty is more opinionated: a state-aware style compiler that removes selector bookkeeping from your hands entirely.

</details>

## How it works

### A DSL that maps to CSS — plus design tokens and syntax sugar

Tasty's style language uses CSS properties you already know, plus shorthand tokens that compile to CSS custom properties:

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

A few shorthands make declarations easier to read and write (`radius` instead of `border-radius`, `fill` instead of `background`). On top of that, tokens (`#primary`), design units (`2x`, `1r`), and state maps give you a compact vocabulary for expressing design-system constraints directly in component code.

### States that actually compose

Every style property accepts a state map with full boolean logic — pseudo-classes, data attributes, media queries, container queries, root states, and more:

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

You can define aliases to keep things clean:

```tsx
configure({
  states: {
    '@mobile': '@media(w < 768px)',
    '@dark': '@root(schema=dark)',
  },
});

// Now use @mobile and @dark everywhere
```

This is where mutually exclusive resolution shines brightest. Each state key in a property's map becomes a selector branch, and every branch is automatically guarded against all higher-priority branches. You declare *what* each state looks like; Tasty figures out the selectors so they never overlap.

Once state resolution is predictable, you can build higher-level component APIs on top of it.

### Typed component APIs

Design systems need to expose governed APIs, not raw style access. Tasty lets you open specific CSS properties, modifiers, and dynamic token values as typed React props:

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

From there, the same model extends beyond a single element.

### Sub-element styling

Compound components are handled from a single definition — inner parts are declared as capitalized keys:

```tsx
const Card = tasty({
  styles: {
    padding: '4x',
    fill: '#surface',

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

Every `tasty()` component is hook-free internally, which means it's a valid React Server Component without `'use client'`. In server-only contexts like Next.js RSC, Astro, or SSG, Tasty components produce **zero client JavaScript** while keeping the full feature set.

That matters because the same styling model carries through to how styles are delivered at runtime.

You only add `'use client'` when your component needs actual React interactivity — never because of styling.

```tsx
import { tasty } from '@tenphi/tasty';

const Card = tasty({
  styles: {
    padding: '4x',
    fill: '#surface',
    radius: '1r',
  },
  styleProps: ['padding', 'fill'],
});

export default function Page() {
  return <Card padding="6x">Server-rendered, zero client JS</Card>;
}
```

When your app also has client-side hydration, add an SSR integration layer (`@tenphi/tasty/ssr/next` or `@tenphi/tasty/ssr/astro`) for CSS batching, deduplication, and cache hydration. The components themselves remain unchanged.

### Three rendering modes

| Approach | Entry point | Best for |
|----------|-------------|----------|
| **Runtime** (default) | `tasty()` from `@tenphi/tasty` | All React apps — zero client JS until you need interactivity |
| **Runtime + SSR** | Add `@tenphi/tasty/ssr/*` | Apps with client-side hydration — FOUC prevention and cache transfer |
| **Zero-runtime** | `tastyStatic()` from `@tenphi/tasty/static` | Build-time CSS extraction without React runtime |

All three share the same DSL, tokens, and state semantics:

- **Runtime** works on both server and client with no configuration. When a component renders only on the server, no styling JS reaches the client.
- **Runtime + SSR** adds FOUC prevention and cache transfer for apps that also hydrate on the client.
- **Zero-runtime** uses a Babel plugin to replace `tastyStatic()` calls with plain class name strings at build time. It supports extension via `tastyStatic(base, overrides)` and includes a `withTastyZero` wrapper for Next.js.

## There's more

This post covers the core ideas. Tasty also supports:

- **At-rules as states** — `@media`, `@container`, `@supports`, and `@starting-style` all work inside state maps
- **Style & state extension** — extend or override styles from a parent component with full inheritance control
- **`:is()` / `:has()` selectors** — use complex CSS selectors as state conditions
- **Global configuration** — custom units, functions, tokens, and recipes via `configure()`
- **TypeScript augmentation** — type your design tokens for full autocomplete
- **SSR integrations** — first-class support for Next.js (App Router) and Astro with streaming-compatible CSS collection

[Read the docs](https://tasty.style/docs) — there's a whole language in there.

## The ecosystem

Tasty ships with a production-ready companion toolkit:

- **[ESLint plugin](https://github.com/tenphi/eslint-plugin-tasty)** — 28 lint rules catching invalid properties, bad tokens, and malformed states at lint time
- **[VS Code extension](https://github.com/tenphi/tasty-vscode-extension)** — syntax highlighting for tokens, units, and state keys
- **[Glaze](https://github.com/tenphi/glaze)** — OKHSL color theme generator with automatic WCAG contrast solving. One hue in, accessible light/dark/high-contrast palettes out
- **[Cube UI Kit](https://github.com/cube-js/cube-ui-kit)** — 100+ production React components built on Tasty, serving as both a reference implementation and a ready-to-use library. The same engine has powered [Cube Cloud](https://cube.dev/) in production for years

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

If you try Tasty, I'd love to hear what clicked, what felt awkward, and where the docs or examples fell short. That kind of feedback directly shapes what I build next — closing documentation gaps, writing better tutorials, and adding more useful examples.

If Tasty resonates with you, a [star on GitHub](https://github.com/tenphi/tasty) also helps more than you'd think.

**Links**: [Docs](https://tasty.style) | [GitHub](https://github.com/tenphi/tasty) | [npm](https://www.npmjs.com/package/@tenphi/tasty)
