"use server";

import { revalidatePath } from "next/cache";
import { CLE_TMDB, setReglage, supprimerReglage } from "@/lib/reglages";
import { nettoyerCle, tmdbFetch } from "@/lib/tmdb";

export type EtatReglage = { ok: boolean; message: string } | null;

export async function sauvegarderCleTmdb(
  _prev: EtatReglage,
  formData: FormData
): Promise<EtatReglage> {
  if (formData.get("action") === "supprimer") {
    await supprimerReglage(CLE_TMDB);
    revalidatePath("/reglages");
    return { ok: true, message: "Clé supprimée." };
  }

  const cle = nettoyerCle(String(formData.get("cle") ?? ""));
  if (!cle) return { ok: false, message: "Saisis une clé." };

  try {
    const res = await tmdbFetch(cle, "/configuration", {}, false);
    if (!res.ok) {
      return {
        ok: false,
        message: `TMDB a refusé cette clé (erreur ${res.status}). Elle n'a pas été enregistrée.`,
      };
    }
  } catch {
    return { ok: false, message: "Impossible de joindre TMDB pour vérifier la clé." };
  }

  await setReglage(CLE_TMDB, cle);
  revalidatePath("/reglages");
  return { ok: true, message: "Clé vérifiée et enregistrée." };
}
