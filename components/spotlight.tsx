"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

const haloStyle = {
  "--x": "50%",
  "--y": "50%",
  background: "radial-gradient(600px at var(--x) var(--y), var(--spotlight), transparent 80%)",
} as CSSProperties;

function matches(query: string): boolean {
  return typeof matchMedia !== "undefined" && matchMedia(query).matches;
}

/** Vrai sur un appareil sans survol ou au pointeur grossier (tactile). */
function isTouchOnly(): boolean {
  return matches("(hover: none)") || matches("(pointer: coarse)");
}

function prefersReducedMotion(): boolean {
  return matches("(prefers-reduced-motion: reduce)");
}

export function Spotlight() {
  const [mounted, setMounted] = useState(false);
  const halo = useRef<HTMLDivElement>(null);

  // Rien côté serveur ni au tactile : le calque n'apparaît qu'après montage.
  useEffect(() => {
    setMounted(!isTouchOnly());
  }, []);

  useEffect(() => {
    if (!mounted || prefersReducedMotion()) return;
    // Écrit directement sur l'élément : aucun re-render React à chaque mouvement.
    const follow = (event: PointerEvent) => {
      const el = halo.current;
      if (!el || event.pointerType !== "mouse") return;
      el.style.setProperty("--x", `${event.clientX}px`);
      el.style.setProperty("--y", `${event.clientY}px`);
    };
    window.addEventListener("pointermove", follow);
    return () => window.removeEventListener("pointermove", follow);
  }, [mounted]);

  if (!mounted) return null;

  return <div ref={halo} aria-hidden="true" className="pointer-events-none fixed inset-0 z-30 transition-[background] duration-[80ms]" style={haloStyle} />;
}
