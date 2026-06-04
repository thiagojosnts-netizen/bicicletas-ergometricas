# HTML5 Squad — Knowledge Base

> A bíblia dos Semantic Web Sorcerers.
> Consulte antes de qualquer decisão de markup, CSS ou acessibilidade.

---

## I. CURSED ENERGY SYSTEM — A Lei do HTML Maldito

Todo site possui **Cursed Energy** acumulada por cada violação semântica.
Alta Cursed Energy = site fraco, inacessível, invisível para crawlers.
O objetivo do squad é purificar a Cursed Energy e elevar o site ao Special Grade.

### Como Cursed Energy é gerada

```
FONTE DE CURSED ENERGY           | ENERGIA GERADA
─────────────────────────────────|───────────────
<div> onde deveria ser <article> | +15 CE
<span onclick> como botão        | +25 CE (CRÍTICO)
Heading pulado (H1→H3)           | +20 CE
Imagem sem alt                   | +30 CE (BLOQUEANTE)
Form sem label                   | +35 CE (BLOQUEANTE)
Site sem <main>                  | +20 CE
Zero Schema.org                  | +10 CE
title = "Página"                 | +15 CE
Lang ausente no <html>           | +10 CE
Focus ring removido              | +30 CE (CRÍTICO)
CSS inline em tudo               | +20 CE
JavaScript substituindo HTML     | +40 CE (CATASTRÓFICO)
```

### Cursed Energy Score → Diagnóstico

```
CE = 0          → PURIFICADO — Special Grade
CE 1-50         → Levemente contaminado — Grade 1
CE 51-150       → Moderadamente contaminado — Grade 2
CE 151-300      → Fortemente contaminado — Grade 3
CE 301-500      → Gravemente contaminado — Grade 4
CE > 500        → MALDITO COMPLETO — precisa de Domain Expansion
```

---

## II. GRADE SYSTEM — A Hierarquia do HTML Semântico

Assim como sorcerers em JJK são classificados por Grade, sites HTML recebem um Grade baseado na qualidade semântica, acessibilidade e performance.

### Grade 4 — Mortal HTML

**Critérios:**
- Estrutura 100% em `<div>` e `<span>`
- Zero landmarks (`<header>`, `<nav>`, `<main>`, `<footer>`)
- Heading hierarchy aleatória ou ausente
- Formulários sem labels
- Imagens sem alt

**Diagnóstico:** *"Este site não existe semanticamente."*

**Agente Responsável:** Kashimo imediato, Domain Expansion provável.

---

### Grade 3 — Cursed Practitioner

**Critérios:**
- Alguns elementos semânticos presentes mas mal aplicados
- Landmark parcial (tem `<header>`, falta `<main>`)
- Heading hierarchy com 1-2 saltos
- Formulários parcialmente labelados
- Contraste < 3:1 em alguns textos

**Diagnóstico:** *"Tem potencial. Precisa de treinamento intenso."*

**Agente Responsável:** Hakari para reestruturar, Higuruma para WCAG básico.

---

### Grade 2 — Sorcerer

**Critérios:**
- Landmarks corretos e completos
- Heading hierarchy válida (nunca pula)
- Todos os formulários com labels
- Contraste ≥ 4.5:1 em texto normal
- Alt text em todas as imagens
- Skip link presente

**Diagnóstico:** *"Estrutura sólida. Falta refinamento."*

**Agente Responsável:** Higuruma para WCAG AA completo, Uraume para meta.

---

### Grade 1 — Elite Sorcerer

**Critérios:**
- WCAG 2.1 AA: zero Critical/Serious violations
- Schema.org JSON-LD implementado corretamente
- Open Graph + Twitter Card completos
- Resource hints otimizados (preload, preconnect)
- CSS com custom properties (design tokens)
- Progressive enhancement: funciona sem JS
- Screen reader experience equivalente à visual

**Diagnóstico:** *"Pronto para produção. Acima da média do mercado."*

**Agente Responsável:** Inumaki para QA final, squad completo.

---

### Special Grade — The Honored HTML

**Critérios:**
- WCAG 2.1 AAA em elementos críticos
- Lighthouse: Performance ≥95, Accessibility 100, Best Practices 100, SEO 100
- Core Web Vitals: LCP < 2.5s, CLS < 0.1, INP < 200ms
- Rich Results: Featured Snippets ou Rich Cards ativados
- `prefers-reduced-motion`, `prefers-color-scheme`, `forced-colors` suportados
- Funciona sem JavaScript, sem CSS, sem imagens
- Pronunciado corretamente em NVDA, VoiceOver, JAWS

**Diagnóstico:** *"Ao longo dos céus e da terra, este é o único HTML honrado."*

**Agente Responsável:** Todo o squad + validação cruzada.

---

## III. SUKUNA FINGER SCALE — Severidade de Violações

Violações de qualidade HTML são medidas em dedos de Sukuna.
Quanto mais dedos, mais poder destrutivo da violação.

```
1 DEDO     — Minor
  → title attribute como nome acessível principal
  → "Saiba mais" sem contexto (único na página)
  → Emoji em heading sem aria-hidden
  → Meta description > 160 chars

3 DEDOS    — Moderate
  → Heading hierarchy pula 1 nível
  → <section> sem heading filho
  → Imagem informativa com alt genérico ("imagem", "foto")
  → Link "Clique aqui" sem contexto adicional
  → lang ausente no <html>

5 DEDOS    — Serious
  → Skip link ausente
  → Focus ring removido via outline:none
  → Contraste texto 2:1 a 3.9:1
  → aria-live ausente em conteúdo dinâmico
  → Form com label não associado (for/id não batem)

10 DEDOS   — Critical (BLOQUEIA DEPLOY)
  → Imagem informativa sem alt
  → Form sem label (nenhum)
  → <div onclick> ou <span onclick> como botão
  → Modal sem focus trap
  → Site sem <main>

15 DEDOS   — Catastrophic (DOMAIN EXPANSION NECESSÁRIO)
  → 100% do conteúdo em divs (zero semântica)
  → JavaScript gerando TODO o HTML (zero SSR/static)
  → Formulário de pagamento sem labels
  → Site inteiro inacessível por teclado

20 DEDOS (RYOMEN SUKUNA COMPLETO) — Site deve ser reconstruído do zero
  → Malware em markup
  → CSS com display:none em conteúdo principal
  → Heading hierarchy: H6 > H1 > H4 > H2
  → Charset errado causando mojibake
  → viewport: user-scalable=no (WCAG fail + hostilidade)
```

---

## IV. BINDING VOW — Contrato com o Design Squad

O HTML5 Squad opera sob um **Binding Vow** com o Design Squad:

### Obrigações do HTML5 Squad

```
AO RECEBER DO DESIGN-CHIEF:
  ✅ Preservar intenção visual nos elementos semânticos
  ✅ Usar design tokens exatamente como fornecidos
  ✅ Não inventar componentes que não estão nas specs
  ✅ Reportar quando spec violar acessibilidade (ex: contraste insuficiente)
  ✅ Retornar relatório de acessibilidade + visual QA

AO ENTREGAR PARA O DESIGN-CHIEF:
  ✅ HTML funcionando no browser sem JS
  ✅ CSS com custom properties documentadas
  ✅ Screenshot de cada template em 320px, 768px e 1440px
  ✅ Lighthouse scores por página
  ✅ Lista de desvios da spec com justificativa semântica
```

### Obrigações do Design Squad (esperado)

```
AO ENVIAR PARA HTML5-CHIEF:
  ✅ Design tokens estruturados (cores, espaçamento, tipografia)
  ✅ Component specs com estados (default, hover, focus, disabled)
  ✅ Especificação de breakpoints
  ✅ Contraste de todas as combinações fg/bg (Higuruma verificará)
  ✅ Identificação clara: decorativo vs. informativo para cada imagem
```

---

## V. DOMAIN EXPANSION PROTOCOLS

Cada sorcerer possui um **Domain Expansion** ativado com `*domain-expansion`.
Domain Expansion é o golpe definitivo — usado quando situação é grave.

| Sorcerer | Domain Expansion | Quando Usar |
|----------|-----------------|-------------|
| Kashimo | Gachinko Architecture Fight | Site ≥ Grade 3 (CE > 150) |
| Hakari | Idle Death Gamble | Rewrite completo de estrutura |
| Higuruma | Deadly Sentencing | Audit WCAG com verdict formal |
| Maki | Curseless CSS Strike | CSS rewrite completo do zero |
| Choso | Supernova | Todas as funcionalidades JS em uma sessão |
| Inumaki | Cursed Speech: DISMANTLE | Eliminar todas as barreiras de SR |
| Uraume | Ice Formation: Absolute Zero | Head completo + all schema types |

---

## VI. INTER-AGENT DYNAMICS

### Tensões e Sinergias

```
KASHIMO ↔ CHOSO
  Tensão: Kashimo quer HTML puro; Choso quer adicionar JS.
  Resolução: Kashimo define a estrutura — Choso enhancement só depois.

HAKARI ↔ HIGURUMA
  Sinergia: Hakari implementa semântica, Higuruma audita em paralelo.
  Protocolo: Higuruma pode bloquear qualquer elemento que Hakari criou.

MAKI ↔ HIGURUMA
  Tensão: Maki pode remover focus ring "por estética".
  Resolução: Higuruma tem veto absoluto sobre qualquer CSS que afete acessibilidade.

URAUME ↔ HAKARI
  Sinergia: Hakari gera o document outline; Uraume usa o título H1 para og:title.
  Protocolo: Uraume lê o HTML final de Hakari antes de criar metas.

INUMAKI ↔ TODOS
  Papel: Inumaki é o QA final. Nenhum agente vai para produção sem aprovação de Inumaki.
  Poder: Inumaki pode pedir retrabalho para qualquer agente.
```

---

## VII. ELEMENT DECISION MATRIX — Referência Rápida

```
CONTEÚDO                        → ELEMENTO CORRETO
────────────────────────────────|──────────────────────
Post de blog completo           → <article>
Seção com heading               → <section>
Grupo visual sem heading        → <div>
Barra lateral relacionada       → <aside>
Cabeçalho do site               → <header>
Rodapé do site                  → <footer>
Conteúdo principal              → <main> (único)
Menu de navegação               → <nav>
Título principal da página      → <h1> (único)
Subtítulo de seção              → <h2>
Lista de links                  → <ul> dentro de <nav>
Lista ordenada (steps)          → <ol>
Definições/glossário            → <dl><dt><dd>
Imagem com legenda              → <figure><img><figcaption>
Imagem decorativa               → <img alt="">
Citação de outro autor          → <blockquote cite="">
Código                          → <code> (inline), <pre><code> (bloco)
Data/hora                       → <time datetime="">
Ação do usuário                 → <button type="button">
Navegação de URL                → <a href="">
Input de dados                  → <input> + <label>
Grupo de inputs relacionados    → <fieldset><legend>
Informação importante           → <strong> (não <b>)
Ênfase de leitura               → <em> (não <i>)
```

---

*HTML5 Squad Knowledge Base v1.0.0 — Purifying the web, one element at a time.*
