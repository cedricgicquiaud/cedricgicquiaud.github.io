import { cleanup, render } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { act, fireEvent } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Spotlight } from "../../components/spotlight";

afterEach(cleanup);

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
});

describe("halo souris (PFO-31) — suivi du pointeur", () => {
  it("un pointermove souris déplace le halo sur le pointeur", () => {
    const { container } = render(<Spotlight />);
    const halo = container.querySelector("div")!;
    movePointer("mouse", 120, 340);
    expect(halo.style.getPropertyValue("--x")).toBe("120px");
    expect(halo.style.getPropertyValue("--y")).toBe("340px");
  });
});
