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
npm run og         # régénère public/opengraph-image.png depuis content/site.json (à commiter)
```

Thème sombre unique (un seul bloc de tokens dans `app/globals.css`).

