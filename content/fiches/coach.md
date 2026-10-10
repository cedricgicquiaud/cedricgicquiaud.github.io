---
nom: Coach
statut: en cours
periode: janvier 2026 → aujourd'hui
role: produit et développement, seul côté technique, avec des agents de code ; cadrage avec les dirigeants, échanges avec les partenaires
stack: React Native, Expo, TypeScript, Python/FastAPI, Supabase (Postgres, Auth), Railway, EAS, OpenAI, plateforme d'agents IA, MCP, Jest, pytest, Maestro, Linear
visibilite: anonyme
depot:
demo:
visuel: /projets/coach/accueil.webp
captures:
  - fichier: /projets/coach/forme.webp
    legende: "Maquette, données fictives : la forme du jour, calculée à partir de la montre et du sommeil."
  - fichier: /projets/coach/coach-ia.webp
    legende: "Maquette, données fictives : le coach IA propose une séance, l'utilisateur confirme."
  - fichier: /projets/coach/resultats.webp
    legende: "Maquette, données fictives : un bilan sanguin classé et interprété."
ordre: 1
---

# Coach — santé et longévité IA

**En bref.** Une application mobile de santé et de longévité qui relie montres connectées, analyses sanguines à domicile, entraînement et boutique, avec un coach IA qui s'appuie sur les vraies données de l'utilisateur. Je la mène seul côté technique depuis janvier 2026 : une dizaine de services externes branchés, un orchestrateur et quatre agents IA spécialisés, une version de test distribuée sur iPhone. Projet client présenté sous un nom de code, code privé, pas encore sorti sur les stores.

## Problème

Un centre de santé et de longévité vend des bilans sanguins, des compléments alimentaires et
des séances. Ses clients mesurent déjà beaucoup de choses : montre connectée, analyses, applis
de sport. Ces données restent dans des silos, sans interprétation, et sans lien avec ce que le
centre propose.

Le besoin : une application qui rassemble ces données en un profil, les fait interpréter par
une IA, et en tire des actions concrètes (une séance, un complément, un test). Le projet
partait de zéro, et j'étais seul côté technique.

## Ce que j'ai construit

Une application iOS et Android et son serveur. L'utilisateur connecte sa montre, commande un
kit d'analyse, suit un programme d'entraînement et discute avec un coach IA qui connaît ses
mesures.

Les décisions qui ont compté :
- **Un adaptateur par partenaire.** Le code métier ne connaît aucun service externe : chaque
  partenaire (montres, analyses, compléments, paiement) passe par un adaptateur
  interchangeable. Quand j'ai changé d'agrégateur de montres connectées, le code métier
  n'a pas bougé.
- **Un orchestrateur et quatre agents.** Chaque demande est aiguillée vers le bon spécialiste :
  analyse des données, expertise médicale, coaching, recommandation de produits. Les agents
  lisent les données par des serveurs MCP, jamais par un accès direct à la base.
- **Les droits d'abord.** Chaque accès aux données de santé est vérifié côté serveur, y compris
  quand c'est un agent IA qui le demande.
- **L'IA propose, l'utilisateur valide.** Une action qui écrit (planifier une séance) demande
  une confirmation. Aucun modèle n'est appelé sans le consentement IA de l'utilisateur.
- **Une roadmap par portes de lancement.** Distribution restreinte, publication publique, puis
  après lancement : chaque nouvelle demande se range dans une porte, ce qui garde la date
  lisible pour les dirigeants.
- **Les sujets réglementaires écrits noir sur blanc.** J'ai mis en place la transparence exigée
  par l'AI Act et rédigé les études d'impact sur l'hébergement des données de santé, pour que
  les dirigeants tranchent.

## Preuves

État au 10/10/2026 : en développement ; version de test distribuée, sortie sur les stores en préparation.

- **Ça marche ?** Version de test envoyée aux testeurs sur iPhone le 24/07/2026. Connexion des
  montres depuis l'application validée sur un iPhone réel ; notifications reçues sur un iPhone
  réel.
- **C'est solide ?** Intégration continue verte le 15/09/2026 sur le serveur et le mobile.
  Chaque changement depuis fin août part d'un test écrit avant le code, vérifié par un agent
  qui ne l'a pas écrit.
- **C'est utilisable ?** Sur 15 questions hors périmètre posées au coach, 15 déclinées
  poliment en une phrase.

Prochaine porte : la publication sur les stores — achats réels, recette Android, environnement
final et validation juridique de l'hébergement des données de santé.

## Ce que j'en ai appris

- **Isoler chaque partenaire paie tôt.** Sans les adaptateurs, le changement d'agrégateur de
  montres aurait été une réécriture.
- **Un agent branché sur des données de santé commence par les droits.** Je les pose avant
  de lui donner le moindre outil.
- **Les demandes ne s'arrêtent jamais.** Sans roadmap par portes, chaque nouvelle idée
  repousse la date. Rangée dans une porte, elle devient une décision.
- **Le juridique n'est pas mon métier, mais je le rends visible.** Une étude d'impact courte
  permet aux dirigeants de trancher, au lieu de découvrir le sujet à la revue d'Apple.

## Artefacts

- Maquettes des trois écrans principaux, redessinées sur données fictives : les vrais écrans restent privés.
- Code privé (projet client) : démonstration de l'application sur iPhone en entretien.
