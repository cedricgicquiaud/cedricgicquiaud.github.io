import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildProofs } from "../../lib/proofs";

// PFO-112 : proofs.json assemblé depuis les fiches et le parcours.

/** Une fiche Markdown minimale ; `front` complète ou remplace le frontmatter. */
function ficheMd(nom: string, front: Record<string, string | number> = {}, corps = ""): string {
  const fm = { nom, statut: "en cours", periode: "2026", role: "conception", stack: "TypeScript", visibilite: "public", ...front };
  const lignes = Object.entries(fm).map(([k, v]) => `${k}: ${v}`);
  return ["---", ...lignes, "---", "", `# ${nom}`, "", corps].join("\n");
}

/** Un dossier de fiches temporaire : `{ "alpha.md": "…", "archives/x.md": "…" }`. */
function fichesDir(fichiers: Record<string, string>): string {
  const dir = mkdtempSync(path.join(tmpdir(), "proofs-"));
  for (const [nom, contenu] of Object.entries(fichiers)) {
    mkdirSync(path.dirname(path.join(dir, nom)), { recursive: true });
    writeFileSync(path.join(dir, nom), contenu);
  }
  return dir;
}

describe("buildProofs — les fiches (PFO-112)", () => {
  it("liste les fiches par `ordre`, puis sans ordre en dernier", () => {
    const dir = fichesDir({
      "alpha.md": ficheMd("Alpha", { ordre: 2 }),
      "beta.md": ficheMd("Beta", { ordre: 1 }),
      "gamma.md": ficheMd("Gamma"),
    });
    expect(buildProofs({ fichesDir: dir }).fiches.map((f) => f.slug)).toEqual(["beta", "alpha", "gamma"]);
  });
});
