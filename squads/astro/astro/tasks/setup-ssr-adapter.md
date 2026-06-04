# Task: Setup SSR Adapter

**Task ID:** setup-ssr-adapter
**Executor:** Agent
**Owner:** nate-moore + matthew-phillips (internals)
**Purpose:** Configure adapter for SSR/hybrid rendering with runtime-appropriate settings.
**Duration:** 15-30 minutes

---

## Inputs

| Parameter | Required | Description |
|-----------|----------|-------------|
| `target_host` | Yes | cloudflare / vercel / netlify / node |
| `output_mode` | Yes | static / server / hybrid |
| `prerender_strategy` | No | all / some / none |

---

## Preconditions

- [ ] Astro project exists
- [ ] Hosting platform decided (based on team/cost/stack — see @astro:fred-schott heuristic AS_FS_004)

---

## Steps

### 1. Install the adapter

```bash
# Cloudflare (default recommendation in 2026+)
npx astro add cloudflare

# Vercel
npx astro add vercel

# Netlify
npx astro add netlify

# Node (self-hosted VPS)
npx astro add node
```

This updates astro.config.mjs automatically.

### 2. Set output mode

```js
// astro.config.mjs
export default defineConfig({
  output: 'static',  // or 'server' or 'hybrid'
  adapter: cloudflare(),
});
```

**`output: 'static'` (default):**
- Every route prerendered at build time
- No adapter required (technically)
- Fastest runtime, cheapest hosting

**`output: 'server'`:**
- Every route rendered per request
- Requires adapter
- Use when all routes are user-specific

**`output: 'hybrid'` (recommended for mixed sites):**
- Default: static (prerendered)
- Opt route into SSR with `export const prerender = false`
- Best of both

### 3. Configure adapter-specific options

**Cloudflare:**
```js
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  output: 'hybrid',
  adapter: cloudflare({
    // Use Node for build-time (sharp works); workerd at runtime
    prerenderEnvironment: 'node',
    
    // Local dev parity with workerd
    platformProxy: {
      enabled: true,
    },
    
    // If using Cloudflare Images at runtime
    imageService: 'cloudflare',
  }),
});
```

**Vercel:**
```js
import vercel from '@astrojs/vercel';

export default defineConfig({
  output: 'hybrid',
  adapter: vercel({
    // Enable Vercel Image Optimization
    imageService: true,
    
    // Use Vercel Edge Functions (workerd) vs Serverless (Node)
    edgeMiddleware: true,
    
    // Web Analytics
    webAnalytics: { enabled: true },
    
    // Include sessions, cookies, etc. via Vercel-specific APIs
    includeFiles: ['./data/**/*'],
  }),
});
```

**Netlify:**
```js
import netlify from '@astrojs/netlify';

export default defineConfig({
  output: 'server',
  adapter: netlify({
    edgeMiddleware: true,
    cacheOnDemandPages: true,
  }),
});
```

**Node:**
```js
import node from '@astrojs/node';

export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone',  // or 'middleware' for Express integration
  }),
});
```

### 4. Opt specific routes into SSR (hybrid mode)

```astro
---
// src/pages/dashboard.astro
export const prerender = false; // this page is SSR

const user = await verifySession(Astro.cookies.get('session')?.value);
if (!user) return Astro.redirect('/login');
---
<h1>Welcome, {user.name}</h1>
```

### 5. Environment variables per platform

**Cloudflare Pages:**
- Dashboard → Pages → Project → Settings → Environment variables
- Separate `preview` vs `production` envs
- Access in Astro via `import.meta.env.SECRET_*`

**Vercel:**
- Dashboard → Project → Settings → Environment Variables
- Set per environment (Production, Preview, Development)

**Netlify:**
- Site → Site configuration → Environment variables

**Node (VPS):**
- Set via `.env` file loaded at runtime, or systemd unit, or Docker env

### 6. Build + deploy

```bash
npm run build
```

Check `dist/` output:
- `dist/client/` — static assets + client JS
- `dist/server/` — SSR entry (for server/hybrid mode)
- For Cloudflare: `dist/_worker.js` — Workers entrypoint
- For Vercel: `.vercel/output/` — Vercel Build Output API format

### 7. Test locally

```bash
# Static preview
npm run preview

# Cloudflare local dev parity
npx wrangler pages dev ./dist

# Node standalone
node ./dist/server/entry.mjs
```

### 8. Connect to host's git integration

**Cloudflare Pages:**
- Dashboard → Pages → Create a project → Connect to Git
- Build command: `npm run build`
- Build output: `dist`

**Vercel:**
- Import Project → Select repo
- Framework Preset: Astro (auto-detected)

**Netlify:**
- Add new site → Import existing project

### 9. Verify production deploy

- Check site loads on production URL
- Check SSR routes work (`/dashboard` → gated behind auth)
- Check env vars available
- Run Lighthouse on production URL
- Check no console errors

---

## Outputs

- Adapter installed + configured
- `astro.config.mjs` with adapter + output mode
- Env vars set on host
- Git integration for auto-deploy
- First successful deploy

---

## Validation

- [ ] `npm run build` succeeds
- [ ] Production URL loads
- [ ] SSR routes work (if hybrid/server mode)
- [ ] Static routes prerender
- [ ] No adapter runtime errors
- [ ] Env vars accessible

---

## Anti-Patterns

- ❌ `output: 'server'` when site is mostly static (wasteful runtime, higher cost)
- ❌ Using Node adapter on Cloudflare/Vercel (use their native adapters)
- ❌ Forgetting to set env vars on host after deploy
- ❌ Committing secrets to astro.config.mjs
- ❌ Using Sharp on Cloudflare without `prerenderEnvironment: 'node'`

---

## Handoff

- **`@astro:matthew-phillips`** — adapter runtime errors
- **`@astro:nate-moore`** — comparing adapters
- **`@astro:fred-schott`** — strategic adapter choice

---

## Error Handling

**Build works, deploy fails:**
- Check node version on host (must be >= 20)
- Check build command matches host expectation
- Check `output` directory config

**"sharp is not available" on Cloudflare:**
- Add `prerenderEnvironment: 'node'` to adapter options

**"process is not defined":**
- Cloudflare workerd doesn't have process.env — use `import.meta.env`
