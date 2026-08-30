import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Home from "../../app/page";
import { About } from "../../components/about";
import { Experience } from "../../components/experience";
import { Fiche } from "../../components/fiche";
import { Intro } from "../../components/intro";
import { Projects } from "../../components/projects";
import { loadFiches } from "../../lib/fiches";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  document.documentElement.removeAttribute("data-theme");
});

const classesOf = (el: Element | null | undefined) => (el?.className ?? "").split(/\s+/).filter(Boolean);

describe("Tailles du modèle : intro (PFO-47)", () => {
  it("h1 en 48 px gras serré, titre court en 20 px medium, phrase en 16 px atténuée plafonnée", () => {
    render(<Intro />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(classesOf(h1)).toEqual(expect.arrayContaining(["text-5xl", "font-bold", "tracking-tight"]));
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
