import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Intro } from "../../components/intro";

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
