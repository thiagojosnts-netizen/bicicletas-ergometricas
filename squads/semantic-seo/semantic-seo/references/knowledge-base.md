# KNOWLEDGE BASE — Busca Semântica, Entidades e Recuperação de Informação

> Base técnica unificada. Fontes: Patentes US20140032522A1 (Kikin), US2016/0147878A1 (Inbenta), US2023/0214412A1 (Exeter), US2006/0242140A1 (Content Analyst), US11769017B1 (Google SGE), papers Google DeepMind/Research.

---

## 1. ARQUITETURA DE BUSCA SEMÂNTICA

### 1.1 Da Busca por Strings à Busca por Entidades

Motores de busca modernos transitaram de keyword matching para entity understanding. O sistema não varre strings — localiza o cluster conceitual mais próximo no espaço vetorial.

**Keyword Search:** Query → string matching → documentos com termos exatos.
**Semantic Search:** Query → desambiguação via contexto → recuperação de entidade → ranking por similaridade vetorial → síntese.

A unidade atômica deixou de ser a palavra e passou a ser a **Entidade Semântica**: pessoa, lugar, objeto ou conceito abstrato com identidade única, independente das palavras usadas para descrevê-la. Diferencia-se de uma keyword por possuir atributos e relações fixas.

### 1.2 Pipeline de 7 Camadas do Google

O ranking moderno opera em camadas sequenciais e interdependentes:

| Camada | Função | Tecnologia |
|--------|--------|-----------|
| 1. Processamento semântico | Embeddings, entidades, desambiguação | LSE, BERT, MUM |
| 2. Classificação de intenção | Informacional, comercial, navegacional | Classificadores de intent |
| 3. Avaliação de completude | Cobertura do tópico, topical completeness | Modelos de cobertura |
| 4. Qualidade editorial | Helpful Content, E-E-A-T | Modelos de quality rating |
| 5. Autoridade | Links, reputação, histórico | Sinais linkográficos |
| 6. Sinais comportamentais | CTR, dwell time, satisfação | Dados de uso |
| 7. Ranking final híbrido | Consolidação embeddings + signals | Modelo híbrido |

**LSE atua na camada 1.** E-E-A-T, autoridade e estrutura de site entram a partir da camada 4. O LSE é o "cérebro semântico"; E-E-A-T e autoridade são o "ecossistema de sinais" que amplifica ou limita seu impacto.

### 1.3 Tríade SERP

O pipeline de busca moderna opera em três camadas interdependentes:

**Layer 1 — Document Ranking:**
- BERT decompõe a query em agrupamentos semânticos
- MUM processa sinais multimodais e multilíngues
- Long-Context LLMs ranqueiam diretamente sobre corpora completos
- Resultado: Top-K documentos recuperados

**Layer 2 — Passage Ranking:**
- Extração de trechos via sliding window
- BERT passage re-ranking por similaridade com query
- MUM snippet diversification (cobertura de múltiplos aspectos)
- Resultado: Top-M passagens selecionadas

**Layer 3 — Passage Generation:**
- SGE seleciona dinamicamente entre múltiplos LLMs (Patent US11769017B1)
- MUM gera respostas personalizadas
- RAG garante grounding factual
- Resultado: Resumo gerado + links de fonte + perguntas relacionadas

**Feedback loop:** Geração descobre trechos insuficientes → volta ao Layer 2. Trechos mostram documento irrelevante → volta ao Layer 1. Se você não se posicionar no Índice de Documentos (Layer 1), não ficará entre as respostas do LLM.

Para uma query complexa como "qual é o melhor advogado de acidentes para veterano aposentado com deficiência", o LLM divide em agrupamentos semânticos hierárquicos. A camada contextual mais próxima influencia mais a saída. Se seu domínio for fortemente relevante para qualquer um desses clusters, você influencia a resposta.

---

## 2. ENTIDADES SEMÂNTICAS

### 2.1 Definição Formal

Entidade Semântica é a unidade atômica de significado — pessoa, lugar, objeto ou conceito abstrato — com identidade única, independente da representação textual. O sistema busca o ID da entidade, não a string da palavra-chave.

### 2.2 Contexto Situacional e Desambiguação

O Contexto Situacional (Patent US20140032522A1) inclui não apenas texto adjacente, mas metadados da página, estrutura DOM e histórico de navegação. O sistema usa vetores de contexto para resolver polissemia: "Manga" → fruta ou vestimenta, determinado por palavras co-ocorrentes.

**Processo de desambiguação:**
1. Captura de N palavras antes e depois do termo + tags HTML (H1, Meta Tags)
2. Palavras co-ocorrentes funcionam como "âncoras de definição"
3. Comparação com o grafo de interesses prévio do usuário
4. Afinidade temática define o sentido correto

### 2.3 Rich Query

Representação expandida da consulta (Patent US20140032522A1):

```
Rich Query = Query do Usuário + Vetor de Contexto Local + Vetor de Perfil do Usuário
```

Implicação: otimizar para intenção e contexto, não apenas correspondência exata de termos. O histórico do usuário altera o peso dos termos na busca (personalização).

### 2.4 Modelo EAV (Entity-Attribute-Value)

O Google organiza conhecimento como:

| Componente | Descrição | Exemplo (Dieta Keto) |
|-----------|-----------|---------------------|
| Entity (E) | Objeto/conceito | Dieta Keto |
| Attribute (A) | Característica | Macronutrientes |
| Value (V) | Especificação | 70% gorduras, 20% proteínas, 10% carboidratos |

Isso permite indexação por conceito, não por palavra. O algoritmo não vê "palavras", mas nós conectados por significado.

---

## 3. MEANING-TEXT THEORY (MTT) E LEXICAL FUNCTIONS

### 3.1 Princípio Fundamental

Patent US2016/0147878A1 (Inbenta): A linguagem é definida pela forma como seus elementos se combinam. O foco está no **léxico** (não na sintaxe). A análise semântica baseada em léxico detecta frases com o mesmo significado, mesmo que formalmente diferentes.

### 3.2 Lexical Functions (LF)

Ferramenta formal para representar relações entre unidades lexicais. Calcula o valor contribuído (não a soma dos significados).

| LF | Nome | Descrição | SAF | Exemplo |
|----|------|-----------|-----|---------|
| — | Match exato | LSC1 = LSC2 | 1.00 | trip = trip |
| Syn0 | Sinônimo direto | Mesmo significado | 0.99 | trip → journey |
| Syn1 | Sinônimo próximo | Significado similar | 0.75 | trip → excursion |
| Syn2 | Sinônimo distante | Significado relacionado | 0.50 | trip → voyage |
| Oper | Verbo operacional | Verbo associado a substantivo | — | trip → make/take |
| Vo | Verbalização | Forma verbal | — | trip → travel |
| Ao | Adjetivação | Adjetivo associado | 0.60 | trip → tripper |
| Cont | Contrário | Antônimo | — | — |
| Super | Superlativo | Forma intensificada | — | — |

**Regras de Lexical Functions (LFR):**
- **Expansion:** Expande significado original para sinônimos/relacionados
- **Contraction:** Contrai sequências em significado único
- **Transformation:** Transforma representações semânticas

### 3.3 Implicação para Conteúdo

Usar vocabulário variado com Lexical Functions naturais fortalece o embedding. "Fazer uma viagem" (Oper + trip), "viajar" (Vo de trip), "viajante" (Ao de trip) — todas reforçam o mesmo conceito semântico sem repetição.

---

## 4. REPRESENTAÇÃO E MATCHING SEMÂNTICO

### 4.1 LSC (Lemma + Semantic Category)

Representação semântica unitária de uma palavra:

```
LSC = { Lemma: "trip", SemanticCategory: "Nn" }
```

Categorias semânticas: Nn (normal noun), V (verb), An (adjective), ordenadas por importância semântica.

### 4.2 LSCS (Global Semantic Representation)

Sequência de LSCs representando significado completo:

```
Query: "How to plan a weekend trip"
LSCS1 = [LSC("plan"), LSC("weekend"), LSC("trip")]
```

### 4.3 FSW (Frequency-balanced Semantic Weight)

```
FSW = SWC / (1 + log₂(FREQ))

Onde:
- SWC = ISC normalizado (soma = 1) → peso da categoria semântica
- ISC = Category Index → importância proporcional à categoria
- FREQ = frequência do significado no corpus
```

**Princípio Shannon:** Informação diminui conforme probabilidade aumenta, em proporção logarítmica. Termos raros no corpus têm maior peso informacional. Vocabulário específico do domínio (FREQ baixo) aumenta FSW.

### 4.4 SAF (Semantic Approximation Factor)

Fator que define qualidade do match semântico (ver tabela em 3.2).

### 4.5 COINC Score

Métrica de coincidência semântica entre query e conteúdo:

```python
# Similaridade parcial positiva
PPS = FSW1 × SAF

# Similaridade positiva total
POS_SIM = Σ(PPS para todos LSC1 correspondidos)

# Similaridade negativa total
NEG_SIM = Σ(FSW2 para LSC2 não correspondidos) × Negative_Weight_Factor

# Score de coincidência
COINC = POS_SIM - NEG_SIM  # para phrase (conteúdo estruturado)
COINC = POS_SIM             # para freetext (conteúdo livre)

# Score final
Score = COINC × REL_Factor
```

**REL_Factor:** Confiabilidade do match. Título/H1 têm REL_Factor mais alto que body text.
**Negative Weight:** Conteúdo não correspondido penaliza o score em conteúdo estruturado. Páginas com muitos termos extras irrelevantes perdem pontuação.

### 4.6 Sinais de Ranking Consolidados

| Sinal | Descrição | Impacto Prático |
|-------|-----------|----------------|
| ISC | Importância da categoria semântica | Verbos/substantivos centrais pesam mais |
| FREQ | Frequência no corpus | Termos raros = mais informativos |
| SAF | Qualidade do match | 1.0 = exato, <1 = aproximado |
| REL Factor | Posição no documento | Título > H2 > body |
| Negative Weight | Penalização por conteúdo extra | Conteúdo tangencial reduz score |

---

## 5. WORDNET E RELAÇÕES TAXONÔMICAS

### 5.1 Synsets e Semfields

Patent US2023/0214412A1 (Exeter): WordNet organiza palavras em **synsets** (grupos de sinônimos representando um conceito único, com ID numérico). Synsets se agrupam em **semfields** (campos semânticos amplos, ex: "agricultura").

O sistema indexa por conceito (synset ID), não por token. Uma query `[#p|body]` (partes do corpo) resolve automaticamente para todos os membros: leg, arm, chest, shoulder, finger, etc.

### 5.2 Relações Semânticas

| Relação | Descrição | Exemplo | Aplicação SEO |
|---------|-----------|---------|--------------|
| Synonymy | Mesmo significado | red, scarlet, crimson | Variação de vocabulário |
| Antonymy | Significado oposto | hot ↔ cold | Contraste/comparação |
| Hypernymy | Categoria superior (IS-A parent) | dog → animal | Contextualização taxonômica |
| Hyponymy | Subtipo (IS-A child) | animal → dog | Especificidade |
| Holonymy | Todo que contém parte | body → arm | Estrutura de componentes |
| Meronymy | Parte de um todo | arm → body | Detalhamento técnico |
| Instance Hyponym | Instância específica | city → New York | Exemplificação |
| Entailment | Implicação lógica | snore → sleep | Relações causais |
| Domain of Usage | Domínio de uso | scalpel → medicine | Contexto profissional |

### 5.3 Polissemia e Sense Disambiguation

Palavras polissêmicas ("bank" = instituição financeira ou margem de rio) são desambiguadas por:
1. Contexto adjacente (co-ocorrências)
2. Categoria semântica (POS + semantic field)
3. Vetor de perfil do usuário

Implicação: usar vocabulário co-ocorrente específico do domínio reduz ambiguidade e fortalece o embedding.

---

## 6. LSE (LATENT SEMANTIC ENTITIES)

### 6.1 Definição

LSE = Latent Semantic Entities. Abstração conceitual representando embeddings de entidades, passagens, atributos, tópicos e intenções no espaço vetorial.

### 6.2 Onde o LSE Atua

O LSE está embutido dentro de BERT, RoBERTa, MUM, RankBrain, Passage Ranking, Knowledge Graph embeddings e modelos de similaridade semântica.

O LSE explica como o Google:
- Entende o tópico de um conteúdo
- Identifica entidades centrais e secundárias
- Mede cobertura semântica
- Detecta lacunas de tópicos
- Entende intenções informacionais
- Mapeia relações conceituais

### 6.3 Onde o LSE Termina

LSE **não** avalia:
- Qualidade humana → Modelos de quality rating (camada 4)
- Reputação/autoridade → Sinais linkográficos (camada 5)
- Comportamento do usuário → CTR, dwell time (camada 6)
- Estrutura do site → Crawling, indexação, PageRank (sinal externo)

Uma boa arquitetura de site amplifica o impacto do LSE porque facilita ao Google ver clusters de entidades/tópicos.

### 6.4 LSE vs LSI vs LSA

| Conceito | Status | Uso Real |
|----------|--------|---------|
| LSI (Latent Semantic Indexing) | Algoritmo dos anos 1990, morto como técnica | "LSI keywords" = gíria de mercado para termos relacionados |
| LSA (Latent Semantic Analysis) | Superado por embeddings neurais | "Modern LSA" = entendimento via vetores contextuais |
| LSE (Latent Semantic Entities) | Conceito operacional atual | Entidades latentes detectadas por embeddings em grafos semânticos |

Google moderno não usa LSI. Usa embeddings neurais (Transformers). O termo "LSI keywords" no mercado SEO refere-se a co-ocorrências naturais, entidades complementares e tópicos esperados — conceitos válidos, mas tecnicamente são LSE.

---

## 7. LATENT SEMANTIC CLUSTERING

### 7.1 Fundamento (Patent US2006/0242140A1)

Técnica que transforma documentos em vetores no espaço LSI e identifica automaticamente clusters de documentos conceitualmente relacionados, sem especificação prévia do número de clusters.

### 7.2 Processo

1. **Pré-processamento:** Remoção stop-words, stemming, extração bi-words, construção de entidades generalizadas
2. **Indexação LSI:** Representação vetorial multidimensional
3. **Similaridade:** Medida de cosseno entre vetores: `cos(α) = (D1·D2) / (||D1||×||D2||)`
4. **Seed Exemplars:** Documentos representativos selecionados de clusters similares
5. **Clusters não-intersectantes:** Baseados em similaridade intra-cluster + dissimilaridade inter-cluster

### 7.3 Parâmetros Operacionais

| Parâmetro | Descrição | Valor Típico |
|-----------|-----------|-------------|
| Min_Seed_Cluster | Tamanho mínimo do cluster | 4 |
| minSIM | Similaridade mínima | 0.35–0.40 |
| maxSIM | Filtro de duplicatas | 0.99 |
| MinRedundancy | Detecção de redundância | Configurável |

### 7.4 Implicação para SEO

Topical Authority = coerência semântica + consistência + profundidade + ausência de buracos. Cada página do site é um nó no cluster. Se uma página tem alta dissimilaridade inter-cluster com as demais páginas do site, ela dilui autoridade topical.

---

## 8. RAG, LONG-CONTEXT E BUSCA MODERNA

### 8.1 Specialized Models vs Long-Context LLMs

| Abordagem | Vantagem | Desvantagem |
|-----------|---------|-------------|
| RAG (Retrieval-Augmented Generation) | Eficiência, top-K retrieval, atualizações fáceis | Erro em retrieval propaga-se, multi-hop limitado |
| Long-Context LLMs (CiC Prompting) | Reasoning complexo, sem erros de retrieval | Custo quadrático O(n²), latência elevada |
| Self-Route (Hybrid) | Routing dinâmico entre RAG e Long-Context | Complexidade de implementação |

Google DeepMind pesquisa ativamente: Gemini 1.5 Pro (2M tokens) supera RAG em multi-hop reasoning, mas simplesmente expandir contexto não melhora performance sem estratégias eficientes.

### 8.2 Implicações para GEO

Para ser recuperado em RAG: alta densidade de contexto local, entidades nomeadas explicitamente (sem pronomes vagos em parágrafos-chave), estrutura `Definição → Explicação → Exemplo`.

Para long-context: conteúdo modular, semanticamente coerente ao longo de todo o documento, sem contradições internas.

---

## 9. INFORMATION THEORY APLICADA

### 9.1 Princípio Shannon

```
I(x) = -log₂(P(x))
```

Quanto menor a probabilidade de um símbolo, maior sua informação. Aplicado a conteúdo: termos raros e específicos do domínio carregam mais peso semântico que termos genéricos.

### 9.2 Information Gain como Sinal de Ranking

Information Gain = quanto o conteúdo reduz a incerteza do sistema em relação ao tópico.

Conteúdos genéricos: baixo ganho informacional, facilmente substituíveis.
Conteúdos fortes: viram referência, são citados e reutilizados por motores gerativos.

Ângulos não óbvios, dados próprios, frameworks originais, relações causais explicadas — todos aumentam Information Gain.

---

## 10. TIMELINE TECNOLÓGICO

```
2006 ─── Latent Semantic Clustering (Patent US2006/0242140A1)
2014 ─── Contextual Searching of Semantic Entities (Patent US20140032522A1)
2016 ─── Semantic Search Engine MTT (Patent US2016/0147878A1)
2017 ─── Transformers: "Attention Is All You Need" (Google Brain) [BASE]
2018 ─── BERT pre-training (bidirectional understanding)
2019 ─── BERT aplicado a Search (query understanding)
2020 ─── RAG Framework (Meta AI) [HYBRID RETRIEVAL+GENERATION]
2021 ─── MUM: Multitask Unified Model (1000x BERT, 75 idiomas, multimodal)
2023 ─── SGE Patent US11769017B1 (generative summaries, LLM selection dinâmica)
2023 ─── Semantic Search Engine (Patent US2023/0214412A1, concept-based indexing)
2024 ─── Willow Quantum Chip (105 qubits, error correction exponencial)
2024-25 ── Long-Context RAG Optimization (Self-Route, Inference Scaling)
```
