import { existsSync } from "node:fs";
import path from "node:path";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Portrait } from "../../components/portrait";

const root = path.resolve(__dirname, "../..");

afterEach(cleanup);

describe("portrait bi-ton (PFO-12)", () => {
  it("rend une image avec un texte alternatif non vide", () => {
    render(<Portrait />);
    const img = screen.getByRole("img");
    expect(img.getAttribute("alt")?.trim()).toBeTruthy();
  });
});

describe("portrait bi-ton : filtre et fusion (PFO-12)", () => {
  it("applique grayscale + contraste à l'image et la fusionne sur un fond bleu token", () => {
    render(<Portrait />);
    const img = screen.getByRole("img");
    expect(img.className).toMatch(/\bgrayscale\b/);
    expect(img.className).toMatch(/\bcontrast-110\b/);
    expect(img.className).toMatch(/\bmix-blend-multiply\b/);
    expect(img.className).toMatch(/\bdark:mix-blend-screen\b/);
    expect(img.parentElement?.className).toMatch(/\bbg-primary\b/);
  });
});

describe("portrait : repli tant que la photo n'est pas fournie (PFO-12)", () => {
  it("sans public/portrait.jpg, affiche le cadre provisoire SVG", () => {
    render(<Portrait photoExists={false} />);
    expect(screen.getByRole("img").getAttribute("src")).toBe("/portrait-placeholder.svg");
    expect(existsSync(path.join(root, "public", "portrait-placeholder.svg"))).toBe(true);
  });

  it("avec public/portrait.jpg, affiche la photo", () => {
    render(<Portrait photoExists />);
    expect(screen.getByRole("img").getAttribute("src")).toBe("/portrait.jpg");
  });

  it("par défaut, décide d'après la présence réelle de public/portrait.jpg", () => {
    const onDisk = existsSync(path.join(root, "public", "portrait.jpg"));
    render(<Portrait />);
    const src = screen.getByRole("img").getAttribute("src");
    expect(src).toBe(onDisk ? "/portrait.jpg" : "/portrait-placeholder.svg");
  });
});
