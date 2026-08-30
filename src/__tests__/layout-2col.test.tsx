import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Home from "../../app/page";

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
