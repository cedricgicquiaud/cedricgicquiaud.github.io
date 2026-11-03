import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { Fiche } from "../../components/fiche";
import { loadFiche, type Fiche as FicheData } from "../../lib/fiches";
import { syncFiches } from "../../scripts/sync-fiches.mjs";

afterEach(cleanup);

// PFO-130 (03/11) : page projet en deux colonnes, sur le modèle de 6gbigalt.github.io.
// Sections facultatives Livrables, Architecture, Décisions ; Stack technique par catégorie ; sommaire.

function fiche(over: Partial<FicheData> = {}): FicheData {
  return {
    slug: "alpha",
    titre: "Alpha — un titre",
    frontmatter: {
      nom: "Alpha",
      statut: "en cours",
      periode: "2026",
      role: "seul",
      stack: ["TypeScript", "Zod"],
      visibilite: "public",
      depot: "https://github.com/x/alpha",
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
      { id: "appris", titre: "Ce que j'en ai appris", html: "<p>Les leçons.</p>" },
      { id: "artefacts", titre: "Artefacts", html: "<p>Les liens.</p>" },
    ],
    facultatives: [
      { id: "livrables", titre: "Livrables", html: "<ul><li>Trois écrans.</li></ul>" },
      { id: "architecture", titre: "Architecture", html: "<p>Le serveur relit la description.</p>" },
      { id: "decisions", titre: "Décisions", html: "<p><strong>1. Ce qui n'est pas coché n'existe pas.</strong></p>" },
    ],
    stackDetail: [
      { categorie: "Langages", outils: ["TypeScript"] },
      { categorie: "Serveur", outils: ["Node.js", "Express"] },
    ],
    visuel: "/projets/generated/alpha.png",
    ...over,
  };
}

const section = (name: string) => screen.getByRole("heading", { level: 2, name }).closest("section")!;

describe("Page projet — sections facultatives (PFO-130)", () => {
  it("ordre : Contexte, Livrables, Architecture, Stack technique, Décisions, puis la fin habituelle", () => {
    render(<Fiche fiche={fiche()} />);
    const titres = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    expect(titres).toEqual([
      "Contexte",
      "Livrables",
      "Architecture",
      "Stack technique",
      "Décisions",
      "Où en est le projet",
      "Ce que j'en retiens",
      "Liens",
    ]);
  });

  it("Architecture affiche le texte de la fiche", () => {
    render(<Fiche fiche={fiche()} />);
    expect(section("Architecture")).toHaveTextContent("Le serveur relit la description.");
  });

  it("refus : aucun outil sous Architecture", () => {
    render(<Fiche fiche={fiche()} />);
    expect(within(section("Architecture")).queryByText("TypeScript")).toBeNull();
    expect(within(section("Architecture")).queryByText("Node.js")).toBeNull();
  });

  it("Livrables et Décisions affichent leur texte", () => {
    render(<Fiche fiche={fiche()} />);
    expect(section("Livrables")).toHaveTextContent("Trois écrans.");
    expect(section("Décisions")).toHaveTextContent("Ce qui n'est pas coché n'existe pas.");
  });

  it("sans « Ce que j'ai construit », les captures vont dans Livrables", () => {
    render(<Fiche fiche={fiche({ captures: [{ fichier: "/projets/alpha/a.webp", legende: "Écran A" }] })} />);
    expect(within(section("Livrables")).getByRole("img", { name: "Écran A" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 2, name: "Le produit" })).toBeNull();
  });
});

describe("Page projet — Stack technique (PFO-130)", () => {
  it("une ligne par catégorie, avec ses outils", () => {
    render(<Fiche fiche={fiche()} />);
    const lignes = within(section("Stack technique")).getAllByRole("row");
    expect(lignes.map((l) => l.textContent)).toEqual(["LangagesTypeScript", "ServeurNode.jsExpress"]);
  });

  it("sans stack_detail, les outils du champ stack", () => {
    render(<Fiche fiche={fiche({ stackDetail: undefined })} />);
    const stack = section("Stack technique");
    expect(within(stack).getByText("Zod")).toBeInTheDocument();
    expect(within(stack).queryByRole("row")).toBeNull();
  });
});

describe("Page projet — deux colonnes et sommaire (PFO-130)", () => {
  it("chaque section : titre à gauche, contenu à droite sur écran large, filet au-dessus", () => {
    render(<Fiche fiche={fiche()} />);
    for (const h of screen.getAllByRole("heading", { level: 2 })) {
      const s = h.closest("section")!;
      expect(s.className).toMatch(/\blg:grid-cols-/);
      expect(s.className).toMatch(/\bborder-t\b/);
      expect(s.children).toHaveLength(2);
      expect(s.children[0]).toBe(h);
    }
  });

  it("le sommaire liste les sections présentes, dans l'ordre, avec leur ancre", () => {
    render(<Fiche fiche={fiche()} />);
    const nav = screen.getByRole("navigation", { name: "Sommaire" });
    const liens = within(nav).getAllByRole("link");
    const titres = screen.getAllByRole("heading", { level: 2 });
    expect(liens.map((a) => a.textContent)).toEqual(titres.map((h) => h.textContent));
    for (const [i, a] of liens.entries()) {
      expect(a).toHaveAttribute("href", `#${titres[i].closest("section")!.id}`);
    }
  });

  it("refus : une section absente n'est ni dans la page ni dans le sommaire", () => {
    render(<Fiche fiche={fiche({ facultatives: [] })} />);
    const nav = screen.getByRole("navigation", { name: "Sommaire" });
    for (const absente of ["Livrables", "Architecture", "Décisions"]) {
      expect(screen.queryByRole("heading", { level: 2, name: absente })).toBeNull();
      expect(within(nav).queryByRole("link", { name: absente })).toBeNull();
    }
  });
});

describe("Lecture des fiches (PFO-130)", () => {
  const SOURCE = (front: string, corps: string) => `---
nom: Alpha
statut: en cours
periode: 2026
role: conception
stack: TypeScript, Zod
visibilite: public
depot: https://github.com/x/alpha
demo:
${front}---

# Alpha — un titre

**En bref.** Une accroche.

## Problème

Texte.
${corps}`;

  function dirs(front: string, corps = "") {
    const src = mkdtempSync(path.join(tmpdir(), "pfo130-src-"));
    const dest = mkdtempSync(path.join(tmpdir(), "pfo130-dest-"));
    const pub = mkdtempSync(path.join(tmpdir(), "pfo130-pub-"));
    mkdirSync(path.join(pub, "projets"), { recursive: true });
    writeFileSync(path.join(src, "alpha.md"), SOURCE(front, corps));
    return { src, dest, pub };
  }

  it("lit Livrables, Architecture et Décisions, seulement celles présentes", () => {
    const { src, dest, pub } = dirs("", "\n## Architecture\n\nLe serveur.\n\n## Décisions\n\n1. Un choix.\n");
    syncFiches(src, dest);
    const f = loadFiche("alpha", dest, pub);
    expect(f.facultatives!.map((s) => [s.id, s.titre])).toEqual([
      ["architecture", "Architecture"],
      ["decisions", "Décisions"],
    ]);
    expect(f.facultatives![0].html).toBe("<p>Le serveur.</p>");
  });

  it("refus : les sections facultatives ne changent pas les cinq sections du gabarit", () => {
    const { src, dest, pub } = dirs("", "\n## Livrables\n\n- Un écran.\n");
    syncFiches(src, dest);
    expect(loadFiche("alpha", dest, pub).sections.map((s) => s.id)).toEqual(["probleme", "construit", "preuves", "appris", "artefacts"]);
  });

  it("lit stack_detail dans l'ordre, outils découpés sur les virgules", () => {
    const { src, dest, pub } = dirs(
      "stack_detail:\n  - categorie: Langages\n    outils: TypeScript\n  - categorie: Serveur\n    outils: Node.js, Express (API)\n",
    );
    syncFiches(src, dest);
    expect(loadFiche("alpha", dest, pub).stackDetail).toEqual([
      { categorie: "Langages", outils: ["TypeScript"] },
      { categorie: "Serveur", outils: ["Node.js", "Express (API)"] },
    ]);
  });

  it("sans stack_detail : champ absent", () => {
    const { src, dest, pub } = dirs("");
    syncFiches(src, dest);
    expect(loadFiche("alpha", dest, pub).stackDetail).toBeUndefined();
  });

  it("refus : un stack_detail mal formé, avec le nom de la fiche", () => {
    for (const bad of [
      "stack_detail:\n  - outils: TypeScript\n",
      "stack_detail:\n  - categorie: Langages\n",
      "stack_detail: TypeScript\n",
    ]) {
      const { src, dest } = dirs(bad);
      expect(() => syncFiches(src, dest)).toThrow(/alpha\.md : .*stack_detail/);
    }
  });
});
