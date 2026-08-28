// src/data/afiliados.ts
// Fonte única dos modelos monetizáveis + seus links de afiliado.
// Usado por src/components/CompreCTA.astro nas páginas informacionais.

export type Loja = 'Amazon' | 'Mercado Livre' | 'Shopee';

export interface ModeloAfiliado {
  nome: string;
  destino: string; // link interno para a análise (ficha ou página de marca)
  ofertas: { loja: Loja; url: string }[];
}

export const modelos: Record<string, ModeloAfiliado> = {
  'dream-ex450': {
    nome: 'Dream Fitness EX 450',
    destino: '/produtos/dream-fitness-ex-450/',
    ofertas: [
      { loja: 'Amazon', url: 'https://link.amazon/B05aGxhNF' },
      { loja: 'Mercado Livre', url: 'https://meli.la/1jEg8FC' },
    ],
  },
  'kikos-kv31': {
    nome: 'Kikos KV3.1i Magnética',
    destino: '/produtos/kikos-kv3-1i-magnetica/',
    ofertas: [
      { loja: 'Amazon', url: 'https://link.amazon/B071AhLkk' },
      { loja: 'Mercado Livre', url: 'https://meli.la/1tX6pbg' },
    ],
  },
  'wct-13kg': {
    nome: 'WCT Fitness Spinning 13kg',
    destino: '/produtos/wct-fitness-spinning-13kg/',
    ofertas: [
      { loja: 'Amazon', url: 'https://link.amazon/B053BL2DM' },
      { loja: 'Mercado Livre', url: 'https://meli.la/1prAuY7' },
    ],
  },
  'gallant-pro': {
    nome: 'Gallant Elite Pro Spinning 18kg',
    destino: '/produtos/gallant-elite-pro-spinning/',
    ofertas: [
      { loja: 'Amazon', url: 'https://www.amazon.com.br/dp/B0C4K2FTDY?tag=bicicletase0d-20' },
      { loja: 'Mercado Livre', url: 'https://meli.la/1x3irKm' },
    ],
  },
  'gallant-horizontal': {
    nome: 'Gallant Elite Horizontal Magnética',
    destino: '/produtos/gallant-elite-horizontal/',
    ofertas: [
      { loja: 'Amazon', url: 'https://www.amazon.com.br/dp/B0C4K5PRLB?tag=bicicletase0d-20' },
    ],
  },
  'gallant-x-spinning': {
    nome: 'Gallant Elite X Spinning 8kg',
    destino: '/produtos/gallant-elite-x-spinning/',
    ofertas: [
      { loja: 'Amazon', url: 'https://www.amazon.com.br/dp/B0C4B767KB?tag=bicicletase0d-20' },
    ],
  },
  'acte-e16': {
    nome: 'Acte Sports E16 Spinning',
    destino: '/melhores-bicicletas-ergometricas/acte-sports/',
    ofertas: [
      { loja: 'Amazon', url: 'https://amzn.to/3RR5lNN' },
    ],
  },
  'its-pro818': {
    nome: 'Its Fitness Pro 818',
    destino: '/produtos/its-fitness-pro-818/',
    ofertas: [
      { loja: 'Amazon', url: 'https://link.amazon/B0f21cEEt' },
    ],
  },
  'knakasaki-nk2019': {
    nome: 'KNakasaki NK2019',
    destino: '/produtos/knakasaki-nk2019/',
    ofertas: [
      { loja: 'Amazon', url: 'https://link.amazon/B08cHgDiq' },
    ],
  },
};
