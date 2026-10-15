import site from "../content/site.json";
import { contentDir, loadExperience, type Bloc } from "./content";
import { loadFiches, type Chiffre, type Fiche, type Visibilite } from "./fiches";
import { texteBrut } from "./texte-brut";

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
  sections: { titre: string; texte: string }[];
};
export type Proofs = {
  version: string;
  nom: string;
  titre: string;
  email: string;
  github: string;
  linkedin: string;
  url: string;
  fiches: ProofFiche[];
  /** Les postes de la section Expérience, du plus récent au plus ancien, employeur compris. */
  parcours: Bloc[];
};

/** Version du format de `/proofs.json` ; elle change quand une clé change de sens ou disparaît. */
const VERSION = "1.0";

/** Une fiche telle que la lit un agent : liens absolus, texte brut, ni statut ni visuel. */
function proofFiche({ slug, frontmatter, enBref, chiffres = [], captures = [], sections }: Fiche): ProofFiche {
  return {
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
    sections: sections.map(({ titre, markdown = "" }) => ({ titre, texte: texteBrut(markdown, site.url) })),
  };
}

/**
 * Le contenu de `/proofs.json` : les preuves lisibles par un agent IA (PFO-112).
 * Mêmes fiches que les cartes de l'accueil, dans le même ordre (`loadFiches`).
 */
export function buildProofs({ fichesDir }: { fichesDir?: string } = {}): Proofs {
  return {
    version: VERSION,
    nom: site.name,
    titre: site.title,
    email: site.email,
    github: site.links.github,
    linkedin: site.links.linkedin,
    url: site.url,
    fiches: loadFiches(fichesDir).map(proofFiche),
    parcours: loadExperience(contentDir).blocs,
  };
}
