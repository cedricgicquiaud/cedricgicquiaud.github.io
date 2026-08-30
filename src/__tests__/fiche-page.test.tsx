import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { act } from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
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
    visuel: "/projets/generated/factice.png",
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
    expect(hrefs).toEqual(["/#a-propos", "/#experience", "/#projets"]);
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
      expect(link).not.toHaveAttribute("aria-current");
    }
  });
});

describe("Layout (PFO-25, menu du haut retiré par PFO-29, pied de page retiré par PFO-54)", () => {
  it("app/layout.tsx rend le conteneur fixe du bouton de thème et rend children", () => {
    const layout = source("app/layout.tsx");
    const body = layout.slice(layout.indexOf("<body"), layout.indexOf("</body>"));
    expect(body).toContain("<ThemeToggle />");
    expect(body).toContain("{children}");
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

  it("la page rend la fiche du slug dans un <main> : titre h1 et cinq sections", async () => {
    const slice = loadFiches().find((f) => f.slug === "slice")!;
    const page = await fichePage.default({ params: Promise.resolve({ slug: "slice" }), searchParams: Promise.resolve({}) });
    render(page);
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(slice.titre);
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(5);
    expect(screen.getByRole("link", { name: "← Projets" })).toBeInTheDocument();
  });

  it("titre « <nom> — Cédric Gicquiaud » et description = première phrase d'En bref", async () => {
    const slice = loadFiches().find((f) => f.slug === "slice")!;
    const metadata = await fichePage.generateMetadata({ params: Promise.resolve({ slug: "slice" }), searchParams: Promise.resolve({}) });
    expect(metadata.title).toBe(`${slice.frontmatter.nom} — Cédric Gicquiaud`);
    expect(metadata.description).toBe(slice.enBref.quoi);
    expect(slice.enBref.quoi.trim().length).toBeGreaterThan(0);
  });

  it("openGraph propre à la fiche : titre, description, type article et url /projets/<slug>/", async () => {
    const slice = loadFiches().find((f) => f.slug === "slice")!;
    const metadata = await fichePage.generateMetadata({ params: Promise.resolve({ slug: "slice" }), searchParams: Promise.resolve({}) });
    expect(metadata.openGraph).toMatchObject({
      title: `${slice.frontmatter.nom} — Cédric Gicquiaud`,
      description: slice.enBref.quoi,
      type: "article",
      url: "/projets/slice/",
    });
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

describe("Rendu de la fiche : liens Code et Démo (PFO-27)", () => {
  it("rend Code et Démo en fin d'en-tête quand la fiche a une URL de dépôt et de démo", () => {
    render(<Fiche fiche={fakeFiche()} />);
    const code = screen.getByRole("link", { name: "Code" });
    const demo = screen.getByRole("link", { name: "Démo" });
    expect(code).toHaveAttribute("href", "https://github.com/cedricgicquiaud/factice");
    expect(demo).toHaveAttribute("href", "https://factice.example.test/");
    const dl = document.querySelector("dl")!;
    expect(dl.compareDocumentPosition(code) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(code.compareDocumentPosition(screen.getByRole("heading", { level: 2, name: "Problème" })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("omet Démo (sans URL) et garde Code", () => {
    render(<Fiche fiche={fakeFiche({ demo: "", demoNote: "à venir" })} />);
    expect(screen.getByRole("link", { name: "Code" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Démo" })).toBeNull();
  });

  it("refuse Code et Démo pour une fiche anonyme", () => {
    render(<Fiche fiche={fakeFiche({ visibilite: "anonyme", depot: "", depotNote: "", demo: "", demoNote: "" })} />);
    expect(screen.queryByRole("link", { name: "Code" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Démo" })).toBeNull();
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });
});

describe("Sortie du build : une page par fiche (PFO-26)", () => {
  const out = path.join(root, "out");
  const pageOf = (slug: string) => path.join(out, "projets", slug, "index.html");

  beforeAll(() => {
    // `next build` n'est relancé que si une page de fiche manque dans la sortie,
    // n'a pas encore son og:title propre ou porte encore le pied de page (retiré par PFO-54).
    const upToDate = (f: FicheData) => {
      if (!existsSync(pageOf(f.slug))) return false;
      const html = readFileSync(pageOf(f.slug), "utf8");
      return html.includes(`content="${f.frontmatter.nom} — Cédric Gicquiaud"`) && !html.includes("<footer");
    };
    if (!loadFiches().every(upToDate)) {
      execFileSync("npx", ["next", "build"], { cwd: root, stdio: "pipe" });
    }
  }, 120_000);

  it("écrit out/projets/<slug>/index.html pour les 7 fiches, avec titre et lien retour (sans menu depuis PFO-29, sans pied de page depuis PFO-54)", () => {
    const fiches = loadFiches();
    expect(fiches).toHaveLength(7);
    for (const fiche of fiches) {
      const file = pageOf(fiche.slug);
      expect(existsSync(file), file).toBe(true);
      const html = readFileSync(file, "utf8");
      expect(html).toContain(`<title>${fiche.frontmatter.nom} — Cédric Gicquiaud</title>`);
      expect(html).toContain(`<meta property="og:title" content="${fiche.frontmatter.nom} — Cédric Gicquiaud"/>`);
      // React encode l'apostrophe en &#x27; dans les attributs : on compare la valeur décodée.
      const ogDescription = html.match(/<meta property="og:description" content="([^"]*)"/)?.[1].replace(/&#x27;/g, "'");
      expect(ogDescription).toBe(fiche.enBref.quoi);
      expect(html).toContain('<meta property="og:type" content="article"/>');
      expect(html).not.toContain('aria-label="Sections"');
      expect(html).toContain('href="/#projets"');
      expect(html).not.toContain("<footer");
    }
  });

  it("refuse un slug inconnu : aucun dossier hors des 7 fiches (et `generated/`, les visuels de PFO-35)", () => {
    const dirs = readdirSync(path.join(out, "projets")).filter(
      (n) => n !== "generated" && statSync(path.join(out, "projets", n)).isDirectory(),
    );
    expect(dirs.sort()).toEqual(loadFiches().map((f) => f.slug).sort());
  });
});
