# WCAG 2.1 AA Checklist — Higuruma's Court

**Juiz:** Higuruma
**Padrão:** WCAG 2.1 Level AA
**Veredicto possível:** PASS / CONCERNS / FAIL (bloqueia deploy)

> Cada item marcado é uma absolvição. Cada item vazio é uma acusação ativa.

---

## PERCEIVABLE

### 1.1 — Alternativas em Texto
- [ ] **1.1.1** Toda imagem informativa tem `alt` descritivo — *3 dedos se ausente*
- [ ] **1.1.1** Imagens decorativas têm `alt=""` — *1 dedo se ausente*
- [ ] **1.1.1** SVGs informativos têm `<title>` + `role="img"` + `aria-label`
- [ ] **1.1.1** SVGs decorativos têm `aria-hidden="true"` + `focusable="false"`
- [ ] **1.1.1** Ícones-only buttons têm `aria-label` — *10 dedos se ausente*
- [ ] **1.1.1** CAPTCHAs têm alternativa de áudio

### 1.2 — Mídia com Tempo
- [ ] **1.2.2** Vídeos têm legendas (closed captions) — *5 dedos se ausente*
- [ ] **1.2.3** Vídeos têm audiodescrição ou transcrição completa
- [ ] **1.2.4** Legendas ao vivo para conteúdo em tempo real

### 1.3 — Adaptável
- [ ] **1.3.1** Informação e relacionamentos expressos em código (semântica) — *10 dedos se ausente*
- [ ] **1.3.1** Tabelas de dados têm `<th>` com `scope`
- [ ] **1.3.2** Ordem de leitura faz sentido sem CSS
- [ ] **1.3.3** Instruções não dependem só de cor ou forma ("o botão vermelho")
- [ ] **1.3.4** Conteúdo não bloqueado para orientação portrait/landscape
- [ ] **1.3.5** Campos de formulário têm `autocomplete` correto

### 1.4 — Distinguível
- [ ] **1.4.1** Cor não é o único meio de transmitir informação — *3 dedos se ausente*
- [ ] **1.4.3** Contraste texto normal: ≥ 4.5:1 — *5 dedos se ausente*
- [ ] **1.4.3** Contraste texto grande (≥18pt ou ≥14pt bold): ≥ 3:1
- [ ] **1.4.4** Texto redimensionável até 200% sem perda de conteúdo
- [ ] **1.4.5** Texto é texto (não imagem de texto) quando possível
- [ ] **1.4.10** Reflow: conteúdo legível em 320px sem scroll horizontal
- [ ] **1.4.11** Contraste de componentes UI: ≥ 3:1 — *3 dedos se ausente*
- [ ] **1.4.12** Espaçamento de texto: funciona com line-height 1.5, letter-spacing 0.12em
- [ ] **1.4.13** Hover/focus content: hoverable, dismissible, persistent

---

## OPERABLE

### 2.1 — Acessível por Teclado
- [ ] **2.1.1** Toda funcionalidade acessível por teclado — *15 dedos se ausente*
- [ ] **2.1.2** Sem keyboard trap — *15 dedos se presente*
- [ ] **2.1.4** Atalhos de teclado podem ser desligados ou remapeados

### 2.2 — Tempo Suficiente
- [ ] **2.2.1** Usuário pode pausar/parar/ajustar timeouts
- [ ] **2.2.2** Conteúdo em movimento pode ser pausado

### 2.3 — Convulsões
- [ ] **2.3.1** Sem conteúdo piscando mais de 3x por segundo

### 2.4 — Navegável
- [ ] **2.4.1** Skip link presente — *5 dedos se ausente*
- [ ] **2.4.2** `<title>` da página é descritivo e único — *3 dedos se ausente*
- [ ] **2.4.3** Ordem de foco é lógica (segue ordem visual)
- [ ] **2.4.4** Propósito de links claro pelo contexto — *3 dedos se "Saiba mais" sem contexto*
- [ ] **2.4.5** Múltiplos caminhos para encontrar páginas (nav, busca, sitemap)
- [ ] **2.4.6** Headings e labels descritivos
- [ ] **2.4.7** Foco visível — *5 dedos se outline:none sem substituto*
- [ ] **2.4.11** Foco não ocluído (não coberto por sticky header/modal) — WCAG 2.2

### 2.5 — Modalidades de Entrada
- [ ] **2.5.1** Gestos multi-ponto têm alternativa single-pointer
- [ ] **2.5.3** Nome acessível inclui texto visível do elemento
- [ ] **2.5.4** Funcionalidades de motion têm alternativa

---

## UNDERSTANDABLE

### 3.1 — Legível
- [ ] **3.1.1** `lang` presente no `<html>` — *3 dedos se ausente*
- [ ] **3.1.2** Trechos em outro idioma têm `lang` no elemento

### 3.2 — Previsível
- [ ] **3.2.1** Foco não muda contexto automaticamente
- [ ] **3.2.2** Input não submete form automaticamente
- [ ] **3.2.3** Navegação consistente em todo o site
- [ ] **3.2.4** Componentes com mesma função têm mesmo nome

### 3.3 — Assistência em Entrada
- [ ] **3.3.1** Erros identificados e descritos em texto — *5 dedos se ausente*
- [ ] **3.3.2** Labels ou instruções em todos os inputs — *10 dedos se ausente*
- [ ] **3.3.3** Sugestão de correção quando erro é detectado
- [ ] **3.3.4** Ações críticas (compra, exclusão) têm confirmação

---

## ROBUST

### 4.1 — Compatível
- [ ] **4.1.1** HTML válido (zero erros de parsing)
- [ ] **4.1.2** Nome, papel e valor corretos para todos os componentes — *10 dedos se ausente*
- [ ] **4.1.3** Status messages anunciados sem receber foco (aria-live)

---

## VEREDICTO FINAL

```
Total de itens: 42
Marcados: ___/42
Dedos de Sukuna acumulados: ___

Critical violations (10+ dedos): ___
  → Zero: PASS ✓
  → ≥1: FAIL — BLOQUEADO ✗

Score: ___/42 → Grade: ___
```

| Score | Grade | Veredicto |
|-------|-------|-----------|
| 42/42 | Special Grade | PASS — Deploy autorizado |
| 38-41 | Grade 1 | PASS com warnings menores |
| 30-37 | Grade 2 | CONCERNS — fix antes do launch |
| < 30 | Grade 3/4 | FAIL — BLOQUEADO |
| Critical violation | Qualquer | FAIL — BLOQUEADO independente do score |
