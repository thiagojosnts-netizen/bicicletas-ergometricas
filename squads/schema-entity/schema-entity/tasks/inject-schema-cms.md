# Task: inject-schema-cms

## Metadata

```yaml
id: inject-schema-cms
agent: kg-engineer
version: "2.0"
elicit: true
estimated_duration: "30-60 min por CMS/site"
inputs:
  required:
    - cms_type: "enum [wordpress, nextjs, astro, shopify, html, webflow, custom-php]"
    - jsonld_templates: "Diretório ou lista de templates JSON-LD aprovados"
    - master_entity_table: "Arquivo CSV com @ids e sameAs verificados"
  optional:
    - staging_url: "URL de staging para testar antes do deploy em produção"
    - target_pages: "Lista de URLs específicas (se não for injeção global)"
    - rollback_branch: "Branch git do estado anterior ao deploy"
outputs:
  - injection_code/  # Diretório com snippets por CMS
  - injection_report.md
  - rollback_guide.md
```

## Objetivo

Injetar os templates JSON-LD aprovados no CMS do cliente de forma server-side, garantindo que o schema é processável pelo Googlebot sem impacto em performance (LCP, CLS, INP), com guia de rollback documentado.

---

## Elicitation

Antes de iniciar a injeção:

1. **CMS:** WordPress, Next.js, Astro, Shopify, HTML puro ou outro?
2. **Escopo:** Injeção global (todas as páginas do tipo) ou apenas URLs específicas?
3. **Staging disponível?** Tem ambiente de staging para testar antes de produção?
4. **Rollback:** Como reverter rapidamente se algo der errado? (branch git, backup tema, etc.)
5. **Rich Results Test já aprovado?** Templates foram testados antes da injeção?

---

## Step 1: Verificação Pré-Injeção

Antes de qualquer deploy, verificar obrigatoriamente:

```
□ Templates JSON-LD válidos (json.loads sem erro)
□ Rich Results Test ELIGIBLE em URL de staging ou exemplo
□ @ids e sameAs consistentes com master_entity_table.csv
□ Nenhum JSON com campo "SUBSTITUIR" não preenchido
□ Staging disponível para testar antes de produção
□ Backup do tema/configuração atual documentado
□ Branch git do estado atual registrado (se aplicável)
```

---

## Processo por CMS

### WordPress

**Opção A: functions.php (sem plugin — controle total)**
```php
<?php
// AVISO: Testar em staging antes de produção
// Adicionar ao functions.php ou plugin customizado

function schema_entity_inject_head() {
    if (is_singular()) {
        $schema = get_post_meta(get_the_ID(), '_schema_entity_jsonld', true);
        if ($schema && json_decode($schema) !== null) {
            echo "\n<script type=\"application/ld+json\">\n";
            echo wp_unslash($schema);
            echo "\n</script>\n";
        }
    }
    
    // Schema global (Organization + Website) em todas as páginas
    $global_schema = get_option('schema_entity_global_jsonld', '');
    if ($global_schema && json_decode($global_schema) !== null) {
        echo "\n<script type=\"application/ld+json\">\n";
        echo wp_unslash($global_schema);
        echo "\n</script>\n";
    }
}
add_action('wp_head', 'schema_entity_inject_head', 1);

// Registrar meta field para o editor
function schema_entity_register_meta() {
    register_post_meta('post', '_schema_entity_jsonld', [
        'show_in_rest' => true,
        'single' => true,
        'type' => 'string',
        'sanitize_callback' => 'wp_kses_post',
        'auth_callback' => function() { return current_user_can('edit_posts'); }
    ]);
    register_post_meta('page', '_schema_entity_jsonld', [
        'show_in_rest' => true,
        'single' => true,
        'type' => 'string',
    ]);
}
add_action('init', 'schema_entity_register_meta');
```

**Opção B: RankMath (recomendado se já instalado)**
```
RankMath > Schema > Custom Schema > Adicionar
Colar JSON-LD com variáveis do RankMath:
  %post_url%    → URL canônica da página
  %title%       → headline / name
  %excerpt%     → description
  %author_name% → author.name
  %date(c)%     → datePublished em ISO 8601
```

**Injeção em batch via WP-CLI:**
```bash
# Injetar schema em múltiplos posts via WP-CLI
wp eval-file inject_schema_batch.php \
  --allow-root \
  --url=https://site.com \
  --entity_table=master_entity_table.csv \
  --template_dir=templates/jsonld/
  
# Verificar após injeção:
wp post meta get 123 _schema_entity_jsonld
```

---

### Next.js (App Router)

**Schema global em layout.tsx:**
```tsx
// app/layout.tsx — Organization + Website injetados em todas as páginas
import { SITE_URL, SITE_NAME } from '@/config/constants'

const globalSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      "name": SITE_NAME,
      "url": SITE_URL,
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_URL}/assets/logo.png`,
        "width": 512,
        "height": 512
      },
      "sameAs": process.env.NEXT_PUBLIC_ORGANIZATION_SAMEAS?.split(",") || []
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      "url": SITE_URL,
      "name": SITE_NAME,
      "inLanguage": "pt-BR",
      "publisher": { "@id": `${SITE_URL}/#organization` }
    }
  ]
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(globalSchema) }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

**Schema de artigo dinâmico em page.tsx:**
```tsx
// app/blog/[slug]/page.tsx
import { buildArticleSchema } from '@/lib/schema'

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const article = await getArticle(params.slug)
  const schema = buildArticleSchema(article)
  
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {/* conteúdo da página */}
    </>
  )
}
```

```ts
// lib/schema.ts — Builder de schemas
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL!

export function buildArticleSchema(article: Article) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/${article.slug}#webpage`,
        "url": `${SITE_URL}/${article.slug}`,
        "name": article.seoTitle,
        "isPartOf": { "@id": `${SITE_URL}/#website` },
        "about": { "@id": article.entityHubId },
        "datePublished": article.publishedAt,
        "dateModified": article.updatedAt,
      },
      {
        "@type": "BlogPosting",
        "@id": `${SITE_URL}/${article.slug}#article`,
        "headline": article.title,
        "datePublished": article.publishedAt,
        "dateModified": article.updatedAt,
        "image": { "@type": "ImageObject", "url": article.featuredImage, "width": 1200, "height": 630 },
        "author": { "@id": `${SITE_URL}/autores/${article.author.slug}/#person` },
        "publisher": { "@id": `${SITE_URL}/#organization` },
        "mainEntityOfPage": { "@id": `${SITE_URL}/${article.slug}#webpage` },
      }
    ]
  }
}
```

---

### Astro

```astro
---
// src/layouts/BaseLayout.astro
const { schema, title, description } = Astro.props;
---
<html lang="pt-BR">
  <head>
    <title>{title}</title>
    <meta name="description" content={description}>
    
    {schema && (
      <script
        type="application/ld+json"
        set:html={JSON.stringify(schema)}
      />
    )}
  </head>
  <body>
    <slot />
  </body>
</html>
```

```astro
---
// src/pages/blog/[slug].astro
import BaseLayout from '@/layouts/BaseLayout.astro';
import { buildArticleSchema } from '@/lib/schema';

const { slug } = Astro.params;
const article = await getArticle(slug);
const schema = buildArticleSchema(article, Astro.site?.toString() || '');
---
<BaseLayout schema={schema} title={article.title}>
  <!-- conteúdo -->
</BaseLayout>
```

---

### Shopify

```liquid
{%- comment -%} theme.liquid — Schema global {%- endcomment -%}
<head>
  {%- if template.name == 'product' -%}
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Product",
      "@id": "{{ shop.url }}{{ product.url }}#product",
      "name": {{ product.title | json }},
      "description": {{ product.description | strip_html | truncate: 200 | json }},
      "image": [
        {%- for image in product.images limit: 3 -%}
          {{ image.src | img_url: '800x800' | prepend: 'https:' | json }}{% unless forloop.last %},{% endunless %}
        {%- endfor -%}
      ],
      "offers": {
        "@type": "Offer",
        "priceCurrency": {{ cart.currency.iso_code | json }},
        "price": {{ product.selected_or_first_available_variant.price | divided_by: 100.0 | json }},
        "availability": "https://schema.org/{% if product.available %}InStock{% else %}OutOfStock{% endif %}",
        "url": "{{ shop.url }}{{ product.url }}"
      },
      "brand": {
        "@type": "Brand",
        "@id": "{{ shop.url }}/#organization",
        "name": {{ shop.name | json }}
      }
    }
    </script>
  {%- endif -%}
  
  {%- comment -%} Organization schema — em todas as páginas {%- endcomment -%}
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "{{ shop.url }}/#organization",
    "name": {{ shop.name | json }},
    "url": {{ shop.url | json }},
    "logo": {{ settings.logo | img_url: '512x512' | prepend: 'https:' | json }},
    "sameAs": [
      {{ settings.wikidata_url | json }},
      {{ settings.wikipedia_url | json }}
    ]
  }
  </script>
</head>
```

---

### HTML Puro / Custom PHP

```php
<?php
// header.php — Schema global
$site_url = "https://site.com";
$org_schema = json_encode([
    "@context" => "https://schema.org",
    "@type" => "Organization",
    "@id" => "$site_url/#organization",
    "name" => "Nome do Site",
    "url" => $site_url,
    "logo" => [
        "@type" => "ImageObject",
        "url" => "$site_url/assets/logo.png",
        "width" => 512,
        "height" => 512
    ]
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

echo '<script type="application/ld+json">' . $org_schema . '</script>';
?>
```

---

## Verificação Pós-Deploy

```bash
# 1. Verificar SSR — schema deve aparecer no HTML inicial:
curl -s https://site.com/artigo-exemplo | grep -c "application/ld+json"
# Esperado: >= 1

# 2. Verificar JSON válido no HTML:
curl -s https://site.com/artigo-exemplo | python3 -c "
import sys, json, re
html = sys.stdin.read()
schemas = re.findall(r'<script[^>]*ld\+json[^>]*>(.*?)</script>', html, re.S)
for s in schemas:
    try:
        data = json.loads(s)
        print('JSON valido:', data.get('@type', 'sem tipo'))
    except json.JSONDecodeError as e:
        print('ERRO JSON:', e)
"

# 3. Rich Results Test (após deploy em staging ou produção):
# https://search.google.com/test/rich-results?url={URL}
```

---

## Rollback Guide

**WordPress:**
```bash
# Remover hook via WP-CLI
wp eval 'remove_action("wp_head", "schema_entity_inject_head");'
# Ou: reverter functions.php para versão anterior via git
```

**Next.js:**
```bash
git revert {commit_hash_do_schema}
git push
# Deploy automático via Vercel/Netlify reverterá o schema
```

**Astro:**
```bash
git checkout {branch_anterior}
npm run build && npm run deploy
```

**Shopify:**
```
Online Store > Themes > Actions > Duplicate (antes do deploy)
Se precisar reverter: Actions > Publish na cópia anterior
```

---

## Checklist Pré-Deploy

- [ ] Templates testados em staging com Rich Results Test (ELIGIBLE)
- [ ] JSON válido em todos os templates (json.loads sem erro)
- [ ] Schema renderiza server-side (verificar via "view source" da página)
- [ ] CWV medido antes do deploy (baseline no PageSpeed Insights)
- [ ] Rollback documentado e testado
- [ ] Nenhum campo "SUBSTITUIR" não preenchido nos templates finais

## Quality Gates

- [ ] Código de injeção gerado e revisado para o CMS específico do cliente
- [ ] Testado em staging — nunca deploy direto em produção sem staging
- [ ] Rich Results Test: PASS após injeção no staging
- [ ] CWV medido antes e depois — LCP/CLS/INP não devem degradar
- [ ] SSR verificado via `curl` — schema presente no HTML inicial
- [ ] `rollback_guide.md` gerado com comandos prontos para executar
- [ ] `injection_report.md` gerado: o que foi injetado, onde, quando

## Integração

- **Recebe de:** `generate-jsonld-template.md` (templates aprovados), `build-entity-hub.md` (schema do hub)
- **Entrega para:** `validate-rich-results.md` (validar após injeção), wf-validation-pipeline (fase 5)
- **Depende de:** master_entity_table.csv com @ids e sameAs verificados
- **Relacionado:** `score-page-schema.md` (score pós-injeção), `setup-bidirectional-links.md` (links após hub criado)
