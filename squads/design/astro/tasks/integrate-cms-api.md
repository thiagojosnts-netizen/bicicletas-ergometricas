# Task: Integrate CMS / External API

**Task ID:** integrate-cms-api
**Executor:** Agent
**Owner:** ben-holmes (content) + nate-moore (auth/integration)
**Purpose:** Pull content from headless CMS or REST/GraphQL API into Astro as Content Collection or API route.
**Duration:** 45-90 minutes

---

## Inputs

| Parameter | Required | Description |
|-----------|----------|-------------|
| `cms_provider` | Yes | storyblok / sanity / contentful / strapi / wordpress / custom |
| `sync_mode` | Yes | build_time (loader) / runtime (SSR) |
| `auth_method` | Yes | api_key / oauth / jwt |

---

## Preconditions

- [ ] Astro project with Content Collections configured
- [ ] CMS account with API access
- [ ] Env file setup (`.env` in .gitignore)

---

## Steps

### 1. Choose sync mode

**Build-time (recommended for most content):**
- Content fetched at `npm run build`, baked into static pages
- Rebuild triggered by CMS webhook (on publish)
- Fast, cache-friendly, works on any host
- Use: Content Collection custom loader

**Runtime (for freshness / user-specific):**
- Content fetched per request via SSR
- Always up-to-date, no rebuild
- Requires SSR adapter, hits CMS on every request
- Use: `fetch()` in page frontmatter with `export const prerender = false`

Decision: prefer build-time unless content must be fresh per-request.

### 2. Store credentials in .env

```
# .env (NEVER commit)
CMS_API_TOKEN=secret_xyz
CMS_SPACE_ID=abc123
```

Access via `import.meta.env.CMS_API_TOKEN`. Use `SECRET_` prefix for server-only (never exposed to client). Public vars: `PUBLIC_` prefix.

### 3. Build-time sync: custom loader

```ts
// src/content.config.ts
import { defineCollection, z } from 'astro:content';
import type { Loader } from 'astro/loaders';

function storyblokLoader(): Loader {
  return {
    name: 'storyblok',
    load: async ({ store, logger, meta }) => {
      const token = import.meta.env.STORYBLOK_TOKEN;
      if (!token) {
        logger.error('STORYBLOK_TOKEN not set');
        return;
      }

      const lastSync = meta.get('lastSync');
      const url = new URL('https://api.storyblok.com/v2/cdn/stories');
      url.searchParams.set('token', token);
      url.searchParams.set('version', import.meta.env.PROD ? 'published' : 'draft');
      if (lastSync) url.searchParams.set('cv', lastSync);

      const response = await fetch(url);
      if (!response.ok) {
        logger.error(`Storyblok fetch failed: ${response.status}`);
        return;
      }

      const { stories, cv } = await response.json();
      for (const story of stories) {
        store.set({
          id: story.slug,
          data: {
            title: story.name,
            content: story.content,
            pubDate: new Date(story.first_published_at ?? story.created_at),
            tags: story.tag_list ?? [],
          },
          rendered: {
            html: story.content.body_html ?? '',
          },
        });
      }
      meta.set('lastSync', cv);
      logger.info(`Loaded ${stories.length} stories from Storyblok`);
    },
  };
}

const posts = defineCollection({
  loader: storyblokLoader(),
  schema: z.object({
    title: z.string(),
    content: z.any(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()),
  }),
});

export const collections = { posts };
```

### 4. Runtime SSR pattern

```astro
---
// src/pages/products/[id].astro
export const prerender = false;
const { id } = Astro.params;

const response = await fetch(`${import.meta.env.API_URL}/products/${id}`, {
  headers: { Authorization: `Bearer ${import.meta.env.API_TOKEN}` },
});

if (!response.ok) {
  return Astro.redirect('/404');
}

const product = await response.json();
---
<h1>{product.name}</h1>
<p>{product.price}</p>
```

### 5. Webhook-triggered rebuild

**Cloudflare Pages:**
- CMS → Webhook to `https://api.cloudflare.com/client/v4/pages/deployments`
- See Cloudflare Pages deploy hooks in dashboard

**Vercel:**
- Project Settings → Git → Deploy Hooks → create hook URL
- CMS → Webhook to that URL (POST)

**Netlify:**
- Site Settings → Build hooks → add

### 6. Test the loader

```bash
npx astro sync
npm run build
```

Check `npm run build` output for logger messages. Expected: "Loaded N entries from [provider]".

### 7. Authorize remote image domains (if CMS serves images)

```js
// astro.config.mjs
export default defineConfig({
  image: {
    domains: ['a.storyblok.com', 'cdn.sanity.io'],
  },
});
```

### 8. Provider-specific integrations (alternative to custom loader)

- **Storyblok:** `npm install @storyblok/astro` → use their components
- **Sanity:** `npm install @sanity/astro` → has helpers + client
- **Contentful:** community loader or use their JS SDK directly
- **Strapi:** use REST/GraphQL endpoints with custom loader
- **WordPress:** WPGraphQL plugin + custom loader

---

## Outputs

- `src/content.config.ts` with CMS loader
- `.env` with credentials (gitignored)
- `.env.example` with placeholders (committed)
- Webhook configured for auto-rebuild
- Remote image domains authorized

---

## Validation

- [ ] Build fetches from CMS
- [ ] Entries validate against schema
- [ ] Pages render with CMS content
- [ ] Incremental sync works (second build is faster)
- [ ] Webhook triggers rebuild (test in CMS)
- [ ] Credentials never appear in client bundle (check `dist/_astro/*.js`)

---

## Anti-Patterns

- ❌ Hardcoding API tokens in source
- ❌ Using PUBLIC_ prefix for secret tokens (exposes to client)
- ❌ Fetching in runtime SSR without caching (hammers CMS)
- ❌ No error handling in loader (crashes build on CMS outage)

---

## Handoff

- **`@astro:matthew-phillips`** — loader build errors, Vite issues
- **`@astro:matt-kane`** — CMS image optimization
- **`@astro:nate-moore`** — use official provider integration vs custom

---

## Error Handling

**CMS fetch fails in loader:**
- Check env var set: `echo $CMS_API_TOKEN`
- Check CORS (loaders run on server, CORS rarely an issue)
- Log status and response body for diagnostics

**Types broken after loader:**
- Run `npx astro sync`
- Check schema matches actual CMS response shape
