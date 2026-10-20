import site from "../content/site.json";

/**
 * Lien vers la page de réservation Google Agenda (PFO-119) : un simple lien, jamais le bouton
 * pop-up ni la page intégrée de Google, pour qu'aucun script Google ne se charge chez le visiteur.
 */
export function BookingLink({ className = "" }: { className?: string }) {
  return (
    <a
      href={site.links.rendezVous}
      target="_blank"
      rel="noopener noreferrer"
      className={[
        "inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-cyber hover:text-cyber focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Calendrier : tracé de lucide (licence ISC). */}
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
      Prendre rendez-vous
    </a>
  );
}
