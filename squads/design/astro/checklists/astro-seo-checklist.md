# Astro SEO Checklist

**Version:** 1.0.0
**Owner:** astro-chief + sarah-rainsberger
**Purpose:** Verify every production Astro site meets technical SEO standards.

---

## 📝 On-Page SEO (per page)

- [ ] `<title>` set, 50-60 characters, unique per page, keyword-relevant
- [ ] `<meta name="description">` set, ≤160 characters, unique per page
- [ ] `<h1>` present (exactly one per page)
- [ ] Heading hierarchy respected (h1 → h2 → h3, no skips)
- [ ] Canonical URL set: `<link rel="canonical" href="...">`
- [ ] Body content >300 words for indexable pages (avoid thin content)
- [ ] Internal links use descriptive anchor text (not "click here")

## 🖼️ Images for SEO

- [ ] All content images have descriptive `alt` text
- [ ] Image file names are descriptive (not `IMG_1234.jpg`)
- [ ] Hero images have a figcaption when context helps
- [ ] Astro's `<Image>` generates responsive variants (checked in markup)

## 🌐 Open Graph + Twitter Cards

- [ ] `og:type` set (`website` / `article` / `product`)
- [ ] `og:title` set
- [ ] `og:description` set
- [ ] `og:image` set (1200×630 recommended; absolute URL)
- [ ] `og:url` set (canonical)
- [ ] `og:site_name` set (consistent across site)
- [ ] `twitter:card` set (`summary_large_image` for articles)
- [ ] `twitter:title`, `twitter:description`, `twitter:image` set
- [ ] Tested with OpenGraph.xyz or opengraph.dev

## 🗺️ Sitemap + Robots

- [ ] `@astrojs/sitemap` installed
- [ ] `site` set in `astro.config.mjs` (sitemap needs absolute URLs)
- [ ] `sitemap-index.xml` accessible at production URL
- [ ] Draft posts excluded from sitemap
- [ ] `public/robots.txt` exists with:
  ```
  User-agent: *
  Allow: /
  Sitemap: https://example.com/sitemap-index.xml
  ```
- [ ] `Sitemap:` directive in robots.txt points to live URL
- [ ] Sitemap submitted to Google Search Console
- [ ] Sitemap submitted to Bing Webmaster Tools

## 📊 Structured Data (JSON-LD)

For blog posts:
- [ ] `Article` or `BlogPosting` schema on post pages
  ```json
  {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "...",
    "datePublished": "...",
    "author": { "@type": "Person", "name": "..." },
    "image": "..."
  }
  ```

For products:
- [ ] `Product` schema with name, image, description, offers

For organization:
- [ ] `Organization` or `WebSite` schema in homepage

Tested with:
- [ ] Google Rich Results Test
- [ ] Schema.org Validator

## 🔄 URLs + Redirects

- [ ] URLs are clean (no `.html` extensions, no query strings for content)
- [ ] URLs are lowercase
- [ ] URLs use hyphens (not underscores)
- [ ] Old URL changes have 301 redirects to new
- [ ] No redirect chains (each redirect loses SEO juice)
- [ ] Trailing slash policy consistent (all with `/` or all without)
- [ ] `www` → `apex` (or vice versa) redirect configured at host level

## 🌍 Internationalization (if applicable)

- [ ] `<html lang="...">` set correctly per page
- [ ] `hreflang` tags for each language variant
- [ ] `x-default` hreflang for default language
- [ ] Astro i18n routing configured (Astro 4+ has built-in i18n)

## 🚀 Technical SEO

- [ ] HTTPS everywhere (no mixed content)
- [ ] Fast LCP (< 2.5s mobile) — Google page experience signal
- [ ] No INP issues (< 200ms mobile)
- [ ] Mobile-friendly (responsive viewport meta tag, readable text sizes)
- [ ] No intrusive interstitials on mobile
- [ ] robots.txt doesn't accidentally block important resources
- [ ] No `noindex` inadvertently on production pages

## 🕸️ Crawlability

- [ ] No JavaScript-only rendering (SSR or static — Astro handles this by default)
- [ ] Internal links reachable via anchor tags (not buttons with onclick)
- [ ] Pagination uses `<a>` tags (Google crawls these) + `rel="next/prev"` if long lists
- [ ] No orphan pages (every indexable page linked from somewhere)
- [ ] Search engines can access CSS/JS (robots.txt not blocking assets)

## 📈 Analytics + Search Console

- [ ] Google Search Console property verified
- [ ] Sitemap submitted to GSC
- [ ] `Index Coverage` checked — look for errors/warnings
- [ ] Core Web Vitals in GSC checked
- [ ] Bing Webmaster Tools (optional but low-effort)
- [ ] Schema.org coverage (GSC → Enhancements tab)

## 📝 Content Quality

- [ ] Posts have pubDate (schema recommends)
- [ ] Posts have author attributed
- [ ] Related internal links within content
- [ ] External links to authoritative sources (not in excess)
- [ ] No duplicate content across site
- [ ] Duplicate content across domains handled via canonical

## 🎯 Astro-Specific Best Practices

- [ ] `site` set in `astro.config.mjs`
- [ ] `@astrojs/sitemap` integration installed
- [ ] ClientRouter (View Transitions) doesn't break analytics (uses `astro:page-load`)
- [ ] Content Collections provide type-safe frontmatter (Zod schema enforced)
- [ ] Dynamic routes use `getStaticPaths` (not runtime redirect loops)

## 🚫 Hard Blockers

- ❌ `<meta name="robots" content="noindex">` on live pages (unless intentional)
- ❌ `Disallow: /` in robots.txt on production
- ❌ Redirect loop
- ❌ Broken canonical URLs (wrong domain, malformed)
- ❌ Missing `<title>` or `<meta description>` on production pages

---

## Tools

- [Google Search Console](https://search.google.com/search-console)
- [Rich Results Test](https://search.google.com/test/rich-results)
- [PageSpeed Insights](https://pagespeed.web.dev)
- [Schema.org Validator](https://validator.schema.org/)
- [Ahrefs Site Audit](https://ahrefs.com) / [Screaming Frog](https://www.screamingfrog.co.uk/seo-spider/) (SaaS)
- [OpenGraph.xyz](https://www.opengraph.xyz/) (OG preview)

---

_Last reviewed: 2026-04-18_
