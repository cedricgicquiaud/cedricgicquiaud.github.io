import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Nav } from "../../components/nav";

// `usePathname` est un hook client de Next : hors navigateur Next, on le simule.
const pathname = vi.hoisted(() => ({ current: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => pathname.current }));

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
});
