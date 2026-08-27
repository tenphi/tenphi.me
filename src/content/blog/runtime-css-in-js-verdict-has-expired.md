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

When a Tasty component renders with the same styles, it remembers the class names it produced before and skips CSS generation. When styles are dynamic, Tasty does not treat the entire component as one indivisible block. It splits the result into reusable chunks, such as layout, dimensions, typography, and appearance.

Imagine that a component changes only its padding. Tasty can reuse its existing color, typography, and layout classes and generate only the changed spacing chunk. Another component using the same chunk can reuse it too.

There are additional caches inside the parser and the style pipeline, but the important idea is simple: repeated work should stop at the earliest possible layer. A React render does not have to mean another CSS render.

## “Every inserted rule recalculates the whole page”

This claim is too strong. Adding a rule invalidates style, but it does not immediately recalculate the whole page. Browsers can collect several changes and resolve them together when styles are needed.

React may split rendering into several parts. If a library changes the stylesheet during each part, the browser gets several chances to recalculate styles. It often will not, but it can.

Tasty's `TastyBatchProvider` avoids that uncertainty. It holds new rules while components render, then applies them in React's [`useInsertionEffect`](https://react.dev/reference/react/useInsertionEffect) before layout effects can measure the page. The browser can resolve those writes together; predictable timing is the main benefit.

## “Generated styles keep accumulating”

They can, especially when every combination of props produces another complete class.

Tasty reduces that growth by reusing chunks and deduplicating identical output. A hundred component instances using the same appearance do not need a hundred copies of the same CSS. The injector also tracks which rules are still in use. Its stylesheet garbage collector keeps a bounded cache for quick reuse, then removes the oldest unused rules during browser idle time when that cache grows too large. Rules still referenced by components or still present in the DOM are never collected.

This does not make unlimited dynamic CSS free. An application that continuously creates unique values that remain active can still grow its stylesheet and should measure that behavior. The point is that accumulation can be controlled rather than accepted as an unavoidable feature of CSS-in-JS.

## “Every styled element adds React overhead”

Older implementations often wrapped each styled component in hooks or theme context consumers. Even a simple element paid that cost whenever React rendered it.

Tasty components do not need hooks or React context to generate styles. A warmed component follows a short path, but its wrapper still handles props and abstractions, so it is not free.

## What does the runtime cost in practice?

Generation, injection, and wrapper overhead are different costs. Tasty's public benchmarks measure them separately. On an Apple M3 Pro, the current results are:

| Measured work | Added time |
| --- | --- |
| Render one warmed `tasty()` wrapper | ~1 µs per element |
| Generate a new style | ~12–33 µs |
| Reuse a cached style | ~0.09 µs |
| Generate, inject, and resolve one new rule | ~0.11 ms |
| Generate and inject 1,000 new rules, then resolve styles once | ~7–8 ms total |

The wrapper and injection results come from production builds with React 19.2.4 and Chromium 151; generation and cache results come from Node 24. The numbers should not be added together: the end-to-end injection benchmark already includes generation and subtracts the same DOM update and style resolution performed with equivalent CSS already present.

The [style-pipeline benchmark](https://github.com/tenphi/tasty/blob/cda0696a96d46d812ab99981b3409cd63437235e/docs/runtime-benchmarks.md#core-style-pipeline), [wrapper-overhead benchmark](https://github.com/tenphi/tasty/blob/cda0696a96d46d812ab99981b3409cd63437235e/docs/runtime-benchmarks.md#empty-wrapper-overhead), and [cold-generation-and-injection benchmark](https://github.com/tenphi/tasty/blob/cda0696a96d46d812ab99981b3409cd63437235e/docs/runtime-benchmarks.md#cold-generation-and-injection) are public and reproducible. The injection curve measures groups of 1, 10, 100, and 1,000 new rules with one style-resolution boundary per group. Exact results will vary by machine, but the shape is more important: cached work is extremely cheap, while a large burst of unique rules can become meaningful even when the browser resolves the changes together.

A [representative React benchmark](https://github.com/tenphi/tasty/blob/cda0696a96d46d812ab99981b3409cd63437235e/docs/runtime-benchmarks.md#representative-react-tree) puts those costs in one update. With 1,000 elements sharing 20 style combinations, existing CSS took 1.64–1.70 ms, warm Tasty took 4.17–4.43 ms, and introducing 20 new shared combinations took 4.62–4.80 ms. In this deliberately busy tree, the new styles added only 0.38–0.55 ms over the warm Tasty path because each combination was generated once and reused across many elements.

Product profiles complete the picture. In Sentry profiles from [Cube](https://cubecloud.dev/), an enterprise application built with the Tasty-powered [Cube UI Kit](https://github.com/cube-js/cube-ui-kit), style processing accounts for roughly 10–20% of measured CPU work during loading and navigation. A separate navigation trace put Tasty at 12.4% of main-thread busy time; it was never the dominant cost in any task and caused no noticeable freezes or interaction stalls.

Those production figures are internal measurements, not controlled public benchmarks. Together with the reproducible tests, they show overhead that is measurable but difficult to call a bottleneck in this application. A product that creates many unique styles in one interaction should still profile that workload.

CSS and browser rendering are already complex runtime systems. Poorly timed layout reads, expensive paint, or simply too much DOM work can drop frames regardless of how styles were authored, just as unnecessary renders can in React.

> Profiling is routine engineering hygiene, not an admission that a styling model has failed.

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

A live value does not by itself require runtime CSS generation. A statically styled component can pass a user-selected color or dimension through React's `style` prop, either directly or via a CSS custom property, and that is enough for many cases.

The difference appears when those values must participate in CSS states. Consider a customizable button with different background colors for its default, hover, pressed, and disabled states. A static solution must define those state selectors in advance, expose a separate custom property for each background, and set every property at runtime. Every route from application data into CSS has to be designed before the build.

At runtime, Tasty works more like a lazy compiler. It receives the actual style object and maps it directly to whatever properties, states, and conditions the application requests, generating only the combinations that are used. There is no need to predeclare custom properties merely as pipes into every possible state. This structural freedom—not merely accepting live values—is what runtime generation uniquely provides.

The DSL itself is a separate benefit. The same parser and generator can run during the build, on the server, or in the browser.

## “A CSS DSL will always fall behind CSS”

That risk is real. Any abstraction has to follow a platform that keeps moving, and an abandoned DSL freezes on the day its maintainers stop.

Tasty minimizes that gap by staying close to CSS. It accepts every standard CSS property and parses ordinary CSS values, so most of a style object remains familiar CSS. Design-system syntax is optional sugar:

```tsx
backgroundColor: 'color-mix(in oklch, var(--purple-color) 10%, transparent)',
// Or, with Tasty sugar:
fill: '#purple.1',
```

Owning both the parser and the generator can also turn the DSL into a compatibility layer. Earlier Tasty versions emulated `gap` in flex layouts; the [fallback was removed in 2022](https://github.com/cube-js/cube-ui-kit/commit/cb3b543bc88a7fa3a33d4bb7c3a5749a39a5d8c4) when native support was sufficient for Tasty's target browsers. Tasty's [`gap` still works in ordinary block and inline layouts](https://github.com/tenphi/tasty/blob/cda0696a96d46d812ab99981b3409cd63437235e/src/styles/gap.ts), where native CSS `gap` has no effect, by generating spacing between children.

Experimental CSS `@function` rules show the same idea. The developer chooses whether Tasty emits native rules or [inlines their calls into ordinary CSS](https://github.com/tenphi/tasty/blob/cda0696a96d46d812ab99981b3409cd63437235e/README.md#css-functions-function) at parse time. Tasty never makes that choice through browser feature detection: the same input must produce the same result on the server and client, so SSR remains deterministic.

A DSL creates maintenance work. Owning the transformation also lets Tasty extend CSS instead of merely following it.

## “Object notation is a bad abstraction for CSS”

Sometimes it is. CSS properties are not independent keys: `padding` can reset `paddingTop`, so naively merging two objects and emitting their declarations in a different order can change the result. A library promising predictable composition cannot ignore that.

Tasty reduces the problem by recommending canonical style families such as `padding`, `fill`, and `flow`, plus predefined style sets that avoid exposing overlapping properties. When shorthand and longhand forms still meet, Tasty resolves the family before generating CSS using a fixed priority order rather than object order. For padding, the broad `padding` value is applied first, block and inline values override it, and individual sides win last.

For intentional customization, tokens are often cleaner than competing declarations:

```tsx
padding: '$v-padding $h-padding',
```

A component can expose those tokens instead of asking consumers to override one part of a shorthand. This is not a perfect object model of every CSS cascade rule, but it is a deliberate and stable interpretation—predictable enough that authors do not have to manage declaration order themselves.

Optional tooling can enforce that contract before runtime. Tasty's [ESLint plugin](https://github.com/tenphi/eslint-plugin-tasty) validates style syntax, project tokens, states, and design-system conventions while steering styles toward the project's preferred, conflict-resistant form.

## “Tailwind is faster for building interfaces”

On the first day, it often is. Tailwind arrives with a utility vocabulary ready to use. Tasty asks a design system to define that vocabulary, so comparing the unopened engine with a ready-made framework is not quite one-to-one.

Once those primitives exist, everyday styling can be just as direct. Cube UI Kit's [`Grid`](https://github.com/cube-js/cube-ui-kit/blob/main/src/components/layout/Grid.tsx), for example, can be used like this:

```tsx
<Grid columns="1fr 1fr" flow="row" width="100%" gap="2x">
  …
</Grid>
```

The concise API is only the visible part. Behind it, style props can expose nearly any CSS capability while the design system still governs tokens, recipes, and component APIs. Compound components share state without prop drilling, and intersecting states resolve without source-order or specificity fights. The result is less styling code, deeper design-system integration, and faster development—a substantial return for a runtime cost that remains small in production.

Tailwind remains an excellent rapid-building framework. Tasty is not trying to beat it at being a utility framework; it is an engine for creating a design-system-owned language. The fair comparison begins after that system has defined its primitives.

## Three products, three execution models

[Cube](https://cubecloud.dev/) and its open-source [Cube UI Kit](https://cube-ui-kit.vercel.app/) ([source](https://github.com/cube-js/cube-ui-kit)) use Tasty fully at runtime—the most demanding case.

[tasty.style](https://tasty.style) ([source](https://github.com/tenphi/tasty.style)) uses Next.js, React Server Components, and streaming SSR, with excellent Lighthouse performance.

[tenphi.me](https://tenphi.me) ([source](https://github.com/tenphi/tenphi.me)) uses Astro to render Tasty React components and collect their styles during the build. The browser receives static HTML and CSS with no Tasty runtime.

The same engine can therefore run in the browser, on the server, or during the build. The right choice depends on where a product needs flexibility and where it wants to pay the cost.

## A better verdict

Runtime CSS-in-JS is not free. A wrapper adds a small recurring cost, and genuinely new styles must still be generated and inserted. Caching removes repeated style work, batching controls when stylesheet changes become visible, and build-time extraction can remove the styling runtime entirely.

So the verdict is simple: deliver CSS statically where you can, use runtime generation where it buys something concrete, and measure the actual product. Runtime CSS-in-JS is a trade-off, not an automatic performance failure.

Tasty is one set of answers, not the only possible one. If you prefer another styling model, build it—the entire project is MIT-licensed, including its caching, batching, SSR, and extraction code.

> The point is that the old problems can be solved—and a category should not be condemned forever for implementation choices made years ago.
