import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import path from "node:path";
import { act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { loadFiches } from "../../lib/fiches";
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
});
