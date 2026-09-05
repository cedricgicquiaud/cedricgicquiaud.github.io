// Contrôle des fichiers déclarés dans les fiches (`visuel`, `captures[].fichier`, `video.fichier`)
// avant `next build` : existence dans public/.
// Usage : node scripts/check-assets.mjs [dossier des fiches] [dossier public]
// (défauts : content/fiches et public ; lancé par `npm run build` avant `project-visuals`).
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const root = path.resolve(import.meta.dirname, "..");

/** Les fichiers déclarés par une fiche : `{ where, declared }` (où dans le frontmatter, chemin déclaré). */
function declaredFiles(data) {
  const files = [];
  if (typeof data.visuel === "string") files.push({ where: "visuel", declared: data.visuel });
  const captures = Array.isArray(data.captures) ? data.captures : [];
  captures.forEach((capture, i) => {
    if (typeof capture?.fichier === "string") files.push({ where: `captures, entrée ${i + 1}`, declared: capture.fichier });
  });
  if (typeof data.video?.fichier === "string") files.push({ where: "video", declared: data.video.fichier });
  return files;
}

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
    for (const { where, declared } of declaredFiles(data)) {
      const file = path.resolve(publicDir, "." + declared);
      if (!existsSync(file)) problems.push(`${name} : ${where} « ${declared} » : absent de public/`);
    }
  }
  return problems;
}

// Entrée en ligne de commande : `node scripts/check-assets.mjs [dossier des fiches] [dossier public]`.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const fichesDir = path.resolve(process.argv[2] ?? path.join(root, "content", "fiches"));
  const publicDir = path.resolve(process.argv[3] ?? path.join(root, "public"));
  const problems = checkAssets(fichesDir, publicDir);
  if (problems.length > 0) {
    console.error(`check-assets : ${problems.length} problème(s) dans ${fichesDir}`);
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
  }
  console.log(`check-assets : fichiers déclarés dans ${fichesDir} conformes`);
}
