import { mkdtempSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { syncFiches } from "../../scripts/sync-fiches.mjs";

/** Une fiche factice complète ; `front` surcharge le frontmatter, `body` le corps. */
function fiche(front: Record<string, unknown> = {}, body?: string): string {
  const data: Record<string, unknown> = {
    nom: "Alpha",
    statut: "en cours",
    periode: "2026",
    role: "développement",
    stack: "TypeScript, Vitest",
    visibilite: "public",
    depot: "https://github.com/x/alpha",
    demo: "https://alpha.example",
    ...front,
  };
  const lines = Object.entries(data)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k}: ${v}`);
  const corps =
    body ??
    `# Alpha — un titre

**En bref.** Un outil qui fait une chose. 12 tests verts. Code public.

## Problème

Le problème.

## Ce que j'ai construit

La construction.

## Preuves

Les preuves.

## Ce que j'en ai appris

Les leçons.

## Artefacts

- Dépôt : https://github.com/x/alpha
`;
  return `---\n${lines.join("\n")}\n---\n\n${corps}`;
}

function tempDir(files: Record<string, string> = {}): string {
  const dir = mkdtempSync(path.join(tmpdir(), "fiches-"));
  for (const [name, body] of Object.entries(files)) writeFileSync(path.join(dir, name), body);
  return dir;
}

describe("sync-fiches — copie", () => {
  it("copie les fichiers .md et renvoie leur nombre", () => {
    const src = tempDir({
      "alpha.md": fiche({ nom: "Alpha", ordre: 1 }),
      "beta.md": fiche({ nom: "Beta", ordre: 2 }),
    });
    const dest = tempDir();
    expect(syncFiches(src, dest)).toBe(2);
    expect(readdirSync(dest).sort()).toEqual(["alpha.md", "beta.md"]);
  });
});
