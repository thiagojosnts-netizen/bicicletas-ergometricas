# Task: Audit Schema Inventory

```yaml
id: audit-schema-inventory
agent: tech-seo-engineer
version: "2.0"
elicit: true
estimated_duration: "60-120 min para 50 URLs"
inputs:
  required:
    - site_url: "URL base do site (ex: https://site.com)"
    - sitemap_url: "URL do sitemap XML principal"
  optional:
    - sample_size: "integer (default: 50, max: 200)"
    - page_type_map: "CSV mapeando URL → tipo esperado (article, product, faq, etc.)"
    - focus_types: "Lista de @types a priorizar na auditoria"
outputs:
  - schema_inventory.csv
  - audit_report.md
  - score_by_page_type.csv
  - priority_actions.csv
```

## Objetivo

Realizar inventário completo do schema markup existente no site: identificar todos os tipos presentes, propriedades com gap, erros críticos e score 0-100 por URL — com diagnóstico semântico via framework Koray para conectar schema à estratégia de tópicos.

---

## Elicitation

Antes de iniciar:

1. **Site e sitemap:** URL base e URL do sitemap principal (ou index de sitemaps)
2. **Tamanho da amostra:** Quantas URLs auditar? (50 para diagnóstico inicial, 200 para auditoria completa)
3. **Foco específico?** Algum tipo de página prioritário? (ex: apenas produtos, apenas artigos)
4. **Diagnóstico semântico?** Deve @koray-semantic analisar os clusters temáticos? (recomendado sim)

---

## Step 1: Coleta de URLs via Sitemap

```python
import requests
import xml.etree.ElementTree as ET
import re

def get_urls_from_sitemap(sitemap_url, max_urls=200):
    """Coleta URLs do sitemap — suporta sitemap index e sitemaps individuais."""
    headers = {"User-Agent": "Mozilla/5.0 (compatible; SchemaAuditor/2.0)"}
    
    try:
        resp = requests.get(sitemap_url, timeout=10, headers=headers)
        resp.raise_for_status()
        content = resp.text
        
        # Detectar se é sitemap index ou sitemap normal
        if "<sitemapindex" in content:
            # Sitemap index — extrair sub-sitemaps
            root = ET.fromstring(resp.content)
            ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
            sub_sitemaps = [loc.text for loc in root.findall(".//sm:loc", ns)]
            
            all_urls = []
            for sub_url in sub_sitemaps[:5]:  # Máx 5 sub-sitemaps
                sub_urls = get_urls_from_sitemap(sub_url, max_urls=50)
                all_urls.extend(sub_urls)
                if len(all_urls) >= max_urls:
                    break
            return all_urls[:max_urls]
        
        else:
            # Sitemap normal — extrair <loc>
            root = ET.fromstring(resp.content)
            ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
            urls = [loc.text for loc in root.findall(".//sm:loc", ns)]
            return urls[:max_urls]
    
    except Exception as e:
        print(f"Erro ao processar sitemap {sitemap_url}: {e}")
        return []

def classify_page_type(url):
    """Infere tipo de página pela URL — heurística básica."""
    url_lower = url.lower()
    if any(x in url_lower for x in ["/blog/", "/artigo/", "/post/", "/news/"]):
        return "article"
    if any(x in url_lower for x in ["/produto/", "/product/", "/shop/", "/loja/"]):
        return "product"
    if any(x in url_lower for x in ["/faq", "/perguntas", "/ajuda"]):
        return "faq"
    if any(x in url_lower for x in ["/categoria/", "/category/", "/colecao/"]):
        return "collection"
    if url_lower.rstrip("/").count("/") <= 1:
        return "homepage"
    return "page"  # genérico
```

### Alternativa via Screaming Frog:
```
Screaming Frog SEO Spider:
1. Configuration → Custom → Search → Response → "application/ld+json"
2. Crawl do site
3. Exportar: Reports → Custom → application/ld+json Count
4. Identificar páginas com e sem schema
```

---

## Step 2: Extração e Inventário por URL

```python
import json

def extract_and_inventory(url, page_type=None):
    """Extrai schema de uma URL e gera linha de inventário."""
    headers = {"User-Agent": "Mozilla/5.0 (compatible; SchemaAuditor/2.0)"}
    
    try:
        r = requests.get(url, timeout=15, headers=headers)
        
        # Extrair blocos JSON-LD
        blocks = re.findall(
            r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
            r.text,
            re.DOTALL | re.IGNORECASE
        )
        
        ssr_verified = len(blocks) > 0
        types_found = []
        has_id = False
        has_sameas = False
        has_breadcrumb = False
        has_about = False
        parse_errors = []
        missing_required = []
        score = 0
        
        all_nodes = []
        
        for block in blocks:
            try:
                data = json.loads(block.strip())
                nodes = flatten_graph(data)
                all_nodes.extend(nodes)
            except json.JSONDecodeError as e:
                parse_errors.append(str(e)[:100])
        
        for node in all_nodes:
            if not isinstance(node, dict):
                continue
            
            node_type = node.get("@type", "")
            if isinstance(node_type, list):
                types_found.extend(node_type)
            else:
                types_found.append(node_type)
            
            if node.get("@id"):
                has_id = True
            if node.get("sameAs"):
                has_sameas = True
            if node_type == "BreadcrumbList":
                has_breadcrumb = True
            if node.get("about"):
                has_about = True
            
            # Verificar propriedades obrigatórias por tipo
            if node_type in ("Article", "BlogPosting", "NewsArticle"):
                for prop in ["headline", "datePublished", "image", "author"]:
                    if not node.get(prop):
                        missing_required.append(prop)
            
            elif node_type == "Product":
                for prop in ["name", "image", "description", "offers"]:
                    if not node.get(prop):
                        missing_required.append(prop)
            
            elif node_type == "FAQPage":
                if not node.get("mainEntity"):
                    missing_required.append("mainEntity")
        
        # Score básico
        if parse_errors:
            score = max(0, 10 - (len(parse_errors) * 5))
        else:
            score = 25  # base: tem schema e é parseable
            if ssr_verified:
                score += 15
            if has_id:
                score += 15
            if has_breadcrumb:
                score += 10
            if has_sameas:
                score += 10
            if has_about:
                score += 10
            if not missing_required:
                score += 15
            else:
                score += max(0, 15 - (len(missing_required) * 5))
            score = min(score, 100)
        
        if not blocks:
            score = 0
        
        return {
            "url": url,
            "http_status": r.status_code,
            "page_type": page_type or classify_page_type(url),
            "has_schema": len(blocks) > 0,
            "schema_types_found": "|".join(sorted(set(t for t in types_found if t))),
            "block_count": len(blocks),
            "ssr_verified": ssr_verified,
            "has_id": has_id,
            "has_sameas": has_sameas,
            "has_breadcrumb": has_breadcrumb,
            "has_about": has_about,
            "missing_required": "|".join(missing_required[:5]),
            "parse_errors": "|".join(parse_errors[:3]),
            "score": score,
            "grade": grade_from_score(score)
        }
    
    except Exception as e:
        return {
            "url": url,
            "http_status": 0,
            "page_type": page_type or classify_page_type(url),
            "has_schema": False,
            "schema_types_found": "",
            "block_count": 0,
            "ssr_verified": False,
            "has_id": False,
            "has_sameas": False,
            "has_breadcrumb": False,
            "has_about": False,
            "missing_required": "",
            "parse_errors": str(e)[:100],
            "score": 0,
            "grade": "Critico"
        }

def grade_from_score(score):
    if score >= 90: return "Excelente"
    if score >= 76: return "Bom"
    if score >= 61: return "Basico"
    if score >= 41: return "Ruim"
    return "Critico"

def flatten_graph(data):
    nodes = []
    if isinstance(data, list):
        for item in data:
            nodes.extend(flatten_graph(item))
    elif isinstance(data, dict):
        if "@graph" in data:
            for node in data["@graph"]:
                nodes.append(node)
        else:
            nodes.append(data)
    return nodes
```

---

## Step 3: Schema Inventory CSV

```csv
url,http_status,page_type,has_schema,schema_types_found,block_count,ssr_verified,has_id,has_sameas,has_breadcrumb,has_about,missing_required,parse_errors,score,grade
https://site.com/,200,homepage,true,"WebSite|Organization",2,true,true,true,false,false,"","",82,Bom
https://site.com/artigo-1,200,article,true,"Article|BreadcrumbList|WebPage",1,true,true,false,true,true,"dateModified|author_id","",71,Basico
https://site.com/produto-x,200,product,true,"Product",1,false,false,false,false,false,"image|offers","JSON parse error linha 45",25,Critico
https://site.com/faq,200,faq,false,"",0,false,false,false,false,false,"mainEntity","",0,Critico
```

---

## Step 4: Análise por Tipo de Página

```python
import statistics
from collections import defaultdict

def analyze_by_page_type(inventory_rows):
    """Agrupa métricas por tipo de página."""
    by_type = defaultdict(list)
    for row in inventory_rows:
        by_type[row["page_type"]].append(row)
    
    summary = []
    for page_type, rows in by_type.items():
        scores = [r["score"] for r in rows]
        missing_counts = defaultdict(int)
        for r in rows:
            for prop in r.get("missing_required", "").split("|"):
                if prop:
                    missing_counts[prop] += 1
        
        top_missing = sorted(missing_counts.items(), key=lambda x: -x[1])[:3]
        
        summary.append({
            "page_type": page_type,
            "url_count": len(rows),
            "score_avg": round(statistics.mean(scores), 1),
            "score_min": min(scores),
            "score_max": max(scores),
            "has_schema_pct": round(sum(1 for r in rows if r["has_schema"]) / len(rows) * 100, 1),
            "top_missing": ", ".join(f"{prop}({count})" for prop, count in top_missing),
            "critical_count": sum(1 for r in rows if r["score"] <= 40)
        })
    
    return sorted(summary, key=lambda x: x["score_avg"])
```

---

## Step 5: Diagnóstico Semântico — Framework Koray

Após inventário técnico, @koray-semantic analisa os dados com perspectiva de tópicos:

### Prompt para @koray-semantic:
```
Com base no schema_inventory.csv do site {site_url}, analise:

1. TOPICAL AUTHORITY:
   - Quais clusters temáticos têm schema mais completo vs. incompleto?
   - Os spokes do cluster principal têm `about` apontando para o hub da Central Entity?
   - Existe consistência de @type nos artigos do mesmo cluster?

2. SEMANTIC CONTENT NETWORK:
   - As páginas de hub têm `hasPart` linkando para os spokes?
   - Os spokes têm `about` linkando de volta para o hub?
   - Quantas páginas do cluster têm bidirectional linking implementado?

3. ENTITY COVERAGE:
   - Quais entidades do site aparecem em `about` ou `mentions` no schema?
   - Quais entidades importantes estão apenas no HTML (sem representação no schema)?

4. GAPS CRÍTICOS SEMÂNTICOS:
   - Qual cluster temático tem schema mais fraco vs. intenção de autoridade?
   - Quais páginas de alta prioridade estratégica têm score < 60?
```

---

## Step 6: Relatório de Auditoria

```markdown
# Schema Audit Report — {site_url} — {data}

## Executive Summary

- URLs auditadas: {N} de {N_total} mapeadas no sitemap
- **Com schema:** {N} ({pct}%)
- **Sem schema:** {N} ({pct}%)
- **PASS (score >= 76):** {N} ({pct}%)
- **WARN (score 61-75):** {N} ({pct}%)
- **Crítico (score <= 60):** {N} ({pct}%)
- **Score médio geral:** {X}/100

## Score por Tipo de Página
| Tipo | URLs | Score Médio | Mín | Máx | % com Schema | Principal Gap |
|------|------|------------|-----|-----|-------------|---------------|
| article | {N} | {X} | {min} | {max} | {pct}% | dateModified |
| product | {N} | {X} | {min} | {max} | {pct}% | offers |
| faq | {N} | {X} | {min} | {max} | {pct}% | mainEntity |
| homepage | {N} | {X} | {min} | {max} | {pct}% | sameAs |

## Top 10 Erros Mais Comuns
| Erro / Gap | Ocorrências | % das URLs | Impacto | Prioridade |
|-----------|------------|-----------|---------|-----------|
| Sem schema (score=0) | {N} | {pct}% | Sem rich results | P1 |
| datePublished ausente | {N} | {pct}% | Article não eligible | P1 |
| SSR falhou (JS-only) | {N} | {pct}% | Google não lê schema | P1 |
| @id ausente | {N} | {pct}% | Sem identidade no KG | P2 |
| image ausente | {N} | {pct}% | Sem rich result visual | P2 |
| sameAs ausente | {N} | {pct}% | Sem corroboração KG | P3 |
| about ausente | {N} | {pct}% | Sem entity hub linking | P3 |
| BreadcrumbList ausente | {N} | {pct}% | Sem breadcrumb rich | P3 |
| author sem @id | {N} | {pct}% | Autor sem identidade | P3 |
| dateModified ausente | {N} | {pct}% | Recência não sinalizada | P4 |

## Diagnóstico Semântico (Koray Framework)

### Topical Authority por Cluster
| Cluster Temático | URLs | Schema Score Médio | Bidirectional Links | Diagnóstico |
|-----------------|------|------------------|---------------------|-------------|
| {cluster_1} | {N} | {X} | {pct}% | Autoridade visual sem suporte semântico |
| {cluster_2} | {N} | {X} | {pct}% | Hub sem spokes linkados |

### Entidades Centrais no Schema
- Entidades com `about` apontando para hub: {N}
- Entidades importantes sem representação no schema: {lista}

## Prioridades de Implementação

### P1 — Máxima Urgência (48h)
1. Adicionar schema em {N} páginas sem markup (especialmente: {urls_exemplo})
2. Corrigir {N} erros de JSON parse (arquivos listados em priority_actions.csv)
3. Migrar {N} schemas de client-side para SSR

### P2 — Alta Prioridade (7 dias)
1. Adicionar `datePublished` em {N} Articles (bloqueia eligible status)
2. Adicionar `image` em {N} Articles e Products
3. Adicionar `@id` nas {N} páginas sem identidade no Knowledge Graph

### P3 — Prioridade Média (Sprint atual)
1. Implementar bidirectional linking em cluster {cluster_name}: {N} páginas
2. Adicionar `sameAs` para entidades com Q-ID verificado: {N} páginas
3. Implementar BreadcrumbList nas {N} páginas sem breadcrumb

### P4 — Melhorias (backlog)
1. Adicionar `author @id` em todos os Articles
2. Adicionar `dateModified` em artigos atualizados
3. Adicionar `speakable` para páginas de FAQ/How-to

## Impacto Estimado das Ações P1+P2
- Score médio atual: {X}/100
- Score médio projetado após P1+P2: {Y}/100
- Páginas que se tornarão eligible: ~{N} adicionais
```

---

## Output: priority_actions.csv

```csv
url,page_type,current_score,action_priority,action_type,action_description,estimated_score_gain,deadline,assigned_to
https://site.com/faq,faq,0,P1,add_schema,"Página sem schema — adicionar FAQPage schema",60,2026-05-16,schema-architect
https://site.com/produto-x,product,25,P1,fix_parse_error,"JSON inválido no bloco 1 — corrigir sintaxe",20,2026-05-16,tech-seo-engineer
https://site.com/artigo-3,article,55,P2,add_date_published,"datePublished ausente — bloqueia rich result",15,2026-05-21,dev-cms
```

---

## Quality Gates

- [ ] Amostra >= `min(sample_size, total_urls * 0.2)` URLs processadas
- [ ] Todos os tipos schema.org detectados catalogados no inventory.csv
- [ ] URLs sem schema identificadas (score = 0) e listadas em P1
- [ ] Erros de parse identificados por URL com linha do erro
- [ ] SSR verificado via HTTP (não apenas DevTools) para amostra
- [ ] Score calculado por URL com breakdown por dimensão
- [ ] `score_by_page_type.csv` gerado com métricas agregadas por tipo
- [ ] Diagnóstico semântico @koray-semantic executado (se solicitado)
- [ ] Prioridades de implementação definidas e ranqueadas por impacto
- [ ] `priority_actions.csv` gerado com responsáveis e prazos
- [ ] Relatório final aprovado por @schema-chief antes de distribuir

## Integração

- **Recebe de:** wf-schema-audit (fase 1 — discovery), sitemap do site
- **Entrega para:** wf-schema-implementation (lista priorizada), @schema-architect (templates a criar), @koray-semantic (diagnóstico de clusters)
- **Relacionado:** `score-page-schema.md` (scoring individual por URL), `validate-rich-results.md` (validação Rich Results por URL)
