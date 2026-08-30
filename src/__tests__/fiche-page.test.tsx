import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import path from "node:path";
import { act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { loadFiches, type Fiche as FicheData } from "../../lib/fiches";
import { Fiche } from "../../components/fiche";
import { Nav } from "../../components/nav";
import * as fichePage from "../../app/projets/[slug]/page";

const root = path.resolve(__dirname, "../..");
const source = (rel: string) => readFileSync(path.join(root, rel), "utf8");

// `usePathname` est un hook client de Next : hors navigateur Next, on le simule.
const pathname = vi.hoisted(() => ({ current: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => pathname.current }));

type ObserverCallback = (entries: Partial<IntersectionObserverEntry>[]) => void;

function stubIntersectionObserver() {
  const state: { callback?: ObserverCallback; observed: Element[] } = { observed: [] };
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(callback: ObserverCallback) {
        state.callback = callback;
      }
      observe(el: Element) {
        state.observed.push(el);
      }
      disconnect() {}
      unobserve() {}
    },
  );
  return state;
}

/** Fiche factice : chaque champ porte une valeur reconnaissable dans le rendu. */
function fakeFiche(overrides: Partial<FicheData["frontmatter"]> = {}): FicheData {
  return {
    slug: "factice",
    titre: "Factice — un titre de fiche",
    frontmatter: {
      nom: "Factice",
      statut: "en cours",
      periode: "mai 2026 → aujourd'hui",
      role: "conception et tests",
      stack: ["TypeScript", "Vitest"],
      visibilite: "public",
      depot: "https://github.com/cedricgicquiaud/factice",
      depotNote: "https://github.com/cedricgicquiaud/factice",
      demo: "https://factice.example.test/",
      demoNote: "https://factice.example.test/",
      ...overrides,
    },
    enBref: { quoi: "Un service factice.", chiffre: "12 tests verts.", lien: "Code public." },
    sections: [
      { id: "probleme", titre: "Problème", html: "<p>Texte du problème.</p>" },
      {
        id: "construit",
        titre: "Ce que j'ai construit",
        html: "<ul>\n<li>Un <strong>point fort</strong></li>\n<li>Un <a href=\"https://github.com/cedricgicquiaud/factice\">lien</a></li>\n</ul>",
      },
      { id: "preuves", titre: "Preuves", html: "<p>Texte des preuves.</p>" },
      { id: "appris", titre: "Ce que j'en ai appris", html: "<p>Texte des leçons.</p>" },
      { id: "artefacts", titre: "Artefacts", html: "<p>Texte des artefacts.</p>" },
    ],
  };
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  pathname.current = "/";
});

describe("Nav depuis une sous-page (PFO-25)", () => {
  it("pointe vers les sections de l'accueil par des liens absolus /#…", () => {
    pathname.current = "/projets/slice/";
    render(<Nav />);
    const hrefs = Array.from(screen.getByRole("navigation").querySelectorAll("a")).map((a) => a.getAttribute("href"));
    expect(hrefs).toEqual(["/#a-propos", "/#experience", "/#projets", "/#contact"]);
  });

  it("ne souligne aucune entrée hors accueil, même si une section homonyme est visible", () => {
    pathname.current = "/projets/slice/";
    const observer = stubIntersectionObserver();
    render(
      <>
        <Nav />
        <footer id="contact" />
      </>,
    );
    if (observer.callback) {
      const target = document.getElementById("contact")!;
      act(() => observer.callback!([{ target, isIntersecting: true }]));
    }
    for (const link of screen.getByRole("navigation").querySelectorAll("a")) {
      expect(link).not.toHaveClass("active");
      expect(link).not.toHaveAttribute("aria-current");
    }
  });
});

describe("Menu et pied de page dans le layout (PFO-25)", () => {
  it("app/layout.tsx rend <Nav/>, le conteneur fixe du bouton de thème et <Footer/> autour de children", () => {
    const layout = source("app/layout.tsx");
    const body = layout.slice(layout.indexOf("<body"), layout.indexOf("</body>"));
    expect(body).toContain("<Nav />");
    expect(body).toContain("<ThemeToggle />");
    expect(body).toContain("<Footer />");
    expect(body).toMatch(/className="fixed right-4 top-16 z-50 lg:top-4"[^]*<ThemeToggle \/>/);
    expect(body.indexOf("<Nav />")).toBeLessThan(body.indexOf("{children}"));
    expect(body.indexOf("{children}")).toBeLessThan(body.indexOf("<Footer />"));
  });

  it("app/page.tsx ne rend plus ni Nav, ni ThemeToggle, ni Footer", () => {
    const page = source("app/page.tsx");
    expect(page).not.toContain("<Nav");
    expect(page).not.toContain("<ThemeToggle");
    expect(page).not.toContain("<Footer");
    expect(page).not.toContain("fixed");
  });
});

describe("Route statique /projets/[slug]/ (PFO-26)", () => {
  it("génère un paramètre par fiche : les 7 slugs de content/fiches, et rien d'autre", async () => {
    const params = await fichePage.generateStaticParams();
    const expected = loadFiches().map((f) => ({ slug: f.slug }));
    expect(expected).toHaveLength(7);
    expect(params).toEqual(expected);
    expect(fichePage.dynamicParams).toBe(false);
  });

  it("titre « <nom> — Cédric Gicquiaud » et description = première phrase d'En bref", async () => {
    const slice = loadFiches().find((f) => f.slug === "slice")!;
    const metadata = await fichePage.generateMetadata({ params: Promise.resolve({ slug: "slice" }), searchParams: Promise.resolve({}) });
    expect(metadata.title).toBe(`${slice.frontmatter.nom} — Cédric Gicquiaud`);
    expect(metadata.description).toBe(slice.enBref.quoi);
    expect(slice.enBref.quoi.trim().length).toBeGreaterThan(0);
  });
});

describe("Rendu de la fiche : en-tête (PFO-27)", () => {
  it("rend le lien « ← Projets » vers /#projets, le titre en h1 et l'en-tête en liste de définitions", () => {
    render(<Fiche fiche={fakeFiche()} />);
    expect(screen.getByRole("link", { name: "← Projets" })).toHaveAttribute("href", "/#projets");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Factice — un titre de fiche");

    const terms = Array.from(document.querySelectorAll("dl dt")).map((dt) => dt.textContent);
    expect(terms).toEqual(["Statut", "Période", "Rôle", "Stack", "Visibilité"]);
    const definition = (term: string) =>
      Array.from(document.querySelectorAll("dl dt")).find((dt) => dt.textContent === term)!.nextElementSibling!;
    expect(definition("Statut")).toHaveTextContent("en cours");
    expect(definition("Période")).toHaveTextContent("mai 2026 → aujourd'hui");
    expect(definition("Rôle")).toHaveTextContent("conception et tests");
    expect(definition("Visibilité")).toHaveTextContent("public");
    const badges = Array.from(definition("Stack").querySelectorAll("li")).map((li) => li.textContent);
    expect(badges).toEqual(["TypeScript", "Vitest"]);
  });
});

describe("Rendu de la fiche : En bref et cinq sections (PFO-27)", () => {
  it("rend le bloc En bref puis les cinq sections h2 dans l'ordre, avec le Markdown (liste, gras, lien) rendu", () => {
    render(<Fiche fiche={fakeFiche()} />);
    const enBref = screen.getByText(/Un service factice\./);
    expect(enBref).toHaveTextContent("Un service factice. 12 tests verts. Code public.");

    const h2 = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    expect(h2).toEqual(["Problème", "Ce que j'ai construit", "Preuves", "Ce que j'en ai appris", "Artefacts"]);
    expect(document.body.textContent!.indexOf("Un service factice.")).toBeLessThan(document.body.textContent!.indexOf("Problème"));

    const construit = screen.getByRole("heading", { level: 2, name: "Ce que j'ai construit" }).parentElement!;
    expect(construit.querySelectorAll("ul li")).toHaveLength(2);
    expect(construit.querySelector("strong")).toHaveTextContent("point fort");
    expect(screen.getByRole("link", { name: "lien" })).toHaveAttribute("href", "https://github.com/cedricgicquiaud/factice");
    expect(screen.getByText("Texte des artefacts.")).toBeInTheDocument();
  });
});
