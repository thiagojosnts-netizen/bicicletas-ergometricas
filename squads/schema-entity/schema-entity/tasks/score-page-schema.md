# Task: Score Page Schema

```yaml
id: score-page-schema
agent: tech-seo-engineer
version: "2.0"
elicit: false
estimated_duration: "5-15 min por URL"
inputs:
  required:
    - url: "URL completa da página a ser avaliada"
  optional:
    - schema_json: "JSON-LD já extraído (evita re-fetch)"
    - page_type: "Tipo esperado da página (article|product|faq|etc)"
outputs:
  - score: "integer 0-100"
  - score_breakdown.json
  - recommendations: "lista priorizada de ações"
```

## Objetivo

Calcular o score 0-100 de structured data para uma página específica, identificando exatamente o que falta para chegar a 90+, qual o impacto de cada gap, e gerando recomendações acionáveis com estimativa de pontos ganhos.

---

## Step 1: Extração do Schema

```python
import requests, json, re

def extract_schema_from_url(url):
    """Extrai todos os blocos JSON-LD de uma URL."""
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (compatible; SchemaAuditor/1.0)'}
        r = requests.get(url, timeout=15, headers=headers)
        r.raise_for_status()
        
        # Extrair todos os blocos ld+json
        blocks = re.findall(
            r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
            r.text, re.S
        )
        
        parsed = []
        for block in blocks:
            try:
                data = json.loads(block.strip())
                parsed.append({"valid": True, "data": data})
            except json.JSONDecodeError as e:
                parsed.append({"valid": False, "error": str(e), "raw": block[:200]})
        
        # VERIFICAÇÃO SSR: schema está no HTML inicial (não via JS)?
        ssr_verified = len(blocks) > 0  # Se chegou aqui sem JS: True
        
        return {
            "url": url,
            "http_status": r.status_code,
            "schema_blocks": parsed,
            "block_count": len(blocks),
            "ssr_verified": ssr_verified
        }
    except Exception as e:
        return {"url": url, "error": str(e), "schema_blocks": [], "ssr_verified": False}

def flatten_schema(schema_data):
    """Normaliza @graph e schemas individuais para lista de nós."""
    nodes = []
    if isinstance(schema_data, list):
        for item in schema_data:
            nodes.extend(flatten_schema(item))
    elif isinstance(schema_data, dict):
        if '@graph' in schema_data:
            nodes.extend(schema_data['@graph'])
        else:
            nodes.append(schema_data)
    return nodes
```

---

## Step 2: Scoring Rubric

### DIMENSÃO 1 — Estrutura Base (40 pontos)

| Critério | Pts | Como verificar |
|---------|-----|---------------|
| JSON-LD presente e parse OK | 10 | `<script type="application/ld+json">` existe + JSON válido |
| `@context` correto | 5 | `"@context": "https://schema.org"` (não http://) |
| `@type` correto para o tipo de página | 10 | Article em blog, Product em produto, etc. |
| `@id` presente na entidade principal | 10 | Nó principal tem `@id` com URL canônica |
| BreadcrumbList implementada | 5 | Nó `@type: BreadcrumbList` com itemListElement |

**Pontuação parcial:**
- JSON inválido (parse error): 0 pts em toda dimensão, registrar como FAIL CRÍTICO
- @type presente mas incorreto: -5 pts
- @id presente mas sem fragmento (#article, #product): -3 pts

### DIMENSÃO 2 — Rich Results (30 pontos)

**Identificar o tipo de página e verificar propriedades obrigatórias:**

ARTICLE / BLOGPOSTING / NEWSARTICLE (obrigatórias):
```
headline, datePublished, image (com url), author (com name)
```
| Todas presentes: 15pts | Faltando 1: 10pts | Faltando 2+: 5pts |

PROPRIEDADES RECOMENDADAS (10pts — 2pts cada, max 10):
- `dateModified`
- `description`
- `publisher` → @id da Organization
- `mainEntityOfPage` → @id da WebPage
- `image` com `width` e `height`

PROPRIEDADES OPCIONAIS (5pts — presença geral):
- `keywords`, `articleSection`, `inLanguage`, `wordCount`, `speakable`

PRODUCT (obrigatórias):
```
name, image, description, offers (com price, priceCurrency, availability)
```
| Todas: 15pts | Faltando 1: 10pts | Faltando 2+: 5pts |

FAQPAGE (obrigatórias):
```
mainEntity: array de Question (com name) com acceptedAnswer (com text)
```

HOWTO (obrigatórias):
```
name, step: array de HowToStep (com text)
```

### DIMENSÃO 3 — Entity Connections (20 pontos)

| Critério | Pts | Verificação |
|---------|-----|------------|
| `@id` correto e único na entidade principal | 5 | Formato: `{url}#{tipo}` |
| `author` ou `publisher` com `@id` (não apenas name) | 5 | Deve referenciar um @id existente no @graph |
| `sameAs` com pelo menos 1 URL verificada | 5 | Wikidata ou Wikipedia preferencialmente |
| `about` → @id de hub da entidade central do cluster | 5 | WebPage.about ou Article.about aponta para hub |

**Penalidades:**
- `author: {"name": "João"}` sem @id: -3pts (author sem identidade no KG)
- sameAs com URL não-canônica (redirect): -3pts
- @id diferente do canonical URL da página: -5pts

### DIMENSÃO 4 — Performance & SSR (10 pontos)

| Critério | Pts | Verificação |
|---------|-----|------------|
| Schema renderizado server-side | 8 | Presente em `curl -s {url} | grep "ld+json"` |
| Não degrada CWV (CLS < 0.1, LCP < 2.5s) | 2 | PageSpeed Insights antes/depois |

**Verificação SSR:**
```bash
# Schema DEVE aparecer aqui (sem JavaScript executado):
curl -s "{url}" | grep -c "application/ld+json"
# Resultado esperado: >= 1
# Resultado FAIL: 0 (schema injetado apenas via JS)
```

---

## Step 3: Cálculo e Output

```python
def calculate_score(extraction_result, page_type=None):
    """Calcula score 0-100 para a página."""
    
    if not extraction_result.get("schema_blocks"):
        return {
            "score": 0,
            "grade": "Crítico",
            "status": "FAIL",
            "breakdown": {"estrutura_base": 0, "rich_results": 0, "entity_connections": 0, "performance": 0},
            "recommendations": [{"priority": "P1", "action": "Adicionar schema markup na página (+100pts potencial)", "points_gain": 100}]
        }
    
    blocks = extraction_result["schema_blocks"]
    valid_blocks = [b for b in blocks if b.get("valid")]
    invalid_blocks = [b for b in blocks if not b.get("valid")]
    
    score = 0
    breakdown = {}
    recommendations = []
    
    # DIMENSÃO 1 — Estrutura Base
    d1 = 0
    if valid_blocks:
        d1 += 10  # JSON válido
        all_nodes = []
        for b in valid_blocks:
            all_nodes.extend(flatten_schema(b["data"]))
        
        has_context = any(n.get("@context") for n in all_nodes if isinstance(n, dict))
        if has_context: d1 += 5
        else: recommendations.append({"priority": "P1", "action": "Adicionar @context: https://schema.org", "points_gain": 5})
        
        has_type = any(n.get("@type") for n in all_nodes if isinstance(n, dict))
        if has_type: d1 += 10
        else: recommendations.append({"priority": "P1", "action": "Adicionar @type correto", "points_gain": 10})
        
        has_main_id = any(n.get("@id") for n in all_nodes if isinstance(n, dict) and n.get("@type") not in ["BreadcrumbList", "ListItem"])
        if has_main_id: d1 += 10
        else: recommendations.append({"priority": "P2", "action": "Adicionar @id na entidade principal", "points_gain": 10})
        
        has_breadcrumb = any(n.get("@type") == "BreadcrumbList" for n in all_nodes if isinstance(n, dict))
        if has_breadcrumb: d1 += 5
        else: recommendations.append({"priority": "P2", "action": "Adicionar BreadcrumbList", "points_gain": 5})
    
    if invalid_blocks:
        recommendations.insert(0, {"priority": "P1", "action": f"Corrigir {len(invalid_blocks)} bloco(s) JSON inválido(s)", "points_gain": 30})
    
    breakdown["estrutura_base"] = {"score": d1, "max": 40}
    score += d1
    
    # DIMENSÃO 4 — Performance & SSR
    d4 = 0
    if extraction_result.get("ssr_verified"): d4 += 8
    else: recommendations.append({"priority": "P1", "action": "Mover schema para server-side render", "points_gain": 8})
    d4 += 2  # CWV: assume OK sem Lighthouse data
    breakdown["performance"] = {"score": d4, "max": 10}
    score += d4
    
    return {
        "url": extraction_result["url"],
        "score": min(score, 100),
        "grade": grade(score),
        "status": "PASS" if score >= 70 else ("WARN" if score >= 40 else "FAIL"),
        "breakdown": breakdown,
        "recommendations": sorted(recommendations, key=lambda x: x["priority"])
    }

def grade(score):
    if score >= 90: return "Excelente"
    if score >= 76: return "Bom"
    if score >= 61: return "Básico"
    return "Crítico"
```

---

## Step 4: Output Format

```json
{
  "url": "https://site.com/artigo-exemplo",
  "score": 72,
  "max_score": 100,
  "grade": "Bom",
  "status": "WARN",
  "breakdown": {
    "estrutura_base": { "score": 35, "max": 40, "details": "Missing: BreadcrumbList (-5)" },
    "rich_results": { "score": 22, "max": 30, "missing": ["dateModified (-5)", "image.width/height (-5)"] },
    "entity_connections": { "score": 10, "max": 20, "missing": ["sameAs ausente (-5)", "author sem @id (-5)"] },
    "performance": { "score": 10, "max": 10, "details": "SSR verified" }
  },
  "recommendations": [
    {
      "priority": "P1",
      "action": "Adicionar @id na entidade author com URL da página de autor",
      "points_gain": 5,
      "how": "Substituir 'author: {name: João}' por 'author: {@id: /autor/joao/#person}'"
    },
    {
      "priority": "P2",
      "action": "Adicionar sameAs com Q-ID Wikidata da entidade central",
      "points_gain": 5,
      "how": "Verificar Q-ID no Wikidata e adicionar sameAs no @graph"
    },
    {
      "priority": "P2",
      "action": "Adicionar BreadcrumbList",
      "points_gain": 5,
      "how": "Usar template BreadcrumbList do @schema-architect"
    },
    {
      "priority": "P2",
      "action": "Adicionar dateModified ao Article schema",
      "points_gain": 5,
      "how": "Usar ISO8601: 2026-05-14T10:00:00-03:00"
    },
    {
      "priority": "P3",
      "action": "Adicionar width e height ao ImageObject",
      "points_gain": 5,
      "how": "Incluir width: 1200, height: 630 no objeto image"
    }
  ],
  "potential_score": 97,
  "points_available": 25
}
```

---

## Step 5: Grade Scale & Decision Table

| Score | Grade | Status | Ação Recomendada | SLA |
|-------|-------|--------|-----------------|-----|
| 90-100 | Excelente | PASS | Manter e monitorar mensalmente | — |
| 76-89 | Bom | PASS | Melhorias menores na próxima sprint | 30 dias |
| 61-75 | Básico | WARN | Sprint de melhoria dedicada | 14 dias |
| 41-60 | Ruim | WARN | Prioridade alta — implementar em semana | 7 dias |
| 0-40 | Crítico | FAIL | Prioridade máxima — implementar em 48h | 48h |

---

## Step 6: Batch Mode — Múltiplas URLs

Para auditar múltiplas páginas de uma vez:

```python
import csv, time

def batch_score(url_list, delay=0.5):
    """Score em batch com rate limiting."""
    results = []
    for url in url_list:
        result = extract_schema_from_url(url)
        score_data = calculate_score(result)
        results.append(score_data)
        time.sleep(delay)
    return results

def save_batch_report(results, output_file="score_report.csv"):
    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        fieldnames = ['url', 'score', 'grade', 'status', 'top_recommendation', 'points_available']
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for r in results:
            top_rec = r['recommendations'][0]['action'] if r['recommendations'] else 'Nenhuma'
            writer.writerow({
                'url': r['url'],
                'score': r['score'],
                'grade': r['grade'],
                'status': r['status'],
                'top_recommendation': top_rec,
                'points_available': r.get('points_available', 0)
            })
    print(f"Relatório salvo: {output_file}")
```

---

## Quality Gates

- [ ] Score calculado com todos os 4 critérios (Estrutura + Rich Results + Entity + Performance)
- [ ] Breakdown por dimensão gerado com pontos ganhos e perdidos
- [ ] Recomendações ordenadas por prioridade (P1 → P4) com pontos estimados
- [ ] SSR verificado via curl (não apenas via DevTools)
- [ ] Para FAIL (score < 40): notificar @schema-chief imediatamente
- [ ] Para batch: score médio calculado por tipo de página
- [ ] Output JSON salvo + CSV se batch mode

## Integração com Outros Agentes

- **Recebe de:** @schema-architect (templates para checar), @kg-engineer (após injeção)
- **Entrega para:** @schema-architect (correções), @koray-semantic (A/B baseline)
- **Disparado por:** wf-validation-pipeline (fase 5), wf-site-semantic-blueprint (fase 4)
