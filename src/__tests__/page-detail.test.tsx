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

// PFO-75 (05/10) : la page détail suit l'ordre du README GitHub — accroche, liens, capture, chiffres, puis
// Contexte, Le produit, Architecture, Où en est le projet, Ce que j'en retiens, Liens.

function fiche(over: Partial<FicheData> = {}, fm: Partial<FicheData["frontmatter"]> = {}): FicheData {
  const html = (t: string) => (t ? `<p>${t}</p>` : "");
  return {
    slug: "alpha",
    titre: "Alpha — un titre",
    frontmatter: {
      nom: "Alpha",
      statut: "en cours",
      periode: "mai 2026 → aujourd'hui",
      role: "seul, avec des agents de code",
      stack: ["TypeScript", "Zod"],
      visibilite: "public",
      depot: "https://github.com/x/alpha",
      depotNote: "",
      demo: "https://alpha.example.test/",
      demoNote: "",
      ordre: 1,
      ...fm,
    },
    enBref: { quoi: "Une accroche qui dit quoi.", chiffre: "500 cas réels.", lien: "Code public." },
    sections: [
      { id: "probleme", titre: "Problème", html: html("Le besoin.") },
      {
        id: "construit",
        titre: "Ce que j'ai construit",
        html: "<p>Un service en trois écrans.</p>\n<p>Décisions qui ont compté :</p>\n<ul>\n<li><strong>Isolation.</strong> Le parsing tourne à part.</li>\n</ul>",
      },
      { id: "preuves", titre: "Preuves", html: html("Les preuves.") },
      { id: "appris", titre: "Ce que j'en ai appris", html: html("Les leçons.") },
      { id: "artefacts", titre: "Artefacts", html: html("Les liens.") },
    ],
    visuel: "/projets/generated/alpha.png",
    ...over,
  };
}

const after = (a: Node, b: Node) => Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);

describe("Page détail — en-tête (PFO-75)", () => {
  it("le titre, puis tout le « En bref » en accroche, puis les liens, puis la capture principale", () => {
    render(<Fiche fiche={fiche()} />);
    const h1 = screen.getByRole("heading", { level: 1 });
    const accroche = screen.getByText("Une accroche qui dit quoi. 500 cas réels. Code public.");
    const github = screen.getByRole("link", { name: "Code sur GitHub" });
    const image = document.querySelector('img[src="/projets/generated/alpha.png"]')!;
    expect(after(h1, accroche)).toBe(true);
    expect(after(accroche, github)).toBe(true);
    expect(after(github, image)).toBe(true);
    expect(screen.getByRole("link", { name: "Démo" })).toHaveAttribute("href", "https://alpha.example.test/");
  });

  it("la ligne des liens porte la période et le rôle", () => {
    render(<Fiche fiche={fiche()} />);
    const ligne = screen.getByRole("link", { name: "Code sur GitHub" }).closest("div,p")!;
    expect(ligne).toHaveTextContent("mai 2026 → aujourd'hui");
    expect(ligne).toHaveTextContent("seul, avec des agents de code");
  });

  it("refus : ni « Visibilité », ni statut, ni liste de définitions", () => {
    render(<Fiche fiche={fiche()} />);
    expect(screen.queryByText("Visibilité")).toBeNull();
    expect(screen.queryByText(/en cours/i)).toBeNull();
    expect(document.querySelector("dl")).toBeNull();
  });

  it("refus : une fiche anonyme n'a aucun lien de code ni de démo", () => {
    render(<Fiche fiche={fiche({}, { visibilite: "anonyme", depot: "", demo: "" })} />);
    expect(screen.queryByRole("link", { name: "Code sur GitHub" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Démo" })).toBeNull();
    expect(screen.getByText(/Projet anonymisé/)).toBeInTheDocument();
  });
});

describe("Page détail — chiffres clés (PFO-75)", () => {
  it("un bandeau de 1 à 3 chiffres, après la capture principale", () => {
    const chiffres = [
      { valeur: "500", libelle: "API réelles" },
      { valeur: "0", libelle: "plantage" },
    ];
    render(<Fiche fiche={fiche({ chiffres })} />);
    const bandeau = screen.getByRole("list", { name: "Chiffres clés" });
    const items = within(bandeau).getAllByRole("listitem");
    expect(items.map((li) => li.textContent)).toEqual(["500API réelles", "0plantage"]);
    expect(after(document.querySelector('img[src="/projets/generated/alpha.png"]')!, bandeau)).toBe(true);
  });

  it("refus : pas de bandeau sans chiffres", () => {
    render(<Fiche fiche={fiche()} />);
    expect(screen.queryByRole("list", { name: "Chiffres clés" })).toBeNull();
  });
});

describe("Page détail — sections (PFO-75)", () => {
  it("six intitulés, dans l'ordre du README", () => {
    render(<Fiche fiche={fiche()} />);
    const titres = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    expect(titres).toEqual(["Contexte", "Le produit", "Architecture", "Où en est le projet", "Ce que j'en retiens", "Liens"]);
  });

  it("« Décisions qui ont compté » passe dans Architecture, avec les pastilles de stack", () => {
    render(<Fiche fiche={fiche()} />);
    const produit = screen.getByRole("heading", { level: 2, name: "Le produit" }).closest("section")!;
    const archi = screen.getByRole("heading", { level: 2, name: "Architecture" }).closest("section")!;
    expect(produit).toHaveTextContent("Un service en trois écrans.");
    expect(produit).not.toHaveTextContent("Isolation.");
    expect(within(archi).getByText("TypeScript")).toBeInTheDocument();
    expect(within(archi).getByText("Zod")).toBeInTheDocument();
    expect(archi).toHaveTextContent("Le parsing tourne à part.");
  });

  it("une fiche sans « Décisions qui ont compté » garde tout dans Le produit ; Architecture montre la stack", () => {
    const sections = fiche().sections.map((s) => (s.id === "construit" ? { ...s, html: "<p>Tout ici.</p>" } : s));
    render(<Fiche fiche={fiche({ sections })} />);
    expect(screen.getByRole("heading", { level: 2, name: "Le produit" }).closest("section")).toHaveTextContent("Tout ici.");
    expect(within(screen.getByRole("heading", { level: 2, name: "Architecture" }).closest("section")!).getByText("Zod")).toBeInTheDocument();
  });

  it("la galerie s'affiche dans Le produit", () => {
    const captures = [{ fichier: "/projets/alpha/a.webp", legende: "Écran A" }];
    render(<Fiche fiche={fiche({ captures })} />);
    const produit = screen.getByRole("heading", { level: 2, name: "Le produit" }).closest("section")!;
    expect(within(produit).getByRole("img", { name: "Écran A" })).toBeInTheDocument();
  });

  it("refus : une section vide n'est pas affichée", () => {
    const sections = fiche().sections.map((s) => (s.id === "appris" ? { ...s, html: "" } : s));
    render(<Fiche fiche={fiche({ sections })} />);
    expect(screen.queryByRole("heading", { level: 2, name: "Ce que j'en retiens" })).toBeNull();
  });

  it("intitulés lisibles : casse normale, pas de petites capitales", () => {
    render(<Fiche fiche={fiche()} />);
    for (const h of screen.getAllByRole("heading", { level: 2 })) expect(h).not.toHaveClass("uppercase");
  });
});

describe("Champ « chiffres » du frontmatter (PFO-75)", () => {
  const SOURCE = (chiffres: string) => `---
nom: Alpha
statut: en cours
periode: 2026
role: conception
stack: TypeScript
visibilite: public
depot: https://github.com/x/alpha
demo:
${chiffres}---

# Alpha — un titre

**En bref.** Une accroche.

## Problème

Texte.
`;
  function dirs(chiffres: string) {
    const src = mkdtempSync(path.join(tmpdir(), "chiffres-src-"));
    const dest = mkdtempSync(path.join(tmpdir(), "chiffres-dest-"));
    const pub = mkdtempSync(path.join(tmpdir(), "chiffres-pub-"));
    mkdirSync(path.join(pub, "projets"), { recursive: true });
    writeFileSync(path.join(src, "alpha.md"), SOURCE(chiffres));
    return { src, dest, pub };
  }

  it("est lu dans l'ordre déclaré", () => {
    const { src, dest, pub } = dirs('chiffres:\n  - valeur: "500"\n    libelle: API réelles\n  - valeur: "0"\n    libelle: plantage\n');
    syncFiches(src, dest);
    expect(loadFiche("alpha", dest, pub).chiffres).toEqual([
      { valeur: "500", libelle: "API réelles" },
      { valeur: "0", libelle: "plantage" },
    ]);
  });

  it("refus : plus de 3 entrées", () => {
    const quatre = Array.from({ length: 4 }, (_, i) => `  - valeur: "${i}"\n    libelle: L${i}\n`).join("");
    const { src, dest, pub } = dirs(`chiffres:\n${quatre}`);
    expect(() => syncFiches(src, dest)).toThrow(/alpha\.md : .*chiffres.*3/);
    writeFileSync(path.join(dest, "alpha.md"), SOURCE(`chiffres:\n${quatre}`));
    expect(() => loadFiche("alpha", dest, pub)).toThrow(/chiffres.*3/);
  });

  it("refus : une entrée sans valeur ou sans libellé", () => {
    for (const bad of ['chiffres:\n  - libelle: API\n', 'chiffres:\n  - valeur: "500"\n']) {
      const { src, dest, pub } = dirs(bad);
      expect(() => syncFiches(src, dest)).toThrow(/alpha\.md : .*chiffres, entrée 1/);
      writeFileSync(path.join(dest, "alpha.md"), SOURCE(bad));
      expect(() => loadFiche("alpha", dest, pub)).toThrow(/chiffres, entrée 1/);
    }
  });
});
