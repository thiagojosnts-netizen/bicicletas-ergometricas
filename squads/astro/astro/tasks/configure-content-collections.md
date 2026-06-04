# Task: Configure Content Collections

**Task ID:** configure-content-collections
**Version:** 1.0.0
**Executor:** Agent
**Owner agent:** ben-holmes
**Purpose:** Set up type-safe Content Collections with Zod schemas and loaders.
**Duration:** 30-60 minutes

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `collections` | array | Yes | [{name, source, format, fields[]}] |
| `references` | array | No | Cross-collection links (e.g., blog.author → authors) |
| `has_drafts` | boolean | No | Enable draft filtering |

---

## Preconditions

- [ ] Astro project scaffolded
- [ ] Content types identified (see wf-content-collections-setup.yaml phase 0)
- [ ] `npx astro check` passes

---

## Steps

### 1. Create `src/content.config.ts`

```ts
// src/content.config.ts
import { defineCollection, reference, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

// Collection: authors (from single JSON file)
const authors = defineCollection({
  loader: file('./src/content/authors.json'),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    bio: z.string(),
    avatar: z.string().optional(),
    twitter: z.string().optional(),
  }),
});

// Collection: blog (from .md/.mdx files)
const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string().min(1).max(100),
    description: z.string().max(160, 'Description must be <=160 chars for SEO'),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: reference('authors'),
    tags: z.array(z.string()).default([]),
    heroImage: z.object({
      src: z.string(),
      alt: z.string(),
    }).optional(),
    draft: z.boolean().default(false),
  }),
});

// Export all collections
export const collections = { authors, blog };
```

### 2. Create content folders

```bash
mkdir -p src/content/blog
touch src/content/authors.json
```

### 3. Create authors data

```json
// src/content/authors.json
[
  {
    "id": "jane",
    "name": "Jane Doe",
    "bio": "Writes about modern web development.",
    "avatar": "/avatars/jane.jpg",
    "twitter": "@janedoe"
  },
  {
    "id": "john",
    "name": "John Smith",
    "bio": "Loves type safety and schemas.",
    "avatar": "/avatars/john.jpg"
  }
]
```

### 4. Create a sample blog post

```markdown
<!-- src/content/blog/welcome.md -->
---
title: "Welcome to my blog"
description: "This is my first post, published with Astro Content Collections."
pubDate: 2026-04-18
author: jane
tags: ["astro", "intro"]
draft: false
---

This is the body of the post. Write in markdown.

## Heading

- List item
- Another item
```

### 5. Regenerate types

```bash
npx astro sync
```

This reads `content.config.ts` and generates types in `.astro/types.d.ts`. Run whenever the schema changes.

### 6. Create utility helpers

```ts
// src/utils/content.ts
import { getCollection } from 'astro:content';

export const getPublishedPosts = () =>
  getCollection('blog', ({ data }) =>
    import.meta.env.PROD ? !data.draft : true
  );

export const sortByDate = <T extends { data: { pubDate: Date } }>(posts: T[]): T[] =>
  posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
```

### 7. Create list page

```astro
---
// src/pages/blog/index.astro
import { getPublishedPosts, sortByDate } from '../../utils/content';
import BaseLayout from '../../layouts/BaseLayout.astro';

const posts = sortByDate(await getPublishedPosts());
---
<BaseLayout title="Blog">
  <h1>Blog</h1>
  <ul>
    {posts.map(post => (
      <li>
        <a href={`/blog/${post.id}`}>{post.data.title}</a>
        <time datetime={post.data.pubDate.toISOString()}>
          {post.data.pubDate.toLocaleDateString()}
        </time>
        <p>{post.data.description}</p>
      </li>
    ))}
  </ul>
</BaseLayout>
```

### 8. Create detail page (dynamic route)

```astro
---
// src/pages/blog/[...slug].astro
import { getEntry, getEntries } from 'astro:content';
import { getPublishedPosts } from '../../utils/content';
import BaseLayout from '../../layouts/BaseLayout.astro';

export async function getStaticPaths() {
  const posts = await getPublishedPosts();
  return posts.map(post => ({
    params: { slug: post.id },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content, headings } = await post.render();
const author = await getEntry(post.data.author);
---
<BaseLayout title={post.data.title} description={post.data.description}>
  <article>
    <header>
      <h1>{post.data.title}</h1>
      <p>By <a href={`/authors/${author.data.id}`}>{author.data.name}</a></p>
      <time datetime={post.data.pubDate.toISOString()}>
        {post.data.pubDate.toLocaleDateString()}
      </time>
    </header>
    
    {headings.length > 0 && (
      <nav class="toc">
        <h2>Contents</h2>
        <ul>
          {headings.filter(h => h.depth === 2).map(h => (
            <li><a href={`#${h.slug}`}>{h.text}</a></li>
          ))}
        </ul>
      </nav>
    )}
    
    <Content />
  </article>
</BaseLayout>
```

### 9. Add tag pages

```astro
---
// src/pages/tags/[tag].astro
import { getPublishedPosts } from '../../utils/content';
import BaseLayout from '../../layouts/BaseLayout.astro';

export async function getStaticPaths() {
  const posts = await getPublishedPosts();
  const uniqueTags = [...new Set(posts.flatMap(p => p.data.tags))];
  return uniqueTags.map(tag => ({
    params: { tag },
    props: {
      tag,
      posts: posts.filter(p => p.data.tags.includes(tag)),
    },
  }));
}

const { tag, posts } = Astro.props;
---
<BaseLayout title={`Posts tagged "${tag}"`}>
  <h1>Tag: {tag}</h1>
  <ul>
    {posts.map(p => (
      <li><a href={`/blog/${p.id}`}>{p.data.title}</a></li>
    ))}
  </ul>
</BaseLayout>
```

### 10. Verify

```bash
npm run dev
```

- Visit `/blog` — list of posts
- Visit `/blog/welcome` — individual post with author, TOC
- Visit `/tags/astro` — posts tagged "astro"
- Check IDE: typing `post.data.` shows autocomplete for title, description, pubDate, etc.

---

## Outputs

- `src/content.config.ts` — schema + loaders
- `src/content/blog/*.md` — sample post(s)
- `src/content/authors.json` — authors data
- `src/utils/content.ts` — helpers
- `src/pages/blog/index.astro` + `[...slug].astro` — routes
- `src/pages/tags/[tag].astro` — tag pages

---

## Validation

- [ ] `npx astro check` passes (no TS errors)
- [ ] `npx astro sync` regenerates types
- [ ] IDE autocomplete works for entry.data.*
- [ ] Invalid frontmatter fails build with clear Zod error
- [ ] Draft posts visible in dev, hidden in `npm run build && npm run preview`
- [ ] References resolve (author name appears)
- [ ] Tag pages render from unique tags

---

## Anti-Patterns

- ❌ Using `z.any()` — defeats schema purpose
- ❌ Duplicating author data per post (use `reference('authors')`)
- ❌ Filtering drafts inline per page (use helper once)
- ❌ Forgetting `npx astro sync` after schema change
- ❌ Using `Date` instead of `z.coerce.date()` — fails on string dates in frontmatter

---

## Handoff

- **`@astro:john-otander`** — if posts are .mdx with components
- **`@astro:matt-kane`** — for heroImage handling
- **`@astro:matthew-phillips`** — for custom loader build issues

---

## Error Handling

**"Cannot find module 'astro:content'":**
- Run `npx astro sync`

**Zod error: "Unrecognized key in frontmatter":**
- Fix frontmatter to match schema, OR add field to schema

**`getCollection` returns empty array:**
- Check glob pattern matches files
- Check base path is relative to project root
- Check filenames aren't prefixed with `_` (Astro excludes those)
