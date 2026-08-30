import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import site from "../../content/site.json";
import { SocialIcons } from "../../components/social-icons";

afterEach(cleanup);

describe("SocialIcons (PFO-34)", () => {
  it("rend trois liens nommés GitHub, LinkedIn et Mail vers les cibles de site.json", () => {
    render(<SocialIcons />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(3);
    expect(screen.getByRole("link", { name: "GitHub" })).toHaveAttribute("href", site.links.github);
    expect(screen.getByRole("link", { name: "LinkedIn" })).toHaveAttribute("href", site.links.linkedin);
    expect(screen.getByRole("link", { name: "Mail" })).toHaveAttribute("href", `mailto:${site.email}`);
    for (const link of links) {
      expect(link).toHaveAttribute("aria-label", link.getAttribute("title"));
    }
  });
});

describe("SocialIcons : logos SVG (PFO-34)", () => {
  it("n'affiche aucun texte : chaque lien contient un seul SVG 24×24 monochrome, masqué des lecteurs d'écran", () => {
    render(<SocialIcons />);
    for (const link of screen.getAllByRole("link")) {
      expect(link.textContent?.trim()).toBe("");
      const svgs = link.querySelectorAll("svg");
      expect(svgs).toHaveLength(1);
      const svg = svgs[0];
      expect(svg).toHaveAttribute("aria-hidden", "true");
      expect(svg).toHaveAttribute("width", "24");
      expect(svg).toHaveAttribute("height", "24");
      expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
      expect(svg).toHaveAttribute("fill", "currentColor");
      expect(svg.querySelector("path")).toHaveAttribute("d");
    }
  });
});
