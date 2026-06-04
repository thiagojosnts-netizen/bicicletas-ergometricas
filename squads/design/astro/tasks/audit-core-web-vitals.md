# Task: Audit Core Web Vitals

**Task ID:** audit-core-web-vitals
**Executor:** Hybrid (Agent + Human running Lighthouse)
**Owner:** addy-osmani
**Purpose:** Measure LCP, INP, CLS; identify failures; prescribe fixes.
**Duration:** 30-60 minutes

---

## Inputs

| Parameter | Required | Description |
|-----------|----------|-------------|
| `site_url` | Yes | Production URL or preview URL |
| `target_pages` | No | Specific pages to audit (default: homepage + 2 representative) |

---

## Preconditions

- [ ] Site deployed to a URL (can be preview/staging)
- [ ] Chrome browser with Lighthouse
- [ ] Or: `npx lighthouse` CLI available

---

## Steps

### 1. Run Lighthouse (baseline)

```bash
npx lighthouse {site_url} \
  --preset=experimental \
  --form-factor=mobile \
  --throttling-method=simulate \
  --output=json,html \
  --output-path=./perf-audit/lighthouse \
  --view
```

Repeat 3 times. Take median values.

Captured metrics:
- **LCP** (target < 2.5s)
- **INP** (lab proxy: TBT, target < 200ms)
- **CLS** (target < 0.1)
- **TTFB** (< 800ms)
- **Overall Performance score** (>= 95)

### 2. Run PageSpeed Insights (adds field data)

```
https://pagespeed.web.dev/analysis?url={site_url}
```

Captures:
- Lab data (Lighthouse)
- **Field data from CrUX** — real users, past 28 days

Compare lab vs field:
- Lab good + field good = healthy
- Lab good + field poor = real users hit bottleneck synthetic doesn't see
- Lab poor + field good = users are on good networks/devices

### 3. Identify LCP element

From Lighthouse report → "Largest Contentful Paint element" diagnostic.

Copy the selector. Usually one of:
- Hero image
- Hero heading (text)
- Below-fold content (means page painted something tiny first — unusual)

### 4. Get LCP breakdown

Lighthouse splits LCP into:
- **TTFB** (server → first byte)
- **Resource load delay** (TTFB → start loading LCP resource)
- **Resource load duration** (download time)
- **Element render delay** (loaded → painted)

Biggest chunk = where to focus.

### 5. Diagnose by root cause

**LCP element is image + large load duration:**
→ Image optimization (AVIF/WebP, correct size)
→ Handoff: @astro:matt-kane

**LCP element is image + large load delay:**
→ Not preloaded, discovered late
→ Add `<link rel="preload" as="image">` in layout head

**LCP element is text + high render delay:**
→ Font loading blocks render
→ Handoff: @astro:harry-roberts

**High TTFB (> 600ms):**
→ Server / adapter slow
→ Handoff: @astro:matthew-phillips

**High TBT (proxy for INP):**
→ JS blocking main thread
→ Handoff: @astro:jason-miller

**High CLS:**
→ Images without dimensions, fonts FOIT, dynamic content injection
→ Handoff: @astro:matt-kane (images) or @astro:harry-roberts (fonts)

### 6. Document findings

```md
# Performance Audit Report

## Baseline (pre-fix)
- LCP: 4.2s (mobile, p75 from CrUX)
- INP: 340ms
- CLS: 0.18
- Performance score: 68

## Diagnoses
1. LCP: hero image `<img class="hero__img">` not optimized
   - Raw JPG, 1.2MB
   - No preload
   - Load delay: 800ms, load duration: 1600ms
2. CLS: hero image has no width/height → 0.12 shift
3. INP: third-party analytics script blocking main thread 200ms

## Prescribed fixes (priority order)
1. Replace <img> with <Image layout="constrained"> + preload → -1200ms LCP, -0.12 CLS
2. Defer analytics to window.load + setTimeout(2000) → -150ms INP
3. Self-host + preload Inter font → -200ms LCP

## Expected post-fix
- LCP: < 2.0s
- INP: < 200ms
- CLS: < 0.05
- Performance: >= 95
```

### 7. Apply fixes (routed to specialists)

Each fix via task + specialist handoff. One fix at a time.

### 8. Re-measure

Run Lighthouse 3x after ALL fixes. Compare to baseline.

### 9. Deploy RUM (ongoing)

```astro
<!-- src/layouts/BaseLayout.astro -->
<script type="module">
  import { onCLS, onLCP, onINP } from 'https://unpkg.com/web-vitals@4?module';
  const send = ({ name, value, id }) => {
    navigator.sendBeacon('/api/rum', JSON.stringify({ name, value, id, url: location.pathname }));
  };
  onCLS(send);
  onLCP(send);
  onINP(send);
</script>
```

Create `/api/rum` endpoint to log or forward to analytics.

---

## Outputs

- `perf-audit/lighthouse-{1,2,3}.json` — baseline
- `perf-audit/report.md` — diagnosis + prescriptions
- `perf-audit/lighthouse-after-{1,2,3}.json` — post-fix
- Deployed RUM for ongoing

---

## Validation

- [ ] Baseline Lighthouse captured (3x median)
- [ ] PageSpeed Insights field data consulted
- [ ] LCP element identified
- [ ] Each failing metric has a root cause
- [ ] Fixes applied and re-measured
- [ ] Post-fix meets targets OR explicit reason documented
- [ ] RUM deployed

---

## Anti-Patterns

- ❌ One Lighthouse run (too noisy — need median of 3)
- ❌ Lab data only (field data tells you what users actually experience)
- ❌ Applying multiple fixes before re-measuring (can't attribute impact)
- ❌ Trusting "feels faster" over numbers

---

## Handoff

- **`@astro:matt-kane`** — image-related LCP/CLS
- **`@astro:harry-roberts`** — CSS/font-related
- **`@astro:jason-miller`** — JS/INP/bundle
- **`@astro:matthew-phillips`** — TTFB/server/adapter

---

## Error Handling

**Lighthouse scores fluctuate wildly:**
- Run more times (5+)
- Take median, not single
- Close other tabs, disable extensions
- Check network stability

**Can't repro high LCP in Lighthouse:**
- Field data ≠ lab data
- Real users may be on slower networks/devices
- Check CrUX / RUM for user segments
