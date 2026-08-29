import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Portrait } from "../../components/portrait";

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
