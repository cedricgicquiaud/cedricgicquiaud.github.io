import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Fiche } from "../../components/fiche";
import { codeDe, etatDe } from "../../lib/entete";
import { loadFiches, type Fiche as FicheData } from "../../lib/fiches";

afterEach(cleanup);

// PFO-145 (04/11) : bloc « Fiche » à côté de « En bref », d'après la page de référence de Greg (version A) :
// Rôle, Période, Statut, Code. La ligne grise sous le titre disparaît.

describe("etatDe — le statut lu dans « Où en est le projet »", () => {
  it("la phrase « État au … : » qui ouvre la section, sans la date, avec une majuscule", () => {
    expect(etatDe("<p>État au 04/11/2026 : sortie imminente sur iPhone et Android.</p>\n<ul><li>x</li></ul>")).toBe(
      "Sortie imminente sur iPhone et Android",
    );
  });

  it("s'arrête au premier tiret long ou à la fin de la phrase", () => {
    expect(etatDe("<p>État au 08/10/2026 : V1 livrée — collecte et comparaison ; en\nlocal.</p>")).toBe("V1 livrée");
    expect(etatDe("<p>État au 06/10/2026 : En production, maintenu. Suite.</p>")).toBe("En production, maintenu");
  });

  it("décode les apostrophes du HTML", () => {
    expect(etatDe("<p>État au 10/10/2026 : pas encore d&#39;utilisateurs.</p>")).toBe("Pas encore d'utilisateurs");
  });

  it("refus : sans phrase « État au », rien", () => {
    expect(etatDe("<p>Les preuves.</p>")).toBe("");
    expect(etatDe("")).toBe("");
  });
});

describe("codeDe — la ligne Code selon la visibilité", () => {
  it("une valeur par visibilité", () => {
    expect(codeDe("public")).toBe("Public, sur GitHub");
    expect(codeDe("vitrine")).toBe("Non publié, démo en ligne");
    expect(codeDe("prive")).toBe("Privé");
    expect(codeDe("anonyme")).toBe("Privé, projet anonymisé");
  });
});

function fiche(fm: Partial<FicheData["frontmatter"]> = {}): FicheData {
  return {
    slug: "alpha",
    titre: "Alpha — un sous-titre",
    frontmatter: {
      nom: "Alpha",
      statut: "en cours",
      periode: "mai 2026 → aujourd'hui",
      role: "conception et développement, seul",
      stack: ["TypeScript"],
      visibilite: "public",
      depot: "https://github.com/x/alpha",
      depotNote: "",
      demo: "",
      demoNote: "",
      ordre: 1,
      ...fm,
    },
    enBref: { quoi: "Une accroche.", chiffre: "", lien: "" },
    sections: [
      { id: "probleme", titre: "Problème", html: "<p>Le besoin.</p>" },
      { id: "preuves", titre: "Preuves", html: "<p>État au 04/11/2026 : en production.</p>" },
    ],
    facultatives: [],
    visuel: "/projets/generated/alpha.png",
  };
}

const bloc = () => screen.getByRole("region", { name: "Fiche" });
const after = (a: Node, b: Node) => Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);

describe("Page projet — bloc « Fiche » (PFO-145)", () => {
  it("quatre lignes dans l'ordre : Rôle, Période, Statut, Code, chacune avec sa valeur", () => {
    render(<Fiche fiche={fiche()} />);
    const termes = within(bloc()).getAllByRole("term").map((t) => t.textContent);
    const valeurs = within(bloc()).getAllByRole("definition").map((d) => d.textContent);
    expect(termes).toEqual(["Rôle", "Période", "Statut", "Code"]);
    expect(valeurs).toEqual(["Conception et développement, seul", "Mai 2026 → aujourd'hui", "En production", "Public, sur GitHub"]);
  });

  it("libellés en petites capitales, un trait entre deux lignes", () => {
    render(<Fiche fiche={fiche()} />);
    for (const t of within(bloc()).getAllByRole("term")) expect(t).toHaveClass("uppercase", "text-xs");
    const lignes = bloc().querySelectorAll("dl > div");
    expect(lignes).toHaveLength(4);
    expect(lignes[1]).toHaveClass("border-t");
  });

  it("à côté de « En bref » sur grand écran, après la capture", () => {
    render(<Fiche fiche={fiche()} />);
    const enBref = screen.getByText("En bref").parentElement!;
    expect(enBref.parentElement).toBe(bloc().parentElement);
    expect(bloc().parentElement!.className).toMatch(/\blg:grid-cols-/);
    const image = document.querySelector('img[src="/projets/generated/alpha.png"]')!;
    expect(after(image, bloc())).toBe(true);
  });

  it("la ligne grise sous le titre disparaît : période et rôle n'apparaissent qu'une fois, dans le bloc", () => {
    render(<Fiche fiche={fiche()} />);
    expect(screen.getAllByText(/aujourd'hui/i)).toHaveLength(1);
    expect(screen.getAllByText(/seul$/i)).toHaveLength(1);
    expect(bloc()).toHaveTextContent("Mai 2026 → aujourd'hui");
  });

  it("le lien Code sur GitHub reste sous le titre", () => {
    render(<Fiche fiche={fiche()} />);
    const lien = screen.getByRole("link", { name: "Code sur GitHub" });
    expect(after(screen.getByRole("heading", { level: 1 }), lien)).toBe(true);
    expect(after(lien, document.querySelector("article img")!)).toBe(true);
  });

  it("fiche anonyme ou privée : la visibilité passe dans la ligne Code, plus de mention sous le titre", () => {
    render(<Fiche fiche={fiche({ visibilite: "anonyme", depot: "" })} />);
    expect(within(bloc()).getByText("Privé, projet anonymisé")).toBeInTheDocument();
    expect(screen.queryByText("Projet anonymisé : code et client non publiés")).toBeNull();
    cleanup();
    render(<Fiche fiche={fiche({ visibilite: "prive", depot: "" })} />);
    expect(within(bloc()).getByText("Privé")).toBeInTheDocument();
  });

  it("refus : sans phrase « État au », pas de ligne Statut", () => {
    const f = fiche();
    f.sections[1] = { id: "preuves", titre: "Preuves", html: "<p>Les preuves.</p>" };
    render(<Fiche fiche={f} />);
    expect(within(bloc()).getAllByRole("term").map((t) => t.textContent)).toEqual(["Rôle", "Période", "Code"]);
  });

  it("chaque fiche réelle a ses quatre lignes, Statut compris", () => {
    for (const f of loadFiches()) {
      const { unmount } = render(<Fiche fiche={f} />);
      expect(within(bloc()).getAllByRole("term"), f.slug).toHaveLength(4);
      unmount();
    }
  });
});
