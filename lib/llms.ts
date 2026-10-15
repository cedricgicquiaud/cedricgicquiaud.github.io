import { readFileSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import site from "../content/site.json";
import { contentDir as defaultContentDir, loadExperience } from "./content";
import { buildProofs } from "./proofs";
import { texteBrut } from "./texte-brut";

/** Le premier paragraphe de `about.md`, en texte brut, liens absolus. */
function premierParagraphe(contentDir: string): string {
  const { content } = matter(readFileSync(path.join(contentDir, "about.md"), "utf8"));
  return texteBrut(content, site.url).split("\n\n")[0];
}

/** Une ligne par fiche, celles de proofs.json : même ordre, même URL, même accroche En bref. */
function projets(fichesDir?: string): string {
  return buildProofs({ fichesDir })
    .fiches.map(({ nom, url, enBref }) => `- [${nom}](${url}) : ${enBref}`)
    .join("\n");
}

/** Un poste par ligne, dans l'ordre de la section Expérience. */
function parcours(contentDir: string): string {
  return loadExperience(contentDir)
    .blocs.map(({ periode, role, secteur }) => `- ${periode} — ${role}, ${secteur}`)
    .join("\n");
}

/**
 * Le contenu de `/llms.txt` : le sommaire du site au format llmstxt.org, pour un agent IA (PFO-116).
 */
export function buildLlms({ contentDir = defaultContentDir, fichesDir }: { contentDir?: string; fichesDir?: string } = {}): string {
  return [`# ${site.name}`, `> ${site.title}`, premierParagraphe(contentDir), "## Projets", projets(fichesDir), "## Parcours", parcours(contentDir)].join("\n\n");
}
