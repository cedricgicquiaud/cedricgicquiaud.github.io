import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// PFO-151 (05/11) : icône d'onglet en monogramme « CG », comme le portfolio de référence, à la place du globe.
const ICONE = path.join(__dirname, "../../app/icon.svg");

describe("Icône d'onglet (PFO-151)", () => {
  it("un SVG carré : fond noir arrondi, lettres CG en blanc et en gras", () => {
    expect(existsSync(ICONE)).toBe(true);
    const svg = readFileSync(ICONE, "utf8");
    expect(svg).toMatch(/viewBox="0 0 64 64"/);
    expect(svg).toMatch(/<rect[^>]*rx="\d+"[^>]*fill="#0a0a0a"/);
    expect(svg).toMatch(/<text[^>]*fill="#ffffff"[^>]*font-weight="700"[^>]*>CG<\/text>/);
  });
});

// PFO-151 : le titre d'onglet change selon la page, comme le portfolio de référence.
describe("Titre d'onglet de l'accueil (PFO-151)", () => {
  it("« Cédric Gicquiaud, Product builder IA », repris par l'aperçu de partage", async () => {
    const { metadata } = await import("../../app/layout");
    expect(metadata.title).toBe("Cédric Gicquiaud, Product builder IA");
    expect(metadata.openGraph?.title).toBe("Cédric Gicquiaud, Product builder IA");
  });
});
