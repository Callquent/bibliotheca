"use client";

import { useEffect, useRef, useState } from "react";
import { mettreAJour, supprimerMedia } from "@/app/actions";
import type { Slug } from "@/lib/config";
import type { Item, Labels } from "@/lib/types";
import Poster from "./Poster";
import Stars from "./Stars";

export default function DetailDialog({
  item,
  slug,
  labels,
  onClose,
}: {
  item: Item;
  slug: Slug;
  labels: Labels;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [confirmer, setConfirmer] = useState(false);
  const [enCours, setEnCours] = useState(false);
  const fait = item.statut === "FAIT";

  useEffect(() => {
    if (ref.current && !ref.current.open) ref.current.showModal();
  }, []);

  async function enregistrer(fd: FormData) {
    setEnCours(true);
    try {
      await mettreAJour(slug, item.id, fd);
      ref.current?.close();
    } finally {
      setEnCours(false);
    }
  }

  async function supprimer() {
    setEnCours(true);
    try {
      await supprimerMedia(slug, item.id);
      ref.current?.close();
    } finally {
      setEnCours(false);
    }
  }

  return (
    <dialog
      ref={ref}
      className="detail"
      aria-label={item.titre}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) ref.current?.close();
      }}
    >
      <form className="detail-body" action={enregistrer}>
        <div className="detail-poster">
          <Poster titre={item.titre} image={item.image} section={slug} />
        </div>

        <div className="detail-fields">
          <button type="button" className="detail-close" aria-label="Fermer" onClick={() => ref.current?.close()}>
            ×
          </button>

          <label className="field">
            <span>Titre</span>
            <input name="titre" className="form-control" defaultValue={item.titre} required />
          </label>

          <label className="field">
            <span>{labels.auteurLabel}</span>
            <input name="auteur" className="form-control" defaultValue={item.auteur ?? ""} />
          </label>

          <div className="field">
            <span>Note</span>
            <Stars defaultValue={item.note ?? 0} />
          </div>

          <label className="field">
            <span>Commentaire</span>
            <textarea name="commentaire" className="form-control" rows={3} defaultValue={item.commentaire ?? ""} />
          </label>

          {fait && item.termineLe && (
            <p className="muted small mb-0">
              Terminé le {new Date(item.termineLe).toLocaleDateString("fr-FR")}
            </p>
          )}

          <div className="detail-actions">
            {fait ? (
              <>
                <button name="intent" value="enregistrer" className="btn btn-accent" disabled={enCours}>
                  Enregistrer
                </button>
                <button name="intent" value="afaire" className="btn btn-quiet" disabled={enCours}>
                  {labels.remettre}
                </button>
              </>
            ) : (
              <>
                <button name="intent" value="fait" className="btn btn-accent" disabled={enCours}>
                  {labels.marquerFait}
                </button>
                <button name="intent" value="enregistrer" className="btn btn-quiet" disabled={enCours}>
                  Enregistrer
                </button>
              </>
            )}

            <span className="spacer" />

            {confirmer ? (
              <>
                <button type="button" className="btn btn-danger-soft" onClick={supprimer} disabled={enCours}>
                  Supprimer définitivement
                </button>
                <button type="button" className="btn btn-quiet" onClick={() => setConfirmer(false)}>
                  Annuler
                </button>
              </>
            ) : (
              <button type="button" className="btn btn-link link-danger" onClick={() => setConfirmer(true)}>
                Supprimer
              </button>
            )}
          </div>
        </div>
      </form>
    </dialog>
  );
}
