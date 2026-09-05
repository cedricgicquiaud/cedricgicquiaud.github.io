// Contrôle des fichiers déclarés dans les fiches (`visuel`, `captures[].fichier`, `video.fichier`)
// avant `next build` : existence dans public/ et poids (capture ≤ 300 Ko, vidéo ≤ 15 Mo).
// Usage : node scripts/check-assets.mjs [dossier des fiches] [dossier public]
// (défauts : content/fiches et public ; lancé par `npm run build` avant `project-visuals`).
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const root = path.resolve(import.meta.dirname, "..");

const KO = 1024;
const MO = 1024 * KO;
const MAX_CAPTURE_BYTES = 300 * KO;
const MAX_VIDEO_BYTES = 15 * MO;

/** Plafond lisible : « 300 Ko (307200 octets) », « 15 Mo (15728640 octets) ». */
const cap = (bytes) => `${bytes >= MO ? `${bytes / MO} Mo` : `${bytes / KO} Ko`} (${bytes} octets)`;

/** Ce qu'on attend d'un fichier déclaré, selon le champ qui le déclare. */
const CAPTURE = { maxBytes: MAX_CAPTURE_BYTES };
const VIDEO = { maxBytes: MAX_VIDEO_BYTES };

/** Les fichiers déclarés par une fiche : `{ where, declared, kind }` (où dans le frontmatter, chemin déclaré, attendu). */
function declaredFiles(data) {
  const files = [];
  if (typeof data.visuel === "string") files.push({ where: "visuel", declared: data.visuel, kind: CAPTURE });
  const captures = Array.isArray(data.captures) ? data.captures : [];
  captures.forEach((capture, i) => {
    if (typeof capture?.fichier === "string") {
      files.push({ where: `captures, entrée ${i + 1}`, declared: capture.fichier, kind: CAPTURE });
    }
  });
  if (typeof data.video?.fichier === "string") files.push({ where: "video", declared: data.video.fichier, kind: VIDEO });
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
    for (const { where, declared, kind } of declaredFiles(data)) {
      const file = path.resolve(publicDir, "." + declared);
      const label = `${name} : ${where} « ${declared} »`;
      if (!existsSync(file)) {
        problems.push(`${label} : absent de public/`);
        continue;
      }
      const { size } = statSync(file);
      if (size > kind.maxBytes) problems.push(`${label} : ${size} octets, plafond ${cap(kind.maxBytes)}`);
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
