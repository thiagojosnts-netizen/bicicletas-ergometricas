# Task: Generate JSON-LD Template

```yaml
id: generate-jsonld-template
agent: schema-architect
version: "2.0"
elicit: true
estimated_duration: "15-30 min por tipo de página"
inputs:
  required:
    - page_type: "enum [article, organization, person, product, faq, howto, local-business, event, course, software, recipe, breadcrumb-only]"
    - site_domain: "URL base do site (ex: https://site.com)"
  optional:
    - has_author: "boolean — páginas têm autoria individual? (default: false)"
    - entity_table: "Caminho para master_entity_table_final.csv (popula @ids e sameAs reais)"
    - cms_type: "wordpress|nextjs|astro|shopify|html|webflow"
    - central_entity_id: "@id da entidade central do site (popula campo about)"
    - organization_id: "@id da organization do site"
outputs:
  - jsonld_template.json
  - jsonld_template_filled_example.json
  - usage_guide.md
```

## Objetivo

Gerar um template JSON-LD completo, válido, Rich Results-eligible e reutilizável para um tipo específico de página, integrando os @ids e sameAs reais da master entity table e seguindo o padrão @graph com cross-references entre nós.

---

## Elicitation

Antes de gerar o template, coletar:

1. **Tipo de página:** Qual é o tipo principal de conteúdo a ser templateado?
2. **Domínio:** `https://...` (sem barra final)
3. **Autoria individual?** As páginas têm autor atribuído (Person específico)?
4. **Entidade central do site:** Qual é a entidade principal (marca/pessoa/organização)? Tem @id?
5. **CMS:** Isso afeta o guia de implementação gerado
6. **Entity table disponível?** Para usar @ids e sameAs reais em vez de placeholders

---

## Step 1: Hierarquia de Tipos schema.org

Confirmar tipo correto na hierarquia antes de gerar:

```
Thing
├── CreativeWork
│   ├── Article → BlogPosting (blog) | NewsArticle (jornalismo) | TechArticle (técnico)
│   ├── WebPage → CollectionPage | FAQPage | ProfilePage
│   ├── Course (educação online)
│   ├── HowTo (passo a passo)
│   └── Recipe (culinária)
├── Organization
│   ├── LocalBusiness → Restaurant | Store | MedicalClinic
│   └── Corporation, EducationalOrganization, etc.
├── Person (autor, especialista)
├── Product (produto físico/digital)
├── Event (evento, webinar, conferência)
└── SoftwareApplication (app, SaaS)
```

**Regra Jarno van Driel:** Sempre usar o tipo mais específico possível.
`BlogPosting` é melhor que `Article` para blog. `MedicalClinic` é melhor que `LocalBusiness` para clínica.

---

## Step 2: Templates por Tipo de Página

### ARTICLE / BLOGPOSTING (blog e conteúdo editorial)

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "{DOMAIN}/#website",
      "url": "{DOMAIN}/",
      "name": "{SITE_NAME}",
      "inLanguage": "pt-BR",
      "publisher": { "@id": "{DOMAIN}/#organization" }
    },
    {
      "@type": "Organization",
      "@id": "{DOMAIN}/#organization",
      "name": "{ORG_NAME}",
      "url": "{DOMAIN}/",
      "logo": {
        "@type": "ImageObject",
        "url": "{DOMAIN}/assets/logo.png",
        "width": 512,
        "height": 512
      },
      "sameAs": [
        "SUBSTITUIR: URL Wikidata Q-ID da organização",
        "SUBSTITUIR: URL LinkedIn da organização"
      ]
    },
    {
      "@type": "WebPage",
      "@id": "{PAGE_URL}#webpage",
      "url": "{PAGE_URL}",
      "name": "{SEO_TITLE — max 60 chars}",
      "description": "{META_DESCRIPTION — 120-160 chars}",
      "isPartOf": { "@id": "{DOMAIN}/#website" },
      "about": { "@id": "SUBSTITUIR: @id do entity hub da Central Entity" },
      "breadcrumb": { "@id": "{PAGE_URL}#breadcrumb" },
      "datePublished": "SUBSTITUIR: ISO 8601 ex: 2026-05-14T10:00:00-03:00",
      "dateModified": "SUBSTITUIR: ISO 8601 ex: 2026-05-14T10:00:00-03:00",
      "inLanguage": "pt-BR",
      "potentialAction": {
        "@type": "ReadAction",
        "target": ["{PAGE_URL}"]
      }
    },
    {
      "@type": "BlogPosting",
      "@id": "{PAGE_URL}#article",
      "headline": "SUBSTITUIR: Título do artigo — exatamente como no H1 (max 110 chars)",
      "description": "SUBSTITUIR: Resumo do artigo (150-200 chars)",
      "datePublished": "SUBSTITUIR: ISO 8601 (igual ao WebPage)",
      "dateModified": "SUBSTITUIR: ISO 8601",
      "url": "{PAGE_URL}",
      "image": {
        "@type": "ImageObject",
        "url": "SUBSTITUIR: URL da imagem de destaque",
        "width": 1200,
        "height": 630
      },
      "author": {
        "@id": "SUBSTITUIR: {DOMAIN}/autores/{AUTHOR_SLUG}/#person — ou usar objeto inline se sem hub"
      },
      "publisher": { "@id": "{DOMAIN}/#organization" },
      "mainEntityOfPage": { "@id": "{PAGE_URL}#webpage" },
      "about": { "@id": "SUBSTITUIR: @id do entity hub da Central Entity" },
      "inLanguage": "pt-BR",
      "keywords": ["SUBSTITUIR: keyword 1", "keyword 2", "keyword 3"],
      "articleSection": "SUBSTITUIR: categoria/seção do artigo"
    },
    {
      "@type": "BreadcrumbList",
      "@id": "{PAGE_URL}#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "{DOMAIN}/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "SUBSTITUIR: Nome da categoria",
          "item": "{DOMAIN}/SUBSTITUIR-slug-categoria/"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "SUBSTITUIR: Título do artigo",
          "item": "{PAGE_URL}"
        }
      ]
    }
  ]
}
```

### PRODUCT (e-commerce)

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "{PAGE_URL}#webpage",
      "url": "{PAGE_URL}",
      "name": "SUBSTITUIR: Nome do Produto — {SITE_NAME}",
      "isPartOf": { "@id": "{DOMAIN}/#website" },
      "breadcrumb": { "@id": "{PAGE_URL}#breadcrumb" }
    },
    {
      "@type": "Product",
      "@id": "{PAGE_URL}#product",
      "name": "SUBSTITUIR: Nome oficial do produto",
      "description": "SUBSTITUIR: Descrição do produto (min 100 chars)",
      "image": [
        {
          "@type": "ImageObject",
          "url": "SUBSTITUIR: URL imagem principal",
          "width": 800,
          "height": 800
        }
      ],
      "sku": "SUBSTITUIR: SKU do produto",
      "brand": {
        "@type": "Brand",
        "name": "SUBSTITUIR: Nome da marca",
        "@id": "{DOMAIN}/#organization"
      },
      "offers": {
        "@type": "Offer",
        "priceCurrency": "BRL",
        "price": "SUBSTITUIR: Preço sem símbolo ex: 149.90",
        "availability": "https://schema.org/InStock",
        "itemCondition": "https://schema.org/NewCondition",
        "url": "{PAGE_URL}",
        "seller": { "@id": "{DOMAIN}/#organization" },
        "priceValidUntil": "SUBSTITUIR: data ex: 2026-12-31"
      },
      "mainEntityOfPage": { "@id": "{PAGE_URL}#webpage" }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "{PAGE_URL}#breadcrumb",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "{DOMAIN}/" },
        { "@type": "ListItem", "position": 2, "name": "SUBSTITUIR: Categoria", "item": "{DOMAIN}/SUBSTITUIR-cat/" },
        { "@type": "ListItem", "position": 3, "name": "SUBSTITUIR: Produto", "item": "{PAGE_URL}" }
      ]
    }
  ]
}
```

### FAQPAGE

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "{PAGE_URL}#webpage",
      "url": "{PAGE_URL}",
      "name": "SUBSTITUIR: Título da página de FAQ",
      "isPartOf": { "@id": "{DOMAIN}/#website" }
    },
    {
      "@type": "FAQPage",
      "@id": "{PAGE_URL}#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "SUBSTITUIR: Pergunta 1 — exatamente como aparece na página?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "SUBSTITUIR: Resposta completa em HTML ou texto puro (min 50 chars)"
          }
        },
        {
          "@type": "Question",
          "name": "SUBSTITUIR: Pergunta 2",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "SUBSTITUIR: Resposta 2"
          }
        }
      ]
    }
  ]
}
```

### LOCAL BUSINESS

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["LocalBusiness", "SUBSTITUIR: tipo especifico ex: Store, Restaurant, MedicalClinic"],
      "@id": "{DOMAIN}/#localbusiness",
      "name": "SUBSTITUIR: Nome do negócio",
      "url": "{DOMAIN}/",
      "telephone": "SUBSTITUIR: +55 11 XXXXX-XXXX",
      "email": "SUBSTITUIR: contato@empresa.com",
      "description": "SUBSTITUIR: Descrição do negócio (100-200 chars)",
      "image": {
        "@type": "ImageObject",
        "url": "SUBSTITUIR: Foto da fachada ou logo",
        "width": 1200,
        "height": 628
      },
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "SUBSTITUIR: Rua e número",
        "addressLocality": "SUBSTITUIR: Cidade",
        "addressRegion": "SUBSTITUIR: Estado (ex: SP)",
        "postalCode": "SUBSTITUIR: CEP (ex: 01310-100)",
        "addressCountry": "BR"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "SUBSTITUIR: -23.5505",
        "longitude": "SUBSTITUIR: -46.6333"
      },
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          "opens": "09:00",
          "closes": "18:00"
        }
      ],
      "sameAs": [
        "SUBSTITUIR: URL Google Business Profile",
        "SUBSTITUIR: URL Facebook da empresa",
        "SUBSTITUIR: URL Instagram da empresa"
      ],
      "priceRange": "SUBSTITUIR: $$ ou R$50-R$200"
    }
  ]
}
```

---

## Step 3: Integração com Master Entity Table

Se `entity_table` fornecido, substituir placeholders com dados reais:

```python
import csv, json

def integrate_entity_table(template_str, entity_table_path, site_domain):
    """Substitui placeholders de @id e sameAs com dados reais da master table."""
    
    with open(entity_table_path, "r", encoding="utf-8") as f:
        entities = list(csv.DictReader(f))
    
    # Encontrar Central Entity (organization ou produto principal)
    central = next((e for e in entities if e.get("sameas_strategy") in ("B", "C") and
                   e.get("internal_hub_planned") == "true"), None)
    
    if central:
        hub_url = central.get("internal_hub_url", "")
        hub_id = f"{site_domain}{hub_url}#entity"
        template_str = template_str.replace(
            "SUBSTITUIR: @id do entity hub da Central Entity",
            hub_id
        )
    
    return template_str
```

---

## Step 4: Validação do Template

Antes de entregar, verificar:

```python
def validate_template(template_json_str):
    """Valida sintaxe e estrutura básica do template."""
    errors = []
    
    # 1. JSON parse
    try:
        data = json.loads(template_json_str)
    except json.JSONDecodeError as e:
        return [f"CRITICO: JSON invalido — {e}"]
    
    # 2. @context
    if data.get("@context") != "https://schema.org":
        errors.append("WARN: @context deve ser 'https://schema.org' (https, não http)")
    
    # 3. @graph presente
    if "@graph" not in data:
        errors.append("WARN: Recomendado usar @graph para múltiplos nós")
    
    # 4. Verificar SUBSTITUIR não preenchido no exemplo
    if "SUBSTITUIR" in template_json_str:
        count = template_json_str.count("SUBSTITUIR")
        errors.append(f"INFO: {count} placeholder(s) SUBSTITUIR no template (esperado em template, erro no exemplo preenchido)")
    
    return errors
```

---

## Step 5: Usage Guide (por CMS)

```markdown
# Usage Guide — Template {page_type} — {site_domain}

## Variáveis a Substituir

| Placeholder | Campo no CMS | Exemplo |
|-------------|-------------|---------|
| {PAGE_URL} | URL canônica da página | https://site.com/artigo/titulo-do-artigo/ |
| {SEO_TITLE} | Meta title | Título do Artigo — Nome do Site |
| {META_DESCRIPTION} | Meta description | Resumo de 120-160 chars |
| datePublished | Data de publicação | 2026-05-14T10:00:00-03:00 |
| headline | Título H1 | Exatamente como aparece na página |
| image.url | URL da imagem de destaque | https://site.com/imagens/foto.jpg |

## Implementação no CMS

### WordPress (RankMath):
1. Schema → Custom Schema → Adicionar novo
2. Colar o JSON-LD completo com variáveis já substituídas
3. Usar shortcodes do RankMath para campos dinâmicos:
   - `%title%` → headline
   - `%excerpt%` → description
   - `%date(c)%` → datePublished em ISO 8601

### Next.js App Router:
```tsx
// Em app/[slug]/page.tsx
export default async function ArticlePage({ params }) {
  const article = await getArticle(params.slug);
  const schema = buildArticleSchema(article, SITE_DOMAIN);
  
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {/* conteúdo */}
    </>
  );
}
```

### Astro:
```astro
---
const { article } = Astro.props;
const schema = buildSchema(article);
---
<script type="application/ld+json" set:html={JSON.stringify(schema)} />
```

### Shopify Liquid:
```liquid
<script type="application/ld+json">
  {{ schema_json | json }}
</script>
```

## Verificação Pós-Implementação

1. `curl -s https://site.com/sua-pagina | grep "ld+json"` — deve retornar >= 1
2. Rich Results Test: search.google.com/test/rich-results?url={URL}
3. Schema.org Validator: validator.schema.org/#url={URL}
4. Status esperado: "Eligible for rich results"
```

---

## Quality Gates

- [ ] JSON template parseável sem erros (json.loads sem exceção)
- [ ] `@context: "https://schema.org"` presente (https, não http)
- [ ] `@graph` com todos os nós conectados por @id cross-references
- [ ] @id em TODAS as entidades principais (não apenas nó raiz)
- [ ] Propriedades obrigatórias para rich results presentes no tipo solicitado
- [ ] `sameAs` com placeholders para Q-IDs verificados (ou preenchido da entity table)
- [ ] `about` apontando para @id do entity hub (se central_entity_id fornecido)
- [ ] BreadcrumbList incluso (exceto se page_type=breadcrumb-only)
- [ ] Exemplo preenchido gerado (`jsonld_template_filled_example.json`) sem SUBSTITUIR
- [ ] Rich Results Test: ELIGIBLE no exemplo preenchido
- [ ] `usage_guide.md` gerado para o CMS do cliente

## Integração

- **Recebe de:** wf-schema-implementation (fase 4A), @schema-architect (decisão de tipo)
- **Entrega para:** `inject-schema-cms.md` (template pronto para injeção), @kg-engineer (sameAs a preencher)
- **Depende de:** `map-entity-wikidata.md` (Q-IDs para sameAs), master_entity_table.csv (para @ids reais)
- **Relacionado:** `score-page-schema.md` (para validar o resultado), `validate-rich-results.md`
