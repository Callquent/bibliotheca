"use client";

import { useState } from "react";
import type { Slug } from "@/lib/config";
import type { Item, Labels } from "@/lib/types";
import DetailDialog from "./DetailDialog";
import Poster from "./Poster";

export default function MediaWall({
  items,
  slug,
  labels,
}: {
  items: Item[];
  slug: Slug;
  labels: Labels;
}) {
  const [ouvertId, setOuvertId] = useState<number | null>(null);
  const selection = items.find((i) => i.id === ouvertId) ?? null;

  return (
    <>
      <div className="wall">
        {items.map((m) => (
          <button key={m.id} type="button" className="tile" onClick={() => setOuvertId(m.id)}>
            <Poster titre={m.titre} image={m.image} section={slug} />
            <span className="tile-title">{m.titre}</span>
            {m.auteur && <span className="tile-sub">{m.auteur}</span>}
            {m.note ? (
              <span className="stars-sm" aria-label={`Note : ${m.note} sur 5`}>
                {"★".repeat(m.note)}
                {"☆".repeat(5 - m.note)}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {selection && (
        <DetailDialog
          key={selection.id}
          item={selection}
          slug={slug}
          labels={labels}
          onClose={() => setOuvertId(null)}
        />
      )}
    </>
  );
}
