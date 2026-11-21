export type Item = {
  id: number;
  titre: string;
  auteur: string | null;
  image: string | null;
  statut: string;
  note: number | null;
  commentaire: string | null;
  termineLe: string | null;
};

export type Labels = {
  auteurLabel: string;
  marquerFait: string;
  remettre: string;
};
