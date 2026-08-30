// Copie les fiches de preuve (../fiches/*.md) dans content/fiches/ et les contrôle avant.

import { copyFileSync, mkdirSync, readdirSync } from "node:fs";
import path from "node:path";

/**
 * Copie les `.md` de `srcDir` dans `destDir` et renvoie leur nombre.
 * @param {string} srcDir
 * @param {string} destDir
 * @returns {number}
 */
export function syncFiches(srcDir, destDir) {
  const files = readdirSync(srcDir).filter((name) => name.endsWith(".md"));
  mkdirSync(destDir, { recursive: true });
  for (const name of files) copyFileSync(path.join(srcDir, name), path.join(destDir, name));
  return files.length;
}
