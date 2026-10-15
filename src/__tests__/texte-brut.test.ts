import { describe, expect, it } from "vitest";
import { texteBrut } from "../../lib/texte-brut";

// PFO-111 : le Markdown d'une section, lisible par un agent IA (D11).
const SITE = "https://cedricgicquiaud.github.io";

describe("texteBrut (PFO-111)", () => {
  it("retire le gras et garde les mots", () => {
    expect(texteBrut("Un **outil** qui marche.", SITE)).toBe("Un outil qui marche.");
  });
});
