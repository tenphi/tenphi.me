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
  markdown: {
    shikiConfig: {
      theme: tastyCodeTheme,
      langs: [tastyLang],
    },
  },
  integrations: [react(), mdx(), tastyIntegration({ islands: false }), sitemap()],
});
