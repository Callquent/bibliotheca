import type { Slug } from "@/lib/config";

function teinte(titre: string, section: Slug) {
  let h = 0;
  for (const c of titre) h = (h * 31 + c.charCodeAt(0)) % 360;
  const base = section === "livres" ? 160 : 340;
  return (base + (h % 50) - 25 + 360) % 360;
}

export default function Poster({
  titre,
  image,
  section,
}: {
  titre: string;
  image: string | null;
  section: Slug;
}) {
  if (image) {
    return (
      <div className="poster">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt="" loading="lazy" />
      </div>
    );
  }
  return (
    <div
      className={`poster poster-fallback ${section}`}
      style={{ background: `hsl(${teinte(titre, section)} 38% 30%)` }}
    >
      <span>{titre}</span>
    </div>
  );
}
