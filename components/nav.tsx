"use client";

import { useEffect, useState } from "react";

const entries = [
  { label: "À propos", id: "a-propos" },
  { label: "Expérience", id: "experience" },
  { label: "Projets", id: "projets" },
  { label: "Contact", id: "contact" },
];

const SIDE_LAYOUT = "(min-width: 1024px)";
// Bande centrale de la fenêtre prise en compte pour la section active.
const ACTIVE_BAND = "-40% 0px -55% 0px";

type Layout = "top" | "side";

function currentLayout(): Layout {
  if (typeof matchMedia === "undefined") return "top";
  return matchMedia(SIDE_LAYOUT).matches ? "side" : "top";
}

export function Nav() {
  const [active, setActive] = useState<string | null>(null);
  const [layout, setLayout] = useState<Layout>("top");

  useEffect(() => {
    if (typeof matchMedia === "undefined") return;
    const query = matchMedia(SIDE_LAYOUT);
    const update = () => setLayout(currentLayout());
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    // Seules les sections du menu sont observées ; on ne compte que la bande
    // centrale de la fenêtre, et on retient la section visible la plus haute.
    const visible = new Map<string, number>();
    const observer = new IntersectionObserver(
      (observed) => {
        for (const entry of observed) {
          if (entry.isIntersecting) visible.set(entry.target.id, entry.boundingClientRect?.top ?? 0);
          else visible.delete(entry.target.id);
        }
        let best: string | null = null;
        let bestTop = Infinity;
        for (const [id, top] of visible) {
          if (top < bestTop) {
            best = id;
            bestTop = top;
          }
        }
        setActive(best);
      },
      { rootMargin: ACTIVE_BAND },
    );
    for (const { id } of entries) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="Sections"
      data-layout={layout}
      className="sticky top-0 z-10 w-full border-b bg-background/90 backdrop-blur lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:w-56 lg:border-b-0 lg:border-r"
    >
      <ul className="flex gap-1 overflow-x-auto py-3 pl-4 pr-24 lg:flex-col lg:gap-2 lg:px-6 lg:py-16">
        {entries.map(({ label, id }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              className={
                "inline-block rounded-md px-2 py-1 text-sm text-muted-foreground underline-offset-4 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-[current]:text-foreground aria-[current]:underline" +
                (active === id ? " active" : "")
              }
              aria-current={active === id ? "location" : undefined}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
