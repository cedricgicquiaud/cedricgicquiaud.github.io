import { existsSync } from "node:fs";
import path from "node:path";

export function loadAbout(dir: string) {
  const file = path.join(dir, "about.md");
  if (!existsSync(file)) {
    throw new Error(`content/about.md manquant (attendu : ${file})`);
  }
}
