// Template: API Route (server endpoint)
// Purpose: Type-safe REST endpoint with validation, error handling, auth
// Location: src/pages/api/your-endpoint.ts  (or [param].ts for dynamic)
// Requires: output: 'server' or 'hybrid' in astro.config.mjs

import type { APIRoute, APIContext } from 'astro';
import { z } from 'astro/zod';

// ════════════════════════════════════════════════════════════════════════════
// GET — return JSON data
// ════════════════════════════════════════════════════════════════════════════

export const GET: APIRoute = async ({ params, request, cookies, locals, url }) => {
  // Example: read query params
  const limit = Number(url.searchParams.get('limit') ?? 10);

  try {
    // Your data fetching
    const items = await fetchItems({ limit });

    return new Response(
      JSON.stringify({ items, count: items.length }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60, s-maxage=300',
        },
      }
    );
  } catch (err) {
    console.error('GET /api/items failed:', err);
    return new Response(
      JSON.stringify({ error: 'Internal error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// ════════════════════════════════════════════════════════════════════════════
// POST — accept JSON body, validate, create resource
// ════════════════════════════════════════════════════════════════════════════

const CreateItemSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  tags: z.array(z.string()).default([]),
});

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  // Auth check (Astro.locals populated by middleware)
  const user = locals.user;
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Parse body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Validate
  const parsed = CreateItemSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: 'Validation failed', issues: parsed.error.issues }),
      { status: 422, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Execute
  try {
    const item = await createItem({
      ...parsed.data,
      ownerId: user.id,
    });
    return new Response(JSON.stringify(item), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('POST /api/items failed:', err);
    return new Response(JSON.stringify({ error: 'Create failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// ════════════════════════════════════════════════════════════════════════════
// DYNAMIC ROUTE EXAMPLE: src/pages/api/items/[id].ts
// ════════════════════════════════════════════════════════════════════════════

export const PATCH: APIRoute = async ({ params, request, locals }) => {
  const { id } = params;
  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 });
  }

  const user = locals.user;
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  // ... fetch existing, check ownership, update, return
};

// ════════════════════════════════════════════════════════════════════════════
// STATIC ROUTE WITH getStaticPaths (static generation of endpoints)
// ════════════════════════════════════════════════════════════════════════════

// Uncomment if you want static JSON endpoints (prerendered)
//
// export const prerender = true;
//
// export function getStaticPaths() {
//   return [
//     { params: { id: '1' } },
//     { params: { id: '2' } },
//     { params: { id: '3' } },
//   ];
// }
//
// export const GET: APIRoute = ({ params }) => {
//   return new Response(JSON.stringify({ id: params.id }));
// };

// ════════════════════════════════════════════════════════════════════════════
// HELPERS (stub — replace with real implementations)
// ════════════════════════════════════════════════════════════════════════════

async function fetchItems({ limit }: { limit: number }) {
  // Replace with DB, API call, etc.
  return [];
}

async function createItem(data: z.infer<typeof CreateItemSchema> & { ownerId: string }) {
  // Replace with DB insert, etc.
  return { id: 'xxx', ...data };
}

// ════════════════════════════════════════════════════════════════════════════
// NOTES
// ════════════════════════════════════════════════════════════════════════════
//
// - For forms (progressive enhancement), prefer Astro Actions (see setup-actions.md)
// - For public data, add Cache-Control headers
// - For user data, set Cache-Control: private, no-store
// - Type Astro.locals via src/env.d.ts
// - On Cloudflare: workerd runtime, no Node-specific APIs (fs, path)
// - For heavy DB queries: consider Astro DB or edge-compatible ORM (Drizzle + Turso)
