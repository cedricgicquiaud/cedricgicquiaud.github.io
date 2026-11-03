import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Fiche } from "../../components/fiche";
import { decisionsDe } from "../../lib/decisions";
import type { Fiche as FicheData } from "../../lib/fiches";

afterEach(cleanup);

// PFO-130, retour du 03/11 : décisions en trois colonnes comme le modèle (titre de section, titre de décision, texte),
// et titre de section qui reste visible à gauche pendant le défilement.

describe("decisionsDe — découpe des décisions", () => {
  it("nouveau format : un ### par décision, suivi de son texte", () => {
    const html = "<h3>Ce qui n'est pas coché n'existe pas</h3>\n<p>Le tri se fait côté serveur.</p>\n<h3>Hébergé plutôt que téléchargé</h3>\n<p>macOS bloque.</p>\n<p>Adresse hébergée.</p>";
    expect(decisionsDe(html)).toEqual([
      { titre: "Ce qui n'est pas coché n'existe pas", html: "<p>Le tri se fait côté serveur.</p>" },
      { titre: "Hébergé plutôt que téléchargé", html: "<p>macOS bloque.</p>\n<p>Adresse hébergée.</p>" },
    ]);
  });

  it("format des fiches actuelles : une puce par décision, titre en gras ; le point ou les deux-points final tombent", () => {
    const html = "<ul>\n<li><strong>Isolation.</strong> Le parsing tourne à part.</li>\n<li><strong>Django pour l'admin fourni</strong> : gérer les plaques.</li>\n</ul>";
    expect(decisionsDe(html)).toEqual([
      { titre: "Isolation", html: "<p>Le parsing tourne à part.</p>" },
      { titre: "Django pour l'admin fourni", html: "<p>gérer les plaques.</p>" },
    ]);
  });

  it("refus : un texte libre n'est pas découpé", () => {
    expect(decisionsDe("<p>Un paragraphe.</p>")).toBeNull();
    expect(decisionsDe("<ul>\n<li>Sans titre en gras.</li>\n</ul>")).toBeNull();
    expect(decisionsDe("")).toBeNull();
  });
});

function fiche(decisions: string): FicheData {
  return {
    slug: "alpha",
    titre: "Alpha",
    frontmatter: {
      nom: "Alpha",
      statut: "en cours",
      periode: "2026",
      role: "seul",
      stack: ["TypeScript"],
      visibilite: "public",
      depot: "",
      depotNote: "",
      demo: "",
      demoNote: "",
      ordre: 1,
    },
    enBref: { quoi: "Une accroche.", chiffre: "", lien: "" },
    sections: [
      { id: "probleme", titre: "Problème", html: "<p>Le besoin.</p>" },
      { id: "construit", titre: "Ce que j'ai construit", html: "" },
      { id: "preuves", titre: "Preuves", html: "<p>Les preuves.</p>" },
      { id: "appris", titre: "Ce que j'en ai appris", html: "" },
      { id: "artefacts", titre: "Artefacts", html: "" },
    ],
    facultatives: [{ id: "decisions", titre: "Décisions", html: decisions }],
    visuel: "/projets/generated/alpha.png",
  };
}

const section = (name: string) => screen.getByRole("heading", { level: 2, name }).closest("section")!;

describe("Page projet — décisions en trois colonnes", () => {
  it("chaque décision : son titre (h3) à côté de son texte, sur une ligne de la grille", () => {
    render(<Fiche fiche={fiche("<h3>Premier choix</h3>\n<p>Texte un.</p>\n<h3>Second choix</h3>\n<p>Texte deux.</p>")} />);
    const items = within(section("Décisions")).getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(within(items[0]).getByRole("heading", { level: 3 })).toHaveTextContent("Premier choix");
    expect(items[0]).toHaveTextContent("Texte un.");
    expect(items[0].className).toMatch(/\bmd:grid-cols-/);
    expect(items[1].className).toMatch(/\bborder-t\b/);
  });

  it("une apostrophe du titre s'affiche comme une apostrophe, pas en code HTML", () => {
    render(<Fiche fiche={fiche("<h3>Ce qui n&#39;est pas coché</h3>\n<p>Texte.</p>")} />);
    expect(within(section("Décisions")).getByRole("heading", { level: 3 }).textContent).toBe("Ce qui n'est pas coché");
  });

  it("refus : un texte libre reste affiché tel quel, sans grille", () => {
    render(<Fiche fiche={fiche("<p>Un seul paragraphe.</p>")} />);
    expect(section("Décisions")).toHaveTextContent("Un seul paragraphe.");
    expect(within(section("Décisions")).queryByRole("heading", { level: 3 })).toBeNull();
  });
});

describe("Page projet — titre de section fixe pendant le défilement", () => {
  it("chaque titre de section reste collé en haut sur écran large", () => {
    render(<Fiche fiche={fiche("<p>X.</p>")} />);
    for (const h of screen.getAllByRole("heading", { level: 2 })) {
      expect(h).toHaveClass("lg:sticky", "lg:self-start");
    }
  });
});
