// Contrôle du HTML généré dans out/ après `next build`.
// Refuse : mots interdits (content/forbidden.txt : une empreinte SHA-256 par ligne, jamais le mot
// en clair), emoji, domaines tiers hors liste blanche, numéros de téléphone.

import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Les .html passent toutes les règles ; les .js et .txt (chunks et données RSC) seulement « domaine tiers ».
const CHECKED = [".html", ".js", ".txt"];

function outputFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) return outputFiles(full);
    return CHECKED.includes(path.extname(name)) ? [full] : [];
  });
}

/** Empreinte d'un mot : SHA-256 hexadécimal du mot en minuscules, accents retirés. */
export const fingerprint = (word) =>
  createHash("sha256")
    .update(word.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase())
    .digest("hex");

/** Mots du texte (suites de lettres Unicode) dont l'empreinte figure dans la liste. */
function forbiddenWordsIn(html, fingerprints) {
  const hits = new Set();
  for (const [word] of html.matchAll(/\p{L}+/gu)) {
    if (fingerprints.has(fingerprint(word))) hits.add(word);
  }
  return [...hits];
}

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

/** Règles : chacune renvoie les occurrences fautives du texte ; `all` = s'applique aussi aux .js et .txt. */
function rules(fingerprints) {
  return [
    { label: "mot interdit", find: (html) => forbiddenWordsIn(html, fingerprints) },
    { label: "emoji", find: (html) => html.match(EMOJI) ?? [] },
    { label: "numéro de téléphone", find: (html) => html.match(PHONE) ?? [] },
    {
      label: "domaine tiers",
      all: true,
      find: (html) => [...html.matchAll(URL_HOST)].map(([, host]) => host).filter((h) => !isAllowedHost(h)),
    },
  ];
}

/** Texte à contrôler : dans les .txt (données RSC en JSON), les « \\/ » sont des « / ». */
function readText(file) {
  const text = readFileSync(file, "utf8");
  return file.endsWith(".txt") ? text.replaceAll("\\/", "/") : text;
}

/**
 * Parcourt `dir` et renvoie la liste des problèmes (vide si tout est propre).
 * @param {string} dir dossier de sortie du build
 * @param {string[]} forbiddenFingerprints empreintes (voir `fingerprint`) des mots interdits
 * @returns {string[]}
 */
export function checkOutput(dir, forbiddenFingerprints) {
  const fingerprints = new Set(forbiddenFingerprints);
  const problems = new Set();
  for (const file of outputFiles(dir)) {
    const text = readText(file);
    const rel = path.relative(dir, file);
    const isHtml = file.endsWith(".html");
    for (const { label, find, all } of rules(fingerprints)) {
      if (!isHtml && !all) continue;
      for (const hit of find(text)) problems.add(`${rel} : ${label} « ${hit} »`);
    }
  }
  return [...problems];
}

// Entrée en ligne de commande : `node scripts/check-output.mjs [dossier] [liste]`
// (défauts : out/ et content/forbidden.txt).
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const dir = path.resolve(process.argv[2] ?? "out");
  const list = path.resolve(process.argv[3] ?? path.join("content", "forbidden.txt"));
  const fingerprints = readFileSync(list, "utf8")
    .split("\n")
    .map((w) => w.trim())
    .filter(Boolean);
  const problems = checkOutput(dir, fingerprints);
  if (problems.length > 0) {
    console.error(`check-output : ${problems.length} problème(s) dans ${dir}`);
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
  }
  console.log(`check-output : ${dir} propre`);
}
