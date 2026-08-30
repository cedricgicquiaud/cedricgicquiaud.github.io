import { cleanup, render } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { act, fireEvent } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Spotlight } from "../../components/spotlight";

afterEach(cleanup);

/** jsdom n'implémente pas `matchMedia` : ne « matche » que les requêtes listées. */
function mockMatchMedia(matching: string[] = []) {
  vi.stubGlobal("matchMedia", (query: string) => ({ matches: matching.includes(query), media: query }));
}

beforeEach(() => mockMatchMedia());
afterEach(() => vi.unstubAllGlobals());

/** Déclenche un `pointermove` sur la fenêtre (jsdom ne fournit pas toujours `PointerEvent`). */
function movePointer(pointerType: "mouse" | "touch", clientX: number, clientY: number) {
  act(() => {
    fireEvent(window, Object.assign(new MouseEvent("pointermove", { clientX, clientY, bubbles: true }), { pointerType }));
  });
}

describe("halo souris (PFO-31) — rendu serveur", () => {
  it("ne rend rien côté serveur", () => {
    expect(renderToString(<Spotlight />)).toBe("");
  });
});

describe("halo souris (PFO-31) — monté dans le navigateur", () => {
  it("rend un calque décoratif qui ne capte aucun clic, avec le dégradé radial", () => {
    const { container } = render(<Spotlight />);
    const halo = container.querySelector("div");
    expect(halo, "aucun div rendu après montage").not.toBeNull();
    expect(halo!.className).toMatch(/\bpointer-events-none\b/);
    expect(halo!.getAttribute("aria-hidden")).toBe("true");
    expect(halo!.style.background).toContain("radial-gradient(600px at var(--x) var(--y), var(--spotlight), transparent 80%)");
  });

  it("glisse en douceur (80 ms) et reste sous le bouton de thème (z-50)", () => {
    const { container } = render(<Spotlight />);
    const halo = container.querySelector("div")!;
    expect(halo.className).toMatch(/\btransition-\[background\]\b/);
    expect(halo.className).toMatch(/\bduration-\[80ms\]\b/);
    const z = Number(halo.className.match(/\bz-(\d+)\b/)?.[1]);
    expect(z).toBeLessThan(50);
  });
});

describe("halo souris (PFO-31) — suivi du pointeur", () => {
  it("un pointermove souris déplace le halo sur le pointeur", () => {
    const { container } = render(<Spotlight />);
    const halo = container.querySelector("div")!;
    movePointer("mouse", 120, 340);
    expect(halo.style.getPropertyValue("--x")).toBe("120px");
    expect(halo.style.getPropertyValue("--y")).toBe("340px");
  });

  it("un pointermove tactile laisse le halo en place", () => {
    const { container } = render(<Spotlight />);
    const halo = container.querySelector("div")!;
    movePointer("touch", 120, 340);
    expect(halo.style.getPropertyValue("--x")).toBe("50%");
    expect(halo.style.getPropertyValue("--y")).toBe("50%");
  });
});

describe("halo souris (PFO-31) — tactile et mouvement réduit", () => {
  it("ne rend rien quand l'appareil n'a pas de survol (hover: none)", () => {
    mockMatchMedia(["(hover: none)"]);
    const { container } = render(<Spotlight />);
    expect(container.querySelector("div")).toBeNull();
  });

  it("ne rend rien quand le pointeur est grossier (pointer: coarse)", () => {
    mockMatchMedia(["(pointer: coarse)"]);
    const { container } = render(<Spotlight />);
    expect(container.querySelector("div")).toBeNull();
  });

  it("en mouvement réduit, rend le halo au centre et n'écoute pas le pointeur", () => {
    mockMatchMedia(["(prefers-reduced-motion: reduce)"]);
    const { container } = render(<Spotlight />);
    const halo = container.querySelector("div");
    expect(halo, "halo absent en mouvement réduit").not.toBeNull();
    movePointer("mouse", 120, 340);
    expect(halo!.style.getPropertyValue("--x")).toBe("50%");
    expect(halo!.style.getPropertyValue("--y")).toBe("50%");
  });
});
