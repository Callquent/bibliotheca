"use client";

import { useActionState } from "react";
import { sauvegarderCleTmdb, type EtatReglage } from "@/app/reglages/actions";

export default function ReglagesForm({ apercu }: { apercu: string | null }) {
  const [etat, action, enCours] = useActionState<EtatReglage, FormData>(
    sauvegarderCleTmdb,
    null
  );

  return (
    <form action={action} className="card panel-plain">
      <div className="card-body">
        <h2 className="h5">TMDB (films)</h2>
        <p className="text-muted small mb-3">
          Sert à récupérer les affiches et les réalisateurs. Jeton « API Read Access Token » (v4)
          ou clé « API Key » (v3), à créer sur{" "}
          <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noreferrer">
            themoviedb.org/settings/api
          </a>
          .
        </p>

        <p className="mb-2">
          État :{" "}
          {apercu ? (
            <span className="badge text-bg-success">Clé enregistrée ({apercu})</span>
          ) : (
            <span className="badge text-bg-warning">Aucune clé</span>
          )}
        </p>

        <div className="input-group">
          <input
            name="cle"
            type="password"
            autoComplete="off"
            className="form-control"
            placeholder={apercu ? "Remplacer la clé…" : "Coller la clé TMDB"}
          />
          <button className="btn btn-accent" disabled={enCours}>
            {enCours ? "Vérification…" : "Enregistrer"}
          </button>
          {apercu && (
            <button
              className="btn btn-outline-danger"
              name="action"
              value="supprimer"
              formNoValidate
              disabled={enCours}
            >
              Supprimer
            </button>
          )}
        </div>

        {etat && (
          <div className={`mt-3 alert py-2 mb-0 alert-${etat.ok ? "success" : "danger"}`}>
            {etat.message}
          </div>
        )}
      </div>
    </form>
  );
}
