"use client";

import { useEffect, useState, type CSSProperties } from "react";

const haloStyle = {
  "--x": "50%",
  "--y": "50%",
  background: "radial-gradient(600px at var(--x) var(--y), var(--spotlight), transparent 80%)",
} as CSSProperties;

export function Spotlight() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-30" style={haloStyle} />;
}
