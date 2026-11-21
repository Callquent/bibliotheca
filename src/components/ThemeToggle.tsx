"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    setTheme(document.documentElement.getAttribute("data-bs-theme") === "dark" ? "dark" : "light");
  }, []);

  function basculer() {
    const suivant = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-bs-theme", suivant);
    try {
      localStorage.setItem("theme", suivant);
    } catch {}
    setTheme(suivant);
  }

  const libelle = theme === "dark" ? "Passer au thème clair" : "Passer au thème sombre";

  return (
    <button type="button" className="icon-btn" onClick={basculer} aria-label={libelle} title={libelle}>
      {theme === "dark" ? "☀" : "☾"}
    </button>
  );
}
