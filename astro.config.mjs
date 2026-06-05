import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';

export default defineConfig({
  site: 'https://bicicletasergometricas.com',
  redirects: {
    '/melhores-bicicletas-ergometricas/bicicleta-ergometrica-kikos/':     '/melhores-bicicletas-ergometricas/kikos/',
    '/melhores-bicicletas-ergometricas/bicicleta-ergometrica-randers/':   '/melhores-bicicletas-ergometricas/randers/',
    '/melhores-bicicletas-ergometricas/bicicleta-ergometrica-athletic/':  '/melhores-bicicletas-ergometricas/athletic/',
    '/melhores-bicicletas-ergometricas/bicicleta-ergometrica-moviment/':  '/melhores-bicicletas-ergometricas/moviment/',
    '/melhores-bicicletas-ergometricas/bicicleta-ergometrica-technogym/': '/melhores-bicicletas-ergometricas/technogym/',
    '/melhores-bicicletas-ergometricas/bicicleta-ergometrica-wellness/':  '/melhores-bicicletas-ergometricas/wellness/',
  },
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