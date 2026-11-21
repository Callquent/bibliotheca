import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { TYPES, type Slug } from "@/lib/config";
import Poster from "@/components/Poster";

export const dynamic = "force-dynamic";

export default async function Accueil() {
  const sections = await Promise.all(
    (Object.keys(TYPES) as Slug[]).map(async (slug) => {
      const cfg = TYPES[slug];
      const [aFaire, fait, prochains] = await Promise.all([
        prisma.media.count({ where: { type: cfg.type, statut: "A_FAIRE" } }),
        prisma.media.count({ where: { type: cfg.type, statut: "FAIT" } }),
        prisma.media.findMany({
          where: { type: cfg.type, statut: "A_FAIRE" },
          orderBy: { createdAt: "desc" },
          take: 6,
        }),
      ]);
      return { slug, cfg, aFaire, fait, prochains };
    })
  );

  return (
    <>
      <h1 className="page-title mb-4">Ma médiathèque</h1>

      <div className="row g-4">
        {sections.map(({ slug, cfg, aFaire, fait, prochains }) => (
          <div className="col-lg-6" key={slug}>
            <section className="panel" data-section={slug}>
              <h2 className="panel-title">
                <Link href={`/${slug}`}>{cfg.titre}</Link>
              </h2>
              <p className="muted">
                {aFaire} {cfg.aFaire.toLowerCase()}, {fait} {cfg.fait.toLowerCase()}
              </p>

              {prochains.length > 0 ? (
                <>
                  <p className="muted small mb-2">Ajoutés récemment</p>
                  <div className="strip">
                    {prochains.map((m) => (
                      <Link key={m.id} href={`/${slug}`} title={m.titre} className="strip-item">
                        <Poster titre={m.titre} image={m.image} section={slug} />
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <p className="empty">Ta liste est vide. Ajoute {cfg.un} pour commencer.</p>
              )}

              <Link className="btn btn-accent mt-3" href={`/${slug}`}>
                Ouvrir {cfg.titre.toLowerCase()}
              </Link>
            </section>
          </div>
        ))}
      </div>
    </>
  );
}
