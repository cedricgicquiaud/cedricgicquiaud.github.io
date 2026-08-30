import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadFiches } from "../../lib/fiches";
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

  it("ne copie jamais PLAN.md, REPOS.md ni AUDIT.md", () => {
    const src = tempDir({
      "alpha.md": fiche({ ordre: 1 }),
      "PLAN.md": "# Plan\n",
      "REPOS.md": "# Dépôts\n",
      "AUDIT.md": "# Audit\n",
    });
    const dest = tempDir();
    expect(syncFiches(src, dest)).toBe(1);
    expect(readdirSync(dest)).toEqual(["alpha.md"]);
  });
});

describe("sync-fiches — contrôle du frontmatter", () => {
  it.each(["nom", "statut", "visibilite"])("refuse une fiche sans « %s » en citant le fichier", (champ) => {
    const src = tempDir({ "alpha.md": fiche({ ordre: 1, [champ]: undefined }) });
    expect(() => syncFiches(src, tempDir())).toThrow(new RegExp(`^alpha\\.md : .*${champ}`));
  });

  it("refuse une visibilite hors public / vitrine / anonyme", () => {
    const src = tempDir({ "alpha.md": fiche({ ordre: 1, visibilite: "secret" }) });
    expect(() => syncFiches(src, tempDir())).toThrow(/^alpha\.md : .*visibilite/);
  });

  it("refuse une fiche sans bloc « En bref » après le titre", () => {
    const src = tempDir({
      "alpha.md": fiche({ ordre: 1 }, "# Alpha\n\nUn paragraphe sans bloc.\n\n## Problème\n\nX.\n"),
    });
    expect(() => syncFiches(src, tempDir())).toThrow(/^alpha\.md : .*En bref/);
  });

  it("refuse deux fiches avec le même « ordre »", () => {
    const src = tempDir({ "alpha.md": fiche({ ordre: 1 }), "beta.md": fiche({ nom: "Beta", ordre: 1 }) });
    expect(() => syncFiches(src, tempDir())).toThrow(/^beta\.md : .*ordre.*1.*alpha\.md/);
  });

  it("refuse un « ordre » qui n'est pas un entier", () => {
    const src = tempDir({ "alpha.md": fiche({ ordre: "premier" }) });
    expect(() => syncFiches(src, tempDir())).toThrow(/^alpha\.md : .*ordre/);
  });
});

describe("sync-fiches — ligne de commande", () => {
  const script = path.resolve(__dirname, "../../scripts/sync-fiches.mjs");
  const run = (src: string, dest: string) =>
    execFileSync("node", [script, dest], { env: { ...process.env, FICHES_DIR: src }, encoding: "utf8" });

  it("lit FICHES_DIR et affiche « N fiches synchronisées »", () => {
    const src = tempDir({ "alpha.md": fiche({ ordre: 1 }), "beta.md": fiche({ nom: "Beta", ordre: 2 }) });
    const dest = tempDir();
    expect(run(src, dest).trim()).toBe("2 fiches synchronisées");
    expect(readdirSync(dest).sort()).toEqual(["alpha.md", "beta.md"]);
  });

  it("sort en code 1 avec « <fichier> : <raison> » sur une fiche non conforme", () => {
    const src = tempDir({ "alpha.md": fiche({ ordre: 1, statut: undefined }) });
    const dest = tempDir();
    let error: { status?: number; stderr?: string } | undefined;
    try {
      run(src, dest);
    } catch (e) {
      error = e as { status?: number; stderr?: string };
    }
    expect(error?.status).toBe(1);
    expect(error?.stderr).toMatch(/alpha\.md : .*statut/);
    expect(readdirSync(dest)).toEqual([]);
  });
});

describe("lib/fiches — loadFiches", () => {
  it("trie par ordre puis nom, les fiches sans ordre en dernier, avec slug, titre et frontmatter typé", () => {
    const dir = tempDir({
      "zeta.md": fiche({ nom: "Zeta", ordre: 2 }),
      "alpha.md": fiche({ nom: "Alpha", ordre: 1 }),
      "mu.md": fiche({ nom: "Mu", ordre: undefined }),
      "kappa.md": fiche({ nom: "Kappa", ordre: undefined }),
    });
    const fiches = loadFiches(dir);
    expect(fiches.map((f) => f.slug)).toEqual(["alpha", "zeta", "kappa", "mu"]);
    expect(fiches[0].titre).toBe("Alpha — un titre");
    expect(fiches[0].frontmatter).toEqual({
      nom: "Alpha",
      statut: "en cours",
      periode: "2026",
      role: "développement",
      stack: ["TypeScript", "Vitest"],
      visibilite: "public",
      depot: "https://github.com/x/alpha",
      demo: "https://alpha.example",
      ordre: 1,
    });
    expect(fiches[2].frontmatter.ordre).toBeUndefined();
  });

  it("découpe le bloc En bref en trois phrases : quoi, chiffre, lien", () => {
    const dir = tempDir({
      "alpha.md": fiche(
        { ordre: 1 },
        "# Alpha\n\n**En bref.** Un service web qui transforme une API\nen connecteur. 556 tests, 500 API passées. Code public, démo à venir.\n\n## Problème\n\nX.\n",
      ),
    });
    expect(loadFiches(dir)[0].enBref).toEqual({
      quoi: "Un service web qui transforme une API en connecteur.",
      chiffre: "556 tests, 500 API passées.",
      lien: "Code public, démo à venir.",
    });
  });

  it("renvoie les cinq sections du gabarit dans l'ordre, en HTML", () => {
    const [f] = loadFiches(tempDir({ "alpha.md": fiche({ ordre: 1 }) }));
    expect(f.sections.map((s) => [s.id, s.titre])).toEqual([
      ["probleme", "Problème"],
      ["construit", "Ce que j'ai construit"],
      ["preuves", "Preuves"],
      ["appris", "Ce que j'en ai appris"],
      ["artefacts", "Artefacts"],
    ]);
    expect(f.sections[0].html).toBe("<p>Le problème.</p>");
    expect(f.sections[4].html).toContain('<a href="https://github.com/x/alpha">');
    expect(f.sections[4].html).not.toContain("<h2");
  });
});
