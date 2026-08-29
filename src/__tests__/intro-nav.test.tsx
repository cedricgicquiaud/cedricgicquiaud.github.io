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

function stubViewport(width: number) {
  vi.stubGlobal("matchMedia", (query: string) => {
    const min = Number(/min-width:\s*(\d+)px/.exec(query)?.[1] ?? 0);
    return {
      matches: width >= min,
      media: query,
      addEventListener() {},
      removeEventListener() {},
    };
  });
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

  it("applique bg-grid et occupe la hauteur de l'écran, nom et titre en tête", () => {
    const { container } = render(<Intro />);
    const section = container.querySelector("section#intro");
    expect(section).toHaveClass("bg-grid", "min-h-screen");
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
  it("rend quatre liens vers À propos, Expérience, Projets et Contact", () => {
    render(<Nav />);
    const nav = screen.getByRole("navigation");
    const links = Array.from(nav.querySelectorAll("a")).map((a) => [a.textContent, a.getAttribute("href")]);
    expect(links).toEqual([
      ["À propos", "#a-propos"],
      ["Expérience", "#experience"],
      ["Projets", "#projets"],
      ["Contact", "#contact"],
    ]);
  });

  it("souligne la section visible (classe active) au fil du défilement", () => {
    const observer = stubIntersectionObserver();
    renderNavWithSections();
    const ids = observer.observed.map((el) => el.id);
    expect(ids).toEqual(["a-propos", "experience", "projets", "contact"]);

    const target = document.getElementById("experience")!;
    act(() => observer.callback!([{ target, isIntersecting: true }]));

    const active = screen.getByRole("link", { name: "Expérience" });
    expect(active).toHaveClass("active");
    expect(active).toHaveAttribute("aria-current", "location");
    expect(screen.getByRole("link", { name: "À propos" })).not.toHaveClass("active");
  });

  it("passe en haut et en pleine largeur à 375 px, reste fixe à gauche à 1280 px", () => {
    stubViewport(375);
    const narrow = render(<Nav />);
    const navNarrow = narrow.getByRole("navigation");
    expect(navNarrow).toHaveAttribute("data-layout", "top");
    expect(navNarrow).toHaveClass("w-full");
    const fixedClasses = navNarrow.className.split(/\s+/).filter((c) => /(^|:)fixed$/.test(c));
    expect(fixedClasses.every((c) => c.startsWith("lg:"))).toBe(true);
    cleanup();

    stubViewport(1280);
    const wide = render(<Nav />);
    expect(wide.getByRole("navigation")).toHaveAttribute("data-layout", "side");
    expect(wide.getByRole("navigation")).toHaveClass("lg:fixed", "lg:left-0");
  });

  it("laisse Tab parcourir les quatre liens puis le bouton de thème, focus visible", () => {
    const { container } = render(
      <>
        <Nav />
        <ThemeToggle />
      </>,
    );
    const focusable = Array.from(
      container.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"),
    ).filter((el) => el.tabIndex >= 0);
    expect(focusable.map((el) => el.tagName)).toEqual(["A", "A", "A", "A", "BUTTON"]);
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

  it("relit le choix mémorisé au montage", () => {
    stubStorage({ theme: "dark" });
    render(<ThemeToggle />);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
  });
});
