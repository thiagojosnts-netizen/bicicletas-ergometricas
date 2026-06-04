# Task: Enrich Entities API

```yaml
id: enrich-entities-api
agent: kg-engineer
version: "2.0"
elicit: true
estimated_duration: "20-60 min dependendo do tamanho do batch"
inputs:
  required:
    - entity_table_path: "Caminho para CSV com entidades sem Q-IDs"
  optional:
    - output_path: "Caminho do CSV enriquecido (default: mesmo dir + _enriched)"
    - batch_size: "integer (default: 50, max: 200 por execução)"
    - context_column: "Coluna do CSV com contexto de uso da entidade (melhora precisão)"
    - dry_run: "boolean — simula sem escrever output (default: false)"
outputs:
  - master_entity_table_enriched.csv
  - enrichment_report.md
  - needs_manual_review.csv
```

## Objetivo

Executar enriquecimento automático da master entity table via Wikidata API e SPARQL endpoint, populando Q-IDs, URLs Wikidata, URLs Wikipedia PT/EN e `instance_of` para entidades que ainda não têm esses dados, com revisão obrigatória dos resultados ambíguos.

---

## Elicitation

Antes de iniciar, coletar:

1. **CSV de entrada:** Qual arquivo contém as entidades? (caminho completo)
2. **Coluna de contexto:** Existe coluna com contexto de uso de cada entidade? (melhora precisão)
3. **Batch size:** Quantas entidades processar por execução? (default 50)
4. **Dry run?** Deseja simular primeiro sem salvar? (recomendado para primeiro uso)

---

## Step 1: Verificação da Estrutura do CSV de Entrada

O CSV de entrada deve ter pelo menos estas colunas:

```csv
entity_name,entity_type,context_in_site,wikidata_qid,enrichment_status
"Python","Topic","linguagem de programação usada em artigos de data science","","pending"
"Majuli Joias","Organization","marca de joias — Central Entity do site","","pending"
"João Silva","Person","autor dos artigos — especialista em SEO","","pending"
```

### Colunas obrigatórias:
- `entity_name` — nome da entidade como aparece no site
- `entity_type` — `Person | Organization | Place | Product | Topic`

### Colunas que serão preenchidas pelo script:
- `wikidata_qid`
- `wikidata_url`
- `wikipedia_pt_url`
- `wikipedia_en_url`
- `instance_of` (P31 do Wikidata)
- `enrichment_status` (`verified | auto_found_needs_review | not_found | already_had_qid`)
- `enrichment_note`

---

## Step 2: Script de Enriquecimento

```python
import requests
import csv
import time
import json
import sys
from urllib.parse import quote

# Garantir encoding UTF-8 no Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

WIKIDATA_API = "https://www.wikidata.org/w/api.php"
WIKIDATA_SPARQL = "https://query.wikidata.org/sparql"
RATE_LIMIT_DELAY = 0.5  # segundos entre requests

TYPE_TO_P31 = {
    "Person": "Q5",          # human
    "Organization": "Q43229", # organization
    "Place": "Q515",          # city / Q6256 country
    "Product": "Q2424752",    # product
    "Topic": None             # qualquer — usar busca textual
}

def search_wikidata_entity(entity_name, entity_type=None, context=None):
    """Busca entidade no Wikidata via API de busca textual."""
    params = {
        "action": "wbsearchentities",
        "search": entity_name,
        "language": "pt",
        "format": "json",
        "limit": 5,
        "type": "item"
    }
    
    r = requests.get(WIKIDATA_API, params=params, timeout=10,
                     headers={"User-Agent": "EntityEnricher/2.0 (schema-entity squad)"})
    
    if r.status_code != 200:
        return None, f"API error: {r.status_code}"
    
    results = r.json().get("search", [])
    if not results:
        return None, "not_found_in_search"
    
    # Verificar o primeiro resultado — se description condiz com context ou entity_type
    best = results[0]
    description = best.get("description", "").lower()
    
    # Heurística de desambiguação básica
    if context:
        context_words = context.lower().split()
        match_score = sum(1 for w in context_words if w in description)
        if match_score == 0 and len(results) > 1:
            # Tentar segundo resultado
            best = results[1]
            description = best.get("description", "").lower()
    
    return best.get("id"), f"auto_found: '{best.get('label', '')}' — {best.get('description', '')}"

def get_entity_details(qid):
    """Obtém detalhes completos de uma entidade Wikidata via API."""
    url = f"https://www.wikidata.org/wiki/Special:EntityData/{qid}.json"
    r = requests.get(url, timeout=10,
                     headers={"User-Agent": "EntityEnricher/2.0"})
    
    if r.status_code != 200:
        return {}
    
    data = r.json().get("entities", {}).get(qid, {})
    sitelinks = data.get("sitelinks", {})
    claims = data.get("claims", {})
    
    # Extrair P31 (instance of) — pegar o label do primeiro valor
    p31_values = []
    for claim in claims.get("P31", []):
        try:
            p31_qid = claim["mainsnak"]["datavalue"]["value"]["id"]
            p31_values.append(p31_qid)
        except (KeyError, TypeError):
            pass
    
    # Wikipedia PT e EN
    pt_title = sitelinks.get("ptwiki", {}).get("title", "")
    en_title = sitelinks.get("enwiki", {}).get("title", "")
    
    return {
        "wikidata_url": f"https://www.wikidata.org/wiki/{qid}",
        "wikipedia_pt_url": f"https://pt.wikipedia.org/wiki/{pt_title.replace(' ', '_')}" if pt_title else "",
        "wikipedia_en_url": f"https://en.wikipedia.org/wiki/{en_title.replace(' ', '_')}" if en_title else "",
        "instance_of": "|".join(p31_values[:3])  # máx 3 P31 values
    }

def enrich_entity(row, context_column=None):
    """Enriquece uma linha da master entity table."""
    entity_name = row.get("entity_name", "").strip()
    entity_type = row.get("entity_type", "").strip()
    existing_qid = row.get("wikidata_qid", "").strip()
    context = row.get(context_column, "") if context_column else ""
    
    # Já tem Q-ID verificado
    if existing_qid and existing_qid not in ("", "NOT_FOUND", "pending"):
        details = get_entity_details(existing_qid)
        return {
            **row,
            **details,
            "enrichment_status": "already_had_qid",
            "enrichment_note": f"Q-ID preexistente confirmado: {existing_qid}"
        }
    
    # Buscar Q-ID
    qid, note = search_wikidata_entity(entity_name, entity_type, context)
    time.sleep(RATE_LIMIT_DELAY)
    
    if qid is None:
        return {
            **row,
            "wikidata_qid": "NOT_FOUND",
            "wikidata_url": "",
            "wikipedia_pt_url": "",
            "wikipedia_en_url": "",
            "instance_of": "",
            "enrichment_status": "not_found",
            "enrichment_note": note
        }
    
    details = get_entity_details(qid)
    time.sleep(RATE_LIMIT_DELAY)
    
    return {
        **row,
        "wikidata_qid": qid,
        **details,
        "enrichment_status": "auto_found_needs_review",
        "enrichment_note": note
    }

def run_enrichment(input_path, output_path, batch_size=50, dry_run=False, context_column=None):
    """Pipeline principal de enriquecimento."""
    with open(input_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = list(reader)
        fieldnames = reader.fieldnames or []
    
    # Adicionar novas colunas se não existirem
    new_cols = ["wikidata_qid", "wikidata_url", "wikipedia_pt_url", "wikipedia_en_url",
                "instance_of", "enrichment_status", "enrichment_note"]
    all_fields = list(fieldnames) + [c for c in new_cols if c not in fieldnames]
    
    # Filtrar apenas pending
    pending = [r for r in rows if r.get("enrichment_status", "pending") in ("", "pending", "NOT_FOUND")]
    to_process = pending[:batch_size]
    
    print(f"Total entidades: {len(rows)}")
    print(f"Pendentes: {len(pending)}")
    print(f"Processando neste batch: {len(to_process)}")
    
    if dry_run:
        print("[DRY RUN] Nenhum arquivo será salvo.")
        return
    
    enriched_rows = []
    stats = {"already_had_qid": 0, "auto_found_needs_review": 0, "not_found": 0}
    
    for i, row in enumerate(rows):
        if row.get("enrichment_status", "pending") in ("", "pending", "NOT_FOUND") and i < batch_size:
            enriched = enrich_entity(row, context_column)
            enriched_rows.append(enriched)
            status = enriched.get("enrichment_status", "unknown")
            stats[status] = stats.get(status, 0) + 1
            print(f"[{i+1}/{len(to_process)}] {row['entity_name']} → {status}")
        else:
            enriched_rows.append(row)
    
    with open(output_path, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=all_fields, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(enriched_rows)
    
    print(f"\nSalvo em: {output_path}")
    print(f"Estatísticas: {stats}")
    return stats
```

---

## Step 3: Calibração Antes do Batch Completo

Testar com 5 entidades de referência conhecidas antes de processar o CSV completo:

```
Entidade: "Python" + context: "linguagem de programação"
→ Esperado: Q28865 (Python programming language)
→ FALHA se retornar: Q182378 (Python cobra) ou Q50018 (Python filme)

Entidade: "Apple" + context: "empresa de tecnologia"
→ Esperado: Q312 (Apple Inc.)
→ FALHA se retornar: Q89 (maçã) ou Q862581 (gravadora)

Entidade: "Amazon" + context: "e-commerce"
→ Esperado: Q3083799 (Amazon.com)
→ FALHA se retornar: Q3884 (rio Amazonas)
```

Se 2+ calibrações falharem: ajustar `context` nas linhas do CSV antes de rodar batch.

---

## Step 4: Revisão Obrigatória dos `auto_found_needs_review`

Para cada linha com `enrichment_status = auto_found_needs_review`:

1. Ler `enrichment_note` — descreve label e description do Q-ID encontrado
2. Acessar `wikidata_url` e verificar manualmente:
   - P31 (instance of) é compatível com `entity_type` no site?
   - Label PT (ou EN) é reconhecível como a entidade correta?
   - Não é homônimo (ex: "Mercury" elemento vs. planeta)
3. Tomar decisão:

```
APROVADO → alterar enrichment_status para "verified"
Q-ID ERRADO → corrigir wikidata_qid, alterar status para "verified"
AMBÍGUO → marcar enrichment_status = "REQUIRES_HUMAN_REVIEW", anotar em enrichment_note
NOT_FOUND → marcar wikidata_qid = "NOT_FOUND", status = "not_found"
```

### Template de arquivo de revisão manual (`needs_manual_review.csv`):

```csv
entity_name,auto_qid,auto_label,enrichment_note,review_decision,correct_qid,reviewer_note
"Mercury","Q925","Mercury (chemical element)","auto_found: chemical element","WRONG","Q308","Contexto é planeta Mercúrio"
"Python","Q28865","Python (programming language)","auto_found: programming language","APPROVED","Q28865",""
"Santos","Q170174","Santos FC","auto_found: football club","APPROVED","Q170174","Contexto é futebol"
```

---

## Step 5: Estratégia para `not_found`

Para entidades sem Q-ID no Wikidata, aplicar a decisão tree:

```
É Central Entity do site (marca, produto proprietário)?
├── SIM → Strategy B: @id interno apenas
│         "@id": "{domain}/sobre/#organization"
│         Sem sameAs externo
│         Considerar: criar item Wikidata (KG Engineering)
└── NÃO → É entidade secundária/mencionada?
          ├── SIM → Strategy D: sem @id, sem sameAs
          │         Mencionar normalmente no schema sem @id
          └── NÃO é relevante → Remover da lista de entidades
```

---

## Step 6: Gerar Relatório de Enriquecimento

```markdown
# Enrichment Report — {data}

## Resultado do Batch
- Total de entidades no arquivo: {N}
- Processadas neste batch: {N}
- Já tinham Q-ID (confirmadas): {N} ({pct}%)
- Auto-encontradas (precisam revisão): {N} ({pct}%)
- Não encontradas: {N} ({pct}%)

## Precisam Revisão Manual
| Entidade | Tipo | Q-ID Auto | Label Auto | Nota | Ação |
|----------|------|-----------|-----------|------|------|
| {nome} | {tipo} | {qid} | {label} | {note} | Verificar P31 |

## Não Encontradas no Wikidata
| Entidade | Motivo | Estratégia Recomendada |
|----------|--------|----------------------|
| {nome} | Empresa local/pequena | Strategy B — @id interno apenas |
| {nome} | Produto exclusivo | Strategy B |
| {nome} | Pessoa sem notoriedade pública | Strategy D (sem @id) |

## Próximos Passos
1. Revisar {N} entidades auto_found_needs_review em needs_manual_review.csv
2. Decidir estratégia para {N} entidades not_found
3. Executar próximo batch se pending > 0
4. Após revisão: versionar master_entity_table.csv com data
```

---

## Step 7: Versionamento da Master Table

```bash
# Após revisão completa:
cp master_entity_table_enriched.csv master_entity_table-2026-05-14.csv
cp master_entity_table_enriched.csv master_entity_table.csv
echo "Master table atualizada: $(wc -l < master_entity_table.csv) entidades"
```

---

## Quality Gates

- [ ] Script rodou sem erros críticos (exit code 0)
- [ ] Rate limiting respeitado — sem erro HTTP 429 da Wikidata API (verificar logs)
- [ ] Amostra de calibração (5 entidades) validada ANTES do batch completo
- [ ] 100% das entidades `auto_found_needs_review` revisadas manualmente por humano
- [ ] Zero Q-IDs incorretos na tabela final (verificar P31 de cada um)
- [ ] Estratégia definida para cada `not_found` (B ou D)
- [ ] Master table versionada com data no nome do arquivo
- [ ] `enrichment_report.md` gerado e compartilhado com @entity-disambiguator
- [ ] `needs_manual_review.csv` enviado ao responsável pela revisão humana

## Integração

- **Recebe de:** `map-entity-wikidata.md` (entidades já mapeadas individualmente), wf-entity-disambiguation (fase 3D)
- **Entrega para:** @entity-disambiguator (master table atualizada), `build-entity-hub.md` (Q-IDs verificados para sameAs)
- **Depende de:** master_entity_table.csv com colunas entity_name e entity_type preenchidas
