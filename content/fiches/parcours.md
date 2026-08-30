---
nom: Parcours
statut: en cours
periode: août 2026 → aujourd'hui
role: conception, développement, tests, écriture des formations, recette — seul, avec des agents de code
stack: TypeScript, Node/Hono, SQLite (better-sqlite3), React/Vite, Vitest, markdown-it, Shiki, Mermaid
visibilite: vitrine
depot:
demo: à venir (déploiement Coolify, base jetable)
ordre: 4
---

# Parcours — écrire une formation en Markdown, la lire comme un site de cours

**En bref.** Un lecteur de formations : on dépose un dossier de fichiers Markdown, Parcours
l'affiche comme un site de cours avec sommaire, progression cochable et « reprendre où j'en
étais ». 639 tests verts, deux formations complètes hébergées (10 h 45 de contenu). Code privé
pour l'instant, démo en ligne à venir.

## Problème

J'écris des formations avec Claude Code, en Markdown. Les plateformes de cours (Teachable,
Notion, un site statique) imposent soit leur éditeur, soit leur format, soit une mise en page
qui ne sait pas afficher du code coloré, des schémas et des exercices avec solution repliée.
Et aucune ne sait dire « tu en étais là » quand on revient trois jours plus tard.

Deux besoins concrets derrière :
- Un format texte simple, versionnable avec git, que je peux écrire à la main ou faire écrire
  par un agent.
- Une lecture qui ressemble à un vrai cours : catalogue, modules, leçons, cases à cocher qui
  se souviennent de ce que j'ai fait.

## Ce que j'ai construit

Une application web locale en deux parties : un serveur qui lit les dossiers de formation,
rend le Markdown en HTML et garde la progression dans une base SQLite ; une interface React
avec catalogue, fiche de formation, colonne latérale repliable, page de leçon, recherche
plein texte, mode clair et sombre.

Décisions qui ont compté :
- **Le format, c'est un dossier.** Un `formation.json` qui liste modules et leçons, un
  fichier Markdown par leçon, des identifiants stables. Renommer un titre ne perd pas la
  progression. Une formation invalide reste visible dans le catalogue avec son erreur exacte.
- **Chaque case à cocher devient un critère de réussite mémorisé.** Un « n/N » par leçon ;
  cocher la dernière termine la leçon. L'identité d'une case vient de son texte : insérer ou
  déplacer ne casse rien, reformuler perd la coche. Choix assumé, documenté.
- **Rien ne sort de la machine.** Serveur sur `127.0.0.1`, polices, icônes, coloration et
  schémas embarqués, aucune requête réseau depuis l'interface. Seule exception : l'envoi
  d'e-mails, inactif tant qu'aucun serveur SMTP n'est configuré.
- **Jamais de suppression de fichier.** Archivage, corbeille, restauration : l'application
  déplace, elle n'efface pas. L'éditeur intégré refuse d'enregistrer si le fichier a changé
  sur le disque entre-temps.
- **Lire et écrire séparés.** Les outils d'auteur vivent derrière un interrupteur
  « Édition » réservé aux administrateurs, éteint par défaut. L'autorisation reste celle du
  serveur ; l'interface ne fait que cacher.
- **Une leçon peut dire ce qu'elle suppose.** Un bandeau nomme les leçons prérequises non
  terminées, avec un lien. Il prévient, il ne verrouille jamais.

## Preuves

État au 30/08/2026 : Fonctionnel en local, pas encore public.


- **639 tests automatisés verts** dans 53 fichiers, typage strict sans erreur (vérifié le
  29/08/2026 sur un clone propre : `npm ci`, `npm test`, `npm run typecheck`, moins d'une
  minute au total, base pointée vers un dossier jetable).
- **Deux formations complètes** écrites au format Parcours et lues dans l'application :
  « Prise en main de Parcours » (5 modules, 17 leçons, 2 h 50) et « Gestion de projet
  GitHub » (10 modules, 32 leçons, 7 h 55). 228 critères de réussite cochables au total,
  environ 25 000 mots.
- La formation d'accueil **sert de recette manuelle** : ses critères sont des gestes à faire
  dans l'application (créer, importer, archiver, cocher). Elle a été déroulée de bout en
  bout.
- La formation GitHub a été **déroulée en conditions réelles** sur un dépôt bac à sable ;
  une vingtaine de correctifs de contenu en sont sortis, chacun tracé dans une PR.

État honnête : Parcours tourne en local, pas en ligne. Le README décrit encore un produit
mono-utilisateur ; le code a des comptes, des rôles, un écran d'installation du premier
administrateur et un envoi d'e-mails optionnel. Pas de licence, pas de captures, pas
d'intégration continue (les tests tournent à la main avant chaque fusion). Le mode
production n'est couvert que par un test.

## Ce que j'en ai appris

- **Le cadrage initial n'a pas tenu deux jours.** La décision fondatrice disait « lecteur,
  pas CMS » : on écrit en Markdown, aucun outil auteur. Dès la V1 livrée, écrire un
  `formation.json` à la main s'est révélé pénible. Trois décisions successives ont renversé
  le principe : espace d'administration, éditeur de leçon, cycle de vie complet. Puis
  « mono-utilisateur » est tombé aussi, avec des comptes et des rôles. Chaque renversement
  est daté et argumenté dans le journal des décisions ; le README, lui, n'a pas suivi.
- **Les deux bugs sérieux sont sortis de l'usage, pas des 470 tests de l'époque.** Une page
  blanche en mode production (une garde de session posée sur l'interface elle-même) et une
  case qui se vidait au clic (React réinjectait le HTML). Depuis, règle de test : un test
  d'interface affirme ce que l'utilisateur voit et atteint, pas l'état interne.
- **Écrire le contenu a révélé les bugs du lecteur.** Les étiquettes des schémas Mermaid
  étaient rognées ; la vraie cause (la typographie de la prose qui fuyait dans le schéma)
  a demandé trois tentatives et une inspection du DOM.
- **Au troisième correctif sur une même leçon, réécrire d'un bloc.** Une leçon corrigée cinq
  fois par petites touches était devenue illisible. La réécriture complète a pris moins de
  temps que les cinq retouches.
- **Deux sessions d'agents en parallèle sur le même dossier** ont provoqué une collision de
  branches et des commits directs sur `main`. Résolu sans perte, mais la chaîne de
  livraison masquait la sortie des tests derrière un `grep` : à ne plus faire.
- **Question posée à temps : si ça se vend un jour, qu'est-ce qui se vend ?** Réponse
  écrite : les formations, pas le lecteur. Depuis, le contenu passe devant les fonctions.

## Artefacts

- Dépôt : privé, pas encore ouvert (README à réaligner, licence à choisir)
- Démo en ligne : à venir (déploiement Coolify avec base jetable)
- Captures d'écran (catalogue, leçon avec critères, mode sombre) : à produire
- Format des formations (`docs/FORMAT.md`) et API (`docs/API.md`) : dans le dépôt, à publier
  avec lui
- Exemple de formation complète au format Parcours : à publier (la formation « Prise en
  main » est la candidate)
