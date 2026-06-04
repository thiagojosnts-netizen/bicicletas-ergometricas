# 🕸️ Schema Entity Squad v2.0

> **Semantic Schema & Entity Disambiguation** — O squad mais completo de schema semântico disponível. Macro (arquitetura do site inteira) × Micro (cada URL, cada entidade, cada propriedade). DNA: Koray + Jarno van Driel + Jason Barnard + Patrick Stox + Andrea Volpini.

---

## O que faz

Squad **executivo** (não consultivo) para auditar, planejar e implementar structured data em escala. Cobre **30+ tipos de rich results**, **3 formatos de markup** (JSON-LD, Microdata, RDFa) e **10 stacks** (HTML, Markdown, Astro, React, Next.js, Vue, SvelteKit, Shopify, WordPress, Webflow).

**Missão:**

1. Auditoria semântica completa (Central Entity + clusters + foundation schema)
2. Mapeamento de entidades → Wikidata Q-IDs + Wikipedia + hubs proprietários
3. Identificação de oportunidades de rich snippets (P1 quick wins → P3 expansão)
4. Micro-audit das URLs prioritárias com score 0-100
5. Blueprint de implementação priorizado (P1/P2/P3)
6. Implementação JSON-LD/Microdata/RDFa no CMS específico
7. Entity hubs + bidirectional linking sistemático
8. Validação contínua (Rich Results Test + GSC + CWV)
9. Schema-first content brief para novos conteúdos

---

## Agentes (9)

| Agente | Tier | DNA | Especialidade |
|--------|------|-----|---------------|
| 🕸️ `@schema-chief` | Orchestrator | — | Triage, routing, orquestração do pipeline |
| 🧬 `@koray-semantic` | 0 (Diagnostic) | Koray Tuğberk GÜBÜR | Topical Authority, Central Entity, A/B hypothesis |
| 📐 `@schema-architect` | 1 | Jarno van Driel | JSON-LD templates, @graph, connected schema |
| 🔍 `@entity-disambiguator` | 1 | Jason Barnard | Wikidata Q-IDs, sameAs, entity hubs |
| ⚙️ `@tech-seo-engineer` | 1 | Patrick Stox | Validação, Rich Results Test, GSC, CWV, pipeline |
| 🧩 `@kg-engineer` | 1 | Andrea Volpini | SPARQL, Python scripts, CMS injection |
| ⭐ `@rich-snippets-master` | 1 | — | Mapa dos 30+ rich results, oportunidade × esforço |
| 🗺️ `@semantic-content-architect` | 1 | — | Visão macro×micro, schema-first content, bridge para `seo-ai-god` |
| 🔧 `@multiformat-engineer` | 1 | — | JSON-LD × Microdata × RDFa × todos os stacks |

**Regra de ativação:** SEMPRE começar pelo `@schema-chief` ou `@koray-semantic`. Nunca ativar Tier 1 sem diagnóstico semântico.

---

## Workflows (5)

| Workflow | Fases | Duração | Input → Output |
|---------|-------|---------|---------------|
| `wf-site-semantic-blueprint` **(entry)** | 6 (P1-P6) | 5-8h | site_url → blueprint completo macro→micro |
| `wf-schema-audit` | 2 | 2-4h | site_url → audit-report.md + master_entity_table.csv |
| `wf-entity-disambiguation` | 1 | 2-3h | master_entity_table → disambiguation-strategy.md |
| `wf-schema-implementation` | 4 fases (incl. 4b hubs) | 3-6h | strategy → JSON-LD injetado + entity hubs + bidirectional |
| `wf-validation-pipeline` | 1 (ongoing) | contínuo | implementação → validation-report + GSC monitoring |

**Entry workflow oficial:** `wf-site-semantic-blueprint` — 6 fases (Identidade → Mapa de Entidades → Rich Snippets → Micro Audit → Implementation Blueprint → Brief Template).

**Pipeline completo:** `@schema-chief *full-pipeline` executa blueprint → implementation → validation em sequência.

---

## Tasks Disponíveis (13)

| Task | Agente padrão | O que faz |
|------|---------------|-----------|
| `audit-schema-inventory` | tech-seo-engineer | Inventário + score 0-100 por URL |
| `score-page-schema` | tech-seo-engineer | Score detalhado de uma página |
| `map-entity-wikidata` | entity-disambiguator | Entidade → Q-ID + Wikipedia URL |
| `enrich-entities-api` | kg-engineer | Enriquecer tabela via API Wikidata (Python) |
| `build-entity-hub` | entity-disambiguator | Criar entity hub + schema + bidirectional plan |
| `setup-bidirectional-links` | entity-disambiguator | Configurar links hub ↔ spokes |
| `generate-jsonld-template` | schema-architect | Template JSON-LD por tipo de página |
| `generate-microdata` | multiformat-engineer | Microdata/RDFa equivalente ao JSON-LD |
| `inject-schema-cms` | kg-engineer | Injetar schema (WP, Next.js, Astro, Shopify, etc.) |
| `validate-rich-results` | tech-seo-engineer | Rich Results Test em batch |
| `map-rich-snippets-opportunities` | rich-snippets-master | Matriz de oportunidades × esforço × ROI |
| `semantic-content-brief` | semantic-content-architect | Brief schema-first para novos conteúdos |
| `macro-site-semantic-audit` | semantic-content-architect | Auditoria semântica macro do site inteiro |

---

## Quick Start

### Projeto novo (blueprint + implementação)

```
@schema-chief *full-pipeline
→ Informar: site_url, sitemap_url, cms_type
→ Aguardar CP3 (DNA Koray — validação obrigatória se usuário conhece o framework)
→ Aguardar CP6 (aprovação final do blueprint)
→ wf-schema-implementation roda em seguida
```

### Só blueprint (planejamento, sem implementar)

```
@schema-chief *workflow wf-site-semantic-blueprint
→ 6 fases, ~5-8h
→ Output: site-semantic-blueprint.md + 7 deliverables conexos
```

### Só gerar um template JSON-LD

```
@schema-architect *template article
→ Informar: domain, tem_autor=true
→ Receber template pronto para uso
```

### Output em outro formato/stack

```
@multiformat-engineer *output {stack}
→ stack ∈ {html, astro, nextjs, react, vue, svelte, shopify, wordpress, webflow, markdown}
→ Receber código pronto para injeção
```

### Mapear uma entidade específica

```
@entity-disambiguator *find-qid "Python"
→ Informar: contexto = "linguagem de programação"
→ Receber: Q28865, wikidata.org/wiki/Q28865, pt.wikipedia.org/wiki/Python
```

### Mapa de oportunidades de rich snippets

```
@rich-snippets-master *opportunity-map {site_url}
→ Receber matriz: rich-result × elegibilidade atual × esforço × impacto SERP
```

### Validar schema de uma URL

```
@tech-seo-engineer *validate-url https://site.com/artigo
→ Receber: score + erros + recomendações
```

---

## Cobertura de Rich Results (30+)

| Categoria | Tipos cobertos |
|-----------|---------------|
| **Content** | Article, NewsArticle, BlogPosting, FAQPage, HowTo, QAPage, Speakable, ClaimReview |
| **Product** | Product, Offer, AggregateRating, Review, ItemList, ShippingDetails, ReturnPolicy |
| **Business** | LocalBusiness, Organization, Service, Event, JobPosting |
| **Media** | VideoObject, ImageObject, PodcastSeries, PodcastEpisode, AudioObject |
| **Education** | Course, CourseInstance, LearningVideo |
| **Food** | Recipe |
| **Tech** | SoftwareApplication, Dataset |
| **Foundation** | WebSite, WebPage, BreadcrumbList, Person |
| **Specialized** | LodgingBusiness, Paywalled |

---

## Formatos e Stacks de Output

- **Markup:** JSON-LD (default) · Microdata · RDFa
- **Stacks:** HTML · Markdown · Astro · React · Next.js · Vue · SvelteKit · Shopify · WordPress · Webflow

Decisão de formato/stack é feita pelo `@multiformat-engineer` na fase 5 do blueprint.

---

## Outputs Entregues

1. **Site Semantic Blueprint** (`site-semantic-blueprint.md`) — documento mestre macro→micro
2. **Central Entity** — entidade central + Q-ID + confidence score
3. **Master Entity Table** (CSV) — entidade → Wikidata → Wikipedia → hub interno
4. **Cluster Map** — clusters semânticos + hubs + spokes
5. **Rich Snippets Opportunity Matrix** — 30+ rich results × eligibilidade × ROI
6. **URL Scores** — top 10 URLs com score 0-100 + top gaps
7. **Implementation Plan** — P1/P2/P3 com agente, comando, tempo, impacto
8. **Templates prontos** — JSON-LD por tipo de página + variantes por stack
9. **Entity hubs** — especificações completas (URL, @id, sameAs, bidirectional plan)
10. **Content Schema Brief Template** — schema-first brief reutilizável para novos conteúdos
11. **Validation Dashboard** — Rich Results Test + GSC + CWV monitoring

---

## Integração com `seo-ai-god`

`@semantic-content-architect` atua como **bridge agent** para o squad `seo-ai-god`:

- Protocolo: `seoaigod-bridge report`
- Direção: schema-entity entrega Central Entity + cluster map + entity hubs → seo-ai-god usa como base semântica para produção de conteúdo

---

## Princípios do Squad

- Schema reflete o conteúdo real — nunca aspiração ou marketing
- Decisões baseadas em dados (GSC, A/B test, logs), não opinião
- Diagnóstico semântico (Koray) antes de qualquer implementação
- Zero schema sem validação — Rich Results Test é obrigatório
- Bidirectional linking é sistemático, não opcional
- Versionamento da master entity table sempre
- Macro precede micro — arquitetura antes de URL individual
- CWV é gate: schema que degrada Core Web Vitals é bloqueador

---

## Quality Gates

| Tipo | Mínimo de linhas | Score mínimo |
|------|------------------|--------------|
| Agent | 300 | — |
| Workflow | 400 | — |
| Task | 200 | — |
| Squad overall | — | 7.0 |

---

## Estrutura de Arquivos

```
squads/schema-entity/
├── config.yaml                              # v2.0.0
├── README.md                                # (este arquivo)
├── agents/
│   ├── schema-chief.md                      # Orchestrator
│   ├── koray-semantic.md                    # Tier 0 — ativar primeiro
│   ├── schema-architect.md                  # Jarno van Driel DNA
│   ├── entity-disambiguator.md              # Jason Barnard DNA
│   ├── tech-seo-engineer.md                 # Patrick Stox DNA
│   ├── kg-engineer.md                       # Andrea Volpini DNA
│   ├── rich-snippets-master.md              # v2.0
│   ├── semantic-content-architect.md        # v2.0 (bridge → seo-ai-god)
│   └── multiformat-engineer.md              # v2.0
├── workflows/
│   ├── wf-site-semantic-blueprint.yaml      # entry workflow (6 fases)
│   ├── wf-schema-audit.yaml
│   ├── wf-entity-disambiguation.yaml
│   ├── wf-schema-implementation.yaml
│   └── wf-validation-pipeline.yaml
├── tasks/
│   ├── audit-schema-inventory.md
│   ├── score-page-schema.md
│   ├── map-entity-wikidata.md
│   ├── enrich-entities-api.md
│   ├── build-entity-hub.md
│   ├── setup-bidirectional-links.md
│   ├── generate-jsonld-template.md
│   ├── generate-microdata.md                # v2.0
│   ├── inject-schema-cms.md
│   ├── validate-rich-results.md
│   ├── map-rich-snippets-opportunities.md   # v2.0
│   ├── semantic-content-brief.md            # v2.0
│   └── macro-site-semantic-audit.md         # v2.0
├── data/
│   └── schema-entity-kb.md                  # v2.0
└── docs/
    └── (gerado durante execução dos workflows)
```

---

## Status

| Campo | Valor |
|-------|-------|
| Versão | **2.0.0** |
| Última atualização | 2026-05-14 |
| Tested end-to-end | `false` — squad v2.0 ainda não validado em campo |
| Quality gates compliance | 100% (commit 481e59a) |

---

## Ativar o Squad

```
@schema-chief
```

---

*schema-entity squad v2.0.0 | Última sync: 2026-05-15 | AIOX Squad Creator + Orion*
