/** Lien vers la démo en ligne, montré par une icône de site internet (PFO-77), comme GitHubLink pour le code. */
export function DemoLink({ href, className = "" }: { href: string; className?: string }) {
  return (
    <a
      href={href}
      aria-label="Démo"
      title="Démo en ligne"
      className={["inline-flex items-center text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground", className].filter(Boolean).join(" ")}
    >
      {/* Globe : tracé de lucide (licence ISC). */}
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
        <path d="M2 12h20" />
      </svg>
    </a>
  );
}
