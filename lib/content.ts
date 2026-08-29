import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

export type About = { titre: string; html: string };

export function loadAbout(dir: string): About {
  const file = path.join(dir, "about.md");
  if (!existsSync(file)) {
    throw new Error(`content/about.md manquant (attendu : ${file})`);
  }
  const { data, content } = matter(readFileSync(file, "utf8"));
  if (typeof data.titre !== "string" || data.titre.trim() === "") {
    throw new Error("content/about.md : frontmatter incomplet, champ « titre » requis");
  }
  return { titre: data.titre, html: marked.parse(content, { async: false }).trim() };
}
