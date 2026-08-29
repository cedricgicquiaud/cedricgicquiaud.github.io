import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

export type About = { titre: string; html: string };
export type Bloc = {
  periode: string;
  role: string;
  secteur: string;
  description: string;
  tags: string[];
};
export type Experience = { titre: string; blocs: Bloc[] };

type Front = { data: Record<string, unknown>; content: string };

function readFront(dir: string, name: string): Front {
  const file = path.join(dir, name);
  if (!existsSync(file)) {
    throw new Error(`content/${name} manquant (attendu : ${file})`);
  }
  const { data, content } = matter(readFileSync(file, "utf8"));
  if (typeof data.titre !== "string" || data.titre.trim() === "") {
    throw new Error(`content/${name} : frontmatter incomplet, champ « titre » requis`);
  }
  return { data, content };
}

export function loadAbout(dir: string): About {
  const { data, content } = readFront(dir, "about.md");
  return { titre: data.titre as string, html: marked.parse(content, { async: false }).trim() };
}

type RawBloc = Record<string, unknown>;

function hasPeriode(b: RawBloc): boolean {
  const ok = typeof b.periode === "string" || typeof b.periode === "number";
  if (!ok) {
    console.warn(
      `content/experience.md : bloc sans « période » ignoré (rôle : ${String(b.role ?? "?")})`,
    );
  }
  return ok;
}

function toBloc(b: RawBloc): Bloc {
  return {
    periode: String(b.periode),
    role: String(b.role),
    secteur: String(b.secteur),
    description: String(b.description),
    tags: Array.isArray(b.tags) ? b.tags.map(String) : [],
  };
}

/** Première année citée dans la période ; 0 si aucune. */
function startYear(bloc: Bloc): number {
  return Number(bloc.periode.match(/\d{4}/)?.[0] ?? 0);
}

export function loadExperience(dir: string): Experience {
  const { data } = readFront(dir, "experience.md");
  const raw = Array.isArray(data.blocs) ? (data.blocs as RawBloc[]) : [];
  const blocs = raw.filter(hasPeriode).map(toBloc).sort((a, b) => startYear(b) - startYear(a));
  return { titre: data.titre as string, blocs };
}

/** Dossier `content/` du projet (le build Next et Vitest tournent depuis la racine). */
export const contentDir = path.join(process.cwd(), "content");
