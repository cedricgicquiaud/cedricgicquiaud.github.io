import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadFiche } from "../../lib/fiches";

/** Une fiche factice minimale ; `front` : lignes YAML ajoutées au frontmatter. */
const fiche = (front = "") => `---
nom: Alpha
statut: en cours
visibilite: public
${front}---

# Alpha — un titre

**En bref.** Un outil. 120 tests. Code public.
`;

/** Un dossier temporaire avec `fiches/alpha.md` et un `public/` vide. */
function sandbox(front = "") {
  const dir = mkdtempSync(path.join(tmpdir(), "champs-"));
  const fiches = path.join(dir, "fiches");
  const pub = path.join(dir, "public");
  mkdirSync(fiches);
  mkdirSync(pub);
  writeFileSync(path.join(fiches, "alpha.md"), fiche(front));
  return { fiches, pub };
}

/** Charge la fiche `alpha` dont le frontmatter est complété par `front`. */
function load(front = "") {
  const { fiches, pub } = sandbox(front);
  return loadFiche("alpha", fiches, pub);
}

describe("loadFiche — champ captures (PFO-56)", () => {
  it("expose les captures déclarées dans l'ordre, avec fichier et legende", () => {
    const front = `captures:
  - fichier: /projets/alpha/a.png
    legende: L'écran d'accueil
  - fichier: /projets/alpha/b.png
    legende: Le rapport
`;
    expect(load(front).captures).toEqual([
      { fichier: "/projets/alpha/a.png", legende: "L'écran d'accueil" },
      { fichier: "/projets/alpha/b.png", legende: "Le rapport" },
    ]);
  });
});
