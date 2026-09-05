// Contrôle des fichiers déclarés dans les fiches (`visuel`, `captures[].fichier`, `video.fichier`)
// avant `next build` : existence dans public/, poids (capture ≤ 300 Ko, vidéo ≤ 15 Mo) et type reconnu
// par le contenu, jamais par l'extension (capture : PNG ou WebP ; vidéo : MP4). La capture principale
// (`visuel`) mesure 1200×750, dimensions lues dans l'en-tête (IHDR pour PNG ; VP8X, VP8 ou VP8L pour WebP).
// Usage : node scripts/check-assets.mjs [dossier des fiches] [dossier public]
// (défauts : content/fiches et public ; lancé par `npm run build` avant `project-visuals`).
import { closeSync, existsSync, openSync, readdirSync, readFileSync, readSync, statSync } from "node:fs";
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

/** Octets lus en tête de fichier : assez pour la signature et les dimensions (WebP VP8X : jusqu'à l'octet 29). */
const HEAD_LENGTH = 32;

/** Les premiers octets d'un fichier (moins de HEAD_LENGTH s'il est plus court). */
function head(file) {
  const buf = Buffer.alloc(HEAD_LENGTH);
  const fd = openSync(file, "r");
  try {
    const read = readSync(fd, buf, 0, HEAD_LENGTH, 0);
    return buf.subarray(0, read);
  } finally {
    closeSync(fd);
  }
}

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
const isPng = (head) => head.subarray(0, 4).equals(PNG_SIGNATURE);
const isWebp = (head) => head.subarray(0, 4).toString("ascii") === "RIFF" && head.subarray(8, 12).toString("ascii") === "WEBP";
const isMp4 = (head) => head.subarray(4, 8).toString("ascii") === "ftyp";

/** Largeur et hauteur d'un WebP d'après son premier chunk (octets 12-15) : VP8X (étendu, largeur - 1 et
 * hauteur - 1 sur 3 octets), VP8 (avec perte, 14 bits après le code de début) ou VP8L (sans perte, 14 bits
 * chacun après l'octet 2F). `undefined` si le chunk est inconnu. */
function webpDimensions(head) {
  switch (head.subarray(12, 16).toString("ascii")) {
    case "VP8X":
      return { width: head.readUIntLE(24, 3) + 1, height: head.readUIntLE(27, 3) + 1 };
    case "VP8 ":
      return { width: head.readUInt16LE(26) & 0x3fff, height: head.readUInt16LE(28) & 0x3fff };
    case "VP8L": {
      const bits = head.readUInt32LE(21);
      return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
    }
    default:
      return undefined;
  }
}

/** Largeur et hauteur lues dans l'en-tête d'une image : PNG (chunk IHDR, octets 16-23, big-endian) ou WebP ;
 * `undefined` si l'en-tête est tronqué ou le chunk inconnu. */
function dimensions(head) {
  if (head.length < HEAD_LENGTH) return undefined;
  if (isPng(head)) return { width: head.readUInt32BE(16), height: head.readUInt32BE(20) };
  return webpDimensions(head);
}

const VISUEL_WIDTH = 1200;
const VISUEL_HEIGHT = 750;

/** Ce qu'on attend d'un fichier déclaré, selon le champ qui le déclare. */
const CAPTURE = {
  maxBytes: MAX_CAPTURE_BYTES,
  isType: (head) => isPng(head) || isWebp(head),
  typeLabel: "ni PNG ni WebP d'après son contenu",
};
const VISUEL = { ...CAPTURE, width: VISUEL_WIDTH, height: VISUEL_HEIGHT };
const VIDEO = { maxBytes: MAX_VIDEO_BYTES, isType: isMp4, typeLabel: "pas un MP4 d'après son contenu (« ftyp » absent)" };

/** Les fichiers déclarés par une fiche : `{ where, declared, kind }` (où dans le frontmatter, chemin déclaré, attendu). */
function declaredFiles(data) {
  const files = [];
  if (typeof data.visuel === "string") files.push({ where: "visuel", declared: data.visuel, kind: VISUEL });
  const captures = Array.isArray(data.captures) ? data.captures : [];
  captures.forEach((capture, i) => {
    if (typeof capture?.fichier === "string") {
      files.push({ where: `captures, entrée ${i + 1}`, declared: capture.fichier, kind: CAPTURE });
    }
  });
  if (typeof data.video?.fichier === "string") files.push({ where: "video", declared: data.video.fichier, kind: VIDEO });
  return files;
}

/** Fichier de `publicDir` désigné par un chemin `/…` qui n'en sort pas (même règle que lib/fiches.ts) ; `undefined` sinon. */
function insidePublic(publicDir, declared) {
  if (!declared.startsWith("/")) return undefined;
  const resolved = path.resolve(publicDir, "." + declared);
  return resolved.startsWith(publicDir + path.sep) ? resolved : undefined;
}

/** Le premier problème d'un fichier existant de `publicDir` (poids, type, dimensions) ; `undefined` s'il est conforme. */
function problemWith(file, kind) {
  const { size } = statSync(file);
  if (size > kind.maxBytes) return `${size} octets, plafond ${cap(kind.maxBytes)}`;
  const bytes = head(file);
  if (!kind.isType(bytes)) return kind.typeLabel;
  if (kind.width === undefined) return undefined;
  const expected = `attendu ${kind.width}×${kind.height}`;
  const read = dimensions(bytes);
  if (!read) return `dimensions illisibles dans l'en-tête, ${expected}`;
  if (read.width !== kind.width || read.height !== kind.height) return `${read.width}×${read.height}, ${expected}`;
  return undefined;
}

/**
 * Parcourt les fiches de `fichesDir` et renvoie la liste des problèmes (vide si tout est conforme).
 * @param {string} fichesDir dossier des fiches Markdown
 * @param {string} publicDir dossier public/ où vivent les fichiers déclarés
 * @returns {string[]}
 */
export function checkAssets(fichesDir, publicDir) {
  const pub = path.resolve(publicDir);
  const problems = [];
  for (const name of readdirSync(fichesDir).filter((n) => n.endsWith(".md"))) {
    const { data } = matter(readFileSync(path.join(fichesDir, name), "utf8"));
    for (const { where, declared, kind } of declaredFiles(data)) {
      const file = insidePublic(pub, declared);
      const problem = !file ? "doit être un chemin /… dans public/" : !existsSync(file) ? "absent de public/" : problemWith(file, kind);
      if (problem) problems.push(`${name} : ${where} « ${declared} » : ${problem}`);
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
