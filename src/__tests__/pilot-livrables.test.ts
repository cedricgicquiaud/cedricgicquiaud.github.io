import { describe, expect, it } from "vitest";
import { loadFiche } from "../../lib/fiches";

// PFO-152 (05/11) : dans les Livrables de PILOT, les six agents viennent avant les autres rubriques.
describe("Fiche PILOT — ordre des Livrables (PFO-152)", () => {
  it("« Les six agents » est la première rubrique, avant la composition, les skills, les fiches et les outils", () => {
    const html = loadFiche("pilot").facultatives!.find((s) => s.id === "livrables")!.html;
    const rubriques = Array.from(html.matchAll(/<h3[^>]*>([^<]+)<\/h3>/g), (m) => m[1]);
    expect(rubriques[0]).toBe("Les six agents");
    expect(rubriques).toEqual(
      expect.arrayContaining(["Ce qui compose la méthode", "Les six skills", "Les 19 fiches de référence", "Les trois outils de la méthode"]),
    );
    expect(html.trim().startsWith("<h3")).toBe(true);
  });
});
