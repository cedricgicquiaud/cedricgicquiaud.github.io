import site from "../content/site.json";
import { loadFiches, type Chiffre, type Visibilite } from "./fiches";

export type ProofFiche = {
  slug: string;
  nom: string;
  url: string;
  periode: string;
  role: string;
  stack: string[];
  visibilite: Visibilite;
  depot: string;
  demo: string;
  enBref: string;
  chiffres: Chiffre[];
  captures: { legende: string; url: string }[];
};
export type Proofs = { fiches: ProofFiche[] };

/**
 * Le contenu de `/proofs.json` : les preuves lisibles par un agent IA (PFO-112).
 * Mêmes fiches que les cartes de l'accueil, dans le même ordre (`loadFiches`).
 */
export function buildProofs({ fichesDir }: { fichesDir?: string } = {}): Proofs {
  return {
    fiches: loadFiches(fichesDir).map(({ slug, frontmatter, enBref, chiffres = [], captures = [] }) => ({
      slug,
      nom: frontmatter.nom,
      url: `${site.url}/projets/${slug}/`,
      periode: frontmatter.periode,
      role: frontmatter.role,
      stack: frontmatter.stack,
      visibilite: frontmatter.visibilite,
      // URL ou vide : `lib/fiches` écarte déjà la prose et masque les liens d'une fiche anonyme ou privée.
      depot: frontmatter.depot,
      demo: frontmatter.demo,
      // Même accroche que la page de la fiche (components/fiche.tsx) : les trois phrases bout à bout.
      enBref: [enBref.quoi, enBref.chiffre, enBref.lien].filter(Boolean).join(" "),
      chiffres,
      captures: captures.map(({ fichier, legende }) => ({ legende, url: site.url + fichier })),
    })),
  };
}
