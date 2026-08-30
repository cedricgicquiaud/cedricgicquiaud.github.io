// Génère public/projets/generated/<slug>.png (1200×750) pour chaque fiche sans visuel fourni :
// fond et quadrillage du thème, nom du projet en bleu, chiffre clé en dessous.
// Usage : node scripts/project-visuals.mjs [dossier des fiches] [dossier public]
// (défauts : content/fiches et public ; lancé par `npm run build` avant `next build`).
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createElement as h } from "react";
import { ImageResponse } from "next/og.js";
import matter from "gray-matter";

const root = path.resolve(import.meta.dirname, "..");
const fichesDir = path.resolve(process.argv[2] ?? path.join(root, "content", "fiches"));
const publicDir = path.resolve(process.argv[3] ?? path.join(root, "public"));
const css = readFileSync(path.join(root, "app", "globals.css"), "utf8");

const WIDTH = 1200;
const HEIGHT = 750;
const STEP = 60;

/** Couleur lue dans le bloc clair de app/globals.css : aucune couleur en dur ici. */
function token(name) {
  const block = css.slice(css.indexOf(":root {")).split("}")[0];
  const value = block.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1].trim();
  if (!value) throw new Error(`token --${name} introuvable dans app/globals.css`);
  return value;
}

/** Deuxième phrase du bloc « **En bref.** » : le chiffre clé (même découpage que lib/fiches.ts). */
function chiffreOf(content) {
  const bloc = content.match(/\*\*En bref\.\*\*([^]*?)(?:\n\s*\n|$)/)?.[1] ?? "";
  return bloc.replace(/\s+/g, " ").trim().split(/(?<=\.)\s+/).filter(Boolean)[1] ?? "";
}

/** Lignes du quadrillage : une div de 1 px tous les STEP px, dans les deux sens. */
function gridLines(color) {
  const lines = [];
  for (let x = STEP; x < WIDTH; x += STEP) {
    lines.push(h("div", { style: { position: "absolute", left: x, top: 0, width: 1, height: HEIGHT, background: color } }));
  }
  for (let y = STEP; y < HEIGHT; y += STEP) {
    lines.push(h("div", { style: { position: "absolute", top: y, left: 0, height: 1, width: WIDTH, background: color } }));
  }
  return lines;
}

function visual(nom, chiffre) {
  return new ImageResponse(
    h(
      "div",
      {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          position: "relative",
          padding: "80px",
          background: token("background"),
          fontFamily: "sans-serif",
        },
      },
      ...gridLines(token("grid-line")),
      h("div", { style: { fontSize: 96, fontWeight: 600, letterSpacing: "-0.02em", color: token("primary") } }, nom),
      h("div", { style: { marginTop: 32, fontSize: 40, lineHeight: 1.3, color: token("foreground") } }, chiffre),
    ),
    { width: WIDTH, height: HEIGHT },
  );
}

const generatedDir = path.join(publicDir, "projets", "generated");
mkdirSync(generatedDir, { recursive: true });

for (const name of readdirSync(fichesDir).filter((n) => n.endsWith(".md"))) {
  const slug = name.slice(0, -3);
  const { data, content } = matter(readFileSync(path.join(fichesDir, name), "utf8"));
  const provided = typeof data.visuel === "string" && data.visuel.trim();
  if (provided && existsSync(path.join(publicDir, provided))) {
    console.log(`${slug} : visuel fourni ${provided}, rien à générer`);
    continue;
  }
  const target = path.join(generatedDir, `${slug}.png`);
  const image = visual(String(data.nom ?? slug), chiffreOf(content));
  writeFileSync(target, Buffer.from(await image.arrayBuffer()));
  console.log(`écrit ${path.relative(root, target)}`);
}
