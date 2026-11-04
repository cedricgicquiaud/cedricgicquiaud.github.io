import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Fiche } from "../../components/fiche";
import { anneeDe, decoupeTitre } from "../../lib/entete";
import type { Fiche as FicheData } from "../../lib/fiches";

afterEach(cleanup);

// PFO-142 (04/11) : en-tête de page projet d'après la page de référence de Cédric — nom en grand,
// année à droite, sous-titre, liens, capture pleine largeur, puis « En bref » en gros texte.

describe("anneeDe — l'année affichée à droite du nom", () => {
  it("une seule année : l'année", () => {
    expect(anneeDe("mars 2026 → juin 2026")).toBe("2026");
    expect(anneeDe("2025")).toBe("2025");
    expect(anneeDe("avril 2026 → mai 2026 (code public en octobre 2026)")).toBe("2026");
  });

  it("projet en cours : « Depuis » et la première année", () => {
    expect(anneeDe("2025 → aujourd'hui")).toBe("Depuis 2025");
    expect(anneeDe("avril 2026 (FORGE) → aujourd'hui ; PILOT depuis le 22 août 2026")).toBe("Depuis 2026");
  });

  it("projet terminé sur plusieurs années : première et dernière", () => {
    expect(anneeDe("2024 → 2025")).toBe("2024–2025");
  });

  it("refus : pas d'année, rien", () => {
    expect(anneeDe("")).toBe("");
    expect(anneeDe("bientôt")).toBe("");
  });
});

describe("decoupeTitre — le nom en grand, le reste en sous-titre", () => {
  it("coupe au tiret long", () => {
    expect(decoupeTitre("Coach — santé et longévité IA")).toEqual({ nom: "Coach", sousTitre: "santé et longévité IA" });
  });

  it("sans tiret long : tout le titre est le nom, pas de sous-titre", () => {
    expect(decoupeTitre("Chatbot GiveMe5")).toEqual({ nom: "Chatbot GiveMe5", sousTitre: "" });
  });
});

function fiche(): FicheData {
  return {
    slug: "alpha",
    titre: "Alpha — un sous-titre",
    frontmatter: {
      nom: "Alpha",
      statut: "en cours",
      periode: "2025 → aujourd'hui",
      role: "seul",
      stack: ["TypeScript"],
      visibilite: "public",
      depot: "https://github.com/x/alpha",
      depotNote: "",
      demo: "",
      demoNote: "",
      ordre: 1,
    },
    enBref: { quoi: "Une accroche.", chiffre: "500 cas.", lien: "Code public." },
    sections: [{ id: "probleme", titre: "Problème", html: "<p>Le besoin.</p>" }],
    facultatives: [],
    visuel: "/projets/generated/alpha.png",
  };
}

const after = (a: Node, b: Node) => Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);

describe("Page projet — en-tête (PFO-142)", () => {
  it("le h1 porte le nom seul, en très grand et en gras", () => {
    render(<Fiche fiche={fiche()} />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1.textContent).toBe("Alpha");
    expect(h1).toHaveClass("font-bold", "lg:text-7xl");
  });

  it("l'année à droite du nom, en grand et en gris", () => {
    render(<Fiche fiche={fiche()} />);
    const annee = screen.getByText("Depuis 2025");
    expect(annee).toHaveClass("text-muted-foreground", "text-xl");
    // PFO-143 : beaucoup plus petite que le nom, sans agrandissement sur grand écran.
    expect(annee.className).not.toMatch(/\b(lg:)?text-(2xl|3xl|4xl|5xl)\b/);
    expect(annee.parentElement).toBe(screen.getByRole("heading", { level: 1 }).parentElement);
    expect(annee.parentElement).toHaveClass("justify-between");
  });

  it("ordre : nom, sous-titre, liens, capture, « En bref », accroche", () => {
    render(<Fiche fiche={fiche()} />);
    const h1 = screen.getByRole("heading", { level: 1 });
    const sousTitre = screen.getByText("un sous-titre");
    const github = screen.getByRole("link", { name: "Code sur GitHub" });
    const image = document.querySelector('img[src="/projets/generated/alpha.png"]')!;
    const label = screen.getByText("En bref");
    const accroche = screen.getByText("Une accroche. 500 cas. Code public.");
    expect(after(h1, sousTitre)).toBe(true);
    expect(after(sousTitre, github)).toBe(true);
    expect(after(github, image)).toBe(true);
    expect(after(image, label)).toBe(true);
    expect(after(label, accroche)).toBe(true);
  });

  it("la capture prend toute la largeur ; « En bref » en petites capitales, l'accroche en gros texte", () => {
    render(<Fiche fiche={fiche()} />);
    const image = document.querySelector('img[src="/projets/generated/alpha.png"]')!;
    expect(image).toHaveClass("w-full");
    expect(image).not.toHaveClass("max-w-4xl");
    expect(screen.getByText("En bref")).toHaveClass("uppercase", "text-sm");
    // PFO-143 : l'accroche en texte courant un peu plus grand (18 px), plus en très gros.
    const accroche = screen.getByText("Une accroche. 500 cas. Code public.");
    expect(accroche).toHaveClass("text-lg", "leading-relaxed");
    expect(accroche.className).not.toMatch(/\b(lg:)?text-(2xl|3xl)\b/);
  });

  it("refus : « En bref » n'est pas un titre de section (les huit h2 restent les huit sections)", () => {
    render(<Fiche fiche={fiche()} />);
    expect(screen.queryByRole("heading", { name: "En bref" })).toBeNull();
  });
});
