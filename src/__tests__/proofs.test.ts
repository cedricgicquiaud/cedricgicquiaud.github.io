import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { cleanup, render } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { Fiche } from "../../components/fiche";
import { Projects } from "../../components/projects";
import { loadFiche } from "../../lib/fiches";
import { buildProofs } from "../../lib/proofs";

afterEach(cleanup);

// PFO-112 : proofs.json assemblé depuis les fiches et le parcours.

/** Une fiche Markdown minimale ; `front` complète ou remplace le frontmatter. */
function ficheMd(nom: string, front: Record<string, string | number> = {}, corps = ""): string {
  const fm = { nom, statut: "en cours", periode: "2026", role: "conception", stack: "TypeScript", visibilite: "public", ...front };
  const lignes = Object.entries(fm).map(([k, v]) => `${k}: ${v}`);
  return ["---", ...lignes, "---", "", `# ${nom}`, "", corps].join("\n");
}

/** Un dossier de fiches temporaire : `{ "alpha.md": "…", "archives/x.md": "…" }`. */
function fichesDir(fichiers: Record<string, string>): string {
  const dir = mkdtempSync(path.join(tmpdir(), "proofs-"));
  for (const [nom, contenu] of Object.entries(fichiers)) {
    mkdirSync(path.dirname(path.join(dir, nom)), { recursive: true });
    writeFileSync(path.join(dir, nom), contenu);
  }
  return dir;
}

describe("buildProofs — les fiches (PFO-112)", () => {
  it("liste les fiches par `ordre`, puis sans ordre en dernier", () => {
    const dir = fichesDir({
      "alpha.md": ficheMd("Alpha", { ordre: 2 }),
      "beta.md": ficheMd("Beta", { ordre: 1 }),
      "gamma.md": ficheMd("Gamma"),
    });
    expect(buildProofs({ fichesDir: dir }).fiches.map((f) => f.slug)).toEqual(["beta", "alpha", "gamma"]);
  });

  it("donne les fiches des cartes de l'accueil, dans le même ordre, chacune avec l'URL absolue de sa page", () => {
    const { container } = render(createElement(Projects));
    const cartes = Array.from(container.querySelectorAll("h3 a")).map((a) => `https://cedricgicquiaud.github.io${a.getAttribute("href")}`);
    expect(cartes).toHaveLength(8);
    expect(buildProofs().fiches.map((f) => f.url)).toEqual(cartes);
  });

  it("donne nom, période, rôle, stack, visibilité, dépôt et démo de la fiche", () => {
    const dir = fichesDir({
      "alpha.md": ficheMd("Alpha", {
        periode: "mai 2026 → aujourd'hui",
        role: "conception — seul",
        stack: "TypeScript, React (Next, Vite), Vitest",
        depot: "https://github.com/x/alpha",
        demo: "https://alpha.giveme5xxxxx.fr",
      }),
    });
    expect(buildProofs({ fichesDir: dir }).fiches[0]).toMatchObject({
      nom: "Alpha",
      periode: "mai 2026 → aujourd'hui",
      role: "conception — seul",
      stack: ["TypeScript", "React (Next, Vite)", "Vitest"],
      visibilite: "public",
      depot: "https://github.com/x/alpha",
      demo: "https://alpha.giveme5xxxxx.fr",
    });
  });

  it("donne les chiffres clés de la fiche, une liste vide sans champ `chiffres`", () => {
    const avec = ficheMd("Alpha").replace("---\n\n", 'chiffres:\n  - valeur: "500"\n    libelle: vraies API passées\n---\n\n');
    const dir = fichesDir({ "alpha.md": avec, "beta.md": ficheMd("Beta") });
    expect(buildProofs({ fichesDir: dir }).fiches.map((f) => f.chiffres)).toEqual([[{ valeur: "500", libelle: "vraies API passées" }], []]);
  });

  it("donne les captures avec leur légende et leur URL absolue, une liste vide sans captures", () => {
    const avec = ficheMd("Alpha").replace(
      "---\n\n",
      "captures:\n  - fichier: /projets/alpha/accueil.webp\n    legende: L'accueil, données fictives\n---\n\n",
    );
    const dir = fichesDir({ "alpha.md": avec, "beta.md": ficheMd("Beta") });
    expect(buildProofs({ fichesDir: dir }).fiches.map((f) => f.captures)).toEqual([
      [{ legende: "L'accueil, données fictives", url: "https://cedricgicquiaud.github.io/projets/alpha/accueil.webp" }],
      [],
    ]);
  });

  it("donne les cinq sections en texte brut, Artefacts compris", () => {
    const corps = [
      "## Problème", "", "Un **vrai** besoin.", "",
      "## Ce que j'ai construit", "", "Un outil.", "",
      "## Preuves", "", "- 3 clients.", "",
      "## Ce que j'en ai appris", "", "Tester avant.", "",
      "## Artefacts", "", "- [Le dépôt](https://github.com/x/alpha)",
    ].join("\n");
    const dir = fichesDir({ "alpha.md": ficheMd("Alpha", {}, corps) });
    expect(buildProofs({ fichesDir: dir }).fiches[0].sections).toEqual([
      { titre: "Problème", texte: "Un vrai besoin." },
      { titre: "Ce que j'ai construit", texte: "Un outil." },
      { titre: "Preuves", texte: "- 3 clients." },
      { titre: "Ce que j'en ai appris", texte: "Tester avant." },
      { titre: "Artefacts", texte: "- Le dépôt (https://github.com/x/alpha)" },
    ]);
  });

  it("refuse une valeur non-URL : SLICE (« à venir… ») sort une démo vide", () => {
    const slice = buildProofs().fiches.find((f) => f.slug === "slice");
    expect(slice?.demo).toBe("");
    expect(Object.values(slice ?? {})).not.toContain("à venir (mise en ligne prévue)");
  });

  it("refuse les liens d'une fiche anonyme, même déclarés dans la source", () => {
    const dir = fichesDir({
      "coach.md": ficheMd("Coach", { visibilite: "anonyme", depot: "https://github.com/x/coach", demo: "https://coach.giveme5xxxxx.fr" }),
    });
    expect(buildProofs({ fichesDir: dir }).fiches[0]).toMatchObject({ depot: "", demo: "" });
  });

  it("refuse une fiche rangée dans archives/", () => {
    const dir = fichesDir({ "alpha.md": ficheMd("Alpha"), "archives/foreman.md": ficheMd("Foreman") });
    expect(buildProofs({ fichesDir: dir }).fiches.map((f) => f.slug)).toEqual(["alpha"]);
  });

  it("reprend mot pour mot l'accroche En bref de la page de chaque fiche", () => {
    for (const { slug, enBref } of buildProofs().fiches) {
      const { container, unmount } = render(createElement(Fiche, { fiche: loadFiche(slug) }));
      const accroche = container.querySelector("h1 + p")?.textContent;
      unmount();
      expect(accroche, slug).toBeTruthy();
      expect(enBref, slug).toBe(accroche);
    }
  });
});

describe("buildProofs — l'en-tête (PFO-112)", () => {
  it("présente la personne, ses liens, l'URL du site et la version du format", () => {
    expect(buildProofs()).toMatchObject({
      version: "1.0",
      nom: "Cédric Gicquiaud",
      titre: "Je transforme un besoin métier en application opérationnelle, en faisant coder des agents IA sous contrôle.",
      email: "cedric.gicquiaud@gmail.com",
      github: "https://github.com/cedricgicquiaud",
      linkedin: "https://www.linkedin.com/in/cedric-gicquiaud/",
      url: "https://cedricgicquiaud.github.io",
    });
  });
});
