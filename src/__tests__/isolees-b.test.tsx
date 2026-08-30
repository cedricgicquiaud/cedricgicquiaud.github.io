import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Fiche } from "../../components/fiche";
import { ProjectCard } from "../../components/project-card";
import type { Fiche as FicheData } from "../../lib/fiches";

afterEach(cleanup);

const MENTION = "Projet anonymisé : code et client non publiés";

/** Une fiche factice complète ; chaque test ne surcharge que le frontmatter qu'il observe. */
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
      depotNote: "https://github.com/x/alpha",
      demo: "https://alpha.example.test/",
      demoNote: "https://alpha.example.test/",
      ...over,
    },
    enBref: { quoi: "Un outil.", chiffre: "120 tests.", lien: "" },
    sections: [],
    visuel: "/projets/generated/alpha.png",
  };
}

const anonyme = () => fiche({ visibilite: "anonyme", depot: "", depotNote: "", demo: "", demoNote: "" });

describe("PFO-39 — mention « projet anonymisé » sur la carte", () => {
  it("affiche la mention en text-muted-foreground pour une fiche anonyme", () => {
    render(<ProjectCard fiche={anonyme()} />);
    expect(screen.getByText(MENTION)).toHaveClass("text-muted-foreground");
  });

  it("n'affiche jamais la mention sur une fiche public ou vitrine", () => {
    render(<ProjectCard fiche={fiche({ visibilite: "public" })} />);
    render(<ProjectCard fiche={fiche({ visibilite: "vitrine", depot: "", depotNote: "à venir" })} />);
    expect(screen.queryByText(MENTION)).toBeNull();
  });

  it("n'affiche aucun lien Code ni Démo avec la mention, même si la fiche porte des URL", () => {
    render(<ProjectCard fiche={fiche({ visibilite: "anonyme" })} />);
    expect(screen.getByText(MENTION)).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Code" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Démo" })).toBeNull();
  });
});

describe("PFO-39 — mention « projet anonymisé » sur la page fiche", () => {
  it("affiche la mention en text-muted-foreground pour une fiche anonyme, sans lien Code ni Démo", () => {
    render(<Fiche fiche={fiche({ visibilite: "anonyme" })} />);
    expect(screen.getByText(MENTION)).toHaveClass("text-muted-foreground");
    expect(screen.queryByRole("link", { name: "Code" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Démo" })).toBeNull();
  });
});
