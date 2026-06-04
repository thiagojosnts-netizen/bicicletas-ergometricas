// Template: Content Collections config
// Purpose: Type-safe content with Zod schemas, glob loader, references
// Author: ben-holmes
// Astro 5+ location: src/content.config.ts (Astro 4: src/content/config.ts)

import { defineCollection, reference, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

// ════════════════════════════════════════════════════════════════════════════
// AUTHORS — single JSON file with array of author objects
// ════════════════════════════════════════════════════════════════════════════
const authors = defineCollection({
  loader: file('./src/content/authors.json'),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    bio: z.string().max(300),
    avatar: z.string().optional(),
    twitter: z.string().regex(/^@/).optional(),
    website: z.string().url().optional(),
  }),
});

// ════════════════════════════════════════════════════════════════════════════
// BLOG — .md and .mdx files in src/content/blog/
// ════════════════════════════════════════════════════════════════════════════
const blog = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/blog',
  }),
  schema: ({ image }) => z.object({
    title: z.string().min(1).max(100),
    description: z.string().max(160, 'Description must be ≤160 chars for SEO'),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: reference('authors'),
    tags: z.array(z.string()).default([]),
    heroImage: image().optional(),  // image() resolves local paths to ImageMetadata
    heroImageAlt: z.string().optional(),
    draft: z.boolean().default(false),
    // Related posts (array of blog references)
    relatedPosts: z.array(reference('blog')).optional(),
  }),
});

// ════════════════════════════════════════════════════════════════════════════
// DOCS — structured documentation (if applicable)
// ════════════════════════════════════════════════════════════════════════════
const docs = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/docs',
  }),
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string().optional(),
    // Diátaxis type — enforces doc category discipline
    docType: z.enum(['tutorial', 'how-to', 'explanation', 'reference']),
    order: z.number().default(0),  // Sort order within sidebar
    heroImage: image().optional(),
    prerequisites: z.array(z.string()).default([]),
    lastUpdated: z.coerce.date().optional(),
  }),
});

// ════════════════════════════════════════════════════════════════════════════
// PROJECTS / PORTFOLIO — case studies, projects, etc.
// ════════════════════════════════════════════════════════════════════════════
const projects = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/projects',
  }),
  schema: ({ image }) => z.object({
    name: z.string(),
    summary: z.string(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    cover: image().optional(),
    technologies: z.array(z.string()),
    url: z.string().url().optional(),
    github: z.string().url().optional(),
    featured: z.boolean().default(false),
  }),
});

// ════════════════════════════════════════════════════════════════════════════
// EXPORT — all collections registered here
// ════════════════════════════════════════════════════════════════════════════
export const collections = {
  authors,
  blog,
  docs,
  projects,
};

/*
 * Usage:
 *
 * import { getCollection, getEntry, getEntries } from 'astro:content';
 *
 * // All blog posts
 * const posts = await getCollection('blog');
 *
 * // With filter (draft-aware)
 * const published = await getCollection('blog', ({ data }) =>
 *   import.meta.env.PROD ? !data.draft : true
 * );
 *
 * // Single entry
 * const post = await getEntry('blog', 'welcome');
 * const { Content } = await post.render();
 *
 * // Referenced entry
 * const author = await getEntry(post.data.author);
 *
 * // Array references
 * const related = await getEntries(post.data.relatedPosts ?? []);
 *
 * After adding/changing collections:
 * $ npx astro sync   (regenerates types)
 */
