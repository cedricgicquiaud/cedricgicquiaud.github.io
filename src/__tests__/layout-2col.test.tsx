import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import path from "node:path";
import { act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Home from "../../app/page";
import { Intro } from "../../components/intro";
import { Nav } from "../../components/nav";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  document.documentElement.removeAttribute("data-theme");
});

const root = path.resolve(__dirname, "../..");
const source = (rel: string) => readFileSync(path.join(root, rel), "utf8");

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

type ObserverCallback = (entries: Partial<IntersectionObserverEntry>[]) => void;

function stubIntersectionObserver() {
  const state: { callback?: ObserverCallback; observed: Element[] } = { observed: [] };
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(callback: ObserverCallback) {
        state.callback = callback;
      }
      observe(el: Element) {
        state.observed.push(el);
      }
      disconnect() {}
      unobserve() {}
    },
  );
  return state;
}

describe("Section active dans le menu latéral (PFO-29)", () => {
  it("marque l'entrée visible aria-current=location, avec trait long et texte foreground", () => {
    const observer = stubIntersectionObserver();
    render(
      <>
        <Nav />
        <main>
          <section id="a-propos" />
          <section id="experience" />
          <section id="projets" />
        </main>
        <footer id="contact" />
      </>,
    );
    expect(observer.observed.map((el) => el.id)).toEqual(["a-propos", "experience", "projets"]);

    const target = document.getElementById("experience")!;
    act(() => observer.callback!([{ target, isIntersecting: true }]));

    const active = screen.getByRole("link", { name: "Expérience" });
    expect(active).toHaveAttribute("aria-current", "location");
    expect(classesOf(active)).toContain("aria-[current]:text-foreground");
    expect(classesOf(active.querySelector("span"))).toEqual(
      expect.arrayContaining(["group-aria-[current]:w-16", "group-aria-[current]:bg-foreground"]),
    );
    expect(screen.getByRole("link", { name: "À propos" })).not.toHaveAttribute("aria-current");
  });

  it("ne se positionne pas : aucune classe fixed, sticky, top-, left- ni bordure dans nav.tsx", () => {
    const src = source("components/nav.tsx");
    expect(src).not.toMatch(/\b(lg:)?(fixed|sticky)\b/);
    expect(src).not.toMatch(/\b(lg:)?(top|left|right)-\d/);
    expect(src).not.toMatch(/\bborder-[rb]\b/);
    expect(src).not.toContain("matchMedia");
  });
});

describe("Layout sans menu du haut (PFO-29, PFO-30)", () => {
  it("app/layout.tsx ne rend plus <Nav/>, garde <Footer/> et un bouton de thème fixe en mobile seulement", () => {
    const layout = source("app/layout.tsx");
    const body = layout.slice(layout.indexOf("<body"), layout.indexOf("</body>"));
    expect(body).not.toContain("<Nav");
    expect(layout).not.toMatch(/import \{ Nav \}/);
    expect(body).toContain("<Footer />");
    const wrapper = body.match(/<div className="([^"]*)">\s*<ThemeToggle \/>/);
    expect(wrapper, "conteneur du bouton Thème absent").not.toBeNull();
    expect(wrapper![1].split(/\s+/)).toEqual(["fixed", "right-4", "top-4", "z-50", "lg:hidden"]);
    expect(body.indexOf("{children}")).toBeLessThan(body.indexOf("<Footer />"));
  });
});
