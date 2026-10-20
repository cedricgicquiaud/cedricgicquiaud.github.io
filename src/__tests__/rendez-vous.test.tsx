import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import site from "../../content/site.json";
import { checkOutput } from "../../scripts/check-output.mjs";
import { Fiche } from "../../components/fiche";
import { Intro } from "../../components/intro";
import { loadFiche } from "../../lib/fiches";
import { buildLlms } from "../../lib/llms";
import { buildProofs } from "../../lib/proofs";

afterEach(cleanup);

// PFO-119 : un visiteur réserve un échange depuis le portfolio.

const RDV = "https://calendar.app.google/1ZRuL8acS477oJUq7";

/** Le lien ouvre la page de réservation Google dans un nouvel onglet, sans script Google. */
function attendLienRdv(link: HTMLElement) {
  expect(link).toHaveAttribute("href", RDV);
  expect(link).toHaveAttribute("target", "_blank");
  expect(link.getAttribute("rel")?.split(/\s+/)).toContain("noopener");
}

describe("site.json — le lien de réservation (PFO-119)", () => {
  it("définit le lien de la page de réservation à un seul endroit", () => {
    expect(site.links.rendezVous).toBe(RDV);
  });
});

describe("Intro — Prendre rendez-vous (PFO-119)", () => {
  it("affiche le lien sous la phrase d'accroche, visible à toutes les largeurs", () => {
    const { container } = render(<Intro />);
    const link = screen.getByRole("link", { name: "Prendre rendez-vous" });
    attendLienRdv(link);
    const section = container.querySelector("section#intro")!;
    for (let el: Element | null = link; el && el !== section; el = el.parentElement) {
      expect(el.className.split(/\s+/)).not.toContain("hidden");
    }
  });
});

describe("Fiche — Un projet similaire ? (PFO-119)", () => {
  it("termine chaque fiche par l'invitation et le lien de réservation", () => {
    const { container } = render(<Fiche fiche={loadFiche("slice")} />);
    const bloc = container.querySelector("aside#rendez-vous")!;
    expect(bloc).not.toBeNull();
    expect(bloc).toHaveTextContent("Un projet similaire ? Parlons-en.");
    attendLienRdv(within(bloc as HTMLElement).getByRole("link", { name: "Prendre rendez-vous" }));
    // Dernier élément de l'article : après la section Liens.
    expect(container.querySelector("article > div")!.lastElementChild).toBe(bloc);
  });
});

describe("check-output — domaine de réservation (PFO-119)", () => {
  const check = (html: string) => {
    const dir = mkdtempSync(path.join(tmpdir(), "check-rdv-"));
    try {
      writeFileSync(path.join(dir, "index.html"), html);
      return checkOutput(dir, []);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  };

  it("accepte le lien de la page de réservation", () => {
    expect(check(`<a href="${RDV}">Prendre rendez-vous</a>`)).toEqual([]);
  });

  it("refuse toujours le script du bouton Google Agenda", () => {
    const problems = check(`<script src="https://calendar.google.com/calendar/scheduling-button-script.js"></script>`);
    expect(problems[0]).toContain("domaine tiers « calendar.google.com »");
  });
});

describe("llms.txt et proofs.json — le lien de réservation (PFO-119)", () => {
  it("proofs.json donne le lien de réservation", () => {
    expect(buildProofs().rendezVous).toBe(RDV);
  });

  it("llms.txt a une section Contact avant Données, avec le lien de réservation", () => {
    const blocs = buildLlms().split("\n\n");
    const i = blocs.indexOf("## Contact");
    expect(i).toBeGreaterThan(0);
    expect(blocs.indexOf("## Données")).toBe(i + 2);
    expect(blocs[i + 1]).toContain(`[Prendre rendez-vous](${RDV})`);
  });
});
