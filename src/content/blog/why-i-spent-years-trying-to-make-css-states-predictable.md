---
title: "Why I spent years trying to make CSS states predictable"
description: "Why predictable CSS state resolution matters, and how Tasty approaches it with state maps and non-overlapping selectors."
date: 2026-04-22
tags: ["CSS", "CSS-in-JS", "Design Systems"]
---

Have you ever changed the order of two CSS rules and broken a component without changing the logic?

```css
.btn:hover     { background: dodgerblue; }
.btn[disabled] { background: gray; }
```

Both selectors have specificity `(0, 1, 1)`. When a button is both hovered and disabled, the browser falls back to source order. If the `:hover` rule comes last, the disabled button turns blue. If the `[disabled]` rule comes last, it stays gray.

That sounds small, but it points to a bigger problem: component state in CSS often works by overlap.

As long as a component has only one or two states, that overlap feels manageable. Once you add `:hover`, `:active`, `disabled`, dark mode, breakpoints, data attributes, container queries, and overrides, it stops feeling manageable very quickly. You are no longer just writing styles. You are maintaining a resolution system in your head.

That was the problem I kept running into while building component systems. Not on toy examples, but on real buttons, inputs, panels, dropdowns, and design-system primitives. The hardest part was not writing the first version of a component. It was extending it later without reopening the entire state-resolution problem.

At some point I stopped asking, "How do I write this selector?" and started asking a better question:

**What if component state could be expressed declaratively, while the compiler handled the selector logic needed to make it deterministic?**

That question eventually became [Tasty](https://tasty.style).

## The idea in one minute

Instead of writing selectors that compete through cascade and specificity, I wanted to describe a property's possible states as a map:

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
  },
});
```

Applied in order of priority, this means:

- when disabled use `#surface`
- otherwise, on active use `#primary-pressed`
- otherwise, on hover use `#primary-hover`
- otherwise use `#primary`

The important part is what happens next.

Tasty compiles that state map into selectors that cannot overlap:

```css
/* [disabled] wins outright */
.t0[disabled]                                { background: var(--surface-color); }
/* :active is excluded when disabled */
.t0:active:not([disabled])                   { background: var(--primary-pressed-color); }
/* :hover is excluded when :active or disabled */
.t0:hover:not(:active):not([disabled])       { background: var(--primary-hover-color); }
/* default is excluded when anything above matches */
.t0:not(:hover):not(:active):not([disabled]) { background: var(--primary-color); }
```

Now there is no argument for the cascade to settle. No two branches can match at the same time.

And the real payoff comes later. Extending or changing this map is far easier than reopening the equivalent selector logic in traditional CSS.

That is the whole idea:

**If the author already defined the priority, the generated selectors should make that priority unambiguous.**

## Why this matters more than the button example suggests

A hovered disabled button is just the easiest way to see the problem. The real pain starts when states intersect in less obvious ways.

Maybe dark mode can come from a root attribute, or from `prefers-color-scheme`, or from both. Maybe spacing changes inside a narrow container, but only on tablet widths. Maybe a destructive variant behaves differently on hover but not when loading. Maybe a parent theme toggles a child override.

Each one of those rules is understandable in isolation. The difficult part is the interaction surface between them.

That interaction surface is where CSS starts feeling fragile. Small edits can change which branches overlap. A harmless refactor can turn into a source-order bug. Extending an existing component can mean reopening selector logic you thought was already settled.

I wanted a model where adding a new state did not mean mentally re-deriving the whole selector matrix.

## Why it took so long

The core idea is simple. Turning it into a real tool was the hard part.

Getting from "this works for simple state conditions" to "this can support real-world component systems" took several years and hundreds of iterations.

The hard part was never producing one clever selector. The hard part was building a system that stayed coherent when all of these showed up together:

- pseudo-classes like `:hover` and `:active`
- attributes, boolean modifiers, and value-based modifiers
- root-level state
- media queries
- container queries
- nested and compound selectors
- extending styles and overriding them safely
- typed APIs on top of the styling model

Every time the model got broader, I had to check whether the original idea still held up. Sometimes it did. Sometimes it very much did not.

There were stretches where I had to break the DSL, rethink how states should be represented internally, and rebuild large parts of the compiler to preserve the same promise: if the author defines priority, the generated selectors should make that priority unambiguous.

Some of the difficulty was technical. Some of it was conceptual.

The technical side was about parsing, normalization, selector generation, caching, extension rules, and making the output fast enough to be practical.

The conceptual side was harder. I had to keep deciding what Tasty actually was.

Was it a nicer CSS object format? An atomic CSS generator? A design-system language? A compiler for stateful component styles? In practice it kept becoming all of those at once, which meant the boundaries had to be redrawn again and again before the whole thing felt internally consistent.

For a long time I honestly did not know whether the idea could scale cleanly enough to justify the effort. It worked in pockets early. Turning it into something I could trust across a design system was the long part.

And this is not just an experiment in the abstract. Tasty has powered [Cube UI Kit](https://github.com/cube-js/cube-ui-kit) from the beginning, and through it [Cube Cloud](https://cube.dev/product/cube-cloud), across 100+ components in a real enterprise product. Early versions were absolutely experimental internally. But the model earned its shape under production pressure.

## The part I care about most

I do not think "mutually exclusive selectors" are interesting because they are clever.

I think they are interesting because they remove a category of ambiguity that should not be the author's job in the first place.

When I style a component, I want to describe what it should look like in each meaningful state. I do not want to manually encode the browser's tie-breaker logic every time those states intersect.

That is the payoff Tasty is chasing:

- predictable component behavior
- fewer accidental regressions from source order
- easier extension of existing components
- a styling model that gets more valuable as the design system gets more complex

If you are styling a small landing page, this is probably too much machinery. Plain CSS is often the right answer.

But if you are building components that need to survive years of iteration, variant growth, theme expansion, and multiple authors, predictability starts compounding in a very practical way.

## A slightly bigger example

Here is the same idea with a few more moving parts:

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
      '@(sidebar, w < 300px)': '2x',
    },
  },
});
```

This is the point where I find the model becomes more useful than ordinary selector authoring.

Three properties, each with a different set of concerns — media queries, container queries, modifiers, root state, pseudo-classes — and the author never has to think about how they interact with each other. The compiler already knows.

## What this post is, and what it is not

This is not the full Tasty tour.

Tasty also has typed component APIs, sub-elements, SSR integrations, zero-runtime extraction, editor tooling, linting, tokens, recipes, and more. Those all matter, and they are part of why the tool is useful in practice.

But they are downstream of the main idea.

The main idea is still this:

**component states should be easy to describe and hard to make ambiguous.**

That sentence took years to turn into a tool I was comfortable releasing.

## If this resonates

You can try Tasty in the browser with the [playground](https://tasty.style/playground), or read the [docs](https://tasty.style/docs) if you want the full language and feature set.

If you do try it, I would genuinely love feedback. The most useful feedback is rarely "this is cool." It is usually something more specific:

- where the model clicked immediately
- where it felt unfamiliar
- where naming was confusing
- where the docs skipped a mental step
- where the abstraction solved a real problem, or failed to

That kind of feedback has shaped the project from the beginning, and it still does. If something feels confusing, awkward, or missing, the best place to share it is [GitHub Issues](https://github.com/tenphi/tasty/issues).

If you made it all the way to the end, thank you for reading. This one means a lot to me, because it is really about a problem I spent years trying to solve.

If you want to follow along or kick the tires, here are the links:

**Links**: [Docs](https://tasty.style) | [Playground](https://tasty.style/playground) | [GitHub](https://github.com/tenphi/tasty) | [npm](https://www.npmjs.com/package/@tenphi/tasty)
