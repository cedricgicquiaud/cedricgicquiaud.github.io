import "@testing-library/jest-dom/vitest";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadFiche } from "../../lib/fiches";

const FICHE = `---
nom: Alpha
statut: en cours
visibilite: public
---

# Alpha — un titre

**En bref.** Un outil. 120 tests. Code public.
`;

/** Un dossier temporaire avec `fiches/alpha.md` (frontmatter complété par `extra`) et un `public/` vide. */
function sandbox(extra = "") {
  const dir = mkdtempSync(path.join(tmpdir(), "visuals-"));
  const fiches = path.join(dir, "fiches");
  const pub = path.join(dir, "public");
  mkdirSync(fiches);
  mkdirSync(pub);
  writeFileSync(path.join(fiches, "alpha.md"), FICHE.replace("visibilite: public\n", `visibilite: public\n${extra}`));
  return { fiches, pub };
}

describe("loadFiche — champ visuel (PFO-35)", () => {
  it("sans champ visuel, expose le visuel généré /projets/generated/<slug>.png", () => {
    const { fiches, pub } = sandbox();
    expect(loadFiche("alpha", fiches, pub).visuel).toBe("/projets/generated/alpha.png");
  });
});
