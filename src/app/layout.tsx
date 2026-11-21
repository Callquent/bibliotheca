import type { Metadata } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import Link from "next/link";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import NavLinks from "@/components/NavLinks";
import ThemeToggle from "@/components/ThemeToggle";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display" });
const corps = Figtree({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Médiathèque",
  description: "Livres et films : à lire, lus, à voir, vus",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "48x48" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

// Applique le thème avant l’affichage pour éviter un flash
const themeScript = `try{var t=localStorage.getItem("theme")||(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.setAttribute("data-bs-theme",t)}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${display.variable} ${corps.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <header className="site-header">
          <div className="container site-header-inner">
            <Link href="/" className="brand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" alt="" width={30} height={30} />
              Médiathèque
            </Link>
            <NavLinks />
            <ThemeToggle />
          </div>
        </header>
        <main className="container page">{children}</main>
      </body>
    </html>
  );
}
