# Astro Squad Knowledge Base

**Version:** 1.0.0
**Last Updated:** 2026-04-18
**Scope:** Core concepts, patterns, and gotchas for Astro sites in 2026

---

## 1. Core Philosophy

### Islands Architecture

Astro inverts the default of modern JS frameworks. Traditional SPA frameworks
(Next.js, Remix, SvelteKit) hydrate the entire page. Astro ships zero JS by
default — each interactive component must be explicitly marked as an "island"
to get client-side JavaScript.

The result: content-heavy sites (blogs, docs, marketing, e-commerce catalogs)
ship 10-100x less JS and have dramatically better CWV. Interactive app-like
sites (dashboards, editors) are a worse fit.

### Content-First

Astro is a content framework, not an app framework. Start with the content
model (Content Collections + Zod schemas), then build presentation around it.
This is the opposite of most JS frameworks, which start with the component
tree.

### Zero JS Default

Every `client:*` directive is a decision to ship JavaScript. Every such
decision should be justified. The directive hierarchy from cheapest to most
expensive:

1. No directive → 0kb (static HTML only)
2. `client:idle` → loads after browser idle
3. `client:visible` → loads when scrolled into view
4. `client:load` → loads immediately
5. `client:only` → skips SSR, browser-only

Start with no directive. Upgrade as needed, never by default.

---

## 2. Recent Platform Shifts (2026)

### Cloudflare Acquisition (Jan 2026)

Cloudflare acquired The Astro Technology Company on January 16, 2026. This
means:

- **`@astrojs/cloudflare` is now the first-class adapter** — receives fastest updates and tightest integration
- **Edge-first becomes default** — new features ship with Cloudflare Workers runtime in mind
- **Pricing**: Cloudflare Workers free tier is generous; framework remains MIT-licensed
- **Other adapters (@astrojs/vercel, @astrojs/netlify, @astrojs/node) remain supported** but are no longer first-party from the Astro team's perspective

**Practical impact:** For new projects, default to Cloudflare. Existing projects on Vercel/Netlify/Node continue to work fine.

### Astro 5 (stable late 2024, fully adopted 2025-2026)

Key 5.0 features now considered standard:
- **Content Collections 2.0** — `content.config.ts` location, `glob`/`file`/custom loaders
- **Server Islands** — SSR specific islands within static pages
- **Actions** — type-safe server actions for forms/mutations
- **Environment validation** — `astro:env` for typed env vars
- **Hybrid rendering default** — mix static + SSR in same project
- **Responsive Image layouts** — `layout="constrained"` / `"full-width"` / `"fixed"`

---

## 3. The Five Client Directives

| Directive | When Hydrates | Use For | Cost |
|-----------|---------------|---------|------|
| (none) | Never | Static content | 0kb |
| `client:idle` | After browser idle callback | Non-critical widgets, above-the-fold secondary interactivity | Low |
| `client:visible` | When scrolled into viewport | Below-the-fold forms, comments, filters | Low-Medium |
| `client:load` | Immediately on page parse | Above-the-fold critical UX (search bar, nav) | Medium-High |
| `client:media="..."` | When media query matches | Responsive components (mobile menu only on narrow) | Low (conditional) |
| `client:only="react"` | Only in browser (no SSR) | Components with browser-only APIs | High (no SSR benefits) |

**Default strategy:** start with no directive. Upgrade to `client:visible` by
default when interactivity is needed. Only use `client:load` when the
component is visibly broken without it.

---

## 4. Image Handling

### The Image Component

Astro provides `<Image>` and `<Picture>` components via `astro:assets`.

```astro
---
import { Image, Picture } from 'astro:assets';
import hero from '../assets/hero.jpg';
---
<!-- Responsive with format fallback -->
<Image src={hero} alt="..." layout="constrained" width={1200} height={675} />

<!-- Explicit picture with format fallback -->
<Picture src={hero} formats={['avif', 'webp']} alt="..." />
```

### Layout Options

- **`constrained`** — fills container up to max width; browser picks size from srcset
- **`full-width`** — always 100% viewport width; srcset based on common breakpoints
- **`fixed`** — exact width/height; 1x + 2x for HiDPI

### Format Priority

1. **AVIF** — best compression (~50% smaller than JPEG), supported Chrome 85+, Firefox 93+, Safari 16.4+
2. **WebP** — universal support, better than JPEG/PNG
3. **Original** — ultimate fallback

### LCP Image Setup

The LCP image (hero/banner) needs special treatment:

```astro
<!-- In the page: eager + high priority -->
<Image src={hero} loading="eager" fetchpriority="high" />

<!-- In the layout head: preload -->
<link rel="preload" as="image" href={optimized.src} fetchpriority="high" />
```

### Remote Images

Astro requires remote domains to be authorized:

```js
// astro.config.mjs
export default defineConfig({
  image: {
    domains: ['cms.example.com'],
    // or wildcards:
    remotePatterns: [{ protocol: 'https', hostname: '**.cdn.com' }],
  },
});
```

### Image Services

- **Sharp** (default) — Node build-time, 60-80% size reduction
- **Cloudflare Images** — runtime optimization on CDN (paid)
- **Passthrough** — no optimization, pass original (for pre-optimized workflows)
- **Custom** — bring your own (Imgix, Cloudinary, etc.)

---

## 5. Content Collections

### content.config.ts (Astro 5+)

```ts
import { defineCollection, reference, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    pubDate: z.coerce.date(),
    author: reference('authors'),
    draft: z.boolean().default(false),
  }),
});

const authors = defineCollection({
  loader: file('./src/content/authors.json'),
  schema: z.object({
    id: z.string(),
    name: z.string(),
  }),
});

export const collections = { blog, authors };
```

### Loaders

- **`glob`** — Markdown/MDX/JSON files matching a pattern
- **`file`** — single JSON file with array/record of entries
- **Custom** — fetch from CMS/API (Storyblok, Sanity, Contentful, Notion, etc.)

### Queries

```astro
---
import { getCollection, getEntry, getEntries } from 'astro:content';

// All posts
const all = await getCollection('blog');

// Filtered
const published = await getCollection('blog', ({ data }) => !data.draft);

// Single entry
const post = await getEntry('blog', 'my-post');
const { Content } = await post.render();

// Reference resolution
const author = await getEntry(post.data.author);

// Array of references
const related = await getEntries(post.data.relatedPosts ?? []);
---
```

### Draft Filtering

Use a helper to centralize:

```ts
// src/utils/content.ts
export const getPublishedPosts = () =>
  getCollection('blog', ({ data }) =>
    import.meta.env.PROD ? !data.draft : true
  );
```

### Content vs Data

- **Collections** = CONTENT (authored by you, read by users)
- **Astro DB** = DATA (user-generated — comments, submissions, accounts)

---

## 6. Adapter Ecosystem

| Adapter | Runtime | Node APIs | Cold Start | Edge | Cost |
|---------|---------|-----------|------------|------|------|
| @astrojs/cloudflare | workerd | Limited | ~5ms | Yes (300+ PoPs) | Low/free tier |
| @astrojs/vercel (Edge) | workerd | Limited | ~5ms | Yes | Paid |
| @astrojs/vercel (Serverless) | Node.js | Full | ~200ms | No | Paid |
| @astrojs/netlify | Node.js | Full | ~200ms | Netlify Edge option | Free tier |
| @astrojs/node | Node.js | Full | None | No (self-manage) | VPS cost |

### Output Modes

- **`static`** (default): all pages prerendered at build time
- **`server`**: all pages SSR per request
- **`hybrid`** (common): static by default, opt in SSR per route with `export const prerender = false`

### Cloudflare + Sharp gotcha

Cloudflare Workers (workerd) doesn't support Sharp. Solutions:

```js
// Option 1: Sharp at build, workerd at runtime
adapter: cloudflare({ prerenderEnvironment: 'node' })

// Option 2: Cloudflare Images service (runtime)
image: { service: { entrypoint: 'astro/assets/services/cloudflare' } }

// Option 3: Passthrough (pre-optimized)
image: { service: passthroughImageService() }
```

---

## 7. Integrations

### Install Pattern

Use `npx astro add <integration>` — it installs the package, updates
astro.config.mjs, and handles peer deps:

```bash
npx astro add cloudflare
npx astro add preact
npx astro add mdx
npx astro add tailwind
npx astro add sitemap
```

### First-Party Integrations (@astrojs/*)

- **Adapters**: cloudflare, vercel, netlify, node
- **UI Frameworks**: preact, react, vue, svelte, solid, lit
- **Content**: mdx, markdoc
- **Styling**: tailwind
- **Utility**: sitemap, partytown
- **Data**: db (Astro DB with libSQL)

### Ordering in astro.config.mjs

Order matters. Follow this template:

```js
integrations: [
  mdx(),       // 1. Content transforms (so UI components work in MDX)
  preact(),    // 2. UI framework
  tailwind(),  // 3. Styling
  sitemap(),   // 4. Post-build utilities
]
```

### UI Framework Choice (Bundle Impact)

- **Preact** (3kb) — React-compatible API, minimal runtime
- **Solid** (7kb) — reactive primitives, very fast
- **Svelte** (varies, compiled) — smallest final bundle per component
- **React** (42kb) — largest, but huge ecosystem (MUI, Chakra, etc.)
- **Vue** (34kb) — middle-ground
- **Lit** (5kb) — Web Components

Default recommendation: Preact. Upgrade to React only when ecosystem requires it.

---

## 8. MDX

### Setup

```bash
npx astro add mdx
```

### Plugins

Configure remark (markdown AST) and rehype (HTML AST) plugins:

```js
// astro.config.mjs
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeExternalLinks from 'rehype-external-links';

export default defineConfig({
  markdown: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: 'append' }],
      [rehypeExternalLinks, { target: '_blank', rel: ['noopener'] }],
    ],
    shikiConfig: { theme: 'github-dark' },
  },
  integrations: [mdx()],
});
```

### Components in MDX

```mdx
import Callout from '../../components/Callout.astro';
import CodeDemo from '../../components/CodeDemo.astro';

# Post title

<Callout type="info">Important note</Callout>
<CodeDemo src="/demos/example.html" />
```

Or pass via `components` prop:

```astro
<Content components={{ Callout, CodeDemo, h1: CustomH1 }} />
```

### Syntax Highlighting

- **Shiki** (default, Astro 4+) — VS Code grammars, real themes, ~50-100ms per block
- **Prism** — lighter, ~10ms per block, needs CSS theme
- **rehype-pretty-code** — Shiki + extras (line numbers, highlights, filenames)

---

## 9. API Routes + Actions

### API Route (traditional REST)

```ts
// src/pages/api/items.ts
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ url }) => {
  const items = await fetchItems();
  return new Response(JSON.stringify(items), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ request, locals }) => {
  // auth, validate, create
};
```

### Astro Actions (Astro 5+, preferred for forms)

```ts
// src/actions/index.ts
import { defineAction } from 'astro:actions';
import { z } from 'astro/zod';

export const server = {
  subscribe: defineAction({
    accept: 'form',
    input: z.object({ email: z.string().email() }),
    handler: async ({ email }) => {
      await addToList(email);
      return { success: true };
    },
  }),
};
```

```astro
<form method="POST" action={actions.subscribe}>
  <input type="email" name="email" required />
  <button>Subscribe</button>
</form>
```

Works without JS (progressive enhancement). Add JS to enhance UX.

---

## 10. View Transitions

### Setup

```astro
---
import { ClientRouter } from 'astro:transitions';
---
<head>
  <ClientRouter />
</head>
```

### Named Transitions (morph elements between pages)

```astro
<!-- List page -->
<h2 transition:name={`post-${id}`}>{title}</h2>

<!-- Detail page -->
<h1 transition:name={`post-${id}`}>{title}</h1>
```

### Persist Elements

```astro
<audio transition:persist src="/podcast.mp3"></audio>
```

### Events

- `astro:before-preparation`
- `astro:after-preparation`
- `astro:before-swap`
- `astro:after-swap`
- `astro:page-load` — fire analytics here

### Opt-Out

```astro
<a href="/admin" data-astro-reload>Admin (full reload)</a>
```

---

## 11. Performance Budgets

| Metric | Target | Budget |
|--------|--------|--------|
| LCP (mobile, p75) | < 2.5s | Hard limit: < 4s |
| INP (p75) | < 200ms | Hard limit: < 500ms |
| CLS (p75) | < 0.1 | Hard limit: < 0.25 |
| TTFB (p75) | < 800ms | Hard limit: < 2s |
| Lighthouse Performance | ≥ 95 | Minimum: 90 |
| JS total (landing) | < 70kb gzip | Hard limit: 150kb |
| CSS total | < 50kb gzip | Hard limit: 100kb |
| Fonts total | < 100kb woff2 | Hard limit: 200kb |

### Tools

- **Lighthouse**: lab test, quick feedback (`npx lighthouse {url} --preset=experimental`)
- **PageSpeed Insights**: lab + CrUX field data
- **WebPageTest**: filmstrip + waterfall
- **DevTools Coverage**: unused CSS/JS
- **rollup-plugin-visualizer**: bundle treemap
- **web-vitals** library: RUM for real user metrics

---

## 12. Common Gotchas

### Build works, production fails
- Adapter runtime mismatch (Sharp on workerd)
- Missing env vars on host
- Different Node versions between dev and build

### Types not available
- Run `npx astro sync` — regenerates after schema changes
- Check `jsxImportSource` in tsconfig.json for Preact/Solid

### Tailwind classes not applying
- Content array missing `.astro` or `.mdx`
- Dynamic class names (`class={`bg-${color}-500`}`) — Tailwind can't see these

### Images not optimized
- Using `<img>` instead of `<Image>`
- Source in `public/` (bypasses image service — use `src/assets/` instead)
- Sharp not available (adapter issue)

### FOUT/FOIT
- Fonts not preloaded
- Missing `font-display: swap`
- No `size-adjust` on fallback

### CLS
- Images without width/height (use `<Image>`, auto-set)
- Fonts without size-adjust matching
- Dynamic content injection above existing

---

## 13. Anti-Patterns

- `client:load` everywhere
- Importing React just for one island (use Preact or .astro)
- Raw `<img>` for content images
- Using Moment.js in 2026
- Committing `.env`
- Mixed framework islands (React + Vue) without justification
- Static + client:only (defeats both benefits)
- CSS-in-JS in Astro (fights zero-JS philosophy)

---

## 14. Reference Links

### Official
- [Astro Docs](https://docs.astro.build)
- [Astro Blog](https://astro.build/blog)
- [Astro GitHub](https://github.com/withastro/astro)
- [Astro Discord](https://astro.build/chat)

### Specialists' Sources
- Fred Schott: [ShopTalk #510](https://shoptalkshow.com/510/), [@FredKSchott](https://twitter.com/FredKSchott)
- Addy Osmani: [web.dev](https://web.dev), [addyosmani.com](https://addyosmani.com)
- Harry Roberts: [csswizardry.com](https://csswizardry.com)
- Jason Miller: [Preact](https://preactjs.com), [@_developit](https://twitter.com/_developit)
- Matt Kane: [@ascorbic](https://twitter.com/ascorbic)
- Ben Holmes: [@BHolmesDev](https://twitter.com/BHolmesDev)
- John Otander: [MDX](https://mdxjs.com), [@4lpine](https://twitter.com/4lpine)

### Tools
- [PageSpeed Insights](https://pagespeed.web.dev)
- [WebPageTest](https://webpagetest.org)
- [Lighthouse](https://developer.chrome.com/docs/lighthouse)
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [OpenGraph.xyz](https://www.opengraph.xyz/)
- [Rich Results Test](https://search.google.com/test/rich-results)

---

_This knowledge base is maintained by the Astro Squad. Contributions: update, re-read for staleness quarterly._
