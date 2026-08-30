import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { ProjectCard } from "../../components/project-card";
import { Projects } from "../../components/projects";
import { loadFiches, type Fiche } from "../../lib/fiches";

afterEach(cleanup);

/** Une fiche factice complète ; chaque test ne surcharge que ce qu'il observe. */
function fiche(over: Partial<Fiche["frontmatter"]> & { slug?: string; titre?: string; quoi?: string; chiffre?: string } = {}): Fiche {
  const { slug = "alpha", titre = "Alpha — un titre", quoi = "Un outil qui fait une chose.", chiffre = "120 tests.", ...fm } = over;
  return {
    slug,
    titre,
    frontmatter: {
      nom: "Alpha",
      statut: "en cours",
      periode: "2026",
      role: "conception",
      stack: ["TypeScript", "React"],
      visibilite: "public",
      depot: "https://github.com/x/alpha",
      depotNote: "",
      demo: "",
      demoNote: "",
      ordre: 1,
      ...fm,
    },
    enBref: { quoi, chiffre, lien: "" },
    sections: [],
  };
}

describe("ProjectCard — contenu", () => {
  it("affiche le titre, la ligne En bref, le chiffre clé, le statut et les tags", () => {
    render(<ProjectCard fiche={fiche({ stack: ["TypeScript", "React"] })} />);
    const card = screen.getByRole("article");
    expect(within(card).getByRole("heading", { name: "Alpha — un titre" })).toBeInTheDocument();
    expect(within(card).getByText("Un outil qui fait une chose.")).toBeInTheDocument();
    expect(within(card).getByText("120 tests.")).toHaveClass("tabular-nums");
    expect(within(card).getByText("en cours")).toBeInTheDocument();
    expect(within(card).getByRole("list", { name: /stack/i })).toBeInTheDocument();
    expect(within(card).getByText("TypeScript")).toBeInTheDocument();
    expect(within(card).getByText("React")).toBeInTheDocument();
  });
});

describe("ProjectCard — tags", () => {
  it("affiche au plus 5 tags, les premiers de la stack", () => {
    render(<ProjectCard fiche={fiche({ stack: ["A", "B", "C", "D", "E", "F", "G"] })} />);
    const tags = within(screen.getByRole("list", { name: /stack/i })).getAllByRole("listitem");
    expect(tags.map((t) => t.textContent)).toEqual(["A", "B", "C", "D", "E"]);
  });
});

describe("ProjectCard — liens externes", () => {
  it("lie « Code » vers depot et « Démo » vers demo quand ce sont des URL", () => {
    render(<ProjectCard fiche={fiche({ depot: "https://github.com/x/alpha", demo: "https://alpha.example" })} />);
    expect(screen.getByRole("link", { name: "Code" })).toHaveAttribute("href", "https://github.com/x/alpha");
    expect(screen.getByRole("link", { name: "Démo" })).toHaveAttribute("href", "https://alpha.example");
  });

  it("refus : depot vide, aucun lien « Code »", () => {
    render(<ProjectCard fiche={fiche({ depot: "", demo: "https://alpha.example" })} />);
    expect(screen.queryByRole("link", { name: "Code" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Démo" })).toBeInTheDocument();
  });

  it("refus : depot qui n'est pas une URL (« à venir »), aucun lien « Code »", () => {
    render(<ProjectCard fiche={fiche({ depot: "à venir (nouveau dépôt public)" })} />);
    expect(screen.queryByRole("link", { name: "Code" })).not.toBeInTheDocument();
  });

  it("refus : demo qui n'est pas une URL (« à venir »), aucun lien « Démo »", () => {
    render(<ProjectCard fiche={fiche({ demo: "à venir (mise en ligne prévue)" })} />);
    expect(screen.queryByRole("link", { name: "Démo" })).not.toBeInTheDocument();
    expect(screen.queryByText(/à venir \(mise en ligne prévue\)/)).not.toBeInTheDocument();
  });
});

describe("ProjectCard — vitrine", () => {
  it("refus : vitrine sans dépôt, mention « code privé, démo à venir » et aucun lien externe", () => {
    render(<ProjectCard fiche={fiche({ visibilite: "vitrine", depot: "", demo: "à venir (Vercel)" })} />);
    expect(screen.getByText("code privé, démo à venir")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Code" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Démo" })).not.toBeInTheDocument();
  });

  it("vitrine avec dépôt : lien « Code », pas de mention « code privé »", () => {
    render(<ProjectCard fiche={fiche({ visibilite: "vitrine", depot: "https://github.com/x/landing" })} />);
    expect(screen.getByRole("link", { name: "Code" })).toBeInTheDocument();
    expect(screen.queryByText(/code privé/)).not.toBeInTheDocument();
  });

  it("anonyme sans dépôt : ni lien ni mention « code privé »", () => {
    render(<ProjectCard fiche={fiche({ visibilite: "anonyme", depot: "", demo: "" })} />);
    expect(screen.queryByRole("link", { name: "Code" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Démo" })).not.toBeInTheDocument();
    expect(screen.queryByText(/code privé/)).not.toBeInTheDocument();
  });
});

describe("ProjectCard — lien vers la fiche", () => {
  it("le titre lie /projets/<slug>/, sans lien imbriqué", () => {
    render(<ProjectCard fiche={fiche({ slug: "slice", titre: "SLICE — titre" })} />);
    const title = screen.getByRole("link", { name: "SLICE — titre" });
    expect(title).toHaveAttribute("href", "/projets/slice/");
    expect(title.querySelector("a")).toBeNull();
    expect(title.closest("a")).toBe(title);
  });
});

const NOMS = ["SLICE", "PILOT", "Foreman", "Parcours", "Dashboard", "GiveMe5", "BEN"];
const septFiches = () =>
  NOMS.map((nom, i) => fiche({ slug: nom.toLowerCase(), titre: `${nom} — titre`, nom, ordre: i + 1 }));

describe("Projects — section", () => {
  it("rend 7 cartes dans l'ordre reçu, chacune liant /projets/<slug>/", () => {
    render(<Projects fiches={septFiches()} />);
    const cards = screen.getAllByRole("article");
    expect(cards).toHaveLength(7);
    expect(cards.map((c) => within(c).getByRole("heading").textContent)).toEqual(NOMS.map((n) => `${n} — titre`));
    for (const [i, card] of cards.entries()) {
      expect(within(card).getByRole("link", { name: `${NOMS[i]} — titre` })).toHaveAttribute(
        "href",
        `/projets/${NOMS[i].toLowerCase()}/`,
      );
    }
  });

  it("garde l'id de section et le conteneur partagé", () => {
    const { container } = render(<Projects fiches={septFiches()} />);
    const section = container.querySelector("section#projets");
    expect(section).toHaveClass("py-16");
    expect(section?.firstElementChild).toHaveClass("w-full");
  });
});

describe("Projects — ordre", () => {
  it("refus : une fiche sans « ordre » passe en dernier, jamais en premier", () => {
    const md = (nom: string, ordre?: number) =>
      `---\nnom: ${nom}\nstatut: en cours\nperiode: 2026\nrole: x\nstack: TS\nvisibilite: public\ndepot:\ndemo:\n${
        ordre === undefined ? "" : `ordre: ${ordre}\n`
      }---\n\n# ${nom} — titre\n\n**En bref.** Quoi. Chiffre.\n`;
    const dir = mkdtempSync(path.join(tmpdir(), "fiches-"));
    writeFileSync(path.join(dir, "aaa.md"), md("AAA"));
    writeFileSync(path.join(dir, "zed.md"), md("ZED", 2));
    writeFileSync(path.join(dir, "mid.md"), md("MID", 1));
    render(<Projects fiches={loadFiches(dir)} />);
    const titres = screen.getAllByRole("article").map((c) => within(c).getByRole("heading").textContent);
    expect(titres).toEqual(["MID — titre", "ZED — titre", "AAA — titre"]);
  });
});

describe("Projects — largeur 375 px (classes seulement, jsdom ne mesure pas)", () => {
  const LONG = "en cours (méthode rodée sur un bac à sable et branchée sur deux projets réels ; dépôt public pas encore ouvert)";

  it("le badge statut peut passer à la ligne : whitespace-normal, jamais whitespace-nowrap ni h-5", () => {
    render(<ProjectCard fiche={fiche({ statut: LONG })} />);
    const badge = screen.getByText(LONG);
    expect(badge).toHaveClass("whitespace-normal", "h-auto");
    expect(badge).not.toHaveClass("whitespace-nowrap");
    expect(badge).not.toHaveClass("h-5");
  });

  it("le titre coupe les mots longs (break-words)", () => {
    render(<ProjectCard fiche={fiche()} />);
    expect(screen.getByRole("heading", { level: 3 })).toHaveClass("break-words");
  });

  it("la grille borne sa colonne à minmax(0,1fr) et ses enfants ont min-w-0", () => {
    const { container } = render(<Projects fiches={septFiches()} />);
    const ol = container.querySelector("ol");
    expect(ol).toHaveClass("grid-cols-[minmax(0,1fr)]");
    for (const li of Array.from(ol!.children)) expect(li).toHaveClass("min-w-0");
  });
});
