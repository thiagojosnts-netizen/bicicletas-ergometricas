// src/lib/pexels.js
// Busca imagens de bicicletas ergométricas na Pexels API

const PEXELS_API_KEY = import.meta.env.PEXELS_API_KEY ?? process.env.PEXELS_API_KEY;

export async function fetchBikeImage(query = "exercise bike ergometric") {
  if (!PEXELS_API_KEY) {
    console.warn("PEXELS_API_KEY não configurada no .env");
    return null;
  }

  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      {
        headers: { Authorization: PEXELS_API_KEY },
      }
    );

    if (!res.ok) throw new Error(`Pexels API error: ${res.status}`);

    const data = await res.json();
    const photo = data.photos?.[0];

    if (!photo) return null;

    return {
      url: photo.src.large,
      thumb: photo.src.medium,
      alt: photo.alt || query,
      photographer: photo.photographer,
      photographerUrl: photo.photographer_url,
      pexelsUrl: photo.url,
    };
  } catch (err) {
    console.error("Erro ao buscar imagem Pexels:", err);
    return null;
  }
}

export async function fetchMultipleBikeImages(queries = []) {
  const results = await Promise.all(queries.map((q) => fetchBikeImage(q)));
  return results.filter(Boolean);
}
