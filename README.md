# cedricgicquiaud.github.io

Site portfolio statique (Next.js, export HTML). Publié sur GitHub Pages à chaque push sur `main`.

## Lancer

```sh
npm ci
npm run dev        # http://localhost:3000/
```

## Tester

```sh
npm test           # Vitest ; le premier test lance lui-même `next build`
npm run lint       # ESLint
```

## Construire

```sh
npm run build      # produit le dossier out/
```

Toutes les couleurs vivent dans `app/globals.css` (thème clair, système sombre, sombre forcé
via `data-theme`). Un test refuse toute couleur en dur ailleurs et vérifie le contraste des tokens.
