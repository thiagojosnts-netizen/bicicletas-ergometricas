# Task: Map Entity Wikidata

```yaml
id: map-entity-wikidata
agent: entity-disambiguator
version: "2.0"
elicit: true
estimated_duration: "10-20 min por entidade"
inputs:
  required:
    - entity_name: "Nome da entidade como aparece no site"
    - entity_context: "Contexto de uso no site (em que tipo de conteúdo é mencionada)"
  optional:
    - site_domain: "URL base do site (para busca por website no Wikidata)"
    - entity_type_hint: "Tipo esperado: Person|Organization|Place|Product|Topic"
    - language: "Idioma preferencial de busca (default: pt)"
outputs:
  - entity_mapping.json
  - master_entity_table_update.csv
```

## Objetivo

Mapear uma entidade específica do site para seu Q-ID Wikidata e URL Wikipedia canônica, resolvendo qualquer ambiguidade com base no contexto de uso, e definir a estratégia sameAs correta.

---

## Elicitation

Antes de iniciar, coletar:

1. **Nome da entidade:** Exatamente como aparece no site (incluindo capitalização)
2. **Contexto:** Em que tipo de conteúdo é mencionada? (artigos de blog, página de produto, etc.)
3. **Tipo esperado:** É uma Pessoa, Empresa, Lugar, Conceito, Produto?
4. **Possível ambiguidade?** O nome pode se referir a mais de uma coisa?
5. **Domínio do site:** Para busca por P856 (official website) no Wikidata

---

## Step 1: Busca Inicial no Wikidata

### Estratégia de Busca (ordem de preferência):

```
ESTRATÉGIA 1 — Busca textual direta (Wikidata Search):
  URL: https://www.wikidata.org/w/index.php?search={entity_name}&ns0=1
  Buscar exatamente como aparece no site.
  Se muitos resultados: refinar com contexto (ex: "Santos futebol clube")

ESTRATÉGIA 2 — SPARQL por nome (Person):
  SELECT ?item ?itemLabel ?birthDate ?description WHERE {
    ?item wdt:P31 wd:Q5 .
    ?item rdfs:label "{entity_name}"@pt .
    OPTIONAL { ?item wdt:P569 ?birthDate . }
    SERVICE wikibase:label { bd:serviceParam wikibase:language "pt,en" . }
  } LIMIT 10

ESTRATÉGIA 3 — SPARQL por website (Organization):
  SELECT ?item ?itemLabel ?website WHERE {
    ?item wdt:P856 ?website .
    FILTER(CONTAINS(STR(?website), "{domain_keyword}"))
    SERVICE wikibase:label { bd:serviceParam wikibase:language "pt,en" . }
  } LIMIT 5

ESTRATÉGIA 4 — SPARQL por nome (Organization):
  SELECT ?item ?itemLabel ?description WHERE {
    ?item wdt:P31 ?type .
    ?type wdt:P279* wd:Q43229 .
    ?item rdfs:label "{entity_name}"@pt .
    SERVICE wikibase:label { bd:serviceParam wikibase:language "pt,en" . }
  } LIMIT 10

ESTRATÉGIA 5 — Busca em EN se PT não funcionar:
  Traduzir {entity_name} para inglês e repetir estratégias 1-4
```

### Endpoint SPARQL:
```
https://query.wikidata.org/sparql?query={SPARQL_URL_ENCODED}&format=json
```

---

## Step 2: Verificação do Q-ID Candidato

Para CADA Q-ID candidato encontrado, verificar OBRIGATORIAMENTE:

### Checklist de Verificação (Jason Barnard Protocol):

```
P31 (instance of) — CRÍTICO:
  □ Person: P31 = Q5 (human)?
  □ Organization: P31 = Q4830453 (business) ou Q43229 (organization)?
  □ Country: P31 = Q6256?
  □ City: P31 = Q515 ou P31 = Q3957 (municipality)?
  □ Software: P31 = Q7397 (software)?
  □ Brand: P31 = Q431289 (brand)?

P279 (subclass of) — Verificar hierarquia:
  □ A hierarquia faz sentido para o contexto do site?

Labels e Descrições:
  □ Label PT (ou EN) reconhecível como a entidade correta?
  □ Descrição condiz com contexto de uso no site?

P856 (official website) — Para Organizations:
  □ URL aponta para o domínio do site sendo auditado?
  □ OU URL aponta para o website da entidade sendo buscada?

Sitelinks:
  □ Tem artigo Wikipedia PT (ptwiki)?
  □ Tem artigo Wikipedia EN (enwiki)?
  □ Wikipedia não é disambiguation page?
```

### Critérios de Aprovação:

```
✅ Q-ID APROVADO se:
   - P31 corresponde ao tipo esperado
   - Label em PT (ou EN) é reconhecível
   - Descrição condiz com contexto de uso no site
   - Nenhum sinal de homônimo (nomes diferentes na descrição)

❌ Q-ID REJEITADO se:
   - P31 é tipo diferente do esperado (ex: Person quando esperava Organization)
   - É homônimo errado (Santos FC vs cidade de Santos)
   - Q-ID é para disambiguation page do Wikidata (P31 = Q4167410)
   - Entidade está marcada como "deleted" ou "merged"

⚠️ Q-ID AMBIGUOUS — marcar para revisão humana se:
   - Múltiplos candidatos com mesmo nome e tipo similar
   - Descrição vaga — pode ser a entidade ou outra similar
   - Label em PT está errado mas EN parece certo (pode ser erro no Wikidata)
```

---

## Step 3: Exemplos Práticos BR

### CASOS COMUNS DE AMBIGUIDADE NO BRASIL:

```
CASO 1 — "Santos":
  Q170174 = Santos FC (clube de futebol)
  Q180911 = Santos (município, SP)
  Resolução: verificar contexto — site de esportes → Q170174

CASO 2 — "Palmeiras":
  Q44454 = Sociedade Esportiva Palmeiras
  Palmeiras (município) = Q1094022
  Resolução: contexto de futebol → Q44454

CASO 3 — "Python":
  Q28865 = Python (linguagem de programação)
  Q182378 = Python (gênero de cobra)
  Q50018 = Python (filme 2000)
  Resolução: site de tecnologia → Q28865

CASO 4 — "Apple":
  Q312 = Apple Inc. (empresa de tecnologia)
  Q89 = apple (fruta, maçã)
  Q862581 = Apple (gravadora)
  Resolução: contexto de tech → Q312

CASO 5 — "Amazon":
  Q3884 = Amazon (rio)
  Q3884 = Amazon.com (empresa) → Q3083799
  Resolução: e-commerce → Q3083799

CASO 6 — "Lula" (político):
  Q2007 = Luiz Inácio Lula da Silva
  Lula (personagem de animação) = Q167
  Resolução: contexto político → Q2007
```

---

## Step 4: Wikipedia Canônica

Após encontrar Q-ID verificado, obter URLs Wikipedia:

```python
import requests

def get_wikipedia_urls(qid):
    """Obtém URLs Wikipedia PT e EN via Wikidata API."""
    url = f"https://www.wikidata.org/wiki/Special:EntityData/{qid}.json"
    r = requests.get(url, timeout=10)
    data = r.json()['entities'][qid]
    sitelinks = data.get('sitelinks', {})
    
    pt_wiki = sitelinks.get('ptwiki', {})
    en_wiki = sitelinks.get('enwiki', {})
    
    return {
        'wikipedia_pt_url': f"https://pt.wikipedia.org/wiki/{pt_wiki.get('title', '').replace(' ', '_')}" if pt_wiki else None,
        'wikipedia_en_url': f"https://en.wikipedia.org/wiki/{en_wiki.get('title', '').replace(' ', '_')}" if en_wiki else None,
        'wikidata_url': f"https://www.wikidata.org/wiki/{qid}"
    }
```

### Verificar que a URL não é:
- Página de redirecionamento (redirect)
- Página de desambiguação (detectar: título contém "(desambiguação)")
- Página deletada ou movida

---

## Step 5: Definir Estratégia sameAs

```
DECISION TREE:

É a Central Entity do site E tem hub interno planejado?
├── SIM → Estratégia C (ambos):
│         "@id": "{domain}/entidades/{slug}/#entity"
│         "sameAs": ["https://www.wikidata.org/wiki/{Q-ID}", "{wikipedia_url}"]
│
└── NÃO → Tem Q-ID verificado?
          ├── SIM → É entidade proprietária (produto/serviço exclusivo)?
          │        ├── SIM → Estratégia B (interno apenas):
          │        │         "@id": "{domain}/entidades/{slug}/#entity"
          │        └── NÃO → Estratégia A (externo apenas):
          │                  "sameAs": ["{wikidata_url}", "{wikipedia_url}"]
          └── NÃO → Estratégia D (sem mapeamento):
                    Não adicionar @id nem sameAs para esta entidade
                    Documentar como NOT_FOUND com razão
```

---

## Step 6: Documentar na Master Table

```csv
entity_name,entity_type,context_in_site,wikidata_qid,wikidata_url,wikipedia_pt_url,wikipedia_en_url,sameas_strategy,internal_hub_planned,internal_hub_url,schema_type,confidence_score,priority,status,reviewer_notes
```

### Exemplo de linha preenchida:
```csv
"Majuli Joias","Organization","Marca de joias — é a Central Entity do site","Q_NOT_FOUND","","","","B","true","/sobre/#organization","Organization","LOW","P1","pending","Q-ID não encontrado no Wikidata — empresa local pequena. Usar strategy B apenas."
```

---

## Step 7: Casos Especiais

### Entidade SEM Q-ID Verificável:
```
Situação: Empresa local pequena, produto exclusivo, pessoa pouco conhecida
Ação: Documentar como NOT_FOUND + razão
Strategy: B (internal @id apenas) se for Central Entity, D se for secundária
Considerar: Criar item Wikidata para a Central Entity (ação de KG Engineering)
```

### Entidade com Artigo Wikipedia APENAS em EN (sem PT):
```
Ação: Usar EN como sameAs secundário
Nota no schema:
  "sameAs": [
    "https://www.wikidata.org/wiki/{Q-ID}",
    "https://en.wikipedia.org/wiki/{artigo}"
  ]
Registrar: "Wikipedia PT ausente — usar EN + documentar no master table"
```

### Entidade AMBÍGUA — Requer Revisão Humana:
```
Ação: NÃO assumir Q-ID — marcar como REQUIRES_HUMAN_REVIEW
Output: {entity_name: "", candidates: [{qid, description, why_uncertain}], status: "AMBIGUOUS"}
```

---

## Output Format

```json
{
  "entity_name": "Majuli Joias",
  "entity_type": "Organization",
  "context_in_site": "Central Entity — marca de joias brasileira",
  "search_strategies_used": ["P856 SPARQL", "text search"],
  "wikidata_qid": "NOT_FOUND",
  "wikidata_url": null,
  "wikipedia_pt_url": null,
  "wikipedia_en_url": null,
  "sameas_strategy": "B",
  "sameas_urls": [],
  "internal_hub_planned": true,
  "internal_hub_url": "/sobre/#organization",
  "schema_type": "Organization",
  "confidence_score": "LOW",
  "status": "pending_implementation",
  "notes": "Empresa local. Q-ID não encontrado. Considerar criar item Wikidata.",
  "master_table_row": "Majuli Joias,Organization,Central Entity,NOT_FOUND,,,B,true,/sobre/#organization,Organization,LOW,P1,pending,Empresa local sem Q-ID"
}
```

---

## Quality Gates

- [ ] Busca realizada com pelo menos 2 estratégias antes de declarar NOT_FOUND
- [ ] Q-ID verificado via checklist (P31, label, descrição) — NUNCA assumido
- [ ] P31 (instance of) confere com tipo schema.org planejado
- [ ] URL Wikipedia é canônica (não redirect, não disambiguation page)
- [ ] Ambiguidade documentada se detectada com lista de candidatos
- [ ] Estratégia sameAs definida com justificativa clara
- [ ] Linha adicionada à master entity table com todos os campos
- [ ] Para AMBIGUOUS: marcar como REQUIRES_HUMAN_REVIEW (nunca escolher sem certeza)

## Integração

- **Recebe de:** wf-schema-audit (fase 2), wf-entity-disambiguation (fase 3B)
- **Entrega para:** @entity-disambiguator (master table), @schema-architect (sameAs nos templates)
- **Usa:** Wikidata SPARQL endpoint + API de entidade
