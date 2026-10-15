import site from "../content/site.json";

/**
 * Le contenu de `/llms.txt` : le sommaire du site au format llmstxt.org, pour un agent IA (PFO-116).
 */
export function buildLlms(): string {
  return [`# ${site.name}`, `> ${site.title}`].join("\n\n");
}
