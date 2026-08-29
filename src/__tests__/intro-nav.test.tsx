import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import site from "../../content/site.json";
import { Intro } from "../../components/intro";

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
});
