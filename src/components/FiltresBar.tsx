"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

export default function FiltresBar() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [, startTransition] = useTransition();

  function maj(cle: string, valeur: string) {
    const p = new URLSearchParams(params.toString());
    if (valeur) p.set(cle, valeur);
    else p.delete(cle);
    const s = p.toString();
    startTransition(() => router.replace(s ? `${pathname}?${s}` : pathname, { scroll: false }));
  }

  useEffect(() => {
    const t = setTimeout(() => {
      if ((params.get("q") ?? "") !== q.trim()) maj("q", q.trim());
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="toolbar">
      <input
        type="search"
        className="form-control"
        placeholder="Filtrer dans cette liste"
        aria-label="Filtrer dans cette liste"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <select
        className="form-select"
        aria-label="Trier"
        value={params.get("tri") ?? ""}
        onChange={(e) => maj("tri", e.target.value)}
      >
        <option value="">Plus récents</option>
        <option value="titre">Titre (A à Z)</option>
        <option value="note">Mieux notés</option>
      </select>
    </div>
  );
}
