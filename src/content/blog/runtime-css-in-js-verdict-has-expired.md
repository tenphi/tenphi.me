---
title: 'The runtime CSS-in-JS verdict has expired'
description: 'The old case against runtime CSS-in-JS identified real costs, but not all of them are inherent. The better question is where styling decisions become known: at build time, on the server, or in the browser.'
date: 2026-08-21
tags: ['css', 'performance', 'react', 'webdev']
draft: true
---

The case against runtime CSS-in-JS seems settled. It was tried, measured, and found slow.

The indictment is familiar: styles are rebuilt on every render, inserted rules make the browser recalculate the page, generated CSS grows forever, and every styled element adds React overhead. Server rendering is slow and flawed, React Server Components are unsupported, and build-time CSS will always be better.

Those charges did not come from nowhere. In 2019, Aggelos Arvanitakis described [the hidden costs of the CSS-in-JS libraries of the time](https://calendar.perfplanet.com/2019/the-unseen-performance-costs-of-css-in-js-in-react-apps/). In 2022, Emotion maintainer Sam Magura wrote [Why We're Breaking Up with CSS-in-JS](https://dev.to/srmagura/why-were-breaking-up-wiht-css-in-js-4g9b) about how replacing Emotion with Sass Modules cut the render time of a large screen almost in half.

The measurements were valid. They answered, “Were these runtime CSS-in-JS implementations expensive?” They did not answer, “Must runtime CSS generation be expensive?”

Those results also captured a particular moment in the platform and the hardware running it. Browser engines, React, rendering frameworks, styling libraries, and devices have continued to evolve. Even when a cost remains measurable, its relative effect on a current product may be different. The system under test changed.

The useful question today is not whether runtime CSS-in-JS is simply fast or slow. It is which styles are known during the build, which become complete only on the server or in the browser, and whether deferring that work earns its cost.

Here, _runtime-capable_ means that styles can be generated from program values when those values become known. It does not mean that generation must happen in the browser.

I will use [Tasty](https://github.com/tenphi/tasty), which I created and maintain, as a case study. Tasty is a demanding example: in the browser, it parses values, resolves states and conditions, composes extensions, and generates and injects CSS rather than merely selecting precompiled output. The same components can also produce CSS on a server or during a static build. If such a system can control the familiar runtime costs, those costs are not all inherent to the category. That does not make every CSS-in-JS library fast or remove every cost.

## Separate the language from its execution point

Earlier runtime libraries often connected style generation directly to React rendering. A styled element might run hooks, consume theme context, rebuild a complete class, and insert its rule immediately. Server support then had to reproduce a browser-oriented system in a different environment.

None of those choices defines CSS-in-JS. A style engine can cache work below the component level, reuse output across components, collect writes until React reaches the insertion phase, and remove rules that are no longer used. React Server Components and build-time rendering also give compatible components places to produce HTML and CSS without sending their styling runtime to the browser.

The styling language and its execution point are separate architectural decisions.

### During the build

When the complete set of styles is known and the delivery pipeline can support it, Tasty can move generation out of the browser. `tastyStatic` analyzes application code, writes a CSS file, and leaves class names in the code. A framework that renders pages at build time can instead run regular Tasty components and collect the CSS they produce. A fully static page needs no Tasty runtime in the browser with either approach.

Tasty also has a beta hybrid path for shipping precompiled chunks. Their class names are content hashes, so the browser can recognize CSS already produced by the build and skip generating it again. That saves cold work at the cost of more coordination between the build and runtime, a trade that still has to prove a product benefit.

### On the server

Tasty components can run as React Server Components without adding a `'use client'` boundary. On a server-only page, they produce HTML and CSS without sending the Tasty runtime to the browser.

In an interactive server-rendered application, Tasty collects CSS while React renders and can stream it with the page. It also records which classes were generated, so the client can reuse them during hydration instead of generating and injecting them again.

With that handoff, server rendering avoids both a flash of unstyled content and duplicated client work. It requires an implementation designed for the server rather than a client-side injector retrofitted after the fact.

### In the browser

Browser generation remains useful when styling values or combinations are still unknown after the build and server render. _Open_ means that the program can introduce a combination that was not enumerated before deployment. The browser pays for genuinely new styles, but it can reuse work it has already seen.

All three placements are in use: [Cube UI Kit](https://cube-ui-kit.vercel.app/) ([source](https://github.com/cube-js/cube-ui-kit)) in the browser, [tasty.style](https://tasty.style) ([source](https://github.com/tenphi/tasty.style)) during React Server Component rendering, and [tenphi.me](https://tenphi.me) ([source](https://github.com/tenphi/tenphi.me)) during Astro's static build. They show that the language and its placement are separate decisions, not that one placement always wins.

## Why keep composition open?

Live values are the obvious answer, but they are only a small part of it. A component and its consumer own different styling decisions. The component owns its appearance and internal layout; the consumer decides how it participates in the surrounding page. A reusable component cannot predict every layout, state, or product-specific extension it will encounter.

In my work at Cube, that boundary became a delivery problem. The component library could not always evolve at the same pace as the product. When a developer needed a styling capability that Cube UI Kit did not expose, the maintainable path was to add a component API first. Product work could not always wait, so developers added local CSS overrides and JavaScript conditions. When the UI Kit eventually gained the capability, those workarounds still had to be found and migrated.

Tasty turned the workaround into a controlled extension point. A developer can express the immediate need through the same `styles` prop used by the component library. If the need remains local, so does the extension. If it proves reusable, it can move into a product-local component or into the UI Kit without changing styling languages. Migration means moving an explicit declaration instead of untangling JavaScript conditions and CSS overrides. Product development and design-system development no longer have to happen in lockstep.

Styles can also be extended one property at a time. Suppose a `Button` defines `fill` for its default, hover, and disabled states. A product can add a loading state without copying or replacing that state map:

```tsx
const LoadingButton = tasty(Button, {
  styles: {
    fill: { loading: '#yellow' },
  },
});
```

Tasty keeps the existing `fill` states and adds `loading`. The product does not have to restate the existing states or create a separate CSS rule that wins through the cascade.

This extension point is for styling. New behavior, semantics, or accessibility still belongs in a component API. A missing styling capability should not block product work, but a style prop should not hide missing behavior.

The same ownership boundary appears in ordinary layout. Whether a component stretches, shrinks, aligns itself, fills an available dimension, or sits against an edge is normally decided where it is used. A general-purpose `Grid` cannot know whether its consumer needs equal columns, a fixed sidebar, named areas, or a template assembled from application data.

A design system can represent those decisions with component-specific props, variants, utilities, custom properties, or wrappers. Restricting the styling surface can be intentional. The cost appears when each unpredicted need requires another narrow contract or escape hatch.

Tasty instead acts as a lazy compiler. It receives the concrete styling decision where the component is used and generates the requested structure. It does not eliminate abstraction; it offers one shared language in place of many APIs that each have to predict their future use.

## Where static extraction loses visibility

Static tooling can provide the same composition when it can see all the inputs. A closed styling vocabulary can be a deliberate and useful design-system constraint. The tradeoff appears when the product needs a combination outside that vocabulary.

Consider a form renderer that chooses both a component and its extension from a registry:

```tsx
function Field({ schema }) {
  const { Component, styles } = fieldTypes[schema.type];

  return <Component styles={{ ...styles, ...schema.styles }} />;
}
```

To reproduce this composition exactly, an extractor has to trace every possible `Component` back to its original style declaration, find every possible extension, and reproduce how each combination merges. That works when `fieldTypes` is local, finite, and statically visible and the schema only selects known entries. The assumption breaks once a package or plugin extends the registry, or application or server configuration supplies additional styles.

Static tooling can accommodate each of those patterns. A team can enumerate variants, safelist output, add compiler annotations, route values through custom properties, or constrain how components are composed. That makes source visibility a permanent application-design requirement: every wrapper, registry, package boundary, and data-driven abstraction has to remain legible to the extractor.

Runtime generation is not needed for ordinary static declarations. It is useful when the final combination does not exist until the program runs. At that point, the component and its styles have already met; the engine can combine their concrete values without reconstructing how they traveled through the source.

That visibility requirement also extends through the toolchain. The compiler has to run anywhere uncompiled styling code is executed: application builds, unit-test transforms, Storybook, browser-test bundles, separately built component libraries, and sometimes every application that consumes them. Each path needs compatible compiler and styling configuration.

A library can publish compiled class names and CSS instead, but then it owns CSS delivery. One global stylesheet may make every consumer load every component's styles. Splitting the output requires the compiler and bundler to agree on which CSS belongs to each module or route, and the generated CSS, JavaScript class names, caches, and package versions must remain in sync.

Static extraction is valuable when those constraints fit the system, but zero browser runtime is not zero system cost. It moves work from rendering into source restrictions, build tooling, distribution, and coordination.

## The browser costs that remain

When the final styling decision reaches the browser, four costs still matter: repeated generation, stylesheet writes, stylesheet growth, and React wrapper work.

### Repeated work

When a Tasty component renders with the same styles, it remembers the class names it produced and skips generation. Dynamic styles are divided into reusable chunks such as layout, dimensions, typography, and appearance. If only padding changes, Tasty reuses the other chunks and generates the new spacing; another component can reuse that chunk too.

The parser and style pipeline have their own caches, and identical state branches can be collapsed before output is generated. Repeated work stops at the earliest layer that recognizes it. A React render therefore need not trigger another parsing, generation, or insertion pass.

### Stylesheet writes and style resolution

Adding a rule marks styles as needing resolution, but the browser does not necessarily recalculate the page at that moment. It can collect several changes and resolve them together when styles are needed. React may split rendering into parts, however, giving the browser several opportunities to resolve styles if stylesheet writes are interleaved with reads.

With [batched injection](https://github.com/tenphi/tasty/blob/299eec7e2aae62a8aa940190dc77fde82bde9ac8/docs/configuration.md#batched-injection) enabled, Tasty's `TastyBatchProvider` holds new rules while components render. It applies them in React's [`useInsertionEffect`](https://react.dev/reference/react/useInsertionEffect), before layout effects can measure the page. The browser can then resolve those writes together; predictable timing is the main benefit.

### Stylesheet growth

Generated styles can accumulate, especially when every combination of props produces another complete class.

Tasty limits that growth by reusing chunks and deduplicating identical output. During browser idle time, [its collector](https://github.com/tenphi/tasty/blob/299eec7e2aae62a8aa940190dc77fde82bde9ac8/docs/injector.md#garbage-collection) removes old rules that are no longer present on the page after a short grace period. The delay matters because React may generate a class before committing its element; deleting every temporarily absent class could remove a rule during a render.

Unique styles that remain active still grow the stylesheet. Applications with highly dynamic styling should measure that workload. Accumulation does not disappear, but an engine can manage it instead of accepting unbounded growth as the category's default.

### React wrapper work

Older implementations often made every styled component run hooks or consume theme context. Even a simple element paid that cost whenever React rendered it.

Tasty does not need hooks or React context to generate styles. After the styles are cached, a component follows a short path, but its wrapper still processes props and returns the underlying element, so it is not free.

It also does not require a separate styled component for every part of a compound component. One Tasty component can generate styles for its root and named sub-elements such as an icon, label, or content area. Those elements still exist in the DOM, but they do not each need a style-processing wrapper.

### Practical cost

Generation, injection, and wrapper overhead are different costs. I reran Tasty's current public benchmarks three times on an Apple M1 Max. The Node suite used Node 22; the browser suites used production React 19.2.8 and Chromium 151.

| Measured work | Added time |
| --- | --: |
| Render one warmed `tasty()` wrapper | ~1.1 µs per element |
| Generate a new style | ~16–47 µs |
| Reuse a cached style | ~0.12–0.13 µs |
| Generate, inject, and resolve one new rule | ~0.16–0.18 ms |
| Generate and inject 1,000 new rules, then resolve styles once | ~10.1–10.5 ms total |

The important distinction is between cold and repeated work. Generating a genuinely new style has a measurable cost; reusing an existing one is negligible by comparison.

The numbers should not be added together. The end-to-end injection benchmark already includes generation and subtracts the same DOM update and style resolution performed with equivalent CSS already present.

The [style-pipeline benchmark](https://github.com/tenphi/tasty/blob/299eec7e2aae62a8aa940190dc77fde82bde9ac8/docs/runtime-benchmarks.md#core-style-pipeline), [wrapper-overhead benchmark](https://github.com/tenphi/tasty/blob/299eec7e2aae62a8aa940190dc77fde82bde9ac8/docs/runtime-benchmarks.md#empty-wrapper-overhead), and [cold-generation-and-injection benchmark](https://github.com/tenphi/tasty/blob/299eec7e2aae62a8aa940190dc77fde82bde9ac8/docs/runtime-benchmarks.md#cold-generation-and-injection) are public and reproducible. The single-rule case crosses the injection-to-resolution boundary for every rule; the batched case performs all writes before one resolution. The latter costs only about 59–65 times as much in total, not 1,000 times as much, because fixed work is amortized and the browser can resolve the writes together.

Product profiles complete the picture. In internal Sentry profiles from [Cube](https://cubecloud.dev/), an enterprise application built with the Tasty-powered [Cube UI Kit](https://github.com/cube-js/cube-ui-kit), style processing accounts for roughly 10–20% of measured CPU work during loading and navigation. A separate trace put Tasty at 12.4% of main-thread busy time. These are observations, not controlled benchmarks, but in both cases the overhead was measurable without being the dominant cost.

In latency-sensitive interactions, especially animation-rich UI, browser generation deserves scrutiny when too many previously unseen styles are created at once. That pattern is uncommon and often points to a broader workload problem: too much UI mounting in one frame, poor style reuse, or per-frame values expressed as new rules. Precompilation can remove one source of work, but it does not address React, DOM, layout, or paint costs.

## Where the abstraction ends

Runtime composition is useful only if the styling language can express the product's CSS. CSS is not just a dictionary of properties: selectors, conditions, declaration order, overlapping shorthands, and the cascade all carry meaning.

Tasty accepts standard properties and values directly, so new CSS features do not have to wait for a dedicated API. Its objects are also the source of a DSL whose grammar represents selectors and conditions:

```tsx
const Card = tasty({
  styles: {
    color: { '': '#text', ':hover': '#accent-text' },
    padding: {
      '': '4x',
      '@media(w < 640px)': '2x',
      '@(sidebar, w < 300px)': '1x',
    },
  },
});
```

This definition combines a pseudo-class, a viewport condition, and a named container condition. The compiler turns them into selectors and at-rules while preserving their declared priority. The same grammar covers features such as `:has()`, `@supports`, and CSS structures that do not fit into a flat property object. For experimental `@function` rules, Tasty can emit the native rule or [inline the function into ordinary CSS](https://github.com/tenphi/tasty/blob/299eec7e2aae62a8aa940190dc77fde82bde9ac8/README.md#css-functions-function).

Composition needs rules too. CSS properties overlap: `padding` can reset `paddingTop`, so naive object merging can change the result. Tasty normalizes related properties into the same style family and resolves that family in a fixed priority instead of relying on object insertion order. A component can also expose tokens rather than asking consumers to override part of a shorthand.

This is an opinionated component model, not a replacement for arbitrary CSS. Features such as `@layer` and `!important` are not part of it; for styles managed by Tasty, explicit priority and composition rules make them largely unnecessary. Rules whose intent is genuinely document-wide may be more direct to express as ordinary CSS. Complex selectors and the global cascade, however, trade declarations pinned to a component and state for broader structural and ordering dependencies. Every abstraction has a boundary.

## A decision rule, not a verdict

Browser-side generation should not be the default merely because the styling language supports it. Generate CSS as early as the required set of styles is known, and defer only the part that remains open:

- **During the build** when the complete set of styles is known, a predefined utility or variant vocabulary fits the product, and the compiler and delivery pipeline can extract, split, and load the resulting CSS.
- **On the server** when the decision is request-specific but complete before the HTML is sent or streamed.
- **In the browser** when values or composition remain open after server rendering, or when making every consumer participate in extraction would cost more than the browser work being removed.

Each placement shifts the cost. For one application, compiler and CSS-delivery integration may be modest; for a component library used by many independent products, the same versioning, testing, and chunking work is multiplied across consumers. Browser generation instead adds wrapper work, generation and injection for new styles, and active rules to the stylesheet. Ordinary CSS may still be the direct choice for genuinely document-wide rules despite its broader cascade dependencies. Frame-sensitive interactions that create too many previously unseen styles at once need profiling, but they usually require broader optimization than style precompilation alone.

Runtime generation earns its place when an open extension point lets product teams solve legitimate styling needs without turning every use case into a component API. When those decisions are known earlier, build and server rendering can avoid paying that cost in the browser.

Then profile the actual product rather than the category. The old performance problems were real. The browsers, frameworks, and implementations behind the verdict were not the final form of runtime CSS-in-JS. What expired was not the evidence, but the assumption that its costs were unavoidable.
