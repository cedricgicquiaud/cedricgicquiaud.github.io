import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { Fiche } from "../../components/fiche";
import { corpsDe, loadFiche } from "../../lib/fiches";
import { SECTIONS_APRES_PROBLEME, STACK_DETAIL } from "./helpers/fiche-complete";

afterEach(cleanup);

// PFO-147 (04/11) : section facultative « ## La méthode », entre Livrables et Architecture, en trois
// colonnes : titre de section, puis une ligne par ### (titre de l'étape au milieu, texte à droite).

const METHODE = `
## La méthode

### Le principe

Cinq étapes.

### Étape 1 — Comprendre

Une recherche.
`;

function ficheAvec(methode: string) {
  const dir = mkdtempSync(path.join(tmpdir(), "methode-"));
  mkdirSync(dir, { recursive: true });
  const corps = SECTIONS_APRES_PROBLEME.replace("\n## Architecture", `${methode}\n## Architecture`);
  writeFileSync(
    path.join(dir, "alpha.md"),
    `---\nnom: Alpha\nstatut: en cours\nperiode: "2026"\nrole: seul\nstack: TypeScript\nvisibilite: public\ndepot: https://github.com/x/alpha\ndemo:\nordre: 1\n${STACK_DETAIL}---\n\n# Alpha — un titre\n\n**En bref.** Une accroche.\n\n## Problème\n\nLe besoin.\n${corps}`,
  );
  return loadFiche("alpha", dir);
}

const section = (name: string) => screen.getByRole("heading", { level: 2, name }).closest("section")!;

describe("Section « La méthode » (PFO-147)", () => {
  it("s'affiche sous le titre « La méthode », entre Livrables et Architecture, dans le sommaire aussi", () => {
    render(<Fiche fiche={ficheAvec(METHODE)} />);
    const h2 = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    expect(h2.indexOf("La méthode")).toBe(h2.indexOf("Livrables") + 1);
    expect(h2.indexOf("Architecture")).toBe(h2.indexOf("La méthode") + 1);
    expect(within(screen.getByRole("navigation", { name: "Sommaire" })).getByRole("link", { name: "La méthode" })).toHaveAttribute(
      "href",
      "#methode",
    );
  });

  it("trois colonnes : une ligne par ###, le titre de l'étape à côté de son texte", () => {
    render(<Fiche fiche={ficheAvec(METHODE)} />);
    const lignes = within(section("La méthode")).getAllByRole("listitem");
    expect(lignes).toHaveLength(2);
    expect(within(lignes[1]).getByRole("heading", { level: 3 })).toHaveTextContent("Étape 1 — Comprendre");
    expect(lignes[1]).toHaveTextContent("Une recherche.");
    expect(lignes[1].className).toMatch(/\bmd:grid-cols-/);
  });

  it("proofs.json la reprend, à sa place", () => {
    const ids = corpsDe(ficheAvec(METHODE)).map((s) => s.id);
    expect(ids.indexOf("methode")).toBe(ids.indexOf("livrables") + 1);
    expect(ids.indexOf("architecture")).toBe(ids.indexOf("methode") + 1);
  });

  it("refus : sans « ## La méthode », aucune section ni entrée de sommaire", () => {
    render(<Fiche fiche={ficheAvec("")} />);
    expect(screen.queryByRole("heading", { level: 2, name: "La méthode" })).toBeNull();
    expect(screen.queryByRole("link", { name: "La méthode" })).toBeNull();
  });
});
