---
nom: Dashboard (Tablo)
statut: en cours
periode: avril 2026 → mai 2026 (nettoyage du dépôt en août 2026)
role: conception, développement, tests — seul, avec des agents de code
stack: Next.js 16, TypeScript strict, Tailwind v4, shadcn/ui, Supabase (Postgres, Auth, RLS), Recharts, Vitest, Claude API
visibilite: vitrine
depot:
demo: à venir (Vercel)
ordre: 5
---

# Dashboard — un tableau de bord branché sur ses vraies données

**En bref.** Parti comme un template de dashboard e-commerce (16 widgets), devenu une
application où l'on connecte une source (Supabase, Stripe, Airtable) et où l'on demande
un widget en langage courant. 436 tests verts, build propre. Code privé, démo en ligne à venir.

## Problème

Un tableau de bord de démo avec des données inventées, c'est vite fait. Le faire tenir sur
des données réelles, avec une connexion sécurisée et des droits en lecture seule, est le vrai
travail. Ce projet a servi de terrain, d'abord comme template réutilisable, puis comme base
pour brancher les outils qu'un utilisateur a déjà.

## Ce que j'ai construit

- **Le template.** 16 widgets (KPI, courbes, jauge, heatmap, tunnel, carte, table triable)
  alimentés par 20 fonctions SQL. Thème clair/sombre. Données de démo reproductibles.
- **Sécurité par défaut.** Chaque table a la protection par ligne activée (RLS : la base
  refuse elle-même ce que l'utilisateur n'a pas le droit de lire). Aucune écriture depuis le
  navigateur. La clé d'administration n'atteint jamais le code envoyé au client.
- **Le pivot vers Tablo.** Trois connecteurs OAuth, jetons chiffrés en base (AES-256-GCM).
  Une seule interface `DataSource` : Stripe et Airtable sont interrogés en SQL en mémoire,
  en ne chargeant que les tables citées dans la requête.
- **Un moteur IA modulaire.** L'utilisateur décrit le widget voulu ; l'agent explore le
  schéma, écrit la requête et propose le widget, en flux continu. Au premier branchement,
  il génère 4-5 widgets de départ adaptés au type d'activité.

## Preuves

État au 30/08/2026 : Fonctionnel en local, pas encore mis en ligne.


Vérifié le 29/08/2026 sur un clone propre :
- **436 tests Vitest verts**, sans base de données (5 tests exigent une clé de chiffrement
  locale générée par `openssl`).
- **Build de production Next.js qui passe** avec des variables Supabase factices.
- **26 politiques RLS** dans 14 migrations, sur 14 tables.
- 16 widgets statiques + 8 widgets dynamiques pour l'IA ; 3 fournisseurs actifs sur 9 affichés.
- Sources Stripe et Airtable mesurées en local : premier appel sous 700 ms, en cache 1 ms.

État honnête : le typage strict remonte 2 erreurs dans un fichier de test, le lint 1 erreur.
Les tests d'intégration base demandent Supabase local (Docker), non rejoués ici. Pas de
déploiement, pas d'utilisateur externe. Le README décrit encore le template seul.

## Ce que j'en ai appris

- **Le design a changé le produit.** Le plan visait un dashboard SaaS (MRR, churn). La maquette
  reçue était e-commerce : j'ai jeté le premier schéma plutôt que de tordre 16 widgets.
- **Tests verts ne veut pas dire que ça marche.** Sur le moteur IA, 7 bugs réels sont sortis
  d'un test manuel après 183 tests verts. Le test manuel est devenu une règle écrite du projet.
- **Pour un OAuth tiers, jouer le flux réel avant les tests unitaires.** Stripe a contredit sa
  doc 7 fois (scope refusé, mauvaise URL de jeton).
- **Une relecture indépendante trouve ce que le TDD ne voit pas** : un cache partagé entre
  clients a été repéré à l'audit, pas par les tests.

## Artefacts

- Dépôt : privé (vitrine), accès sur demande
- Démo en ligne : à venir (Vercel)
- Captures des 16 widgets clair/sombre : à produire
- Vidéo courte « une phrase → un widget » : à produire
