---
nom: PILOT
statut: en cours (méthode rodée sur un bac à sable et branchée sur deux projets réels ; dépôt public pas encore ouvert)
periode: avril 2026 (FORGE) → aujourd'hui ; PILOT depuis le 22 août 2026
role: conception de la méthode, écriture des documents, de la skill et des fiches de poste des agents, expérimentation — seul
stack: Linear (tableau de bord, API GraphQL + MCP), GitHub (branches, PR, git worktrees), Claude Code (skill `pilot` et agents `tdd-writer`, `verifier`, `testeur` en Markdown, allowlist `settings.json`, commande `/goal`), scripts Python pour l'API Linear
visibilite: public
depot: à venir (nouveau dépôt public à historique neuf, sans `.workflow/sessions/`)
demo: bac à sable `pilotage-sandbox` (CRM léger « Carnet »), à rendre public après audit
ordre: 2
---

# PILOT — faire produire des agents de code sans leur laisser le jugement

**En bref.** Une méthode, pas un logiciel : Linear pour piloter, GitHub pour le code, Claude Code
pour produire, avec une boucle où celui qui écrit le code n'est jamais celui qui le vérifie.
Éprouvée sur un bac à sable puis sur ce site : 7 features livrées, 8 défauts attrapés par l'audit
derrière des tests verts, 0,66 h de session là où le barème en prévoyait 2,44. Méthode publique à
venir ; remplace FORGE, ma première version (avril 2026).

## Problème

Avec des agents de code, écrire n'est plus le goulot. Vérifier l'est. Mesuré sur mon bac à sable :
une feature estimée à 2,44 h de travail avec mon barème d'avant est sortie en 0,66 h de session.
Le temps restant, c'est l'humain qui lit, valide, merge.

Trois dérives concrètes quand on laisse un agent tourner seul :
- Il tranche en chemin des décisions de fond (une règle de sécurité, un choix d'architecture)
  qui ne lui appartiennent pas. Bonne décision ou pas, elle n'a pas été posée à l'humain.
- Il écrit les tests après le code. Des tests écrits après confirment ce qu'on a fait ; ils
  n'attrapent pas de bugs.
- Il se relit lui-même. Deux producteurs consciencieux, 32 tests verts, et deux failles
  (texte utilisateur non échappé, contrôle de permissions absent) que seul un relecteur
  extérieur a vues.

Ma première réponse, FORGE (avril 2026), était un rituel de documents (PRD, SPEC, PLAN par
phase) que Claude exécutait ensuite seul, en produisant, relisant et livrant lui-même. Il
manquait le tableau de bord, le relecteur indépendant et la preuve que le test précède le code.

## Ce que j'ai construit

Un circuit en cinq étapes, où l'humain intervient à des moments fixes et jamais entre :
1. **Cadrer** : décisions produit et un contrat de validation, 10 à 30 phrases « ce qui devra être
   vrai », dont des refus. L'humain valide.
2. **Découper** : des livraisons qui ne touchent pas les mêmes fichiers, chaque phrase du contrat
   affectée à une livraison, chaque tâche avec un « Terminé quand » qui contient au moins un
   refus. L'humain valide la liste avant toute création dans Linear.
3. **Produire** : la boucle agents, sans l'humain (voir plus bas).
4. **Merger** : l'humain lit le rapport d'audit, merge, tranche les décisions remontées.
5. **Apprendre** : chaque défaut trouvé à l'audit devient une règle dans le `CLAUDE.md` du dépôt.

Trois invariants, non négociables :
- **Le merge reste humain**, à chaque livraison.
- **Les décisions de fond remontent**, elles ne se prennent pas en chemin. L'agent prend l'option
  la plus réversible et la signale dans la PR.
- **Pas de code sans test préalable**, prouvé par l'historique git : un commit pour le test
  rouge, un pour le code qui le passe.

La boucle de production, étape 3 :
- Un agent **producteur** (`tdd-writer`) par livraison, dans sa propre copie du dépôt (git
  worktree), avec un ordre de mission `MISSION.md` : périmètre strict, commande de tests, « tu
  ne tranches pas », stop après la PR.
- Deux contrôleurs qui n'ont pas écrit le code, en lecture seule : `verifier` lit le diff
  (sécurité, idiomes du projet, couverture du contrat, ordre test → code) ; `testeur` ouvre
  l'application dans un navigateur et joue le cahier de recette, case par case.
- Un **correcteur** avec une liste fermée. Un aller-retour, pas plus. Une case encore refusée :
  la PR s'ouvre quand même, marquée non mergeable.
- Le nombre d'agents en parallèle n'est pas un objectif : il se déduit du nombre de livraisons
  réellement disjointes. Défaut : 1.

Le tout tient dans du Markdown : une skill `pilot` (8 commandes : `init`, `roadmap`, `feature`,
`run`, `next`, `fix`, `sync`, `benchmark`), trois fiches de poste d'agents, un gabarit de
mission, une allowlist de commandes versionnée. `next` déduit l'étape suivante des statuts
Linear : aucun fichier d'état à entretenir. Le code de la tâche Linear voyage dans le nom de
la branche et le titre de la PR : c'est ce qui fait avancer le tableau de bord sans personne.

## Preuves

Bac à sable : « Carnet », un CRM léger en HTML/JS sans dépendance, produit du 22 au 28 août 2026
uniquement par cette méthode.

- **Ça marche ?** 6 features livrées et « Terminées » dans Linear (socle et comptes, contacts,
  devis, facturation, interface, agenda), soit 23 livraisons et 67 tâches. 269 tests verts sur
  `main` (vérifié le 29/08/2026 sur un clone propre, `node --test`). Le circuit de statuts
  automatiques (PR mergée → tâche terminée) est aussi prouvé sur deux projets réels, un projet
  client et une application santé, où la méthode est branchée depuis le 24 août.
- **C'est solide ?** L'audit par un agent qui n'a pas écrit le code a trouvé, derrière des tests
  verts, 8 défauts classés bloquants ou importants : 2 le 26/08 (échappement HTML, permissions),
  2 le 27/08 (fichier d'interface cassé par un commit intermédiaire, injection de formule dans un
  export CSV), 4 le 28/08 (dont une fuite de fiche contact par une action publique). Tous
  corrigés avant PR. Trois producteurs en parallèle le 26/08 sans conflit ni chevauchement.
- **C'est utilisable ?** Une feature de 5 livraisons et 13 tâches (facturation) produite en une
  seule instruction `run` : cadrage de 10 décisions et 24 phrases de contrat, puis ~1,4 h de
  session, 0 bloquant, 2 corrections d'audit, 0 conflit. Une itération complète de la boucle
  (production, audit, corrections, PR) prend 18 à 25 minutes par livraison ; ~0,5 h quand le
  testeur joue la recette dans le navigateur. Sur la feature agenda : 27 phrases de contrat,
  4 livraisons, 1 case de recette refusée, reformulée puis rejouée.
- Le chiffre du goulot : la première feature (4 livraisons, 12 tâches) a pris **0,66 h de
  session** là où mon barème, calibré sur 344 PR de deux projets antérieurs, prévoyait
  **2,44 h**. Le temps de session compte les intervalles entre ouverture de PR et merge dans
  une même session ; une attente de merge de 2 h n'y est pas. Nuance : le barème vient de
  projets réels, la mesure vient d'un bac à sable sans dépendance. L'écart dit surtout que
  le temps humain de lecture domine, pas que le code est gratuit.

État honnête : le « test des deux heures » (deux chantiers lancés, écran fermé) n'a pas été
fait ; toutes les boucles ont tourné écran ouvert. Pas de disjoncteur de budget par agent.
Un seul modèle partout : rien ne prouve qu'un autre ferait mieux ou moins cher à tel poste. Le
testeur n'a pas encore attrapé de défaut réel dans la boucle, seulement à froid sur une
livraison déjà saine. Le dépôt public de la méthode n'est pas ouvert ; le bac à sable est privé.

## Ce que j'en ai appris

- **Tests verts ≠ sûr.** La découverte n° 1 de l'essai. La plomberie (worktrees, allowlist)
  n'était que mécanique ; la valeur est dans le relecteur indépendant.
- **Ce qui n'est pas dans la fiche n'existe pas.** L'interface du bac à sable était laide parce
  qu'aucune fiche n'avait demandé du beau. Preuve que les fiches pilotent vraiment, et
  qu'une boucle sans regard sur l'écran vérifie la sécurité, pas l'œil. D'où le `testeur`.
- **Chaque « Terminé quand » doit contenir un refus.** Les décisions remontées et les défauts
  d'audit avaient un motif commun : des cas négatifs que la fiche ne disait pas.
- **Parallèle seulement si la disjonction est décidée au découpage.** Trois producteurs en
  parallèle ont marché parce qu'un humain avait découpé des livraisons disjointes. Un système
  qui découpe seul se marche dessus.
- **Un raté de plomberie** : au premier `run` réel, chaque copie de travail partait de la branche
  précédente ; les PR se sont empilées et ont été mergées dans leur base, pas dans `main`. Il a
  fallu une PR d'intégration. Règle depuis : tout worktree part de `main`, les PR se mergent
  dans n'importe quel ordre.
- **Une proposition n'est pas une validation.** Un texte collé d'une autre session a été
  appliqué sans accord, puis entièrement annulé. Leçon gravée : ça s'ouvre en discussion.
- **Une règle écrite n'est pas une preuve.** Après gravure des idiomes dans le `CLAUDE.md`, les
  fautes exactes n'ont pas réapparu, mais une variante est passée. Je ne peux pas dire si c'est
  la règle ou l'imitation du code corrigé qui a joué.
- **FORGE → PILOT.** FORGE adaptait la profondeur du rituel à la taille de la tâche, mais
  laissait le même agent produire, relire et livrer, et prévoyait un mode autonome. PILOT
  garde ses pauses de validation (cadrage, découpage), remplace sa production par la boucle
  producteur ≠ vérificateur, supprime le mode autonome et les fichiers de phase : un producteur
  ne lit que sa mission et le `CLAUDE.md`. FORGE est archivé, en lecture seule, depuis le
  27/08/2026.

## Artefacts

- Méthode v1, archivée : https://github.com/cedricgicquiaud/FORGE
- Méthode PILOT (deux documents : le circuit, la boucle agents ; skill et agents) : dépôt public
  à ouvrir, historique neuf
- Bac à sable `pilotage-sandbox` (code, cahier de recette, calibration) : privé, à rendre public
  après audit
- Schéma du circuit (page HTML) : à publier avec le dépôt
- Démonstration vidéo d'un `run` : à faire
