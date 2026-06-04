# Task: Map Rich Snippets Opportunities

```yaml
id: map-rich-snippets-opportunities
agent: rich-snippets-master
version: "2.0"
elicit: false
estimated_duration: "20-40 min por site"
inputs:
  required:
    - target: "URL do site ou URL específica"
  optional:
    - sitemap_url: "Para análise do site completo"
    - cms_type: "Para sugestão de implementação"
    - current_schema: "Schema JSON-LD atual se disponível"
    - gsc_data: "Export do Google Search Console (identifica páginas que já têm rich results)"
outputs:
  - rich-snippets-opportunity-map.md
  - snippets-priority-matrix.csv
  - quick-wins-list.md
```

## Objetivo

Mapear TODAS as oportunidades de rich snippets aplicáveis a um site ou URL, priorizando por impacto no SERP e facilidade de implementação, com geração de roadmap de ações concretas para @schema-architect executar.

---

## Step 1: Classificar tipo de site e de página

Identificar a partir da URL, conteúdo e contexto:

```
TIPOS DE SITE:
  blog_content    → Article, FAQPage, HowTo, Speakable, Person, Organization
  ecommerce       → Product, Review, AggregateRating, BreadcrumbList, ItemList, Organization
  local_business  → LocalBusiness, Review, FAQ, Event, OpeningHours
  saas_tech       → SoftwareApplication, FAQ, HowTo, Video, Organization
  news_media      → NewsArticle, Speakable, Paywalled, Organization
  education       → Course, FAQ, HowTo, Video, Organization
  food_recipe     → Recipe, HowTo, Review, Article
  jobs_career     → JobPosting, FAQ, Organization
  events          → Event, FAQ, Organization, ItemList

TIPOS DE PÁGINA (para análise URL por URL):
  homepage        → WebSite (SearchAction), Organization, BreadcrumbList
  article/post    → Article/BlogPosting, FAQPage, HowTo, Speakable
  product         → Product, Offer, AggregateRating, BreadcrumbList
  category        → ItemList, BreadcrumbList, CollectionPage
  author          → Person (sameAs, knowsAbout, worksFor, hasCredential)
  about/contact   → Organization, LocalBusiness, ContactPage
  faq             → FAQPage
  how-to          → HowTo
  landing         → Organization + tipo específico do produto/serviço
  recipe          → Recipe, HowTo
```

---

## Step 2: Matriz de Oportunidade por Tipo

Para cada tipo identificado, avaliar impacto e esforço:

```
IMPACTO NO SERP — Alto (máxima prioridade):
  Product        → preço, rating, disponibilidade, imagem na SERP
  Recipe         → imagem, tempo de preparo, calorias, rating
  Event          → data, horário, local, preço — carrossel de eventos
  FAQPage        → accordion expandível (+150px SERP, AEO)
  JobPosting     → vaga destacada com salário e local
  Review         → stars visíveis (via AggregateRating)

IMPACTO NO SERP — Médio:
  Article        → imagem grande no mobile, byline com autor
  HowTo          → steps numerados visuais na SERP
  Course         → preço, duração, provider
  Video          → thumbnail, duração, data — carrossel de vídeos
  SoftwareApp    → rating, preço, plataforma

IMPACTO NO SERP — Base (fundamental):
  WebSite        → SearchAction (sitelinks search box)
  Organization   → Logo no Knowledge Panel, painel lateral
  BreadcrumbList → breadcrumb na URL no SERP

IMPACTO AEO (Answer Engine Optimization):
  Speakable      → AI Overviews, Google Assistant
  FAQPage        → AI Overviews (perguntas diretas)
  HowTo          → AI Overviews (passos)
  Article        → Featured Snippets (intro como definição)
```

---

## Step 3: Verificar Dados Disponíveis no Conteúdo

Para cada oportunidade identificada, verificar se o conteúdo atual suporta o schema:

```
FAQPage check:
  □ Há perguntas com H3 (ou H2) seguido de resposta? (min 2 pares)
  □ Respostas têm min 50 caracteres de texto?
  □ Perguntas são distintas (não repetições)?
  RESULTADO: ready | needs_content_edit | not_applicable

HowTo check:
  □ Há steps numerados com título separado? (min 3 steps)
  □ Cada step tem instrução textual clara?
  □ Há título geral da tarefa ("Como fazer X")?
  RESULTADO: ready | needs_content_edit | not_applicable

Product check:
  □ Há preço visível, atualizado e em BRL?
  □ Há indicação de disponibilidade (em estoque/esgotado)?
  □ Há imagem do produto mínimo 300px×300px?
  □ Há nome do produto como H1?
  RESULTADO: ready | missing_price | missing_image | not_applicable

Recipe check:
  □ Há tempo de preparo E tempo de cozimento indicados?
  □ Há lista de ingredientes com quantidades?
  □ Há passos de instrução separados?
  □ Há imagem do prato finalizado?
  □ Há rendimento (porções)?
  RESULTADO: ready | needs_fields | not_applicable

Article check:
  □ Há headline clara como H1 (≤110 chars)?
  □ Há imagem destacada (min 1200×630px recomendado)?
  □ Há autor identificável com nome?
  □ Há data de publicação visível?
  RESULTADO: ready | needs_author | needs_image | ready_basic

LocalBusiness check:
  □ Há endereço completo (rua, número, cidade, estado, CEP)?
  □ Há telefone com DDI?
  □ Há horário de funcionamento?
  □ Há Google Business Profile?
  RESULTADO: ready | needs_address | partial
```

---

## Step 4: Gerar Output Estruturado

```yaml
rich_snippets_opportunity_report:
  target: "{url ou domain}"
  site_type: "{identificado}"
  date: "{ISO8601}"
  cms_detected: "{wordpress|next.js|astro|shopify|html}"
  
  sitewide_base:
    website_schema:
      status: "implemented|missing"
      search_action: "implemented|missing"
      priority: "P1"
    organization_schema:
      status: "implemented|missing"
      logo: "implemented|missing"
      sameas_wikidata: "implemented|missing"
      priority: "P1"
    breadcrumb:
      status: "implemented|missing|partial"
      priority: "P2"
  
  opportunities:
    high_impact:
      - type: "FAQPage"
        applicable_pages: N
        content_ready: "yes|no|partial"
        effort_hours: 2
        serp_impact: "accordion no SERP + AEO — ocupa +150px vertical"
        action: "@schema-architect *template faqpage"
        
      - type: "Product"
        applicable_pages: N
        content_ready: "yes|no|partial"
        effort_hours: 4
        serp_impact: "preco + rating + disponibilidade visíveis na SERP"
        missing_data: ["AggregateRating (sem reviews)", "ShippingDetails"]
        action: "@schema-architect *template product"
    
    medium_impact:
      - type: "HowTo"
        applicable_pages: N
        content_ready: "yes|no|partial"
        effort_hours: 1
        serp_impact: "steps visuais na SERP — destaque visual"
        action: "@schema-architect *template howto"
      
      - type: "Article"
        applicable_pages: N
        content_ready: "yes"
        effort_hours: 3
        serp_impact: "imagem grande no mobile + byline de autor"
        action: "@schema-architect *template article"
    
    aeo_opportunities:
      - type: "Speakable"
        applicable_pages: N
        content_ready: "yes"
        effort_hours: 1
        serp_impact: "AI Overviews — citabilidade por modelos de linguagem"
        action: "@schema-architect *template speakable"
      
      - type: "FAQPage (AEO)"
        applicable_pages: N
        serp_impact: "Google AI Overviews — perguntas respondidas diretamente"
    
    not_applicable:
      - type: "Recipe"
        reason: "Site nao tem conteudo de receitas"
      - type: "JobPosting"
        reason: "Site nao tem pagina de vagas abertas"
      - type: "Event"
        reason: "Site nao promove eventos"
  
  quick_wins:
    - "FAQPage em /faq/ — conteudo pronto, 2h trabalho, ganho imediato de SERP real estate"
    - "Organization com logo e sameAs — 30 min, base para Knowledge Panel"
    - "Speakable nos artigos mais acessados — 1h, ganho AEO imediato"
    - "BreadcrumbList em todas as paginas — 2h, melhora navegação no SERP"
  
  stats:
    total_opportunities: N
    high_impact_ready_now: N
    estimated_total_effort: "{X horas}"
    expected_serp_gain: "Projecao: +N rich results elegíveis, +N% CTR em produto"
  
  next_steps:
    immediate_48h:
      agent: "@schema-architect"
      commands:
        - "*template organization"
        - "*template website-searchaction"
        - "*template breadcrumb"
    week_1:
      agent: "@schema-architect + @rich-snippets-master"
      commands:
        - "*template faqpage {url}"
        - "*template article {url}"
    month_1:
      agent: "@schema-architect + @semantic-content-architect"
      commands:
        - "*cluster-schema {central-entity}"
        - "*template product-complete"
        - "*template speakable batch"
```

---

## Step 5: Snippets Priority Matrix

```csv
snippet_type,impact_level,effort_hours,content_ready,applicable_pages,serp_gain,aeo_gain,priority_score,recommended_action
Organization,base,0.5,yes,1,Knowledge Panel,none,10,Implementar imediatamente
WebSite SearchAction,base,0.5,yes,1,Sitelinks search box,none,9,Implementar imediatamente
BreadcrumbList,base,2,yes,all,Breadcrumb no SERP,none,8,P1 sitewide
FAQPage,high,2,partial,N,Accordion +150px,AI Overviews,9,Quick win — editar conteudo
Article,medium,3,yes,N,Imagem grande mobile,Featured Snippet,7,P2 blog pages
Product,high,4,partial,N,Preco+rating SERP,none,8,P1 ecommerce
Speakable,aeo,1,yes,N,none,AI Overviews citability,7,P2 top articles
HowTo,medium,2,partial,N,Steps visuais SERP,AI Overviews steps,6,P3 tutorial pages
```

---

## Output Entregue

1. `rich-snippets-opportunity-map.md` — relatório completo com análise por tipo e por página
2. `snippets-priority-matrix.csv` — matriz priorizada por impacto vs esforço
3. `quick-wins-list.md` — lista das 3-5 ações de maior ROI para executar esta semana

---

## Quality Gates

- [ ] Todos os 30+ tipos de rich results do Google avaliados (aplicável/não aplicável/oportunidade)
- [ ] Dados disponíveis no conteúdo verificados para cada oportunidade (não assumidos)
- [ ] Quick wins identificados — ações < 2h que geram rich results imediatos
- [ ] Prioridade definida para cada tipo (P1/P2/P3/backlog)
- [ ] Próximos comandos para @schema-architect listados e prontos para copiar
- [ ] Estimativa de esforço total realista (em horas)
- [ ] `snippets-priority-matrix.csv` gerado com score por linha

## Integração

- **Recebe de:** wf-site-semantic-blueprint (fase macro), wf-schema-audit (inventário atual)
- **Entrega para:** @schema-architect (lista de templates a criar), wf-schema-implementation (prioridades)
- **Relacionado:** `audit-schema-inventory.md` (gap analysis atual), `generate-jsonld-template.md` (geração dos templates)
- **Dispara:** `generate-jsonld-template.md` para cada tipo high_impact identificado
