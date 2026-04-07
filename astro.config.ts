import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { tastyIntegration } from '@tenphi/tasty/ssr/astro';

export default defineConfig({
  site: 'https://tenphi.me',
  integrations: [react(), tastyIntegration({ islands: false }), sitemap()],
});
