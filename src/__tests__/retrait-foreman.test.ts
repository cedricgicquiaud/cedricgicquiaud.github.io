import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// PFO-78 (07/10) : Foreman est abandonné, il sort du contenu publié.
const CONTENT = path.join(__dirname, "../../content");

describe("Retrait de Foreman (PFO-78)", () => {
  it("aucune fiche Foreman n'est synchronisée", () => {
    expect(readdirSync(path.join(CONTENT, "fiches"))).not.toContain("foreman.md");
  });

  it("la section Expérience ne cite plus Foreman", () => {
    expect(readFileSync(path.join(CONTENT, "experience.md"), "utf8")).not.toMatch(/foreman/i);
  });
});
