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
