import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { corpsDe, loadFiche, loadFiches } from "../../lib/fiches";
import { syncFiches } from "../../scripts/sync-fiches.mjs";
import { SECTIONS_NOUVELLES } from "./helpers/fiche-complete";

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
    stack_detail: "\n  - categorie: Langage\n    outils: TypeScript",
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
${SECTIONS_NOUVELLES}
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

  it("purge de la destination les .md qui n'existent plus à la source", () => {
    const src = tempDir({ "alpha.md": fiche({ ordre: 1 }) });
    const dest = tempDir({ "vieille.md": "# Vieille\n", "notes.txt": "x" });
    expect(syncFiches(src, dest)).toBe(1);
    expect(readdirSync(dest).sort()).toEqual(["alpha.md", "notes.txt"]);
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

  // PFO-136 : la structure en huit sections ne se perd plus.
  it.each(["Problème", "Livrables", "Architecture", "Décisions", "Preuves", "Ce que j'en ai appris", "Artefacts"])(
    "refuse une fiche sans section « %s », en citant le fichier et la section",
    (titre) => {
      const sans = fiche({ ordre: 1 }).replace(new RegExp(`## ${titre}\\n[^]*?(?=## |$)`), "");
      expect(sans).not.toContain(`## ${titre}\n`);
      expect(() => syncFiches(tempDir({ "alpha.md": sans }), tempDir())).toThrow(new RegExp(`^alpha\\.md : .*${titre}`));
    },
  );

  it("refuse une section présente mais vide", () => {
    const vide = fiche({ ordre: 1 }).replace(/## Architecture\n[^]*?(?=## )/, "## Architecture\n\n");
    expect(() => syncFiches(tempDir({ "alpha.md": vide }), tempDir())).toThrow(/^alpha\.md : .*Architecture/);
  });

  it("refuse une fiche sans stack_detail", () => {
    const src = tempDir({ "alpha.md": fiche({ ordre: 1, stack_detail: undefined }) });
    expect(() => syncFiches(src, tempDir())).toThrow(/^alpha\.md : .*stack_detail/);
  });

  it("accepte une fiche sans « Ce que j'ai construit » : la section n'existe plus dans le gabarit", () => {
    const sans = fiche({ ordre: 1 }).replace(/## Ce que j'ai construit\n[^]*?(?=## )/, "");
    expect(syncFiches(tempDir({ "alpha.md": sans }), tempDir())).toBe(1);
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
      depotNote: "https://github.com/x/alpha",
      demo: "https://alpha.example",
      demoNote: "https://alpha.example",
      ordre: 1,
    });
    expect(fiches[2].frontmatter.ordre).toBeUndefined();
  });

  it("découpe stack sur les virgules hors parenthèses seulement", () => {
    const dir = tempDir({
      "alpha.md": fiche({ ordre: 1, stack: "Linear (tableau de bord, API GraphQL + MCP), GitHub (branches, PR), Vitest" }),
    });
    expect(loadFiches(dir)[0].frontmatter.stack).toEqual([
      "Linear (tableau de bord, API GraphQL + MCP)",
      "GitHub (branches, PR)",
      "Vitest",
    ]);
  });

  it("ne garde depot et demo que s'ils sont des URL http(s) ; la prose va dans depotNote / demoNote", () => {
    const dir = tempDir({
      "alpha.md": fiche({ ordre: 1, depot: "à venir (nouveau dépôt public)", demo: "https://alpha.example" }),
    });
    const { frontmatter } = loadFiches(dir)[0];
    expect(frontmatter.depot).toBe("");
    expect(frontmatter.depotNote).toBe("à venir (nouveau dépôt public)");
    expect(frontmatter.demo).toBe("https://alpha.example");
    expect(frontmatter.demoNote).toBe("https://alpha.example");
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

  it("corpsDe : les sections présentes et non vides, dans l'ordre de la page (PFO-136)", () => {
    const [f] = loadFiches(tempDir({ "alpha.md": fiche({ ordre: 1 }) }));
    expect(corpsDe(f).map((s) => [s.id, s.titre])).toEqual([
      ["probleme", "Problème"],
      ["livrables", "Livrables"],
      ["construit", "Ce que j'ai construit"],
      ["architecture", "Architecture"],
      ["decisions", "Décisions"],
      ["preuves", "Preuves"],
      ["appris", "Ce que j'en ai appris"],
      ["artefacts", "Artefacts"],
    ]);
    const [g] = loadFiches(tempDir({ "alpha.md": fiche({ ordre: 1 }).replace(/## Ce que j'ai construit\n[^]*?(?=## )/, "") }));
    expect(corpsDe(g).map((s) => s.id)).not.toContain("construit");
  });

  it("vide depot et demo d'une fiche « anonyme », quoi qu'en dise le fichier", () => {
    const [f] = loadFiches(
      tempDir({ "ben.md": fiche({ ordre: 1, visibilite: "anonyme", depot: "https://github.com/x/secret", demo: "https://secret.example" }) }),
    );
    expect(f.frontmatter.visibilite).toBe("anonyme");
    expect(f.frontmatter.depot).toBe("");
    expect(f.frontmatter.demo).toBe("");
  });
});

describe("lib/fiches — vraies fiches copiées dans content/fiches", () => {
  const contentDir = path.resolve(__dirname, "../../content/fiches");

  it("renvoie 12 fiches, ordre 1..12 distincts, chacune retrouvable par loadFiche(slug)", () => {
    const fiches = loadFiches(contentDir);
    expect(fiches).toHaveLength(12);
    expect(fiches.map((f) => f.frontmatter.ordre)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    for (const f of fiches) {
      expect(f.titre).not.toBe("");
      expect(f.enBref.quoi).not.toBe("");
      // PFO-136 : les huit sections de la page, Stack technique comprise.
      // PFO-147 : PILOT a en plus la section facultative « La méthode », entre Livrables et Architecture.
      const methode = f.slug === "pilot" ? ["methode"] : [];
      expect(corpsDe(f).map((s) => s.id)).toEqual(["probleme", "livrables", ...methode, "architecture", "decisions", "preuves", "appris", "artefacts"]);
      expect(corpsDe(f).every((s) => s.html !== "")).toBe(true);
      expect(f.stackDetail?.length).toBeGreaterThan(0);
      expect(loadFiche(f.slug, contentDir)).toEqual(f);
    }
  });

  it("ne renvoie aucun chemin absolu ni le nom du dossier parent", () => {
    const json = JSON.stringify(loadFiches(contentDir));
    expect(json).not.toContain("WATIDO");
    expect(json).not.toMatch(/(^|[^\w:])\/(Users|home|tmp|private)\//);
    expect(json).not.toContain(contentDir);
  });
});
