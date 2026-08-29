# Cahier de recette

Une case par « Terminé quand ». Chaque case dit quoi faire et, pour les refus, l'échec attendu.
Ne rien cocher avant d'avoir constaté.

## Livraison 1 — Socle

### PFO-1 — Squelette Next.js en export statique

- [x] `npm ci && npm run build` : le fichier `out/index.html` existe et s'ouvre dans un navigateur (page avec les sections Intro, Portrait, À propos, Expérience).
  constaté le 2026-08-29 : build OK, `out/index.html` (7 Ko) ; page affichée sur `http://localhost:3001/` avec Navigation, Thème, Intro, Portrait, À propos, Expérience, Pied de page (capture `recette-L1/PFO-1-page-clair.jpg`).
- [x] `npm test` : la suite tourne et affiche `11 passed`.
  constaté le 2026-08-29 : `Tests 11 passed (11)`.
- [x] Refus : créer `app/api/route.ts`, lancer `npm test` : le test « refuse tout dossier app/api » échoue. Supprimer le fichier et le dossier ensuite.
  constaté le 2026-08-29 : « refuse tout dossier app/api (aucune API route) » échoue (le test « produit out/index.html » échoue aussi, le build statique refusant la route) ; fichier et dossier supprimés.

### PFO-2 — Tokens de thème clair et sombre, fond quadrillé

- [x] `grep -rnE "#[0-9a-fA-F]{3,8}\b|rgb\(" app components lib --include=*.ts --include=*.tsx | grep -v globals.css` ne renvoie rien : chaque couleur est un token de `app/globals.css`.
  constaté le 2026-08-29 : aucune ligne renvoyée (sous zsh, quoter `--include='*.ts'` sinon le shell refuse le glob).
- [ ] Dans un navigateur, `npm run dev`, passer le système en sombre : le fond devient nuit sans rechargement ; `document.documentElement.dataset.theme = "light"` dans la console ramène le clair.
  partiel le 2026-08-29 : `dataset.theme = "dark"` passe le fond de `rgb(255,255,255)` à `rgb(11,18,32)` sans rechargement, `"light"` ramène le blanc (capture `recette-L1/PFO-2-theme-sombre.jpg`). NON TESTABLE pour la bascule système : le testeur ne peut pas changer le réglage d'apparence de l'OS ni piloter l'émulation DevTools ; à rejouer par un humain (Réglages → Apparence → Sombre).
- [x] Refus : ajouter `style={{ color: "#2F5BEA" }}` dans `components/intro.tsx`, lancer `npm test` : le test « refuse toute couleur en dur » échoue en citant `components/intro.tsx`. Annuler la modification.
  constaté le 2026-08-29 : « refuse toute couleur en dur hors app/globals.css » échoue avec `expected [ 'components/intro.tsx' ] to deeply equal []` ; modification annulée.
- [x] Refus : dans `app/globals.css`, bloc `:root[data-theme="dark"]`, remplacer `--muted-foreground: #a3b1cc` par `#4a5568`, lancer `npm test` : le test de contraste « (sombre) » échoue sur `muted-foreground/background`. Annuler la modification.
  constaté le 2026-08-29 : les deux tests « (système sombre) » et « (sombre) » échouent avec `muted-foreground/background: expected 2.49 to be >= 4.5` ; modification annulée.

### PFO-3 — Déploiement GitHub Pages par Actions

- [ ] Après merge sur `main` : l'onglet Actions montre le workflow « Deploy to GitHub Pages » vert, et https://cedricgicquiaud.github.io affiche la page en moins de 5 min (à activer une fois : Settings → Pages → Source « GitHub Actions »).
  NON TESTABLE le 2026-08-29 : la livraison n'est pas encore mergée sur `main` ; à rejouer après le merge.
- [x] Refus : sur une branche, ajouter un fichier `AUDIT.md` vide, lancer `npm test` : le test « ne contient ni PLAN.md, ni REPOS.md, ni AUDIT.md » échoue. Le pousser sur `main` ferait échouer l'étape `Guard` du workflow avant l'installation.
  constaté le 2026-08-29 : le test échoue avec `expected [ 'AUDIT.md' ] to deeply equal []` ; fichier supprimé. L'étape `Guard` sur `main` n'a pas été jouée (pas de push sur main).

## Livraison 4 — Photo bi-ton et finitions

### PFO-12 — Portrait en bi-ton bleu par CSS

- [x] `npm run dev`, ouvrir la page : sous l'Intro, le cadre du portrait apparaît en bleu (initiales « CG » tant que `public/portrait.jpg` n'est pas fourni). Passer en sombre (`document.documentElement.dataset.theme = "dark"` dans la console) : le cadre reste en bi-ton bleu, sans couleur d'origine, dans les deux thèmes.
- [ ] Déposer une photo couleur dans `public/portrait.jpg`, relancer `npm run dev` : la photo s'affiche à la place du cadre, en bi-ton bleu (jamais en couleur), en clair comme en sombre. Retirer le fichier ensuite.
  non testable : l'écriture d'un fichier dans `public/` a été refusée par la permission de l'environnement de test (2026-08-29) ; à jouer à la main.
- [x] Refus : dans `components/portrait.tsx`, retirer `grayscale` de la `className` de l'image, lancer `npm test` : le test « applique grayscale + contraste à l'image et la fusionne sur un fond bleu token » échoue. Annuler la modification.
- [x] Refus : renommer `public/portrait-placeholder.svg`, lancer `npm test` : le test « sans public/portrait.jpg, affiche le cadre provisoire SVG » échoue. Remettre le nom.

### PFO-13 — Image Open Graph et recette d'accessibilité

- [x] `npm run build` : `out/opengraph-image.png` existe (1200×630, nom et titre sur fond bleu) et `out/index.html` contient `<meta property="og:image" content="https://cedricgicquiaud.github.io/opengraph-image.png"/>`.
- [x] Refus : renommer `public/opengraph-image.png`, lancer `npm run build` puis `npm test` : le test « out/opengraph-image.png existe » échoue. Remettre le nom.
- [x] Mobile : `npm run dev`, largeur de fenêtre 375 px (DevTools, mode appareil) : aucun défilement horizontal (`document.documentElement.scrollWidth <= 375` dans la console), le menu reste en haut.
- [x] Clavier : depuis le haut de la page, Tab parcourt le menu, le bouton de thème, les liens de l'Intro et du pied de page ; chaque élément reçoit un contour de focus visible, aucun n'est sauté.
- [x] Contraste sombre : en thème sombre, tout texte visible (titre, sous-titre, liens, texte secondaire) atteint ≥ 4,5:1 sur son fond (DevTools → panneau Accessibilité, ou `npm test` pour les paires de tokens).
