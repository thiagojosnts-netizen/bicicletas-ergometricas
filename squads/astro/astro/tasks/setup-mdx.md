# Task: Setup MDX

**Task ID:** setup-mdx
**Version:** 1.0.0
**Executor:** Agent
**Owner agent:** john-otander
**Purpose:** Add @astrojs/mdx integration with remark/rehype plugins and custom components.
**Duration:** 20-30 minutes

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `features` | string[] | Yes | Which: toc, slugs, autolink_headings, external_links, syntax_highlight, gfm |
| `syntax_highlighter` | enum | Yes | shiki (default) \| prism \| rehype-pretty-code |
| `theme` | string | No | Shiki theme (e.g., 'github-dark', 'dracula') |
| `custom_components` | string[] | No | e.g., ['Callout', 'Figure', 'CodeDemo'] |

---

## Preconditions

- [ ] Astro project with content/ folder (or Content Collections configured)
- [ ] `npx astro check` passes

---

## Steps

### 1. Install MDX integration

```bash
npx astro add mdx
```

This:
- Installs `@astrojs/mdx`
- Updates `astro.config.mjs` with `mdx()` in integrations
- Installs peer dependencies

### 2. Install plugins based on features

```bash
npm install -D remark-gfm remark-toc rehype-slug rehype-autolink-headings rehype-external-links
```

Skip plugins not in `features`.

### 3. Configure in astro.config.mjs

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import remarkGfm from 'remark-gfm';
import remarkToc from 'remark-toc';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeExternalLinks from 'rehype-external-links';

export default defineConfig({
  markdown: {
    remarkPlugins: [
      remarkGfm,
      [remarkToc, { heading: 'contents' }],
    ],
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, {
        behavior: 'append',
        content: { type: 'text', value: ' #' },
      }],
      [rehypeExternalLinks, {
        target: '_blank',
        rel: ['noopener', 'noreferrer'],
      }],
    ],
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
    gfm: true,
  },
  integrations: [mdx()],
});
```

**Note:** MDX integration inherits `markdown` config. If you need MDX-specific overrides:

```js
integrations: [
  mdx({
    // Overrides markdown-wide config for .mdx files only
    remarkPlugins: [remarkGfm, remarkMdxSpecific],
  }),
],
```

### 4. Create custom MDX components

```astro
---
// src/components/Callout.astro
interface Props {
  type?: 'info' | 'warning' | 'success' | 'error';
  title?: string;
}
const { type = 'info', title } = Astro.props;
---
<aside class:list={['callout', `callout-${type}`]}>
  {title && <strong class="callout-title">{title}</strong>}
  <div class="callout-body"><slot /></div>
</aside>

<style>
  .callout {
    border-left: 4px solid;
    padding: 1rem 1.25rem;
    margin: 1.5rem 0;
    border-radius: 4px;
  }
  .callout-info    { border-color: #3b82f6; background: #eff6ff; }
  .callout-warning { border-color: #f59e0b; background: #fffbeb; }
  .callout-success { border-color: #10b981; background: #ecfdf5; }
  .callout-error   { border-color: #ef4444; background: #fef2f2; }
  .callout-title   { display: block; margin-bottom: 0.5rem; font-weight: 600; }
</style>
```

### 5. Use components in MDX

**Approach A: Explicit import per file (verbose, typed, discoverable).**

```mdx
---
title: "My post"
pubDate: 2026-04-18
---
import Callout from '../../components/Callout.astro';

# {frontmatter.title}

<Callout type="info">
  This is an info callout.
</Callout>
```

**Approach B: Pass components prop to `<Content>` (less boilerplate).**

```astro
---
// src/pages/blog/[slug].astro
import { getEntry } from 'astro:content';
import Callout from '../../components/Callout.astro';
import Figure from '../../components/Figure.astro';

const post = await getEntry('blog', Astro.params.slug);
const { Content } = await post.render();
---
<Content components={{ Callout, Figure }} />
```

In the MDX file, `<Callout>` works without import.

### 6. Override default HTML elements (optional)

```astro
<Content components={{
  h1: CustomH1,
  a: AutolinkCheckingLink,
  code: CustomCode,
}} />
```

Every `<h1>` in MDX becomes `<CustomH1>`. Useful for design system enforcement.

### 7. Advanced syntax highlighting (optional — swap to rehype-pretty-code)

```bash
npm install -D rehype-pretty-code
```

```js
import rehypePrettyCode from 'rehype-pretty-code';

export default defineConfig({
  markdown: {
    syntaxHighlight: false, // disable Astro default
  },
  integrations: [
    mdx({
      rehypePlugins: [
        [rehypePrettyCode, {
          theme: 'github-dark',
          keepBackground: false,
        }],
      ],
    }),
  ],
});
```

Enables:
- Line numbers: ```ts showLineNumbers
- Line highlights: ```ts {3,5-7}
- Word highlights: ```ts /defineConfig/
- Filename: ```ts title="src/config.ts"

CSS for features in `src/styles/code.css` (see @astro:harry-roberts for design-system integration).

### 8. Verify

Create a test MDX file, run `npm run dev`, verify:
- Frontmatter parses (title, etc.)
- Components render (<Callout> appears as styled aside)
- Code blocks highlighted
- Headings have auto-generated anchor links
- External links open in new tab

---

## Outputs

- `astro.config.mjs` updated with MDX integration + plugins
- `src/components/` with reusable MDX components
- Working .mdx test file

---

## Validation

- [ ] `npx astro check` passes
- [ ] Test .mdx file renders
- [ ] Frontmatter accessible via `frontmatter.*`
- [ ] Custom components render (Callout, etc.)
- [ ] Syntax highlighting visible
- [ ] Auto-linked headings
- [ ] External links have `target="_blank"`

---

## Anti-Patterns

- ❌ Configuring plugins separately in `markdown` AND `mdx()` (inheritance confusion)
- ❌ Heavy use of components prop for rarely-used components (explicit import is cleaner)
- ❌ Using `<h1>` for every section (use h2+ and rehype-slug)
- ❌ Forgetting `rel: ['noopener', 'noreferrer']` on external links (security)

---

## Handoff

- **`@astro:ben-holmes`** — integrate MDX with Content Collections
- **`@astro:harry-roberts`** — style code blocks to match design system
- **`@astro:sarah-rainsberger`** — author docs/tutorials in MDX

---

## Error Handling

**Import error in MDX:**
- Check path (relative to the .mdx file, not the page)
- Check file extension (.astro / .tsx / .vue)

**Component not rendering:**
- Case-sensitive — `<callout>` treated as HTML, `<Callout>` as component
- Check import statement at top of MDX

**Plugin runs twice (once for .md, once for .mdx):**
- Expected. MDX inherits markdown config + applies its own.
- To avoid, set mdx() with only the plugins NOT already in markdown config.
