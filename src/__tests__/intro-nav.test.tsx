import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import site from "../../content/site.json";
import { Intro } from "../../components/intro";
import { Nav } from "../../components/nav";

afterEach(cleanup);

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
});
