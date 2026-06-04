# Astro Squad 🚀

> **Zero JS by default. Ship HTML. Hydrate islands. Measure everything.**

Elite squad for building the fastest possible websites with Astro. Covers the
entire production lifecycle — greenfield bootstrapping, migrations, performance
audits, Content Collections, image optimization, MDX, API routes, adapters, and
Core Web Vitals mastery.

**Version:** 1.0.0 · **Created:** 2026-04-18 · **Based on:** Astro 5+, post-Cloudflare acquisition

---

## Table of Contents

- [The Squad](#the-squad)
- [Quick Start](#quick-start)
- [Commands](#commands)
- [Workflows](#workflows)
- [Tasks](#tasks)
- [Templates](#templates)
- [Checklists](#checklists)
- [When to Use Which Specialist](#when-to-use-which-specialist)
- [File Structure](#file-structure)

---

## The Squad

11 agents, organized by tier:

### Orchestrator
| Agent | Role |
|-------|------|
| 🚀 **[astro-chief](agents/astro-chief.md)** | Entry point. Triages, routes to specialists, enforces quality gates. |

### Tier 0 — Diagnosis
| Agent | Expertise |
|-------|-----------|
| 📊 **[addy-osmani](agents/addy-osmani.md)** | Core Web Vitals diagnostician. LCP/INP/CLS assessment, Lighthouse interpretation, RUM. |

### Tier 1 — Masters (Astro Core Team)
| Agent | Expertise |
|-------|-----------|
| 🏝️ **[fred-schott](agents/fred-schott.md)** | Co-founder, CEO. Architecture, Islands philosophy, when to use Astro. |
| ⚙️ **[matthew-phillips](agents/matthew-phillips.md)** | Co-founder. Framework internals, Vite, compiler, middleware, SSR. |
| 🧩 **[nate-moore](agents/nate-moore.md)** | Co-founder. Integrations, adapters, component API design. |
| 📚 **[ben-holmes](agents/ben-holmes.md)** | Content Collections, Astro DB, DX. |

### Tier 2 — Systematizers
| Agent | Expertise |
|-------|-----------|
| 📖 **[sarah-rainsberger](agents/sarah-rainsberger.md)** | Documentation, tutorials, Diátaxis framework. |
| 🧪 **[jason-miller](agents/jason-miller.md)** | Partial hydration, Preact, bundle optimization. |

### Tier 3 — Specialists
| Agent | Expertise |
|-------|-----------|
| 🎨 **[harry-roberts](agents/harry-roberts.md)** | CSS performance, critical CSS, font loading. |
| 🖼️ **[matt-kane](agents/matt-kane.md)** | Image service, responsive images, `<Picture>`. |
| 📝 **[john-otander](agents/john-otander.md)** | MDX, remark/rehype plugins, content-as-code. |

---

## Quick Start

### Activation

```
@astro-chief
```

For a specific specialist:
```
@astro:fred-schott
@astro:matt-kane
@astro:addy-osmani
```

### Creating a New Astro Site

```
@astro-chief
*create-site
```

Runs the [`wf-create-astro-site.yaml`](workflows/wf-create-astro-site.yaml)
workflow: discovery → bootstrap → architecture → content → layout → quality → deploy.

**Expected output:** a production-ready Astro site with Lighthouse ≥ 95,
adapter configured, Content Collections with Zod schemas, and optimized images.

### Auditing Performance on an Existing Site

```
@astro-chief
*audit-performance
```

Runs [`wf-performance-audit.yaml`](workflows/wf-performance-audit.yaml): baseline
measurement → diagnosis → specialist-routed remediation → re-measurement → RUM setup.

---

## Commands

Commands prefixed with `*` are invoked from `astro-chief`:

### Creation
| Command | Purpose |
|---------|---------|
| `*create-site` | Bootstrap new Astro project |
| `*migrate` | Migrate from Next.js / Gatsby / 11ty |
| `*setup-content-collections` | Design Content Collections with schemas |
| `*setup-mdx` | Configure MDX + plugins |
| `*integrate-cms` | Connect headless CMS (Storyblok, Sanity, etc.) |
| `*configure-adapter` | Install + configure SSR adapter |
| `*setup-actions` | Add type-safe server actions |
| `*setup-view-transitions` | Add `ClientRouter` + named transitions |

### Audit
| Command | Purpose |
|---------|---------|
| `*audit-performance` | Full CWV + bundle + CSS + fonts audit |
| `*audit-cwv` | Focused Core Web Vitals |
| `*audit-bundle` | JS bundle size analysis |
| `*audit-css` | CSS performance audit |

### Optimization
| Command | Purpose |
|---------|---------|
| `*optimize-images` | Setup `<Image>`/`<Picture>`, formats, preload |
| `*optimize-fonts` | Font loading (preload, woff2, font-display) |
| `*optimize-bundle` | Reduce JS bundle size |
| `*configure-islands` | Audit client:* directive choices |
| `*configure-prefetch` | Link prefetch strategy |

### Routing + Handoff
| Command | Purpose |
|---------|---------|
| `*route {request}` | Explicitly route to best specialist |
| `*handoff {agent}` | Transfer context to specialist |
| `*status` | Show current context |

### Utility
| Command | Purpose |
|---------|---------|
| `*help` | List all commands |
| `*checklist {name}` | Run a checklist (performance / production / seo / a11y) |
| `*exit` | Deactivate |

---

## Workflows

Multi-phase workflows in [`workflows/`](workflows/):

| Workflow | Duration | Primary Agent |
|----------|----------|---------------|
| [wf-create-astro-site.yaml](workflows/wf-create-astro-site.yaml) | 2-4 hours | astro-chief |
| [wf-performance-audit.yaml](workflows/wf-performance-audit.yaml) | 1-3 hours | addy-osmani |
| [wf-content-collections-setup.yaml](workflows/wf-content-collections-setup.yaml) | 30-90 min | ben-holmes |
| [wf-integrations-setup.yaml](workflows/wf-integrations-setup.yaml) | 30-60 min | nate-moore |

---

## Tasks

Atomic tasks in [`tasks/`](tasks/):

| Task | Owner Agent | Duration |
|------|-------------|----------|
| [setup-astro-project.md](tasks/setup-astro-project.md) | astro-chief | 15-30 min |
| [configure-image-optimization.md](tasks/configure-image-optimization.md) | matt-kane | 20-40 min |
| [setup-mdx.md](tasks/setup-mdx.md) | john-otander | 20-30 min |
| [configure-content-collections.md](tasks/configure-content-collections.md) | ben-holmes | 30-60 min |
| [integrate-cms-api.md](tasks/integrate-cms-api.md) | ben-holmes + nate-moore | 45-90 min |
| [configure-islands.md](tasks/configure-islands.md) | jason-miller | 30-60 min |
| [audit-core-web-vitals.md](tasks/audit-core-web-vitals.md) | addy-osmani | 30-60 min |
| [configure-view-transitions.md](tasks/configure-view-transitions.md) | nate-moore | 15-30 min |
| [setup-ssr-adapter.md](tasks/setup-ssr-adapter.md) | nate-moore | 15-30 min |
| [optimize-bundle-size.md](tasks/optimize-bundle-size.md) | jason-miller | 30-90 min |
| [configure-prefetch-fonts.md](tasks/configure-prefetch-fonts.md) | harry-roberts | 30-45 min |
| [setup-actions.md](tasks/setup-actions.md) | matthew-phillips + nate-moore | 30-60 min |

---

## Templates

Copy-ready scaffolds in [`templates/`](templates/):

| Template | Purpose |
|----------|---------|
| [astro-config-tmpl.mjs](templates/astro-config-tmpl.mjs) | Optimal `astro.config.mjs` baseline |
| [base-layout-tmpl.astro](templates/base-layout-tmpl.astro) | Production layout (SEO, fonts, ClientRouter) |
| [picture-component-tmpl.astro](templates/picture-component-tmpl.astro) | Custom `<Picture>` for art direction |
| [content-config-tmpl.ts](templates/content-config-tmpl.ts) | Content Collections with Zod schemas |
| [mdx-page-tmpl.mdx](templates/mdx-page-tmpl.mdx) | MDX post with components |
| [api-route-tmpl.ts](templates/api-route-tmpl.ts) | API endpoint with validation + auth |

---

## Checklists

Validation checklists in [`checklists/`](checklists/):

| Checklist | When |
|-----------|------|
| [astro-performance-checklist.md](checklists/astro-performance-checklist.md) | After optimization, before PR merge, on deploy |
| [astro-production-readiness.md](checklists/astro-production-readiness.md) | Pre-launch |
| [astro-seo-checklist.md](checklists/astro-seo-checklist.md) | Pre-launch, after content changes |
| [astro-accessibility-checklist.md](checklists/astro-accessibility-checklist.md) | Pre-launch, after UI changes |

---

## When to Use Which Specialist

Use this table when you're unsure:

| Situation | Route to |
|-----------|----------|
| "Should I use Astro at all?" | @astro:fred-schott |
| "Site is slow, I don't know why" | @astro:addy-osmani |
| "LCP is 4s" | @astro:addy-osmani → then @matt-kane or @harry-roberts |
| "My build fails on Cloudflare" | @astro:matthew-phillips |
| "Bundle is 200kb, how to reduce" | @astro:jason-miller |
| "Picture component / responsive images" | @astro:matt-kane |
| "Content Collections setup" | @astro:ben-holmes |
| "MDX + custom components" | @astro:john-otander |
| "Fonts cause FOUT / CSS is too big" | @astro:harry-roberts |
| "Which adapter should I use?" | @astro:nate-moore |
| "Write docs / tutorial" | @astro:sarah-rainsberger |
| "React vs Preact vs Svelte for my island" | @astro:jason-miller (bundle) + @nate-moore (ecosystem) |
| "Migrating from Next.js/Gatsby" | @astro:fred-schott (strategy) → then tactical specialists |

---

## File Structure

```
squads/astro/
├── README.md                           ← you are here
├── config.yaml                         ← pack configuration
├── agents/
│   ├── astro-chief.md                  ← orchestrator (entry point)
│   ├── fred-schott.md                  ← Tier 1: architecture
│   ├── matthew-phillips.md             ← Tier 1: framework internals
│   ├── nate-moore.md                   ← Tier 1: integrations
│   ├── ben-holmes.md                   ← Tier 1: content
│   ├── sarah-rainsberger.md            ← Tier 2: docs
│   ├── jason-miller.md                 ← Tier 2: hydration/bundle
│   ├── addy-osmani.md                  ← Tier 0: diagnosis
│   ├── harry-roberts.md                ← Tier 3: CSS
│   ├── matt-kane.md                    ← Tier 3: images
│   └── john-otander.md                 ← Tier 3: MDX
├── workflows/
│   ├── wf-create-astro-site.yaml
│   ├── wf-performance-audit.yaml
│   ├── wf-content-collections-setup.yaml
│   └── wf-integrations-setup.yaml
├── tasks/
│   ├── setup-astro-project.md
│   ├── configure-image-optimization.md
│   ├── setup-mdx.md
│   ├── configure-content-collections.md
│   ├── integrate-cms-api.md
│   ├── configure-islands.md
│   ├── audit-core-web-vitals.md
│   ├── configure-view-transitions.md
│   ├── setup-ssr-adapter.md
│   ├── optimize-bundle-size.md
│   ├── configure-prefetch-fonts.md
│   └── setup-actions.md
├── templates/
│   ├── astro-config-tmpl.mjs
│   ├── base-layout-tmpl.astro
│   ├── picture-component-tmpl.astro
│   ├── content-config-tmpl.ts
│   ├── mdx-page-tmpl.mdx
│   └── api-route-tmpl.ts
├── checklists/
│   ├── astro-performance-checklist.md
│   ├── astro-production-readiness.md
│   ├── astro-seo-checklist.md
│   └── astro-accessibility-checklist.md
└── data/
    └── astro-kb.md                     ← knowledge base
```

---

## Philosophy

The squad enforces:

1. **Zero JS by default.** Every `client:*` directive must be justified.
2. **Measure, don't guess.** No optimization claim without Lighthouse/CrUX numbers.
3. **Route to specialists.** Don't improvise in a domain you're shallow on.
4. **Content first.** Start with schemas and collections, not components.
5. **Adapter drives everything.** Decide runtime early.
6. **Quality gates are non-negotiable.** Lighthouse ≥ 95, LCP < 2.5s, CLS < 0.1.

---

## Updates + Contributions

- **Source of truth:** Astro official docs ([docs.astro.build](https://docs.astro.build))
- **Recent context:** Cloudflare acquired Astro Jan 2026 → Cloudflare adapter is default
- **To update:** open a PR against `squads/astro/`. Validate with `astro-performance-checklist.md`
  and run the smoke tests in each agent.

---

## License

MIT — same as Astro. Use freely.

---

_Built by the Astro Squad. Maintained by the community._
