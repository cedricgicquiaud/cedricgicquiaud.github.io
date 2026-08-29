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

  const toggle = () => applyTheme((chosenTheme() ?? systemTheme()) === "dark" ? "light" : "dark");

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={theme === "dark"}
      className="fixed right-4 top-3 z-20 rounded-md border px-3 py-1 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      Thème
    </button>
  );
}
