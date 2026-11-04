// PFO-136 : ce qu'une fiche factice doit contenir pour passer `sync-fiches`, qui refuse une fiche
// sans les sections du gabarit ni `stack_detail`.

/** Livrables, Architecture et Décisions, à placer après « ## Problème ». */
export const SECTIONS_NOUVELLES = `
## Livrables

- Un écran.

## Architecture

Le serveur.

## Décisions

### Un choix

Parce que.
`;

/** Toutes les sections qui suivent « ## Problème » : les nouvelles, puis Preuves, Ce que j'en ai appris, Artefacts. */
export const SECTIONS_APRES_PROBLEME = `${SECTIONS_NOUVELLES}
## Preuves

Les preuves.

## Ce que j'en ai appris

Les leçons.

## Artefacts

- Dépôt : https://github.com/x/alpha
`;

/** Lignes YAML d'un `stack_detail` minimal, à ajouter au frontmatter. */
export const STACK_DETAIL = "stack_detail:\n  - categorie: Langage\n    outils: TypeScript\n";
