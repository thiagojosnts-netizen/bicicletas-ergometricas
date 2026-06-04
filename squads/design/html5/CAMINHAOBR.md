# CaminhãoBR — Portal Afiliado de Caminhões

> Site completo de compra e venda de caminhões com design brutalista moderno,
> SEO semântico (topical authority) e performance Core Web Vitals.

## Arquivos gerados

| Arquivo | Localização | Descrição |
|---------|-------------|-----------|
| `index.html` | `html5/` | Home page completa (10 seções) |
| `styles.css` | `html5/` | Design system brutalista completo |
| `script.js` | `html5/` | Interações vanilla JS |
| `design-tokens.css` | `design/` | Source of truth do design system |

## Deploy rápido

```bash
# Vercel (recomendado)
npm i -g vercel && vercel --prod

# Netlify: arraste a pasta html5/ para app.netlify.com/drop
# Cloudflare Pages: build command vazio, output: html5/
```

## Personalização obrigatória antes do lançamento

1. Substitua `CaminhãoBR` pelo nome real do site
2. Substitua `https://www.caminhaobr.com.br` pela URL real em todos os Schema JSON-LD
3. Substitua os `href` dos botões "VER OFERTA →" pelos links reais de afiliados
4. Adicione imagens WebP reais em `assets/` (substitua os placeholders)
5. Configure Google Analytics 4 (após consentimento LGPD)
6. Crie `sitemap.xml` e `robots.txt`

## Links de afiliados — configuração

Todos os CTAs já têm `rel="nofollow sponsored noopener noreferrer"` e `target="_blank"`:

```html
<a href="SEU_LINK_AQUI"
   target="_blank"
   rel="nofollow sponsored noopener noreferrer">
  VER OFERTA →
</a>
```

Parceiros sugeridos: OLX, WebMotors, iCarros, Mercado Livre, concessionárias.

## Design System

**Paleta brutalista:**
- Fundo: `#0A0A0A`
- Primário: `#FF4D00` (laranja)
- Secundário: `#FFE500` (amarelo industrial)
- CTA: `#00FF88` (verde neon)

**Tipografia:** Space Grotesk (display) + Inter (corpo)
**Bordas:** 0px radius — cantos retos puros
**Hover:** translate(-4px, -4px) + box-shadow brutal

## SEO — o que já está implementado

- Title tags por template (keyword + brand)
- Meta descriptions 150-160 chars
- H1 único com keyword principal
- Schema JSON-LD: Organization + WebSite + SearchAction + ItemList + FAQPage
- rel="nofollow sponsored" em todos os links de afiliados
- Alt texts semânticos + nomes de arquivo descritivos
- CSS crítico inline, JS com defer
- Acessibilidade: skip nav, ARIA labels, focus states, role/aria-expanded
- Cookie banner LGPD
- Disclaimer de afiliados no footer

## Próximas páginas a criar (por prioridade)

🔴 `/caminhoes/`, `/caminhoes/usados/`, `/marcas/scania/`, `/marcas/volvo/`,
   `/marcas/mercedes-benz/`, `/guia/como-comprar-caminhao/`, `/vender-caminhao/`

🟠 `/caminhoes/leves/`, `/caminhoes/medios/`, `/caminhoes/pesados/`,
   `/guia/financiamento-caminhao/`, `/guia/tipos-de-caminhao/`, `/sobre/`

🟡 `/marcas/man/`, `/marcas/daf/`, `/marcas/iveco/`, `/marcas/volkswagen/`,
   `/blog/`, `/contato/`, `/termos/`
