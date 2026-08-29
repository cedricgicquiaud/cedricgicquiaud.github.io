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

## Livraison 2 — Intro et navigation

### PFO-4 — Section Intro : nom, titre, liens

- [ ] `npm run dev`, ouvrir http://localhost:3000/ à 1280 px puis à 375 px de large (outils de développement, mode appareil) : « Cédric Gicquiaud » et le titre « Je branche des agents IA… » sont lisibles sans défiler, sur fond quadrillé.
- [ ] Dans l'Intro, cliquer GitHub ouvre `https://github.com/cedricgicquiaud`, LinkedIn ouvre `https://www.linkedin.com/in/cedric-gicquiaud/`, Mail ouvre le client mail sur `cedric.gicquiaud@gmail.com` (survoler : l'URL commence par `mailto:`).
- [ ] Refus : ajouter `"phone": "+33 6 12 34 56 78"` dans `content/site.json`, lancer `npm test` : le test « refuse toute suite de chiffres ressemblant à un numéro de téléphone » échoue. Annuler la modification.

### PFO-5 — Menu fixe à ancres, section active

- [ ] Cliquer « Expérience » dans le menu : la page défile jusqu'à la section et l'URL se termine par `#experience`. Idem pour À propos (`#a-propos`), Projets (`#projets`), Contact (`#contact`, pied de page).
- [ ] Faire défiler la page à la molette : l'entrée du menu correspondant à la section visible est soulignée et change au fil du défilement.
- [ ] À 375 px de large : le menu est en haut de page (bandeau horizontal), pas de barre de défilement horizontale (`document.documentElement.scrollWidth <= window.innerWidth` dans la console renvoie `true`).
- [ ] Tab depuis le début de la page : le focus parcourt À propos, Expérience, Projets, Contact puis le bouton « Thème », avec un contour visible à chaque arrêt.
- [ ] Refus : dans `components/nav.tsx`, remplacer `lg:fixed` par `fixed`, lancer `npm test` : le test « passe en haut et en pleine largeur à 375 px » échoue. Annuler la modification. (Le défilement horizontal réel se constate seulement au navigateur, case ci-dessus.)

### PFO-6 — Bouton de thème persistant

- [ ] Cliquer « Thème » : la page passe en sombre (ou en clair). Recharger : le choix est conservé ; `localStorage.getItem("theme")` dans la console renvoie `"dark"` ou `"light"`, et aucun flash de l'autre thème au chargement.
- [ ] `localStorage.removeItem("theme")` dans la console puis recharger : la page suit le réglage système (basculer le système clair/sombre change le fond sans rechargement) ; `document.documentElement.dataset.theme` est `undefined`.
- [ ] Refus : dans la console, exécuter `Object.defineProperty(window, "localStorage", { get() { throw new Error("blocked"); } })` puis cliquer « Thème » : la page bascule sans erreur bloquante. Sous `npm test`, le test « rend quand même en thème système si localStorage lève une exception » couvre ce cas ; retirer le `try/catch` de `storedTheme` dans `components/theme-toggle.tsx` le fait échouer. Annuler la modification.

### PFO-7 — Pied de page et métadonnées

- [ ] En bas de page : « Site généré depuis mes fiches de preuve. » suivi du lien `github.com/cedricgicquiaud/cedricgicquiaud.github.io`, qui ouvre le dépôt.
- [ ] Onglet du navigateur : « Cédric Gicquiaud ». Afficher la source : `<meta name="description" content="Je branche des agents IA…">`.
- [ ] Refus : vider `"title"` dans `content/site.json` (`"title": ""`), lancer `npm test` : le test « refuse une description vide » échoue. Annuler la modification.
