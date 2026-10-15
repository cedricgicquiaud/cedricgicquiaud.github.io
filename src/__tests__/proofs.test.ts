import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { cleanup, render } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { Projects } from "../../components/projects";
import { buildProofs } from "../../lib/proofs";

afterEach(cleanup);

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

  it("donne les fiches des cartes de l'accueil, dans le même ordre, chacune avec l'URL absolue de sa page", () => {
    const { container } = render(createElement(Projects));
    const cartes = Array.from(container.querySelectorAll("h3 a")).map((a) => `https://cedricgicquiaud.github.io${a.getAttribute("href")}`);
    expect(cartes).toHaveLength(8);
    expect(buildProofs().fiches.map((f) => f.url)).toEqual(cartes);
  });
});
