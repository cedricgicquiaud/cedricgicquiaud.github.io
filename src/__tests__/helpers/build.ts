// Partagé par les tests qui lisent `out/` : reconstruit seulement si `out/index.html` manque, est
// plus vieux qu'une des sources données, ou si le fichier `marker` attendu manque. Les fichiers de
// tests tournent en série (vitest.config.ts), donc un build fait par un fichier précédent est
// réutilisé tel quel.
import { execFileSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import path from "node:path";

const defaultRoot = path.resolve(__dirname, "../../..");

type Options = {
  /** Fichier (relatif à la racine) qui doit exister dans `out/` ; sinon on reconstruit. */
  marker?: string;
  /** Racine du projet (tests du helper uniquement). */
  root?: string;
  /** Lancement du build (tests du helper uniquement) ; par défaut `npm run build` dans `root`. */
  run?: (root: string) => void;
};

const npmRunBuild = (root: string) => execFileSync("npm", ["run", "build"], { cwd: root, stdio: "pipe", timeout: 240_000 });

/** Lance `npm run build` si `out/index.html` est absent ou plus ancien qu'un des `deps` (chemins relatifs à la racine), ou si `marker` manque. */
export function ensureBuild(deps: string[], { marker, root = defaultRoot, run = npmRunBuild }: Options = {}): void {
  const indexHtml = path.join(root, "out", "index.html");
  const files = deps.map((f) => path.join(root, f));
  const markerPath = marker ? path.join(root, marker) : undefined;
  const stale = () => {
    if (!existsSync(indexHtml)) return true;
    if (markerPath && !existsSync(markerPath)) return true;
    const built = statSync(indexHtml).mtimeMs;
    return files.some((f) => existsSync(f) && statSync(f).mtimeMs > built);
  };
  if (stale()) run(root);
  if (!existsSync(indexHtml)) throw new Error("out/index.html absent après npm run build");
  if (markerPath && !existsSync(markerPath)) throw new Error(`${marker} absent après npm run build`);
}
