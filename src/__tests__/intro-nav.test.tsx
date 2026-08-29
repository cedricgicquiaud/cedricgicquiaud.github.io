import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import site from "../../content/site.json";
import { Intro } from "../../components/intro";

describe("Intro", () => {
  it("rend le nom et le titre de site.json", () => {
    render(<Intro />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(site.name);
    expect(screen.getByText(site.title)).toBeInTheDocument();
  });
});
