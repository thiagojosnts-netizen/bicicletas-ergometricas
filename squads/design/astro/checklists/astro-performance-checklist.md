# Astro Performance Checklist

**Version:** 1.0.0
**Owner:** astro-chief + addy-osmani
**Purpose:** Validate every production Astro site against performance budgets.
**Apply:** After any optimization work, before PR merge, on every production deploy.

---

## 🎯 Core Web Vitals Targets

- [ ] **LCP < 2.5s** on mobile (75th percentile) — measured via PageSpeed Insights
- [ ] **INP < 200ms** on mobile (75th percentile) — measured via CrUX field data
- [ ] **CLS < 0.1** (75th percentile)
- [ ] **TTFB < 800ms** (75th percentile)
- [ ] **Lighthouse Performance >= 95** on mobile preset

## 🖼️ Images

- [ ] All content images use `<Image>` or `<Picture>` (never raw `<img>` for content)
- [ ] Exception: decorative images in `public/` (logos, icons) that are already pre-optimized
- [ ] LCP image has `loading="eager"` and `fetchpriority="high"`
- [ ] LCP image preloaded in layout `<head>` with `<link rel="preload" as="image">`
- [ ] All images have `width` and `height` attributes (prevents CLS)
- [ ] Browser-modern format delivered (AVIF or WebP — verified in DevTools Network)
- [ ] Remote images have their domains whitelisted in `astro.config.mjs`
- [ ] Below-the-fold images use default `loading="lazy"`
- [ ] No images larger than their display size (verify via Network tab file sizes vs rendered dimensions)

## 📦 JavaScript Budget

- [ ] Total JS transferred on landing page: **< 70kb gzipped**
- [ ] Total JS transferred on interactive page: **< 120kb gzipped**
- [ ] No `client:load` without documented justification
- [ ] Below-the-fold islands use `client:visible` (not `client:load`)
- [ ] Non-critical interactivity uses `client:idle`
- [ ] `client:only` only when SSR genuinely fails (browser-only APIs)
- [ ] Only one UI framework installed (unless documented reason for multiple)
- [ ] No `Moment.js` in 2026 — use `date-fns` or `Intl`
- [ ] No `lodash` full import — use `lodash-es` or `es-toolkit` tree-shaken
- [ ] No icon library full import — use individual icon imports

## 🎨 CSS Budget

- [ ] Total CSS transferred: **< 50kb gzipped**
- [ ] Critical CSS inlined (via Astro's `inlineStylesheets: 'auto'` or manual inline)
- [ ] Tailwind `content` array covers all file types used (`.astro, .md, .mdx, .ts, .tsx, .vue, .svelte`)
- [ ] DevTools Coverage shows < 20% unused CSS
- [ ] No `!important` outside utility layer
- [ ] No `@import` inside stylesheets (synchronous chain)

## 🔤 Fonts

- [ ] Fonts self-hosted (not Google Fonts CDN)
- [ ] Fonts in woff2 format (not ttf/otf)
- [ ] Fonts subsetted to needed glyphs (typical 60-90% reduction)
- [ ] Critical fonts preloaded with `crossorigin` attribute
- [ ] `font-display: swap` on all @font-face declarations
- [ ] `size-adjust` + `ascent-override` / `descent-override` to match fallback metrics
- [ ] Fallback font stack includes system fonts (`system-ui`, `-apple-system`, etc.)
- [ ] No font files > 50kb (individual)

## 🌐 Network + Caching

- [ ] Static assets served with `Cache-Control: public, max-age=31536000, immutable` (Astro fingerprints URLs)
- [ ] HTML served with reasonable cache (e.g., `Cache-Control: public, max-age=0, s-maxage=3600, stale-while-revalidate=86400`)
- [ ] Gzip/Brotli enabled on the host
- [ ] HTTP/2 or HTTP/3 enabled
- [ ] No redirect chains (each redirect = extra RTT)
- [ ] `preconnect` or `dns-prefetch` for critical cross-origin resources

## 🚀 Prefetch

- [ ] Astro prefetch configured (`prefetch.defaultStrategy` set)
- [ ] Critical next-pages marked with `data-astro-prefetch`
- [ ] Heavy pages opt-out with `data-astro-prefetch="false"`

## 🧩 Islands Audit

- [ ] Inventory run: `grep -rn "client:" src/`
- [ ] Each directive choice documented (inline comment explaining)
- [ ] Bundle visualizer run at least once (see `rollup-plugin-visualizer`)

## 🔧 Build + Adapter

- [ ] Adapter runtime matches code requirements (no Sharp on workerd, etc.)
- [ ] `output` mode matches site needs (static / server / hybrid)
- [ ] Environment variables not leaked to client (no `PUBLIC_` on secrets)
- [ ] Build time < 2 minutes for typical site (>5 min = performance problem in itself)

## 📊 Monitoring

- [ ] Web-vitals RUM deployed (real user metrics)
- [ ] Lighthouse CI in GitHub Actions (budget enforcement on PRs)
- [ ] CrUX data checked regularly (28-day lagging indicator)
- [ ] Analytics configured to fire on `astro:page-load` (View Transitions-aware)

## 🔬 Verified by Measurement

Before marking complete, verify with tools:

- [ ] **Lighthouse**: `npx lighthouse {url} --preset=experimental --form-factor=mobile --view` — 3 runs, median
- [ ] **PageSpeed Insights**: https://pagespeed.web.dev/analysis?url={url} — check field data
- [ ] **WebPageTest**: https://webpagetest.org — filmstrip + waterfall
- [ ] **DevTools Network**: verify AVIF/WebP, font preload, no blocking resources
- [ ] **DevTools Coverage**: verify < 20% unused CSS
- [ ] **DevTools Performance**: record + identify long tasks

## 🚫 Hard Blockers (cannot ship)

- ❌ LCP > 4s on mobile → fix before ship
- ❌ CLS > 0.25 → fix before ship
- ❌ JS bundle > 150kb on landing → audit before ship
- ❌ Missing `alt` text on images → fix before ship (a11y + SEO)
- ❌ Secrets in PUBLIC_ env vars → fix before ship (security)

---

## Handoffs by Failing Category

| Failing item | Route to |
|--------------|----------|
| LCP / INP / CLS issues | @astro:addy-osmani |
| Image issues | @astro:matt-kane |
| CSS / fonts | @astro:harry-roberts |
| JS bundle | @astro:jason-miller |
| Adapter / TTFB | @astro:matthew-phillips |

---

_Last reviewed: 2026-04-18_
