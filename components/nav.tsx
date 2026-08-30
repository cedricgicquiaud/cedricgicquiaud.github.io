"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import site from "../content/site.json";

const entries = [
  { label: "À propos", id: site.sections.about },
  { label: "Expérience", id: site.sections.experience },
  { label: "Projets", id: site.sections.projects },
];

// Bande centrale de la fenêtre prise en compte pour la section active :
// de 40 % à 45 % de la hauteur (marges de l'observer : haut 40 %, bas 55 %).
const BAND_TOP_PERCENT = 40;
const BAND_BOTTOM_PERCENT = 45;
const BAND_TOP = BAND_TOP_PERCENT / 100;
const ACTIVE_BAND = `-${BAND_TOP_PERCENT}% 0px -${100 - BAND_BOTTOM_PERCENT}% 0px`;

// Au montage : la section qui contient le haut de la bande centrale ; à défaut,
// celle dont le haut en est le plus proche. L'observer prend ensuite le relais ;
// ce calcul unique rend le chargement déterministe.
function sectionAtBand(): string | null {
  const bandTop = window.innerHeight * BAND_TOP;
  let nearest: string | null = null;
  let nearestDistance = Infinity;
  for (const { id } of entries) {
    const el = document.getElementById(id);
    if (!el) continue;
    const { top, bottom } = el.getBoundingClientRect();
    if (top <= bandTop && bandTop < bottom) return id;
    const distance = Math.abs(top - bandTop);
    if (distance < nearestDistance) {
      nearest = id;
      nearestDistance = distance;
    }
  }
  return nearest;
}

export function Nav() {
  const [active, setActive] = useState<string | null>(null);
  // Les sections n'existent que sur l'accueil : ailleurs, aucune entrée n'est active.
  // Sans routeur (rendu isolé), `usePathname` vaut null : on se comporte comme sur l'accueil.
  const pathname = usePathname();
  const onHome = !pathname || pathname === "/";

  useEffect(() => {
    if (!onHome) return;
    // Mesure unique du DOM après montage (getBoundingClientRect) : un seul rendu
    // supplémentaire, voulu, pour que l'entrée active soit posée avant l'observer.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActive(sectionAtBand());
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
  }, [onHome]);

  // Le composant ne se positionne pas : son parent (l'intro) le place.
  return (
    <nav aria-label="Sections">
      <ul className="flex flex-col gap-4">
        {entries.map(({ label, id }) => (
          <li key={id}>
            <a
              href={`/#${id}`}
              className="group flex items-center gap-4 py-1 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-[current]:text-foreground"
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
