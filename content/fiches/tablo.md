---
nom: Tablo
statut: en cours
periode: avril 2026 → mai 2026 (code public en octobre 2026)
role: conception, développement, tests — seul, avec des agents de code
stack: Next.js 16, TypeScript strict, Tailwind v4, shadcn/ui, Supabase (Postgres, Auth, RLS), Claude API, AlaSQL, Recharts, Vitest
visibilite: public
depot: https://github.com/cedricgicquiaud/tablo
demo:
ordre: 5
visuel: /projets/tablo/accueil.png
captures:
  - fichier: /projets/tablo/tableau.webp
    legende: Un tableau de bord construit en trois questions, sur des données fictives.
  - fichier: /projets/tablo/connexion.webp
    legende: "La connexion d'une source : Supabase, Stripe et Airtable sont branchés."
  - fichier: /projets/tablo/vitrine.webp
    legende: La vitrine des 16 widgets d'origine, avec ses palettes et son mode sombre.
chiffres:
  - valeur: "3"
    libelle: sources réelles branchées (Supabase, Stripe, Airtable)
  - valeur: "8"
    libelle: types de widgets que l'IA sait proposer
  - valeur: "0,05 $"
    libelle: plafond de dépense par question
---

# Tablo — dashboards en langage courant

**En bref.** Un constructeur de dashboards : on branche une source (Supabase, Stripe ou Airtable) et on demande
un widget en une phrase. Trois sources réelles, huit types de widgets, une dizaine de secondes de la question au
widget. Code public sous licence MIT.

## Problème

Un tableau de bord de démo avec des chiffres inventés, c'est vite fait. Le faire tenir sur des données réelles,
avec une connexion sécurisée et des droits en lecture seule, est le vrai travail.

Et même branché, un tableau de bord classique oblige à savoir à l'avance quels graphiques construire. La question
qu'on se pose vraiment est plus simple : « quel canal rapporte le plus ce mois-ci ? ». Tablo part de cette phrase.

## Ce que j'ai construit

Une application web où l'on connecte un outil qu'on a déjà, puis où l'on pose ses questions en français.

**Le trajet d'une question.**
- **Brancher.** On connecte sa base Supabase, son compte Stripe ou une base Airtable, par la connexion officielle
  de chaque service. Tablo lit la structure des données une fois et la garde en mémoire.
- **Demander.** On écrit sa question. Un agent IA regarde les tables, écrit une requête SQL, vérifie le résultat et
  propose un widget parmi huit types : chiffre clé, courbe, barres, anneau, jauge, tableau, tunnel, chronologie.
- **Épingler.** On garde le widget sur un tableau de bord, on le déplace où l'on veut. Chaque réponse propose des
  questions de suite.
- **Démarrer vite.** À la connexion d'une base Supabase, Tablo reconnaît le type d'activité (e-commerce, CRM, SaaS,
  finance) et construit seul quatre ou cinq widgets de départ.

Décisions qui ont compté :
- **Lecture seule par construction.** Chaque requête passe un contrôle avant d'atteindre la source : une seule
  instruction, `SELECT` ou `WITH`, aucun mot d'écriture. La base de l'application refuse elle-même ce qu'un compte
  n'a pas le droit de lire (protection par ligne sur chaque table).
- **Les secrets restent côté serveur.** Les jetons de connexion sont chiffrés en base (AES-256-GCM) ; les clés
  d'administration et d'IA ne sont jamais envoyées au navigateur.
- **Une seule interface pour toutes les sources.** Stripe et Airtable sont interrogés en SQL en mémoire, en ne
  chargeant que les tables citées par la requête. Ajouter Airtable n'a rien changé à l'agent ni aux widgets.
- **Une dépense bornée.** Chaque question est plafonnée : dix étapes au plus, trois essais par outil, 0,05 $.
  Au-delà, la question s'arrête avec un message au lieu de tourner.

## Preuves

État au 08/10/2026 : fonctionnel en local, code public, pas encore en ligne.

- **Installation rejouée sur un clone neuf** le 08/10, en suivant le README à la lettre : base locale, données de
  démo, compte de démo, questions posées. Les captures de cette fiche viennent de cette session.
- **Une dizaine de secondes de la question au widget**, mesurée le 08/10 sur la source de démo (10 000 commandes
  fictives) ; environ 0,03 $ par question, d'après les jetons consommés.
- **Stripe et Airtable mesurés en local** : premier appel sous 700 ms, appels suivants en 1 ms grâce au cache.
- **Sécurité vérifiable dans le code** : 26 règles de protection par ligne sur 14 tables, contrôle de lecture seule
  sur chaque requête, jetons chiffrés.
- 437 tests automatisés et typage strict, relancés par la CI sur chaque pull request.

## Ce que j'en ai appris

- **Le design a changé le produit.** Le plan visait un tableau de bord SaaS. La maquette reçue était e-commerce :
  j'ai repris le schéma de données plutôt que de tordre seize widgets.
- **Pour un service tiers, jouer le vrai parcours avant d'écrire les tests.** La documentation d'une connexion
  OAuth ne dit pas tout. C'est devenu une règle écrite du projet.
- **Des tests verts ne remplacent pas un essai à la main.** Sur un moteur IA, l'essai manuel est une étape
  obligatoire avant chaque livraison.
- **Une relecture indépendante à chaque livraison** trouve ce que l'auteur ne voit plus.
- **Une interface commune paie dès la deuxième source.** La troisième s'est branchée sans toucher au reste.

## Artefacts

- Dépôt : https://github.com/cedricgicquiaud/tablo
- Installation et architecture : le README du dépôt, avec captures
- Démo en ligne : pas encore ; le README décrit l'installation locale
