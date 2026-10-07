import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ProjectCard } from "../../components/project-card";
import { Fiche } from "../../components/fiche";
import type { Fiche as FicheData } from "../../lib/fiches";

afterEach(cleanup);

// PFO-73 (05/10) : le lien texte « Code » devient le logo GitHub ; le statut n'est plus affiché.
function fiche(over: Partial<FicheData["frontmatter"]> = {}): FicheData {
  return {
    slug: "alpha",
    titre: "Alpha — un titre",
    frontmatter: {
      nom: "Alpha",
      statut: "en cours",
      periode: "2026",
      role: "conception",
      stack: ["TypeScript"],
      visibilite: "public",
      depot: "https://github.com/x/alpha",
      depotNote: "",
      demo: "",
      demoNote: "",
      ordre: 1,
      ...over,
    },
    enBref: { quoi: "Un outil.", chiffre: "", lien: "" },
    sections: [],
    visuel: "/projets/generated/alpha.png",
  };
}

describe.each([
  ["carte", (f: FicheData) => <ProjectCard fiche={f} />],
  ["page de fiche", (f: FicheData) => <Fiche fiche={f} />],
])("%s — logo GitHub et statut (PFO-73)", (_, view) => {
  it("le dépôt est un logo GitHub, sans le mot « Code » visible", () => {
    render(view(fiche()));
    const link = screen.getByRole("link", { name: "Code sur GitHub" });
    expect(link).toHaveAttribute("href", "https://github.com/x/alpha");
    expect(link.querySelector("svg")).not.toBeNull();
    expect(link).not.toHaveTextContent(/\S/);
  });

  it("le statut n'est pas affiché", () => {
    render(view(fiche()));
    expect(screen.queryByText(/en cours/i)).toBeNull();
    expect(screen.queryByText("Statut")).toBeNull();
  });

  it("refus : aucun logo GitHub sans dépôt public", () => {
    render(view(fiche({ visibilite: "vitrine", depot: "" })));
    expect(screen.queryByRole("link", { name: "Code sur GitHub" })).toBeNull();
    cleanup();
    render(view(fiche({ visibilite: "anonyme", depot: "" })));
    expect(screen.queryByRole("link", { name: "Code sur GitHub" })).toBeNull();
  });
});

// PFO-77 (07/10) : le lien texte « Démo » devient une icône de site internet, à côté du logo GitHub.
describe.each([
  ["carte", (f: FicheData) => <ProjectCard fiche={f} />],
  ["page de fiche", (f: FicheData) => <Fiche fiche={f} />],
])("%s — icône de démo (PFO-77)", (_, view) => {
  it("la démo est une icône, sans le mot « Démo » visible", () => {
    render(view(fiche({ demo: "https://demo.example.test/" })));
    const link = screen.getByRole("link", { name: "Démo" });
    expect(link).toHaveAttribute("href", "https://demo.example.test/");
    expect(link).toHaveAttribute("title", "Démo en ligne");
    expect(link.querySelector("svg")).not.toBeNull();
    expect(link).not.toHaveTextContent(/\S/);
  });

  it("refus : aucune icône de démo sans URL, ni sur une fiche anonyme", () => {
    render(view(fiche({ demo: "" })));
    expect(screen.queryByRole("link", { name: "Démo" })).toBeNull();
    cleanup();
    render(view(fiche({ visibilite: "anonyme", depot: "", demo: "" })));
    expect(screen.queryByRole("link", { name: "Démo" })).toBeNull();
  });
});
