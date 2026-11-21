"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LIENS = [
  { href: "/", label: "Accueil", couleur: "var(--neutral)", exact: true },
  { href: "/livres", label: "Livres", couleur: "var(--livres)" },
  { href: "/films", label: "Films", couleur: "var(--films)" },
  { href: "/reglages", label: "Réglages", couleur: "var(--neutral)" },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="nav-links" aria-label="Navigation principale">
      {LIENS.map((l) => {
        const actif = l.exact ? pathname === l.href : pathname === l.href || pathname.startsWith(l.href + "/");
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={actif ? "page" : undefined}
            className={actif ? "actif" : ""}
            style={{ "--c": l.couleur } as React.CSSProperties}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
