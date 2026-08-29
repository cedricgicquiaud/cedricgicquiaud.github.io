// Contrôle du HTML généré dans out/ après `next build`.
// Refuse : mots interdits (content/forbidden.txt), emoji, domaines tiers hors liste blanche.

import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

function htmlFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) return htmlFiles(full);
    return name.endsWith(".html") ? [full] : [];
  });
}

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Mot entier, insensible à la casse, frontières Unicode (lettres et chiffres). */
const wordPattern = (word) =>
  new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegExp(word)}(?![\\p{L}\\p{N}])`, "iu");

// Émoticônes, symboles et pictogrammes, transports, symboles divers, dingbats, drapeaux.
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/u;

const ALLOWED_HOSTS = [
  "fonts.googleapis.com",
  "fonts.gstatic.com",
  "github.com",
  "linkedin.com",
  "cedricgicquiaud.github.io",
];
const URL_HOST = /https?:\/\/([^/"'\s<>)]+)/g;

const isAllowedHost = (host) =>
  ALLOWED_HOSTS.some((allowed) => host === allowed || host.endsWith(`.${allowed}`));

/**
 * Parcourt `dir` et renvoie la liste des problèmes (vide si tout est propre).
 * @param {string} dir dossier de sortie du build
 * @param {string[]} forbiddenWords mots interdits
 * @returns {string[]}
 */
export function checkOutput(dir, forbiddenWords) {
  const problems = [];
  for (const file of htmlFiles(dir)) {
    const html = readFileSync(file, "utf8");
    const rel = path.relative(dir, file);
    for (const word of forbiddenWords) {
      if (wordPattern(word).test(html)) problems.push(`${rel} : mot interdit « ${word} »`);
    }
    const emoji = html.match(EMOJI);
    if (emoji) problems.push(`${rel} : emoji « ${emoji[0]} »`);
    for (const [, host] of html.matchAll(URL_HOST)) {
      if (!isAllowedHost(host)) problems.push(`${rel} : domaine tiers « ${host} »`);
    }
  }
  return problems;
}
