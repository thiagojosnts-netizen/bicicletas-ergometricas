# Task: Configure Islands (Client Directives)

**Task ID:** configure-islands
**Executor:** Agent
**Owner:** jason-miller
**Purpose:** Audit and decide client:* directives per interactive component to minimize JS bundle.
**Duration:** 30-60 minutes

---

## Inputs

| Parameter | Required | Description |
|-----------|----------|-------------|
| `component_list` | Yes | List of interactive components + their usage context |

---

## Preconditions

- [ ] UI framework integration installed (@astrojs/preact, /react, etc.)
- [ ] Project uses at least one interactive component

---

## Steps

### 1. Inventory current islands

```bash
grep -rn "client:" src/
```

Categorize each by current directive + where it's used.

### 2. Classify each component

For each interactive component, answer:

**Above-the-fold or below?**
- Open the page where it's used in dev mode
- If visible on initial viewport → above-the-fold
- If requires scroll → below-the-fold

**Critical interactivity or nice-to-have?**
- Critical: search input, login form, primary CTA, nav menu
- Nice-to-have: copy-to-clipboard, tooltips, animations, below-the-fold forms

**Requires browser-only APIs?**
- localStorage, window, navigator, document measurement → yes (else can SSR)

### 3. Apply directive decision tree

```
above-the-fold + critical     → client:load
above-the-fold + non-critical → client:idle
below-the-fold               → client:visible
browser-only API (no SSR)    → client:only="<framework>"
media-responsive             → client:media="<query>"
no interactivity needed      → (no directive, renders as HTML only)
```

### 4. Apply in components

```astro
<!-- Search bar in header (above-the-fold + critical) -->
<Search client:load />

<!-- Comments at post bottom (below-the-fold) -->
<Comments client:visible />

<!-- Copy-to-clipboard button (non-critical) -->
<CopyButton client:idle />

<!-- Mobile menu (only on narrow viewports) -->
<MobileMenu client:media="(max-width: 768px)" />

<!-- Canvas-based game (browser-only) -->
<GameCanvas client:only="react" />

<!-- Static component (no hydration at all) -->
<StaticCard />
```

### 5. Verify each component still functions

For each change:
- Open the page in `npm run dev`
- Confirm component still interactive
- Check browser console for errors (especially for `client:only`)

### 6. Measure impact

```bash
# Before
npm run build
# Note JS sizes
ls -la dist/_astro/*.js

# After directive audit
npm run build
# Compare
```

Expected: 30-60% reduction in initial JS for typical audits.

### 7. Add bundle visualizer (if not already)

```bash
npm install -D rollup-plugin-visualizer
```

```js
// astro.config.mjs
import { visualizer } from 'rollup-plugin-visualizer';
export default defineConfig({
  vite: {
    plugins: [visualizer({ open: true, gzipSize: true, brotliSize: true })],
  },
});
```

Run build, inspect the treemap. Look for:
- Framework runtime (one per framework used — if multiple, reconsider)
- Per-component weight
- Unexpectedly large deps inside components

### 8. Document decisions

Add a comment in each component explaining the directive choice:

```astro
<!-- client:load — above-the-fold search is critical UX -->
<Search client:load />

<!-- client:visible — comments are below-the-fold, defer hydration -->
<Comments client:visible />
```

This helps future developers + reviewers.

---

## Outputs

- Updated directives on all islands
- Bundle visualizer config
- Documentation comments per island

---

## Validation

- [ ] No `client:load` without justification (above-the-fold + critical)
- [ ] No `client:only` without reason (browser-only API requirement)
- [ ] Bundle size reduced (measurable)
- [ ] All components still functional
- [ ] Lighthouse TBT / INP improved

---

## Anti-Patterns

- ❌ `client:load` everywhere ("easier to reason about")
- ❌ `client:only` by default (loses SSR benefits)
- ❌ Adding directive because component "looks interactive" without real need
- ❌ Not measuring impact after change

---

## Handoff

- **`@astro:addy-osmani`** — measure INP / TBT improvement
- **`@astro:jason-miller`** — ongoing: framework choice (React → Preact swap if all islands simple)

---

## Error Handling

**Component breaks with `client:visible`:**
- Likely relies on `client:load` timing (e.g., reads DOM at mount)
- Solution: refactor to lazy-init, OR use `client:load` if justified

**`client:only` shows blank flash:**
- Expected — no SSR. Provide a fallback slot if possible:
  ```astro
  <MyApp client:only="react">
    <div class="loading">Loading...</div>
  </MyApp>
  ```
