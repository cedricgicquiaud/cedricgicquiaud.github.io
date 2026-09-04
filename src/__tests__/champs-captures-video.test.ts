import { mkdirSync, mkdtempSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadFiche } from "../../lib/fiches";
import { syncFiches } from "../../scripts/sync-fiches.mjs";

/** Une fiche factice minimale ; `front` : lignes YAML ajoutées au frontmatter. */
const fiche = (front = "") => `---
nom: Alpha
statut: en cours
visibilite: public
${front}---

# Alpha — un titre

**En bref.** Un outil. 120 tests. Code public.
`;

/** Un dossier temporaire avec `fiches/alpha.md` et un `public/` vide. */
function sandbox(front = "") {
  const dir = mkdtempSync(path.join(tmpdir(), "champs-"));
  const fiches = path.join(dir, "fiches");
  const pub = path.join(dir, "public");
  mkdirSync(fiches);
  mkdirSync(pub);
  writeFileSync(path.join(fiches, "alpha.md"), fiche(front));
  return { fiches, pub };
}

/** Charge la fiche `alpha` dont le frontmatter est complété par `front`. */
function load(front = "") {
  const { fiches, pub } = sandbox(front);
  return loadFiche("alpha", fiches, pub);
}

describe("loadFiche — champ captures (PFO-56)", () => {
  it("expose les captures déclarées dans l'ordre, avec fichier et legende", () => {
    const front = `captures:
  - fichier: /projets/alpha/a.png
    legende: L'écran d'accueil
  - fichier: /projets/alpha/b.png
    legende: Le rapport
`;
    expect(load(front).captures).toEqual([
      { fichier: "/projets/alpha/a.png", legende: "L'écran d'accueil" },
      { fichier: "/projets/alpha/b.png", legende: "Le rapport" },
    ]);
  });

  it("expose une liste vide quand la fiche ne déclare pas de captures", () => {
    expect(load().captures).toEqual([]);
  });

  it("refuse une entrée sans fichier en nommant la fiche et le rang de l'entrée", () => {
    const front = `captures:
  - fichier: /projets/alpha/a.png
    legende: L'écran d'accueil
  - legende: Le rapport
`;
    expect(() => load(front)).toThrow(/alpha.*captures.*entrée 2.*fichier/);
  });

  it.each([
    ["absente", "  - fichier: /projets/alpha/b.png\n"],
    ["vide", "  - fichier: /projets/alpha/b.png\n    legende: \"\"\n"],
    ["faite d'espaces", "  - fichier: /projets/alpha/b.png\n    legende: \"   \"\n"],
  ])("refuse une entrée à légende %s en nommant la fiche et le rang de l'entrée", (_, entry) => {
    const front = `captures:
  - fichier: /projets/alpha/a.png
    legende: L'écran d'accueil
${entry}`;
    expect(() => load(front)).toThrow(/alpha.*captures.*entrée 2.*legende/);
  });

  it.each([
    ["qui sort de public/ (../)", "/../outside.png"],
    ["sans / initial", "projets/alpha/a.png"],
  ])("refuse un fichier %s en nommant la fiche et le rang de l'entrée", (_, fichier) => {
    const front = `captures:
  - fichier: ${fichier}
    legende: L'écran d'accueil
`;
    expect(() => load(front)).toThrow(/alpha.*captures.*entrée 1.*fichier/);
  });

  it("refuse un fichier protocole-relatif (//cdn…) en nommant la fiche et le rang (aucun fichier depuis un domaine tiers)", () => {
    const front = `captures:
  - fichier: //cdn.example/a.png
    legende: L'écran d'accueil
`;
    expect(() => load(front)).toThrow(/alpha.*captures.*entrée 1.*domaine tiers/);
  });
});

describe("loadFiche — champ visuel (PFO-59)", () => {
  it("refuse un visuel protocole-relatif (//cdn…) en nommant la fiche (aucun fichier depuis un domaine tiers)", () => {
    expect(() => load("visuel: //cdn.example/alpha.png\n")).toThrow(/alpha.*visuel.*domaine tiers/);
  });
});

describe("loadFiche — champ video (PFO-57)", () => {
  it("expose la vidéo déclarée avec fichier et duree", () => {
    const front = `video:
  fichier: /projets/alpha/demo.mp4
  duree: 2 min
`;
    expect(load(front).video).toEqual({ fichier: "/projets/alpha/demo.mp4", duree: "2 min" });
  });

  it("expose undefined quand la fiche ne déclare pas de vidéo", () => {
    expect(load().video).toBeUndefined();
  });

  it.each(["http://videos.example/demo.mp4", "https://videos.example/demo.mp4"])(
    "refuse un fichier en %s en nommant la fiche (aucune vidéo depuis un domaine tiers)",
    (fichier) => {
      const front = `video:
  fichier: ${fichier}
  duree: 2 min
`;
      expect(() => load(front)).toThrow(/alpha.*video.*fichier.*domaine tiers/);
    },
  );

  it("refuse un fichier protocole-relatif (//cdn…) en nommant la fiche (aucun fichier depuis un domaine tiers)", () => {
    const front = `video:
  fichier: //cdn.example/demo.mp4
  duree: 2 min
`;
    expect(() => load(front)).toThrow(/alpha.*video.*domaine tiers/);
  });

  it.each([
    ["absent", ""],
    ["qui sort de public/ (../)", "/../demo.mp4"],
    ["sans / initial", "projets/alpha/demo.mp4"],
  ])("refuse un fichier %s en nommant la fiche", (_, fichier) => {
    const front = `video:
  ${fichier ? `fichier: ${fichier}\n  ` : ""}duree: 2 min
`;
    expect(() => load(front)).toThrow(/alpha.*video.*fichier/);
  });

  it.each([
    ["absente", ""],
    ["en toutes lettres (deux minutes)", "deux minutes"],
    ["sans unité (2)", "2"],
    ["avec une unité inconnue (2 h)", "2 h"],
  ])("refuse une durée %s en nommant la fiche (attendu : « N min » ou « N s »)", (_, duree) => {
    const front = `video:
  fichier: /projets/alpha/demo.mp4
${duree ? `  duree: "${duree}"\n` : ""}`;
    expect(() => load(front)).toThrow(/alpha.*video.*duree/);
  });

  it("accepte une durée en secondes (« 45 s »)", () => {
    const front = `video:
  fichier: /projets/alpha/demo.mp4
  duree: 45 s
`;
    expect(load(front).video?.duree).toBe("45 s");
  });
});

describe("sync-fiches — captures et video (PFO-58)", () => {
  /** Un dossier de fiches avec `alpha.md` (frontmatter complété par `front`) et un dossier de destination vide. */
  function dirs(front = "") {
    const { fiches } = sandbox(front);
    const dest = mkdtempSync(path.join(tmpdir(), "champs-dest-"));
    return { fiches, dest };
  }

  const CONFORME = `captures:
  - fichier: /projets/alpha/a.png
    legende: L'écran d'accueil
  - fichier: /projets/alpha/b.png
    legende: Le rapport
video:
  fichier: /projets/alpha/demo.mp4
  duree: 2 min
`;

  it("copie une fiche dont les captures et la vidéo sont conformes", () => {
    const { fiches, dest } = dirs(CONFORME);
    expect(syncFiches(fiches, dest)).toBe(1);
    expect(readdirSync(dest)).toEqual(["alpha.md"]);
  });

  it("refuse une fiche dont la 2e capture n'a pas de légende, en nommant la fiche et « entrée 2 », sans rien copier", () => {
    const { fiches, dest } = dirs(`captures:
  - fichier: /projets/alpha/a.png
    legende: L'écran d'accueil
  - fichier: /projets/alpha/b.png
`);
    expect(() => syncFiches(fiches, dest)).toThrow(/^alpha\.md : .*captures.*entrée 2.*legende/);
    expect(readdirSync(dest)).toEqual([]);
  });

  it.each([
    ["n'a pas de fichier", ""],
    ["a un fichier qui sort de public/ (../)", "    fichier: /../outside.png\n"],
    ["a un fichier sans / initial", "    fichier: projets/alpha/b.png\n"],
  ])("refuse une fiche dont la 2e capture %s, en nommant la fiche et « entrée 2 »", (_, fichier) => {
    const { fiches, dest } = dirs(`captures:
  - fichier: /projets/alpha/a.png
    legende: L'écran d'accueil
  - legende: Le rapport
${fichier}`);
    expect(() => syncFiches(fiches, dest)).toThrow(/^alpha\.md : .*captures.*entrée 2.*fichier/);
    expect(readdirSync(dest)).toEqual([]);
  });

  it("refuse une fiche dont la 2e capture a un fichier protocole-relatif (//cdn…), en nommant la fiche et « entrée 2 » (domaine tiers)", () => {
    const { fiches, dest } = dirs(`captures:
  - fichier: /projets/alpha/a.png
    legende: L'écran d'accueil
  - fichier: //cdn.example/b.png
    legende: Le rapport
`);
    expect(() => syncFiches(fiches, dest)).toThrow(/^alpha\.md : .*captures.*entrée 2.*domaine tiers/);
    expect(readdirSync(dest)).toEqual([]);
  });

  it.each([
    ["un fichier en https://", "  fichier: https://videos.example/demo.mp4\n  duree: 2 min\n", /domaine tiers/],
    ["un fichier protocole-relatif (//cdn…)", "  fichier: //cdn.example/demo.mp4\n  duree: 2 min\n", /domaine tiers/],
    ["un fichier sans / initial", "  fichier: projets/alpha/demo.mp4\n  duree: 2 min\n", /fichier/],
    ["une durée « deux minutes »", "  fichier: /projets/alpha/demo.mp4\n  duree: deux minutes\n", /duree/],
    ["une durée absente", "  fichier: /projets/alpha/demo.mp4\n", /duree/],
  ])("refuse une fiche dont la vidéo a %s, en nommant la fiche, sans rien copier", (_, video, raison) => {
    const { fiches, dest } = dirs(`video:\n${video}`);
    expect(() => syncFiches(fiches, dest)).toThrow(/^alpha\.md : .*video/);
    expect(() => syncFiches(fiches, dest)).toThrow(raison);
    expect(readdirSync(dest)).toEqual([]);
  });
});
