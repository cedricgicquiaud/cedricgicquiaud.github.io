"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

const haloStyle = {
  "--x": "50%",
  "--y": "50%",
  background: "radial-gradient(600px at var(--x) var(--y), var(--spotlight), transparent 80%)",
} as CSSProperties;

/** Vrai sur un appareil sans survol ou au pointeur grossier (tactile). */
function isTouchOnly(): boolean {
  if (typeof matchMedia === "undefined") return false;
  return matchMedia("(hover: none)").matches || matchMedia("(pointer: coarse)").matches;
}

export function Spotlight() {
  const [mounted, setMounted] = useState(false);
  const halo = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(!isTouchOnly());
  }, []);

  useEffect(() => {
    if (!mounted) return;
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

  return <div ref={halo} aria-hidden="true" className="pointer-events-none fixed inset-0 z-30" style={haloStyle} />;
}
