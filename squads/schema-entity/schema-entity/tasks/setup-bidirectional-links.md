# Task: Setup Bidirectional Links

```yaml
id: setup-bidirectional-links
agent: entity-disambiguator
version: "2.0"
elicit: true
estimated_duration: "30-60 min por entity hub"
inputs:
  required:
    - hub_url: "URL completa do entity hub"
    - hub_entity_id: "@id do hub (ex: https://site.com/entidades/python/#entity)"
    - hub_entity_name: "Nome da entidade do hub"
  optional:
    - spoke_urls: "Lista de URLs dos spokes (se já identificados)"
    - cms_type: "wordpress|nextjs|astro|shopify|html"
    - auto_discover: "boolean — buscar spokes via crawl se lista não fornecida"
outputs:
  - bidirectional_links_plan.csv
  - schema_updates_list.yaml
  - hub_schema_update.json
  - spoke_editorial_instructions.md
```

## Objetivo

Configurar o bidirectional linking completo entre um entity hub e suas páginas spoke — tanto via links HTML internos (editorial) quanto via schema JSON-LD (semântico). O linking bidirecional é o mecanismo que permite ao Google entender que o hub e os spokes formam uma Semantic Content Network coesa.

---

## Elicitation

1. **Hub:** Qual entidade é o hub? (nome + URL + @id já definido?)
2. **Spokes:** Você tem a lista de URLs que mencionam esta entidade? Ou precisa descobrir?
3. **CMS:** Como são as páginas — WordPress, Next.js, etc.?
4. **Escopo:** Quer fazer os links editoriais também ou apenas o schema?

---

## Step 1: Descoberta de Spokes

### Se spoke_urls NÃO fornecido — Auto-Discovery:

```python
import requests, re
from urllib.parse import urlparse

def discover_spokes(hub_entity_name, sitemap_url, site_url, limit=100):
    """Encontra páginas que mencionam a entidade hub."""
    # 1. Obter URLs do sitemap
    resp = requests.get(sitemap_url, timeout=10)
    urls = re.findall(r'<loc>(.*?)</loc>', resp.text)
    urls = [u for u in urls[:limit] if u != hub_url]
    
    # 2. Para cada URL, verificar se menciona a entidade
    spokes = []
    for url in urls:
        try:
            r = requests.get(url, timeout=10)
            # Busca case-insensitive pelo nome da entidade
            if hub_entity_name.lower() in r.text.lower():
                # Encontrar contexto da primeira menção
                idx = r.text.lower().index(hub_entity_name.lower())
                context = r.text[max(0, idx-100):idx+200]
                context_clean = re.sub(r'<[^>]+>', '', context).strip()
                spokes.append({
                    'url': url,
                    'mention_count': r.text.lower().count(hub_entity_name.lower()),
                    'first_mention_context': context_clean[:150]
                })
        except:
            pass
    
    # Ordenar por frequência de menção (mais menções = mais importante)
    return sorted(spokes, key=lambda x: x['mention_count'], reverse=True)
```

### Via GSC (se disponível):
```
Google Search Console → Desempenho → Páginas
Filtrar por: URL containing "{hub_entity_slug}"
OU: Configurar filtro de link interno para hub_url
```

---

## Step 2: Plano Hub → Spokes

### Schema do Hub — hasPart:

```json
{
  "@context": "https://schema.org",
  "@type": "{hub_entity_type}",
  "@id": "{hub_entity_id}",
  "name": "{hub_entity_name}",
  "hasPart": [
    { "@id": "{spoke_url_1}#article" },
    { "@id": "{spoke_url_2}#article" },
    { "@id": "{spoke_url_3}#article" }
  ]
}
```

**Nota:** `hasPart` usa @ids dos nós principais dos spokes (Article, Product, etc.)
Se o spoke não tem @id definido: usar `hasPart: [{"@type": "Article", "url": "{spoke_url}"}]`

### HTML Editorial do Hub — Seção de Artigos:

```html
<!-- Adicionar após o conteúdo principal do hub -->
<section aria-label="Artigos sobre {hub_entity_name}" class="related-articles">
  <h2>Artigos sobre {hub_entity_name}</h2>
  <ul>
    <li>
      <a href="{spoke_url_1}" title="{spoke_title_1}">{spoke_title_1}</a>
      <span class="article-meta">{spoke_date_1}</span>
    </li>
    <li>
      <a href="{spoke_url_2}" title="{spoke_title_2}">{spoke_title_2}</a>
    </li>
    <!-- Continuar para todos os spokes -->
  </ul>
</section>
```

**Requisitos da seção:**
- Heading H2 descritivo (não apenas "Artigos Relacionados")
- Links com anchor text = título real da página (não genérico)
- Ordenar por relevância ou data (mais recente primeiro)
- Atualizar quando novos spokes forem publicados

---

## Step 3: Plano Spokes → Hub

### Para cada spoke identificado:

#### 3A — Link Editorial (obrigatório):

Localizar a PRIMEIRA menção do nome da entidade no texto corrido e adicionar link:

```
ANTES: "...aprender Python é essencial para data science..."
DEPOIS: "...aprender <a href="{hub_url}" title="{hub_entity_name} — guia completo">Python</a> é essencial..."
```

**Regras:**
- Apenas a PRIMEIRA menção → não linkar toda ocorrência
- Anchor text = nome oficial da entidade (não "clique aqui" ou "veja mais")
- Não adicionar link se a entidade já está linkada para outra URL no mesmo parágrafo
- title attribute opcional mas recomendado (AEO-friendly)

#### 3B — Schema Update do Spoke:

Adicionar `about` ao nó WebPage ou à entidade principal do spoke:

```json
{
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "{spoke_url}#webpage",
      "about": {
        "@id": "{hub_entity_id}"
      }
    },
    {
      "@type": "Article",
      "@id": "{spoke_url}#article",
      "about": {
        "@id": "{hub_entity_id}"
      }
    }
  ]
}
```

**Para múltiplas entidades hub no mesmo spoke:**
```json
{
  "about": [
    { "@id": "{hub_entity_id_1}" },
    { "@id": "{hub_entity_id_2}" }
  ],
  "mentions": [
    { "@id": "{secondary_entity_id}" }
  ]
}
```

---

## Step 4: Instruções por CMS

### WordPress:

**Schema update:**
- Via RankMath: Schema → Custom Schema → adicionar `about` como JSON personalizado
- Via Yoast: não tem campo direto → usar plugin adicional ou functions.php
- Via functions.php:
```php
add_filter('rank_math/snippet/rich_snippet_article_entity', function($entity, $post) {
    $hub_id = get_post_meta($post->ID, '_hub_entity_id', true);
    if ($hub_id) {
        $entity['about'] = ['@id' => $hub_id];
    }
    return $entity;
}, 10, 2);
```

**Link editorial:**
- Editar post no editor Gutenberg
- Encontrar primeira menção, selecionar texto, adicionar link para hub_url

### Next.js App Router:

```tsx
// Em page.tsx do spoke, adicionar ao buildArticleSchema():
const schema = {
  "@graph": [
    {
      "@type": "Article",
      "@id": `${pageUrl}#article`,
      "about": {
        "@id": hubEntityId  // prop recebida via params ou contentlayer
      },
      // ... outras propriedades
    }
  ]
}
```

### Astro:

```astro
---
// Em [slug].astro, passar hubEntityId via frontmatter:
const { hubEntityId, hubUrl } = Astro.props;
---
<SchemaGraph schema={{
  "@type": "Article",
  "about": { "@id": hubEntityId }
}} />
```

### Shopify Liquid:

```liquid
{% comment %} Em article.liquid {% endcomment %}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "@id": "{{ canonical_url }}#article",
  "about": {
    "@id": "{{ article.metafields.schema.hub_entity_id }}"
  }
}
</script>
```

---

## Step 5: Tracking e Verificação

### CSV de Rastreamento por Spoke:

```csv
spoke_url,hub_entity,hub_url,editorial_link_added,editorial_link_position,schema_about_added,schema_method,implementation_date,status,verified_by
https://site.com/artigo-1,Python,/entidades/python/,true,"parágrafo 2, frase 1",true,wordpress_rankmath,2026-05-14,completed,tech-seo-engineer
https://site.com/artigo-2,Python,/entidades/python/,false,,false,,,,pending
```

### Verificação Pós-Implementação:

```bash
# 1. Verificar link hub → spoke (sem 404):
curl -o /dev/null -s -w "%{http_code}" {spoke_url}
# Esperado: 200

# 2. Verificar link spoke → hub aparece no HTML:
curl -s {spoke_url} | grep "{hub_url}"
# Esperado: aparecer pelo menos 1 vez

# 3. Verificar schema `about` no spoke:
curl -s {spoke_url} | python3 -c "
import sys, json, re
html = sys.stdin.read()
schemas = re.findall(r'<script[^>]*ld\+json[^>]*>(.*?)</script>', html, re.S)
for s in schemas:
    try:
        data = json.loads(s)
        print(json.dumps(data, indent=2, ensure_ascii=False))
    except: pass
" | grep -A2 '"about"'
# Esperado: mostrar @id do hub

# 4. Verificar schema `hasPart` no hub:
curl -s {hub_url} | python3 -c "..." | grep -A5 '"hasPart"'
```

---

## Output Format

### bidirectional_links_plan.csv:

```csv
type,source_url,target_url,link_type,implementation,status
hub_to_spoke,/entidades/python/,/artigo-1,hasPart+editorial,html+schema,pending
spoke_to_hub,/artigo-1,/entidades/python/,about+editorial,html+schema,pending
spoke_to_hub,/artigo-2,/entidades/python/,about+editorial,html+schema,pending
```

### schema_updates_list.yaml:

```yaml
hub_update:
  url: "/entidades/python/"
  schema_changes:
    add_hasPart:
      - url: "/artigo-1"
        id: "/artigo-1#article"
      - url: "/artigo-2"
        id: "/artigo-2#article"

spoke_updates:
  - url: "/artigo-1"
    schema_changes:
      add_about:
        "@id": "https://site.com/entidades/python/#entity"
    editorial:
      position: "parágrafo 2"
      current_text: "...aprender Python..."
      updated_text: "...aprender <a href='/entidades/python/'>Python</a>..."

  - url: "/artigo-2"
    schema_changes:
      add_about:
        "@id": "https://site.com/entidades/python/#entity"
    editorial:
      position: "terceiro parágrafo"
```

---

## Quality Gates

- [ ] Hub: seção "Artigos sobre {entidade}" criada com todos os spokes linkados
- [ ] Hub: `hasPart` no schema com @ids dos spokes
- [ ] Spokes → Hub: primeira menção linkada em CADA spoke (editorial)
- [ ] Spokes → Hub: `about` com @id do hub no schema de CADA spoke
- [ ] Zero links quebrados — verificar HTTP 200 em hub e todos os spokes
- [ ] Schema dos spokes: SSR verificado (via curl, não DevTools)
- [ ] `bidirectional_tracking.csv` atualizado com status de cada spoke
- [ ] `master_entity_table.csv` atualizado: `bidirectional_links = implemented`

## Integração

- **Recebe de:** `build-entity-hub.md` (lista de spokes), wf-schema-implementation (fase 4B)
- **Entrega para:** wf-validation-pipeline (para verificar links e schema)
- **Relacionado:** `build-entity-hub.md` (criação do hub), `inject-schema-cms.md` (injeção)
