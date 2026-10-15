import site from "../content/site.json";
import { loadFiches } from "./fiches";

export type ProofFiche = { slug: string; url: string; enBref: string };
export type Proofs = { fiches: ProofFiche[] };

/**
 * Le contenu de `/proofs.json` : les preuves lisibles par un agent IA (PFO-112).
 * Mêmes fiches que les cartes de l'accueil, dans le même ordre (`loadFiches`).
 */
export function buildProofs({ fichesDir }: { fichesDir?: string } = {}): Proofs {
  return {
    fiches: loadFiches(fichesDir).map((fiche) => ({
      slug: fiche.slug,
      url: `${site.url}/projets/${fiche.slug}/`,
      // Même accroche que la page de la fiche (components/fiche.tsx) : les trois phrases bout à bout.
      enBref: [fiche.enBref.quoi, fiche.enBref.chiffre, fiche.enBref.lien].filter(Boolean).join(" "),
    })),
  };
}
