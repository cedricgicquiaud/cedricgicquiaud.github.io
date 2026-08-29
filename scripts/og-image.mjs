// Génère public/opengraph-image.png (1200×630) : nom et titre sur le bleu du thème.
// Usage : node scripts/og-image.mjs   (à relancer quand content/site.json ou --primary change)
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createElement as h } from "react";
import { ImageResponse } from "next/og.js";

const root = path.resolve(import.meta.dirname, "..");
const site = JSON.parse(readFileSync(path.join(root, "content", "site.json"), "utf8"));
const css = readFileSync(path.join(root, "app", "globals.css"), "utf8");

/** Couleur lue dans le bloc clair de app/globals.css : aucune couleur en dur ici. */
function token(name) {
  const block = css.slice(css.indexOf(":root {")).split("}")[0];
  const value = block.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1].trim();
  if (!value) throw new Error(`token --${name} introuvable dans app/globals.css`);
  return value;
}

const image = new ImageResponse(
  h(
    "div",
    {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "80px",
        background: token("primary"),
        color: token("primary-foreground"),
        fontFamily: "sans-serif",
      },
    },
    h("div", { style: { fontSize: 72, fontWeight: 600, letterSpacing: "-0.02em" } }, site.name),
    h("div", { style: { marginTop: 32, fontSize: 36, lineHeight: 1.3, opacity: 0.92 } }, site.title),
  ),
  { width: 1200, height: 630 },
);

const target = path.join(root, "public", "opengraph-image.png");
writeFileSync(target, Buffer.from(await image.arrayBuffer()));
console.log(`écrit ${path.relative(root, target)}`);
