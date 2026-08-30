import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import site from "../../content/site.json";
import { SocialIcons } from "../../components/social-icons";
import { Intro } from "../../components/intro";

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

describe("SocialIcons : ouverture des liens (PFO-34)", () => {
  it("ouvre GitHub et LinkedIn dans un nouvel onglet avec rel=noreferrer, mais pas le lien mailto", () => {
    render(<SocialIcons />);
    for (const name of ["GitHub", "LinkedIn"]) {
      const link = screen.getByRole("link", { name });
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noreferrer");
    }
    const mail = screen.getByRole("link", { name: "Mail" });
    expect(mail).not.toHaveAttribute("target");
    expect(mail).not.toHaveAttribute("rel");
  });
});

describe("SocialIcons : style et focus (PFO-34)", () => {
  it("aligne les logos en ligne, les atténue au repos, les accentue au survol et montre le focus clavier", () => {
    const { container } = render(<SocialIcons />);
    const list = container.querySelector("ul")!;
    expect(list.className.split(/\s+/)).toEqual(expect.arrayContaining(["flex", "items-center", "gap-5"]));
    for (const link of screen.getAllByRole("link")) {
      // inline-flex donne une boîte au lien (sinon 0×0 autour d'un SVG block) ; p-1 -m-1 = zone 32 px, rendu inchangé.
      expect(link.className.split(/\s+/)).toEqual(
        expect.arrayContaining([
          "inline-flex",
          "rounded-sm",
          "p-1",
          "-m-1",
          "text-muted-foreground",
          "hover:text-foreground",
          "focus-visible:outline-2",
          "focus-visible:outline-offset-2",
          "focus-visible:outline-ring",
        ]),
      );
    }
  });
});

describe("Intro : liens sociaux en logos (PFO-34)", () => {
  it("rend le bloc SocialIcons une seule fois, sans lien texte, dans le bas de colonne (bouton de thème déplacé dans le layout par PFO-49)", () => {
    const { container } = render(<Intro />);
    const section = container.querySelector("section#intro")!;
    const lists = section.querySelectorAll("ul.flex.items-center.gap-5");
    expect(lists).toHaveLength(1);
    const list = lists[0];
    expect(list.querySelectorAll("a svg[aria-hidden='true']")).toHaveLength(3);
    for (const name of ["GitHub", "LinkedIn", "Mail"]) {
      const link = screen.getByRole("link", { name });
      expect(list.contains(link)).toBe(true);
      expect(link.textContent?.trim()).toBe("");
    }
    // Un seul bloc pour les deux largeurs : aucun ancêtre masqué, placé dans le dernier enfant de la section.
    for (let el: Element | null = list; el && el !== section; el = el.parentElement) {
      expect(el.className.split(/\s+/)).not.toContain("hidden");
    }
    expect(section.lastElementChild!.contains(list)).toBe(true);
    expect(screen.queryByRole("button", { name: /thème/i, hidden: true })).toBeNull();
  });
});
