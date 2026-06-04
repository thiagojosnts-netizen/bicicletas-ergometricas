# Schema Entity Knowledge Base — v2.0

## Sobre Este Squad

O schema-entity squad é especializado em **schema semântico avançado** com cobertura de 30+ rich results, 3 formatos de markup (JSON-LD, Microdata, RDFa) e 10 stacks (HTML, Astro, Next.js, React, Vue, Svelte, Shopify, WordPress, Webflow, Markdown), com desambiguação de entidades via Wikidata, Wikipedia e knowledge graph proprietário. É um squad **executivo** — não apenas analítico. Tem autoridade para escrever código, criar páginas, e implementar mudanças.

Visão **macro × micro**: arquitetura do site inteira (clusters, hubs, central entity) + cada URL, cada entidade, cada propriedade.

---

## DNA do Squad (4 personas-referência)

| DNA | Persona referencial | Aplicação no squad |
|-----|---------------------|--------------------|
| **Koray Tuğberk GÜBÜR** | Holistic SEO | Topical Authority, Central Entity, A/B hypothesis (agente `@koray-semantic`) |
| **Jarno van Driel** | Schema architecture | @graph patterns, connected schema, @id strategy (agente `@schema-architect`) |
| **Jason Barnard** | Brand SERP / entity | Wikidata Q-IDs, sameAs, Knowledge Panel, entity hubs (agente `@entity-disambiguator`) |
| **Patrick Stox** | Technical SEO | Validação, Rich Results Test, GSC monitoring, CWV (agente `@tech-seo-engineer`) |
| **Andrea Volpini** | Knowledge graph | SPARQL, Python automation, CMS injection, KG engineering (agente `@kg-engineer`) |

---

## Conceitos Fundamentais

### 1. Topical Authority (Koray Framework)

```
Topical Authority = Topical Coverage + Historical Data
```

- **Topical Coverage**: cobertura completa de um domínio semântico
- **Historical Data**: histórico de interação do Google com o site (crawl frequency, indexation date, freshness signals)
- Autoridade não é link equity — é reconhecimento algorítmico de completude

**Relação com schema:**
Schema que reflete Topical Coverage (via `about`, `mentions`, `isPartOf`) comunica ao Google que o site é a fonte mais completa para aquelas entidades.

### 2. Schema.org Vocabulary

Schema.org é uma ontologia — define tipos e relações entre entidades. Hierarquia:
```
Thing → Organization → LocalBusiness → MedicalBusiness
Thing → CreativeWork → Article → NewsArticle
Thing → Person
Thing → Place → LocalBusiness (dual)
Thing → Product
Thing → Event
```

**Regra de ouro:** sempre use o tipo MAIS ESPECÍFICO que se aplica, sem inventar sub-tipos.

### 3. JSON-LD @graph Pattern

Para páginas com múltiplas entidades, usar @graph:
```json
{ "@context": "https://schema.org", "@graph": [...] }
```

Isso permite que cada entidade do grafo seja uma URI referenciável internamente.

### 4. @id vs sameAs

| Propriedade | Significa | Quando usar |
|------------|-----------|-------------|
| `@id` | "Este é o identificador canônico desta entidade NO MEU SITE" | Sempre que a entidade será referenciada em outro schema |
| `sameAs` | "Esta entidade É A MESMA que esta entidade EXTERNA" | Wikidata, Wikipedia, LinkedIn, etc. |

### 5. Wikidata Q-IDs

Toda entidade no Wikidata tem um Q-ID único. Verificar sempre:
- `P31 (instance of)`: o que a entidade É
- `P279 (subclass of)`: hierarquia da entidade
- URL: `https://www.wikidata.org/wiki/Q{número}`

### 6. Entity Hub Pattern

Entity hub = página interna que "ancora" uma entidade no site:
```
URL: /entidades/{slug}/
@id: {domain}/entidades/{slug}/#entity
sameAs: [Wikidata, Wikipedia]
```

Benefícios:
- Resolve ambiguidade (o hub define o contexto)
- Cria internal PageRank para a entidade
- Permite bidirectional linking sistemático

---

## Padrões de Schema por Tipo de Site

### Site de Blog/Conteúdo

Tipos necessários:
1. `WebSite` (homepage)
2. `Organization` (sobre/home)
3. `Person` (autor — author page)
4. `Article` ou `BlogPosting` (cada post)
5. `BreadcrumbList` (todas as páginas)
6. `FAQPage` (páginas de FAQ)

Prioridade de implementação:
1. Organization + Person (foundation)
2. Article com autor conectado
3. BreadcrumbList
4. FAQPage onde aplicável

### E-commerce

Tipos necessários:
1. `Organization` + `WebSite`
2. `Product` + `Offer` (por produto)
3. `BreadcrumbList`
4. `ItemList` (páginas de categoria)
5. `LocalBusiness` (se tem loja física)
6. `AggregateRating` (se tem reviews)

### Site Local/Serviços

Tipos necessários:
1. `LocalBusiness` (subtipo específico: Restaurant, Dentist, etc.)
2. `PostalAddress` + GeoCoordinates
3. `OpeningHoursSpecification`
4. `FAQPage`
5. `Service`

---

## Checklists de Validação Rápida

### Pre-Deploy (5 pontos críticos)

```
□ JSON-LD é JSON válido (copiar e colar no jsonlint.com)
□ @type existe em schema.org (buscar em schema.org/{Tipo})
□ Propriedades obrigatórias presentes (Rich Results Test)
□ @id presente em entidades que serão referenciadas
□ sameAs com URLs verificadas (não assumidas)
```

### Post-Deploy (5 verificações)

```
□ Rich Results Test PASS na URL em produção
□ "View source" mostra o schema (não só DevTools)
□ GSC > Melhorias não mostra novos erros após 48h
□ Lighthouse CWV não degradou
□ URL de entity hub retorna 200 (não 404)
```

---

## Erros Mais Comuns e Fixes

### Erro: "The property X is not recognized by Google"
- **Causa:** Propriedade não suportada para rich results (mas pode ser válida no schema.org)
- **Fix:** Não é erro — apenas aviso. A propriedade é processada pelo Google mas não gera rich result específico. Manter se for semanticamente relevante.

### Erro: "A value for the 'datePublished' field is required"
- **Causa:** Propriedade obrigatória ausente
- **Fix:** Adicionar `"datePublished": "ISO-8601-date"`

### Erro: "The URL in the 'image' field must be on a supported image host"
- **Causa:** Imagem no CDN externo não confiável
- **Fix:** Hospedar imagens no próprio domínio ou CDN de confiança

### Erro: JSON parse failed
- **Causa:** JSON inválido — vírgula extra, aspas erradas, caractere especial
- **Fix:** Validar em jsonlint.com, identificar linha do erro

### Warning: "Missing field 'author'"
- **Causa:** Author ausente no Article
- **Fix:** Adicionar `"author": {"@type": "Person", "@id": "{author-page-id}"}` — pessoa ou organização

---

## Recursos Externos

| Recurso | URL | Para que serve |
|---------|-----|---------------|
| Schema.org | schema.org | Vocabulário completo + exemplos |
| Rich Results Test | search.google.com/test/rich-results | Testar eligibilidade |
| Schema Validator | validator.schema.org | Validar vocabulário |
| Wikidata | wikidata.org | Buscar Q-IDs |
| Wikidata SPARQL | query.wikidata.org | Queries avançadas |
| JSON-LD Playground | json-ld.org/playground | Testar JSON-LD |
| Google GSC | search.google.com/search-console | Erros em produção |
| Holistic SEO | holisticseo.digital | Framework Koray (Topical Authority) |

---

## Padrões v2.0 Adicionais

### Macro × Micro

- **Macro**: Central Entity do site + clusters semânticos + hubs + Knowledge Panel status
- **Micro**: para cada URL prioritária — schema type, propriedades obrigatórias, sameAs, score 0-100
- Sempre planejar do macro para o micro. Implementar do micro para o macro (foundation primeiro).

### Rich Results Coverage (30+ tipos)

| Categoria | Tipos cobertos |
|-----------|---------------|
| Content | Article, NewsArticle, BlogPosting, FAQPage, HowTo, QAPage, Speakable, ClaimReview |
| Product | Product, Offer, AggregateRating, Review, ItemList, ShippingDetails, ReturnPolicy |
| Business | LocalBusiness, Organization, Service, Event, JobPosting |
| Media | VideoObject, ImageObject, PodcastSeries, PodcastEpisode, AudioObject |
| Education | Course, CourseInstance, LearningVideo |
| Food | Recipe |
| Tech | SoftwareApplication, Dataset |
| Foundation | WebSite, WebPage, BreadcrumbList, Person |
| Specialized | LodgingBusiness, Paywalled |

### Multiformat Decision Tree

```
Tem acesso ao <head>?
├── SIM → JSON-LD (default, recomendado)
└── NÃO →
    ├── Tem acesso ao corpo HTML? → Microdata (atributos itemprop)
    └── Stack é XHTML/legacy? → RDFa (atributos vocab/typeof/property)
```

### Anti-patterns (NEVER)

- ❌ Schema aspiracional — descrever o que o site "quer ser" em vez do que é
- ❌ UUID/random como `@id` — `@id` precisa ser URL referenciável no site
- ❌ `publisher` sem `@id` apontando para Organization unificada
- ❌ `sameAs` para URLs não verificadas
- ❌ Schema deployado sem Rich Results Test
- ❌ Bidirectional linking opcional — sempre sistemático

### Bridge Protocol — `seo-ai-god`

`@semantic-content-architect` faz bridge formal:

- **Output → seo-ai-god**: Central Entity, cluster map, master entity table, content schema brief template
- **Comando**: `seoaigod-bridge report`
- **Direção**: schema-entity define a base semântica; seo-ai-god usa para produzir conteúdo aderente

---

## Histórico de Versões do Squad

| Versão | Data | Mudanças |
|--------|------|---------|
| 1.0.0 | 2026-05-14 | Versão inicial — 6 agentes, 4 workflows, 9 tasks |
| 2.0.0 | 2026-05-14 | +3 agentes (rich-snippets-master, semantic-content-architect, multiformat-engineer); +1 workflow (wf-site-semantic-blueprint como entry); +4 tasks; DNA framework formalizado (4 personas); 30+ rich results; 3 formatos × 10 stacks; bridge `seo-ai-god`; quality gates 100% compliant (commit 481e59a) |

---

*schema-entity-kb.md | schema-entity squad v2.0.0*
