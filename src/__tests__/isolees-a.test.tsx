import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
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
