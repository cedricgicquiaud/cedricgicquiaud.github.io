import site from "../content/site.json";
import { Nav } from "./nav";
import { ThemeToggle } from "./theme-toggle";

const links = [
  { label: "GitHub", href: site.links.github },
  { label: "LinkedIn", href: site.links.linkedin },
  { label: "Mail", href: `mailto:${site.email}` },
];

// Titre court sous le nom (texte à confirmer : décision produit ouverte).
const SHORT_TITLE = "Développeur d'agents IA";

export function Intro() {
  return (
    <section id="intro" className="bg-grid flex flex-1 flex-col justify-between gap-12">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{site.name}</h1>
        <h2 className="mt-3 text-lg font-medium tracking-tight sm:text-xl">{SHORT_TITLE}</h2>
        <p className="mt-4 max-w-xs text-muted-foreground">{site.title}</p>
        <div className="mt-16 hidden lg:block">
          <Nav />
        </div>
      </div>
      {/* Bas de colonne : liens sociaux (toujours visibles) et bouton de thème (desktop ;
          en mobile, le layout affiche un bouton fixe). */}
      <div className="flex flex-wrap items-center gap-6">
        <ul className="flex flex-wrap gap-6">
          {links.map(({ label, href }) => (
            <li key={label}>
              <a
                href={href}
                className="underline underline-offset-4 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
        <div className="hidden lg:block">
          <ThemeToggle />
        </div>
      </div>
    </section>
  );
}
