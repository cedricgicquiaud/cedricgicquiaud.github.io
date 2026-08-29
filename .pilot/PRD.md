# PRD — Site portfolio (29 août 2026)

## Utilisateurs

1. **Recruteurs et managers** (priorité) : ils arrivent depuis LinkedIn ou un message direct,
   veulent comprendre en trente secondes qui je suis, ce que je sais faire, et voir des
   projets concrets avant d'écrire.
2. **Clients potentiels** (GiveMe5, missions) : même site, plus tard ; rien de spécifique en V1.
3. **Pairs techniques** : ils ouvrent une fiche projet et cliquent sur le dépôt ou la démo.

## Problème

LinkedIn montre un titre et des posts ; GitHub montre du code. Aucun des deux ne présente
mon parcours, mon état d'esprit et des projets concrets au même endroit, avec des preuves.
Sans site, un post n'a nulle part où pointer.

## Ce que l'utilisateur pourra faire (V1)

Une seule page qui défile, menu fixe avec ancres, sur le modèle de brittanychiang.com :

- **Intro** : nom, positionnement (« Je branche des agents IA sur les systèmes réels d'une
  entreprise et je les livre en production »), photo traitée en bi-ton bleu, liens GitHub,
  LinkedIn, mail.
- **À propos** : parcours et état d'esprit en texte descriptif — 13 ans en ESN (concepteur-
  développeur puis chef de projet, banque et assurance), 10 ans conseiller immobilier
  indépendant, reconversion vers les agents IA, du vibe coding à la méthode. Secteurs
  seulement, jamais d'employeur ni de client nommé.
- **Expérience** : bloc descriptif antichronologique, secteurs seulement, tags de stack.
- **Projets** : une carte par fiche du registre (visuel, une ligne, chiffre clé, tags,
  liens dépôt et démo) ; le clic ouvre la **page de la fiche** complète (les cinq sections
  du gabarit WATIDO).
- **Pied de page** : liens, mention « site généré depuis mes fiches de preuve ».
- Lecture sur mobile et en thème sombre sans perte ; contraste AA ; navigation clavier.

## Hors périmètre

- V1 : CV PDF, `proofs.json`, captures et vidéos par projet → **V2**.
- Définitivement : formulaire de contact (mailto suffit), section Écrits, page compétences
  (les tags par projet suffisent), multilingue (français seul), analytics, cookies, blog, CMS.

## Contraintes

- **Stack** : Next.js (App Router) + Tailwind + shadcn/ui, **export statique**
  (`output: 'export'`) : aucune fonction serveur, aucune base. Tests Vitest.
- **Design** : bi-ton minimaliste bleu et blanc, fond quadrillé discret, photo et visuels
  en monochrome bleu. Thème clair et sombre. Pas d'emoji.
- **Hébergement** : GitHub Pages sur `cedricgicquiaud.github.io`, déploiement par GitHub
  Actions à chaque merge sur `main`.
- **Dépôt** : `WATIDO/site/`, dépôt git propre, public. Les fiches restent dans
  `WATIDO/fiches/` et sont copiées dans `site/content/fiches/` au build (script `sync`) ;
  le dépôt public ne contient jamais `PLAN.md`, `REPOS.md`, `AUDIT.md`. Les textes À propos
  et Expérience vivent dans `site/content/`.
- **Ton et règles** : `WATIDO/CLAUDE.md` et guidelines de marque — direct, sans superlatif ;
  jamais « finalisé » ; aucun nom de client, de collègue ni d'employeur.
- **Échéance** : le plus tôt possible ; au plus tard le 13 septembre 2026.
- **Pilotage** : `pilot`, TDD par `tdd-writer`, merge humain. Le site devient lui-même une
  fiche du registre une fois en ligne.

## Versions

- **V1** : tout ce qui précède.
- **V2** : CV PDF d'une page généré depuis le même contenu ; `proofs.json` et `llms.txt`
  pour les agents IA ; captures et vidéos de démo par projet.

## Grandes fonctionnalités pressenties

| # | Résultat | Version |
|---|---|---|
| F1 | Le site est en ligne : squelette Next.js export statique, thème bleu/blanc clair et sombre, menu, intro, pied de page, déploiement automatique sur GitHub Pages | V1 |
| F2 | Le visiteur lit mon parcours : À propos et Expérience, photo bi-ton | V1 |
| F3 | Le visiteur explore mes projets : cartes depuis les fiches synchronisées, page par fiche, contrôle des mots interdits au build | V1 |
| F4 | Un recruteur télécharge mon CV ; un agent lit `proofs.json` | V2 |
| F5 | Chaque projet a un visuel : captures et vidéos | V2 |
