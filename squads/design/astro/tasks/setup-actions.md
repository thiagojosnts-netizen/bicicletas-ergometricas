# Task: Setup Astro Actions

**Task ID:** setup-actions
**Executor:** Agent
**Owner:** matthew-phillips + nate-moore
**Purpose:** Add type-safe server actions for forms and mutations (Astro 5+ feature).
**Duration:** 30-60 minutes

---

## Inputs

| Parameter | Required | Description |
|-----------|----------|-------------|
| `action_list` | Yes | List of actions needed (contact form, subscribe, comment, etc.) |
| `auth_required` | No | Whether actions check authentication |

---

## Preconditions

- [ ] Astro >= 5.0
- [ ] Output mode: `server` or `hybrid` (actions require SSR)
- [ ] Adapter configured

---

## Steps

### 1. Create actions file

```ts
// src/actions/index.ts
import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro/zod';

export const server = {
  // Contact form action
  contact: defineAction({
    accept: 'form',
    input: z.object({
      name: z.string().min(1).max(100),
      email: z.string().email(),
      message: z.string().min(10).max(5000),
    }),
    handler: async (input, context) => {
      // Send email, save to DB, etc.
      await sendEmail({
        to: 'hello@example.com',
        from: input.email,
        subject: `Contact from ${input.name}`,
        body: input.message,
      });
      return { success: true };
    },
  }),

  // Subscribe action
  subscribe: defineAction({
    accept: 'form',
    input: z.object({
      email: z.string().email(),
    }),
    handler: async ({ email }, context) => {
      try {
        await addToList(email);
        return { success: true, email };
      } catch (err) {
        throw new ActionError({
          code: 'CONFLICT',
          message: 'Already subscribed',
        });
      }
    },
  }),

  // Authenticated action (comment)
  postComment: defineAction({
    accept: 'form',
    input: z.object({
      postSlug: z.string(),
      body: z.string().min(1).max(1000),
    }),
    handler: async (input, context) => {
      const user = context.locals.user;
      if (!user) {
        throw new ActionError({
          code: 'UNAUTHORIZED',
          message: 'Must be logged in',
        });
      }
      const comment = await createComment({
        userId: user.id,
        postSlug: input.postSlug,
        body: input.body,
      });
      return comment;
    },
  }),
};
```

### 2. Use in a progressive-enhancement form

```astro
---
// src/pages/contact.astro
import { actions } from 'astro:actions';
const result = Astro.getActionResult(actions.contact);
---
<form method="POST" action={actions.contact}>
  <label>
    Name
    <input name="name" required />
  </label>
  
  <label>
    Email
    <input type="email" name="email" required />
  </label>
  
  <label>
    Message
    <textarea name="message" required></textarea>
  </label>
  
  <button type="submit">Send</button>
  
  {result?.data?.success && (
    <p class="success">Message sent!</p>
  )}
  
  {result?.error && (
    <p class="error">{result.error.message}</p>
  )}
</form>
```

Works WITHOUT JavaScript — classic form POST, server responds with updated page.

### 3. Enhance with client-side for better UX (optional)

```astro
<form id="contact-form" method="POST" action={actions.contact}>
  <!-- same as above -->
</form>

<script>
  import { actions } from 'astro:actions';
  import { navigate } from 'astro:transitions/client';

  const form = document.getElementById('contact-form') as HTMLFormElement;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const { data, error } = await actions.contact(formData);
    
    if (error) {
      alert(error.message);
    } else {
      navigate('/contact/thanks');
    }
  });
</script>
```

### 4. Call actions from islands (React/Vue/etc.)

```tsx
// src/components/SubscribeForm.tsx
import { actions } from 'astro:actions';
import { useState } from 'react';

export default function SubscribeForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    const { data, error } = await actions.subscribe({ email });
    setStatus(error ? 'error' : 'success');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <button disabled={status === 'loading'}>
        {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
      </button>
      {status === 'success' && <p>Subscribed!</p>}
    </form>
  );
}
```

### 5. Error handling in actions

```ts
import { defineAction, ActionError } from 'astro:actions';

export const server = {
  createPost: defineAction({
    accept: 'json',
    input: z.object({ title: z.string() }),
    handler: async (input, context) => {
      if (!context.locals.user?.canPost) {
        throw new ActionError({ code: 'FORBIDDEN' });
      }
      try {
        return await db.createPost(input);
      } catch (err) {
        if (err.code === 'UNIQUE_VIOLATION') {
          throw new ActionError({
            code: 'CONFLICT',
            message: 'Post with this title already exists',
          });
        }
        throw err; // unexpected — let Astro handle
      }
    },
  }),
};
```

Error codes: `BAD_REQUEST`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `RATE_LIMITED`, `UNSUPPORTED_MEDIA_TYPE`, `UNPROCESSABLE_CONTENT`, `INTERNAL_SERVER_ERROR`.

### 6. Rate limiting (optional, recommended for public actions)

```ts
import { defineAction, ActionError } from 'astro:actions';

const attempts = new Map<string, number[]>();

export const server = {
  subscribe: defineAction({
    accept: 'form',
    input: z.object({ email: z.string().email() }),
    handler: async ({ email }, context) => {
      const ip = context.clientAddress;
      const now = Date.now();
      const recent = (attempts.get(ip) ?? []).filter(t => now - t < 60_000);
      if (recent.length >= 5) {
        throw new ActionError({ code: 'RATE_LIMITED', message: 'Too many requests' });
      }
      attempts.set(ip, [...recent, now]);
      
      await addToList(email);
      return { success: true };
    },
  }),
};
```

For production, use a durable store (Cloudflare KV, Redis, Durable Objects).

### 7. Verify

- Submit form with valid input → success flow
- Submit with invalid input → Zod error surfaced
- Submit when not authenticated → UNAUTHORIZED error
- Load form with JS disabled → still works (form POST fallback)

---

## Outputs

- `src/actions/index.ts` with defined actions
- Pages/components using actions
- Error handling + (optional) rate limiting

---

## Validation

- [ ] Actions defined with Zod schemas
- [ ] Form works without JS (progressive enhancement)
- [ ] Form works with JS (enhanced UX)
- [ ] Errors surfaced properly
- [ ] Types flow from server → client
- [ ] Rate limiting in place (if public)

---

## Anti-Patterns

- ❌ Using raw API endpoints when Actions would be simpler (actions provide types + validation out-of-box)
- ❌ Not validating input with Zod (accept: 'form' still needs schema)
- ❌ Catching and swallowing errors (let ActionError propagate)
- ❌ Rate limiting in memory on multi-instance serverless (use durable store)
- ❌ Using `accept: 'form'` when you need JSON (use `accept: 'json'`)

---

## Handoff

- **`@astro:matthew-phillips`** — action middleware + context internals
- **`@astro:nate-moore`** — auth integration for protected actions
- **`@astro:ben-holmes`** — writing to Astro DB from actions

---

## Error Handling

**Action returns 404:**
- Check output mode is 'server' or 'hybrid' (static can't run actions)
- Check adapter installed

**Types not flowing:**
- Run `npx astro sync`
- Check import: `import { actions } from 'astro:actions'` (not '../actions')

**Zod validation fails silently:**
- Check `input.data` vs `input.error` on the result
- In form mode, errors appear in `Astro.getActionResult(...)` on the server-rendered page
