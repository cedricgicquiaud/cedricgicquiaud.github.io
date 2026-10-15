import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { checkOutput, fingerprint } from "../../scripts/check-output.mjs";

// PFO-115 : proofs.json et llms.txt, lus par des agents IA, passent les quatre règles des pages HTML.
// Le mot interdit du test est inventé et n'existe dans la liste que par son empreinte.
const LISTE = [fingerprint("zorglub")];
const FUSEE = String.fromCodePoint(0x1f680);
const FAUTES = `zorglub ${FUSEE} 06 12 34 56 78 https://cdn.example.com`;

/** Un out/ temporaire : `{ "proofs.json": "…", "projets/x/llms.txt": "…" }`. */
function outDir(fichiers: Record<string, string>): string {
  const dir = mkdtempSync(path.join(tmpdir(), "out-"));
  for (const [nom, contenu] of Object.entries(fichiers)) {
    mkdirSync(path.dirname(path.join(dir, nom)), { recursive: true });
    writeFileSync(path.join(dir, nom), contenu);
  }
  return dir;
}

describe("check-output lit proofs.json et llms.txt par leur nom (PFO-115)", () => {
  it.each([
    ["proofs.json", JSON.stringify({ texte: FAUTES })],
    ["llms.txt", FAUTES],
  ])("%s : mot interdit, emoji, téléphone et domaine tiers, chaque message nommant le fichier", (nom, contenu) => {
    expect(checkOutput(outDir({ [nom]: contenu }), LISTE)).toEqual([
      `${nom} : mot interdit « zorglub »`,
      `${nom} : emoji « ${FUSEE} »`,
      `${nom} : numéro de téléphone « 06 12 34 56 78 »`,
      `${nom} : domaine tiers « cdn.example.com »`,
    ]);
  });
});

describe("check-output garde les autres .txt et .json comme avant (PFO-115)", () => {
  it("refuse seulement le domaine tiers dans un index.txt (données internes de Next)", () => {
    expect(checkOutput(outDir({ "index.txt": FAUTES }), LISTE)).toEqual(["index.txt : domaine tiers « cdn.example.com »"]);
  });

  it("ne lit pas un autre .json", () => {
    expect(checkOutput(outDir({ "autre.json": JSON.stringify({ texte: FAUTES }) }), LISTE)).toEqual([]);
  });

  it("ne traite par leur nom que les fichiers à la racine de out/", () => {
    expect(checkOutput(outDir({ "projets/x/llms.txt": FAUTES }), LISTE)).toEqual([
      `${path.join("projets", "x", "llms.txt")} : domaine tiers « cdn.example.com »`,
    ]);
  });
});
