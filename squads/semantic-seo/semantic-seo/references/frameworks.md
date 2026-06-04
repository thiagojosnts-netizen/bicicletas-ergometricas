# FRAMEWORKS — Análise e Criação de Conteúdo Semântico

> Frameworks estratégicos consolidados para análise, criação e otimização de conteúdo.

---

## 1. FRAMEWORK E.E.A.T.S. (Entity-Encoded Article Topical Structure)

Framework unificado de 7 camadas semânticas + 5 pilares de implementação. Modela o que o Google faz internamente: detectar entidades, identificar relações, avaliar completude, gerar embeddings, comparar com o subgrafo ideal do tópico.

### CAMADA 1: ENTITY LOCK-IN (peso 25%)

**Objetivo:** Criar embedding inicial que fixa a entidade-alvo de forma inequívoca.

**Checklist:**
- [ ] Entidade principal nomeada nos primeiros 100 palavras
- [ ] Definição curta e precisa (1-2 frases)
- [ ] Escopo delimitado (o que é / o que não é)
- [ ] Intenção primária estabelecida
- [ ] Problema central identificado

**Implementação prática:**
- H1 extremamente claro e contextual
- Primeiro parágrafo amarrando contexto + problema + região (se local)
- Seções que reforçam o mesmo macrotema com variações
- Sinais de localização bem amarrados (se SEO local)
- Nada pode "puxar" o contexto para outro assunto

**Erros comuns:** Misturar serviços/temas na mesma página. Seções genéricas ("Nossos serviços") listando múltiplos assuntos. Abrir grandes blocos sobre outros procedimentos.

**Diagnóstico:**

| Critério | Status | Evidência |
|----------|--------|-----------|
| Nomeação explícita | ✅/❌ | [trecho] |
| Definição presente | ✅/❌ | [trecho] |
| Escopo definido | ✅/❌ | [análise] |
| Intenção clara | ✅/❌ | [análise] |

**Impacto LSE:** Responsável por ~50% da coerência do embedding final. Sem Entity Lock-in claro, o modelo pode selecionar vetor base incorreto.

---

### CAMADA 2: ESSENTIAL ENTITY SET (peso 15%)

**Objetivo:** Introduzir subentidades obrigatórias que o espaço vetorial espera.

**Categorias de entidades essenciais:**
- **Partes:** componentes estruturais da entidade principal
- **Categorias:** classificações e taxonomias
- **Contextos:** ambientes onde a entidade opera
- **Mecanismos:** como a entidade funciona
- **Atributos fundamentais:** propriedades definidoras

**Matriz de cobertura:**

| Entidade Essencial | Categoria | Presente | Profundidade | Gap |
|--------------------|-----------|----------|--------------|-----|
| [entidade 1] | Parte | ✅/❌ | Alta/Média/Baixa | [descrição] |
| [entidade 2] | Mecanismo | ✅/❌ | Alta/Média/Baixa | [descrição] |
| [entidade N] | Contexto | ✅/❌ | Alta/Média/Baixa | [descrição] |

**Impacto LSE:** Ausência de entidades essenciais indica ao Google que o conteúdo carece de "semantic depth".

---

### CAMADA 3: ATTRIBUTE COVERAGE (peso 15%)

**Objetivo:** Preencher o vetor com atributos internos da entidade.

**Tipos de atributos:**

| Tipo | Descrição | Formato Ideal |
|------|-----------|--------------|
| Características fundamentais | Qualidades intrínsecas | Parágrafos descritivos |
| Classificações e tipos | Categorização formal | Tabelas comparativas |
| Parâmetros técnicos | Especificações | Listas técnicas |
| Variantes conhecidas | Diferentes formas | Definições de diferenças |
| Propriedades mensuráveis | Dados quantificáveis | Números com contexto |
| Requisitos e restrições | Regras, limites | Condições explícitas |

**Implementação prática (EAV):**

```
Entidade: [X]
├── Atributo: [A1] → Valor: [V1, V2, V3]
├── Atributo: [A2] → Valor: [V1, V2]
└── Atributo: [AN] → Valor: [V1]
```

Conectar atributos técnicos ao ângulo comercial: "Procedimentos com 2000 enxertos via técnica FUE, realizados com baixa taxa de transecção, têm valores a partir de £X."

**Impacto LSE:** Atributos são nós importantes no subgrafo. Densidade de atributos = precisão do embedding.

---

### CAMADA 4: RELATIONAL SEMANTICS (peso 10%)

**Objetivo:** Posicionar a entidade no espaço taxonômico.

**Mapeamento:**

| Relação | Definição | Presente | Evidência |
|---------|-----------|----------|-----------|
| Hiperônimo | Categoria superior (IS-A parent) | ✅/❌ | [citação] |
| Hipônimos | Subtipos (IS-A children) | ✅/❌ | [citação] |
| Co-hipônimos | Irmãos na mesma categoria | ✅/❌ | [citação] |
| Análogos | Entidades comparáveis | ✅/❌ | [citação] |
| Antônimos/Contrastes | Opostos e distinções | ✅/❌ | [citação] |

**Impacto LSE:** Embeddings do Google são relacionais, não isolados. Relações explícitas fortalecem posicionamento no Knowledge Graph. Camada ignorada pela maioria dos SEOs, mas onde o LSE trabalha pesado.

---

### CAMADA 5: INTENT COMPLETENESS (peso 15%)

**Objetivo:** Responder todas as intenções — explícitas e latentes.

**Intenções explícitas (SERP-derived):**

| Intenção | Template | Presente | Profundidade |
|----------|----------|----------|--------------|
| Definição | O que é X | ✅/❌ | Alta/Média/Baixa |
| Mecanismo | Como funciona X | ✅/❌ | Alta/Média/Baixa |
| Procedimento | Como fazer X | ✅/❌ | Alta/Média/Baixa |
| Tipologia | Tipos de X | ✅/❌ | Alta/Média/Baixa |
| Exemplificação | Exemplos de X | ✅/❌ | Alta/Média/Baixa |
| Avaliação | Vale a pena X | ✅/❌ | Alta/Média/Baixa |
| Comparação | X vs Y | ✅/❌ | Alta/Média/Baixa |
| Custo | Quanto custa X | ✅/❌ | Alta/Média/Baixa |

**Intenções latentes (inferidas):**

| Intenção Latente | Presente | Gap |
|------------------|----------|-----|
| Como escolher | ✅/❌ | [impacto] |
| Erros comuns | ✅/❌ | [impacto] |
| Limitações | ✅/❌ | [impacto] |
| Alternativas | ✅/❌ | [impacto] |
| Requisitos prévios | ✅/❌ | [impacto] |
| Quando não usar | ✅/❌ | [impacto] |

**Implementação comercial:** Se o usuário quer saber quanto custa, o que está incluso, qual técnica liga a qual preço, como contratar — a camada 5 resolve. Bloco específico de preço/fatores, tabelas de faixas, CTAs claramente comerciais.

**Impacto LSE:** Responder intenções latentes separa conteúdos "boas práticas" de conteúdos com topical authority real.

---

### CAMADA 6: CONTEXTUAL EMBEDDING (peso 10%)

**Objetivo:** Criar densidade contextual que estabiliza o embedding.

**Elementos:**

| Elemento | Presente | Quantidade | Qualidade |
|----------|----------|------------|-----------|
| Exemplos práticos | ✅/❌ | X | Alta/Média/Baixa |
| Cenários de aplicação | ✅/❌ | X | Alta/Média/Baixa |
| Erros comuns | ✅/❌ | X | Alta/Média/Baixa |
| Boas práticas | ✅/❌ | X | Alta/Média/Baixa |
| Passo a passo | ✅/❌ | X | Alta/Média/Baixa |
| Referências legítimas | ✅/❌ | X | Alta/Média/Baixa |

**Verbalização:** Cobrir a taxonomia de frases do nicho sem repetir a mesma expressão. Para cada intenção, criar variações naturais distribuídas em headings, parágrafos e FAQ. Usar sinônimos, reformulações e padrões de frase.

**Visualização:** Cada bloco de informação deve ter representação visual coerente. Diagramas comparativos, fotos com legenda semântica, timelines, tabelas de preço. Imagens devem reforçar o contexto principal (não genéricas de banco).

**Impacto LSE:** Contexto aumenta similaridade semântica, completude e chance de Featured Snippet.

---

### CAMADA 7: ENTITY LOOP CLOSURE (peso 10%)

**Objetivo:** Fechamento que reforça a entidade principal e cria coerência vetorial.

**Checklist:**
- [ ] Entidade principal reafirmada
- [ ] Atributos principais sintetizados
- [ ] Conexão com intenção inicial explícita
- [ ] Direção para ação presente (quando aplicável)
- [ ] Não introduz entidades novas no fechamento

**Impacto LSE:** Fechamento coerente diminui divergências semânticas e consolida o vetor final.

---

### SCORE E.E.A.T.S. CONSOLIDADO

| Camada | Peso | Score | Ponderado |
|--------|------|-------|-----------|
| 1. Entity Lock-in | 25% | X/10 | X |
| 2. Essential Entity Set | 15% | X/10 | X |
| 3. Attribute Coverage | 15% | X/10 | X |
| 4. Relational Semantics | 10% | X/10 | X |
| 5. Intent Completeness | 15% | X/10 | X |
| 6. Contextual Embedding | 10% | X/10 | X |
| 7. Entity Loop Closure | 10% | X/10 | X |
| **TOTAL** | 100% | — | **X/10** |

**Classificação de maturidade:**

| Score | Classificação | Significado |
|-------|-------------|-------------|
| 9-10 | Exemplar | Modela o subgrafo ideal do tópico |
| 7-8 | Avançado | Poucos gaps, alta probabilidade de ranking |
| 5-6 | Intermediário | Gaps identificáveis, otimização necessária |
| 3-4 | Básico | Estrutura semântica fraca, requer reescrita |
| 1-2 | Crítico | Não atende requisitos mínimos de LSE |

**Integração com Pipeline Google:**

| Camada Google | Camada E.E.A.T.S. |
|---------------|-------------------|
| 1. Processamento semântico | 1, 2, 3 |
| 2. Classificação de intenção | 5 |
| 3. Completude temática | 2, 5, 6 |
| 4-6. Qualidade/Autoridade/Comportamento | Externo ao LSE |
| 7. Ranking híbrido | Todas |

---

## 2. KORAY'S FRAMEWORKS

### 2.1 Topical Authority

Autoridade não vem de backlinks isolados, mas de cobertura semântica completa, consistente e conectada.

**Topical Map:** Ontologia editorial hierárquica — entidade central → subentidades → atributos → processos → problemas → comparações → limites.

**Coverage Depth & Breadth:**
- Breadth: quantos aspectos do tópico são cobertos
- Depth: quão profundamente cada aspecto é tratado
- Sites fracos: muitos artigos rasos. Sites fortes: poucos artigos, extremamente conectados e profundos.

**Semantic Distance Control:** Cada página deve estar semanticamente próxima da entidade central. Quanto mais distante, maior o risco de diluir autoridade. Influencia arquitetura, links internos e decisão do que não publicar.

### 2.2 Semantic Content Network

O Google avalia redes semânticas de documentos, não páginas isoladas. Um site é interpretado como um grafo de significados.

**Nodes:** Cada página = nó semântico com entidades, intenção, sub-intenções, atributos.
**Edges:** Links internos definem relações semânticas (hierarquia, dependência, complementaridade).
**Directionality:** Páginas fundamentais recebem links. Páginas específicas apontam para pilares.

### 2.3 Search Intent & Query Templates

Google trabalha com templates de consulta. Uma query raramente representa uma única intenção. Boa página: satisfaz intenção dominante + antecipa secundárias + responde perguntas implícitas.

### 2.4 Information Gain

O buscador favorece documentos que adicionam nova informação ao índice. Information Gain = quanto o conteúdo reduz a incerteza do sistema.

| Dimensão | Score | Justificativa |
|----------|-------|---------------|
| Novidade factual | X/10 | [detalhe] |
| Profundidade analítica | X/10 | [detalhe] |
| Aplicabilidade prática | X/10 | [detalhe] |
| Diferenciação vs SERP | X/10 | [detalhe] |

### 2.5 Contextual Relevance & Term Weighting

Não importa quantas vezes um termo aparece, mas onde, em que contexto e em relação a quais entidades. Termos devem aparecer em seções logicamente coerentes. Definições precedem usos. Exemplos reforçam conceitos. Comparações delimitam significado.

### 2.6 Entity-Oriented Content

Google pensa em entidades e fatos. Bom conteúdo introduz entidades → define atributos → explica relações → conecta com entidades conhecidas.

### 2.7 Temporal & Historical Consistency

Motores avaliam consistência ao longo do tempo. Sites que mudam discurso, publicam tendências sem base ou contradizem artigos antigos perdem confiança semântica.

---

## 3. GEO (Generative Engine Optimization)

### 3.1 Citabilidade por LLMs

| Critério | Status | Evidência |
|----------|--------|-----------|
| Resumo inicial (após H1, 2-3 frases) | ✅/❌ | [citação] |
| Definições curtas e citáveis | ✅/❌ | [citação] |
| Frases com condições explícitas | ✅/❌ | [citação] |
| Números com contexto | ✅/❌ | [citação] |
| Listas/tabelas estruturadas | ✅/❌ | [citação] |
| Entity Loop Closure | ✅/❌ | [citação] |

Para RAG: não usar pronomes vagos em parágrafos-chave. Repetir Entidade Nomeada para que, se o parágrafo for extraído isoladamente (chunking), mantenha sentido.

### 3.2 Compressibilidade

Conteúdo deve ser condensável sem perder nuances. Mínimo de implícitos. Terminologia consistente (evitar trocar nomes para o mesmo conceito). Estrutura modular com blocos reutilizáveis.

### 3.3 Evidência e Rastreabilidade

Referências/fontes citadas. Metodologia explícita. Data de atualização. Escopo delimitado.

### 3.4 COINC Score Estimado

| Componente | Valor | Justificativa |
|------------|-------|---------------|
| POS_SIM | X | Σ(FSW × SAF) para matches |
| NEG_SIM | X | Σ(FSW) × penalty para não relevante |
| COINC | X | POS_SIM - NEG_SIM |

---

## 4. FASES DE ANÁLISE OPERACIONAL

### Fase 1: Extração e Mapeamento Estrutural

- Metadados: Title (50-60 chars), Description (150-160 chars), Canonical, OG, Schema
- Hierarquia semântica: árvore H1→H2→H3
- Links: internos (cluster/fora), externos (authoritatives), anchors
- Densidade informacional: palavras totais, por seção, ratio conteúdo/código

### Fase 2: SEO Técnico e Sinais de Qualidade

| Elemento | Critérios |
|----------|----------|
| Title | 50-60 chars, keyword nos primeiros 20, marca ao final |
| Description | 150-160 chars, keyword natural, CTA, valor único |
| URL | 3-5 palavras, keyword, hifens, sem parâmetros |
| H1 | Único, alinhado com intenção, entidade principal, diferente do title |
| Hierarquia | Sequência lógica, sem pulos, H2=aspecto, H3=atributo |
| Schema | Tipo adequado, propriedades obrigatórias, dados válidos |

### Fase 3: Análise LSE (Framework E.E.A.T.S.)

Aplicar as 7 camadas do Framework E.E.A.T.S. (seção 1 deste documento).

### Fase 4: Intent Completeness

Intenções explícitas (SERP-derived) + intenções latentes (inferidas). Ver camada 5 do E.E.A.T.S.

### Fase 5: GEO Analysis

Citabilidade, compressibilidade, evidência, COINC estimado. Ver seção 3 deste documento.

### Fase 6: Information Gain

Originalidade: ângulos não óbvios, dados próprios, framework original, relações causais, exemplos únicos. Score por dimensão.

### Fase 7: Semantic Distance Control

| Seção | Distância da Entidade Central | Risco |
|-------|------------------------------|-------|
| [Seção X] | Próxima/Média/Distante | Baixo/Médio/Alto |

Métricas: aspectos cobertos, profundidade média, seções tangenciais (ideal: 0-1).

### Fase 8: Semantic Content Network

Links internos como arestas semânticas. Tipos: definição base, dependência, complementaridade, hierarquia. Recomendações: adicionar/remover/modificar links com justificativa semântica.

### Fase 9: Power Keywords Integration

Identificar clusters presentes e ausentes. Ver REFERENCE_DATA para lista completa de clusters.

### Fase 10: Checklist de Modificações

Priorização: Críticas (impacto imediato) → Importantes (impacto médio) → Recomendadas (refinamento).

### Dashboard Final (Síntese)

**Score Consolidado E.E.A.T.S.** (7 camadas ponderadas)

**Scores Complementares:** SEO Técnico, Semantic Distance, COINC Estimado, Topical Authority Potential.

**Resultado SERP Esperado:**

| Tipo | Probabilidade | Justificativa |
|------|-------------|---------------|
| Featured Snippet | Alta/Média/Baixa | [razão] |
| PAA | Alta/Média/Baixa | [razão] |
| Top 3 Orgânico | Alta/Média/Baixa | [razão] |
| Citação em AI Overview | Alta/Média/Baixa | [razão] |

**Top 3 Ações de Maior Impacto** com justificativa LSE/GEO/Information Gain.

---

## 5. MODO REESCRITA

Para cada seção a otimizar:

```
## SEÇÃO: [Nome]

### TEXTO ATUAL
[texto original]

### ANÁLISE LSE/GEO
- Entidade foco: [X]
- Entity Lock-in: [presente/ausente]
- Atributos ausentes: [lista]
- LSIs a adicionar: [lista]
- Citabilidade GEO: [alta/média/baixa]
- Information Gain: [alto/médio/baixo]

### TEXTO OTIMIZADO
[texto reescrito]

### CHANGELOG
| Modificação | Justificativa Semântica |
|-------------|------------------------|
| [mod 1] | [razão LSE/MTT/GEO] |
```

---

## 6. MODO COMPARAÇÃO

Matriz comparativa conteúdo atual vs concorrente:

| Dimensão | Atual | Concorrente | Vantagem |
|----------|-------|-------------|----------|
| Entity Lock-in | X/10 | X/10 | [quem] |
| Essential Entities | X/10 | X/10 | [quem] |
| Attribute Coverage | X/10 | X/10 | [quem] |
| Intent Completeness | X/10 | X/10 | [quem] |
| GEO Citabilidade | X/10 | X/10 | [quem] |
| Information Gain | X/10 | X/10 | [quem] |

Identificar gaps competitivos → recomendar ações para superar.
