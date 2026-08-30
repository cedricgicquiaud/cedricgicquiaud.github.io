import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import Home from "../../app/page";
import { Intro } from "../../components/intro";
import { Portrait } from "../../components/portrait";

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
