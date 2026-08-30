import { cleanup, render } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";
import { Spotlight } from "../../components/spotlight";

afterEach(cleanup);

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
