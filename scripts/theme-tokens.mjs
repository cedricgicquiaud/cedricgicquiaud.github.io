// Couleurs du thème lues dans le bloc clair (`:root { … }`) de app/globals.css : aucune couleur
// en dur dans les scripts d'images. Partagé par og-image.mjs et project-visuals.mjs.
import { readFileSync } from "node:fs";
import path from "node:path";

const css = readFileSync(path.join(path.resolve(import.meta.dirname, ".."), "app", "globals.css"), "utf8");

/** Valeur de la variable CSS `--<name>` du bloc clair ; erreur si elle manque. */
export function token(name) {
  const block = css.slice(css.indexOf(":root {")).split("}")[0];
  const value = block.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1].trim();
  if (!value) throw new Error(`token --${name} introuvable dans app/globals.css`);
  return value;
}
