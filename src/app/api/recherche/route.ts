import { NextRequest, NextResponse } from "next/server";
import { getCleTmdb } from "@/lib/reglages";
import { tmdbFetch } from "@/lib/tmdb";

export type Suggestion = {
  titre: string;
  auteur: string | null; // auteur (livre) ou réalisateur(s) (film)
  annee: number | null;
  image: string | null;
};

/* ---------- Livres (Open Library, sans clé) ---------- */

async function chercherLivres(q: string): Promise<Suggestion[]> {
  const url =
    "https://openlibrary.org/search.json?limit=8&fields=title,author_name,first_publish_year,cover_i&q=" +
    encodeURIComponent(q);
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) {
    console.error("Open Library :", res.status);
    return [];
  }
  const data = await res.json();

  return (data.docs ?? []).map((d: any) => ({
    titre: d.title,
    auteur: d.author_name?.[0] ?? null,
    annee: d.first_publish_year ?? null,
    image: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-M.jpg` : null,
  }));
}

/* ---------- Films (TMDB) ---------- */

async function realisateurs(cle: string, id: number): Promise<string | null> {
  try {
    const res = await tmdbFetch(cle, `/movie/${id}/credits`);
    if (!res.ok) return null;
    const data = await res.json();
    const noms: string[] = (data.crew ?? [])
      .filter((c: any) => c.job === "Director")
      .map((c: any) => c.name);
    return noms.length ? [...new Set(noms)].join(", ") : null;
  } catch {
    return null;
  }
}

async function chercherFilms(q: string): Promise<Suggestion[]> {
  const cle = await getCleTmdb();
  if (!cle) throw new Error("Clé TMDB manquante : ajoute-la dans Réglages.");

  const res = await tmdbFetch(cle, "/search/movie", {
    query: q,
    language: "fr-FR",
    include_adult: "false",
  });
  if (!res.ok) {
    console.error("TMDB :", res.status, await res.text());
    throw new Error(`Clé TMDB refusée (erreur ${res.status}) : vérifie-la dans Réglages.`);
  }
  const data = await res.json();
  const films: any[] = (data.results ?? []).slice(0, 8);

  return Promise.all(
    films.map(async (f) => ({
      titre: f.title,
      auteur: await realisateurs(cle, f.id),
      annee: f.release_date ? Number(f.release_date.slice(0, 4)) : null,
      image: f.poster_path ? `https://image.tmdb.org/t/p/w342${f.poster_path}` : null,
    }))
  );
}

/* ---------- Route ---------- */

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  const type = req.nextUrl.searchParams.get("type");

  if (q.length < 2) return NextResponse.json([]);

  try {
    const resultats = type === "films" ? await chercherFilms(q) : await chercherLivres(q);
    return NextResponse.json(resultats);
  } catch (e) {
    console.error("Recherche :", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Erreur de recherche." });
  }
}
