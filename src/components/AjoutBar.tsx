"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import type { Suggestion } from "@/app/api/recherche/route";
import { ajouterMedia } from "@/app/actions";

type Props = { slug: string; placeholder: string; listeLabel: string };
type Toast = { ok: boolean; message: string } | null;

export default function AjoutBar({ slug, placeholder, listeLabel }: Props) {
  const [texte, setTexte] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [termine, setTermine] = useState(false);
  const [actif, setActif] = useState(-1);
  const [ouvert, setOuvert] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast>(null);
  const [enCours, startTransition] = useTransition();
  const conteneur = useRef<HTMLDivElement>(null);
  const champ = useRef<HTMLInputElement>(null);
  const id = useId();

  // Recherche avec délai
  useEffect(() => {
    setTermine(false);
    setActif(-1);
    if (texte.trim().length < 2) {
      setSuggestions([]);
      setErreur(null);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/recherche?type=${slug}&q=${encodeURIComponent(texte.trim())}`,
          { signal: ctrl.signal }
        );
        const data = await res.json();
        if (Array.isArray(data)) {
          setSuggestions(data);
          setErreur(null);
        } else {
          setSuggestions([]);
          setErreur(data.error ?? "La recherche a échoué.");
        }
        setTermine(true);
        setOuvert(true);
      } catch {}
    }, 300);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [texte, slug]);

  // Fermer en cliquant ailleurs
  useEffect(() => {
    function dehors(e: MouseEvent) {
      if (!conteneur.current?.contains(e.target as Node)) setOuvert(false);
    }
    document.addEventListener("mousedown", dehors);
    return () => document.removeEventListener("mousedown", dehors);
  }, []);

  // Message de confirmation éphémère
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  // Garder l’option active visible pendant la navigation au clavier
  useEffect(() => {
    if (actif >= 0) document.getElementById(`${id}-${actif}`)?.scrollIntoView({ block: "nearest" });
  }, [actif, id]);

  function ajouter(s: { titre: string; auteur: string | null; image: string | null }) {
    startTransition(async () => {
      const r = await ajouterMedia(slug, s);
      if (r.ok) {
        setToast({ ok: true, message: `« ${s.titre} » ajouté à ta liste « ${listeLabel} ».` });
        setTexte("");
        setOuvert(false);
      } else {
        setToast({ ok: false, message: r.message });
      }
      champ.current?.focus();
    });
  }

  function ajouterTexte() {
    if (texte.trim()) ajouter({ titre: texte.trim(), auteur: null, image: null });
  }

  function touche(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOuvert(true);
      setActif((a) => Math.min(a + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActif((a) => Math.max(a - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (ouvert && actif >= 0 && suggestions[actif]) {
        const s = suggestions[actif];
        ajouter({ titre: s.titre, auteur: s.auteur, image: s.image });
      } else {
        ajouterTexte();
      }
    } else if (e.key === "Escape") {
      setOuvert(false);
      setActif(-1);
    }
  }

  const afficherListe = ouvert && texte.trim().length >= 2 && (suggestions.length > 0 || termine);

  return (
    <div className="addbar" ref={conteneur}>
      <div className="addbar-row">
        <input
          ref={champ}
          className="addbar-input"
          role="combobox"
          aria-expanded={afficherListe}
          aria-controls={`${id}-liste`}
          aria-autocomplete="list"
          aria-activedescendant={actif >= 0 ? `${id}-${actif}` : undefined}
          placeholder={placeholder}
          autoComplete="off"
          value={texte}
          onChange={(e) => {
            setTexte(e.target.value);
            setOuvert(true);
          }}
          onFocus={() => suggestions.length > 0 && setOuvert(true)}
          onKeyDown={touche}
        />
        <button type="button" className="btn btn-accent" onClick={ajouterTexte} disabled={enCours || !texte.trim()}>
          Ajouter
        </button>
      </div>

      {afficherListe && (
        <div className="suggest" id={`${id}-liste`}>
          {erreur && (
            <div className="suggest-note text-danger">
              {erreur} <Link href="/reglages">Ouvrir les réglages</Link>
            </div>
          )}

          {suggestions.length > 0 && (
            <ul role="listbox" className="suggest-list">
              {suggestions.map((s, i) => (
                <li
                  key={i}
                  id={`${id}-${i}`}
                  role="option"
                  aria-selected={i === actif}
                  className={i === actif ? "actif" : ""}
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseMove={() => setActif(i)}
                  onClick={() => ajouter({ titre: s.titre, auteur: s.auteur, image: s.image })}
                >
                  {s.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.image} alt="" width={36} height={54} />
                  ) : (
                    <span className="thumb-vide" />
                  )}
                  <span>
                    <span className="suggest-titre">{s.titre}</span>
                    <span className="suggest-meta">
                      {[s.auteur, s.annee].filter(Boolean).join(", ")}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}

          {termine && !erreur && suggestions.length === 0 && (
            <div className="suggest-note">
              Aucune suggestion. Appuie sur Entrée pour ajouter « {texte.trim()} » tel quel.
            </div>
          )}
        </div>
      )}

      <div className="toast-zone" aria-live="polite">
        {toast && <div className={`toast-msg ${toast.ok ? "" : "warn"}`}>{toast.message}</div>}
      </div>
    </div>
  );
}
