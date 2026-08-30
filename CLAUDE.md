# Site portfolio — cedricgicquiaud.github.io

Site portfolio d'une page (Intro, À propos, Expérience, Projets), plus une page par fiche
de preuve. Cadrage : `.pilot/PRD.md`. Les fiches sont copiées depuis `../fiches/` au build
(`npm run sync`) ; le dépôt public ne contient jamais `PLAN.md`, `REPOS.md` ni `AUDIT.md`
du dossier parent.

Stack : Next.js (App Router, export statique), Tailwind, shadcn/ui, Vitest. Déploiement
GitHub Pages par GitHub Actions à chaque merge sur `main`.

Ton et règles : `../CLAUDE.md` (WATIDO) et `~/Desktop/Projects/Linkedin/brand/guidelines.md`.
Direct, sans emoji, sans superlatif ; jamais « finalisé » ; aucun nom de client, de collègue
ni d'employeur. Français seul.

## Pilot

- Workspace Linear : gm5 (connexion MCP : `linear-gm5` ; clé API : `~/.config/pilot/linear-gm5.env`)
- Team : Portfolio — clé `PFO` — id `8ded5078-3208-4ef0-bff7-c69b2f87e987`
- Feature = Project Linear (semaines) ; livraison = jalon = une PR (jours) ; tâche = issue.
  Toute fiche suit les templates de la team (Feature / Tâche / Bug).
- Branches : `feature/PFO-<n°-première-tâche>-<slug>`, `fix/PFO-<n°>-<slug>`,
  `chore/PFO-<n°>-<slug>`
- PR : une par livraison, titre `PFO-<n°> <titre de la livraison>` ; description cite ses tâches (`Closes PFO-n, …`)
- Merge : humain
- Agents en parallèle : 1 (nombre de livraisons produites en même temps par `run` ; monter à 2 ou 3 quand la boucle a fait ses preuves)
- Cahier de recette : `UAT.md` à la racine (lien depuis chaque feature)
- Lancer l'app : `npm run dev` (Next.js, `http://localhost:3000/`)
- Testeur : navigateur piloté (Chrome, extension Claude)
- Capacité : `days_per_week` dans `.pilot/calibration.md` (observed, ou un nombre pour forcer)
- Échéance : 2026-09-13
- Barème : `.pilot/calibration.md`
- Règle : aucun développement sans fiche Linear ; rien n'est créé dans Linear sans liste validée.

## Idiomes de code

(validés le 30/08 après la feature F1)

- Les ids de section et les ancres du menu sont définis à un seul endroit (`content/site.json`) ; tout composant les lit de là.
- Aucune liste de mots sensibles en clair dans le dépôt : empreintes SHA-256 seulement (`content/forbidden.txt`).
- Un test qui lance `next build` ne tourne jamais en parallèle d'un autre : `fileParallelism: false` reste en place dans `vitest.config.ts`.
- Un composant ne se positionne pas lui-même (`fixed`, `top-*`, `right-*`) ; son parent dans `page.tsx` ou `layout.tsx` le place.
- La variante `dark:` couvre les deux états sombres (système et forcé) ; ne pas la simplifier.
