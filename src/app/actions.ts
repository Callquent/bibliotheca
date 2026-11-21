"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const clean = (v: FormDataEntryValue | null) => {
  const s = typeof v === "string" ? v.trim() : "";
  return s === "" ? null : s;
};

function rafraichir(slug: string) {
  revalidatePath(`/${slug}`);
  revalidatePath("/");
}

export async function ajouterMedia(
  slug: string,
  data: { titre: string; auteur: string | null; image: string | null }
): Promise<{ ok: boolean; message: string }> {
  const titre = data.titre.trim();
  if (!titre) return { ok: false, message: "Saisis un titre." };

  const type = slug === "films" ? "FILM" : "LIVRE";
  const existant = await prisma.media.findFirst({ where: { type, titre } });
  if (existant) {
    return { ok: false, message: `« ${titre} » est déjà dans ta médiathèque.` };
  }

  await prisma.media.create({
    data: { type, titre, auteur: data.auteur, image: data.image },
  });
  rafraichir(slug);
  return { ok: true, message: "" };
}

// intent : "enregistrer" | "fait" | "afaire"
export async function mettreAJour(slug: string, id: number, formData: FormData) {
  const titre = clean(formData.get("titre"));
  if (!titre) return;

  const intent = String(formData.get("intent") ?? "enregistrer");
  const note = Number(formData.get("note"));

  const base = {
    titre,
    auteur: clean(formData.get("auteur")),
    commentaire: clean(formData.get("commentaire")),
    note: note >= 1 && note <= 5 ? note : null,
  };

  if (intent === "fait") {
    await prisma.media.update({
      where: { id },
      data: { ...base, statut: "FAIT", termineLe: new Date() },
    });
  } else if (intent === "afaire") {
    await prisma.media.update({
      where: { id },
      data: { ...base, statut: "A_FAIRE", termineLe: null, note: null },
    });
  } else {
    await prisma.media.update({ where: { id }, data: base });
  }
  rafraichir(slug);
}

export async function supprimerMedia(slug: string, id: number) {
  await prisma.media.delete({ where: { id } });
  rafraichir(slug);
}
