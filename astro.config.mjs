import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';

export default defineConfig({
  site: 'https://bicicletasergometricas.com',
  integrations: [sitemap({
    changefreq: 'weekly',
    priority: 0.7,
    lastmod: new Date(),
  }), react()],
  build: {
    inlineStylesheets: 'auto',
    format: 'directory',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});