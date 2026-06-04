// Template: Optimal astro.config.mjs
// Purpose: Production-ready baseline for Astro projects
// Usage: Copy + uncomment the integrations you need, adjust adapter
// Author: Astro Squad (astro-chief + nate-moore)

import { defineConfig } from 'astro/config';

// ═══ ADAPTER (choose ONE — post-Cloudflare acquisition, Cloudflare is default) ═══
import cloudflare from '@astrojs/cloudflare';
// import vercel from '@astrojs/vercel';
// import netlify from '@astrojs/netlify';
// import node from '@astrojs/node';

// ═══ UI FRAMEWORKS (choose ONE unless specific reason for multiple) ═══
// import preact from '@astrojs/preact';   // Recommended default (3kb runtime)
// import react from '@astrojs/react';      // For React ecosystem libs
// import vue from '@astrojs/vue';
// import svelte from '@astrojs/svelte';
// import solid from '@astrojs/solid-js';
// import lit from '@astrojs/lit';

// ═══ CONTENT ═══
// import mdx from '@astrojs/mdx';

// ═══ STYLING ═══
// import tailwind from '@astrojs/tailwind';

// ═══ UTILITY ═══
// import sitemap from '@astrojs/sitemap';
// import partytown from '@astrojs/partytown';

// ═══ MARKDOWN PLUGINS (if using .md/.mdx) ═══
// import remarkGfm from 'remark-gfm';
// import rehypeSlug from 'rehype-slug';
// import rehypeAutolinkHeadings from 'rehype-autolink-headings';
// import rehypeExternalLinks from 'rehype-external-links';

export default defineConfig({
  // ─── SITE URL (required for sitemap, canonical URLs) ───
  site: 'https://example.com',

  // ─── OUTPUT MODE ───
  // 'static'  = all pages prerendered (default)
  // 'server'  = all pages SSR
  // 'hybrid'  = static by default, opt-in SSR per route via `export const prerender = false`
  output: 'hybrid',

  // ─── ADAPTER ───
  adapter: cloudflare({
    // Use Node runtime for build-time (sharp image optimization works)
    // but Cloudflare Workers (workerd) at runtime
    prerenderEnvironment: 'node',

    // Local dev parity with workerd
    platformProxy: { enabled: true },

    // If using Cloudflare Images for runtime image optimization:
    // imageService: 'cloudflare',
  }),

  // ─── INTEGRATIONS (order matters) ───
  integrations: [
    // 1. Content transforms (MDX must come before UI frameworks so components work in MDX)
    // mdx({
    //   remarkPlugins: [remarkGfm],
    //   rehypePlugins: [
    //     rehypeSlug,
    //     [rehypeAutolinkHeadings, {
    //       behavior: 'append',
    //       content: { type: 'text', value: ' #' },
    //     }],
    //     [rehypeExternalLinks, {
    //       target: '_blank',
    //       rel: ['noopener', 'noreferrer'],
    //     }],
    //   ],
    //   shikiConfig: { theme: 'github-dark', wrap: true },
    //   gfm: true,
    // }),

    // 2. UI framework (uncomment one)
    // preact(),

    // 3. Styling
    // tailwind({
    //   applyBaseStyles: true,  // generate preflight in component styles
    // }),

    // 4. Post-build utilities (sitemap last — needs final route list)
    // sitemap({
    //   changefreq: 'weekly',
    //   priority: 0.7,
    //   lastmod: new Date(),
    // }),

    // 5. Third-party script offload to Web Worker (optional, complex)
    // partytown({ config: { forward: ['dataLayer.push'] } }),
  ],

  // ─── MARKDOWN CONFIG (applies to .md files; inherited by MDX unless overridden) ───
  markdown: {
    // remarkPlugins: [remarkGfm],
    // rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings, rehypeExternalLinks],
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
    gfm: true,
  },

  // ─── IMAGE SERVICE ───
  image: {
    // Authorized remote image domains (CMS URLs, etc.)
    domains: [],
    // Wildcard patterns:
    // remotePatterns: [{ protocol: 'https', hostname: '**.mycdn.com' }],

    // Service options:
    // service: { entrypoint: 'astro/assets/services/sharp' },     // default, Node-only
    // service: { entrypoint: 'astro/assets/services/cloudflare' }, // for CF Images runtime
    // service: passthroughImageService(),                         // no optimization (pre-optimized)
  },

  // ─── BUILD ───
  build: {
    // 'auto' inlines CSS under 4kb; 'always' inlines all; 'never' links all
    inlineStylesheets: 'auto',

    // Build output directory (default 'dist')
    format: 'directory',  // directory (nginx-friendly) or file (server-friendly)
  },

  // ─── PREFETCH ───
  prefetch: {
    // Don't prefetch everything by default — opt in per link
    prefetchAll: false,
    // For each link marked with data-astro-prefetch, when to prefetch:
    defaultStrategy: 'hover',  // hover | tap | viewport | load
  },

  // ─── DEV SERVER ───
  server: {
    port: 4321,
    host: false,  // set true for LAN access during dev
  },

  // ─── I18N (optional) ───
  // i18n: {
  //   defaultLocale: 'en',
  //   locales: ['en', 'pt-br', 'es'],
  //   routing: {
  //     prefixDefaultLocale: false,
  //   },
  // },

  // ─── EXPERIMENTAL ───
  experimental: {
    // clientPrerender: true,   // prerender links on hover (Chrome only)
    // actions: true,           // Astro Actions (stable in 5+)
  },

  // ─── VITE PASSTHROUGH ───
  vite: {
    // Direct Vite config — use for plugins not wrapped in integrations
    plugins: [
      // import { visualizer } from 'rollup-plugin-visualizer';
      // visualizer({ open: true, gzipSize: true, brotliSize: true }),
    ],
    resolve: {
      alias: {
        // '@': '/src',
      },
    },
    // ssr: {
    //   noExternal: ['some-esm-only-package'],
    // },
  },
});
