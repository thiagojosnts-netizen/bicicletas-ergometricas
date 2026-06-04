# Task: Semantic Content Brief

```yaml
id: semantic-content-brief
agent: semantic-content-architect
version: "2.0"
elicit: true
estimated_duration: "20-40 min por brief"
inputs:
  required:
    - topic: "Tópico do conteúdo a ser produzido"
    - page_type: "article|howto|faqpage|recipe|product|landing"
  optional:
    - entity_hub_url: "URL do entity hub do cluster (linkagem bidirecional)"
    - cms_type: "wordpress|nextjs|astro|shopify|html"
    - keyword_data: "Dados de keyword (volume, intent, cluster)"
    - seo_ai_god_report: "Relatório do squad seo-ai-god se disponível"
    - entity_table: "master_entity_table.csv para puxar Q-IDs e @ids"
outputs:
  - brief-{slug}.md
  - schema-preview-{slug}.json
  - entity-checklist-{slug}.md
```

## Objetivo

Gerar um brief de conteúdo completo onde a estratégia de schema está embutida desde o primeiro momento — schema-first content. O redator recebe um documento que define: o que escrever, como estruturar, quais entidades mencionar, e qual schema será gerado automaticamente a partir daquele conteúdo.

---

## Elicitation

Antes de gerar o brief, coletar:

1. **Tópico:** Qual é o assunto exato? (ex: "como limpar joias de prata em casa")
2. **URL hub do cluster:** Existe entity hub para a Central Entity deste conteúdo?
3. **Tipo de página:** Artigo, tutorial (HowTo), FAQ, receita, produto?
4. **CMS:** Como será publicado? (afeta guia de implementação do schema)
5. **Dados de keyword:** Volume, intent, cluster de tópico disponíveis?
6. **Relatório do SEO AI God:** Tem análise de tópicos disponível para esse cluster?

---

## Step 1: Identificar Central Entity e tipo de schema

A partir do tópico:

```
1. Identificar a Central Entity — o QUÊ este conteúdo trata
   Exemplo tópico "como limpar joias de prata":
     Central Entity = "Prata" (material) ou "limpeza de joias" (processo)
     → Verificar: existe entity hub no site para esta entidade?

2. Determinar @type principal:
   "Como fazer" → HowTo
   "O que é" + FAQ → Article + FAQPage
   "Passo a passo detalhado" → HowTo
   "Notícia/novidade" → NewsArticle
   "Receita" → Recipe
   "Produto específico" → Product

3. Determinar tipos secundários:
   Tem FAQ na estrutura? → FAQPage
   Tem intro como resposta direta? → Speakable
   Tem steps numerados? → HowTo

4. Verificar Q-ID Wikidata para a Central Entity
   Consultar entity_table ou @entity-disambiguator

5. Verificar @id do entity hub no site (se existe)
```

---

## Step 2: Estrutura de Conteúdo Driven by Schema

O princípio schema-first: o schema define a estrutura, não o contrário.

```
ARTICLE + FAQPAGE:
  H1 → schema: headline (≤110 chars) — EXATAMENTE igual
  Intro (2-3 frases) → schema: description (max 200 chars) + Speakable candidate
  H2 seções → schema: articleSection
  H3 perguntas → schema: FAQPage mainEntity[N].name — EXATAMENTE igual
  Resposta após H3 → schema: FAQPage mainEntity[N].acceptedAnswer.text

HOWTO (tutorial passo a passo):
  H1 → schema: name (título da tarefa)
  Intro → schema: description
  Cada H3 de passo → schema: HowToStep.name — EXATAMENTE igual
  Parágrafo após H3 → schema: HowToStep.text
  Imagem por passo → schema: HowToStep.image (recomendado)

RECIPE:
  H1 → schema: name
  Lista ingredientes → schema: recipeIngredient[] (um por linha)
  Cada passo → schema: recipeInstructions[N] (HowToStep)
  Metadados visíveis → schema: prepTime, cookTime, recipeYield, calories

PRODUCT:
  H1 → schema: name
  Descrição → schema: description
  Preço visível → schema: offers.price
  Disponibilidade → schema: offers.availability
  Imagens → schema: image (array)
```

---

## Step 3: Mapear Entidades a Mencionar

```
Para cada entidade identificada no tópico:
  1. Verificar Q-ID Wikidata (entity_table ou @entity-disambiguator)
  2. Verificar se entity hub interno existe no site
  3. Decisão: linkar na primeira menção?
     → Hub interno existe: SIM (link para hub)
     → Só Wikidata (sem hub): menção sem link (schema sameAs apenas)
     → Não verificado: mencionar sem @id (não fabricar Q-ID)
  4. Decisão: incluir no schema como about ou mentions?
     → Central Entity: about/@id no Article
     → Entidades secundárias relevantes: mentions/@id
     → Entidades sem Q-ID verificado: mencionar no texto apenas
```

---

## Formato do Brief

```markdown
# BRIEF SEMÂNTICO: {Título Sugerido}

---
## IDENTIDADE SEMÂNTICA

**Central Entity:** {nome da entidade}
**Wikidata Q-ID:** Q{número} — verificar em https://www.wikidata.org/wiki/Q{número}
**Entity Hub URL:** {url-do-hub-no-site} — linkar na primeira menção no corpo
**URL desta página:** /{cluster}/{slug}/
**@id desta página:** /{cluster}/{slug}#article

---
## SCHEMA OBRIGATÓRIO

**Tipo primário:** `@type: {Article|HowTo|FAQPage|Recipe}`
**Tipos secundários:** `{FAQPage|Speakable|HowTo}` (se aplicável)
**Autor:** {nome} — `@id: {domain}/autores/{slug}/#person`
**Cluster hub:** {entity-hub-url} — campo `about` no schema
**Publisher:** `@id: {domain}/#organization`

> REGRA: O schema será gerado automaticamente se o conteúdo seguir a estrutura abaixo.
> Não desviar dos H3 de FAQ — o texto do H3 = o texto exato no schema.

---
## ESTRUTURA DE CONTEÚDO

### H1: {Headline sugerida — max 110 chars}
→ alimenta: `schema.headline`

**Parágrafo de abertura (2-3 frases):**
- Deve responder: "O que é {entidade}?" ou "Como fazer {X}?"
- Linguagem direta, verificável, sem jargão
- Candidato a Speakable (adicionar class="article-summary" no HTML)
→ alimenta: `schema.description` + Speakable cssSelector

### H2: {Seção 1 — contexto e por quê é relevante}

### H2: {Seção 2 — desenvolvimento principal}

### H2: {Seção 3 — aplicação prática ou exemplos}

### Seção FAQ — Perguntas Frequentes

> Os H3 de FAQ devem ser perguntas EXATAS que serão copiadas para o schema.
> Não parafrasear depois — o que está aqui é o que vai para o FAQPage schema.

#### H3: {Pergunta 1 — será copiada exatamente para o schema}
{Resposta mínima 50 chars. HTML básico permitido: `<strong>`, `<ul>`, `<a href>`.}
→ alimenta: `FAQPage.mainEntity[0].acceptedAnswer.text`

#### H3: {Pergunta 2 exata}
{Resposta 2}
→ alimenta: `FAQPage.mainEntity[1].acceptedAnswer.text`

#### H3: {Pergunta 3 exata}
{Resposta 3}

---
## ENTIDADES A MENCIONAR

| Entidade | Q-ID | Tipo Schema | Linkar? | Onde | Schema Action |
|----------|------|-------------|---------|------|--------------|
| {Entidade 1} | Q{X} | {Tipo} | SIM (hub) | Primeira menção no texto | about/@id |
| {Entidade 2} | Q{Y} | {Tipo} | SIM (hub) | Se relevante | mentions/@id |
| {Entidade 3} | — | {Tipo} | NÃO | Menção apenas | sem @id |

---
## SCHEMA QUE SERÁ GERADO (preview)

O redator não precisa criar o schema. É gerado automaticamente se o conteúdo seguir
a estrutura acima. Este preview serve como referência para @kg-engineer.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BlogPosting",
      "@id": "{url}#article",
      "headline": "{H1 desta página}",
      "description": "{Parágrafo de abertura — max 200 chars}",
      "about": { "@id": "{entity-hub-url}#entity" },
      "author": { "@id": "{domain}/autores/{slug}/#person" },
      "publisher": { "@id": "{domain}/#organization" },
      "datePublished": "{data a preencher no CMS}",
      "image": { "@type": "ImageObject", "url": "{imagem-featured}", "width": 1200, "height": 630 },
      "mainEntityOfPage": { "@id": "{url}#webpage" }
    },
    {
      "@type": "FAQPage",
      "@id": "{url}#faqpage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "{H3 FAQ 1 — texto exato}",
          "acceptedAnswer": { "@type": "Answer", "text": "{Resposta 1}" }
        },
        {
          "@type": "Question",
          "name": "{H3 FAQ 2 — texto exato}",
          "acceptedAnswer": { "@type": "Answer", "text": "{Resposta 2}" }
        }
      ]
    }
  ]
}
```

---
## REQUISITOS DE MÍDIA

- **Imagem featured:** 1200×630px mínimo — obrigatório para Article rich result
- **Alt text:** deve descrever a imagem COM a entidade principal mencionada
- **Imagens de passos (HowTo):** 1 por step se possível — melhora rich result
- **Caption:** se imagem de terceiros, usar `creditText` no ImageObject schema

---
## RICH RESULTS ESPERADOS

- ✅ **Article/BlogPosting** — imagem grande no mobile + data de publicação + byline
- ✅ **FAQPage** — accordion expandível no SERP (ocupa ~150px extra de SERP real estate)
- ✅ **Speakable** — conteúdo citável por AI Overviews e Google Assistant

---
## CHECKLIST DO REDATOR

- [ ] Headline ≤ 110 caracteres (verificar: contar no Word ou wordcounter.net)
- [ ] Parágrafo de abertura responde em 2 frases "O que é / Como fazer X?" (Speakable)
- [ ] Mínimo 3 perguntas H3 com respostas (min 50 chars cada) para FAQPage
- [ ] Texto dos H3 de FAQ = exato para o schema (não parafrasear depois)
- [ ] Link para entity hub na primeira menção de "{entidade central}"
- [ ] Imagem featured fornecida (1200×630px) com alt text descritivo
- [ ] Fontes externas citadas (E-E-A-T — citar no mínimo 1 fonte verificável)
- [ ] Nenhum dado inventado — escrever apenas o verificável
- [ ] Revisão: texto não contém erros factuais sobre a Central Entity

---
## IMPLEMENTAÇÃO PÓS-PUBLICAÇÃO

Após publicar o conteúdo, enviar para @kg-engineer:
1. URL final da página publicada
2. Data de publicação exata (ISO 8601)
3. URL da imagem featured (com dimensões)

@kg-engineer irá injetar o schema usando `inject-schema-cms.md`.
```

---

## Output Entregue

1. `brief-{slug}.md` — brief completo para o redator com checklist
2. `schema-preview-{slug}.json` — schema que será gerado pelo conteúdo (para @kg-engineer)
3. `entity-checklist-{slug}.md` — tabela de entidades a mencionar com Q-IDs e decisões de linking

---

## Quality Gates

- [ ] Central Entity identificada com Q-ID Wikidata verificado (ou NOT_FOUND documentado)
- [ ] @type correto para o tipo de página (HowTo vs Article vs FAQPage — verificar hierarquia)
- [ ] Estrutura de conteúdo garante propriedades obrigatórias do schema (headline, datePublished, image, author)
- [ ] FAQ H3s são perguntas reais que o usuário faria (não genéricas como "O que é X?")
- [ ] Entity hub URL referenciada corretamente no campo `about` do schema-preview
- [ ] Rich results esperados listados com base no schema gerado (Article, FAQPage, Speakable)
- [ ] Checklist do redator presente e completo com critérios verificáveis
- [ ] Schema-preview é JSON válido (parseable) sem campos "SUBSTITUIR" não resolvidos

## Integração

- **Recebe de:** wf-site-semantic-blueprint (lista de conteúdos a produzir), seo-ai-god (análise de tópicos)
- **Entrega para:** redator (brief), @kg-engineer (schema-preview para injeção pós-publicação)
- **Depende de:** `map-entity-wikidata.md` (Q-IDs verificados), `build-entity-hub.md` (hub_url para about)
- **Relacionado:** `inject-schema-cms.md` (injeção após publicação), `validate-rich-results.md` (validação pós-publicação)
