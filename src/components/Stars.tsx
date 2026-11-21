"use client";

import { useState } from "react";

export default function Stars({ defaultValue = 0 }: { defaultValue?: number }) {
  const [valeur, setValeur] = useState(defaultValue);
  const [survol, setSurvol] = useState(0);
  const affichee = survol || valeur;

  return (
    <div className="stars-input" role="group" aria-label="Note" onMouseLeave={() => setSurvol(0)}>
      <input type="hidden" name="note" value={valeur} />
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={n <= affichee ? "on" : ""}
          aria-label={`${n} sur 5`}
          aria-pressed={n === valeur}
          onMouseEnter={() => setSurvol(n)}
          onClick={() => setValeur(valeur === n ? 0 : n)}
        >
          ★
        </button>
      ))}
      {valeur > 0 && (
        <button type="button" className="clear" onClick={() => setValeur(0)}>
          Effacer
        </button>
      )}
    </div>
  );
}
