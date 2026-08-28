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

The measurements were valid. What has expired is the assumption that they describe an unavoidable property of runtime CSS-in-JS rather than the implementations that were measured.

Performance is only half of the case against it. A CSS DSL will supposedly fall years behind the platform, while a framework like Tailwind will always be faster to build with.

I want to revisit that case through [Tasty](https://github.com/tenphi/tasty). Tasty is a useful test because it does not merely reorganize authored CSS. It parses values, resolves states, generates rules, and injects them at runtime. If the common problems can be addressed there, they are not laws of CSS-in-JS. They are engineering choices.

## “CSS is generated again on every render”

That would indeed be slow. It is also unnecessary.

When a Tasty component renders with the same styles, it remembers the class names it produced before and skips CSS generation. Dynamic styles are split into reusable chunks such as layout, dimensions, typography, and appearance. If only padding changes, Tasty reuses the other chunks and generates just the new spacing; another component can reuse that chunk too.

There are additional caches inside the parser and the style pipeline, but the important idea is simple: repeated work should stop at the earliest possible layer. A React render does not have to mean another CSS render.

## “Every inserted rule recalculates the whole page”

This claim is too strong. Adding a rule invalidates style, but browsers can collect several changes and resolve them together when styles are needed. React may split rendering into parts, though, giving the browser several chances to recalculate if stylesheet writes are interleaved with reads.

With [batched injection](https://github.com/tenphi/tasty/blob/299eec7e2aae62a8aa940190dc77fde82bde9ac8/docs/configuration.md#batched-injection) enabled, Tasty's `TastyBatchProvider` avoids that uncertainty. It holds new rules while components render, then applies them in React's [`useInsertionEffect`](https://react.dev/reference/react/useInsertionEffect) before layout effects can measure the page. The browser can resolve those writes together; predictable timing is the main benefit.

## “Generated styles keep accumulating”

They can, especially when every combination of props produces another complete class.

Tasty reduces that growth by reusing chunks and deduplicating identical output. A hundred component instances using the same appearance do not need a hundred copies of the same CSS.

[The collector takes a deliberately cautious approach](https://github.com/tenphi/tasty/blob/299eec7e2aae62a8aa940190dc77fde82bde9ac8/docs/injector.md#garbage-collection). During browser idle time, it checks which generated classes are still present on the page. When a class disappears, its rules are not removed immediately: they receive a 10-second grace period, then the most recently unused styles remain available in a bounded cache while older ones are deleted.

That delay matters because React can generate a class before its element reaches the DOM. Treating every absent class as dead could delete a rule in the middle of a render. The grace period covers that gap without adding lifecycle tracking to every styled element, so ordinary renders do not pay extra bookkeeping costs.

This does not make unlimited dynamic CSS free. An application that continuously creates unique values that remain active can still grow its stylesheet and should measure that behavior. The point is that accumulation can be controlled rather than accepted as an unavoidable feature of CSS-in-JS.

## “Every styled element adds React overhead”

Older implementations often wrapped each styled component in hooks or theme context consumers. Even a simple element paid that cost whenever React rendered it.

Tasty components do not need hooks or React context to generate styles. A warmed component follows a short path, but its wrapper still handles props and abstractions, so it is not free.

## What does the runtime cost in practice?

Generation, injection, and wrapper overhead are different costs. I reran Tasty's current public benchmarks three times on an Apple M1 Max. The Node suite used Node 22; the browser suites used production React 19.2.8 and Chromium 151.

| Measured work | Added time |
| --- | ---: |
| Render one warmed `tasty()` wrapper | ~1.1 µs per element |
| Generate a new style | ~16–47 µs |
| Reuse a cached style | ~0.12–0.13 µs |
| Generate, inject, and resolve one new rule | ~0.16–0.18 ms |
| Generate and inject 1,000 new rules, then resolve styles once | ~10.1–10.5 ms total |

The numbers should not be added together: the end-to-end injection benchmark already includes generation and subtracts the same DOM update and style resolution performed with equivalent CSS already present.

The [style-pipeline benchmark](https://github.com/tenphi/tasty/blob/299eec7e2aae62a8aa940190dc77fde82bde9ac8/docs/runtime-benchmarks.md#core-style-pipeline), [wrapper-overhead benchmark](https://github.com/tenphi/tasty/blob/299eec7e2aae62a8aa940190dc77fde82bde9ac8/docs/runtime-benchmarks.md#empty-wrapper-overhead), and [cold-generation-and-injection benchmark](https://github.com/tenphi/tasty/blob/299eec7e2aae62a8aa940190dc77fde82bde9ac8/docs/runtime-benchmarks.md#cold-generation-and-injection) are public and reproducible. The single-rule case crosses the injection-to-resolution boundary for every rule; the 1,000-rule case makes all writes before one resolution. The latter cost only about 59–65 times as much in total, not 1,000 times as much, because fixed work was amortized and the browser could resolve the writes together.

Product profiles complete the picture. In internal Sentry profiles from [Cube](https://cubecloud.dev/), an enterprise application built with the Tasty-powered [Cube UI Kit](https://github.com/cube-js/cube-ui-kit), style processing accounts for roughly 10–20% of measured CPU work during loading and navigation. A separate trace put Tasty at 12.4% of main-thread busy time. These are observations, not controlled benchmarks, but in both cases the overhead was measurable without being the dominant cost. Products that create many unique styles in one interaction should still profile that workload.

> Every meaningful part of an application should be profiled and monitored. Performance can fail for many reasons, especially in the places nobody measures.

## “SSR is slow and flawed, and Server Components are unsupported”

Tasty components can run as React Server Components without adding a `'use client'` boundary. On a server-only page, they produce HTML and CSS without sending the Tasty runtime to the browser.

In an interactive server-rendered application, Tasty collects the CSS while React renders and can stream it with the page. It also tells the browser which classes were already generated. During hydration, the client recognizes those classes and does not generate or inject them again.

Server rendering therefore does not have to mean a flash of unstyled content followed by duplicated client work. Avoiding both requires an implementation designed for the server from the beginning.

That answers how runtime CSS-in-JS can avoid its old failure modes. It leaves a harder question:

> If build-time CSS is cheaper, why keep a runtime at all?

## “Build-time CSS is always faster”

A build-time solution does less work in the browser. It delivers CSS that has already been generated, while a runtime solution still has to generate some of it.

That is why Tasty also has `tastyStatic`. It runs the style engine during the build, writes a CSS file, and leaves class names in the application code. No styling runtime is needed in the browser.

This is not an admission that runtime CSS-in-JS failed. Runtime and build-time modes solve different problems, and static extraction is ideal when the required styling paths can be defined ahead of time.

## What runtime generation actually buys you

Live values are only a small part of the answer. An inline style or CSS custom property is often enough for a user-selected color or dimension. The more important benefit is that a reusable component can leave structural decisions open until it is used.

Consider a general-purpose `Grid`. Its author cannot know whether a consumer will need two equal columns, a fixed sidebar, named areas, or a template calculated from application data. That decision naturally belongs where the component is used. Runtime generation can take the actual `columns`, `areas`, states, and responsive conditions and produce the precise rules they require.

Static systems often handle this by defining a large set of utilities, allowed values, or component variants in advance. That can be a useful constraint when the vocabulary is intentionally bounded, but it does not provide the same open-ended API: the library still has to predict the layouts its consumers will need. Build-time extraction can go further when it can see and understand every use, but that is another constraint on where and how the component may be consumed.

At runtime, Tasty acts as a lazy compiler. It receives the styling decision at the point of use and generates only the requested structure. Values can also flow into hover, pressed, disabled, media, and container-query states without predeclaring a custom-property channel for every possibility. That structural freedom is what the runtime buys.

The DSL itself is a separate benefit. The same parser and generator can run during the build, on the server, or in the browser.

## “A CSS DSL will always fall behind CSS”

That risk is real. Any abstraction has to follow a platform that keeps moving, and an abandoned DSL freezes on the day its maintainers stop.

Tasty minimizes that gap by staying close to CSS. It accepts every standard CSS property and parses ordinary CSS values, so most of a style object remains familiar CSS. Design-system syntax is optional sugar:

```tsx
backgroundColor: 'color-mix(in oklch, var(--purple-color) 10%, transparent)',
// Or, with Tasty sugar:
fill: '#purple.1',
```

Owning the parser and generator can also turn the DSL into a compatibility layer. For experimental CSS `@function` rules, for example, the developer chooses whether Tasty emits native rules or [inlines their calls into ordinary CSS](https://github.com/tenphi/tasty/blob/299eec7e2aae62a8aa940190dc77fde82bde9ac8/README.md#css-functions-function). The choice is explicit rather than based on browser detection, keeping server and client output deterministic.

A DSL creates maintenance work. Owning the transformation also lets Tasty extend CSS instead of merely following it.

## “Object notation is a bad abstraction for CSS”

Sometimes it is. CSS properties are not independent keys: `padding` can reset `paddingTop`, so naively merging two objects and emitting their declarations in a different order can change the result. A library promising predictable composition cannot ignore that.

Tasty reduces the problem with canonical style families such as `padding`, `fill`, and `flow`. When shorthand and longhand forms meet, it resolves them in a fixed priority order rather than relying on object order. Components can also expose tokens such as `$v-padding` and `$h-padding` instead of asking consumers to override part of a shorthand. It is not a perfect object model of the cascade, but it is deliberate and predictable.

Optional tooling can enforce that contract before runtime. Tasty's [ESLint plugin](https://github.com/tenphi/eslint-plugin-tasty) validates style syntax, project tokens, states, and design-system conventions while steering styles toward the project's preferred, conflict-resistant form.

## “Tailwind is faster for building interfaces”

On the first day, it often is. Tailwind arrives with a utility vocabulary ready to use. Tasty asks a design system to define that vocabulary, so comparing the unopened engine with a ready-made framework is not quite one-to-one.

Once those primitives exist, everyday styling can be just as direct. Cube UI Kit's [`Grid`](https://github.com/cube-js/cube-ui-kit/blob/main/src/components/layout/Grid.tsx), for example, can be used like this:

```tsx
<Grid columns="1fr 1fr" flow="row" width="100%" gap="2x">
  …
</Grid>
```

Behind that concise API, style props can expose nearly any CSS capability while the design system still governs tokens, recipes, and component APIs. Compound components can share state without prop drilling, and intersecting states resolve without source-order or specificity fights.

Tailwind remains an excellent rapid-building framework. Tasty is not trying to beat it at being a utility framework; it is an engine for creating a design-system-owned language. The fair comparison begins after that system has defined its primitives.

## Three products, three execution models

[Cube](https://cubecloud.dev/) and its open-source [Cube UI Kit](https://cube-ui-kit.vercel.app/) ([source](https://github.com/cube-js/cube-ui-kit)) use Tasty fully at runtime. [tasty.style](https://tasty.style) ([source](https://github.com/tenphi/tasty.style)) uses Next.js, React Server Components, and streaming SSR. [tenphi.me](https://tenphi.me) ([source](https://github.com/tenphi/tenphi.me)) uses Astro to generate static HTML and CSS with no Tasty runtime in the browser.

The same engine can therefore run in the browser, on the server, or during the build. The right choice depends on where a product needs flexibility and where it wants to pay the cost.

## A better verdict

Runtime CSS-in-JS is not free. A wrapper adds a small recurring cost, and genuinely new styles must still be generated and inserted. Caching removes repeated style work, batching controls when stylesheet changes become visible, and build-time extraction can remove the styling runtime entirely.

So the verdict is simple: deliver CSS statically where you can, use runtime generation where it buys something concrete, and measure the actual product. Runtime CSS-in-JS is a trade-off, not an automatic performance failure.

Tasty is one set of answers, not the only possible one. If you prefer another styling model, build it—the entire project is MIT-licensed, including its caching, batching, SSR, and extraction code.

> The point is that the old problems can be solved—and a category should not be condemned forever for implementation choices made years ago.
