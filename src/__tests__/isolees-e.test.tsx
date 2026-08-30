import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { Experience } from "../../components/experience";
import { ProjectCard } from "../../components/project-card";
import type { Fiche } from "../../lib/fiches";
import { Badge } from "../../components/ui/badge";

afterEach(cleanup);

const root = path.resolve(__dirname, "../..");
const source = (rel: string) => readFileSync(path.join(root, rel), "utf8");

/** Le contenu d'un bloc CSS `selector { ... }` (premier niveau d'accolades). */
function cssBlock(css: string, selector: string): string {
  const start = css.indexOf(selector);
  expect(start, `bloc « ${selector} » introuvable`).toBeGreaterThanOrEqual(0);
  const open = css.indexOf("{", start);
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === "{") depth++;
    if (css[i] === "}" && --depth === 0) return css.slice(open + 1, i);
  }
  throw new Error(`bloc « ${selector} » non fermé`);
}

/** Une fiche factice ; le chiffre clé est reconnaissable pour vérifier son absence de la carte. */
function fiche(over: Partial<Fiche["frontmatter"]> = {}): Fiche {
  return {
    slug: "alpha",
    titre: "Alpha — un titre",
    frontmatter: {
      nom: "Alpha",
      statut: "en cours",
      periode: "2026",
      role: "conception",
      stack: ["TypeScript", "React"],
      visibilite: "public",
      depot: "https://github.com/x/alpha",
      depotNote: "",
      demo: "",
      demoNote: "",
      ordre: 1,
      ...over,
    },
    enBref: { quoi: "Un outil qui fait une chose.", chiffre: "4242 tests verts.", lien: "" },
    sections: [],
    visuel: "/projets/generated/alpha.png",
  };
}

describe("Token --cyber dans globals.css (PFO-51)", () => {
  const css = source("app/globals.css");

  it("clair : #0d6b63 ; sombre système et sombre forcé : #5eead4", () => {
    expect(cssBlock(css, ":root {")).toMatch(/--cyber:\s*#0d6b63;/);
    expect(cssBlock(css, ":root:not([data-theme=\"light\"]) {")).toMatch(/--cyber:\s*#5eead4;/);
    expect(cssBlock(css, ":root[data-theme=\"dark\"] {")).toMatch(/--cyber:\s*#5eead4;/);
  });

  it("expose --color-cyber dans @theme inline pour les classes text-cyber et bg-cyber", () => {
    expect(cssBlock(css, "@theme inline {")).toMatch(/--color-cyber:\s*var\(--cyber\);/);
  });
});

describe("Badge : variante cyber (PFO-51)", () => {
  it("rend un fond cyber à 10 % et un texte cyber, toujours en pilule", () => {
    render(<Badge variant="cyber">TypeScript</Badge>);
    const badge = screen.getByText("TypeScript");
    expect(badge).toHaveClass("bg-cyber/10", "text-cyber", "rounded-4xl");
    expect(badge).not.toHaveClass("bg-primary", "bg-secondary");
  });
});

describe("Experience : pastilles et titre en bleu cyber (PFO-51)", () => {
  it("chaque compétence est une pastille cyber ; le titre passe en text-cyber au survol et au focus, plus jamais en text-primary", () => {
    const { container } = render(<Experience />);
    const articles = within(container.querySelector("ol") as HTMLElement).getAllByRole("article");
    expect(articles.length).toBeGreaterThan(0);
    for (const article of articles) {
      const tags = within(within(article).getByRole("list")).getAllByRole("listitem");
      expect(tags.length).toBeGreaterThan(0);
      for (const tag of tags) {
        const badge = tag.firstElementChild as HTMLElement;
        expect(badge).toHaveClass("bg-cyber/10", "text-cyber");
        expect(badge).not.toHaveClass("bg-secondary");
      }
      const title = within(article).getByRole("heading", { level: 3 });
      expect(title).toHaveClass("group-hover/item:text-cyber", "group-focus-within/item:text-cyber");
      expect(title.className).not.toMatch(/text-primary/);
    }
  });
});

describe("ProjectCard : pastilles et titre en bleu cyber (PFO-51)", () => {
  it("la stack est en pastilles cyber, le statut reste neutre (secondary), le titre passe en text-cyber au survol et au focus", () => {
    render(<ProjectCard fiche={fiche()} />);
    const card = screen.getByRole("article");
    for (const tag of ["TypeScript", "React"]) {
      expect(within(card).getByText(tag)).toHaveClass("bg-cyber/10", "text-cyber");
    }
    const statut = within(card).getByText("en cours");
    expect(statut).toHaveClass("bg-secondary", "text-secondary-foreground");
    expect(statut).not.toHaveClass("text-cyber");
    const title = within(card).getByRole("heading", { level: 3 });
    expect(title).toHaveClass("group-hover/item:text-cyber", "group-focus-within/item:text-cyber");
    expect(title.className).not.toMatch(/text-primary/);
  });
});

describe("Experience : typographie du modèle (PFO-52)", () => {
  it("période en petites capitales atténuées, titre 16 px medium, secteur 14 px atténué, description 14 px atténuée", () => {
    const { container } = render(<Experience />);
    const articles = within(container.querySelector("ol") as HTMLElement).getAllByRole("article");
    for (const article of articles) {
      const periode = article.firstElementChild as HTMLElement;
      expect(periode.tagName).toBe("P");
      expect(periode).toHaveClass("text-xs", "font-semibold", "uppercase", "tracking-wide", "text-muted-foreground");
      expect(periode).not.toHaveClass("text-sm");

      const title = within(article).getByRole("heading", { level: 3 });
      expect(title).toHaveClass("text-base", "font-medium");

      const secteur = title.nextElementSibling as HTMLElement;
      expect(secteur.tagName).toBe("P");
      expect(secteur).toHaveClass("text-sm", "text-muted-foreground");

      const description = secteur.nextElementSibling as HTMLElement;
      expect(description.tagName).toBe("P");
      expect(description).toHaveClass("text-sm", "leading-relaxed", "text-muted-foreground");
      expect(description).not.toHaveClass("text-base");
    }
  });
});

describe("ProjectCard : typographie du modèle (PFO-52)", () => {
  it("statut en petites capitales, titre 16 px medium, phrase En bref 14 px atténuée", () => {
    render(<ProjectCard fiche={fiche()} />);
    const card = screen.getByRole("article");
    const statut = within(card).getByText("en cours");
    expect(statut).toHaveClass("text-xs", "font-semibold", "uppercase", "tracking-wide");

    const title = within(card).getByRole("heading", { level: 3 });
    expect(title).toHaveClass("text-base", "font-medium");

    const quoi = within(card).getByText("Un outil qui fait une chose.");
    expect(quoi).toHaveClass("text-sm", "leading-relaxed", "text-muted-foreground");
    expect(quoi).not.toHaveClass("text-base");
  });
});

describe("ProjectCard : sans chiffre clé (PFO-53)", () => {
  it("le chiffre d'En bref n'apparaît nulle part dans la carte ; min-w-0 et whitespace-normal restent en place", () => {
    render(<ProjectCard fiche={fiche()} />);
    const card = screen.getByRole("article");
    expect(card.textContent).not.toContain("4242");
    expect(within(card).queryByText("4242 tests verts.")).not.toBeInTheDocument();
    expect(card.querySelector(".tabular-nums")).toBeNull();

    expect(card).toHaveClass("min-w-0");
    expect(within(card).getByRole("heading", { level: 3 }).parentElement).toHaveClass("min-w-0");
    expect(within(card).getByText("en cours")).toHaveClass("whitespace-normal");
  });
});

describe("Fiche : pastilles Stack en bleu cyber (PFO-51)", () => {
  it("chaque tag de la ligne Stack est une pastille cyber, comme sur les cartes", async () => {
    const { Fiche } = await import("../../components/fiche");
    render(<Fiche fiche={fiche()} />);
    for (const tag of ["TypeScript", "React"]) {
      const badge = screen.getByText(tag);
      expect(badge).toHaveClass("bg-cyber/10", "text-cyber");
      expect(badge).not.toHaveClass("bg-secondary", "border-border");
    }
  });
});
