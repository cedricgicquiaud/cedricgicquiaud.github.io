import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import site from "../../content/site.json";
import { Intro } from "../../components/intro";
import { Nav } from "../../components/nav";
import { ThemeToggle } from "../../components/theme-toggle";
import { Footer } from "../../components/footer";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  document.documentElement.removeAttribute("data-theme");
});

function stubStorage(initial: Record<string, string> = {}) {
  const store = new Map(Object.entries(initial));
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
    removeItem: (key: string) => void store.delete(key),
  });
  return store;
}

type ObserverCallback = (entries: Partial<IntersectionObserverEntry>[]) => void;

function stubIntersectionObserver() {
  const state: { callback?: ObserverCallback; observed: Element[]; options?: IntersectionObserverInit } = {
    observed: [],
  };
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(callback: ObserverCallback, options?: IntersectionObserverInit) {
        state.callback = callback;
        state.options = options;
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

function renderNavWithSections() {
  return render(
    <>
      <Nav />
      <main>
        <section id="a-propos" />
        <section id="experience" />
        <section id="projets" />
      </main>
      <footer id="contact" />
    </>,
  );
}

describe("Intro", () => {
  it("rend le nom et le titre de site.json", () => {
    render(<Intro />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(site.name);
    expect(screen.getByText(site.title)).toBeInTheDocument();
  });

  it("rend les liens GitHub, LinkedIn et mail vers les bonnes cibles", () => {
    render(<Intro />);
    expect(screen.getByRole("link", { name: "GitHub" })).toHaveAttribute("href", site.links.github);
    expect(screen.getByRole("link", { name: "LinkedIn" })).toHaveAttribute("href", site.links.linkedin);
    expect(screen.getByRole("link", { name: "Mail" })).toHaveAttribute("href", `mailto:${site.email}`);
    expect(site.links.github).toBe("https://github.com/cedricgicquiaud");
    expect(site.links.linkedin).toBe("https://www.linkedin.com/in/cedric-gicquiaud/");
    expect(site.email).toBe("cedric.gicquiaud@gmail.com");
  });

  it("nom et titre en tête, sans bg-grid (porté par body depuis PFO-38 ; la hauteur vient du parent depuis PFO-28)", () => {
    const { container } = render(<Intro />);
    const section = container.querySelector("section#intro");
    expect(section).not.toHaveClass("bg-grid");
    expect(section).not.toHaveClass("min-h-screen");
    const heading = screen.getByRole("heading", { level: 1 });
    expect(section?.firstElementChild?.contains(heading)).toBe(true);
  });
});

describe("site.json", () => {
  it("refuse toute suite de chiffres ressemblant à un numéro de téléphone", () => {
    const raw = readFileSync(path.resolve(__dirname, "../../content/site.json"), "utf8");
    const phoneLike = /(?:\+?\d[\d .-]{7,}\d)/;
    expect(raw).not.toMatch(phoneLike);
  });
});

describe("Nav", () => {
  it("rend trois liens vers À propos, Expérience et Projets (Contact retiré par PFO-29)", () => {
    render(<Nav />);
    const nav = screen.getByRole("navigation");
    const links = Array.from(nav.querySelectorAll("a")).map((a) => [a.textContent, a.getAttribute("href")]);
    expect(links).toEqual([
      ["À propos", "/#a-propos"],
      ["Expérience", "/#experience"],
      ["Projets", "/#projets"],
    ]);
  });

  it("souligne la section visible (aria-current=location) au fil du défilement", () => {
    const observer = stubIntersectionObserver();
    renderNavWithSections();
    const ids = observer.observed.map((el) => el.id);
    expect(ids).toEqual(["a-propos", "experience", "projets"]);

    const target = document.getElementById("experience")!;
    act(() => observer.callback!([{ target, isIntersecting: true }]));

    const active = screen.getByRole("link", { name: "Expérience" });
    expect(active).toHaveAttribute("aria-current", "location");
    expect(screen.getByRole("link", { name: "À propos" })).not.toHaveAttribute("aria-current");
  });

  it("n'active aucun lien au chargement quand seule l'Intro est à l'écran", () => {
    const observer = stubIntersectionObserver();
    renderNavWithSections();
    const rect = (top: number) => ({ top }) as DOMRectReadOnly;
    act(() =>
      observer.callback!(
        observer.observed.map((target, i) => ({
          target,
          isIntersecting: false,
          boundingClientRect: rect(2000 + i * 24),
        })),
      ),
    );
    for (const name of ["À propos", "Expérience", "Projets"]) {
      expect(screen.getByRole("link", { name })).not.toHaveAttribute("aria-current");
    }
  });

  it("active la section dont le haut est le plus proche du haut de la fenêtre, pas la dernière observée", () => {
    const observer = stubIntersectionObserver();
    renderNavWithSections();
    const rect = (top: number) => ({ top }) as DOMRectReadOnly;
    const experience = document.getElementById("experience")!;
    const projets = document.getElementById("projets")!;
    act(() =>
      observer.callback!([
        { target: experience, isIntersecting: true, boundingClientRect: rect(120) },
        { target: projets, isIntersecting: true, boundingClientRect: rect(600) },
      ]),
    );
    expect(screen.getByRole("link", { name: "Expérience" })).toHaveAttribute("aria-current", "location");
    expect(screen.getByRole("link", { name: "Projets" })).not.toHaveAttribute("aria-current");

    act(() => observer.callback!([{ target: experience, isIntersecting: false, boundingClientRect: rect(-900) }]));
    expect(screen.getByRole("link", { name: "Projets" })).toHaveAttribute("aria-current", "location");
    expect(screen.getByRole("link", { name: "Expérience" })).not.toHaveAttribute("aria-current");
  });

  it("observe une bande centrale de la fenêtre (rootMargin)", () => {
    const observer = stubIntersectionObserver();
    renderNavWithSections();
    expect(observer.options?.rootMargin).toMatch(/^-\d+% 0px -\d+% 0px$/);
  });

  it("laisse Tab parcourir les trois liens puis le bouton de thème, focus visible", () => {
    const { container } = render(
      <>
        <Nav />
        <ThemeToggle />
      </>,
    );
    const focusable = Array.from(
      container.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"),
    ).filter((el) => el.tabIndex >= 0);
    expect(focusable.map((el) => el.tagName)).toEqual(["A", "A", "A", "BUTTON"]);
    for (const el of focusable) {
      expect(el.className).toMatch(/focus-visible:/);
    }
  });
});

describe("ThemeToggle", () => {
  it("bascule data-theme sur <html> et mémorise le choix dans localStorage.theme", () => {
    const store = stubStorage();
    render(<ThemeToggle />);
    const button = screen.getByRole("button");
    expect(document.documentElement.getAttribute("data-theme")).toBeNull();

    fireEvent.click(button);
    const first = document.documentElement.getAttribute("data-theme");
    expect(["light", "dark"]).toContain(first);
    expect(store.get("theme")).toBe(first);

    fireEvent.click(button);
    const second = document.documentElement.getAttribute("data-theme");
    expect(["light", "dark"]).toContain(second);
    expect(second).not.toBe(first);
    expect(store.get("theme")).toBe(second);
  });

  it("ne se positionne pas lui-même : aucune classe fixed, top-, right- ou z- (le parent s'en charge)", () => {
    stubStorage();
    render(<ThemeToggle />);
    const classes = screen.getByRole("button").className.split(/\s+/);
    const positioning = classes.filter((c) => /(^|:)(fixed|top-|right-|z-)/.test(c));
    expect(positioning).toEqual([]);
  });

  it("relit le choix mémorisé au montage", () => {
    stubStorage({ theme: "dark" });
    render(<ThemeToggle />);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(screen.getByRole("button")).toHaveAttribute("aria-label", "Passer en thème clair");
  });

  it("rend quand même en thème système si localStorage lève une exception", () => {
    const failing = new Proxy(
      {},
      {
        get() {
          throw new Error("SecurityError");
        },
      },
    );
    vi.stubGlobal("localStorage", failing);
    render(<ThemeToggle />);
    expect(screen.getByRole("button")).toBeInTheDocument();
    expect(document.documentElement.getAttribute("data-theme")).toBeNull();
    fireEvent.click(screen.getByRole("button"));
    expect(["light", "dark"]).toContain(document.documentElement.getAttribute("data-theme"));
  });
});

describe("Footer", () => {
  it("porte l'ancre contact, la mention des fiches et le lien du dépôt", () => {
    render(<Footer />);
    const footer = screen.getByRole("contentinfo");
    expect(footer).toHaveAttribute("id", "contact");
    expect(footer).toHaveTextContent("Site généré depuis mes fiches de preuve");
    const repo = screen.getByRole("link", { name: /cedricgicquiaud\.github\.io/ });
    expect(repo).toHaveAttribute("href", "https://github.com/cedricgicquiaud/cedricgicquiaud.github.io");
    expect(screen.getByRole("link", { name: "Mail" })).toHaveAttribute("href", `mailto:${site.email}`);
  });
});

describe("Métadonnées et anti-flash (app/layout.tsx)", () => {
  const layout = readFileSync(path.resolve(__dirname, "../../app/layout.tsx"), "utf8");

  it("prend title et description dans site.json (nom et titre)", () => {
    expect(layout).toMatch(/import site from "[./@]+\/content\/site\.json"/);
    expect(layout).toMatch(/title:\s*site\.name/);
    expect(layout).toMatch(/description:\s*site\.title/);
  });

  it("refuse une description vide", () => {
    expect(site.title.trim().length).toBeGreaterThan(0);
  });

  it("relit localStorage.theme dans un script inline avant peinture", () => {
    const head = layout.slice(layout.indexOf("<head>"), layout.indexOf("</head>"));
    expect(head).toContain("<script");
    expect(head).toContain("dangerouslySetInnerHTML");
    expect(head).toMatch(/localStorage\.getItem\(['"]theme['"]\)/);
    expect(head).toContain("data-theme");
    expect(head).toContain("try");
    expect(head).toContain("catch");
  });
});
