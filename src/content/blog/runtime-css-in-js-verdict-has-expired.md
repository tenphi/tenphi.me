---
title: 'The runtime CSS-in-JS verdict has expired'
description: 'Runtime CSS-in-JS was judged by old implementations. Its performance problems are solvable, while its flexibility and design-system benefits remain.'
date: 2026-08-21
tags: ['css', 'performance', 'react', 'webdev']
draft: true
---

The case against runtime CSS-in-JS can seem settled. It was tried, measured, and found slow.

The indictment is familiar: styles are rebuilt on every render, every new rule makes the browser recalculate the page, generated CSS grows forever, React pays extra overhead for every styled element, SSR support is slow and flawed, React Server Components are unsupported, and a build-time solution will always be better.

Those charges did not come from nowhere. In 2019, Aggelos Arvanitakis described [the hidden costs of the CSS-in-JS libraries of the time](https://calendar.perfplanet.com/2019/the-unseen-performance-costs-of-css-in-js-in-react-apps/). In 2022, Emotion maintainer Sam Magura wrote [Why We're Breaking Up with CSS-in-JS](https://dev.to/srmagura/why-were-breaking-up-wiht-css-in-js-4g9b) about how replacing Emotion with Sass Modules cut the render time of a large screen almost in half.

The measurements were valid. They answered “were these runtime CSS-in-JS implementations expensive?” They did not answer “must runtime CSS generation be expensive?” What has expired is the blanket verdict drawn from that evidence.

The rest of the case concerns capability and developer experience: whether a CSS DSL can keep up with the platform, and whether a framework like Tailwind will always be faster to build with.

I want to revisit that case through [Tasty](https://github.com/tenphi/tasty), which I created and maintain. This is not an argument that every runtime CSS-in-JS library is now fast. Tasty is useful as an existence proof because it parses values, resolves states, generates rules, and injects them at runtime. If the common failure modes can be addressed there, they are engineering choices rather than laws of the category.

## What runtime generation actually buys you

Live values are only a small part of the answer. A reusable component can own its appearance and internal layout, but it cannot know how every consumer will place it in the surrounding layout. Whether it should stretch, shrink, align itself, fill an available dimension, or sit against an edge is usually decided where the component is used. Properties such as `width`, `height`, `position`, `inset`, `flex-grow`, `flex-shrink`, `flex-basis`, and `place-self` are not exceptional styling needs; nearly every component participates in some combination of them.

A general-purpose `Grid` makes the same boundary easy to see: its author cannot know whether a consumer will need equal columns, a fixed sidebar, named areas, or a template calculated from application data. But `Grid` is only an obvious example of a decision that naturally belongs at the point of use.

A design system can encode those decisions as component-specific props, named variants, utility classes, custom-property channels, or wrapper elements. Some components should deliberately restrict some properties, but modeling every permitted combination separately creates a growing collection of contracts and escape hatches.

This was not theoretical for Cube UI Kit. The component library could not always evolve at the same pace as the product. When a developer needed a state or styling capability that a component did not expose, the formal process was to add an API to the UI Kit first. In practice, product work could not always wait. Developers added local CSS overrides and JavaScript conditions, and the eventual UI Kit change was followed by a difficult migration away from that workaround.

Tasty turned that workaround into a controlled extension point. A developer can express the immediate need through the same styling language, contained in a single `styles` prop at the point of use. If the need remains local, so does the extension. If it proves reusable, it can be factored into a product-local component or absorbed by the UI Kit when it is broadly useful. Because each scope uses the same styling language, migration means moving an explicit style declaration rather than untangling a separate layer of JavaScript and CSS overrides. Product development and design-system development no longer have to happen in lockstep.

This does not remove the need for a component API when new behavior, semantics, or accessibility are involved. It means a missing styling capability no longer has to block product work or force an unrelated abstraction into existence.

Static systems can provide much of the same ergonomics when an extension is discoverable during the build. Runtime generation keeps that extension point open when the values, states, selectors, or responsive and container conditions cannot be enumerated ahead of time. Tasty acts as a lazy compiler: it receives the styling decision at the point of use and generates only the requested structure. It does not eliminate abstraction; it replaces many narrow abstractions that must predict their use cases with a shared language that can leave those decisions open.

That flexibility matters only if its runtime costs can be controlled. The old objections point to four places to look.

## “CSS is generated again on every render”

That would indeed be slow. It is also unnecessary.

When a Tasty component renders with the same styles, it remembers the class names it produced before and skips CSS generation. Dynamic styles are split into reusable chunks such as layout, dimensions, typography, and appearance. If only padding changes, Tasty reuses the other chunks and generates just the new spacing; another component can reuse that chunk too.

There are additional caches inside the parser and the style pipeline, but the important idea is simple: repeated work should stop at the earliest possible layer. A React render does not have to mean another CSS render.

## “Every inserted rule recalculates the whole page”

This claim is too strong. Adding a rule invalidates style, but browsers can collect several changes and resolve them together when styles are needed. React may split rendering into parts, though, giving the browser several chances to recalculate if stylesheet writes are interleaved with reads.

With [batched injection](https://github.com/tenphi/tasty/blob/299eec7e2aae62a8aa940190dc77fde82bde9ac8/docs/configuration.md#batched-injection) enabled, Tasty's `TastyBatchProvider` avoids that uncertainty. It holds new rules while components render, then applies them in React's [`useInsertionEffect`](https://react.dev/reference/react/useInsertionEffect) before layout effects can measure the page. The browser can resolve those writes together; predictable timing is the main benefit.

## “Generated styles keep accumulating”

They can, especially when every combination of props produces another complete class.

Tasty limits that growth by reusing chunks and deduplicating identical output. During browser idle time, [its collector](https://github.com/tenphi/tasty/blob/299eec7e2aae62a8aa940190dc77fde82bde9ac8/docs/injector.md#garbage-collection) removes old rules that are no longer present on the page, after a short grace period. The delay matters because React may generate a class before committing its element; deleting every temporarily absent class could remove a rule mid-render.

Unique styles that remain active still grow the stylesheet, so applications with highly dynamic styling should measure that workload. The point is that accumulation can be controlled rather than accepted as an unavoidable feature of CSS-in-JS.

## “Every styled element adds React overhead”

Older implementations often wrapped each styled component in hooks or theme context consumers. Even a simple element paid that cost whenever React rendered it.

Tasty components do not need hooks or React context to generate styles. A warmed component follows a short path, but its wrapper still handles props and abstractions, so it is not free.

## What does the runtime cost in practice?

Generation, injection, and wrapper overhead are different costs. I reran Tasty's current public benchmarks three times on an Apple M1 Max. The Node suite used Node 22; the browser suites used production React 19.2.8 and Chromium 151.

| Measured work | Added time |
| --- | --: |
| Render one warmed `tasty()` wrapper | ~1.1 µs per element |
| Generate a new style | ~16–47 µs |
| Reuse a cached style | ~0.12–0.13 µs |
| Generate, inject, and resolve one new rule | ~0.16–0.18 ms |
| Generate and inject 1,000 new rules, then resolve styles once | ~10.1–10.5 ms total |

The important distinction is between cold work and repeated work: generating a genuinely new style has a measurable cost, while reusing an existing one is negligible by comparison.

The numbers should not be added together: the end-to-end injection benchmark already includes generation and subtracts the same DOM update and style resolution performed with equivalent CSS already present.

The [style-pipeline benchmark](https://github.com/tenphi/tasty/blob/299eec7e2aae62a8aa940190dc77fde82bde9ac8/docs/runtime-benchmarks.md#core-style-pipeline), [wrapper-overhead benchmark](https://github.com/tenphi/tasty/blob/299eec7e2aae62a8aa940190dc77fde82bde9ac8/docs/runtime-benchmarks.md#empty-wrapper-overhead), and [cold-generation-and-injection benchmark](https://github.com/tenphi/tasty/blob/299eec7e2aae62a8aa940190dc77fde82bde9ac8/docs/runtime-benchmarks.md#cold-generation-and-injection) are public and reproducible. The single-rule case crosses the injection-to-resolution boundary for every rule; the 1,000-rule case makes all writes before one resolution. The latter cost only about 59–65 times as much in total, not 1,000 times as much, because fixed work was amortized and the browser could resolve the writes together.

Product profiles complete the picture. In internal Sentry profiles from [Cube](https://cubecloud.dev/), an enterprise application built with the Tasty-powered [Cube UI Kit](https://github.com/cube-js/cube-ui-kit), style processing accounts for roughly 10–20% of measured CPU work during loading and navigation. A separate trace put Tasty at 12.4% of main-thread busy time. These are observations, not controlled benchmarks, but in both cases the overhead was measurable without being the dominant cost. Products that create many unique styles in one interaction should still profile that workload.

## “SSR is slow and flawed, and Server Components are unsupported”

Tasty components can run as React Server Components without adding a `'use client'` boundary. On a server-only page, they produce HTML and CSS without sending the Tasty runtime to the browser.

In an interactive server-rendered application, Tasty collects the CSS while React renders and can stream it with the page. It also tells the browser which classes were already generated. During hydration, the client recognizes those classes and does not generate or inject them again.

Server rendering therefore does not have to mean a flash of unstyled content followed by duplicated client work. Avoiding both requires an implementation designed for the server from the beginning.

## “Build-time CSS is always faster”

Build-time CSS is indeed cheaper in the browser. It is the right choice when the necessary styling paths can be known ahead of time; runtime generation serves the decisions that cannot.

That is why Tasty also has `tastyStatic`. It runs the style engine during the build, writes a CSS file, and leaves class names in the application code. No styling runtime is needed in the browser.

## “A CSS abstraction cannot express real CSS”

CSS is not just a dictionary of properties. Selectors, conditions, declaration order, overlapping shorthands, and the cascade all carry meaning. This criticism therefore contains three real concerns.

The first is platform lag. A library cannot design a dedicated API for a CSS feature before that feature exists. It does not need to: Tasty accepts standard properties and values directly, while more convenient syntax can be added later. For experimental CSS `@function` rules, for example, Tasty can emit the native rule or [inline the function into ordinary CSS](https://github.com/tenphi/tasty/blob/299eec7e2aae62a8aa940190dc77fde82bde9ac8/README.md#css-functions-function).

The second is structure. A flat object containing only `color` and `padding` cannot represent selectors, states, at-rules, or nested conditions. Tasty does not use its objects as a JavaScript version of `CSSStyleDeclaration`; they are the source syntax of a DSL. An object can describe hover states, responsive and container conditions, and relationships between elements, which the compiler turns into CSS rules.

Object notation is only the surface syntax. Its expressive power depends on the grammar assigned to it.

The third is composition. CSS properties overlap: `padding` can reset `paddingTop`, so naive object merging can change the result. Tasty resolves canonical style families in a fixed priority rather than relying on object insertion order. Components can also expose tokens instead of asking consumers to override part of a shorthand. This is an opinionated model, but it is deliberate and deterministic.

That does not make Tasty equivalent to arbitrary CSS. Document-wide rules built around complex selectors or the global cascade can still be clearer as ordinary CSS. But losing access to complex CSS is not an inherent limitation of object notation; it depends on what language the abstraction provides.

## “Tailwind is faster for building interfaces”

On the first day, it often is. Tailwind arrives with a utility vocabulary ready to use. Tasty asks a design system to define that vocabulary, so comparing an engine with a ready-made framework is not quite one-to-one.

Once those primitives exist, everyday styling can be just as direct. Cube UI Kit's [`Grid`](https://github.com/cube-js/cube-ui-kit/blob/main/src/components/layout/Grid.tsx), for example, can be used like this:

```tsx
<Grid columns="1fr 1fr" flow="row" width="100%" gap="2x">
  …
</Grid>
```

That example demonstrates concise ergonomics, not equal development speed. Speed depends on the maturity of the design system, its tooling, and how often a product departs from predefined utilities. Tailwind is often faster when its vocabulary fits. Tasty requires more up-front design-system work in exchange for a product-specific language and styling decisions that can remain open until use.

## Three products, three ways to generate CSS

[Cube](https://cubecloud.dev/) and its open-source [Cube UI Kit](https://cube-ui-kit.vercel.app/) ([source](https://github.com/cube-js/cube-ui-kit)) use Tasty fully at runtime. [tasty.style](https://tasty.style) ([source](https://github.com/tenphi/tasty.style)) uses Next.js, React Server Components, and streaming SSR. [tenphi.me](https://tenphi.me) ([source](https://github.com/tenphi/tenphi.me)) uses Astro to generate static HTML and CSS with no Tasty runtime in the browser.

The same engine can therefore run in the browser, on the server, or during the build. The right choice depends on where a product needs flexibility and where it wants to pay the cost.

## A better verdict

Runtime generation earns its place when it lets product teams solve legitimate styling needs without waiting for every use case to become a component API. A shared extension point lets consumers decide how components participate in the surrounding layout, contains local exceptions, and gives reusable patterns a clear path back into the design system. It remains available even when the required values and conditions cannot be enumerated during the build.

That flexibility has a cost. A wrapper adds a small amount of recurring work, and genuinely new styles must still be generated and inserted. Caching and batching can control that work; static extraction can remove it when the styling paths are known ahead of time.

The better rule is to generate CSS statically when the styling space is known, and keep runtime generation where the same shared language needs to accept decisions that cannot be defined ahead of time—or where the alternative is a growing collection of special-case APIs and overrides. Then measure the actual product. The old performance problems were real. They were evidence against particular implementations, not a law of the category.
