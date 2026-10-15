import { readFileSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import site from "../content/site.json";
import { contentDir as defaultContentDir } from "./content";
import { texteBrut } from "./texte-brut";

/** Le premier paragraphe de `about.md`, en texte brut, liens absolus. */
function premierParagraphe(contentDir: string): string {
  const { content } = matter(readFileSync(path.join(contentDir, "about.md"), "utf8"));
  return texteBrut(content, site.url).split("\n\n")[0];
}

/**
 * Le contenu de `/llms.txt` : le sommaire du site au format llmstxt.org, pour un agent IA (PFO-116).
 */
export function buildLlms({ contentDir = defaultContentDir }: { contentDir?: string } = {}): string {
  return [`# ${site.name}`, `> ${site.title}`, premierParagraphe(contentDir)].join("\n\n");
}
