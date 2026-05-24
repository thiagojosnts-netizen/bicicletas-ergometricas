---
// src/pages/sitemap.xml.ts
// Sitemap automático — gerado em tempo de build pelo Astro
// Acesso: bicicletasergometricas.com/sitemap.xml

export const GET = () => {
  const siteUrl = "https://bicicletasergometricas.com";
  const now = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  const urls = [
    // Home
    { loc: "/",            changefreq: "weekly",  priority: "1.0" },

    // S1 — Guia de Compra
    { loc: "/guia",        changefreq: "monthly", priority: "0.9" },
    { loc: "/comparativos",changefreq: "monthly", priority: "0.8" },
    { loc: "/comparativos/mecanica-vs-magnetica",    changefreq: "monthly", priority: "0.8" },
    { loc: "/comparativos/ergometrica-vs-spinning",  changefreq: "monthly", priority: "0.8" },

    // S1 — Reviews
    { loc: "/reviews/ergometrica-silenciosa-apartamento", changefreq: "monthly", priority: "0.8" },
    { loc: "/reviews/ergometrica-para-idosos",            changefreq: "monthly", priority: "0.8" },
    { loc: "/reviews/ergometrica-reabilitacao",           changefreq: "monthly", priority: "0.8" },
    { loc: "/reviews/ergometrica-acima-100kg",            changefreq: "monthly", priority: "0.8" },

    // S2 — Como Usar
    { loc: "/como-usar",                  changefreq: "monthly", priority: "0.8" },
    { loc: "/como-usar/ajuste-ergonomico",changefreq: "monthly", priority: "0.7" },
    { loc: "/como-usar/quanto-tempo-pedalar", changefreq: "monthly", priority: "0.7" },
    { loc: "/como-usar/manutencao-correia",   changefreq: "monthly", priority: "0.7" },
    { loc: "/como-usar/roda-de-inercia",      changefreq: "monthly", priority: "0.7" },

    // S3 — Ferramentas
    { loc: "/ferramentas/quiz-qual-ergometrica", changefreq: "yearly",  priority: "0.9" },
    { loc: "/ferramentas/calculadora-calorias",  changefreq: "yearly",  priority: "0.8" },

    // Institucional
    { loc: "/sobre", changefreq: "yearly", priority: "0.5" },
  ];

  const xmlUrls = urls
    .map(
      (u) => `
  <url>
    <loc>${siteUrl}${u.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlUrls}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400", // cache de 24h
    },
  });
};
