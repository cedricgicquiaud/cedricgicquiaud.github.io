---
nom: Parcours
statut: livré
periode: août 2026
role: conception, développement, tests, écriture des formations, recette — seul, avec des agents de code
stack: TypeScript, Node/Hono, SQLite, React/Vite, Vitest, markdown-it, Shiki, Mermaid
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

## Ce que j'ai construit

Une application web en deux parties : un serveur qui lit les dossiers de formation, rend le
Markdown et garde comptes et progression dans une base SQLite ; une interface React avec
catalogue, fiche de formation, page de leçon, recherche plein texte, mode clair et sombre.

**Le trajet d'une formation.**
- **Écrire.** On décrit le sujet à Claude Code. Il écrit un dossier : un `formation.json`
  pour le sommaire, un fichier Markdown par leçon, en suivant le format documenté.
- **Déposer.** On glisse le dossier sur le catalogue. Parcours le vérifie ; s'il est
  invalide, la carte dit exactement où (`modules[2].lecons[0].id manquant`).
- **Lire et cocher.** Chaque leçon finit par des critères de réussite à cocher. Cocher le
  dernier termine la leçon ; « Reprendre » rouvre la première leçon non terminée.
- **Retoucher.** Renommer, réordonner, corriger une phrase dans l'éditeur intégré, sans
  rouvrir Claude.

**Les comptes.** Au premier lancement, Parcours crée l'administrateur. Il écrit les
formations et gère les comptes ; les lecteurs lisent et cochent, chacun avec sa propre
progression. Inscription avec confirmation par e-mail et mot de passe oublié, inactifs tant
qu'aucun serveur d'envoi n'est configuré.

Décisions qui ont compté :
- **Le format, c'est un dossier.** Des identifiants stables : renommer un titre ne perd pas
  la progression. C'est ce qui permet à un agent d'écrire une formation entière.
- **Chaque case à cocher devient un critère de réussite mémorisé.** Son identité vient de
  son texte : insérer ou déplacer ne casse rien, reformuler perd la coche. Choix assumé,
  documenté.
- **Rien ne sort de la machine.** Polices, icônes, coloration et schémas embarqués, aucune
  requête réseau depuis l'interface.
- **Jamais de suppression de fichier.** Archivage, corbeille, restauration : l'application
  déplace, elle n'efface pas. L'éditeur refuse d'enregistrer si le fichier a changé sur le
  disque entre-temps.
- **Lire et écrire séparés.** Les outils d'auteur vivent derrière un interrupteur
  « Édition » réservé aux administrateurs, éteint par défaut ; le serveur refuse l'écriture
  à tout autre compte.

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
