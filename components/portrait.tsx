import { existsSync } from "node:fs";
import path from "node:path";
import site from "../content/site.json";

const PHOTO = "/portrait.jpg";
const PLACEHOLDER = "/portrait-placeholder.svg";

/** Vrai dès que `public/portrait.jpg` est présent (évalué au build, export statique). */
export function hasPortraitPhoto(): boolean {
  return existsSync(path.join(process.cwd(), "public", PHOTO));
}

type Size = "sm" | "md";

const FRAME: Record<Size, string> = {
  // 128 px fixes : colonne gauche (intro), pour tenir dans 720 px de haut.
  sm: "w-32",
  md: "w-40 sm:w-48",
};

type Props = { photoExists?: boolean; size?: Size };

/** Cadre bi-ton seul : le parent le place (section, marges). */
function Frame({ photoExists, size }: Required<Props>) {
  return (
    <figure className="w-full">
      <div className={`${FRAME[size]} overflow-hidden rounded-lg bg-primary`}>
        <img
          src={photoExists ? PHOTO : PLACEHOLDER}
          alt={`Portrait de ${site.name}`}
          width={480}
          height={600}
          className="block h-auto w-full grayscale contrast-110 mix-blend-screen"
        />
      </div>
    </figure>
  );
}

export function Portrait({ photoExists = hasPortraitPhoto(), size = "md" }: Props) {
  if (size === "sm") return <Frame photoExists={photoExists} size={size} />;
  return (
    <section id="portrait" className="py-16">
      <Frame photoExists={photoExists} size={size} />
    </section>
  );
}
