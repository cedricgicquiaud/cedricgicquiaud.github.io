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
