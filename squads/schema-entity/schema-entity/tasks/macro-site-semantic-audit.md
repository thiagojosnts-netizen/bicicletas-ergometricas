# Task: Macro Site Semantic Audit

```yaml
id: macro-site-semantic-audit
agent: semantic-content-architect
version: "2.0"
elicit: false
estimated_duration: "2-4 horas"
```

## Objetivo

Análise completa da arquitetura semântica de um site — da identidade global (Central Entity, Knowledge Panel) até a granularidade de cada cluster. Entrega um mapa semântico completo com gaps e plano de ação.

## Input

```yaml
inputs:
  required:
    - domain: "URL do site"
  optional:
    - sitemap_url: "URL do sitemap"
    - gsc_export: "Export do Google Search Console (CSV)"
    - seoaigod_report: "Relatório do SEO AI God (se disponível)"
```

## Steps

### Step 1: Identity Layer — Central Entity

```
VERIFICAÇÕES:

1.1 Knowledge Panel check
    Buscar no Google: "{nome da marca}"
    □ Knowledge Panel aparece?
    □ Tipo correto? (Organization / Person / LocalBusiness)
    □ Descrição correta? (texto da Wikipedia ou Wikidata?)
    □ Logo correto?
    □ Dados corretos? (fundação, sede, CEO, website)
    □ sameAs links aparecem? (LinkedIn, Twitter, etc.)
    
    Resultado → confidence_score: low|medium|high

1.2 Organization Schema
    curl -s {domain} | grep "ld+json"
    □ Organization schema existe?
    □ @id presente? ({domain}/#organization)
    □ name correto?
    □ logo com width/height?
    □ sameAs com Wikidata Q-ID?
    □ sameAs com LinkedIn, Facebook, etc.?
    
1.3 WebSite Schema
    □ WebSite schema existe?
    □ @id presente? ({domain}/#website)
    □ potentialAction SearchAction implementado?
    □ publisher → Organization @id?

1.4 Wikidata Entity
    □ Existe item Wikidata para a organização?
    □ P31 (instance of) correto?
    □ P856 (official website) aponta para o domínio?
    □ Dados principais preenchidos (P571 fundação, P159 sede)?
```

### Step 2: Cluster Architecture Layer

```
Para cada cluster identificado no sitemap/URL structure:

2.1 Identificação de clusters
    Padrões de URL que indicam clusters:
    /categoria/ → cluster de conteúdo
    /produto/ → cluster de produto
    /servico/ → cluster de serviço
    /guia/ → cluster educacional
    /blog/{tema}/ → sub-cluster temático

2.2 Para cada cluster:
    □ Hub URL existe? (/{cluster}/ ou /tópico/{slug}/)
    □ Hub tem schema próprio? (Article, CollectionPage, ItemList, ou Thing)
    □ Hub tem @id proprietário?
    □ Hub tem sameAs para Wikidata (se entidade mapeável)?
    □ Hub tem hasPart listando spokes?
    □ Spokes têm about → hub?
    □ Spokes têm link editorial para hub (na primeira menção)?
    □ Hub tem link para todos os spokes ("Artigos relacionados")?

2.3 Topical coverage vs schema coverage
    Total de spokes no cluster: N
    Spokes com schema correto: N
    Spokes com Article: N
    Spokes com FAQPage: N
    Spokes sem nenhum schema: N
```

### Step 3: Rich Results Coverage Layer

```
3.1 Inventário de schema por tipo de página
    Amostra: top 30 URLs por tráfego (via GSC) ou por sitemap

    Para cada URL da amostra:
    □ Tipo de página identificado
    □ Schema implementado (tipos)
    □ Propriedades obrigatórias presentes?
    □ Rich Results Test status (se possível)
    □ Score 0-100

3.2 Oportunidades perdidas
    Calcular: quantas páginas de cada tipo NÃO têm o schema correspondente?
    
    Exemplo:
    - 45 artigos sem FAQPage (todos têm FAQ content)
    - 12 tutoriais sem HowTo (todos têm steps)
    - 8 páginas de produto sem AggregateRating
    - Homepage sem WebSite SearchAction

3.3 Sitewide gaps
    □ Organization implementada em todas as páginas?
    □ BreadcrumbList em todas as internas?
    □ Author (Person) em todos os artigos?
    □ datePublished em todos os artigos?
```

### Step 4: Author / E-E-A-T Layer

```
4.1 Author pages
    □ Existe página de autor para cada autor?
    □ Person schema com @id em cada página de autor?
    □ name, url, description, jobTitle presentes?
    □ knowsAbout com especialidades?
    □ sameAs com LinkedIn e/ou Wikidata?
    □ Artigos linkam para a página do autor?
    □ Autor linkado via Author byline no Article schema?

4.2 E-E-A-T signals no schema
    □ hasCredential em Person (certificações)?
    □ alumniOf em Person (formação)?
    □ worksFor em Person → Organization?
    □ Organization com address + telephone (para LocalBusiness)?
    □ Organization com foundingDate?
```

### Step 5: AEO / AI Overviews Layer

```
5.1 Speakable coverage
    □ Speakable schema implementado em artigos?
    □ cssSelector correto (aponta para elementos reais)?
    □ Parágrafos de resposta direta existem no conteúdo?

5.2 FAQPage para AI Overviews
    □ FAQPage em todas as páginas com FAQ content?
    □ Perguntas são question intents (começam com "como", "o que", "por que")?
    □ Respostas são concisas e verificáveis?

5.3 Structured definitions
    □ Artigos que definem conceitos têm definição no primeiro parágrafo?
    □ Central Entity definida no about?
```

## Output: Site Semantic Audit Report

```markdown
# Site Semantic Audit — {domain}
**Data:** {ISO8601}
**Analisado por:** @semantic-content-architect + @tech-seo-engineer

---

## 1. Identity Score: {X}/25

### Central Entity
- **Identificada:** {nome} | Q-ID: {Q-número|"não encontrado"}
- **Knowledge Panel:** {existe|ausente|incorreto}
- **Confidence Score:** {low|medium|high}
- **Organization Schema:** {completo|parcial|ausente}
- **WebSite Schema:** {implementado|ausente}

**Gap principal:** {descrição do maior gap de identidade}

---

## 2. Cluster Architecture Score: {X}/25

| Cluster | Hub existe? | Hub schema? | Bidirectional? | Spokes sem schema |
|---------|------------|-------------|---------------|-------------------|
| {cluster 1} | ✅/❌ | ✅/❌ | ✅/❌ | N/Total |
| {cluster 2} | ✅/❌ | ✅/❌ | ✅/❌ | N/Total |

**Gap principal:** {descrição}

---

## 3. Rich Results Score: {X}/25

| Tipo | Páginas elegíveis | Implementado | % cobertura |
|------|------------------|--------------|-------------|
| Article | N | N | % |
| FAQPage | N | N | % |
| HowTo | N | N | % |
| Product | N | N | % |
| BreadcrumbList | N | N | % |

**Maior oportunidade perdida:** FAQPage em {N} artigos ({X horas} para implementar)

---

## 4. Author / E-E-A-T Score: {X}/15

- Páginas de autor: {existe|ausente}
- Author schema completo: {N}/{total_autores}
- sameAs de autores: {N}/{total_autores}

---

## 5. AEO Score: {X}/10

- Speakable: {implementado|ausente}
- FAQPage para AI: {N páginas}
- Definições estruturadas: {N páginas}

---

## SCORE TOTAL: {X}/100

## Plano de Ação Priorizado

### P1 — Esta semana ({X horas})
1. {ação específica} → impacto: {alto/médio} → agente: @{agente} *{comando}
2. {ação específica}

### P2 — Este mês ({X horas})
1. {ação específica}

### P3 — Este trimestre
1. {ação específica}

## Quick Wins (≤2 horas cada)
- {quick win 1}
- {quick win 2}
- {quick win 3}
```

## Output Entregue

1. `macro-semantic-audit-{domain}-{date}.md`
2. `schema-coverage-inventory.csv`
3. `entity-architecture-gaps.md`
4. `implementation-priority-plan.md`
