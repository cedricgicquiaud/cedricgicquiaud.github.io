import "@testing-library/jest-dom/vitest";
import { cleanup, render, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Experience } from "../../components/experience";

afterEach(cleanup);

describe("Experience — survol", () => {
  it("accentue l'expérience survolée et estompe les voisines sur grand écran seulement", () => {
    const { container } = render(<Experience />);
    const list = container.querySelector("ol") as HTMLElement;
    expect(list).toHaveClass("group/list");
    const articles = within(list).getAllByRole("article");
    expect(articles.length).toBeGreaterThan(0);
    for (const article of articles) {
      expect(article).toHaveClass("group/item", "rounded-lg", "transition-colors");
      expect(article).toHaveClass("hover:bg-accent/50", "hover:border-border", "border-transparent");
      expect(article).toHaveClass("lg:group-hover/list:opacity-50", "lg:hover:!opacity-100");
      const title = within(article).getByRole("heading", { level: 3 });
      expect(title).toHaveClass("group-hover/item:text-primary");
    }
  });
});

describe("Experience — focus clavier", () => {
  it("produit le même état au focus, sans estomper les voisines", () => {
    const { container } = render(<Experience />);
    const articles = within(container.querySelector("ol") as HTMLElement).getAllByRole("article");
    for (const article of articles) {
      expect(article).toHaveClass("focus-within:bg-accent/50", "focus-within:border-border");
      expect(article.className).not.toMatch(/focus-within[^ ]*opacity/);
      expect(within(article).getByRole("heading", { level: 3 })).toHaveClass("group-focus-within/item:text-primary");
    }
  });
});
