---
title: 'Why I spent years trying to make CSS states predictable'
description: 'Why predictable CSS state resolution matters, and how Tasty approaches it with state maps and non-overlapping selectors.'
date: 2026-04-23
tags: ['css', 'webdev', 'frontend', 'designsystem']
---

Have you ever changed the order of two CSS rules and broken a component without changing the logic?

```css
.btn:hover {
  background: dodgerblue;
}
.btn[disabled] {
  background: gray;
}
```

Both selectors have specificity `(0, 1, 1)`. When a button is both hovered and disabled, the browser falls back to source order. If the `:hover` rule comes last, the disabled button turns blue. If the `[disabled]` rule comes last, it stays gray.

That looks like a small edge case, but it points to a bigger problem: component state in CSS often works by overlap.

With only one or two states, that overlap feels manageable. Add `:hover`, `:active`, `disabled`, dark mode, breakpoints, data attributes, container queries, and overrides, and you are no longer just writing styles. You are maintaining a state-resolution system in your head.

I kept running into this while building component systems: real buttons, inputs, panels, dropdowns, and design-system primitives. Writing the first version was rarely the difficult part. Extending it later without reopening the entire state-resolution problem was.

The result was more than the occasional source-order bug. As requirements accumulated, even small customizations became harder to make safely.

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

Read in order of priority, this means:

- if the button is disabled, use `#surface`
- otherwise, if it is active, use `#primary-pressed`
- otherwise, if it is hovered, use `#primary-hover`
- otherwise, use `#primary`

The important part is what happens next.

Tasty compiles that state map into selectors that cannot overlap:

```css
/* [disabled] wins outright */
.t0[disabled] {
  background: var(--surface-color);
}
/* :active is excluded when disabled */
.t0:active:not([disabled]) {
  background: var(--primary-pressed-color);
}
/* :hover is excluded when :active or disabled */
.t0:hover:not(:active):not([disabled]) {
  background: var(--primary-hover-color);
}
/* default is excluded when anything above matches */
.t0:not(:hover):not(:active):not([disabled]) {
  background: var(--primary-color);
}
```

No selector conflict remains for specificity or source order to settle. Only one branch can match at a time.

The real payoff comes later: changing or extending the map is much easier than reconstructing the equivalent selector relationships by hand.

That is the central idea:

**If the author defines the priority, the generated selectors should make that priority unambiguous.**

## Why this matters more than the button example suggests

A hovered disabled button is simply the easiest way to see the problem. The real difficulty begins when conditions intersect in less obvious ways.

Maybe dark mode can come from a root attribute, or from `prefers-color-scheme`, or from both. Maybe spacing changes inside a narrow container, but only on tablet widths. Maybe a destructive variant behaves differently on hover but not when loading. Maybe a parent theme toggles a child override.

Each rule is understandable in isolation. The difficulty lies in keeping their relationships predictable. Small edits can change which branches overlap. A harmless refactor can turn into a source-order bug. Extending an existing component can mean reopening selector logic you thought was already settled.

I wanted a model where adding a new state did not mean mentally re-deriving the whole selector matrix.

## A slightly bigger example

Consider a reusable action card. It can appear in the main content or a narrow sidebar, adapt its layout to the viewport, and represent either a regular or destructive action:

```tsx
const ActionCard = tasty({
  as: 'button',
  styles: {
    flow: {
      '': 'column',
      '@media(w >= 768px)': 'row',
    },
    fill: {
      '': '#surface',
      '@root(schema=dark)': '#surface-dark',
      'theme=danger': '#danger',
      'theme=danger & :hover': '#danger-hover',
    },
    padding: {
      '': '4x',
      '@(sidebar, w < 300px)': '2x',
    },
  },
});
```

The card stacks its contents by default and arranges them in a row on wider screens. Its background follows the root color scheme unless the danger theme applies, with a separate danger hover state. Inside a narrow sidebar container, its padding shrinks. The author declares these decisions next to the properties they affect; the compiler handles their selector relationships and priority.

The object-shaped representation has another practical consequence. All styles for a particular element and its sub-elements can live in a single style object. Merging a second style object into the first naturally extends the entire definition—including its state maps—without sending the author back to scattered selector overrides.

That makes extension a form of data composition. Authors combine style definitions; the compiler resolves the resulting states. This matters because a component system rarely stays as it was first written.

## Why it took so long

The core idea is simple. Turning it into a system I could trust across a design system took several years and hundreds of iterations.

Producing one clever selector was not the challenge. The system had to remain coherent when all of these appeared together:

- pseudo-classes like `:hover` and `:active`
- attributes, boolean modifiers, and value-based modifiers
- root-level state
- media queries
- container queries
- nested and compound selectors
- merging style objects across elements and sub-elements
- typed APIs on top of the styling model

Supporting each feature was only part of the work. Every addition also had to compose with everything already there. Media queries had to coexist with modifiers. Root state had to coexist with pseudo-classes. Extending a style object had to preserve its declared priorities rather than quietly reshuffle them.

As the model grew, I repeatedly had to test whether the original idea still held up. Sometimes it did. Sometimes it very much did not. There were stretches where I broke the DSL, reconsidered how states should be represented internally, and rebuilt large parts of the compiler to preserve the same promise.

The technical work involved parsing, normalization, selector generation, caching, extension rules, and making the output fast enough to be practical. The conceptual work was deciding what Tasty actually was.

Was it a nicer CSS object format? An atomic CSS generator? A design-system language? A compiler for stateful component styles? For a while, Tasty seemed to be all of these at once. The difficult part was finding boundaries that made those roles reinforce one another instead of compete.

For a long time I honestly did not know whether the idea could scale cleanly enough to justify the effort. It worked in pockets early. Making it dependable across a design system took much longer.

Tasty has powered [Cube UI Kit](https://github.com/cube-js/cube-ui-kit) from the beginning. That system now spans 100+ components and powers [Cube Cloud](https://cube.dev/product/cube-cloud), a real enterprise product. Early versions were absolutely experimental internally. Production pressure and team feedback exposed where the model held up and where it needed to change.

## The part I care about most

I do not think mutually exclusive selectors are interesting merely because they are clever. They are interesting because they remove a category of ambiguity that should not be the author's job in the first place.

When I style a component, I want to describe what it should look like in each meaningful state. I do not want to manually encode the browser's tie-breaker logic every time those states intersect.

That is the payoff Tasty is chasing:

- predictable component behavior
- fewer accidental regressions from source order
- easier extension through composable style objects
- a styling model that becomes more valuable as the design system grows

If you are styling a small landing page, this is probably too much machinery. Plain CSS is often the right answer.

If you are building components that need to survive years of iteration, variant growth, theme expansion, and multiple authors, predictability starts compounding in a practical way.

Tasty also has typed component APIs, sub-elements, SSR integrations, zero-runtime extraction, editor tooling, linting, tokens, recipes, and more. Those features matter, but they are downstream of the principle that motivated the project:

**Component states should be easy to describe and hard to make ambiguous.**

That sentence took years to turn into a tool I was comfortable releasing.

## If this resonates

You can try Tasty in the browser with the [playground](https://tasty.style/playground), or read the [docs](https://tasty.style/docs) if you want the full language and feature set.

If you try it, I would especially like to hear where the model clicks, where it feels unfamiliar, and where the documentation skips a mental step. That kind of feedback has shaped the project from the beginning, and it still does. The best place to share it is [GitHub Issues](https://github.com/tenphi/tasty/issues).

Tasty grew from a problem I kept encountering for years. If that problem feels familiar, I would love to know whether this model helps.

**Links**: [Docs](https://tasty.style) | [Playground](https://tasty.style/playground) | [GitHub](https://github.com/tenphi/tasty) | [npm](https://www.npmjs.com/package/@tenphi/tasty) | [Telegram](https://telegram.me/tasty_css)
