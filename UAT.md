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

## Livraison 3 — À propos et Expérience

### PFO-8 — Chargement du contenu Markdown avec frontmatter validé

- [ ] `npm run dev` (port 3003 : `npx next dev -p 3003`), ouvrir la page : sous l'Intro, la section « À propos » affiche le texte de `content/about.md` et la section « Expérience » les blocs de `content/experience.md`.
- [ ] Refus : renommer `content/about.md` en `about.md.bak`, lancer `npm run build` : le build échoue avec `Error: content/about.md manquant (attendu : …/content/about.md)`. Restaurer le fichier.
- [ ] Refus : dans `content/about.md`, remplacer la ligne `titre: À propos` par `auteur: x`, lancer `npm run build` : le build échoue avec `content/about.md : frontmatter incomplet, champ « titre » requis`. Annuler la modification.

### PFO-9 — Textes À propos et Expérience

- [ ] Lire « À propos » dans le navigateur : au moins trois paragraphes, dans l'ordre ESN, immobilier, agents IA ; aucun nom d'employeur ni de client, aucun superlatif. Corriger le texte à la PR si besoin.
- [ ] Lire « Expérience » : quatre blocs (2026, 2023–2025, 2013–2023, 2000–2013), chacun avec période, rôle, secteur, description et au moins un tag. Les dates sont des hypothèses : confirmer ou corriger dans `content/experience.md`.
- [ ] Refus : dans `content/about.md`, remplacer « Treize ans en ESN » par « Treize ans chez Nexus », lancer `npm run build` : `next build` réussit puis `check-output` échoue avec `index.html : mot interdit « Nexus »`. Annuler la modification.

### PFO-10 — Sections À propos et Expérience rendues

- [ ] Dans le navigateur, section « Expérience » : les blocs se lisent de haut en bas du plus récent (2026) au plus ancien (2000–2013).
- [ ] Chaque bloc montre, à gauche, la période ; à droite, le rôle en titre, le secteur en dessous, la description, puis les tags en pastilles (badges). À 375 px de large, la période passe au-dessus du rôle.
- [ ] Refus : dans `content/experience.md`, supprimer la ligne `periode: "2026"` du premier bloc, lancer `npm run build` : le build réussit, la sortie contient `content/experience.md : bloc sans « période » ignoré (rôle : Constructeur d'agents IA)`, et la page ne montre plus que trois blocs. Annuler la modification.

### PFO-11 — Contrôle du HTML généré

- [ ] `npm run build` : la dernière ligne affiche `check-output : …/out propre`.
- [ ] Refus : ajouter « Nexus » dans `content/about.md`, lancer `npm run build` : échec avec `mot interdit « Nexus »`. Annuler.
- [ ] Refus : ajouter un emoji (par exemple une fusée) dans `content/about.md`, lancer `npm run build` : échec avec `emoji « … »`. Annuler.
- [ ] Refus : dans `content/about.md`, ajouter `<script src="https://cdn.example.com/x.js"></script>`, lancer `npm run build` : échec avec `domaine tiers « cdn.example.com »`. Annuler.
- [ ] Refus : ajouter « 06 12 34 56 78 » dans `content/about.md`, lancer `npm run build` : échec avec `numéro de téléphone « 06 12 34 56 78 »`. Annuler.
