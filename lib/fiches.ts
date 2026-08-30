import { readdirSync, readFileSync } from "node:fs";
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
  depot: string;
  demo: string;
  ordre?: number;
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
};

/** Valeur de frontmatter en texte ; un nombre (ex. `periode: 2026`) est accepté, le reste devient vide. */
const text = (v: unknown): string =>
  typeof v === "string" ? v.trim() : typeof v === "number" ? String(v) : "";

function toFrontmatter(data: Record<string, unknown>): Frontmatter {
  return {
    nom: text(data.nom),
    statut: text(data.statut),
    periode: text(data.periode),
    role: text(data.role),
    stack: text(data.stack)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    visibilite: text(data.visibilite) as Visibilite,
    depot: text(data.depot),
    demo: text(data.demo),
    ...(Number.isInteger(data.ordre) ? { ordre: data.ordre as number } : {}),
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

function parseFiche(slug: string, raw: string): Fiche {
  const { data, content } = matter(raw);
  const titre = content.match(/^# (.+)$/m)?.[1].trim() ?? "";
  return {
    slug,
    titre,
    frontmatter: toFrontmatter(data),
    enBref: parseEnBref(content),
    sections: parseSections(content),
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

export function loadFiches(dir: string = defaultDir()): Fiche[] {
  return readdirSync(dir)
    .filter((name) => name.endsWith(".md"))
    .map((name) => parseFiche(name.slice(0, -3), readFileSync(path.join(dir, name), "utf8")))
    .sort(compare);
}
