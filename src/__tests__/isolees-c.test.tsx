import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { About } from "../../components/about";
import { Experience } from "../../components/experience";
import { Fiche } from "../../components/fiche";
import { Footer } from "../../components/footer";
import { Nav } from "../../components/nav";
import { Projects } from "../../components/projects";
import { loadFiches } from "../../lib/fiches";

// site.json de test : mêmes champs que le vrai, ancres différentes. Le mock vaut pour
// tout le fichier ; le test de forme lit le vrai fichier via le système de fichiers.
vi.mock("../../content/site.json", () => ({
  default: {
    name: "Nom Test",
    title: "Titre test.",
    email: "test@example.com",
    links: { github: "https://github.com/x", linkedin: "https://www.linkedin.com/in/x/", repo: "https://github.com/x/y" },
    sections: { about: "x-about", experience: "x-exp", projects: "x-proj", contact: "x-contact" },
  },
}));

afterEach(cleanup);

const root = path.resolve(__dirname, "../..");
const read = (rel: string) => readFileSync(path.join(root, rel), "utf8");

describe("Ancres et ids de section depuis site.json (PFO-40)", () => {
  it("content/site.json expose un objet sections avec les quatre ancres", () => {
    const site = JSON.parse(read("content/site.json"));
    expect(site.sections).toEqual({
      about: "a-propos",
      experience: "experience",
      projects: "projets",
      contact: "contact",
    });
  });

  it("le menu et les sections suivent les ids de site.json (mock)", () => {
    render(<Nav />);
    const hrefs = Array.from(screen.getByRole("navigation").querySelectorAll("a")).map((a) => a.getAttribute("href"));
    expect(hrefs).toEqual(["/#x-about", "/#x-exp", "/#x-proj"]);
    cleanup();
    const { container } = render(
      <>
        <About />
        <Experience />
        <Projects fiches={[]} />
        <Footer />
        <Fiche fiche={loadFiches()[0]} />
      </>,
    );
    expect(Array.from(container.querySelectorAll("section[id]")).map((s) => s.id).slice(0, 3)).toEqual([
      "x-about",
      "x-exp",
      "x-proj",
    ]);
    expect(container.querySelector("footer")).toHaveAttribute("id", "x-contact");
    expect(screen.getByRole("link", { name: "← Projets" })).toHaveAttribute("href", "/#x-proj");
  });

  it("aucun littéral d'ancre dans components/ (hors import de site.json)", () => {
    const dir = path.join(root, "components");
    const files = readdirSync(dir).filter((n) => n.endsWith(".tsx"));
    const literal = /["'`](a-propos|experience|projets|contact)["'`]|#(a-propos|experience|projets|contact)\b/;
    const offenders: string[] = [];
    for (const name of files) {
      read(path.join("components", name))
        .split("\n")
        .forEach((line, i) => {
          if (line.includes("site.json")) return;
          if (literal.test(line)) offenders.push(`${name}:${i + 1}: ${line.trim()}`);
        });
    }
    expect(offenders).toEqual([]);
  });
});
