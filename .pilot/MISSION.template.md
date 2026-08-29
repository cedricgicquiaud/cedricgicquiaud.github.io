# MISSION — <CODE Linear> <titre de la livraison>

_Gabarit d'ordre de mission pour un agent `tdd-writer` lancé dans un git worktree._
_Copier en `MISSION.md` à la racine du worktree (fichier exclu de git via `.git/info/exclude`)._
_Recette complète : `BOUCLE-AGENTS.md` (dépôt cedricgicquiaud/pilot) ; lancement :_
_`git worktree add ../<nom> -b feature/<CODE>-<n>-<slug>` puis session Claude dans ce dossier._

## Ta mission

- Feature Linear : **<nom de la feature>** — livraison <n>/<total> « <titre> »
- Tâches : <CODE>-a, <CODE>-b, <CODE>-c (lire chaque fiche avant de commencer)
- Branche : `feature/<CODE>-<n>-<slug>` (déjà créée, tu es dessus)

## Périmètre STRICT

Tu touches uniquement :
- `<fichier ou dossier 1>`
- `<fichier ou dossier 2>`
- `src/<dossier>/__tests__/<fichier>.test.tsx` (un fichier de tests par livraison)
- `UAT.md` (section de la livraison seulement)

Tu ne touches **jamais** : les autres modules, `CLAUDE.md`, `.claude/`, `.pilot/`,
la navigation partagée. Un autre agent travaille en parallèle : tout chevauchement
sera un conflit au merge.

## Règles du projet (rappel, détail dans `CLAUDE.md`)

- Export statique Next.js (`output: 'export'`) : aucune API route, aucun composant serveur qui lit une base.
- Tout contenu vient de `content/` (Markdown + frontmatter) ; jamais de texte de fiche en dur dans un composant.
- Aucun nom de client, de collègue ni d'employeur ; jamais « finalisé » ; pas d'emoji ; français seul.
- Thème clair et sombre : chaque couleur passe par un token Tailwind/shadcn, jamais une valeur en dur.
- Une décision produit ou d'architecture non couverte par la fiche : **tu ne tranches pas**.
  Tu la notes dans la section « Décisions à prendre » de ton rapport et tu prends l'option
  la plus réversible.

## Examen obligatoire avant de te déclarer fini

1. `npm test` (Vitest) puis `npm run build` (export statique) : tout vert, sortie collée dans le rapport.
2. Relire ton diff (`git diff main...HEAD`) contre les idiomes ci-dessus, ligne par ligne.
3. Chaque « Terminé quand » de chaque tâche : constaté (comment ?) ou **refusé** (pourquoi ?).
   Un constat de refus vaut mieux qu'une case cochée par optimisme.

## Livraison

- Ordre imposé à chaque tâche : test rouge (commit `test:`), code minimal (commit `feat:`/`fix:`),
  refactor. Jamais de code de production sans test rouge préalable ; l'historique en est la preuve.
- Commits atomiques, messages conventionnels en anglais, aucune signature Claude.
- Tâche finie → statut « Terminée » dans Linear (`save_issue`).
- `UAT.md`, section de ta livraison : une case par « Terminé quand », qui dit la donnée à
  saisir et le refus attendu (« un e-mail mal formé affiche “E-mail invalide” »). **Ne coche
  rien** : c'est le testeur qui coche, à l'écran, après toi.
- Push de la branche, PR titrée `<CODE>-<n> <titre de la livraison>` au gabarit
  `.github/PULL_REQUEST_TEMPLATE.md`, dernière ligne `Closes <CODE>-a, <CODE>-b, …`.
- **STOP après la PR.** Pas de merge, pas de tâche suivante, pas de « tant que j'y suis ».

## Rapport final (dans ta dernière réponse)

- Ce qui change (fonctionnel, 3 lignes)
- Sortie réelle des tests
- « Terminé quand » : constaté / refusé, tâche par tâche
- Décisions à prendre (liste, vide si aucune)
- Écarts au périmètre (liste, vide si aucun)
