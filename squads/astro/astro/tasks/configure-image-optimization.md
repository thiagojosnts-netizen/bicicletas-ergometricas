# Task: Configure Image Optimization

**Task ID:** configure-image-optimization
**Version:** 1.0.0
**Executor:** Agent
**Owner agent:** matt-kane
**Purpose:** Set up Astro's image service for automatic format conversion, responsive srcset, and LCP-optimized hero images.
**Duration:** 20-40 minutes

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `adapter` | enum | Yes | cloudflare \| vercel \| netlify \| node \| static |
| `has_remote_images` | boolean | Yes | Does the site load images from external URLs? |
| `remote_domains` | string[] | If has_remote_images | Authorized domains (e.g., `cms.example.com`) |
| `hero_image_path` | string | No | Path to LCP image in src/assets/ |

---

## Preconditions

- [ ] Astro project exists
- [ ] Adapter decided (affects image service choice)
- [ ] Source images available in `src/assets/` (local) or URLs (remote)

---

## Steps

### 1. Choose image service based on adapter

**If adapter = node OR static (Node build):** default sharp service works.
No config needed — Astro uses sharp by default.

**If adapter = cloudflare:**
```js
// astro.config.mjs
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  adapter: cloudflare({
    prerenderEnvironment: 'node', // Sharp runs at build in Node, runtime is workerd
  }),
});
```

**If adapter = vercel (with Vercel Image Optimization):**
```js
import vercel from '@astrojs/vercel';
export default defineConfig({
  adapter: vercel({
    imageService: true, // uses Vercel's image CDN at runtime
  }),
});
```

**If runtime image optimization via Cloudflare Images:**
```js
export default defineConfig({
  adapter: cloudflare(),
  image: {
    service: { entrypoint: 'astro/assets/services/cloudflare' },
  },
});
```

### 2. Authorize remote image domains (if applicable)

```js
// astro.config.mjs
export default defineConfig({
  image: {
    domains: ['cms.example.com', 'cdn.example.com'],
    // or wildcard via remotePatterns:
    remotePatterns: [{ protocol: 'https', hostname: '**.example.com' }],
  },
});
```

Without this, `<Image src="https://external/..">` fails build.

### 3. Use `<Image>` for content images

```astro
---
import { Image } from 'astro:assets';
import blogHero from '../assets/blog-hero.jpg';
---
<Image
  src={blogHero}
  alt="Team collaborating at laptops"
  layout="constrained"
  width={1200}
  height={675}
/>
```

Replace every raw `<img>` tag for content images with `<Image>`.

**Exceptions (can keep `<img>`):**
- Images in `public/` that are already pre-optimized (logos, icons)
- SVGs that should remain un-transformed
- Data URIs

### 4. Use `<Picture>` for multiple formats on one image

```astro
---
import { Picture } from 'astro:assets';
import hero from '../assets/hero.jpg';
---
<Picture
  src={hero}
  formats={['avif', 'webp']}
  alt="Hero image"
  width={1600}
  height={900}
/>
```

This generates `<picture>` with AVIF + WebP + original fallback. Browser picks the best.

### 5. Configure LCP image (hero) for eager loading + priority

```astro
---
import { Image } from 'astro:assets';
import hero from '../assets/hero.jpg';
---
<Image
  src={hero}
  alt="Hero"
  layout="constrained"
  width={1200}
  height={675}
  loading="eager"
  fetchpriority="high"
/>
```

**Also preload in layout head:**
```astro
---
// src/layouts/BaseLayout.astro
import { getImage } from 'astro:assets';
const { heroImage } = Astro.props;
let optimized;
if (heroImage) {
  optimized = await getImage({ src: heroImage, width: 1200, format: 'avif' });
}
---
<head>
  {optimized && (
    <link rel="preload" as="image" href={optimized.src} fetchpriority="high" />
  )}
</head>
```

### 6. Custom Picture for art direction (different crops per viewport)

```astro
---
import { getImage } from 'astro:assets';
import mobile from '../assets/hero-mobile.jpg';
import desktop from '../assets/hero-desktop.jpg';

const mobileImg = await getImage({ src: mobile, format: 'avif', widths: [400, 800] });
const desktopImg = await getImage({ src: desktop, format: 'avif', widths: [960, 1920] });

const { alt } = Astro.props;
---
<picture>
  <source media="(max-width: 767px)" type="image/avif" srcset={mobileImg.srcSet.attribute} sizes="100vw" />
  <source media="(min-width: 768px)" type="image/avif" srcset={desktopImg.srcSet.attribute} sizes="100vw" />
  <img src={desktopImg.src} alt={alt} width={1920} height={900} loading="eager" fetchpriority="high" />
</picture>
```

### 7. Verify in DevTools

1. Run `npm run build && npm run preview`
2. Open site in browser, open DevTools → Network tab, filter Images
3. Check:
   - Images served as `.avif` or `.webp` (not original format) in supporting browsers
   - `srcset` present on `<img>` tags
   - Correct size fetched for viewport (800w on mobile, not 1920w)

---

## Outputs

- `astro.config.mjs` updated with image config
- Components using `<Image>` or `<Picture>` for all content images
- LCP image configured with eager + preload
- Remote domains authorized (if applicable)

---

## Validation

- [ ] All content `<img>` replaced with `<Image>` or `<Picture>`
- [ ] LCP image has `loading="eager"` + `fetchpriority="high"`
- [ ] Preload link in layout head for LCP image
- [ ] DevTools shows AVIF/WebP served
- [ ] Lighthouse "Properly size images" audit passes
- [ ] Lighthouse "Serve images in next-gen formats" audit passes

---

## Anti-Patterns

- ❌ `<img src="hero.jpg">` for content images (no optimization)
- ❌ `loading="lazy"` on LCP image (defeats preload intent)
- ❌ No width/height (causes CLS)
- ❌ `<Picture formats={['avif']}>` without fallback (breaks on old browsers — use `['avif', 'webp']`)
- ❌ Preload without `as="image"` (browser doesn't use the preload)

---

## Handoff

- **`@astro:addy-osmani`** — measure LCP improvement
- **`@astro:harry-roberts`** — if images + fonts together cause render-blocking

---

## Error Handling

**Build error: "sharp is not available":**
- Cloudflare adapter running build in workerd
- Fix: `prerenderEnvironment: 'node'` in adapter config

**Build error: "Remote image not authorized":**
- Add domain to `image.domains` array

**Image not converted to AVIF:**
- Check browser — Safari < 16.4 falls back to WebP (correct behavior)
- Check build: `npm run build` and inspect `dist/_astro/*.avif` exists
