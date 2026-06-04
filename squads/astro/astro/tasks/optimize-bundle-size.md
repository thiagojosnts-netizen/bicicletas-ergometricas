# Task: Optimize Bundle Size

**Task ID:** optimize-bundle-size
**Executor:** Agent
**Owner:** jason-miller
**Purpose:** Reduce JS bundle size to meet performance budgets.
**Duration:** 30-90 minutes

---

## Inputs

| Parameter | Required | Description |
|-----------|----------|-------------|
| `current_bundle_size` | Yes | Current gzipped JS size |
| `budget` | Yes | Target size (default: 70kb landing, 120kb interactive) |

---

## Preconditions

- [ ] Astro project builds successfully
- [ ] At least one interactive component / island

---

## Steps

### 1. Install visualizer

```bash
npm install -D rollup-plugin-visualizer
```

```js
// astro.config.mjs
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  vite: {
    plugins: [
      visualizer({
        open: true,
        gzipSize: true,
        brotliSize: true,
        filename: 'dist/stats.html',
      }),
    ],
  },
});
```

### 2. Run build + inspect

```bash
npm run build
```

Treemap opens. Biggest boxes = biggest opportunities.

### 3. Audit top 5 dependencies

Common offenders + swaps:

| Offender | Weight (gzipped) | Replacement |
|----------|-------------------|-------------|
| moment | 60-90kb | date-fns (tree-shaken) or Intl.DateTimeFormat |
| lodash (full) | 70kb | lodash-es (tree-shake) or es-toolkit |
| font-awesome | 200kb | lucide-react or react-icons (individual imports) |
| chart.js | 60kb | Only if used; otherwise remove |
| react + react-dom | 42kb | preact + preact/compat (3kb) if possible |
| @mui/material (full) | 100-300kb | Individual imports: `@mui/material/Button` |

### 4. Audit client:* directive usage

```bash
grep -rn "client:" src/
```

Each `client:load` pulls framework runtime + component. Consider:
- Downgrade to `client:visible` where possible
- Remove directive entirely if component doesn't need JS
- See task `configure-islands.md` for full audit

### 5. Swap React → Preact (if applicable)

If:
- You use React only for simple islands
- No MUI / Chakra / antd / React Server Components
- No Relay / Apollo / React-specific hooks

Then:
```bash
npx astro add preact
npm uninstall @astrojs/react react react-dom
```

Update tsconfig.json:
```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "preact"
  }
}
```

Update imports in .tsx files:
```diff
- import { useState } from 'react';
+ import { useState } from 'preact/hooks';
```

Expected saving: ~40kb per page with React islands.

### 6. Tree-shake heavy libraries

**Lodash:**
```diff
- import _ from 'lodash';
- _.debounce(fn, 300);
+ import debounce from 'lodash-es/debounce';
+ debounce(fn, 300);
```

**Icons:**
```diff
- import { FaHome, FaUser } from 'react-icons/fa';  // if importing many, consider the whole FA set
+ import Home from 'lucide-react/dist/esm/icons/home';  // single icon
+ import User from 'lucide-react/dist/esm/icons/user';
```

### 7. Replace Moment.js

```diff
- import moment from 'moment';
- moment(date).format('MMMM Do YYYY');
+ import { format } from 'date-fns';
+ format(date, 'MMMM do yyyy');
```

Or for locale-aware formatting (zero-dep):
```js
new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
}).format(new Date());
```

### 8. Defer third-party scripts

Analytics, chat widgets, ads — often 20-100kb each.

```astro
<!-- Before: loads on page load, blocks main thread -->
<script async src="https://analytics.example.com/tag.js"></script>

<!-- After: loads 2s after window load -->
<script>
  window.addEventListener('load', () => {
    setTimeout(() => {
      const s = document.createElement('script');
      s.src = 'https://analytics.example.com/tag.js';
      s.async = true;
      document.head.appendChild(s);
    }, 2000);
  });
</script>
```

Or use Partytown to move to Web Worker:
```bash
npx astro add partytown
```

### 9. Remove dead code

```bash
# Find unused exports
npx ts-prune
# Or
npx knip
```

Delete unused files/exports. Every kb counts.

### 10. Re-measure

```bash
npm run build
ls -la dist/_astro/*.js
```

Compare to baseline. Target: meet budget (`budget` input).

### 11. Set performance budget in Lighthouse CI

```json
// lighthouserc.json
{
  "ci": {
    "assert": {
      "assertions": {
        "resource-summary:script:size": ["error", { "maxNumericValue": 70000 }]
      }
    }
  }
}
```

Runs budget check in CI.

---

## Outputs

- `dist/stats.html` — bundle visualizer snapshot
- Updated package.json with swapped deps
- Updated source imports (tree-shaken)
- `lighthouserc.json` with budget

---

## Validation

- [ ] Bundle < budget
- [ ] All functionality preserved (no regressions)
- [ ] Lighthouse Performance improved
- [ ] Visualizer shows no surprise dependencies

---

## Anti-Patterns

- ❌ Claiming size reduction without visualizer numbers
- ❌ Swapping React → Preact when ecosystem requires React (measure first)
- ❌ Importing entire icon libraries
- ❌ Using Moment.js in 2026
- ❌ Third-party scripts loading on `<script async>` without defer strategy

---

## Handoff

- **`@astro:addy-osmani`** — measure INP/TBT improvement
- **`@astro:nate-moore`** — UI framework choice is ecosystem-driven
- **`@astro:matthew-phillips`** — Vite/build config issues

---

## Error Handling

**React → Preact swap breaks library:**
- Check library's Preact compat notes
- Keep React for that one island, Preact for rest (dual framework)
- Or find Preact-native alternative library

**Visualizer shows same size after swap:**
- Check bundle actually rebuilt (`rm -rf dist && npm run build`)
- Check import not tree-shaken (CJS vs ESM, sideEffects flag)
