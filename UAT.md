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

- [x] `npm run dev`, ouvrir http://localhost:3000/ à 1280 px puis à 375 px de large (outils de développement, mode appareil) : « Cédric Gicquiaud » et le titre « Je branche des agents IA… » sont lisibles sans défiler, sur fond quadrillé.
  constaté le 2026-08-29 (port 3002, largeur émulée par un cadre de 1280 puis 375 px chargeant la page) : à 1280 px, nom (bas à 322 px) et titre (bas à 402 px) visibles sans défiler sur fond quadrillé ; à 375 px, nom (320 px) et titre (428 px) visibles sur 667 px de haut (captures `recette-L2/PFO-4-accueil-1280-clair.jpg`, `PFO-4-accueil-375.jpg`). Vu hors cahier à 375 px : le bouton « Thème » (x 290–359) recouvre la fin de l'entrée « Contact » du menu (x 249–316).
- [x] Dans l'Intro, cliquer GitHub ouvre `https://github.com/cedricgicquiaud`, LinkedIn ouvre `https://www.linkedin.com/in/cedric-gicquiaud/`, Mail ouvre le client mail sur `cedric.gicquiaud@gmail.com` (survoler : l'URL commence par `mailto:`).
  constaté le 2026-08-29 : GitHub ouvre `https://github.com/cedricgicquiaud` (onglet « cedricgicquiaud (Cedric Gicquiaud) »), LinkedIn ouvre `https://www.linkedin.com/in/cedric-gicquiaud/` (onglet « Cédric Gicquiaud | LinkedIn »), Mail porte `mailto:cedric.gicquiaud@gmail.com` (survol : lien coloré ; non cliqué pour ne pas lancer le client mail de la machine).
- [x] Refus : ajouter `"phone": "+33 6 12 34 56 78"` dans `content/site.json`, lancer `npm test` : le test « refuse toute suite de chiffres ressemblant à un numéro de téléphone » échoue. Annuler la modification.
  constaté le 2026-08-29 : « refuse toute suite de chiffres ressemblant à un numéro de téléphone » échoue (`1 failed | 25 passed`) ; modification annulée.

### PFO-5 — Menu fixe à ancres, section active

- [x] Cliquer « Expérience » dans le menu : la page défile jusqu'à la section et l'URL se termine par `#experience`. Idem pour À propos (`#a-propos`), Projets (`#projets`), Contact (`#contact`, pied de page).
  constaté au rejeu du 2026-08-29 (après 844fca0 + socle rafraîchi) : les quatre entrées (clavier, Entrée) donnent `#a-propos`, `#experience`, `#projets`, `#contact` et la page défile au maximum (229 px), chaque section cible à l'écran (bord haut à 422 / 446 / 470 / 494 px dans une fenêtre de 690 px). Les sections ne montent pas jusqu'en haut : la page est trop courte (sections de 24 px), pas un défaut du menu (captures `recette-L2/rejeu-PFO-5-ancre-a-propos.jpg`, `rejeu-PFO-5-ancre-contact.jpg`). Le premier refus (id `about` au lieu de `a-propos`, section Projets absente) ne se reproduit plus.
- [ ] Faire défiler la page à la molette : l'entrée du menu correspondant à la section visible est soulignée et change au fil du défilement.
  REFUSÉ au rejeu du 2026-08-29 : plus aucune entrée n'est soulignée à tort au chargement (corrigé), mais aucune entrée n'est soulignée non plus à aucun cran de molette (scrollY 0, 100, 200, 229 = maximum, retour à 0) alors que À propos, Expérience, Projets et le pied de page sont à l'écran (capture `recette-L2/rejeu-PFO-5-molette-max.jpg`). Indice hors protocole : dans un cadre de 400 px de haut poussé par script, « À propos » est marqué actif à 150 px et « Projets » au maximum ; le marquage fonctionne quand une section atteint le haut, ce que le contenu actuel (sections de 24 px, défilement de 229 px) ne permet pas dans une fenêtre normale. À rejouer quand les sections auront du contenu.
- [x] À 375 px de large : le menu est en haut de page (bandeau horizontal), pas de barre de défilement horizontale (`document.documentElement.scrollWidth <= window.innerWidth` dans la console renvoie `true`).
  constaté le 2026-08-29 (cadre de 375 px) : menu en bandeau horizontal en haut (`position: sticky`, 375 × 53 px, top 0), `scrollWidth 375 <= innerWidth 375` → `true` (capture `recette-L2/PFO-4-accueil-375.jpg`). Le chevauchement Thème / Contact est noté sur la case PFO-4.
- [x] Tab depuis le début de la page : le focus parcourt À propos, Expérience, Projets, Contact puis le bouton « Thème », avec un contour visible à chaque arrêt.
  constaté le 2026-08-29 : ordre À propos → Expérience → Projets → Contact → bouton Thème ; à chaque arrêt `outline: solid` et `:focus-visible` vrai, anneau bleu visible à l'écran (capture `recette-L2/PFO-5-focus-clavier-a-propos.jpg`).
- [x] Refus : dans `components/nav.tsx`, remplacer `lg:fixed` par `fixed`, lancer `npm test` : le test « passe en haut et en pleine largeur à 375 px » échoue. Annuler la modification. (Le défilement horizontal réel se constate seulement au navigateur, case ci-dessus.)
  constaté le 2026-08-29 : « passe en haut et en pleine largeur à 375 px, reste fixe à gauche à 1280 px » échoue (`1 failed | 25 passed`) ; modification annulée.

### PFO-6 — Bouton de thème persistant

- [x] Cliquer « Thème » : la page passe en sombre (ou en clair). Recharger : le choix est conservé ; `localStorage.getItem("theme")` dans la console renvoie `"dark"` ou `"light"`, et aucun flash de l'autre thème au chargement.
  constaté le 2026-08-29 : clic → fond `rgb(11,18,32)`, `data-theme="dark"`, `localStorage.getItem("theme")` = `"dark"` ; après rechargement, sombre conservé (capture `recette-L2/PFO-6-theme-sombre.jpg`). Flash : aucun observé ; la source HTML contient un script inline dans `<head>` qui pose `data-theme` depuis `localStorage` avant le corps.
- [ ] `localStorage.removeItem("theme")` dans la console puis recharger : la page suit le réglage système (basculer le système clair/sombre change le fond sans rechargement) ; `document.documentElement.dataset.theme` est `undefined`.
  partiel le 2026-08-29 : après `removeItem` et rechargement, `dataset.theme` est `undefined` et le fond suit le système (clair, `rgb(255,255,255)`, `prefers-color-scheme: dark` faux). NON TESTABLE pour la bascule système : le testeur ne peut pas changer l'apparence de l'OS ; à rejouer par un humain (Réglages → Apparence → Sombre).
- [ ] Refus : dans la console, exécuter `Object.defineProperty(window, "localStorage", { get() { throw new Error("blocked"); } })` puis cliquer « Thème » : la page bascule sans erreur bloquante. Sous `npm test`, le test « rend quand même en thème système si localStorage lève une exception » couvre ce cas ; retirer le `try/catch` de `storedTheme` dans `components/theme-toggle.tsx` le fait échouer. Annuler la modification.
  partiel le 2026-08-29 : navigateur joué, `localStorage` lève « blocked », clic « Thème » → la page passe en sombre, aucune erreur (console, `window.onerror`, promesses). NON TESTABLE pour la mutation du test : retirer le `try/catch` de `storedTheme` demande de lire le composant, ce que le testeur ne fait pas ; à jouer par `verifier`.

### PFO-7 — Pied de page et métadonnées

- [x] En bas de page : « Site généré depuis mes fiches de preuve. » suivi du lien `github.com/cedricgicquiaud/cedricgicquiaud.github.io`, qui ouvre le dépôt.
  constaté le 2026-08-29 : pied de page « Site généré depuis mes fiches de preuve. github.com/cedricgicquiaud/cedricgicquiaud.github.io » puis « Contact : Mail » ; le lien ouvre `https://github.com/cedricgicquiaud/cedricgicquiaud.github.io` (onglet « cedricgicquiaud/cedricgicquiaud.github.io: Portfolio — … »).
- [x] Onglet du navigateur : « Cédric Gicquiaud ». Afficher la source : `<meta name="description" content="Je branche des agents IA…">`.
  constaté le 2026-08-29 : titre d'onglet « Cédric Gicquiaud » ; source (`curl`) : `<title>Cédric Gicquiaud</title>` et `<meta name="description" content="Je branche des agents IA sur les systèmes réels d&#x27;une entreprise et je les livre en production."/>`.
- [x] Refus : vider `"title"` dans `content/site.json` (`"title": ""`), lancer `npm test` : le test « refuse une description vide » échoue. Annuler la modification.
  constaté le 2026-08-29 : « refuse une description vide » échoue (et « rend le nom et le titre de site.json » aussi, `2 failed | 24 passed`) ; modification annulée.

## Livraison 3 — À propos et Expérience

### PFO-8 — Chargement du contenu Markdown avec frontmatter validé

- [x] `npm run dev` (port 3003 : `npx next dev -p 3003`), ouvrir la page : sous l'Intro, la section « À propos » affiche le texte de `content/about.md` et la section « Expérience » les blocs de `content/experience.md`. — constaté le 2026-08-29 : page à http://localhost:3003/, sections « À propos » (4 paragraphes) et « Expérience » (4 blocs) affichées sous l'Intro, console sans erreur (capture a-propos-clair.jpg, experience-clair.jpg).
- [x] Refus : renommer `content/about.md` en `about.md.bak`, lancer `npm run build` : le build échoue avec `Error: content/about.md manquant (attendu : …/content/about.md)`. Restaurer le fichier. — constaté le 2026-08-29 : build en échec avec `Error: content/about.md manquant (attendu : /Users/cedricgicquiaud/Desktop/WATIDO/site-3/content/about.md)` ; fichier restauré.
- [x] Refus : dans `content/about.md`, remplacer la ligne `titre: À propos` par `auteur: x`, lancer `npm run build` : le build échoue avec `content/about.md : frontmatter incomplet, champ « titre » requis`. Annuler la modification. — constaté le 2026-08-29 : build en échec avec `Error: content/about.md : frontmatter incomplet, champ « titre » requis` ; modification annulée.

### PFO-9 — Textes À propos et Expérience

- [x] Lire « À propos » dans le navigateur : au moins trois paragraphes, dans l'ordre ESN, immobilier, agents IA ; aucun nom d'employeur ni de client, aucun superlatif. Corriger le texte à la PR si besoin. — constaté le 2026-08-29 : 4 paragraphes dans l'ordre ESN → immobilier → agents IA (+ un 4e de conclusion) ; aucun nom d'employeur ni de client, aucun superlatif relevé (voir « hors cahier » pour une incohérence de dates).
- [x] Lire « Expérience » : quatre blocs (2026, 2023–2025, 2013–2023, 2000–2013), chacun avec période, rôle, secteur, description et au moins un tag. Les dates sont des hypothèses : confirmer ou corriger dans `content/experience.md`. — constaté le 2026-08-29 : 4 blocs 2026, 2023–2025, 2013–2023, 2000–2013, chacun avec période, rôle, secteur, description et 3 à 5 tags ; dates non confirmées par le testeur (hypothèses à valider par l'auteur).
- [x] Refus : dans `content/about.md`, remplacer « Treize ans en ESN » par « Treize ans chez Nexus », lancer `npm run build` : `next build` réussit puis `check-output` échoue avec `index.html : mot interdit « Nexus »`. Annuler la modification. — constaté le 2026-08-29 : `next build` réussit puis `check-output : 1 problème(s)` / `index.html : mot interdit « Nexus »` ; modification annulée.

### PFO-10 — Sections À propos et Expérience rendues

- [x] Dans le navigateur, section « Expérience » : les blocs se lisent de haut en bas du plus récent (2026) au plus ancien (2000–2013). — constaté le 2026-08-29 : ordre à l'écran 2026 → 2023–2025 → 2013–2023 → 2000–2013 (capture experience-clair.jpg, experience-sombre.jpg).
- [x] Chaque bloc montre, à gauche, la période ; à droite, le rôle en titre, le secteur en dessous, la description, puis les tags en pastilles (badges). À 375 px de large, la période passe au-dessus du rôle. — constaté le 2026-08-29 : période à gauche, rôle en titre, secteur, description, tags en pastilles ; dans un cadre de 375 px (viewport 371 px) la période s'affiche au-dessus du rôle, même bord gauche (capture experience-375px.jpg). Mode sombre simulé en forçant la règle `prefers-color-scheme: dark` (pas de bascule de thème dans ce worktree).
- [x] Refus : dans `content/experience.md`, supprimer la ligne `periode: "2026"` du premier bloc, lancer `npm run build` : le build réussit, la sortie contient `content/experience.md : bloc sans « période » ignoré (rôle : Constructeur d'agents IA)`, et la page ne montre plus que trois blocs. Annuler la modification. — constaté le 2026-08-29 : build réussi, sortie `content/experience.md : bloc sans « période » ignoré (rôle : Constructeur d'agents IA)`, page dev rechargée : 3 blocs (2023–2025, 2013–2023, 2000–2013) ; modification annulée.

### PFO-11 — Contrôle du HTML généré

- [x] `npm run build` : la dernière ligne affiche `check-output : …/out propre`. — constaté le 2026-08-29 : dernière ligne `check-output : /Users/cedricgicquiaud/Desktop/WATIDO/site-3/out propre`.
- [x] Refus : ajouter « Nexus » dans `content/about.md`, lancer `npm run build` : échec avec `mot interdit « Nexus »`. Annuler. — constaté le 2026-08-29 : échec `index.html : mot interdit « Nexus »` ; annulé.
- [x] Refus : ajouter un emoji (par exemple une fusée) dans `content/about.md`, lancer `npm run build` : échec avec `emoji « … »`. Annuler. — constaté le 2026-08-29 : échec `index.html : emoji « 🚀 »` ; annulé.
- [x] Refus : dans `content/about.md`, ajouter `<script src="https://cdn.example.com/x.js"></script>`, lancer `npm run build` : échec avec `domaine tiers « cdn.example.com »`. Annuler. — constaté le 2026-08-29 : échec `index.html : domaine tiers « cdn.example.com »` (signalé 2 fois) ; annulé.
- [x] Refus : ajouter « 06 12 34 56 78 » dans `content/about.md`, lancer `npm run build` : échec avec `numéro de téléphone « 06 12 34 56 78 »`. Annuler. — constaté le 2026-08-29 : échec `index.html : numéro de téléphone « 06 12 34 56 78 »` ; annulé.

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

## Livraison 5 — Fiches synchronisées

### PFO-20 — Champ « ordre » dans les 7 fiches WATIDO

- [x] Dans `../fiches/`, `grep -H '^ordre:' *.md` : sept lignes, une par fiche, valeurs 1 à 7 toutes différentes (SLICE 1, PILOT 2, Foreman 3, Parcours 4, Dashboard 5, GiveMe5 6, BEN 7).
- [x] Refus : dans `../fiches/pilot.md`, remplacer `ordre: 2` par `ordre: 1`, lancer `npm run sync` : échec, code de sortie 1, message `slice.md : ordre 1 déjà pris par pilot.md` (ou l'inverse selon l'ordre de lecture). Remettre `ordre: 2`.

### PFO-21 — Script sync : copie et contrôle des fiches

- [x] `npm run sync` : affiche `7 fiches synchronisées` ; `ls content/fiches` liste `ben.md dashboard.md foreman.md giveme5.md parcours.md pilot.md slice.md`.
- [x] Refus : dans `../fiches/slice.md`, retirer la ligne `statut: …`, lancer `npm run sync` : échec avec `slice.md : frontmatter incomplet, champ « statut » requis`. Remettre la ligne. Même chose attendue pour `nom` et `visibilite`.
- [x] Refus : dans `../fiches/slice.md`, remplacer `**En bref.**` par `En bref.`, lancer `npm run sync` : échec avec `slice.md : bloc « **En bref.** » absent après le titre`. Annuler.
- [x] Refus : `../fiches/` contient `PLAN.md`, `REPOS.md` et `AUDIT.md` ; après `npm run sync`, aucun des trois n'est dans `content/fiches/` ; `npm test` : le test « ne copie jamais PLAN.md, REPOS.md ni AUDIT.md » passe.

### PFO-22 — Chargement des fiches : frontmatter, En bref, sections

- [x] `node --input-type=module -e 'const { loadFiches } = await import("./lib/fiches.ts"); for (const f of loadFiches("content/fiches")) console.log(f.frontmatter.ordre, f.slug, f.titre, f.enBref.chiffre, f.sections.map((s) => s.id).join(","))'` : sept lignes numérotées 1 à 7 dans l'ordre slice, pilot, foreman, parcours, dashboard, giveme5, ben ; chaque ligne a un titre, une phrase « chiffre » et `probleme,construit,preuves,appris,artefacts`.
- [x] Refus : même commande en affichant `f.frontmatter.depot, f.frontmatter.demo` : la ligne `ben` (visibilite anonyme) montre deux chaînes vides, même si le fichier source en contient.
- [x] Refus : `node --input-type=module -e 'const { loadFiches } = await import("./lib/fiches.ts"); const j = JSON.stringify(loadFiches("content/fiches")); console.log(j.includes("WATIDO"), /\/Users\//.test(j))'` : affiche `false false`.

## Livraison 6 — Cartes projets

_Dépend de la livraison 1 (`lib/fiches.ts`, `npm run sync`) : à jouer après son merge._

### PFO-23 — Carte projet

- [x] `npm run sync && npm run dev`, ouvrir `http://localhost:3000/#projets` : chaque carte montre un titre, une ligne de résumé, un chiffre clé en évidence, un badge de statut et au plus 5 pastilles de stack (BEN a 11 entrées de stack dans sa fiche : 5 pastilles seulement).
- [x] Carte SLICE : lien « Code » vers `https://github.com/cedricgicquiaud/SLICE`, pas de lien « Démo » (la fiche dit « à venir »).
- [x] Refus : dans `content/fiches/slice.md`, vider `depot:` puis recharger : aucun lien « Code » sur la carte SLICE. Restaurer (`npm run sync`).
- [x] Refus : cartes Foreman, Parcours et Dashboard (vitrine sans dépôt) : mention « code privé, démo à venir », aucun lien « Code » ni « Démo ».
- [x] Carte PILOT (`depot: à venir (…)`, pas une URL) : aucun lien « Code », aucune mention « code privé » (fiche publique). Voir « Décisions à prendre » de la PR.

### PFO-24 — Section Projets : 7 cartes ordonnées

- [x] La section « Projets » liste 7 cartes, de haut en bas : SLICE, PILOT, Foreman, Parcours, Dashboard, GiveMe5, BEN.
- [x] Le titre de chaque carte est un lien vers `/projets/<slug>/` (survoler : `/projets/slice/`, `/projets/ben/`, …). Les pages cibles arrivent avec la livraison 3 : une 404 est attendue pour l'instant.
- [x] Refus : dans `content/fiches/slice.md`, supprimer la ligne `ordre: 1` puis recharger : SLICE passe en dernière position, jamais en première. Restaurer (`npm run sync`).
- [x] Le menu « Projets » mène à la section et l'entrée devient active quand la section est à l'écran (la section a maintenant de la hauteur).

## Livraison 7 — Page par fiche

### PFO-25 — Menu et pied de page dans le layout

- [x] `npm run dev`, ouvrir `/` puis `/projets/slice/` : les deux pages montrent le même menu (À propos, Expérience, Projets, Contact), le même bouton « Thème » et le même pied de page (mention des fiches, lien du dépôt, Mail).
- [x] Depuis `/projets/slice/`, cliquer « À propos » : le navigateur revient à l'accueil, section « À propos » à l'écran (URL `/#a-propos`).
- [x] Refus : sur `/projets/slice/`, faire défiler jusqu'au pied de page : aucune entrée du menu n'est soulignée (aucun `aria-current` dans le menu, vérifiable via `document.querySelector('nav [aria-current]')` qui renvoie `null` dans la console).

### PFO-26 — Route statique /projets/[slug]/

- [x] `npm run build` : `out/projets/<slug>/index.html` existe pour `ben`, `dashboard`, `foreman`, `giveme5`, `parcours`, `pilot`, `slice` (`ls out/projets`), et la dernière ligne affiche `check-output : …/out propre`.
- [x] `out/projets/slice/index.html` contient `<title>SLICE — Cédric Gicquiaud</title>` et une `<meta name="description"` égale à la première phrase du bloc « En bref » de la fiche.
- [x] Refus : ouvrir `http://localhost:3000/projets/inconnu/` en dev : page 404 ; après build, `out/projets/inconnu/` n'existe pas et `ls out/projets` ne liste que les 7 slugs.

### PFO-27 — Rendu de la fiche : en-tête, En bref, cinq sections

- [x] Ouvrir `/projets/slice/` : lien « ← Projets » en haut (retour sur `/#projets`), titre de la fiche en h1, en-tête Statut / Période / Rôle / Stack (pastilles) / Visibilité, liens « Code » (dépôt) sans « Démo » (pas d'URL), bloc « En bref », puis les cinq titres dans l'ordre Problème, Ce que j'ai construit, Preuves, Ce que j'en ai appris, Artefacts.
- [x] Dans « Ce que j'ai construit » : les puces de liste sont visibles, les passages en gras ressortent, le lien du dépôt dans « Artefacts » est souligné et cliquable. Vérifier à 375 px (aucun défilement horizontal) et en sombre (`document.documentElement.dataset.theme = "dark"`) : texte lisible, badges lisibles.
- [x] Refus : ouvrir `/projets/ben/` (fiche `anonyme`) : ni lien « Code » ni lien « Démo » dans l'en-tête.
- [x] Refus : dans `content/fiches/slice.md`, ajouter le mot « Nexus » dans la section « Preuves », lancer `npm run build` : `next build` réussit puis `check-output` échoue avec `projets/slice/index.html : mot interdit « Nexus »`. Annuler la modification.

## Livraison 8 — Deux colonnes et menu latéral

### PFO-28 — Colonne gauche fixe et contenu qui défile

- [ ] `npm run sync && npm run dev`, ouvrir `http://localhost:3000/` à 1280 px : le nom, le titre court, la phrase et le menu à traits sont à gauche ; faire défiler jusqu'à « Projets » : le nom reste visible pendant tout le défilement, seule la colonne droite bouge.
- [ ] Toujours à 1280 px : la colonne droite enchaîne portrait, À propos, Expérience, Projets, puis le pied de page ; rien de la colonne gauche n'est coupé en bas d'écran (hauteur 720 px).
- [ ] À 375 px : le nom, le titre court, la phrase et les liens GitHub / LinkedIn / Mail forment un bloc en haut, puis le portrait et les sections s'empilent dessous ; aucun défilement horizontal (`document.documentElement.scrollWidth === window.innerWidth` dans la console).
- [ ] Refus : à 375 px, aucun menu « À propos / Expérience / Projets » n'est affiché (`document.querySelector('nav[aria-label="Sections"]').offsetParent` renvoie `null`).

### PFO-29 — Menu latéral à traits et section active

- [ ] À 1280 px, sur `/` : le menu compte trois entrées en capitales, À propos, Expérience, Projets, chacune précédée d'un trait court ; pas d'entrée Contact.
- [ ] Faire défiler jusqu'à « Expérience » : son trait s'allonge et son libellé passe en couleur pleine ; continuer jusqu'à « Projets » : l'entrée active change (`document.querySelector('nav [aria-current]').textContent` suit la section à l'écran).
- [ ] Survoler « À propos » sans défiler : le trait s'allonge et le texte fonce le temps du survol.
- [ ] Refus : en haut de `/`, aucun bandeau de menu horizontal, aucune bordure sous un en-tête ; le premier élément visible est le nom.
- [ ] Ouvrir `/projets/slice/` : aucun menu de sections, le lien « ← Projets » est présent en haut et ramène sur `/#projets`.

### PFO-30 — Bouton de thème et liens sociaux en bas de colonne

- [ ] À 1280 px, sur `/` : le bouton « Thème » est en bas de la colonne gauche, sur la même ligne que GitHub, LinkedIn et Mail ; aucun bouton « Thème » en haut à droite.
- [ ] À 375 px : le bouton « Thème » est en haut à droite (fixe), les liens GitHub / LinkedIn / Mail sont sous la phrase de présentation, sans second bouton « Thème » à côté d'eux.
- [ ] Cliquer « Thème » à 1280 px, recharger, puis réduire à 375 px : le thème choisi est conservé dans les deux largeurs (`localStorage.theme` vaut `dark` ou `light`, `document.documentElement.dataset.theme` pareil).
- [ ] Refus : sur `/projets/slice/` à 1280 px, aucun bouton « Thème » n'est visible (voir « Décisions à prendre » de la PR) ; à 375 px, il est en haut à droite.

## Livraison 9 — Halo qui suit la souris

### PFO-31 — Halo de lumière qui suit la souris

- [ ] `npm run dev`, ouvrir `http://localhost:3000/` avec une souris : un cercle de lumière bleue très diffuse (environ 600 px) suit le pointeur sur toute la page, y compris par-dessus les sections et sur `/projets/slice/`. Passer en sombre (bouton « Thème ») : le halo reste visible, plus clair sur le fond sombre. Le texte reste lisible sous le halo, en clair comme en sombre.
- [ ] Refus : dans les outils de développement de Chrome, activer l'émulation tactile (barre d'outils appareil, iPhone) puis recharger : aucun halo, et `document.querySelector('body > div[aria-hidden]')` renvoie `null` dans la console.
- [ ] Refus : avec la souris, cliquer sur le bouton « Thème », sur une entrée du menu et sur le lien « Code » d'une carte projet : chaque clic agit normalement (le halo ne capte rien ; son calque a `pointer-events: none`).
- [ ] Refus : dans Chrome, Rendering → « Emulate CSS media feature prefers-reduced-motion: reduce », recharger : le halo est au centre de la fenêtre et ne bouge pas quand la souris bouge.
- [ ] Refus : `npm run build` puis `grep -c radial-gradient out/index.html` affiche `0` (rien côté serveur, le halo n'apparaît qu'une fois la page montée).

## Livraison 10 — Surbrillance des expériences et projets

### PFO-32 — Surbrillance au survol et au focus

- [ ] `npm run dev`, ouvrir `http://localhost:3000/#projets` à 1280 px de large : survoler une carte : fond léger, bordure visible, titre en couleur d'accent ; les autres cartes s'estompent (opacité réduite). Même comportement sur `#experience` en survolant une expérience.
- [ ] Au repos (aucun survol), les cartes n'ont plus de bordure visible ; elle apparaît au survol seulement.
- [ ] Clavier : Tab jusqu'au titre ou au lien « Code » d'une carte : la carte prend le même fond, la même bordure et le même titre accentué. Refus : les cartes voisines ne s'estompent pas au focus (lecture au clavier non gênée).
- [ ] Refus : à 375 px (outils de développement, mode mobile, écran tactile) : survoler ou toucher une carte n'estompe aucune voisine ; aucun défilement horizontal ; le lien « Code » de la carte SLICE reste un lien à part entière et cliquable (la carte entière n'est pas un lien ; aucune fiche n'a de démo aujourd'hui).
- [ ] Sombre (`document.documentElement.dataset.theme = "dark"`) : fond et bordure de survol lisibles, titre accentué visible.

## Livraison 11 — Police Inter

### PFO-33 — Police Inter sur tout le site

- [ ] `npm run dev`, ouvrir `http://localhost:3000/` : dans la console, `getComputedStyle(document.body).fontFamily` commence par `Inter` ; idem pour `getComputedStyle(document.querySelector('h1')).fontFamily` et pour un `h2`. Visuellement, le nom en haut à gauche et les titres de section sont en Inter, graisse forte, lettres légèrement resserrées ; le texte courant est en graisse normale.
- [ ] Refus : onglet Réseau (Network) de Chrome, filtre « Font », recharger : toutes les polices sont servies depuis `localhost:3000/_next/static/media/*.woff2` ; aucune requête vers `fonts.googleapis.com` ni `fonts.gstatic.com`. Même vérification sur `/projets/slice/`.
- [ ] Refus : `npm run build` puis `grep -c "fonts.googleapis.com\|fonts.gstatic.com" out/index.html` affiche `0`.

## Livraison 12 — Logos des réseaux

### PFO-34 — Logos SVG pour GitHub, LinkedIn et Mail

- [ ] `npm run dev`, ouvrir `http://localhost:3000/` à 1280 px de large : en bas de la colonne de gauche, à côté du bouton Thème, trois logos (GitHub, LinkedIn, enveloppe) et aucun mot « GitHub », « LinkedIn » ou « Mail » visible. Cliquer GitHub ouvre `https://github.com/cedricgicquiaud` dans un nouvel onglet ; LinkedIn ouvre `https://www.linkedin.com/in/cedric-gicquiaud/` dans un nouvel onglet ; survoler l'enveloppe montre une URL `mailto:cedric.gicquiaud@gmail.com` (ne pas cliquer si le client mail ne doit pas s'ouvrir).
- [ ] Survoler un logo : il passe de gris atténué à la couleur du texte, et l'infobulle (attribut `title`) affiche « GitHub », « LinkedIn » ou « Mail ». Refus : un logo qui ne change pas de couleur au survol.
- [ ] Clavier : Tab depuis le haut de page jusqu'aux logos : chaque logo montre un contour de focus visible. Refus : un logo atteint par Tab sans contour visible.
- [ ] Lecteur d'écran (VoiceOver, Cmd+F5) : les trois liens sont annoncés « GitHub, lien », « LinkedIn, lien », « Mail, lien ». Refus : un lien annoncé « lien » sans nom, ou une image annoncée en plus du lien.
- [ ] À 375 px (mode mobile) : les trois logos sont visibles sous la phrase d'intro, sans bouton Thème à côté (il reste fixe en haut à droite) ; aucun défilement horizontal.
- [ ] Sombre (`document.documentElement.dataset.theme = "dark"`) : logos lisibles au repos et au survol.
