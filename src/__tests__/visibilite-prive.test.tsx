import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { Fiche } from "../../components/fiche";
import { ProjectCard } from "../../components/project-card";
import { loadFiches, type Fiche as FicheData } from "../../lib/fiches";
import { syncFiches } from "../../scripts/sync-fiches.mjs";

// PFO-95 (10/10) : `prive` cite le nom du projet ; le code et les clients restent non publiés.
afterEach(cleanup);

const ANONYME = "Projet anonymisé : code et client non publiés";

const source = (visibilite: string) => `---
nom: Alpha
statut: en cours
periode: 2026
role: développement
stack: TypeScript
visibilite: ${visibilite}
depot: https://github.com/x/secret
demo: https://secret.example
ordre: 1
---

# Alpha — un titre

**En bref.** Un outil. Un résultat. Code privé.

## Problème

P.

## Ce que j'ai construit

C.

## Preuves

P.

## Ce que j'en ai appris

A.

## Artefacts

- Démonstration en entretien.
`;

function dir(files: Record<string, string>): string {
  const d = mkdtempSync(path.join(tmpdir(), "prive-"));
  for (const [name, body] of Object.entries(files)) writeFileSync(path.join(d, name), body);
  return d;
}

function fiche(visibilite: FicheData["frontmatter"]["visibilite"]): FicheData {
  return {
    slug: "alpha",
    titre: "Alpha — un titre",
    frontmatter: {
      nom: "Alpha",
      statut: "en cours",
      periode: "2026",
      role: "conception",
      stack: ["TypeScript"],
      visibilite,
      depot: "",
      depotNote: "",
      demo: "",
      demoNote: "",
    },
    enBref: { quoi: "Un outil.", chiffre: "", lien: "" },
    sections: [],
    visuel: "/projets/generated/alpha.png",
  };
}

describe("Visibilité « prive » (PFO-95)", () => {
  it("sync-fiches accepte une fiche « prive »", () => {
    expect(() => syncFiches(dir({ "alpha.md": source("prive") }), dir({}))).not.toThrow();
  });

  it("une fiche « prive » ne pointe vers rien, quoi qu'en dise le fichier", () => {
    const [f] = loadFiches(dir({ "alpha.md": source("prive") }));
    expect(f.frontmatter.visibilite).toBe("prive");
    expect(f.frontmatter.depot).toBe("");
    expect(f.frontmatter.demo).toBe("");
  });

  it("la carte affiche « Code privé », sans la mention anonyme ni lien Code ou Démo", () => {
    render(<ProjectCard fiche={fiche("prive")} />);
    expect(screen.getByText("Code privé")).toHaveClass("text-muted-foreground");
    expect(screen.queryByText(ANONYME)).toBeNull();
    expect(screen.queryByRole("link", { name: /code|démo/i })).toBeNull();
  });

  it("la page détail affiche « Code privé », sans la mention anonyme", () => {
    render(<Fiche fiche={fiche("prive")} />);
    expect(screen.getByText("Code privé")).toHaveClass("text-muted-foreground");
    expect(screen.queryByText(ANONYME)).toBeNull();
  });

  it("une fiche « anonyme » garde sa mention", () => {
    render(<ProjectCard fiche={fiche("anonyme")} />);
    expect(screen.getByText(ANONYME)).toBeInTheDocument();
    expect(screen.queryByText("Code privé")).toBeNull();
  });
});
