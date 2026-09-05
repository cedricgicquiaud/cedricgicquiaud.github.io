import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { checkAssets } from "../../scripts/check-assets.mjs";

/** Une fiche factice minimale ; `front` : lignes YAML ajoutées au frontmatter. */
const fiche = (front = "") => `---
nom: Alpha
statut: en cours
visibilite: public
${front}---

# Alpha — un titre

**En bref.** Un outil. 120 tests. Code public.
`;

/** Un dossier temporaire avec `fiches/alpha.md` et un `public/` vide ; `file` y écrit un fichier sous public/. */
function sandbox(front = "") {
  const dir = mkdtempSync(path.join(tmpdir(), "assets-"));
  const fiches = path.join(dir, "fiches");
  const pub = path.join(dir, "public");
  mkdirSync(fiches);
  mkdirSync(pub);
  writeFileSync(path.join(fiches, "alpha.md"), fiche(front));
  const file = (rel: string, content: Buffer) => {
    const full = path.join(pub, "." + rel);
    mkdirSync(path.dirname(full), { recursive: true });
    writeFileSync(full, content);
  };
  return { fiches, pub, file };
}

describe("checkAssets — existence des fichiers déclarés (PFO-60)", () => {
  it("ne rend aucun problème pour une fiche qui ne déclare aucun fichier", () => {
    const { fiches, pub } = sandbox();
    expect(checkAssets(fiches, pub)).toEqual([]);
  });
});
