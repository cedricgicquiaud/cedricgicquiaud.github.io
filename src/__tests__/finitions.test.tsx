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
