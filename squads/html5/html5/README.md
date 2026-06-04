# 🏗️ HTML5 Squad — Semantic Web Sorcerers

> Oito sorcerers especializados em HTML5 semântico, acessibilidade WCAG e performance.
> Trabalha em conjunto com o **Design Squad** (`@design-chief`) para transformar designs em markup pristino.

---

## Visão Geral

O HTML5 Squad é especializado em criar sites que são:
- **Semânticos** — Cada elemento tem o propósito certo
- **Acessíveis** — WCAG 2.1 AA como mínimo, AAA quando possível
- **Performáticos** — HTML/CSS primeiro, JS apenas como enhancement
- **SEO-Ready** — Structured data, meta tags, canonical strategy
- **Screen Reader Friendly** — Experiência auditiva equivalente à visual

---

## Ativação

```bash
# Ativar orquestrador (ponto de entrada)
@html5-chief

# Ativar especialistas diretamente
@kashimo     # Diagnóstico de arquitetura
@hakari      # HTML5 semântico
@higuruma    # Acessibilidade / WCAG
@maki        # CSS Architecture
@choso       # Progressive Enhancement / JS
@inumaki     # Screen Reader / Voice UX
@uraume      # SEO Meta / <head>
```

---

## Estrutura do Squad

```
squads/html5/
├── agents/
│   ├── html5-chief.md    # 🏗️ Orchestrator
│   ├── kashimo.md        # ⚡ Tier 0 — Architecture Diagnostician
│   ├── hakari.md         # 🎰 Tier 1 — HTML5 Semantic Master
│   ├── higuruma.md       # ⚖️ Tier 1 — WCAG/ARIA Enforcer
│   ├── maki.md           # 🗡️ Tier 2 — CSS Architecture
│   ├── choso.md          # 🩸 Tier 2 — Progressive Enhancement
│   ├── inumaki.md        # 🍙 Tier 2 — Screen Reader Specialist
│   └── uraume.md         # ❄️ Tier 2 — SEO Meta & Head
├── workflows/
│   ├── greenfield-site.yaml    # Novo site do zero
│   └── brownfield-audit.yaml  # Auditoria de site existente
├── checklists/
│   ├── semantic-html-checklist.md
│   ├── wcag-checklist.md
│   └── pre-launch-checklist.md
├── data/
│   └── html5-kb.md
└── config.yaml
```

---

## Workflows

### Novo Site (Greenfield)
```
@html5-chief *workflow greenfield-site
```
Phases: Brief → Design Handoff → Architecture (kashimo) → HTML5 (hakari) →
Accessibility (higuruma) → CSS (maki) → Head (uraume) → JS? (choso) →
Screen Reader QA (inumaki) → Launch Validation

### Auditoria de Site Existente (Brownfield)
```
@html5-chief *workflow brownfield-audit
```
Phases: Diagnosis (kashimo) → WCAG Audit (higuruma) → Semantic Fixes (hakari) →
Meta Audit (uraume) → SR Report (inumaki)

### Recebendo do Design Chief
```
@html5-chief *design-handoff
```
Aceita design tokens + component specs do @design-chief e inicia implementação.

---

## Integração com Design Squad

```
@design-chief                    @html5-chief
     │                                │
     │ ── design tokens ──────────────▶ │
     │ ── component specs ─────────────▶ │
     │ ── brand guidelines ────────────▶ │
     │                                │
     │                           kashimo
     │                           hakari
     │                           maki
     │                           uraume
     │                                │
     │ ◀─── visual QA report ─────────│
     │ ◀─── accessibility report ─────│
     │ ◀─── lighthouse scores ────────│
```

---

## Agentes

| Ícone | Agente | Tier | Especialidade |
|-------|--------|------|---------------|
| 🏗️ | html5-chief | Orchestrator | Routing + Design Integration |
| ⚡ | kashimo | Tier 0 | Site Architecture Diagnosis |
| 🎰 | hakari | Tier 1 | HTML5 Semantic Structures |
| ⚖️ | higuruma | Tier 1 | WCAG 2.1 / ARIA |
| 🗡️ | maki | Tier 2 | CSS Architecture |
| 🩸 | choso | Tier 2 | Progressive Enhancement / JS |
| 🍙 | inumaki | Tier 2 | Screen Reader / Voice UX |
| ❄️ | uraume | Tier 2 | SEO Meta / `<head>` |

---

## Filosofia

> **HTML first. CSS second. JS only when necessary.**

Todo site produzido pelo HTML5 Squad:
1. Funciona sem JavaScript
2. Faz sentido sem CSS
3. É navegável apenas com teclado
4. Anuncia corretamente em screen readers
5. É indexado corretamente pelos motores de busca

---

*HTML5 Squad v1.0.0 — Semantic Web Sorcerers*
