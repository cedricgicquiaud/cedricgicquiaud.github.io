// Contrôle des fichiers déclarés dans les fiches (`visuel`, `captures[].fichier`, `video.fichier`)
// avant `next build` : existence dans public/.
// Usage : node scripts/check-assets.mjs [dossier des fiches] [dossier public]
// (défauts : content/fiches et public ; lancé par `npm run build` avant `project-visuals`).
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";

/**
 * Parcourt les fiches de `fichesDir` et renvoie la liste des problèmes (vide si tout est conforme).
 * @param {string} fichesDir dossier des fiches Markdown
 * @param {string} publicDir dossier public/ où vivent les fichiers déclarés
 * @returns {string[]}
 */
export function checkAssets(fichesDir, publicDir) {
  const problems = [];
  for (const name of readdirSync(fichesDir).filter((n) => n.endsWith(".md"))) {
    const { data } = matter(readFileSync(path.join(fichesDir, name), "utf8"));
    if (typeof data.visuel !== "string") continue;
    const file = path.resolve(publicDir, "." + data.visuel);
    if (!existsSync(file)) problems.push(`${name} : visuel « ${data.visuel} » : absent de public/`);
  }
  return problems;
}
