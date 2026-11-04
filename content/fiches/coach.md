---
nom: Coach
statut: en cours
periode: janvier 2026 → aujourd'hui
role: produit et développement, seul côté technique, avec des agents de code ; cadrage avec les dirigeants, échanges avec les partenaires
stack: React Native, Expo, TypeScript, Python/FastAPI, Supabase (Postgres, Auth), Railway, EAS, OpenAI, plateforme d'agents IA, MCP, Jest, pytest, Maestro, Linear
stack_detail:
  - categorie: Mobile
    outils: React Native, Expo, TypeScript, EAS
  - categorie: Serveur
    outils: Python, FastAPI, Railway
  - categorie: Données et comptes
    outils: Supabase (Postgres, Auth)
  - categorie: IA
    outils: OpenAI, plateforme d'agents IA, serveurs MCP
  - categorie: Tests
    outils: Jest, pytest, Maestro
  - categorie: Pilotage
    outils: Linear
visibilite: anonyme
depot:
demo:
visuel: /projets/coach/accueil.webp
captures:
  - fichier: /projets/coach/forme.webp
    legende: "Maquette, données fictives : la forme du jour, calculée à partir de la montre et du sommeil."
  - fichier: /projets/coach/coach-ia.webp
    legende: "Maquette, données fictives : le coach IA propose une séance, l'utilisateur confirme."
  - fichier: /projets/coach/programme.webp
    legende: "Maquette, données fictives : le programme généré par le coach, semaine par semaine, à partir d'un objectif daté."
  - fichier: /projets/coach/resultats.webp
    legende: "Maquette, données fictives : un bilan sanguin classé et interprété."
  - fichier: /projets/coach/boutique.webp
    legende: "Maquette, données fictives : les kits d'analyse à domicile et le protocole de compléments proposé par le coach."
  - fichier: /projets/coach/profil.webp
    legende: "Maquette, données fictives : ce que l'app sait de l'utilisateur, et ce qu'il contrôle."
ordre: 1
---

# Coach — santé et longévité IA

**En bref.** Une application mobile de santé et de longévité qui relie montres connectées, analyses sanguines à domicile, entraînement et boutique, avec un coach IA qui s'appuie sur les vraies données de l'utilisateur. Je la mène seul côté technique depuis janvier 2026 : une dizaine de services externes branchés, un orchestrateur et quatre agents IA spécialisés, une version de test distribuée sur iPhone. Projet client présenté sous un nom de code, code privé, pas encore sorti sur les stores.

## Problème

Une marque de santé préventive haut de gamme accueille ses clients en centre. Chacun y suit un
protocole selon son objectif : performance, récupération, qualité de la peau, longévité. La
méthode : mesurer par un bilan complet, personnaliser par un plan sur mesure, puis ajuster en
continu.

Entre deux séances, ce suivi n'avait pas de support. Les mesures du quotidien (montre, sommeil,
entraînement) et les résultats d'analyse restaient séparés, sans interprétation et sans lien
avec le protocole du client.

Le besoin : une application qui prolonge le centre au quotidien. Elle rassemble ces données en
un profil, les fait interpréter par une IA et en tire des actions concrètes : une séance, un
complément, un nouveau test. Le projet partait de zéro, et j'étais seul côté technique.

## Livrables

- Une application iOS et Android et son serveur.
- La connexion des montres connectées, et une forme du jour calculée à partir de la montre et du
  sommeil.
- Un coach IA qui connaît les mesures de l'utilisateur et propose des séances, à confirmer.
- Des programmes d'entraînement générés semaine par semaine, à partir d'un objectif daté.
- Des kits d'analyse sanguine à domicile, avec des résultats classés et interprétés.
- Une boutique de compléments, liée au protocole proposé par le coach.
- Un profil où l'utilisateur voit ce que l'application sait de lui, et ce qu'il contrôle.
- Une roadmap par portes de lancement et des études d'impact réglementaires, pour les
  dirigeants.

## Architecture

L'application mobile (React Native, Expo) parle à un serveur (FastAPI). Les comptes et les
données de santé vivent dans Supabase, et le serveur est hébergé sur Railway.

Chaque partenaire passe par un adaptateur interchangeable : montres connectées, analyses,
compléments, paiement. Le code métier ne connaît aucun service externe.

Côté IA, un orchestrateur aiguille chaque demande vers l'un des quatre agents spécialisés :
analyse des données, expertise médicale, coaching, recommandation de produits. Les agents
lisent les données par des serveurs MCP, jamais par un accès direct à la base. Le serveur vérifie
les droits à chaque lecture.

## Décisions

### Un adaptateur par partenaire

Le code métier ne connaît aucun service externe. Quand j'ai changé d'agrégateur de montres
connectées, le code métier n'a pas bougé.

### Un orchestrateur et quatre agents

Chaque demande est aiguillée vers le bon spécialiste. Les agents lisent les données par des
serveurs MCP, jamais par un accès direct à la base.

### Les droits d'abord

Chaque accès aux données de santé est vérifié côté serveur, y compris quand c'est un agent IA
qui le demande.

### L'IA propose, l'utilisateur valide

Une action qui écrit (planifier une séance) demande une confirmation. Aucun modèle n'est appelé
sans le consentement IA de l'utilisateur.

### Une roadmap par portes de lancement

Distribution restreinte, publication publique, puis après lancement : chaque nouvelle demande se
range dans une porte, ce qui garde la date lisible pour les dirigeants.

### Les sujets réglementaires écrits noir sur blanc

J'ai mis en place la transparence exigée par l'AI Act et rédigé les études d'impact sur
l'hébergement des données de santé, pour que les dirigeants tranchent.

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

- Maquettes de six écrans, redessinées sur données fictives : les vrais écrans restent privés.
- Code privé (projet client) : démonstration de l'application sur iPhone en entretien.
