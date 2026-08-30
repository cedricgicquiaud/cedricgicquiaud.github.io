import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Nav } from "../../components/nav";

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
