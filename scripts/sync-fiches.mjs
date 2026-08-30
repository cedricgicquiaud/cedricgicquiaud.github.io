// Copie les fiches de preuve (../fiches/*.md) dans content/fiches/ et les contrôle avant.

import { copyFileSync, mkdirSync, readdirSync, readFileSync, unlinkSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

// Fichiers du dossier parent qui ne quittent jamais la machine.
const EXCLUDED = ["PLAN.md", "REPOS.md", "AUDIT.md"];
const REQUIRED = ["nom", "statut", "visibilite"];
const VISIBILITES = ["public", "vitrine", "anonyme"];

const isText = (v) => typeof v === "string" && v.trim() !== "";

// Le titre (`# …`) suivi, après des lignes vides, du bloc « **En bref.** ».
const EN_BREF_AFTER_TITLE = /^# [^\n]+\n\s*\*\*En bref\.\*\*/m;

/**
 * Renvoie la raison du refus d'une fiche, ou `null` si elle est conforme.
 * `seen` : ordres déjà rencontrés (ordre → fichier), pour détecter les doublons.
 */
function problemOf(name, text, seen) {
  const { data, content } = matter(text);
  for (const champ of REQUIRED) {
    if (!isText(data[champ])) return `frontmatter incomplet, champ « ${champ} » requis`;
  }
  if (!VISIBILITES.includes(data.visibilite)) {
    return `visibilite « ${data.visibilite} » inconnue (attendu : ${VISIBILITES.join(" | ")})`;
  }
  if (!EN_BREF_AFTER_TITLE.test(content)) return "bloc « **En bref.** » absent après le titre";
  if (data.ordre !== undefined) {
    if (!Number.isInteger(data.ordre)) return `ordre « ${data.ordre} » n'est pas un entier`;
    if (seen.has(data.ordre)) return `ordre ${data.ordre} déjà pris par ${seen.get(data.ordre)}`;
    seen.set(data.ordre, name);
  }
  return null;
}

/**
 * Contrôle puis copie les `.md` de `srcDir` dans `destDir` (et purge les copies orphelines) ; renvoie leur nombre.
 * Lève une erreur « <fichier> : <raison> » à la première fiche non conforme.
 * @param {string} srcDir
 * @param {string} destDir
 * @returns {number}
 */
export function syncFiches(srcDir, destDir) {
  const files = readdirSync(srcDir).filter((name) => name.endsWith(".md") && !EXCLUDED.includes(name));
  const seen = new Map();
  for (const name of files) {
    const problem = problemOf(name, readFileSync(path.join(srcDir, name), "utf8"), seen);
    if (problem) throw new Error(`${name} : ${problem}`);
  }
  mkdirSync(destDir, { recursive: true });
  // Purge des copies dont la source a disparu.
  for (const name of readdirSync(destDir)) {
    if (name.endsWith(".md") && !files.includes(name)) unlinkSync(path.join(destDir, name));
  }
  for (const name of files) copyFileSync(path.join(srcDir, name), path.join(destDir, name));
  return files.length;
}

// Entrée en ligne de commande : `node scripts/sync-fiches.mjs [destination]` (défaut : content/fiches).
// Source : `FICHES_DIR` si défini, sinon le dossier `fiches/` voisin de la racine du site.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const src = process.env.FICHES_DIR ?? path.resolve(here, "..", "..", "fiches");
  const dest = path.resolve(process.argv[2] ?? path.join("content", "fiches"));
  try {
    console.log(`${syncFiches(src, dest)} fiches synchronisées`);
  } catch (e) {
    console.error(e instanceof Error ? e.message : String(e));
    process.exit(1);
  }
}
