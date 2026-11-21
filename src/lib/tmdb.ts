export function nettoyerCle(brut: string) {
  return brut.trim().replace(/^["']|["']$/g, "");
}

// Accepte les deux formats de clé TMDB :
//  - jeton v4 "API Read Access Token" (long, commence par "eyJ") -> en-tête Bearer
//  - clé v3 "API Key" (32 caractères)                           -> paramètre api_key
export function tmdbFetch(
  cle: string,
  path: string,
  params: Record<string, string> = {},
  cache = true
) {
  const url = new URL(`https://api.themoviedb.org/3${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const headers: Record<string, string> = { accept: "application/json" };
  if (cle.length > 40) headers.Authorization = `Bearer ${cle}`;
  else url.searchParams.set("api_key", cle);

  return fetch(
    url,
    cache ? { headers, next: { revalidate: 3600 } } : { headers, cache: "no-store" }
  );
}
