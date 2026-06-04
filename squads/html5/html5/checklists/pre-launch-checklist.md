# Pre-Launch Checklist — The 8 Sorcerers Must Sign

> Nenhum site entra em produção sem a assinatura de todos os 8 sorcerers.
> Cada seção é responsabilidade de um agente específico.

---

## ⚡ KASHIMO — Architecture Signed Off

- [ ] Site Architecture Document (SAD) implementado como planejado
- [ ] Nenhum template tem Cursed Energy > 50
- [ ] Todos os templates estão no Grade 1 ou acima
- [ ] Document outline de cada template validado

**Kashimo's Sign-off:** _______________

---

## 🎰 HAKARI — Semantic Structure Signed Off

- [ ] Zero `<div>` onde elemento semântico existe
- [ ] Heading hierarchy perfeita em todos os templates (nunca pula nível)
- [ ] Apenas 1 `<h1>` por página
- [ ] Todos os formulários com `<label>` associado
- [ ] `<article>` e `<section>` usados corretamente
- [ ] Schema.org JSON-LD presente e validado em cada tipo de página
- [ ] Skip link presente em todas as páginas

**Hakari's Sign-off:** _______________

---

## ⚖️ HIGURUMA — WCAG Signed Off

- [ ] Zero Critical violations (10+ dedos de Sukuna)
- [ ] Zero Serious violations não-mitigadas
- [ ] Contraste ≥ 4.5:1 em todo texto normal
- [ ] Contraste ≥ 3:1 em texto grande e componentes UI
- [ ] Toda funcionalidade acessível por teclado
- [ ] Focus ring visível em todos os interativos
- [ ] Sem keyboard traps
- [ ] `lang` no `<html>` de todas as páginas

**Higuruma's Sign-off:** _______________

---

## 🗡️ MAKI — CSS Signed Off

- [ ] CSS com custom properties para todos os design tokens
- [ ] Zero `!important` no CSS (exceto reset/third-party)
- [ ] `prefers-reduced-motion` respeitado em todas as animações
- [ ] `prefers-color-scheme: dark` implementado (ou documentado como backlog)
- [ ] CSS responsivo: sem scroll horizontal em 320px
- [ ] Performance: CSS payload < 30KB (crítico inline, resto async)
- [ ] Zero inline styles no HTML (exceto quando token dinâmico)

**Maki's Sign-off:** _______________

---

## 🩸 CHOSO — Progressive Enhancement Signed Off

*(Preencher apenas se o projeto usa JavaScript)*

- [ ] Site 100% funcional com JavaScript desabilitado
- [ ] Todas as funcionalidades JS são enhancements, não requirements
- [ ] `aria-busy` presente em operações assíncronas
- [ ] Form enhancement não quebra validação HTML5 nativa
- [ ] Foco retorna ao trigger após fechar qualquer overlay
- [ ] JS payload < 20KB (crítico inline, resto lazy)
- [ ] Zero dependências de framework (vanilla JS only)

**Choso's Sign-off:** _______________

---

## 🍙 INUMAKI — Screen Reader Signed Off

- [ ] Todos os elementos interativos têm nome acessível descritivo
- [ ] Zero links "Saiba mais" sem contexto adicional
- [ ] Todos os SVGs corretamente classificados (decorativo vs. informativo)
- [ ] aria-live regions funcionando para conteúdo dinâmico
- [ ] NVDA test: headings, landmarks, forms, links — PASS
- [ ] Datas em `<time datetime="">` onde relevante
- [ ] Emojis em headings com `aria-hidden="true"`

**Inumaki's Sign-off:** 🍙 _______________

---

## ❄️ URAUME — Head & SEO Signed Off

- [ ] `charset` e `viewport` nas primeiras linhas de TODOS os `<head>`
- [ ] `<title>` único e descritivo em cada página (30-60 chars)
- [ ] `<meta name="description">` presente (120-155 chars)
- [ ] `<link rel="canonical">` em todas as páginas
- [ ] `og:title`, `og:description`, `og:image` (1200×630) presentes
- [ ] `og:image:alt` presente
- [ ] JSON-LD validado em schema.org/validator (zero errors)
- [ ] Rich Results Test: zero errors
- [ ] `preconnect` para fonts externas
- [ ] `preload` para fonte principal e hero image
- [ ] Favicon + apple-touch-icon + manifest.json presentes

**Uraume's Sign-off:** _______________

---

## 🏗️ HTML5 CHIEF — Final Clearance

- [ ] Todos os 7 sorcerers assinaram
- [ ] Relatório de acessibilidade enviado para design-chief
- [ ] Lighthouse scores: Performance ≥85, Accessibility 100, SEO ≥90
- [ ] Core Web Vitals: LCP < 2.5s, CLS < 0.1
- [ ] HTML válido (W3C validator: zero errors)
- [ ] Grade final do site: ≥ Grade 1

**Veredicto Final:** PASS / FAIL

**HTML5 Chief's Sign-off:** _______________
**Data de Autorização:** _______________

---

> *"Ao longo dos céus e da terra, este é o único HTML honrado."*
> — HTML5 Squad, ao atingir Special Grade
