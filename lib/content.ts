import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export function loadAbout(dir: string) {
  const file = path.join(dir, "about.md");
  if (!existsSync(file)) {
    throw new Error(`content/about.md manquant (attendu : ${file})`);
  }
  const { data } = matter(readFileSync(file, "utf8"));
  if (typeof data.titre !== "string" || data.titre.trim() === "") {
    throw new Error("content/about.md : frontmatter incomplet, champ « titre » requis");
  }
}
