export type MediaType = "LIVRE" | "FILM";

export const TYPES = {
  livres: {
    type: "LIVRE" as MediaType,
    titre: "Livres",
    un: "un livre",
    auteurLabel: "Auteur",
    aFaire: "À lire",
    fait: "Lus",
    marquerFait: "Marquer comme lu",
    recherche: "Chercher un livre à ajouter (titre ou auteur)",
  },
  films: {
    type: "FILM" as MediaType,
    titre: "Films",
    un: "un film",
    auteurLabel: "Réalisateur",
    aFaire: "À voir",
    fait: "Vus",
    marquerFait: "Marquer comme vu",
    recherche: "Chercher un film à ajouter",
  },
} as const;

export type Slug = keyof typeof TYPES;
