import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { Fiche } from "../../components/fiche";
import { corpsDe, loadFiche } from "../../lib/fiches";
import { SECTIONS_APRES_PROBLEME, STACK_DETAIL } from "./helpers/fiche-complete";

afterEach(cleanup);

// PFO-147 (04/11) : section facultative « ## La méthode », entre Livrables et Architecture, en trois
// colonnes : titre de section, puis une ligne par ### (titre de l'étape au milieu, texte à droite).

const METHODE = `
## La méthode

### Le principe

Cinq étapes.

### Étape 1 — Comprendre

Une recherche.
`;

function ficheAvec(methode: string) {
  const dir = mkdtempSync(path.join(tmpdir(), "methode-"));
  mkdirSync(dir, { recursive: true });
  const corps = SECTIONS_APRES_PROBLEME.replace("\n## Architecture", `${methode}\n## Architecture`);
  writeFileSync(
    path.join(dir, "alpha.md"),
    `---\nnom: Alpha\nstatut: en cours\nperiode: "2026"\nrole: seul\nstack: TypeScript\nvisibilite: public\ndepot: https://github.com/x/alpha\ndemo:\nordre: 1\n${STACK_DETAIL}---\n\n# Alpha — un titre\n\n**En bref.** Une accroche.\n\n## Problème\n\nLe besoin.\n${corps}`,
  );
  return loadFiche("alpha", dir);
}

const section = (name: string) => screen.getByRole("heading", { level: 2, name }).closest("section")!;

describe("Section « La méthode » (PFO-147)", () => {
  it("s'affiche sous le titre « La méthode », entre Livrables et Architecture, dans le sommaire aussi", () => {
    render(<Fiche fiche={ficheAvec(METHODE)} />);
    const h2 = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    expect(h2.indexOf("La méthode")).toBe(h2.indexOf("Livrables") + 1);
    expect(h2.indexOf("Architecture")).toBe(h2.indexOf("La méthode") + 1);
    expect(within(screen.getByRole("navigation", { name: "Sommaire" })).getByRole("link", { name: "La méthode" })).toHaveAttribute(
      "href",
      "#methode",
    );
  });

  it("trois colonnes : une ligne par ###, le titre de l'étape à côté de son texte", () => {
    render(<Fiche fiche={ficheAvec(METHODE)} />);
    const lignes = within(section("La méthode")).getAllByRole("listitem");
    expect(lignes).toHaveLength(2);
    // PFO-148 : le titre d'étape est découpé en numéro et nom.
    expect(within(lignes[1]).getByRole("heading", { level: 3 })).toHaveTextContent(/Étape 1.*Comprendre/);
    expect(lignes[1]).toHaveTextContent("Une recherche.");
    expect(lignes[1].className).toMatch(/\bmd:grid-cols-/);
  });

  it("proofs.json la reprend, à sa place", () => {
    const ids = corpsDe(ficheAvec(METHODE)).map((s) => s.id);
    expect(ids.indexOf("methode")).toBe(ids.indexOf("livrables") + 1);
    expect(ids.indexOf("architecture")).toBe(ids.indexOf("methode") + 1);
  });

  it("refus : sans « ## La méthode », aucune section ni entrée de sommaire", () => {
    render(<Fiche fiche={ficheAvec("")} />);
    expect(screen.queryByRole("heading", { level: 2, name: "La méthode" })).toBeNull();
    expect(screen.queryByRole("link", { name: "La méthode" })).toBeNull();
  });
});

// PFO-148 (04/11) : mise en page plus lisible de « La méthode », texte inchangé.
const ETAPES = `
## La méthode

### Le principe

Cinq étapes.

### Étape 1 — Comprendre le projet (\`init\`)

**Temps 1 — dire ce qui devra être vrai.**

1. Claude pose ses questions.
2. Il écrit des phrases. Par exemple :
   - « Un patient voit les créneaux. »
   - « On ne réserve pas dans le passé. »

   Au moins un tiers sont des refus.

### Étape 5 — Décider et apprendre (merge, puis \`sync\`)

Je relis.
`;

describe("« La méthode » lisible (PFO-148)", () => {
  it("titre d'étape en trois niveaux : « Étape 1 » en petites capitales, le nom, la commande", () => {
    render(<Fiche fiche={ficheAvec(ETAPES)} />);
    const h3 = within(section("La méthode")).getAllByRole("heading", { level: 3 });
    const [numero, nom, commande] = Array.from(h3[1].children) as HTMLElement[];
    expect(numero).toHaveTextContent("Étape 1");
    expect(numero).toHaveClass("uppercase", "text-xs", "text-muted-foreground");
    expect(nom.textContent).toBe("Comprendre le projet");
    // PFO-149 : nom de l'étape en 20 px.
    expect(nom).toHaveClass("text-xl");
    expect(commande.textContent).toBe("init");
    expect(commande).toHaveClass("text-muted-foreground");
    expect(h3[2].children[2].textContent).toBe("merge, puis sync");
  });

  it("refus : un titre qui n'est pas une étape garde son texte entier, sans numéro ni commande", () => {
    render(<Fiche fiche={ficheAvec(ETAPES)} />);
    const h3 = within(section("La méthode")).getAllByRole("heading", { level: 3 })[0];
    expect(h3.textContent).toBe("Le principe");
    expect(h3).toHaveClass("text-base");
  });

  it("colonne du texte plus large : la section et ses lignes donnent trois quarts au contenu", () => {
    render(<Fiche fiche={ficheAvec(ETAPES)} />);
    expect(section("La méthode").className).toMatch(/lg:grid-cols-\[minmax\(0,1fr\)_minmax\(0,3fr\)\]/);
    expect(section("Livrables").className).toMatch(/lg:grid-cols-\[minmax\(0,1fr\)_minmax\(0,2fr\)\]/);
    const ligne = within(section("La méthode")).getAllByRole("listitem")[0];
    expect(ligne.className).toMatch(/md:grid-cols-\[minmax\(0,1fr\)_minmax\(0,3fr\)\]/);
  });

  it("un paragraphe entièrement en gras devient un libellé en petites capitales, sans point final", () => {
    render(<Fiche fiche={ficheAvec(ETAPES)} />);
    const libelle = within(section("La méthode")).getByText("Temps 1 — dire ce qui devra être vrai");
    expect(libelle.tagName).toBe("P");
    expect(libelle).toHaveAttribute("data-etiquette");
  });

  it("listes : numéros gris et compacts, puces rétablies sous une liste numérotée, commandes jamais coupées", () => {
    render(<Fiche fiche={ficheAvec(ETAPES)} />);
    const texte = within(section("La méthode")).getByText("Claude pose ses questions.").closest("div[class*='space-y']")!;
    expect(texte.className).toContain("[&_ol_ul]:list-disc");
    expect(texte.className).toContain("[&_code]:whitespace-nowrap");
  });
});

// PFO-149 (04/11) : frise verticale pour les points numérotés, exemples à part.
describe("« La méthode » en frise (PFO-149)", () => {
  const AVEC_EXEMPLE = `
## La méthode

### Étape 1 — Comprendre le projet (\`init\`)

1. Claude fait une recherche.

   > Ici : les logiciels connus.

2. Il m'interroge.
`;

  it("le texte d'une étape porte la classe « frise », dont la feuille de style dessine cercles et trait", () => {
    render(<Fiche fiche={ficheAvec(AVEC_EXEMPLE)} />);
    const texte = within(section("La méthode")).getByText("Il m'interroge.").closest("div[class*='space-y']")!;
    expect(texte).toHaveClass("frise");
    const css = readFileSync(path.join(__dirname, "../../app/globals.css"), "utf8");
    expect(css).toMatch(/\.frise > ol > li::before\s*\{[^}]*counter\(etape\)/);
    expect(css).toMatch(/\.frise > ol > li:not\(:last-child\)::after/);
    expect(css).toMatch(/\.frise blockquote\s*\{[^}]*border-left/);
  });

  it("l'exemple est une citation sous son point, séparée de l'action", () => {
    render(<Fiche fiche={ficheAvec(AVEC_EXEMPLE)} />);
    const exemple = within(section("La méthode")).getByText("Ici : les logiciels connus.");
    const point = exemple.closest("li")!;
    expect(exemple.closest("blockquote")).not.toBeNull();
    expect(point).toHaveTextContent("Claude fait une recherche.");
  });

  it("refus : les décisions des autres fiches n'ont pas de frise", () => {
    render(<Fiche fiche={ficheAvec(AVEC_EXEMPLE)} />);
    const decisions = screen.getByRole("heading", { level: 2, name: "Décisions" }).closest("section")!;
    expect(decisions.querySelector(".frise")).toBeNull();
  });
});
