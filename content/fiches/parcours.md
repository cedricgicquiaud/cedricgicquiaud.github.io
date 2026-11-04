---
nom: Parcours
statut: livré
periode: août 2026
role: conception, développement, tests, écriture des formations, recette — seul, avec des agents de code
stack: TypeScript, Node/Hono, SQLite, React/Vite, Vitest, markdown-it, Shiki, Mermaid
stack_detail:
  - categorie: Langage
    outils: TypeScript strict
  - categorie: Interface
    outils: React, Vite
  - categorie: Serveur
    outils: Node.js, Hono
  - categorie: Données
    outils: SQLite
  - categorie: Rendu des leçons
    outils: markdown-it, Shiki, Mermaid
  - categorie: Tests
    outils: Vitest, intégration continue GitHub Actions
visibilite: public
depot: https://github.com/cedricgicquiaud/parcours
demo:
ordre: 5
visuel: /projets/parcours/accueil.png
captures:
  - fichier: /projets/parcours/formation.webp
    legende: La fiche d'une formation, avec son sommaire et la progression module par module.
  - fichier: /projets/parcours/editeur.webp
    legende: "L'éditeur de leçon, réservé aux administrateurs : Markdown à gauche, aperçu à droite."
  - fichier: /projets/parcours/sombre.webp
    legende: Une leçon en mode sombre, avec ses critères de réussite à cocher.
chiffres:
  - valeur: "2"
    libelle: formations complètes écrites et lues dedans
  - valeur: "10 h 45"
    libelle: de contenu, 49 leçons
  - valeur: "228"
    libelle: critères de réussite à cocher
---

# Parcours — gestionnaire de formation

**En bref.** Un gestionnaire de formation : on écrit un cours en fichiers Markdown, à la main ou
avec Claude Code, et Parcours l'affiche comme un site de cours, avec une progression qui se
souvient où on en était. Deux formations complètes, 10 h 45 de contenu. Code public sous
licence MIT.

## Problème

J'écris des formations avec Claude Code, en Markdown. Les plateformes de cours imposent soit
leur éditeur, soit leur format, soit une mise en page qui ne sait pas afficher du code
coloré, des schémas et des exercices avec solution repliée. Et aucune ne sait dire « tu en
étais là » quand on revient trois jours plus tard.

Deux besoins concrets derrière :
- Un format texte simple, versionnable avec git, qu'un agent peut écrire d'un bout à l'autre.
- Une lecture qui ressemble à un vrai cours : catalogue, modules, leçons, cases à cocher qui
  se souviennent de ce que j'ai fait.

## Livrables

- Une application web de lecture : catalogue, fiche de formation, page de leçon, recherche plein
  texte, mode clair et sombre.
- Un format de formation documenté : un dossier avec un `formation.json` pour le sommaire et un
  fichier Markdown par leçon, qu'un agent peut écrire d'un bout à l'autre.
- Le dépôt d'une formation par glisser-déposer, avec un message d'erreur exact si le dossier est
  invalide (`modules[2].lecons[0].id manquant`).
- Des critères de réussite à cocher en fin de leçon, et un bouton « Reprendre » qui rouvre la
  première leçon non terminée.
- Un éditeur de leçon intégré : renommer, réordonner, corriger une phrase sans rouvrir Claude.
- Des comptes : un administrateur qui écrit et gère, des lecteurs qui lisent et cochent, chacun
  avec sa progression. Inscription confirmée par e-mail et mot de passe oublié, actifs dès qu'un
  serveur d'envoi est configuré.
- Deux formations complètes, dont une qui enseigne Parcours dans Parcours.

## Architecture

Les dossiers de formation sont la source de vérité. Au démarrage, le serveur (Node.js, Hono) les
parcourt et les vérifie, puis rend le Markdown en HTML : code coloré (Shiki), schémas (Mermaid),
exercices à solution repliée.

L'interface React interroge ce serveur, qui n'écoute que sur la machine locale. Les comptes, les
sessions et la progression vivent dans une base SQLite, à part du contenu. La progression est
rangée par identifiants stables : modifier un titre ne la perd pas.

## Décisions

### Le format, c'est un dossier

Pas de base de données pour le contenu : le sommaire tient dans un fichier, le texte dans le
Markdown. Des identifiants stables font que renommer un titre ne perd pas la progression. C'est
ce qui permet à un agent d'écrire une formation entière.

### Un critère de réussite se reconnaît à son texte

Chaque case à cocher devient un critère mémorisé. Insérer ou déplacer ne casse rien ;
reformuler perd la coche. Choix assumé, documenté.

### Rien ne sort de la machine

Polices, icônes, coloration et schémas sont embarqués : l'interface ne fait aucune requête
réseau.

### Jamais de suppression de fichier

Archivage, corbeille, restauration : l'application déplace, elle n'efface pas. L'éditeur refuse
d'enregistrer si le fichier a changé sur le disque entre-temps.

### Lire et écrire séparés

Les outils d'auteur vivent derrière un interrupteur « Édition » réservé aux administrateurs,
éteint par défaut. Le serveur refuse l'écriture à tout autre compte.

### Des sessions qu'on peut couper

Mots de passe hachés (scrypt), jetons de session aléatoires stockés hachés. Désactiver un compte
ou changer un mot de passe coupe ses sessions aussitôt.

## Preuves

État au 07/10/2026 : V1 terminée, code public, à installer en local.

- **Deux formations complètes** écrites au format Parcours et lues dans l'application :
  « Prise en main de Parcours » (5 modules, 17 leçons, 2 h 50) et « Gestion de projet avec
  GitHub » (10 modules, 32 leçons, 7 h 55). 228 critères de réussite, environ 25 000 mots.
- **Le mode d'emploi est livré avec l'outil** : la formation « Prise en main » enseigne
  Parcours dans Parcours, et chacun de ses critères est un geste à faire dans
  l'application. Elle a été déroulée de bout en bout.
- La formation GitHub a été **déroulée en conditions réelles** sur un dépôt bac à sable.
- 639 tests automatisés et typage strict, relancés par la CI sur chaque pull request.

## Ce que j'en ai appris

- **Un cadrage doit pouvoir bouger.** Le principe de départ était « lecteur, pas outil
  d'écriture ». Dès la première version, écrire le sommaire à la main s'est révélé pénible :
  l'espace d'administration, l'éditeur de leçon, puis les comptes sont arrivés. Chaque
  changement de cap est daté et argumenté dans le journal des décisions.
- **Un test d'interface affirme ce que l'utilisateur voit.** Pas l'état interne du
  composant : c'est la règle qui a rendu les tests utiles.
- **Écrire le contenu est la meilleure recette du lecteur.** Rédiger 49 leçons a fait
  ressortir ce qu'aucun scénario n'aurait trouvé, jusqu'aux étiquettes de schémas rognées.
- **Au troisième correctif sur une même leçon, réécrire d'un bloc.** La réécriture complète
  prend moins de temps que les retouches successives.
- **Se demander tôt ce qui se vend.** Réponse écrite : les formations, pas le lecteur. C'est
  pour ça que le code est public et que les formations restent sous droits réservés.

## Artefacts

- Dépôt : https://github.com/cedricgicquiaud/parcours
- Format des formations : https://github.com/cedricgicquiaud/parcours/blob/main/docs/FORMAT.md
- Exemple de formation complète : la formation « Prise en main », dans le dossier
  `formations/` du dépôt
