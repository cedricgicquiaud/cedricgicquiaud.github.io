// Copie les fiches de preuve (../fiches/*.md) dans content/fiches/ et les contrôle avant.

import { copyFileSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
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
 * Contrôle puis copie les `.md` de `srcDir` dans `destDir` ; renvoie leur nombre.
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
  for (const name of files) copyFileSync(path.join(srcDir, name), path.join(destDir, name));
  return files.length;
}
