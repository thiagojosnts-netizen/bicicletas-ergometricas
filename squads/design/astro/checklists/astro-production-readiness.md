# Astro Production Readiness Checklist

**Version:** 1.0.0
**Owner:** astro-chief
**Purpose:** Before deploying to production, verify everything is safe and observable.

---

## 🔒 Security

- [ ] All secrets in `.env` (never committed)
- [ ] `.env` in `.gitignore`
- [ ] `.env.example` committed with placeholder values
- [ ] Environment variables use `SECRET_` prefix (not `PUBLIC_`) for server-only
- [ ] No `eval()` or `new Function()` in source
- [ ] API routes validate all inputs via Zod (or equivalent)
- [ ] Form POSTs have CSRF protection (Astro Actions handle this; custom endpoints need manual)
- [ ] Rate limiting on public mutation endpoints
- [ ] External inputs sanitized before rendering (DOMPurify if rendering HTML)
- [ ] Content-Security-Policy header set (see `astro:middleware` for header injection)
- [ ] HSTS header set (`Strict-Transport-Security: max-age=31536000; includeSubDomains`)
- [ ] No `innerHTML` with user data
- [ ] Dependencies audited (`npm audit` shows no high/critical)
- [ ] Lockfile committed (`package-lock.json` / `pnpm-lock.yaml` / `bun.lockb`)

## 🚨 Error Handling

- [ ] 404 page exists (`src/pages/404.astro`)
- [ ] 500 page exists (`src/pages/500.astro` for SSR)
- [ ] API routes return proper status codes (not all 200)
- [ ] Uncaught errors logged to observability service (Sentry, etc.)
- [ ] Build fails on TypeScript errors (`astro check` in CI)
- [ ] Graceful degradation if JS fails (progressive enhancement)

## 🔐 Auth (if applicable)

- [ ] Middleware gates protected routes
- [ ] Session tokens httpOnly, Secure, SameSite=Lax (or Strict)
- [ ] Password reset flow rate-limited
- [ ] OAuth redirect URLs locked to known hosts
- [ ] No user-provided data in URLs without validation

## 📊 Observability

- [ ] Analytics configured (Plausible / GA4 / Fathom / etc.)
- [ ] Analytics fires on `astro:page-load` (View Transitions-aware)
- [ ] Error tracking configured (Sentry `@sentry/astro` / Bugsnag / Rollbar)
- [ ] Web Vitals RUM deployed
- [ ] Server logs visible to team (Cloudflare Logpush / Vercel Logs / Netlify logs)
- [ ] Uptime monitoring (BetterStack / Uptime Robot)

## 🌐 SEO

- [ ] `<title>` unique per page
- [ ] Meta description unique per page (≤ 160 chars)
- [ ] Canonical URL set on every page
- [ ] Open Graph + Twitter Card meta tags
- [ ] `robots.txt` at `public/robots.txt`
- [ ] Sitemap generated via `@astrojs/sitemap` at `/sitemap-index.xml`
- [ ] Sitemap submitted to Google Search Console
- [ ] Structured data (JSON-LD) for articles/products (if applicable)
- [ ] `hreflang` tags for multi-language (if applicable)
- [ ] No `noindex` on production pages (verify inadvertent staging flags)

## 🌍 Accessibility

- [ ] All images have meaningful `alt` text (or `alt=""` for decorative)
- [ ] Skip-to-content link in layout
- [ ] Color contrast >= 4.5:1 for body text, 3:1 for large text
- [ ] Focus visible on all interactive elements (don't `outline: none` without replacement)
- [ ] Keyboard navigation works (tab through, enter to activate)
- [ ] Form labels associated with inputs
- [ ] Heading hierarchy correct (no skipping from h2 to h4)
- [ ] ARIA attributes used correctly (prefer semantic HTML)
- [ ] `prefers-reduced-motion` respected for animations

## 🏗️ Infrastructure

- [ ] Domain DNS configured correctly (A/AAAA for apex, CNAME for www)
- [ ] SSL certificate valid (Let's Encrypt via host, or own cert)
- [ ] Preview deploys for every PR (Cloudflare Pages / Vercel auto-preview)
- [ ] Rollback mechanism tested (git revert + redeploy)
- [ ] Database backups (if using Astro DB or external DB)
- [ ] CDN cache invalidation on deploy (host handles this automatically)

## 📱 Cross-Browser

- [ ] Tested in Chrome/Edge (latest)
- [ ] Tested in Firefox (latest)
- [ ] Tested in Safari (latest + 1 prior)
- [ ] Tested on iOS Safari (real device or simulator)
- [ ] Tested on Android Chrome
- [ ] No browser-only JS features without `typeof window` guards in SSR

## 🎯 Performance (see astro-performance-checklist.md)

- [ ] Lighthouse Performance >= 95
- [ ] LCP < 2.5s
- [ ] INP < 200ms
- [ ] CLS < 0.1
- [ ] Bundle size within budget

## 📝 Documentation

- [ ] README.md covers: setup, dev, build, deploy
- [ ] `.env.example` explains each required variable
- [ ] Deploy steps documented (runbook)
- [ ] On-call / support contacts documented
- [ ] Architecture diagram (optional but useful)

## 🧪 Testing

- [ ] `npx astro check` passes in CI
- [ ] `npm run build` succeeds in CI
- [ ] Critical paths have smoke tests (e.g., "homepage loads", "blog post renders")
- [ ] Lighthouse CI budget set
- [ ] Preview deploys have automatic quality checks

## 🚀 Launch Day

- [ ] Announce maintenance window (if applicable)
- [ ] Deploy behind feature flag (if high-risk)
- [ ] Monitor error rate for first 2 hours post-deploy
- [ ] Monitor CWV in CrUX (28-day lagging)
- [ ] Gather initial user feedback (support inbox, analytics)

## 🚫 Hard Blockers (cannot launch)

- ❌ Secrets committed to git → rotate + remove from history + redeploy
- ❌ `npm audit` shows critical vulnerabilities → patch
- ❌ Staging-only config (noindex, test API keys) in production → fix
- ❌ SSL not configured → fix
- ❌ 404/500 pages missing → add

---

## Review Cadence

- **Pre-launch:** Full checklist
- **Monthly:** Security, dependencies audit, performance CWV
- **Quarterly:** Full checklist (catch drift)

---

_Last reviewed: 2026-04-18_
