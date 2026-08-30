---
nom: SLICE
statut: en cours
periode: mai 2026 → aujourd'hui
role: conception, développement, tests, positionnement — seul, avec des agents de code
stack: TypeScript, Node/Express, React/Vite, Vitest, MCP SDK, Docker, GitHub Actions
visibilite: public
depot: https://github.com/cedricgicquiaud/SLICE
demo: à venir (mise en ligne prévue)
ordre: 1
---

# SLICE — n'importe quelle API, dans n'importe quel agent, en trois clics

**En bref.** Un service web qui transforme la description d'une API en connecteur pour agent IA
(MCP), en ne donnant à l'agent que les appels cochés. 556 tests, 500 vraies API passées sans
plantage, deux failles trouvées en revue et corrigées. Code public, démo en ligne à venir.

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

État au 30/08/2026 : Fonctionnel, pas encore mis en ligne.


- 556 tests automatisés verts, typage strict, CI sur chaque PR (vérifié le 29/08/2026 sur
  un clone propre : installation et démarrage en moins d'une minute, sans aucune clé).
- Passage de **500 vraies descriptions d'API** publiques dans le pipeline : 412 converties,
  83 rejetées proprement (authentification non supportée à l'époque), 5 trop grosses,
  **0 plantage**. Ce test a fait remonter deux bugs et un risque mémoire critique, tous corrigés.
- Une revue de sécurité a trouvé **deux injections de code** possibles dans le code généré
  (via l'URL de jeton et les scopes OAuth). Corrigées, et la règle « toute donnée externe
  est encodée en JSON dans le code généré » est devenue une convention du projet.
- Validé de bout en bout dans Claude Desktop contre la vraie API Notion (recherche et
  création de pages).

État honnête : le service n'est pas encore en ligne (mise en ligne sur VPS prévue). Le
README public est en retard sur le code. Pas de facturation tant que la demande n'est pas
confirmée par de vrais utilisateurs.

## Ce que j'en ai appris

- **Mon hypothèse de départ était fausse.** Je pensais que « générer un MCP depuis une spec
  privée » était rare. Une étude concurrentielle (Speakeasy, Mintlify, FastMCP…) a montré
  que c'est banal. Le différenciateur est ailleurs : la simplicité pour un non-développeur et
  la restriction des droits. J'ai réécrit le positionnement plutôt que de m'accrocher.
- **Tester sur du réel change tout.** Les 500 specs réelles ont trouvé ce que 400 tests
  unitaires ne voyaient pas.
- **Faire relire par un agent indépendant du producteur** trouve des failles que celui qui
  a écrit le code ne voit pas (les deux injections).
- **Livrer un binaire à des utilisateurs Mac sans signature** ne marche pas ; il vaut mieux
  le savoir avant de construire l'écran de téléchargement.

## Artefacts

- Dépôt public : https://github.com/cedricgicquiaud/SLICE
- Exemple de connecteur généré (API JSONPlaceholder) : à publier
- Démo en ligne : à venir
