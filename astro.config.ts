import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { tastyIntegration } from '@tenphi/tasty/ssr/astro';
import { tastyCodeTheme } from './src/lib/shiki-theme';
import type { LanguageRegistration } from 'shiki';
import tastyGrammar from './src/lib/tasty.tmLanguage.json';

const tastyLang = {
  ...tastyGrammar,
  name: 'tasty',
  injectTo: ['source.tsx', 'source.ts', 'source.js', 'source.jsx'],
} as unknown as LanguageRegistration;

export default defineConfig({
  site: 'https://tenphi.me',
  server: { host: '0.0.0.0' },
  vite: {
    // Discover the lazy router's dependencies up front in dev, so its first
    // import doesn't trigger Vite's dependency-optimization page reload.
    optimizeDeps: {
      include: [
        'astro/virtual-modules/transitions-router.js',
        'astro/virtual-modules/transitions-types.js',
        'astro/virtual-modules/transitions-events.js',
        'astro/virtual-modules/transitions-swap-functions.js',
      ],
    },
    server: {
      watch: {
        useFsEvents: false,
        usePolling: true,
      },
    },
  },
  markdown: {
    shikiConfig: {
      theme: tastyCodeTheme,
      langs: [tastyLang],
    },
  },
  integrations: [
    react(),
    mdx(),
    tastyIntegration({ islands: false, css: { mode: 'extract' } }),
    sitemap(),
  ],
});
