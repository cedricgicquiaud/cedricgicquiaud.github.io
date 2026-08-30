import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ProjectCard } from "../../components/project-card";
import type { Fiche } from "../../lib/fiches";

afterEach(cleanup);

/** Une fiche factice complète ; chaque test ne surcharge que ce qu'il observe. */
function fiche(over: Partial<Fiche["frontmatter"]> & { slug?: string; titre?: string; quoi?: string; chiffre?: string } = {}): Fiche {
  const { slug = "alpha", titre = "Alpha — un titre", quoi = "Un outil qui fait une chose.", chiffre = "120 tests.", ...fm } = over;
  return {
    slug,
    titre,
    frontmatter: {
      nom: "Alpha",
      statut: "en cours",
      periode: "2026",
      role: "conception",
      stack: ["TypeScript", "React"],
      visibilite: "public",
      depot: "https://github.com/x/alpha",
      demo: "",
      ordre: 1,
      ...fm,
    },
    enBref: { quoi, chiffre, lien: "" },
    sections: [],
  };
}

describe("ProjectCard — contenu", () => {
  it("affiche le titre, la ligne En bref, le chiffre clé, le statut et les tags", () => {
    render(<ProjectCard fiche={fiche({ stack: ["TypeScript", "React"] })} />);
    const card = screen.getByRole("article");
    expect(within(card).getByRole("heading", { name: "Alpha — un titre" })).toBeInTheDocument();
    expect(within(card).getByText("Un outil qui fait une chose.")).toBeInTheDocument();
    expect(within(card).getByText("120 tests.")).toHaveClass("tabular-nums");
    expect(within(card).getByText("en cours")).toBeInTheDocument();
    expect(within(card).getByRole("list", { name: /stack/i })).toBeInTheDocument();
    expect(within(card).getByText("TypeScript")).toBeInTheDocument();
    expect(within(card).getByText("React")).toBeInTheDocument();
  });
});

describe("ProjectCard — tags", () => {
  it("affiche au plus 5 tags, les premiers de la stack", () => {
    render(<ProjectCard fiche={fiche({ stack: ["A", "B", "C", "D", "E", "F", "G"] })} />);
    const tags = within(screen.getByRole("list", { name: /stack/i })).getAllByRole("listitem");
    expect(tags.map((t) => t.textContent)).toEqual(["A", "B", "C", "D", "E"]);
  });
});

describe("ProjectCard — liens externes", () => {
  it("lie « Code » vers depot et « Démo » vers demo quand ce sont des URL", () => {
    render(<ProjectCard fiche={fiche({ depot: "https://github.com/x/alpha", demo: "https://alpha.example" })} />);
    expect(screen.getByRole("link", { name: "Code" })).toHaveAttribute("href", "https://github.com/x/alpha");
    expect(screen.getByRole("link", { name: "Démo" })).toHaveAttribute("href", "https://alpha.example");
  });

  it("refus : depot vide, aucun lien « Code »", () => {
    render(<ProjectCard fiche={fiche({ depot: "", demo: "https://alpha.example" })} />);
    expect(screen.queryByRole("link", { name: "Code" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Démo" })).toBeInTheDocument();
  });

  it("refus : depot qui n'est pas une URL (« à venir »), aucun lien « Code »", () => {
    render(<ProjectCard fiche={fiche({ depot: "à venir (nouveau dépôt public)" })} />);
    expect(screen.queryByRole("link", { name: "Code" })).not.toBeInTheDocument();
  });

  it("refus : demo qui n'est pas une URL (« à venir »), aucun lien « Démo »", () => {
    render(<ProjectCard fiche={fiche({ demo: "à venir (mise en ligne prévue)" })} />);
    expect(screen.queryByRole("link", { name: "Démo" })).not.toBeInTheDocument();
    expect(screen.queryByText(/à venir \(mise en ligne prévue\)/)).not.toBeInTheDocument();
  });
});

describe("ProjectCard — vitrine", () => {
  it("refus : vitrine sans dépôt, mention « code privé, démo à venir » et aucun lien externe", () => {
    render(<ProjectCard fiche={fiche({ visibilite: "vitrine", depot: "", demo: "à venir (Vercel)" })} />);
    expect(screen.getByText("code privé, démo à venir")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Code" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Démo" })).not.toBeInTheDocument();
  });

  it("vitrine avec dépôt : lien « Code », pas de mention « code privé »", () => {
    render(<ProjectCard fiche={fiche({ visibilite: "vitrine", depot: "https://github.com/x/landing" })} />);
    expect(screen.getByRole("link", { name: "Code" })).toBeInTheDocument();
    expect(screen.queryByText(/code privé/)).not.toBeInTheDocument();
  });

  it("anonyme sans dépôt : ni lien ni mention « code privé »", () => {
    render(<ProjectCard fiche={fiche({ visibilite: "anonyme", depot: "", demo: "" })} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByText(/code privé/)).not.toBeInTheDocument();
  });
});
