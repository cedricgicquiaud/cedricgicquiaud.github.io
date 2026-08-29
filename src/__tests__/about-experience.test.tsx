import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadAbout, loadExperience } from "../../lib/content";

function tempContentDir(files: Record<string, string> = {}): string {
  const dir = mkdtempSync(path.join(tmpdir(), "content-"));
  for (const [name, body] of Object.entries(files)) {
    writeFileSync(path.join(dir, name), body);
  }
  return dir;
}

describe("lib/content — about", () => {
  it("lève une erreur explicite si about.md manque", () => {
    const dir = tempContentDir();
    expect(() => loadAbout(dir)).toThrow(/about\.md.*(manquant|introuvable)/i);
  });

  it("lève une erreur explicite si le frontmatter n'a pas de titre", () => {
    const dir = tempContentDir({ "about.md": "---\nauteur: x\n---\n\nUn paragraphe.\n" });
    expect(() => loadAbout(dir)).toThrow(/about\.md.*titre/i);
  });

  it("retourne le titre et le corps Markdown rendu en HTML", () => {
    const dir = tempContentDir({
      "about.md": "---\ntitre: À propos\n---\n\nPremier **paragraphe**.\n\nDeuxième.\n",
    });
    const about = loadAbout(dir);
    expect(about.titre).toBe("À propos");
    expect(about.html).toContain("<p>Premier <strong>paragraphe</strong>.</p>");
    expect(about.html.match(/<p>/g)).toHaveLength(2);
  });
});

describe("lib/content — experience", () => {
  it("lève une erreur explicite si experience.md manque ou n'a pas de titre", () => {
    expect(() => loadExperience(tempContentDir())).toThrow(/experience\.md.*(manquant|introuvable)/i);
    const dir = tempContentDir({ "experience.md": "---\nblocs: []\n---\n" });
    expect(() => loadExperience(dir)).toThrow(/experience\.md.*titre/i);
  });

  const experienceFile = (blocs: string) =>
    `---\ntitre: Expérience\nblocs:\n${blocs}---\n`;

  it("retourne les blocs avec période, rôle, secteur, description et tags", () => {
    const dir = tempContentDir({
      "experience.md": experienceFile(
        "  - periode: 2026\n    role: Constructeur\n    secteur: Logiciel\n    description: Des agents.\n    tags: [TypeScript, MCP]\n",
      ),
    });
    expect(loadExperience(dir).blocs).toEqual([
      {
        periode: "2026",
        role: "Constructeur",
        secteur: "Logiciel",
        description: "Des agents.",
        tags: ["TypeScript", "MCP"],
      },
    ]);
  });
});
