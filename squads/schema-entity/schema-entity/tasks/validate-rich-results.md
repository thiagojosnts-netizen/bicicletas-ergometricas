# Task: validate-rich-results

## Metadata

```yaml
id: validate-rich-results
agent: tech-seo-engineer
version: "2.0"
elicit: false
estimated_duration: "2-5 min por URL, 30-60 min para batch de 50"
inputs:
  required:
    - url_list: "file ou list (URLs para validar)"
  optional:
    - validation_mode: "enum [full, quick, gsc-only] — default: full"
    - schema_json: "JSON-LD já extraído (evita re-fetch para URLs conhecidas)"
    - page_type_map: "CSV mapeando URL → tipo esperado de página"
outputs:
  - validation_report.md
  - errors_to_fix.csv
  - score_summary.csv
```

## Objetivo

Validar o schema markup implementado via Rich Results Test, Schema.org Validator e GSC, identificando erros críticos e gerando relatório de priorização com scores 0-100 por URL e por tipo de página.

---

## Elicitation

Esta task tem `elicit: false` — executa sem perguntas usando os inputs fornecidos.
Se `url_list` não fornecido, solicitar ao chamador antes de iniciar.

---

## Step 1: Extração de Schema por URL

Antes de validar, extrair o schema raw de cada URL via curl (SSR-safe):

```python
import requests, re, json

def extract_schema_from_url(url):
    """Extrai JSON-LD via HTTP puro — valida SSR."""
    headers = {
        'User-Agent': 'Mozilla/5.0 (compatible; SchemaValidator/2.0; +https://schema-entity/validate)'
    }
    try:
        r = requests.get(url, timeout=15, headers=headers)
        r.raise_for_status()
        
        blocks = re.findall(
            r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
            r.text,
            re.DOTALL | re.IGNORECASE
        )
        
        parsed = []
        errors = []
        for i, block in enumerate(blocks):
            try:
                data = json.loads(block.strip())
                parsed.append({"index": i, "valid": True, "data": data})
            except json.JSONDecodeError as e:
                errors.append({"index": i, "error": str(e), "raw": block[:300]})
        
        return {
            "url": url,
            "http_status": r.status_code,
            "ssr_verified": len(blocks) > 0,
            "block_count": len(blocks),
            "valid_blocks": parsed,
            "parse_errors": errors,
            "html_snippet": r.text[:500]  # para debug de SSR
        }
    except requests.RequestException as e:
        return {"url": url, "error": str(e), "ssr_verified": False, "block_count": 0, "valid_blocks": [], "parse_errors": []}

def flatten_graph(schema_data):
    """Normaliza @graph e schemas individuais para lista plana de nós."""
    nodes = []
    if isinstance(schema_data, list):
        for item in schema_data:
            nodes.extend(flatten_graph(item))
    elif isinstance(schema_data, dict):
        if '@graph' in schema_data:
            for node in schema_data['@graph']:
                nodes.append(node)
        else:
            nodes.append(schema_data)
    return nodes
```

**IMPORTANTE:** Sempre verificar SSR — schema injetado via JavaScript não aparece no `curl`.

```bash
# Verificação rápida de SSR via CLI:
curl -s "https://site.com/artigo" | grep -c "application/ld+json"
# Resultado >= 1: SSR OK
# Resultado 0: schema client-side apenas — FAIL crítico
```

---

## Step 2: Rich Results Test — Validação por URL

### URLs de Teste (não automatizáveis — requer acesso manual ou Playwright):

```
Rich Results Test: https://search.google.com/test/rich-results?url={URL}
Schema.org Validator: https://validator.schema.org/#url={URL}
```

### Critérios de Classificação por Status:

```
PASS:   Status = "Eligible for rich results", zero erros bloqueantes, schema válido
WARN:   Status = "Eligible for rich results", mas com avisos não-bloqueantes
FAIL:   Status = "Not eligible" OU erros bloqueantes detectados
ERROR:  Ferramenta retorna erro de fetch/parse (URL inacessível, timeout)
```

### Tabela de Erros Comuns e Causas:

| Erro Google | Causa Provável | Fix |
|-------------|---------------|-----|
| Missing field "datePublished" | Campo obrigatório ausente | Adicionar ao Article schema |
| "image" must be specified | Propriedade image ausente | Adicionar ImageObject com URL válida |
| Either "offers", "review" or "aggregateRating" is required | Product sem offers | Adicionar offers com price + priceCurrency |
| "acceptedAnswer" must be of type "Answer" | FAQPage malformada | Corrigir structure de Question/Answer |
| "name" field is required | Entidade sem name | Adicionar campo name |
| Could not determine the primary entity of the page | Sem mainEntity ou estrutura confusa | Definir entidade principal com mainEntityOfPage |
| Invalid URL | URL no schema com espaço ou caractere inválido | Sanitizar URLs nos campos @id e url |
| Value must be a valid date | datePublished em formato inválido | Usar ISO 8601: 2026-05-14T10:00:00-03:00 |

---

## Step 3: Scoring Rubric — 0 a 100

### DIMENSÃO 1 — Estrutura Base (40 pontos)

```python
def score_estrutura_base(nodes, parse_errors):
    """Avalia estrutura fundamental do schema."""
    score = 0
    details = []
    
    if parse_errors:
        details.append(f"FAIL CRITICO: {len(parse_errors)} bloco(s) com JSON inválido")
        return 0, details  # Parse error zera dimensão inteira
    
    if nodes:
        score += 10  # JSON parse OK
        
        # @context
        has_context = any(
            n.get("@context") in ["https://schema.org", "http://schema.org"]
            for n in nodes if isinstance(n, dict)
        )
        if has_context:
            score += 5
            details.append("@context: OK")
        else:
            details.append("MISS @context: -5pts")
        
        # @type correto (não generic Thing ou WebPage em artigo)
        main_types = [n.get("@type") for n in nodes if isinstance(n, dict) and n.get("@type")]
        if main_types:
            score += 10
            details.append(f"@type detectado: {main_types}")
        else:
            details.append("MISS @type: -10pts")
        
        # @id na entidade principal
        non_structural_types = ["BreadcrumbList", "ListItem", "WebSite"]
        main_nodes = [n for n in nodes if isinstance(n, dict) and n.get("@type") not in non_structural_types]
        if any(n.get("@id") for n in main_nodes):
            score += 10
            details.append("@id: OK na entidade principal")
        else:
            details.append("MISS @id: -10pts (entidade sem identidade no Knowledge Graph)")
        
        # BreadcrumbList
        has_breadcrumb = any(n.get("@type") == "BreadcrumbList" for n in nodes if isinstance(n, dict))
        if has_breadcrumb:
            score += 5
            details.append("BreadcrumbList: OK")
        else:
            details.append("MISS BreadcrumbList: -5pts")
    
    return score, details

# Pontuação parcial permitida — exceto parse error (score 0 imediato)
```

### DIMENSÃO 2 — Rich Results (30 pontos)

```
ARTICLE / BLOGPOSTING obrigatórias para eligible:
  headline (max 110 chars), datePublished (ISO 8601), image (url), author (name)
  → Todas presentes: 15pts | 1 ausente: 10pts | 2+ ausentes: 5pts | nenhuma: 0pts

RECOMENDADAS (2pts cada, max 10pts):
  dateModified, description, publisher com @id, mainEntityOfPage, image com width+height

OPCIONAIS (1pt cada, max 5pts):
  keywords, articleSection, inLanguage, wordCount, speakable

PRODUCT obrigatórias:
  name, image, description, offers{price, priceCurrency, availability}
  → Avaliação igual ao Article acima

FAQPAGE obrigatórias:
  mainEntity: array de Question{name} com acceptedAnswer{text}
  → Todas Questions com Answer: 15pts | partial: proporcional

LOCALBUSINESS obrigatórias:
  name, address{streetAddress, addressLocality, addressRegion, postalCode}
  → + telephone e openingHoursSpecification para elegibilidade completa
```

### DIMENSÃO 3 — Entity Connections (20 pontos)

```
@id com fragmento correto (#article, #person, #product): +5pts
  Penalidade: @id sem fragmento: -3pts
  
author/publisher com @id (não apenas name): +5pts
  Penalidade: author: {"name": "X"} sem @id: -3pts (identidade perdida no KG)
  
sameAs com URL verificada (Wikidata ou Wikipedia): +5pts
  Penalidade: sameAs com redirect ou URL não-canônica: -3pts
  
about → @id de entity hub: +5pts
  Critério: WebPage.about ou Article.about aponta para @id de hub interno
```

### DIMENSÃO 4 — SSR e Performance (10 pontos)

```
Schema no HTML inicial (curl confirma): +8pts
  Verificação: curl -s {url} | grep -c "ld+json" >= 1

CWV não degradado: +2pts
  Critério: schema não bloqueia LCP, não causa layout shift
  Verificação: PageSpeed Insights antes/depois da implementação
```

---

## Step 4: Priorização de Erros

```
P1 (Crítico — SLA 48h):
  - Erros que bloqueiam rich results completamente
  - JSON parse error em qualquer bloco
  - Schema não-SSR (client-side apenas)
  - @type ausente ou incorreto para tipo de página

P2 (Alto — SLA 7 dias):
  - Propriedades obrigatórias ausentes (headline, datePublished, image, author)
  - @id ausente na entidade principal
  - offers ausente em Product

P3 (Médio — SLA próxima sprint):
  - Propriedades recomendadas ausentes (dateModified, publisher @id)
  - author sem @id (name apenas)
  - BreadcrumbList ausente

P4 (Baixo — SLA backlog):
  - Propriedades opcionais ausentes (keywords, wordCount, speakable)
  - image sem width/height
  - inLanguage ausente
```

---

## Step 5: Relatório Final

```markdown
# Validation Report — {site_domain} — {data}

## Resumo Executivo
- URLs testadas: {N}
- PASS (rich results eligible): {N} ({pct}%)
- WARN (eligible com avisos): {N} ({pct}%)
- FAIL (not eligible): {N} ({pct}%)
- ERROR (inacessível/timeout): {N} ({pct}%)
- Score médio geral: {X}/100
- Melhor tipo de página: {tipo} (score médio {Y})
- Tipo mais crítico: {tipo} (score médio {Z})

## Erros Críticos P1 — Ação em 48h
| URL | Tipo Schema | Erro | Ação Imediata |
|-----|------------|------|---------------|
| {url} | Article | JSON parse error bloco 2 | Corrigir sintaxe JSON na linha {N} |
| {url} | Product | Schema client-side apenas | Mover JSON-LD para server-side render |

## Avisos P2 — Ação em 7 dias
| URL | Campo Ausente | Impacto | Fix |
|-----|--------------|---------|-----|

## Score por Tipo de Página
| Tipo | URLs | Score Médio | Principal Gap | Próxima Ação |
|------|------|------------|---------------|-------------|

## Score por Dimensão (agregado)
| Dimensão | Score Médio | Max | % Atingido |
|----------|------------|-----|-----------|
| Estrutura Base | {X}/40 | 40 | {pct}% |
| Rich Results | {X}/30 | 30 | {pct}% |
| Entity Connections | {X}/20 | 20 | {pct}% |
| SSR + Performance | {X}/10 | 10 | {pct}% |

## Roadmap de Correção
Sprint 1 (48h): Erros P1 — {N} páginas
Sprint 2 (7d): Erros P2 — {N} páginas
Sprint 3 (30d): Melhorias P3/P4 — {N} páginas
```

## Output: errors_to_fix.csv

```csv
url,page_type,schema_type,error_priority,error_category,error_description,suggested_fix,deadline,responsible_agent
https://site.com/artigo-1,article,Article,P1,parse_error,"JSON inválido no bloco 1 — virgula extra na linha 45","Remover vírgula após último campo do objeto",2026-05-16,tech-seo-engineer
https://site.com/produto-x,product,Product,P1,ssr_fail,"Schema não aparece em curl — injetado via JS","Mover <script ld+json> para template SSR",2026-05-16,dev-cms
https://site.com/artigo-2,article,Article,P2,missing_required,"datePublished ausente","Adicionar datePublished em formato ISO 8601",2026-05-21,schema-architect
```

## Output: score_summary.csv

```csv
url,page_type,score,grade,status,estrutura_base,rich_results,entity_connections,performance,ssr_verified,top_issue,points_available
https://site.com/artigo-1,article,72,Bom,WARN,35,22,10,5,true,"author sem @id",28
https://site.com/produto-x,product,25,Critico,FAIL,0,15,10,0,false,"JSON inválido + sem SSR",75
```

---

## Modo Quick vs Full

### Quick Mode (apenas URLs com score < 70):
```python
def quick_mode_filter(results):
    """Prioriza apenas URLs que precisam de atenção imediata."""
    return [r for r in results if r.get("score", 100) < 70]
```

### GSC-Only Mode (sem validação de schema, apenas GSC):
```
Google Search Console → Melhorias → Dados estruturados
Filtrar por: Tipo → Erros → Exportar CSV
Focar em: Erros críticos (bloqueantes), não em avisos
```

---

## Quality Gates

- [ ] Todas as URLs da lista testadas (zero skipped sem registro)
- [ ] SSR verificada via curl para cada URL (não DevTools)
- [ ] Score calculado com todos os 4 critérios por URL
- [ ] Erros P1 identificados, priorizados e atribuídos com SLA de 48h
- [ ] Score médio calculado por tipo de página
- [ ] `errors_to_fix.csv` gerado com todos os campos preenchidos
- [ ] `score_summary.csv` gerado com breakdown por dimensão
- [ ] `validation_report.md` gerado e enviado para @schema-architect e @koray-semantic
- [ ] Para score médio < 50: escalação imediata para @schema-chief

## Integração

- **Recebe de:** wf-validation-pipeline (fase 5), wf-schema-implementation (pós-deploy)
- **Entrega para:** @schema-architect (correções de template), @koray-semantic (A/B hypothesis baseline)
- **Dispara:** `score-page-schema.md` para URLs individuais que precisam de diagnóstico detalhado
