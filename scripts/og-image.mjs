// Génère public/opengraph-image.png (1200×630) : nom et titre sur le bleu du thème.
// Usage : node scripts/og-image.mjs   (à relancer quand content/site.json ou --primary change)
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createElement as h } from "react";
import { ImageResponse } from "next/og.js";
import { token } from "./theme-tokens.mjs";

const root = path.resolve(import.meta.dirname, "..");
const siteFile = path.join(root, "content", "site.json");
if (!existsSync(siteFile)) {
  console.error(`og-image : content/site.json introuvable (${siteFile}) ; le nom et le titre du site y sont lus.`);
  process.exit(1);
}
const site = JSON.parse(readFileSync(siteFile, "utf8"));

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
