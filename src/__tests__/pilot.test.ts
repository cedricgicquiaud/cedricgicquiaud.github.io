import { readFileSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";

// PFO-87 (09/10) : la méthode PILOT a son dépôt public ; la démo reste hors fiche tant qu'elle n'est pas auditée.
const FICHE = path.join(__dirname, "../../content/fiches/pilot.md");

describe("Fiche PILOT (PFO-87)", () => {
  const { data, content } = matter(readFileSync(FICHE, "utf8"));

  it("lie le dépôt public pilot-method", () => {
    expect(data.visibilite).toBe("public");
    expect(data.depot).toBe("https://github.com/cedricgicquiaud/pilot-method");
  });

  it("ne déclare pas de démo", () => {
    expect(data.demo ?? "").toBe("");
  });

  it("s'intitule « workflow agentique » (PFO-88)", () => {
    expect(content).toMatch(/^# PILOT — workflow agentique$/m);
    expect(content).toMatch(/\*\*En bref\.\*\* Un workflow agentique : /);
  });

  it("ne promet plus rien « à venir », « à ouvrir » ni « à faire »", () => {
    expect(content).not.toMatch(/à venir|à ouvrir|à publier|à faire/);
  });
});
