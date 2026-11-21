import Link from "next/link";
import { notFound } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { TYPES, type Slug } from "@/lib/config";
import type { Item } from "@/lib/types";
import AjoutBar from "@/components/AjoutBar";
import FiltresBar from "@/components/FiltresBar";
import MediaWall from "@/components/MediaWall";

export const dynamic = "force-dynamic";

export default async function MediaPage({
  params,
  searchParams,
}: {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ tab?: string; q?: string; tri?: string }>;
}) {
  const { type: slug } = await params;
  if (!(slug in TYPES)) notFound();

  const cfg = TYPES[slug as Slug];
  const { tab, q = "", tri = "" } = await searchParams;
  const statut = tab === "fait" ? "FAIT" : "A_FAIRE";

  const where: Prisma.MediaWhereInput = {
    type: cfg.type,
    statut,
    ...(q ? { OR: [{ titre: { contains: q } }, { auteur: { contains: q } }] } : {}),
  };
  const orderBy: Prisma.MediaOrderByWithRelationInput =
    tri === "titre" ? { titre: "asc" } : statut === "FAIT" ? { termineLe: "desc" } : { createdAt: "desc" };

  const [trouves, countAFaire, countFait] = await Promise.all([
    prisma.media.findMany({ where, orderBy }),
    prisma.media.count({ where: { type: cfg.type, statut: "A_FAIRE" } }),
    prisma.media.count({ where: { type: cfg.type, statut: "FAIT" } }),
  ]);

  if (tri === "note") {
    trouves.sort((a, b) => (b.note ?? 0) - (a.note ?? 0) || a.titre.localeCompare(b.titre, "fr"));
  }

  const items: Item[] = trouves.map((m) => ({
    id: m.id,
    titre: m.titre,
    auteur: m.auteur,
    image: m.image,
    statut: m.statut,
    note: m.note,
    commentaire: m.commentaire,
    termineLe: m.termineLe ? m.termineLe.toISOString() : null,
  }));

  const total = statut === "FAIT" ? countFait : countAFaire;

  return (
    <div data-section={slug}>
      <div className="page-head">
        <h1 className="page-title">{cfg.titre}</h1>
        <nav className="segmented" aria-label="Statut">
          <Link
            href={`/${slug}`}
            className={`seg ${statut === "A_FAIRE" ? "active" : ""}`}
            aria-current={statut === "A_FAIRE" ? "page" : undefined}
          >
            {cfg.aFaire} <span className="count">{countAFaire}</span>
          </Link>
          <Link
            href={`/${slug}?tab=fait`}
            className={`seg ${statut === "FAIT" ? "active" : ""}`}
            aria-current={statut === "FAIT" ? "page" : undefined}
          >
            {cfg.fait} <span className="count">{countFait}</span>
          </Link>
        </nav>
      </div>

      <AjoutBar slug={slug} placeholder={cfg.recherche} listeLabel={cfg.aFaire.toLowerCase()} />

      {total > 0 && <FiltresBar key={statut} />}

      {items.length > 0 ? (
        <MediaWall
          items={items}
          slug={slug as Slug}
          labels={{
            auteurLabel: cfg.auteurLabel,
            marquerFait: cfg.marquerFait,
            remettre: `Remettre dans « ${cfg.aFaire} »`,
          }}
        />
      ) : (
        <p className="empty">
          {q
            ? `Aucun résultat pour « ${q} ».`
            : statut === "A_FAIRE"
            ? `Ta liste « ${cfg.aFaire.toLowerCase()} » est vide. Cherche un titre ci-dessus pour l’ajouter.`
            : `Rien dans « ${cfg.fait.toLowerCase()} » pour l’instant. Ouvre un titre de ta liste et marque-le comme terminé.`}
        </p>
      )}
    </div>
  );
}
