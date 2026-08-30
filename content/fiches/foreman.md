---
nom: Foreman
statut: en cours (MVP recetté sur machine réelle ; V2 livrée en code, recette manuelle à faire)
periode: juillet 2026 → aujourd'hui (dernier commit le 11/08/2026)
role: conception, développement, tests, recette — seul, avec des agents de code
stack: TypeScript, Node/Hono, SQLite (better-sqlite3), SSE, React/Vite, Vitest, cmux (CLI)
visibilite: vitrine
depot:
demo: à venir (déploiement Coolify, mode démo à construire)
ordre: 3
---

# Foreman — une tour de contrôle locale pour une flotte d'agents Claude Code

**En bref.** Une application locale qui affiche, sur une seule page, l'état de tous les
agents Claude Code qui tournent sur ma machine, et qui centralise les questions qu'ils
me posent. 565 tests verts et une garantie prouvée par test : Foreman ne modifie jamais
un dépôt et n'envoie rien sur le réseau. Code privé, démo à venir.

## Problème

Quand on fait travailler plusieurs agents de code en parallèle, chacun vit dans sa
fenêtre de terminal. On ne sait pas lequel travaille, lequel attend une réponse, lequel
a planté. Une question posée par un agent pendant qu'on regarde ailleurs reste sans
réponse pendant vingt minutes. Et pour arrêter un agent qui part en vrille, il faut
retrouver la bonne fenêtre.

Trois besoins concrets :
- Voir toute la flotte d'un coup d'œil, avec l'état de chaque projet.
- Recevoir dans une seule boîte (l'Inbox) chaque décision humaine en attente, y compris
  celles arrivées pendant que l'application était fermée.
- Pouvoir arrêter n'importe quelle session, à tout moment, avec un bouton (kill switch).

Le moteur qui lance les agents existe déjà : cmux, un multiplexeur de terminaux pour
macOS. Foreman ne le remplace pas, il le pilote.

## Ce que j'ai construit

Un démon (un programme de fond) écoute le flux d'événements de cmux, le range dans une
base SQLite et pousse les changements vers une interface web locale. Trois écrans :
la flotte (une carte par projet), l'Inbox (les demandes en attente, la plus ancienne en
premier) et le détail d'un projet (sessions, journal des runs, terminal intégré).

Décisions qui ont compté :
- **Réécriture from scratch en local.** Le précédent essai était un service web
  multi-utilisateurs. Inadapté : les dépôts, les agents et cmux sont sur la machine.
  Nouveau dépôt, un seul utilisateur, aucun compte, aucune synchronisation.
- **cmux via sa ligne de commande uniquement.** Un seul module du code parle à cmux.
  Tout le reste travaille sur un contrat typé, testable sans cmux grâce à un corpus
  d'événements anonymisés.
- **Deux règles non négociables, prouvées par des tests.** Tout local : un test
  intercepte toute tentative de connexion sortante pendant un parcours complet. Lecture
  seule : l'empreinte d'un dépôt supervisé (chemins, tailles, dates) est comparée avant
  et après un parcours, kill compris.
- **Ingestion idempotente.** Chaque événement cmux a une clé unique ; le rejouer ne
  change rien. C'est ce qui permet le rattrapage : les demandes arrivées pendant que
  Foreman était fermé apparaissent au premier affichage, avec leur heure d'origine.
- **Reconstruction au redémarrage.** La vue des sessions est recalculée au démarrage du
  démon depuis l'archive d'événements, puis réconciliée avec ce que cmux liste réellement.
- **V2 : répondre sans quitter Foreman.** Réponse aux demandes depuis l'Inbox (injection
  du texte dans le bon terminal), puis terminal intégré en lecture et en frappe. Objectif
  affiché : ne plus jamais ouvrir la fenêtre cmux.
- **Un cahier de recette par livraison**, joué à la main sur la machine réelle, en plus
  des tests automatisés.

## Preuves

- **565 tests automatisés verts** (74 fichiers), typage strict sans erreur — vérifié le
  29/08/2026 sur un clone propre : installation, tests et typecheck en moins d'une minute,
  sans cmux et sans aucune clé.
- **Les deux garanties du produit sont des tests**, relancés à chaque `npm test` :
  zéro connexion sortante sur un parcours complet ; dépôt supervisé identique au bit près
  avant et après un parcours avec kill. Les dépendances de production se limitent à trois
  paquets, inventaire vérifié par test.
- **Robustesse** : un corpus de 13 flux malformés (JSON cassé, fichier de 2 Mo, non-UTF-8)
  traverse la chaîne sans exception. Un second démon lancé par erreur s'arrête seul.
- **Performances mesurées et bornées** (chaque mesure est assertée dans les tests) :
  rattrapage de 100 000 événements en 386 ms (borne 10 s) ; reconstruction complète des
  sessions au démarrage en 167 ms ; événement reçu → visible dans l'interface en 43 ms.
- **Recette sur machine réelle** avec le vrai cmux et de vrais agents (31/07 → 03/08) :
  6 des 8 scénarios du MVP validés (enregistrement, Inbox, focus, kill, rattrapage,
  double instance), puis 3/3 pour la reconstruction au redémarrage. Réponse depuis l'Inbox
  validée en réel le 06/08.

État honnête : la V2 (vocabulaire humain, détail projet, historique, terminal intégré)
est livrée en code et couverte par les tests, mais ses cahiers de recette manuelle ne
sont pas déroulés. L'Inbox et le kill switch ne se démontrent qu'avec cmux et un agent
réel : pas de mode démo. Pas de LICENSE, pas de captures. Deux scénarios du MVP (cmux
quitté, Wi-Fi coupé) restent à jouer sans assistant.

## Ce que j'en ai appris

- **Le kill switch ne marchait pas.** Avec 399 tests verts et un MVP « complet », la
  première recette réelle a montré que ni le kill ni le focus n'avaient jamais fonctionné
  contre le vrai cmux. Le faux binaire des tests encodait la même hypothèse fausse que le
  code. Sept écarts de ce type ont été trouvés en recette, tous corrigés en direct. La règle
  est devenue explicite : vérifier le contrat réel avant de livrer, un test de plus sur un
  simulateur ne prouve rien sur le vrai outil.
- **Une hypothèse invisible en test : la base n'est jamais vide en vrai.** Tous les tests
  repartaient d'une base vierge. Au redémarrage du démon sur une base à jour, la vue des
  sessions était vide et les actions renvoyaient 404. Il a fallu un chantier entier
  (reconstruction au boot) que le plan initial n'avait pas vu.
- **Les dépendances bougent.** Une mise à jour de cmux a supprimé le champ qui typait les
  demandes ; toutes tombaient en « indéterminé ». Correctif en une journée, mais la leçon
  tient : un outil tiers piloté par sa CLI est un contrat qui peut changer sous vos pieds.
- **Faire relire chaque livraison par plusieurs agents indépendants** a corrigé des bugs
  réels avant livraison dans la majorité des phases, dont deux blocages de sécurité. C'est
  le mécanisme de qualité central quand il n'y a pas de relecteur humain.
- **Les règles d'architecture valent seulement si elles sont des tests.** « Tout local »
  et « lecture seule » étaient des principes dans un document ; elles ne sont devenues
  crédibles qu'une fois qu'un test les casse en cas de régression.

## Artefacts

- Dépôt : privé (code visible sur demande)
- README avec architecture, garanties et parcours utilisateur : présent dans le dépôt
- Journal des décisions d'architecture (D001 → D009) et rétrospectives par phase :
  présents dans le dépôt, à extraire pour publication
- Captures d'écran (flotte, Inbox, terminal intégré) : à produire
- Vidéo courte d'un parcours (question d'agent → réponse depuis l'Inbox) : à produire
- Mode démo sans agent réel et mise en ligne (Coolify) : à construire
- LICENSE : à choisir
