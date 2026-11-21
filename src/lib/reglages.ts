import { prisma } from "@/lib/prisma";

export const CLE_TMDB = "tmdb_api_key";

export async function getReglage(cle: string): Promise<string | null> {
  const r = await prisma.reglage.findUnique({ where: { cle } });
  return r?.valeur ?? null;
}

export async function setReglage(cle: string, valeur: string) {
  await prisma.reglage.upsert({
    where: { cle },
    create: { cle, valeur },
    update: { valeur },
  });
}

export async function supprimerReglage(cle: string) {
  await prisma.reglage.deleteMany({ where: { cle } });
}

// Clé TMDB : base de données en priorité, variable d'environnement en secours
export async function getCleTmdb(): Promise<string | null> {
  return (await getReglage(CLE_TMDB)) ?? (process.env.TMDB_API_KEY?.trim() || null);
}
