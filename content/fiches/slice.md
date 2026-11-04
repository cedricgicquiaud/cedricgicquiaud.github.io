---
nom: SLICE
statut: en cours
periode: mai 2026 → aujourd'hui
role: conception, développement, tests, positionnement — seul, avec des agents de code
stack: TypeScript, React, Node.js/Express, MCP SDK, Zod, Vitest
stack_detail:
  - categorie: Langage
    outils: TypeScript
  - categorie: Interface
    outils: React
  - categorie: Serveur
    outils: Node.js, Express, MCP SDK
  - categorie: Contrôle des données
    outils: Zod
  - categorie: Tests
    outils: Vitest, intégration continue GitHub Actions
visibilite: public
depot: https://github.com/cedricgicquiaud/slice
demo: à venir (mise en ligne prévue)
ordre: 3
visuel: /projets/slice/selection.png
chiffres:
  - valeur: "500"
    libelle: vraies API passées dans le pipeline
  - valeur: "0"
    libelle: plantage sur ces 500 API
  - valeur: "3"
    libelle: formats acceptés (OpenAPI, Swagger, Postman)
captures:
  - fichier: /projets/slice/accueil.webp
    legende: On dépose la description d'une API (OpenAPI, Swagger ou Postman), en fichier ou par son adresse.
  - fichier: /projets/slice/configuration.webp
    legende: Nom, authentification et hébergement ; à droite, le périmètre de l'agent et le contexte économisé.
---

# SLICE — connecteurs MCP sur mesure

**En bref.** Brancher un outil métier sur un agent IA en trois écrans, en ne lui donnant que
les droits dont il a besoin. On coche les appels autorisés, SLICE génère le connecteur, le reste
de l'API n'existe pas pour l'agent. Éprouvé sur 500 vraies API, sans plantage. Code public,
démo en ligne à venir.

## Problème

Un agent IA (Claude, Cursor, n8n…) ne sait rien faire avec un outil tant que quelqu'un ne lui a
pas écrit un connecteur. Le standard pour ça s'appelle MCP (Model Context Protocol). Les outils
qui génèrent ces connecteurs s'adressent à des développeurs : ligne de commande, fichiers de
configuration, vocabulaire technique.

Contraintes :
- **Trop de pouvoir.** Donner toute une API à un agent, c'est lui permettre de supprimer ce
  qu'il devait seulement lire.
- **Trop de bruit.** Une API entière sature la mémoire de travail de l'agent.
- **Personne pour les non-développeurs.** Quelqu'un qui veut brancher son outil métier à son
  agent, sans coder, n'a aucune solution.
- **Des descriptions d'API imprévisibles.** Elles viennent de partout, et certaines sont
  énormes ou mal formées.

## Livrables

- Un service web en trois écrans : déposer l'API, cocher les appels autorisés, récupérer le
  connecteur.
- Deux sorties au choix : un connecteur à télécharger, ou une adresse hébergée à coller dans
  son agent.
- Trois formats d'entrée : OpenAPI, Swagger et Postman, en fichier ou par adresse.
- Trois modes d'authentification gérés : OAuth2 (client_credentials), bearer, clé d'API.
- Une documentation de l'API et du connecteur généré.
- Une chaîne d'intégration continue : typage, tests, puis un essai réel du programme compilé.

## Architecture

L'interface (React) envoie la description d'API au serveur (Node.js). Le serveur la relit
lui-même, sans faire confiance au navigateur. Chaque donnée entrante est contrôlée (Zod) avant
usage.

Le serveur ne garde que les appels cochés, puis génère le connecteur MCP. En mode hébergé, le
même serveur fait tourner les connecteurs de plusieurs agents en parallèle. Il relaie la clé
d'API de l'utilisateur à chaque appel, sans jamais la stocker.

## Décisions

### Ce qui n'est pas coché n'existe pas pour l'agent

Le tri se fait côté serveur, pas dans l'interface. Un agent qui doit lire des commandes ne voit
même pas qu'il existe un appel pour les supprimer. C'est le cœur du produit : générer du code,
tout le monde le fait ; limiter les droits, presque personne.

### Une description d'API ne devient jamais du code

Chaque valeur lue dans la description est encodée avant d'entrer dans le connecteur généré,
jusque dans le `package.json`, le `Dockerfile` et le README. Un test découpe le code généré pour
le vérifier. Une description piégée ne peut donc rien exécuter chez l'utilisateur.

### Une description géante ne fait pas tomber le serveur

Chaque description est lue dans un processus à part, avec une limite de temps, de mémoire et de
lectures simultanées. Une description trop lourde renvoie une erreur claire, et le serveur
continue de servir les autres.

### Hébergé plutôt que téléchargé

Le plan de départ était un programme à double-cliquer. macOS bloque un programme non signé :
l'écran de téléchargement aurait été un mur. J'ai remplacé par une adresse hébergée, que
l'utilisateur colle dans son agent.

### Un test qui rejoue un vrai usage

Après le typage et les tests, l'intégration continue démarre le programme compilé et rejoue un
envoi réel de description d'API. Le jour de sa mise en place, elle a repéré un test qui ne
passait que sur ma machine.

## Preuves

- **500 vraies descriptions d'API** passées dans le pipeline : 412 converties, 83 refusées
  proprement (authentification pas encore gérée à l'époque), 5 trop grosses, **0 plantage**.
- **Validé de bout en bout** dans Claude Desktop avec la vraie API Notion : recherche et
  création de pages.
- **Installation en moins d'une minute** sur une copie neuve du dépôt, sans aucune clé.
- **Revue de sécurité indépendante** le 05/10/2026.
- Plus de 560 tests automatisés, passés à chaque modification.

État au 05/10/2026 : fonctionnel, pas encore en ligne (mise en ligne sur VPS prévue). Pas de
facturation tant que de vrais utilisateurs n'ont pas confirmé la demande.

## Ce que j'en ai appris

- **Mon hypothèse de départ était fausse.** Je pensais que générer un connecteur MCP depuis une
  API privée était rare. Une étude de la concurrence (Speakeasy, Mintlify, FastMCP…) a montré
  que c'est banal. J'ai déplacé le positionnement vers la simplicité et la limitation des droits.
- **Tester sur du réel change tout.** Les 500 API réelles ont trouvé ce que 400 tests unitaires
  ne voyaient pas.
- **Une règle de sécurité se prouve par un test.** Une règle écrite dit quoi faire ; seul un
  test qui inspecte le code généré garantit qu'elle s'applique partout.

## Artefacts

- Dépôt public : https://github.com/cedricgicquiaud/slice
- Documentation de l'API et du connecteur généré : https://github.com/cedricgicquiaud/slice/tree/main/docs
- Démo en ligne : à venir
