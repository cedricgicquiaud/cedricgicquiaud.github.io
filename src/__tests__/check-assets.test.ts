import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { checkAssets } from "../../scripts/check-assets.mjs";

const root = path.resolve(__dirname, "../..");
const script = path.join(root, "scripts", "check-assets.mjs");

/** Une fiche factice minimale ; `front` : lignes YAML ajoutées au frontmatter. */
const fiche = (front = "") => `---
nom: Alpha
statut: en cours
visibilite: public
${front}---

# Alpha — un titre

**En bref.** Un outil. 120 tests. Code public.
`;

/** Un dossier temporaire avec `fiches/alpha.md` et un `public/` vide ; `file` y écrit un fichier sous public/. */
function sandbox(front = "") {
  const dir = mkdtempSync(path.join(tmpdir(), "assets-"));
  const fiches = path.join(dir, "fiches");
  const pub = path.join(dir, "public");
  mkdirSync(fiches);
  mkdirSync(pub);
  writeFileSync(path.join(fiches, "alpha.md"), fiche(front));
  const file = (rel: string, content: Buffer) => {
    const full = path.join(pub, "." + rel);
    mkdirSync(path.dirname(full), { recursive: true });
    writeFileSync(full, content);
  };
  return { fiches, pub, file };
}

/** Un PNG minimal : signature + chunk IHDR (largeur, hauteur), complété d'octets nuls jusqu'à `size`. */
function png(width: number, height: number, size = 64) {
  const buf = Buffer.alloc(size);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(buf, 0);
  buf.writeUInt32BE(13, 8);
  buf.write("IHDR", 12, "ascii");
  buf.writeUInt32BE(width, 16);
  buf.writeUInt32BE(height, 20);
  return buf;
}

describe("checkAssets — existence des fichiers déclarés (PFO-60)", () => {
  it("ne rend aucun problème pour une fiche qui ne déclare aucun fichier", () => {
    const { fiches, pub } = sandbox();
    expect(checkAssets(fiches, pub)).toEqual([]);
  });

  it("ne rend aucun problème quand le visuel déclaré existe dans public/", () => {
    const { fiches, pub, file } = sandbox("visuel: /projets/alpha/visuel.png\n");
    file("/projets/alpha/visuel.png", png(1200, 750));
    expect(checkAssets(fiches, pub)).toEqual([]);
  });

  it("signale un visuel absent en nommant la fiche et le chemin", () => {
    const { fiches, pub } = sandbox("visuel: /projets/alpha/absent.png\n");
    const problems = checkAssets(fiches, pub);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toMatch(/^alpha\.md : visuel « \/projets\/alpha\/absent\.png » : absent de public\//);
  });

  it("signale une capture et une vidéo absentes en nommant la fiche, le champ et le chemin", () => {
    const front = `captures:
  - fichier: /projets/alpha/a.png
    legende: L'écran d'accueil
  - fichier: /projets/alpha/b.png
    legende: Le rapport
video:
  fichier: /projets/alpha/demo.mp4
  duree: 2 min
`;
    const { fiches, pub, file } = sandbox(front);
    file("/projets/alpha/a.png", png(800, 500));
    const problems = checkAssets(fiches, pub);
    expect(problems).toEqual([
      "alpha.md : captures, entrée 2 « /projets/alpha/b.png » : absent de public/",
      "alpha.md : video « /projets/alpha/demo.mp4 » : absent de public/",
    ]);
  });
});

const KO = 1024;

describe("checkAssets — poids des fichiers déclarés (PFO-60)", () => {
  it("accepte une capture de 300 Ko juste et refuse une capture de 300 Ko + 1 octet en donnant le poids", () => {
    const front = `captures:
  - fichier: /projets/alpha/a.png
    legende: L'écran d'accueil
  - fichier: /projets/alpha/b.png
    legende: Le rapport
`;
    const { fiches, pub, file } = sandbox(front);
    file("/projets/alpha/a.png", png(800, 500, 300 * KO));
    file("/projets/alpha/b.png", png(800, 500, 300 * KO + 1));
    expect(checkAssets(fiches, pub)).toEqual([
      "alpha.md : captures, entrée 2 « /projets/alpha/b.png » : 307201 octets, plafond 300 Ko (307200 octets)",
    ]);
  });
});

describe("scripts/check-assets.mjs en ligne de commande (PFO-60)", () => {
  it("sort en erreur avec la liste des problèmes quand un fichier déclaré manque, en succès sinon", () => {
    const bad = sandbox("visuel: /projets/alpha/absent.png\n");
    expect(() => execFileSync("node", [script, bad.fiches, bad.pub], { cwd: root, stdio: "pipe" })).toThrow(
      /alpha\.md : visuel « \/projets\/alpha\/absent\.png » : absent de public\//,
    );
    const good = sandbox("visuel: /projets/alpha/visuel.png\n");
    good.file("/projets/alpha/visuel.png", png(1200, 750));
    const stdout = execFileSync("node", [script, good.fiches, good.pub], { cwd: root, stdio: "pipe" });
    expect(String(stdout)).toContain("check-assets : ");
  });
});
