# Task: Configure View Transitions

**Task ID:** configure-view-transitions
**Executor:** Agent
**Owner:** nate-moore + sarah-rainsberger (docs)
**Purpose:** Add smooth SPA-style navigation between pages via Astro's ClientRouter.
**Duration:** 15-30 minutes

---

## Inputs

| Parameter | Required | Description |
|-----------|----------|-------------|
| `shared_layout_path` | Yes | Path to the common layout (e.g., `src/layouts/BaseLayout.astro`) |
| `animations` | No | fade / slide / none / custom |

---

## Preconditions

- [ ] Astro >= 3.0
- [ ] Multiple pages sharing a layout
- [ ] Analytics configuration noted (View Transitions affect page_view firing)

---

## Steps

### 1. Add ClientRouter to shared layout head

```astro
---
// src/layouts/BaseLayout.astro
import { ClientRouter } from 'astro:transitions';
---
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{Astro.props.title}</title>
    <ClientRouter />
  </head>
  <body>
    <slot />
  </body>
</html>
```

### 2. Verify

Run `npm run dev`, navigate between pages. Should see:
- Brief cross-fade (default animation)
- No full page reload
- URL updates via pushState

### 3. Named transitions for shared elements

When the same logical element exists on both source and destination pages, give it a matching `transition:name`:

```astro
<!-- On list page -->
<article>
  <h2 transition:name={`post-${post.id}-title`}>{post.data.title}</h2>
</article>

<!-- On detail page -->
<h1 transition:name={`post-${post.id}-title`}>{post.data.title}</h1>
```

Astro animates the element between pages as if it's the same DOM node.

### 4. Persist elements across navigation

For elements that should NOT animate (e.g., audio player that keeps playing, video that should not restart):

```astro
<audio transition:persist src="/podcast.mp3" controls></audio>
```

Same audio element kept across pages. Requires the element to be in the shared layout.

### 5. Custom animations

```astro
---
import { slide, fade, ClientRouter } from 'astro:transitions';
---
<html>
  <head>
    <ClientRouter />
  </head>
  <body>
    <main transition:animate={slide({ duration: '0.4s' })}>
      <slot />
    </main>
  </body>
</html>
```

Or define custom animation:

```astro
<script>
  import type { TransitionAnimationPair } from 'astro';
  const custom: TransitionAnimationPair = {
    forwards: {
      old: { name: 'slideOutLeft', duration: '0.3s', easing: 'ease-in' },
      new: { name: 'slideInRight', duration: '0.3s', easing: 'ease-out' },
    },
    backwards: { /* mirror */ },
  };
</script>
```

### 6. Trigger analytics on navigation

Default GA/analytics scripts load once. With ClientRouter, they don't fire page_view on subsequent nav.

```astro
<script>
  document.addEventListener('astro:page-load', () => {
    // GA4
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: location.pathname,
      });
    }
    // Plausible
    if (window.plausible) {
      window.plausible('pageview');
    }
  });
</script>
```

Events fired by ClientRouter:
- `astro:before-preparation` — preparing new page
- `astro:after-preparation` — new page prepared
- `astro:before-swap` — about to swap content
- `astro:after-swap` — content swapped
- `astro:page-load` — new page fully loaded + interactive

### 7. Opt out of transitions for specific links

When a link must trigger a full reload (e.g., admin areas, external SSO, large PDFs):

```astro
<a href="/admin" data-astro-reload>Admin</a>
```

### 8. Opt out for entire pages

If a specific page should not participate:

```astro
---
// src/pages/special.astro
Astro.response.headers.set('astro-reload', 'true');
---
```

Or exclude at the link level per above.

### 9. Handle forms with View Transitions

Forms submit via full reload by default. For SPA-like submission:

```astro
---
import { ClientRouter } from 'astro:transitions';
---
<form method="POST" action="/api/subscribe" data-astro-reload>
  <!-- Full reload on submit -->
</form>

<!-- OR use Ajax with navigate() -->
<form id="f">
  <button type="submit">Subscribe</button>
</form>
<script>
  import { navigate } from 'astro:transitions/client';
  document.getElementById('f')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    await fetch(form.action, { method: 'POST', body: new FormData(form) });
    navigate('/thanks');
  });
</script>
```

---

## Outputs

- Updated layout with `<ClientRouter />`
- `transition:name` on shared elements
- Analytics fires on navigation
- Forms handled correctly

---

## Validation

- [ ] Navigation between pages smooth (no full reload flash)
- [ ] Named transitions animate (hero image morphs between pages)
- [ ] Analytics `page_view` fires on each navigation
- [ ] No console errors
- [ ] Browser back/forward works
- [ ] Form submissions still work (either reload or Ajax)

---

## Anti-Patterns

- ❌ Adding ClientRouter to some pages but not the shared layout (inconsistent behavior)
- ❌ Forgetting to refire analytics (data loss)
- ❌ Using ClientRouter on app-like sites (persistent state, real SPA — use Next.js instead)
- ❌ Animating layout-affecting properties (top, left, width) — cause jank

---

## Handoff

- **`@astro:nate-moore`** — analytics integration specifics
- **`@astro:sarah-rainsberger`** — write user-facing doc on navigation behavior
- **`@astro:jason-miller`** — if transitions cause JS cost > 5kb on layout

---

## Error Handling

**Transitions don't animate:**
- Check browser supports View Transitions API (Chrome 111+, Safari 18+)
- Check ClientRouter in `<head>` of ALL pages (via shared layout)

**Page flickers during transition:**
- CSS/fonts loading mid-transition — preload fonts, inline critical CSS

**Browser back button breaks state:**
- Use `transition:persist` for stateful elements
- Or opt out: `data-astro-reload`
