# Task: Build Entity Hub

```yaml
id: build-entity-hub
agent: entity-disambiguator
version: "2.0"
elicit: true
estimated_duration: "30-60 min por hub"
inputs:
  required:
    - entity_name: "Nome oficial da entidade"
    - entity_qid: "Q-ID Wikidata verificado (ou NOT_FOUND documentado)"
    - site_domain: "URL base do site"
  optional:
    - entity_wikipedia_url: "URL canônica Wikipedia PT (ou EN)"
    - entity_type: "Organization|Person|Place|Product|Topic — default inferido"
    - related_pages: "Lista de URLs dos spokes que mencionam esta entidade"
    - cms_type: "wordpress|nextjs|astro|shopify|html"
    - hub_url_override: "URL do hub se diferente do padrão"
outputs:
  - entity_hub_spec.md
  - entity_hub_schema.json
  - bidirectional_links_list.csv
  - content_brief.md
```

## Objetivo

Criar a especificação completa de uma página de entity hub interno para uma entidade específica, incluindo: URL e @id definitivos, conteúdo mínimo (schema-first), schema JSON-LD completo, e protocolo de bidirectional linking com os spokes identificados.

---

## Elicitation

1. **Entidade:** Nome completo e tipo (Person/Organization/Place/Product/Topic)
2. **Q-ID Wikidata:** Já verificado? (obrigatório antes de criar hub)
3. **URL interna desejada:** Padrão ou customizada?
4. **CMS:** Como será criada a página (afeta o output de schema)?
5. **Spokes:** Quantas páginas mencionam esta entidade? (lista ou número estimado)
6. **Conteúdo:** O hub é novo ou já existe uma página que pode ser expandida?

---

## Step 1: Definir URL e @id

### Padrões por tipo de entidade:

```
Person (autor/especialista):    {domain}/autores/{slug}/
Person (hub genérico):          {domain}/pessoas/{slug}/
Organization (empresa/marca):   {domain}/empresas/{slug}/
Organization (parceiro):        {domain}/parceiros/{slug}/
Topic/Concept:                  {domain}/topicos/{slug}/
Place:                          {domain}/localidades/{slug}/
Product (proprietário):         {domain}/produtos/{slug}/
Event (hub de eventos):         {domain}/eventos/{slug}/
```

### @id pattern:
```
@id = {hub_url}#{tipo_lowercase}
Exemplos:
  https://site.com/autores/joao-silva/#person
  https://site.com/topicos/python/#topic
  https://site.com/empresas/majuli-joias/#organization
```

### Geração do slug:
```python
import unicodedata, re

def slugify(text):
    """Gera slug SEO-friendly."""
    text = text.lower()
    text = unicodedata.normalize('NFKD', text)
    text = text.encode('ascii', 'ignore').decode('ascii')
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    text = re.sub(r'^-+|-+$', '', text)
    return text

# Exemplo:
slugify("João Silva")  # → "joao-silva"
slugify("São Paulo")   # → "sao-paulo"
```

---

## Step 2: Schema JSON-LD — Por Tipo

### Hub de PERSON (autor/especialista):

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "{hub_url}#webpage",
      "url": "{hub_url}",
      "name": "{SEO_TITLE — ex: João Silva — Especialista em SEO}",
      "description": "{META_DESCRIPTION}",
      "isPartOf": { "@id": "{domain}/#website" },
      "about": { "@id": "{hub_url}#person" },
      "breadcrumb": { "@id": "{hub_url}#breadcrumb" },
      "inLanguage": "pt-BR"
    },
    {
      "@type": "Person",
      "@id": "{hub_url}#person",
      "name": "{Nome Oficial Completo}",
      "url": "{hub_url}",
      "description": "{Bio objetiva — 150-200 chars}",
      "image": {
        "@type": "ImageObject",
        "url": "{foto_url}",
        "width": 400,
        "height": 400
      },
      "jobTitle": "{cargo_ou_especialidade}",
      "worksFor": { "@id": "{domain}/#organization" },
      "sameAs": [
        "https://www.wikidata.org/wiki/{Q-ID}",
        "{wikipedia_url}",
        "https://www.linkedin.com/in/{linkedin_slug}"
      ],
      "knowsAbout": ["{especialidade_1}", "{especialidade_2}"],
      "hasCredential": [
        { "@type": "EducationalOccupationalCredential", "name": "{certificação}" }
      ],
      "mainEntityOfPage": { "@id": "{hub_url}#webpage" }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "{hub_url}#breadcrumb",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "{domain}/" },
        { "@type": "ListItem", "position": 2, "name": "Autores", "item": "{domain}/autores/" },
        { "@type": "ListItem", "position": 3, "name": "{Nome}", "item": "{hub_url}" }
      ]
    }
  ]
}
```

### Hub de ORGANIZATION (empresa/marca):

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "{hub_url}#webpage",
      "url": "{hub_url}",
      "name": "{Nome da Empresa — O que faz}",
      "isPartOf": { "@id": "{domain}/#website" },
      "about": { "@id": "{hub_url}#organization" }
    },
    {
      "@type": "Organization",
      "@id": "{hub_url}#organization",
      "name": "{Nome Oficial}",
      "url": "{org_website}",
      "description": "{Descrição objetiva}",
      "logo": {
        "@type": "ImageObject",
        "url": "{logo_url}",
        "width": 512,
        "height": 512
      },
      "sameAs": [
        "https://www.wikidata.org/wiki/{Q-ID}",
        "{wikipedia_url}",
        "https://www.linkedin.com/company/{slug}"
      ],
      "foundingDate": "{YYYY}",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "{Cidade}",
        "addressRegion": "{Estado}",
        "addressCountry": "BR"
      },
      "mainEntityOfPage": { "@id": "{hub_url}#webpage" }
    }
  ]
}
```

### Hub de TOPIC (conceito/tópico):

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["WebPage", "CollectionPage"],
      "@id": "{hub_url}#webpage",
      "url": "{hub_url}",
      "name": "{Tópico} — Guia Completo",
      "isPartOf": { "@id": "{domain}/#website" },
      "about": {
        "@type": "Thing",
        "@id": "{hub_url}#entity",
        "name": "{Tópico}",
        "sameAs": [
          "https://www.wikidata.org/wiki/{Q-ID}",
          "{wikipedia_url}"
        ]
      },
      "hasPart": [
        { "@id": "{spoke_url_1}#article" },
        { "@id": "{spoke_url_2}#article" }
      ]
    }
  ]
}
```

---

## Step 3: Conteúdo Schema-First

O conteúdo é DERIVADO do schema — não o contrário.

### Content Brief para o Hub:

```markdown
# Hub Brief: {entity_name}

## Schema definido ANTES de escrever:
- @type: {tipo}
- name: {nome oficial}
- description (max 200 chars): {escrever isso primeiro}
- knowsAbout / description: base para parágrafo 1

## Estrutura obrigatória:

### H1: {name do schema — exatamente}
Deve ser idêntico ao `name` no schema.

### Parágrafo 1 (AEO-ready — 2-3 frases):
- Responde: "O que é {entity_name}?"
- Direto, verificável, sem jargão
- Base: usar `description` do Wikidata como referência

### Parágrafo 2 (Contexto do site — 1-2 frases):
- Por que {entity_name} importa para {nicho do site}?
- Conecta a entidade ao propósito do site

### Parágrafo 3 (Relações — opcional):
- Menciona 2-3 outras entidades relacionadas (com links para os hubs delas se existirem)

### H2: Artigos sobre {entity_name}
- Lista de TODOS os spokes identificados
- Anchor text = título real de cada spoke
- Ordenados: mais relevante/recente primeiro

## O que NÃO escrever:
❌ Textos de SEO puro ("Clique aqui para saber mais sobre...")
❌ Definições circulares ("{X} é X")
❌ Informações não verificadas/inventadas
❌ Listas de keywords forçadas

## Comprimento alvo:
- Conteúdo editorial: 300-500 palavras
- Seção de artigos: sem limite (listar todos)
```

---

## Step 4: Bidirectional Links — Plan

### Hub → Spokes:
Schema: hasPart array com @ids dos spokes  
Editorial: Seção "Artigos sobre {nome}" com todos os spokes linkados

### Spokes → Hub:

```csv
spoke_url,first_mention_paragraph,anchor_text,schema_update_needed,priority
https://site.com/artigo-1,"parágrafo 3","Python","add about: @id hub","P1"
https://site.com/artigo-2,"introdução","Python","add about: @id hub","P1"
https://site.com/guia-python,"título H1","Python","add about: @id hub","P2"
```

---

## Step 5: Gerar Spec Completo

```markdown
# Entity Hub Spec — {entity_name}
**URL:** {hub_url}
**@id:** {hub_url}#{tipo_lowercase}
**@type:** {schema_type}
**Q-ID:** {wikidata_qid}
**Status:** draft

## Schema JSON-LD
```json
{schema completo gerado no Step 2}
```

## Conteúdo
{conteúdo gerado no Step 3}

## Bidirectional Links Plan
### Hub → Spokes
{seção HTML sugerida}

### Spokes → Hub
{CSV do Step 4}

## Checklist de Implementação
- [ ] Página criada no CMS com URL correta
- [ ] Schema JSON-LD inserido no <head>
- [ ] Conteúdo editorial publicado
- [ ] Seção de artigos publicada com links funcionais
- [ ] Spokes atualizados (editorial + schema)
- [ ] Rich Results Test: ELIGIBLE
- [ ] URL adicionada ao sitemap
- [ ] URL submetida para indexação no GSC
```

---

## Quality Gates

- [ ] URL segue padrão do `id_pattern_guide.md`
- [ ] @id é único — não duplica outro hub do site
- [ ] Q-ID Wikidata verificado (não assumido) — ou NOT_FOUND documentado com razão
- [ ] sameAs com URLs canônicas (não redirects)
- [ ] Schema JSON-LD válido sintaticamente (parseable)
- [ ] Conteúdo mínimo especificado (não genérico — específico para a entidade)
- [ ] Lista de spokes identificados (mínimo 3 para justificar o hub)
- [ ] Bidirectional links mapeados: hub → spokes E spokes → hub
- [ ] `entity_hub_spec.md` gerado com todos os campos
- [ ] `entity_hub_schema.json` válido e com todos os @ids

## Integração

- **Recebe de:** wf-entity-disambiguation (fase 3C), wf-schema-implementation (fase 4B)
- **Entrega para:** `setup-bidirectional-links.md` (fase de linking), `inject-schema-cms.md`
- **Depende de:** `map-entity-wikidata.md` (Q-ID deve estar verificado antes)
- **Relacionado:** `score-page-schema.md` (para validar o hub após criação)
