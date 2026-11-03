"use client";

import { useEffect, useRef } from "react";

// Classes posées seulement quand la section dépasse l'écran (PFO-130, retour du 03/11).
const FIXE = ["lg:sticky", "lg:top-8", "lg:self-start"];

/**
 * Titre de section de la page projet. Il reste collé en haut de l'écran pendant le défilement
 * seulement si le contenu de sa section est plus haut que l'écran ; sinon il défile avec le texte.
 */
export function TitreSection({ titre, className }: { titre: string; className: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const h2 = ref.current;
    const contenu = h2?.nextElementSibling;
    if (!h2 || !contenu) return;
    // Classes posées directement sur l'élément : la mesure ne provoque pas de nouveau rendu.
    const mesurer = () => {
      const fixe = contenu.getBoundingClientRect().height > window.innerHeight;
      for (const c of FIXE) h2.classList.toggle(c, fixe);
    };
    mesurer();
    window.addEventListener("resize", mesurer);
    const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(mesurer);
    observer?.observe(contenu);
    return () => {
      window.removeEventListener("resize", mesurer);
      observer?.disconnect();
    };
  }, []);
  return (
    <h2 ref={ref} className={className}>
      {titre}
    </h2>
  );
}
