---
title: 'Runtime CSS-in-JS deserves a rehearing'
description: 'Runtime CSS-in-JS has real costs, but runtime-capable systems can solve real composition problems. Their cost should be judged against what they enable.'
date: 2026-09-03
tags: ['css', 'performance', 'react', 'webdev']
---

Runtime CSS-in-JS has largely been written off as too expensive for the browser.

The reasons are familiar: some libraries rebuilt styles on every React render, interleaved stylesheet writes with rendering, accumulated generated CSS, and added React overhead to every styled element. Server rendering was awkward, React Server Components seemed incompatible, and build-time CSS appeared to eliminate the entire class of problems.

Those concerns did not come from nowhere. In 2019, Aggelos Arvanitakis described [the hidden costs of the CSS-in-JS libraries of the time](https://calendar.perfplanet.com/2019/the-unseen-performance-costs-of-css-in-js-in-react-apps/). In 2022, Emotion maintainer Sam Magura reported in [Why We're Breaking Up with CSS-in-JS](https://dev.to/srmagura/why-were-breaking-up-wiht-css-in-js-4g9b) that replacing Emotion with Sass Modules cut the render time of a large screen almost in half.

The measurements were valid. They answered, “Were these runtime CSS-in-JS implementations expensive?” They left two broader questions open: “Must every runtime-capable styling system pay those costs in the browser?” and “When generation does happen there, does the resulting flexibility justify the cost?”

Those results also captured a particular generation of libraries. Browsers, React, rendering frameworks, and hardware have all evolved, but faster machinery is not the main reason to revisit the verdict. Style engines can also change where they perform work and how often they repeat it.

People often use _runtime CSS-in-JS_ as shorthand for generating CSS in the browser. Here I separate capability from placement. A runtime-capable system can generate styles wherever its inputs become known: during the build, on the server, or in the browser.

The useful question is not simply whether runtime CSS-in-JS is fast or slow. It is which styling decisions can be made earlier, and whether keeping the rest open justifies the cost. CSS should not always be generated in the browser, but browser generation should remain available when the final composition genuinely remains open.

I will use [Tasty](https://tasty.style), which I created and maintain, as a case study rather than a neutral survey. It is a demanding test: in the browser, Tasty parses values, resolves states and conditions, composes extensions, and generates and injects CSS rather than merely selecting precompiled output. The same components can do that work on a server or during a static build.

My claim is narrow: a runtime-capable system can justify its cost when it controls where and how often that cost is paid and solves composition problems that matter to the product. That does not make every CSS-in-JS library fast or make browser generation free.

## Why leave composition open?

A changing value alone is a weak reason to generate CSS at runtime. When the declaration structure is fixed, a CSS custom property is often more direct. Runtime generation becomes useful when some part of the structure—the property set, selector, condition, state, or component extension—remains unknown until the program runs. _Open_ means that the program can introduce a combination that was not enumerated before deployment.

The reason is often ownership: a component and its consumer own different styling decisions. The component owns its appearance and internal layout; the consumer decides how it participates in the surrounding page. A reusable component cannot predict every layout, state, or product-specific extension it will encounter.

In my work at Cube, that boundary became a delivery problem. The component library and the product could not always evolve at the same pace. When a developer needed a styling capability that Cube UI Kit did not expose, the maintainable long-term path was to add a component API first. Product work could not always wait, so developers added local CSS overrides and JavaScript conditions. When the UI Kit eventually gained the capability, those workarounds still had to be found and migrated.

Tasty made those workarounds explicit without making the direct `styles` prop the preferred API. The preferred fix depends on what is missing. A component can expose individual CSS properties such as `width`, `border`, or `radius` through `styleProps`. With `modProps`, it can expose a finite component state or visual variant as a typed prop that selects predefined style branches. New behavior, semantics, and accessibility require dedicated component API props. The direct `styles` prop remains a poor default and an escape hatch for rare cases that can be justified locally.

When a visual extension remains product-specific, a developer can create a named styled wrapper in the same language as the component library. If the need proves reusable, the wrapper can remain a product-local component or the capability can move into the UI Kit as an exposed style, a state modifier, or a dedicated API. Migration means moving an explicit declaration instead of untangling JavaScript conditions and CSS overrides. Product development and design-system development no longer have to happen in lockstep.

Within that hierarchy, style definitions remain composable one property at a time. Suppose a `Button` already exposes a `loading` state modifier and defines `fill` for its default, hover, and disabled states. A product-local wrapper can add the missing `loading` branch without copying or replacing that state map:

```tsx
const LoadingButton = tasty(Button, {
  styles: {
    fill: { loading: '#yellow' },
  },
});
```

Tasty keeps the existing `fill` states and adds `loading`. The product does not have to restate the existing states or create a separate CSS rule that wins through the cascade.

This hierarchy does not prevent exceptions from accumulating; it makes them explicit and movable. Teams still have to decide which should graduate into shared APIs.

The same ownership boundary appears in ordinary layout. Whether a component stretches, aligns itself, fills available space, or sits against an edge is normally decided where it is used. A general-purpose `Grid` cannot know whether its consumer needs equal columns, a fixed sidebar, named areas, or a template assembled from application data.

A design system can represent those decisions with style props, state modifiers, utilities, custom properties, or wrappers. Restricting the styling surface can be intentional. The tradeoff is that each unpredicted need requires another narrow contract or escape hatch.

Tasty instead acts as a lazy compiler. It receives the concrete styling decision where the component is used and generates the requested CSS. It does not eliminate abstraction; it offers one shared language in place of many APIs that each have to predict their future use.

## Runtime capability does not dictate runtime placement

Earlier runtime libraries often connected style generation directly to React rendering. A styled element might run hooks, consume theme context, rebuild a complete class, and insert its rule immediately. Server support then had to reproduce a browser-oriented system in a different environment.

None of those choices is required by CSS-in-JS. A style engine can cache work below the component level, reuse output across components, collect writes until React reaches the insertion phase, and remove rules that are no longer used. React Server Components and build-time rendering also let compatible components produce HTML and CSS without sending their styling runtime to the browser.

The styling language and its execution point are separate architectural decisions.

### During the build

When the complete set of styles is known, Tasty can move generation out of the browser in two ways. `tastyStatic` analyzes application code, writes a CSS file, and leaves class names in the code. A framework that renders pages at build time can instead run regular Tasty components and collect the CSS they produce. Either approach lets a fully static page ship without the Tasty runtime.

### On the server

Tasty components can run as React Server Components without adding a `'use client'` boundary. On a server-only page, they produce HTML and CSS without sending the Tasty runtime to the browser.

In an interactive server-rendered application, Tasty collects CSS while React renders and can stream it with the page. It also records which classes were generated, so the client can reuse them during hydration instead of generating and injecting them again.

With that handoff, server rendering avoids both a flash of unstyled content and duplicated client work. It requires an implementation designed for the server rather than a client-side injector retrofitted after the fact.

### In the browser

Browser generation remains useful when styling values or combinations are still unknown after the build and server render. The browser pays for genuinely new styles, but it can reuse work it has already seen.

These placements are not hypothetical. [Cube UI Kit](https://github.com/cube-js/cube-ui-kit) generates styles in the browser; [tasty.style](https://github.com/tenphi/tasty.style) does so during React Server Component rendering; [tenphi.me](https://github.com/tenphi/tenphi.me) does so during Astro's static build. They demonstrate that each placement is viable, not that one always wins.

## What static extraction must be able to see

Static tooling can provide the same composition when it can see all the inputs. A closed styling vocabulary can be a deliberate and useful design-system constraint. The tradeoff appears when the product needs a combination outside that vocabulary.

Consider a form renderer that chooses both a component and its extension from a registry:

```tsx
function Field({ schema }) {
  const { Component, styles } = fieldTypes[schema.type];

  return <Component styles={{ ...styles, ...schema.styles }} />;
}
```

To reproduce this composition exactly, an extractor has to trace every possible `Component` back to its original style declaration. It must also find every possible extension and reproduce how each combination merges. That works when `fieldTypes` is local, finite, and statically visible, and when the schema selects only known entries. The assumption breaks once a package or plugin extends the registry, or application or server configuration supplies additional styles.

Static tooling can accommodate each of those patterns. A team can enumerate variants, safelist output, add compiler annotations, route values through custom properties, or constrain how components are composed. But each accommodation makes source visibility part of the application architecture: every wrapper, registry, package boundary, and data-driven abstraction has to remain legible to the extractor.

Runtime generation is not needed for ordinary static declarations. It is useful when the final combination does not exist until the program runs. At that point, the component and its styles have already met; the engine can combine their concrete values without reconstructing how they traveled through the source.

That visibility requirement extends through the toolchain. The compiler has to participate in every path that handles uncompiled styling code: application builds, unit-test transforms, Storybook, browser-test bundles, separately built component libraries, and sometimes the build of every consuming application. Each path needs compatible compiler and styling configuration.

A library can publish compiled class names and CSS instead, but then it owns CSS delivery. One global stylesheet can force every consumer to load every component's styles. Splitting the output requires the compiler and bundler to agree on which CSS belongs to each module or route, and the generated CSS, JavaScript class names, caches, and package versions must remain in sync.

Static extraction may still be the right choice, but zero browser runtime is not zero system cost. Too often, browser work is quantified while source restrictions, build integration, and CSS delivery remain implicit. These costs are not interchangeable—runtime work is paid by users, while tooling and coordination are paid by teams—but every placement should be judged by the costs it creates and the problems it solves.

## The browser costs that remain

When the final styling decision reaches the browser, four areas still matter: generation and reuse, stylesheet writes, stylesheet growth, and React wrapper work.

### Generation and reuse

When a Tasty component renders with the same styles, it remembers the class names it produced and skips generation. Dynamic styles are divided into reusable chunks such as layout, dimensions, typography, and appearance. If only padding changes, Tasty reuses the other chunks and generates only the new spacing chunk; another component can reuse that chunk too.

The parser and style pipeline have their own caches, and identical state branches can be collapsed before output is generated. Repeated work stops at the earliest layer that recognizes it. A React render therefore need not trigger another round of parsing, generation, or insertion.

### Stylesheet writes and style resolution

Tasty normally keeps generated component rules in one managed `<style>` element per root, opening another only when the configured limit is reached. The main cost is not creating elements but mutating a live stylesheet. How much work can be grouped depends on when the browser resolves those changes.

Adding a rule marks styles as needing resolution, but the browser does not necessarily recalculate the page at that moment. It can collect several changes and resolve them together when styles are needed. React may split rendering into parts, however, giving the browser several opportunities to resolve styles if stylesheet writes are interleaved with reads.

With [batched injection](https://github.com/tenphi/tasty/blob/299eec7e2aae62a8aa940190dc77fde82bde9ac8/docs/configuration.md#batched-injection) enabled, Tasty's `TastyBatchProvider` holds new rules while components render. It applies them in React's [`useInsertionEffect`](https://react.dev/reference/react/useInsertionEffect), before layout effects can measure the page. This gives the browser an opportunity to resolve the writes together at a predictable point.

### Stylesheet growth

Generated styles can accumulate, especially when every combination of props produces another complete class.

Tasty limits that growth by reusing chunks and deduplicating identical output. During browser idle time, [its collector](https://github.com/tenphi/tasty/blob/299eec7e2aae62a8aa940190dc77fde82bde9ac8/docs/injector.md#garbage-collection) removes old rules that are no longer present on the page after a short grace period. The delay matters because React may generate a class before committing its element; deleting every temporarily absent class could remove a rule during a render.

Unique styles that remain active still grow the stylesheet. Applications with highly dynamic styling should measure that workload. Accumulation does not disappear, but an engine can manage it rather than treating unbounded growth as inevitable.

### React wrapper work

Older implementations often made every styled component run hooks or consume theme context. Even a simple element paid that cost whenever React rendered it.

Tasty does not need hooks or React context to generate styles. Cached styles remove the generation work, but the wrapper still processes props and returns the underlying element. That React work remains.

Browser execution also means shipping the Tasty runtime. Its current bundle is substantial because it includes parsing, state and condition handling, composition, injection, and collection. Tasty deliberately prioritizes a rich composition model and predictable execution; reducing download and parse cost remains optimization work. Products that do not need that capability have less reason to pay for it.

### Practical cost

Generation, injection, and wrapper overhead are different costs. The useful distinction is between cold and repeated work: new styles pay for generation and injection, while familiar styles take the cached path. The figures below measure those costs separately.

I reran Tasty's current public benchmarks three times on an Apple M1 Max. The Node suite used Node 22; the browser suites used production React 19.2.8 and Chromium 151.

| Measured work | Added time |
| --- | --: |
| Render one warmed `tasty()` wrapper | ~1.1 µs per element |
| Generate a new five-property style | ~16 µs |
| Generate a new style with states and conditions | ~47 µs |
| Reuse a cached style | ~0.12–0.13 µs |
| Generate, inject, and resolve one new rule | ~0.16–0.18 ms |
| Generate and inject 1,000 new rules, then resolve styles once | ~10.1–10.5 ms total |

These figures describe separate paths and should not be added. The end-to-end injection benchmark already includes generation and subtracts a baseline that performs the same DOM update and style resolution with equivalent CSS already present. React wrapper work is measured separately. The [full benchmark report](https://tasty.style/docs/runtime-benchmarks) publishes the methods, results, and source code.

The pattern matters more than the individual numbers: cached styles avoid most of the work, and grouped writes amortize fixed costs. In round numbers, cold generation took tens of microseconds, cached reuse took a fraction of a microsecond, and generating, injecting, and resolving a new rule took tenths of a millisecond. The 1,000-insertion case took about 60 times as long as the single-rule case, not 1,000 times as long.

Benchmarks isolate the costs; product profiles show whether they matter in context. In production Sentry traces from real user sessions on one of Cube's heaviest pages, Tasty accounted for roughly 12.5% of main-thread busy time during startup; local profiling produced a similar result. This is an observation from ordinary user sessions, not a controlled benchmark. That share is material, and whether it is acceptable depends on the product and what the runtime enables.

In latency-sensitive interactions, especially animation-rich UI, creating many previously unseen styles at once deserves scrutiny. That pattern may also reveal a broader workload problem: too much UI mounting in one frame, poor style reuse, or per-frame values expressed as new rules. Precompilation can remove one source of work, but it does not address React, DOM, layout, or paint costs.

## Runtime is only half the design

A runtime-capable system still has to express the product's CSS. CSS is more than a dictionary of properties: selectors, conditions, declaration order, overlapping shorthands, and the cascade all carry meaning.

Tasty accepts standard properties and values directly, while its style objects use a small grammar to represent selectors and conditions:

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

This definition combines a pseudo-class, a viewport condition, and a named container condition. The engine turns them into selectors and at-rules while preserving their declared priority. The same grammar covers features such as `:has()`, `@supports`, and CSS structures that do not fit into a flat property object.

Composition needs rules too. CSS properties overlap: `padding` can reset `paddingTop`, so naive object merging can change the result. Tasty normalizes related properties into the same style family and resolves that family in a fixed order instead of relying on object insertion order.

This is an opinionated component model, not a replacement for every use of CSS. Tasty does not model features such as `@layer` or `!important`, and rules whose intent is genuinely document-wide may be clearer as ordinary CSS. Tasty prioritizes local, explicit ownership; ordinary CSS exposes the full cascade and structural reach. Choosing an execution point does not erase that design tradeoff.

## Runtime capability has to earn its place

Runtime-capable styling is one choice in a wider landscape. Teams can use ordinary CSS, preprocessors, utility or variant vocabularies, static extraction, server generation, browser generation, or combinations of them. Each makes different tradeoffs in cascade control, source visibility, tooling, delivery, composition, and browser work. None is right by category alone.

Runtime capability earns its place when final styles depend on information unavailable earlier, or when a narrower component API cannot express a legitimate product need. The rule is to generate CSS as soon as the required styles are known and defer only what remains open:

- **During the build** when every required style becomes known while generating the application, whether through static analysis or build-time rendering.
- **On the server** when the decision is request-specific but complete before the HTML is sent or streamed.
- **In the browser** when values or composition remain open after server rendering, or when making every consumer participate in extraction would cost more than the browser work being removed.

Profile products, not categories. The old evidence described real costs in particular implementations and workloads; it did not settle every use of runtime generation. The relevant question is whether the composition and ownership it enables are worth the cost in your product. If they are not, generate the CSS earlier or choose a simpler approach.
