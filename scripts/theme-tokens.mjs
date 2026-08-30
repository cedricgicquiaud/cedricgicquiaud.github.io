// Couleurs du thème lues dans le bloc clair (`:root { … }`) de app/globals.css : aucune couleur
// en dur dans les scripts d'images. Police Inter lue dans node_modules (@fontsource/inter) :
// aucune requête réseau à la génération. Partagé par og-image.mjs et project-visuals.mjs.
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import path from "node:path";

const require = createRequire(import.meta.url);

const css = readFileSync(path.join(path.resolve(import.meta.dirname, ".."), "app", "globals.css"), "utf8");

/** Valeur de la variable CSS `--<name>` du bloc clair ; erreur si elle manque. */
export function token(name) {
  const block = css.slice(css.indexOf(":root {")).split("}")[0];
  const value = block.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1].trim();
  if (!value) throw new Error(`token --${name} introuvable dans app/globals.css`);
  return value;
}

/** Inter 400 et 600 (latin) pour `ImageResponse`, lues dans @fontsource/inter : Satori lit le .woff, pas le .woff2. */
export function interFonts() {
  const file = (weight) => readFileSync(require.resolve(`@fontsource/inter/files/inter-latin-${weight}-normal.woff`));
  return [
    { name: "Inter", data: file(400), weight: 400, style: "normal" },
    { name: "Inter", data: file(600), weight: 600, style: "normal" },
  ];
}
