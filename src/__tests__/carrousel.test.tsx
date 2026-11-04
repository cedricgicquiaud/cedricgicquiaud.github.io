import "@testing-library/jest-dom/vitest";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Carrousel } from "../../components/carrousel";

// PFO-138 : les captures d'une fiche en grand, une à la fois (choix de Cédric du 04/11).
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const CAPTURES = [
  { fichier: "/projets/alpha/a.webp", legende: "Écran A" },
  { fichier: "/projets/alpha/b.webp", legende: "Écran B" },
  { fichier: "/projets/alpha/c.webp", legende: "Écran C" },
];

const region = () => screen.getByRole("region", { name: "Captures d'écran" });
const compteur = () => within(region()).getByText(/^\d+ \/ \d+$/);

describe("Carrousel de captures (PFO-138)", () => {
  it("garde toutes les captures dans le HTML, dans l'ordre, image puis légende exacte", () => {
    const { container } = render(<Carrousel captures={CAPTURES} />);
    const figures = Array.from(container.querySelectorAll("figure"));
    expect(figures).toHaveLength(3);
    for (const [i, figure] of figures.entries()) {
      expect(figure.querySelector("img")!.getAttribute("src")).toBe(CAPTURES[i].fichier);
      expect(figure.querySelector("img")!.getAttribute("alt")).toBe(CAPTURES[i].legende);
      expect(figure.querySelector("figcaption")!.textContent).toBe(CAPTURES[i].legende);
    }
  });

  it("s'annonce comme un carrousel et affiche « 1 / 3 », lu par un lecteur d'écran", () => {
    render(<Carrousel captures={CAPTURES} />);
    expect(region()).toHaveAttribute("aria-roledescription", "carrousel");
    expect(compteur()).toHaveTextContent("1 / 3");
    expect(compteur()).toHaveAttribute("aria-live", "polite");
  });

  it("la flèche suivante passe à la capture 2 ; la précédente est inactive sur la première, la suivante sur la dernière", () => {
    render(<Carrousel captures={CAPTURES} />);
    const precedente = screen.getByRole("button", { name: "Capture précédente" });
    const suivante = screen.getByRole("button", { name: "Capture suivante" });
    expect(precedente).toBeDisabled();
    fireEvent.click(suivante);
    expect(compteur()).toHaveTextContent("2 / 3");
    fireEvent.click(suivante);
    expect(compteur()).toHaveTextContent("3 / 3");
    expect(suivante).toBeDisabled();
    fireEvent.click(precedente);
    expect(compteur()).toHaveTextContent("2 / 3");
  });

  it("un point par capture ; cliquer le troisième affiche la capture 3 et le marque comme courant", () => {
    render(<Carrousel captures={CAPTURES} />);
    const points = within(region()).getAllByRole("button", { name: /^Capture \d$/ });
    expect(points).toHaveLength(3);
    expect(points[0]).toHaveAttribute("aria-current", "true");
    fireEvent.click(points[2]);
    expect(compteur()).toHaveTextContent("3 / 3");
    expect(points[2]).toHaveAttribute("aria-current", "true");
    expect(points[0]).not.toHaveAttribute("aria-current");
  });

  it("au clavier : flèche droite puis flèche gauche", () => {
    render(<Carrousel captures={CAPTURES} />);
    fireEvent.keyDown(region(), { key: "ArrowRight" });
    expect(compteur()).toHaveTextContent("2 / 3");
    fireEvent.keyDown(region(), { key: "ArrowLeft" });
    expect(compteur()).toHaveTextContent("1 / 3");
    fireEvent.keyDown(region(), { key: "ArrowLeft" });
    expect(compteur()).toHaveTextContent("1 / 3");
  });

  it("refus : pas de défilement automatique, la capture reste la même au bout de 30 s", () => {
    vi.useFakeTimers();
    render(<Carrousel captures={CAPTURES} />);
    act(() => {
      vi.advanceTimersByTime(30_000);
    });
    expect(compteur()).toHaveTextContent("1 / 3");
  });

  it("refus : une seule capture n'a ni flèches, ni points, ni compteur", () => {
    const { container } = render(<Carrousel captures={CAPTURES.slice(0, 1)} />);
    expect(container.querySelectorAll("figure")).toHaveLength(1);
    expect(container.querySelector("button")).toBeNull();
    expect(screen.queryByText(/^\d+ \/ \d+$/)).toBeNull();
  });

  it("le défilement reste dans le carrousel : la piste défile, pas la page", () => {
    const { container } = render(<Carrousel captures={CAPTURES} />);
    const piste = container.querySelector("figure")!.closest("ul")!;
    expect(piste).toHaveClass("overflow-x-auto", "snap-x", "snap-mandatory");
    for (const li of Array.from(piste.children)) expect(li).toHaveClass("w-full", "shrink-0", "snap-center");
  });
});
