"use client";

import { useEffect, useState } from "react";

const entries = [
  { label: "À propos", id: "a-propos" },
  { label: "Expérience", id: "experience" },
  { label: "Projets", id: "projets" },
  { label: "Contact", id: "contact" },
];

export function Nav() {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver((observed) => {
      for (const entry of observed) {
        if (entry.isIntersecting) setActive(entry.target.id);
      }
    });
    for (const { id } of entries) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <nav aria-label="Sections">
      <ul>
        {entries.map(({ label, id }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              className={active === id ? "active" : undefined}
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
