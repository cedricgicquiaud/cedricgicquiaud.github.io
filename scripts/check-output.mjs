// Contrôle du HTML généré dans out/ après `next build`.
// Refuse : mots interdits (content/forbidden.txt), emoji, domaines tiers hors liste blanche,
// numéros de téléphone.

import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

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

// 0X XX XX XX XX (espaces facultatifs) ou indicatif +33, non collé à d'autres chiffres ou lettres.
const PHONE = /(?<![\w])(?:0[1-9](?:\s?\d{2}){4}|\+33)(?![\w])/;

/** Règles : chacune renvoie la liste des occurrences fautives dans le HTML. */
function rules(forbiddenWords) {
  return [
    { label: "mot interdit", find: (html) => forbiddenWords.filter((w) => wordPattern(w).test(html)) },
    { label: "emoji", find: (html) => html.match(EMOJI) ?? [] },
    { label: "numéro de téléphone", find: (html) => html.match(PHONE) ?? [] },
    {
      label: "domaine tiers",
      find: (html) => [...html.matchAll(URL_HOST)].map(([, host]) => host).filter((h) => !isAllowedHost(h)),
    },
  ];
}

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
    for (const { label, find } of rules(forbiddenWords)) {
      for (const hit of find(html)) problems.push(`${rel} : ${label} « ${hit} »`);
    }
  }
  return problems;
}

// Entrée en ligne de commande : `node scripts/check-output.mjs [dossier]` (défaut : out/).
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const dir = path.resolve(process.argv[2] ?? "out");
  const words = readFileSync(path.resolve("content", "forbidden.txt"), "utf8")
    .split("\n")
    .map((w) => w.trim())
    .filter(Boolean);
  const problems = checkOutput(dir, words);
  if (problems.length > 0) {
    console.error(`check-output : ${problems.length} problème(s) dans ${dir}`);
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
  }
  console.log(`check-output : ${dir} propre`);
}
