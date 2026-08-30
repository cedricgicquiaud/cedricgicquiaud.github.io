"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const entries = [
  { label: "À propos", id: "a-propos" },
  { label: "Expérience", id: "experience" },
  { label: "Projets", id: "projets" },
];

// Bande centrale de la fenêtre prise en compte pour la section active.
const ACTIVE_BAND = "-40% 0px -55% 0px";

export function Nav() {
  const [active, setActive] = useState<string | null>(null);
  // Les sections n'existent que sur l'accueil : ailleurs, aucune entrée n'est active.
  // Sans routeur (rendu isolé), `usePathname` vaut null : on se comporte comme sur l'accueil.
  const pathname = usePathname();
  const onHome = !pathname || pathname === "/";

  useEffect(() => {
    if (!onHome || typeof IntersectionObserver === "undefined") return;
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
  }, [onHome]);

  // Le composant ne se positionne pas : son parent (l'intro) le place.
  return (
    <nav aria-label="Sections">
      <ul className="flex flex-col gap-4">
        {entries.map(({ label, id }) => (
          <li key={id}>
            <a
              href={`/#${id}`}
              className={
                "group flex items-center gap-4 py-1 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-[current]:text-foreground" +
                (active === id ? " active" : "")
              }
              aria-current={active === id ? "location" : undefined}
            >
              <span
                aria-hidden="true"
                className="h-px w-8 bg-muted-foreground transition-all group-hover:w-16 group-hover:bg-foreground group-aria-[current]:w-16 group-aria-[current]:bg-foreground"
              />
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
