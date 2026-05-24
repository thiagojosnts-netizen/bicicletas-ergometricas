export async function GET() {
  const siteUrl = "https://bicicletasergometricas.com";
  const now = new Date().toISOString().split("T")[0];
  const urls = [
    { loc: "/", priority: "1.0" },
    { loc: "/guia", priority: "0.9" },
    { loc: "/comparativos", priority: "0.8" },
    { loc: "/ferramentas/quiz-qual-ergometrica", priority: "0.9" },
    { loc: "/ferramentas/calculadora-calorias", priority: "0.8" },
    { loc: "/como-usar", priority: "0.8" },
    { loc: "/reviews/ergometrica-silenciosa-apartamento", priority: "0.8" },
    { loc: "/reviews/ergometrica-para-idosos", priority: "0.8" },
    { loc: "/reviews/ergometrica-reabilitacao", priority: "0.8" },
    { loc: "/reviews/ergometrica-acima-100kg", priority: "0.8" },
    { loc: "/sobre", priority: "0.5" },
  ];
  const items = urls.map(u => "<url><loc>" + siteUrl + u.loc + "</loc><lastmod>" + now + "</lastmod><priority>" + u.priority + "</priority></url>").join("");
  const xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">" + items + "</urlset>";
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
