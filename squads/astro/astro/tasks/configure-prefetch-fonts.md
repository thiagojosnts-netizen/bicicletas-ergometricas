# Task: Configure Prefetch + Fonts

**Task ID:** configure-prefetch-fonts
**Executor:** Agent
**Owner:** harry-roberts + nate-moore (prefetch config)
**Purpose:** Setup font loading strategy + link prefetching for faster perceived navigation.
**Duration:** 30-45 minutes

---

## Inputs

| Parameter | Required | Description |
|-----------|----------|-------------|
| `fonts` | Yes | List of font family names + weights needed |
| `font_source` | Yes | google / self_hosted / both |
| `prefetch_strategy` | Yes | hover / viewport / tap / load |

---

## Preconditions

- [ ] Astro project with layouts
- [ ] Font files available (woff2 preferred)

---

## Steps

### 1. Self-host fonts (critical — don't use Google Fonts CDN)

**Why:** Google Fonts CDN costs DNS + TLS handshake + HTTP round-trip. Self-hosted fonts on your origin are faster.

**Download:**
```bash
# Using google-webfonts-helper or similar
# Or download .ttf from Google, convert:
npx fonttools woff2 Inter.ttf
```

Place in `public/fonts/`:
```
public/fonts/
├── inter-regular-subset.woff2
├── inter-medium-subset.woff2
├── inter-bold-subset.woff2
└── inter-variable-subset.woff2
```

### 2. Subset fonts (remove unused glyphs)

```bash
npm install -g glyphhanger
glyphhanger --subset=./public/fonts/Inter.woff2 --US_ASCII --LATIN
```

Typical savings: 60-90% reduction. A full Inter file is 200kb; subsetted to Latin is ~30kb.

### 3. Preload critical fonts in layout head

```astro
---
// src/layouts/BaseLayout.astro
---
<head>
  <!-- Critical fonts first -->
  <link
    rel="preload"
    href="/fonts/inter-variable-subset.woff2"
    as="font"
    type="font/woff2"
    crossorigin
  />
  
  <!-- ... rest of head -->
</head>
```

**Gotcha:** `crossorigin` is NOT optional — without it, the preload is useless.

### 4. Declare @font-face with swap + size-adjust

```astro
<style is:global>
  @font-face {
    font-family: 'Inter';
    src: url('/fonts/inter-variable-subset.woff2') format('woff2-variations');
    font-display: swap;
    font-weight: 100 900;
    font-style: normal;
    /* Match fallback metrics to prevent CLS on swap */
    size-adjust: 107%;
  }

  /* Optional: matched fallback for zero-CLS swap */
  @font-face {
    font-family: 'Inter Fallback';
    src: local('Arial');
    size-adjust: 107%;
    ascent-override: 90%;
    descent-override: 22%;
    line-gap-override: 0%;
  }

  body {
    font-family: 'Inter', 'Inter Fallback', system-ui, sans-serif;
  }
</style>
```

### 5. Use font-fallback-generator for size-adjust values

https://screenspan.net/fallback or https://github.com/seek-oss/capsize

Input your font + fallback → get adjusted metrics. Reduces CLS from font swap to zero.

### 6. Configure Astro prefetch

Astro 4+ supports link prefetching:

```js
// astro.config.mjs
export default defineConfig({
  prefetch: {
    prefetchAll: false,  // only prefetch marked links
    defaultStrategy: 'hover',  // hover | tap | viewport | load
  },
});
```

Then mark links to prefetch:

```astro
<a href="/blog/popular-post" data-astro-prefetch>Read more</a>
```

Or prefetch all links of a certain type:

```js
// astro.config.mjs
export default defineConfig({
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',  // prefetch when link enters viewport
  },
});
```

**Strategy guide:**
- `load`: prefetch on page load (aggressive — use sparingly, usually only for single critical next page)
- `hover`: prefetch when user hovers over link (desktop) or touches (mobile) — good default
- `tap`: prefetch on link tap (reduces waste but slower feel)
- `viewport`: prefetch when link enters viewport (great for long-scroll pages with "next post")

### 7. Disable prefetch for specific links

```astro
<a href="/huge-page" data-astro-prefetch="false">No prefetch</a>
```

### 8. Exclude fonts from prefetching (they're preloaded instead)

Astro's prefetch doesn't touch fonts by default — only navigation links.

### 9. Measure impact

**Before/after Lighthouse:**
- "Ensure text remains visible during webfont load" audit
- LCP (if LCP is a text element)
- CLS (should drop to near zero with size-adjust)

### 10. Monitor for regressions

Add CI check for font file sizes:
```bash
# Fail if any font > 50kb
find public/fonts -name "*.woff2" -size +50k -exec echo "Font too large: {}" \; -exec false \;
```

---

## Outputs

- `public/fonts/` with subsetted woff2 files
- Layout with preload + @font-face declarations
- Prefetch config in astro.config.mjs
- Links marked with data-astro-prefetch
- Fallback @font-face with matched metrics

---

## Validation

- [ ] Fonts self-hosted (not via Google Fonts CDN)
- [ ] Preload with `crossorigin` attribute
- [ ] `font-display: swap` set
- [ ] size-adjust configured to match fallback metrics
- [ ] Critical fonts preloaded
- [ ] Prefetch strategy set
- [ ] CLS < 0.1 (verified in Lighthouse)
- [ ] No FOIT (Flash of Invisible Text)

---

## Anti-Patterns

- ❌ `<link href="https://fonts.googleapis.com/...">` — use self-hosted
- ❌ Preload without `crossorigin` — silently fails
- ❌ `font-display: block` — causes FOIT (blank text for 3s)
- ❌ No size-adjust — causes layout shift on font swap
- ❌ `prefetchAll: true` without `strategy: 'viewport'` — wastes bandwidth
- ❌ Using .ttf or .otf — larger than woff2, no compression

---

## Handoff

- **`@astro:harry-roberts`** — advanced CSS / critical CSS integration
- **`@astro:addy-osmani`** — measure CWV impact
- **`@astro:matt-kane`** — font preload + image preload priority conflict

---

## Error Handling

**Fonts not loading:**
- Check file paths (starts with `/` for public/)
- Check CORS for cross-origin fonts (needs crossorigin header)
- Check woff2 format spec in @font-face

**Still seeing FOUT:**
- size-adjust not configured
- Fallback font doesn't match — use font-fallback-generator

**Prefetch doesn't work:**
- Check browser supports (Chrome 121+, Firefox 124+)
- Check link has `data-astro-prefetch` (or prefetchAll: true)
- Check link is same-origin (cross-origin prefetch limited)
