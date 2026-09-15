---
nom: App santé
statut: en cours
periode: janvier 2026 → aujourd'hui
role: produit et développement, seul côté technique, avec des agents de code ; cadrage avec les dirigeants, échanges avec les partenaires
stack: React Native, Expo, TypeScript, Python/FastAPI, Supabase (Postgres, Auth), Railway, EAS, OpenAI, plateforme d'agents IA, MCP, Jest, pytest, Maestro, Linear
visibilite: anonyme
depot:
demo:
ordre: 1
---

# App santé — un coach IA branché sur les montres, les analyses et la boutique

**En bref.** Une application mobile de santé et de longévité qui relie montres connectées, analyses sanguines à domicile, entraînement et boutique, avec un coach IA qui s'appuie sur les vraies données de l'utilisateur. Menée seule côté technique depuis janvier 2026 : une dizaine de services externes branchés, un orchestrateur et quatre agents IA spécialisés, une version de test distribuée sur iPhone. Projet client, code privé, pas encore sortie sur les stores.

## Problème

Un centre de santé et de longévité vend des bilans sanguins, des compléments alimentaires et
des séances. Ses clients mesurent déjà beaucoup de choses : montre connectée, analyses, applis
de sport. Ces données restent dans des silos, sans interprétation, et sans lien avec ce que le
centre propose.

Le besoin : une application qui rassemble ces données en un profil, les fait interpréter par
une IA, et en tire des actions concrètes (une séance, un complément, un test). Le projet
partait de zéro, avec une seule personne côté technique.

## Ce que j'ai construit

Une application iOS et Android et son serveur. L'utilisateur connecte sa montre, commande un
kit d'analyse, suit un programme d'entraînement et discute avec un coach IA qui connaît ses
mesures.

Décisions qui ont compté :
- **Un adaptateur par partenaire.** Le code métier ne connaît aucun service externe : chaque
  partenaire (montres, analyses, compléments, paiement) passe par un adaptateur
  interchangeable. Quand il a fallu changer d'agrégateur de montres connectées, le code métier
  n'a pas bougé.
- **Un orchestrateur et quatre agents.** Chaque demande est classée dans l'un des huit parcours
  prévus, puis confiée au bon spécialiste : analyse des données, expertise médicale, coaching,
  recommandation de produits. Les agents lisent les données par des serveurs MCP, pas par un
  accès direct à la base.
- **Qui a le droit de voir quoi, d'abord.** L'identité de l'utilisateur voyage dans un jeton
  signé, jamais dans un paramètre libre, et aucun journal n'affiche un jeton. Un accès trop
  permissif via les outils IA a été trouvé et corrigé avant la bascule vers les agents.
- **L'IA propose, l'utilisateur valide.** Une action qui écrit (planifier une séance) demande
  une confirmation. Aucun modèle n'est appelé sans le consentement IA enregistré de l'utilisateur.
- **Une roadmap par portes de lancement.** Distribution restreinte, publication publique, puis
  après lancement : chaque demande nouvelle se range dans une porte, ce qui garde la date lisible
  pour les dirigeants.
- **Les sujets réglementaires écrits noir sur blanc.** Transparence exigée par l'AI Act mise en
  place ; études d'impact sur l'hébergement de données de santé rédigées pour que les dirigeants
  tranchent.

## Preuves

État au 15/09/2026 : en développement ; version de test distribuée, pas encore sortie sur les stores.

- **Ça marche ?** Version de test envoyée aux testeurs sur iPhone le 24/07/2026. Connexion des
  montres depuis l'application validée sur un iPhone réel ; notifications reçues sur un iPhone
  réel.
- **C'est solide ?** Intégration continue verte le 15/09/2026 : 1 529 tests serveur et 643 tests
  mobile. Chaque changement depuis fin août part d'un test écrit avant le code, vérifié par un
  agent qui ne l'a pas écrit.
- **C'est utilisable ?** Mesure du hors-sujet sur le coach : 15 questions hors périmètre sur 15
  déclinées en une phrase après la réécriture du prompt de l'orchestrateur.

État honnête : l'application n'est pas sortie sur les stores. Avant une sortie publique, la
roadmap du 13/08 listait les achats réels, la recette Android, l'environnement final et un avis
juridique sur l'hébergement des données de santé. Plusieurs livrables dépendent de partenaires :
leur retard est subi, pas pilotable.

## Ce que j'en ai appris

- **Isoler chaque partenaire paie tôt.** Le changement d'agrégateur de montres aurait été une
  réécriture sans les adaptateurs.
- **Un agent branché sur des données de santé commence par les droits.** La faille d'accès est
  venue des outils IA, pas de l'application : c'est là qu'il faut regarder en premier.
- **Les demandes ne s'arrêtent jamais.** Sans roadmap par portes, chaque nouvelle idée des
  dirigeants repoussait la date. Rangée dans une porte, elle devient une décision.
- **Le juridique n'est pas mon métier, mais je le rends visible.** Une étude d'impact courte
  permet aux dirigeants de trancher au lieu de découvrir le sujet à la revue d'Apple.

## Artefacts

- Vidéo de démonstration de 95 s, générée par code : à anonymiser avant publication
- Captures de l'application sur données fictives : à produire
- Schéma de l'orchestrateur et des quatre agents : à produire
