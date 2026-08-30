import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import Home from "../../app/page";
import { About } from "../../components/about";
import { Experience } from "../../components/experience";
import { Fiche } from "../../components/fiche";
import { Footer } from "../../components/footer";
import { Intro } from "../../components/intro";
import { Projects } from "../../components/projects";
import { ThemeToggle } from "../../components/theme-toggle";
import { loadFiches } from "../../lib/fiches";
import { ensureBuild } from "./helpers/build";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  document.documentElement.removeAttribute("data-theme");
});

const root = path.resolve(__dirname, "../..");
const source = (rel: string) => readFileSync(path.join(root, rel), "utf8");

const classesOf = (el: Element | null | undefined) => (el?.className ?? "").split(/\s+/).filter(Boolean);

describe("Tailles du modèle : intro (PFO-47)", () => {
  it("h1 en 48 px gras serré, titre court en 20 px medium, phrase en 16 px atténuée plafonnée", () => {
    render(<Intro />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(classesOf(h1)).toEqual(expect.arrayContaining(["text-5xl", "font-bold", "tracking-tight", "leading-tight"]));
    expect(classesOf(h1)).not.toContain("text-4xl");
    expect(classesOf(h1)).not.toContain("sm:text-5xl");
    expect(classesOf(h1)).not.toContain("font-semibold");

    const h2 = screen.getByRole("heading", { level: 2 });
    expect(classesOf(h2)).toEqual(expect.arrayContaining(["text-xl", "font-medium"]));
    expect(classesOf(h2)).not.toContain("text-lg");
    expect(classesOf(h2)).not.toContain("sm:text-xl");

    const phrase = h2.nextElementSibling as HTMLElement;
    expect(phrase.tagName).toBe("P");
    expect(classesOf(phrase)).toEqual(expect.arrayContaining(["text-base", "text-muted-foreground", "max-w-xs"]));
  });
});

describe("Footer : lien du dépôt sans débordement à 375 px (PFO-47)", () => {
  it("le lien du dépôt porte break-all pour se couper dans la largeur", () => {
    render(<Footer />);
    const link = screen.getByRole("link", { name: /github\.com/i });
    expect(classesOf(link)).toContain("break-all");
  });
});

describe("Tailles du modèle : titres de section (PFO-47)", () => {
  it("À propos, Expérience, Projets : h2 en petites capitales discrètes (text-sm font-bold uppercase tracking-widest)", () => {
    const { container } = render(
      <>
        <About />
        <Experience />
        <Projects />
      </>,
    );
    const titles = Array.from(container.querySelectorAll("section > div > h2"));
    expect(titles).toHaveLength(3);
    for (const h2 of titles) {
      expect(classesOf(h2), h2.textContent ?? "").toEqual(
        expect.arrayContaining(["text-sm", "font-bold", "uppercase", "tracking-widest"]),
      );
      expect(classesOf(h2)).not.toContain("text-2xl");
      expect(classesOf(h2)).not.toContain("font-semibold");
    }
  });
});

describe("Tailles du modèle : corps des sections (PFO-47)", () => {
  it("le corps d'À propos, les descriptions d'Expérience et le « quoi » des cartes sont en text-base leading-relaxed", () => {
    const { container } = render(
      <>
        <About />
        <Experience />
        <Projects />
      </>,
    );
    const aboutBody = container.querySelector("section#a-propos h2 + div")!;
    expect(classesOf(aboutBody)).toEqual(expect.arrayContaining(["text-base", "leading-relaxed"]));

    const experienceBodies = container.querySelectorAll("section#experience article h3 ~ p.leading-relaxed");
    expect(experienceBodies.length).toBeGreaterThan(0);
    for (const p of experienceBodies) expect(classesOf(p)).toContain("text-base");

    const cardBodies = container.querySelectorAll("section#projets article h3 + p");
    expect(cardBodies.length).toBeGreaterThan(0);
    for (const p of cardBodies) expect(classesOf(p)).toEqual(expect.arrayContaining(["text-base", "leading-relaxed"]));
  });
});

describe("Grille du modèle : proportions et espace entre colonnes (PFO-47)", () => {
  it("conteneur max-w-screen-xl, colonnes 48/52 avec lg:gap-24, colonne droite plafonnée à max-w-2xl", () => {
    const { container } = render(<Home />);
    const main = container.querySelector("main")!;
    expect(classesOf(main)).toContain("max-w-screen-xl");
    expect(classesOf(main)).not.toContain("max-w-6xl");

    const sticky = container.querySelector(".lg\\:sticky")!;
    const grid = sticky.parentElement!;
    expect(classesOf(grid)).toEqual(
      expect.arrayContaining(["lg:grid", "lg:grid-cols-[minmax(0,48fr)_minmax(0,52fr)]", "lg:gap-24"]),
    );
    expect(classesOf(grid)).not.toContain("lg:gap-16");

    const right = sticky.nextElementSibling!;
    expect(classesOf(right)).toContain("max-w-2xl");
  });
});

describe("Tailles du modèle : page fiche (PFO-47)", () => {
  it("h1 en text-4xl font-bold, titres de section discrets, corps et « En bref » en text-base", () => {
    const { container } = render(<Fiche fiche={loadFiches()[0]} />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(classesOf(h1)).toEqual(expect.arrayContaining(["text-4xl", "font-bold", "tracking-tight"]));
    expect(classesOf(h1)).not.toContain("text-3xl");

    const sectionTitles = container.querySelectorAll("section h2");
    expect(sectionTitles.length).toBeGreaterThan(0);
    for (const h2 of sectionTitles) {
      expect(classesOf(h2)).toEqual(expect.arrayContaining(["text-sm", "font-bold", "uppercase", "tracking-widest"]));
      expect(classesOf(h2)).not.toContain("text-2xl");
    }
    for (const body of container.querySelectorAll("section h2 + div")) {
      expect(classesOf(body)).toEqual(expect.arrayContaining(["text-base", "leading-relaxed"]));
    }
    const enBref = container.querySelector("p.border-l-2")!;
    expect(classesOf(enBref)).toEqual(expect.arrayContaining(["text-base", "leading-relaxed"]));
  });
});

describe("Portrait retiré (PFO-48)", () => {
  it("aucune image de portrait sur l'accueil ni sur une fiche ; l'intro enchaîne h1, titre court, phrase, menu, puis les logos seuls en bas", () => {
    const home = render(<Home />);
    expect(home.container.querySelector("img[src*='portrait']")).toBeNull();
    expect(screen.queryByRole("img", { name: /^Portrait de / })).toBeNull();

    const section = home.container.querySelector("section#intro")!;
    const top = section.firstElementChild!;
    expect(Array.from(top.children).map((el) => el.tagName)).toEqual(["H1", "H2", "P", "DIV"]);
    expect(top.lastElementChild!.querySelector("nav[aria-label='Sections']")).not.toBeNull();
    const bottom = section.lastElementChild!;
    expect(bottom.querySelector("ul")).not.toBeNull();
    home.unmount();

    const fiche = render(<Fiche fiche={loadFiches()[0]} />);
    expect(fiche.container.querySelector("img[src*='portrait']")).toBeNull();
    expect(screen.queryByRole("img", { name: /^Portrait de / })).toBeNull();
  });
});

describe("Bouton de thème en icône (PFO-49)", () => {
  function stubStorage() {
    vi.stubGlobal("localStorage", { getItem: () => null, setItem: () => {}, removeItem: () => {} });
  }

  it("carré de 40 px sans texte, SVG aria-hidden : lune en clair, soleil en sombre, aria-label selon l'état", () => {
    stubStorage();
    vi.stubGlobal("matchMedia", () => ({ matches: false }));
    render(<ThemeToggle />);
    const button = screen.getByRole("button");
    expect(classesOf(button)).toEqual(
      expect.arrayContaining(["inline-flex", "size-10", "items-center", "justify-center", "rounded-md", "border", "bg-background"]),
    );
    expect(button.textContent?.trim()).toBe("");
    const svg = button.querySelector("svg")!;
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("data-icon", "moon");
    expect(button).toHaveAttribute("aria-label", "Passer en thème sombre");

    fireEvent.click(button);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(button.querySelector("svg")).toHaveAttribute("data-icon", "sun");
    expect(button).toHaveAttribute("aria-label", "Passer en thème clair");
    expect(button.textContent?.trim()).toBe("");

    fireEvent.click(button);
    expect(button.querySelector("svg")).toHaveAttribute("data-icon", "moon");
    expect(button).toHaveAttribute("aria-label", "Passer en thème sombre");
  });

  it("suit le système sans data-theme : système sombre affiche le soleil", () => {
    stubStorage();
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    render(<ThemeToggle />);
    expect(screen.getByRole("button").querySelector("svg")).toHaveAttribute("data-icon", "sun");
    expect(screen.getByRole("button")).toHaveAttribute("aria-label", "Passer en thème clair");
  });
});

describe("Un seul bouton de thème, fixe en haut à droite (PFO-49)", () => {
  it("app/layout.tsx place <ThemeToggle/> une seule fois dans un conteneur fixed right-4 top-4 z-50 visible à toutes les largeurs", () => {
    const layout = source("app/layout.tsx");
    const body = layout.slice(layout.indexOf("<body"), layout.indexOf("</body>"));
    expect(body.split("<ThemeToggle />")).toHaveLength(2);
    const wrapper = body.match(/<div className="([^"]*)">\s*<ThemeToggle \/>/);
    expect(wrapper, "conteneur du bouton de thème absent").not.toBeNull();
    const classes = wrapper![1].split(/\s+/);
    expect(classes).toEqual(expect.arrayContaining(["fixed", "right-4", "top-4", "z-50"]));
    expect(classes).not.toContain("lg:hidden");
  });

  it("l'accueil (page.tsx et intro) ne rend aucun bouton de thème : il vit dans le layout", () => {
    render(<Home />);
    expect(screen.queryByRole("button", { name: /thème/i, hidden: true })).toBeNull();
    expect(source("components/intro.tsx")).not.toContain("ThemeToggle");
  });
});

describe("Sortie du build : plus de portrait (PFO-48)", () => {
  beforeAll(() => ensureBuild(["components/intro.tsx", "app/page.tsx", "app/layout.tsx"]), 250_000);

  it("out/index.html ne contient pas le mot « portrait »", () => {
    const html = readFileSync(path.join(root, "out", "index.html"), "utf8");
    expect(html.toLowerCase()).not.toContain("portrait");
  });
});
