# Task: Setup Astro Project

**Task ID:** setup-astro-project
**Version:** 1.0.0
**Executor:** Agent (with Hybrid validation)
**Purpose:** Scaffold a new Astro project with optimal defaults for a production site.
**Owner agent:** astro-chief
**Duration:** 15-30 minutes

---

## Inputs

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `project_name` | string | Yes | kebab-case name (e.g., "my-site") |
| `package_manager` | enum | Yes | npm \| pnpm \| bun \| yarn |
| `typescript_strictness` | enum | Yes | strict \| strictest \| base |
| `git_init` | boolean | No | Default true |

---

## Preconditions

- [ ] Node.js >= 20 installed (check: `node --version`)
- [ ] Package manager installed (check: `{pm} --version`)
- [ ] Git installed (`git --version`)
- [ ] Current directory is parent of new project folder
- [ ] Not inside an existing Astro project (`ls astro.config.* 2>/dev/null` returns nothing)

---

## Steps

### 1. Scaffold via create-astro

```bash
npm create astro@latest {project_name} -- \
  --template minimal \
  --typescript {strictness} \
  --install \
  --git \
  --no-houston
```

Flags explained:
- `--template minimal` — no demo content (we'll build from scratch)
- `--typescript strict` — `strictest` is more aggressive; `base` is loose
- `--install` — runs `{pm} install` automatically
- `--git` — initializes git repo
- `--no-houston` — skip the mascot dialogue for scriptability

### 2. Enter project directory

```bash
cd {project_name}
```

### 3. Verify package.json

```bash
cat package.json
```

Expected: `"astro": "^5.x"`, `"@astrojs/check": "^0.9"`, Node engine >= 20.

### 4. Verify TypeScript config

```bash
cat tsconfig.json
```

Should extend `astro/tsconfigs/strict`. If `base` or `strictest` was chosen, the extends value differs.

### 5. Run dev server

```bash
{pm} run dev
```

Visit `http://localhost:4321/`. Should see a basic "Welcome to Astro" page.

### 6. Run `astro check`

```bash
npx astro check
```

Should output zero errors. If errors, address them before proceeding — subsequent work builds on this clean base.

### 7. Verify first commit

```bash
git log --oneline
```

Should show at least one commit from the scaffold. If not, initialize:

```bash
git init
git add .
git commit -m "chore: scaffold Astro project"
```

### 8. Add recommended .gitignore entries

Check `.gitignore` includes:
```
.astro/
dist/
node_modules/
.env
.env.local
.DS_Store
```

If `.env` not listed, add it (critical — prevents committing secrets).

---

## Outputs

- `./{project_name}/` directory with:
  - `astro.config.mjs`
  - `package.json`
  - `tsconfig.json`
  - `src/pages/index.astro`
  - `public/favicon.svg`
  - `.gitignore`
  - initial git commit

---

## Validation

- [ ] `{pm} run dev` starts server without error
- [ ] Homepage renders at localhost:4321
- [ ] `npx astro check` passes
- [ ] `git log` shows initial commit
- [ ] `.env` in `.gitignore`
- [ ] TypeScript strict mode active

---

## Anti-Patterns

- ❌ Running `npm install` then `create-astro` (order matters — use `npm create` directly)
- ❌ Using `--template blog` or other starter templates for production (they include demo content that needs cleanup)
- ❌ Skipping `--typescript strict` (weaker typing compounds later)
- ❌ Using Node < 20 (many APIs fail silently)

---

## Handoff

After this task completes, route to:

- **`configure-islands.md`** — if site needs interactivity
- **`configure-content-collections.md`** — if site has content (blog, docs)
- **`setup-ssr-adapter.md`** — if SSR/hybrid needed
- **`configure-image-optimization.md`** — for image setup

---

## Error Handling

**`create-astro` fails with EACCES:**
- Try running in a directory you own (not /usr/local or similar)
- Check npm/npx permissions

**TypeScript errors immediately after scaffold:**
- Check Node version (must be >= 20)
- Run `{pm} install` again to ensure deps resolved

**Dev server starts but 404 on /:**
- Check `src/pages/index.astro` exists
- Re-run scaffold if pages folder missing

---

## Heuristics Referenced

- Uses sensible defaults that match production needs
- Strict TypeScript by default (enforces quality from day 1)
- Git hygiene (initial commit, .env excluded)
