import site from "../content/site.json";
import { Nav } from "./nav";
import { Portrait } from "./portrait";
import { SocialIcons } from "./social-icons";
import { ThemeToggle } from "./theme-toggle";

// Titre court sous le nom (texte à confirmer : décision produit ouverte).
const SHORT_TITLE = "Développeur d'agents IA";

export function Intro() {
  return (
    <section id="intro" className="flex flex-1 flex-col justify-between gap-12">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{site.name}</h1>
        <div className="mt-6">
          <Portrait size="sm" />
        </div>
        <h2 className="mt-3 text-lg font-medium tracking-tight sm:text-xl">{SHORT_TITLE}</h2>
        <p className="mt-4 max-w-xs text-muted-foreground">{site.title}</p>
        <div className="mt-16 hidden lg:block">
          <Nav />
        </div>
      </div>
      {/* Bas de colonne : logos des réseaux (un seul bloc, visible à toutes les largeurs :
          sous la phrase en mobile, en bas de colonne en desktop) et bouton de thème
          (desktop ; en mobile, le layout affiche un bouton fixe). */}
      <div className="flex flex-wrap items-center gap-6">
        <SocialIcons />
        <div className="hidden lg:block">
          <ThemeToggle />
        </div>
      </div>
    </section>
  );
}
