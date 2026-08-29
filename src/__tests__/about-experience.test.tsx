import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadAbout } from "../../lib/content";

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
});
