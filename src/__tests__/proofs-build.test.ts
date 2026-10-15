import { existsSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { ensureBuild } from "./helpers/build";

// PFO-114 : proofs.json sort du build, à la racine de out/.
const root = path.resolve(__dirname, "../..");
const out = (fichier: string) => path.join(root, "out", fichier);
const SOURCES = ["app/proofs.json/route.ts", "lib/proofs.ts", "lib/texte-brut.ts", "lib/fiches.ts", "content/site.json", "app/page.tsx"];

describe("proofs.json dans out/ (PFO-114)", () => {
  beforeAll(() => ensureBuild(SOURCES, { marker: "out/proofs.json" }), 300_000);

  const proofs = () => JSON.parse(readFileSync(out("proofs.json"), "utf8"));

  it("se lit avec JSON.parse", () => {
    expect(proofs().fiches.length).toBeGreaterThan(0);
  });

  it("donne à chaque fiche une `url` qui ouvre une page construite", () => {
    for (const { url } of proofs().fiches as { url: string }[]) {
      expect(url).toMatch(/^https:\/\/cedricgicquiaud\.github\.io\/projets\/[a-z0-9-]+\/$/);
      expect(existsSync(out(`${new URL(url).pathname}index.html`)), url).toBe(true);
    }
  });

  it("publie le schéma à côté : out/proofs.schema.json", () => {
    expect(existsSync(out("proofs.schema.json"))).toBe(true);
  });

  it("refuse un chiffre clé qui parlerait de tests", () => {
    const libelles = (proofs().fiches as { chiffres: { libelle: string }[] }[]).flatMap((f) => f.chiffres.map((c) => c.libelle));
    expect(libelles.filter((l) => /\btests?\b/i.test(l))).toEqual([]);
  });

  it("refuse un proofs.json écrit à la main dans public/", () => {
    expect(existsSync(path.join(root, "public", "proofs.json"))).toBe(false);
  });

  it("refuse de dépendre d'un fichier laissé là : supprimé de out/, un rebuild le recrée", { timeout: 300_000 }, () => {
    rmSync(out("proofs.json"));
    ensureBuild(SOURCES, { marker: "out/proofs.json" });
    expect(proofs().fiches.length).toBeGreaterThan(0);
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

  it("refuse tout lien visible vers proofs.json ou llms.txt, tout PDF et tout CV dans le corps", () => {
    const body = accueil().split("<body")[1].split("<script")[0];
    expect(body).not.toMatch(/<a [^>]*href="[^"]*(proofs\.json|llms\.txt)"/);
    expect(body).not.toMatch(/\.pdf\b/i);
    expect(body).not.toMatch(/\bCV\b/);
  });
});
