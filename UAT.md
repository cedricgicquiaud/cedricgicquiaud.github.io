# Cahier de recette

Une case par « Terminé quand ». Chaque case dit quoi faire et, pour les refus, l'échec attendu.
Ne rien cocher avant d'avoir constaté.

## Livraison 1 — Socle

### PFO-1 — Squelette Next.js en export statique

- [ ] `npm ci && npm run build` : le fichier `out/index.html` existe et s'ouvre dans un navigateur (page avec les sections Intro, Portrait, À propos, Expérience).
- [ ] `npm test` : la suite tourne et affiche `11 passed`.
- [ ] Refus : créer `app/api/route.ts`, lancer `npm test` : le test « refuse tout dossier app/api » échoue. Supprimer le fichier et le dossier ensuite.

### PFO-2 — Tokens de thème clair et sombre, fond quadrillé

- [ ] `grep -rnE "#[0-9a-fA-F]{3,8}\b|rgb\(" app components lib --include=*.ts --include=*.tsx | grep -v globals.css` ne renvoie rien : chaque couleur est un token de `app/globals.css`.
- [ ] Dans un navigateur, `npm run dev`, passer le système en sombre : le fond devient nuit sans rechargement ; `document.documentElement.dataset.theme = "light"` dans la console ramène le clair.
- [ ] Refus : ajouter `style={{ color: "#2F5BEA" }}` dans `components/intro.tsx`, lancer `npm test` : le test « refuse toute couleur en dur » échoue en citant `components/intro.tsx`. Annuler la modification.
- [ ] Refus : dans `app/globals.css`, bloc `:root[data-theme="dark"]`, remplacer `--muted-foreground: #a3b1cc` par `#4a5568`, lancer `npm test` : le test de contraste « (sombre) » échoue sur `muted-foreground/background`. Annuler la modification.

### PFO-3 — Déploiement GitHub Pages par Actions

- [ ] Après merge sur `main` : l'onglet Actions montre le workflow « Deploy to GitHub Pages » vert, et https://cedricgicquiaud.github.io affiche la page en moins de 5 min (à activer une fois : Settings → Pages → Source « GitHub Actions »).
- [ ] Refus : sur une branche, ajouter un fichier `AUDIT.md` vide, lancer `npm test` : le test « ne contient ni PLAN.md, ni REPOS.md, ni AUDIT.md » échoue. Le pousser sur `main` ferait échouer l'étape `Guard` du workflow avant l'installation.
