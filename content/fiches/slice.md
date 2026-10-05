---
nom: SLICE
statut: en cours
periode: mai 2026 → aujourd'hui
role: conception, développement, tests, positionnement — seul, avec des agents de code
stack: TypeScript, React, Node.js/Express, MCP SDK, Zod, Vitest
visibilite: public
depot: https://github.com/cedricgicquiaud/slice
demo: à venir (mise en ligne prévue)
ordre: 2
visuel: /projets/slice/selection.png
captures:
  - fichier: /projets/slice/accueil.webp
    legende: On dépose la description d'une API (OpenAPI, Swagger ou Postman), en fichier ou par son adresse.
  - fichier: /projets/slice/configuration.webp
    legende: Nom, authentification et hébergement ; à droite, le périmètre de l'agent et le contexte économisé.
---

# SLICE — connecteurs MCP sur mesure

**En bref.** N'importe quelle API en MCP, en trois clics : on coche les appels d'API qu'un agent
IA a le droit de voir, SLICE génère le connecteur, le reste n'existe pas pour lui. Éprouvé sur 500 vraies API, sans plantage. Code
public, démo en ligne à venir.

## Problème

Un agent IA (Claude, Cursor, n8n…) ne sait rien faire avec une API tant que quelqu'un ne
lui a pas écrit un connecteur. Le standard pour ça s'appelle MCP (Model Context Protocol).
Les outils existants pour générer un connecteur MCP depuis une description d'API s'adressent
à des développeurs : ligne de commande, fichiers de configuration, vocabulaire technique.

Deux problèmes concrets derrière :
- Exposer une API entière à un agent lui donne trop de pouvoir et sature son contexte.
  Un agent qui doit lire des commandes n'a pas besoin de pouvoir les supprimer.
- Une personne qui ne code pas, mais qui veut brancher son outil métier à son agent,
  n'a aucune solution.

## Ce que j'ai construit

Un service web en trois écrans : on dépose la description d'une API (OpenAPI, Swagger ou
Postman), on coche les seuls appels que l'agent a le droit de faire, on obtient soit un
connecteur à télécharger, soit une URL hébergée à coller dans son agent.

Décisions qui ont compté :
- **Le moindre privilège côté serveur.** Ce qui n'est pas coché n'existe pas pour l'agent.
  La sécurité est le produit, pas la génération de code, que tout le monde fait.
- **Rien n'est cru sur parole.** Le serveur relit lui-même la description d'API au lieu de
  faire confiance au navigateur, et chaque donnée entrante est contrôlée (Zod) avant usage.
- **Pivot vers l'hébergement.** Le plan initial était un binaire à double-cliquer ; macOS le
  bloque (Gatekeeper). J'ai remplacé par un mode hébergé : le serveur relaie le jeton d'API
  de l'utilisateur sans jamais le stocker, et sert plusieurs sessions d'agents en parallèle.
- **Isolation du parsing.** Certaines descriptions d'API font exploser la mémoire. Le parsing
  tourne dans un processus enfant avec délai, plafond mémoire et limite de concurrence :
  une spec « bombe » renvoie une erreur propre, le serveur survit.
- **Gestion de l'authentification amont** (OAuth2 client_credentials, bearer, API key), avec
  les secrets qui restent côté utilisateur en mode hébergé.
- **Chaîne d'intégration continue** : typage, tests, puis un test de fumée qui démarre le
  binaire compilé et rejoue un upload réel. Le jour de sa mise en place, elle a attrapé un
  test qui ne passait qu'en local.

## Preuves

État au 05/10/2026 : Fonctionnel, pas encore mis en ligne.

- Plus de 560 tests automatisés verts, typage strict, CI sur chaque PR (vérifié sur un clone
  propre : installation et démarrage en moins d'une minute, sans aucune clé).
- Passage de **500 vraies descriptions d'API** publiques dans le pipeline : 412 converties,
  83 rejetées proprement (authentification non supportée à l'époque), 5 trop grosses,
  **0 plantage**. Ce test a fait remonter deux bugs et un risque mémoire critique, tous corrigés.
- Une revue de sécurité a trouvé **deux injections de code** possibles dans le code généré
  (via l'URL de jeton et les scopes OAuth). Corrigées, et la règle « toute donnée externe
  est encodée en JSON dans le code généré » est devenue une convention du projet.
- Le 05/10/2026, un audit indépendant a montré que la règle n'était appliquée qu'à l'OAuth :
  une description d'API piégée pouvait encore faire exécuter du code chez l'utilisateur, par
  six voies (description, chemin, en-tête, `package.json`, `Dockerfile`, README du kit).
  Toutes fermées, avec un test qui découpe le code généré pour vérifier qu'aucune valeur de
  la spec n'y devient du code.
- Validé de bout en bout dans Claude Desktop contre la vraie API Notion (recherche et
  création de pages).

État honnête : le service n'est pas encore en ligne (mise en ligne sur VPS prévue). Pas de
facturation tant que la demande n'est pas confirmée par de vrais utilisateurs. Code sous
licence FSL : lisible et réutilisable, sauf pour en faire un service concurrent.

## Ce que j'en ai appris

- **Mon hypothèse de départ était fausse.** Je pensais que « générer un MCP depuis une spec
  privée » était rare. Une étude concurrentielle (Speakeasy, Mintlify, FastMCP…) a montré
  que c'est banal. Le différenciateur est ailleurs : la simplicité pour un non-développeur et
  la restriction des droits. J'ai réécrit le positionnement plutôt que de m'accrocher.
- **Tester sur du réel change tout.** Les 500 specs réelles ont trouvé ce que 400 tests
  unitaires ne voyaient pas.
- **Faire relire par un agent indépendant du producteur** trouve des failles que celui qui
  a écrit le code ne voit pas (les deux injections).
- **Une règle de sécurité appliquée au cas par cas ne protège pas.** Encoder les valeurs
  OAuth sans encoder le reste laissait six portes ouvertes. La bonne règle porte sur toute
  donnée externe, et elle se vérifie par un test, pas par une relecture.
- **Livrer un binaire à des utilisateurs Mac sans signature** ne marche pas ; il vaut mieux
  le savoir avant de construire l'écran de téléchargement.

## Artefacts

- Dépôt public : https://github.com/cedricgicquiaud/slice
- Documentation de l'API et du serveur généré : https://github.com/cedricgicquiaud/slice/tree/main/docs
- Démo en ligne : à venir
