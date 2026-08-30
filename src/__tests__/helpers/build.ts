// Partagé par les tests qui lisent `out/` : reconstruit seulement si `out/index.html` manque ou
// est plus vieux qu'une des sources données. Les fichiers de tests tournent en série
// (vitest.config.ts), donc un build fait par un fichier précédent est réutilisé tel quel.
import { execFileSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import path from "node:path";

const root = path.resolve(__dirname, "../../..");
const indexHtml = path.join(root, "out", "index.html");

/** Lance `npm run build` si `out/index.html` est absent ou plus ancien qu'un des `deps` (chemins relatifs à la racine). */
export function ensureBuild(deps: string[]): void {
  const files = deps.map((f) => path.join(root, f));
  const stale = () => {
    if (!existsSync(indexHtml)) return true;
    const built = statSync(indexHtml).mtimeMs;
    return files.some((f) => existsSync(f) && statSync(f).mtimeMs > built);
  };
  if (stale()) execFileSync("npm", ["run", "build"], { cwd: root, stdio: "pipe", timeout: 240_000 });
  if (!existsSync(indexHtml)) throw new Error("out/index.html absent après npm run build");
}
