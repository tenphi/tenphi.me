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

### What does that cost in practice?

On an Apple M3 Pro with Node 24, Tasty's [style-pipeline benchmark](https://github.com/tenphi/tasty/blob/91a04cc/src/pipeline/pipeline.bench.ts) produced these results:

| Work | Average time |
| --- | ---: |
| Generate five new style properties | ~12 µs |
| Generate a new complex state map | ~33 µs |
| Reuse that state map from cache | ~0.09 µs |

These are microbenchmarks, not page-load or React-render scores. They demonstrate a narrower point: new CSS has a small measurable cost, while reusing the state map was roughly 350 times cheaper in this test. The benchmark is in the repository and anyone can rerun it with `pnpm bench`; exact numbers will vary by machine.

Production matters more. In Sentry profiles from [Cube](https://cubecloud.dev/), an enterprise application built with the Tasty-powered [Cube UI Kit](https://github.com/cube-js/cube-ui-kit), style processing accounts for roughly 10–20% of measured CPU work during loading and navigation. A separate manual browser performance recording of a real user navigation put Tasty at 12.4% of main-thread busy time. The trace attributed no style invalidation to Tasty; styling was never the dominant cost in any task, and its share stayed proportional as the application got busier.

These are internal measurements rather than controlled public benchmarks. Cached styles make the warm path much cheaper, even when React renders a component again. The cost can still grow if a component produces genuinely new style combinations in a tight loop, but nothing in these traces shows that pattern or any noticeable freezes or interaction stalls. In the application people actually use, Tasty is measurable but difficult to call a meaningful bottleneck.

## “Every inserted rule recalculates the whole page”

This claim is too strong. Adding a rule does not immediately recalculate the whole page. Modern browsers usually collect style changes and process them together.

React may split rendering into several parts. If a library changes the stylesheet during each part, the browser gets several chances to recalculate styles. It often will not, but it can.

Tasty's `TastyBatchProvider` avoids that uncertainty. It holds new rules while components render, then applies them in React's [`useInsertionEffect`](https://react.dev/reference/react/useInsertionEffect) before layout effects can measure the page. Applying all queued rules in one stylesheet update saves a little more work, but predictable timing is the main benefit.

## “Generated styles keep accumulating”

They can, especially when every combination of props produces another complete class.

Tasty reduces that growth by reusing chunks and deduplicating identical output. A hundred component instances using the same appearance do not need a hundred copies of the same CSS. The injector also tracks which rules are still in use. Its stylesheet garbage collector keeps a bounded cache for quick reuse, then removes the oldest unused rules during browser idle time when that cache grows too large. Rules still referenced by components or still present in the DOM are never collected.

This does not make unlimited dynamic CSS free. An application that continuously creates unique values that remain active can still grow its stylesheet and should measure that behavior. The point is that accumulation can be controlled rather than accepted as an unavoidable feature of CSS-in-JS.

## “Every styled element adds React overhead”

Older implementations often wrapped each styled component in hooks or theme context consumers. Even a simple element paid that cost whenever React rendered it.

Tasty components do not use hooks or React context to generate their styles. A cached component follows a short path: it reuses the known classes and renders the element.

This design also answers a newer criticism.

## “SSR is slow and flawed, and Server Components are unsupported”

Tasty components can run as React Server Components without adding a `'use client'` boundary. On a server-only page, they produce HTML and CSS without sending the Tasty runtime to the browser.

In an interactive server-rendered application, Tasty collects the CSS while React renders and can stream it with the page. It also tells the browser which classes were already generated. During hydration, the client recognizes those classes and does not generate or inject them again.

Server rendering therefore does not have to mean a flash of unstyled content followed by duplicated client work. Avoiding both requires an implementation designed for the server from the beginning.

That answers how runtime CSS-in-JS can avoid its old failure modes. It leaves a harder question: if build-time CSS is cheaper, why keep a runtime at all?

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

Owning both the parser and the generator can also turn the DSL into a compatibility layer. Earlier Tasty versions emulated `gap` in flex layouts; the [fallback was removed in 2022](https://github.com/cube-js/cube-ui-kit/commit/cb3b543bc88a7fa3a33d4bb7c3a5749a39a5d8c4) when native support was sufficient for Tasty's target browsers. Tasty's [`gap` still works in ordinary block and inline layouts](https://github.com/tenphi/tasty/blob/main/src/styles/gap.ts), where native CSS `gap` has no effect, by generating spacing between children.

Experimental CSS `@function` rules show the same idea. The developer chooses whether Tasty emits native rules or [inlines their calls into ordinary CSS](https://github.com/tenphi/tasty#css-functions-function) at parse time. Tasty never makes that choice through browser feature detection: the same input must produce the same result on the server and client, so SSR remains deterministic.

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
<Grid columns="1fr 1fr" flow="row" width="100%" gap="2x">…</Grid>
```

The concise API is only the visible part. Behind it, style props can expose nearly any CSS capability while the design system still governs tokens, recipes, and component APIs. Compound components share state without prop drilling, and intersecting states resolve without source-order or specificity fights. The result is less styling code, deeper design-system integration, and faster development—a substantial return for a runtime cost that remains small in production.

Tailwind remains an excellent rapid-building framework. Tasty is not trying to beat it at being a utility framework; it is an engine for creating a design-system-owned language. The fair comparison begins after that system has defined its primitives.

## Three products, three execution models

[Cube](https://cubecloud.dev/) and its open-source [Cube UI Kit](https://cube-ui-kit.vercel.app/) ([source](https://github.com/cube-js/cube-ui-kit)) use Tasty fully at runtime—the most demanding case.

[tasty.style](https://tasty.style) ([source](https://github.com/tenphi/tasty.style)) uses Next.js, React Server Components, and streaming SSR, with excellent Lighthouse performance.

[tenphi.me](https://tenphi.me) ([source](https://github.com/tenphi/tenphi.me)) uses Astro to render Tasty React components and collect their styles during the build. The browser receives static HTML and CSS with no Tasty runtime.

The same engine can therefore run in the browser, on the server, or during the build. The right choice depends on where a product needs flexibility and where it wants to pay the cost.

## A better verdict

Runtime CSS-in-JS is not free. It adds code to the bundle, genuinely new styles still require work, and plain CSS or a compiled solution can be better for a simple or mostly static project.

“Runtime CSS-in-JS is fundamentally slow” is no longer a useful conclusion. A better verdict is this: runtime generation is a cost, not a failure mode. Whether that cost is worth paying depends on how much work the library repeats, how it controls rule injection and lifetime, where it can run, and what freedom its authoring model buys.

Tasty is one set of answers, not the only possible one. If you do not like its styling model, build a different solution. The entire project is MIT-licensed, including the caching, chunking, injection, SSR, and extraction code.

The point is that the old problems can be solved—and a category should not be condemned forever for implementation choices made years ago.
