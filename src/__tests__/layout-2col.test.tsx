import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { act } from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import Home from "../../app/page";
import { About } from "../../components/about";
import { Intro } from "../../components/intro";
import { Nav } from "../../components/nav";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const root = path.resolve(__dirname, "../..");
const source = (rel: string) => readFileSync(path.join(root, rel), "utf8");

const classesOf = (el: Element | null | undefined) => (el?.className ?? "").split(/\s+/).filter(Boolean);

describe("Deux colonnes à partir de 1024 px (PFO-28)", () => {
  it("rend une colonne gauche collante (nom) et une colonne droite À propos, Expérience, Projets (portrait déplacé à gauche par PFO-37)", () => {
    const { container } = render(<Home />);
    const sticky = container.querySelector(".lg\\:sticky");
    expect(sticky, "aucun conteneur lg:sticky").not.toBeNull();
    expect(classesOf(sticky)).toEqual(expect.arrayContaining(["lg:sticky", "lg:top-0", "lg:h-screen"]));
    expect(sticky!.contains(screen.getByRole("heading", { level: 1 }))).toBe(true);

    const grid = sticky!.parentElement!;
    expect(classesOf(grid)).toEqual(expect.arrayContaining(["lg:grid", "lg:gap-24"]));
    expect(classesOf(grid).some((c) => c.startsWith("lg:grid-cols-"))).toBe(true);

    const right = sticky!.nextElementSibling!;
    expect(right, "aucune colonne droite après la colonne collante").not.toBeNull();
    const ids = Array.from(right.querySelectorAll("section[id]")).map((s) => s.id);
    expect(ids).toEqual(["a-propos", "experience", "projets"]);
  });
});

describe("Sections de la colonne droite sans marge ni centrage propres (PFO-28)", () => {
  // Le conteneur deux colonnes porte déjà le padding horizontal.
  it.each([
    ["About", "a-propos", () => <About />],
  ])("%s : aucune classe px-*, max-w-3xl ni mx-auto sur la section ni son bloc interne", (_name, id, Cmp) => {
    const { container } = render(<Cmp />);
    const section = container.querySelector(`section#${id}`)!;
    expect(section).not.toBeNull();
    const inner = section.firstElementChild!;
    for (const el of [section, inner]) {
      const classes = classesOf(el);
      expect(classes.some((c) => /^(lg:)?px-/.test(c)), `${el.tagName} porte un px-`).toBe(false);
      expect(classes).not.toContain("max-w-3xl");
      expect(classes).not.toContain("mx-auto");
    }
    expect(classesOf(section)).toContain("py-16");
    expect(classesOf(inner)).toContain("w-full");
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
  it("app/layout.tsx ne rend plus <Nav/> (pied de page retiré par PFO-54, bouton de thème par PFO-55)", () => {
    const layout = source("app/layout.tsx");
    const body = layout.slice(layout.indexOf("<body"), layout.indexOf("</body>"));
    expect(body).not.toContain("<Nav");
    expect(layout).not.toMatch(/import \{ Nav \}/);
  });
});

describe("Bas de colonne : liens sociaux (PFO-30 ; bouton de thème retiré par PFO-55)", () => {
  it("place les liens GitHub, LinkedIn, Mail en bas de colonne, visibles en mobile ; aucun bouton de thème dans l'intro", () => {
    const { container } = render(<Intro />);
    const section = container.querySelector("section#intro")!;
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Développeur d'agents IA");

    expect(screen.queryByRole("button", { name: /thème/i, hidden: true })).toBeNull();

    const mail = screen.getByRole("link", { name: "Mail" });
    const list = mail.closest("ul")!;
    expect(classesOf(list.parentElement)).toEqual(expect.arrayContaining(["flex", "items-center"]));
    for (let el: Element | null = list; el && el !== section; el = el.parentElement) {
      expect(classesOf(el), `liens masqués par ${el.tagName}`).not.toContain("hidden");
    }
    expect(section.lastElementChild!.contains(list)).toBe(true);
  });
});

describe("Sortie du build : un seul menu sur l'accueil (PFO-29)", () => {
  const index = path.resolve(__dirname, "../../out/index.html");

  beforeAll(() => {
    // `next build` n'est relancé que si l'accueil manque ou porte encore le menu du haut (deux menus).
    const stale = !existsSync(index) || readFileSync(index, "utf8").split('aria-label="Sections"').length !== 2;
    if (stale) execFileSync("npx", ["next", "build"], { cwd: root, stdio: "pipe" });
  }, 120_000);

  it("out/index.html contient le menu une seule fois, sans entrée Contact", () => {
    const html = readFileSync(index, "utf8");
    expect(html.split('aria-label="Sections"')).toHaveLength(2);
    expect(html).not.toContain('href="/#contact"');
    expect(html).toContain('href="/#projets"');
  });
});
