import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Home from "../../app/page";
import { Intro } from "../../components/intro";
import { Nav } from "../../components/nav";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  document.documentElement.removeAttribute("data-theme");
});

const classesOf = (el: Element | null | undefined) => (el?.className ?? "").split(/\s+/).filter(Boolean);

describe("Deux colonnes à partir de 1024 px (PFO-28)", () => {
  it("rend une colonne gauche collante (nom) et une colonne droite Portrait, À propos, Expérience, Projets", () => {
    const { container } = render(<Home />);
    const sticky = container.querySelector(".lg\\:sticky");
    expect(sticky, "aucun conteneur lg:sticky").not.toBeNull();
    expect(classesOf(sticky)).toEqual(expect.arrayContaining(["lg:sticky", "lg:top-0", "lg:h-screen"]));
    expect(sticky!.contains(screen.getByRole("heading", { level: 1 }))).toBe(true);

    const grid = sticky!.parentElement!;
    expect(classesOf(grid)).toEqual(expect.arrayContaining(["lg:grid", "lg:gap-16"]));
    expect(classesOf(grid).some((c) => c.startsWith("lg:grid-cols-"))).toBe(true);

    const right = sticky!.nextElementSibling!;
    expect(right, "aucune colonne droite après la colonne collante").not.toBeNull();
    const ids = Array.from(right.querySelectorAll("section[id]")).map((s) => s.id);
    expect(ids).toEqual(["portrait", "a-propos", "experience", "projets"]);
  });
});

describe("Intro en bloc classique sous 1024 px (PFO-28)", () => {
  it("ne prend plus la hauteur de l'écran et porte le menu en desktop seulement (hidden lg:block)", () => {
    const { container } = render(<Intro />);
    const section = container.querySelector("section#intro")!;
    expect(classesOf(section)).not.toContain("min-h-screen");
    const nav = screen.getByRole("navigation", { hidden: true });
    expect(section.contains(nav)).toBe(true);
    const wrapper = nav.closest(".hidden");
    expect(wrapper, "le menu n'est pas dans un conteneur hidden lg:block").not.toBeNull();
    expect(classesOf(wrapper)).toEqual(expect.arrayContaining(["hidden", "lg:block"]));
  });
});

describe("Menu latéral à traits (PFO-29)", () => {
  it("rend trois entrées À propos, Expérience, Projets, sans Contact, chacune précédée d'un trait", () => {
    render(<Nav />);
    const links = Array.from(screen.getByRole("navigation").querySelectorAll("a"));
    expect(links.map((a) => [a.textContent?.trim(), a.getAttribute("href")])).toEqual([
      ["À propos", "/#a-propos"],
      ["Expérience", "/#experience"],
      ["Projets", "/#projets"],
    ]);
    for (const link of links) {
      const dash = link.querySelector("span");
      expect(dash, `trait absent sur ${link.textContent}`).not.toBeNull();
      expect(classesOf(dash)).toEqual(expect.arrayContaining(["h-px", "w-8"]));
    }
  });
});
