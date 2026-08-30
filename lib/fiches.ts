import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

export type Visibilite = "public" | "vitrine" | "anonyme";

export type Frontmatter = {
  nom: string;
  statut: string;
  periode: string;
  role: string;
  stack: string[];
  visibilite: Visibilite;
  /** URL http(s) du dépôt, sinon chaîne vide. */
  depot: string;
  /** Valeur brute du champ `depot` (URL ou prose, ex. « à venir (…) »). */
  depotNote: string;
  demo: string;
  demoNote: string;
  ordre?: number;
  /** Chemin d'un visuel fourni, relatif à `public/` (ex. `/projets/slice.png`). */
  visuel?: string;
};

export type EnBref = { quoi: string; chiffre: string; lien: string };
export type Section = { id: string; titre: string; html: string };

// Les cinq sections du gabarit de fiche, dans l'ordre d'affichage.
const SECTIONS: ReadonlyArray<{ id: string; titre: string }> = [
  { id: "probleme", titre: "Problème" },
  { id: "construit", titre: "Ce que j'ai construit" },
  { id: "preuves", titre: "Preuves" },
  { id: "appris", titre: "Ce que j'en ai appris" },
  { id: "artefacts", titre: "Artefacts" },
];

export type Fiche = {
  slug: string;
  titre: string;
  frontmatter: Frontmatter;
  enBref: EnBref;
  sections: Section[];
  /** Chemin du visuel affiché, relatif à `public/` : le fourni s'il existe, sinon le généré. */
  visuel: string;
};

/** Valeur de frontmatter en texte ; un nombre (ex. `periode: 2026`) est accepté, le reste devient vide. */
const text = (v: unknown): string =>
  typeof v === "string" ? v.trim() : typeof v === "number" ? String(v) : "";

/** Découpe sur les virgules hors parenthèses : « A (x, y), B » donne ["A (x, y)", "B"]. */
function splitStack(value: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (const ch of value) {
    if (ch === "(") depth++;
    else if (ch === ")") depth = Math.max(0, depth - 1);
    if (ch === "," && depth === 0) {
      parts.push(current);
      current = "";
    } else current += ch;
  }
  parts.push(current);
  return parts.map((s) => s.trim()).filter(Boolean);
}

/** Ne garde qu'une URL http(s) ; toute autre valeur (prose) devient vide. */
const lien = (v: string): string => (/^https?:\/\//.test(v) ? v : "");

function toFrontmatter(data: Record<string, unknown>): Frontmatter {
  const visibilite = text(data.visibilite) as Visibilite;
  // Une fiche anonyme ne pointe vers rien, même si le fichier source contient des liens.
  const masque = visibilite === "anonyme";
  return {
    nom: text(data.nom),
    statut: text(data.statut),
    periode: text(data.periode),
    role: text(data.role),
    stack: splitStack(text(data.stack)),
    visibilite,
    depot: masque ? "" : lien(text(data.depot)),
    depotNote: masque ? "" : text(data.depot),
    demo: masque ? "" : lien(text(data.demo)),
    demoNote: masque ? "" : text(data.demo),
    ...(Number.isInteger(data.ordre) ? { ordre: data.ordre as number } : {}),
    ...(text(data.visuel) ? { visuel: text(data.visuel) } : {}),
  };
}

/** Le paragraphe qui suit « **En bref.** », replié sur une ligne, découpé en phrases. */
function parseEnBref(content: string): EnBref {
  const bloc = content.match(/\*\*En bref\.\*\*([^]*?)(?:\n\s*\n|$)/)?.[1] ?? "";
  const phrases = bloc.replace(/\s+/g, " ").trim().split(/(?<=\.)\s+/).filter(Boolean);
  const [quoi = "", chiffre = "", ...reste] = phrases;
  return { quoi, chiffre, lien: reste.join(" ") };
}

/** Corps de chaque `## Titre` (jusqu'au `##` suivant), rendu en HTML ; section absente = html vide. */
function parseSections(content: string): Section[] {
  const bodies = new Map<string, string>();
  for (const m of content.matchAll(/^## (.+)\n([^]*?)(?=^## |(?![^]))/gm)) bodies.set(m[1].trim(), m[2]);
  return SECTIONS.map(({ id, titre }) => ({
    id,
    titre,
    html: marked.parse(bodies.get(titre) ?? "", { async: false }).trim(),
  }));
}

/** Visuel généré par `scripts/project-visuals.mjs` pour une fiche sans visuel fourni. */
const generatedVisual = (slug: string) => `/projets/generated/${slug}.png`;

/** Le visuel fourni (`frontmatter.visuel`) s'il existe dans `publicDir`, sinon le généré. */
function resolveVisual(slug: string, provided: string | undefined, publicDir: string): string {
  if (provided && existsSync(path.join(publicDir, provided))) return provided;
  return generatedVisual(slug);
}

function parseFiche(slug: string, raw: string, publicDir: string): Fiche {
  const { data, content } = matter(raw);
  const titre = content.match(/^# (.+)$/m)?.[1].trim() ?? "";
  const frontmatter = toFrontmatter(data);
  return {
    slug,
    titre,
    frontmatter,
    enBref: parseEnBref(content),
    sections: parseSections(content),
    visuel: resolveVisual(slug, frontmatter.visuel, publicDir),
  };
}

/** Sans `ordre` = en dernier ; à ordre égal, par nom. */
function compare(a: Fiche, b: Fiche): number {
  const oa = a.frontmatter.ordre ?? Number.POSITIVE_INFINITY;
  const ob = b.frontmatter.ordre ?? Number.POSITIVE_INFINITY;
  return oa - ob || a.frontmatter.nom.localeCompare(b.frontmatter.nom, "fr");
}

/** Dossier des fiches copiées par `npm run sync`. */
const defaultDir = () => path.join(process.cwd(), "content", "fiches");
/** Dossier des fichiers statiques servis à la racine du site. */
const defaultPublicDir = () => path.join(process.cwd(), "public");

/** Une fiche par son slug (nom de fichier sans `.md`) ; `publicDir` sert à vérifier le visuel fourni. */
export function loadFiche(slug: string, dir: string = defaultDir(), publicDir: string = defaultPublicDir()): Fiche {
  return parseFiche(slug, readFileSync(path.join(dir, `${slug}.md`), "utf8"), publicDir);
}

/** Toutes les fiches du dossier, triées par `ordre` puis `nom`. */
export function loadFiches(dir: string = defaultDir(), publicDir: string = defaultPublicDir()): Fiche[] {
  return readdirSync(dir)
    .filter((name) => name.endsWith(".md"))
    .map((name) => loadFiche(name.slice(0, -3), dir, publicDir))
    .sort(compare);
}
