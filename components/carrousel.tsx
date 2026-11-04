"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { Capture } from "../lib/fiches";

const BOUTON =
  "inline-flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-cyber hover:text-cyber focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-30";

/** Délai entre deux captures en défilement automatique (PFO-139). */
const DELAI = 5_000;

/**
 * Les captures d'une fiche, une à la fois (PFO-138). Toutes restent dans le HTML : sans JavaScript,
 * la piste défile au doigt ou à la molette (défilement accroché, natif). Flèches, points et clavier
 * font défiler la piste. Défilement automatique toutes les 5 s (PFO-139), avec un bouton pause ;
 * arrêté sous la souris ou le focus, et jamais si l'appareil demande moins d'animations.
 */
export function Carrousel({ captures }: { captures: Capture[] }) {
  const piste = useRef<HTMLUListElement>(null);
  const [courante, setCourante] = useState(0);
  const [enPause, setEnPause] = useState(false);
  const [survol, setSurvol] = useState(false);
  const [focus, setFocus] = useState(false);
  const plusieurs = captures.length > 1;

  // Position tenue à jour sans attendre le rendu : deux tours du minuteur rapprochés ne la perdent pas.
  const position = useRef(0);

  const aller = (i: number) => {
    const cible = Math.max(0, Math.min(captures.length - 1, i));
    position.current = cible;
    setCourante(cible);
    const el = piste.current;
    el?.scrollTo?.({ left: cible * el.clientWidth, behavior: "smooth" });
  };

  // La dernière version de « passer à la suivante » pour le minuteur, qui ne se recrée pas à chaque capture.
  const suivanteAuto = useRef<() => void>(() => {});
  useEffect(() => {
    suivanteAuto.current = () => aller(position.current + 1 < captures.length ? position.current + 1 : 0);
  });

  const actif = plusieurs && !enPause && !survol && !focus;
  useEffect(() => {
    if (!actif) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const minuteur = window.setInterval(() => suivanteAuto.current(), DELAI);
    return () => window.clearInterval(minuteur);
  }, [actif]);

  // Suit le doigt ou la molette : la capture courante est celle qui occupe la piste.
  const suivreDefilement = () => {
    const el = piste.current;
    if (el && el.clientWidth > 0) {
      position.current = Math.round(el.scrollLeft / el.clientWidth);
      setCourante(position.current);
    }
  };

  const clavier = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") aller(courante + 1);
    else if (e.key === "ArrowLeft") aller(courante - 1);
    else return;
    e.preventDefault();
  };

  return (
    <div
      role="region"
      aria-roledescription="carrousel"
      aria-label="Captures d'écran"
      tabIndex={plusieurs ? 0 : undefined}
      onKeyDown={plusieurs ? clavier : undefined}
      onMouseEnter={() => setSurvol(true)}
      onMouseLeave={() => setSurvol(false)}
      onFocus={() => setFocus(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocus(false);
      }}
      className="rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
    >
      <ul
        ref={piste}
        onScroll={plusieurs ? suivreDefilement : undefined}
        className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {captures.map(({ fichier, legende }, i) => (
          <li
            key={fichier}
            className="w-full shrink-0 snap-center"
            aria-roledescription="capture"
            aria-label={plusieurs ? `${i + 1} sur ${captures.length}` : undefined}
          >
            <figure>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={fichier}
                alt={legende}
                loading="lazy"
                className="mx-auto h-auto max-h-[70vh] w-auto max-w-full rounded-lg border border-border"
              />
              <figcaption className="mx-auto mt-3 max-w-3xl text-center text-sm text-muted-foreground">{legende}</figcaption>
            </figure>
          </li>
        ))}
      </ul>
      {plusieurs && (
        <div className="mt-4 flex items-center justify-center gap-4">
          <button type="button" aria-label="Capture précédente" disabled={courante === 0} onClick={() => aller(courante - 1)} className={BOUTON}>
            <span aria-hidden="true">←</span>
          </button>
          <ul className="flex flex-wrap items-center gap-2">
            {captures.map(({ fichier }, i) => (
              <li key={fichier}>
                <button
                  type="button"
                  aria-label={`Capture ${i + 1}`}
                  aria-current={i === courante ? "true" : undefined}
                  onClick={() => aller(i)}
                  className={`block size-2.5 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${i === courante ? "bg-cyber" : "bg-muted-foreground/40 hover:bg-muted-foreground"}`}
                />
              </li>
            ))}
          </ul>
          <p aria-live="polite" className="min-w-12 text-center text-sm tabular-nums text-muted-foreground">
            {`${courante + 1} / ${captures.length}`}
          </p>
          <button
            type="button"
            aria-label={enPause ? "Lire" : "Mettre en pause"}
            onClick={() => setEnPause(!enPause)}
            className={BOUTON}
          >
            <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
              {enPause ? <path d="M4 2.5v11l9.5-5.5z" /> : <path d="M3.5 2.5h3v11h-3zM9.5 2.5h3v11h-3z" />}
            </svg>
          </button>
          <button
            type="button"
            aria-label="Capture suivante"
            disabled={courante === captures.length - 1}
            onClick={() => aller(courante + 1)}
            className={BOUTON}
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>
      )}
    </div>
  );
}
