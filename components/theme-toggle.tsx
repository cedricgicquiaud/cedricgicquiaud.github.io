"use client";

import { useEffect, useSyncExternalStore } from "react";

type Theme = "light" | "dark";

const ATTRIBUTE = "data-theme";
const STORAGE_KEY = "theme";

function asTheme(value: string | null): Theme | null {
  return value === "light" || value === "dark" ? value : null;
}

function systemTheme(): Theme {
  if (typeof matchMedia === "undefined") return "light";
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function chosenTheme(): Theme | null {
  return asTheme(document.documentElement.getAttribute(ATTRIBUTE));
}

function storedTheme(): Theme | null {
  try {
    return asTheme(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

const listeners = new Set<() => void>();

function setDomTheme(theme: Theme) {
  document.documentElement.setAttribute(ATTRIBUTE, theme);
  listeners.forEach((notify) => notify());
}

function applyTheme(theme: Theme) {
  setDomTheme(theme);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // stockage indisponible : le choix vaut pour la session seulement
  }
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, chosenTheme, () => null);

  useEffect(() => {
    const stored = storedTheme();
    if (stored) setDomTheme(stored);
  }, []);

  const isDark = (theme ?? systemTheme()) === "dark";
  const toggle = () => applyTheme(isDark ? "light" : "dark");

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Passer en thème clair" : "Passer en thème sombre"}
      className="inline-flex size-10 items-center justify-center rounded-md border bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

// Icônes monochromes (currentColor), décoratives : le libellé du bouton porte le sens.
const ICON = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

function MoonIcon() {
  return (
    <svg {...ICON} aria-hidden="true" data-icon="moon">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg {...ICON} aria-hidden="true" data-icon="sun">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}
