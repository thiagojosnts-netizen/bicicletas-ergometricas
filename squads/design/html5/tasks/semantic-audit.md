# Task: Semantic Audit

**Task ID:** semantic-audit
**Executor:** Hybrid (kashimo diagnóstico → hakari análise)
**Purpose:** Auditoria completa de semântica HTML5 de site existente
**Output:** Relatório com Grade, Cursed Energy Score e roadmap de fixes

---

## Inputs

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `target` | string | Sim | URL ou HTML do site |
| `scope` | enum | Sim | `quick` (1 template) ou `full` (todos) |
| `output_format` | enum | Não | `report` (padrão) ou `fixes` (código corrigido) |

---

## Preconditions

- [ ] Site ou HTML acessível
- [ ] Kashimo ativo (Tier 0)
- [ ] Hakari ativo (Tier 1)

---

## Passos

### STEP 1: Cursed Energy Scan (kashimo)

```
1.1 Executar SAAP-001: Document Outline
    → Extrair heading hierarchy completa
    → Detectar: headings pulados, múltiplos H1, headings ausentes
    → CE gerada por violação (20CE por heading skip, etc.)

1.2 Executar SAAP-002: Landmark Audit
    → Verificar presença: header, nav, main, aside, footer
    → CE gerada por ausência (20CE por landmark ausente)

1.3 Executar SAAP-003: Content Model
    → Verificar article/section/div usage
    → CE por div onde elemento semântico existe (+15CE cada)

1.4 Executar SAAP-004: Interactive Elements
    → Verificar button vs a, div onclick
    → CE por div onclick (+25CE cada — CRÍTICO)

1.5 Executar SAAP-005: Media Semantics
    → Verificar alt text, figure/figcaption
    → CE por imagem sem alt (+30CE — BLOQUEANTE)

1.6 Calcular Total CE → Determinar Grade
```

### STEP 2: Detailed Semantic Analysis (hakari)

```
2.1 Para cada heading violation:
    → Mostrar: elemento atual | elemento correto | CE removida
    → Gerar: código corrigido

2.2 Para cada landmark violation:
    → Mostrar: o que está faltando | onde deve ser adicionado
    → Gerar: HTML com landmark correto

2.3 Para cada content model violation:
    → Mostrar: <div class="artigo"> → deveria ser <article>
    → Aplicar: Sukuna Finger rating

2.4 Para cada form violation:
    → Mostrar: input sem label | label correto a adicionar
    → Gerar: HTML corrigido com label e aria-describedby

2.5 Para cada Schema.org ausência:
    → Identificar: qual tipo corresponde à página
    → Gerar: JSON-LD template para o tipo
```

### STEP 3: Grade Report

```
3.1 Calcular Grade Final:
    CE 0     → Special Grade ✨
    CE 1-50  → Grade 1
    CE 51-150 → Grade 2
    CE 151-300 → Grade 3
    CE > 300  → Grade 4

3.2 Calcular Sukuna Fingers total

3.3 Priorizar fixes:
    → Critical (10+ dedos): BLOQUEANTE — fix agora
    → High (5-9 dedos): fix antes de launch
    → Medium (3-4 dedos): próximo sprint
    → Low (1-2 dedos): backlog

3.4 Estimar esforço:
    → Quick fix: < 1h
    → Standard fix: 1-4h
    → Major fix: > 4h (considerar Domain Expansion)
```

---

## Outputs

### Quick Mode Output

```markdown
# Semantic Audit — [Nome do Site]
**Grade Atual:** Grade 3
**Cursed Energy:** 247 CE
**Sukuna Fingers:** 38
**Recomendação:** Fix 3 Critical issues → Grade 1

## Critical Issues (Bloqueia Deploy)
1. [10 dedos] 4 imagens sem alt — Fix em 20min
2. [10 dedos] 2 formulários sem labels — Fix em 45min

## High Issues
3. [5 dedos] Skip link ausente — Fix em 5min
4. [5 dedos] Focus ring removido — Fix em 10min

## Path to Special Grade
Esforço estimado: 3-4h
```

### Full Mode Output

Report completo com código corrigido para cada violação.

---

## Validation

- [ ] Grade calculado corretamente (CE → Grade table)
- [ ] Sukuna Fingers somados corretamente
- [ ] Código corrigido gerado para Critical e High issues
- [ ] Schema.org identificado para tipo de página
- [ ] Path to Special Grade definido com estimativa de esforço
