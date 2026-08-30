import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Experience } from "../../components/experience";
import { ProjectCard } from "../../components/project-card";
import { Projects } from "../../components/projects";
import type { Fiche } from "../../lib/fiches";

afterEach(cleanup);

/** Une fiche factice publique avec dépôt et démo ; chaque test ne surcharge que ce qu'il observe. */
function fiche(over: Partial<Fiche["frontmatter"]> = {}): Fiche {
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
      demo: "https://alpha.example",
      demoNote: "",
      ordre: 1,
      ...over,
    },
    enBref: { quoi: "Un outil.", chiffre: "120 tests.", lien: "" },
    sections: [],
    visuel: "/projets/generated/alpha.png",
  };
}

describe("Experience — survol", () => {
  it("accentue l'expérience survolée et estompe les voisines sur grand écran seulement", () => {
    const { container } = render(<Experience />);
    const list = container.querySelector("ol") as HTMLElement;
    expect(list).toHaveClass("group/list");
    const articles = within(list).getAllByRole("article");
    expect(articles.length).toBeGreaterThan(0);
    for (const article of articles) {
      expect(article).toHaveClass("group/item", "rounded-lg", "transition-colors");
      expect(article).toHaveClass("hover:bg-accent/50", "hover:border-border", "border-transparent");
      expect(article).toHaveClass("lg:group-hover/list:opacity-50", "lg:hover:!opacity-100");
      const title = within(article).getByRole("heading", { level: 3 });
      expect(title).toHaveClass("group-hover/item:text-primary");
    }
  });
});

describe("Experience — focus clavier", () => {
  it("produit le même état au focus, sans estomper les voisines", () => {
    const { container } = render(<Experience />);
    const articles = within(container.querySelector("ol") as HTMLElement).getAllByRole("article");
    for (const article of articles) {
      expect(article).toHaveClass("focus-within:bg-accent/50", "focus-within:border-border");
      expect(article.className).not.toMatch(/focus-within[^ ]*opacity/);
      expect(within(article).getByRole("heading", { level: 3 })).toHaveClass("group-focus-within/item:text-primary");
    }
  });
});

describe("ProjectCard — survol", () => {
  it("accentue la carte survolée et estompe les voisines sur grand écran seulement", () => {
    render(<ProjectCard fiche={fiche()} />);
    const card = screen.getByRole("article");
    expect(card).toHaveClass("group/item", "rounded-lg", "transition-colors", "min-w-0");
    expect(card).toHaveClass("border", "border-transparent", "hover:bg-accent/50", "hover:border-border");
    expect(card).toHaveClass("lg:group-hover/list:opacity-50", "lg:hover:!opacity-100");
    expect(within(card).getByRole("heading", { level: 3 })).toHaveClass("group-hover/item:text-primary");
  });
});

describe("ProjectCard — focus clavier", () => {
  it("produit le même état quand un lien de la carte a le focus, sans estomper les voisines", () => {
    render(<ProjectCard fiche={fiche()} />);
    const card = screen.getByRole("article");
    expect(card).toHaveClass("focus-within:bg-accent/50", "focus-within:border-border");
    expect(card.className).not.toMatch(/focus-within[^ ]*opacity/);
    expect(within(card).getByRole("heading", { level: 3 })).toHaveClass("group-focus-within/item:text-primary");
  });
});

describe("Projects — grille", () => {
  it("la grille est le groupe de liste qui pilote l'estompe des cartes voisines", () => {
    const { container } = render(<Projects fiches={[fiche(), fiche({ nom: "Beta" })]} />);
    expect(container.querySelector("ol")).toHaveClass("group/list");
  });
});

describe("ProjectCard — liens et mobile", () => {
  it("garde Code et Démo comme deux liens distincts avec leur href, sans transformer la carte en lien", () => {
    render(<ProjectCard fiche={fiche()} />);
    const card = screen.getByRole("article");
    expect(card.closest("a")).toBeNull();
    expect(screen.getByRole("link", { name: "Code" })).toHaveAttribute("href", "https://github.com/x/alpha");
    expect(screen.getByRole("link", { name: "Démo" })).toHaveAttribute("href", "https://alpha.example");
  });

  it("à 375 px (classes seulement, jsdom ne mesure pas) : la carte et ses cellules gardent min-w-0", () => {
    const { container } = render(<Projects fiches={[fiche()]} />);
    for (const li of Array.from(container.querySelector("ol")!.children)) expect(li).toHaveClass("min-w-0");
    expect(screen.getByRole("article")).toHaveClass("min-w-0");
  });
});

describe("Sections — mise en page déléguée au parent", () => {
  it("Experience et Projects ne se marginent ni ne se centrent elles-mêmes (le conteneur de la page s'en charge)", () => {
    for (const el of [<Experience key="e" />, <Projects key="p" fiches={[fiche()]} />]) {
      const { container, unmount } = render(el);
      const section = container.querySelector("section") as HTMLElement;
      expect(section).toHaveClass("py-16");
      expect(section.className).not.toMatch(/(^|\s)(lg:)?px-/);
      const inner = section.firstElementChild as HTMLElement;
      expect(inner).toHaveClass("w-full");
      expect(inner).not.toHaveClass("max-w-3xl", "mx-auto");
      unmount();
    }
  });
});
