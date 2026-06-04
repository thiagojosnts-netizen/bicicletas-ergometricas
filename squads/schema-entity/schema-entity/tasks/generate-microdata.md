# Task: Generate Microdata

```yaml
id: generate-microdata
agent: multiformat-engineer
version: "2.0"
elicit: true
estimated_duration: "15-30 min por bloco de schema"
inputs:
  required:
    - jsonld_input: "Schema JSON-LD a converter (texto ou arquivo)"
    - html_template: "Template HTML da página onde será inserido"
  optional:
    - entity_type: "Tipo principal (@type) se conhecido"
    - cms_context: "Informação sobre o CMS — afeta onde inserir os atributos"
outputs:
  - microdata_html_output.html
  - conversion_notes.md
```

## Objetivo

Converter schema JSON-LD em Microdata embutido no HTML, mantendo equivalência semântica completa. Usar quando o CMS não permite scripts no `<head>` ou quando Microdata é a única opção disponível (ex: e-mails HTML com Gmail Actions).

---

## Elicitation

Antes de converter:

1. **Schema JSON-LD:** Cole o schema JSON-LD que deve ser convertido
2. **Contexto HTML:** Qual é o elemento HTML raiz onde ficará a entidade? (article, div, section?)
3. **CMS:** Builder visual? Legado? Email HTML?
4. **Propriedades invisíveis permitidas?** O CMS permite inserir `<meta>` e `<link>` tags arbitrárias?

---

## Quando usar Microdata vs JSON-LD

```
USE MICRODATA quando:
  CMS legado sem acesso ao <head> ou <body> para scripts
  E-mails HTML (Gmail Actions suportam Microdata)
  Builder visual sem hook de head (ex: Webflow legacy, Wix antigo)
  Exigência de marcação inline no elemento (auditoria de conformidade)
  Schema deve ser visível na inspeção do DOM sem JavaScript

USE JSON-LD quando (default recomendado):
  Qualquer acesso ao <head> — preferir sempre
  Geração dinâmica de schema via servidor (SSR)
  Schema separado do HTML visual — mais fácil manter
  @graph com múltiplas entidades conectadas por @id

NUNCA usar ambos para a MESMA entidade na mesma página.
Se precisar de redundância: JSON-LD para entidade principal + Microdata apenas para dados de produto (Shopify legacy, por exemplo).
```

---

## Step 1: Mapeamento JSON-LD → Atributos Microdata

```
@context   → vocab="https://schema.org/" no elemento raiz (ou itemtype com URL completa)
@type      → itemtype="https://schema.org/{Type}" no elemento com itemscope
@id        → id="{slug}" no elemento (referência interna) — não tem equivalente direto no Microdata puro
propriedade simples → itemprop="{property}" no elemento filho
valor texto visível → conteúdo do elemento HTML
valor texto invisível → <meta itemprop="{prop}" content="{valor}">
valor URL visível  → href="{url}" em <a itemprop="{prop}">
valor URL invisível → <link itemprop="{prop}" href="{url}">
objeto aninhado  → itemscope itemtype="https://schema.org/{Type}" itemprop="{prop}"
enum/URL vocab  → <link itemprop="{prop}" href="https://schema.org/{EnumValue}">
array de valores → repetir itemprop para cada valor
```

---

## Step 2: Regras de Conversão com Exemplos

### REGRA 1: Elemento raiz com @type

```
JSON-LD: { "@type": "Article" }
Microdata: <article itemscope itemtype="https://schema.org/Article">
```

### REGRA 2: Propriedade texto visível

```
JSON-LD: { "headline": "Como fazer pão artesanal" }
Microdata: <h1 itemprop="headline">Como fazer pão artesanal</h1>
```

### REGRA 3: Propriedade data/valor invisível

```
JSON-LD: { "datePublished": "2026-05-14" }
Microdata: <meta itemprop="datePublished" content="2026-05-14">
OU preferível: <time itemprop="datePublished" datetime="2026-05-14T10:00:00-03:00">14 mai 2026</time>
```

### REGRA 4: URL como valor (invisível)

```
JSON-LD: { "url": "https://site.com/artigo" }
Microdata: <link itemprop="url" href="https://site.com/artigo">
```

### REGRA 5: URL como valor (visível)

```
JSON-LD: { "url": "https://site.com" }
Microdata: <a itemprop="url" href="https://site.com">site.com</a>
```

### REGRA 6: Entidade aninhada (objeto)

```
JSON-LD: { "author": { "@type": "Person", "name": "Maria Silva" } }
Microdata:
<span itemprop="author" itemscope itemtype="https://schema.org/Person">
  <span itemprop="name">Maria Silva</span>
</span>
```

### REGRA 7: Enum de vocabulário

```
JSON-LD: { "itemCondition": "https://schema.org/NewCondition" }
Microdata: <link itemprop="itemCondition" href="https://schema.org/NewCondition">

JSON-LD: { "availability": "https://schema.org/InStock" }
Microdata: <link itemprop="availability" href="https://schema.org/InStock">
```

### REGRA 8: Array de valores

```
JSON-LD: { "image": ["https://site.com/img1.jpg", "https://site.com/img2.jpg"] }
Microdata:
<meta itemprop="image" content="https://site.com/img1.jpg">
<meta itemprop="image" content="https://site.com/img2.jpg">
```

### REGRA 9: ImageObject aninhado

```
JSON-LD: { "image": { "@type": "ImageObject", "url": "foto.jpg", "width": 1200 } }
Microdata:
<span itemprop="image" itemscope itemtype="https://schema.org/ImageObject">
  <meta itemprop="url" content="foto.jpg">
  <meta itemprop="width" content="1200">
</span>
```

---

## Step 3: Exemplos Completos por Tipo

### ARTICLE (Blog Post)

```html
<!-- Article Microdata — gerado por @multiformat-engineer -->
<article itemscope itemtype="https://schema.org/Article">
  
  <!-- Metadados invisíveis -->
  <meta itemprop="datePublished" content="2026-05-14T10:00:00-03:00">
  <meta itemprop="dateModified" content="2026-05-14T10:00:00-03:00">
  <link itemprop="mainEntityOfPage" href="https://site.com/artigo/">
  
  <!-- Imagem -->
  <span itemprop="image" itemscope itemtype="https://schema.org/ImageObject">
    <img src="foto.jpg" alt="Descrição">
    <meta itemprop="url" content="https://site.com/foto.jpg">
    <meta itemprop="width" content="1200">
    <meta itemprop="height" content="630">
  </span>
  
  <!-- Headline -->
  <h1 itemprop="headline">Como fazer pão artesanal em casa</h1>
  
  <!-- Autor -->
  <span itemprop="author" itemscope itemtype="https://schema.org/Person">
    <span itemprop="name">Maria Silva</span>
    <link itemprop="url" href="https://site.com/autores/maria-silva/">
  </span>
  
  <!-- Publisher -->
  <span itemprop="publisher" itemscope itemtype="https://schema.org/Organization">
    <span itemprop="name">Nome do Site</span>
    <span itemprop="logo" itemscope itemtype="https://schema.org/ImageObject">
      <link itemprop="url" href="https://site.com/logo.png">
    </span>
  </span>
  
  <!-- Conteúdo -->
  <div itemprop="articleBody">
    <p>Conteúdo do artigo...</p>
  </div>

</article>
```

### PRODUCT (E-commerce)

```html
<!-- Product Microdata -->
<div itemscope itemtype="https://schema.org/Product">
  
  <h1 itemprop="name">Colar de Prata com Pingente</h1>
  
  <span itemprop="image" itemscope itemtype="https://schema.org/ImageObject">
    <img src="produto.jpg" alt="Colar de Prata">
    <meta itemprop="url" content="https://site.com/imagens/produto.jpg">
    <meta itemprop="width" content="800">
    <meta itemprop="height" content="800">
  </span>
  
  <p itemprop="description">Colar artesanal de prata 925 com pingente exclusivo.</p>
  
  <span itemprop="brand" itemscope itemtype="https://schema.org/Brand">
    <span itemprop="name">Majuli Joias</span>
  </span>
  
  <div itemprop="offers" itemscope itemtype="https://schema.org/Offer">
    <meta itemprop="priceCurrency" content="BRL">
    <span itemprop="price" content="149.90">R$ 149,90</span>
    <link itemprop="availability" href="https://schema.org/InStock">
    <link itemprop="itemCondition" href="https://schema.org/NewCondition">
    <link itemprop="url" href="https://site.com/produto/colar-prata/">
  </div>

</div>
```

### LOCAL BUSINESS

```html
<!-- LocalBusiness Microdata -->
<div itemscope itemtype="https://schema.org/LocalBusiness">
  
  <h1 itemprop="name">Majuli Joias</h1>
  <link itemprop="url" href="https://majulijoias.com.br/">
  <span itemprop="telephone">+55 11 99999-0000</span>
  
  <div itemprop="address" itemscope itemtype="https://schema.org/PostalAddress">
    <span itemprop="streetAddress">Rua das Flores, 100</span>,
    <span itemprop="addressLocality">São Paulo</span>
    <meta itemprop="addressRegion" content="SP">
    <meta itemprop="postalCode" content="01310-100">
    <meta itemprop="addressCountry" content="BR">
  </div>
  
  <span itemprop="openingHours" content="Mo-Fr 09:00-18:00">Seg a Sex: 9h às 18h</span>

</div>
```

---

## Step 4: Propriedades NÃO Conversíveis para Microdata

Algumas propriedades JSON-LD não têm equivalente Microdata simples:

| Propriedade JSON-LD | Problema | Alternativa |
|--------------------|---------|------------|
| `@id` (fragmento) | Microdata não tem @id nativo | Usar `id=""` HTML como referência local |
| `sameAs` (array) | Múltiplos links externos | Repetir `<link itemprop="sameAs" href="...">` para cada |
| `@graph` | Múltiplas entidades conectadas | Separar em blocos itemscope distintos |
| Valores aninhados com `@id` referência | Cross-reference entre nós | Não suportado — duplicar dados |

**Nota:** Para `@id` e entidades conectadas, JSON-LD é superior ao Microdata. Documentar estas limitações nas `conversion_notes.md`.

---

## Step 5: Verificação

```
Após gerar o Microdata, verificar:
  Cada @type tem itemscope + itemtype correto no mesmo elemento
  Todas as propriedades obrigatórias têm itemprop correspondente
  Valores invisíveis usam <meta content=""> ou <link href=""> (nunca apenas comentários)
  Entidades aninhadas têm itemscope + itemtype + itemprop no mesmo elemento
  Nenhuma propriedade duplicada para a mesma entidade
  Arrays corretos: repetir itemprop (não arrays JS)
  
Validadores:
  Schema.org Validator (modo HTML): https://validator.schema.org
  Rich Results Test (para tipos elegíveis): https://search.google.com/test/rich-results
  
Verificação SSR — Microdata DEVE aparecer no HTML raw:
  curl -s https://site.com/pagina | grep "itemtype"
  Resultado esperado: >= 1 linha com itemtype="https://schema.org/..."
```

---

## Output Entregue

1. `microdata_html_output.html` — Template HTML com todos os atributos Microdata inseridos
2. `conversion_notes.md` — Propriedades não convertíveis, razões, e alternativas recomendadas
3. Comando de validação (`curl` + URLs dos validadores)

---

## Quality Gates

- [ ] Cada `@type` do JSON-LD original tem `itemscope + itemtype` correspondente no HTML
- [ ] Todas as propriedades obrigatórias para rich results têm `itemprop`
- [ ] Valores invisíveis usam `<meta>` ou `<link>` (nunca apenas texto comentado)
- [ ] Entidades aninhadas têm `itemscope + itemtype + itemprop` no mesmo elemento
- [ ] Schema.org Validator (modo HTML): sem erros críticos
- [ ] Rich Results Test: ELIGIBLE (para tipos elegíveis ao tipo convertido)
- [ ] SSR verificado via `curl | grep itemtype` — deve retornar >= 1
- [ ] `conversion_notes.md` documenta propriedades não convertidas e razão

## Integração

- **Recebe de:** `generate-jsonld-template.md` (template JSON-LD como input), @schema-architect (schema aprovado)
- **Entrega para:** `inject-schema-cms.md` (código pronto para injeção no CMS), @kg-engineer (para injeção em CMS legado)
- **Alternativa a:** JSON-LD — usar apenas quando acesso ao `<head>` não é possível
