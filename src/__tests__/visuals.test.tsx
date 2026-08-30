import "@testing-library/jest-dom/vitest";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadFiche } from "../../lib/fiches";

const root = path.resolve(__dirname, "../..");

const FICHE = `---
nom: Alpha
statut: en cours
visibilite: public
---

# Alpha — un titre

**En bref.** Un outil. 120 tests. Code public.
`;

/** Un dossier temporaire avec `fiches/alpha.md` (frontmatter complété par `extra`) et un `public/` vide. */
function sandbox(extra = "") {
  const dir = mkdtempSync(path.join(tmpdir(), "visuals-"));
  const fiches = path.join(dir, "fiches");
  const pub = path.join(dir, "public");
  mkdirSync(fiches);
  mkdirSync(pub);
  writeFileSync(path.join(fiches, "alpha.md"), FICHE.replace("visibilite: public\n", `visibilite: public\n${extra}`));
  return { fiches, pub };
}

describe("loadFiche — champ visuel (PFO-35)", () => {
  it("sans champ visuel, expose le visuel généré /projets/generated/<slug>.png", () => {
    const { fiches, pub } = sandbox();
    expect(loadFiche("alpha", fiches, pub).visuel).toBe("/projets/generated/alpha.png");
  });

  it("avec un champ visuel qui pointe sur un fichier de public/, expose ce chemin", () => {
    const { fiches, pub } = sandbox("visuel: /projets/alpha.png\n");
    mkdirSync(path.join(pub, "projets"));
    writeFileSync(path.join(pub, "projets", "alpha.png"), "png");
    expect(loadFiche("alpha", fiches, pub).visuel).toBe("/projets/alpha.png");
  });

  it("avec un champ visuel qui pointe sur un fichier absent, retombe sur le généré sans erreur", () => {
    const { fiches, pub } = sandbox("visuel: /projets/absent.png\n");
    expect(loadFiche("alpha", fiches, pub).visuel).toBe("/projets/generated/alpha.png");
  });
});

/** Lance `scripts/project-visuals.mjs` sur un bac à sable (dossier des fiches, dossier public). */
const generate = (fiches: string, pub: string) =>
  execFileSync("node", [path.join(root, "scripts", "project-visuals.mjs"), fiches, pub], { cwd: root, stdio: "pipe" });

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47]);

describe("scripts/project-visuals.mjs (PFO-35)", () => {
  it("écrit public/projets/generated/<slug>.png (un vrai PNG) pour une fiche sans visuel fourni", { timeout: 30_000 }, () => {
    const { fiches, pub } = sandbox();
    generate(fiches, pub);
    const png = path.join(pub, "projets", "generated", "alpha.png");
    expect(existsSync(png)).toBe(true);
    expect(readFileSync(png).subarray(0, 4).equals(PNG_SIGNATURE)).toBe(true);
  });

  it("ne génère rien pour une fiche dont le visuel fourni existe", { timeout: 30_000 }, () => {
    const { fiches, pub } = sandbox("visuel: /projets/alpha.png\n");
    mkdirSync(path.join(pub, "projets"));
    writeFileSync(path.join(pub, "projets", "alpha.png"), "png");
    generate(fiches, pub);
    expect(existsSync(path.join(pub, "projets", "generated", "alpha.png"))).toBe(false);
  });
});

describe("branchement sur le build (PFO-35)", () => {
  it("npm run build génère les visuels avant next build, puis contrôle la sortie", () => {
    const { scripts } = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
    expect(scripts.build).toBe("node scripts/project-visuals.mjs && next build && node scripts/check-output.mjs");
  });

  it("les visuels générés ne sont pas versionnés", () => {
    expect(readFileSync(path.join(root, ".gitignore"), "utf8").split("\n")).toContain("public/projets/generated/");
  });
});
