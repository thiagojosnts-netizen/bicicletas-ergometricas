# Semantic HTML5 Checklist

**Usado por:** kashimo (diagnóstico), hakari (implementação), higuruma (QA)
**Aplicar:** Antes de qualquer deploy

---

## 1. Document Fundamentals

- [ ] `<!DOCTYPE html>` presente na primeira linha
- [ ] `<html lang="pt-BR">` (ou idioma correto)
- [ ] `<meta charset="UTF-8">` como primeiro meta
- [ ] `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
- [ ] `<title>` único e descritivo (30-60 chars)

## 2. Document Outline

- [ ] Apenas 1 `<h1>` por página
- [ ] Heading hierarchy não pula níveis (H1→H2→H3, nunca H1→H3)
- [ ] Headings descrevem o conteúdo que os segue
- [ ] Outline faz sentido lido em sequência sem o restante da página

## 3. Landmarks

- [ ] `<header>` presente (banner)
- [ ] `<nav>` para navegação principal (com `aria-label` se múltiplos)
- [ ] `<main id="main-content">` único e presente
- [ ] `<footer>` presente
- [ ] `<aside>` usado apenas para conteúdo complementar
- [ ] `<section>` tem sempre um heading filho
- [ ] `<article>` é conteúdo independente e auto-suficiente

## 4. Skip Link

- [ ] Skip link presente como primeiro elemento focável
- [ ] Skip link aponta para `#main-content`
- [ ] Skip link visível ao receber foco

## 5. Interactive Elements

- [ ] Links (`<a>`) têm `href` válido
- [ ] Botões de ação usam `<button>`, não `<div>` ou `<span>`
- [ ] Links de navegação usam `<a>`, não `<button>`
- [ ] Zero `onclick` em divs ou spans

## 6. Images

- [ ] Toda `<img>` tem atributo `alt`
- [ ] Imagens decorativas têm `alt=""` (vazio)
- [ ] Imagens informativas têm `alt` descritivo
- [ ] Imagens em `<figure>` têm `<figcaption>` quando necessário
- [ ] SVGs decorativos têm `aria-hidden="true"` e `focusable="false"`

## 7. Lists

- [ ] Listas de itens usam `<ul>` ou `<ol>` (não divs)
- [ ] Navegações são `<ul>` dentro de `<nav>`
- [ ] `<dl>/<dt>/<dd>` para glossários e definições

## 8. Tables

- [ ] Tabelas de dados têm `<caption>`
- [ ] Headers de coluna usam `<th scope="col">`
- [ ] Headers de linha usam `<th scope="row">`
- [ ] Tabelas complexas têm `headers` attribute

## 9. Forms

- [ ] Todo `<input>` tem `<label>` associado (via `for`/`id`)
- [ ] Grupos de inputs relacionados têm `<fieldset>` e `<legend>`
- [ ] Campos obrigatórios têm `required` + indicação visual + texto SR
- [ ] Campos têm `autocomplete` attribute apropriado

## 10. Media

- [ ] `<video>` tem `<track kind="captions">` ou legenda equivalente
- [ ] `<audio>` tem transcrição disponível
- [ ] Imagens têm `width` e `height` definidos (CLS prevention)
- [ ] Imagens abaixo da dobra têm `loading="lazy"`

---

**Score:** ___/40
**Veredicto:** PASS (≥36) | CONCERNS (30-35) | FAIL (<30)
