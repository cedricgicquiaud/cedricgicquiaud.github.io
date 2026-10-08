import { readFileSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

// PFO-82 à 84 (08/10) : fiche BEN livrée, schéma et captures floutées, toujours anonyme.
const FICHE = path.join(__dirname, "../../content/fiches/ben.md");

describe("Fiche BEN (PFO-82 à 84)", () => {
  const { data, content } = matter(readFileSync(FICHE, "utf8"));

  it("est livrée et reste anonyme", () => {
    expect(data.statut).toBe("livré");
    expect(data.visibilite).toBe("anonyme");
  });

  it("déclare un schéma en visuel, des captures et des chiffres", () => {
    expect(data.visuel).toBe("/projets/ben/accueil.png");
    expect(data.captures?.length).toBeGreaterThanOrEqual(2);
    expect(data.chiffres?.length).toBeGreaterThanOrEqual(1);
  });

  it("ne garde ni artefact à produire ni bloc « État honnête »", () => {
    expect(content).not.toMatch(/à produire/);
    expect(content).not.toMatch(/État honnête/);
  });
});
