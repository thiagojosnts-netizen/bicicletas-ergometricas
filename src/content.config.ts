import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    datePublished: z.string(),
    dateModified: z.string().optional(),
    draft: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
    ctaModelo: z.string().optional(),
    faqItems: z.array(z.object({
      question: z.string(),
      answer: z.string(),
    })).optional(),
  }),
});

const oferta = z.object({
  loja: z.enum(['Amazon', 'Mercado Livre', 'Shopee']),
  url: z.string().url(),
});

const produtos = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/produtos' }),
  schema: z.object({
    name: z.string(),
    description: z.string(),
    descricaoLonga: z.string(),
    rating: z.number(),
    reviewCount: z.number(),
    ofertas: z.array(oferta).min(1),
    image: z.string(),
    imageAlt: z.string(),
    badge: z.string(),
    features: z.array(z.string()),
    tipo: z.string(),
    categoria: z.string(),
    marca: z.string(),
    topPick: z.boolean(),
    especificacoes: z.record(z.string(), z.string()),
  }),
});

export const collections = { blog, produtos };
