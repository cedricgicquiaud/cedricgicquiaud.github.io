import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import Home from "../../app/page";
import { Intro } from "../../components/intro";
import { Nav } from "../../components/nav";
import { Portrait } from "../../components/portrait";
import { ThemeToggle } from "../../components/theme-toggle";

afterEach(() => {
  cleanup();
  document.documentElement.removeAttribute("data-theme");
});

const classesOf = (el: Element | null | undefined) => (el?.className ?? "").split(/\s+/).filter(Boolean);

describe("Portrait dans la colonne gauche (PFO-37)", () => {
  it("rend le portrait dans l'intro, sous le h1, en 160 px", () => {
    const { container } = render(<Intro />);
    const section = container.querySelector("section#intro")!;
    const img = screen.getByRole("img", { name: /^Portrait de / });
    expect(section.contains(img)).toBe(true);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1.compareDocumentPosition(img) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(classesOf(img.parentElement)).toContain("w-40");
    expect(classesOf(img.parentElement)).not.toContain("sm:w-48");
  });

  it("accepte une taille réduite ; la taille par défaut reste w-40 sm:w-48", () => {
    const { container, unmount } = render(<Portrait photoExists={false} size="sm" />);
    expect(container.querySelector("section#portrait"), "plus de section propre en taille réduite").toBeNull();
    expect(classesOf(screen.getByRole("img").parentElement)).toEqual(expect.arrayContaining(["w-40", "rounded-lg"]));
    unmount();
    render(<Portrait photoExists={false} />);
    expect(classesOf(screen.getByRole("img").parentElement)).toEqual(expect.arrayContaining(["w-40", "sm:w-48"]));
  });

  it("ne rend plus le portrait dans la colonne droite de l'accueil", () => {
    const { container } = render(<Home />);
    const sticky = container.querySelector(".lg\\:sticky")!;
    const right = sticky.nextElementSibling as HTMLElement;
    expect(within(right).queryByRole("img", { name: /^Portrait de / })).toBeNull();
    expect(Array.from(right.querySelectorAll("section[id]")).map((s) => s.id)).toEqual(["a-propos", "experience", "projets"]);
    expect(within(sticky as HTMLElement).getByRole("img", { name: /^Portrait de / })).toBeInTheDocument();
  });
});

describe("Quadrillage sur toute la page (PFO-38)", () => {
  const root = path.resolve(__dirname, "../..");
  const source = (rel: string) => readFileSync(path.join(root, rel), "utf8");

  it("body porte bg-grid dans app/layout.tsx ; l'intro ne le porte plus", () => {
    const layout = source("app/layout.tsx");
    const bodyTag = layout.slice(layout.indexOf("<body"), layout.indexOf(">", layout.indexOf("<body")));
    expect(bodyTag).toMatch(/className="[^"]*\bbg-grid\b/);
    const { container } = render(<Intro />);
    expect(container.querySelector("section#intro")).not.toHaveClass("bg-grid");
  });

  it("bg-grid dessine le quadrillage avec --grid-line, défini dans les trois blocs de thème", () => {
    const css = source("app/globals.css");
    const rule = css.slice(css.indexOf("@utility bg-grid"), css.indexOf("}", css.indexOf("@utility bg-grid")));
    expect(rule).toContain("var(--grid-line)");
    expect(rule).not.toMatch(/background-attachment/);
    expect(css.match(/--grid-line:/g)).toHaveLength(3);
  });
});

describe("Entrée active du menu au chargement (PFO-41)", () => {
  function stubObserverThatNeverFires() {
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        observe() {}
        disconnect() {}
        unobserve() {}
      },
    );
  }

  function renderNavWithTops(tops: Record<string, number>) {
    const utils = render(
      <>
        <Nav />
        <main>
          {Object.keys(tops).map((id) => (
            <section key={id} id={id} />
          ))}
        </main>
      </>,
    );
    return utils;
  }

  function stubRects(tops: Record<string, number>) {
    vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {
      return { top: tops[this.id] ?? 0 } as DOMRect;
    });
  }

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("au montage, sans événement d'observer, active la section dont le haut est le plus proche de la bande centrale", () => {
    stubObserverThatNeverFires();
    vi.stubGlobal("innerHeight", 1000);
    // Bande centrale : 40 % du haut → 400 px. Expérience (380) est la plus proche.
    stubRects({ "a-propos": -500, experience: 380, projets: 1300 });
    renderNavWithTops({ "a-propos": 0, experience: 0, projets: 0 });
    expect(screen.getByRole("link", { name: "Expérience" })).toHaveAttribute("aria-current", "location");
    expect(screen.getByRole("link", { name: "À propos" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("link", { name: "Projets" })).not.toHaveAttribute("aria-current");
  });

  it("donne le même résultat à chaque rendu (déterministe au rechargement)", () => {
    stubObserverThatNeverFires();
    vi.stubGlobal("innerHeight", 1000);
    stubRects({ "a-propos": 96, experience: 900, projets: 1700 });
    for (let i = 0; i < 3; i++) {
      const { unmount } = renderNavWithTops({ "a-propos": 0, experience: 0, projets: 0 });
      expect(screen.getByRole("link", { name: "À propos" })).toHaveAttribute("aria-current", "location");
      unmount();
    }
  });
});

describe("Libellé du bouton de thème (PFO-18)", () => {
  function stubStorage() {
    vi.stubGlobal("localStorage", { getItem: () => null, setItem: () => {}, removeItem: () => {} });
  }

  it("annonce « Passer en thème sombre » en clair et « Passer en thème clair » en sombre ; texte « Thème » constant", () => {
    stubStorage();
    vi.stubGlobal("matchMedia", () => ({ matches: false }));
    render(<ThemeToggle />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-label", "Passer en thème sombre");
    expect(button).toHaveTextContent(/^Thème$/);

    fireEvent.click(button);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(button).toHaveAttribute("aria-label", "Passer en thème clair");
    expect(button).toHaveTextContent(/^Thème$/);

    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-label", "Passer en thème sombre");
    expect(button).toHaveTextContent(/^Thème$/);
  });

  it("ne porte pas aria-pressed : bouton d'action au libellé variable, pas un bouton bascule", () => {
    stubStorage();
    vi.stubGlobal("matchMedia", () => ({ matches: false }));
    render(<ThemeToggle />);
    const button = screen.getByRole("button");
    expect(button).not.toHaveAttribute("aria-pressed");
    fireEvent.click(button);
    expect(button).not.toHaveAttribute("aria-pressed");
  });

  it("suit le thème système quand aucun data-theme n'est posé", () => {
    stubStorage();
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    render(<ThemeToggle />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-label", "Passer en thème clair");
  });
});
