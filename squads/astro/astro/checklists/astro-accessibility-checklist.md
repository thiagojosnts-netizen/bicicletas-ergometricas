# Astro Accessibility (A11y) Checklist

**Version:** 1.0.0
**Owner:** astro-chief + sarah-rainsberger
**Purpose:** Verify WCAG 2.2 AA compliance for production Astro sites.

---

## 🖼️ Images + Media

- [ ] All `<Image>` / `<Picture>` / `<img>` have `alt` attribute
- [ ] Decorative images have `alt=""` (empty, not missing)
- [ ] Meaningful `alt` text describes image purpose, not "image of..."
- [ ] Complex images (charts, infographics) have long description or adjacent text
- [ ] Videos have captions (for deaf users)
- [ ] Videos have audio descriptions (for blind users, where needed)
- [ ] Auto-playing media can be paused
- [ ] No flashing > 3 times per second (seizure-inducing)

## ⌨️ Keyboard Navigation

- [ ] All interactive elements focusable via Tab
- [ ] Tab order matches visual order (no strange jumps)
- [ ] Focus visible on every focused element (don't `outline: none` without replacement)
- [ ] Skip-to-content link at top of layout
- [ ] Modals trap focus (and restore focus on close)
- [ ] Dropdowns keyboard-operable (Escape closes, arrow keys navigate)
- [ ] No keyboard traps (user can always Tab out)

## 🎨 Color + Contrast

- [ ] Body text: contrast ratio ≥ 4.5:1
- [ ] Large text (≥ 18px bold or ≥ 24px): contrast ratio ≥ 3:1
- [ ] UI components (buttons, form fields): contrast ratio ≥ 3:1
- [ ] Focus indicators: contrast ratio ≥ 3:1 against background
- [ ] Information not conveyed by color alone (e.g., use icon + color for states)
- [ ] Tested in `prefers-color-scheme: dark` if dark mode supported
- [ ] Contrast tested with WebAIM Contrast Checker or axe DevTools

## 📝 Forms

- [ ] Every input has associated `<label>` (explicit `for`/`id` or wrapping label)
- [ ] Required fields marked (visually + `aria-required` or `required` attr)
- [ ] Errors associated with fields (`aria-describedby` or inline message)
- [ ] Error messages descriptive, not just "Invalid"
- [ ] Form submission errors announced to screen readers (aria-live)
- [ ] Fieldsets + legends for grouped inputs (radio groups, checkbox groups)
- [ ] Autocomplete attributes set (e.g., `autocomplete="email"`, `name"`)

## 🏷️ Semantic HTML

- [ ] `<main>` wraps primary content (one per page)
- [ ] `<nav>` wraps navigation
- [ ] `<article>` wraps standalone content (blog post, comment)
- [ ] `<aside>` wraps tangential content
- [ ] `<header>` and `<footer>` used where appropriate
- [ ] `<button>` for actions; `<a>` for navigation
- [ ] No `<div>` where semantic element exists
- [ ] No `role="button"` on `<div>` (use `<button>`)

## 📐 Heading Hierarchy

- [ ] One `<h1>` per page
- [ ] Headings nest logically (no h2 → h4 skip)
- [ ] Headings describe content structure (not just styled text)
- [ ] No empty headings
- [ ] Visual hierarchy matches semantic hierarchy

## 🔗 Links

- [ ] Link text descriptive out of context ("Download the style guide" not "click here")
- [ ] Links distinguishable from body text (not color alone — underline or bold)
- [ ] External links identified (icon + `aria-label` or text)
- [ ] Links opening in new tab use `target="_blank"` + `rel="noopener noreferrer"`
- [ ] Current page link indicated (`aria-current="page"`)

## 📱 Responsive + Zoom

- [ ] Site usable at 200% zoom (no content loss or horizontal scroll)
- [ ] Site usable at 320px wide (smallest typical device)
- [ ] Text reflows (no fixed pixel widths that cause clipping)
- [ ] Touch targets ≥ 44×44 CSS pixels
- [ ] Content not locked to specific orientation (portrait OR landscape)

## 🎬 Motion + Animation

- [ ] `@media (prefers-reduced-motion: reduce)` respected:
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
  ```
- [ ] Astro View Transitions have opt-out:
  ```astro
  <ClientRouter fallback="none" />
  ```
  Or:
  ```css
  @media (prefers-reduced-motion: reduce) {
    [data-astro-transition] { view-transition-name: none; }
  }
  ```
- [ ] No parallax without reduced-motion support
- [ ] No auto-playing videos/animations > 5 seconds

## 🔊 Screen Reader

- [ ] Tested with VoiceOver (Mac/iOS)
- [ ] Tested with NVDA (Windows, free)
- [ ] Tested with JAWS (Windows, enterprise)
- [ ] Tested with TalkBack (Android)
- [ ] `<main>` is reachable via "jump to main content"
- [ ] Meaningful page title (appears in screen reader tabs list)
- [ ] Live regions used for dynamic content (`aria-live="polite"`)

## 🌍 Internationalization

- [ ] `<html lang="...">` matches page language
- [ ] Language changes in content marked: `<span lang="fr">bonjour</span>`
- [ ] Text not baked into images (so it translates)

## 🔍 Automated Testing

- [ ] axe DevTools browser extension run on key pages (0 errors for WCAG AA)
- [ ] Lighthouse Accessibility score ≥ 95
- [ ] axe-core integrated in CI (optional, recommended for maturity)
- [ ] Storybook + axe-storybook-addon (if using Storybook)

## 👤 Manual Testing

- [ ] Navigated entire site using only keyboard (no mouse)
- [ ] Listened to key pages with a screen reader
- [ ] Tested at 200% zoom
- [ ] Tested with Windows High Contrast Mode
- [ ] Tested with forced-colors CSS media feature

## ⚠️ Astro-Specific A11y

- [ ] Client-side framework components (React/Vue/etc.) use correct ARIA
- [ ] `client:only` components show a meaningful fallback (SSR-free can cause flash)
- [ ] View Transitions don't disorient users (smooth, respect prefers-reduced-motion)
- [ ] Dynamically rendered content (via client directives) announced to screen readers

## 🚫 Hard Blockers (WCAG 2.2 AA)

- ❌ Images without `alt` attribute
- ❌ Form inputs without labels
- ❌ Color-only information
- ❌ Contrast < 4.5:1 on body text
- ❌ Keyboard inaccessible widgets
- ❌ Missing `<html lang>`
- ❌ Empty buttons or links

---

## Tools

- [axe DevTools](https://www.deque.com/axe/devtools/) (browser extension)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Lighthouse](https://developer.chrome.com/docs/lighthouse) (built into Chrome)
- [pa11y](https://pa11y.org/) (CLI a11y tester)
- [HTMLHint](https://htmlhint.com/) (static analysis)
- [VoiceOver (Mac built-in)](https://www.apple.com/accessibility/vision/)
- [NVDA (free Windows)](https://www.nvaccess.org/)

---

## Resources

- [WCAG 2.2 Quickref](https://www.w3.org/WAI/WCAG22/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [Deque University](https://dequeuniversity.com/) (paid training)
- [A11y Project](https://www.a11yproject.com/) (free checklist + resources)

---

_Last reviewed: 2026-04-18_
