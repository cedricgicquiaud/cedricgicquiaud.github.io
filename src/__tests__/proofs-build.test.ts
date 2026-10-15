import { readFileSync } from "node:fs";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { ensureBuild } from "./helpers/build";

// PFO-114 : proofs.json sort du build, à la racine de out/.
const root = path.resolve(__dirname, "../..");
const out = (fichier: string) => path.join(root, "out", fichier);
const SOURCES = ["app/proofs.json/route.ts", "lib/proofs.ts", "lib/texte-brut.ts", "lib/fiches.ts", "content/site.json", "app/page.tsx"];

describe("proofs.json dans out/ (PFO-114)", () => {
  beforeAll(() => ensureBuild(SOURCES, { marker: "out/proofs.json" }), 300_000);

  it("se lit avec JSON.parse", () => {
    const proofs = JSON.parse(readFileSync(out("proofs.json"), "utf8"));
    expect(proofs.fiches.length).toBeGreaterThan(0);
  });
});

describe("L'accueil annonce proofs.json (PFO-114)", () => {
  beforeAll(() => ensureBuild(SOURCES, { marker: "out/proofs.json" }), 300_000);
  const accueil = () => readFileSync(out("index.html"), "utf8");

  it("porte un lien alternate application/json vers /proofs.json dans l'en-tête", () => {
    const head = accueil().split("</head>")[0];
    const liens = head.match(/<link[^>]*rel="alternate"[^>]*>/g) ?? [];
    expect(liens.filter((l) => l.includes('type="application/json"') && /href="[^"]*\/proofs\.json"/.test(l))).toHaveLength(1);
  });
});
