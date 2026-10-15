import site from "../content/site.json";
import { loadFiches } from "./fiches";

export type ProofFiche = { slug: string; url: string };
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
    })),
  };
}
